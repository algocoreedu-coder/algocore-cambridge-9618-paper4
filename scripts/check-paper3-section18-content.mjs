import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section18");
const lessons = [
  ["P3-18.1-T01", "graphs-and-dijkstra", "dijkstra-search"],
  ["P3-18.1-T02", "a-star-and-heuristic-search", "astar-search"],
  ["P3-18.1-T03", "learning-categories", "learning-categories"],
  ["P3-18.1-T04", "neural-networks-and-deep-learning", "neural-network"],
  ["P3-18.1-T05", "backpropagation", "backpropagation"],
  ["P3-18.1-T06", "regression", "regression"],
];

const coverage = [
  ["purpose of a graph in AI", ["graphs-and-dijkstra"], /graph[\s\S]{0,220}(represent|model)[\s\S]{0,220}(state|route|relationship|problem)/i],
  ["graph structure", ["graphs-and-dijkstra"], /(node|vertex)[\s\S]{0,180}(edge|arc)[\s\S]{0,180}weight/i],
  ["use Dijkstra", ["graphs-and-dijkstra"], /Dijkstra[\s\S]{0,500}(cumulative|tentative)[\s\S]{0,500}(predecessor|shortest path)/i],
  ["use A star", ["a-star-and-heuristic-search"], /A\*[\s\S]{0,500}g\(n\)[\s\S]{0,300}h\(n\)[\s\S]{0,300}f\(n\)/i],
  ["scope is use/trace, not graph-search implementation", ["graphs-and-dijkstra", "a-star-and-heuristic-search"], /(trace|follow)[\s\S]{0,300}(not required|do not need|không.*(?:yêu cầu|cần)).*(code|algorithm|mã|thuật toán)/i],
  ["neural networks support machine learning", ["neural-networks-and-deep-learning"], /neural network[\s\S]{0,300}(machine learning|learn.*relationship|học máy|học.*quan hệ)/i],
  ["neural structure and mechanism", ["neural-networks-and-deep-learning"], /input layer[\s\S]{0,400}hidden layer[\s\S]{0,400}output layer[\s\S]{0,400}weight/i],
  ["deep learning", ["neural-networks-and-deep-learning"], /deep learning[\s\S]{0,400}(multiple|many|nhiều)[\s\S]{0,200}hidden layer/i],
  ["machine learning", ["learning-categories"], /machine learning[\s\S]{0,400}(data|experience|dữ liệu|kinh nghiệm)/i],
  ["supervised learning", ["learning-categories"], /supervised[\s\S]{0,260}(label|target|nhãn|đầu ra)/i],
  ["unsupervised learning", ["learning-categories"], /unsupervised[\s\S]{0,260}(without|no|không)[\s\S]{0,180}(label|target|nhãn)/i],
  ["reinforcement learning and reason", ["learning-categories"], /reinforcement[\s\S]{0,300}(agent|tác tử)[\s\S]{0,300}(reward|penalty|phần thưởng|phạt)/i],
  ["back propagation of errors", ["backpropagation"], /(back ?propagation|lan truyền ngược)[\s\S]{0,500}(error|sai số)[\s\S]{0,500}(weight|trọng số)/i],
  ["regression methods", ["regression"], /regression[\s\S]{0,400}(continuous|liên tục)[\s\S]{0,400}(fit|fitted|khớp|prediction|dự đoán)/i],
];

function allLocalized(value, at = "$", failures = []) {
  if (!value || typeof value !== "object") return failures;
  if (Object.hasOwn(value, "en") || Object.hasOwn(value, "vi")) {
    if (typeof value.en !== "string" || !value.en.trim()) failures.push(`${at}.en is empty`);
    if (typeof value.vi !== "string" || !value.vi.trim()) failures.push(`${at}.vi is empty`);
    return failures;
  }
  if (Array.isArray(value)) value.forEach((item, index) => allLocalized(item, `${at}[${index}]`, failures));
  else Object.entries(value).forEach(([key, item]) => allLocalized(item, `${at}.${key}`, failures));
  return failures;
}

const failures = [], loaded = new Map(), lessonReport = [];
const requiredCommandWords = ["describe", "explain", "trace", "compare", "justify"];
for (const [topicId, slug, visualKind] of lessons) {
  const file = path.join(ROOT, "content/paper3/lessons", `${slug}.json`);
  let raw, lesson;
  try { raw = await readFile(file, "utf8"); lesson = JSON.parse(raw); }
  catch (error) { failures.push(`${slug}: unreadable lesson (${error.message})`); continue; }
  loaded.set(slug, { raw, lesson });
  if (lesson.topicId !== topicId || lesson.slug !== slug) failures.push(`${slug}: identity mismatch`);
  if (lesson.visual?.kind !== visualKind) failures.push(`${slug}: expected visual kind ${visualKind}`);
  if ((lesson.theory?.length ?? 0) < 3) failures.push(`${slug}: needs at least 3 theory blocks`);
  if ((lesson.workedExample?.steps?.length ?? 0) < 4) failures.push(`${slug}: needs at least 4 worked steps`);
  if ((lesson.checkpoints?.length ?? 0) < 5) failures.push(`${slug}: needs recall, recognition, ordering, trace/calculation and transfer checkpoints`);
  if ((lesson.misconceptions?.length ?? 0) < 4) failures.push(`${slug}: needs at least 4 misconceptions`);
  const commandWords = lesson.recognition?.commandWords?.map(item => item.command) ?? [];
  if (JSON.stringify(commandWords) !== JSON.stringify(requiredCommandWords)) failures.push(`${slug}: command-word guide must cover describe, explain, trace, compare and justify in order`);
  if (!lesson.misconceptions?.every(item => item.selfCheck?.en?.trim() && item.selfCheck?.vi?.trim())) failures.push(`${slug}: every misconception needs a bilingual short self-check`);
  if (!Number.isFinite(lesson.estimatedMinutes) || lesson.estimatedMinutes <= 0) failures.push(`${slug}: invalid estimated time`);
  if (!lesson.checkpoints?.some(check => check.transfer)) failures.push(`${slug}: missing transfer checkpoint`);
  failures.push(...allLocalized(lesson).map(item => `${slug}: ${item}`));
  const sourceKinds = new Set(lesson.sources?.map(source => source.kind));
  for (const kind of ["syllabus", "book"]) if (!sourceKinds.has(kind)) failures.push(`${slug}: missing ${kind} source`);
  for (const check of lesson.checkpoints ?? []) {
    if (!check.choices?.some(choice => choice.id === check.correctChoiceId)) failures.push(`${slug}/${check.id}: correct choice missing`);
    if (new Set(check.choices?.map(choice => choice.feedback.en)).size !== check.choices?.length) failures.push(`${slug}/${check.id}: EN feedback is not choice-specific`);
    if (new Set(check.choices?.map(choice => choice.feedback.vi)).size !== check.choices?.length) failures.push(`${slug}/${check.id}: VI feedback is not choice-specific`);
  }
  lessonReport.push({ topicId, slug, visualKind, theoryBlocks: lesson.theory?.length ?? 0, workedSteps: lesson.workedExample?.steps?.length ?? 0, checkpoints: lesson.checkpoints?.length ?? 0, misconceptions: lesson.misconceptions?.length ?? 0, commandWords: commandWords.length, misconceptionSelfChecks: lesson.misconceptions?.filter(item => item.selfCheck?.en && item.selfCheck?.vi).length ?? 0, sha256: createHash("sha256").update(raw).digest("hex") });
}

const coverageRows = coverage.map(([label, slugs, pattern], index) => {
  const corpus = slugs.map(slug => loaded.get(slug)?.raw ?? "").join("\n");
  return { item: index + 1, label, slugs, pass: pattern.test(corpus) };
});
for (const row of coverageRows) if (!row.pass) failures.push(`coverage ${row.item}: ${row.label}`);

const allSources = [...loaded.values()].flatMap(({ lesson }) => lesson.sources ?? []);
for (const kind of ["question-paper", "mark-scheme"]) if (!allSources.some(source => source.kind === kind)) failures.push(`Section 18 corpus missing ${kind} evidence`);
const asserted = [...loaded.values()].map(({ lesson }) => JSON.stringify({ theory: lesson.theory, workedExample: lesson.workedExample, misconceptions: lesson.misconceptions, takeaways: lesson.takeaways })).join("\n");
const unsafeClaims = [
  /Dijkstra[\s\S]{0,120}(negative weights? (?:are )?(?:allowed|supported)|works? with negative)/i,
  /A\*[\s\S]{0,160}(any|arbitrary)[\s\S]{0,100}heuristic[\s\S]{0,100}(always|guarantee)[\s\S]{0,100}(optimal|shortest)/i,
  /back ?propagation[\s\S]{0,180}(always|guarantee)[\s\S]{0,120}(reduce|decrease)[\s\S]{0,80}error/i,
  /inference[\s\S]{0,160}(adjusts?|updates?)[\s\S]{0,100}weights?/i,
  /deep learning (?:only )?means? (?:a )?(?:large|big) data ?set/i,
  /regression (?:line|curve)[\s\S]{0,120}(must|always)[\s\S]{0,80}(pass|go) through every/i,
  /correlation[\s\S]{0,80}(proves?|establishes?|causes?)[\s\S]{0,80}caus/i,
];
for (const pattern of unsafeClaims) if (pattern.test(asserted)) failures.push(`unsafe academic claim matched: ${pattern}`);

const result = {
  schemaVersion: 1, gate: "paper3-section18-content", generatedAt: new Date().toISOString(), status: failures.length ? "FAIL" : "PASS",
  lessonCount: lessonReport.length, coverage: { passed: coverageRows.filter(row => row.pass).length, total: coverageRows.length, rows: coverageRows }, lessons: lessonReport, failures,
  limitations: ["Regex and schema gate supplements teacher review; it does not replace source audit or rendered-output review."],
};
await mkdir(EVIDENCE_DIR, { recursive: true });
await writeFile(path.join(EVIDENCE_DIR, "TEACHER_CONTENT_CHECK.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
