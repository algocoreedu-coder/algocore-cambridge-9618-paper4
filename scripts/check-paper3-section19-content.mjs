import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons } from "./check-paper3-section19-oracle.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section19");
const checks = [], failures = [];
const record = (id, pass, expected, actual) => { const row = { id, pass: Boolean(pass), expected, actual }; checks.push(row); if (!row.pass) failures.push(row); };
// Numeric answers such as "0", "5" and "−1" are valid localized labels, so
// the structural gate requires non-empty strings rather than an arbitrary
// minimum character count. The authoring validator separately checks that
// explanatory feedback is substantive.
const pair = value => Boolean(value && typeof value.en === "string" && value.en.trim().length >= 1 && typeof value.vi === "string" && value.vi.trim().length >= 1);
const sha = value => createHash("sha256").update(value).digest("hex");
const expectedCommands = ["write", "trace", "explain", "compare", "justify"];
const lessonResults = [];

for (const expected of lessons) {
  const file = path.join(ROOT, `content/paper3/lessons/${expected.slug}.json`);
  let raw = "", lesson = null;
  try { raw = await readFile(file, "utf8"); lesson = JSON.parse(raw); } catch (error) { record(`content:${expected.slug}:read`, false, "valid lesson JSON", error.message); continue; }
  record(`content:${expected.slug}:identity`, lesson.topicId === expected.topicId && lesson.slug === expected.slug && lesson.visual?.kind === expected.kind, expected, { topicId: lesson.topicId, slug: lesson.slug, kind: lesson.visual?.kind });
  record(`content:${expected.slug}:orientation`, pair(lesson.title) && pair(lesson.question) && pair(lesson.opening) && lesson.objectives?.length >= 4 && lesson.objectives.every(pair) && lesson.prerequisites?.length >= 2 && lesson.prerequisites.every(pair) && Number.isInteger(lesson.estimatedMinutes), "complete bilingual orientation", { objectives: lesson.objectives?.length, prerequisites: lesson.prerequisites?.length, estimatedMinutes: lesson.estimatedMinutes });
  record(`content:${expected.slug}:theory`, lesson.theory?.length >= 4 && lesson.theory.every(block => pair(block.title) && block.paragraphs?.length >= 1 && block.paragraphs.every(pair) && block.sourceIds?.length >= 1), ">=4 sourced bilingual theory blocks", lesson.theory?.length);
  record(`content:${expected.slug}:visual`, pair(lesson.visual?.title) && pair(lesson.visual?.introduction) && pair(lesson.visual?.task) && lesson.visual?.conventions?.length >= 3 && lesson.visual.conventions.every(pair), "bilingual visual contract with >=3 conventions", lesson.visual);
  record(`content:${expected.slug}:worked`, lesson.workedExample?.origin === "algocore-authored" && lesson.workedExample?.officialMarks === null && lesson.workedExample?.steps?.length >= 6 && lesson.workedExample.steps.every(step => pair(step.action) && pair(step.why) && pair(step.result)), ">=6 complete AlgoCore worked steps", lesson.workedExample?.steps?.length);
  const commandWords = lesson.recognition?.commandWords?.map(item => item.command) ?? [];
  record(`content:${expected.slug}:recognition`, lesson.recognition?.cues?.length >= 3 && lesson.recognition.cues.every(pair) && pair(lesson.recognition.distinguish) && lesson.recognition.method?.length >= 4 && lesson.recognition.method.every(pair) && commandWords.length === expectedCommands.length && expectedCommands.every(command => commandWords.includes(command)), "recognition cues, near miss, method and the exact five command words", { cues: lesson.recognition?.cues?.length, method: lesson.recognition?.method?.length, commandWords });
  record(`content:${expected.slug}:misconceptions`, lesson.misconceptions?.length >= 4 && lesson.misconceptions.every(item => pair(item.mistake) && pair(item.correction) && pair(item.selfCheck)), ">=4 bilingual misconception repairs with self-check", lesson.misconceptions?.length);
  record(`content:${expected.slug}:practice`, lesson.checkpoints?.length >= 6 && lesson.checkpoints.every(item => pair(item.prompt) && item.choices?.length >= 3 && item.choices.every(choice => pair(choice.label) && pair(choice.feedback)) && item.choices.some(choice => choice.id === item.correctChoiceId) && pair(item.explanation)), ">=6 checkpoints with per-choice bilingual feedback", lesson.checkpoints?.length);
  record(`content:${expected.slug}:recall`, pair(lesson.recall?.prompt) && lesson.recall?.answerPoints?.length >= 4 && lesson.recall.answerPoints.every(pair) && lesson.takeaways?.length >= 3 && lesson.takeaways.every(pair), "bilingual recall and takeaways", { answerPoints: lesson.recall?.answerPoints?.length, takeaways: lesson.takeaways?.length });
  const sourceKinds = new Set((lesson.sources ?? []).map(source => source.kind));
  record(`content:${expected.slug}:sources`, lesson.sources?.length >= 3 && sourceKinds.has("syllabus") && sourceKinds.has("book") && lesson.sources.every(source => source.id && source.title && source.locator && !/[A-Z]:\\|planning\/|build.?id|sha256/i.test(`${source.title} ${source.locator} ${source.url ?? ""}`)), "teacher references with syllabus/book and no internal metadata", { count: lesson.sources?.length, sourceKinds: [...sourceKinds] });
  record(`content:${expected.slug}:bilingual-json`, raw.includes('"en"') && raw.includes('"vi"') && !/TODO|TBD|placeholder/i.test(raw), "EN/VI without placeholder markers", "scanned");
  lessonResults.push({ topicId: lesson.topicId, slug: lesson.slug, visualKind: lesson.visual.kind, theoryBlocks: lesson.theory.length, workedSteps: lesson.workedExample.steps.length, checkpoints: lesson.checkpoints.length, misconceptions: lesson.misconceptions.length, commandWords: commandWords.length, sha256: sha(raw) });
}

let coverage = null;
try { coverage = JSON.parse(await readFile(path.join(EVIDENCE, "TEACHER_COVERAGE_SECTION19.json"), "utf8")); } catch (error) { record("coverage:read", false, "valid coverage ledger", error.message); }
if (coverage) {
  record("coverage:24", coverage.coverageCount === 24 && coverage.requiredCount === 24 && coverage.items?.length === 24 && coverage.items.every(item => item.contractStatus === "PASS_FOR_AUTHORING" && /P3-19\./.test(String(item.lessonId)) && item.sourceLocators?.length >= 1), "24 source-backed authoring rows", { coverageCount: coverage.coverageCount, requiredCount: coverage.requiredCount, rows: coverage.items?.length });
}
const lessonPage = await readFile(path.join(ROOT, "app/components/paper3-learning/lessons/LessonPage.tsx"), "utf8");
record("sources:learner-flow", lessonPage.includes("data-teacher-sources") && lessonPage.includes("Teacher references (optional)") && lessonPage.includes("Tài liệu giáo viên (tùy chọn)"), "collapsed optional teacher references after learner flow", "static contract");

const report = { schemaVersion: 1, gate: "paper3-section19-content", generatedAt: new Date().toISOString(), status: failures.length ? "FAIL" : "PASS", lessonCount: lessonResults.length, coverage: { passed: coverage?.coverageCount ?? 0, total: coverage?.requiredCount ?? 24 }, lessons: lessonResults, assertions: checks.length, failures, checks, limitations: ["Schema/content gate supplements independent teacher review; rendered equivalence and visual correctness are separate gates."] };
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "TEACHER_CONTENT_CHECK.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
