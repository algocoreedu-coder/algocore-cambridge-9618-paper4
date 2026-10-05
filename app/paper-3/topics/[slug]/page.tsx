import { notFound, permanentRedirect } from "next/navigation";
import { TopicPreview } from "@/app/components/paper3-learning/TopicPreview";
import { getCatalog, resolveLocale, type PageQuery } from "@/app/lib/paper3/catalog";
import { getLesson } from "@/app/lib/paper3/lesson-registry";
import { TopicLesson } from "@/app/components/paper3-learning/lessons/LessonPage";
import { paper3Href } from "@/app/components/paper3-learning/shared";

export default async function TopicPage({ params, searchParams }: {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<PageQuery>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (slug === "half-and-full-adders") {
    permanentRedirect(paper3Href("/paper-3/topics/half-full-adders", resolveLocale(query)));
  }
  const catalog = getCatalog();
  const topic = catalog.topics.find((entry) => entry.slug === slug);
  if (!topic) notFound();
  if (topic.status !== "available") return <TopicPreview catalog={catalog} slug={slug} locale={resolveLocale(query)} />;
  const lesson = await getLesson(slug);
  if (lesson) return <TopicLesson lesson={lesson} catalog={catalog} locale={resolveLocale(query)} />;
  return <TopicPreview catalog={catalog} slug={slug} locale={resolveLocale(query)} />;
}
