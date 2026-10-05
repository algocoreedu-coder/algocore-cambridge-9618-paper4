"use client";

import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { Locale } from "@/app/lib/paper3/catalog";
import { conversionTrace } from "@/app/lib/paper3/visual-models";
import { BinaryPointView, BitStrip, BitWeights, StepControls } from "./VisualPrimitives";
import styles from "./LessonPage.module.css";

const presets = ["-13.25", "6.5", "0.375", "-8", "0"] as const;

export function FloatWorkbench({ locale }: { readonly locale: Locale }) {
  const [input, setInput] = useState<string>("-13.25");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [index, setIndex] = useState(0);
  const trace = useMemo(() => conversionTrace(input, mode), [input, mode]);
  const current = trace.steps[index] ?? trace.steps[0];
  const previous = index > 0 ? trace.steps[index - 1] : undefined;
  const compareMantissa = (current.id === "invert" || current.id === "add-one" || (input === "-8" && current.id === "normalised")) && Boolean(previous?.mantissa);
  return <div data-visual-kind="floating-conversion" data-visual-step={current.id} data-visual-input={input} data-visual-mode={mode}>
    <div className={styles.visualControls}>
      <div className={styles.inputGroup}><label htmlFor="float-mode">{locale === "vi" ? "Bạn muốn làm gì?" : "What would you like to do?"}</label><select id="float-mode" value={mode} onChange={(event) => { setMode(event.target.value as "encode" | "decode"); setIndex(0); }}><option value="encode">{locale === "vi" ? "Mã hóa: số → bit" : "Encode: value → bits"}</option><option value="decode">{locale === "vi" ? "Giải mã: bit → số" : "Decode: bits → value"}</option></select></div>
      <div className={styles.inputGroup}><label htmlFor="float-input">{locale === "vi" ? "Chọn ví dụ" : "Choose an example"}</label><select id="float-input" value={input} onChange={(event) => { setInput(event.target.value); setIndex(0); }}>{presets.map((value) => { const preset = conversionTrace(value); return <option key={value} value={value}>{mode === "decode" ? `${preset.mantissa} / ${preset.exponent}` : Number(value) > 0 ? `+${value}` : value}</option>; })}</select><small>{locale === "vi" ? "5 ví dụ chính xác · M8 / E4" : "5 exact examples · M8 / E4"}</small></div>
    </div>
    <StepControls index={index} steps={trace.steps} onChange={setIndex} locale={locale} />
    <div className={styles.visualBody}>
      <div className={styles.visualColumns}>
        <div className={styles.scene}>
          <p className={styles.sceneTitle}>{locale === "vi" ? "TRẠNG THÁI ĐANG QUAN SÁT" : "THE CURRENT STATE"}</p>
          {current.binaryBefore && <BinaryPointView binary={current.binaryBefore} label={locale === "vi" ? "Trước: độ lớn ở dạng nhị phân" : "Before: binary magnitude"} />}
          {current.pointShift !== undefined && <div className={styles.flowArrow}><ArrowDown size={20} aria-hidden="true" /><span>{locale === "vi" ? `Dịch dấu chấm ${Math.abs(current.pointShift)} vị trí ${current.pointShift < 0 ? "sang phải" : "sang trái"}` : `Move the point ${Math.abs(current.pointShift)} places ${current.pointShift < 0 ? "right" : "left"}`}</span></div>}
          {current.binaryAfter && <BinaryPointView binary={current.binaryAfter} label={current.binaryBefore ? (locale === "vi" ? "Sau: trước khi thêm bit đệm" : "After: before padding") : (locale === "vi" ? "Độ lớn nhị phân" : "Binary magnitude")} />}
          {compareMantissa && <><BitStrip bits={previous!.mantissa} label={locale === "vi" ? "Mantissa trước thao tác" : "Mantissa before the action"} fractional locale={locale} /><div className={styles.flowArrow}><ArrowDown size={20} aria-hidden="true" /><span>{current.title[locale]}</span></div></>}
          <BitStrip bits={current.mantissa} label={compareMantissa ? (locale === "vi" ? "Mantissa sau thao tác" : "Mantissa after the action") : "Mantissa · M"} fractional locale={locale} highlight={["mantissa", "both", "sign"].includes(current.highlight)} leading={current.highlight === "sign"} previous={compareMantissa ? previous?.mantissa : undefined} />
          <BitStrip bits={current.exponent} label="Exponent · E" locale={locale} highlight={current.highlight === "exponent" || current.highlight === "both"} />
          <div className={styles.equation} data-visual-equation>{current.equation}</div><BitWeights mBits={trace.mBits} eBits={trace.eBits} locale={locale} />
        </div>
        <div className={styles.stepCopy}><span className={styles.stepCount}>{locale === "vi" ? "Bước" : "Step"} {index + 1}/{trace.steps.length}</span><h3>{current.title[locale]}</h3><p>{current.action[locale]}</p><p className={styles.why}><strong>{locale === "vi" ? "Vì sao? " : "Why? "}</strong>{current.why[locale]}</p><p className={styles.stateNotice}>{locale === "vi" ? "Chọn ví dụ hoặc đổi chế độ sẽ bắt đầu lại minh họa này. Bài làm bên dưới được giữ nguyên." : "Changing example or mode restarts this visual. Your answers below are preserved."}</p></div>
      </div>
      <span className={styles.srOnly} role="status">{locale === "vi" ? "Bước" : "Step"} {index + 1}: {current.title[locale]}</span>
    </div>

    <div className={styles.visualFooter}><details className={styles.fallback}><summary>{locale === "vi" ? "Xem toàn bộ giải thích bằng bảng" : "Read the complete explanation as a table"}</summary><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={locale === "vi" ? "Toàn bộ bước của ví dụ đang chọn" : "Every step of the selected example"}><table><caption>{locale === "vi" ? "Cùng trạng thái và phép tính với hình minh họa" : "The same states and calculations as the visual"}</caption><thead><tr><th scope="col">{locale === "vi" ? "Bước" : "Step"}</th><th scope="col">{locale === "vi" ? "Trước → sau" : "Before → after"}</th><th scope="col">{locale === "vi" ? "Thao tác và lý do" : "Action and reason"}</th><th scope="col">{locale === "vi" ? "Kiểm tra" : "Check"}</th></tr></thead><tbody>{trace.steps.map((step, stepIndex) => { const before = trace.steps[stepIndex - 1]; return <tr key={step.id} data-fallback-step={step.id}><th scope="row">{stepIndex + 1}. {step.title[locale]}</th><td>{before?.mantissa ? `${before.mantissa} / ${before.exponent}` : step.binaryBefore ?? "—"}<br />→ {step.mantissa ? `${step.mantissa} / ${step.exponent}` : step.binaryAfter ?? (step.exponent ? `E: ${step.exponent}` : "—")}</td><td>{step.action[locale]}<br /><br />{step.why[locale]}</td><td>{step.equation}</td></tr>; })}</tbody></table></div></details></div>
  </div>;
}

