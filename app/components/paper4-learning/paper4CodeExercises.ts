import type { PythonArtifactDto } from "@/app/components/paper4-visual/types";
import type { AssessmentItem } from "./types";

export const PAPER4_CODE_GATE_VERSION = 1;

export type CodeExerciseContract = Readonly<{
  assessmentItemId: string;
  lessonSlug: "binary-search";
  starterKind: "repair" | "independent";
  requiredCases: readonly ["normal", "boundary", "failure"];
}>;

const contracts: readonly CodeExerciseContract[] = [
  { assessmentItemId: "binary-search.f1", lessonSlug: "binary-search", starterKind: "repair", requiredCases: ["normal", "boundary", "failure"] },
  { assessmentItemId: "binary-search.i1", lessonSlug: "binary-search", starterKind: "independent", requiredCases: ["normal", "boundary", "failure"] },
];

export function codeExerciseFor(item: AssessmentItem, lessonSlug: string) {
  return contracts.find((contract) => contract.assessmentItemId === item.assessment_item_id && contract.lessonSlug === lessonSlug) ?? null;
}

function withoutCommandLineEntry(source: string) {
  return source.split('\nif __name__ == "__main__":')[0].replace("import sys\n", "").trimEnd();
}

export function starterSource(contract: CodeExerciseContract, artifact: PythonArtifactDto) {
  const canonical = withoutCommandLineEntry([...artifact.lines].sort((a, b) => a.order - b.order).map((line) => line.text).join("\n"));
  if (contract.starterKind === "repair") {
    return canonical
      .replace("while low <= high:", "while low < high:  # BUG: repair the interval guard")
      .replace("if not is_ascending(values):", "if False:  # BUG: reject input that breaks the precondition");
  }

  const iterativeStart = canonical.indexOf("def binary_search(");
  const recursiveStart = canonical.indexOf("def recursive_binary_search(");
  const runStart = canonical.indexOf("def run(");
  if (iterativeStart < 0 || recursiveStart < 0 || runStart < 0) return canonical;
  return `${canonical.slice(0, iterativeStart)}def binary_search(values, target, trace):
    # TODO: implement the closed interval [low, high] version.
    return -1


def recursive_binary_search(values, target, low, high, trace):
    # TODO: implement the same contract recursively.
    return -1


${canonical.slice(runStart)}`;
}

export function classifyCanonicalAssessments(items: readonly AssessmentItem[]) {
  return items.reduce((counts, item) => {
    if (isCanonicalCodingTask(item)) counts.coding += 1;
    else counts.freeResponse += 1;
    if (contracts.some((contract) => contract.assessmentItemId === item.assessment_item_id)) counts.executed += 1;
    return counts;
  }, { coding: 0, freeResponse: 0, executed: 0 });
}

export function isCanonicalCodingTask(item: AssessmentItem) {
  return !new Set(["graphs.f1", "graphs.g1", "graphs.i1"]).has(item.assessment_item_id) && item.level !== "guided";
}

export const PAPER4_CODE_EXERCISE_CONTRACTS = contracts;
