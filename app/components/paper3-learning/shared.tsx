import Link from "next/link";
import { Binary, Network, Cpu, Layers3, ShieldCheck, BrainCircuit, Workflow, Braces, ArrowUpRight, CircleDot } from "lucide-react";
import type { Locale, StudyMapCatalog, Topic } from "@/app/lib/paper3/catalog";
import styles from "./Paper3Learning.module.css";

export function paper3Href(path: string, locale: Locale) {
  const [base, hash] = path.split("#");
  const [pathname, search] = base.split("?");
  const params = new URLSearchParams(search);
  params.set("lang", locale);
  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ""}`;
}

const sectionIcons = { "13": Binary, "14": Network, "15": Cpu, "16": Layers3, "17": ShieldCheck, "18": BrainCircuit, "19": Workflow, "20": Braces };
export function SectionIcon({ id, size = 24 }: { readonly id: string; readonly size?: number }) {
  const Icon = sectionIcons[id as keyof typeof sectionIcons] ?? CircleDot;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}

export function getSectionTopics(catalog: StudyMapCatalog, sectionId: string) {
  const strandIds = new Set(catalog.strands.filter((strand) => strand.sectionId === sectionId).map((strand) => strand.id));
  return catalog.topics.filter((topic) => strandIds.has(topic.strandId));
}

export const learningModes = {
  concept: { en: "Explore a concept", vi: "Khám phá khái niệm" },
  process: { en: "Follow a process", vi: "Theo dõi quy trình" },
  calculation: { en: "Work through a calculation", vi: "Giải từng bước tính" },
  logic: { en: "Investigate logic", vi: "Khám phá logic" },
  algorithm: { en: "Trace an algorithm", vi: "Trace thuật toán" },
  programming: { en: "Explore a programming model", vi: "Khám phá mô hình lập trình" },
};

export function TopicRow({ topic, locale, index }: { readonly topic: Topic; readonly locale: Locale; readonly index?: number }) {
  return <Link className={styles.topicRow} data-topic-id={topic.id} href={paper3Href(`/paper-3/topics/${topic.slug}`, locale)}>
    <span className={styles.topicIndex} aria-hidden="true">{index === undefined ? topic.strandId : String(index + 1).padStart(2, "0")}</span>
    <span className={styles.topicCopy}><strong>{topic.title[locale]}</strong><span>{topic.summary[locale]}</span><small>{learningModes[topic.learningMode][locale]}<span aria-hidden="true"> · </span>{topic.status === "available" ? (locale === "vi" ? "Mở bài học và minh họa" : "Open lesson and visual") : (locale === "vi" ? "Đang biên soạn" : "In preparation")}</small></span>
    <ArrowUpRight size={18} aria-hidden="true" />
  </Link>;
}

export function PreparationNote({ locale, availableCount = 0, totalCount }: { readonly locale: Locale; readonly availableCount?: number; readonly totalCount?: number }) {
  const complete = totalCount !== undefined && totalCount > 0 && availableCount === totalCount;
  const copy = complete
    ? (locale === "vi" ? `Đủ ${availableCount}/${totalCount} bài đã có lý thuyết, minh họa tương tác và câu hỏi tự kiểm.` : `All ${availableCount}/${totalCount} lessons include theory, interactive explanations and self-check questions.`)
    : availableCount > 0
      ? (locale === "vi" ? `${availableCount} bài đã có lý thuyết, minh họa tương tác và câu hỏi tự kiểm. Các topic còn lại đang được biên soạn.` : `${availableCount} lessons include theory, interactive explanations and self-check questions. The remaining topics are in preparation.`)
      : (locale === "vi" ? "Bản đồ học đã sẵn sàng để khám phá. Bài giảng, minh họa tương tác và bài luyện sẽ được bổ sung sau." : "The study map is ready to explore. Lessons, interactive explanations and practice will be added next.");
  return <p className={styles.preparationNote}><CircleDot size={16} aria-hidden="true" /><span>{copy}</span></p>;
}
