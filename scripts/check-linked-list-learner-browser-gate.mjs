import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_ROOT = existsSync(path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/linked-list")) ? path.resolve(ROOT, "..") : path.resolve(ROOT, "../..");
const EVIDENCE = path.resolve(PAGE_ROOT, "planning/paper4/completion-program-2026/lessons/linked-list/evidence");
const BASE = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3024").replace(/\/$/, "");
const ROUTE = "/paper-4/lessons/linked-list";
const TRACE = '[data-testid="paper4-linked-list-trace"]';
const keys = {
  stage: "algocore.paper4.learner.linked-list.stage.v1",
  trace: "algocore.paper4.learner.linked-list.trace.v1",
  practice: "algocore.paper4.learner.linked-list.practice.v1",
  protect: "algocore.paper4.learner.linked-list.protect-marks.v1",
  recall: "algocore.paper4.learner.linked-list.recall.v1",
};
const browserPath = [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"].filter(Boolean).find(existsSync);
if (!browserPath) throw new Error("Chrome or Edge is required for the Linked List browser gate");

await mkdir(EVIDENCE, { recursive: true });
const profile = await mkdtemp(path.join(os.tmpdir(), "algocore-linked-list-"));
const debugPort = 9343;
const browser = spawn(browserPath, ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function waitJson(url) { for (let index = 0; index < 120; index += 1) { try { const response = await fetch(url); if (response.ok) return response.json(); } catch { /* Starting. */ } await delay(100); } throw new Error("Browser debugging endpoint timed out"); }
const target = (await waitJson(`http://127.0.0.1:${debugPort}/json`)).find((item) => item.type === "page");
class CDP {
  constructor(url) { this.id = 0; this.pending = new Map(); this.ws = new WebSocket(url); }
  async open() { await new Promise((resolve, reject) => { this.ws.addEventListener("open", resolve, { once: true }); this.ws.addEventListener("error", reject, { once: true }); }); this.ws.addEventListener("message", (event) => { const message = JSON.parse(event.data); const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); if (message.error) pending.reject(new Error(message.error.message)); else pending.resolve(message.result); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  close() { this.ws.close(); }
}
const cdp = new CDP(target.webSocketDebuggerUrl);
const checks = [];
const failures = [];
function record(id, passed, message, evidence = {}) { const check = { id, passed: Boolean(passed), message, evidence }; checks.push(check); if (!check.passed) failures.push(check); }
async function evaluate(expression) { const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); return result.result.value; }
async function wait(expression, label) { for (let index = 0; index < 180; index += 1) { if (await evaluate(`Boolean(${expression})`)) return; await delay(80); } throw new Error(`Timed out waiting for ${label}`); }
async function navigate(url) { await cdp.send("Page.navigate", { url }); await wait("document.readyState === 'complete'", url); }
const viewport = (width, height, scale = 1) => cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
async function click(selector) { await evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); if(!element) throw new Error('Missing ${selector}'); element.focus(); element.click(); })()`); await delay(100); }
async function type(selector, value) { await evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); if(!element) throw new Error('Missing ${selector}'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(element,${JSON.stringify(value)}); element.dispatchEvent(new Event('input',{bubbles:true})); })()`); await delay(100); }
async function screenshot(name) { const capture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); await writeFile(path.join(EVIDENCE, name), Buffer.from(capture.data, "base64")); }
async function state() {
  return evaluate(`(() => { const root=document.querySelector(${JSON.stringify(TRACE)}); return {
    index:Number(root.dataset.checkpointIndex), phase:root.dataset.phase, complete:root.dataset.linkedListComplete,
    answers:root.querySelectorAll('[data-answer-revealed=true]').length, draft:root.querySelector('#linked-list-trace-prediction')?.value??'', panels:root.querySelectorAll('[data-trace-panel]').length,
    rows:[...root.querySelectorAll('[data-node-index]')].map((row)=>({index:Number(row.dataset.nodeIndex),membership:row.dataset.nodeMembership??'',current:row.dataset.nodeCurrent??'',previous:row.dataset.nodePrevious??'',cells:[...row.querySelectorAll('th,td')].map((cell)=>cell.textContent.replace(/\\s+/g,' ').trim())})),
    head:root.querySelector('[data-list-head]')?.textContent??'', free:root.querySelector('[data-free-head]')?.textContent??'', live:root.querySelector('[data-live-chain]')?.textContent??'', freeChain:root.querySelector('[data-free-chain]')?.textContent??'', outcome:root.querySelector('[data-list-outcome]')?.textContent.replace(/\\s+/g,' ').trim()??'',
    supports:root.querySelectorAll('[data-support-case]').length, supportRevealed:root.querySelectorAll('[data-support-revealed=true]').length,
    text:root.textContent.replace(/\\s+/g,' ').trim(), lang:document.documentElement.lang, release:document.querySelector('[data-release-state]')?.dataset.releaseState,
  }; })()`);
}

let browserName = "unknown";
try {
  await cdp.open(); await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Accessibility.enable");
  browserName = (await cdp.send("Browser.getVersion")).product;
  await viewport(1280, 900);
  await navigate(`${BASE}${ROUTE}?lang=en#stage-trace`);
  await evaluate(`Object.values(${JSON.stringify(keys)}).forEach((key)=>sessionStorage.removeItem(key)); location.reload()`);
  await wait(`document.querySelector(${JSON.stringify(TRACE)})`, "Linked List Trace");
  let current = await state();
  record("LL-B01", current.release === "candidate-awaiting-user-evaluation" && current.index === 0 && current.phase === "predict" && current.panels === 2 && current.rows.length === 5, "Linked List user-review candidate opens as one five-row live/free scene", current);
  const initialAx = (await cdp.send("Accessibility.getFullAXTree")).nodes.map((node) => node.name?.value).filter(Boolean).join(" ");
  record("LL-B02", current.answers === 0 && current.supports === 0 && current.live === "" && current.freeChain === "" && current.rows.every((row) => row.membership === "") && !initialAx.includes("Live chain:"), "Results, chains, memberships and support are absent from DOM and accessibility tree before prediction", { state: current, axLeak: initialAx.includes("Live chain:") });

  const expected = [
    { data:["4","None","None","None","None"], next:["-1","2","3","4","-1"], head:"0", free:"1", live:"0→-1", freeChain:"1→2→3→4→-1", membership:["live","free","free","free","free"] },
    { data:["4","2","None","None","None"], next:["-1","0","3","4","-1"], head:"1", free:"2", live:"1→0→-1", freeChain:"2→3→4→-1", membership:["live","live","free","free","free"] },
    { data:["4","2","1","None","None"], next:["-1","0","1","4","-1"], head:"2", free:"3", live:"2→1→0→-1", freeChain:"3→4→-1", membership:["live","live","live","free","free"] },
    { data:["4","2","1","None","None"], next:["-1","0","1","4","-1"], head:"2", free:"3", live:"2→1→0→-1", freeChain:"3→4→-1", membership:["live","live","live","free","free"] },
    { data:["4","2","1","None","None"], next:["-1","0","1","4","-1"], head:"2", free:"3", live:"2→1→0→-1", freeChain:"3→4→-1", membership:["live","live","live","free","free"] },
    { data:["4","None","1","None","None"], next:["-1","3","0","4","-1"], head:"2", free:"1", live:"2→0→-1", freeChain:"1→3→4→-1", membership:["live","free","live","free","free"] },
  ];
  for (let index = 0; index < 6; index += 1) {
    await type("#linked-list-trace-prediction", `node links head free partition ${index}`);
    if (index === 1) { await click('[data-locale-switch][lang="vi"]'); await wait(`document.documentElement.lang==='vi'&&document.querySelector('#linked-list-trace-prediction')?.value.includes('partition')`, "Linked List locale preservation"); }
    await click('[data-action="record-prediction"]');
    current = await state();
    const wanted = expected[index];
    const data = current.rows.map((row) => row.cells[1]); const next = current.rows.map((row) => row.cells[2]); const membership = current.rows.map((row) => row.membership);
    const passed = current.phase === "revealed" && current.answers === 1 && JSON.stringify(data) === JSON.stringify(wanted.data) && JSON.stringify(next) === JSON.stringify(wanted.next) && JSON.stringify(membership) === JSON.stringify(wanted.membership) && current.head.endsWith(wanted.head) && current.free.endsWith(wanted.free) && current.live.includes(wanted.live) && current.freeChain.includes(wanted.freeChain);
    record(`LL-N${index + 1}`, passed, `Primary decision ${index + 1} reveals exact data, next, heads and chain partition`, current);
    if (index === 1) await screenshot("linked-list-normal-en-to-vi.png");
    if (index === 4) await screenshot("linked-list-save-before-unlink-vi.png");
    if (index < 5) { await click('[data-action="next"]'); current = await state(); record(`LL-H${index + 2}`, current.index === index + 1 && current.phase === "predict" && current.answers === 0 && current.live === "" && current.freeChain === "" && current.rows.every((row) => row.membership === ""), `Decision ${index + 2} hides its result until a fresh prediction`, current); }
  }
  record("LL-B03", current.complete === "true" && current.supports === 3 && current.head.endsWith("2") && current.free.endsWith("1") && current.live.includes("2→0→-1") && current.freeChain.includes("1→3→4→-1"), "Final live 2→0 and free 1→3→4 form the visible complete partition", current);
  await screenshot("linked-list-primary-complete-vi.png");

  for (const [id, answer] of [["boundary-singleton","singleton"],["rejection-full","full unchanged"],["rejection-missing","missing unchanged"]]) { await type(`[data-support-case="${id.replace("-", ":")}"] textarea`, answer).catch(async()=>{ const selector=id==="boundary-singleton"?'[data-support-case="boundary:singleton"] textarea':id==="rejection-full"?'[data-support-case="rejection:full"] textarea':'[data-support-case="rejection:missing"] textarea'; await type(selector,answer); }); await click(`[data-action="reveal-${id}"]`); }
  current = await state();
  record("LL-B04", current.supportRevealed === 3 && current.text.includes("data [None] · next [-1] · head -1 · free 0") && current.text.includes("insert False") && current.text.includes("remove False") && current.text.includes("data [2, 1] · next [-1, 0] · head 1 · free -1"), "Singleton and both rejection checks reveal exact before/after state and outcomes", current);
  await screenshot("linked-list-boundary-rejections-vi.png");

  await evaluate(`sessionStorage.setItem(${JSON.stringify(keys.trace)},JSON.stringify({schema_version:'paper4-linked-list-live-free-progress-v1',projection_sha256:'D273B1E152335CC29B7C3D6BDFC170886D90DBE84E3F315880E786AE6A6B1B8C',case:'normal-remove-recycle',checkpoint:5,phase:'revealed',drafts:{'normal:5':'leak'},reveal_ids:['normal:5'],fixture_id:'forbidden'})); location.reload()`);
  await wait(`document.querySelector(${JSON.stringify(TRACE)})?.dataset.checkpointIndex==='0'`, "stale Linked List state rejection"); current = await state();
  record("LL-B05", current.phase === "predict" && current.draft === "" && current.answers === 0, "Extra public payload or stale persisted state fails closed", current);

  await type("#linked-list-trace-prediction", "keyboard prediction"); await wait(`!document.querySelector('[data-action=record-prediction]').disabled`, "record enabled"); await evaluate("document.querySelector('#linked-list-trace-prediction').focus()");
  await cdp.send("Input.dispatchKeyEvent", { type:"rawKeyDown", key:"Tab", code:"Tab", windowsVirtualKeyCode:9 }); await cdp.send("Input.dispatchKeyEvent", { type:"keyUp", key:"Tab", code:"Tab", windowsVirtualKeyCode:9 });
  const focus = await evaluate(`(() => { const element=document.activeElement,style=getComputedStyle(element),rect=element.getBoundingClientRect();return{action:element.dataset.action,outline:style.outlineStyle,outlineWidth:parseFloat(style.outlineWidth),width:rect.width,height:rect.height};})()`);
  record("LL-K01", focus.action === "record-prediction" && focus.outline !== "none" && focus.outlineWidth >= 2 && focus.width >= 44 && focus.height >= 44, "Keyboard order, visible focus and target size are real", focus);
  await cdp.send("Emulation.setEmulatedMedia", { features:[{name:"prefers-reduced-motion",value:"reduce"}] });
  const motion = await evaluate(`(() => ({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,count:[...document.querySelectorAll(${JSON.stringify(`${TRACE} *`)})].filter((element)=>element.getClientRects().length&&(parseFloat(getComputedStyle(element).animationDuration)>0||parseFloat(getComputedStyle(element).transitionDuration)>0)).length}))()`);
  record("LL-A01", motion.matches && motion.count === 0, "Reduced motion leaves no visible Linked List animation", motion); await cdp.send("Emulation.setEmulatedMedia", { features:[] });
  const contrast = async (dark) => evaluate(`(() => {
    document.documentElement.classList.${dark?"add":"remove"}('dark');
    const channels=(value)=>value.match(/[\\d.]+/g).map(Number),rgb=(value)=>channels(value).slice(0,3),alpha=(value)=>channels(value)[3]??1;
    const luminance=(value)=>{const channel=rgb(value).map(x=>x/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*channel[0]+.7152*channel[1]+.0722*channel[2]};
    const ratio=(foreground,background)=>{const a=luminance(foreground),b=luminance(background);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
    const paintedBackground=(element)=>{let node=element;while(node){const style=getComputedStyle(node),rect=node.getBoundingClientRect(),background=style.backgroundColor;if(style.display!=='contents'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0&&alpha(background)>0)return{background,node:node.tagName.toLowerCase(),marker:node.dataset.active??node.dataset.codePanel??null,display:style.display,rect:{width:rect.width,height:rect.height}};node=node.parentElement}throw new Error('No visibly painted background ancestor')};
    const inspect=(selector)=>{const element=document.querySelector(selector);if(!element)throw new Error('Missing contrast target '+selector);const foreground=getComputedStyle(element).color,paint=paintedBackground(element);return{selector,text:element.textContent.trim(),foreground,...paint,ratio:ratio(foreground,paint.background)}};
    return{operation:inspect('[data-list-operation]'),code:inspect('[data-code-panel=linked-list-focus] [data-active=true] > span:last-child'),knownBad:{foreground:'rgb(21, 51, 73)',background:'rgb(7, 17, 31)',ratio:ratio('rgb(21, 51, 73)','rgb(7, 17, 31)')}};
  })()`);
  const lightContrast=await contrast(false),darkContrast=await contrast(true); await evaluate("document.documentElement.classList.remove('dark')");
  const contrastResults=[lightContrast.operation,lightContrast.code,darkContrast.operation,darkContrast.code];
  record("LL-A02", contrastResults.every((result)=>result.ratio>=4.5)&&lightContrast.code.marker==="true"&&darkContrast.code.marker==="true"&&lightContrast.knownBad.ratio<4.5, "Operation and focused-code text meet contrast against the first visibly painted ancestor; the former dark-on-dark pair is rejected", {lightContrast,darkContrast});
  await viewport(1280,900); await evaluate(`document.querySelector('[data-code-panel="linked-list-focus"]')?.scrollIntoView({block:'center'})`); await screenshot("linked-list-focused-python-remediated.png");

  for (const [width,height,scale,id] of [[320,900,1,"320"],[768,900,1,"768"],[1265,900,1,"1265"],[1440,1000,1,"1440"],[640,500,2,"200pct"]]) {
    await viewport(width,height,scale); await cdp.send("Page.reload", {ignoreCache:true}); await wait(`document.querySelector(${JSON.stringify(TRACE)})`, `Linked List ${id}`);
    const geometry = await evaluate(`(() => {const root=document.querySelector(${JSON.stringify(TRACE)}),rect=e=>{const v=e.getBoundingClientRect();return{l:v.left,r:v.right,t:v.top,b:v.bottom,w:v.width,h:v.height}},panels=[...root.querySelectorAll('[data-trace-panel]')].map(rect),rows=[...root.querySelectorAll('[data-node-index]')].map(rect),code=root.querySelector('[data-code-panel=linked-list-focus] pre'),table=root.querySelector('table'),nav=document.querySelector('[data-stage-navigation]'),noPair=(items)=>items.every((item,index)=>items.slice(index+1).every(other=>item.r<=other.l+1||other.r<=item.l+1||item.b<=other.t+1||other.b<=item.t+1));return{page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,panels:panels.length,nonOverlap:noPair(panels),stacked:panels.length===2&&Math.abs(panels[0].l-panels[1].l)<2&&panels[1].t>=panels[0].b-1,rows:rows.length===5&&noPair(rows),table:table.scrollWidth<=table.parentElement.clientWidth+1,code:code.scrollWidth<=code.clientWidth+1,nav:getComputedStyle(nav).position,navFit:nav.scrollWidth<=nav.clientWidth+1&&[...nav.querySelectorAll('button')].every(button=>{const b=button.getBoundingClientRect(),n=nav.getBoundingClientRect();return b.left>=n.left-1&&b.right<=n.right+1}),touch:[...root.querySelectorAll('button,textarea')].filter(e=>e.getClientRects().length).every(e=>{const v=e.getBoundingClientRect();return v.width>=44&&v.height>=44})};})()`);
    const shouldStack=["320","768","200pct"].includes(id); record(`LL-R-${id}`, geometry.page&&geometry.panels===2&&geometry.nonOverlap&&(!shouldStack||geometry.stacked)&&geometry.rows&&geometry.table&&geometry.code&&geometry.nav==="static"&&geometry.navFit&&geometry.touch, `${id} Linked List geometry fits without collision, clipping, overflow or navigation intersection`, geometry); await screenshot(`linked-list-trace-${id}.png`);
  }

  await viewport(768,900); await navigate(`${BASE}${ROUTE}?lang=en#stage-practise`); await evaluate(`sessionStorage.removeItem(${JSON.stringify(keys.practice)}); location.reload()`); await wait("document.querySelector('[data-practice-index=\"0\"]')", "Linked List Practice");
  const markers=["remove-head","singleton-tail","first-duplicate","recycle-reuse","rejections","tail-insertion-static","object-nodes-static","dedicated-search-static"];
  for (let index=0;index<8;index+=1) {
    let practice=await evaluate(`(() => {const root=document.querySelector('[data-practice-index]');return{index:Number(root.dataset.practiceIndex),marker:root.querySelector('[data-transfer-card]').dataset.transferCard,answers:root.querySelectorAll('[data-answer-revealed]').length,staticCard:Boolean(root.querySelector('[data-static-transfer]')),scenes:root.querySelectorAll('[data-scene],[data-case-kind]').length,next:root.querySelector('[data-action=next-practice]').disabled};})()`);
    record(`LL-P${index+1}`, practice.index===index&&practice.marker===markers[index]&&practice.answers===0&&!practice.staticCard&&practice.next, `Practice ${index+1} hides support before a non-empty attempt`, practice);
    await type("[data-practice-index] textarea",`linked list answer ${index}`); await click('[data-action="record-practice"]');
    practice=await evaluate(`(() => {const root=document.querySelector('[data-practice-index]');return{answers:root.querySelectorAll('[data-answer-revealed]').length,staticCard:Boolean(root.querySelector('[data-static-transfer]')),scenes:root.querySelectorAll('[data-scene],[data-case-kind]').length,next:root.querySelector('[data-action=next-practice]').disabled};})()`);
    record(`LL-PA${index+1}`, practice.answers===1&&practice.staticCard===(index>=5)&&practice.scenes===0&&(index===7||practice.next===false), `Practice ${index+1} reveals only its owned ${index>=5?"static transfer":"verified support"}`, practice); if(index<7) await click('[data-action="next-practice"]');
  }
  await screenshot("linked-list-practice-static-en.png");
  await viewport(320,900); await click('[data-exit-gate="attempt"]'); await wait("document.querySelector('[data-protect-marks-mode=progressive]')", "Linked List Protect");
  const protect=await evaluate(`(() => {const root=document.querySelector('[data-protect-marks-mode=progressive]');return{count:Number(root.dataset.riskCount),cards:root.querySelectorAll('article').length,actions:root.querySelectorAll('button').length};})()`);
  record("LL-B06", protect.count===4&&protect.cards===1&&protect.actions===1, "Protect shows one of four risks and one action", protect);
  await click('[data-learner-stage="protectMarks"][data-stage-state="current"] [data-exit-gate="open"]'); await wait("document.querySelector('[data-recall-gate] textarea')", "Linked List Recall");
  await type("[data-recall-gate] textarea","save successor old free reconnect live recycle partition"); await click('[data-locale-switch][lang="vi"]'); await wait("document.documentElement.lang==='vi'&&document.querySelector('[data-recall-gate] textarea')?.value.includes('successor')", "Linked List Recall locale preservation");
  await evaluate("sessionStorage.setItem('algocore.paper4.learner.queue.trace.v1','keep')"); await click('[data-action="restart-lesson"]');
  const restart=await evaluate(`({own:Object.values(${JSON.stringify(keys)}).filter(key=>sessionStorage.getItem(key)!==null),other:sessionStorage.getItem('algocore.paper4.learner.queue.trace.v1'),recognise:document.querySelector('[data-learner-stage=recognise]')?.dataset.stageState,focusId:document.activeElement?.id})`);
  record("LL-B07", restart.own.length===0&&restart.other==="keep"&&restart.recognise==="current"&&restart.focusId==="stage-recognise-title", "Restart clears exactly five Linked List keys, preserves Queue and focuses Recognise", restart);
  const axeSource=await readFile(path.join(ROOT,"node_modules/axe-core/axe.min.js"),"utf8"); await evaluate(axeSource); const axe=await evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then(result=>result.violations.map(violation=>violation.id))"); record("LL-A03", axe.length===0, "Axe reports no WCAG A/AA violation", {axe});
  const learnerSurface=await evaluate("document.querySelector('[data-learner-journey]').textContent+' '+[...document.querySelectorAll('[data-learner-journey] *')].flatMap(element=>[...element.attributes].map(attribute=>attribute.value)).join(' ')");
  record("LL-B08", !/(fixture[_ -]?id|pattern[_ -]?id|source[_ -]?sha|execution[_ -]?log|official[_ -]?marks|marking[_ -]?atom|list-insert\.json|list-remove\.json|capacity 0|capacity -)/i.test(learnerSurface), "Rendered learner surface contains no audit, duplicate-trace or invalid-capacity metadata");
} catch (error) { record("LL-RUNTIME", false, error instanceof Error ? error.message : String(error)); }
finally { cdp.close(); browser.kill(); await delay(500); try { await rm(profile,{recursive:true,force:true}); } catch { /* Windows may retain a lock briefly. */ } }

const report={schema_version:"paper4-linked-list-browser-gate-v1",candidate_id:"P4-linked-list-C1",projection_sha256:"D273B1E152335CC29B7C3D6BDFC170886D90DBE84E3F315880E786AE6A6B1B8C",decision:failures.length?"FAIL":"PASS",browser:browserName,base_url:BASE,route:ROUTE,checks_run:checks.length,checks_passed:checks.length-failures.length,failures,checks};
await writeFile(path.join(EVIDENCE,"LEARNER_BROWSER_GATE_RESULT.json"),`${JSON.stringify(report,null,2)}\n`); console.log(JSON.stringify({...report,checks:undefined},null,2)); if(failures.length)process.exitCode=1;
