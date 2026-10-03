import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const appRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const importTypescript = async (file) => {
  const source = await readFile(file, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
};

const traceApi = await importTypescript(path.join(appRoot, "app/components/paper4-visual/traceLoader.ts"));
const reducerApi = await importTypescript(path.join(appRoot, "app/components/paper4-visual/reducer.ts"));
const binarySearchApi = await importTypescript(path.join(appRoot, "app/components/paper4-visual/binarySearchAdapter.ts"));
const manifest = await json(path.join(appRoot, "app/data/paper4-v2/course-manifest.json"));
const lessonBySlug = new Map();
for (const lessonMeta of manifest.lessons) {
  lessonBySlug.set(lessonMeta.slug, await json(path.join(appRoot, "app/data/paper4-v2/lessons", `${lessonMeta.slug}.json`)));
}

const failures = [];
const fail = (code, detail) => failures.push({ code, detail });
let patternCount = 0;
let scenarioCount = 0;
let eventCount = 0;
let lineBindingCount = 0;
let localeBindingCount = 0;
let distinctScenarioSequenceCount = 0;

for (const metadata of manifest.patterns) {
  patternCount += 1;
  const lesson = lessonBySlug.get(metadata.owner_lesson_slug);
  if (!lesson) { fail("LESSON_MISSING", metadata.pattern_id); continue; }
  const artifact = lesson.python;
  const traceFile = path.join(appRoot, "public", metadata.trace_url.split("?", 1)[0].replace(/^\//, ""));
  const chunkValue = await json(traceFile);
  let chunk;
  try { chunk = traceApi.validateTraceChunk(chunkValue, metadata, artifact); }
  catch (error) { fail("CHUNK_INVALID", `${metadata.pattern_id}: ${error.message}`); continue; }

  if (artifact.lines.some((line) => /\.step\.contract|stage[-_ ]?\d/i.test(line.text))) fail("CONTRACT_TOKEN_SOURCE", metadata.pattern_id);
  const lineIds = new Set(artifact.lines.map((line) => line.line_id));
  const sequenceFingerprints = new Set();
  for (const scenario of chunk.scenarios) {
    scenarioCount += 1;
    let events;
    try { events = traceApi.selectScenarioEvents(chunk, scenario.scenario_id); }
    catch (error) { fail("SCENARIO_SELECT_FAILED", `${scenario.scenario_id}: ${error.message}`); continue; }
    const selectedIds = events.map((event) => event.event_id);
    if (JSON.stringify(selectedIds) !== JSON.stringify(scenario.event_ids)) fail("SCENARIO_SEQUENCE_MISMATCH", scenario.scenario_id);
    sequenceFingerprints.add(JSON.stringify(selectedIds));
    eventCount += events.length;
    for (const event of events) {
      for (const lineId of event.active_line_ids) {
        lineBindingCount += 1;
        if (!lineIds.has(lineId)) fail("LINE_BINDING_INVALID", `${event.event_id}: ${lineId}`);
      }
      for (const locale of ["vi", "en"]) {
        localeBindingCount += 1;
        const a11y = event.accessibility;
        if (!a11y.accessible_label?.[locale] || !a11y.action_description?.[locale] || !a11y.keyboard_instruction?.[locale] || !a11y.live_status?.message?.[locale]) {
          fail("A11Y_LOCALE_MISSING", `${event.event_id}: ${locale}`);
        }
      }
    }
  }
  if (sequenceFingerprints.size === chunk.scenarios.length) distinctScenarioSequenceCount += 1;
  else fail("SCENARIO_SEQUENCES_NOT_DISTINCT", metadata.pattern_id);
}

const sampleMeta = manifest.patterns[0];
const sampleLesson = lessonBySlug.get(sampleMeta.owner_lesson_slug);
const sampleChunk = await json(path.join(appRoot, "public", sampleMeta.trace_url.split("?", 1)[0].replace(/^\//, "")));
traceApi.clearTraceCacheForTests();
let fetchCount = 0;
const mockFetch = async () => ({ ok: true, status: 200, json: async () => structuredClone(sampleChunk) });
const countingFetch = async (...args) => { fetchCount += 1; return mockFetch(...args); };
await traceApi.loadTraceChunk(sampleMeta, sampleLesson.python, countingFetch);
await traceApi.loadTraceChunk(sampleMeta, sampleLesson.python, countingFetch);
if (fetchCount !== 1) fail("TRACE_CACHE_FAILED", `fetch_count=${fetchCount}`);

let negativeMutationsRejected = 0;
for (const mutate of [
  (chunk) => { chunk.owner.code_sha256 = "0".repeat(64); },
  (chunk) => { chunk.events[0].active_line_ids = ["unknown.v2.L999"]; },
  (chunk) => { chunk.scenarios[0].event_ids = [...chunk.scenarios[0].event_ids].reverse(); },
]) {
  const mutation = structuredClone(sampleChunk);
  mutate(mutation);
  try { traceApi.validateTraceChunk(mutation, sampleMeta, sampleLesson.python); }
  catch { negativeMutationsRejected += 1; }
}
if (negativeMutationsRejected !== 3) fail("NEGATIVE_MUTATION_ACCEPTED", `rejected=${negativeMutationsRejected}/3`);

const scenarioA = traceApi.defaultScenario(sampleChunk);
const scenarioB = sampleChunk.scenarios.find((item) => item.scenario_id !== scenarioA.scenario_id);
const eventsA = traceApi.selectScenarioEvents(sampleChunk, scenarioA.scenario_id);
const eventsB = traceApi.selectScenarioEvents(sampleChunk, scenarioB.scenario_id);
let reducer = reducerApi.createInitialRuntimeState(sampleMeta.pattern_id, "vi");
reducer = reducerApi.runtimeReducer(reducer, { type: "TRACE_READY", patternId: sampleMeta.pattern_id, scenarioId: scenarioA.scenario_id, firstEventId: eventsA[0].event_id });
if (eventsA[1]) reducer = reducerApi.runtimeReducer(reducer, { type: "NEXT", eventId: eventsA[1].event_id });
const identityBeforeLocale = [reducer.patternId, reducer.scenarioId, reducer.eventIndex, reducer.eventId, reducer.inputRevision].join("|");
reducer = reducerApi.runtimeReducer(reducer, { type: "SET_LOCALE", locale: "en" });
const identityAfterLocale = [reducer.patternId, reducer.scenarioId, reducer.eventIndex, reducer.eventId, reducer.inputRevision].join("|");
if (identityBeforeLocale !== identityAfterLocale || reducer.locale !== "en") fail("LOCALE_CHANGED_RUNTIME_IDENTITY", `${identityBeforeLocale} -> ${identityAfterLocale}`);
reducer = reducerApi.runtimeReducer({ ...reducer, playing: true, predictionStatus: "incorrect", predictionAnswer: "x" }, { type: "CHANGE_INPUT", scenarioId: scenarioB.scenario_id, firstEventId: eventsB[0].event_id });
if (reducer.scenarioId !== scenarioB.scenario_id || reducer.eventId !== eventsB[0].event_id || reducer.eventIndex !== 0 || reducer.playing || reducer.predictionStatus !== "idle" || reducer.predictionAnswer !== "" || reducer.inputRevision !== 1) {
  fail("CHANGE_INPUT_NOT_ATOMIC", JSON.stringify(reducer));
}

const binaryMetadata = manifest.patterns.find((item) => item.pattern_id === "BINARY_SEARCH");
const binaryLesson = binaryMetadata ? lessonBySlug.get(binaryMetadata.owner_lesson_slug) : null;
let binaryProjectionCounts = {};
let binaryAdaptedEvents = 0;
let binaryMalformedFallbacks = 0;
let binaryProgressRestoreChecks = 0;
let binaryProgressRejections = 0;
if (!binaryMetadata || !binaryLesson) {
  fail("BINARY_SEARCH_METADATA_MISSING", "BINARY_SEARCH");
} else {
  const binaryTraceFile = path.join(appRoot, "public", binaryMetadata.trace_url.split("?", 1)[0].replace(/^\//, ""));
  const binaryChunkValue = await json(binaryTraceFile);
  let binaryChunk;
  try { binaryChunk = traceApi.validateTraceChunk(binaryChunkValue, binaryMetadata, binaryLesson.python); }
  catch (error) { fail("BINARY_SEARCH_CHUNK_INVALID", error.message); }
  if (binaryChunk) {
    if (binaryChunk.scenarios.length !== 3 || binaryChunk.events.length !== 15) fail("BINARY_SEARCH_DENOMINATOR_DRIFT", `scenarios=${binaryChunk.scenarios.length},events=${binaryChunk.events.length}`);
    const expectedCounts = { normal: 3, boundary: 1, failure: 1 };
    const expectedResults = new Map(binaryLesson.tests.expected_outputs.map((item) => [item.fixture_ref, item.value]));
    const semanticTargets = new Set(["visual.dsa.binary-search-interval", "visual.dsa.growth-counter", "visual.binary-search.state"]);
    for (const scenario of binaryChunk.scenarios) {
      const fullEvents = traceApi.selectScenarioEvents(binaryChunk, scenario.scenario_id);
      const projected = binarySearchApi.projectLearningEvents("BINARY_SEARCH", fullEvents);
      binaryProjectionCounts[scenario.case_kind] = projected.length;
      if (projected.length !== expectedCounts[scenario.case_kind]) fail("BINARY_SEARCH_CORE_PROJECTION", `${scenario.case_kind}: ${projected.length}`);
      if (!projected.every((event) => fullEvents.includes(event)) || projected.some((event, index) => index > 0 && fullEvents.indexOf(event) <= fullEvents.indexOf(projected[index - 1]))) {
        fail("BINARY_SEARCH_PROJECTION_IDENTITY", scenario.scenario_id);
      }
      const models = projected.map((event) => binarySearchApi.adaptBinarySearchEvent(event, "revealed"));
      for (let index = 0; index < models.length; index += 1) {
        const model = models[index];
        const event = projected[index];
        if (!model) { fail("BINARY_SEARCH_ADAPTER_REJECTED_CANONICAL", event.event_id); continue; }
        binaryAdaptedEvents += 1;
        const clonedModel = binarySearchApi.adaptBinarySearchEvent(structuredClone(event), "revealed");
        if (JSON.stringify(model) !== JSON.stringify(clonedModel)) fail("BINARY_SEARCH_ADAPTER_NONDETERMINISTIC", event.event_id);
        if (model.focusLineIds.length < 1 || model.focusLineIds.length > 3 || model.focusLineIds.some((lineId) => !event.active_line_ids.includes(lineId))) fail("BINARY_SEARCH_FOCUS_LINES", event.event_id);
        if (model.activeVisualTargets.length < 1 || model.activeVisualTargets.length > 3 || new Set(model.activeVisualTargets).size !== model.activeVisualTargets.length) fail("BINARY_SEARCH_ACTIVE_VISUAL_TARGETS", event.event_id);
        for (const target of semanticTargets) if (!event.visual_targets.includes(target)) fail("BINARY_SEARCH_SEMANTIC_TARGET", `${event.event_id}: ${target}`);
        if (!event.visual_targets.includes(model.eventSpecificTarget)) fail("BINARY_SEARCH_EVENT_TARGET", `${event.event_id}: ${model.eventSpecificTarget}`);
      }
      const finalModel = models.at(-1);
      const expected = expectedResults.get(scenario.fixture_ref);
      if (!finalModel || !expected || finalModel.status !== expected.status || finalModel.result !== expected.index) fail("BINARY_SEARCH_RESULT_DRIFT", scenario.fixture_ref);
      if (scenario.case_kind === "normal") {
        const signatures = models.map((model) => model && [model.probe.low, model.probe.middle, model.probe.high, model.retained.low, model.retained.high, model.status].join("|"));
        const expectedSignatures = ["0|3|6|4|6|READY", "4|5|6|4|4|READY", "4|4|4|4|4|FOUND"];
        if (JSON.stringify(signatures) !== JSON.stringify(expectedSignatures)) fail("BINARY_SEARCH_NORMAL_STATES", JSON.stringify(signatures));
      }
      if (scenario.case_kind === "boundary" && (finalModel.values.length !== 0 || finalModel.probe.low !== 0 || finalModel.probe.high !== -1)) fail("BINARY_SEARCH_BOUNDARY_STATE", JSON.stringify(finalModel));
      if (scenario.case_kind === "failure" && JSON.stringify(finalModel.inversion) !== JSON.stringify([1, 2])) fail("BINARY_SEARCH_INVERSION_STATE", JSON.stringify(finalModel.inversion));
    }

    const normalScenario = binaryChunk.scenarios.find((item) => item.case_kind === "normal");
    const normalEvent = normalScenario ? traceApi.selectScenarioEvents(binaryChunk, normalScenario.scenario_id)[0] : null;
    if (normalEvent) {
      for (const mutate of [
        (event) => { event.delta.execution_trace_event.middle = 999; },
        (event) => { event.after.domain.values[0] = 999; },
        (event) => { event.delta.execution_trace_event.event = "unknown_event"; },
      ]) {
        const mutation = structuredClone(normalEvent);
        mutate(mutation);
        if (binarySearchApi.adaptBinarySearchEvent(mutation, "predict") === null) binaryMalformedFallbacks += 1;
      }
    }
    if (binaryMalformedFallbacks !== 3) fail("BINARY_SEARCH_MALFORMED_ACCEPTED", `${binaryMalformedFallbacks}/3`);

    const normalScenarioForReducer = binaryChunk.scenarios.find((item) => item.case_kind === "normal");
    const normalCore = normalScenarioForReducer ? binarySearchApi.projectLearningEvents("BINARY_SEARCH", traceApi.selectScenarioEvents(binaryChunk, normalScenarioForReducer.scenario_id)) : [];
    if (normalScenarioForReducer && normalCore.length > 1) {
      let binaryReducer = reducerApi.createInitialRuntimeState("BINARY_SEARCH", "en");
      binaryReducer = reducerApi.runtimeReducer(binaryReducer, { type: "TRACE_READY", patternId: "BINARY_SEARCH", scenarioId: normalScenarioForReducer.scenario_id, firstEventId: normalCore[0].event_id });
      binaryReducer = reducerApi.runtimeReducer(binaryReducer, { type: "SUBMIT_PREDICTION", status: "incorrect", answer: "retain-middle" });
      if (binaryReducer.stepPhase !== "revealed" || binaryReducer.predictionAnswer !== "retain-middle") fail("BINARY_SEARCH_REVEAL_PHASE", JSON.stringify(binaryReducer));
      binaryReducer = reducerApi.runtimeReducer(binaryReducer, { type: "NEXT", eventId: normalCore[1].event_id });
      if (binaryReducer.stepPhase !== "predict" || binaryReducer.predictionStatus !== "idle") fail("BINARY_SEARCH_NEXT_PHASE", JSON.stringify(binaryReducer));
      const storedAtSecondPrompt = binarySearchApi.createBinarySearchStoredProgress(binaryReducer, binaryChunk);
      const restoredAtSecondPrompt = binarySearchApi.restoreBinarySearchProgress(JSON.parse(JSON.stringify(storedAtSecondPrompt)), binaryChunk);
      if (!restoredAtSecondPrompt || restoredAtSecondPrompt.scenarioId !== normalScenarioForReducer.scenario_id || restoredAtSecondPrompt.eventIndex !== 1 || restoredAtSecondPrompt.eventId !== normalCore[1].event_id || restoredAtSecondPrompt.stepPhase !== "predict" || restoredAtSecondPrompt.predictionStatus !== "idle" || restoredAtSecondPrompt.predictionAnswer !== "") {
        fail("BINARY_SEARCH_PROGRESS_PROMPT_RESTORE", JSON.stringify(restoredAtSecondPrompt));
      } else binaryProgressRestoreChecks += 1;

      const secondModel = binarySearchApi.adaptBinarySearchEvent(normalCore[1], "revealed");
      binaryReducer = reducerApi.runtimeReducer(binaryReducer, { type: "SUBMIT_PREDICTION", status: "correct", answer: secondModel.prediction.correctKey });
      const storedRevealed = binarySearchApi.createBinarySearchStoredProgress(binaryReducer, binaryChunk);
      const restoredRevealed = binarySearchApi.restoreBinarySearchProgress(structuredClone(storedRevealed), binaryChunk);
      if (!restoredRevealed || restoredRevealed.eventIndex !== 1 || restoredRevealed.stepPhase !== "revealed" || restoredRevealed.predictionStatus !== "correct" || restoredRevealed.predictionAnswer !== secondModel.prediction.correctKey) {
        fail("BINARY_SEARCH_PROGRESS_REVEALED_RESTORE", JSON.stringify(restoredRevealed));
      } else binaryProgressRestoreChecks += 1;

      let localeRestoreReducer = reducerApi.createInitialRuntimeState("BINARY_SEARCH", "vi");
      localeRestoreReducer = reducerApi.runtimeReducer(localeRestoreReducer, { type: "RESTORE_PROGRESS", ...restoredRevealed });
      if (localeRestoreReducer.locale !== "vi" || localeRestoreReducer.eventIndex !== 1 || localeRestoreReducer.stepPhase !== "revealed" || localeRestoreReducer.predictionAnswer !== secondModel.prediction.correctKey) {
        fail("BINARY_SEARCH_PROGRESS_LOCALE_IDENTITY", JSON.stringify(localeRestoreReducer));
      } else binaryProgressRestoreChecks += 1;

      const recursiveEventId = traceApi.selectScenarioEvents(binaryChunk, normalScenarioForReducer.scenario_id).find((item) => !normalCore.includes(item))?.event_id;
      for (const mutate of [
        (value) => { value.codeSha256 = "0".repeat(64); },
        (value) => { value.scenarioId = "unknown-scenario"; },
        (value) => { value.eventIndex = 0; },
        (value) => { value.eventId = recursiveEventId; },
        (value) => { value.stepPhase = "revealed"; value.predictionStatus = "correct"; value.predictionAnswer = "retain-middle"; },
        (value) => { value.schema_version = "stale-progress-v0"; },
      ]) {
        const mutation = structuredClone(storedAtSecondPrompt);
        mutate(mutation);
        if (binarySearchApi.restoreBinarySearchProgress(mutation, binaryChunk) === null) binaryProgressRejections += 1;
      }
      if (binaryProgressRejections !== 6) fail("BINARY_SEARCH_PROGRESS_INVALID_ACCEPTED", `${binaryProgressRejections}/6`);

      binaryReducer = reducerApi.runtimeReducer(binaryReducer, { type: "PREVIOUS", eventId: normalCore[0].event_id });
      if (binaryReducer.stepPhase !== "revealed" || binaryReducer.eventIndex !== 0) fail("BINARY_SEARCH_PREVIOUS_PHASE", JSON.stringify(binaryReducer));
    }
  }
}

const result = {
  schema_version: "paper4-v2-runtime-check-v1",
  decision: failures.length === 0 ? "PASS" : "FAIL",
  checks: {
    patterns: patternCount,
    scenarios: scenarioCount,
    selected_scenario_events: eventCount,
    active_line_bindings: lineBindingCount,
    bilingual_accessibility_bindings: localeBindingCount,
    patterns_with_three_distinct_scenario_sequences: distinctScenarioSequenceCount,
    trace_fetches_for_two_identical_loads: fetchCount,
    negative_trace_mutations_rejected: `${negativeMutationsRejected}/3`,
    reducer_atomic_change_input: failures.every((item) => item.code !== "CHANGE_INPUT_NOT_ATOMIC"),
    reducer_locale_identity_preserved: failures.every((item) => item.code !== "LOCALE_CHANGED_RUNTIME_IDENTITY"),
    binary_search_core_projection: binaryProjectionCounts,
    binary_search_adapted_events: binaryAdaptedEvents,
    binary_search_malformed_fallbacks: `${binaryMalformedFallbacks}/3`,
    binary_search_progress_restore_checks: `${binaryProgressRestoreChecks}/3`,
    binary_search_invalid_progress_rejected: `${binaryProgressRejections}/6`,
  },
  failures,
};
console.log(JSON.stringify(result, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
