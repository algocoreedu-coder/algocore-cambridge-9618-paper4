import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,EVIDENCE_DIR,PREVIEW_ROOT} from './check-paper3-section15-browser-helpers.mjs';
import * as q from './check-paper3-section15-full-oracle.mjs';
const sourceRoot=PREVIEW_ROOT||ROOT;
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const fixturePath=path.join(EVIDENCE_DIR,'TEACHER_SCALE_FIXTURES.json');
const fixture=JSON.parse(await readFile(fixturePath,'utf8'));
const fixtureHash=await hash(fixturePath);
const sourceFiles=['app/lib/paper3/logic-scale-models.ts','app/lib/paper3/hardware-scale-models.ts'];
const startHashes=Object.fromEntries(await Promise.all(sourceFiles.map(async p=>[p,await hash(path.join(sourceRoot,p))])));
const logic=await import(pathToFileURL(path.join(sourceRoot,sourceFiles[0])));
const hardware=await import(pathToFileURL(path.join(sourceRoot,sourceFiles[1])));
let assertions=0;const checks=[];
const eq=(a,b,m)=>{assertions++;assert.deepStrictEqual(a,b,m);};
const ok=(v,m)=>{assertions++;assert.ok(v,m);};
const throws=(fn)=>{assertions++;assert.throws(fn,RangeError);};
const group=async(id,fn)=>{const start=assertions;try{await fn();checks.push({id,pass:true,assertions:assertions-start});}catch(e){checks.push({id,pass:false,assertions:assertions-start,error:e.stack});}};
const frozen=v=>v===null||typeof v!=='object'||Object.isFrozen(v)&&Object.values(v).every(frozen);
const clean=s=>s.replace(/\s+/g,'');
await group('reviewed-fixture-binding',()=>{eq(fixtureHash,'0e44d8575e9145174f5a04c3ce648753bb2757b87aff21aae9742ec96fa815f8');eq(fixture.status,'FROZEN_ACADEMIC_DOMAIN');});
await group('fixture-independent-hardware-arithmetic',()=>{
 const f=fixture.riscCisc;eq(f.resultMemory.Z,f.initialMemory.X+f.initialMemory.Y);eq(f.clockCounts,null);eq(f.profiles.risc.instructionCount,f.profiles.risc.instructions.length);eq(f.profiles.cisc.instructionCount,f.profiles.cisc.instructions.length);
 for(const s of fixture.flynn.scenarios){if(s.id==='mpp-sum'){eq(s.localSums,s.partitions.map(p=>p.reduce((a,b)=>a+b,0)));eq(s.combined,s.partitions.flat().reduce((a,b)=>a+b,0));eq(s.processorCountClaim,null);}else{const streams=q.flynnExpected(s.lanes.map(l=>l.operation),s.lanes.map((l,i)=>s.id==='misd'?'shared':`stream-${i}`));eq(streams.instructionStreams,s.instructionStreams);eq(streams.dataStreams,s.dataStreams);eq(streams.classification,s.id.toUpperCase());for(const l of s.lanes)eq(l.output,l.operation==='add1'?l.input+1:l.input*Number(l.operation.slice(5)));}}
 const vm=fixture.virtualMachine;for(const s of vm.scenarios.filter(s=>s.request?.deltaGiB)){const requested=vm.reserveGiB+Object.values(vm.initialGuestsGiB).reduce((a,b)=>a+b,0)+s.request.deltaGiB;eq(s.requestedUsedGiB,requested);eq(s.allowed,requested<=vm.capacityGiB);const guests={...vm.initialGuestsGiB};if(s.allowed)guests[s.request.vm]+=s.request.deltaGiB;eq(s.finalGuestsGiB,guests);eq(s.finalUsedGiB,vm.reserveGiB+Object.values(guests).reduce((a,b)=>a+b,0));eq(s.finalFreeGiB,vm.capacityGiB-s.finalUsedGiB);}
 let guests=vm.lifecycle.initialGuests;for(const action of vm.lifecycle.actions){const r=q.vmLifecycleExpected(guests,action,vm.capacityGiB,vm.reserveGiB);eq(r.allowed,action.allowed);eq(r.usedGiB,action.usedGiB);eq(r.guests.find(g=>g.id===action.vm).status,action.expectedStatus);if(action.requestedUsedGiB)eq(r.requestedUsedGiB,action.requestedUsedGiB);guests=r.guests;}
});
await group('hardware-all-reviewed-before-after-states',()=>{
 const cases=[...['risc','cisc'].map(p=>['risc','add-memory',p]),...fixture.flynn.scenarios.map(s=>['flynn',s.id]),...[...fixture.virtualMachine.scenarios.map(s=>s.id),'lifecycle'].map(id=>['vm',id])];
 for(const[family,id,profile]of cases){const expected=q.hardwareScaleExpected(family,id,fixture,profile),actual=family==='risc'?hardware.riscCiscTrace(id,profile):family==='flynn'?hardware.flynnTrace(id):hardware.virtualMachineTrace(id);eq(actual.initial,expected.initial);eq(actual.steps.map(({id,before,after})=>({id,before,after})),expected.steps,`${family}/${id}/${profile??''}`);ok(frozen(actual));for(const s of actual.steps)for(const field of ['title','action','why','outcome'])for(const lang of ['en','vi'])ok(typeof s[field][lang]==='string'&&s[field][lang].length>0);if(family==='risc'){eq(actual.instructions,fixture.riscCisc.profiles[profile].instructions);eq(actual.steps.at(-1).after.memory.Z,fixture.riscCisc.initialMemory.X+fixture.riscCisc.initialMemory.Y);for(const[s,f]of actual.steps.map((s,i)=>[s,fixture.riscCisc.profiles[profile].steps[i]]))for(const field of ['title','action','why','outcome'])eq(s[field],f[field]);}}
 for(const bad of ['',undefined,'__proto__','bad']){throws(()=>hardware.flynnTrace(bad));throws(()=>hardware.virtualMachineTrace(bad));throws(()=>hardware.riscCiscTrace('add-memory',bad));throws(()=>hardware.riscCiscTrace(bad,'risc'));}
});
await group('VM-reserved-RAM-lifecycle-rejections-and-boundaries',()=>{
 let state=hardware.vmInitialState();for(const action of fixture.virtualMachine.lifecycle.actions){const before=structuredClone(state),e=q.vmLifecycleExpected(before.guests,action,before.capacityGiB,before.reserveGiB),a=hardware.vmTransition(state,action);eq(a.allowed,e.allowed);eq(a.after.guests,e.guests);eq(hardware.vmUsage(a.after),{usedGiB:e.usedGiB,freeGiB:e.freeGiB});eq(state,before,'input state not mutated');eq(a.after.hostRunning,true);ok(frozen(a));if(!a.allowed)eq(a.after,before);state=a.after;}
 const base=hardware.vmInitialState(),stopped=hardware.vmTransition(base,{type:'stop',vm:'A'}).after;
 for(const before of [base,stopped])for(const action of [{type:'create',vm:'A',ramGiB:2},{type:'create',vm:'C',ramGiB:4},{type:'create',vm:'C',ramGiB:5},{type:'resize',vm:'A',ramGiB:8},{type:'resize',vm:'A',ramGiB:9},{type:'resize',vm:'A',ramGiB:0},{type:'resize',vm:'A',ramGiB:-1},{type:'resize',vm:'A',ramGiB:NaN},{type:'resize',vm:'A',ramGiB:Infinity},{type:'resize',vm:'A',ramGiB:1.5},{type:'start',vm:'C'},{type:'stop',vm:'C'}]){const e=q.vmLifecycleExpected(before.guests,action),a=hardware.vmTransition(before,action);eq(a.allowed,e.allowed);eq(a.after.guests,e.guests);eq(hardware.vmUsage(a.after),{usedGiB:e.usedGiB,freeGiB:e.freeGiB});if(!a.allowed)eq(a.after,before);}
 for(const vm of ['', '__proto__','D'])eq(hardware.vmTransition(base,{type:'start',vm}).allowed,false);
 const stoppedB=hardware.vmTransition(base,{type:'stop',vm:'B'}).after;eq(hardware.vmUsage(stoppedB),hardware.vmUsage(base));eq(stoppedB.guests[0],base.guests[0]);eq(base.guests[1].status,'running');
});
await group('adders-all-inputs-all-state-transitions',()=>{
 for(const kind of ['half','full'])for(const inputs of q.inputRows(kind==='half'?['A','B']:['A','B','Cin'])){
  const e=q.adderExpected(kind,inputs.A,inputs.B,inputs.Cin??0),vector=Object.values(inputs).join(''),trace=logic.adderTrace(kind,vector);
  eq(trace.result,{A:e.a,B:e.b,Cin:kind==='half'?null:e.cin,p:e.firstSum,c1:e.firstCarry,c2:kind==='half'?null:e.secondCarry,sum:e.sum,carry:e.carry,total:e.numericTotal});
  const row=fixture.adders[kind].rows.find(r=>r.A===e.a&&r.B===e.b&&(kind==='half'||r.Cin===e.cin));eq(row.S,e.sum);eq(row[kind==='half'?'C':'Cout'],e.carry);eq(row.total,e.numericTotal);
  eq(trace.steps.map(s=>s.id),fixture.adders[kind].stepIds);eq(trace.initial.inputs,inputs);ok(frozen(trace));
  let expected={inputs,known:{p:null,c1:null,sum:null,carry:null,...(kind==='full'?{c2:null}:{})},active:null,verified:false};eq(trace.initial,expected);
  const computed={p:e.firstSum,c1:e.firstCarry,c2:e.secondCarry,sum:e.sum,carry:e.carry};const nodes={'xor-ab':'p','and-ab':'c1','xor-cin':'sum','and-cin':'c2','carry-or':'carry'};
  for(const s of trace.steps){eq(s.before,expected);const active=nodes[s.id]??null,known={...expected.known};if(active)known[active]=computed[active];if(kind==='half'&&active==='p')known.sum=e.sum;if(kind==='half'&&active==='c1')known.carry=e.carry;expected={inputs,known,active,verified:s.id==='numeric-check'};eq(s.after,expected);}
  eq(trace.steps.at(-1).after.known.sum+2*trace.steps.at(-1).after.known.carry,e.numericTotal);
 }
 for(const args of [['half',''],['half','2'],['half','010'],['full','01'],['bad','00']])throws(()=>logic.adderTrace(...args));
});
await group('storage-conventions-every-transition-and-invalid-release',()=>{
 eq(q.srFixtureExpected(fixture.flipFlops.sr.events),fixture.flipFlops.sr.events);eq(q.jkFixtureExpected(fixture.flipFlops.jk.events),fixture.flipFlops.jk.events);
 for(const state of [{Q:0,Qbar:1,status:'known'},{Q:1,Qbar:0,status:'known'},{Q:0,Qbar:0,status:'invalid'},{Q:null,Qbar:null,status:'indeterminate'}])for(const S of [0,1])for(const R of [0,1]){const e=q.srExpected({convention:'active-high-NOR',a:S,b:R,previousQ:state.status==='known'?state.Q:null});eq(logic.srTransition(state,S,R),{Q:e.forcedOutputs?.[0]??e.q,Qbar:e.forcedOutputs?.[1]??e.qBar,status:e.action==='invalid'?'invalid':e.known?'known':'indeterminate'});}
 for(const previousQ of [0,1])for(const J of [0,1])for(const K of [0,1])for(const edge of [false,true])eq(logic.jkTransition(previousQ,J,K,edge),q.jkExpected({j:J,k:K,previousQ,previousClock:edge?0:1,clock:1}).q);
 for(const kind of ['sr-nor','jk-edge'])for(const Q of [0,1])for(const a of [0,1])for(const b of [0,1])for(const edge of [false,true]){const before={kind,input1:0,input2:0,Q,Qbar:1-Q,previousQ:Q,status:'known',activeEdge:false};eq(logic.flipTransition(before,a,b,edge),q.flipStateExpected(before,a,b,edge));}
 for(const [key,kind]of [['sr','sr-nor'],['jk','jk-edge']]){const trace=logic.flipFlopTrace(kind);eq(trace.steps.map(s=>s.id),fixture.flipFlops[key].events.map(e=>e.id));let previous=trace.initial;for(const[s,e]of trace.steps.map((s,i)=>[s,fixture.flipFlops[key].events[i]])){eq(s.title,q.storageEventTitle(s.id));eq(s.before,previous);eq(s.after.Q,e.Q);eq(s.after.Qbar,e.Qbar);eq(s.after.input1,e.S??e.J);eq(s.after.input2,e.R??e.K);eq(s.after.activeEdge,e.activeEdge??false);previous=s.after;}ok(frozen(trace));}
 throws(()=>logic.jkTransition(2,0,0,true));throws(()=>logic.srTransition({Q:0,Qbar:1,status:'known'},1,2));throws(()=>logic.flipFlopTrace('nand'));
});
await group('boolean-laws-exhaustive-equivalence-and-error-paths',()=>{
 for(const chain of fixture.simplification.chains){const trace=logic.simplificationTrace(chain.id);eq(trace.steps.map(s=>s.id),chain.steps.map(s=>s.id));for(let i=0;i<chain.steps.length;i++){const s=trace.steps[i],f=chain.steps[i],oracle=q.compareBoolean(chain.steps[0].expression,f.expression,['A','B']);eq(clean(s.after.expression),clean(f.expression));eq(oracle.rows.map(r=>r.right),chain.outputs);eq(s.after.rows.map(r=>[r.original,r.candidate]),oracle.rows.map(r=>[r.left,r.right]));ok(s.after.equivalent);if(i)eq(s.before,trace.steps[i-1].after);const choices=logic.simplificationChoices(chain.id,i);for(const c of choices){const expected=q.compareBoolean(chain.steps[0].expression,c.expression,['A','B']);const a=logic.simplificationAttempt(chain.steps[0].expression,c.expression,['A','B']);eq(a.equivalent,expected.equivalent);eq(a.rows.map(r=>[r.original,r.candidate]),expected.rows.map(r=>[r.left,r.right]));}}ok(frozen(trace));}
 const f=fixture.simplification.invalidCandidate,e=q.compareBoolean(f.original,f.candidate,['A','B']),a=logic.simplificationAttempt(f.original,f.candidate,['A','B']);eq(e.rows.filter(r=>r.left!==r.right).map(r=>Object.values(r.inputs).join('')),f.counterexampleRows);eq(a.equivalent,false);eq(a.rows.map(r=>r.original),f.originalOutputs);eq(a.rows.map(r=>r.candidate),f.candidateOutputs);eq(a.counterexample.bits,f.counterexampleRows[0]);eq(logic.simplificationAttempt(f.original,f.correct,['A','B']).equivalent,true);
 for(const expression of ['', 'A AND','(A OR B','A;process.exit()','E OR A','A AND 2','A'.repeat(257)])eq(logic.simplificationAttempt('A',expression,['A','B']).validSyntax,false);
 for(const formula of ['A OR B AND C','NOT A XOR B OR C','NOT (A OR B) AND (C XOR D)','1 AND A OR 0',...fixture.simplification.chains.flatMap(c=>c.steps.map(s=>s.expression))])for(const inputs of q.inputRows(['A','B','C','D'])){eq(logic.evaluateBoolean(logic.parseBoolean(formula),inputs),q.booleanValue(q.parseBoolean(formula),inputs));eq(logic.booleanCircuit(formula,inputs),q.booleanCircuitExpected(formula,inputs));}
});
await group('karnaugh-every-selection-Gray-wrap-overlap-and-equivalence',()=>{
 for(const f of fixture.karnaugh.examples){const map=logic.karnaughMap(f.id),layout=q.mapLayout(f.variables);eq(map.cells.map(c=>c.id),layout.cells.flat());eq(map.cells.map(c=>c.value),layout.cells.flat().map(n=>Number(f.ones.includes(n))));eq(map.rowLabels,f.rowLabels);eq(map.columnLabels,f.columnLabels);
  const n=2**f.variables.length;for(let mask=0;mask<2**n;mask++){const selected=Array.from({length:n},(_,i)=>i).filter(i=>mask&(1<<i)),e=q.kmapGroupExpected(f.variables,f.ones,selected),a=logic.validateKarnaughGroup(f.id,selected);eq(a.valid,e.valid,`${f.id}: ${selected}`);if(e.valid)eq(a.term,e.term);}
  for(const group of f.groups){const e=q.kmapGroupExpected(f.variables,f.ones,group.cells);ok(e.valid);eq(e.term,group.term);}
  const groups=f.groups.map(g=>g.cells),e=q.kmapCoverageExpected(f.variables,f.ones,groups),a=logic.karnaughSolution(f.id,groups);ok(e.equivalent);ok(a.complete);eq(a.covered,e.coverage);eq(a.rows.map(r=>[r.original,r.candidate]),e.rows.map(r=>[r.expected,r.actual]));ok(q.compareBoolean(a.expression,f.expression,f.variables).equivalent);
  const trace=logic.karnaughTrace(f.id);eq(trace.steps.map(s=>s.id),fixture.karnaugh.stateSchedule);eq(trace.steps.at(-1).after.verified,true);ok(frozen(trace));for(let i=1;i<trace.steps.length;i++)eq(trace.steps[i].before,trace.steps[i-1].after);
  eq(logic.karnaughSolution(f.id,[]).complete,false);eq(logic.validateKarnaughGroup(f.id,[f.ones[0],f.ones[0]]).reason,'duplicate');eq(logic.validateKarnaughGroup(f.id,[-1]).valid,false);eq(logic.validateKarnaughGroup(f.id,[NaN]).valid,false);
 }
 for(const f of fixture.karnaugh.invalidGroups)eq(logic.validateKarnaughGroup(f.exampleId,f.cells).valid,false);
 eq(logic.validateKarnaughGroup('four-input-corners',[0,2,8,10]).wrapsRows,true);eq(logic.validateKarnaughGroup('four-input-corners',[0,2,8,10]).wrapsColumns,true);
 throws(()=>logic.karnaughMap('__proto__'));
});
await group('source-stable-and-immutable',async()=>{for(const p of sourceFiles){eq(await hash(path.join(sourceRoot,p)),startHashes[p]);if(PREVIEW_ROOT)eq(await hash(path.join(ROOT,p)),startHashes[p]);}eq(await hash(fixturePath),fixtureHash);});
const report={schemaVersion:1,checkedAt:new Date().toISOString(),decision:checks.every(c=>c.pass)?'SCALE_MODELS_PASS':'FAIL',scope:'Seven scale product models versus independent value/state oracles and separate Teacher fixture parity. Two pilot regression, nine-lesson browser and final release gate are not covered by this report.',sourceRoot,buildId:PREVIEW_ROOT?(await readFile(path.join(PREVIEW_ROOT,'.next/BUILD_ID'),'utf8')).trim():null,fixtureSha256:fixtureHash,sourceHashes:startHashes,assertions,checks};
await writeFile(path.join(EVIDENCE_DIR,'QA_FULL_MODELS_RESULT.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
