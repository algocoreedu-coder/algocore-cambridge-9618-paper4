"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";
import type { Locale } from "@/app/lib/paper2/catalog";
import {
  PAPER2_PROGRESS_EVENT,
  readPaper2LessonProgress,
  rememberPaper2Lesson,
  savePaper2LessonProgress,
  type Paper2LessonAnchor,
} from "../progress-storage";
import { navigateToLessonAnchor } from "./lesson-navigation";
import styles from "./Paper2Lesson.module.css";

const labels: Record<Paper2LessonAnchor, { en: string; vi: string }> = {
  recognise: { en: "Recognise", vi: "Nhận diện" },
  understand: { en: "Understand", vi: "Hiểu" },
  "worked-example": { en: "Worked example", vi: "Giải mẫu" },
  practise: { en: "Practise", vi: "Tự luyện" },
  "avoid-lost-marks": { en: "Avoid lost marks", vi: "Tránh mất điểm" },
  remember: { en: "Remember", vi: "Gợi nhớ" },
};

export function LessonSectionActions({
  anchor,
  nextAnchor,
  topicId,
  version,
  locale,
  writable,
  completionHref,
}: {
  readonly anchor: Paper2LessonAnchor;
  readonly nextAnchor?: Paper2LessonAnchor;
  readonly topicId: string;
  readonly version: string;
  readonly locale: Locale;
  readonly writable: boolean;
  readonly completionHref?: string;
}) {
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    const refresh = () => setReviewed(readPaper2LessonProgress(topicId, version).includes(anchor));
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(PAPER2_PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PAPER2_PROGRESS_EVENT, refresh);
    };
  }, [anchor, topicId, version]);

  function toggleReviewed() {
    if (!writable) return;
    const current = readPaper2LessonProgress(topicId, version);
    const nextReviewed = !current.includes(anchor);
    const next = nextReviewed ? [...current, anchor] : current.filter((item) => item !== anchor);
    setReviewed(nextReviewed);
    rememberPaper2Lesson(topicId, version, anchor);
    savePaper2LessonProgress(topicId, version, next);
  }

  function followNext(event: MouseEvent<HTMLAnchorElement>) {
    if (!nextAnchor) return;
    event.preventDefault();
    navigateToLessonAnchor(nextAnchor);
  }

  return <footer className={styles.chapterFooter} data-lesson-section-actions={anchor}>
    {writable ? <button type="button" aria-pressed={reviewed} onClick={toggleReviewed}>
      {reviewed ? <Check size={17} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}
      {reviewed
        ? (locale === "vi" ? "Đã đánh dấu đã học" : "Marked as reviewed")
        : (locale === "vi" ? "Đánh dấu phần này đã học" : "Mark this part as reviewed")}
    </button> : <span>{locale === "vi" ? "Chế độ xem trước · không lưu tiến độ" : "Preview mode · progress is not saved"}</span>}
    {nextAnchor ? <a href={`#${nextAnchor}`} onClick={followNext}>
      <span><small>{locale === "vi" ? "Phần tiếp theo" : "Next part"}</small><strong>{labels[nextAnchor][locale]}</strong></span>
      <ArrowRight size={17} aria-hidden="true" />
    </a> : completionHref ? <Link href={completionHref}>
      <span><small>{locale === "vi" ? "Đã đến cuối bài" : "End of lesson"}</small><strong>{locale === "vi" ? "Về tổng quan phần" : "Return to section overview"}</strong></span>
      <ArrowRight size={17} aria-hidden="true" />
    </Link> : null}
  </footer>;
}
