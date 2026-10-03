import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const STATIC_ONLY = process.argv.includes("--static-only");
const LESSON_SLUG = "binary-search";
const EXPECTED_STAGES = [
  "recognise",
  "understand",
  "trace",
  "practise",
  "protectMarks",
  "recallAndContinue",
];

const failures = [];
const checks = [];

function record(gate, passed, message, evidence = {}) {
  checks.push({ gate, passed, message, evidence });
  if (!passed) failures.push({ gate, message, evidence });
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"]);

function hiddenByContract(element, boundary) {
  let current = element;
  while (current && current !== boundary.parentElement) {
    if (SKIP_TAGS.has(current.tagName)) return true;
    if (current.hasAttribute("hidden") || current.getAttribute("aria-hidden") === "true") return true;
    const details = current.closest("details:not([open])");
    if (details && !current.closest("summary")) return true;
    current = current.parentElement;
  }
  return false;
}

function defaultSurface(root) {
  const textParts = [];
  const accessibleParts = [];
  const walker = root.ownerDocument.createTreeWalker(root, 1 | 4);
  let node = walker.currentNode;
  while (node) {
    const element = node.nodeType === 1 ? node : node.parentElement;
    if (element && !hiddenByContract(element, root)) {
      if (node.nodeType === 4 || node.nodeType === 3) {
        const value = normalize(node.nodeValue);
        if (value) textParts.push(value);
      } else if (node.nodeType === 1) {
        for (const attribute of ["aria-label", "title", "alt", "placeholder"]) {
          const value = normalize(node.getAttribute(attribute));
          if (value) accessibleParts.push(value);
        }
      }
    }
    node = walker.nextNode();
  }
  return {
    text: normalize(textParts.join(" ")),
    accessibleText: normalize(accessibleParts.join(" ")),
    combined: normalize([...textParts, ...accessibleParts].join(" ")),
  };
}

const bannedPatterns = [
  ["internal package prefix", /\bac-9618-/i],
  ["canonical section id", /paper4\.section\./i],
  ["pattern id", /\bBINARY_SEARCH\b/],
  ["artifact version", /\bpilot-v1\b/i],
  ["mapping state", /\bLEAD_MAPPED\b/],
  ["fixture id", /\bbinary-search\.(?:normal|boundary|failure)\b/i],
  ["schema id key", /\b(?:fixture_id|pattern_id|scenario_id|event_id|knowledge_unit_id|section_id|source_id)\b/i],
  ["marking internals", /\b(?:method_step(?:_id|_refs?)?|marking_atom(?:_id|_count|s)?|official_marks|disclosure_contract)\b/i],
  ["hash label", /\bSHA-?256\b/i],
  ["hex digest", /\b[a-f0-9]{64}\b/i],
  ["run reference", /\b(?:author_run_ref|independent_rerun_ref|execution_log_sha256)\b/i],
  ["authority enum", /\b(?:CITATION_ONLY|PRIMARY_EXAM_BOARD|ALGOCOR[E]?_AUTHORED|INTERNAL_CITATION)\b/i],
];

function exposedElements(root, selector) {
  return [...root.querySelectorAll(selector)].filter((element) => !hiddenByContract(element, root));
}

function parseableJsonBlocks(root) {
  return exposedElements(root, "pre, code").flatMap((element) => {
    const text = element.textContent?.trim() ?? "";
    if (!(text.startsWith("{") && text.endsWith("}")) && !(text.startsWith("[") && text.endsWith("]"))) return [];
    try {
      JSON.parse(text);
      return [{ tag: element.tagName.toLowerCase(), sample: text.slice(0, 160) }];
    } catch {
      return [];
    }
  });
}

function checkStageContract(document, route) {
  const root = document.querySelector('[data-learner-journey="six-stage"]');
  record("LG-A02", Boolean(root), `${route}: six-stage journey root exists`, { selector: '[data-learner-journey="six-stage"]' });
  if (!root) return null;

  const stages = [...root.querySelectorAll(":scope [data-learner-stage]")];
  const values = stages.map((stage) => stage.getAttribute("data-learner-stage"));
  record("LG-A02", JSON.stringify(values) === JSON.stringify(EXPECTED_STAGES), `${route}: six stages are unique and ordered`, { expected: EXPECTED_STAGES, observed: values });

  const badHeadings = stages.flatMap((stage) => {
    const labelledBy = stage.getAttribute("aria-labelledby");
    const heading = labelledBy ? document.getElementById(labelledBy) : null;
    return labelledBy && heading && /^H[1-6]$/.test(heading.tagName) ? [] : [stage.getAttribute("data-learner-stage")];
  });
  record("LG-A02", badHeadings.length === 0, `${route}: every stage has a heading through aria-labelledby`, { bad_stages: badHeadings });

  const currentStages = stages.filter((stage) => stage.getAttribute("data-stage-state") === "current");
  const currentNav = root.querySelector('[aria-current="step"], [aria-current="page"]');
  record("LG-A02", currentStages.length === 1 && Boolean(currentNav), `${route}: exactly one current stage is exposed in stage navigation`, { current_stage_count: currentStages.length, current_nav: normalize(currentNav?.textContent) });

  const expandedNonCurrent = stages.filter((stage) => {
    if (stage.getAttribute("data-stage-state") === "current") return false;
    return !stage.hasAttribute("hidden") && stage.getAttribute("aria-hidden") !== "true" && stage.querySelector(":scope > [data-stage-content]:not([hidden])");
  });
  record("LG-A02", expandedNonCurrent.length === 0, `${route}: non-current stages are collapsed by default`, { expanded: expandedNonCurrent.map((stage) => stage.getAttribute("data-learner-stage")) });
  return root;
}

function checkLearnerSurface(root, route) {
  const surface = defaultSurface(root);
  const tokenMatches = bannedPatterns.flatMap(([label, pattern]) => {
    const match = surface.combined.match(pattern);
    return match ? [{ label, token: match[0] }] : [];
  });
  record("LG-A03", tokenMatches.length === 0, `${route}: default learner surface contains no audit-only tokens`, { matches: tokenMatches });

  const jsonBlocks = parseableJsonBlocks(root);
  const answerLabels = exposedElements(root, "figcaption, h1, h2, h3, h4, dt, strong, summary")
    .map((element) => normalize(element.textContent))
    .filter((text) => /^(?:Expected output|Kết quả mong đợi|Đầu ra dự kiến|Expected trace|Trace dự kiến)$/i.test(text));
  record("LG-A04", jsonBlocks.length === 0 && answerLabels.length === 0, `${route}: no default raw JSON or expected trace/output`, { json_blocks: jsonBlocks, answer_labels: answerLabels });

  const traceStage = root.querySelector('[data-learner-stage="trace"]');
  if (traceStage && !hiddenByContract(traceStage, root)) {
    const questionCount = exposedElements(traceStage, '[data-active-learning-question], [data-storyboard-target]').length;
    const primaryPanels = exposedElements(traceStage, '[data-primary-panel="true"], [data-scene], [data-panel="code"]').length;
    const stateFields = exposedElements(traceStage, "dl > div").length;
    const controls = exposedElements(traceStage, 'button:not([disabled]), input:not([disabled]), select:not([disabled])').length;
    record("LG-A07", questionCount === 1, `${route}: Trace exposes exactly one active learning question`, { question_count: questionCount });
    record("LG-A07", primaryPanels <= 2 && stateFields <= 5 && controls <= 4, `${route}: Trace stays within default density budget`, { primary_panels: primaryPanels, state_fields: stateFields, enabled_controls: controls });
  }

  for (const codeBlock of exposedElements(root, '[data-python-artifact-id] pre, [data-code-excerpt]')) {
    const lines = [...codeBlock.querySelectorAll('[data-line-id]')];
    const active = lines.filter((line) => line.getAttribute("aria-current") === "step");
    record("LG-A06", lines.length >= 4 && lines.length <= 8 && active.length <= 3, `${route}: exposed Python chunk respects 4–8/≤3 budget`, { lines: lines.length, active_lines: active.length });
  }
}

async function checkStaticContract() {
  const appProjectionBytes = await readFile(path.join(ROOT, "app/data/paper4-v2/learner-projections/binary-search.json"));
  const approvedProjectionBytes = await readFile(path.join(ROOT, "../planning/paper4/student-friendly-audit/BINARY_SEARCH_LEARNER_PROJECTION.json"));
  const appProjection = JSON.parse(appProjectionBytes.toString("utf8"));
  const approvedProjection = JSON.parse(approvedProjectionBytes.toString("utf8"));
  const stripTraceabilityMetadata = (value) => {
    if (Array.isArray(value)) return value.map(stripTraceabilityMetadata);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
      .filter(([key]) => key !== "assessment_requirement_ids")
      .map(([key, child]) => [key, stripTraceabilityMetadata(child)]));
    return value;
  };
  const files = {
    lesson: await readFile(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"), "utf8"),
    journey: await readFile(path.join(ROOT, "app/components/paper4-learning/SixStageLearnerJourney.tsx"), "utf8"),
    canonical: await readFile(path.join(ROOT, "app/components/paper4-learning/CanonicalLessonJourney.tsx"), "utf8"),
    shell: await readFile(path.join(ROOT, "app/components/paper4-learning/Paper4LessonShell.tsx"), "utf8"),
    interactions: await readFile(path.join(ROOT, "app/components/paper4-learning/LearnerInteractions.tsx"), "utf8"),
    projection: await readFile(path.join(ROOT, "app/components/paper4-learning/learnerProjection.ts"), "utf8"),
    runtime: await readFile(path.join(ROOT, "app/components/paper4-visual/Paper4VisualRuntime.tsx"), "utf8"),
    search: await readFile(path.join(ROOT, "app/components/paper4-visual/SearchWindow.tsx"), "utf8"),
    css: await readFile(path.join(ROOT, "app/components/paper4-learning/LessonLearningPage.module.css"), "utf8"),
  };
  const learnerSource = `${files.journey}\n${files.interactions}\n${files.shell}`;
  record("LG-A02", /data-learner-journey/.test(files.shell) && /data-learner-stage/.test(files.journey), "Source exposes stable six-stage QA markers");
  record("LG-A02", JSON.stringify(stripTraceabilityMetadata(appProjection)) === JSON.stringify(stripTraceabilityMetadata(approvedProjection)), "App preserves the teacher-approved Binary Search learner content and topology; machine-only requirement links may be added");
  record("LG-A02", JSON.stringify(approvedProjection.stage_order) === JSON.stringify(EXPECTED_STAGES), "Approved projection has the locked six-stage topology", { observed: approvedProjection.stage_order });
  record("LG-A02", approvedProjection.stages?.understand?.python_recipe?.lines?.length === 10 && approvedProjection.stages?.practise?.items?.length === 3 && approvedProjection.stages?.protectMarks?.mistakes?.length === 5 && approvedProjection.stages?.recallAndContinue?.recall_items?.length === 5, "Approved learner projection retains signed content budgets");
  record("LG-A03", !/(?:code_sha256|execution_log_sha256|official_marks|marking_atom_count|author_run_ref|independent_rerun_ref)/.test(learnerSource), "Six-stage learner components do not import audit-only metadata fields");
  record("LG-A03", /CanonicalLessonPage/.test(files.lesson) && /CanonicalLessonJourney/.test(files.lesson) && /CanonicalKnowledgeReference/.test(files.journey) && !/blocked-pending-teacher-projection/.test(files.lesson) && !/lesson\.sections\.map/.test(files.lesson), "Every lesson has a learner-ready canonical DTO adapter; no pending or legacy raw-section fallback remains");
  record("LG-A03", /assertLearnerProjectionSafe/.test(files.projection) && /forbiddenLearnerTokens/.test(files.projection), "Shared learner projection sanitizer rejects governance tokens");
  record("LG-A04", !/(?:expected_outputs|disclosure_contract|function\s+JsonBlock\b)/.test(learnerSource), "Six-stage learner components do not serialize canonical expected output or raw contracts");
  record("LG-A05", /data-phase=\{model\.phase\}/.test(files.search) && /disabled=\{!nextEvent \|\| state\.stepPhase === "predict"\}/.test(files.runtime), "Binary Search source keeps phase marker and blocks Next during predict");
  const binarySearchShortCode = /maxVisibleLines=\{8\}/.test(files.runtime)
    && /activeLineIds=\{learnerMode\s*\?\s*sceneModel\.focusLineIds\.slice\(0,\s*3\)\s*:\s*sceneModel\.focusLineIds\}/.test(files.runtime)
    && /visibleLineIds=\{learnerMode\s*\?\s*sceneModel\.focusLineIds\.slice\(0,\s*8\)\s*:\s*sceneModel\.focusLineIds\}/.test(files.runtime);
  record("LG-A06", binarySearchShortCode, "Binary Search learner reveal limits the excerpt to eight lines and the active focus to three lines");
  const hasSmallScreenRule = /@media[^\{]*(?:max-width\s*:\s*(?:3[2-9]\d|[45]\d\d|5\d\d|6[0-4]\d)px)/i.test(files.css);
  const hasReflow = /grid-template-columns\s*:\s*1fr/i.test(files.css);
  record("LG-A10", hasSmallScreenRule && hasReflow, "Learner stylesheet includes small-screen single-column reflow hooks", { has_small_screen_rule: hasSmallScreenRule, has_single_column_reflow: hasReflow });
}

await checkStaticContract();

if (!STATIC_ONLY) {
  const { JSDOM } = await import("jsdom");
  const approvedProjection = JSON.parse(await readFile(path.join(ROOT, "app/data/paper4-v2/learner-projections/binary-search.json"), "utf8"));
  for (const locale of ["en", "vi"]) {
    const route = `/paper-4/lessons/${LESSON_SLUG}?lang=${locale}`;
    try {
      const response = await fetch(`${BASE_URL}${route}`, { redirect: "manual" });
      const html = await response.text();
      const document = new JSDOM(html, { url: `${BASE_URL}${route}` }).window.document;
      record("LG-A01", response.status === 200, `${route}: route returns 200`, { status: response.status });
      record("LG-A01", document.documentElement.lang === locale, `${route}: html language matches locale`, { observed: document.documentElement.lang });
      record("LG-A01", normalize(document.querySelector("h1")?.textContent).includes(approvedProjection.lesson_title?.[locale] ?? "__missing__"), `${route}: approved localized lesson title is present`, { title: normalize(document.querySelector("h1")?.textContent), expected: approvedProjection.lesson_title?.[locale] });
      const root = checkStageContract(document, route);
      if (root) checkLearnerSurface(root, route);
    } catch (error) {
      record("LG-A01", false, `${route}: route could not be audited`, { error: error instanceof Error ? error.message : String(error) });
    }
  }
}

const topologyByLocale = checks
  .filter((check) => check.gate === "LG-A02" && check.message.includes("six stages are unique and ordered"))
  .map((check) => check.evidence.observed);
if (!STATIC_ONLY && topologyByLocale.length === 2) {
  record("LG-A08", JSON.stringify(topologyByLocale[0]) === JSON.stringify(topologyByLocale[1]), "EN and VI expose the same six-stage topology", { variants: topologyByLocale.length });
}

const report = {
  schema_version: "paper4-learner-release-gate-v1",
  decision: failures.length === 0 ? "PASS" : "FAIL",
  mode: STATIC_ONLY ? "static-only" : "static-and-live-dom",
  base_url: BASE_URL,
  route: `/paper-4/lessons/${LESSON_SLUG}`,
  checks_run: checks.length,
  checks_passed: checks.filter((check) => check.passed).length,
  failures,
  browser_gates: ["LG-B01", "LG-B02", "LG-B03", "LG-B04", "LG-B05", "LG-B06", "LG-B07", "LG-B08"].map((gate) => ({ gate, status: "NOT_RUN" })),
};

console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;
