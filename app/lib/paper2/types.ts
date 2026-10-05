export type Locale = "en" | "vi";
export type Localized = { readonly en: string; readonly vi: string };
export type LearningMode = "explanation" | "diagram" | "procedural" | "testing";
export interface Strand {
  readonly id: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly sectionIds: readonly string[];
}
export interface Section {
  readonly id: string;
  readonly strandId: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly question: Localized;
  readonly objectives: readonly Localized[];
  readonly topicIds: readonly string[];
  readonly mapAssetId: string;
}
export interface Topic {
  readonly id: string;
  readonly slug: string;
  readonly sectionId: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly learningMode: LearningMode;
  readonly learningObjectives: readonly Localized[];
  readonly prerequisites: readonly string[];
  readonly searchTerms: readonly string[];
  readonly visualIds: readonly string[];
  readonly status: "planned" | "available";
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
    readonly paper: 2;
    readonly durationMinutes: number;
    readonly marks: number;
  };
  readonly strands: readonly Strand[];
  readonly sections: readonly Section[];
  readonly topics: readonly Topic[];
  readonly relationships: readonly Relationship[];
}
export type PageQuery = Record<string, string | string[] | undefined>;
