import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = (process.env.PAPER3_BASE_URL ?? "http://127.0.0.1:3033").replace(/\/$/, "");
const EVIDENCE_DIR = path.resolve(ROOT, "../planning/paper3-2026/completion-program-2026/evidence/ui-shell");
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
async function viewport(cdp, width, height = 900) { await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height }); }
async function screenshot(cdp, name) { const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true }); await writeFile(path.join(EVIDENCE_DIR, name), Buffer.from(shot.data, "base64")); }
async function press(cdp, key, code = key, windowsVirtualKeyCode) { await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode }); await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode }); }
async function overflow(cdp) { return evaluate(cdp, `({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1})`); }
async function axe(cdp, id, message) {
  await evaluate(cdp, await readFile(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8"));
  const result = await evaluate(cdp, `axe.run(document,{resultTypes:['violations']}).then(result=>({violations:result.violations.filter(item=>['serious','critical'].includes(item.impact)).map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}))}))`);
  record(id, result.violations.length === 0, message, result);
}

async function shellScenarios(cdp) {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "content/paper3/study-map.json"), "utf8"));
  const main = "document.querySelector('#paper3-main')";
  const mapNodes = "[...document.querySelectorAll('button[aria-controls=paper3-section-detail]')]";
  const topicRows = "[...document.querySelectorAll('#paper3-main a[data-topic-id]')]";
  const cardLayout = async () => evaluate(cdp, `(() => { const nodes=${mapNodes}.map(node=>{ const box=node.getBoundingClientRect(); const parts=[...node.children].map(part=>{const rect=part.getBoundingClientRect(); return {text:part.textContent,top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right};}); return {section:node.dataset.sectionId,height:box.height,width:box.width,outside:parts.filter(part=>part.top<box.top-1||part.bottom>box.bottom+1||part.left<box.left-1||part.right>box.right+1),overlap:parts.slice(1).filter((part,index)=>parts[index].bottom>part.top+1),internalOverflow:node.scrollHeight>node.clientHeight+2||node.scrollWidth>node.clientWidth+2}; }); return {width:innerWidth,nodes,failures:nodes.filter(node=>node.outside.length||node.overlap.length||node.internalOverflow)}; })()`);
  const switchLocale = async (locale) => {
    await evaluate(cdp, `(() => { const button=[...document.querySelectorAll('[role=group] button')].find(item=>item.textContent.trim()===${JSON.stringify(locale.toUpperCase())}); if(!button) throw Error('Locale button absent'); button.click(); })()`);
    await waitFor(cdp, `document.documentElement.lang===${JSON.stringify(locale)} && document.querySelector('#paper3-main > [lang]')?.lang===${JSON.stringify(locale)}`, `${locale} locale`);
  };
  const shellLocale = async (locale) => evaluate(cdp, `(() => { const expected=${JSON.stringify(catalog.sections.map(section => section.title[locale]))}; const sidebar=[...document.querySelectorAll('a[href*="/paper-3/sections/"]')].filter(link=>!document.querySelector('#paper3-main').contains(link)).map(link=>({text:link.textContent.replace(/\\s+/g,' ').trim(),href:link.getAttribute('href')})); const topbar=[...document.querySelectorAll('[role=group]')].find(group=>group.getAttribute('aria-label')?.includes('English'))?.parentElement.textContent; return {sidebar,missing:expected.filter(title=>!sidebar.some(link=>link.text.includes(title))),topbar}; })()`);
  const search = async (query) => {
    await evaluate(cdp, `(() => { const input=document.querySelector('#paper3-search'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(input,${JSON.stringify(query)}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await waitFor(cdp, query.trim() ? "document.querySelector('#paper3-results-title')" : "document.querySelector('#paper3-map-title')", `search ${query}`);
    await delay(100);
    return evaluate(cdp, `({ids:${topicRows}.map(item=>item.dataset.topicId),status:document.querySelector('[role=status]')?.textContent,empty:document.querySelector('#paper3-main h3')?.textContent})`);
  };
  const setTheme = async (theme) => {
    await evaluate(cdp, `(() => { localStorage.setItem('theme',${JSON.stringify(theme)}); document.documentElement.classList.toggle('dark',${JSON.stringify(theme)}==='dark'); document.documentElement.classList.toggle('light',${JSON.stringify(theme)}==='light'); document.documentElement.style.colorScheme=${JSON.stringify(theme)}; })()`);
    await delay(100);
  };

  await viewport(cdp, 1440);
  await navigate(cdp, "/paper-3", `${main} && document.querySelector('#paper3-search')`);
  const initial = await evaluate(cdp, `({lang:document.documentElement.lang,contentLang:document.querySelector('#paper3-main > [lang]')?.lang,title:document.querySelector('h1')?.textContent,nodes:${mapNodes}.map(item=>({label:item.textContent,selected:item.getAttribute('aria-pressed')})),facts:${main}.textContent.includes('66'),preparation:${main}.textContent.includes('Lessons, interactive explanations and practice will be added next.'),progress:${main}.querySelectorAll('[role=progressbar]').length})`);
  record("P3-B01", initial.lang === "en" && initial.contentLang === "en" && initial.nodes.length === 8 && initial.nodes.filter(node => node.selected === "true").length === 1 && initial.facts && initial.preparation && initial.progress === 0, "Default English map exposes eight sections and honest planned-content state", initial);
  record("P3-B02", !(await overflow(cdp)).overflow, "Desktop map has no page overflow", await overflow(cdp));
  await screenshot(cdp, "paper3-map-en-light-1440x900.png");
  await axe(cdp, "P3-B03", "Desktop study map has zero serious or critical axe violations");

  await evaluate(cdp, `${mapNodes}.find(item=>/^19/.test(item.textContent.trim())).click()`);
  await waitFor(cdp, `${mapNodes}.some(item=>/^19/.test(item.textContent.trim())&&item.getAttribute('aria-pressed')==='true')`, "section 19 selection");
  const selected = await evaluate(cdp, `({title:document.querySelector('#paper3-selected-title').textContent,detail:document.querySelector('#paper3-section-detail').textContent,links:[...document.querySelectorAll('#paper3-section-detail a')].map(item=>item.getAttribute('href')),activePaths:document.querySelectorAll('path[data-active=true]').length})`);
  record("P3-B04", selected.links.some(link => link === "/paper-3/sections/19?lang=en") && selected.detail.includes("13 topics") && selected.activePaths > 0, "Selecting a section updates context, topic count and relationship emphasis", selected);
  await evaluate(cdp, "document.querySelector('#paper3-map-title').scrollIntoView({block:'start',behavior:'instant'})");
  await waitFor(cdp, "document.querySelector('#paper3-map-title').getBoundingClientRect().top<250", "desktop map scrolled into screenshot");
  await delay(150);
  await screenshot(cdp, "paper3-map-selected19-1440x900.png");
  await evaluate(cdp, `[...document.querySelectorAll('[role=group] button')].find(item=>item.textContent.trim()==='List').click()`);
  await waitFor(cdp, "document.querySelector('[data-view=list]')", "list map view");
  const listed = await evaluate(cdp, `({nodes:${mapNodes}.length,edges:document.querySelectorAll('[data-view=list] svg path[data-active]').length,selected:${mapNodes}.find(item=>item.getAttribute('aria-pressed')==='true')?.textContent})`);
  record("P3-B05", listed.nodes === 8 && listed.edges === 0 && /^19/.test(listed.selected?.trim()), "List view keeps the same eight sections and selected context without graph edges", listed);
  await evaluate(cdp, `[...document.querySelectorAll('[role=group] button')].find(item=>item.textContent.trim()==='Map').click()`);

  const all = await search("P3-");
  record("P3-B06", all.ids.length === 66 && new Set(all.ids).size === 66, "Search reaches all 66 unique catalog previews", { count: all.ids.length, unique: new Set(all.ids).size });
  const floating = await search("floating point");
  const code = await search("13.3");
  const vietnamese = await search("đệ quy");
  const unaccented = await search("de quy");
  const uppercase = await search("ĐỆ QUY");
  record("P3-B07", floating.ids.length >= 1 && code.ids.length === 4 && code.ids.every(id => id.startsWith("P3-13.3-")) && vietnamese.ids.length >= 2 && JSON.stringify(vietnamese.ids) === JSON.stringify(unaccented.ids) && JSON.stringify(vietnamese.ids) === JSON.stringify(uppercase.ids), "English, Vietnamese, uppercase/unaccented terms and syllabus-code search work", { floating, code, vietnamese, unaccented, uppercase });
  const empty = await search("zzzz-no-such-topic-9618");
  await evaluate(cdp, "document.querySelector('button[aria-label=\"Clear search\"]').click()");
  await waitFor(cdp, "document.querySelector('#paper3-map-title')", "cleared search returns map");
  record("P3-B08", empty.ids.length === 0 && empty.empty === "No matching topics yet", "Empty search explains recovery and Clear search restores map", empty);

  await switchLocale("vi");
  const vi = await evaluate(cdp, `({title:document.querySelector('h1').textContent,lang:document.documentElement.lang,nodeCount:${mapNodes}.length,selected:${mapNodes}.find(node=>node.getAttribute('aria-pressed')==='true')?.dataset.sectionId,url:location.href})`);
  record("P3-B09", vi.title.includes("Kết nối kiến thức") && vi.lang === "vi" && vi.nodeCount === 8 && vi.selected === "19" && vi.url.includes("lang=vi"), "Interactive language switch updates map content and URL without losing the selected section", vi);
  const viShell = await shellLocale("vi");
  record("P3-B-SHELL-VI", viShell.missing.length === 0 && viShell.topbar.includes("Lý thuyết nâng cao"), "Vietnamese language switch updates all eight sidebar section names and topbar", viShell);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(cdp, "document.readyState==='complete' && document.querySelector('#paper3-search') && document.documentElement.lang==='vi'", "Vietnamese map refresh");
  await delay(200);
  const viShellRefreshed = await shellLocale("vi");
  record("P3-B-SHELL-VI-REFRESH", viShellRefreshed.missing.length === 0 && viShellRefreshed.topbar.includes("Lý thuyết nâng cao"), "Vietnamese sidebar and topbar remain translated after refresh", viShellRefreshed);
  await evaluate(cdp, `${mapNodes}.find(item=>/^19/.test(item.textContent.trim())).click()`);
  await evaluate(cdp, "document.querySelector('button[data-theme-toggle]').click()");
  await waitFor(cdp, "document.documentElement.classList.contains('dark')", "theme button switches dark");
  const darkTheme = await evaluate(cdp, "({theme:localStorage.getItem('theme'),canvas:getComputedStyle(document.documentElement).getPropertyValue('--alg-surface-canvas').trim(),buttonVisible:document.querySelector('button[data-theme-toggle]').getClientRects().length>0})");
  record("P3-B-THEME", darkTheme.theme === "dark" && darkTheme.canvas && darkTheme.buttonVisible, "Visible desktop theme control switches theme and persists preference", darkTheme);
  await evaluate(cdp, "window.scrollTo(0,0)");
  await delay(300);
  await screenshot(cdp, "paper3-map-vi-dark-1440x900.png");
  await viewport(cdp, 768);
  const tablet = await cardLayout();
  record("P3-B-TABLET", !(await overflow(cdp)).overflow && tablet.failures.length === 0, "Vietnamese map at 768 px has no page or card-content overflow/overlap", tablet);
  await evaluate(cdp, "document.querySelector('#paper3-map-title').scrollIntoView({block:'start',behavior:'instant'})");
  await screenshot(cdp, "paper3-map-vi-dark-768x900.png");
  await viewport(cdp, 320);
  await evaluate(cdp, "document.querySelector('h1').scrollIntoView({block:'start',behavior:'instant'})");
  const mobileCards = await cardLayout();
  record("P3-B-CARDS", mobileCards.failures.length === 0, "Vietnamese map nodes fit their headings, selected labels and metadata at 320 px without overlap", mobileCards);
  record("P3-B10", !(await overflow(cdp)).overflow, "Vietnamese dark map reflows at 320 px", await overflow(cdp));
  await screenshot(cdp, "paper3-map-vi-dark-320x900.png");
  await evaluate(cdp, "document.querySelector('#paper3-map-title').scrollIntoView({block:'start',behavior:'instant'})");
  await waitFor(cdp, "document.querySelector('#paper3-map-title').getBoundingClientRect().top<250", "mobile map scrolled into screenshot");
  await screenshot(cdp, "paper3-map-lower-vi-dark-320x900.png");
  await evaluate(cdp, "document.querySelector('#paper3-section-detail').scrollIntoView({block:'start',behavior:'instant'})");
  await screenshot(cdp, "paper3-map-detail19-vi-dark-320x900.png");
  await axe(cdp, "P3-B11", "Vietnamese mobile map has zero serious or critical axe violations");
  await switchLocale("en");
  const enShell = await shellLocale("en");
  record("P3-B-SHELL-EN", enShell.missing.length === 0 && enShell.topbar.includes("Advanced Theory"), "Switching back to English also refreshes the sidebar and topbar", enShell);
  await setTheme("light");
  await evaluate(cdp, "document.querySelector('h1').scrollIntoView({block:'start',behavior:'instant'})");
  await screenshot(cdp, "paper3-map-en-light-320x900.png");
  record("P3-B12", !(await overflow(cdp)).overflow, "English light map reflows at 320 px", await overflow(cdp));
  const englishCards = await cardLayout();
  record("P3-B-CARDS-EN", englishCards.failures.length === 0, "English map nodes fit their content at 320 px", englishCards);

  await viewport(cdp, 1440);
  await evaluate(cdp, "document.querySelector('#paper3-search').focus()");
  await press(cdp, "Tab", "Tab", 9);
  const focused = await evaluate(cdp, `(() => { const element=document.activeElement; const style=getComputedStyle(element); return {tag:element.tagName,label:element.textContent,focusVisible:element.matches(':focus-visible'),outline:style.outlineStyle,outlineWidth:parseFloat(style.outlineWidth)}; })()`);
  record("P3-B13", focused.tag === "BUTTON" && focused.focusVisible && focused.outline !== "none" && focused.outlineWidth >= 2, "Keyboard Tab reaches map controls with visible focus", focused);
  await screenshot(cdp, "paper3-keyboard-focus-1440x900.png");
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const motion = await evaluate(cdp, `(() => { const duration=value=>Math.max(...value.split(',').map(part=>part.trim().endsWith('ms')?parseFloat(part)/1000:parseFloat(part)||0)); const animated=[...document.querySelectorAll('#paper3-main *')].filter(item=>item.getClientRects().length).map(item=>({tag:item.tagName,transition:getComputedStyle(item).transitionDuration,animation:getComputedStyle(item).animationDuration})).filter(item=>duration(item.transition)>0.001||duration(item.animation)>0.001); return {reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,animated:animated.slice(0,10)}; })()`);
  record("P3-B14", motion.reduced && motion.animated.length === 0, "Reduced-motion preference removes long map transitions", motion);

  await navigate(cdp, "/paper-3/sections/13?lang=vi&context=qa#strand-13-3", "document.querySelector('#strand-13-3')");
  const section = await evaluate(cdp, `({title:document.querySelector('h1').textContent,strands:[...document.querySelectorAll('section[id^=strand-]')].map(item=>item.id),topics:${topicRows}.map(item=>({id:item.dataset.topicId,href:item.getAttribute('href')})),lang:document.documentElement.lang})`);
  record("P3-B15", section.lang === "vi" && JSON.stringify(section.strands) === JSON.stringify(["strand-13-1", "strand-13-2", "strand-13-3"]) && section.topics.length === 11 && section.topics.every(item => item.href.includes("lang=vi")), "Section 13 renders its three strands and eleven planned topics in Vietnamese", section);
  await switchLocale("en");
  const preserved = await evaluate(cdp, "({url:location.href,hash:location.hash,lang:document.documentElement.lang,context:new URLSearchParams(location.search).get('context')})");
  record("P3-B16", preserved.lang === "en" && preserved.context === "qa" && preserved.hash === "#strand-13-3", "Language switching preserves unrelated query parameters and strand hash", preserved);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(cdp, "document.readyState==='complete' && document.querySelector('#strand-13-3') && document.documentElement.lang==='en'", "section refresh");
  record("P3-B17", await evaluate(cdp, "location.hash==='#strand-13-3' && new URLSearchParams(location.search).get('context')==='qa'"), "Deep section URL survives refresh");
  await axe(cdp, "P3-B18", "Section page has zero serious or critical axe violations");
  await viewport(cdp, 320);
  await evaluate(cdp, "window.scrollTo(0,0)");
  record("P3-B19", !(await overflow(cdp)).overflow, "Section layout reflows at 320 px", await overflow(cdp));
  await screenshot(cdp, "paper3-section13-en-light-320x900.png");

  const firstTopic = await evaluate(cdp, "document.querySelector('#paper3-main a[data-topic-id]').getAttribute('href')");
  await evaluate(cdp, "document.querySelector('#paper3-main a[data-topic-id]').click()");
  await waitFor(cdp, "document.querySelector('#topic-preparation-title')", "topic overview navigation");
  const topic = await evaluate(cdp, `({id:document.querySelector('#paper3-main [data-topic-id]')?.dataset.topicId,title:document.querySelector('h1').textContent,state:document.querySelector('#topic-preparation-title').textContent,progress:${main}.querySelectorAll('[role=progressbar]').length,buttons:${main}.querySelectorAll('button').length,breadcrumb:[...document.querySelector('nav[aria-label=Breadcrumb]').querySelectorAll('a')].map(item=>item.getAttribute('href')),url:location.href})`);
  record("P3-B20", topic.id === "P3-13.1-T01" && topic.state === "Lesson in preparation" && topic.progress === 0 && topic.buttons === 0 && topic.breadcrumb.includes("/paper-3/sections/13?lang=en#strand-13-1"), "Topic overview is clearly planned, has no fake progress or active lesson controls, and links to its strand", { ...topic, firstTopic });
  record("P3-B21", !(await overflow(cdp)).overflow, "Topic overview reflows at 320 px", await overflow(cdp));
  await screenshot(cdp, "paper3-topic-overview-en-light-320x900.png");
  await switchLocale("vi");
  record("P3-B22", await evaluate(cdp, "document.querySelector('#topic-preparation-title').textContent==='Bài học đang được biên soạn' && document.documentElement.lang==='vi'"), "Vietnamese topic overview preserves honest unavailable-lesson message");
  await evaluate(cdp, "history.back()");
  await waitFor(cdp, "document.querySelector('#topic-preparation-title')?.textContent==='Lesson in preparation' && document.documentElement.lang==='en'", "history back locale");
  await evaluate(cdp, "history.forward()");
  await waitFor(cdp, "document.querySelector('#topic-preparation-title')?.textContent==='Bài học đang được biên soạn' && document.documentElement.lang==='vi'", "history forward locale");
  record("P3-B23", true, "Back/Forward restores topic locale and content consistently");

  await navigate(cdp, "/paper-3/sections/19?lang=vi", "document.querySelector('#strand-19-1')");
  const graph = await evaluate(cdp, `({topics:${topicRows}.length,links:[...document.querySelectorAll('#paper3-main a[href*="graphs-and-dijkstra"]')].map(item=>({href:item.getAttribute('href'),text:item.textContent}))})`);
  record("P3-B-GRAPH", graph.topics === 13 && graph.links.some(item => item.href === "/paper-3/topics/graphs-and-dijkstra?lang=vi"), "Section 19 links the shared graph ADT to its canonical topic in section 18 without duplicating it", graph);

  await viewport(cdp, 1440);
  for (const route of ["/paper-3/sections/99?lang=en", "/paper-3/topics/no-such-topic?lang=en"]) {
    await navigate(cdp, route, "document.body.innerText.includes('404')");
    const missing = await evaluate(cdp, "({is404:document.body.innerText.includes('404'),topic:Boolean(document.querySelector('#topic-preparation-title')),map:Boolean(document.querySelector('#paper3-map-title'))})");
    record(`P3-B24-${route.includes('sections') ? 'section' : 'topic'}`, missing.is404 && !missing.topic && !missing.map, "Unknown catalog entry shows not-found UI instead of a false lesson", { route, ...missing });
  }
  for (const route of ["/docs", "/paper-4?lang=vi"]) {
    await navigate(cdp, route, "document.querySelector('h1')");
    const regression = await evaluate(cdp, "({title:document.querySelector('h1')?.textContent,lang:document.documentElement.lang,is404:document.body.innerText.includes('This page could not be found'),links:document.querySelectorAll('a').length})");
    record(`P3-B25-${route.startsWith('/docs') ? 'docs' : 'paper4'}`, Boolean(regression.title) && !regression.is404 && regression.links > 0 && (route.startsWith('/docs') || regression.lang === "vi"), "Existing docs/Paper 4 route remains reachable after shared locale integration", { route, ...regression });
  }
}

async function run() {
  await mkdir(EVIDENCE_DIR, { recursive: true });
  const startedAt = new Date().toISOString();
  const candidateFiles = ["content/paper3/study-map.json", "app/components/paper3-learning/StudyMap.tsx", "app/components/paper3-learning/Paper3Shell.tsx", "app/components/paper3-learning/SectionOverview.tsx", "app/components/paper3-learning/TopicPreview.tsx", "app/components/paper3-learning/Paper3Learning.module.css", "app/AppProviders.tsx", "proxy.ts"];
  const candidateHashes = Object.fromEntries(await Promise.all(candidateFiles.map(async file => [file, createHash("sha256").update(await readFile(path.join(ROOT, file))).digest("hex")])));
  const buildId = await exists(path.join(ROOT, ".next/BUILD_ID")) ? (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim() : null;
  const chromePath = await findChrome();
  const debugPort = await freePort();
  const profile = await mkdtemp(path.join(os.tmpdir(), "algocore-paper3-shell-"));
  const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank"], { windowsHide: true, stdio: "ignore" });
  let cdp;
  let browser = chromePath;
  try {
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
    await shellScenarios(cdp);
    record("P3-B-CONSOLE", consoleErrors.length === 0 && runtimeErrors.length === 0, "No runtime exceptions or console errors during scoped browser flows", { consoleErrors, runtimeErrors });
  } catch (error) {
    record("P3-B-INCOMPLETE", false, "Browser gate did not complete", { error: error.stack ?? String(error), consoleErrors, runtimeErrors });
  } finally {
    cdp?.close();
    if (chrome.exitCode === null) { chrome.kill(); await Promise.race([new Promise(resolve => chrome.once("exit", resolve)), delay(1500)]); }
    const resolved = path.resolve(profile);
    const relative = path.relative(path.resolve(os.tmpdir()), resolved);
    if (relative && !relative.startsWith("..") && !path.isAbsolute(relative) && path.basename(resolved).startsWith("algocore-paper3-shell-")) {
      try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* Owned Chrome crashpad may briefly retain a file. */ }
    }
  }
  const failures = checks.filter(check => !check.pass);
  const report = { schema_version: "algocore-paper3-shell-browser-v1", startedAt, completedAt: new Date().toISOString(), buildId, candidateHashes, scope: "Paper 3 UI shell and study map only; no lesson content, learning effectiveness, or deployment certification", decision: failures.length ? "FAIL" : "PASS", browser, base_url: BASE_URL, checks_run: checks.length, checks_passed: checks.length - failures.length, failures, checks };
  await writeFile(path.join(EVIDENCE_DIR, "PAPER3_SHELL_BROWSER_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
  if (failures.length) process.exitCode = 1;
}

await run();
