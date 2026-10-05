import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [validatorSource, studyMap, canonical, lessonNames] = await Promise.all([
  readFile(path.join(root, "app/lib/paper2/content-validation.ts"), "utf8"),
  readFile(path.join(root, "content/paper2/study-map.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "app/lib/paper2/generated/canonical-visuals.json"), "utf8").then(JSON.parse),
  readdir(path.join(root, "content/paper2/lessons")),
]);

const transpiled = ts.transpileModule(validatorSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const compileErrors = (transpiled.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
if (compileErrors.length) {
  console.error(JSON.stringify({ decision: "FAIL", compileErrors: compileErrors.map((item) => item.messageText) }, null, 2));
  process.exit(1);
}
const validatorModule = await import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
const validate = validatorModule.validatePaper2Lesson;
const context = { topics: studyMap.topics, visualIds: Object.keys(canonical.assetHashes) };
const lessons = await Promise.all(
  lessonNames.filter((name) => name.endsWith(".json")).sort().map(async (name) => ({
    name,
    value: JSON.parse(await readFile(path.join(root, "content/paper2/lessons", name), "utf8")),
  })),
);

const checks = [];
const failures = [];
const check = (id, condition) => {
  const item = { id, pass: Boolean(condition) };
  checks.push(item);
  if (!item.pass) failures.push(item);
};

for (const lesson of lessons) check(`valid:${lesson.name}`, validate(lesson.value, context));
const baseline = lessons[0]?.value;
if (!baseline) throw new Error("At least one Paper 2 lesson fixture is required.");
const rejectsMutation = (id, mutate) => {
  const candidate = structuredClone(baseline);
  mutate(candidate);
  check(`reject:${id}`, !validate(candidate, context));
};

rejectsMutation("missing-vi-leaf", (lesson) => { delete lesson.recognition.answerProduct.vi; });
rejectsMutation("table-width", (lesson) => {
  const block = lesson.theory.find((item) => item.table);
  if (block) block.table.rows[0].pop();
  else lesson.theory[0].table = { headers: [{ en: "A", vi: "A" }], rows: [[]] };
});
rejectsMutation("practice-self-check", (lesson) => { delete lesson.practices[0].selfCheck; });
rejectsMutation("unknown-source-reference", (lesson) => { lesson.visual.sourceIds[0] = "not-a-source"; });
rejectsMutation("unknown-visual", (lesson) => { lesson.visual.assetIds[0] = "NOT-CANONICAL"; });
rejectsMutation("visual-not-bound-to-topic", (lesson) => {
  const otherTopic = studyMap.topics.find((topic) => topic.id !== lesson.topicId && topic.visualIds?.[0] && !lesson.visual.assetIds.includes(topic.visualIds[0]));
  lesson.visual.assetIds[0] = otherTopic?.visualIds[0] ?? "NOT-CANONICAL";
});
rejectsMutation("duplicate-practice-id", (lesson) => { lesson.practices[1].id = lesson.practices[0].id; });
rejectsMutation("wrong-learning-mode", (lesson) => { lesson.learningMode = lesson.learningMode === "diagram" ? "testing" : "diagram"; });
rejectsMutation("wrong-section", (lesson) => { lesson.sectionId = lesson.sectionId === "9.1" ? "9.2" : "9.1"; });
rejectsMutation("unknown-nested-field", (lesson) => { lesson.practices[0].unreviewed = true; });
rejectsMutation("official-marks", (lesson) => { lesson.workedExamples[0].officialMarks = 3; });
rejectsMutation("malformed-url", (lesson) => { lesson.sources[0].url = "file:///private/source.pdf"; });

console.log(JSON.stringify({
  schema_version: "paper2-content-validation-v1",
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  fixtures: lessons.length,
  negativeFixtures: checks.length - lessons.length,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
