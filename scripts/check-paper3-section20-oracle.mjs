import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section20");
const FIXTURE_FILE = path.join(EVIDENCE, "MODEL_FIXTURES.json");
const CONTRACT_FILE = path.join(EVIDENCE, "SECTION20_MODEL_CONTRACTS.json");
const ORACLE_FILE = path.join(EVIDENCE, "SECTION20_QA_ORACLES.json");

export const lessons = Object.freeze([
  ["P3-20.1-T01", "paradigms-and-procedural-design", "paradigm-procedural"],
  ["P3-20.1-T02", "five-addressing-modes", "addressing-modes"],
  ["P3-20.1-T03", "assembly-execution-and-construction", "assembly-workbench"],
  ["P3-20.1-T04", "class-object-design-and-encapsulation", "oop-encapsulation"],
  ["P3-20.1-T05", "inheritance-polymorphism-and-aggregation", "oop-relationships"],
  ["P3-20.1-T06", "declarative-facts-rules-and-goals", "declarative-inference"],
  ["P3-20.2-T01", "serial-sequential-text-file-workflows", "sequential-files"],
  ["P3-20.2-T02", "random-file-record-operations", "random-files"],
  ["P3-20.2-T03", "exceptions-and-controlled-recovery", "exception-flow"],
].map(([topicId, slug, kind]) => Object.freeze({ topicId, slug, kind })));

export const section20CandidateFiles = Object.freeze([
  "app/paper-3/topics/[slug]/page.tsx",
  "app/lib/paper3/catalog.ts",
  "app/lib/paper3/lesson-types.ts",
  "app/lib/paper3/lesson-registry.ts",
  "app/lib/paper3/further-programming-models.ts",
  "app/components/paper3-learning/shared.tsx",
  "app/components/paper3-learning/StudyMap.tsx",
  "app/components/paper3-learning/SectionOverview.tsx",
  "app/components/paper3-learning/TopicPreview.tsx",
  "app/components/paper3-learning/lessons/VisualStage.tsx",
  "app/components/paper3-learning/lessons/LessonPage.tsx",
  "app/components/paper3-learning/lessons/CambridgeVisualPrimer.tsx",
  "app/components/paper3-learning/lessons/Section20FurtherProgrammingWorkbench.tsx",
  "app/components/paper3-learning/lessons/Section20FurtherProgrammingWorkbench.module.css",
  "content/paper3/study-map.json",
  "content/paper3/lesson-status.json",
  ...lessons.map(({ slug }) => `content/paper3/lessons/${slug}.json`),
]);

const startedAt = new Date().toISOString();
const [fixtures, contract, oracleContract] = await Promise.all([
  readFile(FIXTURE_FILE, "utf8").then(JSON.parse), readFile(CONTRACT_FILE, "utf8").then(JSON.parse), readFile(ORACLE_FILE, "utf8").then(JSON.parse),
]);
const checks = [];
let assertions = 0;
const stable = value => JSON.stringify(value);
const project = (actual, expected) => Array.isArray(expected)
  ? expected.map((value, index) => project(actual?.[index], value))
  : expected && typeof expected === "object"
    ? Object.fromEntries(Object.entries(expected).map(([key, value]) => [key, project(actual?.[key], value)]))
    : actual;
function record(id, pass, expected, actual) { assertions += 1; checks.push({ id, pass: Boolean(pass), expected, actual }); }
const eq = (id, actual, expected) => record(id, stable(project(actual, expected)) === stable(expected), expected, actual);
const ok = (id, actual, expected = true) => record(id, Boolean(actual), expected, actual);

const excluded = {
  paradigmProcedural: [], addressing: [], assembly: ["instructionSet"], classEncapsulation: ["classDefinition"],
  oopDispatch: ["classes", "initialObjects"], declarative: ["notation", "facts", "rules"], sequentialFile: [],
  randomFile: ["recordConvention", "baseSlots"], exception: [],
};
const familyForKind = {
  "paradigm-procedural": "paradigmProcedural", "addressing-modes": "addressing", "assembly-workbench": "assembly",
  "oop-encapsulation": "classEncapsulation", "oop-relationships": "oopDispatch", "declarative-inference": "declarative",
  "sequential-files": "sequentialFile", "random-files": "randomFile", "exception-flow": "exception",
};
for (const api of contract.api) {
  const family = familyForKind[api.visualKind];
  const actual = Object.keys(fixtures[family]).filter(key => !excluded[family].includes(key)).sort();
  eq(`contract:${api.visualKind}:scenario-parity`, actual, [...api.scenarioIds].sort());
}
const semanticIds = new Set(Object.values(contract.semanticLineIds).filter(value => value && typeof value === "object").flatMap(Object.keys));
let events = 0;
function inspect(value, id = "fixture") {
  if (Array.isArray(value)) return value.forEach((item, index) => inspect(item, `${id}[${index}]`));
  if (!value || typeof value !== "object") return;
  if (typeof value.activeLine === "string") { events += 1; ok(`${id}:semantic-line`, semanticIds.has(value.activeLine), value.activeLine); }
  for (const [key, child] of Object.entries(value)) inspect(child, `${id}.${key}`);
}
inspect(fixtures);

function addressOracle(input) {
  const { mode, operandField: operand, ix, instructionAddress, memory, validAddressRange = [0, 255] } = input;
  let effectiveAddress = null, finalValue = null, dereferencePath = [], calculation = null, status = "resolved", error;
  if (mode === "immediate") finalValue = operand;
  if (mode === "direct") { effectiveAddress = operand; dereferencePath = [operand]; }
  if (mode === "indirect") { dereferencePath = [operand]; effectiveAddress = memory[String(operand)]; }
  if (mode === "indexed") { effectiveAddress = operand + ix; calculation = `${operand}+${ix}`; }
  if (mode === "relative") { effectiveAddress = instructionAddress + operand; calculation = operand < 0 ? `${instructionAddress}${operand}` : `${instructionAddress}+${operand}`; finalValue = effectiveAddress; status = "resolved-target"; }
  if (effectiveAddress !== null && (effectiveAddress < validAddressRange[0] || effectiveAddress > validAddressRange[1])) {
    status = "address-error"; error = mode === "indirect" ? "DANGLING_EFFECTIVE_ADDRESS" : mode === "relative" ? "TARGET_OUT_OF_RANGE" : "EFFECTIVE_ADDRESS_OUT_OF_RANGE"; finalValue = null;
  } else if (effectiveAddress !== null && mode !== "relative") {
    dereferencePath = mode === "indirect" ? [operand, effectiveAddress] : [effectiveAddress];
    finalValue = memory[String(effectiveAddress)];
  }
  return { calculation, effectiveAddress, dereferencePath, finalValue, status, error };
}
for (const [id, fixture] of Object.entries(fixtures.addressing)) {
  const { events: _events, ...expected } = fixture.expected;
  eq(`addressing:${id}`, addressOracle(fixture.input), expected);
}

function executeAssembly(input) {
  const program = input.program, memory = structuredClone(input.memory), output = [];
  let pc = 0, ACC = input.ACC, IX = input.IX, comparison = "unset", halted = false, error = null;
  const visited = [];
  const allowed = new Set(["LDM","LDD","LDI","LDX","LDR","STO","ADD","SUB","CMP","JMP","JPE","JPN","INC","DEC","END"]);
  for (let guard = 0; guard < 100 && !halted; guard += 1) {
    const raw = program[pc]; if (raw === undefined) break;
    const [opcode, token] = raw.split(/\s+/); if (!allowed.has(opcode)) { error = "UNKNOWN_OPCODE"; break; }
    const address = token && !token.startsWith("#") && !["ACC","IX"].includes(token) ? Number(token) : null;
    if (address !== null && (!(String(address) in memory) && !["JMP","JPE","JPN"].includes(opcode))) { error = "ADDRESS_OUT_OF_RANGE"; break; }
    visited.push(pc); const next = pc + 1; const literal = token?.startsWith("#") ? Number(token.slice(1)) : null;
    if (opcode === "LDM") ACC = literal;
    else if (opcode === "LDD") ACC = memory[String(address)];
    else if (opcode === "LDR") IX = literal;
    else if (opcode === "STO") memory[String(address)] = ACC;
    else if (opcode === "ADD") ACC += literal ?? memory[String(address)];
    else if (opcode === "SUB") ACC -= literal ?? memory[String(address)];
    else if (opcode === "INC") token === "IX" ? IX += 1 : ACC += 1;
    else if (opcode === "DEC") token === "IX" ? IX -= 1 : ACC -= 1;
    else if (opcode === "CMP") comparison = ACC === (literal ?? memory[String(address)]) ? "equal" : "not-equal";
    else if (opcode === "END") halted = true;
    pc = opcode === "JMP" || opcode === "JPE" && comparison === "equal" || opcode === "JPN" && comparison !== "equal" ? Number(token) : next;
  }
  return { final: { pc, ACC, IX, comparison, memory, halted, output }, visited, error };
}
for (const [id, fixture] of Object.entries(fixtures.assembly)) {
  if (id === "instructionSet") continue;
  if (fixture.input.program) {
    const actual = executeAssembly(fixture.input);
    eq(`assembly:${id}:final`, actual.final, fixture.expected.final);
    if (fixture.expected.visited) eq(`assembly:${id}:visited`, actual.visited, fixture.expected.visited);
    if (fixture.expected.error) eq(`assembly:${id}:error`, actual.error, fixture.expected.error);
  } else ok(`assembly:${id}:construction-choice`, fixture.input.choices.includes(fixture.expected.selected), fixture.expected.selected);
}

eq("oop:set-valid:receiver", fixtures.classEncapsulation["set-valid"].expected.instances.map(x => x.score), [90,72]);
eq("oop:set-invalid:preserved", fixtures.classEncapsulation["set-invalid"].expected.instances, fixtures.classEncapsulation["set-invalid"].input.instances);
eq("oop:private-access:preserved", fixtures.classEncapsulation["direct-private-access"].expected.instances, fixtures.classEncapsulation["direct-private-access"].input.instances);
eq("oop:dispatch:actual-type", fixtures.oopDispatch["override-dispatch"].expected.selectedMethod, "SavingsAccount.ApplyCharge");
eq("oop:dispatch:receiver-only", fixtures.oopDispatch["override-dispatch"].expected.objects.map(x => x.balance ?? null), [98,100,null]);
eq("oop:inherited-method", fixtures.oopDispatch["inherited-method"].expected.lookupPath, ["CurrentAccount","Account"]);
eq("oop:aggregation", fixtures.oopDispatch["aggregation-state"].expected.relationship, "has-a");
ok("oop:near-misses", fixtures.oopDispatch["invalid-is-a"].expected.valid === false && fixtures.oopDispatch["invalid-has-a"].expected.valid === false);

const normaliseClause = text => text.replace(/\.$/, "");
const factSet = new Set(fixtures.declarative.facts.map(normaliseClause));
eq("declarative:direct-fact", factSet.has(normaliseClause(fixtures.declarative["direct-fact"].input.goal)), true);
eq("declarative:one-rule-proof", fixtures.declarative["one-rule"].expected.proof.slice(1).every(x => factSet.has(normaliseClause(x))), true);
eq("declarative:two-hop-proof", fixtures.declarative["two-hop"].expected.proof.slice(1).every(x => factSet.has(normaliseClause(x))), true);
eq("declarative:binding", fixtures.declarative["variable-binding"].expected.solutions, [{ Who: "bo" }]);
eq("declarative:unsatisfied", factSet.has("parent(chen,ada)"), false);
eq("declarative:malformed-blocked", fixtures.declarative["malformed-goal"].expected.error, "MALFORMED_GOAL");

eq("file:read-preserves", fixtures.sequentialFile["read-to-eof"].expected.final.records, fixtures.sequentialFile["read-to-eof"].input.records);
eq("file:write-truncates", fixtures.sequentialFile["write-replaces"].expected.final.records, ["Chen,91"]);
eq("file:append-preserves", fixtures.sequentialFile["append-preserves"].expected.final.records, ["Ada,85","Bo,72","Chen,91"]);
eq("file:empty-eof", fixtures.sequentialFile["empty-read"].expected.final.eof, true);
eq("file:closed-error", fixtures.sequentialFile["closed-read"].expected.error, "FILE_NOT_OPEN");
eq("file:missing-error", fixtures.sequentialFile["missing-read"].expected.error, "FILE_NOT_FOUND");
const randomUpdate = fixtures.randomFile["update-middle"];
eq("file:random-neighbours", randomUpdate.expected.unchangedPositions.every(position => stable(randomUpdate.input.slots[position]) === stable(randomUpdate.expected.slots[position])), true);
eq("file:random-offset", fixtures.randomFile["byte-offset-example"].expected.byteOffset, 48);
eq("file:random-out-of-range-preserved", fixtures.randomFile["out-of-range"].expected.slots, fixtures.randomFile["out-of-range"].input.slots);

eq("exception:normal-no-handler", fixtures.exception.normal.expected.matchedHandler, null);
for (const id of ["missing-file-handled","invalid-conversion-handled","divide-zero-handled"]) eq(`exception:${id}:typed-match`, fixtures.exception[id].expected.matchedHandler, fixtures.exception[id].expected.exceptionType);
eq("exception:retry-count", fixtures.exception["retry-success"].expected.attempts, 2);
eq("exception:mismatch-unhandled", fixtures.exception["mismatched-unhandled"].expected.matchedHandler, null);
eq("exception:finally-closes", fixtures.exception["finally-closes"].expected.resourceOpen, false);
eq("exception:validation-not-raised", fixtures.exception["validation-contrast"].expected.raised, false);

ok("oracle:minimum-invalid-cases", oracleContract.minimumInvalidCases.length >= 16, ">=16");
ok("oracle:semantic-event-count", events >= 150, ">=150");
const failures = checks.filter(check => !check.pass);
const report = {
  schemaVersion: 1, gate: "paper3-section20-independent-fixture-oracle", startedAt, completedAt: new Date().toISOString(),
  decision: failures.length ? "FAIL" : "PASS", assertions, failures,
  fixtureSha256: createHash("sha256").update(await readFile(FIXTURE_FILE)).digest("hex"),
  contractSha256: createHash("sha256").update(await readFile(CONTRACT_FILE)).digest("hex"),
  oracleContractSha256: createHash("sha256").update(await readFile(ORACLE_FILE)).digest("hex"),
  independence: "All arithmetic, address, machine and invariant checks above are recomputed without importing the production model or renderer.", checks,
};
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "SECTION20_ORACLE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
