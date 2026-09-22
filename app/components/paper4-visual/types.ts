export type Locale = "vi" | "en";

export type LocalizedText = Readonly<Record<Locale, string>>;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type VisualEvent = Readonly<{
  event_id: string;
  example_id: string;
  trace_id: string;
  sequence: number;
  source_event_label: string;
  event_type: string;
  code_lines: readonly string[];
  before: JsonValue;
  delta: JsonValue;
  after: JsonValue;
  invariant_or_criterion: JsonValue;
  pointers_or_call_frames?: JsonValue;
  output_delta?: JsonValue;
  prediction: JsonValue;
  feedback: JsonValue;
  visual_targets: readonly string[];
  locale_views: readonly string[];
  status?: string;
}>;

export type VisualPattern = Readonly<{
  pattern_id: string;
  title: LocalizedText;
  purpose: LocalizedText;
  source_batch: string;
  scenario_count: number;
  scenarios: readonly Readonly<{
    scenario_id: string;
    case_kind: string;
    trace_id: string;
    example_id: string;
    event_ids: readonly string[];
  }>[];
  events: readonly VisualEvent[];
}>;

export type RuntimeRegistry = Readonly<{
  schema_version: string;
  source_release_id: string;
  source_manifest_sha256: string;
  generated_at: string;
  counts: Readonly<{
    patterns: number;
    scenarios: number;
    unique_events: number;
  }>;
  patterns: readonly VisualPattern[];
}>;

export type PredictionStatus = "idle" | "correct" | "incorrect";

export type RuntimeState = Readonly<{
  patternId: string;
  eventIndex: number;
  locale: Locale;
  playing: boolean;
  predictionStatus: PredictionStatus;
  predictionAnswer: string;
  inputRevision: number;
  inputValue: string;
}>;

export type RuntimeAction =
  | { readonly type: "SELECT_PATTERN"; readonly patternId: string }
  | { readonly type: "PREVIOUS" }
  | { readonly type: "NEXT"; readonly eventCount: number }
  | { readonly type: "PLAY" }
  | { readonly type: "PAUSE" }
  | { readonly type: "RESET" }
  | { readonly type: "SET_LOCALE"; readonly locale: Locale }
  | {
      readonly type: "SUBMIT_PREDICTION";
      readonly status: Exclude<PredictionStatus, "idle">;
      readonly answer: string;
    }
  | { readonly type: "CHANGE_INPUT"; readonly value: string };

export type Paper4VisualRuntimeProps = Readonly<{
  registry: RuntimeRegistry;
  initialPatternId?: string;
  initialLocale?: Locale;
  autoplayDelayMs?: number;
  headingLevel?: 2 | 3;
  className?: string;
}>;
