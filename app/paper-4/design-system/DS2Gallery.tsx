"use client";

import { useState } from "react";

import {
  Button,
  Callout,
  Card,
  ChoiceGroup,
  CodePanel,
  Disclosure,
  Feedback,
  Field,
  IconButton,
  LanguageSwitch,
  LessonShell,
  LessonStepper,
  Progress,
  SegmentedControl,
  Select,
  StageNavigation,
  StateVisual,
  Textarea,
} from "@/app/components/algocore-ui";
import styles from "./DS2Gallery.module.css";

const copy = {
  en: {
    eyebrow: "Internal component gallery · DS2",
    title: "AlgoCore learner interface contracts",
    description: "Shared controls and teaching surfaces for Paper 4. English is canonical; Vietnamese demonstrates long-label resilience and equivalent structure.",
    locale: "Gallery language",
    controls: "Controls and response states",
    controlsNote: "Actions remain at least 44 px, expose disabled/loading state and never rely on colour alone.",
    surfaces: "Teaching surfaces",
    surfacesNote: "Cards reveal hierarchy. Code and state views accept typed learner data rather than raw trace objects.",
    journey: "Journey, progress and shell",
    journeyNote: "Navigation names the current location and keeps one primary next action.",
    field: "Student name",
    fieldDescription: "Use the name shown on the task sheet.",
    select: "Question type",
    answer: "Your trace explanation",
    choice: "Which value is checked next?",
    next: "Continue to trace",
    previous: "Back to method",
  },
  vi: {
    eyebrow: "Thư viện component nội bộ · DS2",
    title: "Hợp đồng giao diện học tập AlgoCore",
    description: "Các control và bề mặt giảng dạy dùng chung cho Paper 4. Tiếng Anh là bản chuẩn; tiếng Việt kiểm tra nhãn dài và cấu trúc tương đương.",
    locale: "Ngôn ngữ thư viện component",
    controls: "Control và trạng thái phản hồi",
    controlsNote: "Thao tác luôn cao ít nhất 44 px, thể hiện disabled/loading và không chỉ dùng màu để truyền đạt trạng thái.",
    surfaces: "Bề mặt giảng dạy",
    surfacesNote: "Card thể hiện thứ bậc rõ. Code và state view chỉ nhận dữ liệu học tập có kiểu, không nhận raw trace object.",
    journey: "Hành trình, tiến độ và khung bài học",
    journeyNote: "Điều hướng cho biết vị trí hiện tại và duy trì một hành động tiếp theo chính.",
    field: "Họ và tên học viên",
    fieldDescription: "Dùng đúng tên xuất hiện trên phiếu bài tập thực hành.",
    select: "Dạng câu hỏi trong đề thi",
    answer: "Giải thích trace của bạn trước khi xem hướng dẫn",
    choice: "Giá trị nào sẽ được kiểm tra tiếp theo?",
    next: "Tiếp tục sang bước trace",
    previous: "Quay lại phương pháp giải",
  },
} as const;

export function DS2Gallery({ initialLocale }: Readonly<{ initialLocale: "en" | "vi" }>) {
  const [locale, setLocale] = useState(initialLocale);
  const [choice, setChoice] = useState("middle");
  const [mode, setMode] = useState("normal");
  const t = copy[locale];

  return <LessonShell title={t.title} description={t.description} eyebrow={t.eyebrow} width="visual" actions={<div className={styles.row}><LanguageSwitch label={t.locale} locale={locale} options={[{ locale: "en", label: "English", href: "/paper-4/design-system?lang=en" }, { locale: "vi", label: "Tiếng Việt", href: "/paper-4/design-system?lang=vi" }]} /><SegmentedControl label={t.locale} value={locale} onChange={(value) => setLocale(value as "en" | "vi")} segments={[{ id: "en", label: "English" }, { id: "vi", label: "Tiếng Việt" }]} /></div>}>
    <div className={styles.gallery} data-ds2-gallery data-gallery-locale={locale}>
      <section className={styles.section} data-ds2-family="controls"><header><h2>{t.controls}</h2><p>{t.controlsNote}</p></header>
        <div className={styles.surface}><h3>Button / IconButton</h3><div className={styles.row}><Button>Check answer</Button><Button variant="secondary">Show hint</Button><Button variant="quiet">Skip for now</Button><Button variant="danger">Reset attempt</Button><Button loading loadingLabel="Checking answer">Check answer</Button><Button disabled>Locked</Button><IconButton label="Reset trace" icon="↻" /></div></div>
        <div className={styles.grid}><div className={styles.surface}><h3>Field / Select / Textarea</h3><div className={styles.stack}><Field id="gallery-name" label={t.field} description={t.fieldDescription} defaultValue="An" /><Select id="gallery-question" label={t.select} defaultValue="search"><option value="search">Binary search</option><option value="sort">Insertion sort</option></Select><Textarea id="gallery-answer" label={t.answer} rows={3} defaultValue="The middle value is compared first." /><Field id="gallery-error" label="Record index" error="Enter an index from 0 to 4." aria-invalid="true" defaultValue="6" /></div></div>
          <div className={styles.surface}><h3>ChoiceGroup / Feedback</h3><ChoiceGroup legend={t.choice} name="gallery-choice" value={choice} onChange={setChoice} choices={[{ id: "low", label: "low" }, { id: "middle", label: "middle", description: "Compare this value with the target." }, { id: "high", label: "high" }]} /><div className={styles.stack}><Feedback status="success" title="Correct">The middle value is checked first.</Feedback><Feedback status="retry" title="Try once more">Use the current low and high positions.</Feedback><Feedback status="incorrect" title="That would lose the search invariant">Keep the selected half sorted and bounded.</Feedback><Feedback status="complete" title="Stage complete" /></div></div></div>
      </section>

      <section className={styles.section} data-ds2-family="surfaces"><header><h2>{t.surfaces}</h2><p>{t.surfacesNote}</p></header>
        <div className={styles.grid}><Card title="Recognise the task" variant="lesson"><p>Look for a sorted array and a target value.</p></Card><Card title="Pause and predict" variant="question"><p>Choose the half that remains possible.</p></Card><Card title="Exam tip" variant="exam-tip"><p>Update one boundary past the middle index.</p></Card><Card title="Common mistake" variant="warning"><p>Keeping the middle index can repeat forever.</p></Card></div>
        <div className={styles.grid}><Callout title="Hint"><p>Compare the target with the middle value.</p></Callout><Callout title="Correct state" variant="success"><p>The candidate window is smaller and still sorted.</p></Callout><Callout title="Boundary warning" variant="warning"><p>Check the final one-item window.</p></Callout><Callout title="Trace mismatch" variant="error"><p>Recheck the boundary update before continuing.</p></Callout></div>
        <div className={styles.grid}><CodePanel title="Python recipe" caption="Lines 3–5 are active" lines={[{ number: 1, text: "low = 0" }, { number: 2, text: "high = len(values) - 1" }, { number: 3, text: "while low <= high:", active: true }, { number: 4, text: "    middle = (low + high) // 2", active: true }, { number: 5, text: "    if values[middle] == target:", active: true }, { number: 6, text: "        return middle" }]} /><StateVisual title="Current search state" facts={[{ label: "low", value: 0 }, { label: "middle", value: 3, changed: true }, { label: "high", value: 6 }, { label: "target", value: 42 }]} /></div>
        <Disclosure summary="Show one optional hint"><p>Write the current low, middle and high values before updating a boundary.</p></Disclosure>
      </section>

      <section className={styles.section} data-ds2-family="journey"><header><h2>{t.journey}</h2><p>{t.journeyNote}</p></header>
        <LessonStepper label="Lesson stages" steps={[{ id: "recognise", label: "Recognise", state: "complete" }, { id: "understand", label: "Understand", state: "complete" }, { id: "trace", label: "Trace", state: "current" }, { id: "practise", label: "Practise", state: "locked" }, { id: "marks", label: "Protect marks", state: "locked" }, { id: "recall", label: "Recall", state: "locked" }]} />
        <Progress label="Trace progress" value={2} max={5} detail="Step 2 of 5" />
        <div className={styles.row}><SegmentedControl label="Scenario" value={mode} onChange={setMode} segments={[{ id: "normal", label: "Normal" }, { id: "boundary", label: "Boundary" }, { id: "failure", label: "Failure" }]} /></div>
        <StageNavigation label="Lesson navigation" previousLabel={t.previous} nextLabel={t.next} />
      </section>
    </div>
  </LessonShell>;
}
