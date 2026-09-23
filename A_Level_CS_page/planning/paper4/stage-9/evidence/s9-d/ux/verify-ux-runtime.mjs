import { createRequire } from "node:module";

const require = createRequire(new URL("../../../../../../algocore-fumadocs/package.json", import.meta.url));
const WebSocket = require("next/dist/compiled/ws");

const debugBase = "http://127.0.0.1:9223";
const appBase = "http://127.0.0.1:3018";

class CDP {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
  }

  async ready() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  onMessage(message) {
    const payload = JSON.parse(message.data);
    if (payload.id) {
      const waiter = this.pending.get(payload.id);
      if (!waiter) return;
      this.pending.delete(payload.id);
      if (payload.error) waiter.reject(new Error(payload.error.message));
      else waiter.resolve(payload.result);
      return;
    }
    const waiters = this.events.get(payload.method);
    if (!waiters?.length) return;
    this.events.set(payload.method, []);
    for (const waiter of waiters) waiter(payload.params);
  }

  async start() {
    await this.ready();
    this.socket.addEventListener("message", (event) => this.onMessage(event));
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timed out: ${method}`)), timeoutMs);
      const waiters = this.events.get(method) ?? [];
      waiters.push((params) => {
        clearTimeout(timeout);
        resolve(params);
      });
      this.events.set(method, waiters);
    });
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      try {
        const state = await this.evaluate(`({ ready: document.readyState, href: location.href })`);
        if (state.ready === "complete" && state.href === url) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          return;
        }
      } catch {
        // The execution context can disappear briefly during navigation.
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timed out navigating to ${url}`);
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  }
}

async function main() {
  const target = await fetch(`${debugBase}/json/new?${encodeURIComponent("about:blank")}`, {
    method: "PUT",
  }).then((response) => response.json());
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.start();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 320,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });

  const report = { viewport: "320x900", checks: {} };

  for (const locale of ["vi", "en"]) {
    await cdp.navigate(`${appBase}/paper-4/lessons/data-models?lang=${locale}`);
    report.checks[`locale_${locale}`] = await cdp.evaluate(`(() => ({
      htmlLang: document.documentElement.lang,
      title: document.title,
      toc: document.querySelector('#toc-title')?.textContent?.trim(),
      themeLabel: document.querySelector('[data-theme-toggle]')?.getAttribute('aria-label'),
      sidebarLabels: Array.from(document.querySelectorAll('button[aria-label]')).map((node) => node.getAttribute('aria-label')).filter((value) => /Sidebar|điều hướng/i.test(value ?? '')),
      blockCount: document.querySelectorAll('[data-block-kind]').length,
      hydrationErrors: Array.from(document.querySelectorAll('nextjs-portal')).map((node) => node.textContent).filter(Boolean)
    }))()`);
  }

  report.checks.mobile = await cdp.evaluate(`(() => {
    const lab = document.querySelector('[data-testid="paper4-visual-lab"]');
    const codeBlocks = Array.from(document.querySelectorAll('pre, code'));
    return {
      innerWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      noPageOverflow: document.documentElement.scrollWidth <= window.innerWidth,
      runtimeWidth: lab?.getBoundingClientRect().width ?? null,
      runtimeWithinViewport: lab ? lab.getBoundingClientRect().right <= window.innerWidth + 1 : false,
      localOverflowContainers: codeBlocks.filter((node) => node.scrollWidth > node.clientWidth).length,
      ancestorRects: lab ? Array.from((function* () { let node = lab; while (node) { yield node; node = node.parentElement; } })()).slice(0, 12).map((node) => ({ tag: node.tagName, id: node.id, className: String(node.className).slice(0, 100), width: node.getBoundingClientRect().width, left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right, display: getComputedStyle(node).display, gridArea: getComputedStyle(node).gridArea, gridTemplateColumns: getComputedStyle(node).gridTemplateColumns, gridTemplateAreas: getComputedStyle(node).gridTemplateAreas })) : []
    };
  })()`);

  report.checks.heading = await cdp.evaluate(`(() => {
    const action = document.querySelector('#action-view');
    const runtime = action?.querySelector('[data-testid="paper4-visual-lab"]');
    return {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      blockH2: document.querySelectorAll('[data-block-kind] > header h2').length,
      actionTitle: action?.querySelector(':scope > header h2')?.textContent?.trim(),
      runtimeHeadingTag: runtime?.querySelector(':scope > header h3')?.tagName ?? null,
      runtimeHeadingText: runtime?.querySelector(':scope > header h3')?.textContent?.trim() ?? null
    };
  })()`);

  await cdp.evaluate(`localStorage.setItem('theme', 'dark')`);
  await cdp.navigate(`${appBase}/paper-4/lessons/data-models?lang=en`);
  report.checks.dark = await cdp.evaluate(`(() => {
    const lab = document.querySelector('[data-testid="paper4-visual-lab"]');
    const style = lab ? getComputedStyle(lab) : null;
    return {
      htmlClass: document.documentElement.className,
      active: document.documentElement.classList.contains('dark'),
      runtimeInk: style?.getPropertyValue('--pv-ink').trim(),
      runtimePaper: style?.getPropertyValue('--pv-paper').trim(),
      foreground: style?.color,
      background: style?.backgroundColor
    };
  })()`);

  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  report.checks.reducedMotion = await cdp.evaluate(`(() => {
    const progress = document.querySelector('[data-testid="event-progress"] span');
    const style = progress ? getComputedStyle(progress) : null;
    return {
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      transitionDuration: style?.transitionDuration ?? null,
      animationDuration: style?.animationDuration ?? null
    };
  })()`);

  await cdp.navigate(`${appBase}/paper-4/lessons/binary-tree?lang=vi`);
  await cdp.evaluate(`(() => {
    document.body.setAttribute('tabindex', '-1');
    document.body.focus();
    document.body.removeAttribute('tabindex');
  })()`);
  const focusPath = [];
  for (let index = 0; index < 10; index += 1) {
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    focusPath.push(await cdp.evaluate(`(() => {
      const node = document.activeElement;
      const style = node ? getComputedStyle(node) : null;
      return {
        tag: node?.tagName ?? null,
        text: node?.textContent?.trim().slice(0, 80) ?? null,
        href: node?.getAttribute?.('href') ?? null,
        ariaLabel: node?.getAttribute?.('aria-label') ?? null,
        outline: style ? [style.outlineStyle, style.outlineWidth, style.outlineColor].join(' ') : null
      };
    })()`));
  }
  report.checks.keyboard = {
    focusPath,
    skipLinkFirst: focusPath[0]?.href === '#recognition',
    visibleFocusCount: focusPath.filter((item) => item.outline && !item.outline.startsWith('none 0px')).length,
  };

  await cdp.navigate(`${appBase}/paper-4/lessons/binary-tree?lang=vi#action-view`);
  await cdp.evaluate(`document.querySelector('#pattern-select')?.focus()`);
  const runtimeFocusPath = [];
  for (let index = 0; index < 10; index += 1) {
    runtimeFocusPath.push(await cdp.evaluate(`(() => {
      const node = document.activeElement;
      const style = node ? getComputedStyle(node) : null;
      return { tag: node?.tagName ?? null, action: node?.getAttribute?.('data-action') ?? null, type: node?.getAttribute?.('type') ?? null, outline: style ? [style.outlineStyle, style.outlineWidth].join(' ') : null };
    })()`));
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  }
  report.checks.keyboard.runtimeFocusPath = runtimeFocusPath;
  report.checks.keyboard.runtimeVisibleFocus = runtimeFocusPath.filter((item) => item.outline && !item.outline.startsWith('none 0px')).length;

  await cdp.evaluate(`(async () => {
    const lab = document.querySelector('[data-testid="paper4-visual-lab"]');
    const pattern = lab.querySelector('#pattern-select');
    pattern.selectedIndex = Math.min(1, pattern.options.length - 1);
    pattern.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 100));
    const scenario = Array.from(lab.querySelectorAll('select')).find((node) => node.id !== 'pattern-select' && node.options.length > 1);
    if (scenario) {
      scenario.selectedIndex = Math.min(2, scenario.options.length - 1);
      scenario.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 80));
      scenario.closest('form')?.requestSubmit();
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
    lab.querySelector('[data-action="next"]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 80));
    lab.querySelector('[data-action="next"]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 120));
  })()`);
  const beforeSwitch = await cdp.evaluate(`(() => {
    const lab = document.querySelector('[data-testid="paper4-visual-lab"]');
    return {
      slug: location.pathname,
      hash: location.hash,
      locale: lab?.getAttribute('lang'),
      pattern: lab?.getAttribute('data-pattern-id'),
      scenario: lab?.getAttribute('data-scenario-id'),
      eventIndex: lab?.querySelector('[data-testid="event-progress"]')?.getAttribute('data-event-index'),
      revision: lab?.getAttribute('data-input-revision')
    };
  })()`);
  await cdp.evaluate(`document.querySelector('a[hreflang="en"]')?.click()`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const afterSwitch = await cdp.evaluate(`(() => {
    const lab = document.querySelector('[data-testid="paper4-visual-lab"]');
    return {
      slug: location.pathname,
      hash: location.hash,
      search: location.search,
      htmlLang: document.documentElement.lang,
      locale: lab?.getAttribute('lang'),
      pattern: lab?.getAttribute('data-pattern-id'),
      scenario: lab?.getAttribute('data-scenario-id'),
      eventIndex: lab?.querySelector('[data-testid="event-progress"]')?.getAttribute('data-event-index'),
      revision: lab?.getAttribute('data-input-revision')
    };
  })()`);
  report.checks.localeState = {
    before: beforeSwitch,
    after: afterSwitch,
    preserved: ["slug", "hash", "pattern", "scenario", "eventIndex", "revision"].every((key) => beforeSwitch[key] === afterSwitch[key]),
  };

  await cdp.navigate(`${appBase}/paper-4/lessons/testing?lang=en#action-view`);
  report.checks.staticFallback = await cdp.evaluate(`(() => {
    const action = document.querySelector('#action-view');
    const note = action?.querySelector('[role="note"]');
    return {
      runtimeCount: action?.querySelectorAll('[data-testid="paper4-visual-lab"]').length ?? -1,
      hasNote: Boolean(note),
      text: note?.textContent?.replace(/\\s+/g, ' ').trim() ?? null,
      labHref: note?.querySelector('a')?.getAttribute('href') ?? null
    };
  })()`);

  cdp.socket.close();
  console.log(JSON.stringify(report, null, 2));
}

await main();
