import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = path.resolve(appRoot, "..");
const statusPath = path.join(appRoot, "content/paper2/lesson-status.json");
const releaseRoot = "planning/paper2/book-coverage-audit-2026-10-02/execution-2026-10-03/release-review";
const releaseEvidence = {
  academicPost: `${releaseRoot}/ACADEMIC_POST_RENDER.json`,
  visualReview: `${releaseRoot}/VISUAL_REVIEW.json`,
  codeReview: `${releaseRoot}/CODE_REVIEW.json`,
  qa: `${releaseRoot}/QA_REVIEW.json`,
};

const [status, hashes, lock] = await Promise.all([
  readFile(statusPath, "utf8").then(JSON.parse),
  readFile(path.join(appRoot, "app/lib/paper2/generated/lesson-content-hashes.json"), "utf8").then(JSON.parse),
  readFile(path.join(appRoot, "app/lib/paper2/generated/evidence-lock.json"), "utf8").then(JSON.parse),
]);

await Promise.all(Object.values(releaseEvidence).map((relative) => access(path.join(projectRoot, relative))));

const hashByTopic = new Map(hashes.lessons.map((lesson) => [lesson.topicId, lesson]));
if (status.lessons?.length !== 32 || hashByTopic.size !== 32) {
  throw new Error("Paper 2 promotion requires exactly 32 lesson status and content-hash records.");
}
if (![lock.visualManifestSha256, lock.visualSemanticSha256, lock.visualRuntimeSha256].every((value) => /^[a-f0-9]{64}$/.test(value ?? ""))) {
  throw new Error("Paper 2 promotion requires current visual manifest, semantic and runtime hashes.");
}

status.lessons = status.lessons.map((record) => {
  const identity = hashByTopic.get(record.topicId);
  if (!identity || identity.slug !== record.slug) throw new Error(`Missing content identity for ${record.topicId}.`);
  if (!record.evidence?.academicPre) throw new Error(`Missing academic pre-review evidence for ${record.topicId}.`);
  return {
    ...record,
    version: identity.version,
    contentSha256: identity.contentSha256,
    visualManifestSha256: lock.visualManifestSha256,
    visualSemanticSha256: lock.visualSemanticSha256,
    visualRuntimeSha256: lock.visualRuntimeSha256,
    state: "reviewed",
    evidence: {
      academicPre: record.evidence.academicPre,
      ...releaseEvidence,
    },
  };
});

await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`);
console.log(JSON.stringify({
  decision: "PASS",
  promoted: status.lessons.length,
  state: "reviewed",
  evidence: releaseEvidence,
  visualManifestSha256: lock.visualManifestSha256,
  visualSemanticSha256: lock.visualSemanticSha256,
  visualRuntimeSha256: lock.visualRuntimeSha256,
}, null, 2));
