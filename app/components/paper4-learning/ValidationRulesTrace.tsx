"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, CodePanel, Feedback, Select, StateVisual, Textarea } from "@/app/components/algocore-ui";
import type { ValidationRulesLearnerProjection, ValidationScenarioKind } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import type { LearningLocale } from "./types";
import {
  VALIDATION_RULES_PROGRESS_KEY,
  createInitialValidationProgress,
  isValidationNormalComplete,
  restoreValidationProgress,
  validationCases,
  validationCheckpointId,
  validationStep,
  type ValidationDraftId,
  type ValidationTraceProgress,
} from "./validationRulesAdapter";
import styles from "./LessonLearningPage.module.css";

const labels = {
  en: {
    path: "Ordered guard path",
    typeRange: "Type and range",
    duplicate: "Duplicate",
    supplied: "Supplied check",
    append: "Append",
    typeRangeHelp: "Check integer type and inclusive endpoints",
    duplicateHelp: "Stop if the value is already accepted",
    suppliedHelp: "Use only the rule supplied by the question",
    appendHelp: "Copy, append once and return",
    code: "Focused Python",
    checkpoint: "Decision",
    prediction: "Your prediction",
    placeholder: "Predict the first failing guard, status and whether either list changes…",
    record: "Record prediction",
    previous: "Previous",
    next: "Next",
    choose: "Trace case",
    normal: "Normal · three decisions",
    boundary: "Boundary · inclusive endpoint",
    failure: "Failure · duplicate first",
    locked: "Complete all three normal decisions to unlock this case.",
    recorded: "Prediction recorded. Compare it with the explanation.",
    state: "Validation state",
    candidate: "Candidate",
    acceptedBefore: "Accepted before",
    decision: "Current decision",
    result: "Returned result",
    original: "Original list",
    status: "Status",
    unchanged: "unchanged",
    continues: "continues",
    notReturned: "not returned yet",
    invariant: "Invariant held",
    variantPrompt: "Predict the status, returned list, original list and the first guard that returns.",
    normalOne: "Type and range pass",
    normalTwo: "Duplicate and supplied check pass",
    normalThree: "Append once and return",
    boundaryDecision: "Inclusive endpoint passes",
    failureDecision: "Duplicate returns first",
    currentGroup: "Current decision group",
    then: "then",
  },
  vi: {
    path: "Đường guard theo thứ tự",
    typeRange: "Kiểu và khoảng",
    duplicate: "Trùng lặp",
    supplied: "Kiểm tra được cho",
    append: "Append",
    typeRangeHelp: "Kiểm tra kiểu số nguyên và hai đầu mút",
    duplicateHelp: "Dừng nếu giá trị đã được nhận",
    suppliedHelp: "Chỉ dùng quy tắc đề bài cung cấp",
    appendHelp: "Copy, append một lần rồi return",
    code: "Python đang xét",
    checkpoint: "Quyết định",
    prediction: "Dự đoán của bạn",
    placeholder: "Dự đoán guard đầu tiên thất bại, status và hai list có đổi không…",
    record: "Ghi nhận dự đoán",
    previous: "Trước",
    next: "Tiếp",
    choose: "Trường hợp trace",
    normal: "Normal · ba quyết định",
    boundary: "Boundary · đầu mút được tính",
    failure: "Failure · trùng lặp trước",
    locked: "Hoàn thành đủ ba quyết định normal để mở trường hợp này.",
    recorded: "Đã ghi nhận dự đoán. Hãy đối chiếu với giải thích.",
    state: "Trạng thái validation",
    candidate: "Candidate",
    acceptedBefore: "Accepted ban đầu",
    decision: "Quyết định hiện tại",
    result: "Kết quả return",
    original: "List ban đầu",
    status: "Status",
    unchanged: "không đổi",
    continues: "tiếp tục",
    notReturned: "chưa return",
    invariant: "Giữ đúng bất biến",
    variantPrompt: "Dự đoán status, list trả về, list ban đầu và guard đầu tiên return.",
    normalOne: "Kiểu và khoảng đều pass",
    normalTwo: "Kiểm tra trùng và quy tắc được cho đều pass",
    normalThree: "Append một lần rồi return",
    boundaryDecision: "Đầu mút tính cả hai phía pass",
    failureDecision: "Guard trùng lặp return trước",
    currentGroup: "Nhóm quyết định hiện tại",
    then: "sau đó",
  },
} as const;

function persist(progress: ValidationTraceProgress) {
  try { window.sessionStorage.setItem(VALIDATION_RULES_PROGRESS_KEY, JSON.stringify(progress)); }
  catch { /* Storage can be unavailable. */ }
}

function formatList(values: readonly number[]) { return `[${values.join(", ")}]`; }

type GuardNode = "type-range" | "duplicate" | "supplied-check" | "append";

const normalGuardGroups: Readonly<Record<0 | 1 | 2, readonly GuardNode[]>> = {
  0: ["type-range"],
  1: ["duplicate", "supplied-check"],
  2: ["append"],
};

const variantGuardGroups: Readonly<Record<Exclude<ValidationScenarioKind, "normal">, readonly GuardNode[]>> = {
  boundary: ["type-range"],
  failure: ["duplicate"],
};

function activeGuardGroup(scenario: ValidationScenarioKind, index: 0 | 1 | 2): readonly GuardNode[] {
  return scenario === "normal" ? normalGuardGroups[index] : variantGuardGroups[scenario];
}

export function ValidationRulesTrace({ projection, locale, onLearnerProgress }: Readonly<{
  projection: ValidationRulesLearnerProjection;
  locale: LearningLocale;
  onLearnerProgress: (normalComplete: boolean) => void;
}>) {
  const t = labels[locale];
  const [progress, setProgress] = useState<ValidationTraceProgress>(createInitialValidationProgress);
  const [restored, setRestored] = useState(false);
  const cases = useMemo(() => validationCases(projection), [projection]);
  const normalComplete = isValidationNormalComplete(progress);
  const traceCase = cases.find((item) => item.kind === progress.scenario) ?? cases[0];
  const checkpointId = validationCheckpointId(progress.checkpoint_index);
  const draftKey: ValidationDraftId = progress.scenario === "normal" ? checkpointId : `${progress.scenario}:0`;
  const draft = progress.drafts[draftKey] ?? "";
  const revealed = progress.scenario === "normal"
    ? progress.revealed_checkpoint_ids.includes(checkpointId)
    : progress.phase === "revealed";
  const step = validationStep(projection, progress.checkpoint_index);
  const currentGuardGroup = activeGuardGroup(progress.scenario, progress.checkpoint_index);
  const currentGroupId = currentGuardGroup.join("+");

  useEffect(() => {
    const candidate = restoreValidationProgress(window.sessionStorage.getItem(VALIDATION_RULES_PROGRESS_KEY));
    if (candidate) setProgress(candidate);
    setRestored(true);
  }, []);

  useEffect(() => { if (restored) onLearnerProgress(normalComplete); }, [normalComplete, onLearnerProgress, restored]);

  const commit = (next: ValidationTraceProgress) => { persist(next); setProgress(next); };
  const setDraft = (value: string) => commit({ ...progress, phase: "predict", drafts: { ...progress.drafts, [draftKey]: value } });
  const reveal = () => {
    if (!draft.trim()) return;
    const revealedIds = progress.scenario === "normal" && !progress.revealed_checkpoint_ids.includes(checkpointId)
      ? [...progress.revealed_checkpoint_ids, checkpointId]
      : progress.revealed_checkpoint_ids;
    commit({ ...progress, phase: "revealed", revealed_checkpoint_ids: revealedIds });
  };
  const selectScenario = (scenario: ValidationScenarioKind) => commit({ ...progress, scenario, checkpoint_index: 0, phase: "predict" });
  const move = (checkpoint_index: 0 | 1 | 2) => {
    commit({
      ...progress,
      checkpoint_index,
      phase: progress.revealed_checkpoint_ids.includes(validationCheckpointId(checkpoint_index)) ? "revealed" : "predict",
    });
    requestAnimationFrame(() => document.getElementById("validation-trace-prediction")?.focus());
  };

  const focusedCode = progress.scenario === "normal" ? step.code_focus : progress.scenario === "boundary"
    ? ["if candidate < minimum or candidate > maximum:", "updated = list(accepted)", "updated.append(candidate)"]
    : ["if candidate in accepted:", "    return \"DUPLICATE\", list(accepted)"];
  const codeLines = focusedCode.map((text, index) => ({ number: index + 1, text, active: true }));
  const decision = progress.scenario === "normal"
    ? [t.normalOne, t.normalTwo, t.normalThree][progress.checkpoint_index]
    : progress.scenario === "boundary" ? t.boundaryDecision : t.failureDecision;
  const finalResult = progress.scenario === "normal" && progress.checkpoint_index < 2 ? null : traceCase.expected;
  const resultFacts = [
    { label: t.candidate, value: String(traceCase.candidate) },
    { label: t.acceptedBefore, value: formatList(traceCase.accepted) },
    { label: t.decision, value: revealed ? decision : "—", changed: revealed },
    { label: t.status, value: revealed ? finalResult?.status ?? t.continues : t.notReturned, changed: revealed },
    ...(revealed && finalResult ? [
      { label: t.result, value: formatList(finalResult.returned), changed: true },
      { label: t.original, value: `${formatList(finalResult.original)} · ${t.unchanged}` },
    ] : []),
  ];

  return <section
    className={styles.validationTrace}
    data-testid="paper4-validation-rules-trace"
    data-case-kind={progress.scenario}
    data-checkpoint-index={progress.checkpoint_index}
    data-phase={revealed ? "revealed" : "predict"}
    data-normal-complete={normalComplete ? "true" : "false"}
  >
    <div className={styles.traceToolbar}>
      <Select id="validation-trace-case" label={t.choose} value={progress.scenario} data-scenario-select onChange={(event) => selectScenario(event.target.value as ValidationScenarioKind)}>
        <option value="normal">{t.normal}</option>
        <option value="boundary" disabled={!normalComplete}>{t.boundary}</option>
        <option value="failure" disabled={!normalComplete}>{t.failure}</option>
      </Select>
      {!normalComplete && <p className={styles.traceLockNote} data-trace-lock-note>{t.locked}</p>}
    </div>
    <div className={styles.validationTracePanels}>
      <section className={styles.guardPathPanel} data-trace-panel="guard-path" data-scene="validation-guard-path" aria-labelledby="validation-guard-path-title">
        <h3 id="validation-guard-path-title">{t.path}</h3>
        <p className={styles.srOnly} aria-current="step" data-current-group={currentGroupId}>{t.currentGroup}: {currentGuardGroup.map((guard) => guard === "type-range" ? t.typeRange : guard === "duplicate" ? t.duplicate : guard === "supplied-check" ? t.supplied : t.append).join(` ${t.then} `)}</p>
        <ol data-guard-path data-current-group={currentGroupId}>
          <li data-guard-node="type-range" data-guard-state={currentGuardGroup.includes("type-range") ? "current" : "inactive"}><strong>{t.typeRange}</strong><span>{t.typeRangeHelp}</span></li>
          <li data-guard-node="duplicate" data-guard-state={currentGuardGroup.includes("duplicate") ? "current" : "inactive"}><strong>{t.duplicate}</strong><span>{t.duplicateHelp}</span></li>
          <li data-guard-node="supplied-check" data-guard-state={currentGuardGroup.includes("supplied-check") ? "current" : "inactive"}><strong>{t.supplied}</strong><span>{t.suppliedHelp}</span></li>
          <li data-guard-node="append" data-guard-state={currentGuardGroup.includes("append") ? "current" : "inactive"}><strong>{t.append}</strong><span>{t.appendHelp}</span></li>
        </ol>
        <div data-focused-code><CodePanel title={t.code} caption={progress.scenario === "normal" ? `${t.checkpoint} ${progress.checkpoint_index + 1} / 3` : traceCase.label} lines={codeLines} /></div>
      </section>
      <section className={styles.validationPredictionPanel} data-trace-panel="prediction" data-trace-prediction>
        <p><strong>{t.candidate}:</strong> {traceCase.candidate} · <strong>{t.acceptedBefore}:</strong> {formatList(traceCase.accepted)} · {traceCase.minimum}..{traceCase.maximum}</p>
        <Textarea
          id="validation-trace-prediction"
          label={progress.scenario === "normal" ? learnerText(step.prediction, locale) : t.variantPrompt}
          placeholder={t.placeholder}
          rows={4}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={reveal}>{t.record}</Button>
        <StateVisual title={t.state} facts={resultFacts} />
        {revealed && <div data-answer-revealed="true" className={styles.traceAnswer}>
          <Feedback status="success" title={t.recorded}>{progress.scenario === "normal" ? learnerText(step.answer, locale) : learnerText(traceCase.explanation!, locale)}</Feedback>
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
