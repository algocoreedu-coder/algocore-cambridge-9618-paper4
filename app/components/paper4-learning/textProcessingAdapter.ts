import type {
  TextProcessingLearnerProjection,
  TextProcessingScenarioKind,
  TextProcessingTraceStep,
  TextProcessingTraceVariant,
} from "./learnerProjection";
import type { Localized } from "./types";

export const TEXT_PROCESSING_PROJECTION_SHA256 = "9DBB6C5E8CDE0E5A4589E04995492D9C913238037023DCD61BAB945CEB019EE4";
export const TEXT_PROCESSING_PROGRESS_KEY = "algocore.paper4.learner.text-processing.trace.v1";
export const TEXT_PROCESSING_PRACTICE_KEY = "algocore.paper4.learner.text-processing.practice.v1";
export const TEXT_PROCESSING_PROTECT_KEY = "algocore.paper4.learner.text-processing.protect-marks.v1";
export const TEXT_PROCESSING_TRACE_SCHEMA = "paper4-text-processing-trace-progress-v1";

export type TextProcessingCheckpointId = "normal:0" | "normal:1" | "normal:2";
export type TextProcessingDraftId = TextProcessingCheckpointId | "boundary:0" | "failure:0";
export type TextProcessingTraceCase = Readonly<{
  kind: TextProcessingScenarioKind;
  label: Localized;
  record: string;
  delimiter: string;
  expected: Readonly<{ status: "OK" | "MALFORMED"; routed: Readonly<Record<string, string | number>> }>;
  explanation?: Localized;
}>;

export type TextProcessingTraceProgress = Readonly<{
  schema_version: typeof TEXT_PROCESSING_TRACE_SCHEMA;
  projection_sha256: typeof TEXT_PROCESSING_PROJECTION_SHA256;
  scenario: TextProcessingScenarioKind;
  checkpoint_index: 0 | 1 | 2;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<TextProcessingDraftId, string>>>;
  revealed_checkpoint_ids: readonly TextProcessingCheckpointId[];
}>;

const normalIds: readonly TextProcessingCheckpointId[] = ["normal:0", "normal:1", "normal:2"];
const draftIds: readonly TextProcessingDraftId[] = [...normalIds, "boundary:0", "failure:0"];

export function textProcessingCheckpointId(index: number): TextProcessingCheckpointId {
  if (index === 0) return "normal:0";
  if (index === 1) return "normal:1";
  return "normal:2";
}

export function isTextProcessingNormalComplete(progress: Pick<TextProcessingTraceProgress, "drafts" | "revealed_checkpoint_ids">) {
  return normalIds.every((id) => progress.revealed_checkpoint_ids.includes(id) && Boolean(progress.drafts[id]?.trim()));
}

export function createInitialTextProcessingProgress(): TextProcessingTraceProgress {
  return {
    schema_version: TEXT_PROCESSING_TRACE_SCHEMA,
    projection_sha256: TEXT_PROCESSING_PROJECTION_SHA256,
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

export function restoreTextProcessingProgress(raw: string | null): TextProcessingTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.schema_version !== TEXT_PROCESSING_TRACE_SCHEMA || value.projection_sha256 !== TEXT_PROCESSING_PROJECTION_SHA256) return null;
    if (value.scenario !== "normal" && value.scenario !== "boundary" && value.scenario !== "failure") return null;
    if (!isCheckpointIndex(value.checkpoint_index) || (value.scenario !== "normal" && value.checkpoint_index !== 0)) return null;
    if (value.phase !== "predict" && value.phase !== "revealed") return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts)) return null;
    const entries = Object.entries(value.drafts);
    const drafts = Object.fromEntries(entries.filter(([id, draft]) => draftIds.includes(id as TextProcessingDraftId) && typeof draft === "string"));
    if (Object.keys(drafts).length !== entries.length || !Array.isArray(value.revealed_checkpoint_ids)) return null;
    const revealed = value.revealed_checkpoint_ids.filter((id): id is TextProcessingCheckpointId => typeof id === "string" && normalIds.includes(id as TextProcessingCheckpointId));
    if (revealed.length !== value.revealed_checkpoint_ids.length || revealed.some((id) => !drafts[id]?.trim())) return null;
    const currentId: TextProcessingDraftId = value.scenario === "normal" ? textProcessingCheckpointId(value.checkpoint_index) : `${value.scenario}:0`;
    if (value.phase === "revealed" && !drafts[currentId]?.trim()) return null;
    if (value.scenario === "normal" && value.phase === "revealed" && !revealed.includes(currentId as TextProcessingCheckpointId)) return null;
    return {
      ...createInitialTextProcessingProgress(),
      scenario: value.scenario,
      checkpoint_index: value.checkpoint_index,
      phase: value.phase,
      drafts,
      revealed_checkpoint_ids: [...new Set(revealed)],
    };
  } catch {
    return null;
  }
}

export function textProcessingCases(projection: TextProcessingLearnerProjection): readonly TextProcessingTraceCase[] {
  const scenario = projection.stages.trace.scenario;
  const normal: TextProcessingTraceCase = {
    kind: "normal",
    label: scenario.label,
    record: scenario.record,
    delimiter: scenario.delimiter,
    expected: { status: "OK", routed: { age: 16 } },
  };
  return [normal, ...projection.stages.trace.variants.map(textProcessingVariantCase)];
}

function textProcessingVariantCase(variant: TextProcessingTraceVariant): TextProcessingTraceCase {
  return {
    kind: variant.kind,
    label: variant.kind === "boundary"
      ? { en: "Boundary · empty TEXT fields", vi: "Boundary · field TEXT rỗng" }
      : { en: "Failure · conversion stops routing", vi: "Failure · conversion dừng routing" },
    record: variant.input.record,
    delimiter: variant.input.delimiter,
    expected: variant.expected,
    explanation: variant.explanation,
  };
}

export function textProcessingStep(projection: TextProcessingLearnerProjection, index: 0 | 1 | 2): TextProcessingTraceStep {
  const step = projection.stages.trace.steps[index];
  if (!step || step.step !== index + 1) throw new Error("Text Processing steps do not match the approved three-decision sequence.");
  return step;
}
