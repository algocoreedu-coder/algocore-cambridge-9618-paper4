import "server-only";

import diagnosticSolution from "@/content/paper4/mocks/diagnostic/solution.json";
import halfASolution from "@/content/paper4/mocks/half-a/solution.json";
import halfBSolution from "@/content/paper4/mocks/half-b/solution.json";
import mockASolution from "@/content/paper4/mocks/mock-a/solution.json";
import mockBSolution from "@/content/paper4/mocks/mock-b/solution.json";

import type { LocalizedText } from "./rehearsals";

export type RehearsalSolutionAnswer = Readonly<{
  question_id: string;
  marks: number;
  mark_groups: readonly number[];
  model?: LocalizedText;
  criteria?: Readonly<Record<"en" | "vi", readonly string[]>>;
}>;

export type RehearsalSolution = Readonly<{
  schema_version: "1.0.0";
  paper_id: string;
  authority: "AlgoCore_authored_rubric";
  official_marks: null;
  answers: readonly RehearsalSolutionAnswer[];
}>;

const solutions = [diagnosticSolution, halfASolution, halfBSolution, mockASolution, mockBSolution] as unknown as readonly RehearsalSolution[];
const solutionMap = new Map(solutions.map((solution) => [solution.paper_id, solution]));

export function getRehearsalSolution(paperId: string) {
  return solutionMap.get(paperId) ?? null;
}
