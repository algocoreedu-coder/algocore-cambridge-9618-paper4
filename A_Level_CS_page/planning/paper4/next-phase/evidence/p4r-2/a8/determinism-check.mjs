import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const csPage = path.resolve(here, "../../../../../..");
const app = path.join(csPage, "algocore-fumadocs");
const evidence = path.resolve(here, "..");
const roots = [
  path.join(app, "content", "paper4", "lessons", "pilot"),
  path.join(app, "content", "paper4", "visuals", "pilot"),
  path.join(app, "content", "paper4", "assessments", "pilot"),
  path.join(app, "content", "paper4", "records", "pilot"),
  ...["a2", "a3", "a4", "a5", "a6", "a7"].map((name) => path.join(evidence, name)),
];
const generators = [
  "scripts/build-p4r2-theory-pilot.mjs",
  "scripts/generate-p4r2-visual-pilot.mjs",
  "scripts/build-p4r2-assessment-pilot.mjs",
  "scripts/build-p4r2-pilot-registry.mjs",
];
const sha = (value) => createHash("sha256").update(value).digest("hex");

async function filesBelow(root) {
  const out = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const child = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...await filesBelow(child));
    else if (entry.isFile()) out.push(child);
  }
  return out;
}

async function snapshot() {
  const rows = [];
  for (const root of roots) for (const file of await filesBelow(root)) {
    const relative = path.relative(csPage, file).replaceAll("\\", "/");
    rows.push([relative, sha(await readFile(file))]);
  }
  rows.sort(([a], [b]) => a.localeCompare(b));
  return { files: rows.length, aggregate_sha256: sha(rows.map(([file, digest]) => `${digest}  ${file}\n`).join("")), entries: rows };
}

function generate(pass) {
  return generators.map((script) => {
    const run = spawnSync(process.execPath, [script], { cwd: app, encoding: "utf8", windowsHide: true });
    return { pass, script, exit_code: run.status, stdout_sha256: sha(run.stdout ?? ""), stderr: (run.stderr ?? "").trim() };
  });
}

const before = await snapshot();
const runs = generate(1);
const afterFirst = await snapshot();
runs.push(...generate(2));
const afterSecond = await snapshot();
const failedRuns = runs.filter((run) => run.exit_code !== 0);
const unchanged = before.aggregate_sha256 === afterFirst.aggregate_sha256 && before.aggregate_sha256 === afterSecond.aggregate_sha256;
const result = {
  schema_version: "paper4-p4r2-a8-determinism-v1",
  runtime: process.version,
  checker_mode: "GENERATOR_RERUN_WITH_BEFORE_AFTER_HASH",
  decision: unchanged && !failedRuns.length ? "PASS" : "REWORK_REQUIRED",
  scope_files: before.files,
  before_sha256: before.aggregate_sha256,
  after_first_sha256: afterFirst.aggregate_sha256,
  after_second_sha256: afterSecond.aggregate_sha256,
  canonical_and_prior_evidence_unchanged: unchanged,
  runs,
  findings: [
    ...failedRuns.map((run) => ({ code: "GENERATOR_FAILED", detail: `${run.script}: ${run.stderr}` })),
    ...(!unchanged ? [{ code: "GENERATOR_NONDETERMINISTIC", detail: "The canonical/prior-evidence aggregate changed across generator reruns." }] : []),
  ],
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (result.decision !== "PASS") process.exitCode = 1;
