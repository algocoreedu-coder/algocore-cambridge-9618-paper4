"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, CodePanel, Feedback, Textarea } from "@/app/components/algocore-ui";
import type { RecursionLearnerProjection } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import {
  RECURSION_PRACTICE_KEY,
  RECURSION_PRACTICE_SCHEMA,
  RECURSION_PROGRESS_KEY,
  RECURSION_PROJECTION_SHA256,
  createInitialRecursionProgress,
  isRecursionComplete,
  recursionCheckpointId,
  recursionStep,
  recursionVariants,
  restoreRecursionPractice,
  restoreRecursionProgress,
  type RecursionCheckpoint,
  type RecursionCheckpointId,
  type RecursionTraceProgress,
} from "./recursionProjectionAdapter";
import type { LearningLocale } from "./types";
import styles from "./LessonLearningPage.module.css";

const copy = {
  en: {
    active: "Active frame", stack: "Call stack", returned: "Returned subtotals", index: "index", value: "current value", pending: "pending work",
    notRead: "not read", noneYet: "Nothing returned yet", hidden: "Predict before reveal", prediction: "Your prediction",
    placeholder: "Name the next call or returned subtotal, and explain which frame owns it…", record: "Record prediction", recorded: "Prediction recorded",
    previous: "Previous", next: "Next", support: "Boundary and input check", check: "Check prediction", boundary: "Empty list boundary",
    rejection: "Wrapper rejection", practice: "Practice item", of: "of", answer: "Your answer", attempt: "Record attempt",
    attempted: "Attempt recorded. Support is now available.", hint: "Hint", model: "Model answer", success: "Success check",
    previousPractice: "Previous practice", nextPractice: "Next practice", phase: "Phase",
  },
  vi: {
    active: "Frame đang chạy", stack: "Call stack", returned: "Các subtotal đã return", index: "index", value: "current value", pending: "phép tính đang chờ",
    notRead: "không đọc", noneYet: "Chưa có value return", hidden: "Dự đoán trước khi mở", prediction: "Dự đoán của bạn",
    placeholder: "Nêu call tiếp theo hoặc subtotal return và giải thích frame nào sở hữu nó…", record: "Ghi nhận dự đoán", recorded: "Đã ghi nhận dự đoán",
    previous: "Trước", next: "Tiếp", support: "Kiểm tra boundary và input", check: "Kiểm tra dự đoán", boundary: "Boundary list rỗng",
    rejection: "Wrapper từ chối input", practice: "Bài luyện", of: "trên", answer: "Câu trả lời", attempt: "Ghi nhận lần làm",
    attempted: "Đã ghi nhận. Phần hỗ trợ đã mở.", hint: "Gợi ý", model: "Đáp án mẫu", success: "Điểm tự kiểm",
    previousPractice: "Bài luyện trước", nextPractice: "Bài luyện tiếp", phase: "Giai đoạn",
  },
} as const;

function saveTrace(progress: RecursionTraceProgress) {
  try { sessionStorage.setItem(RECURSION_PROGRESS_KEY, JSON.stringify(progress)); } catch { /* Storage may be unavailable. */ }
}

function returnedValues(checkpoint: RecursionCheckpoint, revealed: boolean) {
  if (!revealed || checkpoint < 4) return [] as number[];
  return [0, 2, 9, 13].slice(0, checkpoint - 3);
}

function visibleStackAfterReveal(step: RecursionLearnerProjection["stages"]["trace"]["steps"][number]) {
  const stackAfter = step.expected.stack_after;
  if ((step.event === "base_case" || step.event === "return") && Array.isArray(stackAfter) && stackAfter.every(Number.isInteger)) return stackAfter as readonly number[];
  return step.stack;
}

export function RecursionTrace({ projection, locale, onLearnerProgress }: Readonly<{ projection: RecursionLearnerProjection; locale: LearningLocale; onLearnerProgress: (complete: boolean) => void }>) {
  const t = copy[locale];
  const [progress, setProgress] = useState<RecursionTraceProgress>(createInitialRecursionProgress);
  const [restored, setRestored] = useState(false);
  const variants = useMemo(() => recursionVariants(projection), [projection]);
  const checkpointId = recursionCheckpointId(progress.checkpoint);
  const step = recursionStep(projection, progress.checkpoint);
  const draft = progress.drafts[checkpointId] ?? "";
  const revealed = progress.reveal_ids.includes(checkpointId);
  const complete = isRecursionComplete(progress);
  const returns = returnedValues(progress.checkpoint, revealed);
  const visibleStack = visibleStackAfterReveal(step);
  const activeFrame = step.event === "call" ? step.active_index : null;

  useEffect(() => { const saved = restoreRecursionProgress(sessionStorage.getItem(RECURSION_PROGRESS_KEY)); if (saved) setProgress(saved); setRestored(true); }, []);
  useEffect(() => { if (restored) onLearnerProgress(complete); }, [complete, onLearnerProgress, restored]);

  const commit = (next: RecursionTraceProgress) => { saveTrace(next); setProgress(next); };
  const setDraft = (value: string, key: RecursionCheckpointId = checkpointId) => commit({ ...progress, phase: key === checkpointId ? "predict" : progress.phase, drafts: { ...progress.drafts, [key]: value } });
  const reveal = (key: RecursionCheckpointId = checkpointId) => {
    if (!progress.drafts[key]?.trim()) return;
    commit({ ...progress, phase: key === checkpointId ? "revealed" : progress.phase, reveal_ids: [...new Set([...progress.reveal_ids, key])] });
  };
  const move = (checkpoint: RecursionCheckpoint) => {
    const id = recursionCheckpointId(checkpoint);
    commit({ ...progress, checkpoint, phase: progress.reveal_ids.includes(id) ? "revealed" : "predict" });
    requestAnimationFrame(() => document.getElementById("recursion-trace-prediction")?.focus());
  };
  const supports = [
    { id: "boundary:empty" as const, kind: variants[0].kind, title: t.boundary, prompt: learnerText(variants[0].explanation, locale), outcome: locale === "en" ? "[] checks index 0 == len(values), reads no item and returns 0 immediately." : "[] kiểm tra index 0 == len(values), không đọc item và trả 0 ngay." },
    { id: "rejection:non-integer" as const, kind: variants[1].kind, title: t.rejection, prompt: learnerText(variants[1].explanation, locale), outcome: locale === "en" ? '[4, "seven", 2] is rejected as INVALID_VALUE before recursion; frames created: 0.' : '[4, "seven", 2] bị từ chối với INVALID_VALUE trước recursion; số frame tạo ra: 0.' },
  ];

  return <section className={styles.recursionTrace} data-testid="paper4-recursion-trace" data-scene="call-stack-unwind" data-case-kind="normal-recursive-sum" data-checkpoint-index={progress.checkpoint} data-phase={revealed ? "revealed" : "predict"} data-recursion-complete={complete ? "true" : "false"}>
    <div className={styles.recursionPanels}>
      <section className={styles.recursionVisual} data-trace-panel="recursion-state">
        <div className={styles.recursionPhase}><strong>{t.phase}</strong><span>{learnerText(step.phase_label, locale)}</span></div>
        {revealed ? <>
          <div className={styles.recursionFrames} data-call-stack data-stack-empty={visibleStack.length === 0 ? "true" : "false"}>{visibleStack.map((frameIndex) => {
            const isBase = frameIndex === 3;
            const value = isBase ? null : projection.stages.trace.scenario.values[frameIndex];
            return <article key={frameIndex} data-frame-index={frameIndex} data-frame-active={frameIndex === activeFrame ? "true" : undefined} data-current-read={isBase ? "false" : "true"}>
              <strong>{t.index} {frameIndex}</strong>
              <span>{t.value}: {isBase ? t.notRead : value}</span>
              <small>{isBase ? "base guard first" : `${t.pending}: ${value} + child subtotal`}</small>
            </article>;
          })}</div>
          <div className={styles.recursionReturns} data-return-lane><strong>{t.returned}</strong>{returns.length ? <ol>{returns.map((value, index) => <li key={`${value}-${index}`} data-returned-subtotal={value}>{value}</li>)}</ol> : <span>{t.noneYet}</span>}</div>
          <div className={styles.recursionOutcome} data-recursion-outcome><Feedback status="info" title={t.recorded}>{learnerText(step.answer, locale)}</Feedback></div>
        </> : <div className={styles.recursionHidden} aria-label={t.hidden}>{t.hidden}</div>}
        <div data-code-panel="recursion-focus"><CodePanel title="Focused Python" caption={learnerText(step.phase_label, locale)} lines={step.code_focus.map((text, index) => ({ number: index + 1, text, active: true }))} /></div>
      </section>
      <section className={styles.recursionPrediction} data-trace-panel="prediction" data-trace-prediction>
        <Textarea id="recursion-trace-prediction" label={learnerText(step.prediction, locale)} placeholder={t.placeholder} rows={5} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={() => reveal()}>{t.record}</Button>
        <p className={styles.statusText} aria-live="polite">{revealed ? t.recorded : ""}</p>
      </section>
    </div>
    <nav className={styles.traceStepNav} aria-label={projection.stages.trace.name[locale]}>
      <Button variant="secondary" data-action="previous" disabled={progress.checkpoint === 0} onClick={() => move((progress.checkpoint - 1) as RecursionCheckpoint)}>← {t.previous}</Button>
      <Button variant="secondary" data-action="next" disabled={!revealed || progress.checkpoint === 7} onClick={() => move((progress.checkpoint + 1) as RecursionCheckpoint)}>{t.next} →</Button>
    </nav>
    {complete && <section className={styles.recursionSupport}><h3>{t.support}</h3><div>{supports.map((support) => {
      const supportDraft = progress.drafts[support.id] ?? "";
      const open = progress.reveal_ids.includes(support.id);
      return <article key={support.id} data-support-case={support.id} data-case-kind={support.kind}><h4>{support.title}</h4><p>{support.prompt}</p><Textarea id={`recursion-${support.id.replace(":", "-")}`} label={t.prediction} rows={3} value={supportDraft} onChange={(event) => setDraft(event.target.value, support.id)} /><Button data-action={`reveal-${support.id.replace(":", "-")}`} disabled={!supportDraft.trim()} onClick={() => reveal(support.id)}>{t.check}</Button>{open && <p data-support-revealed="true"><strong>{support.outcome}</strong></p>}</article>;
    })}</div></section>}
  </section>;
}

type PracticeStage = RecursionLearnerProjection["stages"]["practise"];
export function RecursionPractice({ stage, locale, onAttemptChange }: Readonly<{ stage: PracticeStage; locale: LearningLocale; onAttemptChange?: (attempted: boolean) => void }>) {
  const t = copy[locale];
  const input = useRef<HTMLTextAreaElement>(null);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set);
  const [restored, setRestored] = useState(false);
  const item = stage.items[index];
  const draft = drafts[index] ?? "";
  const done = attempted.has(index);
  const markers = ["contract", "trace-down-unwind", "write-recursive", "benefit-cost", "iterative-static", "boundary-defect"] as const;
  useEffect(() => { const saved = restoreRecursionPractice(sessionStorage.getItem(RECURSION_PRACTICE_KEY)); if (saved) { setIndex(saved.index); setDrafts({ ...saved.drafts }); setAttempted(new Set(saved.attempted)); } setRestored(true); }, []);
  const persist = (nextIndex: number, nextDrafts: Record<number, string>, nextAttempted: ReadonlySet<number>) => { try { sessionStorage.setItem(RECURSION_PRACTICE_KEY, JSON.stringify({ schema_version: RECURSION_PRACTICE_SCHEMA, projection_sha256: RECURSION_PROJECTION_SHA256, index: nextIndex, drafts: nextDrafts, attempted: [...nextAttempted] })); } catch { /* Storage may be unavailable. */ } };
  useEffect(() => { if (restored) persist(index, drafts, attempted); }, [attempted, drafts, index, restored]);
  useEffect(() => onAttemptChange?.(attempted.size > 0), [attempted, onAttemptChange]);
  if (!item) return null;
  const record = () => { if (!draft.trim()) return; const next = new Set([...attempted, index]); persist(index, drafts, next); setAttempted(next); };
  const move = (nextIndex: number) => { persist(nextIndex, drafts, attempted); setIndex(nextIndex); requestAnimationFrame(() => input.current?.focus()); };
  const level = learnerText(item.level, locale);
  return <div className={`${styles.practiceJourney} ${styles.recursionPractice}`} data-practice-gate="attempt-before-reveal" data-practice-index={index}>
    <p>{learnerText(stage.attempt_rule, locale)}</p><article className={styles.learnerCard} data-transfer-card={markers[index]}>
      <header className={styles.cardHeader}><div><span>{level}</span><h3>{learnerText(item.title, locale)}</h3></div><strong>{t.practice} {index + 1} {t.of} 6</strong></header>
      <p>{learnerText(item.prompt, locale)}</p><label className={styles.responseField}><span>{t.answer}</span><textarea ref={input} rows={5} value={draft} onChange={(event) => { const next = { ...drafts, [index]: event.target.value }; persist(index, next, attempted); setDrafts(next); }} /></label>
      <button className={styles.learningButton} data-action="record-practice" disabled={!draft.trim()} onClick={record}>{t.attempt}</button><p className={styles.statusText} aria-live="polite">{done ? t.attempted : ""}</p>
      {done && <div className={styles.afterAttempt} data-answer-revealed="true">{index === 4 && <aside data-static-transfer><strong>{learnerText(item.title, locale)}</strong><p>{learnerText(item.model_answer, locale)}</p></aside>}<details><summary>{t.hint}</summary><p>{learnerText(item.hint, locale)}</p></details>{index !== 4 && <details><summary>{t.model}</summary><p>{learnerText(item.model_answer, locale)}</p></details>}<p><strong>{t.success}: </strong>{learnerText(item.success_check, locale)}</p></div>}
    </article><nav className={styles.itemNav} aria-label={stage.name[locale]}><button data-action="previous-practice" disabled={index === 0} onClick={() => move(index - 1)}>← {t.previousPractice}</button><button data-action="next-practice" disabled={index === 5 || !done} onClick={() => move(index + 1)}>{t.nextPractice} →</button></nav>
  </div>;
}
