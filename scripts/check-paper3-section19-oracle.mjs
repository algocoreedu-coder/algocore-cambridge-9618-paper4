import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section19");
const FIXTURE_FILE = path.join(EVIDENCE, "MODEL_FIXTURES.json");

export const lessons = Object.freeze([
  ["P3-19.1-T01", "linear-search", "linear-search"],
  ["P3-19.1-T02", "binary-search", "binary-search"],
  ["P3-19.1-T03", "bubble-sort", "bubble-sort"],
  ["P3-19.1-T04", "insertion-sort", "insertion-sort"],
  ["P3-19.1-T05", "stack", "stack-adt"],
  ["P3-19.1-T06", "queue", "queue-adt"],
  ["P3-19.1-T07", "linked-list", "linked-list"],
  ["P3-19.1-T08", "binary-tree", "binary-tree"],
  ["P3-19.1-T09", "dictionary", "dictionary"],
  ["P3-19.1-T10", "implementing-one-adt-with-another", "adt-implementation"],
  ["P3-19.1-T11", "time-and-space-complexity", "complexity-comparator"],
  ["P3-19.2-T01", "designing-and-tracing-recursion", "recursion-trace"],
  ["P3-19.2-T02", "call-stacks-and-unwinding", "call-stack-unwinding"],
].map(([topicId, slug, kind]) => Object.freeze({ topicId, slug, kind })));

export const section19CandidateFiles = Object.freeze([
  "app/paper-3/topics/[slug]/page.tsx",
  "app/lib/paper3/catalog.ts",
  "app/lib/paper3/lesson-types.ts",
  "app/lib/paper3/lesson-registry.ts",
  "app/lib/paper3/computational-thinking-models.ts",
  "app/components/paper3-learning/shared.tsx",
  "app/components/paper3-learning/StudyMap.tsx",
  "app/components/paper3-learning/SectionOverview.tsx",
  "app/components/paper3-learning/TopicPreview.tsx",
  "app/components/paper3-learning/lessons/VisualStage.tsx",
  "app/components/paper3-learning/lessons/LessonPage.tsx",
  "app/components/paper3-learning/lessons/CambridgeVisualPrimer.tsx",
  "app/components/paper3-learning/lessons/Section15VisualPrimitives.tsx",
  "app/components/paper3-learning/lessons/Section19ComputationalWorkbench.tsx",
  "app/components/paper3-learning/lessons/Section19ComputationalWorkbench.module.css",
  "content/paper3/study-map.json",
  "content/paper3/lesson-status.json",
  ...lessons.map(item => `content/paper3/lessons/${item.slug}.json`),
]);

const startedAt = new Date().toISOString();
const fixtures = JSON.parse(await readFile(FIXTURE_FILE, "utf8"));
const checks = [];
let assertions = 0;
const stable = value => JSON.stringify(value);
const project = (actual, expected) => {
  if (Array.isArray(expected)) return expected.map((item, index) => project(actual?.[index], item));
  if (expected && typeof expected === "object") return Object.fromEntries(Object.entries(expected).map(([key, value]) => [key, project(actual?.[key], value)]));
  return actual;
};
const check = (id, pass, expected, actual) => {
  assertions += 1;
  checks.push({ id, pass: Boolean(pass), expected, actual });
};
const eq = (id, actual, expected) => check(id, stable(project(actual, expected)) === stable(expected), expected, actual);

function linear(values, target) {
  const steps = [];
  if (values.length === 0) {
    steps.push({ step: 0, index: null, value: null, comparison: "empty range; return -1", equal: false, checkedAfter: [], comparisonCount: 0, activeLineId: "LS-06" });
    return { status: "missing", returnedIndex: -1, comparisonCount: 0, steps };
  }
  for (let index = 0; index < values.length; index += 1) {
    const equal = values[index] === target;
    steps.push({ step: index, index, value: values[index], comparison: `${values[index]} = ${target}`, equal, checkedAfter: Array.from({ length: index + 1 }, (_, i) => i), comparisonCount: index + 1, activeLineId: equal ? "LS-04" : "LS-05" });
    if (equal) return { status: "found", returnedIndex: index, comparisonCount: index + 1, steps };
  }
  return { status: "missing", returnedIndex: -1, comparisonCount: values.length, steps };
}

function binary(values, target) {
  if (values.some((value, index) => index > 0 && value < values[index - 1])) return {
    status: "precondition-failed", returnedIndex: -1, comparisonCount: 0,
    steps: [{ step: 0, low: 0, high: values.length - 1, mid: null, value: null, relation: "precondition-failed", discardedIndices: [], newLow: 0, newHigh: values.length - 1, comparisonCount: 0, activeLineId: "BS-01" }],
    errorCode: "UNSORTED_INPUT",
  };
  let low = 0, high = values.length - 1, count = 0;
  const steps = [];
  if (values.length === 0) {
    steps.push({ step: 0, low: 0, high: -1, mid: null, value: null, relation: "empty-window", discardedIndices: [], newLow: 0, newHigh: -1, comparisonCount: 0, activeLineId: "BS-07" });
    return { status: "missing", returnedIndex: -1, comparisonCount: 0, steps, terminalBounds: { low: 0, high: -1 } };
  }
  while (low <= high) {
    const oldLow = low, oldHigh = high, mid = Math.floor((low + high) / 2), value = values[mid];
    count += 1;
    if (value === target) {
      steps.push({ step: steps.length, low: oldLow, high: oldHigh, mid, value, relation: "equal", discardedIndices: [], newLow: oldLow, newHigh: oldHigh, comparisonCount: count, activeLineId: "BS-04" });
      return { status: "found", returnedIndex: mid, comparisonCount: count, steps, terminalBounds: { low: oldLow, high: oldHigh } };
    }
    let discardedIndices;
    if (value < target) {
      discardedIndices = Array.from({ length: mid - low + 1 }, (_, i) => low + i);
      low = mid + 1;
    } else {
      discardedIndices = Array.from({ length: high - mid + 1 }, (_, i) => mid + i);
      high = mid - 1;
    }
    steps.push({ step: steps.length, low: oldLow, high: oldHigh, mid, value, relation: value < target ? "less-than-target" : "greater-than-target", discardedIndices, newLow: low, newHigh: high, comparisonCount: count, activeLineId: value < target ? "BS-05" : "BS-06" });
  }
  return { status: "missing", returnedIndex: -1, comparisonCount: count, steps, terminalBounds: { low, high } };
}

function bubble(input) {
  const values = [...input], events = [];
  let comparisons = 0, swaps = 0, passes = 0, earlyExit = false;
  if (values.length < 2) {
    events.push({ event: "pass-complete", pass: 0, arrayAfter: [...values], completedStartAfter: 0, swapFlag: false, activeLineId: "BUB-01" });
    return { final: values, comparisons, swaps, passes, earlyExit, events };
  }
  for (let end = values.length - 1; end > 0; end -= 1) {
    let swapFlag = false;
    passes += 1;
    for (let leftIndex = 0; leftIndex < end; leftIndex += 1) {
      const rightIndex = leftIndex + 1, arrayBefore = [...values], pairBefore = [values[leftIndex], values[rightIndex]], swap = values[leftIndex] > values[rightIndex];
      comparisons += 1;
      if (swap) { [values[leftIndex], values[rightIndex]] = [values[rightIndex], values[leftIndex]]; swaps += 1; swapFlag = true; }
      events.push({ event: "compare-swap", pass: passes, leftIndex, rightIndex, pairBefore, swap, arrayBefore, arrayAfter: [...values], completedStartBefore: end + 1, comparisonCount: comparisons, swapCount: swaps, activeLineId: swap ? "BUB-05" : "BUB-04" });
    }
    events.push({ event: "pass-complete", pass: passes, arrayAfter: [...values], completedStartAfter: !swapFlag || end === 1 ? 0 : end, swapFlag, activeLineId: swapFlag ? "BUB-01" : "BUB-07" });
    if (!swapFlag) { earlyExit = true; break; }
  }
  return { final: values, comparisons, swaps, passes, earlyExit, events };
}

function insertion(input) {
  const values = [...input], events = [];
  let comparisons = 0, shifts = 0, insertions = 0;
  if (values.length < 2) {
    events.push({ event: "terminal", activeLineId: "INS-01", arrayBefore: [...values], arrayAfter: [...values], sortedPrefixEnd: values.length - 1 });
    return { final: values, comparisons, shifts, insertions, stableEqualityRule: "do not shift when value equals key", events };
  }
  for (let outerIndex = 1; outerIndex < values.length; outerIndex += 1) {
    const key = values[outerIndex]; let j = outerIndex - 1;
    events.push({ event: "save-key", outerIndex, key, array: [...values], sortedPrefixEnd: outerIndex - 1, activeLineId: "INS-02" });
    while (j >= 0) {
      comparisons += 1; const greater = values[j] > key;
      events.push({ event: "compare", outerIndex, compareIndex: j, value: values[j], key, greater, array: [...values], comparisonCount: comparisons, activeLineId: "INS-04" });
      if (!greater) break;
      const arrayBefore = [...values]; values[j + 1] = values[j]; shifts += 1;
      events.push({ event: "shift", outerIndex, fromIndex: j, toIndex: j + 1, keySaved: key, arrayBefore, arrayAfter: [...values], shiftCount: shifts, activeLineId: "INS-05" });
      j -= 1;
    }
    values[j + 1] = key; insertions += 1;
    events.push({ event: "insert-key", outerIndex, insertIndex: j + 1, key, arrayAfter: [...values], sortedPrefixEnd: outerIndex, activeLineId: "INS-07" });
  }
  return { final: values, comparisons, shifts, insertions, stableEqualityRule: "do not shift when value equals key", events };
}

function stackOracle(input) {
  const cells = Array(input.capacity).fill(null); let top = -1; const events = [];
  if (input.operations.length === 0) events.push({ operationIndex: 0, operation: "check", activeLineId: "STK-04", argument: null, before: { cells: [...cells], top, size: 0 }, after: { cells: [...cells], top, size: 0 }, returned: null, error: null, committed: false });
  for (let operationIndex = 0; operationIndex < input.operations.length; operationIndex += 1) {
    const [operation, argument = null] = input.operations[operationIndex];
    const before = { cells: [...cells], top, size: top + 1 }; let returned = null, error = null, committed = true;
    let activeLineId;
    if (operation === "push") { if (top === input.capacity - 1) { error = "OVERFLOW"; committed = false; activeLineId = "STK-01"; } else { top += 1; cells[top] = argument; activeLineId = "STK-03"; } }
    else if (operation === "pop") { if (top === -1) { error = "UNDERFLOW"; committed = false; activeLineId = "STK-04"; } else { returned = cells[top]; cells[top] = null; top -= 1; activeLineId = "STK-06"; } }
    else if (operation === "peek") { if (top === -1) { error = "UNDERFLOW"; committed = false; activeLineId = "STK-08"; } else { returned = cells[top]; activeLineId = "STK-09"; } }
    events.push({ operationIndex, operation, activeLineId, argument, before, after: { cells: [...cells], top, size: top + 1 }, returned, error, committed });
  }
  return { capacity: input.capacity, final: { cells, top, size: top + 1 }, events };
}

function queueOracle(input) {
  const cells = Array(input.capacity).fill(null); let front = 0, rear = 0, count = 0; const events = [];
  if (input.operations.length === 0) events.push({ operationIndex: 0, operation: "check", activeLineId: "QUE-06", argument: null, before: { cells: [...cells], front, rear, count }, after: { cells: [...cells], front, rear, count }, returned: null, error: null, committed: false });
  for (let operationIndex = 0; operationIndex < input.operations.length; operationIndex += 1) {
    const [operation, argument = null] = input.operations[operationIndex];
    const before = { cells: [...cells], front, rear, count }; let returned = null, error = null, committed = true;
    let activeLineId;
    if (operation === "enqueue") { if (count === input.capacity) { error = "OVERFLOW"; committed = false; activeLineId = "QUE-01"; } else { cells[rear] = argument; rear = (rear + 1) % input.capacity; count += 1; activeLineId = "QUE-05"; } }
    else if (operation === "dequeue") { if (count === 0) { error = "UNDERFLOW"; committed = false; activeLineId = "QUE-06"; } else { returned = cells[front]; cells[front] = null; front = (front + 1) % input.capacity; count -= 1; activeLineId = "QUE-10"; } }
    const logicalOrder = Array.from({ length: count }, (_, i) => cells[(front + i) % input.capacity]);
    events.push({ operationIndex, operation, activeLineId, argument, before, after: { cells: [...cells], front, rear, count, logicalOrder }, returned, error, committed });
  }
  const logicalOrder = Array.from({ length: count }, (_, i) => cells[(front + i) % input.capacity]);
  return { capacity: input.capacity, final: { cells, front, rear, count, logicalOrder }, events };
}

for (const [id, fixture] of Object.entries(fixtures.linearSearch)) eq(`linear:${id}`, linear(fixture.input.values, fixture.input.target), fixture.expected);
for (const [id, fixture] of Object.entries(fixtures.binarySearch)) eq(`binary:${id}`, binary(fixture.input.values, fixture.input.target), fixture.expected);
for (const [id, fixture] of Object.entries(fixtures.bubbleSort)) eq(`bubble:${id}`, bubble(fixture.input), fixture.expected);
for (const [id, fixture] of Object.entries(fixtures.insertionSort)) eq(`insertion:${id}`, insertion(fixture.input), fixture.expected);
for (const [id, fixture] of Object.entries(fixtures.stack)) eq(`stack:${id}`, stackOracle(fixture.input), fixture.expected);
for (const [id, fixture] of Object.entries(fixtures.queue)) eq(`queue:${id}`, queueOracle(fixture.input), fixture.expected);
eq("queue:no-reset-after-empty", queueOracle({ capacity: 3, operations: [["enqueue", "A"], ["dequeue"]] }).final, { cells: [null, null, null], front: 1, rear: 1, count: 0, logicalOrder: [] });

const reachable = (nodes, head) => {
  const byAddress = new Map(nodes.map(node => [node.address, node])); const seen = []; let current = head;
  while (current !== -1) { if (seen.includes(current) || !byAddress.get(current)?.allocated) return null; seen.push(current); current = byAddress.get(current).next; }
  return seen;
};
for (const [id, fixture] of Object.entries(fixtures.linkedList)) {
  if (!fixture.expected?.nodes) continue;
  eq(`list:${id}:reachable`, reachable(fixture.expected.nodes, fixture.expected.head), fixture.expected.reachable);
}
const emptyListFind = target => {
  const nodes = Array.from({ length: 6 }, (_, address) => ({ address, data: null, next: -1, allocated: false }));
  return {
    status: "missing", head: -1, address: -1, previous: -1, path: [],
    steps: [{ event: "terminal", activeLineId: "LL-F04", previous: -1, current: -1, data: null, equal: false, next: -1 }],
    nodes, reachable: [], target,
  };
};
const emptyListExpected = fixtures.linkedList["empty-find"].expected;
eq("list:empty-find:exact-terminal", emptyListFind(fixtures.linkedList["empty-find"].input.target), { ...emptyListExpected, target: fixtures.linkedList["empty-find"].input.target });
check("list:empty-find:all-records-unallocated", emptyListExpected.nodes.every(node => node.allocated === false && node.data === null && node.next === -1), true, emptyListExpected.nodes);
const treeValid = (nodes, root, low = -Infinity, high = Infinity) => {
  if (root === null) return true;
  const byId = new Map(nodes.map(node => [node.id, node])), node = byId.get(root);
  return Boolean(node && node.value > low && node.value < high && treeValid(nodes, node.left, low, node.value) && treeValid(nodes, node.right, node.value, high));
};
for (const [id, fixture] of Object.entries(fixtures.binaryTree)) if (fixture.expected?.nodes) check(`tree:${id}:ordering`, treeValid(fixture.expected.nodes, fixture.expected.root), true, fixture.expected.nodes);
for (const [id, fixture] of Object.entries(fixtures.dictionary)) if (fixture.expected?.final) check(`dictionary:${id}:unique`, new Set(fixture.expected.final.map(item => item.key)).size === fixture.expected.final.length, true, fixture.expected.final);

for (const [id, fixture] of Object.entries(fixtures.complexity)) {
  if (id === "search-worst-case") {
    eq(`complexity:${id}:linear`, fixture.linear.counts, fixture.nValues);
    eq(`complexity:${id}:binary`, fixture.binary.counts, fixture.nValues.map(n => Math.ceil(Math.log2(n + 1))));
  } else if (id === "bubble-order-impact" || id === "insertion-order-impact") {
    eq(`complexity:${id}:sorted-multi-n`, fixture.sorted.comparisonCounts, fixture.nValues.map(n => Math.max(0, n - 1)));
    eq(`complexity:${id}:reverse-multi-n`, fixture.reverse.comparisonCounts, fixture.nValues.map(n => n * (n - 1) / 2));
  } else {
    eq(`complexity:${id}:recursive-space-multi-n`, fixture.recursive.frameCounts, fixture.nValues.map(n => n + 1));
    eq(`complexity:${id}:iterative-space-multi-n`, fixture.iterative.auxiliaryCounts, fixture.nValues.map(() => 1));
  }
  check(`complexity:${id}:labels`, stable(fixture).includes("O("), true, fixture);
}
eq("recursion:factorial", fixtures.recursion["numeric-factorial-4"].result, 24);
eq("recursion:list-sum", fixtures.recursion["list-sum"].result, fixtures.recursion["list-sum"].input.reduce((sum, value) => sum + value, 0));
for (const id of ["broken-no-progress", "broken-unreachable-base"]) {
  const fixture = fixtures.recursion[id];
  check(`recursion:${id}:blocked`, fixture.status === "blocked-invalid" && fixture.executedCalls === 0, "blocked-invalid with zero executed calls", fixture);
  eq(`recursion:${id}:blocked-call-visible`, fixture.pseudocode.some(line => line.includes(`RETURN n * ${fixture.blockedCall}`)), true);
  eq(`recursion:${id}:repair-call-visible`, fixture.pseudocode.at(-1), `REPAIR: replace ${fixture.blockedCall} with ${fixture.repairCall}`);
}
const callEvents = fixtures.callStack["factorial-4"].events;
eq("call-stack:push-order", callEvents.filter(item => item.event === "push-frame").map(item => item.n), [4, 3, 2, 1, 0]);
eq("call-stack:unwind-order", callEvents.filter(item => item.event !== "push-frame").map(item => item.n), [0, 1, 2, 3, 4]);
eq("call-stack:result", fixtures.callStack["factorial-4"].result, 24);
check("adt:reviewed-mappings", Object.keys(fixtures.adtImplementation).length === 8, 8, Object.keys(fixtures.adtImplementation));
check("graph:adt-only", fixtures.graphADT.forbiddenCore.includes("graph implementation code") && fixtures.graphADT.forbiddenCore.includes("Dijkstra trace") && fixtures.graphADT.forbiddenCore.includes("A* trace"), "graph ADT boundary", fixtures.graphADT.forbiddenCore);

const failures = checks.filter(item => !item.pass);
const report = {
  schemaVersion: 1,
  gate: "paper3-section19-independent-oracle",
  startedAt,
  completedAt: new Date().toISOString(),
  decision: failures.length ? "FAIL" : "PASS",
  assertions,
  failures,
  fixtureCounts: Object.fromEntries(["linearSearch", "binarySearch", "bubbleSort", "insertionSort", "stack", "queue", "linkedList", "binaryTree", "dictionary", "adtImplementation", "complexity", "recursion", "callStack"].map(key => [key, Object.keys(fixtures[key]).filter(id => !["baseState", "policy", "duplicatePolicy", "separationRule"].includes(id)).length])),
  fixtureSha256: createHash("sha256").update(await readFile(FIXTURE_FILE)).digest("hex"),
  independence: "Expected transitions are explicit in QA-owned MODEL_FIXTURES.json and recomputed here without importing the production model or renderer.",
  limitations: ["Finite Cambridge-scope teaching fixtures; browser rendering and learner prose are checked by separate gates."],
  checks,
};
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "QA_ORACLE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
