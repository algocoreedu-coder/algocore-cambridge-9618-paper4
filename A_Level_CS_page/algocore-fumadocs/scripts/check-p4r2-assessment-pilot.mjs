import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRegistry } from "./check-paper4-v2-schema.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content", "paper4");
const evidenceRoot = join(root, "..", "planning", "paper4", "next-phase", "evidence", "p4r-2", "a7");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const sha256File = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
const fail = (errors, code, detail) => errors.push({ code, detail });
const stableAtomId = (sourceId) => sourceId.replace(/[^A-Za-z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

async function filesBelow(path, suffix) {
  const output = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) output.push(...await filesBelow(child, suffix));
    else if (entry.name.endsWith(suffix)) output.push(child);
  }
  return output.sort();
}

const pilotSlugs = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const pilotLessonIds = new Set(pilotSlugs.map((slug) => `ac-9618-p4-2026-python.lesson.${slug}`));
const expectedPatterns = new Set([
  "DATA_STORAGE", "DATA_RECORD", "ARRAY_APPEND", "RANDOM_ARRAY", "BINARY_SEARCH",
  "QUEUE_SETUP", "QUEUE_ENQUEUE", "QUEUE_DEQUEUE", "QUEUE_INSPECT", "QUEUE_REDUCE",
  "ALGORITHM_REWRITE", "HASH_SETUP", "HASH_FUNCTION", "HASH_INSERT", "HASH_SEARCH",
  "FILE_READ_OBJECTS",
]);
const legacyA0Ids = new Set([
  "ac-9618-p4-2026-python.lesson.queue.practice.guided",
  "ac-9618-p4-2026-python.lesson.queue.practice.faded",
  "ac-9618-p4-2026-python.lesson.queue.practice.independent",
  "ac-9618-p4-2026-python.lesson.recursion.practice.guided",
  "ac-9618-p4-2026-python.lesson.recursion.practice.faded",
  "ac-9618-p4-2026-python.lesson.recursion.practice.independent",
  "ac-9618-p4-2026-python.lesson.hashing.practice.guided",
  "ac-9618-p4-2026-python.lesson.hashing.practice.faded",
  "ac-9618-p4-2026-python.lesson.hashing.practice.independent",
]);

const markingPath = join(contentRoot, "assessments", "pilot", "marking-chains.json");
const assessmentPath = join(contentRoot, "assessments", "pilot", "assessment-items.json");
const manifestPath = join(contentRoot, "assessments", "pilot", "manifest.json");
const mappingMarkingPath = join(contentRoot, "mappings", "marking-disposition.json");
const mappingAssessmentPath = join(contentRoot, "mappings", "assessment-item-map.json");

const [marking, assessments, manifest, markingMap, assessmentMap] = await Promise.all([
  readJson(markingPath), readJson(assessmentPath), readJson(manifestPath), readJson(mappingMarkingPath), readJson(mappingAssessmentPath),
]);

const knowledgeFiles = (await filesBelow(join(contentRoot, "lessons", "pilot"), ".knowledge-unit.json"));
const knowledge = await Promise.all(knowledgeFiles.map(readJson));
const pythonFiles = pilotSlugs.map((slug) => join(contentRoot, "python", "pilot", slug, "artifact.json"));
const pythonRecords = await Promise.all(pythonFiles.map(readJson));
const python = pythonRecords.map((record) => ({ schema_version: "2.0.0", artifact_type: "PythonArtifact", record }));
const visualFiles = pilotSlugs.map((slug) => join(contentRoot, "visuals", "pilot", slug, "visuals.json"));
const visualBundles = await Promise.all(visualFiles.map(readJson));
const visual = visualBundles.flatMap((bundle) => [...bundle.traces, ...bundle.events]);
const registry = [...knowledge, ...python, ...visual, ...marking, ...assessments];
const registryErrors = validateRegistry(registry);
const errors = registryErrors.map((error) => ({ code: `REGISTRY_${error.code}`, detail: JSON.stringify(error) }));

if (knowledge.length !== 26) fail(errors, "KNOWLEDGE_COUNT", `Expected 26 pilot KnowledgeUnits, found ${knowledge.length}.`);
if (python.length !== 6) fail(errors, "PYTHON_COUNT", `Expected 6 PythonArtifacts, found ${python.length}.`);
if (marking.length !== 16) fail(errors, "MARKING_CHAIN_COUNT", `Expected 16 MarkingChains, found ${marking.length}.`);
if (assessments.length !== 18) fail(errors, "ASSESSMENT_COUNT", `Expected 18 AssessmentItems, found ${assessments.length}.`);

const markingPatterns = new Set(marking.map((item) => item.record.pattern_id));
if (markingPatterns.size !== expectedPatterns.size || [...expectedPatterns].some((pattern) => !markingPatterns.has(pattern))) {
  fail(errors, "PILOT_PATTERN_SET", `Expected exact pattern set ${[...expectedPatterns].join(", ")}.`);
}

const mappingChainByPattern = new Map(markingMap.marking_chains.filter((chain) => pilotLessonIds.has(chain.lesson_id)).map((chain) => [chain.pattern_id, chain]));
const dispositionsByPattern = new Map();
for (const atom of markingMap.marking_atom_dispositions.filter((item) => expectedPatterns.has(item.pattern_id))) {
  if (!dispositionsByPattern.has(atom.pattern_id)) dispositionsByPattern.set(atom.pattern_id, new Map());
  dispositionsByPattern.get(atom.pattern_id).set(atom.marking_point_id, atom);
}

let atomCount = 0;
let caveatAtomCount = 0;
for (const envelope of marking) {
  const chain = envelope.record;
  const sourceChain = mappingChainByPattern.get(chain.pattern_id);
  const sourceAtoms = dispositionsByPattern.get(chain.pattern_id);
  atomCount += chain.marking_atoms.length;
  if (!sourceChain) fail(errors, "MARKING_SOURCE_JOIN", `${chain.pattern_id} has no promoted marking source.`);
  if (chain.requirement_ref !== sourceChain?.requirement_ref) fail(errors, "MARKING_REQUIREMENT_DRIFT", `${chain.pattern_id} requirement_ref drifted.`);
  if (chain.limited_evidence !== sourceChain?.limited_evidence) fail(errors, "MARKING_LIMIT_DRIFT", `${chain.pattern_id} limited_evidence drifted.`);
  if (chain.marking_atoms.length !== sourceChain?.marking_atom_count) fail(errors, "MARKING_ATOM_COUNT", `${chain.pattern_id} expected ${sourceChain?.marking_atom_count}, found ${chain.marking_atoms.length}.`);
  for (const atom of chain.marking_atoms) {
    const source = sourceAtoms?.get(atom.locator?.bullet_locator);
    if (!source) {
      fail(errors, "MARKING_ATOM_UNRESOLVED", `${chain.pattern_id}/${atom.atom_id} has no source disposition.`);
      continue;
    }
    if (atom.atom_id !== stableAtomId(source.marking_point_id)) fail(errors, "MARKING_ATOM_ID_DRIFT", `${atom.atom_id} is not the deterministic stable form of ${source.marking_point_id}.`);
    if (atom.authority !== "Cambridge_QP_MS") fail(errors, "MARKING_AUTHORITY", `${atom.atom_id} must retain Cambridge_QP_MS authority.`);
    if (atom.locator.source_id !== source.ms_locator.source_id || atom.locator.pdf_page !== source.ms_locator.pdf_pages[0]) fail(errors, "MARKING_MS_LOCATOR_DRIFT", `${atom.atom_id} MS locator drifted.`);
    const qp = source.qp_locators[0];
    if (!atom.locator.anchor_text.includes(qp.source_id) || !qp.pdf_pages.every((page) => atom.locator.anchor_text.includes(String(page)))) fail(errors, "MARKING_QP_LOCATOR_LOST", `${atom.atom_id} QP locator is not preserved.`);
    for (const token of [source.disposition, source.award_semantics]) {
      if (!atom.criterion.en.includes(token)) fail(errors, "MARKING_CAVEAT_LOST", `${atom.atom_id} criterion lost ${token}.`);
    }
    if (source.group_id && !atom.criterion.en.includes(source.group_id)) fail(errors, "MARKING_GROUP_LOST", `${atom.atom_id} lost group semantics.`);
    if (source.source_issue_refs.length && !source.source_issue_refs.every((issue) => atom.criterion.en.includes(issue))) fail(errors, "MARKING_SOURCE_ISSUE_LOST", `${atom.atom_id} lost source issue refs.`);
    if (source.disposition === "RETAIN_WITH_SOURCE_CAVEAT") caveatAtomCount += 1;
  }
  if (!chain.transfer_limit.en.includes("must not be summed") || !chain.transfer_limit.vi.includes("không cộng")) fail(errors, "TRANSFER_LIMIT_WEAK", `${chain.pattern_id} does not prohibit invented mark totals.`);
}
if (atomCount !== 406) fail(errors, "MARKING_ATOM_TOTAL", `Expected 406 context-bound pilot atoms, found ${atomCount}.`);

const destinationById = new Map(assessmentMap.assessment_destination_dispositions.map((item) => [item.destination_id, item]));
const assessmentIds = new Set(assessments.map((item) => item.record.assessment_item_id));
if (assessmentIds.size !== 18) fail(errors, "ASSESSMENT_ID_UNIQUE", "Assessment IDs are not unique.");
for (const id of legacyA0Ids) if (!assessmentIds.has(id)) fail(errors, "LEGACY_A0_ID_LOST", `Missing A0 ID ${id}.`);

const pythonByLesson = new Map(python.map((item) => [item.record.lesson_id, item.record]));
const traces = visual.filter((item) => item.artifact_type === "VisualScenarioTrace").map((item) => item.record);
const knowledgeByLesson = new Map();
for (const item of knowledge) {
  if (!knowledgeByLesson.has(item.record.lesson_id)) knowledgeByLesson.set(item.record.lesson_id, []);
  knowledgeByLesson.get(item.record.lesson_id).push(item.record);
}

for (const lesson of pilotLessonIds) {
  const items = assessments.filter((item) => item.record.lesson_id === lesson).map((item) => item.record);
  const levels = items.map((item) => item.level).sort();
  if (JSON.stringify(levels) !== JSON.stringify(["faded", "guided", "independent"])) fail(errors, "PROGRESSION_LEVELS", `${lesson} does not have exact guided/faded/independent progression.`);
  if (!(knowledgeByLesson.get(lesson)?.length > 0)) fail(errors, "THEORY_JOIN", `${lesson} has no KnowledgeUnit.`);
  const artifact = pythonByLesson.get(lesson);
  if (!artifact) fail(errors, "CODE_JOIN", `${lesson} has no PythonArtifact.`);
  for (const item of items) {
    const destination = destinationById.get(item.destination_id);
    if (!destination || destination.lesson_id !== lesson || !item.pattern_ids.every((pattern) => destination.pattern_ids.includes(pattern))) fail(errors, "DESTINATION_JOIN", `${item.assessment_item_id} destination does not prove lesson/pattern placement.`);
    if (!item.prompt?.vi?.trim() || !item.prompt?.en?.trim()) fail(errors, "PROMPT_NULL", `${item.assessment_item_id} has null/empty bilingual prompt.`);
    if (!item.self_rubric?.pass_rule?.vi?.trim() || !item.self_rubric?.pass_rule?.en?.trim()) fail(errors, "PASS_RULE_NULL", `${item.assessment_item_id} has null/empty bilingual pass rule.`);
    if (item.self_rubric?.authority !== "AlgoCore_authored_rubric" || item.self_rubric?.official_marks !== null) fail(errors, "RUBRIC_AUTHORITY", `${item.assessment_item_id} must be AlgoCore-authored with official_marks=null.`);
    if (Object.hasOwn(item, "official_marks")) fail(errors, "INVENTED_OFFICIAL_MARK", `${item.assessment_item_id} must not assert official marks.`);
    if (!item.expected_artifact?.vi?.trim() || !item.expected_artifact?.en?.trim() || !item.hint?.vi?.trim() || !item.hint?.en?.trim() || !item.feedback?.vi?.trim() || !item.feedback?.en?.trim()) fail(errors, "PEDAGOGY_FIELD_EMPTY", `${item.assessment_item_id} has an empty bilingual expected artifact, hint, or feedback.`);
    if (!item.shared_fixture_code_data_ids.includes(artifact?.python_artifact_id)) fail(errors, "ARTIFACT_REF", `${item.assessment_item_id} does not reference its Python artifact.`);
    const refSet = new Set(item.shared_fixture_code_data_ids);
    for (const ref of refSet) {
      const resolves = ref === artifact?.python_artifact_id || artifact?.fixtures.some((fixture) => fixture.fixture_id === ref) || artifact?.expected_outputs.some((output) => output.expected_output_id === ref);
      if (!resolves) fail(errors, "FIXTURE_CODE_DATA_REF", `${item.assessment_item_id} has unresolved ref ${ref}.`);
    }
    for (const pattern of item.pattern_ids) {
      const chain = marking.find((entry) => entry.record.lesson_id === lesson && entry.record.pattern_id === pattern)?.record;
      if (!chain || !item.assessment_requirement_ids.includes(chain.requirement_ref)) fail(errors, "PROMPT_REQUIREMENT_PATTERN_JOIN", `${item.assessment_item_id}/${pattern} lacks its marking-chain requirement.`);
      if (!traces.some((trace) => trace.pattern_id === pattern && trace.python_artifact_id === artifact?.python_artifact_id)) fail(errors, "TRACE_JOIN", `${item.assessment_item_id}/${pattern} has no execution-backed visual trace.`);
      if (!chain?.error_ref || !chain?.repair_check?.vi || !chain?.repair_check?.en) fail(errors, "ERROR_PREVENTION_JOIN", `${item.assessment_item_id}/${pattern} lacks error-prevention guidance.`);
    }
    const expectedCases = item.level === "guided" ? ["normal"] : item.level === "faded" ? ["boundary"] : ["normal", "boundary", "failure"];
    for (const caseKind of expectedCases) {
      const fixture = artifact?.fixtures.find((candidate) => candidate.case_kind === caseKind);
      const output = artifact?.expected_outputs.find((candidate) => candidate.fixture_ref === fixture?.fixture_id);
      if (!fixture || !output || !refSet.has(fixture.fixture_id) || !refSet.has(output.expected_output_id)) fail(errors, "PROGRESSION_EVIDENCE", `${item.assessment_item_id} lacks ${caseKind} fixture/output evidence.`);
    }
  }
}

const generatedIds = new Set(assessments.map((item) => item.record.assessment_item_id));
const sourcePilotIds = new Set(assessmentMap.assessment_items.filter((item) => pilotLessonIds.has(item.lesson_id)).map((item) => item.assessment_item_id));
if ([...sourcePilotIds].some((id) => !generatedIds.has(id)) || [...generatedIds].some((id) => !sourcePilotIds.has(id))) fail(errors, "ASSESSMENT_ID_DRIFT", "Pilot assessment IDs differ from the promoted source map.");
const bilingualExpectedArtifactCount = assessments.filter(({ record }) =>
  typeof record.expected_artifact?.vi === "string" && record.expected_artifact.vi.trim()
  && typeof record.expected_artifact?.en === "string" && record.expected_artifact.en.trim()
).length;
if (bilingualExpectedArtifactCount !== 18) fail(errors, "EXPECTED_ARTIFACT_LOCALE_PARITY", `Expected 18 bilingual expected_artifact records, found ${bilingualExpectedArtifactCount}.`);

const artifactHashes = {};
for (const path of [...pythonFiles, ...visualFiles]) artifactHashes[relative(root, path).replaceAll("\\", "/")] = await sha256File(path);
const result = {
  schema_version: "paper4-p4r2-a7-check-v1",
  checked_at: new Date().toISOString(),
  decision: errors.length ? "FAIL" : "PASS",
  counts: {
    knowledge_units: knowledge.length,
    python_artifacts: python.length,
    visual_traces: visual.filter((item) => item.artifact_type === "VisualScenarioTrace").length,
    visual_events: visual.filter((item) => item.artifact_type === "VisualEventBinding").length,
    marking_chains: marking.length,
    marking_atoms: atomCount,
    caveated_marking_atoms: caveatAtomCount,
    assessment_items: assessments.length,
    bilingual_expected_artifacts: bilingualExpectedArtifactCount,
    legacy_a0_ids_preserved: [...legacyA0Ids].filter((id) => assessmentIds.has(id)).length,
    registry_errors: registryErrors.length,
    checker_errors: errors.length,
  },
  artifact_hashes: artifactHashes,
  manifest_status: manifest.status,
  errors,
};

await mkdir(evidenceRoot, { recursive: true });
await writeFile(join(evidenceRoot, "CHECK_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
