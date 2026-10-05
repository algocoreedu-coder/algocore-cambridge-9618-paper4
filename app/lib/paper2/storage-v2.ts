import {
  PAPER2_ATTEMPT_SCHEMA_VERSION,
  transitionPaper2Attempt,
  validatePaper2Attempt,
  type Paper2AttemptRecord,
} from "./attempt-types";
import { isPaper2StableId, isRecord } from "./coverage-types";

export const PAPER2_STORAGE_SCHEMA_VERSION = 2 as const;
export const PAPER2_STORAGE_NAMESPACE = "algocore:paper2:v2";
export const PAPER2_STORAGE_EXPORT_KIND = "algocore-paper2-local-export" as const;

export interface Paper2StorageLike {
  readonly length?: number;
  key?(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface Paper2StoredEnvelope<T> {
  readonly schemaVersion: 2;
  readonly checksumAlgorithm: "fnv1a32";
  readonly checksum: string;
  readonly data: T;
}

export interface Paper2LessonReviewRecord {
  readonly schemaVersion: 2;
  readonly learnerScopeId: string;
  readonly topicId: string;
  readonly lessonVersion: string;
  readonly reviewedAnchors: readonly string[];
  readonly updatedAt: string;
}

export interface Paper2StorageIndex {
  readonly schemaVersion: 2;
  readonly learnerScopeId: string;
  readonly attemptIds: readonly string[];
  readonly lessonReviewKeys: readonly string[];
  readonly updatedAt: string;
}

export type Paper2StorageReadResult<T> =
  | { readonly ok: true; readonly value: T | null; readonly code: "STORAGE_READ_OK" | "STORAGE_NOT_FOUND" }
  | { readonly ok: false; readonly code: string; readonly raw?: string; readonly message: string };

export type Paper2StorageWriteResult =
  | { readonly ok: true; readonly code: "STORAGE_SAVED" | "STORAGE_IDEMPOTENT" }
  | { readonly ok: false; readonly code: string; readonly message: string; readonly recoveryRequired: boolean };

export interface Paper2AttemptRepository {
  readonly persistent: boolean;
  loadAttempt(attemptId: string): Paper2StorageReadResult<Paper2AttemptRecord>;
  saveAttempt(attempt: Paper2AttemptRecord, expectedRevision?: number): Paper2StorageWriteResult;
  removeAttempt(attemptId: string): Paper2StorageWriteResult;
  listAttemptIds(): readonly string[];
}

export interface Paper2WriterLease {
  readonly attemptId: string;
  readonly writerId: string;
  readonly revision: number;
  readonly acquiredAtEpochMs: number;
  readonly expiresAtEpochMs: number;
}

export interface Paper2LocalExport {
  readonly kind: typeof PAPER2_STORAGE_EXPORT_KIND;
  readonly schemaVersion: 2;
  readonly exportedAt: string;
  readonly learnerScopeId: string;
  readonly progress: readonly Paper2LessonReviewRecord[];
  readonly attempts: readonly Paper2AttemptRecord[];
  readonly contentHashes: readonly string[];
}

export function paper2StorageIndexKey(learnerScopeId: string) {
  return `${PAPER2_STORAGE_NAMESPACE}:index:${keyPart(learnerScopeId)}`;
}

export function paper2LessonReviewStorageKey(learnerScopeId: string, topicId: string, lessonVersion: string) {
  return `${PAPER2_STORAGE_NAMESPACE}:lesson-review:${keyPart(learnerScopeId)}:${keyPart(topicId)}:${keyPart(lessonVersion)}`;
}

export function paper2AttemptStorageKey(learnerScopeId: string, attemptId: string) {
  return `${PAPER2_STORAGE_NAMESPACE}:attempt:${keyPart(learnerScopeId)}:${keyPart(attemptId)}`;
}

export function paper2MigrationStorageKey(learnerScopeId: string) {
  return `${PAPER2_STORAGE_NAMESPACE}:migration:${keyPart(learnerScopeId)}`;
}

export function paper2WriterLeaseStorageKey(learnerScopeId: string, attemptId: string) {
  return `${PAPER2_STORAGE_NAMESPACE}:lease:${keyPart(learnerScopeId)}:${keyPart(attemptId)}`;
}

export function makePaper2StoredEnvelope<T>(data: T): Paper2StoredEnvelope<T> {
  const canonical = stableStringify(data);
  return { schemaVersion: PAPER2_STORAGE_SCHEMA_VERSION, checksumAlgorithm: "fnv1a32", checksum: paper2DataChecksum(canonical), data };
}

export function parsePaper2AttemptRecord(raw: string | null): Paper2StorageReadResult<Paper2AttemptRecord> {
  if (raw === null) return { ok: true, value: null, code: "STORAGE_NOT_FOUND" };
  const envelope = parseEnvelope(raw);
  if (!envelope.ok) return envelope;
  if (!envelope.value) return { ok: false, code: "STORAGE_ENVELOPE_EMPTY", raw, message: "Stored envelope contains no data." };
  const validation = validatePaper2Attempt(envelope.value.data);
  if (!validation.ok) return { ok: false, code: "STORAGE_ATTEMPT_INVALID", raw, message: validation.issues.map((item) => item.code).join(", ") };
  return { ok: true, value: validation.value, code: "STORAGE_READ_OK" };
}

export function createPaper2StorageRepository(storage: Paper2StorageLike, learnerScopeId: string): Paper2AttemptRepository {
  const scope = keyPart(learnerScopeId);
  return {
    persistent: true,
    loadAttempt(attemptId) {
      try {
        return parsePaper2AttemptRecord(storage.getItem(paper2AttemptStorageKey(scope, attemptId)));
      } catch (error) {
        return { ok: false, code: "STORAGE_READ_UNAVAILABLE", message: errorMessage(error) };
      }
    },
    saveAttempt(attempt, expectedRevision) {
      if (attempt.learnerScopeId !== learnerScopeId) return writeFailure("STORAGE_SCOPE_MISMATCH", "Attempt belongs to another learner scope.", true);
      const validation = validatePaper2Attempt(attempt);
      if (!validation.ok) return writeFailure("STORAGE_ATTEMPT_INVALID", validation.issues.map((item) => item.code).join(", "), true);
      const key = paper2AttemptStorageKey(scope, attempt.attemptId);
      try {
        const existing = parsePaper2AttemptRecord(storage.getItem(key));
        if (!existing.ok) return writeFailure(existing.code, existing.message, true);
        if (existing.value) {
          if (expectedRevision !== undefined && existing.value.revision !== expectedRevision) return writeFailure("STORAGE_REVISION_CONFLICT", "Stored revision differs from the expected writer revision.", true);
          if (existing.value.revision > attempt.revision) return writeFailure("STORAGE_STALE_WRITE", "A newer revision already exists.", true);
          if (existing.value.revision === attempt.revision) {
            return stableStringify(existing.value) === stableStringify(attempt)
              ? { ok: true, code: "STORAGE_IDEMPOTENT" }
              : writeFailure("STORAGE_SAME_REVISION_CONFLICT", "Same revision has different data.", true);
          }
        } else if (expectedRevision !== undefined && expectedRevision !== -1) {
          return writeFailure("STORAGE_EXPECTED_RECORD_MISSING", "Expected prior record does not exist.", true);
        }
        storage.setItem(key, JSON.stringify(makePaper2StoredEnvelope(attempt)));
        const readBack = parsePaper2AttemptRecord(storage.getItem(key));
        if (!readBack.ok || !readBack.value || stableStringify(readBack.value) !== stableStringify(attempt)) return writeFailure("STORAGE_READBACK_FAILED", "Saved record did not pass read-back verification.", true);
        return { ok: true, code: "STORAGE_SAVED" };
      } catch (error) {
        return writeFailure(isQuotaError(error) ? "STORAGE_QUOTA_EXCEEDED" : "STORAGE_WRITE_UNAVAILABLE", errorMessage(error), true);
      }
    },
    removeAttempt(attemptId) {
      try {
        storage.removeItem(paper2AttemptStorageKey(scope, attemptId));
        return { ok: true, code: "STORAGE_SAVED" };
      } catch (error) {
        return writeFailure("STORAGE_REMOVE_FAILED", errorMessage(error), false);
      }
    },
    listAttemptIds() {
      const prefix = `${PAPER2_STORAGE_NAMESPACE}:attempt:${scope}:`;
      return listKeys(storage).filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length)).sort();
    },
  };
}

export function createPaper2MemoryRepository(learnerScopeId: string): Paper2AttemptRepository {
  const records = new Map<string, string>();
  const storage: Paper2StorageLike = {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => { records.set(key, value); },
    removeItem: (key) => { records.delete(key); },
    get length() { return records.size; },
    key(index) { return [...records.keys()][index] ?? null; },
  };
  const repository = createPaper2StorageRepository(storage, learnerScopeId);
  return { ...repository, persistent: false };
}

export function preflightPaper2Persistence(storage: Paper2StorageLike, learnerScopeId: string) {
  const key = `${PAPER2_STORAGE_NAMESPACE}:preflight:${keyPart(learnerScopeId)}`;
  const value = `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  try {
    storage.setItem(key, value);
    if (storage.getItem(key) !== value) return { ok: false as const, code: "STORAGE_PREFLIGHT_READBACK_FAILED" };
    storage.removeItem(key);
    return { ok: true as const, code: "STORAGE_PREFLIGHT_OK" };
  } catch (error) {
    try { storage.removeItem(key); } catch { /* Best-effort cleanup only. */ }
    return { ok: false as const, code: isQuotaError(error) ? "STORAGE_PREFLIGHT_QUOTA" : "STORAGE_PREFLIGHT_UNAVAILABLE" };
  }
}

export function evaluatePaper2WriterLease(
  current: Paper2WriterLease | null,
  request: Omit<Paper2WriterLease, "acquiredAtEpochMs" | "expiresAtEpochMs"> & { readonly nowEpochMs: number; readonly ttlMs: number; readonly takeover?: boolean },
) {
  if (!current || current.expiresAtEpochMs <= request.nowEpochMs || current.writerId === request.writerId) {
    return {
      ok: true as const,
      code: "LEASE_ACQUIRED" as const,
      lease: {
        attemptId: request.attemptId,
        writerId: request.writerId,
        revision: request.revision,
        acquiredAtEpochMs: request.nowEpochMs,
        expiresAtEpochMs: request.nowEpochMs + request.ttlMs,
      } satisfies Paper2WriterLease,
    };
  }
  if (request.takeover === true && request.revision === current.revision) {
    return {
      ok: true as const,
      code: "LEASE_TAKEN_OVER" as const,
      lease: {
        attemptId: request.attemptId,
        writerId: request.writerId,
        revision: request.revision,
        acquiredAtEpochMs: request.nowEpochMs,
        expiresAtEpochMs: request.nowEpochMs + request.ttlMs,
      } satisfies Paper2WriterLease,
    };
  }
  return { ok: false as const, code: request.revision === current.revision ? "LEASE_HELD_BY_OTHER_WRITER" : "LEASE_REVISION_CONFLICT", lease: current };
}

export function createPaper2LocalExport(input: Omit<Paper2LocalExport, "kind" | "schemaVersion">): Paper2LocalExport {
  return { kind: PAPER2_STORAGE_EXPORT_KIND, schemaVersion: PAPER2_STORAGE_SCHEMA_VERSION, ...input };
}

export function parsePaper2LocalImport(raw: string, maxBytes = 5_000_000): Paper2StorageReadResult<Paper2LocalExport> {
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return { ok: false, code: "IMPORT_TOO_LARGE", message: "Import exceeds the configured size limit." };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { ok: false, code: "IMPORT_MALFORMED_JSON", raw, message: "Import is not valid JSON." }; }
  if (!isRecord(value) || value.kind !== PAPER2_STORAGE_EXPORT_KIND || value.schemaVersion !== PAPER2_STORAGE_SCHEMA_VERSION) return { ok: false, code: "IMPORT_SCHEMA_UNSUPPORTED", raw, message: "Import kind or schema version is unsupported." };
  if (!isPaper2StableId(value.learnerScopeId) || typeof value.exportedAt !== "string" || !Number.isFinite(Date.parse(value.exportedAt))) return { ok: false, code: "IMPORT_METADATA_INVALID", raw, message: "Import metadata is invalid." };
  if (!Array.isArray(value.attempts) || !Array.isArray(value.progress) || !Array.isArray(value.contentHashes)) return { ok: false, code: "IMPORT_COLLECTIONS_INVALID", raw, message: "Import collections are invalid." };
  const attempts: Paper2AttemptRecord[] = [];
  for (const candidate of value.attempts) {
    const validation = validatePaper2Attempt(candidate);
    if (!validation.ok) return { ok: false, code: "IMPORT_ATTEMPT_INVALID", raw, message: validation.issues.map((item) => item.code).join(", ") };
    attempts.push(validation.value);
  }
  const ids = attempts.map((attempt) => attempt.attemptId);
  if (new Set(ids).size !== ids.length) return { ok: false, code: "IMPORT_DUPLICATE_ATTEMPT_ID", raw, message: "Import contains duplicate attempt IDs." };
  if (containsForbiddenExportData(value)) return { ok: false, code: "IMPORT_PRIVATE_DATA_FORBIDDEN", raw, message: "Import contains solution or credential fields." };
  return { ok: true, code: "STORAGE_READ_OK", value: value as unknown as Paper2LocalExport };
}

export function paper2DataChecksum(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

export function markPaper2AttemptRecoveryRequired(attempt: Paper2AttemptRecord, reasonCode: string, at: string) {
  return transitionPaper2Attempt(attempt, { type: "validation_migration_hash_or_writer_failure", reasonCode, at });
}

function parseEnvelope(raw: string): Paper2StorageReadResult<Paper2StoredEnvelope<unknown>> {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { ok: false, code: "STORAGE_CORRUPT_JSON", raw, message: "Stored JSON is corrupt." }; }
  if (!isRecord(value) || value.schemaVersion !== PAPER2_STORAGE_SCHEMA_VERSION || value.checksumAlgorithm !== "fnv1a32" || typeof value.checksum !== "string" || !("data" in value)) return { ok: false, code: "STORAGE_ENVELOPE_INVALID", raw, message: "Stored envelope is unsupported or incomplete." };
  const expected = paper2DataChecksum(stableStringify(value.data));
  if (value.checksum !== expected) return { ok: false, code: "STORAGE_CHECKSUM_MISMATCH", raw, message: "Stored data failed checksum verification." };
  return { ok: true, code: "STORAGE_READ_OK", value: value as unknown as Paper2StoredEnvelope<unknown> };
}

function containsForbiddenExportData(value: unknown): boolean {
  const forbidden = new Set(["solution", "solutions", "modelAnswer", "markPoints", "acceptedAlternatives", "submitNonce", "sessionToken", "credential", "password"]);
  if (Array.isArray(value)) return value.some(containsForbiddenExportData);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, child]) => forbidden.has(key) || containsForbiddenExportData(child));
}

function listKeys(storage: Paper2StorageLike) {
  if (typeof storage.length !== "number" || !storage.key) return [];
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) keys.push(key);
  }
  return keys;
}

function keyPart(value: string) {
  if (!isPaper2StableId(value)) throw new Error("Invalid Paper 2 storage-key identifier.");
  return value;
}

function writeFailure(code: string, message: string, recoveryRequired: boolean): Paper2StorageWriteResult {
  return { ok: false, code, message, recoveryRequired };
}

function isQuotaError(error: unknown) {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.code === 22);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown storage failure.";
}
