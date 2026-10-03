import type { LearningLocale, Localized } from "./types";

export const LEARNER_STAGE_IDS = [
  "recognise",
  "understand",
  "trace",
  "practise",
  "protectMarks",
  "recallAndContinue",
] as const;

export type LearnerStageId = typeof LEARNER_STAGE_IDS[number];
export type LearnerStageMarker = LearnerStageId;

type PracticeItem = Readonly<{
  level: Localized;
  title: Localized;
  prompt: Localized;
  hint: Localized;
  model_answer: Localized;
  success_check: Localized;
  assessment_requirement_ids?: readonly string[];
}>;

export type StageBase = Readonly<{ order: number; name: Localized; student_question: Localized }>;
type OptionalTeachingNote = Readonly<{ label: Localized; content: Localized }>;

type UnderstandStage = StageBase & Readonly<{
  mental_model: Localized;
  rules: readonly Localized[];
  invariant: Localized;
  python_recipe: Readonly<{ caption: Localized; lines: readonly string[]; contract_note: Localized }>;
  recursive_extension?: OptionalTeachingNote;
  transfer_note?: OptionalTeachingNote;
  representation_contrast?: Readonly<{ prompt: Localized; answer: Localized }>;
}>;

type TraceStage = StageBase & Readonly<{
  scenario: Readonly<{ label: Localized; instruction: Localized; readonly [key: string]: unknown }>;
  steps: readonly unknown[];
  invariant_check: Localized;
  variants?: readonly unknown[];
}>;

export type LearnerStages = Readonly<{
  recognise: StageBase & Readonly<{
    intro: Localized;
    prompt_fragment: Localized;
    cues: readonly Localized[];
    precondition: Localized;
    output_contract: Localized;
  }>;
  understand: UnderstandStage;
  trace: TraceStage;
  practise: StageBase & Readonly<{ attempt_rule: Localized; items: readonly PracticeItem[] }>;
  protectMarks: StageBase & Readonly<{
    before_code: readonly Localized[];
    mistakes: readonly Readonly<{ mistake: Localized; consequence: Localized; repair: Localized; applies_when?: Localized }>[];
    final_check: readonly Localized[];
    core_code_caption: Localized;
    core_code: readonly string[];
    boundary_trace: readonly Localized[];
    authority_note: Localized;
  }>;
  recallAndContinue: StageBase & Readonly<{
    recall_items: readonly Readonly<{ prompt: Localized; answer: Localized }>[];
    exit_task: Localized;
    next_step: Localized;
  }>;
}>;

export type LearnerProjection = Readonly<{
  status: "teacher-approved-for-implementation";
  lesson_title: Localized;
  exam_family: Localized;
  language_policy: Localized;
  learner_promise?: Localized;
  learner_outcomes: readonly Localized[];
  stages: LearnerStages;
  display_contract: unknown;
  stage_order: readonly LearnerStageId[];
}>;

export type BinarySearchLearnerProjection = LearnerProjection;

export type DataModelsRecord = Readonly<{ name: string; score?: number }>;
export type DataModelsChoice = Readonly<{ id: string; label: Localized }>;
export type DataModelsWorkedRow = Readonly<{ label: Localized; value: Localized }>;
export type DataModelsTraceStep = Readonly<{
  step: number;
  before: Readonly<Record<string, unknown>>;
  code_focus: readonly string[];
  after: Readonly<Record<string, unknown>>;
  mode: "worked" | "choice";
  heading: Localized;
  worked_rows?: readonly DataModelsWorkedRow[];
  continue_label?: Localized;
  context?: Localized;
  question?: Localized;
  options?: readonly DataModelsChoice[];
  correct_option_id?: string;
  retry_hint?: Localized;
  correct_feedback?: Localized;
  exam_sentence: Localized;
}>;
export type DataModelsTraceVariant = Readonly<{
  kind: "boundary" | "failure";
  label: Localized;
  input: Readonly<{ records: readonly DataModelsRecord[]; capacity: number; new_record: DataModelsRecord }>;
  expected: Readonly<{ records: readonly DataModelsRecord[]; result: readonly [boolean, string] }>;
  explanation: Localized;
  question: Localized;
  options: readonly DataModelsChoice[];
  correct_option_id: string;
  retry_hint: Localized;
  correct_feedback: Localized;
}>;
export type DataModelsLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace"> & {
    trace: StageBase & Readonly<{
      scenario: Readonly<{
        label: Localized;
        initial_records: readonly DataModelsRecord[];
        capacity: number;
        new_record: DataModelsRecord;
        instruction: Localized;
      }>;
      reminder: Localized;
      steps: readonly DataModelsTraceStep[];
      invariant_check: Localized;
      variants: readonly DataModelsTraceVariant[];
    }>;
  }>;
}>;

export type ProceduralScenarioKind = "normal" | "boundary" | "failure";
export type ProceduralPhase = "predict" | "revealed";
export type ProceduralTraceStep = Readonly<{
  step: 1 | 2 | 3;
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
}>;
export type ProceduralTraceVariant = Readonly<{
  kind: Exclude<ProceduralScenarioKind, "normal">;
  input: Readonly<{ scores: readonly number[]; bonus: number | string }>;
  expected: Readonly<{
    status: "OK" | "INVALID_INPUT";
    adjusted: readonly number[];
    labels: readonly string[];
  }>;
  explanation: Localized;
}>;
export type ProceduralDesignLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace"> & {
    trace: StageBase & Readonly<{
      scenario: Readonly<{
        label: Localized;
        scores: readonly number[];
        bonus: number;
        instruction: Localized;
      }>;
      steps: readonly ProceduralTraceStep[];
      invariant_check: Localized;
      variants: readonly ProceduralTraceVariant[];
    }>;
  }>;
}>;

export type ValidationScenarioKind = "normal" | "boundary" | "failure";
export type ValidationPhase = "predict" | "revealed";
export type ValidationTraceStep = Readonly<{
  step: 1 | 2 | 3;
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
}>;
export type ValidationTraceVariant = Readonly<{
  kind: Exclude<ValidationScenarioKind, "normal">;
  input: Readonly<{
    accepted: readonly number[];
    candidate: number;
    minimum: number;
    maximum: number;
    digit_matches: boolean;
  }>;
  expected: Readonly<{
    status: "ACCEPTED" | "DUPLICATE";
    returned: readonly number[];
    original: readonly number[];
  }>;
  explanation: Localized;
}>;
export type ValidationRulesLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace"> & {
    trace: StageBase & Readonly<{
      scenario: Readonly<{
        label: Localized;
        accepted: readonly number[];
        candidate: number;
        minimum: number;
        maximum: number;
        digit_matches: boolean;
        instruction: Localized;
      }>;
      steps: readonly ValidationTraceStep[];
      invariant_check: Localized;
      variants: readonly ValidationTraceVariant[];
    }>;
  }>;
}>;

export type TestingCaseKind = "boundary" | "normal" | "failure";
export type TestingPhase = "predict" | "revealed";
export type TestingTraceStep = Readonly<{
  step: 1 | 2 | 3;
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
}>;
export type TestingSupportRow = Readonly<{
  input: number;
  expected: "PASS" | "RETRY" | "INVALID";
}>;
export type TestingSupportVariant = Readonly<{
  kind: Exclude<TestingCaseKind, "boundary">;
  input: Readonly<{ rows: readonly TestingSupportRow[] }>;
  expected: Readonly<{ all_pass_after_repair: true }>;
  explanation: Localized;
}>;
export type TestingLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace"> & {
    trace: StageBase & Readonly<{
      scenario: Readonly<{
        label: Localized;
        input: 40;
        expected: "PASS";
        defective_condition: "score > 40";
        instruction: Localized;
      }>;
      steps: readonly TestingTraceStep[];
      invariant_check: Localized;
      variants: readonly TestingSupportVariant[];
    }>;
  }>;
}>;

export type TextProcessingScenarioKind = "normal" | "boundary" | "failure";
export type TextProcessingPhase = "predict" | "revealed";
export type TextProcessingTraceStep = Readonly<{
  step: 1 | 2 | 3;
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
}>;
export type TextProcessingTraceVariant = Readonly<{
  kind: Exclude<TextProcessingScenarioKind, "normal">;
  input: Readonly<{ record: string; delimiter: string }>;
  expected: Readonly<{
    status: "OK" | "MALFORMED";
    routed: Readonly<Record<string, string | number>>;
  }>;
  explanation: Localized;
}>;
export type TextProcessingLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace"> & {
    trace: StageBase & Readonly<{
      scenario: Readonly<{
        label: Localized;
        record: string;
        delimiter: string;
        instruction: Localized;
      }>;
      steps: readonly TextProcessingTraceStep[];
      invariant_check: Localized;
      variants: readonly TextProcessingTraceVariant[];
    }>;
  }>;
}>;

export type SearchCollectionsCaseKind = "normal-primary" | "normal-last" | "normal-single" | "boundary-empty" | "not-found";
export type SearchCollectionsPhase = "predict" | "revealed";
export type SearchCollectionsTraceStep = Readonly<{
  step: 1 | 2 | 3;
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
}>;
export type SearchCollectionsTraceVariant = Readonly<{
  kind: "boundary" | "not_found";
  input: Readonly<{ values: readonly number[]; target: number }>;
  expected: Readonly<{ found: number }>;
  explanation: Localized;
}>;
export type SearchCollectionsLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace"> & {
    trace: StageBase & Readonly<{
      scenario: Readonly<{
        label: Localized;
        values: readonly number[];
        target: number;
        instruction: Localized;
      }>;
      steps: readonly SearchCollectionsTraceStep[];
      invariant_check: Localized;
      variants: readonly SearchCollectionsTraceVariant[];
    }>;
  }>;
}>;

export type SortingCaseKind = "normal-primary" | "normal-reverse" | "normal-duplicates" | "boundary-already-sorted" | "boundary-single" | "boundary-empty";
export type SortingPhase = "predict" | "revealed";
export type SortingTraceStep = Readonly<{ step: 1 | 2 | 3; code_focus: readonly string[]; prediction: Localized; answer: Localized }>;
export type SortingTraceVariant = Readonly<{
  kind: "boundary_already_sorted" | "boundary_single" | "boundary_empty";
  input: Readonly<{ values: readonly number[] }>;
  expected: Readonly<{ result: readonly number[]; passes: number; early_stop?: boolean }>;
  explanation: Localized;
}>;
export type SortingLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace"> & {
    trace: StageBase & Readonly<{
      scenario: Readonly<{ label: Localized; values: readonly number[]; direction: "ascending"; instruction: Localized }>;
      steps: readonly SortingTraceStep[];
      invariant_check: Localized;
      variants: readonly SortingTraceVariant[];
    }>;
  }>;
}>;

export type PerformanceCaseKind = "normal-comparison" | "valid-empty-boundary" | "binary-precondition-blocked";
export type PerformancePhase = "predict" | "revealed";
export type PerformanceTraceStep = Readonly<{ step: 1 | 2 | 3; code_focus: readonly string[]; prediction: Localized; answer: Localized }>;
export type SearchProbeRow = Readonly<{
  algorithm: "Linear Search" | "Binary Search";
  result_index: number;
  inspected_positions: number;
  required_precondition: Localized;
}>;
export type PerformanceTraceVariant = Readonly<{
  kind: "valid_empty_boundary" | "binary_precondition_blocked";
  input: Readonly<{ values: readonly number[]; target: number }>;
  expected: Readonly<Record<string, string | number | null>>;
  explanation: Localized;
}>;
export type PerformanceLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "trace" | "recallAndContinue"> & {
    trace: StageBase & Readonly<{
      representation: "static_comparison_table";
      scenario: Readonly<{
        label: Localized;
        values: readonly number[];
        target: number;
        metric: Localized;
        rows: readonly SearchProbeRow[];
        setup_disclosure: Localized;
      }>;
      steps: readonly PerformanceTraceStep[];
      invariant_check: Localized;
      variants: readonly PerformanceTraceVariant[];
    }>;
    recallAndContinue: StageBase & Readonly<{
      recall_items: readonly Readonly<{ prompt: Localized; answer: Localized }>[];
      exit_task: Localized;
      completion_check: Localized;
      next_lesson: Readonly<{ slug: string; reason: Localized }>;
      source_note: Localized;
    }>;
  }>;
}>;

export type StackCaseKind = "normal-current-top" | "boundary-empty-pop" | "rejected-operations";
export type StackTraceStep = Readonly<{
  step: 1 | 2 | 3 | 4;
  operation: readonly ["push", number] | readonly ["pop"];
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
  expected: Readonly<{ outcome: boolean | number | null; items: readonly (number | null)[]; live: readonly number[]; top: number }>;
}>;
export type StackTraceVariant = Readonly<{
  kind: "boundary_empty_pop" | "rejected_operations";
  input: Readonly<Record<string, unknown>>;
  expected: Readonly<Record<string, unknown>>;
  explanation: Localized;
}>;
export type StackLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "understand" | "trace" | "recallAndContinue"> & {
    understand: StageBase & Readonly<{ mental_model: Localized; rules: readonly Localized[]; invariant: Localized; python_recipe: readonly string[]; transfer_note: Localized }>;
    trace: StageBase & Readonly<{
      representation: "fixed_array_current_top";
      scenario: Readonly<{ label: Localized; capacity: 4; initial_items: readonly [null, null, null, null]; initial_top: -1; operations: readonly (readonly unknown[])[] }>;
      steps: readonly StackTraceStep[];
      invariant_check: Localized;
      variants: readonly StackTraceVariant[];
    }>;
    recallAndContinue: StageBase & Readonly<{
      recall_items: readonly Readonly<{ prompt: Localized; answer: Localized }>[];
      exit_task: Localized;
      completion_check: Localized;
      next_lesson: Localized;
      source_note: Localized;
    }>;
  }>;
}>;

export type QueueCaseKind = "normal-circular-wrap" | "boundary-empty-dequeue" | "boundary-full-enqueue";
export type QueueOperation = readonly ["enqueue", number] | readonly ["dequeue"];
export type QueueState = Readonly<{
  outcome: boolean | number | null;
  items: readonly (number | null)[];
  front: number;
  rear: number;
  count: number;
  logical: readonly number[];
}>;
export type QueueTraceStep = Readonly<{
  step: 1 | 2 | 3 | 4 | 5;
  operation: QueueOperation;
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
  expected: QueueState;
}>;
export type QueueTraceVariant = Readonly<{
  kind: "boundary_empty_dequeue" | "boundary_full_enqueue";
  input: Readonly<{
    capacity: 2;
    items: readonly (number | null)[];
    front: 0;
    rear: 0;
    count: 0 | 2;
    operation: QueueOperation;
  }>;
  expected: QueueState & Readonly<{ state_unchanged: true }>;
  explanation: Localized;
}>;
export type QueueLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "understand" | "trace" | "recallAndContinue"> & {
    understand: StageBase & Readonly<{
      mental_model: Localized;
      rules: readonly Localized[];
      invariant: Localized;
      python_recipe: readonly string[];
      transfer_note: Localized;
    }>;
    trace: StageBase & Readonly<{
      representation: "circular_array_front_rear_count";
      scenario: Readonly<{
        label: Localized;
        capacity: 3;
        initial_items: readonly [null, null, null];
        initial_front: 0;
        initial_rear: 0;
        initial_count: 0;
        operations: readonly QueueOperation[];
      }>;
      steps: readonly QueueTraceStep[];
      invariant_check: Localized;
      inspection: Readonly<{
        logical_values: readonly number[];
        numeric_total: number;
        state_unchanged: true;
        explanation: Localized;
      }>;
      variants: readonly QueueTraceVariant[];
    }>;
    recallAndContinue: StageBase & Readonly<{
      recall_items: readonly Readonly<{ prompt: Localized; answer: Localized }>[];
      exit_task: Localized;
      completion_check: Localized;
      next_lesson: Localized;
      source_note: Localized;
    }>;
  }>;
}>;

export type LinkedListCaseKind = "normal-remove-recycle" | "boundary-singleton-remove" | "rejected-full-missing";
export type LinkedListPhase = "predict" | "revealed";
export type LinkedListOperation =
  | readonly ["insert_head", number]
  | readonly ["remove_first", number]
  | readonly ["remove_compare", number]
  | readonly ["remove_match", number]
  | readonly ["remove_recycle", number];
export type LinkedListState = Readonly<{
  outcome?: boolean;
  data: readonly (number | null)[];
  next: readonly number[];
  head: number;
  free: number;
  logical?: readonly number[];
  live_chain: readonly number[];
  free_chain: readonly number[];
}>;
export type LinkedListTraceStep = Readonly<{
  step: 1 | 2 | 3 | 4 | 5 | 6;
  operation: LinkedListOperation;
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
  expected: LinkedListState | Readonly<Record<string, boolean | number>>;
}>;
export type LinkedListTraceVariant = Readonly<{
  kind: "boundary_singleton_remove" | "rejected_full_and_missing";
  input: Readonly<Record<string, unknown>>;
  expected: Readonly<Record<string, unknown>>;
  explanation: Localized;
}>;
export type LinkedListLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "understand" | "trace" | "recallAndContinue"> & {
    understand: StageBase & Readonly<{
      mental_model: Localized;
      rules: readonly Localized[];
      invariant: Localized;
      python_recipe: readonly string[];
      transfer_note: Localized;
    }>;
    trace: StageBase & Readonly<{
      representation: "parallel_arrays_live_free_partition";
      scenario: Readonly<{
        label: Localized;
        capacity: 5;
        null_pointer: -1;
        initial: LinkedListState;
        operations: readonly LinkedListOperation[];
      }>;
      steps: readonly LinkedListTraceStep[];
      invariant_check: Localized;
      variants: readonly LinkedListTraceVariant[];
    }>;
    recallAndContinue: StageBase & Readonly<{
      recall_items: readonly Readonly<{ prompt: Localized; answer: Localized }>[];
      exit_task: Localized;
      completion_check: Localized;
      next_lesson: Localized;
      source_note: Localized;
    }>;
  }>;
}>;

export type RecursionPhase = "predict" | "revealed";
export type RecursionTraceStep = Readonly<{
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  event: "call" | "base_case" | "return";
  phase: "descending" | "base" | "unwinding" | "complete";
  phase_label: Localized;
  active_index: number;
  stack: readonly number[];
  pending_values: readonly number[];
  code_focus: readonly string[];
  prediction: Localized;
  answer: Localized;
  expected: Readonly<Record<string, unknown>>;
}>;
export type RecursionTraceVariant = Readonly<{
  kind: "boundary_empty_list" | "rejected_non_integer_input";
  input: Readonly<Record<string, unknown>>;
  event_order: readonly string[];
  expected: Readonly<Record<string, unknown>>;
  explanation: Localized;
}>;
export type RecursionLearnerProjection = Readonly<Omit<LearnerProjection, "stages"> & {
  learner_promise: Localized;
  stages: Readonly<Omit<LearnerStages, "understand" | "trace" | "recallAndContinue"> & {
    understand: StageBase & Readonly<{
      mental_model: Localized;
      rules: readonly Localized[];
      invariant: Localized;
      python_recipe: readonly string[];
      transfer_note: Localized;
    }>;
    trace: StageBase & Readonly<{
      representation: "call_stack_with_unwind_lane";
      scenario: Readonly<{
        label: Localized;
        values: readonly [4, 7, 2];
        initial_index: 0;
        expected_result: 13;
        event_order: readonly string[];
      }>;
      steps: readonly RecursionTraceStep[];
      invariant_check: Localized;
      variants: readonly RecursionTraceVariant[];
      static_limits: readonly Localized[];
      orientation: unknown;
    }>;
    recallAndContinue: StageBase & Readonly<{
      recall_items: readonly Readonly<{ prompt: Localized; answer: Localized }>[];
      exit_task: Localized;
      completion_check: Localized;
      next_lesson: Localized;
      source_note: Localized;
    }>;
  }>;
}>;

const forbiddenLearnerTokens = [
  /\bac-9618-/i,
  /\bB2-/,
  /\bmp-9618-/i,
  /\bMP-9618-/,
  /paper4-2026\.marking-chain/i,
  /Cambridge_QP_MS/i,
  /official_marks/i,
  /marking_atom_count/i,
  /award_semantics/i,
  /disclosure[_ -]?contract/i,
  /\b(?:package|section|pattern|knowledge|fixture|line|method|error|atom)[_-]id\b/i,
  /\b(?:source|execution(?:_log)?)_?sha(?:-?256)?\b/i,
  /\b[0-9a-f]{64}\b/i,
  /\b(?:author|independent)[_-]?(?:run|rerun)[_-]?ref\b/i,
  /\b(?:authority|access_mode|disposition)\s*=/i,
  /\b(?:checks?|gates?|passed|cases?)\s*[:=]?\s*\d+\/\d+\b/i,
  /\b\d{2,}\/\d{2,}\b/,
] as const;

export function learnerText(value: Localized, locale: LearningLocale) {
  const text = value[locale];
  assertLearnerTextSafe(text);
  return text;
}

export function assertLearnerTextSafe(text: string) {
  const forbidden = forbiddenLearnerTokens.find((pattern) => pattern.test(text));
  if (forbidden) throw new Error("Learner projection contains forbidden implementation or audit metadata.");
  return text;
}

export function assertLearnerProjectionSafe(projection: LearnerProjection) {
  if (projection.status !== "teacher-approved-for-implementation") throw new Error("Learner projection is not teacher-approved.");
  if (projection.stage_order.length !== LEARNER_STAGE_IDS.length || projection.stage_order.some((stage, index) => stage !== LEARNER_STAGE_IDS[index])) {
    throw new Error("Learner projection does not have the approved six-stage topology.");
  }
  const inspect = (value: unknown): void => {
    if (typeof value === "string") { assertLearnerTextSafe(value); return; }
    if (Array.isArray(value)) { value.forEach(inspect); return; }
    if (value && typeof value === "object") Object.entries(value).forEach(([key, child]) => {
      // Traceability IDs are machine-readable links and are never rendered as learner copy.
      if (key === "assessment_requirement_ids") return;
      inspect(child);
    });
  };
  inspect(projection.lesson_title);
  inspect(projection.exam_family);
  inspect(projection.language_policy);
  inspect(projection.learner_promise);
  inspect(projection.learner_outcomes);
  inspect(projection.stages);
}

export const stageMarker: Readonly<Record<LearnerStageId, LearnerStageMarker>> = {
  recognise: "recognise",
  understand: "understand",
  trace: "trace",
  practise: "practise",
  protectMarks: "protectMarks",
  recallAndContinue: "recallAndContinue",
};
