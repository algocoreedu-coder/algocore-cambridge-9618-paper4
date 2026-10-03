export type VisualLocale = "en" | "vi";
export type VisualScenario = "normal" | "boundary" | "failure";

export type LocalText = Readonly<{ en: string; vi: string }>;

export type VisualFamilyId =
  | "VC-01" | "VC-02" | "VC-03" | "VC-04"
  | "VC-05" | "VC-06" | "VC-07" | "VC-08"
  | "VC-09" | "VC-10" | "VC-11" | "VC-12"
  | "VC-13" | "VC-14" | "VC-15" | "VC-16";

export type VisualKind =
  | "array" | "record" | "pipeline" | "predicate"
  | "tests" | "search" | "sort" | "stack"
  | "queue" | "nodes" | "hash" | "objects"
  | "file" | "exception" | "counter" | "console";

export type VisualField = Readonly<{
  label: LocalText;
  values: Readonly<Record<VisualScenario, string>>;
}>;

export type ScenarioFixture = Readonly<{
  prompt: LocalText;
  options: readonly [LocalText, LocalText, LocalText];
  correctOption: 0 | 1 | 2;
  reveal: LocalText;
  steps: readonly [LocalText, LocalText, LocalText];
  code: readonly string[];
}>;

export type VisualFamilyDefinition = Readonly<{
  id: VisualFamilyId;
  kind: VisualKind;
  name: LocalText;
  purpose: LocalText;
  lessons: readonly string[];
  fields: readonly VisualField[];
  scenarios: Readonly<Record<VisualScenario, ScenarioFixture>>;
}>;

export type VisualFamilyProps = Readonly<{
  locale?: VisualLocale;
  scenario?: VisualScenario;
}>;
