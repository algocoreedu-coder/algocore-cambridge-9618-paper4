import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.resolve(root, "../planning/paper3-2026/completion-program-2026/evidence/section20");
const statusPath = path.join(root, "content/paper3/lesson-status.json");
const mapPath = path.join(root, "content/paper3/study-map.json");
const sha256 = value => createHash("sha256").update(value).digest("hex");

const [statusRaw, mapRaw] = await Promise.all([readFile(statusPath), readFile(mapPath)]);
const status = JSON.parse(statusRaw), studyMap = JSON.parse(mapRaw);
const section20Entries = status.lessons.filter(item => item.topicId.startsWith("P3-20."));
const topicIds = studyMap.topics.filter(item => item.id.startsWith("P3-20.")).map(item => `${item.id}|${item.slug}`);
const identities = status.lessons.map(item => `${item.topicId}|${item.slug}`);
const available = status.lessons.length, total = studyMap.topics.length, planned = total - available;
const failures = [];
if (section20Entries.length !== 0) failures.push(`Expected zero promoted Section 20 lessons, found ${section20Entries.length}`);
if (topicIds.length !== 9) failures.push(`Expected nine Section 20 study-map topics, found ${topicIds.length}`);
if (available !== 57 || planned !== 9 || total !== 66) failures.push(`Expected 57 available / 9 planned / 66 total, found ${available}/${planned}/${total}`);
const report = {
  schemaVersion: 1,
  gate: "paper3-section20-baseline",
  generatedAt: new Date().toISOString(),
  decision: failures.length ? "FAIL" : "PASS",
  available,
  planned,
  total,
  section20Entries: section20Entries.length,
  section20Topics: topicIds,
  statusSha256: sha256(statusRaw),
  studyMapSha256: sha256(mapRaw),
  identities,
  failures,
};
await mkdir(evidenceDir, { recursive: true });
await writeFile(path.join(evidenceDir, "SECTION20_BASELINE_STATUS.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
