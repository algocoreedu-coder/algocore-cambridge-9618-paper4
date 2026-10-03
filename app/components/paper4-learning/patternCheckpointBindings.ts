import type { PatternMetadata } from "@/app/components/paper4-visual/types";

import type { LearnerProjection } from "./learnerProjection";

export type PatternTraceSurface =
  | "paper4-visual-runtime"
  | "data-models-runtime"
  | "decision-rail"
  | "bespoke-trace"
  | "runtime-supplement";

type ProjectionCheckpoint = Readonly<{
  source: "learner-projection";
  scenarioKind: "normal" | "boundary" | "failure";
  stepIndex?: number;
  variantKind?: string;
}>;

type RuntimeCheckpoint = Readonly<{
  source: "verified-runtime";
  scenarioKind: "normal";
  stepIndex: 0;
}>;

export type PatternCheckpointBinding = Readonly<{
  patternId: string;
  lessonSlug: string;
  surface: PatternTraceSurface;
  checkpoint: ProjectionCheckpoint | RuntimeCheckpoint;
}>;

const normal = <const PatternId extends string, const LessonSlug extends string, const Surface extends Exclude<PatternTraceSurface, "paper4-visual-runtime" | "runtime-supplement">>(patternId: PatternId, lessonSlug: LessonSlug, surface: Surface, stepIndex: number) => ({
  patternId,
  lessonSlug,
  surface,
  checkpoint: { source: "learner-projection", scenarioKind: "normal", stepIndex },
} as const);

const runtime = <const PatternId extends string, const LessonSlug extends string, const Surface extends "paper4-visual-runtime" | "runtime-supplement">(patternId: PatternId, lessonSlug: LessonSlug, surface: Surface) => ({
  patternId,
  lessonSlug,
  surface,
  checkpoint: { source: "verified-runtime", scenarioKind: "normal", stepIndex: 0 },
} as const);

// A projection binding is used only where the rendered learner checkpoint performs
// the named operation. Patterns whose lesson projection does not contain that
// operation stay bound to their verified trace chunk through runtime-supplement.
export const PAPER4_PATTERN_CHECKPOINT_BINDINGS = [
  normal("ALGORITHM_REWRITE", "recursion", "bespoke-trace", 0),
  normal("ALGORITHM_TRANSLATE", "procedural-design", "bespoke-trace", 0),
  normal("ARRAY_APPEND", "data-models", "data-models-runtime", 2),
  runtime("BINARY_SEARCH", "binary-search", "paper4-visual-runtime"),
  normal("BUBBLE_SORT", "sorting", "bespoke-trace", 0),
  normal("CHECK_DIGIT", "validation-rules", "bespoke-trace", 1),
  runtime("COUNT_OCCURRENCES", "search-collections", "runtime-supplement"),
  normal("DATA_RECORD", "data-models", "data-models-runtime", 0),
  normal("DATA_STORAGE", "data-models", "data-models-runtime", 1),
  normal("EVIDENCE_RUN", "exam-workflow", "decision-rail", 1),
  normal("FILE_READ_ARRAY", "text-files", "decision-rail", 2),
  normal("FILE_READ_OBJECTS", "object-files", "decision-rail", 0),
  normal("FILE_WRITE", "text-files", "decision-rail", 0),
  runtime("FILTER_RECORDS", "search-collections", "runtime-supplement"),
  runtime("GROUP_AGGREGATE", "search-collections", "runtime-supplement"),
  normal("HASH_FUNCTION", "hashing", "decision-rail", 0),
  normal("HASH_INSERT", "hashing", "decision-rail", 1),
  runtime("HASH_SEARCH", "hashing", "runtime-supplement"),
  runtime("HASH_SETUP", "hashing", "runtime-supplement"),
  runtime("INSERTION_SORT", "sorting", "runtime-supplement"),
  normal("LINEAR_SEARCH", "search-collections", "bespoke-trace", 0),
  normal("LIST_INSERT", "linked-list", "bespoke-trace", 0),
  normal("LIST_REMOVE", "linked-list", "bespoke-trace", 4),
  normal("LIST_SETUP", "linked-list", "bespoke-trace", 0),
  normal("LIST_TRAVERSE", "linked-list", "bespoke-trace", 2),
  normal("MAIN_FLOW", "exam-workflow", "decision-rail", 0),
  normal("OOP_CAPACITY_ADD", "oop-aggregation", "decision-rail", 0),
  normal("OOP_CLASS", "oop-model", "decision-rail", 0),
  normal("OOP_GET", "oop-state", "decision-rail", 0),
  normal("OOP_INSTANTIATE", "oop-model", "decision-rail", 1),
  normal("OOP_OVERRIDE", "oop-inheritance", "decision-rail", 2),
  normal("OOP_SET", "oop-state", "decision-rail", 1),
  normal("OOP_SUBCLASS", "oop-inheritance", "decision-rail", 0),
  normal("OOP_UPDATE", "oop-state", "decision-rail", 2),
  runtime("ORDERED_INSERT", "sorting", "runtime-supplement"),
  normal("OUTPUT_FORMAT", "exam-workflow", "decision-rail", 2),
  normal("QUEUE_DEQUEUE", "queue", "bespoke-trace", 2),
  normal("QUEUE_ENQUEUE", "queue", "bespoke-trace", 0),
  normal("QUEUE_INSPECT", "queue", "bespoke-trace", 4),
  runtime("QUEUE_REDUCE", "queue", "runtime-supplement"),
  normal("QUEUE_SETUP", "queue", "bespoke-trace", 0),
  runtime("RANDOM_ARRAY", "data-models", "runtime-supplement"),
  normal("RULE_COMPUTE", "validation-rules", "bespoke-trace", 1),
  runtime("RUN_LENGTH_ENCODE", "text-processing", "runtime-supplement"),
  runtime("STACK_PAIR", "stack", "runtime-supplement"),
  normal("STACK_POP", "stack", "bespoke-trace", 2),
  normal("STACK_PUSH", "stack", "bespoke-trace", 0),
  runtime("STACK_REDUCE", "stack", "runtime-supplement"),
  normal("STACK_SETUP", "stack", "bespoke-trace", 0),
  runtime("STRING_COMPARE", "text-processing", "runtime-supplement"),
  normal("STRING_ROUTE", "text-processing", "bespoke-trace", 2),
  normal("STRING_SPLIT", "text-processing", "bespoke-trace", 0),
  runtime("TREE_INSERT", "binary-tree", "runtime-supplement"),
  normal("TREE_SEARCH", "binary-tree", "decision-rail", 0),
  runtime("TREE_SETUP", "binary-tree", "runtime-supplement"),
  runtime("TREE_TRAVERSE", "binary-tree", "runtime-supplement"),
  normal("UNIQUE_SELECTION", "validation-rules", "bespoke-trace", 1),
  normal("VALIDATE_INPUT", "validation-rules", "bespoke-trace", 0),
] as const satisfies readonly PatternCheckpointBinding[];

export type OfficialPatternId = (typeof PAPER4_PATTERN_CHECKPOINT_BINDINGS)[number]["patternId"];

export type LessonPatternCheckpointContract = Readonly<{
  lessonSlug: string;
  bindings: readonly PatternCheckpointBinding[];
  runtimeSupplementPatterns: readonly PatternMetadata[];
}>;

type TraceProjection = Readonly<{
  stages: Readonly<{
    trace: Readonly<{
      steps: readonly unknown[];
      variants?: readonly Readonly<{ kind?: string }>[];
    }>;
  }>;
}>;

function assertProjectionCheckpoint(binding: PatternCheckpointBinding, projection: TraceProjection) {
  const checkpoint = binding.checkpoint;
  if (checkpoint.source !== "learner-projection") return;
  const trace = projection.stages.trace;
  if (checkpoint.scenarioKind === "normal") {
    const index = checkpoint.stepIndex;
    if (index === undefined || index < 0 || index >= trace.steps.length) {
      throw new Error(`Pattern checkpoint is outside the rendered normal trace for ${binding.lessonSlug}.`);
    }
    return;
  }
  if (!checkpoint.variantKind || !(trace.variants ?? []).some((variant) => variant.kind === checkpoint.variantKind)) {
    throw new Error(`Pattern checkpoint variant is not rendered for ${binding.lessonSlug}.`);
  }
}

export function bindLessonPatternCheckpoints(
  lessonSlug: string,
  patterns: readonly PatternMetadata[],
  projection: LearnerProjection,
): LessonPatternCheckpointContract {
  const bindings = PAPER4_PATTERN_CHECKPOINT_BINDINGS.filter((binding) => binding.lessonSlug === lessonSlug);
  const expected = bindings.map((binding) => binding.patternId).sort();
  const received = patterns.map((pattern) => pattern.pattern_id).sort();
  if (expected.length !== received.length || expected.some((patternId, index) => patternId !== received[index])) {
    throw new Error(`Owned pattern metadata and checkpoint bindings differ for ${lessonSlug}.`);
  }
  const metadataById = new Map(patterns.map((pattern) => [pattern.pattern_id, pattern]));
  for (const binding of bindings) {
    const metadata = metadataById.get(binding.patternId);
    if (!metadata || metadata.owner_lesson_slug !== lessonSlug || !metadata.trace_url) {
      throw new Error(`Pattern metadata cannot resolve a verified trace for ${lessonSlug}.`);
    }
    assertProjectionCheckpoint(binding, projection as TraceProjection);
  }
  return {
    lessonSlug,
    bindings,
    runtimeSupplementPatterns: bindings
      .filter((binding) => binding.surface === "runtime-supplement")
      .map((binding) => metadataById.get(binding.patternId)!),
  };
}
