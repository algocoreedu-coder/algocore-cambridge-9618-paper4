import type {
  ProceduralDesignLearnerProjection,
  ProceduralScenarioKind,
  ProceduralTraceStep,
  ProceduralTraceVariant,
} from "./learnerProjection";

export const PROCEDURAL_DESIGN_PROJECTION_SHA256 = "D8D2A1458A8E76AF9CDDD6A147869C9988C9576B531FE065A5036BE11B555C41";
export const PROCEDURAL_DESIGN_PROGRESS_KEY = "algocore.paper4.learner.procedural-design.trace.v1";
export const PROCEDURAL_DESIGN_PROTECT_KEY = "algocore.paper4.learner.procedural-design.protect-marks.v1";
export const PROCEDURAL_DESIGN_TRACE_SCHEMA = "paper4-procedural-design-trace-progress-v1";

export type ProceduralTraceCheckpointId = "normal:0" | "normal:1" | "normal:2";
export type ProceduralTraceDraftId = ProceduralTraceCheckpointId | "boundary:0" | "failure:0";
export type ProceduralTraceCase = Readonly<{
  kind: ProceduralScenarioKind;
  label: string;
  scores: readonly number[];
  bonus: number | string;
  expected: Readonly<{ status: "OK" | "INVALID_INPUT"; adjusted: readonly number[]; labels: readonly string[] }>;
  explanation?: Readonly<{ en: string; vi: string }>;
}>;

export type ProceduralTraceProgress = Readonly<{
  schema_version: typeof PROCEDURAL_DESIGN_TRACE_SCHEMA;
  projection_sha256: typeof PROCEDURAL_DESIGN_PROJECTION_SHA256;
  scenario: ProceduralScenarioKind;
  checkpoint_index: 0 | 1 | 2;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<ProceduralTraceDraftId, string>>>;
  revealed_checkpoint_ids: readonly ProceduralTraceCheckpointId[];
}>;

const normalIds: readonly ProceduralTraceCheckpointId[] = ["normal:0", "normal:1", "normal:2"];
const draftIds: readonly ProceduralTraceDraftId[] = [...normalIds, "boundary:0", "failure:0"];

export function checkpointId(index: number): ProceduralTraceCheckpointId {
  if (index === 0) return "normal:0";
  if (index === 1) return "normal:1";
  return "normal:2";
}

export function isNormalComplete(progress: Pick<ProceduralTraceProgress, "drafts" | "revealed_checkpoint_ids">) {
  return normalIds.every((id) => progress.revealed_checkpoint_ids.includes(id) && Boolean(progress.drafts[id]?.trim()));
}

export function createInitialProceduralProgress(): ProceduralTraceProgress {
  return {
    schema_version: PROCEDURAL_DESIGN_TRACE_SCHEMA,
    projection_sha256: PROCEDURAL_DESIGN_PROJECTION_SHA256,
    scenario: "normal",
    checkpoint_index: 0,
    phase: "predict",
    drafts: {},
    revealed_checkpoint_ids: [],
  };
}

function isCheckpointIndex(value: unknown): value is 0 | 1 | 2 {
  return value === 0 || value === 1 || value === 2;
}

export function restoreProceduralProgress(raw: string | null): ProceduralTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.schema_version !== PROCEDURAL_DESIGN_TRACE_SCHEMA || value.projection_sha256 !== PROCEDURAL_DESIGN_PROJECTION_SHA256) return null;
    if (value.scenario !== "normal" && value.scenario !== "boundary" && value.scenario !== "failure") return null;
    if (!isCheckpointIndex(value.checkpoint_index) || (value.phase !== "predict" && value.phase !== "revealed")) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts)) return null;
    const drafts = Object.fromEntries(Object.entries(value.drafts).filter(([id, draft]) => draftIds.includes(id as ProceduralTraceDraftId) && typeof draft === "string"));
    if (Object.keys(drafts).length !== Object.keys(value.drafts).length || !Array.isArray(value.revealed_checkpoint_ids)) return null;
    const revealed = value.revealed_checkpoint_ids.filter((id): id is ProceduralTraceCheckpointId => typeof id === "string" && normalIds.includes(id as ProceduralTraceCheckpointId));
    if (revealed.length !== value.revealed_checkpoint_ids.length || revealed.some((id) => !drafts[id]?.trim())) return null;
    return { ...createInitialProceduralProgress(), scenario: value.scenario, checkpoint_index: value.checkpoint_index, phase: value.phase, drafts, revealed_checkpoint_ids: [...new Set(revealed)] };
  } catch {
    return null;
  }
}

export function proceduralCases(projection: ProceduralDesignLearnerProjection): readonly ProceduralTraceCase[] {
  const scenario = projection.stages.trace.scenario;
  const normal: ProceduralTraceCase = {
    kind: "normal",
    label: scenario.label.en,
    scores: scenario.scores,
    bonus: scenario.bonus,
    expected: { status: "OK", adjusted: [40, 70, 87], labels: ["PASS", "DISTINCTION", "DISTINCTION"] },
  };
  return [normal, ...projection.stages.trace.variants.map((variant) => variantCase(variant))];
}

function variantCase(variant: ProceduralTraceVariant): ProceduralTraceCase {
  return { kind: variant.kind, label: variant.kind, scores: variant.input.scores, bonus: variant.input.bonus, expected: variant.expected, explanation: variant.explanation };
}

export function stepFor(projection: ProceduralDesignLearnerProjection, index: 0 | 1 | 2): ProceduralTraceStep {
  const step = projection.stages.trace.steps[index];
  if (!step || step.step !== index + 1) throw new Error("Procedural trace steps do not match the approved 3-checkpoint sequence.");
  return step;
}
