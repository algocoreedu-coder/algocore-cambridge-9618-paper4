// QA-owned mathematical oracle. No production imports, fixtures or helper outputs.
// Circuit and interrupt conventions must be selected explicitly by the approved contract.
export const bit=x=>{if(x!==0&&x!==1)throw new RangeError('Expected bit');return x};
export function rows(names){if(new Set(names).size!==names.length||names.length>8)throw new RangeError('QA enumeration domain');return Array.from({length:2**names.length},(_,i)=>Object.fromEntries(names.map((n,j)=>[n,(i>>(names.length-j-1))&1])));}
export function evaluate(tree,inputs){
 if(typeof tree==='string'){if(!(tree in inputs))throw Error('Undefined QA variable '+tree);return bit(inputs[tree]);}
 if(typeof tree==='number')return bit(tree);
 const[op,...args]=tree;const v=args.map(a=>evaluate(a,inputs));
 if(op==='NOT'&&v.length===1)return 1-v[0];
 if(['AND','NAND','OR','NOR'].includes(op)&&v.length>=2){const base=op==='AND'||op==='NAND'?Number(v.every(Boolean)):Number(v.some(Boolean));return op==='NAND'||op==='NOR'?1-base:base;}
 if(['XOR','XNOR'].includes(op)&&v.length===2){const base=Number(v[0]!==v[1]);return op==='XNOR'?1-base:base;}
 throw new RangeError('Undefined gate/arity; multi-input XOR convention is deliberately not assumed');
}
export function equivalent(a,b,names){const counterexample=rows(names).find(r=>evaluate(a,r)!==evaluate(b,r));return{equivalent:!counterexample,counterexample:counterexample??null};}
export function addBits(a,b,carryIn=0){const total=bit(a)+bit(b)+bit(carryIn);return{sum:total%2,carry:Math.floor(total/2)};}
export function flipFlop({kind,convention,a,b,q,event}){
 bit(a);bit(b);bit(q);
 if(kind==='SR'&&convention==='active-high-NOR-latch'){if(a&&b)return{valid:false,q:null,action:'invalid'};return{valid:true,q:a?1:b?0:q,action:a?'set':b?'reset':'hold'};}
 if(kind==='SR'&&convention==='active-low-NAND-latch'){if(!a&&!b)return{valid:false,q:null,action:'invalid'};return{valid:true,q:!a?1:!b?0:q,action:!a?'set':!b?'reset':'hold'};}
 if(kind==='JK'&&convention==='positive-edge-triggered'){if(!['rising','falling','stable-low','stable-high'].includes(event))throw new RangeError('Clock event required');if(event!=='rising')return{valid:true,q,action:'hold'};return{valid:true,q:a?(b?1-q:1):(b?0:q),action:a?(b?'toggle':'set'):(b?'reset':'hold')};}
 throw new RangeError('Unapproved flip-flop convention');
}
export function idealPipeline(instructions,stageNames){
 if(!Number.isInteger(instructions)||instructions<1||instructions>32||!stageNames.length||new Set(stageNames).size!==stageNames.length)throw new RangeError('QA pipeline domain');
 const m=stageNames.length;
 return Array.from({length:instructions+m},(_,clock)=>({clock,stages:stageNames.map((stage,j)=>({stage,instruction:clock-j>=1&&clock-j<=instructions?clock-j:null})),completed:Array.from({length:Math.min(instructions,Math.max(0,clock-m+1))},(_,j)=>j+1)}));
}
export function pipelineInvariants(snapshot){const occupied=snapshot.stages.filter(s=>s.instruction!==null).map(s=>s.instruction);return new Set(occupied).size===occupied.length&&new Set(snapshot.completed).size===snapshot.completed.length;}
export const PIPELINE_PILOT={instructionCount:6,stages:['IF','ID','OF','IE','WB'],interruptAfterClock:5};
export function pipelinePilotOracle(){
 const ideal=idealPipeline(PIPELINE_PILOT.instructionCount,PIPELINE_PILOT.stages);
 const beforeInterrupt=ideal[PIPELINE_PILOT.interruptAfterClock];
 const committed=[...beforeInterrupt.completed];
 const restartInstruction=Math.max(...committed)+1;
 const flushed=beforeInterrupt.stages.map(s=>s.instruction).filter(i=>i!==null&&!committed.includes(i)).sort((a,b)=>a-b);
 const issued=new Set(ideal.slice(0,PIPELINE_PILOT.interruptAfterClock+1).flatMap(c=>c.stages.map(s=>s.instruction)).filter(i=>i!==null));
 const unissued=Array.from({length:PIPELINE_PILOT.instructionCount},(_,i)=>i+1).filter(i=>!issued.has(i));
 const resume=idealPipeline(PIPELINE_PILOT.instructionCount-restartInstruction+1,PIPELINE_PILOT.stages).map(c=>({resumeClock:c.clock,stages:c.stages.map(s=>({...s,instruction:s.instruction===null?null:s.instruction+restartInstruction-1})),committed:[...committed,...c.completed.map(i=>i+restartInstruction-1)]}));
 return{ideal,serialClocks:PIPELINE_PILOT.instructionCount*PIPELINE_PILOT.stages.length,beforeInterrupt,committed,flushed,unissued,restartInstruction,resume,handlerClocks:null};
}
export function circuitPilotOracle(id,inputs){
 const a=bit(inputs.A),b=bit(inputs.B),nA=1-a;
 if(id==='two-input'){const ab=a*b;return{nA,ab,y:Math.min(1,ab+nA)};}
 if(id==='three-input'){const c=bit(inputs.C),abc=a*b*c,nAc=nA*c;return{nA,abc,nAc,y:Math.min(1,abc+nAc)};}
 throw new RangeError('Unknown approved pilot example');
}
export function flynn(instructionStreams,dataStreams){if(!Number.isInteger(instructionStreams)||!Number.isInteger(dataStreams)||instructionStreams<1||dataStreams<1)throw new RangeError('Positive stream counts required');return(instructionStreams===1?'SI':'MI')+(dataStreams===1?'SD':'MD');}
export function allocationValid(capacity,guests,accounting){
 if(!['reserved','running-only'].includes(accounting))throw new RangeError('Explicit resource accounting convention required');
 if(new Set(guests.map(g=>g.id)).size!==guests.length)return false;
 return ['cpu','memory','storage'].every(resource=>Number.isFinite(capacity[resource])&&capacity[resource]>=0&&guests.every(g=>Number.isFinite(g[resource])&&g[resource]>=0)&&guests.filter(g=>accounting==='reserved'||g.running).reduce((sum,g)=>sum+g[resource],0)<=capacity[resource]);
}
export const gray=bits=>Array.from({length:2**bits},(_,n)=>n^(n>>1));
export function kmapGroup(variables,ones,minterms){
 if(!Number.isInteger(variables)||variables<2||variables>4)throw new RangeError('QA oracle preparation supports 2–4 variables; extend only against the frozen source contract');
 const cells=[...new Set(minterms)].sort((a,b)=>a-b),limit=2**variables;
 if(cells.length!==minterms.length||!cells.length||(cells.length&(cells.length-1))||cells.some(c=>!Number.isInteger(c)||c<0||c>=limit||!ones.includes(c)))return{valid:false,reason:'size, duplicate, range or zero cell'};
 const fixed=Array.from({length:variables},(_,i)=>{const b=variables-i-1,values=new Set(cells.map(c=>(c>>b)&1));return values.size===1?[...values][0]:null;});
 const represented=Array.from({length:limit},(_,i)=>i).filter(c=>fixed.every((v,i)=>v===null||((c>>(variables-i-1))&1)===v));
 if(JSON.stringify(represented)!==JSON.stringify(cells))return{valid:false,reason:'not a Boolean subcube (diagonal or irregular group)'};
 return{valid:true,fixed,minterms:cells};
}
export function sopCoverage(variables,groups){return Array.from({length:2**variables},(_,c)=>c).filter(c=>groups.some(g=>g.fixed.every((v,i)=>v===null||((c>>(variables-i-1))&1)===v)));}
