import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRegistry = JSON.parse(readFileSync(path.join(root, "app/lib/paper2/generated/assessment-public.json"), "utf8"));
const descriptors = JSON.parse(readFileSync(path.join(root, "app/lib/paper2/generated/assessment-descriptors.json"), "utf8"));
const checks = [], failures = [];
const check = (id, pass, detail) => { const result = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(result); if (!result.pass) failures.push(result); };

check("public-registry-no-private-fields", !containsForbidden(publicRegistry));
check("descriptor-registry-no-private-fields", !containsForbidden(descriptors));
check("private-registry-server-only", readFileSync(path.join(root, "app/lib/paper2/assessment-private-registry.ts"), "utf8").includes('import "server-only"'));

for (const file of walk(path.join(root, "app/components"), (name) => /\.(tsx?|jsx?)$/.test(name))) {
  const source = readFileSync(file, "utf8");
  if (!/^\s*["']use client["'];/m.test(source)) continue;
  check(`client-no-private-import:${path.relative(root, file)}`, !/assessment-private-registry|assessment-private\.json|solutions\/private/.test(source));
}

const mockPage = readFileSync(path.join(root, "app/paper-2/mocks/[paperId]/page.tsx"), "utf8");
check("mock-page-no-private-import", !/assessment-private-registry|assessment-private\.json|solutions\/private/.test(mockPage));
for (const route of ["start", "resume"]) {
  const source = readFileSync(path.join(root, `app/api/paper2/timed/[paperId]/${route}/route.ts`), "utf8");
  check(`timed-${route}-no-private-import`, !/assessment-private-registry|assessment-private\.json|solutions\/private/.test(source));
}
const submitSource = readFileSync(path.join(root, "app/api/paper2/timed/[paperId]/submit/route.ts"), "utf8");
check("timed-submit-rejects-answer-fields", submitSource.includes("Object.keys(body)") && !/body\.(answers?|notes?|reflection)/.test(submitSource));
check("timed-submit-private-cache", submitSource.includes('"Cache-Control": "private, no-store, max-age=0"'));

console.log(JSON.stringify({ schemaVersion: "paper2-no-solution-leak-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;

function containsForbidden(value) {
  const forbidden = new Set(["modelAnswer", "markPoints", "acceptedAlternatives", "dependencyCredit", "commonErrors", "privateHash", "rubricId"]);
  if (Array.isArray(value)) return value.some(containsForbidden);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, child]) => forbidden.has(key) || containsForbidden(child));
}
function walk(directory, include) {
  const files = [];
  for (const name of readdirSync(directory)) {
    const absolute = path.join(directory, name);
    if (statSync(absolute).isDirectory()) files.push(...walk(absolute, include));
    else if (include(name)) files.push(absolute);
  }
  return files;
}
