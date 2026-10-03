import type { PerformanceLearnerProjection, PerformanceTraceStep, PerformanceTraceVariant, SearchProbeRow } from "./learnerProjection";

export const PERFORMANCE_PROJECTION_SHA256 = "3A0334658455B99F00479F131C64F44CE28EE96A59CBAF1DCC13C77624BC1D60";
export const PERFORMANCE_PROGRESS_KEY = "algocore.paper4.learner.performance.trace.v1";
export const PERFORMANCE_PRACTICE_KEY = "algocore.paper4.learner.performance.practice.v1";
export const PERFORMANCE_PROTECT_KEY = "algocore.paper4.learner.performance.protect-marks.v1";
export const PERFORMANCE_TRACE_SCHEMA = "paper4-performance-static-comparison-progress-v1";
export const PERFORMANCE_PRACTICE_SCHEMA = "paper4-performance-practice-progress-v1";

export type PerformanceCheckpointId = "comparison:0" | "comparison:1" | "comparison:2";
export type PerformanceTraceProgress = Readonly<{
  schema_version: typeof PERFORMANCE_TRACE_SCHEMA;
  projection_sha256: typeof PERFORMANCE_PROJECTION_SHA256;
  checkpoint_index: 0 | 1 | 2;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<PerformanceCheckpointId, string>>>;
  revealed_checkpoint_ids: readonly PerformanceCheckpointId[];
}>;

const ids: readonly PerformanceCheckpointId[] = ["comparison:0", "comparison:1", "comparison:2"];

export function performanceCheckpointId(index: number): PerformanceCheckpointId {
  return index === 0 ? "comparison:0" : index === 1 ? "comparison:1" : "comparison:2";
}

export function performanceRows(projection: PerformanceLearnerProjection): readonly [SearchProbeRow, SearchProbeRow] {
  const rows = projection.stages.trace.scenario.rows;
  if (rows.length !== 2 || rows[0]?.algorithm !== "Linear Search" || rows[1]?.algorithm !== "Binary Search") throw new Error("Performance rows do not match the approved comparison.");
  if (rows[0].result_index !== 5 || rows[0].inspected_positions !== 6 || rows[1].result_index !== 5 || rows[1].inspected_positions !== 2) throw new Error("Performance evidence values do not match the approved probe.");
  return rows as readonly [SearchProbeRow, SearchProbeRow];
}

export function performanceStep(projection: PerformanceLearnerProjection, index: 0 | 1 | 2): PerformanceTraceStep {
  const step = projection.stages.trace.steps[index];
  if (!step || step.step !== index + 1 || step.code_focus.length > 3) throw new Error("Performance decisions do not match the approved three-step sequence.");
  return step;
}

export function performanceSupport(projection: PerformanceLearnerProjection): readonly [PerformanceTraceVariant, PerformanceTraceVariant] {
  const variants = projection.stages.trace.variants;
  if (variants.length !== 2 || variants[0]?.kind !== "valid_empty_boundary" || variants[1]?.kind !== "binary_precondition_blocked") throw new Error("Performance support cases do not match the approved boundary and blocked precondition.");
  return variants as readonly [PerformanceTraceVariant, PerformanceTraceVariant];
}

export function createInitialPerformanceProgress(): PerformanceTraceProgress {
  return { schema_version: PERFORMANCE_TRACE_SCHEMA, projection_sha256: PERFORMANCE_PROJECTION_SHA256, checkpoint_index: 0, phase: "predict", drafts: {}, revealed_checkpoint_ids: [] };
}

export function isPerformanceComplete(progress: Pick<PerformanceTraceProgress, "drafts" | "revealed_checkpoint_ids">) {
  return ids.every((id) => Boolean(progress.drafts[id]?.trim()) && progress.revealed_checkpoint_ids.includes(id));
}

function isIndex(value: unknown): value is 0 | 1 | 2 { return value === 0 || value === 1 || value === 2; }

export function restorePerformanceProgress(raw: string | null): PerformanceTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.schema_version !== PERFORMANCE_TRACE_SCHEMA || value.projection_sha256 !== PERFORMANCE_PROJECTION_SHA256) return null;
    if (!isIndex(value.checkpoint_index) || (value.phase !== "predict" && value.phase !== "revealed")) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts) || !Array.isArray(value.revealed_checkpoint_ids)) return null;
    const entries = Object.entries(value.drafts);
    const drafts = Object.fromEntries(entries.filter(([id, draft]) => ids.includes(id as PerformanceCheckpointId) && typeof draft === "string"));
    if (Object.keys(drafts).length !== entries.length) return null;
    const revealed = value.revealed_checkpoint_ids.filter((id): id is PerformanceCheckpointId => typeof id === "string" && ids.includes(id as PerformanceCheckpointId));
    if (revealed.length !== value.revealed_checkpoint_ids.length || revealed.some((id) => !drafts[id]?.trim())) return null;
    return { ...createInitialPerformanceProgress(), checkpoint_index: value.checkpoint_index, phase: value.phase, drafts, revealed_checkpoint_ids: [...new Set(revealed)] };
  } catch { return null; }
}
