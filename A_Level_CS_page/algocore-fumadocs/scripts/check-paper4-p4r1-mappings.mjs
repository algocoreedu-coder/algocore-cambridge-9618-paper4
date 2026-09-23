import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.join(APP_ROOT, "content/paper4/mappings");
const STATUS = "APPROVED_FOR_P4R2_INPUT_WITH_CARRYOVER";
const FILES = {
  knowledge: "knowledge-disposition.json",
  lessons: "lesson-source-map.json",
  python: "python-execution-map.json",
  visuals: "visual-migration-inventory.json",
  marking: "marking-disposition.json",
  assessment: "assessment-item-map.json",
};
const EXPECTED_COUNTS = {
  knowledge_block_ids: 108,
  lesson_ids: 26,
  python_lesson_ids: 26,
  visual_pattern_ids: 58,
  visual_scenario_ids: 174,
  visual_event_ids: 331,
  marking_chain_ids: 58,
  marking_atom_ids: 2236,
  assessment_requirement_ids: 107,
  assessment_destination_ids: 37,
  assessment_item_ids: 78,
};
const EXPECTED_IDENTITY_HASHES = {
  knowledge_block_ids: "fc3b3a42e9bbf7053a3c79d17cf32b370340e7b86d420fae9ceb6b90a77c38fc",
  lesson_ids: "6ced1a7604c1b3138f50951486dc386d614ddb379984919bfe320451cb7104ee",
  python_lesson_ids: "6ced1a7604c1b3138f50951486dc386d614ddb379984919bfe320451cb7104ee",
  visual_pattern_ids: "39e8a7dd0817a6a1ab086c6eb2b29f4fdf7077342cae7a8843190902b0ef518c",
  visual_scenario_ids: "7507b86883820c00e6793451251de96d8989febde39b7d8710abdb798e1806c4",
  visual_event_ids: "8d08b41d27f3f035b03a35d3f764fee6dabcab1047bcfe3f4a6a86863bb1f2d5",
  marking_chain_ids: "2d58d2c4ec9125916eedecc1158188a77c7fc4f5d753740673c2a4ac7ad19b81",
  marking_atom_ids: "4a8cd3778ca5f617067994e70c24010297b4950c4fc502c21c622f8ac6578f0f",
  assessment_requirement_ids: "6f3e368d0701a2c11174330baf19eee2a0ae06cdaa29012b136c27e063f5eb76",
  assessment_destination_ids: "40d7fbcbabbe8a70a1dbea0242e560df42441e1ec509208e84a1cd7701961fe2",
  assessment_item_ids: "ed39aa57e47da4d5063a31a8f69ed9f069bf08c36ee20371b3b746cfe36b6750",
};
const EXPECTED_SOURCE_DRAFT_HASHES = {
  knowledge: "907f0c5a9f28ea998e81517b361a9009e66769a1453036d6e8200476cf1569f9",
  lessons: "b8c1acbca5b0a867db21e7c1344a1296d9809b74ae8c1755cea6f632501fd939",
  python: "f6c9f7c4d6a26e324512c0c485c4abfac4365493b8adb951f836c65a797c197c",
  visuals: "b7a3906cf066feb74286876b5544bc73ae34aa41f37c5297d509c725ac333599",
  marking: "e7f38c44b6a45e051b47e3cc32c3d495287a41ada1bafd3964e49a17be3f0fa7",
  assessment: "d4305d4aa716af6776535b3674f2cb836fc8e7a28c0b262f5981263701cedd24",
};
const A0_IDS = [
  "ac-9618-p4-2026-python.lesson.queue.practice.guided",
  "ac-9618-p4-2026-python.lesson.queue.practice.faded",
  "ac-9618-p4-2026-python.lesson.queue.practice.independent",
  "ac-9618-p4-2026-python.lesson.linked-list.practice.guided",
  "ac-9618-p4-2026-python.lesson.linked-list.practice.faded",
  "ac-9618-p4-2026-python.lesson.linked-list.practice.independent",
  "ac-9618-p4-2026-python.lesson.recursion.practice.guided",
  "ac-9618-p4-2026-python.lesson.recursion.practice.faded",
  "ac-9618-p4-2026-python.lesson.recursion.practice.independent",
  "ac-9618-p4-2026-python.lesson.dictionary.practice.guided",
  "ac-9618-p4-2026-python.lesson.dictionary.practice.faded",
  "ac-9618-p4-2026-python.lesson.dictionary.practice.independent",
  "ac-9618-p4-2026-python.lesson.hashing.practice.guided",
  "ac-9618-p4-2026-python.lesson.hashing.practice.faded",
  "ac-9618-p4-2026-python.lesson.hashing.practice.independent",
];
const EXPECTED_CARRYOVERS = {
  python_rerun_required_lessons: 26,
  visual_unmapped_event_labels: 328,
  visual_event_type_mismatches: 3,
  visual_non_python_code_token_events: 331,
  visual_cloned_trace_patterns: 58,
  marking_atoms_with_source_issue_refs: 293,
  marking_atoms_without_unambiguous_source_mark_value: 68,
  requirements_without_pattern_link: 36,
  patternless_lessons: 6,
  practice_items_without_pattern_link: 18,
  legacy_items_without_explicit_prompt: 15,
  regular_items_with_generic_rubric: 42,
  items_without_explicit_pass_rule: 33,
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableIdentityHash(values) {
  return sha256([...values].sort().join("\n"));
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function assert(condition, code, details = "") {
  if (!condition) throw new Error(`${code}${details ? `: ${details}` : ""}`);
}

function unique(values, label) {
  const set = new Set(values);
  assert(set.size === values.length, "DUPLICATE_ID", label);
  return set;
}

function subset(values, target, label) {
  const missing = values.filter((value) => !target.has(value));
  assert(missing.length === 0, "BROKEN_JOIN", `${label}: ${missing.slice(0, 5).join(", ")}`);
}

async function readCanonical(filename) {
  const bytes = await readFile(path.join(ROOT, filename));
  const parsed = JSON.parse(bytes.toString("utf8"));
  assert(bytes.toString("utf8") === canonicalJson(parsed), "NON_CANONICAL_JSON", filename);
  return { parsed, bytes };
}

function identities(payloads) {
  const scenarios = payloads.visuals.patterns.flatMap((pattern) => pattern.scenarios);
  const events = payloads.visuals.patterns.flatMap((pattern) => pattern.events);
  return {
    knowledge_block_ids: payloads.knowledge.records.map((item) => item.knowledge_block_id),
    lesson_ids: payloads.lessons.lessons.map((item) => item.lesson_id),
    python_lesson_ids: payloads.python.lessons.map((item) => item.lesson_id),
    visual_pattern_ids: payloads.visuals.patterns.map((item) => item.pattern_id),
    visual_scenario_ids: scenarios.map((item) => item.scenario_id),
    visual_event_ids: events.map((item) => item.event_id),
    marking_chain_ids: payloads.marking.marking_chains.map((item) => item.marking_chain_id),
    marking_atom_ids: payloads.marking.marking_atom_dispositions.map((item) => item.marking_point_id),
    assessment_requirement_ids: payloads.assessment.assessment_requirement_dispositions.map(
      (item) => item.assessment_requirement_id,
    ),
    assessment_destination_ids: payloads.assessment.assessment_destination_dispositions.map(
      (item) => item.destination_id,
    ),
    assessment_item_ids: payloads.assessment.assessment_items.map((item) => item.assessment_item_id),
  };
}

function validateStatusAndAuthority(payloads) {
  for (const [key, payload] of Object.entries(payloads)) {
    assert(payload.status === STATUS, "PROMOTION_STATUS_MISMATCH", key);
    assert(payload.promotion?.status === STATUS, "PROMOTION_RECORD_MISSING", key);
    assert(
      payload.promotion?.content_claim === "MAPPING_INPUT_ONLY_NOT_RELEASE_CONTENT",
      "CONTENT_CLAIM_ESCALATION",
      key,
    );
    assert(/^[a-f0-9]{64}$/.test(payload.promotion.source_draft.sha256), "SOURCE_HASH_INVALID", key);
  }
  assert(
    payloads.knowledge.records.every(
      (record) => record.final_disposition === "publish" && record.draft_status === "LEAD_APPROVED_FOR_P4R2_INPUT",
    ),
    "KNOWLEDGE_DISPOSITION_NOT_FINAL",
  );
  assert(
    payloads.knowledge.records.every(
      (record) => record.direct_locator_resolution.coursebook === "AVAILABLE_UPSTREAM"
        && record.direct_locator_resolution.syllabus === "AVAILABLE_UPSTREAM",
    ),
    "SOURCE_AUTHORITY_UNRESOLVED",
  );
  assert(
    payloads.python.lessons.every(
      (lesson) => lesson.execution_disposition === "RERUN_REQUIRED"
        && lesson.execution_claim_allowed === false
        && lesson.exact_hash_matches.length === 0,
    ),
    "PYTHON_GAP_WAS_CLOSED_WITHOUT_EVIDENCE",
  );
  assert(
    payloads.assessment.assessment_items.every(
      (item) => item.official_marks === null && item.self_rubric?.official_marks === null,
    ),
    "ASSESSMENT_AUTHORITY_ESCALATION",
  );
  assert(
    payloads.assessment.assessment_requirement_dispositions.every((item) => item.official_marks === null)
      && payloads.assessment.assessment_destination_dispositions.every((item) => item.official_marks === null),
    "ASSESSMENT_MARKS_INVENTED",
  );
  assert(
    payloads.marking.marking_atom_dispositions.every(
      (atom) => atom.qp_locators?.length > 0 && atom.ms_locator,
    ),
    "MARKING_AUTHORITY_LOCATOR_MISSING",
  );
}

function validateJoins(payloads, ids) {
  const lessonIds = unique(ids.lesson_ids, "lesson_ids");
  const knowledgeIds = unique(ids.knowledge_block_ids, "knowledge_block_ids");
  const patternIds = unique(ids.visual_pattern_ids, "visual_pattern_ids");
  const eventIds = unique(ids.visual_event_ids, "visual_event_ids");
  const requirementIds = unique(ids.assessment_requirement_ids, "assessment_requirement_ids");
  const destinationIds = unique(ids.assessment_destination_ids, "assessment_destination_ids");
  const atomIds = unique(ids.marking_atom_ids, "marking_atom_ids");
  unique(ids.python_lesson_ids, "python_lesson_ids");
  unique(ids.visual_scenario_ids, "visual_scenario_ids");
  unique(ids.marking_chain_ids, "marking_chain_ids");
  unique(ids.assessment_item_ids, "assessment_item_ids");

  subset(payloads.knowledge.records.map((item) => item.lesson_id), lessonIds, "knowledge->lesson");
  subset(payloads.python.lessons.map((item) => item.lesson_id), lessonIds, "python->lesson");
  for (const lesson of payloads.lessons.lessons) {
    subset(lesson.knowledge_block_ids, knowledgeIds, `${lesson.lesson_id} knowledge`);
    subset(lesson.assessment_requirement_ids, requirementIds, `${lesson.lesson_id} requirements`);
  }
  for (const lesson of payloads.python.lessons) {
    subset(lesson.pattern_ids, patternIds, `${lesson.lesson_id} python patterns`);
  }
  const scenarioEventIds = [];
  for (const pattern of payloads.visuals.patterns) {
    for (const scenario of pattern.scenarios) {
      subset(scenario.event_ids, eventIds, `${scenario.scenario_id} events`);
      scenarioEventIds.push(...scenario.event_ids);
    }
    assert(
      pattern.events.every((event) => event.code_binding_status === "NON_PYTHON_TOKEN_NO_ARTIFACT_VERSION_JOIN"),
      "VISUAL_CODE_BINDING_GAP_WAS_CLOSED",
      pattern.pattern_id,
    );
  }
  subset(scenarioEventIds, eventIds, "scenario->event");
  const chainedAtoms = [];
  for (const chain of payloads.marking.marking_chains) {
    assert(patternIds.has(chain.pattern_id), "BROKEN_JOIN", `${chain.marking_chain_id}->pattern`);
    assert(lessonIds.has(chain.lesson_id), "BROKEN_JOIN", `${chain.marking_chain_id}->lesson`);
    subset(chain.marking_atom_ids, atomIds, `${chain.marking_chain_id} atoms`);
    chainedAtoms.push(...chain.marking_atom_ids);
  }
  assert(
    stableIdentityHash(chainedAtoms) === stableIdentityHash(ids.marking_atom_ids)
      && new Set(chainedAtoms).size === atomIds.size,
    "MARKING_ATOM_PARTITION_MISMATCH",
  );
  for (const item of payloads.assessment.assessment_items) {
    assert(lessonIds.has(item.lesson_id), "BROKEN_JOIN", `${item.assessment_item_id}->lesson`);
    subset(item.assessment_requirement_ids, requirementIds, `${item.assessment_item_id} requirements`);
    subset(item.destination_ids, destinationIds, `${item.assessment_item_id} destinations`);
    subset(item.pattern_ids, patternIds, `${item.assessment_item_id} patterns`);
  }
}

function validateCarryovers(payloads, manifest) {
  for (const [key, value] of Object.entries(EXPECTED_CARRYOVERS)) {
    assert(manifest.required_carryovers[key] === value, "CARRYOVER_COUNT_CHANGED", key);
  }
  assert(payloads.python.counts.rerun_required_lessons === 26, "PYTHON_RERUN_COUNT_CHANGED");
  assert(payloads.assessment.findings.length === 6, "ASSESSMENT_FINDINGS_DROPPED");
  assert(payloads.marking.findings.length === 2, "MARKING_FINDINGS_DROPPED");
  assert(payloads.visuals.required_migration.length > 0, "VISUAL_MIGRATION_REQUIREMENTS_DROPPED");
}

async function main() {
  const entries = Object.fromEntries(
    await Promise.all(Object.entries(FILES).map(async ([key, filename]) => [key, await readCanonical(filename)])),
  );
  const manifestEntry = await readCanonical("manifest.json");
  const payloads = Object.fromEntries(Object.entries(entries).map(([key, entry]) => [key, entry.parsed]));
  const manifest = manifestEntry.parsed;
  validateStatusAndAuthority(payloads);

  const ids = identities(payloads);
  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    assert(ids[key].length === expected, "COUNT_MISMATCH", `${key}: ${ids[key].length}/${expected}`);
    assert(manifest.counts[key] === expected, "MANIFEST_COUNT_MISMATCH", key);
    assert(
      manifest.identity_set_sha256[key] === stableIdentityHash(ids[key]),
      "IDENTITY_HASH_MISMATCH",
      key,
    );
    assert(
      stableIdentityHash(ids[key]) === EXPECTED_IDENTITY_HASHES[key],
      "APPROVED_IDENTITY_SET_CHANGED",
      key,
    );
  }
  validateJoins(payloads, ids);
  validateCarryovers(payloads, manifest);

  const assessmentById = new Map(
    payloads.assessment.assessment_items.map((item) => [item.assessment_item_id, item]),
  );
  for (const id of A0_IDS) {
    const item = assessmentById.get(id);
    assert(item, "A0_ID_MISSING", id);
    assert(item.source_identity_authority === "A0_LEAD_ID_NORMALIZATION", "A0_AUTHORITY_MISSING", id);
  }

  const manifestOutputs = new Map(manifest.outputs.map((item) => [item.key, item]));
  for (const [key, entry] of Object.entries(entries)) {
    const listed = manifestOutputs.get(key);
    assert(listed, "MANIFEST_OUTPUT_MISSING", key);
    assert(listed.sha256 === sha256(entry.bytes), "OUTPUT_HASH_MISMATCH", key);
    assert(
      listed.source_draft.sha256 === payloads[key].promotion.source_draft.sha256,
      "SOURCE_DRAFT_HASH_MISMATCH",
      key,
    );
    assert(
      listed.source_draft.sha256 === EXPECTED_SOURCE_DRAFT_HASHES[key],
      "APPROVED_SOURCE_DRAFT_CHANGED",
      key,
    );
  }

  process.stdout.write(`${JSON.stringify({
    status: "PASS_WITH_REQUIRED_CARRYOVERS",
    mode: "READ_ONLY_CANONICAL_ONLY",
    counts: manifest.counts,
    required_carryovers: manifest.required_carryovers,
    canonical_tree_sha256: sha256(
      [...Object.entries(entries), ["manifest", manifestEntry]]
        .map(([key, entry]) => `${key}:${sha256(entry.bytes)}`)
        .sort()
        .join("\n"),
    ),
  }, null, 2)}\n`);
}

await main();
