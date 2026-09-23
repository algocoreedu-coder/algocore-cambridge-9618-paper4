import axe from "axe-core";
import { JSDOM, VirtualConsole } from "jsdom";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const manifest = JSON.parse(await readFile(path.join(ROOT, "app", "data", "paper4-v2", "course-manifest.json"), "utf8"));
const audits = [];

for (const lesson of manifest.lessons) {
  for (const locale of ["vi", "en"]) {
    const url = `${BASE_URL}/paper-4/lessons/${lesson.slug}?lang=${locale}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    const virtualConsole = new VirtualConsole();
    const jsdomErrors = [];
    virtualConsole.on("jsdomError", (error) => jsdomErrors.push(error.message));
    const dom = new JSDOM(await response.text(), {
      url,
      runScripts: "dangerously",
      pretendToBeVisual: true,
      virtualConsole,
    });
    dom.window.eval(axe.source);
    const result = await dom.window.axe.run(dom.window.document, {
      rules: {
        // JSDOM has no layout/paint engine. Browser QA covers both themes and
        // zoom; keep this automated scan to rules that JSDOM can evaluate.
        "color-contrast": { enabled: false },
      },
    });
    const violations = result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, failure_summary: node.failureSummary })),
    }));
    audits.push({ slug: lesson.slug, locale, violations, incomplete: result.incomplete.map((item) => item.id), jsdom_errors: jsdomErrors });
    dom.window.close();
  }
}

const failures = audits.filter((audit) => audit.violations.length > 0 || audit.jsdom_errors.length > 0);
const report = {
  schema_version: "paper4-v2-axe-audit-v1",
  decision: failures.length === 0 ? "PASS" : "FAIL",
  runtime: process.version,
  engine: `axe-core ${axe.version} + JSDOM`,
  base_url: BASE_URL,
  route_variants: audits.length,
  passed: audits.length - failures.length,
  disabled_rules: ["color-contrast: JSDOM has no layout/paint engine; covered by browser theme/zoom QA"],
  violations: failures,
};
console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;
