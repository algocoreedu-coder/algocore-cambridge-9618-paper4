import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env.local")); } catch { /* CI may inject credentials. */ }
const base = (process.env.PAPER2_BASE_URL ?? "http://127.0.0.1:3042").replace(/\/$/, "");
const require = createRequire(import.meta.url);
const playwright = process.env.PLAYWRIGHT_MODULE ?? path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { chromium } = require(playwright);
const executablePath = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((candidate) => candidate && existsSync(candidate));
const checks = [], failures = [];
const check = (id, pass, detail = undefined) => { const row = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(row); if (!row.pass) failures.push(row); };

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: "reduce" });
try {
  const login = await context.request.post(`${base}/api/auth/login`, {
    headers: { origin: base, "sec-fetch-site": "same-origin" },
    data: { username: process.env.ALGOCORE_STUDENT_USERNAME, password: process.env.ALGOCORE_STUDENT_PASSWORD, next: "/paper-2/practice?lang=vi", lang: "vi" },
  });
  check("authenticated", login.status() === 200, login.status());
  const page = await context.newPage();

  await page.goto(`${base}/paper-2/practice?lang=vi&group=cumulative&section=9.1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => !new URL(location.href).searchParams.has("section"));
  check("contradictory-section-query-normalized", !new URL(page.url()).searchParams.has("section"), page.url());
  check("canonical-filter-does-not-show-false-empty", (await page.getByText(/bộ luyện phù hợp/).textContent()) !== "0 bộ luyện phù hợp");
  const filter = page.getByRole("button", { name: /^Bộ lọc/ }).first();
  check("mobile-filter-closed", await filter.getAttribute("aria-expanded") === "false");
  const filterPanel = page.locator('[class*="libraryControls"]').first();
  check("mobile-filter-not-sticky", await filterPanel.evaluate((node) => getComputedStyle(node).position) === "static");
  check("vietnamese-sort-copy", await page.locator("option", { hasText: "Theo thứ tự chương trình" }).count() === 1);
  check("vietnamese-routine-title-sanitized", (await page.textContent("body")).includes("Luyện nhanh chương trình con và chuỗi"));
  check("long-session-guidance", (await page.textContent("body")).includes("Nên dành một phiên học riêng"));

  await page.setViewportSize({ width: 1200, height: 900 });
  check("desktop-filter-controls-visible-while-disclosure-closed", await page.getByLabel("Sắp xếp").isVisible());

  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto(`${base}/paper-2/practice/p2-diagnostic-all-topics?lang=vi`, { waitUntil: "networkidle" });
  check("tablet-full-rail-collapsed", await page.locator('[class*="questionNavigator"]').first().evaluate((node) => getComputedStyle(node).display) === "none");
  check("tablet-compact-navigator-visible", await page.locator('[class*="mobileNavigatorBar"]').first().evaluate((node) => getComputedStyle(node).display) !== "none");
  const firstAnswer = page.locator("textarea").first();
  await firstAnswer.fill("answer persisted before submit");

  const secondQuestion = page.locator("article[id^=question-]").nth(1);
  if (await secondQuestion.count()) {
    await secondQuestion.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await secondQuestion.getByRole("button", { name: "Đánh dấu xem lại" }).click();
    await page.waitForTimeout(750);
    check("flag-survives-delayed-navigation", await secondQuestion.getByRole("button", { name: "Đã đánh dấu" }).getAttribute("aria-pressed") === "true");
  }

  const submitTrigger = page.getByRole("button", { name: "Kiểm tra và nộp" });
  await submitTrigger.click();
  check("submit-confirm-focus-handoff", await page.evaluate(() => document.activeElement?.id) === "paper2-submit-confirm-title", await page.evaluate(() => document.activeElement?.id));

  let releaseSubmit;
  const submitBlocked = new Promise((resolve) => { releaseSubmit = resolve; });
  await page.route("**/api/paper2/sets/p2-diagnostic-all-topics/submit", async (route) => { await submitBlocked; await route.continue(); });
  await page.getByRole("button", { name: "Xác nhận nộp" }).click();
  await page.waitForTimeout(100);
  check("responses-freeze-during-submit", await page.locator("textarea").first().isDisabled());
  check("flags-freeze-during-submit", await page.locator("article[id^=question-]").first().getByRole("button", { name: /Đánh dấu|Đã đánh dấu/ }).isDisabled());
  releaseSubmit();
  await page.getByRole("heading", { name: "Tự chấm theo từng ý" }).waitFor({ timeout: 15_000 });
  await page.unroute("**/api/paper2/sets/p2-diagnostic-all-topics/submit");
  check("submitted-answer-keeps-latest-persisted-value", await firstAnswer.inputValue() === "answer persisted before submit", await firstAnswer.inputValue());
  const selfMarkNavigatorItems = await page.locator('[data-self-mark="not-started"], [data-self-mark="partial"], [data-self-mark="complete"]').count();
  check("navigator-shows-per-question-self-mark-state", selfMarkNavigatorItems >= 32, selfMarkNavigatorItems);

  const stagedSubmitted = await page.evaluate(() => {
    const stableStringify = (value) => Array.isArray(value)
      ? `[${value.map(stableStringify).join(",")}]`
      : value && typeof value === "object"
        ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`
        : JSON.stringify(value) ?? "null";
    const checksum = (value) => {
      let hash = 0x811c9dc5;
      for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193); }
      return (hash >>> 0).toString(16).padStart(8, "0");
    };
    const key = Object.keys(localStorage).find((candidate) => {
      try { return JSON.parse(localStorage.getItem(candidate)).data?.contentId === "p2-diagnostic-all-topics"; } catch { return false; }
    });
    if (!key) return false;
    const envelope = JSON.parse(localStorage.getItem(key));
    envelope.data.status = "submitted";
    envelope.data.revision += 1;
    envelope.data.updatedAt = new Date().toISOString();
    envelope.data.finalChecklist = { ...envelope.data.finalChecklist, submitted: true, scorableMarkPointsComplete: false };
    envelope.data.selfMarks = {};
    envelope.checksum = checksum(stableStringify(envelope.data));
    localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  });
  check("submitted-recovery-fixture-staged", stagedSubmitted);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Tự chấm theo từng ý" }).waitFor({ timeout: 15_000 });
  check("restored-submitted-transitions-to-self-marking", await page.locator('[data-attempt-status="self_marking"]').count() === 1);
  check("recovered-attempt-keeps-answer", await page.locator("textarea").first().inputValue() === "answer persisted before submit", await page.locator("textarea").first().inputValue());

  const resetTrigger = page.getByRole("button", { name: "Tạo lượt làm mới" });
  await resetTrigger.click();
  check("reset-confirm-focus-handoff", await page.evaluate(() => document.activeElement?.id) === "paper2-reset-confirm-title", await page.evaluate(() => document.activeElement?.id));
  await page.getByRole("button", { name: "Hủy" }).click();
  check("reset-cancel-returns-focus", await page.evaluate(() => document.activeElement?.textContent?.includes("Tạo lượt làm mới")));
} catch (error) {
  check("browser-run-completed", false, error instanceof Error ? error.stack : String(error));
} finally {
  await browser.close();
}

console.log(JSON.stringify({ schemaVersion: "paper2-assessment-browser-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
