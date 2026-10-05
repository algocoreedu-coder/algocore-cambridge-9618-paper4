import { PAPER2_LESSON_ANCHORS, type Paper2LessonAnchor } from "../progress-storage";

export function lessonAnchorFromHash(hash: string): Paper2LessonAnchor | null {
  const anchor = decodeURIComponent(hash.replace(/^#/, ""));
  return PAPER2_LESSON_ANCHORS.includes(anchor as Paper2LessonAnchor)
    ? anchor as Paper2LessonAnchor
    : null;
}

export function navigateToLessonAnchor(anchor: Paper2LessonAnchor, historyMode: "push" | "replace" = "push") {
  const section = document.getElementById(anchor);
  if (!section) return;
  const url = new URL(window.location.href);
  url.hash = anchor;
  window.history[historyMode === "replace" ? "replaceState" : "pushState"](
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
  const heading = section.querySelector<HTMLElement>("h2");
  window.requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
}
