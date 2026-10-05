import {
  makePaper2StoredEnvelope,
  paper2DataChecksum,
  paper2LessonReviewStorageKey,
  stableStringify,
  type Paper2LessonReviewRecord,
} from "@/app/lib/paper2/storage-v2";

export const PAPER2_PROGRESS_SCHEMA_VERSION = 1;
export const PAPER2_COURSE_PROGRESS_KEY = "algocore:paper2:course-progress:v1";
export const PAPER2_PROGRESS_EVENT = "algocore:paper2:progress-change";
export const PAPER2_LOCAL_LEARNER_SCOPE_ID = "learner:local-device";

export const PAPER2_LESSON_ANCHORS = [
  "recognise",
  "understand",
  "worked-example",
  "practise",
  "avoid-lost-marks",
  "remember",
] as const;

export type Paper2LessonAnchor = (typeof PAPER2_LESSON_ANCHORS)[number];

const memoryProgress = new Map<string, Paper2LessonAnchor[]>();
let memoryLastVisited: { topicId: string; version: string; anchor?: Paper2LessonAnchor } | null = null;
let sessionOnlyProgress = false;

function memoryKey(topicId: string, version: string) {
  return `${topicId}:${version}`;
}

function markProgressSessionOnly() {
  const changed = !sessionOnlyProgress;
  sessionOnlyProgress = true;
  return changed;
}

export function isPaper2ProgressSessionOnly() {
  return sessionOnlyProgress;
}

export interface Paper2ProgressLesson {
  readonly topicId: string;
  readonly slug: string;
  readonly sectionId: string;
  readonly version: string;
  readonly title: string;
}

export function paper2LessonProgressKey(topicId: string, version: string) {
  return `algocore:paper2:progress:${topicId}:${version}`;
}

export function parsePaper2LessonProgress(value: string | null): Paper2LessonAnchor[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    const candidate = parsed as { schemaVersion?: unknown; anchors?: unknown };
    if (candidate.schemaVersion !== PAPER2_PROGRESS_SCHEMA_VERSION || !Array.isArray(candidate.anchors)) return [];
    return [...new Set(candidate.anchors.filter((anchor): anchor is Paper2LessonAnchor =>
      typeof anchor === "string" && PAPER2_LESSON_ANCHORS.includes(anchor as Paper2LessonAnchor)
    ))];
  } catch {
    return [];
  }
}

export function readPaper2LessonProgress(topicId: string, version: string) {
  const key = memoryKey(topicId, version);
  if (sessionOnlyProgress && memoryProgress.has(key)) return [...(memoryProgress.get(key) ?? [])];
  try {
    const v2 = parsePaper2LessonReview(localStorage.getItem(paper2LessonReviewStorageKey(PAPER2_LOCAL_LEARNER_SCOPE_ID, topicId, version)), topicId, version);
    const anchors = v2 ?? parsePaper2LessonProgress(localStorage.getItem(paper2LessonProgressKey(topicId, version)));
    memoryProgress.set(key, [...anchors]);
    return anchors;
  } catch {
    markProgressSessionOnly();
    return [...(memoryProgress.get(key) ?? [])];
  }
}

export function savePaper2LessonProgress(topicId: string, version: string, anchors: readonly Paper2LessonAnchor[]) {
  const unique = [...new Set(anchors.filter((anchor) => PAPER2_LESSON_ANCHORS.includes(anchor)))];
  memoryProgress.set(memoryKey(topicId, version), unique);
  const record: Paper2LessonReviewRecord = {
    schemaVersion: 2,
    learnerScopeId: PAPER2_LOCAL_LEARNER_SCOPE_ID,
    topicId,
    lessonVersion: version,
    reviewedAnchors: unique,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(paper2LessonReviewStorageKey(PAPER2_LOCAL_LEARNER_SCOPE_ID, topicId, version), JSON.stringify(makePaper2StoredEnvelope(record)));
    // Retain the v1 mirror for one rollback window, as required by the migration contract.
    localStorage.setItem(paper2LessonProgressKey(topicId, version), JSON.stringify({ schemaVersion: PAPER2_PROGRESS_SCHEMA_VERSION, anchors: unique }));
  } catch {
    markProgressSessionOnly();
  }
  announcePaper2ProgressChange(topicId);
}

export function readPaper2LastVisited() {
  if (sessionOnlyProgress && memoryLastVisited) return { ...memoryLastVisited };
  try {
    const raw = localStorage.getItem(PAPER2_COURSE_PROGRESS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const candidate = parsed as { schemaVersion?: unknown; lastVisited?: unknown };
    if (candidate.schemaVersion !== PAPER2_PROGRESS_SCHEMA_VERSION || !candidate.lastVisited || typeof candidate.lastVisited !== "object") return null;
    const lastVisited = candidate.lastVisited as { topicId?: unknown; version?: unknown; anchor?: unknown };
    const result = typeof lastVisited.topicId === "string" && typeof lastVisited.version === "string"
      ? {
        topicId: lastVisited.topicId,
        version: lastVisited.version,
        anchor: typeof lastVisited.anchor === "string" && PAPER2_LESSON_ANCHORS.includes(lastVisited.anchor as Paper2LessonAnchor)
          ? lastVisited.anchor as Paper2LessonAnchor
          : undefined,
      }
      : null;
    memoryLastVisited = result;
    return result;
  } catch {
    markProgressSessionOnly();
    return memoryLastVisited ? { ...memoryLastVisited } : null;
  }
}

export function rememberPaper2Lesson(topicId: string, version: string, anchor?: Paper2LessonAnchor) {
  memoryLastVisited = { topicId, version, ...(anchor ? { anchor } : {}) };
  try {
    localStorage.setItem(PAPER2_COURSE_PROGRESS_KEY, JSON.stringify({
      schemaVersion: PAPER2_PROGRESS_SCHEMA_VERSION,
      lastVisited: { topicId, version, ...(anchor ? { anchor } : {}) },
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    if (markProgressSessionOnly()) announcePaper2ProgressChange(topicId);
  }
}

export function announcePaper2ProgressChange(topicId: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(PAPER2_PROGRESS_EVENT, { detail: { topicId, sessionOnly: sessionOnlyProgress } }));
}

function parsePaper2LessonReview(raw: string | null, topicId: string, version: string): Paper2LessonAnchor[] | null {
  if (!raw) return null;
  try {
    const envelope: unknown = JSON.parse(raw);
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) return null;
    const candidate = envelope as { schemaVersion?: unknown; checksum?: unknown; data?: unknown };
    if (candidate.schemaVersion !== 2 || typeof candidate.checksum !== "string" || !candidate.data || typeof candidate.data !== "object" || Array.isArray(candidate.data)) return null;
    if (candidate.checksum !== paper2DataChecksum(stableStringify(candidate.data))) return null;
    const data = candidate.data as Partial<Paper2LessonReviewRecord>;
    if (data.schemaVersion !== 2 || data.learnerScopeId !== PAPER2_LOCAL_LEARNER_SCOPE_ID || data.topicId !== topicId || data.lessonVersion !== version || !Array.isArray(data.reviewedAnchors)) return null;
    return [...new Set(data.reviewedAnchors.filter((anchor): anchor is Paper2LessonAnchor => typeof anchor === "string" && PAPER2_LESSON_ANCHORS.includes(anchor as Paper2LessonAnchor)))];
  } catch {
    return null;
  }
}
