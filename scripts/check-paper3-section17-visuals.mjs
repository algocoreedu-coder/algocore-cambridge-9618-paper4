import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = process.cwd();
const model = await import(pathToFileURL(path.join(root, "app/lib/paper3/security-models.ts")));
let assertions = 0;
const equal = (actual, expected, message) => { assertions += 1; assert.deepEqual(actual, expected, message); };
const ok = (value, message) => { assertions += 1; assert.ok(value, message); };
const throws = (fn, message) => { assertions += 1; assert.throws(fn, RangeError, message); };
const deeplyFrozen = value => value === null || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(deeplyFrozen));
const continuous = trace => {
  ok(deeplyFrozen(trace), "trace is deeply immutable");
  for (let index = 1; index < trace.steps.length; index += 1) equal(trace.steps[index].before, trace.steps[index - 1].after, `state continuity at ${trace.steps[index].id}`);
  for (const step of trace.steps) for (const field of ["title", "action", "why", "outcome"]) for (const locale of ["en", "vi"]) ok(step[field][locale].length > 0, `${step.id}.${field}.${locale}`);
};

const privateAsymmetric = model.keyOwnershipTrace("private", "asymmetric", "sender", "recipient-public");
equal(privateAsymmetric.valid, true);
equal(privateAsymmetric.steps.at(-1).after.readableBy, "recipient");
equal(privateAsymmetric.steps.at(-1).after.verifiableBy, "not the purpose");
continuous(privateAsymmetric);
const verified = model.keyOwnershipTrace("verified", "asymmetric", "sender", "sender-private");
equal(verified.valid, true);
equal(verified.steps.at(-1).after.readableBy, "public");
equal(verified.steps.at(-1).after.verifiableBy, "public");
continuous(verified);
for (const [goal, mechanism, actor, key, phase] of [["private", "asymmetric", "recipient", "recipient-private", "decrypted"], ["private", "symmetric", "recipient", "shared-secret", "decrypted"], ["verified", "asymmetric", "public", "sender-public", "verified"]]) {
  const trace = model.keyOwnershipTrace(goal, mechanism, actor, key);
  equal(trace.valid, true, `${goal}/${mechanism}/${actor}/${key} accepted`);
  equal(trace.steps.at(-1).after.phase, phase);
  continuous(trace);
}
for (const [goal, mechanism, actor, key] of [["private", "asymmetric", "sender", "sender-private"], ["private", "asymmetric", "recipient", "recipient-public"], ["verified", "symmetric", "sender", "shared-secret"], ["verified", "asymmetric", "recipient", "sender-public"]]) {
  const trace = model.keyOwnershipTrace(goal, mechanism, actor, key);
  equal(trace.valid, false, `${goal}/${mechanism}/${actor}/${key} rejected`);
  equal(trace.steps.at(-1).after.accepted, false);
  equal(trace.steps.at(-1).after.artefact, trace.initial.artefact, "rejection does not mutate artefact");
}

for (const [scenario, decision, errors] of [["clean", "accept", 0], ["eve-hidden", "accept", 0], ["eve-measures", "abort", 1], ["eve-detected", "abort", 1]]) {
  const trace = model.quantumTrace(scenario);
  equal(trace.final.decision, decision, scenario);
  equal(trace.final.errors, errors, scenario);
  equal(trace.final.transmissions.length, 6, `${scenario}: six detailed transmissions`);
  ok(trace.final.transmissions.every(item => item.aliceBasis && item.bobBasis && item.disposition), `${scenario}: basis/result/disposition fields`);
  continuous(trace);
}

for (const scenario of ["login", "payment"]) {
  const trace = model.tlsTrace(scenario);
  equal(trace.appropriate, true);
  equal(trace.final.protectedData, true);
  equal(trace.steps.findIndex(step => step.after.protectedData), trace.steps.length - 1, "application data protected only at final post-establishment state");
  ok(trace.steps.some(step => step.after.phase === "session-established"));
  continuous(trace);
}
const offline = model.tlsTrace("offline");
equal(offline.appropriate, false);
equal(offline.final.protectedData, false);
const rejectedCertificate = model.tlsTrace("bad-certificate");
equal(rejectedCertificate.appropriate, true);
equal(rejectedCertificate.final.phase, "certificate-rejected");
equal(rejectedCertificate.final.protectedData, false);
ok(!rejectedCertificate.steps.some(step => step.after.phase === "session-established"));
continuous(rejectedCertificate);

const acquisition = model.certificateTrace("acquire");
ok(acquisition.final.certificate.includes("school.example"));
ok(!acquisition.final.certificate.toLowerCase().includes("private"));
continuous(acquisition);
for (const [signatureCase, result] of [["valid", "valid"], ["tampered", "invalid: message changed"], ["wrong-key", "invalid: wrong public key"]]) {
  const trace = model.certificateTrace("verify", signatureCase);
  equal(trace.final.result, result);
  equal(trace.final.confidentiality, "separate encryption required");
  continuous(trace);
}
for (const run of [
  () => model.keyOwnershipTrace("bad", "asymmetric", "sender", "recipient-public"),
  () => model.keyOwnershipTrace("private", "bad", "sender", "recipient-public"),
  () => model.keyOwnershipTrace("private", "asymmetric", "bad", "recipient-public"),
  () => model.keyOwnershipTrace("private", "asymmetric", "sender", "bad"),
  () => model.quantumTrace("random"),
  () => model.tlsTrace("email"),
  () => model.certificateTrace("unknown"),
  () => model.certificateTrace("verify", "unknown"),
]) throws(run, "reject invalid runtime input");

const component = await readFile(path.join(root, "app/components/paper3-learning/lessons/Section17SecurityWorkbench.tsx"), "utf8");
for (const token of ["StateControls", "StateTable", "role=\"status\"", "transmissionTable", "data-visual-kind=\"key-ownership\"", "data-visual-kind=\"quantum-key-distribution\"", "data-visual-kind=\"tls-session\"", "data-visual-kind=\"certificate-signature\""]) ok(component.includes(token), `component contract: ${token}`);
const css = await readFile(path.join(root, "app/components/paper3-learning/lessons/Section17SecurityWorkbench.module.css"), "utf8");
ok(css.includes("prefers-reduced-motion: reduce"), "reduced motion contract");
ok(css.includes(":focus-visible"), "visible focus contract");

console.log(JSON.stringify({ decision: "PASS", assertions, scope: "Section 17 deterministic security models and static interaction/accessibility contracts" }, null, 2));
