import type { Paper2TimerSnapshot } from "./attempt-types";

export const PAPER2_DEFAULT_MOCK_DURATION_MS = 7_200_000;
export const PAPER2_TIMER_WARNING_MINUTES = [30, 10, 5, 1] as const;
export const PAPER2_TIMER_WARNING_THRESHOLDS_MS = PAPER2_TIMER_WARNING_MINUTES.map((minutes) => minutes * 60_000);

export type Paper2TimerStatus = "idle" | "running" | "expired" | "submit_pending" | "submitted" | "error";

export interface Paper2TimerState {
  readonly status: Paper2TimerStatus;
  readonly snapshot: Paper2TimerSnapshot | null;
  readonly effectiveNowEpochMs: number | null;
  readonly remainingMs: number;
  readonly announcedWarningMinutes: readonly number[];
  readonly pendingWarningMinutes: readonly number[];
  readonly clockAnomalyDetected: boolean;
  readonly statusBeforeSubmit?: "running" | "expired";
  readonly errorCode?: string;
}

export type Paper2TimerEvent =
  | { readonly type: "RESET" }
  | {
    readonly type: "START_ACCEPTED";
    readonly serverNowEpochMs: number;
    readonly startedAtEpochMs: number;
    readonly deadlineEpochMs: number;
    readonly monotonicNowMs: number;
    readonly policyVersion: string;
    readonly savedAt: string;
  }
  | { readonly type: "TICK"; readonly wallNowEpochMs: number; readonly monotonicNowMs: number; readonly savedAt?: string }
  | { readonly type: "VISIBILITY_RECHECK"; readonly wallNowEpochMs: number; readonly monotonicNowMs: number; readonly savedAt?: string }
  | {
    readonly type: "RESTORE";
    readonly record: Paper2TimerSnapshot;
    readonly wallNowEpochMs: number;
    readonly monotonicNowMs: number;
    readonly terminalStatus?: "expired" | "submitted";
  }
  | { readonly type: "SUBMIT_REQUESTED" }
  | { readonly type: "SUBMIT_ACCEPTED"; readonly serverNowEpochMs: number }
  | { readonly type: "SUBMIT_REJECTED"; readonly code: string; readonly serverExpired?: boolean }
  | { readonly type: "SERVER_EXPIRED"; readonly serverNowEpochMs: number; readonly savedAt: string }
  | { readonly type: "CLOCK_ANOMALY"; readonly wallNowEpochMs: number; readonly monotonicNowMs: number; readonly savedAt?: string }
  | { readonly type: "WARNING_CONSUMED"; readonly minutes: number };

export function createPaper2TimerState(): Paper2TimerState {
  return {
    status: "idle",
    snapshot: null,
    effectiveNowEpochMs: null,
    remainingMs: 0,
    announcedWarningMinutes: [],
    pendingWarningMinutes: [],
    clockAnomalyDetected: false,
  };
}

export function reducePaper2Timer(state: Paper2TimerState, event: Paper2TimerEvent): Paper2TimerState {
  switch (event.type) {
    case "RESET":
      return createPaper2TimerState();
    case "START_ACCEPTED":
      return startAccepted(state, event);
    case "TICK":
    case "VISIBILITY_RECHECK":
      return observeTime(state, event.wallNowEpochMs, event.monotonicNowMs, event.savedAt, false);
    case "RESTORE":
      return restoreTimer(state, event);
    case "CLOCK_ANOMALY":
      return observeTime(state, event.wallNowEpochMs, event.monotonicNowMs, event.savedAt, true);
    case "SERVER_EXPIRED":
      return forceServerExpiry(state, event.serverNowEpochMs, event.savedAt);
    case "SUBMIT_REQUESTED":
      if (state.status !== "running" && state.status !== "expired") return { ...state, errorCode: "TIMER_SUBMIT_INVALID_STATE" };
      return { ...state, statusBeforeSubmit: state.status, status: "submit_pending", errorCode: undefined };
    case "SUBMIT_ACCEPTED":
      if (state.status !== "submit_pending") return { ...state, errorCode: "TIMER_SUBMIT_ACCEPT_INVALID_STATE" };
      return {
        ...state,
        status: "submitted",
        effectiveNowEpochMs: Math.max(state.effectiveNowEpochMs ?? 0, event.serverNowEpochMs),
        statusBeforeSubmit: undefined,
        errorCode: undefined,
      };
    case "SUBMIT_REJECTED": {
      if (state.status !== "submit_pending") return { ...state, errorCode: "TIMER_SUBMIT_REJECT_INVALID_STATE" };
      const nextStatus = event.serverExpired ? "expired" : (state.statusBeforeSubmit ?? "error");
      return { ...state, status: nextStatus, statusBeforeSubmit: undefined, errorCode: event.code };
    }
    case "WARNING_CONSUMED":
      if (!PAPER2_TIMER_WARNING_MINUTES.includes(event.minutes as (typeof PAPER2_TIMER_WARNING_MINUTES)[number])) return { ...state, errorCode: "TIMER_WARNING_INVALID" };
      return { ...state, pendingWarningMinutes: state.pendingWarningMinutes.filter((minutes) => minutes !== event.minutes) };
  }
}

export function selectPaper2TimerRemainingMs(state: Paper2TimerState) {
  return Math.max(0, state.remainingMs);
}

export function selectPaper2TimerDisplaySeconds(state: Paper2TimerState) {
  return Math.ceil(selectPaper2TimerRemainingMs(state) / 1000);
}

export function isPaper2TimerInputLocked(state: Paper2TimerState) {
  return state.status !== "running";
}

function startAccepted(state: Paper2TimerState, event: Extract<Paper2TimerEvent, { type: "START_ACCEPTED" }>): Paper2TimerState {
  if (state.status !== "idle") return { ...state, errorCode: "TIMER_ALREADY_STARTED" };
  if (!validFinite(event.serverNowEpochMs) || !validFinite(event.startedAtEpochMs) || !validFinite(event.deadlineEpochMs) || !validFinite(event.monotonicNowMs)) return { ...state, status: "error", errorCode: "TIMER_START_VALUES_INVALID" };
  if (event.deadlineEpochMs <= event.startedAtEpochMs || event.serverNowEpochMs < event.startedAtEpochMs) return { ...state, status: "error", errorCode: "TIMER_START_BOUNDARY_INVALID" };
  if (!event.policyVersion.trim() || !validDate(event.savedAt)) return { ...state, status: "error", errorCode: "TIMER_START_METADATA_INVALID" };
  const effectiveNow = Math.max(event.serverNowEpochMs, event.startedAtEpochMs);
  const remainingMs = Math.max(0, event.deadlineEpochMs - effectiveNow);
  const snapshot: Paper2TimerSnapshot = {
    startedAtEpochMs: event.startedAtEpochMs,
    deadlineEpochMs: event.deadlineEpochMs,
    lastObservedWallMs: effectiveNow,
    lastObservedMonotonicMs: event.monotonicNowMs,
    lastSavedAt: event.savedAt,
    policyVersion: event.policyVersion,
  };
  return {
    status: remainingMs === 0 ? "expired" : "running",
    snapshot,
    effectiveNowEpochMs: effectiveNow,
    remainingMs,
    announcedWarningMinutes: [],
    pendingWarningMinutes: [],
    clockAnomalyDetected: false,
  };
}

function observeTime(
  state: Paper2TimerState,
  wallNowEpochMs: number,
  monotonicNowMs: number,
  savedAt: string | undefined,
  explicitAnomaly: boolean,
): Paper2TimerState {
  if (!state.snapshot || !["running", "expired"].includes(state.status)) return { ...state, errorCode: "TIMER_NOT_RUNNING" };
  if (!validFinite(wallNowEpochMs) || !validFinite(monotonicNowMs)) return { ...state, errorCode: "TIMER_OBSERVATION_INVALID" };
  const snapshot = state.snapshot;
  const monotonicDelta = monotonicNowMs >= snapshot.lastObservedMonotonicMs
    ? monotonicNowMs - snapshot.lastObservedMonotonicMs
    : 0;
  const monotonicProjection = snapshot.lastObservedWallMs + monotonicDelta;
  const effectiveNow = Math.max(state.effectiveNowEpochMs ?? snapshot.lastObservedWallMs, snapshot.lastObservedWallMs, wallNowEpochMs, monotonicProjection);
  const remainingMs = Math.max(0, snapshot.deadlineEpochMs - effectiveNow);
  const warningUpdate = collectWarnings(state.remainingMs, remainingMs, state.announcedWarningMinutes);
  const rollback = wallNowEpochMs < snapshot.lastObservedWallMs;
  return {
    ...state,
    status: remainingMs === 0 ? "expired" : state.status,
    snapshot: {
      ...snapshot,
      lastObservedWallMs: effectiveNow,
      lastObservedMonotonicMs: monotonicNowMs,
      lastSavedAt: savedAt && validDate(savedAt) ? savedAt : snapshot.lastSavedAt,
    },
    effectiveNowEpochMs: effectiveNow,
    remainingMs,
    announcedWarningMinutes: warningUpdate.announced,
    pendingWarningMinutes: [...state.pendingWarningMinutes, ...warningUpdate.newlyCrossed].filter(unique),
    clockAnomalyDetected: state.clockAnomalyDetected || explicitAnomaly || rollback,
    errorCode: undefined,
  };
}

function restoreTimer(state: Paper2TimerState, event: Extract<Paper2TimerEvent, { type: "RESTORE" }>): Paper2TimerState {
  if (state.status !== "idle") return { ...state, errorCode: "TIMER_RESTORE_INVALID_STATE" };
  const record = event.record;
  if (!validTimerSnapshot(record) || !validFinite(event.wallNowEpochMs) || !validFinite(event.monotonicNowMs)) return { ...state, status: "error", errorCode: "TIMER_RESTORE_RECORD_INVALID" };
  const monotonicProjection = event.monotonicNowMs >= record.lastObservedMonotonicMs
    ? record.lastObservedWallMs + (event.monotonicNowMs - record.lastObservedMonotonicMs)
    : record.lastObservedWallMs;
  const effectiveNow = Math.max(record.lastObservedWallMs, event.wallNowEpochMs, monotonicProjection);
  const remainingMs = Math.max(0, record.deadlineEpochMs - effectiveNow);
  const crossed = collectWarnings(record.deadlineEpochMs - record.lastObservedWallMs, remainingMs, []);
  const terminalStatus = event.terminalStatus;
  const status: Paper2TimerStatus = terminalStatus === "submitted" ? "submitted" : (terminalStatus === "expired" || remainingMs === 0 ? "expired" : "running");
  return {
    status,
    snapshot: {
      ...record,
      lastObservedWallMs: effectiveNow,
      lastObservedMonotonicMs: event.monotonicNowMs,
    },
    effectiveNowEpochMs: effectiveNow,
    remainingMs,
    announcedWarningMinutes: crossed.announced,
    pendingWarningMinutes: crossed.newlyCrossed,
    clockAnomalyDetected: event.wallNowEpochMs < record.lastObservedWallMs,
  };
}

function forceServerExpiry(state: Paper2TimerState, serverNowEpochMs: number, savedAt: string): Paper2TimerState {
  if (!state.snapshot || !validFinite(serverNowEpochMs) || !validDate(savedAt)) return { ...state, status: "error", errorCode: "TIMER_SERVER_EXPIRY_INVALID" };
  const effectiveNow = Math.max(state.effectiveNowEpochMs ?? 0, state.snapshot.deadlineEpochMs, serverNowEpochMs);
  return {
    ...state,
    status: "expired",
    snapshot: {
      ...state.snapshot,
      lastObservedWallMs: effectiveNow,
      lastSavedAt: savedAt,
    },
    effectiveNowEpochMs: effectiveNow,
    remainingMs: 0,
    statusBeforeSubmit: undefined,
    errorCode: undefined,
  };
}

function collectWarnings(previousRemainingMs: number, nextRemainingMs: number, alreadyAnnounced: readonly number[]) {
  const newlyCrossed = PAPER2_TIMER_WARNING_MINUTES.filter((minutes) => {
    const threshold = minutes * 60_000;
    return !alreadyAnnounced.includes(minutes) && previousRemainingMs > threshold && nextRemainingMs <= threshold && nextRemainingMs > 0;
  });
  return { announced: [...alreadyAnnounced, ...newlyCrossed].filter(unique), newlyCrossed };
}

function validTimerSnapshot(snapshot: Paper2TimerSnapshot) {
  return validFinite(snapshot.startedAtEpochMs)
    && validFinite(snapshot.deadlineEpochMs)
    && snapshot.deadlineEpochMs > snapshot.startedAtEpochMs
    && validFinite(snapshot.lastObservedWallMs)
    && validFinite(snapshot.lastObservedMonotonicMs)
    && validDate(snapshot.lastSavedAt)
    && typeof snapshot.policyVersion === "string"
    && snapshot.policyVersion.trim().length > 0;
}

function validFinite(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function validDate(value: string) {
  return value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function unique<T>(value: T, index: number, values: readonly T[]) {
  return values.indexOf(value) === index;
}
