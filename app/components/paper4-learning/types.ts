import type { JsonValue, PatternMetadata, PythonArtifactDto } from "@/app/components/paper4-visual/types";

export type LearningLocale = "vi" | "en";
export type Localized<T = string> = Readonly<Record<LearningLocale, T>>;

export type LearningBlockKind =
  | "recognition" | "exam-cues" | "knowledge" | "method" | "worked-example"
  | "action-view" | "marking-pitfalls" | "practice" | "retrieval" | "next-and-sources";

export type LessonSection = Readonly<{
  section_id: string;
  kind: LearningBlockKind;
  order: number;
  data_keys: readonly string[];
}>;

export type SourceLocator = Readonly<{
  source_id?: string;
  pdf_page?: number | string;
  printed_page?: number | string;
  heading?: string;
  bullet_locator?: string;
  anchor_text?: string;
}>;

export type LearningSourceReference = Readonly<{
  source_id: string;
  authority: string;
  locator: SourceLocator;
}>;

export type KnowledgeUnit = Readonly<{
  knowledge_unit_id: string;
  disposition: string;
  version: string;
  objective_refs: readonly Readonly<{ objective_id: string; syllabus_version: string; locator: SourceLocator }>[];
  book_refs: readonly Readonly<{ section_id: string; chapter: number; printed_pages: readonly number[]; pdf_pages: readonly number[]; relationship: string }>[];
  title: Localized;
  explanation: Localized;
  python_connection: Localized;
  representation: Localized;
  invariant_or_rule: Localized;
  misconceptions: readonly Localized[];
  exam_signals: readonly Localized[];
  micro_example: Readonly<{
    scenario: Localized;
    walkthrough: Localized;
    python_artifact_id: string;
    python_artifact_refs: readonly string[];
    active_line_ids: readonly string[];
    authority: string;
  }>;
  self_check: Readonly<{
    prompt: Localized;
    answer: Localized;
    rationale: Localized;
    answer_hidden_initially: boolean;
    authority: string;
  }>;
}>;

export type PythonFixture = Readonly<{ fixture_id: string; case_kind: "normal" | "boundary" | "failure" | string; input: JsonValue }>;
export type PythonExpectedOutput = Readonly<{ expected_output_id: string; fixture_ref: string; value: JsonValue }>;

export type MarkingAtom = Readonly<{
  atom_id: string;
  authority: string;
  criterion: Localized;
  locator: SourceLocator;
}>;

export type MarkingChain = Readonly<{
  marking_chain_id: string;
  pattern_id: string;
  requirement_ref: string;
  method_step_refs: readonly string[];
  error_ref: string;
  detection_check: Localized;
  repair_check: Localized;
  marking_atom_count: number;
  marking_atom_selection: "representative_public_sample";
  marking_atoms: readonly MarkingAtom[];
  limited_evidence?: boolean;
  transfer_limit?: Localized | string;
}>;

export type AssessmentItem = Readonly<{
  assessment_item_id: string;
  pattern_ids: readonly string[];
  assessment_requirement_ids: readonly string[];
  destination_id: string;
  level: "guided" | "faded" | "independent" | string;
  prompt: Localized;
  shared_fixture_code_data_ids: readonly string[];
  expected_artifact: Localized;
  hint: Localized;
  feedback: Localized;
  self_rubric: Readonly<{
    authority: string;
    official_marks: number | null;
    criteria: readonly Readonly<{ criterion_id: string; description: Localized; evidence_required: string }>[];
    pass_rule: Localized;
    retry_rule: Localized;
    pattern_authority?: string;
  }>;
  disclosure_contract: Readonly<Record<string, JsonValue>>;
}>;

export type LessonDto = Readonly<{
  schema_version: "paper4-v2-lesson-dto-v1";
  identity: Readonly<{
    lesson_id: string; package_id: string; slug: string; version: string; label: string;
    title: Localized; scope: Readonly<Record<string, JsonValue>>;
  }>;
  authority: Readonly<{
    official_pattern_ids: readonly string[];
    approved_association_pattern_ids: readonly string[];
    association_scope: "official_pattern_owner" | "AlgoCore_representational_workflow_only";
    cambridge_marking_chain_ids: readonly string[];
  }>;
  sections: readonly LessonSection[];
  theory: Readonly<{ knowledge_units: readonly KnowledgeUnit[] }>;
  python: PythonArtifactDto;
  tests: Readonly<{
    fixtures: readonly PythonFixture[];
    expected_outputs: readonly PythonExpectedOutput[];
    normal_boundary_failure_coverage: Readonly<Record<string, boolean>>;
    author_run_ref: string;
    independent_rerun_ref: string;
    execution_log_sha256: string;
  }>;
  visual: Readonly<{
    owned_patterns: readonly PatternMetadata[];
    approved_static_or_representational_support: readonly Readonly<{
      pattern_id: string; authority: "AlgoCore_representational_workflow_only"; official_marks: null;
    }>[];
  }>;
  marking: Readonly<{ chains: readonly MarkingChain[] }>;
  errors: Readonly<{
    error_refs: readonly string[];
    misconceptions: readonly (Localized & Readonly<{ knowledge_unit_id: string }>)[];
    checks: readonly Readonly<{ marking_chain_id: string; detection_check: Localized; repair_check: Localized }>[];
  }>;
  practice: Readonly<{ items: readonly AssessmentItem[] }>;
  retrieval: Readonly<{
    release_refs: readonly string[];
    items: readonly Readonly<{
      knowledge_unit_id: string; prompt: Localized; answer: Localized; rationale: Localized;
      answer_hidden_initially: boolean; authority: string;
    }>[];
  }>;
  navigation: Readonly<{ previous_slug: string | null; next_slug: string | null }>;
  sources: readonly LearningSourceReference[];
}>;

export type CourseManifest = Readonly<{
  schema_version: "paper4-v2-course-manifest-v1";
  canonical_registry_sha256: string;
  compiler_input_semantic_sha256: string;
  editorial_registry: Readonly<{ source_id: string; sha256: string; course_title: Localized }>;
  counts: Readonly<{
    packages: 13; lessons: 26; patterns: 58; sections_per_lesson: 10;
    knowledge_units: 108; python_artifacts: 26; visual_scenario_traces: 174;
    visual_event_bindings: 589; marking_chains: 58; assessment_items: 78; lesson_release_records: 26;
  }>;
  canonical_sections: readonly Readonly<{ section_id: string; kind: LearningBlockKind; order: number }>[];
  packages: readonly Readonly<{ package_id: string; label: string; title: Localized; lesson_slugs: readonly string[] }>[];
  lessons: readonly Readonly<{
    lesson_id: string; package_id: string; slug: string; label: string; title: Localized; dto_module: string;
    official_pattern_ids: readonly string[]; approved_association_pattern_ids: readonly string[];
  }>[];
  patterns: readonly PatternMetadata[];
}>;
