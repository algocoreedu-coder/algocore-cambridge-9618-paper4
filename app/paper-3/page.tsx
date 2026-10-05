import { StudyMap } from "@/app/components/paper3-learning/StudyMap";
import { getCatalog, resolveLocale, type PageQuery } from "@/app/lib/paper3/catalog";

export default async function Paper3Page({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  return <StudyMap catalog={getCatalog()} locale={resolveLocale(await searchParams)} />;
}
