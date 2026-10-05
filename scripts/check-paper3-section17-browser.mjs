import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, expectedKeyChoice, quantumExpected, tlsExpected, certificateExpected, section17CandidateFiles } from "./check-paper3-section17-oracle.mjs";

const AUTHORING_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = process.env.PAPER3_PREVIEW_DIR ? path.resolve(process.env.PAPER3_PREVIEW_DIR) : AUTHORING_ROOT;
const BASE_URL = (process.env.PAPER3_BASE_URL ?? "http://127.0.0.1:3033").replace(/\/$/, "");
const EVIDENCE_DIR = path.resolve(AUTHORING_ROOT, "../planning/paper3-2026/completion-program-2026/evidence/section17");
const CHROME_CANDIDATES = [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe"].filter(Boolean);
const candidateFiles = section17CandidateFiles;
const checks = [], consoleErrors = [], runtimeErrors = [], captures = [];
const startedAt = new Date().toISOString();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const record = (id, pass, message, evidence = {}) => checks.push({ id, pass: Boolean(pass), message, evidence });
async function exists(file) { try { await access(file); return true; } catch { return false; } }
async function findChrome() { for (const file of CHROME_CANDIDATES) if (await exists(file)) return file; throw new Error("Local Chrome/Edge is unavailable"); }
async function freePort() { return new Promise((resolve, reject) => { const server = net.createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const port = server.address().port; server.close(() => resolve(port)); }); }); }
const hashFiles = async root => Object.fromEntries(await Promise.all(candidateFiles.map(async file => [file, createHash("sha256").update(await readFile(path.join(root, file))).digest("hex")])));

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); this.listeners = new Map(); }
  async open() {
    await new Promise((resolve, reject) => { this.socket.addEventListener("open", resolve, { once: true }); this.socket.addEventListener("error", reject, { once: true }); });
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (!message.id) { for (const listener of this.listeners.get(message.method) ?? []) listener(message.params); return; }
      const pending = this.pending.get(message.id); if (!pending) return;
      this.pending.delete(message.id); clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`)); else pending.resolve(message.result);
    });
  }
  on(method, listener) { this.listeners.set(method, [...(this.listeners.get(method) ?? []), listener]); }
  send(method, params = {}) { const id = this.nextId++; return new Promise((resolve, reject) => { const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000); this.pending.set(id, { resolve, reject, method, timeout }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  close() { for (const pending of this.pending.values()) clearTimeout(pending.timeout); this.pending.clear(); this.socket.close(); }
}

async function evaluate(cdp, expression) { const response = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text); return response.result.value; }
async function waitFor(cdp, expression, label, timeoutMs = 20000) { const start = Date.now(); while (Date.now() - start < timeoutMs) { if (await evaluate(cdp, `Boolean(${expression})`)) return; await delay(100); } throw new Error(`Timed out: ${label}`); }
async function navigate(cdp, route, selector) { const url = new URL(route, BASE_URL).href; await cdp.send("Page.navigate", { url }); await waitFor(cdp, `location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&document.querySelector(${JSON.stringify(selector)})`, route); await delay(120); }
async function viewport(cdp, width, height = 900) { await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height }); await delay(50); }
async function screenshot(cdp, name) { const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true }); await writeFile(path.join(EVIDENCE_DIR, name), Buffer.from(shot.data, "base64")); }
async function axe(cdp, id) { await evaluate(cdp, await readFile(path.join(AUTHORING_ROOT, "node_modules/axe-core/axe.min.js"), "utf8")); const result = await evaluate(cdp, `axe.run(document,{resultTypes:['violations']}).then(r=>r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})))`); record(id, result.length === 0, "Zero serious/critical axe violations", result); }
async function selectAt(cdp, root, index, value) { await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(root)}).querySelectorAll('select')[${index}];if(!n)throw Error('Missing select ${index}');n.value=${JSON.stringify(value)};n.dispatchEvent(new Event('change',{bubbles:true}));})()`); await delay(30); }
async function click(cdp, selector) { await evaluate(cdp, `document.querySelector(${JSON.stringify(selector)}).click()`); await delay(30); }
async function pointerClick(cdp, selector) {
  await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing pointer target');document.documentElement.style.scrollBehavior='auto';document.body.style.scrollBehavior='auto';n.scrollIntoView({behavior:'auto',block:'center',inline:'center'})})()`);
  await delay(80);
  const point = await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(selector)}),b=n.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;if(b.width<=0||b.height<=0||x<0||x>innerWidth||y<0||y>innerHeight)throw Error('Pointer target is outside the viewport');return{x,y}})()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(30);
  return point;
}
async function jump(cdp, root, index) { await evaluate(cdp, `(()=>{const n=document.querySelector(${JSON.stringify(root)}).querySelector('[data-hardware-jump]');n.value=${JSON.stringify(String(index))};n.dispatchEvent(new Event('change',{bubbles:true}));})()`); await delay(30); }
async function controlState(cdp, root) { return evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),j=r.querySelector('[data-hardware-jump]');return{step:r.querySelector('[data-security-step]')?.dataset.securityStep,index:Number(j.value),count:j.options.length,previous:r.querySelector('[data-hardware-previous]').disabled,next:r.querySelector('[data-hardware-next]').disabled}})()`); }
async function renderedStepIds(cdp, root) {
  const count = (await controlState(cdp, root)).count, ids = [];
  for (let index = 0; index < count; index += 1) { await jump(cdp, root, index); ids.push((await controlState(cdp, root)).step); }
  return ids;
}
async function lessonCheckpoints(cdp, slug, lang) {
  const rows = await evaluate(cdp, `[...document.querySelectorAll('[data-checkpoint-id]')].map(r=>({id:r.dataset.checkpointId,choices:[...r.querySelectorAll('input[type=radio]')].map(n=>n.value)}))`);
  for (const row of rows) {
    for (const choice of row.choices) {
      const root = `[data-checkpoint-id="${row.id}"]`;
      await click(cdp, `${root} input[value="${choice}"]`);
      await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),b=[...r.querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(lang === "vi" ? "Kiểm tra câu trả lời" : "Check answer")});if(!b)throw Error('Missing check button');b.click()})()`); await delay(20);
      const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),f=r.querySelector('[data-correct]');return{selected:r.querySelector('input:checked')?.value,correct:f?.dataset.correct,text:f?.innerText??''}})()`);
      record(`S17-CHECKPOINT-${slug}-${lang}-${row.id}-${choice}`, actual.selected === choice && ["true", "false"].includes(actual.correct) && actual.text.length > 8, "Every choice returns explicit localized correctness feedback", actual);
    }
    const root = `[data-checkpoint-id="${row.id}"]`;
    await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),b=[...r.querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(lang === "vi" ? "Xem giải thích" : "Show explanation")});b.click()})()`); await delay(20);
    record(`S17-EXPLANATION-${slug}-${lang}-${row.id}`, await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).innerText.length>100`), "Explanation disclosure renders substantive localized text");
  }
  record(`S17-CHECKPOINT-COUNT-${slug}-${lang}`, rows.length >= 4, "Lesson contains at least four checkpoints", { count: rows.length });
}

async function visualControls(cdp, root, slug, lang) {
  const initial = await controlState(cdp, root);
  record(`S17-CONTROLS-INITIAL-${slug}-${lang}`, initial.index === 0 && initial.previous && initial.count >= 1, "Previous is disabled at the lower boundary", initial);
  if (initial.count > 1) {
    const pointer = await pointerClick(cdp, `${root} [data-hardware-next]`); const next = await controlState(cdp, root);
    const pointerFocused = await evaluate(cdp, `document.activeElement?.hasAttribute('data-hardware-next')===true`);
    record(`S17-CONTROLS-NEXT-${slug}-${lang}`, next.index === 1 && next.step !== initial.step && pointerFocused, "A real CDP mouse click advances one semantic state and focuses the Next control", { initial, next, pointer, pointerFocused });
    await click(cdp, `${root} [data-hardware-reset]`); const reset = await controlState(cdp, root);
    record(`S17-CONTROLS-RESET-${slug}-${lang}`, reset.index === 0 && reset.step === initial.step, "Reset restores the first state", reset);
    await jump(cdp, root, initial.count - 1); const last = await controlState(cdp, root);
    record(`S17-CONTROLS-DIRECT-${slug}-${lang}`, last.index === initial.count - 1 && last.next, "Direct-step selection reaches the upper boundary", last);
    await click(cdp, `${root} [data-hardware-reset]`);
  }
  await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-state-fallback]').open=true`);
  const fallback = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),rows=[...r.querySelectorAll('[data-fallback-step]')];return{rows:rows.length,selected:rows.filter(n=>n.getAttribute('aria-current')==='step').length,complete:rows.every(n=>n.querySelector('[data-state-before]')?.innerText.trim()&&n.querySelector('[data-state-after]')?.innerText.trim())}})()`);
  record(`S17-FALLBACK-${slug}-${lang}`, fallback.rows === initial.count && fallback.selected === 1 && fallback.complete, "Text/table fallback mirrors every step with before/after state", fallback);
  await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-state-fallback]').open=false`);
}

async function scenarioMatrix(cdp, kind, lang) {
  const root = `[data-visual-kind="${kind}"]`;
  if (kind === "key-ownership") {
    const cases = [
      ["private", "asymmetric", "sender", "recipient-public", "true"],
      ["private", "symmetric", "sender", "shared-secret", "true"],
      ["verified", "asymmetric", "sender", "sender-private", "true"],
      ["private", "asymmetric", "recipient", "recipient-private", "true"],
      ["private", "symmetric", "recipient", "shared-secret", "true"],
      ["verified", "asymmetric", "public", "sender-public", "true"],
      ["private", "asymmetric", "sender", "sender-private", "false"],
      ["verified", "symmetric", "sender", "shared-secret", "false"],
    ];
    for (const [goal, mechanism, actor, key, valid] of cases) {
      for (const [index, value] of [goal, mechanism, actor, key].entries()) await selectAt(cdp, root, index, value);
      const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{goal:r.dataset.goal,valid:r.dataset.choiceValid,step:r.querySelector('[data-security-step]').dataset.securityStep,index:r.querySelector('[data-hardware-jump]').value,feedback:r.querySelector('[role=status]').innerText}})()`);
      actual.stepIds = await renderedStepIds(cdp, root);
      actual.finalText = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).innerText`);
      const expected = expectedKeyChoice(goal, mechanism, actor, key);
      const invalidActorLocalized = lang !== "vi" || valid !== "false" || (actual.finalText.includes("Người gửi thử dùng") && !actual.finalText.includes("Sender tries to use"));
      record(`S17-KEY-${lang}-${goal}-${mechanism}-${actor}-${key}`, actual.goal === goal && actual.valid === valid && actual.index === "0" && actual.feedback.length > 10 && JSON.stringify(actual.stepIds) === JSON.stringify(expected.stepIds) && invalidActorLocalized, "Goal/key scenario resets and renders the independent operation sequence with localized invalid-actor action copy", { ...actual, expectedStepIds: expected.stepIds, invalidActorLocalized });
    }
  } else if (kind === "quantum-key-distribution") {
    for (const [scenario, expected] of Object.entries(quantumExpected)) {
      await selectAt(cdp, root, 0, scenario); const stepIds = await renderedStepIds(cdp, root); const atStart = await controlState(cdp, root); await jump(cdp, root, atStart.count - 1);
      const transmissionLabel = lang === "vi" ? "Trạng thái từng lượt truyền" : "Per-transmission state";
      const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),rows=[...r.querySelector(${JSON.stringify(`[aria-label="${transmissionLabel}"]`)}).querySelectorAll('tbody tr')].map(n=>{const c=n.querySelectorAll('th,td');return{position:Number(c[0].innerText),alice:c[1].innerText.trim(),eve:c[2].innerText.trim(),bob:c[3].innerText.trim(),disposition:n.dataset.disposition}});return{scenario:r.dataset.scenario,decision:r.dataset.decision,step:r.querySelector('[data-security-step]').dataset.securityStep,visible:[...r.querySelectorAll('[data-decision]')].at(-1)?.innerText,text:r.innerText,rows}})()`);
      const expectedRows = expected.transmissions.map(row => ({ position: row.position, alice: `${row.aliceBit} / ${row.aliceBasis}`, eve: `${row.eveBasis} / ${row.eveResult}`, bob: `${row.bobBasis} / ${row.bobResult}`, disposition: row.disposition }));
      const rowsMatch = JSON.stringify(actual.rows) === JSON.stringify(expectedRows);
      const localizedDecision = lang === "vi" ? (expected.decision === "accept" ? "chấp nhận" : "hủy") : expected.decision;
      const localizedCandidateKey = lang === "vi" && expected.candidateKey === "discarded" ? "đã loại" : lang === "vi" && scenario === "eve-hidden" ? "Alice 110 · Bob 101 (cần đối soát)" : expected.candidateKey;
      record(`S17-QKD-${lang}-${scenario}`, actual.scenario === scenario && actual.decision === expected.decision && actual.step === "decide" && actual.visible?.toLocaleLowerCase(lang).includes(localizedDecision) && actual.text.includes(localizedCandidateKey) && rowsMatch && JSON.stringify(stepIds) === JSON.stringify(expected.stepIds), "QKD scenario renders the independent step, per-transmission, sample, candidate-key and localized decision oracle", { ...actual, localizedDecision, localizedCandidateKey, stepIds, expectedRows });
      if (scenario === "eve-hidden") {
        await jump(cdp, root, expected.stepIds.indexOf("sample"));
        const sampleEvidence = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),label=${JSON.stringify(lang === "vi" ? "Sai lệch trong mẫu công khai" : "Public-sample mismatches")},span=[...r.querySelectorAll('span')].find(n=>n.querySelector('b')?.innerText.trim()===label);return{narration:r.innerText,label:span?.querySelector('b')?.innerText.trim(),value:span?.childNodes[1]?.textContent?.trim()}})()`);
        const marker = lang === "vi" ? "vị trí 3 và 6" : "positions 3 and 6";
        record(`S17-QKD-HIDDEN-NARRATION-${lang}`, sampleEvidence.narration.includes(marker) && sampleEvidence.label === (lang === "vi" ? "Sai lệch trong mẫu công khai" : "Public-sample mismatches") && sampleEvidence.value === "0", "Hidden-disturbance narration names both unsampled positions while the explicit public-sample mismatch metric remains zero", { marker, ...sampleEvidence });
      }
    }
  } else if (kind === "tls-session") {
    for (const [scenario, expected] of Object.entries(tlsExpected)) {
      await selectAt(cdp, root, 0, scenario); const stepIds = await renderedStepIds(cdp, root); const atStart = await controlState(cdp, root); await jump(cdp, root, atStart.count - 1);
      const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{scenario:r.dataset.scenario,established:r.dataset.sessionEstablished,step:r.querySelector('[data-security-step]').dataset.securityStep,protected:[...r.querySelectorAll('[data-protected=true]')].length,endpointRoles:[...r.querySelectorAll('[data-tls-endpoint-role]')].map(n=>n.dataset.tlsEndpointRole),text:r.innerText}})()`);
      const offlineCoherent = scenario !== "offline" || (lang === "vi" ? !actual.text.includes("Kiểm chứng server") && !actual.text.includes("Trình chứng thư/dữ liệu handshake") : !actual.text.includes("Validates server") && !actual.text.includes("Presents certificate/handshake data"));
      const endpointRolesCoherent = JSON.stringify(actual.endpointRoles) === JSON.stringify(scenario === "offline" ? ["local-device", "no-server"] : ["client", "server"]);
      record(`S17-TLS-${lang}-${scenario}`, actual.scenario === scenario && actual.established === String(expected.protectedData) && actual.step === expected.stepIds.at(-1) && (expected.protectedData ? actual.protected > 0 : actual.protected === 0) && JSON.stringify(stepIds) === JSON.stringify(expected.stepIds) && offlineCoherent && endpointRolesCoherent, "TLS scenario renders the exact path; offline mode uses local-device/no-server endpoints and never presents TLS certificate roles", { ...actual, stepIds, offlineCoherent, endpointRolesCoherent });
    }
  } else {
    await selectAt(cdp, root, 0, "acquire"); let stepIds = await renderedStepIds(cdp, root); let state = await controlState(cdp, root); await jump(cdp, root, state.count - 1);
    let actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{mode:r.dataset.mode,result:r.dataset.signatureResult,step:r.querySelector('[data-security-step]').dataset.securityStep,artefacts:[...r.querySelectorAll('[data-certificate-artefact]')].map(n=>n.dataset.certificateArtefact)}})()`);
    const acquireArtefacts = ["subject", "public-key-request", "ca-check", "certificate"];
    record(`S17-CERT-${lang}-acquire`, actual.mode === "acquire" && actual.result === certificateExpected["acquire|valid"].result && actual.step === "issue" && JSON.stringify(stepIds) === JSON.stringify(certificateExpected["acquire|valid"].stepIds) && JSON.stringify(actual.artefacts) === JSON.stringify(acquireArtefacts), "Certificate acquisition renders only identity, public-key request, CA-check and issued-certificate artefacts", { ...actual, stepIds, expectedArtefacts: acquireArtefacts });
    await selectAt(cdp, root, 0, "verify");
    for (const signatureCase of ["valid", "tampered", "wrong-key"]) {
      await selectAt(cdp, root, 1, signatureCase); stepIds = await renderedStepIds(cdp, root); state = await controlState(cdp, root); await jump(cdp, root, state.count - 1);
      actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{mode:r.dataset.mode,result:r.dataset.signatureResult,step:r.querySelector('[data-security-step]').dataset.securityStep,artefacts:[...r.querySelectorAll('[data-certificate-artefact]')].map(n=>n.dataset.certificateArtefact),text:r.innerText}})()`);
      const expected = certificateExpected[`verify|${signatureCase}`];
      const confidentialityCopy = lang === "vi" ? actual.text.includes("Bí mật: không") && actual.text.includes("mã hóa riêng") : actual.text.includes("Confidentiality: none") && actual.text.includes("separate encryption");
      const verifyArtefacts = ["message", "digest", "signature", "certificate"];
      await jump(cdp, root, expected.stepIds.indexOf("deliver"));
      const deliveryText = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).innerText`);
      const deliveryLocalized = lang !== "vi" || (deliveryText.includes(signatureCase === "tampered" ? "Thông điệp nhận: Từ chối kết quả." : "Thông điệp nhận: Duyệt kết quả.") && !deliveryText.includes("Received message:"));
      record(`S17-CERT-${lang}-${signatureCase}`, actual.mode === "verify" && actual.result === expected.result && actual.step === "verify" && confidentialityCopy && JSON.stringify(stepIds) === JSON.stringify(expected.stepIds) && JSON.stringify(actual.artefacts) === JSON.stringify(verifyArtefacts) && deliveryLocalized, "Signature verification renders ordered separate artefacts and localized delivery evidence before certificate and signature checks", { ...actual, stepIds, expectedArtefacts: verifyArtefacts, deliveryLocalized, deliveryText });
    }
  }

  if (kind === "key-ownership") {
    for (const [index, value] of ["verified", "symmetric", "public", "shared-secret"].entries()) await selectAt(cdp, root, index, value);
    await click(cdp, `${root} [data-hardware-reset]`);
    const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{values:[...r.querySelectorAll('select')].slice(0,4).map(n=>n.value),index:r.querySelector('[data-hardware-jump]').value}})()`);
    record(`S17-RESET-DEFAULT-${lang}-${kind}`, JSON.stringify(actual.values) === JSON.stringify(["private", "asymmetric", "sender", "recipient-public"]) && actual.index === "0", "Reset restores the default key goal, mechanism, actor, key and first step", actual);
  } else if (kind === "quantum-key-distribution") {
    await selectAt(cdp, root, 0, "eve-detected"); await click(cdp, `${root} [data-hardware-reset]`);
    const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{scenario:r.dataset.scenario,value:r.querySelector('select').value,index:r.querySelector('[data-hardware-jump]').value}})()`);
    record(`S17-RESET-DEFAULT-${lang}-${kind}`, actual.scenario === "clean" && actual.value === "clean" && actual.index === "0", "Reset restores the clean QKD scenario and first step", actual);
  } else if (kind === "tls-session") {
    await selectAt(cdp, root, 0, "offline"); await click(cdp, `${root} [data-hardware-reset]`);
    const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{scenario:r.dataset.scenario,value:r.querySelector('select').value,index:r.querySelector('[data-hardware-jump]').value}})()`);
    record(`S17-RESET-DEFAULT-${lang}-${kind}`, actual.scenario === "login" && actual.value === "login" && actual.index === "0", "Reset restores the login TLS scenario and first step", actual);
  } else {
    await selectAt(cdp, root, 0, "verify"); await selectAt(cdp, root, 1, "wrong-key"); await click(cdp, `${root} [data-hardware-reset]`);
    const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});return{mode:r.dataset.mode,values:[...r.querySelectorAll('select')].map(n=>n.value),index:r.querySelector('[data-hardware-jump]').value}})()`);
    await selectAt(cdp, root, 0, "verify");
    actual.signatureCaseAfterReturningToVerify = await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelectorAll('select')[1].value`);
    record(`S17-RESET-DEFAULT-${lang}-${kind}`, actual.mode === "acquire" && actual.values[0] === "acquire" && actual.index === "0" && actual.signatureCaseAfterReturningToVerify === "valid", "Reset restores certificate acquisition mode, valid case and first step", actual);
  }
}

async function layoutMatrix(cdp, root, slug, lang) {
  for (const width of [1440, 768, 320]) {
    await viewport(cdp, width);
    const actual = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)});const bad=[...r.querySelectorAll('button,select,[tabindex]')].filter(n=>n.getClientRects().length&&!n.closest('[role=region],details:not([open])')).map(n=>{const b=n.getBoundingClientRect();return{tag:n.tagName,left:b.left,right:b.right,text:(n.innerText||n.value||'').slice(0,80)}}).filter(n=>n.left<0||n.right>innerWidth+1);return{width:innerWidth,documentWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,bad}})()`);
    record(`S17-LAYOUT-${slug}-${lang}-${width}`, actual.documentWidth <= actual.clientWidth + 1 && actual.bad.length === 0, "Viewport and visible controls have no horizontal clipping", actual);
    captures.push({ type: "layout", slug, lang, ...actual });
  }
}

async function regressionPage(cdp, id, route, selector = "main") {
  await viewport(cdp, 1440); await navigate(cdp, route, selector);
  const actual = await evaluate(cdp, `(()=>{const main=document.querySelector('main'),text=main?.innerText??document.body.innerText;return{title:document.querySelector('h1')?.innerText??document.title,textLength:text.length,applicationError:/application error|could not be found|404 -/i.test(text)}})()`);
  record(`S17-REGRESSION-${id}`, Boolean(actual.title) && actual.textLength > 100 && !actual.applicationError, "Protected route renders substantive content without an application/404 error", actual);
}

async function runRegressions(cdp) {
  for (const lang of ["en", "vi"]) {
    await regressionPage(cdp, `PAPER3-MAP-${lang}`, `/paper-3?lang=${lang}`, "[data-paper3-map]");
    await click(cdp, '[data-paper3-map] button[data-section-id="17"]');
    const mapDetail = await evaluate(cdp, `(()=>{const d=document.querySelector('#paper3-section-detail'),link=d.querySelector(${JSON.stringify(`a[href="/paper-3/sections/17?lang=${lang}"]`)});return{heading:d.querySelector('#paper3-selected-title')?.innerText,link:link?.getAttribute('href'),linkText:link?.innerText,selected:document.querySelector('[data-paper3-map] button[data-section-id="17"]')?.getAttribute('aria-pressed')}})()`);
    record(`S17-REGRESSION-PAPER3-MAP-SECTION17-${lang}`, mapDetail.selected === "true" && mapDetail.link?.includes(`/paper-3/sections/17?lang=${lang}`) && mapDetail.linkText?.includes("4"), "Study Map selects Section 17 and exposes its four-topic overview in the active locale", mapDetail);
    await regressionPage(cdp, `SECTION17-OVERVIEW-${lang}`, `/paper-3/sections/17?lang=${lang}`, '[data-section-id="17"]');
    const section17 = await evaluate(cdp, `(()=>{const rows=[...document.querySelectorAll('[data-topic-id^="P3-17."]')].map(n=>({id:n.dataset.topicId,href:n.getAttribute('href'),text:n.innerText}));return{rows,allAvailable:rows.length===4&&rows.every(n=>n.href?.includes('/paper-3/topics/')&&n.text.includes(${JSON.stringify(lang === "vi" ? "Mở bài học và minh họa" : "Open lesson and visual")}))}})()`);
    record(`S17-REGRESSION-SECTION17-AVAILABLE-${lang}`, section17.allAvailable, "Section 17 overview exposes exactly four promoted lesson routes in the active locale", section17);
    await regressionPage(cdp, `SECTION15-${lang}`, `/paper-3/sections/15?lang=${lang}`, '[data-section-id="15"]');
    await regressionPage(cdp, `SECTION16-${lang}`, `/paper-3/sections/16?lang=${lang}`, '[data-section-id="16"]');
  }

  await regressionPage(cdp, "SECTION14-TCP", "/paper-3/topics/tcp-ip-stack-and-message-journey?lang=en", '[data-visual-kind="tcp-ip-stack"]');
  const tcpBefore = await evaluate(cdp, `document.querySelector('[data-visual-kind="tcp-ip-stack"]').dataset.visualStep`);
  await click(cdp, '[data-visual-kind="tcp-ip-stack"] [data-network-next]');
  const tcpAfter = await evaluate(cdp, `document.querySelector('[data-visual-kind="tcp-ip-stack"]').dataset.visualStep`);
  record("S17-REGRESSION-SECTION14-TCP-CONTROL", tcpAfter !== tcpBefore, "Section 14 TCP/IP Next control still advances", { tcpBefore, tcpAfter });

  await regressionPage(cdp, "SECTION14-PROTOCOL", "/paper-3/topics/application-protocol-selection?lang=vi", '[data-visual-kind="application-protocols"]');
  await click(cdp, '[data-visual-kind="application-protocols"] [data-protocol-option]'); await click(cdp, '[data-visual-kind="application-protocols"] [data-protocol-check]');
  const protocol = await evaluate(cdp, `(()=>{const r=document.querySelector('[data-visual-kind="application-protocols"]');return{seen:r.dataset.answerSeen,feedback:Boolean(r.querySelector('[data-correct]')),choice:r.dataset.protocolChoice}})()`);
  record("S17-REGRESSION-SECTION14-PROTOCOL-CONTROL", protocol.feedback && protocol.choice !== "none", "Section 14 protocol choice and feedback still work", protocol);

  await regressionPage(cdp, "SECTION15-LESSON", "/paper-3/topics/risc-and-cisc?lang=en", '[data-hardware-scale-workbench="risc-cisc"]');
  let shared = await controlState(cdp, '[data-hardware-scale-workbench="risc-cisc"]'); await click(cdp, '[data-hardware-scale-workbench="risc-cisc"] [data-hardware-next]');
  let advanced = await controlState(cdp, '[data-hardware-scale-workbench="risc-cisc"]');
  record("S17-REGRESSION-SECTION15-SHARED-CONTROLS", shared.index === 0 && advanced.index === 1, "Section 15 shared StateControls still advance", { shared, advanced });

  await regressionPage(cdp, "SECTION16-LESSON", "/paper-3/topics/resources-processes-and-states?lang=vi", '[data-section16-workbench="process-states"]');
  shared = await controlState(cdp, '[data-section16-workbench="process-states"]'); await click(cdp, '[data-section16-workbench="process-states"] [data-hardware-next]'); advanced = await controlState(cdp, '[data-section16-workbench="process-states"]');
  record("S17-REGRESSION-SECTION16-SHARED-CONTROLS", shared.index === 0 && advanced.index === 1, "Section 16 shared StateControls still advance", { shared, advanced });

  await regressionPage(cdp, "PAPER4", "/paper-4?lang=en");
  await regressionPage(cdp, "DOCS", "/docs");
  await regressionPage(cdp, "DESIGN-SYSTEM", "/paper-4/design-system");
}

async function runScenario(cdp) {
  for (const lesson of lessons) for (const lang of ["en", "vi"]) {
    const root = `[data-visual-kind="${lesson.kind}"]`, route = `/paper-3/topics/${lesson.slug}?lang=${lang}&qa=section17#observe`;
    await viewport(cdp, 1440); await navigate(cdp, route, root);
    const shell = await evaluate(cdp, `(()=>{const l=document.querySelector('[data-paper3-lesson]'),d=document.querySelector('[data-teacher-sources]');return{topic:l?.dataset.paper3Lesson,lessonLang:l?.lang,documentLang:document.documentElement.lang,primer:Boolean(document.querySelector('[data-cambridge-primer]')),sourcesOpen:d?.open,summary:d?.querySelector('summary')?.innerText,href:location.href}})()`);
    record(`S17-ROUTE-${lesson.slug}-${lang}`, shell.topic === lesson.topicId && shell.lessonLang === lang && shell.documentLang === lang && shell.primer && shell.sourcesOpen === false && shell.summary === (lang === "vi" ? "Tài liệu giáo viên (tùy chọn)" : "Teacher references (optional)"), "Canonical localized lesson, primer and collapsed teacher disclosure render", shell);
    await visualControls(cdp, root, lesson.slug, lang);
    await scenarioMatrix(cdp, lesson.kind, lang);
    await lessonCheckpoints(cdp, lesson.slug, lang);
    await layoutMatrix(cdp, root, lesson.slug, lang);
    await viewport(cdp, 320); await axe(cdp, `S17-AXE-${lesson.slug}-${lang}`);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const motion = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),seconds=v=>Math.max(...v.split(',').map(x=>x.trim().endsWith('ms')?parseFloat(x)/1000:parseFloat(x)||0));return{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,animated:[...r.querySelectorAll('*')].filter(n=>seconds(getComputedStyle(n).transitionDuration)>.001||seconds(getComputedStyle(n).animationDuration)>.001).length}})()`);
    record(`S17-MOTION-${lesson.slug}-${lang}`, motion.reduced && motion.animated === 0, "Reduced-motion removes visual transitions/animations", motion);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    await viewport(cdp, 768); await evaluate(cdp, "document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');document.querySelector('[data-visual-kind]').scrollIntoView({block:'center',behavior:'instant'})"); await delay(80); await screenshot(cdp, `QA_SECTION17_${lesson.slug}-${lang}-dark-768.png`);
    await evaluate(cdp, "document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')");
    captures.push({ type: "lesson", slug: lesson.slug, lang, shell, controls: await controlState(cdp, root) });
  }

  const first = lessons[0], root = `[data-visual-kind="${first.kind}"]`;
  await viewport(cdp, 1440); await navigate(cdp, `/paper-3/topics/${first.slug}?lang=en&qa=history#observe`, root);
  await click(cdp, `${root} [data-hardware-reset]`);
  await evaluate(cdp, `document.querySelector(${JSON.stringify(root)}).querySelector('[data-hardware-next]').focus()`);
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r", unmodifiedText: "\r" }); await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter" }); await delay(50);
  const keyboard = await evaluate(cdp, `(()=>{const r=document.querySelector(${JSON.stringify(root)}),a=document.activeElement,s=getComputedStyle(a);return{index:r.querySelector('[data-hardware-jump]').value,focused:a.hasAttribute('data-hardware-next'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth)}})()`);
  record("S17-KEYBOARD", keyboard.index === "1" && keyboard.focused && keyboard.outline !== "none" && keyboard.width >= 2, "Native Enter changes state and retains visible focus", keyboard);
  await cdp.send("Page.reload", { ignoreCache: true }); await waitFor(cdp, `document.readyState==='complete'&&document.querySelector(${JSON.stringify(root)})`, "deep-link reload");
  record("S17-DEEP-LINK-RELOAD", await evaluate(cdp, "location.hash==='#observe'&&new URLSearchParams(location.search).get('qa')==='history'&&document.documentElement.lang==='en'"), "Deep link, query and locale survive reload");

  const historyTarget = lessons[1], historyTargetRoot = `[data-visual-kind="${historyTarget.kind}"]`;
  await navigate(cdp, `/paper-3/topics/${historyTarget.slug}?lang=vi&qa=history#observe`, historyTargetRoot);
  await evaluate(cdp, "history.back()");
  await waitFor(cdp, `location.pathname===${JSON.stringify(`/paper-3/topics/${first.slug}`)}&&document.documentElement.lang==='en'&&document.querySelector(${JSON.stringify(root)})`, "browser history back to Section 17 key lesson");
  await click(cdp, `${root} [data-hardware-reset]`); await click(cdp, `${root} [data-hardware-next]`);
  const backState = await controlState(cdp, root);
  record("S17-HISTORY-BACK", backState.index === 1 && backState.step === "apply-operation" && await evaluate(cdp, "location.hash==='#observe'&&new URLSearchParams(location.search).get('qa')==='history'"), "Back restores the EN route/deep link and its visual remains stateful", backState);
  await evaluate(cdp, "history.forward()");
  await waitFor(cdp, `location.pathname===${JSON.stringify(`/paper-3/topics/${historyTarget.slug}`)}&&document.documentElement.lang==='vi'&&document.querySelector(${JSON.stringify(historyTargetRoot)})`, "browser history forward to Section 17 QKD lesson");
  await click(cdp, `${historyTargetRoot} [data-hardware-reset]`); await click(cdp, `${historyTargetRoot} [data-hardware-next]`);
  const forwardState = await controlState(cdp, historyTargetRoot);
  record("S17-HISTORY-FORWARD", forwardState.index === 1 && forwardState.step === "quantum-channel" && await evaluate(cdp, "location.hash==='#observe'&&new URLSearchParams(location.search).get('qa')==='history'"), "Forward restores the VI route/deep link and its visual remains stateful", forwardState);
  await runRegressions(cdp);
}

await mkdir(EVIDENCE_DIR, { recursive: true });
let chrome, profile, cdp, browser = null, buildId = null, sourceBefore = null, sourceAfter = null, snapshotBefore = null, snapshotAfter = null, binding = {};
try {
  sourceBefore = await hashFiles(AUTHORING_ROOT); snapshotBefore = await hashFiles(ROOT);
  const authoringComparableFiles = candidateFiles.filter(file => file !== "content/paper3/lesson-status.json");
  const sourceMatches = authoringComparableFiles.every(file => sourceBefore[file] === snapshotBefore[file]);
  buildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim();
  const expectedBuildId = process.env.PAPER3_EXPECTED_BUILD_ID ?? null;
  const servedHtml = await (await fetch(`${BASE_URL}/paper-3?lang=en`, { cache: "no-store", signal: AbortSignal.timeout(20000) })).text();
  binding = { sourceMatches, comparedAuthoringFiles: authoringComparableFiles, excludedPromotionMetadata: ["content/paper3/lesson-status.json"], buildId, expectedBuildId, servedBuildMarker: servedHtml.includes(buildId), isolatedPreview: ROOT !== AUTHORING_ROOT };
  record("S17-BINDING-START", sourceMatches && (!expectedBuildId || buildId === expectedBuildId) && binding.servedBuildMarker, "Served build and candidate source are bound before browser execution", binding);
  const chromePath = await findChrome(), debugPort = await freePort();
  profile = await mkdtemp(path.join(os.tmpdir(), "algocore-section17-"));
  chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank"], { windowsHide: true, stdio: "ignore" });
  let version;
  for (let attempt = 0; attempt < 100; attempt += 1) { try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); if (response.ok) { version = await response.json(); break; } } catch { /* owned browser starting */ } await delay(100); }
  if (!version) throw new Error("Owned Chrome/Edge DevTools endpoint did not start");
  browser = version.Browser;
  const tab = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
  cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.open();
  cdp.on("Runtime.consoleAPICalled", event => { if (event.type === "error") consoleErrors.push(event.args.map(arg => arg.value ?? arg.description ?? "").join(" ")); });
  cdp.on("Runtime.exceptionThrown", event => runtimeErrors.push(event.exceptionDetails));
  await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Accessibility.enable")]);
  await runScenario(cdp);
  sourceAfter = await hashFiles(AUTHORING_ROOT); snapshotAfter = await hashFiles(ROOT);
  const stable = candidateFiles.every(file => sourceAfter[file] === sourceBefore[file] && snapshotAfter[file] === snapshotBefore[file]);
  const endBuildId = (await readFile(path.join(ROOT, ".next/BUILD_ID"), "utf8")).trim();
  record("S17-BINDING-END", stable && endBuildId === buildId, "Product source and build ID remain stable through browser execution", { stable, buildId, endBuildId });
  record("S17-CONSOLE", consoleErrors.length === 0 && runtimeErrors.length === 0, "No console errors or runtime exceptions", { consoleErrors, runtimeErrors });
} catch (error) {
  record("S17-INCOMPLETE", false, "Browser gate did not complete", { error: error.stack ?? String(error), consoleErrors, runtimeErrors });
} finally {
  cdp?.close();
  if (chrome && chrome.exitCode === null) { chrome.kill(); await Promise.race([new Promise(resolve => chrome.once("exit", resolve)), delay(1500)]); }
  if (profile) { const resolved = path.resolve(profile), relative = path.relative(path.resolve(os.tmpdir()), resolved); if (relative && !relative.startsWith("..") && !path.isAbsolute(relative) && path.basename(resolved).startsWith("algocore-section17-")) try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* crashpad cleanup can lag */ } }
}

const failures = checks.filter(check => !check.pass), decision = failures.length ? "FAIL" : "PASS";
const report = {
  schemaVersion: 1,
  gate: "paper3-section17-independent-browser",
  startedAt,
  completedAt: new Date().toISOString(),
  decision,
  buildId,
  baseUrl: BASE_URL,
  previewRoot: ROOT,
  isolatedPreview: ROOT !== AUTHORING_ROOT,
  binding,
  browser,
  checksRun: checks.length,
  checksPassed: checks.length - failures.length,
  failures,
  coverage: { lessons: 4, locales: 2, viewports: [320, 768, 1440], scenarioFamilies: 4, screenshots: captures.filter(item => item.type === "lesson").length, checkpoints: checks.filter(check => check.id.startsWith("S17-CHECKPOINT-") && !check.id.includes("COUNT")).length, regressionChecks: checks.filter(check => check.id.startsWith("S17-REGRESSION-")).length, regressionSurfaces: ["Paper 3 Study Map", "Section 14 TCP/IP", "Section 14 protocols", "Section 15", "Section 16", "Paper 4", "/docs", "shared design system"] },
  consoleErrors,
  runtimeErrors,
  candidateHashes: snapshotBefore,
  limitations: ROOT === AUTHORING_ROOT ? ["Executed against the authoring checkout. A final promotion decision still requires a named isolated snapshot and explicit expected build ID."] : [],
  checks,
};
await writeFile(path.join(EVIDENCE_DIR, "QA_BROWSER_STATES.json"), `${JSON.stringify({ schemaVersion: 1, buildId, baseUrl: BASE_URL, captures }, null, 2)}\n`);
await writeFile(path.join(EVIDENCE_DIR, "QA_BROWSER_RESULT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, checks: undefined, candidateHashes: undefined }, null, 2));
if (decision !== "PASS") process.exitCode = 1;
