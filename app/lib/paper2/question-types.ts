import type { Localized } from "./types";
import {
  isPaper2Localized,
  isPaper2StableId,
  isRecord,
  type Paper2ContractIssue,
  type Paper2ReviewRecord,
  type Paper2ValidationResult,
  validationFailure,
  validationSuccess,
} from "./coverage-types";
import {
  evaluateLearnerEligibility,
  type Paper2AllowedUse,
  type Paper2RightsRecord,
  type Paper2SourceRecord,
} from "./source-types";

export const PAPER2_ASSESSMENT_MODES = [
  "lesson_guided",
  "set_guided",
  "diagnostic_closed",
  "set_closed",
  "mock_timed",
] as const;

export const PAPER2_QUESTION_ORIGINS = ["official-question", "adapted-from-source", "teacher-created"] as const;
export const PAPER2_MARK_STATUSES = ["official", "teacher-calibrated", "teacher-created", "unscored"] as const;
export const PAPER2_QUESTION_STATUSES = ["draft", "reviewed", "published", "blocked"] as const;

export type Paper2AssessmentMode = (typeof PAPER2_ASSESSMENT_MODES)[number];
export type Paper2QuestionOrigin = (typeof PAPER2_QUESTION_ORIGINS)[number];
export type Paper2MarkStatus = (typeof PAPER2_MARK_STATUSES)[number];
export type Paper2QuestionStatus = (typeof PAPER2_QUESTION_STATUSES)[number];

export interface Paper2LocaleContract {
  readonly englishCanonical: true;
  readonly vietnameseSemanticParity: true;
  readonly reviewedRevision: string;
}

export interface Paper2PublicQuestion {
  readonly questionId: string;
  readonly questionVersion: string;
  readonly status: Paper2QuestionStatus;
  readonly title: Localized;
  readonly prompt: Localized;
  readonly stimulus?: Localized;
  readonly answerProduct: Localized;
  readonly sectionIds: readonly string[];
  readonly topicIds: readonly string[];
  readonly patternIds: readonly string[];
  readonly familyIds: readonly string[];
  readonly subskillIds: readonly string[];
  readonly coverageIds: readonly string[];
  readonly commandWord: string;
  readonly recommendedMinutes: number;
  readonly markStatus: Paper2MarkStatus;
  readonly marks: number | null;
  readonly sourceIds: readonly string[];
  readonly rightsId: string;
  readonly origin: Paper2QuestionOrigin;
  readonly allowedModes: readonly Paper2AssessmentMode[];
  readonly localeContract: Paper2LocaleContract;
  readonly publicHash: string;
}

export interface Paper2MarkPoint {
  readonly markPointId: string;
  readonly description: Localized;
  readonly marks: number;
  readonly sourceIds: readonly string[];
  readonly authority: Exclude<Paper2MarkStatus, "unscored">;
  readonly notApplicableAllowed?: boolean;
}

export interface Paper2PrivateSolution {
  readonly rubricId: string;
  readonly rubricVersion: string;
  readonly questionId: string;
  readonly questionVersion: string;
  readonly modelAnswer: Localized;
  readonly markPoints: readonly Paper2MarkPoint[];
  readonly acceptedAlternatives: readonly Localized[];
  readonly dependencyCredit: Localized;
  readonly commonErrors: readonly Localized[];
  readonly misconceptionIds: readonly string[];
  readonly authority: Paper2MarkStatus;
  readonly privateHash: string;
}

export interface Paper2QuestionReference {
  readonly questionId: string;
  readonly questionVersion: string;
}

export type Paper2PracticeSetKind = "section_mixed" | "cumulative" | "diagnostic" | "guided_drill";
export type Paper2SolutionDisclosure = "immediate" | "after_explicit_submit";

export interface Paper2PracticeSet {
  readonly setId: string;
  readonly setVersion: string;
  readonly kind: Paper2PracticeSetKind;
  readonly title: Localized;
  readonly instructions: Localized;
  readonly mode: "set_guided" | "diagnostic_closed" | "set_closed";
  readonly questionRefs: readonly Paper2QuestionReference[];
  readonly prerequisiteTopicIds: readonly string[];
  readonly solutionDisclosure: Paper2SolutionDisclosure;
  readonly computedMarks: number;
  readonly computedMinutes: number;
  readonly coverageSummary: readonly string[];
  readonly rightsStatus: "approved" | "blocked";
  readonly review: Paper2ReviewRecord;
}

export interface Paper2MockBlueprintEntry {
  readonly questionId: string;
  readonly sectionIds: readonly string[];
  readonly topicIds: readonly string[];
  readonly familyIds: readonly string[];
  readonly commandWord: string;
  readonly answerProduct: string;
  readonly markBand: string;
  readonly year: number | null;
  readonly session: string | null;
  readonly variant: string | null;
  readonly difficultyRationale: string;
}

export interface Paper2Mock {
  readonly paperId: string;
  readonly paperVersion: string;
  readonly mode: "mock_timed";
  readonly durationMinutes: 120;
  readonly totalMarks: 75;
  readonly questionRefs: readonly Paper2QuestionReference[];
  readonly blueprint: readonly Paper2MockBlueprintEntry[];
  readonly sourceSummary: string;
  readonly rightsSummary: string;
  readonly localeContract: Paper2LocaleContract;
  readonly solutionPackId: string;
  readonly publicHash: string;
  readonly privateHash: string;
  readonly independentReviewStatus: "approved" | "changes_required" | "blocked";
}

export interface Paper2QuestionAuthorityContext {
  readonly sourcesById: ReadonlyMap<string, Paper2SourceRecord>;
  readonly rightsById: ReadonlyMap<string, Paper2RightsRecord>;
  readonly officialTaskIdentityVerified?: boolean;
  readonly requestedUse?: Paper2AllowedUse;
}

export interface Paper2CompositionContext {
  readonly questionsByIdentity: ReadonlyMap<string, Paper2PublicQuestion>;
}

export function isPaper2AssessmentMode(value: unknown): value is Paper2AssessmentMode {
  return PAPER2_ASSESSMENT_MODES.includes(value as Paper2AssessmentMode);
}

export function validatePublicQuestion(value: unknown, path = "question"): Paper2ValidationResult<Paper2PublicQuestion> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) return validationFailure([{ code: "QUESTION_NOT_OBJECT", path, message: "Public question must be an object." }]);
  requireId(value.questionId, `${path}.questionId`, issues);
  requireVersion(value.questionVersion, `${path}.questionVersion`, issues);
  if (!PAPER2_QUESTION_STATUSES.includes(value.status as Paper2QuestionStatus)) issues.push(issue("QUESTION_STATUS_INVALID", `${path}.status`, "Unknown question status."));
  requireLocalized(value.title, `${path}.title`, issues);
  requireLocalized(value.prompt, `${path}.prompt`, issues);
  if (value.stimulus !== undefined) requireLocalized(value.stimulus, `${path}.stimulus`, issues);
  requireLocalized(value.answerProduct, `${path}.answerProduct`, issues);
  for (const key of ["sectionIds", "topicIds", "patternIds", "familyIds", "subskillIds", "coverageIds", "sourceIds"] as const) {
    validateIdArray(value[key], `${path}.${key}`, issues, key === "topicIds" || key === "coverageIds" || key === "sourceIds");
  }
  requireText(value.commandWord, `${path}.commandWord`, "QUESTION_COMMAND_WORD_REQUIRED", issues);
  if (typeof value.recommendedMinutes !== "number" || !Number.isFinite(value.recommendedMinutes) || value.recommendedMinutes <= 0) issues.push(issue("QUESTION_MINUTES_INVALID", `${path}.recommendedMinutes`, "Recommended minutes must be positive."));
  if (!PAPER2_MARK_STATUSES.includes(value.markStatus as Paper2MarkStatus)) issues.push(issue("QUESTION_MARK_STATUS_INVALID", `${path}.markStatus`, "Unknown mark status."));
  if (value.markStatus === "unscored") {
    if (value.marks !== null) issues.push(issue("QUESTION_UNSCORED_MARKS_NOT_NULL", `${path}.marks`, "Unscored questions require marks: null."));
  } else if (!Number.isInteger(value.marks) || (value.marks as number) <= 0) {
    issues.push(issue("QUESTION_MARKS_INVALID", `${path}.marks`, "Scored questions require positive integer marks."));
  }
  requireId(value.rightsId, `${path}.rightsId`, issues);
  if (!PAPER2_QUESTION_ORIGINS.includes(value.origin as Paper2QuestionOrigin)) issues.push(issue("QUESTION_ORIGIN_INVALID", `${path}.origin`, "Unknown question origin."));
  if (!Array.isArray(value.allowedModes) || value.allowedModes.length === 0) {
    issues.push(issue("QUESTION_MODES_REQUIRED", `${path}.allowedModes`, "At least one assessment mode is required."));
  } else {
    value.allowedModes.forEach((mode, index) => {
      if (!isPaper2AssessmentMode(mode)) issues.push(issue("QUESTION_MODE_INVALID", `${path}.allowedModes[${index}]`, "Unknown assessment mode."));
    });
    if (new Set(value.allowedModes).size !== value.allowedModes.length) issues.push(issue("QUESTION_MODES_DUPLICATE", `${path}.allowedModes`, "Allowed modes must be unique."));
  }
  validateLocaleContract(value.localeContract, `${path}.localeContract`, issues);
  requireHash(value.publicHash, `${path}.publicHash`, issues);
  scanPublicQuestionForPrivateFields(value, path, issues);
  return issues.length === 0 ? validationSuccess(value as unknown as Paper2PublicQuestion) : validationFailure(issues);
}

export function validatePrivateSolution(value: unknown, path = "solution"): Paper2ValidationResult<Paper2PrivateSolution> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) return validationFailure([{ code: "SOLUTION_NOT_OBJECT", path, message: "Private solution must be an object." }]);
  requireId(value.rubricId, `${path}.rubricId`, issues);
  requireVersion(value.rubricVersion, `${path}.rubricVersion`, issues);
  requireId(value.questionId, `${path}.questionId`, issues);
  requireVersion(value.questionVersion, `${path}.questionVersion`, issues);
  requireLocalized(value.modelAnswer, `${path}.modelAnswer`, issues);
  if (!Array.isArray(value.markPoints)) {
    issues.push(issue("SOLUTION_MARK_POINTS_INVALID", `${path}.markPoints`, "Mark points must be an array."));
  } else {
    value.markPoints.forEach((point, index) => validateMarkPoint(point, `${path}.markPoints[${index}]`, issues));
    const ids = value.markPoints.filter(isRecord).map((point) => point.markPointId);
    if (new Set(ids).size !== ids.length) issues.push(issue("SOLUTION_MARK_POINT_DUPLICATE", `${path}.markPoints`, "Mark-point IDs must be unique."));
  }
  validateLocalizedArray(value.acceptedAlternatives, `${path}.acceptedAlternatives`, issues);
  requireLocalized(value.dependencyCredit, `${path}.dependencyCredit`, issues);
  validateLocalizedArray(value.commonErrors, `${path}.commonErrors`, issues);
  validateIdArray(value.misconceptionIds, `${path}.misconceptionIds`, issues, false);
  if (!PAPER2_MARK_STATUSES.includes(value.authority as Paper2MarkStatus)) issues.push(issue("SOLUTION_AUTHORITY_INVALID", `${path}.authority`, "Unknown rubric authority."));
  requireHash(value.privateHash, `${path}.privateHash`, issues);
  return issues.length === 0 ? validationSuccess(value as unknown as Paper2PrivateSolution) : validationFailure(issues);
}

export function validateQuestionSolutionPair(
  question: Paper2PublicQuestion,
  solution: Paper2PrivateSolution,
  context?: Paper2QuestionAuthorityContext,
): Paper2ValidationResult<{ readonly question: Paper2PublicQuestion; readonly solution: Paper2PrivateSolution }> {
  const issues: Paper2ContractIssue[] = [];
  const questionValidation = validatePublicQuestion(question);
  const solutionValidation = validatePrivateSolution(solution);
  if (!questionValidation.ok) issues.push(...questionValidation.issues);
  if (!solutionValidation.ok) issues.push(...solutionValidation.issues);
  if (question.questionId !== solution.questionId || question.questionVersion !== solution.questionVersion) issues.push(issue("QUESTION_SOLUTION_IDENTITY_MISMATCH", "solution", "Solution must pin the exact question ID and version."));
  if (question.markStatus !== solution.authority) issues.push(issue("QUESTION_SOLUTION_AUTHORITY_MISMATCH", "solution.authority", "Question and rubric authorities must match."));
  const markSum = solution.markPoints.reduce((sum, point) => sum + point.marks, 0);
  if (question.markStatus === "unscored") {
    if (solution.markPoints.length !== 0) issues.push(issue("UNSCORED_SOLUTION_HAS_MARK_POINTS", "solution.markPoints", "Unscored questions cannot have scored mark points."));
  } else if (markSum !== question.marks) {
    issues.push(issue("QUESTION_MARK_SUM_MISMATCH", "solution.markPoints", `Mark points total ${markSum}, expected ${question.marks}.`));
  }
  if (context) validateQuestionAuthority(question, solution, context, issues);
  else if (question.markStatus === "official") issues.push(issue("OFFICIAL_AUTHORITY_CONTEXT_REQUIRED", "question.markStatus", "Official status fails closed without verified source and rights context."));
  return issues.length === 0 ? validationSuccess({ question, solution }) : validationFailure(issues);
}

export function validatePracticeSet(value: unknown, path = "practiceSet"): Paper2ValidationResult<Paper2PracticeSet> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) return validationFailure([{ code: "SET_NOT_OBJECT", path, message: "Practice set must be an object." }]);
  requireId(value.setId, `${path}.setId`, issues);
  requireVersion(value.setVersion, `${path}.setVersion`, issues);
  if (!["section_mixed", "cumulative", "diagnostic", "guided_drill"].includes(String(value.kind))) issues.push(issue("SET_KIND_INVALID", `${path}.kind`, "Unknown practice-set kind."));
  requireLocalized(value.title, `${path}.title`, issues);
  requireLocalized(value.instructions, `${path}.instructions`, issues);
  if (!["set_guided", "diagnostic_closed", "set_closed"].includes(String(value.mode))) issues.push(issue("SET_MODE_INVALID", `${path}.mode`, "Unknown practice-set mode."));
  validateQuestionRefs(value.questionRefs, `${path}.questionRefs`, issues);
  validateIdArray(value.prerequisiteTopicIds, `${path}.prerequisiteTopicIds`, issues, false);
  if (!["immediate", "after_explicit_submit"].includes(String(value.solutionDisclosure))) issues.push(issue("SET_DISCLOSURE_INVALID", `${path}.solutionDisclosure`, "Unknown solution disclosure policy."));
  if (value.mode === "set_guided" && value.solutionDisclosure !== "immediate") issues.push(issue("SET_GUIDED_DISCLOSURE_NOT_IMMEDIATE", `${path}.solutionDisclosure`, "Guided sets must expose solutions immediately."));
  if ((value.mode === "diagnostic_closed" || value.mode === "set_closed") && value.solutionDisclosure !== "after_explicit_submit") issues.push(issue("SET_CLOSED_DISCLOSURE_INVALID", `${path}.solutionDisclosure`, "Closed sets reveal solutions only after explicit submit."));
  if (!Number.isInteger(value.computedMarks) || (value.computedMarks as number) < 0) issues.push(issue("SET_MARKS_INVALID", `${path}.computedMarks`, "Computed marks must be a non-negative integer."));
  if (typeof value.computedMinutes !== "number" || !Number.isFinite(value.computedMinutes) || value.computedMinutes <= 0) issues.push(issue("SET_MINUTES_INVALID", `${path}.computedMinutes`, "Computed minutes must be positive."));
  validateIdArray(value.coverageSummary, `${path}.coverageSummary`, issues, true);
  if (!["approved", "blocked"].includes(String(value.rightsStatus))) issues.push(issue("SET_RIGHTS_STATUS_INVALID", `${path}.rightsStatus`, "Unknown set rights status."));
  validateReview(value.review, `${path}.review`, issues);
  return issues.length === 0 ? validationSuccess(value as unknown as Paper2PracticeSet) : validationFailure(issues);
}

export function validatePracticeSetComposition(
  set: Paper2PracticeSet,
  context: Paper2CompositionContext,
): Paper2ValidationResult<Paper2PracticeSet> {
  const issues: Paper2ContractIssue[] = [];
  const shape = validatePracticeSet(set);
  if (!shape.ok) issues.push(...shape.issues);
  const totals = recomputeQuestionTotals(set.questionRefs, context.questionsByIdentity);
  if (totals.missing.length > 0) issues.push(issue("SET_QUESTION_UNRESOLVED", "practiceSet.questionRefs", `Unresolved questions: ${totals.missing.join(", ")}.`));
  if (totals.marks !== set.computedMarks) issues.push(issue("SET_MARK_TOTAL_MISMATCH", "practiceSet.computedMarks", `Computed ${totals.marks}, declared ${set.computedMarks}.`));
  if (totals.minutes !== set.computedMinutes) issues.push(issue("SET_MINUTE_TOTAL_MISMATCH", "practiceSet.computedMinutes", `Computed ${totals.minutes}, declared ${set.computedMinutes}.`));
  for (const ref of set.questionRefs) {
    const question = context.questionsByIdentity.get(`${ref.questionId}@${ref.questionVersion}`);
    if (question && !question.allowedModes.includes(set.mode)) issues.push(issue("SET_QUESTION_MODE_NOT_ALLOWED", `practiceSet.questionRefs.${ref.questionId}`, `Question is not approved for ${set.mode}.`));
  }
  return issues.length === 0 ? validationSuccess(set) : validationFailure(issues);
}

export function validateMock(value: unknown, path = "mock"): Paper2ValidationResult<Paper2Mock> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) return validationFailure([{ code: "MOCK_NOT_OBJECT", path, message: "Mock must be an object." }]);
  requireId(value.paperId, `${path}.paperId`, issues);
  requireVersion(value.paperVersion, `${path}.paperVersion`, issues);
  if (value.mode !== "mock_timed") issues.push(issue("MOCK_MODE_INVALID", `${path}.mode`, "Full mocks use mock_timed mode."));
  if (value.durationMinutes !== 120) issues.push(issue("MOCK_DURATION_INVALID", `${path}.durationMinutes`, "Paper 2 full mocks are exactly 120 minutes."));
  if (value.totalMarks !== 75) issues.push(issue("MOCK_MARKS_INVALID", `${path}.totalMarks`, "Paper 2 full mocks are exactly 75 marks."));
  validateQuestionRefs(value.questionRefs, `${path}.questionRefs`, issues);
  if (!Array.isArray(value.blueprint) || value.blueprint.length !== (Array.isArray(value.questionRefs) ? value.questionRefs.length : -1)) {
    issues.push(issue("MOCK_BLUEPRINT_INVALID", `${path}.blueprint`, "Blueprint must contain one entry per question."));
  } else {
    value.blueprint.forEach((entry, index) => validateBlueprintEntry(entry, `${path}.blueprint[${index}]`, issues));
  }
  requireText(value.sourceSummary, `${path}.sourceSummary`, "MOCK_SOURCE_SUMMARY_REQUIRED", issues);
  requireText(value.rightsSummary, `${path}.rightsSummary`, "MOCK_RIGHTS_SUMMARY_REQUIRED", issues);
  validateLocaleContract(value.localeContract, `${path}.localeContract`, issues);
  requireId(value.solutionPackId, `${path}.solutionPackId`, issues);
  requireHash(value.publicHash, `${path}.publicHash`, issues);
  requireHash(value.privateHash, `${path}.privateHash`, issues);
  if (!["approved", "changes_required", "blocked"].includes(String(value.independentReviewStatus))) issues.push(issue("MOCK_REVIEW_STATUS_INVALID", `${path}.independentReviewStatus`, "Unknown independent review status."));
  return issues.length === 0 ? validationSuccess(value as unknown as Paper2Mock) : validationFailure(issues);
}

export function validateMockComposition(
  mock: Paper2Mock,
  context: Paper2CompositionContext,
): Paper2ValidationResult<Paper2Mock> {
  const issues: Paper2ContractIssue[] = [];
  const shape = validateMock(mock);
  if (!shape.ok) issues.push(...shape.issues);
  const totals = recomputeQuestionTotals(mock.questionRefs, context.questionsByIdentity);
  if (totals.missing.length > 0) issues.push(issue("MOCK_QUESTION_UNRESOLVED", "mock.questionRefs", `Unresolved questions: ${totals.missing.join(", ")}.`));
  if (totals.marks !== mock.totalMarks) issues.push(issue("MOCK_MARK_TOTAL_MISMATCH", "mock.totalMarks", `Computed ${totals.marks}, declared ${mock.totalMarks}.`));
  for (const ref of mock.questionRefs) {
    const question = context.questionsByIdentity.get(`${ref.questionId}@${ref.questionVersion}`);
    if (question && !question.allowedModes.includes("mock_timed")) issues.push(issue("MOCK_QUESTION_MODE_NOT_ALLOWED", `mock.questionRefs.${ref.questionId}`, "Question is not approved for mock_timed mode."));
  }
  const blueprintIds = new Set(mock.blueprint.map((entry) => entry.questionId));
  for (const ref of mock.questionRefs) {
    if (!blueprintIds.has(ref.questionId)) issues.push(issue("MOCK_BLUEPRINT_QUESTION_MISSING", "mock.blueprint", `No blueprint entry for ${ref.questionId}.`));
  }
  return issues.length === 0 ? validationSuccess(mock) : validationFailure(issues);
}

export function validateMockIndependence(mocks: readonly Paper2Mock[]): Paper2ValidationResult<readonly Paper2Mock[]> {
  const issues: Paper2ContractIssue[] = [];
  const seen = new Map<string, string>();
  for (const mock of mocks) {
    for (const ref of mock.questionRefs) {
      const identity = `${ref.questionId}@${ref.questionVersion}`;
      const previous = seen.get(identity);
      if (previous && previous !== mock.paperId) issues.push(issue("MOCK_QUESTION_OVERLAP", "mocks", `${identity} appears in ${previous} and ${mock.paperId}.`));
      seen.set(identity, mock.paperId);
    }
  }
  return issues.length === 0 ? validationSuccess(mocks) : validationFailure(issues);
}

export function recomputeQuestionTotals(refs: readonly Paper2QuestionReference[], questions: ReadonlyMap<string, Paper2PublicQuestion>) {
  let marks = 0;
  let minutes = 0;
  const missing: string[] = [];
  for (const ref of refs) {
    const key = `${ref.questionId}@${ref.questionVersion}`;
    const question = questions.get(key);
    if (!question) {
      missing.push(key);
      continue;
    }
    if (question.marks !== null) marks += question.marks;
    minutes += question.recommendedMinutes;
  }
  return { marks, minutes, missing } as const;
}

function validateQuestionAuthority(question: Paper2PublicQuestion, solution: Paper2PrivateSolution, context: Paper2QuestionAuthorityContext, issues: Paper2ContractIssue[]) {
  const rights = context.rightsById.get(question.rightsId);
  const eligibility = evaluateLearnerEligibility(rights, {
    requestedUse: context.requestedUse ?? (question.origin === "adapted-from-source" ? "learner-adaptation" : "learner-display"),
    embedsSourceContent: question.origin !== "teacher-created",
  });
  if (!eligibility.eligible) issues.push(issue(eligibility.code, "question.rightsId", eligibility.reason));
  if (question.sourceIds.some((id) => !context.sourcesById.has(id))) issues.push(issue("QUESTION_SOURCE_UNRESOLVED", "question.sourceIds", "All question sources must resolve."));
  if (question.markStatus !== "official") return;
  if (question.origin !== "official-question") issues.push(issue("OFFICIAL_ORIGIN_REQUIRED", "question.origin", "Official marks require an official-question origin."));
  if (context.officialTaskIdentityVerified !== true) issues.push(issue("OFFICIAL_IDENTITY_UNVERIFIED", "question", "Official task identity must be independently verified."));
  const sources = question.sourceIds.map((id) => context.sourcesById.get(id)).filter((item): item is Paper2SourceRecord => Boolean(item));
  if (!sources.some((source) => source.kind === "question_paper")) issues.push(issue("OFFICIAL_QP_SOURCE_REQUIRED", "question.sourceIds", "Official marks require a verified question paper source."));
  if (!sources.some((source) => source.kind === "mark_scheme")) issues.push(issue("OFFICIAL_MS_SOURCE_REQUIRED", "question.sourceIds", "Official marks require a verified mark scheme source."));
  for (const point of solution.markPoints) {
    const pointSources = point.sourceIds.map((id) => context.sourcesById.get(id));
    if (!pointSources.some((source) => source?.kind === "mark_scheme")) issues.push(issue("OFFICIAL_MARK_POINT_MS_REQUIRED", `solution.markPoints.${point.markPointId}`, "Each official mark point requires a mark scheme source."));
  }
}

function validateMarkPoint(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("MARK_POINT_NOT_OBJECT", path, "Mark point must be an object."));
    return;
  }
  requireId(value.markPointId, `${path}.markPointId`, issues);
  requireLocalized(value.description, `${path}.description`, issues);
  if (!Number.isInteger(value.marks) || (value.marks as number) <= 0) issues.push(issue("MARK_POINT_VALUE_INVALID", `${path}.marks`, "Mark-point value must be a positive integer."));
  validateIdArray(value.sourceIds, `${path}.sourceIds`, issues, false);
  if (!["official", "teacher-calibrated", "teacher-created"].includes(String(value.authority))) issues.push(issue("MARK_POINT_AUTHORITY_INVALID", `${path}.authority`, "Unknown mark-point authority."));
}

function validateQuestionRefs(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(issue("QUESTION_REFS_INVALID", path, "At least one pinned question reference is required."));
    return;
  }
  const keys: string[] = [];
  value.forEach((ref, index) => {
    if (!isRecord(ref)) {
      issues.push(issue("QUESTION_REF_NOT_OBJECT", `${path}[${index}]`, "Question reference must be an object."));
      return;
    }
    requireId(ref.questionId, `${path}[${index}].questionId`, issues);
    requireVersion(ref.questionVersion, `${path}[${index}].questionVersion`, issues);
    keys.push(`${String(ref.questionId)}@${String(ref.questionVersion)}`);
  });
  if (new Set(keys).size !== keys.length) issues.push(issue("QUESTION_REF_DUPLICATE", path, "Duplicate question versions require an explicit alternate blueprint and are blocked by the base contract."));
}

function validateBlueprintEntry(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("MOCK_BLUEPRINT_ENTRY_INVALID", path, "Blueprint entry must be an object."));
    return;
  }
  requireId(value.questionId, `${path}.questionId`, issues);
  for (const key of ["sectionIds", "topicIds", "familyIds"] as const) validateIdArray(value[key], `${path}.${key}`, issues, true);
  for (const key of ["commandWord", "answerProduct", "markBand", "difficultyRationale"] as const) requireText(value[key], `${path}.${key}`, "MOCK_BLUEPRINT_FIELD_REQUIRED", issues);
  if (value.year !== null && (!Number.isInteger(value.year) || (value.year as number) < 2000 || (value.year as number) > 2100)) issues.push(issue("MOCK_BLUEPRINT_YEAR_INVALID", `${path}.year`, "Blueprint year must be null or a valid year."));
  if (value.session !== null && (typeof value.session !== "string" || value.session.trim().length === 0)) issues.push(issue("MOCK_BLUEPRINT_SESSION_INVALID", `${path}.session`, "Blueprint session must be null or non-empty."));
  if (value.variant !== null && (typeof value.variant !== "string" || value.variant.trim().length === 0)) issues.push(issue("MOCK_BLUEPRINT_VARIANT_INVALID", `${path}.variant`, "Blueprint variant must be null or non-empty."));
}

function validateReview(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("REVIEW_NOT_OBJECT", path, "Review metadata must be an object."));
    return;
  }
  for (const key of ["author", "independentReviewer", "reviewedRevision"] as const) requireText(value[key], `${path}.${key}`, "REVIEW_FIELD_REQUIRED", issues);
  if (!["approved", "changes_required", "blocked"].includes(String(value.decision))) issues.push(issue("REVIEW_DECISION_INVALID", `${path}.decision`, "Unknown review decision."));
  if (typeof value.reviewedAt !== "string" || !Number.isFinite(Date.parse(value.reviewedAt))) issues.push(issue("REVIEW_DATE_INVALID", `${path}.reviewedAt`, "Review date must be an ISO-compatible timestamp."));
}

function validateLocaleContract(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value) || value.englishCanonical !== true || value.vietnameseSemanticParity !== true || typeof value.reviewedRevision !== "string" || value.reviewedRevision.trim().length === 0) {
    issues.push(issue("LOCALE_CONTRACT_INVALID", path, "English-canonical and Vietnamese semantic-parity review is required."));
  }
}

function scanPublicQuestionForPrivateFields(value: Record<string, unknown>, path: string, issues: Paper2ContractIssue[]) {
  const forbidden = new Set(["modelAnswer", "markPoints", "acceptedAlternatives", "privateHash", "privateSourcePath"]);
  for (const [key, entry] of Object.entries(value)) {
    if (forbidden.has(key)) issues.push(issue("QUESTION_PRIVATE_FIELD_FORBIDDEN", `${path}.${key}`, "Private solution data cannot appear in a public question."));
    if (isRecord(entry)) scanPublicQuestionForPrivateFields(entry, `${path}.${key}`, issues);
    if (Array.isArray(entry)) entry.forEach((child, index) => { if (isRecord(child)) scanPublicQuestionForPrivateFields(child, `${path}.${key}[${index}]`, issues); });
  }
}

function validateLocalizedArray(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("LOCALIZED_ARRAY_INVALID", path, "Expected an array of bilingual values."));
    return;
  }
  value.forEach((entry, index) => requireLocalized(entry, `${path}[${index}]`, issues));
}

function validateIdArray(value: unknown, path: string, issues: Paper2ContractIssue[], required: boolean) {
  if (!Array.isArray(value) || (required && value.length === 0)) {
    issues.push(issue("ID_ARRAY_INVALID", path, "Expected an array of stable IDs."));
    return;
  }
  value.forEach((entry, index) => requireId(entry, `${path}[${index}]`, issues));
  if (new Set(value).size !== value.length) issues.push(issue("ID_ARRAY_DUPLICATE", path, "IDs must be unique."));
}

function requireId(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isPaper2StableId(value)) issues.push(issue("ID_INVALID", path, "Invalid stable ID."));
}

function requireVersion(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (typeof value !== "string" || !/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(value)) issues.push(issue("VERSION_INVALID", path, "A semantic version is required."));
}

function requireHash(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/i.test(value)) issues.push(issue("HASH_INVALID", path, "A SHA-256 hex hash is required."));
}

function requireText(value: unknown, path: string, code: string, issues: Paper2ContractIssue[]) {
  if (typeof value !== "string" || value.trim().length === 0) issues.push(issue(code, path, "A non-empty string is required."));
}

function requireLocalized(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isPaper2Localized(value)) issues.push(issue("LOCALIZED_VALUE_INVALID", path, "English and Vietnamese values are required."));
}

function issue(code: string, path: string, message: string): Paper2ContractIssue {
  return { code, path, message };
}
