import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const projectionRoot = resolve(root, "app/data/paper4-v2/learner-projections");
const lessonRoot = resolve(root, "app/data/paper4-v2/lessons");
const review = readJson("../planning/paper4/comprehensive-audit-2026-10-02/CONTENT_ALIGNMENT_REVIEW.json");
const lessonPackages = readJson("../planning/paper4/stage-3/LESSON_PACKAGES.json");
const crosswalk = readJson("content/paper4/teacher/visible-assessment-crosswalk.json");
const stageOrder = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"];
const remediatedSlugs = new Set(["binary-tree", "dictionary", "hashing", "oop-model", "oop-state", "oop-inheritance", "oop-aggregation", "text-files", "object-files", "random-files", "exceptions", "graphs", "exam-workflow"]);
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const projectionFiles = readdirSync(projectionRoot).filter((name) => name.endsWith(".json")).sort();
assert(projectionFiles.length === 26, `Expected 26 learner projections; found ${projectionFiles.length}.`);

const projectionRequirements = new Set();
const projectionSlugs = new Set();
const projections = new Map();
for (const file of projectionFiles) {
  const slug = file.replace(/\.json$/, "");
  const projection = readJson(`app/data/paper4-v2/learner-projections/${file}`);
  projections.set(slug, projection);
  projectionSlugs.add(slug);
  assert(projection.status === "teacher-approved-for-implementation", `${slug}: invalid Teacher status.`);
  assert(JSON.stringify(projection.stage_order) === JSON.stringify(stageOrder), `${slug}: stage topology differs from the six-stage contract.`);
  const promiseWords = projection.learner_promise?.en?.trim().split(/\s+/).length ?? 0;
  if (remediatedSlugs.has(slug)) assert(promiseWords >= 20 && promiseWords <= 35, `${slug}: English learner promise has ${promiseWords} words; expected 20–35.`);
  for (const stage of stageOrder) {
    assert(projection.stages?.[stage]?.order === stageOrder.indexOf(stage) + 1, `${slug}: ${stage} order is invalid.`);
    assert(Boolean(projection.stages?.[stage]?.name?.en) && Boolean(projection.stages?.[stage]?.name?.vi), `${slug}: ${stage} lacks EN/VI name.`);
  }
  for (const [index, task] of (projection.stages?.practise?.items ?? []).entries()) {
    const requiredFields = remediatedSlugs.has(slug) ? ["level", "title", "prompt", "hint", "model_answer", "success_check"] : ["title", "prompt", "hint", "model_answer", "success_check"];
    for (const field of requiredFields) {
      assert(Boolean(task[field]?.en) && Boolean(task[field]?.vi), `${slug}: practice ${index} lacks EN/VI ${field}.`);
    }
    for (const requirement of task.assessment_requirement_ids ?? []) projectionRequirements.add(requirement);
  }
}

const lessonFiles = readdirSync(lessonRoot).filter((name) => name.endsWith(".json")).sort();
assert(lessonFiles.length === 26, `Expected 26 lesson DTOs; found ${lessonFiles.length}.`);
const dtoRequirements = new Set();
for (const file of lessonFiles) {
  const slug = file.replace(/\.json$/, "");
  assert(projectionSlugs.has(slug), `${slug}: no learner projection.`);
  const lesson = readJson(`app/data/paper4-v2/lessons/${file}`);
  for (const task of lesson.practice?.items ?? []) {
    for (const requirement of task.assessment_requirement_ids ?? []) dtoRequirements.add(requirement);
  }
}

const expectedRequirements = new Set(lessonPackages.assessment_requirements.map((item) => item.requirement_id));
const crosswalkRequirements = new Set();
for (const [index, record] of crosswalk.records.entries()) {
  const projection = projections.get(record.lesson_slug);
  const match = record.visible_task_path.match(/^stages\.practise\.items\[(\d+)]$/);
  const task = match ? projection?.stages?.practise?.items?.[Number(match[1])] : null;
  assert(Boolean(task), `Crosswalk ${index}: visible task path does not resolve.`);
  assert(task?.title?.en === record.task_title_en && task?.title?.vi === record.task_title_vi, `Crosswalk ${index}: visible task title drift.`);
  crosswalkRequirements.add(record.requirement_id);
}
assert(crosswalkRequirements.size === crosswalk.records.length, "Crosswalk contains duplicate requirement IDs.");
const visibleRequirements = new Set([...dtoRequirements, ...projectionRequirements, ...crosswalkRequirements]);
const missing = [...expectedRequirements].filter((id) => !visibleRequirements.has(id)).sort();
const unknown = [...visibleRequirements].filter((id) => !expectedRequirements.has(id)).sort();
assert(missing.length === 0, `Visible learner tasks still miss requirements: ${missing.join(", ")}`);
assert(unknown.length === 0, `Visible learner tasks contain unknown requirements: ${unknown.join(", ")}`);

const priorGaps = new Set(review.assessment_traceability_gaps.map((item) => item.requirement_id));
const unclosedGaps = [...priorGaps].filter((id) => !crosswalkRequirements.has(id));
assert(unclosedGaps.length === 0, `Prior 44-gap register is not fully linked to visible tasks: ${unclosedGaps.join(", ")}`);

const graphProjection = readJson("app/data/paper4-v2/learner-projections/graphs.json");
const graphText = JSON.stringify(graphProjection).toLowerCase();
assert(graphText.includes("no graph-structure implementation is required"), "Graph projection lacks the explicit no-implementation scope boundary.");
const forbiddenGraphPhrases = ["independently implement and verify adjacency", "complete or repair the python for", "tự cài đặt và kiểm chứng adjacency", "hoàn thiện hoặc sửa đoạn python"];
for (const phrase of forbiddenGraphPhrases) assert(!graphText.includes(phrase), `Graph projection retains out-of-scope phrase: ${phrase}`);

for (const path of [
  "content/paper4/assessments/production/assessment-items.json",
  "content/paper4/records/full/assessment-items.json",
  "app/data/paper4-v2/lessons/graphs.json",
]) {
  const data = readJson(path);
  const records = Array.isArray(data) ? data.map((item) => item.record ?? item) : data.practice.items;
  const graphItems = records.filter((item) => item.assessment_item_id?.startsWith("graphs."));
  assert(graphItems.length === 3, `${path}: expected three Graph assessment items.`);
  for (const record of graphItems) {
    const prompt = `${record.prompt.en} ${record.prompt.vi}`.toLowerCase();
    for (const phrase of forbiddenGraphPhrases) assert(!prompt.includes(phrase), `${path}/${record.assessment_item_id}: retains out-of-scope coding requirement.`);
    assert(prompt.includes("no ") || prompt.includes("không "), `${path}/${record.assessment_item_id}: no explicit no-code scope cue.`);
  }
}

if (failures.length) {
  console.error("Paper 4 Teacher R0/R1 gate: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Paper 4 Teacher R0/R1 gate: PASS");
console.log(JSON.stringify({
  learnerProjections: projectionFiles.length,
  localeTopologies: projectionFiles.length * 2,
  visibleAssessmentRequirements: visibleRequirements.size,
  priorAuditGapsLinkedToVisibleTasks: priorGaps.size,
  graphRequiredCodingTasks: 0,
}, null, 2));
