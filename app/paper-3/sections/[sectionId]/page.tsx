import { notFound } from "next/navigation";
import { SectionOverview } from "@/app/components/paper3-learning/SectionOverview";
import { getCatalog, resolveLocale, type PageQuery } from "@/app/lib/paper3/catalog";

export default async function SectionPage({ params, searchParams }: {
  readonly params: Promise<{ sectionId: string }>;
  readonly searchParams: Promise<PageQuery>;
}) {
  const [{ sectionId }, query] = await Promise.all([params, searchParams]);
  const catalog = getCatalog();
  if (!catalog.sections.some((section) => section.id === sectionId)) notFound();
  return <SectionOverview catalog={catalog} sectionId={sectionId} locale={resolveLocale(query)} />;
}
