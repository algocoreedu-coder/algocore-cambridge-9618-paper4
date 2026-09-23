import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAPER4 = path.resolve(HERE, "../../../..");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const unique = (values) => [...new Set(values)];
const sameSet = (a, b) => {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && JSON.stringify(left) === JSON.stringify(right);
};

const upstreamKnowledge = read(path.join(PAPER4, "stage-3", "BOOK_KNOWLEDGE_MAP.json"));
const upstreamLessons = read(path.join(PAPER4, "stage-3", "LESSON_PACKAGES.json"));
const schema = read(path.join(HERE, "SCHEMA_V2_DRAFT.json"));
const disposition = read(path.join(HERE, "KNOWLEDGE_DISPOSITION_DRAFT.json"));
const sourceMap = read(path.join(HERE, "LESSON_SOURCE_MAP_DRAFT.json"));
const recorded = read(path.join(HERE, "SELF_CHECK.json"));

const checks = {
  json_schema_draft: schema.$schema === "https://json-schema.org/draft/2020-12/schema",
  seven_contract_definitions: ["KnowledgeUnit", "PythonArtifact", "VisualScenarioTrace", "VisualEventBinding", "LessonReleaseRecord", "MarkingChain", "AssessmentItem"].every((id) => schema.$defs?.[id]),
  draft_authority_guard: schema["x-draft-governance"]?.p4r0_status_at_creation === "NOT_SIGNED" && disposition.status === "DRAFT_NON_CANONICAL" && sourceMap.status === "DRAFT_NON_CANONICAL",
  exact_108_unique_dispositions: disposition.records.length === 108 && unique(disposition.records.map((x) => x.knowledge_block_id)).length === 108,
  disposition_exact_upstream_set: sameSet(disposition.records.map((x) => x.knowledge_block_id), upstreamKnowledge.knowledge_blocks.map((x) => x.knowledge_id)),
  no_final_disposition_claim: disposition.records.every((x) => x.final_disposition === null && x.draft_status === "AWAITING_A1_LEAD_REVIEW"),
  exact_26_unique_lessons: sourceMap.lessons.length === 26 && unique(sourceMap.lessons.map((x) => x.lesson_id)).length === 26,
  lesson_exact_upstream_set: sameSet(sourceMap.lessons.map((x) => x.lesson_id), upstreamLessons.lessons.map((x) => x.lesson_id)),
  all_108_blocks_mapped_once: sourceMap.lessons.flatMap((x) => x.knowledge_block_ids).length === 108 && unique(sourceMap.lessons.flatMap((x) => x.knowledge_block_ids)).length === 108,
  all_26_have_syllabus_locators: sourceMap.lessons.every((lesson) => lesson.objective_refs.length > 0 && lesson.objective_refs.every((ref) => ref.resolution === "DIRECT_LOCATOR_AVAILABLE_UPSTREAM" && ref.source?.pdf_page && ref.source?.printed_page !== undefined && ref.source?.heading && ref.source?.bullet_locator && ref.source?.anchor_text)),
  all_26_have_coursebook_locators: sourceMap.lessons.every((lesson) => lesson.book_refs.length > 0 && lesson.book_refs.every((ref) => ref.resolution === "DIRECT_LOCATOR_AVAILABLE_UPSTREAM" && ref.chapter && ref.section && ref.subheading && ref.printed_pages?.length && ref.pdf_pages?.length)),
  expected_107_objectives: unique(sourceMap.lessons.flatMap((x) => x.objective_ids)).length === 107,
  all_55_coursebook_sections_referenced: unique(sourceMap.lessons.flatMap((x) => x.book_section_ids)).length === 55,
  recorded_self_check_passed: recorded.status === "PASS" && recorded.failures.length === 0,
};

const failures = Object.entries(checks).filter(([, pass]) => !pass).map(([id]) => id);
console.log(JSON.stringify({
  status: failures.length ? "FAIL" : "PASS",
  mode: "READ_ONLY",
  checks,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
