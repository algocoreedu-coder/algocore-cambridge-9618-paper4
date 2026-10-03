import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const writeJson = (path, value) => writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const sha256 = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

const manifest = readJson("app/data/paper4-v2/course-manifest.json");
const canonicalItems = readJson("content/paper4/records/full/assessment-items.json").map((item) => item.record);
const legacySupplemental = readJson("content/paper4/teacher/visible-assessment-crosswalk.json").records;
const requirements = readJson("../planning/paper4/stage-3/evidence/A1_OBJECTIVE_ASSESSMENT_REQUIREMENTS.json").requirements;
const lessonSlugs = new Set(manifest.lessons.map((lesson) => lesson.slug));

function normaliseLevel(item) {
  const value = typeof item?.level === "string" ? item.level : item?.level?.en;
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function lessonSlug(item) {
  return item.lesson_id.replace("ac-9618-p4-2026-python.lesson.", "");
}

function projectionFor(slug) {
  if (!lessonSlugs.has(slug)) throw new Error(`Unknown lesson slug in canonical assessment: ${slug}`);
  return readJson(`app/data/paper4-v2/learner-projections/${slug}.json`);
}

function resolvePath(source, path) {
  const segments = path.replaceAll("]", "").split(/[.[]/).filter(Boolean);
  return segments.reduce((value, segment) => value?.[/^\d+$/.test(segment) ? Number(segment) : segment], source);
}

const independentSeen = new Map();
const bridgeRecords = canonicalItems.map((item) => {
  const slug = lessonSlug(item);
  const projection = projectionFor(slug);
  const level = item.level.toLowerCase();
  let candidates = projection.stages.practise.items
    .map((task, index) => ({ task, index, level: normaliseLevel(task) }))
    .filter((candidate) => candidate.level === level);
  let usedTransferFallback = false;
  if (level === "independent" && candidates.length === 0) {
    candidates = projection.stages.practise.items
      .map((task, index) => ({ task, index, level: normaliseLevel(task) }))
      .filter((candidate) => candidate.level === "transfer");
    usedTransferFallback = candidates.length > 0;
  }

  let visibleTaskPath;
  let visibleTask;
  let stageAnchor;
  let bridgeKind = "canonical_level_to_projection_task";

  if (item.assessment_item_id.includes("p4r9-dsa-capstone")) {
    visibleTaskPath = "stages.recallAndContinue.exit_task";
    visibleTask = resolvePath(projection, visibleTaskPath);
    stageAnchor = "stage-recallAndContinue";
    bridgeKind = "canonical_capstone_to_visible_exit_task";
  } else {
    if (candidates.length === 0) throw new Error(`${slug}/${item.assessment_item_id}: no visible ${level} projection task.`);
    const occurrenceKey = `${slug}:${level}`;
    const occurrence = independentSeen.get(occurrenceKey) ?? 0;
    const candidate = candidates[Math.min(occurrence, candidates.length - 1)];
    independentSeen.set(occurrenceKey, occurrence + 1);
    visibleTaskPath = `stages.practise.items[${candidate.index}]`;
    visibleTask = candidate.task;
    stageAnchor = "stage-practise";
    if (usedTransferFallback) bridgeKind = "canonical_independent_to_projection_transfer_task";
  }

  if (!visibleTask) throw new Error(`${slug}/${item.assessment_item_id}: visible task path does not resolve.`);
  return {
    assessment_item_id: item.assessment_item_id,
    lesson_id: item.lesson_id,
    lesson_slug: slug,
    level: item.level,
    requirement_ids: item.assessment_requirement_ids,
    route: `/paper-4/lessons/${slug}`,
    stage_anchor: stageAnchor,
    visible_task_path: visibleTaskPath,
    visible_task_key: `${slug}:${visibleTaskPath}`,
    visible_task_sha256: sha256(visibleTask),
    bridge_kind: bridgeKind,
    render_state: "BRIDGED_TO_VISIBLE_PROJECTION_TASK",
  };
});

const canonicalRequirementIds = new Set(bridgeRecords.flatMap((record) => record.requirement_ids));
const expectedRequirementIds = new Set(requirements.map((requirement) => requirement.requirement_id));
const supplementalRecords = legacySupplemental
  .filter((record) => !canonicalRequirementIds.has(record.requirement_id))
  .map((record) => {
    const projection = projectionFor(record.lesson_slug);
    const task = resolvePath(projection, record.visible_task_path);
    if (!task) throw new Error(`${record.requirement_id}: supplemental task path does not resolve.`);
    const embedded = (task.assessment_requirement_ids ?? []).includes(record.requirement_id);
    return {
      requirement_id: record.requirement_id,
      lesson_slug: record.lesson_slug,
      route: `/paper-4/lessons/${record.lesson_slug}`,
      stage_anchor: "stage-practise",
      visible_task_path: record.visible_task_path,
      visible_task_key: `${record.lesson_slug}:${record.visible_task_path}`,
      visible_task_sha256: sha256(task),
      link_authority: embedded ? "projection_embedded_requirement" : "teacher_supplemental_crosswalk",
      task_metadata_state: embedded ? "EMBEDDED" : "PENDING_EMBEDDED_METADATA",
    };
  });

const resolvedRequirementIds = new Set([
  ...canonicalRequirementIds,
  ...supplementalRecords.map((record) => record.requirement_id),
]);
const missingRequirementIds = [...expectedRequirementIds].filter((id) => !resolvedRequirementIds.has(id)).sort();
const unknownRequirementIds = [...resolvedRequirementIds].filter((id) => !expectedRequirementIds.has(id)).sort();
if (missingRequirementIds.length || unknownRequirementIds.length) {
  throw new Error(`Requirement bridge mismatch. Missing: ${missingRequirementIds.join(", ") || "none"}; unknown: ${unknownRequirementIds.join(", ") || "none"}.`);
}

const output = {
  schema_version: "paper4-assessment-resolution-bridge-v1",
  generated_from: {
    canonical_assessments: "content/paper4/records/full/assessment-items.json",
    learner_projections: "app/data/paper4-v2/learner-projections/*.json",
    supplemental_crosswalk: "content/paper4/teacher/visible-assessment-crosswalk.json",
    assessment_requirements: "../planning/paper4/stage-3/evidence/A1_OBJECTIVE_ASSESSMENT_REQUIREMENTS.json",
  },
  semantics: {
    bridged: "The canonical item has a stable route and learner-visible task target. This does not claim that the full canonical prompt and rubric are rendered yet.",
    supplemental: "A Teacher-owned direct requirement-to-task link covers a requirement absent from the 79 canonical item requirement arrays.",
    pending_metadata: "The stable bridge resolves, but the requirement ID is not yet embedded in the learner projection task. E1 owns that content metadata change.",
  },
  counts: {
    canonical_assessment_items: bridgeRecords.length,
    canonical_requirements: canonicalRequirementIds.size,
    supplemental_requirements: supplementalRecords.length,
    resolved_requirements: resolvedRequirementIds.size,
    pending_embedded_metadata: supplementalRecords.filter((record) => record.task_metadata_state === "PENDING_EMBEDDED_METADATA").length,
  },
  canonical_assessment_records: bridgeRecords,
  supplemental_requirement_records: supplementalRecords,
};

writeJson("content/paper4/teacher/assessment-resolution-bridge.json", output);
console.log(JSON.stringify(output.counts, null, 2));
