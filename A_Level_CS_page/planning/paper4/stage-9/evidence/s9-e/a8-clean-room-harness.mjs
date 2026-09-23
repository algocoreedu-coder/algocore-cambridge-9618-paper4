import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const paper4Dir = path.resolve(here, "../../..");
const appDir = path.resolve(here, "../../../../../algocore-fumadocs");
const registryPath = path.join(appDir, "app/data/stage9-learning-pages.json");
const inputLockPath = path.resolve(here, "../../S9_INPUT_LOCK.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const inputLock = JSON.parse(readFileSync(inputLockPath, "utf8"));

const canonicalKinds = [
  "recognition",
  "exam-cues",
  "knowledge",
  "method",
  "worked-example",
  "action-view",
  "marking-pitfalls",
  "practice",
  "retrieval",
  "next-and-sources",
];

const sha256 = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");
const inputHashes = inputLock.inputs.map((item) => {
  const resolved = path.join(paper4Dir, item.path);
  return {
    path: item.path,
    expected: item.sha256,
    actual: sha256(resolved),
    matches: sha256(resolved) === item.sha256,
  };
});

const packageIds = new Set(registry.packages.map((item) => item.packageId));
const lessonIds = new Set(registry.lessons.map((item) => item.lessonId));
const slugs = new Set(registry.lessons.map((item) => item.slug));
const patternIds = new Set(registry.lessons.flatMap((item) => item.patternIds));
const blockCount = registry.lessons.reduce((count, lesson) => count + lesson.blocks.length, 0);
const canonicalFailures = registry.lessons
  .filter((lesson) => JSON.stringify(lesson.blocks.map((block) => block.kind)) !== JSON.stringify(canonicalKinds))
  .map((lesson) => lesson.slug);

const allRefs = registry.lessons.flatMap((lesson) => lesson.blocks.flatMap((block) => block.sourceRefs ?? []));
const uniqueRefs = [...new Map(allRefs.map((ref) => [JSON.stringify(ref), ref])).values()];
const locatorChecks = uniqueRefs.map((ref) => {
  const locator = ref.locator ?? "";
  const isExternal = /^https?:\/\//i.test(locator);
  if (isExternal) {
    return {
      sourceId: ref.sourceId,
      locator,
      accessMode: ref.accessMode,
      resolved: ref.accessMode === "verified-external" && /^https:\/\//i.test(locator),
    };
  }
  const localPath = path.resolve(paper4Dir, locator.split("#")[0]);
  return { sourceId: ref.sourceId, locator, accessMode: ref.accessMode, resolved: existsSync(localPath) };
});

const baseUrl = "http://127.0.0.1:3018";
const routeUrls = registry.lessons.flatMap((lesson) => [
  `${baseUrl}/paper-4/lessons/${lesson.slug}?lang=vi`,
  `${baseUrl}/paper-4/lessons/${lesson.slug}?lang=en`,
]);
const routeResults = await Promise.all(routeUrls.map(async (url) => {
  const response = await fetch(url);
  const html = await response.text();
  const hrefs = [...html.matchAll(/href=(?:"([^"]*)"|'([^']*)')/g)].map((match) => match[1] ?? match[2] ?? "");
  const localHrefLeaks = hrefs.filter((href) =>
    /^file:/i.test(href)
    || /^[A-Za-z]:[\\/]/.test(href)
    || href.includes("planning/paper4")
    || href.includes("stage-9/evidence"));
  return { url, status: response.status, localHrefLeaks };
}));
const invalidResponse = await fetch(`${baseUrl}/paper-4/lessons/__a8-invalid-stage9-slug__?lang=vi`);

const report = {
  schema_version: "s9-e-a8-harness-v1",
  generated_at: new Date().toISOString(),
  registry_sha256: sha256(registryPath),
  exact_set: {
    packages: packageIds.size,
    lessons: lessonIds.size,
    slugs: slugs.size,
    patterns: patternIds.size,
    blocks: blockCount,
    canonical_failures: canonicalFailures,
  },
  source_resolution: {
    references: allRefs.length,
    unique_references: uniqueRefs.length,
    resolved: locatorChecks.filter((item) => item.resolved).length,
    unresolved: locatorChecks.filter((item) => !item.resolved),
  },
  routes: {
    checked: routeResults.length,
    status_200: routeResults.filter((item) => item.status === 200).length,
    failures: routeResults.filter((item) => item.status !== 200),
    local_href_leaks: routeResults.flatMap((item) => item.localHrefLeaks.map((href) => ({ url: item.url, href }))),
    invalid_slug_status: invalidResponse.status,
  },
  input_lock: {
    checked: inputHashes.length,
    unchanged: inputHashes.filter((item) => item.matches).length,
    mismatches: inputHashes.filter((item) => !item.matches),
  },
};

const pass = report.exact_set.packages === 13
  && report.exact_set.lessons === 26
  && report.exact_set.slugs === 26
  && report.exact_set.patterns === 58
  && report.exact_set.blocks === 260
  && report.exact_set.canonical_failures.length === 0
  && report.source_resolution.unresolved.length === 0
  && report.routes.status_200 === 52
  && report.routes.failures.length === 0
  && report.routes.local_href_leaks.length === 0
  && report.routes.invalid_slug_status === 404
  && report.input_lock.unchanged === report.input_lock.checked;

report.decision = pass ? "PASS" : "FAIL";
console.log(JSON.stringify(report, null, 2));
process.exit(pass ? 0 : 1);
