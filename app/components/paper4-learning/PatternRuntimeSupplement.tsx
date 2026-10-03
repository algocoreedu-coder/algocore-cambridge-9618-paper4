"use client";

import { useEffect, useId, useState } from "react";

import { Paper4VisualRuntime } from "@/app/components/paper4-visual";
import type { PatternMetadata, PythonArtifactDto } from "@/app/components/paper4-visual/types";

import type { LearningLocale } from "./types";

const copy = {
  en: {
    title: "Additional operation trace",
    help: "This lesson trace does not perform every operation in the lesson. Choose one of the remaining operations to practise its normal, boundary and failure cases.",
    choose: "Operation",
  },
  vi: {
    title: "Trace thao tác bổ sung",
    help: "Trace chính của bài không thực hiện mọi thao tác thuộc bài. Hãy chọn một thao tác còn lại để luyện trường hợp thường, biên và lỗi.",
    choose: "Thao tác",
  },
} as const;

function friendlyPatternLabel(patternId: string, locale: LearningLocale) {
  const text = patternId.toLocaleLowerCase(locale === "vi" ? "vi-VN" : "en-US").replaceAll("_", " ");
  return text.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase(locale === "vi" ? "vi-VN" : "en-US"));
}

export function PatternRuntimeSupplement({ patterns, pythonArtifact, locale }: Readonly<{
  patterns: readonly PatternMetadata[];
  pythonArtifact: PythonArtifactDto;
  locale: LearningLocale;
}>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const labelId = useId();
  useEffect(() => setSelectedIndex(0), [patterns]);
  if (patterns.length === 0) return null;
  const selected = patterns[Math.min(selectedIndex, patterns.length - 1)];
  const t = copy[locale];
  return <section aria-labelledby={labelId}>
    <header><h3 id={labelId}>{t.title}</h3><p>{t.help}</p></header>
    {patterns.length > 1 && <label><span>{t.choose}</span><select value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.currentTarget.value))}>{patterns.map((pattern, index) => <option key={pattern.pattern_id} value={index}>{friendlyPatternLabel(pattern.pattern_id, locale)}</option>)}</select></label>}
    <Paper4VisualRuntime key={selected.pattern_id} patterns={[selected]} pythonArtifact={pythonArtifact} initialPatternId={selected.pattern_id} initialLocale={locale} locale={locale} headingLevel={3} audience="learner" />
  </section>;
}
