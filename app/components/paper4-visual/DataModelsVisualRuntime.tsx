"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { LearnerCodeCard } from "../paper4-learning/LearnerInteractions";
import { learnerText, type DataModelsLearnerProjection } from "../paper4-learning/learnerProjection";
import { ArrayRecordWorkbench } from "./ArrayRecordWorkbench";
import { adaptDataModelsEvent, createDataModelsProgress, DATA_MODELS_PROGRESS_KEY, projectDataModelsEvents, restoreDataModelsProgress } from "./dataModelsAdapter";
import styles from "./Paper4VisualRuntime.module.css";
import { loadTraceChunk, selectScenarioEvents } from "./traceLoader";
import type { Locale, PatternMetadata, PythonArtifactDto, TraceChunk } from "./types";

const copy = {
  en: {
    loading: "Loading the verified trace…", error: "The verified trace could not be loaded.", retry: "Try again", step: "Decision", of: "of",
    previous: "Previous", next: "Next", reset: "Reset", complete: "The three normal decisions are complete.", code: "Focused code",
    scenario: "Try another case", transferLocked: "Complete the three normal decisions to unlock these one-click checks.",
    correct: "Correct", tryAgain: "Try again", examSentence: "Exam sentence",
  },
  vi: {
    loading: "Đang tải trace đã kiểm chứng…", error: "Không thể tải trace đã kiểm chứng.", retry: "Thử lại", step: "Quyết định", of: "trên",
    previous: "Bước trước", next: "Bước tiếp", reset: "Làm lại", complete: "Đã hoàn thành ba quyết định bình thường.", code: "Code đang xét",
    scenario: "Thử trường hợp khác", transferLocked: "Hoàn thành ba quyết định bình thường để mở các câu hỏi một lần bấm.",
    correct: "Đúng", tryAgain: "Thử lại", examSentence: "Câu trả lời mẫu",
  },
} as const;

type Props = Readonly<{
  projection: DataModelsLearnerProjection;
  patterns: readonly PatternMetadata[];
  pythonArtifact: PythonArtifactDto;
  locale: Locale;
  onLearnerProgress: (hasCompletedNormalTrace: boolean) => void;
}>;

export function DataModelsVisualRuntime({ projection, patterns, pythonArtifact, locale, onLearnerProgress }: Props) {
  const pattern = patterns.find((item) => item.pattern_id === "ARRAY_APPEND");
  const [loadRevision, setLoadRevision] = useState(0);
  const [loadState, setLoadState] = useState<{ status: "loading" | "ready" | "error"; chunk?: TraceChunk }>({ status: "loading" });
  const [scenarioId, setScenarioId] = useState("");
  const [eventIndex, setEventIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Readonly<Record<string, string>>>({});
  const [revealedEventIds, setRevealedEventIds] = useState<ReadonlySet<string>>(new Set());
  const [normalComplete, setNormalComplete] = useState(false);
  const [progressRestored, setProgressRestored] = useState(false);
  const focusAfterAction = useRef(false);
  const componentId = useId();
  const t = copy[locale];

  useEffect(() => {
    let current = true;
    if (!pattern) { setLoadState({ status: "error" }); return; }
    setLoadState({ status: "loading" });
    setProgressRestored(false);
    loadTraceChunk(pattern, pythonArtifact).then((chunk) => {
      if (!current) return;
      const fallback = chunk.scenarios.find((scenario) => scenario.case_kind === "normal") ?? chunk.scenarios[0];
      let restored = null;
      try {
        const serialized = window.sessionStorage.getItem(DATA_MODELS_PROGRESS_KEY);
        if (serialized) restored = restoreDataModelsProgress(JSON.parse(serialized), chunk, projection);
        if (serialized && !restored) window.sessionStorage.removeItem(DATA_MODELS_PROGRESS_KEY);
      } catch {
        try { window.sessionStorage.removeItem(DATA_MODELS_PROGRESS_KEY); } catch { /* Storage may be unavailable. */ }
      }
      const scenario = restored ? chunk.scenarios.find((item) => item.scenario_id === restored.scenarioId) ?? fallback : fallback;
      if (!scenario || (scenario.case_kind !== "normal" && !restored?.normalComplete)) throw new Error("Data Models has no valid learner scenario.");
      setLoadState({ status: "ready", chunk });
      setScenarioId(scenario.scenario_id);
      setEventIndex(restored?.eventIndex ?? 0);
      setSelectedOptions(restored?.selectedOptions ?? {});
      setRevealedEventIds(new Set(restored?.revealedEventIds ?? []));
      setNormalComplete(restored?.normalComplete ?? false);
      setProgressRestored(true);
    }).catch(() => { if (current) setLoadState({ status: "error" }); });
    return () => { current = false; };
  }, [loadRevision, pattern?.pattern_id, pattern?.trace_url, projection, pythonArtifact.code_sha256]);

  const activeScenario = loadState.chunk?.scenarios.find((scenario) => scenario.scenario_id === scenarioId);
  const scenarioEvents = useMemo(() => {
    if (!loadState.chunk || !activeScenario) return [];
    try { return projectDataModelsEvents(activeScenario.case_kind, selectScenarioEvents(loadState.chunk, activeScenario.scenario_id)); }
    catch { return []; }
  }, [activeScenario, loadState.chunk]);
  const safeEventIndex = Math.min(eventIndex, Math.max(0, scenarioEvents.length - 1));
  const event = scenarioEvents[safeEventIndex];
  const phase = event && revealedEventIds.has(event.event_id) ? "revealed" : "predict";
  const model = event && activeScenario ? adaptDataModelsEvent(event, activeScenario, safeEventIndex, projection, phase) : null;
  const selectedOption = event ? selectedOptions[event.event_id] : undefined;
  const incorrect = Boolean(model?.mode === "choice" && selectedOption && selectedOption !== model.correctOptionId && phase === "predict");

  const persist = (next: Readonly<{ scenarioId: string; eventIndex: number; eventId: string; normalComplete: boolean; selectedOptions: Readonly<Record<string, string>>; revealedEventIds: readonly string[] }>) => {
    if (!loadState.chunk) return;
    try { window.sessionStorage.setItem(DATA_MODELS_PROGRESS_KEY, JSON.stringify(createDataModelsProgress(next, loadState.chunk, projection))); }
    catch { /* Storage is progressive enhancement. */ }
  };

  useEffect(() => {
    if (!progressRestored || !event || !loadState.chunk) return;
    persist({ scenarioId, eventIndex: safeEventIndex, eventId: event.event_id, normalComplete, selectedOptions, revealedEventIds: [...revealedEventIds] });
  }, [event, loadState.chunk, normalComplete, progressRestored, revealedEventIds, safeEventIndex, scenarioId, selectedOptions]);
  useEffect(() => { onLearnerProgress(normalComplete); }, [normalComplete, onLearnerProgress]);
  useEffect(() => {
    if (!focusAfterAction.current || !model) return;
    focusAfterAction.current = false;
    requestAnimationFrame(() => document.getElementById(`${componentId}-decision-heading`)?.focus());
  }, [componentId, model]);

  if (!pattern || loadState.status === "error" || (loadState.status === "ready" && (!activeScenario || !event || !model))) {
    return <section className={styles.empty} role="alert"><p>{t.error}</p><button type="button" onClick={() => setLoadRevision((value) => value + 1)}>{t.retry}</button></section>;
  }
  if (loadState.status === "loading" || !loadState.chunk || !activeScenario || !event || !model) return <section className={styles.empty} role="status" aria-live="polite">{t.loading}</section>;

  const completeWorkedExample = () => {
    const nextEvent = scenarioEvents[1];
    if (!nextEvent) return;
    const nextRevealed = new Set([...revealedEventIds, event.event_id]);
    setRevealedEventIds(nextRevealed);
    setEventIndex(1);
    persist({ scenarioId, eventIndex: 1, eventId: nextEvent.event_id, normalComplete, selectedOptions, revealedEventIds: [...nextRevealed] });
    focusAfterAction.current = true;
  };
  const choose = (optionId: string) => {
    const nextSelected = { ...selectedOptions, [event.event_id]: optionId };
    setSelectedOptions(nextSelected);
    if (optionId !== model.correctOptionId) {
      persist({ scenarioId, eventIndex: safeEventIndex, eventId: event.event_id, normalComplete, selectedOptions: nextSelected, revealedEventIds: [...revealedEventIds] });
      return;
    }
    const nextRevealed = new Set([...revealedEventIds, event.event_id]);
    const nextNormalComplete = normalComplete || (activeScenario.case_kind === "normal" && scenarioEvents.every((item) => nextRevealed.has(item.event_id)));
    setRevealedEventIds(nextRevealed);
    setNormalComplete(nextNormalComplete);
    persist({ scenarioId, eventIndex: safeEventIndex, eventId: event.event_id, normalComplete: nextNormalComplete, selectedOptions: nextSelected, revealedEventIds: [...nextRevealed] });
    focusAfterAction.current = true;
  };
  const navigate = (nextIndex: number) => {
    const target = scenarioEvents[nextIndex];
    if (!target || activeScenario.case_kind !== "normal") return;
    setEventIndex(nextIndex);
    persist({ scenarioId, eventIndex: nextIndex, eventId: target.event_id, normalComplete, selectedOptions, revealedEventIds: [...revealedEventIds] });
    focusAfterAction.current = true;
  };
  const reset = () => {
    const targetIndex = activeScenario.case_kind === "boundary" ? scenarioEvents.length - 1 : 0;
    const first = scenarioEvents[targetIndex];
    if (!first) return;
    setEventIndex(targetIndex);
    setSelectedOptions({});
    setRevealedEventIds(new Set());
    const nextNormalComplete = activeScenario.case_kind === "normal" ? false : normalComplete;
    setNormalComplete(nextNormalComplete);
    persist({ scenarioId, eventIndex: targetIndex, eventId: first.event_id, normalComplete: nextNormalComplete, selectedOptions: {}, revealedEventIds: [] });
    focusAfterAction.current = true;
  };
  const changeScenario = (caseKind: string) => {
    if (caseKind !== "normal" && !normalComplete) return;
    const scenario = loadState.chunk!.scenarios.find((item) => item.case_kind === caseKind);
    if (!scenario) return;
    const projected = projectDataModelsEvents(scenario.case_kind, selectScenarioEvents(loadState.chunk!, scenario.scenario_id));
    const targetIndex = caseKind === "boundary" ? projected.length - 1 : 0;
    if (!projected[targetIndex]) return;
    setScenarioId(scenario.scenario_id);
    setEventIndex(targetIndex);
    setSelectedOptions({});
    setRevealedEventIds(new Set());
    persist({ scenarioId: scenario.scenario_id, eventIndex: targetIndex, eventId: projected[targetIndex].event_id, normalComplete, selectedOptions: {}, revealedEventIds: [] });
    focusAfterAction.current = true;
  };

  const isNormal = activeScenario.case_kind === "normal";
  const progress = isNormal ? ((safeEventIndex + 1) / 3) * 100 : 100;
  return <section className={styles.dataModelsRuntime} data-runtime-version="paper4-data-models-novice-v3" data-testid="paper4-data-models-runtime" data-case-kind={activeScenario.case_kind} data-checkpoint-index={safeEventIndex} data-normal-complete={normalComplete} lang={locale}>
    <p className={styles.traceReminder} data-trace-reminder>{learnerText(projection.stages.trace.reminder, locale)}</p>
    <div className={styles.progressMeta}><strong>{isNormal ? `${t.step} ${safeEventIndex + 1} ${t.of} 3` : learnerText(projection.stages.trace.variants.find((variant) => variant.kind === activeScenario.case_kind)!.label, locale)}</strong></div>
    <div className={styles.progressTrack} data-testid="data-models-event-progress" data-event-index={safeEventIndex} role="progressbar" aria-valuemin={1} aria-valuemax={isNormal ? 3 : 1} aria-valuenow={isNormal ? safeEventIndex + 1 : 1} aria-label={isNormal ? `${t.step} ${safeEventIndex + 1}` : t.scenario}><span style={{ width: `${progress}%` }} /></div>
    <div className={styles.noviceDecisionLayout}>
      <article className={`${styles.panel} ${styles.binaryCode}`} data-panel="code" data-primary-panel="true" aria-labelledby={`${componentId}-decision-heading`}>
        <h3 id={`${componentId}-decision-heading`} tabIndex={-1}>{learnerText(model.heading, locale)}</h3>
        <LearnerCodeCard caption={t.code} lines={model.codeFocus} locale={locale} activeLineIndex={0} />
        {model.context && <p className={styles.checkpointPrompt}>{learnerText(model.context, locale)}</p>}
      </article>
      <ArrayRecordWorkbench model={model} locale={locale} headingId={`${componentId}-scene-heading`} />
      {model.mode === "worked" ? <section className={styles.workedDecision} data-decision-kind="worked" aria-labelledby={`${componentId}-decision-heading`}>
        <dl>{model.workedRows.map((row, index) => <div key={index}><dt>{learnerText(row.label, locale)}</dt><dd>{learnerText(row.value, locale)}</dd></div>)}</dl>
        {model.examSentence && <p className={styles.examSentence} data-exam-sentence><strong>{t.examSentence}:</strong> {learnerText(model.examSentence, locale)}</p>}
        <button type="button" data-action="understand" onClick={completeWorkedExample}>{learnerText(model.continueLabel!, locale)}</button>
      </section> : <section className={styles.choiceDecision} data-decision-kind="choice" data-choice-count={model.options.length} aria-labelledby={`${componentId}-choice`}>
        <h3 id={`${componentId}-choice`}>{learnerText(model.question!, locale)}</h3>
        <div className={styles.decisionOptions} role="group" aria-labelledby={`${componentId}-choice`}>{model.options.map((option) => <button type="button" key={option.id} data-option-id={option.id} aria-pressed={selectedOption === option.id} disabled={phase === "revealed"} onClick={() => choose(option.id)}>{learnerText(option.label, locale)}</button>)}</div>
        {incorrect && <p className={styles.retryHint} data-feedback="retry" role="alert"><strong>{t.tryAgain}:</strong> {learnerText(model.retryHint!, locale)}</p>}
        {phase === "revealed" && <div className={styles.correctReveal} data-answer-revealed="true" role="status">
          <p data-feedback="correct">{learnerText(model.correctFeedback!, locale)}</p>
          {model.examSentence && <p className={styles.examSentence} data-exam-sentence><strong>{t.examSentence}:</strong> {learnerText(model.examSentence, locale)}</p>}
        </div>}
      </section>}
      <nav className={`${styles.controls} ${styles.binaryControls}`} aria-label={projection.stages.trace.name[locale]}>
        <button type="button" data-action="previous" onClick={() => navigate(safeEventIndex - 1)} disabled={!isNormal || safeEventIndex === 0}>← {t.previous}</button>
        <button type="button" data-action="next" onClick={() => navigate(safeEventIndex + 1)} disabled={!isNormal || phase === "predict" || safeEventIndex >= 2}>{t.next} →</button>
        <button type="button" data-action="reset" onClick={reset}>↺ {t.reset}</button>
      </nav>
    </div>
    {normalComplete && isNormal && <p className={styles.completionNote} role="status">{t.complete}</p>}
    <label className={styles.learnerScenarioSelect} htmlFor={`${componentId}-scenario`}><strong>{t.scenario}</strong><select id={`${componentId}-scenario`} value={activeScenario.case_kind} onChange={(change) => changeScenario(change.currentTarget.value)}>{["normal", "boundary", "failure"].map((kind) => <option key={kind} value={kind} disabled={kind !== "normal" && !normalComplete}>{kind === "normal" ? projection.stages.trace.scenario.label[locale] : projection.stages.trace.variants.find((variant) => variant.kind === kind)!.label[locale]}</option>)}</select>{!normalComplete && <small>{t.transferLocked}</small>}</label>
  </section>;
}
