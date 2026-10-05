import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, section19CandidateFiles } from "./check-paper3-section19-oracle.mjs";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const BASE_URL = (process.env.PAPER3_BASE_URL ?? "http://127.0.0.1:3033").replace(/\/$/, "");
const EXPECTED_BUILD_ID = process.env.PAPER3_EXPECTED_BUILD_ID ?? null;
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section19");
const AXE_FILE = path.join(AUTHORING_ROOT, "node_modules/axe-core/axe.min.js");
const VIEWPORTS = Object.freeze([320, 768, 1440]);
const LOCALES = Object.freeze(["en", "vi"]);
const MIN_SCENARIOS = Object.freeze({
  "linear-search": 6,
  "binary-search": 9,
  "bubble-sort": 6,
  "insertion-sort": 6,
  "stack-adt": 4,
  "queue-adt": 5,
  "linked-list": 11,
  "binary-tree": 5,
  dictionary: 5,
  "adt-implementation": 8,
  "complexity-comparator": 4,
  "recursion-trace": 5,
  "call-stack-unwinding": 1,
});
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe",
].filter(Boolean);
const checks = [];
const consoleErrors = [];
const runtimeErrors = [];
const captures = [];
const startedAt = new Date().toISOString();
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const record = (id, pass, message, evidence = {}) => checks.push({ id, pass: Boolean(pass), message, evidence });

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) if (await exists(candidate)) return candidate;
  throw new Error("Local Chrome or Edge is unavailable");
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function hashFiles(root) {
  return Object.fromEntries(await Promise.all(section19CandidateFiles.map(async relative => {
    const digest = createHash("sha256").update(await readFile(path.join(root, relative))).digest("hex");
    return [relative, digest];
  })));
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (!message.id) {
        for (const listener of this.listeners.get(message.method) ?? []) listener(message.params);
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result);
    });
  }

  on(method, listener) {
    this.listeners.set(method, [...(this.listeners.get(method) ?? []), listener]);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 30000);
      this.pending.set(id, { resolve, reject, method, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    for (const pending of this.pending.values()) clearTimeout(pending.timeout);
    this.pending.clear();
    this.socket.close();
  }
}

async function evaluate(cdp, expression) {
  const response = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
  return response.result.value;
}

async function waitFor(cdp, expression, label, timeoutMilliseconds = 20000) {
  const began = Date.now();
  while (Date.now() - began < timeoutMilliseconds) {
    if (await evaluate(cdp, `Boolean(${expression})`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function viewport(cdp, width, height = 1000) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: width,
    screenHeight: height,
  });
  // Let responsive shell transitions settle before measuring focus targets and
  // overflow. Otherwise the sidebar's animated desktop-to-mobile exit is
  // sampled mid-flight and reported as a persistent layout failure.
  await delay(350);
}

async function navigate(cdp, route, selector = "main") {
  const url = new URL(route, BASE_URL).href;
  await cdp.send("Page.navigate", { url });
  await waitFor(cdp, `location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&document.querySelector(${JSON.stringify(selector)})`, route);
  await delay(120);
}

async function click(cdp, selector) {
  await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing click target: ${selector}');n.click()})()`);
  await delay(40);
}

async function pointerClick(cdp, selector) {
  await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing pointer target');document.documentElement.style.scrollBehavior='auto';document.body.style.scrollBehavior='auto';n.scrollIntoView({behavior:'auto',block:'center',inline:'center'})})()`);
  await delay(60);
  const point = await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(selector)}),b=n.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;if(b.width<=0||b.height<=0||x<0||x>innerWidth||y<0||y>innerHeight)throw Error('Pointer target is outside viewport');return{x,y}})()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(50);
  return point;
}

async function press(cdp, key, code = key, text = "") {
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, text, unmodifiedText: text });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code });
  await delay(50);
}

async function selectValue(cdp, selector, value) {
  await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing select: ${selector}');n.value=${JSON.stringify(value)};n.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  await delay(50);
}

async function controlState(cdp, root) {
  return evaluate(cdp, `(()=>{
    const r=document.querySelector(${JSON.stringify(root)}),j=r?.querySelector('[data-s19-jump]'),s=r?.querySelector('[data-s19-scenario]');
    if(!r||!j)throw Error('Missing Section 19 root or direct-step control');
    const selected=j.options?.[j.selectedIndex];
    const step=r.dataset.s19Step??r.querySelector('[data-s19-step]')?.dataset.s19Step??r.dataset.visualStep??selected?.value??String(j.value);
    const disabled=node=>Boolean(node?.disabled||node?.getAttribute('aria-disabled')==='true');
    return{step,index:j.selectedIndex,selectedValue:j.value,count:j.options?.length??0,scenario:s?.value??null,previous:disabled(r.querySelector('[data-s19-previous]')),next:disabled(r.querySelector('[data-s19-next]'))};
  })()`);
}

async function jump(cdp, root, index) {
  await evaluate(cdp, `(()=>{const j=document.querySelector(${JSON.stringify(root)})?.querySelector('[data-s19-jump]');if(!j)throw Error('Missing direct-step control');const option=j.options[${index}];if(!option)throw Error('Missing direct-step option ${index}');j.value=option.value;j.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  await delay(40);
}

async function semanticState(cdp, root) {
  return evaluate(cdp, `(()=>{
    const r=document.querySelector(${JSON.stringify(root)});
    const text=(...selectors)=>{for(const selector of selectors){const value=r.querySelector(selector)?.innerText?.trim();if(value)return value}return''};
    const state=text('[data-s19-state]','[data-s19-current-state]');
    const rule=text('[data-s19-rule]','[data-s19-current-rule]');
    const outcome=text('[data-s19-outcome]','[data-s19-current-outcome]');
    const j=r.querySelector('[data-s19-jump]'),selected=j?.options?.[j.selectedIndex];
    return{step:r.dataset.s19Step??r.querySelector('[data-s19-step]')?.dataset.s19Step??r.dataset.visualStep??selected?.value??j?.value,state,rule,outcome,text:r.innerText.trim()};
  })()`);
}

async function runAxe(cdp, id, mode) {
  await evaluate(cdp, await readFile(AXE_FILE, "utf8"));
  const violations = await evaluate(cdp, `axe.run(document,{resultTypes:['violations']}).then(result=>result.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})))`);
  record(id, violations.length === 0, `Zero serious/critical axe violations in ${mode} mode`, violations);
}

async function lessonShell(cdp, lesson, lang, root) {
  const actual = await evaluate(cdp, `(()=>{
    const lesson=document.querySelector('[data-paper3-lesson]'),sources=document.querySelector('[data-teacher-sources]'),root=document.querySelector(${JSON.stringify(root)});
    return{topic:lesson?.dataset.paper3Lesson,lessonLang:lesson?.lang,documentLang:document.documentElement.lang,primer:Boolean(document.querySelector('[data-cambridge-primer]')),sourcesOpen:sources?.open,summary:sources?.querySelector('summary')?.innerText,visualText:root?.innerText.length??0,aria:root?.getAttribute('aria-label')??root?.getAttribute('aria-labelledby')};
  })()`);
  const expectedSummary = lang === "vi" ? "Tài liệu giáo viên (tùy chọn)" : "Teacher references (optional)";
  record(`S19-ROUTE-${lesson.slug}-${lang}`, actual.topic === lesson.topicId && actual.lessonLang === lang && actual.documentLang === lang && actual.primer && actual.sourcesOpen === false && actual.summary === expectedSummary && actual.visualText > 150, "Localized lesson, primer, substantive visual and collapsed teacher references render", actual);
}

async function visualSemantics(cdp, lesson, lang, root) {
  const actual = await evaluate(cdp, `(()=>{
    const r=document.querySelector(${JSON.stringify(root)}),fallback=r.querySelector('[data-state-fallback]'),svgs=[...r.querySelectorAll('svg')].filter(svg=>svg.getAttribute('aria-hidden')!=='true');
    return{controls:['previous','next','reset','jump','scenario'].filter(name=>r.querySelector('[data-s19-'+name+']')).length,fallback:Boolean(fallback),fallbackInitiallyClosed:fallback instanceof HTMLDetailsElement?!fallback.open:true,semanticLabels:r.querySelectorAll('[aria-label],[aria-labelledby]').length,svgCount:svgs.length,svgIssues:svgs.map((svg,index)=>({index,title:Boolean(svg.querySelector('title')),desc:Boolean(svg.querySelector('desc')),named:Boolean(svg.getAttribute('aria-label')||svg.getAttribute('aria-labelledby')||svg.getAttribute('role')==='img')})).filter(row=>!row.title||!row.desc||!row.named)};
  })()`);
  record(`S19-SEMANTICS-${lesson.slug}-${lang}`, actual.controls === 5 && actual.fallback && actual.fallbackInitiallyClosed && actual.semanticLabels >= 2 && actual.svgIssues.length === 0, "Visual exposes the complete control set, semantic labels, collapsed fallback and accessible non-decorative SVGs", actual);
}

async function exerciseControls(cdp, lesson, lang, root) {
  const initial = await controlState(cdp, root);
  record(`S19-CONTROLS-INITIAL-${lesson.slug}-${lang}`, initial.index === 0 && initial.count > 1 && initial.previous && !initial.next, "Previous is disabled at the first deterministic state", initial);

  const pointer = await pointerClick(cdp, `${root} [data-s19-next]`);
  const afterPointer = await controlState(cdp, root);
  const pointerFocus = await evaluate(cdp, `document.activeElement?.hasAttribute('data-s19-next')===true`);
  record(`S19-CONTROLS-MOUSE-${lesson.slug}-${lang}`, afterPointer.index === 1 && afterPointer.step !== initial.step && pointerFocus, "A real CDP mouse click advances one state and retains focus", { initial, afterPointer, pointer, pointerFocus });

  await click(cdp, `${root} [data-s19-reset]`);
  const reset = await controlState(cdp, root);
  record(`S19-CONTROLS-RESET-${lesson.slug}-${lang}`, reset.index === 0 && reset.step === initial.step && reset.scenario === initial.scenario, "Reset restores the first state and default scenario", { initial, reset });

  await jump(cdp, root, initial.count - 1);
  const last = await controlState(cdp, root);
  record(`S19-CONTROLS-JUMP-${lesson.slug}-${lang}`, last.index === initial.count - 1 && last.next, "Direct-step selection reaches the upper boundary", last);
  await click(cdp, `${root} [data-s19-previous]`);
  const previous = await controlState(cdp, root);
  record(`S19-CONTROLS-PREVIOUS-${lesson.slug}-${lang}`, previous.index === initial.count - 2, "Previous moves back exactly one state", { last, previous });

  await click(cdp, `${root} [data-s19-reset]`);
  await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-next]').focus()`);
  await press(cdp, "Enter", "Enter", "\r");
  const keyboard = await controlState(cdp, root);
  const focus = await evaluate(cdp, `(()=>{const a=document.activeElement,s=getComputedStyle(a);return{next:a?.hasAttribute('data-s19-next')===true,outline:s.outlineStyle,width:parseFloat(s.outlineWidth)||0,shadow:s.boxShadow}})()`);
  record(`S19-CONTROLS-KEYBOARD-${lesson.slug}-${lang}`, keyboard.index === 1 && focus.next && (focus.outline !== "none" || focus.shadow !== "none"), "Native Enter advances one state and leaves visible focus on Next", { keyboard, focus });
  await click(cdp, `${root} [data-s19-reset]`);
}

async function exerciseScenarios(cdp, lesson, lang, root) {
  const selector = `${root} [data-s19-scenario]`;
  const options = await evaluate(cdp, `[...document.querySelector(${JSON.stringify(selector)}).options].map(option=>({value:option.value,label:option.textContent.trim()}))`);
  record(`S19-SCENARIO-COUNT-${lesson.slug}-${lang}`, options.length >= MIN_SCENARIOS[lesson.kind], "Scenario control exposes the reviewed scenario matrix", { options, minimum: MIN_SCENARIOS[lesson.kind] });
  const scenarioCaptures = [];

  for (const option of options) {
    await selectValue(cdp, selector, option.value);
    const beginning = await controlState(cdp, root);
    const states = [];
    for (let index = 0; index < beginning.count; index += 1) {
      await jump(cdp, root, index);
      const state = await semanticState(cdp, root);
      states.push({ index, step: state.step, state: state.state, rule: state.rule, outcome: state.outcome });
    }
    const uniqueSteps = new Set(states.map(state => state.step));
    const complete = states.every(state => state.step && state.state.length >= 2 && state.rule.length >= 2 && state.outcome.length >= 2);
    record(`S19-SCENARIO-${lesson.slug}-${lang}-${option.value}`, beginning.scenario === option.value && beginning.index === 0 && states.length >= 1 && uniqueSteps.size === states.length && complete, "Scenario resets to step zero and every direct step exposes state, rule and outcome", { option, beginning, states });
    if (lang === "vi") {
      const narration = states.map(state => `${state.rule}\n${state.outcome}`).join("\n");
      const forbidden = ["precondition-failed", "duplicate-rejected", "unreachable-base", "no-progress", "returnedIndex", "comparisonCount", "activeLineId", "scannedKeys", "poppedFrameId"];
      const leaks = forbidden.filter(token => narration.includes(token));
      record(`S19-VI-NARRATION-${lesson.slug}-${option.value}`, leaks.length === 0, "Vietnamese narration contains no raw model enums or boolean literals", { leaks });
    }

    await selectValue(cdp, selector, option.value);
    const repeated = [];
    for (let index = 0; index < beginning.count; index += 1) {
      await jump(cdp, root, index);
      const state = await semanticState(cdp, root);
      repeated.push({ index, step: state.step, state: state.state, rule: state.rule, outcome: state.outcome });
    }
    record(`S19-DETERMINISM-${lesson.slug}-${lang}-${option.value}`, JSON.stringify(states) === JSON.stringify(repeated), "Repeating the same local scenario produces the same semantic trace", { stepCount: states.length });
    scenarioCaptures.push({ id: option.value, label: option.label, states });
  }

  await selectValue(cdp, selector, options[0].value);
  await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}).focus()`);
  await press(cdp, "ArrowDown", "ArrowDown");
  const keyboardScenario = await controlState(cdp, root);
  const scenarioFocused = await evaluate(cdp, `document.activeElement?.hasAttribute('data-s19-scenario')===true`);
  record(`S19-SCENARIO-KEYBOARD-${lesson.slug}-${lang}`, options.length < 2 || (keyboardScenario.scenario !== options[0].value && keyboardScenario.index === 0 && scenarioFocused), "Keyboard changes scenario, resets its state and retains focus", { options, keyboardScenario, scenarioFocused });
  await click(cdp, `${root} [data-s19-reset]`);
  captures.push({ type: "scenarios", slug: lesson.slug, kind: lesson.kind, lang, scenarios: scenarioCaptures });
}

async function defectRegressionChecks(cdp, lesson, lang, root) {
  if (lesson.kind === "dijkstra-search") {
    await click(cdp, `${root} [data-s19-reset]`);
    await click(cdp, `${root} [data-dijkstra-prediction] input[value="S"]`);
    await click(cdp, `${root} [data-dijkstra-reveal]`);
    const prediction = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{result:r.querySelector('[data-prediction-result]')?.dataset.predictionResult,text:r.querySelector('[data-prediction-result]')?.innerText}})()`);
    record(`S19-DIJKSTRA-PREDICT-${lang}`, prediction.result === "correct" && prediction.text?.includes("S"), "Predict-next/reveal checks the next selected node", prediction);
    await jump(cdp, root, 2);
    const evidence = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),svg=r.querySelector('[data-edge-id]')?.ownerSVGElement;return{update:r.querySelector('[data-search-update]')?.innerText,description:svg?.querySelector('desc')?.textContent,stateTable:[...r.querySelectorAll('[data-state-after]')].map(n=>n.textContent).join(' | ')}})()`);
    record(`S19-SEARCH-UPDATE-EVIDENCE-${lang}`, /→/.test(evidence.update ?? "") && /predecessor/i.test(evidence.update ?? "") && (evidence.description?.includes(lang === "vi" ? "Cạnh ứng viên" : "Candidate edge")) && /predecessor=/.test(evidence.stateTable ?? ""), "Edge step exposes before→after score/predecessor, dynamic SVG description and complete state digest", evidence);
  }
  if (lesson.kind === "astar-search") {
    await click(cdp, `${root} [data-s19-reset]`);
    const state = await controlState(cdp, root); await jump(cdp, root, state.count - 1);
    const table = await evaluate(cdp, `(()=>{const t=document.querySelector(${JSON.stringify(root)}).querySelector('[data-astar-comparison-table]');return{caption:t?.caption?.innerText,headers:[...(t?.querySelectorAll('thead th')??[])].map(n=>n.innerText),rows:[...(t?.querySelectorAll('tbody tr')??[])].map(row=>[...row.cells].map(cell=>cell.innerText))}})()`);
    record(`S19-ASTAR-COMPARISON-TABLE-${lang}`, Boolean(table.caption) && table.headers.join('|').includes('A*') && table.headers.join('|').includes('Dijkstra') && table.rows.length >= 4 && table.rows.every(row => row.length === 3 && row[0]), "A* comparison has a captioned semantic position/A*/Dijkstra table equivalent to the visual order lists", table);
  }
  if (lesson.kind === "learning-categories") {
    const fallback = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),d=r.querySelector('[data-state-fallback]');d.open=true;const text=d.innerText;return{headers:[...d.querySelectorAll('th')].map(n=>n.innerText),text,rows:d.querySelectorAll('tbody tr').length}})()`);
    record(`S19-LEARNING-FALLBACK-${lang}`, fallback.rows === 4 && fallback.text.includes(lang === "vi" ? "Loại phản hồi" : "Feedback type") && fallback.text.includes(lang === "vi" ? "Đáp án tham chiếu" : "Reference answer") && fallback.text.includes(lang === "vi" ? "Vì sao phương án gần đúng sai" : "Why the near miss is wrong"), "Learning fallback includes feedback type, localized near-miss reason and labelled reference answer", fallback);
  }
  if (lesson.kind === "neural-network") {
    await selectValue(cdp, `${root} [data-s19-scenario]`, "shallow-standard");
    let state = await controlState(cdp, root); await jump(cdp, root, state.count - 1);
    const shallow = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{connections:r.querySelectorAll('[data-connection-id]').length,nodes:r.querySelectorAll('[data-neural-node]').length,text:r.innerText}})()`);
    await selectValue(cdp, `${root} [data-s19-scenario]`, "deep-standard");
    state = await controlState(cdp, root); await jump(cdp, root, state.count - 1);
    const deep = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{connections:r.querySelectorAll('[data-connection-id]').length,nodes:r.querySelectorAll('[data-neural-node]').length,text:r.innerText}})()`);
    record(`S19-NEURAL-MATH-${lang}`, shallow.connections === 2 && shallow.nodes === 1 && deep.connections === 7 && deep.nodes === 4 && deep.text.includes("w =") && deep.text.includes("ReLU") && deep.text.includes(lang === "vi" ? "trọng số không đổi" : "weights unchanged"), "Shallow/deep visuals expose actual weights, per-node products/sums/activations and fixed inference weights", { shallow, deep });
  }
  if (lesson.kind === "backpropagation") {
    await click(cdp, `${root} [data-s19-reset]`);
    await jump(cdp, root, 0); const first = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    await jump(cdp, root, 1); const prediction = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    await jump(cdp, root, 3); const error = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    await jump(cdp, root, 6); const rerun = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    record(`S19-BACKPROP-STAGING-${lang}`, !first.includes("ŷ 0.4") && !first.includes("error 0.6") && !first.includes("error² 0.36") && prediction.includes("ŷ 0.4") && !prediction.includes("error 0.6") && error.includes("error 0.6") && error.includes("error² 0.36") && rerun.includes("ŷ 0.64") && !rerun.includes("error² 0.1296"), "Backprop display reveals prediction, error and squared error only at corresponding stages", { first, prediction, error, rerun });
    await jump(cdp, root, 7);
    const flow = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),rail=r.querySelector('[data-direction]'),fallback=r.querySelector('[data-backprop-fallback]');fallback.open=true;return{iteration:r.querySelector('[data-training-iteration]')?.dataset.trainingIteration,direction:rail?.dataset.direction,forward:rail?.querySelector('[data-flow="forward"]')?.innerText,backward:rail?.querySelector('[data-flow="backward"]')?.innerText,beforeAfter:r.querySelector('[data-backprop-before-after]')?.innerText,fallback:fallback.innerText,rows:fallback.querySelectorAll('[data-backprop-step]').length}})()`);
    const finalStateText = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    record(`S19-BACKPROP-DIRECTION-ITERATION-${lang}`, flow.iteration === "2" && flow.direction === "compare" && flow.forward?.includes("→") && flow.backward?.includes("←") && flow.rows === 8 && /error1/.test(flow.fallback) && /error2/.test(flow.fallback) && finalStateText.includes("error 0.6") && finalStateText.includes("error 0.36") && finalStateText.includes("error² 0.36") && finalStateText.includes("error² 0.1296"), "Backprop renders iteration 1→2, forward signal, backward output-to-weight correction, and raw/squared errors in full fallback", { flow, finalStateText });
  }
  if (lesson.kind === "regression") {
    await click(cdp, `${root} [data-s19-reset]`);
    await jump(cdp, root, 0); const inspect = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    await jump(cdp, root, 1); const fit = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    await jump(cdp, root, 2); const predict = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-state]').innerText`);
    const comparison = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{cards:r.querySelectorAll('[data-regression-comparison] [data-model]').length,fallback:Boolean(r.querySelector('[data-regression-comparison-fallback]')),residuals:r.querySelectorAll('[data-residual-id]').length,desc:r.querySelector('svg desc')?.textContent,regions:r.querySelectorAll('svg [data-regression-region]').length,text:r.querySelector('[data-regression-comparison]')?.innerText}})()`);
    record(`S19-REGRESSION-STAGING-${lang}`, !inspect.includes("y = 2.2x") && !inspect.includes("ŷ 8.2") && fit.includes("y = 2.2x + 0.5") && fit.includes("1.8") && !fit.includes("ŷ 8.2") && predict.includes("ŷ 8.2"), "Regression inspect/fit/predict stages avoid false transitions", { inspect, fit, predict });
    const comparisonText = comparison.text?.toLocaleLowerCase(lang === "vi" ? "vi" : "en") ?? "";
    record(`S19-REGRESSION-COMPARISON-${lang}`, comparison.cards === 2 && comparison.fallback && comparison.residuals === 4 && comparison.regions === 3 && comparisonText.includes(lang === "vi" ? "mô hình phân loại riêng" : "separate classifier") && comparisonText.includes(lang === "vi" ? "không tạo nhãn này" : "does not produce this label") && /residual|phần dư/i.test(comparison.desc ?? "") && /training|huấn luyện/i.test(comparison.desc ?? ""), "Regression includes residual/range narration and an explicit separate-classifier contrast in visual and fallback", comparison);
    const baselineEquation = fit.match(/y = ([^\n]+)/)?.[1];
    await selectValue(cdp, `${root} [data-regression-preset-control] select`, "moved"); await jump(cdp, root, 1);
    const movedFit = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),details=[...r.querySelectorAll('[data-state-fallback]')].find(node=>node.querySelector('[data-point-state="changed"]'));if(details)details.open=true;return{text:r.querySelector('[data-s19-state]').innerText,changed:r.querySelector('[data-changed-point-id]')?.dataset.changedPointId,summary:r.querySelector('[data-regression-fit-change]')?.innerText,table:r.querySelector('table [data-point-state="changed"]')?.textContent,residualLabels:[...r.querySelectorAll('[data-residual-id] text')].map(n=>n.textContent)}})()`);
    await selectValue(cdp, `${root} [data-regression-preset-control] select`, "added"); await jump(cdp, root, 1);
    const added = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),details=[...r.querySelectorAll('[data-state-fallback]')].find(node=>node.querySelector('[data-point-state="changed"]'));if(details)details.open=true;return{text:r.querySelector('[data-s19-state]').innerText,points:r.querySelectorAll('[data-point-id^="p"]').length,residuals:r.querySelectorAll('[data-residual-id]').length,changed:r.querySelector('[data-changed-point-id]')?.dataset.changedPointId,summary:r.querySelector('[data-regression-fit-change]')?.innerText,table:r.querySelector('table [data-point-state="changed"]')?.textContent,residualLabels:[...r.querySelectorAll('[data-residual-id] text')].map(n=>n.textContent)}})()`);
    record(`S19-REGRESSION-POINT-CONTROLS-${lang}`, movedFit.text.includes("y=1.6x+1.5") && movedFit.changed === "P4" && /4,10/.test(movedFit.table ?? "") && movedFit.summary?.includes("SSE") && movedFit.residualLabels.length === 4 && added.points === 5 && added.residuals === 5 && added.changed === "P5" && /newly added|mới được thêm/i.test(added.table ?? "") && added.summary?.includes("SSE") && added.residualLabels.length === 5, "Controlled move/add presets visibly mark the changed point, before→after fit, table state and residual labels", { baselineEquation, movedFit, added });
    const inputSelector = `${root} input[type="number"]`;
    await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(inputSelector)}),set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(n,'-2');n.dispatchEvent(new Event('input',{bubbles:true}))})()`); await delay(100);
    const clamped = await evaluate(cdp, `document.querySelector(${JSON.stringify(inputSelector)}).value`);
    record(`S19-REGRESSION-INPUT-CLAMP-${lang}`, clamped === "0", "Editable regression input clamps to the SVG domain [0,7]", { clamped });
    await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(inputSelector)}),set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(n,'6.5');n.dispatchEvent(new Event('input',{bubbles:true}))})()`); await delay(100);
    const customScenario = await evaluate(cdp, `(()=>{const s=document.querySelector(${JSON.stringify(root)}).querySelector('[data-s19-scenario]');return{value:s.value,label:s.options[s.selectedIndex]?.textContent,input:document.querySelector(${JSON.stringify(inputSelector)}).value}})()`);
    record(`S19-REGRESSION-CUSTOM-X-${lang}`, customScenario.value === "custom" && customScenario.input === "6.5" && customScenario.label?.includes("6.5"), "Editable x keeps the scenario selector accurate through a localized custom option", customScenario);
  }
}

async function fallbackCheck(cdp, lesson, lang, root) {
  const initial = await controlState(cdp, root);
  const actual = await evaluate(cdp, `(()=>{
    const r=document.querySelector(${JSON.stringify(root)}),details=[...r.querySelectorAll('[data-state-fallback]')].find(node=>node.querySelector('[data-state-before]')&&node.querySelector('[data-state-after]'));if(!details)throw Error('Missing equivalent before/after state fallback');details.open=true;
    const rows=[...details.querySelectorAll('[data-fallback-step]')];
    return{rows:rows.length,selected:rows.filter(row=>row.getAttribute('aria-current')==='step').length,complete:rows.every(row=>row.querySelector('[data-state-before]')?.innerText.trim()&&row.querySelector('[data-state-after]')?.innerText.trim()),table:Boolean(details.querySelector('table'))};
  })()`);
  record(`S19-FALLBACK-${lesson.slug}-${lang}`, actual.rows === initial.count && actual.selected === 1 && actual.complete && actual.table, "Text/table fallback mirrors every state with before and after values", { initial, ...actual });
  await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),details=[...r.querySelectorAll('[data-state-fallback]')].find(node=>node.querySelector('[data-state-before]')&&node.querySelector('[data-state-after]'));details.open=false})()`);
}

async function checkpointMatrix(cdp, lesson, lang) {
  const checkpoints = await evaluate(cdp, `[...document.querySelectorAll('[data-checkpoint-id]')].map(root=>({id:root.dataset.checkpointId,choices:[...root.querySelectorAll('input[type=radio]')].map(input=>input.value)}))`);
  record(`S19-CHECKPOINT-COUNT-${lesson.slug}-${lang}`, checkpoints.length >= 5, "Lesson contains the required practice progression", { count: checkpoints.length });
  for (const checkpoint of checkpoints) {
    for (const choice of checkpoint.choices) {
      const root = `[data-checkpoint-id="${checkpoint.id}"]`;
      await click(cdp, `${root} input[value="${choice}"]`);
      await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),button=[...r.querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(lang === "vi" ? "Kiểm tra câu trả lời" : "Check answer")});if(!button)throw Error('Missing checkpoint button');button.click()})()`);
      await delay(25);
      const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),feedback=r.querySelector('[data-correct]');return{selected:r.querySelector('input:checked')?.value,correct:feedback?.dataset.correct,text:feedback?.innerText??''}})()`);
      record(`S19-CHECKPOINT-${lesson.slug}-${lang}-${checkpoint.id}-${choice}`, actual.selected === choice && ["true", "false"].includes(actual.correct) && actual.text.length > 8, "Every choice returns explicit localized correctness feedback", actual);
    }
    const root = `[data-checkpoint-id="${checkpoint.id}"]`;
    await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),button=[...r.querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(lang === "vi" ? "Xem giải thích" : "Show explanation")});if(!button)throw Error('Missing explanation button');button.click()})()`);
    await delay(25);
    const textLength = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).innerText.length`);
    record(`S19-EXPLANATION-${lesson.slug}-${lang}-${checkpoint.id}`, textLength > 100, "Explanation disclosure renders substantive localized guidance", { textLength });
  }
}

async function layoutMatrix(cdp, lesson, lang, root) {
  for (const width of VIEWPORTS) {
    await viewport(cdp, width);
    const actual = await evaluate(cdp, `(()=>{
      const r=document.querySelector(${JSON.stringify(root)}),bad=[...document.querySelectorAll('button,select,input,[tabindex]')].filter(n=>n.getClientRects().length&&!n.closest('details:not([open])')).map(n=>{const b=n.getBoundingClientRect();return{tag:n.tagName,left:b.left,right:b.right,text:(n.innerText||n.value||'').slice(0,60)}}).filter(n=>n.left<-.5||n.right>innerWidth+1);
      const rb=r.getBoundingClientRect();return{width:innerWidth,documentWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,rootLeft:rb.left,rootRight:rb.right,bad};
    })()`);
    record(`S19-LAYOUT-${lesson.slug}-${lang}-${width}`, actual.documentWidth <= actual.clientWidth + 1 && actual.rootLeft >= -0.5 && actual.rootRight <= actual.width + 1 && actual.bad.length === 0, "Page and visible controls have no horizontal overflow", actual);
    captures.push({ type: "layout", slug: lesson.slug, lang, ...actual });
  }
}

async function themeMotionAndAxe(cdp, lesson, lang, root) {
  await viewport(cdp, 320);
  await evaluate(cdp, "document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')");
  await delay(350);
  await runAxe(cdp, `S19-AXE-LIGHT-${lesson.slug}-${lang}`, "light");

  await viewport(cdp, 768);
  await evaluate(cdp, `document.documentElement.classList.remove('light');document.documentElement.classList.add('dark');document.querySelector(${JSON.stringify(root)}).scrollIntoView({block:'center',behavior:'instant'})`);
  await delay(350);
  const dark = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),s=getComputedStyle(r);return{dark:document.documentElement.classList.contains('dark'),color:s.color,background:s.backgroundColor}})()`);
  record(`S19-DARK-${lesson.slug}-${lang}`, dark.dark && dark.color !== dark.background, "Dark theme applies distinguishable foreground and background styles", dark);
  await runAxe(cdp, `S19-AXE-DARK-${lesson.slug}-${lang}`, "dark");

  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const motion = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),seconds=value=>Math.max(...value.split(',').map(item=>item.trim().endsWith('ms')?parseFloat(item)/1000:parseFloat(item)||0));return{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,animated:[...r.querySelectorAll('*')].filter(node=>seconds(getComputedStyle(node).transitionDuration)>.001||seconds(getComputedStyle(node).animationDuration)>.001).length}})()`);
  record(`S19-MOTION-${lesson.slug}-${lang}`, motion.reduced && motion.animated === 0, "Reduced-motion removes visual transitions and animations", motion);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await evaluate(cdp, "document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')");
}

async function regressionPage(cdp, id, route, selector = "main") {
  await viewport(cdp, 1440);
  await navigate(cdp, route, selector);
  const actual = await evaluate(cdp, `(()=>{const main=document.querySelector('main'),text=main?.innerText??document.body.innerText;return{title:document.querySelector('h1')?.innerText??document.title,textLength:text.length,applicationError:/application error|could not be found|404 -/i.test(text)}})()`);
  record(`S19-REGRESSION-${id}`, Boolean(actual.title) && actual.textLength > 100 && !actual.applicationError, "Protected route renders substantive content without an application or 404 error", actual);
}

async function runRegressions(cdp) {
  for (const lang of LOCALES) {
    await regressionPage(cdp, `PAPER3-MAP-${lang}`, `/paper-3?lang=${lang}`, "[data-paper3-map]");
    await click(cdp, '[data-paper3-map] button[data-section-id="19"]');
    const map = await evaluate(cdp, `(()=>{const d=document.querySelector('#paper3-section-detail'),link=d.querySelector(${JSON.stringify(`a[href="/paper-3/sections/19?lang=${lang}"]`)});return{heading:d.querySelector('#paper3-selected-title')?.innerText,href:link?.getAttribute('href'),text:link?.innerText,selected:document.querySelector('[data-paper3-map] button[data-section-id="19"]')?.getAttribute('aria-pressed')}})()`);
    record(`S19-REGRESSION-MAP-SECTION19-${lang}`, map.selected === "true" && map.href === `/paper-3/sections/19?lang=${lang}` && map.text?.includes("13"), "Study Map selects Section 19 and exposes thirteen topics", map);

    await regressionPage(cdp, `SECTION19-OVERVIEW-${lang}`, `/paper-3/sections/19?lang=${lang}`, '[data-section-id="19"]');
    const section19 = await evaluate(cdp, `(()=>{const rows=[...document.querySelectorAll('[data-topic-id^="P3-19."]')].map(n=>({id:n.dataset.topicId,href:n.getAttribute('href'),text:n.innerText}));return{rows,allAvailable:rows.length===13&&rows.every(n=>n.href?.includes('/paper-3/topics/')&&n.text.includes(${JSON.stringify(lang === "vi" ? "Mở bài học và minh họa" : "Open lesson and visual")}))}})()`);
    record(`S19-REGRESSION-SECTION19-AVAILABLE-${lang}`, section19.allAvailable, "Section 19 overview exposes exactly thirteen promoted lessons", section19);

    for (const section of ["13", "14", "15", "16", "17", "18"]) {
      await regressionPage(cdp, `SECTION${section}-${lang}`, `/paper-3/sections/${section}?lang=${lang}`, `[data-section-id="${section}"]`);
    }
  }

  await regressionPage(cdp, "SECTION14-TCP", "/paper-3/topics/tcp-ip-stack-and-message-journey?lang=en", '[data-visual-kind="tcp-ip-stack"]');
  const tcpBefore = await evaluate(cdp, `document.querySelector('[data-visual-kind="tcp-ip-stack"]').dataset.visualStep`);
  await click(cdp, '[data-visual-kind="tcp-ip-stack"] [data-network-next]');
  const tcpAfter = await evaluate(cdp, `document.querySelector('[data-visual-kind="tcp-ip-stack"]').dataset.visualStep`);
  record("S19-REGRESSION-SECTION14-CONTROL", tcpAfter !== tcpBefore, "Section 14 network control still advances", { tcpBefore, tcpAfter });

  await regressionPage(cdp, "SECTION15-LESSON", "/paper-3/topics/risc-and-cisc?lang=en", '[data-hardware-scale-workbench="risc-cisc"]');
  const section15Before = await evaluate(cdp, `document.querySelector('[data-hardware-scale-workbench="risc-cisc"] [data-hardware-jump]').value`);
  await click(cdp, '[data-hardware-scale-workbench="risc-cisc"] [data-hardware-next]');
  const section15After = await evaluate(cdp, `document.querySelector('[data-hardware-scale-workbench="risc-cisc"] [data-hardware-jump]').value`);
  record("S19-REGRESSION-SECTION15-CONTROL", section15After !== section15Before, "Section 15 shared controls still advance", { section15Before, section15After });

  await regressionPage(cdp, "SECTION16-LESSON", "/paper-3/topics/resources-processes-and-states?lang=vi", '[data-section16-workbench="process-states"]');
  const section16Before = await evaluate(cdp, `document.querySelector('[data-section16-workbench="process-states"] [data-hardware-jump]').value`);
  await click(cdp, '[data-section16-workbench="process-states"] [data-hardware-next]');
  const section16After = await evaluate(cdp, `document.querySelector('[data-section16-workbench="process-states"] [data-hardware-jump]').value`);
  record("S19-REGRESSION-SECTION16-CONTROL", section16After !== section16Before, "Section 16 shared controls still advance", { section16Before, section16After });

  await regressionPage(cdp, "SECTION17-LESSON", "/paper-3/topics/confidentiality-and-key-choice?lang=en", '[data-visual-kind="key-ownership"]');
  const section17Before = await evaluate(cdp, `document.querySelector('[data-visual-kind="key-ownership"] [data-hardware-jump]').value`);
  await click(cdp, '[data-visual-kind="key-ownership"] [data-hardware-next]');
  const section17After = await evaluate(cdp, `document.querySelector('[data-visual-kind="key-ownership"] [data-hardware-jump]').value`);
  record("S19-REGRESSION-SECTION17-CONTROL", section17After !== section17Before, "Section 17 shared controls still advance", { section17Before, section17After });

  await regressionPage(cdp, "PAPER4-EN", "/paper-4?lang=en");
  await regressionPage(cdp, "PAPER4-VI", "/paper-4?lang=vi");
  await regressionPage(cdp, "DOCS", "/docs");
  await regressionPage(cdp, "DESIGN-SYSTEM", "/paper-4/design-system");
}

async function historyChecks(cdp) {
  const first = lessons[0], firstRoot = `[data-visual-kind="${first.kind}"]`;
  await viewport(cdp, 1440);
  await navigate(cdp, `/paper-3/topics/${first.slug}?lang=en&qa=section19-history#observe`, firstRoot);
  await click(cdp, `${firstRoot} [data-s19-next]`);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(cdp, `document.readyState==='complete'&&document.querySelector(${JSON.stringify(firstRoot)})`, "Section 19 deep-link reload");
  const reload = await evaluate(cdp, `({hash:location.hash,qa:new URLSearchParams(location.search).get('qa'),lang:document.documentElement.lang})`);
  record("S19-DEEP-LINK-RELOAD", reload.hash === "#observe" && reload.qa === "section19-history" && reload.lang === "en", "Deep link, query and locale survive reload", reload);

  const second = lessons[1], secondRoot = `[data-visual-kind="${second.kind}"]`;
  await navigate(cdp, `/paper-3/topics/${second.slug}?lang=vi&qa=section19-history#observe`, secondRoot);
  await evaluate(cdp, "history.back()");
  await waitFor(cdp, `location.pathname.endsWith(${JSON.stringify(`/topics/${first.slug}`)})&&document.querySelector(${JSON.stringify(firstRoot)})`, "history back");
  record("S19-HISTORY-BACK", await evaluate(cdp, `document.documentElement.lang==='en'&&location.hash==='#observe'`), "Back restores the first localized deep link");
  await evaluate(cdp, "history.forward()");
  await waitFor(cdp, `location.pathname.endsWith(${JSON.stringify(`/topics/${second.slug}`)})&&document.querySelector(${JSON.stringify(secondRoot)})`, "history forward");
  record("S19-HISTORY-FORWARD", await evaluate(cdp, `document.documentElement.lang==='vi'&&location.hash==='#observe'`), "Forward restores the second localized deep link");
}

async function runLessonMatrix(cdp) {
  for (const lesson of lessons) for (const lang of LOCALES) {
    const root = `[data-visual-kind="${lesson.kind}"]`;
    const route = `/paper-3/topics/${lesson.slug}?lang=${lang}&qa=section19#observe`;
    try {
      await viewport(cdp, 1440);
      await navigate(cdp, route, root);
      await lessonShell(cdp, lesson, lang, root);
      await visualSemantics(cdp, lesson, lang, root);
      await exerciseControls(cdp, lesson, lang, root);
      await exerciseScenarios(cdp, lesson, lang, root);
      await fallbackCheck(cdp, lesson, lang, root);
      await checkpointMatrix(cdp, lesson, lang);
      await layoutMatrix(cdp, lesson, lang, root);
      await themeMotionAndAxe(cdp, lesson, lang, root);
    } catch (error) {
      record(`S19-LESSON-INCOMPLETE-${lesson.slug}-${lang}`, false, "Lesson browser matrix did not complete", { error: error.stack ?? String(error) });
    }
  }
  await historyChecks(cdp);
  await runRegressions(cdp);
}

await mkdir(EVIDENCE_DIR, { recursive: true });
let profile;
let chrome;
let cdp;
let browser = null;
let buildId = null;
let binding = {};
let authoringBefore = {};
let snapshotBefore = {};

try {
  authoringBefore = await hashFiles(AUTHORING_ROOT);
  snapshotBefore = await hashFiles(ROOT);
  const comparable = section19CandidateFiles.filter(relative => relative !== "content/paper3/lesson-status.json");
  const sourceMatches = comparable.every(relative => authoringBefore[relative] === snapshotBefore[relative]);
  buildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim();
  const isolatedPreview = ROOT !== AUTHORING_ROOT;
  const pageResponse = await fetch(`${BASE_URL}/paper-3?lang=en`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  const servedHtml = await pageResponse.text();
  const manifestResponse = await fetch(`${BASE_URL}/_next/static/${encodeURIComponent(buildId)}/_buildManifest.js`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  binding = {
    sourceMatches,
    comparedAuthoringFiles: comparable,
    excludedPromotionMetadata: ["content/paper3/lesson-status.json"],
    buildId,
    expectedBuildId: EXPECTED_BUILD_ID,
    exactBuildId: Boolean(EXPECTED_BUILD_ID) && buildId === EXPECTED_BUILD_ID,
    servedBuildMarker: servedHtml.includes(buildId),
    servedBuildManifest: manifestResponse.ok,
    pageStatus: pageResponse.status,
    isolatedPreview,
  };
  record("S19-BINDING-START", sourceMatches && binding.exactBuildId && binding.servedBuildMarker && binding.servedBuildManifest && isolatedPreview, "Browser QA is bound to the exact named isolated candidate before execution", binding);

  const chromePath = await findChrome();
  const debugPort = await freePort();
  profile = await mkdtemp(path.join(os.tmpdir(), "algocore-section19-"));
  chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "--window-size=1440,1000",
    "about:blank",
  ], { windowsHide: true, stdio: "ignore" });

  let version;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) { version = await response.json(); break; }
    } catch { /* owned browser is still starting */ }
    await delay(100);
  }
  if (!version) throw new Error("Owned Chrome or Edge DevTools endpoint did not start");
  browser = version.Browser;
  const tab = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
  cdp = new Cdp(tab.webSocketDebuggerUrl);
  await cdp.open();
  cdp.on("Runtime.consoleAPICalled", event => {
    if (event.type === "error") consoleErrors.push(event.args.map(argument => argument.value ?? argument.description ?? "").join(" "));
  });
  cdp.on("Runtime.exceptionThrown", event => runtimeErrors.push(event.exceptionDetails));
  await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Accessibility.enable")]);
  await runLessonMatrix(cdp);

  const authoringAfter = await hashFiles(AUTHORING_ROOT);
  const snapshotAfter = await hashFiles(ROOT);
  const stable = section19CandidateFiles.every(relative => authoringAfter[relative] === authoringBefore[relative] && snapshotAfter[relative] === snapshotBefore[relative]);
  const endingBuildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim();
  record("S19-BINDING-END", stable && endingBuildId === buildId, "Candidate sources and BUILD_ID remain byte-stable through browser execution", { stable, buildId, endingBuildId });
  record("S19-CONSOLE", consoleErrors.length === 0 && runtimeErrors.length === 0, "No console errors or runtime exceptions were observed", { consoleErrors, runtimeErrors });
} catch (error) {
  record("S19-INCOMPLETE", false, "Browser gate did not complete", { error: error.stack ?? String(error), consoleErrors, runtimeErrors });
} finally {
  cdp?.close();
  if (chrome && chrome.exitCode === null) {
    chrome.kill();
    await Promise.race([new Promise(resolve => chrome.once("exit", resolve)), delay(1500)]);
  }
  if (profile) {
    const resolved = path.resolve(profile);
    const relative = path.relative(path.resolve(os.tmpdir()), resolved);
    if (relative && !relative.startsWith("..") && !path.isAbsolute(relative) && path.basename(resolved).startsWith("algocore-section19-")) {
      try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* browser crashpad cleanup can lag */ }
    }
  }
}

const failures = checks.filter(check => !check.pass);
const decision = failures.length ? "FAIL" : "PASS";
const regressionChecks = checks.filter(check => check.id.startsWith("S19-REGRESSION-")).length;
const coverage = {
  lessons: lessons.length,
  locales: LOCALES.length,
  viewports: [...VIEWPORTS],
  scenarioFamilies: lessons.length,
  scenariosExecuted: checks.filter(check => check.id.startsWith("S19-SCENARIO-") && !check.id.includes("COUNT") && !check.id.includes("KEYBOARD")).length,
  semanticStatesCaptured: captures.filter(capture => capture.type === "scenarios").reduce((sum, capture) => sum + capture.scenarios.reduce((scenarioSum, scenario) => scenarioSum + scenario.states.length, 0), 0),
  checkpoints: checks.filter(check => check.id.startsWith("S19-CHECKPOINT-") && !check.id.includes("COUNT")).length,
  axeRuns: checks.filter(check => check.id.startsWith("S19-AXE-")).length,
  regressionChecks,
  regressionSurfaces: ["Paper 3 Study Map", "Section 19 overview", "Section 19 graph/ADT handoff", "Sections 14-17", "Paper 4", "/docs", "shared design system"],
};
const report = {
  schemaVersion: 1,
  gate: "paper3-section19-independent-browser",
  startedAt,
  completedAt: new Date().toISOString(),
  decision,
  buildId,
  baseUrl: BASE_URL,
  previewRoot: ROOT,
  isolatedPreview: ROOT !== AUTHORING_ROOT,
  binding,
  browser,
  checksRun: checks.length,
  checksPassed: checks.length - failures.length,
  failures,
  coverage,
  consoleErrors,
  runtimeErrors,
  candidateHashes: snapshotBefore,
  limitations: decision === "PASS" ? ["Deterministic syllabus fixtures and local rendered routes were tested; this is not validation of a production AI system or student user acceptance."] : ["One or more executed browser checks failed; no promotion claim is made."],
  checks,
};
const states = {
  schemaVersion: 1,
  gate: "paper3-section19-browser-states",
  startedAt,
  completedAt: new Date().toISOString(),
  decision,
  buildId,
  baseUrl: BASE_URL,
  previewRoot: ROOT,
  isolatedPreview: ROOT !== AUTHORING_ROOT,
  coverage,
  captures,
};
await writeFile(path.join(EVIDENCE_DIR, "QA_BROWSER_STATES.json"), `${JSON.stringify(states, null, 2)}\n`);
await writeFile(path.join(EVIDENCE_DIR, "QA_BROWSER_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined, candidateHashes: undefined }, null, 2));
if (decision !== "PASS") process.exitCode = 1;

