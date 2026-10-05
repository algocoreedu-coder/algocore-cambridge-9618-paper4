import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, section20CandidateFiles as candidateFiles } from "./check-paper3-section20-oracle.mjs";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : null;
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section20");
const RESULT_FILE = path.join(EVIDENCE_DIR, "QA_FINAL_PROMOTION_RESULT.json");
const expectedBuildId = process.env.PAPER3_EXPECTED_BUILD_ID ?? null;
const manifestPath = process.env.PAPER3_SECTION20_MANIFEST ?? path.join(EVIDENCE_DIR, "CANDIDATE_MANIFEST.json");
const baselinePath = path.join(EVIDENCE_DIR, "SECTION20_BASELINE_STATUS.json");
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
    const data = await loadJsonEvidence(`S20-${baseName}-JSON`, jsonPath);
    return data ? { decision: data.decision ?? data.status, buildId: data.buildId ?? null, findings: [...(data.blockers ?? []), ...(data.findings ?? [])], data, path: jsonPath, sha256: await sha256(jsonPath) } : null;
  }
  if (await exists(mdPath)) {
    const text = await readFile(mdPath, "utf8");
    return { decision: /^Decision:\s*(PASS|FAIL)\s*$/im.exec(text)?.[1] ?? null, buildId: /^Build ID:\s*`?([^`\r\n]+)`?\s*$/im.exec(text)?.[1] ?? null, findings: text.split(/\r?\n/).filter(line => /^\|/.test(line) && /\b(?:Blocker|High)\b/i.test(line) && /\bOPEN\b/i.test(line)), data: null, path: mdPath, sha256: createHash("sha256").update(text).digest("hex") };
  }
  record(`S20-${baseName}-FILE`, false, `${baseName}.json or .md exists`, "missing"); return null;
}

await mkdir(EVIDENCE_DIR, { recursive: true });
record("S20-PROMOTION-ISOLATED-ROOT", ROOT && !samePath(ROOT, AUTHORING_ROOT), "explicit isolated candidate root", ROOT);
record("S20-PROMOTION-EXPECTED-BUILD", Boolean(expectedBuildId), "PAPER3_EXPECTED_BUILD_ID", expectedBuildId);
let actualBuildId = null;
if (ROOT && await exists(path.join(ROOT, ".next/BUILD_ID"))) actualBuildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim();
record("S20-PROMOTION-BUILD-ID", Boolean(expectedBuildId) && actualBuildId === expectedBuildId, expectedBuildId, actualBuildId);

const [oracle, addressingAssembly, oop, declarative, fileQa, exceptionQa, visuals, browser, content, baseline, manifest, teacherPre, teacherPost, review] = await Promise.all([
  loadJsonEvidence("S20-ORACLE-FILE", path.join(EVIDENCE_DIR, "SECTION20_ORACLE_RESULT.json")),
  loadJsonEvidence("S20-ADDRESSING-ASSEMBLY-FILE", path.join(EVIDENCE_DIR, "QA_ADDRESSING_ASSEMBLY_RESULT.json")),
  loadJsonEvidence("S20-OOP-FILE", path.join(EVIDENCE_DIR, "QA_OOP_RESULT.json")),
  loadJsonEvidence("S20-DECLARATIVE-FILE", path.join(EVIDENCE_DIR, "QA_DECLARATIVE_RESULT.json")),
  loadJsonEvidence("S20-FILE-FILE", path.join(EVIDENCE_DIR, "QA_FILE_RESULT.json")),
  loadJsonEvidence("S20-EXCEPTION-FILE", path.join(EVIDENCE_DIR, "QA_EXCEPTION_RESULT.json")),
  loadJsonEvidence("S20-VISUALS-FILE", path.join(EVIDENCE_DIR, "QA_VISUALS_RESULT.json")),
  loadJsonEvidence("S20-BROWSER-FILE", path.join(EVIDENCE_DIR, "QA_BROWSER_RESULT.json")),
  loadJsonEvidence("S20-CONTENT-FILE", path.join(EVIDENCE_DIR, "TEACHER_CONTENT_CHECK.json")),
  loadJsonEvidence("S20-BASELINE-FILE", baselinePath),
  loadJsonEvidence("S20-MANIFEST-FILE", manifestPath),
  loadDecision("TEACHER_PREIMPLEMENTATION"), loadDecision("TEACHER_POST_RENDER"), loadDecision("CODE_REVIEW"),
]);

if (oracle) record("S20-PROMOTION-ORACLE", oracle.decision === "PASS" && (oracle.assertions ?? 0) >= 250 && oracle.failures?.length === 0, "independent oracle PASS against the reviewed Section 20 fixtures", { decision: oracle.decision, assertions: oracle.assertions, failures: oracle.failures });
const modelReports = [addressingAssembly, oop, declarative, fileQa, exceptionQa].filter(Boolean);
record("S20-PROMOTION-MODEL-FAMILIES", modelReports.length === 5 && modelReports.every(report => report.decision === "PASS" && report.buildId === actualBuildId && report.sourceBoundToIsolatedPreview && samePath(report.sourceRoot ?? report.previewRoot, ROOT) && report.failures?.length === 0), "all five model family gates PASS on the exact isolated candidate", modelReports.map(report => ({ gate: report.gate, decision: report.decision, assertions: report.assertions, buildId: report.buildId, root: report.sourceRoot ?? report.previewRoot, failures: report.failures?.length })));
if (visuals) record("S20-PROMOTION-VISUALS", visuals.decision === "PASS" && visuals.sourceBoundToIsolatedPreview && samePath(visuals.sourceRoot ?? visuals.previewRoot, ROOT), "static visual contract PASS on isolated candidate", { decision: visuals.decision, root: visuals.sourceRoot ?? visuals.previewRoot, failures: visuals.failures });
if (browser) record("S20-PROMOTION-BROWSER", browser.decision === "PASS" && browser.buildId === actualBuildId && browser.isolatedPreview && samePath(browser.previewRoot, ROOT) && browser.consoleErrors?.length === 0 && browser.runtimeErrors?.length === 0 && browser.coverage?.lessons === 9 && browser.coverage?.locales === 2 && JSON.stringify(browser.coverage?.viewports) === JSON.stringify([320, 768, 1440]) && (browser.coverage?.regressionChecks ?? 0) >= 8, "browser PASS for nine lessons, two locales, three viewports and shared regressions", { decision: browser.decision, buildId: browser.buildId, coverage: browser.coverage, failures: browser.failures });
if (content) record("S20-PROMOTION-CONTENT", (content.decision ?? content.status) === "PASS" && content.lessonCount === 9 && content.coverage?.passed === 29 && content.coverage?.total === 29, "content PASS for 9 lessons and 29/29 syllabus coverage", { decision: content.decision ?? content.status, lessonCount: content.lessonCount, coverage: content.coverage });
if (teacherPre) record("S20-PROMOTION-TEACHER-PRE", typeof teacherPre.decision === "string" && teacherPre.decision.startsWith("PASS") && teacherPre.findings.length === 0, "teacher preimplementation PASS/PASS_FOR_IMPLEMENTATION with no open finding", teacherPre);
if (review) record("S20-PROMOTION-CODE-REVIEW", review.decision === "PASS" && review.findings.length === 0, "independent code review PASS with no OPEN Blocker/High", review);

if (teacherPost && manifest && modelReports.length === 5 && browser) {
  const [manifestHash, addressingAssemblyHash, oopHash, declarativeHash, fileHash, exceptionHash, browserHash] = await Promise.all(["CANDIDATE_MANIFEST.json", "QA_ADDRESSING_ASSEMBLY_RESULT.json", "QA_OOP_RESULT.json", "QA_DECLARATIVE_RESULT.json", "QA_FILE_RESULT.json", "QA_EXCEPTION_RESULT.json", "QA_BROWSER_RESULT.json"].map(name => sha256(path.join(EVIDENCE_DIR, name))));
  const data = teacherPost.data ?? {};
  const expected = { candidateManifestSha256: manifestHash, qaAddressingAssemblySha256: addressingAssemblyHash, qaOopSha256: oopHash, qaDeclarativeSha256: declarativeHash, qaFileSha256: fileHash, qaExceptionSha256: exceptionHash, qaBrowserSha256: browserHash };
  record("S20-PROMOTION-TEACHER-POST", teacherPost.decision === "PASS" && teacherPost.buildId === actualBuildId && teacherPost.findings.length === 0 && Object.entries(expected).every(([key, value]) => data[key] === value), "teacher post-render PASS hash-bound to manifest and every exact-build model/browser QA report", { decision: teacherPost.decision, buildId: teacherPost.buildId, expected, actual: Object.fromEntries(Object.keys(expected).map(key => [key, data[key]])), findings: teacherPost.findings });
}

if (baseline && manifest) {
  const baselineEvidenceHash = await sha256(baselinePath), authoringStatusHash = await sha256(path.join(AUTHORING_ROOT, statusFile));
  record("S20-PROMOTION-BASELINE", baseline.decision === "PASS" && baseline.section20Entries === 0 && baseline.available === baseline.identities?.length && baseline.total === baseline.available + baseline.planned && manifest.baseline?.evidenceSha256 === baselineEvidenceHash && manifest.baseline?.statusSha256 === baseline.statusSha256 && authoringStatusHash === baseline.statusSha256 && JSON.stringify(manifest.baseline?.identities) === JSON.stringify(baseline.identities), "candidate manifest is byte-bound to the unchanged captured pre-promotion baseline", { baseline, baselineEvidenceHash, authoringStatusHash, manifestBaseline: manifest.baseline });
}

let status = null, studyMap = null;
if (ROOT) {
  try { status = await readJson(path.join(ROOT, statusFile)); } catch (error) { record("S20-STATUS-READ", false, "read candidate status", error.message); }
  try { studyMap = await readJson(path.join(ROOT, studyMapFile)); } catch (error) { record("S20-MAP-READ", false, "read candidate map", error.message); }
}
if (status && studyMap && baseline) {
  const sectionIds = new Set(lessons.map(lesson => lesson.topicId));
  const entries = lessons.map(lesson => status.lessons.find(entry => entry.topicId === lesson.topicId && entry.slug === lesson.slug));
  const hashes = await Promise.all(lessons.map(lesson => sha256(path.join(ROOT, `content/paper3/lessons/${lesson.slug}.json`))));
  record("S20-PROMOTION-SECTION-STATUS", entries.every((entry, index) => entry?.state === "reviewed" && entry.contentSha256 === hashes[index]), "nine reviewed Section 20 entries with exact content hashes", entries.map((entry, index) => ({ entry, actualHash: hashes[index] })));
  const baselineIdentities = status.lessons.filter(entry => !sectionIds.has(entry.topicId)).map(entry => `${entry.topicId}|${entry.slug}`);
  const promotedIdentities = status.lessons.filter(entry => sectionIds.has(entry.topicId)).map(entry => `${entry.topicId}|${entry.slug}`);
  record("S20-PROMOTION-EXACT-DELTA", JSON.stringify(baselineIdentities) === JSON.stringify(baseline.identities) && JSON.stringify(promotedIdentities) === JSON.stringify(lessons.map(lesson => `${lesson.topicId}|${lesson.slug}`)), "candidate status is exact baseline plus nine canonical Section 20 identities", { baselineIdentities, promotedIdentities });
  record("S20-PROMOTION-COUNTS", status.lessons.length === baseline.available + 9 && studyMap.topics.length - status.lessons.length === baseline.planned - 9 && status.lessons.length === 66 && studyMap.topics.length - status.lessons.length === 0, "availability 57->66 and planned 9->0 derived from catalog/status", { available: status.lessons.length, planned: studyMap.topics.length - status.lessons.length, total: studyMap.topics.length });
}

if (manifest && ROOT) {
  const productFiles = Array.isArray(manifest.productFiles) ? manifest.productFiles : [], manifestPaths = productFiles.map(item => item.path).sort(), requiredPaths = [...candidateFiles].sort(), hashChecks = [];
  for (const item of productFiles) {
    const absolute = path.resolve(ROOT, item.path), relative = path.relative(ROOT, absolute), inside = relative && !relative.startsWith("..") && !path.isAbsolute(relative);
    const actual = inside && await exists(absolute) ? await sha256(absolute) : null;
    hashChecks.push({ path: item.path, expected: item.expectedSha256, actual, inside, pass: inside && actual === item.expectedSha256 });
  }
  record("S20-PROMOTION-MANIFEST-BUILD", manifest.buildId === actualBuildId, actualBuildId, manifest.buildId);
  record("S20-PROMOTION-MANIFEST-SCOPE", JSON.stringify(manifestPaths) === JSON.stringify(requiredPaths), requiredPaths, manifestPaths);
  record("S20-PROMOTION-MANIFEST-HASHES", hashChecks.length === requiredPaths.length && hashChecks.every(item => item.pass), "all candidate dependencies hash-bound", hashChecks);
}

const failures = checks.filter(check => !check.pass);
const report = { schemaVersion: 1, gate: "paper3-section20-final-promotion", startedAt, completedAt: new Date().toISOString(), decision: failures.length ? "FAIL" : "PASS", authoringRoot: AUTHORING_ROOT, previewRoot: ROOT, buildId: actualBuildId, expectedBuildId, manifestPath, checksRun: checks.length, checksPassed: checks.length - failures.length, failures, checks, limitations: ["This aggregate gate consumes independent model, visual, browser, teacher and review evidence; it does not regenerate them."] };
await writeFile(RESULT_FILE, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (report.decision !== "PASS") process.exitCode = 1;


