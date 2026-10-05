"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Flag, RotateCcw, Save, Send, ShieldCheck } from "lucide-react";

import type { Locale } from "@/app/lib/paper2/types";
import type { Paper2PrivateSolution, Paper2PublicQuestion } from "@/app/lib/paper2/question-types";
import type { Paper2PublicSourceLabel } from "@/app/lib/paper2/public-source-registry";
import {
  calculatePaper2SelfMarkedScore,
  transitionPaper2Attempt,
  updatePaper2AttemptNavigation,
  updatePaper2AttemptResponse,
  type Paper2AttemptRecord,
  type Paper2AttemptRubricBinding,
  type Paper2SelfMarkDecision,
} from "@/app/lib/paper2/attempt-types";
import {
  createPaper2MemoryRepository,
  createPaper2StorageRepository,
  preflightPaper2Persistence,
  type Paper2AttemptRepository,
} from "@/app/lib/paper2/storage-v2";
import {
  createPaper2TimerState,
  reducePaper2Timer,
  selectPaper2TimerRemainingMs,
} from "@/app/lib/paper2/timer-reducer";

import styles from "./Paper2Assessment.module.css";
import { AssessmentNavigator, type AssessmentNavigatorItem } from "./AssessmentNavigator";

type AssessmentKind = "practice_set" | "diagnostic" | "mock";

export interface Paper2AssessmentWorkspaceProps {
  readonly kind: AssessmentKind;
  readonly contentId: string;
  readonly contentVersion: string;
  readonly contentHash: string;
  readonly mode: "set_guided" | "diagnostic_closed" | "set_closed" | "mock_timed";
  readonly title: { readonly en: string; readonly vi: string };
  readonly instructions: { readonly en: string; readonly vi: string };
  readonly questions: readonly Paper2PublicQuestion[];
  readonly sourceLabels: Readonly<Record<string, readonly Paper2PublicSourceLabel[]>>;
  readonly immediateSolutions?: readonly Paper2PrivateSolution[];
  readonly immediateRubricHash?: string;
  readonly durationMinutes?: number;
  readonly totalMarks: number;
  readonly locale: Locale;
}

type SubmitPayload = {
  readonly receipt: { readonly receiptId: string; readonly terminalReason: string; readonly rubricVersion: string; readonly rubricHash: string };
  readonly solutions: readonly Paper2PrivateSolution[];
};

const LEARNER_SCOPE_ID = "learner:local-device";

export function Paper2AssessmentWorkspace(props: Paper2AssessmentWorkspaceProps) {
  const { locale } = props;
  const [attempt, setAttempt] = useState<Paper2AttemptRecord | null>(null);
  const [solutions, setSolutions] = useState<readonly Paper2PrivateSolution[]>(props.immediateSolutions ?? []);
  const [storageNotice, setStorageNotice] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [terminalRecoveryPending, setTerminalRecoveryPending] = useState(false);
  const [recoveringTerminal, setRecoveringTerminal] = useState(false);
  const [reflection, setReflection] = useState("");
  const [currentQuestionIdentity, setCurrentQuestionIdentity] = useState(() => questionIdentity(props.questions[0]));
  const [activeSectionId, setActiveSectionId] = useState(() => props.questions[0]?.sectionIds[0] ?? "");
  const [timer, dispatchTimer] = useReducer(reducePaper2Timer, undefined, createPaper2TimerState);
  const repository = useRef<Paper2AttemptRepository | null>(null);
  const attemptRef = useRef<Paper2AttemptRecord | null>(null);
  const navigationSaveTimer = useRef<number | null>(null);
  const navigationGeneration = useRef(0);
  const startInFlight = useRef(false);
  const submitInFlight = useRef(false);
  const terminalRecoveryInFlight = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const submitTriggerRef = useRef<HTMLButtonElement>(null);
  const submitConfirmHeadingRef = useRef<HTMLElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const resetConfirmHeadingRef = useRef<HTMLElement>(null);
  const timed = props.mode === "mock_timed";
  const active = attempt?.status === "active";
  const locked = !active || submitting;

  const cancelPendingNavigation = useCallback(() => {
    navigationGeneration.current += 1;
    if (navigationSaveTimer.current !== null) {
      window.clearTimeout(navigationSaveTimer.current);
      navigationSaveTimer.current = null;
    }
  }, []);

  const save = useCallback((next: Paper2AttemptRecord, expectedRevision: number) => {
    const repo = repository.current;
    if (!repo) return false;
    const result = repo.saveAttempt(next, expectedRevision);
    if (!result.ok) {
      const latest = repo.loadAttempt(next.attemptId);
      if (latest.ok && latest.value) {
        attemptRef.current = latest.value;
        setAttempt(latest.value);
      }
      setError(locale === "vi" ? "Thay đổi chưa được lưu vì dữ liệu trên thiết bị đã đổi. Trạng thái mới nhất đã được tải lại; hãy kiểm tra rồi thử lại." : "The change was not saved because the device record changed. The latest saved state was reloaded; review it and try again.");
      return false;
    }
    attemptRef.current = next;
    setAttempt(next);
    return true;
  }, [locale]);

  useEffect(() => {
    if (props.questions.length === 0) return;
    let repo: Paper2AttemptRepository;
    const preflight = preflightPaper2Persistence(window.localStorage, LEARNER_SCOPE_ID);
    if (preflight.ok) repo = createPaper2StorageRepository(window.localStorage, LEARNER_SCOPE_ID);
    else {
      repo = createPaper2MemoryRepository(LEARNER_SCOPE_ID);
      setStorageNotice(locale === "vi" ? "Trình duyệt không cho lưu. Bạn vẫn có thể luyện có hướng dẫn, nhưng đề mô phỏng tính giờ bị khóa để tránh mất bài." : "Browser storage is unavailable. Guided practice can continue in memory, but timed mocks are blocked to prevent data loss.");
    }
    repository.current = repo;
    const restored = repo.listAttemptIds()
      .map((id) => repo.loadAttempt(id))
      .filter((result) => result.ok && result.value?.contentId === props.contentId && result.value.contentVersion === props.contentVersion)
      .map((result) => result.ok ? result.value : null)
      .filter((value): value is Paper2AttemptRecord => Boolean(value))
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0];
    if (restored) {
      attemptRef.current = restored;
      setAttempt(restored);
      setReflection(restored.reflection ?? "");
      const requestedIdentity = restored.navigation?.currentQuestionIdentity;
      const restoredIdentity = requestedIdentity && props.questions.some((question) => questionIdentity(question) === requestedIdentity)
        ? requestedIdentity
        : questionIdentity(props.questions[0]);
      const restoredQuestion = props.questions.find((question) => questionIdentity(question) === restoredIdentity);
      const restoredSection = restored.navigation?.activeSectionId && props.questions.some((question) => question.sectionIds.includes(restored.navigation?.activeSectionId ?? ""))
        ? restored.navigation.activeSectionId
        : restoredQuestion?.sectionIds[0] ?? props.questions[0]?.sectionIds[0] ?? "";
      setCurrentQuestionIdentity(restoredIdentity);
      setActiveSectionId(restoredSection);
      if (restored.timer && !timed) dispatchTimer({ type: "RESTORE", record: restored.timer, wallNowEpochMs: Date.now(), monotonicNowMs: performance.now(), terminalStatus: restored.status === "submitted" || restored.status === "self_marking" || restored.status === "self_marked" || restored.status === "reviewed_attempt" ? "submitted" : restored.status === "expired" ? "expired" : undefined });
      if (timed && ["active", "expired", "submitted", "self_marking", "self_marked", "reviewed_attempt"].includes(restored.status)) void resumeTimedAttempt(restored);
      else if (!timed && props.mode !== "set_guided" && ["submitted", "self_marking", "self_marked", "reviewed_attempt"].includes(restored.status)) void recoverTerminalAttempt(restored);
      return;
    }
    const fresh = makeAttempt(props, timed ? "not_started" : "active", repo.persistent ? "healthy" : "memory_only");
    repo.saveAttempt(fresh, -1);
    attemptRef.current = fresh;
    setAttempt(fresh);
  // Props identify immutable assessment content; a route change remounts the workspace.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timer.status !== "running") return;
    const interval = window.setInterval(() => dispatchTimer({ type: "TICK", wallNowEpochMs: Date.now(), monotonicNowMs: performance.now(), savedAt: new Date().toISOString() }), 1000);
    const visibility = () => dispatchTimer({ type: "VISIBILITY_RECHECK", wallNowEpochMs: Date.now(), monotonicNowMs: performance.now(), savedAt: new Date().toISOString() });
    document.addEventListener("visibilitychange", visibility);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", visibility); };
  }, [timer.status]);

  useEffect(() => {
    if (timer.status !== "expired" || attempt?.status !== "active") return;
    const result = transitionPaper2Attempt(attempt, { type: "deadline_reached", at: new Date().toISOString() });
    if (result.ok) save({ ...result.attempt, timer: timer.snapshot ?? attempt.timer }, attempt.revision);
  }, [attempt, save, timer.snapshot, timer.status]);

  useEffect(() => {
    const warning = timer.pendingWarningMinutes[0];
    if (!warning) return;
    setStatusMessage(locale === "vi" ? `Còn ${warning} phút.` : `${warning} minutes remaining.`);
    dispatchTimer({ type: "WARNING_CONSUMED", minutes: warning });
  }, [locale, timer.pendingWarningMinutes]);

  useEffect(() => {
    if (confirmSubmit) requestAnimationFrame(() => submitConfirmHeadingRef.current?.focus());
  }, [confirmSubmit]);

  useEffect(() => {
    if (confirmReset) requestAnimationFrame(() => resetConfirmHeadingRef.current?.focus());
  }, [confirmReset]);

  const questionIdentities = useMemo(() => props.questions.map(questionIdentity), [props.questions]);
  const knownQuestionIdentities = useMemo(() => new Set(questionIdentities), [questionIdentities]);
  const questionIndexByIdentity = useMemo(() => new Map(questionIdentities.map((identity, index) => [identity, index])), [questionIdentities]);
  const diagnosticChunks = useMemo(() => {
    const grouped = new Map<string, Paper2PublicQuestion[]>();
    for (const question of props.questions) {
      const sectionId = question.sectionIds[0] ?? "other";
      const existing = grouped.get(sectionId) ?? [];
      existing.push(question);
      grouped.set(sectionId, existing);
    }
    return [...grouped].map(([sectionId, questions]) => ({ sectionId, questions }));
  }, [props.questions]);
  const visibleQuestions = props.kind === "diagnostic"
    ? (diagnosticChunks.find((chunk) => chunk.sectionId === activeSectionId) ?? diagnosticChunks[0])?.questions ?? []
    : props.questions;
  const flaggedQuestionIdentities = useMemo(() => new Set(
    (attempt?.navigation?.flaggedQuestionIdentities ?? []).filter((identity) => knownQuestionIdentities.has(identity)),
  ), [attempt?.navigation?.flaggedQuestionIdentities, knownQuestionIdentities]);

  const persistNavigation = useCallback((identity: string, sectionId: string, flagsOverride?: readonly string[]) => {
    const base = attemptRef.current;
    if (!base || base.status !== "active" || submitInFlight.current || !knownQuestionIdentities.has(identity)) return;
    const sourceFlags = flagsOverride ?? base.navigation?.flaggedQuestionIdentities ?? [];
    const normalizedFlags = [...new Set(sourceFlags.filter((candidate) => knownQuestionIdentities.has(candidate)))];
    const previous = base.navigation;
    if (previous?.currentQuestionIdentity === identity
      && previous.activeSectionId === (sectionId || undefined)
      && previous.flaggedQuestionIdentities.length === normalizedFlags.length
      && previous.flaggedQuestionIdentities.every((candidate) => normalizedFlags.includes(candidate))) return;
    const result = updatePaper2AttemptNavigation(base, {
      currentQuestionIdentity: identity,
      flaggedQuestionIdentities: normalizedFlags,
      ...(sectionId ? { activeSectionId: sectionId } : {}),
      updatedAt: new Date().toISOString(),
    }, base.revision);
    if (result.ok) save(result.attempt, base.revision);
  }, [knownQuestionIdentities, save]);

  const setCurrentQuestion = useCallback((identity: string, persist: "now" | "soon" | "none" = "soon") => {
    const question = props.questions[questionIndexByIdentity.get(identity) ?? -1];
    if (!question) return;
    const sectionId = question.sectionIds[0] ?? activeSectionId;
    setCurrentQuestionIdentity(identity);
    if (props.kind === "diagnostic" && sectionId) setActiveSectionId(sectionId);
    if (persist === "none") return;
    cancelPendingNavigation();
    if (persist === "now") persistNavigation(identity, sectionId);
    else {
      const originAttemptId = attemptRef.current?.attemptId;
      const generation = navigationGeneration.current;
      navigationSaveTimer.current = window.setTimeout(() => {
        navigationSaveTimer.current = null;
        if (generation !== navigationGeneration.current || !originAttemptId || attemptRef.current?.attemptId !== originAttemptId) return;
        persistNavigation(identity, sectionId);
      }, 600);
    }
  }, [activeSectionId, cancelPendingNavigation, persistNavigation, props.kind, props.questions, questionIndexByIdentity]);

  const navigateToQuestion = useCallback((identity: string) => {
    const index = questionIndexByIdentity.get(identity);
    if (index === undefined) return;
    setCurrentQuestion(identity, "now");
    const url = new URL(window.location.href);
    url.hash = `question-${index + 1}`;
    window.history.replaceState(window.history.state, "", url);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(`question-${index + 1}`);
      const heading = target?.querySelector<HTMLElement>("h2");
      target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      heading?.focus({ preventScroll: true });
    }));
  }, [questionIndexByIdentity, setCurrentQuestion]);

  const toggleQuestionFlag = useCallback((identity: string) => {
    const base = attemptRef.current;
    if (!base || base.status !== "active" || submitInFlight.current || !knownQuestionIdentities.has(identity)) return;
    cancelPendingNavigation();
    const flags = new Set((base.navigation?.flaggedQuestionIdentities ?? []).filter((candidate) => knownQuestionIdentities.has(candidate)));
    if (flags.has(identity)) flags.delete(identity); else flags.add(identity);
    const question = props.questions[questionIndexByIdentity.get(identity) ?? -1];
    const sectionId = question?.sectionIds[0] ?? activeSectionId;
    setCurrentQuestionIdentity(identity);
    persistNavigation(identity, sectionId, [...flags]);
  }, [activeSectionId, cancelPendingNavigation, knownQuestionIdentities, persistNavigation, props.questions, questionIndexByIdentity]);

  useEffect(() => {
    const nodes = visibleQuestions.map((question) => {
      const index = questionIndexByIdentity.get(questionIdentity(question));
      return index === undefined ? null : document.getElementById(`question-${index + 1}`);
    }).filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      const identity = visible?.target.getAttribute("data-question-identity");
      if (identity) setCurrentQuestion(identity, "soon");
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.15, 0.5, 0.85] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [questionIndexByIdentity, setCurrentQuestion, visibleQuestions]);

  useEffect(() => () => cancelPendingNavigation(), [cancelPendingNavigation]);

  const answerCount = useMemo(() => Object.values(attempt?.responses ?? {}).filter((response) => response.answer.trim().length > 0).length, [attempt?.responses]);
  const solutionByIdentity = useMemo(() => new Map(solutions.map((solution) => [`${solution.questionId}@${solution.questionVersion}`, solution])), [solutions]);
  const showSelfMarkProgress = attempt ? ["self_marking", "self_marked", "reviewed_attempt"].includes(attempt.status) : false;
  const navigatorItems = useMemo<readonly AssessmentNavigatorItem[]>(() => props.questions.map((question, index) => {
    const identity = questionIdentity(question);
    const solution = solutionByIdentity.get(identity);
    const decided = solution?.markPoints.filter((point) => Boolean(attempt?.selfMarks?.[point.markPointId])).length ?? 0;
    const selfMarkStatus = showSelfMarkProgress && solution
      ? decided === solution.markPoints.length ? "complete" as const : decided === 0 ? "not-started" as const : "partial" as const
      : undefined;
    return { identity, number: index + 1, answered: Boolean(attempt?.responses[identity]?.answer.trim()), flagged: flaggedQuestionIdentities.has(identity), sectionId: question.sectionIds[0], ...(selfMarkStatus ? { selfMarkStatus } : {}) };
  }), [attempt?.responses, attempt?.selfMarks, flaggedQuestionIdentities, props.questions, showSelfMarkProgress, solutionByIdentity]);
  const unansweredItems = navigatorItems.filter((item) => !item.answered);
  const flaggedItems = navigatorItems.filter((item) => item.flagged);
  const markDecisions = Object.values(attempt?.selfMarks ?? {});
  const score = calculatePaper2SelfMarkedScore(markDecisions);
  const totalMarkPoints = solutions.reduce((sum, solution) => sum + solution.markPoints.length, 0);

  async function resumeTimedAttempt(restored: Paper2AttemptRecord) {
    try {
      const response = await fetch(`/api/paper2/timed/${encodeURIComponent(props.contentId)}/resume`, { method: "POST" });
      if (!response.ok) throw new Error(String(response.status));
      const payload = await response.json() as { status: "active" | "submitted"; serverNowEpochMs: number; startedAtEpochMs: number; deadlineEpochMs: number; policyVersion: string };
      if (restored.timer) dispatchTimer({ type: "RESTORE", record: restored.timer, wallNowEpochMs: payload.serverNowEpochMs, monotonicNowMs: performance.now(), terminalStatus: payload.status === "submitted" ? "submitted" : undefined });
      if (payload.status === "submitted") await recoverTerminalAttempt(restored);
    } catch {
      setError(locale === "vi" ? "Không xác minh được phiên làm đề mô phỏng trên máy chủ. Câu trả lời vẫn được giữ trên thiết bị." : "The server could not verify this mock session. Answers remain on this device.");
    }
  }

  async function startTimed() {
    if (!attempt || props.questions.length === 0 || repository.current?.persistent !== true || startInFlight.current) return;
    cancelPendingNavigation();
    startInFlight.current = true;
    setStarting(true);
    setError("");
    try {
      const response = await fetch(`/api/paper2/timed/${encodeURIComponent(props.contentId)}/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirmed_start", paperVersion: props.contentVersion, publicHash: props.contentHash }) });
      if (!response.ok) throw new Error(String(response.status));
      const payload = await response.json() as { attemptId: string; serverNowEpochMs: number; startedAtEpochMs: number; deadlineEpochMs: number; policyVersion: string };
      const nowIso = new Date(payload.serverNowEpochMs).toISOString();
      const started = makeAttempt(props, "active", "healthy", payload.attemptId, nowIso);
      const nextTimer = reducePaper2Timer(createPaper2TimerState(), { type: "START_ACCEPTED", serverNowEpochMs: payload.serverNowEpochMs, startedAtEpochMs: payload.startedAtEpochMs, deadlineEpochMs: payload.deadlineEpochMs, monotonicNowMs: performance.now(), policyVersion: payload.policyVersion, savedAt: nowIso });
      const next = { ...started, durationMinutes: 120, timer: nextTimer.snapshot ?? undefined };
      const persisted = repository.current.saveAttempt(next, -1);
      if (!persisted.ok) throw new Error(persisted.code);
      attemptRef.current = next;
      setAttempt(next);
      dispatchTimer({ type: "RESET" });
      dispatchTimer({ type: "START_ACCEPTED", serverNowEpochMs: payload.serverNowEpochMs, startedAtEpochMs: payload.startedAtEpochMs, deadlineEpochMs: payload.deadlineEpochMs, monotonicNowMs: performance.now(), policyVersion: payload.policyVersion, savedAt: nowIso });
      setStatusMessage(locale === "vi" ? "Đề mô phỏng đã bắt đầu. Đồng hồ tiếp tục chạy khi đổi tab hoặc tải lại trang." : "The mock has started. The clock continues through tab changes and reloads.");
    } catch {
      setError(locale === "vi" ? "Không thể bắt đầu đề mô phỏng. Hãy kiểm tra đăng nhập và thử lại." : "The mock could not start. Check your sign-in and try again.");
    } finally {
      startInFlight.current = false;
      setStarting(false);
    }
  }

  function updateAnswer(question: Paper2PublicQuestion, answer: string) {
    const base = attemptRef.current;
    if (!base || base.status !== "active" || submitInFlight.current) return;
    const identity = questionIdentity(question);
    const result = updatePaper2AttemptResponse(base, identity, { questionId: question.questionId, questionVersion: question.questionVersion, answer, updatedAt: new Date().toISOString() }, base.revision);
    if (result.ok) save(result.attempt, base.revision);
  }

  async function submit() {
    const requestedAttempt = attemptRef.current;
    if (!requestedAttempt || props.questions.length === 0 || !["active", "expired"].includes(requestedAttempt.status) || submitInFlight.current) return;
    cancelPendingNavigation();
    submitInFlight.current = true;
    setSubmitting(true);
    setError("");
    if (timed) dispatchTimer({ type: "SUBMIT_REQUESTED" });
    try {
      let payload: SubmitPayload;
      if (props.mode === "set_guided") {
        payload = { receipt: { receiptId: `receipt:guided-${requestedAttempt.attemptId.replace(/[^A-Za-z0-9_-]/g, "-")}`, terminalReason: "guided", rubricVersion: props.contentVersion, rubricHash: props.immediateRubricHash ?? props.contentHash }, solutions: props.immediateSolutions ?? [] };
      } else {
        const endpoint = timed ? `/api/paper2/timed/${encodeURIComponent(props.contentId)}/submit` : `/api/paper2/sets/${encodeURIComponent(props.contentId)}/submit`;
        const body = timed ? { action: "confirmed_submit", attemptId: requestedAttempt.attemptId, paperVersion: props.contentVersion, publicHash: props.contentHash } : { action: "confirmed_submit", attemptId: requestedAttempt.attemptId, setVersion: props.contentVersion };
        const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!response.ok) throw new Error(String(response.status));
        payload = await response.json() as SubmitPayload;
      }
      const latest = attemptRef.current;
      if (!latest || latest.attemptId !== requestedAttempt.attemptId || !["active", "expired"].includes(latest.status)) throw new Error("ATTEMPT_CHANGED_DURING_SUBMIT");
      const binding: Paper2AttemptRubricBinding = { rubricVersion: payload.receipt.rubricVersion, rubricHash: payload.receipt.rubricHash, terminalReceiptId: payload.receipt.receiptId };
      const event = latest.status === "expired" ? { type: "submit_expired_attempt" as const, at: new Date().toISOString(), rubricBinding: binding } : { type: "confirmed_submit" as const, at: new Date().toISOString(), rubricBinding: binding };
      const submitted = transitionPaper2Attempt(latest, event);
      if (!submitted.ok) throw new Error(submitted.code);
      const marking = transitionPaper2Attempt(submitted.attempt, { type: "rubric_loaded_and_marking_started", at: new Date().toISOString(), rubricBinding: binding });
      if (!marking.ok) throw new Error(marking.code);
      if (!save(marking.attempt, latest.revision)) throw new Error("ATTEMPT_SAVE_FAILED");
      setSolutions(payload.solutions);
      if (timed) dispatchTimer({ type: "SUBMIT_ACCEPTED", serverNowEpochMs: Date.now() });
      setConfirmSubmit(false);
      setStatusMessage(locale === "vi" ? "Đã nộp. Câu trả lời đã khóa; hãy tự chấm từng ý." : "Submitted. Answers are locked; self-mark each point now.");
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch {
      setError(locale === "vi" ? "Chưa thể nộp hoặc tải hướng dẫn chấm. Bài làm vẫn được giữ trên thiết bị; hãy thử lại." : "Submission or rubric loading failed. The attempt remains on this device; try again.");
      if (timed) dispatchTimer({ type: "SUBMIT_REJECTED", code: "SUBMIT_FAILED", serverExpired: attemptRef.current?.status === "expired" });
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  }

  async function fetchSolutionsAfterTerminal(restored: Paper2AttemptRecord): Promise<SubmitPayload | null> {
    try {
      const endpoint = timed ? `/api/paper2/timed/${encodeURIComponent(props.contentId)}/submit` : `/api/paper2/sets/${encodeURIComponent(props.contentId)}/submit`;
      const body = timed ? { action: "confirmed_submit", attemptId: restored.attemptId, paperVersion: props.contentVersion, publicHash: props.contentHash } : { action: "confirmed_submit", attemptId: restored.attemptId, setVersion: props.contentVersion };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) return null;
      return await response.json() as SubmitPayload;
    } catch { return null; /* The learner can retry explicitly without losing the attempt. */ }
  }

  async function recoverTerminalAttempt(restored = attemptRef.current) {
    if (!restored || terminalRecoveryInFlight.current) return;
    terminalRecoveryInFlight.current = true;
    setRecoveringTerminal(true);
    setTerminalRecoveryPending(false);
    setError("");
    try {
      const payload = await fetchSolutionsAfterTerminal(restored);
      if (!payload) throw new Error("RUBRIC_FETCH_FAILED");
      const latest = attemptRef.current;
      if (!latest || latest.attemptId !== restored.attemptId) throw new Error("ATTEMPT_CHANGED_DURING_RECOVERY");
      if (["active", "expired", "submitted"].includes(latest.status)) {
        const binding: Paper2AttemptRubricBinding = { rubricVersion: payload.receipt.rubricVersion, rubricHash: payload.receipt.rubricHash, terminalReceiptId: payload.receipt.receiptId };
        const submitted = latest.status === "submitted"
          ? { ok: true as const, attempt: latest }
          : transitionPaper2Attempt(latest, latest.status === "expired"
            ? { type: "submit_expired_attempt", at: new Date().toISOString(), rubricBinding: binding }
            : { type: "confirmed_submit", at: new Date().toISOString(), rubricBinding: binding });
        if (!submitted.ok) throw new Error(submitted.code);
        const marking = transitionPaper2Attempt(submitted.attempt, { type: "rubric_loaded_and_marking_started", at: new Date().toISOString(), rubricBinding: binding });
        if (!marking.ok || !save(marking.attempt, latest.revision)) throw new Error(marking.ok ? "ATTEMPT_SAVE_FAILED" : marking.code);
      }
      setSolutions(payload.solutions);
      setStatusMessage(locale === "vi" ? "Đã khôi phục hướng dẫn chấm. Bạn có thể tiếp tục tự chấm." : "Marking guidance restored. You can continue self-marking.");
    } catch {
      setTerminalRecoveryPending(true);
      setError(locale === "vi" ? "Chưa tải được hướng dẫn chấm cho lượt đã nộp. Bài làm vẫn an toàn trên thiết bị; hãy thử lại." : "Marking guidance for this submitted attempt could not be loaded. Your work remains on this device; try again.");
    } finally {
      terminalRecoveryInFlight.current = false;
      setRecoveringTerminal(false);
    }
  }

  function decideMark(pointId: string, marksAvailable: number, awarded: boolean) {
    const base = attemptRef.current;
    if (!base || base.status !== "self_marking") return;
    const decision: Paper2SelfMarkDecision = { markPointId: pointId, decision: awarded ? "awarded" : "not_awarded", marksAvailable, marksAwarded: awarded ? marksAvailable : 0, decidedAt: new Date().toISOString() };
    const next: Paper2AttemptRecord = { ...base, selfMarks: { ...(base.selfMarks ?? {}), [pointId]: decision }, revision: base.revision + 1, updatedAt: decision.decidedAt };
    save(next, base.revision);
  }

  function finishSelfMark() {
    if (!attempt || attempt.status !== "self_marking" || markDecisions.length !== totalMarkPoints) return;
    const prepared = { ...attempt, finalChecklist: { ...attempt.finalChecklist, scorableMarkPointsComplete: true } };
    const result = transitionPaper2Attempt(prepared, { type: "all_scorable_mark_points_decided", at: new Date().toISOString() });
    if (result.ok) save(result.attempt, attempt.revision);
  }

  function finishReview() {
    if (!attempt || attempt.status !== "self_marked" || reflection.trim().length < 10) return;
    const prepared = { ...attempt, reflection, finalChecklist: { ...attempt.finalChecklist, reflectionComplete: true, summaryConfirmed: true } };
    const result = transitionPaper2Attempt(prepared, { type: "reflection_and_summary_confirmed", at: new Date().toISOString() });
    if (result.ok) save(result.attempt, attempt.revision);
  }

  function reset() {
    if (!attempt || props.questions.length === 0 || starting || submitting || startInFlight.current || submitInFlight.current) return;
    cancelPendingNavigation();
    dispatchTimer({ type: "RESET" });
    const now = new Date().toISOString();
    if (["active", "expired"].includes(attempt.status)) {
      const abandoned = transitionPaper2Attempt(attempt, { type: "confirmed_reset_or_discard", at: now });
      if (abandoned.ok) repository.current?.saveAttempt(abandoned.attempt, attempt.revision);
    }
    const next = makeAttempt(props, timed ? "not_started" : "active", repository.current?.persistent ? "healthy" : "memory_only");
    repository.current?.saveAttempt(next, -1);
    attemptRef.current = next;
    setAttempt(next);
    setCurrentQuestionIdentity(questionIdentity(props.questions[0]));
    setActiveSectionId(props.questions[0]?.sectionIds[0] ?? "");
    setSolutions(props.immediateSolutions ?? []);
    setReflection(""); setError(""); setStatusMessage(""); setConfirmReset(false); setConfirmSubmit(false); setTerminalRecoveryPending(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function cancelSubmitConfirmation() {
    setConfirmSubmit(false);
    requestAnimationFrame(() => submitTriggerRef.current?.focus());
  }

  function cancelResetConfirmation() {
    setConfirmReset(false);
    requestAnimationFrame(() => resetTriggerRef.current?.focus());
  }

  if (props.questions.length === 0) return <section className={styles.emptyState} role="alert" aria-labelledby="paper2-empty-assessment-title">
    <AlertTriangle size={28} aria-hidden="true" />
    <h1 id="paper2-empty-assessment-title">{locale === "vi" ? "Bộ câu hỏi chưa sẵn sàng" : "This question set is not ready"}</h1>
    <p>{locale === "vi" ? "Không có câu hỏi hợp lệ nên hệ thống chưa tạo lượt làm bài. Hãy quay lại thư viện và chọn bộ khác." : "No valid questions are available, so no attempt was created. Return to the library and choose another set."}</p>
    <Link href={timed ? `/paper-2/mocks?lang=${locale}` : `/paper-2/practice?lang=${locale}`}>{locale === "vi" ? "Quay lại thư viện" : "Back to library"}</Link>
  </section>;

  if (!attempt) return <p role="status" className={styles.loading}>{locale === "vi" ? "Đang mở không gian làm bài…" : "Opening the assessment workspace…"}</p>;

  if (timed && attempt.status === "not_started") return <section className={styles.startCard} aria-labelledby="paper2-start-title">
    <ShieldCheck size={36} aria-hidden="true" />
    <span>{locale === "vi" ? "120 PHÚT" : "120 MINUTES"} · {props.totalMarks} {locale === "vi" ? "ĐIỂM LUYỆN TẬP" : "PRACTICE MARKS"}</span>
    <h1 id="paper2-start-title">{props.title[locale]}</h1>
    <p>{props.instructions[locale]}</p>
    <ul><li>{locale === "vi" ? "Đồng hồ chạy liên tục kể cả khi đổi tab hoặc tải lại." : "The wall clock continues through tab changes and reloads."}</li><li>{locale === "vi" ? "Đáp án chỉ mở sau khi bạn chủ động nộp, kể cả khi đã hết giờ." : "Solutions unlock only after explicit submission, including after time expires."}</li><li>{locale === "vi" ? "Câu trả lời được lưu trên thiết bị này; không gửi nội dung bài làm lên máy chủ." : "Answers stay on this device and are not uploaded."}</li></ul>
    {storageNotice && <p className={styles.warning} role="alert"><AlertTriangle size={18} aria-hidden="true" />{storageNotice}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <button className={styles.primaryButton} type="button" disabled={repository.current?.persistent !== true || starting} onClick={() => void startTimed()}>{starting ? (locale === "vi" ? "Đang bắt đầu…" : "Starting…") : (locale === "vi" ? "Bắt đầu đề mô phỏng 120 phút" : "Start the 120-minute mock")}</button>
    <Link href={`/paper-2/mocks?lang=${locale}`}>{locale === "vi" ? "Quay lại thư viện đề mô phỏng" : "Back to mock library"}</Link>
  </section>;

  const remainingMs = selectPaper2TimerRemainingMs(timer);
  return <div className={styles.workspace} data-attempt-status={attempt.status}>
    <header className={styles.assessmentHeading}>
      <span>{workspaceModeLabel(props.mode, locale)}</span>
      <h1>{props.title[locale]}</h1>
      <p>{props.instructions[locale]}</p>
    </header>
    <div className={styles.toolbar}>
      <div><span>{locale === "vi" ? "Tiến độ" : "Progress"}</span><strong>{answerCount}/{props.questions.length} {locale === "vi" ? "câu đã trả lời" : "answered"}</strong></div>
      <div><span>{locale === "vi" ? "Trạng thái" : "Status"}</span><strong>{statusLabel(attempt.status, locale)}</strong></div>
      {timed && <div className={styles.timer} data-expired={timer.status === "expired" || undefined}><Clock3 size={18} aria-hidden="true" /><span>{locale === "vi" ? "Còn lại" : "Remaining"}</span><strong role="timer">{formatTime(remainingMs)}</strong></div>}
      <p><Save size={16} aria-hidden="true" />{repository.current?.persistent ? (locale === "vi" ? "Đã lưu trên thiết bị này" : "Saved on this device") : (locale === "vi" ? "Chỉ lưu trong bộ nhớ" : "Memory-only session")}</p>
    </div>
    <div className={styles.srStatus} aria-live="polite">{statusMessage}</div>
    {storageNotice && <p className={styles.warning} role="alert"><AlertTriangle size={18} aria-hidden="true" />{storageNotice}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {attempt.status === "submitted" && <section className={styles.recoveryPanel} role="status" aria-live="polite" aria-busy={recoveringTerminal}>
      <strong>{recoveringTerminal ? (locale === "vi" ? "Đang khôi phục hướng dẫn chấm…" : "Restoring marking guidance…") : (locale === "vi" ? "Lượt đã nộp đang chờ hướng dẫn chấm" : "Submitted attempt awaiting marking guidance")}</strong>
      <p>{locale === "vi" ? "Câu trả lời đã khóa và vẫn được giữ trên thiết bị." : "Answers are locked and remain saved on this device."}</p>
      {terminalRecoveryPending && <button className={styles.primaryButton} type="button" disabled={recoveringTerminal} onClick={() => void recoverTerminalAttempt()}>{locale === "vi" ? "Thử tải lại hướng dẫn chấm" : "Retry marking guidance"}</button>}
    </section>}
    {timed && active && <aside className={styles.closedNotice}><ShieldCheck size={20} aria-hidden="true" /><div><strong>{locale === "vi" ? "Chế độ thi: chưa có lời giải" : "Exam mode: solutions are sealed"}</strong><span>{locale === "vi" ? "Hết giờ sẽ khóa câu trả lời nhưng không tự mở đáp án. Bạn cần bấm Nộp bài." : "Expiry locks responses but does not reveal solutions. Submit explicitly to open them."}</span></div></aside>}

    <div className={styles.assessmentBody}>
      <AssessmentNavigator items={navigatorItems} currentIdentity={currentQuestionIdentity} locale={locale} flagsEditable={active && !submitting} onNavigate={navigateToQuestion} onToggleFlag={toggleQuestionFlag} />
      <div className={styles.assessmentMain}>
        {props.kind === "diagnostic" && <section className={styles.diagnosticOverview} aria-labelledby="diagnostic-sections-title">
          <div><span>{locale === "vi" ? "TỔNG QUAN BÀI CHẨN ĐOÁN" : "DIAGNOSTIC OVERVIEW"}</span><h2 id="diagnostic-sections-title">{locale === "vi" ? "Làm theo từng phần của chương trình" : "Work through one syllabus section at a time"}</h2><p>{locale === "vi" ? `Bài có ${props.questions.length} câu trong ${diagnosticChunks.length} phần. Câu trả lời và vị trí hiện tại vẫn được lưu khi bạn đổi phần.` : `This diagnostic has ${props.questions.length} questions across ${diagnosticChunks.length} sections. Answers and your current position remain saved as you move between sections.`}</p></div>
          {attempt.navigation?.currentQuestionIdentity && knownQuestionIdentities.has(attempt.navigation.currentQuestionIdentity) && <button className={styles.resumeButton} type="button" onClick={() => navigateToQuestion(attempt.navigation?.currentQuestionIdentity ?? questionIdentities[0])}>{locale === "vi" ? `Tiếp tục ở câu ${(questionIndexByIdentity.get(attempt.navigation.currentQuestionIdentity) ?? 0) + 1}` : `Resume at question ${(questionIndexByIdentity.get(attempt.navigation.currentQuestionIdentity) ?? 0) + 1}`}</button>}
          <div className={styles.diagnosticSections}>{diagnosticChunks.map((chunk) => {
            const answered = chunk.questions.filter((question) => Boolean(attempt.responses[questionIdentity(question)]?.answer.trim())).length;
            const firstIdentity = questionIdentity(chunk.questions[0]);
            return <button type="button" key={chunk.sectionId} aria-current={chunk.sectionId === activeSectionId ? "step" : undefined} onClick={() => navigateToQuestion(firstIdentity)}><strong>{locale === "vi" ? `Phần ${chunk.sectionId}` : `Section ${chunk.sectionId}`}</strong><span>{answered}/{chunk.questions.length} {locale === "vi" ? "đã trả lời" : "answered"}</span></button>;
          })}</div>
        </section>}

        <div className={styles.questionList}>{visibleQuestions.map((question) => {
          const identity = questionIdentity(question);
          const index = questionIndexByIdentity.get(identity) ?? 0;
          const solution = solutions.find((item) => item.questionId === question.questionId && item.questionVersion === question.questionVersion);
          const flagged = flaggedQuestionIdentities.has(identity);
          return <article className={styles.questionCard} id={`question-${index + 1}`} data-question-identity={identity} data-current={identity === currentQuestionIdentity || undefined} key={identity}>
            <header><div><span>{locale === "vi" ? `Câu ${index + 1}` : `Question ${index + 1}`} · {question.commandWord}</span><h2 tabIndex={-1} id={`question-${index + 1}-heading`}>{question.title[locale]}</h2></div><div className={styles.questionHeaderActions}><strong>{question.marks ?? "—"} {locale === "vi" ? "điểm AlgoCore" : "AlgoCore marks"}</strong><button type="button" aria-pressed={flagged} disabled={!active || submitting} onClick={() => toggleQuestionFlag(identity)}><Flag size={16} aria-hidden="true" />{flagged ? (locale === "vi" ? "Đã đánh dấu" : "Flagged") : (locale === "vi" ? "Đánh dấu xem lại" : "Flag for review")}</button></div></header>
            {question.stimulus && <div className={styles.stimulus}>{question.stimulus[locale]}</div>}
            <p className={styles.prompt}>{question.prompt[locale]}</p>
            <p className={styles.answerProduct}><strong>{locale === "vi" ? "Sản phẩm cần tạo: " : "Required answer product: "}</strong>{question.answerProduct[locale]}</p>
            <QuestionSources sources={props.sourceLabels[question.questionId] ?? []} locale={locale} />
            <label><span>{locale === "vi" ? "Câu trả lời của bạn" : "Your answer"}</span><textarea rows={9} value={attempt.responses[identity]?.answer ?? ""} disabled={locked} onFocus={() => setCurrentQuestion(identity, "now")} onChange={(event) => updateAnswer(question, event.target.value)} /></label>
            {solution && <SolutionAndSelfMark solution={solution} locale={locale} attempt={attempt} onDecide={decideMark} />}
          </article>;
        })}</div>
      </div>
    </div>

    {["active", "expired"].includes(attempt.status) && <section className={styles.submitPanel}>
      <h2>{locale === "vi" ? "Nộp bài để bắt đầu tự chấm" : "Submit to begin self-marking"}</h2>
      <p>{locale === "vi" ? "Sau khi nộp, câu trả lời bị khóa. Với bài tự kiểm và đề mô phỏng, lời giải chỉ được tải ở bước này." : "Submission locks responses. Closed sets and mocks load solutions only at this step."}</p>
      {!confirmSubmit ? <button ref={submitTriggerRef} className={styles.primaryButton} type="button" onClick={() => setConfirmSubmit(true)}><Send size={18} aria-hidden="true" />{locale === "vi" ? "Kiểm tra và nộp" : "Review and submit"}</button> : <div className={styles.confirmBox} role="region" aria-labelledby="paper2-submit-confirm-title" aria-describedby="paper2-submit-confirm-summary">
        <div className={styles.submissionStatus}><strong ref={submitConfirmHeadingRef} tabIndex={-1} id="paper2-submit-confirm-title">{locale === "vi" ? "Kiểm tra trước khi nộp" : "Check before submission"}</strong><p id="paper2-submit-confirm-summary">{unansweredItems.length} {locale === "vi" ? "câu chưa trả lời" : "unanswered"} · {flaggedItems.length} {locale === "vi" ? "câu đánh dấu xem lại" : "flagged for review"}</p>
          {unansweredItems.length > 0 && <p><strong>{locale === "vi" ? "Chưa trả lời:" : "Unanswered:"}</strong> {unansweredItems.map((item) => item.number).join(", ")}</p>}
          {flaggedItems.length > 0 && <p><strong>{locale === "vi" ? "Xem lại:" : "Flagged:"}</strong> {flaggedItems.map((item) => item.number).join(", ")}</p>}
          <div>{unansweredItems[0] && <button type="button" onClick={() => navigateToQuestion(unansweredItems[0].identity)}>{locale === "vi" ? "Đi tới câu chưa làm đầu tiên" : "Go to first unanswered"}</button>}{flaggedItems[0] && <button type="button" onClick={() => navigateToQuestion(flaggedItems[0].identity)}>{locale === "vi" ? "Đi tới câu đánh dấu đầu tiên" : "Go to first flagged"}</button>}</div>
        </div>
        <strong>{locale === "vi" ? "Bạn vẫn muốn nộp bài?" : "Submit this attempt now?"}</strong><div><button className={styles.primaryButton} type="button" disabled={submitting} onClick={() => void submit()}>{submitting ? (locale === "vi" ? "Đang nộp…" : "Submitting…") : (locale === "vi" ? "Xác nhận nộp" : "Confirm submit")}</button><button type="button" disabled={submitting} onClick={cancelSubmitConfirmation}>{locale === "vi" ? "Tiếp tục làm" : "Keep working"}</button></div>
      </div>}
    </section>}

    {attempt.status === "self_marking" && <section className={styles.markSummary} ref={statusRef} tabIndex={-1}>
      <CheckCircle2 size={26} aria-hidden="true" /><div><h2>{locale === "vi" ? "Tự chấm theo từng ý" : "Self-mark each point"}</h2><p>{markDecisions.length}/{totalMarkPoints} {locale === "vi" ? "ý đã quyết định" : "mark points decided"} · {score.awarded}/{score.available || props.totalMarks} {locale === "vi" ? "điểm hiện tại" : "current marks"}</p></div>
      <button className={styles.primaryButton} type="button" disabled={markDecisions.length !== totalMarkPoints} onClick={finishSelfMark}>{locale === "vi" ? "Hoàn tất tự chấm" : "Finish self-marking"}</button>
    </section>}

    {attempt.status === "self_marked" && <section className={styles.reflection}>
      <h2>{locale === "vi" ? "Chốt điều cần cải thiện" : "Record the next improvement"}</h2>
      <p>{locale === "vi" ? `Kết quả tự chấm: ${score.awarded}/${score.available}. Viết một lỗi cụ thể và cách bạn sẽ sửa ở lần sau.` : `Self-marked score: ${score.awarded}/${score.available}. Record one specific error and how you will fix it next time.`}</p>
      <label><span>{locale === "vi" ? "Phản hồi của tôi" : "My reflection"}</span><textarea rows={4} value={reflection} onChange={(event) => setReflection(event.target.value)} /></label>
      <button className={styles.primaryButton} type="button" disabled={reflection.trim().length < 10} onClick={finishReview}>{locale === "vi" ? "Lưu và hoàn tất xem lại" : "Save and finish review"}</button>
    </section>}

    {attempt.status === "reviewed_attempt" && <section className={styles.complete}><CheckCircle2 size={28} aria-hidden="true" /><div><h2>{locale === "vi" ? "Đã hoàn tất vòng ôn tập" : "Review cycle complete"}</h2><p>{locale === "vi" ? `Điểm tự chấm ${score.awarded}/${score.available}. Kết quả này tách biệt với trạng thái đã đọc bài học.` : `Self-marked ${score.awarded}/${score.available}. This result is separate from lesson review status.`}</p></div></section>}

    <footer className={styles.footerActions}>
      <Link href={timed ? `/paper-2/mocks?lang=${locale}` : `/paper-2/practice?lang=${locale}`}>{locale === "vi" ? "← Về thư viện" : "← Back to library"}</Link>
      {!confirmReset ? <button ref={resetTriggerRef} className={styles.dangerButton} type="button" disabled={starting || submitting} onClick={() => setConfirmReset(true)}><RotateCcw size={17} aria-hidden="true" />{locale === "vi" ? "Tạo lượt làm mới" : "Start a new attempt"}</button> : <div className={styles.confirmBox} role="region" aria-labelledby="paper2-reset-confirm-title" aria-describedby="paper2-reset-confirm-summary"><strong ref={resetConfirmHeadingRef} tabIndex={-1} id="paper2-reset-confirm-title">{locale === "vi" ? "Tạo lượt làm mới?" : "Start a new attempt?"}</strong><span id="paper2-reset-confirm-summary">{locale === "vi" ? "Lượt hiện tại vẫn được giữ trong lịch sử trên thiết bị." : "The current attempt remains in local history."}</span><button className={styles.dangerButton} type="button" disabled={starting || submitting} onClick={reset}>{locale === "vi" ? "Xác nhận lượt mới" : "Confirm new attempt"}</button><button type="button" disabled={starting || submitting} onClick={cancelResetConfirmation}>{locale === "vi" ? "Hủy" : "Cancel"}</button></div>}
    </footer>
  </div>;
}

function QuestionSources({ sources, locale }: { readonly sources: readonly Paper2PublicSourceLabel[]; readonly locale: Locale }) {
  if (!sources.length) return null;
  return <details className={styles.questionSources}><summary>{locale === "vi" ? `Nguồn tham khảo và phạm vi (${sources.length})` : `References and scope (${sources.length})`}</summary><ul>{sources.map((source) => <li key={source.sourceId}><strong>{source.kind === "algocore_authored" ? (locale === "vi" ? "Bài luyện do AlgoCore biên soạn" : "AlgoCore-authored practice") : source.label}</strong><span>{source.kind === "algocore_authored" ? (locale === "vi" ? "Điểm luyện tập và hướng dẫn chấm do AlgoCore biên soạn; đây không phải tài liệu chính thức của Cambridge." : "Practice marks and marking guidance are written by AlgoCore; this is not official Cambridge material.") : source.label}</span></li>)}</ul></details>;
}

function SolutionAndSelfMark({ solution, locale, attempt, onDecide }: { readonly solution: Paper2PrivateSolution; readonly locale: Locale; readonly attempt: Paper2AttemptRecord; readonly onDecide: (pointId: string, marks: number, awarded: boolean) => void }) {
  const marking = attempt.status === "self_marking";
  return <section className={styles.solution} aria-label={locale === "vi" ? "Lời giải và tiêu chí tự chấm" : "Solution and self-mark rubric"}>
    <span>{locale === "vi" ? "LỜI GIẢI ALGOCORE" : "ALGOCORE SOLUTION"}</span>
    <h3>{locale === "vi" ? "Đáp án mẫu" : "Model answer"}</h3><p>{solution.modelAnswer[locale]}</p>
    <ol>{solution.markPoints.map((point) => {
      const decision = attempt.selfMarks?.[point.markPointId];
      return <li key={point.markPointId} data-decision={decision?.decision}><div><strong>{point.marks} {locale === "vi" ? "điểm" : "mark"}</strong><p>{point.description[locale]}</p></div>{marking && <div className={styles.markButtons}><button type="button" aria-pressed={decision?.decision === "awarded"} onClick={() => onDecide(point.markPointId, point.marks, true)}>{locale === "vi" ? "Đạt" : "Award"}</button><button type="button" aria-pressed={decision?.decision === "not_awarded"} onClick={() => onDecide(point.markPointId, point.marks, false)}>{locale === "vi" ? "Chưa đạt" : "Do not award"}</button></div>}</li>;
    })}</ol>
    <details><summary>{locale === "vi" ? "Đáp án tương đương và lỗi thường gặp" : "Accepted alternatives and common errors"}</summary><h4>{locale === "vi" ? "Có thể chấp nhận" : "Accepted alternatives"}</h4><ul>{solution.acceptedAlternatives.map((item, index) => <li key={index}>{item[locale]}</li>)}</ul><h4>{locale === "vi" ? "Lỗi thường gặp" : "Common errors"}</h4><ul>{solution.commonErrors.map((item, index) => <li key={index}>{item[locale]}</li>)}</ul></details>
  </section>;
}

function makeAttempt(props: Paper2AssessmentWorkspaceProps, status: "not_started" | "active", storageHealth: Paper2AttemptRecord["storageHealth"], attemptId = `attempt:${crypto.randomUUID()}`, now = new Date().toISOString()): Paper2AttemptRecord {
  const firstQuestion = props.questions[0];
  return { schemaVersion: 2, attemptId, learnerScopeId: LEARNER_SCOPE_ID, contentKind: props.kind, contentId: props.contentId, contentVersion: props.contentVersion, contentHash: props.contentHash, mode: props.mode, status, revision: 0, locale: props.locale, startedAt: status === "active" ? now : null, updatedAt: now, durationMinutes: props.durationMinutes, responses: {}, navigation: { ...(firstQuestion ? { currentQuestionIdentity: questionIdentity(firstQuestion), activeSectionId: firstQuestion.sectionIds[0] } : {}), flaggedQuestionIdentities: [], updatedAt: now }, finalChecklist: { submitted: false, scorableMarkPointsComplete: false, reflectionComplete: false, summaryConfirmed: false }, storageHealth, lastMigrationVersion: 2 };
}

function statusLabel(status: Paper2AttemptRecord["status"], locale: Locale) {
  const labels: Record<Paper2AttemptRecord["status"], { en: string; vi: string }> = { not_started: { en: "Not started", vi: "Chưa bắt đầu" }, active: { en: "In progress", vi: "Đang làm" }, expired: { en: "Time expired", vi: "Đã hết giờ" }, submitted: { en: "Submitted", vi: "Đã nộp" }, self_marking: { en: "Self-marking", vi: "Đang tự chấm" }, self_marked: { en: "Self-marked", vi: "Đã tự chấm" }, reviewed_attempt: { en: "Reviewed", vi: "Đã hoàn tất xem lại" }, abandoned: { en: "Abandoned", vi: "Đã bỏ lượt" }, recovery_required: { en: "Recovery needed", vi: "Cần khôi phục" } };
  return labels[status][locale];
}

function formatTime(milliseconds: number) { const seconds = Math.max(0, Math.ceil(milliseconds / 1000)); return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((value) => String(value).padStart(2, "0")).join(":"); }

function questionIdentity(question: Paper2PublicQuestion | undefined) {
  return question ? `${question.questionId}@${question.questionVersion}` : "";
}

function workspaceModeLabel(mode: Paper2AssessmentWorkspaceProps["mode"], locale: Locale) {
  const labels: Record<Paper2AssessmentWorkspaceProps["mode"], { en: string; vi: string }> = {
    set_guided: { en: "GUIDED PAPER 2 PRACTICE", vi: "LUYỆN PAPER 2 CÓ HƯỚNG DẪN" },
    set_closed: { en: "PAPER 2 SELF-CHECK", vi: "TỰ KIỂM PAPER 2" },
    diagnostic_closed: { en: "PAPER 2 DIAGNOSTIC", vi: "BÀI CHẨN ĐOÁN PAPER 2" },
    mock_timed: { en: "TIMED PAPER 2 MOCK", vi: "ĐỀ MÔ PHỎNG PAPER 2 CÓ GIỜ" },
  };
  return labels[mode][locale];
}
