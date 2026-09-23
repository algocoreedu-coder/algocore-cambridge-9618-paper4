import { createRequire } from "node:module";

const require = createRequire(new URL("../../../../../../algocore-fumadocs/package.json", import.meta.url));
const WebSocket = require("next/dist/compiled/ws");

const debugBase = "http://127.0.0.1:9224";
const appBase = "http://127.0.0.1:3018";
const slugs = [
  "data-models", "procedural-design", "validation-rules", "testing", "text-processing",
  "search-collections", "sorting", "binary-search", "stack", "queue", "linked-list",
  "recursion", "binary-tree", "dictionary", "hashing", "oop-model", "oop-state",
  "oop-inheritance", "oop-aggregation", "text-files", "object-files", "random-files",
  "exceptions", "performance", "graphs", "exam-workflow",
];

class CDP {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async start() {
    if (this.socket.readyState !== WebSocket.OPEN) {
      await new Promise((resolve, reject) => {
        this.socket.addEventListener("open", resolve, { once: true });
        this.socket.addEventListener("error", reject, { once: true });
      });
    }
    this.socket.addEventListener("message", (message) => {
      const payload = JSON.parse(message.data);
      if (payload.id) {
        const waiter = this.pending.get(payload.id);
        if (!waiter) return;
        this.pending.delete(payload.id);
        if (payload.error) waiter.reject(new Error(payload.error.message));
        else waiter.resolve(payload.result);
        return;
      }
      for (const listener of this.listeners.get(payload.method) ?? []) listener(payload.params);
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
    return response.result.value;
  }

  async waitFor(expression, timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        if (await this.evaluate(expression)) return;
      } catch {
        // The execution context can disappear while a Next route changes.
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await this.waitFor(`document.readyState === "complete" && location.href === ${JSON.stringify(url)}`, 20000);
    await this.waitFor(`document.querySelectorAll('[data-practice-item-id]').length === 3 && document.querySelectorAll('[data-retrieval-item-id]').length > 0`, 20000);
  }

  async keys(key, code, windowsVirtualKeyCode) {
    await this.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode });
    await this.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
  }
}

function matrixExpression() {
  return `(() => {
    const practices = [...document.querySelectorAll('[data-practice-item-id]')];
    const retrievals = [...document.querySelectorAll('[data-retrieval-item-id]')];
    const practiceButtons = [...document.querySelectorAll('[data-action="record-practice-attempt"]')];
    const retrievalButtons = [...document.querySelectorAll('[data-action="record-retrieval-response"]')];
    const allTextareas = [...document.querySelectorAll('textarea')];
    return {
      lang: document.documentElement.lang,
      practices: practices.length,
      retrievals: retrievals.length,
      practiceFeedbackInitiallyAbsent: document.querySelectorAll('[data-feedback-after-attempt]').length === 0,
      retrievalReviewInitiallyAbsent: document.querySelectorAll('[data-retrieval-review]').length === 0,
      practiceButtons: practiceButtons.length,
      retrievalButtons: retrievalButtons.length,
      allRecordButtonsDisabled: [...practiceButtons, ...retrievalButtons].every((button) => button.disabled),
      labelledTextareas: allTextareas.filter((textarea) => textarea.labels?.length > 0).length,
      textareas: allTextareas.length,
      onePythonArtifact: document.querySelectorAll('[data-python-artifact-id]').length === 1,
      tenSections: document.querySelectorAll('[data-section-kind]').length === 10,
      noPageOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      runtimeAlerts: document.querySelectorAll('[role="alert"]').length,
    };
  })()`;
}

function focusedInitialExpression(locale) {
  return `(() => {
    const practice = document.querySelector('[data-practice-item-id]');
    const retrieval = document.querySelector('[data-retrieval-item-id]');
    const pButton = practice.querySelector('[data-action="record-practice-attempt"]');
    const rButton = retrieval.querySelector('[data-action="record-retrieval-response"]');
    return {
      locale: document.documentElement.lang,
      expectedLocale: ${JSON.stringify(locale)},
      practiceFeedbackAbsent: !practice.querySelector('[data-feedback-after-attempt]'),
      retrievalReviewAbsent: !retrieval.querySelector('[data-retrieval-review]'),
      practiceButtonDisabled: pButton.disabled,
      retrievalButtonDisabled: rButton.disabled,
      practiceButtonText: pButton.textContent.trim(),
      retrievalButtonText: rButton.textContent.trim(),
      practiceTextareaLabel: practice.querySelector('textarea').labels[0]?.textContent.trim(),
      retrievalTextareaLabel: retrieval.querySelector('textarea').labels[0]?.textContent.trim(),
    };
  })()`;
}

const setTextarea = (selector, value) => `(async () => {
  const textarea = document.querySelector(${JSON.stringify(selector)});
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  setter.call(textarea, ${JSON.stringify(value)});
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 80));
})()`;

async function focusedLocale(cdp, locale) {
  await cdp.navigate(`${appBase}/paper-4/lessons/data-models?lang=${locale}#practice`);
  const initial = await cdp.evaluate(focusedInitialExpression(locale));

  await cdp.evaluate(setTextarea('[data-practice-item-id] textarea', '   '));
  const practiceWhitespaceDisabled = await cdp.evaluate(`document.querySelector('[data-practice-item-id] [data-action="record-practice-attempt"]').disabled`);
  await cdp.evaluate(setTextarea('[data-practice-item-id] textarea', locale === "vi" ? "Kiểm tra capacity trước khi append." : "Check capacity before append."));
  const practiceEnabled = await cdp.evaluate(`!document.querySelector('[data-practice-item-id] [data-action="record-practice-attempt"]').disabled`);
  await cdp.evaluate(`document.querySelector('[data-practice-item-id] [data-action="record-practice-attempt"]').click()`);
  await cdp.waitFor(`document.querySelector('[data-practice-item-id] [data-feedback-after-attempt]') !== null`);
  const practiceRecorded = await cdp.evaluate(`(() => {
    const card = document.querySelector('[data-practice-item-id]');
    const details = card.querySelector('[data-feedback-after-attempt]');
    return {
      feedbackPresent: Boolean(details),
      feedbackClosedInitially: details && !details.open,
      status: card.querySelector('[role="status"]')?.textContent.trim(),
      statusLive: card.querySelector('[role="status"]')?.getAttribute('aria-live'),
    };
  })()`);
  await cdp.evaluate(setTextarea('[data-practice-item-id] textarea', locale === "vi" ? "Đã sửa bài làm." : "Edited attempt."));
  const practiceEditRehides = await cdp.evaluate(`document.querySelector('[data-practice-item-id] [data-feedback-after-attempt]') === null`);

  await cdp.evaluate(setTextarea('[data-retrieval-item-id] textarea', '   '));
  const retrievalWhitespaceDisabled = await cdp.evaluate(`document.querySelector('[data-retrieval-item-id] [data-action="record-retrieval-response"]').disabled`);
  await cdp.evaluate(`document.querySelector('[data-retrieval-item-id] textarea').focus()`);
  await cdp.send("Input.insertText", { text: locale === "vi" ? "Capacity là giới hạn; live count là số phần tử đang dùng." : "Capacity is the limit; live count is the number of used elements." });
  await new Promise((resolve) => setTimeout(resolve, 100));
  const retrievalEnabled = await cdp.evaluate(`!document.querySelector('[data-retrieval-item-id] [data-action="record-retrieval-response"]').disabled`);
  await cdp.keys("Tab", "Tab", 9);
  const tabFocus = await cdp.evaluate(`(() => { const node = document.activeElement; const style = getComputedStyle(node); return { action: node.getAttribute('data-action'), outline: [style.outlineStyle, style.outlineWidth].join(' ') }; })()`);
  await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
  await new Promise((resolve) => setTimeout(resolve, 150));
  const keyboardRecorded = await cdp.evaluate(`document.querySelector('[data-retrieval-item-id] [data-retrieval-review]') !== null`);
  if (!keyboardRecorded) await cdp.evaluate(`document.querySelector('[data-retrieval-item-id] [data-action="record-retrieval-response"]').click()`);
  await cdp.waitFor(`document.querySelector('[data-retrieval-item-id] [data-retrieval-review]') !== null`);
  const retrievalRecorded = await cdp.evaluate(`(() => {
    const card = document.querySelector('[data-retrieval-item-id]');
    const review = card.querySelector('[data-retrieval-review]');
    const answer = review?.querySelector('details');
    const sections = review ? [...review.querySelectorAll(':scope > section')] : [];
    return {
      reviewPresent: Boolean(review),
      recordedResponsePresent: Boolean(review?.querySelector('strong')),
      answerClosedInitially: answer && !answer.open,
      answerSummary: answer?.querySelector('summary')?.textContent.trim(),
      diagnosisPresent: sections.length >= 1,
      repairPresent: sections.length >= 2,
      selfRubricPresent: sections.length >= 3,
      retryPresent: Boolean(review?.querySelector('[data-action="retry-retrieval"]')),
      attemptsText: card.querySelector('[aria-live="polite"]')?.textContent.trim(),
    };
  })()`);
  await cdp.evaluate(`document.querySelector('[data-retrieval-item-id] [data-action="retry-retrieval"]').click()`);
  await cdp.waitFor(`document.querySelector('[data-retrieval-item-id] [data-retrieval-review]') === null`);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const retry = await cdp.evaluate(`(() => { const card = document.querySelector('[data-retrieval-item-id]'); const textarea = card.querySelector('textarea'); return { reviewAbsent: !card.querySelector('[data-retrieval-review]'), valueCleared: textarea.value === '', focusReturned: document.activeElement === textarea, attemptsText: card.querySelector('[aria-live="polite"]')?.textContent.trim() }; })()`);

  return {
    initial,
    practice: { practiceWhitespaceDisabled, practiceEnabled, practiceRecorded, practiceEditRehides },
    retrieval: { retrievalWhitespaceDisabled, retrievalEnabled, tabFocus, keyboardRecorded, retrievalRecorded, retry },
  };
}

async function main() {
  const target = await fetch(`${debugBase}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((response) => response.json());
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.start();
  const diagnostics = { console: [], exceptions: [], network: [] };
  cdp.on("Runtime.consoleAPICalled", (event) => {
    if (["warning", "error"].includes(event.type)) diagnostics.console.push({ type: event.type, args: event.args.map((arg) => arg.value ?? arg.description) });
  });
  cdp.on("Runtime.exceptionThrown", (event) => diagnostics.exceptions.push(event.exceptionDetails?.exception?.description ?? event.exceptionDetails?.text));
  cdp.on("Network.loadingFailed", (event) => {
    if (!event.canceled) diagnostics.network.push({ errorText: event.errorText, blockedReason: event.blockedReason ?? null });
  });
  await Promise.all([
    cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Network.enable"), cdp.send("Accessibility.enable"),
  ]);
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  const matrix = [];
  for (const slug of slugs) {
    for (const locale of ["vi", "en"]) {
      await cdp.navigate(`${appBase}/paper-4/lessons/${slug}?lang=${locale}`);
      matrix.push({ slug, locale, ...(await cdp.evaluate(matrixExpression())) });
    }
  }

  const focused = {
    vi: await focusedLocale(cdp, "vi"),
    en: await focusedLocale(cdp, "en"),
  };

  const landmarks = {};
  for (const locale of ["vi", "en"]) {
    await cdp.navigate(`${appBase}/paper-4/lessons/data-models?lang=${locale}`);
    const dom = await cdp.evaluate(`(() => ({
      mainCount: document.querySelectorAll('main').length,
      sectionHeaderCount: document.querySelectorAll('[data-section-kind] > header').length,
      tocNavigationCount: document.querySelectorAll('[role="navigation"][aria-label=${JSON.stringify(locale === "vi" ? "Mục lục bài học" : "Lesson table of contents")} ]').length,
      namedNavigations: [...document.querySelectorAll('nav, [role="navigation"]')].map((nav) => nav.getAttribute('aria-label') || nav.getAttribute('aria-labelledby')).filter(Boolean),
      tocPopoverCount: document.querySelectorAll('[class*="toc-popover"], [data-toc-popover]').length,
    }))()`);
    const ax = await cdp.send("Accessibility.getFullAXTree");
    const roleNodes = ax.nodes.filter((node) => ["banner", "main", "navigation"].includes(node.role?.value));
    landmarks[locale] = {
      ...dom,
      axBannerCount: roleNodes.filter((node) => node.role?.value === "banner").length,
      axMainCount: roleNodes.filter((node) => node.role?.value === "main").length,
      axNavigationNames: roleNodes.filter((node) => node.role?.value === "navigation").map((node) => node.name?.value ?? ""),
    };
  }

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 900, deviceScaleFactor: 1, mobile: true });
  const mobile = {};
  for (const locale of ["vi", "en"]) {
    await cdp.navigate(`${appBase}/paper-4/lessons/data-models?lang=${locale}#retrieval`);
    mobile[locale] = await cdp.evaluate(`(() => {
    const cards = [...document.querySelectorAll('[data-practice-item-id], [data-retrieval-item-id]')];
    const controls = [...document.querySelectorAll('textarea, [data-action="record-practice-attempt"], [data-action="record-retrieval-response"]')];
    return {
      viewport: [innerWidth, innerHeight],
      documentScrollWidth: document.documentElement.scrollWidth,
      noPageOverflow: document.documentElement.scrollWidth <= innerWidth,
      cardsOutsideViewport: cards.filter((node) => { const box = node.getBoundingClientRect(); return box.left < 0 || box.right > innerWidth + 1; }).length,
      controlsOutsideViewport: controls.filter((node) => { const box = node.getBoundingClientRect(); return box.left < 0 || box.right > innerWidth + 1; }).length,
      textareaResize: getComputedStyle(document.querySelector('[data-retrieval-item-id] textarea')).resize,
      tocPopoverCandidates: document.querySelectorAll('[class*="toc-popover"], [data-toc-popover]').length,
      visibleTocPopoverCandidates: [...document.querySelectorAll('[class*="toc-popover"], [data-toc-popover]')].filter((node) => { const style = getComputedStyle(node); const box = node.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0; }).length,
      visibleTocNamedNavigation: [...document.querySelectorAll('[role="navigation"][aria-label="${locale === "vi" ? "Mục lục bài học" : "Lesson table of contents"}"]')].filter((node) => { const style = getComputedStyle(node); const box = node.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0; }).length,
      visibleTocButtons: [...document.querySelectorAll('button')].filter((node) => /on this page|table of contents|mục lục bài học|trong bài này/i.test([node.textContent, node.getAttribute('aria-label')].filter(Boolean).join(' '))).filter((node) => { const style = getComputedStyle(node); const box = node.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0; }).map((node) => ({ text: node.textContent.trim(), ariaLabel: node.getAttribute('aria-label') })),
    };
    })()`);
  }

  const totals = matrix.reduce((acc, row) => ({
    practices: acc.practices + row.practices,
    retrievals: acc.retrievals + row.retrievals,
  }), { practices: 0, retrievals: 0 });
  const failures = matrix.filter((row) =>
    row.lang !== row.locale || row.practices !== 3 || row.practiceButtons !== row.practices ||
    row.retrievalButtons !== row.retrievals || row.textareas !== row.practices + row.retrievals ||
    row.labelledTextareas !== row.textareas || !row.practiceFeedbackInitiallyAbsent ||
    !row.retrievalReviewInitiallyAbsent || !row.allRecordButtonsDisabled || !row.onePythonArtifact ||
    !row.tenSections || !row.noPageOverflow || row.runtimeAlerts !== 0
  );
  const focusedFailures = [];
  for (const locale of ["vi", "en"]) {
    const review = focused[locale];
    const checks = {
      locale: review.initial.locale === locale && review.initial.expectedLocale === locale,
      initial_gate: review.initial.practiceFeedbackAbsent && review.initial.retrievalReviewAbsent && review.initial.practiceButtonDisabled && review.initial.retrievalButtonDisabled,
      practice_gate: review.practice.practiceWhitespaceDisabled && review.practice.practiceEnabled && review.practice.practiceRecorded.feedbackPresent && review.practice.practiceRecorded.feedbackClosedInitially && review.practice.practiceRecorded.statusLive === "polite" && review.practice.practiceEditRehides,
      retrieval_gate: review.retrieval.retrievalWhitespaceDisabled && review.retrieval.retrievalEnabled && review.retrieval.tabFocus.action === "record-retrieval-response" && review.retrieval.tabFocus.outline === "solid 3px" && review.retrieval.keyboardRecorded && review.retrieval.retrievalRecorded.reviewPresent && review.retrieval.retrievalRecorded.answerClosedInitially && review.retrieval.retrievalRecorded.diagnosisPresent && review.retrieval.retrievalRecorded.repairPresent && review.retrieval.retrievalRecorded.selfRubricPresent && review.retrieval.retrievalRecorded.retryPresent,
      retry: review.retrieval.retry.reviewAbsent && review.retrieval.retry.valueCleared && review.retrieval.retry.focusReturned,
    };
    for (const [check, passed] of Object.entries(checks)) if (!passed) focusedFailures.push(`${locale}:${check}`);
  }
  for (const locale of ["vi", "en"]) {
    if (!mobile[locale].noPageOverflow || mobile[locale].cardsOutsideViewport || mobile[locale].controlsOutsideViewport) focusedFailures.push(`${locale}:mobile-overflow`);
    if (mobile[locale].visibleTocNamedNavigation || mobile[locale].visibleTocButtons.length) focusedFailures.push(`${locale}:mobile-duplicate-toc-banner`);
  }
  for (const locale of ["vi", "en"]) {
    const expectedTocName = locale === "vi" ? "Mục lục bài học" : "Lesson table of contents";
    if (landmarks[locale].axMainCount !== 1 || landmarks[locale].tocNavigationCount !== 1 || !landmarks[locale].axNavigationNames.includes(expectedTocName)) focusedFailures.push(`${locale}:landmarks`);
  }
  if (diagnostics.console.length || diagnostics.exceptions.length || diagnostics.network.length) focusedFailures.push("diagnostics:not-clean");
  const status = failures.length === 0 && focusedFailures.length === 0 ? "PASS" : "FAIL";

  cdp.socket.close();
  await fetch(`${debugBase}/json/close/${target.id}`);
  console.log(JSON.stringify({
    candidate: "3849510defd1ca4a4b060daa6696348b8467d359",
    status,
    matrix: { routes: matrix.length, failures, totals, uniqueTotals: { practices: totals.practices / 2, retrievals: totals.retrievals / 2 }, rows: matrix },
    focused,
    focusedFailures,
    landmarks,
    mobile,
    diagnostics,
  }, null, 2));
  if (status !== "PASS") process.exitCode = 1;
}

await main();
