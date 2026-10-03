import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = path.resolve(ROOT, "../planning/paper4/completion-program-2026/lessons/queue/evidence");
const BASE = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3023").replace(/\/$/, "");
const ROUTE = "/paper-4/lessons/queue";
const TRACE = '[data-testid="paper4-queue-trace"]';
const keys = {
  stage: "algocore.paper4.learner.queue.stage.v1",
  trace: "algocore.paper4.learner.queue.trace.v1",
  practice: "algocore.paper4.learner.queue.practice.v1",
  protect: "algocore.paper4.learner.queue.protect-marks.v1",
  recall: "algocore.paper4.learner.queue.recall.v1",
};
const browserPath = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean).find(existsSync);
if (!browserPath) throw new Error("Chrome or Edge is required for the Queue browser gate");

await mkdir(EVIDENCE, { recursive: true });
const profile = await mkdtemp(path.join(os.tmpdir(), "algocore-queue-"));
const debugPort = 9342;
const browser = spawn(browserPath, ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function waitJson(url) {
  for (let index = 0; index < 120; index += 1) {
    try { const response = await fetch(url); if (response.ok) return response.json(); } catch { /* Starting. */ }
    await delay(100);
  }
  throw new Error("Browser debugging endpoint timed out");
}

const target = (await waitJson(`http://127.0.0.1:${debugPort}/json`)).find((item) => item.type === "page");
class CDP {
  constructor(url) { this.id = 0; this.pending = new Map(); this.ws = new WebSocket(url); }
  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message)); else pending.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.ws.close(); }
}

const cdp = new CDP(target.webSocketDebuggerUrl);
const checks = [];
const failures = [];
function record(id, passed, message, evidence = {}) {
  const check = { id, passed: Boolean(passed), message, evidence };
  checks.push(check);
  if (!check.passed) failures.push(check);
}
async function evaluate(expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function wait(expression, label) {
  for (let index = 0; index < 150; index += 1) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await delay(80);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function navigate(url) {
  await cdp.send("Page.navigate", { url });
  await wait("document.readyState === 'complete'", url);
}
const viewport = (width, height, scale = 1) => cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
async function click(selector) {
  await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing ${selector}'); element.focus(); element.click(); })()`);
  await delay(100);
}
async function type(selector, value) {
  await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing ${selector}'); const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await delay(100);
}
async function screenshot(name) {
  const capture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(path.join(EVIDENCE, name), Buffer.from(capture.data, "base64"));
}
async function state() {
  return evaluate(`(() => {
    const root = document.querySelector(${JSON.stringify(TRACE)});
    return {
      index: Number(root.dataset.checkpointIndex), phase: root.dataset.phase, complete: root.dataset.queueComplete,
      answers: root.querySelectorAll('[data-answer-revealed=true]').length,
      draft: root.querySelector('#queue-trace-prediction')?.value ?? '', panels: root.querySelectorAll('[data-trace-panel]').length,
      slots: [...root.querySelectorAll('[data-queue-slot-index]')].map((element) => ({ state: element.dataset.queueSlotState, value: element.querySelector('strong')?.textContent.trim() ?? '', text: element.textContent.replace(/\\s+/g, ' ').trim() })),
      front: root.querySelector('[data-queue-front]')?.textContent ?? '', rear: root.querySelector('[data-queue-rear]')?.textContent ?? '', count: root.querySelector('[data-queue-count]')?.textContent ?? '',
      logical: root.querySelector('[data-logical-order]')?.textContent.replace(/\\s+/g, ' ').trim() ?? '', outcome: root.querySelector('[data-queue-outcome]')?.textContent.trim() ?? '',
      support: root.querySelectorAll('[data-support-case]').length, supportRevealed: root.querySelectorAll('[data-support-revealed=true]').length,
      text: root.textContent.replace(/\\s+/g, ' ').trim(), lang: document.documentElement.lang,
      release: document.querySelector('[data-release-state]')?.dataset.releaseState,
    };
  })()`);
}

let browserName = "unknown";
try {
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Accessibility.enable");
  browserName = (await cdp.send("Browser.getVersion")).product;
  await viewport(1280, 900);
  await navigate(`${BASE}${ROUTE}?lang=en#stage-trace`);
  await evaluate(`Object.values(${JSON.stringify(keys)}).forEach((key) => sessionStorage.removeItem(key)); location.reload()`);
  await wait(`document.querySelector(${JSON.stringify(TRACE)})`, "Queue Trace");

  let current = await state();
  record("QU-B01", current.release === "candidate-awaiting-user-evaluation" && current.index === 0 && current.phase === "predict" && current.panels === 2 && current.slots.length === 3, "Queue candidate opens with one capacity-three scene and two panels", current);
  const initialAx = (await cdp.send("Accessibility.getFullAXTree")).nodes.map((node) => node.name?.value).filter(Boolean).join(" ");
  record("QU-B02", current.answers === 0 && current.support === 0 && !current.logical.includes("[10]") && !initialAx.includes("Logical queue: [10]"), "Answer, resulting logical state and support are absent from DOM and accessibility tree before prediction", { state: current, leakedAx: initialAx.includes("Logical queue: [10]") });

  const expected = [
    { slots: ["10", "free", "free"], live: 1, front: "0", rear: "1", count: "1", logical: "[10]", outcome: "True" },
    { slots: ["10", "20", "free"], live: 2, front: "0", rear: "2", count: "2", logical: "[10, 20]", outcome: "True" },
    { slots: ["free", "20", "free"], live: 1, front: "1", rear: "2", count: "1", logical: "[20]", outcome: "10" },
    { slots: ["free", "20", "30"], live: 2, front: "1", rear: "0", count: "2", logical: "[20, 30]", outcome: "True" },
    { slots: ["40", "20", "30"], live: 3, front: "1", rear: "1", count: "3", logical: "[20, 30, 40]", outcome: "True" },
  ];
  for (let index = 0; index < 5; index += 1) {
    await type("#queue-trace-prediction", `guard physical pointer count logical ${index}`);
    if (index === 1) {
      await click('[data-locale-switch][lang="vi"]');
      await wait(`document.documentElement.lang === 'vi' && document.querySelector('#queue-trace-prediction')?.value.includes('pointer')`, "Queue locale preservation");
    }
    await click('[data-action="record-prediction"]');
    current = await state();
    const slotValues = current.slots.map((slot) => slot.value.replace("trống", "free"));
    const wanted = expected[index];
    const passed = current.phase === "revealed" && current.answers === 1 && current.front.includes(wanted.front) && current.rear.includes(wanted.rear) && current.count.includes(wanted.count) && current.logical.includes(wanted.logical) && current.outcome.endsWith(wanted.outcome) && current.slots.filter((slot) => slot.state === "live").length === wanted.live && JSON.stringify(slotValues) === JSON.stringify(wanted.slots);
    record(`QU-N${index + 1}`, passed, `Primary decision ${index + 1} reveals exact physical/logical state, pointers, count and outcome`, current);
    if (index === 1) await screenshot("queue-normal-en-to-vi.png");
    if (index === 3) await screenshot("queue-wrap-vi.png");
    if (index < 4) {
      await click('[data-action="next"]');
      current = await state();
      record(`QU-H${index + 2}`, current.index === index + 1 && current.phase === "predict" && current.answers === 0 && /Dự đoán|Predict/.test(current.logical) && !current.logical.includes(expected[index + 1].logical), `Decision ${index + 2} hides its result until a fresh prediction`, current);
    }
  }
  record("QU-B03", current.complete === "true" && current.support === 2 && current.front.includes("1") && current.rear.includes("1") && current.count.includes("3") && current.logical.includes("[20, 30, 40]") && current.text.includes("total 90"), "Final front equals rear is visibly full by count and physical/logical views agree", current);
  await screenshot("queue-primary-complete-vi.png");

  for (const [selector, answer] of [['[data-action="reveal-empty"]', "no mutation empty"], ['[data-action="reveal-full"]', "no mutation full"]]) {
    const article = selector.includes("empty") ? '[data-support-case="boundary_empty_dequeue"] textarea' : '[data-support-case="boundary_full_enqueue"] textarea';
    await type(article, answer);
    await click(selector);
  }
  current = await state();
  record("QU-B04", current.supportRevealed === 2 && current.text.includes("None · items [trống, trống] · front 0 · rear 0 · count 0") && current.text.includes("False · items [5, 6] · front 0 · rear 0 · count 2"), "Python None/False rejection outcomes visibly preserve items, front, rear and count", current);
  await screenshot("queue-boundaries-vi.png");

  await evaluate(`sessionStorage.setItem(${JSON.stringify(keys.trace)}, JSON.stringify({schema_version:'paper4-queue-circular-progress-v1',projection_sha256:'BA60CA6CEBB13B53EFEA568BF6D3B18E9CEB008BDD79DC77F6878F5E8DB0CB45',case_kind:'normal-circular-wrap',checkpoint_index:4,phase:'revealed',drafts:{'normal:4':'leak'},revealed_checkpoint_ids:['normal:4'],fixture_id:'forbidden'})); location.reload()`);
  await wait(`document.querySelector(${JSON.stringify(TRACE)})?.dataset.checkpointIndex === '0'`, "stale Queue state rejection");
  current = await state();
  record("QU-B05", current.phase === "predict" && current.draft === "" && current.answers === 0, "Extra public payload or stale persisted state fails closed", current);

  await type("#queue-trace-prediction", "keyboard prediction");
  await wait(`!document.querySelector('[data-action=record-prediction]').disabled`, "record button enabled");
  await evaluate(`document.querySelector('#queue-trace-prediction').focus()`);
  await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  const focus = await evaluate(`(() => { const element = document.activeElement; const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return { action: element.dataset.action, outline: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), width: rect.width, height: rect.height }; })()`);
  record("QU-K01", focus.action === "record-prediction" && focus.outline !== "none" && focus.outlineWidth >= 2 && focus.width >= 44 && focus.height >= 44, "Keyboard order, visible focus and target size are real", focus);

  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const motion = await evaluate(`(() => ({ matches: matchMedia('(prefers-reduced-motion: reduce)').matches, count: [...document.querySelectorAll(${JSON.stringify(`${TRACE} *`)})].filter((element) => element.getClientRects().length && (parseFloat(getComputedStyle(element).animationDuration) > 0 || parseFloat(getComputedStyle(element).transitionDuration) > 0)).length }))()`);
  record("QU-A01", motion.matches && motion.count === 0, "Reduced motion leaves no visible Queue animation", motion);
  await cdp.send("Emulation.setEmulatedMedia", { features: [] });

  const contrast = async (dark) => evaluate(`(() => { document.documentElement.classList.${dark ? "add" : "remove"}('dark'); const rgb=(value)=>value.match(/[\\d.]+/g).slice(0,3).map(Number), lum=(value)=>{const c=rgb(value).map((x)=>x/255).map((x)=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]}, ratio=(a,b)=>{a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}, background=(element)=>{let node=element;while(node&&getComputedStyle(node).backgroundColor==='rgba(0, 0, 0, 0)')node=node.parentElement;return getComputedStyle(node??document.body).backgroundColor}; return [document.querySelector('[data-queue-operation]'), document.querySelector('[data-code-panel=queue-focus] [data-active=true] span:last-child')].map((element)=>ratio(getComputedStyle(element).color,background(element))); })()`);
  const lightContrast = await contrast(false);
  const darkContrast = await contrast(true);
  await evaluate("document.documentElement.classList.remove('dark')");
  record("QU-A02", [...lightContrast, ...darkContrast].every((ratio) => ratio >= 4.5), "Operation and focused-code text meet computed light/dark contrast", { lightContrast, darkContrast });

  for (const [width, height, scale, id] of [[320, 900, 1, "320"], [768, 900, 1, "768"], [1265, 900, 1, "1265"], [1440, 1000, 1, "1440"], [640, 500, 2, "200pct"]]) {
    await viewport(width, height, scale);
    await cdp.send("Page.reload", { ignoreCache: true });
    await wait(`document.querySelector(${JSON.stringify(TRACE)})`, `Queue ${id}`);
    const geometry = await evaluate(`(() => {
      const root=document.querySelector(${JSON.stringify(TRACE)}), rect=(element)=>{const value=element.getBoundingClientRect();return{l:value.left,r:value.right,t:value.top,b:value.bottom,w:value.width,h:value.height}},
      panels=[...root.querySelectorAll('[data-trace-panel]')].map(rect), slots=[...root.querySelectorAll('[data-queue-slot-index]')].map(rect), badges=[...root.querySelectorAll('[data-queue-front],[data-queue-rear],[data-queue-count]')].map(rect),
      code=root.querySelector('[data-code-panel=queue-focus] pre'), nav=document.querySelector('[data-stage-navigation]');
      const noPairOverlap=(items)=>items.every((item,index)=>items.slice(index+1).every((other)=>item.r<=other.l+1||other.r<=item.l+1||item.b<=other.t+1||other.b<=item.t+1));
      return { page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1, panels:panels.length,
        nonOverlap:noPairOverlap(panels), stacked:panels.length===2&&Math.abs(panels[0].l-panels[1].l)<2&&panels[1].t>=panels[0].b-1,
        slots:slots.length===3&&noPairOverlap(slots)&&slots.every((slot)=>slot.w>=60), badges:badges.length===3&&noPairOverlap(badges),
        code:code.scrollWidth<=code.clientWidth+1, nav:getComputedStyle(nav).position, navFit:nav.scrollWidth<=nav.clientWidth+1&&[...nav.querySelectorAll('button')].every((button)=>{const b=button.getBoundingClientRect(),n=nav.getBoundingClientRect();return b.left>=n.left-1&&b.right<=n.right+1}),
        touch:[...root.querySelectorAll('button,textarea')].filter((element)=>element.getClientRects().length).every((element)=>{const value=element.getBoundingClientRect();return value.width>=44&&value.height>=44}) };
    })()`);
    const shouldStack = ["320", "768", "200pct"].includes(id);
    record(`QU-R-${id}`, geometry.page && geometry.panels === 2 && geometry.nonOverlap && (!shouldStack || geometry.stacked) && geometry.slots && geometry.badges && geometry.code && geometry.nav === "static" && geometry.navFit && geometry.touch, `${id} Queue geometry fits without collision, clipping, overflow or navigation intersection`, geometry);
    await screenshot(`queue-trace-${id}.png`);
  }

  await viewport(768, 900);
  await navigate(`${BASE}${ROUTE}?lang=en#stage-practise`);
  await evaluate(`sessionStorage.removeItem(${JSON.stringify(keys.practice)}); location.reload()`);
  await wait("document.querySelector('[data-practice-index=\"0\"]')", "Queue Practice");
  const markers = ["enqueue", "dequeue", "rejection", "circular-rear-last", "linear-rear-next", "linear-rear-last"];
  for (let index = 0; index < 6; index += 1) {
    let practice = await evaluate(`(() => { const root=document.querySelector('[data-practice-index]'); return { index:Number(root.dataset.practiceIndex), marker:root.querySelector('[data-transfer-card]').dataset.transferCard, answers:root.querySelectorAll('[data-answer-revealed]').length, staticCard:Boolean(root.querySelector('[data-static-convention]')), next:root.querySelector('[data-action=next-practice]').disabled }; })()`);
    record(`QU-P${index + 1}`, practice.index === index && practice.marker === markers[index] && practice.answers === 0 && !practice.staticCard && practice.next, `Practice ${index + 1} hides hint, model/result and static support before attempt`, practice);
    await type("[data-practice-index] textarea", `queue answer ${index}`);
    await click('[data-action="record-practice"]');
    practice = await evaluate(`(() => { const root=document.querySelector('[data-practice-index]'); return { answers:root.querySelectorAll('[data-answer-revealed]').length, staticCard:Boolean(root.querySelector('[data-static-convention]')), scenes:root.querySelectorAll('[data-scene],[data-case-kind]').length, next:root.querySelector('[data-action=next-practice]').disabled }; })()`);
    record(`QU-PA${index + 1}`, practice.answers === 1 && practice.staticCard === (index >= 3) && practice.scenes === 0 && (index === 5 || practice.next === false), `Practice ${index + 1} reveals only its owned support; alternate conventions stay static`, practice);
    if (index < 5) await click('[data-action="next-practice"]');
  }

  await viewport(320, 900);
  await click('[data-exit-gate="attempt"]');
  await wait("document.querySelector('[data-protect-marks-mode=progressive]')", "Queue Protect");
  const protect = await evaluate(`(() => { const root=document.querySelector('[data-protect-marks-mode=progressive]'); return { count:Number(root.dataset.riskCount), cards:root.querySelectorAll('article').length, actions:root.querySelectorAll('button').length }; })()`);
  record("QU-B06", protect.count === 4 && protect.cards === 1 && protect.actions === 1, "Protect shows one of four risks and one action", protect);
  await click('[data-learner-stage="protectMarks"][data-stage-state="current"] [data-exit-gate="open"]');
  await wait("document.querySelector('[data-recall-gate] textarea')", "Queue Recall");
  await type("[data-recall-gate] textarea", "front rear count FIFO modulo");
  await click('[data-locale-switch][lang="vi"]');
  await wait("document.documentElement.lang === 'vi' && document.querySelector('[data-recall-gate] textarea')?.value.includes('FIFO')", "Queue Recall locale persistence");
  await evaluate("sessionStorage.setItem('algocore.paper4.learner.performance.trace.v1','keep')");
  await click('[data-action="restart-lesson"]');
  const restart = await evaluate(`({ own:Object.values(${JSON.stringify(keys)}).filter((key)=>sessionStorage.getItem(key)!==null), other:sessionStorage.getItem('algocore.paper4.learner.performance.trace.v1'), recognise:document.querySelector('[data-learner-stage=recognise]')?.dataset.stageState, focusId:document.activeElement?.id })`);
  record("QU-B07", restart.own.length === 0 && restart.other === "keep" && restart.recognise === "current" && restart.focusId === "stage-recognise-title", "Restart clears exactly five Queue keys, preserves another lesson and focuses Recognise", restart);

  const axeSource = await readFile(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
  await evaluate(axeSource);
  const axe = await evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then((result)=>result.violations.map((violation)=>violation.id))");
  record("QU-A03", axe.length === 0, "Axe reports no WCAG A/AA violation", { axe });
  const learnerSurface = await evaluate("document.querySelector('[data-learner-journey]').textContent+' '+[...document.querySelectorAll('[data-learner-journey] *')].flatMap((element)=>[...element.attributes].map((attribute)=>attribute.value)).join(' ')");
  record("QU-B08", !/(fixture[_ -]?id|pattern[_ -]?id|source[_ -]?sha|execution[_ -]?log|official[_ -]?marks|marking[_ -]?atom|queue-reduce|recursive reduce|destructive reduce|RLE reduction|58 patterns|174 scenarios|870 bindings)/i.test(learnerSurface), "Rendered learner surface contains no audit or excluded-path metadata");
} catch (error) {
  record("QU-RUNTIME", false, error instanceof Error ? error.message : String(error));
} finally {
  cdp.close();
  browser.kill();
  await delay(500);
  try { await rm(profile, { recursive: true, force: true }); } catch { /* Windows may retain a lock briefly. */ }
}

const report = {
  schema_version: "paper4-queue-browser-gate-v1",
  candidate_id: "P4-queue-C1",
  decision: failures.length ? "FAIL" : "PASS",
  browser: browserName,
  base_url: BASE,
  route: ROUTE,
  checks_run: checks.length,
  checks_passed: checks.length - failures.length,
  failures,
  checks,
};
await writeFile(path.join(EVIDENCE, "LEARNER_BROWSER_GATE_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (failures.length) process.exitCode = 1;
