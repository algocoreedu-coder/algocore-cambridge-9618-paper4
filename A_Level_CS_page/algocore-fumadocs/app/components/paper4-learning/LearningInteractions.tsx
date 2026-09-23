"use client";

import { useRef, useState } from "react";

import type { AssessmentItem, LearningLocale, RetrievalItem } from "./types";
import styles from "./LessonLearningPage.module.css";

const labels = {
  vi: {
    expected: "Sản phẩm cần nộp", authority: "Thẩm quyền rubric", hint: "Mở gợi ý",
    response: "Bài làm của bạn", responsePlaceholder: "Viết câu trả lời, đoạn code hoặc trace của bạn tại đây…",
    recordAttempt: "Ghi nhận lần làm", recorded: "Đã ghi nhận. Bây giờ bạn có thể mở phản hồi.",
    feedback: "Mở phản hồi và cách sửa", rubric: "Tiêu chí tự chấm", disclosure: "Hợp đồng hiển thị",
    retrievalResponse: "Câu trả lời/trace nhớ lại", retrievalPlaceholder: "Trả lời từ trí nhớ trước khi mở đáp án…",
    checkResponse: "Ghi nhận để tự kiểm tra", submittedResponse: "Câu trả lời đã ghi nhận",
    answer: "Mở đáp án", rationale: "Lý do", diagnosis: "Tự chẩn đoán", misconception: "Lỗi cần đối chiếu",
    repair: "Cách sửa", retry: "Thử lại", retryRule: "Quy tắc thử lại", attempts: "Số lần đã ghi nhận",
    selfRubric: "Rubric tự đánh giá", marks: "Không phải điểm Cambridge",
  },
  en: {
    expected: "Expected submission", authority: "Rubric authority", hint: "Reveal hint",
    response: "Your attempt", responsePlaceholder: "Write your answer, code fragment, or trace here…",
    recordAttempt: "Record attempt", recorded: "Attempt recorded. Feedback is now available.",
    feedback: "Reveal feedback and repair", rubric: "Self-assessment criteria", disclosure: "Disclosure contract",
    retrievalResponse: "Recall answer or trace", retrievalPlaceholder: "Answer from memory before revealing the model answer…",
    checkResponse: "Record response for self-check", submittedResponse: "Recorded response",
    answer: "Reveal answer", rationale: "Why", diagnosis: "Self-diagnosis", misconception: "Misconception to check",
    repair: "Repair action", retry: "Try again", retryRule: "Retry rule", attempts: "Recorded attempts",
    selfRubric: "Self-assessment rubric", marks: "Not Cambridge marks",
  },
} as const;

function PracticeItemCard({ item, locale }: { readonly item: AssessmentItem; readonly locale: LearningLocale }) {
  const t = labels[locale];
  const [draft, setDraft] = useState("");
  const [attempted, setAttempted] = useState(false);

  return <article className={styles.practiceCard} data-practice-item-id={item.assessment_item_id}>
    <header><strong>{item.level}</strong><code>{item.assessment_item_id}</code></header>
    <p>{item.prompt[locale]}</p>
    <p><strong>{t.expected}: </strong>{item.expected_artifact[locale]}</p>
    <p><strong>{t.authority}: </strong>{item.self_rubric.authority}{item.self_rubric.official_marks === null ? " · official_marks: null" : ` · ${item.self_rubric.official_marks}`}</p>
    <details><summary>{t.hint}</summary><p>{item.hint[locale]}</p></details>
    <label className={styles.responseField}>
      <span>{t.response}</span>
      <textarea value={draft} onChange={(event) => { setDraft(event.target.value); setAttempted(false); }} placeholder={t.responsePlaceholder} rows={5} />
    </label>
    <button className={styles.learningButton} type="button" disabled={draft.trim().length === 0} onClick={() => setAttempted(true)} data-action="record-practice-attempt">{t.recordAttempt}</button>
    <p className={styles.statusText} role="status" aria-live="polite">{attempted ? t.recorded : ""}</p>
    {attempted && <details data-feedback-after-attempt><summary>{t.feedback}</summary><p>{item.feedback[locale]}</p></details>}
    <details><summary>{t.rubric}</summary><ul>{item.self_rubric.criteria.map((criterion) => <li key={criterion.criterion_id}><p>{criterion.description[locale]}</p><small>{criterion.evidence_required}</small></li>)}</ul><p>{item.self_rubric.pass_rule[locale]}</p><p>{item.self_rubric.retry_rule[locale]}</p><pre className={styles.contractBlock}><code>{JSON.stringify(item.disclosure_contract, null, 2)}</code></pre><small>{t.disclosure}</small></details>
  </article>;
}

export function PracticeInteractions({ items, locale }: { readonly items: readonly AssessmentItem[]; readonly locale: LearningLocale }) {
  const order = new Map([["guided", 0], ["faded", 1], ["independent", 2]]);
  const sorted = [...items].sort((left, right) => (order.get(left.level) ?? 9) - (order.get(right.level) ?? 9));
  return <div className={styles.practiceGrid}>{sorted.map((item) => <PracticeItemCard item={item} locale={locale} key={item.assessment_item_id} />)}</div>;
}

function RetrievalItemCard({ item, locale }: { readonly item: RetrievalItem; readonly locale: LearningLocale }) {
  const t = labels[locale];
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const record = () => {
    const response = draft.trim();
    if (!response) return;
    setSubmitted(response);
    setAttempts((value) => value + 1);
  };
  const retry = () => {
    setDraft("");
    setSubmitted(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return <article data-retrieval-item-id={item.knowledge_unit_id}>
    <h3>{item.prompt[locale]}</h3>
    <p>{item.response_contract.prompt[locale]}</p>
    {item.response_contract.evidence_refs.length > 0 && <ul className={styles.tags}>{item.response_contract.evidence_refs.map((ref) => <li key={ref}><code>{ref}</code></li>)}</ul>}
    <label className={styles.responseField}>
      <span>{t.retrievalResponse}</span>
      <textarea ref={inputRef} value={draft} onChange={(event) => { setDraft(event.target.value); setSubmitted(null); }} placeholder={t.retrievalPlaceholder} rows={4} />
    </label>
    <button className={styles.learningButton} type="button" disabled={draft.trim().length === 0} onClick={record} data-action="record-retrieval-response">{t.checkResponse}</button>
    <p className={styles.statusText} aria-live="polite">{t.attempts}: {attempts}</p>
    {submitted && <div className={styles.retrievalReview} data-retrieval-review>
      <p><strong>{t.submittedResponse}: </strong>{submitted}</p>
      <details><summary>{t.answer}</summary><p>{item.answer[locale]}</p><p><strong>{t.rationale}: </strong>{item.rationale[locale]}</p></details>
      <section><h4>{t.diagnosis}</h4><p>{item.diagnosis.prompt[locale]}</p><p><strong>{t.misconception}: </strong>{item.diagnosis.misconception_to_check[locale]}</p></section>
      <section><h4>{t.repair}</h4><p>{item.repair.action[locale]}</p><p><strong>{t.retryRule}: </strong>{item.repair.retry_rule[locale]}</p></section>
      <section><h4>{t.selfRubric}</h4><p>{item.self_rubric.authority} · official_marks: null · {t.marks}</p><ul>{item.self_rubric.criteria.map((criterion) => <li key={criterion.criterion_id}>{criterion.description[locale]}</li>)}</ul></section>
      <button className={styles.learningButton} type="button" onClick={retry} data-action="retry-retrieval">{t.retry}</button>
    </div>}
  </article>;
}

export function RetrievalInteractions({ items, locale }: { readonly items: readonly RetrievalItem[]; readonly locale: LearningLocale }) {
  return <div className={styles.retrieval}>{items.map((item) => <RetrievalItemCard item={item} locale={locale} key={item.knowledge_unit_id} />)}</div>;
}
