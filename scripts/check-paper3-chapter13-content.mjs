import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidence = path.resolve(root, "../planning/paper3-2026/completion-program-2026/evidence/chapter13");
const catalog = JSON.parse(await readFile(path.join(root, "content/paper3/study-map.json"), "utf8"));
const files = (await readdir(path.join(root, "content/paper3/lessons"))).filter(f => f.endsWith(".json")).sort();
const failures = []; const reports = [];
const check = (value, message) => { if (!value) failures.push(message); };
const text = (value, location) => check(value && typeof value.en === "string" && value.en.trim() && typeof value.vi === "string" && value.vi.trim(), `${location}: missing EN/VI text`);
const walk = (value, location) => {
  if (!value || typeof value !== "object") return;
  if ("en" in value || "vi" in value) text(value, location);
  for (const [key, entry] of Object.entries(value)) walk(entry, `${location}.${key}`);
};
const kinds = new Set(["enumeration", "pointers", "sets", "records", "file-organisation", "hashing", "collisions", "floating-conversion", "normalisation", "precision-range", "rounding-errors"]);
for (const file of files) {
  const raw = await readFile(path.join(root, "content/paper3/lessons", file), "utf8"); const lesson = JSON.parse(raw);
  const topic = catalog.topics.find(t => t.id === lesson.topicId);
  check(topic && topic.strandId.startsWith("13.") && topic.slug === lesson.slug && file === `${lesson.slug}.json`, `${file}: catalog mismatch`);
  check(lesson.schemaVersion === 1 && typeof lesson.version === "string", `${file}: schema/version missing`);
  walk(lesson, file);
  for (const field of ["title", "question", "opening"]) text(lesson[field], `${file}.${field}`);
  for (const field of ["objectives", "prerequisites", "glossary", "theory", "misconceptions", "checkpoints", "takeaways", "sources"]) check(Array.isArray(lesson[field]) && lesson[field].length > 0, `${file}.${field}: empty`);
  const sources = new Set(lesson.sources.map(s => s.id)); check(sources.size === lesson.sources.length, `${file}: duplicate source IDs`);
  for (const source of lesson.sources) {
    check(source.title && source.locator && ["syllabus", "book", "guide", "question-paper", "mark-scheme"].includes(source.kind), `${file}: incomplete source`);
    check(!source.url || /^https:\/\//.test(source.url), `${file}: source URL must be a public HTTPS URL`);
  }
  const refs = (entry, label) => { check(entry.sourceIds?.length > 0, `${file}.${label}: no source references`); for (const id of entry.sourceIds ?? []) check(sources.has(id), `${file}.${label}: dangling source ${id}`); };
  const ids = new Set();
  for (const block of lesson.theory) { check(block.id && !ids.has(block.id), `${file}: repeated/absent theory anchor`); ids.add(block.id); text(block.title, `${file}.${block.id}`); check(block.paragraphs?.length > 0, `${file}.${block.id}: no explanation`); refs(block, block.id); if (block.table) for (const row of block.table.rows) check(row.length === block.table.headers.length, `${file}.${block.id}: ragged table`); }
  check(kinds.has(lesson.visual.kind), `${file}: unsupported visual kind`); refs(lesson.visual, "visual");
  check(lesson.workedExample.origin === "algocore-authored" && lesson.workedExample.officialMarks === null, `${file}: unsupported official marking claim`);
  refs(lesson.workedExample, "workedExample");
  for (const step of lesson.workedExample.steps) for (const field of ["action", "why", "result"]) text(step[field], `${file}.${step.id}.${field}`);
  check(new Set(lesson.workedExample.steps.map(s => s.id)).size === lesson.workedExample.steps.length, `${file}: duplicate worked step`);
  const checkpointIds = new Set();
  for (const point of lesson.checkpoints) {
    check(point.id && !checkpointIds.has(point.id), `${file}: duplicate checkpoint`); checkpointIds.add(point.id);
    check(point.choices.length >= 2 && new Set(point.choices.map(c => c.id)).size === point.choices.length, `${file}.${point.id}: choices invalid`);
    check(point.choices.some(c => c.id === point.correctChoiceId), `${file}.${point.id}: answer absent`);
    for (const choice of point.choices) text(choice.feedback, `${file}.${point.id}.${choice.id}.feedback`);
  }
  check(lesson.checkpoints.some(p => p.transfer), `${file}: no transfer check`);
  for (const slug of lesson.relatedSlugs) check(catalog.topics.some(t => t.slug === slug), `${file}: dangling related topic ${slug}`);
  reports.push({ topicId: lesson.topicId, slug: lesson.slug, version: lesson.version, sha256: createHash("sha256").update(raw).digest("hex"), theoryBlocks: lesson.theory.length, workedSteps: lesson.workedExample.steps.length, checkpoints: lesson.checkpoints.length });
}
if (process.argv.includes("--complete")) {
  check(files.length === 11 && new Set(reports.map(r => r.topicId)).size === 11, "Complete Chapter 13 requires all eleven unique lessons");
  const registry = await readFile(path.join(root, "app/lib/paper3/lesson-registry.ts"), "utf8");
  const coverage = JSON.parse(await readFile(path.join(evidence, "TEACHER_COVERAGE_CH13.json"), "utf8"));
  for (const report of reports) {
    check(registry.includes(`"${report.slug}":`), `${report.slug}: missing route loader`);
    const frozen = coverage.lessonManifest.find(item => item.file === `content/paper3/lessons/${report.slug}.json`);
    check(frozen?.sha256 === report.sha256, `${report.slug}: content changed after Teacher freeze`);
  }
  check(coverage.items.length === 16, "Chapter 13 coverage must address all sixteen checklist items");
  for (const item of coverage.items) for (const link of item.actualLessonEvidence) {
    const lesson = JSON.parse(await readFile(path.join(root, link.contentFile), "utf8"));
    check(lesson.topicId === link.topicId, `${item.id}: coverage topic mismatch`);
    for (const id of link.theoryIds) check(lesson.theory.some(block => block.id === id), `${item.id}: missing theory ${id}`);
    for (const id of link.checkpointIds) check(lesson.checkpoints.some(point => point.id === id), `${item.id}: missing practice ${id}`);
  }
  const baseline = JSON.parse(await readFile(path.join(evidence, "BASELINE.json"), "utf8"));
  for (const [file, hash] of Object.entries(baseline.files)) check(createHash("sha256").update(await readFile(path.join(root, file))).digest("hex") === hash, `${file}: protected shared baseline changed`);
}
if (process.argv.includes("--reviewed")) {
  const manifest = JSON.parse(await readFile(path.join(root, "content/paper3/lesson-status.json"), "utf8"));
  check(manifest.lessons.length === 11 && new Set(manifest.lessons.map(item => item.topicId)).size === 11, "Review manifest must contain exactly eleven unique lessons");
  for (const lesson of manifest.lessons) {
    const report = reports.find(item => item.topicId === lesson.topicId);
    check(report && lesson.slug === report.slug && lesson.version === report.version && lesson.contentSha256 === report.sha256 && lesson.state === "reviewed", `${lesson.topicId}: availability does not match the reviewed content`);
  }
}
await mkdir(evidence, { recursive: true });
const result = { checkedAt: new Date().toISOString(), pass: failures.length === 0, scope: "Authoring schema, references and navigation; not academic or browser approval", lessons: reports, failures };
await writeFile(path.join(evidence, "CONTENT_CHECK.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ pass: result.pass, lessons: files.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
