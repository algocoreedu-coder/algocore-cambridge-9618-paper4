import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import Link from "next/link";

import { Paper4VisualRuntime } from "@/app/components/paper4-visual";
import { PythonArtifact } from "./PythonArtifact";
import { LocaleBoundary, LocaleLink } from "./LocaleBoundary";
import { SourceReferences } from "./SourceReferences";
import type { LearningBlockKind, LearningLocale, LessonDto, Localized, SourceLocator } from "./types";
import styles from "./LessonLearningPage.module.css";

const sectionLabels: Readonly<Record<LearningBlockKind, Localized>> = {
  recognition: { vi: "Nhận diện dạng bài", en: "Recognise the question type" },
  "exam-cues": { vi: "Tín hiệu trong đề", en: "Signals in the prompt" },
  knowledge: { vi: "Kiến thức cần dùng", en: "Knowledge to activate" },
  method: { vi: "Phương pháp giải", en: "Solution method" },
  "worked-example": { vi: "Ví dụ có hướng dẫn", en: "Worked example" },
  "action-view": { vi: "Python và Action View", en: "Python and Action View" },
  "marking-pitfalls": { vi: "Tránh mất điểm", en: "Protect your marks" },
  practice: { vi: "Luyện tập tăng dần", en: "Progressive practice" },
  retrieval: { vi: "Gợi nhớ cách giải", en: "Retrieval practice" },
  "next-and-sources": { vi: "Bài tiếp theo và nguồn", en: "Next lesson and sources" },
};

const copy = {
  vi: {
    skip: "Bỏ qua đến nội dung bài học", course: "Cambridge 9618 · Paper 4 · Python · 2026", language: "Ngôn ngữ bài học",
    owned: "Dạng bài chính thức thuộc bài", support: "Liên kết biểu diễn hỗ trợ", noOfficial: "Các liên kết này là workflow/biểu diễn do AlgoCore biên soạn; không chuyển quyền sở hữu dạng bài hoặc điểm Cambridge.",
    pythonEvidence: "Bằng chứng chạy Python", fixtures: "Ca kiểm thử canonical", input: "Input", expected: "Expected output", sourceHash: "Mã băm source",
    marking: "Chuỗi chấm điểm", markAtoms: "Tiêu chí nguồn", detection: "Cách phát hiện lỗi", repair: "Cách sửa", misconception: "Lỗi dễ mất điểm",
    practiceAuthority: "Thẩm quyền rubric", expectedArtifact: "Sản phẩm cần nộp", hint: "Mở gợi ý", feedback: "Mở phản hồi và cách sửa", rubric: "Tiêu chí tự chấm",
    answer: "Mở đáp án", rationale: "Lý do", previous: "Bài trước", next: "Bài tiếp theo", noPrevious: "Đây là bài đầu tiên", noNext: "Đây là bài cuối cùng",
  },
  en: {
    skip: "Skip to lesson content", course: "Cambridge 9618 · Paper 4 · Python · 2026", language: "Lesson language",
    owned: "Official patterns owned by this lesson", support: "Approved representational support", noOfficial: "These links are AlgoCore-authored workflow or representation support; they do not transfer official pattern ownership or Cambridge marks.",
    pythonEvidence: "Python execution evidence", fixtures: "Canonical test cases", input: "Input", expected: "Expected output", sourceHash: "Source hash",
    marking: "Marking chain", markAtoms: "Source criteria", detection: "Error detection", repair: "Repair check", misconception: "Mark-losing pitfall",
    practiceAuthority: "Rubric authority", expectedArtifact: "Expected submission", hint: "Reveal hint", feedback: "Reveal feedback and repair", rubric: "Self-assessment criteria",
    answer: "Reveal answer", rationale: "Why", previous: "Previous lesson", next: "Next lesson", noPrevious: "This is the first lesson", noNext: "This is the final lesson",
  },
} as const;

export type LessonNavigationItem = Readonly<{ slug: string; title: Localized }>;

function JsonBlock({ value, label }: { readonly value: unknown; readonly label: string }) {
  return <figure className={styles.jsonFigure}><figcaption>{label}</figcaption><pre tabIndex={0}><code>{JSON.stringify(value, null, 2)}</code></pre></figure>;
}

function Tags({ values }: { readonly values: readonly string[] }) {
  return <ul className={styles.tags}>{values.map((value) => <li key={value}><code>{value}</code></li>)}</ul>;
}

function locatorText(locator: SourceLocator) {
  return [locator.heading, locator.bullet_locator, locator.pdf_page !== undefined ? `PDF p. ${locator.pdf_page}` : undefined, locator.anchor_text].filter(Boolean).join(" · ");
}

function Recognition({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  const t = copy[locale];
  return <div className={styles.stack}>
    <p>{lesson.theory.knowledge_units[0]?.explanation[locale]}</p>
    <div className={styles.authorityGrid}>
      <article><h3>{t.owned}</h3><Tags values={lesson.authority.official_pattern_ids} /></article>
      {lesson.authority.approved_association_pattern_ids.length > 0 && <article><h3>{t.support}</h3><Tags values={lesson.authority.approved_association_pattern_ids} /><p>{t.noOfficial}</p></article>}
    </div>
  </div>;
}

function ExamCues({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  return <div className={styles.cardGrid}>{lesson.theory.knowledge_units.map((unit) => <article className={styles.card} key={unit.knowledge_unit_id}><h3>{unit.title[locale]}</h3><ul>{unit.exam_signals.map((signal, index) => <li key={index}>{signal[locale]}</li>)}</ul></article>)}</div>;
}

function Knowledge({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  return <div className={styles.stack}>{lesson.theory.knowledge_units.map((unit) => <article className={styles.unit} key={unit.knowledge_unit_id}><h3>{unit.title[locale]}</h3><p>{unit.explanation[locale]}</p><p><strong>{locale === "vi" ? "Biểu diễn: " : "Representation: "}</strong>{unit.representation[locale]}</p><Tags values={[...unit.objective_refs.map((item) => item.objective_id), ...unit.book_refs.map((item) => item.section_id)]} /><small><code>{unit.knowledge_unit_id}</code></small></article>)}</div>;
}

function Method({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  return <ol className={styles.methodList}>{lesson.theory.knowledge_units.map((unit) => <li key={unit.knowledge_unit_id}><h3>{unit.title[locale]}</h3><p>{unit.python_connection[locale]}</p><aside><strong>{locale === "vi" ? "Quy tắc cần giữ" : "Invariant to protect"}</strong><p>{unit.invariant_or_rule[locale]}</p></aside></li>)}</ol>;
}

function WorkedExamples({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  return <div className={styles.cardGrid}>{lesson.theory.knowledge_units.map((unit) => <article className={styles.card} key={unit.knowledge_unit_id}><h3>{unit.title[locale]}</h3><p>{unit.micro_example.scenario[locale]}</p><p>{unit.micro_example.walkthrough[locale]}</p><Tags values={unit.micro_example.active_line_ids} /></article>)}</div>;
}

function Tests({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  const t = copy[locale];
  const expectedByFixture = new Map(lesson.tests.expected_outputs.map((item) => [item.fixture_ref, item]));
  return <section className={styles.tests} aria-labelledby="canonical-tests-title"><h3 id="canonical-tests-title">{t.fixtures}</h3><div className={styles.testGrid}>{lesson.tests.fixtures.map((fixture) => <article key={fixture.fixture_id}><header><strong>{fixture.case_kind}</strong><code>{fixture.fixture_id}</code></header><JsonBlock label={t.input} value={fixture.input} /><JsonBlock label={t.expected} value={expectedByFixture.get(fixture.fixture_id)?.value} /></article>)}</div><dl className={styles.evidence}><div><dt>{t.pythonEvidence}</dt><dd>{lesson.tests.author_run_ref}<br />{lesson.tests.independent_rerun_ref}</dd></div><div><dt>{t.sourceHash}</dt><dd><code>{lesson.python.code_sha256}</code></dd></div><div><dt>Execution log SHA-256</dt><dd><code>{lesson.tests.execution_log_sha256}</code></dd></div></dl></section>;
}

function ActionView({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  return <div className={styles.stack}>
    <PythonArtifact artifact={lesson.python} locale={locale} />
    <Tests lesson={lesson} locale={locale} />
    {lesson.visual.owned_patterns.length > 0
      ? <Paper4VisualRuntime patterns={lesson.visual.owned_patterns} initialPatternId={lesson.visual.owned_patterns[0]?.pattern_id} initialLocale={locale} autoplayDelayMs={1800} headingLevel={3} />
      : <aside className={styles.fallback} role="note"><strong>{copy[locale].support}</strong><p>{copy[locale].noOfficial}</p><Tags values={lesson.visual.approved_static_or_representational_support.map((item) => item.pattern_id)} /></aside>}
  </div>;
}

function MarkingAndErrors({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  const t = copy[locale];
  return <div className={styles.stack}>
    {lesson.marking.chains.length === 0 && <aside className={styles.fallback} role="note"><strong>{t.support}</strong><p>{t.noOfficial}</p></aside>}
    {lesson.marking.chains.map((chain) => <article className={styles.markingChain} key={chain.marking_chain_id}><header><h3>{t.marking}: {chain.pattern_id}</h3><code>{chain.requirement_ref}</code></header><Tags values={chain.method_step_refs} /><dl><div><dt>{t.detection}</dt><dd>{chain.detection_check[locale]}</dd></div><div><dt>{t.repair}</dt><dd>{chain.repair_check[locale]}</dd></div></dl><details><summary>{t.markAtoms} · {chain.marking_atoms.length}</summary><ol>{chain.marking_atoms.map((atom) => <li key={atom.atom_id}><p>{atom.criterion[locale]}</p><small>{atom.authority} · {locatorText(atom.locator)}</small></li>)}</ol></details></article>)}
    <section><h3>{t.misconception}</h3><Tags values={lesson.errors.error_refs} /><ul className={styles.pitfalls}>{lesson.errors.misconceptions.map((item, index) => <li key={`${item.knowledge_unit_id}-${index}`}>{item[locale]}</li>)}</ul></section>
  </div>;
}

function Practice({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  const t = copy[locale];
  const order = new Map([["guided", 0], ["faded", 1], ["independent", 2]]);
  const items = [...lesson.practice.items].sort((left, right) => (order.get(left.level) ?? 9) - (order.get(right.level) ?? 9));
  return <div className={styles.practiceGrid}>{items.map((item) => <article className={styles.practiceCard} key={item.assessment_item_id}><header><strong>{item.level}</strong><code>{item.assessment_item_id}</code></header><p>{item.prompt[locale]}</p><p><strong>{t.expectedArtifact}: </strong>{item.expected_artifact[locale]}</p><p><strong>{t.practiceAuthority}: </strong>{item.self_rubric.authority}{item.self_rubric.official_marks === null ? " · official_marks: null" : ` · ${item.self_rubric.official_marks}`}</p><details><summary>{t.hint}</summary><p>{item.hint[locale]}</p></details><details><summary>{t.feedback}</summary><p>{item.feedback[locale]}</p></details><details><summary>{t.rubric}</summary><ul>{item.self_rubric.criteria.map((criterion) => <li key={criterion.criterion_id}><p>{criterion.description[locale]}</p><small>{criterion.evidence_required}</small></li>)}</ul><p>{item.self_rubric.pass_rule[locale]}</p><p>{item.self_rubric.retry_rule[locale]}</p><JsonBlock label="Disclosure contract" value={item.disclosure_contract} /></details></article>)}</div>;
}

function Retrieval({ lesson, locale }: { readonly lesson: LessonDto; readonly locale: LearningLocale }) {
  const t = copy[locale];
  return <div className={styles.retrieval}>{lesson.retrieval.items.map((item) => <article key={item.knowledge_unit_id}><h3>{item.prompt[locale]}</h3><details><summary>{t.answer}</summary><p>{item.answer[locale]}</p><p><strong>{t.rationale}: </strong>{item.rationale[locale]}</p></details></article>)}</div>;
}

function LessonLink({ direction, item, locale }: { readonly direction: "previous" | "next"; readonly item: LessonNavigationItem | null; readonly locale: LearningLocale }) {
  const t = copy[locale];
  if (!item) return <span>{direction === "previous" ? t.noPrevious : t.noNext}</span>;
  return <Link rel={direction === "previous" ? "prev" : "next"} href={`/paper-4/lessons/${item.slug}?lang=${locale}`}>{direction === "previous" ? "← " : ""}{direction === "previous" ? t.previous : t.next}: {item.title[locale]}{direction === "next" ? " →" : ""}</Link>;
}

function sectionContent(kind: LearningBlockKind, lesson: LessonDto, locale: LearningLocale, previous: LessonNavigationItem | null, next: LessonNavigationItem | null) {
  switch (kind) {
    case "recognition": return <Recognition lesson={lesson} locale={locale} />;
    case "exam-cues": return <ExamCues lesson={lesson} locale={locale} />;
    case "knowledge": return <Knowledge lesson={lesson} locale={locale} />;
    case "method": return <Method lesson={lesson} locale={locale} />;
    case "worked-example": return <WorkedExamples lesson={lesson} locale={locale} />;
    case "action-view": return <ActionView lesson={lesson} locale={locale} />;
    case "marking-pitfalls": return <MarkingAndErrors lesson={lesson} locale={locale} />;
    case "practice": return <Practice lesson={lesson} locale={locale} />;
    case "retrieval": return <Retrieval lesson={lesson} locale={locale} />;
    case "next-and-sources": return <div className={styles.stack}><SourceReferences references={lesson.sources} locale={locale} /><nav className={styles.lessonNav} aria-label={locale === "vi" ? "Điều hướng bài học" : "Lesson navigation"}><LessonLink direction="previous" item={previous} locale={locale} /><LessonLink direction="next" item={next} locale={locale} /></nav></div>;
  }
}

export function LessonLearningPage({ lesson, locale, previousLesson, nextLesson }: { readonly lesson: LessonDto; readonly locale: LearningLocale; readonly previousLesson: LessonNavigationItem | null; readonly nextLesson: LessonNavigationItem | null }) {
  const t = copy[locale];
  const toc = lesson.sections.map((section) => ({ title: sectionLabels[section.kind][locale], url: `#${section.kind}`, depth: 2 }));
  return <>
    <LocaleBoundary locale={locale} />
    <DocsPage toc={toc} tableOfContent={{ style: "normal", single: false }} footer={{ enabled: false }} className={styles.page}>
      <a className={styles.skipLink} href="#recognition">{t.skip}</a>
      <header lang={locale}><div className={styles.eyebrow}><strong>LEARNING PAGE · V2</strong><span>{t.course}</span></div><DocsTitle>{lesson.identity.title[locale]}</DocsTitle><DocsDescription>{lesson.theory.knowledge_units[0]?.explanation[locale]}</DocsDescription><div className={styles.meta}><span>{lesson.identity.package_id} · {lesson.identity.version} · {lesson.authority.official_pattern_ids.length} patterns</span><nav className={styles.localeNav} aria-label={t.language}><LocaleLink slug={lesson.identity.slug} locale="vi" currentLocale={locale} /><LocaleLink slug={lesson.identity.slug} locale="en" currentLocale={locale} /></nav></div></header>
      <DocsBody id="lesson-content" lang={locale}>{lesson.sections.map((section) => <section key={section.section_id} id={section.kind} className={styles.section} aria-labelledby={`${section.kind}-title`} data-section-id={section.section_id} data-section-kind={section.kind}><header className={styles.sectionHeader}><span className={styles.sectionNumber} aria-hidden="true">{section.order}</span><h2 id={`${section.kind}-title`}>{sectionLabels[section.kind][locale]}</h2><p>{section.section_id}</p></header><div className={styles.content}>{sectionContent(section.kind, lesson, locale, previousLesson, nextLesson)}</div></section>)}</DocsBody>
    </DocsPage>
  </>;
}
