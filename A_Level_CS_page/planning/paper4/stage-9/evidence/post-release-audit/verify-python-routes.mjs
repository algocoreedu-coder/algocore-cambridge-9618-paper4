import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..', '..', '..', '..', '..', 'algocore-fumadocs');
const registryPath = path.join(appRoot, 'app', 'data', 'stage9-learning-pages.json');
const registryRaw = await readFile(registryPath, 'utf8');
const registry = JSON.parse(registryRaw);
const routes = registry.lessons.flatMap((lesson) => ['vi', 'en'].map((locale) => ({ slug: lesson.slug, locale })));
const results = [];
for (let index = 0; index < routes.length; index += 4) {
  const batch = await Promise.all(routes.slice(index, index + 4).map(async ({ slug, locale }) => {
    const url = `http://127.0.0.1:3018/paper-4/lessons/${slug}?lang=${locale}`;
    const response = await fetch(url);
    const html = await response.text();
    const semantic = html.includes('<pre') && html.includes('<code class="language-python"');
    return { slug, locale, status: response.status, semantic_python: semantic };
  }));
  results.push(...batch);
}
const failures = results.filter((result) => result.status !== 200 || !result.semantic_python);
const report = {
  schema_version: 'paper4-live-python-route-verification-v1',
  generated_at: new Date().toISOString(),
  base_url: 'http://127.0.0.1:3018',
  registry_sha256: createHash('sha256').update(registryRaw).digest('hex'),
  routes_checked: results.length,
  semantic_python_pass: results.length - failures.length,
  failures,
  decision: failures.length === 0 ? 'PASS' : 'FAIL',
};
await writeFile(path.join(here, 'PYTHON_ROUTE_VERIFICATION.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Live semantic Python routes: ${report.semantic_python_pass}/${report.routes_checked} ${report.decision}`);
if (failures.length) process.exitCode = 1;
