import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_ROOT = path.resolve(ROOT, "..");
const PLANNING_ROOT = path.join(
  PAGE_ROOT,
  "planning/paper4/dynamic-visual-system-v1/implementation/binary-search",
);

const FILES = {
  artifact: path.join(ROOT, "content/paper4/python/pilot/binary-search/artifact.json"),
  source: path.join(ROOT, "content/paper4/python/pilot/binary-search/source.py"),
  lesson: path.join(ROOT, "app/data/paper4-v2/lessons/binary-search.json"),
  trace: path.join(ROOT, "public/paper4-v2/traces/binary-search.json"),
  spec: path.join(PLANNING_ROOT, "VISUAL_SPEC.json"),
  storyboard: path.join(PLANNING_ROOT, "STORYBOARD.md"),
  observer: path.join(PLANNING_ROOT, "OBSERVER_SCRIPT.md"),
  searchWindow: path.join(ROOT, "app/components/paper4-visual/SearchWindow.tsx"),
  adapter: path.join(ROOT, "app/components/paper4-visual/binarySearchAdapter.ts"),
  runtime: path.join(ROOT, "app/components/paper4-visual/Paper4VisualRuntime.tsx"),
  styles: path.join(ROOT, "app/components/paper4-visual/Paper4VisualRuntime.module.css"),
  reducer: path.join(ROOT, "app/components/paper4-visual/reducer.ts"),
  runtimeCheck: path.join(ROOT, "scripts/check-paper4-v2-runtime.mjs"),
};

const EXPECTED = {
  artifactId: "ac-9618-p4-2026-python.artifact.binary-search.pilot-v1",
  lessonId: "ac-9618-p4-2026-python.lesson.binary-search",
  patternId: "BINARY_SEARCH",
  visualId: "dv-binary-search-interval-pilot",
  fixtures: {
    normal: {
      fixtureId: "binary-search.normal",
      target: 31,
      values: [4, 9, 17, 23, 31, 42, 58],
      status: "FOUND",
      index: 4,
    },
    boundary: {
      fixtureId: "binary-search.boundary",
      target: 7,
      values: [],
      status: "NOT_FOUND",
      index: -1,
    },
    failure: {
      fixtureId: "binary-search.failure",
      target: 9,
      values: [4, 17, 9, 23],
      status: "UNSORTED",
      index: -1,
    },
  },
  projection: {
    normal: [
      "ac-9618-p4-2026-python.trace.binary-search.binary-search.normal.pilot-v1.event-001",
      "ac-9618-p4-2026-python.trace.binary-search.binary-search.normal.pilot-v1.event-002",
      "ac-9618-p4-2026-python.trace.binary-search.binary-search.normal.pilot-v1.event-003",
    ],
    boundary: [
      "ac-9618-p4-2026-python.trace.binary-search.binary-search.boundary.pilot-v1.event-001",
    ],
    failure: [
      "ac-9618-p4-2026-python.trace.binary-search.binary-search.failure.pilot-v1.event-001",
    ],
  },
  traceEventNames: [
    "inspect_middle",
    "inspect_middle",
    "inspect_middle",
    "search_exhausted",
    "reject_unsorted_input",
  ],
};

const failures = [];
const passes = [];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function record(condition, code, message, detail = undefined) {
  if (condition) {
    passes.push(code);
    return;
  }
  failures.push({ code, message, ...(detail === undefined ? {} : { detail }) });
}

function exact(value, expected, code, label) {
  record(same(value, expected), code, `${label} differs from the locked Binary Search pilot contract.`, {
    expected,
    actual: value,
  });
}

async function readJson(filename, code) {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    failures.push({ code, message: `Cannot read valid JSON: ${path.relative(ROOT, filename)}`, detail: error.message });
    return null;
  }
}

async function readText(filename, code) {
  try {
    return await readFile(filename, "utf8");
  } catch (error) {
    failures.push({ code, message: `Required file is missing or unreadable: ${path.relative(ROOT, filename)}`, detail: error.message });
    return null;
  }
}

async function fileExists(filename) {
  try {
    await access(filename);
    return true;
  } catch {
    return false;
  }
}

function bytesFromLines(lines) {
  if (!Array.isArray(lines)) return null;
  return Buffer.from(lines.map((line) => line.text).join("\n"), "utf8");
}

function validateLineProjection(spec, trace) {
  const traceEvents = new Map(trace.events.map((event) => [event.event_id, event]));
  const artifactLineIds = new Set(trace.python_artifact.lines.map((line) => line.line_id));
  const semanticTargets = new Set(spec.scene_contract.semantic_targets);
  const visualEvents = spec.scene_contract.events;
  const expectedIds = Object.values(EXPECTED.projection).flat();

  exact(visualEvents.map((event) => event.trace_event_id), expectedIds, "CORE_EVENT_ORDER", "Iterative core event order");
  exact(visualEvents.map((event) => event.sequence), [0, 1, 2, 3, 4], "CORE_EVENT_SEQUENCE", "Visual event sequence");
  exact(visualEvents.map((event) => event.event_type), ["compare", "compare", "compare", "branch", "reject"], "CORE_EVENT_TYPES", "Visual event types");

  visualEvents.forEach((event, index) => {
    const traceEvent = traceEvents.get(event.trace_event_id);
    record(Boolean(traceEvent), "TRACE_BINDING_RESOLVES", `${event.event_id}: trace event does not resolve.`, event.trace_event_id);
    record(event.active_line_ids.length <= 3, "MAX_THREE_ACTIVE_LINES", `${event.event_id}: more than three active code lines.`, event.active_line_ids);
    record(event.visual_targets.length <= 3, "MAX_THREE_VISUAL_TARGETS", `${event.event_id}: more than three active visual targets.`, event.visual_targets);
    record(event.active_line_ids.every((lineId) => artifactLineIds.has(lineId)), "ACTIVE_LINES_EXIST", `${event.event_id}: one or more curated line IDs do not exist.`, event.active_line_ids);
    record(event.visual_targets.every((target) => semanticTargets.has(target)), "VISUAL_TARGETS_DECLARED", `${event.event_id}: one or more visual targets are not declared.`, event.visual_targets);
    record(new Set(event.active_line_ids).size === event.active_line_ids.length, "ACTIVE_LINES_UNIQUE", `${event.event_id}: duplicate active line ID.`);
    record(new Set(event.visual_targets).size === event.visual_targets.length, "VISUAL_TARGETS_UNIQUE", `${event.event_id}: duplicate visual target.`);
    record(!event.active_line_ids.some((lineId) => /^binary-search\.v1\.L(?:4[89]|5\d|6[01])$/.test(lineId)), "NO_RECURSIVE_CORE_LINES", `${event.event_id}: recursive source line leaked into iterative core.`, event.active_line_ids);
    record(!String(traceEvent?.delta?.execution_trace_event?.event ?? "").startsWith("recursive_"), "NO_RECURSIVE_CORE_EVENTS", `${event.event_id}: recursive trace event leaked into iterative core.`);
    if (traceEvent) {
      record(event.active_line_ids.every((lineId) => traceEvent.active_line_ids.includes(lineId)), "CURATED_LINES_TRACE_BACKED", `${event.event_id}: curated line is not present in its canonical trace event.`, {
        curated: event.active_line_ids,
        trace: traceEvent.active_line_ids,
      });
      exact(traceEvent.delta?.execution_trace_event?.event, EXPECTED.traceEventNames[index], "TRACE_EVENT_NAME", `${event.event_id} execution event name`);
    }
  });

  record(spec.scene_contract.visible_state_fields.length <= 5, "MAX_FIVE_VISIBLE_FIELDS", "More than five visible state fields.", spec.scene_contract.visible_state_fields);
  exact(spec.component_families, ["VC-01", "VC-06", "VC-16"], "COMPONENT_FAMILIES", "Component-family composition");
}

function validateLocalizedCopy(spec, storyboard, observer) {
  const localized = [
    ["learning_contract.primary_question", spec.learning_contract.primary_question],
    ["learning_contract.invariant_or_rule", spec.learning_contract.invariant_or_rule],
    ...spec.scene_contract.events.map((event) => [`events.${event.event_id}.narration`, event.narration]),
  ];
  for (const [label, value] of localized) {
    record(Boolean(value && typeof value.en === "string" && value.en.trim()), "EN_COPY_PRESENT", `${label}: required English canonical copy is missing.`);
    record(Boolean(value && typeof value.vi === "string" && value.vi.trim()), "VI_COPY_PRESENT", `${label}: required Vietnamese reference copy is missing.`);
    exact(Object.keys(value ?? {}).sort(), ["en", "vi"], "LOCALE_KEYS_EXACT", `${label} locale keys`);
  }

  record(spec.locale_contract.canonical === "en", "EN_CANONICAL", "English must remain canonical.");
  record(spec.locale_contract.reference === "vi", "VI_REFERENCE", "Vietnamese must remain the reference locale.");
  record(spec.locale_contract.same_event_topology === true, "SAME_EVENT_TOPOLOGY", "EN/VI must use the same event topology.");
  record(spec.locale_contract.code_untranslated === true, "CODE_UNTRANSLATED", "Python code must remain untranslated.");
  record(new Set(spec.scene_contract.events.map((event) => event.learning_question_id)).size === spec.scene_contract.events.length, "QUESTION_IDS_UNIQUE", "Each core event needs its own learning-question ID.");
  record(new Set(spec.scene_contract.events.map((event) => event.focus_target)).size === spec.scene_contract.events.length, "FOCUS_TARGETS_UNIQUE", "Each core event needs its own focus target.");

  const storyboardMarkers = [
    "iterative Binary Search is the assessed core journey",
    "Recursive Binary Search is an optional extension unlocked only after the learner submits independent practice",
    "values=[4,9,17,23,31,42,58]",
    "values=[]",
    "values=[4,17,9,23]",
    "one screen",
    "Guided version",
    "Faded version",
    "Independent version",
  ];
  for (const marker of storyboardMarkers) {
    record(storyboard.includes(marker), "STORYBOARD_MARKER", `STORYBOARD.md is missing required marker: ${marker}`);
  }

  const observerMarkers = [
    "Task O6 — Complete the normal path",
    "Task O7 — Explain the boundary path",
    "low=0`, `high=-1",
    "Task O8 — Explain the failure path",
    "17 > 9",
    "Task O11 — Independent core performance",
    "optional recursive extension",
    "EN/VI topology parity run",
  ];
  for (const marker of observerMarkers) {
    record(observer.includes(marker), "OBSERVER_MARKER", `OBSERVER_SCRIPT.md is missing current-path marker: ${marker}`);
  }
}

function validateRuntimeMarkers(searchWindow, adapter, runtime, styles, reducer, runtimeCheck) {
  const requiredSearchWindowMarkers = [
    'data-scene="binary-search-window"',
    'data-core-projection="iterative"',
    'id="visual.dsa.binary-search-interval"',
    'id="visual.binary-search.state"',
    'id="visual.dsa.growth-counter"',
    "BinarySearchSceneModel",
    "headingId",
    "locale",
  ];
  for (const marker of requiredSearchWindowMarkers) {
    record(searchWindow.includes(marker), "SEARCH_WINDOW_MARKER_MISSING", `SearchWindow.tsx is missing integration marker: ${marker}`);
  }

  const requiredAdapterMarkers = [
    "projectLearningEvents",
    "adaptBinarySearchEvent",
    'kind: "binary-search-window"',
    '"predict"',
    '"revealed"',
    "focusLineIds",
    "correctKey",
    "choices",
  ];
  for (const marker of requiredAdapterMarkers) {
    record(adapter.includes(marker), "BINARY_SEARCH_ADAPTER_MARKER_MISSING", `binarySearchAdapter.ts is missing projection marker: ${marker}`);
  }
  for (const marker of [
    "BINARY_SEARCH_PROGRESS_KEY",
    "createBinarySearchStoredProgress",
    "restoreBinarySearchProgress",
    "paper4-binary-search-progress-v1",
    "artifactVersion",
    "codeSha256",
  ]) {
    record(adapter.includes(marker), "BINARY_SEARCH_PROGRESS_CONTRACT_MISSING", `binarySearchAdapter.ts is missing persisted-progress contract marker: ${marker}`);
  }
  for (const marker of [
    "visual.binary-search.inspect_middle",
    "visual.binary-search.search_exhausted",
    "visual.binary-search.reject_unsorted_input",
  ]) {
    const dynamicTargetContract = SearchWindowTargetContract(searchWindow, adapter, marker);
    record(dynamicTargetContract, "SEARCH_WINDOW_EVENT_TARGET_MISSING", `SearchWindow projection cannot produce event target: ${marker}`);
  }

  const requiredRuntimeMarkers = [
    "SearchWindow",
    "projectLearningEvents",
    "adaptBinarySearchEvent",
    '"BINARY_SEARCH"',
    "data-pattern-id",
  ];
  for (const marker of requiredRuntimeMarkers) {
    record(runtime.includes(marker), "SEARCH_WINDOW_INTEGRATION_MISSING", `Paper4VisualRuntime.tsx is missing SearchWindow integration marker: ${marker}`);
  }
  record(runtime.includes('data-layout="stacked"'), "BINARY_SEARCH_STACKED_LAYOUT_MISSING", "Paper4VisualRuntime.tsx does not mark the narrow-container-safe stacked Binary Search layout.");
  for (const marker of [
    "window.sessionStorage.getItem(BINARY_SEARCH_PROGRESS_KEY)",
    "window.sessionStorage.setItem(BINARY_SEARCH_PROGRESS_KEY",
    "restoreBinarySearchProgress",
    'type: "RESTORE_PROGRESS"',
  ]) {
    record(runtime.includes(marker), "BINARY_SEARCH_PROGRESS_INTEGRATION_MISSING", `Paper4VisualRuntime.tsx is missing persisted-progress integration marker: ${marker}`);
  }
  record(reducer.includes('case "RESTORE_PROGRESS"'), "BINARY_SEARCH_PROGRESS_REDUCER_MISSING", "reducer.ts does not restore validated Binary Search progress.");
  for (const marker of [
    "BINARY_SEARCH_PROGRESS_PROMPT_RESTORE",
    "BINARY_SEARCH_PROGRESS_REVEALED_RESTORE",
    "BINARY_SEARCH_PROGRESS_INVALID_ACCEPTED",
  ]) {
    record(runtimeCheck.includes(marker), "BINARY_SEARCH_PROGRESS_RUNTIME_CHECK_MISSING", `check-paper4-v2-runtime.mjs is missing restore test marker: ${marker}`);
  }
  record(/locale=\{(?:state\.)?locale\}/.test(runtime), "SEARCH_WINDOW_LOCALE_BINDING", "Paper4VisualRuntime.tsx does not visibly bind the active locale into the Binary Search component.");
  record(/\.(?:searchScene|binaryLayout|searchArray)\b/.test(styles), "SEARCH_WINDOW_STYLE_MARKER_MISSING", "Paper4VisualRuntime.module.css has no dedicated SearchWindow style marker.");
  record(/\.binaryLayout\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*?grid-template-areas:\s*"scene"\s*"code"\s*"practice"\s*"controls";/m.test(styles), "BINARY_SEARCH_STACKED_CSS_MISSING", "Binary Search visual and code panels are not permanently stacked for constrained app content containers.");
  record(/\.searchFacts\s*\{[\s\S]*?repeat\(auto-fit,\s*minmax\(min\(100%,\s*7\.25rem\),\s*1fr\)\)/m.test(styles), "BINARY_SEARCH_FACT_REFLOW_MISSING", "Binary Search state facts do not reflow intrinsically at narrow content widths.");
  record(/\.arrayViewport\s*\{[\s\S]*?overflow-x:\s*auto;/m.test(styles), "BINARY_SEARCH_LOCAL_ARRAY_SCROLL_MISSING", "Binary Search array scrolling is not locally contained.");
  record(/\.predictionChoices\s+input\[type="radio"\]\s*\{[\s\S]*?inline-size:\s*1\.1rem;[\s\S]*?min-height:\s*1\.1rem;/m.test(styles), "BINARY_SEARCH_RADIO_SIZE_OVERRIDE_MISSING", "Binary Search prediction radios can inherit the full-width generic input rule and separate from their labels.");
  record(/\.predictionChoices\s*\{[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*9\.5rem\),\s*1fr\)\);/m.test(styles), "BINARY_SEARCH_PREDICTION_CARD_GRID_MISSING", "Binary Search prediction options are not arranged as compact responsive cards.");
}

function SearchWindowTargetContract(searchWindow, adapter, marker) {
  if (searchWindow.includes(marker) || adapter.includes(marker)) return true;
  const eventName = marker.replace("visual.binary-search.", "");
  return searchWindow.includes("model.eventSpecificTarget")
    && adapter.includes("`visual.binary-search.${name}`")
    && adapter.includes(`"${eventName}"`);
}

async function main() {
  const [artifact, lesson, trace, spec, storyboard, observer] = await Promise.all([
    readJson(FILES.artifact, "ARTIFACT_JSON_UNREADABLE"),
    readJson(FILES.lesson, "LESSON_JSON_UNREADABLE"),
    readJson(FILES.trace, "TRACE_JSON_UNREADABLE"),
    readJson(FILES.spec, "VISUAL_SPEC_UNREADABLE"),
    readText(FILES.storyboard, "STORYBOARD_UNREADABLE"),
    readText(FILES.observer, "OBSERVER_UNREADABLE"),
  ]);
  if (!artifact || !lesson || !trace || !spec || storyboard === null || observer === null) {
    throw new Error("Required Binary Search pilot inputs are unreadable; see failures above.");
  }

  const sourceBytes = await readFile(FILES.source);
  const sourceHash = sha256(sourceBytes);
  const traceBytes = await readFile(FILES.trace);
  const traceHash = sha256(traceBytes);
  const artifactBytes = bytesFromLines(artifact.lines);
  const displayBytes = bytesFromLines(lesson.python?.lines);
  const traceDisplayBytes = bytesFromLines(trace.python_artifact?.lines);

  exact(artifact.python_artifact_id, EXPECTED.artifactId, "ARTIFACT_ID", "Python artifact ID");
  exact(lesson.identity?.lesson_id, EXPECTED.lessonId, "LESSON_ID", "Lesson ID");
  exact(trace.pattern_id, EXPECTED.patternId, "TRACE_PATTERN_ID", "Trace pattern ID");
  exact(spec.visual_id, EXPECTED.visualId, "VISUAL_ID", "Visual ID");

  record(sourceBytes.equals(artifactBytes ?? Buffer.alloc(0)), "SOURCE_EQUALS_ARTIFACT_LINES", "Executed source bytes differ from artifact display lines.");
  record(sourceBytes.equals(displayBytes ?? Buffer.alloc(0)), "SOURCE_EQUALS_LESSON_DISPLAY", "Executed source bytes differ from lesson-displayed Python lines.");
  record(sourceBytes.equals(traceDisplayBytes ?? Buffer.alloc(0)), "SOURCE_EQUALS_TRACE_DISPLAY", "Executed source bytes differ from trace-embedded Python lines.");
  for (const [label, value] of [
    ["artifact.code_sha256", artifact.code_sha256],
    ["lesson.python.code_sha256", lesson.python?.code_sha256],
    ["trace.owner.code_sha256", trace.owner?.code_sha256],
    ["trace.python_artifact.code_sha256", trace.python_artifact?.code_sha256],
    ["visual_spec.code_shown_sha256", spec.trace_contract?.code_shown_sha256],
    ["visual_spec.code_executed_sha256", spec.trace_contract?.code_executed_sha256],
  ]) {
    exact(value, sourceHash, "CODE_HASH_IDENTITY", label);
  }
  exact(spec.trace_contract?.trace_sha256, traceHash, "TRACE_HASH_IDENTITY", "visual_spec.trace_sha256");
  record(lesson.visual?.owned_patterns?.some((item) => item.pattern_id === EXPECTED.patternId && item.trace_url?.endsWith(`?v=${sourceHash.slice(0, 16)}`)), "VERSIONED_TRACE_URL", "Lesson trace URL is not versioned with the current source hash prefix.");

  const traceScenarios = new Map(trace.scenarios.map((scenario) => [scenario.case_kind, scenario]));
  const specScenarios = new Map(spec.trace_contract.scenarios.map((scenario) => [scenario.case_kind, scenario]));
  exact([...specScenarios.keys()].sort(), ["boundary", "failure", "normal"], "THREE_CASE_KINDS", "Visual spec case kinds");
  for (const caseKind of ["normal", "boundary", "failure"]) {
    const expected = EXPECTED.fixtures[caseKind];
    const artifactFixture = artifact.fixtures.find((fixture) => fixture.case_kind === caseKind);
    const output = artifact.expected_outputs.find((item) => item.fixture_ref === expected.fixtureId);
    const traceScenario = traceScenarios.get(caseKind);
    const specScenario = specScenarios.get(caseKind);
    exact(artifactFixture?.fixture_id, expected.fixtureId, "FIXTURE_ID", `${caseKind} fixture ID`);
    exact(artifactFixture?.input, { target: expected.target, values: expected.values }, "FIXTURE_INPUT", `${caseKind} fixture input`);
    exact(output?.value?.status, expected.status, "FIXTURE_STATUS", `${caseKind} expected status`);
    exact(output?.value?.index, expected.index, "FIXTURE_INDEX", `${caseKind} expected index`);
    exact(traceScenario?.fixture_ref, expected.fixtureId, "TRACE_FIXTURE_REF", `${caseKind} trace fixture reference`);
    exact(specScenario?.scenario_id, traceScenario?.scenario_id, "SCENARIO_IDENTITY", `${caseKind} scenario ID`);
    exact(specScenario?.trace_id, traceScenario?.trace_id, "TRACE_IDENTITY", `${caseKind} trace ID`);
    exact(specScenario?.event_ids, EXPECTED.projection[caseKind], "ITERATIVE_PROJECTION", `${caseKind} curated event projection`);
    record(EXPECTED.projection[caseKind].every((eventId, index) => traceScenario?.event_ids[index] === eventId), "TRACE_PROJECTION_PREFIX", `${caseKind} trace no longer begins with the curated iterative projection.`, traceScenario?.event_ids);
  }

  validateLineProjection(spec, trace);
  validateLocalizedCopy(spec, storyboard, observer);

  const runtimeFilesExist = await Promise.all([
    fileExists(FILES.searchWindow),
    fileExists(FILES.adapter),
    fileExists(FILES.runtime),
    fileExists(FILES.styles),
    fileExists(FILES.reducer),
    fileExists(FILES.runtimeCheck),
  ]);
  const runtimeLabels = ["SearchWindow.tsx", "binarySearchAdapter.ts", "Paper4VisualRuntime.tsx", "Paper4VisualRuntime.module.css", "reducer.ts", "check-paper4-v2-runtime.mjs"];
  runtimeFilesExist.forEach((exists, index) => {
    record(exists, "SEARCH_WINDOW_COMPONENT_MISSING", `${runtimeLabels[index]} is missing; Binary Search SearchWindow integration is incomplete.`);
  });
  if (runtimeFilesExist.every(Boolean)) {
    const [searchWindow, adapter, runtime, styles, reducer, runtimeCheck] = await Promise.all([
      readFile(FILES.searchWindow, "utf8"),
      readFile(FILES.adapter, "utf8"),
      readFile(FILES.runtime, "utf8"),
      readFile(FILES.styles, "utf8"),
      readFile(FILES.reducer, "utf8"),
      readFile(FILES.runtimeCheck, "utf8"),
    ]);
    validateRuntimeMarkers(searchWindow, adapter, runtime, styles, reducer, runtimeCheck);
  }

  if (failures.length > 0) {
    console.error(JSON.stringify({
      status: "FAIL",
      checker: "check-dv-binary-search-pilot",
      mode: "READ_ONLY",
      source_sha256: sourceHash,
      trace_sha256: traceHash,
      passed_checks: passes.length,
      failed_checks: failures.length,
      failures,
    }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({
    status: "PASS",
    checker: "check-dv-binary-search-pilot",
    mode: "READ_ONLY",
    source_sha256: sourceHash,
    trace_sha256: traceHash,
    scenarios: 3,
    iterative_core_events: 5,
    max_active_lines: Math.max(...spec.scene_contract.events.map((event) => event.active_line_ids.length)),
    max_visual_targets: Math.max(...spec.scene_contract.events.map((event) => event.visual_targets.length)),
    passed_checks: passes.length,
  }, null, 2));
}

main().catch((error) => {
  failures.push({ code: "CHECKER_EXCEPTION", message: error.message, stack: error.stack });
  console.error(JSON.stringify({
    status: "FAIL",
    checker: "check-dv-binary-search-pilot",
    mode: "READ_ONLY",
    failed_checks: failures.length,
    failures,
  }, null, 2));
  process.exitCode = 1;
});
