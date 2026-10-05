import { isPaper2StableId, isRecord } from "./coverage-types";
import {
  PAPER2_STORAGE_SCHEMA_VERSION,
  makePaper2StoredEnvelope,
  paper2DataChecksum,
  paper2LessonReviewStorageKey,
  paper2MigrationStorageKey,
  paper2StorageIndexKey,
  stableStringify,
  type Paper2LessonReviewRecord,
  type Paper2StorageIndex,
  type Paper2StorageLike,
} from "./storage-v2";

export const PAPER2_LEGACY_COURSE_PROGRESS_KEY = "algocore:paper2:course-progress:v1";
export const PAPER2_LEGACY_PROGRESS_PREFIX = "algocore:paper2:progress:";
export const PAPER2_V1_LESSON_ANCHORS = [
  "recognise",
  "understand",
  "worked-example",
  "practise",
  "avoid-lost-marks",
  "remember",
] as const;

export interface Paper2LegacyLessonSnapshot {
  readonly key: string;
  readonly topicId: string;
  readonly lessonVersion: string;
  readonly raw: string | null;
}

export interface Paper2V1StorageSnapshot {
  readonly courseProgressRaw: string | null;
  readonly lessonRecords: readonly Paper2LegacyLessonSnapshot[];
}

export interface Paper2MigrationQuarantine {
  readonly legacyKey: string;
  readonly code: string;
  readonly raw: string | null;
}

export interface Paper2MigrationJournal {
  readonly schemaVersion: 2;
  readonly migrationId: "paper2-v1-to-v2";
  readonly status: "complete";
  readonly learnerScopeId: string;
  readonly completedAt: string;
  readonly migratedLessonKeys: readonly string[];
  readonly quarantinedLegacyKeys: readonly string[];
  readonly retainedLegacyKeys: readonly string[];
  readonly sourceChecksum: string;
  readonly lastVisited?: { readonly topicId: string; readonly version: string };
}

export interface Paper2V1MigrationPlan {
  readonly code: "MIGRATION_REQUIRED" | "MIGRATION_ALREADY_COMPLETE";
  readonly learnerScopeId: string;
  readonly lessonReviews: readonly Paper2LessonReviewRecord[];
  readonly quarantines: readonly Paper2MigrationQuarantine[];
  readonly retainedLegacyKeys: readonly string[];
  readonly lastVisited?: { readonly topicId: string; readonly version: string };
  readonly sourceChecksum: string;
  readonly completedJournal?: Paper2MigrationJournal;
}

export type Paper2MigrationExecutionResult =
  | { readonly ok: true; readonly code: "MIGRATION_COMPLETE" | "MIGRATION_IDEMPOTENT"; readonly journal: Paper2MigrationJournal; readonly quarantines: readonly Paper2MigrationQuarantine[] }
  | { readonly ok: false; readonly code: string; readonly message: string; readonly quarantines: readonly Paper2MigrationQuarantine[] };

export function planPaper2V1Migration(
  snapshot: Paper2V1StorageSnapshot,
  learnerScopeId: string,
  nowIso: string,
  completedJournal?: Paper2MigrationJournal | null,
): Paper2V1MigrationPlan {
  assertMigrationInputs(learnerScopeId, nowIso);
  const sourceChecksum = paper2DataChecksum(stableStringify(snapshot));
  if (completedJournal?.status === "complete") {
    return {
      code: "MIGRATION_ALREADY_COMPLETE",
      learnerScopeId,
      lessonReviews: [],
      quarantines: [],
      retainedLegacyKeys: completedJournal.retainedLegacyKeys,
      lastVisited: completedJournal.lastVisited,
      sourceChecksum,
      completedJournal,
    };
  }

  const lessonReviews: Paper2LessonReviewRecord[] = [];
  const quarantines: Paper2MigrationQuarantine[] = [];
  const retainedLegacyKeys = new Set<string>();
  let lastVisited: { topicId: string; version: string } | undefined;

  if (snapshot.courseProgressRaw !== null) {
    retainedLegacyKeys.add(PAPER2_LEGACY_COURSE_PROGRESS_KEY);
    const result = parseLegacyCourseProgress(snapshot.courseProgressRaw);
    if (result.ok) lastVisited = result.lastVisited;
    else quarantines.push({ legacyKey: PAPER2_LEGACY_COURSE_PROGRESS_KEY, code: result.code, raw: snapshot.courseProgressRaw });
  }

  for (const legacy of snapshot.lessonRecords) {
    retainedLegacyKeys.add(legacy.key);
    if (!isExpectedLegacyLessonKey(legacy)) {
      quarantines.push({ legacyKey: legacy.key, code: "MIGRATION_LEGACY_IDENTITY_INVALID", raw: legacy.raw });
      continue;
    }
    const result = parseLegacyLessonProgress(legacy.raw);
    if (!result.ok) {
      quarantines.push({ legacyKey: legacy.key, code: result.code, raw: legacy.raw });
      continue;
    }
    lessonReviews.push({
      schemaVersion: PAPER2_STORAGE_SCHEMA_VERSION,
      learnerScopeId,
      topicId: legacy.topicId,
      lessonVersion: legacy.lessonVersion,
      reviewedAnchors: result.anchors,
      updatedAt: nowIso,
    });
  }

  const uniqueReviews = deduplicateLessonReviews(lessonReviews, quarantines);
  return {
    code: "MIGRATION_REQUIRED",
    learnerScopeId,
    lessonReviews: uniqueReviews,
    quarantines,
    retainedLegacyKeys: [...retainedLegacyKeys].sort(),
    lastVisited,
    sourceChecksum,
  };
}

export const migratePaper2V1Snapshot = planPaper2V1Migration;

export function executePaper2V1Migration(
  storage: Paper2StorageLike,
  snapshot: Paper2V1StorageSnapshot,
  learnerScopeId: string,
  nowIso: string,
): Paper2MigrationExecutionResult {
  const journalKey = paper2MigrationStorageKey(learnerScopeId);
  const existingJournal = readMigrationJournal(storage, journalKey);
  if (existingJournal.ok && existingJournal.journal) {
    return { ok: true, code: "MIGRATION_IDEMPOTENT", journal: existingJournal.journal, quarantines: [] };
  }
  if (!existingJournal.ok) return { ok: false, code: existingJournal.code, message: existingJournal.message, quarantines: [] };

  let plan: Paper2V1MigrationPlan;
  try {
    plan = planPaper2V1Migration(snapshot, learnerScopeId, nowIso);
  } catch (error) {
    return { ok: false, code: "MIGRATION_INPUT_INVALID", message: error instanceof Error ? error.message : "Invalid migration input.", quarantines: [] };
  }
  const tempKeys: string[] = [];
  const finalKeys: string[] = [];
  try {
    for (const review of plan.lessonReviews) {
      const finalKey = paper2LessonReviewStorageKey(learnerScopeId, review.topicId, review.lessonVersion);
      const tempKey = `${finalKey}:migration-tmp`;
      const serialized = JSON.stringify(makePaper2StoredEnvelope(review));
      storage.setItem(tempKey, serialized);
      tempKeys.push(tempKey);
      if (storage.getItem(tempKey) !== serialized) throw new MigrationError("MIGRATION_TEMP_VERIFY_FAILED", `Read-back failed for ${tempKey}.`);
      finalKeys.push(finalKey);
    }

    for (let index = 0; index < plan.lessonReviews.length; index += 1) {
      const serialized = storage.getItem(tempKeys[index]);
      if (serialized === null) throw new MigrationError("MIGRATION_TEMP_MISSING", `Temporary record disappeared: ${tempKeys[index]}.`);
      storage.setItem(finalKeys[index], serialized);
      if (storage.getItem(finalKeys[index]) !== serialized) throw new MigrationError("MIGRATION_FINAL_VERIFY_FAILED", `Final read-back failed for ${finalKeys[index]}.`);
    }

    const indexRecord: Paper2StorageIndex = {
      schemaVersion: PAPER2_STORAGE_SCHEMA_VERSION,
      learnerScopeId,
      attemptIds: [],
      lessonReviewKeys: [...finalKeys].sort(),
      updatedAt: nowIso,
    };
    storage.setItem(paper2StorageIndexKey(learnerScopeId), JSON.stringify(makePaper2StoredEnvelope(indexRecord)));

    const journal: Paper2MigrationJournal = {
      schemaVersion: PAPER2_STORAGE_SCHEMA_VERSION,
      migrationId: "paper2-v1-to-v2",
      status: "complete",
      learnerScopeId,
      completedAt: nowIso,
      migratedLessonKeys: [...finalKeys].sort(),
      quarantinedLegacyKeys: plan.quarantines.map((item) => item.legacyKey).sort(),
      retainedLegacyKeys: plan.retainedLegacyKeys,
      sourceChecksum: plan.sourceChecksum,
      ...(plan.lastVisited ? { lastVisited: plan.lastVisited } : {}),
    };
    const serializedJournal = JSON.stringify(makePaper2StoredEnvelope(journal));
    storage.setItem(journalKey, serializedJournal);
    if (storage.getItem(journalKey) !== serializedJournal) throw new MigrationError("MIGRATION_JOURNAL_VERIFY_FAILED", "Migration journal failed read-back verification.");
    tempKeys.forEach((key) => storage.removeItem(key));
    return { ok: true, code: "MIGRATION_COMPLETE", journal, quarantines: plan.quarantines };
  } catch (error) {
    tempKeys.forEach((key) => { try { storage.removeItem(key); } catch { /* Preserve original failure. */ } });
    const code = error instanceof MigrationError ? error.code : "MIGRATION_STORAGE_FAILED";
    return { ok: false, code, message: error instanceof Error ? error.message : "Migration storage operation failed.", quarantines: plan.quarantines };
  }
}

export function parseLegacyLessonProgress(raw: string | null):
  | { readonly ok: true; readonly anchors: readonly string[] }
  | { readonly ok: false; readonly code: string } {
  if (raw === null) return { ok: true, anchors: [] };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { ok: false, code: "MIGRATION_LEGACY_JSON_CORRUPT" }; }
  if (!isRecord(value)) return { ok: false, code: "MIGRATION_LEGACY_RECORD_INVALID" };
  if (value.schemaVersion !== 1) return { ok: false, code: "MIGRATION_LEGACY_SCHEMA_UNKNOWN" };
  if (!Array.isArray(value.anchors)) return { ok: false, code: "MIGRATION_LEGACY_ANCHORS_INVALID" };
  const anchors = [...new Set(value.anchors.filter((anchor): anchor is string => typeof anchor === "string" && PAPER2_V1_LESSON_ANCHORS.includes(anchor as (typeof PAPER2_V1_LESSON_ANCHORS)[number])))];
  return { ok: true, anchors };
}

export function parseLegacyCourseProgress(raw: string):
  | { readonly ok: true; readonly lastVisited?: { readonly topicId: string; readonly version: string } }
  | { readonly ok: false; readonly code: string } {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { ok: false, code: "MIGRATION_COURSE_JSON_CORRUPT" }; }
  if (!isRecord(value) || value.schemaVersion !== 1) return { ok: false, code: "MIGRATION_COURSE_SCHEMA_UNKNOWN" };
  if (value.lastVisited === undefined || value.lastVisited === null) return { ok: true };
  if (!isRecord(value.lastVisited) || !isPaper2StableId(value.lastVisited.topicId) || typeof value.lastVisited.version !== "string" || value.lastVisited.version.trim().length === 0) return { ok: false, code: "MIGRATION_LAST_VISITED_INVALID" };
  return { ok: true, lastVisited: { topicId: value.lastVisited.topicId, version: value.lastVisited.version } };
}

function readMigrationJournal(storage: Paper2StorageLike, key: string):
  | { readonly ok: true; readonly journal: Paper2MigrationJournal | null }
  | { readonly ok: false; readonly code: string; readonly message: string } {
  let raw: string | null;
  try { raw = storage.getItem(key); } catch (error) { return { ok: false, code: "MIGRATION_JOURNAL_READ_FAILED", message: error instanceof Error ? error.message : "Journal read failed." }; }
  if (raw === null) return { ok: true, journal: null };
  let envelope: unknown;
  try { envelope = JSON.parse(raw); } catch { return { ok: false, code: "MIGRATION_JOURNAL_CORRUPT", message: "Migration journal is corrupt." }; }
  if (!isRecord(envelope) || envelope.schemaVersion !== 2 || envelope.checksumAlgorithm !== "fnv1a32" || typeof envelope.checksum !== "string" || !isRecord(envelope.data)) return { ok: false, code: "MIGRATION_JOURNAL_INVALID", message: "Migration journal envelope is invalid." };
  if (envelope.checksum !== paper2DataChecksum(stableStringify(envelope.data))) return { ok: false, code: "MIGRATION_JOURNAL_CHECKSUM", message: "Migration journal checksum failed." };
  const data = envelope.data;
  if (data.schemaVersion !== 2 || data.migrationId !== "paper2-v1-to-v2" || data.status !== "complete") return { ok: false, code: "MIGRATION_JOURNAL_UNSUPPORTED", message: "Migration journal version is unsupported." };
  return { ok: true, journal: data as unknown as Paper2MigrationJournal };
}

function isExpectedLegacyLessonKey(record: Paper2LegacyLessonSnapshot) {
  if (!isPaper2StableId(record.topicId) || typeof record.lessonVersion !== "string" || record.lessonVersion.trim().length === 0) return false;
  return record.key === `${PAPER2_LEGACY_PROGRESS_PREFIX}${record.topicId}:${record.lessonVersion}`;
}

function deduplicateLessonReviews(reviews: readonly Paper2LessonReviewRecord[], quarantines: Paper2MigrationQuarantine[]) {
  const result = new Map<string, Paper2LessonReviewRecord>();
  for (const review of reviews) {
    const key = `${review.topicId}@${review.lessonVersion}`;
    const current = result.get(key);
    if (!current) {
      result.set(key, review);
      continue;
    }
    if (stableStringify(current.reviewedAnchors) !== stableStringify(review.reviewedAnchors)) {
      quarantines.push({ legacyKey: `${PAPER2_LEGACY_PROGRESS_PREFIX}${review.topicId}:${review.lessonVersion}`, code: "MIGRATION_DUPLICATE_CONFLICT", raw: null });
      result.delete(key);
    }
  }
  return [...result.values()].sort((a, b) => `${a.topicId}@${a.lessonVersion}`.localeCompare(`${b.topicId}@${b.lessonVersion}`));
}

function assertMigrationInputs(learnerScopeId: string, nowIso: string) {
  if (!isPaper2StableId(learnerScopeId)) throw new Error("Invalid learner scope ID.");
  if (!Number.isFinite(Date.parse(nowIso))) throw new Error("Migration timestamp is invalid.");
}

class MigrationError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
  }
}
