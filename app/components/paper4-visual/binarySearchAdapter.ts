import type { JsonValue, Locale, LocalizedText, PredictionStatus, RuntimeState, RuntimeStepPhase, TraceChunk, TraceEvent } from "./types";

export const BINARY_SEARCH_PROGRESS_KEY = "algocore.paper4.visual.BINARY_SEARCH.progress.v1";

export type BinarySearchStoredProgress = Readonly<{
  schema_version: "paper4-binary-search-progress-v1";
  patternId: "BINARY_SEARCH";
  artifactVersion: string;
  codeSha256: string;
  scenarioId: string;
  eventIndex: number;
  eventId: string;
  stepPhase: RuntimeStepPhase;
  predictionStatus: PredictionStatus;
  predictionAnswer: string;
}>;

export type BinarySearchRestoredProgress = Readonly<Pick<RuntimeState,
  "patternId" | "scenarioId" | "eventIndex" | "eventId" | "stepPhase" | "predictionStatus" | "predictionAnswer"
>>;

export type SearchStepPhase = "predict" | "revealed";
export type SearchStatus = "READY" | "FOUND" | "NOT_FOUND" | "UNSORTED";
export type SearchEventName = "inspect_middle" | "search_exhausted" | "reject_unsorted_input";
export type SearchCellState = "outside" | "possible" | "middle" | "found" | "inversion";

export type BoundState = Readonly<{ low: number; middle: number | null; high: number }>;
export type PredictionChoice = Readonly<{
  key: string;
  label: LocalizedText;
  misconception?: "retain-middle" | "reverse-direction" | "discard-possible" | "wrong-output" | "ignore-precondition";
}>;

export type BinarySearchSceneModel = Readonly<{
  kind: "binary-search-window";
  eventId: string;
  focusTarget: string;
  storyboardTarget: string;
  eventName: SearchEventName;
  eventSpecificTarget: string;
  values: readonly (string | number)[];
  target: string | number;
  probe: BoundState;
  retained: BoundState;
  phase: SearchStepPhase;
  status: SearchStatus;
  result: number | null;
  inversion: readonly [number, number] | null;
  excludedBefore: readonly number[];
  excludedAfter: readonly number[];
  focusLineIds: readonly string[];
  activeVisualTargets: readonly string[];
  prediction: Readonly<{
    prompt: LocalizedText;
    choices: readonly PredictionChoice[];
    correctKey: string;
    feedbackByKey: Readonly<Record<string, LocalizedText>>;
  }>;
  narration: LocalizedText;
  deltaLabel: LocalizedText;
  invariantLabel: LocalizedText;
  fullState: LocalizedText;
  comparisonNumber: number;
}>;

const CORE_EVENT_NAMES = new Set<SearchEventName>(["inspect_middle", "search_exhausted", "reject_unsorted_input"]);

function isUnknownRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRecord(value: JsonValue | undefined): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordAt(value: JsonValue | undefined, key: string) {
  return isRecord(value) && isRecord(value[key]) ? value[key] : null;
}

function integerAt(record: Readonly<Record<string, JsonValue>>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function primitiveAt(record: Readonly<Record<string, JsonValue>>, key: string): string | number | null {
  const value = record[key];
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function localized(en: string, vi: string): LocalizedText {
  return { en, vi };
}

function interval(low: number, high: number) {
  return `[${low},${high}]`;
}

function eventName(event: TraceEvent): SearchEventName | null {
  const execution = recordAt(event.delta, "execution_trace_event");
  const name = execution?.event;
  return typeof name === "string" && CORE_EVENT_NAMES.has(name as SearchEventName) ? name as SearchEventName : null;
}

export function projectLearningEvents(patternId: string, events: readonly TraceEvent[]): readonly TraceEvent[] {
  if (patternId !== "BINARY_SEARCH") return events;
  const projected = events.filter((event) => eventName(event) !== null);
  return projected.length === 1 || projected.length === 3 ? projected : events;
}

export function createBinarySearchStoredProgress(
  state: Pick<RuntimeState, "scenarioId" | "eventIndex" | "eventId" | "stepPhase" | "predictionStatus" | "predictionAnswer">,
  chunk: TraceChunk,
): BinarySearchStoredProgress {
  return {
    schema_version: "paper4-binary-search-progress-v1",
    patternId: "BINARY_SEARCH",
    artifactVersion: chunk.owner.artifact_version,
    codeSha256: chunk.owner.code_sha256,
    scenarioId: state.scenarioId,
    eventIndex: state.eventIndex,
    eventId: state.eventId,
    stepPhase: state.stepPhase,
    predictionStatus: state.predictionStatus,
    predictionAnswer: state.predictionAnswer,
  };
}

export function restoreBinarySearchProgress(value: unknown, chunk: TraceChunk): BinarySearchRestoredProgress | null {
  if (!isUnknownRecord(value) || value.schema_version !== "paper4-binary-search-progress-v1" || value.patternId !== "BINARY_SEARCH") return null;
  if (chunk.pattern_id !== "BINARY_SEARCH" || value.artifactVersion !== chunk.owner.artifact_version || value.codeSha256 !== chunk.owner.code_sha256) return null;
  if (typeof value.scenarioId !== "string" || typeof value.eventId !== "string" || typeof value.eventIndex !== "number" || !Number.isInteger(value.eventIndex)) return null;
  if (value.stepPhase !== "predict" && value.stepPhase !== "revealed") return null;
  if (value.predictionStatus !== "idle" && value.predictionStatus !== "correct" && value.predictionStatus !== "incorrect") return null;
  if (typeof value.predictionAnswer !== "string") return null;

  const scenario = chunk.scenarios.find((item) => item.scenario_id === value.scenarioId);
  if (!scenario) return null;
  const eventById = new Map(chunk.events.map((event) => [event.event_id, event]));
  const fullEvents: TraceEvent[] = [];
  for (const eventId of scenario.event_ids) {
    const event = eventById.get(eventId);
    if (!event) return null;
    fullEvents.push(event);
  }
  const projected = projectLearningEvents("BINARY_SEARCH", fullEvents);
  if (value.eventIndex < 0 || value.eventIndex >= projected.length || projected[value.eventIndex]?.event_id !== value.eventId) return null;
  const model = adaptBinarySearchEvent(projected[value.eventIndex], value.stepPhase);
  if (!model) return null;

  if (value.stepPhase === "predict") {
    if (value.predictionStatus !== "idle" || value.predictionAnswer !== "") return null;
  } else if (value.predictionStatus === "idle") {
    if (value.predictionAnswer !== "") return null;
  } else {
    if (!model.prediction.choices.some((choice) => choice.key === value.predictionAnswer)) return null;
    const expectedStatus = value.predictionAnswer === model.prediction.correctKey ? "correct" : "incorrect";
    if (value.predictionStatus !== expectedStatus) return null;
  }

  return {
    patternId: "BINARY_SEARCH",
    scenarioId: value.scenarioId,
    eventIndex: value.eventIndex,
    eventId: value.eventId,
    stepPhase: value.stepPhase,
    predictionStatus: value.predictionStatus,
    predictionAnswer: value.predictionAnswer,
  };
}

function samePrimitiveArray(left: readonly (string | number)[], right: readonly (string | number)[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function readValues(domain: Readonly<Record<string, JsonValue>>) {
  const value = domain.values;
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string" || typeof item === "number")) return null;
  return value as readonly (string | number)[];
}

function findInversion(values: readonly (string | number)[]): readonly [number, number] | null {
  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    if (typeof previous !== typeof current) return null;
    if (previous > current) return [index - 1, index];
  }
  return null;
}

function outsideIndices(length: number, low: number, high: number) {
  return Array.from({ length }, (_, index) => index).filter((index) => index < low || index > high);
}

function focusLines(name: SearchEventName, value: string | number | null, target: string | number, active: readonly string[], available?: readonly string[]) {
  let desired: readonly string[];
  if (name === "search_exhausted") desired = ["binary-search.v1.L030", "binary-search.v1.L031"];
  else if (name === "reject_unsorted_input") desired = ["binary-search.v1.L037", "binary-search.v1.L038", "binary-search.v1.L039"];
  else if (value === target) desired = ["binary-search.v1.L016", "binary-search.v1.L024", "binary-search.v1.L025"];
  else if (typeof value === typeof target && value! > target) desired = ["binary-search.v1.L016", "binary-search.v1.L026", "binary-search.v1.L027"];
  else desired = ["binary-search.v1.L016", "binary-search.v1.L026", "binary-search.v1.L029"];
  const focused = desired.filter((lineId) => active.includes(lineId) && (!available || available.includes(lineId)));
  if (focused.length === 0 && name === "reject_unsorted_input" && available?.includes("binary-search.v1.L012")) {
    return ["binary-search.v1.L012"];
  }
  return focused;
}

function choice(key: string, en: string, vi: string, misconception?: PredictionChoice["misconception"]): PredictionChoice {
  return { key, label: localized(en, vi), misconception };
}

function inspectPrediction(probe: BoundState, retained: BoundState, middleValue: string | number, target: string | number): Readonly<{
  correctKey: string;
  choices: readonly PredictionChoice[];
  feedbackByKey: Readonly<Record<string, LocalizedText>>;
}> {
  if (middleValue === target) {
    const correctKey = `found-index-${probe.middle}`;
    return {
      correctKey,
      choices: [
        choice(correctKey, `Return index ${probe.middle}`, `Trả về index ${probe.middle}`),
        choice("return-value", `Return value ${middleValue}`, `Trả về giá trị ${middleValue}`, "wrong-output"),
        choice("continue-search", `Continue with ${interval(retained.low, retained.high)}`, `Tiếp tục với ${interval(retained.low, retained.high)}`, "retain-middle"),
      ],
      feedbackByKey: {
        "return-value": localized("Binary Search returns the matching index, not the stored value.", "Binary Search trả về index khớp, không trả về giá trị được lưu."),
        "continue-search": localized("Equality ends the search immediately; no possible interval remains to inspect.", "Khi bằng nhau, tìm kiếm kết thúc ngay; không còn khoảng nào cần xét."),
      },
    };
  }

  const goesRight = typeof middleValue === typeof target && middleValue < target;
  const correctKey = goesRight ? "retain-right" : "retain-left";
  const correct = interval(retained.low, retained.high);
  const keepsMiddle = goesRight ? interval(probe.middle ?? probe.low, probe.high) : interval(probe.low, probe.middle ?? probe.high);
  const reversed = goesRight ? interval(probe.low, (probe.middle ?? probe.high) - 1) : interval((probe.middle ?? probe.low) + 1, probe.high);
  return {
    correctKey,
    choices: [
      choice(correctKey, `Keep ${correct}`, `Giữ ${correct}`),
      choice("retain-middle", `Keep ${keepsMiddle}`, `Giữ ${keepsMiddle}`, "retain-middle"),
      choice("reverse-direction", `Keep ${reversed}`, `Giữ ${reversed}`, "reverse-direction"),
    ],
    feedbackByKey: {
      "retain-middle": localized("The midpoint has already failed equality, so the retained interval must exclude it.", "Middle đã không bằng target nên khoảng được giữ phải loại middle."),
      "reverse-direction": goesRight
        ? localized("The target is greater than the midpoint value, so the sorted left side cannot contain it.", "Target lớn hơn giá trị tại middle nên nửa trái đã sắp xếp không thể chứa target.")
        : localized("The target is smaller than the midpoint value, so the sorted right side cannot contain it.", "Target nhỏ hơn giá trị tại middle nên nửa phải đã sắp xếp không thể chứa target."),
    },
  };
}

function finalResult(event: TraceEvent, name: SearchEventName, status: SearchStatus, middle: number | null) {
  if (status === "FOUND") return middle;
  const finalResultRecord = recordAt(event.output_delta, "final_result");
  const explicitIndex = finalResultRecord ? integerAt(finalResultRecord, "index") : null;
  if (explicitIndex !== null) return explicitIndex;
  if (name === "search_exhausted" && event.active_line_ids.includes("binary-search.v1.L031")) return -1;
  return null;
}

export function adaptBinarySearchEvent(event: TraceEvent, phase: SearchStepPhase, availableLineIds?: readonly string[]): BinarySearchSceneModel | null {
  const name = eventName(event);
  const beforeDomain = recordAt(event.before, "domain");
  const afterDomain = recordAt(event.after, "domain");
  const execution = recordAt(event.delta, "execution_trace_event");
  if (!name || !beforeDomain || !afterDomain || !execution) return null;

  const beforeValues = readValues(beforeDomain);
  const values = readValues(afterDomain);
  const beforeTarget = primitiveAt(beforeDomain, "target");
  const target = primitiveAt(afterDomain, "target");
  if (!beforeValues || !values || beforeTarget === null || target === null || beforeTarget !== target || !samePrimitiveArray(beforeValues, values)) return null;
  if (values.length > 0 && values.some((value) => typeof value !== typeof target)) return null;

  const statusValue = afterDomain.status;
  if (statusValue !== "READY" && statusValue !== "FOUND" && statusValue !== "NOT_FOUND" && statusValue !== "UNSORTED") return null;
  const status = statusValue as SearchStatus;
  const afterLow = integerAt(afterDomain, "low");
  const afterHigh = integerAt(afterDomain, "high");
  if (afterLow === null || afterHigh === null) return null;

  let probeLow = integerAt(execution, "low") ?? integerAt(beforeDomain, "low");
  let probeHigh = integerAt(execution, "high") ?? integerAt(beforeDomain, "high");
  let middle = integerAt(execution, "middle");
  if (probeLow === null || probeHigh === null) return null;

  const middleValue = primitiveAt(execution, "value");
  if (name === "inspect_middle") {
    if (middle === null || middleValue === null || middle < 0 || middle >= values.length || values[middle] !== middleValue) return null;
  } else {
    middle = null;
  }

  const inversion = findInversion(values);
  if (name === "reject_unsorted_input" && (!inversion || status !== "UNSORTED")) return null;
  if (name === "inspect_middle" && status === "FOUND" && middleValue !== target) return null;

  const probe = { low: probeLow, middle, high: probeHigh };
  const retained = { low: afterLow, middle, high: afterHigh };
  const focusedLines = focusLines(name, middleValue, target, event.active_line_ids, availableLineIds);
  if (focusedLines.length === 0 || focusedLines.length > 3) return null;

  let prediction: BinarySearchSceneModel["prediction"];
  let deltaLabel: LocalizedText;
  let invariantLabel: LocalizedText;
  if (name === "inspect_middle") {
    const derived = inspectPrediction(probe, retained, middleValue!, target);
    prediction = { prompt: event.prediction as LocalizedText, ...derived };
    if (status === "FOUND") {
      deltaLabel = localized(`Value ${middleValue} equals target ${target}; return index ${middle}.`, `Giá trị ${middleValue} bằng target ${target}; trả về index ${middle}.`);
    } else {
      deltaLabel = localized(`Compare ${middleValue} with ${target}; the live interval becomes ${interval(afterLow, afterHigh)}.`, `So sánh ${middleValue} với ${target}; khoảng đang xét trở thành ${interval(afterLow, afterHigh)}.`);
    }
    invariantLabel = localized("If the target exists, one possible index remains inside the inclusive interval.", "Nếu target tồn tại, một index khả dĩ vẫn nằm trong khoảng đóng đang xét.");
  } else if (name === "search_exhausted") {
    prediction = {
      prompt: event.prediction as LocalizedText,
      correctKey: "return-not-found",
      choices: [
        choice("return-not-found", "Return -1 without reading a cell", "Trả về -1 mà không đọc ô nào"),
        choice("inspect-zero", "Inspect index 0", "Đọc index 0", "discard-possible"),
        choice("raise-error", "Raise an error", "Phát sinh lỗi", "wrong-output"),
      ],
      feedbackByKey: {
        "inspect-zero": localized("The array is empty and low already exceeds high, so index 0 does not exist.", "Mảng rỗng và low đã lớn hơn high nên index 0 không tồn tại."),
        "raise-error": localized("The function's not-found contract is the sentinel -1.", "Hợp đồng khi không tìm thấy của hàm là sentinel -1."),
      },
    };
    deltaLabel = localized("The interval is empty (0 > -1); return -1.", "Khoảng rỗng (0 > -1); trả về -1.");
    invariantLabel = localized("No element is read after the interval becomes empty.", "Không phần tử nào được đọc sau khi khoảng trở thành rỗng.");
  } else {
    prediction = {
      prompt: event.prediction as LocalizedText,
      correctKey: "reject-unsorted",
      choices: [
        choice("reject-unsorted", "Reject Binary Search before inspecting a midpoint", "Từ chối Binary Search trước khi đọc middle"),
        choice("continue-search", "Continue with the full interval", "Tiếp tục với toàn bộ khoảng", "ignore-precondition"),
        choice("sort-silently", "Silently sort and continue", "Tự sắp xếp rồi tiếp tục", "ignore-precondition"),
      ],
      feedbackByKey: {
        "continue-search": localized("Without ascending order, a midpoint comparison cannot justify discarding either half.", "Nếu không tăng dần, so sánh tại middle không thể biện minh cho việc loại nửa nào."),
        "sort-silently": localized("Changing input order changes the stated operation and can break index identity.", "Tự đổi thứ tự input làm thay đổi thao tác đã nêu và có thể phá vỡ danh tính index."),
      },
    };
    const left = inversion ? values[inversion[0]] : "?";
    const right = inversion ? values[inversion[1]] : "?";
    deltaLabel = localized(`Stop: ${left} > ${right} breaks ascending order.`, `Dừng: ${left} > ${right} phá vỡ thứ tự tăng dần.`);
    invariantLabel = localized("A half may be discarded only when the data uses the same ascending comparison order.", "Chỉ được loại một nửa khi dữ liệu dùng cùng quan hệ thứ tự tăng dần.");
  }

  const result = finalResult(event, name, status, middle);
  const activeVisualTargets = name === "search_exhausted"
    ? ["bs-live-window", "bs-delta-strip", "bs-result"]
    : name === "reject_unsorted_input"
      ? ["bs-inversion-pair", "bs-precondition-gate", "bs-result"]
      : status === "FOUND"
        ? ["bs-pointer-mid", "bs-array", "bs-result"]
        : ["bs-array", "bs-live-window", middleValue! < target ? "bs-pointer-low" : "bs-pointer-high"];
  const fullState = localized(
    `Target ${target}. Probe interval ${interval(probeLow, probeHigh)}.${middle === null ? " No midpoint." : ` Midpoint ${middle}, value ${middleValue}.`} ${phase === "revealed" ? `Retained interval ${interval(afterLow, afterHigh)}. Status ${status}${result === null ? "" : `, result ${result}`}.` : "Result is hidden until prediction."}`,
    `Target ${target}. Khoảng thăm dò ${interval(probeLow, probeHigh)}.${middle === null ? " Không có middle." : ` Middle ${middle}, giá trị ${middleValue}.`} ${phase === "revealed" ? `Khoảng được giữ ${interval(afterLow, afterHigh)}. Trạng thái ${status}${result === null ? "" : `, kết quả ${result}`}.` : "Kết quả được ẩn đến khi dự đoán."}`,
  );

  return {
    kind: "binary-search-window",
    eventId: event.event_id,
    focusTarget: event.accessibility.focus_target,
    storyboardTarget: `bs-checkpoint-${name}-${event.sequence + 1}`,
    eventName: name,
    eventSpecificTarget: `visual.binary-search.${name}`,
    values,
    target,
    probe,
    retained,
    phase,
    status,
    result,
    inversion,
    excludedBefore: outsideIndices(values.length, probeLow, probeHigh),
    excludedAfter: outsideIndices(values.length, afterLow, afterHigh),
    focusLineIds: focusedLines,
    activeVisualTargets,
    prediction,
    narration: localized(`${deltaLabel.en} ${invariantLabel.en}`, `${deltaLabel.vi} ${invariantLabel.vi}`),
    deltaLabel,
    invariantLabel,
    fullState,
    comparisonNumber: name === "inspect_middle" ? event.sequence + 1 : 0,
  };
}

export function cellState(model: BinarySearchSceneModel, index: number): SearchCellState {
  if (model.inversion?.includes(index)) return "inversion";
  if (model.phase === "revealed" && model.status === "FOUND" && index === model.probe.middle) return "found";
  if (index === model.probe.middle) return "middle";
  const excluded = model.phase === "revealed" ? model.excludedAfter : model.excludedBefore;
  return excluded.includes(index) ? "outside" : "possible";
}

export function localizedSceneText(value: LocalizedText, locale: Locale) {
  return value[locale];
}
