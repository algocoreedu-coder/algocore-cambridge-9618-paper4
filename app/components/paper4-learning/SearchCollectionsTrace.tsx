"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, CodePanel, Feedback, Select, StateVisual, Textarea } from "@/app/components/algocore-ui";
import type { SearchCollectionsLearnerProjection } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import {
  SEARCH_COLLECTIONS_PRACTICE_KEY,
  SEARCH_COLLECTIONS_PROGRESS_KEY,
  createInitialSearchCollectionsProgress,
  isSearchCollectionsNormalComplete,
  restoreSearchCollectionsProgress,
  searchCollectionsCases,
  searchCollectionsCheckpointId,
  searchCollectionsStep,
  type SearchCollectionsDraftId,
  type SearchCollectionsScenario,
  type SearchCollectionsTraceProgress,
} from "./searchCollectionsAdapter";
import type { LearningLocale } from "./types";
import styles from "./LessonLearningPage.module.css";

const labels = {
  en: { choose: "Trace case", normal: "Normal · preserve first index", boundary: "Boundary · empty collection", absent: "Valid result · target absent", locked: "Complete all three normal decisions to unlock these valid results.", scene: "First-index scan", target: "Target", found: "found", cursor: "cursor", notStarted: "not inspected", hidden: "Not revealed", code: "Focused Python", decision: "Decision", prediction: "Your prediction", placeholder: "Predict cursor, comparison and found before revealing…", record: "Record prediction", recorded: "Prediction recorded. Compare it with the approved reasoning.", previous: "Previous", next: "Next", state: "Scan state", validResult: "Valid search result", invariant: "Invariant held", variantPrompt: "Predict the exact found result and explain why it is valid." },
  vi: { choose: "Trường hợp trace", normal: "Normal · giữ index đầu", boundary: "Boundary · collection rỗng", absent: "Kết quả hợp lệ · không có target", locked: "Hoàn thành đủ ba quyết định normal để mở các kết quả hợp lệ này.", scene: "Quét tìm index đầu", target: "Target", found: "found", cursor: "cursor", notStarted: "chưa kiểm tra", hidden: "Chưa mở", code: "Python đang xét", decision: "Quyết định", prediction: "Dự đoán của bạn", placeholder: "Dự đoán cursor, phép so sánh và found trước khi mở…", record: "Ghi nhận dự đoán", recorded: "Đã ghi nhận dự đoán. Hãy đối chiếu với lập luận chuẩn.", previous: "Trước", next: "Tiếp", state: "Trạng thái quét", validResult: "Kết quả tìm kiếm hợp lệ", invariant: "Giữ đúng bất biến", variantPrompt: "Dự đoán chính xác found và giải thích vì sao đây là kết quả hợp lệ." },
} as const;

const practiceLabels = {
  en: { answer: "Your answer or trace", placeholder: "Write the result and stop/update rule before revealing support…", record: "Record attempt", recorded: "Attempt recorded. You can now check the support.", hint: "Hint", model: "Model answer", check: "Success check", previous: "Previous practice", next: "Next practice", item: "Practice item", of: "of" },
  vi: { answer: "Câu trả lời hoặc trace của bạn", placeholder: "Viết kết quả và quy tắc dừng/cập nhật trước khi mở hỗ trợ…", record: "Ghi nhận lần làm", recorded: "Đã ghi nhận. Bây giờ bạn có thể kiểm tra phần hỗ trợ.", hint: "Gợi ý", model: "Đáp án mẫu", check: "Điểm tự kiểm", previous: "Bài luyện trước", next: "Bài luyện tiếp", item: "Bài luyện", of: "trên" },
} as const;

function persistTrace(progress: SearchCollectionsTraceProgress) {
  try { window.sessionStorage.setItem(SEARCH_COLLECTIONS_PROGRESS_KEY, JSON.stringify(progress)); } catch { /* Storage can be unavailable. */ }
}

export function SearchCollectionsTrace({ projection, locale, onLearnerProgress }: Readonly<{ projection: SearchCollectionsLearnerProjection; locale: LearningLocale; onLearnerProgress: (normalComplete: boolean) => void }>) {
  const t = labels[locale];
  const [progress, setProgress] = useState<SearchCollectionsTraceProgress>(createInitialSearchCollectionsProgress);
  const [restored, setRestored] = useState(false);
  const cases = useMemo(() => searchCollectionsCases(projection), [projection]);
  const normalComplete = isSearchCollectionsNormalComplete(progress);
  const traceCase = cases.find((item) => item.kind === progress.scenario) ?? cases[0];
  const checkpointId = searchCollectionsCheckpointId(progress.checkpoint_index);
  const draftKey: SearchCollectionsDraftId = progress.scenario === "normal-primary" ? checkpointId : `${progress.scenario}:0`;
  const draft = progress.drafts[draftKey] ?? "";
  const revealed = progress.scenario === "normal-primary" ? progress.revealed_checkpoint_ids.includes(checkpointId) : progress.phase === "revealed";
  const step = searchCollectionsStep(projection, progress.checkpoint_index);

  useEffect(() => { const candidate = restoreSearchCollectionsProgress(window.sessionStorage.getItem(SEARCH_COLLECTIONS_PROGRESS_KEY)); if (candidate) setProgress(candidate); setRestored(true); }, []);
  useEffect(() => { if (restored) onLearnerProgress(normalComplete); }, [normalComplete, onLearnerProgress, restored]);
  const commit = (next: SearchCollectionsTraceProgress) => { persistTrace(next); setProgress(next); };
  const setDraft = (value: string) => commit({ ...progress, phase: "predict", drafts: { ...progress.drafts, [draftKey]: value } });
  const reveal = () => { if (!draft.trim()) return; const ids = progress.scenario === "normal-primary" && !progress.revealed_checkpoint_ids.includes(checkpointId) ? [...progress.revealed_checkpoint_ids, checkpointId] : progress.revealed_checkpoint_ids; commit({ ...progress, phase: "revealed", revealed_checkpoint_ids: ids }); };
  const selectScenario = (scenario: SearchCollectionsScenario) => commit({ ...progress, scenario, checkpoint_index: 0, phase: "predict" });
  const move = (checkpoint_index: 0 | 1 | 2) => { commit({ ...progress, checkpoint_index, phase: progress.revealed_checkpoint_ids.includes(searchCollectionsCheckpointId(checkpoint_index)) ? "revealed" : "predict" }); requestAnimationFrame(() => document.getElementById("search-collections-trace-prediction")?.focus()); };

  const cursor = progress.scenario === "normal-primary" ? ([0, 2, 3] as const)[progress.checkpoint_index] : revealed && traceCase.values.length ? traceCase.values.length - 1 : -1;
  const found: number | string = progress.scenario === "normal-primary" ? (revealed || progress.checkpoint_index > 0 ? 0 : -1) : revealed ? -1 : t.hidden;
  const code = progress.scenario === "normal-primary" ? step.code_focus : ["found = -1", "for index, value in enumerate(values):", "return found"];
  const stateFacts = [{ label: t.target, value: traceCase.target }, { label: t.cursor, value: cursor < 0 ? t.notStarted : cursor }, { label: t.found, value: found, changed: revealed }];

  return <section className={styles.searchCollectionsTrace} data-testid="paper4-search-collections-trace" data-scene="linear-first-index" data-case-kind={progress.scenario} data-checkpoint-index={progress.checkpoint_index} data-phase={revealed ? "revealed" : "predict"} data-normal-complete={normalComplete ? "true" : "false"}>
    <div className={styles.traceToolbar}><Select id="search-collections-trace-case" label={t.choose} value={progress.scenario} data-scenario-select onChange={(event) => selectScenario(event.target.value as SearchCollectionsScenario)}><option value="normal-primary">{t.normal}</option><option value="boundary-empty" disabled={!normalComplete}>{t.boundary}</option><option value="not-found" disabled={!normalComplete}>{t.absent}</option></Select>{!normalComplete && <p className={styles.traceLockNote}>{t.locked}</p>}</div>
    <div className={styles.searchCollectionsTracePanels}>
      <section className={styles.searchCollectionsScenePanel} data-trace-panel="array-code" aria-labelledby="search-collections-scene-title">
        <h3 id="search-collections-scene-title">{t.scene}</h3>
        <div className={styles.searchCollectionsTarget}><span>{t.target}</span><strong>{traceCase.target}</strong></div>
        <ol className={styles.searchCollectionsArray} aria-label={traceCase.values.length ? t.scene : t.boundary}>{traceCase.values.length ? traceCase.values.map((value, index) => <li key={index} data-array-item-index={index} data-cursor-index={index === cursor ? index : undefined} data-match={value === traceCase.target ? "true" : undefined}><span>{index}</span><strong>{value}</strong>{index === cursor && <b aria-hidden="true">↓</b>}</li>) : <li className={styles.searchCollectionsEmpty}>{locale === "en" ? "No live items" : "Không có phần tử sống"}</li>}</ol>
        <div className={styles.searchCollectionsFound} data-found-state={revealed || progress.scenario === "normal-primary" ? found : "hidden"}><span>{t.found}</span><strong>{found}</strong></div>
        <div data-code-panel="search-collections-focus" data-focused-code><CodePanel title={t.code} caption={progress.scenario === "normal-primary" ? `${t.decision} ${progress.checkpoint_index + 1} / 3` : learnerText(traceCase.label, locale)} lines={code.map((text, index) => ({ number: index + 1, text, active: true }))} /></div>
      </section>
      <section className={styles.searchCollectionsPredictionPanel} data-trace-panel="prediction" data-trace-prediction>
        <StateVisual title={t.state} facts={stateFacts} />
        <Textarea id="search-collections-trace-prediction" label={progress.scenario === "normal-primary" ? learnerText(step.prediction, locale) : t.variantPrompt} placeholder={t.placeholder} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={reveal}>{t.record}</Button>
        {revealed && <div data-answer-revealed="true" className={styles.traceAnswer}><Feedback status="info" title={progress.scenario === "normal-primary" ? t.recorded : t.validResult}>{progress.scenario === "normal-primary" ? learnerText(step.answer, locale) : learnerText(traceCase.explanation!, locale)}</Feedback><p className={styles.invariantResult}><strong>{t.invariant}:</strong> {learnerText(projection.stages.trace.invariant_check, locale)}</p></div>}
      </section>
    </div>
    {progress.scenario === "normal-primary" && <nav className={styles.traceStepNav} aria-label={projection.stages.trace.name[locale]}><Button variant="secondary" data-action="previous" disabled={progress.checkpoint_index === 0} onClick={() => move((progress.checkpoint_index - 1) as 0 | 1 | 2)}>← {t.previous}</Button><Button variant="secondary" data-action="next" disabled={!revealed || progress.checkpoint_index === 2} onClick={() => move((progress.checkpoint_index + 1) as 0 | 1 | 2)}>{t.next} →</Button></nav>}
  </section>;
}

type PracticeStage = SearchCollectionsLearnerProjection["stages"]["practise"];
export function SearchCollectionsPractice({ stage, locale, onAttemptChange }: Readonly<{ stage: PracticeStage; locale: LearningLocale; onAttemptChange?: (hasAttempt: boolean) => void }>) {
  const t = practiceLabels[locale]; const inputRef = useRef<HTMLTextAreaElement>(null); const [index, setIndex] = useState(0); const [drafts, setDrafts] = useState<Record<number, string>>({}); const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set()); const [restored, setRestored] = useState(false); const item = stage.items[index]; const draft = drafts[index] ?? ""; const hasAttempt = attempted.has(index); const transfer = index === 1 ? "boolean" : index === 2 ? "count" : index === 3 ? "filter" : index === 4 ? "group" : undefined;
  useEffect(() => { try { const value = JSON.parse(window.sessionStorage.getItem(SEARCH_COLLECTIONS_PRACTICE_KEY) ?? "null") as { index?: unknown; drafts?: unknown; attempted?: unknown } | null; if (value && typeof value === "object") { if (typeof value.index === "number" && Number.isInteger(value.index) && value.index >= 0 && value.index < 5) setIndex(value.index); if (value.drafts && typeof value.drafts === "object" && !Array.isArray(value.drafts)) setDrafts(Object.fromEntries(Object.entries(value.drafts).filter(([key, val]) => /^[0-4]$/.test(key) && typeof val === "string"))); if (Array.isArray(value.attempted)) setAttempted(new Set(value.attempted.filter((val): val is number => typeof val === "number" && Number.isInteger(val) && val >= 0 && val < 5))); } } catch { /* Ignore stale storage. */ } setRestored(true); }, []);
  const persist = (nextIndex: number, nextDrafts: Record<number, string>, nextAttempted: ReadonlySet<number>) => { try { window.sessionStorage.setItem(SEARCH_COLLECTIONS_PRACTICE_KEY, JSON.stringify({ index: nextIndex, drafts: nextDrafts, attempted: [...nextAttempted] })); } catch { /* Storage can be unavailable. */ } };
  useEffect(() => { if (restored) persist(index, drafts, attempted); }, [attempted, drafts, index, restored]); useEffect(() => onAttemptChange?.(attempted.size > 0), [attempted, onAttemptChange]);
  if (!item) return null;
  const record = () => { if (!draft.trim()) return; const next = new Set([...attempted, index]); persist(index, drafts, next); setAttempted(next); };
  const move = (nextIndex: number) => { persist(nextIndex, drafts, attempted); setIndex(nextIndex); requestAnimationFrame(() => inputRef.current?.focus()); };
  return <div className={`${styles.practiceJourney} ${styles.searchCollectionsPractice}`} data-practice-gate="attempt-before-reveal" data-practice-index={index}><p>{learnerText(stage.attempt_rule, locale)}</p><article className={styles.learnerCard} data-transfer-card={transfer}><header className={styles.cardHeader}><div><span>{learnerText(item.level, locale)}</span><h3>{learnerText(item.title, locale)}</h3></div><strong>{t.item} {index + 1} {t.of} 5</strong></header><p>{learnerText(item.prompt, locale)}</p><label className={styles.responseField}><span>{t.answer}</span><textarea ref={inputRef} value={draft} onChange={(event) => { const next = { ...drafts, [index]: event.target.value }; persist(index, next, attempted); setDrafts(next); }} placeholder={t.placeholder} rows={5} /></label><button className={styles.learningButton} type="button" data-action="record-practice" disabled={!draft.trim()} onClick={record}>{t.record}</button><p className={styles.statusText} aria-live="polite">{hasAttempt ? t.recorded : ""}</p>{hasAttempt && <div className={styles.afterAttempt} data-answer-revealed="true"><details><summary>{t.hint}</summary><p>{learnerText(item.hint, locale)}</p></details><details><summary>{t.model}</summary><p>{learnerText(item.model_answer, locale)}</p></details><p><strong>{t.check}: </strong>{learnerText(item.success_check, locale)}</p></div>}</article><nav className={styles.itemNav} aria-label={stage.name[locale]}><button type="button" data-action="previous-practice" disabled={index === 0} onClick={() => move(Math.max(0, index - 1))}>← {t.previous}</button><button type="button" data-action="next-practice" disabled={index >= 4 || !hasAttempt} onClick={() => move(Math.min(4, index + 1))}>{t.next} →</button></nav></div>;
}
