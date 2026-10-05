import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {EVIDENCE_DIR,record,evaluate,navigate,axe,runBrowser,viewport} from './check-paper3-section15-browser-helpers.mjs';
const accepted=JSON.parse(await readFile(path.join(EVIDENCE_DIR,'QA_FULL_ARCHIVE_9Kk7SEpKypBb3G6nnvcbK/QA_FULL_BROWSER_RESULT.json'),'utf8'));
const samples=[];
await runBrowser({scope:'Diagnose enabled-checkpoint CSS transition without altering product styles or bypassing axe',candidateFiles:Object.keys(accepted.candidateHashes),resultFile:'QA_FINAL_PROMOTION_CONTRAST_RESULT.json',scenario:async c=>{
 for(const lang of ['en','vi']){
  await viewport(c,1440);await navigate(c,`/paper-3/topics/sr-and-jk-flip-flops?lang=${lang}`);
  const trace=await evaluate(c,`(async()=>{const root=document.querySelector('[data-checkpoint-id="sr-hold"]'),button=root.querySelector('button[data-variant="primary"]');const sample=()=>{const s=getComputedStyle(button),t=getComputedStyle(button.querySelector('span'));return{t:performance.now(),disabled:button.disabled,background:s.backgroundColor,color:t.color,transition:s.transition,animations:button.getAnimations().map(a=>({playState:a.playState,property:a.transitionProperty}))}};const rows=[sample()];root.querySelector('input').click();await new Promise(requestAnimationFrame);rows.push(sample());await new Promise(r=>setTimeout(r,60));rows.push(sample());button.click();await Promise.all(button.getAnimations().map(a=>a.finished.catch(()=>{})));await new Promise(requestAnimationFrame);rows.push(sample());return rows;})()`);
  samples.push({lang,trace});const final=trace.at(-1);record('CONTRAST-TRANSITION-'+lang,trace.some(x=>x.animations.length)&&final.animations.length===0&&!final.disabled,'Native CSS transitions observed and allowed to finish before stable measurement',{trace});
  await axe(c,'CONTRAST-SETTLED-'+lang,'Settled checkpoint after checking answer has no serious/critical violation');
 }
 await writeFile(path.join(EVIDENCE_DIR,'QA_FINAL_PROMOTION_CONTRAST_SAMPLES.json'),JSON.stringify({buildId:process.env.PAPER3_EXPECTED_BUILD_ID,samples},null,2)+'\n');
}});
