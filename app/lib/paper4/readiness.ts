import readinessData from "@/content/paper4/release/lesson-release-decisions.json";

export type Paper4TopicState = "TOPIC_CANDIDATE" | "TOPIC_READY" | "WITHHELD";
export type Paper4PaperState = "PAPER_CANDIDATE" | "PAPER_READY" | "WITHHELD";

type ReadinessLessonRecord = Readonly<{
  slug: string;
  release_allowed: boolean;
  topic_ready: boolean;
  topic_state: Paper4TopicState;
  topic_blockers: readonly string[];
}>;

type ReadinessRegistry = Readonly<{
  schema_version: string;
  readiness_contract: Readonly<{
    schema_version: "paper4-readiness-contract-v1";
    topic_ready_rule: string;
    paper_ready_rule: string;
    paper_ready: boolean;
    paper_state: Paper4PaperState;
    paper_blockers: readonly string[];
  }>;
  lessons: readonly ReadinessLessonRecord[];
}>;

const registry = readinessData as unknown as ReadinessRegistry;

if (registry.readiness_contract?.schema_version !== "paper4-readiness-contract-v1") {
  throw new Error("Paper 4 readiness contract is missing or unsupported.");
}

const lessonReadinessBySlug = new Map(registry.lessons.map((lesson) => [lesson.slug, lesson]));

if (lessonReadinessBySlug.size !== 26) {
  throw new Error("Paper 4 readiness registry requires exactly 26 unique lesson slugs.");
}

export const paper4Readiness = Object.freeze({
  paperReady: registry.readiness_contract.paper_ready,
  paperState: registry.readiness_contract.paper_state,
  paperBlockers: registry.readiness_contract.paper_blockers,
});

export function getPaper4LessonReadiness(slug: string) {
  const lesson = lessonReadinessBySlug.get(slug);
  if (!lesson) throw new Error(`Paper 4 readiness record is missing for ${slug}.`);
  return Object.freeze({
    accessAllowed: lesson.release_allowed,
    topicReady: lesson.topic_ready,
    topicState: lesson.topic_state,
    blockers: lesson.topic_blockers,
  });
}
