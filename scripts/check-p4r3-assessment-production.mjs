import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { validateEnvelope } from "./check-paper4-v2-schema.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content", "paper4");
const evidenceRoot = join(root, "..", "planning", "paper4", "next-phase", "evidence", "p4r-3", "a7");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const stableAtomId = (sourceId) => sourceId.replace(/[^A-Za-z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const exists = async (path) => access(path).then(() => true, () => false);
const sha256File = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
const fail = (errors, code, detail) => errors.push({ code, detail });

async function filesBelow(path, suffix) {
  const output = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) output.push(...await filesBelow(child, suffix));
    else if (entry.name.endsWith(suffix)) output.push(child);
  }
  return output.sort();
}

const pilotSlugs = new Set(["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"]);
const productionSlugs = [
  "binary-tree", "dictionary", "exam-workflow", "exceptions", "graphs", "linked-list",
  "oop-aggregation", "oop-inheritance", "oop-model", "oop-state", "performance",
  "procedural-design", "random-files", "search-collections", "sorting", "stack", "testing",
  "text-files", "text-processing", "validation-rules",
];
const lessonId = (slug) => `ac-9618-p4-2026-python.lesson.${slug}`;
const p4r9CapstoneId = "ac-9618-p4-2026-python.lesson.exam-workflow.practice.p4r9-dsa-capstone";
const p4r9CapstonePatterns = new Set(["DATA_STORAGE", "BINARY_SEARCH", "STACK_SETUP", "MAIN_FLOW", "EVIDENCE_RUN", "OUTPUT_FORMAT"]);
const p4r9CapstonePatternStatus = "CROSS_LESSON_SKILL_LINKS_REPRESENTATIONAL_ONLY";
const productionLessonIds = new Set(productionSlugs.map(lessonId));
const representationalLessonIds = new Set(["testing", "dictionary", "performance", "graphs", "random-files", "exceptions"].map(lessonId));

const paths = {
  marking: join(contentRoot, "assessments", "production", "marking-chains.json"),
  assessments: join(contentRoot, "assessments", "production", "assessment-items.json"),
  manifest: join(contentRoot, "assessments", "production", "manifest.json"),
  markingMap: join(contentRoot, "mappings", "marking-disposition.json"),
  assessmentMap: join(contentRoot, "mappings", "assessment-item-map.json"),
};
const [marking, assessments, manifest, markingMap, assessmentMap] = await Promise.all(Object.values(paths).map(readJson));
const errors = [];
const carryovers = [];

const knowledgeFiles = await filesBelow(join(contentRoot, "lessons", "production"), ".knowledge-unit.json");
const knowledge = await Promise.all(knowledgeFiles.map(readJson));
const artifactFiles = productionSlugs.map((slug) => join(contentRoot, "python", "production", slug, "artifact.json"));
const artifacts = await Promise.all(artifactFiles.map(readJson));
const artifactByLesson = new Map(artifacts.map((artifact) => [artifact.lesson_id, artifact]));

if (knowledge.length !== 82) fail(errors, "KNOWLEDGE_COUNT", `Expected 82, found ${knowledge.length}.`);
if (artifacts.length !== 20) fail(errors, "PYTHON_COUNT", `Expected 20, found ${artifacts.length}.`);
if (marking.length !== 42) fail(errors, "MARKING_CHAIN_COUNT", `Expected 42, found ${marking.length}.`);
if (assessments.length !== 61) fail(errors, "ASSESSMENT_COUNT", `Expected 61, found ${assessments.length}.`);

for (const envelope of [...marking, ...assessments]) {
  for (const issue of validateEnvelope(envelope)) fail(errors, `SCHEMA_${issue.code}`, `${envelope.artifact_type}/${issue.path}: ${issue.message}`);
}

const sourceChains = markingMap.marking_chains.filter((chain) => productionLessonIds.has(chain.lesson_id));
const sourceChainByPattern = new Map(sourceChains.map((chain) => [chain.pattern_id, chain]));
const sourceAtomsByPattern = new Map();
for (const atom of markingMap.marking_atom_dispositions) {
  if (!sourceAtomsByPattern.has(atom.pattern_id)) sourceAtomsByPattern.set(atom.pattern_id, new Map());
  sourceAtomsByPattern.get(atom.pattern_id).set(atom.marking_point_id, atom);
}
const generatedPatterns = new Set(marking.map((item) => item.record.pattern_id));
if (generatedPatterns.size !== 42 || sourceChains.some((chain) => !generatedPatterns.has(chain.pattern_id))) fail(errors, "MARKING_PATTERN_SET", "Production marking pattern set differs from the promoted 42-chain complement.");

let productionAtomCount = 0;
let caveatedAtomCount = 0;
const generatedAtomBullets = new Set();
for (const envelope of marking) {
  const chain = envelope.record;
  const sourceChain = sourceChainByPattern.get(chain.pattern_id);
  const atoms = sourceAtomsByPattern.get(chain.pattern_id);
  productionAtomCount += chain.marking_atoms.length;
  if (!sourceChain || sourceChain.lesson_id !== chain.lesson_id || sourceChain.marking_chain_id !== chain.marking_chain_id) fail(errors, "MARKING_CHAIN_IDENTITY", `${chain.pattern_id} does not preserve source identity.`);
  if (chain.requirement_ref !== sourceChain?.requirement_ref || chain.limited_evidence !== sourceChain?.limited_evidence) fail(errors, "MARKING_CHAIN_DRIFT", `${chain.pattern_id} changed requirement or limited-evidence status.`);
  if (chain.marking_atoms.length !== sourceChain?.marking_atom_count) fail(errors, "MARKING_ATOM_COUNT", `${chain.pattern_id} expected ${sourceChain?.marking_atom_count}, found ${chain.marking_atoms.length}.`);
  for (const atom of chain.marking_atoms) {
    const source = atoms?.get(atom.locator?.bullet_locator);
    if (!source) { fail(errors, "MARKING_ATOM_UNRESOLVED", `${chain.pattern_id}/${atom.atom_id}`); continue; }
    if (generatedAtomBullets.has(source.marking_point_id)) fail(errors, "MARKING_ATOM_DUPLICATE", source.marking_point_id);
    generatedAtomBullets.add(source.marking_point_id);
    if (atom.atom_id !== stableAtomId(source.marking_point_id) || atom.authority !== "Cambridge_QP_MS") fail(errors, "MARKING_ATOM_ID_AUTHORITY", atom.atom_id);
    if (atom.locator.source_id !== source.ms_locator.source_id || atom.locator.pdf_page !== source.ms_locator.pdf_pages[0]) fail(errors, "MARKING_MS_LOCATOR", atom.atom_id);
    const qp = source.qp_locators[0];
    if (!atom.locator.anchor_text.includes(qp.source_id) || !qp.pdf_pages.every((page) => atom.locator.anchor_text.includes(String(page)))) fail(errors, "MARKING_QP_LOCATOR", atom.atom_id);
    for (const token of [source.disposition, source.award_semantics]) if (!atom.criterion.en.includes(token)) fail(errors, "MARKING_CAVEAT", `${atom.atom_id} lacks ${token}`);
    if (source.group_id && !atom.criterion.en.includes(source.group_id)) fail(errors, "MARKING_GROUP", atom.atom_id);
    if (source.source_issue_refs.some((ref) => !atom.criterion.en.includes(ref))) fail(errors, "MARKING_SOURCE_ISSUE", atom.atom_id);
    if (source.disposition === "RETAIN_WITH_SOURCE_CAVEAT") caveatedAtomCount += 1;
  }
  if (!chain.transfer_limit.en.includes("must not be summed") || !chain.transfer_limit.vi.includes("không cộng")) fail(errors, "TRANSFER_LIMIT", chain.pattern_id);
}
if (productionAtomCount !== 1830) fail(errors, "PRODUCTION_ATOM_TOTAL", `Expected 1,830, found ${productionAtomCount}.`);

const pilotMarking = await readJson(join(contentRoot, "assessments", "pilot", "marking-chains.json"));
const pilotBullets = new Set(pilotMarking.flatMap((item) => item.record.marking_atoms.map((atom) => atom.locator.bullet_locator)));
const globalBullets = new Set([...pilotBullets, ...generatedAtomBullets]);
if (pilotBullets.size !== 406 || globalBullets.size !== 2236 || markingMap.marking_atom_dispositions.some((atom) => !globalBullets.has(atom.marking_point_id))) fail(errors, "GLOBAL_ATOM_DISPOSITION", `Expected exact 406 pilot + 1830 production = 2236 atom dispositions; got ${pilotBullets.size}/${generatedAtomBullets.size}/${globalBullets.size}.`);

const sourceItems = assessmentMap.assessment_items.filter((item) => productionLessonIds.has(item.lesson_id));
const sourceItemById = new Map(sourceItems.map((item) => [item.assessment_item_id, item]));
const generatedIds = new Set(assessments.map((item) => item.record.assessment_item_id));
const baselineGeneratedIds = new Set([...generatedIds].filter((id) => id !== p4r9CapstoneId));
if (generatedIds.size !== 61 || baselineGeneratedIds.size !== 60 || sourceItems.some((item) => !generatedIds.has(item.assessment_item_id))) fail(errors, "ASSESSMENT_ID_SET", "Production assessment IDs must preserve the promoted 60-item set and add exactly the P4R-9 DSA capstone.");
if (!generatedIds.has(p4r9CapstoneId) || assessments.filter((item) => item.record.assessment_item_id === p4r9CapstoneId).length !== 1) fail(errors, "P4R9_CAPSTONE_ID", "The namespaced P4R-9 DSA capstone must exist exactly once.");
if (!generatedIds.has("exam-workflow.i1")) fail(errors, "P4R8_OOP_CAPSTONE_MISSING", "Protected exam-workflow.i1 must remain present.");
const p4r9CapstoneSource = sourceItemById.get(p4r9CapstoneId);
if (p4r9CapstoneSource?.pattern_link_status !== p4r9CapstonePatternStatus) fail(errors, "P4R9_CAPSTONE_SOURCE_AUTHORITY", `Capstone source must declare ${p4r9CapstonePatternStatus}.`);
if (p4r9CapstoneSource?.official_marks !== null || p4r9CapstoneSource?.self_rubric?.official_marks !== null) fail(errors, "P4R9_CAPSTONE_SOURCE_MARKS", "Capstone source must retain official_marks=null at both authored layers.");
if (JSON.stringify([...(p4r9CapstoneSource?.pattern_ids ?? [])].sort()) !== JSON.stringify([...p4r9CapstonePatterns].sort())) fail(errors, "P4R9_CAPSTONE_SOURCE_PATTERNS", "Capstone source must preserve the six approved skill-link patterns.");

let representationalItems = 0;
for (const slug of productionSlugs) {
  const id = lessonId(slug);
  const artifact = artifactByLesson.get(id);
  const lessonItems = assessments.filter((item) => item.record.lesson_id === id).map((item) => item.record);
  const levels = lessonItems.map((item) => item.level).sort();
  const expectedLevels = slug === "exam-workflow" ? ["faded", "guided", "independent", "independent"] : ["faded", "guided", "independent"];
  if (JSON.stringify(levels) !== JSON.stringify(expectedLevels)) fail(errors, "PROGRESSION_LEVELS", slug);
  if (!knowledge.some((item) => item.record.lesson_id === id)) fail(errors, "THEORY_JOIN", slug);
  for (const item of lessonItems) {
    const source = sourceItemById.get(item.assessment_item_id);
    const isP4r9Capstone = item.assessment_item_id === p4r9CapstoneId;
    const representational = source?.pattern_ids.length === 0 || isP4r9Capstone;
    if (representational) representationalItems += 1;
    if (!source || source.lesson_id !== item.lesson_id || source.level !== item.level || source.destination_id !== item.destination_id) fail(errors, "ASSESSMENT_IDENTITY", item.assessment_item_id);
    const expectedPatterns = isP4r9Capstone ? source.pattern_ids : representational ? artifact.pattern_ids : source.pattern_ids;
    if (JSON.stringify([...item.pattern_ids].sort()) !== JSON.stringify([...expectedPatterns].sort())) fail(errors, "ASSESSMENT_PATTERN_LINK", item.assessment_item_id);
    const expectedRequirements = isP4r9Capstone
      ? source.assessment_requirement_ids
      : representational
      ? source.assessment_requirement_ids
      : [...new Set(item.pattern_ids.map((pattern) => marking.find((chain) => chain.record.lesson_id === id && chain.record.pattern_id === pattern)?.record.requirement_ref))];
    if (expectedRequirements.includes(undefined) || JSON.stringify([...item.assessment_requirement_ids].sort()) !== JSON.stringify([...expectedRequirements].sort())) fail(errors, "ASSESSMENT_REQUIREMENT_LINK", item.assessment_item_id);
    if (representational && item.self_rubric.pattern_authority !== "AlgoCore_representational_workflow_only") fail(errors, "REPRESENTATIONAL_AUTHORITY", item.assessment_item_id);
    if (!representational && item.self_rubric.pattern_authority !== "source_linked_pattern_workflow") fail(errors, "LINKED_PATTERN_AUTHORITY", item.assessment_item_id);
    if (item.self_rubric.authority !== "AlgoCore_authored_rubric" || item.self_rubric.official_marks !== null || Object.hasOwn(item, "official_marks")) fail(errors, "RUBRIC_AUTHORITY", item.assessment_item_id);
    if (representational) {
      const serialized = JSON.stringify(item);
      const requirementCriterion = item.self_rubric.criteria?.find((criterion) => criterion.criterion_id.endsWith(".rubric.requirement"));
      if (!requirementCriterion?.description?.en?.includes("not Cambridge mark allocations") || !requirementCriterion?.description?.vi?.includes("không phải phân bổ điểm Cambridge")) fail(errors, "REPRESENTATIONAL_BOUNDARY_TEXT", item.assessment_item_id);
      if (serialized.includes("Cambridge_QP_MS")) fail(errors, "FALSE_CAMBRIDGE_OWNERSHIP", item.assessment_item_id);
      if (!isP4r9Capstone && marking.some((chain) => chain.record.lesson_id === id && item.pattern_ids.includes(chain.record.pattern_id))) fail(errors, "FALSE_CAMBRIDGE_OWNERSHIP", item.assessment_item_id);
    }
    for (const field of ["prompt", "expected_artifact", "hint", "feedback"]) if (!item[field]?.vi?.trim() || !item[field]?.en?.trim()) fail(errors, "BILINGUAL_FIELD", `${item.assessment_item_id}/${field}`);
    if (!item.prompt.vi.includes("fixture") || !item.prompt.en.includes("fixture")) fail(errors, "PROMPT_EXECUTION_SPECIFICITY", item.assessment_item_id);
    if (!item.shared_fixture_code_data_ids.includes(artifact.python_artifact_id)) fail(errors, "PYTHON_ARTIFACT_REF", item.assessment_item_id);
    const refs = new Set(item.shared_fixture_code_data_ids);
    for (const ref of refs) {
      if (!(ref === artifact.python_artifact_id || artifact.fixtures.some((fixture) => fixture.fixture_id === ref) || artifact.expected_outputs.some((output) => output.expected_output_id === ref))) fail(errors, "EXECUTION_REF", `${item.assessment_item_id}/${ref}`);
    }
    const cases = ["normal", "boundary", "failure"];
    for (const caseKind of cases) {
      const fixture = artifact.fixtures.find((candidate) => candidate.case_kind === caseKind);
      const output = artifact.expected_outputs.find((candidate) => candidate.fixture_ref === fixture?.fixture_id);
      if (!fixture || !output || !refs.has(fixture.fixture_id) || !refs.has(output.expected_output_id)) fail(errors, "PROGRESSION_EVIDENCE", `${item.assessment_item_id}/${caseKind}`);
    }
    if (!item.disclosure_contract.answer_hidden_initially || !item.disclosure_contract.hint_hidden_initially || !item.disclosure_contract.feedback_after_attempt) fail(errors, "DISCLOSURE_CONTRACT", item.assessment_item_id);
    if (isP4r9Capstone) {
      const serialized = JSON.stringify(item);
      for (const token of ["array/ADT", "search or sort", "mutable structure", "time/space complexity", "normal/boundary/failure", "AlgoCore-authored"]) {
        if (!serialized.includes(token)) fail(errors, "P4R9_CAPSTONE_SCOPE", `${item.assessment_item_id} lacks ${token}`);
      }
      const patternOwners = markingMap.marking_chains
        .filter((chain) => item.pattern_ids.includes(chain.pattern_id))
        .map((chain) => ({ pattern_id: chain.pattern_id, lesson_id: chain.lesson_id }));
      const crossLessonPatterns = new Set(patternOwners.filter((owner) => owner.lesson_id !== id).map((owner) => owner.pattern_id));
      const localPatterns = new Set(patternOwners.filter((owner) => owner.lesson_id === id).map((owner) => owner.pattern_id));
      if (JSON.stringify([...crossLessonPatterns].sort()) !== JSON.stringify(["BINARY_SEARCH", "DATA_STORAGE", "STACK_SETUP"])) fail(errors, "P4R9_CROSS_LESSON_SKILL_LINKS", "Capstone must retain the three approved cross-lesson skill links.");
      if (JSON.stringify([...localPatterns].sort()) !== JSON.stringify(["EVIDENCE_RUN", "MAIN_FLOW", "OUTPUT_FORMAT"])) fail(errors, "P4R9_LOCAL_WORKFLOW_LABELS", "Capstone must retain the three exam-workflow labels without claiming their marking chains.");
      if (Object.hasOwn(item, "marking_chain_id") || Object.hasOwn(item, "marking_chain_ids") || item.self_rubric.pattern_authority !== "AlgoCore_representational_workflow_only") fail(errors, "P4R9_MARKING_CHAIN_OWNERSHIP", "Capstone may carry skill labels but cannot own or inherit a marking chain.");
      if (marking.some((chain) => chain.record.marking_chain_id.includes("p4r9") || chain.record.pattern_id.includes("P4R9"))) fail(errors, "P4R9_NEW_MARKING_CHAIN", "The DSA capstone must reuse existing patterns without adding a marking chain.");
    }
  }
}
if (representationalItems !== 19) fail(errors, "REPRESENTATIONAL_ITEM_COUNT", `Expected 18 gap-lesson items plus the P4R-9 cross-owner capstone, found ${representationalItems}.`);

const visualRoot = join(contentRoot, "visuals", "production");
let visualJoin = { status: "FAIL", traces: 0, events: 0, unresolved: [] };
if (await exists(visualRoot)) {
  const visualFiles = await filesBelow(visualRoot, "visuals.json");
  const bundles = await Promise.all(visualFiles.map(readJson));
  const traces = bundles.flatMap((bundle) => bundle.traces ?? []).map((item) => item.record);
  const events = bundles.flatMap((bundle) => bundle.events ?? []).map((item) => item.record);
  const unresolved = [];
  const officialLessonIds = new Set(marking.map((chain) => chain.record.lesson_id));
  const officialPatterns = new Set(marking.map((chain) => chain.record.pattern_id));
  const visualPatterns = new Set(traces.map((trace) => trace.pattern_id));
  if (visualFiles.length !== 14) fail(errors, "VISUAL_BUNDLE_SCOPE", `Expected exact 14 official pattern-owner bundles, found ${visualFiles.length}.`);
  if (traces.length !== 126) fail(errors, "VISUAL_TRACE_COUNT", `Expected 126 traces, found ${traces.length}.`);
  if (events.length !== 596) fail(errors, "VISUAL_EVENT_COUNT", `Expected the frozen P4R-9 production visual total of 596 events, found ${events.length}.`);
  if (visualPatterns.size !== 42 || [...officialPatterns].some((pattern) => !visualPatterns.has(pattern)) || [...visualPatterns].some((pattern) => !officialPatterns.has(pattern))) fail(errors, "VISUAL_PATTERN_SCOPE", "Visual pattern set must equal the exact 42 official production chains.");
  for (const chain of marking.map((entry) => entry.record)) {
    const artifact = artifactByLesson.get(chain.lesson_id);
    const matches = traces.filter((trace) => trace.pattern_id === chain.pattern_id && trace.python_artifact_id === artifact?.python_artifact_id);
    const cases = matches.map((trace) => trace.case_kind).sort();
    if (matches.length !== 3 || JSON.stringify(cases) !== JSON.stringify(["boundary", "failure", "normal"])) unresolved.push(`${chain.marking_chain_id}/${chain.pattern_id}`);
  }
  let falseTraceOwnership = 0;
  for (const item of assessments.filter((entry) => representationalLessonIds.has(entry.record.lesson_id)).map((entry) => entry.record)) {
    const artifact = artifactByLesson.get(item.lesson_id);
    if (traces.some((trace) => item.pattern_ids.includes(trace.pattern_id) && trace.python_artifact_id === artifact?.python_artifact_id)) {
      falseTraceOwnership += 1;
      fail(errors, "FALSE_TRACE_OWNERSHIP", item.assessment_item_id);
    }
  }
  const visualOwnerLessonIds = new Set(visualFiles.map((path) => {
    const normalized = path.replaceAll("\\", "/");
    return lessonId(normalized.split("/").at(-2));
  }));
  if ([...visualOwnerLessonIds].some((id) => !officialLessonIds.has(id)) || [...officialLessonIds].some((id) => !visualOwnerLessonIds.has(id))) fail(errors, "VISUAL_OWNER_SCOPE", "Visual bundles must be owned by the exact 14 official-chain lessons.");
  visualJoin = {
    status: unresolved.length || falseTraceOwnership ? "FAIL" : "PASS",
    visual_lesson_files: visualFiles.length, expected_visual_lesson_files: 14,
    official_patterns: visualPatterns.size, expected_official_patterns: 42,
    traces: traces.length, events: events.length,
    representational_assessment_items_checked: 18,
    false_trace_ownership_items: falseTraceOwnership,
    unresolved,
  };
  if (unresolved.length) fail(errors, "VISUAL_TRACE_JOIN", `${unresolved.length} official chain/pattern joins do not resolve to exact normal/boundary/failure traces.`);
} else {
  fail(errors, "VISUAL_PRODUCTION_MISSING", "A5 production visuals are required for final A7 closure.");
}

if (manifest.counts.marking_chains !== 42 || manifest.counts.marking_atoms !== 1830 || manifest.counts.assessment_items !== 61) fail(errors, "MANIFEST_COUNTS", "Manifest counts drifted.");
if (manifest.carryovers?.length !== 0 || manifest.status !== "A7_REVIEWED_PRODUCTION_COMPLETE_PENDING_LEAD_A8_GATE") fail(errors, "MANIFEST_CARRYOVER_STATUS", "A7 manifest must close the A5 join and retain only the Lead/A8 gate boundary.");
const artifactHashes = {};
for (const path of [...artifactFiles, paths.marking, paths.assessments, paths.manifest]) artifactHashes[relative(root, path).replaceAll("\\", "/")] = await sha256File(path);
const decision = errors.length ? "FAIL" : carryovers.length ? "PASS_WITH_REQUIRED_CARRYOVER" : "PASS";
const result = {
  schema_version: "paper4-p4r3-a7-check-v1", checked_at: new Date().toISOString(), decision,
  counts: {
    knowledge_units: knowledge.length, python_artifacts: artifacts.length, marking_chains: marking.length,
    production_marking_atoms: productionAtomCount, global_marking_atoms_dispositioned: globalBullets.size,
    caveated_production_atoms: caveatedAtomCount, assessment_items: assessments.length,
    representational_workflow_items: representationalItems,
    legacy_a0_ids_preserved: assessments.filter((item) => item.record.assessment_item_id.includes(".practice.")).length,
    schema_envelope_errors: errors.filter((item) => item.code.startsWith("SCHEMA_")).length,
    checker_errors: errors.length,
  },
  visual_join: visualJoin, carryovers, artifact_hashes: artifactHashes, errors,
};
await mkdir(evidenceRoot, { recursive: true });
await writeFile(join(evidenceRoot, "CHECK_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
