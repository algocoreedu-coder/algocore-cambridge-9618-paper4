import data from "@/content/paper2/study-map.json";
import type { StudyMapCatalog, Locale, PageQuery } from "./types";
export type { StudyMapCatalog, Strand, Section, Topic, Relationship, Locale, Localized, LearningMode, PageQuery } from "./types";
export function resolveLocale(query: PageQuery): Locale {
  const value = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return value === "vi" ? "vi" : "en";
}
export function paper2Href(path: string, locale: Locale): string {
  const [beforeHash, hash] = path.split("#", 2);
  const [pathname, search] = beforeHash.split("?", 2);
  const params = new URLSearchParams(search);
  params.set("lang", locale);
  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ""}`;
}
export function getSectionTopics(catalog: StudyMapCatalog, sectionId: string) {
  return catalog.topics.filter(topic => topic.sectionId === sectionId);
}
