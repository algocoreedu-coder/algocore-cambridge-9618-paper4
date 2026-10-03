"use client";

import { Check, CircleDot, LockKeyhole } from "lucide-react";
import { useRef, type ReactNode } from "react";

import type { LearningLocale } from "./types";
import styles from "./Paper4LessonShell.module.css";

export type Paper4StageState = "complete" | "current" | "locked";

export type Paper4StageItem = Readonly<{
  id: string;
  label: string;
  state: Paper4StageState;
  disabled: boolean;
  onSelect: () => void;
}>;

const copy = {
  en: {
    navigation: "Lesson stages",
    progress: (current: number, total: number) => `Step ${current} of ${total}`,
    open: "View all stages",
    complete: "Completed",
    current: "Current step",
    locked: "Locked",
  },
  vi: {
    navigation: "Các chặng của bài học",
    progress: (current: number, total: number) => `Bước ${current}/${total}`,
    open: "Xem tất cả chặng",
    complete: "Đã hoàn thành",
    current: "Chặng hiện tại",
    locked: "Chưa mở",
  },
} as const;

function StateIcon({ state }: { readonly state: Paper4StageState }) {
  if (state === "complete") return <Check aria-hidden="true" size={16} strokeWidth={3} />;
  if (state === "locked") return <LockKeyhole aria-hidden="true" size={15} strokeWidth={2.5} />;
  return <CircleDot aria-hidden="true" size={16} strokeWidth={2.5} />;
}

function StageList({ items, locale, onSelected }: Readonly<{
  items: readonly Paper4StageItem[];
  locale: LearningLocale;
  onSelected?: () => void;
}>) {
  const t = copy[locale];
  return <ol>{items.map((item, index) => <li key={item.id} data-stage-state={item.state}>
    <button
      type="button"
      disabled={item.disabled}
      aria-current={item.state === "current" ? "step" : undefined}
      onClick={() => { item.onSelect(); onSelected?.(); }}
    >
      <span className={styles.marker} aria-hidden="true"><StateIcon state={item.state} /></span>
      <span className={styles.stageLabel}>{item.label}</span>
      <span className={styles.stateLabel}>{t[item.state]}</span>
      <span className={styles.srOnly}>{index + 1}. {t[item.state]}</span>
    </button>
  </li>)}</ol>;
}

export function Paper4LessonShell({
  children,
  className,
  items,
  journeyKind,
  knowledgeUnitCount,
  lessonSlug,
  locale,
}: Readonly<{
  children: ReactNode;
  className?: string;
  items: readonly Paper4StageItem[];
  journeyKind: "canonical" | "bespoke";
  knowledgeUnitCount: number;
  lessonSlug: string;
  locale: LearningLocale;
}>) {
  const compactNav = useRef<HTMLDetailsElement>(null);
  const t = copy[locale];
  const activeIndex = Math.max(0, items.findIndex((item) => item.state === "current"));
  const activeItem = items[activeIndex] ?? items[0];

  return <div
    className={`${styles.shell}${className ? ` ${className}` : ""}`}
    data-paper4-lesson-shell
    data-canonical-lesson-journey={journeyKind === "canonical" ? "true" : undefined}
    data-learner-journey="six-stage"
    data-lesson-slug={lessonSlug}
    data-knowledge-unit-count={knowledgeUnitCount}
  >
    <nav className={styles.stageNavigation} data-stage-navigation aria-label={t.navigation}>
      <div className={styles.desktopNavigation}>
        <StageList items={items} locale={locale} />
      </div>
      <details className={styles.compactNavigation} ref={compactNav}>
        <summary>
          <span className={styles.compactProgress}>{t.progress(activeIndex + 1, items.length)}</span>
          <strong>{activeItem?.label}</strong>
          <span className={styles.compactAction}>{t.open}</span>
        </summary>
        <StageList items={items} locale={locale} onSelected={() => compactNav.current?.removeAttribute("open")} />
      </details>
    </nav>
    {children}
  </div>;
}
