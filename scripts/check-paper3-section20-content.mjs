import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const EVIDENCE = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section20");
const lessons = [
  ["P3-20.1-T01", "paradigms-and-procedural-design", "paradigm-procedural", ["imperative", "FUNCTION", "RETURN", "facts"]],
  ["P3-20.1-T02", "five-addressing-modes", "addressing-modes", ["LDM", "LDD", "LDI", "LDX", "JMR", "IX"]],
  ["P3-20.1-T03", "assembly-execution-and-construction", "assembly-workbench", ["CMP", "JPE", "STO", "END"]],
  ["P3-20.1-T04", "class-object-design-and-encapsulation", "oop-encapsulation", ["PRIVATE", "GetBalance", "receiver", "instance"]],
  ["P3-20.1-T05", "inheritance-polymorphism-and-aggregation", "oop-relationships", ["INHERITS", "actual type", "is-a", "has-a"]],
  ["P3-20.1-T06", "declarative-facts-rules-and-goals", "declarative-inference", [" IF ", " AND ", "goal", "binding"]],
  ["P3-20.2-T01", "serial-sequential-text-file-workflows", "sequential-files", ["OPENFILE", "READFILE", "WRITEFILE", "EOF", "APPEND"]],
  ["P3-20.2-T02", "random-file-record-operations", "random-files", ["SEEK", "GETRECORD", "PUTRECORD", "recordNumber"]],
  ["P3-20.2-T03", "exceptions-and-controlled-recovery", "exception-flow", ["ZeroDivisionError", "skipped", "finally", "unhandled"]],
];
const commands = ["write", "trace", "explain", "compare", "justify"];
const checks = [];
const failures = [];
const record = (id, pass, expected, actual) => {
  const row = { id, pass: Boolean(pass), expected, actual };
  checks.push(row);
  if (!row.pass) failures.push(row);
};
const pair = value => Boolean(value && typeof value.en === "string" && value.en.trim() && typeof value.vi === "string" && value.vi.trim());
const sha = raw => createHash("sha256").update(raw).digest("hex");
const results = [];

for (const [topicId, slug, visualKind, tokens] of lessons) {
  let raw = "";
  let item;
  try {
    raw = await readFile(path.join(ROOT, `content/paper3/lessons/${slug}.json`), "utf8");
    item = JSON.parse(raw);
  } catch (error) {
    record(`${slug}:read`, false, "valid JSON", error.message);
    continue;
  }
  record(`${slug}:identity`, item.schemaVersion === 1 && item.topicId === topicId && item.slug === slug && item.visual?.kind === visualKind, { topicId, slug, visualKind }, { topicId: item.topicId, slug: item.slug, visualKind: item.visual?.kind });
  record(`${slug}:orientation`, pair(item.title) && pair(item.question) && pair(item.opening) && item.objectives?.length >= 4 && item.objectives.every(pair) && item.prerequisites?.length >= 2 && item.prerequisites.every(pair) && Number.isInteger(item.estimatedMinutes), "bilingual orientation with 4 objectives and 2 prerequisites", { objectives: item.objectives?.length, prerequisites: item.prerequisites?.length });
  record(`${slug}:theory`, item.theory?.length === 4 && item.theory.every(block => block.id && pair(block.title) && block.paragraphs?.length && block.paragraphs.every(pair) && block.sourceIds?.length >= 2), "exactly four sourced bilingual theory blocks", item.theory?.length);
  record(`${slug}:visual`, pair(item.visual?.title) && pair(item.visual?.introduction) && pair(item.visual?.task) && item.visual?.conventions?.length >= 3 && item.visual.conventions.every(pair), "complete bilingual visual contract", item.visual?.conventions?.length);
  record(`${slug}:worked`, item.workedExample?.origin === "algocore-authored" && item.workedExample?.officialMarks === null && item.workedExample?.steps?.length === 6 && item.workedExample.steps.every(step => step.id && pair(step.action) && pair(step.why) && pair(step.result) && pair(step.check)), "six complete AlgoCore-authored worked states", item.workedExample?.steps?.length);
  const actualCommands = item.recognition?.commandWords?.map(row => row.command) ?? [];
  record(`${slug}:recognition`, item.recognition?.cues?.length >= 4 && item.recognition.cues.every(pair) && pair(item.recognition.distinguish) && item.recognition.method?.length >= 4 && item.recognition.method.every(pair) && commands.every(command => actualCommands.includes(command)), "cues, near-miss, method and five command words", { cues: item.recognition?.cues?.length, method: item.recognition?.method?.length, actualCommands });
  record(`${slug}:misconceptions`, item.misconceptions?.length === 4 && item.misconceptions.every(row => pair(row.mistake) && pair(row.correction) && pair(row.selfCheck)), "four repaired misconceptions with self-check", item.misconceptions?.length);
  record(`${slug}:practice`, item.checkpoints?.length === 6 && item.checkpoints.every(row => row.id && pair(row.prompt) && row.choices?.length === 3 && row.choices.every(choice => choice.id && pair(choice.label) && pair(choice.feedback)) && row.choices.some(choice => choice.id === row.correctChoiceId) && pair(row.explanation)) && item.checkpoints.some(row => row.transfer === true), "six checkpoints, three choices, choice feedback and transfer", item.checkpoints?.length);
  record(`${slug}:recall`, pair(item.recall?.prompt) && item.recall?.answerPoints?.length >= 4 && item.recall.answerPoints.every(pair) && item.takeaways?.length >= 4 && item.takeaways.every(pair), "recall with four answer points and four takeaways", { answerPoints: item.recall?.answerPoints?.length, takeaways: item.takeaways?.length });
  const sourceKinds = new Set((item.sources ?? []).map(source => source.kind));
  const sourceIds = new Set((item.sources ?? []).map(source => source.id));
  const usedIds = new Set([...(item.theory ?? []).flatMap(block => block.sourceIds ?? []), ...(item.visual?.sourceIds ?? []), ...(item.workedExample?.sourceIds ?? [])]);
  record(`${slug}:sources`, item.sources?.length >= 5 && sourceKinds.has("syllabus") && sourceKinds.has("book") && sourceKinds.has("guide") && sourceKinds.has("question-paper") && sourceKinds.has("mark-scheme") && [...usedIds].every(id => sourceIds.has(id)) && item.sources.every(source => source.id && source.title && source.locator && !/[A-Z]:\\|planning\/|build.?id|sha256/i.test(`${source.title} ${source.locator} ${source.url ?? ""}`)), "five teacher source kinds, valid IDs and no internal metadata", { count: item.sources?.length, kinds: [...sourceKinds] });
  record(`${slug}:academic-tokens`, tokens.every(token => raw.toLowerCase().includes(token.toLowerCase())), tokens, tokens.filter(token => raw.toLowerCase().includes(token.toLowerCase())));
  record(`${slug}:bilingual-json`, raw.includes('"en"') && raw.includes('"vi"') && !/TODO|TBD|placeholder/i.test(raw) && !raw.includes("Teacher source audit"), "EN/VI learner content without placeholders or audit prose", "scanned");
  results.push({ topicId, slug, visualKind, theoryBlocks: item.theory.length, workedSteps: item.workedExample.steps.length, checkpoints: item.checkpoints.length, misconceptions: item.misconceptions.length, sources: item.sources.length, sha256: sha(raw) });
}

let coverage;
try { coverage = JSON.parse(await readFile(path.join(EVIDENCE, "TEACHER_COVERAGE_SECTION20.json"), "utf8")); }
catch (error) { record("coverage:read", false, "valid coverage ledger", error.message); }
if (coverage) {
  record("coverage:29", coverage.decision === "PASS_FOR_AUTHORING" && coverage.mapped === 29 && coverage.required === 29 && coverage.items?.length === 29 && coverage.items.every(row => row.status === "MAPPED_FOR_AUTHORING" && /^P3-20\./.test(row.lessonId) && row.theoryBlock && row.visualKind && row.visualScenario && row.workedStep && row.checkpoint && row.sourceLocator), "29/29 fully linked authoring rows", { decision: coverage.decision, mapped: coverage.mapped, required: coverage.required, rows: coverage.items?.length });
}

const report = {
  schemaVersion: 1,
  gate: "paper3-section20-content",
  generatedAt: new Date().toISOString(),
  previewRoot: ROOT,
  isolatedPreview: ROOT !== AUTHORING_ROOT,
  status: failures.length ? "FAIL" : "PASS",
  lessonCount: results.length,
  coverage: { passed: coverage?.mapped ?? 0, total: coverage?.required ?? 29 },
  totals: { theoryBlocks: results.reduce((n, row) => n + row.theoryBlocks, 0), workedSteps: results.reduce((n, row) => n + row.workedSteps, 0), checkpoints: results.reduce((n, row) => n + row.checkpoints, 0) },
  lessons: results,
  assertions: checks.length,
  failures,
  checks,
  limitations: ["This source/content gate does not certify production models, rendering, browser behaviour, accessibility or promotion."],
};
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "TEACHER_CONTENT_CHECK.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, lessonCount: report.lessonCount, coverage: report.coverage, totals: report.totals, assertions: report.assertions, failures: report.failures }, null, 2));
if (failures.length) process.exitCode = 1;
