import type { RecursionLearnerProjection, RecursionTraceStep, RecursionTraceVariant } from "./learnerProjection";

export const RECURSION_PROJECTION_SHA256 = "7F1CF8E367C9066C9025DAE544B51D1529D0DD96DF66D9D85BAEFE6904CC8C6B";
export const RECURSION_PROGRESS_KEY = "algocore.paper4.learner.recursion.trace.v1";
export const RECURSION_PRACTICE_KEY = "algocore.paper4.learner.recursion.practice.v1";
export const RECURSION_PROTECT_KEY = "algocore.paper4.learner.recursion.protect-marks.v1";
export const RECURSION_TRACE_SCHEMA = "paper4-recursion-call-stack-progress-v1";
export const RECURSION_PRACTICE_SCHEMA = "paper4-recursion-practice-progress-v1";

export type RecursionCheckpoint = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type RecursionCheckpointId = `normal:${RecursionCheckpoint}` | "boundary:empty" | "rejection:non-integer";
export type RecursionTraceProgress = Readonly<{
  schema_version: typeof RECURSION_TRACE_SCHEMA;
  projection_sha256: typeof RECURSION_PROJECTION_SHA256;
  case: "normal-recursive-sum";
  checkpoint: RecursionCheckpoint;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<RecursionCheckpointId, string>>>;
  reveal_ids: readonly RecursionCheckpointId[];
}>;
export type RecursionPracticeProgress = Readonly<{
  schema_version: typeof RECURSION_PRACTICE_SCHEMA;
  projection_sha256: typeof RECURSION_PROJECTION_SHA256;
  index: number;
  drafts: Readonly<Record<number, string>>;
  attempted: readonly number[];
}>;

const normalIds = ["normal:0", "normal:1", "normal:2", "normal:3", "normal:4", "normal:5", "normal:6", "normal:7"] as const;
const allIds: readonly RecursionCheckpointId[] = [...normalIds, "boundary:empty", "rejection:non-integer"];
const traceFields = ["schema_version", "projection_sha256", "case", "checkpoint", "phase", "drafts", "reveal_ids"] as const;
const practiceFields = ["schema_version", "projection_sha256", "index", "drafts", "attempted"] as const;

function hasExactFields(value: Record<string, unknown>, fields: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length && actual.every((field, index) => field === expected[index]);
}

function same(value: unknown, expected: unknown) { return JSON.stringify(value) === JSON.stringify(expected); }

export function assertRecursionProjection(projection: RecursionLearnerProjection) {
  const trace = projection.stages.trace;
  if (trace.representation !== "call_stack_with_unwind_lane" || !same(trace.scenario.values, [4, 7, 2]) || trace.scenario.initial_index !== 0 || trace.scenario.expected_result !== 13) throw new Error("Recursion scenario mismatch");
  if (trace.steps.length !== 8 || trace.variants.length !== 2 || projection.stages.practise.items.length !== 6 || projection.stages.protectMarks.mistakes.length !== 5 || projection.stages.recallAndContinue.recall_items.length !== 6) throw new Error("Recursion topology mismatch");
  const expected = [
    { event: "call", index: 0, stack: [0], returned: undefined },
    { event: "call", index: 1, stack: [0, 1], returned: undefined },
    { event: "call", index: 2, stack: [0, 1, 2], returned: undefined },
    { event: "call", index: 3, stack: [0, 1, 2, 3], returned: undefined },
    { event: "base_case", index: 3, stack: [0, 1, 2, 3], returned: 0 },
    { event: "return", index: 2, stack: [0, 1, 2], returned: 2 },
    { event: "return", index: 1, stack: [0, 1], returned: 9 },
    { event: "return", index: 0, stack: [0], returned: 13 },
  ] as const;
  trace.steps.forEach((step, index) => {
    const wanted = expected[index];
    if (!wanted || step.step !== index + 1 || step.event !== wanted.event || step.active_index !== wanted.index || !same(step.stack, wanted.stack) || step.code_focus.length < 1 || step.code_focus.length > 3) throw new Error("Recursion checkpoint mismatch");
    if (step.active_index === 3 && step.expected.read_current_value !== false && step.step >= 4) throw new Error("Base frame must not read values[3]");
    if (wanted.returned !== undefined && step.expected.returned !== wanted.returned) throw new Error("Recursion subtotal mismatch");
  });
  if (trace.variants[0]?.kind !== "boundary_empty_list" || trace.variants[0].expected.result !== 0 || trace.variants[1]?.kind !== "rejected_non_integer_input" || trace.variants[1].expected.frames_created !== 0) throw new Error("Recursion boundary/rejection mismatch");
}

export function recursionCheckpointId(index: number): RecursionCheckpointId { return normalIds[index] ?? "normal:0"; }
export function recursionStep(projection: RecursionLearnerProjection, index: RecursionCheckpoint): RecursionTraceStep { assertRecursionProjection(projection); const step = projection.stages.trace.steps[index]; if (!step) throw new Error("Recursion checkpoint missing"); return step; }
export function recursionVariants(projection: RecursionLearnerProjection): readonly [RecursionTraceVariant, RecursionTraceVariant] { assertRecursionProjection(projection); return projection.stages.trace.variants as readonly [RecursionTraceVariant, RecursionTraceVariant]; }
export function createInitialRecursionProgress(): RecursionTraceProgress { return { schema_version: RECURSION_TRACE_SCHEMA, projection_sha256: RECURSION_PROJECTION_SHA256, case: "normal-recursive-sum", checkpoint: 0, phase: "predict", drafts: {}, reveal_ids: [] }; }
export function isRecursionComplete(progress: Pick<RecursionTraceProgress, "drafts" | "reveal_ids">) { return normalIds.every((id) => Boolean(progress.drafts[id]?.trim()) && progress.reveal_ids.includes(id)); }

export function restoreRecursionProgress(raw: string | null): RecursionTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value) || !hasExactFields(value, traceFields)) return null;
    if (value.schema_version !== RECURSION_TRACE_SCHEMA || value.projection_sha256 !== RECURSION_PROJECTION_SHA256 || value.case !== "normal-recursive-sum") return null;
    if (![0,1,2,3,4,5,6,7].includes(value.checkpoint as number) || (value.phase !== "predict" && value.phase !== "revealed")) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts) || !Array.isArray(value.reveal_ids)) return null;
    const entries = Object.entries(value.drafts);
    if (entries.some(([id, draft]) => !allIds.includes(id as RecursionCheckpointId) || typeof draft !== "string")) return null;
    const drafts = Object.fromEntries(entries) as Partial<Record<RecursionCheckpointId, string>>;
    const reveals = value.reveal_ids;
    if (reveals.some((id) => typeof id !== "string" || !allIds.includes(id as RecursionCheckpointId)) || new Set(reveals).size !== reveals.length) return null;
    if (reveals.some((id) => !drafts[id as RecursionCheckpointId]?.trim())) return null;
    const revealedNormal = normalIds.filter((id) => reveals.includes(id));
    if (revealedNormal.some((id, index) => id !== normalIds[index])) return null;
    const normalDraftIds = entries.map(([id]) => id).filter((id): id is typeof normalIds[number] => normalIds.includes(id as typeof normalIds[number]));
    if (normalDraftIds.some((id) => normalIds.indexOf(id) > revealedNormal.length)) return null;
    const hasSupportState = entries.some(([id]) => id.startsWith("boundary:") || id.startsWith("rejection:")) || reveals.some((id) => String(id).startsWith("boundary:") || String(id).startsWith("rejection:"));
    if (hasSupportState && revealedNormal.length !== normalIds.length) return null;
    const checkpoint = value.checkpoint as RecursionCheckpoint;
    if (checkpoint > Math.min(revealedNormal.length, normalIds.length - 1)) return null;
    const active = recursionCheckpointId(checkpoint);
    if (value.phase === "revealed" && (!reveals.includes(active) || !drafts[active]?.trim())) return null;
    return { schema_version: RECURSION_TRACE_SCHEMA, projection_sha256: RECURSION_PROJECTION_SHA256, case: "normal-recursive-sum", checkpoint, phase: value.phase, drafts, reveal_ids: reveals as RecursionCheckpointId[] };
  } catch { return null; }
}

export function restoreRecursionPractice(raw: string | null): RecursionPracticeProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value) || !hasExactFields(value, practiceFields)) return null;
    if (value.schema_version !== RECURSION_PRACTICE_SCHEMA || value.projection_sha256 !== RECURSION_PROJECTION_SHA256 || !Number.isInteger(value.index) || (value.index as number) < 0 || (value.index as number) > 5) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts) || !Array.isArray(value.attempted)) return null;
    const entries = Object.entries(value.drafts);
    if (entries.some(([index, draft]) => !/^[0-5]$/.test(index) || typeof draft !== "string")) return null;
    const attempted = value.attempted;
    if (attempted.some((index) => !Number.isInteger(index) || (index as number) < 0 || (index as number) > 5) || new Set(attempted).size !== attempted.length) return null;
    const drafts = Object.fromEntries(entries) as Record<number, string>;
    if (attempted.some((index) => !drafts[index as number]?.trim())) return null;
    const attemptedSorted = [...attempted].sort((left, right) => Number(left) - Number(right));
    if (attemptedSorted.some((item, index) => item !== index) || entries.some(([index]) => Number(index) > attemptedSorted.length) || (value.index as number) > Math.min(attemptedSorted.length, 5)) return null;
    return { schema_version: RECURSION_PRACTICE_SCHEMA, projection_sha256: RECURSION_PROJECTION_SHA256, index: value.index as number, drafts, attempted: attempted as number[] };
  } catch { return null; }
}
