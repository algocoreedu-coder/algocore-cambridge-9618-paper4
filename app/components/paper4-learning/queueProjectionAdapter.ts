import type { QueueLearnerProjection, QueueTraceStep, QueueTraceVariant } from "./learnerProjection";

export const QUEUE_PROJECTION_SHA256 = "BA60CA6CEBB13B53EFEA568BF6D3B18E9CEB008BDD79DC77F6878F5E8DB0CB45";
export const QUEUE_PROGRESS_KEY = "algocore.paper4.learner.queue.trace.v1";
export const QUEUE_PRACTICE_KEY = "algocore.paper4.learner.queue.practice.v1";
export const QUEUE_PROTECT_KEY = "algocore.paper4.learner.queue.protect-marks.v1";
export const QUEUE_TRACE_SCHEMA = "paper4-queue-circular-progress-v1";
export const QUEUE_PRACTICE_SCHEMA = "paper4-queue-practice-progress-v1";

export type QueueCheckpointId = `normal:${0 | 1 | 2 | 3 | 4}` | "boundary:empty" | "boundary:full";
export type QueueTraceProgress = Readonly<{
  schema_version: typeof QUEUE_TRACE_SCHEMA;
  projection_sha256: typeof QUEUE_PROJECTION_SHA256;
  case_kind: "normal-circular-wrap";
  checkpoint_index: 0 | 1 | 2 | 3 | 4;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<QueueCheckpointId, string>>>;
  revealed_checkpoint_ids: readonly QueueCheckpointId[];
}>;
export type QueuePracticeProgress = Readonly<{
  schema_version: typeof QUEUE_PRACTICE_SCHEMA;
  projection_sha256: typeof QUEUE_PROJECTION_SHA256;
  index: number;
  drafts: Readonly<Record<number, string>>;
  attempted: readonly number[];
}>;

const normalIds = ["normal:0", "normal:1", "normal:2", "normal:3", "normal:4"] as const;
const checkpointIds: readonly QueueCheckpointId[] = [...normalIds, "boundary:empty", "boundary:full"];
const traceFields = ["schema_version", "projection_sha256", "case_kind", "checkpoint_index", "phase", "drafts", "revealed_checkpoint_ids"];
const practiceFields = ["schema_version", "projection_sha256", "index", "drafts", "attempted"];

function hasExactFields(value: Record<string, unknown>, fields: readonly string[]) {
  const keys = Object.keys(value).sort();
  return keys.length === fields.length && [...fields].sort().every((field, index) => keys[index] === field);
}

export function queueCheckpointId(index: number): QueueCheckpointId {
  return normalIds[index] ?? "normal:0";
}

export function queueStep(projection: QueueLearnerProjection, index: 0 | 1 | 2 | 3 | 4): QueueTraceStep {
  const step = projection.stages.trace.steps[index];
  if (!step || step.step !== index + 1 || step.code_focus.length < 1 || step.code_focus.length > 3) {
    throw new Error("Queue decisions mismatch");
  }
  const { items, front, rear, count, logical } = step.expected;
  if (items.length !== 3 || front < 0 || front >= 3 || rear < 0 || rear >= 3 || count < 0 || count > 3 || logical.length !== count) {
    throw new Error("Queue decision contains an impossible state");
  }
  return step;
}

export function queueVariants(projection: QueueLearnerProjection): readonly [QueueTraceVariant, QueueTraceVariant] {
  const variants = projection.stages.trace.variants;
  if (variants.length !== 2 || variants[0]?.kind !== "boundary_empty_dequeue" || variants[1]?.kind !== "boundary_full_enqueue") {
    throw new Error("Queue variants mismatch");
  }
  for (const variant of variants) {
    const capacity = variant.input.capacity;
    const { items, front, rear, count, logical, state_unchanged } = variant.expected;
    if (capacity !== 2 || items.length !== capacity || front < 0 || front >= capacity || rear < 0 || rear >= capacity || count < 0 || count > capacity || logical.length !== count || state_unchanged !== true) {
      throw new Error("Queue boundary contains an impossible state");
    }
  }
  return variants as readonly [QueueTraceVariant, QueueTraceVariant];
}

export function createInitialQueueProgress(): QueueTraceProgress {
  return {
    schema_version: QUEUE_TRACE_SCHEMA,
    projection_sha256: QUEUE_PROJECTION_SHA256,
    case_kind: "normal-circular-wrap",
    checkpoint_index: 0,
    phase: "predict",
    drafts: {},
    revealed_checkpoint_ids: [],
  };
}

export function isQueueComplete(progress: Pick<QueueTraceProgress, "drafts" | "revealed_checkpoint_ids">) {
  return normalIds.every((id) => Boolean(progress.drafts[id]?.trim()) && progress.revealed_checkpoint_ids.includes(id));
}

export function restoreQueueProgress(raw: string | null): QueueTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value) || !hasExactFields(value, traceFields)) return null;
    if (value.schema_version !== QUEUE_TRACE_SCHEMA || value.projection_sha256 !== QUEUE_PROJECTION_SHA256 || value.case_kind !== "normal-circular-wrap") return null;
    if (![0, 1, 2, 3, 4].includes(value.checkpoint_index as number) || (value.phase !== "predict" && value.phase !== "revealed")) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts) || !Array.isArray(value.revealed_checkpoint_ids)) return null;

    const entries = Object.entries(value.drafts);
    if (entries.some(([id, draft]) => !checkpointIds.includes(id as QueueCheckpointId) || typeof draft !== "string")) return null;
    const drafts = Object.fromEntries(entries) as Partial<Record<QueueCheckpointId, string>>;
    const revealed = value.revealed_checkpoint_ids as unknown[];
    if (revealed.some((id) => typeof id !== "string" || !checkpointIds.includes(id as QueueCheckpointId) || !drafts[id as QueueCheckpointId]?.trim())) return null;

    return {
      ...createInitialQueueProgress(),
      checkpoint_index: value.checkpoint_index as 0 | 1 | 2 | 3 | 4,
      phase: value.phase,
      drafts,
      revealed_checkpoint_ids: [...new Set(revealed as QueueCheckpointId[])],
    };
  } catch {
    return null;
  }
}

export function restoreQueuePractice(raw: string | null): QueuePracticeProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value) || !hasExactFields(value, practiceFields)) return null;
    if (value.schema_version !== QUEUE_PRACTICE_SCHEMA || value.projection_sha256 !== QUEUE_PROJECTION_SHA256 || !Number.isInteger(value.index) || (value.index as number) < 0 || (value.index as number) >= 6) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts) || !Array.isArray(value.attempted)) return null;
    const entries = Object.entries(value.drafts);
    const attempted = value.attempted as unknown[];
    const draftMap = Object.fromEntries(entries) as Record<string, string>;
    if (entries.some(([key, draft]) => !/^[0-5]$/.test(key) || typeof draft !== "string")) return null;
    if (attempted.some((item) => !Number.isInteger(item) || (item as number) < 0 || (item as number) >= 6 || !draftMap[String(item)]?.trim())) return null;
    return {
      schema_version: QUEUE_PRACTICE_SCHEMA,
      projection_sha256: QUEUE_PROJECTION_SHA256,
      index: value.index as number,
      drafts: Object.fromEntries(entries) as Record<number, string>,
      attempted: [...new Set(attempted as number[])],
    };
  } catch {
    return null;
  }
}
