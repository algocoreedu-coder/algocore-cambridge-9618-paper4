import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env.local")); } catch { /* CI or the caller may provide environment variables. */ }

const base = (process.env.PAPER2_CHAPTER_9_1_BASE_URL ?? process.env.PAPER2_BASE_URL ?? "http://127.0.0.1:3042").replace(/\/$/, "");
const evidencePath = process.env.PAPER2_CHAPTER_9_1_PUBLIC_EVIDENCE_PATH;
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
const require = createRequire(import.meta.url);
const playwrightModule = process.env.PLAYWRIGHT_MODULE ?? path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { chromium } = require(playwrightModule);
const axe = require("axe-core");
const executablePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft Edge/Application/msedge.exe",
].find((candidate) => candidate && existsSync(candidate));

const [status, t01, t02, section91, patternF01] = await Promise.all([
  readFile(path.join(root, "content/paper2/lesson-status.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/lessons/abstraction.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/lessons/decomposition.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/sections/9.1.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "content/paper2/patterns/F01.json"), "utf8").then(JSON.parse),
]);

const records = status.lessons.filter((record) => ["T01", "T02"].includes(record.topicId)).sort((a, b) => a.topicId.localeCompare(b.topicId));
const lessonByTopic = new Map([["T01", t01], ["T02", t02]]);
const checks = [];
const failures = [];
function check(id, condition, detail = null) {
  const result = { id, pass: Boolean(condition), detail };
  checks.push(result);
  if (!result.pass) failures.push(result);
}

const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
const includesText = (haystack, needle) => normalize(haystack).includes(normalize(needle));
const topicUrl = (record, locale, params = {}, hash = "") => {
  const url = new URL(`/paper-2/topics/${record.slug}`, base);
  url.searchParams.set("lang", locale);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.hash = hash;
  return url.toString();
};
const sectionUrl = (locale, params = {}, hash = "") => {
  const url = new URL("/paper-2/sections/9.1", base);
  url.searchParams.set("lang", locale);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.hash = hash;
  return url.toString();
};

check("SETUP-records", records.length === 2 && records.map((record) => record.topicId).join(",") === "T01,T02", records.map(({ topicId, slug, version, state }) => ({ topicId, slug, version, state })));
check("SETUP-reviewed-state", records.length === 2 && records.every((record) => record.state === "reviewed"), records.map(({ topicId, state }) => ({ topicId, state })));
check("SETUP-content-identity", records.every((record) => {
  const lesson = lessonByTopic.get(record.topicId);
  return lesson?.topicId === record.topicId && lesson?.slug === record.slug && lesson?.version === record.version;
}), records.map((record) => ({ topicId: record.topicId, statusVersion: record.version, contentVersion: lessonByTopic.get(record.topicId)?.version })));
check("SETUP-credentials", Boolean(username && password), { usernameConfigured: Boolean(username), passwordConfigured: Boolean(password) });
check("SETUP-browser", Boolean(executablePath), { executableAvailable: Boolean(executablePath) });

async function axeViolations(page, { disableColorContrast = false } = {}) {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async ({ disableColorContrast }) => {
    const report = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      rules: disableColorContrast ? { "color-contrast": { enabled: false } } : undefined,
    });
    return report.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({ target: node.target, failureSummary: node.failureSummary })),
    }));
  }, { disableColorContrast });
}

async function layoutEvidence(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const main = document.querySelector("#paper2-main");
    const visibleControls = [...(main?.querySelectorAll("button,select") ?? [])].filter((node) => node.getClientRects().length > 0);
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    return {
      viewportWidth: root.clientWidth,
      pageScrollWidth: root.scrollWidth,
      noPageOverflow: root.scrollWidth <= root.clientWidth + 1,
      clippedControls: visibleControls.map((node) => {
        const box = node.getBoundingClientRect();
        return { tag: node.tagName.toLowerCase(), text: clean(node.textContent).slice(0, 50), left: box.left, right: box.right, width: box.width, height: box.height };
      }).filter((item) => item.left < -1 || item.right > root.clientWidth + 1),
      visualRegions: [...document.querySelectorAll("[data-paper2-visual] [role=region]")].map((node) => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth })),
      language: root.lang,
    };
  });
}

let browser;
let context;
try {
  if (!username || !password || !executablePath || records.length !== 2) throw new Error("Chapter 9.1 browser prerequisites are incomplete; see SETUP checks.");
  browser = await chromium.launch({ executablePath, headless: true });
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", colorScheme: "light" });

  const t01Record = records.find((record) => record.topicId === "T01");
  const unauthLesson = await context.request.get(topicUrl(t01Record, "en"), { maxRedirects: 0 });
  const unauthLocation = new URL(unauthLesson.headers().location ?? "/", base);
  check("AUTH-unauth-lesson", unauthLesson.status() === 307 && unauthLocation.pathname === "/login" && unauthLocation.searchParams.get("next")?.startsWith("/paper-2/topics/abstraction"), { status: unauthLesson.status(), location: `${unauthLocation.pathname}${unauthLocation.search}` });
  const unauthSection = await context.request.get(sectionUrl("vi"), { maxRedirects: 0 });
  check("AUTH-unauth-section", unauthSection.status() === 307 && new URL(unauthSection.headers().location ?? "/", base).pathname === "/login", unauthSection.status());
  const directVisual = await context.request.get(`${base}/paper2-visuals/T01.html`, { maxRedirects: 0 });
  check("AUTH-direct-visual-denied", directVisual.status() === 404 && /no-store/.test(directVisual.headers()["cache-control"] ?? ""), { status: directVisual.status(), cacheControl: directVisual.headers()["cache-control"] ?? null });

  const login = await context.request.post(`${base}/api/auth/login`, {
    headers: { origin: base, "sec-fetch-site": "same-origin" },
    data: { username, password, next: "/paper-2/sections/9.1?lang=en", lang: "en" },
  });
  check("AUTH-login", login.status() === 200, login.status());

  for (const record of records) {
    const publicResponse = await context.request.get(`${base}/paper-2/topics/${record.slug}?lang=en`);
    const publicHtml = await publicResponse.text();
    check(`AUTH-public-lesson:${record.topicId}`, publicResponse.status() === 200 && publicHtml.includes(`data-paper2-lesson="${record.topicId}"`) && publicHtml.includes('data-candidate="false"') && !publicHtml.includes("Local candidate"), publicResponse.status());
    const wrongResponse = await context.request.get(`${base}/paper-2/topics/${record.slug}?lang=en&candidate=${encodeURIComponent(`${record.version}-wrong`)}`);
    const wrongHtml = await wrongResponse.text();
    check(`AUTH-wrong-revision-ignored:${record.topicId}`, wrongResponse.status() === 200 && wrongHtml.includes(`data-paper2-lesson="${record.topicId}"`) && wrongHtml.includes('data-candidate="false"') && !wrongHtml.includes("Local candidate"), wrongResponse.status());
    const exactCandidateRequest = new URL(topicUrl(record, "en"));
    exactCandidateRequest.searchParams.set("candidate", record.version);
    const candidateResponse = await context.request.get(exactCandidateRequest.toString());
    const candidateHtml = await candidateResponse.text();
    check(`AUTH-candidate-param-ignored:${record.topicId}`, candidateResponse.status() === 200 && candidateHtml.includes(`data-paper2-lesson="${record.topicId}"`) && candidateHtml.includes('data-candidate="false"') && !candidateHtml.includes("Local candidate"), candidateResponse.status());
    check(`AUTH-reviewed-evidence:${record.topicId}`, record.evidence && Object.keys(record.evidence).sort().join(",") === "academicPost,academicPre,codeReview,qa,visualReview", record.evidence ?? null);
  }

  const page = await context.newPage();
  await page.goto(`${base}/paper-2/sections/9.1?lang=en`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());

  for (const record of records) {
    const lesson = lessonByTopic.get(record.topicId);
    for (const locale of ["en", "vi"]) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(topicUrl(record, locale), { waitUntil: "networkidle" });
      const lessonRoot = page.locator(`[data-paper2-lesson="${record.topicId}"][data-candidate="false"]`);
      await lessonRoot.waitFor();
      check(`CONTENT-root:${record.topicId}:${locale}`, await lessonRoot.count() === 1 && await page.locator("html").getAttribute("lang") === locale);
      check(`CONTENT-six-anchors:${record.topicId}:${locale}`, await lessonRoot.locator("#recognise,#understand,#worked-example,#practise,#avoid-lost-marks,#remember").count() === 6);
      const workedText = await lessonRoot.locator("#worked-example").innerText();
      const practiceText = await lessonRoot.locator("#practise").innerText();
      check(`CONTENT-worked-answer-visible:${record.topicId}:${locale}`, lesson.workedExamples.every((example) => includesText(workedText, example.answer[locale])), lesson.workedExamples.map((example) => example.id));
      check(`CONTENT-practice-answers-visible:${record.topicId}:${locale}`, lesson.practices.length >= 2 && lesson.practices.every((practice) => includesText(practiceText, practice.answer[locale])), lesson.practices.map((practice) => practice.id));
      check(`PROGRESS-ui-present:${record.topicId}:${locale}`, await lessonRoot.locator('[aria-label*="progress" i]:visible,[aria-label*="tiến độ" i]:visible').count() === 1 && !includesText(await lessonRoot.innerText(), locale === "vi" ? "Chế độ review không ghi tiến độ học sinh." : "Review mode does not write learner progress."));
      const visual = lessonRoot.locator(`[data-paper2-visual="${record.topicId}"][data-paper2-visual-player="native"]`);
      check(`VISUAL-native-mounted:${record.topicId}:${locale}`, await visual.count() === 1 && await visual.locator("iframe").count() === 0);

      if (record.topicId === "T01") {
        const sourceAnswer = lesson.practices.find((item) => item.id === "T01-P1")?.answer?.[locale];
        const sourceLocator = lesson.sources.find((item) => item.id === "ms-w21-21-q1c")?.locator;
        check(`SOURCE-W21-classifications:${locale}`, includesText(practiceText, sourceAnswer)
          && includesText(sourceAnswer, locale === "vi" ? "giữ tên, ngày/giờ bắt đầu, học phí và số chỗ còn lại" : "retain title, date/start time, fee and places remaining")
          && includesText(sourceAnswer, locale === "vi" ? "bỏ cỡ giày và màu tường" : "omit shoe size and wall colour"), sourceAnswer);
        check(`SOURCE-W21-locator:${locale}`, includesText(await lessonRoot.textContent(), sourceLocator), sourceLocator);
      } else {
        const requiredModules = ["Validate request", "Reserve seat", "Record booking", "Produce occupancy report"];
        const requiredInterfaces = ["Valid", "Reason", "Reservation", "Failure", "BookingID", "BookingRecord", "OccupiedCountByFlight"];
        check(`SOURCE-T02-four-modules:${locale}`, requiredModules.every((value) => workedText.includes(value)), requiredModules.filter((value) => !workedText.includes(value)));
        check(`SOURCE-T02-interfaces:${locale}`, requiredInterfaces.every((value) => workedText.includes(value)), requiredInterfaces.filter((value) => !workedText.includes(value)));
        check(`SOURCE-T02-boundary:${locale}`, includesText(workedText, locale === "vi" ? "phân cấp không xác định thứ tự chạy" : "hierarchy does not specify execution order"));
      }
    }
  }

  for (const locale of ["en", "vi"]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(sectionUrl(locale), { waitUntil: "networkidle" });
    const sectionRoot = page.locator('[data-paper2-section][data-section-id="9.1"]');
    await sectionRoot.waitFor();
    const sectionText = await sectionRoot.innerText();
    check(`SECTION-root:${locale}`, await sectionRoot.count() === 1 && await page.locator("html").getAttribute("lang") === locale);
    check(`SECTION-scenario-question:${locale}`, includesText(sectionText, section91.scenario.bigQuestion[locale]) && includesText(sectionText, section91.scenario.context[locale]));
    check(`SECTION-glossary-prerequisite:${locale}`, section91.glossary.every((item) => sectionText.includes(item.term) && includesText(sectionText, item.meaning[locale])) && section91.prerequisiteGuidance.every((item) => includesText(sectionText, item.reason[locale])));
    check(`SECTION-worked-answer:${locale}`, includesText(sectionText, section91.workedChapter.fullAnswer[locale]) && section91.workedChapter.modules.every((module) => sectionText.includes(module.name) && sectionText.includes(module.output)));
    check(`SECTION-F01:${locale}`, includesText(sectionText, patternF01.answerProduct[locale]) && patternF01.positiveCues.every((cue) => includesText(sectionText, cue[locale])) && patternF01.misleadingCues.every((cue) => includesText(sectionText, cue[locale])));
    const visual = sectionRoot.locator('[data-paper2-visual="S9.1"][data-paper2-visual-player="native"]');
    check(`SECTION-S9.1-native:${locale}`, await visual.count() === 1 && await visual.locator("iframe").count() === 0);
  }

  const visualCases = [
    { id: "T01", record: records.find((record) => record.topicId === "T01"), variant: "purposes", first: "details", middle: "assign", last: "report", hash: "understand" },
    { id: "T02", record: records.find((record) => record.topicId === "T02"), variant: "enrolment", first: "split", middle: "subdivide", last: "interfaces", hash: "understand" },
    { id: "S9.1", record: null, variant: "relations", first: "relation-1", middle: "relation-2", last: "relation-3", hash: "section-9-1-concept-map" },
  ];
  for (const visualCase of visualCases) {
    const url = visualCase.record
      ? topicUrl(visualCase.record, "en", { visual: visualCase.id, variant: visualCase.variant, step: visualCase.middle }, visualCase.hash)
      : sectionUrl("en", { visual: visualCase.id, variant: visualCase.variant, step: visualCase.middle }, visualCase.hash);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url, { waitUntil: "networkidle" });
    const player = page.locator(`[data-paper2-visual="${visualCase.id}"][data-paper2-visual-player="native"]`);
    await player.locator('[data-p2-control="next"]').waitFor();
    const frame = player.locator("[data-p2-frame]");
    const textAlternative = player.locator("details").first();
    const textAlternativeRegion = textAlternative.locator(":scope > div");
    check(`VISUAL-native-no-iframe:${visualCase.id}`, await player.count() === 1 && await player.locator("iframe").count() === 0);
    check(`VISUAL-controls:${visualCase.id}`, await player.locator('[data-p2-control="previous"],[data-p2-control="next"],[data-p2-control="reset"]').count() === 3);
    check(`VISUAL-text-alternative:${visualCase.id}`, await textAlternative.getAttribute("open") !== null && await textAlternativeRegion.getAttribute("tabindex") === "0" && Boolean(await textAlternativeRegion.getAttribute("aria-labelledby")));
    check(`VISUAL-transcript:${visualCase.id}`, await player.locator("[data-p2-transcript] li").count() === 3);
    const loadedUrl = new URL(page.url());
    check(`VISUAL-deep-link:${visualCase.id}`, await frame.getAttribute("data-p2-frame") === visualCase.middle
      && loadedUrl.searchParams.get("visual") === visualCase.id
      && loadedUrl.searchParams.get("variant") === visualCase.variant
      && loadedUrl.searchParams.get("step") === visualCase.middle
      && loadedUrl.hash === `#${visualCase.hash}`, page.url());
    await page.reload({ waitUntil: "networkidle" });
    check(`VISUAL-reload-state:${visualCase.id}`, await page.locator(`[data-paper2-visual="${visualCase.id}"] [data-p2-frame="${visualCase.middle}"]`).count() === 1, page.url());
    const activePlayer = page.locator(`[data-paper2-visual="${visualCase.id}"]`);
    const beforeWait = await activePlayer.locator("[data-p2-frame]").getAttribute("data-p2-frame");
    await page.waitForTimeout(350);
    check(`VISUAL-no-autoplay:${visualCase.id}`, await activePlayer.locator("[data-p2-frame]").getAttribute("data-p2-frame") === beforeWait);
    await activePlayer.focus();
    await page.keyboard.press("End");
    await page.waitForFunction((expected) => new URL(location.href).searchParams.get("step") === expected, visualCase.last);
    check(`VISUAL-keyboard-end:${visualCase.id}`, await activePlayer.locator(`[data-p2-frame="${visualCase.last}"]`).count() === 1);
    await page.keyboard.press("Home");
    await page.waitForFunction((expected) => new URL(location.href).searchParams.get("step") === expected, visualCase.first);
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction((expected) => new URL(location.href).searchParams.get("step") === expected, visualCase.middle);
    check(`VISUAL-keyboard-home-arrow:${visualCase.id}`, await activePlayer.locator(`[data-p2-frame="${visualCase.middle}"]`).count() === 1);
    await activePlayer.locator('[data-p2-control="reset"]').click();
    await page.waitForFunction((expected) => new URL(location.href).searchParams.get("step") === expected, visualCase.first);
    check(`VISUAL-reset-url:${visualCase.id}`, await activePlayer.locator(`[data-p2-frame="${visualCase.first}"]`).count() === 1 && new URL(page.url()).hash === `#${visualCase.hash}`, page.url());
    const motion = await activePlayer.evaluate((node) => ({ reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, runningAnimations: node.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length }));
    check(`VISUAL-reduced-motion:${visualCase.id}`, motion.reduced && motion.runningAnimations === 0, motion);
  }

  async function visualLocaleState(visualCase, expectedLocale) {
    await page.waitForFunction((locale) => new URL(location.href).searchParams.get("lang") === locale && document.documentElement.lang === locale, expectedLocale);
    const url = new URL(page.url());
    return {
      locale: url.searchParams.get("lang"),
      documentLocale: await page.locator("html").getAttribute("lang"),
      visual: url.searchParams.get("visual"),
      variant: url.searchParams.get("variant"),
      step: url.searchParams.get("step"),
      hash: url.hash,
      framePresent: await page.locator(`[data-paper2-visual="${visualCase.id}"] [data-p2-frame="${visualCase.middle}"]`).count() === 1,
    };
  }
  const localeStateMatches = (state, visualCase, locale) => state.locale === locale && state.documentLocale === locale
    && state.visual === visualCase.id && state.variant === visualCase.variant && state.step === visualCase.middle
    && state.hash === `#${visualCase.hash}` && state.framePresent;
  for (const visualCase of visualCases) {
    const startUrl = visualCase.record
      ? topicUrl(visualCase.record, "en", { visual: visualCase.id, variant: visualCase.variant, step: visualCase.middle }, visualCase.hash)
      : sectionUrl("en", { visual: visualCase.id, variant: visualCase.variant, step: visualCase.middle }, visualCase.hash);
    await page.goto(startUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "VI", exact: true }).first().click();
    const viState = await visualLocaleState(visualCase, "vi");
    check(`LOCALE-en-to-vi:${visualCase.id}`, localeStateMatches(viState, visualCase, "vi"), viState);
    await page.getByRole("button", { name: "EN", exact: true }).first().click();
    const enState = await visualLocaleState(visualCase, "en");
    check(`LOCALE-vi-to-en:${visualCase.id}`, localeStateMatches(enState, visualCase, "en"), enState);
    await page.goBack({ waitUntil: "networkidle" });
    const backState = await visualLocaleState(visualCase, "vi");
    check(`HISTORY-back-preserves-visual-state:${visualCase.id}`, localeStateMatches(backState, visualCase, "vi"), backState);
    await page.goForward({ waitUntil: "networkidle" });
    const forwardState = await visualLocaleState(visualCase, "en");
    check(`HISTORY-forward-preserves-visual-state:${visualCase.id}`, localeStateMatches(forwardState, visualCase, "en"), forwardState);
  }

  const responsiveRoutes = [
    { id: "T01", url: (locale) => topicUrl(records.find((record) => record.topicId === "T01"), locale, { visual: "T01", variant: "purposes", step: "assign" }, "understand") },
    { id: "T02", url: (locale) => topicUrl(records.find((record) => record.topicId === "T02"), locale, { visual: "T02", variant: "enrolment", step: "subdivide" }, "understand") },
    { id: "S9.1", url: (locale) => sectionUrl(locale, { visual: "S9.1", variant: "relations", step: "relation-2" }, "section-9-1-concept-map") },
  ];
  for (const width of [320, 768, 1440]) {
    for (const route of responsiveRoutes) {
      await page.setViewportSize({ width, height: width === 320 ? 900 : 1000 });
      await page.goto(route.url("vi"), { waitUntil: "networkidle" });
      const layout = await layoutEvidence(page);
      check(`LAYOUT-${width}:${route.id}`, layout.noPageOverflow && layout.clippedControls.length === 0 && layout.language === "vi", layout);
      const violations = await axeViolations(page);
      check(`AXE-${width}:${route.id}:vi`, violations.length === 0, violations);
    }
  }
  for (const route of responsiveRoutes) {
    await page.setViewportSize({ width: 640, height: 1000 });
    await page.goto(route.url("vi"), { waitUntil: "networkidle" });
    const layout = await layoutEvidence(page);
    check(`LAYOUT-200-percent-equivalent:${route.id}`, layout.noPageOverflow && layout.clippedControls.length === 0 && layout.language === "vi", layout);
    const violations = await axeViolations(page);
    check(`AXE-200-percent-equivalent:${route.id}:vi`, violations.length === 0, violations);
  }
  for (const route of responsiveRoutes) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route.url("en"), { waitUntil: "networkidle" });
    const violations = await axeViolations(page);
    check(`AXE-1440:${route.id}:en`, violations.length === 0, violations);
  }

  for (const route of responsiveRoutes) {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce", forcedColors: "none" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route.url("en"), { waitUntil: "networkidle" });
    const html = page.locator("html");
    if (!(await html.evaluate((node) => node.classList.contains("dark")))) {
      const themeToggle = page.locator('button[data-theme-toggle]:visible').first();
      await themeToggle.waitFor({ state: "visible" });
      await themeToggle.click();
    }
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    const appearance = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const channels = body.backgroundColor.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
      const luminance = channels.length === 3
        ? channels.map((channel) => channel / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
          .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
        : null;
      return {
        darkMedia: matchMedia("(prefers-color-scheme: dark)").matches,
        darkClass: document.documentElement.classList.contains("dark"),
        color: body.color,
        background: body.backgroundColor,
        canvasLuminance: luminance,
        visualPresent: Boolean(document.querySelector("[data-paper2-visual][data-paper2-visual-player=native]")),
      };
    });
    check(`THEME-dark:${route.id}`, appearance.darkMedia && appearance.darkClass && appearance.visualPresent
      && appearance.canvasLuminance !== null && appearance.canvasLuminance < 0.25
      && appearance.color !== appearance.background && appearance.color !== "rgba(0, 0, 0, 0)"
      && appearance.background !== "rgba(0, 0, 0, 0)", appearance);
    const darkViolations = await axeViolations(page);
    check(`AXE-dark:${route.id}:en`, darkViolations.length === 0, darkViolations);
  }
  if (await page.locator("html").evaluate((node) => node.classList.contains("dark"))) {
    await page.locator('button[data-theme-toggle]:visible').first().click();
    await page.waitForFunction(() => !document.documentElement.classList.contains("dark"));
  }
  for (const route of responsiveRoutes) {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce", forcedColors: "active" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route.url("en"), { waitUntil: "networkidle" });
    const appearance = await page.evaluate(() => {
      const visual = document.querySelector("[data-paper2-visual][data-paper2-visual-player=native]");
      const box = visual?.getBoundingClientRect();
      const details = visual?.querySelector("details[open]");
      return {
        forcedColors: matchMedia("(forced-colors: active)").matches,
        visualWidth: box?.width ?? 0,
        visualHeight: box?.height ?? 0,
        textAlternativeOpen: Boolean(details),
        visibleControls: [...(visual?.querySelectorAll("button,select") ?? [])].filter((node) => node.getClientRects().length > 0).length,
      };
    });
    check(`THEME-forced-colors:${route.id}`, appearance.forcedColors && appearance.visualWidth > 0 && appearance.visualHeight > 0 && appearance.textAlternativeOpen && appearance.visibleControls >= 3, appearance);
    // Chromium paints forced system colours, while getComputedStyle still exposes
    // author colours to axe. Keep the full semantic audit and leave contrast to
    // the dedicated forced-colours presence/usability assertion above.
    const forcedColorViolations = await axeViolations(page, { disableColorContrast: true });
    check(`AXE-forced-colors:${route.id}:en`, forcedColorViolations.length === 0, forcedColorViolations);
  }
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce", forcedColors: "none" });

  await page.goto(topicUrl(t01Record, "en"), { waitUntil: "networkidle" });
  const progressButton = page.locator('[data-paper2-lesson="T01"] [aria-label*="progress" i] button').first();
  await progressButton.click();
  const progress = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("algocore:paper2:progress:")).map((key) => ({ key, value: localStorage.getItem(key) })));
  check("PROGRESS-public-write", progress.some((item) => item.key.includes(`:T01:${t01Record.version}`) && item.value), progress);
} catch (error) {
  check("BROWSER-run", false, error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  await context?.close().catch(() => {});
  await browser?.close().catch(() => {});
}

const report = {
  schema_version: "paper2-chapter-9.1-public-browser-gate-v1",
  decision: failures.length ? "FAIL" : "PASS",
  generated_at: new Date().toISOString(),
  base_url: base,
  chapter: "9.1",
  records: records.map(({ topicId, slug, version, state, contentSha256 }) => ({ topicId, slug, version, state, contentSha256 })),
  reduced_motion: true,
  viewports: [320, 640, 768, 1440],
  passed: checks.length - failures.length,
  failed: failures.length,
  total: checks.length,
  failures,
  checks,
};
if (evidencePath) {
  const output = path.resolve(root, evidencePath);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
