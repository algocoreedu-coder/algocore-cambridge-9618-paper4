import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [source, status] = await Promise.all([
  readFile(path.join(root, "app/lib/paper2/candidate-access-policy.ts"), "utf8"),
  readFile(path.join(root, "content/paper2/lesson-status.json"), "utf8").then(JSON.parse),
]);
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (output.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
if (errors.length) throw new Error(`Candidate access policy did not transpile: ${errors.map((item) => item.messageText).join("; ")}`);
const policy = await import(`data:text/javascript;base64,${Buffer.from(output.outputText).toString("base64")}`);
const decide = policy.paper2CandidateAccessDecision;
const sourceRecord = status.lessons.find((item) => item.state === "candidate") ?? status.lessons[0];
if (!sourceRecord) throw new Error("At least one lesson status record is required for the access gate fixtures.");
// The access policy is unit-tested with a synthetic candidate so the gate
// remains valid after every current candidate has been reviewed/promoted.
const record = { ...sourceRecord, state: "candidate" };
const exact = `${record.topicId}@${record.version}`;
const base = { record, requestedRevision: record.version, sessionValid: true, previewEnabled: true, allowlist: new Set([exact]), visualBindingValid: true };
const checks = [
  ["exact-authorized", decide(base) === true],
  ["flag-off", decide({ ...base, previewEnabled: false }) === false],
  ["nonallowlisted", decide({ ...base, allowlist: new Set() }) === false],
  ["wrong-revision", decide({ ...base, requestedRevision: `${record.version}-stale` }) === false],
  ["unauthenticated", decide({ ...base, sessionValid: false }) === false],
  ["stale-visual-binding", decide({ ...base, visualBindingValid: false }) === false],
  ["reviewed-never-previewed", decide({ ...base, record: { ...record, state: "reviewed" } }) === false],
  ["missing-record", decide({ ...base, record: undefined }) === false],
];
const failures = checks.filter(([, pass]) => !pass).map(([id]) => id);
console.log(JSON.stringify({ schema_version: "paper2-candidate-access-v1", decision: failures.length ? "FAIL" : "PASS", checks: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
