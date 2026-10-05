import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/app/components/algocore-ui";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import styles from "./LessonPage.module.css";

export function BitStrip({ bits, label, fractional = false, highlight = false, leading = false, previous, locale }: { readonly bits: string; readonly label: string; readonly fractional?: boolean; readonly highlight?: boolean; readonly leading?: boolean; readonly previous?: string; readonly locale: Locale }) {
  if (!bits) return null;
  const weights = bits.split("").map((_, index) => index === 0 ? (fractional ? "−1" : String(-(2 ** (bits.length - 1)))) : fractional ? `1/${2 ** index}` : String(2 ** (bits.length - 1 - index)));
  return <div className={styles.bitGroup} data-bit-field={fractional ? "mantissa" : "exponent"}>
    <div className={styles.bitCaption}><span>{label}</span>{highlight && <span className={styles.changedLabel}>{locale === "vi" ? "Đang quan sát" : "In focus"}</span>}</div>
    <div className={styles.bits} style={{ "--bit-count": bits.length } as CSSProperties} aria-label={`${label}: ${bits}`} role="img">{bits.split("").map((bit, index) => <span className={styles.bit} data-sign={index === 0} data-active={highlight && (leading ? index < 2 : previous ? previous[index] !== bit : true)} key={index} aria-hidden="true">{bit}{fractional && index === 0 && <span className={styles.binaryPoint}>.</span>}</span>)}</div>
    <div className={styles.weightRow} style={{ "--bit-count": bits.length } as CSSProperties} aria-hidden="true">{weights.map((weight, index) => <span key={index}>{weight}</span>)}</div>
    <p className={styles.bitHelp}>{fractional ? (locale === "vi" ? "Dấu chấm sau bit dấu; bit đầu có trọng số −1." : "Point after the sign bit; the first bit has weight −1.") : (locale === "vi" ? "Exponent là số nguyên bù hai, không có dấu chấm phân số." : "The exponent is a two’s-complement integer, not a fraction.")}</p>
  </div>;
}

export function BitWeights({ mBits, eBits, locale }: { readonly mBits: number; readonly eBits: number; readonly locale: Locale }) {
  return <details className={styles.fallback}><summary>{locale === "vi" ? "Đọc trọng số từng bit" : "Read each bit’s weight"}</summary><div className={styles.tableScroll} role="region" aria-label={locale === "vi" ? "Bảng trọng số bit" : "Bit weights table"} tabIndex={0}><table><caption>{locale === "vi" ? "Đếm vị trí từ trái, bắt đầu từ 1" : "Positions count from the left, starting at 1"}</caption><thead><tr><th scope="col">{locale === "vi" ? "Trường" : "Field"}</th><th scope="col">{locale === "vi" ? "Vị trí" : "Position"}</th><th scope="col">{locale === "vi" ? "Trọng số" : "Weight"}</th></tr></thead><tbody>{[{ name: "Mantissa", width: mBits, fractional: true }, { name: "Exponent", width: eBits, fractional: false }].flatMap((field) => Array.from({ length: field.width }, (_, index) => <tr key={`${field.name}-${index}`}><th scope="row">{field.name}</th><td>{index + 1}</td><td>{index === 0 ? (field.fractional ? "−1" : `−${2 ** (field.width - 1)}`) : field.fractional ? `1/${2 ** index}` : String(2 ** (field.width - index - 1))}</td></tr>))}</tbody></table></div></details>;
}

export function StepControls({ index, steps, onChange, locale }: { readonly index: number; readonly steps: readonly { readonly id: string; readonly title: Localized }[]; readonly onChange: (index: number) => void; readonly locale: Locale }) {
  return <div className={styles.stepNavigation}><Button variant="secondary" disabled={index === 0} onClick={() => onChange(index - 1)}><ArrowLeft size={16} aria-hidden="true" /> {locale === "vi" ? "Bước trước" : "Previous"}</Button><Button disabled={index >= steps.length - 1} onClick={() => onChange(index + 1)}>{locale === "vi" ? "Bước tiếp" : "Next"} <ArrowRight size={16} aria-hidden="true" /></Button><Button variant="quiet" onClick={() => onChange(0)}><RotateCcw size={16} aria-hidden="true" /> {locale === "vi" ? "Đặt lại" : "Reset"}</Button><div className={styles.inputGroup}><label htmlFor="visual-step-choice">{locale === "vi" ? "Chọn bước" : "Jump to step"}</label><select id="visual-step-choice" value={index} onChange={(event) => onChange(Number(event.target.value))}>{steps.map((step, stepIndex) => <option key={step.id} value={stepIndex}>{stepIndex + 1}. {step.title[locale]}</option>)}</select></div></div>;
}

export function BinaryPointView({ binary, label }: { readonly binary: string; readonly label: string }) {
  return <div className={styles.binaryView}><span>{label}</span><div aria-label={`${label}: ${binary}`} role="img">{binary.split("").map((character, index) => character === "." ? <strong className={styles.pointMarker} key={index} aria-hidden="true">.</strong> : <span className={styles.binaryDigit} data-one={character === "1"} key={index} aria-hidden="true">{character}</span>)}</div></div>;
}
