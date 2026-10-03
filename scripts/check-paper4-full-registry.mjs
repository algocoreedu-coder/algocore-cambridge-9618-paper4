import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateRegistry } from "./check-paper4-v2-schema.mjs";
import {
  EXPECTED_COUNTS,
  RECORD_TYPES,
  SECTION_IDS,
  TYPE_FILES,
  compileFullRegistry,
  hashManifest,
  registryDigest,
  renderRegistryFiles,
} from "./build-paper4-full-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ROOT = path.resolve(ROOT, "..");
const CONTENT_ROOT = path.join(ROOT, "content", "paper4");
const RECORD_ROOT = path.join(CONTENT_ROOT, "records", "full");
const PLANNING_ROOT = path.resolve(ROOT, "..", "planning", "paper4", "next-phase");
const WORKSPACE_ROOT = path.resolve(ROOT, "..", "..");
const RESOLVER_FILES = [
  path.join(PLANNING_ROOT, "evidence", "p4r-2", "a3", "EVIDENCE_RESOLVER.json"),
  path.join(PLANNING_ROOT, "evidence", "p4r-3", "a3", "EVIDENCE_RESOLVER.json"),
];
const GAP_LESSON_SLUGS = ["testing", "dictionary", "performance", "graphs", "random-files", "exceptions"];
const GAP_LESSON_IDS = new Set(GAP_LESSON_SLUGS.map((slug) => `ac-9618-p4-2026-python.lesson.${slug}`));
const RELEASE_STATUS_FIELDS = ["locale_parity", "academic_review", "execution_review", "ux_review", "lead_gate"];
const RELEASE_STATUSES = new Set(["PASS", "FAIL", "PENDING"]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const fail = (errors, code, detail) => errors.push({ code, detail });

function indexDocuments(documents) {
  const records = Object.fromEntries(RECORD_TYPES.map((type) => [type, documents.filter((item) => item.artifact_type === type).map((item) => item.record)]));
  return {
    records,
    knowledgeById: new Map(records.KnowledgeUnit.map((record) => [record.knowledge_unit_id, record])),
    pythonById: new Map(records.PythonArtifact.map((record) => [record.python_artifact_id, record])),
    markingById: new Map(records.MarkingChain.map((record) => [record.marking_chain_id, record])),
    assessmentById: new Map(records.AssessmentItem.map((record) => [record.assessment_item_id, record])),
  };
}

function releaseDecisionErrors(manifest, sourceMap) {
  const errors = [];
  const lessons = Array.isArray(manifest?.lessons) ? manifest.lessons : [];
  const catalog = manifest?.evidence_catalog && typeof manifest.evidence_catalog === "object" ? manifest.evidence_catalog : {};
  const expectedById = new Map(sourceMap.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const actualIds = lessons.map((lesson) => lesson.lesson_id);
  const uniqueIds = new Set(actualIds);
  if (manifest?.schema_version !== "paper4-release-decision-v1") fail(errors, "RELEASE_DECISION_SCHEMA", "Expected paper4-release-decision-v1.");
  if (lessons.length !== expectedById.size || uniqueIds.size !== expectedById.size || [...expectedById.keys()].some((id) => !uniqueIds.has(id))) {
    fail(errors, "RELEASE_DECISION_EXACT_SET", `Decision manifest must contain each of the ${expectedById.size} source-mapped lessons exactly once.`);
  }
  if (JSON.stringify(manifest?.policy?.required_pass_fields) !== JSON.stringify(RELEASE_STATUS_FIELDS)) {
    fail(errors, "RELEASE_DECISION_POLICY_DRIFT", "required_pass_fields differs from the five release gates.");
  }
  for (const [evidenceId, evidence] of Object.entries(catalog)) {
    if (!evidenceId || typeof evidence?.path !== "string" || !/^[a-f0-9]{64}$/.test(evidence?.sha256 ?? "")) fail(errors, "RELEASE_EVIDENCE_CATALOG_INVALID", evidenceId || "<empty>");
    if (!RELEASE_STATUS_FIELDS.includes(evidence?.review_dimension) || !RELEASE_STATUSES.has(evidence?.asserted_status)) fail(errors, "RELEASE_EVIDENCE_CATALOG_INVALID", evidenceId);
  }
  for (const decision of lessons) {
    const expected = expectedById.get(decision.lesson_id);
    if (!expected || decision.slug !== expected.slug || decision.package_id !== expected.package_id) fail(errors, "RELEASE_DECISION_IDENTITY_DRIFT", `${decision.lesson_id}: slug/package source mismatch.`);
    for (const field of RELEASE_STATUS_FIELDS) {
      if (!RELEASE_STATUSES.has(decision[field])) fail(errors, "RELEASE_DECISION_STATUS_INVALID", `${decision.lesson_id}/${field}: ${decision[field]}`);
      const refs = decision.evidence_refs?.[field];
      if (!Array.isArray(refs) || refs.length === 0) {
        fail(errors, "RELEASE_EVIDENCE_REF_MISSING", `${decision.lesson_id}/${field}`);
        continue;
      }
      for (const evidenceId of refs) {
        const evidence = catalog[evidenceId];
        if (!evidence) fail(errors, "RELEASE_EVIDENCE_REF_UNRESOLVED", `${decision.lesson_id}/${field}: ${evidenceId}`);
        else if (evidence.review_dimension !== field) fail(errors, "RELEASE_EVIDENCE_DIMENSION_MISMATCH", `${decision.lesson_id}/${field}: ${evidenceId}`);
        else if (evidence.asserted_status !== decision[field]) fail(errors, "RELEASE_EVIDENCE_STATUS_MISMATCH", `${decision.lesson_id}/${field}: decision ${decision[field]}, evidence ${evidence.asserted_status}`);
      }
    }
    const expectedAllowed = RELEASE_STATUS_FIELDS.every((field) => decision[field] === "PASS");
    if (decision.release_allowed !== expectedAllowed) fail(errors, "RELEASE_ALLOWED_STATUS_MISMATCH", `${decision.lesson_id}: expected release_allowed=${expectedAllowed}.`);
  }
  return errors;
}

async function releaseEvidenceFileErrors(manifest) {
  const errors = [];
  for (const [evidenceId, evidence] of Object.entries(manifest.evidence_catalog ?? {})) {
    if (typeof evidence?.path !== "string") continue;
    const evidencePath = path.resolve(ROOT, evidence.path);
    if (!(evidencePath === PROJECT_ROOT || evidencePath.startsWith(`${PROJECT_ROOT}${path.sep}`))) {
      fail(errors, "RELEASE_EVIDENCE_PATH_ESCAPE", `${evidenceId}: ${evidence.path}`);
    } else if (!existsSync(evidencePath)) {
      fail(errors, "RELEASE_EVIDENCE_FILE_UNRESOLVED", `${evidenceId}: ${evidence.path}`);
    } else if (sha256(await readFile(evidencePath)) !== evidence.sha256) {
      fail(errors, "RELEASE_EVIDENCE_FILE_HASH_DRIFT", evidenceId);
    }
  }
  return errors;
}

function fullCrossErrors(documents, sourceMap, evidenceRecords, releaseDecisionManifest) {
  const errors = [];
  const idx = indexDocuments(documents);
  const expectedLessons = new Set(sourceMap.lessons.map((lesson) => lesson.lesson_id));
  const sourceByLesson = new Map(sourceMap.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const releaseByLesson = new Map(idx.records.LessonReleaseRecord.map((record) => [record.lesson_id, record]));
  const evidenceById = new Map(evidenceRecords.map((record) => [record.evidence_id, record]));
  errors.push(...releaseDecisionErrors(releaseDecisionManifest, sourceMap));
  const decisionByLesson = new Map((releaseDecisionManifest.lessons ?? []).map((decision) => [decision.lesson_id, decision]));

  for (const type of RECORD_TYPES) {
    if (idx.records[type].length !== EXPECTED_COUNTS[type]) fail(errors, "EXACT_COUNT", `${type}: expected ${EXPECTED_COUNTS[type]}, found ${idx.records[type].length}.`);
    if (documents.some((item) => item.artifact_type === type && Object.hasOwn(item.record, "schema_exception"))) fail(errors, "SCHEMA_EXCEPTION", `${type} contains a per-record schema exception.`);
  }
  if (expectedLessons.size !== 26 || releaseByLesson.size !== 26 || [...expectedLessons].some((id) => !releaseByLesson.has(id))) {
    fail(errors, "LESSON_EXACT_SET", "LessonReleaseRecord set does not equal the 26 source-mapped lessons.");
  }
  if (new Set(idx.records.LessonReleaseRecord.map((record) => record.package_id)).size !== 13) fail(errors, "PACKAGE_EXACT_SET", "Release records do not cover exactly 13 packages.");

  const stage3Expected = new Set(sourceMap.lessons.flatMap((lesson) => lesson.knowledge_block_ids));
  const stage3Actual = new Set(idx.records.KnowledgeUnit.flatMap((record) => record.stage3_block_ids));
  if (stage3Expected.size !== 108 || stage3Actual.size !== 108 || [...stage3Expected].some((id) => !stage3Actual.has(id))) {
    fail(errors, "KNOWLEDGE_BLOCK_EXACT_SET", `Expected/actual unique block counts: ${stage3Expected.size}/${stage3Actual.size}.`);
  }

  for (const artifact of idx.records.PythonArtifact) {
    for (const evidenceId of [artifact.author_run_ref, artifact.independent_rerun_ref]) {
      const evidence = evidenceById.get(evidenceId);
      if (!evidence) {
        fail(errors, "EXECUTION_RESOLVER_JOIN", `${artifact.python_artifact_id}: unresolved ${evidenceId}.`);
      } else if (evidence.python_artifact_id !== artifact.python_artifact_id || evidence.lesson_id !== artifact.lesson_id
        || evidence.code_sha256 !== artifact.code_sha256 || evidence.execution_log_sha256 !== artifact.execution_log_sha256) {
        fail(errors, "EXECUTION_RESOLVER_DRIFT", `${evidenceId} does not match ${artifact.python_artifact_id}.`);
      }
    }
  }

  for (const release of idx.records.LessonReleaseRecord) {
    const sourceLesson = sourceByLesson.get(release.lesson_id);
    if (!sourceLesson || release.package_id !== sourceLesson.package_id || release.slug !== sourceLesson.slug) fail(errors, "RELEASE_IDENTITY_DRIFT", `${release.lesson_id} package/slug differs from source map.`);
    const decision = decisionByLesson.get(release.lesson_id);
    if (!decision) fail(errors, "RELEASE_DECISION_RECORD_MISSING", release.lesson_id);
    else {
      for (const field of RELEASE_STATUS_FIELDS) if (release[field] !== decision[field]) fail(errors, "RELEASE_DECISION_RECORD_DRIFT", `${release.lesson_id}/${field}`);
      if (release.release_allowed !== decision.release_allowed) fail(errors, "RELEASE_DECISION_RECORD_DRIFT", `${release.lesson_id}/release_allowed`);
    }
    if (JSON.stringify(release.canonical_section_ids) !== JSON.stringify(SECTION_IDS)) fail(errors, "SECTION_CONTRACT_DRIFT", `${release.lesson_id} does not use the ten canonical sections in canonical order.`);

    const lessonArtifacts = idx.records.PythonArtifact.filter((record) => record.lesson_id === release.lesson_id);
    const artifactIds = new Set(lessonArtifacts.map((record) => record.python_artifact_id));
    const lessonTraces = idx.records.VisualScenarioTrace.filter((record) => artifactIds.has(record.python_artifact_id));
    const lessonMarking = idx.records.MarkingChain.filter((record) => record.lesson_id === release.lesson_id);
    const lessonAssessments = idx.records.AssessmentItem.filter((record) => record.lesson_id === release.lesson_id);
    const expectedPatterns = [...new Set([
      ...lessonArtifacts.flatMap((record) => record.pattern_ids),
      ...lessonTraces.map((record) => record.pattern_id),
      ...lessonMarking.map((record) => record.pattern_id),
      ...lessonAssessments.flatMap((record) => record.pattern_ids),
    ])].sort();
    if (JSON.stringify(release.pattern_ids) !== JSON.stringify(expectedPatterns)) fail(errors, "RELEASE_PATTERN_JOIN", `${release.lesson_id} pattern set differs from code/trace/marking/assessment joins.`);
    if (JSON.stringify(release.marking_refs) !== JSON.stringify(lessonMarking.map((record) => record.marking_chain_id).sort())) fail(errors, "RELEASE_MARKING_EXACT_JOIN", release.lesson_id);
    const expectedPractice = lessonAssessments.filter((record) => record.level !== "retrieval").map((record) => record.assessment_item_id).sort();
    const expectedRetrieval = lessonAssessments.filter((record) => record.level === "retrieval").map((record) => record.assessment_item_id).sort();
    if (JSON.stringify(release.practice_refs) !== JSON.stringify(expectedPractice) || JSON.stringify(release.retrieval_refs) !== JSON.stringify(expectedRetrieval)) fail(errors, "RELEASE_ASSESSMENT_EXACT_JOIN", release.lesson_id);

    const allowedObjectives = new Set(sourceLesson?.objective_refs.map((ref) => ref.objective_id));
    const allowedBooks = new Set(sourceLesson?.book_refs.map((ref) => ref.section_id));
    for (const id of release.knowledge_unit_ids) {
      const unit = idx.knowledgeById.get(id);
      if (!unit) continue;
      if (unit.objective_refs.some((ref) => !allowedObjectives.has(ref.objective_id))) fail(errors, "KNOWLEDGE_OBJECTIVE_SOURCE_DRIFT", id);
      if (unit.book_refs.some((ref) => !allowedBooks.has(ref.section_id))) fail(errors, "KNOWLEDGE_BOOK_SOURCE_DRIFT", id);
    }
    if (/\b[A-Z]:\\|file:\/\/|A_Level_CS_page|planning\/paper4/i.test(JSON.stringify(release.source_refs))) fail(errors, "PUBLIC_SOURCE_PATH_LEAK", release.lesson_id);
  }

  const patternIds = new Set(idx.records.MarkingChain.map((record) => record.pattern_id));
  const tracePatternIds = new Set(idx.records.VisualScenarioTrace.map((record) => record.pattern_id));
  if (patternIds.size !== 58 || tracePatternIds.size !== 58 || [...patternIds].some((id) => !tracePatternIds.has(id))) fail(errors, "PATTERN_EXACT_SET", `Marking/trace pattern counts: ${patternIds.size}/${tracePatternIds.size}.`);
  for (const patternId of patternIds) {
    const cases = idx.records.VisualScenarioTrace.filter((record) => record.pattern_id === patternId).map((record) => record.case_kind).sort();
    if (JSON.stringify(cases) !== JSON.stringify(["boundary", "failure", "normal"])) fail(errors, "PATTERN_SCENARIO_COVERAGE", `${patternId}: ${cases.join(",")}`);
  }

  const gapAssessments = idx.records.AssessmentItem.filter((record) => record.self_rubric?.pattern_authority === "AlgoCore_representational_workflow_only");
  const p4r9CapstoneId = "ac-9618-p4-2026-python.lesson.exam-workflow.practice.p4r9-dsa-capstone";
  const approvedRepresentationalAssessments = gapAssessments.filter((record) => GAP_LESSON_IDS.has(record.lesson_id) || record.assessment_item_id === p4r9CapstoneId);
  if (gapAssessments.length !== 19 || approvedRepresentationalAssessments.length !== 19 || gapAssessments.filter((record) => record.assessment_item_id === p4r9CapstoneId).length !== 1) fail(errors, "GAP_ASSESSMENT_EXACT_SET", `Expected 18 gap assessments plus one P4R-9 cross-owner capstone; found ${gapAssessments.length}.`);
  for (const item of gapAssessments) {
    if (item.self_rubric?.authority !== "AlgoCore_authored_rubric" || item.self_rubric?.official_marks !== null) fail(errors, "GAP_AUTHORITY_INVALID", item.assessment_item_id);
  }
  for (const lessonId of GAP_LESSON_IDS) {
    const artifactIds = new Set(idx.records.PythonArtifact.filter((record) => record.lesson_id === lessonId).map((record) => record.python_artifact_id));
    if (idx.records.MarkingChain.some((record) => record.lesson_id === lessonId)) fail(errors, "GAP_CAMBRIDGE_MARKING_CLAIM", lessonId);
    if (idx.records.VisualScenarioTrace.some((record) => artifactIds.has(record.python_artifact_id))) fail(errors, "GAP_OFFICIAL_TRACE_OWNERSHIP", lessonId);
  }
  return errors;
}

async function filesystemEvidenceErrors(documents, evidenceRecords) {
  const errors = [];
  const { records } = indexDocuments(documents);
  const evidenceById = new Map(evidenceRecords.map((record) => [record.evidence_id, record]));
  for (const artifact of records.PythonArtifact) {
    const sourcePath = path.resolve(ROOT, artifact.filename);
    if (!sourcePath.startsWith(`${ROOT}${path.sep}`) || !existsSync(sourcePath)) {
      fail(errors, "PYTHON_SOURCE_UNRESOLVED", `${artifact.python_artifact_id}: ${artifact.filename}`);
    } else {
      const source = (await readFile(sourcePath, "utf8")).replaceAll("\r\n", "\n");
      const canonical = artifact.lines.map((line) => line.text).join("\n");
      if (source !== canonical || sha256(canonical) !== artifact.code_sha256) fail(errors, "PYTHON_SOURCE_HASH_DRIFT", artifact.python_artifact_id);
    }
    const fixtureRoot = path.join(path.dirname(sourcePath), "fixtures");
    for (const fixture of artifact.fixtures) {
      const fixturePath = path.join(fixtureRoot, `${fixture.case_kind}.json`);
      if (!existsSync(fixturePath)) {
        fail(errors, "FIXTURE_FILE_UNRESOLVED", `${artifact.python_artifact_id}/${fixture.case_kind}`);
        continue;
      }
      const input = await readJson(fixturePath);
      if (JSON.stringify(input) !== JSON.stringify(fixture.input)) fail(errors, "FIXTURE_INPUT_DRIFT", `${artifact.python_artifact_id}/${fixture.fixture_id}`);
      for (const [key, value] of Object.entries(input)) {
        if (key.endsWith("_file") && typeof value === "string") {
          const auxiliary = path.resolve(fixtureRoot, value);
          if (!auxiliary.startsWith(`${fixtureRoot}${path.sep}`) || !existsSync(auxiliary)) fail(errors, "FIXTURE_AUXILIARY_UNRESOLVED", `${fixture.fixture_id}/${value}`);
        }
      }
    }
    for (const evidenceId of [artifact.author_run_ref, artifact.independent_rerun_ref]) {
      const resolver = evidenceById.get(evidenceId);
      if (!resolver) continue;
      const evidencePath = path.resolve(WORKSPACE_ROOT, resolver.evidence_file);
      if (!evidencePath.startsWith(`${WORKSPACE_ROOT}${path.sep}`) || !existsSync(evidencePath)) fail(errors, "EXECUTION_EVIDENCE_FILE_UNRESOLVED", evidenceId);
      else if (sha256(await readFile(evidencePath)) !== resolver.evidence_file_sha256) fail(errors, "EXECUTION_EVIDENCE_FILE_HASH_DRIFT", evidenceId);
    }
  }
  return errors;
}

function validationCodes(documents, sourceMap, evidenceRecords, releaseDecisionManifest) {
  return [
    ...validateRegistry(documents).map((error) => error.code),
    ...fullCrossErrors(documents, sourceMap, evidenceRecords, releaseDecisionManifest).map((error) => error.code),
  ];
}

function mutationResults(documents, sourceMap, evidenceRecords, releaseDecisionManifest) {
  const tests = [];
  const run = (id, mutate, expectedCode) => {
    const candidate = clone(documents);
    const decisions = clone(releaseDecisionManifest);
    mutate(candidate, decisions);
    const codes = new Set(validationCodes(candidate, sourceMap, evidenceRecords, decisions));
    tests.push({ mutation_id: id, expected_code: expectedCode, rejected: codes.has(expectedCode), actual_codes: [...codes].sort() });
  };
  run("unknown-active-line", (items) => { items.find((item) => item.artifact_type === "VisualEventBinding").record.active_line_ids = ["unknown.v1.L999"]; }, "LINE_BINDING_INVALID");
  run("stale-expected-output", (items) => { items.find((item) => item.artifact_type === "VisualScenarioTrace").record.expected_output_ref = "unknown.expected-output"; }, "TRACE_OUTPUT_UNRESOLVED");
  run("cross-lesson-knowledge", (items) => {
    const releases = items.filter((item) => item.artifact_type === "LessonReleaseRecord");
    releases[0].record.knowledge_unit_ids = [releases[1].record.knowledge_unit_ids[0]];
  }, "RELEASE_KNOWLEDGE_JOIN_INVALID");
  run("unknown-execution-evidence", (items) => { items.find((item) => item.artifact_type === "VisualScenarioTrace").record.execution_evidence_ref = "unknown.execution-evidence"; }, "EXECUTION_EVIDENCE_UNRESOLVED");
  run("source-locator-removed", (items) => { items.find((item) => item.artifact_type === "LessonReleaseRecord").record.source_refs[0].locator = { source_id: "syllabus_2026_v2" }; }, "SOURCE_LOCATOR_UNRESOLVED");
  run("premature-release", (items) => {
    const record = items.find((item) => item.artifact_type === "LessonReleaseRecord").record;
    record.lead_gate = "PENDING";
    record.release_allowed = true;
  }, "PREMATURE_RELEASE_ALLOWED");
  run("release-decision-missing-lesson", (_items, decisions) => { decisions.lessons.pop(); }, "RELEASE_DECISION_EXACT_SET");
  run("release-decision-unknown-evidence", (_items, decisions) => { decisions.lessons[0].evidence_refs.lead_gate = ["unknown.release-evidence"]; }, "RELEASE_EVIDENCE_REF_UNRESOLVED");
  run("release-decision-record-drift", (items) => {
    const record = items.find((item) => item.artifact_type === "LessonReleaseRecord").record;
    record.ux_review = record.ux_review === "PASS" ? "PENDING" : "PASS";
  }, "RELEASE_DECISION_RECORD_DRIFT");
  run("release-evidence-status-drift", (items, decisions) => {
    const targetDecision = decisions.lessons[0];
    const targetRecord = items.find((item) => item.artifact_type === "LessonReleaseRecord" && item.record.lesson_id === targetDecision.lesson_id).record;
    targetDecision.lead_gate = targetRecord.lead_gate = targetDecision.lead_gate === "PASS" ? "PENDING" : "PASS";
    const releaseAllowed = RELEASE_STATUS_FIELDS.every((field) => targetDecision[field] === "PASS");
    targetDecision.release_allowed = targetRecord.release_allowed = releaseAllowed;
  }, "RELEASE_EVIDENCE_STATUS_MISMATCH");
  run("gap-official-marks", (items) => {
    const item = items.find((entry) => entry.artifact_type === "AssessmentItem" && entry.record.self_rubric?.pattern_authority === "AlgoCore_representational_workflow_only");
    item.record.self_rubric.official_marks = 1;
  }, "GAP_AUTHORITY_INVALID");
  return tests;
}

async function snapshotGenerated() {
  const snapshot = new Map();
  for (const filename of (await readdir(RECORD_ROOT)).sort()) snapshot.set(filename, sha256(await readFile(path.join(RECORD_ROOT, filename))));
  return snapshot;
}

async function main() {
  const before = await snapshotGenerated();
  const first = await compileFullRegistry();
  const second = await compileFullRegistry();
  const expectedFiles = renderRegistryFiles(first.grouped);
  const secondFiles = renderRegistryFiles(second.grouped);
  const expectedDigest = registryDigest(expectedFiles);
  const documents = RECORD_TYPES.flatMap((type) => first.grouped[type]);
  const resolvers = await Promise.all(RESOLVER_FILES.map(readJson));
  const evidenceRecords = resolvers.flatMap((resolver) => resolver.records);
  const errors = validateRegistry(documents).map((error) => ({ code: `REGISTRY_${error.code}`, detail: JSON.stringify(error) }));
  errors.push(...fullCrossErrors(documents, first.sourceMap, evidenceRecords, first.releaseDecisionManifest));
  errors.push(...await filesystemEvidenceErrors(documents, evidenceRecords));
  errors.push(...await releaseEvidenceFileErrors(first.releaseDecisionManifest));
  if (JSON.stringify(expectedFiles) !== JSON.stringify(secondFiles)) fail(errors, "NONDETERMINISTIC_COMPILE", "Two in-memory rebuilds were not byte-identical.");

  const expectedNames = new Set([...Object.values(TYPE_FILES), "SHA256SUMS.txt"]);
  for (const filename of before.keys()) if (!expectedNames.has(filename)) fail(errors, "UNEXPECTED_GENERATED_FILE", filename);
  for (const [filename, value] of Object.entries(expectedFiles)) {
    const target = path.join(RECORD_ROOT, filename);
    if (!existsSync(target)) fail(errors, "GENERATED_FILE_MISSING", filename);
    else if (await readFile(target, "utf8") !== value) fail(errors, "GENERATED_FILE_DRIFT", filename);
  }
  const actualManifest = existsSync(path.join(RECORD_ROOT, "SHA256SUMS.txt")) ? await readFile(path.join(RECORD_ROOT, "SHA256SUMS.txt"), "utf8") : "";
  if (actualManifest !== hashManifest(expectedDigest)) fail(errors, "HASH_MANIFEST_DRIFT", "SHA256SUMS.txt differs from deterministic build.");

  const mutations = mutationResults(documents, first.sourceMap, evidenceRecords, first.releaseDecisionManifest);
  for (const mutation of mutations) if (!mutation.rejected) fail(errors, "NEGATIVE_MUTATION_NOT_REJECTED", `${mutation.mutation_id}: expected ${mutation.expected_code}.`);
  const after = await snapshotGenerated();
  if (JSON.stringify([...before]) !== JSON.stringify([...after])) fail(errors, "READ_ONLY_CHECK_MUTATED_OUTPUT", "Checker changed generated registry files.");

  const { records } = indexDocuments(documents);
  const result = {
    schema_version: "paper4-p4r5-a4-check-v1",
    decision: errors.length ? "FAIL" : "PASS",
    checker_mode: "READ_ONLY",
    runtime: process.version,
    target_release: "paper4-2026-s9-v2",
    counts: Object.fromEntries(RECORD_TYPES.map((type) => [type, records[type].length])),
    total_records: documents.length,
    exact_sets: {
      packages: new Set(records.LessonReleaseRecord.map((record) => record.package_id)).size,
      lessons: records.LessonReleaseRecord.length,
      patterns: new Set(records.MarkingChain.map((record) => record.pattern_id)).size,
      scenarios: records.VisualScenarioTrace.length,
      events: records.VisualEventBinding.length,
      gap_assessments: records.AssessmentItem.filter((record) => record.self_rubric?.pattern_authority === "AlgoCore_representational_workflow_only").length,
      pending_lead_gates: records.LessonReleaseRecord.filter((record) => record.lead_gate === "PENDING").length,
      pending_academic_reviews: records.LessonReleaseRecord.filter((record) => record.academic_review === "PENDING").length,
      pending_execution_reviews: records.LessonReleaseRecord.filter((record) => record.execution_review === "PENDING").length,
      pending_ux_reviews: records.LessonReleaseRecord.filter((record) => record.ux_review === "PENDING").length,
      release_allowed_true: records.LessonReleaseRecord.filter((record) => record.release_allowed === true).length,
    },
    resolution_counts: {
      python_source_hashes: records.PythonArtifact.length,
      fixtures: records.PythonArtifact.reduce((sum, record) => sum + record.fixtures.length, 0),
      expected_outputs: records.PythonArtifact.reduce((sum, record) => sum + record.expected_outputs.length, 0),
      execution_evidence_refs: records.PythonArtifact.length * 2,
      trace_artifact_fixture_output_evidence_joins: records.VisualScenarioTrace.length,
      event_line_ids: records.VisualEventBinding.reduce((sum, record) => sum + record.active_line_ids.length, 0),
      knowledge_objective_refs: records.KnowledgeUnit.reduce((sum, record) => sum + record.objective_refs.length, 0),
      knowledge_book_refs: records.KnowledgeUnit.reduce((sum, record) => sum + record.book_refs.length, 0),
      release_source_refs: records.LessonReleaseRecord.reduce((sum, record) => sum + record.source_refs.length, 0),
    },
    deterministic_rebuild: JSON.stringify(expectedFiles) === JSON.stringify(secondFiles) ? "PASS_BYTE_IDENTICAL" : "FAIL",
    registry_aggregate_sha256: expectedDigest.aggregate,
    mutation_tests: mutations,
    errors,
  };
  console.log(`${JSON.stringify(result, null, 2)}\n`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
