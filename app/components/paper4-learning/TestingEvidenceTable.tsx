"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, CodePanel, Feedback, Textarea } from "@/app/components/algocore-ui";
import type { TestingLearnerProjection } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import type { LearningLocale } from "./types";
import {
  TESTING_PROGRESS_KEY,
  createInitialTestingProgress,
  isTestingComplete,
  restoreTestingProgress,
  testingBoundaryRow,
  testingCheckpointId,
  testingStep,
  testingSupportRows,
  type TestingTraceProgress,
} from "./testingProjectionAdapter";
import styles from "./LessonLearningPage.module.css";

const labels = {
  en: {
    caption: "Boundary evidence row",
    input: "Input",
    expected: "Expected",
    actual: "Actual",
    result: "Pass / fail",
    expectedPrompt: "Write expected first",
    actualHidden: "Reveal after prediction",
    resultHidden: "Not checked yet",
    fail: "Fail — mismatch",
    pass: "Pass — match",
    prediction: "Your prediction",
    placeholder: "Write expected, actual and the first mismatch before revealing…",
    record: "Record prediction",
    recorded: "Prediction recorded. Compare it with the evidence row.",
    code: "Focused Python",
    decision: "Decision",
    previous: "Previous",
    next: "Next",
    support: "Regression coverage after repair",
    normal: "Normal partitions",
    failure: "Invalid partitions",
    allPass: "All rows pass after repair",
    invariant: "What must stay fixed",
  },
  vi: {
    caption: "Row bằng chứng boundary",
    input: "Input",
    expected: "Expected",
    actual: "Actual",
    result: "Pass / fail",
    expectedPrompt: "Viết expected trước",
    actualHidden: "Mở sau khi dự đoán",
    resultHidden: "Chưa kiểm tra",
    fail: "Fail — mismatch",
    pass: "Pass — khớp",
    prediction: "Dự đoán của bạn",
    placeholder: "Viết expected, actual và mismatch đầu tiên trước khi mở…",
    record: "Ghi nhận dự đoán",
    recorded: "Đã ghi nhận dự đoán. Hãy đối chiếu với row bằng chứng.",
    code: "Python đang xét",
    decision: "Quyết định",
    previous: "Trước",
    next: "Tiếp",
    support: "Phạm vi regression sau repair",
    normal: "Các partition normal",
    failure: "Các partition invalid",
    allPass: "Mọi row đều pass sau repair",
    invariant: "Điều phải giữ nguyên",
  },
} as const;

function persist(progress: TestingTraceProgress) {
  try { window.sessionStorage.setItem(TESTING_PROGRESS_KEY, JSON.stringify(progress)); }
  catch { /* Storage can be unavailable. */ }
}

export function TestingEvidenceTable({ projection, locale, onLearnerProgress }: Readonly<{
  projection: TestingLearnerProjection;
  locale: LearningLocale;
  onLearnerProgress: (complete: boolean) => void;
}>) {
  const t = labels[locale];
  const [progress, setProgress] = useState<TestingTraceProgress>(createInitialTestingProgress);
  const [restored, setRestored] = useState(false);
  const boundary = useMemo(() => testingBoundaryRow(projection), [projection]);
  const support = useMemo(() => testingSupportRows(projection), [projection]);
  const id = testingCheckpointId(progress.checkpoint_index);
  const step = testingStep(projection, progress.checkpoint_index);
  const draft = progress.drafts[id] ?? "";
  const revealed = progress.revealed_checkpoint_ids.includes(id);
  const complete = isTestingComplete(progress);

  useEffect(() => {
    const candidate = restoreTestingProgress(window.sessionStorage.getItem(TESTING_PROGRESS_KEY));
    if (candidate) setProgress(candidate);
    setRestored(true);
  }, []);
  useEffect(() => { if (restored) onLearnerProgress(complete); }, [complete, onLearnerProgress, restored]);

  const commit = (next: TestingTraceProgress) => { persist(next); setProgress(next); };
  const setDraft = (value: string) => commit({ ...progress, phase: "predict", drafts: { ...progress.drafts, [id]: value } });
  const reveal = () => {
    if (!draft.trim()) return;
    const revealedIds = progress.revealed_checkpoint_ids.includes(id) ? progress.revealed_checkpoint_ids : [...progress.revealed_checkpoint_ids, id];
    commit({ ...progress, phase: "revealed", revealed_checkpoint_ids: revealedIds });
  };
  const move = (checkpoint_index: 0 | 1 | 2) => {
    const nextId = testingCheckpointId(checkpoint_index);
    commit({ ...progress, checkpoint_index, phase: progress.revealed_checkpoint_ids.includes(nextId) ? "revealed" : "predict" });
    requestAnimationFrame(() => document.getElementById("testing-trace-prediction")?.focus());
  };

  const expectedVisible = progress.checkpoint_index > 0 || revealed;
  const defectiveVisible = progress.checkpoint_index === 0 && revealed || progress.checkpoint_index === 1;
  const repairedVisible = progress.checkpoint_index === 2 && revealed;
  const actual = defectiveVisible ? boundary.defectiveActual : repairedVisible ? boundary.repairedActual : null;
  const result = defectiveVisible ? t.fail : repairedVisible ? t.pass : null;
  const codeLines = step.code_focus.map((text, index) => ({ number: index + 1, text, active: true }));

  return <section
    className={styles.testingEvidence}
    data-testid="paper4-testing-evidence-table"
    data-case-kind="boundary"
    data-checkpoint-index={progress.checkpoint_index}
    data-phase={revealed ? "revealed" : "predict"}
    data-repair-complete={complete ? "true" : "false"}
  >
    <div className={styles.testingEvidencePanels}>
      <section className={styles.testingTablePanel} data-trace-panel="test-table" data-scene="testing-static-table">
        <table className={styles.testingTable}>
          <caption>{t.caption}: {learnerText(projection.stages.trace.scenario.label, locale)}</caption>
          <thead><tr><th scope="col">{t.input}</th><th scope="col">{t.expected}</th><th scope="col">{t.actual}</th><th scope="col">{t.result}</th></tr></thead>
          <tbody><tr data-test-row="boundary-40" aria-current="true">
            <td data-test-cell="input" data-label={t.input}><strong>{boundary.input}</strong></td>
            <td data-test-cell="expected" data-label={t.expected}>{expectedVisible ? <strong>{boundary.expected}</strong> : <span>{t.expectedPrompt}</span>}</td>
            <td data-test-cell="actual" data-label={t.actual}>{actual ? <strong>{actual}</strong> : <span>{t.actualHidden}</span>}</td>
            <td data-test-cell="result" data-label={t.result}>{result ? <strong>{result}</strong> : <span>{t.resultHidden}</span>}</td>
          </tr></tbody>
        </table>
        {(progress.checkpoint_index > 0 || revealed) && <div data-focused-code><CodePanel title={t.code} caption={`${t.decision} ${progress.checkpoint_index + 1} / 3`} lines={codeLines} /></div>}
      </section>
      <section className={styles.testingPredictionPanel} data-trace-panel="prediction" data-trace-prediction>
        <Textarea id="testing-trace-prediction" label={learnerText(step.prediction, locale)} placeholder={t.placeholder} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={reveal}>{t.record}</Button>
        {revealed && <div className={styles.traceAnswer} data-answer-revealed="true">
          <Feedback status={progress.checkpoint_index === 0 ? "incorrect" : "success"} title={t.recorded}>{learnerText(step.answer, locale)}</Feedback>
          <p className={styles.invariantResult}><strong>{t.invariant}:</strong> {learnerText(projection.stages.trace.invariant_check, locale)}</p>
        </div>}
      </section>
    </div>
    <nav className={styles.traceStepNav} aria-label={projection.stages.trace.name[locale]}>
      <Button variant="secondary" data-action="previous" disabled={progress.checkpoint_index === 0} onClick={() => move((progress.checkpoint_index - 1) as 0 | 1 | 2)}>← {t.previous}</Button>
      <Button variant="secondary" data-action="next" disabled={!revealed || progress.checkpoint_index === 2} onClick={() => move((progress.checkpoint_index + 1) as 0 | 1 | 2)}>{t.next} →</Button>
    </nav>
    {complete && <section className={styles.testingSupport} aria-labelledby="testing-support-title">
      <h3 id="testing-support-title">{t.support}</h3>
      <div>{support.map((variant) => <article key={variant.kind} data-regression-support={variant.kind}>
        <h4>{variant.kind === "normal" ? t.normal : t.failure}</h4>
        <ul>{variant.input.rows.map((row) => <li key={row.input}><strong>{row.input}</strong> → {row.expected}</li>)}</ul>
        <p><strong>{t.allPass}.</strong> {learnerText(variant.explanation, locale)}</p>
      </article>)}</div>
    </section>}
  </section>;
}
