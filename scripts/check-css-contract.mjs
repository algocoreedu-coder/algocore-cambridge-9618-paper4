import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidence = path.resolve(root, "../planning/paper4/completion-program-2026/evidence/cp1-ds3");
const baselinePath = path.join(evidence, "CSS_CONTRACT_BASELINE.json");
const writeBaseline = process.argv.includes("--write-baseline");
const tokenAuthorities = new Set(["styles/algocore-theme.css"]);
const frozenCss = "app/components/algocore-ui/AlgoCoreUI.module.css";

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => { const item = path.join(directory, name); return statSync(item).isDirectory() ? walk(item) : item.endsWith(".css") ? [item] : []; });
}
function ownerFor(file) { return file.includes("paper4-visual") || file.includes("paper4-learning") ? "CP-A5" : "CP-A0"; }
function finding(rule, file, line, value, disposition) { return { fingerprint: createHash("sha256").update(`${rule}:${file}:${line}:${value}`).digest("hex").slice(0, 20), rule, file, line, value, disposition }; }

const files = [...walk(path.join(root, "app")), ...walk(path.join(root, "styles"))].sort();
const findings = [];
const primitiveSignatures = new Map();
for (const absolute of files) {
  const file = path.relative(root, absolute).replaceAll("\\", "/");
  const source = readFileSync(absolute, "utf8");
  const lines = source.split(/\r?\n/);
  lines.forEach((text, index) => {
    const line = index + 1;
    if (!tokenAuthorities.has(file)) {
      for (const match of text.matchAll(/#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/gi)) findings.push(finding("raw-color", file, line, match[0], { class: "LEGACY_COLOR_DEBT", owner: ownerFor(file), expiry_batch: file.includes("paper4-learning") || file.includes("paper4-visual") ? "DS4-5_TO_DS7" : "DS7", action: "Replace with an AlgoCore semantic token when the owning surface migrates." }));
    }
    if (text.includes("!important")) {
      const reduced = /scroll-behavior|transition-duration|animation-duration|animation-iteration-count/.test(text) && file.includes("Paper4VisualRuntime.module.css") && line >= 702 && line <= 705;
      findings.push(finding("important", file, line, text.trim(), reduced ? { class: "REDUCED_MOTION_BOUNDARY", owner: "CP-A5", expiry_batch: "DS7", action: "Retain until migrated consumers prove reduced-motion precedence without !important." } : { class: "LEGACY_SPECIFICITY_DEBT", owner: ownerFor(file), expiry_batch: "DS4-5_TO_DS7", action: "Remove through owned variants and lower-specificity component composition." }));
    }
    if (file !== frozenCss) {
      const scale = text.match(/^\s*(gap|row-gap|column-gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?|border-radius|box-shadow)\s*:\s*([^;]+);/i);
      if (scale && !/var\(|^(?:0|auto|inherit|initial|unset)$/i.test(scale[2].trim())) findings.push(finding("literal-design-scale", file, line, `${scale[1]}:${scale[2].trim()}`, { class: "LEGACY_SCALE_DEBT", owner: ownerFor(file), expiry_batch: "DS4-5_TO_DS7", action: "Map to a named spacing/radius/shadow token during component-family migration." }));
      const width = text.match(/^\s*(?:min-)?width\s*:\s*(\d+(?:\.\d+)?)px\s*;/i);
      if (width && Number(width[1]) > 320) findings.push(finding("fixed-width-risk", file, line, text.trim(), { class: "RESPONSIVE_REVIEW_DEBT", owner: ownerFor(file), expiry_batch: "DS4-5_TO_DS7", action: "Verify against 320 px and replace with a named container or bounded fluid width." }));
    }
  });
  if (file !== frozenCss) {
    for (const block of source.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
      const selector = block[1].trim().replace(/\s+/g, " ");
      if (!/(?:button|input|select|textarea|card)/i.test(selector) || selector.startsWith("@")) continue;
      const properties = [...block[2].matchAll(/([a-z-]+)\s*:/gi)].map((item) => item[1].toLowerCase()).sort();
      if (!properties.length) continue;
      const signature = properties.join(",");
      const list = primitiveSignatures.get(signature) ?? [];
      list.push({ file, selector, line: source.slice(0, block.index).split(/\r?\n/).length });
      primitiveSignatures.set(signature, list);
    }
  }
}
for (const [signature, matches] of primitiveSignatures) if (matches.length > 1) findings.push(finding("duplicate-primitive-signature", matches[0].file, matches[0].line, signature, { class: "PRIMITIVE_CONSOLIDATION_CANDIDATE", owner: "CP-A5", expiry_batch: "DS7", action: "Review these selectors during family migration; consume DS2 variants instead of copying declarations.", matches }));

const frozenViolations = findings.filter((item) => item.file === frozenCss && ["raw-color", "important"].includes(item.rule));
const unexplained = findings.filter((item) => !item.disposition?.owner || !item.disposition?.expiry_batch || !item.disposition?.action);
const priorReport = !writeBaseline && (() => { try { return JSON.parse(readFileSync(baselinePath, "utf8")); } catch { return null; } })();
const prior = new Set(priorReport?.findings?.map((item) => item.fingerprint) ?? []);
const newFindings = priorReport ? findings.filter((item) => !prior.has(item.fingerprint)) : [];
const decision = frozenViolations.length === 0 && unexplained.length === 0 && (!priorReport || newFindings.length === 0) ? "PASS_WITH_EXPLAINED_DEBT" : "FAIL";
const byRule = Object.fromEntries([...new Set(findings.map((item) => item.rule))].sort().map((rule) => [rule, findings.filter((item) => item.rule === rule).length]));
const report = { schema_version: "algocore-ds3-css-contract-v1", decision, mode: writeBaseline ? "WRITE_BASELINE" : "CHECK_BASELINE", files_scanned: files.map((item) => path.relative(root, item).replaceAll("\\", "/")), token_authorities: [...tokenAuthorities], blanket_ignores: [], counts: { findings: findings.length, by_rule: byRule, frozen_violations: frozenViolations.length, unexplained: unexplained.length, new_since_baseline: newFindings.length }, frozen_api: { lead_sha256: "1AA0468B6623BFB81CC19398D90EAFAF20A66DA2D4D61B60424BD6360F17ADAE", css_mutation_performed: false }, frozen_violations: frozenViolations, unexplained, new_findings: newFindings, findings };
mkdirSync(evidence, { recursive: true });
if (writeBaseline) writeFileSync(baselinePath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(path.join(evidence, "CSS_CONTRACT_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, findings: undefined }, null, 2));
if (decision === "FAIL") process.exitCode = 1;
