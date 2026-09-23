import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const stage9Dir = path.dirname(fileURLToPath(import.meta.url));
const computerRoot = path.resolve(stage9Dir, '../../../..');
const appRoot = path.join(computerRoot, 'A_Level_CS_page', 'algocore-fumadocs');
const relative = (file) => path.relative(computerRoot, file).replaceAll('\\', '/');
const sha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(target));
    else if (entry.isFile()) output.push(target);
  }
  return output;
}

const explicitFiles = [
  'README.md', 'package.json', 'package-lock.json', 'proxy.ts',
  'app/AppProviders.tsx', 'app/layout.tsx', 'app/globals.css',
  'app/data/stage9-learning-pages.json', 'app/data/stage9-source-authorities.ts',
  'scripts/build-stage9-lessons.mjs', 'scripts/verify-stage9-lessons.mjs',
  'scripts/verify-stage9-pedagogy.mjs'
].map((item) => path.join(appRoot, item));
const directoryFiles = (await Promise.all([
  walk(path.join(appRoot, 'app', 'paper-4')),
  walk(path.join(appRoot, 'app', 'components', 'paper4-learning')),
  walk(path.join(appRoot, 'app', 'components', 'paper4-visual')),
  walk(stage9Dir)
])).flat();
const exclusions = new Set([
  path.join(stage9Dir, 'RELEASE_MANIFEST.json'),
  path.join(stage9Dir, 'RELEASE_VERIFICATION.json')
]);
const files = [...new Set([...explicitFiles, ...directoryFiles])]
  .filter((file) => !exclusions.has(file))
  .sort((a, b) => relative(a).localeCompare(relative(b)));

const records = [];
for (const file of files) {
  const info = await stat(file);
  records.push({ path: relative(file), sha256: await sha256(file), bytes: info.size });
}
const registry = JSON.parse(await readFile(path.join(appRoot, 'app/data/stage9-learning-pages.json'), 'utf8'));
const inputLock = JSON.parse(await readFile(path.join(stage9Dir, 'S9_INPUT_LOCK.json'), 'utf8'));
const manifest = {
  schema_version: 's9-release-manifest-v1',
  release_id: 'paper4-2026-s9-v1',
  source_release_ids: ['paper4-2026-s6-v1', 'paper4-2026-s8-v1'],
  generated_at: new Date().toISOString(),
  counts: {
    packages: registry.counts.packages,
    lessons: registry.counts.lessons,
    patterns: registry.counts.patterns,
    blocks: registry.counts.blocks,
    scenarios: inputLock.counts.scenarios,
    unique_events: inputLock.counts.unique_events,
    locales: registry.counts.locales
  },
  input_lock_sha256: await sha256(path.join(stage9Dir, 'S9_INPUT_LOCK.json')),
  file_count: records.length,
  files: records
};
await writeFile(path.join(stage9Dir, 'RELEASE_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Stage 9 release manifest: ${manifest.file_count} files; ${manifest.counts.lessons} lessons; ${manifest.counts.blocks} blocks.`);
