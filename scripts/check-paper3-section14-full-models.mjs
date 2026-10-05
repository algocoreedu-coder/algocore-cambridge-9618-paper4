import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ROOT, EVIDENCE_DIR, PREVIEW_ROOT } from './check-paper3-section14-browser-helpers.mjs';
import { TOPICS, PROTOCOLS, PIECES, PACKETS, TOPOLOGY, torrentOracle, routingOracle, switchingOracle } from './check-paper3-section14-full-oracle.mjs';
import { expectedPilotTrace, REQUESTS, RESPONSIBILITY } from './check-paper3-section14-oracle.mjs';
import { tcpIpJourney, tcpIpResponsibilityQuestions } from '../app/lib/paper3/network-models.ts';
import { protocolScenario, bittorrentTrace, packetRoutingTrace, switchingTrace } from '../app/lib/paper3/network-topic-models.ts';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const fixture=await read(path.join(EVIDENCE_DIR,'TEACHER_SECTION14_FIXTURES.json'));
const approval=await read(path.join(EVIDENCE_DIR,'TEACHER_SECTION14_PREIMPLEMENTATION.json'));
const baseline=await read(path.join(EVIDENCE_DIR,'QA_BASELINE.json'));
let assertions=0;const checks=[];const eq=(a,b,m)=>{assertions++;assert.deepStrictEqual(a,b,m)},ok=(v,m)=>{assertions++;assert.ok(v,m)};
const group=async(id,fn)=>{let start=assertions;try{await fn();checks.push({id,pass:true,assertions:assertions-start})}catch(e){checks.push({id,pass:false,assertions:assertions-start,error:e.stack})}};
const projection=(o,keys)=>Object.fromEntries(keys.map(k=>[k,o[k]]));
const frozen=o=>o===null||typeof o!=='object'||Object.isFrozen(o)&&Object.values(o).every(frozen);
const pair=(o,m)=>{ok(typeof o.en==='string'&&o.en.trim(),m+'.en');ok(typeof o.vi==='string'&&o.vi.trim(),m+'.vi')};
await group('approved-identity-and-snapshot',async()=>{
 eq(approval.decision,'PASS');eq(await sha(path.join(EVIDENCE_DIR,'TEACHER_SECTION14_FIXTURES.json')),approval.fixtureSha256);
 for(const l of approval.lessons){const p=`content/paper3/lessons/${l.slug}.json`;eq(await sha(path.join(ROOT,p)),l.sha256,l.slug);if(PREVIEW_ROOT)eq(await sha(path.join(PREVIEW_ROOT,p)),l.sha256,'snapshot '+l.slug)}
});
await group('pilot-independent-regression',()=>{
 for(const id of Object.keys(REQUESTS))eq(tcpIpJourney(id).map(x=>projection(x,['id','actor','layer','direction','operation','changedWrapper','before','after'])),expectedPilotTrace(id));
 for(const q of tcpIpResponsibilityQuestions)eq(q.correctLayer,RESPONSIBILITY[q.id]);
});
await group('six-service-answers-all-36-choices',()=>{
 for(const [id,answer]of Object.entries(PROTOCOLS)){const p=protocolScenario(id);eq(p.correctChoiceId,answer);eq(p.choices.map(x=>x.id),Object.values(PROTOCOLS));for(const x of p.choices){eq(x.correct,x.id===answer);pair(x.feedback,id+x.id)}eq(p,fixture.protocols.find(x=>x.id===id),'approved complete wording');}
});
const compare=(a,e)=>{
 eq(a.initial,e.initial,a.id+' initial');eq(a.steps.length,e.steps.length);
 for(let i=0;i<e.steps.length;i++){eq(projection(a.steps[i],Object.keys(e.steps[i])),e.steps[i],a.id+' step '+i);if(i)eq(a.steps[i].before,a.steps[i-1].after,'adjacent state boundary');for(const k of ['title','action','why','outcome'])pair(a.steps[i][k],a.steps[i].id+k);}
 ok(frozen(a),'deep immutable trace');
};
await group('torrent-copy-conservation-and-unavailable-source',()=>{
 for(const id of ['complete','unavailable-piece']){const a=bittorrentTrace(id);compare(a,torrentOracle(id));eq(a.pieces,PIECES);eq(a.steps,fixture.bittorrent.find(x=>x.id===id).steps,'approved text parity');for(const s of a.steps){for(const peer of ['S','P','Q','L'])eq(new Set(s.after.inventories[peer]).size,s.after.inventories[peer].length);if(s.transfer){const{source,target,piece}=s.transfer;ok(s.before.online[source]);ok(s.before.inventories[source].includes(piece));eq(s.after.inventories[source],s.before.inventories[source]);ok(s.after.inventories[target].includes(piece));}if(s.after.assembled)eq(s.after.inventories.L,PIECES);}}
 eq(bittorrentTrace('unavailable-piece').steps.at(-1).after.blockedPiece,'D');
});
await group('router-next-hop-availability-buffer-and-reassembly',()=>{
 for(const id of ['reroute','unavailable-route']){const a=packetRoutingTrace(id),e=routingOracle(id);compare(a,e);eq(a.tables,e.tables);eq(a.topology,TOPOLOGY);eq(a.packets,PACKETS);eq(a.steps,fixture.routing.find(x=>x.id===id).steps);for(const s of a.steps){eq(s.after.buffer,s.after.arrivalOrder);for(const p of a.packets){const before=s.before.locations[p.id],after=s.after.locations[p.id];if(before!==after)ok(TOPOLOGY.some(([a,b])=>a===before&&b===after),'movement along actual edge');}if(s.after.assembled){eq(s.after.buffer.length,3);eq(s.after.message,'NETWORK');}}}
});
await group('same-demand-reservation-sharing-release-and-reassembly',()=>{
 for(const id of ['continuous','bursty'])for(const method of ['circuit','packet']){const a=switchingTrace(id,method),e=switchingOracle(id,method);compare(a,e);eq(a.units,e.units);eq(a.preferredMethod,e.preferredMethod);eq(a.steps,fixture.switching.find(x=>x.id===id).traces[method].steps);for(const s of a.steps){if(s.after.reservedForA)eq(s.after.otherTrafficCanUseResource,false);if(method==='packet'){eq(s.after.reservedForA,false);eq(s.after.released,false);}if(s.after.complete)eq(s.after.delivered,e.units);}}
});
await group('invalid-domain-and-mutation-rejection',()=>{
 for(const fn of [protocolScenario,bittorrentTrace,packetRoutingTrace])for(const x of ['',null,undefined,0,true,{},[],'__proto__','unknown']){assertions++;assert.throws(()=>fn(x),RangeError);}
 for(const args of [['continuous','unknown'],['unknown','packet'],['bursty',null]]){assertions++;assert.throws(()=>switchingTrace(...args),RangeError);}
 const a=bittorrentTrace('complete');assertions++;assert.throws(()=>a.steps[0].after.inventories.L.push('D'),TypeError);compare(bittorrentTrace('complete'),torrentOracle('complete'));
});
await group('all-five-content-structure-and-feedback',async()=>{
 for(const [slug,kind]of TOPICS){const l=await read(path.join(ROOT,`content/paper3/lessons/${slug}.json`));eq(l.visual.kind,kind);ok(l.theory.length>=6);const sources=new Set(l.sources.map(s=>s.id));for(const t of l.theory){pair(t.title,t.id);for(const p of t.paragraphs)pair(p,t.id);for(const s of t.sourceIds)ok(sources.has(s),'defined source '+s)}for(const s of l.workedExample.steps)for(const k of ['action','why','result'])pair(s[k],s.id+k);ok(l.workedExample.selfCheck,'worked example has explicit check');for(const q of l.checkpoints){pair(q.prompt,q.id);pair(q.explanation,q.id);eq(q.choices.filter(c=>c.id===q.correctChoiceId).length,1);eq(new Set(q.choices.map(c=>c.id)).size,q.choices.length);for(const c of q.choices){pair(c.label,c.id);pair(c.feedback,c.id)}}ok(l.checkpoints.filter(q=>q.transfer).length>=2);}
});
await group('chapter13-and-protected-source-regression',async()=>{
 const status=await read(path.join(ROOT,'content/paper3/lesson-status.json'));
 eq(status.lessons.filter(x=>x.topicId.startsWith('P3-13.')),baseline.chapter13Entries,'all eleven accepted status entries unchanged');
 for(const [file,hash]of Object.entries({...baseline.chapter13Content,...baseline.chapter13Implementation}))eq(await sha(path.join(ROOT,file)),typeof hash==='string'?hash:hash.sha256,file);
 for(const [file,hash]of Object.entries(baseline.protectedFiles)){
  const actual=await sha(path.join(ROOT,file)),original=typeof hash==='string'?hash:hash.sha256;
  if(file!=='package.json'){eq(actual,original,'protected '+file);continue;}
  const oldPath=path.resolve(ROOT,'../local-previews/paper3-section14-pilot-20260929/package.json'),old=await read(oldPath),now=await read(path.join(ROOT,file));eq(await sha(oldPath),original,'accepted package authority');
  eq({...now,scripts:null},{...old,scripts:null},'no dependency/config package delta');for(const[k,v]of Object.entries(old.scripts))eq(now.scripts[k],v,'existing script preserved');
  const added=Object.fromEntries(Object.entries(now.scripts).filter(([k])=>!(k in old.scripts)));
  eq(added,{'check:paper4:stack':'node scripts/check-stack-learner-release-gate.mjs','check:paper4:stack:browser':'node --experimental-websocket scripts/check-stack-learner-browser-gate.mjs','check:paper4:queue':'node scripts/check-queue-learner-release-gate.mjs','check:paper4:queue:browser':'node --experimental-websocket scripts/check-queue-learner-browser-gate.mjs'});
  if(PREVIEW_ROOT)eq(await sha(path.join(PREVIEW_ROOT,file)),actual,'snapshot includes exact concurrent delta');
  await writeFile(path.join(EVIDENCE_DIR,'QA_FULL_CONCURRENT_DELTA.json'),JSON.stringify({file,baselineSha256:original,currentSha256:actual,addedScripts:added,otherFieldsUnchanged:true,scope:'Concurrent unrelated Paper4 stack/queue scripts, not reverted; actual full snapshot equals authoring.'},null,2)+'\n');
 }
});
const report={schemaVersion:1,checkedAt:new Date().toISOString(),scope:'Independent finite event oracle + exact Teacher text parity + content/protected regression; no browser or availability claim',decision:checks.every(x=>x.pass)?'PASS':'FAIL',assertions,checks,hashes:{fixture:await sha(path.join(EVIDENCE_DIR,'TEACHER_SECTION14_FIXTURES.json')),networkModel:await sha(path.join(ROOT,'app/lib/paper3/network-models.ts')),scaleModel:await sha(path.join(ROOT,'app/lib/paper3/network-topic-models.ts')),oracle:await sha(new URL('./check-paper3-section14-full-oracle.mjs',import.meta.url))},previewRoot:PREVIEW_ROOT};
await writeFile(path.join(EVIDENCE_DIR,'QA_FULL_MODELS_RESULT.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.decision!=='PASS')process.exitCode=1;
