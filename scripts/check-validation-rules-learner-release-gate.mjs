import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANNING = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/validation-rules/LEARNER_PROJECTION.json");
const APP = path.join(ROOT, "app/data/paper4-v2/learner-projections/validation-rules.json");
const EVIDENCE = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/validation-rules/evidence");
const EXPECTED_SHA = "C1D8EC034CE4978619124A9E20D40994C18C7A31B2BFBAB76093EB37E8163183";
const EXPECTED_STAGES = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"];
const checks = [];
const failures = [];
function record(id, passed, message, evidence = {}) { const item = { id, passed: Boolean(passed), message, evidence }; checks.push(item); if (!item.passed) failures.push(item); }
const bytes = async (file) => await readFile(file);
const text = async (file) => (await bytes(file)).toString("utf8");
const sha = (value) => createHash("sha256").update(value).digest("hex").toUpperCase();

const planningBytes = await bytes(PLANNING);
const appBytes = await bytes(APP);
const projection = JSON.parse(planningBytes);
record("VR-S01", sha(planningBytes) === EXPECTED_SHA && sha(appBytes) === EXPECTED_SHA && appBytes.equals(planningBytes), "Planning and app projections are byte-identical to the Teacher-approved projection", { expected_sha256: EXPECTED_SHA, planning_sha256: sha(planningBytes), app_sha256: sha(appBytes) });
record("VR-S02", projection.status === "teacher-approved-for-implementation" && JSON.stringify(projection.stage_order) === JSON.stringify(EXPECTED_STAGES), "Projection preserves the approved six-stage topology");
record("VR-S03", projection.stages.understand.python_recipe.lines.length === 12, "Recipe retains exactly twelve approved lines", { lines: projection.stages.understand.python_recipe.lines.length });
record("VR-S04", projection.stages.trace.steps.length === 3 && projection.stages.trace.steps.map((item) => item.step).join(",") === "1,2,3" && projection.stages.trace.steps.every((item) => item.code_focus.length <= 3), "Normal trace has exactly three ordered decisions and no more than three focused lines");
record("VR-S05", projection.stages.trace.variants.length === 2 && projection.stages.trace.variants.map((item) => item.kind).join(",") === "boundary,failure", "Trace has one boundary and one failure transfer case");
const [boundary, failure] = projection.stages.trace.variants;
record("VR-S06", JSON.stringify(projection.stages.trace.scenario.accepted) === "[2]" && projection.stages.trace.scenario.candidate === 4 && projection.stages.trace.scenario.minimum === 1 && projection.stages.trace.scenario.maximum === 6 && projection.stages.trace.scenario.digit_matches === true && boundary.input.candidate === 1 && boundary.input.minimum === 1 && boundary.input.maximum === 1 && boundary.expected.status === "ACCEPTED" && failure.input.candidate === 3 && JSON.stringify(failure.input.accepted) === "[3]" && failure.input.digit_matches === false && failure.expected.status === "DUPLICATE", "Typed normal 3 / boundary 1 / failure 1 mapping is exact");
record("VR-S07", projection.stages.practise.items.length === 4 && projection.stages.protectMarks.mistakes.length === 4 && projection.stages.recallAndContinue.recall_items.length === 5, "Projection retains four practices, four progressive risks and five recall prompts");

const adapter = await text(path.join(ROOT, "app/components/paper4-learning/validationRulesAdapter.ts"));
const runtime = await text(path.join(ROOT, "app/components/paper4-learning/ValidationRulesTrace.tsx"));
const types = await text(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts"));
const journey = await text(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx"));
const page = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"));
const interactions = await text(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"));
record("VR-S08", /ValidationScenarioKind = "normal" \| "boundary" \| "failure"/.test(types) && /variant\.kind/.test(adapter), "Typed adapter exhaustively handles normal, boundary and failure kinds");
record("VR-S09", !/Paper4VisualRuntime|public\/paper4-v2\/traces|traceLoader/.test(runtime + adapter), "Validation candidate has no generic visual runtime or raw trace dependency");
record("VR-S10", /data-scene="validation-guard-path"/.test(runtime) && [...runtime.matchAll(/data-guard-node=/g)].length === 4 && /data-guard-path/.test(runtime) && /data-current-group/.test(runtime) && /data-guard-state/.test(runtime) && /1: \["duplicate", "supplied-check"\]/.test(runtime), "Static ordered path declares four guard nodes and one typed two-node current group for normal Decision 2");
record("VR-S11", /normalIds\.every/.test(adapter) && /data-normal-complete/.test(runtime) && runtime.includes("disabled={!normalComplete}"), "Normal 3/3 completion gates boundary and failure");
record("VR-S12", /revealed && <div data-answer-revealed="true"/.test(runtime) && runtime.includes("disabled={!draft.trim()}"), "Prediction is required and approved answers are conditionally absent before reveal");
record("VR-S13", /VALIDATION_RULES_PROTECT_KEY/.test(journey) && /progressKey\?/.test(interactions) && /data-protect-marks-mode="progressive"/.test(interactions), "Protect reuses the validated one-card-at-a-time component with a lesson-local key");
record("VR-S14", /candidate-awaiting-user-evaluation/.test(page) && /"validation-rules": validationRulesProjection/.test(page), "Validation Rules passed internal gates and awaits user evaluation");
const mapBody = page.match(/const learnerCandidates[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const candidateSlugs = [...mapBody.matchAll(/"([a-z-]+)"\s*:/g)].map((item) => item[1]);
record("VR-S15", JSON.stringify(candidateSlugs) === JSON.stringify(["binary-search", "data-models", "procedural-design", "validation-rules", "testing", "text-processing", "search-collections", "sorting", "performance", "stack", "queue"]), "Only accepted references and Lead-authorised candidates through Performance are open", { candidate_slugs: candidateSlugs });
record("VR-S16", /VALIDATION_RULES_TRACE_SCHEMA/.test(adapter) && /projection_sha256/.test(adapter) && /draftIds/.test(adapter) && /revealed\.some\(\(id\) => !drafts\[id\]\?\.trim\(\)\)/.test(adapter), "Trace restore rejects stale schema/hash, unknown draft IDs and unattempted reveals");
record("VR-S17", /sessionStorage\.setItem\(VALIDATION_RULES_PROGRESS_KEY/.test(runtime) && /persist\(next\); setProgress\(next\)/.test(runtime), "Trace persists computed state synchronously before React state updates");
record("VR-S18", !/(?:CHECK_DIGIT|RULE_COMPUTE|UNIQUE_SELECTION|VALIDATE_INPUT|ac-9618-|paper4\.section\.|fixture_id|pattern_id|source_sha|execution_log_sha|marking_atom|official_marks|disclosure_contract)/i.test(runtime), "Runtime source exposes no forbidden learner metadata");

const expectedDs2 = {
  "AlgoCoreUI.module.css": "C2D7CA1876A1E4F69ED6B7AFA9348BE24D8C6FADE42473C6E8255F0974E304C8",
  "controls.tsx": "FFDAC34E62D5C94CFDC494C3724C7419AB7E05D45E2E75AC8DFE78DDFD4BCCBB",
  "index.ts": "DDD3228AC9B37B7D2E62EFAAA4CF90E8D54CFF7337FD9C92E2DE8D195FF072A1",
  "journey.tsx": "8EECA214E50F0086F8064DBB829D97D31F84C43EDA1FF8FA815E2432DA1423AA",
  "surfaces.tsx": "045856F40F1E5360D5B182F4C828E5C1957EA80138C5305B3298DF902E2CCBC3",
};
const ds2 = await Promise.all(Object.entries(expectedDs2).map(async ([file, expected]) => ({ file, expected, actual: sha(await bytes(path.join(ROOT, "app/components/algocore-ui", file))) })));
record("VR-S19", ds2.every((item) => item.actual === item.expected), "Frozen DS2 files retain accepted SHA-256 values", { files: ds2 });
const css = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.module.css"));
record("VR-S20", (runtime.match(/data-trace-panel=/g) ?? []).length === 2 && /(?:^|,)\s*\.validationTrace\s*(?:,|\{)/m.test(css) && /\.validationTracePanels/.test(css) && /data-lesson-slug="validation-rules"/.test(css), "Candidate exposes two stable panels, lesson-scoped container reflow and complete non-sticky stages");

const report = { schema_version: "paper4-validation-rules-static-gate-v1", candidate_id: "P4-validation-rules-C1", decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "LEARNER_STATIC_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
