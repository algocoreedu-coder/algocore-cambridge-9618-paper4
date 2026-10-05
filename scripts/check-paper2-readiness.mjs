import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedBuildId = process.env.PAPER2_EXPECTED_BUILD_ID?.trim() || null;
const buildDistDir = process.env.PAPER2_BUILD_DIST_DIR?.trim() || null;
const artifactBuildId = buildDistDir
  ? (await readFile(path.resolve(root, buildDistDir, "BUILD_ID"), "utf8").catch(() => "")).trim() || null
  : null;
const buildIdPattern = /^[A-Za-z0-9_-]{8,128}$/;
const buildBindingRequested = Boolean(expectedBuildId || buildDistDir);
const buildBindingValid = Boolean(expectedBuildId && buildIdPattern.test(expectedBuildId) && artifactBuildId === expectedBuildId);
const visualRuntimeBasePaths = [
  "package.json",
  "next.config.mjs",
  "proxy.ts",
  "app/lib/auth.ts",
  "app/login/LoginForm.tsx",
  "app/api/auth/login/route.ts",
  "app/lib/paper2/generated/canonical-visuals.json",
  "app/lib/paper2/generated/assessment-descriptors.json",
  "app/lib/paper2/generated/assessment-public.json",
  "app/lib/paper2/generated/assessment-private.json",
  "app/lib/paper2/server-visual-registry.ts",
  "app/lib/paper2/assessment-registry.ts",
  "app/lib/paper2/assessment-private-registry.ts",
  "app/lib/paper2/attempt-types.ts",
  "app/lib/paper2/build-identity.ts",
  "app/lib/paper2/structured-answer.ts",
  "app/lib/paper2/delivery-readiness.ts",
  "app/lib/paper2/candidate-access.ts",
  "app/lib/paper2/candidate-access-policy.ts",
  "app/lib/paper2/lesson-registry.ts",
  "app/lib/paper2/catalog.ts",
  "app/lib/paper2/catalog-server.ts",
  "app/lib/paper2/lesson-status.ts",
  "app/lib/paper2/public-source-registry.ts",
  "app/lib/paper2/question-types.ts",
  "app/lib/paper2/section-enrichment.ts",
  "app/lib/paper2/storage-migrations.ts",
  "app/lib/paper2/storage-v2.ts",
  "app/lib/paper2/timed-gate.ts",
  "app/lib/paper2/timer-reducer.ts",
  "app/lib/paper2/content-validation.ts",
  "app/components/paper2-assessment/Paper2AssessmentWorkspace.tsx",
  "app/components/paper2-assessment/Paper2Assessment.module.css",
  "app/components/paper2-assessment/AssessmentProgressDashboard.tsx",
  "app/components/paper2-learning/lessons/Paper2SceneRenderer.tsx",
  "app/components/paper2-learning/lessons/Paper2VisualExplorer.tsx",
  "app/components/paper2-learning/lessons/LessonPage.tsx",
  "app/components/paper2-learning/lessons/LessonProgress.tsx",
  "app/components/paper2-learning/lessons/Paper2Lesson.module.css",
  "app/components/paper2-learning/CourseProgressSummary.tsx",
  "app/components/paper2-learning/Paper2Shell.tsx",
  "app/components/paper2-learning/StudyMap.tsx",
  "app/components/paper2-learning/SectionOverview.tsx",
  "app/components/paper2-learning/TopicPreview.tsx",
  "app/components/paper2-learning/progress-storage.ts",
  "app/components/paper2-learning/shared.tsx",
  "app/components/paper2-learning/Paper2Learning.module.css",
  "app/paper-2/layout.tsx",
  "app/paper-2/page.tsx",
  "app/paper-2/topics/[slug]/page.tsx",
  "app/paper-2/sections/[sectionId]/page.tsx",
  "app/paper-2/practice/page.tsx",
  "app/paper-2/practice/[setId]/page.tsx",
  "app/paper-2/mocks/page.tsx",
  "app/paper-2/mocks/[paperId]/page.tsx",
  "app/paper-2/progress/page.tsx",
  "app/paper-2/review/visuals/[assetId]/page.tsx",
  "app/paper-2/build-id/route.ts",
  "app/api/paper2/sets/[setId]/submit/route.ts",
  "app/api/paper2/timed/[paperId]/start/route.ts",
  "app/api/paper2/timed/[paperId]/resume/route.ts",
  "app/api/paper2/timed/[paperId]/submit/route.ts",
  "scripts/check-paper2-ui-browser.mjs",
  "scripts/export-paper2-evidence-lock.mjs",
  "scripts/check-paper2-readiness.mjs",
];

async function collectRuntimeTreePaths(relativeDirectory, extensions) {
  const files = [];
  const visit = async (relative) => {
    const entries = await readdir(path.join(root, relative), { withFileTypes: true });
    for (const entry of entries) {
      const child = path.posix.join(relative.replaceAll("\\", "/"), entry.name);
      if (entry.isDirectory()) await visit(child);
      else if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) files.push(child);
    }
  };
  await visit(relativeDirectory);
  return files.sort();
}

const visualRuntimePaths = [...new Set([
  ...visualRuntimeBasePaths,
  "content/paper2/study-map.json",
  ...(await collectRuntimeTreePaths("content/paper2/sections", [".json"])),
  ...(await collectRuntimeTreePaths("content/paper2/patterns", [".json"])),
  ...(await collectRuntimeTreePaths("content/paper2/sources", [".json"])),
  ...(await collectRuntimeTreePaths("app/lib/paper2", [".ts", ".json"])),
  ...(await collectRuntimeTreePaths("app/components/paper2-learning", [".ts", ".tsx", ".css"])),
  ...(await collectRuntimeTreePaths("app/components/paper2-assessment", [".ts", ".tsx", ".css"])),
  ...(await collectRuntimeTreePaths("app/paper-2", [".ts", ".tsx", ".css"])),
  ...(await collectRuntimeTreePaths("app/api/paper2", [".ts", ".tsx"])),
  ...(await collectRuntimeTreePaths("app/login", [".ts", ".tsx", ".css"])),
  ...(await collectRuntimeTreePaths("app/api/auth", [".ts", ".tsx"])),
  ...(await collectRuntimeTreePaths("scripts", [".mjs"])).filter((relative) => /\/(?:check|generate|export|prepare|promote)-paper2-/.test(relative)),
])].filter((relative) => relative !== "app/lib/paper2/generated/evidence-lock.json").sort();
const [statusSource, hashes, lock, registrySource, routeSource, accessSource, policySource, catalogServerSource, deliverySource, visualManifest, ...visualRuntimeSources] = await Promise.all([
  readFile(path.join(root, "content/paper2/lesson-status.json")),
  readFile(path.join(root, "app/lib/paper2/generated/lesson-content-hashes.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "app/lib/paper2/generated/evidence-lock.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "app/lib/paper2/lesson-registry.ts"), "utf8"),
  readFile(path.join(root, "app/paper-2/topics/[slug]/page.tsx"), "utf8"),
  readFile(path.join(root, "app/lib/paper2/candidate-access.ts"), "utf8"),
  readFile(path.join(root, "app/lib/paper2/candidate-access-policy.ts"), "utf8"),
  readFile(path.join(root, "app/lib/paper2/catalog-server.ts"), "utf8"),
  readFile(path.join(root, "app/lib/paper2/delivery-readiness.ts"), "utf8"),
  readFile(path.resolve(root, "../curriculum/paper_2/visuals/manifest.json")),
  ...visualRuntimePaths.map((relative) => readFile(path.join(root, relative))),
]);

async function findEmbeddedEvidenceLocks(directory, markers) {
  const matches = [];
  const visit = async (current) => {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        const source = await readFile(absolute, "utf8").catch(() => "");
        if (markers.every((marker) => source.includes(marker))) matches.push(path.relative(root, absolute));
      }
    }
  };
  await visit(directory);
  return matches;
}

const status = JSON.parse(statusSource.toString("utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalVisuals = JSON.parse(visualRuntimeSources[visualRuntimePaths.indexOf("app/lib/paper2/generated/canonical-visuals.json")].toString("utf8"));
const visualRuntimeComponents = Object.fromEntries(visualRuntimePaths.map((relative, index) => [relative, sha256(visualRuntimeSources[index])]));
const visualRuntimeSha256 = sha256(JSON.stringify(visualRuntimeComponents));
const checks = [];
const failures = [];
const check = (id, condition, detail = null) => {
  const row = { id, pass: Boolean(condition), detail };
  checks.push(row);
  if (!row.pass) failures.push(row);
};
const evidenceKeys = ["academicPre", "academicPost", "visualReview", "codeReview", "qa"];
const safeEvidence = (value) => typeof value === "string"
  && (value.startsWith("planning/paper2/completion-program-2026/evidence/")
    || value.startsWith("planning/paper2/book-coverage-audit-2026-10-02/execution-2026-10-03/"))
  && !value.split(/[\\/]/).includes("..");
const exactLockMatch = (record, locked, releaseBuildId = lock.buildId) => Boolean(
  record.state === "reviewed"
  && locked?.approved
  && record.visualManifestSha256
  && record.visualSemanticSha256
  && record.visualRuntimeSha256
  && locked.topicId === record.topicId
  && locked.slug === record.slug
  && locked.version === record.version
  && locked.contentSha256 === record.contentSha256
  && locked.visualManifestSha256 === record.visualManifestSha256
  && locked.visualSemanticSha256 === record.visualSemanticSha256
  && locked.visualRuntimeSha256 === record.visualRuntimeSha256
  && typeof releaseBuildId === "string"
  && typeof locked.buildId === "string"
  && locked.buildId === releaseBuildId
  && evidenceKeys.every((key) => safeEvidence(record.evidence?.[key])),
);

check("status-schema", status.schemaVersion === 1 && Array.isArray(status.lessons));
check("hash-registry-schema", hashes.schemaVersion === 1 && hashes.algorithm === "sha256-raw-bytes" && Array.isArray(hashes.lessons));
check(
  "evidence-lock-schema",
  lock.schemaVersion === 3
    && Array.isArray(lock.records)
    && (buildBindingRequested ? lock.buildId === (buildBindingValid ? expectedBuildId : null) : (lock.buildId === null || buildIdPattern.test(lock.buildId)))
    && lock.statusSha256 === sha256(statusSource)
    && lock.visualManifestSha256 === sha256(visualManifest)
    && lock.visualSemanticSha256 === canonicalVisuals.semanticSha256
    && lock.visualRuntimeSha256 === visualRuntimeSha256
    && JSON.stringify(lock.visualRuntimeComponents) === JSON.stringify(visualRuntimeComponents),
);
for (const record of status.lessons ?? []) {
  const generated = hashes.lessons.find((item) => item.slug === record.slug);
  const locked = lock.records.find((item) => item.topicId === record.topicId && item.slug === record.slug);
  check(
    `generated-hash:${record.topicId}`,
    generated?.topicId === record.topicId && generated?.version === record.version && generated?.contentSha256 === record.contentSha256,
    { status: record.contentSha256, generated: generated?.contentSha256 },
  );
  check(`visual-hash:${record.topicId}`, record.visualManifestSha256 === lock.visualManifestSha256, {
    status: record.visualManifestSha256 ?? null,
    generated: lock.visualManifestSha256,
  });
  check(`visual-semantic-hash:${record.topicId}`, record.visualSemanticSha256 === lock.visualSemanticSha256, {
    status: record.visualSemanticSha256 ?? null,
    generated: lock.visualSemanticSha256,
  });
  check(`visual-runtime-hash:${record.topicId}`, record.visualRuntimeSha256 === lock.visualRuntimeSha256, {
    status: record.visualRuntimeSha256 ?? null,
    generated: lock.visualRuntimeSha256,
  });
  if (record.state === "reviewed") {
    check(`review-evidence:${record.topicId}`, evidenceKeys.every((key) => safeEvidence(record.evidence?.[key])) && exactLockMatch(record, locked), {
      evidence: record.evidence ?? null,
      lock: locked ?? null,
    });
  } else {
    check(
      `candidate-evidence-optional:${record.topicId}`,
      record.evidence === undefined || Object.values(record.evidence).every(safeEvidence),
      record.evidence ?? null,
    );
    check(`candidate-not-approved:${record.topicId}`, locked?.approved === false, locked ?? null);
  }
}

const candidate = status.lessons?.[0];
const matchingSynthetic = candidate ? {
  ...candidate,
  state: "reviewed",
  visualManifestSha256: lock.visualManifestSha256,
  visualSemanticSha256: lock.visualSemanticSha256,
  visualRuntimeSha256: lock.visualRuntimeSha256,
  evidence: Object.fromEntries(evidenceKeys.map((key) => [key, `planning/paper2/completion-program-2026/evidence/synthetic/${key}.json`])),
} : null;
const syntheticBuildId = "synthetic-build-id";
const matchingLock = matchingSynthetic ? { ...matchingSynthetic, approved: true, buildId: syntheticBuildId } : null;
check("mutation-baseline-reviewed-lock", matchingSynthetic && exactLockMatch(matchingSynthetic, matchingLock, syntheticBuildId));
check("mutation-stale-content-fails", matchingSynthetic && !exactLockMatch({ ...matchingSynthetic, contentSha256: "0".repeat(64) }, matchingLock, syntheticBuildId));
check("mutation-stale-visual-fails", matchingSynthetic && !exactLockMatch({ ...matchingSynthetic, visualManifestSha256: "0".repeat(64) }, matchingLock, syntheticBuildId));
check("mutation-stale-visual-semantic-fails", matchingSynthetic && !exactLockMatch({ ...matchingSynthetic, visualSemanticSha256: "0".repeat(64) }, matchingLock, syntheticBuildId));
check("mutation-stale-visual-runtime-fails", matchingSynthetic && !exactLockMatch({ ...matchingSynthetic, visualRuntimeSha256: "0".repeat(64) }, matchingLock, syntheticBuildId));
check("mutation-stale-build-fails", matchingSynthetic && !exactLockMatch(matchingSynthetic, { ...matchingLock, buildId: "stale-build" }, syntheticBuildId));
check("mutation-missing-evidence-fails", matchingSynthetic && !exactLockMatch({ ...matchingSynthetic, evidence: { ...matchingSynthetic.evidence, qa: undefined } }, matchingLock, syntheticBuildId));
check("mutation-unapproved-lock-fails", matchingSynthetic && !exactLockMatch(matchingSynthetic, { ...matchingLock, approved: false }, syntheticBuildId));
check("route-hash-gate", routeSource.includes("generatedHash.contentSha256 === record.contentSha256") && registrySource.includes("lesson-content-hashes.json"));
check("route-evidence-gate", routeSource.includes("isReviewedPaper2LessonReady(record)") && catalogServerSource.includes("filter(isReviewedPaper2LessonReady)") && deliverySource.includes("evidence-lock.json") && deliverySource.includes("getRunningPaper2BuildId()"));
check("candidate-feature-switch", accessSource.includes("PAPER2_CANDIDATE_PREVIEW") && accessSource.includes('process.env[PREVIEW_ENV] === "1"'));
check("candidate-exact-allowlist", accessSource.includes("paper2CandidateAccessDecision") && policySource.includes("`${record.topicId}@${record.version}`"));
if (buildBindingRequested) {
  check("build-artifact-binding", buildBindingValid && lock.buildId === expectedBuildId, { expectedBuildId, artifactBuildId, buildDistDir });
  const embeddedMarkers = [
    lock.buildId,
    lock.visualManifestSha256,
    lock.visualSemanticSha256,
    lock.visualRuntimeSha256,
    ...lock.records.flatMap((record) => [
      record.topicId,
      record.slug,
      record.version,
      record.contentSha256,
      ...Object.values(record.evidence ?? {}).map((item) => item?.sha256),
    ]),
  ].filter((value) => typeof value === "string" && value.length > 0);
  const embeddedLockFiles = await findEmbeddedEvidenceLocks(
    path.resolve(root, buildDistDir, "server"),
    embeddedMarkers,
  );
  check(
    "build-artifact-embedded-evidence-lock",
    embeddedLockFiles.length > 0,
    { expectedBuildId, sourceLockBuildId: lock.buildId, embeddedLockFiles },
  );
}

console.log(JSON.stringify({
  schema_version: "paper2-readiness-check-v3",
  phase: buildBindingRequested ? "postbuild" : "prebuild",
  build_binding_checked: buildBindingRequested,
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
