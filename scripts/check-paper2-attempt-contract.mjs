import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paper2Lib = path.join(root, "app/lib/paper2");

function loadDomainModule(moduleName) {
  const temp = mkdtempSync(path.join(os.tmpdir(), "paper2-gate-a-domain-"));
  try {
    writeFileSync(path.join(temp, "package.json"), '{"type":"commonjs"}\n');
    for (const name of readdirSync(paper2Lib).filter((entry) => entry.endsWith(".ts"))) {
      const output = ts.transpileModule(readFileSync(path.join(paper2Lib, name), "utf8"), {
        fileName: name,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        reportDiagnostics: true,
      });
      const errors = (output.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
      if (errors.length) throw new Error(`${name}: ${errors.map((item) => item.messageText).join("; ")}`);
      writeFileSync(path.join(temp, name.replace(/\.ts$/, ".js")), output.outputText);
    }
    return createRequire(import.meta.url)(path.join(temp, `${moduleName}.js`));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const attemptDomain = loadDomainModule("attempt-types");
const questionDomain = loadDomainModule("question-types");
const {
  PAPER2_ATTEMPT_EVENTS,
  PAPER2_ATTEMPT_STATUSES,
  PAPER2_ATTEMPT_TRANSITIONS,
  calculatePaper2SelfMarkedScore,
  canEditPaper2Responses,
  transitionPaper2Attempt,
  updatePaper2AttemptNavigation,
  updatePaper2AttemptResponse,
  validatePaper2Attempt,
} = attemptDomain;
const { PAPER2_ASSESSMENT_MODES } = questionDomain;

const checks = [];
const failures = [];
const check = (id, condition, detail = undefined) => {
  const result = { id, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) };
  checks.push(result);
  if (!result.pass) failures.push(result);
};
const at = "2026-10-03T08:00:00.000Z";
const later = "2026-10-03T08:01:00.000Z";
const rubricBinding = { rubricVersion: "1.0.0", rubricHash: "b".repeat(64), terminalReceiptId: "receipt:fixture" };

function attemptFixture(status = "not_started", overrides = {}) {
  const started = status === "not_started" ? null : at;
  const fixture = {
    schemaVersion: 2,
    attemptId: `attempt:fixture-${status}`,
    learnerScopeId: "learner:local-fixture",
    contentKind: "practice_set",
    contentId: "set:fixture",
    contentVersion: "1.0.0",
    contentHash: "a".repeat(64),
    mode: "set_closed",
    status,
    revision: 0,
    locale: "en",
    startedAt: started,
    updatedAt: at,
    responses: {},
    finalChecklist: { submitted: false, scorableMarkPointsComplete: false, reflectionComplete: false, summaryConfirmed: false },
    storageHealth: "healthy",
    lastMigrationVersion: 2,
    ...overrides,
  };
  if (["submitted", "self_marking", "self_marked", "reviewed_attempt"].includes(status)) {
    fixture.submittedAt = later;
    fixture.finalChecklist = { ...fixture.finalChecklist, submitted: true };
  }
  if (["self_marking", "self_marked", "reviewed_attempt"].includes(status)) fixture.rubricBinding = rubricBinding;
  if (status === "recovery_required") {
    fixture.storageHealth = "corrupt";
    fixture.recovery = { priorStatus: "active", reasonCode: "HASH_MISMATCH", enteredAt: later };
  }
  return fixture;
}

const immutableKeys = ["attemptId", "learnerScopeId", "mode", "contentId", "contentVersion", "contentHash", "startedAt", "durationMinutes"];
const eventFixtures = {
  confirmed_start: { type: "confirmed_start", at: later },
  confirmed_submit: { type: "confirmed_submit", at: later },
  deadline_reached: { type: "deadline_reached", at: later },
  confirmed_reset_or_discard: { type: "confirmed_reset_or_discard", at: later },
  submit_expired_attempt: { type: "submit_expired_attempt", at: later },
  rubric_loaded_and_marking_started: { type: "rubric_loaded_and_marking_started", at: later, rubricBinding },
  all_scorable_mark_points_decided: { type: "all_scorable_mark_points_decided", at: later },
  reflection_and_summary_confirmed: { type: "reflection_and_summary_confirmed", at: later },
  validation_migration_hash_or_writer_failure: { type: "validation_migration_hash_or_writer_failure", at: later, reasonCode: "HASH_MISMATCH" },
  deterministic_recovery_or_tested_migration: { type: "deterministic_recovery_or_tested_migration", at: later, recoveredStatus: "active" },
  confirmed_discard: { type: "confirmed_discard", at: later },
};

check("five-assessment-modes", PAPER2_ASSESSMENT_MODES.length === 5
  && new Set(PAPER2_ASSESSMENT_MODES).size === 5
  && ["lesson_guided", "set_guided", "diagnostic_closed", "set_closed", "mock_timed"].every((mode) => PAPER2_ASSESSMENT_MODES.includes(mode)), PAPER2_ASSESSMENT_MODES);
check("nine-attempt-states", PAPER2_ATTEMPT_STATUSES.length === 9
  && new Set(PAPER2_ATTEMPT_STATUSES).size === 9, PAPER2_ATTEMPT_STATUSES);
check("event-vocabulary", PAPER2_ATTEMPT_EVENTS.length === 11 && new Set(PAPER2_ATTEMPT_EVENTS).size === 11, PAPER2_ATTEMPT_EVENTS);
check("positive-not-started-fixture", validatePaper2Attempt(attemptFixture()).ok);

const positiveTransitions = [
  ["not_started", "confirmed_start", "active", {}],
  ["active", "confirmed_submit", "submitted", {}],
  ["active", "deadline_reached", "expired", {}],
  ["active", "confirmed_reset_or_discard", "abandoned", {}],
  ["expired", "submit_expired_attempt", "submitted", {}],
  ["expired", "confirmed_reset_or_discard", "abandoned", {}],
  ["submitted", "rubric_loaded_and_marking_started", "self_marking", {}],
  ["self_marking", "all_scorable_mark_points_decided", "self_marked", { finalChecklist: { submitted: true, scorableMarkPointsComplete: true, reflectionComplete: false, summaryConfirmed: false } }],
  ["self_marked", "reflection_and_summary_confirmed", "reviewed_attempt", { finalChecklist: { submitted: true, scorableMarkPointsComplete: true, reflectionComplete: true, summaryConfirmed: true } }],
  ["active", "validation_migration_hash_or_writer_failure", "recovery_required", {}],
  ["recovery_required", "deterministic_recovery_or_tested_migration", "active", {}],
  ["recovery_required", "confirmed_discard", "abandoned", {}],
];
for (const [from, eventName, to, overrides] of positiveTransitions) {
  const input = attemptFixture(from, overrides);
  const result = transitionPaper2Attempt(input, eventFixtures[eventName]);
  check(`positive-transition:${from}:${eventName}:${to}`, result.ok && result.attempt.status === to, result);
  if (result.ok) {
    check(`positive-transition-revision:${from}:${eventName}`, result.attempt.revision === input.revision + 1);
    const immutableExceptStart = from === "not_started" ? immutableKeys.filter((key) => key !== "startedAt") : immutableKeys;
    check(`positive-transition-immutable:${from}:${eventName}`, immutableExceptStart.every((key) => result.attempt[key] === input[key]));
  }
}

let negativeTransitions = 0;
for (const status of PAPER2_ATTEMPT_STATUSES) {
  for (const eventName of PAPER2_ATTEMPT_EVENTS) {
    const declared = PAPER2_ATTEMPT_TRANSITIONS[status]?.[eventName];
    const globallyAllowedRecovery = eventName === "validation_migration_hash_or_writer_failure" && status !== "recovery_required";
    if (declared || globallyAllowedRecovery) continue;
    const input = attemptFixture(status);
    const before = structuredClone(input);
    const result = transitionPaper2Attempt(input, eventFixtures[eventName]);
    negativeTransitions += 1;
    check(`negative-transition:${status}:${eventName}`, !result.ok && result.attempt === input && JSON.stringify(input) === JSON.stringify(before), result);
  }
}

const activeWithResponse = attemptFixture("active");
const response = { questionId: "question:fixture", questionVersion: "1.0.0", answer: "answer", updatedAt: later };
const updated = updatePaper2AttemptResponse(activeWithResponse, "question:fixture@1.0.0", response, 0);
check("positive-response-save", updated.ok && updated.attempt.revision === 1 && updated.attempt.responses["question:fixture@1.0.0"]?.answer === "answer", updated);
const repeatedStaleWrite = updatePaper2AttemptResponse(updated.attempt, "question:fixture@1.0.0", response, 0);
check("negative-stale-save-fails-closed", !repeatedStaleWrite.ok && repeatedStaleWrite.code === "ATTEMPT_REVISION_CONFLICT", repeatedStaleWrite);
const terminalWrite = updatePaper2AttemptResponse(attemptFixture("submitted"), "question:fixture@1.0.0", response, 0);
check("negative-terminal-response-write", !terminalWrite.ok && terminalWrite.code === "ATTEMPT_RESPONSE_LOCKED", terminalWrite);
check("responses-editable-active-only", PAPER2_ATTEMPT_STATUSES.every((status) => canEditPaper2Responses(status) === (status === "active")));

check("navigation-backward-compatible-optional", validatePaper2Attempt(attemptFixture("active")).ok);
const navigation = { currentQuestionIdentity: "question:fixture@1.0.0", flaggedQuestionIdentities: ["question:fixture@1.0.0"], activeSectionId: "9.1", updatedAt: later };
const navigated = updatePaper2AttemptNavigation(attemptFixture("active"), navigation, 0);
check("navigation-positive-revisioned-save", navigated.ok
  && navigated.attempt.revision === 1
  && navigated.attempt.navigation?.currentQuestionIdentity === "question:fixture@1.0.0"
  && navigated.attempt.navigation.flaggedQuestionIdentities.length === 1, navigated);
const staleNavigation = updatePaper2AttemptNavigation(navigated.attempt, navigation, 0);
check("navigation-stale-save-fails-closed", !staleNavigation.ok && staleNavigation.code === "ATTEMPT_REVISION_CONFLICT", staleNavigation);
const terminalNavigation = updatePaper2AttemptNavigation(attemptFixture("submitted"), navigation, 0);
check("navigation-terminal-write-locked", !terminalNavigation.ok && terminalNavigation.code === "ATTEMPT_NAVIGATION_LOCKED", terminalNavigation);
check("navigation-duplicate-flags-invalid", !validatePaper2Attempt(attemptFixture("active", { navigation: { ...navigation, flaggedQuestionIdentities: ["question:fixture@1.0.0", "question:fixture@1.0.0"] } })).ok);
check("navigation-unpinned-identity-invalid", !validatePaper2Attempt(attemptFixture("active", { navigation: { ...navigation, currentQuestionIdentity: "question:fixture" } })).ok);
check("navigation-section-invalid", !validatePaper2Attempt(attemptFixture("active", { navigation: { ...navigation, activeSectionId: "section-nine" } })).ok);

const leakedPreterminal = attemptFixture("active", { rubricBinding, selfMarks: {} });
check("negative-preterminal-solution-persistence", !validatePaper2Attempt(leakedPreterminal).ok);
const invalidMode = attemptFixture("active", { mode: "unknown_mode" });
check("negative-invalid-mode", !validatePaper2Attempt(invalidMode).ok);
const restart = transitionPaper2Attempt(attemptFixture("abandoned"), eventFixtures.confirmed_start);
check("negative-retry-must-create-new-id", !restart.ok && restart.code === "ATTEMPT_TRANSITION_INVALID", restart);
const score = calculatePaper2SelfMarkedScore([
  { markPointId: "mp:1", decision: "awarded", marksAvailable: 1, marksAwarded: 1, decidedAt: later },
  { markPointId: "mp:2", decision: "not_awarded", marksAvailable: 2, marksAwarded: 0, decidedAt: later },
  { markPointId: "mp:3", decision: "not_applicable", marksAvailable: 3, marksAwarded: 0, decidedAt: later },
]);
check("self-mark-score-derived-from-atomic-points", score.awarded === 1 && score.available === 3 && score.decidedPoints === 3 && score.notApplicablePoints === 1, score);
check("attempt-schema-has-no-mastery-axis", !("mastery" in attemptFixture("reviewed_attempt")));

const output = {
  schemaVersion: "paper2-attempt-contract-check-v1",
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  assessmentModes: PAPER2_ASSESSMENT_MODES.length,
  attemptStates: PAPER2_ATTEMPT_STATUSES.length,
  positiveTransitions: positiveTransitions.length,
  negativeTransitions,
  failures,
};
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
