import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(root, "../..");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const [coverage, overlay] = await Promise.all([
  readFile(path.join(root, "content/paper2/coverage/coverage-map.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/coverage/remediation-overlay.json"), "utf8").then(JSON.parse),
]);
const reviewSource = await readFile(path.join(workspaceRoot, overlay.reviewEvidence.path));
const failures = [];
const checks = [];
const check = (id, condition, detail) => { const item = { id, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) }; checks.push(item); if (!item.pass) failures.push(item); };
check("overlay-schema", overlay.schemaVersion === 1 && overlay.baselineDocumentId === coverage.documentId);
check("review-evidence-current", sha256(reviewSource) === overlay.reviewEvidence.sha256);
check("transition-count", overlay.transitions.length === 23, overlay.transitions.length);
check("transition-ids-unique", new Set(overlay.transitions.map((item) => item.coverageId)).size === overlay.transitions.length);
const baselineGaps = coverage.units.filter((unit) => ["book", "syllabus"].includes(unit.taxonomy) && unit.classification !== "full");
check("exact-baseline-gap-set", JSON.stringify([...baselineGaps.map((unit) => unit.coverageId)].sort()) === JSON.stringify([...overlay.transitions.map((item) => item.coverageId)].sort()));
for (const transition of overlay.transitions) {
  const unit = coverage.units.find((item) => item.coverageId === transition.coverageId);
  check(`transition:${transition.coverageId}`, unit?.classification === transition.from && transition.to === "full" && unit.taxonomy === transition.taxonomy);
  const lessonPath = path.join(root, "content/paper2/lessons", `${transition.evidence.slug}.json`);
  const lessonSource = await readFile(lessonPath);
  const lesson = JSON.parse(lessonSource.toString("utf8"));
  check(`evidence:${transition.coverageId}`, lesson.topicId === transition.evidence.topicId && lesson.version === transition.evidence.version && sha256(lessonSource) === transition.evidence.contentSha256);
}
const score = (taxonomy) => {
  const units = coverage.units.filter((unit) => unit.taxonomy === taxonomy);
  const upgraded = new Set(overlay.transitions.filter((item) => item.taxonomy === taxonomy).map((item) => item.coverageId));
  const full = units.filter((unit) => unit.classification === "full" || upgraded.has(unit.coverageId)).length;
  const partial = units.filter((unit) => unit.classification === "partial" && !upgraded.has(unit.coverageId)).length;
  const missing = units.filter((unit) => unit.classification === "missing" && !upgraded.has(unit.coverageId)).length;
  return { denominator: units.length, full, partial, missing, weightedPercent: Number(((full + partial * 0.5) / units.length * 100).toFixed(1)) };
};
const book = score("book"), syllabus = score("syllabus");
check("book-target", book.denominator === 150 && book.full === 150 && book.partial === 0 && book.missing === 0 && book.weightedPercent === 100, book);
check("syllabus-target", syllabus.denominator === 93 && syllabus.full === 93 && syllabus.partial === 0 && syllabus.missing === 0 && syllabus.weightedPercent === 100, syllabus);
check("declared-score-current", JSON.stringify(overlay.resultingCoverage) === JSON.stringify({ book, syllabus }));
console.log(JSON.stringify({ schemaVersion: "paper2-remediation-overlay-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, transitions: overlay.transitions.length, resultingCoverage: { book, syllabus }, failures }, null, 2));
if (failures.length) process.exitCode = 1;
