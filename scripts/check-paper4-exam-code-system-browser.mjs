import { spawn } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";

try { process.loadEnvFile(path.resolve(".env.local")); } catch { /* CI may inject credentials. */ }
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
const lessons = [
  ["data-models", 1], ["search-collections", 3], ["sorting", 2], ["stack", 2],
  ["queue", 1], ["text-processing", 2], ["binary-tree", 3], ["hashing", 2],
];
const locales = ["en", "vi"];
const binaryScenarioKinds = ["normal", "boundary", "failure"];
const forbidden = ["fixture", "trace.append", "__main__", "json.loads", "json.dumps", "Path(", "sys.argv"];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function findChrome() { for (const file of [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe"].filter(Boolean)) { try { await access(file); return file; } catch { /* next */ } } throw new Error("Chrome or Edge was not found."); }
async function freePort() { return new Promise((resolve, reject) => { const server = net.createServer(); server.on("error", reject); server.listen(0, "127.0.0.1", () => { const address = server.address(); const port = typeof address === "object" && address ? address.port : 0; server.close(() => resolve(port)); }); }); }
class CDP { constructor(url) { this.id = 0; this.pending = new Map(); this.ws = new WebSocket(url); } async open() { await new Promise((resolve, reject) => { this.ws.addEventListener("open", resolve, { once: true }); this.ws.addEventListener("error", reject, { once: true }); }); this.ws.addEventListener("message", (event) => { const message = JSON.parse(event.data); const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); }); } send(method, params = {}) { const id = ++this.id; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); }); } close() { this.ws.close(); } }
async function evaluate(cdp, expression) { const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
async function waitFor(cdp, expression, label, timeout = 20000) { const started = Date.now(); while (Date.now() - started < timeout) { if (await evaluate(cdp, `Boolean(${expression})`)) return; await delay(100); } throw new Error(`Timed out waiting for ${label}`); }
async function navigate(cdp, url, ready) { await cdp.send("Page.navigate", { url }); await waitFor(cdp, `document.readyState==='complete'&&(${ready})`, url); }

if (!username || !password) throw new Error("Student credentials are required for the exam-code browser gate.");
const chromePath = await findChrome(); const port = await freePort(); const profile = await mkdtemp(path.join(os.tmpdir(), "paper4-exam-code-system-"));
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--disable-extensions", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank"], { windowsHide: true, stdio: "ignore" });
let cdp;
try {
  let version;
  for (let attempt = 0; attempt < 100; attempt += 1) { try { const response = await fetch(`http://127.0.0.1:${port}/json/version`); if (response.ok) { version = await response.json(); break; } } catch { /* starting */ } await delay(100); }
  if (!version) throw new Error("Chrome DevTools endpoint did not start.");
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
  cdp = new CDP(page.webSocketDebuggerUrl); await cdp.open(); await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await navigate(cdp, `${BASE_URL}/login?lang=en`, `document.querySelector('#student-password')`);
  const login = await evaluate(cdp, `(async()=>{const response=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:${JSON.stringify(username)},password:${JSON.stringify(password)},next:'/paper-4',lang:'en'})});return response.status})()`);
  if (login !== 200) throw new Error(`Student login failed with HTTP ${login}.`);

  const results = [];
  const binaryResults = [];
  for (const locale of locales) {
    for (const [slug, expectedOptions] of lessons) {
      await navigate(cdp, `${BASE_URL}/paper-4/lessons/${slug}?lang=${locale}`, `document.querySelector('[data-learner-journey="six-stage"]')`);
      await evaluate(cdp, `sessionStorage.setItem(${JSON.stringify(`algocore.paper4.learner.${slug}.stage.v1`)},'trace');location.hash='#stage-trace';location.reload();true`);
      const selector = `[data-exam-code-supplement="${slug}"]`;
      await waitFor(cdp, `document.querySelector(${JSON.stringify(selector)})`, `${locale}/${slug} supplement`);
      const optionCount = await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}+' select')?.options.length??1`);
      const variants = [];
      for (let index = 0; index < optionCount; index += 1) {
        if (optionCount > 1) { await evaluate(cdp, `(()=>{const select=document.querySelector(${JSON.stringify(selector)}+' select');select.value=${JSON.stringify(String(index))};select.dispatchEvent(new Event('change',{bubbles:true}));return true})()`); await delay(100); }
        variants.push(await evaluate(cdp, `(()=>{const root=document.querySelector(${JSON.stringify(selector)}),pre=root.querySelector('[data-exam-code-panel] pre'),code=pre?.textContent??'',active=root.querySelectorAll('[data-exam-code-panel] [aria-current="step"]').length;return{code,active,forbidden:${JSON.stringify(forbidden)}.filter(token=>code.includes(token)),preOverflow:pre?pre.scrollWidth>pre.clientWidth+1:false}})()`));
      }
      results.push({ locale, slug, expectedOptions, optionCount, variants });
    }

    await navigate(cdp, `${BASE_URL}/paper-4/lessons/binary-search?lang=${locale}`, `document.querySelector('[data-learner-journey="six-stage"]')`);
    await evaluate(cdp, `sessionStorage.setItem('algocore.paper4.learner.binary-search.stage.v1','trace');location.hash='#stage-trace';location.reload();true`);
    await waitFor(cdp, `document.querySelector('[data-learner-stage="trace"] select')`, `${locale}/Binary Search scenario selector`);
    const supportedKinds = await evaluate(cdp, `[...document.querySelector('[data-learner-stage="trace"] select').options].map(option=>option.value)`);
    if (binaryScenarioKinds.some((caseKind) => !supportedKinds.includes(caseKind))) throw new Error(`${locale}/Binary Search scenarios are incomplete: ${supportedKinds.join(", ")}`);
    for (const caseKind of binaryScenarioKinds) {
      await evaluate(cdp, `(()=>{const select=document.querySelector('[data-learner-stage="trace"] select');if(select.value!==${JSON.stringify(caseKind)}){select.value=${JSON.stringify(caseKind)};select.dispatchEvent(new Event('change',{bubbles:true}))}return true})()`);
      await waitFor(cdp, `document.querySelector('[data-testid="paper4-visual-lab"]')?.dataset.caseKind===${JSON.stringify(caseKind)}&&document.querySelector('[data-scene="binary-search-window"]')`, `${locale}/Binary Search ${caseKind} scene`);
      await waitFor(cdp, `document.querySelector('[data-learner-stage="trace"] input[type="radio"], [data-learner-stage="trace"] [data-scrollable-code="true"]')`, `${locale}/Binary Search ${caseKind} prediction or learner code`);
      const needsReveal = await evaluate(cdp, `Boolean(document.querySelector('[data-learner-stage="trace"] input[type="radio"]'))`);
      if (needsReveal) await evaluate(cdp, `(()=>{const radio=document.querySelector('[data-learner-stage="trace"] input[type="radio"]');radio.click();radio.form.requestSubmit();return true})()`);
      await waitFor(cdp, `document.querySelector('[data-learner-stage="trace"] [data-scrollable-code="true"]')`, `${locale}/Binary Search ${caseKind} learner code`);
      const binary = await evaluate(cdp, `(()=>{const source=document.querySelector('[data-learner-stage="trace"] [data-scrollable-code="true"]'),code=source.textContent,lines=source.querySelectorAll('code > span');return{locale:${JSON.stringify(locale)},caseKind:${JSON.stringify(caseKind)},scene:Boolean(document.querySelector('[data-scene="binary-search-window"]')),code,lineCount:lines.length,active:[...lines].filter(line=>line.getAttribute('aria-current')==='step').length,forbidden:${JSON.stringify(forbidden)}.filter(token=>code.includes(token)),hasFunction:code.includes('def binary_search(values, target):')}})()`);
      binaryResults.push(binary);
    }
  }
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 900, deviceScaleFactor: 1, mobile: false, screenWidth: 320, screenHeight: 900 });
  const mobileOverflow = await evaluate(cdp, `document.documentElement.scrollWidth>document.documentElement.clientWidth+1`);
  const failures = [];
  for (const result of results) {
    if (result.optionCount !== result.expectedOptions) failures.push(`${result.slug}: option count ${result.optionCount}`);
    if (result.variants.some((item) => item.forbidden.length || item.active < 1 || item.active > 3 || item.preOverflow || !item.code.includes("def ") && !item.code.includes("class "))) failures.push(`${result.slug}: learner code surface invalid`);
  }
  for (const binary of binaryResults) if (!binary.scene || !binary.hasFunction || binary.lineCount !== 12 || binary.active < 1 || binary.active > 3 || binary.forbidden.length) failures.push(`${binary.locale}/binary-search/${binary.caseKind}: learner recipe invalid`);
  if (mobileOverflow) failures.push("mobile: document overflow");
  console.log(JSON.stringify({ schema_version: "paper4-exam-code-system-browser-gate-v2", decision: failures.length ? "FAIL" : "PASS", base_url: BASE_URL, locales, binary_scenarios: binaryScenarioKinds, supplement_lessons: results, binary_search: binaryResults, mobile_overflow: mobileOverflow, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  try { cdp?.close(); } catch { /* cleanup */ }
  chrome.kill(); await delay(300); try { await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); } catch { /* cleanup */ }
}
