import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { TopicPreview } from "@/app/components/paper2-learning/TopicPreview";
import { Paper2LessonPage } from "@/app/components/paper2-learning/lessons/LessonPage";
import { STUDENT_SESSION_COOKIE } from "@/app/lib/auth";
import { canPreviewPaper2Candidate } from "@/app/lib/paper2/candidate-access";
import { resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import { getCatalog } from "@/app/lib/paper2/catalog-server";
import { getGeneratedPaper2LessonHash, getPaper2Lesson } from "@/app/lib/paper2/lesson-registry";
import { getPaper2LessonStatusBySlug } from "@/app/lib/paper2/lesson-status";
import { isReviewedPaper2LessonReady } from "@/app/lib/paper2/delivery-readiness";
import { getPaper2VisualSelection } from "@/app/lib/paper2/server-visual-registry";

type Props = { readonly params: Promise<{ slug: string }>; readonly searchParams: Promise<PageQuery> };
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const topic = getCatalog().topics.find(item => item.slug === slug);
  return { title: topic ? topic.title[resolveLocale(await searchParams)] : "Topic not found" };
}
export default async function Paper2Topic({ params, searchParams }: Props) {
  noStore();
  const [{ slug }, query, cookieStore] = await Promise.all([params, searchParams, cookies()]);
  const catalog = getCatalog();
  const topic = catalog.topics.find(item => item.slug === slug);
  if (!topic) notFound();
  const locale = resolveLocale(query);
  const record = getPaper2LessonStatusBySlug(slug);
  const requestedRevision = Array.isArray(query.candidate) ? query.candidate[0] : query.candidate;
  const candidate = canPreviewPaper2Candidate({ record, requestedRevision, sessionToken: cookieStore.get(STUDENT_SESSION_COOKIE)?.value });
  const mayReadLesson = record && (isReviewedPaper2LessonReady(record) || candidate);
  if (mayReadLesson && record) {
    const [lesson, generatedHash] = await Promise.all([getPaper2Lesson(slug), Promise.resolve(getGeneratedPaper2LessonHash(slug))]);
    const identityMatches = lesson && generatedHash
      && lesson.topicId === record.topicId && lesson.slug === record.slug && lesson.version === record.version
      && generatedHash.topicId === record.topicId && generatedHash.slug === record.slug && generatedHash.version === record.version
      && generatedHash.contentSha256 === record.contentSha256;
    const visualSelection = identityMatches ? getPaper2VisualSelection(lesson.visual.assetIds) : undefined;
    if (identityMatches && visualSelection) return <Paper2LessonPage lesson={lesson} catalog={catalog} locale={locale} visualSelection={visualSelection} candidate={candidate} />;
  }
  return <TopicPreview catalog={catalog} topic={topic} locale={locale} />;
}
