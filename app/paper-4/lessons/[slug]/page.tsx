import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonLearningPage, type CourseManifest, type LearningLocale, type LessonDto } from "@/app/components/paper4-learning";
import manifestData from "@/app/data/paper4-v2/course-manifest.json";
import { paper4V2LessonLoaders, type Paper4V2LessonSlug } from "@/app/data/paper4-v2/lesson-loaders.generated";

type LessonPageProps = Readonly<{
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}>;

const manifest = manifestData as unknown as CourseManifest;
const lessonBySlug = new Map(manifest.lessons.map((lesson) => [lesson.slug, lesson]));

if (manifest.counts.lessons !== 26 || lessonBySlug.size !== 26 || Object.keys(paper4V2LessonLoaders).length !== 26) {
  throw new Error("Paper 4 v2 route contract requires exactly 26 unique lesson slugs and loaders.");
}

export const dynamicParams = false;

export function generateStaticParams() {
  return manifest.lessons.map((lesson) => ({ slug: lesson.slug }));
}

function resolveLocale(value: string | string[] | undefined): LearningLocale {
  return value === "en" ? "en" : "vi";
}

async function loadLesson(slug: string): Promise<LessonDto> {
  const loader = paper4V2LessonLoaders[slug as Paper4V2LessonSlug];
  if (!lessonBySlug.has(slug) || !loader) notFound();
  return await loader() as unknown as LessonDto;
}

export async function generateMetadata({ params, searchParams }: LessonPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lessonMeta = lessonBySlug.get(slug);
  if (!lessonMeta) notFound();
  const lesson = await loadLesson(slug);
  const locale = resolveLocale(query.lang);
  const title = lesson.identity.title[locale];
  const description = lesson.theory.knowledge_units[0]?.explanation[locale] ?? manifest.editorial_registry.course_title[locale];
  return {
    title: `${title} · Paper 4 · AlgoCore`,
    description,
    alternates: {
      canonical: `/paper-4/lessons/${slug}?lang=${locale}`,
      languages: { vi: `/paper-4/lessons/${slug}?lang=vi`, en: `/paper-4/lessons/${slug}?lang=en` },
    },
  };
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lessonMeta = lessonBySlug.get(slug);
  if (!lessonMeta) notFound();
  const lesson = await loadLesson(slug);
  if (lesson.identity.slug !== slug || lesson.identity.lesson_id !== lessonMeta.lesson_id) throw new Error(`Paper 4 v2 loader identity mismatch for ${slug}`);
  const previousMeta = lesson.navigation.previous_slug ? lessonBySlug.get(lesson.navigation.previous_slug) : undefined;
  const nextMeta = lesson.navigation.next_slug ? lessonBySlug.get(lesson.navigation.next_slug) : undefined;
  return <LessonLearningPage
    lesson={lesson}
    locale={resolveLocale(query.lang)}
    previousLesson={previousMeta ? { slug: previousMeta.slug, title: previousMeta.title } : null}
    nextLesson={nextMeta ? { slug: nextMeta.slug, title: nextMeta.title } : null}
  />;
}
