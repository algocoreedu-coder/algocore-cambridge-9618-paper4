import "server-only";

import publicRegistry from "./generated/assessment-public.json";
import descriptors from "./generated/assessment-descriptors.json";
import {
  validateMock,
  validatePracticeSet,
  validatePublicQuestion,
  type Paper2Mock,
  type Paper2PracticeSet,
  type Paper2PublicQuestion,
  type Paper2QuestionReference,
} from "./question-types";

export type Paper2LearnerMock = Omit<Paper2Mock, "privateHash">;

const questions = validateCollection(publicRegistry.questions, validatePublicQuestion, "question");
const practiceSets = validateCollection(publicRegistry.practiceSets, validatePracticeSet, "practice set");
const mocks = publicRegistry.mocks.map((value, index) => {
  const result = validateMock({ ...value, privateHash: "0".repeat(64) }, `mock[${index}]`);
  if (!result.ok) throw new Error(`Invalid Paper 2 mock: ${result.issues.map((issue) => `${issue.code}@${issue.path}`).join(", ")}`);
  const { privateHash: _privateHash, ...learnerMock } = result.value;
  return learnerMock as Paper2LearnerMock;
});

const questionByIdentity = new Map(questions.map((question) => [questionIdentity(question), question]));
const practiceSetById = new Map(practiceSets.map((set) => [set.setId, set]));
const mockById = new Map(mocks.map((mock) => [mock.paperId, mock]));

export function getPaper2AssessmentDescriptors() {
  return descriptors;
}

export function listPaper2PublicQuestions(): readonly Paper2PublicQuestion[] {
  return questions;
}

export function listPaper2PracticeSets(): readonly Paper2PracticeSet[] {
  return practiceSets;
}

export function listPaper2Mocks(): readonly Paper2LearnerMock[] {
  return mocks;
}

export function getPaper2PublicQuestion(questionId: string, questionVersion: string) {
  return questionByIdentity.get(`${questionId}@${questionVersion}`);
}

export function getPaper2PracticeSet(setId: string) {
  return practiceSetById.get(setId);
}

export function getPaper2Mock(paperId: string) {
  return mockById.get(paperId);
}

export function resolvePaper2PublicQuestions(refs: readonly Paper2QuestionReference[]) {
  return refs.map((ref) => getPaper2PublicQuestion(ref.questionId, ref.questionVersion)).filter((question): question is Paper2PublicQuestion => Boolean(question));
}

function questionIdentity(question: Paper2PublicQuestion) {
  return `${question.questionId}@${question.questionVersion}`;
}

function validateCollection<T>(values: readonly unknown[], validate: (value: unknown, path?: string) => { readonly ok: true; readonly value: T } | { readonly ok: false; readonly issues: readonly { readonly code: string; readonly path: string }[] }, label: string): readonly T[] {
  return values.map((value, index) => {
    const result = validate(value, `${label}[${index}]`);
    if (!result.ok) throw new Error(`Invalid Paper 2 ${label}: ${result.issues.map((issue) => `${issue.code}@${issue.path}`).join(", ")}`);
    return result.value;
  });
}
