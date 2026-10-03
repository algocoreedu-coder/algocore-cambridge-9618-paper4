"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/app/components/algocore-ui";
import type { RehearsalLocale, RehearsalPaper } from "@/app/lib/paper4/rehearsals";
import type { RehearsalSolution } from "@/app/lib/paper4/rehearsal-solutions";

import styles from "./Rehearsal.module.css";

type AnswerState = Record<string, { answer: string; notes: string; evidence: boolean[]; confidence: number }>;
type AttemptState = Readonly<{
  schemaVersion: 1;
  paperId: string;
  status: "active" | "submitted";
  startedAt: number;
  deadline: number | null;
  submittedAt: number | null;
  updatedAt: number;
  answers: AnswerState;
  finalChecks: boolean[];
}>;

type SolutionPayload = { solution: RehearsalSolution };

const storageKey = (paperId: string) => `algocore:paper4:rehearsal:v1:${paperId}`;

function initialAnswers(paper: RehearsalPaper): AnswerState {
  return Object.fromEntries(paper.questions.map((question) => [question.question_id, {
    answer: "",
    notes: "",
    evidence: question.evidence_required.map(() => false),
    confidence: 3,
  }]));
}

function freshAttempt(paper: RehearsalPaper, now = Date.now()): AttemptState {
  return {
    schemaVersion: 1,
    paperId: paper.paper_id,
    status: "active",
    startedAt: now,
    deadline: paper.duration_minutes === null ? null : now + paper.duration_minutes * 60_000,
    submittedAt: null,
    updatedAt: now,
    answers: initialAnswers(paper),
    finalChecks: paper.submission_checklist.map(() => false),
  };
}

function restoreAttempt(raw: string | null, paper: RehearsalPaper): AttemptState | null {
  if (!raw) return null;
  try {
    const candidate = JSON.parse(raw) as Partial<AttemptState>;
    if (candidate.schemaVersion !== 1 || candidate.paperId !== paper.paper_id || (candidate.status !== "active" && candidate.status !== "submitted") || !candidate.answers) return null;
    const answers = initialAnswers(paper);
    for (const question of paper.questions) {
      const saved = candidate.answers[question.question_id];
      if (!saved) continue;
      answers[question.question_id] = {
        answer: typeof saved.answer === "string" ? saved.answer : "",
        notes: typeof saved.notes === "string" ? saved.notes : "",
        evidence: question.evidence_required.map((_, index) => saved.evidence?.[index] === true),
        confidence: Number.isInteger(saved.confidence) && saved.confidence >= 1 && saved.confidence <= 5 ? saved.confidence : 3,
      };
    }
    return {
      schemaVersion: 1,
      paperId: paper.paper_id,
      status: candidate.status,
      startedAt: typeof candidate.startedAt === "number" ? candidate.startedAt : Date.now(),
      deadline: typeof candidate.deadline === "number" ? candidate.deadline : null,
      submittedAt: typeof candidate.submittedAt === "number" ? candidate.submittedAt : null,
      updatedAt: typeof candidate.updatedAt === "number" ? candidate.updatedAt : Date.now(),
      answers,
      finalChecks: paper.submission_checklist.map((_, index) => candidate.finalChecks?.[index] === true),
    };
  } catch { return null; }
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function RehearsalAttempt({ paper, locale }: Readonly<{ paper: RehearsalPaper; locale: RehearsalLocale }>) {
  const [attempt, setAttempt] = useState<AttemptState>(() => freshAttempt(paper));
  const [restored, setRestored] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [solution, setSolution] = useState<RehearsalSolution | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [loadingSolution, setLoadingSolution] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const timed = paper.duration_minutes !== null;
  const timeRemaining = attempt.deadline === null ? null : Math.max(0, attempt.deadline - now);
  const timedOut = timeRemaining === 0 && attempt.status === "active";
  const locked = attempt.status === "submitted" || timedOut;

  useEffect(() => {
    let next = freshAttempt(paper);
    try { next = restoreAttempt(window.localStorage.getItem(storageKey(paper.paper_id)), paper) ?? next; } catch { /* Storage may be unavailable. */ }
    setAttempt(next);
    setRestored(true);
  }, [paper]);

  useEffect(() => {
    if (!restored) return;
    try { window.localStorage.setItem(storageKey(paper.paper_id), JSON.stringify(attempt)); } catch { /* Storage may be unavailable. */ }
  }, [attempt, paper.paper_id, restored]);

  useEffect(() => {
    if (!timed || attempt.status === "submitted") return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [attempt.status, timed]);

  const loadSolution = useCallback(async () => {
    setLoadingSolution(true);
    setSubmitError("");
    try {
      const response = await fetch(`/api/paper4/rehearsals/${encodeURIComponent(paper.paper_id)}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reveal_after_submit" }) });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const payload = await response.json() as SolutionPayload;
      setSolution(payload.solution);
    } catch {
      setSubmitError(locale === "vi" ? "Chưa tải được rubric. Bài làm vẫn được lưu; hãy thử lại." : "The rubric could not be loaded. Your attempt is saved; try again.");
    } finally { setLoadingSolution(false); }
  }, [locale, paper.paper_id]);

  useEffect(() => { if (restored && attempt.status === "submitted" && solution === null && !loadingSolution) void loadSolution(); }, [attempt.status, loadSolution, loadingSolution, restored, solution]);

  const updateAnswer = (questionId: string, patch: Partial<AnswerState[string]>) => {
    if (locked) return;
    setAttempt((current) => ({ ...current, updatedAt: Date.now(), answers: { ...current.answers, [questionId]: { ...current.answers[questionId], ...patch } } }));
  };

  const answeredCount = useMemo(() => paper.questions.filter((question) => attempt.answers[question.question_id]?.answer.trim().length >= 12).length, [attempt.answers, paper.questions]);
  const checkedEvidence = useMemo(() => Object.values(attempt.answers).reduce((count, answer) => count + answer.evidence.filter(Boolean).length, 0), [attempt.answers]);
  const totalEvidence = paper.questions.reduce((count, question) => count + question.evidence_required.length, 0);

  const submit = async () => {
    const submitted: AttemptState = { ...attempt, status: "submitted", submittedAt: Date.now(), updatedAt: Date.now() };
    setAttempt(submitted);
    setConfirmingSubmit(false);
    await loadSolution();
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const reset = () => {
    const next = freshAttempt(paper);
    setAttempt(next);
    setSolution(null);
    setSubmitError("");
    setConfirmingReset(false);
    setNow(Date.now());
    try { window.localStorage.setItem(storageKey(paper.paper_id), JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return <div className={styles.attempt} data-attempt-status={attempt.status} data-timed={timed || undefined}>
    <div className={styles.attemptToolbar} aria-label={locale === "vi" ? "Trạng thái bài làm" : "Attempt status"}>
      <div><span>{locale === "vi" ? "Tiến độ" : "Progress"}</span><strong>{answeredCount}/{paper.questions.length} {locale === "vi" ? "câu có câu trả lời" : "answers drafted"}</strong></div>
      <div><span>{locale === "vi" ? "Bằng chứng" : "Evidence"}</span><strong>{checkedEvidence}/{totalEvidence}</strong></div>
      {timeRemaining !== null && <div className={styles.timer} data-expired={timedOut || undefined}><span>{locale === "vi" ? "Thời gian còn lại" : "Time remaining"}</span><strong role="timer" aria-live={timeRemaining <= 60_000 ? "polite" : "off"}>{formatTime(timeRemaining)}</strong></div>}
      <p className={styles.saveNote}>{locale === "vi" ? "Tự động lưu trên trình duyệt của học viên đang đăng nhập." : "Auto-saved in this signed-in learner's browser."}</p>
    </div>

    {timed && attempt.status === "active" && <aside className={styles.noHints} role="note"><strong>{locale === "vi" ? "Chế độ tính giờ: không có gợi ý hoặc lời giải." : "Timed mode: no hints or solutions."}</strong><span>{locale === "vi" ? "Rubric chỉ mở sau khi bạn xác nhận nộp." : "The rubric unlocks only after you confirm submission."}</span></aside>}
    {timedOut && <div className={styles.timeoutNotice} role="alert"><strong>{locale === "vi" ? "Đã hết giờ." : "Time is up."}</strong> {locale === "vi" ? "Bài làm đã khóa; hãy kiểm tra danh sách và nộp." : "Answers are locked; review the checklist and submit."}</div>}

    <nav className={styles.questionNav} aria-label={locale === "vi" ? "Đi tới câu hỏi" : "Go to question"}>{paper.questions.map((question, index) => <a href={`#question-${index + 1}`} key={question.question_id}>{index + 1}</a>)}</nav>

    <div className={styles.questionList}>{paper.questions.map((question, index) => {
      const answer = attempt.answers[question.question_id];
      return <section className={styles.questionCard} id={`question-${index + 1}`} data-question-index={index + 1} key={question.question_id} aria-labelledby={`question-${index + 1}-title`}>
        <header><div><span>{locale === "vi" ? `Câu ${index + 1}` : `Question ${index + 1}`}</span><h2 id={`question-${index + 1}-title`}>{question.topics.join(" · ")}</h2></div><p>{question.marks} {locale === "vi" ? "điểm AlgoCore" : "AlgoCore marks"} · {question.recommended_minutes} min</p></header>
        <p className={styles.prompt}>{question.prompt[locale]}</p>
        <div className={styles.deliverables}><strong>{locale === "vi" ? "Cần nộp" : "Deliver"}</strong><ul>{question.deliverables.map((item) => <li key={item.en}>{item[locale]}</li>)}</ul></div>
        <label className={styles.textField} htmlFor={`answer-${index}`}><strong>{locale === "vi" ? "Câu trả lời / code / trace" : "Answer / code / trace"}</strong><textarea id={`answer-${index}`} value={answer.answer} onChange={(event) => updateAnswer(question.question_id, { answer: event.target.value })} disabled={locked} rows={10} spellCheck={false} /></label>
        <label className={styles.textField} htmlFor={`notes-${index}`}><strong>{locale === "vi" ? "Ghi chú kiểm tra" : "Review notes"}</strong><textarea id={`notes-${index}`} value={answer.notes} onChange={(event) => updateAnswer(question.question_id, { notes: event.target.value })} disabled={locked} rows={3} /></label>
        <fieldset className={styles.checklist}><legend>{locale === "vi" ? "Bằng chứng tôi đã tạo" : "Evidence I produced"}</legend>{question.evidence_required.map((item, evidenceIndex) => <label key={item.en}><input type="checkbox" checked={answer.evidence[evidenceIndex]} disabled={locked} onChange={(event) => { const evidence = [...answer.evidence]; evidence[evidenceIndex] = event.target.checked; updateAnswer(question.question_id, { evidence }); }} /><span>{item[locale]}</span></label>)}</fieldset>
        <label className={styles.confidence} htmlFor={`confidence-${index}`}><span>{locale === "vi" ? "Mức tự tin" : "Confidence"}</span><select id={`confidence-${index}`} value={answer.confidence} disabled={locked} onChange={(event) => updateAnswer(question.question_id, { confidence: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value}/5</option>)}</select></label>
        {attempt.status === "submitted" && solution && <QuestionRubric solution={solution} questionId={question.question_id} locale={locale} />}
      </section>;
    })}</div>

    <section className={styles.submitPanel} aria-labelledby="submission-title">
      <h2 id="submission-title">{locale === "vi" ? "Kiểm tra trước khi nộp" : "Pre-submission check"}</h2>
      <fieldset className={styles.checklist}><legend>{locale === "vi" ? "Danh sách nộp bài" : "Submission checklist"}</legend>{paper.submission_checklist.map((item, index) => <label key={item.en}><input type="checkbox" checked={attempt.finalChecks[index]} disabled={attempt.status === "submitted"} onChange={(event) => setAttempt((current) => ({ ...current, updatedAt: Date.now(), finalChecks: current.finalChecks.map((checked, itemIndex) => itemIndex === index ? event.target.checked : checked) }))} /><span>{item[locale]}</span></label>)}</fieldset>
      <ul>{paper.evidence_document_checklist.map((item) => <li key={item.en}>{item[locale]}</li>)}</ul>
      {submitError && <p className={styles.error} role="alert">{submitError}</p>}
      {attempt.status === "active" && !confirmingSubmit && <Button onClick={() => setConfirmingSubmit(true)}>{locale === "vi" ? "Kiểm tra và nộp" : "Review and submit"}</Button>}
      {confirmingSubmit && <div className={styles.confirmPanel} role="group" aria-labelledby="submit-confirm-title"><strong id="submit-confirm-title">{locale === "vi" ? "Nộp bài ngay?" : "Submit this attempt now?"}</strong><p>{locale === "vi" ? "Sau khi nộp, câu trả lời sẽ bị khóa và rubric AlgoCore được mở." : "Submission locks your answers and unlocks the AlgoCore rubric."}</p><div><Button onClick={() => void submit()} loading={loadingSolution} loadingLabel={locale === "vi" ? "Đang nộp" : "Submitting"}>{locale === "vi" ? "Xác nhận nộp" : "Confirm submission"}</Button><Button variant="secondary" onClick={() => setConfirmingSubmit(false)}>{locale === "vi" ? "Quay lại làm bài" : "Return to attempt"}</Button></div></div>}
      {attempt.status === "submitted" && <div className={styles.submitted} tabIndex={-1} ref={statusRef} role="status"><strong>{locale === "vi" ? "Đã nộp bài." : "Attempt submitted."}</strong><span>{locale === "vi" ? "Rubric bên dưới từng câu là tiêu chí do AlgoCore biên soạn, không phải mark scheme chính thức." : "The rubric below each question is AlgoCore-authored and is not an official mark scheme."}</span></div>}
    </section>

    <footer className={styles.attemptFooter}>
      <Link href={`/paper-4/rehearsals?lang=${locale}`}>{locale === "vi" ? "← Tất cả bộ luyện" : "← All rehearsals"}</Link>
      {!confirmingReset ? <Button variant="danger" onClick={() => setConfirmingReset(true)}>{locale === "vi" ? "Làm lại từ đầu" : "Reset attempt"}</Button> : <div className={styles.resetConfirm} role="group" aria-label={locale === "vi" ? "Xác nhận làm lại" : "Confirm reset"}><span>{locale === "vi" ? "Xóa bài đã lưu trên thiết bị này?" : "Erase the saved attempt on this device?"}</span><Button variant="danger" onClick={reset}>{locale === "vi" ? "Xóa và bắt đầu lại" : "Erase and restart"}</Button><Button variant="secondary" onClick={() => setConfirmingReset(false)}>{locale === "vi" ? "Hủy" : "Cancel"}</Button></div>}
    </footer>
  </div>;
}

function QuestionRubric({ solution, questionId, locale }: Readonly<{ solution: RehearsalSolution; questionId: string; locale: RehearsalLocale }>) {
  const answer = solution.answers.find((item) => item.question_id === questionId);
  if (!answer) return null;
  return <section className={styles.rubric} aria-label={locale === "vi" ? "Rubric sau khi nộp" : "Post-submission rubric"}>
    <div><span>{locale === "vi" ? "RUBRIC ALGOCORE" : "ALGOCORE RUBRIC"}</span><strong>{answer.marks} {locale === "vi" ? "điểm luyện tập" : "practice marks"}</strong></div>
    {answer.model && <p>{answer.model[locale]}</p>}
    {answer.criteria && <ul>{answer.criteria[locale].map((criterion, index) => <li key={criterion}><span>{answer.mark_groups[index] ?? "•"}</span>{criterion}</li>)}</ul>}
  </section>;
}
