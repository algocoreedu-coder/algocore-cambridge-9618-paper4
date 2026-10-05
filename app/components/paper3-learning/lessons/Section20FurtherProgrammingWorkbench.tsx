"use client";

import { useId, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import {
  addressingModeTrace,
  assemblyExecutionTrace,
  classEncapsulationTrace,
  declarativeProofTrace,
  exceptionFlowTrace,
  oopDispatchTrace,
  paradigmProceduralTrace,
  randomFileTrace,
  sequentialFileTrace,
  type FurtherProgrammingTrace,
  type FurtherProgrammingVisualKind,
} from "@/app/lib/paper3/further-programming-models";
import styles from "./Section20FurtherProgrammingWorkbench.module.css";

export type Section20VisualKind = FurtherProgrammingVisualKind;
type JsonMap = Record<string, unknown>;
type Slide = {
  readonly id: string;
  readonly activeLine: string;
  readonly title: Localized;
  readonly rule: Localized;
  readonly outcome: Localized;
  readonly codeLine: string;
  readonly before: unknown;
  readonly after: unknown;
};

const L = (en: string, vi: string): Localized => ({ en, vi });
const scenarioIds: Record<Section20VisualKind, readonly string[]> = {
  "paradigm-procedural": ["recognise-low-level", "recognise-procedural", "recognise-oop", "recognise-declarative", "function-return", "procedure-state", "function-missing-return"],
  "addressing-modes": ["immediate", "direct", "indirect", "indexed", "relative-forward", "relative-backward", "indirect-dangling", "indexed-out-of-range", "relative-out-of-range"],
  "assembly-workbench": ["data-move", "arithmetic-store", "branch-taken", "branch-not-taken", "short-program", "construct-load", "construct-branch", "invalid-opcode", "invalid-address"],
  "oop-encapsulation": ["instantiate-two", "get-private", "set-valid", "set-invalid", "direct-private-access", "design-class"],
  "oop-relationships": ["override-dispatch", "inherited-method", "aggregation-state", "choose-inheritance", "choose-aggregation", "invalid-is-a", "invalid-has-a"],
  "declarative-inference": ["direct-fact", "one-rule", "two-hop", "variable-binding", "unsatisfied", "malformed-goal"],
  "sequential-files": ["read-to-eof", "write-replaces", "append-preserves", "process-copy", "empty-read", "closed-read", "missing-read"],
  "random-files": ["read-middle", "update-middle", "seek-only", "read-first", "read-last", "out-of-range", "empty-slot", "sequential-comparison", "byte-offset-example"],
  "exception-flow": ["normal", "missing-file-handled", "invalid-conversion-handled", "divide-zero-handled", "retry-success", "mismatched-unhandled", "finally-closes", "validation-contrast"],
};

const titles: Record<Section20VisualKind, Localized> = {
  "paradigm-procedural": L("Paradigm and procedural-flow explorer", "Khám phá paradigm và luồng procedural"),
  "addressing-modes": L("Five-addressing-mode resolver", "Bộ resolve năm addressing mode"),
  "assembly-workbench": L("Assembly execution workbench", "Bàn thực hành thực thi assembly"),
  "oop-encapsulation": L("Class, object and encapsulation laboratory", "Phòng thí nghiệm class, object và encapsulation"),
  "oop-relationships": L("OOP relationship and dispatch explorer", "Khám phá quan hệ OOP và dispatch"),
  "declarative-inference": L("Declarative proof explorer", "Khám phá phép chứng minh declarative"),
  "sequential-files": L("Sequential file workflow", "Luồng file tuần tự"),
  "random-files": L("Random-file record map", "Bản đồ record của random file"),
  "exception-flow": L("Exception control-flow explorer", "Khám phá control flow của exception"),
};

const conventionIds: Record<Section20VisualKind, string> = {
  "paradigm-procedural": "S20-PSEUDO-2026-1", "addressing-modes": "S20-ASM-COURSEBOOK-1", "assembly-workbench": "S20-ASM-COURSEBOOK-1",
  "oop-encapsulation": "S20-OOP-CAMBRIDGE-1", "oop-relationships": "S20-OOP-CAMBRIDGE-1", "declarative-inference": "S20-DECL-CLAUSE-1",
  "sequential-files": "S20-FILE-TEXT-1", "random-files": "S20-FILE-RANDOM-1", "exception-flow": "S20-EXC-PYTHON-1",
};

const scenarioLabel = (id: string) => id.split("-").map(word => word === "oop" ? "OOP" : word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
const isMap = (value: unknown): value is JsonMap => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const map = (value: unknown): JsonMap => isMap(value) ? value : {};
const compact = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length ? value.map(compact).join(" · ") : "∅";
  return JSON.stringify(value);
};
const stateValue = (state: unknown, ...keys: string[]): unknown => {
  let cursor: unknown = state;
  for (const key of keys) cursor = map(cursor)[key];
  return cursor;
};

function makeTrace(kind: Section20VisualKind, scenario: string): FurtherProgrammingTrace<unknown> {
  switch (kind) {
    case "paradigm-procedural": return paradigmProceduralTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "addressing-modes": return addressingModeTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "assembly-workbench": return assemblyExecutionTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "oop-encapsulation": return classEncapsulationTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "oop-relationships": return oopDispatchTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "declarative-inference": return declarativeProofTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "sequential-files": return sequentialFileTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "random-files": return randomFileTrace(scenario) as FurtherProgrammingTrace<unknown>;
    case "exception-flow": return exceptionFlowTrace(scenario) as FurtherProgrammingTrace<unknown>;
  }
}

function Metric({ label, value, hook }: { readonly label: string; readonly value: unknown; readonly hook?: string }) {
  return <div className={styles.metric} {...(hook ? { [hook]: "" } : {})}><span>{label}</span><strong>{compact(value)}</strong></div>;
}

function MemoryBoard({ state, locale }: { readonly state: unknown; readonly locale: Locale }) {
  const memory = map(stateValue(state, "memory"));
  const registers = map(stateValue(state, "registers"));
  const flags = map(stateValue(state, "flags"));
  const cells = Object.entries(memory);
  return <div className={styles.machine}>
    <div className={styles.metricGrid}>
      <Metric label="Operand" value={stateValue(state, "operandField")} />
      <Metric label="PC / PC reference" value={stateValue(state, "pcReference") ?? stateValue(state, "pc")} />
      <Metric label="IX" value={stateValue(state, "ix") ?? registers.IX} />
      <Metric label={locale === "vi" ? "Địa chỉ hiệu dụng" : "Effective address"} value={stateValue(state, "effectiveAddress")} />
      <Metric label={locale === "vi" ? "Giá trị cuối" : "Final value"} value={stateValue(state, "value") ?? registers.ACC} />
      <Metric label={locale === "vi" ? "So sánh" : "Comparison"} value={flags.comparison} />
    </div>
    <div className={styles.path} role="group" aria-label={locale === "vi" ? "Đường resolve operand" : "Operand resolution path"}>
      {(stateValue(state, "dereferencePath") as unknown[] | undefined)?.map((address, index) => <span key={`${compact(address)}-${index}`} data-address={compact(address)}>{index ? "→ " : ""}M[{compact(address)}]</span>) ?? null}
    </div>
    {cells.length ? <div className={styles.memoryGrid}>{cells.map(([address, value]) => <div key={address} data-address={address}><small>{address}</small><strong>{compact(value)}</strong></div>)}</div> : null}
  </div>;
}

function ObjectBoard({ state, locale }: { readonly state: unknown; readonly locale: Locale }) {
  const items = (stateValue(state, "instances") ?? stateValue(state, "objects") ?? []) as unknown[];
  const relations = (stateValue(state, "relationships") ?? []) as unknown[];
  const definition = stateValue(state, "classDefinition") ?? stateValue(state, "class");
  return <div className={styles.objectBoard}>
    {definition ? <article className={styles.classCard}><small>{locale === "vi" ? "Class blueprint" : "Class blueprint"}</small><pre tabIndex={0}>{JSON.stringify(definition, null, 2)}</pre></article> : null}
    <div className={styles.objectGrid}>{items.map((item, index) => { const row = map(item); const id = compact(row.id ?? row.name ?? index); return <article key={id} data-object-id={id}><small>{compact(row.class ?? row.className ?? row.type ?? "Object")}</small><strong>{id}</strong><pre tabIndex={0}>{JSON.stringify(row.state ?? row, null, 2)}</pre></article>; })}</div>
    {relations.length ? <div className={styles.relationships}>{relations.map((relation, index) => <span key={index}>{compact(relation)}</span>)}</div> : null}
    <div className={styles.metricGrid}><Metric label="Receiver" value={stateValue(state, "receiverId")} /><Metric label="Actual type" value={stateValue(state, "actualType")} /><Metric label="Method" value={stateValue(state, "selectedMethod") ?? stateValue(state, "method")} /><Metric label="Result" value={stateValue(state, "result") ?? stateValue(state, "returnValue")} /></div>
  </div>;
}

function ProofBoard({ state, locale }: { readonly state: unknown; readonly locale: Locale }) {
  const facts = (stateValue(state, "facts") ?? []) as unknown[];
  const rules = (stateValue(state, "rules") ?? []) as unknown[];
  const proof = (stateValue(state, "proof") ?? stateValue(state, "proofNodes") ?? []) as unknown[];
  return <div className={styles.proofBoard}>
    <article><small>{locale === "vi" ? "Facts được cung cấp" : "Supplied facts"}</small>{facts.map((fact, index) => <code key={index}>{compact(fact)}</code>)}</article>
    <article><small>{locale === "vi" ? "Rules đã duyệt" : "Reviewed rules"}</small>{rules.map((rule, index) => <code key={index}>{compact(rule)}</code>)}</article>
    <article><small>{locale === "vi" ? "Goal và proof chain" : "Goal and proof chain"}</small><strong>{compact(stateValue(state, "goal"))}</strong>{proof.map((node, index) => <span key={index} data-state="proved">{index ? "→ " : ""}{compact(node)}</span>)}</article>
    <div className={styles.metricGrid}><Metric label="Bindings" value={stateValue(state, "bindings") ?? stateValue(state, "solutions")} /><Metric label="Status" value={stateValue(state, "status")} /></div>
  </div>;
}

function FileBoard({ state, locale }: { readonly state: unknown; readonly locale: Locale }) {
  const records = (stateValue(state, "records") ?? stateValue(state, "slots") ?? []) as unknown[];
  const pointer = stateValue(state, "pointer");
  return <div className={styles.fileBoard}>
    <div className={styles.metricGrid}><Metric label="Mode" value={stateValue(state, "mode")} /><Metric label="Pointer" value={pointer} /><Metric label="EOF" value={stateValue(state, "eof")} /><Metric label={locale === "vi" ? "File đang mở" : "File open"} value={stateValue(state, "isOpen")} /></div>
    <div className={styles.recordRail}>{records.map((record, index) => <article key={index} data-record-id={String(index)} data-state={String(pointer) === String(index) ? "active" : "idle"}><small>{locale === "vi" ? "Record" : "Record"} {index}</small><strong>{compact(record)}</strong></article>)}</div>
    <div className={styles.metricGrid}><Metric label="Selected" value={stateValue(state, "selectedRecord") ?? stateValue(state, "record")} /><Metric label="Output" value={stateValue(state, "outputRecords")} /><Metric label="Sequential path" value={stateValue(state, "sequentialPath")} /><Metric label="Byte offset" value={stateValue(state, "byteOffset") ?? stateValue(state, "offset")} /></div>
  </div>;
}

function ExceptionBoard({ state, locale }: { readonly state: unknown; readonly locale: Locale }) {
  const raised = Boolean(stateValue(state, "raised"));
  const matched = stateValue(state, "matchedHandler");
  const status = stateValue(state, "status");
  const nodes = [
    [locale === "vi" ? "Protected block" : "Protected block", "try"],
    [locale === "vi" ? "Thao tác rủi ro" : "Risky operation", raised ? "raised" : "normal"],
    [raised ? compact(stateValue(state, "exceptionType")) : (locale === "vi" ? "Không raise" : "No raise"), raised ? "raised" : "normal"],
    [matched ? compact(matched) : (raised ? (locale === "vi" ? "Không khớp" : "No match") : (locale === "vi" ? "Bỏ qua handler" : "Skip handlers")), matched ? "handled" : "idle"],
    [compact(status), status === "unhandled" ? "error" : "complete"],
  ];
  return <div className={styles.exceptionFlow}>{nodes.map(([label, stateName], index) => <div key={index} data-handler-id={index === 3 ? compact(matched) : undefined} data-state={stateName}><strong>{label}</strong>{index < nodes.length - 1 ? <span aria-hidden="true">→</span> : null}</div>)}<div className={styles.metricGrid}><Metric label="Skipped" value={stateValue(state, "skippedLines")} /><Metric label="Attempt" value={stateValue(state, "attempts") ?? stateValue(state, "attempt")} /><Metric label="Resource open" value={stateValue(state, "resourceOpen")} /><Metric label="Output" value={stateValue(state, "output")} /></div></div>;
}

function ParadigmBoard({ state, locale }: { readonly state: unknown; readonly locale: Locale }) {
  const evidence = (stateValue(state, "evidence") ?? []) as unknown[];
  const callStack = (stateValue(state, "callStack") ?? []) as unknown[];
  return <div className={styles.paradigmBoard}>
    <div className={styles.metricGrid}><Metric label="Mode" value={stateValue(state, "mode")} /><Metric label="Paradigm" value={stateValue(state, "paradigm") ?? stateValue(state, "selectedParadigm")} /><Metric label="Routine" value={stateValue(state, "routine")} /><Metric label="Return" value={stateValue(state, "returnValue")} /></div>
    <div className={styles.twoLane}><article><small>{locale === "vi" ? "Bằng chứng biểu đạt" : "Representation evidence"}</small>{evidence.map((item, index) => <span key={index}>{compact(item)}</span>)}</article><article><small>{locale === "vi" ? "Call stack và variables" : "Call stack and variables"}</small>{callStack.map((item, index) => <span key={index}>{compact(item)}</span>)}<code>{compact(stateValue(state, "variables"))}</code></article></div>
  </div>;
}

function PrimaryVisual({ kind, state, locale }: { readonly kind: Section20VisualKind; readonly state: unknown; readonly locale: Locale }) {
  if (kind === "addressing-modes" || kind === "assembly-workbench") return <MemoryBoard state={state} locale={locale} />;
  if (kind === "oop-encapsulation" || kind === "oop-relationships") return <ObjectBoard state={state} locale={locale} />;
  if (kind === "declarative-inference") return <ProofBoard state={state} locale={locale} />;
  if (kind === "sequential-files" || kind === "random-files") return <FileBoard state={state} locale={locale} />;
  if (kind === "exception-flow") return <ExceptionBoard state={state} locale={locale} />;
  return <ParadigmBoard state={state} locale={locale} />;
}

function StateDigest({ state }: { readonly state: unknown }) {
  return <dl className={styles.stateDigest}>{Object.entries(map(state)).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{compact(value)}</dd></div>)}</dl>;
}

export function Section20FurtherProgrammingWorkbench({ kind, locale }: { readonly kind: Section20VisualKind; readonly locale: Locale }) {
  const labelId = useId();
  const [scenario, setScenario] = useState(scenarioIds[kind][0]);
  const [index, setIndex] = useState(0);
  const trace = useMemo(() => makeTrace(kind, scenario), [kind, scenario]);
  const slides: readonly Slide[] = trace.steps;
  const current = slides[Math.min(index, slides.length - 1)];
  const state = current.after;
  const chooseScenario = (value: string) => { setScenario(value); setIndex(0); };
  const reset = () => { setScenario(scenarioIds[kind][0]); setIndex(0); };
  return <section className={styles.workbench} aria-labelledby={labelId} data-visual-kind={kind} data-s20-step={current.id} data-s20-scenario-id={scenario} data-scenario={scenario} data-active-line={current.activeLine} data-result={compact(stateValue(state, "status"))} {...(stateValue(state, "error") ? { "data-error": compact(stateValue(state, "error")) } : {})}>
    <header className={styles.setup}>
      <div><small>{locale === "vi" ? "Concept-aligned AlgoCore redraw" : "Concept-aligned AlgoCore redraw"}</small><h3 id={labelId}>{titles[kind][locale]}</h3></div>
      <label>{locale === "vi" ? "Kịch bản" : "Scenario"}<select data-s20-scenario value={scenario} onChange={event => chooseScenario(event.target.value)}>{scenarioIds[kind].map(id => <option key={id} value={id}>{scenarioLabel(id)}</option>)}</select></label>
      <div className={styles.convention}><strong>{conventionIds[kind]}</strong><span>{trace.convention[locale]}</span><small>{locale === "vi" ? "AlgoCore teaching fixture · không phải semantics chung cho mọi hệ thống" : "AlgoCore teaching fixture · not universal machine/language semantics"}</small></div>
    </header>
    <nav className={styles.controls} aria-label={locale === "vi" ? "Điều khiển từng bước" : "Step controls"}>
      <button type="button" data-s20-previous disabled={index === 0} onClick={() => setIndex(value => Math.max(0, value - 1))}><ArrowLeft aria-hidden="true" />{locale === "vi" ? "Trước" : "Previous"}</button>
      <button type="button" data-s20-next disabled={index >= slides.length - 1} onClick={() => setIndex(value => Math.min(slides.length - 1, value + 1))}>{locale === "vi" ? "Tiếp" : "Next"}<ArrowRight aria-hidden="true" /></button>
      <button type="button" data-s20-reset onClick={reset}><RotateCcw aria-hidden="true" />{locale === "vi" ? "Đặt lại" : "Reset"}</button>
      <label>{locale === "vi" ? "Đi thẳng tới bước" : "Go directly to step"}<select data-s20-jump value={index} onChange={event => setIndex(Number(event.target.value))}>{slides.map((slide, slideIndex) => <option key={`${slide.id}-${slideIndex}`} value={slideIndex}>{slideIndex}. {slide.title[locale]}</option>)}</select></label>
    </nav>
    <div className={styles.status} role="status" aria-live="polite" data-s20-state>{current.title[locale]}. {current.outcome[locale]}</div>
    <article className={styles.stepCard}>
      <header><span>{locale === "vi" ? `Bước ${index}/${slides.length - 1}` : `Step ${index}/${slides.length - 1}`}</span><h4>{current.title[locale]}</h4><code data-s20-active-line>{current.activeLine}</code></header>
      <div className={styles.ruleGrid}><div><span>{locale === "vi" ? "Rule đang áp dụng" : "Applied rule"}</span><strong data-s20-rule>{current.rule[locale]}</strong></div><div><span>{locale === "vi" ? "Kết quả" : "Outcome"}</span><strong data-s20-outcome>{current.outcome[locale]}</strong></div></div>
    </article>
    <div className={styles.mainGrid}>
      <div className={styles.primary} tabIndex={0} aria-label={locale === "vi" ? `Minh họa trạng thái: ${current.title.vi}` : `State visual: ${current.title.en}`}><PrimaryVisual kind={kind} state={state} locale={locale} /></div>
      <aside className={styles.codePanel}><strong>{locale === "vi" ? "Instruction / code / rule hiện tại" : "Current instruction / code / rule"}</strong><ol>{trace.pseudocode.map((line, lineIndex) => <li key={lineIndex} data-state={line === current.codeLine ? "active" : "idle"}><code>{line}</code></li>)}</ol></aside>
    </div>
    <div className={styles.beforeAfter}><article tabIndex={0} aria-label={locale === "vi" ? "Trạng thái trước bước" : "State before this step"}><span>{locale === "vi" ? "Trước bước" : "Before"}</span><StateDigest state={current.before} /></article><ArrowRight aria-hidden="true" /><article tabIndex={0} aria-label={locale === "vi" ? "Trạng thái sau bước" : "State after this step"}><span>{locale === "vi" ? "Sau bước" : "After"}</span><StateDigest state={current.after} /></article></div>
    <details className={styles.fallback} data-state-fallback><summary>{locale === "vi" ? "Mở bản thay thế dạng text/table/code" : "Open equivalent text/table/code view"}</summary><div className={styles.tableWrap}><table><caption>{locale === "vi" ? "Toàn bộ trace xác định trước" : "Complete deterministic trace"}</caption><thead><tr><th>#</th><th>ID</th><th>Line</th><th>{locale === "vi" ? "Trước" : "Before"}</th><th>{locale === "vi" ? "Sau" : "After"}</th><th>{locale === "vi" ? "Rule" : "Rule"}</th><th>{locale === "vi" ? "Outcome" : "Outcome"}</th></tr></thead><tbody>{slides.map((slide, slideIndex) => <tr key={`${slide.id}-${slideIndex}`} data-fallback-step aria-current={slideIndex === index ? "step" : undefined}><td>{slideIndex}</td><td>{slide.id}</td><td><code>{slide.activeLine}</code></td><td data-state-before>{compact(slide.before)}</td><td data-state-after>{compact(slide.after)}</td><td>{slide.rule[locale]}</td><td>{slide.outcome[locale]}</td></tr>)}</tbody></table></div><pre>{JSON.stringify(state, null, 2)}</pre></details>
  </section>;
}
