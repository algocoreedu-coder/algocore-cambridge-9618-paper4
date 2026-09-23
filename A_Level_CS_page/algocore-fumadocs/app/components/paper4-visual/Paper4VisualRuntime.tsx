"use client";

import { FormEvent, KeyboardEvent, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";

import { PythonArtifact } from "../paper4-learning/PythonArtifact";
import styles from "./Paper4VisualRuntime.module.css";
import { createInitialRuntimeState, runtimeReducer } from "./reducer";
import { defaultScenario, loadTraceChunk, selectScenarioEvents } from "./traceLoader";
import type { JsonValue, Locale, Paper4VisualRuntimeProps, PatternMetadata, PythonArtifactDto, TraceChunk, TraceEvent } from "./types";

const copy = {
  vi: {
    eyebrow: "Phòng luyện Paper 4", pattern: "Dạng bài", previous: "Bước trước", next: "Bước tiếp", play: "Chạy", pause: "Tạm dừng", reset: "Làm lại",
    step: "Bước", of: "trên", code: "Mã Python", state: "Trạng thái", trace: "Luồng thực thi", output: "Kết quả", invariant: "Điều phải luôn đúng",
    before: "Trước bước này", change: "Điều vừa thay đổi", after: "Sau bước này", noOutput: "Chưa có output ở bước này.", current: "Đang xét", prediction: "Dừng và dự đoán",
    stateTransition: "So sánh trạng thái", rawJson: "Xem JSON đầy đủ", fields: "trường", items: "mục", noChange: "Không có thay đổi dữ liệu ở bước này.",
    yourPrediction: "Dự đoán của bạn", checkPrediction: "Kiểm tra dự đoán", correct: "Đúng. Hãy tiếp tục và đối chiếu trạng thái.", incorrect: "Chưa đúng. Event kế tiếp là",
    traceComplete: "Bạn đã đến cuối trace. Dùng Làm lại để luyện lại.", scenarioInput: "Đổi tình huống đầu vào", inputHint: "Chọn trace normal, boundary hoặc failure.",
    applyInput: "Áp dụng tình huống", loading: "Đang tải trace đã kiểm chứng…", loadError: "Không thể tải trace đã kiểm chứng.", retry: "Thử tải lại", migration: "Visual v2 đang chờ route truyền pattern metadata và Python artifact.",
  },
  en: {
    eyebrow: "Paper 4 practice lab", pattern: "Question pattern", previous: "Previous", next: "Next", play: "Play", pause: "Pause", reset: "Reset",
    step: "Step", of: "of", code: "Python source", state: "State", trace: "Execution trace", output: "Output", invariant: "Invariant to protect",
    before: "Before this step", change: "What changed", after: "After this step", noOutput: "No output is produced at this step.", current: "Current", prediction: "Pause and predict",
    stateTransition: "Compare state", rawJson: "View raw JSON", fields: "fields", items: "items", noChange: "No data changes at this step.",
    yourPrediction: "Your prediction", checkPrediction: "Check prediction", correct: "Correct. Continue and compare the resulting state.", incorrect: "Not yet. The next event is",
    traceComplete: "You reached the end of the trace. Reset to practise again.", scenarioInput: "Change input scenario", inputHint: "Choose the normal, boundary, or failure trace.",
    applyInput: "Apply scenario", loading: "Loading the verified trace…", loadError: "The verified trace could not be loaded.", retry: "Try again", migration: "The v2 visual is waiting for pattern metadata and a Python artifact from the route.",
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
  if (shortEntries.length > 0 && shortEntries.length === entries.length && entries.length <= 3) {
    return shortEntries.map(([key, item]) => `${key}: ${String(item)}`).join(" · ");
  }
  return `${entries.length} ${copy[locale].fields}`;
}

function StateSummary({ value, locale, rawLabel, emptyLabel }: Readonly<{ value: JsonValue | undefined; locale: Locale; rawLabel: string; emptyLabel: string }>) {
  if (isRecord(value) && value[locale] !== undefined && structuredValue(value) === undefined) {
    return <p className={styles.stateLead}>{localText(value, locale)}</p>;
  }
  const displayValue = structuredValue(value) ?? value;
  if (displayValue === undefined || displayValue === null) return <p className={styles.emptyState}>{emptyLabel}</p>;
  if (!isRecord(displayValue)) return <p className={styles.stateLead}>{compactValue(displayValue, locale)}</p>;

  const entries = Object.entries(displayValue);
  if (entries.length === 0) return <p className={styles.emptyState}>{emptyLabel}</p>;

  return (
    <>
      <dl className={styles.stateFacts}>
        {entries.map(([key, item]) => (
          <div className={styles.stateFact} key={key}>
            <dt>{key.replaceAll("_", " ")}</dt>
            <dd title={typeof item === "object" ? JSON.stringify(item) : undefined}>{compactValue(item, locale)}</dd>
          </div>
        ))}
      </dl>
      <details className={styles.rawDetails}>
        <summary>{rawLabel}</summary>
        <DataBlock value={displayValue} />
      </details>
    </>
  );
}

type V2Props = Extract<Paper4VisualRuntimeProps, { patterns: readonly PatternMetadata[] }>;

function V2Runtime(props: V2Props) {
  const { patterns, pythonArtifact: preloadArtifact, initialPatternId, locale, initialLocale = "vi", autoplayDelayMs = 1800, headingLevel = 2, className } = props;
  const requestedLocale = locale ?? initialLocale;
  const firstPattern = patterns.find((item) => item.pattern_id === initialPatternId) ?? patterns[0];
  const [state, dispatch] = useReducer(runtimeReducer, createInitialRuntimeState(firstPattern?.pattern_id ?? "", requestedLocale));
  const [loadRevision, setLoadRevision] = useState(0);
  const [loadState, setLoadState] = useState<{ status: "loading" | "ready" | "error"; chunk?: TraceChunk; message?: string }>({ status: "loading" });
  const [predictionDraft, setPredictionDraft] = useState("");
  const [scenarioDraft, setScenarioDraft] = useState("");
  const focusAfterInput = useRef(false);
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
      const scenario = defaultScenario(chunk);
      const firstEventId = scenario.event_ids[0] ?? "";
      setLoadState({ status: "ready", chunk });
      setScenarioDraft(scenario.scenario_id);
      dispatch({ type: "TRACE_READY", patternId: pattern.pattern_id, scenarioId: scenario.scenario_id, firstEventId });
    }).catch((reason: unknown) => {
      if (current) setLoadState({ status: "error", message: reason instanceof Error ? reason.message : String(reason) });
    });
    return () => { current = false; };
  }, [loadRevision, pattern?.pattern_id, pattern?.trace_url, preloadArtifact?.code_sha256]);

  const scenarioEvents = useMemo(() => {
    if (!loadState.chunk || !state.scenarioId) return [];
    try { return selectScenarioEvents(loadState.chunk, state.scenarioId); } catch { return []; }
  }, [loadState.chunk, state.scenarioId]);
  const eventIndex = Math.min(state.eventIndex, Math.max(0, scenarioEvents.length - 1));
  const event = scenarioEvents[eventIndex];
  const nextEvent = scenarioEvents[eventIndex + 1];
  const activeScenario = loadState.chunk?.scenarios.find((item) => item.scenario_id === state.scenarioId);

  useEffect(() => {
    if (!state.playing || !nextEvent) return;
    const timer = window.setTimeout(() => dispatch({ type: "NEXT", eventId: nextEvent.event_id, keepPlaying: true }), Math.max(500, autoplayDelayMs));
    return () => window.clearTimeout(timer);
  }, [autoplayDelayMs, nextEvent, state.playing]);

  useEffect(() => { setPredictionDraft(""); }, [state.eventId, state.patternId]);
  useEffect(() => {
    if (!focusAfterInput.current || !event) return;
    focusAfterInput.current = false;
    document.getElementById(event.accessibility.focus_target)?.focus();
  }, [event, state.inputRevision]);

  if (!pattern) return <section className={`${styles.empty} ${className ?? ""}`} role="status">{t.loadError}</section>;
  if (loadState.status === "loading") return <section className={`${styles.runtime} ${className ?? ""}`} data-runtime-version="paper4-v2-loading" data-testid="paper4-visual-lab" role="status" aria-live="polite"><p className={styles.empty}>{t.loading}</p>{preloadArtifact && <article className={`${styles.panel} ${styles.codePanel}`} data-panel="code"><PythonArtifact artifact={preloadArtifact} locale={state.locale} headingLevel={4} /></article>}</section>;
  if (loadState.status === "error" || !loadState.chunk || !event) {
    return <section className={`${styles.empty} ${className ?? ""}`} role="alert"><p>{t.loadError}</p><p className={styles.errorDetail}>{loadState.message}</p><button type="button" onClick={() => setLoadRevision((value) => value + 1)}>{t.retry}</button></section>;
  }

  const pythonArtifact = loadState.chunk.python_artifact;

  const eventName = event.accessibility.accessible_label[state.locale];
  const progress = ((eventIndex + 1) / scenarioEvents.length) * 100;
  const goPrevious = () => { const target = scenarioEvents[eventIndex - 1]; if (target) dispatch({ type: "PREVIOUS", eventId: target.event_id }); };
  const goNext = () => { if (nextEvent) dispatch({ type: "NEXT", eventId: nextEvent.event_id }); };
  const reset = () => { const first = scenarioEvents[0]; if (first) dispatch({ type: "RESET", firstEventId: first.event_id }); };
  const changeInput = (submission: FormEvent<HTMLFormElement>) => {
    submission.preventDefault();
    const scenario = loadState.chunk!.scenarios.find((item) => item.scenario_id === scenarioDraft);
    if (!scenario) return;
    focusAfterInput.current = true;
    dispatch({ type: "CHANGE_INPUT", scenarioId: scenario.scenario_id, firstEventId: scenario.event_ids[0] });
  };
  const submitPrediction = (submission: FormEvent<HTMLFormElement>) => {
    submission.preventDefault();
    if (!predictionDraft.trim() || !nextEvent) return;
    const answer = normalize(predictionDraft);
    const candidates = [nextEvent.event_type, nextEvent.accessibility.accessible_label[state.locale]].map(normalize);
    dispatch({ type: "SUBMIT_PREDICTION", status: candidates.includes(answer) ? "correct" : "incorrect", answer: predictionDraft.trim() });
  };
  const traceKeyboard = (key: KeyboardEvent<HTMLOListElement>) => {
    if (key.key === "ArrowLeft" && eventIndex > 0) { key.preventDefault(); goPrevious(); }
    if (key.key === "ArrowRight" && nextEvent) { key.preventDefault(); goNext(); }
  };

  return (
    <section className={`${styles.runtime} ${className ?? ""}`} data-runtime-version="paper4-v2" data-pattern-id={pattern.pattern_id} data-scenario-id={activeScenario?.scenario_id ?? ""} data-event-id={event.event_id} data-event-index={eventIndex} data-input-revision={state.inputRevision} data-testid="paper4-visual-lab" lang={state.locale} aria-labelledby={`${componentId}-title`}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>{t.eyebrow}</p><RuntimeHeading id={`${componentId}-title`}>{patternLabel(pattern, state.locale)}</RuntimeHeading>{pattern.purpose && <p>{pattern.purpose[state.locale]}</p>}</div>
        <label className={styles.patternSelect}><span>{t.pattern}</span><select id={`${componentId}-pattern`} value={pattern.pattern_id} onChange={(change) => dispatch({ type: "SELECT_PATTERN", patternId: change.currentTarget.value })}>{patterns.map((item) => <option key={item.pattern_id} value={item.pattern_id}>{patternLabel(item, state.locale)}</option>)}</select></label>
      </header>

      <div className={styles.progressMeta}><strong>{t.step} {eventIndex + 1} {t.of} {scenarioEvents.length}</strong><span>{eventName}</span></div>
      <div className={styles.progressTrack} data-testid="event-progress" data-event-id={event.event_id} data-event-index={eventIndex} role="progressbar" aria-valuemin={1} aria-valuemax={scenarioEvents.length} aria-valuenow={eventIndex + 1} aria-label={eventName}><span style={{ width: `${progress}%` }} /></div>
      <p className={styles.srOnly} data-testid="runtime-announcer" aria-live={event.accessibility.live_status.mode} aria-atomic="true">{event.accessibility.live_status.message[state.locale]}</p>
      <p className={styles.runContext} data-testid="run-context"><strong>{activeScenario?.case_kind}</strong> · {activeScenario?.fixture_ref} · {state.inputRevision}</p>

      <div className={styles.panelGrid}>
        <article className={`${styles.panel} ${styles.changePanel}`} data-panel="change" aria-labelledby={`${componentId}-change`}>
          <div className={styles.changeHeading}><span>{t.step} {eventIndex + 1}</span><h3 id={`${componentId}-change`}>{t.change}</h3><p>{eventName}</p></div>
          <StateSummary value={event.delta} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noChange} />
        </article>
        <article className={`${styles.panel} ${styles.codePanel}`} data-panel="code" aria-labelledby={`${componentId}-code`}><h3 id={`${componentId}-code`}>{t.code}</h3><PythonArtifact artifact={pythonArtifact} activeLineIds={event.active_line_ids} locale={state.locale} headingLevel={4} /></article>
        <article className={`${styles.panel} ${styles.statePanel}`} data-panel="state" aria-labelledby={`${componentId}-state`}><h3 id={`${componentId}-state`}>{t.stateTransition}</h3><div className={styles.stateSequence}>{([[t.before,event.before],[t.after,event.after]] as const).map(([label,value]) => <section key={label}><h4>{label}</h4><StateSummary value={value} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noChange} /></section>)}</div></article>
        <article className={`${styles.panel} ${styles.tracePanel}`} data-panel="trace" aria-labelledby={`${componentId}-trace`}><h3 id={`${componentId}-trace`}>{t.trace}</h3><p className={styles.keyboardHelp}>{event.accessibility.keyboard_instruction[state.locale]}</p><ol className={styles.traceList} onKeyDown={traceKeyboard}>{scenarioEvents.map((traceEvent,index) => { const current=index===eventIndex; return <li key={traceEvent.event_id} id={traceEvent.accessibility.focus_target} tabIndex={current ? 0 : -1} aria-current={current ? "step" : undefined} data-complete={index<eventIndex||undefined}><span className={styles.traceNumber}>{index+1}</span><span>{traceEvent.accessibility.accessible_label[state.locale]}</span>{current && <strong>{t.current}</strong>}</li>; })}</ol></article>
        <article className={`${styles.panel} ${styles.outputPanel}`} data-panel="output" aria-labelledby={`${componentId}-output`}><h3 id={`${componentId}-output`}>{t.output}</h3><StateSummary value={event.output_delta} locale={state.locale} rawLabel={t.rawJson} emptyLabel={t.noOutput} /></article>
        <article className={`${styles.panel} ${styles.invariantPanel}`} data-panel="invariant" aria-labelledby={`${componentId}-invariant`}><h3 id={`${componentId}-invariant`}>{t.invariant}</h3><p>{localText(event.invariant_or_criterion,state.locale)}</p></article>
      </div>

      <section className={styles.practiceCard} aria-labelledby={`${componentId}-prediction`}><h3 id={`${componentId}-prediction`}>{t.prediction}</h3>{nextEvent ? <form onSubmit={submitPrediction}><p>{localText(event.prediction,state.locale)}</p><label htmlFor={`${componentId}-prediction-input`}>{t.yourPrediction}</label><div className={styles.inlineForm}><input id={`${componentId}-prediction-input`} value={predictionDraft} onChange={(change)=>setPredictionDraft(change.currentTarget.value)} autoComplete="off"/><button type="submit" disabled={!predictionDraft.trim()}>{t.checkPrediction}</button></div>{state.predictionStatus!=="idle" && <p className={styles.feedback} role="status">{state.predictionStatus==="correct" ? t.correct : `${t.incorrect} ${nextEvent.accessibility.accessible_label[state.locale]}.`} {localText(event.feedback,state.locale)}</p>}</form> : <p role="status">{t.traceComplete}</p>}</section>

      <nav className={styles.controls} aria-label={`${t.trace}: ${eventName}`}><button type="button" data-action="previous" onClick={goPrevious} disabled={eventIndex===0}>← {t.previous}</button><button type="button" data-action="next" onClick={goNext} disabled={!nextEvent}>{t.next} →</button><button type="button" data-action="play" onClick={()=>dispatch({type:"PLAY"})} disabled={state.playing||!nextEvent}>▶ {t.play}</button><button type="button" data-action="pause" onClick={()=>dispatch({type:"PAUSE"})} disabled={!state.playing}>Ⅱ {t.pause}</button><button type="button" data-action="reset" onClick={reset}>↺ {t.reset}</button></nav>

      <form className={styles.scenarioForm} onSubmit={changeInput}><label htmlFor={`${componentId}-scenario`}><strong>{t.scenarioInput}</strong><span>{t.inputHint}</span></label><div className={styles.inlineForm}><select id={`${componentId}-scenario`} value={scenarioDraft} onChange={(change)=>setScenarioDraft(change.currentTarget.value)}>{loadState.chunk.scenarios.map((scenario)=><option key={scenario.scenario_id} value={scenario.scenario_id}>{scenario.case_kind}</option>)}</select><button type="submit" disabled={!scenarioDraft||scenarioDraft===state.scenarioId}>{t.applyInput}</button></div></form>
      <footer className={styles.provenance}><span>{loadState.chunk.owner.artifact_version}</span><code>{loadState.chunk.owner.code_sha256.slice(0,12)}…</code><span>{pythonArtifact.execution?.execution_status}</span></footer>
    </section>
  );
}

export function Paper4VisualRuntime(props: Paper4VisualRuntimeProps) {
  if ("patterns" in props && props.patterns) return <V2Runtime {...props as V2Props} />;
  const locale = props.locale ?? props.initialLocale ?? "vi";
  return <section className={`${styles.empty} ${props.className ?? ""}`} data-runtime-version="legacy-adapter" role="status" lang={locale}>{copy[locale].migration}</section>;
}
