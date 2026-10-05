import Link from "next/link";
import { ArrowUpRight, Braces, CircleDot, Database, Network, Workflow } from "lucide-react";
import type { Locale, Topic } from "@/app/lib/paper2/types";
import { paper2Href } from "@/app/lib/paper2/catalog";
import styles from "./Paper2Learning.module.css";

export { paper2Href, getSectionTopics } from "@/app/lib/paper2/catalog";

const strandIcons = { "9": Network, "10": Database, "11": Braces, "12": Workflow };
export function SectionIcon({ id, size = 24 }: { readonly id: string; readonly size?: number }) {
  const Icon = strandIcons[id.split(".")[0] as keyof typeof strandIcons] ?? CircleDot;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}

export const learningModes = {
  explanation: { en: "Understand and explain", vi: "Hiểu và giải thích" },
  diagram: { en: "Read and build diagrams", vi: "Đọc và dựng sơ đồ" },
  procedural: { en: "Follow each step", vi: "Theo dõi từng bước" },
  testing: { en: "Test and reason", vi: "Kiểm thử và lập luận" },
};

export function topicStatusLabel(topic: Topic, locale: Locale) {
  return topic.status === "available"
    ? (locale === "vi" ? "Bài học đầy đủ" : "Full lesson")
    : (locale === "vi" ? "Chỉ có tổng quan" : "Overview only");
}

export function sectionReadinessLabel(availableCount: number, totalCount: number, locale: Locale) {
  if (availableCount === 0) return locale === "vi" ? `Chỉ có tổng quan · 0/${totalCount} bài đầy đủ` : `Overview only · 0/${totalCount} full lessons`;
  if (availableCount === totalCount) return locale === "vi" ? `${availableCount}/${totalCount} bài đầy đủ` : `${availableCount}/${totalCount} full lessons`;
  return locale === "vi" ? `${availableCount}/${totalCount} bài đầy đủ` : `${availableCount}/${totalCount} full lessons`;
}

export function TopicRow({ topic, locale, contextLabel }: { readonly topic: Topic; readonly locale: Locale; readonly contextLabel?: string }) {
  return <Link className={styles.topicRow} data-topic-id={topic.id} href={paper2Href(`/paper-2/topics/${topic.slug}`, locale)}>
    <span className={styles.topicIndex}>{topic.id}</span>
    <span className={styles.topicCopy}>{contextLabel && <small className={styles.topicContext}>{contextLabel}</small>}<strong>{topic.title[locale]}</strong><span>{topic.summary[locale]}</span><small>{learningModes[topic.learningMode][locale]}<span aria-hidden="true"> · </span>{topicStatusLabel(topic, locale)}</small></span>
    <ArrowUpRight size={18} aria-hidden="true" />
  </Link>;
}

export function PreparationNote({ locale, availableCount, totalCount, scope = "section" }: { readonly locale: Locale; readonly availableCount: number; readonly totalCount: number; readonly scope?: "course" | "section" }) {
  return <p className={styles.preparationNote}><CircleDot size={17} aria-hidden="true" /><span>{locale === "vi"
    ? availableCount === 0
      ? "Bản đồ, phạm vi và mục tiêu học đã có. Bài giảng chi tiết, lời giải và hoạt động tương tác đang được biên soạn."
      : availableCount === totalCount
        ? scope === "course" ? `Toàn bộ ${totalCount} bài chi tiết của Paper 2 đã sẵn sàng.` : `Toàn bộ ${totalCount} bài chi tiết trong phần này đã sẵn sàng.`
        : `${availableCount}/${totalCount} bài chi tiết đã sẵn sàng; các bài còn lại có phần tổng quan và mục tiêu học.`
    : availableCount === 0
      ? "Explore the map, scope and learning objectives now. Full lessons, worked solutions and interactive activities are in preparation."
      : availableCount === totalCount
        ? scope === "course" ? `All ${totalCount} full Paper 2 lessons are ready.` : `All ${totalCount} full lessons in this section are ready.`
        : `${availableCount}/${totalCount} full lessons are ready; the others offer an overview and learning objectives.`}</span></p>;
}
