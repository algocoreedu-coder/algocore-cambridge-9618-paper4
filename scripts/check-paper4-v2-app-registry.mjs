import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPaper4V2Outputs } from "./build-paper4-v2-app-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STAGE3_EDITORIAL_PATH = path.resolve(ROOT, "..", "planning", "paper4", "stage-3", "LESSON_PACKAGES.json");
const EXPECTED_GAP_LESSONS = new Set(["dictionary", "exceptions", "graphs", "performance", "random-files", "testing"]);
const EXPECTED_SECTION_IDS = [
  "paper4.section.recognition",
  "paper4.section.exam-cues",
  "paper4.section.knowledge",
  "paper4.section.method",
  "paper4.section.worked-example",
  "paper4.section.action-view",
  "paper4.section.marking-pitfalls",
  "paper4.section.practice",
  "paper4.section.retrieval",
  "paper4.section.next-and-sources",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function walkStrings(value, visitor, pointer = "$") {
  if (typeof value === "string") visitor(value, pointer);
  else if (Array.isArray(value)) value.forEach((item, index) => walkStrings(item, visitor, `${pointer}[${index}]`));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => walkStrings(item, visitor, `${pointer}.${key}`));
}

function checkPublicSafety(value, filename) {
  walkStrings(value, (text, pointer) => {
    assert(!/[A-Za-z]:[\\/]/.test(text), `${filename}${pointer} exposes a drive path`);
    assert(!/file:\/\//i.test(text), `${filename}${pointer} exposes a file URL`);
    assert(!/(^|[\\/])(content|planning|scripts|evidence|app)[\\/]/i.test(text), `${filename}${pointer} exposes a repository path`);
    assert(!/stage8-runtime-registry|stage9-learning-pages/i.test(text), `${filename}${pointer} references a superseded registry`);
  });
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

const { outputs: expectedOutputs, stats } = await createPaper4V2Outputs();
const mismatches = [];
for (const [relativePath, expectedContents] of expectedOutputs) {
  let actualContents;
  try {
    actualContents = await readFile(path.join(ROOT, relativePath), "utf8");
  } catch {
    mismatches.push(`${relativePath}: missing`);
    continue;
  }
  if (actualContents !== expectedContents) mismatches.push(`${relativePath}: not byte-identical to deterministic compiler output`);
}
assert(mismatches.length === 0, mismatches.join("\n"));

const expectedLessonFiles = [...expectedOutputs.keys()].filter((filename) => filename.startsWith("app/data/paper4-v2/lessons/")).map((filename) => path.basename(filename)).sort();
const expectedTraceFiles = [...expectedOutputs.keys()].filter((filename) => filename.startsWith("public/paper4-v2/traces/")).map((filename) => path.basename(filename)).sort();
const actualLessonFiles = (await readdir(path.join(ROOT, "app", "data", "paper4-v2", "lessons"))).filter((filename) => filename.endsWith(".json")).sort();
const actualTraceFiles = (await readdir(path.join(ROOT, "public", "paper4-v2", "traces"))).filter((filename) => filename.endsWith(".json")).sort();
assert(JSON.stringify(actualLessonFiles) === JSON.stringify(expectedLessonFiles), "Lesson output exact set mismatch");
assert(JSON.stringify(actualTraceFiles) === JSON.stringify(expectedTraceFiles), "Trace output exact set mismatch");

const manifest = await readJson("app/data/paper4-v2/course-manifest.json");
const stage3Editorial = JSON.parse(await readFile(STAGE3_EDITORIAL_PATH, "utf8"));
const stage3LessonById = new Map(stage3Editorial.lessons.map((lesson) => [lesson.lesson_id, lesson]));
const stage3PackageById = new Map(stage3Editorial.packages.map((item) => [item.package_id, item]));
assert(manifest.schema_version === "paper4-v2-course-manifest-v1", "Manifest schema mismatch");
assert(manifest.canonical_registry_sha256 === "e9fe687c79e23d3a6d0ec844c5e8ca83fca473fbc800623836be61b5a439f827", "Canonical registry aggregate authority mismatch");
assert(manifest.editorial_registry.sha256 === "01710c1a99028228bf5472ddf9457a4ac9c5df64ebd576785139d23d6fca0ad2", "Stage 3 editorial hash mismatch");
assert(JSON.stringify(manifest.editorial_registry.course_title) === JSON.stringify(stage3Editorial.titles), "Course title does not match Stage 3" );
assert(manifest.counts.packages === 13, "Expected 13 packages");
assert(manifest.counts.lessons === 26, "Expected 26 lessons");
assert(manifest.counts.patterns === 58, "Expected 58 patterns");
assert(manifest.counts.sections_per_lesson === 10, "Expected ten sections per lesson");
assert(manifest.counts.knowledge_units === 108, "Expected 108 KnowledgeUnits");
assert(manifest.counts.python_artifacts === 26, "Expected 26 PythonArtifacts");
assert(manifest.counts.visual_scenario_traces === 174, "Expected 174 VisualScenarioTraces");
assert(manifest.counts.visual_event_bindings === 589, "Expected 589 VisualEventBindings");
assert(manifest.counts.marking_chains === 58, "Expected 58 MarkingChains");
assert(manifest.counts.assessment_items === 78, "Expected 78 AssessmentItems");
assert(manifest.counts.lesson_release_records === 26, "Expected 26 LessonReleaseRecords");
assert(JSON.stringify(manifest.canonical_sections.map((section) => section.section_id)) === JSON.stringify(EXPECTED_SECTION_IDS), "Canonical section order mismatch");
for (const forbiddenKey of ["theory", "python", "tests", "marking", "events", "scenarios"]) {
  assert(!(forbiddenKey in manifest), `Manifest must not include ${forbiddenKey} payload`);
}
checkPublicSafety(manifest, "course-manifest.json");
for (const item of manifest.packages) {
  const stage3Package = stage3PackageById.get(item.package_id);
  assert(stage3Package, `${item.package_id}: absent from Stage 3`);
  assert(JSON.stringify(item.title) === JSON.stringify(stage3Package.titles), `${item.package_id}: title does not match Stage 3`);
}

const lessonIds = new Set();
const lessonSlugs = new Set();
const artifactIds = new Set();
const codeLinesByArtifact = new Map();
const gapLessons = new Set();
for (const lessonMeta of manifest.lessons) {
  const lesson = await readJson(`app/data/paper4-v2/lessons/${lessonMeta.slug}.json`);
  assert(lesson.schema_version === "paper4-v2-lesson-dto-v1", `${lessonMeta.slug}: schema mismatch`);
  assert(lesson.identity.lesson_id === lessonMeta.lesson_id, `${lessonMeta.slug}: lesson identity mismatch`);
  const stage3Lesson = stage3LessonById.get(lesson.identity.lesson_id);
  assert(stage3Lesson, `${lessonMeta.slug}: absent from Stage 3`);
  assert(JSON.stringify(lesson.identity.title) === JSON.stringify(stage3Lesson.titles), `${lessonMeta.slug}: DTO title does not match Stage 3`);
  assert(JSON.stringify(lessonMeta.title) === JSON.stringify(stage3Lesson.titles), `${lessonMeta.slug}: manifest title does not match Stage 3`);
  assert(!lessonIds.has(lesson.identity.lesson_id), `${lessonMeta.slug}: duplicate lesson ID`);
  assert(!lessonSlugs.has(lesson.identity.slug), `${lessonMeta.slug}: duplicate slug`);
  lessonIds.add(lesson.identity.lesson_id);
  lessonSlugs.add(lesson.identity.slug);
  assert(lesson.sections.length === 10, `${lessonMeta.slug}: expected ten sections`);
  assert(JSON.stringify(lesson.sections.map((section) => section.section_id)) === JSON.stringify(EXPECTED_SECTION_IDS), `${lessonMeta.slug}: section exact set/order mismatch`);
  assert(lesson.theory.knowledge_units.length > 0, `${lessonMeta.slug}: missing theory`);
  assert(lesson.python.lines.length > 0, `${lessonMeta.slug}: missing full Python lines`);
  assert(!artifactIds.has(lesson.python.python_artifact_id), `${lessonMeta.slug}: duplicate PythonArtifact`);
  artifactIds.add(lesson.python.python_artifact_id);
  const source = lesson.python.lines.map((line) => line.text).join("\n");
  assert(sha256(source) === lesson.python.code_sha256, `${lessonMeta.slug}: full source hash mismatch`);
  const lineIds = new Set(lesson.python.lines.map((line) => line.line_id));
  assert(lineIds.size === lesson.python.lines.length, `${lessonMeta.slug}: duplicate stable line IDs`);
  codeLinesByArtifact.set(lesson.python.python_artifact_id, lineIds);
  assert(lesson.python.execution.syntax_status === "PASS", `${lessonMeta.slug}: syntax is not PASS`);
  assert(lesson.python.execution.execution_status === "PASS", `${lessonMeta.slug}: execution is not PASS`);
  assert(lesson.tests.fixtures.length === 3, `${lessonMeta.slug}: expected three fixtures`);
  assert(new Set(lesson.tests.fixtures.map((fixture) => fixture.case_kind)).size === 3, `${lessonMeta.slug}: fixture case coverage mismatch`);
  assert(lesson.tests.expected_outputs.length === 3, `${lessonMeta.slug}: expected three outputs`);
  assert(lesson.practice.items.length === 3, `${lessonMeta.slug}: expected three practice levels`);
  assert(lesson.retrieval.items.length === lesson.theory.knowledge_units.length, `${lessonMeta.slug}: retrieval/theory mismatch`);
  assert(Array.isArray(lesson.sources) && lesson.sources.length > 0, `${lessonMeta.slug}: missing source citations`);
  assert(Array.isArray(lesson.errors.misconceptions), `${lessonMeta.slug}: missing error prevention content`);

  const associationOnly = lesson.authority.association_scope === "AlgoCore_representational_workflow_only";
  if (associationOnly) {
    gapLessons.add(lesson.identity.slug);
    assert(lesson.authority.official_pattern_ids.length === 0, `${lessonMeta.slug}: gap lesson received official ownership`);
    assert(lesson.authority.cambridge_marking_chain_ids.length === 0, `${lessonMeta.slug}: gap lesson received Cambridge marking`);
    assert(lesson.marking.chains.length === 0, `${lessonMeta.slug}: gap lesson contains marking chain`);
    assert(lesson.visual.approved_static_or_representational_support.length > 0, `${lessonMeta.slug}: gap lesson has no approved support`);
    for (const item of lesson.practice.items) {
      assert(item.self_rubric.authority === "AlgoCore_authored_rubric", `${lessonMeta.slug}: practice authority leak`);
      assert(item.self_rubric.official_marks === null, `${lessonMeta.slug}: practice official marks leak`);
      assert(item.self_rubric.pattern_authority === "AlgoCore_representational_workflow_only", `${lessonMeta.slug}: pattern authority leak`);
    }
  } else {
    assert(lesson.authority.official_pattern_ids.length > 0, `${lessonMeta.slug}: official owner has no patterns`);
    assert(lesson.marking.chains.length === lesson.authority.official_pattern_ids.length, `${lessonMeta.slug}: marking/owned pattern mismatch`);
  }
  checkPublicSafety(lesson, `${lessonMeta.slug}.json`);
}
assert(lessonIds.size === 26 && lessonSlugs.size === 26 && artifactIds.size === 26, "Lesson/Python exact set mismatch");
assert(JSON.stringify([...gapLessons].sort()) === JSON.stringify([...EXPECTED_GAP_LESSONS].sort()), "Association-only lesson exact set mismatch");

let scenarioCount = 0;
let eventCount = 0;
const patternIds = new Set();
const traceIds = new Set();
const eventIds = new Set();
for (const patternMeta of manifest.patterns) {
  assert(!patternIds.has(patternMeta.pattern_id), `Duplicate pattern ${patternMeta.pattern_id}`);
  patternIds.add(patternMeta.pattern_id);
  const relativePath = patternMeta.trace_url.replace(/^\//, "public/");
  const chunk = await readJson(relativePath);
  assert(chunk.pattern_id === patternMeta.pattern_id, `${patternMeta.pattern_id}: chunk identity mismatch`);
  assert(chunk.scenarios.length === 3, `${patternMeta.pattern_id}: expected three scenarios`);
  assert(new Set(chunk.scenarios.map((scenario) => scenario.case_kind)).size === 3, `${patternMeta.pattern_id}: scenario case coverage mismatch`);
  const chunkEvents = new Map(chunk.events.map((event) => [event.event_id, event]));
  assert(chunkEvents.size === chunk.events.length, `${patternMeta.pattern_id}: duplicate chunk event`);
  const validLineIds = codeLinesByArtifact.get(chunk.owner.python_artifact_id);
  assert(validLineIds, `${patternMeta.pattern_id}: owner PythonArtifact is unavailable`);
  for (const scenario of chunk.scenarios) {
    assert(!traceIds.has(scenario.trace_id), `${patternMeta.pattern_id}: duplicate trace ${scenario.trace_id}`);
    traceIds.add(scenario.trace_id);
    assert(scenario.python_artifact_id === chunk.owner.python_artifact_id, `${patternMeta.pattern_id}: scenario artifact mismatch`);
    let previousSequence = -1;
    for (const eventId of scenario.event_ids) {
      const event = chunkEvents.get(eventId);
      assert(event, `${scenario.trace_id}: unresolved event ${eventId}`);
      assert(event.trace_id === scenario.trace_id, `${eventId}: trace mismatch`);
      assert(event.sequence > previousSequence, `${eventId}: sequence is not increasing`);
      previousSequence = event.sequence;
      assert(!eventIds.has(eventId), `${eventId}: event reused across scenarios`);
      eventIds.add(eventId);
      for (const lineId of event.active_line_ids) assert(validLineIds.has(lineId), `${eventId}: unresolved active line ${lineId}`);
      assert(event.accessibility?.accessible_label?.vi && event.accessibility?.accessible_label?.en, `${eventId}: missing bilingual accessible label`);
      assert(event.accessibility?.live_status?.message?.vi && event.accessibility?.live_status?.message?.en, `${eventId}: missing bilingual live status`);
    }
  }
  assert(chunk.events.length === chunk.scenarios.reduce((sum, scenario) => sum + scenario.event_ids.length, 0), `${patternMeta.pattern_id}: orphan event in chunk`);
  assert(patternMeta.scenario_count === chunk.scenarios.length && patternMeta.event_count === chunk.events.length, `${patternMeta.pattern_id}: manifest count mismatch`);
  scenarioCount += chunk.scenarios.length;
  eventCount += chunk.events.length;
  checkPublicSafety(chunk, path.basename(relativePath));
}
assert(patternIds.size === 58, "Pattern exact set mismatch");
assert(scenarioCount === 174 && traceIds.size === 174, "Scenario exact set mismatch");
assert(eventCount === 589 && eventIds.size === 589, "Event exact set mismatch");

const loaderSource = await readFile(path.join(ROOT, "app", "data", "paper4-v2", "lesson-loaders.generated.ts"), "utf8");
for (const slug of lessonSlugs) assert(loaderSource.includes(`\"${slug}\": () => import(\"./lessons/${slug}.json\")`), `${slug}: static loader is missing`);
assert((loaderSource.match(/: \(\) => import\(/g) ?? []).length === 26, "Static loader exact set mismatch");

console.log(JSON.stringify({
  status: "PASS",
  node: process.version,
  counts: stats.counts,
  gap_lessons: [...gapLessons].sort(),
  canonical_registry_sha256: stats.canonical_registry_sha256,
  deterministic_output_sha256: stats.output_sha256,
}, null, 2));
