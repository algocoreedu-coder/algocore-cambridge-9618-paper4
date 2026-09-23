import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAPER4 = path.resolve(HERE, "../../../..");
const STAGE3 = path.join(PAPER4, "stage-3");

const INPUTS = {
  knowledge: path.join(STAGE3, "BOOK_KNOWLEDGE_MAP.json"),
  lessons: path.join(STAGE3, "LESSON_PACKAGES.json"),
  objectives: path.join(STAGE3, "evidence", "A3_OBJECTIVE_INVENTORY.json"),
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
};
const writeJson = (name, value) => fs.writeFileSync(path.join(HERE, name), `${JSON.stringify(stable(value), null, 2)}\n`);
const unique = (values) => [...new Set(values)];
const exactSet = (actual, expected) => {
  const a = [...new Set(actual)].sort();
  const e = [...new Set(expected)].sort();
  return {
    pass: a.length === actual.length && JSON.stringify(a) === JSON.stringify(e),
    actual_count: actual.length,
    unique_actual_count: a.length,
    expected_count: e.length,
    missing: e.filter((id) => !a.includes(id)),
    unexpected: a.filter((id) => !e.includes(id)),
  };
};

const knowledge = readJson(INPUTS.knowledge);
const lessonPackages = readJson(INPUTS.lessons);
const objectiveInventory = readJson(INPUTS.objectives);
const sectionById = new Map(knowledge.sections.map((item) => [item.section_id, item]));
const objectiveById = new Map(objectiveInventory.objectives.map((item) => [item.objective_id, item]));
const lessonById = new Map(lessonPackages.lessons.map((item) => [item.lesson_id, item]));
const blockById = new Map(knowledge.knowledge_blocks.map((item) => [item.knowledge_id, item]));

const provenance = Object.fromEntries(Object.entries(INPUTS).map(([key, file]) => [key, {
  path: path.relative(PAPER4, file).replaceAll("\\", "/"),
  sha256: sha256(file),
}]));

const nonEmptyString = { type: "string", minLength: 1 };
const idArray = { type: "array", items: nonEmptyString, uniqueItems: true };
const bilingual = {
  type: "object",
  additionalProperties: false,
  required: ["vi", "en"],
  properties: { vi: nonEmptyString, en: nonEmptyString },
};
const sourceLocator = {
  type: "object",
  additionalProperties: true,
  required: ["source_id"],
  properties: {
    source_id: nonEmptyString,
    pdf_page: { type: "integer", minimum: 1 },
    printed_page: { anyOf: [{ type: "integer", minimum: 1 }, nonEmptyString] },
    heading: nonEmptyString,
    bullet_locator: nonEmptyString,
    anchor_text: nonEmptyString,
  },
};

const schemaDraft = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://algocore.local/schema/paper4-v2-draft.json",
  title: "AlgoCore Paper 4 canonical schema v2 — non-canonical draft",
  description: "A1/A4 preparation draft. Promotion is blocked until P4R-0 is signed and Lead/A8 approve P4R-1.",
  type: "object",
  oneOf: [
    { $ref: "#/$defs/KnowledgeUnit" },
    { $ref: "#/$defs/PythonArtifact" },
    { $ref: "#/$defs/VisualScenarioTrace" },
    { $ref: "#/$defs/VisualEventBinding" },
    { $ref: "#/$defs/LessonReleaseRecord" },
    { $ref: "#/$defs/MarkingChain" },
    { $ref: "#/$defs/AssessmentItem" },
  ],
  $defs: {
    Bilingual: bilingual,
    SourceLocator: sourceLocator,
    StableLine: {
      type: "object", additionalProperties: false, required: ["line_id", "order", "text"],
      properties: { line_id: nonEmptyString, order: { type: "integer", minimum: 1 }, text: { type: "string" } },
    },
    KnowledgeUnit: {
      type: "object", additionalProperties: false,
      required: ["knowledge_unit_id", "lesson_id", "stage3_block_ids", "disposition", "version", "objective_refs", "book_refs", "title", "explanation", "python_connection", "representation", "invariant_or_rule", "misconceptions", "exam_signals", "micro_example", "self_check", "author", "reviewer", "status"],
      properties: {
        knowledge_unit_id: nonEmptyString, lesson_id: nonEmptyString, stage3_block_ids: idArray,
        disposition: { enum: ["publish", "merge", "prerequisite-link", "exclude-with-authority"] }, version: nonEmptyString,
        objective_refs: { type: "array", minItems: 1, items: { type: "object", additionalProperties: false, required: ["objective_id", "syllabus_version", "locator"], properties: { objective_id: nonEmptyString, syllabus_version: nonEmptyString, locator: sourceLocator } } },
        book_refs: { type: "array", minItems: 1, items: { type: "object", additionalProperties: false, required: ["section_id", "chapter", "printed_pages", "pdf_pages", "relationship"], properties: { section_id: nonEmptyString, chapter: { type: "integer", minimum: 1 }, printed_pages: { type: "array", minItems: 1, items: { type: "integer", minimum: 1 } }, pdf_pages: { type: "array", minItems: 1, items: { type: "integer", minimum: 1 } }, relationship: nonEmptyString } } },
        title: { $ref: "#/$defs/Bilingual" }, explanation: { $ref: "#/$defs/Bilingual" }, python_connection: { $ref: "#/$defs/Bilingual" }, representation: { $ref: "#/$defs/Bilingual" }, invariant_or_rule: { $ref: "#/$defs/Bilingual" },
        misconceptions: { type: "array", minItems: 1, items: { $ref: "#/$defs/Bilingual" } }, exam_signals: { type: "array", minItems: 1, items: { $ref: "#/$defs/Bilingual" } },
        micro_example: { type: "object" }, self_check: { type: "object" }, author: nonEmptyString, reviewer: nonEmptyString,
        status: { enum: ["draft", "source-reviewed", "pedagogy-reviewed", "approved", "excluded"] },
      },
    },
    PythonArtifact: {
      type: "object", additionalProperties: false,
      required: ["python_artifact_id", "lesson_id", "pattern_ids", "version", "filename", "language", "lines", "entry_point", "fixtures", "expected_outputs", "normal_boundary_failure_coverage", "stage5_source_refs", "author_run_ref", "independent_rerun_ref", "execution_log_sha256", "syntax_status", "execution_status", "code_sha256", "caption", "status"],
      properties: {
        python_artifact_id: nonEmptyString, lesson_id: nonEmptyString, pattern_ids: idArray, version: nonEmptyString, filename: nonEmptyString,
        language: { const: "python" }, lines: { type: "array", minItems: 1, items: { $ref: "#/$defs/StableLine" } }, entry_point: nonEmptyString,
        fixtures: { type: "array", minItems: 1 }, expected_outputs: { type: "array", minItems: 1 }, normal_boundary_failure_coverage: { type: "object", required: ["normal", "boundary", "failure"] },
        stage5_source_refs: { type: "array" }, author_run_ref: nonEmptyString, independent_rerun_ref: nonEmptyString,
        execution_log_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" }, syntax_status: { const: "PASS" }, execution_status: { const: "PASS" }, code_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
        caption: { $ref: "#/$defs/Bilingual" }, status: { enum: ["draft", "executed", "independently-rerun", "approved"] },
      },
    },
    VisualScenarioTrace: {
      type: "object", additionalProperties: false,
      required: ["pattern_id", "scenario_id", "case_kind", "trace_id", "python_artifact_id", "artifact_version", "initial_state", "event_ids", "expected_output_ref", "fixture_ref", "execution_evidence_ref"],
      properties: {
        pattern_id: nonEmptyString, scenario_id: nonEmptyString, case_kind: { enum: ["normal", "boundary", "failure"] }, trace_id: nonEmptyString,
        python_artifact_id: nonEmptyString, artifact_version: nonEmptyString, initial_state: {}, event_ids: idArray,
        expected_output_ref: nonEmptyString, fixture_ref: nonEmptyString, execution_evidence_ref: nonEmptyString, equivalence_justification: nonEmptyString,
      },
    },
    VisualEventBinding: {
      type: "object", additionalProperties: false,
      required: ["event_id", "trace_id", "sequence", "event_type", "active_line_ids", "before", "delta", "after", "output_delta", "invariant_or_criterion", "prediction", "feedback", "visual_targets"],
      properties: {
        event_id: nonEmptyString, trace_id: nonEmptyString, sequence: { type: "integer", minimum: 0 }, event_type: nonEmptyString, active_line_ids: idArray,
        before: {}, delta: {}, after: {}, output_delta: {}, invariant_or_criterion: nonEmptyString,
        prediction: { $ref: "#/$defs/Bilingual" }, feedback: { $ref: "#/$defs/Bilingual" }, visual_targets: idArray,
      },
    },
    LessonReleaseRecord: {
      type: "object", additionalProperties: false,
      required: ["lesson_id", "package_id", "slug", "version", "canonical_section_ids", "knowledge_unit_ids", "python_artifact_ids", "pattern_ids", "method_refs", "marking_refs", "error_refs", "practice_refs", "retrieval_refs", "source_refs", "locale_parity", "academic_review", "execution_review", "ux_review", "lead_gate"],
      properties: {
        lesson_id: nonEmptyString, package_id: nonEmptyString, slug: nonEmptyString, version: nonEmptyString,
        canonical_section_ids: { type: "array", minItems: 10, maxItems: 10, items: nonEmptyString, uniqueItems: true }, knowledge_unit_ids: idArray, python_artifact_ids: idArray, pattern_ids: idArray,
        method_refs: idArray, marking_refs: idArray, error_refs: idArray, practice_refs: idArray, retrieval_refs: idArray,
        source_refs: { type: "array", minItems: 1, items: { type: "object", required: ["source_id", "authority", "access_mode"] } },
        locale_parity: { enum: ["PASS", "FAIL"] }, academic_review: { enum: ["PASS", "FAIL"] }, execution_review: { enum: ["PASS", "FAIL"] }, ux_review: { enum: ["PASS", "FAIL"] }, lead_gate: { enum: ["PASS", "FAIL"] },
      },
    },
    MarkingChain: {
      type: "object", additionalProperties: false,
      required: ["marking_chain_id", "pattern_id", "lesson_id", "requirement_ref", "method_step_refs", "error_ref", "detection_check", "repair_check", "marking_atoms", "limited_evidence", "transfer_limit", "reviewer", "status"],
      properties: {
        marking_chain_id: nonEmptyString, pattern_id: nonEmptyString, lesson_id: nonEmptyString, requirement_ref: nonEmptyString, method_step_refs: idArray, error_ref: nonEmptyString,
        detection_check: { $ref: "#/$defs/Bilingual" }, repair_check: { $ref: "#/$defs/Bilingual" }, marking_atoms: { type: "array", minItems: 1 }, limited_evidence: { type: "boolean" }, transfer_limit: { $ref: "#/$defs/Bilingual" }, reviewer: nonEmptyString, status: { enum: ["draft", "reviewed", "approved"] },
      },
    },
    AssessmentItem: {
      type: "object", additionalProperties: false,
      required: ["assessment_item_id", "lesson_id", "pattern_ids", "assessment_requirement_ids", "destination_id", "level", "prompt", "shared_fixture_code_data_ids", "expected_artifact", "hint", "feedback", "self_rubric", "disclosure_contract"],
      properties: {
        assessment_item_id: nonEmptyString, lesson_id: nonEmptyString, pattern_ids: idArray, assessment_requirement_ids: idArray, destination_id: nonEmptyString,
        level: { enum: ["guided", "faded", "independent", "retrieval"] }, prompt: { $ref: "#/$defs/Bilingual" }, shared_fixture_code_data_ids: idArray,
        expected_artifact: nonEmptyString, hint: { $ref: "#/$defs/Bilingual" }, feedback: { $ref: "#/$defs/Bilingual" }, self_rubric: { type: "object" },
        disclosure_contract: { type: "object", additionalProperties: false, required: ["answer_hidden_initially", "hint_hidden_initially", "feedback_after_attempt"], properties: { answer_hidden_initially: { const: true }, hint_hidden_initially: { const: true }, feedback_after_attempt: { const: true } } },
      },
    },
  },
  "x-algocore-invariants": [
    "VI/EN share stable IDs, Python artifact, fixture, trace and event state.",
    "Cambridge/coursebook claims require resolvable locators; AlgoCore-authored content carries its own authority.",
    "Output and trace claims join execution evidence by the exact code hash.",
    "Event line IDs resolve inside the referenced Python artifact version.",
    "Canonical sources compile generated registries; generated files are not authoring inputs.",
    "Generate may write; check is read-only and deterministic.",
    "Hub payload contains metadata only; full traces are partitioned and lazy-loaded.",
  ],
  "x-draft-governance": {
    p4r0_status_at_creation: "NOT_SIGNED",
    authority: "A1_A4_PREPARATION_ONLY",
    promotion_requires: ["P4R-0 PASS", "A1 source review", "A4 validator tests", "Lead approval", "A8 pilot concurrence"],
  },
};

const dispositionRecords = knowledge.knowledge_blocks.map((block) => {
  const sourceLesson = lessonById.get(block.lesson_id);
  const lessonBlock = sourceLesson?.blocks.find((item) => item.block_id === block.knowledge_id);
  const missingObjectives = block.objective_ids.filter((id) => !objectiveById.has(id));
  const missingBookSections = block.book_section_ids.filter((id) => !sectionById.has(id));
  return {
    knowledge_block_id: block.knowledge_id,
    block_key: block.block_key,
    lesson_id: block.lesson_id,
    lesson_slug: sourceLesson?.slug ?? null,
    titles: block.titles,
    role: lessonBlock?.role ?? null,
    pattern_ids: lessonBlock?.pattern_ids ?? [],
    knowledge_topics: block.knowledge_topics,
    proposed_disposition: "publish",
    final_disposition: null,
    proposal_basis: "Preserve the distinct Stage 3 stable block one-to-one until A1 and Lead explicitly authorize merge, prerequisite-link or exclusion.",
    objective_ids: block.objective_ids,
    assessment_constraint_ids: block.assessment_constraint_ids,
    book_section_ids: block.book_section_ids,
    book_relationship: block.book_relationship,
    direct_locator_resolution: {
      syllabus: missingObjectives.length === 0 ? "AVAILABLE_UPSTREAM" : "UNRESOLVED",
      coursebook: missingBookSections.length === 0 ? "AVAILABLE_UPSTREAM" : "UNRESOLVED",
      missing_objective_ids: missingObjectives,
      missing_book_section_ids: missingBookSections,
    },
    planned_locale_targets: block.planned_locale_targets,
    upstream_content_status: block.content_status,
    authority_note: block.source_authority_note,
    draft_status: "AWAITING_A1_LEAD_REVIEW",
    upstream_refs: {
      knowledge: `stage-3/BOOK_KNOWLEDGE_MAP.json#knowledge_blocks[knowledge_id=${block.knowledge_id}]`,
      lesson_block: `stage-3/LESSON_PACKAGES.json#lessons[lesson_id=${block.lesson_id}].blocks[block_id=${block.knowledge_id}]`,
    },
  };
});

const knowledgeDisposition = {
  schema_version: "p4r1.knowledge-disposition.draft.v1",
  status: "DRAFT_NON_CANONICAL",
  p4r0_status_at_creation: "NOT_SIGNED",
  authority: "A1_A4_PREPARATION_ONLY",
  policy: {
    allowed_final_dispositions: ["publish", "merge", "prerequisite-link", "exclude-with-authority"],
    proposal_semantics: "publish is a preservation-first proposal, not a final Lead disposition",
    exclusion_rule: "exclude-with-authority requires a named authority, locator and rationale",
    merge_rule: "merge requires target knowledge unit ID and proof that every source block remains traceable",
  },
  input_provenance: provenance,
  records: dispositionRecords,
  counts: {
    records: dispositionRecords.length,
    proposed_publish: dispositionRecords.filter((x) => x.proposed_disposition === "publish").length,
    final_dispositions_set: dispositionRecords.filter((x) => x.final_disposition !== null).length,
    unresolved_syllabus_locator: dispositionRecords.filter((x) => x.direct_locator_resolution.syllabus === "UNRESOLVED").length,
    unresolved_coursebook_locator: dispositionRecords.filter((x) => x.direct_locator_resolution.coursebook === "UNRESOLVED").length,
  },
};

const mapObjective = (id) => {
  const objective = objectiveById.get(id);
  if (!objective) return { objective_id: id, resolution: "UNRESOLVED", source: null };
  return {
    objective_id: id,
    section: objective.section,
    scope: objective.scope,
    capability: { vi: objective.capability_vi, en: objective.capability_en },
    resolution: "DIRECT_LOCATOR_AVAILABLE_UPSTREAM",
    source: objective.source,
    authority: "Cambridge syllabus controls scope; wording is carried from the reviewed Stage 3 inventory.",
    upstream_ref: `stage-3/evidence/A3_OBJECTIVE_INVENTORY.json#objectives[objective_id=${id}]`,
  };
};
const mapBook = (id, relationships) => {
  const section = sectionById.get(id);
  if (!section) return { section_id: id, resolution: "UNRESOLVED" };
  return {
    section_id: id,
    resolution: "DIRECT_LOCATOR_AVAILABLE_UPSTREAM",
    source_id: section.source_id,
    chapter: section.chapter,
    section: section.section,
    subheading: section.subheading,
    printed_pages: section.printed_pages,
    pdf_pages: section.pdf_pages,
    support_level: section.support_level,
    supported_knowledge_actions: section.supported_knowledge_actions,
    limitations: section.limitations,
    block_relationships: unique(relationships),
    review_status: section.review_status,
    visual_verified_printed_pages: section.visual_verified_printed_pages,
    visual_evidence: section.visual_evidence,
    authority: "Coursebook supports the stated knowledge action only; it does not certify code, exam marks or complete syllabus coverage.",
    upstream_ref: `stage-3/BOOK_KNOWLEDGE_MAP.json#sections[section_id=${id}]`,
  };
};

const lessonSources = lessonPackages.lessons.map((lesson) => {
  const blocks = knowledge.knowledge_blocks.filter((block) => block.lesson_id === lesson.lesson_id);
  const blockObjectiveIds = unique(blocks.flatMap((block) => block.objective_ids));
  const objectiveIds = unique(lesson.objective_ids);
  const bookSectionIds = unique(blocks.flatMap((block) => block.book_section_ids));
  const objectiveRefs = objectiveIds.map(mapObjective);
  const bookRefs = bookSectionIds.map((id) => mapBook(id, blocks.filter((block) => block.book_section_ids.includes(id)).map((block) => block.book_relationship)));
  const unresolvedObjectives = objectiveRefs.filter((ref) => ref.resolution === "UNRESOLVED").map((ref) => ref.objective_id);
  const unresolvedBooks = bookRefs.filter((ref) => ref.resolution === "UNRESOLVED").map((ref) => ref.section_id);
  return {
    lesson_id: lesson.lesson_id,
    package_id: lesson.package_id,
    slug: lesson.slug,
    titles: lesson.titles,
    knowledge_block_ids: blocks.map((block) => block.knowledge_id),
    objective_ids: objectiveIds,
    block_objective_ids: blockObjectiveIds,
    objective_refs: objectiveRefs,
    book_section_ids: bookSectionIds,
    book_refs: bookRefs,
    assessment_requirement_ids: lesson.assessment_requirement_ids,
    direct_locator_status: unresolvedObjectives.length === 0 && unresolvedBooks.length === 0 && objectiveRefs.length > 0 && bookRefs.length > 0 ? "COMPLETE_UPSTREAM_LOCATORS_AVAILABLE" : "REVIEW_REQUIRED",
    unresolved_objective_ids: unresolvedObjectives,
    unresolved_book_section_ids: unresolvedBooks,
    mapping_uncertainties: [
      ...(JSON.stringify([...objectiveIds].sort()) === JSON.stringify([...blockObjectiveIds].sort()) ? [] : ["Lesson objective set differs from the union of its Stage 3 knowledge blocks; preserve both until A1 review."]),
      ...(bookRefs.some((ref) => ref.review_status !== "SUBMITTED") ? ["At least one coursebook section is not marked SUBMITTED upstream."] : []),
    ],
    source_authority_boundary: {
      syllabus: "Controls scope and capability; source locator does not by itself prove learner mastery or historical-paper frequency.",
      coursebook: "Supports knowledge actions within recorded limitations; no coursebook code is certified.",
      qp_ms: "Controls task-specific requirements and marks; not represented as coursebook authority in this draft.",
      algocore: "Future authored explanations, translations, examples and rubrics must be labelled AlgoCore-authored.",
    },
    draft_status: "AWAITING_A1_LEAD_REVIEW",
    upstream_ref: `stage-3/LESSON_PACKAGES.json#lessons[lesson_id=${lesson.lesson_id}]`,
  };
});

const lessonSourceMap = {
  schema_version: "p4r1.lesson-source-map.draft.v1",
  status: "DRAFT_NON_CANONICAL",
  p4r0_status_at_creation: "NOT_SIGNED",
  authority: "A1_A4_PREPARATION_ONLY",
  source_policy: {
    locator_policy: knowledge.locator_policy,
    syllabus_source: objectiveInventory.source,
    coursebook_source: knowledge.source,
    no_invention: "Only locator fields present in reviewed Stage 3 upstream artifacts are copied; missing locators remain unresolved.",
  },
  input_provenance: provenance,
  lessons: lessonSources,
  counts: {
    lessons: lessonSources.length,
    complete_upstream_locator_lessons: lessonSources.filter((x) => x.direct_locator_status === "COMPLETE_UPSTREAM_LOCATORS_AVAILABLE").length,
    review_required_lessons: lessonSources.filter((x) => x.direct_locator_status === "REVIEW_REQUIRED").length,
    unique_knowledge_blocks: unique(lessonSources.flatMap((x) => x.knowledge_block_ids)).length,
    unique_objectives: unique(lessonSources.flatMap((x) => x.objective_ids)).length,
    unique_book_sections: unique(lessonSources.flatMap((x) => x.book_section_ids)).length,
  },
};

const lessonBlockIds = lessonPackages.lessons.flatMap((lesson) => lesson.blocks.map((block) => block.block_id));
const sourceBlockIds = knowledge.knowledge_blocks.map((block) => block.knowledge_id);
const sourceLessonIds = lessonPackages.lessons.map((lesson) => lesson.lesson_id);
const mappedLessonIds = lessonSources.map((lesson) => lesson.lesson_id);
const checks = {
  exact_108_disposition: exactSet(dispositionRecords.map((x) => x.knowledge_block_id), sourceBlockIds),
  exact_stage3_block_join: exactSet(sourceBlockIds, lessonBlockIds),
  exact_26_lessons: exactSet(mappedLessonIds, sourceLessonIds),
  disposition_lesson_refs_resolve: { pass: dispositionRecords.every((x) => lessonById.has(x.lesson_id)) },
  disposition_objective_sets_preserved: { pass: dispositionRecords.every((x) => JSON.stringify([...x.objective_ids].sort()) === JSON.stringify([...blockById.get(x.knowledge_block_id).objective_ids].sort())) },
  disposition_book_sets_preserved: { pass: dispositionRecords.every((x) => JSON.stringify([...x.book_section_ids].sort()) === JSON.stringify([...blockById.get(x.knowledge_block_id).book_section_ids].sort())) },
  all_objective_refs_resolve: { pass: lessonSources.every((x) => x.unresolved_objective_ids.length === 0), unresolved: unique(lessonSources.flatMap((x) => x.unresolved_objective_ids)) },
  all_book_refs_resolve: { pass: lessonSources.every((x) => x.unresolved_book_section_ids.length === 0), unresolved: unique(lessonSources.flatMap((x) => x.unresolved_book_section_ids)) },
  syllabus_direct_locator_shape: {
    pass: lessonSources.flatMap((x) => x.objective_refs).every((x) => x.source && Number.isInteger(x.source.pdf_page) && x.source.pdf_page > 0 && x.source.printed_page !== undefined && x.source.heading && x.source.bullet_locator && x.source.anchor_text),
  },
  coursebook_direct_locator_shape: {
    pass: lessonSources.flatMap((x) => x.book_refs).every((x) => x.resolution !== "UNRESOLVED" && x.chapter && x.section && x.subheading && x.printed_pages.length > 0 && x.pdf_pages.length > 0),
  },
  lesson_objective_sets_preserved: {
    pass: lessonSources.every((mapped) => {
      const source = lessonById.get(mapped.lesson_id);
      return JSON.stringify([...mapped.objective_ids].sort()) === JSON.stringify([...source.objective_ids].sort());
    }),
  },
  schema_required_definitions_present: {
    pass: ["KnowledgeUnit", "PythonArtifact", "VisualScenarioTrace", "VisualEventBinding", "LessonReleaseRecord", "MarkingChain", "AssessmentItem"].every((id) => schemaDraft.$defs[id]),
  },
  draft_authority_guard: {
    pass: knowledgeDisposition.status === "DRAFT_NON_CANONICAL" && lessonSourceMap.status === "DRAFT_NON_CANONICAL" && schemaDraft["x-draft-governance"].p4r0_status_at_creation === "NOT_SIGNED",
  },
};
const failures = Object.entries(checks).filter(([, value]) => !value.pass).map(([id]) => id);
const selfCheck = {
  schema_version: "p4r1.a1-a4-self-check.v1",
  status: failures.length === 0 ? "PASS" : "FAIL",
  scope: "Draft construction and exact-set/source-resolution checks only; not P4R-1 acceptance.",
  input_provenance: provenance,
  denominators: {
    stage3_knowledge_blocks: sourceBlockIds.length,
    stage3_lesson_blocks: lessonBlockIds.length,
    lessons: sourceLessonIds.length,
    objective_inventory: objectiveInventory.objectives.length,
    objectives_referenced_by_lessons: unique(lessonSources.flatMap((x) => x.objective_ids)).length,
    coursebook_sections_inventory: knowledge.sections.length,
    coursebook_sections_referenced_by_lessons: unique(lessonSources.flatMap((x) => x.book_section_ids)).length,
  },
  checks,
  failures,
  limitations: [
    "P4R-0 was not signed when these drafts were built; hashes document observed inputs but do not constitute an approved lock.",
    "Proposed publish dispositions preserve all Stage 3 blocks; A1 and Lead must decide final merge/prerequisite/exclusion semantics.",
    "This check resolves locator shapes and exact joins. It does not re-open the PDFs or independently verify page content.",
    "This draft does not author theory, Python code, marking claims or assessment content.",
  ],
};

writeJson("SCHEMA_V2_DRAFT.json", schemaDraft);
writeJson("KNOWLEDGE_DISPOSITION_DRAFT.json", knowledgeDisposition);
writeJson("LESSON_SOURCE_MAP_DRAFT.json", lessonSourceMap);
writeJson("SELF_CHECK.json", selfCheck);

const schemaNotes = `# Schema v2 draft notes\n\n## Status and authority\n\nThis is an A1/A4 preparation draft under \`evidence/p4r-1/a1-a4\`. It is non-canonical because P4R-0 was not signed at creation time. Promotion requires P4R-0 PASS, A1 source review, A4 validator/negative tests, Lead approval and A8 concurrence for the pilot.\n\n## Design decisions\n\n- IDs and joins are explicit. Python source is an ordered array of stable line IDs; visual events may only bind those IDs in the referenced artifact version.\n- Bilingual prose is paired in \`{vi,en}\`; executable source, fixtures, raw outputs, traces and state are shared across locales.\n- Cambridge syllabus, coursebook, QP/MS and AlgoCore-authored statements remain separate authorities. A locator supports only the claim recorded with it.\n- Generator and checker roles are separated. Generated registries are release outputs, never authoring inputs.\n- Marking evidence allows either direct QP/MS locators or an explicitly labelled AlgoCore-authored rubric; it must not manufacture Cambridge marks.\n- Scenario traces require normal/boundary/failure disposition. Equivalent event sets need a reviewed justification.\n\n## Validation still required before canonical use\n\n1. Split the suite into per-artifact schemas or add a typed envelope so arrays can validate without trying the root \`oneOf\` manually.\n2. Add cross-document validation for stable IDs, versions, line bindings, code hashes, fixtures and execution logs. JSON Schema alone cannot enforce every join.\n3. Add negative fixtures for duplicate line order, missing locale, unresolved source locator, stale artifact version, hidden-answer contract violation and forged Cambridge authority.\n4. Confirm payload partition and public source-safety fields with A4/A5 before compiler implementation.\n5. Freeze canonical enumerations for status, authority, event types and section IDs only after P4R-0.\n\n## Upstream locator handling\n\n\`LESSON_SOURCE_MAP_DRAFT.json\` copies the reviewed Stage 3 syllabus locator fields and coursebook page arrays without modification. No page was inferred. Missing upstream records would be emitted as \`UNRESOLVED\`; see \`SELF_CHECK.json\` for the current result.\n`;
fs.writeFileSync(path.join(HERE, "SCHEMA_V2_DRAFT_NOTES.md"), schemaNotes);

const checkLines = Object.entries(checks).map(([id, value]) => `- ${value.pass ? "PASS" : "FAIL"} — \`${id}\``).join("\n");
const checkMd = `# A1/A4 draft self-check\n\n**Result:** ${selfCheck.status}\n\nThis result validates draft construction, exact sets and upstream locator resolution. It is not a P4R-1 gate decision and does not supersede P4R-0.\n\n## Denominators\n\n- Stage 3 knowledge blocks: ${selfCheck.denominators.stage3_knowledge_blocks}\n- Stage 3 lesson blocks: ${selfCheck.denominators.stage3_lesson_blocks}\n- Lessons: ${selfCheck.denominators.lessons}\n- Objective inventory: ${selfCheck.denominators.objective_inventory}\n- Objectives referenced by the 26 lessons: ${selfCheck.denominators.objectives_referenced_by_lessons}\n- Coursebook section inventory: ${selfCheck.denominators.coursebook_sections_inventory}\n- Coursebook sections referenced by the 26 lessons: ${selfCheck.denominators.coursebook_sections_referenced_by_lessons}\n\n## Checks\n\n${checkLines}\n\n## Authority limits\n\n- All 108 proposed dispositions remain \`AWAITING_A1_LEAD_REVIEW\`; none is a final decision.\n- The check confirms stored locator shape and exact joins, not a fresh visual inspection of the source PDFs.\n- Theory, code, execution evidence, marking and assessments remain outside this draft.\n`;
fs.writeFileSync(path.join(HERE, "SELF_CHECK.md"), checkMd);

console.log(JSON.stringify({ status: selfCheck.status, failures, denominators: selfCheck.denominators }, null, 2));
if (failures.length) process.exitCode = 1;
