"use client";

import {
  FormEvent,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useState,
} from "react";

import styles from "./Paper4VisualRuntime.module.css";
import { viInvariantTranslations } from "./invariantTranslations";
import {
  createInitialRuntimeState,
  runtimeReducer,
} from "./reducer";
import type {
  JsonValue,
  Locale,
  Paper4VisualRuntimeProps,
  VisualEvent,
} from "./types";

const copy = {
  vi: {
    eyebrow: "Phòng luyện Paper 4",
    pattern: "Dạng bài",
    language: "Ngôn ngữ",
    vietnamese: "Tiếng Việt",
    english: "English",
    previous: "Bước trước",
    next: "Bước tiếp",
    play: "Chạy",
    pause: "Tạm dừng",
    reset: "Làm lại",
    step: "Bước",
    of: "trên",
    code: "Mã lệnh",
    state: "Trạng thái",
    trace: "Luồng thực thi",
    output: "Kết quả",
    invariant: "Điều phải luôn đúng",
    before: "Trước",
    change: "Thay đổi",
    after: "Sau",
    noOutput: "Chưa có output ở bước này.",
    current: "Đang xét",
    prediction: "Dừng và dự đoán",
    predictionHint: "Nhập tên hoặc loại của event tiếp theo.",
    yourPrediction: "Dự đoán của bạn",
    checkPrediction: "Kiểm tra dự đoán",
    correct: "Đúng. Hãy tiếp tục và đối chiếu trạng thái.",
    incorrect: "Chưa đúng. Đáp án dự kiến là",
    traceComplete: "Bạn đã đến cuối trace. Dùng Làm lại để luyện lại.",
    scenarioInput: "Đổi tình huống đầu vào",
    inputHint: "Chọn trace normal, boundary hoặc failure cho lượt chạy mới.",
    applyInput: "Áp dụng tình huống",
    chooseScenario: "Chọn tình huống",
    normalScenario: "Normal · luồng chuẩn",
    boundaryScenario: "Boundary · giá trị biên",
    failureScenario: "Failure · nhánh lỗi",
    revision: "Lượt dữ liệu",
    runContext: "Context của lượt chạy",
    defaultRunContext: "Dùng trace chuẩn đã phát hành",
    eventAnnouncement: "Event hiện tại",
    synchronizedStep: "Cùng bước code–state",
    memoryHeading: "Mẹo nhớ cách giải",
    memoryCue: "Gọi tên event → dự đoán thay đổi → kiểm tra bất biến → đối chiếu output.",
    fallbackHeading: "Bản đọc tĩnh của bước hiện tại",
    feedbackLabel: "Kết quả dự đoán",
    empty: "Registry chưa có pattern có event hợp lệ.",
    staticFallback: "Trình duyệt cần JavaScript để chạy visual từng bước.",
  },
  en: {
    eyebrow: "Paper 4 practice lab",
    pattern: "Question pattern",
    language: "Language",
    vietnamese: "Tiếng Việt",
    english: "English",
    previous: "Previous",
    next: "Next",
    play: "Play",
    pause: "Pause",
    reset: "Reset",
    step: "Step",
    of: "of",
    code: "Code",
    state: "State",
    trace: "Execution trace",
    output: "Output",
    invariant: "Invariant to protect",
    before: "Before",
    change: "Change",
    after: "After",
    noOutput: "No output is produced at this step.",
    current: "Current",
    prediction: "Pause and predict",
    predictionHint: "Enter the name or type of the next event.",
    yourPrediction: "Your prediction",
    checkPrediction: "Check prediction",
    correct: "Correct. Continue and compare the resulting state.",
    incorrect: "Not yet. The expected event is",
    traceComplete: "You reached the end of the trace. Reset to practise again.",
    scenarioInput: "Change input scenario",
    inputHint: "Choose the normal, boundary or failure trace for the next run.",
    applyInput: "Apply scenario",
    chooseScenario: "Choose a scenario",
    normalScenario: "Normal · standard flow",
    boundaryScenario: "Boundary · edge value",
    failureScenario: "Failure · error path",
    revision: "Input run",
    runContext: "Run context",
    defaultRunContext: "Using the released canonical trace",
    eventAnnouncement: "Current event",
    synchronizedStep: "Linked code–state step",
    memoryHeading: "How to remember the method",
    memoryCue: "Name the event → predict the change → protect the invariant → check the output.",
    fallbackHeading: "Static reading of the current step",
    feedbackLabel: "Prediction feedback",
    empty: "The registry has no pattern with valid events.",
    staticFallback: "JavaScript is required for the step-by-step visual.",
  },
} as const;

function isRecord(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function localText(value: JsonValue | undefined, locale: Locale): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    const bilingual = value.match(/^VI:\s*([\s\S]*?)\s*\|\s*EN:\s*([\s\S]*)$/);
    if (bilingual) return locale === "vi" ? bilingual[1] : bilingual[2];
    if (locale === "vi") return viInvariantTranslations[value] ?? value;
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => localText(item, locale)).filter(Boolean).join("\n");
  }
  if (isRecord(value) && value[locale] !== undefined) {
    return localText(value[locale], locale);
  }
  return JSON.stringify(value, null, 2);
}

function structuredValue(value: JsonValue | undefined): JsonValue | undefined {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value).filter(
    ([key]) => key !== "vi" && key !== "en",
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function normalizeAnswer(value: string): string {
  return value.trim().toLocaleUpperCase("en-US").replace(/[\s-]+/g, "_");
}

function predictionMatches(answer: string, event: VisualEvent): boolean {
  const normalized = normalizeAnswer(answer);
  return (
    normalized === normalizeAnswer(event.source_event_label) ||
    normalized === normalizeAnswer(event.event_type)
  );
}

function DataBlock({ value }: { readonly value: JsonValue | undefined }) {
  if (value === undefined || value === null) return <span aria-hidden="true">—</span>;
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}

export function Paper4VisualRuntime({
  registry,
  initialPatternId,
  initialLocale = "vi",
  autoplayDelayMs = 1800,
  headingLevel = 2,
  className,
}: Paper4VisualRuntimeProps) {
  const availablePatterns = useMemo(
    () => registry.patterns.filter((pattern) => pattern.events.length > 0),
    [registry.patterns],
  );
  const firstPattern =
    availablePatterns.find((pattern) => pattern.pattern_id === initialPatternId) ??
    availablePatterns[0];
  const [state, dispatch] = useReducer(
    runtimeReducer,
    createInitialRuntimeState(firstPattern?.pattern_id ?? "", initialLocale),
  );
  const [predictionDraft, setPredictionDraft] = useState("");
  const [inputDraft, setInputDraft] = useState("");
  const componentId = useId();
  const pattern =
    availablePatterns.find((item) => item.pattern_id === state.patternId) ??
    firstPattern;
  const eventCount = pattern?.events.length ?? 0;
  const eventIndex = Math.min(state.eventIndex, Math.max(0, eventCount - 1));
  const event = pattern?.events[eventIndex];
  const nextEvent = pattern?.events[eventIndex + 1];
  const t = copy[state.locale];
  const RuntimeHeading = headingLevel === 3 ? "h3" : "h2";
  const activeScenario = pattern?.scenarios.find(
    (scenario) => scenario.scenario_id === state.inputValue,
  ) ?? pattern?.scenarios[0];

  useEffect(() => {
    if (!state.playing || !pattern) return;
    if (state.eventIndex >= pattern.events.length - 1) {
      dispatch({ type: "PAUSE" });
      return;
    }
    const timer = window.setTimeout(() => {
      dispatch({ type: "NEXT", eventCount: pattern.events.length });
    }, Math.max(500, autoplayDelayMs));
    return () => window.clearTimeout(timer);
  }, [autoplayDelayMs, pattern, state.eventIndex, state.playing]);

  useEffect(() => {
    setPredictionDraft("");
  }, [state.eventIndex, state.patternId]);

  useEffect(() => {
    setInputDraft("");
  }, [state.patternId]);

  if (!pattern || !event) {
    return (
      <section className={`${styles.empty} ${className ?? ""}`} role="status">
        {copy[initialLocale].empty}
      </section>
    );
  }

  const eventName = event.source_event_label.replaceAll("_", " ");
  const progress = ((eventIndex + 1) / eventCount) * 100;
  const changeInput = (submission: FormEvent<HTMLFormElement>) => {
    submission.preventDefault();
    const scenarioId = inputDraft || pattern.scenarios[0]?.scenario_id || "";
    if (!scenarioId) return;
    dispatch({ type: "CHANGE_INPUT", value: scenarioId });
  };
  const submitPrediction = (submission: FormEvent<HTMLFormElement>) => {
    submission.preventDefault();
    if (!predictionDraft.trim() || !nextEvent) return;
    dispatch({
      type: "SUBMIT_PREDICTION",
      status: predictionMatches(predictionDraft, nextEvent)
        ? "correct"
        : "incorrect",
      answer: predictionDraft.trim(),
    });
  };

  return (
    <section
      className={`${styles.runtime} ${className ?? ""}`}
      data-pattern-id={pattern.pattern_id}
      data-event-id={event.event_id}
      data-input-revision={state.inputRevision}
      data-input-value={activeScenario?.scenario_id ?? ""}
      data-scenario-id={activeScenario?.scenario_id ?? ""}
      data-scenario-kind={activeScenario?.case_kind ?? ""}
      data-testid="paper4-visual-lab"
      lang={state.locale}
      aria-labelledby={`${componentId}-title`}
    >
      <noscript>
        <section className={styles.staticFallback} data-testid="static-fallback">
          <h3>{t.fallbackHeading}</h3>
          <p>{t.staticFallback}</p>
          <p><strong>{t.code}:</strong> {event.code_lines.join(", ")}</p>
          <p><strong>{t.before}:</strong> {localText(event.before, state.locale)}</p>
          <p><strong>{t.change}:</strong> {localText(event.delta, state.locale)}</p>
          <p><strong>{t.after}:</strong> {localText(event.after, state.locale)}</p>
          <p><strong>{t.invariant}:</strong> {localText(event.invariant_or_criterion, state.locale)}</p>
        </section>
      </noscript>

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <RuntimeHeading id={`${componentId}-title`}>{pattern.title[state.locale]}</RuntimeHeading>
          <p>{pattern.purpose[state.locale]}</p>
        </div>

        <div className={styles.settings}>
          <label>
            <span>{t.pattern}</span>
            <select
              id="pattern-select"
              value={pattern.pattern_id}
              onChange={(change) =>
                dispatch({
                  type: "SELECT_PATTERN",
                  patternId: change.currentTarget.value,
                })
              }
            >
              {availablePatterns.map((item) => (
                <option key={item.pattern_id} value={item.pattern_id}>
                  {item.title[state.locale]}
                </option>
              ))}
            </select>
          </label>

          <fieldset className={styles.locale}>
            <legend>{t.language}</legend>
            {(["vi", "en"] as const).map((locale) => (
              <button
                type="button"
                key={locale}
                data-action={`locale-${locale}`}
                aria-pressed={state.locale === locale}
                onClick={() => dispatch({ type: "SET_LOCALE", locale })}
              >
                {locale === "vi" ? t.vietnamese : t.english}
              </button>
            ))}
          </fieldset>
        </div>
      </header>

      <div className={styles.progressMeta}>
        <strong>
          {t.step} {eventIndex + 1} {t.of} {eventCount}
        </strong>
        <span>{eventName}</span>
      </div>
      <div
        className={styles.progressTrack}
        data-testid="event-progress"
        data-event-id={event.event_id}
        data-event-index={eventIndex}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={eventCount}
        aria-valuenow={eventIndex + 1}
        aria-label={`${t.step} ${eventIndex + 1} ${t.of} ${eventCount}`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <p
        className={styles.srOnly}
        data-testid="runtime-announcer"
        aria-live="polite"
        aria-atomic="true"
      >
        {t.eventAnnouncement}: {eventIndex + 1}, {eventName}. {localText(event.delta, state.locale)}
      </p>

      <p
        className={styles.runContext}
        data-testid="run-context"
        data-input-revision={state.inputRevision}
      >
        <strong>{t.runContext} {state.inputRevision}:</strong>{" "}
        {activeScenario
          ? `${activeScenario.case_kind} · ${activeScenario.scenario_id}`
          : t.defaultRunContext}
      </p>

      <div className={styles.panelGrid}>
        <article
          className={`${styles.panel} ${styles.codePanel}`}
          data-panel="code"
          data-input-revision={state.inputRevision}
          data-input-value={activeScenario?.scenario_id ?? ""}
          data-scenario-kind={activeScenario?.case_kind ?? ""}
          aria-labelledby={`${componentId}-code`}
        >
          <h3 id={`${componentId}-code`}>{t.code}</h3>
          <p className={styles.syncCue} data-sync-event={event.event_id}>
            {t.synchronizedStep} {eventIndex + 1}: {eventName}
          </p>
          <ol className={styles.codeLines}>
            {event.code_lines.map((line, index) => (
              <li key={`${line}-${index}`}>
                <code>{line}</code>
              </li>
            ))}
          </ol>
        </article>

        <article
          className={`${styles.panel} ${styles.statePanel}`}
          data-panel="state"
          data-input-revision={state.inputRevision}
          data-input-value={activeScenario?.scenario_id ?? ""}
          data-scenario-kind={activeScenario?.case_kind ?? ""}
          aria-labelledby={`${componentId}-state`}
        >
          <h3 id={`${componentId}-state`}>{t.state}</h3>
          <p className={styles.syncCue} data-sync-event={event.event_id}>
            {t.synchronizedStep} {eventIndex + 1}: {eventName}
          </p>
          <div className={styles.stateSequence}>
            {([
              [t.before, event.before],
              [t.change, event.delta],
              [t.after, event.after],
            ] as const).map(([label, value]) => (
              <section key={label}>
                <h4>{label}</h4>
                <p>{localText(value, state.locale)}</p>
                <DataBlock value={structuredValue(value)} />
              </section>
            ))}
          </div>
        </article>

        <article
          className={`${styles.panel} ${styles.tracePanel}`}
          data-panel="trace"
          data-input-revision={state.inputRevision}
          data-input-value={activeScenario?.scenario_id ?? ""}
          data-scenario-kind={activeScenario?.case_kind ?? ""}
          aria-labelledby={`${componentId}-trace`}
        >
          <h3 id={`${componentId}-trace`}>{t.trace}</h3>
          <ol className={styles.traceList}>
            {pattern.events.map((traceEvent, index) => {
              const isCurrent = index === eventIndex;
              return (
                <li
                  key={traceEvent.event_id}
                  aria-current={isCurrent ? "step" : undefined}
                  data-complete={index < eventIndex || undefined}
                >
                  <span className={styles.traceNumber}>{index + 1}</span>
                  <span>{traceEvent.source_event_label.replaceAll("_", " ")}</span>
                  {isCurrent && <strong>{t.current}</strong>}
                </li>
              );
            })}
          </ol>
        </article>

        <article
          className={`${styles.panel} ${styles.outputPanel}`}
          data-panel="output"
          data-input-revision={state.inputRevision}
          data-input-value={activeScenario?.scenario_id ?? ""}
          data-scenario-kind={activeScenario?.case_kind ?? ""}
          aria-labelledby={`${componentId}-output`}
        >
          <h3 id={`${componentId}-output`}>{t.output}</h3>
          {event.output_delta === null || event.output_delta === undefined ? (
            <p>{t.noOutput}</p>
          ) : (
            <>
              <p>{localText(event.output_delta, state.locale)}</p>
              <DataBlock value={structuredValue(event.output_delta)} />
            </>
          )}
        </article>

        <article
          className={`${styles.panel} ${styles.invariantPanel}`}
          data-panel="invariant"
          data-input-revision={state.inputRevision}
          data-input-value={activeScenario?.scenario_id ?? ""}
          data-scenario-kind={activeScenario?.case_kind ?? ""}
          aria-labelledby={`${componentId}-invariant`}
        >
          <h3 id={`${componentId}-invariant`}>{t.invariant}</h3>
          <p>{localText(event.invariant_or_criterion, state.locale)}</p>
          <DataBlock value={structuredValue(event.invariant_or_criterion)} />
        </article>
      </div>

      <div className={styles.practiceGrid}>
        <section
          className={styles.practiceCard}
          data-panel="prediction"
          aria-labelledby={`${componentId}-prediction`}
        >
          <h3 id={`${componentId}-prediction`}>{t.prediction}</h3>
          {nextEvent ? (
            <form onSubmit={submitPrediction}>
              <p>{localText(event.prediction, state.locale)}</p>
              <label htmlFor={`${componentId}-prediction-input`}>
                {t.yourPrediction}
              </label>
              <p id={`${componentId}-prediction-hint`} className={styles.hint}>
                {t.predictionHint}
              </p>
              <div className={styles.inlineForm}>
                <input
                  id={`${componentId}-prediction-input`}
                  aria-describedby={`${componentId}-prediction-hint`}
                  value={predictionDraft}
                  onChange={(change) => setPredictionDraft(change.currentTarget.value)}
                  autoComplete="off"
                />
                <button type="submit" disabled={!predictionDraft.trim()}>
                  {t.checkPrediction}
                </button>
              </div>
              {state.predictionStatus !== "idle" && (
                <section
                  className={styles.feedback}
                  data-panel="feedback"
                  data-status={state.predictionStatus}
                  role="status"
                  aria-labelledby={`${componentId}-feedback`}
                >
                  <h4 id={`${componentId}-feedback`} className={styles.srOnly}>
                    {t.feedbackLabel}
                  </h4>
                  <p>
                    <strong>
                      {state.predictionStatus === "correct" ? "✓" : "!"}
                    </strong>{" "}
                    {state.predictionStatus === "correct"
                      ? t.correct
                      : `${t.incorrect} ${nextEvent.source_event_label.replaceAll("_", " ")}.`}{" "}
                    {localText(event.feedback, state.locale)}
                  </p>
                </section>
              )}
            </form>
          ) : (
            <p role="status">{t.traceComplete}</p>
          )}
        </section>
      </div>

      <nav
        className={styles.controls}
        data-role="control-bar"
        aria-label={`${t.trace}: ${eventName}`}
      >
        <button
          type="button"
          data-action="previous"
          onClick={() => dispatch({ type: "PREVIOUS" })}
          disabled={eventIndex === 0}
        >
          <span aria-hidden="true">←</span> {t.previous}
        </button>
        <button
          type="button"
          data-action="next"
          onClick={() => dispatch({ type: "NEXT", eventCount })}
          disabled={eventIndex === eventCount - 1}
        >
          {t.next} <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          data-action="play"
          onClick={() => dispatch({ type: "PLAY" })}
          disabled={state.playing || eventIndex === eventCount - 1}
        >
          <span aria-hidden="true">▶</span> {t.play}
        </button>
        <button
          type="button"
          data-action="pause"
          onClick={() => dispatch({ type: "PAUSE" })}
          disabled={!state.playing}
        >
          <span aria-hidden="true">Ⅱ</span> {t.pause}
        </button>
        <button
          type="button"
          data-action="reset"
          onClick={() => dispatch({ type: "RESET" })}
        >
          <span aria-hidden="true">↺</span> {t.reset}
        </button>
      </nav>

      <div className={styles.supportGrid}>
        <section className={styles.practiceCard} aria-labelledby={`${componentId}-input`}>
          <h3 id={`${componentId}-input`}>{t.scenarioInput}</h3>
          <form onSubmit={changeInput}>
            <label htmlFor={`${componentId}-scenario-input`}>{t.inputHint}</label>
            <div className={styles.inlineForm}>
              <select
                id={`${componentId}-scenario-input`}
                value={inputDraft || activeScenario?.scenario_id || ""}
                onChange={(change) => setInputDraft(change.currentTarget.value)}
              >
                <option value="" disabled>{t.chooseScenario}</option>
                {pattern.scenarios.map((scenario) => (
                  <option key={scenario.scenario_id} value={scenario.scenario_id}>
                    {scenario.case_kind === "normal"
                      ? t.normalScenario
                      : scenario.case_kind === "boundary"
                        ? t.boundaryScenario
                        : t.failureScenario}
                  </option>
                ))}
              </select>
                <button type="submit" data-action="change-input">
                  {t.applyInput}
                </button>
            </div>
          </form>
          <p className={styles.revision} aria-live="polite">
            {t.revision}: {state.inputRevision}
            {activeScenario ? ` · ${activeScenario.case_kind}` : ""}
          </p>
        </section>

        <aside
          className={styles.memoryCue}
          data-testid="memory-cue"
          aria-labelledby={`${componentId}-memory-cue`}
        >
          <h3 id={`${componentId}-memory-cue`}>{t.memoryHeading}</h3>
          <p><strong>{eventName}:</strong> {t.memoryCue}</p>
        </aside>
      </div>

      <footer className={styles.provenance}>
        <span>{registry.source_release_id}</span>
        <span>{pattern.source_batch}</span>
        <code title={registry.source_manifest_sha256}>
          {registry.source_manifest_sha256.slice(0, 12)}…
        </code>
      </footer>
    </section>
  );
}
