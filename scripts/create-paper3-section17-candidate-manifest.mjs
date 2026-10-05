import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { section17CandidateFiles } from "./check-paper3-section17-oracle.mjs";

const authoringRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : null;
if (!root || root.toLowerCase() === authoringRoot.toLowerCase()) {
  throw new Error("PAPER3_PREVIEW_DIR must name an isolated candidate root");
}
const evidenceDir = path.resolve(authoringRoot, "../planning/paper3-2026/completion-program-2026/evidence/section17");
const outputPath = path.join(evidenceDir, "FINAL_PROMOTION_CANDIDATE_MANIFEST.json");
const baselinePath = path.join(evidenceDir, "SECTION17_BASELINE_STATUS.json");
const sha256 = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const [status, studyMap, buildId, baseline] = await Promise.all([
  readFile(path.join(root, "content/paper3/lesson-status.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper3/study-map.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, ".next/BUILD_ID"), "utf8").then(value => value.trim()),
  readFile(baselinePath, "utf8").then(JSON.parse),
]);
const available = status.lessons.length;
if (baseline.decision !== "PASS" || baseline.section17Entries !== 0) throw new Error("Invalid pre-promotion baseline evidence");
const section17Ids = new Set(["P3-17.1-T01", "P3-17.1-T02", "P3-17.1-T03", "P3-17.1-T04"]);
const candidateBaselineIdentities = status.lessons.filter(item => !section17Ids.has(item.topicId)).map(item => `${item.topicId}|${item.slug}`);
if (JSON.stringify(candidateBaselineIdentities) !== JSON.stringify(baseline.identities)) throw new Error("Candidate does not preserve the captured baseline identities");
if (available !== baseline.available + section17Ids.size) throw new Error("Candidate availability delta is not exactly four lessons");
const productFiles = await Promise.all(section17CandidateFiles.map(async relativePath => ({
  path: relativePath,
  expectedSha256: await sha256(path.join(root, relativePath)),
})));
const baselineEvidenceSha256 = await sha256(baselinePath);
const manifest = {
  schemaVersion: 1,
  candidate: "paper3-section17-candidate-20260930",
  generatedAt: new Date().toISOString(),
  sourceRoot: root,
  buildId,
  availability: {
    baselineAvailable: baseline.available,
    available,
    planned: studyMap.topics.length - available,
    total: studyMap.topics.length,
  },
  baseline: {
    evidenceFile: "SECTION17_BASELINE_STATUS.json",
    evidenceSha256: baselineEvidenceSha256,
    statusSha256: baseline.statusSha256,
    identities: baseline.identities,
  },
  productFiles,
};
await mkdir(evidenceDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, buildId, availability: manifest.availability, productFiles: productFiles.length }, null, 2));
