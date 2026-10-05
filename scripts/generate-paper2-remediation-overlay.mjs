import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(root, "../..");
const reviewRelative = "A_Level_CS_page/planning/paper2/book-coverage-audit-2026-10-02/execution-2026-10-03/content-wave/LESSON_GAP_ACADEMIC_REVIEW.json";
const reviewSource = await readFile(path.join(workspaceRoot, reviewRelative));
const reviewRaw = reviewSource.toString("utf8");
const review = JSON.parse(reviewRaw);
const reviewDecision = String(review.decision ?? review.verdict ?? review.status ?? "").toUpperCase();
if (!reviewDecision.includes("PASS") && !reviewDecision.includes("PROMOTE")) throw new Error("Lesson-gap academic review has not approved remediation.");

const mapping = {
  "book:B91-05": ["T01", "B91-05"], "book:B91-07": ["T01", "B91-07"],
  "book:B92-08": ["T04", "B92-08"], "book:B92-09": ["T04", "B92-09"], "book:B92-11": ["T04", "B92-11"], "book:B92-14": ["T04", "B92-14"],
  "book:B102-14": ["T08", "B102-14"], "book:B103-07": ["T10", "B103-07"], "book:B104-10": ["T12", "B104-10"], "book:B104-16": ["T13", "B104-16"],
  "book:B111-13": ["T16", "B111-13"], "book:B111-14": ["T14", "B111-14"], "book:B113-12": ["T22", "B113-12"],
  "book:B121-11": ["T23", "B121-11"], "book:B121-12": ["T23", "B121-12"], "book:B122-09": ["T24", "B122-09"], "book:B123-01": ["T27", "B123-01"],
  "syllabus:9.2:09": ["T04", "SYL-P01"], "syllabus:9.2:11": ["T04", "SYL-P01"],
  "syllabus:11.1:08": ["T16", "SYL-P03"], "syllabus:11.3:10": ["T22", "SYL-P04"],
  "syllabus:12.1:07": ["T23", "SYL-P05"], "syllabus:12.2:04": ["T24", "SYL-P06"],
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const coverage = JSON.parse(await readFile(path.join(root, "content/paper2/coverage/coverage-map.json"), "utf8"));
const lessonFiles = (await readdir(path.join(root, "content/paper2/lessons"))).filter((file) => file.endsWith(".json"));
const lessons = new Map();
for (const file of lessonFiles) {
  const source = await readFile(path.join(root, "content/paper2/lessons", file));
  const lesson = JSON.parse(source.toString("utf8"));
  lessons.set(lesson.topicId, { topicId: lesson.topicId, slug: lesson.slug, version: lesson.version, contentSha256: sha256(source) });
}

const targetUnits = coverage.units.filter((unit) => ["book", "syllabus"].includes(unit.taxonomy) && unit.classification !== "full");
if (targetUnits.length !== 23 || targetUnits.some((unit) => !mapping[unit.coverageId])) throw new Error("Remediation mapping does not match the 23-unit Gate A gap set.");
const transitions = targetUnits.map((unit) => {
  const [topicId, reviewGapId] = mapping[unit.coverageId];
  const lesson = lessons.get(topicId);
  if (!lesson) throw new Error(`Missing remediation lesson ${topicId}.`);
  if (!reviewRaw.includes(reviewGapId) || !reviewRaw.includes(lesson.version) || !reviewRaw.includes(lesson.contentSha256)) throw new Error(`Academic review is not bound to ${unit.coverageId} and ${lesson.version}.`);
  return { coverageId: unit.coverageId, taxonomy: unit.taxonomy, sectionId: unit.sectionId, from: unit.classification, to: "full", evidence: lesson, reviewGapId };
});
const score = (taxonomy) => {
  const units = coverage.units.filter((unit) => unit.taxonomy === taxonomy);
  const upgraded = new Set(transitions.filter((item) => item.taxonomy === taxonomy).map((item) => item.coverageId));
  const full = units.filter((unit) => unit.classification === "full" || upgraded.has(unit.coverageId)).length;
  const partial = units.filter((unit) => unit.classification === "partial" && !upgraded.has(unit.coverageId)).length;
  const missing = units.filter((unit) => unit.classification === "missing" && !upgraded.has(unit.coverageId)).length;
  return { denominator: units.length, full, partial, missing, weightedPercent: Number(((full + partial * 0.5) / units.length * 100).toFixed(1)) };
};
const overlay = {
  schemaVersion: 1,
  documentId: "P2-ACADEMIC-REMEDIATION-OVERLAY-20261003",
  baselineDocumentId: coverage.documentId,
  purpose: "Preserve the measured Gate A baseline while recording independently reviewed remediation as a separate overlay.",
  decision: "ACADEMIC_COVERAGE_PASS_RENDERED_RELEASE_QA_REQUIRED",
  reviewEvidence: { path: reviewRelative, sha256: sha256(reviewSource), decision: reviewDecision },
  transitions,
  resultingCoverage: { book: score("book"), syllabus: score("syllabus") },
};
await writeFile(path.join(root, "content/paper2/coverage/remediation-overlay.json"), `${JSON.stringify(overlay, null, 2)}\n`);
console.log(JSON.stringify({ decision: "PASS", transitions: transitions.length, resultingCoverage: overlay.resultingCoverage }, null, 2));
