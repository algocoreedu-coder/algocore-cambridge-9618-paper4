import type {
  ValidationRulesLearnerProjection,
  ValidationScenarioKind,
  ValidationTraceStep,
  ValidationTraceVariant,
} from "./learnerProjection";

export const VALIDATION_RULES_PROJECTION_SHA256 = "C1D8EC034CE4978619124A9E20D40994C18C7A31B2BFBAB76093EB37E8163183";
export const VALIDATION_RULES_PROGRESS_KEY = "algocore.paper4.learner.validation-rules.trace.v1";
export const VALIDATION_RULES_PROTECT_KEY = "algocore.paper4.learner.validation-rules.protect-marks.v1";
export const VALIDATION_RULES_TRACE_SCHEMA = "paper4-validation-rules-trace-progress-v1";

export type ValidationCheckpointId = "normal:0" | "normal:1" | "normal:2";
export type ValidationDraftId = ValidationCheckpointId | "boundary:0" | "failure:0";
export type ValidationTraceCase = Readonly<{
  kind: ValidationScenarioKind;
  label: string;
  accepted: readonly number[];
  candidate: number;
  minimum: number;
  maximum: number;
  digitMatches: boolean;
  expected: Readonly<{
    status: "ACCEPTED" | "DUPLICATE";
    returned: readonly number[];
    original: readonly number[];
  }>;
  explanation?: Readonly<{ en: string; vi: string }>;
}>;

export type ValidationTraceProgress = Readonly<{
  schema_version: typeof VALIDATION_RULES_TRACE_SCHEMA;
  projection_sha256: typeof VALIDATION_RULES_PROJECTION_SHA256;
  scenario: ValidationScenarioKind;
  checkpoint_index: 0 | 1 | 2;
  phase: "predict" | "revealed";
  drafts: Readonly<Partial<Record<ValidationDraftId, string>>>;
  revealed_checkpoint_ids: readonly ValidationCheckpointId[];
}>;

const normalIds: readonly ValidationCheckpointId[] = ["normal:0", "normal:1", "normal:2"];
const draftIds: readonly ValidationDraftId[] = [...normalIds, "boundary:0", "failure:0"];

export function validationCheckpointId(index: number): ValidationCheckpointId {
  if (index === 0) return "normal:0";
  if (index === 1) return "normal:1";
  return "normal:2";
}

export function isValidationNormalComplete(progress: Pick<ValidationTraceProgress, "drafts" | "revealed_checkpoint_ids">) {
  return normalIds.every((id) => progress.revealed_checkpoint_ids.includes(id) && Boolean(progress.drafts[id]?.trim()));
}

export function createInitialValidationProgress(): ValidationTraceProgress {
  return {
    schema_version: VALIDATION_RULES_TRACE_SCHEMA,
    projection_sha256: VALIDATION_RULES_PROJECTION_SHA256,
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

export function restoreValidationProgress(raw: string | null): ValidationTraceProgress | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.schema_version !== VALIDATION_RULES_TRACE_SCHEMA || value.projection_sha256 !== VALIDATION_RULES_PROJECTION_SHA256) return null;
    if (value.scenario !== "normal" && value.scenario !== "boundary" && value.scenario !== "failure") return null;
    if (!isCheckpointIndex(value.checkpoint_index) || (value.phase !== "predict" && value.phase !== "revealed")) return null;
    if (!value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts)) return null;
    const entries = Object.entries(value.drafts);
    const drafts = Object.fromEntries(entries.filter(([id, draft]) => draftIds.includes(id as ValidationDraftId) && typeof draft === "string"));
    if (Object.keys(drafts).length !== entries.length || !Array.isArray(value.revealed_checkpoint_ids)) return null;
    const revealed = value.revealed_checkpoint_ids.filter((id): id is ValidationCheckpointId => typeof id === "string" && normalIds.includes(id as ValidationCheckpointId));
    if (revealed.length !== value.revealed_checkpoint_ids.length || revealed.some((id) => !drafts[id]?.trim())) return null;
    return {
      ...createInitialValidationProgress(),
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

export function validationCases(projection: ValidationRulesLearnerProjection): readonly ValidationTraceCase[] {
  const scenario = projection.stages.trace.scenario;
  const normal: ValidationTraceCase = {
    kind: "normal",
    label: scenario.label.en,
    accepted: scenario.accepted,
    candidate: scenario.candidate,
    minimum: scenario.minimum,
    maximum: scenario.maximum,
    digitMatches: scenario.digit_matches,
    expected: { status: "ACCEPTED", returned: [2, 4], original: [2] },
  };
  return [normal, ...projection.stages.trace.variants.map(validationVariantCase)];
}

function validationVariantCase(variant: ValidationTraceVariant): ValidationTraceCase {
  return {
    kind: variant.kind,
    label: variant.kind,
    accepted: variant.input.accepted,
    candidate: variant.input.candidate,
    minimum: variant.input.minimum,
    maximum: variant.input.maximum,
    digitMatches: variant.input.digit_matches,
    expected: variant.expected,
    explanation: variant.explanation,
  };
}

export function validationStep(projection: ValidationRulesLearnerProjection, index: 0 | 1 | 2): ValidationTraceStep {
  const step = projection.stages.trace.steps[index];
  if (!step || step.step !== index + 1) throw new Error("Validation trace steps do not match the approved three-decision sequence.");
  return step;
}
