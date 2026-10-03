"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { learnerText, type LearnerProjection } from "./learnerProjection";
import type { LearningLocale, Localized } from "./types";
import styles from "./DecisionRailTrace.module.css";

export const DECISION_RAIL_LESSONS = new Set([
  "binary-tree",
  "dictionary",
  "exam-workflow",
  "exceptions",
  "graphs",
  "hashing",
  "object-files",
  "oop-aggregation",
  "oop-inheritance",
  "oop-model",
  "oop-state",
  "random-files",
  "text-files",
]);

type RailStep = Readonly<{
  step?: number;
  code_focus?: readonly string[];
  prediction?: Localized;
  answer?: Localized;
}>;

type RailVariant = Readonly<{
  kind?: string;
  label?: Localized;
  question?: Localized;
  code_focus?: readonly string[];
  input?: Readonly<Record<string, unknown>>;
  expected?: Readonly<Record<string, unknown>>;
  explanation?: Localized;
  options?: readonly Readonly<{ id: string; label: Localized }>[];
  correct_option_id?: string;
  retry_hint?: Localized;
  correct_feedback?: Localized;
  misconception_feedback?: Localized;
}>;

type RailScenario = Readonly<{
  id: string;
  kind: "normal" | "boundary" | "failure" | "transfer";
  label: string;
  checkpoints: readonly RailCheckpoint[];
}>;

type RailCheckpoint = Readonly<{
  id: string;
  prediction: string;
  focus: readonly string[];
  input?: Readonly<Record<string, unknown>>;
  result?: Readonly<Record<string, unknown>>;
  explanation: string;
  options?: readonly Readonly<{ id: string; label: string }>[];
  correctOptionId?: string;
  retryHint?: string;
  correctFeedback?: string;
  misconceptionFeedback?: string;
}>;

type ChoiceFeedback = Readonly<{
  status: "correct" | "incorrect";
  message: string;
  hint?: string;
}>;

const copy = {
  en: {
    title: "AlgoCore Decision Rail",
    subtitle: "Predict one decision, reveal its effect, then explain it in exam language.",
    normal: "Normal path",
    boundary: "Boundary case",
    failure: "Failure path",
    transfer: "Transfer case",
    scenario: "Scenario",
    checkpoint: "Checkpoint",
    of: "of",
    predict: "1 · Predict",
    response: "Your prediction",
    choose: "Choose one answer",
    placeholder: "State the next decision or result and give one reason…",
    focusCode: "2 · Focus code",
    focusRule: "2 · Focus rule",
    caseFacts: "Case facts",
    compare: "Compare prediction",
    check: "Check choice",
    state: "3 · State or result",
    exam: "4 · Exam sentence",
    previous: "Previous",
    next: "Next",
    reset: "Reset",
    ready: "Prediction recorded for comparison. Review the state and exam sentence.",
    locked: "Write a prediction before revealing this checkpoint.",
    chooseFirst: "Choose one answer before checking.",
    correct: "Correct decision",
    incorrect: "Not yet",
    hint: "Hint",
    noChange: "No separate state object is needed for this reasoning step.",
    true: "Yes",
    false: "No",
    none: "None",
  },
  vi: {
    title: "Đường quyết định AlgoCore",
    subtitle: "Dự đoán một quyết định, mở kết quả rồi diễn đạt bằng câu dùng được khi thi.",
    normal: "Luồng thường",
    boundary: "Trường hợp biên",
    failure: "Luồng lỗi",
    transfer: "Trường hợp chuyển giao",
    scenario: "Tình huống",
    checkpoint: "Điểm kiểm tra",
    of: "trên",
    predict: "1 · Dự đoán",
    response: "Dự đoán của em",
    choose: "Chọn một đáp án",
    placeholder: "Nêu quyết định hoặc kết quả tiếp theo và một lý do…",
    focusCode: "2 · Dòng code cần nhìn",
    focusRule: "2 · Quy tắc cần nhìn",
    caseFacts: "Dữ kiện",
    compare: "Đối chiếu dự đoán",
    check: "Kiểm tra lựa chọn",
    state: "3 · Trạng thái hoặc kết quả",
    exam: "4 · Câu dùng khi thi",
    previous: "Trước",
    next: "Tiếp",
    reset: "Làm lại",
    ready: "Đã ghi dự đoán để đối chiếu. Hãy xem trạng thái và câu dùng khi thi.",
    locked: "Hãy viết dự đoán trước khi mở điểm kiểm tra này.",
    chooseFirst: "Hãy chọn một đáp án trước khi kiểm tra.",
    correct: "Quyết định đúng",
    incorrect: "Chưa đúng",
    hint: "Gợi ý",
    noChange: "Bước suy luận này không cần một đối tượng trạng thái riêng.",
    true: "Có",
    false: "Không",
    none: "Không có",
  },
} as const;

function isLocalized(value: unknown): value is Localized {
  return Boolean(value && typeof value === "object" && "en" in value && "vi" in value);
}

function isRailStep(value: unknown): value is RailStep {
  return Boolean(value && typeof value === "object" && isLocalized((value as RailStep).prediction) && isLocalized((value as RailStep).answer));
}

function isRailVariant(value: unknown): value is RailVariant {
  return Boolean(value && typeof value === "object" && isLocalized((value as RailVariant).explanation));
}

function scenarioKind(kind = ""): RailScenario["kind"] {
  if (kind.startsWith("boundary")) return "boundary";
  if (kind.startsWith("failure") || kind.includes("invalid") || kind.includes("not_is_a")) return "failure";
  if (kind.startsWith("normal")) return "normal";
  return "transfer";
}

function scenarioLabel(kind: RailScenario["kind"], index: number, locale: LearningLocale) {
  return `${copy[locale][kind]} ${index + 1}`;
}

function buildScenarios(projection: LearnerProjection, locale: LearningLocale, conceptual: boolean): readonly RailScenario[] {
  const trace = projection.stages.trace;
  const normalSteps = trace.steps.filter(isRailStep);
  const normal: RailScenario = {
    id: "normal",
    kind: "normal",
    label: copy[locale].normal,
    checkpoints: normalSteps.map((step, index) => {
      const explanation = learnerText(step.answer!, locale);
      return {
        id: `normal-${index}`,
        prediction: learnerText(step.prediction!, locale),
        focus: (step.code_focus ?? []).slice(0, 3).map((line) => conceptual ? line.replace(/^\s*#\s?/, "").trim() : line),
        result: { [locale === "vi" ? "quyết định" : "decision"]: explanation },
        explanation,
      };
    }),
  };

  const variants = (trace.variants ?? []).filter(isRailVariant).map((variant, index): RailScenario => {
    const kind = scenarioKind(variant.kind);
    const label = variant.label ? learnerText(variant.label, locale) : scenarioLabel(kind, index, locale);
    const fallbackPrompt = locale === "vi"
      ? `Dự đoán trạng thái hoặc kết quả của ${label.toLocaleLowerCase("vi")}.`
      : `Predict the state or result for ${label.toLocaleLowerCase("en")}.`;
    return {
      id: `variant-${index}`,
      kind,
      label,
      checkpoints: [{
        id: `variant-${index}-0`,
        prediction: variant.question ? learnerText(variant.question, locale) : fallbackPrompt,
        focus: (variant.code_focus ?? []).slice(0, 3).map((line) => conceptual ? line.replace(/^\s*#\s?/, "").trim() : line),
        input: variant.input,
        result: variant.expected,
        explanation: learnerText(variant.explanation!, locale),
        options: variant.options?.map((option) => ({ id: option.id, label: learnerText(option.label, locale) })),
        correctOptionId: variant.correct_option_id,
        retryHint: variant.retry_hint ? learnerText(variant.retry_hint, locale) : undefined,
        correctFeedback: variant.correct_feedback ? learnerText(variant.correct_feedback, locale) : undefined,
        misconceptionFeedback: variant.misconception_feedback ? learnerText(variant.misconception_feedback, locale) : undefined,
      }],
    };
  });

  return [normal, ...variants].filter((scenario) => scenario.checkpoints.length > 0);
}

function readableLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function PrimitiveValue({ value, locale }: Readonly<{ value: unknown; locale: LearningLocale }>) {
  const t = copy[locale];
  if (value === null || value === undefined) return <span className={styles.emptyValue}>{t.none}</span>;
  if (typeof value === "boolean") return <span>{value ? t.true : t.false}</span>;
  if (typeof value === "string" || typeof value === "number") return <span className={typeof value === "number" ? styles.numericValue : undefined}>{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={styles.emptyValue}>∅</span>;
    return <span className={styles.valueSequence}>{value.map((item, index) => <span key={index}><PrimitiveValue value={item} locale={locale} />{index < value.length - 1 && <span aria-hidden="true"> → </span>}</span>)}</span>;
  }
  if (typeof value === "object") {
    return <span className={styles.inlineObject}>{Object.entries(value).map(([key, item]) => <span key={key}><strong>{readableLabel(key)}:</strong> <PrimitiveValue value={item} locale={locale} /></span>)}</span>;
  }
  return <span>{String(value)}</span>;
}

function StateFacts({ facts, locale }: Readonly<{ facts?: Readonly<Record<string, unknown>>; locale: LearningLocale }>) {
  if (!facts || Object.keys(facts).length === 0) return <p className={styles.emptyState}>{copy[locale].noChange}</p>;
  return <dl className={styles.stateFacts}>
    {Object.entries(facts).map(([key, value]) => <div key={key}><dt>{readableLabel(key)}</dt><dd><PrimitiveValue value={value} locale={locale} /></dd></div>)}
  </dl>;
}

export function DecisionRailTrace({ lessonSlug, projection, locale, onLearnerProgress }: Readonly<{
  lessonSlug: string;
  projection: LearnerProjection;
  locale: LearningLocale;
  onLearnerProgress: (hasRecordedPrediction: boolean) => void;
}>) {
  const conceptual = lessonSlug === "graphs";
  const t = copy[locale];
  const titleId = useId();
  const responseId = useId();
  const checkpointHeading = useRef<HTMLHeadingElement>(null);
  const scenarios = useMemo(() => buildScenarios(projection, locale, conceptual), [conceptual, locale, projection]);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [choiceFeedback, setChoiceFeedback] = useState<Record<string, ChoiceFeedback>>({});
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const [announcement, setAnnouncement] = useState("");
  const scenario = scenarios[scenarioIndex] ?? scenarios[0];
  const checkpoint = scenario?.checkpoints[checkpointIndex] ?? scenario?.checkpoints[0];
  const draft = checkpoint ? drafts[checkpoint.id] ?? "" : "";
  const selectedChoice = checkpoint ? choices[checkpoint.id] ?? "" : "";
  const feedback = checkpoint ? choiceFeedback[checkpoint.id] : undefined;
  const isChoiceCheckpoint = Boolean(checkpoint?.options?.length && checkpoint.correctOptionId);
  const isRevealed = checkpoint ? revealed.has(checkpoint.id) : false;

  useEffect(() => {
    setScenarioIndex(0);
    setCheckpointIndex(0);
    setDrafts({});
    setChoices({});
    setChoiceFeedback({});
    setRevealed(new Set());
    setAnnouncement("");
  }, [lessonSlug, projection]);

  if (!scenario || !checkpoint) return null;

  const focusCheckpoint = () => requestAnimationFrame(() => checkpointHeading.current?.focus());
  const selectScenario = (nextIndex: number) => {
    const nextCheckpoint = scenarios[nextIndex]?.checkpoints[0];
    setScenarioIndex(nextIndex);
    setCheckpointIndex(0);
    setAnnouncement("");
    onLearnerProgress(Boolean(nextCheckpoint && revealed.has(nextCheckpoint.id)));
    focusCheckpoint();
  };
  const reveal = () => {
    if (isChoiceCheckpoint) {
      if (!selectedChoice) return;
      if (selectedChoice !== checkpoint.correctOptionId) {
        setRevealed((current) => {
          const next = new Set(current);
          next.delete(checkpoint.id);
          return next;
        });
        setChoiceFeedback((current) => ({
          ...current,
          [checkpoint.id]: {
            status: "incorrect",
            message: checkpoint.misconceptionFeedback ?? checkpoint.explanation,
            hint: checkpoint.retryHint,
          },
        }));
        setAnnouncement("");
        onLearnerProgress(false);
        return;
      }
      setChoiceFeedback((current) => ({
        ...current,
        [checkpoint.id]: {
          status: "correct",
          message: checkpoint.correctFeedback ?? checkpoint.explanation,
        },
      }));
      setRevealed((current) => new Set([...current, checkpoint.id]));
      setAnnouncement("");
      onLearnerProgress(true);
      return;
    }
    if (!draft.trim()) return;
    setRevealed((current) => new Set([...current, checkpoint.id]));
    setAnnouncement(`${t.ready} ${checkpoint.explanation}`);
    onLearnerProgress(true);
  };
  const move = (direction: -1 | 1) => {
    const next = checkpointIndex + direction;
    if (next < 0 || next >= scenario.checkpoints.length) return;
    const nextCheckpoint = scenario.checkpoints[next];
    setCheckpointIndex(next);
    setAnnouncement("");
    onLearnerProgress(revealed.has(nextCheckpoint.id));
    focusCheckpoint();
  };
  const reset = () => {
    setScenarioIndex(0);
    setCheckpointIndex(0);
    setDrafts({});
    setChoices({});
    setChoiceFeedback({});
    setRevealed(new Set());
    setAnnouncement("");
    onLearnerProgress(false);
    focusCheckpoint();
  };

  return <section className={styles.rail} data-decision-rail data-lesson-slug={lessonSlug} data-conceptual={conceptual ? "true" : "false"} aria-labelledby={titleId}>
    <header className={styles.intro}>
      <div><span className={styles.eyebrow}>Predict → Focus → Change → Explain</span><h3 id={titleId}>{t.title}</h3></div>
      <p>{t.subtitle}</p>
    </header>

    <nav className={styles.scenarioTabs} aria-label={t.scenario}>
      {scenarios.map((item, index) => <button key={item.id} type="button" aria-pressed={index === scenarioIndex} data-kind={item.kind} onClick={() => selectScenario(index)}>{item.label}</button>)}
    </nav>

    <div className={styles.progressRow} role="group" aria-label={`${t.checkpoint} ${checkpointIndex + 1} ${t.of} ${scenario.checkpoints.length}`}>
      {scenario.checkpoints.map((item, index) => <span key={item.id} data-state={index < checkpointIndex ? "complete" : index === checkpointIndex ? "current" : "upcoming"}><span aria-hidden="true">{index + 1}</span><span className={styles.srOnly}>{t.checkpoint} {index + 1}</span></span>)}
    </div>

    <article className={styles.checkpoint} data-prediction-recorded={isRevealed ? "true" : "false"}>
      <header className={styles.checkpointHeader}>
        <span>{t.checkpoint} {checkpointIndex + 1} {t.of} {scenario.checkpoints.length}</span>
        <h4 ref={checkpointHeading} tabIndex={-1}>{scenario.label}</h4>
      </header>

      <div className={styles.decisionRail}>
        <section className={styles.predictPanel} aria-labelledby={`${responseId}-predict`}>
          <h5 id={`${responseId}-predict`}><span aria-hidden="true">?</span>{t.predict}</h5>
          <p>{checkpoint.prediction}</p>
          {isChoiceCheckpoint ? <>
            <fieldset className={styles.choiceGroup} data-choice-gate>
              <legend>{t.choose}</legend>
              {checkpoint.options?.map((option) => <label key={option.id} className={styles.choiceOption} data-selected={selectedChoice === option.id ? "true" : "false"}>
                <input type="radio" name={`${responseId}-choice`} value={option.id} checked={selectedChoice === option.id} onChange={() => {
                  setChoices((current) => ({ ...current, [checkpoint.id]: option.id }));
                  setChoiceFeedback((current) => {
                    const next = { ...current };
                    delete next[checkpoint.id];
                    return next;
                  });
                  setRevealed((current) => {
                    const next = new Set(current);
                    next.delete(checkpoint.id);
                    return next;
                  });
                  setAnnouncement("");
                  onLearnerProgress(false);
                }} />
                <span>{option.label}</span>
              </label>)}
            </fieldset>
            <button type="button" className={styles.revealButton} disabled={!selectedChoice} onClick={reveal}>{t.check}</button>
            {!selectedChoice && <p className={styles.gateHint}>{t.chooseFirst}</p>}
            {feedback && <div className={styles.choiceFeedback} data-choice-feedback data-status={feedback.status} role="status" aria-live="polite" aria-atomic="true">
              <strong>{feedback.status === "correct" ? t.correct : t.incorrect}</strong>
              <p>{feedback.message}</p>
              {feedback.status === "incorrect" && feedback.hint && <p><strong>{t.hint}:</strong> {feedback.hint}</p>}
            </div>}
          </> : <>
            <label htmlFor={responseId}>{t.response}</label>
            <textarea id={responseId} rows={3} value={draft} placeholder={t.placeholder} onChange={(event) => {
              const nextDraft = event.currentTarget.value;
              setDrafts((current) => ({ ...current, [checkpoint.id]: nextDraft }));
              if (isRevealed) {
                setRevealed((current) => { const next = new Set(current); next.delete(checkpoint.id); return next; });
                setAnnouncement("");
                onLearnerProgress(false);
              }
            }} />
            <button type="button" className={styles.revealButton} disabled={!draft.trim()} onClick={reveal}>{t.compare}</button>
            {!draft.trim() && <p className={styles.gateHint}>{t.locked}</p>}
          </>}
        </section>

        <section className={styles.focusPanel}>
          <h5>{conceptual ? t.focusRule : t.focusCode}</h5>
          {checkpoint.focus.length > 0
            ? conceptual
              ? <ul className={styles.ruleList}>{checkpoint.focus.map((line) => <li key={line}>{line}</li>)}</ul>
              : <pre><code>{checkpoint.focus.join("\n")}</code></pre>
            : <div><strong>{t.caseFacts}</strong><StateFacts facts={checkpoint.input} locale={locale} /></div>}
        </section>

        <section className={styles.resultPanel} aria-hidden={!isRevealed}>
          <h5>{t.state}</h5>
          {isRevealed && <StateFacts facts={checkpoint.result} locale={locale} />}
          {isRevealed && !checkpoint.result && <p>{checkpoint.explanation}</p>}
        </section>

        <section className={styles.examPanel} aria-hidden={!isRevealed}>
          <h5>{t.exam}</h5>
          {isRevealed && <p>{checkpoint.explanation}</p>}
        </section>
      </div>
    </article>

    <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

    <nav className={styles.controls} aria-label={t.title}>
      <button type="button" disabled={checkpointIndex === 0} onClick={() => move(-1)}>← {t.previous}</button>
      <button type="button" disabled={!isRevealed || checkpointIndex === scenario.checkpoints.length - 1} onClick={() => move(1)}>{t.next} →</button>
      <button type="button" className={styles.resetButton} onClick={reset}>↻ {t.reset}</button>
    </nav>
  </section>;
}
