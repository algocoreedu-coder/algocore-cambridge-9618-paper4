"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import type { Locale } from "@/app/lib/paper2/catalog";
import { paper2Href } from "@/app/lib/paper2/catalog";
import {
  PAPER2_LESSON_ANCHORS,
  PAPER2_PROGRESS_EVENT,
  isPaper2ProgressSessionOnly,
  type Paper2ProgressLesson,
  type Paper2LessonAnchor,
  readPaper2LastVisited,
  readPaper2LessonProgress,
} from "./progress-storage";
import styles from "./Paper2Learning.module.css";

type Snapshot = Readonly<Record<string, readonly Paper2LessonAnchor[]>>;

function loadSnapshot(lessons: readonly Paper2ProgressLesson[]): Snapshot {
  return Object.fromEntries(lessons.map((lesson) => [lesson.topicId, readPaper2LessonProgress(lesson.topicId, lesson.version)]));
}

export function CourseProgressSummary({
  lessons,
  locale,
  sectionId,
}: {
  readonly lessons: readonly Paper2ProgressLesson[];
  readonly locale: Locale;
  readonly sectionId?: string;
}) {
  const scoped = useMemo(() => sectionId ? lessons.filter((lesson) => lesson.sectionId === sectionId) : lessons, [lessons, sectionId]);
  const [snapshot, setSnapshot] = useState<Snapshot>({});
  const [lastVisited, setLastVisited] = useState<{ topicId: string; version: string } | null>(null);
  const [sessionOnly, setSessionOnly] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setSnapshot(loadSnapshot(scoped));
      setLastVisited(readPaper2LastVisited());
      setSessionOnly(isPaper2ProgressSessionOnly());
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(PAPER2_PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PAPER2_PROGRESS_EVENT, refresh);
    };
  }, [scoped]);

  const completed = scoped.filter((lesson) => snapshot[lesson.topicId]?.length === PAPER2_LESSON_ANCHORS.length);
  const reviewedSteps = scoped.reduce((total, lesson) => total + (snapshot[lesson.topicId]?.length ?? 0), 0);
  const incomplete = scoped.filter((lesson) => (snapshot[lesson.topicId]?.length ?? 0) < PAPER2_LESSON_ANCHORS.length);
  const allReviewed = scoped.length > 0 && incomplete.length === 0;
  const remembered = incomplete.find((lesson) => lesson.topicId === lastVisited?.topicId && lesson.version === lastVisited.version);
  const partial = incomplete.find((lesson) => (snapshot[lesson.topicId]?.length ?? 0) > 0);
  const nextLesson = remembered ?? partial ?? incomplete[0];
  const nextAnchor = nextLesson
    ? PAPER2_LESSON_ANCHORS.find((anchor) => !snapshot[nextLesson.topicId]?.includes(anchor)) ?? "recognise"
    : undefined;

  return <section className={styles.courseProgress} data-paper2-course-progress data-progress-scope={sectionId ?? "course"} aria-labelledby={`paper2-progress-${sectionId ?? "course"}`}>
    <div className={styles.courseProgressIcon} aria-hidden="true">{completed.length === scoped.length && scoped.length > 0 ? <CheckCircle2 /> : <CircleDashed />}</div>
    <div className={styles.courseProgressCopy}>
      <span className={styles.kicker}>{locale === "vi" ? "TIẾN ĐỘ TỰ ĐÁNH DẤU" : "SELF-REVIEW PROGRESS"}</span>
      <h2 id={`paper2-progress-${sectionId ?? "course"}`}>{sectionId
        ? (locale === "vi" ? `Tiến độ phần ${sectionId}` : `Section ${sectionId} progress`)
        : (locale === "vi" ? "Tiếp tục lộ trình Paper 2" : "Continue your Paper 2 journey")}</h2>
      {scoped.length > 0 ? <>
        <p><strong>{completed.length}/{scoped.length}</strong> {locale === "vi" ? "bài đã tự đánh dấu đủ sáu phần" : "lessons self-marked across all six parts"} · {reviewedSteps}/{scoped.length * PAPER2_LESSON_ANCHORS.length} {locale === "vi" ? "mục đã đánh dấu" : "parts marked"}</p>
        <div className={styles.progressTrack} role="progressbar" aria-label={locale === "vi" ? "Tiến độ tự đánh dấu" : "Self-review progress"} aria-valuemin={0} aria-valuemax={scoped.length * PAPER2_LESSON_ANCHORS.length} aria-valuenow={reviewedSteps}><span style={{ width: `${scoped.length ? reviewedSteps / (scoped.length * PAPER2_LESSON_ANCHORS.length) * 100 : 0}%` }} /></div>
        <small>{sessionOnly
          ? (locale === "vi" ? "Đây là danh sách tự đánh dấu, không phải điểm số hoặc đánh giá mức độ thành thạo." : "This is a self-review checklist, not a score or a measure of mastery.")
          : (locale === "vi" ? "Lưu trên thiết bị này. Đây là danh sách tự đánh dấu, không phải điểm số hoặc đánh giá mức độ thành thạo." : "Saved on this device. This is a self-review checklist, not a score or a measure of mastery.")}</small>
        {sessionOnly && <p className={styles.storageNotice} role="status">{locale === "vi" ? "Không thể lưu trên thiết bị. Tiến độ chỉ được giữ trong phiên này và sẽ mất khi tải lại trang." : "Progress cannot be saved on this device. It is kept for this session only and will be lost when the page reloads."}</p>}
      </> : <p>{locale === "vi" ? "Phần này hiện chưa có bài chi tiết để ghi tiến độ." : "This section does not yet have a full lesson to track."}</p>}
    </div>
    {nextLesson && nextAnchor && <Link className={styles.continueLink} data-paper2-continue data-paper2-continue-anchor={nextAnchor} href={paper2Href(`/paper-2/topics/${nextLesson.slug}#${nextAnchor}`, locale)}>
      <span><small>{locale === "vi" ? "Tiếp tục từ phần đầu tiên chưa học" : "Continue from the first unreviewed part"}</small><strong>{nextLesson.topicId} · {nextLesson.title}</strong></span><ArrowRight size={18} aria-hidden="true" />
    </Link>}
    {allReviewed && <div className={styles.completeProgress} data-paper2-progress-complete>
      <p role="status"><CheckCircle2 size={18} aria-hidden="true" /><span><small>{locale === "vi" ? "ĐÃ HOÀN TẤT DANH SÁCH" : "CHECKLIST COMPLETE"}</small><strong>{locale === "vi" ? "Bạn đã tự đánh dấu đủ sáu phần của mọi bài." : "You self-marked all six parts of every lesson."}</strong></span></p>
      <Link href={paper2Href(sectionId ? `/paper-2/practice?section=${sectionId}` : "/paper-2/progress", locale)} aria-label={sectionId
        ? (locale === "vi" ? `Danh sách đọc bài đã hoàn tất. Bước tiếp theo: luyện tập phần ${sectionId}` : `Lesson checklist complete. Next step: practise section ${sectionId}`)
        : (locale === "vi" ? "Danh sách đọc bài Paper 2 đã hoàn tất. Mở tiến độ Paper 2" : "Paper 2 lesson checklist complete. Open Paper 2 progress") }>
        <span><small>{locale === "vi" ? "BƯỚC TIẾP THEO" : "NEXT STEP"}</small><strong>{sectionId ? (locale === "vi" ? `Luyện tập phần ${sectionId}` : `Practise section ${sectionId}`) : (locale === "vi" ? "Mở tiến độ Paper 2" : "Open Paper 2 progress")}</strong></span><ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>}
  </section>;
}
