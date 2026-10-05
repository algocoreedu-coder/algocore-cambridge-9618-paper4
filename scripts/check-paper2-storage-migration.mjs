import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paper2Lib = path.join(root, "app/lib/paper2");
function loadDomainModule(moduleName) {
  const temp = mkdtempSync(path.join(os.tmpdir(), "paper2-gate-a-domain-"));
  try {
    writeFileSync(path.join(temp, "package.json"), '{"type":"commonjs"}\n');
    for (const name of readdirSync(paper2Lib).filter((entry) => entry.endsWith(".ts"))) {
      const output = ts.transpileModule(readFileSync(path.join(paper2Lib, name), "utf8"), {
        fileName: name,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        reportDiagnostics: true,
      });
      const errors = (output.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
      if (errors.length) throw new Error(`${name}: ${errors.map((item) => item.messageText).join("; ")}`);
      writeFileSync(path.join(temp, name.replace(/\.ts$/, ".js")), output.outputText);
    }
    return createRequire(import.meta.url)(path.join(temp, `${moduleName}.js`));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const storageDomain = loadDomainModule("storage-v2");
const migrationDomain = loadDomainModule("storage-migrations");
const {
  createPaper2LocalExport,
  createPaper2MemoryRepository,
  createPaper2StorageRepository,
  evaluatePaper2WriterLease,
  makePaper2StoredEnvelope,
  paper2AttemptStorageKey,
  paper2MigrationStorageKey,
  parsePaper2AttemptRecord,
  parsePaper2LocalImport,
  preflightPaper2Persistence,
} = storageDomain;
const {
  PAPER2_LEGACY_COURSE_PROGRESS_KEY,
  PAPER2_LEGACY_PROGRESS_PREFIX,
  executePaper2V1Migration,
  migratePaper2V1Snapshot,
  parseLegacyCourseProgress,
  parseLegacyLessonProgress,
  planPaper2V1Migration,
} = migrationDomain;

const checks = [];
const failures = [];
const check = (id, condition, detail = undefined) => {
  const result = { id, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) };
  checks.push(result);
  if (!result.pass) failures.push(result);
};
const now = "2026-10-03T08:00:00.000Z";
const learnerScopeId = "learner:local-fixture";

function attemptFixture(id = "attempt:storage-fixture", overrides = {}) {
  return {
    schemaVersion: 2,
    attemptId: id,
    learnerScopeId,
    contentKind: "practice_set",
    contentId: "set:fixture",
    contentVersion: "1.0.0",
    contentHash: "a".repeat(64),
    mode: "set_closed",
    status: "active",
    revision: 0,
    locale: "en",
    startedAt: now,
    updatedAt: now,
    responses: {},
    finalChecklist: { submitted: false, scorableMarkPointsComplete: false, reflectionComplete: false, summaryConfirmed: false },
    storageHealth: "healthy",
    lastMigrationVersion: 2,
    ...overrides,
  };
}

function memoryStorage(options = {}) {
  const values = new Map();
  const removed = [];
  return {
    values,
    removed,
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) {
      if (options.readError) throw options.readError;
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (options.writeError) throw options.writeError;
      if (options.dropWrites) return;
      values.set(key, value);
    },
    removeItem(key) {
      removed.push(key);
      values.delete(key);
    },
  };
}

const legacyKey1 = `${PAPER2_LEGACY_PROGRESS_PREFIX}T01:1.0.0`;
const legacyKey2 = `${PAPER2_LEGACY_PROGRESS_PREFIX}T02:1.0.0`;
const snapshot = {
  courseProgressRaw: JSON.stringify({ schemaVersion: 1, lastVisited: { topicId: "T02", version: "1.0.0" } }),
  lessonRecords: [
    { key: legacyKey1, topicId: "T01", lessonVersion: "1.0.0", raw: JSON.stringify({ schemaVersion: 1, anchors: ["recognise", "understand", "recognise", "unknown"] }) },
    { key: legacyKey2, topicId: "T02", lessonVersion: "1.0.0", raw: JSON.stringify({ schemaVersion: 1, anchors: ["worked-example", "remember"] }) },
  ],
};
const plan = planPaper2V1Migration(snapshot, learnerScopeId, now);
check("v1-plan-required", plan.code === "MIGRATION_REQUIRED" && plan.lessonReviews.length === 2, plan);
check("v1-anchor-normalization", JSON.stringify(plan.lessonReviews[0].reviewedAnchors) === JSON.stringify(["recognise", "understand"]), plan.lessonReviews[0]);
check("v1-last-visited", plan.lastVisited?.topicId === "T02" && plan.lastVisited.version === "1.0.0", plan.lastVisited);
check("v1-alias-deterministic", JSON.stringify(migratePaper2V1Snapshot(snapshot, learnerScopeId, now)) === JSON.stringify(plan));

const migrationStorage = memoryStorage();
const migrated = executePaper2V1Migration(migrationStorage, snapshot, learnerScopeId, now);
check("v1-execution-complete", migrated.ok && migrated.code === "MIGRATION_COMPLETE" && migrated.journal.migratedLessonKeys.length === 2, migrated);
check("v1-retained-for-rollback", migrated.ok && migrated.journal.retainedLegacyKeys.includes(PAPER2_LEGACY_COURSE_PROGRESS_KEY)
  && migrated.journal.retainedLegacyKeys.includes(legacyKey1) && !migrationStorage.removed.includes(legacyKey1), migrated.ok ? migrated.journal : migrated);
const rerun = executePaper2V1Migration(migrationStorage, snapshot, learnerScopeId, now);
check("migration-idempotent-rerun", rerun.ok && rerun.code === "MIGRATION_IDEMPOTENT"
  && migrated.ok && rerun.journal.sourceChecksum === migrated.journal.sourceChecksum, rerun);
check("migration-journal-present", migrationStorage.values.has(paper2MigrationStorageKey(learnerScopeId)));

check("legacy-corrupt-json", parseLegacyLessonProgress("{broken").code === "MIGRATION_LEGACY_JSON_CORRUPT");
check("legacy-unknown-version", parseLegacyLessonProgress(JSON.stringify({ schemaVersion: 999, anchors: [] })).code === "MIGRATION_LEGACY_SCHEMA_UNKNOWN");
check("course-corrupt-json", parseLegacyCourseProgress("{broken").code === "MIGRATION_COURSE_JSON_CORRUPT");
check("course-unknown-version", parseLegacyCourseProgress(JSON.stringify({ schemaVersion: 999 })).code === "MIGRATION_COURSE_SCHEMA_UNKNOWN");
const corruptSnapshot = {
  courseProgressRaw: "{broken",
  lessonRecords: [{ key: legacyKey1, topicId: "T01", lessonVersion: "1.0.0", raw: "{broken" }],
};
const corruptPlan = planPaper2V1Migration(corruptSnapshot, learnerScopeId, now);
check("corrupt-v1-quarantined", corruptPlan.quarantines.length === 2 && corruptPlan.lessonReviews.length === 0, corruptPlan);
const corruptMigrationStorage = memoryStorage();
const corruptMigration = executePaper2V1Migration(corruptMigrationStorage, corruptSnapshot, learnerScopeId, now);
check("corrupt-v1-migration-completes-with-quarantine", corruptMigration.ok && corruptMigration.quarantines.length === 2, corruptMigration);

const attempt = attemptFixture();
const envelope = makePaper2StoredEnvelope(attempt);
check("positive-envelope-parse", parsePaper2AttemptRecord(JSON.stringify(envelope)).ok);
check("attempt-v2-without-navigation-backward-compatible", parsePaper2AttemptRecord(JSON.stringify(envelope)).value?.navigation === undefined);
const attemptWithNavigation = attemptFixture("attempt:navigation-fixture", {
  navigation: {
    currentQuestionIdentity: "question:fixture@1.0.0",
    flaggedQuestionIdentities: ["question:fixture@1.0.0"],
    activeSectionId: "9.1",
    updatedAt: now,
  },
});
const navigationEnvelope = makePaper2StoredEnvelope(attemptWithNavigation);
const navigationRoundTrip = parsePaper2AttemptRecord(JSON.stringify(navigationEnvelope));
check("attempt-navigation-checksum-roundtrip", navigationRoundTrip.ok
  && navigationRoundTrip.value?.navigation?.currentQuestionIdentity === "question:fixture@1.0.0"
  && navigationRoundTrip.value.navigation.flaggedQuestionIdentities.length === 1, navigationRoundTrip);
check("attempt-navigation-tamper-fails-checksum", parsePaper2AttemptRecord(JSON.stringify({ ...navigationEnvelope, data: { ...navigationEnvelope.data, navigation: { ...navigationEnvelope.data.navigation, flaggedQuestionIdentities: [] } } })).code === "STORAGE_CHECKSUM_MISMATCH");
check("negative-attempt-json-corruption", parsePaper2AttemptRecord("{broken").code === "STORAGE_CORRUPT_JSON");
check("negative-attempt-checksum", parsePaper2AttemptRecord(JSON.stringify({ ...envelope, checksum: "00000000" })).code === "STORAGE_CHECKSUM_MISMATCH");
check("negative-attempt-unknown-schema", parsePaper2AttemptRecord(JSON.stringify({ ...envelope, schemaVersion: 999 })).code === "STORAGE_ENVELOPE_INVALID");

const repository = createPaper2MemoryRepository(learnerScopeId);
const firstSave = repository.saveAttempt(attempt, -1);
check("repository-first-save", firstSave.ok && firstSave.code === "STORAGE_SAVED", firstSave);
const idempotentSave = repository.saveAttempt(attempt, 0);
check("repository-idempotent-save", idempotentSave.ok && idempotentSave.code === "STORAGE_IDEMPOTENT", idempotentSave);
const sameRevisionConflict = repository.saveAttempt({ ...attempt, locale: "vi" }, 0);
check("repository-same-revision-conflict", !sameRevisionConflict.ok && sameRevisionConflict.code === "STORAGE_SAME_REVISION_CONFLICT", sameRevisionConflict);
const revisionOne = { ...attempt, revision: 1, updatedAt: "2026-10-03T08:01:00.000Z" };
check("repository-revision-save", repository.saveAttempt(revisionOne, 0).ok);
const staleSave = repository.saveAttempt(attempt, 1);
check("repository-stale-write", !staleSave.ok && staleSave.code === "STORAGE_STALE_WRITE", staleSave);

const scopeRepository = createPaper2MemoryRepository(learnerScopeId);
scopeRepository.saveAttempt(attemptFixture("attempt:one"), -1);
scopeRepository.saveAttempt(attemptFixture("attempt:two"), -1);
check("scoped-list-before-reset", JSON.stringify(scopeRepository.listAttemptIds()) === JSON.stringify(["attempt:one", "attempt:two"]));
scopeRepository.removeAttempt("attempt:one");
check("scoped-reset-one-attempt", JSON.stringify(scopeRepository.listAttemptIds()) === JSON.stringify(["attempt:two"]));

const quotaError = new DOMException("quota", "QuotaExceededError");
const quotaStorage = memoryStorage({ writeError: quotaError });
const quotaPreflight = preflightPaper2Persistence(quotaStorage, learnerScopeId);
check("quota-preflight-fails", !quotaPreflight.ok && quotaPreflight.code === "STORAGE_PREFLIGHT_QUOTA", quotaPreflight);
const quotaRepository = createPaper2StorageRepository(quotaStorage, learnerScopeId);
const quotaSave = quotaRepository.saveAttempt(attempt, -1);
check("quota-save-never-reports-saved", !quotaSave.ok && quotaSave.code === "STORAGE_QUOTA_EXCEEDED" && quotaSave.recoveryRequired, quotaSave);
const droppedStorage = memoryStorage({ dropWrites: true });
const droppedPreflight = preflightPaper2Persistence(droppedStorage, learnerScopeId);
check("readback-preflight-fails", !droppedPreflight.ok && droppedPreflight.code === "STORAGE_PREFLIGHT_READBACK_FAILED", droppedPreflight);

const lease = evaluatePaper2WriterLease(null, { attemptId: attempt.attemptId, writerId: "tab:one", revision: 0, nowEpochMs: 1000, ttlMs: 5000 });
check("writer-lease-first-tab", lease.ok && lease.code === "LEASE_ACQUIRED", lease);
const secondTab = evaluatePaper2WriterLease(lease.lease, { attemptId: attempt.attemptId, writerId: "tab:two", revision: 0, nowEpochMs: 2000, ttlMs: 5000 });
check("writer-lease-second-tab-read-only", !secondTab.ok && secondTab.code === "LEASE_HELD_BY_OTHER_WRITER", secondTab);
const conflictTab = evaluatePaper2WriterLease(lease.lease, { attemptId: attempt.attemptId, writerId: "tab:two", revision: 1, nowEpochMs: 2000, ttlMs: 5000 });
check("writer-lease-revision-conflict", !conflictTab.ok && conflictTab.code === "LEASE_REVISION_CONFLICT", conflictTab);
const takeover = evaluatePaper2WriterLease(lease.lease, { attemptId: attempt.attemptId, writerId: "tab:two", revision: 0, nowEpochMs: 2000, ttlMs: 5000, takeover: true });
check("writer-lease-explicit-takeover", takeover.ok && takeover.code === "LEASE_TAKEN_OVER" && takeover.lease.writerId === "tab:two", takeover);

const localExport = createPaper2LocalExport({
  exportedAt: now,
  learnerScopeId,
  progress: [],
  attempts: [attempt],
  contentHashes: [attempt.contentHash],
});
check("export-import-roundtrip", parsePaper2LocalImport(JSON.stringify(localExport)).ok);
check("import-malformed-json", parsePaper2LocalImport("{broken").code === "IMPORT_MALFORMED_JSON");
check("import-unknown-schema", parsePaper2LocalImport(JSON.stringify({ ...localExport, schemaVersion: 999 })).code === "IMPORT_SCHEMA_UNSUPPORTED");
check("import-duplicate-attempt", parsePaper2LocalImport(JSON.stringify({ ...localExport, attempts: [attempt, attempt] })).code === "IMPORT_DUPLICATE_ATTEMPT_ID");
check("import-private-solution-forbidden", parsePaper2LocalImport(JSON.stringify({ ...localExport, modelAnswer: "secret" })).code === "IMPORT_PRIVATE_DATA_FORBIDDEN");
check("import-size-limit", parsePaper2LocalImport(JSON.stringify(localExport), 10).code === "IMPORT_TOO_LARGE");

let invalidKeyRejected = false;
try { paper2AttemptStorageKey("../../bad", attempt.attemptId); } catch { invalidKeyRejected = true; }
check("storage-key-path-injection-rejected", invalidKeyRejected);

const output = {
  schemaVersion: "paper2-storage-migration-check-v1",
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  migratedLessonRecords: plan.lessonReviews.length,
  quarantinedCorruptRecords: corruptPlan.quarantines.length,
  migrationIdempotence: rerun.ok ? rerun.code : rerun.code,
  negativeFixtures: 18,
  failures,
};
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
