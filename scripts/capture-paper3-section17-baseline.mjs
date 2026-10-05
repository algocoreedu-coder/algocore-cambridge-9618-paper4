import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.resolve(root, "../planning/paper3-2026/completion-program-2026/evidence/section17");
const statusPath = path.join(root, "content/paper3/lesson-status.json");
const bytes = await readFile(statusPath);
const status = JSON.parse(bytes.toString("utf8"));
const section17 = status.lessons.filter(item => item.topicId.startsWith("P3-17."));
if (section17.length) throw new Error("Baseline capture must happen before Section 17 promotion");
const evidence = {
  schemaVersion: 1,
  gate: "paper3-section17-pre-promotion-baseline",
  capturedAt: new Date().toISOString(),
  decision: "PASS",
  statusSha256: createHash("sha256").update(bytes).digest("hex"),
  available: status.lessons.length,
  section17Entries: 0,
  identities: status.lessons.map(item => `${item.topicId}|${item.slug}`),
};
await mkdir(evidenceDir, { recursive: true });
const outputPath = path.join(evidenceDir, "SECTION17_BASELINE_STATUS.json");
await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, available: evidence.available, statusSha256: evidence.statusSha256 }, null, 2));
