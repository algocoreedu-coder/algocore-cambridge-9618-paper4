import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, section18CandidateFiles as candidateFiles } from "./check-paper3-section18-oracle.mjs";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : null;
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section18");
const RESULT_FILE = path.join(EVIDENCE_DIR, "QA_FINAL_PROMOTION_RESULT.json");
const expectedBuildId = process.env.PAPER3_EXPECTED_BUILD_ID ?? null;
const manifestPath = process.env.PAPER3_SECTION18_MANIFEST ?? path.join(EVIDENCE_DIR, "CANDIDATE_MANIFEST.json");
const baselinePath = path.join(EVIDENCE_DIR, "SECTION18_BASELINE_STATUS.json");
const statusFile = "content/paper3/lesson-status.json";
const studyMapFile = "content/paper3/study-map.json";
const startedAt = new Date().toISOString();
const checks = [];

const record = (id, pass, expected, actual) => checks.push({ id, pass: Boolean(pass), expected, actual });
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const readJson = async file => JSON.parse(await readFile(file, "utf8"));
const sha256 = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const samePath = (a, b) => Boolean(a && b) && path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();

async function loadJsonEvidence(id, file) {
  if (!(await exists(file))) { record(id, false, `file exists: ${file}`, "missing"); return null; }
  try { return await readJson(file); } catch (error) { record(id, false, "valid JSON", error.message); return null; }
}

async function loadDecision(baseName) {
  const jsonPath = path.join(EVIDENCE_DIR, `${baseName}.json`), mdPath = path.join(EVIDENCE_DIR, `${baseName}.md`);
  if (await exists(jsonPath)) {
    const data = await loadJsonEvidence(`S18-${baseName}-JSON`, jsonPath);
    return data ? { decision: data.decision ?? data.status, buildId: data.buildId ?? null, findings: [...(data.blockers ?? []), ...(data.findings ?? [])], data, path: jsonPath, sha256: await sha256(jsonPath) } : null;
  }
  if (await exists(mdPath)) {
    const text = await readFile(mdPath, "utf8");
    return { decision: /^Decision:\s*(PASS|FAIL)\s*$/im.exec(text)?.[1] ?? null, buildId: /^Build ID:\s*`?([^`\r\n]+)`?\s*$/im.exec(text)?.[1] ?? null, findings: text.split(/\r?\n/).filter(line => /^\|/.test(line) && /\b(?:Blocker|High)\b/i.test(line) && /\bOPEN\b/i.test(line)), data: null, path: mdPath, sha256: createHash("sha256").update(text).digest("hex") };
  }
  record(`S18-${baseName}-FILE`, false, `${baseName}.json or .md exists`, "missing"); return null;
}

await mkdir(EVIDENCE_DIR, { recursive: true });
record("S18-PROMOTION-ISOLATED-ROOT", ROOT && !samePath(ROOT, AUTHORING_ROOT), "explicit isolated candidate root", ROOT);
record("S18-PROMOTION-EXPECTED-BUILD", Boolean(expectedBuildId), "PAPER3_EXPECTED_BUILD_ID", expectedBuildId);
let actualBuildId = null;
if (ROOT && await exists(path.join(ROOT, ".next/BUILD_ID"))) actualBuildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim();
record("S18-PROMOTION-BUILD-ID", Boolean(expectedBuildId) && actualBuildId === expectedBuildId, expectedBuildId, actualBuildId);

const [oracle, models, visuals, browser, content, baseline, manifest, teacherPre, teacherPost, review] = await Promise.all([
  loadJsonEvidence("S18-ORACLE-FILE", path.join(EVIDENCE_DIR, "QA_ORACLE_RESULT.json")),
  loadJsonEvidence("S18-MODELS-FILE", path.join(EVIDENCE_DIR, "QA_MODELS_RESULT.json")),
  loadJsonEvidence("S18-VISUALS-FILE", path.join(EVIDENCE_DIR, "QA_VISUALS_RESULT.json")),
  loadJsonEvidence("S18-BROWSER-FILE", path.join(EVIDENCE_DIR, "QA_BROWSER_RESULT.json")),
  loadJsonEvidence("S18-CONTENT-FILE", path.join(EVIDENCE_DIR, "TEACHER_CONTENT_CHECK.json")),
  loadJsonEvidence("S18-BASELINE-FILE", baselinePath),
  loadJsonEvidence("S18-MANIFEST-FILE", manifestPath),
  loadDecision("TEACHER_PREIMPLEMENTATION"), loadDecision("TEACHER_POST_RENDER"), loadDecision("CODE_REVIEW"),
]);

if (oracle) record("S18-PROMOTION-ORACLE", oracle.decision === "PASS" && oracle.fixtureCounts?.dijkstraScenarios === 3 && oracle.fixtureCounts?.aStarScenarios === 3 && oracle.fixtureCounts?.learningScenarios === 4 && oracle.fixtureCounts?.neuralRuns === 4 && oracle.fixtureCounts?.backpropagationScenarios === 2 && oracle.fixtureCounts?.regressionPredictions === 2, "independent oracle PASS with all reviewed fixture families", { decision: oracle.decision, counts: oracle.fixtureCounts });
if (models) record("S18-PROMOTION-MODELS", models.decision === "PASS" && models.buildId === actualBuildId && models.sourceBoundToIsolatedPreview && samePath(models.sourceRoot, ROOT) && models.coverage?.dijkstraScenarios === 3 && models.coverage?.aStarScenarios === 3 && models.coverage?.learningScenarios === 4, "model PASS bound to exact isolated build", { decision: models.decision, buildId: models.buildId, root: models.sourceRoot, coverage: models.coverage });
if (visuals) record("S18-PROMOTION-VISUALS", visuals.decision === "PASS" && visuals.sourceBoundToIsolatedPreview && samePath(visuals.sourceRoot, ROOT), "static visual contract PASS on isolated candidate", { decision: visuals.decision, root: visuals.sourceRoot, failures: visuals.failures });
if (browser) record("S18-PROMOTION-BROWSER", browser.decision === "PASS" && browser.buildId === actualBuildId && browser.isolatedPreview && samePath(browser.previewRoot, ROOT) && browser.consoleErrors?.length === 0 && browser.runtimeErrors?.length === 0 && browser.coverage?.lessons === 6 && browser.coverage?.locales === 2 && JSON.stringify(browser.coverage?.viewports) === JSON.stringify([320, 768, 1440]) && (browser.coverage?.regressionChecks ?? 0) >= 20, "browser PASS for six lessons, two locales, three viewports and shared regressions", { decision: browser.decision, buildId: browser.buildId, coverage: browser.coverage, failures: browser.failures });
if (content) record("S18-PROMOTION-CONTENT", content.status === "PASS" && content.lessonCount === 6 && content.coverage?.passed === 14 && content.coverage?.total === 14, "content PASS for 6 lessons and 14/14 coverage", { status: content.status, lessonCount: content.lessonCount, coverage: content.coverage });
if (teacherPre) record("S18-PROMOTION-TEACHER-PRE", typeof teacherPre.decision === "string" && teacherPre.decision.startsWith("PASS") && teacherPre.findings.length === 0, "teacher preimplementation PASS/PASS_FOR_IMPLEMENTATION with no open finding", teacherPre);
if (review) record("S18-PROMOTION-CODE-REVIEW", review.decision === "PASS" && review.findings.length === 0, "independent code review PASS with no OPEN Blocker/High", review);

if (teacherPost && manifest && models && browser) {
  const [manifestHash, modelHash, browserHash] = await Promise.all([sha256(manifestPath), sha256(path.join(EVIDENCE_DIR, "QA_MODELS_RESULT.json")), sha256(path.join(EVIDENCE_DIR, "QA_BROWSER_RESULT.json"))]);
  const data = teacherPost.data ?? {};
  record("S18-PROMOTION-TEACHER-POST", teacherPost.decision === "PASS" && teacherPost.buildId === actualBuildId && teacherPost.findings.length === 0 && data.candidateManifestSha256 === manifestHash && data.qaModelsSha256 === modelHash && data.qaBrowserSha256 === browserHash, "teacher post-render PASS hash-bound to manifest and exact-build QA", { decision: teacherPost.decision, buildId: teacherPost.buildId, hashes: { expected: { manifestHash, modelHash, browserHash }, actual: { manifestHash: data.candidateManifestSha256, modelHash: data.qaModelsSha256, browserHash: data.qaBrowserSha256 } }, findings: teacherPost.findings });
}

if (baseline && manifest) {
  const baselineEvidenceHash = await sha256(baselinePath), authoringStatusHash = await sha256(path.join(AUTHORING_ROOT, statusFile));
  record("S18-PROMOTION-BASELINE", baseline.decision === "PASS" && baseline.section18Entries === 0 && baseline.available === baseline.identities?.length && baseline.total === baseline.available + baseline.planned && manifest.baseline?.evidenceSha256 === baselineEvidenceHash && manifest.baseline?.statusSha256 === baseline.statusSha256 && authoringStatusHash === baseline.statusSha256 && JSON.stringify(manifest.baseline?.identities) === JSON.stringify(baseline.identities), "candidate manifest is byte-bound to the unchanged captured pre-promotion baseline", { baseline, baselineEvidenceHash, authoringStatusHash, manifestBaseline: manifest.baseline });
}

let status = null, studyMap = null;
if (ROOT) {
  try { status = await readJson(path.join(ROOT, statusFile)); } catch (error) { record("S18-STATUS-READ", false, "read candidate status", error.message); }
  try { studyMap = await readJson(path.join(ROOT, studyMapFile)); } catch (error) { record("S18-MAP-READ", false, "read candidate map", error.message); }
}
if (status && studyMap && baseline) {
  const sectionIds = new Set(lessons.map(lesson => lesson.topicId));
  const entries = lessons.map(lesson => status.lessons.find(entry => entry.topicId === lesson.topicId && entry.slug === lesson.slug));
  const hashes = await Promise.all(lessons.map(lesson => sha256(path.join(ROOT, `content/paper3/lessons/${lesson.slug}.json`))));
  record("S18-PROMOTION-SECTION-STATUS", entries.every((entry, index) => entry?.state === "reviewed" && entry.contentSha256 === hashes[index]), "six reviewed Section 18 entries with exact content hashes", entries.map((entry, index) => ({ entry, actualHash: hashes[index] })));
  const baselineIdentities = status.lessons.filter(entry => !sectionIds.has(entry.topicId)).map(entry => `${entry.topicId}|${entry.slug}`);
  const promotedIdentities = status.lessons.filter(entry => sectionIds.has(entry.topicId)).map(entry => `${entry.topicId}|${entry.slug}`);
  record("S18-PROMOTION-EXACT-DELTA", JSON.stringify(baselineIdentities) === JSON.stringify(baseline.identities) && JSON.stringify(promotedIdentities) === JSON.stringify(lessons.map(lesson => `${lesson.topicId}|${lesson.slug}`)), "candidate status is exact baseline plus six canonical Section 18 identities", { baselineIdentities, promotedIdentities });
  record("S18-PROMOTION-COUNTS", status.lessons.length === baseline.available + 6 && studyMap.topics.length - status.lessons.length === baseline.planned - 6, "availability 38->44 and planned 28->22 derived from catalog/status", { available: status.lessons.length, planned: studyMap.topics.length - status.lessons.length, total: studyMap.topics.length });
}

if (manifest && ROOT) {
  const productFiles = Array.isArray(manifest.productFiles) ? manifest.productFiles : [], manifestPaths = productFiles.map(item => item.path).sort(), requiredPaths = [...candidateFiles].sort(), hashChecks = [];
  for (const item of productFiles) {
    const absolute = path.resolve(ROOT, item.path), relative = path.relative(ROOT, absolute), inside = relative && !relative.startsWith("..") && !path.isAbsolute(relative);
    const actual = inside && await exists(absolute) ? await sha256(absolute) : null;
    hashChecks.push({ path: item.path, expected: item.expectedSha256, actual, inside, pass: inside && actual === item.expectedSha256 });
  }
  record("S18-PROMOTION-MANIFEST-BUILD", manifest.buildId === actualBuildId, actualBuildId, manifest.buildId);
  record("S18-PROMOTION-MANIFEST-SCOPE", JSON.stringify(manifestPaths) === JSON.stringify(requiredPaths), requiredPaths, manifestPaths);
  record("S18-PROMOTION-MANIFEST-HASHES", hashChecks.length === requiredPaths.length && hashChecks.every(item => item.pass), "all candidate dependencies hash-bound", hashChecks);
}

const failures = checks.filter(check => !check.pass);
const report = { schemaVersion: 1, gate: "paper3-section18-final-promotion", startedAt, completedAt: new Date().toISOString(), decision: failures.length ? "FAIL" : "PASS", authoringRoot: AUTHORING_ROOT, previewRoot: ROOT, buildId: actualBuildId, expectedBuildId, manifestPath, checksRun: checks.length, checksPassed: checks.length - failures.length, failures, checks, limitations: ["This aggregate gate consumes independent model, visual, browser, teacher and review evidence; it does not regenerate them."] };
await writeFile(RESULT_FILE, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (report.decision !== "PASS") process.exitCode = 1;
