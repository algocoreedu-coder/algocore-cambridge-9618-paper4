import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANNING = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/text-processing/LEARNER_PROJECTION.json");
const APP = path.join(ROOT, "app/data/paper4-v2/learner-projections/text-processing.json");
const EVIDENCE = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/text-processing/evidence");
const EXPECTED_SHA = "9DBB6C5E8CDE0E5A4589E04995492D9C913238037023DCD61BAB945CEB019EE4";
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
record("TP-S01", sha(planningBytes) === EXPECTED_SHA && sha(appBytes) === EXPECTED_SHA && appBytes.equals(planningBytes), "Planning and app projections are byte-identical to the Teacher-approved projection", { expected_sha256: EXPECTED_SHA, planning_sha256: sha(planningBytes), app_sha256: sha(appBytes) });
record("TP-S02", projection.status === "teacher-approved-for-implementation" && JSON.stringify(projection.stage_order) === JSON.stringify(EXPECTED_STAGES), "Projection preserves the approved six-stage topology");
record("TP-S03", projection.stages.understand.python_recipe.lines.length === 10 && projection.stages.trace.steps.length === 3 && projection.stages.trace.steps.every((step) => step.code_focus.length <= 3), "Projection retains the ten-line excerpt and exactly three compact normal decisions");
const [boundary, failure] = projection.stages.trace.variants;
record("TP-S04", projection.stages.trace.variants.length === 2 && boundary.kind === "boundary" && failure.kind === "failure" && boundary.input.record === "TEXT||" && boundary.expected.status === "OK" && Object.hasOwn(boundary.expected.routed, "") && boundary.expected.routed[""] === "" && failure.input.record === "INT|age|sixteen" && failure.expected.status === "MALFORMED" && Object.keys(failure.expected.routed).length === 0, "Exact boundary and conversion-failure outcomes are frozen");
record("TP-S05", projection.stages.practise.items.length === 4 && projection.stages.practise.items[2].title.en.includes("prefix") && projection.stages.practise.items[3].title.en.includes("RLE") && projection.stages.protectMarks.mistakes.length === 4 && projection.stages.recallAndContinue.recall_items.length === 5, "Projection retains two primary practices, two transfer practices, four risks and five recalls");

const adapter = await text(path.join(ROOT, "app/components/paper4-learning/textProcessingAdapter.ts"));
const runtime = await text(path.join(ROOT, "app/components/paper4-learning/TextProcessingTrace.tsx"));
const types = await text(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts"));
const journey = await text(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx"));
const page = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"));
const interactionsBytes = await bytes(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"));
const css = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.module.css"));

record("TP-S06", /TextProcessingScenarioKind = "normal" \| "boundary" \| "failure"/.test(types) && /TextProcessingTraceVariant/.test(types) && /Readonly<Record<string, string \| number>>/.test(types), "Typed projection exhaustively models normal, boundary and failure routed facts");
record("TP-S07", /const pipelineNodes[^=]*= \["split", "validate", "convert", "route"\]/.test(runtime) && /data-scene="text-record-pipeline"/.test(runtime) && /data-pipeline-step=/.test(runtime) && /aria-current=/.test(runtime), "One ordered split → validate → convert → route pipeline has explicit current semantics");
record("TP-S08", /data-field-box=/.test(runtime) && /\["tag", "key", "value"\]/.test(runtime) && /data-code-panel="text-processing-focus"/.test(runtime) && (runtime.match(/data-trace-panel=/g) ?? []).length === 2, "Runtime declares three typed field markers, one focused code panel and exactly two Trace panels");
record("TP-S09", !/Paper4VisualRuntime|public\/paper4-v2\/traces|traceLoader|STRING_ROUTE|STRING_SPLIT|STRING_COMPARE|RUN_LENGTH_ENCODE/.test(runtime + adapter), "Primary pathway has no public trace, simulator or registry-enum dependency");
record("TP-S10", /normalIds\.every/.test(adapter) && /disabled=\{!normalComplete\}/.test(runtime) && /progress\.scenario === "failure" \? "convert"/.test(runtime), "Normal 3/3 gates variants and failure remains conversion-first");
record("TP-S11", /revealed && <div data-answer-revealed="true"/.test(runtime) && runtime.includes("disabled={!draft.trim()}") && /showFields = revealed \|\|/.test(runtime), "Trace answer and approved fields remain conditional on a non-empty prediction");
record("TP-S12", /export function TextProcessingPractice/.test(runtime) && /data-transfer-card=\{transfer\}/.test(runtime) && /index === 2 \? "comparison" : index === 3 \? "rle"/.test(runtime) && /hasAttempt && <div/.test(runtime), "Lesson-local Practice maps only item 2 to comparison and item 3 to RLE with attempt-gated support");
record("TP-S13", sha(interactionsBytes) === "A87E4FB1839BA9BA4B1BD897AA6115C5E398F8F7909D16051413D418F1BA6DCC" && /lessonSlug === "text-processing"\s*\? <TextProcessingPractice/.test(journey) && /: <LearnerPractice/.test(journey), "LearnerInteractions is unchanged and only Text Processing uses the local Practice presentation", { learner_interactions_sha256: sha(interactionsBytes) });
record("TP-S14", /TEXT_PROCESSING_PRACTICE_KEY/.test(runtime + adapter) && (runtime.match(/sessionStorage\.setItem\(TEXT_PROCESSING_PRACTICE_KEY/g) ?? []).length >= 2 && !/transfer[^\n]*(?:sessionStorage|PROGRESS_KEY)|TRANSFER_(?:KEY|PROGRESS)/.test(runtime + adapter), "Practice persists index, drafts and attempts under its single approved key with no transfer-state key");
record("TP-S15", /TEXT_PROCESSING_PROTECT_KEY/.test(journey) && /data-protect-marks-mode="progressive"/.test(await text(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"))), "Protect uses the validated one-card progressive disclosure contract");
record("TP-S16", /"text-processing": textProcessingProjection/.test(page) && /lesson\.identity\.slug === "text-processing"[\s\S]*?candidate-awaiting-user-evaluation/.test(page), "Text Processing passed internal gates and awaits user evaluation");
const mapBody = page.match(/const learnerCandidates[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const candidateSlugs = [...mapBody.matchAll(/"([a-z-]+)"\s*:/g)].map((item) => item[1]);
record("TP-S17", JSON.stringify(candidateSlugs) === JSON.stringify(["binary-search", "data-models", "procedural-design", "validation-rules", "testing", "text-processing", "search-collections", "sorting", "performance", "stack", "queue"]), "Only the exact Lead-authorised candidate set through Performance is open", { candidate_slugs: candidateSlugs });
record("TP-S18", /revealed\.some\(\(id\) => !drafts\[id\]\?\.trim\(\)\)/.test(adapter) && /value\.phase === "revealed" && !drafts\[currentId\]\?\.trim\(\)/.test(adapter) && /removeItem\(TEXT_PROCESSING_PROGRESS_KEY\)/.test(journey) && /removeItem\(TEXT_PROCESSING_PROTECT_KEY\)/.test(journey), "Trace rejects unattempted reveals and Restart clears lesson-local Trace/Protect keys");
record("TP-S19", /\.textProcessingTracePanels/.test(css) && /data-lesson-slug="text-processing"/.test(css) && /textProcessingPredictionPanel textarea:focus-visible/.test(css), "Lesson-scoped container reflow, wrapped stages and visible focus contracts are present");
record("TP-S20", !/(?:fixture_id|pattern_id|source_sha|execution_log|official_marks|marking_atom|58 patterns|174 scenarios|870 bindings|release state|audit metadata)/i.test(runtime), "Runtime source exposes no forbidden learner metadata or audit claim");

const expectedDs2 = {
  "AlgoCoreUI.module.css": "C2D7CA1876A1E4F69ED6B7AFA9348BE24D8C6FADE42473C6E8255F0974E304C8",
  "controls.tsx": "FFDAC34E62D5C94CFDC494C3724C7419AB7E05D45E2E75AC8DFE78DDFD4BCCBB",
  "index.ts": "DDD3228AC9B37B7D2E62EFAAA4CF90E8D54CFF7337FD9C92E2DE8D195FF072A1",
  "journey.tsx": "8EECA214E50F0086F8064DBB829D97D31F84C43EDA1FF8FA815E2432DA1423AA",
  "surfaces.tsx": "045856F40F1E5360D5B182F4C828E5C1957EA80138C5305B3298DF902E2CCBC3",
};
const ds2 = await Promise.all(Object.entries(expectedDs2).map(async ([file, expected]) => ({ file, expected, actual: sha(await bytes(path.join(ROOT, "app/components/algocore-ui", file))) })));
record("TP-S21", ds2.every((item) => item.actual === item.expected), "Frozen DS2 files retain accepted SHA-256 values", { files: ds2 });

const report = { schema_version: "paper4-text-processing-static-gate-v1", candidate_id: "P4-text-processing-C1", decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "LEARNER_STATIC_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
