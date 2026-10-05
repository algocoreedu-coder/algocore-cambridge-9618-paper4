import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, Clock3, Eye, Goal, Lightbulb, Route } from "lucide-react";
import type { Locale, StudyMapCatalog } from "@/app/lib/paper3/catalog";
import type { Paper3Lesson, TheoryBlock } from "@/app/lib/paper3/lesson-types";
import { paper3Href } from "../shared";
import { Paper3LocaleBoundary } from "../Paper3LocaleBoundary";
import { LessonCheckpoints, RecallPrompt } from "./LessonCheckpoints";
import { VisualStage } from "./VisualStage";
import styles from "./LessonPage.module.css";

function TheorySection({ block, locale }: { readonly block: TheoryBlock; readonly locale: Locale }) {
  return <section className={styles.theoryBlock} id={block.id}><h3>{block.title[locale]}</h3>{block.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}{block.bullets && <ul>{block.bullets.map((bullet, index) => <li key={index}>{bullet[locale]}</li>)}</ul>}{block.code && <pre className={styles.code} tabIndex={0} role="region" aria-label={block.title[locale]}><code>{block.code}</code></pre>}{block.table && <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={block.title[locale]}><table><thead><tr>{block.table.headers.map((header, index) => <th key={index} scope="col">{header[locale]}</th>)}</tr></thead><tbody>{block.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell[locale]}</td>)}</tr>)}</tbody></table></div>}</section>;
}

export function TopicLesson({ lesson, catalog, locale }: { readonly lesson: Paper3Lesson; readonly catalog: StudyMapCatalog; readonly locale: Locale }) {
  const topic = catalog.topics.find((entry) => entry.id === lesson.topicId);
  const strand = catalog.strands.find((entry) => entry.id === topic?.strandId);
  const section = catalog.sections.find((entry) => entry.id === strand?.sectionId);
  const anchors = [{ id: "understand", en: "Understand", vi: "Hiểu khái niệm" }, { id: "observe", en: "Explore", vi: "Quan sát" }, { id: "worked-example", en: "Worked example", vi: "Ví dụ giải" }, { id: "recognise", en: "Recognise", vi: "Nhận diện" }, { id: "check", en: "Try it", vi: "Tự kiểm" }];
  return <article className={styles.lesson} lang={locale} data-paper3-lesson={lesson.topicId}>
    <Paper3LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí bài học" : "Breadcrumb"}><Link href={paper3Href("/paper-3", locale)}>{locale === "vi" ? "Bản đồ học" : "Study map"}</Link><span>/</span><Link href={paper3Href(`/paper-3/sections/${section?.id ?? "13"}`, locale)}>{section?.title[locale] ?? "Data representation"}</Link><span>/</span><span>{strand?.id}</span></nav>
    <header className={styles.header}><div className={styles.eyebrow}>PAPER 3 · {strand?.id} <span>ALGOCORE</span></div><h1>{lesson.title[locale]}</h1>{lesson.estimatedMinutes && <div className={styles.lessonMeta}><Clock3 size={17} aria-hidden="true" /><span>{locale === "vi" ? `Thời gian học dự kiến: ${lesson.estimatedMinutes} phút` : `Estimated learning time: ${lesson.estimatedMinutes} minutes`}</span></div>}<p className={styles.centralQuestion}>{lesson.question[locale]}</p><p>{lesson.opening[locale]}</p></header>
    <nav className={styles.lessonNav} aria-label={locale === "vi" ? "Trong bài học" : "In this lesson"}>{anchors.map((anchor, index) => <a href={`#${anchor.id}`} key={anchor.id}><span>{index + 1}</span>{anchor[locale]}</a>)}</nav>
    <div className={styles.objectiveGrid}><section><h2><Goal size={21} aria-hidden="true" />{locale === "vi" ? "Sau bài này, bạn có thể" : "By the end, you can"}</h2><ul>{lesson.objectives.map((objective, index) => <li key={index}>{objective[locale]}</li>)}</ul></section><section><h2><Route size={21} aria-hidden="true" />{locale === "vi" ? "Kiến thức cần dùng" : "Bring these ideas with you"}</h2><ul>{lesson.prerequisites.map((prerequisite, index) => <li key={index}>{prerequisite[locale]}</li>)}</ul></section></div>
    <section className={styles.chapter} id="understand" aria-labelledby="understand-title"><div className={styles.sectionHeading}><span>01</span><h2 id="understand-title">{locale === "vi" ? "Hiểu khái niệm" : "Understand the idea"}</h2></div>{lesson.theory.slice(0, 1).map((block) => <TheorySection block={block} locale={locale} key={block.id} />)}</section>
    <section className={styles.chapter} id="observe" aria-labelledby="observe-title"><div className={styles.sectionHeading}><span><Eye size={20} aria-hidden="true" /></span><h2 id="observe-title">{lesson.visual.title[locale]}</h2></div><p className={styles.sectionIntro}>{lesson.visual.introduction[locale]}</p><VisualStage key={lesson.topicId} lesson={lesson} locale={locale} /></section>
    {lesson.theory.length > 1 && <section className={styles.chapter} aria-label={locale === "vi" ? "Giải thích sâu hơn" : "A closer explanation"}>{lesson.theory.slice(1).map((block) => <TheorySection block={block} locale={locale} key={block.id} />)}</section>}
    <section className={styles.chapter} id="worked-example" aria-labelledby="worked-title"><div className={styles.sectionHeading}><span>03</span><h2 id="worked-title">{lesson.workedExample.title[locale]}</h2></div><div className={styles.examplePrompt}><span>{locale === "vi" ? "VÍ DỤ DO ALGOCORE BIÊN SOẠN" : "ALGOCORE WORKED EXAMPLE"}</span><p>{lesson.workedExample.prompt[locale]}</p></div><ol className={styles.workedSteps}>{lesson.workedExample.steps.map((step, index) => <li key={step.id} data-worked-step={step.id}><span className={styles.stepNumber}>{index + 1}</span><div><h3>{step.action[locale]}</h3><p><strong>{locale === "vi" ? "Vì sao: " : "Why: "}</strong>{step.why[locale]}</p><p className={styles.stepResult}>{step.result[locale]}</p>{step.code && <pre className={styles.code} tabIndex={0} role="region" aria-label={step.action[locale]}><code>{step.code}</code></pre>}{step.check && <p className={styles.stepCheck}>{locale === "vi" ? "Tự kiểm: " : "Check: "}{step.check[locale]}</p>}</div></li>)}</ol><div className={styles.exampleResult}><strong>{lesson.workedExample.result[locale]}</strong><p>{lesson.workedExample.selfCheck[locale]}</p></div></section>
    <section className={styles.chapter} id="recognise" aria-labelledby="recognise-title">
      <div className={styles.sectionHeading}><span>04</span><h2 id="recognise-title">{locale === "vi" ? "Nhận diện và chọn phương pháp" : "Recognise the task and choose a method"}</h2></div>
      <div className={styles.recognitionGrid}>
        <div><h3>{locale === "vi" ? "Đọc dữ kiện và yêu cầu" : "Read the clues and the required output"}</h3><ul>{lesson.recognition.cues.map((cue, index) => <li key={index}>{cue[locale]}</li>)}</ul></div>
        <div><h3>{locale === "vi" ? "Cách tiếp cận" : "Your approach"}</h3><ol>{lesson.recognition.method.map((method, index) => <li key={index}>{method[locale]}</li>)}</ol></div>
      </div>
      {lesson.recognition.commandWords?.length ? <div className={styles.recognitionGrid} data-command-words>
        <div>
          <h3>{locale === "vi" ? "Command words Cambridge" : "Cambridge command words"}</h3>
          <ul>{lesson.recognition.commandWords.map(item => <li key={item.command}><strong>{item.command}</strong>: {item.guidance[locale]}</li>)}</ul>
        </div>
      </div> : null}
      <div className={styles.distinguish}><Lightbulb size={22} aria-hidden="true" /><p>{lesson.recognition.distinguish[locale]}</p></div>
      <div className={styles.misconceptions}>{lesson.misconceptions.map((item, index) => <div key={index}><h3>{item.mistake[locale]}</h3><p>{item.correction[locale]}</p>{item.selfCheck ? <p className={styles.stepCheck}><strong>{locale === "vi" ? "Tự kiểm: " : "Self-check: "}</strong>{item.selfCheck[locale]}</p> : null}</div>)}</div>
    </section>
    <section className={styles.chapter} id="check" aria-labelledby="check-title"><div className={styles.sectionHeading}><span>05</span><h2 id="check-title">{locale === "vi" ? "Tự kiểm tra hiểu" : "Check your understanding"}</h2></div><p className={styles.sectionIntro}>{locale === "vi" ? "Câu hỏi do AlgoCore biên soạn. Chọn câu trả lời, đọc phản hồi và sửa cách suy luận nếu cần." : "AlgoCore practice. Choose an answer, read the feedback and revisit your reasoning where needed."}</p><LessonCheckpoints key={lesson.topicId} checkpoints={lesson.checkpoints} locale={locale} /></section>
    <section className={styles.chapter} id="recall" aria-labelledby="recall-title"><div className={styles.sectionHeading}><span><BookOpen size={20} aria-hidden="true" /></span><h2 id="recall-title">{locale === "vi" ? "Gợi nhớ và chốt kiến thức" : "Recall and connect the ideas"}</h2></div><RecallPrompt key={lesson.topicId} prompt={lesson.recall.prompt} answerPoints={lesson.recall.answerPoints} locale={locale} /><ul className={styles.takeaways}>{lesson.takeaways.map((takeaway, index) => <li key={index}>{takeaway[locale]}</li>)}</ul></section>
    <section className={styles.glossary} aria-labelledby="glossary-title"><h2 id="glossary-title">{locale === "vi" ? "Thuật ngữ trong bài" : "Terms in this lesson"}</h2><dl>{lesson.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning[locale]}</dd></div>)}</dl></section>
    <nav className={styles.related} aria-label={locale === "vi" ? "Topic liên quan" : "Related topics"}><Link className={styles.backLink} href={paper3Href(`/paper-3/sections/${section?.id ?? "13"}`, locale)}><ArrowLeft size={18} aria-hidden="true" />{locale === "vi" ? `Về Chapter ${section?.id ?? "13"}` : `Back to Chapter ${section?.id ?? "13"}`}</Link>{lesson.relatedSlugs.map((slug) => { const related = catalog.topics.find((entry) => entry.slug === slug); return related ? <Link key={slug} href={paper3Href(`/paper-3/topics/${slug}`, locale)}>{related.title[locale]}<ArrowUpRight size={17} aria-hidden="true" /></Link> : null; })}</nav>
    <details className={styles.sources} data-teacher-sources>
      <summary>
        <span>{locale === "vi" ? "Tài liệu giáo viên (tùy chọn)" : "Teacher references (optional)"}</span>
      </summary>
      <div className={styles.sourcePanel}>
        <ul>{lesson.sources.map((source) => <li key={source.id}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={14} aria-hidden="true" /></a> : <strong>{source.title}</strong>}<span>{source.locator}</span></li>)}</ul>
      </div>
    </details>
  </article>;
}


