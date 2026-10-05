import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { section20CandidateFiles } from "./check-paper3-section20-oracle.mjs";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const EVIDENCE = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section20");
const MODEL_RELATIVE = "app/lib/paper3/further-programming-models.ts";
const [fixtures, contract, oracleContract] = await Promise.all([
  readFile(path.join(EVIDENCE, "MODEL_FIXTURES.json"), "utf8").then(JSON.parse),
  readFile(path.join(EVIDENCE, "SECTION20_MODEL_CONTRACTS.json"), "utf8").then(JSON.parse),
  readFile(path.join(EVIDENCE, "SECTION20_QA_ORACLES.json"), "utf8").then(JSON.parse),
]);
const startedAt = new Date().toISOString();
const stable = value => JSON.stringify(value);
const hashFile = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const hashCandidates = async root => Object.fromEntries(await Promise.all(section20CandidateFiles.map(async relative => {
  try { return [relative, await hashFile(path.join(root, relative))]; }
  catch { return [relative, null]; }
})));
const deeplyFrozen = value => value === null || typeof value !== "object" || Object.isFrozen(value) && Object.values(value).every(deeplyFrozen);
const familyNames = ["ADDRESSING_ASSEMBLY","OOP","DECLARATIVE","FILE","EXCEPTION"];
const families = Object.fromEntries(familyNames.map(name => [name, { assertions: 0, checks: [] }]));
function record(family, id, pass, expected, actual) { families[family].assertions += 1; families[family].checks.push({ id, pass: Boolean(pass), expected, actual }); }
const eq = (family, id, actual, expected) => record(family, id, stable(actual) === stable(expected), expected, actual);
const ok = (family, id, actual, expected = true) => record(family, id, Boolean(actual), expected, actual);
const semanticIds = new Set(Object.values(contract.semanticLineIds).filter(value => value && typeof value === "object").flatMap(Object.keys));

function checkTrace(family, id, trace, expectedEvents) {
  ok(family, `${id}:trace`, trace && typeof trace === "object", "trace object");
  if (!trace) return;
  ok(family, `${id}:deep-frozen`, deeplyFrozen(trace), true);
  ok(family, `${id}:steps`, Array.isArray(trace.steps) && trace.steps.length >= 2, "ready plus one or more transitions");
  eq(family, `${id}:first-before`, trace.steps?.[0]?.before, trace.initial);
  eq(family, `${id}:last-after`, trace.steps?.at(-1)?.after, trace.final);
  for (let index = 1; index < (trace.steps?.length ?? 0); index += 1) eq(family, `${id}:continuity:${index}`, trace.steps[index].before, trace.steps[index - 1].after);
  const active = (trace.steps ?? []).map(step => step.activeLine).filter(value => semanticIds.has(value));
  const expected = expectedEvents.map(event => event.activeLine);
  let cursor = 0;
  for (const line of active) if (line === expected[cursor]) cursor += 1;
  eq(family, `${id}:semantic-sequence`, cursor, expected.length);
  for (const [index, step] of (trace.steps ?? []).entries()) {
    if (index && step.activeLine) ok(family, `${id}:semantic-id:${index}`, semanticIds.has(step.activeLine), "locked semantic ID");
    for (const field of ["title","action","why","rule","outcome"]) if (step[field] !== undefined) {
      ok(family, `${id}:${field}:${index}`, typeof step[field]?.en === "string" && step[field].en.trim() && typeof step[field]?.vi === "string" && step[field].vi.trim(), "non-empty EN/VI");
    }
  }
}

function valueAt(state, flat, nested, fallback) {
  if (state?.[flat] !== undefined) return state[flat];
  if (nested && state?.[nested[0]]?.[nested[1]] !== undefined) return state[nested[0]][nested[1]];
  return fallback;
}
function checkAddressing(id, trace, fixture) {
  const final = trace.final, expected = fixture.expected;
  eq("ADDRESSING_ASSEMBLY", `${id}:effective-address`, final.effectiveAddress, expected.effectiveAddress);
  eq("ADDRESSING_ASSEMBLY", `${id}:path`, final.dereferencePath, expected.dereferencePath);
  eq("ADDRESSING_ASSEMBLY", `${id}:value`, final.value ?? final.finalValue, expected.finalValue);
  eq("ADDRESSING_ASSEMBLY", `${id}:status`, final.status, expected.status);
  eq("ADDRESSING_ASSEMBLY", `${id}:error`, final.error ?? null, expected.error ?? null);
}
function checkAssembly(id, trace, fixture) {
  if (!fixture.input.program) {
    eq("ADDRESSING_ASSEMBLY", `${id}:selected`, trace.final.selectedInstruction ?? trace.final.selected, fixture.expected.selected);
    return;
  }
  const expected = fixture.expected.final, final = trace.final;
  eq("ADDRESSING_ASSEMBLY", `${id}:pc`, final.pc, expected.pc);
  eq("ADDRESSING_ASSEMBLY", `${id}:ACC`, valueAt(final,"ACC",["registers","ACC"]), expected.ACC);
  eq("ADDRESSING_ASSEMBLY", `${id}:IX`, valueAt(final,"IX",["registers","IX"]), expected.IX);
  eq("ADDRESSING_ASSEMBLY", `${id}:comparison`, valueAt(final,"comparison",["flags","comparison"]), expected.comparison);
  eq("ADDRESSING_ASSEMBLY", `${id}:memory`, final.memory, expected.memory);
  eq("ADDRESSING_ASSEMBLY", `${id}:halted`, final.halted, expected.halted);
  eq("ADDRESSING_ASSEMBLY", `${id}:output`, final.output, expected.output);
  if (fixture.expected.error) eq("ADDRESSING_ASSEMBLY", `${id}:error`, final.error, fixture.expected.error);
}
function compareAvailable(family, id, actual, expected, keys) {
  for (const key of keys) if (expected[key] !== undefined) eq(family, `${id}:${key}`, actual?.[key], expected[key]);
}

const modelFile = path.join(ROOT, MODEL_RELATIVE);
let model = null, modelSha256 = null, loadFailure = null;
try { modelSha256 = await hashFile(modelFile); model = await import(`${pathToFileURL(modelFile).href}?s20qa=${modelSha256}`); }
catch (error) { loadFailure = error?.stack ?? String(error); }
const definitions = [
  ["ADDRESSING_ASSEMBLY","addressing",model?.addressingModeTrace,checkAddressing],
  ["ADDRESSING_ASSEMBLY","assembly",model?.assemblyExecutionTrace,checkAssembly],
  ["OOP","paradigmProcedural",model?.paradigmProceduralTrace,(id,t,f)=>compareAvailable("OOP",id,t.final,f.expected,["paradigm","returnValue","outputs","status","error"])],
  ["OOP","classEncapsulation",model?.classEncapsulationTrace,(id,t,f)=>compareAvailable("OOP",id,t.final,f.expected,["instances","returnValue","status","error","class"])],
  ["OOP","oopDispatch",model?.oopDispatchTrace,(id,t,f)=>compareAvailable("OOP",id,t.final,f.expected,["actualType","selectedMethod","result","objects","relationship","valid","status","error"])],
  ["DECLARATIVE","declarative",model?.declarativeProofTrace,(id,t,f)=>compareAvailable("DECLARATIVE",id,t.final,f.expected,["status","bindings","solutions","proof","error"])],
  ["FILE","sequentialFile",model?.sequentialFileTrace,(id,t,f)=>compareAvailable("FILE",id,t.final,f.expected,["final","readValues","outputRecords","status","error"])],
  ["FILE","randomFile",model?.randomFileTrace,(id,t,f)=>compareAvailable("FILE",id,t.final,f.expected,["pointer","record","slots","unchangedPositions","randomPath","sequentialPath","byteOffset","calculation","status","error"])],
  ["EXCEPTION","exception",model?.exceptionFlowTrace,(id,t,f)=>compareAvailable("EXCEPTION",id,t.final,f.expected,["status","exceptionType","matchedHandler","skippedLines","attempts","output","resourceOpen","raised"])],
];
const excluded = { assembly:new Set(["instructionSet"]), classEncapsulation:new Set(["classDefinition"]), oopDispatch:new Set(["classes","initialObjects"]), declarative:new Set(["notation","facts","rules"]), randomFile:new Set(["recordConvention","baseSlots"]) };
if (model) for (const [family, fixtureFamily, fn, compare] of definitions) {
  ok(family, `${fixtureFamily}:export`, typeof fn === "function", "exported trace function");
  if (typeof fn !== "function") continue;
  for (const [scenario, fixture] of Object.entries(fixtures[fixtureFamily])) {
    if (excluded[fixtureFamily]?.has(scenario)) continue;
    const id = `${fixtureFamily}:${scenario}`;
    let trace = null;
    try { trace = fn(scenario); } catch (error) { record(family, `${id}:invoke`, false, "successful trace", { name:error?.name,message:error?.message }); continue; }
    checkTrace(family,id,trace,fixture.expected.events ?? []);
    eq(family,`${id}:fixture-id`,trace.fixtureId ?? trace.scenario,scenario);
    compare(id,trace,fixture);
    let repeated = null; try { repeated = fn(scenario); } catch { /* invoke failure already represented */ }
    eq(family,`${id}:repeatable`,repeated,trace);
  }
}
if (loadFailure) for (const family of familyNames) record(family,"model-import",false,"importable production TypeScript model",loadFailure);
if (model) {
  for (const [family,,fn] of definitions) if (typeof fn === "function") {
    let thrown = null; try { fn("__unknown_s20_fixture__"); } catch (error) { thrown = error?.name; }
    eq(family,`${fn.name}:unknown-scenario`,thrown,"RangeError");
  }
}

let buildId = null; try { buildId = (await readFile(path.join(ROOT,".next/BUILD_ID"),"utf8")).trim(); } catch { /* source-only run */ }
if (process.env.PAPER3_EXPECTED_BUILD_ID) for (const family of familyNames) eq(family,"binding:build-id",buildId,process.env.PAPER3_EXPECTED_BUILD_ID);
const [candidateHashes, authoringHashes] = await Promise.all([hashCandidates(ROOT), hashCandidates(AUTHORING_ROOT)]);
const missingCandidateFiles = Object.entries(candidateHashes).filter(([,digest])=>!digest).map(([relative])=>relative);
const comparableFiles = section20CandidateFiles.filter(relative=>relative!=="content/paper3/lesson-status.json");
const candidateMatchesAuthoring = comparableFiles.every(relative=>candidateHashes[relative] && candidateHashes[relative]===authoringHashes[relative]);
for (const family of familyNames) {
  ok(family,"binding:candidate-files",missingCandidateFiles.length===0,"all Section 20 candidate files hashable");
  if (ROOT!==AUTHORING_ROOT) ok(family,"binding:authoring-match",candidateMatchesAuthoring,"isolated candidate matches authoring sources except promotion metadata");
}
const common = {
  schemaVersion:1, startedAt, completedAt:new Date().toISOString(), buildId, previewRoot:ROOT, isolatedPreview:ROOT!==AUTHORING_ROOT,
  sourceBoundToIsolatedPreview: ROOT!==AUTHORING_ROOT && Boolean(buildId) && candidateMatchesAuthoring && (!process.env.PAPER3_EXPECTED_BUILD_ID || buildId===process.env.PAPER3_EXPECTED_BUILD_ID),
  modelSha256, candidateHashes, missingCandidateFiles, candidateMatchesAuthoring,
  fixtureSha256:await hashFile(path.join(EVIDENCE,"MODEL_FIXTURES.json")), contractSha256:await hashFile(path.join(EVIDENCE,"SECTION20_MODEL_CONTRACTS.json")), oracleContractSha256:await hashFile(path.join(EVIDENCE,"SECTION20_QA_ORACLES.json")),
  independence:oracleContract.independence.requirement,
};
const names = { ADDRESSING_ASSEMBLY:"QA_ADDRESSING_ASSEMBLY_RESULT.json",OOP:"QA_OOP_RESULT.json",DECLARATIVE:"QA_DECLARATIVE_RESULT.json",FILE:"QA_FILE_RESULT.json",EXCEPTION:"QA_EXCEPTION_RESULT.json" };
let anyFailure = false;
for (const family of familyNames) {
  const failures = families[family].checks.filter(check=>!check.pass); anyFailure ||= failures.length>0;
  const report={...common,gate:`paper3-section20-${family.toLowerCase().replaceAll("_","-")}`,decision:failures.length?"FAIL":"PASS",assertions:families[family].assertions,passed:families[family].assertions-failures.length,failures,checks:families[family].checks};
  await writeFile(path.join(EVIDENCE,names[family]),`${JSON.stringify(report,null,2)}\n`);
  console.log(JSON.stringify({...report,checks:undefined},null,2));
}
if (anyFailure) process.exitCode=1;
