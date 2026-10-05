import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lessonDirectory = path.join(root, "content/paper2/lessons");
const outputDirectory = path.join(root, "app/lib/paper2/generated");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const files = (await readdir(lessonDirectory)).filter((name) => name.endsWith(".json")).sort();
const lessons = [];
for (const filename of files) {
  const source = await readFile(path.join(lessonDirectory, filename));
  const lesson = JSON.parse(source.toString("utf8"));
  if (lesson.schemaVersion !== 1 || typeof lesson.topicId !== "string" || typeof lesson.slug !== "string" || typeof lesson.version !== "string") {
    throw new Error(`${filename} does not expose the Paper 2 lesson identity required for the hash registry.`);
  }
  if (filename !== `${lesson.slug}.json`) throw new Error(`${filename} does not match lesson slug ${lesson.slug}.`);
  lessons.push({ topicId: lesson.topicId, slug: lesson.slug, version: lesson.version, contentSha256: sha256(source) });
}
const registry = { schemaVersion: 1, algorithm: "sha256-raw-bytes", lessons };
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "lesson-content-hashes.json"), `${JSON.stringify(registry, null, 2)}\n`);
console.log(JSON.stringify({ decision: "PASS", lessons: lessons.length, output: "app/lib/paper2/generated/lesson-content-hashes.json" }, null, 2));
