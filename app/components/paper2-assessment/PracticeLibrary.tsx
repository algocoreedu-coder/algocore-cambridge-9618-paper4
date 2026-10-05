"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layers3, Target } from "lucide-react";

import type { Locale, Localized } from "@/app/lib/paper2/types";

import styles from "./Paper2Assessment.module.css";

type LibraryGroup = "section" | "cumulative" | "diagnostic";
type LearningMode = "guided" | "self-check" | "diagnostic";
type DurationFilter = "short" | "medium" | "long" | "extended";
type SortOrder = "syllabus" | "duration" | "marks";

export interface PracticeLibraryItem {
  readonly id: string;
  readonly href: string;
  readonly group: LibraryGroup;
  readonly mode: LearningMode;
  readonly sectionId?: string;
  readonly syllabusIndex: number;
  readonly title: Localized;
  readonly description: Localized;
  readonly questionCount: number;
  readonly marks: number;
  readonly minutes: number;
  readonly solutionsImmediate: boolean;
}

export function PracticeLibrary({ items, locale }: { readonly items: readonly PracticeLibraryItem[]; readonly locale: Locale }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawGroup = searchParams.get("group");
  const rawMode = searchParams.get("mode");
  const rawDuration = searchParams.get("duration");
  const rawSort = searchParams.get("sort");
  const group = readOption(rawGroup, ["all", "section", "cumulative", "diagnostic"] as const, "all");
  const mode = readOption(rawMode, ["all", "guided", "self-check", "diagnostic"] as const, "all");
  const duration = readOption(rawDuration, ["all", "short", "medium", "long", "extended"] as const, "all");
  const sort = readOption(rawSort, ["syllabus", "duration", "marks"] as const, "syllabus");
  const sectionIds = [...new Set(items.flatMap((item) => item.sectionId ? [item.sectionId] : []))].sort(compareSectionIds);
  const rawSection = searchParams.get("section");
  const section = rawSection && (group === "all" || group === "section") && sectionIds.includes(rawSection) ? rawSection : "all";
  const activeFilterCount = [group !== "all", section !== "all", mode !== "all", duration !== "all", sort !== "syllabus"].filter(Boolean).length;

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (rawSection && section === "all") { next.delete("section"); changed = true; }
    if (rawGroup && group === "all" && rawGroup !== "all") { next.delete("group"); changed = true; }
    if (rawMode && mode === "all" && rawMode !== "all") { next.delete("mode"); changed = true; }
    if (rawDuration && duration === "all" && rawDuration !== "all") { next.delete("duration"); changed = true; }
    if (rawSort && sort === "syllabus" && rawSort !== "syllabus") { next.delete("sort"); changed = true; }
    if (!changed) return;
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }, [duration, group, mode, pathname, rawDuration, rawGroup, rawMode, rawSection, rawSort, router, searchParams, section, sort]);

  const filtered = items.filter((item) => (group === "all" || item.group === group)
    && (section === "all" || item.sectionId === section)
    && (mode === "all" || item.mode === mode)
    && (duration === "all" || durationMatches(item.minutes, duration)));
  const sorted = [...filtered].sort((left, right) => sort === "duration"
    ? left.minutes - right.minutes || left.syllabusIndex - right.syllabusIndex
    : sort === "marks"
      ? right.marks - left.marks || left.syllabusIndex - right.syllabusIndex
      : left.syllabusIndex - right.syllabusIndex || left.minutes - right.minutes);
  const grouped = (["section", "cumulative", "diagnostic"] as const).map((key) => ({ key, items: sorted.filter((item) => item.group === key) })).filter((entry) => entry.items.length);

  function updateParam(key: string, value: string, defaultValue = "all") {
    const next = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) next.delete(key); else next.set(key, value);
    if (key === "group" && value !== "all" && value !== "section") next.delete("section");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  function resetFilters() {
    const next = new URLSearchParams(searchParams.toString());
    for (const key of ["group", "section", "mode", "duration", "sort"]) next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  return <div className={styles.practiceLibrary}>
    <section className={styles.libraryControls} aria-label={locale === "vi" ? "Lọc thư viện luyện tập" : "Filter practice library"}>
      <div className={styles.groupTabs} aria-label={locale === "vi" ? "Nhóm bài luyện" : "Practice groups"}>
        {(["all", "section", "cumulative", "diagnostic"] as const).map((value) => <button type="button" key={value} aria-pressed={group === value} onClick={() => updateParam("group", value)}>{groupLabel(value, locale)}</button>)}
      </div>
      <div className={styles.filterDisclosure}>
        <button className={styles.filterSummary} type="button" aria-expanded={filtersOpen} aria-controls="paper2-practice-filter-controls" onClick={() => setFiltersOpen((value) => !value)}>{locale === "vi" ? `Bộ lọc${activeFilterCount ? ` (${activeFilterCount})` : ""}` : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`}</button>
        <div className={styles.filterGrid} id="paper2-practice-filter-controls" data-open={filtersOpen}>
          <label><span>{locale === "vi" ? "Phần" : "Section"}</span><select className={styles.filterControl} value={section} disabled={group !== "all" && group !== "section"} onChange={(event) => updateParam("section", event.target.value)}><option value="all">{locale === "vi" ? "Tất cả các phần" : "All sections"}</option>{sectionIds.map((id) => <option value={id} key={id}>{id}</option>)}</select></label>
          <label><span>{locale === "vi" ? "Cách học" : "Learning mode"}</span><select className={styles.filterControl} value={mode} onChange={(event) => updateParam("mode", event.target.value)}><option value="all">{locale === "vi" ? "Tất cả" : "All modes"}</option><option value="guided">{locale === "vi" ? "Có hướng dẫn" : "Guided"}</option><option value="self-check">{locale === "vi" ? "Tự kiểm" : "Self-check"}</option><option value="diagnostic">{locale === "vi" ? "Chẩn đoán" : "Diagnostic"}</option></select></label>
          <label><span>{locale === "vi" ? "Thời lượng" : "Duration"}</span><select className={styles.filterControl} value={duration} onChange={(event) => updateParam("duration", event.target.value)}><option value="all">{locale === "vi" ? "Mọi thời lượng" : "Any duration"}</option><option value="short">≤20 {locale === "vi" ? "phút" : "min"}</option><option value="medium">21–45 {locale === "vi" ? "phút" : "min"}</option><option value="long">46–90 {locale === "vi" ? "phút" : "min"}</option><option value="extended">&gt;90 {locale === "vi" ? "phút" : "min"}</option></select></label>
          <label><span>{locale === "vi" ? "Sắp xếp" : "Sort"}</span><select className={styles.filterControl} value={sort} onChange={(event) => updateParam("sort", event.target.value, "syllabus")}><option value="syllabus">{locale === "vi" ? "Theo thứ tự chương trình" : "Syllabus order"}</option><option value="duration">{locale === "vi" ? "Ngắn nhất trước" : "Shortest first"}</option><option value="marks">{locale === "vi" ? "Nhiều điểm nhất" : "Most marks"}</option></select></label>
          <div className={styles.filterActions}><button type="button" disabled={!activeFilterCount} onClick={resetFilters}>{locale === "vi" ? "Xóa bộ lọc" : "Clear filters"}</button></div>
        </div>
      </div>
      <p className={styles.resultCount} aria-live="polite">{locale === "vi" ? `${filtered.length} bộ luyện phù hợp` : `${filtered.length} matching practice sets`}</p>
    </section>

    {!grouped.length ? <section className={styles.emptyState}><strong>{locale === "vi" ? "Chưa có bộ luyện phù hợp." : "No practice sets match these filters."}</strong><span>{locale === "vi" ? `Xóa bộ lọc để xem tất cả ${items.length} bộ.` : `Clear the filters to see all ${items.length} sets.`}</span><button className={styles.primaryButton} type="button" onClick={resetFilters}>{locale === "vi" ? "Xem tất cả" : "View all"}</button></section> : grouped.map((entry) => <section className={styles.libraryGroup} key={entry.key} aria-labelledby={`practice-group-${entry.key}`}>
      <h2 id={`practice-group-${entry.key}`}>{libraryGroupLabel(entry.key, locale)}<span>{entry.items.length} {locale === "vi" ? "bộ" : "sets"}</span></h2>
      <div className={styles.practiceCards}>{entry.items.map((item) => <article className={styles.practiceCard} key={item.id}>
        <div><span>{modeLabel(item.mode, locale)}</span><h3>{item.title[locale]}</h3><p>{item.description[locale]}</p><div className={styles.practiceCardMeta}><span><Layers3 size={16} aria-hidden="true" />{item.questionCount} {locale === "vi" ? "câu" : "questions"}</span><span><Target size={16} aria-hidden="true" />{item.marks} {locale === "vi" ? "điểm luyện tập" : "practice marks"}</span></div></div>
        <div className={styles.practiceCardAction}><strong>{item.minutes} {locale === "vi" ? "phút" : "min"}</strong>{item.minutes > 90 && <small className={styles.longSession}>{locale === "vi" ? "Nên dành một phiên học riêng" : "Plan a dedicated study session"}</small>}<small>{item.solutionsImmediate ? (locale === "vi" ? "Lời giải mở ngay" : "Solutions visible now") : (locale === "vi" ? "Lời giải mở sau khi nộp" : "Solutions after submission")}</small><Link href={item.href}>{locale === "vi" ? "Mở bộ luyện" : "Open practice set"}</Link></div>
      </article>)}</div>
    </section>)}
  </div>;
}

function readOption<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? value as T : fallback;
}
function durationMatches(minutes: number, filter: DurationFilter) { return filter === "short" ? minutes <= 20 : filter === "medium" ? minutes <= 45 && minutes > 20 : filter === "long" ? minutes <= 90 && minutes > 45 : minutes > 90; }
function compareSectionIds(left: string, right: string) { return left.localeCompare(right, "en", { numeric: true }); }
function groupLabel(group: "all" | LibraryGroup, locale: Locale) { const labels = { all: { en: "All", vi: "Tất cả" }, section: { en: "By section", vi: "Theo phần" }, cumulative: { en: "Cumulative", vi: "Tổng hợp" }, diagnostic: { en: "Diagnostic", vi: "Chẩn đoán" } }; return labels[group][locale]; }
function libraryGroupLabel(group: LibraryGroup, locale: Locale) { const labels = { section: { en: "Practice by section", vi: "Luyện theo phần" }, cumulative: { en: "Cumulative revision", vi: "Ôn tập tổng hợp" }, diagnostic: { en: "Diagnostic", vi: "Chẩn đoán" } }; return labels[group][locale]; }
function modeLabel(mode: LearningMode, locale: Locale) { const labels = { guided: { en: "Guided · solutions visible", vi: "Có hướng dẫn · xem lời giải ngay" }, "self-check": { en: "Self-check · solutions after submission", vi: "Tự kiểm · lời giải sau khi nộp" }, diagnostic: { en: "Diagnostic · solutions after submission", vi: "Chẩn đoán · lời giải sau khi nộp" } }; return labels[mode][locale]; }
