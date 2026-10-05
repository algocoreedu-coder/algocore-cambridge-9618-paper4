import "server-only";

import privateRegistry from "./generated/assessment-private.json";
import { validatePrivateSolution, type Paper2PrivateSolution, type Paper2QuestionReference } from "./question-types";

const solutions = privateRegistry.solutions.map((value, index) => {
  const result = validatePrivateSolution(value, `solution[${index}]`);
  if (!result.ok) throw new Error(`Invalid Paper 2 private solution: ${result.issues.map((issue) => `${issue.code}@${issue.path}`).join(", ")}`);
  return result.value;
});

const solutionByIdentity = new Map(solutions.map((solution) => [`${solution.questionId}@${solution.questionVersion}`, solution]));

export function getPaper2PrivateSolution(questionId: string, questionVersion: string) {
  return solutionByIdentity.get(`${questionId}@${questionVersion}`);
}

export function resolvePaper2PrivateSolutions(refs: readonly Paper2QuestionReference[]): readonly Paper2PrivateSolution[] {
  return refs.map((ref) => getPaper2PrivateSolution(ref.questionId, ref.questionVersion)).filter((solution): solution is Paper2PrivateSolution => Boolean(solution));
}
