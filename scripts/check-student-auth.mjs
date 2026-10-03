import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import axe from "axe-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_ROOT = process.env.STUDENT_AUTH_BUILD_ROOT
  ? path.resolve(process.env.STUDENT_AUTH_BUILD_ROOT)
  : ROOT;
const BUILD_DIST_DIR = process.env.STUDENT_AUTH_DIST_DIR ?? ".next";
try { process.loadEnvFile(path.join(ROOT, ".env.local")); } catch { /* CI may inject the variables. */ }

const BASE_URL = (process.env.STUDENT_AUTH_BASE_URL ?? "http://127.0.0.1:3041").replace(/\/$/, "");
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
const sessionSecret = process.env.STUDENT_SESSION_SECRET ?? process.env.ALGOCORE_SESSION_SECRET;
const COOKIE_NAME = "algocore_student_session";
const MAX_AGE = 60 * 60 * 12;
const PAPER4_ONLY = process.argv.includes("--paper4-only");

if (!username || !password || !sessionSecret) {
  throw new Error("Student auth environment is incomplete. Credentials were not printed.");
}

const checks = [];
const failures = [];
function record(id, passed, message, evidence = {}) {
  const result = { id, passed: Boolean(passed), message, evidence };
  checks.push(result);
  if (!result.passed) failures.push(result);
}

function locationPath(response) {
  const value = response.headers.get("location");
  if (!value) return null;
  const url = new URL(value, BASE_URL);
  return `${url.pathname}${url.search}${url.hash}`;
}

function responseCookie(response) {
  return response.headers.get("set-cookie") ?? "";
}

function cookiePair(setCookie) {
  return setCookie.split(";", 1)[0];
}

function hasNoStore(response) {
  return /(?:^|,)\s*no-store(?:,|$)/i.test(response.headers.get("cache-control") ?? "");
}

async function request(pathname, init = {}) {
  return fetch(new URL(pathname, BASE_URL), { redirect: "manual", ...init });
}

function sameOriginJson(body, cookie = undefined) {
  const headers = {
    "content-type": "application/json",
    origin: BASE_URL,
    "sec-fetch-site": "same-origin",
  };
  if (cookie) headers.cookie = cookie;
  return { method: "POST", headers, body: JSON.stringify(body) };
}

async function login(next = "/paper-4?lang=en", lang = "en") {
  return request("/api/auth/login", sameOriginJson({ username, password, next, lang }));
}

function signedExpiredToken() {
  const expiresAt = Math.floor(Date.now() / 1000) - 5;
  const issuedAt = expiresAt - MAX_AGE;
  const nonce = "A".repeat(24);
  const payload = `v1.${issuedAt}.${expiresAt}.${nonce}`;
  const signature = createHmac("sha256", sessionSecret).update(payload, "utf8").digest("base64url");
  return `${payload}.${signature}`;
}

async function runHttpChecks() {
  const unauthHub = await request("/paper-4?lang=vi");
  const hubLocation = new URL(unauthHub.headers.get("location"), BASE_URL);
  record("AUTH-H01", unauthHub.status === 307 && hubLocation.pathname === "/login"
    && hubLocation.searchParams.get("lang") === "vi"
    && hubLocation.searchParams.get("next") === "/paper-4?lang=vi",
  "Unauthenticated Paper 4 hub redirects to login with safe next and language", {
    status: unauthHub.status, location: `${hubLocation.pathname}${hubLocation.search}`,
  });

  const unauthLesson = await request("/paper-4/lessons/recursion?lang=en");
  const lessonLocation = new URL(unauthLesson.headers.get("location"), BASE_URL);
  record("AUTH-H02", unauthLesson.status === 307 && lessonLocation.pathname === "/login"
    && lessonLocation.searchParams.get("lang") === "en"
    && lessonLocation.searchParams.get("next") === "/paper-4/lessons/recursion?lang=en",
  "Unauthenticated Paper 4 lesson redirects to login with a local Paper 4 next path", {
    status: unauthLesson.status, location: `${lessonLocation.pathname}${lessonLocation.search}`,
  });

  const protectedRoutes = [
    ["AUTH-H03", "/", "/"],
    ["AUTH-H04", "/docs", "/docs"],
    ...(!PAPER4_ONLY ? [
      ["AUTH-H04B", "/paper-3", "/paper-3?lang=en"],
      ["AUTH-P2-MAP", "/paper-2", "/paper-2?lang=en"],
      ["AUTH-P2-SECTION", "/paper-2/sections/9.2?lang=vi", "/paper-2/sections/9.2?lang=vi"],
      ["AUTH-P2-NESTED", "/paper-2/topics/unknown-topic?lang=en", "/paper-2/topics/unknown-topic?lang=en"],
    ] : []),
  ];
  for (const [id, pathname, expectedNext] of protectedRoutes) {
    const response = await request(pathname);
    const redirect = new URL(response.headers.get("location"), BASE_URL);
    record(id, response.status === 307 && redirect.pathname === "/login"
      && redirect.searchParams.get("next") === expectedNext,
    `${pathname} is protected and preserves a safe learning-system next path`, {
      status: response.status, location: `${redirect.pathname}${redirect.search}`,
    });
  }

  for (const [locale, expectedTitle, id] of [
    ["en", "Student sign in", "AUTH-H05"],
    ["vi", "Đăng nhập học sinh", "AUTH-H06"],
  ]) {
    const response = await request(`/login?lang=${locale}`);
    const html = await response.text();
    record(id, response.status === 200
      && html.includes(expectedTitle)
      && html.includes('id="student-username"')
      && html.includes('id="student-password"')
      && html.includes('type="password"')
      && !html.includes(username)
      && !html.includes(password),
    `Login ${locale.toUpperCase()} contains accessible fields without credential literals`, {
      status: response.status, cacheControl: response.headers.get("cache-control"),
    });
    record(`${id}C`, hasNoStore(response), `Login ${locale.toUpperCase()} is not cached`, {
      cacheControl: response.headers.get("cache-control"),
    });
  }

  const wrong = await request("/api/auth/login", sameOriginJson({
    username,
    password: `${password}-incorrect`,
    next: "/paper-4",
    lang: "en",
  }));
  record("AUTH-H07", wrong.status === 401 && !responseCookie(wrong).toLowerCase().includes(`${COOKIE_NAME}=`),
    "Wrong credentials return 401 without a session cookie", {
      status: wrong.status, cacheControl: wrong.headers.get("cache-control"), setCookie: Boolean(responseCookie(wrong)),
    });

  const successful = await login("/paper-4/lessons/recursion?lang=en", "en");
  const successfulPayload = await successful.json().catch(() => null);
  const setCookie = responseCookie(successful);
  const studentCookie = cookiePair(setCookie);
  record("AUTH-H08", successful.status === 200
    && successfulPayload?.redirectTo === "/paper-4/lessons/recursion?lang=en"
    && setCookie.startsWith(`${COOKIE_NAME}=`)
    && /;\s*HttpOnly/i.test(setCookie)
    && /;\s*SameSite=Lax/i.test(setCookie)
    && /;\s*Path=\//i.test(setCookie)
    && new RegExp(`;\\s*Max-Age=${MAX_AGE}(?:;|$)`, "i").test(setCookie)
    && hasNoStore(successful),
  "Correct credentials issue a bounded HttpOnly session and safe redirect", {
    status: successful.status,
    redirectTo: successfulPayload?.redirectTo,
    flags: {
      httpOnly: /;\s*HttpOnly/i.test(setCookie),
      sameSiteLax: /;\s*SameSite=Lax/i.test(setCookie),
      pathRoot: /;\s*Path=\//i.test(setCookie),
      maxAge: new RegExp(`;\\s*Max-Age=${MAX_AGE}(?:;|$)`, "i").test(setCookie),
    },
    cacheControl: successful.headers.get("cache-control"),
  });

  const authenticatedRoutes = [
    ["AUTH-H09", "/paper-4?lang=en"],
    ["AUTH-H10", "/paper-4/lessons/recursion?lang=vi"],
    ...(!PAPER4_ONLY ? [
      ["AUTH-H10P", "/paper-3?lang=en"],
      ["AUTH-P2-ACCESS", "/paper-2?lang=vi"],
      ["AUTH-P2-SECTION-ACCESS", "/paper-2/sections/9.2?lang=en"],
    ] : []),
  ];
  for (const [id, pathname] of authenticatedRoutes) {
    const response = await request(pathname, { headers: { cookie: studentCookie } });
    record(id, response.status === 200 && !response.headers.has("location") && hasNoStore(response),
      `Valid session grants ${pathname} and the route is not cached`, {
        status: response.status, cacheControl: response.headers.get("cache-control"),
      });
  }

  if (PAPER4_ONLY) {
    const legacyDocs = await request("/docs", { headers: { cookie: studentCookie } });
    record("AUTH-H10D", legacyDocs.status === 307 && locationPath(legacyDocs) === "/paper-4",
      "Legacy docs entry redirects an authenticated learner to the Paper 4 hub", {
        status: legacyDocs.status, location: locationPath(legacyDocs),
      });
  }

  const token = studentCookie.slice(studentCookie.indexOf("=") + 1);
  const tamperedToken = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;
  const invalidCookies = [
    ["AUTH-H11", `${COOKIE_NAME}=${tamperedToken}`, "tampered"],
    ["AUTH-H12", `${COOKIE_NAME}=${signedExpiredToken()}`, "expired signed"],
    ["AUTH-H13", `${COOKIE_NAME}=malformed`, "malformed"],
  ];
  for (const [id, cookie, label] of invalidCookies) {
    const response = await request("/paper-4?lang=en", { headers: { cookie } });
    record(id, response.status === 307 && locationPath(response)?.startsWith("/login?")
      && /Max-Age=0/i.test(responseCookie(response)),
    `${label} session is rejected and cleared`, {
      status: response.status, location: locationPath(response), cleared: /Max-Age=0/i.test(responseCookie(response)),
    });
  }

  for (const [id, next, lang, expected] of [
    ["AUTH-H14", "https://attacker.invalid/steal", "en", "/paper-4?lang=en"],
    ["AUTH-H15", "//attacker.invalid/steal", "vi", "/paper-4?lang=vi"],
    ["AUTH-H16", "/paper-4%2F%2Fattacker.invalid", "en", "/paper-4?lang=en"],
    ["AUTH-H17", "/docs", "vi", "/docs"],
    ["AUTH-P2-NEXT", "/paper-2/sections/9.2?lang=en#topics", "vi", "/paper-2/sections/9.2?lang=vi#topics"],
    ["AUTH-P2-UNSAFE", "/paper-2-evil?lang=en", "en", "/paper-4?lang=en"],
  ]) {
    const response = await login(next, lang);
    const payload = await response.json().catch(() => null);
    record(id, response.status === 200 && payload?.redirectTo === expected,
      "Unsafe or out-of-scope post-login redirect falls back to Paper 4", {
        status: response.status, redirectTo: payload?.redirectTo, locale: lang,
      });
  }

  const authenticatedLogin = await request("/login?lang=vi&next=%2Fpaper-4%2Flessons%2Frecursion", {
    headers: { cookie: studentCookie },
  });
  record("AUTH-H18", authenticatedLogin.status === 307
    && locationPath(authenticatedLogin) === "/paper-4/lessons/recursion?lang=vi",
  "Authenticated login route redirects to the requested Paper 4 page", {
    status: authenticatedLogin.status, location: locationPath(authenticatedLogin),
  });

  const logout = await request("/api/auth/logout", {
    method: "POST",
    headers: {
      cookie: studentCookie,
      "content-type": "application/x-www-form-urlencoded",
      origin: BASE_URL,
      "sec-fetch-site": "same-origin",
    },
    body: "lang=vi",
  });
  record("AUTH-H19", logout.status === 303
    && locationPath(logout) === "/login?lang=vi"
    && /Max-Age=0/i.test(responseCookie(logout))
    && hasNoStore(logout),
  "Logout clears the cookie, preserves Vietnamese, and is not cached", {
    status: logout.status, location: locationPath(logout), cleared: /Max-Age=0/i.test(responseCookie(logout)),
    cacheControl: logout.headers.get("cache-control"),
  });

  for (const [id, pathname] of [["AUTH-H20", "/api/auth/login"], ["AUTH-H21", "/api/auth/logout"]]) {
    const response = await request(pathname, {
      method: "POST",
      headers: { origin: "https://attacker.invalid", "sec-fetch-site": "cross-site", "content-type": "application/json" },
      body: "{}",
    });
    record(id, response.status === 403 && hasNoStore(response), `${pathname} rejects cross-origin POST`, {
      status: response.status, cacheControl: response.headers.get("cache-control"),
    });
  }

  const asset = await request("/algocore-logo.png");
  record("AUTH-H22", asset.status === 200 && (asset.headers.get("content-type") ?? "").startsWith("image/"),
    "Login logo static asset remains accessible without authentication", {
      status: asset.status, contentType: asset.headers.get("content-type"), cacheControl: asset.headers.get("cache-control"),
    });
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
class CDP {
  constructor(url) { this.id = 0; this.pending = new Map(); this.socket = new WebSocket(url); }
  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function runBrowserChecks() {
  const browserPath = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe",
  ].filter(Boolean).find(existsSync);
  if (!browserPath) {
    record("AUTH-B00", false, "A Chromium browser is required for the 320px, keyboard, and axe checks", {});
    return;
  }

  const profile = await mkdtemp(path.join(os.tmpdir(), "algocore-auth-"));
  const browser = spawn(browserPath, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=320,900", "about:blank",
  ], { windowsHide: true, stdio: "ignore" });
  let cdp;
  try {
    let debugPort;
    for (let attempt = 0; attempt < 150; attempt += 1) {
      try {
        const [value] = (await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).trim().split(/\r?\n/);
        if (/^\d+$/.test(value)) { debugPort = Number(value); break; }
      } catch { /* Browser is starting. */ }
      await delay(100);
    }
    if (!debugPort) throw new Error("Browser debugging port did not become ready.");

    let target;
    for (let attempt = 0; attempt < 150; attempt += 1) {
      try {
        const response = await fetch(`http://127.0.0.1:${debugPort}/json`);
        if (response.ok) {
          target = (await response.json()).find((item) => item.type === "page");
          if (target?.webSocketDebuggerUrl) break;
        }
      } catch { /* Debug endpoint is starting. */ }
      await delay(100);
    }
    if (!target?.webSocketDebuggerUrl) throw new Error("Browser page target did not become ready.");

    cdp = new CDP(target.webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 900, deviceScaleFactor: 1, mobile: false });

    async function evaluate(expression) {
      const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      return result.result.value;
    }
    async function waitFor(expression, label) {
      for (let attempt = 0; attempt < 200; attempt += 1) {
        try { if (await evaluate(`Boolean(${expression})`)) return; } catch { /* Navigation replaces execution context. */ }
        await delay(80);
      }
      throw new Error(`Timed out waiting for ${label}.`);
    }

    const url = `${BASE_URL}/login?lang=en&next=%2Fpaper-4%3Flang%3Den`;
    await cdp.send("Page.navigate", { url });
    await waitFor(`location.href===${JSON.stringify(url)} && document.readyState==='complete' && document.querySelector('#student-password')`, "login readiness");
    await evaluate("document.fonts?.ready ?? Promise.resolve()");
    await delay(250);

    const geometry = await evaluate(`(() => {
      const controls=[...document.querySelectorAll('input,button,a')].filter((element)=>element.getClientRects().length);
      const username=document.querySelector('#student-username');
      const password=document.querySelector('#student-password');
      const submit=document.querySelector('form button[type=submit]');
      return {
        viewportWidth:document.documentElement.clientWidth,
        pageWidth:document.documentElement.scrollWidth,
        noHorizontalPageOverflow:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,
        undersizedControls:controls.map((element)=>{const box=element.getBoundingClientRect();return{tag:element.tagName.toLowerCase(),id:element.id||'',text:(element.textContent||'').trim().slice(0,32),width:Math.round(box.width),height:Math.round(box.height)};}).filter((control)=>control.width<44||control.height<44),
        usernameLabel:Boolean(document.querySelector('label[for=student-username]')),
        passwordLabel:Boolean(document.querySelector('label[for=student-password]')),
        passwordType:password?.type,
        submitText:submit?.textContent?.trim(),
        language:document.documentElement.lang,
        usernameVisible:Boolean(username?.getClientRects().length),
      };
    })()`);
    record("AUTH-B01", geometry.noHorizontalPageOverflow && geometry.undersizedControls.length === 0
      && geometry.usernameLabel && geometry.passwordLabel && geometry.passwordType === "password"
      && geometry.submitText === "Sign in" && geometry.language === "en" && geometry.usernameVisible,
    "Login is usable at 320px with labelled 44px controls", geometry);

    await evaluate("document.querySelector('#student-username').focus()");
    const focusOrder = [await evaluate("document.activeElement.id")];
    for (let index = 0; index < 2; index += 1) {
      await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      focusOrder.push(await evaluate("document.activeElement.id || document.activeElement.textContent.trim()"));
    }
    record("AUTH-B02", focusOrder[0] === "student-username" && focusOrder[1] === "student-password" && focusOrder[2] === "Sign in",
      "Keyboard focus moves username → password → submit", { focusOrder });

    const axeResult = await evaluate(`(async()=>{eval(${JSON.stringify(axe.source)});const result=await window.axe.run(document);return{violations:result.violations.map((item)=>({id:item.id,impact:item.impact,nodes:item.nodes.length}))};})()`);
    record("AUTH-B03", axeResult.violations.length === 0, "Browser axe scan reports no accessibility violations", axeResult);
  } finally {
    cdp?.close();
    browser.kill();
    await delay(800);
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {
      // A Chromium child can briefly retain Windows' profile lock after exit.
      // Cleanup is best-effort and must not hide the actual QA result.
    });
  }
}

await runHttpChecks();
await runBrowserChecks();

const buildId = await readFile(path.join(BUILD_ROOT, BUILD_DIST_DIR, "BUILD_ID"), "utf8").then((value) => value.trim()).catch(() => "unknown");
const report = {
  schema_version: "algocore-student-auth-qa-v1",
  decision: failures.length === 0 ? "PASS" : "FAIL",
  runtime: process.version,
  base_url: BASE_URL,
  build_id: buildId,
  checks: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  failures,
};
console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;
