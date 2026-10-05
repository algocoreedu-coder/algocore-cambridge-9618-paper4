import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env.local")); } catch { /* CI may provide environment variables. */ }
const base = (process.env.PAPER2_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const require = createRequire(import.meta.url);
const playwright = process.env.PLAYWRIGHT_MODULE ?? path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { chromium } = require(playwright);
const axe = require("axe-core");
const executablePath = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((candidate) => candidate && existsSync(candidate));
const status = JSON.parse(await readFile(path.join(root, "content/paper2/lesson-status.json"), "utf8"));
const pilots = status.lessons.filter((record) => ["T08", "T23", "T24", "T30"].includes(record.topicId));
const checks = [];
const failures = [];
const check = (id, condition, detail = null) => { const row = { id, pass: Boolean(condition), detail }; checks.push(row); if (!row.pass) failures.push(row); };
check("four-candidate-records", pilots.length === 4 && pilots.every((record) => record.state === "candidate"), pilots.map(({ topicId, state, version }) => ({ topicId, state, version })));

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
try {
  const deniedBeforeAuth = await context.request.get(`${base}/paper2-visuals/T08.html`, { maxRedirects: 0 });
  check("direct-visual-denied-before-auth", deniedBeforeAuth.status() === 404 && /no-store/.test(deniedBeforeAuth.headers()["cache-control"] ?? ""), {
    status: deniedBeforeAuth.status(),
    cacheControl: deniedBeforeAuth.headers()["cache-control"] ?? null,
  });
  const unauth = await context.request.get(`${base}/paper-2/topics/linear-search?lang=en`, { maxRedirects: 0 });
  check("auth-required", unauth.status() === 307 && new URL(unauth.headers().location, base).pathname === "/login", unauth.status());
  const login = await context.request.post(`${base}/api/auth/login`, { headers: { origin: base, "sec-fetch-site": "same-origin" }, data: { username: process.env.ALGOCORE_STUDENT_USERNAME, password: process.env.ALGOCORE_STUDENT_PASSWORD, next: "/paper-2?lang=en", lang: "en" } });
  check("authenticated", login.status() === 200, login.status());
  const deniedAfterAuth = await context.request.get(`${base}/paper2-visuals/T24.html`);
  check("direct-visual-denied-after-auth", deniedAfterAuth.status() === 404 && /no-store/.test(deniedAfterAuth.headers()["cache-control"] ?? ""), {
    status: deniedAfterAuth.status(),
    cacheControl: deniedAfterAuth.headers()["cache-control"] ?? null,
  });
  const page = await context.newPage();
  for (const record of pilots) {
    const route = `/paper-2/topics/${record.slug}`;
    const publicResponse = await context.request.get(`${base}${route}?lang=en`);
    const publicHtml = await publicResponse.text();
    check(`candidate-not-public:${record.topicId}`, !publicHtml.includes(`data-paper2-lesson="${record.topicId}"`) && !publicHtml.includes("Local candidate"), publicResponse.status());
    const wrongResponse = await context.request.get(`${base}${route}?lang=en&candidate=wrong-revision`);
    check(`wrong-revision-fails-closed:${record.topicId}`, !(await wrongResponse.text()).includes(`data-paper2-lesson="${record.topicId}"`), wrongResponse.status());
    const url = `${base}${route}?lang=en&candidate=${encodeURIComponent(record.version)}`;
    const candidateResponse = await context.request.get(url);
    const html = await candidateResponse.text();
    check(`candidate-response:${record.topicId}`, candidateResponse.status() === 200 && html.includes(`data-paper2-lesson="${record.topicId}"`) && html.includes('data-candidate="true"'), candidateResponse.status());
    const cacheControl = candidateResponse.headers()["cache-control"] ?? "";
    check(`candidate-no-store:${record.topicId}`, /no-store/.test(cacheControl), cacheControl || null);
    await page.goto(url, { waitUntil: "networkidle" });
    check(`six-anchors:${record.topicId}`, await page.locator("#recognise,#understand,#worked-example,#practise,#avoid-lost-marks,#remember").count() === 6);
    check(`candidate-no-progress:${record.topicId}`, await page.locator("[class*=progress] button").count() === 0 && (await page.textContent("body")).includes("does not write learner progress"));
    check(`visual-mounted:${record.topicId}`, await page.locator(`[data-paper2-visual]`).count() === 1, await page.locator(`[data-paper2-visual]`).getAttribute("data-paper2-visual"));
  }

  const t08 = pilots.find((record) => record.topicId === "T08");
  if (t08) {
    await page.goto(`${base}/paper-2/topics/${t08.slug}?lang=en&candidate=${encodeURIComponent(t08.version)}&visual=T08`, { waitUntil: "networkidle" });
    const player = page.locator('[data-paper2-visual="T08"][data-paper2-visual-player="native"]');
    await player.locator('[data-p2-control="next"]').waitFor();
    check("T08-native-no-iframe", await player.locator("iframe").count() === 0);
    check("T08-full-transcript", await player.locator("[data-p2-transcript] li").count() === 17);
    for (let index = 1; index < 17; index += 1) await player.locator('[data-p2-control="next"]').click();
    const returnedValue = await player.locator('[data-key="var-ReturnedValue"]').textContent();
    check("T08-canonical-result4", (await player.locator("[data-p2-variant] option").count()) === 7 && /ReturnedValue\s*=\s*4/.test(returnedValue), returnedValue);
    for (const label of ["Target 42", "First cell", "Two 7s", "Missing 90", "Count 0", "Count 3", "Last active cell"]) check(`T08-variant:${label}`, await player.locator("[data-p2-variant] option", { hasText: label }).count() === 1);
    await player.locator('[data-p2-control="reset"]').click();
    check("T08-reset-first-frame", await player.getAttribute("data-paper2-visual") === "T08" && await player.locator('[data-p2-frame-index="0"]').count() === 1);
    await player.focus(); await page.keyboard.press("End");
    check("T08-keyboard-end", await player.locator('[data-p2-frame-index="16"]').count() === 1);
  }

  const t24 = pilots.find((record) => record.topicId === "T24");
  if (t24) {
    await page.goto(`${base}/paper-2/topics/${t24.slug}?lang=en&candidate=${encodeURIComponent(t24.version)}&visual=T24-S01`, { waitUntil: "networkidle" });
    const player = page.locator('[data-paper2-visual="T24-S01"][data-paper2-visual-player="native"]');
    await player.locator('[data-p2-control="next"]').waitFor();
    await player.locator('[data-p2-control="next"]').click(); await player.locator('[data-p2-control="next"]').click();
    check("T24-open-data-couple", await player.locator('[data-mark-type="data-couple"] circle.data-couple').count() >= 1);
    check("T24-filled-control-couple", await player.locator('[data-mark-type="control-couple"] circle.control-couple').count() >= 1);
    const playerText = await player.textContent();
    check("T24-text-equivalent", playerText.includes("Data couple, hollow circle") && playerText.includes("Control couple, filled circle") && playerText.includes("sender/source") && playerText.includes("receiver/target"));
    const frameBeforePan = await player.locator("[data-p2-frame]").getAttribute("data-p2-frame-index");
    await player.locator('[data-scene-type="diagram"] [role="region"]').first().focus(); await page.keyboard.press("ArrowRight");
    check("T24-diagram-arrow-does-not-change-frame", await player.locator("[data-p2-frame]").getAttribute("data-p2-frame-index") === frameBeforePan);
    await page.setViewportSize({ width: 320, height: 900 });
    const diagramLayout = await player.locator('[data-scene-type="diagram"] [role="region"]').first().evaluate((node) => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth, pageWidth: document.documentElement.clientWidth, pageScrollWidth: document.documentElement.scrollWidth }));
    check("T24-mobile-diagram-scroll-contained", diagramLayout.scrollWidth > diagramLayout.clientWidth && diagramLayout.pageScrollWidth <= diagramLayout.pageWidth + 1, diagramLayout);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/paper-2/topics/${t24.slug}?lang=en&candidate=${encodeURIComponent(t24.version)}&visual=T24-S03&variant=area&step=parameters`, { waitUntil: "networkidle" });
    const selectionText = await page.locator('[data-paper2-visual="T24-S03"] details').first().textContent();
    check("T24-selection-explicit-couple-endpoints", selectionText.includes("sender/source Calculate rectangle result → receiver/target Calculate area") && selectionText.includes("sender/source Calculate area → receiver/target Calculate rectangle result"), selectionText.slice(0, 1200));
  }

  const t23 = pilots.find((record) => record.topicId === "T23");
  if (t23) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/paper-2/topics/${t23.slug}?lang=en&candidate=${encodeURIComponent(t23.version)}&visual=T23-X01`, { waitUntil: "networkidle" });
    const player = page.locator('[data-paper2-visual="T23-X01"][data-paper2-visual-player="native"]');
    await player.locator('[data-p2-control="next"]').waitFor();
    for (let index = 0; index < 4; index += 1) await player.locator('[data-p2-control="next"]').click();
    check("T23-integration-checkpoint", /Integrating\s*=\s*true/.test(await player.locator('[data-key="var-Integrating"]').textContent()), await player.locator('[data-key="var-Integrating"]').textContent());
    await player.locator('[data-p2-control="next"]').click();
    check("T23-maintenance-follows-integration", /Maintenance/.test(await player.locator('[data-key="var-TeamStages"]').textContent()), await player.locator('[data-key="var-TeamStages"]').textContent());
    await player.locator('[data-p2-control="reset"]').click();
    check("T23-reset", await player.locator('[data-p2-frame-index="0"]').count() === 1);
  }

  const t30 = pilots.find((record) => record.topicId === "T30");
  if (t30) {
    await page.goto(`${base}/paper-2/topics/${t30.slug}?lang=en&candidate=${encodeURIComponent(t30.version)}&visual=T30`, { waitUntil: "networkidle" });
    const player = page.locator('[data-paper2-visual="T30"][data-paper2-visual-player="native"]');
    await player.locator('[data-p2-control="next"]').waitFor();
    await player.focus(); await page.keyboard.press("End");
    check("T30-abnormal-not-sentinel", await player.locator('[data-key="domain-value"]').textContent() === "-2" && /Input\s*=\s*-2/.test(await player.locator('[data-key="var-Input"]').textContent()), {
      value: await player.locator('[data-key="domain-value"]').textContent(),
      input: await player.locator('[data-key="var-Input"]').textContent(),
    });
    await player.locator('[data-p2-control="reset"]').click();
    check("T30-reset-to-sentinel", await player.locator('[data-key="domain-value"]').textContent() === "-1");
    const endpointLayout = await player.locator('[data-domain-edge="max"]').evaluate((node) => ({
      text: node.textContent,
      whiteSpace: getComputedStyle(node).whiteSpace,
      height: node.getBoundingClientRect().height,
      fontSize: Number.parseFloat(getComputedStyle(node).fontSize),
    }));
    check("T30-domain-max-single-line", endpointLayout.text === "12" && endpointLayout.whiteSpace === "nowrap" && endpointLayout.height <= endpointLayout.fontSize * 1.8, endpointLayout);
    for (const colorScheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.addScriptTag({ content: axe.source });
      const result = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.filter((violation) => violation.id === "color-contrast"));
      check(`T30-domain-contrast-${colorScheme}`, result.length === 0, result);
    }
  }

  const harnessCandidate = pilots.find((record) => record.topicId === "T08");
  if (harnessCandidate) {
    const closedHarness = await context.request.get(`${base}/paper-2/review/visuals/T04-F01?lang=en`);
    check("review-harness-requires-candidate-gate", closedHarness.status() === 404, closedHarness.status());
    const harnessUrl = `${base}/paper-2/review/visuals/T04-F01?lang=en&topic=${harnessCandidate.topicId}&candidate=${encodeURIComponent(harnessCandidate.version)}`;
    const harnessResponse = await context.request.get(harnessUrl);
    check("review-harness-no-store", harnessResponse.status() === 200 && /no-store/.test(harnessResponse.headers()["cache-control"] ?? ""), {
      status: harnessResponse.status(),
      cacheControl: harnessResponse.headers()["cache-control"] ?? null,
    });
    await page.goto(harnessUrl, { waitUntil: "networkidle" });
    const player = page.locator('[data-paper2-review-harness] [data-paper2-visual="T04-F01"][data-paper2-visual-player="native"]');
    await player.locator('[data-p2-control="next"]').waitFor();
    check("T04-native-diagram-mounted", await player.locator('[data-scene-type="diagram"] svg').count() === 1 && await player.locator("iframe").count() === 0);
    check("T04-full-symbol-transcript", await player.locator("[data-p2-transcript] li").count() === 5);
    await player.focus(); await page.keyboard.press("End");
    const textEquivalent = await player.locator("details").first().textContent();
    check("T04-arrow-endpoints-in-text", /sender\/source/.test(textEquivalent) && /receiver\/target/.test(textEquivalent), textEquivalent.slice(0, 500));
    const textRegion = player.locator("details").first().locator(":scope > div");
    check("T04-text-equivalent-keyboard-scroll", await textRegion.getAttribute("tabindex") === "0" && Boolean(await textRegion.getAttribute("aria-labelledby")));
    check("review-harness-single-main-heading", await page.locator("main").count() === 1 && await page.locator("h1").count() === 1);
    await page.addScriptTag({ content: axe.source });
    const harnessAxe = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations);
    check("review-harness-axe", harnessAxe.length === 0, harnessAxe);
  }

  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (!pilots[0]) break;
    const record = pilots[0];
    await page.goto(`${base}/paper-2/topics/${record.slug}?lang=vi&candidate=${encodeURIComponent(record.version)}`, { waitUntil: "networkidle" });
    const layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, lang: document.documentElement.lang, practiceColumns: getComputedStyle(document.querySelector('[class*="practiceGrid"]')).gridTemplateColumns.split(" ").filter(Boolean).length, controls: [...document.querySelectorAll("button,select")].filter((node) => node.getClientRects().length > 0).map((node) => { const box = node.getBoundingClientRect(); return { width: box.width, height: box.height }; }) }));
    check(`responsive:${width}`, layout.scrollWidth <= layout.width + 1 && layout.lang === "vi" && layout.controls.every((control) => control.width >= 40 && control.height >= 40), layout);
    if (width === 768) check("practice-single-column:768", layout.practiceColumns === 1, layout.practiceColumns);
    if (width === 320) {
      const codeRegion = page.locator('[class*="codePanel"] > ol').first();
      check("pseudocode-keyboard-scroll:320", await codeRegion.getAttribute("tabindex") === "0" && Boolean(await codeRegion.getAttribute("aria-label")));
    }
  }

  if (pilots[0]) {
    const record = pilots[0];
    const url = `${base}/paper-2/topics/${record.slug}?lang=en&candidate=${encodeURIComponent(record.version)}`;
    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto(url, { waitUntil: "networkidle" });
    const reflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      visualRegions: [...document.querySelectorAll('[data-paper2-visual] [role="region"]')].map((node) => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth })),
    }));
    check("lesson-reflow-200-percent-equivalent", reflow.scrollWidth <= reflow.clientWidth + 1 && reflow.visualRegions.every((region) => region.scrollWidth >= region.clientWidth), reflow);

    for (const colorScheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.addScriptTag({ content: axe.source });
      const result = await page.evaluate(async () => {
        const report = await window.axe.run(document, { resultTypes: ["violations"] });
        return report.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })),
        }));
      });
      check(`axe-${colorScheme}`, result.length === 0, result);
      const colors = await page.locator("body").evaluate((node) => ({ color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor }));
      check(`theme-rendered-${colorScheme}`, colors.color !== colors.background && colors.color !== "rgba(0, 0, 0, 0)" && colors.background !== "rgba(0, 0, 0, 0)", colors);
    }
  }
} catch (error) {
  check("browser-run", false, error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  await context.close();
  await browser.close();
}

console.log(JSON.stringify({ schema_version: "paper2-pilot-browser-gate-v2", decision: failures.length ? "FAIL" : "PASS", base_url: base, passed: checks.length - failures.length, total: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
