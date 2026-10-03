import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";

import binarySearchProjectionData from "@/app/data/paper4-v2/learner-projections/binary-search.json";
import dataModelsProjectionData from "@/app/data/paper4-v2/learner-projections/data-models.json";
import proceduralDesignProjectionData from "@/app/data/paper4-v2/learner-projections/procedural-design.json";
import validationRulesProjectionData from "@/app/data/paper4-v2/learner-projections/validation-rules.json";
import testingProjectionData from "@/app/data/paper4-v2/learner-projections/testing.json";
import textProcessingProjectionData from "@/app/data/paper4-v2/learner-projections/text-processing.json";
import searchCollectionsProjectionData from "@/app/data/paper4-v2/learner-projections/search-collections.json";
import sortingProjectionData from "@/app/data/paper4-v2/learner-projections/sorting.json";
import performanceProjectionData from "@/app/data/paper4-v2/learner-projections/performance.json";
import stackProjectionData from "@/app/data/paper4-v2/learner-projections/stack.json";
import queueProjectionData from "@/app/data/paper4-v2/learner-projections/queue.json";
import linkedListProjectionData from "@/app/data/paper4-v2/learner-projections/linked-list.json";
import recursionProjectionData from "@/app/data/paper4-v2/learner-projections/recursion.json";
import binaryTreeProjectionData from "@/app/data/paper4-v2/learner-projections/binary-tree.json";
import dictionaryProjectionData from "@/app/data/paper4-v2/learner-projections/dictionary.json";
import hashingProjectionData from "@/app/data/paper4-v2/learner-projections/hashing.json";
import oopModelProjectionData from "@/app/data/paper4-v2/learner-projections/oop-model.json";
import oopStateProjectionData from "@/app/data/paper4-v2/learner-projections/oop-state.json";
import oopInheritanceProjectionData from "@/app/data/paper4-v2/learner-projections/oop-inheritance.json";
import oopAggregationProjectionData from "@/app/data/paper4-v2/learner-projections/oop-aggregation.json";
import textFilesProjectionData from "@/app/data/paper4-v2/learner-projections/text-files.json";
import objectFilesProjectionData from "@/app/data/paper4-v2/learner-projections/object-files.json";
import randomFilesProjectionData from "@/app/data/paper4-v2/learner-projections/random-files.json";
import exceptionsProjectionData from "@/app/data/paper4-v2/learner-projections/exceptions.json";
import graphsProjectionData from "@/app/data/paper4-v2/learner-projections/graphs.json";
import examWorkflowProjectionData from "@/app/data/paper4-v2/learner-projections/exam-workflow.json";
import { getPaper4LessonReadiness } from "@/app/lib/paper4/readiness";
import { LocaleBoundary, LocaleLink } from "./LocaleBoundary";
import { assertLearnerProjectionSafe, assertLearnerTextSafe, learnerText, type DataModelsLearnerProjection, type LearnerProjection, type LinkedListLearnerProjection, type PerformanceLearnerProjection, type ProceduralDesignLearnerProjection, type QueueLearnerProjection, type RecursionLearnerProjection, type SearchCollectionsLearnerProjection, type SortingLearnerProjection, type StackLearnerProjection, type TestingLearnerProjection, type TextProcessingLearnerProjection, type ValidationRulesLearnerProjection } from "./learnerProjection";
import { assertLinkedListProjection } from "./linkedListProjectionAdapter";
import { assertRecursionProjection } from "./recursionProjectionAdapter";
import { CanonicalLessonJourney } from "./CanonicalLessonJourney";
import { SixStageLearnerJourney } from "./SixStageLearnerJourney";
import { SourceDisclosure } from "./SourceDisclosure";
import type { LearningLocale, LessonDto, Localized } from "./types";
import styles from "./LessonLearningPage.module.css";

const binarySearchProjection = binarySearchProjectionData as unknown as LearnerProjection;
const dataModelsProjection = dataModelsProjectionData as unknown as DataModelsLearnerProjection;
const proceduralDesignProjection = proceduralDesignProjectionData as unknown as ProceduralDesignLearnerProjection;
const validationRulesProjection = validationRulesProjectionData as unknown as ValidationRulesLearnerProjection;
const testingProjection = testingProjectionData as unknown as TestingLearnerProjection;
const textProcessingProjection = textProcessingProjectionData as unknown as TextProcessingLearnerProjection;
const searchCollectionsProjection = searchCollectionsProjectionData as unknown as SearchCollectionsLearnerProjection;
const sortingProjection = sortingProjectionData as unknown as SortingLearnerProjection;
const performanceProjection = performanceProjectionData as unknown as PerformanceLearnerProjection;
const stackProjection = stackProjectionData as unknown as StackLearnerProjection;
const queueProjection = queueProjectionData as unknown as QueueLearnerProjection;
const linkedListProjection = linkedListProjectionData as unknown as LinkedListLearnerProjection;
const recursionProjection = recursionProjectionData as unknown as RecursionLearnerProjection;
const binaryTreeProjection = binaryTreeProjectionData as unknown as LearnerProjection;
const dictionaryProjection = dictionaryProjectionData as unknown as LearnerProjection;
const hashingProjection = hashingProjectionData as unknown as LearnerProjection;
const oopModelProjection = oopModelProjectionData as unknown as LearnerProjection;
const oopStateProjection = oopStateProjectionData as unknown as LearnerProjection;
const oopInheritanceProjection = oopInheritanceProjectionData as unknown as LearnerProjection;
const oopAggregationProjection = oopAggregationProjectionData as unknown as LearnerProjection;
const textFilesProjection = textFilesProjectionData as unknown as LearnerProjection;
const objectFilesProjection = objectFilesProjectionData as unknown as LearnerProjection;
const randomFilesProjection = randomFilesProjectionData as unknown as LearnerProjection;
const exceptionsProjection = exceptionsProjectionData as unknown as LearnerProjection;
const graphsProjection = graphsProjectionData as unknown as LearnerProjection;
const examWorkflowProjection = examWorkflowProjectionData as unknown as LearnerProjection;
assertLearnerProjectionSafe(binarySearchProjection);
assertLearnerProjectionSafe(dataModelsProjection);
assertLearnerProjectionSafe(proceduralDesignProjection);
assertLearnerProjectionSafe(validationRulesProjection);
assertLearnerProjectionSafe(testingProjection);
assertLearnerProjectionSafe(textProcessingProjection);
assertLearnerProjectionSafe(searchCollectionsProjection);
assertLearnerProjectionSafe(sortingProjection);
assertLearnerProjectionSafe(performanceProjection as unknown as LearnerProjection);
assertLearnerProjectionSafe(stackProjection as unknown as LearnerProjection);
assertLearnerProjectionSafe(queueProjection as unknown as LearnerProjection);
assertLearnerProjectionSafe(linkedListProjection as unknown as LearnerProjection);
assertLinkedListProjection(linkedListProjection);
assertLearnerProjectionSafe(recursionProjection as unknown as LearnerProjection);
assertRecursionProjection(recursionProjection);
for (const projection of [binaryTreeProjection, dictionaryProjection, hashingProjection, oopModelProjection, oopStateProjection, oopInheritanceProjection, oopAggregationProjection, textFilesProjection, objectFilesProjection, randomFilesProjection, exceptionsProjection, graphsProjection, examWorkflowProjection]) {
  assertLearnerProjectionSafe(projection);
}

const learnerCandidates: Readonly<Record<string, LearnerProjection>> = {
  "binary-search": binarySearchProjection,
  "data-models": dataModelsProjection,
  "procedural-design": proceduralDesignProjection,
  "validation-rules": validationRulesProjection,
  "testing": testingProjection,
  "text-processing": textProcessingProjection,
  "search-collections": searchCollectionsProjection,
  "sorting": sortingProjection,
  "performance": performanceProjection as unknown as LearnerProjection,
  "stack": stackProjection as unknown as LearnerProjection,
  "queue": queueProjection as unknown as LearnerProjection,
  "linked-list": linkedListProjection as unknown as LearnerProjection,
  "recursion": recursionProjection as unknown as LearnerProjection,
  "binary-tree": binaryTreeProjection,
  "dictionary": dictionaryProjection,
  "hashing": hashingProjection,
  "oop-model": oopModelProjection,
  "oop-state": oopStateProjection,
  "oop-inheritance": oopInheritanceProjection,
  "oop-aggregation": oopAggregationProjection,
  "text-files": textFilesProjection,
  "object-files": objectFilesProjection,
  "random-files": randomFilesProjection,
  "exceptions": exceptionsProjection,
  "graphs": graphsProjection,
  "exam-workflow": examWorkflowProjection,
};
const copy = {
  vi: {
    course: "Cambridge 9618 · Paper 4 · Python · 2026",
    language: "Ngôn ngữ bài học",
  },
  en: {
    course: "Cambridge 9618 · Paper 4 · Python · 2026",
    language: "Lesson language",
  },
} as const;

function compactLessonPromise(text: string, maximumWords = 30) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maximumWords) return text.trim();
  return `${words.slice(0, maximumWords).join(" ").replace(/[,:;]$/, "")}…`;
}

export type LessonNavigationItem = Readonly<{ slug: string; title: Localized }>;

function LanguageNavigation({ slug, locale }: { readonly slug: string; readonly locale: LearningLocale }) {
  return <nav className={styles.localeNav} aria-label={copy[locale].language}><LocaleLink slug={slug} locale="vi" currentLocale={locale} /><LocaleLink slug={slug} locale="en" currentLocale={locale} /></nav>;
}

function CanonicalLessonPage({ lesson, locale, nextLesson }: { readonly lesson: LessonDto; readonly locale: LearningLocale; readonly nextLesson: LessonNavigationItem | null }) {
  const title = assertLearnerTextSafe(lesson.identity.title[locale]);
  const t = copy[locale];
  const description = compactLessonPromise(assertLearnerTextSafe(lesson.theory.knowledge_units[0]?.explanation[locale] ?? title));
  return <>
    <LocaleBoundary locale={locale} />
    <DocsPage full tableOfContent={{ enabled: false }} tableOfContentPopover={{ enabled: false }} footer={{ enabled: false }} className={styles.page} data-paper4-lesson={lesson.identity.slug} data-content-state="ready" data-locale={locale}>
      <div className={styles.lessonHeader} lang={locale} data-paper4-lesson={lesson.identity.slug} data-content-state="ready" data-locale={locale} data-release-state="canonical-dto-journey">
        <div className={styles.eyebrow}><strong>{t.course}</strong></div>
        <DocsTitle>{title}</DocsTitle>
        <DocsDescription>{description}</DocsDescription>
        <div className={styles.meta}><span>{locale === "vi" ? "Hành trình sáu chặng · Python" : "Six-stage journey · Python"}</span><LanguageNavigation slug={lesson.identity.slug} locale={locale} /></div>
      </div>
      <DocsBody id="lesson-content" lang={locale} tabIndex={-1}>
        <CanonicalLessonJourney lesson={lesson} locale={locale} nextLesson={nextLesson} />
        <SourceDisclosure knowledgeUnits={lesson.theory.knowledge_units} lessonSources={lesson.sources} locale={locale} />
      </DocsBody>
    </DocsPage>
  </>;
}

export function LessonLearningPage({ lesson, locale, nextLesson }: { readonly lesson: LessonDto; readonly locale: LearningLocale; readonly previousLesson: LessonNavigationItem | null; readonly nextLesson: LessonNavigationItem | null }) {
  const projection = learnerCandidates[lesson.identity.slug];
  if (!projection) return <CanonicalLessonPage lesson={lesson} locale={locale} nextLesson={nextLesson} />;

  const t = copy[locale];
  const readiness = getPaper4LessonReadiness(lesson.identity.slug);
  const releaseState = readiness.topicReady ? "topic-ready" : readiness.accessAllowed ? "topic-candidate" : "withheld";
  return <>
    <LocaleBoundary locale={locale} />
    <DocsPage full tableOfContent={{ enabled: false }} tableOfContentPopover={{ enabled: false }} footer={{ enabled: false }} className={styles.page} data-paper4-lesson={lesson.identity.slug} data-content-state="ready" data-locale={locale}>
      <div className={styles.lessonHeader} lang={locale} data-paper4-lesson={lesson.identity.slug} data-content-state="ready" data-locale={locale} data-release-state={releaseState}>
        <div className={styles.eyebrow}><strong>{learnerText(projection.exam_family, locale)}</strong><span>{t.course}</span></div>
        <DocsTitle>{learnerText(projection.lesson_title, locale)}</DocsTitle>
        <DocsDescription>{compactLessonPromise(learnerText(projection.learner_promise ?? projection.stages.recognise.intro, locale))}</DocsDescription>
        <div className={styles.meta}><span>{learnerText(projection.language_policy, locale)}</span><LanguageNavigation slug={lesson.identity.slug} locale={locale} /></div>
      </div>
      <DocsBody id="lesson-content" lang={locale} tabIndex={-1}>
        <SixStageLearnerJourney lessonSlug={lesson.identity.slug} projection={projection} locale={locale} patterns={lesson.visual.owned_patterns} pythonArtifact={lesson.python} knowledgeUnits={lesson.theory.knowledge_units} assessmentItems={lesson.practice.items} testFixtures={lesson.tests.fixtures} testExpectedOutputs={lesson.tests.expected_outputs} nextLesson={nextLesson} />
        <SourceDisclosure knowledgeUnits={lesson.theory.knowledge_units} lessonSources={lesson.sources} locale={locale} />
      </DocsBody>
    </DocsPage>
  </>;
}
