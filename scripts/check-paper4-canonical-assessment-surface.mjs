import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lessonsDirectory = path.join(ROOT, "app", "data", "paper4-v2", "lessons");
const componentPath = path.join(ROOT, "app", "components", "paper4-learning", "CanonicalAssessmentPractice.tsx");
const journeyPath = path.join(ROOT, "app", "components", "paper4-learning", "SixStageLearnerJourney.tsx");
const pagePath = path.join(ROOT, "app", "components", "paper4-learning", "LessonLearningPage.tsx");

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const [files, component, journey, page] = await Promise.all([
  readdir(lessonsDirectory),
  readFile(componentPath, "utf8"),
  readFile(journeyPath, "utf8"),
  readFile(pagePath, "utf8"),
]);

const lessonFiles = files.filter((file) => file.endsWith(".json")).sort();
const lessons = await Promise.all(lessonFiles.map(async (file) => JSON.parse(await readFile(path.join(lessonsDirectory, file), "utf8"))));
const items = lessons.flatMap((lesson) => lesson.practice?.items ?? []);
const ids = items.map((item) => item.assessment_item_id);

check(lessons.length === 26, `Expected 26 lesson DTOs, found ${lessons.length}.`);
check(items.length === 79, `Expected 79 canonical assessment items, found ${items.length}.`);
check(new Set(ids).size === items.length, "Assessment item IDs must be unique.");
check(lessons.every((lesson) => (lesson.practice?.items?.length ?? 0) > 0), "Every lesson must provide at least one canonical assessment item.");

for (const item of items) {
  check(typeof item.assessment_item_id === "string" && item.assessment_item_id.length > 0, "Every item needs an assessment_item_id.");
  check(Array.isArray(item.assessment_requirement_ids) && item.assessment_requirement_ids.length > 0, `${item.assessment_item_id}: requirement IDs are missing.`);
  check(item.self_rubric?.authority === "AlgoCore_authored_rubric", `${item.assessment_item_id}: unexpected rubric authority.`);
  check(item.self_rubric?.official_marks === null, `${item.assessment_item_id}: official marks must remain null.`);
  check(Array.isArray(item.self_rubric?.criteria) && item.self_rubric.criteria.length > 0, `${item.assessment_item_id}: self-check criteria are missing.`);
  check(item.disclosure_contract?.feedback_after_attempt === true, `${item.assessment_item_id}: feedback must remain attempt-gated.`);
  const learnerVisibleCanonicalText = ["prompt", "expected_artifact", "hint", "feedback"]
    .flatMap((field) => [item[field]?.en ?? "", item[field]?.vi ?? ""])
    .join("\n");
  check(!/ac-9618|\.expected-output/i.test(learnerVisibleCanonicalText), `${item.assessment_item_id}: learner text leaks an internal record ID.`);
  for (const patternId of item.pattern_ids ?? []) {
    check(!learnerVisibleCanonicalText.includes(patternId), `${item.assessment_item_id}: learner text leaks raw pattern ID ${patternId}.`);
  }
}

const surfaceTokens = [
  "data-canonical-assessment-practice",
  "data-assessment-item-id",
  "data-assessment-requirement-ids",
  "data-official-marks=\"none\"",
  "hasMeaningfulDraft",
  "criterionPresentation",
  "criteriaReady",
  "disabled={!canReveal}",
  "data-assessment-feedback-revealed=\"true\"",
  "AlgoCore-authored practice · no official Cambridge marks",
  "Bài luyện do AlgoCore biên soạn · không có điểm chính thức của Cambridge",
];
for (const token of surfaceTokens) check(component.includes(token), `Assessment surface is missing contract token: ${token}`);
check(page.includes("assessmentItems={lesson.practice.items}"), "LessonLearningPage must pass canonical practice items to the six-stage journey.");
check(journey.includes("<CanonicalAssessmentPractice items={assessmentItems} locale={locale}") && journey.includes("fixtures={testFixtures}") && journey.includes("expectedOutputs={testExpectedOutputs}"), "SixStageLearnerJourney must render canonical practice after micropractice with its declared fixture contract.");
check(!component.includes("criterion.description[locale]"), "Raw canonical criterion descriptions must not be rendered to learners.");
check(!component.includes("criterion.evidence_required}"), "Raw canonical evidence IDs must not be rendered to learners.");
check(!component.includes("item.self_rubric.pass_rule[locale]"), "Raw canonical pass-rule text must be adapted for learners.");

const result = {
  schema_version: "paper4-canonical-assessment-surface-check-v1",
  status: failures.length === 0 ? "PASS" : "FAIL",
  counts: { lessons: lessons.length, assessment_items: items.length, unique_item_ids: new Set(ids).size },
  contracts: {
    stable_item_id: component.includes("data-assessment-item-id"),
    machine_readable_requirement_ids: component.includes("data-assessment-requirement-ids"),
    meaningful_draft_gate: component.includes("hasMeaningfulDraft"),
    criterion_self_check_gate: component.includes("criteriaReady"),
    truthful_authority: component.includes("no official Cambridge marks"),
  },
  failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exitCode = 1;
