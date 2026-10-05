import { notFound } from "next/navigation";
import { SectionOverview } from "@/app/components/paper2-learning/SectionOverview";
import { resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import { getCatalog } from "@/app/lib/paper2/catalog-server";

type Props = { readonly params: Promise<{ sectionId: string }>; readonly searchParams: Promise<PageQuery> };
export async function generateMetadata({ params, searchParams }: Props) {
  const { sectionId } = await params;
  const current = getCatalog().sections.find(item => item.id === sectionId);
  return { title: current ? `${current.id} · ${current.title[resolveLocale(await searchParams)]}` : "Section not found" };
}
export default async function Paper2Section({ params, searchParams }: Props) {
  const { sectionId } = await params;
  const catalog = getCatalog();
  const section = catalog.sections.find(item => item.id === sectionId);
  if (!section) notFound();
  return <SectionOverview catalog={catalog} section={section} locale={resolveLocale(await searchParams)} />;
}
