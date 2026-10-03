export type Locale = "vi" | "en";
export type LocalizedText = Readonly<Record<Locale, string>>;
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export type PythonLine = Readonly<{ line_id: string; order: number; text: string }>;
export type PythonArtifactDto = Readonly<{
  python_artifact_id: string;
  lesson_id: string;
  pattern_ids: readonly string[];
  version: string;
  language: "python" | string;
  lines: readonly PythonLine[];
  entry_point: string;
  code_sha256: string;
  caption: LocalizedText;
  execution?: Readonly<{
    syntax_status: string;
    execution_status: string;
    author_run_ref: string;
    independent_rerun_ref: string;
    execution_log_sha256: string;
  }>;
}>;

export type PatternMetadata = Readonly<{
  pattern_id: string;
  owner_lesson_id: string;
  owner_lesson_slug: string;
  python_artifact_id: string;
  trace_url: string;
  scenario_count: number;
  event_count: number;
  title?: LocalizedText;
  purpose?: LocalizedText;
}>;

export type TraceScenario = Readonly<{
  scenario_id: string;
  case_kind: "normal" | "boundary" | "failure" | string;
  trace_id: string;
  python_artifact_id: string;
  artifact_version: string;
  initial_state: JsonValue;
  event_ids: readonly string[];
  expected_output_ref: string;
  fixture_ref: string;
}>;

export type EventAccessibility = Readonly<{
  accessible_label: LocalizedText;
  action_description: LocalizedText;
  interaction_role: string;
  keyboard_instruction: LocalizedText;
  focus_target: string;
  focus_order: number;
  live_status: Readonly<{ mode: "polite" | "assertive"; message: LocalizedText }>;
}>;

export type TraceEvent = Readonly<{
  event_id: string;
  trace_id: string;
  sequence: number;
  event_type: string;
  active_line_ids: readonly string[];
  before: JsonValue;
  delta: JsonValue;
  after: JsonValue;
  output_delta?: JsonValue;
  invariant_or_criterion: JsonValue;
  prediction: JsonValue;
  feedback: JsonValue;
  visual_targets: readonly string[];
  accessibility: EventAccessibility;
}>;

export type TraceChunk = Readonly<{
  schema_version: "paper4-v2-trace-chunk-v1" | string;
  pattern_id: string;
  owner: Readonly<{
    lesson_id: string;
    lesson_slug: string;
    python_artifact_id: string;
    artifact_version: string;
    code_sha256: string;
  }>;
  python_artifact: PythonArtifactDto;
  scenarios: readonly TraceScenario[];
  events: readonly TraceEvent[];
}>;

// Historical v1 types remain only so an un-migrated route can typecheck while
// its owner moves to v2. The v2 runtime never renders code_lines as Python.
export type VisualEvent = Readonly<{
  event_id: string; example_id: string; trace_id: string; sequence: number;
  source_event_label: string; event_type: string; code_lines: readonly string[];
  before: JsonValue; delta: JsonValue; after: JsonValue;
  invariant_or_criterion: JsonValue; pointers_or_call_frames?: JsonValue;
  output_delta?: JsonValue; prediction: JsonValue; feedback: JsonValue;
  visual_targets: readonly string[]; locale_views: readonly string[]; status?: string;
}>;
export type VisualPattern = Readonly<{
  pattern_id: string; title: LocalizedText; purpose: LocalizedText; source_batch: string;
  scenario_count: number;
  scenarios: readonly Readonly<{ scenario_id: string; case_kind: string; trace_id: string; example_id: string; event_ids: readonly string[] }>[];
  events: readonly VisualEvent[];
}>;
export type RuntimeRegistry = Readonly<{
  schema_version: string; source_release_id: string; source_manifest_sha256: string; generated_at: string;
  counts: Readonly<{ patterns: number; scenarios: number; unique_events: number }>;
  patterns: readonly VisualPattern[];
}>;

export type PredictionStatus = "idle" | "correct" | "incorrect";
export type RuntimeStepPhase = "predict" | "revealed";
export type RuntimeState = Readonly<{
  patternId: string; scenarioId: string; eventIndex: number; eventId: string;
  locale: Locale; playing: boolean; predictionStatus: PredictionStatus;
  predictionAnswer: string; inputRevision: number; stepPhase: RuntimeStepPhase;
}>;
export type RuntimeAction =
  | { readonly type: "SELECT_PATTERN"; readonly patternId: string }
  | { readonly type: "TRACE_READY"; readonly patternId: string; readonly scenarioId: string; readonly firstEventId: string }
  | { readonly type: "RESTORE_PROGRESS"; readonly patternId: string; readonly scenarioId: string; readonly eventIndex: number; readonly eventId: string; readonly stepPhase: RuntimeStepPhase; readonly predictionStatus: PredictionStatus; readonly predictionAnswer: string }
  | { readonly type: "PREVIOUS"; readonly eventId: string }
  | { readonly type: "NEXT"; readonly eventId: string; readonly keepPlaying?: boolean }
  | { readonly type: "PLAY" }
  | { readonly type: "PAUSE" }
  | { readonly type: "RESET"; readonly firstEventId: string }
  | { readonly type: "SET_LOCALE"; readonly locale: Locale }
  | { readonly type: "SUBMIT_PREDICTION"; readonly status: Exclude<PredictionStatus, "idle">; readonly answer: string }
  | { readonly type: "CHANGE_INPUT"; readonly scenarioId: string; readonly firstEventId: string };

type RuntimeCommonProps = Readonly<{
  initialPatternId?: string; locale?: Locale; initialLocale?: Locale;
  autoplayDelayMs?: number; headingLevel?: 2 | 3; className?: string;
  audience?: "learner" | "audit";
  onLearnerProgress?: (progress: Readonly<{ hasRecordedPrediction: boolean }>) => void;
}>;
export type Paper4VisualRuntimeProps = RuntimeCommonProps & (
  | Readonly<{ patterns: readonly PatternMetadata[]; pythonArtifact?: PythonArtifactDto; registry?: never }>
  | Readonly<{ registry: RuntimeRegistry; patterns?: never; pythonArtifact?: never }>
);
