import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const readText = (path) => readFileSync(resolve(root, path), "utf8");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const manifest = readJson("app/data/paper4-v2/course-manifest.json");
const release = readJson("content/paper4/release/lesson-release-decisions.json");
const bridge = readJson("content/paper4/teacher/assessment-resolution-bridge.json");
const requirements = readJson("../planning/paper4/stage-3/evidence/A1_OBJECTIVE_ASSESSMENT_REQUIREMENTS.json").requirements;
const homepage = readText("app/paper-4/page.tsx");
const lessonPage = readText("app/components/paper4-learning/LessonLearningPage.tsx");

function resolvePath(source, path) {
  const segments = path.replaceAll("]", "").split(/[.[]/).filter(Boolean);
  return segments.reduce((value, segment) => value?.[/^\d+$/.test(segment) ? Number(segment) : segment], source);
}

assert(release.readiness_contract?.schema_version === "paper4-readiness-contract-v1", "Missing readiness contract v1.");
assert(release.readiness_contract?.paper_ready === false, "paper_ready must remain false during E0–E5 remediation.");
assert(release.readiness_contract?.paper_state !== "PAPER_READY", "paper_state cannot advertise PAPER_READY.");
assert(release.lessons?.length === 26, `Expected 26 readiness records; found ${release.lessons?.length ?? 0}.`);
assert(new Set(release.lessons?.map((lesson) => lesson.slug)).size === 26, "Readiness records contain duplicate slugs.");
assert(release.lessons?.every((lesson) => typeof lesson.topic_ready === "boolean" && lesson.topic_state), "Every lesson needs topic_ready and topic_state.");
assert(!homepage.includes('slug === "binary-search"'), "Homepage still hard-codes Binary Search readiness.");
assert(homepage.includes("getPaper4LessonReadiness") && homepage.includes("paper4Readiness"), "Homepage does not derive readiness from the canonical registry module.");
assert(lessonPage.includes("getPaper4LessonReadiness"), "Lesson header does not derive readiness from the canonical registry module.");

const canonicalRecords = bridge.canonical_assessment_records ?? [];
assert(canonicalRecords.length === 79, `Expected 79 canonical bridge records; found ${canonicalRecords.length}.`);
assert(new Set(canonicalRecords.map((record) => record.assessment_item_id)).size === 79, "Canonical bridge has duplicate assessment IDs.");

const projectionCache = new Map();
const projectionFor = (slug) => {
  if (!projectionCache.has(slug)) projectionCache.set(slug, readJson(`app/data/paper4-v2/learner-projections/${slug}.json`));
  return projectionCache.get(slug);
};
for (const record of canonicalRecords) {
  assert(manifest.lessons.some((lesson) => lesson.slug === record.lesson_slug), `${record.assessment_item_id}: unknown lesson slug.`);
  assert(record.route === `/paper-4/lessons/${record.lesson_slug}`, `${record.assessment_item_id}: route drift.`);
  assert(Boolean(resolvePath(projectionFor(record.lesson_slug), record.visible_task_path)), `${record.assessment_item_id}: visible task path is stale.`);
}

const supplementalRecords = bridge.supplemental_requirement_records ?? [];
for (const record of supplementalRecords) {
  const task = resolvePath(projectionFor(record.lesson_slug), record.visible_task_path);
  assert(Boolean(task), `${record.requirement_id}: supplemental path is stale.`);
  assert(task?.assessment_requirement_ids?.includes(record.requirement_id), `${record.requirement_id}: requirement ID is not embedded in the visible task.`);
  assert(record.task_metadata_state === "EMBEDDED", `${record.requirement_id}: bridge metadata state is not EMBEDDED.`);
}

const expectedRequirementIds = new Set(requirements.map((requirement) => requirement.requirement_id));
const resolvedRequirementIds = new Set([
  ...canonicalRecords.flatMap((record) => record.requirement_ids),
  ...supplementalRecords.map((record) => record.requirement_id),
]);
assert(expectedRequirementIds.size === 107, `Expected 107 requirements; found ${expectedRequirementIds.size}.`);
assert([...expectedRequirementIds].every((id) => resolvedRequirementIds.has(id)), "At least one assessment requirement has no stable visible-task resolution.");
assert([...resolvedRequirementIds].every((id) => expectedRequirementIds.has(id)), "Bridge contains an unknown assessment requirement.");
assert(bridge.counts?.pending_embedded_metadata === 0, `Expected zero pending embedded requirement IDs; found ${bridge.counts?.pending_embedded_metadata}.`);

// Negative contract test: a stale path must fail resolution.
assert(resolvePath(projectionFor(manifest.lessons[0].slug), "stages.practise.items[999]") === undefined, "Negative stale-path check did not fail closed.");

if (failures.length) {
  console.error("Paper 4 E0 release/readiness/assessment contract: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Paper 4 E0 release/readiness/assessment contract: PASS");
console.log(JSON.stringify({
  lessons: release.lessons.length,
  topicReady: release.lessons.filter((lesson) => lesson.topic_ready).length,
  paperReady: release.readiness_contract.paper_ready,
  canonicalAssessmentsResolved: canonicalRecords.length,
  requirementsResolved: resolvedRequirementIds.size,
  stalePaths: 0,
  pendingEmbeddedMetadata: bridge.counts.pending_embedded_metadata,
}, null, 2));
