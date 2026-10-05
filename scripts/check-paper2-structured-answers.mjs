import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePaper2AnswerTable } from "../app/lib/paper2/structured-answer.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [lesson, selectionLesson, renderer] = await Promise.all([
  readFile(path.join(root, "content/paper2/lessons/test-strategy-test-plan.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/lessons/selection.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "app/components/paper2-learning/lessons/LessonPage.tsx"), "utf8"),
]);
const example = lesson.workedExamples.find((item) => item.id === "T29-W1");
const checks = [];
for (const locale of ["en", "vi"]) {
  const table = parsePaper2AnswerTable(example?.answer?.[locale] ?? "");
  checks.push({ id: `T29-W1-${locale}-shape`, pass: table?.headers.length === 8 && table.rows.length === 9 && table.rows.every((row) => row.length === 8) });
}
checks.push({ id: "ordinary-answer-fallback", pass: parsePaper2AnswerTable("A normal answer remains a paragraph.") === null });
checks.push({ id: "accessible-renderer", pass: renderer.includes("<StructuredAnswer value={example.answer[locale]}") && renderer.includes("<caption className={styles.srOnly}") && renderer.includes('scope="col"') && renderer.includes('role="region" tabIndex={0} aria-label={caption}') });
const selectionExample = selectionLesson.workedExamples.find((item) => item.id === "T18-W1");
checks.push({ id: "T18-W1-multiline-pseudocode", pass: ["en", "vi"].every((locale) => (selectionExample?.answer?.[locale]?.split(/\r?\n/).length ?? 0) >= 10) && renderer.includes('value.includes("\\n")') && renderer.includes('<pre className={styles.answerCode} tabIndex={0} aria-label={caption}><code>{value}</code></pre>') });
const failures = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ schema_version: "paper2-structured-answer-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
