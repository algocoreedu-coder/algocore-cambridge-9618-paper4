import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAPER4_PLANNING_ROOT = process.env.PAPER4_PLANNING_ROOT
  ? path.resolve(process.env.PAPER4_PLANNING_ROOT)
  : path.resolve(ROOT, "../planning/paper4");
try { process.loadEnvFile(path.join(ROOT, ".env.local")); } catch { /* CI may inject credentials. */ }
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const ROUTE = "/paper-4/lessons/binary-search";
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
const EVIDENCE_DIR = path.join(PAPER4_PLANNING_ROOT, "student-friendly-audit/learner-gate-evidence");
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const checks = [];
const failures = [];
function record(gate, passed, message, evidence = {}) {
  const check = { gate, passed: Boolean(passed), message, evidence };
  checks.push(check);
  if (!check.passed) failures.push(check);
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try { await access(candidate); return candidate; } catch { /* try next */ }
  }
  throw new Error("No local Chrome/Edge executable is available for browser QA.");
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed");
  return result.result.value;
}

async function waitFor(cdp, expression, label, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(cdp, `Boolean(${expression})`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function navigate(cdp, url, readyExpression = `document.querySelector('[data-learner-journey="six-stage"]')`) {
  await cdp.send("Page.navigate", { url });
  await waitFor(cdp, `document.readyState === "complete" && ${readyExpression}`, url);
  await delay(150);
}

async function authenticate(cdp) {
  if (!username || !password) throw new Error("Paper 4 browser gate requires student credentials.");
  await navigate(cdp, `${BASE_URL}/login?lang=en`, `document.querySelector('#student-password')`);
  const result = await evaluate(cdp, `(async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: ${JSON.stringify(username)}, password: ${JSON.stringify(password)}, next: ${JSON.stringify(`${ROUTE}?lang=en`)}, lang: 'en' }),
    });
    return { status: response.status, body: await response.json().catch(() => null) };
  })()`);
  if (result.status !== 200) throw new Error(`Student login failed with HTTP ${result.status}.`);
}

async function setViewport(cdp, width, height, deviceScaleFactor = 1) {
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor, mobile: false, screenWidth: width, screenHeight: height });
}

async function screenshot(cdp, filename) {
  const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true });
  await writeFile(path.join(EVIDENCE_DIR, filename), Buffer.from(shot.data, "base64"));
}

async function press(cdp, key) {
  const keys = {
    Tab: { code: "Tab", keyCode: 9, value: "Tab", text: "" },
    Enter: { code: "Enter", keyCode: 13, value: "Enter", text: "\r" },
    Space: { code: "Space", keyCode: 32, value: " ", text: " " },
  };
  const item = keys[key] ?? { code: key, keyCode: 0, value: key, text: "" };
  await cdp.send("Input.dispatchKeyEvent", { type: key === "Tab" ? "rawKeyDown" : "keyDown", key: item.value, code: item.code, text: item.text, unmodifiedText: item.text, windowsVirtualKeyCode: item.keyCode, nativeVirtualKeyCode: item.keyCode });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: item.value, code: item.code, windowsVirtualKeyCode: item.keyCode, nativeVirtualKeyCode: item.keyCode });
  await delay(80);
}

async function clickSelector(cdp, selector) {
  const clicked = await evaluate(cdp, `(() => { const element=document.querySelector(${JSON.stringify(selector)}); if (!element) return false; element.scrollIntoView({block:'center',inline:'center'}); element.focus(); element.click(); return true; })()`);
  if (!clicked) throw new Error(`Click target not found: ${selector}`);
  await delay(100);
}

async function clearProgress(cdp) {
  await evaluate(cdp, `sessionStorage.clear(); localStorage.clear(); true`);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(cdp, `document.readyState === "complete" && document.querySelector('[data-learner-journey="six-stage"]')`, "fresh learner journey");
}

async function moveToTrace(cdp) {
  for (const expected of ["understand", "trace"]) {
    await evaluate(cdp, `document.querySelector('[data-learner-stage][data-stage-state="current"] [data-exit-gate="open"]').focus(); true`);
    await press(cdp, "Enter");
    await waitFor(cdp, `document.querySelector('[data-learner-stage="${expected}"][data-stage-state="current"]')`, `stage ${expected}`);
    const focus = await evaluate(cdp, `document.activeElement?.id ?? ""`);
    record("LG-B03", focus === `stage-${expected}-title`, `Stage change moves focus to ${expected} heading`, { observed_focus: focus });
  }
  await waitFor(cdp, `document.querySelector('[data-scene="binary-search-window"]')`, "hydrated Binary Search scene");
}

async function submitPredictionWithKeyboard(cdp) {
  await evaluate(cdp, `document.querySelector('[data-learner-stage="trace"] input[type="radio"]')?.focus(); true`);
  await press(cdp, "Space");
  const checked = await evaluate(cdp, `Boolean(document.querySelector('[data-learner-stage="trace"] input[type="radio"]:checked'))`);
  record("LG-B03", checked, "Prediction choice can be selected with keyboard");
  await evaluate(cdp, `document.querySelector('[data-learner-stage="trace"] form button[type="submit"]')?.focus(); true`);
  await press(cdp, "Enter");
  await waitFor(cdp, `document.querySelector('[data-scene="binary-search-window"]')?.getAttribute('data-phase') === "revealed"`, "prediction reveal");
}

const chromePath = await findChrome();
const debugPort = await freePort();
const profile = await mkdtemp(path.join(os.tmpdir(), "paper4-learner-gate-"));
await mkdir(EVIDENCE_DIR, { recursive: true });
const chrome = spawn(chromePath, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--window-size=1280,800", "about:blank",
], { windowsHide: true, stdio: "ignore" });

let cdp;
try {
  let version;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); if (response.ok) { version = await response.json(); break; } } catch { /* Chrome is starting. */ }
    await delay(100);
  }
  if (!version) throw new Error("Chrome DevTools endpoint did not start.");
  const pageResponse = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  const page = await pageResponse.json();
  cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.open();
  await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Accessibility.enable")]);
  await authenticate(cdp);

  await setViewport(cdp, 320, 900, 1);
  await navigate(cdp, `${BASE_URL}${ROUTE}?lang=en`);
  await clearProgress(cdp);
  const mobile = await evaluate(cdp, `(() => {
    const visible = (element) => element.getClientRects().length > 0;
    const root = document.querySelector('[data-learner-journey="six-stage"]');
    const buttons = [...root.querySelectorAll('button')].filter(visible).map((button) => { const rect = button.getBoundingClientRect(); return { text: button.textContent.trim(), width: rect.width, height: rect.height, disabled: button.disabled }; });
    const clipped = [...root.querySelectorAll('*')].filter(visible).filter((element) => { const style = getComputedStyle(element); const box = element.getBoundingClientRect(); const intentionallyVisuallyHidden = box.width <= 1 && box.height <= 1; return !intentionallyVisuallyHidden && /(hidden|clip)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1; }).map((element) => element.tagName + '.' + element.className).slice(0, 20);
    const stageNav = root.querySelector('nav'); const navStyle = getComputedStyle(stageNav);
    const compactSummary = stageNav?.querySelector('details > summary');
    return { viewport: innerWidth, documentScrollWidth: document.documentElement.scrollWidth, documentClientWidth: document.documentElement.clientWidth, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, undersized: buttons.filter((item) => item.width < 44 || item.height < 44), clipped, stageNavLocalScroll: stageNav.scrollWidth > stageNav.clientWidth && /(auto|scroll)/.test(navStyle.overflowX), compactStageNavigation: Boolean(compactSummary && visible(compactSummary)), current: root.querySelector('[data-learner-stage][data-stage-state="current"]')?.getAttribute('data-learner-stage') };
  })()`);
  record("LG-B01", mobile.viewport === 320 && !mobile.overflow, "320 px page has no horizontal document overflow", mobile);
  record("LG-B01", mobile.compactStageNavigation && !mobile.stageNavLocalScroll, "Stage navigation uses the compact labelled control at 320 px", { compact: mobile.compactStageNavigation, local_scroll: mobile.stageNavLocalScroll });
  record("LG-B01", mobile.undersized.length === 0, "Visible mobile controls meet the 44×44 CSS px touch target", { undersized: mobile.undersized });
  record("LG-B01", mobile.clipped.length === 0, "Visible learner content is not clipped at 320 px", { clipped: mobile.clipped });
  await screenshot(cdp, "binary-search-en-320px.png");

  await setViewport(cdp, 640, 400, 2);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(cdp, `document.readyState === "complete" && document.querySelector('[data-learner-journey="six-stage"]')`, "200 percent zoom equivalent");
  const zoom = await evaluate(cdp, `(() => { const root = document.querySelector('[data-learner-journey="six-stage"]'); const clipped = [...root.querySelectorAll('*')].filter((element) => element.getClientRects().length > 0).filter((element) => { const style = getComputedStyle(element); const box = element.getBoundingClientRect(); const intentionallyVisuallyHidden = box.width <= 1 && box.height <= 1; return !intentionallyVisuallyHidden && /(hidden|clip)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1; }).map((element) => element.tagName + '.' + element.className).slice(0,20); return { cssViewport: innerWidth, dpr: devicePixelRatio, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, clipped }; })()`);
  record("LG-B02", zoom.cssViewport === 640 && zoom.dpr === 2 && !zoom.overflow && zoom.clipped.length === 0, "200% zoom equivalent reflows without page overflow or clipping", zoom);
  await screenshot(cdp, "binary-search-en-200pct.png");

  await setViewport(cdp, 1280, 800, 1);
  await navigate(cdp, `${BASE_URL}${ROUTE}?lang=en`);
  await clearProgress(cdp);
  await moveToTrace(cdp);
  const initialTrace = await evaluate(cdp, `(() => { const stage = document.querySelector('[data-learner-stage="trace"]'); const scene = stage.querySelector('[data-scene="binary-search-window"]'); const result = scene.querySelector('#bs-result')?.textContent.trim(); const next = stage.querySelector('[data-action="next"]'); const exit = stage.querySelector('[data-exit-gate="prediction"]'); const codeLines = stage.querySelectorAll('[data-python-artifact-id] [data-line-id]').length; const panels = stage.querySelectorAll('[data-primary-panel="true"]').length; const fields = scene.querySelectorAll('dl > div').length; const questions = stage.querySelectorAll('[data-storyboard-target], [data-active-learning-question="true"]').length; return { phase: scene.dataset.phase, result, nextDisabled: next?.disabled, exitDisabled: exit?.disabled, codeLines, panels, fields, questions }; })()`);
  record("LG-B03", initialTrace.phase === "predict" && initialTrace.nextDisabled && initialTrace.exitDisabled, "Initial Trace blocks Next and stage exit before prediction", initialTrace);
  record("LG-B04", /hidden|đang ẩn/i.test(initialTrace.result) && initialTrace.codeLines === 0, "Pre-attempt accessibility surface exposes no result value or code reveal", initialTrace);
  record("LG-B03", initialTrace.questions === 1 && initialTrace.panels <= 2 && initialTrace.fields <= 5, "Trace initial screen stays within question/panel/state density budgets", initialTrace);

  const axPredict = await cdp.send("Accessibility.getFullAXTree");
  const axSummary = axPredict.nodes.map((node) => ({ role: node.role?.value, name: node.name?.value, level: node.properties?.find((property) => property.name === "level")?.value?.value })).filter((node) => node.role && node.name);
  const h1s = axSummary.filter((node) => node.role === "heading" && node.level === 1);
  const radioNames = axSummary.filter((node) => node.role === "radio").map((node) => node.name);
  record("LG-B04", h1s.length === 1 && radioNames.length >= 2, "Accessibility tree has one lesson h1 and named prediction choices", { h1s, radioNames });

  await submitPredictionWithKeyboard(cdp);
  const revealed = await evaluate(cdp, `(() => { const stage = document.querySelector('[data-learner-stage="trace"]'); const scene = stage.querySelector('[data-scene="binary-search-window"]'); const source = stage.querySelector('[data-scrollable-code="true"]'); const lines = [...(source?.querySelectorAll('code > span') ?? [])]; const jump = stage.querySelector('[data-code-action="jump-active"]'); return { phase: scene.dataset.phase, focus: document.activeElement?.id ?? '', sceneHeading: scene.getAttribute('aria-labelledby'), lines: lines.length, totalLines: Number(source?.dataset.totalLines ?? 0), activeLines: lines.filter((line) => line.getAttribute('aria-current') === 'step').length, gaps: lines.filter((line) => line.hasAttribute('data-code-gap')).length, scrollable: source ? source.scrollHeight > source.clientHeight : false, tabIndex: source?.tabIndex, describedBy: source?.getAttribute('aria-describedby'), jumpHeight: jump?.getBoundingClientRect().height ?? 0, copyLabel: stage.querySelector('[data-code-action="copy-full-source"]')?.textContent.trim(), nextDisabled: stage.querySelector('[data-action="next"]')?.disabled, exitDisabled: stage.querySelector('[data-exit-gate="prediction"]')?.disabled, feedback: stage.querySelector('[role="status"]')?.textContent.trim() }; })()`);
  record("LG-B03", revealed.focus === revealed.sceneHeading && !revealed.nextDisabled && !revealed.exitDisabled, "Prediction reveal moves focus to checkpoint and unlocks Next/Trace exit", revealed);
  record("LG-B03", revealed.lines === revealed.totalLines && revealed.lines > 8 && revealed.activeLines <= 3 && revealed.gaps === 0 && revealed.tabIndex === 0 && Boolean(revealed.describedBy) && revealed.jumpHeight >= 44 && /full source|toàn bộ mã/i.test(revealed.copyLabel ?? ""), "Revealed Trace exposes complete, keyboard-focusable Python source with full-copy and active-line controls", revealed);
  const manualScroll = await evaluate(cdp, `(() => { const source=document.querySelector('[data-learner-stage="trace"] [data-scrollable-code="true"]'); const active=source?.querySelector('[aria-current="step"]'); if (!source || !active) return null; const maxScroll=Math.max(0,source.scrollHeight-source.clientHeight); source.scrollTop=source.scrollTop < maxScroll/2 ? maxScroll : 0; const sourceRect=source.getBoundingClientRect(), activeRect=active.getBoundingClientRect(); return {scrollTop:source.scrollTop,maxScroll,activeVisible:activeRect.top>=sourceRect.top&&activeRect.bottom<=sourceRect.bottom}; })()`);
  await delay(100);
  const manualPosition = await evaluate(cdp, `document.querySelector('[data-learner-stage="trace"] [data-scrollable-code="true"]')?.scrollTop ?? -1`);
  record("LG-B03", Boolean(manualScroll) && (manualScroll.maxScroll === 0 ? manualScroll.activeVisible : !manualScroll.activeVisible && manualPosition === manualScroll.scrollTop), "Code review keeps the complete short answer visible, or preserves manual scroll position for longer source", { manualScroll, manualPosition });
  await evaluate(cdp, `document.querySelector('[data-learner-stage="trace"] [data-code-action="jump-active"]')?.click(); true`);
  await delay(50);
  const located = await evaluate(cdp, `(() => { const source=document.querySelector('[data-learner-stage="trace"] [data-scrollable-code="true"]'); const active=source?.querySelector('[aria-current="step"]'); if (!source || !active) return false; const sourceRect=source.getBoundingClientRect(); const activeRect=active.getBoundingClientRect(); return activeRect.top>=sourceRect.top&&activeRect.bottom<=sourceRect.bottom; })()`);
  record("LG-B03", located, "Jump to active line returns the highlighted line to the visible code viewport", { located });
  record("LG-B04", Boolean(revealed.feedback), "Prediction feedback is exposed through a status region", { feedback: revealed.feedback });

  await evaluate(cdp, `document.querySelector('[data-learner-stage="trace"] [data-action="next"]').focus(); true`);
  await press(cdp, "Enter");
  await waitFor(cdp, `document.querySelector('[data-testid="event-progress"]')?.getAttribute('data-event-index') === "1"`, "next checkpoint");
  const nextFocus = await evaluate(cdp, `({ focus: document.activeElement?.id ?? '', heading: document.querySelector('[data-scene="binary-search-window"]')?.getAttribute('aria-labelledby'), phase: document.querySelector('[data-scene="binary-search-window"]')?.getAttribute('data-phase') })`);
  record("LG-B03", nextFocus.focus === nextFocus.heading && nextFocus.phase === "predict", "Keyboard Next focuses the new predict checkpoint", nextFocus);
  await submitPredictionWithKeyboard(cdp);

  await evaluate(cdp, `document.querySelector('[data-exit-gate="prediction"]').click(); true`);
  await waitFor(cdp, `document.querySelector('[data-learner-stage="practise"][data-stage-state="current"]')`, "Practise stage");
  await evaluate(cdp, `(() => { const field=document.querySelector('[data-learner-stage="practise"] textarea'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(field,'qa-practice-persist'); field.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
  await evaluate(cdp, `document.querySelector('[data-learner-stage="practise"] [data-practice-gate] > article > button:not([disabled])')?.click(); true`);
  await waitFor(cdp, `document.querySelector('[data-learner-stage="practise"] [data-self-check-state="criterion"]')`, "practice criterion gate");
  await evaluate(cdp, `(() => { const checkbox=document.querySelector('[data-learner-stage="practise"] fieldset input[type="checkbox"]'); checkbox.click(); return checkbox.checked; })()`);
  await evaluate(cdp, `document.querySelector('[data-learner-stage="practise"] fieldset button:not([disabled])')?.click(); true`);
  await waitFor(cdp, `document.querySelector('[data-learner-stage="practise"] [data-answer-revealed="true"]')`, "practice reveal");
  const practiceGate = await evaluate(cdp, `document.querySelector('[data-exit-gate="attempt"]')?.disabled`);
  record("LG-B05", practiceGate === false, "Recorded practice attempt unlocks stage exit", { exit_disabled: practiceGate });
  await evaluate(cdp, `document.querySelector('[data-exit-gate="attempt"]').click(); true`);
  await waitFor(cdp, `document.querySelector('[data-learner-stage="protectMarks"][data-stage-state="current"]')`, "Protect marks stage");
  const protectMarks = await evaluate(cdp, `(() => { const stage=document.querySelector('[data-learner-stage="protectMarks"]'); const cards=[...stage.querySelectorAll('article')].map((card)=>card.textContent.replace(/\\s+/g,' ').trim()); const text=stage.textContent.replace(/\\s+/g,' ').trim(); const banned=/(?:ac-9618-|paper4\\.section\\.|BINARY_SEARCH|fixture_id|scenario_id|event_id|SHA-?256|official_marks|marking_atom|disclosure_contract|\\{\\s*"[^\\"]+"\\s*:)/i.exec(text)?.[0] ?? null; return {cards:cards.length, labels:[...stage.querySelectorAll('dt')].map((item)=>item.textContent.trim()), banned, textSample:text.slice(0,500)}; })()`);
  record("LG-B08", protectMarks.cards === 5 && protectMarks.labels.length === 15 && !protectMarks.banned, "Protect marks shows five connected mistake/consequence/repair checks without audit jargon", protectMarks);
  await evaluate(cdp, `document.querySelector('[data-learner-stage="protectMarks"] [data-exit-gate="open"]').click(); true`);
  await waitFor(cdp, `document.querySelector('[data-learner-stage="recallAndContinue"][data-stage-state="current"]')`, "Recall stage");
  await evaluate(cdp, `(() => { const field=document.querySelector('[data-learner-stage="recallAndContinue"] textarea'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(field,'qa-recall-persist'); field.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
  await delay(100);
  const storageBefore = await evaluate(cdp, `Object.fromEntries(Object.entries(sessionStorage))`);
  await clickSelector(cdp, '[data-locale-switch][lang="vi"]');
  await waitFor(cdp, `document.documentElement.lang === "vi" && document.querySelector('[data-learner-stage="recallAndContinue"][data-stage-state="current"]')`, "EN to VI click persistence");
  const viPersistence = await evaluate(cdp, `({ lang: document.documentElement.lang, stage: document.querySelector('[data-learner-stage][data-stage-state="current"]')?.getAttribute('data-learner-stage'), recallDraft: document.querySelector('[data-learner-stage="recallAndContinue"] textarea')?.value, storage: Object.fromEntries(Object.entries(sessionStorage)) })`);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(cdp, `document.readyState === "complete" && document.querySelector('[data-learner-journey="six-stage"]')`, "VI reload");
  await delay(750);
  const viReload = await evaluate(cdp, `({ stage: document.querySelector('[data-learner-stage][data-stage-state="current"]')?.getAttribute('data-learner-stage'), recallDraft: document.querySelector('[data-learner-stage="recallAndContinue"] textarea')?.value, storage: Object.fromEntries(Object.entries(sessionStorage)) })`);
  await clickSelector(cdp, '[data-locale-switch][lang="en"]');
  await waitFor(cdp, `document.documentElement.lang === "en" && document.querySelector('[data-learner-stage="recallAndContinue"][data-stage-state="current"]')`, "VI to EN click persistence");
  const enPersistence = await evaluate(cdp, `({ lang: document.documentElement.lang, stage: document.querySelector('[data-learner-stage][data-stage-state="current"]')?.getAttribute('data-learner-stage'), recallDraft: document.querySelector('[data-learner-stage="recallAndContinue"] textarea')?.value, practice: sessionStorage.getItem('algocore.paper4.learner.binary-search.practice.v1'), trace: sessionStorage.getItem('algocore.paper4.visual.BINARY_SEARCH.progress.v1') })`);
  record("LG-B05", viPersistence.lang === "vi" && viPersistence.stage === "recallAndContinue" && viPersistence.recallDraft === "qa-recall-persist", "EN→VI preserves stage and recall draft", { before: storageBefore, vi: viPersistence });
  record("LG-B05", viReload.stage === "recallAndContinue" && viReload.recallDraft === "qa-recall-persist" && enPersistence.lang === "en" && enPersistence.stage === "recallAndContinue" && enPersistence.recallDraft === "qa-recall-persist" && enPersistence.practice?.includes("qa-practice-persist") && Boolean(enPersistence.trace), "VI reload→EN preserves stage, practice and trace progress", { vi_reload: viReload, en: enPersistence });

  await navigate(cdp, `${BASE_URL}${ROUTE}?lang=en`);
  await evaluate(cdp, `sessionStorage.setItem('algocore.paper4.learner.binary-search.stage.v1','trace'); location.hash='#stage-trace'; location.reload(); true`);
  await waitFor(cdp, `document.querySelector('[data-learner-stage="trace"][data-stage-state="current"]') && document.querySelector('[data-runtime-version="paper4-v2"]')`, "Trace for scenario review");
  const scenarioSurface = await evaluate(cdp, `(() => { const runtime=document.querySelector('[data-testid="paper4-visual-lab"]'); const selects=[...runtime.querySelectorAll('select')].map((select) => ({ options:[...select.options].map((option)=>({value:option.value,text:option.textContent.trim()})), aria:select.getAttribute('aria-label'), label:select.labels?.[0]?.textContent.trim() })); return { selects }; })()`);
  const scenarioSelect = scenarioSurface.selects.find((item) => item.options.length >= 3);
  record("LG-B06", Boolean(scenarioSelect), "Learner Trace exposes a deliberate human-labelled normal/boundary/failure scenario selector", scenarioSurface);
  if (scenarioSelect) {
    const humanLabels = scenarioSelect.options.every((option) => !/binary-search\.|fixture|scenario[_ -]?id/i.test(option.text));
    record("LG-B06", humanLabels, "Scenario options do not expose fixture/scenario IDs", { options: scenarioSelect.options });
    for (const option of scenarioSelect.options.slice(0, 3)) {
      await evaluate(cdp, `(() => { const select=[...document.querySelectorAll('[data-testid="paper4-visual-lab"] select')].find((item)=>item.options.length>=3); select.value=${JSON.stringify(option.value)}; select.dispatchEvent(new Event('change',{bubbles:true})); select.form?.requestSubmit(); return true; })()`);
      await waitFor(cdp, `document.querySelector('[data-scene="binary-search-window"]')?.getAttribute('data-phase') === "predict"`, `scenario ${option.text}`);
      const before = await evaluate(cdp, `(() => { const scene=document.querySelector('[data-scene="binary-search-window"]'); return { phase:scene.dataset.phase,result:scene.querySelector('#bs-result')?.textContent.trim(),fields:scene.querySelectorAll('dl>div').length,questions:document.querySelectorAll('[data-learner-stage="trace"] [data-storyboard-target]').length }; })()`);
      await submitPredictionWithKeyboard(cdp);
      const after = await evaluate(cdp, `(() => { const lines=[...document.querySelectorAll('[data-learner-stage="trace"] [data-panel="code"] pre code > span:not([data-code-gap])')]; return {lines:lines.length,active:lines.filter((line)=>line.getAttribute('aria-current')==='step').length}; })()`);
      record("LG-B06", before.phase === "predict" && /hidden|đang ẩn/i.test(before.result) && before.fields <= 5 && before.questions === 1 && after.active <= 3, `${option.text}: predict/reveal budgets hold`, { before, after });
      await evaluate(cdp, `document.querySelector('[data-learner-stage="trace"] [data-action="reset"]')?.click(); true`);
      await waitFor(cdp, `document.querySelector('[data-scene="binary-search-window"]')?.getAttribute('data-phase') === "predict"`, `reset ${option.text}`);
    }
  }

  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const motion = await evaluate(cdp, `(() => { const root=document.querySelector('[data-learner-journey="six-stage"]'); const seconds=(value)=>Math.max(...value.split(',').map((part)=>{const token=part.trim();return token.endsWith('ms')?Number.parseFloat(token)/1000:Number.parseFloat(token)||0;})); const animated=[...root.querySelectorAll('*')].filter((element)=>element.getClientRects().length>0).map((element)=>({duration:getComputedStyle(element).transitionDuration,animation:getComputedStyle(element).animationDuration})).filter((item)=>seconds(item.duration)>0.000011||seconds(item.animation)>0.000011); return {matches:matchMedia('(prefers-reduced-motion: reduce)').matches, animated:animated.slice(0,10)}; })()`);
  record("LG-B07", motion.matches && motion.animated.length === 0, "Reduced-motion mode removes learner-flow animation without hiding state", motion);

  await writeFile(path.join(EVIDENCE_DIR, "LEARNER_BROWSER_GATE_RESULT.json"), `${JSON.stringify({ schema_version: "paper4-learner-browser-gate-v1", decision: failures.length === 0 ? "PASS" : "FAIL", chrome: version.Browser, base_url: BASE_URL, checks_run: checks.length, checks_passed: checks.filter((item) => item.passed).length, failures, checks }, null, 2)}\n`);
} catch (error) {
  record("LG-B00", false, "Browser gate could not complete", { error: error instanceof Error ? error.stack ?? error.message : String(error) });
} finally {
  cdp?.close();
  if (chrome.exitCode === null) {
    chrome.kill();
    await Promise.race([
      new Promise((resolve) => chrome.once("exit", resolve)),
      delay(1500),
    ]);
  }
  const resolvedProfile = path.resolve(profile);
  if (resolvedProfile.startsWith(path.resolve(os.tmpdir()) + path.sep)) {
    try { await rm(resolvedProfile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
    catch { /* Chrome crashpad can briefly retain the temporary profile on Windows. */ }
  }
}

const report = {
  schema_version: "paper4-learner-browser-gate-v1",
  decision: failures.length === 0 ? "PASS" : "FAIL",
  chrome: chromePath,
  base_url: BASE_URL,
  checks_run: checks.length,
  checks_passed: checks.filter((item) => item.passed).length,
  failures,
  evidence_dir: EVIDENCE_DIR,
};
await writeFile(path.join(EVIDENCE_DIR, "LEARNER_BROWSER_GATE_RESULT.json"), `${JSON.stringify({ ...report, checks }, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;
