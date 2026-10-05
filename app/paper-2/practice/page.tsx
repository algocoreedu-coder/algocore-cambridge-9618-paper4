import { Suspense } from "react";
import { BookOpenCheck } from "lucide-react";

import { PracticeLibrary, type PracticeLibraryItem } from "@/app/components/paper2-assessment/PracticeLibrary";
import { listPaper2PracticeSets } from "@/app/lib/paper2/assessment-registry";
import { paper2Href, resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import { getCatalog } from "@/app/lib/paper2/catalog-server";
import styles from "@/app/components/paper2-assessment/Paper2Assessment.module.css";

export default async function Paper2PracticePage({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  const locale = resolveLocale(await searchParams);
  const catalog = getCatalog();
  const sections = new Map(catalog.sections.map((section, index) => [section.id, { ...section, index }]));
  const topicSection = new Map(catalog.topics.map((topic) => [topic.id, topic.sectionId]));
  const sets = listPaper2PracticeSets().filter((set) => set.rightsStatus === "approved" && set.review.decision === "approved");
  const items: PracticeLibraryItem[] = sets.map((set, registryIndex) => {
    const coveredSectionIds = [...new Set(set.coverageSummary.map((topicId) => topicSection.get(topicId)).filter((value): value is string => Boolean(value)))];
    const sectionId = coveredSectionIds.length === 1 ? coveredSectionIds[0] : undefined;
    const section = sectionId ? sections.get(sectionId) : undefined;
    const group = set.kind === "diagnostic" ? "diagnostic" as const : set.kind === "cumulative" ? "cumulative" as const : "section" as const;
    const mode = set.mode === "diagnostic_closed" ? "diagnostic" as const : set.mode === "set_closed" ? "self-check" as const : "guided" as const;
    return {
      id: set.setId,
      href: paper2Href(`/paper-2/practice/${set.setId}`, locale),
      group,
      mode,
      ...(sectionId ? { sectionId } : {}),
      syllabusIndex: group === "section" ? section?.index ?? 99 : group === "cumulative" ? 100 + registryIndex : 200 + registryIndex,
      title: set.kind === "section_mixed" && section ? { en: `${section.id} · ${section.title.en}`, vi: `${section.id} · ${section.title.vi}` } : { en: set.title.en, vi: vietnameseLearnerCopy(set.title.vi) },
      description: { en: set.instructions.en, vi: vietnameseLearnerCopy(set.instructions.vi) },
      questionCount: set.questionRefs.length,
      marks: set.computedMarks,
      minutes: set.computedMinutes,
      solutionsImmediate: set.solutionDisclosure === "immediate",
    };
  });

  return <div className={styles.workspace} lang={locale}>
    <section className={styles.startCard}><BookOpenCheck size={36} aria-hidden="true" /><span>{locale === "vi" ? "LUYỆN THEO PHẦN VÀ ÔN TẬP TỔNG HỢP" : "SECTION AND CUMULATIVE PRACTICE"}</span><h1>{locale === "vi" ? "Thư viện luyện Paper 2" : "Paper 2 practice library"}</h1><p>{locale === "vi" ? "Bài có hướng dẫn mở lời giải ngay để học cách làm. Bài chẩn đoán và bài tự kiểm chỉ mở hướng dẫn chấm sau khi bạn chủ động nộp." : "Guided sets show full solutions while you learn. Diagnostics and self-check sets reveal marking guidance only after explicit submission."}</p></section>
    <Suspense fallback={<p className={styles.loading}>{locale === "vi" ? "Đang mở thư viện luyện tập…" : "Opening the practice library…"}</p>}><PracticeLibrary items={items} locale={locale} /></Suspense>
  </div>;
}

function vietnameseLearnerCopy(value: string) {
  return value
    .replace(/\brubric\b/gi, "hướng dẫn chấm")
    .replace(/\bsection\b/gi, "phần")
    .replace(/\bdiagnostic\b/gi, "chẩn đoán")
    .replace(/\bset\b/gi, "bộ luyện")
    .replace(/\bguided\b/gi, "có hướng dẫn")
    .replace(/\broutine\b/gi, "chương trình con");
}
