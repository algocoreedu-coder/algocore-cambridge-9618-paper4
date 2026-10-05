import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.PAPER3_TARGET_DIR) throw new Error("PAPER3_TARGET_DIR is required for isolated candidate staging");
const root = path.resolve(process.env.PAPER3_TARGET_DIR);
if (root.toLowerCase() === sourceRoot.toLowerCase()) throw new Error("Candidate staging refuses the shared authoring root");
const statusPath = path.join(root, "content/paper3/lesson-status.json");

const lessons = [
  { topicId: "P3-17.1-T01", slug: "confidentiality-and-key-choice" },
  { topicId: "P3-17.1-T02", slug: "quantum-cryptography" },
  { topicId: "P3-17.1-T03", slug: "ssl-tls-communication" },
  { topicId: "P3-17.1-T04", slug: "certificates-and-signatures" },
];

const sha256 = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const status = JSON.parse(await readFile(statusPath, "utf8"));
if (!Array.isArray(status.lessons)) throw new TypeError("lesson-status.json must contain a lessons array");

const before = status.lessons.length;
for (const lesson of lessons) {
  const contentPath = path.join(root, `content/paper3/lessons/${lesson.slug}.json`);
  const content = JSON.parse(await readFile(contentPath, "utf8"));
  if (content.topicId !== lesson.topicId || content.slug !== lesson.slug) {
    throw new Error(`Lesson identity mismatch: ${lesson.topicId}`);
  }
  const entry = {
    topicId: lesson.topicId,
    slug: lesson.slug,
    version: content.version,
    contentSha256: await sha256(contentPath),
    state: "reviewed",
  };
  const matching = status.lessons.filter(item => item.topicId === lesson.topicId || item.slug === lesson.slug);
  if (matching.length > 1) throw new Error(`Duplicate status identity: ${lesson.topicId}`);
  if (matching.length === 1) status.lessons[status.lessons.indexOf(matching[0])] = entry;
  else status.lessons.push(entry);
}

const identities = status.lessons.map(item => `${item.topicId}|${item.slug}`);
if (new Set(identities).size !== identities.length) throw new Error("lesson-status.json contains duplicate identities");
await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ root, baselineAvailable: before, available: status.lessons.length, promoted: lessons.length }, null, 2));
