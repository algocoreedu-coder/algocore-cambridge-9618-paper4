"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, CodePanel, Feedback, Textarea } from "@/app/components/algocore-ui";
import type { QueueLearnerProjection, QueueState } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import {
  QUEUE_PRACTICE_KEY,
  QUEUE_PRACTICE_SCHEMA,
  QUEUE_PROGRESS_KEY,
  QUEUE_PROJECTION_SHA256,
  createInitialQueueProgress,
  isQueueComplete,
  queueCheckpointId,
  queueStep,
  queueVariants,
  restoreQueuePractice,
  restoreQueueProgress,
  type QueueCheckpointId,
  type QueueTraceProgress,
} from "./queueProjectionAdapter";
import type { LearningLocale } from "./types";
import styles from "./LessonLearningPage.module.css";

const copy = {
  en: {
    free: "free", physical: "Physical slots", logical: "Logical FIFO order", hidden: "Predict before reveal",
    operation: "Pending operation", outcome: "Outcome", front: "front · next removal", rear: "rear · next insertion",
    count: "count", prediction: "Your prediction", placeholder: "State the guard, physical action, pointers, count and FIFO order…",
    record: "Record prediction", recorded: "Prediction recorded", previous: "Previous", next: "Next",
    support: "Rejected operations: every field stays unchanged", attemptBoundary: "Predict the outcome and unchanged fields",
    recordBoundary: "Check rejection", before: "Before", after: "After", micro: "Non-mutating micro-evidence",
    practice: "Practice item", of: "of", answer: "Your answer", attempt: "Record attempt",
    attempted: "Attempt recorded. Support is now available.", hint: "Hint", model: "Model answer", check: "Success check",
    previousPractice: "Previous practice", nextPractice: "Next practice",
  },
  vi: {
    free: "trống", physical: "Các ô vật lý", logical: "Thứ tự FIFO logic", hidden: "Dự đoán trước khi mở",
    operation: "Operation sắp chạy", outcome: "Outcome", front: "front · removal tiếp theo", rear: "rear · insertion tiếp theo",
    count: "count", prediction: "Dự đoán của bạn", placeholder: "Nêu guard, thao tác vật lý, pointer, count và thứ tự FIFO…",
    record: "Ghi nhận dự đoán", recorded: "Đã ghi nhận dự đoán", previous: "Trước", next: "Tiếp",
    support: "Operation bị từ chối: mọi field giữ nguyên", attemptBoundary: "Dự đoán outcome và các field không đổi",
    recordBoundary: "Kiểm tra từ chối", before: "Trước", after: "Sau", micro: "Micro-evidence không mutation",
    practice: "Bài luyện", of: "trên", answer: "Câu trả lời", attempt: "Ghi nhận lần làm",
    attempted: "Đã ghi nhận. Phần hỗ trợ đã mở.", hint: "Gợi ý", model: "Đáp án mẫu", check: "Điểm tự kiểm",
    previousPractice: "Bài luyện trước", nextPractice: "Bài luyện tiếp",
  },
} as const;

function saveTrace(progress: QueueTraceProgress) {
  try { sessionStorage.setItem(QUEUE_PROGRESS_KEY, JSON.stringify(progress)); } catch { /* Storage can be unavailable. */ }
}

function formatItems(items: readonly (number | null)[], free: string) {
  return `[${items.map((value) => value ?? free).join(", ")}]`;
}

function formatPythonOutcome(outcome: boolean | number | null) {
  if (outcome === null) return "None";
  if (typeof outcome === "boolean") return outcome ? "True" : "False";
  return String(outcome);
}

function stateSummary(state: Pick<QueueState, "items" | "front" | "rear" | "count">, free: string, outcome?: boolean | number | null) {
  const prefix = outcome === undefined ? "" : `${formatPythonOutcome(outcome)} · `;
  return `${prefix}items ${formatItems(state.items, free)} · front ${state.front} · rear ${state.rear} · count ${state.count}`;
}

export function QueueTrace({ projection, locale, onLearnerProgress }: Readonly<{
  projection: QueueLearnerProjection;
  locale: LearningLocale;
  onLearnerProgress: (complete: boolean) => void;
}>) {
  const t = copy[locale];
  const [progress, setProgress] = useState<QueueTraceProgress>(createInitialQueueProgress);
  const [restored, setRestored] = useState(false);
  const variants = useMemo(() => queueVariants(projection), [projection]);
  const checkpointId = queueCheckpointId(progress.checkpoint_index);
  const step = queueStep(projection, progress.checkpoint_index);
  const draft = progress.drafts[checkpointId] ?? "";
  const revealed = progress.revealed_checkpoint_ids.includes(checkpointId);
  const complete = isQueueComplete(progress);

  useEffect(() => {
    const saved = restoreQueueProgress(sessionStorage.getItem(QUEUE_PROGRESS_KEY));
    if (saved) setProgress(saved);
    setRestored(true);
  }, []);
  useEffect(() => { if (restored) onLearnerProgress(complete); }, [complete, onLearnerProgress, restored]);

  const commit = (next: QueueTraceProgress) => { saveTrace(next); setProgress(next); };
  const setDraft = (value: string, key: QueueCheckpointId = checkpointId) => commit({
    ...progress,
    phase: "predict",
    drafts: { ...progress.drafts, [key]: value },
  });
  const reveal = (key: QueueCheckpointId = checkpointId) => {
    if (!progress.drafts[key]?.trim()) return;
    commit({ ...progress, phase: "revealed", revealed_checkpoint_ids: [...new Set([...progress.revealed_checkpoint_ids, key])] });
  };
  const move = (index: 0 | 1 | 2 | 3 | 4) => {
    const nextId = queueCheckpointId(index);
    commit({ ...progress, checkpoint_index: index, phase: progress.revealed_checkpoint_ids.includes(nextId) ? "revealed" : "predict" });
    requestAnimationFrame(() => document.getElementById("queue-trace-prediction")?.focus());
  };

  const before = progress.checkpoint_index === 0
    ? { items: projection.stages.trace.scenario.initial_items, front: 0, rear: 0, count: 0, logical: [] as number[] }
    : projection.stages.trace.steps[progress.checkpoint_index - 1].expected;
  const shown = revealed ? step.expected : before;
  const operation = step.operation.join(" ");
  const slotIsLive = (index: number) => shown.count > 0 && ((index - shown.front + shown.items.length) % shown.items.length) < shown.count;

  return <section className={styles.queueTrace} data-testid="paper4-queue-trace" data-scene="circular-front-rear-count" data-case-kind="normal-circular-wrap" data-checkpoint-index={progress.checkpoint_index} data-phase={revealed ? "revealed" : "predict"} data-queue-complete={complete ? "true" : "false"}>
    <div className={styles.queuePanels}>
      <section className={styles.queueVisual} data-trace-panel="queue-state">
        <div className={styles.queueOperation} data-queue-operation><strong>{t.operation}</strong><span>{operation}</span></div>
        <div className={styles.queueBadges}>
          <span data-queue-front>{t.front}: <strong>{shown.front}</strong></span>
          <span data-queue-rear>{t.rear}: <strong>{shown.rear}</strong></span>
          <span data-queue-count>{t.count}: <strong>{shown.count}</strong></span>
        </div>
        <h4>{t.physical}</h4>
        <div className={styles.queueSlots}>
          {shown.items.map((value, index) => <div key={index} data-queue-slot-index={index} data-queue-slot-state={slotIsLive(index) ? "live" : "free"}>
            <small>index {index}</small><strong>{value ?? t.free}</strong>
          </div>)}
        </div>
        <div className={styles.queueLogical} data-logical-order>
          <strong>{t.logical}</strong>
          <span>{revealed ? `[${step.expected.logical.join(", ")}]` : t.hidden}</span>
          {revealed && progress.checkpoint_index === 4 && <small>{t.micro}: total {projection.stages.trace.inspection.numeric_total}</small>}
        </div>
        <div className={styles.queueOutcome} data-queue-outcome>{revealed ? <><strong>{t.outcome}</strong><span>{formatPythonOutcome(step.expected.outcome)}</span></> : <span>{t.hidden}</span>}</div>
        <div data-code-panel="queue-focus"><CodePanel title="Focused Python" caption={`${t.operation}: ${operation}`} lines={step.code_focus.map((text, index) => ({ number: index + 1, text, active: true }))} /></div>
      </section>
      <section className={styles.queuePrediction} data-trace-panel="prediction" data-trace-prediction>
        <Textarea id="queue-trace-prediction" label={learnerText(step.prediction, locale)} placeholder={t.placeholder} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={() => reveal()}>{t.record}</Button>
        <p className={styles.statusText} aria-live="polite">{revealed ? t.recorded : ""}</p>
        {revealed && <div data-answer-revealed="true"><Feedback status="info" title={t.recorded}>{learnerText(step.answer, locale)}</Feedback></div>}
      </section>
    </div>
    <nav className={styles.traceStepNav} aria-label={projection.stages.trace.name[locale]}>
      <Button variant="secondary" data-action="previous" disabled={progress.checkpoint_index === 0} onClick={() => move((progress.checkpoint_index - 1) as 0 | 1 | 2 | 3 | 4)}>← {t.previous}</Button>
      <Button variant="secondary" data-action="next" disabled={!revealed || progress.checkpoint_index === 4} onClick={() => move((progress.checkpoint_index + 1) as 0 | 1 | 2 | 3 | 4)}>{t.next} →</Button>
    </nav>
    {complete && <section className={styles.queueSupport}>
      <h3>{t.support}</h3>
      <div>{variants.map((variant, index) => {
        const key: QueueCheckpointId = index === 0 ? "boundary:empty" : "boundary:full";
        const boundaryDraft = progress.drafts[key] ?? "";
        const open = progress.revealed_checkpoint_ids.includes(key);
        return <article key={variant.kind} data-support-case={variant.kind} data-case-kind={index === 0 ? "boundary-empty-dequeue" : "boundary-full-enqueue"}>
          <h4>{index === 0 ? "dequeue() · underflow" : "enqueue(7) · overflow"}</h4>
          <Textarea id={`queue-support-${variant.kind}`} label={t.attemptBoundary} value={boundaryDraft} rows={3} onChange={(event) => setDraft(event.target.value, key)} />
          <Button data-action={index === 0 ? "reveal-empty" : "reveal-full"} disabled={!boundaryDraft.trim()} onClick={() => reveal(key)}>{t.recordBoundary}</Button>
          {open && <div data-support-revealed="true" className={styles.queueBeforeAfter}>
            <div><strong>{t.before}</strong><p>{stateSummary(variant.input, t.free)}</p></div>
            <div><strong>{t.after}</strong><p>{stateSummary(variant.expected, t.free, variant.expected.outcome)}</p></div>
            <p>{learnerText(variant.explanation, locale)}</p>
          </div>}
        </article>;
      })}</div>
    </section>}
  </section>;
}

type PracticeStage = QueueLearnerProjection["stages"]["practise"];

export function QueuePractice({ stage, locale, onAttemptChange }: Readonly<{
  stage: PracticeStage;
  locale: LearningLocale;
  onAttemptChange?: (attempted: boolean) => void;
}>) {
  const t = copy[locale];
  const input = useRef<HTMLTextAreaElement>(null);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set);
  const [restored, setRestored] = useState(false);
  const item = stage.items[index];
  const draft = drafts[index] ?? "";
  const done = attempted.has(index);
  const marker = ["enqueue", "dequeue", "rejection", "circular-rear-last", "linear-rear-next", "linear-rear-last"][index];

  useEffect(() => {
    const saved = restoreQueuePractice(sessionStorage.getItem(QUEUE_PRACTICE_KEY));
    if (saved) { setIndex(saved.index); setDrafts({ ...saved.drafts }); setAttempted(new Set(saved.attempted)); }
    setRestored(true);
  }, []);
  const persist = (nextIndex: number, nextDrafts: Record<number, string>, nextAttempted: ReadonlySet<number>) => {
    try {
      sessionStorage.setItem(QUEUE_PRACTICE_KEY, JSON.stringify({
        schema_version: QUEUE_PRACTICE_SCHEMA,
        projection_sha256: QUEUE_PROJECTION_SHA256,
        index: nextIndex,
        drafts: nextDrafts,
        attempted: [...nextAttempted],
      }));
    } catch { /* Storage can be unavailable. */ }
  };
  useEffect(() => { if (restored) persist(index, drafts, attempted); }, [attempted, drafts, index, restored]);
  useEffect(() => onAttemptChange?.(attempted.size > 0), [attempted, onAttemptChange]);

  if (!item) return null;
  const record = () => {
    if (!draft.trim()) return;
    const nextAttempted = new Set([...attempted, index]);
    persist(index, drafts, nextAttempted);
    setAttempted(nextAttempted);
  };
  const move = (nextIndex: number) => {
    persist(nextIndex, drafts, attempted);
    setIndex(nextIndex);
    requestAnimationFrame(() => input.current?.focus());
  };
  const level = typeof item.level === "string" ? item.level : learnerText(item.level, locale);

  return <div className={`${styles.practiceJourney} ${styles.queuePractice}`} data-practice-gate="attempt-before-reveal" data-practice-index={index}>
    <p>{learnerText(stage.attempt_rule, locale)}</p>
    <article className={styles.learnerCard} data-transfer-card={marker}>
      <header className={styles.cardHeader}><div><span>{level}</span><h3>{learnerText(item.title, locale)}</h3></div><strong>{t.practice} {index + 1} {t.of} 6</strong></header>
      <p>{learnerText(item.prompt, locale)}</p>
      <label className={styles.responseField}><span>{t.answer}</span><textarea ref={input} rows={5} value={draft} onChange={(event) => { const nextDrafts = { ...drafts, [index]: event.target.value }; persist(index, nextDrafts, attempted); setDrafts(nextDrafts); }} /></label>
      <button className={styles.learningButton} data-action="record-practice" disabled={!draft.trim()} onClick={record}>{t.attempt}</button>
      <p className={styles.statusText} aria-live="polite">{done ? t.attempted : ""}</p>
      {done && <div className={styles.afterAttempt} data-answer-revealed="true">
        {index >= 3 && <aside data-static-convention><strong>{learnerText(item.title, locale)}</strong><p>{learnerText(item.model_answer, locale)}</p></aside>}
        <details><summary>{t.hint}</summary><p>{learnerText(item.hint, locale)}</p></details>
        {index < 3 && <details><summary>{t.model}</summary><p>{learnerText(item.model_answer, locale)}</p></details>}
        <p><strong>{t.check}: </strong>{learnerText(item.success_check, locale)}</p>
      </div>}
    </article>
    <nav className={styles.itemNav} aria-label={stage.name[locale]}>
      <button data-action="previous-practice" disabled={index === 0} onClick={() => move(index - 1)}>← {t.previousPractice}</button>
      <button data-action="next-practice" disabled={index === 5 || !done} onClick={() => move(index + 1)}>{t.nextPractice} →</button>
    </nav>
  </div>;
}
