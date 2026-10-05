import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { conversionTrace, normalisationTrace, floatingRange, approximation, hashAddress, hashTrace, setResult, decodeFloating, fileOrganisationTrace, fileArrivalKeys } from "../app/lib/paper3/visual-models.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/chapter13");
const groups = [];
let assertions = 0;
function check(condition, message) { assertions++; assert.ok(condition, message); }
function equal(actual, expected, message) { assertions++; assert.deepEqual(actual, expected, message); }
function rejects(fn, message) { assertions++; assert.throws(fn, undefined, message); }
async function group(id, label, run) { const before = assertions; try { await run(); groups.push({ id, label, pass: true, assertions: assertions - before }); } catch (error) { groups.push({ id, label, pass: false, assertions: assertions - before, failure: error.stack ?? String(error) }); } }

// Independent oracle: enumerate bit patterns, apply each signed bit's place value,
// then select from the sorted representable values. No model helper computes expected results.
const pow = exponent => exponent >= 0 ? { n: 1n << BigInt(exponent), d: 1n } : { n: 1n, d: 1n << BigInt(-exponent) };
const add = (a, b) => ({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
const sub = (a, b) => ({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
const mul = (a, b) => ({ n: a.n * b.n, d: a.d * b.d });
const abs = a => ({ n: a.n < 0n ? -a.n : a.n, d: a.d });
const cmp = (a, b) => { const delta = a.n * b.d - b.n * a.d; return delta < 0n ? -1 : delta > 0n ? 1 : 0; };
const bits = (unsigned, width) => unsigned.toString(2).padStart(width, "0");
const read = text => {
  if (text.includes("/")) { const [n, d] = text.split("/"); return { n: BigInt(n), d: BigInt(d) }; }
  const negative = text.trim().startsWith("-"); const [whole, fraction = ""] = text.trim().replace(/^[+-]/, "").split(".");
  return { n: BigInt(whole + fraction) * (negative ? -1n : 1n), d: 10n ** BigInt(fraction.length) };
};
function decimal(value) {
  const magnitude = abs(value); let remainder = magnitude.n % magnitude.d; let tail = "";
  for (let count = 0; remainder && count < 100; count++) { remainder *= 10n; tail += remainder / magnitude.d; remainder %= magnitude.d; }
  assert.equal(remainder, 0n, "Oracle input must have a terminating decimal");
  return `${value.n < 0n ? "-" : ""}${magnitude.n / magnitude.d}${tail ? `.${tail}` : ""}`;
}
function signedExponent(binary) { return [...binary].reduce((sum, bit, index) => sum + (bit === "1" ? (index === 0 ? -1 : 1) * 2 ** (binary.length - 1 - index) : 0), 0); }
function oracleDecode(mantissa, exponent) {
  let value = { n: 0n, d: 1n };
  [...mantissa].forEach((bit, index) => { if (bit === "1") value = add(value, index === 0 ? { n: -1n, d: 1n } : pow(-index)); });
  return mul(value, pow(signedExponent(exponent)));
}
function representations(mBits, eBits) {
  const values = [];
  for (let m = 0; m < 2 ** mBits; m++) for (let e = 0; e < 2 ** eBits; e++) {
    const mantissa = bits(m, mBits); const exponent = bits(e, eBits);
    if (mantissa[0] !== mantissa[1]) values.push({ mantissa, exponent, value: oracleDecode(mantissa, exponent) });
  }
  return values.sort((a, b) => cmp(a.value, b.value));
}
function same(actualText, expected, message) { check(cmp(read(actualText), expected) === 0, `${message}: actual ${actualText}, expected ${decimal(expected)}`); }
function oracleApprox(input, table, policy) {
  if (input.n === 0n) return { status: "exact", value: input, lower: input, upper: input };
  const candidates = table.filter(entry => (entry.value.n < 0n) === (input.n < 0n));
  const byMagnitude = [...candidates].sort((a, b) => cmp(abs(a.value), abs(b.value)));
  if (cmp(abs(input), abs(byMagnitude[0].value)) < 0) return { status: "underflow" };
  if (cmp(abs(input), abs(byMagnitude.at(-1).value)) > 0) return { status: "overflow" };
  const exact = candidates.find(entry => cmp(entry.value, input) === 0);
  if (exact) return { ...exact, status: "exact", lower: exact.value, upper: exact.value };
  const lower = candidates.filter(entry => cmp(entry.value, input) < 0).at(-1);
  const upper = candidates.find(entry => cmp(entry.value, input) > 0);
  let chosen;
  if (policy === "truncate") chosen = input.n < 0n ? upper : lower;
  else {
    const distanceComparison = cmp(abs(sub(input, lower.value)), abs(sub(upper.value, input)));
    chosen = distanceComparison < 0 ? lower : distanceComparison > 0 ? upper : input.n < 0n ? lower : upper;
  }
  return { ...chosen, status: "rounded", lower: lower.value, upper: upper.value };
}

await group("CH13-M01", "Decode every short-format bit pattern against independent signed place weights", () => {
  for (const mBits of [3, 4, 5, 6]) for (const eBits of [2, 3, 4]) {
    for (let m = 0; m < 2 ** mBits; m++) for (let e = 0; e < 2 ** eBits; e++) {
      const mText = bits(m, mBits); const eText = bits(e, eBits);
      same(decodeFloating(mText, eText), oracleDecode(mText, eText), `decode ${mText}/${eText}`);
    }
  }
});

await group("CH13-M02", "Exact encode/decode traces round-trip all normalised short-format values", () => {
  for (const mBits of [3, 4, 5, 6]) for (const eBits of [2, 3, 4]) for (const expected of representations(mBits, eBits)) {
    const input = decimal(expected.value);
    for (const mode of ["encode", "decode"]) {
      const actual = conversionTrace(input, mode, mBits, eBits);
      equal([actual.mantissa, actual.exponent], [expected.mantissa, expected.exponent], `${mode} ${input} M${mBits}/E${eBits}`);
      same(actual.value, expected.value, `trace value ${input}`);
      equal([actual.steps.at(-1).mantissa, actual.steps.at(-1).exponent], [expected.mantissa, expected.exponent], "last snapshot equals answer");
      check(new Set(actual.steps.map(step => step.id)).size === actual.steps.length, "unique snapshot IDs");
      check(actual.steps.every(step => step.action.en && step.action.vi && step.why.en && step.why.vi), "every snapshot has bilingual action and reason");
    }
  }
});

await group("CH13-M03", "Pilot, signed powers of two, zero and exact-format rejection", () => {
  const fixtures = [["-13.25", "10010110", "0100"], ["6.5", "01101000", "0011"], ["0.375", "01100000", "1111"], ["-8", "10000000", "0011"], ["8", "01000000", "0100"], ["-128", "10000000", "0111"], ["127", "01111111", "0111"], ["0", "00000000", "0000"], ["-0", "00000000", "0000"]];
  for (const [input, m, e] of fixtures) { const trace = conversionTrace(input); equal([trace.mantissa, trace.exponent], [m, e], input); }
  const power = conversionTrace("-8");
  equal(power.steps.find(step => step.id === "add-one").mantissa, "11000000", "negative power-of-two intermediate is not yet normalised");
  equal(power.steps.find(step => step.id === "normalised").mantissa, "10000000", "negative power-of-two normalization is explicit");
  const negative = conversionTrace("-13.25");
  equal(negative.steps.find(step => step.id === "invert").mantissa, "10010101", "inversion is separate");
  equal(negative.steps.find(step => step.id === "add-one").mantissa, "10010110", "add-one is separate");
  for (const value of ["0.1", "128", "-129", "0.0009765625"]) rejects(() => conversionTrace(value), `reject unsupported exact value ${value}`);
  for (const value of ["", "NaN", "Infinity", "1e3", "1/2", "--1", "1.2.3", "x", "9".repeat(41)]) rejects(() => conversionTrace(value), `reject malformed input ${value}`);
  for (const [m, e] of [[2,4], [13,4], [8,1], [8,7], [8.5,4], [8,NaN]]) rejects(() => floatingRange(m,e), "reject unsupported width");
  rejects(() => decodeFloating("0100000x", "0000"), "reject nonbinary mantissa");
  rejects(() => normalisationTrace("00000000", "00x0"), "reject nonbinary exponent");
});

await group("CH13-M04", "Every normalisation snapshot preserves exact value and stops at zero/exponent floor", () => {
  for (const mBits of [3, 4, 5, 6]) for (const eBits of [2, 3]) for (let m = 0; m < 2 ** mBits; m++) for (let e = 0; e < 2 ** eBits; e++) {
    const mantissa = bits(m, mBits); const exponent = bits(e, eBits); const value = oracleDecode(mantissa, exponent);
    const trace = normalisationTrace(mantissa, exponent);
    for (const step of trace.steps) check(cmp(oracleDecode(step.mantissa, step.exponent), value) === 0, `normalisation invariant ${mantissa}/${exponent} ${step.id}`);
    check(trace.steps.length <= mBits + 2, "bounded normalisation trace");
    if (m === 0) equal([trace.status, trace.mantissa, trace.exponent], ["zero", "0".repeat(mBits), "0".repeat(eBits)], "canonical zero");
    else if (trace.status === "exact") check(trace.mantissa[0] !== trace.mantissa[1], "success requires unequal leading bits");
    else { equal(trace.status, "cannot-normalise", "only declared boundary failure"); equal(signedExponent(trace.exponent), -(2 ** (eBits - 1)), "failure stops at exponent minimum"); check(trace.mantissa[0] === trace.mantissa[1], "not-normalized floor remains explicit"); }
  }
  const fixed = normalisationTrace("11100110", "0110");
  equal([fixed.mantissa, fixed.exponent, fixed.value], ["10011000", "0100", "-13"], "teacher negative normalization fixture");
});

await group("CH13-M05", "Range extrema are enumerated, asymmetric and use declared fixed-exponent spacing", () => {
  for (const [mBits, eBits] of [[3,2], [4,3], [8,4], [9,3], [7,5], [6,6], [10,2]]) {
    const table = representations(mBits, eBits); const positive = table.filter(entry => entry.value.n > 0n); const negative = table.filter(entry => entry.value.n < 0n);
    const result = floatingRange(mBits, eBits);
    for (const [field, expected] of [["maximumPositive", positive.at(-1)], ["minimumPositive", positive[0]], ["mostNegative", negative[0]], ["negativeClosestToZero", negative.at(-1)]]) same(result[field], expected.value, `${field} M${mBits}/E${eBits}`);
    same(result.spacingAtExponentZero, pow(-(mBits - 1)), "fixed exponent zero spacing");
    for (const [field, text] of [["positiveMaxBits", "maximumPositive"], ["positiveMinBits", "minimumPositive"], ["negativeMinBits", "mostNegative"], ["negativeClosestBits", "negativeClosestToZero"]]) { const [m,e] = result[field].split(" / "); same(result[text], oracleDecode(m,e), "range bit pattern agrees"); }
  }
});

await group("CH13-M06", "Truncation/nearest and tie/carry transitions match enumeration between every adjacent short-format value", () => {
  for (const [mBits,eBits] of [[3,2],[4,3],[5,3]]) {
    const table = representations(mBits,eBits);
    const probes = [{n:0n,d:1n}];
    for (let i=0;i<table.length;i++) {
      probes.push(table[i].value);
      if (i+1<table.length && (table[i].value.n<0n)===(table[i+1].value.n<0n)) {
        const difference = sub(table[i+1].value,table[i].value);
        for (const numerator of [1n,2n,3n]) probes.push(add(table[i].value,mul(difference,{n:numerator,d:4n})));
      }
    }
    for (const input of probes) for (const policy of ["truncate","nearest"]) {
      const expected = oracleApprox(input,table,policy); const inputText=decimal(input); const actual=approximation(inputText,mBits,eBits,policy);
      equal(actual.status, expected.status, `${inputText} ${policy} M${mBits}/E${eBits} status`);
      if (expected.value) {
        same(actual.represented, expected.value, `${inputText} ${policy} answer`);
        check(cmp(oracleDecode(actual.mantissa,actual.exponent),expected.value)===0,"rounded bit pattern decodes to oracle value");
        same(actual.error,sub(expected.value,input),"signed error is stored minus input");
        same(actual.absoluteError,abs(sub(expected.value,input)),"absolute error");
        same(actual.lower,expected.lower,"lower neighbouring representable value");
        same(actual.upper,expected.upper,"upper neighbouring representable value");
      }
    }
  }
});

await group("CH13-M07", "Published approximation examples and sign-specific range policy", () => {
  for (const [input,policy,mBits,expected] of [["13.375","truncate",6,"13"],["13.375","nearest",6,"13.5"],["-13.375","truncate",6,"-13"],["-13.375","nearest",6,"-13.5"],["13.25","nearest",6,"13.5"],["-13.25","nearest",6,"-13.5"],["5.88","truncate",8,"5.875"],["0.1","nearest",8,"0.099609375"],["0.1","truncate",8,"0.099609375"]]) same(approximation(input,mBits,4,policy).represented,read(expected),`${input} ${policy} M${mBits}/E4`);
  for (const [input,status] of [["128","overflow"],["-129","overflow"],["0.0009765625","underflow"],["-0.001953125","underflow"],["127.1","overflow"]]) {
    for(const policy of ["truncate","nearest"]) { const result=approximation(input,8,4,policy); equal(result.status,status,`${input}: check range before precision`); equal([result.represented,result.error,result.mantissa,result.exponent],[null,null,"",""],"out-of-range value does not invent stored bits"); }
  }
});

await group("CH13-M08", "MOD 7 collision search/insert, wrap, no overwrite and bounded exhaustion", () => {
  const keys=[10,17,24,6,13]; const original=[...keys]; const start=[13,null,null,10,17,24,6];
  const found=hashTrace(keys,24,"lookup"); equal(found.table,start,"independently placed initial table"); equal(found.steps.map(step=>step.index),[3,4,5],"lookup compares each colliding key"); equal(found.outcome,"found","existing key found");
  const missing=hashTrace(keys,31,"lookup"); equal(missing.steps.map(step=>step.index),[3,4,5,6,0,1],"lookup wraps and stops at first empty"); equal(missing.outcome,"missing","no false match from address alone");
  const inserted=hashTrace(keys,31,"insert"); equal(inserted.table,[13,31,null,10,17,24,6],"insert changes only first empty slot"); equal(inserted.steps[0].table,start,"earlier snapshots do not mutate after insertion"); equal(keys,original,"caller input preserved");
  const duplicate=hashTrace(keys,17,"insert"); equal(duplicate.outcome,"duplicate","duplicate rejected"); equal(duplicate.table,start,"duplicate does not overwrite");
  const fullKeys=[0,7,14,21,28,35,42];
  for(const operation of ["lookup","insert"]) { const result=hashTrace(fullKeys,49,operation); equal(result.steps.filter(step=>step.index>=0).length,7,"at most seven slots inspected"); equal(result.steps.at(-1).id,"bounded-stop","explicit stop after full traversal"); equal(result.outcome,operation==="lookup"?"missing":"full","full table outcome"); equal(result.table,fullKeys,"no overwrite on exhausted table"); }
  equal(hashTrace([6,13],20,"insert").steps.map(step=>step.index),[6,0,1],"wrap from slot6 to slot0");
  equal(hashTrace([10,10,17],17,"lookup").table.filter(value=>value!==null).length,2,"starting duplicates are not stored twice");
  rejects(()=>hashTrace([0,7,14,21,28,35,42,49],56,"insert"),"initial table cannot exceed capacity");
  for(const key of [-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]) rejects(()=>hashAddress(key),"invalid key rejected");
  for(const size of [0,1,21,2.5]) rejects(()=>hashAddress(10,size),"invalid table size rejected");
  for(let key=0;key<=100;key++) equal(hashAddress(key),key-7*Math.floor(key/7),"MOD7 address oracle");
});

await group("CH13-M09", "Set membership semantics, uniqueness, empty/disjoint cases and immutability", () => {
  const a=["red","blue","red"]; const b=["blue","green","green"]; const beforeA=[...a]; const beforeB=[...b];
  equal(setResult(a,b,"union"),["blue","green","red"],"union unique"); equal(setResult(a,b,"intersection"),["blue"],"intersection"); equal(setResult(a,b,"difference"),["red"],"difference left minus right");
  equal(setResult([],b,"union"),["blue","green"],"empty union"); equal(setResult(a,[],"intersection"),[],"empty intersection"); equal(setResult(["a"],["b"],"intersection"),[],"disjoint intersection"); equal(a,beforeA,"left unchanged"); equal(b,beforeB,"right unchanged");
});

await group("CH13-M10", "All 24 declared file organisation/access/workload combinations against fixed independent storage and path fixtures", () => {
  const layouts={serial:[25,12,31,18],sequential:[12,18,25,31],random:[null,null,null,31,25,12,18]};
  const afterInsert={serial:[25,12,31,18,22],sequential:[12,18,22,25,31],random:[null,22,null,31,25,12,18]};
  // Each fixture describes an observable pedagogical contract, not model helper output.
  const supported={
    'serial/sequential/find18':{path:[0,1,2,3],outcome:'found',output:[18]},
    'serial/sequential/find20':{path:[0,1,2,3],outcome:'missing',output:[]},
    'serial/sequential/insert22':{path:[],outcome:'inserted',output:[],active:4},
    'serial/sequential/read-all':{path:[0,1,2,3],outcome:'read',output:[25,12,31,18]},
    'sequential/sequential/find18':{path:[0,1],outcome:'found',output:[18]},
    'sequential/sequential/find20':{path:[0,1,2],outcome:'missing',output:[]},
    'sequential/sequential/insert22':{path:[],outcome:'inserted',output:[],active:2},
    'sequential/sequential/read-all':{path:[0,1,2,3],outcome:'read',output:[12,18,25,31]},
    'sequential/direct/find18':{path:[1],outcome:'found',output:[18]},
    'sequential/direct/find20':{path:[],outcome:'missing',output:[]},
    'random/direct/find18':{path:[4,5,6],outcome:'found',output:[18]},
    'random/direct/find20':{path:[6,0],outcome:'missing',output:[]},
    'random/direct/insert22':{path:[1],outcome:'inserted',output:[],active:1},
    'random/sequential/read-all':{path:[0,1,2,3,4,5,6],outcome:'read',output:[31,25,12,18]},
  };
  for(const organisation of ['serial','sequential','random']) for(const access of ['sequential','direct']) for(const task of ['find18','find20','read-all','insert22']) {
    const label=`${organisation}/${access}/${task}`; const expected=supported[label]; const trace=fileOrganisationTrace(organisation,access,task); const last=trace.steps.at(-1);
    equal(trace.steps[0].table,layouts[organisation],`${label}: initial storage`);
    equal(trace.supported,Boolean(expected),`${label}: supported only when explicitly modelled`);
    check(new Set(trace.steps.map(step=>step.id)).size===trace.steps.length,`${label}: unique snapshot IDs`);
    check(trace.steps.every(step=>step.title.en&&step.title.vi&&step.action.en&&step.action.vi&&step.why.en&&step.why.vi),`${label}: bilingual explanation on every state`);
    if(!expected) { equal(trace.steps.length,2,`${label}: bounded unsupported result`); equal(last.outcome,'unsupported',`${label}: explicit limitation`); equal(last.table,layouts[organisation],`${label}: unsupported operation does not mutate layout`); continue; }
    equal(last.outcome,expected.outcome,`${label}: final outcome`); equal(last.visited,expected.path,`${label}: actual inspected addresses`); equal(last.output,expected.output,`${label}: returned records`);
    equal(last.table,task==='insert22'?afterInsert[organisation]:layouts[organisation],`${label}: final layout`);
    if(expected.active!==undefined) equal(last.active,expected.active,`${label}: insertion highlight`);
    for(const step of trace.steps) {check(step.active>=-1&&step.active<step.table.length,`${label}: active index in bounds`); check(step.visited.every(position=>position>=0&&position<step.table.length),`${label}: path indices in bounds`);}
    if(task==='read-all') for(const step of trace.steps.slice(1)) { equal(step.output,layouts[organisation].slice(0,step.active+1).filter(key=>key!==null),`${label}: output prefix follows storage, excludes empty slots`);equal(step.outcome,step.table[step.active]===null?'scan':'read',`${label}: an empty inspected slot must not be labelled as a record read`); }
    if(task==='insert22') equal(trace.steps[0].table,layouts[organisation],`${label}: earlier snapshots retain original storage after insertion`);
  }
  equal(fileArrivalKeys,[25,12,31,18],'model never changes the shared arrival dataset');
  const indexRead=fileOrganisationTrace('sequential','direct','find18');
  check(indexRead.steps.some(step=>step.action.en.includes('Index[18] = position 2.')),'provided index uses one-based position 2, not key 18 as address');
  const rewrite=fileOrganisationTrace('sequential','sequential','insert22').steps.at(-1);
  check(rewrite.why.en.includes('index must be updated'),'sorted rewrite explicitly explains index maintenance');
  for(const arguments_ of [['bad','direct','find18'],['serial','bad','find18'],['serial','sequential','bad']]) rejects(()=>fileOrganisationTrace(...arguments_),'unknown scenario rejected, not silently substituted');
});

await group("CH13-M11", "Binary loss display is an exact expansion with independently decoded recurring fractions and a valid rounding decision", () => {
  // Interpret the displayed periodic series algebraically; do not use the model's long-division routine.
  const parseBinary = text => {
    const match=/^(\d+)(?:\.([01]*)(?:\(([01]+)\))?)?$/.exec(text);
    check(Boolean(match),`parse exact binary display ${text}`);
    const whole=BigInt('0b'+match[1]);const prefix=match[2]??'';const repeat=match[3]??'';
    let value={n:whole,d:1n};if(prefix)value=add(value,{n:BigInt('0b'+prefix),d:1n<<BigInt(prefix.length)});
    if(repeat)value=add(value,{n:BigInt('0b'+repeat),d:(1n<<BigInt(prefix.length))*((1n<<BigInt(repeat.length))-1n)});
    return value;
  };
  const validateDisplay=(text,value,label)=>{
    if(!text.endsWith('…'))check(cmp(parseBinary(text),value)===0,`${label}: periodic binary reconstructs the exact rational`);
    else {const prefix=text.slice(0,-1);const length=prefix.split('.')[1].length;const lower=parseBinary(prefix);check(length===64,`${label}: bounded prefix length`);check(cmp(lower,value)<=0&&cmp(value,add(lower,pow(-length)))<0,`${label}: ellipsis denotes an exact containing interval, not rounded digits`);}
  };
  const probes=['13.375','-13.375','13.25','-13.25','0.1','-0.1','0.12345','-0.12345','0.999','-0.999','15.99','-15.99'];
  for(let i=1;i<=127;i++)probes.push(`${Math.floor(i/10)}.${i%10}`);
  for(const input of probes)for(const mBits of [3,6,8])for(const policy of ['truncate','nearest']) {
    const result=approximation(input,mBits,4,policy);
    if(result.status!=='rounded'){check(result.bitLoss===undefined,'exact and range-error cases do not claim discarded rounded bits');continue;}
    const loss=result.bitLoss;check(Boolean(loss),'rounded result provides loss information');const value=abs(read(input));
    validateDisplay(loss.originalBinary,value,'original magnitude');const normalised=mul(value,pow(-loss.exponent));validateDisplay(loss.normalisedBinary,normalised,'scaled magnitude');
    check(cmp(normalised,{n:1n,d:2n})>=0&&cmp(normalised,{n:1n,d:1n})<0,'scaled pre-quantisation magnitude lies in [1/2,1)');
    equal(loss.keptBits.length,mBits-1,'kept fractional bits use only the available mantissa fraction width');
    const kept={n:BigInt('0b'+loss.keptBits),d:1n<<BigInt(mBits-1)};
    const discarded=sub(mul(normalised,{n:1n<<BigInt(mBits-1),d:1n}),{n:BigInt('0b'+loss.keptBits),d:1n});
    check(cmp(discarded,{n:0n,d:1n})>0&&cmp(discarded,{n:1n,d:1n})<0,'discarded part is a strictly positive fractional remainder');
    validateDisplay('0.'+loss.discardedBits,discarded,'discarded tail');
    equal(loss.increment,policy==='nearest'&&cmp(discarded,{n:1n,d:2n})>=0,'increment reflects nearest with ties away from zero; truncation never increments');
    const roundedMagnitude=mul(add(kept,loss.increment?pow(-(mBits-1)):{n:0n,d:1n}),pow(loss.exponent));
    check(cmp(roundedMagnitude,abs(read(result.represented)))===0,'kept bits plus indicated increment reconstruct the actual rounded magnitude, including carry');
    if(![loss.originalBinary,loss.normalisedBinary,loss.discardedBits].some(text=>text.endsWith('…')))equal(loss.repeats,[loss.originalBinary,loss.normalisedBinary,loss.discardedBits].some(text=>text.includes('(')),'repeat flag matches a demonstrated recurring cycle');
  }
  for(const policy of ['truncate','nearest']) {
    const finite=approximation('13.375',6,4,policy).bitLoss;
    equal([finite.originalBinary,finite.normalisedBinary,finite.exponent,finite.keptBits,finite.discardedBits,finite.repeats],['1101.011','0.1101011',4,'11010','11',false],'finite curriculum example exposes retained and discarded bits');
    const recurring=approximation('0.1',8,4,policy).bitLoss;
    equal([recurring.exponent,recurring.keptBits,recurring.repeats,recurring.increment],[-3,'1100110',true,false],'recurring curriculum example keeps seven fractional bits without increment');
  }
});

await mkdir(EVIDENCE,{recursive:true});
const failures=groups.filter(group=>!group.pass);
const report={schemaVersion:1,scope:"Independent exact mathematical/hash/set/file-organisation model verification only; not browser, lesson prose, deployment or learner acceptance",checkedAt:new Date().toISOString(),node:process.version,modelSha256:createHash("sha256").update(await readFile(path.join(ROOT,"app/lib/paper3/visual-models.ts"))).digest("hex"),oracle:"Signed bit place-value enumeration and exact BigInt rational comparison, independent of model helpers; rounding selected from sorted representable values; fixed file-layout/path fixtures",groups:groups.length,passed:groups.length-failures.length,assertions,decision:failures.length?"FAIL":"PASS",failures,results:groups};
await writeFile(path.join(EVIDENCE,"QA_MODELS_RESULT.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({...report,results:undefined},null,2));
if(failures.length)process.exitCode=1;
