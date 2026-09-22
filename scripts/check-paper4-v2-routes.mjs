import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const staticOnly = process.argv.includes("--static-only");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = JSON.parse(await readFile(path.join(ROOT, "app", "data", "paper4-v2", "course-manifest.json"), "utf8"));
assert(manifest.lessons.length === 26 && new Set(manifest.lessons.map((lesson) => lesson.slug)).size === 26, "Route manifest must contain 26 unique slugs");

const productionFiles = [
  "app/paper-4/layout.tsx",
  "app/paper-4/page.tsx",
  "app/paper-4/lessons/[slug]/page.tsx",
  "app/components/paper4-learning/LessonLearningPage.tsx",
];
for (const filename of productionFiles) {
  const source = await readFile(path.join(ROOT, filename), "utf8");
  assert(!/stage8-runtime-registry|stage9-learning-pages/.test(source), `${filename} imports a superseded Stage 8/9 registry`);
}

if (staticOnly) {
  console.log(JSON.stringify({ status: "PASS", mode: "static-only", slugs: 26, locale_variants: 52, legacy_imports: 0 }, null, 2));
  process.exit(0);
}

const results = [];
for (const lesson of manifest.lessons) {
  for (const locale of ["vi", "en"]) {
    const url = `${baseUrl}/paper-4/lessons/${lesson.slug}?lang=${locale}`;
    const response = await fetch(url, { redirect: "manual" });
    const html = await response.text();
    const sectionCount = (html.match(/data-section-kind=/g) ?? []).length;
    const expectedTitle = lesson.title[locale].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert(response.status === 200, `${url} returned ${response.status}`);
    assert(sectionCount === 10, `${url} rendered ${sectionCount}/10 canonical sections`);
    assert(new RegExp(expectedTitle).test(html), `${url} is missing its localized Stage 3 title`);
    assert(html.includes("data-python-artifact-id="), `${url} is missing the full Python artifact`);
    assert(html.includes("data-section-kind=\"practice\"") && html.includes("data-section-kind=\"retrieval\""), `${url} is missing practice or retrieval`);
    assert(html.includes("data-section-kind=\"next-and-sources\""), `${url} is missing its source section`);
    results.push({ slug: lesson.slug, locale, status: response.status, sections: sectionCount });
  }
}

const invalidResponse = await fetch(`${baseUrl}/paper-4/lessons/__invalid-paper4-slug__?lang=vi`, { redirect: "manual" });
assert(invalidResponse.status === 404, `Invalid slug returned ${invalidResponse.status}, expected 404`);

console.log(JSON.stringify({
  status: "PASS",
  base_url: baseUrl,
  route_variants: results.length,
  passed: results.filter((result) => result.status === 200 && result.sections === 10).length,
  invalid_slug_status: invalidResponse.status,
  legacy_imports: 0,
}, null, 2));
