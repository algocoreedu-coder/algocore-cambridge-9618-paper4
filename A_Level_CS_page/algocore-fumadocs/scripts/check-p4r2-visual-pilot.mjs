import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateRegistry } from "./check-paper4-v2-schema.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_ROOT = path.resolve(ROOT, "../..");
const PYTHON_ROOT = path.join(ROOT, "content/paper4/python/pilot");
const VISUAL_ROOT = path.join(ROOT, "content/paper4/visuals/pilot");
const EVIDENCE_ROOT = path.join(
  WORKSPACE_ROOT,
  "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-2/a3",
);
const A5_EVIDENCE_ROOT = path.join(
  WORKSPACE_ROOT,
  "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-2/a5",
);
const SLUGS = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const CASES = ["normal", "boundary", "failure"];
const EXPECTED_PATTERNS = new Set([
  "ARRAY_APPEND", "DATA_RECORD", "DATA_STORAGE", "RANDOM_ARRAY", "BINARY_SEARCH",
  "QUEUE_DEQUEUE", "QUEUE_ENQUEUE", "QUEUE_INSPECT", "QUEUE_REDUCE", "QUEUE_SETUP",
  "ALGORITHM_REWRITE", "HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH", "HASH_SETUP",
  "FILE_READ_OBJECTS",
]);
const EVENT_VOCABULARY = new Set([
  "read", "write", "assign", "compare", "advance", "swap", "link", "unlink",
  "call", "return", "branch", "reject", "emit",
]);
const CONTRACT_TOKEN = /(?:^|[^A-Za-z0-9])(?:B\d+-[A-Z]|[A-Za-z0-9_-]+\.step\.|s6g\.event|placeholder|todo|contract-token)(?:[^A-Za-z0-9]|$)/i;

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nonEmptyObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
}

async function main() {
  const schema = await readJson(path.join(ROOT, "content/paper4/schema/paper4-v2.schema.json"));
  const allowedTraceKeys = new Set(Object.keys(schema.$defs.VisualScenarioTrace.properties));
  const allowedEventKeys = new Set(Object.keys(schema.$defs.VisualEventBinding.properties));
  const rerun = await readJson(path.join(EVIDENCE_ROOT, "INDEPENDENT_RERUN.json"));
  const resolver = await readJson(path.join(EVIDENCE_ROOT, "EVIDENCE_RESOLVER.json"));
  const lineMigration = await readJson(path.join(EVIDENCE_ROOT, "LINE_ID_MIGRATION.json"));
  const manifest = await readJson(path.join(A5_EVIDENCE_ROOT, "VISUAL_PILOT_MANIFEST.json"));
  const rerunByLesson = new Map(rerun.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const resolverById = new Map(resolver.records.map((record) => [record.evidence_id, record]));
  const migrationByLesson = new Map(lineMigration.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const documents = [];
  const visualDocuments = [];
  const artifacts = new Map();

  for (const slug of SLUGS) {
    const artifact = await readJson(path.join(PYTHON_ROOT, slug, "artifact.json"));
    const sourceBytes = await readFile(path.join(ROOT, artifact.filename));
    assert(artifact.code_sha256 === sha256(sourceBytes), `${slug}: canonical Python source hash is stale.`);
    assert(!artifact.lines.some((line) => CONTRACT_TOKEN.test(line.text)), `${slug}: canonical Python source contains a planning contract token.`);
    artifacts.set(artifact.python_artifact_id, artifact);
    documents.push({ schema_version: "2.0.0", artifact_type: "PythonArtifact", record: artifact });

    const visualPath = path.join(VISUAL_ROOT, slug, "visuals.json");
    const visualBytes = await readFile(visualPath);
    const visual = JSON.parse(visualBytes.toString("utf8"));
    const manifestEntry = manifest.lessons.find((item) => item.slug === slug);
    assert(manifestEntry, `${slug}: visual manifest entry is missing.`);
    assert(manifestEntry.sha256 === sha256(visualBytes), `${slug}: visual manifest hash is stale.`);
    assert(visual.lesson_id === artifact.lesson_id, `${slug}: visual lesson does not match Python artifact.`);
    assert(visual.python_artifact_ref === artifact.python_artifact_id, `${slug}: visual Python reference is stale.`);
    assert(visual.artifact_version === artifact.version, `${slug}: visual artifact version is stale.`);
    assert(visual.coverage_contracts.length === artifact.pattern_ids.length, `${slug}: expected one coverage contract per pattern.`);
    for (const contract of visual.coverage_contracts) {
      assert(artifact.pattern_ids.includes(contract.pattern_id), `${slug}: coverage contract has unknown pattern ${contract.pattern_id}.`);
      assert(same(contract.scenario_case_kinds, CASES), `${slug}/${contract.pattern_id}: coverage contract must name normal, boundary and failure.`);
      assert(Array.isArray(contract.focus_event_names) && contract.focus_event_names.length > 0, `${slug}/${contract.pattern_id}: pattern focus is empty.`);
    }
    visualDocuments.push({ slug, artifact, visual });
    documents.push(...visual.traces, ...visual.events);
  }

  const registryErrors = validateRegistry(documents);
  assert(registryErrors.length === 0, `validateRegistry rejected visual pilot:\n${JSON.stringify(registryErrors, null, 2)}`);

  const traces = visualDocuments.flatMap(({ visual }) => visual.traces);
  const events = visualDocuments.flatMap(({ visual }) => visual.events);
  assert(traces.length === 48, `Expected 48 traces; found ${traces.length}.`);
  const expectedEvents = visualDocuments.reduce((total, { artifact }) => {
    const evidence = rerunByLesson.get(artifact.lesson_id);
    return total + artifact.pattern_ids.length * evidence.cases.reduce((caseTotal, item) => caseTotal + item.result.trace.length, 0);
  }, 0);
  assert(events.length === expectedEvents, `Expected ${expectedEvents} events from the latest independent rerun; found ${events.length}.`);
  assert(same(manifest.counts, { lessons: 6, patterns: 16, scenarios: 48, events: expectedEvents }), "Visual manifest counts are stale.");
  const actualPatterns = new Set(traces.map((item) => item.record.pattern_id));
  assert(actualPatterns.size === EXPECTED_PATTERNS.size && [...EXPECTED_PATTERNS].every((id) => actualPatterns.has(id)), "Pilot pattern scope is not the exact 16-pattern set.");
  assert(new Set(traces.map((item) => item.record.trace_id)).size === traces.length, "Trace IDs are not unique.");
  assert(new Set(events.map((item) => item.record.event_id)).size === events.length, "Event IDs are not unique.");

  const eventById = new Map(events.map((item) => [item.record.event_id, item.record]));
  for (const { slug, artifact, visual } of visualDocuments) {
    const lineById = new Map(artifact.lines.map((line) => [line.line_id, line.text]));
    const evidence = rerunByLesson.get(artifact.lesson_id);
    const migration = migrationByLesson.get(artifact.lesson_id);
    assert(evidence, `${slug}: independent rerun lesson is unresolved.`);
    assert(migration, `${slug}: line-ID migration record is unresolved.`);
    const retiredLineIds = new Set(migration.retired_line_ids);
    const resolvedEvidence = resolverById.get(evidence.execution_evidence_id);
    assert(resolvedEvidence?.run_kind === "independent", `${slug}: trace evidence is not the independent rerun.`);
    assert(resolvedEvidence.python_artifact_id === artifact.python_artifact_id, `${slug}: evidence resolves to another artifact.`);
    assert(resolvedEvidence.code_sha256 === artifact.code_sha256, `${slug}: evidence code hash is stale.`);

    for (const pattern of artifact.pattern_ids) {
      const patternTraces = visual.traces.filter((item) => item.record.pattern_id === pattern);
      assert(patternTraces.length === 3, `${slug}/${pattern}: expected exactly three scenarios.`);
      assert(CASES.every((caseKind) => patternTraces.some((item) => item.record.case_kind === caseKind)), `${slug}/${pattern}: normal/boundary/failure coverage is incomplete.`);
      const caseSignatures = [];

      for (const envelope of patternTraces) {
        assert(Object.keys(envelope.record).every((key) => allowedTraceKeys.has(key)), `${envelope.record.trace_id}: trace has a field outside schema v2.`);
        const trace = envelope.record;
        const fixture = artifact.fixtures.find((item) => item.fixture_id === trace.fixture_ref);
        const output = artifact.expected_outputs.find((item) => item.expected_output_id === trace.expected_output_ref);
        const evidenceCase = evidence.cases.find((item) => item.case_kind === trace.case_kind);
        assert(fixture?.case_kind === trace.case_kind, `${trace.trace_id}: fixture case kind mismatch.`);
        assert(output?.fixture_ref === fixture.fixture_id, `${trace.trace_id}: output/fixture join mismatch.`);
        assert(same(output.value, evidenceCase.result), `${trace.trace_id}: expected output differs from independent rerun.`);
        assert(trace.execution_evidence_ref === evidence.execution_evidence_id, `${trace.trace_id}: execution evidence is not the independent rerun.`);
        assert(same(trace.initial_state.fixture_input, fixture.input), `${trace.trace_id}: initial state does not preserve fixture input.`);
        if (artifact.pattern_ids.length > 1) {
          assert(typeof trace.equivalence_justification === "string" && trace.equivalence_justification.includes("integrated"), `${trace.trace_id}: shared integrated trace lacks equivalence justification.`);
        }

        const traceEvents = trace.event_ids.map((id) => eventById.get(id));
        assert(traceEvents.every(Boolean), `${trace.trace_id}: event sequence contains an unresolved event.`);
        assert(traceEvents.length === evidenceCase.result.trace.length, `${trace.trace_id}: event count differs from executed trace.`);
        assert(same(traceEvents[0].before, trace.initial_state), `${trace.trace_id}: first before-state differs from initial_state.`);
        for (const [index, event] of traceEvents.entries()) {
          assert(Object.keys(event).every((key) => allowedEventKeys.has(key)), `${event.event_id}: event has a field outside schema v2.`);
          assert(event.sequence === index, `${event.event_id}: sequence is not contiguous from zero.`);
          assert(EVENT_VOCABULARY.has(event.event_type), `${event.event_id}: event_type is outside the controlled vocabulary.`);
          assert(event.active_line_ids.length > 0, `${event.event_id}: active_line_ids is empty.`);
          for (const lineId of event.active_line_ids) {
            assert(lineById.has(lineId), `${event.event_id}: line ${lineId} does not exist in the exact artifact version.`);
            assert(!retiredLineIds.has(lineId), `${event.event_id}: line ${lineId} is retired by LINE_ID_MIGRATION.`);
            assert(!CONTRACT_TOKEN.test(lineById.get(lineId)), `${event.event_id}: line ${lineId} binds to a planning contract token.`);
          }
          assert(nonEmptyObject(event.before), `${event.event_id}: before state is empty.`);
          assert(nonEmptyObject(event.delta), `${event.event_id}: delta is empty.`);
          assert(nonEmptyObject(event.after), `${event.event_id}: after state is empty.`);
          assert(nonEmptyObject(event.output_delta), `${event.event_id}: output_delta is empty.`);
          assert(!same(event.before, event.after), `${event.event_id}: before and after are identical.`);
          assert(same(event.delta.execution_trace_event, evidenceCase.result.trace[index]), `${event.event_id}: delta does not match independent rerun trace event ${index}.`);
          assert(same(event.output_delta.emitted_trace_event, evidenceCase.result.trace[index]), `${event.event_id}: output delta does not preserve the emitted trace event.`);
          if (index > 0) assert(same(event.before, traceEvents[index - 1].after), `${event.event_id}: state continuity is broken.`);
          assert(event.invariant_or_criterion.vi.trim() && event.invariant_or_criterion.en.trim() && event.prediction.vi.trim() && event.prediction.en.trim() && event.feedback.vi.trim() && event.feedback.en.trim(), `${event.event_id}: bilingual learning text is incomplete.`);
          const accessibility = event.accessibility;
          assert(accessibility.accessible_label.vi.trim() && accessibility.accessible_label.en.trim(), `${event.event_id}: accessible label is not bilingual.`);
          assert(accessibility.action_description.vi.trim() && accessibility.action_description.en.trim(), `${event.event_id}: action description is not bilingual.`);
          assert(accessibility.keyboard_instruction.vi.trim() && accessibility.keyboard_instruction.en.trim(), `${event.event_id}: keyboard instruction is not bilingual.`);
          assert(accessibility.focus_target.trim() && accessibility.focus_order === index, `${event.event_id}: focus target/order is invalid.`);
          assert(["off", "polite", "assertive"].includes(accessibility.live_status.mode), `${event.event_id}: live-status mode is invalid.`);
          assert(accessibility.live_status.message.vi.trim() && accessibility.live_status.message.en.trim(), `${event.event_id}: live-status message is not bilingual.`);
        }
        const finalEvent = traceEvents.at(-1);
        const expectedFinal = structuredClone(evidenceCase.result);
        delete expectedFinal.trace;
        assert(same(finalEvent.output_delta.final_result, expectedFinal), `${trace.trace_id}: final output delta differs from independent rerun result.`);
        caseSignatures.push(JSON.stringify(traceEvents.map((event) => [event.event_type, event.delta.execution_trace_event])));
      }
      assert(new Set(caseSignatures).size === 3, `${slug}/${pattern}: normal, boundary and failure event sequences are cloned.`);
    }
  }

  console.log(JSON.stringify({
    decision: "PASS",
    checker_mode: "READ_ONLY",
    validate_registry: "PASS",
    lessons: visualDocuments.length,
    patterns: actualPatterns.size,
    scenarios: traces.length,
    events: events.length,
    scenario_contract: "PASS_3_CASES_PER_PATTERN",
    execution_trace_join: `PASS_${events.length}_OF_${events.length}`,
    active_line_binding: `PASS_${events.length}_OF_${events.length}`,
    controlled_event_vocabulary: `PASS_${events.length}_OF_${events.length}`,
    bilingual_event_criteria: `PASS_${events.length}_OF_${events.length}`,
    accessibility_metadata: `PASS_${events.length}_OF_${events.length}`,
    meaningful_state_transitions: `PASS_${events.length}_OF_${events.length}`,
    no_contract_token_source: `PASS_${events.length}_OF_${events.length}`,
    retired_line_ids: "PASS_0_RETAINED",
    manifest_hashes: "PASS_6_OF_6",
    cloned_normal_boundary_failure_sequences: 0,
  }));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
