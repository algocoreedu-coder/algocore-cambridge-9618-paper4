import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, section17CandidateFiles as candidateFiles } from "./check-paper3-section17-oracle.mjs";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : null;
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section17");
const RESULT_FILE = path.join(EVIDENCE_DIR, "QA_FINAL_PROMOTION_RESULT.json");
const expectedBuildId = process.env.PAPER3_EXPECTED_BUILD_ID ?? null;
const manifestPath = process.env.PAPER3_SECTION17_MANIFEST ?? path.join(EVIDENCE_DIR, "FINAL_PROMOTION_CANDIDATE_MANIFEST.json");
const teacherPostPath = process.env.PAPER3_SECTION17_TEACHER_POST ?? path.join(EVIDENCE_DIR, "TEACHER_POST_RENDER.json");
const reviewPath = process.env.PAPER3_SECTION17_CODE_REVIEW ?? path.join(EVIDENCE_DIR, "CODE_REVIEW.md");
const defaultBaselinePath = path.join(EVIDENCE_DIR, "SECTION17_BASELINE_STATUS.json");
const statusFile = "content/paper3/lesson-status.json";
const studyMapFile = "content/paper3/study-map.json";
const startedAt = new Date().toISOString();
const checks = [];

const record = (id, pass, expected, actual) => checks.push({ id, pass: Boolean(pass), expected, actual });
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const readJson = async file => JSON.parse(await readFile(file, "utf8"));
const sha256 = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const samePath = (a, b) => Boolean(a && b) && path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();

async function loadEvidence(id, file) {
  if (!(await exists(file))) {
    record(id, false, `Evidence file exists: ${file}`, "missing");
    return null;
  }
  try { return await readJson(file); }
  catch (error) {
    record(id, false, "Valid JSON evidence", error.message);
    return null;
  }
}

async function loadReview() {
  if (!(await exists(reviewPath))) {
    record("S17-PROMOTION-CODE-REVIEW-FILE", false, `Evidence file exists: ${reviewPath}`, "missing");
    return null;
  }
  const text = await readFile(reviewPath, "utf8");
  const decision = /^Decision:\s*(PASS|FAIL)\s*$/im.exec(text)?.[1] ?? null;
  const openSevere = text.split(/\r?\n/).filter(line => /^\|/.test(line) && /\b(Blocker|High)\b/i.test(line) && /\bOPEN\b/i.test(line));
  return { decision, openSevere, sha256: createHash("sha256").update(text).digest("hex") };
}

await mkdir(EVIDENCE_DIR, { recursive: true });

record("S17-PROMOTION-ISOLATED-ROOT", ROOT && !samePath(ROOT, AUTHORING_ROOT), "Named isolated preview root different from the authoring checkout", ROOT);
record("S17-PROMOTION-EXPECTED-BUILD", Boolean(expectedBuildId), "Explicit PAPER3_EXPECTED_BUILD_ID", expectedBuildId);

let actualBuildId = null;
if (ROOT && await exists(path.join(ROOT, ".next/BUILD_ID"))) actualBuildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim();
record("S17-PROMOTION-BUILD-ID", Boolean(expectedBuildId) && actualBuildId === expectedBuildId, expectedBuildId, actualBuildId);

const [oracle, models, browser, teacherContent, teacherPost, review, manifest] = await Promise.all([
  loadEvidence("S17-PROMOTION-ORACLE-FILE", path.join(EVIDENCE_DIR, "QA_ORACLE_RESULT.json")),
  loadEvidence("S17-PROMOTION-MODELS-FILE", path.join(EVIDENCE_DIR, "QA_MODELS_RESULT.json")),
  loadEvidence("S17-PROMOTION-BROWSER-FILE", path.join(EVIDENCE_DIR, "QA_BROWSER_RESULT.json")),
  loadEvidence("S17-PROMOTION-TEACHER-CONTENT-FILE", path.join(EVIDENCE_DIR, "TEACHER_CONTENT_CHECK.json")),
  loadEvidence("S17-PROMOTION-TEACHER-POST-FILE", teacherPostPath),
  loadReview(),
  loadEvidence("S17-PROMOTION-MANIFEST-FILE", manifestPath),
]);

let baseline = null;
let baselinePath = defaultBaselinePath;
if (manifest?.baseline?.evidenceFile) baselinePath = path.resolve(EVIDENCE_DIR, manifest.baseline.evidenceFile);
if (!baselinePath.toLowerCase().startsWith(`${EVIDENCE_DIR.toLowerCase()}${path.sep}`) && baselinePath.toLowerCase() !== defaultBaselinePath.toLowerCase()) {
  record("S17-PROMOTION-BASELINE-PATH", false, "Baseline evidence remains inside the Section 17 evidence directory", baselinePath);
} else {
  baseline = await loadEvidence("S17-PROMOTION-BASELINE-FILE", baselinePath);
}

if (oracle) record("S17-PROMOTION-ORACLE", oracle.decision === "PASS" && oracle.fixtureCounts?.keyRoleCombinations === 60 && oracle.fixtureCounts?.quantumTransmissions === 24 && oracle.fixtureCounts?.tlsScenarios === 4, "Independent oracle PASS with complete reviewed fixture counts", { decision: oracle.decision, fixtureCounts: oracle.fixtureCounts });
if (models) record("S17-PROMOTION-MODELS", models.decision === "PASS" && models.buildId === actualBuildId && models.sourceBoundToIsolatedPreview && samePath(models.sourceRoot, ROOT) && models.coverage?.validKeyOperations === 6 && models.coverage?.quantumTransmissions === 24 && models.coverage?.tlsScenarios === 4, "Independent model PASS bound to this isolated build and reviewed truth tables", { decision: models.decision, buildId: models.buildId, sourceRoot: models.sourceRoot, isolated: models.sourceBoundToIsolatedPreview, coverage: models.coverage });
if (browser) record("S17-PROMOTION-BROWSER", browser.decision === "PASS" && browser.buildId === actualBuildId && browser.isolatedPreview && samePath(browser.previewRoot, ROOT) && browser.consoleErrors?.length === 0 && browser.runtimeErrors?.length === 0 && browser.coverage?.lessons === 4 && browser.coverage?.locales === 2 && JSON.stringify(browser.coverage?.viewports) === JSON.stringify([320, 768, 1440]) && browser.coverage?.regressionChecks >= 19 && browser.coverage?.regressionSurfaces?.length === 8, "Browser PASS for 4 lessons × EN/VI plus exact-build shared regressions with no runtime errors", { decision: browser.decision, buildId: browser.buildId, previewRoot: browser.previewRoot, coverage: browser.coverage, failures: browser.failures });
if (teacherContent) record("S17-PROMOTION-TEACHER-CONTENT", (teacherContent.decision ?? teacherContent.status) === "PASS" && teacherContent.lessonCount === 4 && teacherContent.coverage?.passed === 15 && teacherContent.coverage?.total === 15, "Teacher content gate PASS for all 15 syllabus rows and four lessons", { status: teacherContent.decision ?? teacherContent.status, lessonCount: teacherContent.lessonCount, coverage: teacherContent.coverage });
if (teacherPost) {
  const [manifestSha256, browserSha256, modelsSha256] = await Promise.all([
    exists(manifestPath).then(found => found ? sha256(manifestPath) : null),
    sha256(path.join(EVIDENCE_DIR, "QA_BROWSER_RESULT.json")),
    sha256(path.join(EVIDENCE_DIR, "QA_MODELS_RESULT.json")),
  ]);
  const findingCount = (teacherPost.blockers?.length ?? 0) + (teacherPost.findings?.length ?? 0);
  record("S17-PROMOTION-TEACHER-POST", (teacherPost.decision ?? teacherPost.status) === "PASS" && teacherPost.buildId === actualBuildId && findingCount === 0 && teacherPost.candidateManifestSha256 === manifestSha256 && teacherPost.qaBrowserSha256 === browserSha256 && teacherPost.qaModelsSha256 === modelsSha256, "Teacher post-render PASS is hash-bound to the exact build, manifest and final QA evidence with zero findings", { status: teacherPost.decision ?? teacherPost.status, buildId: teacherPost.buildId, findingCount, expectedHashes: { manifestSha256, browserSha256, modelsSha256 }, teacherHashes: { manifestSha256: teacherPost.candidateManifestSha256, browserSha256: teacherPost.qaBrowserSha256, modelsSha256: teacherPost.qaModelsSha256 } });
}
if (review) record("S17-PROMOTION-CODE-REVIEW", review.decision === "PASS" && review.openSevere.length === 0, "Independent code review PASS with no OPEN Blocker/High finding", review);

if (baseline && manifest) {
  const evidenceSha256 = await sha256(baselinePath);
  const authoringStatusSha256 = await sha256(path.join(AUTHORING_ROOT, statusFile));
  const baselineHasSection17 = baseline.identities?.some(identity => identity.startsWith("P3-17."));
  record("S17-PROMOTION-BASELINE-EVIDENCE", baseline.decision === "PASS" && baseline.section17Entries === 0 && baseline.available === baseline.identities?.length && !baselineHasSection17 && manifest.baseline?.evidenceSha256 === evidenceSha256 && manifest.baseline?.statusSha256 === baseline.statusSha256 && manifest.baseline?.statusSha256 === authoringStatusSha256 && JSON.stringify(manifest.baseline?.identities) === JSON.stringify(baseline.identities), "Manifest is byte-bound to an independent pre-promotion baseline with no Section 17 entries", { baselineDecision: baseline.decision, section17Entries: baseline.section17Entries, available: baseline.available, identityCount: baseline.identities?.length, baselineHasSection17, evidenceSha256, manifestEvidenceSha256: manifest.baseline?.evidenceSha256, statusSha256: baseline.statusSha256, authoringStatusSha256 });
}

let status = null;
let studyMap = null;
if (ROOT) {
  try { status = await readJson(path.join(ROOT, statusFile)); } catch (error) { record("S17-PROMOTION-STATUS-READ", false, "Readable promoted lesson status", error.message); }
  try { studyMap = await readJson(path.join(ROOT, studyMapFile)); } catch (error) { record("S17-PROMOTION-MAP-READ", false, "Readable Study Map", error.message); }
}

if (status) {
  const sectionEntries = lessons.map(lesson => status.lessons.find(entry => entry.topicId === lesson.topicId && entry.slug === lesson.slug));
  const hashes = await Promise.all(sectionEntries.map(async (entry, index) => entry ? sha256(path.join(ROOT, `content/paper3/lessons/${lessons[index].slug}.json`)) : null));
  const identities = status.lessons.map(entry => `${entry.topicId}|${entry.slug}`);
  record("S17-PROMOTION-STATUS-UNIQUE", new Set(identities).size === identities.length, "Every reviewed topicId/slug pair is unique", identities.filter((id, index) => identities.indexOf(id) !== index));
  record("S17-PROMOTION-SECTION17-STATUS", sectionEntries.every((entry, index) => entry?.state === "reviewed" && entry.contentSha256 === hashes[index]), "Four canonical Section 17 entries reviewed with exact content hashes", sectionEntries.map((entry, index) => ({ entry, actualSha256: hashes[index] })));
  const allHashChecks = await Promise.all(status.lessons.map(async entry => {
    const safe = typeof entry.slug === "string" && /^[a-z0-9-]+$/.test(entry.slug);
    const lessonFile = safe ? path.join(ROOT, `content/paper3/lessons/${entry.slug}.json`) : null;
    const actual = lessonFile && await exists(lessonFile) ? await sha256(lessonFile) : null;
    return { topicId: entry.topicId, slug: entry.slug, state: entry.state, expected: entry.contentSha256, actual, pass: safe && entry.state === "reviewed" && actual === entry.contentSha256 };
  }));
  record("S17-PROMOTION-ALL-STATUS-HASHES", allHashChecks.every(item => item.pass), "Every promoted status entry is reviewed and matches its lesson content hash", allHashChecks.filter(item => !item.pass));
  if (manifest) {
    const baselineCount = manifest.availability?.baselineAvailable;
    const promotedCount = manifest.availability?.available;
    const plannedCount = manifest.availability?.planned;
    record("S17-PROMOTION-STATUS-DELTA", Number.isInteger(baselineCount) && promotedCount === baselineCount + lessons.length && status.lessons.length === promotedCount && studyMap && plannedCount === studyMap.topics.length - promotedCount, "Manifest derives availability from its baseline plus four Section 17 lessons", { baselineCount, promotedCount, plannedCount, statusCount: status.lessons.length, totalTopics: studyMap?.topics?.length });
    if (baseline) {
      const sectionIds = new Set(lessons.map(lesson => lesson.topicId));
      const baselineIdentities = status.lessons.filter(entry => !sectionIds.has(entry.topicId)).map(entry => `${entry.topicId}|${entry.slug}`);
      const promotedIdentities = status.lessons.filter(entry => sectionIds.has(entry.topicId)).map(entry => `${entry.topicId}|${entry.slug}`);
      const expectedPromotedIdentities = lessons.map(lesson => `${lesson.topicId}|${lesson.slug}`);
      record("S17-PROMOTION-EXACT-DELTA", JSON.stringify(baselineIdentities) === JSON.stringify(baseline.identities) && JSON.stringify(promotedIdentities) === JSON.stringify(expectedPromotedIdentities), "Candidate status is the exact captured baseline plus the four canonical Section 17 identities", { baselineIdentities, expectedBaselineIdentities: baseline.identities, promotedIdentities, expectedPromotedIdentities });
    }
  }
}

if (studyMap) {
  const mapped = lessons.map(lesson => studyMap.topics?.find(topic => topic.id === lesson.topicId && topic.slug === lesson.slug));
  record("S17-PROMOTION-STUDY-MAP", studyMap.topics?.length === 66 && mapped.every(Boolean), "66-topic Study Map contains the four canonical Section 17 topics", { total: studyMap.topics?.length, mapped });
}

if (manifest && ROOT) {
  const productFiles = Array.isArray(manifest.productFiles) ? manifest.productFiles : [];
  const manifestPaths = productFiles.map(item => item.path).sort();
  const requiredPaths = [...candidateFiles].sort();
  const hashChecks = [];
  for (const item of productFiles) {
    const absolute = path.resolve(ROOT, item.path);
    const inside = path.relative(ROOT, absolute) && !path.relative(ROOT, absolute).startsWith("..") && !path.isAbsolute(path.relative(ROOT, absolute));
    const actual = inside && await exists(absolute) ? await sha256(absolute) : null;
    hashChecks.push({ path: item.path, expected: item.expectedSha256, actual, inside, pass: inside && actual === item.expectedSha256 });
  }
  record("S17-PROMOTION-MANIFEST-BUILD", manifest.buildId === actualBuildId, actualBuildId, manifest.buildId);
  record("S17-PROMOTION-MANIFEST-SCOPE", JSON.stringify(manifestPaths) === JSON.stringify(requiredPaths), requiredPaths, manifestPaths);
  record("S17-PROMOTION-MANIFEST-HASHES", hashChecks.length === requiredPaths.length && hashChecks.every(item => item.pass), "Manifest binds every required route, availability, shared-control, Section 17 product and lesson dependency", hashChecks);
}

const failures = checks.filter(check => !check.pass);
const report = {
  schemaVersion: 1,
  gate: "paper3-section17-final-promotion",
  startedAt,
  completedAt: new Date().toISOString(),
  decision: failures.length ? "FAIL" : "PASS",
  authoringRoot: AUTHORING_ROOT,
  previewRoot: ROOT,
  buildId: actualBuildId,
  expectedBuildId,
  manifestPath,
  teacherPostPath,
  reviewPath,
  checksRun: checks.length,
  checksPassed: checks.length - failures.length,
  failures,
  checks,
  limitations: ["This gate aggregates independently generated model, browser, teacher and code-review evidence; it does not regenerate those results."],
};
await writeFile(RESULT_FILE, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (report.decision !== "PASS") process.exitCode = 1;
