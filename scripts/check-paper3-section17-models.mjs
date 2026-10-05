import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { keyDomain, expectedKeyChoice, quantumExpected, tlsExpected, certificateExpected } from "./check-paper3-section17-oracle.mjs";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section17");
const MODEL_FILE = "app/lib/paper3/security-models.ts";
const hash = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const stableString = value => JSON.stringify(value);
const deeplyFrozen = value => value === null || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(deeplyFrozen));
const viActor = Object.freeze({ sender: "Người gửi", recipient: "Người nhận", public: "Người kiểm chứng công khai" });
const viKey = Object.freeze({ "recipient-public": "khóa công khai của người nhận", "recipient-private": "khóa riêng của người nhận", "sender-private": "khóa riêng của người gửi", "sender-public": "khóa công khai của người gửi", "shared-secret": "khóa bí mật dùng chung" });

const startedAt = new Date().toISOString();
const checks = [];
let assertions = 0;
function record(id, pass, expected, actual) { assertions += 1; checks.push({ id, pass: Boolean(pass), expected, actual }); }
const eq = (id, actual, expected) => record(id, stableString(actual) === stableString(expected), expected, actual);
const ok = (id, actual, expected = true) => record(id, Boolean(actual), expected, actual);
function expectRangeError(id, fn) {
  let actual = null;
  try { fn(); } catch (error) { actual = { name: error.name, message: error.message }; }
  record(id, actual?.name === "RangeError", "RangeError", actual);
}
function checkTrace(id, trace) {
  ok(`${id}:deep-freeze`, deeplyFrozen(trace));
  eq(`${id}:first-before`, trace.steps[0]?.before, trace.initial);
  for (let index = 0; index < trace.steps.length; index += 1) {
    const step = trace.steps[index];
    if (index) eq(`${id}:${step.id}:continuity`, step.before, trace.steps[index - 1].after);
    for (const field of ["title", "action", "why", "outcome"]) {
      ok(`${id}:${step.id}:${field}:en`, typeof step[field]?.en === "string" && step[field].en.trim().length > 0, "non-empty localized text");
      ok(`${id}:${step.id}:${field}:vi`, typeof step[field]?.vi === "string" && step[field].vi.trim().length > 0, "non-empty localized text");
    }
  }
}

const sourcePath = path.join(ROOT, MODEL_FILE);
const sourceHashBefore = await hash(sourcePath);
let model, loadFailure = null;
try { model = await import(`${pathToFileURL(sourcePath).href}?qa=${sourceHashBefore}`); } catch (error) { loadFailure = error.stack ?? String(error); }

if (model) {
  let keyCases = 0;
  for (const goal of keyDomain.goals) for (const mechanism of keyDomain.mechanisms) for (const actor of keyDomain.actors) for (const key of keyDomain.keys) {
    keyCases += 1;
    const id = `key:${goal}:${mechanism}:${actor}:${key}`;
    const expected = expectedKeyChoice(goal, mechanism, actor, key);
    const trace = model.keyOwnershipTrace(goal, mechanism, actor, key);
    eq(`${id}:valid`, trace.valid, expected.valid);
    eq(`${id}:step-ids`, trace.steps.map(step => step.id), expected.stepIds);
    eq(`${id}:final`, trace.steps.at(-1).after, expected.final);
    if (expected.operation) eq(`${id}:operation`, trace.steps.find(step => step.id === expected.stepIds[1])?.after, expected.operation);
    if (!expected.valid) {
      eq(`${id}:rejection-keeps-artefact`, trace.steps.at(-1).after.artefact, trace.initial.artefact);
      eq(`${id}:rejection-action-vi`, trace.steps.at(-1).action.vi, `${viActor[actor]} thử dùng ${viKey[key]}.`);
    }
    checkTrace(id, trace);
  }
  eq("key:finite-domain-count", keyCases, 60);
  eq("key:choice-list", model.keyChoices.map(item => item.id), keyDomain.keys);

  for (const [scenario, expected] of Object.entries(quantumExpected)) {
    const id = `quantum:${scenario}`, trace = model.quantumTrace(scenario);
    eq(`${id}:step-ids`, trace.steps.map(step => step.id), expected.stepIds);
    eq(`${id}:final-core`, { kept: trace.final.kept, sample: trace.final.sampled, candidateKey: trace.final.candidateKey, errors: trace.final.errors, decision: trace.final.decision }, { kept: expected.kept, sample: expected.sample, candidateKey: expected.candidateKey, errors: expected.errors, decision: expected.decision });
    eq(`${id}:transmissions`, trace.final.transmissions, expected.transmissions);
    eq(`${id}:sample-state`, trace.steps.find(step => step.id === "sample")?.after.sampled, expected.sample);
    if (scenario === "eve-hidden") {
      const sampleStep = trace.steps.find(step => step.id === "sample");
      eq(`${id}:hidden-disturbance-positions`, trace.final.transmissions.filter(row => row.disposition === "candidate-key" && row.aliceBit !== row.bobResult).map(row => row.position), expected.hiddenDisturbancePositions);
      ok(`${id}:hidden-narration-en`, sampleStep?.outcome.en.includes("positions 3 and 6"));
      ok(`${id}:hidden-narration-vi`, sampleStep?.outcome.vi.includes("vị trí 3 và 6"));
    }
    eq(`${id}:decision-only-final`, trace.steps.filter(step => step.after.decision !== "pending").map(step => step.id), ["decide"]);
    checkTrace(id, trace);
  }
  eq("quantum:scenario-list", model.quantumScenarios.map(item => item.id), Object.keys(quantumExpected));

  for (const [scenario, expected] of Object.entries(tlsExpected)) {
    const id = `tls:${scenario}`, trace = model.tlsTrace(scenario);
    eq(`${id}:appropriate`, trace.appropriate, expected.appropriate);
    eq(`${id}:step-ids`, trace.steps.map(step => step.id), expected.stepIds);
    eq(`${id}:final`, { phase: trace.final.phase, travelling: trace.final.travelling, protectedData: trace.final.protectedData }, { phase: expected.finalPhase, travelling: expected.travelling, protectedData: expected.protectedData });
    const firstProtected = trace.steps.findIndex(step => step.after.protectedData);
    eq(`${id}:protected-boundary`, firstProtected, expected.protectedData ? expected.stepIds.indexOf("application") : -1);
    ok(`${id}:no-early-protected-data`, trace.steps.slice(0, Math.max(0, firstProtected)).every(step => step.after.protectedData === false));
    checkTrace(id, trace);
  }
  eq("tls:scenario-list", model.tlsScenarios.map(item => item.id), Object.keys(tlsExpected));

  for (const [caseId, expected] of Object.entries(certificateExpected)) {
    const [mode, signatureCase] = caseId.split("|");
    const id = `certificate:${caseId}`, trace = model.certificateTrace(mode, signatureCase);
    eq(`${id}:step-ids`, trace.steps.map(step => step.id), expected.stepIds);
    eq(`${id}:final`, trace.final, {
      phase: expected.phase,
      subject: expected.subject,
      publicKey: expected.publicKey,
      caCheck: expected.caCheck,
      message: expected.message,
      digest: expected.digest,
      signature: expected.signature,
      certificate: expected.certificate,
      result: expected.result,
      confidentiality: expected.confidentiality,
    });
    if (mode === "verify") {
      eq(`${id}:signing-message`, trace.steps.find(step => step.id === "sign")?.after.message, "Approve results");
      eq(`${id}:confidentiality-only-at-verdict`, trace.steps.at(-1).after.confidentiality, "separate encryption required");
      eq(`${id}:delivery-outcome-vi`, trace.steps.find(step => step.id === "deliver")?.outcome.vi, `Thông điệp nhận: ${signatureCase === "tampered" ? "Từ chối kết quả" : "Duyệt kết quả"}.`);
      ok(`${id}:sign-before-certificate-validation`, trace.steps.findIndex(step => step.id === "sign") < trace.steps.findIndex(step => step.id === "validate-certificate"));
      ok(`${id}:certificate-before-signature-verification`, trace.steps.findIndex(step => step.id === "validate-certificate") < trace.steps.findIndex(step => step.id === "verify"));
    } else {
      ok(`${id}:no-private-key-in-certificate`, !trace.final.certificate.toLowerCase().includes("private"));
      ok(`${id}:no-signing-artefacts`, trace.steps.every(step => step.after.message === "—" && step.after.digest === "—" && step.after.signature === "—"));
    }
    checkTrace(id, trace);
  }

  const invalidCalls = [
    ["bad-goal", () => model.keyOwnershipTrace("bad", "asymmetric", "sender", "recipient-public")],
    ["bad-mechanism", () => model.keyOwnershipTrace("private", "bad", "sender", "recipient-public")],
    ["bad-actor", () => model.keyOwnershipTrace("private", "asymmetric", "bad", "recipient-public")],
    ["bad-key", () => model.keyOwnershipTrace("private", "asymmetric", "sender", "bad")],
    ["bad-quantum", () => model.quantumTrace("random")],
    ["bad-tls", () => model.tlsTrace("email")],
    ["bad-certificate-mode", () => model.certificateTrace("unknown")],
    ["bad-signature-case", () => model.certificateTrace("verify", "unknown")],
  ];
  for (const [id, call] of invalidCalls) expectRangeError(`input:${id}`, call);
}

const sourceHashAfter = await hash(sourcePath);
eq("binding:model-source-stable", sourceHashAfter, sourceHashBefore);
const failures = checks.filter(check => !check.pass);
const buildIdPath = path.join(ROOT, ".next/BUILD_ID");
let buildId = null;
try { buildId = (await readFile(buildIdPath, "utf8")).trim(); } catch { /* An authoring model gate does not require a build. */ }
if (process.env.PAPER3_EXPECTED_BUILD_ID) eq("binding:expected-build-id", buildId, process.env.PAPER3_EXPECTED_BUILD_ID);
if (loadFailure) failures.unshift({ id: "model-import", pass: false, expected: "importable TypeScript model", actual: loadFailure });
const decision = failures.length ? "FAIL" : "PASS";
const report = {
  schemaVersion: 1,
  gate: "paper3-section17-independent-models",
  startedAt,
  completedAt: new Date().toISOString(),
  decision,
  assertions,
  failures,
  sourceRoot: ROOT,
  sourceBoundToIsolatedPreview: ROOT !== AUTHORING_ROOT,
  buildId,
  modelFile: MODEL_FILE,
  modelSha256: sourceHashBefore,
  oracle: "QA-owned hard-coded expected fixtures from check-paper3-section17-oracle.mjs; production outputs are never used to derive expectations.",
  coverage: { keyRoleCombinations: 60, validKeyOperations: 6, quantumScenarios: 4, quantumTransmissions: 24, tlsScenarios: 4, certificateScenarios: 4, invalidInputCases: 8 },
  limitations: ["Finite syllabus teaching model only; this gate does not assess real cryptographic strength, wire-accurate TLS or physical QKD hardware.", "Browser rendering and lesson prose are outside this model gate."],
  checks,
};
await mkdir(EVIDENCE_DIR, { recursive: true });
await writeFile(path.join(EVIDENCE_DIR, "QA_MODELS_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (decision !== "PASS") process.exitCode = 1;
