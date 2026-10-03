import type { LinkedListLearnerProjection, LinkedListState, LinkedListTraceStep, LinkedListTraceVariant } from "./learnerProjection";

export const LINKED_LIST_PROJECTION_SHA256 = "D273B1E152335CC29B7C3D6BDFC170886D90DBE84E3F315880E786AE6A6B1B8C";
export const LINKED_LIST_PROGRESS_KEY = "algocore.paper4.learner.linked-list.trace.v1";
export const LINKED_LIST_PRACTICE_KEY = "algocore.paper4.learner.linked-list.practice.v1";
export const LINKED_LIST_PROTECT_KEY = "algocore.paper4.learner.linked-list.protect-marks.v1";
export const LINKED_LIST_TRACE_SCHEMA = "paper4-linked-list-live-free-progress-v1";
export const LINKED_LIST_PRACTICE_SCHEMA = "paper4-linked-list-practice-progress-v1";

export type LinkedListCheckpoint = 0 | 1 | 2 | 3 | 4 | 5;
export type LinkedListCheckpointId = `normal:${LinkedListCheckpoint}` | "boundary:singleton" | "rejection:full" | "rejection:missing";
export type LinkedListTraceProgress = Readonly<{
  schema_version: typeof LINKED_LIST_TRACE_SCHEMA;
  projection_sha256: typeof LINKED_LIST_PROJECTION_SHA256;
  case: "normal-remove-recycle";
  checkpoint: LinkedListCheckpoint;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<LinkedListCheckpointId, string>>>;
  reveal_ids: readonly LinkedListCheckpointId[];
}>;
export type LinkedListPracticeProgress = Readonly<{
  schema_version: typeof LINKED_LIST_PRACTICE_SCHEMA;
  projection_sha256: typeof LINKED_LIST_PROJECTION_SHA256;
  index: number;
  drafts: Readonly<Record<number, string>>;
  attempted: readonly number[];
}>;

const normalIds = ["normal:0", "normal:1", "normal:2", "normal:3", "normal:4", "normal:5"] as const;
const allIds: readonly LinkedListCheckpointId[] = [...normalIds, "boundary:singleton", "rejection:full", "rejection:missing"];
const traceFields = ["schema_version", "projection_sha256", "case", "checkpoint", "phase", "drafts", "reveal_ids"] as const;
const practiceFields = ["schema_version", "projection_sha256", "index", "drafts", "attempted"] as const;

function hasExactFields(value: Record<string, unknown>, fields: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length && actual.every((field, index) => field === expected[index]);
}

function chainFrom(next: readonly number[], start: number) {
  const chain: number[] = [];
  const visited = new Set<number>();
  let node = start;
  while (node !== -1) {
    if (!Number.isInteger(node) || node < 0 || node >= next.length || visited.has(node)) throw new Error("Linked List chain is cyclic or out of range");
    visited.add(node);
    chain.push(node);
    node = next[node];
  }
  return chain;
}

export function assertLinkedListState(state: LinkedListState, capacity: number) {
  if (!Number.isInteger(capacity) || capacity < 1 || state.data.length !== capacity || state.next.length !== capacity) throw new Error("Linked List capacity must be positive and match both arrays");
  const live = chainFrom(state.next, state.head);
  const free = chainFrom(state.next, state.free);
  const ownership = [...live, ...free];
  if (new Set(ownership).size !== capacity || ownership.length !== capacity || ownership.some((node) => node < 0 || node >= capacity)) throw new Error("Linked List live/free ownership is not a disjoint complete partition");
  if (JSON.stringify(live) !== JSON.stringify(state.live_chain) || JSON.stringify(free) !== JSON.stringify(state.free_chain)) throw new Error("Linked List chain text mismatches pointers");
  if (JSON.stringify(live.map((node) => state.data[node]).filter((value): value is number => value !== null)) !== JSON.stringify(state.logical ?? [])) throw new Error("Linked List logical order mismatches live pointers");
}

export function assertLinkedListProjection(projection: LinkedListLearnerProjection) {
  const trace = projection.stages.trace;
  if (trace.representation !== "parallel_arrays_live_free_partition" || trace.scenario.capacity !== 5 || trace.scenario.null_pointer !== -1 || trace.steps.length !== 6 || trace.variants.length !== 2) throw new Error("Linked List projection topology mismatch");
  assertLinkedListState(trace.scenario.initial, 5);
  for (let index = 0; index < trace.steps.length; index += 1) {
    const step = trace.steps[index];
    if (step.step !== index + 1 || step.code_focus.length < 1 || step.code_focus.length > 3) throw new Error("Linked List decision mismatch");
    if (index < 3 || index === 5) assertLinkedListState(step.expected as LinkedListState, 5);
  }
  const final = trace.steps[5].expected as LinkedListState;
  if (JSON.stringify(final.live_chain) !== "[2,0]" || JSON.stringify(final.free_chain) !== "[1,3,4]" || final.head !== 2 || final.free !== 1) throw new Error("Linked List final partition mismatch");
  if (trace.variants[0]?.kind !== "boundary_singleton_remove" || trace.variants[1]?.kind !== "rejected_full_and_missing") throw new Error("Linked List variants mismatch");
}

export function linkedListCheckpointId(index: number): LinkedListCheckpointId {
  return normalIds[index] ?? "normal:0";
}

export function linkedListStep(projection: LinkedListLearnerProjection, index: LinkedListCheckpoint): LinkedListTraceStep {
  assertLinkedListProjection(projection);
  const step = projection.stages.trace.steps[index];
  if (!step) throw new Error("Linked List decision is missing");
  return step;
}

export function linkedListVariants(projection: LinkedListLearnerProjection): readonly [LinkedListTraceVariant, LinkedListTraceVariant] {
  assertLinkedListProjection(projection);
  return projection.stages.trace.variants as readonly [LinkedListTraceVariant, LinkedListTraceVariant];
}

export function createInitialLinkedListProgress(): LinkedListTraceProgress {
  return { schema_version: LINKED_LIST_TRACE_SCHEMA, projection_sha256: LINKED_LIST_PROJECTION_SHA256, case: "normal-remove-recycle", checkpoint: 0, phase: "predict", drafts: {}, reveal_ids: [] };
}

export function isLinkedListComplete(progress: Pick<LinkedListTraceProgress, "drafts" | "reveal_ids">) {
  return normalIds.every((id) => Boolean(progress.drafts[id]?.trim()) && progress.reveal_ids.includes(id));
}

export function restoreLinkedListProgress(raw: string | null): LinkedListTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value) || !hasExactFields(value, traceFields)) return null;
    if (value.schema_version !== LINKED_LIST_TRACE_SCHEMA || value.projection_sha256 !== LINKED_LIST_PROJECTION_SHA256 || value.case !== "normal-remove-recycle") return null;
    if (![0, 1, 2, 3, 4, 5].includes(value.checkpoint as number) || (value.phase !== "predict" && value.phase !== "revealed")) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts) || !Array.isArray(value.reveal_ids)) return null;
    const entries = Object.entries(value.drafts);
    if (entries.some(([id, draft]) => !allIds.includes(id as LinkedListCheckpointId) || typeof draft !== "string")) return null;
    const drafts = Object.fromEntries(entries) as Partial<Record<LinkedListCheckpointId, string>>;
    const reveals = value.reveal_ids;
    if (reveals.some((id) => typeof id !== "string" || !allIds.includes(id as LinkedListCheckpointId)) || new Set(reveals).size !== reveals.length) return null;
    if (reveals.some((id) => !drafts[id as LinkedListCheckpointId]?.trim())) return null;
    const checkpoint = value.checkpoint as LinkedListCheckpoint;
    const active = linkedListCheckpointId(checkpoint);
    if (value.phase === "revealed" && (!reveals.includes(active) || !drafts[active]?.trim())) return null;
    return { schema_version: LINKED_LIST_TRACE_SCHEMA, projection_sha256: LINKED_LIST_PROJECTION_SHA256, case: "normal-remove-recycle", checkpoint, phase: value.phase, drafts, reveal_ids: reveals as LinkedListCheckpointId[] };
  } catch { return null; }
}

export function restoreLinkedListPractice(raw: string | null): LinkedListPracticeProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value) || !hasExactFields(value, practiceFields)) return null;
    if (value.schema_version !== LINKED_LIST_PRACTICE_SCHEMA || value.projection_sha256 !== LINKED_LIST_PROJECTION_SHA256 || !Number.isInteger(value.index) || (value.index as number) < 0 || (value.index as number) > 7) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts) || !Array.isArray(value.attempted)) return null;
    const entries = Object.entries(value.drafts);
    if (entries.some(([index, draft]) => !/^[0-7]$/.test(index) || typeof draft !== "string")) return null;
    const attempted = value.attempted;
    if (attempted.some((index) => !Number.isInteger(index) || (index as number) < 0 || (index as number) > 7) || new Set(attempted).size !== attempted.length) return null;
    const drafts = Object.fromEntries(entries) as Record<number, string>;
    if (attempted.some((index) => !drafts[index as number]?.trim())) return null;
    return { schema_version: LINKED_LIST_PRACTICE_SCHEMA, projection_sha256: LINKED_LIST_PROJECTION_SHA256, index: value.index as number, drafts, attempted: attempted as number[] };
  } catch { return null; }
}
