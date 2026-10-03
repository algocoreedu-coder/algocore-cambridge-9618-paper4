"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, CodePanel, Feedback, Textarea } from "@/app/components/algocore-ui";
import type { LinkedListLearnerProjection, LinkedListState } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import {
  LINKED_LIST_PRACTICE_KEY,
  LINKED_LIST_PRACTICE_SCHEMA,
  LINKED_LIST_PROGRESS_KEY,
  LINKED_LIST_PROJECTION_SHA256,
  createInitialLinkedListProgress,
  isLinkedListComplete,
  linkedListCheckpointId,
  linkedListStep,
  linkedListVariants,
  restoreLinkedListPractice,
  restoreLinkedListProgress,
  type LinkedListCheckpoint,
  type LinkedListCheckpointId,
  type LinkedListTraceProgress,
} from "./linkedListProjectionAdapter";
import type { LearningLocale } from "./types";
import styles from "./LessonLearningPage.module.css";

const copy = {
  en: {
    operation: "Pending operation", physical: "Parallel-array node pool", index: "index", data: "data", nextPointer: "next", membership: "membership",
    head: "head · live chain", free: "free · free chain", live: "live", freeNode: "free", logical: "Logical values", liveChain: "Live chain", freeChain: "Free chain",
    hidden: "Predict before reveal", prediction: "Your prediction", placeholder: "Name the physical node, saved links, pointer changes and both resulting chains…",
    record: "Record prediction", recorded: "Prediction recorded", previous: "Previous", next: "Next", outcome: "Mutation result",
    support: "Boundary and rejection checks", supportPrompt: "Predict the outcome and every data, next, head and free field.", check: "Check state",
    before: "Before", after: "After", practice: "Practice item", of: "of", answer: "Your answer", attempt: "Record attempt",
    attempted: "Attempt recorded. Support is now available.", hint: "Hint", model: "Model answer", success: "Success check", previousPractice: "Previous practice", nextPractice: "Next practice",
    current: "current", previousNode: "previous", empty: "empty", cleared: "None",
  },
  vi: {
    operation: "Operation sắp chạy", physical: "Node pool dạng parallel array", index: "index", data: "data", nextPointer: "next", membership: "thuộc chain",
    head: "head · live chain", free: "free · free chain", live: "live", freeNode: "free", logical: "Các value logic", liveChain: "Live chain", freeChain: "Free chain",
    hidden: "Dự đoán trước khi mở", prediction: "Dự đoán của bạn", placeholder: "Nêu physical node, các link đã lưu, thay đổi pointer và hai chain kết quả…",
    record: "Ghi nhận dự đoán", recorded: "Đã ghi nhận dự đoán", previous: "Trước", next: "Tiếp", outcome: "Kết quả mutation",
    support: "Kiểm tra biên và từ chối", supportPrompt: "Dự đoán outcome và mọi field data, next, head, free.", check: "Kiểm tra state",
    before: "Trước", after: "Sau", practice: "Bài luyện", of: "trên", answer: "Câu trả lời", attempt: "Ghi nhận lần làm",
    attempted: "Đã ghi nhận. Phần hỗ trợ đã mở.", hint: "Gợi ý", model: "Đáp án mẫu", success: "Điểm tự kiểm", previousPractice: "Bài luyện trước", nextPractice: "Bài luyện tiếp",
    current: "current", previousNode: "previous", empty: "rỗng", cleared: "None",
  },
} as const;

function saveTrace(progress: LinkedListTraceProgress) {
  try { sessionStorage.setItem(LINKED_LIST_PROGRESS_KEY, JSON.stringify(progress)); } catch { /* Storage can be unavailable. */ }
}

function isFullState(value: unknown): value is LinkedListState {
  return Boolean(value && typeof value === "object" && Array.isArray((value as LinkedListState).data) && Array.isArray((value as LinkedListState).next));
}

function beforeState(projection: LinkedListLearnerProjection, checkpoint: LinkedListCheckpoint): LinkedListState {
  if (checkpoint === 0) return projection.stages.trace.scenario.initial;
  if (checkpoint <= 3) return projection.stages.trace.steps[checkpoint - 1].expected as LinkedListState;
  return projection.stages.trace.steps[2].expected as LinkedListState;
}

function shownState(projection: LinkedListLearnerProjection, checkpoint: LinkedListCheckpoint, revealed: boolean): LinkedListState {
  if (!revealed) return beforeState(projection, checkpoint);
  const expected = projection.stages.trace.steps[checkpoint].expected;
  return isFullState(expected) ? expected : beforeState(projection, checkpoint);
}

function chainText(chain: readonly number[]) { return chain.length ? `${chain.join("→")}→-1` : "-1"; }
function valuesText(values: readonly number[] | undefined) { return `[${(values ?? []).join(", ")}]`; }
function operationText(operation: readonly (string | number)[]) { return operation.join(" ").replaceAll("_", " "); }
function stateText(state: Pick<LinkedListState, "data" | "next" | "head" | "free">) {
  return `data [${state.data.map((value) => value ?? "None").join(", ")}] · next [${state.next.join(", ")}] · head ${state.head} · free ${state.free}`;
}

function NodePool({ state, revealed, current, previous, locale }: Readonly<{ state: LinkedListState; revealed: boolean; current: number | null; previous: number | null; locale: LearningLocale }>) {
  const t = copy[locale];
  const live = new Set(state.live_chain);
  return <div className={styles.linkedListTableWrap}>
    <table className={styles.linkedListTable}>
      <caption>{t.physical}</caption>
      <thead><tr><th scope="col">{t.index}</th><th scope="col">{t.data}</th><th scope="col">{t.nextPointer}</th><th scope="col">{t.membership}</th></tr></thead>
      <tbody>{state.data.map((value, index) => {
        const membership = live.has(index) ? "live" : "free";
        return <tr key={index} data-node-index={index} data-node-membership={revealed ? membership : undefined} data-node-current={current === index ? "true" : undefined} data-node-previous={previous === index ? "true" : undefined}>
          <th scope="row">{index}</th><td>{value ?? t.cleared}</td><td>{state.next[index]}</td><td>{revealed ? (membership === "live" ? t.live : t.freeNode) : <span aria-label={t.hidden}>?</span>}{current === index && <small> · {t.current}</small>}{previous === index && <small> · {t.previousNode}</small>}</td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

export function LinkedListTrace({ projection, locale, onLearnerProgress }: Readonly<{ projection: LinkedListLearnerProjection; locale: LearningLocale; onLearnerProgress: (complete: boolean) => void }>) {
  const t = copy[locale];
  const [progress, setProgress] = useState<LinkedListTraceProgress>(createInitialLinkedListProgress);
  const [restored, setRestored] = useState(false);
  const variants = useMemo(() => linkedListVariants(projection), [projection]);
  const checkpointId = linkedListCheckpointId(progress.checkpoint);
  const step = linkedListStep(projection, progress.checkpoint);
  const draft = progress.drafts[checkpointId] ?? "";
  const revealed = progress.reveal_ids.includes(checkpointId);
  const complete = isLinkedListComplete(progress);
  const shown = shownState(projection, progress.checkpoint, revealed);

  useEffect(() => { const saved = restoreLinkedListProgress(sessionStorage.getItem(LINKED_LIST_PROGRESS_KEY)); if (saved) setProgress(saved); setRestored(true); }, []);
  useEffect(() => { if (restored) onLearnerProgress(complete); }, [complete, onLearnerProgress, restored]);

  const commit = (next: LinkedListTraceProgress) => { saveTrace(next); setProgress(next); };
  const setDraft = (value: string, key: LinkedListCheckpointId = checkpointId) => commit({ ...progress, phase: key === checkpointId ? "predict" : progress.phase, drafts: { ...progress.drafts, [key]: value } });
  const reveal = (key: LinkedListCheckpointId = checkpointId) => {
    if (!progress.drafts[key]?.trim()) return;
    commit({ ...progress, phase: key === checkpointId ? "revealed" : progress.phase, reveal_ids: [...new Set([...progress.reveal_ids, key])] });
  };
  const move = (checkpoint: LinkedListCheckpoint) => {
    const id = linkedListCheckpointId(checkpoint);
    commit({ ...progress, checkpoint, phase: progress.reveal_ids.includes(id) ? "revealed" : "predict" });
    requestAnimationFrame(() => document.getElementById("linked-list-trace-prediction")?.focus());
  };

  const marker = progress.checkpoint === 3 ? (revealed ? { current: 1, previous: 2 } : { current: 2, previous: null }) : progress.checkpoint >= 4 ? { current: 1, previous: 2 } : { current: null, previous: null };
  const operation = operationText(step.operation);
  const boundary = variants[0].expected as unknown as LinkedListState;
  const rejection = variants[1].expected as unknown as LinkedListState;
  const singletonBefore: LinkedListState = { data: [9], next: [-1], head: 0, free: -1, logical: [9], live_chain: [0], free_chain: [] };
  const rejectionState: LinkedListState = { data: rejection.data, next: rejection.next, head: rejection.head, free: rejection.free, logical: rejection.logical, live_chain: [1, 0], free_chain: [] };
  const supports: readonly { id: LinkedListCheckpointId; kind: string; title: string; before: LinkedListState; after: LinkedListState; outcome: string; explanation: string }[] = [
    { id: "boundary:singleton", kind: "boundary-singleton-remove", title: "capacity 1 · insert 9 · remove 9", before: singletonBefore, after: boundary, outcome: "insert True · remove True", explanation: learnerText(variants[0].explanation, locale) },
    { id: "rejection:full", kind: "rejected-full-missing", title: "capacity 2 · insert 3 while full", before: rejectionState, after: rejectionState, outcome: "insert False", explanation: learnerText(variants[1].explanation, locale) },
    { id: "rejection:missing", kind: "rejected-full-missing", title: "capacity 2 · remove missing 8", before: rejectionState, after: rejectionState, outcome: "remove False", explanation: learnerText(variants[1].explanation, locale) },
  ];

  return <section className={styles.linkedListTrace} data-testid="paper4-linked-list-trace" data-scene="parallel-array-live-free" data-case-kind="normal-remove-recycle" data-checkpoint-index={progress.checkpoint} data-phase={revealed ? "revealed" : "predict"} data-linked-list-complete={complete ? "true" : "false"}>
    <div className={styles.linkedListPanels}>
      <section className={styles.linkedListVisual} data-trace-panel="linked-list-state">
        <div className={styles.linkedListOperation} data-list-operation><strong>{t.operation}</strong><span>{operation}</span></div>
        <div className={styles.linkedListHeads}><span data-list-head>{t.head}: <strong>{shown.head}</strong></span><span data-free-head>{t.free}: <strong>{shown.free}</strong></span></div>
        <NodePool state={shown} revealed={revealed} current={marker.current} previous={marker.previous} locale={locale} />
        {revealed && <div className={styles.linkedListChains}>
          <p data-live-chain><strong>{t.liveChain}: </strong>{chainText(shown.live_chain)} · {valuesText(shown.logical)}</p>
          <p data-free-chain><strong>{t.freeChain}: </strong>{chainText(shown.free_chain)}</p>
        </div>}
        <div className={styles.linkedListOutcome} data-list-outcome>{revealed ? <><strong>{t.outcome}</strong><span>{learnerText(step.answer, locale)}</span></> : <span>{t.hidden}</span>}</div>
        <div data-code-panel="linked-list-focus"><CodePanel title="Focused Python" caption={`${t.operation}: ${operation}`} lines={step.code_focus.map((text, index) => ({ number: index + 1, text, active: true }))} /></div>
      </section>
      <section className={styles.linkedListPrediction} data-trace-panel="prediction" data-trace-prediction>
        <Textarea id="linked-list-trace-prediction" label={learnerText(step.prediction, locale)} placeholder={t.placeholder} rows={5} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={() => reveal()}>{t.record}</Button>
        <p className={styles.statusText} aria-live="polite">{revealed ? t.recorded : ""}</p>
        {revealed && <div data-answer-revealed="true"><Feedback status="info" title={t.recorded}>{learnerText(step.answer, locale)}</Feedback></div>}
      </section>
    </div>
    <nav className={styles.traceStepNav} aria-label={projection.stages.trace.name[locale]}>
      <Button variant="secondary" data-action="previous" disabled={progress.checkpoint === 0} onClick={() => move((progress.checkpoint - 1) as LinkedListCheckpoint)}>← {t.previous}</Button>
      <Button variant="secondary" data-action="next" disabled={!revealed || progress.checkpoint === 5} onClick={() => move((progress.checkpoint + 1) as LinkedListCheckpoint)}>{t.next} →</Button>
    </nav>
    {complete && <section className={styles.linkedListSupport}><h3>{t.support}</h3><div>{supports.map((support) => {
      const supportDraft = progress.drafts[support.id] ?? "";
      const open = progress.reveal_ids.includes(support.id);
      return <article key={support.id} data-support-case={support.id} data-case-kind={support.kind}>
        <h4>{support.title}</h4>
        <Textarea id={`linked-list-${support.id.replace(":", "-")}`} label={t.supportPrompt} rows={3} value={supportDraft} onChange={(event) => setDraft(event.target.value, support.id)} />
        <Button data-action={`reveal-${support.id.replace(":", "-")}`} disabled={!supportDraft.trim()} onClick={() => reveal(support.id)}>{t.check}</Button>
        {open && <div className={styles.linkedListBeforeAfter} data-support-revealed="true"><div><strong>{t.before}</strong><p>{stateText(support.before)}</p></div><div><strong>{t.after}</strong><p>{stateText(support.after)}</p></div><p><strong>{support.outcome}.</strong> {support.explanation}</p></div>}
      </article>;
    })}</div></section>}
  </section>;
}

type PracticeStage = LinkedListLearnerProjection["stages"]["practise"];

export function LinkedListPractice({ stage, locale, onAttemptChange }: Readonly<{ stage: PracticeStage; locale: LearningLocale; onAttemptChange?: (attempted: boolean) => void }>) {
  const t = copy[locale];
  const input = useRef<HTMLTextAreaElement>(null);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set);
  const [restored, setRestored] = useState(false);
  const item = stage.items[index];
  const draft = drafts[index] ?? "";
  const done = attempted.has(index);
  const markers = ["remove-head", "singleton-tail", "first-duplicate", "recycle-reuse", "rejections", "tail-insertion-static", "object-nodes-static", "dedicated-search-static"] as const;

  useEffect(() => { const saved = restoreLinkedListPractice(sessionStorage.getItem(LINKED_LIST_PRACTICE_KEY)); if (saved) { setIndex(saved.index); setDrafts({ ...saved.drafts }); setAttempted(new Set(saved.attempted)); } setRestored(true); }, []);
  const persist = (nextIndex: number, nextDrafts: Record<number, string>, nextAttempted: ReadonlySet<number>) => { try { sessionStorage.setItem(LINKED_LIST_PRACTICE_KEY, JSON.stringify({ schema_version: LINKED_LIST_PRACTICE_SCHEMA, projection_sha256: LINKED_LIST_PROJECTION_SHA256, index: nextIndex, drafts: nextDrafts, attempted: [...nextAttempted] })); } catch { /* Storage can be unavailable. */ } };
  useEffect(() => { if (restored) persist(index, drafts, attempted); }, [attempted, drafts, index, restored]);
  useEffect(() => onAttemptChange?.(attempted.size > 0), [attempted, onAttemptChange]);
  if (!item) return null;
  const record = () => { if (!draft.trim()) return; const next = new Set([...attempted, index]); persist(index, drafts, next); setAttempted(next); };
  const move = (nextIndex: number) => { persist(nextIndex, drafts, attempted); setIndex(nextIndex); requestAnimationFrame(() => input.current?.focus()); };
  const level = typeof item.level === "string" ? item.level : learnerText(item.level, locale);
  return <div className={`${styles.practiceJourney} ${styles.linkedListPractice}`} data-practice-gate="attempt-before-reveal" data-practice-index={index}>
    <p>{learnerText(stage.attempt_rule, locale)}</p>
    <article className={styles.learnerCard} data-transfer-card={markers[index]}>
      <header className={styles.cardHeader}><div><span>{level}</span><h3>{learnerText(item.title, locale)}</h3></div><strong>{t.practice} {index + 1} {t.of} 8</strong></header>
      <p>{learnerText(item.prompt, locale)}</p>
      <label className={styles.responseField}><span>{t.answer}</span><textarea ref={input} rows={5} value={draft} onChange={(event) => { const next = { ...drafts, [index]: event.target.value }; persist(index, next, attempted); setDrafts(next); }} /></label>
      <button className={styles.learningButton} data-action="record-practice" disabled={!draft.trim()} onClick={record}>{t.attempt}</button>
      <p className={styles.statusText} aria-live="polite">{done ? t.attempted : ""}</p>
      {done && <div className={styles.afterAttempt} data-answer-revealed="true">
        {index >= 5 && <aside data-static-transfer><strong>{learnerText(item.title, locale)}</strong><p>{learnerText(item.model_answer, locale)}</p></aside>}
        <details><summary>{t.hint}</summary><p>{learnerText(item.hint, locale)}</p></details>
        {index < 5 && <details><summary>{t.model}</summary><p>{learnerText(item.model_answer, locale)}</p></details>}
        <p><strong>{t.success}: </strong>{learnerText(item.success_check, locale)}</p>
      </div>}
    </article>
    <nav className={styles.itemNav} aria-label={stage.name[locale]}><button data-action="previous-practice" disabled={index === 0} onClick={() => move(index - 1)}>← {t.previousPractice}</button><button data-action="next-practice" disabled={index === 7 || !done} onClick={() => move(index + 1)}>{t.nextPractice} →</button></nav>
  </div>;
}
