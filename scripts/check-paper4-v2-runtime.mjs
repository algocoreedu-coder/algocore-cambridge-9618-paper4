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
  },
  failures,
};
console.log(JSON.stringify(result, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
