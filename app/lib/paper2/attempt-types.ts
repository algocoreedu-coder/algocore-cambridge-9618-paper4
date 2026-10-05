import type { Locale } from "./types";
import {
  isIsoDateTime,
  isPaper2StableId,
  isRecord,
  type Paper2ContractIssue,
  type Paper2ValidationResult,
  validationFailure,
  validationSuccess,
} from "./coverage-types";
import { isPaper2AssessmentMode, type Paper2AssessmentMode } from "./question-types";

export const PAPER2_ATTEMPT_SCHEMA_VERSION = 2 as const;
export const PAPER2_ATTEMPT_STATUSES = [
  "not_started",
  "active",
  "expired",
  "submitted",
  "self_marking",
  "self_marked",
  "reviewed_attempt",
  "abandoned",
  "recovery_required",
] as const;

export const PAPER2_ATTEMPT_EVENTS = [
  "confirmed_start",
  "confirmed_submit",
  "deadline_reached",
  "confirmed_reset_or_discard",
  "submit_expired_attempt",
  "rubric_loaded_and_marking_started",
  "all_scorable_mark_points_decided",
  "reflection_and_summary_confirmed",
  "validation_migration_hash_or_writer_failure",
  "deterministic_recovery_or_tested_migration",
  "confirmed_discard",
] as const;

export type Paper2AttemptStatus = (typeof PAPER2_ATTEMPT_STATUSES)[number];
export type Paper2AttemptEventType = (typeof PAPER2_ATTEMPT_EVENTS)[number];
export type Paper2AttemptContentKind = "practice_set" | "diagnostic" | "mock";
export type Paper2StorageHealth = "healthy" | "memory_only" | "save_failed" | "quota_exceeded" | "corrupt" | "conflict";
export type Paper2MarkDecision = "awarded" | "not_awarded" | "not_applicable";

export interface Paper2AttemptResponse {
  readonly questionId: string;
  readonly questionVersion: string;
  readonly answer: string;
  readonly updatedAt: string;
  readonly lockedAt?: string;
}

export interface Paper2TimerSnapshot {
  readonly startedAtEpochMs: number;
  readonly deadlineEpochMs: number;
  readonly lastObservedWallMs: number;
  readonly lastObservedMonotonicMs: number;
  readonly lastSavedAt: string;
  readonly policyVersion: string;
}

export interface Paper2SelfMarkDecision {
  readonly markPointId: string;
  readonly decision: Paper2MarkDecision;
  readonly marksAvailable: number;
  readonly marksAwarded: number;
  readonly decidedAt: string;
}

export interface Paper2AttemptRubricBinding {
  readonly rubricVersion: string;
  readonly rubricHash: string;
  readonly terminalReceiptId: string;
}

export interface Paper2AttemptFinalChecklist {
  readonly submitted: boolean;
  readonly scorableMarkPointsComplete: boolean;
  readonly reflectionComplete: boolean;
  readonly summaryConfirmed: boolean;
}

/**
 * Local navigation state belongs to the attempt because it must survive a
 * reload with the learner's answers. It remains optional so every existing
 * schema-v2 attempt is valid without a destructive migration.
 */
export interface Paper2AttemptNavigation {
  readonly currentQuestionIdentity?: string;
  readonly flaggedQuestionIdentities: readonly string[];
  readonly activeSectionId?: string;
  readonly updatedAt: string;
}

export interface Paper2AttemptRecord {
  readonly schemaVersion: 2;
  readonly attemptId: string;
  readonly learnerScopeId: string;
  readonly contentKind: Paper2AttemptContentKind;
  readonly contentId: string;
  readonly contentVersion: string;
  readonly contentHash: string;
  readonly mode: Paper2AssessmentMode;
  readonly status: Paper2AttemptStatus;
  readonly revision: number;
  readonly locale: Locale;
  readonly startedAt: string | null;
  readonly updatedAt: string;
  readonly submittedAt?: string;
  readonly durationMinutes?: number;
  readonly timer?: Paper2TimerSnapshot;
  readonly responses: Readonly<Record<string, Paper2AttemptResponse>>;
  readonly navigation?: Paper2AttemptNavigation;
  readonly finalChecklist: Paper2AttemptFinalChecklist;
  readonly rubricBinding?: Paper2AttemptRubricBinding;
  readonly selfMarks?: Readonly<Record<string, Paper2SelfMarkDecision>>;
  readonly reflection?: string;
  readonly storageHealth: Paper2StorageHealth;
  readonly lastMigrationVersion: number;
  readonly recovery?: {
    readonly priorStatus: Exclude<Paper2AttemptStatus, "recovery_required">;
    readonly reasonCode: string;
    readonly enteredAt: string;
  };
}

export type Paper2AttemptEvent =
  | { readonly type: "confirmed_start"; readonly at: string }
  | { readonly type: "confirmed_submit"; readonly at: string; readonly rubricBinding?: Paper2AttemptRubricBinding }
  | { readonly type: "deadline_reached"; readonly at: string }
  | { readonly type: "confirmed_reset_or_discard"; readonly at: string }
  | { readonly type: "submit_expired_attempt"; readonly at: string; readonly rubricBinding?: Paper2AttemptRubricBinding }
  | { readonly type: "rubric_loaded_and_marking_started"; readonly at: string; readonly rubricBinding: Paper2AttemptRubricBinding }
  | { readonly type: "all_scorable_mark_points_decided"; readonly at: string }
  | { readonly type: "reflection_and_summary_confirmed"; readonly at: string }
  | { readonly type: "validation_migration_hash_or_writer_failure"; readonly at: string; readonly reasonCode: string }
  | { readonly type: "deterministic_recovery_or_tested_migration"; readonly at: string; readonly recoveredStatus: Exclude<Paper2AttemptStatus, "not_started" | "abandoned" | "recovery_required"> }
  | { readonly type: "confirmed_discard"; readonly at: string };

export const PAPER2_ATTEMPT_TRANSITIONS = {
  not_started: { confirmed_start: "active" },
  active: {
    confirmed_submit: "submitted",
    deadline_reached: "expired",
    confirmed_reset_or_discard: "abandoned",
  },
  expired: {
    submit_expired_attempt: "submitted",
    confirmed_reset_or_discard: "abandoned",
  },
  submitted: { rubric_loaded_and_marking_started: "self_marking" },
  self_marking: { all_scorable_mark_points_decided: "self_marked" },
  self_marked: { reflection_and_summary_confirmed: "reviewed_attempt" },
  reviewed_attempt: {},
  abandoned: {},
  recovery_required: {
    deterministic_recovery_or_tested_migration: "__event_target__",
    confirmed_discard: "abandoned",
  },
} as const;

export type Paper2AttemptTransitionResult =
  | { readonly ok: true; readonly code: "ATTEMPT_TRANSITION_APPLIED"; readonly attempt: Paper2AttemptRecord }
  | { readonly ok: false; readonly code: string; readonly attempt: Paper2AttemptRecord; readonly message: string };

export interface Paper2SelfMarkedScore {
  readonly awarded: number;
  readonly available: number;
  readonly decidedPoints: number;
  readonly notApplicablePoints: number;
}

export function transitionPaper2Attempt(attempt: Paper2AttemptRecord, event: Paper2AttemptEvent): Paper2AttemptTransitionResult {
  if (!isIsoDateTime(event.at)) return transitionRejected(attempt, "ATTEMPT_EVENT_TIME_INVALID", "Transition time is invalid.");
  if (event.type === "validation_migration_hash_or_writer_failure") {
    if (attempt.status === "recovery_required") return transitionRejected(attempt, "ATTEMPT_ALREADY_IN_RECOVERY", "Attempt is already in recovery.");
    return applied(attempt, {
      status: "recovery_required",
      storageHealth: recoveryStorageHealth(event.reasonCode),
      recovery: { priorStatus: attempt.status, reasonCode: event.reasonCode, enteredAt: event.at },
    }, event.at);
  }

  const transitions = PAPER2_ATTEMPT_TRANSITIONS[attempt.status] as Partial<Record<Paper2AttemptEventType, Paper2AttemptStatus | "__event_target__">>;
  const declaredTarget = transitions[event.type];
  if (!declaredTarget) return transitionRejected(attempt, "ATTEMPT_TRANSITION_INVALID", `${attempt.status} cannot handle ${event.type}.`);

  let nextStatus: Paper2AttemptStatus;
  if (declaredTarget === "__event_target__") {
    if (event.type !== "deterministic_recovery_or_tested_migration" || !attempt.recovery) return transitionRejected(attempt, "ATTEMPT_RECOVERY_EVIDENCE_REQUIRED", "Recovery requires a prior state and deterministic evidence.");
    if (event.recoveredStatus !== attempt.recovery.priorStatus) return transitionRejected(attempt, "ATTEMPT_RECOVERY_STATE_MISMATCH", "Recovered state must equal the recorded prior state.");
    nextStatus = event.recoveredStatus;
  } else {
    nextStatus = declaredTarget;
  }

  if (event.type === "all_scorable_mark_points_decided" && !attempt.finalChecklist.scorableMarkPointsComplete) return transitionRejected(attempt, "ATTEMPT_SELF_MARK_INCOMPLETE", "All scorable mark points must be decided.");
  if (event.type === "reflection_and_summary_confirmed" && (!attempt.finalChecklist.reflectionComplete || !attempt.finalChecklist.summaryConfirmed)) return transitionRejected(attempt, "ATTEMPT_REVIEW_INCOMPLETE", "Reflection and summary confirmation are required.");
  if (event.type === "rubric_loaded_and_marking_started" && !validRubricBinding(event.rubricBinding)) return transitionRejected(attempt, "ATTEMPT_RUBRIC_BINDING_INVALID", "A valid terminal rubric binding is required.");

  const changes: { -readonly [Key in keyof Paper2AttemptRecord]?: Paper2AttemptRecord[Key] } = { status: nextStatus };
  if (event.type === "confirmed_start") changes.startedAt = event.at;
  if (nextStatus === "submitted") {
    changes.submittedAt = event.at;
    changes.finalChecklist = { ...attempt.finalChecklist, submitted: true };
    if ("rubricBinding" in event && event.rubricBinding) changes.rubricBinding = event.rubricBinding;
  }
  if (event.type === "rubric_loaded_and_marking_started") changes.rubricBinding = event.rubricBinding;
  if (nextStatus === "expired" || nextStatus === "submitted" || nextStatus === "abandoned") changes.responses = lockResponses(attempt.responses, event.at);
  if (event.type === "deterministic_recovery_or_tested_migration") {
    changes.recovery = undefined;
    changes.storageHealth = "healthy";
  }
  return applied(attempt, changes, event.at);
}

export function updatePaper2AttemptResponse(
  attempt: Paper2AttemptRecord,
  questionIdentity: string,
  response: Paper2AttemptResponse,
  expectedRevision: number,
): Paper2AttemptTransitionResult {
  if (attempt.status !== "active") return transitionRejected(attempt, "ATTEMPT_RESPONSE_LOCKED", "Responses are editable only while active.");
  if (attempt.revision !== expectedRevision) return transitionRejected(attempt, "ATTEMPT_REVISION_CONFLICT", "Revision conflict; do not overwrite another writer.");
  if (`${response.questionId}@${response.questionVersion}` !== questionIdentity) return transitionRejected(attempt, "ATTEMPT_RESPONSE_IDENTITY_MISMATCH", "Response identity does not match its key.");
  if (!isIsoDateTime(response.updatedAt)) return transitionRejected(attempt, "ATTEMPT_RESPONSE_TIME_INVALID", "Response timestamp is invalid.");
  return {
    ok: true,
    code: "ATTEMPT_TRANSITION_APPLIED",
    attempt: {
      ...attempt,
      responses: { ...attempt.responses, [questionIdentity]: { ...response } },
      revision: attempt.revision + 1,
      updatedAt: response.updatedAt,
    },
  };
}

export function updatePaper2AttemptNavigation(
  attempt: Paper2AttemptRecord,
  navigation: Paper2AttemptNavigation,
  expectedRevision: number,
): Paper2AttemptTransitionResult {
  if (attempt.status !== "active") return transitionRejected(attempt, "ATTEMPT_NAVIGATION_LOCKED", "Navigation state is editable only while active.");
  if (attempt.revision !== expectedRevision) return transitionRejected(attempt, "ATTEMPT_REVISION_CONFLICT", "Revision conflict; do not overwrite another writer.");
  const issues: Paper2ContractIssue[] = [];
  validateNavigation(navigation, "attempt.navigation", issues);
  if (issues.length) return transitionRejected(attempt, issues[0].code, issues[0].message);
  const normalized: Paper2AttemptNavigation = {
    ...(navigation.currentQuestionIdentity ? { currentQuestionIdentity: navigation.currentQuestionIdentity } : {}),
    flaggedQuestionIdentities: [...new Set(navigation.flaggedQuestionIdentities)],
    ...(navigation.activeSectionId ? { activeSectionId: navigation.activeSectionId } : {}),
    updatedAt: navigation.updatedAt,
  };
  return {
    ok: true,
    code: "ATTEMPT_TRANSITION_APPLIED",
    attempt: {
      ...attempt,
      navigation: normalized,
      revision: attempt.revision + 1,
      updatedAt: navigation.updatedAt,
    },
  };
}

export function validatePaper2Attempt(value: unknown, path = "attempt"): Paper2ValidationResult<Paper2AttemptRecord> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) return validationFailure([{ code: "ATTEMPT_NOT_OBJECT", path, message: "Attempt must be an object." }]);
  if (value.schemaVersion !== PAPER2_ATTEMPT_SCHEMA_VERSION) issues.push(issue("ATTEMPT_SCHEMA_UNSUPPORTED", `${path}.schemaVersion`, "Attempt schema must be v2."));
  for (const key of ["attemptId", "learnerScopeId", "contentId"] as const) requireId(value[key], `${path}.${key}`, issues);
  if (!["practice_set", "diagnostic", "mock"].includes(String(value.contentKind))) issues.push(issue("ATTEMPT_CONTENT_KIND_INVALID", `${path}.contentKind`, "Unknown attempt content kind."));
  requireVersion(value.contentVersion, `${path}.contentVersion`, issues);
  requireHash(value.contentHash, `${path}.contentHash`, issues);
  if (!isPaper2AssessmentMode(value.mode)) issues.push(issue("ATTEMPT_MODE_INVALID", `${path}.mode`, "Unknown attempt mode."));
  if (!PAPER2_ATTEMPT_STATUSES.includes(value.status as Paper2AttemptStatus)) issues.push(issue("ATTEMPT_STATUS_INVALID", `${path}.status`, "Unknown attempt status."));
  if (!Number.isInteger(value.revision) || (value.revision as number) < 0) issues.push(issue("ATTEMPT_REVISION_INVALID", `${path}.revision`, "Revision must be a non-negative integer."));
  if (value.locale !== "en" && value.locale !== "vi") issues.push(issue("ATTEMPT_LOCALE_INVALID", `${path}.locale`, "Locale must be en or vi."));
  if (value.startedAt !== null && !isIsoDateTime(value.startedAt)) issues.push(issue("ATTEMPT_STARTED_AT_INVALID", `${path}.startedAt`, "Start time must be null or a valid timestamp."));
  if (value.status !== "not_started" && value.startedAt === null) issues.push(issue("ATTEMPT_STARTED_AT_REQUIRED", `${path}.startedAt`, "Persisted attempts require a start time."));
  if (!isIsoDateTime(value.updatedAt)) issues.push(issue("ATTEMPT_UPDATED_AT_INVALID", `${path}.updatedAt`, "Updated time is invalid."));
  if (value.submittedAt !== undefined && !isIsoDateTime(value.submittedAt)) issues.push(issue("ATTEMPT_SUBMITTED_AT_INVALID", `${path}.submittedAt`, "Submitted time is invalid."));
  if (value.mode === "mock_timed") {
    if (!Number.isFinite(value.durationMinutes) || (value.durationMinutes as number) <= 0) issues.push(issue("ATTEMPT_DURATION_REQUIRED", `${path}.durationMinutes`, "Timed attempts require a bound duration."));
    validateTimerSnapshot(value.timer, `${path}.timer`, issues);
  }
  validateResponses(value.responses, `${path}.responses`, issues, value.status as Paper2AttemptStatus);
  if (value.navigation !== undefined) validateNavigation(value.navigation, `${path}.navigation`, issues);
  validateFinalChecklist(value.finalChecklist, `${path}.finalChecklist`, issues);
  if (!["healthy", "memory_only", "save_failed", "quota_exceeded", "corrupt", "conflict"].includes(String(value.storageHealth))) issues.push(issue("ATTEMPT_STORAGE_HEALTH_INVALID", `${path}.storageHealth`, "Unknown storage health."));
  if (!Number.isInteger(value.lastMigrationVersion) || (value.lastMigrationVersion as number) < 0) issues.push(issue("ATTEMPT_MIGRATION_VERSION_INVALID", `${path}.lastMigrationVersion`, "Migration version must be a non-negative integer."));
  const preTerminal = ["not_started", "active", "expired"].includes(String(value.status));
  if (preTerminal && (value.rubricBinding !== undefined || value.selfMarks !== undefined)) issues.push(issue("ATTEMPT_PRETERMINAL_SOLUTION_DATA", path, "Rubric and self-mark data cannot be persisted before submit."));
  if (value.status === "recovery_required" && !isRecord(value.recovery)) issues.push(issue("ATTEMPT_RECOVERY_METADATA_REQUIRED", `${path}.recovery`, "Recovery state requires recovery metadata."));
  return issues.length === 0 ? validationSuccess(value as unknown as Paper2AttemptRecord) : validationFailure(issues);
}

export function calculatePaper2SelfMarkedScore(decisions: readonly Paper2SelfMarkDecision[]): Paper2SelfMarkedScore {
  return decisions.reduce<Paper2SelfMarkedScore>((score, decision) => {
    if (decision.decision === "not_applicable") return { ...score, decidedPoints: score.decidedPoints + 1, notApplicablePoints: score.notApplicablePoints + 1 };
    return {
      awarded: score.awarded + decision.marksAwarded,
      available: score.available + decision.marksAvailable,
      decidedPoints: score.decidedPoints + 1,
      notApplicablePoints: score.notApplicablePoints,
    };
  }, { awarded: 0, available: 0, decidedPoints: 0, notApplicablePoints: 0 });
}

export function canEditPaper2Responses(status: Paper2AttemptStatus) {
  return status === "active";
}

function applied(attempt: Paper2AttemptRecord, changes: Partial<Paper2AttemptRecord>, at: string): Paper2AttemptTransitionResult {
  return {
    ok: true,
    code: "ATTEMPT_TRANSITION_APPLIED",
    attempt: { ...attempt, ...changes, revision: attempt.revision + 1, updatedAt: at },
  };
}

function transitionRejected(attempt: Paper2AttemptRecord, code: string, message: string): Paper2AttemptTransitionResult {
  return { ok: false, code, attempt, message };
}

function lockResponses(responses: Readonly<Record<string, Paper2AttemptResponse>>, at: string) {
  return Object.fromEntries(Object.entries(responses).map(([key, response]) => [key, { ...response, lockedAt: response.lockedAt ?? at }]));
}

function recoveryStorageHealth(reason: string): Paper2StorageHealth {
  if (/conflict|writer/i.test(reason)) return "conflict";
  if (/quota/i.test(reason)) return "quota_exceeded";
  if (/save/i.test(reason)) return "save_failed";
  return "corrupt";
}

function validateResponses(value: unknown, path: string, issues: Paper2ContractIssue[], status: Paper2AttemptStatus) {
  if (!isRecord(value)) {
    issues.push(issue("ATTEMPT_RESPONSES_INVALID", path, "Responses must be an object keyed by pinned question identity."));
    return;
  }
  for (const [key, response] of Object.entries(value)) {
    if (!isRecord(response)) {
      issues.push(issue("ATTEMPT_RESPONSE_INVALID", `${path}.${key}`, "Response must be an object."));
      continue;
    }
    requireId(response.questionId, `${path}.${key}.questionId`, issues);
    requireVersion(response.questionVersion, `${path}.${key}.questionVersion`, issues);
    if (`${String(response.questionId)}@${String(response.questionVersion)}` !== key) issues.push(issue("ATTEMPT_RESPONSE_KEY_MISMATCH", `${path}.${key}`, "Response key must pin its question ID and version."));
    if (typeof response.answer !== "string") issues.push(issue("ATTEMPT_RESPONSE_ANSWER_INVALID", `${path}.${key}.answer`, "Answer must be a string."));
    if (!isIsoDateTime(response.updatedAt)) issues.push(issue("ATTEMPT_RESPONSE_TIME_INVALID", `${path}.${key}.updatedAt`, "Response timestamp is invalid."));
    if (status !== "active" && status !== "not_started" && !isIsoDateTime(response.lockedAt)) issues.push(issue("ATTEMPT_RESPONSE_NOT_LOCKED", `${path}.${key}.lockedAt`, "Responses must be locked after the active state."));
  }
}

function validateTimerSnapshot(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("ATTEMPT_TIMER_REQUIRED", path, "Timed attempts require a timer snapshot."));
    return;
  }
  for (const key of ["startedAtEpochMs", "deadlineEpochMs", "lastObservedWallMs", "lastObservedMonotonicMs"] as const) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key]) || (value[key] as number) < 0) issues.push(issue("ATTEMPT_TIMER_VALUE_INVALID", `${path}.${key}`, "Timer values must be non-negative finite numbers."));
  }
  if (Number(value.deadlineEpochMs) <= Number(value.startedAtEpochMs)) issues.push(issue("ATTEMPT_TIMER_DEADLINE_INVALID", `${path}.deadlineEpochMs`, "Deadline must follow start time."));
  if (!isIsoDateTime(value.lastSavedAt)) issues.push(issue("ATTEMPT_TIMER_SAVED_AT_INVALID", `${path}.lastSavedAt`, "Timer save timestamp is invalid."));
  if (typeof value.policyVersion !== "string" || value.policyVersion.trim().length === 0) issues.push(issue("ATTEMPT_TIMER_POLICY_INVALID", `${path}.policyVersion`, "Timer policy version is required."));
}

function validateFinalChecklist(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("ATTEMPT_CHECKLIST_INVALID", path, "Final checklist must be an object."));
    return;
  }
  for (const key of ["submitted", "scorableMarkPointsComplete", "reflectionComplete", "summaryConfirmed"] as const) {
    if (typeof value[key] !== "boolean") issues.push(issue("ATTEMPT_CHECKLIST_VALUE_INVALID", `${path}.${key}`, "Checklist values must be boolean."));
  }
}

function validateNavigation(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("ATTEMPT_NAVIGATION_INVALID", path, "Navigation must be an object."));
    return;
  }
  if (value.currentQuestionIdentity !== undefined && !isPinnedQuestionIdentity(value.currentQuestionIdentity)) {
    issues.push(issue("ATTEMPT_NAVIGATION_CURRENT_INVALID", `${path}.currentQuestionIdentity`, "Current question must use a pinned question identity."));
  }
  if (!Array.isArray(value.flaggedQuestionIdentities)) {
    issues.push(issue("ATTEMPT_NAVIGATION_FLAGS_INVALID", `${path}.flaggedQuestionIdentities`, "Flagged questions must be an array."));
  } else {
    const identities = value.flaggedQuestionIdentities;
    if (identities.some((identity) => !isPinnedQuestionIdentity(identity))) {
      issues.push(issue("ATTEMPT_NAVIGATION_FLAG_INVALID", `${path}.flaggedQuestionIdentities`, "Each flag must use a pinned question identity."));
    }
    if (new Set(identities).size !== identities.length) {
      issues.push(issue("ATTEMPT_NAVIGATION_FLAGS_DUPLICATE", `${path}.flaggedQuestionIdentities`, "Flagged question identities must be unique."));
    }
  }
  if (value.activeSectionId !== undefined && (typeof value.activeSectionId !== "string" || !/^\d+\.\d+$/.test(value.activeSectionId))) {
    issues.push(issue("ATTEMPT_NAVIGATION_SECTION_INVALID", `${path}.activeSectionId`, "Active section must use a syllabus section ID."));
  }
  if (!isIsoDateTime(value.updatedAt)) issues.push(issue("ATTEMPT_NAVIGATION_TIME_INVALID", `${path}.updatedAt`, "Navigation timestamp is invalid."));
}

function isPinnedQuestionIdentity(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const separator = value.lastIndexOf("@");
  if (separator <= 0 || separator === value.length - 1) return false;
  return isPaper2StableId(value.slice(0, separator))
    && /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(value.slice(separator + 1));
}

function validRubricBinding(value: unknown): value is Paper2AttemptRubricBinding {
  return isRecord(value)
    && typeof value.rubricVersion === "string"
    && typeof value.rubricHash === "string" && /^[a-f0-9]{64}$/i.test(value.rubricHash)
    && isPaper2StableId(value.terminalReceiptId);
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

function issue(code: string, path: string, message: string): Paper2ContractIssue {
  return { code, path, message };
}
