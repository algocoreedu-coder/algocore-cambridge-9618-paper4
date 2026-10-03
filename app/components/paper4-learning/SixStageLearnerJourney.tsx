"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { Paper4VisualRuntime } from "@/app/components/paper4-visual";
import { BINARY_SEARCH_PROGRESS_KEY } from "@/app/components/paper4-visual/binarySearchAdapter";
import { DATA_MODELS_PROGRESS_KEY } from "@/app/components/paper4-visual/dataModelsAdapter";
import { DataModelsVisualRuntime } from "@/app/components/paper4-visual/DataModelsVisualRuntime";
import type { PatternMetadata, PythonArtifactDto } from "@/app/components/paper4-visual/types";
import { LearnerCodeCard, LearnerPractice, LearnerRecall, LearnerRiskChecks, practiceProgressKey, recallProgressKey } from "./LearnerInteractions";
import { LEARNER_STAGE_IDS, learnerText, stageMarker, type DataModelsLearnerProjection, type LearnerProjection, type LearnerStageId, type LinkedListLearnerProjection, type PerformanceLearnerProjection, type ProceduralDesignLearnerProjection, type QueueLearnerProjection, type RecursionLearnerProjection, type SearchCollectionsLearnerProjection, type SortingLearnerProjection, type StackLearnerProjection, type TestingLearnerProjection, type TextProcessingLearnerProjection, type ValidationRulesLearnerProjection } from "./learnerProjection";
import { ProceduralDesignTrace } from "./ProceduralDesignTrace";
import { PROCEDURAL_DESIGN_PROGRESS_KEY, PROCEDURAL_DESIGN_PROTECT_KEY } from "./proceduralDesignAdapter";
import { ValidationRulesTrace } from "./ValidationRulesTrace";
import { VALIDATION_RULES_PROGRESS_KEY, VALIDATION_RULES_PROTECT_KEY } from "./validationRulesAdapter";
import { TestingEvidenceTable } from "./TestingEvidenceTable";
import { TESTING_PROGRESS_KEY, TESTING_PROTECT_KEY } from "./testingProjectionAdapter";
import { TextProcessingPractice, TextProcessingTrace } from "./TextProcessingTrace";
import { TEXT_PROCESSING_PROGRESS_KEY, TEXT_PROCESSING_PROTECT_KEY } from "./textProcessingAdapter";
import { SearchCollectionsPractice, SearchCollectionsTrace } from "./SearchCollectionsTrace";
import { SEARCH_COLLECTIONS_PROGRESS_KEY, SEARCH_COLLECTIONS_PROTECT_KEY } from "./searchCollectionsAdapter";
import { SortingPractice, SortingTrace } from "./SortingTrace";
import { SORTING_PROGRESS_KEY, SORTING_PROTECT_KEY } from "./sortingAdapter";
import { PerformanceEvidenceTable, PerformancePractice } from "./PerformanceEvidenceTable";
import { PERFORMANCE_PROGRESS_KEY, PERFORMANCE_PROTECT_KEY } from "./performanceProjectionAdapter";
import { StackPractice, StackTrace } from "./StackTrace";
import { STACK_PROGRESS_KEY, STACK_PROTECT_KEY } from "./stackProjectionAdapter";
import { QueuePractice, QueueTrace } from "./QueueTrace";
import { QUEUE_PROGRESS_KEY, QUEUE_PROTECT_KEY } from "./queueProjectionAdapter";
import { LinkedListPractice, LinkedListTrace } from "./LinkedListTrace";
import { LINKED_LIST_PROGRESS_KEY, LINKED_LIST_PROTECT_KEY } from "./linkedListProjectionAdapter";
import { RecursionPractice, RecursionTrace } from "./RecursionTrace";
import { RECURSION_PROGRESS_KEY, RECURSION_PROTECT_KEY } from "./recursionProjectionAdapter";
import { DECISION_RAIL_LESSONS, DecisionRailTrace } from "./DecisionRailTrace";
import { PatternRuntimeSupplement } from "./PatternRuntimeSupplement";
import { bindLessonPatternCheckpoints } from "./patternCheckpointBindings";
import { CanonicalAssessmentPractice } from "./CanonicalAssessmentPractice";
import { CanonicalKnowledgeReference } from "./CanonicalLessonJourney";
import { Paper4LessonShell, type Paper4StageItem } from "./Paper4LessonShell";
import type { AssessmentItem, KnowledgeUnit, LearningLocale, Localized, PythonExpectedOutput, PythonFixture } from "./types";
import styles from "./LessonLearningPage.module.css";

function stageProgressKey(lessonSlug: string) { return `algocore.paper4.learner.${lessonSlug}.stage.v1`; }

const ui = {
  en: { precondition: "Precondition", output: "Output contract", invariant: "Invariant", rules: "Rules", before: "Before you code", mistake: "Mistake", consequence: "Consequence", repair: "Repair", boundary: "Ten-second boundary trace", final: "Final check", exit: "From-memory task", next: "Next step", continue: "Continue", restart: "Restart this lesson", navigation: "Lesson stages", outcomes: "By the end, you can" },
  vi: { precondition: "Tiền điều kiện", output: "Hợp đồng output", invariant: "Bất biến", rules: "Quy tắc", before: "Trước khi viết code", mistake: "Lỗi", consequence: "Hậu quả", repair: "Cách sửa", boundary: "Trace biên trong mười giây", final: "Tự kiểm cuối", exit: "Bài làm từ trí nhớ", next: "Bước tiếp theo", continue: "Tiếp tục", restart: "Học lại bài này", navigation: "Các chặng của bài học", outcomes: "Sau bài này, bạn có thể" },
} as const;

export type LearnerJourneyNavigation = Readonly<{ slug: string; title: Localized }> | null;

type ReasoningTraceStep = Readonly<{
  step?: number;
  code_focus?: readonly string[];
  prediction?: Localized;
  answer?: Localized;
}>;

function ReasoningTraceFallback({ projection, locale, onProgress }: Readonly<{
  projection: LearnerProjection;
  locale: LearningLocale;
  onProgress: (hasRecordedPrediction: boolean) => void;
}>) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const stage = projection.stages.trace;
  const candidate = stage.steps.find((item): item is ReasoningTraceStep => Boolean(item && typeof item === "object")) ?? {};
  const prompt = candidate.prediction ?? stage.student_question;
  const answer = candidate.answer ?? stage.invariant_check;
  const guide = (candidate.code_focus ?? []).map((line) => line.replace(/^\s*#\s?/, "").trim()).filter(Boolean);
  const labels = locale === "vi"
    ? { title: "Trace suy luận — không cần cài đặt Python", guide: "Các điểm cần xét", response: "Dự đoán của em", placeholder: "Viết quyết định tiếp theo và lý do…", reveal: "Ghi dự đoán và đối chiếu", recorded: "Đã ghi dự đoán. Hãy đối chiếu với quy tắc của bài.", answer: "Cách suy luận" }
    : { title: "Reasoning trace — no Python implementation required", guide: "Decision guide", response: "Your prediction", placeholder: "Write the next decision and your reason…", reveal: "Record prediction and compare", recorded: "Prediction recorded. Compare it with the lesson rule.", answer: "Reasoning" };

  return <section className={styles.reasoningTrace} data-reasoning-trace data-prediction-recorded={revealed ? "true" : "false"} aria-labelledby={`${inputId}-title`}>
    <header><h3 id={`${inputId}-title`}>{labels.title}</h3><p>{learnerText(stage.scenario.instruction, locale)}</p></header>
    {guide.length > 0 && <div className={styles.reasoningGuide}><strong>{labels.guide}</strong><ul>{guide.map((item) => <li key={item}>{item}</li>)}</ul></div>}
    <label htmlFor={inputId}>{labels.response}: {learnerText(prompt, locale)}</label>
    <textarea id={inputId} rows={4} value={draft} placeholder={labels.placeholder} onChange={(event) => { setDraft(event.currentTarget.value); setRevealed(false); }} />
    <button type="button" className={styles.learningButton} disabled={!draft.trim()} onClick={() => { setRevealed(true); onProgress(true); }}>{labels.reveal}</button>
    <p className={styles.statusText} role="status">{revealed ? labels.recorded : ""}</p>
    {revealed && <aside className={styles.invariantCard} data-answer-revealed="true"><strong>{labels.answer}</strong><p>{learnerText(answer, locale)}</p></aside>}
  </section>;
}

function stageFromHash() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#stage-/, "") as LearnerStageId;
  return LEARNER_STAGE_IDS.includes(hash) ? hash : null;
}

function StageContent({ stageId, lessonSlug, projection, locale, patterns, pythonArtifact, knowledgeUnits, assessmentItems, testFixtures, testExpectedOutputs, nextLesson, onTraceProgress, onPracticeProgress }: Readonly<{
  stageId: LearnerStageId;
  lessonSlug: string;
  projection: LearnerProjection;
  locale: LearningLocale;
  patterns: readonly PatternMetadata[];
  pythonArtifact: PythonArtifactDto;
  knowledgeUnits: readonly KnowledgeUnit[];
  assessmentItems: readonly AssessmentItem[];
  testFixtures: readonly PythonFixture[];
  testExpectedOutputs: readonly PythonExpectedOutput[];
  nextLesson: LearnerJourneyNavigation;
  onTraceProgress: (hasRecordedPrediction: boolean) => void;
  onPracticeProgress: (hasAttempt: boolean) => void;
}>) {
  const t = ui[locale];
  if (stageId === "recognise") {
    const stage = projection.stages.recognise;
    return <div className={styles.stageStack}>
      <p>{learnerText(stage.intro, locale)}</p>
      <blockquote className={styles.promptFragment}>{learnerText(stage.prompt_fragment, locale)}</blockquote>
      <ul>{stage.cues.map((cue, index) => <li key={index}>{learnerText(cue, locale)}</li>)}</ul>
      <dl className={styles.contractFacts}><div><dt>{t.precondition}</dt><dd>{learnerText(stage.precondition, locale)}</dd></div><div><dt>{t.output}</dt><dd>{learnerText(stage.output_contract, locale)}</dd></div></dl>
      <div><h3>{t.outcomes}</h3><ul>{projection.learner_outcomes.map((outcome, index) => <li key={index}>{learnerText(outcome, locale)}</li>)}</ul></div>
    </div>;
  }
  if (stageId === "understand") {
    if (lessonSlug === "stack" || lessonSlug === "queue" || lessonSlug === "linked-list" || lessonSlug === "recursion") {
      const stage = lessonSlug === "recursion" ? (projection as unknown as RecursionLearnerProjection).stages.understand : lessonSlug === "linked-list" ? (projection as unknown as LinkedListLearnerProjection).stages.understand : lessonSlug === "queue" ? (projection as unknown as QueueLearnerProjection).stages.understand : (projection as unknown as StackLearnerProjection).stages.understand;
      const caption = lessonSlug === "recursion" ? "Value-returning recursive Python" : lessonSlug === "linked-list" ? "Parallel-array live/free Python" : lessonSlug === "queue" ? "Circular queue Python" : "Current-top Python";
      return <div className={styles.stageStack}><p className={styles.mentalModel}>{learnerText(stage.mental_model,locale)}</p><div><h3>{t.rules}</h3><ol>{stage.rules.map((rule,index)=><li key={index}>{learnerText(rule,locale)}</li>)}</ol></div><aside className={styles.invariantCard}><strong>{t.invariant}</strong><p>{learnerText(stage.invariant,locale)}</p></aside><LearnerCodeCard caption={caption} lines={stage.python_recipe} locale={locale}/><p>{learnerText(stage.transfer_note, locale)}</p><CanonicalKnowledgeReference knowledgeUnits={knowledgeUnits} locale={locale} /></div>;
    }
    const stage = projection.stages.understand;
    return <div className={styles.stageStack}>
      <p className={styles.mentalModel}>{learnerText(stage.mental_model, locale)}</p>
      <div><h3>{t.rules}</h3><ol>{stage.rules.map((rule, index) => <li key={index}>{learnerText(rule, locale)}</li>)}</ol></div>
      <aside className={styles.invariantCard}><strong>{t.invariant}</strong><p>{learnerText(stage.invariant, locale)}</p></aside>
      <LearnerCodeCard caption={learnerText(stage.python_recipe.caption, locale)} lines={stage.python_recipe.lines} locale={locale} />
      <p>{learnerText(stage.python_recipe.contract_note, locale)}</p>
      {stage.recursive_extension && <details className={styles.optionalDisclosure}><summary>{learnerText(stage.recursive_extension.label, locale)}</summary><p>{learnerText(stage.recursive_extension.content, locale)}</p></details>}
      {stage.transfer_note && <details className={styles.optionalDisclosure}><summary>{learnerText(stage.transfer_note.label, locale)}</summary><p>{learnerText(stage.transfer_note.content, locale)}</p></details>}
      {stage.representation_contrast && <details className={styles.optionalDisclosure}><summary>{learnerText(stage.representation_contrast.prompt, locale)}</summary><p>{learnerText(stage.representation_contrast.answer, locale)}</p></details>}
      <CanonicalKnowledgeReference knowledgeUnits={knowledgeUnits} locale={locale} />
    </div>;
  }
  if (stageId === "trace") {
    const stage = projection.stages.trace;
    const patternContract = bindLessonPatternCheckpoints(lessonSlug, patterns, projection);
    const traceInstruction = lessonSlug === "performance" ? (projection as unknown as PerformanceLearnerProjection).stages.trace.scenario.metric : lessonSlug === "stack" ? (projection as unknown as StackLearnerProjection).stages.trace.student_question : lessonSlug === "queue" ? (projection as unknown as QueueLearnerProjection).stages.trace.student_question : lessonSlug === "linked-list" ? (projection as unknown as LinkedListLearnerProjection).stages.trace.student_question : lessonSlug === "recursion" ? (projection as unknown as RecursionLearnerProjection).stages.trace.student_question : stage.scenario.instruction;
    return <div className={styles.stageStack}>
      <div className={styles.traceIntro} data-trace-prompt><strong>{learnerText(stage.scenario.label, locale)}</strong><p>{learnerText(traceInstruction, locale)}</p></div>
      {lessonSlug === "data-models"
        ? <DataModelsVisualRuntime projection={projection as unknown as DataModelsLearnerProjection} patterns={patterns} pythonArtifact={pythonArtifact} locale={locale} onLearnerProgress={onTraceProgress} />
        : DECISION_RAIL_LESSONS.has(lessonSlug)
          ? <DecisionRailTrace lessonSlug={lessonSlug} projection={projection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "procedural-design"
          ? <ProceduralDesignTrace projection={projection as ProceduralDesignLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "validation-rules"
          ? <ValidationRulesTrace projection={projection as ValidationRulesLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "testing"
          ? <TestingEvidenceTable projection={projection as TestingLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "text-processing"
          ? <TextProcessingTrace projection={projection as TextProcessingLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "search-collections"
          ? <SearchCollectionsTrace projection={projection as SearchCollectionsLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "sorting"
          ? <SortingTrace projection={projection as SortingLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "performance"
          ? <PerformanceEvidenceTable projection={projection as unknown as PerformanceLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "stack"
          ? <StackTrace projection={projection as unknown as StackLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "queue"
          ? <QueueTrace projection={projection as unknown as QueueLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "linked-list"
          ? <LinkedListTrace projection={projection as unknown as LinkedListLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : lessonSlug === "recursion"
          ? <RecursionTrace projection={projection as unknown as RecursionLearnerProjection} locale={locale} onLearnerProgress={onTraceProgress} />
        : patterns.length === 0
          ? <ReasoningTraceFallback projection={projection} locale={locale} onProgress={onTraceProgress} />
          : <Paper4VisualRuntime patterns={patterns} pythonArtifact={pythonArtifact} initialPatternId={patterns[0]?.pattern_id} initialLocale={locale} locale={locale} autoplayDelayMs={1800} headingLevel={3} audience="learner" onLearnerProgress={(progress) => onTraceProgress(progress.hasRecordedPrediction)} />}
      <PatternRuntimeSupplement patterns={patternContract.runtimeSupplementPatterns} pythonArtifact={pythonArtifact} locale={locale} />
      <p className={styles.invariantCard}>{learnerText(stage.invariant_check, locale)}</p>
    </div>;
  }
  if (stageId === "practise") {
    const microPractice = lessonSlug === "recursion"
    ? <RecursionPractice stage={(projection as unknown as RecursionLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress}/>
    : lessonSlug === "linked-list"
    ? <LinkedListPractice stage={(projection as unknown as LinkedListLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress}/>
    : lessonSlug === "queue"
    ? <QueuePractice stage={(projection as unknown as QueueLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress}/>
    : lessonSlug === "stack"
    ? <StackPractice stage={(projection as unknown as StackLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress}/>
    : lessonSlug === "performance"
    ? <PerformancePractice stage={(projection as unknown as PerformanceLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress} />
    : lessonSlug === "sorting"
    ? <SortingPractice stage={(projection as SortingLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress} />
    : lessonSlug === "search-collections" ? <SearchCollectionsPractice stage={(projection as SearchCollectionsLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress} />
    : lessonSlug === "text-processing" ? <TextProcessingPractice stage={(projection as TextProcessingLearnerProjection).stages.practise} locale={locale} onAttemptChange={onPracticeProgress} />
    : <LearnerPractice stage={projection.stages.practise} locale={locale} progressKey={practiceProgressKey(lessonSlug)} onAttemptChange={onPracticeProgress} />;
    return <div className={styles.stageStack}>
      {microPractice}
      <CanonicalAssessmentPractice items={assessmentItems} locale={locale} lessonSlug={lessonSlug} pythonArtifact={pythonArtifact} fixtures={testFixtures} expectedOutputs={testExpectedOutputs} />
    </div>;
  }
  if (stageId === "protectMarks") {
    const stage = projection.stages.protectMarks;
    if (lessonSlug === "data-models" || lessonSlug === "procedural-design" || lessonSlug === "validation-rules" || lessonSlug === "testing" || lessonSlug === "text-processing" || lessonSlug === "search-collections" || lessonSlug === "sorting" || lessonSlug === "performance" || lessonSlug === "stack" || lessonSlug === "queue" || lessonSlug === "linked-list" || lessonSlug === "recursion") return <LearnerRiskChecks stage={stage} locale={locale} progressKey={lessonSlug === "procedural-design" ? PROCEDURAL_DESIGN_PROTECT_KEY : lessonSlug === "validation-rules" ? VALIDATION_RULES_PROTECT_KEY : lessonSlug === "testing" ? TESTING_PROTECT_KEY : lessonSlug === "text-processing" ? TEXT_PROCESSING_PROTECT_KEY : lessonSlug === "search-collections" ? SEARCH_COLLECTIONS_PROTECT_KEY : lessonSlug === "sorting" ? SORTING_PROTECT_KEY : lessonSlug === "performance" ? PERFORMANCE_PROTECT_KEY : lessonSlug === "stack" ? STACK_PROTECT_KEY : lessonSlug === "queue" ? QUEUE_PROTECT_KEY : lessonSlug === "linked-list" ? LINKED_LIST_PROTECT_KEY : lessonSlug === "recursion" ? RECURSION_PROTECT_KEY : undefined} />;
    return <div className={styles.stageStack}>
      <div><h3>{t.before}</h3><ul>{stage.before_code.map((item, index) => <li key={index}>{learnerText(item, locale)}</li>)}</ul></div>
      <LearnerCodeCard caption={learnerText(stage.core_code_caption, locale)} lines={stage.core_code} locale={locale} />
      <div className={styles.mistakeGrid}>{stage.mistakes.map((item, index) => <article className={styles.mistakeCard} key={index}>{item.applies_when && <strong className={styles.condition}>{learnerText(item.applies_when, locale)}</strong>}<dl><div><dt>{t.mistake}</dt><dd>{learnerText(item.mistake, locale)}</dd></div><div><dt>{t.consequence}</dt><dd>{learnerText(item.consequence, locale)}</dd></div><div><dt>{t.repair}</dt><dd>{learnerText(item.repair, locale)}</dd></div></dl></article>)}</div>
      <div><h3>{t.boundary}</h3><pre className={styles.boundaryTrace}><code>{stage.boundary_trace.map((line) => learnerText(line, locale)).join("\n")}</code></pre></div>
      <div><h3>{t.final}</h3><ul className={styles.checkList}>{stage.final_check.map((item, index) => <li key={index}>{learnerText(item, locale)}</li>)}</ul></div>
      <p className={styles.authorityNote}>{learnerText(stage.authority_note, locale)}</p>
    </div>;
  }
  const stage = projection.stages.recallAndContinue;
  const performanceStage = lessonSlug === "performance" ? (projection as unknown as PerformanceLearnerProjection).stages.recallAndContinue : null;
  const stackStage = lessonSlug === "stack" ? (projection as unknown as StackLearnerProjection).stages.recallAndContinue : null;
  const queueStage = lessonSlug === "queue" ? (projection as unknown as QueueLearnerProjection).stages.recallAndContinue : null;
  const linkedListStage = lessonSlug === "linked-list" ? (projection as unknown as LinkedListLearnerProjection).stages.recallAndContinue : null;
  const recursionStage = lessonSlug === "recursion" ? (projection as unknown as RecursionLearnerProjection).stages.recallAndContinue : null;
  const nextReason = recursionStage?.next_lesson ?? linkedListStage?.next_lesson ?? queueStage?.next_lesson ?? stackStage?.next_lesson ?? performanceStage?.next_lesson.reason ?? stage.next_step;
  return <div className={styles.stageStack}>
    <LearnerRecall stage={stage} locale={locale} progressKey={recallProgressKey(lessonSlug)} />
    <aside className={styles.invariantCard}><strong>{t.exit}</strong><p>{learnerText(stage.exit_task, locale)}</p></aside>
    <aside className={styles.nextStep}><strong>{t.next}</strong><p>{learnerText(nextReason, locale)}</p>{nextLesson && <Link href={`/paper-4/lessons/${nextLesson.slug}?lang=${locale}`}>{nextLesson.title[locale]} →</Link>}</aside>
  </div>;
}

export function SixStageLearnerJourney({ lessonSlug, projection, locale, patterns, pythonArtifact, knowledgeUnits, assessmentItems, testFixtures, testExpectedOutputs, nextLesson }: Readonly<{
  lessonSlug: string;
  projection: LearnerProjection;
  locale: LearningLocale;
  patterns: readonly PatternMetadata[];
  pythonArtifact: PythonArtifactDto;
  knowledgeUnits: readonly KnowledgeUnit[];
  assessmentItems: readonly AssessmentItem[];
  testFixtures: readonly PythonFixture[];
  testExpectedOutputs: readonly PythonExpectedOutput[];
  nextLesson: LearnerJourneyNavigation;
}>) {
  const [activeStage, setActiveStage] = useState<LearnerStageId>("recognise");
  const [stageRestored, setStageRestored] = useState(false);
  const [resetRevision, setResetRevision] = useState(0);
  const [traceReady, setTraceReady] = useState(false);
  const [practiceReady, setPracticeReady] = useState(false);
  const moveFocus = useRef(false);
  const skipNextStagePersist = useRef(false);
  const stageKey = stageProgressKey(lessonSlug);
  const activeIndex = LEARNER_STAGE_IDS.indexOf(activeStage);
  const names = useMemo(() => Object.fromEntries(LEARNER_STAGE_IDS.map((id) => [id, projection.stages[id].name])) as Record<LearnerStageId, Localized>, [projection]);

  useEffect(() => {
    let candidate = stageFromHash();
    if (!candidate) {
      try {
        const stored = window.sessionStorage.getItem(stageKey) as LearnerStageId | null;
        if (stored && LEARNER_STAGE_IDS.includes(stored)) candidate = stored;
      } catch { /* Storage can be unavailable. */ }
    }
    if (candidate) setActiveStage(candidate);
    setStageRestored(true);
  }, [stageKey]);

  useEffect(() => {
    if (!stageRestored) return;
    if (skipNextStagePersist.current) {
      skipNextStagePersist.current = false;
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#stage-${activeStage}`);
      return;
    }
    try { window.sessionStorage.setItem(stageKey, activeStage); } catch { /* Storage can be unavailable. */ }
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#stage-${activeStage}`);
  }, [activeStage, stageKey, stageRestored]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    requestAnimationFrame(() => document.getElementById(`stage-${activeStage}-title`)?.focus());
  }, [activeStage]);

  const selectStage = (stage: LearnerStageId) => {
    try { window.sessionStorage.setItem(stageKey, stage); } catch { /* Storage can be unavailable. */ }
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#stage-${stage}`);
    moveFocus.current = true;
    setActiveStage(stage);
  };
  const updateTraceProgress = useCallback((hasRecordedPrediction: boolean) => { if (hasRecordedPrediction) setTraceReady(true); }, []);
  const updatePracticeProgress = useCallback((hasAttempt: boolean) => setPracticeReady(hasAttempt), []);
  const restart = () => {
    try {
      window.sessionStorage.removeItem(stageKey);
      window.sessionStorage.removeItem(practiceProgressKey(lessonSlug));
      window.sessionStorage.removeItem(recallProgressKey(lessonSlug));
      if (lessonSlug === "data-models") window.sessionStorage.removeItem(DATA_MODELS_PROGRESS_KEY);
      else if (lessonSlug === "procedural-design") {
        window.sessionStorage.removeItem(PROCEDURAL_DESIGN_PROGRESS_KEY);
        window.sessionStorage.removeItem(PROCEDURAL_DESIGN_PROTECT_KEY);
      } else if (lessonSlug === "validation-rules") {
        window.sessionStorage.removeItem(VALIDATION_RULES_PROGRESS_KEY);
        window.sessionStorage.removeItem(VALIDATION_RULES_PROTECT_KEY);
      } else if (lessonSlug === "testing") {
        window.sessionStorage.removeItem(TESTING_PROGRESS_KEY);
        window.sessionStorage.removeItem(TESTING_PROTECT_KEY);
      } else if (lessonSlug === "text-processing") {
        window.sessionStorage.removeItem(TEXT_PROCESSING_PROGRESS_KEY);
        window.sessionStorage.removeItem(TEXT_PROCESSING_PROTECT_KEY);
      } else if (lessonSlug === "search-collections") {
        window.sessionStorage.removeItem(SEARCH_COLLECTIONS_PROGRESS_KEY);
        window.sessionStorage.removeItem(SEARCH_COLLECTIONS_PROTECT_KEY);
      } else if (lessonSlug === "sorting") {
        window.sessionStorage.removeItem(SORTING_PROGRESS_KEY);
        window.sessionStorage.removeItem(SORTING_PROTECT_KEY);
      } else if (lessonSlug === "performance") {
        window.sessionStorage.removeItem(PERFORMANCE_PROGRESS_KEY);
        window.sessionStorage.removeItem(PERFORMANCE_PROTECT_KEY);
      } else if (lessonSlug === "stack") {
        window.sessionStorage.removeItem(STACK_PROGRESS_KEY);
        window.sessionStorage.removeItem(STACK_PROTECT_KEY);
      } else if (lessonSlug === "queue") {
        window.sessionStorage.removeItem(QUEUE_PROGRESS_KEY);
        window.sessionStorage.removeItem(QUEUE_PROTECT_KEY);
      } else if (lessonSlug === "linked-list") {
        window.sessionStorage.removeItem(LINKED_LIST_PROGRESS_KEY);
        window.sessionStorage.removeItem(LINKED_LIST_PROTECT_KEY);
      } else if (lessonSlug === "recursion") {
        window.sessionStorage.removeItem(RECURSION_PROGRESS_KEY);
        window.sessionStorage.removeItem(RECURSION_PROTECT_KEY);
      } else window.sessionStorage.removeItem(BINARY_SEARCH_PROGRESS_KEY);
    } catch { /* Storage can be unavailable. */ }
    setResetRevision((value) => value + 1);
    setTraceReady(false);
    setPracticeReady(false);
    skipNextStagePersist.current = true;
    moveFocus.current = true;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#stage-recognise`);
    setActiveStage("recognise");
  };

  const stageItems: readonly Paper4StageItem[] = LEARNER_STAGE_IDS.map((stageId, index) => ({
    id: stageId,
    label: learnerText(names[stageId], locale),
    state: index < activeIndex ? "complete" : index === activeIndex ? "current" : "locked",
    disabled: index > activeIndex,
    onSelect: () => selectStage(stageId),
  }));

  return <Paper4LessonShell
    className={styles.learnerJourney}
    items={stageItems}
    journeyKind="bespoke"
    knowledgeUnitCount={knowledgeUnits.length}
    lessonSlug={lessonSlug}
    locale={locale}
  >
    {LEARNER_STAGE_IDS.map((stageId, index) => {
      const current = stageId === activeStage;
      const stage = projection.stages[stageId];
      return <section key={`${stageId}-${resetRevision}`} id={`stage-${stageId}`} data-learner-stage={stageMarker[stageId]} data-stage-state={index < activeIndex ? "complete" : current ? "current" : "locked"} hidden={!current} aria-hidden={current ? undefined : "true"} aria-labelledby={`stage-${stageId}-title`} className={styles.learnerStage}>
        <header className={styles.stageHeader} data-stage-header><span aria-hidden="true">{stage.order}</span><div><h2 id={`stage-${stageId}-title`} tabIndex={-1}>{learnerText(stage.name, locale)}</h2><p data-active-learning-question={current && stageId !== "trace" ? "true" : undefined}>{learnerText(stage.student_question, locale)}</p></div></header>
        {current && <div data-stage-content><StageContent stageId={stageId} lessonSlug={lessonSlug} projection={projection} locale={locale} patterns={patterns} pythonArtifact={pythonArtifact} knowledgeUnits={knowledgeUnits} assessmentItems={assessmentItems} testFixtures={testFixtures} testExpectedOutputs={testExpectedOutputs} nextLesson={nextLesson} onTraceProgress={updateTraceProgress} onPracticeProgress={updatePracticeProgress} /></div>}
        <div className={styles.stageActions}>
          {index < LEARNER_STAGE_IDS.length - 1 && <button type="button" className={styles.learningButton} data-exit-gate={stageId === "trace" ? "prediction" : stageId === "practise" ? "attempt" : "open"} disabled={(stageId === "trace" && !traceReady) || (stageId === "practise" && !practiceReady)} onClick={() => selectStage(LEARNER_STAGE_IDS[index + 1])}>{ui[locale].continue}: {learnerText(names[LEARNER_STAGE_IDS[index + 1]], locale)} →</button>}
          {index === LEARNER_STAGE_IDS.length - 1 && <button type="button" className={styles.secondaryButton} data-action="restart-lesson" onClick={restart}>{ui[locale].restart}</button>}
        </div>
      </section>;
    })}
  </Paper4LessonShell>;
}
