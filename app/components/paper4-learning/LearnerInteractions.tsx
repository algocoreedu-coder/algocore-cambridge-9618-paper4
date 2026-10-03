"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { LearnerProjection } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import type { LearningLocale } from "./types";
import styles from "./LessonLearningPage.module.css";

const copy = {
  en: {
    answer: "Your answer or trace",
    placeholder: "Write your answer before starting the self-check…",
    draftStep: "Step 1 of 2 — Write your own answer",
    validateDraft: "Continue to self-check",
    draftNeedsWork: "Add a meaningful answer or trace. A placeholder such as “x”, “test” or “…” is not an attempt.",
    draftReady: "Draft saved. Now compare it with the task criterion.",
    criterionStep: "Step 2 of 2 — Check the task criterion",
    criterionIntro: "Compare your draft with this criterion before opening support:",
    criterionConfirm: "I compared my draft with this criterion and can identify where my answer addresses it.",
    record: "Record self-check and reveal support",
    recorded: "Self-check recorded. This confirms an attempt; it does not mark the answer correct.",
    revise: "Revise my answer",
    hint: "Hint",
    model: "Model answer",
    check: "Self-check criterion",
    previous: "Previous practice",
    next: "Next practice",
    item: "Practice item",
    of: "of",
    recall: "Your recalled answer",
    checkRecall: "Record and check",
    retry: "Try again",
    copied: "Code copied.",
    copyFailed: "Copy failed; select the code manually.",
    copyCode: "Copy code",
  },
  vi: {
    answer: "Câu trả lời hoặc trace của bạn",
    placeholder: "Viết câu trả lời trước khi bắt đầu tự kiểm…",
    draftStep: "Bước 1/2 — Tự viết câu trả lời",
    validateDraft: "Tiếp tục để tự kiểm",
    draftNeedsWork: "Hãy viết câu trả lời hoặc trace có ý nghĩa. Nội dung giữ chỗ như “x”, “test” hoặc “…” chưa được tính là một lần làm.",
    draftReady: "Đã lưu bản nháp. Bây giờ hãy đối chiếu với tiêu chí của bài.",
    criterionStep: "Bước 2/2 — Kiểm tra tiêu chí của bài",
    criterionIntro: "Đối chiếu bản nháp với tiêu chí này trước khi mở hỗ trợ:",
    criterionConfirm: "Tôi đã đối chiếu bản nháp với tiêu chí và xác định được phần câu trả lời đáp ứng tiêu chí đó.",
    record: "Ghi nhận tự kiểm và mở hỗ trợ",
    recorded: "Đã ghi nhận tự kiểm. Đây là xác nhận đã làm bài, không phải kết luận câu trả lời đúng.",
    revise: "Sửa câu trả lời",
    hint: "Gợi ý",
    model: "Đáp án mẫu",
    check: "Tiêu chí tự kiểm",
    previous: "Bài luyện trước",
    next: "Bài luyện tiếp",
    item: "Bài luyện",
    of: "trên",
    recall: "Câu trả lời nhớ lại của bạn",
    checkRecall: "Ghi nhận và tự kiểm",
    retry: "Thử lại",
    copied: "Đã sao chép code.",
    copyFailed: "Không thể sao chép; hãy chọn code thủ công.",
    copyCode: "Sao chép code",
  },
} as const;

type PracticeStage = LearnerProjection["stages"]["practise"];
type RecallStage = LearnerProjection["stages"]["recallAndContinue"];
type ProtectMarksStage = LearnerProjection["stages"]["protectMarks"];
const PRACTICE_GATE_VERSION = 2;
const practiceFillerPattern = /^(?:x{1,3}|test(?:ing)?|asdf|qwerty|idk|i\s+don'?t\s+know|kh[oô]ng\s+bi[eế]t|n\/?a|\.{1,}|[-_?]+)$/iu;

export function isMeaningfulPracticeDraft(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || practiceFillerPattern.test(normalized)) return false;
  if (/^-?\d+(?:\.\d+)?$/.test(normalized) || /^(?:\[\]|\{\}|\(\)|true|false|none)$/i.test(normalized)) return true;
  return (normalized.match(/[\p{L}\p{N}]/gu) ?? []).length >= 2;
}

function withoutIndex(values: ReadonlySet<number>, index: number) {
  return new Set([...values].filter((value) => value !== index));
}

export const PRACTICE_PROGRESS_KEY = "algocore.paper4.learner.binary-search.practice.v1";
export const RECALL_PROGRESS_KEY = "algocore.paper4.learner.binary-search.recall.v1";
export function practiceProgressKey(lessonSlug: string) { return `algocore.paper4.learner.${lessonSlug}.practice.v1`; }
export function recallProgressKey(lessonSlug: string) { return `algocore.paper4.learner.${lessonSlug}.recall.v1`; }

export function LearnerPractice({ stage, locale, progressKey, onAttemptChange }: { readonly stage: PracticeStage; readonly locale: LearningLocale; readonly progressKey: string; readonly onAttemptChange?: (hasAttempt: boolean) => void }) {
  const t = copy[locale];
  const responseRef = useRef<HTMLTextAreaElement>(null);
  const criterionRef = useRef<HTMLInputElement>(null);
  const criterionId = useId();
  const statusId = useId();
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set());
  const [draftReady, setDraftReady] = useState<ReadonlySet<number>>(new Set());
  const [criterionConfirmed, setCriterionConfirmed] = useState<ReadonlySet<number>>(new Set());
  const [invalidDrafts, setInvalidDrafts] = useState<ReadonlySet<number>>(new Set());
  const [progressRestored, setProgressRestored] = useState(false);
  const item = stage.items[index];
  const draft = drafts[index] ?? "";
  const hasAttempt = attempted.has(index);
  const isDraftReady = draftReady.has(index);
  const isCriterionConfirmed = criterionConfirmed.has(index);
  const hasInvalidDraft = invalidDrafts.has(index);

  useEffect(() => {
    try {
      const value = JSON.parse(window.sessionStorage.getItem(progressKey) ?? "null") as unknown;
      if (!value || typeof value !== "object") { setProgressRestored(true); return; }
      const stored = value as { gateVersion?: unknown; index?: unknown; drafts?: unknown; attempted?: unknown; draftReady?: unknown; criterionConfirmed?: unknown };
      if (typeof stored.index === "number" && Number.isInteger(stored.index) && stored.index >= 0 && stored.index < stage.items.length) setIndex(stored.index);
      let cleanDrafts: Record<string, string> = {};
      if (stored.drafts && typeof stored.drafts === "object" && !Array.isArray(stored.drafts)) {
        cleanDrafts = Object.fromEntries(Object.entries(stored.drafts).filter(([key, entry]) => /^\d+$/.test(key) && typeof entry === "string" && Number(key) < stage.items.length));
        setDrafts(cleanDrafts);
      }
      const cleanIndexes = (entries: unknown) => new Set(Array.isArray(entries) ? entries.filter((entry): entry is number => typeof entry === "number" && Number.isInteger(entry) && entry >= 0 && entry < stage.items.length) : []);
      if (stored.gateVersion === PRACTICE_GATE_VERSION) {
        const restoredDraftReady = cleanIndexes(stored.draftReady);
        const restoredCriterionConfirmed = cleanIndexes(stored.criterionConfirmed);
        const restoredAttempted = new Set([...cleanIndexes(stored.attempted)].filter((entry) => restoredDraftReady.has(entry) && restoredCriterionConfirmed.has(entry) && isMeaningfulPracticeDraft(cleanDrafts[String(entry)] ?? "")));
        setAttempted(restoredAttempted);
        setDraftReady(restoredDraftReady);
        setCriterionConfirmed(restoredCriterionConfirmed);
      }
    } catch { /* Ignore malformed or unavailable session storage. */ }
    setProgressRestored(true);
  }, [progressKey, stage.items.length]);

  useEffect(() => {
    if (!progressRestored) return;
    try { window.sessionStorage.setItem(progressKey, JSON.stringify({ gateVersion: PRACTICE_GATE_VERSION, index, drafts, attempted: [...attempted], draftReady: [...draftReady], criterionConfirmed: [...criterionConfirmed] })); }
    catch { /* Storage can be unavailable. */ }
  }, [attempted, criterionConfirmed, draftReady, drafts, index, progressKey, progressRestored]);

  useEffect(() => { onAttemptChange?.(attempted.size > 0); }, [attempted, onAttemptChange]);

  if (!item) return null;
  const persistPractice = (nextIndex: number, nextDrafts: Record<number, string>, nextAttempted: ReadonlySet<number>, nextDraftReady: ReadonlySet<number>, nextCriterionConfirmed: ReadonlySet<number>) => {
    try { window.sessionStorage.setItem(progressKey, JSON.stringify({ gateVersion: PRACTICE_GATE_VERSION, index: nextIndex, drafts: nextDrafts, attempted: [...nextAttempted], draftReady: [...nextDraftReady], criterionConfirmed: [...nextCriterionConfirmed] })); }
    catch { /* Storage can be unavailable. */ }
  };
  const validateDraft = () => {
    if (!isMeaningfulPracticeDraft(draft)) {
      setInvalidDrafts((current) => new Set([...current, index]));
      return;
    }
    const nextDraftReady = new Set([...draftReady, index]);
    setDraftReady(nextDraftReady);
    setInvalidDrafts((current) => withoutIndex(current, index));
    persistPractice(index, drafts, attempted, nextDraftReady, criterionConfirmed);
    requestAnimationFrame(() => criterionRef.current?.focus());
  };
  const record = () => {
    if (!isMeaningfulPracticeDraft(draft) || !isDraftReady || !isCriterionConfirmed) return;
    const nextAttempted = new Set([...attempted, index]);
    setAttempted(nextAttempted);
    persistPractice(index, drafts, nextAttempted, draftReady, criterionConfirmed);
  };
  const revise = () => {
    const nextAttempted = withoutIndex(attempted, index);
    const nextDraftReady = withoutIndex(draftReady, index);
    const nextCriterionConfirmed = withoutIndex(criterionConfirmed, index);
    setAttempted(nextAttempted);
    setDraftReady(nextDraftReady);
    setCriterionConfirmed(nextCriterionConfirmed);
    persistPractice(index, drafts, nextAttempted, nextDraftReady, nextCriterionConfirmed);
    requestAnimationFrame(() => responseRef.current?.focus());
  };

  return <div className={styles.practiceJourney} data-practice-gate="attempt-before-reveal" data-practice-gate-version={PRACTICE_GATE_VERSION} data-attempt-result="self-check-only" data-self-check-state={hasAttempt ? "recorded" : isDraftReady ? "criterion" : "draft"}>
    <p>{learnerText(stage.attempt_rule, locale)}</p>
    <article className={styles.learnerCard}>
      <header className={styles.cardHeader}>
        <div><span>{learnerText(item.level, locale)}</span><h3>{learnerText(item.title, locale)}</h3></div>
        <strong>{t.item} {index + 1} {t.of} {stage.items.length}</strong>
      </header>
      <p>{learnerText(item.prompt, locale)}</p>
      <p className={styles.practiceStepLabel}>{t.draftStep}</p>
      <label className={styles.responseField}>
        <span>{t.answer}</span>
        <textarea ref={responseRef} value={draft} readOnly={hasAttempt} aria-describedby={statusId} aria-invalid={hasInvalidDraft || undefined} onChange={(event) => {
          const nextDrafts = { ...drafts, [index]: event.target.value };
          const nextDraftReady = withoutIndex(draftReady, index);
          const nextCriterionConfirmed = withoutIndex(criterionConfirmed, index);
          setDrafts(nextDrafts);
          setDraftReady(nextDraftReady);
          setCriterionConfirmed(nextCriterionConfirmed);
          setInvalidDrafts((current) => withoutIndex(current, index));
          persistPractice(index, nextDrafts, attempted, nextDraftReady, nextCriterionConfirmed);
        }} placeholder={t.placeholder} rows={5} />
      </label>
      {!hasAttempt && !isDraftReady && <button className={styles.learningButton} type="button" onClick={validateDraft}>{t.validateDraft}</button>}
      <p id={statusId} className={hasInvalidDraft ? styles.validationError : styles.statusText} aria-live="polite">{hasAttempt ? t.recorded : hasInvalidDraft ? t.draftNeedsWork : isDraftReady ? t.draftReady : ""}</p>
      {!hasAttempt && isDraftReady && <fieldset className={styles.selfCheckPanel}>
        <legend>{t.criterionStep}</legend>
        <p>{t.criterionIntro}</p>
        <blockquote id={criterionId}>{learnerText(item.success_check, locale)}</blockquote>
        <label className={styles.criterionConfirmation}>
          <input ref={criterionRef} type="checkbox" checked={isCriterionConfirmed} aria-describedby={criterionId} onChange={(event) => {
            const nextCriterionConfirmed = event.target.checked ? new Set([...criterionConfirmed, index]) : withoutIndex(criterionConfirmed, index);
            setCriterionConfirmed(nextCriterionConfirmed);
            persistPractice(index, drafts, attempted, draftReady, nextCriterionConfirmed);
          }} />
          <span>{t.criterionConfirm}</span>
        </label>
        <button className={styles.learningButton} type="button" disabled={!isCriterionConfirmed} onClick={record}>{t.record}</button>
      </fieldset>}
      {hasAttempt && <div className={styles.afterAttempt} data-answer-revealed="true">
        <details><summary>{t.hint}</summary><p>{learnerText(item.hint, locale)}</p></details>
        <details><summary>{t.model}</summary><p>{learnerText(item.model_answer, locale)}</p></details>
        <p><strong>{t.check}: </strong>{learnerText(item.success_check, locale)}</p>
        <button type="button" className={styles.secondaryButton} onClick={revise}>{t.revise}</button>
      </div>}
    </article>
    <nav className={styles.itemNav} aria-label={stage.name[locale]}>
      <button type="button" disabled={index === 0} onClick={() => { const nextIndex = Math.max(0, index - 1); persistPractice(nextIndex, drafts, attempted, draftReady, criterionConfirmed); setIndex(nextIndex); }}>← {t.previous}</button>
      <button type="button" disabled={index >= stage.items.length - 1 || !hasAttempt} onClick={() => { const nextIndex = Math.min(stage.items.length - 1, index + 1); persistPractice(nextIndex, drafts, attempted, draftReady, criterionConfirmed); setIndex(nextIndex); }}>{t.next} →</button>
    </nav>
  </div>;
}

export function LearnerRecall({ stage, locale, progressKey }: { readonly stage: RecallStage; readonly locale: LearningLocale; readonly progressKey: string }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<ReadonlySet<number>>(new Set());
  const [progressRestored, setProgressRestored] = useState(false);
  const item = stage.recall_items[index];
  const draft = drafts[index] ?? "";
  const hasSubmitted = submitted.has(index);

  useEffect(() => {
    try {
      const value = JSON.parse(window.sessionStorage.getItem(progressKey) ?? "null") as unknown;
      if (!value || typeof value !== "object") { setProgressRestored(true); return; }
      const stored = value as { index?: unknown; drafts?: unknown; submitted?: unknown };
      if (typeof stored.index === "number" && Number.isInteger(stored.index) && stored.index >= 0 && stored.index < stage.recall_items.length) setIndex(stored.index);
      if (stored.drafts && typeof stored.drafts === "object" && !Array.isArray(stored.drafts)) setDrafts(Object.fromEntries(Object.entries(stored.drafts).filter(([key, entry]) => /^\d+$/.test(key) && typeof entry === "string" && Number(key) < stage.recall_items.length)));
      if (Array.isArray(stored.submitted)) setSubmitted(new Set(stored.submitted.filter((entry): entry is number => typeof entry === "number" && Number.isInteger(entry) && entry >= 0 && entry < stage.recall_items.length)));
    } catch { /* Ignore malformed or unavailable session storage. */ }
    setProgressRestored(true);
  }, [progressKey, stage.recall_items.length]);

  useEffect(() => {
    if (!progressRestored) return;
    try { window.sessionStorage.setItem(progressKey, JSON.stringify({ index, drafts, submitted: [...submitted] })); }
    catch { /* Storage can be unavailable. */ }
  }, [drafts, index, progressKey, progressRestored, submitted]);

  if (!item) return null;
  const persistRecall = (nextIndex: number, nextDrafts: Record<number, string>, nextSubmitted: ReadonlySet<number>) => {
    try { window.sessionStorage.setItem(progressKey, JSON.stringify({ index: nextIndex, drafts: nextDrafts, submitted: [...nextSubmitted] })); }
    catch { /* Storage can be unavailable. */ }
  };
  return <div className={styles.practiceJourney} data-recall-gate="attempt-before-reveal">
    <article className={styles.learnerCard}>
      <header className={styles.cardHeader}><h3>{learnerText(item.prompt, locale)}</h3><strong>{index + 1} {t.of} {stage.recall_items.length}</strong></header>
      <label className={styles.responseField}><span>{t.recall}</span><textarea ref={inputRef} value={draft} onChange={(event) => { const nextDrafts = { ...drafts, [index]: event.target.value }; const nextSubmitted = new Set([...submitted].filter((value) => value !== index)); persistRecall(index, nextDrafts, nextSubmitted); setDrafts(nextDrafts); setSubmitted(nextSubmitted); }} rows={3} /></label>
      <button className={styles.learningButton} type="button" disabled={!draft.trim()} onClick={() => { const nextSubmitted = new Set([...submitted, index]); setSubmitted(nextSubmitted); try { window.sessionStorage.setItem(progressKey, JSON.stringify({ index, drafts, submitted: [...nextSubmitted] })); } catch { /* Storage can be unavailable. */ } }}>{t.checkRecall}</button>
      {hasSubmitted && <div className={styles.afterAttempt} data-answer-revealed="true"><p>{learnerText(item.answer, locale)}</p><button type="button" className={styles.secondaryButton} onClick={() => { setDrafts((current) => ({ ...current, [index]: "" })); setSubmitted((current) => new Set([...current].filter((value) => value !== index))); requestAnimationFrame(() => inputRef.current?.focus()); }}>{t.retry}</button></div>}
    </article>
    <nav className={styles.itemNav} aria-label={stage.name[locale]}><button type="button" disabled={index === 0} onClick={() => { const nextIndex = Math.max(0, index - 1); persistRecall(nextIndex, drafts, submitted); setIndex(nextIndex); }}>← {t.previous}</button><button type="button" disabled={!hasSubmitted || index >= stage.recall_items.length - 1} onClick={() => { const nextIndex = Math.min(stage.recall_items.length - 1, index + 1); persistRecall(nextIndex, drafts, submitted); setIndex(nextIndex); }}>{t.next} →</button></nav>
  </div>;
}

export function LearnerRiskChecks({ stage, locale, progressKey }: { readonly stage: ProtectMarksStage; readonly locale: LearningLocale; readonly progressKey?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!progressKey) return;
    try {
      const value = JSON.parse(window.sessionStorage.getItem(progressKey) ?? "null") as { index?: unknown } | null;
      if (value && typeof value.index === "number" && Number.isInteger(value.index) && value.index >= 0 && value.index < stage.mistakes.length) setIndex(value.index);
    } catch { /* Ignore malformed or unavailable session storage. */ }
  }, [progressKey, stage.mistakes.length]);
  const item = stage.mistakes[index];
  const labels = locale === "vi"
    ? { risk: "Điểm cần tránh", mistake: "Lỗi", consequence: "Vì sao mất điểm", repair: "Cách làm đúng", next: "Điểm tiếp theo", restart: "Xem lại từ đầu", of: "trên" }
    : { risk: "Risk check", mistake: "Mistake", consequence: "Why it loses marks", repair: "What to do", next: "Next risk", restart: "Review again", of: "of" };
  if (!item) return null;
  const last = index === stage.mistakes.length - 1;
  return <div className={styles.riskJourney} data-protect-marks-mode="progressive" data-risk-index={index} data-risk-count={stage.mistakes.length}>
    <div className={styles.riskProgress} aria-hidden="true">
      {stage.mistakes.map((_, itemIndex) => <span data-active={itemIndex === index || undefined} key={itemIndex} />)}
    </div>
    <article className={styles.mistakeCard}>
      <header className={styles.cardHeader}>
        <span>{labels.risk} {index + 1} {labels.of} {stage.mistakes.length}</span>
      </header>
      {item.applies_when && <p className={styles.condition}>{learnerText(item.applies_when, locale)}</p>}
      <dl>
        <div><dt>{labels.mistake}</dt><dd>{learnerText(item.mistake, locale)}</dd></div>
        <div><dt>{labels.consequence}</dt><dd>{learnerText(item.consequence, locale)}</dd></div>
        <div><dt>{labels.repair}</dt><dd>{learnerText(item.repair, locale)}</dd></div>
      </dl>
    </article>
    <button className={styles.learningButton} type="button" data-action="next-risk" onClick={() => { const nextIndex = last ? 0 : index + 1; if (progressKey) { try { window.sessionStorage.setItem(progressKey, JSON.stringify({ index: nextIndex })); } catch { /* Storage can be unavailable. */ } } setIndex(nextIndex); }}>{last ? labels.restart : labels.next} →</button>
    <p className={styles.srOnly} aria-live="polite">{labels.risk} {index + 1} {labels.of} {stage.mistakes.length}</p>
  </div>;
}

export function LearnerCodeCard({ caption, lines, locale, activeLineIndex }: { readonly caption: string; readonly lines: readonly string[]; readonly locale: LearningLocale; readonly activeLineIndex?: number }) {
  const t = copy[locale];
  const captionId = useId();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const source = lines.join("\n");
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(source); setStatus("copied"); }
    catch { setStatus("failed"); }
  };
  return <figure className={styles.codeFigure} data-learner-code-card>
    <figcaption><span id={captionId}>{caption}</span><button type="button" className={styles.copyButton} onClick={copyCode}>{t.copyCode}</button></figcaption>
    <pre tabIndex={0} role="region" aria-labelledby={captionId} data-learner-code="recipe"><code>{lines.map((line, index) => <span data-learner-code-line data-active={activeLineIndex === index || undefined} aria-current={activeLineIndex === index ? "step" : undefined} key={index}>{line}{index < lines.length - 1 ? "\n" : ""}</span>)}</code></pre>
    <p className={styles.srOnly} aria-live="polite">{status === "copied" ? t.copied : status === "failed" ? t.copyFailed : ""}</p>
  </figure>;
}
