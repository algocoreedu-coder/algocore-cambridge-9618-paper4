import { StudyMap } from "@/app/components/paper2-learning/StudyMap";
import { resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import { getCatalog } from "@/app/lib/paper2/catalog-server";
import { paper2LessonStatus } from "@/app/lib/paper2/lesson-status";
import { isReviewedPaper2LessonReady } from "@/app/lib/paper2/delivery-readiness";

export default async function Paper2Page({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  const locale = resolveLocale(await searchParams);
  const catalog = getCatalog();
  const progressLessons = paper2LessonStatus.lessons.filter(isReviewedPaper2LessonReady).flatMap((record) => {
    const topic = catalog.topics.find((entry) => entry.id === record.topicId);
    return topic ? [{ topicId: topic.id, slug: topic.slug, sectionId: topic.sectionId, version: record.version, title: topic.title[locale] }] : [];
  });
  return <StudyMap catalog={catalog} locale={locale} progressLessons={progressLessons} />;
}
