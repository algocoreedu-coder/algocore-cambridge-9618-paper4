import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, EVIDENCE_DIR, record, evaluate, waitFor, navigate, viewport, screenshot, press, overflow, axe, pointerClickVisualButton, delay, runBrowser } from './check-paper3-section14-browser-helpers.mjs';
import { expectedPilotTrace, LAYERS, REQUESTS, RESPONSIBILITY } from './check-paper3-section14-oracle.mjs';

const SLUG = 'tcp-ip-stack-and-message-journey';
const V = 'document.querySelector("[data-visual-kind=tcp-ip-stack]")';
const lesson = JSON.parse(await readFile(path.join(ROOT, `content/paper3/lessons/${SLUG}.json`), 'utf8'));
const baseline = JSON.parse(await readFile(path.join(EVIDENCE_DIR, 'QA_BASELINE.json'), 'utf8'));
export const candidateFiles = [...new Set([
  ...Object.keys(baseline.chapter13Content), ...Object.keys(baseline.chapter13Implementation), ...Object.keys(baseline.protectedFiles), ...Object.keys(baseline.trackedIntegration),
  `content/paper3/lessons/${SLUG}.json`, 'app/lib/paper3/network-models.ts', 'app/components/paper3-learning/lessons/NetworkWorkbench.tsx', 'app/components/paper3-learning/lessons/NetworkWorkbench.module.css',
  'app/components/paper3-learning/Chapter14Overview.tsx', 'app/components/paper3-learning/Chapter14Overview.module.css',
])];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const select = async (cdp, selector, value) => { await evaluate(cdp, `(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event('change',{bubbles:true}));})()`); await delay(80); };
const click = async (cdp, selector) => { await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}).click()`); await delay(80); };
const button = async (cdp, label, root = '[data-visual-kind=tcp-ip-stack]') => { await evaluate(cdp, `(()=>{const b=[...document.querySelector(${JSON.stringify(root)}).querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!b)throw Error('Button absent: '+${JSON.stringify(label)});b.click();})()`); await delay(80); };
const jump = (cdp, index) => select(cdp, '[data-network-jump]', index);
const locale = async (cdp, value) => { await evaluate(cdp, `[...document.querySelectorAll('[role=group] button')].find(n=>n.textContent.trim()===${JSON.stringify(value.toUpperCase())}).click()`); await waitFor(cdp, `document.documentElement.lang===${JSON.stringify(value)}&&document.querySelector('[data-paper3-lesson]')?.lang===${JSON.stringify(value)}`, 'Locale '+value); await delay(100); };
async function state(cdp) {
  return evaluate(cdp, `(()=>{const v=${V};const u=v.querySelector('[data-current-unit]');return {payloadId:v.dataset.payloadId,step:v.dataset.visualStep,mode:v.dataset.networkMode,wrappers:[...v.querySelectorAll('[data-current-unit] [data-wrapper-id]')].map(e=>e.dataset.wrapperId),linkScope:v.querySelector('[data-current-unit] [data-wrapper-id=link]')?.dataset.linkScope??null,text:v.querySelector('[data-current-unit] [data-payload-text]')?.dataset.payloadText,location:u?.dataset.unitLocation,delivered:u?.dataset.delivered==='true',active:[...v.querySelectorAll('[data-host] [data-active=true]')].map(e=>({host:e.closest('[data-host]').dataset.host,layer:e.dataset.layerId})),prediction:Boolean(v.querySelector('[data-network-prediction]')),answers:[...v.querySelectorAll('input:checked')].map(e=>({question:e.closest('[data-layer-question]')?.dataset.layerQuestion,value:e.value})),seen:[...v.querySelectorAll('[data-answer-seen=true]')].map(e=>e.dataset.layerQuestion)};})()`);
}
function expectedScene(snapshot, id) {
  return { payloadId: id, step: snapshot.id, mode: 'journey', wrappers: snapshot.after.wrappers, linkScope: snapshot.after.linkScope, text: REQUESTS[id].text, location: snapshot.after.location, delivered: snapshot.after.delivered, active: snapshot.layer ? [{ host: snapshot.actor, layer: snapshot.layer }] : [], prediction: snapshot.id === 'network-transit' };
}
const sceneOnly = value => Object.fromEntries(['payloadId','step','mode','wrappers','linkScope','text','location','delivered','active','prediction'].map(key=>[key,value[key]]));
export async function shotElement(cdp, selector, name) {
  await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
  await delay(60);
  const clip = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()`);
  const image = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true, clip });
  await writeFile(path.join(EVIDENCE_DIR, name), Buffer.from(image.data,'base64'));
}
async function questionAction(cdp, id, choice, checkLabel='Check choice') {
  const root=`[data-layer-question="${id}"]`;
  await click(cdp, `${root} input[value="${choice}"]`); await button(cdp,checkLabel,root);
  return evaluate(cdp, `({correct:document.querySelector(${JSON.stringify(root)}).querySelector('[data-correct]')?.dataset.correct,text:document.querySelector(${JSON.stringify(root)}).innerText})`);
}

export async function pilot(cdp) {
  await viewport(cdp,1440);
  await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await navigate(cdp,`/paper-3/topics/${SLUG}?lang=en&qa=section14#observe`,V);
  const structure=await evaluate(cdp,`({title:document.querySelector('h1').innerText,lang:document.documentElement.lang,anchors:['understand','observe','worked-example','recognise','check','recall','sources-title'].every(id=>document.getElementById(id)),worked:document.querySelectorAll('[data-worked-step]').length,checks:document.querySelectorAll('[data-checkpoint-id]').length,hosts:[...${V}.querySelectorAll('[data-host]')].map(e=>({host:e.dataset.host,layers:[...e.querySelectorAll('[data-layer-id]')].map(n=>n.dataset.layerId)})),breadcrumb:[...document.querySelector('nav[aria-label=Breadcrumb]').querySelectorAll('a')].map(a=>a.getAttribute('href')),preview:Boolean(document.querySelector('#topic-preparation-title'))})`);
  record('S14-STRUCTURE',structure.lang==='en'&&structure.anchors&&structure.worked===9&&structure.checks===6&&!structure.preview&&same(structure.hosts,[{host:'sender',layers:LAYERS},{host:'receiver',layers:LAYERS}])&&structure.breadcrumb.includes('/paper-3/sections/14?lang=en'),'Real bilingual-ready lesson, two four-layer hosts, nine worked steps, six checks, Chapter14 breadcrumb',structure);
  const initial=await state(cdp);
  record('S14-INITIAL',same(sceneOnly(initial),expectedScene(expectedPilotTrace('revision-page')[0],'revision-page'))&&await evaluate(cdp,"document.querySelector('[data-network-previous]').disabled"),'Initial state and lower boundary',initial);
  await pointerClickVisualButton(cdp,'Next');
  record('S14-REAL-POINTER',(await state(cdp)).step==='sender-transport','Trusted pointer Next changes meaningful state');
  for(const id of Object.keys(REQUESTS)) {
    await select(cdp,'[data-network-payload]',id);
    for(const [index,expected] of expectedPilotTrace(id).entries()) {
      await jump(cdp,index);const actual=await state(cdp);
      record(`S14-STATE-${id}-${index}`,same(sceneOnly(actual),expectedScene(expected,id)),'Rendered state agrees with independent actor/wrapper/request oracle',actual);
      if(id==='revision-page')await shotElement(cdp,'[data-visual-kind=tcp-ip-stack]',`QA_FULL_pilot-step${index}-${expected.id}-en-desktop.png`);
      if(id==='diagram-image'&&[4,8].includes(index))await shotElement(cdp,'[data-visual-kind=tcp-ip-stack]',`QA_FULL_pilot-diagram-image-step${index}-en-desktop.png`);
    }
    record('S14-UPPER-'+id,await evaluate(cdp,"document.querySelector('[data-network-next]').disabled"),'Next disabled at delivered boundary');
    await click(cdp,'[data-network-previous]');const previous=await state(cdp);await click(cdp,'[data-network-next]');await click(cdp,'[data-network-previous]');
    record('S14-BACKTRACK-'+id,same(await state(cdp),previous),'Backtracking restores exact data snapshot');
  }
  await select(cdp,'[data-network-payload]','revision-page');await jump(cdp,4);
  const wrong=await questionAction(cdp,'first-receiving-layer','application');
  record('S14-PREDICT-WRONG',wrong.correct==='false'&&wrong.text.includes('Link'),'Incorrect first-receiver prediction gets explanation',wrong);
  await button(cdp,'Show explanation','[data-layer-question=first-receiving-layer]');await button(cdp,'Try again','[data-layer-question=first-receiving-layer]');
  const correct=await questionAction(cdp,'first-receiving-layer','link');
  record('S14-PREDICT-SUPPORTED',correct.correct==='true'&&correct.text.includes('support from the explanation'),'Prediction retry retains support history',correct);
  await click(cdp,'[data-network-next]');await click(cdp,'[data-network-previous]');
  record('S14-PREDICT-PRESERVED',(await state(cdp)).seen.includes('first-receiving-layer'),'Moving away/back retains prediction history');
  await button(cdp,'Layer responsibility');
  for(const [id,expected] of Object.entries(RESPONSIBILITY)) {
    await select(cdp,'[data-responsibility-question]',id);
    for(const choice of LAYERS) {
      const result=await questionAction(cdp,id,choice);
      record(`S14-ROLE-${id}-${choice}`,result.correct===String(choice===expected),'Responsibility mode uses the independent role key with visible feedback',result);
    }
    await questionAction(cdp,id,expected);await shotElement(cdp,'[data-responsibility-mode]',`QA_FULL_pilot-responsibility-${id}-en-desktop.png`);
  }
  await button(cdp,'Show explanation','[data-layer-question=local-link]');await button(cdp,'Try again','[data-layer-question=local-link]');await questionAction(cdp,'local-link','link');
  const beforeLocale=await state(cdp);
  await locale(cdp,'vi');record('S14-LOCALE-ROLE',same(await state(cdp),beforeLocale),'VI preserves selected mode, step, answer and history');
  await viewport(cdp,320);await shotElement(cdp,'[data-responsibility-mode]','QA_FULL_pilot-responsibility-vi-320.png');await viewport(cdp,1440);
  await locale(cdp,'en');await button(cdp,'Message journey');
  record('S14-MODE-KEEPS-STEP',(await state(cdp)).step==='network-transit','Responsibility mode does not reset journey');
  const cp=lesson.checkpoints[0],root=`[data-checkpoint-id="${cp.id}"]`;
  await click(cdp,`${root} input[value="${cp.correctChoiceId}"]`);await button(cdp,'Check answer',root);await button(cdp,'Show explanation',root);await button(cdp,'Hide explanation',root);
  await click(cdp,'[data-network-reset]');await select(cdp,'[data-network-payload]','diagram-image');
  record('S14-RESET-SCOPE',(await state(cdp)).step==='sender-application'&&await evaluate(cdp,`Boolean(document.querySelector(${JSON.stringify(root)}).querySelector('input:checked'))&&document.querySelector(${JSON.stringify(root)}).querySelector('[data-correct]').dataset.correct==='true'`),'Reset and payload change preserve unrelated lesson response');
  await jump(cdp,4);const held=await state(cdp);await locale(cdp,'vi');
  record('S14-LOCALE-JOURNEY',same(await state(cdp),held)&&await evaluate(cdp,`Boolean(document.querySelector(${JSON.stringify(root)}).querySelector('input:checked'))`),'Locale keeps journey, prediction and lesson response');
  await locale(cdp,'en');
  record('S14-QUERY-HASH',await evaluate(cdp,"location.search.includes('qa=section14')&&location.hash==='#observe'"),'Repeated locale switches preserve query and a single anchor');
  await evaluate(cdp,`document.querySelector('a[href="#worked-example"]').click()`);await waitFor(cdp,"location.hash==='#worked-example'",'actual lesson anchor');
  await locale(cdp,'vi');await locale(cdp,'en');await evaluate(cdp,'history.back()');await waitFor(cdp,"document.documentElement.lang==='vi'",'history back VI');await evaluate(cdp,'history.forward()');await waitFor(cdp,"document.documentElement.lang==='en'",'history forward EN');
  record('S14-HISTORY',await evaluate(cdp,"location.hash==='#worked-example'&&location.search.includes('qa=section14')"),'In-page anchor survives locale history traversal');
  await cdp.send('Page.reload');await waitFor(cdp,`${V}&&document.readyState==='complete'`,'reload');
  record('S14-RELOAD',(await state(cdp)).step==='sender-application'&&await evaluate(cdp,"location.hash==='#worked-example'&&document.documentElement.lang==='en'"),'Reload resolves deep link with a fresh local attempt');
  await jump(cdp,4);await evaluate(cdp,"document.querySelector('[data-network-fallback]').open=true");
  const table=await evaluate(cdp,`[...document.querySelectorAll('[data-fallback-step]')].map(r=>({id:r.dataset.fallbackStep,before:r.querySelector('[data-state-before]').innerText,after:r.querySelector('[data-state-after]').innerText}))`);
  record('S14-FALLBACK',table.length===9&&table.every((r,i)=>r.id===expectedPilotTrace('revision-page')[i].id&&r.before.includes('Request /revision')&&r.after.includes('Request /revision'))&&table[4].before.includes('First link')&&table[4].after.includes('Final link'),'Fallback lists all snapshots including distinct first/final link controls',table);
  const labels={transport:'Transport control information',internet:'Internet control information',link:'Link control information'};
  const describe=s=>[...s.wrappers.map(w=>labels[w]+(w==='link'?` (${s.linkScope==='first-link'?'First link':'Final link'})`:'')),s.payload.text].join(' → ');
  record('S14-FALLBACK-EXACT',table.every((r,i)=>r.before.split('\n')[0]===describe(expectedPilotTrace('revision-page')[i].before)&&r.after.split('\n')[0]===describe(expectedPilotTrace('revision-page')[i].after)),'Every before/after table wrapper sequence exactly matches independent oracle');
  await shotElement(cdp,'[data-network-fallback]','QA_FULL_pilot-fallback-en-desktop.png');
  await axe(cdp,'S14-AXE-DESKTOP','Desktop expanded fallback has zero serious/critical axe violations');
  for(const lang of ['en','vi']) {
    if(lang==='vi')await locale(cdp,'vi');
    for(const width of [768,320]) {
      await viewport(cdp,width);await jump(cdp,4);
      await evaluate(cdp,"document.querySelector('[data-network-fallback]').open=false;document.querySelector('[data-host-diagram]').scrollIntoView({block:'start',behavior:'instant'})");await delay(60);
      const shape=await evaluate(cdp,`(()=>{const nodes=[...${V}.querySelectorAll('[data-host] [data-layer-id], [data-current-unit] li, [data-network-next], [data-network-jump]')];return {width:innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,outside:nodes.map(n=>{const r=n.getBoundingClientRect();return {text:n.innerText??n.value,left:r.left,right:r.right,sw:n.scrollWidth,cw:n.clientWidth};}).filter(r=>r.left<0||r.right>innerWidth+1||r.sw>r.cw+1)}})()`);
      record(`S14-REFLOW-${lang}-${width}`,!shape.overflow&&!shape.outside.length,'Essential layer/request/control bounds stay readable within viewport',shape);
      await screenshot(cdp,`QA_FULL_pilot-hosts-${lang}-${width}.png`);await shotElement(cdp,'[data-current-unit]',`QA_FULL_pilot-transit-unit-${lang}-${width}.png`);
      if(width===320){await evaluate(cdp,"document.querySelector('[data-network-fallback]').open=true");await axe(cdp,`S14-AXE-${lang}-${width}`,'Mobile expanded table has zero serious/critical axe violations');}
    }
  }
  await evaluate(cdp,"document.querySelector('[data-network-fallback]').open=false");
  await viewport(cdp,768);await locale(cdp,'en');
  const theme=await evaluate(cdp,"[...document.querySelectorAll('button')].find(b=>/toggle theme/i.test(b.getAttribute('aria-label')??''))?.getAttribute('aria-label')");
  if(theme){await evaluate(cdp,"[...document.querySelectorAll('button')].find(b=>/toggle theme/i.test(b.getAttribute('aria-label')??'')).click()");await delay(400);}
  record('S14-DARK',await evaluate(cdp,"document.documentElement.classList.contains('dark')"),'Dark theme applied');
  await screenshot(cdp,'QA_FULL_pilot-dark-768.png');await axe(cdp,'S14-AXE-DARK','Dark state zero serious/critical axe');
  await viewport(cdp,320);await click(cdp,'[data-network-reset]');await evaluate(cdp,"document.querySelector('[data-network-next]').scrollIntoView({block:'center',behavior:'instant'});document.querySelector('[data-network-next]').focus()");await press(cdp,'Enter','Enter',13);await delay(100);
  const focus=await evaluate(cdp,"({step:document.querySelector('[data-visual-kind=tcp-ip-stack]').dataset.visualStep,tag:document.activeElement.tagName,outline:getComputedStyle(document.activeElement).outlineStyle,reduce:matchMedia('(prefers-reduced-motion: reduce)').matches})");
  record('S14-KEYBOARD',focus.step==='sender-transport'&&focus.tag==='BUTTON'&&focus.outline!=='none'&&focus.reduce,'Keyboard Next, visible focus and reduced motion',focus);
  await press(cdp,' ','Space',32);await delay(100);
  record('S14-KEYBOARD-SPACE',(await state(cdp)).step==='sender-internet','Space activates Next through native button behavior');
  await viewport(cdp,720,450);await cdp.send('Emulation.setDeviceMetricsOverride',{width:720,height:450,deviceScaleFactor:2,mobile:false});
  record('S14-REFLOW-200',!(await overflow(cdp)).overflow,'200% layout-equivalent CSS reflow; not native browser zoom');
  await screenshot(cdp,'QA_FULL_pilot-layout-equivalent-200.png');
  await viewport(cdp,1440);
  for(const lang of ['en','vi']) {
    await navigate(cdp,`/paper-3/sections/14?lang=${lang}`);
    const section=await evaluate(cdp,"({text:document.querySelector('main').innerText,links:[...document.querySelector('main').querySelectorAll('a[href*=\"/paper-3/topics/\"]')].map(a=>a.getAttribute('href'))})");
    record('S14-OVERVIEW-'+lang,new Set(section.links.map(x=>x.split('?')[0])).size===5&&section.text.includes('14.1')&&section.text.includes('14.2'),'Section14 has five canonical topics and two strands',section);
    await screenshot(cdp,`QA_FULL_section14-overview-${lang}-desktop.png`);
  }
  await navigate(cdp,'/paper-3/sections/13?lang=en');const chapter=await evaluate(cdp,"[...document.querySelector('main').querySelectorAll('a[href*=\"/paper-3/topics/\"]')].map(a=>({href:a.getAttribute('href'),text:a.innerText}))");
  record('S14-CH13-AVAILABLE',new Set(chapter.map(x=>x.href.split('?')[0])).size===11&&chapter.filter(x=>x.text.includes('Open lesson')).length===11,'Chapter13 keeps all eleven available links',chapter);
  for(const route of ['/paper-3/topics/sets?lang=en','/paper-3/topics/hashing-to-locate-records?lang=en','/paper-3/topics/approximation-rounding-and-range-errors?lang=en','/paper-4?lang=en','/docs','/paper-4/design-system']) {
    await navigate(cdp,route);const page=await evaluate(cdp,"({title:document.querySelector('h1')?.innerText,text:document.querySelector('main')?.innerText??document.body.innerText,visual:document.querySelector('[data-visual-kind]')?.dataset.visualKind})");
    record('S14-REGRESSION-'+route,Boolean(page.title)&&!/404|could not be found|application error/i.test(page.text),'Scoped previous course/shared route remains reachable',page);
    if(page.visual==='hashing'){await pointerClickVisualButton(cdp,'17');await pointerClickVisualButton(cdp,'Next');record('S14-CH13-HASH-INTERACTION',await evaluate(cdp,"document.querySelector('[data-visual-kind]').dataset.visualKey==='17'&&document.querySelector('[data-visual-kind]').dataset.visualStep==='division'"),'Chapter13 hashing still accepts real pointer input');}
    if(page.visual==='rounding-errors')record('S14-CH13-BITLOSS',await evaluate(cdp,"document.querySelector('[data-bit-loss] [data-kept-bits]')?.textContent==='11010'&&document.querySelector('[data-bit-loss] [data-original-binary]')?.textContent==='1101.011₂'"),'Chapter13 repaired rounding bit-loss remains visible');
  }
  await navigate(cdp,'/paper-3/topics/qa-section14-does-not-exist?lang=en');
  record('S14-NOT-FOUND',await evaluate(cdp,"/not found|không tìm thấy|404/i.test(document.querySelector('main')?.innerText??document.body.innerText)"),'Unknown catalog topic keeps not-found behavior');
}


