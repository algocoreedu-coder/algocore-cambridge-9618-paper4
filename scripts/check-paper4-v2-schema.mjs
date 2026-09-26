import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_PATH = path.join(ROOT, "content/paper4/schema/paper4-v2.schema.json");
const NEGATIVE_FIXTURE_DIR = path.join(ROOT, "content/paper4/fixtures/schema-negative");
const RECORD_DIR = path.join(ROOT, "content/paper4/records");
const SCHEMA_VERSION = "2.0.0";
const TYPES = [
  "KnowledgeUnit",
  "PythonArtifact",
  "VisualScenarioTrace",
  "VisualEventBinding",
  "LessonReleaseRecord",
  "MarkingChain",
  "AssessmentItem",
];
const TYPE_IDS = {
  KnowledgeUnit: "knowledge_unit_id",
  PythonArtifact: "python_artifact_id",
  VisualScenarioTrace: "trace_id",
  VisualEventBinding: "event_id",
  LessonReleaseRecord: "lesson_id",
  MarkingChain: "marking_chain_id",
  AssessmentItem: "assessment_item_id",
};
const REQUIRED = {
  KnowledgeUnit: [
    "knowledge_unit_id", "lesson_id", "stage3_block_ids", "disposition", "version",
    "objective_refs", "book_refs", "title", "explanation", "python_connection",
    "representation", "invariant_or_rule", "misconceptions", "exam_signals",
    "micro_example", "self_check", "author", "reviewer", "status",
  ],
  PythonArtifact: [
    "python_artifact_id", "lesson_id", "pattern_ids", "version", "filename", "language",
    "lines", "entry_point", "fixtures", "expected_outputs", "normal_boundary_failure_coverage",
    "stage5_source_refs", "author_run_ref", "independent_rerun_ref", "execution_log_sha256",
    "syntax_status", "execution_status", "code_sha256", "caption", "status",
  ],
  VisualScenarioTrace: [
    "pattern_id", "scenario_id", "case_kind", "trace_id", "python_artifact_id",
    "artifact_version", "initial_state", "event_ids", "expected_output_ref", "fixture_ref",
    "execution_evidence_ref",
  ],
  VisualEventBinding: [
    "event_id", "trace_id", "sequence", "event_type", "active_line_ids", "before", "delta",
    "after", "output_delta", "invariant_or_criterion", "prediction", "feedback", "visual_targets", "accessibility",
  ],
  LessonReleaseRecord: [
    "lesson_id", "package_id", "slug", "version", "canonical_section_ids", "knowledge_unit_ids",
    "python_artifact_ids", "pattern_ids", "method_refs", "marking_refs", "error_refs",
    "practice_refs", "retrieval_refs", "source_refs", "locale_parity", "academic_review",
    "execution_review", "ux_review", "lead_gate", "release_allowed",
  ],
  MarkingChain: [
    "marking_chain_id", "pattern_id", "lesson_id", "requirement_ref", "method_step_refs",
    "error_ref", "detection_check", "repair_check", "marking_atoms", "limited_evidence",
    "transfer_limit", "reviewer", "status",
  ],
  AssessmentItem: [
    "assessment_item_id", "lesson_id", "pattern_ids", "assessment_requirement_ids",
    "destination_id", "level", "prompt", "shared_fixture_code_data_ids", "expected_artifact",
    "hint", "feedback", "self_rubric", "disclosure_contract",
  ],
};
const BILINGUAL_FIELDS = {
  KnowledgeUnit: ["title", "explanation", "python_connection", "representation", "invariant_or_rule"],
  PythonArtifact: ["caption"],
  VisualEventBinding: ["invariant_or_criterion", "prediction", "feedback"],
  MarkingChain: ["detection_check", "repair_check", "transfer_limit"],
  AssessmentItem: ["prompt", "expected_artifact", "hint", "feedback"],
};
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function issue(code, at, message) {
  return { code, path: at, message };
}

function nonEmpty(value) {
  return typeof value === "string" && value.length > 0;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function preciseLocator(locator) {
  if (!isObject(locator) || !nonEmpty(locator.source_id)) return false;
  return ["pdf_page", "printed_page", "heading", "bullet_locator", "anchor_text"]
    .some((key) => locator[key] !== undefined && locator[key] !== "");
}

function validateId(value, at, errors) {
  if (!nonEmpty(value) || !ID_PATTERN.test(value)) {
    errors.push(issue("STABLE_ID_INVALID", at, "Expected a stable non-empty ID."));
  }
}

function validateIdArray(value, at, errors, { nonEmpty: mustContain = false } = {}) {
  if (!Array.isArray(value) || (mustContain && value.length === 0)) {
    errors.push(issue("ID_ARRAY_INVALID", at, mustContain ? "Expected at least one stable ID." : "Expected an ID array."));
    return;
  }
  const seen = new Set();
  value.forEach((id, index) => {
    validateId(id, `${at}/${index}`, errors);
    if (seen.has(id)) errors.push(issue("ID_ARRAY_DUPLICATE", `${at}/${index}`, `Duplicate ID ${id}.`));
    seen.add(id);
  });
}

function validateBilingual(value, at, errors) {
  if (!isObject(value) || !nonEmpty(value.vi) || !nonEmpty(value.en)) {
    errors.push(issue("BILINGUAL_LOCALE_MISSING", at, "Both non-empty vi and en fields are required."));
  }
}

function validateRequired(record, type, errors) {
  for (const key of REQUIRED[type]) {
    if (!(key in record)) errors.push(issue("REQUIRED_FIELD_MISSING", `/record/${key}`, `${type}.${key} is required.`));
  }
}

function validateKnowledgeUnit(record, errors) {
  validateId(record.knowledge_unit_id, "/record/knowledge_unit_id", errors);
  validateId(record.lesson_id, "/record/lesson_id", errors);
  validateIdArray(record.stage3_block_ids, "/record/stage3_block_ids", errors, { nonEmpty: true });
  for (const [index, ref] of (record.objective_refs ?? []).entries()) {
    validateId(ref?.objective_id, `/record/objective_refs/${index}/objective_id`, errors);
    if (!preciseLocator(ref?.locator)) {
      errors.push(issue("SOURCE_LOCATOR_UNRESOLVED", `/record/objective_refs/${index}/locator`, "Objective source requires source_id and a precise locator."));
    }
  }
  if (!Array.isArray(record.objective_refs) || record.objective_refs.length === 0) {
    errors.push(issue("SOURCE_LOCATOR_UNRESOLVED", "/record/objective_refs", "At least one objective source is required."));
  }
  for (const [index, ref] of (record.book_refs ?? []).entries()) {
    if (!nonEmpty(ref?.section_id) || !Number.isInteger(ref?.chapter)
      || !Array.isArray(ref?.printed_pages) || ref.printed_pages.length === 0
      || !Array.isArray(ref?.pdf_pages) || ref.pdf_pages.length === 0) {
      errors.push(issue("SOURCE_LOCATOR_UNRESOLVED", `/record/book_refs/${index}`, "Coursebook source requires section, chapter, printed pages and PDF pages."));
    }
  }
  if (!Array.isArray(record.book_refs) || record.book_refs.length === 0) {
    errors.push(issue("SOURCE_LOCATOR_UNRESOLVED", "/record/book_refs", "At least one coursebook source is required."));
  }
  for (const [index, item] of (record.misconceptions ?? []).entries()) validateBilingual(item, `/record/misconceptions/${index}`, errors);
  for (const [index, item] of (record.exam_signals ?? []).entries()) validateBilingual(item, `/record/exam_signals/${index}`, errors);
}

function validatePythonArtifact(record, errors) {
  validateId(record.python_artifact_id, "/record/python_artifact_id", errors);
  validateId(record.lesson_id, "/record/lesson_id", errors);
  validateIdArray(record.pattern_ids, "/record/pattern_ids", errors, { nonEmpty: true });
  if (record.language !== "python" || !String(record.filename ?? "").endsWith(".py")) {
    errors.push(issue("PYTHON_ARTIFACT_INVALID", "/record/language", "Python artifacts require language=python and a .py filename."));
  }
  if (!SHA256_PATTERN.test(record.code_sha256 ?? "") || !SHA256_PATTERN.test(record.execution_log_sha256 ?? "")) {
    errors.push(issue("SHA256_INVALID", "/record", "Code and execution log hashes must be lowercase SHA-256 values."));
  }
  for (const key of ["author_run_ref", "independent_rerun_ref"]) validateId(record[key], `/record/${key}`, errors);
  if (record.syntax_status !== "PASS" || record.execution_status !== "PASS") {
    errors.push(issue("EXECUTION_STATUS_INVALID", "/record", "Syntax and execution status must both be PASS."));
  }
  const lines = Array.isArray(record.lines) ? record.lines : [];
  const lineIds = new Set();
  const orders = new Set();
  let duplicateOrder = false;
  for (const [index, line] of lines.entries()) {
    validateId(line?.line_id, `/record/lines/${index}/line_id`, errors);
    if (lineIds.has(line?.line_id)) errors.push(issue("LINE_ID_DUPLICATE", `/record/lines/${index}/line_id`, `Duplicate line_id ${line?.line_id}.`));
    if (orders.has(line?.order)) {
      duplicateOrder = true;
      errors.push(issue("LINE_ORDER_DUPLICATE", `/record/lines/${index}/order`, `Duplicate line order ${line?.order}.`));
    }
    lineIds.add(line?.line_id);
    orders.add(line?.order);
  }
  if (lines.length === 0) errors.push(issue("PYTHON_LINES_EMPTY", "/record/lines", "At least one source line is required."));
  if (!duplicateOrder && lines.some((line, index) => line.order !== index + 1)) {
    errors.push(issue("LINE_ORDER_NONCONTIGUOUS", "/record/lines", "Line order must be contiguous and array-sorted from one."));
  }
  if (lines.length > 0 && lines.every((line) => typeof line.text === "string")) {
    const actualCodeHash = createHash("sha256").update(lines.map((line) => line.text).join("\n")).digest("hex");
    if (record.code_sha256 !== actualCodeHash) errors.push(issue("CODE_HASH_STALE", "/record/code_sha256", `Stored code hash does not match canonical lines; expected ${actualCodeHash}.`));
  }
  const fixtureIds = new Set();
  for (const [index, fixture] of (record.fixtures ?? []).entries()) {
    validateId(fixture?.fixture_id, `/record/fixtures/${index}/fixture_id`, errors);
    if (!["normal", "boundary", "failure"].includes(fixture?.case_kind) || !("input" in (fixture ?? {}))) {
      errors.push(issue("FIXTURE_SHAPE_INVALID", `/record/fixtures/${index}`, "Fixture requires case_kind and input."));
    }
    if (fixtureIds.has(fixture?.fixture_id)) errors.push(issue("FIXTURE_ID_DUPLICATE", `/record/fixtures/${index}/fixture_id`, `Duplicate fixture ${fixture?.fixture_id}.`));
    fixtureIds.add(fixture?.fixture_id);
  }
  const outputIds = new Set();
  for (const [index, output] of (record.expected_outputs ?? []).entries()) {
    validateId(output?.expected_output_id, `/record/expected_outputs/${index}/expected_output_id`, errors);
    if (!fixtureIds.has(output?.fixture_ref)) errors.push(issue("EXPECTED_OUTPUT_FIXTURE_UNRESOLVED", `/record/expected_outputs/${index}/fixture_ref`, `Unknown fixture ${output?.fixture_ref}.`));
    if (!("value" in (output ?? {}))) errors.push(issue("EXPECTED_OUTPUT_SHAPE_INVALID", `/record/expected_outputs/${index}`, "Expected output requires a value, including explicit null when appropriate."));
    if (outputIds.has(output?.expected_output_id)) errors.push(issue("EXPECTED_OUTPUT_ID_DUPLICATE", `/record/expected_outputs/${index}/expected_output_id`, `Duplicate expected output ${output?.expected_output_id}.`));
    outputIds.add(output?.expected_output_id);
  }
  const coverage = record.normal_boundary_failure_coverage;
  if (!isObject(coverage) || ["normal", "boundary", "failure"].some((key) => coverage[key] !== true)) {
    errors.push(issue("CASE_COVERAGE_INCOMPLETE", "/record/normal_boundary_failure_coverage", "Normal, boundary and failure coverage must all be evidenced."));
  }
}

function validateTrace(record, errors) {
  for (const key of ["pattern_id", "scenario_id", "trace_id", "python_artifact_id", "expected_output_ref", "fixture_ref", "execution_evidence_ref"])
    validateId(record[key], `/record/${key}`, errors);
  validateIdArray(record.event_ids, "/record/event_ids", errors, { nonEmpty: true });
}

function validateEvent(record, errors) {
  validateId(record.event_id, "/record/event_id", errors);
  validateId(record.trace_id, "/record/trace_id", errors);
  validateId(record.event_type, "/record/event_type", errors);
  validateIdArray(record.active_line_ids, "/record/active_line_ids", errors);
  validateIdArray(record.visual_targets, "/record/visual_targets", errors);
  const accessibility = record.accessibility;
  if (!isObject(accessibility)) {
    errors.push(issue("VISUAL_ACCESSIBILITY_MISSING", "/record/accessibility", "Visual events require learner-facing accessibility metadata."));
    return;
  }
  validateBilingual(accessibility.accessible_label, "/record/accessibility/accessible_label", errors);
  validateBilingual(accessibility.action_description, "/record/accessibility/action_description", errors);
  validateBilingual(accessibility.keyboard_instruction, "/record/accessibility/keyboard_instruction", errors);
  validateId(accessibility.focus_target, "/record/accessibility/focus_target", errors);
  if (!Number.isInteger(accessibility.focus_order) || accessibility.focus_order < 0) {
    errors.push(issue("VISUAL_FOCUS_ORDER_INVALID", "/record/accessibility/focus_order", "Focus order must be a non-negative integer."));
  }
  if (!["status", "step", "control", "code-line", "diagram-node"].includes(accessibility.interaction_role)) {
    errors.push(issue("VISUAL_INTERACTION_ROLE_INVALID", "/record/accessibility/interaction_role", "Visual event interaction role is not supported."));
  }
  if (!isObject(accessibility.live_status) || !["off", "polite", "assertive"].includes(accessibility.live_status.mode)) {
    errors.push(issue("VISUAL_LIVE_STATUS_INVALID", "/record/accessibility/live_status", "Visual event live status requires a supported announcement mode."));
  } else {
    validateBilingual(accessibility.live_status.message, "/record/accessibility/live_status/message", errors);
  }
}

function validateLessonRelease(record, errors) {
  validateId(record.lesson_id, "/record/lesson_id", errors);
  for (const key of ["knowledge_unit_ids", "python_artifact_ids", "pattern_ids"])
    validateIdArray(record[key], `/record/${key}`, errors, { nonEmpty: true });
  for (const [index, source] of (record.source_refs ?? []).entries()) {
    const authority = source?.authority;
    const allowed = ["Cambridge_syllabus", "Cambridge_coursebook", "Cambridge_QP_MS", "AlgoCore_authored", "Supplementary_education_source"];
    if (!allowed.includes(authority)) {
      const code = String(authority ?? "").toLowerCase().includes("cambridge") ? "FORGED_CAMBRIDGE_AUTHORITY" : "SOURCE_AUTHORITY_INVALID";
      errors.push(issue(code, `/record/source_refs/${index}/authority`, `Unsupported source authority ${authority}.`));
    }
    if (!preciseLocator(source?.locator)) errors.push(issue("SOURCE_LOCATOR_UNRESOLVED", `/record/source_refs/${index}/locator`, "Release source requires a precise locator."));
  }
  if (typeof record.release_allowed !== "boolean") {
    errors.push(issue("RELEASE_ALLOWED_INVALID", "/record/release_allowed", "release_allowed must be a boolean."));
  } else if (record.release_allowed && record.lead_gate !== "PASS") {
    errors.push(issue("PREMATURE_RELEASE_ALLOWED", "/record/release_allowed", "Release remains blocked until A8 and Lead sign the final gate."));
  }
}

function validateMarkingChain(record, errors) {
  for (const key of ["marking_chain_id", "pattern_id", "lesson_id", "requirement_ref", "error_ref"])
    validateId(record[key], `/record/${key}`, errors);
  validateIdArray(record.method_step_refs, "/record/method_step_refs", errors, { nonEmpty: true });
  for (const [index, atom] of (record.marking_atoms ?? []).entries()) {
    validateId(atom?.atom_id, `/record/marking_atoms/${index}/atom_id`, errors);
    if (!["Cambridge_QP_MS", "AlgoCore_authored_rubric"].includes(atom?.authority)) {
      const code = String(atom?.authority ?? "").toLowerCase().includes("cambridge") ? "FORGED_CAMBRIDGE_AUTHORITY" : "MARKING_AUTHORITY_INVALID";
      errors.push(issue(code, `/record/marking_atoms/${index}/authority`, `Unsupported marking authority ${atom?.authority}.`));
    }
    if (!preciseLocator(atom?.locator)) errors.push(issue("SOURCE_LOCATOR_UNRESOLVED", `/record/marking_atoms/${index}/locator`, "Marking atoms require a precise locator."));
    validateBilingual(atom?.criterion, `/record/marking_atoms/${index}/criterion`, errors);
  }
}

function validateAssessment(record, errors) {
  validateId(record.assessment_item_id, "/record/assessment_item_id", errors);
  validateId(record.lesson_id, "/record/lesson_id", errors);
  validateIdArray(record.pattern_ids, "/record/pattern_ids", errors, { nonEmpty: true });
  validateIdArray(record.assessment_requirement_ids, "/record/assessment_requirement_ids", errors, { nonEmpty: true });
  const contract = record.disclosure_contract;
  if (!isObject(contract) || contract.answer_hidden_initially !== true
    || contract.hint_hidden_initially !== true || contract.feedback_after_attempt !== true) {
    errors.push(issue("HIDDEN_ANSWER_CONTRACT_VIOLATION", "/record/disclosure_contract", "Answers and hints must start hidden; feedback opens only after an attempt."));
  }
}

/** Validate one canonical v2 envelope without resolving references to other documents. */
export function validateEnvelope(envelope) {
  const errors = [];
  if (!isObject(envelope)) return [issue("ENVELOPE_INVALID", "/", "Envelope must be an object.")];
  if (envelope.schema_version !== SCHEMA_VERSION) errors.push(issue("SCHEMA_VERSION_INVALID", "/schema_version", `Expected ${SCHEMA_VERSION}.`));
  if (!TYPES.includes(envelope.artifact_type)) errors.push(issue("ARTIFACT_TYPE_INVALID", "/artifact_type", "Unknown artifact type."));
  if (!isObject(envelope.record)) errors.push(issue("RECORD_INVALID", "/record", "Record must be an object."));
  if (errors.length || !TYPES.includes(envelope.artifact_type)) return errors;
  const { artifact_type: type, record } = envelope;
  validateRequired(record, type, errors);
  for (const field of BILINGUAL_FIELDS[type] ?? []) validateBilingual(record[field], `/record/${field}`, errors);
  if (type === "KnowledgeUnit") validateKnowledgeUnit(record, errors);
  if (type === "PythonArtifact") validatePythonArtifact(record, errors);
  if (type === "VisualScenarioTrace") validateTrace(record, errors);
  if (type === "VisualEventBinding") validateEvent(record, errors);
  if (type === "LessonReleaseRecord") validateLessonRelease(record, errors);
  if (type === "MarkingChain") validateMarkingChain(record, errors);
  if (type === "AssessmentItem") validateAssessment(record, errors);
  return errors;
}

/** Validate envelopes and all canonical joins that require more than one document. */
export function validateRegistry(documents) {
  const errors = [];
  const byType = Object.fromEntries(TYPES.map((type) => [type, new Map()]));
  for (const [index, envelope] of documents.entries()) {
    for (const error of validateEnvelope(envelope)) errors.push({ ...error, document: index });
    if (!TYPES.includes(envelope?.artifact_type) || !isObject(envelope?.record)) continue;
    const idField = TYPE_IDS[envelope.artifact_type];
    const id = envelope.record[idField];
    if (byType[envelope.artifact_type].has(id)) errors.push({ ...issue("RECORD_ID_DUPLICATE", `/record/${idField}`, `Duplicate ${envelope.artifact_type} ID ${id}.`), document: index });
    byType[envelope.artifact_type].set(id, { record: envelope.record, index });
  }

  for (const { record: trace, index } of byType.VisualScenarioTrace.values()) {
    const artifactEntry = byType.PythonArtifact.get(trace.python_artifact_id);
    if (!artifactEntry) {
      errors.push({ ...issue("PYTHON_ARTIFACT_UNRESOLVED", "/record/python_artifact_id", `Unknown Python artifact ${trace.python_artifact_id}.`), document: index });
      continue;
    }
    const artifact = artifactEntry.record;
    if (artifact.version !== trace.artifact_version) errors.push({ ...issue("ARTIFACT_VERSION_STALE", "/record/artifact_version", `Trace requests ${trace.artifact_version}; canonical artifact is ${artifact.version}.`), document: index });
    if (!artifact.pattern_ids?.includes(trace.pattern_id)) errors.push({ ...issue("TRACE_PATTERN_UNRESOLVED", "/record/pattern_id", `Pattern ${trace.pattern_id} is not covered by the Python artifact.`), document: index });
    if (!artifact.fixtures?.some((item) => item.fixture_id === trace.fixture_ref)) errors.push({ ...issue("TRACE_FIXTURE_UNRESOLVED", "/record/fixture_ref", `Unknown fixture ${trace.fixture_ref}.`), document: index });
    if (!artifact.expected_outputs?.some((item) => item.expected_output_id === trace.expected_output_ref && item.fixture_ref === trace.fixture_ref)) errors.push({ ...issue("TRACE_OUTPUT_UNRESOLVED", "/record/expected_output_ref", `Expected output ${trace.expected_output_ref} does not resolve for fixture ${trace.fixture_ref}.`), document: index });
    if (![artifact.author_run_ref, artifact.independent_rerun_ref].includes(trace.execution_evidence_ref)) errors.push({ ...issue("EXECUTION_EVIDENCE_UNRESOLVED", "/record/execution_evidence_ref", `Execution evidence ${trace.execution_evidence_ref} does not belong to the artifact version.`), document: index });

    const traceEvents = [...byType.VisualEventBinding.values()].filter((entry) => entry.record.trace_id === trace.trace_id);
    const orderedIds = traceEvents.sort((a, b) => a.record.sequence - b.record.sequence).map((entry) => entry.record.event_id);
    if (JSON.stringify(orderedIds) !== JSON.stringify(trace.event_ids)) errors.push({ ...issue("TRACE_EVENT_SEQUENCE_MISMATCH", "/record/event_ids", "Trace event_ids must equal the complete sequence-ordered event set."), document: index });
    const validLines = new Set(artifact.lines?.map((line) => line.line_id));
    for (const eventEntry of traceEvents) {
      for (const lineId of eventEntry.record.active_line_ids ?? []) {
        if (!validLines.has(lineId)) errors.push({ ...issue("LINE_BINDING_INVALID", "/record/active_line_ids", `Line ${lineId} does not exist in ${artifact.python_artifact_id}@${artifact.version}.`), document: eventEntry.index });
      }
    }
  }

  for (const { record: event, index } of byType.VisualEventBinding.values()) {
    if (!byType.VisualScenarioTrace.has(event.trace_id)) errors.push({ ...issue("TRACE_UNRESOLVED", "/record/trace_id", `Unknown trace ${event.trace_id}.`), document: index });
  }

  for (const { record: release, index } of byType.LessonReleaseRecord.values()) {
    for (const knowledgeId of release.knowledge_unit_ids ?? []) {
      const target = byType.KnowledgeUnit.get(knowledgeId)?.record;
      if (!target || target.lesson_id !== release.lesson_id) errors.push({ ...issue("RELEASE_KNOWLEDGE_JOIN_INVALID", "/record/knowledge_unit_ids", `Knowledge unit ${knowledgeId} does not resolve to lesson ${release.lesson_id}.`), document: index });
    }
    for (const artifactId of release.python_artifact_ids ?? []) {
      const target = byType.PythonArtifact.get(artifactId)?.record;
      if (!target || target.lesson_id !== release.lesson_id) errors.push({ ...issue("RELEASE_PYTHON_JOIN_INVALID", "/record/python_artifact_ids", `Python artifact ${artifactId} does not resolve to lesson ${release.lesson_id}.`), document: index });
    }
    for (const markingId of release.marking_refs ?? []) {
      const target = byType.MarkingChain.get(markingId)?.record;
      if (!target || target.lesson_id !== release.lesson_id) errors.push({ ...issue("RELEASE_MARKING_JOIN_INVALID", "/record/marking_refs", `Marking chain ${markingId} does not resolve to lesson ${release.lesson_id}.`), document: index });
    }
    for (const assessmentId of release.practice_refs ?? []) {
      const target = byType.AssessmentItem.get(assessmentId)?.record;
      if (!target || target.lesson_id !== release.lesson_id) errors.push({ ...issue("RELEASE_ASSESSMENT_JOIN_INVALID", "/record/practice_refs", `Assessment ${assessmentId} does not resolve to lesson ${release.lesson_id}.`), document: index });
    }
  }

  for (const { record: assessment, index } of byType.AssessmentItem.values()) {
    for (const requirementId of assessment.assessment_requirement_ids ?? []) {
      const joined = [...byType.MarkingChain.values()].some(({ record: chain }) => chain.lesson_id === assessment.lesson_id && chain.requirement_ref === requirementId && assessment.pattern_ids.includes(chain.pattern_id));
      const representationalOnly = assessment.self_rubric?.authority === "AlgoCore_authored_rubric"
        && assessment.self_rubric?.official_marks === null
        && assessment.self_rubric?.pattern_authority === "AlgoCore_representational_workflow_only";
      if (!joined && !representationalOnly) errors.push({ ...issue("ASSESSMENT_REQUIREMENT_JOIN_INVALID", "/record/assessment_requirement_ids", `Requirement ${requirementId} has no marking chain for this lesson and pattern.`), document: index });
    }
  }
  return errors;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pointerParent(root, pointer) {
  const parts = pointer.split("/").slice(1).map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
  const key = parts.pop();
  let parent = root;
  for (const part of parts) parent = parent[Number.isInteger(Number(part)) && part !== "" ? Number(part) : part];
  return { parent, key: Array.isArray(parent) ? Number(key) : key };
}

function applyMutation(documents, mutation) {
  const envelope = documents.find((item) => item.record?.[TYPE_IDS[item.artifact_type]] === mutation.target_id);
  if (!envelope) throw new Error(`Fixture target ${mutation.target_id} does not exist.`);
  const { parent, key } = pointerParent(envelope, mutation.path);
  if (mutation.operation === "remove") delete parent[key];
  else if (mutation.operation === "set") parent[key] = mutation.value;
  else throw new Error(`Unsupported mutation operation ${mutation.operation}.`);
}

function validContractRegistry() {
  const bi = (vi, en) => ({ vi, en });
  const sourceLocator = { source_id: "cambridge.syllabus.2026", pdf_page: 31, heading: "19.1 Computational thinking" };
  const documents = [
    { schema_version: SCHEMA_VERSION, artifact_type: "KnowledgeUnit", record: {
      knowledge_unit_id: "ku.binary-search.invariant", lesson_id: "binary-search", stage3_block_ids: ["s3.block.001"], disposition: "publish", version: "2.0.0",
      objective_refs: [{ objective_id: "19.1.4", syllabus_version: "2026", locator: sourceLocator }],
      book_refs: [{ section_id: "book.19.1", chapter: 19, printed_pages: [403], pdf_pages: [421], relationship: "primary" }],
      title: bi("Bất biến tìm kiếm nhị phân", "Binary search invariant"), explanation: bi("Giữ mục tiêu trong khoảng tìm kiếm.", "Keep the target inside the search interval."),
      python_connection: bi("Cập nhật low và high.", "Update low and high."), representation: bi("Khoảng đóng.", "Closed interval."), invariant_or_rule: bi("low <= target index <= high", "low <= target index <= high"),
      misconceptions: [bi("Bỏ qua điểm giữa.", "Skipping the midpoint.")], exam_signals: [bi("Danh sách đã sắp xếp.", "A sorted list.")],
      micro_example: { input: [1, 3, 5], target: 3 }, self_check: { prompt: "Which bound changes?" }, author: "AlgoCore A1", reviewer: "AlgoCore A8", status: "source-reviewed",
    } },
    { schema_version: SCHEMA_VERSION, artifact_type: "PythonArtifact", record: {
      python_artifact_id: "py.binary-search.v2", lesson_id: "binary-search", pattern_ids: ["pattern.binary-search"], version: "2.0.0", filename: "binary_search.py", language: "python",
      lines: [{ line_id: "L001", order: 1, text: "def search(values, target):" }, { line_id: "L002", order: 2, text: "    mid = len(values) // 2" }, { line_id: "L003", order: 3, text: "    return values[mid] == target" }], entry_point: "search",
      fixtures: [{ fixture_id: "fixture.normal", case_kind: "normal", input: { values: [1, 3, 5], target: 3 } }, { fixture_id: "fixture.boundary", case_kind: "boundary", input: { values: [3], target: 3 } }, { fixture_id: "fixture.failure", case_kind: "failure", input: { values: [], target: 3 } }],
      expected_outputs: [{ expected_output_id: "output.normal", fixture_ref: "fixture.normal", value: true }, { expected_output_id: "output.boundary", fixture_ref: "fixture.boundary", value: true }, { expected_output_id: "output.failure", fixture_ref: "fixture.failure", value: "IndexError" }],
      normal_boundary_failure_coverage: { normal: true, boundary: true, failure: true }, stage5_source_refs: ["stage5.binary-search.run"], author_run_ref: "run.author.binary-search.v2", independent_rerun_ref: "run.a8.binary-search.v2",
      execution_log_sha256: "1111111111111111111111111111111111111111111111111111111111111111", syntax_status: "PASS", execution_status: "PASS", code_sha256: "fc89f6f91cd3814d070e414fcd43428c94f88bdf9215aded79d1da3be6b33fed",
      caption: bi("Tìm kiếm nhị phân tối thiểu", "Minimal binary search"), status: "independently-rerun",
    } },
    { schema_version: SCHEMA_VERSION, artifact_type: "VisualScenarioTrace", record: {
      pattern_id: "pattern.binary-search", scenario_id: "scenario.binary-search.normal", case_kind: "normal", trace_id: "trace.binary-search.normal", python_artifact_id: "py.binary-search.v2", artifact_version: "2.0.0",
      initial_state: { low: 0, high: 2 }, event_ids: ["event.binary-search.001"], expected_output_ref: "output.normal", fixture_ref: "fixture.normal", execution_evidence_ref: "run.a8.binary-search.v2",
    } },
    { schema_version: SCHEMA_VERSION, artifact_type: "VisualEventBinding", record: {
      event_id: "event.binary-search.001", trace_id: "trace.binary-search.normal", sequence: 0, event_type: "compare", active_line_ids: ["L003"], before: { low: 0, high: 2 }, delta: { mid: 1 }, after: { low: 0, high: 2, mid: 1 }, output_delta: null,
      invariant_or_criterion: bi("Mục tiêu vẫn nằm trong khoảng đóng.", "The target remains in the closed interval."), prediction: bi("Dự đoán mid.", "Predict mid."), feedback: bi("mid bằng 1.", "mid is 1."), visual_targets: ["array", "code"],
      accessibility: { accessible_label: bi("Bước so sánh tại mid", "Comparison step at mid"), action_description: bi("So sánh mục tiêu với phần tử giữa.", "Compare the target with the middle item."), interaction_role: "step", keyboard_instruction: bi("Dùng phím mũi tên trái và phải để đổi bước.", "Use the left and right arrow keys to change step."), focus_target: "visual.binary-search.event-001", focus_order: 0, live_status: { mode: "polite", message: bi("Đã chọn bước so sánh tại mid.", "Comparison step at mid selected.") } },
    } },
    { schema_version: SCHEMA_VERSION, artifact_type: "LessonReleaseRecord", record: {
      lesson_id: "binary-search", package_id: "searching", slug: "binary-search", version: "2.0.0", canonical_section_ids: ["why", "recognise", "knowledge", "method", "worked-example", "visual", "mistakes", "practice", "retrieval", "sources"],
      knowledge_unit_ids: ["ku.binary-search.invariant"], python_artifact_ids: ["py.binary-search.v2"], pattern_ids: ["pattern.binary-search"], method_refs: ["method.binary-search"], marking_refs: ["marking.binary-search"], error_refs: ["error.binary-search.bounds"], practice_refs: ["assessment.binary-search.guided"], retrieval_refs: ["retrieval.binary-search.01"],
      source_refs: [{ source_id: "cambridge.syllabus.2026", authority: "Cambridge_syllabus", access_mode: "public-citation", locator: sourceLocator }], locale_parity: "PASS", academic_review: "PASS", execution_review: "PASS", ux_review: "PASS", lead_gate: "PASS", release_allowed: false,
    } },
    { schema_version: SCHEMA_VERSION, artifact_type: "MarkingChain", record: {
      marking_chain_id: "marking.binary-search", pattern_id: "pattern.binary-search", lesson_id: "binary-search", requirement_ref: "requirement.search.01", method_step_refs: ["method.binary-search.bounds"], error_ref: "error.binary-search.bounds",
      detection_check: bi("Kiểm tra cập nhật biên.", "Check bound updates."), repair_check: bi("Dùng mid + 1 hoặc mid - 1.", "Use mid + 1 or mid - 1."),
      marking_atoms: [{ atom_id: "atom.binary-search.01", authority: "Cambridge_QP_MS", criterion: bi("Cập nhật đúng biên.", "Updates the correct bound."), locator: { source_id: "qpms.9618.42.mj.2025", pdf_page: 7, anchor_text: "updates lower or upper bound" } }],
      limited_evidence: true, transfer_limit: bi("Áp dụng cho mảng đã sắp xếp.", "Applies to sorted arrays."), reviewer: "AlgoCore A7", status: "reviewed",
    } },
    { schema_version: SCHEMA_VERSION, artifact_type: "AssessmentItem", record: {
      assessment_item_id: "assessment.binary-search.guided", lesson_id: "binary-search", pattern_ids: ["pattern.binary-search"], assessment_requirement_ids: ["requirement.search.01"], destination_id: "practice.guided", level: "guided",
      prompt: bi("Hoàn thiện cập nhật biên.", "Complete the bound update."), shared_fixture_code_data_ids: ["fixture.normal", "py.binary-search.v2"], expected_artifact: bi("Biểu thức Python", "Python expression"), hint: bi("So sánh với phần tử giữa.", "Compare with the middle item."), feedback: bi("Loại cả phần tử giữa.", "Exclude the middle item."), self_rubric: { criteria: ["correct bound"] },
      disclosure_contract: { answer_hidden_initially: true, hint_hidden_initially: true, feedback_after_attempt: true },
    } },
  ];
  return documents;
}

async function jsonFiles(root) {
  if (!existsSync(root)) return [];
  const found = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && entry.name.endsWith(".json")) found.push(absolute);
    }
  }
  await walk(root);
  return found.sort();
}

async function main() {
  const schemaText = await readFile(SCHEMA_PATH, "utf8");
  const schema = JSON.parse(schemaText);
  const schemaTypes = new Set(schema.properties?.artifact_type?.enum ?? []);
  const missingTypes = TYPES.filter((type) => !schemaTypes.has(type) || !schema.$defs?.[type] || !schema.$defs?.[`${type}Envelope`]);
  if (schema.$id !== "https://algocore.education/schema/paper4/v2.0.0" || missingTypes.length) {
    throw new Error(`Canonical schema contract is incomplete; missing types: ${missingTypes.join(", ") || "none"}.`);
  }

  const positiveErrors = validateRegistry(validContractRegistry());
  if (positiveErrors.length) throw new Error(`Internal positive contract fixture failed:\n${JSON.stringify(positiveErrors, null, 2)}`);

  const fixtureFiles = await jsonFiles(NEGATIVE_FIXTURE_DIR);
  if (fixtureFiles.length < 8) throw new Error(`Expected at least 8 negative fixtures; found ${fixtureFiles.length}.`);
  const fixtureResults = [];
  for (const fixturePath of fixtureFiles) {
    const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
    const documents = deepClone(validContractRegistry());
    applyMutation(documents, fixture.mutation);
    const errors = validateRegistry(documents);
    const actualCodes = [...new Set(errors.map((error) => error.code))].sort();
    const expectedCodes = [...fixture.expected_error_codes].sort();
    if (JSON.stringify(actualCodes) !== JSON.stringify(expectedCodes)) {
      throw new Error(`${path.basename(fixturePath)} expected ${expectedCodes.join(", ")} but received ${actualCodes.join(", ") || "no rejection"}.\n${JSON.stringify(errors, null, 2)}`);
    }
    fixtureResults.push({ fixture_id: fixture.fixture_id, rejected_with: actualCodes });
  }

  const recordFiles = await jsonFiles(RECORD_DIR);
  const registryFiles = new Map();
  for (const recordPath of recordFiles) {
    const relative = path.relative(RECORD_DIR, recordPath);
    const registryName = relative.split(path.sep)[0];
    if (!registryFiles.has(registryName)) registryFiles.set(registryName, []);
    registryFiles.get(registryName).push(recordPath);
  }
  const registryResults = [];
  for (const [registryName, files] of [...registryFiles].sort(([a], [b]) => a.localeCompare(b))) {
    const documents = [];
    for (const recordPath of files) {
      const value = JSON.parse(await readFile(recordPath, "utf8"));
      if (Array.isArray(value)) documents.push(...value);
      else documents.push(value);
    }
    const canonicalErrors = validateRegistry(documents);
    if (canonicalErrors.length) throw new Error(`Canonical Paper 4 registry ${registryName} failed validation:\n${JSON.stringify(canonicalErrors, null, 2)}`);
    registryResults.push({ registry: registryName, files: files.length, records: documents.length });
  }

  const schemaSha256 = createHash("sha256").update(schemaText).digest("hex");
  console.log(JSON.stringify({
    status: "PASS",
    checker_mode: "READ_ONLY",
    schema_version: SCHEMA_VERSION,
    schema_sha256: schemaSha256,
    artifact_types: TYPES.length,
    negative_fixtures_rejected: fixtureResults.length,
    canonical_registries: registryResults,
    canonical_record_files: recordFiles.length,
    canonical_records_validated: registryResults.reduce((sum, item) => sum + item.records, 0),
    fixtures: fixtureResults,
  }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
