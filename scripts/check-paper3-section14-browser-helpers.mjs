import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW_ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : null;
const BASE_URL = (process.env.PAPER3_BASE_URL ?? "http://127.0.0.1:3033").replace(/\/$/, "");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section14");
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
async function press(cdp, key, code = key, windowsVirtualKeyCode) { const character = key === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {}; await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode, ...character }); await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode }); }
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

export { ROOT, BASE_URL, EVIDENCE_DIR, PREVIEW_ROOT, checks, consoleErrors, runtimeErrors, delay, record, evaluate, waitFor, navigate, settleTheme, viewport, screenshot, press, overflow, axe, pointerClickVisualButton };

/** No browser starts on import. Scenario entrypoints call this only after a real candidate is ready. */
export async function runBrowser({ scope, scenario, candidateFiles, resultFile = 'QA_BROWSER_PILOT_RESULT.json' }) {
  if (!PREVIEW_ROOT || PREVIEW_ROOT === ROOT) throw Error('PAPER3_PREVIEW_DIR must identify the isolated candidate, not the authoring app.');
  if (!resultFile.startsWith('QA_') || path.basename(resultFile) !== resultFile) throw Error('Evidence filename must be a QA_ basename.');
  checks.length = 0; consoleErrors.length = 0; runtimeErrors.length = 0;
  await mkdir(EVIDENCE_DIR, { recursive: true });
  const startedAt = new Date().toISOString();
  const hashes = async root => Object.fromEntries(await Promise.all(candidateFiles.map(async file => [file, createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')])));
  const candidateHashes = await hashes(ROOT);
  const snapshotHashes = await hashes(PREVIEW_ROOT);
  const declaredPath = path.join(EVIDENCE_DIR, 'QA_DECLARED_CONCURRENT_DELTA.json');
  const declared = await exists(declaredPath) ? JSON.parse(await readFile(declaredPath, 'utf8')) : null;
  const acceptedConcurrentDeltas = [];
  const sourceMatches = candidateFiles.every(file => {
    if (candidateHashes[file] === snapshotHashes[file]) return true;
    if (file === 'package.json' && declared?.file === file && candidateHashes[file] === declared.authoringSha256 && snapshotHashes[file] === declared.snapshotSha256) { acceptedConcurrentDeltas.push(declared); return true; }
    return false;
  });
  const buildFile = path.join(PREVIEW_ROOT, '.next/BUILD_ID');
  const buildId = (await readFile(buildFile, 'utf8')).trim();
  const binding = { previewRoot: PREVIEW_ROOT, buildId, sourceMatches, acceptedConcurrentDeltas, htmlBeforeMatches: false, htmlAfterMatches: false, endBuildId: null, sourceUnchangedAfter: false };
  const readHtml = async () => {
    const response = await fetch(`${BASE_URL}/paper-3?lang=en`, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw Error(`Build-marker response HTTP ${response.status}`);
    return response.text();
  };
  let chrome, profile, cdp, browser;
  try {
    if (!sourceMatches) throw Error('Original/snapshot source hashes differ before the run.');
    if (!buildId) throw Error('Candidate BUILD_ID is empty.');
    binding.htmlBeforeMatches = (await readHtml()).includes(buildId);
    if (!binding.htmlBeforeMatches) throw Error('Served HTML does not match candidate BUILD_ID.');
    const chromePath = await findChrome();
    const debugPort = await freePort();
    profile = await mkdtemp(path.join(os.tmpdir(), 'algocore-section14-'));
    chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, '--window-size=1440,900', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let version;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); if (response.ok) { version = await response.json(); break; } } catch { /* Only this process's Chrome is starting. */ }
      await delay(100);
    }
    if (!version) throw Error('Owned Chrome DevTools endpoint did not start.');
    browser = version.Browser;
    const tab = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json();
    cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.open();
    cdp.on('Runtime.consoleAPICalled', event => { if (event.type === 'error') consoleErrors.push({ text: event.args.map(arg => arg.value ?? arg.description ?? '').join(' '), timestamp: event.timestamp }); });
    cdp.on('Runtime.exceptionThrown', event => runtimeErrors.push(event.exceptionDetails));
    await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Accessibility.enable')]);
    await scenario(cdp);
    binding.endBuildId = (await readFile(buildFile, 'utf8')).trim();
    binding.htmlAfterMatches = (await readHtml()).includes(buildId);
    const hashesAfter = await hashes(ROOT), snapshotAfter = await hashes(PREVIEW_ROOT);
    binding.sourceUnchangedAfter = candidateFiles.every(file => hashesAfter[file] === candidateHashes[file] && snapshotAfter[file] === snapshotHashes[file]);
    record('S14-BUILD-BINDING', binding.endBuildId === buildId && binding.htmlAfterMatches && binding.sourceUnchangedAfter, 'Same isolated build and source hashes before/after the complete flow', binding);
    record('S14-CONSOLE', !consoleErrors.length && !runtimeErrors.length, 'No console errors or runtime exceptions in the executed flow', { consoleErrors, runtimeErrors });
  } catch (error) {
    record('S14-INCOMPLETE', false, 'Browser flow did not complete', { error: error.stack ?? String(error), consoleErrors, runtimeErrors });
  } finally {
    cdp?.close();
    if (chrome && chrome.exitCode === null) { chrome.kill(); await Promise.race([new Promise(resolve => chrome.once('exit', resolve)), delay(1500)]); }
    if (profile) {
      const resolved = path.resolve(profile), relative = path.relative(path.resolve(os.tmpdir()), resolved);
      if (relative && !relative.startsWith('..') && !path.isAbsolute(relative) && path.basename(resolved).startsWith('algocore-section14-')) {
        try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* Owned crashpad may briefly retain a file. */ }
      }
    }
  }
  const failures = checks.filter(check => !check.pass);
  const report = { schemaVersion: 1, scope, startedAt, completedAt: new Date().toISOString(), buildId, buildBinding: binding, candidateHashes, snapshotHashes, browser, baseUrl: BASE_URL, decision: failures.length ? 'FAIL' : 'PASS', checksRun: checks.length, checksPassed: checks.length - failures.length, failures, checks };
  const target = path.join(EVIDENCE_DIR, resultFile);
  if (await exists(target)) {
    const prior = JSON.parse(await readFile(target, 'utf8'));
    const suffix = `${prior.buildId ?? 'unbound'}_${prior.startedAt ?? new Date().toISOString()}`.replace(/[^A-Za-z0-9_.-]/g, '-');
    await writeFile(target.replace(/\.json$/, `_${suffix}.json`), JSON.stringify(prior, null, 2) + '\n');
  }
  await writeFile(target, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, checks: undefined, candidateHashes: undefined, snapshotHashes: undefined }, null, 2));
  if (failures.length) process.exitCode = 1;
  return report;
}
