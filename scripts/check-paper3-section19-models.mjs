import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const EVIDENCE = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section19");
const MODEL_FILE = "app/lib/paper3/computational-thinking-models.ts";
const FIXTURES = JSON.parse(await readFile(path.join(EVIDENCE, "MODEL_FIXTURES.json"), "utf8"));
const CONTRACT = JSON.parse(await readFile(path.join(EVIDENCE, "SECTION19_MODEL_CONTRACTS.json"), "utf8"));
const ORACLE_CONTRACT = JSON.parse(await readFile(path.join(EVIDENCE, "SECTION19_QA_ORACLES.json"), "utf8"));
const startedAt = new Date().toISOString();
const hashFile = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const stable = value => JSON.stringify(value);
const deeplyFrozen = value => value === null || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(deeplyFrozen));
const families = Object.fromEntries(["SEARCH", "SORT", "ADT", "COMPLEXITY", "RECURSION"].map(name => [name, { checks: [], assertions: 0 }]));
const semanticLineIds = new Set(Object.entries(CONTRACT.semanticLineIds).filter(([key]) => key !== "note").flatMap(([, rows]) => Object.keys(rows)));

function record(family, id, pass, expected, actual) {
  families[family].assertions += 1;
  families[family].checks.push({ id, pass: Boolean(pass), expected, actual });
}
const eq = (family, id, actual, expected) => record(family, id, stable(actual) === stable(expected), expected, actual);
const ok = (family, id, actual, expected = true) => record(family, id, Boolean(actual), expected, actual);

function expectRangeError(family, id, call) {
  let actual = null;
  try { call(); } catch (error) { actual = { name: error?.name, message: error?.message }; }
  record(family, id, actual?.name === "RangeError", "RangeError", actual);
}

const forbiddenViTokens = [
  "precondition-failed", "blocked-unsorted", "less-than-target", "greater-than-target",
  "discard-left", "discard-right", "pass-complete", "duplicate-key-rejected",
  "duplicate-rejected", "blocked-invalid", "no-progress", "unreachable-base",
  "true", "false", "undefined", "NaN", "Infinity",
];

function checkTrace(family, id, trace, requireLineIds = false) {
  ok(family, `${id}:deep-frozen`, deeplyFrozen(trace), true);
  ok(family, `${id}:steps`, Array.isArray(trace?.steps) && trace.steps.length > 0, "one or more steps");
  eq(family, `${id}:first-before`, trace?.steps?.[0]?.before, trace?.initial);
  eq(family, `${id}:last-after`, trace?.steps?.at(-1)?.after, trace?.final);
  for (let index = 0; index < (trace?.steps?.length ?? 0); index += 1) {
    const item = trace.steps[index];
    if (index) eq(family, `${id}:${item.id}:continuity`, item.before, trace.steps[index - 1].after);
    for (const field of ["title", "action", "why", "rule", "outcome"]) for (const locale of ["en", "vi"]) {
      ok(family, `${id}:${item.id}:${field}.${locale}`, typeof item[field]?.[locale] === "string" && item[field][locale].trim().length > 0, "non-empty localized text");
    }
    const vi = [item.title?.vi, item.action?.vi, item.why?.vi, item.rule?.vi, item.outcome?.vi].join(" ");
    const leaked = forbiddenViTokens.filter(token => new RegExp(`(^|[^A-Za-z])${token}([^A-Za-z]|$)`, "i").test(vi));
    eq(family, `${id}:${item.id}:vi-no-raw-enum`, leaked, []);
    if (requireLineIds && index > 0 && !["blocked-invalid", "validate", "ready"].includes(item.event)) {
      ok(family, `${id}:${item.id}:active-line-id`, typeof item.activeRule === "string" && semanticLineIds.has(item.activeRule), "activeRule is a semantic line ID from SECTION19_MODEL_CONTRACTS.json");
    }
  }
}

function repeatable(family, id, first, second) { eq(family, `${id}:repeatable`, second, first); }
function checkEdgeTransition(family, id, trace) {
  ok(family, `${id}:edge-at-least-two-steps`, trace.steps.length >= 2, "ready plus explicit terminal/precondition transition");
  const terminal = trace.steps.at(-1);
  ok(family, `${id}:edge-terminal-changes-state`, stable(terminal?.before) !== stable(terminal?.after), "terminal/precondition before and after states differ");
}

const modelPath = path.join(ROOT, MODEL_FILE);
let model = null;
let loadFailure = null;
let modelSha256 = null;
try {
  modelSha256 = await hashFile(modelPath);
  model = await import(`${pathToFileURL(modelPath).href}?section19qa=${modelSha256}`);
} catch (error) {
  loadFailure = error?.stack ?? String(error);
}

function invoke(family, id, call) {
  try { return call(); }
  catch (error) { record(family, id, false, "successful trace", { name: error?.name, message: error?.message }); return null; }
}

if (model) {
  for (const [scenario, fixture] of Object.entries(FIXTURES.linearSearch)) {
    const id = `linear:${scenario}`, trace = invoke("SEARCH", id, () => model.linearSearchTrace(scenario));
    if (!trace) continue;
    checkTrace("SEARCH", id, trace, true);
    if (scenario === "empty") checkEdgeTransition("SEARCH", id, trace);
    repeatable("SEARCH", id, trace, model.linearSearchTrace(scenario));
    eq("SEARCH", `${id}:identity`, [trace.fixtureId, trace.scenario], [scenario, scenario]);
    eq("SEARCH", `${id}:values`, trace.final.values, fixture.input.values);
    eq("SEARCH", `${id}:target`, trace.final.target, fixture.input.target);
    eq("SEARCH", `${id}:status`, trace.final.status, fixture.expected.status);
    eq("SEARCH", `${id}:returned-index`, trace.final.resultIndex, fixture.expected.returnedIndex);
    eq("SEARCH", `${id}:comparison-count`, trace.final.comparisons, fixture.expected.comparisonCount);
    eq("SEARCH", `${id}:checked-region`, trace.final.checkedIndices, fixture.expected.steps.at(-1)?.checkedAfter ?? []);
    const actualSteps = trace.steps.slice(1).map(item => ({
      index: item.after.currentIndex,
      value: item.after.currentIndex === null ? null : item.after.values[item.after.currentIndex],
      equal: item.after.resultIndex === item.after.currentIndex && item.after.resultIndex !== null,
      checkedAfter: item.after.checkedIndices,
      comparisonCount: item.after.comparisons,
      activeLineId: item.activeRule,
    }));
    const expectedSteps = fixture.expected.steps.map(item => ({ index: item.index, value: item.value, equal: item.equal, checkedAfter: item.checkedAfter, comparisonCount: item.comparisonCount, activeLineId: item.activeLineId }));
    eq("SEARCH", `${id}:exact-transitions`, actualSteps, expectedSteps);
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.binarySearch)) {
    const id = `binary:${scenario}`, trace = invoke("SEARCH", id, () => model.binarySearchTrace(scenario));
    if (!trace) continue;
    checkTrace("SEARCH", id, trace, true);
    if (scenario === "empty" || scenario === "unsorted-near-miss") checkEdgeTransition("SEARCH", id, trace);
    repeatable("SEARCH", id, trace, model.binarySearchTrace(scenario));
    const expectedStatus = fixture.expected.status === "precondition-failed" ? "blocked-unsorted" : fixture.expected.status;
    eq("SEARCH", `${id}:status`, trace.final.status, expectedStatus);
    eq("SEARCH", `${id}:returned-index`, trace.final.resultIndex, fixture.expected.returnedIndex);
    eq("SEARCH", `${id}:comparison-count`, trace.final.comparisons, fixture.expected.comparisonCount);
    const actualSteps = trace.steps.slice(1).map(item => {
      const newlyDiscarded = item.after.discarded.filter(index => !item.before.discarded.includes(index));
      return {
        low: item.before.low,
        high: item.before.high,
        mid: item.after.middle,
        value: item.after.comparedValue,
        relation: item.event === "terminal" ? item.after.decision === "precondition-failed" ? "precondition-failed" : "empty-window" : item.after.decision === "equal" ? "equal" : item.after.decision === "discard-left" ? "less-than-target" : "greater-than-target",
        discardedIndices: newlyDiscarded,
        newLow: item.after.low,
        newHigh: item.after.high,
        comparisonCount: item.after.comparisons,
        activeLineId: item.activeRule,
      };
    });
    const expectedSteps = fixture.expected.steps.map(item => ({ low: item.low, high: item.high, mid: item.mid, value: item.value, relation: item.relation, discardedIndices: item.discardedIndices, newLow: item.newLow, newHigh: item.newHigh, comparisonCount: item.comparisonCount, activeLineId: item.activeLineId }));
    eq("SEARCH", `${id}:exact-transitions`, actualSteps, expectedSteps);
  }
  eq("SEARCH", "binary:growth:n-values", FIXTURES.binarySearchGrowth.maxComparisons, FIXTURES.binarySearchGrowth.nValues.map(n => Math.ceil(Math.log2(n + 1))));

  for (const [scenario, fixture] of Object.entries(FIXTURES.bubbleSort)) {
    const id = `bubble:${scenario}`, trace = invoke("SORT", id, () => model.bubbleSortTrace(scenario));
    if (!trace) continue;
    checkTrace("SORT", id, trace, true);
    if (scenario === "empty" || scenario === "singleton") checkEdgeTransition("SORT", id, trace);
    repeatable("SORT", id, trace, model.bubbleSortTrace(scenario));
    eq("SORT", `${id}:final`, trace.final.values, fixture.expected.final);
    eq("SORT", `${id}:comparisons`, trace.final.comparisons, fixture.expected.comparisons);
    eq("SORT", `${id}:swaps`, trace.final.swaps, fixture.expected.swaps);
    const actual = trace.steps.slice(1).map(item => item.after.pair ? {
      event: "compare-swap", pass: item.after.pass, leftIndex: item.after.pair[0], rightIndex: item.after.pair[1],
      arrayBefore: item.before.values, arrayAfter: item.after.values, swap: item.after.swaps > item.before.swaps,
      comparisonCount: item.after.comparisons, swapCount: item.after.swaps, completedStartBefore: item.before.completedFrom,
      activeLineId: item.activeRule,
    } : {
      event: "pass-complete", pass: item.after.pass, arrayAfter: item.after.values, completedStartAfter: item.after.completedFrom,
      swapFlag: item.before.swappedThisPass, activeLineId: item.activeRule,
    });
    const expected = fixture.expected.events.map(item => item.event === "compare-swap" ? {
      event: item.event, pass: item.pass, leftIndex: item.leftIndex, rightIndex: item.rightIndex, arrayBefore: item.arrayBefore,
      arrayAfter: item.arrayAfter, swap: item.swap, comparisonCount: item.comparisonCount, swapCount: item.swapCount,
      completedStartBefore: item.completedStartBefore, activeLineId: item.activeLineId,
    } : { event: item.event, pass: item.pass, arrayAfter: item.arrayAfter, completedStartAfter: item.completedStartAfter, swapFlag: item.swapFlag, activeLineId: item.activeLineId });
    eq("SORT", `${id}:exact-transitions`, actual, expected);
    eq("SORT", `${id}:multiset`, [...trace.final.values].sort((a, b) => a - b), [...fixture.input].sort((a, b) => a - b));
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.insertionSort)) {
    const id = `insertion:${scenario}`, trace = invoke("SORT", id, () => model.insertionSortTrace(scenario));
    if (!trace) continue;
    checkTrace("SORT", id, trace, true);
    if (scenario === "empty" || scenario === "singleton") checkEdgeTransition("SORT", id, trace);
    repeatable("SORT", id, trace, model.insertionSortTrace(scenario));
    eq("SORT", `${id}:final`, trace.final.values, fixture.expected.final);
    eq("SORT", `${id}:comparisons`, trace.final.comparisons, fixture.expected.comparisons);
    eq("SORT", `${id}:shifts`, trace.final.shifts, fixture.expected.shifts);
    const actualEvents = trace.steps.slice(1).map(item => ({ event: item.event, activeLineId: item.activeRule, before: item.before.values, after: item.after.values, key: item.before.key ?? item.after.key, compareIndex: item.after.compareIndex, insertionIndex: item.after.insertionIndex, comparisons: item.after.comparisons, shifts: item.after.shifts }));
    const expectedEventNames = fixture.expected.events.map(item => item.event);
    eq("SORT", `${id}:event-sequence`, actualEvents.map(item => item.event), expectedEventNames);
    eq("SORT", `${id}:active-lines`, actualEvents.map(item => item.activeLineId), fixture.expected.events.map(item => item.activeLineId));
    eq("SORT", `${id}:multiset`, trace.final.values.filter(value => value !== null).sort((a, b) => a - b), [...fixture.input].sort((a, b) => a - b));
    ok("SORT", `${id}:saved-key-visible`, trace.steps.every(item => item.after.values.includes(null) ? item.after.key !== null : true), true);
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.stack)) {
    const id = `stack:${scenario}`, trace = invoke("ADT", id, () => model.stackTrace(scenario));
    if (!trace) continue;
    checkTrace("ADT", id, trace, true);
    if (scenario === "empty") checkEdgeTransition("ADT", id, trace);
    repeatable("ADT", id, trace, model.stackTrace(scenario));
    eq("ADT", `${id}:capacity`, trace.final.capacity, fixture.expected.capacity);
    eq("ADT", `${id}:final-core`, { cells: trace.final.cells, top: trace.final.top, size: trace.final.size }, fixture.expected.final);
    const actual = trace.steps.slice(1).map(item => ({ operation: item.after.operation.split(" ")[0].toLowerCase(), activeLineId: item.activeRule, before: { cells: item.before.cells, top: item.before.top, size: item.before.size }, after: { cells: item.after.cells, top: item.after.top, size: item.after.size }, returned: item.after.returned, error: item.after.error, committed: item.after.committed }));
    const expected = fixture.expected.events.map(item => ({ operation: item.operation, activeLineId: item.activeLineId, before: item.before, after: item.after, returned: item.returned, error: item.error, committed: item.committed }));
    eq("ADT", `${id}:exact-transitions`, actual, expected);
    const capacityClaim = trace.steps[0].outcome.en.match(/\b(\d+|one|two|three|four|five|six)\b/i)?.[0]?.toLowerCase();
    const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const claimed = capacityClaim ? (words[capacityClaim] ?? Number(capacityClaim)) : null;
    eq("ADT", `${id}:narrated-capacity`, claimed, fixture.input.capacity);
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.queue)) {
    const id = `queue:${scenario}`, trace = invoke("ADT", id, () => model.queueTrace(scenario));
    if (!trace) continue;
    checkTrace("ADT", id, trace, true);
    if (scenario === "empty") checkEdgeTransition("ADT", id, trace);
    repeatable("ADT", id, trace, model.queueTrace(scenario));
    eq("ADT", `${id}:final-core`, { cells: trace.final.cells, front: trace.final.front, rear: trace.final.rear, count: trace.final.count, logicalOrder: trace.final.logicalOrder }, fixture.expected.final);
    const actual = trace.steps.slice(1).map(item => ({ operation: item.after.operation.split(" ")[0].toLowerCase(), activeLineId: item.activeRule, before: { cells: item.before.cells, front: item.before.front, rear: item.before.rear, count: item.before.count }, after: { cells: item.after.cells, front: item.after.front, rear: item.after.rear, count: item.after.count }, returned: item.after.returned, error: item.after.error, committed: item.after.committed }));
    const expected = fixture.expected.events.map(item => ({ operation: item.operation, activeLineId: item.activeLineId, before: item.before, after: item.after, returned: item.returned, error: item.error, committed: item.committed }));
    eq("ADT", `${id}:exact-transitions`, actual, expected);
    eq("ADT", `${id}:logical-order`, trace.final.logicalOrder, Array.from({ length: trace.final.count }, (_, index) => trace.final.cells[(trace.final.front + index) % trace.final.capacity]));
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.linkedList)) {
    if (!fixture || typeof fixture !== "object" || Array.isArray(fixture) || !["input", "expected"].every(key => key in fixture)) continue;
    const id = `list:${scenario}`, trace = invoke("ADT", id, () => model.linkedListTrace(scenario));
    if (!trace) continue;
    checkTrace("ADT", id, trace, true);
    if (scenario === "empty-find") checkEdgeTransition("ADT", id, trace);
    repeatable("ADT", id, trace, model.linkedListTrace(scenario));
    const expected = fixture.expected.delete ?? fixture.expected;
    if (expected.nodes) eq("ADT", `${id}:final-structure`, { head: trace.final.head, nodes: trace.final.nodes, reachable: trace.final.reachable }, { head: expected.head, nodes: expected.nodes, reachable: expected.reachable });
    if (expected.status) eq("ADT", `${id}:status`, trace.final.status, expected.status);
    if (fixture.expected.find) {
      const foundStep = trace.steps.find(item => item.activeRule === "LL-F03");
      eq("ADT", `${id}:first-duplicate-find`, { status: foundStep?.after.status, address: foundStep?.after.current, path: foundStep?.after.path }, { status: fixture.expected.find.status, address: fixture.expected.find.address, path: fixture.expected.find.path });
    } else if (!expected.nodes && (fixture.expected.status === "found" || fixture.expected.status === "missing")) {
      eq("ADT", `${id}:find-result`, { status: trace.final.status, address: trace.final.current, path: trace.final.path }, { status: fixture.expected.status, address: fixture.expected.address, path: fixture.expected.path });
    }
    if (expected.returned !== undefined) eq("ADT", `${id}:returned`, trace.final.returned, expected.returned);
    if (scenario === "empty-find") {
      const actualTerminal = trace.steps.slice(1).map(item => ({
        event: item.event,
        activeLineId: item.activeRule,
        previous: item.after.previous,
        current: item.after.current,
        data: item.after.nodes.find(node => node.address === item.after.current)?.data ?? null,
        equal: item.after.status === "found",
        next: item.after.nodes.find(node => node.address === item.after.current)?.next ?? -1,
      }));
      eq("ADT", `${id}:exact-terminal-transition`, actualTerminal, fixture.expected.steps);
      ok("ADT", `${id}:all-records-unallocated`, trace.final.nodes.every(node => node.allocated === false && node.data === null && node.next === -1), true);
    }
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.binaryTree)) {
    if (!fixture || typeof fixture !== "object" || Array.isArray(fixture) || !("expected" in fixture)) continue;
    const id = `tree:${scenario}`, trace = invoke("ADT", id, () => model.binaryTreeTrace(scenario));
    if (!trace) continue;
    checkTrace("ADT", id, trace, true);
    repeatable("ADT", id, trace, model.binaryTreeTrace(scenario));
    const expected = fixture.expected;
    eq("ADT", `${id}:status`, trace.final.status, expected.status);
    eq("ADT", `${id}:path`, trace.final.path, expected.path);
    if (expected.nodes) eq("ADT", `${id}:structure`, { root: trace.final.root, nodes: trace.final.nodes, insertedId: trace.final.insertedId, parentId: trace.final.parentId, side: trace.final.side }, { root: expected.root, nodes: expected.nodes, insertedId: expected.insertedId, parentId: expected.parentId, side: expected.side });
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.dictionary)) {
    if (!fixture || typeof fixture !== "object" || Array.isArray(fixture) || !("expected" in fixture)) continue;
    const id = `dictionary:${scenario}`, trace = invoke("ADT", id, () => model.dictionaryTrace(scenario));
    if (!trace) continue;
    checkTrace("ADT", id, trace, true);
    repeatable("ADT", id, trace, model.dictionaryTrace(scenario));
    const expectedEvent = fixture.expected.events.at(-1);
    eq("ADT", `${id}:final`, { entries: trace.final.entries, status: trace.final.status, returned: trace.final.returned }, { entries: fixture.expected.final, status: expectedEvent.status, returned: expectedEvent.returned });
    eq("ADT", `${id}:unique-keys`, new Set(trace.final.entries.map(item => item.key)).size, trace.final.entries.length);
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.adtImplementation)) {
    const id = `adt-implementation:${scenario}`, trace = invoke("ADT", id, () => model.adtImplementationTrace(scenario));
    if (!trace) continue;
    checkTrace("ADT", id, trace, false);
    repeatable("ADT", id, trace, model.adtImplementationTrace(scenario));
    if (fixture.externalOperation) eq("ADT", `${id}:external-operation`, trace.final.externalOperation, fixture.externalOperation);
    if (fixture.observableResult) eq("ADT", `${id}:observable-result`, trace.final.observableResult, fixture.observableResult);
    if (fixture.invariant) eq("ADT", `${id}:invariant`, trace.final.invariant, fixture.invariant);
    if (fixture.internalSteps?.every(item => typeof item === "string")) eq("ADT", `${id}:internal-steps`, trace.final.internalSteps, fixture.internalSteps);
    ok("ADT", `${id}:complete`, trace.final.status === "complete", "complete");
  }

  const directStackInput = { cells: [null, null], capacity: 2, top: -1, size: 0, operation: "—", returned: null, error: null, committed: null, status: "empty" };
  const directStackBefore = structuredClone(directStackInput);
  const directStackOutput = invoke("ADT", "direct-stack:push", () => model.applyStackOperation(directStackInput, "PUSH", 7));
  if (directStackOutput) {
    eq("ADT", "direct-stack:input-not-mutated", directStackInput, directStackBefore);
    eq("ADT", "direct-stack:exact-output", { cells: directStackOutput.cells, top: directStackOutput.top, size: directStackOutput.size, returned: directStackOutput.returned, error: directStackOutput.error, committed: directStackOutput.committed }, { cells: [7, null], top: 0, size: 1, returned: null, error: null, committed: true });
    ok("ADT", "direct-stack:deep-frozen-output", deeplyFrozen(directStackOutput), true);
  }

  const directQueueInput = { cells: [null, "A", null, null], capacity: 4, front: 1, rear: 2, count: 1, logicalOrder: ["A"], operation: "—", returned: null, error: null, committed: null, wrapped: false };
  const directQueueBefore = structuredClone(directQueueInput);
  const directQueueOutput = invoke("ADT", "direct-queue:dequeue-last-with-moved-pointers", () => model.applyQueueOperation(directQueueInput, "DEQUEUE"));
  if (directQueueOutput) {
    eq("ADT", "direct-queue:input-not-mutated", directQueueInput, directQueueBefore);
    eq("ADT", "direct-queue:no-silent-empty-reset", { cells: directQueueOutput.cells, front: directQueueOutput.front, rear: directQueueOutput.rear, count: directQueueOutput.count, logicalOrder: directQueueOutput.logicalOrder, returned: directQueueOutput.returned }, { cells: [null, null, null, null], front: 2, rear: 2, count: 0, logicalOrder: [], returned: "A" });
    ok("ADT", "direct-queue:deep-frozen-output", deeplyFrozen(directQueueOutput), true);
  }

  const invalidADT = [
    ["stack:unknown-op", () => model.applyStackOperation({ cells: [1], capacity: 1, top: 0, size: 1, operation: "—", returned: null, error: null, committed: null, status: "full" }, "REMOVE")],
    ["stack:nonfinite", () => model.applyStackOperation({ cells: [null], capacity: 1, top: -1, size: 0, operation: "—", returned: null, error: null, committed: null, status: "empty" }, "PUSH", Number.NaN)],
    ["queue:unknown-op", () => model.applyQueueOperation({ cells: [1], capacity: 1, front: 0, rear: 0, count: 1, logicalOrder: [1], operation: "—", returned: null, error: null, committed: null, wrapped: false }, "REMOVE")],
    ["queue:nonfinite", () => model.applyQueueOperation({ cells: [null], capacity: 1, front: 0, rear: 0, count: 0, logicalOrder: [], operation: "—", returned: null, error: null, committed: null, wrapped: false }, "ENQUEUE", Number.NaN)],
    ["list:dangling", () => model.validateLinkedListState(0, [{ address: 0, data: 1, next: 9, allocated: true }])],
    ["list:cycle", () => model.validateLinkedListState(0, [{ address: 0, data: 1, next: 0, allocated: true }])],
    ["tree:ordering", () => model.validateBinaryTree("n5", [{ id: "n5", value: 5, left: "n9", right: null }, { id: "n9", value: 9, left: null, right: null }])],
    ["tree:dangling", () => model.validateBinaryTree("n5", [{ id: "n5", value: 5, left: "n1", right: null }])],
    ["dictionary:duplicate-key", () => model.validateDictionaryEntries([{ key: "x", value: "1" }, { key: "x", value: "2" }])],
  ];
  for (const [id, call] of invalidADT) expectRangeError("ADT", `invalid:${id}`, call);

  for (const [scenario, fixture] of Object.entries(FIXTURES.complexity)) {
    const nValues = fixture.nValues;
    for (const [nIndex, n] of nValues.entries()) {
      const id = `complexity:${scenario}:n${n}`, trace = invoke("COMPLEXITY", id, () => model.complexityComparison(scenario, n));
      if (!trace) continue;
      checkTrace("COMPLEXITY", id, trace, false);
      repeatable("COMPLEXITY", id, trace, model.complexityComparison(scenario, n));
      ok("COMPLEXITY", `${id}:metric-not-seconds`, /not seconds|không phải giây/i.test(trace.final.metric), "explicitly not seconds");
      let expectedCounts;
      if (scenario === "search-worst-case") {
        expectedCounts = [fixture.linear.counts[nIndex], fixture.binary.counts[nIndex]];
        eq("COMPLEXITY", `${id}:exact-counts`, trace.final.rows.map(item => item.exactTime), expectedCounts);
        eq("COMPLEXITY", `${id}:time-classes`, trace.final.rows.map(item => item.timeBigO), [fixture.linear.timeBigO, fixture.binary.timeBigO]);
        eq("COMPLEXITY", `${id}:space-classes`, trace.final.rows.map(item => item.spaceBigO), [fixture.linear.extraSpaceBigO, fixture.binary.extraSpaceBigO]);
      } else if (scenario === "bubble-order-impact") {
        expectedCounts = [fixture.sorted.comparisonCounts[nIndex], fixture.reverse.comparisonCounts[nIndex]];
        eq("COMPLEXITY", `${id}:exact-counts`, trace.final.rows.map(item => item.exactTime), expectedCounts);
        eq("COMPLEXITY", `${id}:time-classes`, trace.final.rows.map(item => item.timeBigO), [fixture.sorted.timeClassForThisImplementation, fixture.reverse.timeClass]);
      } else if (scenario === "insertion-order-impact") {
        expectedCounts = [fixture.sorted.comparisonCounts[nIndex], fixture.reverse.comparisonCounts[nIndex]];
        eq("COMPLEXITY", `${id}:exact-counts`, trace.final.rows.map(item => item.exactTime), expectedCounts);
        eq("COMPLEXITY", `${id}:time-classes`, trace.final.rows.map(item => item.timeBigO), [fixture.sorted.timeClass, fixture.reverse.timeClass]);
      } else {
        expectedCounts = [fixture.recursive.frameCounts[nIndex], fixture.iterative.auxiliaryCounts[nIndex]];
        eq("COMPLEXITY", `${id}:exact-metric`, trace.final.rows.map(item => item.exactTime), expectedCounts);
        eq("COMPLEXITY", `${id}:factorial-space-metric`, trace.final.metric, "auxiliary storage units — not seconds");
        eq("COMPLEXITY", `${id}:time-classes`, trace.final.rows.map(item => item.timeBigO), [fixture.recursive.timeBigO, fixture.iterative.timeBigO]);
        eq("COMPLEXITY", `${id}:space-classes`, trace.final.rows.map(item => item.spaceBigO), [fixture.recursive.auxiliarySpaceBigO, fixture.iterative.auxiliarySpaceBigO]);
      }
      const expectedSpace = scenario === "factorial-space" ? expectedCounts : [1, 1];
      eq("COMPLEXITY", `${id}:exact-space`, trace.final.rows.map(item => item.exactSpace), expectedSpace);
      eq("COMPLEXITY", `${id}:chart-point-at-n`, trace.final.chart.find(point => point.n === n)?.values, expectedCounts);
      eq("COMPLEXITY", `${id}:chart-row-parity`, trace.final.chart.find(point => point.n === n)?.values, trace.final.rows.map(item => item.exactTime));
    }
    const firstN = nValues[0], lastN = nValues.at(-1);
    const first = invoke("COMPLEXITY", `complexity:${scenario}:reacts-to-n:first`, () => model.complexityComparison(scenario, firstN));
    const last = invoke("COMPLEXITY", `complexity:${scenario}:reacts-to-n:last`, () => model.complexityComparison(scenario, lastN));
    if (first && last) ok("COMPLEXITY", `complexity:${scenario}:reacts-to-n`, stable(first.final.rows.map(item => item.exactTime)) !== stable(last.final.rows.map(item => item.exactTime)), `exact metric changes from n=${firstN} to n=${lastN}`);
  }
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, 0, -1, 1.5, 65]) expectRangeError("COMPLEXITY", `invalid:n:${String(value)}`, () => model.complexityComparison("search-worst-case", value));

  for (const [scenario, fixture] of Object.entries(FIXTURES.recursion)) {
    const id = `recursion:${scenario}`, trace = invoke("RECURSION", id, () => model.recursionTrace(scenario));
    if (!trace) continue;
    const requireIds = !scenario.startsWith("broken");
    checkTrace("RECURSION", id, trace, requireIds);
    repeatable("RECURSION", id, trace, model.recursionTrace(scenario));
    eq("RECURSION", `${id}:status`, trace.final.status, fixture.status);
    eq("RECURSION", `${id}:result`, trace.final.result, fixture.result ?? null);
    eq("RECURSION", `${id}:executed-calls`, trace.final.executedCalls, fixture.executedCalls ?? fixture.calls?.length ?? 0);
    eq("RECURSION", `${id}:max-depth`, trace.final.maxDepth, fixture.maxDepth ?? 0);
    if (fixture.calls) {
      const actualCalls = trace.final.callOrder.map(item => ({ depth: item.depth, base: item.base, activeLineId: trace.steps.find(step => step.after.activeCall?.id === item.id)?.activeRule }));
      const expectedCalls = fixture.calls.map(item => ({ depth: item.depth, base: item.base, activeLineId: item.activeLineId }));
      eq("RECURSION", `${id}:call-order`, actualCalls, expectedCalls);
      eq("RECURSION", `${id}:return-values`, trace.final.returnOrder.map(item => item.returned), fixture.returns.map(item => item.returned));
    } else {
      eq("RECURSION", `${id}:error-code`, trace.final.errorCode, fixture.errorCode);
      eq("RECURSION", `${id}:blocked-zero-calls`, trace.final.executedCalls, 0);
      eq("RECURSION", `${id}:pseudocode`, trace.pseudocode, fixture.pseudocode);
      ok("RECURSION", `${id}:blocked-call-visible`, trace.pseudocode.some(line => line.includes(`RETURN n * ${fixture.blockedCall}`)), fixture.blockedCall);
      ok("RECURSION", `${id}:repair-call-visible`, trace.pseudocode.some(line => line.includes(`REPAIR: replace ${fixture.blockedCall} with ${fixture.repairCall}`)), fixture.repairCall);
      ok("RECURSION", `${id}:repair-guidance`, typeof trace.final.repair === "string" && trace.final.repair.trim().length > 0, "non-empty repair guidance");
    }
  }

  for (const [scenario, fixture] of Object.entries(FIXTURES.callStack)) {
    if (scenario === "separationRule") continue;
    const id = `call-stack:${scenario}`, trace = invoke("RECURSION", id, () => model.callStackTrace(scenario));
    if (!trace) continue;
    checkTrace("RECURSION", id, trace, true);
    repeatable("RECURSION", id, trace, model.callStackTrace(scenario));
    eq("RECURSION", `${id}:result`, trace.final.result, fixture.result);
    eq("RECURSION", `${id}:final-stack`, trace.final.frames, fixture.finalStack);
    const actualEvents = trace.steps.slice(1).map(item => ({ event: item.event, activeLineId: item.activeRule, n: item.after.frames.at(-1)?.argument ?? item.before.frames.at(-1)?.argument, poppedFrameId: item.after.poppedFrameId, childResultReceived: item.after.childResultReceived, returned: item.after.returned, frames: item.after.frames }));
    eq("RECURSION", `${id}:event-types`, actualEvents.map(item => item.event), fixture.events.map(item => item.event));
    eq("RECURSION", `${id}:active-lines`, actualEvents.map(item => item.activeLineId), fixture.events.map(item => item.activeLineId));
    eq("RECURSION", `${id}:returned-sequence`, actualEvents.filter(item => item.event !== "push-frame").map(item => item.returned), fixture.events.filter(item => item.event !== "push-frame").map(item => item.returned));
    for (const expected of fixture.events.filter(item => item.event !== "push-frame")) {
      const actual = trace.steps.find(item => item.after.poppedFrameId === expected.poppedFrameId);
      eq("RECURSION", `${id}:${expected.poppedFrameId}:child-result`, actual?.after.childResultReceived, expected.childResultReceived);
      eq("RECURSION", `${id}:${expected.poppedFrameId}:frames-after`, actual?.after.frames, expected.after);
    }
  }

  for (const [family, calls] of Object.entries({
    SEARCH: [["linear", () => model.linearSearchTrace("unknown")], ["binary", () => model.binarySearchTrace("unknown")]],
    SORT: [["bubble", () => model.bubbleSortTrace("unknown")], ["insertion", () => model.insertionSortTrace("unknown")]],
    ADT: [["stack", () => model.stackTrace("unknown")], ["queue", () => model.queueTrace("unknown")], ["list", () => model.linkedListTrace("unknown")], ["tree", () => model.binaryTreeTrace("unknown")], ["dictionary", () => model.dictionaryTrace("unknown")], ["adt-implementation", () => model.adtImplementationTrace("unknown")]],
    COMPLEXITY: [["scenario", () => model.complexityComparison("unknown")]],
    RECURSION: [["recursion", () => model.recursionTrace("unknown")], ["call-stack", () => model.callStackTrace("unknown")]],
  })) for (const [id, call] of calls) expectRangeError(family, `invalid:unknown-${id}`, call);
}

if (loadFailure) for (const family of Object.keys(families)) record(family, "model-import", false, "importable TypeScript production model", loadFailure);

let buildId = null;
try { buildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim(); } catch { /* Authoring checks may run before build. */ }
if (process.env.PAPER3_EXPECTED_BUILD_ID) for (const family of Object.keys(families)) eq(family, "binding:expected-build-id", buildId, process.env.PAPER3_EXPECTED_BUILD_ID);
if (modelSha256) {
  const after = await hashFile(modelPath);
  for (const family of Object.keys(families)) eq(family, "binding:model-source-stable", after, modelSha256);
}

const reportFiles = {
  SEARCH: "QA_SEARCH_RESULT.json", SORT: "QA_SORT_RESULT.json", ADT: "QA_ADT_RESULT.json",
  COMPLEXITY: "QA_COMPLEXITY_RESULT.json", RECURSION: "QA_RECURSION_RESULT.json",
};
const fixtureSha256 = await hashFile(path.join(EVIDENCE, "MODEL_FIXTURES.json"));
const contractSha256 = await hashFile(path.join(EVIDENCE, "SECTION19_MODEL_CONTRACTS.json"));
const oracleContractSha256 = await hashFile(path.join(EVIDENCE, "SECTION19_QA_ORACLES.json"));
await mkdir(EVIDENCE, { recursive: true });
let failed = false;
for (const [family, state] of Object.entries(families)) {
  const failures = state.checks.filter(item => !item.pass);
  const report = {
    schemaVersion: 1,
    gate: `paper3-section19-${family.toLowerCase()}-models`,
    startedAt,
    completedAt: new Date().toISOString(),
    decision: failures.length ? "FAIL" : "PASS",
    sourceRoot: ROOT,
    sourceBoundToIsolatedPreview: ROOT !== AUTHORING_ROOT,
    buildId,
    expectedBuildId: process.env.PAPER3_EXPECTED_BUILD_ID ?? null,
    modelFile: MODEL_FILE,
    modelSha256,
    fixtureSha256,
    contractSha256,
    oracleContractSha256,
    assertions: state.assertions,
    failures,
    independence: ORACLE_CONTRACT.independence,
    limitations: ["Finite deterministic syllabus fixtures; browser rendering and lesson prose are separate gates."],
    checks: state.checks,
  };
  await writeFile(path.join(EVIDENCE, reportFiles[family]), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ family, decision: report.decision, assertions: report.assertions, failures: failures.length, buildId, modelSha256 }));
  failed ||= failures.length > 0;
}
if (failed) process.exitCode = 1;
