import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";

try { process.loadEnvFile(path.resolve(".env.local")); } catch { /* CI may inject credentials. */ }

const ROOT = process.cwd();
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
const evidenceDir = process.env.PAPER4_EXAM_CODE_EVIDENCE_DIR
  ? path.resolve(process.env.PAPER4_EXAM_CODE_EVIDENCE_DIR)
  : path.resolve(ROOT, "../planning/paper4/professional-remediation-2026-10-04/evidence/ux-fixes");
const screenshotPath = path.join(evidenceDir, "SEARCH_COLLECTIONS_EXAM_CODE_SURFACE.png");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function findChrome() {
  const candidates = [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe"].filter(Boolean);
  for (const candidate of candidates) { try { await access(candidate); return candidate; } catch { /* Try next. */ } }
  throw new Error("Chrome or Edge was not found.");
}
async function freePort() { return new Promise((resolve, reject) => { const server = net.createServer(); server.on("error", reject); server.listen(0, "127.0.0.1", () => { const address = server.address(); const port = typeof address === "object" && address ? address.port : 0; server.close(() => resolve(port)); }); }); }
class CDP {
  constructor(url) { this.id = 0; this.pending = new Map(); this.ws = new WebSocket(url); }
  async open() { await new Promise((resolve, reject) => { this.ws.addEventListener("open", resolve, { once: true }); this.ws.addEventListener("error", reject, { once: true }); }); this.ws.addEventListener("message", (event) => { const message = JSON.parse(event.data); const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  close() { this.ws.close(); }
}
async function evaluate(cdp, expression) { const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
async function waitFor(cdp, expression, label, timeout = 20000) { const started = Date.now(); while (Date.now() - started < timeout) { if (await evaluate(cdp, `Boolean(${expression})`)) return; await delay(100); } throw new Error(`Timed out waiting for ${label}`); }
async function navigate(cdp, url, ready) { await cdp.send("Page.navigate", { url }); await waitFor(cdp, `document.readyState==='complete'&&(${ready})`, url); }
async function press(cdp, key) { const keyCode = key === "Enter" ? 13 : 0; await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, text: key === "Enter" ? "\r" : "", windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode }); await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode }); await delay(100); }

if (!username || !password) throw new Error("Student credentials are required for the exam-code browser gate.");
await mkdir(evidenceDir, { recursive: true });
const chromePath = await findChrome();
const port = await freePort();
const profile = await mkdtemp(path.join(os.tmpdir(), "paper4-exam-code-"));
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--disable-extensions", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank"], { windowsHide: true, stdio: "ignore" });
let cdp;
try {
  let version;
  for (let attempt = 0; attempt < 100; attempt += 1) { try { const response = await fetch(`http://127.0.0.1:${port}/json/version`); if (response.ok) { version = await response.json(); break; } } catch { /* Chrome is starting. */ } await delay(100); }
  if (!version) throw new Error("Chrome DevTools endpoint did not start.");
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
  cdp = new CDP(page.webSocketDebuggerUrl); await cdp.open(); await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await navigate(cdp, `${BASE_URL}/login?lang=en`, `document.querySelector('#student-password')`);
  const login = await evaluate(cdp, `(async()=>{const response=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:${JSON.stringify(username)},password:${JSON.stringify(password)},next:'/paper-4/lessons/search-collections?lang=en',lang:'en'})});return response.status})()`);
  if (login !== 200) throw new Error(`Student login failed with HTTP ${login}.`);
  await navigate(cdp, `${BASE_URL}/paper-4/lessons/search-collections?lang=en`, `document.querySelector('[data-learner-journey="six-stage"]')`);
  await evaluate(cdp, `sessionStorage.clear();localStorage.clear();true`); await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(cdp, `document.querySelector('[data-learner-stage="recognise"] [data-exit-gate="open"]')`, "recognise continue");
  await delay(800);
  for (const stage of ["understand", "trace"]) { await evaluate(cdp, `(()=>{const button=document.querySelector('[data-learner-stage][data-stage-state="current"] [data-exit-gate="open"]');if(!button)throw new Error('Missing open exit gate');button.click();return true})()`); await waitFor(cdp, `document.querySelector('[data-learner-stage="${stage}"][data-stage-state="current"]')`, stage); }
  const selector = '[data-exam-code-supplement="search-collections"]';
  await waitFor(cdp, `document.querySelector(${JSON.stringify(selector)})`, "exam-code supplement");
  const desktop = await evaluate(cdp, `(()=>{const root=document.querySelector(${JSON.stringify(selector)}),text=root.textContent,lines=[...root.querySelectorAll('[data-exam-code-panel] [aria-current="step"]')],code=root.querySelector('[data-exam-code-panel] pre').textContent;return{forbidden:['fixture','trace.append','__main__','json.loads','Path('].some(token=>code.includes(token)),hasCount:code.includes('def count_occurrences(values, target):'),active:lines.length,text}})()`);
  await evaluate(cdp, `(()=>{const select=document.querySelector(${JSON.stringify(selector)}+' select');select.value='1';select.dispatchEvent(new Event('change',{bubbles:true}));return true})()`); await delay(150);
  const filterCode = await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}+' [data-exam-code-panel] pre').textContent`);
  await evaluate(cdp, `(()=>{const select=document.querySelector(${JSON.stringify(selector)}+' select');select.value='2';select.dispatchEvent(new Event('change',{bubbles:true}));return true})()`); await delay(150);
  const groupCode = await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}+' [data-exam-code-panel] pre').textContent`);
  await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}+' nav button:last-child').click()`); await delay(150);
  const groupStep = await evaluate(cdp, `(()=>{const root=document.querySelector(${JSON.stringify(selector)});return{step:root.querySelector('[data-exam-trace-step]').dataset.examTraceStep,active:root.querySelectorAll('[data-exam-code-panel] [aria-current="step"]').length}})()`);
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 900, deviceScaleFactor: 1, mobile: false, screenWidth: 320, screenHeight: 900 });
  await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start'})`); await delay(150);
  const mobile = await evaluate(cdp, `(()=>{const root=document.querySelector(${JSON.stringify(selector)}),r=root.getBoundingClientRect(),controls=[...root.querySelectorAll('button,select')].map(e=>e.getBoundingClientRect());return{overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,left:r.left,right:r.right,width:r.width,undersized:controls.filter(r=>r.width<44||r.height<44).length}})()`);
  const clip = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true, clip }); await writeFile(screenshotPath, Buffer.from(shot.data, "base64"));
  const failures = [];
  if (desktop.forbidden || !desktop.hasCount || desktop.active < 1 || desktop.active > 3) failures.push("COUNT_SURFACE_INVALID");
  if (!filterCode.includes("def filter_records(records, threshold):")) failures.push("FILTER_SURFACE_INVALID");
  if (!groupCode.includes("def group_totals(records):") || groupStep.step !== "2" || groupStep.active < 1 || groupStep.active > 3) failures.push("GROUP_SURFACE_INVALID");
  if (mobile.overflow || mobile.left < -1 || mobile.right > 321 || mobile.undersized > 0) failures.push("MOBILE_REFLOW_INVALID");
  const result = { schema_version: "paper4-exam-code-browser-gate-v1", decision: failures.length ? "FAIL" : "PASS", base_url: BASE_URL, screenshot: screenshotPath, checks: { desktop, filter_function: filterCode.includes("def filter_records(records, threshold):"), group_function: groupCode.includes("def group_totals(records):"), groupStep, mobile }, failures };
  console.log(JSON.stringify(result, null, 2)); if (failures.length) process.exitCode = 1;
} finally {
  try { cdp?.close(); } catch { /* Ignore cleanup failure. */ }
  chrome.kill();
  await delay(300);
  try { await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); } catch { /* Windows may keep a transient Crashpad handle open. */ }
}
