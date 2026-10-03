import type { DataModelsChoice, DataModelsLearnerProjection, DataModelsRecord, DataModelsWorkedRow } from "../paper4-learning/learnerProjection";
import type { JsonValue, LocalizedText, TraceChunk, TraceEvent, TraceScenario } from "./types";

export const DATA_MODELS_PROGRESS_KEY = "algocore.paper4.visual.DATA_MODELS.progress.v1";
export const DATA_MODELS_PROGRESS_SCHEMA = "paper4-data-models-progress-v3";

export type DataModelsOperation = "check_record" | "check_capacity" | "append";
export type DataModelsStepPhase = "predict" | "revealed";

export type DataModelsSceneModel = Readonly<{
  kind: "data-models-array-record";
  operation: DataModelsOperation;
  phase: DataModelsStepPhase;
  records: readonly DataModelsRecord[];
  candidate: DataModelsRecord;
  capacity: number;
  count: number;
  activeIndex: number | null;
  recordValid: boolean | null;
  capacityOk: boolean | null;
  result: readonly [boolean, string] | null;
  heading: LocalizedText;
  codeFocus: readonly string[];
  mode: "worked" | "choice";
  workedRows: readonly DataModelsWorkedRow[];
  continueLabel: LocalizedText | null;
  context: LocalizedText | null;
  question: LocalizedText | null;
  options: readonly DataModelsChoice[];
  correctOptionId: string | null;
  retryHint: LocalizedText | null;
  correctFeedback: LocalizedText | null;
  examSentence: LocalizedText | null;
  activeTargets: readonly string[];
}>;

export type DataModelsStoredProgress = Readonly<{
  schema_version: typeof DATA_MODELS_PROGRESS_SCHEMA;
  patternId: "ARRAY_APPEND";
  artifactVersion: string;
  codeSha256: string;
  scenarioId: string;
  eventIndex: number;
  eventId: string;
  stepPhase: DataModelsStepPhase;
  normalComplete: boolean;
  selectedOptions: Readonly<Record<string, string>>;
  revealedEventIds: readonly string[];
}>;

function recordAt(value: JsonValue | undefined, key: string): Readonly<Record<string, JsonValue>> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const nested = (value as Readonly<Record<string, JsonValue>>)[key];
  return nested && typeof nested === "object" && !Array.isArray(nested) ? nested as Readonly<Record<string, JsonValue>> : null;
}

function integerAt(value: Readonly<Record<string, JsonValue>>, key: string) {
  const item = value[key];
  return typeof item === "number" && Number.isInteger(item) ? item : null;
}

function recordValue(value: JsonValue | undefined): DataModelsRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const object = value as Readonly<Record<string, JsonValue>>;
  const name = object.name;
  const score = object.score;
  if (typeof name !== "string" || (score !== undefined && (typeof score !== "number" || !Number.isInteger(score)))) return null;
  return score === undefined ? { name } : { name, score };
}

function recordsAt(value: Readonly<Record<string, JsonValue>>, key: string): readonly DataModelsRecord[] | null {
  const item = value[key];
  if (!Array.isArray(item)) return null;
  const records: DataModelsRecord[] = [];
  for (const candidate of item) {
    const record = recordValue(candidate);
    if (!record) return null;
    records.push(record);
  }
  return records;
}

function sameRecord(left: DataModelsRecord, right: DataModelsRecord) {
  return left.name === right.name && left.score === right.score;
}

function sameRecords(left: readonly DataModelsRecord[], right: readonly DataModelsRecord[]) {
  return left.length === right.length && left.every((record, index) => sameRecord(record, right[index]));
}

export function dataModelsOperation(event: TraceEvent): string | null {
  const execution = recordAt(event.delta, "execution_trace_event");
  return execution && typeof execution.event === "string" ? execution.event : null;
}

const expectedOperations: Readonly<Record<string, readonly DataModelsOperation[]>> = {
  normal: ["check_record", "check_capacity", "append"],
  boundary: ["check_record", "check_capacity"],
  failure: ["check_record"],
};

export function projectDataModelsEvents(caseKind: string, events: readonly TraceEvent[]) {
  const expected = expectedOperations[caseKind];
  if (!expected) return [];
  const projected = events.filter((event) => expected.includes(dataModelsOperation(event) as DataModelsOperation));
  if (projected.length !== expected.length || projected.some((event, index) => dataModelsOperation(event) !== expected[index])) return [];
  return projected;
}

function variantFor(projection: DataModelsLearnerProjection, caseKind: string) {
  return projection.stages.trace.variants.find((variant) => variant.kind === caseKind);
}

function approvedStep(projection: DataModelsLearnerProjection, caseKind: string, index: number) {
  const step = projection.stages.trace.steps[index];
  if (!step) return null;
  const variant = variantFor(projection, caseKind);
  const terminalVariant = variant && index === expectedOperations[caseKind].length - 1;
  if (terminalVariant) return {
    heading: variant.label,
    codeFocus: step.code_focus,
    mode: "choice" as const,
    workedRows: [],
    continueLabel: null,
    context: null,
    question: variant.question,
    options: variant.options,
    correctOptionId: variant.correct_option_id,
    retryHint: variant.retry_hint,
    correctFeedback: variant.correct_feedback,
    examSentence: null,
    result: variant.expected.result,
  };
  return {
    heading: step.heading,
    codeFocus: step.code_focus,
    mode: step.mode,
    workedRows: step.worked_rows ?? [],
    continueLabel: step.continue_label ?? null,
    context: step.context ?? null,
    question: step.question ?? null,
    options: step.options ?? [],
    correctOptionId: step.correct_option_id ?? null,
    retryHint: step.retry_hint ?? null,
    correctFeedback: step.correct_feedback ?? null,
    examSentence: step.exam_sentence,
    result: caseKind === "normal" && index === 2 ? step.after.result : null,
  };
}

function validResult(value: unknown): value is readonly [boolean, string] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "boolean" && typeof value[1] === "string";
}

export function adaptDataModelsEvent(event: TraceEvent, scenario: TraceScenario, index: number, projection: DataModelsLearnerProjection, phase: DataModelsStepPhase): DataModelsSceneModel | null {
  const operation = dataModelsOperation(event);
  if (operation !== "check_record" && operation !== "check_capacity" && operation !== "append") return null;
  const expected = expectedOperations[scenario.case_kind];
  if (!expected || expected[index] !== operation) return null;
  const approved = approvedStep(projection, scenario.case_kind, index);
  if (!approved || approved.codeFocus.length === 0 || approved.codeFocus.length > 3 || (approved.result !== null && !validResult(approved.result))) return null;

  const beforeDomain = recordAt(event.before, "domain");
  const afterDomain = recordAt(event.after, "domain");
  const fixtureInput = recordAt(event.before, "fixture_input");
  const execution = recordAt(event.delta, "execution_trace_event");
  if (!beforeDomain || !afterDomain || !fixtureInput || !execution) return null;
  const beforeRecords = recordsAt(beforeDomain, "records");
  const afterRecords = recordsAt(afterDomain, "records");
  const candidate = recordValue(fixtureInput.new_record);
  const capacity = integerAt(fixtureInput, "capacity");
  if (!beforeRecords || !afterRecords || !candidate || capacity === null || capacity < 0 || beforeRecords.length > capacity) return null;

  const recordValidValue = afterDomain.record_valid;
  const recordValid = typeof recordValidValue === "boolean" ? recordValidValue : null;
  const capacityOkValue = afterDomain.capacity_ok;
  const capacityOk = typeof capacityOkValue === "boolean" ? capacityOkValue : null;
  let activeIndex: number | null = null;

  if (operation === "check_record") {
    if (recordValid === null || !sameRecords(beforeRecords, afterRecords)) return null;
  } else if (operation === "check_capacity") {
    const tracedCount = integerAt(execution, "count");
    const tracedCapacity = integerAt(execution, "capacity");
    if (capacityOk === null || tracedCount !== beforeRecords.length || tracedCapacity !== capacity || capacityOk !== (beforeRecords.length < capacity) || !sameRecords(beforeRecords, afterRecords)) return null;
    activeIndex = beforeRecords.length < capacity ? beforeRecords.length : null;
  } else {
    const appended = recordValue(execution.record);
    const indexValue = integerAt(execution, "index");
    if (!appended || indexValue !== beforeRecords.length || afterRecords.length !== beforeRecords.length + 1 || !sameRecords(beforeRecords, afterRecords.slice(0, -1)) || !sameRecord(appended, candidate) || !sameRecord(afterRecords[afterRecords.length - 1], candidate) || afterRecords.length > capacity) return null;
    activeIndex = indexValue;
  }

  const records = phase === "revealed" ? afterRecords : beforeRecords;
  return {
    kind: "data-models-array-record",
    operation,
    phase,
    records,
    candidate,
    capacity,
    count: records.length,
    activeIndex,
    recordValid: phase === "revealed" ? recordValid : null,
    capacityOk: phase === "revealed" ? capacityOk : null,
    result: phase === "revealed" && validResult(approved.result) ? approved.result : null,
    heading: approved.heading,
    codeFocus: approved.codeFocus,
    mode: approved.mode,
    workedRows: approved.workedRows,
    continueLabel: approved.continueLabel,
    context: approved.context,
    question: approved.question,
    options: approved.options,
    correctOptionId: approved.correctOptionId,
    retryHint: approved.retryHint,
    correctFeedback: approved.correctFeedback,
    examSentence: approved.examSentence,
    activeTargets: operation === "check_record" ? ["candidate-record", "record-fields", "validation-result"] : operation === "check_capacity" ? ["array-ribbon", "capacity", "next-slot"] : ["candidate-record", "array-ribbon", "result"],
  };
}

function scenarioEvents(chunk: TraceChunk, scenario: TraceScenario) {
  const byId = new Map(chunk.events.map((event) => [event.event_id, event]));
  const events = scenario.event_ids.map((id) => byId.get(id)).filter((event): event is TraceEvent => Boolean(event));
  return events.length === scenario.event_ids.length ? projectDataModelsEvents(scenario.case_kind, events) : [];
}

export function restoreDataModelsProgress(value: unknown, chunk: TraceChunk, projection: DataModelsLearnerProjection): DataModelsStoredProgress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const stored = value as Partial<DataModelsStoredProgress>;
  if (stored.schema_version !== DATA_MODELS_PROGRESS_SCHEMA || stored.patternId !== "ARRAY_APPEND" || stored.artifactVersion !== chunk.owner.artifact_version || stored.codeSha256 !== chunk.owner.code_sha256) return null;
  if (typeof stored.scenarioId !== "string" || typeof stored.eventId !== "string" || typeof stored.eventIndex !== "number" || !Number.isInteger(stored.eventIndex) || stored.eventIndex < 0) return null;
  if (stored.stepPhase !== "predict" && stored.stepPhase !== "revealed") return null;
  if (typeof stored.normalComplete !== "boolean") return null;
  const scenario = chunk.scenarios.find((item) => item.scenario_id === stored.scenarioId);
  if (!scenario) return null;
  const projected = scenarioEvents(chunk, scenario);
  if (!projected[stored.eventIndex] || projected[stored.eventIndex].event_id !== stored.eventId) return null;
  if (!stored.selectedOptions || typeof stored.selectedOptions !== "object" || Array.isArray(stored.selectedOptions) || !Array.isArray(stored.revealedEventIds)) return null;
  const allowed = new Set(projected.map((event) => event.event_id));
  const selectedOptions: Record<string, string> = {};
  for (const [id, selected] of Object.entries(stored.selectedOptions)) {
    const index = projected.findIndex((event) => event.event_id === id);
    const interaction = index >= 0 ? approvedStep(projection, scenario.case_kind, index) : null;
    if (!allowed.has(id) || typeof selected !== "string" || !interaction || interaction.mode !== "choice" || !interaction.options.some((option) => option.id === selected)) return null;
    selectedOptions[id] = selected;
  }
  const revealed = stored.revealedEventIds.filter((id): id is string => typeof id === "string" && allowed.has(id));
  if (revealed.length !== stored.revealedEventIds.length || new Set(revealed).size !== revealed.length) return null;
  const currentRevealed = revealed.includes(stored.eventId);
  for (const id of revealed) {
    const index = projected.findIndex((event) => event.event_id === id);
    const interaction = index >= 0 ? approvedStep(projection, scenario.case_kind, index) : null;
    if (!interaction || (interaction.mode === "choice" && selectedOptions[id] !== interaction.correctOptionId)) return null;
  }
  if ((stored.stepPhase === "revealed") !== currentRevealed) return null;
  return { ...stored, selectedOptions, revealedEventIds: revealed } as DataModelsStoredProgress;
}

export function createDataModelsProgress(input: Readonly<{ scenarioId: string; eventIndex: number; eventId: string; normalComplete: boolean; selectedOptions: Readonly<Record<string, string>>; revealedEventIds: readonly string[] }>, chunk: TraceChunk, projection: DataModelsLearnerProjection): DataModelsStoredProgress {
  const candidate = {
    schema_version: DATA_MODELS_PROGRESS_SCHEMA,
    patternId: "ARRAY_APPEND" as const,
    artifactVersion: chunk.owner.artifact_version,
    codeSha256: chunk.owner.code_sha256,
    ...input,
    stepPhase: input.revealedEventIds.includes(input.eventId) ? "revealed" as const : "predict" as const,
  };
  const restored = restoreDataModelsProgress(candidate, chunk, projection);
  if (!restored) throw new Error("Refusing to persist invalid Data Models progress.");
  return restored;
}
