import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateRegistry } from "./check-paper4-v2-schema.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_ROOT = path.resolve(ROOT, "../..");
const PYTHON_ROOT = path.join(ROOT, "content/paper4/python/production");
const VISUAL_ROOT = path.join(ROOT, "content/paper4/visuals/production");
const EVIDENCE_ROOT = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-4/a5");
const A3_ROOT = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/a3");
const SCOPE_PATH = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/preflight/P4R3_SCOPE_INVENTORY.json");
const MIGRATION_PATH = path.join(ROOT, "content/paper4/mappings/visual-migration-inventory.json");
const CASES = ["normal", "boundary", "failure"];
const EVENT_VOCABULARY = new Set(["read", "write", "assign", "compare", "advance", "swap", "link", "unlink", "call", "return", "branch", "reject", "emit"]);
const CONTRACT_TOKEN = /(?:^|[^A-Za-z0-9])(?:B\d+-[A-Z]|[A-Za-z0-9_-]+\.step\.|s6g\.event|placeholder|todo|contract-token)(?:[^A-Za-z0-9]|$)/i;

async function readJson(filename) { return JSON.parse(await readFile(filename, "utf8")); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function nonEmptyObject(value) { return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0; }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }

async function main() {
  const [schema, scope, rerun, roleMap, migration, manifest, dispositions, bindingAudit] = await Promise.all([
    readJson(path.join(ROOT, "content/paper4/schema/paper4-v2.schema.json")),
    readJson(SCOPE_PATH),
    readJson(path.join(A3_ROOT, "INDEPENDENT_RERUN.json")),
    readJson(path.join(A3_ROOT, "LINE_ROLE_MAP.json")),
    readJson(MIGRATION_PATH),
    readJson(path.join(EVIDENCE_ROOT, "PRODUCTION_VISUAL_MANIFEST.json")),
    readJson(path.join(EVIDENCE_ROOT, "MIGRATION_DISPOSITION.json")),
    readJson(path.join(EVIDENCE_ROOT, "LINE_BINDING_AUDIT.json")),
  ]);
  const allowedTraceKeys = new Set(Object.keys(schema.$defs.VisualScenarioTrace.properties));
  const allowedEventKeys = new Set(Object.keys(schema.$defs.VisualEventBinding.properties));
  const allScopeSlugs = scope.lessons.map((lesson) => lesson.lesson_slug);
  const officialOwners = scope.lessons.filter((lesson) => lesson.pattern_ids.length > 0);
  const patternless = scope.lessons.filter((lesson) => lesson.pattern_ids.length === 0);
  const expectedPatterns = officialOwners.flatMap((lesson) => lesson.pattern_ids);
  assert(scope.scope.remaining_lesson_count === 20 && allScopeSlugs.length === 20, "P4R-3 scope no longer contains exactly 20 production lessons.");
  assert(expectedPatterns.length === 42 && new Set(expectedPatterns).size === 42, "Official visual scope is not exactly 42 unique patterns.");
  assert(patternless.length === 6, "Expected six patternless lessons with provisional associations.");

  const rerunByLesson = new Map(rerun.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const rolesByLesson = new Map(roleMap.lessons.map((lesson) => [lesson.lesson_id, new Set(lesson.roles.flatMap((role) => role.active_line_ids))]));
  const migrationByPattern = new Map(migration.patterns.map((item) => [item.pattern_id, item]));
  const visualDirs = (await readdir(VISUAL_ROOT, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert(same(visualDirs, officialOwners.map((item) => item.lesson_slug).sort()), "Visual production directories must be the exact 14 official pattern-owner lessons.");

  const documents = [];
  const artifactBySlug = new Map();
  for (const slug of allScopeSlugs) {
    const artifact = await readJson(path.join(PYTHON_ROOT, slug, "artifact.json"));
    artifactBySlug.set(slug, artifact);
    documents.push({ schema_version: "2.0.0", artifact_type: "PythonArtifact", record: artifact });
    assert(artifact.version === "production-v1", `${slug}: visual input must be production-v1.`);
    assert(rerunByLesson.has(artifact.lesson_id), `${slug}: independent rerun evidence missing.`);
    assert(rolesByLesson.has(artifact.lesson_id), `${slug}: LINE_ROLE_MAP evidence missing.`);
    assert(!artifact.lines.some((line) => CONTRACT_TOKEN.test(line.text)), `${slug}: artifact retains a planning token.`);
  }
  assert(artifactBySlug.size === 20, "Checker did not read all 20 production Python artifacts.");

  const visualBySlug = new Map();
  for (const owner of officialOwners) {
    const visual = await readJson(path.join(VISUAL_ROOT, owner.lesson_slug, "visuals.json"));
    visualBySlug.set(owner.lesson_slug, visual);
    documents.push(...visual.traces, ...visual.events);
    assert(visual.artifact_version === "production-v1", `${owner.lesson_slug}: stale visual artifact version.`);
    assert(same(visual.coverage_contracts.map((item) => item.pattern_id), owner.pattern_ids), `${owner.lesson_slug}: coverage contracts differ from official pattern ownership.`);
  }
  const registryErrors = validateRegistry(documents);
  assert(registryErrors.length === 0, `Schema/registry validation failed: ${JSON.stringify(registryErrors.slice(0, 10))}`);

  const traces = [...visualBySlug.values()].flatMap((visual) => visual.traces);
  const events = [...visualBySlug.values()].flatMap((visual) => visual.events);
  const eventById = new Map(events.map((item) => [item.record.event_id, item.record]));
  assert(traces.length === 126, `Expected 126 VisualScenarioTrace records; found ${traces.length}.`);
  assert(new Set(traces.map((item) => item.record.trace_id)).size === 126, "Trace IDs are not unique.");
  assert(new Set(events.map((item) => item.record.event_id)).size === events.length, "Event IDs are not unique.");
  assert(new Set(traces.map((item) => item.record.pattern_id)).size === 42, "Trace set does not cover exactly 42 patterns.");
  assert(expectedPatterns.every((pattern) => traces.some((item) => item.record.pattern_id === pattern)), "An official pattern is absent from visual traces.");

  let expectedEventCount = 0;
  for (const owner of officialOwners) {
    const slug = owner.lesson_slug;
    const artifact = artifactBySlug.get(slug);
    const visual = visualBySlug.get(slug);
    const evidence = rerunByLesson.get(artifact.lesson_id);
    const lineById = new Map(artifact.lines.map((line) => [line.line_id, line.text]));
    const roleLines = rolesByLesson.get(artifact.lesson_id);
    const evidenceByKind = new Map(evidence.cases.map((item) => [item.case_kind, item]));
    const fixtureByKind = new Map(artifact.fixtures.map((item) => [item.case_kind, item]));
    const outputByFixture = new Map(artifact.expected_outputs.map((item) => [item.fixture_ref, item]));
    expectedEventCount += owner.pattern_ids.length * evidence.cases.reduce((sum, item) => sum + item.result.trace.length, 0);
    for (const pattern of owner.pattern_ids) {
      const patternTraces = visual.traces.filter((item) => item.record.pattern_id === pattern);
      assert(patternTraces.length === 3, `${slug}/${pattern}: expected three scenarios.`);
      assert(CASES.every((caseKind) => patternTraces.some((item) => item.record.case_kind === caseKind)), `${slug}/${pattern}: normal/boundary/failure incomplete.`);
      const signatures = [];
      for (const envelope of patternTraces) {
        const trace = envelope.record;
        assert(Object.keys(trace).every((key) => allowedTraceKeys.has(key)), `${trace.trace_id}: trace contains an out-of-schema field.`);
        assert(trace.artifact_version === "production-v1" && trace.python_artifact_id === artifact.python_artifact_id, `${trace.trace_id}: artifact join is stale.`);
        assert(trace.equivalence_justification?.includes(pattern) && trace.equivalence_justification.includes(slug), `${trace.trace_id}: explicit reuse justification is missing.`);
        const evidenceCase = evidenceByKind.get(trace.case_kind);
        const fixture = fixtureByKind.get(trace.case_kind);
        const output = outputByFixture.get(fixture.fixture_id);
        assert(trace.fixture_ref === fixture.fixture_id && trace.expected_output_ref === output.expected_output_id, `${trace.trace_id}: fixture/output join is wrong.`);
        assert(same(output.value, evidenceCase.result), `${trace.trace_id}: expected output differs from rerun result.`);
        const traceEvents = trace.event_ids.map((id) => eventById.get(id));
        assert(traceEvents.every(Boolean), `${trace.trace_id}: unresolved event ID.`);
        assert(traceEvents.length === evidenceCase.result.trace.length, `${trace.trace_id}: event count differs from independent rerun.`);
        for (const [index, event] of traceEvents.entries()) {
          assert(Object.keys(event).every((key) => allowedEventKeys.has(key)), `${event.event_id}: event contains an out-of-schema field.`);
          assert(event.sequence === index, `${event.event_id}: sequence is not zero-based and contiguous.`);
          assert(EVENT_VOCABULARY.has(event.event_type), `${event.event_id}: uncontrolled event type.`);
          assert(event.active_line_ids.length > 0, `${event.event_id}: no active Python line.`);
          for (const lineId of event.active_line_ids) {
            assert(lineById.has(lineId), `${event.event_id}: ${lineId} is not in exact production-v1 artifact.`);
            assert(!CONTRACT_TOKEN.test(lineById.get(lineId)), `${event.event_id}: line binds a planning token.`);
          }
          const eventName = String(evidenceCase.result.trace[index].event ?? "state_change");
          const words = eventName.toLowerCase().split("_").filter((word) => word.length > 2);
          const meaningful = event.active_line_ids.some((lineId) => {
            const text = lineById.get(lineId).toLowerCase();
            return words.some((word) => text.includes(word)) || text.includes("trace.append") || /return\s+\{/.test(text) || roleLines.has(lineId);
          });
          assert(meaningful, `${event.event_id}: active lines have no event token, trace emission, return or semantic-role evidence.`);
          assert(nonEmptyObject(event.before) && nonEmptyObject(event.delta) && nonEmptyObject(event.after) && nonEmptyObject(event.output_delta), `${event.event_id}: state/output payload is empty.`);
          assert(!same(event.before, event.after), `${event.event_id}: before and after are identical.`);
          assert(same(event.delta.execution_trace_event, evidenceCase.result.trace[index]), `${event.event_id}: delta differs from rerun event.`);
          assert(same(event.output_delta.emitted_trace_event, evidenceCase.result.trace[index]), `${event.event_id}: output delta differs from rerun event.`);
          if (index === 0) assert(same(event.before, trace.initial_state), `${event.event_id}: first before state differs from trace initial_state.`);
          if (index > 0) assert(same(event.before, traceEvents[index - 1].after), `${event.event_id}: state continuity broken.`);
          if (index === traceEvents.length - 1) assert(same(event.output_delta.final_result, Object.fromEntries(Object.entries(evidenceCase.result).filter(([key]) => key !== "trace"))), `${event.event_id}: final result is incomplete.`);
          for (const field of [event.invariant_or_criterion, event.prediction, event.feedback, event.accessibility.accessible_label, event.accessibility.action_description, event.accessibility.keyboard_instruction, event.accessibility.live_status.message]) {
            assert(field.vi.trim() && field.en.trim(), `${event.event_id}: bilingual text/accessibility metadata incomplete.`);
          }
          assert(event.accessibility.focus_order === index && event.accessibility.focus_target, `${event.event_id}: focus metadata invalid.`);
          assert(["off", "polite", "assertive"].includes(event.accessibility.live_status.mode), `${event.event_id}: live status invalid.`);
        }
        signatures.push(JSON.stringify(traceEvents.map((event) => [event.event_type, event.delta.execution_trace_event])));
      }
      assert(new Set(signatures).size === 3, `${slug}/${pattern}: normal/boundary/failure execution sequences are cloned.`);
    }
  }
  assert(events.length === expectedEventCount, `Expected ${expectedEventCount} execution-derived events; found ${events.length}.`);
  assert(same(manifest.counts, { lessons: 14, patterns: 42, scenarios: 126, events: expectedEventCount }), "Production visual manifest counts are stale.");
  for (const file of manifest.files) {
    const bytes = await readFile(path.join(ROOT, file.path));
    assert(sha256(bytes) === file.sha256, `${file.path}: manifest SHA-256 mismatch.`);
  }

  const expectedLegacy = expectedPatterns.map((pattern) => migrationByPattern.get(pattern));
  assert(expectedLegacy.every(Boolean), "A remaining pattern is absent from the legacy migration inventory.");
  assert(dispositions.dispositions.length === 42, "Migration disposition must contain 42 pattern records.");
  assert(new Set(dispositions.dispositions.map((item) => item.pattern_id)).size === 42, "Migration disposition has duplicate patterns.");
  for (const item of dispositions.dispositions) {
    const legacy = migrationByPattern.get(item.pattern_id);
    assert(legacy && expectedPatterns.includes(item.pattern_id), `${item.pattern_id}: disposition is outside exact production scope.`);
    assert(same(item.legacy_scenario_ids, legacy.scenarios.map((entry) => entry.scenario_id)), `${item.pattern_id}: legacy scenarios not preserved exactly.`);
    assert(same(item.legacy_event_ids, legacy.events.map((entry) => entry.event_id)), `${item.pattern_id}: legacy events not preserved exactly.`);
    assert(item.replacement_trace_ids.length === 3, `${item.pattern_id}: replacement trace count is not three.`);
    const actualEventIds = traces.filter((trace) => trace.record.pattern_id === item.pattern_id).flatMap((trace) => trace.record.event_ids);
    assert(same(item.replacement_event_ids, actualEventIds), `${item.pattern_id}: replacement event disposition differs from canonical traces.`);
    assert(item.cloned_legacy_trace_resolved && item.non_python_tokens_rejected && item.placeholder_state_rejected, `${item.pattern_id}: legacy defects are not explicitly resolved.`);
  }
  const legacyScenarioCount = expectedLegacy.reduce((sum, item) => sum + item.scenarios.length, 0);
  const legacyEventCount = expectedLegacy.reduce((sum, item) => sum + item.events.length, 0);
  assert(same(dispositions.exact_scope, { patterns: 42, legacy_scenarios: legacyScenarioCount, legacy_events: legacyEventCount }), "Migration disposition exact counts are stale.");
  assert(bindingAudit.count === events.length && bindingAudit.bindings.length === events.length, "Line binding audit does not cover every production event.");

  const report = {
    schema_version: "paper4-p4r4-a5-independent-check-v1",
    authority: "READ_ONLY_A5_CHECK_NO_GATE_SIGNATURE",
    decision: "PASS",
    node_version: process.version,
    counts: {
      production_python_artifacts_read: artifactBySlug.size,
      official_pattern_owner_lessons: officialOwners.length,
      provisional_patternless_lessons_excluded: patternless.length,
      patterns: expectedPatterns.length,
      scenarios: traces.length,
      events: events.length,
      schema_registry_documents: documents.length,
      legacy_scenarios_dispositioned: legacyScenarioCount,
      legacy_events_dispositioned: legacyEventCount,
    },
    checks: {
      schema_registry: "PASS",
      independent_rerun_join: `PASS_${events.length}_OF_${events.length}`,
      exact_production_line_binding: `PASS_${events.length}_OF_${events.length}`,
      controlled_event_vocabulary: `PASS_${events.length}_OF_${events.length}`,
      meaningful_state_transition: `PASS_${events.length}_OF_${events.length}`,
      bilingual_learning_copy: `PASS_${events.length}_OF_${events.length}`,
      accessibility_metadata: `PASS_${events.length}_OF_${events.length}`,
      distinct_case_execution: "PASS_42_OF_42",
      migration_disposition: "PASS_42_OF_42",
      provisional_association_scope_control: "PASS_6_EXCLUDED",
    },
  };
  await writeFile(path.join(EVIDENCE_ROOT, `A5_INDEPENDENT_CHECK_${process.version.replaceAll(".", "_")}.json`), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report));
}

await main();
