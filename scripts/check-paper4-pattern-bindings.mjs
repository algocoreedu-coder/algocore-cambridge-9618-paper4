import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper4/exam-readiness-coverage-2026-10-02/evidence/t3");
const BINDING_FILE = "app/components/paper4-learning/patternCheckpointBindings.ts";
const ROUTER_FILE = "app/components/paper4-learning/SixStageLearnerJourney.tsx";
const SUPPLEMENT_FILE = "app/components/paper4-learning/PatternRuntimeSupplement.tsx";

const checks = [];
const failures = [];
function check(id, passed, message, evidence = {}) {
  checks.push({ id, passed, message, evidence });
  if (!passed) failures.push({ id, message, evidence });
}
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }

const [manifestBytes, bindingBytes, routerBytes, supplementBytes] = await Promise.all([
  readFile(path.join(ROOT, "app/data/paper4-v2/course-manifest.json")),
  readFile(path.join(ROOT, BINDING_FILE)),
  readFile(path.join(ROOT, ROUTER_FILE)),
  readFile(path.join(ROOT, SUPPLEMENT_FILE)),
]);
const manifest = JSON.parse(manifestBytes.toString("utf8"));
const bindingSource = bindingBytes.toString("utf8");
const routerSource = routerBytes.toString("utf8");
const supplementSource = supplementBytes.toString("utf8");
const bindingPattern = /\b(normal|runtime)\("([A-Z0-9_]+)",\s*"([a-z0-9-]+)",\s*"([a-z0-9-]+)"(?:,\s*(\d+))?\)/g;
const bindings = [...bindingSource.matchAll(bindingPattern)].map((match) => ({
  factory: match[1], patternId: match[2], lessonSlug: match[3], surface: match[4], stepIndex: match[5] === undefined ? null : Number(match[5]),
}));
const manifestByPattern = new Map(manifest.patterns.map((pattern) => [pattern.pattern_id, pattern]));
const boundIds = bindings.map((binding) => binding.patternId);
const manifestIds = manifest.patterns.map((pattern) => pattern.pattern_id);
const duplicates = boundIds.filter((id, index) => boundIds.indexOf(id) !== index);
const missing = manifestIds.filter((id) => !boundIds.includes(id));
const extra = boundIds.filter((id) => !manifestByPattern.has(id));
check("T3-01", bindings.length === 58 && manifest.patterns.length === 58, "Binding registry and canonical manifest each contain 58 patterns.", { bindings: bindings.length, manifest: manifest.patterns.length });
check("T3-02", duplicates.length === 0 && missing.length === 0 && extra.length === 0, "Binding IDs equal the canonical official pattern set exactly once.", { duplicates, missing, extra });

const ownershipErrors = bindings.flatMap((binding) => {
  const metadata = manifestByPattern.get(binding.patternId);
  return metadata?.owner_lesson_slug === binding.lessonSlug ? [] : [{ pattern_id: binding.patternId, binding_owner: binding.lessonSlug, canonical_owner: metadata?.owner_lesson_slug ?? null }];
});
check("T3-03", ownershipErrors.length === 0, "Every binding uses the canonical owner lesson.", { errors: ownershipErrors });

const projectionErrors = [];
for (const binding of bindings.filter((item) => item.factory === "normal")) {
  const projectionPath = path.join(ROOT, `app/data/paper4-v2/learner-projections/${binding.lessonSlug}.json`);
  try {
    const projection = JSON.parse(await readFile(projectionPath, "utf8"));
    const stepCount = projection.stages?.trace?.steps?.length ?? 0;
    if (!Number.isInteger(binding.stepIndex) || binding.stepIndex < 0 || binding.stepIndex >= stepCount) projectionErrors.push({ pattern_id: binding.patternId, lesson: binding.lessonSlug, step_index: binding.stepIndex, step_count: stepCount });
  } catch (error) {
    projectionErrors.push({ pattern_id: binding.patternId, lesson: binding.lessonSlug, error: error instanceof Error ? error.message : String(error) });
  }
}
check("T3-04", projectionErrors.length === 0, "Every typed bespoke/Decision Rail/Data Models binding points to a rendered projection checkpoint.", { errors: projectionErrors });

const runtimeErrors = [];
const runtimeCaseKinds = {};
for (const binding of bindings.filter((item) => item.factory === "runtime")) {
  const metadata = manifestByPattern.get(binding.patternId);
  try {
    const relativeTrace = metadata.trace_url.split("?")[0].replace(/^\//, "");
    const trace = JSON.parse(await readFile(path.join(ROOT, "public", relativeTrace.replace(/^paper4-v2\//, "paper4-v2/")), "utf8"));
    const kinds = [...new Set(trace.scenarios.map((scenario) => scenario.case_kind))].sort();
    runtimeCaseKinds[binding.patternId] = kinds;
    if (trace.pattern_id !== binding.patternId || trace.owner?.lesson_slug !== binding.lessonSlug || !kinds.includes("normal") || trace.events.length === 0) {
      runtimeErrors.push({ pattern_id: binding.patternId, owner: trace.owner?.lesson_slug, trace_pattern: trace.pattern_id, case_kinds: kinds, events: trace.events?.length ?? 0 });
    }
  } catch (error) {
    runtimeErrors.push({ pattern_id: binding.patternId, error: error instanceof Error ? error.message : String(error) });
  }
}
check("T3-05", runtimeErrors.length === 0, "Every runtime or supplement binding resolves to a non-empty verified normal trace owned by the same lesson.", { errors: runtimeErrors });

const surfaceCounts = Object.fromEntries([...new Set(bindings.map((binding) => binding.surface))].sort().map((surface) => [surface, bindings.filter((binding) => binding.surface === surface).length]));
check("T3-06", /bindLessonPatternCheckpoints\(lessonSlug, patterns, projection\)/.test(routerSource) && /patternContract\.runtimeSupplementPatterns/.test(routerSource), "The learner trace router consumes the typed contract and renders truthful runtime supplements.", { surface_counts: surfaceCounts });
check("T3-07", /DECISION_RAIL_LESSONS\.has\(lessonSlug\)/.test(routerSource) && /<DecisionRailTrace/.test(routerSource) && bindings.some((binding) => binding.surface === "decision-rail"), "Decision Rail lessons are included in the typed binding contract.");
check("T3-08", /value=\{selectedIndex\}/.test(supplementSource) && !/data-pattern-id|value=\{pattern\.pattern_id\}|>\{pattern\.pattern_id\}</.test(supplementSource), "The learner supplement selects by opaque index and does not expose raw pattern IDs in DOM attributes or text.");
check("T3-09", !bindings.some((binding) => binding.lessonSlug === "graphs"), "Graph remains describe/classify/justify support and receives no false official graph-code pattern binding.");

const decision = failures.length === 0 ? "PASS" : "FAIL";
const result = {
  schema_version: "paper4-t3-pattern-binding-gate-v1",
  decision,
  checked_at: new Date().toISOString(),
  counts: {
    official_patterns: manifest.patterns.length,
    machine_bound_patterns: bindings.length - missing.length,
    projection_checkpoint_bindings: bindings.filter((binding) => binding.factory === "normal").length,
    verified_runtime_bindings: bindings.filter((binding) => binding.factory === "runtime").length,
    runtime_supplements: bindings.filter((binding) => binding.surface === "runtime-supplement").length,
  },
  surface_counts: surfaceCounts,
  source_sha256: {
    [BINDING_FILE]: sha256(bindingBytes),
    [ROUTER_FILE]: sha256(routerBytes),
    [SUPPLEMENT_FILE]: sha256(supplementBytes),
    "app/data/paper4-v2/course-manifest.json": sha256(manifestBytes),
  },
  checks,
  failures,
};
await mkdir(EVIDENCE_DIR, { recursive: true });
await writeFile(path.join(EVIDENCE_DIR, "T3_PATTERN_BINDING_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
await writeFile(path.join(EVIDENCE_DIR, "README.md"), `# T3 typed visual-pattern binding evidence\n\nDecision: **${decision}**\n\n- Official patterns: ${manifest.patterns.length}\n- Machine-bound patterns: ${result.counts.machine_bound_patterns}\n- Typed projection checkpoint bindings: ${result.counts.projection_checkpoint_bindings}\n- Verified runtime bindings: ${result.counts.verified_runtime_bindings}\n- Runtime supplements used where the learner projection does not perform the named operation: ${result.counts.runtime_supplements}\n\nThe checker validates exact ownership, projection checkpoint existence, verified trace ownership and normal-scenario availability. Raw pattern IDs remain machine-only and are not written to learner DOM attributes or labels. Graph remains a describe/classify/justify lesson with no graph-code binding.\n`);
console.log(JSON.stringify({ decision, counts: result.counts, surface_counts: surfaceCounts, failures }, null, 2));
if (decision !== "PASS") process.exitCode = 1;
