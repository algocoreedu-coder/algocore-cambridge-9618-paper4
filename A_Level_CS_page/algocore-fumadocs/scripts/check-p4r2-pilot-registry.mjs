import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateRegistry } from "./check-paper4-v2-schema.mjs";
import {
  EXPECTED_COUNTS,
  PILOT_SLUGS,
  RECORD_TYPES,
  SECTION_IDS,
  compilePilotRegistry,
  registryDigest,
  renderRegistryFiles,
} from "./build-p4r2-pilot-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_ROOT = path.join(ROOT, "content", "paper4");
const RECORD_ROOT = path.join(CONTENT_ROOT, "records", "pilot");
const PLANNING_ROOT = path.resolve(ROOT, "..", "planning", "paper4", "next-phase");
const WORKSPACE_ROOT = path.resolve(ROOT, "..", "..");
const EVIDENCE_RESOLVER = path.join(PLANNING_ROOT, "evidence", "p4r-2", "a3", "EVIDENCE_RESOLVER.json");
const TYPE_FILES = {
  KnowledgeUnit: "knowledge-units.json",
  PythonArtifact: "python-artifacts.json",
  VisualScenarioTrace: "visual-scenario-traces.json",
  VisualEventBinding: "visual-event-bindings.json",
  MarkingChain: "marking-chains.json",
  AssessmentItem: "assessment-items.json",
  LessonReleaseRecord: "lesson-release-records.json",
};

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const fail = (errors, code, detail) => errors.push({ code, detail });
const lessonId = (slug) => `ac-9618-p4-2026-python.lesson.${slug}`;

function indexDocuments(documents) {
  const records = Object.fromEntries(RECORD_TYPES.map((type) => [type, documents.filter((item) => item.artifact_type === type).map((item) => item.record)]));
  return {
    records,
    knowledgeById: new Map(records.KnowledgeUnit.map((record) => [record.knowledge_unit_id, record])),
    pythonById: new Map(records.PythonArtifact.map((record) => [record.python_artifact_id, record])),
    tracesById: new Map(records.VisualScenarioTrace.map((record) => [record.trace_id, record])),
    eventsById: new Map(records.VisualEventBinding.map((record) => [record.event_id, record])),
    markingById: new Map(records.MarkingChain.map((record) => [record.marking_chain_id, record])),
    assessmentById: new Map(records.AssessmentItem.map((record) => [record.assessment_item_id, record])),
  };
}

function crossDocumentErrors(documents, sourceMap, executionResolver) {
  const errors = [];
  const idx = indexDocuments(documents);
  const expectedLessons = new Set(PILOT_SLUGS.map(lessonId));
  const releaseByLesson = new Map(idx.records.LessonReleaseRecord.map((record) => [record.lesson_id, record]));
  const sourceByLesson = new Map(sourceMap.lessons.filter((lesson) => expectedLessons.has(lesson.lesson_id)).map((lesson) => [lesson.lesson_id, lesson]));
  const evidenceById = new Map(executionResolver.records.map((record) => [record.evidence_id, record]));

  for (const type of RECORD_TYPES) {
    if (idx.records[type].length !== EXPECTED_COUNTS[type]) fail(errors, "EXACT_COUNT", `${type}: expected ${EXPECTED_COUNTS[type]}, found ${idx.records[type].length}.`);
    if (documents.some((item) => item.artifact_type === type && Object.hasOwn(item.record, "schema_exception"))) fail(errors, "SCHEMA_EXCEPTION", `${type} contains a per-record schema exception.`);
  }
  if (releaseByLesson.size !== expectedLessons.size || [...expectedLessons].some((id) => !releaseByLesson.has(id))) fail(errors, "LESSON_EXACT_SET", "LessonReleaseRecord lesson set does not equal the six pilot lessons.");

  for (const artifact of idx.records.PythonArtifact) {
    const resolverRecords = [artifact.author_run_ref, artifact.independent_rerun_ref].map((id) => evidenceById.get(id));
    if (resolverRecords.some((record) => !record)) {
      fail(errors, "EXECUTION_RESOLVER_JOIN", `${artifact.python_artifact_id} has an unresolved author/independent evidence ID.`);
      continue;
    }
    for (const record of resolverRecords) {
      if (record.python_artifact_id !== artifact.python_artifact_id || record.lesson_id !== artifact.lesson_id || record.code_sha256 !== artifact.code_sha256 || record.execution_log_sha256 !== artifact.execution_log_sha256) {
        fail(errors, "EXECUTION_RESOLVER_DRIFT", `${record.evidence_id} does not match ${artifact.python_artifact_id}.`);
      }
    }
  }

  for (const release of idx.records.LessonReleaseRecord) {
    const sourceLesson = sourceByLesson.get(release.lesson_id);
    if (!sourceLesson || release.package_id !== sourceLesson.package_id || release.slug !== sourceLesson.slug) fail(errors, "RELEASE_IDENTITY_DRIFT", `${release.lesson_id} package/slug does not match the source map.`);
    if (release.lead_gate !== "PENDING") fail(errors, "PREMATURE_LEAD_GATE", `${release.lesson_id} must remain PENDING until A8 and Lead sign the pilot gate.`);
    if (JSON.stringify(release.canonical_section_ids) !== JSON.stringify(SECTION_IDS)) fail(errors, "SECTION_CONTRACT_DRIFT", `${release.lesson_id} does not use the exact ten canonical sections.`);

    const lessonTraces = idx.records.VisualScenarioTrace.filter((record) => idx.pythonById.get(record.python_artifact_id)?.lesson_id === release.lesson_id);
    const expectedPatterns = [...new Set([
      ...release.python_artifact_ids.flatMap((id) => idx.pythonById.get(id)?.pattern_ids ?? []),
      ...lessonTraces.map((record) => record.pattern_id),
      ...release.marking_refs.map((id) => idx.markingById.get(id)?.pattern_id).filter(Boolean),
    ])].sort();
    if (JSON.stringify(release.pattern_ids) !== JSON.stringify(expectedPatterns)) fail(errors, "RELEASE_PATTERN_JOIN", `${release.lesson_id} pattern set does not equal code/trace/marking patterns.`);

    const marking = release.marking_refs.map((id) => idx.markingById.get(id)).filter(Boolean);
    const expectedMethods = [...new Set(marking.flatMap((record) => record.method_step_refs))].sort();
    const expectedErrors = [...new Set(marking.map((record) => record.error_ref))].sort();
    if (JSON.stringify(release.method_refs) !== JSON.stringify(expectedMethods)) fail(errors, "METHOD_REF_UNRESOLVED", `${release.lesson_id} method refs do not resolve exactly to its marking chains.`);
    if (JSON.stringify(release.error_refs) !== JSON.stringify(expectedErrors)) fail(errors, "ERROR_REF_UNRESOLVED", `${release.lesson_id} error refs do not resolve exactly to its marking chains.`);
    for (const id of release.retrieval_refs) {
      const item = idx.assessmentById.get(id);
      if (!item || item.lesson_id !== release.lesson_id || item.level !== "retrieval") fail(errors, "RETRIEVAL_REF_UNRESOLVED", `${release.lesson_id} retrieval ref ${id} is invalid.`);
    }

    const allowedObjectives = new Set(sourceLesson?.objective_refs.map((ref) => ref.objective_id));
    const allowedBooks = new Set(sourceLesson?.book_refs.map((ref) => ref.section_id));
    for (const id of release.knowledge_unit_ids) {
      const unit = idx.knowledgeById.get(id);
      if (!unit) continue;
      if (unit.objective_refs.some((ref) => !allowedObjectives.has(ref.objective_id))) fail(errors, "KNOWLEDGE_OBJECTIVE_SOURCE_DRIFT", `${id} uses an objective outside its lesson source map.`);
      if (unit.book_refs.some((ref) => !allowedBooks.has(ref.section_id))) fail(errors, "KNOWLEDGE_BOOK_SOURCE_DRIFT", `${id} uses a coursebook section outside its lesson source map.`);
    }
    const serializedSources = JSON.stringify(release.source_refs);
    if (/\b[A-Z]:\\|file:\/\/|A_Level_CS_page|planning\/paper4/i.test(serializedSources)) fail(errors, "PUBLIC_SOURCE_PATH_LEAK", `${release.lesson_id} source refs expose a local path.`);
  }

  for (const event of idx.records.VisualEventBinding) {
    const access = event.accessibility;
    if (!access?.accessible_label?.vi || !access?.accessible_label?.en || !access?.action_description?.vi || !access?.action_description?.en || !access?.keyboard_instruction?.vi || !access?.keyboard_instruction?.en || !access?.focus_target || !access?.live_status?.message?.vi || !access?.live_status?.message?.en) {
      fail(errors, "ACCESSIBILITY_METADATA_UNRESOLVED", `${event.event_id} lacks complete VI/EN accessibility metadata.`);
    }
  }
  for (const item of idx.records.AssessmentItem) {
    if (!item.expected_artifact?.vi || !item.expected_artifact?.en) fail(errors, "EXPECTED_ARTIFACT_LOCALE_MISSING", `${item.assessment_item_id} expected_artifact is not bilingual.`);
  }
  return errors;
}

function mutationResults(documents) {
  const tests = [];
  const run = (id, mutate, expectedCode) => {
    const candidate = clone(documents);
    mutate(candidate);
    const codes = new Set(validateRegistry(candidate).map((error) => error.code));
    tests.push({ mutation_id: id, expected_code: expectedCode, rejected: codes.has(expectedCode), actual_codes: [...codes].sort() });
  };
  run("unknown-active-line", (items) => {
    items.find((item) => item.artifact_type === "VisualEventBinding").record.active_line_ids = ["unknown.v1.L999"];
  }, "LINE_BINDING_INVALID");
  run("stale-expected-output", (items) => {
    items.find((item) => item.artifact_type === "VisualScenarioTrace").record.expected_output_ref = "unknown.expected-output";
  }, "TRACE_OUTPUT_UNRESOLVED");
  run("cross-lesson-knowledge", (items) => {
    const releases = items.filter((item) => item.artifact_type === "LessonReleaseRecord");
    releases[0].record.knowledge_unit_ids = [releases[1].record.knowledge_unit_ids[0]];
  }, "RELEASE_KNOWLEDGE_JOIN_INVALID");
  run("unknown-execution-evidence", (items) => {
    items.find((item) => item.artifact_type === "VisualScenarioTrace").record.execution_evidence_ref = "unknown.execution-evidence";
  }, "EXECUTION_EVIDENCE_UNRESOLVED");
  run("source-locator-removed", (items) => {
    items.find((item) => item.artifact_type === "LessonReleaseRecord").record.source_refs[0].locator = { source_id: "syllabus_2026_v2" };
  }, "SOURCE_LOCATOR_UNRESOLVED");
  return tests;
}

async function filesystemEvidenceErrors(documents, executionResolver) {
  const errors = [];
  const { records } = indexDocuments(documents);
  const evidenceById = new Map(executionResolver.records.map((record) => [record.evidence_id, record]));
  for (const artifact of records.PythonArtifact) {
    const sourcePath = path.resolve(ROOT, artifact.filename);
    if (!sourcePath.startsWith(`${ROOT}${path.sep}`) || !existsSync(sourcePath)) {
      fail(errors, "PYTHON_SOURCE_UNRESOLVED", `${artifact.python_artifact_id}: ${artifact.filename}`);
    } else {
      const source = (await readFile(sourcePath, "utf8")).replaceAll("\r\n", "\n");
      const canonical = artifact.lines.map((line) => line.text).join("\n");
      if (source !== canonical || sha256(canonical) !== artifact.code_sha256) fail(errors, "PYTHON_SOURCE_HASH_DRIFT", artifact.python_artifact_id);
    }
    const slug = PILOT_SLUGS.find((candidate) => artifact.lesson_id === lessonId(candidate));
    for (const fixture of artifact.fixtures) {
      const fixturePath = path.join(CONTENT_ROOT, "python", "pilot", slug ?? "", "fixtures", `${fixture.case_kind}.json`);
      if (!existsSync(fixturePath)) {
        fail(errors, "FIXTURE_FILE_UNRESOLVED", `${artifact.python_artifact_id}/${fixture.case_kind}`);
        continue;
      }
      const input = await readJson(fixturePath);
      if (JSON.stringify(input) !== JSON.stringify(fixture.input)) fail(errors, "FIXTURE_INPUT_DRIFT", `${artifact.python_artifact_id}/${fixture.fixture_id}`);
      for (const [key, value] of Object.entries(input)) {
        if (key.endsWith("_file") && typeof value === "string") {
          const auxiliary = path.resolve(path.dirname(fixturePath), value);
          if (!auxiliary.startsWith(`${path.dirname(fixturePath)}${path.sep}`) || !existsSync(auxiliary)) fail(errors, "FIXTURE_AUXILIARY_UNRESOLVED", `${fixture.fixture_id}/${value}`);
        }
      }
    }
    for (const evidenceId of [artifact.author_run_ref, artifact.independent_rerun_ref]) {
      const resolver = evidenceById.get(evidenceId);
      if (!resolver) continue;
      const evidencePath = path.resolve(WORKSPACE_ROOT, resolver.evidence_file);
      if (!evidencePath.startsWith(`${WORKSPACE_ROOT}${path.sep}`) || !existsSync(evidencePath)) {
        fail(errors, "EXECUTION_EVIDENCE_FILE_UNRESOLVED", evidenceId);
      } else if (sha256(await readFile(evidencePath)) !== resolver.evidence_file_sha256) {
        fail(errors, "EXECUTION_EVIDENCE_FILE_HASH_DRIFT", evidenceId);
      }
    }
  }
  return errors;
}

async function main() {
  const before = new Map();
  const filesOnDisk = (await readdir(RECORD_ROOT)).sort();
  for (const filename of filesOnDisk) before.set(filename, sha256(await readFile(path.join(RECORD_ROOT, filename))));

  const { grouped, sourceMap } = await compilePilotRegistry();
  const expectedFiles = renderRegistryFiles(grouped);
  const expectedDigest = registryDigest(expectedFiles);
  const documents = RECORD_TYPES.flatMap((type) => grouped[type]);
  const executionResolver = await readJson(EVIDENCE_RESOLVER);
  const errors = validateRegistry(documents).map((error) => ({ code: `REGISTRY_${error.code}`, detail: JSON.stringify(error) }));
  errors.push(...crossDocumentErrors(documents, sourceMap, executionResolver));
  errors.push(...await filesystemEvidenceErrors(documents, executionResolver));

  const expectedNames = new Set([...Object.values(TYPE_FILES), "SHA256SUMS.txt"]);
  for (const filename of filesOnDisk) if (!expectedNames.has(filename)) fail(errors, "UNEXPECTED_GENERATED_FILE", filename);
  for (const [filename, expected] of Object.entries(expectedFiles)) {
    const target = path.join(RECORD_ROOT, filename);
    if (!existsSync(target)) fail(errors, "GENERATED_FILE_MISSING", filename);
    else if (await readFile(target, "utf8") !== expected) fail(errors, "GENERATED_FILE_DRIFT", filename);
  }
  const expectedHashText = Object.entries(expectedDigest.fileHashes).map(([filename, value]) => `${value}  ${filename}`).join("\n") + `\n${expectedDigest.aggregate}  REGISTRY-AGGREGATE\n`;
  const actualHashText = existsSync(path.join(RECORD_ROOT, "SHA256SUMS.txt")) ? await readFile(path.join(RECORD_ROOT, "SHA256SUMS.txt"), "utf8") : "";
  if (actualHashText !== expectedHashText) fail(errors, "HASH_MANIFEST_DRIFT", "SHA256SUMS.txt does not match the deterministic in-memory build.");

  const mutationTests = mutationResults(documents);
  for (const test of mutationTests) if (!test.rejected) fail(errors, "NEGATIVE_MUTATION_NOT_REJECTED", `${test.mutation_id} did not produce ${test.expected_code}.`);
  const after = new Map();
  for (const filename of filesOnDisk) after.set(filename, sha256(await readFile(path.join(RECORD_ROOT, filename))));
  if (JSON.stringify([...before]) !== JSON.stringify([...after])) fail(errors, "READ_ONLY_CHECK_MUTATED_OUTPUT", "Checker changed generated output files.");

  const { records } = indexDocuments(documents);
  const resolutionCounts = {
    python_source_hashes: records.PythonArtifact.length,
    fixtures: records.PythonArtifact.reduce((sum, record) => sum + record.fixtures.length, 0),
    expected_outputs: records.PythonArtifact.reduce((sum, record) => sum + record.expected_outputs.length, 0),
    execution_evidence_refs: records.PythonArtifact.length * 2,
    trace_artifact_fixture_output_evidence_joins: records.VisualScenarioTrace.length,
    event_line_ids: records.VisualEventBinding.reduce((sum, record) => sum + record.active_line_ids.length, 0),
    knowledge_objective_refs: records.KnowledgeUnit.reduce((sum, record) => sum + record.objective_refs.length, 0),
    knowledge_book_refs: records.KnowledgeUnit.reduce((sum, record) => sum + record.book_refs.length, 0),
    release_source_refs: records.LessonReleaseRecord.reduce((sum, record) => sum + record.source_refs.length, 0),
    pending_lead_gates: records.LessonReleaseRecord.filter((record) => record.lead_gate === "PENDING").length,
  };

  const result = {
    schema_version: "paper4-p4r2-a4-check-v1",
    decision: errors.length ? "FAIL" : "PASS",
    checker_mode: "READ_ONLY",
    target_release: "paper4-2026-s9-v2",
    lessons: PILOT_SLUGS.length,
    counts: Object.fromEntries(RECORD_TYPES.map((type) => [type, grouped[type].length])),
    total_records: documents.length,
    resolution_counts: resolutionCounts,
    registry_aggregate_sha256: expectedDigest.aggregate,
    mutation_tests: mutationTests,
    errors,
  };
  console.log(`${JSON.stringify(result, null, 2)}\n`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
