import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const EVIDENCE = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section19");
const RENDERER_FILE = "app/components/paper3-learning/lessons/Section19ComputationalWorkbench.tsx";
const CSS_FILE = "app/components/paper3-learning/lessons/Section19ComputationalWorkbench.module.css";
const MODEL_FILE = "app/lib/paper3/computational-thinking-models.ts";
const CONTRACT = JSON.parse(await readFile(path.join(EVIDENCE, "SECTION19_MODEL_CONTRACTS.json"), "utf8"));
const ORACLES = JSON.parse(await readFile(path.join(EVIDENCE, "SECTION19_QA_ORACLES.json"), "utf8"));
const expectedApis = Object.values(CONTRACT.api);
const expectedKinds = expectedApis.map(item => item.visualKind);
const startedAt = new Date().toISOString();
const checks = [];
let assertions = 0;

function record(id, pass, expected, actual) {
  assertions += 1;
  checks.push({ id, pass: Boolean(pass), expected, actual });
}
const ok = (id, actual, expected = true) => record(id, Boolean(actual), expected, actual);
const eq = (id, actual, expected) => record(id, JSON.stringify(actual) === JSON.stringify(expected), expected, actual);
const count = (text, pattern) => [...text.matchAll(pattern)].length;
const hash = value => createHash("sha256").update(value).digest("hex");

async function source(file) {
  try { return { text: await readFile(path.join(ROOT, file), "utf8"), error: null }; }
  catch (error) { return { text: "", error: error?.message ?? String(error) }; }
}

const renderer = await source(RENDERER_FILE);
const css = await source(CSS_FILE);
const modelSource = await source(MODEL_FILE);
ok("source:renderer-present", !renderer.error, RENDERER_FILE);
ok("source:css-present", !css.error, CSS_FILE);
ok("source:model-present", !modelSource.error, MODEL_FILE);

const rendererSha256 = renderer.error ? null : hash(renderer.text);
const cssSha256 = css.error ? null : hash(css.text);
const modelSha256 = modelSource.error ? null : hash(modelSource.text);

function scenariosFromRenderer(kind) {
  const escaped = kind.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = renderer.text.match(new RegExp(`(?:"${escaped}"|${escaped})\\s*:\\s*\\[([^\\]]*)\\]`));
  if (!match) return null;
  try { return JSON.parse(`[${match[1]}]`); } catch { return null; }
}

eq("contract:visual-count", expectedKinds.length, 13);
eq("contract:visual-kinds-unique", new Set(expectedKinds).size, 13);
ok("renderer:dynamic-root", /data-visual-kind=\{kind\}/.test(renderer.text), "root carries the exact visual kind");
for (const api of expectedApis) {
  ok(`renderer:${api.visualKind}:dispatch`, renderer.text.includes(`case "${api.visualKind}"`) || renderer.text.includes(`kind === "${api.visualKind}"`) || renderer.text.includes(`"${api.visualKind}":`), true);
  eq(`renderer:${api.visualKind}:scenario-set`, scenariosFromRenderer(api.visualKind), api.scenarioIds);
}

for (const [name, selector] of Object.entries(CONTRACT.rendererContract.controls)) {
  const attribute = selector.slice(1, -1);
  ok(`controls:${name}`, renderer.text.includes(attribute), selector);
}
for (const hook of CONTRACT.rendererContract.semanticHooks) {
  ok(`semantic-hook:${hook}`, renderer.text.includes(hook), hook);
}
ok("semantic:current-rule", /current\.rule/.test(renderer.text), "localized current rule");
ok("semantic:action", /current\.action/.test(renderer.text), "localized action");
ok("semantic:why", /current\.why/.test(renderer.text), "localized reason");
ok("semantic:outcome", /current\.outcome/.test(renderer.text), "localized outcome");
ok("semantic:stable-active-line-id-model", /readonly activeRule\s*:\s*string/.test(modelSource.text) && /semanticLine\(/.test(modelSource.text), "activeRule carries a reviewed semantic line ID");
ok("semantic:stable-active-line-id-rendered", /current\.activeRule/.test(renderer.text) && /item\.activeRule/.test(renderer.text), "semantic activeRule ID visible in the step card and fallback");
ok("state:before-after", /current\.before/.test(renderer.text) && /current\.after/.test(renderer.text), "same-step before and after state");

ok("fallback:root", /data-s19-fallback/.test(renderer.text), "semantic fallback root");
ok("fallback:complete-trace", /trace\.steps\.map/.test(renderer.text), "all model steps");
ok("fallback:table", /<table>/.test(renderer.text) && /<caption>/.test(renderer.text), "captioned semantic table");
ok("fallback:pseudocode", /trace\.pseudocode\.map/.test(renderer.text), "complete pseudocode listing");
ok("fallback:not-color-only", /Before/.test(renderer.text) && /After/.test(renderer.text) && /Outcome/.test(renderer.text), "textual before, after and outcome");

ok("accessibility:live-status", /role="status"/.test(renderer.text) && /aria-live="polite"/.test(renderer.text), "concise polite step announcement");
ok("accessibility:error-alert", /role="alert"/.test(renderer.text), "manual error alert");
ok("accessibility:native-controls", /<button type="button"/.test(renderer.text) && /<select/.test(renderer.text), "native button and select controls");
ok("accessibility:svg-role-img", count(renderer.text, /<svg\b[^>]*role="img"/g) >= 2, "tree and chart SVGs use role=img");
ok("accessibility:svg-title-desc", count(renderer.text, /<title\b/g) >= 2 && count(renderer.text, /<desc\b/g) >= 2 && count(renderer.text, /aria-labelledby=/g) >= 2, "each complex SVG has title and description");
eq("accessibility:tables-have-caption", count(renderer.text, /<caption\b/g), count(renderer.text, /<table\b/g));
ok("accessibility:chart-axis-labels", renderer.text.includes("input size n") && renderer.text.includes("operation count"), "named axes");
ok("accessibility:chart-line-pattern", /data-line-pattern/.test(renderer.text) && /stroke-dasharray/.test(css.text), "series label and non-colour line pattern");
ok("accessibility:stable-frame-hook", /data-frame-id/.test(renderer.text), "call-frame identity hook");
ok("accessibility:stable-node-hook", /data-node-id/.test(renderer.text), "tree-node identity hook");
ok("accessibility:stable-address-hook", /data-address/.test(renderer.text), "linked-list address hook");
ok("accessibility:stable-index-hook", /data-index/.test(renderer.text), "array index hook");

ok("css:focus-visible", /:focus-visible/.test(css.text) && /outline\s*:/.test(css.text), "visible keyboard focus");
ok("css:target-size", /min-height\s*:\s*44px/.test(css.text), "minimum 44px controls");
ok("css:responsive-780", /@media\s*\(max-width:\s*780px\)/.test(css.text), "tablet/mobile reflow");
ok("css:responsive-480", /@media\s*\(max-width:\s*480px\)/.test(css.text), "narrow mobile reflow");
ok("css:contained-overflow", /overflow-x\s*:\s*auto/.test(css.text), "wide arrays and tables stay contained");
ok("css:reduced-motion", /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css.text) && /transition\s*:\s*none/.test(css.text), "motion-free equivalent");

ok("locale:no-untranslated-scenario-fallback", !/labels\[id\]\?\.\[locale\]\s*\?\?\s*id\.replaceAll/.test(renderer.text), "every reviewed scenario has an explicit EN and VI label");
const forbiddenVisibleInternals = [/[A-Z]:[\\/]/, /completion-program-2026/, /MODEL_FIXTURES\.json/, /[a-f0-9]{64}/i];
eq("learner-ui:no-internal-path-or-hash", forbiddenVisibleInternals.filter(pattern => pattern.test(renderer.text)).map(String), []);

const forbiddenViTokens = [
  "precondition-failed", "blocked-unsorted", "less-than-target", "greater-than-target", "discard-left", "discard-right",
  "pass-complete", "duplicate-key-rejected", "duplicate-rejected", "blocked-invalid", "no-progress", "unreachable-base",
  "undefined", "NaN", "Infinity",
];
let model = null;
let modelImportError = null;
if (!modelSource.error) {
  try { model = await import(`${pathToFileURL(path.join(ROOT, MODEL_FILE)).href}?section19visualqa=${modelSha256}`); }
  catch (error) { modelImportError = error?.stack ?? String(error); }
}
ok("locale:model-import", Boolean(model), "importable production model");
const modelCalls = {
  "linear-search": scenario => model.linearSearchTrace(scenario),
  "binary-search": scenario => model.binarySearchTrace(scenario),
  "bubble-sort": scenario => model.bubbleSortTrace(scenario),
  "insertion-sort": scenario => model.insertionSortTrace(scenario),
  "stack-adt": scenario => model.stackTrace(scenario),
  "queue-adt": scenario => model.queueTrace(scenario),
  "linked-list": scenario => model.linkedListTrace(scenario),
  "binary-tree": scenario => model.binaryTreeTrace(scenario),
  dictionary: scenario => model.dictionaryTrace(scenario),
  "adt-implementation": scenario => model.adtImplementationTrace(scenario),
  "complexity-comparator": scenario => model.complexityComparison(scenario, 8),
  "recursion-trace": scenario => model.recursionTrace(scenario),
  "call-stack-unwinding": scenario => model.callStackTrace(scenario),
};
if (model) for (const api of expectedApis) for (const scenario of api.scenarioIds) {
  const id = `locale:${api.visualKind}:${scenario}`;
  let trace = null;
  try { trace = modelCalls[api.visualKind](scenario); }
  catch (error) { record(`${id}:trace-available`, false, "reviewed trace", { name: error?.name, message: error?.message }); continue; }
  ok(`${id}:trace-available`, trace?.steps?.length > 0, "one or more renderable steps");
  const vi = trace.steps.flatMap(item => [item.title?.vi, item.action?.vi, item.why?.vi, item.rule?.vi, item.outcome?.vi]).filter(Boolean).join(" ");
  const leaks = forbiddenViTokens.filter(token => new RegExp(`(^|[^A-Za-z])${token}([^A-Za-z]|$)`, "i").test(vi));
  eq(`${id}:no-raw-enum`, leaks, []);
}

let buildId = null;
try { buildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim(); } catch { /* Source-only QA is allowed before a build. */ }
if (process.env.PAPER3_EXPECTED_BUILD_ID) eq("binding:expected-build-id", buildId, process.env.PAPER3_EXPECTED_BUILD_ID);
if (!renderer.error) eq("binding:renderer-source-stable", hash(await readFile(path.join(ROOT, RENDERER_FILE), "utf8")), rendererSha256);
if (!css.error) eq("binding:css-source-stable", hash(await readFile(path.join(ROOT, CSS_FILE), "utf8")), cssSha256);
if (!modelSource.error) eq("binding:model-source-stable", hash(await readFile(path.join(ROOT, MODEL_FILE), "utf8")), modelSha256);

const failures = checks.filter(item => !item.pass);
const report = {
  schemaVersion: 1,
  gate: "paper3-section19-static-visual-contract",
  startedAt,
  completedAt: new Date().toISOString(),
  decision: failures.length ? "FAIL" : "PASS",
  sourceRoot: ROOT,
  sourceBoundToIsolatedPreview: ROOT !== AUTHORING_ROOT,
  buildId,
  expectedBuildId: process.env.PAPER3_EXPECTED_BUILD_ID ?? null,
  files: { renderer: RENDERER_FILE, css: CSS_FILE, model: MODEL_FILE },
  sourceHashes: { rendererSha256, cssSha256, modelSha256 },
  fixtureSha256: hash(await readFile(path.join(EVIDENCE, "MODEL_FIXTURES.json"))),
  contractSha256: hash(await readFile(path.join(EVIDENCE, "SECTION19_MODEL_CONTRACTS.json"))),
  oracleContractSha256: hash(await readFile(path.join(EVIDENCE, "SECTION19_QA_ORACLES.json"))),
  expectedVisualKinds: expectedKinds,
  assertions,
  failures,
  modelImportError,
  independence: ORACLES.independence,
  limitations: [
    "This is the source-level visual contract gate. Browser geometry, computed accessibility tree, interaction and screenshots require the separate exact-build browser gate.",
    "Static presence does not prove that every CSS state is perceptually distinct; post-render teacher and accessibility review remain required.",
  ],
  checks,
};
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "QA_VISUALS_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ decision: report.decision, assertions, failures: failures.length, buildId, sourceHashes: report.sourceHashes }));
if (failures.length) process.exitCode = 1;
