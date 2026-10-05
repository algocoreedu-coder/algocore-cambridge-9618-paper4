import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons } from "./check-paper3-section20-oracle.mjs";

const authoringRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : null;
if (!root || root.toLowerCase() === authoringRoot.toLowerCase()) throw new Error("PAPER3_PREVIEW_DIR must name an isolated candidate root");

const evidenceDir = path.resolve(authoringRoot, "../planning/paper3-2026/completion-program-2026/evidence/section20");
const baselinePath = path.join(evidenceDir, "SECTION20_BASELINE_STATUS.json");
const authoringStatusPath = path.join(authoringRoot, "content/paper3/lesson-status.json");
const candidateStatusPath = path.join(root, "content/paper3/lesson-status.json");
const sha = value => createHash("sha256").update(value).digest("hex");
const [baselineRaw, authoringStatusRaw, candidateStatusRaw] = await Promise.all([readFile(baselinePath), readFile(authoringStatusPath), readFile(candidateStatusPath)]);
const baseline = JSON.parse(baselineRaw);
if (baseline.decision !== "PASS" || baseline.section20Entries !== 0) throw new Error("Invalid Section 20 baseline evidence");
if (sha(authoringStatusRaw) !== baseline.statusSha256) throw new Error("Authoring lesson status changed after baseline capture");

const status = JSON.parse(candidateStatusRaw);
const sectionIds = new Set(lessons.map(item => item.topicId));
const baselineEntries = status.lessons.filter(item => !sectionIds.has(item.topicId));
if (JSON.stringify(baselineEntries.map(item => `${item.topicId}|${item.slug}`)) !== JSON.stringify(baseline.identities)) throw new Error("Candidate does not preserve captured baseline identities");
const promoted = await Promise.all(lessons.map(async lesson => {
  const raw = await readFile(path.join(root, `content/paper3/lessons/${lesson.slug}.json`));
  const data = JSON.parse(raw);
  if (data.topicId !== lesson.topicId || data.slug !== lesson.slug || data.visual?.kind !== lesson.kind) throw new Error(`Lesson identity/visual mismatch: ${lesson.slug}`);
  return { topicId: lesson.topicId, slug: lesson.slug, version: data.version, contentSha256: sha(raw), state: "reviewed" };
}));
status.lessons = [...baselineEntries, ...promoted];
await writeFile(candidateStatusPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");
const result = { schemaVersion: 1, gate: "paper3-section20-candidate-status-preparation", decision: "PASS", candidateRoot: root, baselineAvailable: baseline.available, available: status.lessons.length, planned: baseline.planned - lessons.length, promoted: promoted.map(item => `${item.topicId}|${item.slug}`), authoringStatusUnchanged: sha(await readFile(authoringStatusPath)) === baseline.statusSha256 };
await writeFile(path.join(evidenceDir, "SECTION20_CANDIDATE_PREPARATION.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

