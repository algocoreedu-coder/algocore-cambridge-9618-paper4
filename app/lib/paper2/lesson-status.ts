import rawStatus from "@/content/paper2/lesson-status.json";
import studyMap from "@/content/paper2/study-map.json";

export type Paper2LessonState = "candidate" | "reviewed";

export interface Paper2ReviewEvidence {
  readonly academicPre: string;
  readonly academicPost: string;
  readonly visualReview: string;
  readonly codeReview: string;
  readonly qa: string;
}

export interface Paper2LessonStatusRecord {
  readonly topicId: string;
  readonly slug: string;
  readonly version: string;
  readonly contentSha256: string;
  readonly visualManifestSha256: string;
  readonly visualSemanticSha256: string;
  readonly visualRuntimeSha256: string;
  readonly state: Paper2LessonState;
  readonly evidence?: Partial<Paper2ReviewEvidence>;
}

export interface Paper2LessonStatus {
  readonly schemaVersion: 1;
  readonly lessons: readonly Paper2LessonStatusRecord[];
}

const SHA256 = /^[a-f0-9]{64}$/;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9.-]*$/;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EVIDENCE_KEYS = ["academicPre", "academicPost", "visualReview", "codeReview", "qa"] as const;

function safeEvidencePath(value: unknown) {
  return typeof value === "string" && value.length > 0 && value.length <= 300 && !/^(?:[A-Za-z]:[\\/]|[\\/]|file:)/i.test(value) && !value.split(/[\\/]/).includes("..");
}

function assertStatus(value: unknown): asserts value is Paper2LessonStatus {
  if (!value || typeof value !== "object") throw new Error("Paper 2 lesson status must be an object.");
  const candidate = value as { schemaVersion?: unknown; lessons?: unknown };
  if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.lessons)) {
    throw new Error("Paper 2 lesson status must use schemaVersion 1 and a lessons array.");
  }

  const topicIds = new Set<string>();
  const slugs = new Set<string>();
  const catalogTopics = new Map(studyMap.topics.map((topic) => [topic.id, topic.slug]));
  for (const [index, item] of candidate.lessons.entries()) {
    if (!item || typeof item !== "object") throw new Error(`Paper 2 lesson status row ${index} must be an object.`);
    const row = item as Partial<Record<keyof Paper2LessonStatusRecord, unknown>>;
    if (typeof row.topicId !== "string" || !SAFE_ID.test(row.topicId)) throw new Error(`Paper 2 lesson status row ${index} has an invalid topicId.`);
    if (typeof row.slug !== "string" || !SAFE_SLUG.test(row.slug)) throw new Error(`Paper 2 lesson status row ${index} has an invalid slug.`);
    if (typeof row.version !== "string" || row.version.length === 0 || row.version.length > 80) throw new Error(`Paper 2 lesson status row ${index} has an invalid version.`);
    if (typeof row.contentSha256 !== "string" || !SHA256.test(row.contentSha256)) throw new Error(`Paper 2 lesson status row ${index} has an invalid contentSha256.`);
    if (typeof row.visualManifestSha256 !== "string" || !SHA256.test(row.visualManifestSha256)) throw new Error(`Paper 2 lesson status row ${index} has an invalid visualManifestSha256.`);
    if (typeof row.visualSemanticSha256 !== "string" || !SHA256.test(row.visualSemanticSha256)) throw new Error(`Paper 2 lesson status row ${index} has an invalid visualSemanticSha256.`);
    if (typeof row.visualRuntimeSha256 !== "string" || !SHA256.test(row.visualRuntimeSha256)) throw new Error(`Paper 2 lesson status row ${index} has an invalid visualRuntimeSha256.`);
    if (row.state !== "candidate" && row.state !== "reviewed") throw new Error(`Paper 2 lesson status row ${index} has an invalid state.`);
    const evidence = row.evidence;
    if (evidence !== undefined && (!evidence || typeof evidence !== "object" || Array.isArray(evidence))) throw new Error(`Paper 2 lesson status row ${index} has invalid review evidence.`);
    if (evidence && typeof evidence === "object") {
      for (const [key, value] of Object.entries(evidence)) {
        if (!EVIDENCE_KEYS.includes(key as (typeof EVIDENCE_KEYS)[number]) || !safeEvidencePath(value)) throw new Error(`Paper 2 lesson status row ${index} has invalid ${key} evidence.`);
      }
    }
    if (row.state === "reviewed" && (!evidence || EVIDENCE_KEYS.some((key) => !safeEvidencePath((evidence as Record<string, unknown>)[key])))) {
      throw new Error(`Reviewed Paper 2 lesson ${row.topicId} requires academicPre, academicPost, visualReview, codeReview and qa evidence paths.`);
    }
    if (catalogTopics.get(row.topicId) !== row.slug) throw new Error(`Paper 2 lesson status row ${index} does not match the Study Map topic/slug pair.`);
    if (topicIds.has(row.topicId)) throw new Error(`Paper 2 lesson status contains duplicate topicId ${row.topicId}.`);
    if (slugs.has(row.slug)) throw new Error(`Paper 2 lesson status contains duplicate slug ${row.slug}.`);
    topicIds.add(row.topicId);
    slugs.add(row.slug);
  }
}

assertStatus(rawStatus);

export const paper2LessonStatus: Paper2LessonStatus = rawStatus;

export function getPaper2LessonStatusBySlug(slug: string) {
  return paper2LessonStatus.lessons.find((item) => item.slug === slug);
}

export function getPaper2LessonStatusByTopicId(topicId: string) {
  return paper2LessonStatus.lessons.find((item) => item.topicId === topicId);
}
