import type { LocalizedText, PythonArtifactDto } from "@/app/components/paper4-visual/types";

import { EXAM_CODE_BY_PATTERN } from "./examCodeCatalog";

const BINARY_SEARCH_RECIPE_LINE_IDS = [
  "binary-search.v1.L012",
  "binary-search.v1.L013",
  "binary-search.v1.L014",
  "binary-search.v1.L015",
  "binary-search.v1.L016",
  "binary-search.v1.L024",
  "binary-search.v1.L025",
  "binary-search.v1.L026",
  "binary-search.v1.L027",
  "binary-search.v1.L028",
  "binary-search.v1.L029",
  "binary-search.v1.L031",
] as const;

/**
 * Builds a presentation-only artifact from the teacher-approved recipe.
 * The verified artifact is still passed separately to traceLoader, so execution,
 * hashes and audit evidence remain unchanged.
 */
export function createLearnerPythonArtifact(
  verifiedArtifact: PythonArtifactDto,
  lessonSlug: string,
  recipeLines: readonly string[],
  caption: LocalizedText,
): PythonArtifactDto {
  const knownIds = lessonSlug === "binary-search" ? BINARY_SEARCH_RECIPE_LINE_IDS : [];
  const displayLines = lessonSlug === "binary-search"
    ? EXAM_CODE_BY_PATTERN.get("BINARY_SEARCH")?.code ?? recipeLines
    : recipeLines;
  return {
    python_artifact_id: `${verifiedArtifact.python_artifact_id}.learner-recipe`,
    lesson_id: verifiedArtifact.lesson_id,
    pattern_ids: verifiedArtifact.pattern_ids,
    version: `${verifiedArtifact.version}.learner-recipe`,
    language: "python",
    lines: displayLines.map((text, index) => ({
      line_id: knownIds[index] ?? `${lessonSlug}.learner.L${String(index + 1).padStart(3, "0")}`,
      order: index + 1,
      text,
    })),
    entry_point: lessonSlug === "binary-search" ? "binary_search" : verifiedArtifact.entry_point,
    code_sha256: "presentation-only-teacher-approved-recipe",
    caption,
  };
}
