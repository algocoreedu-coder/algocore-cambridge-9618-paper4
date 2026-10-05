import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {ROOT,EVIDENCE_DIR,PREVIEW_ROOT,record,evaluate,waitFor,navigate,viewport,screenshot,delay,axe,pointerClickVisualButton,runBrowser} from './check-paper3-section14-browser-helpers.mjs';
import {TOPICS} from './check-paper3-section14-full-oracle.mjs';
const prior=JSON.parse(await readFile(path.join(EVIDENCE_DIR,'QA_FULL_BROWSER_RESULT.json'),'utf8'));
const teacher=JSON.parse(await readFile(path.join(EVIDENCE_DIR,'TEACHER_SECTION14_POST_RENDER.json'),'utf8'));
const candidateFiles=Object.keys(prior.candidateHashes);
const sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const select=async(c,s,v)=>{await evaluate(c,`(()=>{const e=document.querySelector(${JSON.stringify(s)});e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await delay(50)};
const click=async(c,s)=>{await evaluate(c,`document.querySelector(${JSON.stringify(s)}).click()`);await delay(50)};
const label=async(c,t,r='[data-visual-kind]')=>{await evaluate(c,`[...document.querySelector(${JSON.stringify(r)}).querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(t)}).click()`);await delay(50)};
const shot=async(c,s,n)=>{await evaluate(c,`document.activeElement?.blur();document.querySelector(${JSON.stringify(s)}).scrollIntoView({block:'center',behavior:'instant'})`);await delay(70);await screenshot(c,n)};
const captures=[];
async function final(cdp){
 const expected=process.env.PAPER3_EXPECTED_BUILD_ID,actual=(await readFile(path.join(PREVIEW_ROOT,'.next/BUILD_ID'),'utf8')).trim();record('FINAL-NAMED-BUILD',expected==='x9zzdG7CROf_QWTb_IAcW'&&actual===expected,'Exact Lead-provided final build',{actual,expected});if(actual!==expected)throw Error('Wrong final build');
 const deltas=[];for(const[file,hash]of Object.entries(prior.candidateHashes))if(await sha(path.join(PREVIEW_ROOT,file))!==hash)deltas.push(file);
 const metadataSha=await sha(path.join(PREVIEW_ROOT,'content/paper3/lesson-status.json'));
 record('FINAL-ONLY-METADATA-CHANGED',prior.decision==='PASS'&&teacher.decision==='PASS'&&teacher.buildId===prior.buildId&&JSON.stringify(deltas)==='["content/paper3/lesson-status.json"]'&&metadataSha==='8562d612aeeefebcd753317c0d7b8fd205a711368dc60dbc9485466f8e5d704c','Carry forward QA/Teacher acceptance only because every code/content/style hash is unchanged',{priorBuildId:prior.buildId,teacherDecision:teacher.decision,deltas,metadataSha});
 const status=JSON.parse(await readFile(path.join(PREVIEW_ROOT,'content/paper3/lesson-status.json'),'utf8'));
 const expectedAvailable=Number(process.env.PAPER3_EXPECT_AVAILABLE??16);
 const validHashes=await Promise.all(status.lessons.map(async l=>l.state==='reviewed'&&l.contentSha256===await sha(path.join(PREVIEW_ROOT,`content/paper3/lessons/${l.slug}.json`))));
 record('FINAL-16-REVIEWED',expectedAvailable===16&&status.lessons.length===16&&validHashes.every(Boolean),'All sixteen status entries match actual lesson hashes',{expectedAvailable,count:status.lessons.length,validHashes});
 for(const lang of ['en','vi']){
  await viewport(cdp,1440);await navigate(cdp,`/paper-3?lang=${lang}`,"document.querySelector('[data-paper3-map]')");
  await evaluate(cdp,"(()=>{const e=document.querySelector('#paper3-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'P3-');e.dispatchEvent(new Event('input',{bubbles:true}));})()");await waitFor(cdp,"document.querySelectorAll('[data-topic-id]').length===66",'all66 search rows');
  const map=await evaluate(cdp,"({text:document.querySelector('main').innerText,rows:[...document.querySelectorAll('[data-topic-id]')].map(n=>({id:n.dataset.topicId,text:n.innerText,href:n.getAttribute('href')}))})");
  const available=map.rows.filter(r=>r.text.includes(lang==='vi'?'Mở bài học và minh họa':'Open lesson and visual')),planned=map.rows.filter(r=>r.text.includes(lang==='vi'?'Đang biên soạn':'In preparation'));
  record('FINAL-MAP-'+lang,available.length===16&&planned.length===50&&map.text.includes(lang==='vi'?'16 bài đã có':'16 lessons include'),'Study Map renders sixteen available and fifty planned',{available:available.map(r=>r.id),planned:planned.map(r=>r.id)});captures.push({kind:'map',lang,...map});
  await shot(cdp,'[data-paper3-map] header',`QA_FINAL_PROMOTION_map-${lang}-desktop.png`);await axe(cdp,'FINAL-AXE-MAP-'+lang,'Available map has no serious/critical axe');
  await navigate(cdp,`/paper-3/sections/14?lang=${lang}`);const cards=await evaluate(cdp,"[...document.querySelectorAll('[data-topic-id]')].map(n=>({id:n.dataset.topicId,text:n.innerText,href:n.getAttribute('href')}))");
  record('FINAL-SECTION14-'+lang,cards.length===5&&cards.every(r=>r.text.includes(lang==='vi'?'Mở bài học và minh họa':'Open lesson and visual'))&&TOPICS.every(([s])=>cards.some(r=>r.href===`/paper-3/topics/${s}?lang=${lang}`)),'All five canonical Section14 cards available',cards);captures.push({kind:'section14',lang,cards});
  await shot(cdp,'#chapter14-overview-title',`QA_FINAL_PROMOTION_section14-${lang}-desktop.png`);await viewport(cdp,320);await shot(cdp,'[data-topic-id="P3-14.1-T02"]',`QA_FINAL_PROMOTION_section14-${lang}-320.png`);await axe(cdp,'FINAL-AXE-SECTION-'+lang,'Mobile available section zero serious/critical axe');await viewport(cdp,1440);
  for(const[slug,kind]of TOPICS){
   await navigate(cdp,`/paper-3/topics/${slug}?lang=${lang}&qa=promotion#observe`,`document.querySelector('[data-visual-kind="${kind}"]')`);
   await cdp.send('Page.reload');await waitFor(cdp,`document.readyState==='complete'&&document.querySelector('[data-visual-kind="${kind}"]')`,'deep refresh');
   record(`FINAL-ROUTE-${lang}-${kind}`,await evaluate(cdp,`document.querySelector('[data-paper3-lesson]').lang===${JSON.stringify(lang)}&&location.hash==='#observe'&&!document.querySelector('#topic-preparation-title')`),'Available deep link and refresh resolve real lesson');
   let pass;
   if(kind==='tcp-ip-stack'){await select(cdp,'[data-network-jump]',4);pass=await evaluate(cdp,"document.querySelector('[data-visual-kind]').dataset.visualStep==='network-transit'&&[...document.querySelectorAll('[data-current-unit] [data-wrapper-id]')].map(n=>n.dataset.wrapperId).join(',')==='link,internet,transport'&&document.querySelector('[data-current-unit] [data-wrapper-id=link]').dataset.linkScope==='final-link'");}
   if(kind==='application-protocols'){await select(cdp,'[data-topic-scenario]','scenario-send');await pointerClickVisualButton(cdp,'SMTP');await click(cdp,'[data-protocol-check]');pass=await evaluate(cdp,"document.querySelector('[data-visual-kind] [data-correct]').dataset.correct==='true'");}
   if(kind==='bittorrent'){await select(cdp,'[data-topic-jump]',4);pass=await evaluate(cdp,"document.querySelector('[data-visual-kind]').dataset.visualStep==='share-a'&&[...document.querySelectorAll('[data-peer-id=Q] [data-owned=true]')].map(n=>n.dataset.pieceId).join('')==='AB'&&[...document.querySelectorAll('[data-peer-id=L] [data-owned=true]')].map(n=>n.dataset.pieceId).join('')==='AB'");}
   if(kind==='packet-routing'){await select(cdp,'[data-topic-jump]',10);pass=await evaluate(cdp,"document.querySelector('[data-reassembled-message]').textContent==='NETWORK'&&document.querySelector('[data-arrival-order]').textContent==='p2 → p1 → p3'");}
   if(kind==='switching-methods'){await select(cdp,'[data-topic-scenario]','bursty');await label(cdp,lang==='vi'?'Chuyển mạch gói':'Packet switching');await select(cdp,'[data-topic-jump]',2);pass=await evaluate(cdp,"document.querySelector('[data-link-use]').dataset.linkUse==='B1'&&document.querySelector('[data-reserved]').dataset.reserved==='false'");}
   const text=await evaluate(cdp,"document.querySelector('[data-visual-kind]').innerText");record(`FINAL-STATE-${lang}-${kind}`,pass,'Representative independently expected state after promotion',{text});captures.push({kind,lang,text});
   const lesson=JSON.parse(await readFile(path.join(PREVIEW_ROOT,`content/paper3/lessons/${slug}.json`),'utf8')),q=lesson.checkpoints[0],root=`[data-checkpoint-id="${q.id}"]`;await click(cdp,`${root} input[value="${q.correctChoiceId}"]`);await label(cdp,lang==='vi'?'Kiểm tra câu trả lời':'Check answer',root);
   const answer=await evaluate(cdp,`(()=>{const n=document.querySelector(${JSON.stringify(root)});return{correct:n.querySelector('[data-correct]').dataset.correct,text:n.innerText}})()`);record(`FINAL-CHECKPOINT-${lang}-${kind}`,answer.correct==='true'&&answer.text.includes(q.choices.find(c=>c.id===q.correctChoiceId).feedback[lang]),'Representative checkpoint and feedback remain functional',answer);
   if(lang==='en')await axe(cdp,'FINAL-AXE-'+kind,'Final representative lesson zero serious/critical axe');
  }
 }
 await navigate(cdp,'/paper-3/sections/13?lang=en');const ch13=await evaluate(cdp,"[...document.querySelectorAll('[data-topic-id]')].map(n=>n.innerText)");record('FINAL-CH13-11',ch13.length===11&&ch13.every(t=>t.includes('Open lesson and visual')),'Eleven Chapter13 cards remain available');
 for(const route of ['/paper-3/topics/sets?lang=en','/paper-3/topics/hashing-to-locate-records?lang=en','/paper-3/topics/approximation-rounding-and-range-errors?lang=vi','/paper-4?lang=en','/docs','/paper-4/design-system']){await navigate(cdp,route);const result=await evaluate(cdp,"({title:document.querySelector('h1')?.innerText,text:document.querySelector('main')?.innerText??document.body.innerText,kind:document.querySelector('[data-visual-kind]')?.dataset.visualKind})");record('FINAL-REGRESSION-'+route,Boolean(result.title)&&!/could not be found|application error|404/i.test(result.text),'Existing course/shared route reachable',result);if(result.kind==='hashing'){await pointerClickVisualButton(cdp,'17');await pointerClickVisualButton(cdp,'Next');record('FINAL-CH13-POINTER',await evaluate(cdp,"document.querySelector('[data-visual-kind]').dataset.visualKey==='17'&&document.querySelector('[data-visual-kind]').dataset.visualStep==='division'"),'Chapter13 hash model still responds to real pointer');}if(result.kind==='rounding-errors')record('FINAL-CH13-BITLOSS',await evaluate(cdp,"document.querySelector('[data-bit-loss] [data-kept-bits]')?.textContent==='11010'"),'Repaired rounding strip retained');}
 await writeFile(path.join(EVIDENCE_DIR,'QA_FINAL_PROMOTION_STATES.json'),JSON.stringify({buildId:actual,metadataSha,checkedAt:new Date().toISOString(),captures},null,2)+'\n');
}
await runBrowser({scope:'Final metadata-only promotion smoke; full QA/Teacher carry-forward justified by unchanged source/content hashes',scenario:final,candidateFiles,resultFile:'QA_FINAL_PROMOTION_RESULT.json'});
