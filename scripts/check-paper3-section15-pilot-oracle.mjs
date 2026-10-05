import {rows,circuitPilotOracle} from './check-paper3-section15-oracle.mjs';
const stageNames=['IF','ID','OF','IE','WB'],boundNames=['IF_ID','ID_OF','OF_IE','IE_WB'];
const initial=()=>({clock:0,phase:'ready',stageOccupancy:Object.fromEntries(stageNames.map(x=>[x,null])),boundaryRegisters:Object.fromEntries(boundNames.map(x=>[x,null])),registers:Object.fromEntries(Array.from({length:6},(_,i)=>['R'+(i+1),0])),status:{Z:0},completed:[],nextFetch:'I1',restartPC:null,discarded:[],savedContext:null,contextRestored:false,handlerComplete:false});
export function pipelineExpected(id){
 let s=initial();const steps=[];const push=(id,fn)=>{const before=structuredClone(s);fn();steps.push({id,before,after:structuredClone(s)});};
 const cycle=(clock,local=clock,first=1)=>{
  s.clock=clock;const count=7-first;
  for(let j=0;j<5;j++){const serial=local-j,number=serial>=1&&serial<=count?serial+first-1:null;s.stageOccupancy[stageNames[j]]=number?'I'+number:null;if(j<4){s.boundaryRegisters[boundNames[j]]=number?{instructionId:'I'+number,nextStage:stageNames[j+1],...(j>=1?{destination:'R'+number}:{}),...(j>=2?{operands:[2*number,2*number+1]}:{}),...(j>=3?{result:4*number+1}:{})}:null;}}
  const wb=s.stageOccupancy.WB;if(wb){const n=Number(wb.slice(1));s.registers['R'+n]=4*n+1;s.completed.push(wb);}
  s.nextFetch=local<count?'I'+(first+local):null;
  s.phase=s.completed.length===6?'complete':s.stageOccupancy.IF===null?'drain':s.stageOccupancy.WB!==null?'full':first===1?'fill':'refill';
 };
 push('ready',()=>{});for(let c=1;c<=(id==='ideal'?10:5);c++)push('cycle-'+c,()=>cycle(c));
 if(id!=='ideal'){
  push('save-and-flush',()=>{s.phase='interrupt-saved';s.savedContext={registers:structuredClone(s.registers),status:{...s.status},restartPC:'I2'};s.restartPC='I2';s.discarded=['I2','I3','I4','I5'];s.stageOccupancy=initial().stageOccupancy;s.boundaryRegisters=initial().boundaryRegisters;s.nextFetch=null;});
  push('service-interrupt',()=>{s.phase='handler-complete';s.handlerComplete=true;});push('restore-context',()=>{s.phase='restored';s.contextRestored=true;s.nextFetch='I2';});
  for(let local=1;local<=9;local++)push('restart-cycle-'+(local+5),()=>cycle(local+5,local,2));
 }
 return{initial:initial(),steps};
}
export function circuitExpected(id,inputRow){
 const names=id==='2-input'?['A','B']:['A','B','C'],inputs=Object.fromEntries(names.map((n,i)=>[n,Number(inputRow[i])])),values=circuitPilotOracle(id==='2-input'?'two-input':'three-input',inputs),nodeIds=Object.keys(values);
 const all=rows(names).map(r=>({bits:names.map(n=>r[n]).join(''),inputs:r,values:circuitPilotOracle(id==='2-input'?'two-input':'three-input',r)})),ones=all.filter(r=>r.values.y===1).map(r=>r.bits),terms=ones.map(bits=>names.map((n,i)=>bits[i]==='1'?n:'NOT '+n).join(' AND '));
 const initial={inputBits:inputs,nodeValues:Object.fromEntries(nodeIds.map(n=>[n,null])),recordedRows:[],highlightedOneRows:[],sopTerms:[],representation:'original-circuit',activeNode:null,equivalent:null};let s=structuredClone(initial);const steps=[];const push=(id,fn)=>{const before=structuredClone(s);fn();steps.push({id,before,after:structuredClone(s)})};
 push('inputs',()=>{});for(const n of nodeIds)push('gate-'+n,()=>{s.nodeValues[n]=values[n];s.activeNode=n});push('record-row',()=>{s.recordedRows=[inputRow];s.activeNode=null});push('complete-table',()=>{s.recordedRows=all.map(r=>r.bits)});push('select-ones',()=>{s.highlightedOneRows=ones});push('derive-sop',()=>{s.sopTerms=terms;s.representation='canonical-sop'});push('rebuild-circuit',()=>{s.representation='sop-circuit'});push('verify-equivalence',()=>{s.equivalent=all.every(r=>Number(ones.includes(r.bits))===r.values.y)});
 return{initial,steps,all,ones,terms};
}

