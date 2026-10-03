import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const STATIC_ONLY = process.argv.includes("--static-only");
const LESSON_SLUG = "data-models";
const ROUTE = `/paper-4/lessons/${LESSON_SLUG}`;
const EXPECTED_STAGES = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"];
const EXPECTED_COUNTS = { normal: 3, boundary: 2, failure: 1 };
const PRIMARY_OPERATIONS = ["check_record", "check_capacity", "append"];
const APPROVED_PATH = path.resolve(ROOT, "../planning/paper4/student-friendly-rollout-25/lessons/data-models/LEARNER_PROJECTION.json");
const APP_PROJECTION_PATH = path.join(ROOT, "app/data/paper4-v2/learner-projections/data-models.json");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper4/student-friendly-rollout-25/lessons/data-models/evidence");

const checks = [];
const failures = [];
const blockers = [];
function record(gate, passed, message, evidence = {}, kind = "failure") {
  const item = { gate, passed: Boolean(passed), message, evidence };
  checks.push(item);
  if (!item.passed) {
    failures.push(item);
    if (kind === "blocker") blockers.push(item);
  }
}

async function optionalBytes(file) {
  try { return await readFile(file); } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function localizedPairGaps(value, pointer = "$", gaps = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => localizedPairGaps(item, `${pointer}[${index}]`, gaps));
    return gaps;
  }
  if (!value || typeof value !== "object") return gaps;
  const keys = Object.keys(value);
  if (keys.includes("en") || keys.includes("vi")) {
    if (typeof value.en !== "string" || !value.en.trim() || typeof value.vi !== "string" || !value.vi.trim()) gaps.push(pointer);
  }
  for (const [key, item] of Object.entries(value)) localizedPairGaps(item, `${pointer}.${key}`, gaps);
  return gaps;
}

const HIDDEN_TAGS = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"]);
function hiddenByContract(element, boundary) {
  let current = element;
  while (current && current !== boundary.parentElement) {
    if (HIDDEN_TAGS.has(current.tagName)) return true;
    if (current.hasAttribute("hidden") || current.getAttribute("aria-hidden") === "true") return true;
    const details = current.closest("details:not([open])");
    if (details && !current.closest("summary")) return true;
    current = current.parentElement;
  }
  return false;
}

function defaultSurface(root) {
  const values = [];
  const walker = root.ownerDocument.createTreeWalker(root, 1 | 4);
  let node = walker.currentNode;
  while (node) {
    const element = node.nodeType === 1 ? node : node.parentElement;
    if (element && !hiddenByContract(element, root)) {
      if (node.nodeType === 3 || node.nodeType === 4) {
        const text = normalize(node.nodeValue);
        if (text) values.push(text);
      } else {
        for (const attribute of ["aria-label", "title", "alt", "placeholder"]) {
          const text = normalize(node.getAttribute(attribute));
          if (text) values.push(text);
        }
      }
    }
    node = walker.nextNode();
  }
  return normalize(values.join(" "));
}

const bannedPatterns = [
  ["internal package prefix", /\bac-9618-/i],
  ["canonical section id", /paper4\.section\./i],
  ["pattern enum", /\b(?:ARRAY_APPEND|DATA_RECORD|DATA_STORAGE|RANDOM_ARRAY)\b/],
  ["artifact version", /\bpilot-v1\b/i],
  ["fixture id", /\bdata-models\.(?:normal|boundary|failure)\b/i],
  ["schema/internal key", /\b(?:fixture_id|pattern_id|scenario_id|event_id|knowledge_unit_id|section_id|source_id|random_average)\b/i],
  ["marking internals", /\b(?:method_step(?:_id|_refs?)?|marking_atom(?:_id|_count|s)?|official_marks|disclosure_contract)\b/i],
  ["hash or run reference", /\b(?:SHA-?256|author_run_ref|independent_rerun_ref|execution_log_sha256)\b/i],
  ["hex digest", /\b[a-f0-9]{64}\b/i],
  ["authority/status enum", /\b(?:CITATION_ONLY|PRIMARY_EXAM_BOARD|ALGOCOR[E]?_AUTHORED|INTERNAL_CITATION|LEAD_MAPPED)\b/i],
];

function checkStageDom(document, route) {
  const root = document.querySelector('[data-learner-journey="six-stage"]');
  record("DM-A08", Boolean(root), `${route}: six-stage learner root exists`);
  if (!root) return;
  const stages = [...root.querySelectorAll("[data-learner-stage]")];
  const observed = stages.map((item) => item.getAttribute("data-learner-stage"));
  record("DM-A08", JSON.stringify(observed) === JSON.stringify(EXPECTED_STAGES), `${route}: stage topology is exact`, { expected: EXPECTED_STAGES, observed });
  const current = stages.filter((item) => item.getAttribute("data-stage-state") === "current");
  record("DM-A08", current.length === 1 && Boolean(root.querySelector('[aria-current="step"], [aria-current="page"]')), `${route}: exactly one current stage is announced`, { current: current.map((item) => item.getAttribute("data-learner-stage")) });
  const missingHeadings = stages.filter((item) => {
    const id = item.getAttribute("aria-labelledby");
    return !id || !document.getElementById(id);
  }).map((item) => item.getAttribute("data-learner-stage"));
  record("DM-A08", missingHeadings.length === 0, `${route}: all stages have labelled headings`, { missing: missingHeadings });

  const surface = defaultSurface(root);
  const matches = bannedPatterns.flatMap(([label, expression]) => {
    const match = surface.match(expression);
    return match ? [{ label, token: match[0] }] : [];
  });
  record("DM-A09", matches.length === 0, `${route}: default learner surface contains no internal metadata`, { matches });
  const jsonBlocks = [...root.querySelectorAll("pre, code")].filter((item) => !hiddenByContract(item, root)).flatMap((item) => {
    const text = item.textContent?.trim() ?? "";
    if (!/^\s*[\[{]/.test(text)) return [];
    try { JSON.parse(text); return [text.slice(0, 160)]; } catch { return []; }
  });
  record("DM-A09", jsonBlocks.length === 0, `${route}: default learner surface contains no parseable raw JSON`, { samples: jsonBlocks });
  record("DM-A06", !/random_average|summarise_random_data/i.test(surface), `${route}: primary learner surface does not expose random-average internals`);
}

const approvedBytes = await readFile(APPROVED_PATH);
const approved = JSON.parse(approvedBytes.toString("utf8"));
record("DM-A01", approved.status === "teacher-approved-for-implementation", "Approved projection is signed for implementation", { status: approved.status });
record("DM-A02", JSON.stringify(approved.stage_order) === JSON.stringify(EXPECTED_STAGES), "Approved projection has exactly six ordered stages", { observed: approved.stage_order });
record("DM-A02", Object.entries(approved.stages ?? {}).every(([key, stage], index) => key === EXPECTED_STAGES[index] && stage.order === index + 1), "Approved stage objects preserve topology and ordinal values");
const localeGaps = localizedPairGaps(approved);
record("DM-A03", localeGaps.length === 0, "Approved projection has complete EN/VI localized pairs", { gaps: localeGaps });
record("DM-A04", approved.stages?.understand?.python_recipe?.lines?.length === 13, "Approved teaching recipe retains its signed 13-line budget", { observed: approved.stages?.understand?.python_recipe?.lines?.length });
record("DM-A04", approved.stages?.practise?.items?.length === 4 && approved.stages?.protectMarks?.mistakes?.length === 4 && approved.stages?.recallAndContinue?.recall_items?.length === 5, "Approved practise, Protect Marks and recall counts are intact", { practise: approved.stages?.practise?.items?.length, protect_marks: approved.stages?.protectMarks?.mistakes?.length, recall: approved.stages?.recallAndContinue?.recall_items?.length });

const steps = approved.stages?.trace?.steps ?? [];
const flowEvidence = steps.map((step) => normalize([step.heading?.en, step.context?.en, step.correct_feedback?.en, step.exam_sentence?.en, ...(step.code_focus ?? [])].join(" ")));
const flowOk = steps.length === 3 && /valid_record|INVALID_RECORD/i.test(flowEvidence[0] ?? "") && /capacity|len\(records\)|FULL/i.test(flowEvidence[1] ?? "") && /append|ADDED/i.test(flowEvidence[2] ?? "");
record("DM-A05", flowOk, "Approved normal trace is dominated by validate → capacity → append", { step_count: steps.length, evidence: flowEvidence });
const variantKinds = (approved.stages?.trace?.variants ?? []).map((item) => item.kind);
record("DM-A05", JSON.stringify(variantKinds) === JSON.stringify(["boundary", "failure"]), "Approved Trace retains boundary then failure variants", { observed: variantKinds });
record("DM-A13", !approved.stages?.trace?.method && Boolean(approved.stages?.trace?.reminder?.en && approved.stages?.trace?.reminder?.vi), "Novice projection replaces the persistent method card with one bilingual reminder");
record("DM-A13", steps.length === 3 && steps[0]?.mode === "worked" && (steps[0]?.worked_rows?.length ?? 0) === 4 && !steps[0]?.question && (steps[0]?.options?.length ?? 0) === 0, "Decision 1 is a complete worked example with no assessment field");
record("DM-A13", steps[1]?.mode === "choice" && steps[1]?.options?.length === 2 && steps[2]?.mode === "choice" && steps[2]?.options?.length === 3, "Decisions 2 and 3 expose exactly one two-option and one three-option choice");
record("DM-A13", (approved.stages?.trace?.variants ?? []).every((variant) => variant.options?.length === 2 && variant.correct_option_id && variant.retry_hint?.en && variant.retry_hint?.vi && variant.correct_feedback?.en && variant.correct_feedback?.vi), "Boundary and failure each use one bilingual two-option transfer choice");
record("DM-A13", !/(?:worksheet|line_mapping|model_answer|answer_frame|transfer_frame)/i.test(JSON.stringify(approved.stages?.trace)), "Novice Trace projection contains no worksheet, mapping or duplicate model-answer fields");
record("DM-A06", !/random_average|summarise_random_data/i.test(approvedBytes.toString("utf8")), "Approved projection excludes random_average and summarise_random_data from learner content");

const trace = JSON.parse(await readFile(path.join(ROOT, "public/paper4-v2/traces/array-append.json"), "utf8"));
const projected = Object.fromEntries(trace.scenarios.map((scenario) => {
  const operations = trace.events.filter((event) => scenario.event_ids.includes(event.event_id)).map((event) => event.delta?.execution_trace_event?.event).filter((operation) => PRIMARY_OPERATIONS.includes(operation));
  return [scenario.case_kind, operations];
}));
record("DM-A07", Object.entries(EXPECTED_COUNTS).every(([kind, count]) => projected[kind]?.length === count), "Verified source projection yields normal 3 / boundary 2 / failure 1", { projected, expected: EXPECTED_COUNTS });
record("DM-A07", JSON.stringify(projected.normal) === JSON.stringify(PRIMARY_OPERATIONS) && JSON.stringify(projected.boundary) === JSON.stringify(PRIMARY_OPERATIONS.slice(0, 2)) && JSON.stringify(projected.failure) === JSON.stringify(PRIMARY_OPERATIONS.slice(0, 1)), "Projected scenario operations preserve validate → capacity → append prefixes", { projected });

const appProjectionBytes = await optionalBytes(APP_PROJECTION_PATH);
record("DM-A10", Boolean(appProjectionBytes), "Candidate includes the data-models learner projection", { path: path.relative(ROOT, APP_PROJECTION_PATH) }, "blocker");
if (appProjectionBytes) record("DM-A10", appProjectionBytes.equals(approvedBytes), "Candidate projection is an exact byte copy of the approved projection");

const requiredFiles = [
  "app/components/paper4-visual/dataModelsAdapter.ts",
  "app/components/paper4-visual/ArrayRecordWorkbench.tsx",
  "app/components/paper4-visual/DataModelsVisualRuntime.tsx",
];
const candidateFiles = await Promise.all(requiredFiles.map(async (relative) => ({ relative, bytes: await optionalBytes(path.join(ROOT, relative)) })));
const missingFiles = candidateFiles.filter((item) => !item.bytes).map((item) => item.relative);
record("DM-A10", missingFiles.length === 0, "Candidate includes the approved data-models adapter/component boundary", { missing: missingFiles }, "blocker");

const sharedSources = await Promise.all([
  "app/components/paper4-learning/LessonLearningPage.tsx",
  "app/components/paper4-learning/SixStageLearnerJourney.tsx",
  "app/components/paper4-learning/LearnerInteractions.tsx",
  "app/components/paper4-learning/learnerProjection.ts",
  "app/components/paper4-visual/Paper4VisualRuntime.tsx",
  "app/components/paper4-visual/DataModelsVisualRuntime.tsx",
].map(async (relative) => ({ relative, source: (await optionalBytes(path.join(ROOT, relative)))?.toString("utf8") ?? "" })));
const combinedSource = sharedSources.map((item) => item.source).join("\n");
record("DM-A10", /data-models/.test(combinedSource) && /DataModels|dataModels|ArrayRecordWorkbench/.test(combinedSource), "Shared learner/runtime sources integrate data-models explicitly", {}, "blocker");
record("DM-A11", /data-learner-journey/.test(combinedSource) && /data-exit-gate/.test(combinedSource) && /data-practice-gate/.test(combinedSource) && /data-recall-gate/.test(combinedSource), "Shared journey retains stage and attempt-before-reveal QA markers");
record("DM-A13", /data-trace-reminder/.test(combinedSource) && /data-decision-kind="worked"/.test(combinedSource) && /data-decision-kind="choice"/.test(combinedSource) && /data-option-id/.test(combinedSource), "Runtime exposes stable novice reminder, worked example and choice markers");
record("DM-A13", !/data-trace-method|data-checkpoint-worksheet|data-line-state-mapping|data-model-answer/.test(combinedSource), "Runtime removes the former method, worksheet, mapping and duplicate answer layers");
record("DM-A13", /disabled=\{kind !== "normal" && !normalComplete\}/.test(combinedSource), "Runtime locks boundary and failure until all three normal decisions are complete");

if (!STATIC_ONLY && blockers.length === 0) {
  const { JSDOM } = await import("jsdom");
  for (const locale of ["en", "vi"]) {
    const route = `${ROUTE}?lang=${locale}`;
    try {
      const response = await fetch(`${BASE_URL}${route}`, { redirect: "manual" });
      const html = await response.text();
      const document = new JSDOM(html, { url: `${BASE_URL}${route}` }).window.document;
      record("DM-A12", response.status === 200, `${route}: route returns 200`, { status: response.status });
      record("DM-A12", document.documentElement.lang === locale, `${route}: html lang matches locale`, { observed: document.documentElement.lang });
      record("DM-A12", normalize(document.querySelector("h1")?.textContent).includes(approved.lesson_title?.[locale] ?? "__missing__"), `${route}: approved localized title is visible`, { observed: normalize(document.querySelector("h1")?.textContent), expected: approved.lesson_title?.[locale] });
      checkStageDom(document, route);
    } catch (error) {
      record("DM-A12", false, `${route}: live DOM audit could not complete`, { error: error instanceof Error ? error.message : String(error) });
    }
  }
}

const decision = blockers.length > 0 ? "BLOCKED" : failures.length > 0 ? "FAIL" : "PASS";
const report = {
  schema_version: "paper4-data-models-learner-release-gate-v1",
  decision,
  mode: STATIC_ONLY ? "static-only" : "static-and-live-dom",
  lesson: LESSON_SLUG,
  route: ROUTE,
  base_url: BASE_URL,
  checks_run: checks.length,
  checks_passed: checks.filter((item) => item.passed).length,
  blockers,
  failures,
  browser_gate: "NOT_RUN",
};
await mkdir(EVIDENCE_DIR, { recursive: true });
await writeFile(path.join(EVIDENCE_DIR, STATIC_ONLY ? "LEARNER_STATIC_GATE_RESULT.json" : "LEARNER_STATIC_DOM_GATE_RESULT.json"), `${JSON.stringify({ ...report, checks }, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (decision !== "PASS") process.exitCode = 1;
