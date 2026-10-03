import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");
const parse = async (file) => JSON.parse(await read(file));
const checks = [];
const check = (name, passed, detail) => checks.push({ name, passed: Boolean(passed), detail });

const [assessmentEnvelope, contractSource, componentSource, runnerSource, packageJson] = await Promise.all([
  parse("content/paper4/records/full/assessment-items.json"),
  read("app/components/paper4-learning/paper4CodeExercises.ts"),
  read("app/components/paper4-learning/CanonicalAssessmentPractice.tsx"),
  read("public/workers/paper4-python-runner.js"),
  parse("package.json"),
]);

const items = assessmentEnvelope.map((entry) => entry.record);
const graphTheory = new Set(["graphs.f1", "graphs.g1", "graphs.i1"]);
const coding = items.filter((item) => item.level !== "guided" && !graphTheory.has(item.assessment_item_id));
const freeResponse = items.filter((item) => !coding.includes(item));
const executedIds = ["binary-search.f1", "binary-search.i1"];
const configuredIds = [...contractSource.matchAll(/assessmentItemId: "([^"]+)"/g)].map((match) => match[1]);

check("canonical inventory remains 79 items", items.length === 79, items.length);
check("classification is explicit: 51 coding", coding.length === 51, coding.length);
check("classification is explicit: 28 free response/trace", freeResponse.length === 28, freeResponse.length);
check("bounded execution covers exactly two declared tasks", JSON.stringify(configuredIds) === JSON.stringify(executedIds), configuredIds);
check("executed tasks exist and are coding tasks", executedIds.every((id) => coding.some((item) => item.assessment_item_id === id)), executedIds);
check("each contract declares normal/boundary/failure", (contractSource.match(/requiredCases: \["normal", "boundary", "failure"\]/g) ?? []).length === 2, "2/2");
check("completion is fixture-gated", componentSource.includes('data-assessment-mode={exercise ? "fixture-executed" : "self-check"}') && componentSource.includes('data-assessment-complete={exercise ? executionPassed'), "DOM contract");
check("unsupported coding remains labelled self-check", componentSource.includes("Self-check only · this response is not executed") && componentSource.includes("Chỉ tự kiểm · website chưa thực thi"), "EN/VI");
check("worker uses AST import allowlist", runnerSource.includes('allowed_imports = {"json"}') && runnerSource.includes("ast.parse"), "json only");
check("worker removes browser network APIs", ["fetch", "XMLHttpRequest", "WebSocket", "EventSource"].every((name) => runnerSource.includes(`\"${name}\"`)), "network globals removed");
check("worker has source/output limits", runnerSource.includes("SOURCE_TOO_LARGE") && runnerSource.includes("OUTPUT_TOO_LARGE"), "20KB source / 100KB output");
check("client enforces execution timeout", (await read("app/components/paper4-learning/PythonFixtureRunner.tsx")).includes("4000"), "4 seconds");
check("Pyodide dependency is pinned", packageJson.dependencies?.pyodide === "0.29.0", packageJson.dependencies?.pyodide);
check("runtime preparation is wired into dev/build", packageJson.scripts?.predev === "npm run prepare:paper4:python-runtime" && packageJson.scripts?.prebuild === "npm run prepare:paper4:python-runtime", { predev: packageJson.scripts?.predev, prebuild: packageJson.scripts?.prebuild });

const runtimeFiles = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "pyodide-lock.json", "python_stdlib.zip"];
const runtimeStats = await Promise.all(runtimeFiles.map((file) => stat(path.join(root, "public", "vendor", "pyodide", file)).catch(() => null)));
check("same-origin runtime assets are prepared", runtimeStats.every((value) => value?.size > 0), runtimeFiles);

const failures = checks.filter((item) => !item.passed);
console.log(JSON.stringify({
  status: failures.length ? "FAIL" : "PASS",
  inventory: { total: items.length, coding: coding.length, freeResponse: freeResponse.length, fixtureExecuted: configuredIds.length, codingSelfCheckOnly: coding.length - configuredIds.length },
  executionCases: configuredIds.length * 3,
  checks,
}, null, 2));
if (failures.length) process.exitCode = 1;
