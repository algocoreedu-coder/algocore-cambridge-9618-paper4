import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compileFullRegistry } from "./build-paper4-full-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RECORD_ROOT = path.join(ROOT, "content/paper4/records/full");
const sourceOnly = process.argv.includes("--source-only");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const records = async (filename) => (await readJson(path.join(RECORD_ROOT, filename))).map((item) => item.record);

const DSA_VISUALS = [
  "visual.dsa.growth-counter",
  "visual.dsa.array-logical-capacity",
  "visual.dsa.link-rewire",
  "visual.dsa.hash-probe",
  "visual.dsa.stack-pointer",
  "visual.dsa.queue-window",
  "visual.dsa.recursion-frames",
  "visual.dsa.binary-search-interval",
  "visual.dsa.sort-tree-state",
];
const DSA_SOURCE_IDS = ["01", "02", "03", "04", "05", "06", "07", "08", "10"].map((number) => `video_greg_hogg_dsa_lecture_${number}`);
const TARGET_SLUGS = ["performance", "data-models", "text-processing", "linked-list", "dictionary", "hashing", "stack", "queue", "recursion", "binary-search", "binary-tree", "sorting", "exam-workflow"];
const PERFORMANCE_PATTERNS = ["BINARY_SEARCH", "BUBBLE_SORT", "EVIDENCE_RUN", "INSERTION_SORT", "LINEAR_SEARCH"];

const [pilotGenerator, productionGenerator, registryBuilder, appBuilder, learningPage, inMemory] = await Promise.all([
  readFile(path.join(ROOT, "scripts/generate-p4r2-visual-pilot.mjs"), "utf8"),
  readFile(path.join(ROOT, "scripts/generate-p4r4-visual-production.mjs"), "utf8"),
  readFile(path.join(ROOT, "scripts/build-paper4-full-registry.mjs"), "utf8"),
  readFile(path.join(ROOT, "scripts/build-paper4-v2-app-registry.mjs"), "utf8"),
  readFile(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"), "utf8"),
  compileFullRegistry(),
]);
const generatorSource = `${pilotGenerator}\n${productionGenerator}`;
for (const visualId of DSA_VISUALS) assert(generatorSource.includes(visualId.replace("visual.dsa.", "")), `Generator mapping missing ${visualId}.`);
for (const sourceId of DSA_SOURCE_IDS) assert(registryBuilder.includes(sourceId), `Source mapping missing ${sourceId}.`);
assert(registryBuilder.includes("OOP_VIDEO_CHAPTERS"), "P4R-8 OOP source mapping was removed.");
assert(registryBuilder.includes("Supplementary_education_source"), "Supplementary source authority was removed.");
assert(appBuilder.includes("code_sha256.slice(0, 16)"), "Versioned trace URL contract is missing.");
assert(appBuilder.includes("trace_backed_association_patterns"), "Trace-backed association DTO contract is missing.");
assert(learningPage.includes("patterns={associatedPatterns}"), "Performance association runtime is missing.");
assert(!learningPage.includes("patterns={associatedPatterns} pythonArtifact="), "Association runtime must load the canonical owner artifact from its trace chunk.");

const grouped = inMemory.grouped;
assert(grouped.LessonReleaseRecord.length === 26, "Lesson count changed.");
assert(grouped.MarkingChain.length === 58, "Official marking-chain count changed.");
assert(grouped.VisualScenarioTrace.length === 174, "Scenario count changed.");
assert(grouped.VisualEventBinding.length === 870, `Expected 870 visual events after D2/D3, received ${grouped.VisualEventBinding.length}.`);
assert(grouped.AssessmentItem.length === 79, `Expected 79 assessments after D1, received ${grouped.AssessmentItem.length}.`);
const compiledReleases = grouped.LessonReleaseRecord.map((item) => item.record);
const sourceIds = new Set();
for (const slug of TARGET_SLUGS) {
  const release = compiledReleases.find((item) => item.slug === slug);
  assert(release, `${slug}: compiled release missing.`);
  for (const ref of release.source_refs.filter((item) => item.source_id.startsWith("video_greg_hogg_dsa_"))) {
    assert(ref.authority === "Supplementary_education_source", `${slug}: DSA video authority is incorrect.`);
    sourceIds.add(ref.source_id);
  }
}
assert(sourceIds.size === 9 && DSA_SOURCE_IDS.every((id) => sourceIds.has(id)), "Compiled releases do not contain the exact nine selected DSA sources.");
for (const slug of ["oop-model", "oop-state", "oop-inheritance", "oop-aggregation"]) {
  const release = compiledReleases.find((item) => item.slug === slug);
  assert(release?.source_refs.some((ref) => ref.source_id === "video_freecodecamp_python_oop_2025"), `${slug}: P4R-8 source mapping was not preserved.`);
}

if (!sourceOnly) {
  const [events, releases, manifest, performance] = await Promise.all([
    records("visual-event-bindings.json"),
    records("lesson-release-records.json"),
    readJson(path.join(ROOT, "app/data/paper4-v2/course-manifest.json")),
    readJson(path.join(ROOT, "app/data/paper4-v2/lessons/performance.json")),
  ]);
  const targets = new Set(events.flatMap((event) => event.visual_targets));
  for (const visualId of DSA_VISUALS) assert(targets.has(visualId), `Generated registry missing ${visualId}.`);
  for (const patternId of PERFORMANCE_PATTERNS) {
    assert(events.some((event) => event.visual_targets.includes("visual.dsa.growth-counter") && event.trace_id.toLowerCase().includes(patternId.toLowerCase().replaceAll("_", "-"))), `${patternId}: growth-counter trace binding missing.`);
  }
  assert(manifest.counts.patterns === 58 && manifest.counts.lessons === 26, "App manifest changed official scope.");
  assert(manifest.counts.visual_event_bindings === 870, "App manifest visual count is stale.");
  assert(manifest.counts.assessment_items === 79, "App manifest assessment count is stale.");
  const associations = performance.visual.trace_backed_association_patterns;
  assert(performance.visual.owned_patterns.length === 0, "Performance must remain association-only.");
  assert(Array.isArray(associations) && associations.length === 5, "Performance must expose five trace-backed growth associations.");
  assert(PERFORMANCE_PATTERNS.every((id) => associations.some((item) => item.pattern_id === id)), "Performance association set is incomplete.");
  for (const item of associations) {
    assert(item.required_visual_target === "visual.dsa.growth-counter", `${item.pattern_id}: wrong association target.`);
    assert(item.association_authority === "AlgoCore_representational_workflow_only" && item.official_marks === null, `${item.pattern_id}: authority boundary missing.`);
    assert(item.source_owner?.lesson_slug && item.source_owner?.python_artifact_id, `${item.pattern_id}: canonical trace provenance missing.`);
    assert(/\?v=[a-f0-9]{16}$/.test(item.trace_url), `${item.pattern_id}: trace URL is not versioned.`);
  }
  const generatedSourceIds = new Set(releases.flatMap((release) => release.source_refs.map((ref) => ref.source_id)).filter((id) => id.startsWith("video_greg_hogg_dsa_")));
  assert(generatedSourceIds.size === 9, "Generated release records do not contain nine DSA sources.");
}

console.log(JSON.stringify({
  status: "PASS",
  mode: sourceOnly ? "SOURCE_AND_IN_MEMORY" : "FULL_GENERATED_RELEASE",
  counts: {
    lessons: grouped.LessonReleaseRecord.length,
    official_patterns: grouped.MarkingChain.length,
    scenarios: grouped.VisualScenarioTrace.length,
    visual_events: grouped.VisualEventBinding.length,
    assessments: grouped.AssessmentItem.length,
    dsa_visual_questions: DSA_VISUALS.length,
    selected_dsa_sources: sourceIds.size,
    performance_trace_associations: PERFORMANCE_PATTERNS.length,
  },
}, null, 2));
