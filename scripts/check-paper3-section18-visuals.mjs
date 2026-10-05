import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section18");
const startedAt = new Date().toISOString();
const checks = [];
const record = (id, pass, expected, actual) => checks.push({ id, pass: Boolean(pass), expected, actual });
const sha = data => createHash("sha256").update(data).digest("hex");

let component = "", css = "", model = null, loadFailure = null;
try {
  component = await readFile(path.join(ROOT, "app/components/paper3-learning/lessons/Section18AIWorkbench.tsx"), "utf8");
  css = await readFile(path.join(ROOT, "app/components/paper3-learning/lessons/Section18AIWorkbench.module.css"), "utf8");
  model = await import(`${pathToFileURL(path.join(ROOT, "app/lib/paper3/ai-models.ts")).href}?visual=${Date.now()}`);
} catch (error) { loadFailure = error.stack ?? String(error); }

if (component && css && model) {
  for (const kind of ["dijkstra-search", "astar-search", "learning-categories", "neural-network", "backpropagation", "regression"]) record(`root:${kind}`, component.includes(`data-visual-kind="${kind}"`), `data-visual-kind="${kind}"`, component.includes(`data-visual-kind="${kind}"`));
  for (const selector of ["data-ai-previous", "data-ai-next", "data-ai-reset", "data-ai-jump", "data-ai-scenario"]) record(`control:${selector}`, component.includes(selector), selector, component.includes(selector));
  for (const token of ["role=\"status\"", "data-state-fallback", "aria-live", "StateControls", "StateTable"]) record(`semantic:${token}`, component.includes(token), token, component.includes(token));
  for (const token of ["data-search-update", "data-dijkstra-prediction", "data-dijkstra-reveal", "data-astar-comparison-table", "data-connection-id", "data-neural-node", "data-training-iteration", "data-flow=\"forward\"", "data-flow=\"backward\"", "data-backprop-fallback", "data-regression-comparison", "data-regression-comparison-fallback", "data-regression-fit-change", "data-changed-point-id", "data-point-state", "data-residual-id", "data-regression-region", "data-axis-tick", "axisMarkerId", "predictionScenario === \"custom\""]) record(`section18:${token}`, component.includes(token), token, component.includes(token));
  record("regression:dynamic-preset-boundary", !/four fixed pairs|bốn cặp cố định/i.test(component), "No fixed-four-pair claim when controlled presets change the dataset", !/four fixed pairs|bốn cặp cố định/i.test(component));
  record("graph:svg-description", /<title>|aria-label=|aria-labelledby=/.test(component), "accessible SVG name/description", /<title>|aria-label=|aria-labelledby=/.test(component));
  record("css:reduced-motion", css.includes("prefers-reduced-motion: reduce"), true, css.includes("prefers-reduced-motion: reduce"));
  record("css:focus-visible", css.includes(":focus-visible"), true, css.includes(":focus-visible"));
  record("css:mobile", /@media\s*\([^)]*max-width/.test(css), "responsive max-width media rule", /@media\s*\([^)]*max-width/.test(css));
  record("css:overflow", /overflow(?:-x)?:\s*(?:auto|clip)/.test(css), "controlled overflow", /overflow(?:-x)?:\s*(?:auto|clip)/.test(css));

  const dijkstraPrimary = model.dijkstraTrace("primary"), dijkstraTie = model.dijkstraTrace("tie"), aStarPrimary = model.aStarTrace("primary"), aStarLimit = model.aStarTrace("inadmissible");
  record("state:dijkstra-primary", dijkstraPrimary.final.path.join("-") === "S-B-D-G" && dijkstraPrimary.final.cost === 7, "S-B-D-G / 7", { path: dijkstraPrimary.final.path, cost: dijkstraPrimary.final.cost });
  record("state:dijkstra-frontier-immediate", dijkstraPrimary.steps.filter(step => step.after.candidateDecision === "accepted").every(step => {
    const current = step.after.currentNodeId;
    const expected = Object.keys(step.after.distances).filter(id => id !== current && !step.after.settledIds.includes(id) && step.after.distances[id] !== null).sort((a, b) => step.after.distances[a] - step.after.distances[b] || a.localeCompare(b));
    return JSON.stringify(step.after.frontierIds) === JSON.stringify(expected);
  }), "Every accepted relaxation immediately recomputes sorted frontier", dijkstraPrimary.steps.filter(step => step.after.candidateDecision === "accepted").map(step => ({ id: step.id, frontier: step.after.frontierIds })));
  record("state:dijkstra-tie", dijkstraTie.final.predecessors.G === "A" && dijkstraTie.steps.some(step => step.after?.candidateDecision === "rejected-equal"), "equal route rejected; predecessor A retained", dijkstraTie.final);
  record("state:astar-primary", aStarPrimary.final.path.join("-") === "S-B-D-G" && aStarPrimary.final.selectedOrder.join("-") === "S-B-D-G", "guided order and path S-B-D-G", aStarPrimary.final);
  record("state:astar-boundary", aStarLimit.final.cost === 10 && aStarLimit.final.referenceShortestCost === 6 && aStarLimit.final.optimalityClaim === "none-inadmissible-boundary-demo", "boundary returns 10 while reference is 6 and makes no optimality claim", aStarLimit.final);
  record("state:learning-scenarios", ["labelled-energy-regression", "unlabelled-shopper-groups", "warehouse-agent-reward", "labelled-robot-images"].every(id => model.learningCategoryTrace(id).final.expectedCategory), "four reviewed learning scenarios", "loaded");
  const shallowStandard = model.neuralInferenceTrace("shallow", "standard"), deepStandard = model.neuralInferenceTrace("deep", "standard");
  record("state:neural-inputs", shallowStandard.final.prediction === 0.6 && model.neuralInferenceTrace("shallow", "alternate").final.prediction === 0.17, "0.60 and 0.17", [shallowStandard.final.prediction, model.neuralInferenceTrace("shallow", "alternate").final.prediction]);
  record("state:neural-math", shallowStandard.final.connections.length === 2 && shallowStandard.final.nodeCalculations.length === 1 && deepStandard.final.connections.length === 7 && deepStandard.final.nodeCalculations.length === 4 && [...shallowStandard.steps, ...deepStandard.steps].every(step => step.after.weightsChanged === false), "Actual weights and per-node calculations for shallow/deep; weights unchanged", { shallowConnections: shallowStandard.final.connections, shallowCalculations: shallowStandard.final.nodeCalculations, deepConnections: deepStandard.final.connections, deepCalculations: deepStandard.final.nodeCalculations });
  const bp01 = model.backpropagationTrace("bp01"), bp02 = model.backpropagationTrace("bp02");
  record("state:backprop", bp01.final.newWeight === 0.32 && bp02.final.newWeight === 0.6, "BP01 0.32, BP02 0.60", [bp01.final.newWeight, bp02.final.newWeight]);
  record("state:backprop-progressive", bp01.steps[0].after.oldPrediction === null && bp01.steps[1].after.oldPrediction === 0.4 && bp01.steps[1].after.oldError === null && bp01.steps[3].after.oldSquaredError === 0.36 && bp01.steps[6].after.newPrediction === 0.64 && bp01.steps[6].after.newError === null && bp01.steps[7].after.newSquaredError === 0.1296, "Prediction/error/error² are revealed only at their declared stages", bp01.steps.map(step => ({ id: step.id, after: step.after })));
  record("state:backprop-directions", JSON.stringify(bp01.steps.map(step => [step.after.iteration, step.after.direction])) === JSON.stringify([[1, "forward"], [1, "forward"], [1, "compare"], [1, "compare"], [1, "backward"], [1, "backward"], [2, "forward"], [2, "compare"]]), "Training iteration and forward/backward/compare direction progress explicitly", bp01.steps.map(step => ({ id: step.id, iteration: step.after.iteration, direction: step.after.direction })));
  const interpolation = model.regressionTrace("energy", 3.5), extrapolation = model.regressionTrace("energy", 6);
  record("state:regression", interpolation.final.predictionY === 8.2 && extrapolation.final.extrapolation, "x=3.5 -> 8.2; x=6 extrapolation", [interpolation.final, extrapolation.final]);
  record("state:regression-progressive", interpolation.steps[0].after.slope === null && interpolation.steps[0].after.predictionY === null && interpolation.steps[1].after.slope === 2.2 && interpolation.steps[1].after.sse === 1.8 && interpolation.steps[1].after.predictionY === null && interpolation.steps[2].after.predictionY === 8.2, "inspect hides fit/prediction; fit reveals equation/SSE; predict reveals y", interpolation.steps.map(step => ({ id: step.id, after: step.after })));
  const moved = model.regressionTrace("energy", 3.5, "moved").final, added = model.regressionTrace("energy", 3.5, "added").final;
  record("state:regression-point-controls", moved.slope !== interpolation.final.slope && added.slope !== interpolation.final.slope && added.points.length === 5, "Move/add presets change fitted state", { baseline: interpolation.final, moved, added });
  record("state:regression-change-semantics", interpolation.final.changedPointId === null && interpolation.final.previousFit === null && moved.changedPointId === "P4" && added.changedPointId === "P5" && moved.previousFit?.slope === interpolation.final.slope && added.previousFit?.sse === interpolation.final.sse, "Moved/added presets identify changed point and retain the baseline fit for before→after explanation", { baseline: interpolation.final, moved, added });

  const viOutcomes = [...dijkstraPrimary.steps, ...dijkstraTie.steps, ...aStarPrimary.steps, ...aStarLimit.steps, ...Object.keys(model.learningScenarios).flatMap(id => model.learningCategoryTrace(id).steps), ...shallowStandard.steps, ...deepStandard.steps, ...bp01.steps, ...bp02.steps].map(step => step.outcome.vi).join("\n");
  const forbiddenVi = ["rejected-higher", "rejected-equal", "skipped-settled", "not-considered", "continuous-target", "no-target-pattern", "reward-penalty", "target-label", "lớp positive", "lớp negative", "giảm: true", "giảm: false"];
  record("localization:vi-no-raw-enums", forbiddenVi.every(token => !viOutcomes.includes(token)), "No raw enum/boolean leaks in VI narration", forbiddenVi.filter(token => viOutcomes.includes(token)));
}

if (loadFailure) record("load", false, "model, renderer and styles load", loadFailure);
const failures = checks.filter(check => !check.pass);
const report = {
  schemaVersion: 1, gate: "paper3-section18-static-visual-contract", startedAt, completedAt: new Date().toISOString(), decision: failures.length ? "FAIL" : "PASS",
  sourceRoot: ROOT, sourceBoundToIsolatedPreview: ROOT !== AUTHORING_ROOT, assertions: checks.length, failures,
  hashes: component && css ? { rendererSha256: sha(component), cssSha256: sha(css) } : null,
  checks, limitations: ["Static interaction/accessibility contract; browser behavior, responsive rendering and axe checks belong to QA_BROWSER_RESULT.json."],
};
await mkdir(EVIDENCE_DIR, { recursive: true });
await writeFile(path.join(EVIDENCE_DIR, "QA_VISUALS_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (report.decision !== "PASS") process.exitCode = 1;
