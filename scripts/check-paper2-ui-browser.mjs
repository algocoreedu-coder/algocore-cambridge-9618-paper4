import { createRequire } from "node:module";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import axe from "axe-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env.local")); } catch { /* CI can provide auth. */ }
const base = process.env.PAPER2_BASE_URL ?? "http://127.0.0.1:3042";
const out = path.resolve(process.env.PAPER2_QA_OUT ?? path.join(root, ".codex_tmp/paper2-ui"));
const buildDistDir = process.env.PAPER2_BUILD_DIST_DIR ?? ".next";
const expectedBuildId = process.env.PAPER2_EXPECTED_BUILD_ID?.trim() || null;
const buildIdPattern = /^[A-Za-z0-9_-]{8,128}$/;
const artifactBuildId = (await readFile(path.join(root, buildDistDir, "BUILD_ID"), "utf8").catch(() => "")).trim() || null;
const require = createRequire(import.meta.url);
const playwright = process.env.PLAYWRIGHT_MODULE ?? path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { chromium } = require(playwright);
const executablePath = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => p && existsSync(p));
const [catalog, lessonStatus, evidenceLock] = await Promise.all([
  readFile(path.join(root, "content/paper2/study-map.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/lesson-status.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "app/lib/paper2/generated/evidence-lock.json"), "utf8").then(JSON.parse),
]);
const approvedByTopic = new Map(evidenceLock.records.filter(record => record.approved).map(record => [record.topicId, record]));
const reviewedTopicIds = new Set(lessonStatus.lessons.filter(record => {
  const lock = approvedByTopic.get(record.topicId);
  return record.state === "reviewed" && lock
    && lock.version === record.version
    && lock.contentSha256 === record.contentSha256
    && lock.visualManifestSha256 === record.visualManifestSha256
    && lock.visualSemanticSha256 === record.visualSemanticSha256
    && lock.visualRuntimeSha256 === record.visualRuntimeSha256;
}).map(record => record.topicId));
const plannedTopic = catalog.topics.find(topic => !reviewedTopicIds.has(topic.id));
const topicIsReady = topic => reviewedTopicIds.has(topic.id);
const reviewedTopic = catalog.topics.find(topicIsReady);
const candidateRecord = lessonStatus.lessons.find(record => record.state === "candidate" && catalog.topics.some(topic => topic.id === record.topicId));
const candidateTopic = candidateRecord ? catalog.topics.find(topic => topic.id === candidateRecord.topicId) : undefined;
await mkdir(out, { recursive: true });
const checks = [], screenshots = [], browserErrors = [];
function check(id, pass, detail = null) { checks.push({ id, pass: Boolean(pass), detail }); }
check("expected-build-id-required", Boolean(expectedBuildId && buildIdPattern.test(expectedBuildId)), { expectedBuildId });
check("artifact-build-id-binding", Boolean(expectedBuildId && artifactBuildId === expectedBuildId), { expectedBuildId, artifactBuildId, buildDistDir });
const browser = await chromium.launch({ executablePath, headless: true });
let context;
let servedBuildId = null;
try {
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const unauth = await context.request.get(`${base}/paper-2/sections/12.2?lang=vi`, { maxRedirects: 0 });
  const redirect = new URL(unauth.headers().location, base);
  check("unauthenticated-deep-link", unauth.status() === 307 && redirect.pathname === "/login" && redirect.searchParams.get("next") === "/paper-2/sections/12.2?lang=vi");
  const unauthBuild = await context.request.get(`${base}/paper-2/build-id`, { maxRedirects: 0 });
  check("unauthenticated-build-id-protected", unauthBuild.status() === 307 && new URL(unauthBuild.headers().location, base).pathname === "/login", { status: unauthBuild.status() });
  const login = await context.request.post(`${base}/api/auth/login`, {
    headers: { origin: base, "sec-fetch-site": "same-origin" },
    data: { username: process.env.ALGOCORE_STUDENT_USERNAME, password: process.env.ALGOCORE_STUDENT_PASSWORD, next: "/paper-2?lang=en", lang: "en" },
  });
  if (login.status() !== 200) throw new Error(`Local test login failed: HTTP ${login.status()}; credentials omitted.`);
  check("login-return-paper2", (await login.json()).redirectTo === "/paper-2?lang=en");
  const buildResponse = await context.request.get(`${base}/paper-2/build-id`);
  const buildDocument = buildResponse.status() === 200 ? await buildResponse.json().catch(() => null) : null;
  servedBuildId = typeof buildDocument?.buildId === "string" ? buildDocument.buildId : null;
  check("served-build-id-binding", buildResponse.status() === 200 && Boolean(expectedBuildId) && servedBuildId === expectedBuildId && servedBuildId === artifactBuildId, {
    status: buildResponse.status(), expectedBuildId, artifactBuildId, servedBuildId,
  });
  const routes = ["/paper-2", ...catalog.sections.map(s => `/paper-2/sections/${s.id}`), ...catalog.topics.map(t => `/paper-2/topics/${t.slug}`)];
  for (const lang of ["en", "vi"]) {
    for (let start = 0; start < routes.length; start += 5) {
      await Promise.all(routes.slice(start, start + 5).map(async route => {
        const response = await context.request.get(`${base}${route}?lang=${lang}`);
        const html = await response.text();
        check(`route:${lang}:${route}`, response.status() === 200 && html.includes(`lang="${lang}"`) && html.includes('data-paper2-shell') && !/D:\\|file:\/\//.test(html), { status: response.status() });
      }));
    }
  }
  for (const route of ["/paper-2/sections/99", "/paper-2/topics/unknown-topic"]) {
    const response = await context.request.get(`${base}${route}?lang=en`);
    check(`404:${route}`, response.status() === 404, { status: response.status() });
  }
  for (const route of ["/paper-3?lang=en", "/paper-3/sections/20?lang=vi", "/paper-4?lang=en", "/docs"]) {
    const response = await context.request.get(`${base}${route}`);
    check(`shared-regression:${route}`, response.status() === 200, { status: response.status() });
  }

  const page = await context.newPage();
  page.on("pageerror", error => browserErrors.push(error.message));
  page.on("console", msg => {
    if (msg.type() !== "error") return;
    const location = msg.location();
    browserErrors.push(location.url ? `${msg.text()} (${location.url}${location.lineNumber ? `:${location.lineNumber}` : ""})` : msg.text());
  });
  async function go(route) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.locator("[data-paper2-shell]").waitFor();
    await page.evaluate(() => document.fonts.ready);
  }
  async function capture(name, fullPage = true) {
    const filename = `${name}.png`;
    await page.screenshot({ path: path.join(out, filename), fullPage });
    screenshots.push(filename);
  }
  async function geometry(id) {
    const result = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      lang: document.documentElement.lang,
      focused: document.activeElement?.id,
    }));
    check(`geometry:${id}`, result.scrollWidth <= result.width + 1, result);
  }
  for (const width of [1440, 320]) for (const lang of ["en", "vi"]) for (const theme of ["light", "dark"]) {
    await page.setViewportSize({ width, height: 1000 });
    await go(`/paper-2?lang=${lang}&section=12.2`);
    await page.evaluate(theme => { localStorage.setItem("theme", theme); document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.classList.toggle("light", theme === "light"); }, theme);
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const id = `map-${lang}-${theme}-${width}`;
    check(`map-nodes:${id}`, await page.locator("[data-map-node]").count() === 12);
    check(`selected:${id}`, await page.locator('[data-map-node][data-section-id="12.2"]').getAttribute("aria-pressed") === "true");
    check(`locale:${id}`, await page.locator("html").getAttribute("lang") === lang);
    check(`theme:${id}`, (await page.locator("html").getAttribute("class") ?? "").includes(theme));
    await geometry(id); await capture(id);
    await page.addScriptTag({ content: axe.source });
    const scan = await page.evaluate(async () => {
      const result = await window.axe.run(document);
      return result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    });
    check(`axe:${id}`, scan.length === 0, scan);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await go("/paper-2?lang=en");
  await page.keyboard.press("Tab");
  check("skip-link-first-tab-stop", await page.locator(":focus").textContent() === "Skip to content", await page.locator(":focus").textContent());
  await page.keyboard.press("Enter");
  check("skip-link-focuses-main", await page.locator(":focus").getAttribute("id") === "paper2-main", await page.locator(":focus").getAttribute("id"));
  await go("/paper-2?lang=en");
  check("section-readiness-on-all-nodes", await page.locator("[data-map-node][data-ready-count]").count() === 12);
  check("course-progress-present", await page.locator('[data-paper2-course-progress][data-progress-scope="course"]').count() === 1);
  check("course-continue-matches-readiness", await page.locator('[data-paper2-course-progress][data-progress-scope="course"] [data-paper2-continue]').count() === (reviewedTopicIds.size > 0 ? 1 : 0));
  const node = page.locator('[data-map-node][data-section-id="10.2"]');
  await node.focus(); await page.keyboard.press("Enter");
  await page.waitForURL(/section=10.2/);
  check("keyboard-selection", await node.getAttribute("aria-pressed") === "true");
  await page.getByRole("button", { name: "List", exact: true }).click();
  await page.waitForURL(/view=list/);
  check("list-view", await page.locator('[data-view="list"]').count() === 1);
  await capture("map-list-en-1440");
  await page.reload({ waitUntil: "networkidle" });
  check("reload-preserves-map-context", await page.locator('[data-map-node][data-section-id="10.2"]').getAttribute("aria-pressed") === "true" && await page.locator('[data-view="list"]').count() === 1);
  await page.locator('[data-map-node][data-section-id="12.2"]').click();
  await page.waitForURL(/section=12.2/);
  await page.goBack({ waitUntil: "networkidle" });
  check("back-restores-selection", await page.locator('[data-map-node][data-section-id="10.2"]').getAttribute("aria-pressed") === "true");
  await page.locator("#paper2-search").fill("so do cau truc");
  await page.locator('[data-topic-id="T24"]').waitFor();
  check("Vietnamese-unaccented-search", await page.locator('[data-topic-id="T24"]').count() === 1);
  await page.locator("#paper2-search").fill("T08");
  await page.locator('[data-topic-id="T08"]').waitFor();
  check("topic-id-search", await page.locator("[data-topic-id]").count() === 1);
  await page.getByRole("button", { name: "VI", exact: true }).click();
  await page.waitForURL(/lang=vi/);
  await page.waitForFunction(() => document.documentElement.lang === "vi");
  check("locale-preserves-search-and-view", new URL(page.url()).searchParams.get("q") === "T08" && new URL(page.url()).searchParams.get("view") === "list" && await page.locator('[data-topic-id="T08"]').count() === 1);
  await capture("search-T08-vi-1440");
  await page.locator("#paper2-search").fill("no-result-zzzz");
  await page.getByRole("heading", { name: "Chưa tìm thấy chủ đề phù hợp" }).waitFor();
  check("empty-search", await page.getByRole("heading", { name: "Chưa tìm thấy chủ đề phù hợp" }).count() === 1);
  await page.getByRole("button", { name: "Xem toàn bộ bản đồ", exact: true }).click();
  check("clear-search", await page.locator("[data-map-node]").count() === 12);
  await go("/paper-2?lang=vi&section=12.2&view=map#paper2-section-detail");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.waitForURL(/lang=en/);
  await page.waitForFunction(() => location.hash === "#paper2-section-detail");
  check("locale-preserves-hash", new URL(page.url()).hash === "#paper2-section-detail");

  await page.setViewportSize({ width: 320, height: 800 });
  await go("/paper-2?lang=en&section=12.2");
  await page.locator('[data-map-node][data-section-id="9.1"]').click();
  await page.waitForURL(/section=9.1/);
  const mobileSelection = await page.evaluate(() => {
    const detail = document.getElementById("paper2-section-detail");
    const box = detail?.getBoundingClientRect();
    return { activeId: document.activeElement?.id, top: box?.top ?? null, bottom: box?.bottom ?? null, viewport: innerHeight };
  });
  check("mobile-selection-focuses-visible-detail", mobileSelection.activeId === "paper2-section-detail" && mobileSelection.top !== null && mobileSelection.top >= 0 && mobileSelection.top < mobileSelection.viewport, mobileSelection);

  await page.setViewportSize({ width: 320, height: 1000 });
  await go("/paper-2/sections/9.1?lang=en");
  const sectionOrder = await page.evaluate(() => ({
    concept: document.getElementById("paper2-concept-title")?.getBoundingClientRect().top ?? null,
    enrichment: document.getElementById("paper2-section-scenario-title")?.getBoundingClientRect().top ?? null,
  }));
  check("section-9.1-topic-map-before-enrichment", sectionOrder.concept !== null && sectionOrder.enrichment !== null && sectionOrder.concept < sectionOrder.enrichment, sectionOrder);
  check("section-progress-present", await page.locator('[data-paper2-course-progress][data-progress-scope="9.1"]').count() === 1);

  for (const width of [1440, 320]) for (const lang of ["en", "vi"]) {
    await page.setViewportSize({ width, height: 1000 });
    await go(`/paper-2/sections/10.2?lang=${lang}`);
    check(`section-topics:${width}:${lang}`, await page.locator("[data-topic-id]").count() === 3);
    await geometry(`section-${lang}-${width}`); await capture(`section-10.2-${lang}-${width}`);
    if (plannedTopic) {
      await go(`/paper-2/topics/${plannedTopic.slug}?lang=${lang}`);
      check(`preview-root:${width}:${lang}`, await page.locator(`[data-paper2-topic-preview][data-topic-id="${plannedTopic.id}"]`).count() === 1);
      check(`preview-objectives:${width}:${lang}`, await page.getByRole("heading", { name: plannedTopic.title[lang], exact: true }).count() === 1);
      await page.keyboard.press("Tab");
      check(`preview-keyboard:${width}:${lang}`, await page.locator(":focus").count() === 1);
      await page.addScriptTag({ content: axe.source });
      const previewAxe = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
      check(`preview-axe:${width}:${lang}`, previewAxe.length === 0, previewAxe);
      await geometry(`preview-${lang}-${width}`); await capture(`topic-${plannedTopic.id}-${lang}-${width}`);
    } else {
      check(`preview-not-required-all-reviewed:${width}:${lang}`, catalog.topics.every(topicIsReady));
    }
  }

  const lessonTarget = reviewedTopic ?? candidateTopic;
  check("reviewed-or-candidate-lesson-required", Boolean(lessonTarget), {
    reviewedTopics: reviewedTopicIds.size,
    candidateTopic: candidateTopic?.id ?? null,
  });
  if (lessonTarget) {
    const candidateQuery = reviewedTopic ? "" : `&candidate=${encodeURIComponent(candidateRecord.version)}`;
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("algocore:paper2:progress:")).forEach(key => localStorage.removeItem(key)));
    await go(`/paper-2/topics/${lessonTarget.slug}?lang=en${candidateQuery}`);
    const lessonRendered = await page.locator(`[data-paper2-lesson="${lessonTarget.id}"]`).count() === 1;
    check("reviewed-or-candidate-lesson-rendered", lessonRendered, { topicId: lessonTarget.id, mode: reviewedTopic ? "reviewed" : "candidate" });
    if (lessonRendered) {
      const outlineShell = page.locator('[aria-label="Lesson outline and progress"]:visible');
      const mobileOutlineTrigger = outlineShell.getByRole("button", { name: "Outline", exact: true });
      if (await mobileOutlineTrigger.count()) await mobileOutlineTrigger.click();
      else await outlineShell.locator("summary").click();
      const outline = page.locator('[aria-label="Lesson outline and progress"]:visible');
      check("lesson-outline-single-six-anchor-list", await outline.locator("[data-progress-anchor]:visible").count() === 6 && await page.locator('[class*="lessonNav"]').count() === 0);
      const firstProgressButton = outline.locator('button[aria-pressed]').first();
      const writable = reviewedTopic !== undefined;
      const progressText = await outline.innerText();
      check("progress-copy-unscored", writable
        ? progressText.includes("unscored") && (await firstProgressButton.innerText()).includes("Mark as reviewed")
        : progressText.includes("Review mode · progress is not saved"));
      if (writable) {
        await firstProgressButton.click();
        await page.reload({ waitUntil: "networkidle" });
        check("progress-persists-after-reload", await page.locator('[data-progress-anchor="recognise"]').first().getAttribute("data-reviewed") === "true");
      } else {
        check("candidate-progress-read-only", await outline.locator('button[aria-pressed]').count() === 0);
      }
      const visual = page.locator("[data-paper2-visual]").first();
      check("visual-focus-region-named-described", Boolean(await visual.getAttribute("aria-labelledby")) && Boolean(await visual.getAttribute("aria-describedby")));
    }
  }

  const transitions = [
    { id: "planned-to-reviewed", pair: catalog.topics.slice(0, -1).map((topic, index) => [topic, catalog.topics[index + 1]]).find(([from, to]) => !topicIsReady(from) && topicIsReady(to)) },
    { id: "reviewed-to-planned", pair: catalog.topics.slice(0, -1).map((topic, index) => [topic, catalog.topics[index + 1]]).find(([from, to]) => topicIsReady(from) && !topicIsReady(to)) },
    { id: "reviewed-to-reviewed", pair: catalog.topics.slice(0, -1).map((topic, index) => [topic, catalog.topics[index + 1]]).find(([from, to]) => topicIsReady(from) && topicIsReady(to)) },
  ];
  for (const transition of transitions) {
    if (!transition.pair) continue;
    const [from, to] = transition.pair;
    await go(`/paper-2/topics/${from.slug}?lang=en`);
    const expected = topicIsReady(to) ? "Next topic · Full lesson" : "Next topic · Overview only";
    check(`adjacent-${transition.id}`, (await page.locator('nav[aria-label="Explore more"],nav[aria-label="Adjacent lessons"]').last().innerText()).includes(expected), { from: from.id, to: to.id, expected });
  }
  await page.setViewportSize({ width: 768, height: 1000 });
  await go("/paper-2?lang=en"); await geometry("tablet-768");
  // Browser zoom reduces the effective CSS viewport. A 384 px layout viewport
  // represents a 768 px window at 200%, without the distortion caused by the
  // non-standard CSS `zoom` property.
  await page.setViewportSize({ width: 384, height: 500 });
  await go("/paper-2?lang=en");
  const zoom = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  check("zoom-200-percent", zoom); await capture("map-zoom200");
  check("no-browser-errors", browserErrors.length === 0, [...new Set(browserErrors)]);
} catch (error) {
  check("browser-run-completed", false, String(error?.stack ?? error));
} finally {
  await context?.close(); await browser.close();
  const report = { date: new Date().toISOString(), decision: checks.every(c => c.pass) ? "PASS" : "FAIL", baseUrl: base, buildId: servedBuildId, buildBinding: { expectedBuildId, artifactBuildId, servedBuildId, buildDistDir }, passed: checks.filter(c => c.pass).length, total: checks.length, checks, screenshots, browserErrors: [...new Set(browserErrors)], plannedTopic: plannedTopic?.id ?? null, lessonTarget: reviewedTopic?.id ?? candidateTopic?.id ?? null, scope: "Paper 2 Study Map, section ordering, honest planned-topic route, lesson outline/progress, accessibility and responsive UI. The 67-visual matrix is a separate bounded smoke gate." };
  await writeFile(path.join(out, "BROWSER_QA.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ decision: report.decision, passed: report.passed, total: report.total, failures: checks.filter(c => !c.pass), screenshots: screenshots.length }, null, 2));
  if (report.decision !== "PASS") process.exitCode = 1;
}
