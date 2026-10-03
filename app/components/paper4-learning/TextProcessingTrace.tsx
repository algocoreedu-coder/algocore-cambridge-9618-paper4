"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, CodePanel, Feedback, Select, StateVisual, Textarea } from "@/app/components/algocore-ui";
import type { TextProcessingLearnerProjection, TextProcessingScenarioKind } from "./learnerProjection";
import { learnerText } from "./learnerProjection";
import {
  TEXT_PROCESSING_PRACTICE_KEY,
  TEXT_PROCESSING_PROGRESS_KEY,
  createInitialTextProcessingProgress,
  isTextProcessingNormalComplete,
  restoreTextProcessingProgress,
  textProcessingCases,
  textProcessingCheckpointId,
  textProcessingStep,
  type TextProcessingDraftId,
  type TextProcessingTraceProgress,
} from "./textProcessingAdapter";
import type { LearningLocale } from "./types";
import styles from "./LessonLearningPage.module.css";

const labels = {
  en: {
    choose: "Trace case",
    normal: "Normal · parse and route",
    boundary: "Boundary · empty TEXT fields",
    failure: "Failure · conversion stops routing",
    locked: "Complete all three normal decisions to unlock this case.",
    pipeline: "Parse-and-route pipeline",
    split: "Split",
    validate: "Validate",
    convert: "Convert",
    route: "Route",
    splitHelp: "Use the supplied delimiter once",
    validateHelp: "Check three fields and an allowed tag",
    convertHelp: "Convert only an INT token",
    routeHelp: "Return one accepted key/value pair",
    tag: "TAG",
    key: "KEY",
    value: "VALUE",
    unknown: "Not revealed",
    empty: "empty string",
    code: "Focused Python",
    decision: "Decision",
    prediction: "Your prediction",
    placeholder: "Predict fields, status and whether routing occurs before revealing…",
    record: "Record prediction",
    recorded: "Prediction recorded. Compare it with the approved reasoning.",
    previous: "Previous",
    next: "Next",
    inputFacts: "Input facts",
    recordLabel: "Record",
    delimiter: "Delimiter",
    status: "Status",
    routing: "Routing",
    continues: "continues",
    converted: "conversion complete",
    notRun: "not run",
    routedOnce: "one entry returned",
    stopped: "stopped before route",
    invariant: "Invariant held",
    variantPrompt: "Predict the fields, exact status and whether Route runs.",
  },
  vi: {
    choose: "Trường hợp trace",
    normal: "Normal · parse và route",
    boundary: "Boundary · field TEXT rỗng",
    failure: "Failure · conversion dừng routing",
    locked: "Hoàn thành đủ ba quyết định normal để mở trường hợp này.",
    pipeline: "Pipeline parse-and-route",
    split: "Split",
    validate: "Validate",
    convert: "Convert",
    route: "Route",
    splitHelp: "Dùng delimiter được cho đúng một lần",
    validateHelp: "Kiểm tra ba field và tag hợp lệ",
    convertHelp: "Chỉ convert token INT",
    routeHelp: "Return một cặp key/value hợp lệ",
    tag: "TAG",
    key: "KEY",
    value: "VALUE",
    unknown: "Chưa mở",
    empty: "chuỗi rỗng",
    code: "Python đang xét",
    decision: "Quyết định",
    prediction: "Dự đoán của bạn",
    placeholder: "Dự đoán fields, status và Route có chạy không trước khi mở…",
    record: "Ghi nhận dự đoán",
    recorded: "Đã ghi nhận dự đoán. Hãy đối chiếu với lập luận chuẩn.",
    previous: "Trước",
    next: "Tiếp",
    inputFacts: "Dữ kiện input",
    recordLabel: "Record",
    delimiter: "Delimiter",
    status: "Status",
    routing: "Routing",
    continues: "tiếp tục",
    converted: "đã conversion",
    notRun: "chưa chạy",
    routedOnce: "return một entry",
    stopped: "dừng trước Route",
    invariant: "Giữ đúng bất biến",
    variantPrompt: "Dự đoán fields, status chính xác và Route có chạy không.",
  },
} as const;

const practiceLabels = {
  en: { answer: "Your answer or trace", placeholder: "Write your answer before revealing support…", record: "Record attempt", recorded: "Attempt recorded. You can now check the support.", hint: "Hint", model: "Model answer", check: "Success check", previous: "Previous practice", next: "Next practice", item: "Practice item", of: "of" },
  vi: { answer: "Câu trả lời hoặc trace của bạn", placeholder: "Viết câu trả lời trước khi mở hỗ trợ…", record: "Ghi nhận lần làm", recorded: "Đã ghi nhận. Bây giờ bạn có thể kiểm tra phần hỗ trợ.", hint: "Gợi ý", model: "Đáp án mẫu", check: "Điểm tự kiểm", previous: "Bài luyện trước", next: "Bài luyện tiếp", item: "Bài luyện", of: "trên" },
} as const;

type PipelineNode = "split" | "validate" | "convert" | "route";
const pipelineNodes: readonly PipelineNode[] = ["split", "validate", "convert", "route"];

function persistTrace(progress: TextProcessingTraceProgress) {
  try { window.sessionStorage.setItem(TEXT_PROCESSING_PROGRESS_KEY, JSON.stringify(progress)); }
  catch { /* Storage can be unavailable. */ }
}

function emptyLabel(value: string, label: string) { return value === "" ? label : value; }

export function TextProcessingTrace({ projection, locale, onLearnerProgress }: Readonly<{
  projection: TextProcessingLearnerProjection;
  locale: LearningLocale;
  onLearnerProgress: (normalComplete: boolean) => void;
}>) {
  const t = labels[locale];
  const [progress, setProgress] = useState<TextProcessingTraceProgress>(createInitialTextProcessingProgress);
  const [restored, setRestored] = useState(false);
  const cases = useMemo(() => textProcessingCases(projection), [projection]);
  const normalComplete = isTextProcessingNormalComplete(progress);
  const traceCase = cases.find((item) => item.kind === progress.scenario) ?? cases[0];
  const checkpointId = textProcessingCheckpointId(progress.checkpoint_index);
  const draftKey: TextProcessingDraftId = progress.scenario === "normal" ? checkpointId : `${progress.scenario}:0`;
  const draft = progress.drafts[draftKey] ?? "";
  const revealed = progress.scenario === "normal" ? progress.revealed_checkpoint_ids.includes(checkpointId) : progress.phase === "revealed";
  const step = textProcessingStep(projection, progress.checkpoint_index);

  useEffect(() => {
    const candidate = restoreTextProcessingProgress(window.sessionStorage.getItem(TEXT_PROCESSING_PROGRESS_KEY));
    if (candidate) setProgress(candidate);
    setRestored(true);
  }, []);
  useEffect(() => { if (restored) onLearnerProgress(normalComplete); }, [normalComplete, onLearnerProgress, restored]);

  const commit = (next: TextProcessingTraceProgress) => { persistTrace(next); setProgress(next); };
  const setDraft = (value: string) => commit({ ...progress, phase: "predict", drafts: { ...progress.drafts, [draftKey]: value } });
  const reveal = () => {
    if (!draft.trim()) return;
    const revealedIds = progress.scenario === "normal" && !progress.revealed_checkpoint_ids.includes(checkpointId)
      ? [...progress.revealed_checkpoint_ids, checkpointId]
      : progress.revealed_checkpoint_ids;
    commit({ ...progress, phase: "revealed", revealed_checkpoint_ids: revealedIds });
  };
  const selectScenario = (scenario: TextProcessingScenarioKind) => commit({ ...progress, scenario, checkpoint_index: 0, phase: "predict" });
  const move = (checkpoint_index: 0 | 1 | 2) => {
    commit({ ...progress, checkpoint_index, phase: progress.revealed_checkpoint_ids.includes(textProcessingCheckpointId(checkpoint_index)) ? "revealed" : "predict" });
    requestAnimationFrame(() => document.getElementById("text-processing-trace-prediction")?.focus());
  };

  const currentNode: PipelineNode = progress.scenario === "failure" ? "convert" : progress.scenario === "boundary" ? "route" : (["validate", "convert", "route"] as const)[progress.checkpoint_index];
  const nodeIndex = pipelineNodes.indexOf(currentNode);
  const fields = progress.scenario === "normal"
    ? ["INT", "age", "16"]
    : progress.scenario === "boundary" ? ["TEXT", "", ""] : ["INT", "age", "sixteen"];
  const showFields = revealed || (progress.scenario === "normal" && progress.checkpoint_index > 0);
  const fieldValues = showFields ? fields : [t.unknown, t.unknown, t.unknown];
  const focusedCode = progress.scenario === "normal" ? step.code_focus : progress.scenario === "boundary"
    ? ["fields = record.split(delimiter)", "tag, key, token = fields", "return \"OK\", {key: value}"]
    : revealed
      ? ["value = int(token) if tag == \"INT\" else token", "except ValueError:", "    return \"MALFORMED\", {}"]
      : ["try:", "    value = int(token) if tag == \"INT\" else token", "except ValueError:"];
  const codeLines = focusedCode.map((text, index) => ({ number: index + 1, text, active: true }));
  const stateFacts = [
    { label: t.recordLabel, value: traceCase.record },
    { label: t.delimiter, value: traceCase.delimiter },
    ...(revealed ? progress.scenario === "normal"
      ? [
          { label: t.status, value: progress.checkpoint_index === 0 ? t.continues : progress.checkpoint_index === 1 ? t.converted : "OK", changed: true },
          { label: t.routing, value: progress.checkpoint_index === 2 ? t.routedOnce : t.notRun, changed: progress.checkpoint_index === 2 },
        ]
      : [
          { label: t.status, value: traceCase.expected.status, changed: true },
          { label: t.routing, value: progress.scenario === "boundary" ? t.routedOnce : t.stopped, changed: true },
        ] : []),
  ];

  return <section className={styles.textProcessingTrace} data-testid="paper4-text-processing-trace" data-case-kind={progress.scenario} data-checkpoint-index={progress.checkpoint_index} data-phase={revealed ? "revealed" : "predict"} data-normal-complete={normalComplete ? "true" : "false"}>
    <div className={styles.traceToolbar}>
      <Select id="text-processing-trace-case" label={t.choose} value={progress.scenario} data-scenario-select onChange={(event) => selectScenario(event.target.value as TextProcessingScenarioKind)}>
        <option value="normal">{t.normal}</option>
        <option value="boundary" disabled={!normalComplete}>{t.boundary}</option>
        <option value="failure" disabled={!normalComplete}>{t.failure}</option>
      </Select>
      {!normalComplete && <p className={styles.traceLockNote} data-trace-lock-note>{t.locked}</p>}
    </div>
    <div className={styles.textProcessingTracePanels}>
      <section className={styles.textProcessingPipelinePanel} data-trace-panel="pipeline-code" data-scene="text-record-pipeline" aria-labelledby="text-processing-pipeline-title">
        <h3 id="text-processing-pipeline-title">{t.pipeline}</h3>
        <ol className={styles.textProcessingPipeline}>
          {pipelineNodes.map((node, index) => <li key={node} data-pipeline-step={node} data-pipeline-state={node === currentNode ? "current" : index < nodeIndex ? "complete" : "inactive"} aria-current={node === currentNode ? "step" : undefined}>
            <strong>{t[node]}</strong><span>{t[`${node}Help` as const]}</span>
          </li>)}
        </ol>
        <div className={styles.textProcessingFields} aria-label={t.inputFacts}>
          {[t.tag, t.key, t.value].map((label, index) => <div data-field-box={(["tag", "key", "value"] as const)[index]} key={label}><span>{label}</span><strong>{emptyLabel(fieldValues[index], t.empty)}</strong></div>)}
        </div>
        <div data-code-panel="text-processing-focus" data-focused-code><CodePanel title={t.code} caption={progress.scenario === "normal" ? `${t.decision} ${progress.checkpoint_index + 1} / 3` : learnerText(traceCase.label, locale)} lines={codeLines} /></div>
      </section>
      <section className={styles.textProcessingPredictionPanel} data-trace-panel="prediction" data-trace-prediction>
        <StateVisual title={t.inputFacts} facts={stateFacts} />
        <Textarea id="text-processing-trace-prediction" label={progress.scenario === "normal" ? learnerText(step.prediction, locale) : t.variantPrompt} placeholder={t.placeholder} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button data-action="record-prediction" disabled={!draft.trim()} onClick={reveal}>{t.record}</Button>
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

type TextProcessingPracticeStage = TextProcessingLearnerProjection["stages"]["practise"];

export function TextProcessingPractice({ stage, locale, onAttemptChange }: Readonly<{ stage: TextProcessingPracticeStage; locale: LearningLocale; onAttemptChange?: (hasAttempt: boolean) => void }>) {
  const t = practiceLabels[locale];
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set());
  const [restored, setRestored] = useState(false);
  const item = stage.items[index];
  const draft = drafts[index] ?? "";
  const hasAttempt = attempted.has(index);
  const transfer = index === 2 ? "comparison" : index === 3 ? "rle" : undefined;

  useEffect(() => {
    try {
      const value = JSON.parse(window.sessionStorage.getItem(TEXT_PROCESSING_PRACTICE_KEY) ?? "null") as unknown;
      if (!value || typeof value !== "object" || Array.isArray(value)) { setRestored(true); return; }
      const stored = value as { index?: unknown; drafts?: unknown; attempted?: unknown };
      if (typeof stored.index === "number" && Number.isInteger(stored.index) && stored.index >= 0 && stored.index < 4) setIndex(stored.index);
      if (stored.drafts && typeof stored.drafts === "object" && !Array.isArray(stored.drafts)) {
        setDrafts(Object.fromEntries(Object.entries(stored.drafts).filter(([key, value]) => /^[0-3]$/.test(key) && typeof value === "string")));
      }
      if (Array.isArray(stored.attempted)) setAttempted(new Set(stored.attempted.filter((value): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 4)));
    } catch { /* Ignore malformed or unavailable storage. */ }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try { window.sessionStorage.setItem(TEXT_PROCESSING_PRACTICE_KEY, JSON.stringify({ index, drafts, attempted: [...attempted] })); }
    catch { /* Storage can be unavailable. */ }
  }, [attempted, drafts, index, restored]);
  useEffect(() => { onAttemptChange?.(attempted.size > 0); }, [attempted, onAttemptChange]);

  if (!item) return null;
  const persist = (nextIndex: number, nextDrafts: Record<number, string>, nextAttempted: ReadonlySet<number>) => {
    try { window.sessionStorage.setItem(TEXT_PROCESSING_PRACTICE_KEY, JSON.stringify({ index: nextIndex, drafts: nextDrafts, attempted: [...nextAttempted] })); }
    catch { /* Storage can be unavailable. */ }
  };
  const record = () => {
    if (!draft.trim()) return;
    const nextAttempted = new Set([...attempted, index]);
    persist(index, drafts, nextAttempted);
    setAttempted(nextAttempted);
  };
  const move = (nextIndex: number) => {
    persist(nextIndex, drafts, attempted);
    setIndex(nextIndex);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return <div className={`${styles.practiceJourney} ${styles.textProcessingPractice}`} data-practice-gate="attempt-before-reveal" data-practice-index={index}>
    <p>{learnerText(stage.attempt_rule, locale)}</p>
    <article className={styles.learnerCard} data-transfer-card={transfer}>
      <header className={styles.cardHeader}><div><span>{learnerText(item.level, locale)}</span><h3>{learnerText(item.title, locale)}</h3></div><strong>{t.item} {index + 1} {t.of} 4</strong></header>
      <p>{learnerText(item.prompt, locale)}</p>
      <label className={styles.responseField}><span>{t.answer}</span><textarea ref={inputRef} value={draft} onChange={(event) => { const nextDrafts = { ...drafts, [index]: event.target.value }; persist(index, nextDrafts, attempted); setDrafts(nextDrafts); }} placeholder={t.placeholder} rows={5} /></label>
      <button className={styles.learningButton} type="button" data-action="record-practice" disabled={!draft.trim()} onClick={record}>{t.record}</button>
      <p className={styles.statusText} aria-live="polite">{hasAttempt ? t.recorded : ""}</p>
      {hasAttempt && <div className={styles.afterAttempt} data-answer-revealed="true"><details><summary>{t.hint}</summary><p>{learnerText(item.hint, locale)}</p></details><details><summary>{t.model}</summary><p>{learnerText(item.model_answer, locale)}</p></details><p><strong>{t.check}: </strong>{learnerText(item.success_check, locale)}</p></div>}
    </article>
    <nav className={styles.itemNav} aria-label={stage.name[locale]}><button type="button" data-action="previous-practice" disabled={index === 0} onClick={() => move(Math.max(0, index - 1))}>← {t.previous}</button><button type="button" data-action="next-practice" disabled={index >= 3 || !hasAttempt} onClick={() => move(Math.min(3, index + 1))}>{t.next} →</button></nav>
  </div>;
}
