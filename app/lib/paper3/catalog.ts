import catalogData from "@/content/paper3/study-map.json";
import lessonStatus from "@/content/paper3/lesson-status.json";

export type Locale = "en" | "vi";
export type Localized = { readonly en: string; readonly vi: string };
export type LearningMode = "concept" | "process" | "calculation" | "logic" | "algorithm" | "programming";

export interface Section {
  readonly id: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly question: Localized;
  readonly strandIds: readonly string[];
}

export interface Strand {
  readonly id: string;
  readonly sectionId: string;
  readonly title: Localized;
}

export interface Topic {
  readonly id: string;
  readonly slug: string;
  readonly strandId: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly learningMode: LearningMode;
  readonly status: "planned" | "available";
  readonly searchTerms?: readonly string[];
}

export interface Relationship {
  readonly fromSectionId: string;
  readonly toSectionId: string;
  readonly label: Localized;
  readonly kind: "foundation" | "connection";
}

export interface StudyMapCatalog {
  readonly course: {
    readonly title: Localized;
    readonly examYear: number;
    readonly syllabusVersion: number;
    readonly paper: 3;
    readonly durationMinutes: number;
    readonly marks: number;
  };
  readonly sections: readonly Section[];
  readonly strands: readonly Strand[];
  readonly topics: readonly Topic[];
  readonly relationships: readonly Relationship[];
}

// This catalog contains navigation metadata only. A planned topic is not a lesson.
export function getCatalog(): StudyMapCatalog {
  const reviewed = new Set((lessonStatus.lessons as { topicId: string; state: string }[]).filter(item => item.state === "reviewed").map(item => item.topicId));
  return { ...catalogData, topics: catalogData.topics.map(topic => ({ ...topic, status: reviewed.has(topic.id) ? "available" : "planned" })) } as StudyMapCatalog;
}

export type PageQuery = Record<string, string | string[] | undefined>;

export function resolveLocale(query: PageQuery): Locale {
  const value = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return value === "vi" ? "vi" : "en";
}
