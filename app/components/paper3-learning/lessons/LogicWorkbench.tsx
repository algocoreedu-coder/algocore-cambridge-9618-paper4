"use client";

import { useId, useMemo, useState } from "react";
import type { Locale } from "@/app/lib/paper3/catalog";
import { circuitDefinition, circuitExamples, circuitTrace, evaluateCircuitSop, type CircuitExampleId, type CircuitState, type LogicGate } from "@/app/lib/paper3/logic-models";
import { StateControls, StateExplanation, StateHeading, StateTable } from "./Section15VisualPrimitives";
import styles from "./Section15Workbench.module.css";

function GateSymbol({ operation, inputCount }: { readonly operation: LogicGate["operation"]; readonly inputCount: number }) {
  const count = operation === "NOT" ? 1 : inputCount;
  const inputY = count === 1 ? [24] : Array.from({ length: count }, (_, index) => 11 + index * 26 / (count - 1));
  return <svg viewBox="0 0 80 48" data-gate-symbol={operation} data-input-count={count} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
    {inputY.map((y, index) => {
      const t = (y - 5) / 38;
      const connectionX = operation === "NOT" ? 17 : operation === "AND" ? 18 : 14 + 30 * t * (1 - t);
      return <line key={index} data-gate-input-wire={index + 1} x1="2" y1={y} x2={connectionX} y2={y} />;
    })}
    {operation === "NOT" ? <><path d="M17 5L53 24L17 43Z" /><circle cx="58" cy="24" r="5" /><path d="M63 24H78" /></> : operation === "AND" ? <><path d="M18 5H36C67 5 67 43 36 43H18Z" /><path d="M60 24H78" /></> : <><path d="M14 5Q45 3 65 24Q45 45 14 43Q29 24 14 5Z" /><path d="M65 24H78" />{operation === "XOR" && <path d="M8 5Q23 24 8 43" />}</>}
  </svg>;
}
function CircuitStateText({ state, locale }: { readonly state: CircuitState; readonly locale: Locale }) {
  return <div><p>{Object.entries(state.inputBits).map(([name, value]) => `${name}=${value}`).join(" · ")}</p><p>{Object.entries(state.nodeValues).map(([name, value]) => `${name}=${value ?? (locale === "vi" ? "chưa tính" : "not evaluated")}`).join(" · ")}</p><p>{locale === "vi" ? "Nút đang xét" : "Active node"}: {state.activeNode ?? "—"}</p><p>{locale === "vi" ? "Hàng đã ghi" : "Recorded rows"}: {state.recordedRows.join(", ") || "—"}</p><p>{locale === "vi" ? "Hàng Y=1 được chọn" : "Selected Y=1 rows"}: {state.highlightedOneRows.join(", ") || "—"}</p><p>SOP: {state.sopTerms.length ? state.sopTerms.map(term => `(${term})`).join(" OR ") : "—"}</p><p>{locale === "vi" ? "Biểu diễn" : "Representation"}: {state.representation}</p><p>{locale === "vi" ? "Đã kiểm tra tương đương" : "Equivalence checked"}: {state.equivalent === null ? locale === "vi" ? "Chưa" : "Not yet" : String(state.equivalent)}</p></div>;
}

export function LogicWorkbench({ kind, locale }: { readonly kind: "logic-circuit"; readonly locale: Locale }) {
  const selectId = useId();
  const [exampleId, setExampleId] = useState<CircuitExampleId>("2-input");
  const [bits, setBits] = useState("00");
  const [index, setIndex] = useState(0);
  const example = circuitDefinition(exampleId);
  const trace = useMemo(() => circuitTrace(exampleId, bits), [exampleId, bits]);
  const step = trace.steps[index];
  const state = step.after;
  const known = { ...state.inputBits, ...state.nodeValues };
  const notEvaluated = locale === "vi" ? "Chưa tính" : "Not evaluated";
  const sopCircuit = state.representation === "sop-circuit";
  const termRows = trace.rows.filter(row => row.output === 1);
  return <div className={styles.workbench} data-logic-workbench={kind} data-circuit-id={exampleId} data-input-row={bits} data-step-id={step.id}>
    <div className={styles.setup}>
      <div className={styles.field}><label htmlFor={selectId}>{locale === "vi" ? "Mạch mẫu" : "Circuit example"}</label><select id={selectId} data-circuit-select value={exampleId} onChange={event => { const next = circuitDefinition(event.target.value); setExampleId(next.id); setBits(next.defaults.join("")); setIndex(0); }}>{circuitExamples.map(item => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></div>
      <fieldset className={styles.inputBits}><legend>{locale === "vi" ? "Đổi bit đầu vào" : "Toggle input bits"}</legend><div>{example.inputs.map((name, position) => <button key={name} type="button" data-circuit-input={name} aria-pressed={bits[position] === "1"} aria-label={`${name} = ${bits[position]}; ${locale === "vi" ? "đổi bit" : "toggle bit"}`} onClick={() => setBits(current => current.slice(0, position) + (current[position] === "1" ? "0" : "1") + current.slice(position + 1))}>{name} = {bits[position]}</button>)}</div></fieldset>
    </div>
    <StateControls steps={trace.steps} index={index} onChange={setIndex} locale={locale} />
    <div className={styles.body}>
      <StateHeading step={step} index={index} count={trace.steps.length} locale={locale} />
      <p className={styles.caption}>{locale === "vi" ? "Theo thứ tự tính toán để học: tín hiệu có tên nối đầu ra cổng với đầu vào cổng sau. Đây không phải mô phỏng độ trễ vật lý. Đổi đầu vào để tính lại bước đang chọn." : "Follow a teaching evaluation order: named signals connect a gate output to later inputs. This is not a physical timing simulation. Change inputs to recalculate the selected step."}</p>
      <div className={styles.expression} data-circuit-expression>Y = {state.sopTerms.length ? state.sopTerms.map(term => `(${term})`).join(" OR ") : example.expression}</div>
      {sopCircuit ? <section className={styles.panel} data-sop-circuit><h4>{locale === "vi" ? "Mạch dựng lại từ các tích" : "Circuit rebuilt from product terms"}</h4><p>{locale === "vi" ? "Mỗi nhánh AND biểu diễn một hàng Y=1; các nhánh cùng đi vào cổng OR. NOT đảo từng đầu vào cần đảo." : "Each AND branch represents a Y=1 row; all branches feed OR. NOT inverts each required input."}</p><div className={styles.circuit}>{termRows.map((row, termIndex) => {
        const termValue = row.inputBits === bits ? 1 : 0;
        return <div className={styles.gate} key={row.inputBits} data-sop-term={row.inputBits} data-term-value={termValue}><div className={styles.gateTop}><GateSymbol operation="AND" inputCount={example.inputs.length} /><strong>T{termIndex + 1} · AND</strong></div><div className={styles.gateInputs}>{example.inputs.map((name, position) => <span key={name}>{row.inputBits[position] === "0" ? "NOT " : ""}{name} = {row.inputBits[position] === "0" ? 1 - state.inputBits[name] : state.inputBits[name]}</span>)}</div><div className={styles.gateOutput}><span>T{termIndex + 1} → OR</span><strong>{termValue}</strong></div></div>;
      })}<div className={styles.gate} data-sop-or><div className={styles.gateTop}><GateSymbol operation="OR" inputCount={termRows.length} /><strong>Y · OR</strong></div><div className={styles.gateInputs}>{termRows.map((row, position) => <span key={row.inputBits}>T{position + 1} = {row.inputBits === bits ? 1 : 0}</span>)}</div><div className={styles.gateOutput}><span>Y</span><strong>{evaluateCircuitSop(exampleId, bits)}</strong></div></div></div></section> : <div className={styles.circuit} data-original-circuit>{example.gates.map(gate => <section key={gate.id} className={styles.gate} data-gate-id={gate.id} data-node-value={state.nodeValues[gate.id] ?? "unknown"} data-active={state.activeNode === gate.id} aria-label={`${gate.id}: ${gate.operation}`}><div className={styles.gateTop}><GateSymbol operation={gate.operation} inputCount={gate.inputs.length} /><strong>{gate.id} · {gate.operation}</strong></div><div className={styles.gateInputs}>{gate.inputs.map(name => <span key={name}>{name} → {known[name] ?? "?"}</span>)}</div><div className={styles.gateOutput}><span>{state.activeNode === gate.id ? locale === "vi" ? "Vừa tính" : "Just evaluated" : locale === "vi" ? "Đầu ra" : "Output"}: {gate.id}</span><strong>{state.nodeValues[gate.id] ?? "?"}</strong></div>{state.nodeValues[gate.id] === null && <p>{notEvaluated}</p>}</section>)}</div>}
      <div className={styles.output}><span>{locale === "vi" ? "Đầu ra đang xét" : "Current output"} · Y</span><strong data-circuit-output={state.nodeValues[example.output] ?? "unknown"}>{state.nodeValues[example.output] ?? "?"}</strong></div>
      <section className={styles.truthPanel}><h4>{locale === "vi" ? "Từ từng hàng đến bảng đầy đủ" : "From one row to the complete table"}</h4><p>{locale === "vi" ? "Chọn một tổ hợp để đổi đầu vào. Dấu — là hàng chưa được ghi ở bước minh họa này, không có nghĩa đầu ra bằng 0. A là bit cao nhất." : "Select a combination to change inputs. A dash is a row not recorded at this trace step, not an output of 0. A is the most significant bit."}</p><p data-recorded-row-count>{locale === "vi" ? "Số hàng đã ghi trong minh họa" : "Rows recorded in the trace"}: {state.recordedRows.length}/{trace.rows.length}</p><div className={styles.tableScroll} role="region" tabIndex={0} aria-label={locale === "vi" ? "Bảng chân trị của mạch" : "Circuit truth table"}><table data-circuit-truth-table><caption>{locale === "vi" ? "Thứ tự nhị phân tăng dần; đủ mọi tổ hợp để kiểm tra tương đương." : "Ascending binary order; every combination is needed to verify equivalence."}</caption><thead><tr><th scope="col">{example.inputs.join("")}</th>{example.gates.filter(gate => gate.id !== example.output).map(gate => <th key={gate.id} scope="col">{gate.id}</th>)}<th scope="col">Y</th>{state.equivalent !== null && <th scope="col">Y (SOP)</th>}<th scope="col">{locale === "vi" ? "Hàng được chọn" : "Selected row"}</th></tr></thead><tbody>{trace.rows.map(row => {
        const recorded = state.recordedRows.includes(row.inputBits);
        return <tr key={row.inputBits} data-truth-row={row.inputBits} data-selected={row.inputBits === bits} data-one={state.highlightedOneRows.includes(row.inputBits)} data-recorded={recorded}><th scope="row"><button type="button" aria-pressed={row.inputBits === bits} aria-label={`${locale === "vi" ? "Chọn đầu vào" : "Select inputs"} ${row.inputBits}`} onClick={() => setBits(row.inputBits)}>{row.inputBits}</button></th>{example.gates.filter(gate => gate.id !== example.output).map(gate => <td key={gate.id}>{recorded ? row.nodeValues[gate.id] : "—"}</td>)}<td data-truth-output={recorded ? row.output : "unrecorded"}>{recorded ? row.output : "—"}</td>{state.equivalent !== null && <td>{evaluateCircuitSop(exampleId, row.inputBits)}</td>}<td>{state.highlightedOneRows.includes(row.inputBits) ? "Y = 1" : "—"}</td></tr>;
      })}</tbody></table></div></section>
      {state.sopTerms.length > 0 && <section className={styles.truthPanel}><h4>{locale === "vi" ? "Mỗi hàng Y=1 tạo một tích" : "Each Y=1 row creates one product term"}</h4><div className={styles.terms}>{state.sopTerms.map((term, position) => <div key={term} data-one={termRows[position].inputBits === bits}>{termRows[position].inputBits} → {term}</div>)}</div></section>}
      {state.equivalent !== null && <p className={styles.event} data-equivalence={state.equivalent}>{locale === "vi" ? `Đã đối chiếu cả ${trace.rows.length} tổ hợp: mạch gốc và mạch SOP cho cùng đầu ra. Một ví dụ đầu vào riêng lẻ chưa đủ chứng minh tương đương.` : `All ${trace.rows.length} combinations agree between the original and SOP circuits. A single input example is not enough to prove equivalence.`}</p>}
      <StateExplanation step={step} locale={locale} />
    </div>
    <StateTable steps={trace.steps} selectedId={step.id} locale={locale} before={item => <CircuitStateText state={item.before} locale={locale} />} after={item => <CircuitStateText state={item.after} locale={locale} />} />
  </div>;
}
