"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { Button, CodePanel, Select, StateVisual } from "@/app/components/algocore-ui";
import type { LocalizedText, PatternMetadata, PythonArtifactDto } from "@/app/components/paper4-visual/types";

import styles from "./PatternRuntimeSupplement.module.css";
import { EXAM_CODE_BY_PATTERN, type ExamPattern } from "./examCodeCatalog";
import type { LearningLocale } from "./types";

const copy = {
  en: {
    title: "Additional exam patterns",
    help: "Study the short function for this question type. The verification harness runs behind the lesson and is not code you need to reproduce in the exam.",
    choose: "Question pattern",
    code: "Exam-ready Python pattern",
    adapt: "Adapt parameter names, field names and the result contract to the wording of the question.",
    trace: "Worked trace",
    step: "Step",
    of: "of",
    previous: "Previous",
    next: "Next",
    rule: "Rule to remember",
  },
  vi: {
    title: "Các dạng code bổ sung cho bài thi",
    help: "Học function ngắn dành cho từng dạng câu hỏi. Bộ harness kiểm chứng chạy phía sau bài học và không phải phần code em cần chép vào bài thi.",
    choose: "Dạng câu hỏi",
    code: "Mẫu Python dùng cho bài thi",
    adapt: "Hãy đổi tên tham số, tên trường và hợp đồng kết quả theo đúng yêu cầu của đề.",
    trace: "Trace ví dụ",
    step: "Bước",
    of: "trên",
    previous: "Trước",
    next: "Tiếp",
    rule: "Quy tắc cần nhớ",
  },
} as const;

/* The catalog is kept separate from this UI so Teacher review can validate code
   without inspecting rendering logic. The verified artifact remains available to
   execution and audit surfaces; learner supplements never render it. */
function learnerCatalogFor(patterns: readonly PatternMetadata[]) {
  return patterns.map((pattern) => EXAM_CODE_BY_PATTERN.get(pattern.pattern_id)).filter((item): item is ExamPattern => Boolean(item));
}

function local(value: LocalizedText | number, locale: LearningLocale) {
  return typeof value === "number" ? value : value[locale];
}

function ExamPatternSupplement({ patterns, locale, catalog, surfaceId }: Readonly<{
  patterns: readonly PatternMetadata[];
  locale: LearningLocale;
  catalog: readonly ExamPattern[];
  surfaceId: string;
}>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const labelId = useId();
  const available = useMemo(() => patterns.map((pattern) => catalog.find((item) => item.patternId === pattern.pattern_id)).filter((item): item is ExamPattern => Boolean(item)), [catalog, patterns]);
  const selected = available[Math.min(selectedIndex, available.length - 1)];
  const t = copy[locale];

  useEffect(() => { setSelectedIndex(0); setStepIndex(0); }, [patterns]);
  useEffect(() => setStepIndex(0), [selectedIndex]);
  if (!selected) return null;
  const step = selected.steps[Math.min(stepIndex, selected.steps.length - 1)];

  return <section className={styles.examSupplement} data-exam-code-supplement={surfaceId} aria-labelledby={labelId}>
    <header className={styles.intro}><h3 id={labelId}>{t.title}</h3><p>{t.help}</p></header>
    <Select id={`${labelId}-pattern`} label={t.choose} value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.currentTarget.value))}>
      {available.map((item, index) => <option key={item.patternId} value={index}>{item.title[locale]}</option>)}
    </Select>
    <div className={styles.examGrid}>
      <div data-exam-code-panel>
        <CodePanel title={t.code} caption={selected.caption[locale]} label={`${t.code}: ${selected.title[locale]}`} lines={selected.code.map((text, index) => ({ number: index + 1, text, active: step.active.includes(index + 1) }))} />
        <p className={styles.adaptNote}>{t.adapt}</p>
      </div>
      <article className={styles.traceCard} data-exam-trace-step={stepIndex + 1}>
        <header><span>{t.step} {stepIndex + 1} {t.of} {selected.steps.length}</span><h4>{t.trace}</h4></header>
        <StateVisual title={selected.title[locale]} facts={step.facts.map((item) => ({ label: item.label[locale], value: local(item.value, locale), changed: true }))} />
        <p>{step.explanation[locale]}</p>
      </article>
    </div>
    <aside className={styles.rule}><strong>{t.rule}</strong><p>{selected.rule[locale]}</p></aside>
    <nav className={styles.controls} aria-label={`${t.trace}: ${selected.title[locale]}`}>
      <Button variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}>← {t.previous}</Button>
      <Button variant="secondary" disabled={stepIndex === selected.steps.length - 1} onClick={() => setStepIndex((value) => Math.min(selected.steps.length - 1, value + 1))}>{t.next} →</Button>
    </nav>
  </section>;
}

export function PatternRuntimeSupplement({ patterns, pythonArtifact, locale }: Readonly<{
  patterns: readonly PatternMetadata[];
  pythonArtifact: PythonArtifactDto;
  locale: LearningLocale;
}>) {
  if (patterns.length === 0) return null;
  const catalog = learnerCatalogFor(patterns);
  if (catalog.length !== patterns.length) {
    const missing = patterns.filter((pattern) => !EXAM_CODE_BY_PATTERN.has(pattern.pattern_id)).map((pattern) => pattern.pattern_id).join(", ");
    return <p role="alert">{locale === "vi" ? `Mẫu code thi đang được giáo viên rà soát: ${missing}` : `The exam-code pattern is under teacher review: ${missing}`}</p>;
  }
  const surfaceId = pythonArtifact.lesson_id.split(".lesson.").at(-1) ?? "paper4";
  return <ExamPatternSupplement patterns={patterns} locale={locale} catalog={catalog} surfaceId={surfaceId} />;
}
