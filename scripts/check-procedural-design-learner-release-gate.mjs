import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANNING = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/procedural-design/LEARNER_PROJECTION.json");
const APP = path.join(ROOT, "app/data/paper4-v2/learner-projections/procedural-design.json");
const EVIDENCE = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/procedural-design/evidence");
const EXPECTED_SHA = "D8D2A1458A8E76AF9CDDD6A147869C9988C9576B531FE065A5036BE11B555C41";
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
record("PD-S01", sha(planningBytes) === EXPECTED_SHA && sha(appBytes) === EXPECTED_SHA && appBytes.equals(planningBytes), "Planning and app projections are byte-identical to the corrected Teacher-approved projection", { expected_sha256: EXPECTED_SHA, planning_sha256: sha(planningBytes), app_sha256: sha(appBytes) });
record("PD-S02", projection.status === "teacher-approved-for-implementation" && JSON.stringify(projection.stage_order) === JSON.stringify(EXPECTED_STAGES), "Projection preserves the approved six-stage topology");
record("PD-S03", projection.stages.understand.python_recipe.lines.length === 14 && projection.stages.understand.python_recipe.lines.at(-1) === '    return "OK", adjusted, labels' && !projection.stages.understand.python_recipe.lines.includes("    return True"), "Recipe has 14 lines and the corrected OK return", { lines: projection.stages.understand.python_recipe.lines.length });
record("PD-S04", projection.stages.trace.steps.length === 3 && projection.stages.trace.steps.map((item) => item.step).join(",") === "1,2,3", "Normal trace has exactly three ordered checkpoints");
record("PD-S05", projection.stages.trace.variants.length === 2 && projection.stages.trace.variants.map((item) => item.kind).join(",") === "boundary,failure", "Trace has one boundary and one failure case");
const [boundary, failure] = projection.stages.trace.variants;
record("PD-S06", JSON.stringify(projection.stages.trace.scenario.scores) === "[35,65,82]" && projection.stages.trace.scenario.bonus === 5 && boundary.input.scores.length === 0 && boundary.input.bonus === 0 && boundary.expected.status === "OK" && failure.input.bonus === "5" && failure.expected.status === "INVALID_INPUT", "Typed normal 3 / boundary 1 / failure 1 case mapping is exact");
record("PD-S07", projection.stages.protectMarks.mistakes.length === 4 && projection.stages.protectMarks.before_code.length === 1, "Protect has the approved four progressive risks and one short pre-code line");

const adapter = await text(path.join(ROOT, "app/components/paper4-learning/proceduralDesignAdapter.ts"));
const runtime = await text(path.join(ROOT, "app/components/paper4-learning/ProceduralDesignTrace.tsx"));
const journey = await text(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx"));
const page = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"));
const interactions = await text(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"));
record("PD-S08", /ProceduralScenarioKind = "normal" \| "boundary" \| "failure"/.test(await text(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts"))) && /variant\.kind/.test(adapter), "Typed adapter handles normal, boundary and failure kinds");
record("PD-S09", !/Paper4VisualRuntime|public\/paper4-v2\/traces|traceLoader/.test(runtime + adapter), "Procedural candidate has no generic visual runtime or raw trace dependency");
record("PD-S10", /data-scene="procedural-responsibility-flow"/.test(runtime) && [...runtime.matchAll(/data-flow-node=/g)].length === 3 && /data-call-flow/.test(runtime), "Static responsibility flow declares exactly three semantic role nodes");
record("PD-S11", /normalIds\.every/.test(adapter) && /data-normal-complete/.test(runtime) && runtime.includes("disabled={!normalComplete}"), "Normal 3/3 completion gates boundary and failure");
record("PD-S12", /revealed && <div data-answer-revealed="true"/.test(runtime) && runtime.includes("disabled={!draft.trim()}"), "Prediction is required before answer reveal");
record("PD-S13", /PROCEDURAL_DESIGN_PROTECT_KEY/.test(journey) && /progressKey\?/.test(interactions) && /data-protect-marks-mode="progressive"/.test(interactions), "Protect reuses the validated one-card-at-a-time component with a lesson key");
record("PD-S14", /candidate-awaiting-user-evaluation/.test(page) && /"procedural-design": proceduralDesignProjection/.test(page), "Procedural route is candidate-only and ready for user evaluation");
const mapBody = page.match(/const learnerCandidates[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const candidateSlugs = [...mapBody.matchAll(/"([a-z-]+)"\s*:/g)].map((item) => item[1]);
record("PD-S15", JSON.stringify(candidateSlugs) === JSON.stringify(["binary-search", "data-models", "procedural-design", "validation-rules", "testing", "text-processing", "search-collections", "sorting", "performance", "stack", "queue"]), "Only the two references and Lead-authorised candidates through Performance are open", { candidate_slugs: candidateSlugs });
record("PD-S16", /PROCEDURAL_DESIGN_TRACE_SCHEMA/.test(adapter) && /projection_sha256/.test(adapter) && /draftIds/.test(adapter) && /revealed\.some\(\(id\) => !drafts\[id\]\?\.trim\(\)\)/.test(adapter), "Trace restore validates schema, projection hash, finite draft IDs and attempted reveals");
record("PD-S17", /sessionStorage\.setItem\(PROCEDURAL_DESIGN_PROGRESS_KEY/.test(runtime) && /persist\(next\);\s*setProgress\(next\)/.test(runtime), "Trace writes computed state synchronously before React state updates");
record("PD-S18", !/(?:ac-9618-|paper4\.section\.|fixture_id|pattern_id|source_sha|execution_log_sha|marking_atom|official_marks|disclosure_contract)/i.test(runtime), "Runtime source exposes no forbidden learner metadata");

const expectedDs2 = {
  "AlgoCoreUI.module.css": "C2D7CA1876A1E4F69ED6B7AFA9348BE24D8C6FADE42473C6E8255F0974E304C8",
  "controls.tsx": "FFDAC34E62D5C94CFDC494C3724C7419AB7E05D45E2E75AC8DFE78DDFD4BCCBB",
  "index.ts": "DDD3228AC9B37B7D2E62EFAAA4CF90E8D54CFF7337FD9C92E2DE8D195FF072A1",
  "journey.tsx": "8EECA214E50F0086F8064DBB829D97D31F84C43EDA1FF8FA815E2432DA1423AA",
  "surfaces.tsx": "045856F40F1E5360D5B182F4C828E5C1957EA80138C5305B3298DF902E2CCBC3",
};
const ds2 = await Promise.all(Object.entries(expectedDs2).map(async ([file, expected]) => ({ file, expected, actual: sha(await bytes(path.join(ROOT, "app/components/algocore-ui", file))) })));
record("PD-S19", ds2.every((item) => item.actual === item.expected), "Frozen DS2 files retain their accepted SHA-256 values", { files: ds2 });
const lessonCss = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.module.css"));
record("PD-S20", (runtime.match(/data-trace-panel=/g) ?? []).length === 2 && /\[data-focused-code\]/.test(lessonCss) && /\.stageNav\s*\{[\s\S]*?position:\s*static/.test(lessonCss) && /@container \(max-width: 52rem\)/.test(lessonCss), "Remediated candidate exposes two stable panels, explicit code contrast, non-sticky stages and container-width stacking");

const report = { schema_version: "paper4-procedural-design-static-gate-v1", candidate_id: "P4-procedural-design-C1", decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "LEARNER_STATIC_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
