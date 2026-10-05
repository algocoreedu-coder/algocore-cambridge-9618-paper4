"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/app/components/algocore-ui";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import { pipelineCellFeedback, pipelineInstructionMatrix, pipelineScenarios, pipelineTrace, type PipelineBuffer, type PipelineScenarioId, type PipelineStage, type PipelineState } from "@/app/lib/paper3/hardware-models";
import { StateControls, StateExplanation, StateHeading, StateTable } from "./Section15VisualPrimitives";
import styles from "./Section15Workbench.module.css";

const stageNames: Record<PipelineStage, Localized> = {
  IF: { en: "Instruction fetch", vi: "Nạp lệnh" }, ID: { en: "Instruction decode", vi: "Giải mã lệnh" },
  OF: { en: "Operand fetch", vi: "Nạp toán hạng" }, IE: { en: "Instruction execution", vi: "Thực thi lệnh" }, WB: { en: "Write back", vi: "Ghi kết quả" },
};
const phaseNames: Record<string, Localized> = {
  ready: { en: "Ready", vi: "Sẵn sàng" }, fill: { en: "Filling", vi: "Lấp đầy" }, full: { en: "Fully occupied", vi: "Đủ năm giai đoạn" },
  drain: { en: "Draining", vi: "Hoàn tất các lệnh còn lại" }, complete: { en: "Complete", vi: "Hoàn tất" }, refill: { en: "Refilling", vi: "Nạp lại" },
  "interrupt-saved": { en: "Context saved · younger instructions flushed", vi: "Đã lưu ngữ cảnh · loại lệnh chưa hoàn tất" },
  "handler-complete": { en: "Interrupt serviced", vi: "Đã xử lý ngắt" }, restored: { en: "Context restored", vi: "Đã khôi phục ngữ cảnh" },
};
const registerText = (values: Readonly<Record<string, number>>) => Object.entries(values).map(([name, value]) => `${name}=${value}`).join(" · ");
const listText = (values: readonly string[], locale: Locale) => values.length ? values.join(", ") : locale === "vi" ? "Không có" : "None";
function bufferText(buffer: PipelineBuffer | null, locale: Locale) {
  if (!buffer) return locale === "vi" ? "Trống" : "Empty";
  return [buffer.instructionId + " → " + buffer.nextStage, buffer.destination, buffer.operands?.join(" + "), buffer.result !== undefined ? `= ${buffer.result}` : undefined].filter(Boolean).join(" · ");
}
function PipelineStateText({ state, locale }: { readonly state: PipelineState; readonly locale: Locale }) {
  return <div>
    <p>{locale === "vi" ? "Chu kỳ ứng dụng" : "Application clock"}: {state.clock} · {phaseNames[state.phase]?.[locale] ?? state.phase}</p>
    <p>{Object.entries(state.stageOccupancy).map(([stage, instruction]) => `${stage}: ${instruction ?? "—"}`).join(" · ")}</p>
    {Object.entries(state.boundaryRegisters).map(([name, buffer]) => <p key={name}>{name}: {bufferText(buffer, locale)}</p>)}
    <p>{registerText(state.registers)}; {registerText(state.status)}</p>
    <p>{locale === "vi" ? "Đã hoàn tất" : "Committed"}: {listText(state.completed, locale)}</p>
    <p>{locale === "vi" ? "Nạp tiếp" : "Next fetch"}: {state.nextFetch ?? "—"}; restart PC: {state.restartPC ?? "—"}</p>
    <p>{locale === "vi" ? "Đã loại khi ngắt" : "Flushed at interrupt"}: {listText(state.discarded, locale)}</p>
    <p>{locale === "vi" ? "Ngữ cảnh đã lưu" : "Saved context"}: {state.savedContext ? `${registerText(state.savedContext.registers)}; ${registerText(state.savedContext.status)}; restart PC=${state.savedContext.restartPC}` : "—"}</p>
    <p>{locale === "vi" ? "Khôi phục ngữ cảnh / xử lý ngắt xong" : "Context restored / handler complete"}: {String(state.contextRestored)} / {String(state.handlerComplete)}</p>
  </div>;
}

function PipelineCellPractice({ locale }: { readonly locale: Locale }) {
  const id = useId();
  const [clock, setClock] = useState(1);
  const [stage, setStage] = useState<PipelineStage>("IF");
  const [prediction, setPrediction] = useState("empty");
  const [checked, setChecked] = useState(false);
  const ideal = pipelineTrace("ideal");
  const row = ideal.steps.find(item => item.id === `cycle-${clock}`)!;
  const result = pipelineCellFeedback(clock, stage, prediction);
  return <section className={styles.challenge} data-pipeline-cell-challenge aria-labelledby={`${id}-heading`}>
    <h4 id={`${id}-heading`}>{locale === "vi" ? "Điền ô còn thiếu" : "Complete the missing cell"}</h4>
    <p>{locale === "vi" ? "Bài tập dùng lịch lý tưởng, không có ngắt. Chọn chu kỳ và giai đoạn, rồi dự đoán lệnh trong ô ?. Bạn có thể kiểm tra bất kỳ ô nào mà không cần hoàn tất minh họa." : "Practice uses the ideal schedule without interrupts. Choose a clock and stage, then predict the instruction in the ? cell. Any cell can be checked without completing the journey."}</p>
    <div className={styles.challengeFields}>
      <div className={styles.field}><label htmlFor={`${id}-clock`}>{locale === "vi" ? "Chu kỳ cần điền" : "Challenge clock"}</label><select id={`${id}-clock`} data-pipeline-cell-clock value={clock} onChange={event => { setClock(Number(event.target.value)); setChecked(false); }}>{ideal.steps.filter(item => item.id.startsWith("cycle-")).map(item => <option key={item.id} value={item.after.clock}>{item.after.clock}</option>)}</select></div>
      <div className={styles.field}><label htmlFor={`${id}-stage`}>{locale === "vi" ? "Giai đoạn cần điền" : "Challenge stage"}</label><select id={`${id}-stage`} data-pipeline-cell-stage value={stage} onChange={event => { setStage(event.target.value as PipelineStage); setChecked(false); }}>{ideal.stages.map(item => <option key={item} value={item}>{item} · {stageNames[item][locale]}</option>)}</select></div>
    </div>
    <div className={styles.stageGrid} aria-label={locale === "vi" ? `Hàng chu kỳ ${clock}, ô cần điền ${stage}` : `Clock ${clock} row, missing ${stage} cell`}>{ideal.stages.map(item => <div key={item} className={styles.stage} data-practice-cell={item} data-missing={item === stage}><strong>{item}</strong><b>{item === stage && !checked ? "?" : row.after.stageOccupancy[item] ?? "—"}</b><span>{item === stage ? locale === "vi" ? "Ô cần điền" : "Missing cell" : row.after.stageOccupancy[item] ? locale === "vi" ? "Có lệnh" : "Occupied" : locale === "vi" ? "Trống" : "Empty"}</span></div>)}</div>
    <div className={styles.challengeFields}><div className={styles.field}><label htmlFor={`${id}-prediction`}>{locale === "vi" ? "Dự đoán của bạn" : "Your prediction"}</label><select id={`${id}-prediction`} data-pipeline-cell-prediction value={prediction} onChange={event => { setPrediction(event.target.value); setChecked(false); }}><option value="empty">{locale === "vi" ? "Trống — không có lệnh" : "Empty — no instruction"}</option>{ideal.instructions.map(item => <option key={item.id} value={item.id}>{item.id}</option>)}</select></div></div>
    <div className={styles.challengeActions}><Button data-pipeline-cell-check onClick={() => setChecked(true)}>{locale === "vi" ? "Kiểm tra ô" : "Check cell"}</Button><Button variant="secondary" data-pipeline-cell-reset onClick={() => { setClock(1); setStage("IF"); setPrediction("empty"); setChecked(false); }}>{locale === "vi" ? "Đặt lại bài tập" : "Reset practice"}</Button></div>
    <div role="status" data-pipeline-cell-feedback data-result={checked ? result.correct ? "correct" : "incorrect" : "unanswered"} className={styles.challengeFeedback}>{checked ? result.feedback[locale] : locale === "vi" ? "Phản hồi sẽ hiện sau khi kiểm tra ô." : "Feedback appears after checking the cell."}</div>
  </section>;
}

export function HardwareWorkbench({ kind, locale }: { readonly kind: "pipeline-registers-interrupts"; readonly locale: Locale }) {
  const controlId = useId();
  const [scenario, setScenario] = useState<PipelineScenarioId>("ideal");
  const [index, setIndex] = useState(0);
  const [instruction, setInstruction] = useState("I1");
  const trace = useMemo(() => pipelineTrace(scenario), [scenario]);
  const matrix = useMemo(() => pipelineInstructionMatrix(scenario), [scenario]);
  const restartClock = matrix.columns.find(column => column.restarted)?.clock;
  const step = trace.steps[index];
  const state = step.after;
  const selectedStage = trace.stages.find(stage => state.stageOccupancy[stage] === instruction);
  return <div className={styles.workbench} data-hardware-workbench={kind} data-pipeline-scenario={scenario} data-step-id={step.id} data-selected-instruction={instruction}>
    <div className={styles.setup}><div className={styles.field}><label htmlFor={controlId}>{locale === "vi" ? "Tình huống pipeline" : "Pipeline scenario"}</label><select id={controlId} data-pipeline-scenario-select value={scenario} onChange={event => { setScenario(event.target.value as PipelineScenarioId); setIndex(0); }}>{pipelineScenarios.map(item => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></div><div className={styles.field}><label htmlFor={`${controlId}-instruction`}>{locale === "vi" ? "Theo dõi lệnh" : "Follow instruction"}</label><select id={`${controlId}-instruction`} data-pipeline-instruction-select value={instruction} onChange={event => setInstruction(event.target.value)}>{trace.instructions.map(item => <option key={item.id} value={item.id}>{item.id} · {item.destination} ← {item.operands.join(" + ")}</option>)}</select></div></div>
    <StateControls steps={trace.steps} index={index} onChange={setIndex} locale={locale} />
    <div className={styles.body}>
      <StateHeading step={step} index={index} count={trace.steps.length} locale={locale} />
      <p className={styles.caption}>{locale === "vi" ? "Mô hình năm giai đoạn, mỗi giai đoạn một chu kỳ, sáu lệnh độc lập. Lưu ngữ cảnh, xử lý ngắt và khôi phục là sự kiện; không gán thời lượng cho trình xử lý ngắt." : "Five stages, one clock per stage, six independent instructions. Save, handler and restore are events; no handler duration is assigned."}</p>
      <section className={styles.panel} aria-label={locale === "vi" ? "Lệnh hoạt động trong chu kỳ" : "Instructions active during the clock"}>
        <h4>{locale === "vi" ? "Hoạt động trong chu kỳ ứng dụng" : "Active during application clock"} <span data-application-clock>{state.clock}</span></h4>
        <p data-pipeline-phase={state.phase}>{phaseNames[state.phase]?.[locale] ?? state.phase}</p><p className={styles.followStatus} data-instruction-follow-status><strong>{instruction}</strong>: {selectedStage ? `${locale === "vi" ? "hoạt động ở" : "active in"} ${selectedStage}` : state.completed.includes(instruction) ? locale === "vi" ? "đã hoàn tất" : "already committed" : state.discarded.includes(instruction) ? locale === "vi" ? "đã bị loại khi ngắt, đang chờ nạp lại" : "flushed at interrupt, awaiting refetch" : locale === "vi" ? "chưa vào pipeline" : "not yet in the pipeline"}.</p>
        <div className={styles.stageGrid}>{trace.stages.map(stage => <div className={styles.stage} key={stage} data-pipeline-stage={stage} data-instruction={state.stageOccupancy[stage] ?? "empty"} data-occupied={state.stageOccupancy[stage] !== null} data-followed={state.stageOccupancy[stage] === instruction}><strong>{stage}</strong><span>{stageNames[stage][locale]}</span><b>{state.stageOccupancy[stage] ?? "—"}</b>{state.stageOccupancy[stage] === instruction && <span className={styles.followLabel}>{locale === "vi" ? "Đang theo dõi" : "Following"}</span>}<span>{state.stageOccupancy[stage] ? locale === "vi" ? "Có lệnh" : "Occupied" : locale === "vi" ? "Trống" : "Empty"}</span></div>)}</div>
      </section>
      <section className={styles.panel} aria-label={locale === "vi" ? "Thanh ghi giữa các giai đoạn" : "Pipeline boundary registers"}>
        <h4>{locale === "vi" ? "Đầu ra được giữ sau chu kỳ" : "Outputs held after the clock"}</h4>
        <p>{locale === "vi" ? "Các thanh ghi này giữ dữ liệu để giai đoạn kế tiếp dùng ở chu kỳ sau. Chúng khác với ô hoạt động phía trên." : "These registers hold data for the next stage on the following clock. They differ from the active-stage cells above."}</p>
        <div className={styles.registers}>{Object.entries(state.boundaryRegisters).map(([name, buffer]) => <div className={styles.register} key={name} data-pipeline-boundary={name} data-instruction={buffer?.instructionId ?? "empty"} data-followed={buffer?.instructionId === instruction}><span>{name.replace("_", " → ")}</span><strong>{bufferText(buffer, locale)}</strong></div>)}</div>
      </section>
      <div className={styles.contextGrid}>
        <section className={styles.panel}><h4>{locale === "vi" ? "Ngữ cảnh đã ghi nhận" : "Committed context"}</h4><div className={styles.registers}>{Object.entries(state.registers).map(([name, value]) => <div className={styles.register} key={name} data-committed-register={name} data-value={value} data-changed={step.before.registers[name] !== value}><span>{name}{step.before.registers[name] !== value ? locale === "vi" ? " · vừa thay đổi" : " · changed" : ""}</span><strong>{value}</strong></div>)}</div><p>{locale === "vi" ? "Trạng thái" : "Status"}: {registerText(state.status)}</p><p>{locale === "vi" ? "Lệnh hoàn tất" : "Committed instructions"}: <span data-completed-instructions>{listText(state.completed, locale)}</span></p><p>{locale === "vi" ? "Nạp tiếp" : "Next fetch"}: <strong data-next-fetch>{state.nextFetch ?? "—"}</strong></p></section>
        <section className={styles.panel}><h4>{locale === "vi" ? "Lưu và khôi phục khi ngắt" : "Interrupt save and restore"}</h4>{state.savedContext ? <><p>{locale === "vi" ? "Bản sao tại thời điểm ngắt" : "Snapshot taken at the interrupt"}</p><p>{registerText(state.savedContext.registers)}</p><p>{registerText(state.savedContext.status)}</p><p>Restart PC: <strong data-restart-pc>{state.savedContext.restartPC}</strong></p><p>{locale === "vi" ? "Đã khôi phục" : "Restored"}: {state.contextRestored ? locale === "vi" ? "Có" : "Yes" : locale === "vi" ? "Chưa" : "Not yet"}</p><p>{locale === "vi" ? "Trình xử lý ngắt hoàn tất" : "Handler complete"}: {state.handlerComplete ? locale === "vi" ? "Có" : "Yes" : locale === "vi" ? "Chưa" : "Not yet"}</p></> : <p>{locale === "vi" ? "Chưa lưu ngữ cảnh ngắt." : "No interrupt context saved yet."}</p>}<p>{locale === "vi" ? "Lệnh bị loại lúc ngắt" : "Instructions flushed at the interrupt"}: <span data-flushed-instructions>{listText(state.discarded, locale)}</span></p>{state.contextRestored && <p>{locale === "vi" ? "Các lệnh bị loại sẽ được nạp lại từ I2; I1 đã hoàn tất không chạy lại." : "Flushed instructions are refetched from I2; committed I1 is not repeated."}</p>}</section>
      </div>
      <div className={styles.facts}><span>{locale === "vi" ? "Độ trễ một lệnh" : "One-instruction latency"}: <strong>{trace.metrics.singleInstructionLatencyClocks}</strong> {locale === "vi" ? "chu kỳ" : "clocks"}</span><span>{locale === "vi" ? "Pipeline lý tưởng / tuần tự" : "Ideal pipeline / serial"}: <strong>{trace.metrics.idealPipelineClocksForSix} / {trace.metrics.nonPipelinedClocksForSix}</strong> {locale === "vi" ? "chu kỳ cho sáu lệnh" : "clocks for six instructions"}</span><span>{locale === "vi" ? "Khi đầy, lý tưởng hoàn tất" : "Ideal steady completion"}: <strong>1</strong> {locale === "vi" ? "lệnh/chu kỳ" : "instruction/clock"}</span></div>
      <section className={styles.truthPanel} aria-labelledby={`${controlId}-matrix-heading`}>
        <h4 id={`${controlId}-matrix-heading`}>{locale === "vi" ? "Mỗi lệnh qua các chu kỳ" : "Each instruction across the clocks"}</h4>
        <p>{locale === "vi" ? "Hàng là lệnh, cột là chu kỳ ứng dụng. Chọn tên lệnh để theo dõi; dấu — nghĩa lệnh không hoạt động ở chu kỳ đó. Có thể cuộn ngang bảng bằng bàn phím." : "Rows are instructions; columns are application clocks. Select an instruction to follow it; — means it is inactive on that clock. The table supports horizontal keyboard scrolling."}</p>
        <div className={styles.tableScroll} role="region" tabIndex={0} data-instruction-matrix-scroll aria-label={locale === "vi" ? "Bảng lệnh theo chu kỳ, cuộn ngang" : "Instruction-by-clock matrix, scroll horizontally"}>
          <table className={styles.instructionMatrix} data-instruction-matrix data-matrix-scenario={scenario}>
            <caption>{restartClock ? locale === "vi" ? `Có ngắt: các chu kỳ ứng dụng 1–${matrix.columns.length}; nạp lại I2 từ chu kỳ ${restartClock}. Lưu, xử lý ngắt và khôi phục nằm giữa chu kỳ ${restartClock - 1} và ${restartClock}; không tạo cột và không được gán thời lượng.` : `Interrupt: application clocks 1–${matrix.columns.length}; I2 is refetched from clock ${restartClock}. Save, handler and restore occur between clocks ${restartClock - 1} and ${restartClock}; they add no column and have no assigned duration.` : locale === "vi" ? `Lý tưởng: sáu lệnh độc lập trong ${matrix.columns.length} chu kỳ, không có ngắt. Mỗi ô ghi giai đoạn hoạt động của lệnh trong chu kỳ.` : `Ideal: six independent instructions over ${matrix.columns.length} clocks, without interrupts. Each cell gives the instruction's active stage during that clock.`}</caption>
            <thead><tr><th scope="col">{locale === "vi" ? "Lệnh ↓ / Chu kỳ →" : "Instruction ↓ / Clock →"}</th>{matrix.columns.map(column => <th key={column.clock} scope="col" data-matrix-clock={column.clock} data-current={column.stepId === step.id}>{column.clock}{column.restarted && <span className={styles.srOnly}>{locale === "vi" ? " · sau khôi phục" : " · after restore"}</span>}{column.stepId === step.id && <span className={styles.followLabel}>{locale === "vi" ? "Hiện tại" : "Current"}</span>}</th>)}</tr></thead>
            <tbody>{matrix.rows.map(row => <tr key={row.instructionId} data-instruction-row={row.instructionId} data-selected={row.instructionId === instruction}><th scope="row"><button type="button" data-follow-instruction={row.instructionId} aria-pressed={row.instructionId === instruction} aria-label={`${locale === "vi" ? "Theo dõi lệnh" : "Follow instruction"} ${row.instructionId}`} onClick={() => setInstruction(row.instructionId)}>{row.instructionId}</button>{row.instructionId === instruction && <span className={styles.followLabel}>{locale === "vi" ? "Đang theo dõi" : "Following"}</span>}</th>{row.cells.map(cell => <td key={cell.clock} data-matrix-cell={`${row.instructionId}-${cell.clock}`} data-clock={cell.clock} data-stage={cell.stage ?? "empty"} data-followed={row.instructionId === instruction} data-current={matrix.columns.find(column => column.clock === cell.clock)?.stepId === step.id}>{cell.stage ?? "—"}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <details className={styles.truthPanel}><summary>{locale === "vi" ? "Xem sáu lệnh và dòng thời gian" : "Inspect six instructions and the timeline"}</summary><p>{trace.instructions.map(instruction => `${instruction.id}: ${instruction.destination} ← ${instruction.operands.join(" + ")}`).join("; ")}</p><div className={styles.tableScroll} role="region" tabIndex={0} aria-label={locale === "vi" ? "Dòng thời gian pipeline" : "Pipeline timeline"}><table><caption>{locale === "vi" ? "Chỉ các hàng chu kỳ; các sự kiện ngắt được mô tả riêng trong bảng trạng thái." : "Clock rows only; interrupt events are described separately in the state table."}</caption><thead><tr><th scope="col">{locale === "vi" ? "Chu kỳ" : "Clock"}</th>{trace.stages.map(stage => <th scope="col" key={stage}>{stage}</th>)}<th scope="col">{locale === "vi" ? "Ghi kết quả" : "Commit"}</th></tr></thead><tbody>{trace.steps.filter(item => item.id.includes("cycle-")).map(item => <tr key={item.id} data-timeline-step={item.id} data-selected={item.id === step.id}><th scope="row">{item.after.clock}</th>{trace.stages.map(stage => <td key={stage} data-timeline-stage={stage} data-followed={item.after.stageOccupancy[stage] === instruction}>{item.after.stageOccupancy[stage] ?? "—"}{item.after.stageOccupancy[stage] === instruction && <span className={styles.followLabel}>{locale === "vi" ? "Theo dõi" : "Following"}</span>}</td>)}<td>{listText(item.after.completed.filter(id => !item.before.completed.includes(id)), locale)}</td></tr>)}</tbody></table></div></details>
      <StateExplanation step={step} locale={locale} />
      <PipelineCellPractice locale={locale} />
    </div>
    <StateTable steps={trace.steps} selectedId={step.id} locale={locale} before={item => <PipelineStateText state={item.before} locale={locale} />} after={item => <PipelineStateText state={item.after} locale={locale} />} />
  </div>;
}
