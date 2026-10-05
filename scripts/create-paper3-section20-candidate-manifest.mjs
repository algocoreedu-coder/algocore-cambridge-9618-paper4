import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, section20CandidateFiles } from "./check-paper3-section20-oracle.mjs";

const authoringRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : null;
if (!root || root.toLowerCase() === authoringRoot.toLowerCase()) throw new Error("PAPER3_PREVIEW_DIR must name an isolated candidate root");
const evidenceDir = path.resolve(authoringRoot, "../planning/paper3-2026/completion-program-2026/evidence/section20");
const outputPath = path.join(evidenceDir, "CANDIDATE_MANIFEST.json");
const baselinePath = path.join(evidenceDir, "SECTION20_BASELINE_STATUS.json");
const sha256 = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const [status, studyMap, buildId, baseline] = await Promise.all([
  readFile(path.join(root, "content/paper3/lesson-status.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper3/study-map.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, ".next/BUILD_ID"), "utf8").then(value => value.trim()),
  readFile(baselinePath, "utf8").then(JSON.parse),
]);
if (baseline.decision !== "PASS" || baseline.section20Entries !== 0) throw new Error("Invalid Section 20 baseline evidence");
const sectionIds = new Set(lessons.map(item => item.topicId));
const candidateBaselineIdentities = status.lessons.filter(item => !sectionIds.has(item.topicId)).map(item => `${item.topicId}|${item.slug}`);
if (JSON.stringify(candidateBaselineIdentities) !== JSON.stringify(baseline.identities)) throw new Error("Candidate does not preserve captured baseline identities");
if (status.lessons.length !== baseline.available + lessons.length) throw new Error("Candidate availability delta is not exactly nine lessons");
const productFiles = await Promise.all(section20CandidateFiles.map(async relativePath => ({ path: relativePath, expectedSha256: await sha256(path.join(root, relativePath)) })));
const manifest = { schemaVersion: 1, candidate: "paper3-section20-candidate-20260930", generatedAt: new Date().toISOString(), sourceRoot: root, buildId, availability: { baselineAvailable: baseline.available, available: status.lessons.length, planned: studyMap.topics.length - status.lessons.length, total: studyMap.topics.length }, baseline: { evidenceFile: "SECTION20_BASELINE_STATUS.json", evidenceSha256: await sha256(baselinePath), statusSha256: baseline.statusSha256, identities: baseline.identities }, productFiles };
await mkdir(evidenceDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, buildId, availability: manifest.availability, productFiles: productFiles.length }, null, 2));

