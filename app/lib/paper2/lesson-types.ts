import type { LearningMode, Localized } from "./types";

export interface LessonSource {
  readonly id: string;
  readonly title: string;
  readonly locator: string;
  readonly kind: "syllabus" | "book" | "guide" | "question-paper" | "mark-scheme" | "teacher-authored";
  readonly url?: string;
}

export interface TheoryBlock {
  readonly id: string;
  readonly title: Localized;
  readonly paragraphs: readonly Localized[];
  readonly bullets?: readonly Localized[];
  readonly table?: {
    readonly headers: readonly Localized[];
    readonly rows: readonly (readonly Localized[])[];
  };
  readonly sourceIds: readonly string[];
}

export interface WorkedStep {
  readonly id: string;
  readonly action: Localized;
  readonly why: Localized;
  readonly result: Localized;
  readonly check?: Localized;
}

export interface WorkedExample {
  readonly id: string;
  readonly title: Localized;
  readonly prompt: Localized;
  readonly origin: "algocore-authored" | "adapted-from-source";
  readonly officialMarks: null;
  readonly steps: readonly WorkedStep[];
  readonly answer: Localized;
  readonly selfCheck: Localized;
  readonly sourceIds: readonly string[];
}

export interface PracticeTask {
  readonly id: string;
  readonly title: Localized;
  readonly prompt: Localized;
  readonly working: readonly Localized[];
  readonly answer: Localized;
  readonly markGuidance: readonly Localized[];
  readonly commonMistakes: readonly Localized[];
  readonly selfCheck: Localized;
  readonly origin: "algocore-authored" | "adapted-from-source";
  readonly officialMarks: null;
  readonly sourceIds: readonly string[];
}

export interface Paper2Lesson {
  readonly schemaVersion: 1;
  readonly version: string;
  readonly topicId: string;
  readonly sectionId: string;
  readonly slug: string;
  readonly learningMode: LearningMode;
  readonly estimatedMinutes?: number;
  readonly title: Localized;
  readonly question: Localized;
  readonly opening: Localized;
  readonly objectives: readonly Localized[];
  readonly prerequisites: readonly { readonly title: Localized; readonly reason: Localized }[];
  readonly glossary: readonly { readonly term: string; readonly meaning: Localized }[];
  readonly recognition: {
    readonly cues: readonly Localized[];
    readonly misleadingCues: readonly Localized[];
    readonly answerProduct: Localized;
    readonly method: readonly Localized[];
  };
  readonly theory: readonly TheoryBlock[];
  readonly visual: {
    readonly assetIds: readonly string[];
    readonly title: Localized;
    readonly introduction: Localized;
    readonly task: Localized;
    readonly conventions: readonly Localized[];
    readonly sourceIds: readonly string[];
  };
  readonly workedExamples: readonly WorkedExample[];
  readonly practices: readonly PracticeTask[];
  readonly misconceptions: readonly {
    readonly mistake: Localized;
    readonly correction: Localized;
    readonly selfCheck: Localized;
  }[];
  readonly recall: {
    readonly prompt: Localized;
    readonly answerPoints: readonly Localized[];
  };
  readonly takeaways: readonly Localized[];
  readonly patternLinks: readonly {
    readonly id: string;
    readonly role: "owner" | "related";
    readonly title: Localized;
  }[];
  readonly relatedSlugs: readonly string[];
  readonly sources: readonly LessonSource[];
}

