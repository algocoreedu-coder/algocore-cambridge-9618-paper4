import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env.local")); } catch { /* Environment may be supplied by caller. */ }
const base = (process.env.PAPER4_REHEARSAL_BASE_URL ?? "http://127.0.0.1:3059").replace(/\/$/, "");
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
const evidenceDir = path.resolve(root, "../planning/paper4/exam-readiness-coverage-2026-10-02/evidence/e3-ui");
const require = createRequire(import.meta.url);
const playwrightModule = process.env.PLAYWRIGHT_MODULE ?? path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { chromium } = require(playwrightModule);
const executablePath = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files/Microsoft Edge/Application/msedge.exe"].find((value) => value && existsSync(value));
const checks = [];
const check = (id, pass, detail = null) => checks.push({ id, pass: Boolean(pass), detail });
let browser;

try {
  if (!username || !password || !executablePath) throw new Error("Browser test requires configured student credentials and Chrome/Edge.");
  browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const unauth = await context.request.get(`${base}/paper-4/rehearsals?lang=en`, { maxRedirects: 0 });
  check("AUTH-redirect", unauth.status() === 307 && /\/login/.test(unauth.headers().location ?? ""), { status: unauth.status(), location: unauth.headers().location });
  const login = await context.request.post(`${base}/api/auth/login`, { headers: { origin: base, "sec-fetch-site": "same-origin" }, data: { username, password, next: "/paper-4/rehearsals?lang=en", lang: "en" } });
  check("AUTH-login", login.status() === 200, login.status());
  const page = await context.newPage();
  await page.goto(`${base}/paper-4/rehearsals?lang=en`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  check("HUB-five-packs", await page.locator("[data-rehearsal-hub] article").count() === 5);
  check("HUB-authority", /not official Cambridge/i.test(await page.locator("main").innerText()));
  await page.goto(`${base}/paper-4/rehearsals/ac-p4-diagnostic-2026?lang=en`, { waitUntil: "networkidle" });
  check("DIAGNOSTIC-no-rubric-before-submit", await page.locator('[aria-label="Post-submission rubric"]').count() === 0);
  await page.locator("#answer-0").fill("low 0 high 6 middle 3 value 22, then low 4; answer index 4");
  await page.locator("#notes-0").fill("Check the interval after every comparison.");
  await page.locator("#question-1 fieldset input").first().check();
  await page.reload({ waitUntil: "networkidle" });
  check("PERSIST-answer", /low 0 high 6/.test(await page.locator("#answer-0").inputValue()));
  await page.getByRole("button", { name: "Review and submit" }).click();
  check("SUBMIT-confirmation", await page.getByText("Submit this attempt now?").isVisible());
  await page.getByRole("button", { name: "Confirm submission" }).click();
  await page.locator('[aria-label="Post-submission rubric"]').first().waitFor();
  check("SUBMIT-rubric-after-submit", await page.locator('[aria-label="Post-submission rubric"]').count() === 5);
  check("SUBMIT-locked", await page.locator("#answer-0").isDisabled());
  await page.getByRole("button", { name: "Reset attempt" }).click();
  check("RESET-confirmation", await page.getByText("Erase the saved attempt on this device?").isVisible());
  await page.getByRole("button", { name: "Erase and restart" }).click();
  check("RESET-clears-and-relocks", await page.locator("#answer-0").inputValue() === "" && !await page.locator("#answer-0").isDisabled() && await page.locator('[aria-label="Post-submission rubric"]').count() === 0);
  await page.goto(`${base}/paper-4/rehearsals/ac-p4-half-a-2026?lang=vi`, { waitUntil: "networkidle" });
  check("TIMED-timer", await page.locator('[role="timer"]').count() === 1 && /\d{2}:\d{2}:\d{2}/.test(await page.locator('[role="timer"]').innerText()));
  const timedText = await page.locator("main").innerText();
  check("TIMED-no-hints", timedText.includes("không có gợi ý hoặc lời giải") && !/mở gợi ý|show hint/i.test(timedText));
  for (const [label, width] of [["mobile", 320], ["reflow-200pct", 640]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/paper-4/rehearsals/ac-p4-half-a-2026?lang=vi`, { waitUntil: "networkidle" });
    const layout = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    check(`LAYOUT-${label}`, layout.scroll <= layout.client + 1, layout);
    await page.screenshot({ path: path.join(evidenceDir, `${label}.png`), fullPage: true });
  }
  check("LANG-vi", await page.locator("html").getAttribute("lang") === "vi");
  check("MOTION-reduced", await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));
  const firstQuestionLink = page.locator("nav a[href='#question-1']");
  await firstQuestionLink.focus();
  await page.keyboard.press("Enter");
  check("KEYBOARD-question-nav", new URL(page.url()).hash === "#question-1");
} catch (error) {
  check("BROWSER-run", false, error instanceof Error ? error.stack : String(error));
} finally { await browser?.close(); }

await mkdir(evidenceDir, { recursive: true });
const result = { checkedAt: new Date().toISOString(), base, status: checks.every((item) => item.pass) ? "PASS" : "FAIL", checks };
await writeFile(path.join(evidenceDir, "BROWSER_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, passed: checks.filter((item) => item.pass).length, total: checks.length }, null, 2));
if (result.status !== "PASS") { console.error(checks.filter((item) => !item.pass)); process.exitCode = 1; }
