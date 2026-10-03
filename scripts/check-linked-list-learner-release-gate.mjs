import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_ROOT = existsSync(path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/linked-list")) ? path.resolve(ROOT, "..") : path.resolve(ROOT, "../..");
const PLAN = path.resolve(PAGE_ROOT, "planning/paper4/completion-program-2026/lessons/linked-list");
const EVIDENCE = path.join(PLAN, "evidence");
const PROJECTION_SHA = "D273B1E152335CC29B7C3D6BDFC170886D90DBE84E3F315880E786AE6A6B1B8C";
const SOURCE_SHA = "FA4F9FEBB2BD951AA6B8E35F0F02D78B3E7101A09151A7A4326B2A651F5BDCBC";
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex").toUpperCase();
const bytes = (file) => readFile(file);
const text = (file) => readFile(file, "utf8");

const files = {
  interactions: ["app/components/paper4-learning/LearnerInteractions.tsx", "A87E4FB1839BA9BA4B1BD897AA6115C5E398F8F7909D16051413D418F1BA6DCC"],
  controls: ["app/components/algocore-ui/controls.tsx", "FFDAC34E62D5C94CFDC494C3724C7419AB7E05D45E2E75AC8DFE78DDFD4BCCBB"],
  uiIndex: ["app/components/algocore-ui/index.ts", "DDD3228AC9B37B7D2E62EFAAA4CF90E8D54CFF7337FD9C92E2DE8D195FF072A1"],
  journeyUi: ["app/components/algocore-ui/journey.tsx", "8EECA214E50F0086F8064DBB829D97D31F84C43EDA1FF8FA815E2432DA1423AA"],
  surfaces: ["app/components/algocore-ui/surfaces.tsx", "045856F40F1E5360D5B182F4C828E5C1957EA80138C5305B3298DF902E2CCBC3"],
  uiCss: ["app/components/algocore-ui/AlgoCoreUI.module.css", "C2D7CA1876A1E4F69ED6B7AFA9348BE24D8C6FADE42473C6E8255F0974E304C8"],
  registry: ["app/data/stage8-runtime-registry.json", "4A5A9B154D2B1DE8197D42C7C900E2CD738238DDADDAC9842CCD40246E2FFC34"],
  manifest: ["app/data/paper4-v2/course-manifest.json", "5C0276A191D0430DDF4631C5B4EA1FA8117EF9F4FAB6C31CAF21E950733B9CF5"],
  loaders: ["app/data/paper4-v2/lesson-loaders.generated.ts", "44B7E2C8026AC32C4099C595D2C946D4AB81CC9052540F19834DE544A340B3E6"],
  lesson: ["app/data/paper4-v2/lessons/linked-list.json", "E01FAB3C39A323495CF2C45D946AA7FA24B5ED593AAFE6233E5EB7DF5237345B"],
  source: ["content/paper4/python/production/linked-list/source.py", SOURCE_SHA],
  artifact: ["content/paper4/python/production/linked-list/artifact.json", "F3388C9ADD2348D5236E92C4EDD2619952C6D31722CB4B8FF075E1DAB54068F2"],
  listInsert: ["public/paper4-v2/traces/list-insert.json", "BCAF152F114A976180CB2E150893C50BD2B202D7F8AC50AB44FCB6FF591A8E4A"],
  listRemove: ["public/paper4-v2/traces/list-remove.json", "A4313E158B6CD8E722B5965BCCD9ABF1F9AF45342666C6B1CA445098C846A780"],
  listSetup: ["public/paper4-v2/traces/list-setup.json", "76C5CCF2F7F0CAE23EDB6134AE78288FB68B91F98332DACEE52443F9F836D8B2"],
  listTraverse: ["public/paper4-v2/traces/list-traverse.json", "800F9CC7547A9E8486091E90B07C55D3CF108385B184D33CBC35BD76F26DFA80"],
};

const [planningBytes, appBytes, runtime, adapter, types, page, journey, css, pkg] = await Promise.all([
  bytes(path.join(PLAN, "LEARNER_PROJECTION.json")),
  bytes(path.join(ROOT, "app/data/paper4-v2/learner-projections/linked-list.json")),
  text(path.join(ROOT, "app/components/paper4-learning/LinkedListTrace.tsx")),
  text(path.join(ROOT, "app/components/paper4-learning/linkedListProjectionAdapter.ts")),
  text(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts")),
  text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx")),
  text(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx")),
  text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.module.css")),
  text(path.join(ROOT, "package.json")),
]);
const projection = JSON.parse(planningBytes);
const checks = [];
const failures = [];
function record(id, passed, message, evidence = {}) { const check = { id, passed: Boolean(passed), message, evidence }; checks.push(check); if (!check.passed) failures.push(check); }

function derive(next, start) {
  const result = [];
  const seen = new Set();
  let node = start;
  while (node !== -1) {
    if (!Number.isInteger(node) || node < 0 || node >= next.length || seen.has(node)) return null;
    seen.add(node); result.push(node); node = next[node];
  }
  return result;
}
function validPartition(state, capacity) {
  if (capacity < 1 || state.data.length !== capacity || state.next.length !== capacity) return false;
  const live = derive(state.next, state.head); const free = derive(state.next, state.free);
  if (!live || !free) return false;
  const all = [...live, ...free];
  return all.length === capacity && new Set(all).size === capacity && JSON.stringify(live) === JSON.stringify(state.live_chain) && JSON.stringify(free) === JSON.stringify(state.free_chain) && JSON.stringify(live.map((node) => state.data[node]).filter((value) => value !== null)) === JSON.stringify(state.logical ?? []);
}
function localeParity(value, pathName = "projection", failures = []) {
  if (!value || typeof value !== "object") return failures;
  if (Object.hasOwn(value, "en") || Object.hasOwn(value, "vi")) {
    if (typeof value.en !== "string" || typeof value.vi !== "string" || !value.en.trim() || !value.vi.trim()) failures.push(pathName);
    return failures;
  }
  if (Array.isArray(value)) value.forEach((item, index) => localeParity(item, `${pathName}[${index}]`, failures));
  else Object.entries(value).forEach(([key, item]) => localeParity(item, `${pathName}.${key}`, failures));
  return failures;
}

record("LL-S01", sha(planningBytes) === PROJECTION_SHA && sha(appBytes) === PROJECTION_SHA && Buffer.compare(planningBytes, appBytes) === 0, "Planning and app Linked List projections are byte-identical", { planning: sha(planningBytes), app: sha(appBytes) });
record("LL-S02", JSON.stringify(projection.stage_order) === JSON.stringify(["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"]), "Six-stage topology is exact");
record("LL-S03", projection.stages.understand.python_recipe.length === 13 && projection.stages.trace.steps.length === 6 && projection.stages.trace.variants.length === 2, "Mutation recipe, six primary decisions and two projection variants are exact");
record("LL-S04", projection.stages.practise.items.length === 8 && projection.stages.protectMarks.mistakes.length === 4 && projection.stages.recallAndContinue.recall_items.length === 5, "Practice, Protect and Recall counts are exact");
record("LL-S05", projection.stages.trace.scenario.capacity === 5 && JSON.stringify(projection.stages.trace.scenario.operations) === JSON.stringify([["insert_head",4],["insert_head",2],["insert_head",1],["remove_first",2]]), "Positive-capacity primary operation order is exact");
const fullStates = [projection.stages.trace.scenario.initial, ...projection.stages.trace.steps.slice(0,3).map((step) => step.expected), projection.stages.trace.steps[5].expected];
record("LL-S06", fullStates.every((state) => validPartition(state, 5)), "Every complete primary snapshot has a cycle-free disjoint complete live/free partition");
const final = projection.stages.trace.steps[5].expected;
record("LL-S07", JSON.stringify(final.data) === JSON.stringify([4,null,1,null,null]) && JSON.stringify(final.next) === JSON.stringify([-1,3,0,4,-1]) && final.head === 2 && final.free === 1 && JSON.stringify(final.live_chain) === "[2,0]" && JSON.stringify(final.free_chain) === "[1,3,4]", "Final data, next, head, free and live/free chains are exact", final);
const [singleton, rejected] = projection.stages.trace.variants;
record("LL-S08", singleton.kind === "boundary_singleton_remove" && validPartition(singleton.expected, 1) && singleton.expected.head === -1 && singleton.expected.free === 0, "Capacity-one singleton removal returns the node to free");
record("LL-S09", rejected.kind === "rejected_full_and_missing" && rejected.input.capacity === 2 && rejected.expected.inserted === false && rejected.expected.removed === false && rejected.expected.head === 1 && rejected.expected.free === -1 && rejected.expected.state_unchanged_after_each_rejection === true, "Full insert and missing remove both preserve every state field", rejected.expected);
record("LL-S10", projection.stages.trace.steps[4].expected.successor === 0 && projection.stages.trace.steps[4].expected.old_free === 3 && /successor = self\.next\[node\]/.test(JSON.stringify(projection.stages.trace.steps[4])) && /self\.next\[previous\] = successor/.test(JSON.stringify(projection.stages.trace.steps[4])) && /self\.next\[node\] = previous_free/.test(JSON.stringify(projection.stages.trace.steps[5])), "Save-before-overwrite and live-before-free mutation order is exact");
record("LL-S11", projection.stages.trace.steps.every((step) => step.code_focus.length >= 1 && step.code_focus.length <= 3), "Every decision focuses at most three code lines");
record("LL-S12", localeParity(projection).length === 0, "Every localized learner field has non-empty EN and VI parity", { failures: localeParity(projection) });
record("LL-S13", /data-testid="paper4-linked-list-trace"/.test(runtime) && /data-scene="parallel-array-live-free"/.test(runtime) && /data-node-index/.test(runtime) && /data-list-head/.test(runtime) && /data-free-head/.test(runtime) && /data-live-chain/.test(runtime) && /data-free-chain/.test(runtime), "One live/free Trace exposes the required stable markers");
record("LL-S14", /revealed && <div className=\{styles\.linkedListChains\}/.test(runtime) && /revealed \? <><strong>\{t\.outcome\}/.test(runtime) && /open && <div className=\{styles\.linkedListBeforeAfter\}/.test(runtime), "Results, chains and support remain absent until non-empty predictions");
record("LL-S15", /boundary:singleton/.test(runtime) && /rejection:full/.test(runtime) && /rejection:missing/.test(runtime), "Singleton, full-insert and missing-remove each require an owned prediction");
record("LL-S16", /index >= 5 && <aside data-static-transfer/.test(runtime) && !/data-scene=.*tail|data-case-kind=.*object|data-case-kind=.*search/.test(runtime), "Tail insertion, object nodes and dedicated search remain static Practice transfers");
record("LL-S17", !/Paper4VisualRuntime|traceLoader|public\/paper4-v2\/traces|list-insert\.json|list-remove\.json|list-setup\.json|list-traverse\.json/.test(runtime + adapter), "Linked List imports no public trace and does not multiply duplicate routes");
record("LL-S18", /capacity < 1/.test(adapter) && /cyclic or out of range/.test(adapter) && /disjoint complete partition/.test(adapter) && !/capacity\s*[:=]\s*0|capacity\s*[:=]\s*-\d/.test(runtime + JSON.stringify(projection)), "Adapter fails closed below capacity one and on invalid topology; no invalid-capacity learner case exists");
record("LL-S19", /hasExactFields\(value, traceFields\)/.test(adapter) && /hasExactFields\(value, practiceFields\)/.test(adapter) && /reveals\.some/.test(adapter) && /attempted\.some/.test(adapter), "Trace and Practice restore only strict hash-bound state with matching non-empty drafts");
record("LL-S20", /lessonSlug === "linked-list"[\s\S]*?<LinkedListTrace/.test(journey) && /lessonSlug === "linked-list"[\s\S]*?<LinkedListPractice/.test(journey) && /lessonSlug === "linked-list"[\s\S]*?LINKED_LIST_PROTECT_KEY/.test(journey), "Trace, Practice and progressive Protect route only for Linked List");
record("LL-S21", /removeItem\(stageKey\)/.test(journey) && /removeItem\(practiceProgressKey\(lessonSlug\)\)/.test(journey) && /removeItem\(recallProgressKey\(lessonSlug\)\)/.test(journey) && /removeItem\(LINKED_LIST_PROGRESS_KEY\)/.test(journey) && /removeItem\(LINKED_LIST_PROTECT_KEY\)/.test(journey), "Restart clears exactly Linked List stage, trace, practice, protect and recall families");
const candidateBody = page.match(/const learnerCandidates[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const candidateSlugs = [...candidateBody.matchAll(/"([a-z-]+)"\s*:/g)].map((match) => match[1]);
record("LL-S22", JSON.stringify(candidateSlugs) === JSON.stringify(["binary-search","data-models","procedural-design","validation-rules","testing","text-processing","search-collections","sorting","performance","stack","queue","linked-list"]) && !candidateSlugs.includes("recursion"), "Candidate set appends only Linked List after Queue; Recursion remains locked", { candidateSlugs });
record("LL-S23", /lesson\.identity\.slug === "linked-list"[\s\S]*?candidate-awaiting-user-evaluation/.test(page), "Linked List passed internal gates and awaits user evaluation");
record("LL-S24", /LinkedListCaseKind = "normal-remove-recycle" \| "boundary-singleton-remove" \| "rejected-full-missing"/.test(types) && /LinkedListPhase = "predict" \| "revealed"/.test(types), "Typed case and phase contracts are exact");
record("LL-S25", /algocore\.paper4\.learner\.linked-list\.trace\.v1/.test(adapter) && /algocore\.paper4\.learner\.linked-list\.practice\.v1/.test(adapter) && /algocore\.paper4\.learner\.linked-list\.protect-marks\.v1/.test(adapter) && /algocore\.paper4\.learner\.\$\{lessonSlug\}\.stage\.v1/.test(journey) && /algocore\.paper4\.learner\.\$\{lessonSlug\}\.recall\.v1/.test(await text(path.join(ROOT, files.interactions[0]))), "Exactly five Linked List storage-key families are used");
record("LL-S26", /check:paper4:linked-list/.test(pkg) && /check:paper4:linked-list:browser/.test(pkg), "Package exposes only the two Linked List gate aliases");
record("LL-S27", /\.linkedListPanels/.test(css) && /@container \(max-width: 64rem\)/.test(css) && /\.linkedListTable/.test(css) && /:focus-visible/.test(css), "Lesson-scoped responsive, table and focus styles exist");
const forbiddenSurface = runtime + JSON.stringify(projection);
record("LL-S28", !/fixture[_ -]?id|pattern[_ -]?id|event[_ -]?id|owner[_ -]?(?:lesson|slug)|artifact[_ -]?id|source[_ -]?sha|execution[_ -]?log|official[_ -]?marks|marking[_ -]?atom|raw json|PDF p\.|QP p\.|MS p\.|exam frequency/i.test(forbiddenSurface), "Learner copy contains no forbidden audit, source-locator, marks or frequency metadata");
const defects = [/global startPointer[\s\S]{0,240}heapStartPointer/i, /myLinkedList\[index\][\s\S]{0,100}index\s*!=\s*-1/i, /\boldindex\b/i, /range\(0,\s*19\)/i, /FirstNode[\s\S]{0,100}LinkedList\[FirstNode\]/i, /next\[node\]\s*=\s*head[\s\S]{0,120}free\s*=\s*next\[node\]/i];
record("LL-S29", defects.every((pattern) => !pattern.test(forbiddenSurface)), "All six known defective source shapes remain quarantined");
const noTouch = {};
for (const [name, [file, expected]] of Object.entries(files)) { const actual = sha(await bytes(path.join(ROOT, file))); noTouch[name] = { file, expected, actual, passed: actual === expected }; }
record("LL-S30", Object.values(noTouch).every((item) => item.passed), "Frozen DS2, interactions, registry, lesson, source, artifact and four public traces are unchanged", noTouch);

await mkdir(EVIDENCE, { recursive: true });
const report = { schema_version: "paper4-linked-list-static-gate-v1", candidate_id: "P4-linked-list-C1", projection_sha256: PROJECTION_SHA, decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
await writeFile(path.join(EVIDENCE, "LEARNER_STATIC_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
