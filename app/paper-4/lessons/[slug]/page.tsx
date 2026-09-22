import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  LessonLearningPage,
  type LearningLocale,
  type LearningRegistry,
} from "@/app/components/paper4-learning";
import type { RuntimeRegistry } from "@/app/components/paper4-visual";
import learningData from "@/app/data/stage9-learning-pages.json";
import runtimeData from "@/app/data/stage8-runtime-registry.json";

type LessonPageProps = Readonly<{
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}>;

const learningRegistry = learningData as unknown as LearningRegistry;
const runtimeRegistry = runtimeData as unknown as RuntimeRegistry;
const lessonBySlug = new Map(
  learningRegistry.lessons.map((lesson) => [lesson.slug, lesson]),
);

if (
  learningRegistry.counts.lessons !== 26
  || learningRegistry.lessons.length !== 26
  || lessonBySlug.size !== 26
) {
  throw new Error("Stage 9 route contract requires exactly 26 unique lesson slugs.");
}

export const dynamicParams = false;

export function generateStaticParams() {
  return learningRegistry.lessons.map((lesson) => ({ slug: lesson.slug }));
}

function resolveLocale(value: string | string[] | undefined): LearningLocale {
  return value === "en" ? "en" : "vi";
}

export async function generateMetadata({
  params,
  searchParams,
}: LessonPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lesson = lessonBySlug.get(slug);
  if (!lesson) notFound();

  const locale = resolveLocale(query.lang);
  const title = lesson.titles[locale];
  const description = lesson.descriptions[locale];

  return {
    title: `${title} · Paper 4 · AlgoCore`,
    description,
    alternates: {
      canonical: `/paper-4/lessons/${lesson.slug}?lang=${locale}`,
      languages: {
        vi: `/paper-4/lessons/${lesson.slug}?lang=vi`,
        en: `/paper-4/lessons/${lesson.slug}?lang=en`,
      },
    },
  };
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lesson = lessonBySlug.get(slug);
  if (!lesson) notFound();

  return (
    <LessonLearningPage
      lesson={lesson}
      lessons={learningRegistry.lessons}
      locale={resolveLocale(query.lang)}
      runtimeRegistry={runtimeRegistry}
    />
  );
}
