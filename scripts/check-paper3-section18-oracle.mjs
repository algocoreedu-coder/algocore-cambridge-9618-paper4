import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section18");
const FIXTURE_FILE = path.join(EVIDENCE_DIR, "MODEL_FIXTURES.json");

export const lessons = Object.freeze([
  Object.freeze({ topicId: "P3-18.1-T01", slug: "graphs-and-dijkstra", kind: "dijkstra-search" }),
  Object.freeze({ topicId: "P3-18.1-T02", slug: "a-star-and-heuristic-search", kind: "astar-search" }),
  Object.freeze({ topicId: "P3-18.1-T03", slug: "learning-categories", kind: "learning-categories" }),
  Object.freeze({ topicId: "P3-18.1-T04", slug: "neural-networks-and-deep-learning", kind: "neural-network" }),
  Object.freeze({ topicId: "P3-18.1-T05", slug: "backpropagation", kind: "backpropagation" }),
  Object.freeze({ topicId: "P3-18.1-T06", slug: "regression", kind: "regression" }),
]);

export const section18CandidateFiles = Object.freeze([
  "app/paper-3/topics/[slug]/page.tsx",
  "app/lib/paper3/catalog.ts",
  "app/lib/paper3/ai-models.ts",
  "app/lib/paper3/lesson-types.ts",
  "app/lib/paper3/lesson-registry.ts",
  "app/components/paper3-learning/shared.tsx",
  "app/components/paper3-learning/StudyMap.tsx",
  "app/components/paper3-learning/SectionOverview.tsx",
  "app/components/paper3-learning/TopicPreview.tsx",
  "app/components/paper3-learning/lessons/VisualStage.tsx",
  "app/components/paper3-learning/lessons/LessonPage.tsx",
  "app/components/paper3-learning/lessons/CambridgeVisualPrimer.tsx",
  "app/components/paper3-learning/lessons/Section15VisualPrimitives.tsx",
  "app/components/paper3-learning/lessons/Section18AIWorkbench.tsx",
  "app/components/paper3-learning/lessons/Section18AIWorkbench.module.css",
  "content/paper3/study-map.json",
  "content/paper3/lesson-status.json",
  ...lessons.map(({ slug }) => `content/paper3/lessons/${slug}.json`),
]);

const fixtures = JSON.parse(await readFile(FIXTURE_FILE, "utf8"));
const EPSILON = fixtures.numericPolicy.internalTolerance;
const lex = (a, b) => a.localeCompare(b, "en", { sensitivity: "variant" });
const close = (a, b) => a === b || (typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= EPSILON);
const numericObjectEqual = (actual, expected) => Object.keys(expected).every(key => expected[key] === null ? actual[key] === null : close(actual[key], expected[key]));

function validateGraph(graph, heuristics = null) {
  const ids = graph.nodes.map(node => node.id);
  if (new Set(ids).size !== ids.length || !ids.includes(graph.startId) || !ids.includes(graph.goalId)) throw new RangeError("invalid graph node identity");
  const edgeIds = graph.edges.map(edge => edge.id);
  if (new Set(edgeIds).size !== edgeIds.length) throw new RangeError("duplicate edge ID");
  const pairs = new Set();
  for (const edge of graph.edges) {
    if (!ids.includes(edge.from) || !ids.includes(edge.to) || edge.from === edge.to || !Number.isFinite(edge.weight) || edge.weight < 0) throw new RangeError("invalid edge");
    const pair = graph.directed ? `${edge.from}>${edge.to}` : [edge.from, edge.to].sort(lex).join("~");
    if (pairs.has(pair)) throw new RangeError("parallel edge");
    pairs.add(pair);
  }
  if (heuristics) for (const id of ids) if (!Number.isFinite(heuristics[id]) || heuristics[id] < 0) throw new RangeError("invalid heuristic");
}

function adjacency(graph) {
  const byNode = Object.fromEntries(graph.nodes.map(node => [node.id, []]));
  for (const edge of graph.edges) {
    byNode[edge.from].push({ edgeId: edge.id, node: edge.to, weight: edge.weight });
    if (!graph.directed) byNode[edge.to].push({ edgeId: edge.id, node: edge.from, weight: edge.weight });
  }
  for (const rows of Object.values(byNode)) rows.sort((a, b) => lex(a.node, b.node) || lex(a.edgeId, b.edgeId));
  return byNode;
}

function reconstruct(predecessors, start, goal) {
  if (start === goal) return [start];
  if (predecessors[goal] === null) return [];
  const pathResult = [goal];
  const seen = new Set(pathResult);
  while (pathResult[0] !== start) {
    const prior = predecessors[pathResult[0]];
    if (prior === null || seen.has(prior)) throw new Error("invalid predecessor chain");
    seen.add(prior);
    pathResult.unshift(prior);
  }
  return pathResult;
}

function choose(open, score) {
  return [...open].sort((a, b) => score[a] - score[b] || lex(a, b))[0];
}

export function oracleDijkstra(graph) {
  validateGraph(graph);
  const ids = graph.nodes.map(node => node.id);
  const distances = Object.fromEntries(ids.map(id => [id, null]));
  const predecessors = Object.fromEntries(ids.map(id => [id, null]));
  const settled = new Set(), frontier = new Set([graph.startId]), selectedOrder = [], relaxations = [];
  distances[graph.startId] = 0;
  const adj = adjacency(graph);
  while (frontier.size) {
    const current = choose(frontier, distances);
    frontier.delete(current); settled.add(current); selectedOrder.push(current);
    if (current === graph.goalId) break;
    for (const edge of adj[current]) {
      if (settled.has(edge.node)) continue;
      const candidate = distances[current] + edge.weight;
      const previous = distances[edge.node];
      const decision = previous === null || candidate < previous ? "accepted" : candidate === previous ? "rejected-equal" : "rejected-higher";
      relaxations.push({ from: current, to: edge.node, candidate, previous, decision });
      if (decision === "accepted") { distances[edge.node] = candidate; predecessors[edge.node] = current; frontier.add(edge.node); }
    }
  }
  const pathResult = reconstruct(predecessors, graph.startId, graph.goalId);
  return { status: pathResult.length ? "path-found" : "no-path", selectedOrder, path: pathResult, cost: pathResult.length ? distances[graph.goalId] : null, distances, predecessors, relaxations };
}

export function oracleAStar(graph, heuristics) {
  validateGraph(graph, heuristics);
  const ids = graph.nodes.map(node => node.id);
  const gScores = Object.fromEntries(ids.map(id => [id, null]));
  const fScores = Object.fromEntries(ids.map(id => [id, null]));
  const predecessors = Object.fromEntries(ids.map(id => [id, null]));
  const open = new Set([graph.startId]), closed = new Set(), selectedOrder = [], relaxations = [];
  gScores[graph.startId] = 0; fScores[graph.startId] = heuristics[graph.startId];
  const adj = adjacency(graph);
  while (open.size) {
    const current = choose(open, fScores);
    open.delete(current); closed.add(current); selectedOrder.push(current);
    if (current === graph.goalId) break;
    for (const edge of adj[current]) {
      if (closed.has(edge.node)) continue;
      const candidateG = gScores[current] + edge.weight;
      const previousG = gScores[edge.node];
      const decision = previousG === null || candidateG < previousG ? "accepted" : candidateG === previousG ? "rejected-equal" : "rejected-higher";
      relaxations.push({ from: current, to: edge.node, candidateG, previousG, h: heuristics[edge.node], f: candidateG + heuristics[edge.node], decision });
      if (decision === "accepted") { gScores[edge.node] = candidateG; fScores[edge.node] = candidateG + heuristics[edge.node]; predecessors[edge.node] = current; open.add(edge.node); }
    }
  }
  const pathResult = reconstruct(predecessors, graph.startId, graph.goalId);
  return { status: pathResult.length ? "path-found" : "no-path", selectedOrder, path: pathResult, cost: pathResult.length ? gScores[graph.goalId] : null, gScores, hScores: { ...heuristics }, fScores, predecessors, relaxations };
}

function forwardNetwork(network, inputs) {
  let values = [...inputs];
  const layerOutputs = [];
  for (const layer of network.layers) {
    values = layer.weights.map((weights, row) => {
      const net = weights.reduce((sum, weight, index) => sum + weight * values[index], layer.biases[row]);
      return layer.activation === "relu" ? Math.max(0, net) : net;
    });
    layerOutputs.push([...values]);
  }
  return { layerOutputs, prediction: values[0] };
}

function fitRegression(points, predictionX) {
  if (!Number.isFinite(predictionX) || points.length < 2) throw new RangeError("invalid regression input");
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (Math.abs(denominator) <= EPSILON) throw new RangeError("zero x variance");
  const slope = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator;
  const intercept = meanY - slope * meanX;
  const fittedValues = points.map(point => slope * point.x + intercept);
  const residuals = points.map((point, index) => point.y - fittedValues[index]);
  const sse = residuals.reduce((sum, value) => sum + value ** 2, 0);
  const range = [Math.min(...points.map(point => point.x)), Math.max(...points.map(point => point.x))];
  return { slope, intercept, fittedValues, residuals, sse, predictionY: slope * predictionX + intercept, observedRange: range, extrapolation: predictionX < range[0] || predictionX > range[1] };
}

function runSelfTests() {
  let assertions = 0;
  const eq = (actual, expected, message) => { assertions += 1; assert.deepEqual(actual, expected, message); };
  const ok = (actual, message) => { assertions += 1; assert.ok(actual, message); };
  const near = (actual, expected, message) => { assertions += 1; assert.ok(close(actual, expected), `${message}: expected ${expected}, got ${actual}`); };

  for (const [id, item] of Object.entries(fixtures.graphSearch.dijkstra)) {
    const actual = oracleDijkstra(item.graph), expected = item.expected;
    eq(actual.status, expected.status, `Dijkstra ${id} status`);
    eq(actual.selectedOrder, expected.selectedOrder, `Dijkstra ${id} selected order`);
    eq(actual.path, expected.path, `Dijkstra ${id} path`);
    eq(actual.cost, expected.cost, `Dijkstra ${id} cost`);
    eq(actual.distances, expected.distances, `Dijkstra ${id} distances`);
    eq(actual.predecessors, expected.predecessors, `Dijkstra ${id} predecessors`);
    if (expected.relaxations) eq(actual.relaxations, expected.relaxations, `Dijkstra ${id} relaxations`);
    if (expected.equalRelaxation) eq(actual.relaxations.find(row => row.decision === "rejected-equal"), { from: expected.equalRelaxation.from, to: expected.equalRelaxation.to, candidate: expected.equalRelaxation.candidate, previous: expected.equalRelaxation.previous, decision: expected.equalRelaxation.decision }, `Dijkstra ${id} equal relaxation`);
  }

  for (const [id, item] of Object.entries(fixtures.graphSearch.aStar)) {
    const referencedId = item.graphRef?.split(".").at(-2);
    const graph = item.graph ?? fixtures.graphSearch.dijkstra[referencedId]?.graph;
    const actual = oracleAStar(graph, item.heuristics), expected = item.expected;
    eq(actual.status, expected.status, `A* ${id} status`); eq(actual.selectedOrder, expected.selectedOrder, `A* ${id} order`);
    eq(actual.path, expected.path, `A* ${id} path`); eq(actual.cost, expected.cost, `A* ${id} cost`);
    eq(actual.gScores, expected.gScores, `A* ${id} g`); eq(actual.hScores, expected.hScores, `A* ${id} h`); eq(actual.fScores, expected.fScores, `A* ${id} f`); eq(actual.predecessors, expected.predecessors, `A* ${id} predecessors`);
    if (expected.relaxations) eq(actual.relaxations, expected.relaxations, `A* ${id} relaxations`);
    if (expected.equalRelaxation) ok(actual.relaxations.some(row => row.from === "B" && row.to === "G" && row.decision === "rejected-equal"), "A* tie rejects equal relaxation");
  }
  assert.throws(() => oracleDijkstra(fixtures.graphSearch.invalid.negativeEdge), RangeError); assertions += 1;

  const categories = Object.fromEntries(fixtures.learningCategories.map(item => [item.id, item.expectedCategory]));
  eq(categories, { "labelled-energy-regression": "supervised", "unlabelled-shopper-groups": "unsupervised", "warehouse-agent-reward": "reinforcement", "labelled-robot-images": "supervised" }, "learning-category truth table");
  ok(fixtures.learningCategories.every(item => item.nearMissCategory !== item.expectedCategory && item.nearMissReason.en.length > 20 && item.nearMissReason.vi.length > 15), "every category scenario has a meaningful bilingual near miss");

  for (const [depth, network] of Object.entries(fixtures.neuralInference.networks)) for (const [preset, expected] of Object.entries(network.expected)) {
    const actual = forwardNetwork(network, fixtures.neuralInference.inputPresets[preset]);
    eq(actual.layerOutputs.length, expected.layerOutputs.length, `${depth}/${preset} layer count`);
    actual.layerOutputs.forEach((layer, layerIndex) => layer.forEach((value, valueIndex) => near(value, expected.layerOutputs[layerIndex][valueIndex], `${depth}/${preset} layer ${layerIndex}/${valueIndex}`)));
    near(actual.prediction, expected.prediction, `${depth}/${preset} prediction`);
    eq(actual.prediction >= fixtures.neuralInference.threshold ? "positive" : "negative", expected.predictedClass, `${depth}/${preset} class`);
  }

  for (const [id, item] of Object.entries(fixtures.backpropagation.scenarios)) {
    const oldPrediction = item.input * item.oldWeight, oldError = item.target - oldPrediction;
    const weightDelta = item.learningRate * oldError * item.input, newWeight = item.oldWeight + weightDelta;
    const newPrediction = item.input * newWeight, newError = item.target - newPrediction;
    const actual = { iteration: 2, oldPrediction, oldError, oldSquaredError: oldError ** 2, weightDelta, newWeight, newPrediction, newError, newSquaredError: newError ** 2, errorReduced: newError ** 2 < oldError ** 2 };
    for (const [key, expected] of Object.entries(item.expected)) typeof expected === "number" ? near(actual[key], expected, `${id}/${key}`) : eq(actual[key], expected, `${id}/${key}`);
  }

  const energy = fixtures.regression.datasets.energy;
  for (const predictionX of energy.predictionPresets) {
    const actual = fitRegression(energy.points, predictionX), expected = energy.expected;
    near(actual.slope, expected.slope, `regression ${predictionX} slope`); near(actual.intercept, expected.intercept, `regression ${predictionX} intercept`); near(actual.sse, expected.sse, `regression ${predictionX} SSE`);
    actual.fittedValues.forEach((value, index) => near(value, expected.fittedValues[index], `regression ${predictionX} fitted ${index}`));
    actual.residuals.forEach((value, index) => near(value, expected.residuals[index], `regression ${predictionX} residual ${index}`));
    near(actual.predictionY, expected.predictions[String(predictionX)].y, `regression ${predictionX} prediction`); eq(actual.extrapolation, expected.predictions[String(predictionX)].extrapolation, `regression ${predictionX} extrapolation`);
  }
  assert.throws(() => fitRegression(fixtures.regression.invalidZeroVariance, 3), RangeError); assertions += 1;
  assert.throws(() => fitRegression(energy.points, Number.NaN), RangeError); assertions += 1;
  ok(numericObjectEqual({ a: 0.30000000000000004 }, { a: 0.3 }), "numeric tolerance handles harmless binary floating-point noise");
  return assertions;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const startedAt = new Date().toISOString();
  let decision = "PASS", assertions = 0, failure = null;
  try { assertions = runSelfTests(); } catch (error) { decision = "FAIL"; failure = error.stack ?? String(error); }
  const report = {
    schemaVersion: 1, gate: "paper3-section18-independent-oracle", startedAt, completedAt: new Date().toISOString(), decision, assertions,
    fixtureCounts: { dijkstraScenarios: 3, aStarScenarios: 3, learningScenarios: 4, neuralRuns: 4, backpropagationScenarios: 2, regressionPredictions: 2, invalidCases: 3 },
    independence: "Expected tables are explicit in QA-owned MODEL_FIXTURES.json and recomputed by this independent script; no production model or renderer is imported.",
    fixtureFile: FIXTURE_FILE, failure,
    limitations: ["Finite syllabus teaching fixtures only; not a general graph-search or production machine-learning validation suite."],
  };
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await writeFile(path.join(EVIDENCE_DIR, "QA_ORACLE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (decision !== "PASS") process.exitCode = 1;
}
