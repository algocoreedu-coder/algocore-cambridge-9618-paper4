"use client";

import { useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Check, Circle, LocateFixed, X } from "lucide-react";
import type { Locale } from "@/app/lib/paper2/catalog";
import {
  isPaper2ProgressSessionOnly,
  PAPER2_LESSON_ANCHORS,
  PAPER2_PROGRESS_EVENT,
  paper2LessonProgressKey,
  readPaper2LessonProgress,
  rememberPaper2Lesson,
  savePaper2LessonProgress,
  type Paper2LessonAnchor,
} from "../progress-storage";
import { lessonAnchorFromHash, navigateToLessonAnchor } from "./lesson-navigation";
import styles from "./Paper2Lesson.module.css";

const labels: Record<Paper2LessonAnchor, { en: string; vi: string }> = {
  recognise: { en: "Recognise", vi: "Nhận diện" },
  understand: { en: "Understand", vi: "Hiểu" },
  "worked-example": { en: "Worked example", vi: "Giải mẫu" },
  practise: { en: "Practise", vi: "Tự luyện" },
  "avoid-lost-marks": { en: "Avoid lost marks", vi: "Tránh mất điểm" },
  remember: { en: "Remember", vi: "Gợi nhớ" },
};

export function LessonProgress({
  topicId,
  version,
  locale,
  writable = true,
}: {
  readonly topicId: string;
  readonly version: string;
  readonly locale: Locale;
  readonly writable?: boolean;
}) {
  const key = paper2LessonProgressKey(topicId, version);
  const [done, setDone] = useState<Paper2LessonAnchor[]>([]);
  const [active, setActive] = useState<Paper2LessonAnchor>("recognise");
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(false);
  const lastRemembered = useRef<Paper2LessonAnchor | null>(null);
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const mobileClose = useRef<HTMLButtonElement>(null);
  const returnFocusOnClose = useRef(true);
  const mobileTitleId = useId();
  const nextIncomplete = useMemo(
    () => PAPER2_LESSON_ANCHORS.find((anchor) => !done.includes(anchor)),
    [done],
  );
  const activeIndex = PAPER2_LESSON_ANCHORS.indexOf(active);

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1023px)").matches;
    setExpanded(!compact);
    const refresh = () => {
      setDone(writable ? readPaper2LessonProgress(topicId, version) : []);
      setSessionOnly(isPaper2ProgressSessionOnly());
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(PAPER2_PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PAPER2_PROGRESS_EVENT, refresh);
    };
  }, [key, topicId, version, writable]);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const marker = Math.min(window.innerHeight * 0.34, 320);
      let candidate: Paper2LessonAnchor = PAPER2_LESSON_ANCHORS[0];
      for (const anchor of PAPER2_LESSON_ANCHORS) {
        const section = document.getElementById(anchor);
        if (!section) continue;
        const bounds = section.getBoundingClientRect();
        if (bounds.top <= marker) candidate = anchor;
        if (bounds.top <= marker && bounds.bottom > marker) break;
      }
      setActive(candidate);
      if (writable && lastRemembered.current !== candidate) {
        lastRemembered.current = candidate;
        rememberPaper2Lesson(topicId, version, candidate);
        setSessionOnly(isPaper2ProgressSessionOnly());
      }
    };
    const scheduleMeasure = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [topicId, version, writable]);

  useEffect(() => {
    const focusHash = () => {
      const hashAnchor = lessonAnchorFromHash(window.location.hash);
      if (!hashAnchor) return;
      setActive(hashAnchor);
      window.requestAnimationFrame(() => navigateToLessonAnchor(hashAnchor, "replace"));
    };
    focusHash();
    window.addEventListener("hashchange", focusHash);
    return () => window.removeEventListener("hashchange", focusHash);
  }, []);

  function toggle(id: Paper2LessonAnchor) {
    if (!writable) return;
    const next = done.includes(id) ? done.filter((item) => item !== id) : [...done, id];
    setDone(next);
    rememberPaper2Lesson(topicId, version, id);
    // Memory state remains usable and shared when persistent storage is unavailable.
    savePaper2LessonProgress(topicId, version, next);
    setSessionOnly(isPaper2ProgressSessionOnly());
  }

  function followAnchor(event: MouseEvent<HTMLAnchorElement>, anchor: Paper2LessonAnchor, fromMobileDialog = false) {
    event.preventDefault();
    if (fromMobileDialog) {
      returnFocusOnClose.current = false;
      mobileDialog.current?.close();
      setMobileOpen(false);
      window.requestAnimationFrame(() => navigateToLessonAnchor(anchor));
      return;
    }
    navigateToLessonAnchor(anchor);
    if (window.matchMedia("(max-width: 1023px)").matches) setExpanded(false);
  }

  function openMobileDrawer() {
    const dialog = mobileDialog.current;
    if (!dialog || dialog.open) return;
    returnFocusOnClose.current = true;
    dialog.showModal();
    setMobileOpen(true);
    window.requestAnimationFrame(() => mobileClose.current?.focus());
  }

  function closeMobileDrawer() {
    returnFocusOnClose.current = true;
    mobileDialog.current?.close();
    setMobileOpen(false);
  }

  const activeLabel = labels[active][locale];

  function outlineBody(fromMobileDialog = false) {
    return <div className={styles.progressBody}>
        <div className={styles.progressHeading}>
          <strong>{locale === "vi" ? "Sáu phần của bài" : "Six lesson parts"}</strong>
          <span>{writable ? `${done.length}/${PAPER2_LESSON_ANCHORS.length}` : PAPER2_LESSON_ANCHORS.length}</span>
        </div>
        {sessionOnly && <p className={styles.storageNotice} role="status">{locale === "vi" ? "Không thể lưu trên thiết bị. Tiến độ chỉ giữ trong phiên này và sẽ mất khi tải lại trang." : "Progress cannot be saved on this device. It is kept for this session only and will be lost when the page reloads."}</p>}
        <nav aria-label={locale === "vi" ? "Sáu phần của bài học" : "Six lesson parts"}><ol>{PAPER2_LESSON_ANCHORS.map((anchor, index) => {
          const reviewed = done.includes(anchor);
          const current = active === anchor;
          const next = nextIncomplete === anchor;
          const stateLabel = current
            ? (locale === "vi" ? "Đang xem" : "Current")
            : reviewed
              ? (locale === "vi" ? "Đã học" : "Reviewed")
              : next
                ? (locale === "vi" ? "Tiếp theo" : "Next")
                : (locale === "vi" ? "Chưa đánh dấu" : "Not reviewed");
          return <li key={anchor} data-progress-anchor={anchor} data-reviewed={reviewed ? "true" : "false"} data-current={current ? "true" : "false"} data-next={next ? "true" : "false"}>
            <a href={`#${anchor}`} onClick={(event) => followAnchor(event, anchor, fromMobileDialog)} aria-current={current ? "step" : undefined}>
              <span className={styles.progressMarker}>{reviewed ? <Check size={15} aria-hidden="true" /> : current ? <LocateFixed size={15} aria-hidden="true" /> : String(index + 1).padStart(2, "0")}</span>
              <span><strong>{labels[anchor][locale]}</strong><small>{stateLabel}</small></span>
            </a>
            {writable && <button type="button" aria-pressed={reviewed} onClick={() => toggle(anchor)}>
              {reviewed ? <Check size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
              <span>{reviewed ? (locale === "vi" ? "Bỏ đánh dấu" : "Unmark") : (locale === "vi" ? "Đánh dấu đã học" : "Mark as reviewed")}</span>
            </button>}
          </li>;
        })}</ol>
        {nextIncomplete && <a className={styles.progressNext} href={`#${nextIncomplete}`} onClick={(event) => followAnchor(event, nextIncomplete, fromMobileDialog)}>
          <span><small>{locale === "vi" ? "Phần nên học tiếp" : "Suggested next part"}</small><strong>{labels[nextIncomplete][locale]}</strong></span>
          <ArrowRight size={17} aria-hidden="true" />
        </a>}</nav>
      </div>;
  }

  const storageSummary = writable
    ? sessionOnly
      ? (locale === "vi" ? `${done.length} phần đã đánh dấu · không tính điểm · chỉ giữ trong phiên` : `${done.length} marked · unscored · this session only`)
      : (locale === "vi" ? `${done.length} phần đã đánh dấu · không tính điểm · lưu trên thiết bị` : `${done.length} reviewed · unscored · saved on this device`)
    : (locale === "vi" ? "Chế độ xem trước · không lưu tiến độ" : "Preview mode · progress is not saved");

  return <>
    <aside className={styles.progress} aria-label={locale === "vi" ? "Mục lục và tiến độ bài học" : "Lesson outline and progress"}>
      <details open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
        <summary>
          <span className={styles.progressSummaryTitle}>
            <strong>{String(activeIndex + 1).padStart(2, "0")}/06 · {activeLabel}</strong>
            <small>{storageSummary}</small>
          </span>
          <span className={styles.progressSummaryAction}>{locale === "vi" ? "Mục lục" : "Outline"}<span aria-hidden="true">⌄</span></span>
        </summary>
        {outlineBody()}
      </details>
    </aside>
    <aside className={styles.mobileProgress} aria-label={locale === "vi" ? "Mục lục và tiến độ bài học" : "Lesson outline and progress"}>
      <div className={styles.mobileBar}>
        <span><strong>{String(activeIndex + 1).padStart(2, "0")}/06 · {activeLabel}</strong><small>{writable ? `${done.length}/6 ${locale === "vi" ? "đã đánh dấu · không tính điểm" : "reviewed · unscored"}` : (locale === "vi" ? "Xem trước" : "Preview")}</small></span>
        <button ref={mobileTrigger} type="button" onClick={openMobileDrawer} aria-haspopup="dialog" aria-expanded={mobileOpen}>{locale === "vi" ? "Mục lục" : "Outline"}</button>
      </div>
      <dialog ref={mobileDialog} className={`${styles.mobileDialog} ${styles.progress}`} aria-labelledby={mobileTitleId}
        onCancel={(event) => { event.preventDefault(); closeMobileDrawer(); }}
        onClose={() => {
          setMobileOpen(false);
          if (returnFocusOnClose.current) mobileTrigger.current?.focus();
          returnFocusOnClose.current = true;
        }}
        onClick={(event) => { if (event.target === event.currentTarget) closeMobileDrawer(); }}>
        <header><span><strong id={mobileTitleId}>{locale === "vi" ? "Mục lục bài học" : "Lesson outline"}</strong><small>{storageSummary}</small></span><button ref={mobileClose} type="button" onClick={closeMobileDrawer} aria-label={locale === "vi" ? "Đóng mục lục" : "Close lesson outline"}><X size={20} aria-hidden="true" /></button></header>
        {outlineBody(true)}
      </dialog>
    </aside>
  </>;
}
