import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = (process.env.PAPER4_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const ROUTE_FILTER = process.env.PAPER4_ROUTE_FILTER?.trim() || null;
const REPORT_PATH = process.env.PAPER4_BROWSER_REPORT?.trim()
  ? path.resolve(process.env.PAPER4_BROWSER_REPORT.trim())
  : null;
const DEBUG = process.env.PAPER4_QA_DEBUG === "1";
const manifest = JSON.parse(await readFile(path.join(ROOT, "app/data/paper4-v2/course-manifest.json"), "utf8"));
const lessonDtos = new Map(await Promise.all(manifest.lessons.map(async ({ slug }) => [
  slug,
  JSON.parse(await readFile(path.join(ROOT, `app/data/paper4-v2/lessons/${slug}.json`), "utf8")),
])));
const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const expectedStages = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"];
const authoredSlugs = new Set(manifest.lessons.map((lesson) => lesson.slug));

// Inspect learner-visible text and accessibility text only. Stable data-* hooks are test metadata.
const internalOrGovernance = /ac-9618-|paper4\.section\.|\bSYL-|\bBOOK-|\bP4H-|\.production-v\d+\.L\d+|\b(?:fixture|pattern|scenario|event|knowledge_unit|marking_chain|assessment_item)_id\b|\b(?:schema|disposition|authority)[-_ ]?(?:field|status|version)?\b|SHA-?256|\bbuild id\b|\bauthor[-_ ]run\b|\bindependent[-_ ]rerun\b|\brelease status\b|\b(?:candidate (?:build|release|status)|release candidate)\b|\bfrozen status\b|\bagent history\b|\bverified Python\b|\bverified (?:python )?source\b|\bsource (?:has been )?verified\b|Python đã kiểm chứng|trace đã kiểm chứng/i;
const pendingPlaceholder = /PendingLearnerProjection|being prepared|content is being prepared|đang được biên soạn|đang chuẩn bị nội dung|bài học đang được chuẩn bị/i;
const protectMetadata = /\bQP\s*[/\\-]?\s*MS\b|\bmark[- ]scheme locator\b|\bquestion[-_ ]paper locator\b|\baward_semantics\b|\bdisposition\b|\bgroup\s*=|\b(?:error|misconception)[-_ ]?(?:id|ref)\b|\bP4E-[A-Z0-9-]+\b|\b9618\/[24]\d\/(?:s|w|m)\/(?:f\/m|m\/j|o\/n)\/\d{2}\b/i;
const rawJson = /(?:^|\s)[{[]\s*"[A-Za-z_][\w-]*"\s*:|"[A-Za-z_][\w-]*"\s*:\s*(?:"|\d|true|false|null|[{[])/i;

const env = {};
for (const line of (await readFile(path.join(ROOT, ".env.local"), "utf8")).split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}
const username = process.env.ALGOCORE_STUDENT_USERNAME ?? env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.ALGOCORE_STUDENT_PASSWORD ?? env.ALGOCORE_STUDENT_PASSWORD;
if (!username || !password) throw new Error("Student credentials are not configured for browser QA.");

async function findChrome() {
  for (const candidate of chromeCandidates) {
    try { await access(candidate); return candidate; } catch { /* try next */ }
  }
  throw new Error("No local Chrome or Edge executable is available.");
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => { const address = server.address(); server.close(() => resolve(address.port)); });
  });
}

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); }
  async open() {
    await new Promise((resolve, reject) => { this.socket.addEventListener("open", resolve, { once: true }); this.socket.addEventListener("error", reject, { once: true }); });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`)); else pending.resolve(message.result);
    });
  }
  send(method, params = {}) { const id = this.nextId++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject, method }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  close() { this.socket.close(); }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "Browser evaluation failed");
  return result.result.value;
}
async function waitFor(cdp, expression, label, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) { if (await evaluate(cdp, `Boolean(${expression})`)) return; await delay(100); }
  throw new Error(`Timed out waiting for ${label}`);
}
async function navigate(cdp, url) {
  await cdp.send("Page.navigate", { url });
  await waitFor(cdp, `document.readyState === "complete" && document.querySelector('[data-paper4-lesson][data-content-state="ready"]')`, url);
  await delay(150);
}

function normalizeText(text) { return String(text ?? "").replace(/\s+/g, " ").trim(); }
async function activateStage(cdp, stageIndex) {
  const target = expectedStages[stageIndex];
  const result = await evaluate(cdp, `(() => {
    const target = ${JSON.stringify(target)};
    const index = ${stageIndex};
    const stage = document.querySelector('[data-learner-stage="' + target + '"]');
    if (stage && !stage.hidden && stage.getAttribute('data-stage-state') === 'current') return 'already-current';
    const canonical = document.querySelector('[data-canonical-lesson-journey]');
    if (canonical) return 'canonical-sequential';
    const slug = document.querySelector('[data-learner-journey]')?.getAttribute('data-lesson-slug');
    if (!slug) return 'no-control';
    sessionStorage.setItem('algocore.paper4.learner.' + slug + '.stage.v1', target);
    const url = new URL(location.href);
    url.searchParams.set('__qa_stage', target);
    url.hash = 'stage-' + target;
    return 'custom-reload:' + url.href;
  })()`);
  if (result === "no-control") return false;
  if (result.startsWith("custom-reload:")) {
    await cdp.send("Page.navigate", { url: result.slice("custom-reload:".length) });
    try {
      await waitFor(cdp, `document.readyState === "complete" && document.querySelector('[data-paper4-lesson][data-content-state="ready"]')`, `reload for stage ${target}`, 10000);
    } catch { return false; }
  }
  if (result === "canonical-sequential") {
    for (let step = 0; step < stageIndex; step += 1) {
      const currentIndex = await evaluate(cdp, `(() => [...document.querySelectorAll('[data-learner-stage]')].findIndex((stage) => !stage.hidden && stage.getAttribute('data-stage-state') === 'current'))()`);
      if (currentIndex >= stageIndex) break;
      const gate = await evaluate(cdp, `document.querySelector('[data-learner-stage]:not([hidden]) [data-exit-gate]')?.getAttribute('data-exit-gate') ?? null`);
      if (gate === "prediction") {
        try {
          await waitFor(cdp, `document.querySelector('[data-learner-stage="trace"] input[type="radio"], [data-learner-stage="trace"] input:not([type]), [data-learner-stage="trace"] input[type="text"], [data-learner-stage="trace"] textarea')`, "trace prediction control", 5000);
        } catch { return false; }
        await evaluate(cdp, String.raw`(() => {
          const stage = document.querySelector('[data-learner-stage="trace"]');
          const radio = stage?.querySelector('input[type="radio"]');
          if (radio) radio.click();
          else {
            const field = stage?.querySelector('input:not([type]), input[type="text"], textarea');
            if (field) {
              const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
              Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, 'QA prediction');
              field.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        })()`);
        await delay(50);
        await evaluate(cdp, `(() => {
          const stage = document.querySelector('[data-learner-stage="trace"]');
          const formButton = stage?.querySelector('form button[type="submit"], form button:not([type])');
          const fallbackButton = stage?.querySelector('[data-reasoning-trace] button:not([aria-pressed]):not([disabled]), [data-fallback-trace] button:not([aria-pressed]):not([disabled])');
          (formButton ?? fallbackButton)?.click();
        })()`);
        try { await waitFor(cdp, `!document.querySelector('[data-learner-stage="trace"] [data-exit-gate="prediction"]')?.disabled`, "trace exit gate", 5000); } catch { return false; }
      } else if (gate === "attempt") {
        await evaluate(cdp, `document.querySelector('[data-learner-stage="practise"] details[data-canonical-practice-item]')?.setAttribute('open','')`);
        await evaluate(cdp, String.raw`(() => {
          const card = document.querySelector('[data-learner-stage="practise"] details[data-canonical-practice-item]');
          const field = card?.querySelector('textarea, input[type="text"], input:not([type])');
          if (!field) return;
          const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, 'QA practice attempt');
          field.dispatchEvent(new Event('input', { bubbles: true }));
        })()`);
        await delay(50);
        await evaluate(cdp, `document.querySelector('[data-learner-stage="practise"] details[data-canonical-practice-item] button:not([disabled])')?.click()`);
        try { await waitFor(cdp, `!document.querySelector('[data-learner-stage="practise"] [data-exit-gate="attempt"]')?.disabled`, "practice exit gate", 3000); } catch { return false; }
      }
      const advanced = await evaluate(cdp, `(() => { const button = document.querySelector('[data-learner-stage]:not([hidden]) [data-exit-gate]'); if (!button || button.disabled) return false; button.click(); return true; })()`);
      if (!advanced) return false;
      await delay(75);
    }
  }
  try {
    await waitFor(cdp, `(() => { const stage = document.querySelector('[data-learner-stage="${target}"]'); return stage && !stage.hidden && stage.getAttribute('data-stage-state') === 'current'; })()`, `stage ${target}`, result === "canonical-sequential" ? 3000 : 10000);
  } catch { return false; }
  await delay(100);
  return true;
}

async function inspectActiveSurface(cdp, source) {
  return await evaluate(cdp, String.raw`(() => {
    const visible = (node) => {
      if (!(node instanceof Element)) return false;
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
    };
    const journey = document.querySelector('[data-learner-journey="six-stage"]');
    const active = journey?.querySelector('[data-learner-stage]:not([hidden])') ?? journey;
    const visibleNodes = active ? [...active.querySelectorAll('*')].filter(visible) : [];
    const accessibility = visibleNodes.flatMap((node) => ['aria-label','title','alt','placeholder'].map((key) => node.getAttribute(key)).filter(Boolean)).join(' ');
    const visibleText = (active?.innerText ?? '').replace(/\s+/g, ' ').trim();
    const proseText = visibleNodes.filter((node) => !node.closest('pre, code')).map((node) => node.children.length > 0 ? '' : node.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();
    const fullSource = ${JSON.stringify(source)}.replace(/\r\n/g, '\n').trim();
    const codeBlocks = visibleNodes.filter((node) => node.matches('pre, pre code')).map((node) => ({
      text: (node.innerText ?? node.textContent ?? '').replace(/\r\n/g, '\n').trim(),
      detailsOpen: node.closest('details')?.open ?? false,
    }));
    const fullCodeLeak = codeBlocks.some((item) => item.text === fullSource && !item.detailsOpen);
    return { visibleText, proseText, accessibility, fullCodeLeak };
  })()`);
}

const chromePath = await findChrome();
const debugPort = await freePort();
const profile = await mkdtemp(path.join(os.tmpdir(), "paper4-lesson-gap-"));
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--disable-extensions", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
const failures = [];
const rows = [];
let cdp;

try {
  let page;
  for (let attempt = 0; attempt < 100 && !page; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(`${BASE_URL}/login`)}`, { method: "PUT" });
      if (response.ok) page = await response.json();
    } catch { /* browser is starting */ }
    if (!page) await delay(100);
  }
  if (!page) throw new Error("Chrome DevTools endpoint did not start.");
  cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.open();
  await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable")]);
  await cdp.send("Page.navigate", { url: `${BASE_URL}/login` });
  await waitFor(cdp, `document.readyState === "complete" && location.origin === ${JSON.stringify(BASE_URL)}`, "login page");
  const login = await evaluate(cdp, `(async () => { const response = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(${JSON.stringify({ username, password, next: "/paper-4", lang: "en" })}) }); return { ok:response.ok, status:response.status }; })()`);
  if (!login.ok) throw new Error(`Browser QA login failed with status ${login.status}.`);

  for (const lesson of manifest.lessons.filter((item) => !ROUTE_FILTER || item.slug === ROUTE_FILTER)) {
    const dto = lessonDtos.get(lesson.slug);
    const source = [...dto.python.lines].sort((a, b) => a.order - b.order).map((line) => line.text).join("\n");
    for (const locale of ["en", "vi"]) {
      const route = `/paper-4/lessons/${lesson.slug}?lang=${locale}`;
      console.error(`[paper4 lesson-gap browser QA] ${route}`);
      await evaluate(cdp, `(() => { try { sessionStorage.clear(); } catch { /* transient opaque document during navigation */ } return true; })()`);
      await navigate(cdp, `${BASE_URL}${route}`);
      const result = await evaluate(cdp, String.raw`(() => {
        const page = document.querySelector('[data-paper4-lesson][data-content-state="ready"]');
        const journey = document.querySelector('[data-learner-journey="six-stage"]');
        const stageNodes = [...document.querySelectorAll('[data-learner-journey="six-stage"] [data-learner-stage]')];
        const stages = stageNodes.map((item) => item.getAttribute('data-learner-stage'));
        const states = stageNodes.map((item) => item.getAttribute('data-stage-state'));
        const visible = stageNodes.filter((item) => !item.hidden && item.getAttribute('aria-hidden') !== 'true');
        const nav = journey?.querySelector('[data-stage-navigation]');
        const navControls = nav ? [...nav.querySelectorAll('button, a')].filter((control) => control.getClientRects().length > 0) : [];
        const futureDisabled = navControls.slice(1).every((control) => control.matches('button') && control.disabled);
        const allText = (document.body.innerText ?? '').replace(/\s+/g,' ');
        return {
          slug: page?.getAttribute('data-paper4-lesson'), locale: page?.getAttribute('data-locale'), stages, states,
          visibleStages: visible.map((item) => item.getAttribute('data-learner-stage')),
          navCount: navControls.length, futureDisabled,
          units: Number(journey?.getAttribute('data-knowledge-unit-count') ?? 0), pending: ${pendingPlaceholder}.test(allText),
        };
      })()`);
      const problems = [];
      if (result.slug !== lesson.slug) problems.push(`slug=${result.slug}`);
      if (result.locale !== locale) problems.push(`locale=${result.locale}`);
      if (JSON.stringify(result.stages) !== JSON.stringify(expectedStages)) problems.push(`stages=${JSON.stringify(result.stages)}`);
      if (result.units < 1) problems.push("knowledge-unit count missing");
      if (result.pending) problems.push("pending-placeholder-visible");
      if (authoredSlugs.has(lesson.slug)) {
        if (JSON.stringify(result.states) !== JSON.stringify(["current", "locked", "locked", "locked", "locked", "locked"])) problems.push(`initial-stage-states=${JSON.stringify(result.states)}`);
        if (JSON.stringify(result.visibleStages) !== JSON.stringify(["recognise"])) problems.push(`initial-visible-stages=${JSON.stringify(result.visibleStages)}`);
        if (result.navCount !== 6) problems.push(`stage-nav-controls=${result.navCount}`);
        if (!result.futureDisabled) problems.push("future-stage-controls-not-locked");
      }

      // Every route now has a Teacher-authored six-stage projection, so every locale receives
      // the same deep interaction walk instead of the former canonical-fallback sample.
      const stageIndices = authoredSlugs.has(lesson.slug) ? expectedStages.map((_, index) => index) : [0];
      for (const stageIndex of stageIndices) {
        const activated = await activateStage(cdp, stageIndex);
        if (DEBUG) console.error(`  stage=${expectedStages[stageIndex]} activated=${activated}`);
        if (!activated) { problems.push(`cannot-activate-stage=${expectedStages[stageIndex]}`); continue; }
        const surface = await inspectActiveSurface(cdp, source);
        const combined = normalizeText(`${surface.visibleText} ${surface.accessibility}`);
        const internalMatch = combined.match(internalOrGovernance)?.[0] ?? null;
        const rawMatch = surface.proseText.match(rawJson)?.[0] ?? null;
        if (internalMatch) problems.push(`${expectedStages[stageIndex]}:internal-or-governance=${internalMatch}`);
        if (rawMatch) {
          const rawIndex = surface.proseText.search(rawJson);
          const context = normalizeText(surface.proseText.slice(Math.max(0, rawIndex - 50), rawIndex + rawMatch.length + 90));
          problems.push(`${expectedStages[stageIndex]}:raw-json=${context}`);
        }
        if (surface.fullCodeLeak) problems.push(`${expectedStages[stageIndex]}:full-code-visible-without-open-disclosure`);

        if (expectedStages[stageIndex] === "trace" && authoredSlugs.has(lesson.slug)) {
          const trace = await evaluate(cdp, String.raw`(() => {
            const stage = document.querySelector('[data-learner-stage="trace"]');
            const runtime = stage?.querySelector('[data-testid="paper4-visual-lab"]');
            const fallback = stage?.querySelector('[data-reasoning-trace], [data-fallback-trace]');
            const dedicated = stage?.querySelector('[data-active-learning-question], form, [data-scene], [data-trace-step], [data-testid]:not([data-testid="paper4-visual-lab"])');
            const caseKind = runtime?.getAttribute('data-case-kind') ?? null;
            const fullDetails = [...(stage?.querySelectorAll('details') ?? [])].filter((details) => details.querySelector('pre code'));
            const alert = stage?.querySelector('[role="alert"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? null;
            return { hasRuntime: Boolean(runtime), hasFallback: Boolean(fallback), hasDedicated: Boolean(dedicated), caseKind, alert, exposedFullCode: fullDetails.some((details) => details.open) };
          })()`);
          if (!trace.hasRuntime && !trace.hasFallback && !trace.hasDedicated) problems.push("trace:learner-surface-missing");
          if (trace.hasRuntime && trace.caseKind && trace.caseKind !== "normal") problems.push(`trace:initial-case=${trace.caseKind}; expected=normal`);
          if (trace.alert) problems.push(`trace:runtime-alert=${trace.alert}`);
          if (trace.exposedFullCode) problems.push("trace:full-code-disclosure-open-by-default");
        }

        if (expectedStages[stageIndex] === "protectMarks") {
          const protectMatch = combined.match(protectMetadata)?.[0] ?? null;
          if (protectMatch) problems.push(`protectMarks:forbidden-metadata=${protectMatch}`);
        }
      }

      rows.push({ route, authored: authoredSlugs.has(lesson.slug), units: result.units, pass: problems.length === 0 });
      if (problems.length) failures.push(`${route}: ${[...new Set(problems)].join(", ")}`);
    }
  }

  const enUnits = rows.filter((row) => row.route.endsWith("lang=en")).reduce((sum, row) => sum + row.units, 0);
  if (!ROUTE_FILTER && enUnits !== 108) failures.push(`English rendered knowledge-unit total is ${enUnits}; expected 108.`);
  const report = {
    decision: failures.length ? "FAIL" : "PASS", routes: rows.length,
    authoredLocaleRoutes: rows.filter((row) => row.authored).length,
    englishKnowledgeUnits: enUnits,
    checks: ["52-route topology and initial surface", "Teacher-authored six-stage interaction", "initial lock state", "visual/dedicated/reasoning trace surface", "learner-surface metadata", "Protect Marks metadata", "focused-code disclosure", "pending placeholder"],
    failures,
  };
  if (REPORT_PATH) {
    await mkdir(path.dirname(REPORT_PATH), { recursive: true });
    await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  cdp?.close();
  chrome.kill();
  await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), delay(1500)]);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try { await rm(profile, { recursive: true, force: true }); break; }
    catch (error) { if (error?.code !== "EBUSY" || attempt === 4) throw error; await delay(200); }
  }
}
