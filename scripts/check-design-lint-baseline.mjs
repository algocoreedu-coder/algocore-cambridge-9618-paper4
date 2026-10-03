import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidence = path.resolve(root, "../planning/paper4/completion-program-2026/evidence/cp1-ds3");
const baselinePath = path.join(evidence, "SHADCN_LINT_BASELINE.json");
const writeBaseline = process.argv.includes("--write-baseline");
const eslintBin = path.join(root, "node_modules/eslint/bin/eslint.js");
const frozenFiles = new Set([
  "app/components/algocore-ui/AlgoCoreUI.module.css",
  "app/components/algocore-ui/controls.tsx",
  "app/components/algocore-ui/index.ts",
  "app/components/algocore-ui/journey.tsx",
  "app/components/algocore-ui/surfaces.tsx",
]);
const expectedRules = ["no-restyle", "no-raw-colors", "no-arbitrary-values", "no-inline-styles", "no-unknown-classes", "require-static-classes"].map((rule) => `shadcn/${rule}`);

function normalize(file) { return path.relative(root, file).replaceAll("\\", "/"); }
function disposition(file, rule, line) {
  if (file === "app/components/algocore-ui/journey.tsx" && rule === "shadcn/no-inline-styles" && line === 10) return {
    class: "FROZEN_DYNAMIC_PROGRESS_EXCEPTION", severity: "P2", owner: "CP-A5", expiry_batch: "DS4-5",
    reason: "Progress width is computed from aria-valuenow inside the frozen DS2 implementation; no consumer can inject the value.",
    replacement: "Version the component after freeze review and move the dynamic value to a typed CSS custom property.",
  };
  if (file === "app/components/paper4-learning/LocaleBoundary.tsx") return {
    class: "VISIBLE_LANGUAGE_BOUNDARY_INLINE_LAYOUT_DEBT", severity: "P2", owner: "CP-A5", expiry_batch: "DS4-5",
    reason: "LocaleBoundary wraps visible learner content in a div with lang={locale} and inline display: contents so the language boundary remains effective without adding a layout box.",
    replacement: "Move display: contents to an owned class on the same visible wrapper, or use an equivalent refactor that preserves every rendered child and the effective lang boundary.",
    prohibited_replacements: ["hidden", "display: none", "visually-hidden"],
  };
  if (file === "app/components/paper4-visual/DataModelsVisualRuntime.tsx") return {
    class: "REFERENCE_RUNTIME_PROGRESS_DEBT", severity: "P2", owner: "CP-A5", expiry_batch: "DS4-5",
    reason: "The verified progress percentage is rendered as an inline width in the reference runtime.", replacement: "Move the percentage to a typed CSS custom property when DS4 migrates the reference runtime.",
  };
  if (file === "app/components/paper4-visual/Paper4VisualRuntime.tsx") return {
    class: "LEGACY_RUNTIME_PROGRESS_DEBT", severity: "P2", owner: "CP-A5", expiry_batch: "DS7",
    reason: "The legacy multi-pattern runtime renders progress as an inline width.", replacement: "Replace with the DS2 Progress contract as each lesson family is migrated.",
  };
  return null;
}

const run = spawnSync(process.execPath, [eslintBin, "app", "--format", "json"], { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
if (!run.stdout.trim()) throw new Error(`ESLint returned no JSON. ${run.stderr}`);
const files = JSON.parse(run.stdout);
const findings = files.flatMap((entry) => entry.messages.map((message) => {
  const file = normalize(entry.filePath);
  const item = { fingerprint: `${file}:${message.line}:${message.column}:${message.ruleId}`, file, line: message.line, column: message.column, rule: message.ruleId, message: message.message, disposition: disposition(file, message.ruleId, message.line) };
  return item;
}));
const config = readFileSync(path.join(root, "eslint.config.mjs"), "utf8");
const missingRules = expectedRules.filter((rule) => !config.includes(rule.replace("shadcn/", "")));
const unexplained = findings.filter((item) => !item.disposition);
const frozenFindings = findings.filter((item) => frozenFiles.has(item.file));
const baseline = !writeBaseline && (() => { try { return JSON.parse(readFileSync(baselinePath, "utf8")); } catch { return null; } })();
const prior = new Set(baseline?.findings?.map((item) => item.fingerprint) ?? []);
const newFindings = baseline ? findings.filter((item) => !prior.has(item.fingerprint)) : [];
const configHash = createHash("sha256").update(config).digest("hex").toUpperCase();
const decision = run.status === 0 && missingRules.length === 0 && unexplained.length === 0 && (!baseline || newFindings.length === 0) ? "PASS_WITH_EXPLAINED_DEBT" : "FAIL";
const report = {
  schema_version: "algocore-ds3-shadcn-observation-v1", decision, mode: writeBaseline ? "WRITE_BASELINE" : "CHECK_BASELINE",
  runtime: process.version, package: "@shadcn/lint@0.2.0", runner: "eslint@10.11.0", config_sha256: configHash,
  rules: Object.fromEntries(expectedRules.map((rule) => [rule, "warn"])), component_imports: ["^@/app/components/algocore-ui(?:/|$)"],
  blanket_rule_ignores: [], generated_directory_ignores: [".next/**", "node_modules/**", ".codex_tmp/**"],
  compatibility_notice: run.stderr.trim() || null,
  counts: { files_scanned: files.length, findings: findings.length, warnings: files.reduce((sum, entry) => sum + entry.warningCount, 0), errors: files.reduce((sum, entry) => sum + entry.errorCount, 0), frozen_findings: frozenFindings.length, unexplained: unexplained.length, new_since_baseline: newFindings.length },
  frozen_api: { lead_sha256: "1AA0468B6623BFB81CC19398D90EAFAF20A66DA2D4D61B60424BD6360F17ADAE", files: [...frozenFiles], mutation_performed: false },
  missing_rules: missingRules, unexplained, new_findings: newFindings, findings,
};
mkdirSync(evidence, { recursive: true });
if (writeBaseline) writeFileSync(baselinePath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(path.join(evidence, "SHADCN_LINT_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, findings: undefined }, null, 2));
if (decision === "FAIL") process.exitCode = 1;
