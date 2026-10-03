import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/queue");
const EVIDENCE = path.join(PLAN, "evidence");
const PROJECTION_SHA = "BA60CA6CEBB13B53EFEA568BF6D3B18E9CEB008BDD79DC77F6878F5E8DB0CB45";
const SOURCE_SHA = "70B10587CC66936DA9DBBD65D3AF17BBA8842C95B18D39B23CA770877F13C52A";
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex").toUpperCase();
const bytes = (file) => readFile(file);
const text = (file) => readFile(file, "utf8");

const [planningBytes, appBytes, runtime, adapter, types, page, journey, css, pkg, interactions, lessonBytes, sourceBytes, artifactBytes] = await Promise.all([
  bytes(path.join(PLAN, "LEARNER_PROJECTION.json")),
  bytes(path.join(ROOT, "app/data/paper4-v2/learner-projections/queue.json")),
  text(path.join(ROOT, "app/components/paper4-learning/QueueTrace.tsx")),
  text(path.join(ROOT, "app/components/paper4-learning/queueProjectionAdapter.ts")),
  text(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts")),
  text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx")),
  text(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx")),
  text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.module.css")),
  text(path.join(ROOT, "package.json")),
  bytes(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx")),
  bytes(path.join(ROOT, "app/data/paper4-v2/lessons/queue.json")),
  bytes(path.join(ROOT, "content/paper4/python/pilot/queue/source.py")),
  bytes(path.join(ROOT, "content/paper4/python/pilot/queue/artifact.json")),
]);
const projection = JSON.parse(planningBytes);
const lesson = JSON.parse(lessonBytes);
const artifact = JSON.parse(artifactBytes);
const checks = [];
const failures = [];
function record(id, passed, message, evidence = {}) {
  const check = { id, passed: Boolean(passed), message, evidence };
  checks.push(check);
  if (!check.passed) failures.push(check);
}

record("QU-S01", sha(planningBytes) === PROJECTION_SHA && sha(appBytes) === PROJECTION_SHA && Buffer.compare(planningBytes, appBytes) === 0, "Planning and app Queue projections are byte-identical", { planning: sha(planningBytes), app: sha(appBytes) });
record("QU-S02", JSON.stringify(projection.stage_order) === JSON.stringify(["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"]), "Six-stage topology is exact");
record("QU-S03", projection.stages.understand.python_recipe.length === 13 && projection.stages.trace.steps.length === 5 && projection.stages.trace.variants.length === 2, "Recipe, five primary decisions and two subordinate cases are exact");
record("QU-S04", projection.stages.practise.items.length === 6 && projection.stages.protectMarks.mistakes.length === 4 && projection.stages.recallAndContinue.recall_items.length === 5, "Practice, Protect and Recall counts are exact");
record("QU-S05", JSON.stringify(projection.stages.trace.scenario.operations) === JSON.stringify([["enqueue", 10], ["enqueue", 20], ["dequeue"], ["enqueue", 30], ["enqueue", 40]]), "Primary operation order is exact");
const finalState = projection.stages.trace.steps[4].expected;
record("QU-S06", JSON.stringify(finalState.items) === JSON.stringify([40, 20, 30]) && JSON.stringify(finalState.logical) === JSON.stringify([20, 30, 40]) && finalState.front === 1 && finalState.rear === 1 && finalState.count === 3, "Final physical and logical Queue states are exact", finalState);
record("QU-S07", projection.stages.trace.steps.every((step) => step.code_focus.length > 0 && step.code_focus.length <= 3), "Every decision focuses one to three code lines");
record("QU-S08", projection.stages.trace.steps.every((step) => step.expected.count >= 0 && step.expected.count <= 3 && step.expected.logical.length === step.expected.count), "Every primary state has possible count, pointers and logical length");
const [emptyCase, fullCase] = projection.stages.trace.variants;
record("QU-S09", emptyCase.kind === "boundary_empty_dequeue" && emptyCase.expected.outcome === null && emptyCase.expected.state_unchanged === true && JSON.stringify(emptyCase.input.items) === JSON.stringify(emptyCase.expected.items), "Empty dequeue returns None and preserves storage");
record("QU-S10", fullCase.kind === "boundary_full_enqueue" && fullCase.expected.outcome === false && fullCase.expected.state_unchanged === true && JSON.stringify(fullCase.input) !== "" && JSON.stringify(fullCase.input.items) === JSON.stringify(fullCase.expected.items), "Full enqueue returns False and preserves storage");
record("QU-S11", projection.stages.trace.inspection.numeric_total === 90 && projection.stages.trace.inspection.state_unchanged === true && JSON.stringify(projection.stages.trace.inspection.logical_values) === JSON.stringify([20, 30, 40]), "Inspection total is non-mutating micro-evidence only");
record("QU-S12", /data-testid="paper4-queue-trace"/.test(runtime) && /data-scene="circular-front-rear-count"/.test(runtime) && /data-queue-front/.test(runtime) && /data-queue-rear/.test(runtime) && /data-queue-count/.test(runtime), "One circular Queue scene exposes finite front, rear and count state");
record("QU-S13", (runtime.match(/data-trace-panel=/g) ?? []).length === 2 && /data-code-panel="queue-focus"/.test(runtime), "Trace has two panels and one focused code panel");
record("QU-S14", /revealed \? `\[\$\{step\.expected\.logical/.test(runtime) && /revealed \? <><strong>\{t\.outcome\}/.test(runtime) && /revealed && <div data-answer-revealed="true"/.test(runtime), "Logical result, outcome and answer are reveal-gated");
record("QU-S15", /complete && <section className=\{styles\.queueSupport\}/.test(runtime) && /open && <div data-support-revealed="true"/.test(runtime), "Rejected-operation support and resulting state are attempt-gated");
record("QU-S16", /data-static-convention/.test(runtime) && /index >= 3/.test(runtime) && !/data-scene=.*rear-last|data-case-kind=.*linear/.test(runtime), "Three alternate conventions are static Practice transfers only");
record("QU-S17", !/Paper4VisualRuntime|public\/paper4-v2\/traces|traceLoader|queue-reduce|recursive.*reduce|destructive.*reduce|RLE.*data-scene/i.test(runtime + adapter), "Queue imports no public trace or excluded Reduce pathway");
record("QU-S18", /hasExactFields\(value, traceFields\)/.test(adapter) && /hasExactFields\(value, practiceFields\)/.test(adapter) && /revealed\.some/.test(adapter) && /impossible state/.test(adapter), "Restoration fails closed on schema, hash, extra payload, unattempted reveal and impossible Queue state");
record("QU-S19", /lessonSlug === "queue"[\s\S]*?<QueueTrace/.test(journey) && /lessonSlug === "queue"[\s\S]*?<QueuePractice/.test(journey) && /lessonSlug === "queue"[\s\S]*?QUEUE_PROTECT_KEY/.test(journey), "Trace, Practice and progressive Protect are routed only for Queue");
record("QU-S20", /removeItem\(stageKey\)/.test(journey) && /removeItem\(practiceProgressKey\(lessonSlug\)\)/.test(journey) && /removeItem\(recallProgressKey\(lessonSlug\)\)/.test(journey) && /removeItem\(QUEUE_PROGRESS_KEY\)/.test(journey) && /removeItem\(QUEUE_PROTECT_KEY\)/.test(journey), "Restart clears exactly Queue stage, trace, practice, protect and recall keys");
record("QU-S21", sha(interactions) === "A87E4FB1839BA9BA4B1BD897AA6115C5E398F8F7909D16051413D418F1BA6DCC", "Frozen LearnerInteractions remains unchanged", { sha256: sha(interactions) });
record("QU-S22", /"queue": queueProjection/.test(page) && /lesson\.identity\.slug === "queue"[\s\S]*?candidate-awaiting-user-evaluation/.test(page), "Queue candidate is registered with the required review marker");
const candidateBody = page.match(/const learnerCandidates[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const candidateSlugs = [...candidateBody.matchAll(/"([a-z-]+)"\s*:/g)].map((match) => match[1]);
record("QU-S23", JSON.stringify(candidateSlugs) === JSON.stringify(["binary-search", "data-models", "procedural-design", "validation-rules", "testing", "text-processing", "search-collections", "sorting", "performance", "stack", "queue"]), "Candidate set ends exactly at Queue; Linked List remains locked", { candidateSlugs });
record("QU-S24", /\.queuePanels/.test(css) && /\.queueBadges/.test(css) && /@container \(max-width: 52rem\)/.test(css) && /min-height: var\(--alg-touch-target\)/.test(css) && /Textarea/.test(runtime), "Queue responsive contract exists and interactive fields use the frozen DS2 Textarea focus/target contract");
record("QU-S25", /QueueCaseKind = "normal-circular-wrap" \| "boundary-empty-dequeue" \| "boundary-full-enqueue"/.test(types), "Typed Queue case set is exact");
record("QU-S26", /algocore\.paper4\.learner\.queue\.trace\.v1/.test(adapter) && /algocore\.paper4\.learner\.queue\.practice\.v1/.test(adapter) && /algocore\.paper4\.learner\.queue\.protect-marks\.v1/.test(adapter) && /algocore\.paper4\.learner\.\$\{lessonSlug\}\.stage\.v1/.test(journey) && /algocore\.paper4\.learner\.\$\{lessonSlug\}\.recall\.v1/.test(interactions.toString("utf8")), "Exact five Queue storage-key families are used");
record("QU-S27", /check:paper4:queue/.test(pkg) && /check:paper4:queue:browser/.test(pkg), "Package exposes both Queue gates");
record("QU-S28", sha(sourceBytes) === SOURCE_SHA && artifact.python_artifact_id === "ac-9618-p4-2026-python.artifact.queue.pilot-v1" && String(artifact.code_sha256).toUpperCase() === SOURCE_SHA && lesson.python.code_sha256.toUpperCase() === SOURCE_SHA, "Verified pilot-v1 label and source hash remain exact", { source_sha256: sha(sourceBytes), artifact_id: artifact.python_artifact_id });
record("QU-S29", !/production-v1|production Queue|production artifact/i.test(runtime + JSON.stringify(projection)), "Learner projection and runtime make no Queue production claim");
record("QU-S30", !/fixture[_ -]?id|pattern[_ -]?id|source[_ -]?sha|execution[_ -]?log|official[_ -]?marks|marking[_ -]?atom|exam frequency|58 patterns|174 scenarios|870 bindings/i.test(runtime), "Queue runtime contains no learner-facing audit metadata");
record("QU-S31", !/front\s*==\s*rear[^\n]{0,80}(?:empty|rỗng)/i.test(runtime) && projection.stages.understand.python_recipe.includes("    if self.count == 0: return None") && projection.stages.understand.python_recipe.includes("    self.rear = (self.rear + 1) % len(self.items)"), "Count guards and modulo updates replace quarantined pointer/indentation defects");

await mkdir(EVIDENCE, { recursive: true });
const report = {
  schema_version: "paper4-queue-static-gate-v1",
  candidate_id: "P4-queue-C1",
  decision: failures.length ? "FAIL" : "PASS",
  checks_run: checks.length,
  checks_passed: checks.length - failures.length,
  failures,
  checks,
};
await writeFile(path.join(EVIDENCE, "LEARNER_STATIC_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
