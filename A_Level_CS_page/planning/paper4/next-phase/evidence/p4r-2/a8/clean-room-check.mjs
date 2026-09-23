import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CS_PAGE = path.resolve(HERE, "../../../../../..");
const APP = path.join(CS_PAGE, "algocore-fumadocs");
const RECORD_ROOT = path.join(APP, "content", "paper4", "records", "pilot");
const CONTENT_ROOT = path.join(APP, "content", "paper4");
const EVIDENCE_ROOT = path.resolve(HERE, "..");
const PYTHON = process.env.P4R2_PYTHON || "python";
const TARGET_COMMIT = "314af8acf1b508779a14dd5dd2627f4fcb8c24df";
const SLUGS = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const EXPECTED = {
  KnowledgeUnit: 26,
  PythonArtifact: 6,
  VisualScenarioTrace: 48,
  VisualEventBinding: 238,
  MarkingChain: 16,
  AssessmentItem: 18,
  LessonReleaseRecord: 6,
};
const TYPE_FILES = {
  KnowledgeUnit: "knowledge-units.json",
  PythonArtifact: "python-artifacts.json",
  VisualScenarioTrace: "visual-scenario-traces.json",
  VisualEventBinding: "visual-event-bindings.json",
  MarkingChain: "marking-chains.json",
  AssessmentItem: "assessment-items.json",
  LessonReleaseRecord: "lesson-release-records.json",
};
const ID_FIELDS = {
  KnowledgeUnit: "knowledge_unit_id",
  PythonArtifact: "python_artifact_id",
  VisualScenarioTrace: "trace_id",
  VisualEventBinding: "event_id",
  MarkingChain: "marking_chain_id",
  AssessmentItem: "assessment_item_id",
  LessonReleaseRecord: "lesson_id",
};

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const json = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const clone = (value) => structuredClone(value);
const stable = (value) => JSON.stringify(value);
const failures = [];
const fail = (code, detail) => failures.push({ code, detail });
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const bilingual = (value) => value && nonEmpty(value.vi) && nonEmpty(value.en) && value.vi.trim() !== value.en.trim();

async function loadRegistry() {
  const grouped = {};
  for (const [type, filename] of Object.entries(TYPE_FILES)) {
    grouped[type] = await json(path.join(RECORD_ROOT, filename));
    if (grouped[type].length !== EXPECTED[type]) fail("COUNT_MISMATCH", `${type}: ${grouped[type].length} != ${EXPECTED[type]}`);
    for (const envelope of grouped[type]) if (envelope.artifact_type !== type) fail("TYPE_MISMATCH", `${filename}: ${envelope.artifact_type}`);
    const ids = grouped[type].map((item) => item.record[ID_FIELDS[type]]);
    if (new Set(ids).size !== ids.length) fail("DUPLICATE_ID", type);
  }
  return grouped;
}

function indexes(grouped) {
  const map = (type) => new Map(grouped[type].map((item) => [item.record[ID_FIELDS[type]], item.record]));
  return {
    knowledge: map("KnowledgeUnit"),
    python: map("PythonArtifact"),
    trace: map("VisualScenarioTrace"),
    event: map("VisualEventBinding"),
    marking: map("MarkingChain"),
    assessment: map("AssessmentItem"),
    release: map("LessonReleaseRecord"),
  };
}

function completeLocator(locator) {
  return locator && nonEmpty(locator.source_id) && Number.isInteger(locator.pdf_page) && locator.pdf_page > 0 && nonEmpty(locator.heading) && nonEmpty(locator.anchor_text);
}

function joinErrors(grouped, evidenceIds) {
  const errors = [];
  const add = (code, detail) => errors.push({ code, detail });
  const idx = indexes(grouped);
  const lineSets = new Map([...idx.python].map(([id, artifact]) => [id, new Set(artifact.lines.map((line) => line.line_id))]));
  const fixtureSets = new Map([...idx.python].map(([id, artifact]) => [id, new Set(artifact.fixtures.map((fixture) => fixture.fixture_id))]));
  const outputSets = new Map([...idx.python].map(([id, artifact]) => [id, new Set(artifact.expected_outputs.map((output) => output.expected_output_id))]));
  const patternsByLesson = new Map();
  for (const chain of idx.marking.values()) {
    if (!patternsByLesson.has(chain.lesson_id)) patternsByLesson.set(chain.lesson_id, new Set());
    patternsByLesson.get(chain.lesson_id).add(chain.pattern_id);
  }

  for (const trace of idx.trace.values()) {
    const artifact = idx.python.get(trace.python_artifact_id);
    if (!artifact || artifact.version !== trace.artifact_version) add("TRACE_ARTIFACT_UNRESOLVED", trace.trace_id);
    if (!fixtureSets.get(trace.python_artifact_id)?.has(trace.fixture_ref)) add("TRACE_FIXTURE_UNRESOLVED", trace.trace_id);
    if (!outputSets.get(trace.python_artifact_id)?.has(trace.expected_output_ref)) add("TRACE_OUTPUT_UNRESOLVED", trace.trace_id);
    if (!evidenceIds.has(trace.execution_evidence_ref)) add("EXECUTION_EVIDENCE_UNRESOLVED", trace.trace_id);
    const actualEvents = [...idx.event.values()].filter((event) => event.trace_id === trace.trace_id).sort((a, b) => a.sequence - b.sequence).map((event) => event.event_id);
    if (stable(actualEvents) !== stable(trace.event_ids)) add("TRACE_EVENT_ORDER_INVALID", trace.trace_id);
  }
  for (const event of idx.event.values()) {
    const trace = idx.trace.get(event.trace_id);
    if (!trace) add("EVENT_TRACE_UNRESOLVED", event.event_id);
    else for (const line of event.active_line_ids) if (!lineSets.get(trace.python_artifact_id)?.has(line)) add("LINE_BINDING_INVALID", `${event.event_id}/${line}`);
  }
  for (const release of idx.release.values()) {
    for (const id of release.knowledge_unit_ids) if (idx.knowledge.get(id)?.lesson_id !== release.lesson_id) add("RELEASE_KNOWLEDGE_JOIN_INVALID", `${release.lesson_id}/${id}`);
    for (const id of release.python_artifact_ids) if (idx.python.get(id)?.lesson_id !== release.lesson_id) add("RELEASE_PYTHON_JOIN_INVALID", `${release.lesson_id}/${id}`);
    for (const id of release.marking_refs) if (idx.marking.get(id)?.lesson_id !== release.lesson_id) add("RELEASE_MARKING_JOIN_INVALID", `${release.lesson_id}/${id}`);
    for (const id of [...release.practice_refs, ...release.retrieval_refs]) if (idx.assessment.get(id)?.lesson_id !== release.lesson_id) add("RELEASE_ASSESSMENT_JOIN_INVALID", `${release.lesson_id}/${id}`);
    for (const source of release.source_refs) if (!completeLocator(source.locator)) add("SOURCE_LOCATOR_UNRESOLVED", `${release.lesson_id}/${source.source_id}`);
    if (/\b[A-Z]:\\|file:\/\/|A_Level_CS_page|planning\/paper4/i.test(JSON.stringify(release.source_refs))) add("LOCAL_PATH_LEAK", release.lesson_id);
  }
  for (const unit of idx.knowledge.values()) {
    if (!unit.objective_refs.length || unit.objective_refs.some((ref) => !completeLocator(ref.locator))) add("KNOWLEDGE_OBJECTIVE_LOCATOR_INVALID", unit.knowledge_unit_id);
    if (!unit.book_refs.length || unit.book_refs.some((ref) => !nonEmpty(ref.section_id) || !ref.printed_pages?.length || !ref.pdf_pages?.length || !nonEmpty(ref.relationship))) add("KNOWLEDGE_BOOK_LOCATOR_INVALID", unit.knowledge_unit_id);
  }
  for (const item of idx.assessment.values()) {
    if (!item.pattern_ids.every((pattern) => patternsByLesson.get(item.lesson_id)?.has(pattern))) add("ASSESSMENT_PATTERN_UNRESOLVED", item.assessment_item_id);
    const artifact = [...idx.python.values()].find((entry) => entry.lesson_id === item.lesson_id);
    const allowed = new Set([artifact?.python_artifact_id, ...(artifact?.fixtures ?? []).map((entry) => entry.fixture_id), ...(artifact?.expected_outputs ?? []).map((entry) => entry.expected_output_id)]);
    if (!item.shared_fixture_code_data_ids.every((id) => allowed.has(id))) add("ASSESSMENT_SHARED_ID_UNRESOLVED", item.assessment_item_id);
  }
  return errors;
}

async function validateCore(grouped) {
  const schemaModule = await import(pathToFileURL(path.join(APP, "scripts", "check-paper4-v2-schema.mjs")));
  const all = Object.values(grouped).flat();
  const schemaErrors = schemaModule.validateRegistry(all);
  for (const error of schemaErrors) fail("SCHEMA_REGISTRY_ERROR", error);

  const resolver = await json(path.join(EVIDENCE_ROOT, "a3", "EVIDENCE_RESOLVER.json"));
  const evidenceIds = new Set(resolver.records.map((record) => record.evidence_id));
  for (const error of joinErrors(grouped, evidenceIds)) fail(error.code, error.detail);

  const idx = indexes(grouped);
  for (const artifact of idx.python.values()) {
    const bytes = await readFile(path.join(APP, artifact.filename));
    const reconstructed = artifact.lines.map((line) => line.text).join("\n");
    if (bytes.toString("utf8").replaceAll("\r\n", "\n") !== reconstructed) fail("SOURCE_LINE_RECONSTRUCTION_DRIFT", artifact.python_artifact_id);
    if (sha256(Buffer.from(reconstructed)) !== artifact.code_sha256) fail("SOURCE_HASH_DRIFT", artifact.python_artifact_id);
  }
  return { resolver, schema_error_count: schemaErrors.length };
}

async function verifyRegistryAggregate() {
  const fileHashes = {};
  for (const filename of Object.values(TYPE_FILES).sort()) fileHashes[filename] = sha256(await readFile(path.join(RECORD_ROOT, filename)));
  const aggregate = sha256(Object.entries(fileHashes).map(([filename, digest]) => `${digest}  ${filename}\n`).join(""));
  const manifest = await readFile(path.join(RECORD_ROOT, "SHA256SUMS.txt"), "utf8");
  for (const [filename, digest] of Object.entries(fileHashes)) if (!manifest.includes(`${digest}  ${filename}`)) fail("REGISTRY_FILE_HASH_MISMATCH", filename);
  if (!manifest.includes(`${aggregate}  REGISTRY-AGGREGATE`)) fail("REGISTRY_AGGREGATE_MISMATCH", aggregate);
  if (aggregate !== "de2541505668302592d4aa8de75482eaefd3d068545a1c7b837d34c2c01b7e95") fail("TARGET_AGGREGATE_MISMATCH", aggregate);
  return { file_hashes: fileHashes, aggregate_sha256: aggregate };
}

async function verifyCanonicalIdentity(grouped) {
  const canonical = {
    KnowledgeUnit: [], PythonArtifact: [], VisualScenarioTrace: [], VisualEventBinding: [], MarkingChain: [], AssessmentItem: [],
  };
  async function below(directory, suffix) {
    const out = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) out.push(...await below(child, suffix));
      else if (entry.name.endsWith(suffix)) out.push(child);
    }
    return out.sort();
  }
  for (const file of await below(path.join(CONTENT_ROOT, "lessons", "pilot"), ".knowledge-unit.json")) canonical.KnowledgeUnit.push(await json(file));
  for (const slug of SLUGS) canonical.PythonArtifact.push({ schema_version: "2.0.0", artifact_type: "PythonArtifact", record: await json(path.join(CONTENT_ROOT, "python", "pilot", slug, "artifact.json")) });
  for (const slug of SLUGS) {
    const bundle = await json(path.join(CONTENT_ROOT, "visuals", "pilot", slug, "visuals.json"));
    canonical.VisualScenarioTrace.push(...bundle.traces);
    canonical.VisualEventBinding.push(...bundle.events);
  }
  canonical.MarkingChain = await json(path.join(CONTENT_ROOT, "assessments", "pilot", "marking-chains.json"));
  canonical.AssessmentItem = await json(path.join(CONTENT_ROOT, "assessments", "pilot", "assessment-items.json"));
  for (const type of Object.keys(canonical)) {
    const id = ID_FIELDS[type];
    const expected = canonical[type].sort((a, b) => String(a.record[id]).localeCompare(String(b.record[id])));
    const actual = clone(grouped[type]).sort((a, b) => String(a.record[id]).localeCompare(String(b.record[id])));
    if (stable(expected) !== stable(actual)) fail("REGISTRY_CANONICAL_IDENTITY_DRIFT", type);
  }
}

async function verifyReruns(grouped) {
  const idx = indexes(grouped);
  const author = await json(path.join(EVIDENCE_ROOT, "a3", "AUTHOR_RUN.json"));
  const independent = await json(path.join(EVIDENCE_ROOT, "a3", "INDEPENDENT_RERUN.json"));
  let exact = 0;
  const cases = [];
  for (const artifact of idx.python.values()) {
    const slug = artifact.lesson_id.split(".").at(-1);
    const source = path.join(APP, artifact.filename);
    const authorLesson = author.lessons.find((entry) => entry.python_artifact_id === artifact.python_artifact_id);
    const independentLesson = independent.lessons.find((entry) => entry.python_artifact_id === artifact.python_artifact_id);
    if (authorLesson?.code_sha256 !== artifact.code_sha256 || independentLesson?.code_sha256 !== artifact.code_sha256) fail("EVIDENCE_CODE_HASH_DRIFT", artifact.python_artifact_id);
    if (authorLesson?.execution_log_sha256 !== artifact.execution_log_sha256 || independentLesson?.execution_log_sha256 !== artifact.execution_log_sha256) fail("EXECUTION_LOG_HASH_DRIFT", artifact.python_artifact_id);
    for (const fixture of artifact.fixtures) {
      const fixturePath = path.join(CONTENT_ROOT, "python", "pilot", slug, "fixtures", `${fixture.case_kind}.json`);
      const run = spawnSync(PYTHON, [source, fixturePath], { cwd: APP, encoding: "utf8", windowsHide: true });
      if (run.status !== 0) { fail("FRESH_RERUN_FAILED", `${artifact.python_artifact_id}/${fixture.case_kind}: ${run.stderr}`); continue; }
      let actual;
      try { actual = JSON.parse(run.stdout.trim()); } catch { fail("FRESH_RERUN_NON_JSON", `${artifact.python_artifact_id}/${fixture.case_kind}`); continue; }
      const expected = artifact.expected_outputs.find((entry) => entry.fixture_ref === fixture.fixture_id)?.value;
      const aCase = authorLesson?.cases.find((entry) => entry.case_kind === fixture.case_kind);
      const iCase = independentLesson?.cases.find((entry) => entry.case_kind === fixture.case_kind);
      const ok = stable(actual) === stable(expected) && stable(actual) === stable(aCase?.result) && stable(actual) === stable(iCase?.result);
      if (!ok) fail("FRESH_RERUN_OUTPUT_DRIFT", `${artifact.python_artifact_id}/${fixture.case_kind}`);
      else exact += 1;
      cases.push({ lesson: slug, case_kind: fixture.case_kind, exact_match: ok, result_sha256: sha256(Buffer.from(stable(actual))) });
    }
  }
  if (exact !== 18) fail("RERUN_COUNT_MISMATCH", `${exact}/18`);
  return { exact_matches: exact, total: 18, cases };
}

function verifyLanguageAccessibilityAuthority(grouped) {
  const idx = indexes(grouped);
  let bilingualPairs = 0;
  const pair = (value, where) => { if (!bilingual(value)) fail("BILINGUAL_PAIR_INVALID", where); else bilingualPairs += 1; };
  for (const unit of idx.knowledge.values()) {
    for (const key of ["title", "explanation", "python_connection", "representation", "invariant_or_rule"]) pair(unit[key], `${unit.knowledge_unit_id}/${key}`);
    for (const item of unit.misconceptions) pair(item, `${unit.knowledge_unit_id}/misconception`);
    for (const item of unit.exam_signals) pair(item, `${unit.knowledge_unit_id}/exam_signal`);
    pair(unit.micro_example.scenario, `${unit.knowledge_unit_id}/micro_example.scenario`);
    pair(unit.micro_example.walkthrough, `${unit.knowledge_unit_id}/micro_example.walkthrough`);
    pair(unit.self_check.prompt, `${unit.knowledge_unit_id}/self_check.prompt`);
    pair(unit.self_check.answer, `${unit.knowledge_unit_id}/self_check.answer`);
    pair(unit.self_check.rationale, `${unit.knowledge_unit_id}/self_check.rationale`);
    if (unit.self_check.answer_hidden_initially !== true) fail("KNOWLEDGE_DISCLOSURE_INVALID", unit.knowledge_unit_id);
  }
  for (const artifact of idx.python.values()) pair(artifact.caption, `${artifact.python_artifact_id}/caption`);
  for (const event of idx.event.values()) {
    pair(event.invariant_or_criterion, `${event.event_id}/criterion`); pair(event.prediction, `${event.event_id}/prediction`); pair(event.feedback, `${event.event_id}/feedback`);
    const access = event.accessibility;
    for (const key of ["accessible_label", "action_description", "keyboard_instruction"]) pair(access?.[key], `${event.event_id}/accessibility.${key}`);
    pair(access?.live_status?.message, `${event.event_id}/accessibility.live_status.message`);
    if (!nonEmpty(access?.focus_target) || !Number.isInteger(access?.focus_order) || !["step", "button", "status"].includes(access?.interaction_role)) fail("ACCESSIBILITY_CONTRACT_INVALID", event.event_id);
  }
  for (const chain of idx.marking.values()) {
    pair(chain.detection_check, `${chain.marking_chain_id}/detection`); pair(chain.repair_check, `${chain.marking_chain_id}/repair`); pair(chain.transfer_limit, `${chain.marking_chain_id}/transfer`);
    for (const atom of chain.marking_atoms) {
      pair(atom.criterion, `${chain.marking_chain_id}/${atom.atom_id}`);
      if (atom.authority !== "Cambridge_QP_MS" || !completeLocator(atom.locator) || !nonEmpty(atom.locator.bullet_locator)) fail("MARKING_AUTHORITY_INVALID", `${chain.marking_chain_id}/${atom.atom_id}`);
      if (!atom.criterion.en.includes("No mark allocation is inferred here") || !atom.criterion.vi.includes("Không suy ra số điểm tại đây")) fail("MARKING_AUTHORITY_CAVEAT_MISSING", `${chain.marking_chain_id}/${atom.atom_id}`);
    }
    if (!chain.transfer_limit.en.includes("must not be summed") || !chain.transfer_limit.vi.includes("không cộng")) fail("MARKING_TRANSFER_LIMIT_INVALID", chain.marking_chain_id);
  }
  for (const item of idx.assessment.values()) {
    for (const key of ["prompt", "expected_artifact", "hint", "feedback"]) pair(item[key], `${item.assessment_item_id}/${key}`);
    pair(item.self_rubric.pass_rule, `${item.assessment_item_id}/pass_rule`); pair(item.self_rubric.retry_rule, `${item.assessment_item_id}/retry_rule`);
    if (item.self_rubric.authority !== "AlgoCore_authored_rubric" || item.self_rubric.official_marks !== null) fail("ASSESSMENT_AUTHORITY_INVALID", item.assessment_item_id);
    if (stable(item.disclosure_contract) !== stable({ answer_hidden_initially: true, hint_hidden_initially: true, feedback_after_attempt: true })) fail("ASSESSMENT_DISCLOSURE_INVALID", item.assessment_item_id);
  }
  const pending = [...idx.release.values()].filter((record) => record.lead_gate === "PENDING").length;
  if (pending !== 6) fail("LEAD_GATE_NOT_PENDING", `${pending}/6`);
  return { bilingual_pairs_independently_checked: bilingualPairs, accessibility_events: idx.event.size, assessment_disclosures: idx.assessment.size, cambridge_marking_atoms: [...idx.marking.values()].reduce((sum, chain) => sum + chain.marking_atoms.length, 0), pending_lead_gates: pending };
}

async function verifyEvidenceInventory() {
  const expected = {
    a2: ["A2_THEORY_PILOT_CHECK.json", "A2_THEORY_PILOT_REVIEW.md"],
    a3: ["A3_PYTHON_PILOT_REVIEW.md", "AUTHOR_RUN.json", "EVIDENCE_RESOLVER.json", "INDEPENDENT_RERUN.json", "KNOWLEDGE_CODE_CLOSURE.json", "LINE_ID_MIGRATION.json", "PILOT_MANIFEST.json"],
    a4: ["A4_P4R2_REGISTRY_INTEGRATION_REVIEW.md", "BUILD_RESULT.json", "CHECK_RESULT.json"],
    a5: ["A5_VISUAL_PILOT_REVIEW.json", "A5_VISUAL_PILOT_REVIEW.md", "VISUAL_PILOT_MANIFEST.json"],
    a6: ["A6_CONTENT_CHECK_NODE20.json", "A6_CONTENT_CHECK_NODE24.json", "A6_FINAL_REVIEW.json", "A6_FINAL_REVIEW.md", "check-a6-content.mjs"],
    a7: ["A7_ASSESSMENT_PILOT_REVIEW.json", "A7_ASSESSMENT_PILOT_REVIEW.md", "CHECK_RESULT.json"],
  };
  const hashes = {};
  for (const [agent, files] of Object.entries(expected)) for (const filename of files) {
    const target = path.join(EVIDENCE_ROOT, agent, filename);
    try { hashes[`${agent}/${filename}`] = sha256(await readFile(target)); } catch { fail("EVIDENCE_MISSING", `${agent}/${filename}`); }
  }
  return { files: Object.keys(hashes).length, sha256: hashes };
}

function mutationChecks(grouped, evidenceIds) {
  const tests = [];
  const run = (id, expectedCode, mutate) => {
    const candidate = clone(grouped);
    mutate(candidate);
    const codes = joinErrors(candidate, evidenceIds).map((error) => error.code);
    const rejected = codes.includes(expectedCode);
    if (!rejected) fail("MUTATION_NOT_REJECTED", `${id}/${expectedCode}`);
    tests.push({ mutation_id: id, expected_code: expectedCode, rejected, actual_codes: [...new Set(codes)].sort() });
  };
  run("unknown-active-line", "LINE_BINDING_INVALID", (items) => { items.VisualEventBinding[0].record.active_line_ids = ["unknown.v1.L999"]; });
  run("stale-expected-output", "TRACE_OUTPUT_UNRESOLVED", (items) => { items.VisualScenarioTrace[0].record.expected_output_ref = "unknown.expected-output"; });
  run("cross-lesson-knowledge", "RELEASE_KNOWLEDGE_JOIN_INVALID", (items) => { items.LessonReleaseRecord[0].record.knowledge_unit_ids = [items.LessonReleaseRecord[1].record.knowledge_unit_ids[0]]; });
  run("unknown-execution-evidence", "EXECUTION_EVIDENCE_UNRESOLVED", (items) => { items.VisualScenarioTrace[0].record.execution_evidence_ref = "unknown.execution-evidence"; });
  run("source-locator-removed", "SOURCE_LOCATOR_UNRESOLVED", (items) => { items.LessonReleaseRecord[0].record.source_refs[0].locator = { source_id: "syllabus_2026_v2" }; });
  return tests;
}

async function main() {
  const grouped = await loadRegistry();
  const evidenceInventory = await verifyEvidenceInventory();
  const { resolver, schema_error_count } = await validateCore(grouped);
  await verifyCanonicalIdentity(grouped);
  const registry = await verifyRegistryAggregate();
  const reruns = await verifyReruns(grouped);
  const contracts = verifyLanguageAccessibilityAuthority(grouped);
  const mutations = mutationChecks(grouped, new Set(resolver.records.map((record) => record.evidence_id)));
  const result = {
    schema_version: "paper4-p4r2-a8-clean-room-v1",
    target_commit: TARGET_COMMIT,
    runtime: process.version,
    python: PYTHON,
    checker_mode: "READ_ONLY_INDEPENDENT",
    decision: failures.length ? "REWORK_REQUIRED" : "PASS",
    counts: Object.fromEntries(Object.entries(grouped).map(([type, records]) => [type, records.length])),
    total_records: Object.values(grouped).flat().length,
    schema_error_count,
    registry,
    reruns,
    contracts,
    mutations,
    evidence_inventory: evidenceInventory,
    findings: failures,
    gate_authority: "A8_RECOMMENDATION_ONLY_LEAD_GATE_UNCHANGED",
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  process.stdout.write(`${JSON.stringify({ schema_version: "paper4-p4r2-a8-clean-room-v1", decision: "REWORK_REQUIRED", findings: [{ code: "HARNESS_EXCEPTION", detail: error.stack ?? error.message }] }, null, 2)}\n`);
  process.exitCode = 1;
});
