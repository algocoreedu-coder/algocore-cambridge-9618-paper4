"use client";

import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/app/components/algocore-ui";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import type { VisualKind } from "@/app/lib/paper3/lesson-types";
import { approximation, decodeFloating, floatingRange, normalisationTrace, type ApproxResult } from "@/app/lib/paper3/visual-models";
import { BitStrip, BitWeights, StepControls } from "./VisualPrimitives";
import styles from "./LessonPage.module.css";

const L = (en: string, vi: string): Localized => ({ en, vi });
const normalisationCases = [
  { id: "negative", label: L("−6 · negative mantissa", "−6 · mantissa âm"), m: "11101000", e: "0101" },
  { id: "positive", label: L("+5 · positive mantissa", "+5 · mantissa dương"), m: "00101000", e: "0100" },
  { id: "zero", label: L("Zero · a separate case", "Số 0 · trường hợp riêng"), m: "00000000", e: "0000" },
  { id: "floor", label: L("1/1024 · exponent floor", "1/1024 · sàn exponent"), m: "00100000", e: "1000" },
] as const;

function NormalisationWorkbench({ locale }: { readonly locale: Locale }) {
  const [caseId, setCaseId] = useState<string>("negative");
  const [index, setIndex] = useState(0);
  const selected = normalisationCases.find((item) => item.id === caseId) ?? normalisationCases[0];
  const trace = useMemo(() => normalisationTrace(selected.m, selected.e), [selected]);
  const current = trace.steps[index] ?? trace.steps[0];
  const previous = trace.steps[index - 1];
  return <div data-visual-kind="normalisation" data-visual-step={current.id} data-visual-case={caseId}>
    <div className={styles.visualControls}><div className={styles.inputGroup}><label htmlFor="normalisation-case">{locale === "vi" ? "Chọn cặp M/E ban đầu" : "Choose an initial M/E pair"}</label><select id="normalisation-case" value={caseId} onChange={(event) => { setCaseId(event.target.value); setIndex(0); }}>{normalisationCases.map((item) => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select><small>M {selected.m} / E {selected.e}</small></div></div>
    <StepControls index={index} steps={trace.steps} onChange={setIndex} locale={locale} />
    <div className={styles.visualBody}><div className={styles.visualColumns}><div className={styles.scene}><p className={styles.sceneTitle}>{locale === "vi" ? "M × 2ᴱ PHẢI GIỮ NGUYÊN" : "M × 2ᴱ MUST STAY THE SAME"}</p>{previous && current.id.startsWith("shift-") && <><BitStrip bits={previous.mantissa} label={locale === "vi" ? `Mantissa trước · E ${previous.exponent}` : `Mantissa before · E ${previous.exponent}`} fractional locale={locale} /><div className={styles.flowArrow}><ArrowDown size={20} aria-hidden="true" />M × 2 · E − 1</div></>}<BitStrip bits={current.mantissa} label="Mantissa · M" fractional highlight leading={current.id === "verify"} previous={current.id.startsWith("shift-") ? previous?.mantissa : undefined} locale={locale} /><BitStrip bits={current.exponent} label="Exponent · E" highlight={current.id.startsWith("shift-")} locale={locale} /><div className={styles.equation} data-visual-equation>{current.equation}</div><div className={styles.invariant}><span>{locale === "vi" ? "Giá trị ban đầu" : "Initial value"}: <strong>{trace.value}</strong></span><span>{locale === "vi" ? "Giá trị hiện tại" : "Current value"}: <strong data-normalised-value>{decodeFloating(current.mantissa, current.exponent)}</strong></span></div><BitWeights mBits={8} eBits={4} locale={locale} /></div><div className={styles.stepCopy}><span className={styles.stepCount}>{locale === "vi" ? "Bước" : "Step"} {index + 1}/{trace.steps.length}</span><h3>{current.title[locale]}</h3><p>{current.action[locale]}</p><p className={styles.why}>{current.why[locale]}</p>{current.id === "limit" && <div className={styles.conceptFeedback} data-error="true">{locale === "vi" ? "Không dịch tiếp: E sẽ phải xuống −9. Giữ mẫu bit và giá trị hiện tại; không cho exponent quay vòng." : "Do not shift again: E would have to become −9. Keep the current bits and value; do not wrap the exponent."}</div>}</div></div><span className={styles.srOnly} role="status">{current.title[locale]}</span></div>
    <div className={styles.visualFooter}><details className={styles.fallback}><summary>{locale === "vi" ? "Đọc toàn bộ trạng thái và lý do" : "Read every state and its reason"}</summary><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={locale === "vi" ? "Các bước chuẩn hóa" : "Normalisation steps"}><table><thead><tr><th scope="col">{locale === "vi" ? "Bước" : "Step"}</th><th scope="col">M / E</th><th scope="col">{locale === "vi" ? "Giá trị" : "Value"}</th><th scope="col">{locale === "vi" ? "Vì sao" : "Why"}</th></tr></thead><tbody>{trace.steps.map((step) => <tr key={step.id} data-fallback-step={step.id}><th scope="row">{step.title[locale]}</th><td>{step.mantissa} / {step.exponent}</td><td>{step.equation}</td><td>{step.action[locale]} {step.why[locale]}</td></tr>)}</tbody></table></div></details></div>
  </div>;
}

const allocations = [{ m: 8, e: 4 }, { m: 6, e: 6 }, { m: 10, e: 2 }] as const;
function PrecisionWorkbench({ locale }: { readonly locale: Locale }) {
  const [allocation, setAllocation] = useState("8/4");
  const [lens, setLens] = useState<"spacing" | "limits">("spacing");
  const [pair, setPair] = useState(0);
  const models = useMemo(() => allocations.map((format) => floatingRange(format.m, format.e)), []);
  const selected = models.find((model) => `${model.mBits}/${model.eBits}` === allocation) ?? models[0];
  const limitRows = [
    { label: L("Maximum positive", "Dương lớn nhất"), value: selected.maximumPositive, bits: selected.positiveMaxBits },
    { label: L("Minimum positive", "Dương nhỏ nhất"), value: selected.minimumPositive, bits: selected.positiveMinBits },
    { label: L("Most negative", "Âm xa 0 nhất"), value: selected.mostNegative, bits: selected.negativeMinBits },
    { label: L("Negative nearest zero", "Âm gần 0 nhất"), value: selected.negativeClosestToZero, bits: selected.negativeClosestBits },
  ];
  return <div data-visual-kind="precision-range" data-allocation={allocation} data-lens={lens}>
    <div className={styles.visualControls}><div className={styles.inputGroup}><label htmlFor="float-allocation">{locale === "vi" ? "Chia 12 bit" : "Allocate 12 bits"}</label><select id="float-allocation" value={allocation} onChange={(event) => setAllocation(event.target.value)}>{allocations.map((format) => <option value={`${format.m}/${format.e}`} key={format.m}>M{format.m} / E{format.e}</option>)}</select></div><div className={styles.inputGroup}><label htmlFor="precision-lens">{locale === "vi" ? "Nội dung so sánh" : "Comparison"}</label><select id="precision-lens" value={lens} onChange={(event) => setLens(event.target.value as typeof lens)}><option value="spacing">{locale === "vi" ? "Khoảng cách tại E = 0" : "Spacing at E = 0"}</option><option value="limits">{locale === "vi" ? "Bốn giới hạn chuẩn hóa" : "Four normalised limits"}</option></select></div>{lens === "spacing" && <div className={styles.inputGroup}><label htmlFor="precision-pair">{locale === "vi" ? "Cặp liền kề được chọn" : "Selected adjacent pair"}</label><select id="precision-pair" value={pair} onChange={(event) => setPair(Number(event.target.value))}>{[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value + 1} → {value + 2}</option>)}</select></div>}<Button variant="quiet" onClick={() => { setAllocation("8/4"); setLens("spacing"); setPair(0); }}>{locale === "vi" ? "Đặt lại" : "Reset"}</Button></div>
    <div className={styles.visualBody}><div className={styles.allocationBar} role="img" aria-label={`${selected.mBits} mantissa bits, ${selected.eBits} exponent bits; 12 total`}>{Array.from({ length: 12 }, (_, index) => <span data-field={index < selected.mBits ? "m" : "e"} key={index} aria-hidden="true">{index < selected.mBits ? "M" : "E"}</span>)}</div><p className={styles.bitHelp}>M{selected.mBits} + E{selected.eBits} = 12 {locale === "vi" ? "bit · cả hai trường đều có dấu" : "bits · both fields are signed"}</p>
      {lens === "spacing" ? <><div className={styles.axisDescription}><strong>{locale === "vi" ? "Cùng trục 0.5 → 0.75, E = 0" : "Shared axis 0.5 → 0.75, E = 0"}</strong><p>{locale === "vi" ? "Mỗi hàng chỉ đánh dấu năm giá trị đầu tiên từ 0.5. Đây là vùng phóng cục bộ, không phải toàn bộ miền; nhãn số nằm dưới hình để tránh chồng nhau." : "Each row marks only the first five values from 0.5. This is a local zoom, not the full range; exact labels are below the line to avoid overlap."}</p></div><div className={styles.numberLines}>{models.map((model) => <div className={styles.numberLineRow} data-selected={model === selected} key={model.mBits}><div className={styles.lineHeading}><strong>M{model.mBits} / E{model.eBits}</strong><span>{locale === "vi" ? "Khoảng cách" : "Spacing"}: {model.spacingAtExponentZero}</span></div><div className={styles.numberLine} role="img" aria-label={`${locale === "vi" ? "Năm giá trị đầu" : "First five values"}: ${model.sampleValues.join(", ")}. ${locale === "vi" ? "Khoảng cách" : "Spacing"}: ${model.spacingAtExponentZero}`}><span className={styles.axisRail} />{model.sampleValues.map((value, valueIndex) => <span key={value} className={styles.axisTick} data-active={valueIndex === pair || valueIndex === pair + 1} style={{ left: `${4 + ((Number(value) - 0.5) / 0.25) * 92}%` }} aria-hidden="true" />)}</div><div className={styles.axisEndpoints}><span>0.5</span><span>0.75</span></div><div className={styles.adjacentValues}><span>{model.sampleValues[pair]}</span><span>→</span><span>{model.sampleValues[pair + 1]}</span></div></div>)}</div><div className={styles.outcome} data-precision-spacing><strong>{selected.sampleValues[pair + 1]} − {selected.sampleValues[pair]} = {selected.spacingAtExponentZero}</strong><p>{locale === "vi" ? "Thêm bit mantissa tạo khoảng cách nhỏ hơn tại cùng E. Thêm bit exponent thay đổi phạm vi scale, không làm khoảng cách tại E cố định nhỏ hơn." : "More mantissa bits give smaller gaps at the same E. More exponent bits change the available scales, not the gaps at a fixed exponent."}</p></div></> : <><div className={styles.outcome}><strong>E ∈ [{selected.exponentMin}, {selected.exponentMax}]</strong><p>{locale === "vi" ? "Chỉ xét số khác 0 đã chuẩn hóa; số 0 có cách biểu diễn riêng. M = −1 có thể lưu được, còn M = +1 thì không." : "These limits require normalised nonzero values; zero has a separate representation. M = −1 is representable, but M = +1 is not."}</p></div><div className={styles.limitGrid}>{limitRows.map((row) => <div className={styles.limitCard} key={row.label.en}><h3>{row.label[locale]}</h3><strong>{row.value}</strong><code>M / E: {row.bits}</code></div>)}</div></>}
      <details className={styles.fallback}><summary>{locale === "vi" ? "So sánh cả ba định dạng bằng bảng" : "Compare all three formats as a table"}</summary><div className={styles.tableScroll} role="region" aria-label={locale === "vi" ? "So sánh định dạng" : "Format comparison"} tabIndex={0}><table><thead><tr><th scope="col">{locale === "vi" ? "Đại lượng" : "Quantity"}</th>{models.map((model) => <th key={model.mBits} scope="col">M{model.mBits}/E{model.eBits}</th>)}</tr></thead><tbody>{[
        { label: L("Exponent range", "Phạm vi exponent"), values: models.map((model) => `${model.exponentMin}..${model.exponentMax}`) },
        { label: L("Spacing at E = 0", "Khoảng cách tại E = 0"), values: models.map((model) => model.spacingAtExponentZero) },
        { label: L("Maximum positive", "Dương lớn nhất"), values: models.map((model) => model.maximumPositive) },
        { label: L("Minimum positive", "Dương nhỏ nhất"), values: models.map((model) => model.minimumPositive) },
        { label: L("Most negative", "Âm xa 0 nhất"), values: models.map((model) => model.mostNegative) },
        { label: L("Negative nearest zero", "Âm gần 0 nhất"), values: models.map((model) => model.negativeClosestToZero) },
      ].map((row) => <tr key={row.label.en}><th scope="row">{row.label[locale]}</th>{row.values.map((value, index) => <td key={index}>{value}</td>)}</tr>)}</tbody></table></div></details>
    </div>
  </div>;
}

const approximationCases = [
  { id: "fraction", input: "13.375", m: 6, e: 4, label: L("13.375 · M6/E4", "13.375 · M6/E4") },
  { id: "repeating", input: "0.1", m: 8, e: 4, label: L("0.1 · M8/E4", "0.1 · M8/E4") },
  { id: "overflow", input: "200", m: 8, e: 4, label: L("200 · overflow · M8/E4", "200 · tràn trên · M8/E4") },
  { id: "underflow", input: "0.0009765625", m: 8, e: 4, label: L("1/1024 · underflow · M8/E4", "1/1024 · tràn dưới · M8/E4") },
] as const;

function BitLossView({ detail, mBits, policy, locale }: { readonly detail: NonNullable<ApproxResult["bitLoss"]>; readonly mBits: number; readonly policy: "truncate" | "nearest"; readonly locale: Locale }) {
  const reason = policy === "truncate"
    ? L("Truncation removes the tail without increasing the retained magnitude. This is truncation towards zero, not cutting a signed two’s-complement field.", "Cắt bỏ phần đuôi mà không tăng độ lớn được giữ. Đây là cắt về phía 0, không phải cắt trực tiếp trường bù hai có dấu.")
    : detail.increment
      ? L("The discarded tail reaches at least halfway to the next magnitude. Increase the retained magnitude by one step; an exact tie goes away from zero under this rule.", "Phần đuôi bị bỏ đạt ít nhất nửa khoảng cách tới độ lớn tiếp theo. Tăng phần được giữ một bước; khi đúng giữa, quy tắc này chọn xa 0 hơn.")
      : L("The nearest value uses the retained magnitude without an increment. The discarded tail is closer to this value than to the next one.", "Giá trị gần nhất dùng phần độ lớn đã giữ mà không cộng thêm. Phần đuôi bị bỏ gần giá trị này hơn giá trị tiếp theo.");
  return <div className={styles.bitLossPanel} data-bit-loss>
    <h4>{locale === "vi" ? "Nhìn phần thông tin sẽ mất" : "See the information that will be lost"}</h4>
    <dl className={styles.binaryForms}><div><dt>{locale === "vi" ? "Độ lớn nhị phân chính xác" : "Exact binary magnitude"}</dt><dd data-original-binary>{detail.originalBinary}₂</dd></div><div><dt>{locale === "vi" ? "Độ lớn ở dạng chuẩn hóa" : "Normalised magnitude"}</dt><dd data-normalised-binary>{detail.normalisedBinary}₂ × 2^({detail.exponent})</dd></div></dl>
    <p>{locale === "vi" ? `M${mBits} dành ${mBits - 1} bit cho phần phân số sau bit dấu. Dải dưới mô tả độ lớn trước mã hóa có dấu; đây chưa phải mantissa bù hai được lưu.` : `M${mBits} has ${mBits - 1} fractional bits after the sign bit. The strip below shows magnitude before signed encoding; it is not yet the stored two’s-complement mantissa.`}</p>
    <div className={styles.bitLossGroups}><div className={styles.keptGroup}><span>{locale === "vi" ? "Giữ lại" : "Retain"} · {mBits - 1} {locale === "vi" ? "bit phân số" : "fractional bits"}</span><div className={styles.lossBitStrip} aria-label={`${locale === "vi" ? "Phần giữ lại" : "Retained part"}: ${detail.keptBits}`} data-kept-bits>{detail.keptBits.split("").map((bit, index) => <span key={index}>{bit}</span>)}</div></div><div className={styles.discardedGroup}><span>{locale === "vi" ? "Phần đuôi bị bỏ" : "Discarded tail"}</span><code data-discarded-bits>{detail.discardedBits}</code></div></div>
    {detail.repeats && <p className={styles.repeatingNote}>{locale === "vi" ? "Các chữ số trong ngoặc lặp lại vô hạn. Chu kỳ tiếp tục sau các bit được giữ, nên không thể lưu toàn bộ bằng số bit hữu hạn này." : "Digits in parentheses repeat indefinitely. The cycle continues beyond the retained bits, so this finite field cannot store the entire expansion."}</p>}
    <div className={styles.retentionReason} data-rounding-increment={detail.increment}><strong>{policy === "truncate" || !detail.increment ? (locale === "vi" ? "Không cộng thêm vào phần giữ" : "Keep the retained part unchanged") : (locale === "vi" ? "Cộng một bước vào phần giữ" : "Increment the retained magnitude")}</strong><p>{reason[locale]}</p></div>
  </div>;
}

function ApproximationWorkbench({ locale }: { readonly locale: Locale }) {
  const [caseId, setCaseId] = useState<string>("fraction");
  const [policy, setPolicy] = useState<"truncate" | "nearest">("truncate");
  const [index, setIndex] = useState(0);
  const selected = approximationCases.find((item) => item.id === caseId) ?? approximationCases[0];
  const result = useMemo(() => approximation(selected.input, selected.m, selected.e, policy), [selected, policy]);
  const steps = result.steps.map((step) => ({ ...step, title: step.id === "scale" ? L("Scale the exact value", "Đổi thang giá trị chính xác") : step.id === "choose" ? L("Choose the stored neighbour", "Chọn giá trị lân cận để lưu") : step.id === "error" ? L("Calculate the error", "Tính sai số") : step.id === "range" ? L("Check the format's range", "Kiểm phạm vi định dạng") : L("Check exact representation", "Kiểm biểu diễn chính xác") }));
  const current = steps[index] ?? steps[0];
  const isRangeError = result.status === "overflow" || result.status === "underflow";
  const showStored = current.id === "choose" || current.id === "error" || current.id === "exact";
  const numericLower = Number(result.lower);
  const numericUpper = Number(result.upper);
  const markerPercent = result.lower !== null && result.upper !== null && numericUpper !== numericLower ? 8 + ((Number(selected.input) - numericLower) / (numericUpper - numericLower)) * 84 : 50;
  const storedPercent = result.represented !== null && numericUpper !== numericLower ? 8 + ((Number(result.represented) - numericLower) / (numericUpper - numericLower)) * 84 : 50;
  return <div data-visual-kind="rounding-errors" data-visual-step={current.id} data-visual-case={caseId} data-rounding-policy={policy}>
    <div className={styles.visualControls}><div className={styles.inputGroup}><label htmlFor="approximation-case">{locale === "vi" ? "Chọn ví dụ và định dạng" : "Choose an example and format"}</label><select id="approximation-case" value={caseId} onChange={(event) => { setCaseId(event.target.value); setIndex(0); }}>{approximationCases.map((item) => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></div><div className={styles.inputGroup}><label htmlFor="rounding-policy">{locale === "vi" ? "Quy tắc xấp xỉ" : "Approximation rule"}</label><select id="rounding-policy" value={policy} onChange={(event) => { setPolicy(event.target.value as typeof policy); setIndex(0); }}><option value="truncate">{locale === "vi" ? "Cắt về phía 0" : "Truncate towards zero"}</option><option value="nearest">{locale === "vi" ? "Gần nhất; hòa thì xa 0" : "Nearest; ties away from zero"}</option></select></div></div>
    <StepControls index={index} steps={steps} onChange={setIndex} locale={locale} />
    <div className={styles.visualBody}><div className={styles.visualColumns}><div className={styles.scene}><p className={styles.sceneTitle}>M{selected.m} / E{selected.e} · {locale === "vi" ? "GIÁ TRỊ CHÍNH XÁC" : "EXACT INPUT"}: {selected.input}</p>{isRangeError ? <div className={styles.rangeErrorVisual}><strong>{result.status === "overflow" ? (locale === "vi" ? "Vượt giới hạn trên" : "Beyond the largest magnitude") : (locale === "vi" ? "Nhỏ hơn giá trị chuẩn hóa gần 0 nhất" : "Below the closest-to-zero normalised value")}</strong><div className={styles.equation} data-visual-equation>{current.equation}</div><p>{locale === "vi" ? "Không tạo mẫu bit giả; mô hình không tự thay kết quả bằng 0 hoặc vô cùng." : "No invented bit pattern: this model does not replace the result with zero or infinity."}</p></div> : <>{result.bitLoss && <BitLossView detail={result.bitLoss} mBits={selected.m} policy={policy} locale={locale} />}<div className={styles.neighbourLine}><div className={styles.numberLine} role="img" aria-label={`${locale === "vi" ? "Giá trị chính xác" : "Exact value"} ${selected.input}; ${locale === "vi" ? "hai giá trị lân cận" : "neighbours"} ${result.lower}, ${result.upper}${showStored ? `; ${locale === "vi" ? "giá trị lưu" : "stored"} ${result.represented}` : ""}`}><span className={styles.axisRail} /><span className={styles.axisTick} style={{ left: "8%" }} /><span className={styles.axisTick} style={{ left: "92%" }} /><span className={styles.trueMarker} style={{ left: `${markerPercent}%` }} />{showStored && <span className={styles.storedMarker} style={{ left: `${storedPercent}%` }} />}</div><div className={styles.axisEndpoints}><span>{result.lower}</span><span>{result.upper}</span></div><div className={styles.markerLegend}><span><i className={styles.trueKey} />{locale === "vi" ? "Chính xác" : "Exact"}: {selected.input}</span>{showStored && <span><i className={styles.storedKey} />{locale === "vi" ? "Được lưu" : "Stored"}: {result.represented}</span>}</div></div>{showStored && <><BitStrip bits={result.mantissa} label="Mantissa · M" fractional highlight locale={locale} /><BitStrip bits={result.exponent} label="Exponent · E" locale={locale} /></>}<div className={styles.equation} data-visual-equation>{current.equation}</div>{current.id === "error" && <div className={styles.errorPair}><span>{locale === "vi" ? "Sai số có dấu" : "Signed error"}<strong data-signed-error>{result.error}</strong></span><span>{locale === "vi" ? "Sai số tuyệt đối" : "Absolute error"}<strong>{result.absoluteError}</strong></span></div>}</>}</div><div className={styles.stepCopy}><span className={styles.stepCount}>{locale === "vi" ? "Bước" : "Step"} {index + 1}/{steps.length}</span><h3>{current.title[locale]}</h3><p className={styles.why}>{current.why[locale]}</p><p>{result.explanation[locale]}</p><p className={styles.stateNotice}>{locale === "vi" ? "Nhãn và phép tính lấy từ mô hình phân số chính xác. Vị trí trên trục chỉ dùng để minh họa khoảng cách." : "Labels and calculations come from the exact-fraction model. Positions on the line only illustrate distance."}</p></div></div><span className={styles.srOnly} role="status">{current.title[locale]}</span></div>
    <div className={styles.visualFooter}><details className={styles.fallback}><summary>{locale === "vi" ? "Xem phép tính và kết quả đầy đủ" : "Read the complete calculations and result"}</summary><div className={styles.tableScroll} role="region" aria-label={locale === "vi" ? "Phép tính xấp xỉ" : "Approximation calculations"} tabIndex={0}><table><thead><tr><th scope="col">{locale === "vi" ? "Bước" : "Step"}</th><th scope="col">{locale === "vi" ? "Phép tính" : "Calculation"}</th><th scope="col">{locale === "vi" ? "Vì sao" : "Why"}</th></tr></thead><tbody>{steps.map((step) => <tr key={step.id}><th scope="row">{step.title[locale]}</th><td>{step.equation}</td><td>{step.why[locale]}</td></tr>)}</tbody></table></div>{result.bitLoss && <BitLossView detail={result.bitLoss} mBits={selected.m} policy={policy} locale={locale} />}{!isRangeError && <div className={styles.outcome}><strong>{locale === "vi" ? "Giá trị lưu" : "Stored value"}: {result.represented}</strong><p>M {result.mantissa} / E {result.exponent}</p><p>{locale === "vi" ? "Sai số = giá trị lưu − chính xác" : "Error = stored − exact"}: {result.error}<br />|{locale === "vi" ? "Sai số" : "Error"}|: {result.absoluteError}</p></div>}</details></div>
  </div>;
}

export function NumericWorkbench({ kind, locale }: { readonly kind: VisualKind; readonly locale: Locale }) {
  switch (kind) {
    case "normalisation": return <NormalisationWorkbench locale={locale} />;
    case "precision-range": return <PrecisionWorkbench locale={locale} />;
    case "rounding-errors": return <ApproximationWorkbench locale={locale} />;
    default: return null;
  }
}



