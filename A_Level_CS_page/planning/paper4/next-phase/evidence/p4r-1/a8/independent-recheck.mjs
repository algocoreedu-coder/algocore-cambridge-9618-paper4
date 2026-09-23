import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

async function findWorkspace(start) {
  let current = start;
  for (;;) {
    try {
      const names = await readdir(path.join(current, "A_Level_CS_page"));
      if (names.includes("algocore-fumadocs") && names.includes("planning")) return current;
    } catch {}
    const parent = path.dirname(current);
    if (parent === current) throw new Error("WORKSPACE_ROOT_NOT_FOUND");
    current = parent;
  }
}

const WORKSPACE = await findWorkspace(HERE);
const APP = path.join(WORKSPACE, "A_Level_CS_page/algocore-fumadocs");
const NEXT = path.join(WORKSPACE, "A_Level_CS_page/planning/paper4/next-phase");
const MAP = path.join(APP, "content/paper4/mappings");
const STAGE3 = path.join(WORKSPACE, "A_Level_CS_page/planning/paper4/stage-3");
const LOCK_PATH = path.join(NEXT, "evidence/p4r-0/a1-revision-2/INPUT_LOCK_REVISION_2.json");
const EXACT_PATH = path.join(NEXT, "evidence/p4r-0/a1/EXACT_DENOMINATORS.json");
const A0_PATH = path.join(NEXT, "evidence/p4r-0/a0/PRACTICE_ID_ASSIGNMENT.json");
const TMP = path.join(HERE, ".tmp-independent-recheck");

const output = {
  decision: "PASS",
  node_version: process.version,
  checks: {},
  counts: {},
  carryovers: {},
  findings: [],
};

function sha(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function bytes(file) {
  return readFile(file);
}

async function json(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function stableHash(values) {
  return sha([...values].sort().join("\n"));
}

function equalSet(left, right) {
  return left.length === right.length
    && new Set(left).size === left.length
    && new Set(right).size === right.length
    && stableHash(left) === stableHash(right);
}

function assert(condition, code, detail = "") {
  if (!condition) throw new Error(`${code}${detail ? `: ${detail}` : ""}`);
}

function flatVisual(payload) {
  return {
    scenarios: payload.patterns.flatMap((pattern) => pattern.scenarios),
    events: payload.patterns.flatMap((pattern) => pattern.events),
  };
}

async function verifyActiveLock() {
  const lockBytes = await bytes(LOCK_PATH);
  const lock = JSON.parse(lockBytes);
  assert(sha(lockBytes) === "be67cedbca671dde2db1b98bcce35bf38c5eab8f66614d065c0d43b5bf889f78", "ACTIVE_LOCK_HASH_MISMATCH");
  assert(lock.immutable_locked_inputs.length === 51, "LOCK_COUNT_MISMATCH");
  for (const item of lock.immutable_locked_inputs) {
    const actual = await bytes(path.join(WORKSPACE, item.path));
    assert(sha(actual) === item.sha256, "LOCKED_INPUT_HASH_MISMATCH", item.path);
    assert(actual.length === item.bytes, "LOCKED_INPUT_SIZE_MISMATCH", item.path);
  }
  const mutablePaths = new Set(lock.mutable_governance_baseline.map((item) => item.path));
  assert(mutablePaths.size === 2, "MUTABLE_CONTROL_PLANE_COUNT_MISMATCH");
  assert(!lock.immutable_locked_inputs.some((item) => mutablePaths.has(item.path)), "MUTABLE_CONTROL_PLANE_LOCKED");
  assert(sha(await bytes(path.join(WORKSPACE, lock.previous_lock.path))) === lock.previous_lock.sha256, "PREVIOUS_LOCK_HASH_MISMATCH");
  assert(sha(await bytes(path.join(WORKSPACE, lock.inventory.path))) === lock.inventory.sha256, "LOCK_INVENTORY_HASH_MISMATCH");
  assert(sha(await bytes(path.join(WORKSPACE, lock.exact_denominators.path))) === lock.exact_denominators.sha256, "EXACT_DENOMINATOR_HASH_MISMATCH");
  output.checks.active_lock_revision_2 = "PASS_51_OF_51";
}

async function loadMappings() {
  const names = {
    knowledge: "knowledge-disposition.json",
    lessons: "lesson-source-map.json",
    python: "python-execution-map.json",
    visuals: "visual-migration-inventory.json",
    marking: "marking-disposition.json",
    assessment: "assessment-item-map.json",
  };
  const payloads = {};
  for (const [key, name] of Object.entries(names)) payloads[key] = await json(path.join(MAP, name));
  return { names, payloads, manifest: await json(path.join(MAP, "manifest.json")) };
}

async function verifyManifestAndDeterminism(names, payloads, manifest) {
  assert(manifest.outputs.length === 6, "MANIFEST_OUTPUT_COUNT_MISMATCH");
  for (const entry of manifest.outputs) {
    assert(entry.path === `content/paper4/mappings/${names[entry.key]}`, "MANIFEST_PATH_MISMATCH", entry.key);
    assert(sha(await bytes(path.join(APP, entry.path))) === entry.sha256, "MANIFEST_OUTPUT_HASH_MISMATCH", entry.key);
    assert(sha(await bytes(path.join(WORKSPACE, "A_Level_CS_page/planning/paper4", entry.source_draft.path))) === entry.source_draft.sha256, "SOURCE_DRAFT_HASH_MISMATCH", entry.key);
    assert(payloads[entry.key].promotion.source_draft.sha256 === entry.source_draft.sha256, "PROMOTION_SOURCE_HASH_MISMATCH", entry.key);
  }

  const sourceFiles = {
    knowledge: "a1-a4/KNOWLEDGE_DISPOSITION_DRAFT.json",
    lessons: "a1-a4/LESSON_SOURCE_MAP_DRAFT.json",
    python: "a3-a5/PYTHON_EXECUTION_MAP_DRAFT.json",
    visuals: "a3-a5/VISUAL_MIGRATION_INVENTORY.json",
    marking: "a7/MARKING_DISPOSITION_DRAFT.json",
    assessment: "a7/ASSESSMENT_ITEM_MAP_DRAFT.json",
  };
  const generatedTrees = [];
  await rm(TMP, { recursive: true, force: true });
  try {
    for (const run of ["run-1", "run-2"]) {
      const root = path.join(TMP, run);
      const tempApp = path.join(root, "algocore-fumadocs");
      await mkdir(path.join(tempApp, "scripts"), { recursive: true });
      await copyFile(path.join(APP, "scripts/generate-paper4-p4r1-mappings.mjs"), path.join(tempApp, "scripts/generate-paper4-p4r1-mappings.mjs"));
      for (const rel of Object.values(sourceFiles)) {
        const target = path.join(root, "planning/paper4/next-phase/evidence/p4r-1", rel);
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(path.join(NEXT, "evidence/p4r-1", rel), target);
      }
      execFileSync(process.execPath, [path.join(tempApp, "scripts/generate-paper4-p4r1-mappings.mjs")], { stdio: "pipe" });
      const hashes = {};
      for (const name of [...Object.values(names), "manifest.json"]) {
        hashes[name] = sha(await bytes(path.join(tempApp, "content/paper4/mappings", name)));
      }
      generatedTrees.push(hashes);
    }
    assert(JSON.stringify(generatedTrees[0]) === JSON.stringify(generatedTrees[1]), "GENERATOR_NONDETERMINISTIC");
    for (const name of [...Object.values(names), "manifest.json"]) {
      assert(generatedTrees[0][name] === sha(await bytes(path.join(MAP, name))), "GENERATED_CANONICAL_DRIFT", name);
    }
  } finally {
    await rm(TMP, { recursive: true, force: true });
  }
  output.checks.manifest_hashes = "PASS_7_OF_7";
  output.checks.generator_determinism = "PASS_2_BYTE_IDENTICAL_RUNS_AND_CANONICAL_MATCH";
}

async function verifyIdentity(payloads, manifest) {
  const exact = await json(EXACT_PATH);
  const visual = flatVisual(payloads.visuals);
  const actual = {
    knowledge_blocks: payloads.knowledge.records.map((item) => item.knowledge_block_id),
    lessons: payloads.lessons.lessons.map((item) => item.lesson_id),
    python_lessons: payloads.python.lessons.map((item) => item.lesson_id),
    patterns: payloads.visuals.patterns.map((item) => item.pattern_id),
    scenarios: visual.scenarios.map((item) => item.scenario_id),
    events: visual.events.map((item) => item.event_id),
    marking_atoms: payloads.marking.marking_atom_dispositions.map((item) => item.marking_point_id),
    marking_chains: payloads.marking.marking_chains.map((item) => item.pattern_id),
    assessment_requirements: payloads.assessment.assessment_requirement_dispositions.map((item) => item.assessment_requirement_id),
    assessment_destinations: payloads.assessment.assessment_destination_dispositions.map((item) => item.destination_id),
    practice_items: payloads.assessment.assessment_items.map((item) => item.assessment_item_id),
  };
  const expected = {
    knowledge_blocks: exact.sets.knowledge_blocks.ids,
    lessons: exact.sets.lessons.ids,
    python_lessons: exact.sets.lessons.ids,
    patterns: exact.sets.patterns.ids,
    scenarios: exact.sets.scenarios.ids,
    events: exact.sets.events.ids,
    marking_atoms: exact.sets.marking_atoms.ids,
    marking_chains: exact.sets.patterns.ids,
    assessment_requirements: exact.sets.assessment_requirements.ids,
    assessment_destinations: exact.sets.assessment_destinations.ids,
    practice_items: exact.sets.practice_items.items.map((item) => item.stable_id),
  };
  for (const key of Object.keys(expected)) {
    assert(equalSet(actual[key], expected[key]), "EXACT_IDENTITY_MISMATCH", key);
    output.counts[key] = actual[key].length;
  }
  assert(Object.entries(manifest.identity_set_sha256).every(([key, hash]) => {
    const lookup = {
      knowledge_block_ids: actual.knowledge_blocks,
      lesson_ids: actual.lessons,
      python_lesson_ids: actual.python_lessons,
      visual_pattern_ids: actual.patterns,
      visual_scenario_ids: actual.scenarios,
      visual_event_ids: actual.events,
      marking_chain_ids: payloads.marking.marking_chains.map((item) => item.marking_chain_id),
      marking_atom_ids: actual.marking_atoms,
      assessment_requirement_ids: actual.assessment_requirements,
      assessment_destination_ids: actual.assessment_destinations,
      assessment_item_ids: actual.practice_items,
    }[key];
    return lookup && stableHash(lookup) === hash;
  }), "MANIFEST_IDENTITY_HASH_MISMATCH");
  output.checks.exact_count_and_identity = "PASS_11_OF_11";
}

async function verifySourcesAndAuthority(payloads) {
  const objectiveInventory = await json(path.join(STAGE3, "evidence/A3_OBJECTIVE_INVENTORY.json"));
  const bookMap = await json(path.join(STAGE3, "BOOK_KNOWLEDGE_MAP.json"));
  const release = await json(path.join(STAGE3, "RELEASE_MANIFEST.json"));
  const objectiveManifestEntry = release.files.find((item) => item.path === "evidence/A3_OBJECTIVE_INVENTORY.json");
  assert(objectiveManifestEntry, "OBJECTIVE_INVENTORY_NOT_IN_LOCKED_RELEASE_MANIFEST");
  assert(sha(await bytes(path.join(STAGE3, objectiveManifestEntry.path))) === objectiveManifestEntry.sha256, "OBJECTIVE_INVENTORY_MANIFEST_HASH_MISMATCH");
  const objectives = new Map(objectiveInventory.objectives.map((item) => [item.objective_id, item]));
  const bookSections = new Map(bookMap.sections.map((item) => [item.section_id, item]));
  const bookBlocks = new Map(bookMap.knowledge_blocks.map((item) => [item.knowledge_id, item]));
  let objectiveRefs = 0;
  let bookRefs = 0;
  for (const lesson of payloads.lessons.lessons) {
    assert(lesson.direct_locator_status === "COMPLETE_UPSTREAM_LOCATORS_AVAILABLE", "LESSON_LOCATOR_STATUS_INCOMPLETE", lesson.lesson_id);
    assert(lesson.unresolved_objective_ids.length === 0 && lesson.unresolved_book_section_ids.length === 0, "LESSON_LOCATOR_UNRESOLVED", lesson.lesson_id);
    for (const ref of lesson.objective_refs) {
      const upstream = objectives.get(ref.objective_id);
      assert(upstream, "OBJECTIVE_REF_UNRESOLVED", ref.objective_id);
      assert(ref.source.source_id === upstream.source.source_id
        && ref.source.pdf_page === upstream.source.pdf_page
        && ref.source.heading === upstream.source.heading
        && ref.source.bullet_locator === upstream.source.bullet_locator
        && ref.source.anchor_text === upstream.source.anchor_text,
      "OBJECTIVE_LOCATOR_DRIFT", ref.objective_id);
      objectiveRefs += 1;
    }
    for (const ref of lesson.book_refs) {
      const upstream = bookSections.get(ref.section_id);
      assert(upstream, "BOOK_REF_UNRESOLVED", ref.section_id);
      for (const key of ["source_id", "chapter", "section", "subheading", "support_level", "supported_knowledge_actions"])
        assert(JSON.stringify(ref[key]) === JSON.stringify(upstream[key]), "BOOK_LOCATOR_DRIFT", `${ref.section_id}.${key}`);
      for (const key of ["printed_pages", "pdf_pages", "limitations"])
        assert(JSON.stringify(ref[key]) === JSON.stringify(upstream[key]), "BOOK_LOCATOR_DRIFT", `${ref.section_id}.${key}`);
      bookRefs += 1;
    }
  }
  for (const record of payloads.knowledge.records) {
    const upstream = bookBlocks.get(record.knowledge_block_id);
    assert(upstream, "KNOWLEDGE_BLOCK_UNRESOLVED", record.knowledge_block_id);
    assert(record.lesson_id === upstream.lesson_id
      && equalSet(record.objective_ids, upstream.objective_ids)
      && equalSet(record.book_section_ids, upstream.book_section_ids), "KNOWLEDGE_BLOCK_SOURCE_DRIFT", record.knowledge_block_id);
  }
  const promotionPayloads = Object.values(payloads);
  assert(promotionPayloads.every((item) => item.status === "APPROVED_FOR_P4R2_INPUT_WITH_CARRYOVER"
    && item.promotion.content_claim === "MAPPING_INPUT_ONLY_NOT_RELEASE_CONTENT"), "MAPPING_AUTHORITY_ESCALATION");
  assert(payloads.assessment.assessment_items.every((item) => item.official_marks === null
    && item.self_rubric.official_marks === null), "ASSESSMENT_OFFICIAL_MARKS_FORGED");
  assert(payloads.assessment.assessment_requirement_dispositions.every((item) => item.official_marks === null)
    && payloads.assessment.assessment_destination_dispositions.every((item) => item.official_marks === null), "ASSESSMENT_AUTHORITY_FORGED");
  assert(payloads.marking.marking_atom_dispositions.every((item) => item.authority === "official_ms"
    && /cited QP\/MS context/.test(item.authority_policy)
    && item.qp_locators.length > 0 && item.ms_locator), "MARKING_SOURCE_LOCATOR_OR_AUTHORITY_INVALID");
  output.checks.source_locator_resolution = `PASS_${objectiveRefs}_OBJECTIVE_REFS_${bookRefs}_BOOK_REFS_108_BLOCKS`;
  output.checks.authority_boundaries = "PASS";
}

async function verifyA0PythonAndCarryovers(payloads, manifest) {
  const a0 = await json(A0_PATH);
  const expectedA0 = a0.assignments.map((item) => item.assessment_item_id);
  const actualA0 = payloads.assessment.assessment_items
    .filter((item) => item.source_identity_authority === "A0_LEAD_ID_NORMALIZATION")
    .map((item) => item.assessment_item_id);
  assert(equalSet(expectedA0, actualA0) && expectedA0.length === 15, "A0_ID_PRESERVATION_FAILED");
  assert(payloads.python.lessons.length === 26
    && payloads.python.lessons.every((item) => item.execution_disposition === "RERUN_REQUIRED"
      && item.execution_claim_allowed === false && item.exact_hash_matches.length === 0), "PYTHON_RERUN_DISPOSITION_INVALID");

  const visual = flatVisual(payloads.visuals);
  const recomputed = {
    python_rerun_required_lessons: payloads.python.lessons.filter((item) => item.execution_disposition === "RERUN_REQUIRED").length,
    visual_unmapped_event_labels: visual.events.filter((item) => item.vocabulary_status === "UNMAPPED").length,
    visual_event_type_mismatches: visual.events.filter((item) => item.event_type_status === "MISMATCH").length,
    visual_non_python_code_token_events: visual.events.filter((item) => item.code_binding_status === "NON_PYTHON_TOKEN_NO_ARTIFACT_VERSION_JOIN").length,
    visual_cloned_trace_patterns: payloads.visuals.patterns.filter((item) => item.cloned_scenario_finding.same_trace_for_normal_boundary_failure).length,
    marking_atoms_with_source_issue_refs: payloads.marking.marking_atom_dispositions.filter((item) => item.source_issue_refs.length > 0).length,
    marking_atoms_without_unambiguous_source_mark_value: payloads.marking.marking_atom_dispositions.filter((item) => item.source_mark_value_if_unambiguous === null).length,
    requirements_without_pattern_link: payloads.assessment.assessment_requirement_dispositions.filter((item) => item.pattern_link_status !== "LINKED").length,
    patternless_lessons: new Set(payloads.assessment.assessment_items.filter((item) => item.pattern_ids.length === 0).map((item) => item.lesson_id)).size,
    practice_items_without_pattern_link: payloads.assessment.assessment_items.filter((item) => item.pattern_ids.length === 0).length,
    legacy_items_without_explicit_prompt: payloads.assessment.assessment_items.filter((item) => item.source_shape === "practiceFlow" && item.prompt === null).length,
    regular_items_with_generic_rubric: payloads.assessment.assessment_items.filter((item) => item.source_shape === "practiceItems"
      && item.self_rubric?.criteria?.vi?.[0] === "bao phủ yêu cầu").length,
    items_without_explicit_pass_rule: payloads.assessment.assessment_items.filter((item) => item.self_rubric?.pass_rule == null).length,
  };
  for (const [key, value] of Object.entries(manifest.required_carryovers)) {
    assert(recomputed[key] === value, "CARRYOVER_RECOMPUTE_MISMATCH", `${key}: ${recomputed[key]} != ${value}`);
  }
  output.checks.a0_stable_ids = "PASS_15_OF_15";
  output.checks.python_execution_disposition = "PASS_26_RERUN_REQUIRED_0_CLAIMS";
  output.checks.required_carryovers_visible = "PASS_13_OF_13";
  output.carryovers = recomputed;
}

try {
  await verifyActiveLock();
  const { names, payloads, manifest } = await loadMappings();
  await verifyManifestAndDeterminism(names, payloads, manifest);
  await verifyIdentity(payloads, manifest);
  await verifySourcesAndAuthority(payloads);
  await verifyA0PythonAndCarryovers(payloads, manifest);
} catch (error) {
  output.decision = "REWORK_REQUIRED";
  output.findings.push(error.message);
  process.exitCode = 1;
} finally {
  await rm(TMP, { recursive: true, force: true });
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
