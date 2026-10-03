import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANNING = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/search-collections/LEARNER_PROJECTION.json");
const APP = path.join(ROOT, "app/data/paper4-v2/learner-projections/search-collections.json");
const EVIDENCE = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/search-collections/evidence");
const EXPECTED_SHA = "BD98010D781359A3E03BE8591B9C94C9B81E2F9EF9A198D2166163D7B1EB6DF1";
const EXPECTED_STAGES = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"];
const checks = [], failures = [];
const record = (id, passed, message, evidence = {}) => { const item = { id, passed: Boolean(passed), message, evidence }; checks.push(item); if (!item.passed) failures.push(item); };
const bytes = (file) => readFile(file);
const text = async (file) => (await bytes(file)).toString("utf8");
const sha = (value) => createHash("sha256").update(value).digest("hex").toUpperCase();

const planningBytes = await bytes(PLANNING), appBytes = await bytes(APP), projection = JSON.parse(planningBytes);
record("SC-S01", sha(planningBytes) === EXPECTED_SHA && sha(appBytes) === EXPECTED_SHA && appBytes.equals(planningBytes), "Planning and app projections are byte-identical to the Teacher-approved projection", { expected_sha256: EXPECTED_SHA, planning_sha256: sha(planningBytes), app_sha256: sha(appBytes) });
record("SC-S02", projection.status === "teacher-approved-for-implementation" && JSON.stringify(projection.stage_order) === JSON.stringify(EXPECTED_STAGES), "Projection preserves the approved six-stage topology");
record("SC-S03", projection.stages.understand.python_recipe.lines.length === 6 && projection.stages.trace.steps.length === 3 && projection.stages.trace.steps.every((step) => step.code_focus.length <= 3), "Projection retains the six-line excerpt and exactly three compact normal decisions");
const [boundary, absent] = projection.stages.trace.variants;
record("SC-S04", projection.stages.trace.variants.length === 2 && boundary.kind === "boundary" && boundary.input.values.length === 0 && boundary.expected.found === -1 && absent.kind === "not_found" && JSON.stringify(absent.input.values) === JSON.stringify([1,3,5]) && absent.input.target === 2 && absent.expected.found === -1, "Empty and absent target are the two exact valid variant outcomes");
record("SC-S05", !projection.stages.trace.variants.some((item) => item.kind === "failure") && projection.stages.practise.items.length === 5 && projection.stages.protectMarks.mistakes.length === 4 && projection.stages.recallAndContinue.recall_items.length === 5, "Projection has no fabricated failure and retains five Practice, four risk and five Recall items");

const adapter = await text(path.join(ROOT, "app/components/paper4-learning/searchCollectionsAdapter.ts"));
const runtime = await text(path.join(ROOT, "app/components/paper4-learning/SearchCollectionsTrace.tsx"));
const types = await text(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts"));
const journey = await text(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx"));
const page = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"));
const interactionsBytes = await bytes(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"));
const css = await text(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.module.css"));

record("SC-S06", /SearchCollectionsCaseKind = "normal-primary" \| "normal-last" \| "normal-single" \| "boundary-empty" \| "not-found"/.test(types) && /SearchCollectionsTraceVariant/.test(types), "Typed projection declares the exact five verified case kinds without failure");
record("SC-S07", /data-scene="linear-first-index"/.test(runtime) && /data-array-item-index/.test(runtime) && /data-cursor-index/.test(runtime) && /data-found-state/.test(runtime), "One indexed array exposes stable cursor and found-state semantics");
record("SC-S08", /data-code-panel="search-collections-focus"/.test(runtime) && (runtime.match(/data-trace-panel=/g) ?? []).length === 2 && /data-trace-prediction/.test(runtime), "Runtime declares one focused code panel, one prediction panel and exactly two Trace panels");
record("SC-S09", !/Paper4VisualRuntime|public\/paper4-v2\/traces|traceLoader|COUNT_OCCURRENCES|FILTER_RECORDS|GROUP_AGGREGATE|LINEAR_SEARCH_FIRST_INDEX/.test(runtime + adapter), "Primary runtime imports no public trace, simulator or pattern enum");
record("SC-S10", /normalIds\.every/.test(adapter) && /disabled=\{!normalComplete\}/.test(runtime) && /found == -1/.test(JSON.stringify(projection.stages.trace.steps)), "Normal 3/3 gates variants and the first match cannot be replaced");
record("SC-S11", /revealed && <div data-answer-revealed="true"/.test(runtime) && runtime.includes("disabled={!draft.trim()}") && /status="info"/.test(runtime), "All answers require a non-empty prediction and valid missing outcomes use neutral feedback");
record("SC-S12", /export function SearchCollectionsPractice/.test(runtime) && /index === 1 \? "boolean" : index === 2 \? "count" : index === 3 \? "filter" : index === 4 \? "group"/.test(runtime) && /hasAttempt && <div/.test(runtime), "Practice maps exact sequential Boolean/count/filter/group transfers behind attempts");
record("SC-S13", sha(interactionsBytes) === "A87E4FB1839BA9BA4B1BD897AA6115C5E398F8F7909D16051413D418F1BA6DCC" && /lessonSlug === "search-collections"\s*\? <SearchCollectionsPractice/.test(journey), "LearnerInteractions is unchanged and only Search Collections uses its local Practice", { learner_interactions_sha256: sha(interactionsBytes) });
record("SC-S14", /SEARCH_COLLECTIONS_PRACTICE_KEY/.test(runtime + adapter) && !/TRANSFER_(?:KEY|PROGRESS)|transfer[^\n]*(?:sessionStorage|PROGRESS_KEY)/.test(runtime + adapter), "Practice uses one approved key and no transfer-specific state");
record("SC-S15", /SEARCH_COLLECTIONS_PROTECT_KEY/.test(journey) && /data-protect-marks-mode="progressive"/.test(await text(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"))), "Protect reuses one-of-four progressive disclosure");
record("SC-S16", /"search-collections": searchCollectionsProjection/.test(page) && /lesson\.identity\.slug === "search-collections"[\s\S]*?candidate-awaiting-user-evaluation/.test(page), "Search Collections passed internal gates and awaits user evaluation");
const mapBody = page.match(/const learnerCandidates[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
const candidateSlugs = [...mapBody.matchAll(/"([a-z-]+)"\s*:/g)].map((item) => item[1]);
record("SC-S17", JSON.stringify(candidateSlugs) === JSON.stringify(["binary-search","data-models","procedural-design","validation-rules","testing","text-processing","search-collections","sorting","performance", "stack", "queue"]), "Only the exact Lead-authorised candidate set through Performance is open", { candidate_slugs: candidateSlugs });
record("SC-S18", /value\.phase === "revealed" && !drafts\[currentId\]\?\.trim\(\)/.test(adapter) && /removeItem\(SEARCH_COLLECTIONS_PROGRESS_KEY\)/.test(journey) && /removeItem\(SEARCH_COLLECTIONS_PROTECT_KEY\)/.test(journey), "Restore rejects unattempted reveals and Restart clears lesson-local Trace/Protect keys");
record("SC-S19", /\.searchCollectionsTracePanels/.test(css) && /data-lesson-slug="search-collections"/.test(css) && /searchCollectionsPredictionPanel textarea:focus-visible/.test(css), "Lesson-scoped reflow, wrapped stages and focus-visible contracts are present");
record("SC-S20", !/(?:fixture_id|pattern_id|source_sha|execution_log|official_marks|marking_atom|58 patterns|174 scenarios|870 bindings|release state|audit metadata)/i.test(runtime), "Runtime exposes no forbidden learner metadata");
const expectedDs2 = { "AlgoCoreUI.module.css":"C2D7CA1876A1E4F69ED6B7AFA9348BE24D8C6FADE42473C6E8255F0974E304C8", "controls.tsx":"FFDAC34E62D5C94CFDC494C3724C7419AB7E05D45E2E75AC8DFE78DDFD4BCCBB", "index.ts":"DDD3228AC9B37B7D2E62EFAAA4CF90E8D54CFF7337FD9C92E2DE8D195FF072A1", "journey.tsx":"8EECA214E50F0086F8064DBB829D97D31F84C43EDA1FF8FA815E2432DA1423AA", "surfaces.tsx":"045856F40F1E5360D5B182F4C828E5C1957EA80138C5305B3298DF902E2CCBC3" };
const ds2 = await Promise.all(Object.entries(expectedDs2).map(async ([file, expected]) => ({ file, expected, actual: sha(await bytes(path.join(ROOT, "app/components/algocore-ui", file))) })));
record("SC-S21", ds2.every((item) => item.actual === item.expected), "Frozen DS2 files retain accepted hashes", { files: ds2 });

const report = { schema_version: "paper4-search-collections-static-gate-v1", candidate_id: "P4-search-collections-C1", decision: failures.length ? "FAIL" : "PASS", checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
await mkdir(EVIDENCE, { recursive: true }); await writeFile(path.join(EVIDENCE, "LEARNER_STATIC_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`); console.log(JSON.stringify({ ...report, checks: undefined }, null, 2)); if (failures.length) process.exitCode = 1;
