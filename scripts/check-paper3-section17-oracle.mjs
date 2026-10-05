import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section17");

export const lessons = Object.freeze([
  Object.freeze({ slug: "confidentiality-and-key-choice", topicId: "P3-17.1-T01", kind: "key-ownership" }),
  Object.freeze({ slug: "quantum-cryptography", topicId: "P3-17.1-T02", kind: "quantum-key-distribution" }),
  Object.freeze({ slug: "ssl-tls-communication", topicId: "P3-17.1-T03", kind: "tls-session" }),
  Object.freeze({ slug: "certificates-and-signatures", topicId: "P3-17.1-T04", kind: "certificate-signature" }),
]);

export const section17CandidateFiles = Object.freeze([
  "app/paper-3/topics/[slug]/page.tsx",
  "app/lib/paper3/catalog.ts",
  "app/lib/paper3/security-models.ts",
  "app/lib/paper3/lesson-types.ts",
  "app/lib/paper3/lesson-registry.ts",
  "app/components/paper3-learning/shared.tsx",
  "app/components/paper3-learning/StudyMap.tsx",
  "app/components/paper3-learning/SectionOverview.tsx",
  "app/components/paper3-learning/TopicPreview.tsx",
  "app/components/paper3-learning/lessons/VisualStage.tsx",
  "app/components/paper3-learning/lessons/LessonPage.tsx",
  "app/components/paper3-learning/lessons/CambridgeVisualPrimer.tsx",
  "app/components/paper3-learning/lessons/Section15VisualPrimitives.tsx",
  "app/components/paper3-learning/lessons/Section17SecurityWorkbench.tsx",
  "app/components/paper3-learning/lessons/Section17SecurityWorkbench.module.css",
  "content/paper3/study-map.json",
  "content/paper3/lesson-status.json",
  ...lessons.map(item => `content/paper3/lessons/${item.slug}.json`),
]);

export const keyDomain = Object.freeze({
  goals: Object.freeze(["private", "verified"]),
  mechanisms: Object.freeze(["asymmetric", "symmetric"]),
  actors: Object.freeze(["sender", "recipient", "public"]),
  keys: Object.freeze(["recipient-public", "recipient-private", "sender-private", "sender-public", "shared-secret"]),
});

const keyValid = new Set([
  "private|asymmetric|sender|recipient-public",
  "private|symmetric|sender|shared-secret",
  "verified|asymmetric|sender|sender-private",
  "private|asymmetric|recipient|recipient-private",
  "private|symmetric|recipient|shared-secret",
  "verified|asymmetric|public|sender-public",
]);

const keyFirstOperations = new Set([
  "private|asymmetric|sender|recipient-public",
  "private|symmetric|sender|shared-secret",
  "verified|asymmetric|sender|sender-private",
]);

export function expectedKeyChoice(goal, mechanism, actor, key) {
  const id = [goal, mechanism, actor, key].join("|");
  const valid = keyValid.has(id);
  const firstOperation = keyFirstOperations.has(id);
  const initialArtefact = goal === "private" ? "MEET AT 09:00" : "RESULTS APPROVED";
  if (!valid) return Object.freeze({
    valid: false,
    stepIds: Object.freeze(["identify-goal", "reject-choice"]),
    final: Object.freeze({ phase: "choice-rejected", artefact: initialArtefact, readableBy: "sender", verifiableBy: "nobody yet", accepted: false }),
  });
  const operation = goal === "private"
    ? Object.freeze({ phase: firstOperation ? "cipher-text" : "delivered", artefact: "7F·A2·19", readableBy: "nobody in transit", verifiableBy: "not the purpose", accepted: true })
    : Object.freeze({ phase: firstOperation ? "signed" : "delivered", artefact: "RESULTS APPROVED + SIG(A4)", readableBy: "public", verifiableBy: "sender public key holders", accepted: true });
  return goal === "private" ? Object.freeze({
    valid: true,
    stepIds: Object.freeze(firstOperation ? ["identify-goal", "apply-operation", "receive", "complete-goal"] : ["identify-goal", "receive-prerequisite", "complete-goal"]),
    operation,
    final: Object.freeze({ phase: "decrypted", artefact: initialArtefact, readableBy: "recipient", verifiableBy: "not the purpose", accepted: true }),
  }) : Object.freeze({
    valid: true,
    stepIds: Object.freeze(firstOperation ? ["identify-goal", "apply-operation", "receive", "complete-goal"] : ["identify-goal", "receive-prerequisite", "complete-goal"]),
    operation,
    final: Object.freeze({ phase: "verified", artefact: initialArtefact, readableBy: "public", verifiableBy: "public", accepted: true }),
  });
}

const q = (position, aliceBit, aliceBasis, eveBasis, eveResult, bobBasis, bobResult, disposition) => Object.freeze({ position, aliceBit, aliceBasis, eveBasis, eveResult, bobBasis, bobResult, disposition });
const cleanRows = Object.freeze([
  q(1, "0", "+", "—", "—", "+", "0", "candidate-key"),
  q(2, "1", "×", "—", "—", "×", "1", "public-sample"),
  q(3, "1", "+", "—", "—", "+", "1", "candidate-key"),
  q(4, "0", "×", "—", "—", "+", "1", "discarded-basis"),
  q(5, "1", "+", "—", "—", "+", "1", "public-sample"),
  q(6, "0", "×", "—", "—", "×", "0", "candidate-key"),
]);
const interceptedDetectedRows = Object.freeze([
  q(1, "0", "+", "×", "1", "+", "0", "discarded-abort"),
  q(2, "1", "×", "×", "1", "×", "1", "discarded-abort"),
  q(3, "1", "+", "×", "0", "+", "0", "public-sample"),
  q(4, "0", "×", "+", "1", "+", "1", "discarded-basis"),
  q(5, "1", "+", "+", "1", "+", "1", "public-sample"),
  q(6, "0", "×", "+", "1", "×", "1", "discarded-abort"),
]);
const interceptedHiddenRows = Object.freeze([
  q(1, "0", "+", "×", "1", "+", "0", "public-sample"),
  q(2, "1", "×", "×", "1", "×", "1", "candidate-key"),
  q(3, "1", "+", "×", "0", "+", "0", "candidate-key"),
  q(4, "0", "×", "+", "1", "+", "1", "discarded-basis"),
  q(5, "1", "+", "+", "1", "+", "1", "public-sample"),
  q(6, "0", "×", "+", "1", "×", "1", "candidate-key"),
]);

export const quantumExpected = Object.freeze({
  clean: Object.freeze({ stepIds: Object.freeze(["prepare", "quantum-channel", "sift", "sample", "decide"]), kept: "1 2 3 5 6", sample: "2, 5", candidateKey: "Alice 010 · Bob 010", errors: 0, decision: "accept", transmissions: cleanRows }),
  "eve-measures": Object.freeze({ stepIds: Object.freeze(["prepare", "quantum-channel", "sift", "sample", "decide"]), kept: "1 2 3 5 6", sample: "3, 5", candidateKey: "discarded", errors: 1, decision: "abort", transmissions: interceptedDetectedRows }),
  "eve-hidden": Object.freeze({ stepIds: Object.freeze(["prepare", "quantum-channel", "sift", "sample", "decide"]), kept: "1 2 3 5 6", sample: "1, 5", candidateKey: "Alice 110 · Bob 101 (reconciliation required)", errors: 0, decision: "accept", hiddenDisturbancePositions: Object.freeze([3, 6]), transmissions: interceptedHiddenRows }),
  "eve-detected": Object.freeze({ stepIds: Object.freeze(["prepare", "quantum-channel", "sift", "sample", "decide"]), kept: "1 2 3 5 6", sample: "3, 5", candidateKey: "discarded", errors: 1, decision: "abort", transmissions: interceptedDetectedRows }),
});

export const tlsExpected = Object.freeze({
  login: Object.freeze({ appropriate: true, stepIds: Object.freeze(["classify", "certificate", "validate", "establish", "application"]), travelling: "encrypted credentials", finalPhase: "protected-data", protectedData: true }),
  payment: Object.freeze({ appropriate: true, stepIds: Object.freeze(["classify", "certificate", "validate", "establish", "application"]), travelling: "encrypted payment details", finalPhase: "protected-data", protectedData: true }),
  "bad-certificate": Object.freeze({ appropriate: true, stepIds: Object.freeze(["classify", "certificate", "reject-certificate"]), travelling: "certificate warning", finalPhase: "certificate-rejected", protectedData: false }),
  offline: Object.freeze({ appropriate: false, stepIds: Object.freeze(["classify"]), travelling: "local file request", finalPhase: "request", protectedData: false }),
});

export const certificateExpected = Object.freeze({
  "acquire|valid": Object.freeze({ stepIds: Object.freeze(["prepare", "request", "check", "issue"]), phase: "issued", subject: "school.example", publicKey: "Kpub-school", caCheck: "passed", message: "—", digest: "—", signature: "—", certificate: "Demo CA: school.example ↔ Kpub-school", result: "identity-public-key binding issued", confidentiality: "none" }),
  "verify|valid": Object.freeze({ stepIds: Object.freeze(["digest", "sign", "deliver", "validate-certificate", "verify"]), phase: "valid", subject: "sender", publicKey: "Kpub-sender", caCheck: "passed", message: "Approve results", digest: "D7", signature: "SIG(D7)", certificate: "Demo CA: sender ↔ Kpub-sender", result: "valid", confidentiality: "separate encryption required" }),
  "verify|tampered": Object.freeze({ stepIds: Object.freeze(["digest", "sign", "deliver", "validate-certificate", "verify"]), phase: "invalid", subject: "sender", publicKey: "Kpub-sender", caCheck: "passed", message: "Reject results", digest: "A2", signature: "SIG(D7)", certificate: "Demo CA: sender ↔ Kpub-sender", result: "invalid: message changed", confidentiality: "separate encryption required" }),
  "verify|wrong-key": Object.freeze({ stepIds: Object.freeze(["digest", "sign", "deliver", "validate-certificate", "verify"]), phase: "invalid", subject: "sender", publicKey: "Kpub-sender", caCheck: "passed", message: "Approve results", digest: "D7", signature: "SIG(D7)", certificate: "Demo CA: sender ↔ Kpub-sender", result: "invalid: wrong public key", confidentiality: "separate encryption required" }),
});

function runSelfTests() {
  let assertions = 0;
  const eq = (actual, expected, message) => { assertions += 1; assert.deepEqual(actual, expected, message); };
  const ok = (actual, message) => { assertions += 1; assert.ok(actual, message); };
  const choices = [];
  for (const goal of keyDomain.goals) for (const mechanism of keyDomain.mechanisms) for (const actor of keyDomain.actors) for (const key of keyDomain.keys) choices.push(expectedKeyChoice(goal, mechanism, actor, key));
  eq(choices.length, 60, "complete finite key-role domain");
  eq(choices.filter(item => item.valid).length, 6, "the three first operations and their three matching operations are accepted");
  eq(expectedKeyChoice("private", "asymmetric", "recipient", "recipient-private").stepIds, ["identify-goal", "receive-prerequisite", "complete-goal"], "recipient decryption begins from delivered cipher text");
  eq(expectedKeyChoice("verified", "asymmetric", "public", "sender-public").operation.phase, "delivered", "public verification begins from a delivered signed message");
  eq(expectedKeyChoice("verified", "asymmetric", "sender", "sender-private").final.readableBy, "public", "signature is not confidentiality");
  for (const [scenario, expected] of Object.entries(quantumExpected)) {
    ok(expected.stepIds.includes("sample") && expected.stepIds.at(-1) === "decide", `${scenario}: sample precedes decision`);
    eq(expected.errors > 0, expected.decision === "abort", `${scenario}: mismatch implies abort in the frozen fixture`);
    const kept = new Set(expected.kept.split(" ")), sampled = expected.sample.split(", ");
    ok(sampled.every(position => kept.has(position)), `${scenario}: public sample comes from sifted positions`);
    eq(expected.transmissions.filter(row => row.disposition === "public-sample").map(row => String(row.position)), sampled, `${scenario}: public samples are removed from candidate material`);
    ok(expected.transmissions.filter(row => row.disposition === "candidate-key").every(row => !sampled.includes(String(row.position))), `${scenario}: no disclosed sample remains in the candidate key`);
    if (scenario === "eve-hidden") {
      eq(expected.transmissions.filter(row => row.disposition === "candidate-key" && row.aliceBit !== row.bobResult).map(row => row.position), expected.hiddenDisturbancePositions, "eve-hidden: oracle exposes both unsampled disturbed positions");
    }
    if (expected.decision === "abort") {
      eq(expected.transmissions.filter(row => row.disposition === "candidate-key").length, 0, `${scenario}: abort leaves no candidate-key rows`);
      ok(expected.transmissions.some(row => row.disposition === "discarded-abort"), `${scenario}: abort marks undisclosed sifted material as discarded`);
    }
  }
  for (const [scenario, expected] of Object.entries(tlsExpected)) {
    eq(expected.stepIds.includes("application"), expected.protectedData, `${scenario}: only a completed network scenario has protected application data`);
    if (expected.protectedData) ok(expected.stepIds.indexOf("establish") < expected.stepIds.indexOf("application"), `${scenario}: session established before application data`);
  }
  eq(certificateExpected["verify|valid"].confidentiality, "separate encryption required", "signature never implies confidentiality");
  eq(certificateExpected["verify|tampered"].result, "invalid: message changed", "tampering fails verification");
  eq(certificateExpected["verify|wrong-key"].result, "invalid: wrong public key", "wrong key fails verification");
  ok(!certificateExpected["acquire|valid"].certificate.toLowerCase().includes("private"), "certificate fixture contains no private key");
  eq([certificateExpected["acquire|valid"].message, certificateExpected["acquire|valid"].digest, certificateExpected["acquire|valid"].signature], ["—", "—", "—"], "certificate acquisition contains no message-signing artefacts");
  ok(certificateExpected["verify|valid"].stepIds.indexOf("sign") < certificateExpected["verify|valid"].stepIds.indexOf("validate-certificate"), "message signing precedes certificate validation in the verification workflow");
  ok(certificateExpected["verify|valid"].stepIds.indexOf("validate-certificate") < certificateExpected["verify|valid"].stepIds.indexOf("verify"), "certificate validation precedes signature verification");
  return assertions;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const startedAt = new Date().toISOString();
  let decision = "PASS", assertions = 0, failure = null;
  try { assertions = runSelfTests(); } catch (error) { decision = "FAIL"; failure = error.stack ?? String(error); }
  const report = {
    schemaVersion: 1,
    gate: "paper3-section17-independent-oracle",
    startedAt,
    completedAt: new Date().toISOString(),
    decision,
    assertions,
    fixtureCounts: { keyRoleCombinations: 60, quantumScenarios: 4, quantumTransmissions: 24, tlsScenarios: 4, certificateScenarios: 4 },
    independence: "Expected fixtures and academic truth tables are declared in this QA-owned file; no production model or renderer is imported.",
    failure,
    limitations: ["Finite syllabus teaching fixtures; no claim of production cryptography, wire-accurate TLS or a complete physical QKD implementation."],
  };
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await writeFile(path.join(EVIDENCE_DIR, "QA_ORACLE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (decision !== "PASS") process.exitCode = 1;
}
