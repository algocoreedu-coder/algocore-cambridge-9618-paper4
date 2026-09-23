import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_ROOT = path.resolve(
  APP_ROOT,
  "../planning/paper4/next-phase/evidence/p4r-1",
);
const OUTPUT_ROOT = path.join(APP_ROOT, "content/paper4/mappings");
const PROMOTION_STATUS = "APPROVED_FOR_P4R2_INPUT_WITH_CARRYOVER";
const GENERATOR_VERSION = "paper4-p4r1-mapping-promotion-v1";

const SOURCES = {
  knowledge: "a1-a4/KNOWLEDGE_DISPOSITION_DRAFT.json",
  lessons: "a1-a4/LESSON_SOURCE_MAP_DRAFT.json",
  python: "a3-a5/PYTHON_EXECUTION_MAP_DRAFT.json",
  visuals: "a3-a5/VISUAL_MIGRATION_INVENTORY.json",
  marking: "a7/MARKING_DISPOSITION_DRAFT.json",
  assessment: "a7/ASSESSMENT_ITEM_MAP_DRAFT.json",
};

const OUTPUTS = {
  knowledge: "knowledge-disposition.json",
  lessons: "lesson-source-map.json",
  python: "python-execution-map.json",
  visuals: "visual-migration-inventory.json",
  marking: "marking-disposition.json",
  assessment: "assessment-item-map.json",
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableIdentityHash(values) {
  return sha256([...values].sort().join("\n"));
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function loadSource(key) {
  const sourcePath = path.join(SOURCE_ROOT, SOURCES[key]);
  const bytes = await readFile(sourcePath);
  return {
    data: JSON.parse(bytes.toString("utf8")),
    source: {
      path: `next-phase/evidence/p4r-1/${SOURCES[key]}`,
      sha256: sha256(bytes),
    },
  };
}

function promotion(source) {
  return {
    status: PROMOTION_STATUS,
    target_release: "paper4-2026-s9-v2",
    source_draft: source,
    approval_basis: [
      "P4R-0 revision 2 input lock: PASS",
      "P4R-1 A4 schema validation: PASS",
      "Lead preservation-first mapping review",
    ],
    content_claim: "MAPPING_INPUT_ONLY_NOT_RELEASE_CONTENT",
  };
}

function promoteKnowledge(data, source) {
  const records = data.records.map((record) => ({
    ...record,
    final_disposition: "publish",
    draft_status: "LEAD_APPROVED_FOR_P4R2_INPUT",
  }));
  return {
    ...data,
    schema_version: "paper4-p4r1-knowledge-disposition-v1",
    authority: PROMOTION_STATUS,
    status: PROMOTION_STATUS,
    p4r0_status_at_creation: "PASS_REVISION_2",
    promotion: promotion(source),
    counts: {
      ...data.counts,
      final_dispositions_set: records.length,
      final_publish: records.filter((record) => record.final_disposition === "publish").length,
    },
    records,
  };
}

function promoteLessonSources(data, source) {
  return {
    ...data,
    schema_version: "paper4-p4r1-lesson-source-map-v1",
    authority: PROMOTION_STATUS,
    status: PROMOTION_STATUS,
    p4r0_status_at_creation: "PASS_REVISION_2",
    promotion: promotion(source),
    lessons: data.lessons.map((lesson) => ({
      ...lesson,
      draft_status: "LEAD_APPROVED_FOR_P4R2_INPUT",
    })),
  };
}

function promoteWithCarryover(data, source, schemaVersion) {
  return {
    ...data,
    schema_version: schemaVersion,
    status: PROMOTION_STATUS,
    promotion: promotion(source),
  };
}

function collectIdentities(payloads) {
  const visualScenarios = payloads.visuals.patterns.flatMap((pattern) => pattern.scenarios);
  const visualEvents = payloads.visuals.patterns.flatMap((pattern) => pattern.events);
  return {
    knowledge_block_ids: payloads.knowledge.records.map((item) => item.knowledge_block_id),
    lesson_ids: payloads.lessons.lessons.map((item) => item.lesson_id),
    python_lesson_ids: payloads.python.lessons.map((item) => item.lesson_id),
    visual_pattern_ids: payloads.visuals.patterns.map((item) => item.pattern_id),
    visual_scenario_ids: visualScenarios.map((item) => item.scenario_id),
    visual_event_ids: visualEvents.map((item) => item.event_id),
    marking_chain_ids: payloads.marking.marking_chains.map((item) => item.marking_chain_id),
    marking_atom_ids: payloads.marking.marking_atom_dispositions.map((item) => item.marking_point_id),
    assessment_requirement_ids: payloads.assessment.assessment_requirement_dispositions.map(
      (item) => item.assessment_requirement_id,
    ),
    assessment_destination_ids: payloads.assessment.assessment_destination_dispositions.map(
      (item) => item.destination_id,
    ),
    assessment_item_ids: payloads.assessment.assessment_items.map(
      (item) => item.assessment_item_id,
    ),
  };
}

async function main() {
  const loaded = Object.fromEntries(
    await Promise.all(
      Object.keys(SOURCES).map(async (key) => [key, await loadSource(key)]),
    ),
  );
  const payloads = {
    knowledge: promoteKnowledge(loaded.knowledge.data, loaded.knowledge.source),
    lessons: promoteLessonSources(loaded.lessons.data, loaded.lessons.source),
    python: promoteWithCarryover(
      loaded.python.data,
      loaded.python.source,
      "paper4-p4r1-python-execution-map-v1",
    ),
    visuals: promoteWithCarryover(
      loaded.visuals.data,
      loaded.visuals.source,
      "paper4-p4r1-visual-migration-inventory-v1",
    ),
    marking: promoteWithCarryover(
      loaded.marking.data,
      loaded.marking.source,
      "paper4-p4r1-marking-disposition-v1",
    ),
    assessment: promoteWithCarryover(
      loaded.assessment.data,
      loaded.assessment.source,
      "paper4-p4r1-assessment-item-map-v1",
    ),
  };

  await mkdir(OUTPUT_ROOT, { recursive: true });
  const outputEntries = [];
  for (const key of Object.keys(OUTPUTS)) {
    const bytes = json(payloads[key]);
    await writeFile(path.join(OUTPUT_ROOT, OUTPUTS[key]), bytes, "utf8");
    outputEntries.push({
      key,
      path: `content/paper4/mappings/${OUTPUTS[key]}`,
      sha256: sha256(bytes),
      source_draft: loaded[key].source,
    });
  }

  const identities = collectIdentities(payloads);
  const manifest = {
    schema_version: "paper4-p4r1-mapping-manifest-v1",
    generator_version: GENERATOR_VERSION,
    target_release: "paper4-2026-s9-v2",
    status: PROMOTION_STATUS,
    content_claim: "MAPPING_INPUT_ONLY_NOT_RELEASE_CONTENT",
    outputs: outputEntries,
    counts: Object.fromEntries(
      Object.entries(identities).map(([key, values]) => [key, values.length]),
    ),
    identity_set_sha256: Object.fromEntries(
      Object.entries(identities).map(([key, values]) => [key, stableIdentityHash(values)]),
    ),
    required_carryovers: {
      python_rerun_required_lessons: payloads.python.counts.rerun_required_lessons,
      visual_unmapped_event_labels: payloads.visuals.counts.unmapped_event_labels,
      visual_event_type_mismatches: payloads.visuals.counts.mapped_event_type_mismatches,
      visual_non_python_code_token_events: payloads.visuals.counts.non_python_code_token_events,
      visual_cloned_trace_patterns: payloads.visuals.counts.patterns_with_cloned_trace,
      marking_atoms_with_source_issue_refs: payloads.marking.counts.atoms_with_source_issue_refs,
      marking_atoms_without_unambiguous_source_mark_value:
        payloads.marking.counts.atoms_without_unambiguous_source_mark_value,
      requirements_without_pattern_link:
        payloads.assessment.counts.requirements_without_stage4_pattern_link,
      patternless_lessons: payloads.assessment.counts.patternless_lessons,
      practice_items_without_pattern_link:
        payloads.assessment.counts.practice_items_without_stage4_pattern_link,
      legacy_items_without_explicit_prompt:
        payloads.assessment.counts.legacy_items_without_explicit_prompt,
      regular_items_with_generic_rubric:
        payloads.assessment.counts.regular_items_with_generic_stage9_rubric,
      items_without_explicit_pass_rule:
        payloads.assessment.counts.items_without_explicit_pass_rule,
    },
  };
  await writeFile(path.join(OUTPUT_ROOT, "manifest.json"), json(manifest), "utf8");
  process.stdout.write(
    `${JSON.stringify({ status: "GENERATED", output_root: OUTPUT_ROOT, counts: manifest.counts })}\n`,
  );
}

await main();
