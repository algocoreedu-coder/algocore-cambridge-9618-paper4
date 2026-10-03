import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_ROOT = existsSync(path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/recursion")) ? path.resolve(ROOT, "..") : path.resolve(ROOT, "../..");
const EVIDENCE = path.resolve(PAGE_ROOT, "planning/paper4/completion-program-2026/lessons/recursion/evidence");
const BASE = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3027").replace(/\/$/, "");
const ROUTE = "/paper-4/lessons/recursion";
const TRACE = '[data-testid="paper4-recursion-trace"]';
const keys = {
  stage: "algocore.paper4.learner.recursion.stage.v1",
  trace: "algocore.paper4.learner.recursion.trace.v1",
  practice: "algocore.paper4.learner.recursion.practice.v1",
  protect: "algocore.paper4.learner.recursion.protect-marks.v1",
  recall: "algocore.paper4.learner.recursion.recall.v1",
};
const browserPath = [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"].filter(Boolean).find(existsSync);
if (!browserPath) throw new Error("Chrome or Edge required");

await mkdir(EVIDENCE, { recursive: true });
const profile = await mkdtemp(path.join(os.tmpdir(), "algocore-recursion-"));
const browser = spawn(browserPath, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function debugPortFromProfile() {
  const file = path.join(profile, "DevToolsActivePort");
  for (let index = 0; index < 150; index += 1) {
    try {
      const [port] = (await readFile(file, "utf8")).trim().split(/\r?\n/);
      if (/^\d+$/.test(port)) return Number(port);
    } catch { /* Browser is still starting. */ }
    await delay(100);
  }
  throw new Error(`Browser debugging endpoint timed out; profile=${profile}`);
}
async function waitJson(url) {
  for (let index = 0; index < 150; index += 1) {
    try { const response = await fetch(url); if (response.ok) return response.json(); } catch { /* Endpoint is still starting. */ }
    await delay(100);
  }
  throw new Error(`Browser target endpoint timed out; url=${url}`);
}

const debugPort = await debugPortFromProfile();
const target = (await waitJson(`http://127.0.0.1:${debugPort}/json`)).find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error(`No browser page target; debugPort=${debugPort}`);

class CDP {
  constructor(url) { this.id = 0; this.pending = new Map(); this.ws = new WebSocket(url); }
  async open() {
    await new Promise((resolve, reject) => { this.ws.addEventListener("open", resolve, { once: true }); this.ws.addEventListener("error", reject, { once: true }); });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data); const pending = this.pending.get(message.id); if (!pending) return;
      this.pending.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
    });
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  close() { this.ws.close(); }
}

const cdp = new CDP(target.webSocketDebuggerUrl);
const checks = [];
const failures = [];
function record(id, passed, message, evidence = {}) { const check = { id, passed: Boolean(passed), message, evidence }; checks.push(check); if (!check.passed) failures.push(check); }
async function evaluate(expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function safeEvaluate(expression, fallback = null) { try { return await evaluate(expression); } catch { return fallback; } }
async function diagnostics(selector = null) {
  return safeEvaluate(`(() => ({
    url: location.href,
    readyState: document.readyState,
    selector: ${JSON.stringify(selector)},
    selectorCount: ${selector ? `document.querySelectorAll(${JSON.stringify(selector)}).length` : "null"},
    stages: [...document.querySelectorAll('[data-learner-stage]')].map((stage) => ({ id: stage.dataset.learnerStage, state: stage.dataset.stageState, hidden: stage.hidden })),
    activeElement: document.activeElement?.outerHTML?.slice(0, 240) ?? null
  }))()` , { url: "execution-context-unavailable", readyState: null, selector, selectorCount: null, stages: [], activeElement: null });
}
async function waitUntil(expression, label, selector = null, attempts = 250) {
  let lastError = null;
  for (let index = 0; index < attempts; index += 1) {
    try { if (await evaluate(`Boolean(${expression})`)) return; } catch (error) { lastError = error instanceof Error ? error.message : String(error); }
    await delay(80);
  }
  const state = await diagnostics(selector);
  throw new Error(`Timed out waiting for ${label}; url=${state.url}; readyState=${state.readyState}; selector=${selector ?? "n/a"}; selectorCount=${state.selectorCount}; stages=${JSON.stringify(state.stages)}; lastError=${lastError ?? "none"}`);
}
const stageSelector = (stage) => `[data-learner-stage="${stage}"][data-stage-state="current"]:not([hidden])`;
async function waitForStage(stage, selector, label) {
  await waitUntil(`document.querySelector(${JSON.stringify(stageSelector(stage))}) && document.querySelector(${JSON.stringify(selector)})`, label, selector);
}
async function navigate(url, stage, selector) {
  const expected = new URL(url).href;
  await cdp.send("Page.navigate", { url: expected });
  await waitUntil(`location.href===${JSON.stringify(expected)} && document.readyState==='complete'`, `exact navigation ${expected}`, selector);
  await waitForStage(stage, selector, `${stage} stage readiness after navigation`);
  return evaluate("({href:location.href,readyState:document.readyState})");
}
async function reload(stage, selector, label) {
  const expected = await evaluate("location.href");
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitUntil(`location.href===${JSON.stringify(expected)} && document.readyState==='complete'`, `${label} exact reload`, selector);
  await waitForStage(stage, selector, `${label} ${stage} stage readiness`);
}
const viewport = (width, height, scale = 1) => cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
async function waitForAction(selector, label) {
  await waitUntil(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); return Boolean(element && element.getClientRects().length && !element.disabled); })()`, label, selector);
}
async function click(selector, label = `click ${selector}`) {
  await waitForAction(selector, label);
  try { await evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); element.focus(); element.click(); })()`); }
  catch (error) { const state = await diagnostics(selector); throw new Error(`Action failed for ${label}; url=${state.url}; selector=${selector}; selectorCount=${state.selectorCount}; stages=${JSON.stringify(state.stages)}; cause=${error instanceof Error ? error.message : String(error)}`); }
}
async function type(selector, value, label = `type ${selector}`) {
  await waitUntil(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); return Boolean(element && element.getClientRects().length); })()`, label, selector);
  try {
    await evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(element,${JSON.stringify(value)}); element.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await waitUntil(`document.querySelector(${JSON.stringify(selector)})?.value===${JSON.stringify(value)}`, `${label} value commit`, selector);
  } catch (error) { const state = await diagnostics(selector); throw new Error(`Input failed for ${label}; url=${state.url}; selector=${selector}; selectorCount=${state.selectorCount}; stages=${JSON.stringify(state.stages)}; cause=${error instanceof Error ? error.message : String(error)}`); }
}
async function screenshot(name) { const capture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); await writeFile(path.join(EVIDENCE, name), Buffer.from(capture.data, "base64")); }
async function state() {
  return evaluate(`(() => { const root=document.querySelector(${JSON.stringify(TRACE)}); return {
    index:Number(root.dataset.checkpointIndex), phase:root.dataset.phase, complete:root.dataset.recursionComplete,
    frames:[...root.querySelectorAll('[data-frame-index]')].map((element)=>({index:Number(element.dataset.frameIndex),active:element.dataset.frameActive??'',read:element.dataset.currentRead??'',text:element.textContent.replace(/\\s+/g,' ').trim()})),
    returns:[...root.querySelectorAll('[data-returned-subtotal]')].map((element)=>Number(element.dataset.returnedSubtotal)), stackEmpty:root.querySelector('[data-call-stack]')?.dataset.stackEmpty??'',
    draft:root.querySelector('#recursion-trace-prediction')?.value??'', panels:root.querySelectorAll('[data-trace-panel]').length, supports:root.querySelectorAll('[data-support-case]').length,
    supportOpen:root.querySelectorAll('[data-support-revealed=true]').length, text:root.textContent.replace(/\\s+/g,' ').trim(), lang:document.documentElement.lang,
    release:document.querySelector('[data-release-state]')?.dataset.releaseState
  }; })()`);
}

let browserName = "unknown";
try {
  await cdp.open(); await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Accessibility.enable");
  browserName = (await cdp.send("Browser.getVersion")).product;
  await viewport(1280, 900);
  const preNavigation = await evaluate("location.href");
  const targetUrl = `${BASE}${ROUTE}?lang=en#stage-trace`;
  const firstNavigation = await navigate(targetUrl, "trace", "#recursion-trace-prediction");
  record("RC-B00", preNavigation === "about:blank" && firstNavigation.href === new URL(targetUrl).href && firstNavigation.readyState === "complete", "Navigation leaves about:blank only after the exact target and Trace action are ready", { preNavigation, firstNavigation });
  const repeatedNavigation = await navigate(targetUrl, "trace", "#recursion-trace-prediction");
  record("RC-B00R", repeatedNavigation.href === new URL(targetUrl).href && repeatedNavigation.readyState === "complete", "Repeated navigation waits for the exact target and Trace action", repeatedNavigation);
  await evaluate(`Object.values(${JSON.stringify(keys)}).forEach((key)=>sessionStorage.removeItem(key))`);
  await reload("trace", "#recursion-trace-prediction", "clean Trace");
  let current = await state();
  record("RC-B01", current.release === "candidate-awaiting-teacher-post-render" && current.index === 0 && current.phase === "predict" && current.panels === 2, "Teacher-post-render candidate opens in predict", current);
  const initialAx = (await cdp.send("Accessibility.getFullAXTree")).nodes.map((node) => node.name?.value).filter(Boolean).join(" ");
  record("RC-B02", current.frames.length === 0 && current.returns.length === 0 && current.supports === 0 && !initialAx.includes("Returned subtotals"), "Results/support absent from DOM and AX before prediction", { state: current, leak: initialAx.includes("Returned subtotals") });

  const stacks = [[0], [0,1], [0,1,2], [0,1,2,3], [0,1,2], [0,1], [0], []];
  const returns = [[], [], [], [], [0], [0,2], [0,2,9], [0,2,9,13]];
  const producingFrames = [null, null, null, null, 3, 2, 1, 0];
  for (let index = 0; index < 8; index += 1) {
    await type("#recursion-trace-prediction", `frame subtotal ${index}`, `Trace prediction ${index + 1}`);
    if (index === 1) {
      await click('[data-locale-switch][lang="vi"]', "Trace locale switch to Vietnamese");
      await waitUntil(`document.documentElement.lang==='vi' && document.querySelector('#recursion-trace-prediction')?.value.includes('subtotal') && document.querySelector(${JSON.stringify(stageSelector("trace"))})`, "Trace locale/state preservation", "#recursion-trace-prediction");
    }
    await click('[data-action="record-prediction"]', `record Trace prediction ${index + 1}`);
    await waitUntil(`document.querySelector(${JSON.stringify(TRACE)})?.dataset.phase==='revealed' && document.querySelector(${JSON.stringify(TRACE)})?.dataset.checkpointIndex==='${index}'`, `Trace checkpoint ${index + 1} reveal`, TRACE);
    current = await state();
    record(`RC-N${index + 1}`, current.phase === "revealed" && JSON.stringify(current.frames.map((frame) => frame.index)) === JSON.stringify(stacks[index]) && JSON.stringify(current.returns) === JSON.stringify(returns[index]) && (index !== 3 || current.frames.find((frame) => frame.index === 3)?.read === "false" && current.frames.find((frame) => frame.index === 3)?.text.includes("không đọc")) && (producingFrames[index] === null || !current.frames.some((frame) => frame.index === producingFrames[index])) && (index < 4 ? current.frames.filter((frame) => frame.active === "true").length === 1 && current.frames.some((frame) => frame.index === index && frame.active === "true") : current.frames.every((frame) => frame.active === "")) && (index !== 7 || current.stackEmpty === "true"), `Checkpoint ${index + 1} owns exact post-return stack, active frame and return lane`, current);
    if (index === 3) await screenshot("recursion-base-not-read-vi.png");
    if (index === 7) await screenshot("recursion-unwind-complete-vi.png");
    if (index < 7) {
      await click('[data-action="next"]', `advance to Trace checkpoint ${index + 2}`);
      await waitUntil(`document.querySelector(${JSON.stringify(TRACE)})?.dataset.checkpointIndex==='${index + 1}' && document.querySelector(${JSON.stringify(TRACE)})?.dataset.phase==='predict' && document.querySelector('#recursion-trace-prediction')`, `Trace checkpoint ${index + 2} predict readiness`, "#recursion-trace-prediction");
      current = await state();
      record(`RC-H${index + 2}`, current.index === index + 1 && current.phase === "predict" && current.frames.length === 0 && current.returns.length === 0, `Checkpoint ${index + 2} requires fresh prediction`, current);
    }
  }
  record("RC-B03", current.complete === "true" && current.supports === 2 && current.frames.length === 0 && current.stackEmpty === "true" && JSON.stringify(current.returns) === "[0,2,9,13]", "Primary completes with an empty stack, no active/pending frame and return lane 0→2→9→13", current);
  for (const id of ["boundary-empty", "rejection-non-integer"]) {
    const selector = `[data-support-case="${id.replace("-", ":")}"] textarea`;
    await type(selector, id, `${id} support prediction`);
    await click(`[data-action="reveal-${id}"]`, `${id} support reveal`);
    await waitUntil(`document.querySelector(${JSON.stringify(`[data-support-case="${id.replace("-", ":")}"] [data-support-revealed="true"]`)})`, `${id} support result`, `[data-support-case="${id.replace("-", ":")}"]`);
  }
  current = await state();
  record("RC-B04", current.supportOpen === 2 && current.text.includes("INVALID_VALUE") && current.text.includes("0 ngay") && current.text.includes("số frame tạo ra: 0"), "Empty boundary and wrapper rejection reveal exact distinction", current);
  await screenshot("recursion-boundary-wrapper-vi.png");

  await evaluate(`sessionStorage.setItem(${JSON.stringify(keys.trace)},JSON.stringify({schema_version:'paper4-recursion-call-stack-progress-v1',projection_sha256:'7F1CF8E367C9066C9025DAE544B51D1529D0DD96DF66D9D85BAEFE6904CC8C6B',case:'normal-recursive-sum',checkpoint:7,phase:'revealed',drafts:{'normal:7':'x'},reveal_ids:['normal:7'],fixture_id:'leak'}))`);
  await reload("trace", "#recursion-trace-prediction", "fail-closed Trace");
  await waitUntil(`document.querySelector(${JSON.stringify(TRACE)})?.dataset.checkpointIndex==='0'`, "fail-closed checkpoint reset", TRACE);
  current = await state();
  record("RC-B05", current.phase === "predict" && current.draft === "" && current.frames.length === 0, "Extra stored field fails closed", current);
  await type("#recursion-trace-prediction", "keyboard", "keyboard prediction");
  await evaluate("document.querySelector('#recursion-trace-prediction').focus()");
  await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  const focus = await evaluate(`(() => { const element=document.activeElement,style=getComputedStyle(element),rect=element.getBoundingClientRect(); return {action:element.dataset.action,outline:style.outlineStyle,width:rect.width,height:rect.height}; })()`);
  record("RC-K01", focus.action === "record-prediction" && focus.outline !== "none" && focus.width >= 44 && focus.height >= 44, "Keyboard focus and target size", focus);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const motion = await evaluate(`(() => ({match:matchMedia('(prefers-reduced-motion: reduce)').matches,count:[...document.querySelectorAll(${JSON.stringify(`${TRACE} *`)})].filter((element)=>element.getClientRects().length&&(parseFloat(getComputedStyle(element).animationDuration)>0||parseFloat(getComputedStyle(element).transitionDuration)>0)).length}))()`);
  record("RC-A01", motion.match && motion.count === 0, "Reduced motion has no active animation", motion); await cdp.send("Emulation.setEmulatedMedia", { features: [] });

  for (const [width,height,scale,id] of [[320,900,1,"320"],[768,900,1,"768"],[1265,900,1,"1265"],[1440,1000,1,"1440"],[640,500,2,"200pct"]]) {
    await viewport(width, height, scale); await reload("trace", "#recursion-trace-prediction", `geometry ${id}`);
    const geometry = await evaluate(`(() => { const root=document.querySelector(${JSON.stringify(TRACE)}),panels=[...root.querySelectorAll('[data-trace-panel]')].map((element)=>element.getBoundingClientRect()),nav=document.querySelector('[data-stage-navigation]'),code=root.querySelector('[data-code-panel=recursion-focus] pre'); return {page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,panels:panels.length,stacked:panels.length===2&&Math.abs(panels[0].left-panels[1].left)<2&&panels[1].top>=panels[0].bottom-1,overlap:panels.length===2&&!(panels[0].right<=panels[1].left+1||panels[1].right<=panels[0].left+1||panels[0].bottom<=panels[1].top+1||panels[1].bottom<=panels[0].top+1),nav:getComputedStyle(nav).position,fit:nav.scrollWidth<=nav.clientWidth+1,code:code.scrollWidth<=code.clientWidth+1,touch:[...root.querySelectorAll('button,textarea')].filter((element)=>element.getClientRects().length).every((element)=>{const box=element.getBoundingClientRect();return box.width>=44&&box.height>=44})}; })()`);
    const shouldStack = ["320","768","200pct"].includes(id);
    record(`RC-R-${id}`, geometry.page && geometry.panels === 2 && !geometry.overlap && (!shouldStack || geometry.stacked) && geometry.nav === "static" && geometry.fit && geometry.code && geometry.touch, `${id} responsive geometry`, geometry);
    await screenshot(`recursion-trace-${id}.png`);
  }

  await viewport(768, 900);
  await navigate(`${BASE}${ROUTE}?lang=en#stage-practise`, "practise", '[data-practice-index="0"] textarea');
  await evaluate(`sessionStorage.removeItem(${JSON.stringify(keys.practice)})`);
  await reload("practise", '[data-practice-index="0"] textarea', "clean Practice");
  const markers = ["contract","trace-down-unwind","write-recursive","benefit-cost","iterative-static","boundary-defect"];
  for (let index = 0; index < 6; index += 1) {
    const practiceRoot = `[data-practice-index="${index}"]`;
    await waitForStage("practise", `${practiceRoot} textarea`, `Practice ${index + 1} action readiness`);
    let practice = await evaluate(`(() => { const root=document.querySelector(${JSON.stringify(practiceRoot)}); return {index:Number(root.dataset.practiceIndex),marker:root.querySelector('[data-transfer-card]').dataset.transferCard,answers:root.querySelectorAll('[data-answer-revealed]').length,static:Boolean(root.querySelector('[data-static-transfer]')),next:root.querySelector('[data-action=next-practice]').disabled}; })()`);
    record(`RC-P${index + 1}`, practice.index === index && practice.marker === markers[index] && practice.answers === 0 && !practice.static && practice.next, `Practice ${index + 1} hidden`, practice);
    await type(`${practiceRoot} textarea`, `answer ${index}`, `Practice ${index + 1} answer`);
    await click(`${practiceRoot} [data-action="record-practice"]`, `record Practice ${index + 1}`);
    await waitUntil(`document.querySelector(${JSON.stringify(practiceRoot)})?.querySelectorAll('[data-answer-revealed]').length===1`, `Practice ${index + 1} reveal`, practiceRoot);
    practice = await evaluate(`(() => { const root=document.querySelector(${JSON.stringify(practiceRoot)}); return {answers:root.querySelectorAll('[data-answer-revealed]').length,static:Boolean(root.querySelector('[data-static-transfer]')),scenes:root.querySelectorAll('[data-scene],[data-case-kind]').length,next:root.querySelector('[data-action=next-practice]').disabled}; })()`);
    record(`RC-PA${index + 1}`, practice.answers === 1 && practice.static === (index === 4) && practice.scenes === 0 && (index === 5 || practice.next === false), `Practice ${index + 1} reveals owned support`, practice);
    if (index < 5) {
      await click(`${practiceRoot} [data-action="next-practice"]`, `advance to Practice ${index + 2}`);
      await waitForStage("practise", `[data-practice-index="${index + 1}"] textarea`, `Practice ${index + 2} readiness`);
    }
  }
  await screenshot("recursion-practice-iterative-static-en.png");
  await click('[data-exit-gate="attempt"]', "open Protect marks");
  await waitForStage("protectMarks", '[data-protect-marks-mode="progressive"]', "Protect stage readiness");
  const protect = await evaluate(`(() => { const root=document.querySelector('[data-protect-marks-mode=progressive]'); return {count:Number(root.dataset.riskCount),cards:root.querySelectorAll('article').length,buttons:root.querySelectorAll('button').length}; })()`);
  record("RC-B06", protect.count === 5 && protect.cards === 1 && protect.buttons === 1, "Protect is one of five progressive risks", protect);
  await click('[data-learner-stage="protectMarks"][data-stage-state="current"] [data-exit-gate="open"]', "open Recall");
  await waitForStage("recallAndContinue", '[data-recall-gate] textarea', "Recall stage readiness");
  const recallCount = await evaluate("document.querySelector('[data-recall-gate]')?.dataset.recallCount??document.querySelectorAll('[data-recall-gate] article').length");
  record("RC-B07", await evaluate("Boolean(document.querySelector('[data-recall-gate] textarea'))"), "Recall stage opens its first retrieval prompt", { recallCount });
  await type("[data-recall-gate] textarea", "base progress child unwind", "Recall answer");
  await evaluate("sessionStorage.setItem('algocore.paper4.learner.linked-list.trace.v1','keep')");
  await click('[data-action="restart-lesson"]', "restart Recursion lesson");
  await waitUntil(`document.querySelector(${JSON.stringify(stageSelector("recognise"))}) && document.activeElement?.id==='stage-recognise-title'`, "Restart Recognise focus", "#stage-recognise-title");
  const restart = await evaluate(`({own:Object.values(${JSON.stringify(keys)}).filter((key)=>sessionStorage.getItem(key)!==null),other:sessionStorage.getItem('algocore.paper4.learner.linked-list.trace.v1'),state:document.querySelector('[data-learner-stage=recognise]')?.dataset.stageState,focus:document.activeElement?.id})`);
  record("RC-B08", restart.own.length === 0 && restart.other === "keep" && restart.state === "current" && restart.focus === "stage-recognise-title", "Restart clears only five own keys and focuses Recognise", restart);
  const axeSource = await readFile(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8"); await evaluate(axeSource);
  const axe = await evaluate("axe.run(document.querySelector('[data-learner-journey]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then((result)=>result.violations.map((violation)=>({id:violation.id,nodes:violation.nodes.map((node)=>({target:node.target,html:node.html,summary:node.failureSummary}))})))");
  record("RC-A02", axe.length === 0, "Axe has no A/AA violation", { axe });
  const learnerSurface = await evaluate("document.querySelector('[data-learner-journey]').textContent+' '+[...document.querySelectorAll('[data-learner-journey] *')].flatMap((element)=>[...element.attributes].map((attribute)=>attribute.value)).join(' ')");
  record("RC-B09", !/(fixture[_ -]?id|pattern[_ -]?id|event[_ -]?id|source[_ -]?sha|execution[_ -]?log|official[_ -]?marks|marking[_ -]?atom)/i.test(learnerSurface), "Rendered learner surface has no audit metadata");
} catch (error) {
  record("RC-RUNTIME", false, error instanceof Error ? error.message : String(error), await diagnostics());
} finally {
  cdp.close(); browser.kill(); await delay(300); try { await rm(profile, { recursive: true, force: true }); } catch { /* Windows can retain a browser lock briefly. */ }
}

const report = { schema_version: "paper4-recursion-browser-gate-v2", candidate_id: "P4-recursion-C1", projection_sha256: "7F1CF8E367C9066C9025DAE544B51D1529D0DD96DF66D9D85BAEFE6904CC8C6B", decision: failures.length ? "FAIL" : "PASS", browser: browserName, base_url: BASE, route: ROUTE, checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
await writeFile(path.join(EVIDENCE, "LEARNER_BROWSER_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
