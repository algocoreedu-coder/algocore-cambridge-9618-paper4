import type { Localized } from "./catalog";

export type VisualKind =
  | "enumeration"
  | "pointers"
  | "sets"
  | "records"
  | "file-organisation"
  | "hashing"
  | "collisions"
  | "floating-conversion"
  | "normalisation"
  | "precision-range"
  | "rounding-errors"
  | "tcp-ip-stack"
  | "application-protocols"
  | "bittorrent"
  | "packet-routing"
  | "switching-methods"
  | "risc-cisc"
  | "pipeline-registers-interrupts"
  | "flynn-parallelism"
  | "virtual-machines"
  | "logic-circuit"
  | "adders"
  | "sr-jk-flip-flops"
  | "boolean-simplification"
  | "karnaugh-map"
  | "cpu-scheduling"
  | "rpn-stack"
  | "process-states"
  | "kernel-interrupts"
  | "memory-addressing"
  | "page-replacement"
  | "translation-workflows"
  | "compilation-pipeline"
  | "bnf-explorer"
  | "key-ownership"
  | "quantum-key-distribution"
  | "tls-session"
  | "certificate-signature"
  | "dijkstra-search"
  | "astar-search"
  | "learning-categories"
  | "neural-network"
  | "backpropagation"
  | "regression"
  | "linear-search"
  | "binary-search"
  | "bubble-sort"
  | "insertion-sort"
  | "stack-adt"
  | "queue-adt"
  | "linked-list"
  | "binary-tree"
  | "dictionary"
  | "adt-implementation"
  | "complexity-comparator"
  | "recursion-trace"
  | "call-stack-unwinding"
  | "paradigm-procedural"
  | "addressing-modes"
  | "assembly-workbench"
  | "oop-encapsulation"
  | "oop-relationships"
  | "declarative-inference"
  | "sequential-files"
  | "random-files"
  | "exception-flow";

export interface LessonSource {
  readonly id: string;
  readonly title: string;
  readonly locator: string;
  readonly kind: "syllabus" | "book" | "guide" | "question-paper" | "mark-scheme";
  readonly url?: string;
}

export interface TheoryBlock {
  readonly id: string;
  readonly title: Localized;
  readonly paragraphs: readonly Localized[];
  readonly bullets?: readonly Localized[];
  readonly code?: string;
  readonly table?: { readonly headers: readonly Localized[]; readonly rows: readonly (readonly Localized[])[] };
  readonly sourceIds: readonly string[];
}

export interface WorkedStep {
  readonly id: string;
  readonly action: Localized;
  readonly why: Localized;
  readonly result: Localized;
  readonly check?: Localized;
  readonly code?: string;
}

export interface Checkpoint {
  readonly id: string;
  readonly prompt: Localized;
  readonly transfer: boolean;
  readonly choices: readonly { readonly id: string; readonly label: Localized; readonly feedback: Localized }[];
  readonly correctChoiceId: string;
  readonly explanation: Localized;
}

/** Authoring data, not a claim of public release or student mastery. */
export interface Paper3Lesson {
  readonly schemaVersion: 1;
  readonly version: string;
  readonly topicId: string;
  readonly slug: string;
  /** AlgoCore authoring estimate; this is not a Cambridge assessment claim. */
  readonly estimatedMinutes?: number;
  readonly title: Localized;
  readonly question: Localized;
  readonly opening: Localized;
  readonly objectives: readonly Localized[];
  readonly prerequisites: readonly Localized[];
  readonly glossary: readonly { readonly term: string; readonly meaning: Localized }[];
  readonly theory: readonly TheoryBlock[];
  readonly visual: {
    readonly kind: VisualKind;
    readonly title: Localized;
    readonly introduction: Localized;
    readonly task: Localized;
    readonly conventions: readonly Localized[];
    readonly sourceIds: readonly string[];
  };
  readonly workedExample: {
    readonly title: Localized;
    readonly prompt: Localized;
    readonly origin: "algocore-authored";
    readonly officialMarks: null;
    readonly steps: readonly WorkedStep[];
    readonly result: Localized;
    readonly selfCheck: Localized;
    readonly sourceIds: readonly string[];
  };
  readonly recognition: {
    readonly cues: readonly Localized[];
    readonly distinguish: Localized;
    readonly method: readonly Localized[];
    /** Cambridge command words with topic-specific answer guidance. */
    readonly commandWords?: readonly {
      readonly command: "describe" | "write" | "explain" | "trace" | "compare" | "justify";
      readonly guidance: Localized;
    }[];
  };
  readonly misconceptions: readonly { readonly mistake: Localized; readonly correction: Localized; readonly selfCheck?: Localized }[];
  readonly checkpoints: readonly Checkpoint[];
  readonly recall: { readonly prompt: Localized; readonly answerPoints: readonly Localized[] };
  readonly takeaways: readonly Localized[];
  readonly relatedSlugs: readonly string[];
  readonly sources: readonly LessonSource[];
}
