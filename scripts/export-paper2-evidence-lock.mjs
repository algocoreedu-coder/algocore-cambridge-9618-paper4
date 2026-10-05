import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = path.resolve(appRoot, "..");
const evidenceRoots = [
  path.join(projectRoot, "planning/paper2/completion-program-2026/evidence"),
  path.join(projectRoot, "planning/paper2/book-coverage-audit-2026-10-02/execution-2026-10-03"),
];
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const buildIdPattern = /^[A-Za-z0-9_-]{8,128}$/;
const expectedBuildId = process.env.PAPER2_EXPECTED_BUILD_ID?.trim() || null;
const buildDistDir = process.env.PAPER2_BUILD_DIST_DIR?.trim() || null;
if (Boolean(expectedBuildId) !== Boolean(buildDistDir)) {
  throw new Error("Paper 2 evidence export requires PAPER2_EXPECTED_BUILD_ID and PAPER2_BUILD_DIST_DIR together.");
}
const existingLock = await readFile(path.join(appRoot, "app/lib/paper2/generated/evidence-lock.json"), "utf8")
  .then(JSON.parse)
  .catch(() => null);
if (!expectedBuildId && existingLock?.buildId && process.env.PAPER2_ALLOW_UNBOUND_EXPORT !== "1") {
  throw new Error(
    `Refusing to replace build-bound Paper 2 evidence lock ${existingLock.buildId} with an unbound lock. `
      + "Pass both build-binding variables, or set PAPER2_ALLOW_UNBOUND_EXPORT=1 for an intentional fail-closed reset.",
  );
}
const artifactBuildId = buildDistDir
  ? (await readFile(path.resolve(appRoot, buildDistDir, "BUILD_ID"), "utf8").catch(() => "")).trim() || null
  : null;
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
    const entries = await readdir(path.join(appRoot, relative), { withFileTypes: true });
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
const [statusSource, hashes, visualManifestSource, ...visualRuntimeSources] = await Promise.all([
  readFile(path.join(appRoot, "content/paper2/lesson-status.json")),
  readFile(path.join(appRoot, "app/lib/paper2/generated/lesson-content-hashes.json"), "utf8").then(JSON.parse),
  readFile(path.join(projectRoot, "curriculum/paper_2/visuals/manifest.json")),
  ...visualRuntimePaths.map((relative) => readFile(path.join(appRoot, relative))),
]);
const status = JSON.parse(statusSource.toString("utf8"));
const visualManifestSha256 = sha256(visualManifestSource);
const canonicalVisuals = JSON.parse(visualRuntimeSources[visualRuntimePaths.indexOf("app/lib/paper2/generated/canonical-visuals.json")].toString("utf8"));
const visualSemanticSha256 = canonicalVisuals.semanticSha256;
if (!/^[a-f0-9]{64}$/.test(visualSemanticSha256 ?? "")) throw new Error("Canonical visual export is missing semanticSha256.");
const visualRuntimeComponents = Object.fromEntries(visualRuntimePaths.map((relative, index) => [relative, sha256(visualRuntimeSources[index])]));
const visualRuntimeSha256 = sha256(JSON.stringify(visualRuntimeComponents));
const requiredEvidence = ["academicPre", "academicPost", "visualReview", "codeReview", "qa"];
const buildBoundEvidence = new Set(["academicPost", "visualReview", "codeReview", "qa"]);
const visualBoundEvidence = new Set(["academicPost", "visualReview", "codeReview", "qa"]);

function approvedPath(relative) {
  if (typeof relative !== "string" || !relative.startsWith("planning/paper2/")) return null;
  const absolute = path.resolve(projectRoot, relative);
  const approved = evidenceRoots.some((root) => absolute.startsWith(`${root}${path.sep}`));
  return approved ? absolute : null;
}

function decisionPass(document, raw) {
  if (document && typeof document === "object") return [document.decision, document.verdict, document.status].some((value) => String(value ?? "").toUpperCase() === "PASS");
  return /\*\*(?:Verdict|Decision|Status):\s*PASS\*\*/i.test(raw) || /^Decision:\s*PASS\s*$/im.test(raw);
}

function extractBuildId(document, raw) {
  if (document && typeof document === "object") return document.buildId ?? document.build_id ?? document.build?.id ?? null;
  return raw.match(/(?:Candidate build|Build(?: ID)?)[^`\r\n]*`([^`]+)`/i)?.[1] ?? null;
}

function bound(document, raw, key, value) {
  if (document && typeof document === "object") {
    const candidates = {
      topicId: [document.topicId, document.topic_id, document.topic?.id],
      version: [document.version, document.revision, document.lessonVersion],
      contentSha256: [document.contentSha256, document.content_sha256, document.contentHash],
      visualManifestSha256: [document.visualManifestSha256, document.visualSourceManifestSha256, document.visual_manifest_sha256],
      visualSemanticSha256: [document.visualSemanticSha256, document.visual_semantic_sha256],
      visualRuntimeSha256: [document.visualRuntimeSha256, document.visual_runtime_sha256],
    }[key] ?? [];
    if (candidates.some((candidate) => candidate === value)) return true;
  }
  return raw.includes(value);
}

function exactLessonBinding(document, record) {
  if (!document || typeof document !== "object" || !Array.isArray(document.lessonBindings)) return null;
  const row = document.lessonBindings.find((item) => item?.topicId === record.topicId && item?.slug === record.slug);
  return Boolean(row && row.version === record.version && row.contentSha256 === record.contentSha256);
}

async function inspectEvidence(kind, relative, record) {
  const absolute = approvedPath(relative);
  if (!absolute) return { pass: false, reason: "outside-approved-evidence-root" };
  let source;
  try { source = await readFile(absolute); } catch { return { pass: false, reason: "missing-evidence-file" }; }
  const raw = source.toString("utf8");
  let document = null;
  if (path.extname(absolute).toLowerCase() === ".json") {
    try { document = JSON.parse(raw); } catch { return { pass: false, reason: "invalid-evidence-json" }; }
  }
  if (!decisionPass(document, raw)) return { pass: false, reason: "evidence-not-pass" };
  if (buildBoundEvidence.has(kind) && !exactLessonBinding(document, record)) {
    return { pass: false, reason: "evidence-missing-exact-lesson-binding" };
  }
  for (const [key, value] of [["topicId", record.topicId], ["version", record.version], ["contentSha256", record.contentSha256]]) {
    if (!bound(document, raw, key, value)) return { pass: false, reason: `evidence-missing-${key}-binding` };
  }
  if (visualBoundEvidence.has(kind) && !bound(document, raw, "visualManifestSha256", record.visualManifestSha256)) return { pass: false, reason: "evidence-visual-manifest-mismatch" };
  if (visualBoundEvidence.has(kind) && !bound(document, raw, "visualSemanticSha256", record.visualSemanticSha256)) return { pass: false, reason: "evidence-visual-semantic-mismatch" };
  if (visualBoundEvidence.has(kind) && !bound(document, raw, "visualRuntimeSha256", record.visualRuntimeSha256)) return { pass: false, reason: "evidence-visual-runtime-mismatch" };
  const buildId = buildBoundEvidence.has(kind) ? extractBuildId(document, raw) : null;
  if (buildBoundEvidence.has(kind) && (typeof buildId !== "string" || !buildId)) return { pass: false, reason: "evidence-missing-build-id" };
  return { pass: true, sha256: sha256(source), buildId, path: relative };
}

const records = [];
for (const record of status.lessons ?? []) {
  const content = hashes.lessons.find((item) => item.topicId === record.topicId && item.slug === record.slug && item.version === record.version);
  const identityMatches = content?.contentSha256 === record.contentSha256;
  if (record.state !== "reviewed") {
    records.push({ topicId: record.topicId, slug: record.slug, version: record.version, contentSha256: record.contentSha256, visualManifestSha256, visualSemanticSha256, visualRuntimeSha256, approved: false, buildId: null, reason: "candidate-not-public" });
    continue;
  }
  const evidenceResults = {};
  for (const kind of requiredEvidence) evidenceResults[kind] = await inspectEvidence(kind, record.evidence?.[kind], record);
  const buildIds = [...new Set(Object.values(evidenceResults).map((item) => item.buildId).filter(Boolean))];
  const approved = identityMatches
    && record.visualManifestSha256 === visualManifestSha256
    && record.visualSemanticSha256 === visualSemanticSha256
    && record.visualRuntimeSha256 === visualRuntimeSha256
    && Object.values(evidenceResults).every((item) => item.pass)
    && buildBindingValid
    && buildIds.length === 1
    && buildIds[0] === expectedBuildId;
  records.push({
    topicId: record.topicId, slug: record.slug, version: record.version, contentSha256: record.contentSha256,
    visualManifestSha256, visualSemanticSha256, visualRuntimeSha256, approved, buildId: buildIds.length === 1 ? buildIds[0] : null,
    evidence: Object.fromEntries(Object.entries(evidenceResults).map(([kind, item]) => [kind, { path: item.path ?? record.evidence?.[kind] ?? null, sha256: item.sha256 ?? null, pass: item.pass, reason: item.reason ?? null }])),
    reason: approved ? null : !identityMatches ? "content-registry-mismatch" : record.visualManifestSha256 !== visualManifestSha256 ? "visual-manifest-mismatch" : record.visualSemanticSha256 !== visualSemanticSha256 ? "visual-semantic-mismatch" : record.visualRuntimeSha256 !== visualRuntimeSha256 ? "visual-runtime-mismatch" : !buildBindingValid ? "build-artifact-unbound" : buildIds.length !== 1 || buildIds[0] !== expectedBuildId ? "evidence-build-id-mismatch" : "invalid-evidence-set",
  });
}

const lock = { schemaVersion: 3, buildId: buildBindingValid ? expectedBuildId : null, statusSha256: sha256(statusSource), visualManifestSha256, visualSemanticSha256, visualRuntimeSha256, visualRuntimeComponents, records };
const outputDirectory = path.join(appRoot, "app/lib/paper2/generated");
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "evidence-lock.json"), `${JSON.stringify(lock, null, 2)}\n`);
console.log(JSON.stringify({ decision: "PASS", reviewedApproved: records.filter((record) => record.approved).length, candidatesLocked: records.filter((record) => !record.approved).length, buildBinding: { expectedBuildId, artifactBuildId, valid: buildBindingValid }, visualManifestSha256, visualSemanticSha256, visualRuntimeSha256 }, null, 2));
