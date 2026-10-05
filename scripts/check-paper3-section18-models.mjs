import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section18");
const FIXTURES = JSON.parse(await readFile(path.join(EVIDENCE_DIR, "MODEL_FIXTURES.json"), "utf8"));
const MODEL_FILE = "app/lib/paper3/ai-models.ts";
const EPSILON = FIXTURES.numericPolicy.internalTolerance;
const startedAt = new Date().toISOString();
const checks = [];
let assertions = 0;

const record = (id, pass, expected, actual) => { assertions += 1; checks.push({ id, pass: Boolean(pass), expected, actual }); };
const eq = (id, actual, expected) => record(id, JSON.stringify(actual) === JSON.stringify(expected), expected, actual);
const near = (id, actual, expected) => record(id, typeof actual === "number" && Math.abs(actual - expected) <= EPSILON, expected, actual);
const deeplyFrozen = value => value === null || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(deeplyFrozen));
const sha256 = async file => createHash("sha256").update(await readFile(file)).digest("hex");

function checkTrace(id, trace) {
  record(`${id}:deep-frozen`, deeplyFrozen(trace), true, deeplyFrozen(trace));
  record(`${id}:has-steps`, Array.isArray(trace.steps) && trace.steps.length > 0, true, trace.steps?.length);
  for (let index = 0; index < (trace.steps?.length ?? 0); index += 1) {
    const step = trace.steps[index];
    for (const field of ["title", "action", "why", "outcome"]) for (const locale of ["en", "vi"]) record(`${id}:step-${index}:${field}.${locale}`, typeof step[field]?.[locale] === "string" && step[field][locale].trim().length > 0, "non-empty", step[field]?.[locale]);
    if (index > 0) eq(`${id}:continuity-${index}`, step.before, trace.steps[index - 1].after);
  }
}

function compareNumericArray(id, actual, expected) {
  eq(`${id}:length`, actual?.length, expected.length);
  expected.forEach((value, index) => near(`${id}:${index}`, actual?.[index], value));
}

const sourcePath = path.join(ROOT, MODEL_FILE);
let model = null, loadFailure = null, modelSha256 = null;
try {
  modelSha256 = await sha256(sourcePath);
  model = await import(`${pathToFileURL(sourcePath).href}?qa=${modelSha256}`);
} catch (error) { loadFailure = error.stack ?? String(error); }

if (model) {
  const validRendererGraph = { ...structuredClone(FIXTURES.graphSearch.dijkstra.primary.graph), nodes: FIXTURES.graphSearch.dijkstra.primary.graph.nodes.map((node, index) => ({ ...node, x: index * 10, y: index * 7 })) };
  eq("graph:valid-primary", model.validateGraphFixture(validRendererGraph), true);
  let negativeRejected = false;
  const negativeRendererGraph = { ...structuredClone(FIXTURES.graphSearch.invalid.negativeEdge), nodes: FIXTURES.graphSearch.invalid.negativeEdge.nodes.map((node, index) => ({ ...node, label: node.label ?? node.id, x: index * 10, y: index * 7 })) };
  try { model.validateGraphFixture(negativeRendererGraph); } catch (error) { negativeRejected = error instanceof RangeError; }
  record("graph:reject-negative", negativeRejected, "RangeError", negativeRejected ? "RangeError" : "did not throw RangeError");
  const malformedGraphs = [
    ["directed-not-boolean", graph => { graph.directed = "false"; }],
    ["empty-node-label", graph => { graph.nodes[0].label = " "; }],
    ["nonfinite-node-x", graph => { graph.nodes[0].x = Number.POSITIVE_INFINITY; }],
    ["nonfinite-node-y", graph => { graph.nodes[0].y = Number.NaN; }],
  ];
  for (const [id, mutate] of malformedGraphs) {
    const graph = structuredClone(validRendererGraph); mutate(graph);
    let rejected = false; try { model.validateGraphFixture(graph); } catch (error) { rejected = error instanceof RangeError; }
    record(`graph:reject-${id}`, rejected, "RangeError", rejected ? "RangeError" : "accepted malformed graph");
  }

  for (const [scenario, item] of Object.entries(FIXTURES.graphSearch.dijkstra)) {
    const trace = model.dijkstraTrace(scenario), expected = item.expected, final = trace.final;
    eq(`dijkstra:${scenario}:identity`, [trace.fixtureId, trace.algorithm], [scenario, "dijkstra"]);
    for (const key of ["status", "selectedOrder", "path", "cost", "predecessors", "distances"]) eq(`dijkstra:${scenario}:${key}`, final[key], expected[key]);
    if (expected.equalRelaxation) {
      const rejected = trace.steps.find(step => step.after?.candidateDecision === "rejected-equal");
      record(`dijkstra:${scenario}:equal-rejected`, Boolean(rejected), true, rejected?.after?.candidateDecision);
      eq(`dijkstra:${scenario}:predecessor-retained`, final.predecessors.G, expected.equalRelaxation.retainedPredecessor);
    }
    for (const step of trace.steps.filter(item => item.after?.candidateDecision === "accepted")) {
      const current = step.after.currentNodeId;
      const expectedFrontier = Object.keys(step.after.distances).filter(id => id !== current && !step.after.settledIds.includes(id) && step.after.distances[id] !== null).sort((a, b) => step.after.distances[a] - step.after.distances[b] || a.localeCompare(b));
      eq(`dijkstra:${scenario}:${step.id}:frontier-immediate`, step.after.frontierIds, expectedFrontier);
    }
    checkTrace(`dijkstra:${scenario}`, trace);
  }

  for (const [scenario, item] of Object.entries(FIXTURES.graphSearch.aStar)) {
    const trace = model.aStarTrace(scenario), expected = item.expected, final = trace.final;
    eq(`astar:${scenario}:identity`, [trace.fixtureId, trace.algorithm], [scenario, "astar"]);
    for (const key of ["status", "selectedOrder", "path", "cost", "predecessors", "gScores", "hScores", "fScores", "optimalityClaim"]) eq(`astar:${scenario}:${key}`, final[key], expected[key]);
    if (expected.equalRelaxation) {
      record(`astar:${scenario}:equal-rejected`, trace.steps.some(step => step.after?.candidateDecision === "rejected-equal"), true, trace.steps.map(step => step.after?.candidateDecision));
      eq(`astar:${scenario}:predecessor-retained`, final.predecessors.G, expected.equalRelaxation.retainedPredecessor);
    }
    if (scenario === "inadmissible") {
      eq("astar:inadmissible:reference-path", final.referenceShortestPath, expected.referenceShortestPath);
      eq("astar:inadmissible:reference-cost", final.referenceShortestCost, expected.referenceShortestCost);
    }
    checkTrace(`astar:${scenario}`, trace);
  }

  for (const item of FIXTURES.learningCategories) {
    const trace = model.learningCategoryTrace(item.id), final = trace.final;
    for (const key of ["labelsOrTargets", "environmentInteraction", "feedbackType", "requiredOutcome", "expectedCategory", "nearMissCategory"]) eq(`learning:${item.id}:${key}`, final[key], item[key]);
    eq(`learning:${item.id}:nearMissReason.en`, final.nearMissReason?.en, item.nearMissReason.en);
    record(`learning:${item.id}:nearMissReason.vi`, typeof final.nearMissReason?.vi === "string" && final.nearMissReason.vi.trim().length > 15, "non-empty reviewed VI explanation", final.nearMissReason?.vi);
    checkTrace(`learning:${item.id}`, trace);
  }

  for (const [depth, network] of Object.entries(FIXTURES.neuralInference.networks)) for (const [preset, expected] of Object.entries(network.expected)) {
    const trace = model.neuralInferenceTrace(depth, preset), final = trace.final;
    eq(`neural:${depth}:${preset}:mode`, final.mode, "inference");
    eq(`neural:${depth}:${preset}:inputs`, final.inputs, FIXTURES.neuralInference.inputPresets[preset]);
    eq(`neural:${depth}:${preset}:weights-fixed`, final.weightsChanged, false);
    record(`neural:${depth}:${preset}:weights-fixed-all-states`, trace.steps.every(step => step.after.weightsChanged === false), true, trace.steps.map(step => step.after.weightsChanged));
    eq(`neural:${depth}:${preset}:layer-count`, final.layers?.length, expected.layerOutputs.length + 1);
    eq(`neural:${depth}:${preset}:input-layer`, final.layers?.[0]?.values, FIXTURES.neuralInference.inputPresets[preset]);
    expected.layerOutputs.forEach((outputs, layerIndex) => compareNumericArray(`neural:${depth}:${preset}:layer-${layerIndex}`, final.layers?.[layerIndex + 1]?.values, outputs));
    near(`neural:${depth}:${preset}:prediction`, final.prediction, expected.prediction);
    eq(`neural:${depth}:${preset}:class`, final.predictedClass, expected.predictedClass);
    let priorLayerId = "input";
    let priorValues = [...FIXTURES.neuralInference.inputPresets[preset]];
    const expectedConnections = [];
    const expectedCalculations = [];
    for (const layer of network.layers) {
      const outputs = layer.weights.map((weights, nodeIndex) => {
        const nodeId = `${layer.id}-${nodeIndex + 1}`;
        const contributions = weights.map((weight, sourceIndex) => {
          const sourceNodeId = `${priorLayerId}-${sourceIndex + 1}`;
          expectedConnections.push({ id: `${sourceNodeId}->${nodeId}`, fromLayerId: priorLayerId, fromNodeId: sourceNodeId, toLayerId: layer.id, toNodeId: nodeId, weight });
          return { sourceNodeId, sourceValue: priorValues[sourceIndex], weight, contribution: Math.round(priorValues[sourceIndex] * weight * 1e10) / 1e10 };
        });
        const weightedSum = Math.round(contributions.reduce((sum, item) => sum + item.contribution, layer.biases[nodeIndex]) * 1e10) / 1e10;
        const activation = layer.activation === "relu" ? "relu" : "identity";
        const activationOutput = Math.round((activation === "relu" ? Math.max(0, weightedSum) : weightedSum) * 1e10) / 1e10;
        expectedCalculations.push({ nodeId, layerId: layer.id, bias: layer.biases[nodeIndex], contributions, weightedSum, activation, activationOutput });
        return activationOutput;
      });
      priorLayerId = layer.id; priorValues = outputs;
    }
    eq(`neural:${depth}:${preset}:connections`, final.connections, expectedConnections);
    eq(`neural:${depth}:${preset}:node-calculations`, final.nodeCalculations, expectedCalculations);
    record(`neural:${depth}:${preset}:progressive-calculations`, trace.steps.slice(0, -1).every(step => step.after.nodeCalculations.every(calculation => step.after.layers.some(layer => layer.id === calculation.layerId))), true, trace.steps.map(step => ({ id: step.id, layers: step.after.layers.map(layer => layer.id), nodes: step.after.nodeCalculations.map(item => item.nodeId) })));
    checkTrace(`neural:${depth}:${preset}`, trace);
  }

  for (const [scenario, item] of Object.entries(FIXTURES.backpropagation.scenarios)) {
    const trace = model.backpropagationTrace(scenario), final = trace.final, expected = item.expected;
    eq(`backprop:${scenario}:step-ids`, trace.steps.map(step => step.id), FIXTURES.backpropagation.stepIds);
    eq(`backprop:${scenario}:mode`, final.mode, "training");
    eq(`backprop:${scenario}:iteration`, final.iteration, expected.iteration);
    eq(`backprop:${scenario}:old-weight`, final.oldWeight, item.oldWeight);
    for (const key of ["newWeight", "oldPrediction", "newPrediction", "oldError", "newError", "oldSquaredError", "newSquaredError"]) near(`backprop:${scenario}:${key}`, final[key], expected[key]);
    eq(`backprop:${scenario}:error-reduced`, final.errorReduced, expected.errorReduced);
    eq(`backprop:${scenario}:iteration-direction-sequence`, trace.steps.map(step => [step.after.iteration, step.after.direction]), [[1, "forward"], [1, "forward"], [1, "compare"], [1, "compare"], [1, "backward"], [1, "backward"], [2, "forward"], [2, "compare"]]);
    const visibility = trace.steps.map(step => ({ oldPrediction: step.after.oldPrediction !== null, oldError: step.after.oldError !== null, oldSquaredError: step.after.oldSquaredError !== null, newWeight: step.after.newWeight !== null, newPrediction: step.after.newPrediction !== null, newError: step.after.newError !== null, newSquaredError: step.after.newSquaredError !== null }));
    eq(`backprop:${scenario}:progressive-visibility`, visibility, [
      { oldPrediction: false, oldError: false, oldSquaredError: false, newWeight: false, newPrediction: false, newError: false, newSquaredError: false },
      { oldPrediction: true, oldError: false, oldSquaredError: false, newWeight: false, newPrediction: false, newError: false, newSquaredError: false },
      { oldPrediction: true, oldError: false, oldSquaredError: false, newWeight: false, newPrediction: false, newError: false, newSquaredError: false },
      { oldPrediction: true, oldError: true, oldSquaredError: true, newWeight: false, newPrediction: false, newError: false, newSquaredError: false },
      { oldPrediction: true, oldError: true, oldSquaredError: true, newWeight: false, newPrediction: false, newError: false, newSquaredError: false },
      { oldPrediction: true, oldError: true, oldSquaredError: true, newWeight: true, newPrediction: false, newError: false, newSquaredError: false },
      { oldPrediction: true, oldError: true, oldSquaredError: true, newWeight: true, newPrediction: true, newError: false, newSquaredError: false },
      { oldPrediction: true, oldError: true, oldSquaredError: true, newWeight: true, newPrediction: true, newError: true, newSquaredError: true },
    ]);
    checkTrace(`backprop:${scenario}`, trace);
  }

  const energy = FIXTURES.regression.datasets.energy;
  for (const predictionX of energy.predictionPresets) {
    const trace = model.regressionTrace("energy", predictionX), final = trace.final, predictionExpected = energy.expected.predictions[String(predictionX)];
    eq(`regression:${predictionX}:dataset`, final.datasetId, "energy"); eq(`regression:${predictionX}:points`, final.points, energy.points);
    near(`regression:${predictionX}:slope`, final.slope, energy.expected.slope); near(`regression:${predictionX}:intercept`, final.intercept, energy.expected.intercept); near(`regression:${predictionX}:sse`, final.sse, energy.expected.sse);
    compareNumericArray(`regression:${predictionX}:fitted`, final.fittedValues, energy.expected.fittedValues); compareNumericArray(`regression:${predictionX}:residuals`, final.residuals, energy.expected.residuals);
    near(`regression:${predictionX}:prediction-y`, final.predictionY, predictionExpected.y); eq(`regression:${predictionX}:range`, final.observedRange, energy.expected.observedRange); eq(`regression:${predictionX}:extrapolation`, final.extrapolation, predictionExpected.extrapolation); eq(`regression:${predictionX}:output`, final.outputType, "continuous");
    eq(`regression:${predictionX}:stages`, trace.steps.map(step => ({ id: step.id, stage: step.after.stage, fit: step.after.slope !== null && step.after.sse !== null, prediction: step.after.predictionY !== null })), [
      { id: "inspect-pairs", stage: "inspect", fit: false, prediction: false },
      { id: "fit-model", stage: "fit", fit: true, prediction: false },
      { id: "predict", stage: "predict", fit: true, prediction: true },
    ]);
    checkTrace(`regression:${predictionX}`, trace);
  }
  const baselineRegression = model.regressionTrace("energy", 3.5, "baseline").final;
  const movedRegression = model.regressionTrace("energy", 3.5, "moved").final;
  const addedRegression = model.regressionTrace("energy", 3.5, "added").final;
  record("regression:point-presets-change-fit", movedRegression.slope !== baselineRegression.slope && addedRegression.slope !== baselineRegression.slope && movedRegression.sse !== baselineRegression.sse && addedRegression.residuals.length === 5, "Moved/added points deterministically change fit and residuals", { baseline: baselineRegression, moved: movedRegression, added: addedRegression });
  eq("regression:baseline-change-semantics", [baselineRegression.changedPointId, baselineRegression.previousFit], [null, null]);
  eq("regression:moved-change-semantics", [movedRegression.changedPointId, movedRegression.previousFit], ["P4", { slope: baselineRegression.slope, intercept: baselineRegression.intercept, sse: baselineRegression.sse }]);
  eq("regression:added-change-semantics", [addedRegression.changedPointId, addedRegression.previousFit], ["P5", { slope: baselineRegression.slope, intercept: baselineRegression.intercept, sse: baselineRegression.sse }]);

  const viNarration = [
    ...Object.keys(FIXTURES.graphSearch.dijkstra).flatMap(id => model.dijkstraTrace(id).steps),
    ...Object.keys(FIXTURES.graphSearch.aStar).flatMap(id => model.aStarTrace(id).steps),
    ...FIXTURES.learningCategories.flatMap(item => model.learningCategoryTrace(item.id).steps),
    ...["shallow", "deep"].flatMap(depth => ["standard", "alternate"].flatMap(preset => model.neuralInferenceTrace(depth, preset).steps)),
    ...Object.keys(FIXTURES.backpropagation.scenarios).flatMap(id => model.backpropagationTrace(id).steps),
  ].map(step => step.outcome.vi).join("\n");
  const forbiddenViNarration = ["rejected-higher", "rejected-equal", "skipped-settled", "not-considered", "continuous-target", "no-target-pattern", "reward-penalty", "target-label", "lớp positive", "lớp negative", "giảm: true", "giảm: false"];
  record("localization:vi-narration-no-raw-enums", forbiddenViNarration.every(token => !viNarration.includes(token)), "No raw enum or boolean token in Vietnamese trace outcomes", forbiddenViNarration.filter(token => viNarration.includes(token)));

  const invalidCalls = [
    ["unknown-dijkstra", () => model.dijkstraTrace("unknown")], ["unknown-astar", () => model.aStarTrace("unknown")], ["unknown-learning", () => model.learningCategoryTrace("unknown")],
    ["unknown-depth", () => model.neuralInferenceTrace("unknown", "standard")], ["unknown-input", () => model.neuralInferenceTrace("shallow", "unknown")], ["unknown-backprop", () => model.backpropagationTrace("unknown")],
    ["unknown-regression", () => model.regressionTrace("unknown", 3.5)], ["nonfinite-regression", () => model.regressionTrace("energy", Number.NaN)],
    ["regression-below-domain", () => model.regressionTrace("energy", -0.1)], ["regression-above-domain", () => model.regressionTrace("energy", 7.1)], ["unknown-regression-preset", () => model.regressionTrace("energy", 3.5, "unknown")],
  ];
  for (const [id, call] of invalidCalls) { let pass = false; try { call(); } catch (error) { pass = error instanceof RangeError; } record(`input:${id}`, pass, "RangeError", pass ? "RangeError" : "not RangeError"); }
}

const buildIdPath = path.join(ROOT, ".next/BUILD_ID");
let buildId = null;
try { buildId = (await readFile(buildIdPath, "utf8")).trim(); } catch { /* authoring model gate */ }
if (process.env.PAPER3_EXPECTED_BUILD_ID) eq("binding:expected-build-id", buildId, process.env.PAPER3_EXPECTED_BUILD_ID);
if (loadFailure) checks.unshift({ id: "model-import", pass: false, expected: "importable ai-models.ts", actual: loadFailure });
const failures = checks.filter(check => !check.pass);
const report = {
  schemaVersion: 1, gate: "paper3-section18-independent-models", startedAt, completedAt: new Date().toISOString(), decision: failures.length ? "FAIL" : "PASS",
  assertions, failures, sourceRoot: ROOT, sourceBoundToIsolatedPreview: ROOT !== AUTHORING_ROOT, buildId, modelFile: MODEL_FILE, modelSha256,
  fixtureSha256: await sha256(path.join(EVIDENCE_DIR, "MODEL_FIXTURES.json")),
  oracle: "QA-owned explicit expected tables from MODEL_FIXTURES.json; production outputs are never used to derive expectations.",
  coverage: { dijkstraScenarios: 3, aStarScenarios: 3, learningScenarios: 4, neuralRuns: 4, backpropagationScenarios: 2, regressionPredictions: 2, invalidInputCases: 13 },
  limitations: ["Finite Cambridge-scope teaching models only; browser rendering and lesson prose are checked by separate gates."], checks,
};
await mkdir(EVIDENCE_DIR, { recursive: true });
await writeFile(path.join(EVIDENCE_DIR, "QA_MODELS_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (report.decision !== "PASS") process.exitCode = 1;
