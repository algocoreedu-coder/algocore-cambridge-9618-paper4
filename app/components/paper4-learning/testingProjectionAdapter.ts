import type { TestingLearnerProjection, TestingSupportVariant, TestingTraceStep } from "./learnerProjection";

export const TESTING_PROJECTION_SHA256 = "DD11F46D887161C9123EDFE4DD9162E3D3C799D161405CCE1C50A88C913CE07C";
export const TESTING_PROGRESS_KEY = "algocore.paper4.learner.testing.trace.v1";
export const TESTING_PROTECT_KEY = "algocore.paper4.learner.testing.protect-marks.v1";
export const TESTING_TRACE_SCHEMA = "paper4-testing-static-table-progress-v1";

export type TestingCheckpointId = "boundary:0" | "boundary:1" | "boundary:2";
export type TestingBoundaryRow = Readonly<{
  input: 40;
  expected: "PASS";
  defectiveActual: "RETRY";
  repairedActual: "PASS";
}>;
export type TestingTraceProgress = Readonly<{
  schema_version: typeof TESTING_TRACE_SCHEMA;
  projection_sha256: typeof TESTING_PROJECTION_SHA256;
  checkpoint_index: 0 | 1 | 2;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<TestingCheckpointId, string>>>;
  revealed_checkpoint_ids: readonly TestingCheckpointId[];
}>;

const checkpointIds: readonly TestingCheckpointId[] = ["boundary:0", "boundary:1", "boundary:2"];

export function testingCheckpointId(index: number): TestingCheckpointId {
  if (index === 0) return "boundary:0";
  if (index === 1) return "boundary:1";
  return "boundary:2";
}

export function testingBoundaryRow(projection: TestingLearnerProjection): TestingBoundaryRow {
  if (projection.stages.trace.scenario.input !== 40 || projection.stages.trace.scenario.expected !== "PASS") {
    throw new Error("Testing boundary row does not match the approved threshold contract.");
  }
  return { input: 40, expected: "PASS", defectiveActual: "RETRY", repairedActual: "PASS" };
}

export function testingStep(projection: TestingLearnerProjection, index: 0 | 1 | 2): TestingTraceStep {
  const step = projection.stages.trace.steps[index];
  if (!step || step.step !== index + 1) throw new Error("Testing steps do not match the approved three-decision sequence.");
  return step;
}

export function testingSupportRows(projection: TestingLearnerProjection): readonly TestingSupportVariant[] {
  return projection.stages.trace.variants;
}

export function createInitialTestingProgress(): TestingTraceProgress {
  return {
    schema_version: TESTING_TRACE_SCHEMA,
    projection_sha256: TESTING_PROJECTION_SHA256,
    checkpoint_index: 0,
    phase: "predict",
    drafts: {},
    revealed_checkpoint_ids: [],
  };
}

function isCheckpointIndex(value: unknown): value is 0 | 1 | 2 { return value === 0 || value === 1 || value === 2; }

export function isTestingComplete(progress: Pick<TestingTraceProgress, "drafts" | "revealed_checkpoint_ids">) {
  return checkpointIds.every((id) => Boolean(progress.drafts[id]?.trim()) && progress.revealed_checkpoint_ids.includes(id));
}

export function restoreTestingProgress(raw: string | null): TestingTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.schema_version !== TESTING_TRACE_SCHEMA || value.projection_sha256 !== TESTING_PROJECTION_SHA256) return null;
    if (!isCheckpointIndex(value.checkpoint_index) || (value.phase !== "predict" && value.phase !== "revealed")) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts)) return null;
    const entries = Object.entries(value.drafts);
    const drafts = Object.fromEntries(entries.filter(([id, draft]) => checkpointIds.includes(id as TestingCheckpointId) && typeof draft === "string"));
    if (Object.keys(drafts).length !== entries.length || !Array.isArray(value.revealed_checkpoint_ids)) return null;
    const revealed = value.revealed_checkpoint_ids.filter((id): id is TestingCheckpointId => typeof id === "string" && checkpointIds.includes(id as TestingCheckpointId));
    if (revealed.length !== value.revealed_checkpoint_ids.length || revealed.some((id) => !drafts[id]?.trim())) return null;
    return { ...createInitialTestingProgress(), checkpoint_index: value.checkpoint_index, phase: value.phase, drafts, revealed_checkpoint_ids: [...new Set(revealed)] };
  } catch {
    return null;
  }
}
