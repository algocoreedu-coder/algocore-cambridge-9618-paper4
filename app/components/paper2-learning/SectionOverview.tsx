import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Map, Target } from "lucide-react";
import { getSectionTopics, paper2Href, type Locale, type Section, type StudyMapCatalog } from "@/app/lib/paper2/catalog";
import {
  getPaper2PatternGuide,
  getPaper2SectionEnrichment,
  type Paper2PatternGuide,
  type Paper2SectionEnrichment,
} from "@/app/lib/paper2/section-enrichment";
import { Paper2LocaleBoundary } from "./Paper2LocaleBoundary";
import { CourseProgressSummary } from "./CourseProgressSummary";
import { Paper2VisualExplorer } from "./lessons/Paper2VisualExplorer";
import learnerVisualStyles from "./lessons/Paper2LearnerVisual.module.css";
import { paper2LessonStatus } from "@/app/lib/paper2/lesson-status";
import { isReviewedPaper2LessonReady } from "@/app/lib/paper2/delivery-readiness";
import { getPaper2VisualSelection } from "@/app/lib/paper2/server-visual-registry";
import type { Paper2VisualSelection } from "@/app/lib/paper2/visual-types";
import { learningModes, PreparationNote, SectionIcon, topicStatusLabel } from "./shared";
import styles from "./Paper2Learning.module.css";

function PatternGuide({ pattern, locale }: { readonly pattern: Paper2PatternGuide; readonly locale: Locale }) {
  return <section className={styles.patternGuide} aria-labelledby={`paper2-pattern-${pattern.id}`}>
    <header>
      <div><span className={styles.kicker}>{locale === "vi" ? "CÔNG THỨC NHẬN DIỆN" : "RECOGNITION RECIPE"}</span><h2 id={`paper2-pattern-${pattern.id}`}>{pattern.id} · {pattern.title[locale]}</h2></div>
      <div className={styles.patternOwnership}>
        <Link href={paper2Href(`/paper-2/topics/${pattern.owner.slug}#recognise`, locale)}>{locale === "vi" ? "Chủ sở hữu" : "Owner"}: {pattern.owner.topicId}</Link>
        {pattern.related.map((topic) => <Link key={topic.topicId} href={paper2Href(`/paper-2/topics/${topic.slug}#recognise`, locale)}>{locale === "vi" ? "Liên quan" : "Related"}: {topic.topicId}</Link>)}
      </div>
    </header>
    <p className={styles.sectionLead}>{pattern.summary[locale]}</p>
    <div className={styles.cueGrid}>
      <div><h3>{locale === "vi" ? "Dấu hiệu phù hợp" : "Positive cues"}</h3><ul>{pattern.positiveCues.map((cue, index) => <li key={index}>{cue[locale]}</li>)}</ul></div>
      <div><h3>{locale === "vi" ? "Dấu hiệu dễ nhầm" : "Misleading cues"}</h3><ul>{pattern.misleadingCues.map((cue, index) => <li key={index}>{cue[locale]}</li>)}</ul></div>
    </div>
    <div className={styles.answerProduct}><strong>{locale === "vi" ? "Sản phẩm cần trả lời" : "Required answer product"}</strong><p>{pattern.answerProduct[locale]}</p></div>
    <ol className={styles.patternRecipe}>{pattern.recipe.map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.action[locale]}</h3><p>{step.why[locale]}</p></div></li>)}</ol>
    <aside className={styles.nonExample} aria-label={locale === "vi" ? "Ví dụ chưa đạt và cách sửa" : "Non-example and repair"}>
      <h3>{locale === "vi" ? "Non-example: câu trả lời chưa đủ" : "Non-example: an incomplete answer"}</h3>
      <blockquote>{pattern.nonExample.answer[locale]}</blockquote>
      <p><strong>{locale === "vi" ? "Vấn đề: " : "Problem: "}</strong>{pattern.nonExample.problem[locale]}</p>
      <p><strong>{locale === "vi" ? "Cách sửa: " : "Repair: "}</strong>{pattern.nonExample.repair[locale]}</p>
    </aside>
    <div className={styles.patternPractice}><h3>{locale === "vi" ? "Luyện đúng công thức" : "Practise the recipe"}</h3><div>{pattern.practiceLinks.map((practice) => <Link key={practice.taskId} href={paper2Href(`/paper-2/topics/${practice.slug}#${practice.anchor}`, locale)}><span>{practice.taskId}</span>{practice.label[locale]}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div></div>
    <details className={styles.sourceLocators}><summary>{locale === "vi" ? "Nguồn tham khảo" : "Reference sources"}</summary><ul>{pattern.sourceLocators.map((source) => <li key={source.sourceId}><strong>{source.label}</strong><span>{source.locator}</span></li>)}</ul></details>
  </section>;
}

function SectionEnrichment({ content, locale, visualSelection }: { readonly content: Paper2SectionEnrichment; readonly locale: Locale; readonly visualSelection: Paper2VisualSelection | undefined }) {
  const patterns = content.patternIds.map(getPaper2PatternGuide).filter((pattern): pattern is Paper2PatternGuide => Boolean(pattern));
  return <>
    <section className={styles.sectionScenario} aria-labelledby="paper2-section-scenario-title">
      <div><span className={styles.kicker}>{content.scenario.label[locale]}</span><h2 id="paper2-section-scenario-title">{content.scenario.title[locale]}</h2><p>{content.scenario.context[locale]}</p></div>
      <blockquote><span>{locale === "vi" ? "CÂU HỎI LỚN" : "THE BIG QUESTION"}</span>{content.scenario.bigQuestion[locale]}</blockquote>
    </section>

    <section className={styles.sectionFoundations} aria-label={locale === "vi" ? "Kiến thức nền và thuật ngữ" : "Learning path and glossary"}>
      <div><span className={styles.kicker}>{locale === "vi" ? "VÌ SAO HỌC THEO THỨ TỰ NÀY?" : "WHY THIS LEARNING ORDER?"}</span><h2>{locale === "vi" ? "Kiến thức nên có" : "Useful prior knowledge"}</h2><ol>{content.prerequisiteGuidance.map((item) => <li key={item.topicId}><Link href={paper2Href(`/paper-2/topics/${item.slug}`, locale)}><span>{item.topicId}</span><strong>{item.title[locale]}</strong></Link><p>{item.reason[locale]}</p></li>)}</ol></div>
      <div><span className={styles.kicker}>{locale === "vi" ? "TỪ KHÓA" : "KEY LANGUAGE"}</span><h2>{locale === "vi" ? "Thuật ngữ" : "Glossary"}</h2><dl>{content.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning[locale]}</dd></div>)}</dl></div>
    </section>

    <section className={styles.sectionRoute} id={content.visual.anchorId} aria-labelledby={`paper2-section-${content.sectionId.replace(".", "-")}-visual-title`}>
      <div className={styles.blockHeading}><div><span className={styles.kicker}>S{content.sectionId} · {locale === "vi" ? "KHÁM PHÁ PHẦN" : "SECTION EXPLORER"}</span><h2 id={`paper2-section-${content.sectionId.replace(".", "-")}-visual-title`}>{content.visual.title[locale]}</h2></div></div>
      <p className={styles.sectionLead}>{content.visual.introduction[locale]}</p>
      <p className={styles.observationTask}><strong>{locale === "vi" ? "Dự đoán trước khi bấm: " : "Predict before moving on: "}</strong>{content.visual.task[locale]}</p>
      {visualSelection ? <div className={learnerVisualStyles.learnerVisual}><Paper2VisualExplorer selection={visualSelection} locale={locale} /></div> : <p role="status">{locale === "vi" ? "Visual này chưa sẵn sàng." : "This visual is not available."}</p>}
    </section>

    <section className={styles.topicRelationship} aria-labelledby="paper2-topic-relationship-title">
      <header><span className={styles.kicker}>{locale === "vi" ? "QUAN HỆ GIỮA CÁC CHỦ ĐỀ" : "TOPIC RELATIONSHIP"}</span><h2 id="paper2-topic-relationship-title">{content.topicRelationship.title[locale]}</h2><p>{content.topicRelationship.introduction[locale]}</p></header>
      <div>{content.topicRelationship.items.map((item, index) => <article key={item.topicId}><span>{item.topicId}</span><h3>{item.question[locale]}</h3><p>{item.result[locale]}</p><Link href={paper2Href(`/paper-2/topics/${item.slug}`, locale)}>{locale === "vi" ? "Mở chủ đề" : "Open topic"}<ArrowUpRight size={16} aria-hidden="true" /></Link>{index === 0 && <b aria-hidden="true">→</b>}</article>)}</div>
      <p className={styles.sectionConnection}>{content.topicRelationship.connection[locale]}</p>
    </section>

    <section className={styles.workedChapter} aria-labelledby="paper2-worked-chapter-title">
      <header><span className={styles.kicker}>{locale === "vi" ? "LỜI GIẢI MỞ NGAY" : "FULL WORKING VISIBLE"}</span><h2 id="paper2-worked-chapter-title">{content.workedChapter.title[locale]}</h2><p>{content.workedChapter.prompt[locale]}</p></header>
      <div className={styles.sectionTable} role="region" tabIndex={0} aria-label={content.workedChapter.fieldTable?.ariaLabel[locale] ?? (locale === "vi" ? "Bảng so sánh lời giải" : "Worked comparison table")}><table><thead><tr><th scope="col">{content.workedChapter.fieldTable?.firstColumn[locale] ?? (locale === "vi" ? "Thành phần / giá trị" : "Element / value")}</th><th scope="col">{content.workedChapter.fieldTable?.secondColumn[locale] ?? (locale === "vi" ? "Góc nhìn thứ nhất" : "First reasoning lens")}</th><th scope="col">{content.workedChapter.fieldTable?.thirdColumn[locale] ?? (locale === "vi" ? "Góc nhìn thứ hai" : "Second reasoning lens")}</th></tr></thead><tbody>{content.workedChapter.fields.map((field) => <tr key={field.field}><th scope="row"><code>{field.field}</code><span>{field.value}</span></th><td>{field.assignment[locale]}</td><td>{field.report[locale]}</td></tr>)}</tbody></table></div>
      <div className={styles.sectionTable} role="region" tabIndex={0} aria-label={content.workedChapter.moduleTable?.ariaLabel[locale] ?? (locale === "vi" ? "Bảng các bước và dữ liệu" : "Steps and data table")}><table><thead><tr><th scope="col">{content.workedChapter.moduleTable?.firstColumn[locale] ?? (locale === "vi" ? "Bước / trách nhiệm" : "Step / responsibility")}</th><th scope="col">{content.workedChapter.moduleTable?.inputColumn[locale] ?? (locale === "vi" ? "Dữ liệu vào" : "Input")}</th><th scope="col">{content.workedChapter.moduleTable?.outputColumn[locale] ?? (locale === "vi" ? "Dữ liệu ra" : "Output")}</th><th scope="col">{content.workedChapter.moduleTable?.boundaryColumn[locale] ?? (locale === "vi" ? "Giải thích" : "Reasoning")}</th></tr></thead><tbody>{content.workedChapter.modules.map((module) => <tr key={module.name}><th scope="row"><code>{module.name}</code></th><td><code>{module.input}</code></td><td><code>{module.output}</code></td><td>{module.boundary[locale]}</td></tr>)}</tbody></table></div>
      <div className={styles.fullAnswer}><strong>{locale === "vi" ? "Đáp án đầy đủ" : "Full answer"}</strong><p>{content.workedChapter.fullAnswer[locale]}</p><ul>{content.workedChapter.checks.map((check, index) => <li key={index}>{check[locale]}</li>)}</ul></div>
      <Link className={styles.nextStep} href={paper2Href(`/paper-2/topics/${content.workedChapter.nextStep.slug}#${content.workedChapter.nextStep.anchor}`, locale)}>{content.workedChapter.nextStep.label[locale]}<ArrowRight size={17} aria-hidden="true" /></Link>
    </section>

    {patterns.map((pattern) => <PatternGuide key={pattern.id} pattern={pattern} locale={locale} />)}
  </>;
}

export function SectionOverview({ catalog, section, locale }: { readonly catalog: StudyMapCatalog; readonly section: Section; readonly locale: Locale }) {
  const topics = getSectionTopics(catalog, section.id);
  const strand = catalog.strands.find(item => item.id === section.strandId);
  const index = catalog.sections.findIndex(item => item.id === section.id);
  const previous = catalog.sections[index - 1], next = catalog.sections[index + 1];
  const relationships = catalog.relationships.filter(item => item.fromSectionId === section.id || item.toSectionId === section.id);
  const enrichment = getPaper2SectionEnrichment(section.id);
  const enrichmentVisual = enrichment ? getPaper2VisualSelection([enrichment.visual.assetId]) : undefined;
  const progressLessons = paper2LessonStatus.lessons.filter(isReviewedPaper2LessonReady).flatMap((record) => {
    const topic = catalog.topics.find((entry) => entry.id === record.topicId);
    return topic ? [{ topicId: topic.id, slug: topic.slug, sectionId: topic.sectionId, version: record.version, title: topic.title[locale] }] : [];
  });
  return <div className={styles.page} lang={locale} data-paper2-section data-section-id={section.id}>
    <Paper2LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí trong khóa học" : "Breadcrumb"}><Link href={paper2Href(`/paper-2?section=${section.id}`, locale)}><Map size={16} aria-hidden="true" />{locale === "vi" ? "Bản đồ học tập" : "Study map"}</Link><span aria-hidden="true">/</span><span aria-current="page">{locale === "vi" ? "Phần" : "Section"} {section.id}</span></nav>
    <header className={styles.sectionHero}><div className={styles.sectionHeroSymbol}><SectionIcon id={section.id} size={36} /><span>{section.id}</span></div><div><div className={styles.eyebrow}>PAPER 2 <span aria-hidden="true">/</span> {strand?.title[locale]}</div><h1>{section.title[locale]}</h1><p>{section.summary[locale]}</p><div className={styles.courseFacts}><span><Target size={17} aria-hidden="true" />{section.objectives.length} {locale === "vi" ? "mục tiêu" : "objectives"}</span><span>{topics.length} {locale === "vi" ? "chủ đề" : "topics"}</span></div></div></header>
    <div className={styles.sectionQuestion}><span>{locale === "vi" ? "CÂU HỎI LỚN" : "THE BIG QUESTION"}</span><p>{section.question[locale]}</p></div>
    <section className={styles.objectivePanel} aria-labelledby="paper2-section-objectives"><div className={styles.blockHeading}><h2 id="paper2-section-objectives">{locale === "vi" ? "Bạn sẽ cần làm được gì?" : "What should you be able to do?"}</h2></div><ul className={styles.objectiveList}>{section.objectives.map((objective, objectiveIndex) => <li key={objectiveIndex}><span aria-hidden="true">{String(objectiveIndex + 1).padStart(2, "0")}</span><p>{objective[locale]}</p></li>)}</ul></section>
    <section className={styles.sectionRoute} aria-labelledby="paper2-concept-title">
      <div className={styles.blockHeading}>
        <div><span className={styles.kicker}>{locale === "vi" ? "TỪ TỔNG THỂ ĐẾN TỪNG CHỦ ĐỀ" : "FROM THE SECTION TO ITS TOPICS"}</span><h2 id="paper2-concept-title">{locale === "vi" ? "Khám phá từng chủ đề" : "Explore each topic"}</h2></div>
        <span>{topics.length} {locale === "vi" ? "chủ đề" : "topics"}</span>
      </div>
      <p className={styles.mapHint}>{locale === "vi" ? "Sơ đồ cho biết các chủ đề thuộc phần, cách học và trạng thái bài. Chọn một chủ đề để xem mục tiêu và kiến thức nên ôn trước." : "This map shows the topics in the section, their learning mode and lesson status. Choose one to see its objectives and suggested prior knowledge."}</p>
      <PreparationNote locale={locale} availableCount={topics.filter(topic => topic.status === "available").length} totalCount={topics.length} />
      <CourseProgressSummary lessons={progressLessons} locale={locale} sectionId={section.id} />
      <div className={styles.conceptMap}>
        <div className={styles.conceptRoot}><SectionIcon id={section.id} size={22} /><strong>{section.id} · {section.title[locale]}</strong><span>{locale === "vi" ? "gồm các chủ đề" : "contains these topics"}</span></div>
        <ul className={styles.conceptTopics}>{topics.map(topic => <li key={topic.id}><Link data-topic-id={topic.id} href={paper2Href(`/paper-2/topics/${topic.slug}`, locale)}><span className={styles.kicker}>{topic.id}</span><strong>{topic.title[locale]}</strong><span>{topic.summary[locale]}</span><small className={styles.conceptTopicMeta}>{learningModes[topic.learningMode][locale]}<span aria-hidden="true"> · </span>{topicStatusLabel(topic, locale)}</small><ArrowUpRight size={17} aria-hidden="true" /></Link></li>)}</ul>
      </div>
    </section>
    {enrichment && <SectionEnrichment content={enrichment} locale={locale} visualSelection={enrichmentVisual} />}
    {relationships.length > 0 && <section className={styles.relatedSections} aria-labelledby="paper2-connections-title"><div><span className={styles.kicker}>{locale === "vi" ? "HIỂU CÁC MỐI LIÊN HỆ" : "UNDERSTAND THE CONNECTIONS"}</span><h2 id="paper2-connections-title">{locale === "vi" ? "Phần này kết nối với đâu?" : "Where does this lead?"}</h2></div><div>{relationships.map((relation, relationIndex) => { const other = catalog.sections.find(item => item.id === (relation.fromSectionId === section.id ? relation.toSectionId : relation.fromSectionId)); if (!other) return null; return <Link className={styles.relatedSection} data-related-section={other.id} key={`${other.id}-${relationIndex}`} href={paper2Href(`/paper-2/sections/${other.id}`, locale)}><SectionIcon id={other.id} size={22} /><span><strong>{other.id} · {other.title[locale]}</strong><small>{relation.label[locale]}</small><small>{relation.kind === "foundation" ? (locale === "vi" ? "Kiến thức nền" : "Foundation") : (locale === "vi" ? "Liên hệ kiến thức" : "Connection")} · {relation.fromSectionId} → {relation.toSectionId}</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link>; })}</div></section>}
    <nav className={styles.pageNavigation} aria-label={locale === "vi" ? "Điều hướng phần" : "Section navigation"}><Link href={paper2Href(previous ? `/paper-2/sections/${previous.id}` : `/paper-2?section=${section.id}`, locale)}><ArrowLeft size={18} aria-hidden="true" /><span><small>{previous ? (locale === "vi" ? "Phần trước" : "Previous section") : (locale === "vi" ? "Bản đồ học tập" : "Study map")}</small>{previous ? `${previous.id} · ${previous.title[locale]}` : (locale === "vi" ? "Xem toàn khóa" : "Explore the course")}</span></Link>{next && <Link href={paper2Href(`/paper-2/sections/${next.id}`, locale)}><span><small>{locale === "vi" ? "Phần tiếp theo" : "Next section"}</small>{next.id} · {next.title[locale]}</span><ArrowRight size={18} aria-hidden="true" /></Link>}</nav>
  </div>;
}
