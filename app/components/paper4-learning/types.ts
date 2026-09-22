export type LearningLocale = "vi" | "en";

export type Localized<T = string> = Readonly<Record<LearningLocale, T>>;

export type LearningBlockKind =
  | "recognition"
  | "exam-cues"
  | "knowledge"
  | "method"
  | "worked-example"
  | "action-view"
  | "marking-pitfalls"
  | "practice"
  | "retrieval"
  | "next-and-sources";

export type LearningSourceReference = Readonly<{
  sourceId?: string;
  source_id?: string;
  authority?: string;
  label?: Localized;
  locator?: string;
  citation?: string;
  status?: string;
  accessMode?: "internal-citation" | "verified-external";
  access_mode?: "internal-citation" | "verified-external";
  externalUrl?: string;
  external_url?: string;
  url?: string;
  urlVerified?: boolean;
  url_verified?: boolean;
  [key: string]: unknown;
}>;

export interface LearningContentMap {
  readonly [key: string]: LearningContent;
}

export interface LearningContentList extends ReadonlyArray<LearningContent> {}

export type LearningContent = string | number | boolean | LearningContentList | LearningContentMap;

export type LearningBlock = Readonly<{
  blockId: string;
  kind: LearningBlockKind;
  anchor: string;
  content: Localized<LearningContent>;
  sourceRefs: readonly (LearningSourceReference | string)[];
  authority?: string;
}>;

export type LearningPackage = Readonly<{
  packageId: string;
  titles: Localized;
  lessonIds: readonly string[];
  [key: string]: unknown;
}>;

export type LearningLesson = Readonly<{
  lessonId: string;
  packageId: string;
  slug: string;
  version: string;
  titles: Localized;
  descriptions: Localized;
  patternIds: readonly string[];
  prerequisiteLessonIds: readonly string[];
  nextLessonIds: readonly string[];
  blocks: readonly LearningBlock[];
  actionView?: Readonly<{
    patternIds: readonly string[];
    mode?: "stage8-runtime" | "conceptual-no-runtime-pattern" | string;
  }>;
  provenance: readonly Readonly<{ path: string; sha256: string }>[];
}>;

export type LearningRegistry = Readonly<{
  schemaVersion: string;
  releaseInputs: unknown;
  counts: Readonly<{
    packages: number;
    lessons: number;
    patterns: number;
    blocks: number;
    [key: string]: number;
  }>;
  packages: readonly LearningPackage[];
  lessons: readonly LearningLesson[];
}>;
