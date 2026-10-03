import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANNING = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/testing/LEARNER_PROJECTION.json");
const APP = path.join(ROOT, "app/data/paper4-v2/learner-projections/testing.json");
const EVIDENCE = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/testing/evidence");
const EXPECTED_SHA = "DD11F46D887161C9123EDFE4DD9162E3D3C799D161405CCE1C50A88C913CE07C";
const EXPECTED_STAGES = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"];
const checks = [], failures = [];
function record(id, passed, message, evidence = {}) { const item = { id, passed: Boolean(passed), message, evidence }; checks.push(item); if (!item.passed) failures.push(item); }
const bytes = async (file) => await readFile(file);
const text = async (file) => (await bytes(file)).toString("utf8");
const sha = (value) => createHash("sha256").update(value).digest("hex").toUpperCase();

const planningBytes = await bytes(PLANNING);
const appBytes = await bytes(APP);
const projection = JSON.parse(planningBytes);
record("TS-S01", sha(planningBytes) === EXPECTED_SHA && sha(appBytes) === EXPECTED_SHA && appBytes.equals(planningBytes), "Planning and app projections are byte-identical to the Teacher-approved Testing projection", { expected_sha256: EXPECTED_SHA, planning_sha256: sha(planningBytes), app_sha256: sha(appBytes) });
record("TS-S02", projection.status === "teacher-approved-for-implementation" && JSON.stringify(projection.stage_order) === JSON.stringify(EXPECTED_STAGES), "Projection preserves the approved six-stage topology");
record("TS-S03", projection.stages.understand.python_recipe.lines.length === 9, "Testing recipe retains exactly nine approved lines", { lines: projection.stages.understand.python_recipe.lines.length });
record("TS-S04", projection.stages.trace.steps.length === 3 && projection.stages.trace.steps.map((item) => item.step).join(",") === "1,2,3" && projection.stages.trace.steps.every((item) => item.code_focus.length <= 3), "Trace has exactly three ordered decisions and no more than three focused lines");
const scenario = projection.stages.trace.scenario;
record("TS-S05", scenario.input === 40 && scenario.expected === "PASS" && scenario.defective_condition === "score > 40", "Primary boundary row pins input 40, expected PASS and the defective strict comparison");
const [normal, failure] = projection.stages.trace.variants;
record("TS-S06", projection.stages.trace.variants.length === 2 && normal.kind === "normal" && JSON.stringify(normal.input.rows) === JSON.stringify([{ input: 55, expected: "PASS" }, { input: 20, expected: "RETRY" }]) && failure.kind === "failure" && JSON.stringify(failure.input.rows) === JSON.stringify([{ input: -1, expected: "INVALID" }, { input: 101, expected: "INVALID" }]) && normal.expected.all_pass_after_repair === true && failure.expected.all_pass_after_repair === true, "Projection-owned normal/failure support is exact and aggregate-only");
record("TS-S07", projection.stages.practise.items.length === 4 && projection.stages.protectMarks.mistakes.length === 4 && projection.stages.recallAndContinue.recall_items.length === 5, "Projection retains four practices, four progressive risks and five recalls");

const adapter = await text(path.join(ROOT, "app/components/paper4-learning/testingProjectionAdapter.ts"));
const runtime = await text(path.join(ROOT, "app/components/paper4-learning/TestingEvidenceTable.tsx"));
const journey = await text(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx"));
const page = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"));
const interactions = await text(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"));
record("TS-S08", /TestingCaseKind = "boundary" \| "normal" \| "failure"/.test(await text(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts"))) && /testingBoundaryRow/.test(adapter) && /testingSupportRows/.test(adapter), "Typed adapter exposes one boundary row and projection-owned static support");
record("TS-S09", !/Paper4VisualRuntime|evidence-run\.json|public\/paper4-v2\/traces|traceLoader|exam-workflow/.test(runtime + adapter), "Testing candidate has no simulator, borrowed trace or exam-workflow dependency");
record("TS-S10", /<table/.test(runtime) && /<caption>/.test(runtime) && [...runtime.matchAll(/data-test-cell=/g)].length === 4 && runtime.indexOf('data-test-cell="input"') < runtime.indexOf('data-test-cell="expected"') && runtime.indexOf('data-test-cell="expected"') < runtime.indexOf('data-test-cell="actual"') && runtime.indexOf('data-test-cell="actual"') < runtime.indexOf('data-test-cell="result"'), "Semantic table preserves input → expected → actual → result order");
record("TS-S11", /expectedVisible/.test(runtime) && /actual \?/.test(runtime) && /revealed && <div className=.*data-answer-revealed="true"/.test(runtime) && runtime.includes("disabled={!draft.trim()}"), "Expected/actual/result answers remain conditional and require a fresh prediction");
record("TS-S12", /progress\.checkpoint_index > 0 \|\| revealed/.test(runtime) && /boundary\.expected/.test(runtime) && /defectiveActual: "RETRY"/.test(adapter) && /repairedActual: "PASS"/.test(adapter), "Expected PASS stays fixed while actual changes RETRY → PASS after repair");
record("TS-S13", /complete && <section/.test(runtime) && [...runtime.matchAll(/data-regression-support=/g)].length === 1 && /support\.map/.test(runtime) && !/scenario-select/.test(runtime), "Normal/failure support is static, subordinate and appears only after completion without scenario controls");
record("TS-S14", /TESTING_PROTECT_KEY/.test(journey) && /data-protect-marks-mode="progressive"/.test(interactions), "Protect reuses one-card progressive disclosure with the Testing key");
record("TS-S15", /candidate-awaiting-user-evaluation/.test(page) && /"testing": testingProjection/.test(page), "Testing passed internal gates and awaits user evaluation");
const mapBody = page.match(/const learnerCandidates[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const candidateSlugs = [...mapBody.matchAll(/"([a-z-]+)"\s*:/g)].map((item) => item[1]);
record("TS-S16", JSON.stringify(candidateSlugs) === JSON.stringify(["binary-search", "data-models", "procedural-design", "validation-rules", "testing", "text-processing", "search-collections", "sorting", "performance", "stack", "queue"]), "Only accepted references and Lead-authorised candidates through Performance are open", { candidate_slugs: candidateSlugs });
record("TS-S17", /TESTING_TRACE_SCHEMA/.test(adapter) && /projection_sha256/.test(adapter) && /checkpointIds/.test(adapter) && /revealed\.some\(\(id\) => !drafts\[id\]\?\.trim\(\)\)/.test(adapter), "Trace restore rejects stale schema/hash, unknown draft IDs and unattempted reveals");
record("TS-S18", /sessionStorage\.setItem\(TESTING_PROGRESS_KEY/.test(runtime) && /persist\(next\); setProgress\(next\)/.test(runtime) && /removeItem\(TESTING_PROGRESS_KEY\)/.test(journey), "Computed progress persists before React updates and Restart is lesson-scoped");
record("TS-S19", !/(?:EVIDENCE_RUN|defect_run|evidence-run\.json|fixture_id|pattern_id|source_sha|execution_log|official_marks|marking_atom|58 patterns|174 scenarios|870 bindings)/i.test(runtime), "Runtime source exposes no borrowed ownership or forbidden learner metadata");

const expectedDs2 = {
  "AlgoCoreUI.module.css": "C2D7CA1876A1E4F69ED6B7AFA9348BE24D8C6FADE42473C6E8255F0974E304C8",
  "controls.tsx": "FFDAC34E62D5C94CFDC494C3724C7419AB7E05D45E2E75AC8DFE78DDFD4BCCBB",
  "index.ts": "DDD3228AC9B37B7D2E62EFAAA4CF90E8D54CFF7337FD9C92E2DE8D195FF072A1",
  "journey.tsx": "8EECA214E50F0086F8064DBB829D97D31F84C43EDA1FF8FA815E2432DA1423AA",
  "surfaces.tsx": "045856F40F1E5360D5B182F4C828E5C1957EA80138C5305B3298DF902E2CCBC3",
};
const ds2 = await Promise.all(Object.entries(expectedDs2).map(async ([file, expected]) => ({ file, expected, actual: sha(await bytes(path.join(ROOT, "app/components/algocore-ui", file))) })));
record("TS-S20", ds2.every((item) => item.actual === item.expected), "Frozen DS2 files retain accepted SHA-256 values", { files: ds2 });

const report = { schema_version: "paper4-testing-static-gate-v1", candidate_id: "P4-testing-C1", decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "LEARNER_STATIC_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
