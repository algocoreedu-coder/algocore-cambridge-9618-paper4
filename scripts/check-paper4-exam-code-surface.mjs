import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const files = {
  catalog: path.join(root, "app/components/paper4-learning/examCodeCatalog.ts"),
  supplement: path.join(root, "app/components/paper4-learning/PatternRuntimeSupplement.tsx"),
  journey: path.join(root, "app/components/paper4-learning/SixStageLearnerJourney.tsx"),
  learnerArtifact: path.join(root, "app/components/paper4-learning/learnerPythonArtifact.ts"),
  runtime: path.join(root, "app/components/paper4-visual/Paper4VisualRuntime.tsx"),
  runtimeTypes: path.join(root, "app/components/paper4-visual/types.ts"),
  bindings: path.join(root, "app/components/paper4-learning/patternCheckpointBindings.ts"),
  css: path.join(root, "app/components/paper4-learning/PatternRuntimeSupplement.module.css"),
  authority: path.join(root, "app/data/paper4-v2/exam-code-authority.json"),
};
const source = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await readFile(file, "utf8")])));
const failures = [];
const checks = [];
const check = (condition, id, message, evidence = undefined) => { checks.push({ id, pass: Boolean(condition) }); if (!condition) failures.push({ id, message, evidence }); };

const expectedPatterns = [...source.bindings.matchAll(/runtime\("([A-Z_]+)",\s*"[^"]+",\s*"runtime-supplement"\)/g)].map((match) => match[1]).sort();
const catalogPatterns = [...source.catalog.matchAll(/patternId:\s*"([A-Z_]+)"/g)].map((match) => match[1]).sort();
const expectedCatalog = [...expectedPatterns, "BINARY_SEARCH"].sort();
check(expectedPatterns.length === 16 && catalogPatterns.length === 17 && JSON.stringify(catalogPatterns) === JSON.stringify(expectedCatalog), "EXAM-CODE-01", "All runtime-supplement patterns plus Binary Search need exactly one learner catalog entry.", { expectedCatalog, catalogPatterns });

const entryPattern = /patternId:\s*"([A-Z_]+)"[\s\S]*?code:\s*(\[[\s\S]*?\]),\s*\n\s*steps:/g;
const entries = [];
for (const match of source.catalog.matchAll(entryPattern)) {
  try { entries.push({ patternId: match[1], code: JSON.parse(match[2]) }); }
  catch (error) { failures.push({ id: "EXAM-CODE-02", message: `${match[1]} code array cannot be parsed.`, evidence: String(error) }); }
}
check(entries.length === 17, "EXAM-CODE-02", "Seventeen learner code arrays must be machine-readable.", { parsed: entries.length });
const authority = JSON.parse(source.authority);
const authorityById = new Map(authority.patterns.map((pattern) => [pattern.pattern_id, pattern.code]));
const drift = entries.filter((entry) => JSON.stringify(entry.code) !== JSON.stringify(authorityById.get(entry.patternId))).map((entry) => entry.patternId);
check(authority.pattern_count === 17 && drift.length === 0, "EXAM-CODE-17", "Rendered snippets must equal the Teacher authority contract.", { authority_count: authority.pattern_count, drift });
const forbidden = /\b(?:fixture|trace|telemetry|provenance|sys\.argv|json\.loads|json\.dumps|__main__)\b|Path\(/i;
const unsafe = entries.filter((entry) => forbidden.test(entry.code.join("\n"))).map((entry) => entry.patternId);
check(unsafe.length === 0, "EXAM-CODE-03", "Learner code must not expose verification-harness tokens.", unsafe);

const syntaxFailures = [];
for (const entry of entries) {
  const result = spawnSync("python", ["-c", "import sys; compile(sys.stdin.read(), '<learner-code>', 'exec')"], { input: `${entry.code.join("\n")}\n`, encoding: "utf8" });
  if (result.status !== 0) syntaxFailures.push({ patternId: entry.patternId, stderr: result.stderr.trim() });
}
check(syntaxFailures.length === 0, "EXAM-CODE-04", "Every learner snippet must compile as Python.", syntaxFailures);

const activeSets = [...source.catalog.matchAll(/active:\s*\[([^\]]*)\]/g)].map((match) => match[1].split(",").map((item) => Number(item.trim())).filter(Number.isFinite));
check(activeSets.length >= 48 && activeSets.every((set) => set.length >= 1 && set.length <= 3), "EXAM-CODE-05", "Every worked step must highlight one to three code lines.", { steps: activeSets.length, max: Math.max(...activeSets.map((set) => set.length)) });
check(!/Paper4VisualRuntime/.test(source.supplement) && /EXAM_CODE_BY_PATTERN/.test(source.supplement), "EXAM-CODE-06", "Runtime supplements must not fall back to the full verification artifact.");
check(/catalog\.length !== patterns\.length/.test(source.supplement) && /role="alert"/.test(source.supplement), "EXAM-CODE-07", "A missing teacher-reviewed pattern must fail closed.");
check(/learnerPythonArtifact\?: PythonArtifactDto/.test(source.runtimeTypes) && /learnerMode && learnerPythonArtifact/.test(source.runtime), "EXAM-CODE-08", "Learner presentation and verified execution artifacts must be separate.");
check(/lessonSlug === "binary-search"/.test(source.journey) && /projection\.stages\.understand\.python_recipe\.lines/.test(source.journey) && /learnerPythonArtifact=\{learnerPythonArtifact\}/.test(source.journey), "EXAM-CODE-09", "Binary Search must use its teacher-approved learner recipe.");
check(/BINARY_SEARCH_RECIPE_LINE_IDS/.test(source.learnerArtifact) && /binary-search\.v1\.L031/.test(source.learnerArtifact), "EXAM-CODE-10", "Binary Search recipe must retain semantic trace bindings.");
check(/@media \(max-width: 52rem\)/.test(source.css) && /@media \(max-width: 30rem\)/.test(source.css), "EXAM-CODE-11", "Exam-code panels must reflow at tablet and mobile widths.");
check(/from random import randint/.test(source.catalog) && /randint\(lower, upper\)/.test(source.catalog), "EXAM-CODE-12", "Random-array recipe must use the inclusive randint contract.");
check(/address = \(address \+ 1\) % len\(table\)/.test(source.catalog) && /if address == start:/.test(source.catalog), "EXAM-CODE-13", "Hash search must wrap safely and stop after one full cycle.");
check(/original_count = queue\.count/.test(source.catalog) && /for _ in range\(original_count\):/.test(source.catalog), "EXAM-CODE-14", "Queue reduction must freeze the original count.");
check(/encoded\.append\(\[current, count\]\)[\s\S]*return encoded/.test(source.catalog), "EXAM-CODE-15", "Run-length encoding must flush the final run before return.");
check(/def inorder\(node, output\):/.test(source.catalog) && /inorder\(node\.left, output\)[\s\S]*output\.append\(node\.value\)[\s\S]*inorder\(node\.right, output\)/.test(source.catalog), "EXAM-CODE-16", "Tree traversal must state explicit in-order topology.");

const result = { schema_version: "paper4-exam-code-surface-gate-v2", decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.filter((item) => item.pass).length, catalog_patterns: catalogPatterns.length, compiled_snippets: entries.length - syntaxFailures.length, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
