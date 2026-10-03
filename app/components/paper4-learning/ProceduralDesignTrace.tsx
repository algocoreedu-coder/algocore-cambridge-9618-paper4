"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, CodePanel, Feedback, Select, StateVisual, Textarea } from "@/app/components/algocore-ui";
import type { ProceduralDesignLearnerProjection, ProceduralScenarioKind } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import {
  PROCEDURAL_DESIGN_PROGRESS_KEY,
  checkpointId,
  createInitialProceduralProgress,
  isNormalComplete,
  proceduralCases,
  restoreProceduralProgress,
  stepFor,
  type ProceduralTraceProgress,
  type ProceduralTraceDraftId,
} from "./proceduralDesignAdapter";
import type { LearningLocale } from "./types";
import styles from "./LessonLearningPage.module.css";

const labels = {
  en: {
    callFlow: "Responsibility and call flow",
    coordinator: "Coordinator",
    transform: "Transform",
    classify: "Classify",
    validate: "Validate input and control the calls",
    adjust: "Build a new adjusted list",
    label: "Return one label for each adjusted score",
    checkpoint: "Checkpoint",
    code: "Focused Python",
    prediction: "Your prediction",
    placeholder: "Predict the next call, returned value and whether scores changes…",
    record: "Record prediction",
    previous: "Previous",
    next: "Next",
    choose: "Trace case",
    normal: "Normal · three calls",
    boundary: "Boundary · empty scores",
    failure: "Failure · invalid bonus",
    locked: "Complete all three normal checkpoints to unlock this case.",
    recorded: "Prediction recorded. Compare it with the explanation.",
    result: "Returned result",
    input: "Input",
    status: "Status",
    adjusted: "Adjusted",
    outputLabels: "Labels",
    original: "Original scores",
    unchanged: "unchanged",
    invariant: "Invariant held",
    variantPrompt: "Predict the status, output lists and which helpers run.",
    continues: "continues",
    pending: "not created yet",
  },
  vi: {
    callFlow: "Trách nhiệm và luồng gọi",
    coordinator: "Điều phối",
    transform: "Biến đổi",
    classify: "Phân loại",
    validate: "Kiểm tra input và điều khiển các lời gọi",
    adjust: "Tạo list điểm điều chỉnh mới",
    label: "Trả một nhãn cho mỗi điểm đã điều chỉnh",
    checkpoint: "Checkpoint",
    code: "Python đang xét",
    prediction: "Dự đoán của bạn",
    placeholder: "Dự đoán lời gọi tiếp theo, giá trị return và scores có đổi không…",
    record: "Ghi nhận dự đoán",
    previous: "Trước",
    next: "Tiếp",
    choose: "Trường hợp trace",
    normal: "Normal · ba lời gọi",
    boundary: "Boundary · scores rỗng",
    failure: "Failure · bonus không hợp lệ",
    locked: "Hoàn thành đủ ba checkpoint normal để mở trường hợp này.",
    recorded: "Đã ghi nhận dự đoán. Hãy đối chiếu với giải thích.",
    result: "Kết quả return",
    input: "Input",
    status: "Status",
    adjusted: "Adjusted",
    outputLabels: "Labels",
    original: "Scores ban đầu",
    unchanged: "không đổi",
    invariant: "Giữ đúng bất biến",
    variantPrompt: "Dự đoán status, các list output và những helper nào chạy.",
    continues: "tiếp tục",
    pending: "chưa được tạo",
  },
} as const;

function persist(progress: ProceduralTraceProgress) {
  try { window.sessionStorage.setItem(PROCEDURAL_DESIGN_PROGRESS_KEY, JSON.stringify(progress)); }
  catch { /* Storage can be unavailable. */ }
}

function normalRole(index: 0 | 1 | 2) {
  return index === 0 ? "coordinator" : index === 1 ? "transform" : "classify";
}

export function ProceduralDesignTrace({ projection, locale, onLearnerProgress }: Readonly<{
  projection: ProceduralDesignLearnerProjection;
  locale: LearningLocale;
  onLearnerProgress: (normalComplete: boolean) => void;
}>) {
  const t = labels[locale];
  const [progress, setProgress] = useState<ProceduralTraceProgress>(createInitialProceduralProgress);
  const [restored, setRestored] = useState(false);
  const cases = useMemo(() => proceduralCases(projection), [projection]);
  const normalComplete = isNormalComplete(progress);
  const traceCase = cases.find((item) => item.kind === progress.scenario) ?? cases[0];
  const id = checkpointId(progress.checkpoint_index);
  const draftKey: ProceduralTraceDraftId = progress.scenario === "normal" ? id : `${progress.scenario}:0`;
  const draft = progress.drafts[draftKey] ?? "";
  const revealed = progress.scenario === "normal" ? progress.revealed_checkpoint_ids.includes(id) : progress.phase === "revealed";
  const step = stepFor(projection, progress.checkpoint_index);

  useEffect(() => {
    const candidate = restoreProceduralProgress(window.sessionStorage.getItem(PROCEDURAL_DESIGN_PROGRESS_KEY));
    if (candidate) setProgress(candidate);
    setRestored(true);
  }, []);

  useEffect(() => { if (restored) onLearnerProgress(normalComplete); }, [normalComplete, onLearnerProgress, restored]);

  const commit = (next: ProceduralTraceProgress) => {
    persist(next);
    setProgress(next);
  };
  const setDraft = (value: string) => commit({ ...progress, phase: "predict", drafts: { ...progress.drafts, [draftKey]: value } });
  const reveal = () => {
    if (!draft.trim()) return;
    const revealedIds = progress.scenario === "normal" && !progress.revealed_checkpoint_ids.includes(id)
      ? [...progress.revealed_checkpoint_ids, id]
      : progress.revealed_checkpoint_ids;
    commit({ ...progress, phase: "revealed", revealed_checkpoint_ids: revealedIds });
  };
  const selectScenario = (scenario: ProceduralScenarioKind) => commit({ ...progress, scenario, checkpoint_index: 0, phase: "predict" });
  const move = (checkpoint_index: 0 | 1 | 2) => {
    commit({ ...progress, checkpoint_index, phase: progress.revealed_checkpoint_ids.includes(checkpointId(checkpoint_index)) ? "revealed" : "predict" });
    requestAnimationFrame(() => document.getElementById("procedural-trace-prediction")?.focus());
  };

  const focusedCode = progress.scenario === "normal" ? step.code_focus : progress.scenario === "boundary"
    ? ["adjusted = [min(100, score + bonus) for score in scores]", "labels = [classify(score) for score in adjusted]", "return \"OK\", adjusted, labels"]
    : ["if type(bonus) is not int:", "    return \"INVALID_INPUT\", [], []"];
  const codeLines = focusedCode.map((text, index) => ({ number: index + 1, text, active: true }));
  const resultFacts = revealed ? [
    { label: t.status, value: progress.scenario === "normal" && progress.checkpoint_index < 2 ? t.continues : traceCase.expected.status, changed: true },
    { label: t.adjusted, value: progress.scenario === "normal" && progress.checkpoint_index === 0 ? t.pending : JSON.stringify(traceCase.expected.adjusted), changed: true },
    { label: t.outputLabels, value: progress.scenario === "normal" && progress.checkpoint_index < 2 ? t.pending : JSON.stringify(traceCase.expected.labels), changed: true },
    { label: t.original, value: `${JSON.stringify(traceCase.scores)} · ${t.unchanged}` },
  ] : [];

  return <section
    className={styles.proceduralTrace}
    data-testid="paper4-procedural-design-trace"
    data-case-kind={progress.scenario}
    data-checkpoint-index={progress.checkpoint_index}
    data-phase={revealed ? "revealed" : "predict"}
    data-normal-complete={normalComplete ? "true" : "false"}
  >
    <div className={styles.traceToolbar}>
      <Select id="procedural-trace-case" label={t.choose} value={progress.scenario} data-scenario-select onChange={(event) => selectScenario(event.target.value as ProceduralScenarioKind)}>
        <option value="normal">{t.normal}</option>
        <option value="boundary" disabled={!normalComplete}>{t.boundary}</option>
        <option value="failure" disabled={!normalComplete}>{t.failure}</option>
      </Select>
      {!normalComplete && <p className={styles.traceLockNote} data-trace-lock-note>{t.locked}</p>}
    </div>
    <div className={styles.proceduralTracePanels}>
      <section className={styles.responsibilityPanel} data-trace-panel="responsibility" data-scene="procedural-responsibility-flow" aria-labelledby="procedural-call-flow-title">
        <h3 id="procedural-call-flow-title">{t.callFlow}</h3>
        <ol data-call-flow>
          <li data-flow-node="coordinator" aria-current={progress.scenario !== "normal" || normalRole(progress.checkpoint_index) === "coordinator" ? "step" : undefined}><strong>{t.coordinator}</strong><span>{t.validate}</span></li>
          <li data-flow-node="transform" aria-current={progress.scenario === "normal" && normalRole(progress.checkpoint_index) === "transform" ? "step" : undefined}><strong>{t.transform}</strong><span>{t.adjust}</span></li>
          <li data-flow-node="classify" aria-current={progress.scenario === "normal" && normalRole(progress.checkpoint_index) === "classify" ? "step" : undefined}><strong>{t.classify}</strong><span>{t.label}</span></li>
        </ol>
        <div data-focused-code><CodePanel title={t.code} caption={progress.scenario === "normal" ? `${t.checkpoint} ${progress.checkpoint_index + 1} / 3` : traceCase.label} lines={codeLines} /></div>
      </section>
      <section className={styles.predictionPanel} data-trace-panel="prediction" data-trace-prediction>
        <p><strong>{t.input}:</strong> scores = {JSON.stringify(traceCase.scores)}, bonus = {JSON.stringify(traceCase.bonus)}</p>
        <Textarea
          id="procedural-trace-prediction"
          label={progress.scenario === "normal" ? learnerText(step.prediction, locale) : t.variantPrompt}
          placeholder={t.placeholder}
          rows={4}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={reveal}>{t.record}</Button>
        {revealed && <div data-answer-revealed="true" className={styles.traceAnswer}>
          <Feedback status="success" title={t.recorded}>{progress.scenario === "normal" ? learnerText(step.answer, locale) : learnerText(traceCase.explanation!, locale)}</Feedback>
          <StateVisual title={t.result} facts={resultFacts} />
          <p className={styles.invariantResult}><strong>{t.invariant}:</strong> {learnerText(projection.stages.trace.invariant_check, locale)}</p>
        </div>}
      </section>
    </div>
    {progress.scenario === "normal" && <nav className={styles.traceStepNav} aria-label={projection.stages.trace.name[locale]}>
      <Button variant="secondary" data-action="previous" disabled={progress.checkpoint_index === 0} onClick={() => move((progress.checkpoint_index - 1) as 0 | 1 | 2)}>← {t.previous}</Button>
      <Button variant="secondary" data-action="next" disabled={!revealed || progress.checkpoint_index === 2} onClick={() => move((progress.checkpoint_index + 1) as 0 | 1 | 2)}>{t.next} →</Button>
    </nav>}
  </section>;
}
