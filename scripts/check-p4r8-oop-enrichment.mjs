import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RECORD_ROOT = path.join(ROOT, "content/paper4/records/full");
const OOP_SLUGS = ["oop-model", "oop-state", "oop-inheritance", "oop-aggregation"];
const EXPECTED_VISUALS = new Set([
  "visual.oop.class-instance-memory",
  "visual.oop.encapsulation-gate",
  "visual.oop.constructor-chain",
  "visual.oop.dynamic-dispatch",
  "visual.oop.object-graph",
]);

const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const records = async (filename) => (await readJson(path.join(RECORD_ROOT, filename))).map((item) => item.record);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const slugFromLesson = (lessonId) => lessonId.split(".lesson.").at(-1);

const [knowledge, artifacts, traces, events, assessments, releases, manifest] = await Promise.all([
  records("knowledge-units.json"),
  records("python-artifacts.json"),
  records("visual-scenario-traces.json"),
  records("visual-event-bindings.json"),
  records("assessment-items.json"),
  records("lesson-release-records.json"),
  readJson(path.join(ROOT, "app/data/paper4-v2/course-manifest.json")),
]);

const oopLessons = new Set(OOP_SLUGS.map((slug) => `ac-9618-p4-2026-python.lesson.${slug}`));
const oopKnowledge = knowledge.filter((item) => oopLessons.has(item.lesson_id));
const oopArtifacts = artifacts.filter((item) => oopLessons.has(item.lesson_id));
const oopArtifactIds = new Set(oopArtifacts.map((item) => item.python_artifact_id));
const oopPatterns = new Set(oopArtifacts.flatMap((item) => item.pattern_ids));
const oopTraces = traces.filter((item) => oopArtifactIds.has(item.python_artifact_id));
const oopTraceIds = new Set(oopTraces.map((item) => item.trace_id));
const oopEvents = events.filter((item) => oopTraceIds.has(item.trace_id));
const oopAssessments = assessments.filter((item) => oopLessons.has(item.lesson_id));

assert(manifest.counts.lessons === 26, "Expected 26 lessons.");
assert(manifest.counts.patterns === 58, "Official pattern count must remain 58.");
assert(manifest.counts.visual_event_bindings === 599, "Expected the P4R-8 event migration count of 599.");
assert(oopKnowledge.length === 14, `Expected 14 OOP knowledge units, received ${oopKnowledge.length}.`);
assert(oopArtifacts.length === 4, `Expected four OOP Python artifacts, received ${oopArtifacts.length}.`);
assert(oopPatterns.size === 8, `Expected eight OOP patterns, received ${oopPatterns.size}.`);
assert(oopTraces.length === 24, `Expected 24 OOP visual scenarios, received ${oopTraces.length}.`);
assert(oopAssessments.length === 12, `Expected 12 OOP assessment items, received ${oopAssessments.length}.`);

for (const artifact of oopArtifacts) {
  const slug = slugFromLesson(artifact.lesson_id);
  const source = artifact.lines.map((line) => line.text).join("\n");
  assert(artifact.fixtures.length === 3 && artifact.expected_outputs.length === 3, `${slug}: expected normal/boundary/failure evidence.`);
  assert(!source.split("\n").some((line) => line.includes(";")), `${slug}: semicolon-compressed statements remain.`);
  assert(!source.split("\n").some((line) => /^\s*(if|for|while|try|except)\b.*:\s+\S/.test(line)), `${slug}: compound statement remains on one line.`);
  assert(artifact.syntax_status === "PASS" && artifact.execution_status === "PASS", `${slug}: execution evidence is not PASS.`);
}

const sourceBySlug = new Map(oopArtifacts.map((item) => [slugFromLesson(item.lesson_id), item.lines.map((line) => line.text).join("\n")]));
assert(sourceBySlug.get("oop-model").includes("self") && sourceBySlug.get("oop-model").includes("bind_instance"), "oop-model lacks self/instance evidence.");
assert(sourceBySlug.get("oop-state").includes("self.__balance") && sourceBySlug.get("oop-state").includes("candidate ="), "oop-state lacks encapsulation/candidate evidence.");
assert(sourceBySlug.get("oop-inheritance").includes("super().__init__") && sourceBySlug.get("oop-inheritance").includes("dynamic_dispatch"), "oop-inheritance lacks constructor-chain/dispatch evidence.");
assert(sourceBySlug.get("oop-aggregation").includes("isinstance") && sourceBySlug.get("oop-aggregation").includes('"has-a"'), "oop-aggregation lacks type/has-a evidence.");

for (const slug of OOP_SLUGS) {
  const release = releases.find((item) => item.slug === slug);
  assert(release, `${slug}: release record missing.`);
  assert(release.source_refs.some((ref) => ref.source_id === "video_freecodecamp_python_oop_2025" && ref.authority === "Supplementary_education_source"), `${slug}: supplementary video source missing or misclassified.`);
}

const visualTargets = new Set(oopEvents.flatMap((event) => event.visual_targets));
for (const visual of EXPECTED_VISUALS) assert(visualTargets.has(visual), `Missing OOP visual target ${visual}.`);

const assessmentText = oopAssessments.flatMap((item) => [item.prompt.en, item.prompt.vi]).join("\n").toLowerCase();
for (const phrase of ["class-design checklist", "thiếu self", "writes __balance directly", "omits super()", "signature", "has-a", "is-a"]) {
  assert(assessmentText.includes(phrase.toLowerCase()), `Assessment coverage missing: ${phrase}.`);
}

const capstone = assessments.find((item) => item.assessment_item_id === "exam-workflow.i1");
assert(capstone?.prompt.en.includes("OOP capstone") && capstone.prompt.en.includes("creates no new official pattern"), "Integrated OOP capstone is missing or lacks its authority boundary.");

console.log(JSON.stringify({
  status: "PASS",
  release_candidate: "paper4-2026-s9-v3",
  counts: {
    oop_lessons: OOP_SLUGS.length,
    oop_knowledge_units: oopKnowledge.length,
    oop_python_artifacts: oopArtifacts.length,
    oop_patterns: oopPatterns.size,
    oop_scenarios: oopTraces.length,
    oop_events: oopEvents.length,
    oop_assessments: oopAssessments.length,
    oop_visual_questions: EXPECTED_VISUALS.size,
  },
}, null, 2));
