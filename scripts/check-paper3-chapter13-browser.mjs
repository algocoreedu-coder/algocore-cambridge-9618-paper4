import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW_ROOT = path.resolve(process.env.PAPER3_PREVIEW_DIR ?? ROOT);
const BASE_URL = (process.env.PAPER3_BASE_URL ?? "http://127.0.0.1:3033").replace(/\/$/, "");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/chapter13");
const SCOPE = process.env.PAPER3_SCOPE ?? "pilot";
const CHROME_CANDIDATES = [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe"].filter(Boolean);
const checks = [];
const consoleErrors = [];
const runtimeErrors = [];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const record = (id, pass, message, evidence = {}) => checks.push({ id, pass: Boolean(pass), message, evidence });
async function exists(file) { try { await access(file); return true; } catch { return false; } }
async function findChrome() { for (const file of CHROME_CANDIDATES) if (await exists(file)) return file; throw new Error("Local Chrome/Edge is unavailable."); }
async function freePort() { return new Promise((resolve, reject) => { const server = net.createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const port = server.address().port; server.close(() => resolve(port)); }); }); }

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); this.listeners = new Map(); }
  async open() {
    await new Promise((resolve, reject) => { this.socket.addEventListener("open", resolve, { once: true }); this.socket.addEventListener("error", reject, { once: true }); });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) { for (const listener of this.listeners.get(message.method) ?? []) listener(message.params); return; }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`)); else pending.resolve(message.result);
    });
  }
  on(method, listener) { this.listeners.set(method, [...(this.listeners.get(method) ?? []), listener]); }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
      this.pending.set(id, { resolve, reject, method, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { for (const pending of this.pending.values()) clearTimeout(pending.timeout); this.pending.clear(); this.socket.close(); }
}

async function evaluate(cdp, expression) {
  const response = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? "Browser evaluation failed");
  return response.result.value;
}
async function waitFor(cdp, expression, label, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) { if (await evaluate(cdp, `Boolean(${expression})`)) return; await delay(100); }
  throw new Error(`Timed out: ${label}`);
}
async function navigate(cdp, route, condition = "document.querySelector('main')") {
  const url = new URL(route, BASE_URL).href;
  await cdp.send("Page.navigate", { url });
  await waitFor(cdp, `location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && (${condition})`, route);
  await delay(200);
}
async function settleTheme(cdp) { await delay(60);await waitFor(cdp,"!document.documentElement.matches(':active-view-transition')",'theme transition finished before measurement',10000); }
async function viewport(cdp, width, height = 900) { await settleTheme(cdp);await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });await delay(60); }
async function screenshot(cdp, name) { await settleTheme(cdp);const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true }); await writeFile(path.join(EVIDENCE_DIR, name), Buffer.from(shot.data, "base64")); }
async function press(cdp, key, code = key, windowsVirtualKeyCode) { await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode }); await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode }); }
async function overflow(cdp) { return evaluate(cdp, `({width:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1})`); }
async function axe(cdp, id, message) {
  await evaluate(cdp, await readFile(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8"));
  const result = await evaluate(cdp, `axe.run(document,{resultTypes:['violations']}).then(result=>({violations:result.violations.filter(item=>['serious','critical'].includes(item.impact)).map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}))}))`);
  record(id, result.violations.length === 0, message, result);
}
async function pointerClickVisualButton(cdp,label) {
  const point=await evaluate(cdp,`(()=>{const button=[...document.querySelector('[data-visual-kind]').querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(label)});if(!button)throw Error('Missing button');button.scrollIntoView({block:'center',behavior:'instant'});const r=button.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===button};})()`);
  if(!point.hit)throw Error('Pointer target is obscured: '+label);
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});await delay(100);
}
async function hashPointerSmoke(cdp) {
  await viewport(cdp,1440);await navigate(cdp,'/paper-3/topics/hashing-to-locate-records?lang=en',"document.querySelector('[data-visual-kind=hashing]')");
  await pointerClickVisualButton(cdp,'17');
  const preset=await evaluate(cdp,"({key:document.querySelector('[data-visual-kind]').dataset.visualKey,draft:document.querySelector('#file-key-input').value,step:document.querySelector('[data-visual-kind]').dataset.visualStep})");
  record('B8-HASH-REAL-POINTER-PRESET',preset.key==='17'&&preset.draft==='17'&&preset.step==='key','Trusted coordinate pointer click applies preset17',preset);
  await pointerClickVisualButton(cdp,'Next');
  const next=await evaluate(cdp,"({step:document.querySelector('[data-visual-kind]').dataset.visualStep,equation:document.querySelector('[data-visual-equation]').textContent})");
  record('B8-HASH-REAL-POINTER-NEXT',next.step==='division'&&next.equation==='17 = 2 × 7 + 3','Trusted coordinate pointer click advances the actual example',next);
  await screenshot(cdp,'QA_hash-real-pointer-preset17.png');
}

async function chapter13Scenarios(cdp) {
  const route = "/paper-3/topics/signed-floating-point-conversion?lang=en&qa=pilot#observe";
  const lesson = JSON.parse(await readFile(path.join(ROOT,"content/paper3/lessons/signed-floating-point-conversion.json"),"utf8"));
  const visual = "document.querySelector('[data-visual-kind=floating-conversion]')";
  const snapshot = async () => evaluate(cdp, `(() => { const v=${visual}; return {input:v.dataset.visualInput,mode:v.dataset.visualMode,step:v.dataset.visualStep,equation:v.querySelector('[data-visual-equation]').textContent,m:[...v.querySelectorAll('[data-bit-field=mantissa] [role=img]')].map(node=>node.getAttribute('aria-label').split(': ').at(-1)),e:v.querySelector('[data-bit-field=exponent] [role=img]')?.getAttribute('aria-label').split(': ').at(-1),binary:[...v.querySelectorAll('[role=img]')].map(node=>node.getAttribute('aria-label')),stepCount:v.querySelector('#visual-step-choice').options.length}; })()`);
  const instructionalState = (state) => ({ ...state, binary: state.binary.map(label => label.split(': ').at(-1)) });
  const select = async (id,value) => { await evaluate(cdp, `(() => { const element=document.getElementById(${JSON.stringify(id)}); element.value=${JSON.stringify(String(value))}; element.dispatchEvent(new Event('change',{bubbles:true})); })()`); await delay(70); };
  const button = async (label) => { await evaluate(cdp, `(() => { const b=[...${visual}.querySelectorAll('button')].find(node=>node.textContent.trim()===${JSON.stringify(label)}); if(!b) throw Error('Button absent: '+${JSON.stringify(label)}); b.click(); })()`); await delay(70); };
  const jump = async (index) => select("visual-step-choice",index);
  const revealTable = async () => { await evaluate(cdp, `(() => { const detail=[...${visual}.querySelectorAll('details')].find(node=>node.querySelector('tbody [data-fallback-step]')); detail.open=true; })()`); };
  const elementShot = async (selector,name) => {
    await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
    const clip = await evaluate(cdp, `(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()`);
    const shot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,fromSurface:true,clip});
    await writeFile(path.join(EVIDENCE_DIR,name),Buffer.from(shot.data,"base64"));
  };
  const locale = async value => { await evaluate(cdp, `[...document.querySelectorAll('[role=group] button')].find(node=>node.textContent.trim()===${JSON.stringify(value.toUpperCase())}).click()`); await waitFor(cdp, `document.querySelector('[data-paper3-lesson]')?.lang===${JSON.stringify(value)} && document.documentElement.lang===${JSON.stringify(value)}`, "lesson locale "+value); };
  const shape = async () => evaluate(cdp, `(() => {const regions=[...${visual}.querySelectorAll('[role=img]')].map(node=>{const r=node.getBoundingClientRect();return {label:node.getAttribute('aria-label'),left:r.left,right:r.right,width:r.width,scrollWidth:node.scrollWidth,clientWidth:node.clientWidth};}); return {viewport:innerWidth,pageOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,regions,outside:regions.filter(r=>r.left<0||r.right>innerWidth+1||r.scrollWidth>r.clientWidth+1)};})()`);
  await viewport(cdp,1440);
  await navigate(cdp,route,`${visual}`);
  const structure=await evaluate(cdp, `({title:document.querySelector('h1').textContent,lang:document.documentElement.lang,anchors:['understand','observe','worked-example','recognise','check','recall','sources-title'].every(id=>document.getElementById(id)),worked:document.querySelectorAll('[data-worked-step]').length,questions:document.querySelectorAll('[data-checkpoint-id]').length,preview:Boolean(document.querySelector('#topic-preparation-title')),progress:document.querySelectorAll('[data-paper3-lesson] [role=progressbar]').length,presets:[...document.querySelector('#float-input').options].map(option=>option.value)})`);
  record("CH13-B01",structure.lang==="en"&&structure.anchors&&structure.worked===7&&structure.questions===4&&!structure.preview&&structure.progress===0&&JSON.stringify(structure.presets)===JSON.stringify(["-13.25","6.5","0.375","-8","0"]),"Pilot renders substantive lesson sections and five declared exact visual inputs without mastery UI",structure);
  await elementShot("[data-visual-stage]","QA_pilot-magnitude-en-desktop.png");
  await jump(1); const scale=await snapshot();
  record("CH13-B02",scale.step==="scale"&&scale.binary.some(text=>text.endsWith("1101.01"))&&scale.binary.some(text=>text.endsWith("0.110101"))&&scale.e==="0100","Point movement displays the correct before/after binary magnitude and exponent",scale);
  await button("Next"); const pad=await snapshot();
  await button("Next"); const invert=await snapshot();
  await elementShot("[data-visual-stage]","QA_pilot-invert-en-desktop.png");
  await button("Next"); const addition=await snapshot();
  record("CH13-B03",pad.step==="pad"&&pad.m.at(-1)==="01101010"&&invert.step==="invert"&&JSON.stringify(invert.m)===JSON.stringify(["01101010","10010101"])&&addition.step==="add-one"&&JSON.stringify(addition.m)===JSON.stringify(["10010101","10010110"])&&addition.e==="0100","Next produces distinct pad, inversion and add-one states with unchanged exponent",{pad,invert,addition});
  await elementShot("[data-visual-stage]","QA_pilot-add-one-en-desktop.png");
  await button("Previous"); record("CH13-B04",JSON.stringify(await snapshot())===JSON.stringify(invert),"Previous restores the identical prior snapshot");
  await jump(5); await elementShot("[data-visual-stage]","QA_pilot-normalised-en-desktop.png");
  await jump(6); const final=await snapshot();
  await elementShot("[data-visual-stage]","QA_pilot-verify-en-desktop.png");
  const finalBoundary=await evaluate(cdp, `[...${visual}.querySelectorAll('button')].find(node=>node.textContent.trim()==='Next').disabled`);
  record("CH13-B05",final.step==="verify"&&final.m.at(-1)==="10010110"&&final.e==="0100"&&final.equation.includes("-13.25")&&finalBoundary,"Jump to final answer yields the verified bits/equation and disables Next",final);
  await revealTable();
  const fallback=await evaluate(cdp, `({rows:[...${visual}.querySelectorAll('[data-fallback-step]')].map(row=>({id:row.dataset.fallbackStep,text:row.textContent})),visible:[...${visual}.querySelectorAll('details')].some(detail=>detail.open&&detail.querySelector('[data-fallback-step]'))})`);
  record("CH13-B06",fallback.visible&&fallback.rows.length===7&&fallback.rows.find(row=>row.id==='invert').text.includes('10010101')&&fallback.rows.find(row=>row.id==='add-one').text.includes('10010110')&&fallback.rows.find(row=>row.id==='verify').text.includes(final.equation),"Text/table fallback shows all shared steps and the same final equation",fallback);
  await button("Reset"); const reset=await snapshot();
  record("CH13-B07",reset.step==="magnitude"&&reset.input==="-13.25"&&await evaluate(cdp,`[...${visual}.querySelectorAll('button')].find(node=>node.textContent.trim()==='Previous').disabled`),"Reset returns to the first step of the same input and disables Previous",reset);
  for(const [input,m,e,steps] of [["6.5","01101000","0011",5],["0.375","01100000","1111",5],["-8","10000000","0011",7],["0","00000000","0000",2]]) {
    await select("float-input",input); const start=await snapshot(); await jump(steps-1); const end=await snapshot();
    record(`CH13-B-INPUT-${input}`,start.step===(input==="0"?"zero":"magnitude")&&end.stepCount===steps&&end.m.at(-1)===m&&end.e===e,"Changing the supported input resets only the visual and computes its actual signed value",{start,end});
  }
  await select("float-input","-8"); await jump(5); const negativePower=await snapshot();
  await elementShot("[data-visual-stage]","QA_pilot-negative8-normalised-en-desktop.png");
  record("CH13-B08",negativePower.m[0]==="11000000"&&negativePower.m[1]==="10000000"&&negativePower.e==="0011"&&negativePower.equation.includes("-64/128")&&negativePower.equation.includes("-128/128"),"Negative power of two includes an explicit value-preserving normalisation step",negativePower);
  await select("float-mode","decode"); const decodeStart=await snapshot(); await jump(4); const decodeEnd=await snapshot();
  record("CH13-B09",decodeStart.step==="decode-format"&&decodeEnd.step==="decode-check"&&decodeEnd.stepCount===5&&decodeEnd.equation.includes("-8"),"Decode mode starts from bits and follows its own five-step explanation",{decodeStart,decodeEnd});
  await select("float-input","0.375"); await jump(2); const negativeExponent=await snapshot();
  await elementShot("[data-visual-stage]","QA_pilot-point375-decode-en-desktop.png");
  record("CH13-B10",negativeExponent.step==="decode-exponent"&&negativeExponent.e==="1111"&&negativeExponent.equation.includes("15 − 16 = -1"),"Signed exponent is decoded independently from the number's sign",negativeExponent);

  const cp=lesson.checkpoints[0]; const wrong=cp.choices.find(choice=>choice.id!==cp.correctChoiceId);
  const cpSelector=`[data-checkpoint-id="${cp.id}"]`;
  const cpAction=async text=>{await evaluate(cdp,`[...document.querySelector(${JSON.stringify(cpSelector)}).querySelectorAll('button')].find(button=>button.textContent.trim()===${JSON.stringify(text)}).click()`);await delay(70);};
  record("CH13-B11",await evaluate(cdp,`[...document.querySelector(${JSON.stringify(cpSelector)}).querySelectorAll('button')].find(button=>button.textContent.trim()==='Check answer').disabled`),"Checkpoint does not submit without a selected answer");
  await evaluate(cdp,`document.querySelector(${JSON.stringify(cpSelector+` input[value="${wrong.id}"]`)}).click()`); await cpAction("Check answer");
  const wrongFeedback=await evaluate(cdp,`document.querySelector(${JSON.stringify(cpSelector)}).querySelector('[data-correct]').textContent`);
  record("CH13-B12",wrongFeedback.includes(wrong.feedback.en),"Wrong-answer feedback explains the specific misconception",{wrongFeedback});
  await cpAction("Show explanation");
  await evaluate(cdp,`document.querySelector(${JSON.stringify(cpSelector+` input[value="${cp.correctChoiceId}"]`)}).click()`);await cpAction("Check answer");
  record("CH13-B13",await evaluate(cdp,`document.querySelector(${JSON.stringify(cpSelector)}).querySelector('[data-correct=true]').textContent.includes('supported retry')`),"Showing the explanation then answering correctly is labelled a supported retry");
  await select("float-input","-13.25"); await select("float-mode","encode"); await jump(4);
  const beforeLocale=await snapshot(); await locale("vi"); const afterLocale=await snapshot();
  const localeState=await evaluate(cdp,`({selected:document.querySelector(${JSON.stringify(cpSelector)}).querySelector('input:checked')?.value,feedback:document.querySelector(${JSON.stringify(cpSelector)}).querySelector('[data-correct=true]')?.textContent,hash:location.hash,qa:new URLSearchParams(location.search).get('qa'),why:${visual}.textContent.includes('Vì sao?')})`);
  record("CH13-B14",JSON.stringify(instructionalState(beforeLocale))===JSON.stringify(instructionalState(afterLocale))&&localeState.selected===cp.correctChoiceId&&localeState.feedback.includes('có hỗ trợ')&&localeState.hash==="#observe"&&localeState.qa==="pilot"&&localeState.why,"EN/VI preserves visual input/mode/step/bits and checkpoint history while translating explanations",{beforeLocale,afterLocale,localeState});
  await elementShot("[data-visual-stage]","QA_pilot-add-one-vi-desktop.png");
  await axe(cdp,"CH13-B15","Pilot with opened feedback/fallback has no serious or critical axe violations");
  await evaluate(cdp,"document.querySelector('button[data-theme-toggle]').click()"); await waitFor(cdp,"document.documentElement.classList.contains('dark')","dark theme");
  await elementShot("[data-visual-stage]","QA_pilot-add-one-vi-dark-desktop.png");
  for(const width of [768,320]) {
    await viewport(cdp,width); const layout=await shape();
    record(`CH13-B-VIEW-${width}`,!layout.pageOverflow&&layout.outside.length===0,`Visual bit fields remain readable within ${width}px viewport without internal clipping`,layout);
    await elementShot("[data-visual-stage]",`QA_pilot-add-one-vi-dark-${width}.png`);
    if(width===320) {
      await evaluate(cdp,`[...${visual}.querySelectorAll('button')].find(node=>node.textContent.trim()==='Bước tiếp').scrollIntoView({block:'start',behavior:'instant'})`);
      const controlsNearBits=await evaluate(cdp,`(() => { const next=[...${visual}.querySelectorAll('button')].find(node=>node.textContent.trim()==='Bước tiếp'); const fields=[...${visual}.querySelectorAll('[data-bit-field] [role=img]')]; const nr=next.getBoundingClientRect(); return {next:{top:nr.top,bottom:nr.bottom},fields:fields.map(node=>{const r=node.getBoundingClientRect();return {label:node.getAttribute('aria-label'),top:r.top,bottom:r.bottom}}),beforeBits:Boolean(next.compareDocumentPosition(fields[0])&Node.DOCUMENT_POSITION_FOLLOWING),height:innerHeight}; })()`);
      record("CH13-B22",controlsNearBits.beforeBits&&controlsNearBits.next.top>=0&&controlsNearBits.fields.every(field=>field.top>=controlsNearBits.next.bottom&&field.bottom<=controlsNearBits.height),"Mobile learner can operate Next and compare the before/after bit fields in one viewport",controlsNearBits);
      await screenshot(cdp,"QA_pilot-controls-and-bits-vi-dark-320.png");
      const weightSummary=await evaluate(cdp,`(() => {const detail=[...${visual}.querySelectorAll('details')].find(node=>!node.querySelector('[data-fallback-step]'));detail.open=true; const rows=[...detail.querySelectorAll('tbody tr')].map(row=>row.textContent);return {rows,nearEquation:detail.parentElement.contains(${visual}.querySelector('[data-visual-equation]'))};})()`);
      record("CH13-B23",weightSummary.rows.length===12&&weightSummary.nearEquation&&weightSummary.rows[0].includes('−1')&&weightSummary.rows[8].includes('−8'),"Mobile weight fallback remains next to the diagram and exposes both signed fields",weightSummary);
    }
  }
  await axe(cdp,"CH13-B16","Vietnamese 320px dark pilot has no serious or critical axe violations");
  await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  const beforeMotion=await snapshot();
  const motion=await evaluate(cdp,`(() => {const seconds=text=>Math.max(...text.split(',').map(value=>value.endsWith('ms')?parseFloat(value)/1000:parseFloat(value)||0));return {matches:matchMedia('(prefers-reduced-motion: reduce)').matches,animated:[...document.querySelectorAll('[data-paper3-lesson] *')].filter(node=>node.getClientRects().length).map(node=>({transition:getComputedStyle(node).transitionDuration,animation:getComputedStyle(node).animationDuration})).filter(item=>seconds(item.transition)>0.001||seconds(item.animation)>0.001)};})()`);
  record("CH13-B17",motion.matches&&motion.animated.length===0&&JSON.stringify(await snapshot())===JSON.stringify(beforeMotion),"Reduced motion keeps the same instructional snapshot and disables animation",motion);
  await viewport(cdp,720,450); await cdp.send("Emulation.setDeviceMetricsOverride",{width:720,height:450,deviceScaleFactor:2,mobile:false});
  const zoom=await shape();record("CH13-B18",!zoom.pageOverflow&&zoom.outside.length===0,"200% layout-equivalent viewport reflows without clipped bit fields",zoom);
  await viewport(cdp,1440); await locale("en");
  const urlAfterSecondLocale=await evaluate(cdp,"location.href");
  await evaluate(cdp,"document.querySelector('#float-mode').focus()");await press(cdp,"Tab","Tab",9);
  const focus=await evaluate(cdp,`(() => {const node=document.activeElement;const style=getComputedStyle(node);return {id:node.id,visible:node.matches(':focus-visible'),outlineWidth:parseFloat(style.outlineWidth),outlineStyle:style.outlineStyle};})()`);
  record("CH13-B19",focus.id==="float-input"&&focus.visible&&focus.outlineWidth>=2&&focus.outlineStyle!=="none","Keyboard Tab reaches native preset selector with visible focus",focus);
  await evaluate(cdp,"document.querySelector('#float-input').focus()");await press(cdp,"ArrowDown","ArrowDown",40);await press(cdp,"Enter","Enter",13);await delay(100);
  record("CH13-B20",(await snapshot()).input!=="-13.25","Native keyboard selection changes the visual example",await snapshot());
  const urlBeforeReload=await evaluate(cdp,"location.href");
  await evaluate(cdp,"window.__qaBeforeReload=true");
  await cdp.send("Page.reload",{ignoreCache:true});await waitFor(cdp,`!window.__qaBeforeReload && ${visual} && document.readyState==='complete'`,"new pilot document after refresh"); await delay(200);
  const refreshed=await evaluate(cdp,"({href:location.href,hash:location.hash,lang:document.querySelector('[data-paper3-lesson]').lang,htmlLang:document.documentElement.lang})");
  record("CH13-B21",refreshed.hash==='#observe'&&refreshed.lang==='en'&&refreshed.htmlLang==='en',"Deep lesson URL survives refresh",{urlAfterSecondLocale,urlBeforeReload,refreshed});
  await evaluate(cdp,"document.querySelector('nav a[href=\"#recognise\"]').click()");
  await waitFor(cdp,"location.hash==='#recognise'","recognise in-page navigation");
  await evaluate(cdp,"document.querySelector('nav a[href=\"#observe\"]').click()");
  await waitFor(cdp,"location.hash==='#observe'","explore in-page navigation");
  const anchorState=await evaluate(cdp,"({hash:location.hash,top:document.querySelector('#observe').getBoundingClientRect().top,height:innerHeight,lang:new URLSearchParams(location.search).get('lang')})");
  record("CH13-B24",anchorState.hash==='#observe'&&anchorState.lang==='en'&&anchorState.top>=-30&&anchorState.top<anchorState.height,"In-page Explore link scrolls to the visual and preserves locale",anchorState);
  const localeUrls=[];
  for(const value of ['vi','en','vi','en']) { await locale(value); await delay(100); localeUrls.push(await evaluate(cdp,"({href:location.href,hash:location.hash,lang:document.querySelector('[data-paper3-lesson]').lang,query:new URLSearchParams(location.search).get('lang')})")); }
  record("CH13-B25",localeUrls.every((state,index)=>state.hash==='#observe'&&state.lang===(index%2?'en':'vi')&&state.query===state.lang),"Repeated EN/VI changes keep exactly one anchor fragment",localeUrls);
  await evaluate(cdp,"history.back()");await waitFor(cdp,"document.querySelector('[data-paper3-lesson]').lang==='vi'&&new URLSearchParams(location.search).get('lang')==='vi'","locale history back");
  const historyBack=await evaluate(cdp,"({hash:location.hash,lang:document.documentElement.lang})");
  await evaluate(cdp,"history.forward()");await waitFor(cdp,"document.querySelector('[data-paper3-lesson]').lang==='en'&&new URLSearchParams(location.search).get('lang')==='en'","locale history forward");
  const historyForward=await evaluate(cdp,"({hash:location.hash,lang:document.documentElement.lang})");
  record("CH13-B26",historyBack.hash==='#observe'&&historyBack.lang==='vi'&&historyForward.hash==='#observe'&&historyForward.lang==='en',"Browser back/forward restores the locale and the original anchor",{historyBack,historyForward});
  for(const route of ["/paper-3/sections/13?lang=en","/paper-3?lang=vi","/paper-4?lang=en","/docs"]) {
    await navigate(cdp,route,"document.querySelector('h1')");const state=await evaluate(cdp,"({title:document.querySelector('h1').textContent,missing:document.body.innerText.includes('This page could not be found')})");
    record("CH13-B-REGRESSION-"+route,Boolean(state.title)&&!state.missing,"Scoped shell/docs/Paper4 route remains reachable",state);
  }
}

async function batchConceptAndFileScenarios(cdp) {
  const v="document.querySelector('[data-visual-kind]')";
  const select=async(id,value)=>{await evaluate(cdp,`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(String(value))};el.dispatchEvent(new Event('change',{bubbles:true}));})()`);await delay(50);};
  const input=async(id,value)=>{await evaluate(cdp,`(()=>{const el=document.getElementById(${JSON.stringify(id)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(String(value))});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(50);};
  const click=async(label)=>{await evaluate(cdp,`(()=>{const el=[...${v}.querySelectorAll('button')].find(node=>node.textContent.trim()===${JSON.stringify(label)});if(!el)throw Error('Missing button: '+${JSON.stringify(label)});el.click();})()`);await delay(50);};
  const textOf=async(selector)=>evaluate(cdp,`document.querySelector(${JSON.stringify(selector)})?.textContent??null`);
  const jump=async(index)=>select('visual-step-choice',index);
  const end=async()=>jump(await evaluate(cdp,"document.querySelector('#visual-step-choice').options.length-1"));
  const machine=async()=>evaluate(cdp,`(()=>{const el=${v};return {dataset:{...el.dataset},inputs:[...el.querySelectorAll('input,select')].map(n=>({id:n.id,value:n.value,checked:n.type==='checkbox'?n.checked:undefined})),slots:[...el.querySelectorAll('[data-slot]')].map(n=>({slot:n.dataset.slot,key:n.dataset.key,active:n.dataset.active,visited:n.dataset.visited})),record:[...el.querySelectorAll('[data-record-cell]')].map(n=>({cell:n.dataset.recordCell,value:n.textContent})),memory:[...el.querySelectorAll('[data-memory-value]')].map(n=>({address:n.dataset.memoryValue,value:n.textContent})),enum:el.querySelector('[data-enum-value]')?.textContent,pointer:el.querySelector('[data-pointer-value]')?.textContent,set:el.querySelector('[data-set-result] strong')?.textContent,outcome:el.querySelector('[data-outcome]')?.dataset.outcome};})()`);
  const fileState=async()=>evaluate(cdp,`({step:${v}.dataset.visualStep,table:[...${v}.querySelectorAll('[data-slot]')].map(n=>n.dataset.key==='empty'?null:Number(n.dataset.key)),path:${v}.querySelector('[data-probe-path] strong')?.textContent,outcome:${v}.querySelector('[data-outcome]')?.dataset.outcome,rows:${v}.querySelectorAll('[data-fallback-step]').length,equation:${v}.querySelector('[data-visual-equation]')?.textContent})`);
  const shots=async(kind,suffix)=>{await evaluate(cdp,`${v}.scrollIntoView({block:'start',behavior:'instant'})`);await screenshot(cdp,`QA_batch-${kind}-${suffix}.png`);const selectors={'enumeration':'[data-enum-value]','pointers':'[data-memory-value]','sets':'[data-set-result]','records':'[data-record-cell]','file-organisation':'[data-slot]','hashing':'[data-slot]','collisions':'[data-slot]'};await evaluate(cdp,`document.querySelector(${JSON.stringify(selectors[kind])}).closest('table,ol')?.scrollIntoView({block:'center',behavior:'instant'})??document.querySelector(${JSON.stringify(selectors[kind])}).scrollIntoView({block:'center',behavior:'instant'})`);await screenshot(cdp,`QA_batch-${kind}-state-${suffix}.png`);};
  const locales=async(value)=>{await evaluate(cdp,`[...document.querySelectorAll('[role=group] button')].find(n=>n.textContent.trim()===${JSON.stringify(value.toUpperCase())}).click()`);await waitFor(cdp,`document.querySelector('[data-paper3-lesson]').lang===${JSON.stringify(value)}&&document.documentElement.lang===${JSON.stringify(value)}`,'batch locale '+value);};
  const declarations=[['enumeration','user-defined-and-enumerated-types'],['pointers','pointers-and-referenced-data'],['sets','sets'],['records','records-and-composite-models'],['file-organisation','organisation-versus-access'],['hashing','hashing-to-locate-records'],['collisions','collisions-and-retrieval']];
  for(const [kind,slug] of declarations) {
    await viewport(cdp,1440);await navigate(cdp,`/paper-3/topics/${slug}?lang=en`,`${v}?.dataset.visualKind===${JSON.stringify(kind)}`);
    if(await evaluate(cdp,"document.documentElement.classList.contains('dark')"))await evaluate(cdp,"document.querySelector('button[data-theme-toggle]').click()");
    const authored=JSON.parse(await readFile(path.join(ROOT,`content/paper3/lessons/${slug}.json`),'utf8'));
    const structure=await evaluate(cdp,`({kind:${v}.dataset.visualKind,questions:document.querySelectorAll('[data-checkpoint-id]').length,worked:document.querySelectorAll('[data-worked-step]').length,preview:Boolean(document.querySelector('#topic-preparation-title')),placeholder:${v}.textContent.includes('not available')})`);
    record(`B8-${kind}-STRUCTURE`,structure.kind===kind&&structure.questions===authored.checkpoints.length&&structure.worked===authored.workedExample.steps.length&&!structure.preview&&!structure.placeholder,'Authored lesson and intended visual render without a placeholder',structure);
    if(kind==='enumeration') {
      record('B8-ENUM-GATE',await evaluate(cdp,`[...${v}.querySelectorAll('button')].find(n=>n.textContent.trim()==='2. Declare Status').disabled`),'Variable cannot be declared before its type');
      await click('Define type');await click('2. Declare Status');
      record('B8-ENUM-DECLARE',(await textOf('[data-enum-value]'))==='Unassigned','Declaration creates an unassigned variable, not a domain member');
      await click('Try assignment');const assigned=await textOf('[data-enum-value]');
      for(const candidate of ['Archived','"Active"']) {await select('enum-candidate',candidate);await click('Try assignment');record('B8-ENUM-REJECT-'+candidate,(await textOf('[data-enum-value]'))===assigned&&await evaluate(cdp,`${v}.querySelector('[data-error=true]')!==null`),'Absent enum member and STRING literal are rejected without overwriting the valid value');}
      await evaluate(cdp,`[...${v}.querySelectorAll('input[type=checkbox]')].filter(n=>n.checked).forEach(n=>n.click())`);await delay(50);await click('Redefine type');
      record('B8-ENUM-EMPTY',(await textOf('[data-enum-value]'))==='Active'&&await evaluate(cdp,`${v}.querySelector('[data-error=true]').textContent.includes('at least one')`),'An empty domain is rejected without deleting the current type or variable');
      await evaluate(cdp,`${v}.querySelectorAll('input[type=checkbox]')[1].click()`);await click('Redefine type');await click('2. Declare Status');await select('enum-candidate','Paused');await click('Try assignment');
      record('B8-ENUM-REDEFINE',(await textOf('[data-enum-value]'))==='Paused'&&await evaluate(cdp,`${v}.querySelector('code').textContent==='TYPE TStudyStatus = (Paused)'`),'Domain edits rebuild the demonstration and actual assignment uses the new domain');
    } else if(kind==='pointers') {
      await click('Read P^');record('B8-POINTER-READ',(await textOf('[data-pointer-read]')).includes('P^ = 25')&&(await textOf('[data-pointer-value]'))==='100','Dereference reads data while retaining the address');
      await input('memory-100','30');await click('Update A');await click('Read P^');record('B8-POINTER-UPDATE',(await textOf('[data-pointer-read]')).includes('P^ = 30')&&(await textOf('[data-pointer-value]'))==='100'&&(await textOf('[data-memory-value="104"]'))==='40','Updating target data changes a later read and leaves the other memory cell and pointer intact');
      await select('pointer-target','104');await input('memory-104','3.5');await click('Update B');record('B8-POINTER-INVALID',(await textOf('[data-memory-value="104"]'))==='40'&&await evaluate(cdp,`${v}.querySelector('[data-error=true]')!==null`),'Non-integer data is rejected without mutating a typed destination');
      await select('pointer-target','none');await click('Read P^');record('B8-POINTER-NONE',(await textOf('[data-pointer-read]'))===null&&await evaluate(cdp,`${v}.querySelector('[data-error=true]').textContent.includes('no valid target')`),'No-target dereference fails explicitly instead of returning zero');
      await select('pointer-target','104');await click('Read P^');
    } else if(kind==='sets') {
      await select('set-operation','intersection');record('B8-SET-INTERSECTION',(await textOf('[data-set-result] strong'))==="X ∩ Y = {'C'}",'Intersection has only the shared element');
      await evaluate(cdp,`${v}.querySelectorAll('fieldset')[1].querySelectorAll('input')[2].click()`);await delay(50);record('B8-SET-EMPTY',(await textOf('[data-set-result] strong'))==='X ∩ Y = ∅','Removing the only shared member produces the empty set');
      await select('set-operation','union');record('B8-SET-UNION',(await textOf('[data-set-result] strong'))==="X ∪ Y = {'A', 'B', 'C'}",'Union keeps an element that remains in one set');
      await click("Add 'C' to X again");record('B8-SET-UNIQUE',(await textOf('[data-set-result] strong'))==="X ∪ Y = {'A', 'B', 'C'}"&&await evaluate(cdp,`${v}.querySelector('[role=status]').textContent.includes('does not change')`),'Re-adding an existing element does not duplicate it');
      await select('set-operation','membership');await select('membership-set','Y');record('B8-SET-MEMBERSHIP',(await textOf('[data-set-result] strong'))==="'C' ∈ Y: FALSE",'Membership produces a Boolean using the selected set');
    } else if(kind==='records') {
      await click('Update field');record('B8-RECORD-UPDATE',(await textOf('[data-record-cell="2.Score"]'))==='85'&&(await textOf('[data-record-cell="1.Score"]'))==='72'&&(await textOf('[data-record-cell="2.Name"]'))==='"Binh"','Array index and field access change only the intended record field');
      await input('record-value','85.5');await click('Update field');record('B8-RECORD-INVALID',(await textOf('[data-record-cell="2.Score"]'))==='85'&&await evaluate(cdp,`${v}.querySelector('[data-error=true]')!==null`),'Fractional assignment is rejected for an INTEGER field');
      await select('record-view','record');record('B8-RECORD-INSTANCE',await evaluate(cdp,`${v}.textContent.includes('Students[2] : TStudent')`),'One-record view labels the selected typed instance');
      await select('record-view','type');record('B8-RECORD-TYPE',await evaluate(cdp,`${v}.querySelector('caption').textContent.includes('not student data')&&${v}.querySelector('tbody').textContent.includes('STRING')`),'Type view shows field names and types separately from values');
      await select('record-view','array');await select('record-field','Name');await input('record-value','Hà');await click('Update field');record('B8-RECORD-STRING',(await textOf('[data-record-cell="2.Name"]'))==='"Hà"'&&(await textOf('[data-record-cell="1.Name"]'))==='"An"','STRING fields accept text and preserve the other record');
    } else if(kind==='file-organisation') {
      const cases=[['serial','sequential','find20','missing',[25,12,31,18],'1 → 2 → 3 → 4'],['sequential','sequential','find20','missing',[12,18,25,31],'1 → 2 → 3'],['sequential','direct','find18','found',[12,18,25,31],'2'],['random','direct','find20','missing',[null,null,null,31,25,12,18],'6 → 0'],['random','sequential','read-all','read',[null,null,null,31,25,12,18],'0 → 1 → 2 → 3 → 4 → 5 → 6'],['sequential','sequential','insert22','inserted',[12,18,22,25,31],'—'],['serial','direct','find18','unsupported',[25,12,31,18],'—']];
      for(const [org,access,task,outcome,table,path] of cases) {await select('file-organisation',org);await select('file-access',access);await select('file-task',task);await end();const state=await fileState();record(`B8-ORG-${org}-${access}-${task}`,state.outcome===outcome&&JSON.stringify(state.table)===JSON.stringify(table)&&state.path===path,'Organisation/access combination follows its declared storage, key checks and stop condition',state);if(task==='read-all')record('B8-ORG-READOUTPUT',(await textOf('[data-file-output]')).includes('31 → 25 → 12 → 18'),'Read-all output follows storage order instead of silently sorting');}
      await select('file-organisation','sequential');await select('file-access','direct');await select('file-task','find18');await end();
    } else if(kind==='hashing') {
      for(const key of [0,6,13,17,24,31,9999]) {await input('file-key-input',key);await click('Use this key');await jump(2);const state=await fileState();record('B8-HASH-KEY-'+key,state.equation===`${key} MOD 7 = ${key%7}`&&state.table[key%7]!==undefined,'Input produces a real MOD7 home address',state);}
      const before=await fileState();for(const bad of ['', '-1','3.5','10000','1e2','NaN']) {await input('file-key-input',bad);await click('Use this key');const after=await fileState();record('B8-HASH-INVALID-'+bad,JSON.stringify(before)===JSON.stringify(after)&&await evaluate(cdp,`${v}.querySelector('[role=alert]')!==null`),'Unsupported key is rejected and the currently applied key/table/step stay intact');}
      await input('file-key-input','17');await click('Use this key');await end();const collision=await fileState();record('B8-HASH-COMPARE',collision.outcome==='collision'&&collision.equation==='10 ≠ 17','Matching home address does not falsely return a different key',collision);
    } else if(kind==='collisions') {
      await end();const found=await fileState();record('B8-COLLISION-FOUND',found.outcome==='found'&&found.path==='3 → 4 → 5','Lookup checks each colliding key before success',found);await click('Previous');await click('Next');record('B8-COLLISION-RESTORE',JSON.stringify(await fileState())===JSON.stringify(found),'Previous/Next restores the exact prior collision snapshot');
      await input('file-key-input','31');await click('Use this key');await end();const missing=await fileState();record('B8-COLLISION-WRAP',missing.outcome==='missing'&&missing.path==='3 → 4 → 5 → 6 → 0 → 1','Missing lookup wraps and stops at the first unused empty slot',missing);
      await select('collision-operation','insert');await end();const inserted=await fileState();record('B8-COLLISION-INSERT',inserted.outcome==='inserted'&&JSON.stringify(inserted.table)===JSON.stringify([13,31,null,10,17,24,6]),'Insert uses the same probe path and changes only the free slot',inserted);
      await input('file-key-input','17');await click('Use this key');await end();const duplicate=await fileState();record('B8-COLLISION-DUPLICATE',duplicate.outcome==='duplicate'&&JSON.stringify(duplicate.table)===JSON.stringify([13,null,null,10,17,24,6]),'Duplicate insertion preserves every stored record',duplicate);
      await select('collision-dataset','full');await input('file-key-input','49');await click('Use this key');await end();const full=await fileState();record('B8-COLLISION-FULL',full.outcome==='full'&&full.path==='0 → 1 → 2 → 3 → 4 → 5 → 6'&&full.rows===9,'Full table insert stops after seven inspections without overwrite',full);
      await select('collision-operation','lookup');await end();record('B8-COLLISION-FULL-MISSING',(await fileState()).outcome==='missing','Full table unsuccessful lookup terminates');
      await select('collision-dataset','empty');await end();const empty=await fileState();record('B8-COLLISION-EMPTY',empty.outcome==='missing'&&empty.path==='0'&&empty.rows===2,'Empty table lookup terminates after one slot',empty);
      await select('collision-dataset','base');await select('collision-operation','build');const buildStart=await fileState();await end();const built=await fileState();record('B8-COLLISION-BUILD',buildStart.table.every(key=>key===null)&&JSON.stringify(built.table)===JSON.stringify([13,null,null,10,17,24,6])&&await evaluate(cdp,"document.querySelector('#file-key-input').disabled"),'Build mode actually constructs the shared base table through successive insertions',{buildStart,built});
    }
    await shots(kind,'en-desktop');const before=await machine();await locales('vi');const after=await machine();
    record(`B8-${kind}-LOCALE`,JSON.stringify(before)===JSON.stringify(after),'EN/VI preserves all current applied data and control state',{before,after});
    const fallback=await evaluate(cdp,`(()=>{const el=${v};el.querySelectorAll('details').forEach(node=>node.open=true);return {tables:el.querySelectorAll('table').length,rows:el.querySelectorAll('tbody tr').length};})()`);
    record(`B8-${kind}-FALLBACK`,fallback.tables>0&&fallback.rows>0,'Current state has a readable data-equivalent table fallback',fallback);
    await axe(cdp,`B8-${kind}-AXE-DESKTOP`,'Desktop VI has no serious/critical axe violation');
    await evaluate(cdp,"document.querySelector('button[data-theme-toggle]').click()");
    for(const width of [768,320]) {await viewport(cdp,width);const layout=await overflow(cdp);record(`B8-${kind}-LAYOUT-${width}`,!layout.overflow,`${width}px lesson does not cause horizontal page overflow`,layout);await shots(kind,`vi-${width}`);}
    await axe(cdp,`B8-${kind}-AXE-320`,'320px VI has no serious/critical axe violation');
    const firstControl=await evaluate(cdp,`(()=>{const n=${v}.querySelector('select,input,button');n.focus();return n.id||n.tagName})()`);await press(cdp,'Tab','Tab',9);
    const focus=await evaluate(cdp,`({visible:document.activeElement.matches(':focus-visible'),outline:parseFloat(getComputedStyle(document.activeElement).outlineWidth),tag:document.activeElement.tagName})`);record(`B8-${kind}-KEYBOARD`,focus.visible&&focus.outline>=2,'Native tab flow has visible focus',{firstControl,focus});
    console.log(`Finished browser visual: ${kind}`);
  }
}

async function numericScenarios(cdp) {
  const v="document.querySelector('[data-visual-kind]')";
  const select=async(id,value)=>{await evaluate(cdp,`(()=>{const n=document.getElementById(${JSON.stringify(id)});n.value=${JSON.stringify(String(value))};n.dispatchEvent(new Event('change',{bubbles:true}));})()`);await delay(50);};
  const click=async(label)=>{await evaluate(cdp,`[...${v}.querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(label)}).click()`);await delay(50);};
  const jump=async(index)=>select('visual-step-choice',index);
  const count=async()=>evaluate(cdp,"document.querySelector('#visual-step-choice').options.length");
  const snapshot=async()=>evaluate(cdp,`(()=>{const n=${v};return {dataset:{...n.dataset},inputs:[...n.querySelectorAll('select')].map(el=>[el.id,el.value]),bits:[...n.querySelectorAll('[data-bit-field] [role=img]')].map(el=>el.getAttribute('aria-label').split(': ').at(-1)),equation:n.querySelector('[data-visual-equation]')?.textContent,value:n.querySelector('[data-normalised-value]')?.textContent,error:n.querySelector('[data-signed-error]')?.textContent,limits:[...n.querySelectorAll('[class*=limitCard] > strong')].map(el=>el.textContent),spacing:n.querySelector('[data-precision-spacing] strong')?.textContent,bitLoss:n.querySelector('[data-bit-loss]')?{original:n.querySelector('[data-original-binary]').textContent,normalised:n.querySelector('[data-normalised-binary]').textContent,kept:n.querySelector('[data-kept-bits]').textContent,discarded:n.querySelector('[data-discarded-bits]').textContent,increment:n.querySelector('[data-rounding-increment]').dataset.roundingIncrement}:null};})()`);
  const numberFromExact=text=>{const [numerator,denominator]=text.split('/').map(Number);return denominator===undefined?numerator:numerator/denominator;};
  const shot=async(name,selector='[data-visual-kind]')=>{await evaluate(cdp,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await screenshot(cdp,`QA_numeric-${name}.png`);};
  for(const [kind,slug] of [['normalisation','normalisation'],['precision-range','precision-range-and-limits'],['rounding-errors','approximation-rounding-and-range-errors']]) {
    await viewport(cdp,1440);await navigate(cdp,`/paper-3/topics/${slug}?lang=en#observe`,`${v}?.dataset.visualKind===${JSON.stringify(kind)}`);
    if(await evaluate(cdp,"document.documentElement.classList.contains('dark')"))await evaluate(cdp,"document.querySelector('button[data-theme-toggle]').click()");
    const authored=JSON.parse(await readFile(path.join(ROOT,`content/paper3/lessons/${slug}.json`),'utf8'));
    const structure=await evaluate(cdp,"({questions:document.querySelectorAll('[data-checkpoint-id]').length,worked:document.querySelectorAll('[data-worked-step]').length,lang:document.querySelector('[data-paper3-lesson]').lang})");
    record(`N-${kind}-STRUCTURE`,structure.questions===authored.checkpoints.length&&structure.worked===authored.workedExample.steps.length&&structure.lang==='en','Numeric lesson renders all authored checkpoints and worked steps',structure);
    if(kind==='normalisation') {
      for(const [id,value,m,e,endId] of [['negative','-6','10100000','0011','verify'],['positive','5','01010000','0011','verify'],['zero','0','00000000','0000','zero'],['floor','0.0009765625','00100000','1000','limit']]) {
        await select('normalisation-case',id);const size=await count();const frames=[];for(let i=0;i<size;i++){await jump(i);frames.push(await snapshot());}
        const last=frames.at(-1);record(`N-NORMAL-${id}`,frames.every(frame=>frame.value===value)&&last.bits.at(-2)===m&&last.bits.at(-1)===e&&last.dataset.visualStep===endId,'Every displayed normalisation state preserves value, and final bits obey sign/zero/exponent-floor rules',frames);
        await shot(`normalisation-${id}-en-desktop`,'[data-bit-field]');
      }
      await select('normalisation-case','negative');await click('Next');const shift=await snapshot();await click('Previous');await click('Next');record('N-NORMAL-RESTORE',JSON.stringify(await snapshot())===JSON.stringify(shift),'Previous/Next recreates the identical shifted state');await click('Reset');record('N-NORMAL-RESET',(await snapshot()).dataset.visualStep==='start','Reset restores initial bits of the current case');await jump(1);
    } else if(kind==='precision-range') {
      const fixture=[['8/4',1/128,[127,1/512,-128,-65/32768]],['6/6',1/32,[2080374784,2**-33,-2147483648,-17*2**-37]],['10/2',1/512,[511/256,1/8,-2,-257/2048]]];
      for(const [format,spacing,limits] of fixture) {
        await select('float-allocation',format);await select('precision-lens','spacing');
        for(const pair of [0,3]) {await select('precision-pair',pair);const state=await snapshot();const equation=`${0.5+(pair+1)*spacing} − ${0.5+pair*spacing} = ${spacing}`;record(`N-PRECISION-${format}-${pair}`,state.spacing===equation,'Selected adjacent values use the declared fixed exponent zero spacing',state);}
        await shot(`precision-${format.replace('/','-')}-spacing-en-desktop`,'[class*=numberLines]');
        await select('precision-lens','limits');const state=await snapshot();record(`N-LIMITS-${format}`,JSON.stringify(state.limits.map(numberFromExact))===JSON.stringify(limits),'Four normalised limits retain the signed asymmetry of this bit format',state);await shot(`precision-${format.replace('/','-')}-limits-en-desktop`,'[class*=limitGrid]');
      }
      await click('Reset');record('N-PRECISION-RESET',(await snapshot()).dataset.allocation==='8/4'&&(await snapshot()).spacing==='0.5078125 − 0.5 = 0.0078125','Reset restores allocation, comparison and selected adjacent pair');await select('float-allocation','10/2');await select('precision-lens','limits');
    } else {
      for(const [id,policy,stored,m,e,error] of [['fraction','truncate','13','011010','0100','-0.375'],['fraction','nearest','13.5','011011','0100','0.125'],['repeating','truncate','0.099609375','01100110','1101','-0.000390625'],['repeating','nearest','0.099609375','01100110','1101','-0.000390625']]) {
        await select('approximation-case',id);await select('rounding-policy',policy);await jump((await count())-1);const state=await snapshot();record(`N-ROUND-${id}-${policy}`,state.bits.at(-2)===m&&state.bits.at(-1)===e&&state.error===error&&state.equation.startsWith(stored+' − '),'Approximation shows exact stored bits and signed error, not JavaScript noise',state);
        const loss=state.bitLoss;const expected=id==='fraction'?{original:'1101.011₂',normalised:'0.1101011₂ × 2^(4)',kept:'11010',discarded:'11',increment:policy==='nearest'?'true':'false'}:{original:'0.0(0011)₂',normalised:'0.(1100)₂ × 2^(-3)',kept:'1100110',discarded:'(0110)',increment:'false'};
        record(`N-BITLOSS-${id}-${policy}`,JSON.stringify(loss)===JSON.stringify(expected),'Retained/discarded binary digits and rounding increment explain the exact information loss',{actual:loss,expected});
        await shot(`rounding-${id}-${policy}-en-desktop`,'[data-visual-equation]');await shot(`bitloss-${id}-${policy}-en-desktop`,'[data-bit-loss]');
      }
      for(const id of ['overflow','underflow']) {await select('approximation-case',id);const state=await snapshot();const message=await evaluate(cdp,`${v}.textContent`);record(`N-RANGE-${id}`,state.dataset.visualStep==='range'&&state.bits.length===0&&message.includes('No invented bit pattern')&&(await count())===1,'Out-of-range cases report the limit without fabricated stored bits',state);await shot(`rounding-${id}-en-desktop`,'[class*=rangeErrorVisual]');}
      await select('approximation-case','fraction');await select('rounding-policy','nearest');await click('Next');const before=await snapshot();await click('Previous');await click('Next');record('N-ROUND-RESTORE',JSON.stringify(await snapshot())===JSON.stringify(before),'Rounding Previous/Next restores the same selected neighbour');await click('Reset');record('N-ROUND-RESET',(await snapshot()).dataset.visualStep==='scale','Rounding Reset returns to the exact scale calculation');await jump(2);
    }
    const invariant=await snapshot();await evaluate(cdp,"[...document.querySelectorAll('[role=group] button')].find(n=>n.textContent.trim()==='VI').click()");await waitFor(cdp,"document.querySelector('[data-paper3-lesson]').lang==='vi'",'numeric VI');record(`N-${kind}-LOCALE`,JSON.stringify(await snapshot())===JSON.stringify(invariant),'Locale change retains the numerical state and only translates labels');
    const tables=await evaluate(cdp,`(()=>{${v}.querySelectorAll('details').forEach(n=>n.open=true);return ${v}.querySelectorAll('tbody tr').length;})()`);record(`N-${kind}-FALLBACK`,tables>0,'Numeric states have a complete table/text fallback',{rows:tables});await axe(cdp,`N-${kind}-AXE-DESKTOP`,'Numeric desktop VI has no serious/critical axe violation');
    await evaluate(cdp,"document.querySelector('button[data-theme-toggle]').click()");
    for(const width of [768,320]) {await viewport(cdp,width);const layout=await overflow(cdp);const fields=await evaluate(cdp,`[...${v}.querySelectorAll('[data-bit-field] [role=img],[data-kept-bits]')].map(n=>({scroll:n.scrollWidth,client:n.clientWidth}))`);record(`N-${kind}-LAYOUT-${width}`,!layout.overflow&&fields.every(field=>field.scroll<=field.client+1),'Numeric lesson fits the viewport and bit fields do not internally clip',{layout,fields});await shot(`${kind}-vi-${width}`,kind==='precision-range'?'[class*=limitGrid]':'[data-bit-field]');
      if(kind==='rounding-errors')await shot(`bitloss-fraction-nearest-vi-${width}`,'[data-bit-loss]');
      if(width===320&&kind!=='precision-range') {
        await evaluate(cdp,`${v}.querySelector('[data-bit-field=exponent] [role=img]').scrollIntoView({block:'center',behavior:'instant'})`);
        const cells=await evaluate(cdp,`(()=>{const row=${v}.querySelector('[data-bit-field=exponent] [role=img]');return {expected:row.getAttribute('aria-label').split(': ').at(-1),cells:[...row.children].map(n=>{const r=n.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:n.textContent,left:r.left,right:r.right,width:r.width,visible:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,unobscured:hit===n||n.contains(hit)};})};})()`);
        record(`N-${kind}-EXPONENT-CELLS-320`,cells.cells.length===4&&cells.cells.map(n=>n.text).join('')===cells.expected&&cells.cells.every(n=>n.visible&&n.unobscured&&n.width>4),'All four exponent cells are visible with actual text and unobscured hit points at320px',cells);await screenshot(cdp,`QA_numeric-${kind}-exponent-cells-vi-320.png`);
      }
    }
    await axe(cdp,`N-${kind}-AXE-320`,'Numeric 320px VI has no serious/critical axe violation');
    await viewport(cdp,720,450);const zoom=await overflow(cdp);record(`N-${kind}-ZOOM`,!zoom.overflow,'200% layout-equivalent reflow remains usable',zoom);
    await evaluate(cdp,`${v}.querySelector('select').focus()`);await press(cdp,'Tab','Tab',9);const focus=await evaluate(cdp,"({visible:document.activeElement.matches(':focus-visible'),outline:parseFloat(getComputedStyle(document.activeElement).outlineWidth)})");record(`N-${kind}-KEYBOARD`,focus.visible&&focus.outline>=2,'Numeric keyboard flow has visible focus',focus);
    console.log(`Finished numeric visual: ${kind}`);
  }
}

async function chapterNavigationScenarios(cdp) {
  for(const locale of ['en','vi']) {
    await viewport(cdp,1440);await navigate(cdp,`/paper-3/sections/13?lang=${locale}`,"document.querySelector('#chapter13-overview-title')");
    const overview=await evaluate(cdp,"({strands:document.querySelectorAll('[id^=strand-13-]').length,topics:[...document.querySelectorAll('[data-topic-id]')].map(n=>({id:n.dataset.topicId,href:n.getAttribute('href')})),branches:document.querySelector('section[aria-labelledby=chapter13-overview-title]').querySelectorAll('a').length})");
    record(`C13-NAV-${locale}`,overview.strands===3&&overview.branches===3&&overview.topics.length===11&&new Set(overview.topics.map(t=>t.id)).size===11&&overview.topics.every(t=>t.href.includes('lang='+locale)),'Section13 exposes exactly three syllabus strands and eleven distinct locale-preserving topic links',overview);
    if(process.env.PAPER3_REQUIRE_AVAILABLE==='1') {
      const labels=await evaluate(cdp,"[...document.querySelectorAll('[data-topic-id] small')].map(n=>n.textContent)");
      record(`C13-AVAILABLE-${locale}`,labels.length===11&&labels.every(text=>text.includes(locale==='en'?'Open lesson and visual':'Mở bài học và minh họa')),'All eleven Chapter13 rows are available without preparation labels',labels);
    }
    await evaluate(cdp,"document.querySelector('#chapter13-overview-title').scrollIntoView({block:'start',behavior:'instant'})");await screenshot(cdp,`QA_chapter13-overview-${locale}-desktop.png`);
    const branchHashes=[];for(const id of ['1','2','3']) {await evaluate(cdp,`document.querySelector('section[aria-labelledby=chapter13-overview-title] a[href$="#strand-13-${id}"]').click()`);await delay(120);branchHashes.push(await evaluate(cdp,"location.hash"));}
    record(`C13-BRANCHES-${locale}`,JSON.stringify(branchHashes)===JSON.stringify(['#strand-13-1','#strand-13-2','#strand-13-3']),'All three overview branch links select the correct in-page anchor without duplicate fragments',branchHashes);
    for(const width of [768,320]) {await viewport(cdp,width);const state=await overflow(cdp);record(`C13-OVERVIEW-${locale}-${width}`,!state.overflow,'Chapter overview reflows at tablet and narrow mobile widths',state);await evaluate(cdp,"document.querySelector('#chapter13-overview-title').scrollIntoView({block:'start',behavior:'instant'})");await screenshot(cdp,`QA_chapter13-overview-${locale}-${width}.png`);}
  }
  await viewport(cdp,1440);await navigate(cdp,'/paper-3?lang=vi',"document.querySelector('[data-paper3-map]')");
  const map=await evaluate(cdp,"({nodes:document.querySelectorAll('button[data-section-id]').length,section:document.querySelector('button[data-section-id=\"13\"]').getAttribute('aria-pressed')})");
  record('C13-MAP-NODES',map.nodes===8&&map.section==='true','Study Map preserves its eight sections and the Chapter13 selection',map);
  await evaluate(cdp,"(()=>{const n=document.querySelector('#paper3-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,'13.');n.dispatchEvent(new Event('input',{bubbles:true}));})()");await waitFor(cdp,"document.querySelectorAll('[data-topic-id]').length===11",'Chapter13 map search');
  const search=await evaluate(cdp,"[...document.querySelectorAll('[data-topic-id]')].map(n=>({id:n.dataset.topicId,href:n.getAttribute('href')}))");record('C13-MAP-SEARCH',search.every(n=>n.id.startsWith('P3-13.')&&n.href.includes('lang=vi')),'Map search reaches all eleven Chapter13 lessons in Vietnamese',search);await screenshot(cdp,'QA_chapter13-map-search-vi-desktop.png');
  if(process.env.PAPER3_REQUIRE_AVAILABLE==='1') {
    for(const locale of ['en','vi']) {
      await navigate(cdp,`/paper-3?lang=${locale}`,"document.querySelector('[data-paper3-map]')");
      await evaluate(cdp,"(()=>{const n=document.querySelector('#paper3-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,'P3-');n.dispatchEvent(new Event('input',{bubbles:true}));})()");await waitFor(cdp,"document.querySelectorAll('[data-topic-id]').length===66",'all catalog topics in map search');
      const rows=await evaluate(cdp,"[...document.querySelectorAll('[data-topic-id]')].map(n=>({id:n.dataset.topicId,text:n.querySelector('small').textContent}))");const available=rows.filter(n=>n.text.includes(locale==='en'?'Open lesson and visual':'Mở bài học và minh họa'));const planned=rows.filter(n=>n.text.includes(locale==='en'?'In preparation':'Đang biên soạn'));
      record(`C13-AVAILABILITY-MAP-${locale}`,available.length===11&&planned.length===55&&available.every(n=>n.id.startsWith('P3-13.')),'Map announces exactly eleven available Chapter13 lessons and fifty-five planned topics',{available:available.length,planned:planned.length,ids:available.map(n=>n.id)});await screenshot(cdp,`QA_chapter13-availability-map-${locale}.png`);
    }
    await navigate(cdp,'/paper-3/sections/14?lang=vi',"document.querySelector('[data-topic-id]')");const section14=await evaluate(cdp,"[...document.querySelectorAll('[data-topic-id]')].map(n=>({href:n.href,text:n.querySelector('small').textContent}))");
    record('C13-SECTION14-PLANNED',section14.length>0&&section14.every(n=>n.text.includes('Đang biên soạn')),'Unimplemented Section14 remains planned',section14);
    await navigate(cdp,section14[0].href,"document.querySelector('#topic-preparation-title')");record('C13-SECTION14-PREVIEW',await evaluate(cdp,"!document.querySelector('[data-paper3-lesson]')"),'An unimplemented topic still opens its overview instead of a false completed lesson');
  }
}

async function run() {
  await mkdir(EVIDENCE_DIR, { recursive: true });
  const startedAt = new Date().toISOString();
  const candidateFiles = ["content/paper3/lessons/signed-floating-point-conversion.json", "app/lib/paper3/visual-models.ts", "app/lib/paper3/lesson-registry.ts", "app/paper-3/topics/[slug]/page.tsx", "app/components/paper3-learning/Paper3Shell.tsx", "app/components/paper3-learning/Chapter13Overview.tsx", "app/components/paper3-learning/Chapter13Overview.module.css", "app/components/paper3-learning/lessons/LessonPage.tsx", "app/components/paper3-learning/lessons/LessonPage.module.css", "app/components/paper3-learning/lessons/FloatWorkbench.tsx", "app/components/paper3-learning/lessons/VisualPrimitives.tsx", "app/components/paper3-learning/lessons/LessonCheckpoints.tsx"];
  if(SCOPE!=='pilot') candidateFiles.push(...['user-defined-and-enumerated-types','pointers-and-referenced-data','sets','records-and-composite-models','organisation-versus-access','hashing-to-locate-records','collisions-and-retrieval'].map(slug=>`content/paper3/lessons/${slug}.json`),'app/components/paper3-learning/lessons/ConceptWorkbench.tsx','app/components/paper3-learning/lessons/FileWorkbench.tsx','app/components/paper3-learning/lessons/FileWorkbench.module.css','app/components/paper3-learning/lessons/VisualStage.tsx');
  if(SCOPE==='full11')candidateFiles.push(...['normalisation','precision-range-and-limits','approximation-rounding-and-range-errors'].map(slug=>`content/paper3/lessons/${slug}.json`),'app/components/paper3-learning/lessons/NumericWorkbench.tsx');
  candidateFiles.push('content/paper3/lesson-status.json');
  const candidateHashes = Object.fromEntries(await Promise.all(candidateFiles.map(async file => [file, createHash("sha256").update(await readFile(path.join(ROOT, file))).digest("hex")])));
  const buildFile = path.join(PREVIEW_ROOT, ".next/BUILD_ID");
  const buildId = await exists(buildFile) ? (await readFile(buildFile, "utf8")).trim() : null;
  const buildBinding = { previewRoot: PREVIEW_ROOT, buildFile, startBuildId: buildId, htmlBeforeMatches: false, endBuildId: null, htmlAfterMatches: false };
  const chromePath = await findChrome();
  const debugPort = await freePort();
  const profile = await mkdtemp(path.join(os.tmpdir(), "algocore-chapter13-"));
  const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank"], { windowsHide: true, stdio: "ignore" });
  let cdp;
  let browser = chromePath;
  try {
    const htmlBefore = await (await fetch(`${BASE_URL}/paper-3?lang=en`, { signal: AbortSignal.timeout(20000), cache: "no-store" })).text();
    buildBinding.htmlBeforeMatches = Boolean(buildId && htmlBefore.includes(buildId));
    if (!buildBinding.htmlBeforeMatches) throw new Error("Served HTML does not contain the expected production build ID: " + buildId);
    let version;
    for (let attempt = 0; attempt < 100; attempt += 1) { try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); if (response.ok) { version = await response.json(); break; } } catch { /* This process's Chrome is starting. */ } await delay(100); }
    if (!version) throw new Error("Chrome DevTools endpoint did not start.");
    browser = version.Browser;
    const page = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
    cdp = new Cdp(page.webSocketDebuggerUrl);
    await cdp.open();
    cdp.on("Runtime.consoleAPICalled", (event) => { if (event.type === "error") consoleErrors.push({ text: event.args.map(arg => arg.value ?? arg.description ?? "").join(" "), timestamp: event.timestamp }); });
    cdp.on("Runtime.exceptionThrown", (event) => runtimeErrors.push(event.exceptionDetails));
    await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Accessibility.enable")]);
    if(SCOPE==='pointer-smoke') await hashPointerSmoke(cdp);
    else { await chapter13Scenarios(cdp); if(SCOPE !== 'pilot') {await batchConceptAndFileScenarios(cdp);await hashPointerSmoke(cdp);} if(SCOPE==='full11'){await numericScenarios(cdp);await chapterNavigationScenarios(cdp);} }
    buildBinding.endBuildId = (await readFile(buildFile, "utf8")).trim();
    const htmlAfter = await (await fetch(`${BASE_URL}/paper-3?lang=en`, { signal: AbortSignal.timeout(20000), cache: "no-store" })).text();
    buildBinding.htmlAfterMatches = Boolean(buildId && htmlAfter.includes(buildId));
    record("P3-B-BUILD-BINDING", buildBinding.htmlBeforeMatches && buildBinding.htmlAfterMatches && buildBinding.endBuildId === buildId, "Served HTML matches the expected isolated build before and after all flows; BUILD_ID remains unchanged", buildBinding);
    record("P3-B-CONSOLE", consoleErrors.length === 0 && runtimeErrors.length === 0, "No runtime exceptions or console errors during scoped browser flows", { consoleErrors, runtimeErrors });
  } catch (error) {
    record("P3-B-INCOMPLETE", false, "Browser gate did not complete", { error: error.stack ?? String(error), consoleErrors, runtimeErrors });
  } finally {
    cdp?.close();
    if (chrome.exitCode === null) { chrome.kill(); await Promise.race([new Promise(resolve => chrome.once("exit", resolve)), delay(1500)]); }
    const resolved = path.resolve(profile);
    const relative = path.relative(path.resolve(os.tmpdir()), resolved);
    if (relative && !relative.startsWith("..") && !path.isAbsolute(relative) && path.basename(resolved).startsWith("algocore-chapter13-")) {
      try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* Owned Chrome crashpad may briefly retain a file. */ }
    }
  }
  const failures = checks.filter(check => !check.pass);
  const report = { schema_version: "algocore-chapter13-browser-v1", startedAt, completedAt: new Date().toISOString(), buildId, buildBinding, candidateHashes, hashBinding:process.env.PAPER3_CANDIDATE_FROZEN==='1'?'Root confirmed source/content frozen before this production build and QA run':'Working-tree snapshots only; source may have changed after build. Interim evidence is bound to served build ID, not to these hashes.', scope: SCOPE==='pointer-smoke'?'Trusted coordinate pointer smoke on hashing preset and Next':SCOPE==='pilot'?"Chapter 13 lesson pilot browser verification; no learner-tested or deployment certification":SCOPE==='full11'?'All 11 Chapter 13 lessons and scoped regressions; no learner-tested or deployment certification':"Chapter 13 first eight lessons: pilot and strands 13.1/13.2; no learner-tested or deployment certification", decision: failures.length ? "FAIL" : "PASS", browser, base_url: BASE_URL, checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
  await writeFile(path.join(EVIDENCE_DIR, SCOPE === 'pilot' ? "QA_BROWSER_PILOT_RESULT.json" : SCOPE==='pointer-smoke' ? 'QA_POINTER_SMOKE_RESULT.json' : SCOPE==='full11'?'QA_BROWSER_FULL11_RESULT.json':"QA_BROWSER_BATCH8_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
  if (failures.length) process.exitCode = 1;
}

await run();

