import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {ROOT,EVIDENCE_DIR,record,evaluate,navigate,viewport,screenshot,delay,runBrowser} from './check-paper3-section14-browser-helpers.mjs';
import {candidateFiles as baseFiles} from './check-paper3-section14-full-pilot.mjs';
import {TOPICS} from './check-paper3-section14-full-oracle.mjs';
import {expectedPilotTrace,REQUESTS,LAYERS,RESPONSIBILITY} from './check-paper3-section14-oracle.mjs';
const contract=JSON.parse(await readFile(path.join(EVIDENCE_DIR,'SECTION14_PILOT_CONTRACT.json'),'utf8'));
const fixtures=JSON.parse(await readFile(path.join(EVIDENCE_DIR,'TEACHER_PILOT_FIXTURES.json'),'utf8'));
const candidateFiles=[...new Set([...baseFiles,...TOPICS.map(([s])=>`content/paper3/lessons/${s}.json`),'app/lib/paper3/network-topic-models.ts','app/components/paper3-learning/lessons/NetworkTopicWorkbench.tsx','app/components/paper3-learning/lessons/NetworkTopicWorkbench.module.css'])];
const captures=[];const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const select=async(cdp,s,value)=>{await evaluate(cdp,`(()=>{const e=document.querySelector(${JSON.stringify(s)});e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await delay(40)};
const label=async(cdp,text,root='[data-visual-kind]')=>{await evaluate(cdp,`[...document.querySelector(${JSON.stringify(root)}).querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(text)}).click()`);await delay(40)};
async function scenario(cdp){
 await viewport(cdp,1440);await navigate(cdp,'/paper-3/topics/tcp-ip-stack-and-message-journey?lang=vi',"document.querySelector('[data-visual-kind=tcp-ip-stack]')");
 for(const id of Object.keys(REQUESTS)){
  await select(cdp,'[data-network-payload]',id);
  for(const[index,step]of expectedPilotTrace(id).entries()){
   await select(cdp,'[data-network-jump]',index);
   const actual=await evaluate(cdp,`(()=>{const v=document.querySelector('[data-visual-kind]'),u=v.querySelector('[data-current-unit]');return{payloadId:v.dataset.payloadId,step:v.dataset.visualStep,wrappers:[...u.querySelectorAll('[data-wrapper-id]')].map(n=>n.dataset.wrapperId),linkScope:u.querySelector('[data-wrapper-id=link]')?.dataset.linkScope??null,payload:u.querySelector('[data-payload-text]').dataset.payloadText,location:u.dataset.unitLocation,delivered:u.dataset.delivered==='true',active:[...v.querySelectorAll('[data-host] [data-active=true]')].map(e=>({host:e.closest('[data-host]').dataset.host,layer:e.dataset.layerId})),action:v.querySelector('[data-step-action]').textContent,why:v.querySelector('[data-step-why]').textContent,outcome:v.querySelector('[data-step-outcome]').textContent}})()`);
   const approved=contract.steps.find(s=>s.id===step.id),expected={payloadId:id,step:step.id,wrappers:step.after.wrappers,linkScope:step.after.linkScope,payload:REQUESTS[id].text,location:step.after.location,delivered:step.after.delivered,active:step.layer?[{host:step.actor,layer:step.layer}]:[],action:approved.action.vi,why:approved.why.vi,outcome:approved.outcome.vi};
   record(`FULL-PILOT-VI-${id}-${index}`,same(actual,expected),'All nine VI states per payload match independent stack and approved narrative',{actual,expected});captures.push({kind:'tcp-ip-stack',lang:'vi',id,index,actual});
   if([4,8].includes(index)){await evaluate(cdp,"document.querySelector('[data-current-unit]').scrollIntoView({block:'center',behavior:'instant'})");await delay(50);await screenshot(cdp,`QA_FULL_VIEW_pilot-${id}-${step.id}-vi-desktop.png`);}
  }
  await evaluate(cdp,"document.querySelector('[data-network-fallback]').open=true");captures.push({kind:'pilot-fallback',lang:'vi',id,rows:await evaluate(cdp,"[...document.querySelectorAll('[data-fallback-step]')].map(r=>({id:r.dataset.fallbackStep,before:r.querySelector('[data-state-before]').innerText,after:r.querySelector('[data-state-after]').innerText}))")});await evaluate(cdp,"document.querySelector('[data-network-fallback]').open=false");
 }
 await label(cdp,'Vai trò từng tầng');
 for(const[id,key]of Object.entries(RESPONSIBILITY)){await select(cdp,'[data-responsibility-question]',id);for(const choice of LAYERS){const root=`[data-layer-question="${id}"]`;await evaluate(cdp,`document.querySelector(${JSON.stringify(root+' input[value="'+choice+'"]')}).click()`);await label(cdp,'Kiểm tra lựa chọn',root);const result=await evaluate(cdp,`(()=>{const n=document.querySelector(${JSON.stringify(root)});return{correct:n.querySelector('[data-correct]')?.dataset.correct,text:n.innerText}})()`);const expected=(fixtures.responsibility??fixtures.responsibilityQuestions).find(q=>q.id===id).feedbackByLayer[choice].vi;record(`FULL-PILOT-ROLE-VI-${id}-${choice}`,result.correct===String(choice===key)&&result.text.includes(expected),'All VI layer choice feedback actually rendered',result);captures.push({kind:'pilot-responsibility',lang:'vi',id,choice,...result});}}
 await writeFile(path.join(EVIDENCE_DIR,'QA_FULL_PILOT_VI_STATES.json'),JSON.stringify({buildId:process.env.PAPER3_EXPECTED_BUILD_ID,capturedAt:new Date().toISOString(),captures},null,2)+'\n');
}
await runBrowser({scope:'Supplement: full VI pilot states/narrative for both payloads and all responsibility feedback; 608-check full gate remains separate',scenario,candidateFiles,resultFile:'QA_FULL_PILOT_VI_RESULT.json'});

