"use client";

import { FormEvent, KeyboardEvent, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";

import { PythonArtifact } from "../paper4-learning/PythonArtifact";
import { adaptBinarySearchEvent, BINARY_SEARCH_PROGRESS_KEY, createBinarySearchStoredProgress, localizedSceneText, projectLearningEvents, restoreBinarySearchProgress, type BinarySearchSceneModel } from "./binarySearchAdapter";
import styles from "./Paper4VisualRuntime.module.css";
import { createInitialRuntimeState, runtimeReducer } from "./reducer";
import { SearchWindow } from "./SearchWindow";
import { defaultScenario, loadTraceChunk, selectScenarioEvents } from "./traceLoader";
import type { JsonValue, Locale, Paper4VisualRuntimeProps, PatternMetadata, PythonArtifactDto, RuntimeState, TraceChunk, TraceEvent } from "./types";

const copy = {
  vi: {
    eyebrow: "Phòng luyện Paper 4", pattern: "Dạng bài", previous: "Bước trước", next: "Bước tiếp", play: "Chạy", pause: "Tạm dừng", reset: "Làm lại",
    step: "Bước", of: "trên", code: "Mã Python", state: "Trạng thái", trace: "Luồng thực thi", output: "Kết quả", invariant: "Điều phải luôn đúng",
    before: "Trước bước này", change: "Điều vừa thay đổi", after: "Sau bước này", noOutput: "Chưa có output ở bước này.", current: "Đang xét", prediction: "Dừng và dự đoán",
    stateTransition: "So sánh trạng thái", rawJson: "Xem JSON đầy đủ", fields: "trường", items: "mục", noChange: "Không có thay đổi dữ liệu ở bước này.",
    yourPrediction: "Dự đoán của bạn", checkPrediction: "Kiểm tra dự đoán", correct: "Đúng. Hãy đối chiếu trạng thái vừa được mở.", incorrect: "Chưa đúng.",
    traceComplete: "Bạn đã đến cuối trace. Dùng Làm lại để luyện lại.", scenarioInput: "Đổi tình huống đầu vào", inputHint: "Chọn trace normal, boundary hoặc failure.",
    applyInput: "Áp dụng tình huống", loading: "Đang tải trace…", loadError: "Không thể tải trace.", retry: "Thử tải lại", migration: "Visual v2 đang chờ route truyền pattern metadata và Python artifact.",
    audit: "Chi tiết trace và bằng chứng", fullBinding: "Binding dòng đầy đủ", codeLocked: "Hãy ghi lại dự đoán để mở đoạn mã tạo ra thay đổi này.", normal: "Bình thường", boundary: "Biên", failure: "Lỗi",
  },
  en: {
    eyebrow: "Paper 4 practice lab", pattern: "Question pattern", previous: "Previous", next: "Next", play: "Play", pause: "Pause", reset: "Reset",
    step: "Step", of: "of", code: "Python source", state: "State", trace: "Execution trace", output: "Output", invariant: "Invariant to protect",
    before: "Before this step", change: "What changed", after: "After this step", noOutput: "No output is produced at this step.", current: "Current", prediction: "Pause and predict",
    stateTransition: "Compare state", rawJson: "View raw JSON", fields: "fields", items: "items", noChange: "No data changes at this step.",
    yourPrediction: "Your prediction", checkPrediction: "Check prediction", correct: "Correct. Compare the revealed state.", incorrect: "Not yet.",
    traceComplete: "You reached the end of the trace. Reset to practise again.", scenarioInput: "Change input scenario", inputHint: "Choose the normal, boundary, or failure trace.",
    applyInput: "Apply scenario", loading: "Loading the trace…", loadError: "The trace could not be loaded.", retry: "Try again", migration: "The v2 visual is waiting for pattern metadata and a Python artifact from the route.",
    audit: "Trace and evidence details", fullBinding: "Complete line binding", codeLocked: "Record a prediction to reveal the code that creates this change.", normal: "Normal", boundary: "Boundary", failure: "Failure",
  },
} as const;

function isRecord(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function localText(value: JsonValue | undefined, locale: Locale): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => localText(item, locale)).filter(Boolean).join("\n");
  if (isRecord(value) && value[locale] !== undefined) return localText(value[locale], locale);
  return JSON.stringify(value, null, 2);
}

function structuredValue(value: JsonValue | undefined): JsonValue | undefined {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value).filter(([key]) => key !== "vi" && key !== "en");
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function normalize(value: string) {
  return value.trim().toLocaleUpperCase("en-US").replace(/[\s-]+/g, "_");
}

type StoredRuntimeProgress = Pick<RuntimeState, "patternId" | "scenarioId" | "eventIndex" | "eventId" | "stepPhase" | "predictionStatus" | "predictionAnswer">;

function runtimeProgressKey(patternId: string) {
  return `algocore.paper4.visual.${patternId}.progress.v1`;
}

function restoreRuntimeProgress(value: unknown, chunk: TraceChunk): StoredRuntimeProgress | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<StoredRuntimeProgress>;
  if (candidate.patternId !== chunk.pattern_id || typeof candidate.scenarioId !== "string" || !Number.isInteger(candidate.eventIndex) || typeof candidate.eventId !== "string") return null;
  if (candidate.stepPhase !== "predict" && candidate.stepPhase !== "revealed") return null;
  if (candidate.predictionStatus !== "idle" && candidate.predictionStatus !== "correct" && candidate.predictionStatus !== "incorrect") return null;
  if (typeof candidate.predictionAnswer !== "string") return null;
  const scenario = chunk.scenarios.find((item) => item.scenario_id === candidate.scenarioId);
  const eventIndex = candidate.eventIndex as number;
  if (!scenario || eventIndex < 0 || eventIndex >= scenario.event_ids.length || scenario.event_ids[eventIndex] !== candidate.eventId) return null;
  return { patternId: candidate.patternId, scenarioId: candidate.scenarioId, eventIndex, eventId: candidate.eventId, stepPhase: candidate.stepPhase, predictionStatus: candidate.predictionStatus, predictionAnswer: candidate.predictionAnswer };
}

function patternLabel(pattern: PatternMetadata, locale: Locale) {
  return pattern.title?.[locale] ?? pattern.pattern_id.replaceAll("_", " ").toLocaleLowerCase(locale === "vi" ? "vi-VN" : "en-US");
}

function DataBlock({ value }: { readonly value: JsonValue | undefined }) {
  if (value === undefined || value === null) return <span aria-hidden="true">—</span>;
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}

function compactValue(value: JsonValue, locale: Locale): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const allPrimitive = value.every((item) => item === null || typeof item !== "object");
    if (allPrimitive && value.length <= 4) return `[${value.map((item) => String(item)).join(", ")}]`;
    return `${value.length} ${copy[locale].items}`;
  }
  const record = value as { readonly [key: string]: JsonValue };
  if (record[locale] !== undefined) return localText(record[locale], locale);
  const entries = Object.entries(record);
  const shortEntries = entries.filter(([, item]) => item === null || typeof item !== "object");
  if (shortEntries.length > 0 && shortEntries.length === entries.length && entries.length <= 3) return shortEntries.map(([key, item]) => `${key}: ${String(item)}`).join(" · ");
  return `${entries.length} ${copy[locale].fields}`;
}

const hiddenLearnerStateKeys = new Set(["fixture_ref", "history"]);

function learnerSafeText(value: string, locale: Locale) {
  const lineLabel = locale === "vi" ? "dòng Python đang xét" : "the current Python line";
  return value
    .replace(/ac-9618-[\w.-]+/gi, "")
    .replace(/\b[\w-]+\.production-v\d+\.L\d+\b/gi, lineLabel)
    .replace(/\b(?:production-v\d+|pilot-v\d+|independent(?:ly)? rerun|verified|frozen)\b|(?:đã kiểm chứng|độc lập chạy lại|đóng băng)/gi, "")
    .replace(/\b([\w-]+)\.(?:normal|boundary|failure)\b/gi, "$1 example")
    .replace(/_/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function StateSummary({ value, locale, rawLabel, emptyLabel, learnerMode = false }: Readonly<{ value: JsonValue | undefined; locale: Locale; rawLabel: string; emptyLabel: string; learnerMode?: boolean }>) {
  if (isRecord(value) && value[locale] !== undefined && structuredValue(value) === undefined) { const text = localText(value, locale); return <p className={styles.stateLead}>{learnerMode ? learnerSafeText(text, locale) : text}</p>; }
  const displayValue = structuredValue(value) ?? value;
  if (displayValue === undefined || displayValue === null) return <p className={styles.emptyState}>{emptyLabel}</p>;
  if (!isRecord(displayValue)) { const text = compactValue(displayValue, locale); return <p className={styles.stateLead}>{learnerMode ? learnerSafeText(text, locale) : text}</p>; }
  const entries = Object.entries(displayValue).filter(([key]) => !learnerMode || !hiddenLearnerStateKeys.has(key));
  if (entries.length === 0) return <p className={styles.emptyState}>{emptyLabel}</p>;
  return <>
    <dl className={styles.stateFacts}>{entries.map(([key, item]) => <div className={styles.stateFact} key={key}><dt>{learnerSafeText(key, locale)}</dt><dd title={!learnerMode && typeof item === "object" ? JSON.stringify(item) : undefined}>{learnerMode ? learnerSafeText(compactValue(item, locale), locale) : compactValue(item, locale)}</dd></div>)}</dl>
    {!learnerMode && <details className={styles.rawDetails}><summary>{rawLabel}</summary><DataBlock value={displayValue} /></details>}
  </>;
}

type V2Props = Extract<Paper4VisualRuntimeProps, { patterns: readonly PatternMetadata[] }>;

function scenarioLabel(caseKind: string, locale: Locale) {
  if (caseKind === "normal" || caseKind === "boundary" || caseKind === "failure") return copy[locale][caseKind];
  return caseKind;
}

function BinaryPrediction({ model, locale, draft, status, onDraft, onSubmit, complete }: Readonly<{
  model: BinarySearchSceneModel;
  locale: Locale;
  draft: string;
  status: "idle" | "correct" | "incorrect";
  onDraft: (value: string) => void;
  onSubmit: (submission: FormEvent<HTMLFormElement>) => void;
  complete: boolean;
}>) {
  const t = copy[locale];
  const feedback = status === "incorrect" ? model.prediction.feedbackByKey[draft]?.[locale] : undefined;
  return <section className={`${styles.practiceCard} ${styles.binaryPractice}`} aria-labelledby={`${model.eventId}-prediction`}>
    <h3 id={`${model.eventId}-prediction`}>{t.prediction}</h3>
    {model.phase === "predict" ? <form onSubmit={onSubmit}>
      <fieldset className={styles.predictionChoices}>
        <legend>{localizedSceneText(model.prediction.prompt, locale)}</legend>
        {model.prediction.choices.map((item) => <label key={item.key} data-selected={draft === item.key || undefined}><input type="radio" name={`${model.eventId}-prediction-choice`} value={item.key} checked={draft === item.key} onChange={(change) => onDraft(change.currentTarget.value)} /><span>{item.label[locale]}</span></label>)}
      </fieldset>
      <button type="submit" disabled={!draft}>{t.checkPrediction}</button>
    </form> : <>
      <p className={styles.feedback} data-status={status === "idle" ? undefined : status} role="status">{status !== "idle" && <strong>{status === "correct" ? t.correct : t.incorrect}</strong>} {feedback ?? localizedSceneText(model.narration, locale)}</p>
      {complete && <p role="status">{t.traceComplete}</p>}
    </>}
  </section>;
}

function V2Runtime(props: V2Props) {
  const { patterns, pythonArtifact: preloadArtifact, initialPatternId, locale, initialLocale = "vi", autoplayDelayMs = 1800, headingLevel = 2, className, audience = "audit", onLearnerProgress } = props;
  const learnerMode = audience === "learner";
  const requestedLocale = locale ?? initialLocale;
  const firstPattern = patterns.find((item) => item.pattern_id === initialPatternId) ?? patterns[0];
  const [state, dispatch] = useReducer(runtimeReducer, createInitialRuntimeState(firstPattern?.pattern_id ?? "", requestedLocale));
  const [loadRevision, setLoadRevision] = useState(0);
  const [loadState, setLoadState] = useState<{ status: "loading" | "ready" | "error"; chunk?: TraceChunk; message?: string }>({ status: "loading" });
  const [predictionDraft, setPredictionDraft] = useState("");
  const [scenarioDraft, setScenarioDraft] = useState("");
  const [fullStateAnnouncement, setFullStateAnnouncement] = useState("");
  const focusAfterAction = useRef(false);
  const componentId = useId();
  const pattern = patterns.find((item) => item.pattern_id === state.patternId) ?? firstPattern;
  const t = copy[state.locale];
  const RuntimeHeading = headingLevel === 3 ? "h3" : "h2";

  useEffect(() => { dispatch({ type: "SET_LOCALE", locale: requestedLocale }); }, [requestedLocale]);

  useEffect(() => {
    let current = true;
    if (!pattern) return;
    setLoadState({ status: "loading" });
    loadTraceChunk(pattern, preloadArtifact).then((chunk) => {
      if (!current) return;
      let restored = null;
      if (pattern.pattern_id === "BINARY_SEARCH" && typeof window !== "undefined") {
        try {
          const serialized = window.sessionStorage.getItem(BINARY_SEARCH_PROGRESS_KEY);
          if (serialized) {
            restored = restoreBinarySearchProgress(JSON.parse(serialized), chunk);
            if (!restored) window.sessionStorage.removeItem(BINARY_SEARCH_PROGRESS_KEY);
          }
        } catch {
          try { window.sessionStorage.removeItem(BINARY_SEARCH_PROGRESS_KEY); } catch { /* Storage may be unavailable. */ }
        }
      } else if (learnerMode && typeof window !== "undefined") {
        const storageKey = runtimeProgressKey(pattern.pattern_id);
        try {
          const serialized = window.sessionStorage.getItem(storageKey);
          if (serialized) {
            restored = restoreRuntimeProgress(JSON.parse(serialized), chunk);
            if (!restored) window.sessionStorage.removeItem(storageKey);
          }
        } catch {
          try { window.sessionStorage.removeItem(storageKey); } catch { /* Storage may be unavailable. */ }
        }
      }
      const scenario = restored ? chunk.scenarios.find((item) => item.scenario_id === restored.scenarioId) ?? defaultScenario(chunk) : defaultScenario(chunk);
      const firstEventId = scenario.event_ids[0] ?? "";
      setLoadState({ status: "ready", chunk });
      setScenarioDraft(scenario.scenario_id);
      if (restored) dispatch({ type: "RESTORE_PROGRESS", ...restored });
      else dispatch({ type: "TRACE_READY", patternId: pattern.pattern_id, scenarioId: scenario.scenario_id, firstEventId });
    }).catch((reason: unknown) => {
      if (current) setLoadState({ status: "error", message: reason instanceof Error ? reason.message : String(reason) });
    });
    return () => { current = false; };
  }, [loadRevision, pattern?.pattern_id, pattern?.trace_url, preloadArtifact?.code_sha256]);

  const rawScenarioEvents = useMemo(() => {
    if (!loadState.chunk || !state.scenarioId) return [];
    try { return selectScenarioEvents(loadState.chunk, state.scenarioId); } catch { return []; }
  }, [loadState.chunk, state.scenarioId]);
  const projectedEvents = useMemo(() => projectLearningEvents(pattern?.pattern_id ?? "", rawScenarioEvents), [pattern?.pattern_id, rawScenarioEvents]);
  const binaryProjectionReady = pattern?.pattern_id === "BINARY_SEARCH" && projectedEvents.length > 0 && projectedEvents.every((item) => adaptBinarySearchEvent(item, "predict") !== null);
  const scenarioEvents = binaryProjectionReady ? projectedEvents : rawScenarioEvents;
  const eventIndex = Math.min(state.eventIndex, Math.max(0, scenarioEvents.length - 1));
  const event = scenarioEvents[eventIndex];
  const nextEvent = scenarioEvents[eventIndex + 1];
  const activeScenario = loadState.chunk?.scenarios.find((item) => item.scenario_id === state.scenarioId);
  const sceneModel = binaryProjectionReady && event ? adaptBinarySearchEvent(event, state.stepPhase) : null;

  useEffect(() => {
    if (!binaryProjectionReady || !loadState.chunk || !event || state.patternId !== "BINARY_SEARCH") return;
    try {
      const stored = createBinarySearchStoredProgress({
        scenarioId: state.scenarioId,
        eventIndex,
        eventId: event.event_id,
        stepPhase: state.stepPhase,
        predictionStatus: state.predictionStatus,
        predictionAnswer: state.predictionAnswer,
      }, loadState.chunk);
      window.sessionStorage.setItem(BINARY_SEARCH_PROGRESS_KEY, JSON.stringify(stored));
    } catch { /* Persistence is progressive enhancement; the verified runtime remains usable without storage. */ }
  }, [binaryProjectionReady, event, eventIndex, loadState.chunk, state.eventId, state.patternId, state.predictionAnswer, state.predictionStatus, state.scenarioId, state.stepPhase]);

  useEffect(() => {
    if (!learnerMode || binaryProjectionReady || !loadState.chunk || !event || !state.patternId) return;
    try {
      const stored: StoredRuntimeProgress = {
        patternId: state.patternId,
        scenarioId: state.scenarioId,
        eventIndex,
        eventId: event.event_id,
        stepPhase: state.stepPhase,
        predictionStatus: state.predictionStatus,
        predictionAnswer: state.predictionAnswer,
      };
      window.sessionStorage.setItem(runtimeProgressKey(state.patternId), JSON.stringify(stored));
    } catch { /* Persistence is progressive enhancement. */ }
  }, [binaryProjectionReady, event, eventIndex, learnerMode, loadState.chunk, state.patternId, state.predictionAnswer, state.predictionStatus, state.scenarioId, state.stepPhase]);

  useEffect(() => {
    if (binaryProjectionReady || !state.playing || !nextEvent) return;
    const timer = window.setTimeout(() => dispatch({ type: "NEXT", eventId: nextEvent.event_id, keepPlaying: true }), Math.max(500, autoplayDelayMs));
    return () => window.clearTimeout(timer);
  }, [autoplayDelayMs, binaryProjectionReady, nextEvent, state.playing]);

  useEffect(() => { setPredictionDraft(state.predictionAnswer); setFullStateAnnouncement(""); }, [state.eventId, state.patternId, state.predictionAnswer]);
  useEffect(() => {
    if (learnerMode) onLearnerProgress?.({ hasRecordedPrediction: state.predictionStatus !== "idle" || state.stepPhase === "revealed" || state.eventIndex > 0 });
  }, [learnerMode, onLearnerProgress, state.eventIndex, state.predictionStatus, state.stepPhase]);
  useEffect(() => {
    if (!focusAfterAction.current || !event) return;
    focusAfterAction.current = false;
    const focusTarget = learnerMode
      ? sceneModel?.focusTarget ?? `${componentId}-trace-${eventIndex}`
      : event.accessibility.focus_target;
    document.getElementById(focusTarget)?.focus();
  }, [componentId, event, eventIndex, learnerMode, sceneModel?.focusTarget, state.inputRevision, state.stepPhase]);

  if (!pattern) return <section className={`${styles.empty} ${className ?? ""}`} role="status">{t.loadError}</section>;
  if (loadState.status === "loading") return <section className={`${styles.runtime} ${className ?? ""}`} data-runtime-version="paper4-v2-loading" data-testid="paper4-visual-lab" role="status" aria-live="polite"><p className={styles.empty}>{t.loading}</p>{preloadArtifact && !learnerMode && <article className={`${styles.panel} ${styles.codePanel}`} data-panel="code"><PythonArtifact artifact={preloadArtifact} locale={state.locale} headingLevel={4} /></article>}</section>;
  if (loadState.status === "error" || !loadState.chunk || !event) return <section className={`${styles.empty} ${className ?? ""}`} role="alert"><p>{t.loadError}</p>{!learnerMode && <p className={styles.errorDetail}>{loadState.message}</p>}<button type="button" onClick={() => setLoadRevision((value) => value + 1)}>{t.retry}</button></section>;

  const pythonArtifact = loadState.chunk.python_artifact;
  const rawEventName = event.accessibility.accessible_label[state.locale];
  const eventName = learnerMode ? learnerSafeText(rawEventName, state.locale) : rawEventName;
  const progress = ((eventIndex + 1) / scenarioEvents.length) * 100;
  const goPrevious = () => { const target = scenarioEvents[eventIndex - 1]; if (target) { focusAfterAction.current = true; dispatch({ type: "PREVIOUS", eventId: target.event_id }); } };
  const goNext = () => { if (nextEvent && (!sceneModel || state.stepPhase === "revealed") && (!learnerMode || state.predictionStatus !== "idle")) { focusAfterAction.current = true; dispatch({ type: "NEXT", eventId: nextEvent.event_id }); } };
  const reset = () => { const first = scenarioEvents[0]; if (first) { focusAfterAction.current = true; dispatch({ type: "RESET", firstEventId: first.event_id }); } };
  const changeInput = (submission: FormEvent<HTMLFormElement>) => {
    submission.preventDefault();
    const scenario = loadState.chunk!.scenarios.find((item) => item.scenario_id === scenarioDraft);
    if (!scenario) return;
    focusAfterAction.current = true;
    dispatch({ type: "CHANGE_INPUT", scenarioId: scenario.scenario_id, firstEventId: scenario.event_ids[0] });
  };
  const submitPrediction = (submission: FormEvent<HTMLFormElement>) => {
    submission.preventDefault();
    if (!predictionDraft.trim()) return;
    if (sceneModel) {
      focusAfterAction.current = true;
      dispatch({ type: "SUBMIT_PREDICTION", status: predictionDraft === sceneModel.prediction.correctKey ? "correct" : "incorrect", answer: predictionDraft });
      return;
    }
    if (!nextEvent) return;
    const answer = normalize(predictionDraft);
    const candidates = [nextEvent.event_type, nextEvent.accessibility.accessible_label[state.locale]].map(normalize);
    dispatch({ type: "SUBMIT_PREDICTION", status: candidates.includes(answer) ? "correct" : "incorrect", answer: predictionDraft.trim() });
  };
  const traceKeyboard = (key: KeyboardEvent<HTMLOListElement>) => {
    if (key.key === "ArrowLeft" && eventIndex > 0) { key.preventDefault(); goPrevious(); }
    if (key.key === "ArrowRight" && nextEvent && (!sceneModel || state.stepPhase === "revealed")) { key.preventDefault(); goNext(); }
  };

  const genericPanels = <div className={styles.panelGrid}>
    <article id={learnerMode ? `${componentId}-trace-${eventIndex}` : undefined} tabIndex={learnerMode ? -1 : undefined} className={`${styles.panel} ${styles.changePanel}`} data-panel="change" aria-labelledby={`${componentId}-change`}><div className={styles.changeHeading}><span>{t.step} {eventIndex + 1}</span><h3 id={`${componentId}-change`}>{t.change}</h3><p>{eventName}</p></div>{learnerMode ? <p>{learnerSafeText(event.accessibility.live_status.message[state.locale], state.locale)}</p> : <StateSummary value={event.delta} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noChange} />}</article>
    <article className={`${styles.panel} ${styles.codePanel}`} data-panel="code" aria-labelledby={`${componentId}-code`}><h3 id={`${componentId}-code`}>{t.code}</h3><PythonArtifact artifact={pythonArtifact} activeLineIds={learnerMode ? event.active_line_ids.slice(0, 3) : event.active_line_ids} visibleLineIds={learnerMode ? event.active_line_ids.slice(0, 8) : undefined} maxVisibleLines={8} locale={state.locale} headingLevel={4} audience={audience} /></article>
    <article className={`${styles.panel} ${styles.statePanel}`} data-panel="state" aria-labelledby={`${componentId}-state`}><h3 id={`${componentId}-state`}>{t.stateTransition}</h3><div className={styles.stateSequence}>{([[t.before, event.before], [t.after, event.after]] as const).map(([label, value]) => <section key={label}><h4>{label}</h4><StateSummary value={value} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noChange} learnerMode={learnerMode} /></section>)}</div></article>
    {!learnerMode && <article className={`${styles.panel} ${styles.tracePanel}`} data-panel="trace" aria-labelledby={`${componentId}-trace`}><h3 id={`${componentId}-trace`}>{t.trace}</h3><p className={styles.keyboardHelp}>{event.accessibility.keyboard_instruction[state.locale]}</p><ol className={styles.traceList} onKeyDown={traceKeyboard}>{scenarioEvents.map((traceEvent, index) => { const current = index === eventIndex; return <li key={traceEvent.event_id} id={traceEvent.accessibility.focus_target} tabIndex={current ? 0 : -1} aria-current={current ? "step" : undefined} data-complete={index < eventIndex || undefined}><span className={styles.traceNumber}>{index + 1}</span><span>{traceEvent.accessibility.accessible_label[state.locale]}</span>{current && <strong>{t.current}</strong>}</li>; })}</ol></article>}
    {!learnerMode && <article className={`${styles.panel} ${styles.outputPanel}`} data-panel="output" aria-labelledby={`${componentId}-output`}><h3 id={`${componentId}-output`}>{t.output}</h3><StateSummary value={event.output_delta} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noOutput} /></article>}
    <article className={`${styles.panel} ${styles.invariantPanel}`} data-panel="invariant" aria-labelledby={`${componentId}-invariant`}><h3 id={`${componentId}-invariant`}>{t.invariant}</h3><p>{learnerMode ? learnerSafeText(localText(event.invariant_or_criterion, state.locale), state.locale) : localText(event.invariant_or_criterion, state.locale)}</p></article>
  </div>;

  return <section className={`${styles.runtime} ${className ?? ""}`} data-runtime-version="paper4-v2" data-pattern-id={!learnerMode ? pattern.pattern_id : undefined} data-scenario-id={!learnerMode ? activeScenario?.scenario_id ?? "" : undefined} data-event-id={!learnerMode ? event.event_id : undefined} data-event-index={eventIndex} data-input-revision={!learnerMode ? state.inputRevision : undefined} data-case-kind={learnerMode ? activeScenario?.case_kind : undefined} data-prediction-recorded={learnerMode && state.predictionStatus !== "idle" ? "true" : undefined} data-testid="paper4-visual-lab" lang={state.locale} aria-labelledby={`${componentId}-title`}>
    <header className={`${styles.header} ${sceneModel ? styles.binaryHeader : ""}`}>
      <div><p className={styles.eyebrow}>{t.eyebrow}</p><RuntimeHeading id={`${componentId}-title`}>{patternLabel(pattern, state.locale)}</RuntimeHeading>{pattern.purpose && <p>{pattern.purpose[state.locale]}</p>}</div>
      {!learnerMode && <label className={styles.patternSelect}><span>{t.pattern}</span><select id={`${componentId}-pattern`} value={pattern.pattern_id} onChange={(change) => dispatch({ type: "SELECT_PATTERN", patternId: change.currentTarget.value })}>{patterns.map((item) => <option key={item.pattern_id} value={item.pattern_id}>{patternLabel(item, state.locale)}</option>)}</select></label>}
    </header>
    <div className={styles.progressMeta}><strong>{t.step} {eventIndex + 1} {t.of} {scenarioEvents.length}</strong><span>{eventName}</span></div>
    <div className={styles.progressTrack} data-testid="event-progress" data-event-id={!learnerMode ? event.event_id : undefined} data-event-index={eventIndex} role="progressbar" aria-valuemin={1} aria-valuemax={scenarioEvents.length} aria-valuenow={eventIndex + 1} aria-label={eventName}><span style={{ width: `${progress}%` }} /></div>
    <p className={styles.srOnly} data-testid="runtime-announcer" aria-live={event.accessibility.live_status.mode} aria-atomic="true">{sceneModel && state.stepPhase === "predict" ? localizedSceneText(sceneModel.prediction.prompt, state.locale) : learnerMode ? learnerSafeText(event.accessibility.live_status.message[state.locale], state.locale) : event.accessibility.live_status.message[state.locale]}</p>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{fullStateAnnouncement}</p>
    {!learnerMode && <p className={styles.runContext} data-testid="run-context"><strong>{activeScenario ? scenarioLabel(activeScenario.case_kind, state.locale) : ""}</strong> · {activeScenario?.fixture_ref} · {state.inputRevision}</p>}

    {sceneModel ? <>
      <div className={styles.binaryLayout} data-layout="stacked">
        <SearchWindow model={sceneModel} locale={state.locale} headingId={sceneModel.focusTarget} onHearFullState={learnerMode ? undefined : () => setFullStateAnnouncement(sceneModel.fullState[state.locale])} />
        <article className={`${styles.panel} ${styles.binaryCode}`} data-panel="code" data-primary-panel="true" aria-labelledby={`${componentId}-code`}><h3 id={`${componentId}-code`}>{t.code}</h3>{state.stepPhase === "revealed" ? <PythonArtifact artifact={pythonArtifact} activeLineIds={learnerMode ? sceneModel.focusLineIds.slice(0, 3) : sceneModel.focusLineIds} visibleLineIds={learnerMode ? sceneModel.focusLineIds.slice(0, 8) : sceneModel.focusLineIds} maxVisibleLines={8} locale={state.locale} headingLevel={4} audience={audience} /> : <p className={styles.codeLocked}>{t.codeLocked}</p>}</article>
        <BinaryPrediction model={sceneModel} locale={state.locale} draft={state.stepPhase === "revealed" ? state.predictionAnswer : predictionDraft} status={state.predictionStatus} onDraft={setPredictionDraft} onSubmit={submitPrediction} complete={!nextEvent} />
        <nav className={`${styles.controls} ${styles.binaryControls}`} aria-label={`${t.trace}: ${eventName}`}><button type="button" data-action="previous" onClick={goPrevious} disabled={eventIndex === 0}>← {t.previous}</button><button type="button" data-action="next" onClick={goNext} disabled={!nextEvent || state.stepPhase === "predict"}>{t.next} →</button><button type="button" data-action="reset" onClick={reset}>↺ {t.reset}</button></nav>
      </div>
      {!learnerMode && state.stepPhase === "revealed" && <details className={styles.auditDetails}>
        <summary>{t.audit}</summary>
        <div className={styles.auditGrid}>
          <section><h3>{t.before}</h3><StateSummary value={event.before} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noChange} /></section>
          <section><h3>{t.change}</h3><StateSummary value={event.delta} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noChange} /></section>
          <section><h3>{t.after}</h3><StateSummary value={event.after} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noChange} /></section>
        </div>
        <h3>{t.fullBinding}</h3><p className={styles.lineBinding}>{event.active_line_ids.join(" · ")}</p>
        <ol className={styles.traceList}>{rawScenarioEvents.map((traceEvent, index) => <li key={traceEvent.event_id} aria-current={traceEvent.event_id === event.event_id ? "step" : undefined}><span className={styles.traceNumber}>{index + 1}</span><span>{traceEvent.accessibility.accessible_label[state.locale]}</span>{traceEvent.event_id === event.event_id && <strong>{t.current}</strong>}</li>)}</ol>
      </details>}
    </> : <>
      {genericPanels}
      <section className={styles.practiceCard} aria-labelledby={`${componentId}-prediction`}><h3 id={`${componentId}-prediction`}>{t.prediction}</h3>{nextEvent ? <form onSubmit={submitPrediction}><p>{learnerMode ? learnerSafeText(localText(event.prediction, state.locale), state.locale) : localText(event.prediction, state.locale)}</p><label htmlFor={`${componentId}-prediction-input`}>{t.yourPrediction}</label><div className={styles.inlineForm}><input id={`${componentId}-prediction-input`} value={predictionDraft} onChange={(change) => setPredictionDraft(change.currentTarget.value)} autoComplete="off" /><button type="submit" disabled={!predictionDraft.trim()}>{t.checkPrediction}</button></div>{state.predictionStatus !== "idle" && <p className={styles.feedback} data-status={state.predictionStatus} data-answer-revealed="true" role="status">{state.predictionStatus === "correct" ? t.correct : `${t.incorrect} ${learnerMode ? learnerSafeText(nextEvent.accessibility.accessible_label[state.locale], state.locale) : nextEvent.accessibility.accessible_label[state.locale]}.`} {learnerMode ? learnerSafeText(localText(event.feedback, state.locale), state.locale) : localText(event.feedback, state.locale)}</p>}</form> : <p role="status">{t.traceComplete}</p>}</section>
      <nav className={styles.controls} aria-label={`${t.trace}: ${eventName}`}><button type="button" data-action="previous" onClick={goPrevious} disabled={eventIndex === 0}>← {t.previous}</button><button type="button" data-action="next" onClick={goNext} disabled={!nextEvent || (learnerMode && state.predictionStatus === "idle")}>{t.next} →</button>{!learnerMode && <><button type="button" data-action="play" onClick={() => dispatch({ type: "PLAY" })} disabled={state.playing || !nextEvent}>▶ {t.play}</button><button type="button" data-action="pause" onClick={() => dispatch({ type: "PAUSE" })} disabled={!state.playing}>Ⅱ {t.pause}</button></>}<button type="button" data-action="reset" onClick={reset}>↺ {t.reset}</button></nav>
    </>}

    {!learnerMode && <form className={styles.scenarioForm} onSubmit={changeInput}><label htmlFor={`${componentId}-scenario`}><strong>{t.scenarioInput}</strong><span>{t.inputHint}</span></label><div className={styles.inlineForm}><select id={`${componentId}-scenario`} value={scenarioDraft} onChange={(change) => setScenarioDraft(change.currentTarget.value)}>{loadState.chunk.scenarios.map((scenario) => <option key={scenario.scenario_id} value={scenario.scenario_id}>{scenarioLabel(scenario.case_kind, state.locale)}</option>)}</select><button type="submit" disabled={!scenarioDraft || scenarioDraft === state.scenarioId}>{t.applyInput}</button></div></form>}
    {learnerMode && <label className={styles.learnerScenarioSelect} htmlFor={`${componentId}-learner-scenario`}><strong>{t.scenarioInput}</strong><span>{t.inputHint}</span><select id={`${componentId}-learner-scenario`} value={activeScenario?.case_kind ?? "normal"} onChange={(change) => { const scenario = loadState.chunk!.scenarios.find((item) => item.case_kind === change.currentTarget.value); if (scenario) { focusAfterAction.current = true; dispatch({ type: "CHANGE_INPUT", scenarioId: scenario.scenario_id, firstEventId: scenario.event_ids[0] }); } }}>{loadState.chunk.scenarios.map((scenario) => <option key={scenario.case_kind} value={scenario.case_kind}>{scenarioLabel(scenario.case_kind, state.locale)}</option>)}</select></label>}
    {!learnerMode && <footer className={styles.provenance}><span>{loadState.chunk.owner.artifact_version}</span><code>{loadState.chunk.owner.code_sha256.slice(0, 12)}…</code><span>{pythonArtifact.execution?.execution_status}</span></footer>}
  </section>;
}

export function Paper4VisualRuntime(props: Paper4VisualRuntimeProps) {
  if ("patterns" in props && props.patterns) return <V2Runtime {...props as V2Props} />;
  const locale = props.locale ?? props.initialLocale ?? "vi";
  return <section className={`${styles.empty} ${props.className ?? ""}`} data-runtime-version="legacy-adapter" role="status" lang={locale}>{copy[locale].migration}</section>;
}
