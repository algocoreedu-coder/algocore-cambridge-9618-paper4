import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const status = JSON.parse(await readFile(path.join(root, "content/paper2/lesson-status.json"), "utf8"));
const catalog = JSON.parse(await readFile(path.join(root, "content/paper2/study-map.json"), "utf8"));
const topicById = new Map(catalog.topics.map((topic) => [topic.id, topic]));
const pilotSlugs = new Set(["linear-search", "development-life-cycle", "structure-charts", "test-data"]);
const failures = [];
const checks = [];
const check = (id, condition, detail) => {
  checks.push({ id, pass: Boolean(condition), detail });
  if (!condition) failures.push({ id, detail });
};
const localized = (value) => value && typeof value.en === "string" && value.en.trim() && typeof value.vi === "string" && value.vi.trim();

check("status-schema", status.schemaVersion === 1 && Array.isArray(status.lessons), status.schemaVersion);
const seenTopics = new Set();
const seenSlugs = new Set();
for (const record of status.lessons ?? []) {
  const topic = topicById.get(record.topicId);
  check(`status-topic:${record.topicId}`, Boolean(topic && topic.slug === record.slug), record.slug);
  check(`status-unique:${record.topicId}`, !seenTopics.has(record.topicId) && !seenSlugs.has(record.slug), record.slug);
  seenTopics.add(record.topicId); seenSlugs.add(record.slug);
  check(`status-state:${record.topicId}`, record.state === "candidate" || record.state === "reviewed", record.state);
  check(`status-hash:${record.topicId}`, /^[a-f0-9]{64}$/.test(record.contentSha256 ?? ""), record.contentSha256);
  const file = path.join(root, "content/paper2/lessons", `${record.slug}.json`);
  let source;
  try { source = await readFile(file); } catch { source = null; }
  check(`content-exists:${record.topicId}`, Boolean(source), file);
  if (!source) continue;
  const digest = createHash("sha256").update(source).digest("hex");
  check(`content-hash:${record.topicId}`, digest === record.contentSha256, { expected: record.contentSha256, actual: digest });
  let lesson;
  try { lesson = JSON.parse(source.toString("utf8")); } catch { lesson = null; }
  check(`content-json:${record.topicId}`, Boolean(lesson), file);
  if (!lesson) continue;
  check(`content-identity:${record.topicId}`, lesson.schemaVersion === 1 && lesson.topicId === record.topicId && lesson.slug === record.slug && lesson.version === record.version, { topicId: lesson.topicId, slug: lesson.slug, version: lesson.version });
  check(`content-locale:${record.topicId}`, localized(lesson.title) && localized(lesson.question) && localized(lesson.opening), "title/question/opening");
  check(`content-six-anchors:${record.topicId}`, Array.isArray(lesson.theory) && lesson.theory.length > 0 && Array.isArray(lesson.workedExamples) && lesson.workedExamples.length > 0 && Array.isArray(lesson.practices) && lesson.practices.length >= 2 && Array.isArray(lesson.misconceptions) && lesson.misconceptions.length > 0 && lesson.recall && Array.isArray(lesson.takeaways), { theory: lesson.theory?.length, worked: lesson.workedExamples?.length, practice: lesson.practices?.length, misconceptions: lesson.misconceptions?.length });
  check(`content-visible-solutions:${record.topicId}`, lesson.workedExamples.every((item) => localized(item.answer) && item.officialMarks === null) && lesson.practices.every((item) => localized(item.answer) && item.officialMarks === null), "answers present; officialMarks null");
  check(`content-visuals:${record.topicId}`, Array.isArray(lesson.visual?.assetIds) && lesson.visual.assetIds.length > 0 && lesson.visual.assetIds.every((id) => topic.visualIds.includes(id)), lesson.visual?.assetIds);
}

for (const slug of pilotSlugs) {
  const file = path.join(root, "content/paper2/lessons", `${slug}.json`);
  let lesson = null;
  try { lesson = JSON.parse(await readFile(file, "utf8")); } catch { /* Authoring may not have produced the pilot yet. */ }
  check(`pilot-file:${slug}`, Boolean(lesson), file);
}

console.log(JSON.stringify({ schema_version: "paper2-lessons-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
