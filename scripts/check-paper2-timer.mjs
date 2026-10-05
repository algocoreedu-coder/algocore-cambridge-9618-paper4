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

const {
  PAPER2_DEFAULT_MOCK_DURATION_MS,
  PAPER2_TIMER_WARNING_MINUTES,
  createPaper2TimerState,
  isPaper2TimerInputLocked,
  reducePaper2Timer,
  selectPaper2TimerDisplaySeconds,
  selectPaper2TimerRemainingMs,
} = loadDomainModule("timer-reducer");
const checks = [];
const failures = [];
const check = (id, condition, detail = undefined) => {
  const result = { id, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) };
  checks.push(result);
  if (!result.pass) failures.push(result);
};

const startEpoch = 1_000_000;
const deadline = startEpoch + 120 * 60_000;
const savedAt = "2026-10-03T08:00:00.000Z";
const startEvent = {
  type: "START_ACCEPTED",
  serverNowEpochMs: startEpoch,
  startedAtEpochMs: startEpoch,
  deadlineEpochMs: deadline,
  monotonicNowMs: 0,
  policyVersion: "paper2-timer-v1",
  savedAt,
};
const start = () => reducePaper2Timer(createPaper2TimerState(), startEvent);
const tickAt = (state, elapsedMs, monotonicMs = elapsedMs) => reducePaper2Timer(state, {
  type: "TICK",
  wallNowEpochMs: startEpoch + elapsedMs,
  monotonicNowMs: monotonicMs,
  savedAt,
});

check("duration-120-minutes", PAPER2_DEFAULT_MOCK_DURATION_MS === 7_200_000);
check("warning-contract", JSON.stringify(PAPER2_TIMER_WARNING_MINUTES) === JSON.stringify([30, 10, 5, 1]), PAPER2_TIMER_WARNING_MINUTES);
const boundaryCases = [
  ["0-min", 0, 7_200_000, "running"],
  ["1-min", 60_000, 7_140_000, "running"],
  ["119-min", 119 * 60_000, 60_000, "running"],
  ["119-59-59", 7_199_000, 1_000, "running"],
  ["120-min", 7_200_000, 0, "expired"],
];
for (const [id, elapsed, expectedRemaining, expectedStatus] of boundaryCases) {
  const state = elapsed === 0 ? start() : tickAt(start(), elapsed);
  check(`boundary:${id}`, state.remainingMs === expectedRemaining && state.status === expectedStatus, {
    status: state.status,
    remainingMs: state.remainingMs,
    displaySeconds: selectPaper2TimerDisplaySeconds(state),
  });
}

let warningState = start();
for (const [minutes, elapsed] of [[30, 90 * 60_000], [10, 110 * 60_000], [5, 115 * 60_000], [1, 119 * 60_000]]) {
  warningState = tickAt(warningState, elapsed, elapsed);
  check(`warning-crossed:${minutes}`, warningState.pendingWarningMinutes.includes(minutes), warningState.pendingWarningMinutes);
  warningState = reducePaper2Timer(warningState, { type: "WARNING_CONSUMED", minutes });
  check(`warning-consumed:${minutes}`, !warningState.pendingWarningMinutes.includes(minutes));
  const repeat = tickAt(warningState, elapsed + 1_000, elapsed + 1_000);
  check(`warning-once:${minutes}`, !repeat.pendingWarningMinutes.includes(minutes)
    && repeat.announcedWarningMinutes.filter((value) => value === minutes).length === 1, repeat);
  warningState = repeat;
}

const afterTen = tickAt(start(), 10 * 60_000);
const rollback = reducePaper2Timer(afterTen, { type: "CLOCK_ANOMALY", wallNowEpochMs: startEpoch, monotonicNowMs: 11 * 60_000, savedAt });
check("clock-rollback-does-not-add-time", rollback.remainingMs <= afterTen.remainingMs && rollback.remainingMs === 109 * 60_000 && rollback.clockAnomalyDetected, rollback);
const forward = reducePaper2Timer(afterTen, { type: "TICK", wallNowEpochMs: startEpoch + 20 * 60_000, monotonicNowMs: 11 * 60_000, savedAt });
check("clock-forward-consumes-time", forward.remainingMs === 100 * 60_000, forward);

const startState = start();
const snapshot = startState.snapshot;
for (const scenario of ["reload", "background", "sleep", "browser-restart"]) {
  const restored = reducePaper2Timer(createPaper2TimerState(), {
    type: "RESTORE",
    record: snapshot,
    wallNowEpochMs: startEpoch + 5 * 60_000,
    monotonicNowMs: 0,
  });
  check(`${scenario}-wall-clock-five-minutes`, restored.status === "running" && restored.remainingMs === 115 * 60_000, restored);
}
const offlineExpired = reducePaper2Timer(createPaper2TimerState(), {
  type: "RESTORE",
  record: snapshot,
  wallNowEpochMs: deadline + 1,
  monotonicNowMs: 0,
});
check("offline-expiry", offlineExpired.status === "expired" && offlineExpired.remainingMs === 0 && isPaper2TimerInputLocked(offlineExpired), offlineExpired);

const submitPending = reducePaper2Timer(startState, { type: "SUBMIT_REQUESTED" });
const duplicateSubmit = reducePaper2Timer(submitPending, { type: "SUBMIT_REQUESTED" });
check("submit-race-fails-closed", duplicateSubmit.status === "submit_pending" && duplicateSubmit.errorCode === "TIMER_SUBMIT_INVALID_STATE", duplicateSubmit);
const submitted = reducePaper2Timer(submitPending, { type: "SUBMIT_ACCEPTED", serverNowEpochMs: startEpoch + 1_000 });
check("submit-accepted-terminal", submitted.status === "submitted" && isPaper2TimerInputLocked(submitted), submitted);
const resetAfterSubmit = reducePaper2Timer(submitted, { type: "RESET" });
const restarted = reducePaper2Timer(resetAfterSubmit, { ...startEvent, startedAtEpochMs: startEpoch + 2_000, serverNowEpochMs: startEpoch + 2_000, deadlineEpochMs: deadline + 2_000 });
check("reset-clears-terminal-timer", resetAfterSubmit.status === "idle" && resetAfterSubmit.snapshot === null && resetAfterSubmit.remainingMs === 0, resetAfterSubmit);
check("new-attempt-starts-after-reset", restarted.status === "running" && restarted.errorCode === undefined, restarted);
const expiredSubmit = reducePaper2Timer(offlineExpired, { type: "SUBMIT_REQUESTED" });
const expiredRejected = reducePaper2Timer(expiredSubmit, { type: "SUBMIT_REJECTED", code: "NETWORK_RETRY", serverExpired: true });
check("expired-submit-retry-preserves-expiry", expiredRejected.status === "expired" && expiredRejected.errorCode === "NETWORK_RETRY", expiredRejected);

const invalidStart = reducePaper2Timer(createPaper2TimerState(), { ...startEvent, deadlineEpochMs: startEpoch });
check("negative-invalid-start-boundary", invalidStart.status === "error" && invalidStart.errorCode === "TIMER_START_BOUNDARY_INVALID", invalidStart);
const idleTick = reducePaper2Timer(createPaper2TimerState(), { type: "TICK", wallNowEpochMs: startEpoch, monotonicNowMs: 0 });
check("negative-idle-tick", idleTick.status === "idle" && idleTick.errorCode === "TIMER_NOT_RUNNING", idleTick);
check("remaining-never-negative", selectPaper2TimerRemainingMs(tickAt(start(), 8_000_000)) === 0);
check("input-lock-boundary", !isPaper2TimerInputLocked(startState) && isPaper2TimerInputLocked(offlineExpired) && isPaper2TimerInputLocked(submitted));

const output = {
  schemaVersion: "paper2-timer-check-v1",
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  boundaryCases: boundaryCases.length,
  warningThresholds: PAPER2_TIMER_WARNING_MINUTES,
  recoveryScenarios: 5,
  negativeFixtures: 4,
  failures,
};
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
