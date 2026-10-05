import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = path.join(root, "content/paper2/lesson-status.json");
const academicPre = "planning/paper2/book-coverage-audit-2026-10-02/execution-2026-10-03/content-wave/LESSON_GAP_ACADEMIC_REVIEW.json";
const [status, hashes, lock, overlay] = await Promise.all([
  readFile(statusPath, "utf8").then(JSON.parse),
  readFile(path.join(root, "app/lib/paper2/generated/lesson-content-hashes.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "app/lib/paper2/generated/evidence-lock.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/coverage/remediation-overlay.json"), "utf8").then(JSON.parse),
]);
const changedTopics = new Set(overlay.transitions.map((item) => item.evidence.topicId));
const hashByTopic = new Map(hashes.lessons.map((item) => [item.topicId, item]));
if (status.lessons.length !== 32 || hashByTopic.size !== 32) throw new Error("Paper 2 full-candidate preparation requires 32 status and hash records.");
status.lessons = status.lessons.map((record) => {
  const identity = hashByTopic.get(record.topicId);
  if (!identity || identity.slug !== record.slug) throw new Error(`Missing content identity for ${record.topicId}.`);
  return {
    ...record,
    version: identity.version,
    contentSha256: identity.contentSha256,
    visualManifestSha256: lock.visualManifestSha256,
    visualSemanticSha256: lock.visualSemanticSha256,
    visualRuntimeSha256: lock.visualRuntimeSha256,
    state: "candidate",
    evidence: changedTopics.has(record.topicId) ? { academicPre } : { academicPre: record.evidence?.academicPre },
  };
});
await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`);
const allowlist = status.lessons.map((record) => `${record.topicId}@${record.version}`).join(",");
await writeFile(path.join(root, "app/lib/paper2/generated/candidate-allowlist.txt"), `${allowlist}\n`);
console.log(JSON.stringify({ decision: "PASS", candidates: status.lessons.length, changedAcademicPre: changedTopics.size, allowlistFile: "app/lib/paper2/generated/candidate-allowlist.txt", visualRuntimeSha256: lock.visualRuntimeSha256 }, null, 2));
