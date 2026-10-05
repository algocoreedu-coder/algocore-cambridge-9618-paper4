import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axe from "axe-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env.local")); } catch { /* CI may provide credentials. */ }
const base = process.env.PAPER2_BASE_URL ?? "http://127.0.0.1:3042";
const output = path.resolve(process.env.PAPER2_VISUAL_SMOKE_OUT ?? path.join(root, ".codex_tmp/paper2-visual-smoke/VISUAL_BROWSER_SMOKE.json"));
const require = createRequire(import.meta.url);
const playwright = process.env.PLAYWRIGHT_MODULE ?? path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { chromium } = require(playwright);
const executablePath = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(candidate => candidate && existsSync(candidate));
const [visuals, lessonStatus] = await Promise.all([
  readFile(path.join(root, "app/lib/paper2/generated/canonical-visuals.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/lesson-status.json"), "utf8").then(JSON.parse),
]);
const candidate = process.env.PAPER2_VISUAL_SMOKE_ACCESS === "candidate"
  ? lessonStatus.lessons.find(record => record.state === "candidate")
  : undefined;
const checks = [];
const check = (id, pass, detail = null) => checks.push({ id, pass: Boolean(pass), detail });

{
  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  try {
    const login = await context.request.post(`${base}/api/auth/login`, {
      headers: { origin: base, "sec-fetch-site": "same-origin" },
      data: { username: process.env.ALGOCORE_STUDENT_USERNAME, password: process.env.ALGOCORE_STUDENT_PASSWORD, next: "/paper-2?lang=en", lang: "en" },
    });
    check("auth", login.status() === 200, login.status());
    const page = await context.newPage();
    const browserErrors = [];
    let currentAsset = "bootstrap";
    page.on("pageerror", error => browserErrors.push({ asset: currentAsset, type: "pageerror", message: error.message }));
    page.on("console", message => { if (message.type() === "error") browserErrors.push({ asset: currentAsset, type: "console", message: message.text(), location: message.location() }); });
    const rendererRepresentatives = new Map();

    for (const asset of visuals.assets) {
      currentAsset = asset.id;
      const firstVariant = asset.variants[0];
      const firstFrame = firstVariant.frames[0];
      const lastFrame = firstVariant.frames.at(-1);
      const params = new URLSearchParams({ lang: "en", visual: asset.id, variant: firstVariant.id, step: firstFrame.id });
      if (candidate) {
        params.set("topic", candidate.topicId);
        params.set("candidate", candidate.version);
      } else {
        params.set("smoke", "1");
      }
      const url = `${base}/paper-2/review/visuals/${encodeURIComponent(asset.id)}?${params}`;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      const player = page.locator(`[data-paper2-review-harness] [data-paper2-visual="${asset.id}"]`);
      const mounted = response?.status() === 200 && await player.count() === 1;
      check(`${asset.id}:mount`, mounted, response?.status());
      if (!mounted) continue;
      const first = await player.locator("[data-p2-frame]").getAttribute("data-p2-frame");
      const alternative = player.locator("details").first().locator(":scope > div");
      const aria = { labelledby: await player.getAttribute("aria-labelledby"), describedby: await player.getAttribute("aria-describedby") };
      check(`${asset.id}:first-frame`, first === firstFrame.id, { expected: firstFrame.id, actual: first });
      check(`${asset.id}:accessible-alternative`, Boolean(aria.labelledby && aria.describedby) && await alternative.getAttribute("tabindex") === "0" && Boolean(await alternative.getAttribute("aria-labelledby")), aria);
      check(`${asset.id}:no-iframe`, await player.locator("iframe").count() === 0);
      await player.focus();
      await page.keyboard.press("End");
      await page.waitForFunction(expected => document.querySelector("[data-paper2-visual] [data-p2-frame]")?.getAttribute("data-p2-frame") === expected, lastFrame.id);
      check(`${asset.id}:last-frame`, await player.locator("[data-p2-frame]").getAttribute("data-p2-frame") === lastFrame.id, lastFrame.id);
      const layout = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
      check(`${asset.id}:no-page-overflow`, layout.scrollWidth <= layout.clientWidth + 1, layout);
      const sceneType = firstFrame.scene.type;
      if (!rendererRepresentatives.has(sceneType)) rendererRepresentatives.set(sceneType, { asset, firstVariant, firstFrame, url });
    }

    for (const [sceneType, representative] of rendererRepresentatives) {
      await page.goto(representative.url, { waitUntil: "networkidle" });
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(violation => ({ id: violation.id, impact: violation.impact })));
      check(`renderer:${sceneType}:axe`, violations.length === 0, violations);
      const player = page.locator("[data-paper2-visual]");
      await player.focus();
      await page.keyboard.press("End");
      await page.keyboard.press("Home");
      check(`renderer:${sceneType}:keyboard`, await player.locator("[data-p2-frame]").getAttribute("data-p2-frame") === representative.firstFrame.id);
    }

    const reviewUrl = (assetId, variant, step, lang = "en") => {
      const params = new URLSearchParams({ lang, visual: assetId, variant, step });
      if (candidate) {
        params.set("topic", candidate.topicId);
        params.set("candidate", candidate.version);
      } else {
        params.set("smoke", "1");
      }
      return `${base}/paper-2/review/visuals/${encodeURIComponent(assetId)}?${params}`;
    };

    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(reviewUrl("T04-F08", "choice-1", "input", "vi"), { waitUntil: "networkidle" });
    const mobileDiagram = page.locator('[data-paper2-visual="T04-F08"] [data-scene-type="diagram"]');
    const diagramFit = await mobileDiagram.evaluate(element => {
      const svg = element.querySelector("svg");
      const scroller = svg?.parentElement;
      const fit = scroller?.querySelector('button[aria-pressed="true"]');
      const box = scroller?.getBoundingClientRect();
      const svgBox = svg?.getBoundingClientRect();
      return { clientWidth: scroller?.clientWidth ?? 0, scrollWidth: scroller?.scrollWidth ?? 0, boxWidth: box?.width ?? 0, svgWidth: svgBox?.width ?? 0, active: fit?.textContent?.trim() ?? "" };
    }).catch(() => null);
    check("responsive-diagram:mobile-fit-overview", Boolean(diagramFit && diagramFit.svgWidth <= diagramFit.clientWidth + 1 && diagramFit.scrollWidth <= diagramFit.clientWidth + 1), diagramFit);
    const zoomButton = mobileDiagram.getByRole("button", { name: "Phóng to để đọc" });
    check("responsive-diagram:44px-controls", await zoomButton.evaluate(element => element.getBoundingClientRect().height >= 44).catch(() => false));
    await zoomButton.click();
    const diagramZoom = await mobileDiagram.evaluate(element => { const svg = element.querySelector("svg"); const scroller = svg?.parentElement; return { clientWidth: scroller?.clientWidth ?? 0, scrollWidth: scroller?.scrollWidth ?? 0, svgWidth: svg?.getBoundingClientRect().width ?? 0 }; });
    check("responsive-diagram:readable-zoom-scroll", diagramZoom.svgWidth >= 899 && diagramZoom.scrollWidth > diagramZoom.clientWidth, diagramZoom);

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(reviewUrl("T24-S05", "construct", "selection"), { waitUntil: "networkidle" });
    const desktopDiagram = await page.locator('[data-paper2-visual="T24-S05"] [data-scene-type="diagram"]').evaluate(element => { const svg = element.querySelector("svg"); const scroller = svg?.parentElement; return {
      clientWidth: scroller?.clientWidth ?? 0,
      scrollWidth: scroller?.scrollWidth ?? 0,
      svgWidth: svg?.getBoundingClientRect().width ?? 0,
    }; }).catch(() => null);
    check("responsive-diagram:desktop-full-chart", Boolean(desktopDiagram && desktopDiagram.svgWidth <= desktopDiagram.clientWidth + 1 && desktopDiagram.scrollWidth <= desktopDiagram.clientWidth + 1), desktopDiagram);

    await page.goto(reviewUrl("T16-D01", "same-month-same-weekday", "same-month-same-weekday-read-old"), { waitUntil: "networkidle" });
    const textTable = await page.locator('[data-paper2-visual="T16-D01"] details').filter({ hasText: "Diagram as text / table" }).locator("table").evaluate(table => ({
      widths: [...table.querySelectorAll("tbody tr:first-child td")].map(cell => cell.getBoundingClientRect().width),
      clientWidth: table.parentElement?.clientWidth ?? 0,
      scrollWidth: table.parentElement?.scrollWidth ?? 0,
    })).catch(() => null);
    check("text-equivalent:readable-table-columns", Boolean(textTable && textTable.widths.length === 4 && Math.min(...textTable.widths) >= 139), textTable);
    check("browser-errors", browserErrors.length === 0, browserErrors);
  } catch (error) {
    check("run", false, error instanceof Error ? error.stack ?? error.message : String(error));
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  const failures = checks.filter(item => !item.pass);
  const report = {
    schema_version: "paper2-visual-browser-smoke-v1",
    decision: failures.length ? "FAIL" : "PASS",
    generated_at: new Date().toISOString(),
    base_url: base,
    access_mode: candidate ? `candidate:${candidate.topicId}@${candidate.version}` : "authenticated-local-smoke",
    assets_expected: visuals.assets.length,
    assets_checked: checks.filter(item => item.id.endsWith(":mount") && item.pass).length,
    variants_strategy: "First variant, first and last frame for every asset; full keyboard and axe once per scene renderer family; targeted 320px diagram fit/zoom and 1440px T16/T24 readability checks.",
    passed: checks.length - failures.length,
    failed: failures.length,
    failures,
    checks,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ decision: report.decision, assets_checked: report.assets_checked, passed: report.passed, failed: report.failed }, null, 2));
  if (failures.length) process.exitCode = 1;
}
