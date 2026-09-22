import type { PatternMetadata, PythonArtifactDto, TraceChunk, TraceEvent, TraceScenario } from "./types";

const traceCache = new Map<string, Promise<TraceChunk>>();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateTraceChunk(value: unknown, metadata: PatternMetadata, preloadArtifact?: PythonArtifactDto): TraceChunk {
  assert(isRecord(value), "Trace payload is not an object.");
  assert(value.schema_version === "paper4-v2-trace-chunk-v1", "Unsupported trace schema.");
  assert(value.pattern_id === metadata.pattern_id, "Trace pattern does not match requested metadata.");
  assert(isRecord(value.owner), "Trace owner is missing.");
  assert(isRecord(value.python_artifact), "Trace Python artifact is missing.");
  const artifact = value.python_artifact as unknown as PythonArtifactDto;
  assert(typeof artifact.python_artifact_id === "string" && Array.isArray(artifact.lines), "Trace Python artifact is malformed.");
  assert(value.owner.lesson_id === metadata.owner_lesson_id, "Trace lesson owner mismatch.");
  assert(value.owner.python_artifact_id === metadata.python_artifact_id, "Trace metadata artifact mismatch.");
  assert(value.owner.python_artifact_id === artifact.python_artifact_id, "Trace Python artifact mismatch.");
  assert(value.owner.artifact_version === artifact.version, "Trace artifact version mismatch.");
  assert(value.owner.code_sha256 === artifact.code_sha256, "Trace source hash mismatch.");
  if (preloadArtifact) {
    assert(preloadArtifact.python_artifact_id === artifact.python_artifact_id, "Preloaded Python artifact ID mismatch.");
    assert(preloadArtifact.version === artifact.version, "Preloaded Python artifact version mismatch.");
    assert(preloadArtifact.code_sha256 === artifact.code_sha256, "Preloaded Python source hash mismatch.");
  }
  assert(Array.isArray(value.scenarios) && value.scenarios.length === metadata.scenario_count, "Trace scenario count mismatch.");
  assert(Array.isArray(value.events) && value.events.length === metadata.event_count, "Trace event count mismatch.");

  const lineIds = new Set(artifact.lines.map((line) => line.line_id));
  const eventIds = new Set<string>();
  const eventById = new Map<string, TraceEvent>();
  for (const candidate of value.events) {
    assert(isRecord(candidate), "Trace event is not an object.");
    assert(typeof candidate.event_id === "string" && !eventIds.has(candidate.event_id), "Trace event ID is missing or duplicated.");
    assert(Array.isArray(candidate.active_line_ids), `Event ${candidate.event_id} has no active-line array.`);
    for (const lineId of candidate.active_line_ids) {
      assert(typeof lineId === "string" && lineIds.has(lineId), `Event ${candidate.event_id} references unknown line ${String(lineId)}.`);
    }
    eventIds.add(candidate.event_id);
    eventById.set(candidate.event_id, candidate as unknown as TraceEvent);
  }

  const scenarioIds = new Set<string>();
  for (const candidate of value.scenarios) {
    assert(isRecord(candidate), "Trace scenario is not an object.");
    assert(typeof candidate.scenario_id === "string" && !scenarioIds.has(candidate.scenario_id), "Scenario ID is missing or duplicated.");
    assert(candidate.python_artifact_id === artifact.python_artifact_id, `Scenario ${candidate.scenario_id} uses the wrong artifact.`);
    assert(candidate.artifact_version === artifact.version, `Scenario ${candidate.scenario_id} uses the wrong artifact version.`);
    assert(Array.isArray(candidate.event_ids) && candidate.event_ids.length > 0, `Scenario ${candidate.scenario_id} has no events.`);
    const sequences = candidate.event_ids.map((eventId) => {
      assert(typeof eventId === "string" && eventById.has(eventId), `Scenario ${candidate.scenario_id} references unknown event ${String(eventId)}.`);
      return eventById.get(eventId)!.sequence;
    });
    assert(sequences.every((sequence, index) => sequence === index), `Scenario ${candidate.scenario_id} event sequence is not contiguous.`);
    scenarioIds.add(candidate.scenario_id);
  }

  return value as unknown as TraceChunk;
}

export async function loadTraceChunk(
  metadata: PatternMetadata,
  preloadArtifact?: PythonArtifactDto,
  fetcher: typeof fetch = fetch,
): Promise<TraceChunk> {
  const cacheKey = metadata.trace_url;
  const cached = traceCache.get(cacheKey);
  if (cached) return cached;
  const request = fetcher(metadata.trace_url, { headers: { Accept: "application/json" }, cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Trace request failed (${response.status}).`);
      return validateTraceChunk(await response.json(), metadata, preloadArtifact);
    })
    .catch((error: unknown) => {
      traceCache.delete(cacheKey);
      throw error;
    });
  traceCache.set(cacheKey, request);
  return request;
}

export function defaultScenario(chunk: TraceChunk): TraceScenario {
  return chunk.scenarios.find((scenario) => scenario.case_kind === "normal") ?? chunk.scenarios[0];
}

export function selectScenarioEvents(chunk: TraceChunk, scenarioId: string): readonly TraceEvent[] {
  const scenario = chunk.scenarios.find((item) => item.scenario_id === scenarioId);
  if (!scenario) throw new Error(`Unknown scenario ${scenarioId}.`);
  const eventById = new Map(chunk.events.map((event) => [event.event_id, event]));
  return scenario.event_ids.map((eventId) => {
    const event = eventById.get(eventId);
    if (!event) throw new Error(`Scenario ${scenarioId} references missing event ${eventId}.`);
    return event;
  });
}

export function clearTraceCacheForTests() {
  traceCache.clear();
}
