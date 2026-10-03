import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3022").replace(/\/$/, "");
const ROUTE = "/paper-4/design-system";
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper4/completion-program-2026/evidence/cp1-ds2");
const CHROME_CANDIDATES = [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe"].filter(Boolean);
const checks = [];
const failures = [];
const record = (id, pass, message, evidence = {}) => { const item = { id, pass: Boolean(pass), message, evidence }; checks.push(item); if (!item.pass) failures.push(item); };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function exists(file) { try { await access(file); return true; } catch { return false; } }
async function findChrome() { for (const candidate of CHROME_CANDIDATES) if (await exists(candidate)) return candidate; throw new Error("No local Chrome/Edge executable is available."); }
async function freePort() { return await new Promise((resolve, reject) => { const server = net.createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const address = server.address(); server.close(() => resolve(address.port)); }); }); }

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); }
  async open() { await new Promise((resolve, reject) => { this.socket.addEventListener("open", resolve, { once: true }); this.socket.addEventListener("error", reject, { once: true }); }); this.socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); if (!message.id) return; const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`)); else pending.resolve(message.result); }); }
  send(method, params = {}) { const id = this.nextId++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject, method }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  close() { this.socket.close(); }
}

async function evaluate(cdp, expression) { const response = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? "Browser evaluation failed"); return response.result.value; }
async function waitFor(cdp, expression, label, timeoutMs = 20000) { const start = Date.now(); while (Date.now() - start < timeoutMs) { if (await evaluate(cdp, `Boolean(${expression})`)) return; await delay(100); } throw new Error(`Timed out waiting for ${label}`); }
async function navigate(cdp, url) { await cdp.send("Page.navigate", { url }); await waitFor(cdp, `document.readyState === "complete" && document.querySelector('[data-ds2-gallery]')`, url); await delay(150); }
async function setViewport(cdp, width, height, deviceScaleFactor = 1) { await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor, mobile: false, screenWidth: width, screenHeight: height }); }
async function screenshot(cdp, filename) { const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true }); await writeFile(path.join(EVIDENCE_DIR, filename), Buffer.from(shot.data, "base64")); }

async function run() {
  await mkdir(EVIDENCE_DIR, { recursive: true });
  const chromePath = await findChrome();
  const debugPort = await freePort();
  const profile = await mkdtemp(path.join(os.tmpdir(), "algocore-ds2-gallery-"));
  const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank"], { windowsHide: true, stdio: "ignore" });
  let cdp;
  let browser = chromePath;
  try {
    let version;
    for (let attempt = 0; attempt < 100; attempt += 1) { try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); if (response.ok) { version = await response.json(); break; } } catch { /* Chrome is starting. */ } await delay(100); }
    if (!version) throw new Error("Chrome DevTools endpoint did not start.");
    browser = version.Browser;
    const page = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
    cdp = new Cdp(page.webSocketDebuggerUrl);
    await cdp.open();
    await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Accessibility.enable")]);

    await setViewport(cdp, 1440, 900);
    await navigate(cdp, `${BASE_URL}${ROUTE}?lang=en`);
    const desktop = await evaluate(cdp, `(() => { const root=document.querySelector('[data-ds2-gallery]'); const visible=(element)=>element.getClientRects().length>0; const direct=[...root.querySelectorAll('button,input:not([type=radio]),select,textarea,a')]; const radioLabels=[...root.querySelectorAll('input[type=radio]')].map((input)=>input.closest('label')).filter(Boolean); const controls=[...new Set([...direct,...radioLabels])].filter(visible).map((element)=>{const rect=element.getBoundingClientRect();return {tag:element.tagName.toLowerCase(),name:element.getAttribute('aria-label')||element.textContent.trim()||element.id,width:rect.width,height:rect.height};}); return {locale:root.dataset.galleryLocale,families:[...root.querySelectorAll('[data-ds2-family]')].map((item)=>item.dataset.ds2Family),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,undersized:controls.filter((item)=>item.height<44),progress:root.querySelectorAll('[role=progressbar]').length,alerts:root.querySelectorAll('[role=alert]').length,radios:root.querySelectorAll('input[type=radio]').length,current:root.querySelectorAll('[aria-current]').length}; })()`);
    record("DS2-B01", desktop.locale === "en" && JSON.stringify(desktop.families) === JSON.stringify(["controls", "surfaces", "journey"]), "English gallery renders all three DS2 lanes", desktop);
    record("DS2-B02", !desktop.overflow && desktop.undersized.length === 0, "Desktop has no page overflow and interactive targets are at least 44 px", desktop);
    record("DS2-B03", desktop.progress === 1 && desktop.alerts >= 2 && desktop.radios === 3 && desktop.current >= 2, "Progress, feedback, choice and current-state semantics render", desktop);
    const focus = await evaluate(cdp, `(() => { const button=document.querySelector('[data-ds2-family=controls] button'); button.focus(); const style=getComputedStyle(button); return {focused:document.activeElement===button,outlineWidth:parseFloat(style.outlineWidth),outlineColor:style.outlineColor}; })()`);
    record("DS2-B04", focus.focused && focus.outlineWidth >= 2, "Keyboard focus is visible on the first primary action", focus);
    await screenshot(cdp, "ds2-gallery-en-light-1440x900.png");

    const switched = await evaluate(cdp, `(() => { const buttons=[...document.querySelectorAll('[role=group] button')]; const vi=buttons.find((button)=>button.textContent.trim()==='Tiếng Việt'); vi?.click(); return Boolean(vi); })()`);
    await waitFor(cdp, `document.querySelector('[data-ds2-gallery]')?.dataset.galleryLocale==='vi'`, "Vietnamese gallery state");
    const vi = await evaluate(cdp, `({switched:${JSON.stringify(switched)},locale:document.querySelector('[data-ds2-gallery]').dataset.galleryLocale,title:document.querySelector('h1').textContent,longLabel:[...document.querySelectorAll('label')].some((item)=>item.textContent.includes('Họ và tên học viên'))})`);
    record("DS2-B05", vi.switched && vi.locale === "vi" && vi.title.includes("AlgoCore") && vi.longLabel, "Interactive locale switch exposes Vietnamese copy with identical gallery topology", vi);

    await setViewport(cdp, 320, 900);
    const mobile = await evaluate(cdp, `(() => { const root=document.querySelector('[data-ds2-gallery]'); const visible=(element)=>element.getClientRects().length>0; const direct=[...root.querySelectorAll('button,input:not([type=radio]),select,textarea,a')]; const radioLabels=[...root.querySelectorAll('input[type=radio]')].map((input)=>input.closest('label')).filter(Boolean); const controls=[...new Set([...direct,...radioLabels])].filter(visible).map((element)=>{const rect=element.getBoundingClientRect();return {name:element.getAttribute('aria-label')||element.textContent.trim()||element.id,width:rect.width,height:rect.height,right:rect.right};}); const rootRect=root.getBoundingClientRect(); return {viewportWidth:innerWidth,rootWidth:rootRect.width,rootLeft:rootRect.left,rootRight:rootRect.right,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,undersized:controls.filter((item)=>item.height<44),offscreen:controls.filter((item)=>item.right>innerWidth+1)}; })()`);
    record("DS2-B06", !mobile.overflow && mobile.rootWidth >= mobile.viewportWidth * 0.8 && mobile.rootLeft >= 0 && mobile.rootRight <= mobile.viewportWidth + 1 && mobile.undersized.length === 0 && mobile.offscreen.length === 0, "Vietnamese gallery uses at least 80% of the mobile canvas and reflows at 320 px without clipped controls", mobile);
    await screenshot(cdp, "ds2-gallery-vi-light-320x900.png");

    await setViewport(cdp, 640, 450, 2);
    const zoom = await evaluate(cdp, `({width:innerWidth,dpr:devicePixelRatio,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1})`);
    record("DS2-B07", zoom.width === 640 && zoom.dpr === 2 && !zoom.overflow, "200% zoom equivalent has no horizontal page overflow", zoom);

    await setViewport(cdp, 1440, 900, 1);
    const dark = await evaluate(cdp, `(() => { document.documentElement.classList.add('dark'); const root=document.querySelector('[data-ds2-gallery]'); const card=root.querySelector('article'); const button=root.querySelector('button'); return {canvas:getComputedStyle(document.documentElement).getPropertyValue('--alg-surface-canvas').trim(),card:getComputedStyle(card).backgroundColor,button:getComputedStyle(button).backgroundColor,text:getComputedStyle(card).color}; })()`);
    record("DS2-B08", dark.canvas && dark.card && dark.button && dark.text, "Dark theme resolves semantic surface, action and text values", dark);
    await screenshot(cdp, "ds2-gallery-vi-dark-1440x900.png");

    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const motion = await evaluate(cdp, `(() => { const root=document.querySelector('[data-ds2-gallery]'); const seconds=(value)=>Math.max(...value.split(',').map((item)=>item.trim().endsWith('ms')?parseFloat(item)/1000:parseFloat(item)||0)); const animated=[...root.querySelectorAll('*')].filter((element)=>element.getClientRects().length).map((element)=>({transition:getComputedStyle(element).transitionDuration,animation:getComputedStyle(element).animationDuration})).filter((item)=>seconds(item.transition)>0.000011||seconds(item.animation)>0.000011); return {matches:matchMedia('(prefers-reduced-motion: reduce)').matches,animated:animated.slice(0,10)}; })()`);
    record("DS2-B09", motion.matches && motion.animated.length === 0, "Reduced motion removes component animation and transition", motion);

    const axeSource = await readFile(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
    await evaluate(cdp, axeSource);
    const axe = await evaluate(cdp, `axe.run(document,{resultTypes:['violations']}).then((result)=>({violations:result.violations.filter((item)=>item.impact==='serious'||item.impact==='critical').map((item)=>({id:item.id,impact:item.impact,nodes:item.nodes.length}))}))`);
    record("DS2-B10", axe.violations.length === 0, "Gallery has zero serious or critical axe violations", axe);
  } catch (error) {
    record("DS2-B00", false, "Browser gate could not complete", { error: error instanceof Error ? error.stack ?? error.message : String(error) });
  } finally {
    cdp?.close();
    if (chrome.exitCode === null) { chrome.kill(); await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), delay(1500)]); }
    const resolved = path.resolve(profile);
    if (resolved.startsWith(path.resolve(os.tmpdir()) + path.sep)) { try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* Chrome may retain crashpad briefly. */ } }
  }

  const report = { schema_version: "algocore-ds2-gallery-browser-gate-v1", decision: failures.length ? "FAIL" : "PASS", browser, route: ROUTE, base_url: BASE_URL, checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
  await writeFile(path.join(EVIDENCE_DIR, "DS2_GALLERY_BROWSER_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
  if (failures.length) process.exitCode = 1;
}

await run();
