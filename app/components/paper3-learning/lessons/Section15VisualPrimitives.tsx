"use client";

import { useId, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/app/components/algocore-ui";
import type { Locale, Localized } from "@/app/lib/paper3/catalog";
import styles from "./Section15Workbench.module.css";

export interface VisualStepCopy { readonly id: string; readonly title: Localized; readonly action: Localized; readonly why: Localized; readonly outcome: Localized }

export function StateControls({ steps, index, onChange, onReset, locale }: { readonly steps: readonly VisualStepCopy[]; readonly index: number; readonly onChange: (index: number) => void; readonly onReset?: () => void; readonly locale: Locale }) {
  const id = useId();
  return <div className={styles.controls}>
    <Button variant="secondary" data-hardware-previous disabled={index === 0} onClick={() => onChange(index - 1)}><ArrowLeft size={16} aria-hidden="true" />{locale === "vi" ? "Bước trước" : "Previous"}</Button>
    <Button data-hardware-next disabled={index === steps.length - 1} onClick={() => onChange(index + 1)}>{locale === "vi" ? "Bước tiếp" : "Next"}<ArrowRight size={16} aria-hidden="true" /></Button>
    <Button variant="quiet" data-hardware-reset onClick={() => onReset ? onReset() : onChange(0)}><RotateCcw size={16} aria-hidden="true" />{locale === "vi" ? "Đặt lại" : "Reset"}</Button>
    <div className={styles.field}><label htmlFor={id}>{locale === "vi" ? "Chọn bước" : "Jump to step"}</label><select id={id} data-hardware-jump value={index} onChange={event => onChange(Number(event.target.value))}>{steps.map((step, position) => <option key={step.id} value={position}>{position + 1}. {step.title[locale]}</option>)}</select></div>
  </div>;
}

export function StateHeading({ step, index, count, locale }: { readonly step: VisualStepCopy; readonly index: number; readonly count: number; readonly locale: Locale }) {
  return <div className={styles.heading}><span>{locale === "vi" ? "Bước" : "Step"} {index + 1}/{count}</span><h3>{step.title[locale]}</h3><span className={styles.srOnly} role="status">{locale === "vi" ? "Bước" : "Step"} {index + 1}. {step.title[locale]}</span></div>;
}

export function StateExplanation({ step, locale }: { readonly step: VisualStepCopy; readonly locale: Locale }) {
  return <dl className={styles.explanation}><div><dt>{locale === "vi" ? "Thao tác" : "Action"}</dt><dd data-step-action>{step.action[locale]}</dd></div><div><dt>{locale === "vi" ? "Vì sao" : "Why"}</dt><dd data-step-why>{step.why[locale]}</dd></div><div><dt>{locale === "vi" ? "Kết quả" : "Outcome"}</dt><dd data-step-outcome>{step.outcome[locale]}</dd></div></dl>;
}

export function StateTable<S extends VisualStepCopy>({ steps, selectedId, before, after, locale }: { readonly steps: readonly S[]; readonly selectedId: string; readonly before: (step: S) => ReactNode; readonly after: (step: S) => ReactNode; readonly locale: Locale }) {
  return <details className={styles.fallback} data-state-fallback><summary>{locale === "vi" ? "Đọc toàn bộ trạng thái dạng bảng" : "Read every state as a table"}</summary><div className={styles.tableScroll} role="region" tabIndex={0} aria-label={locale === "vi" ? "Bảng trạng thái minh họa" : "Visual state table"}><table><caption>{locale === "vi" ? "Cùng dữ liệu với hình; mỗi hàng có trạng thái trước, sau và lý do." : "The same data as the diagram; every row includes before, after and reasoning."}</caption><thead><tr>{(locale === "vi" ? ["Bước", "Trước", "Sau", "Thao tác / Lý do / Kết quả"] : ["Step", "Before", "After", "Action / Why / Outcome"]).map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{steps.map((step, index) => <tr key={step.id} data-fallback-step={step.id} data-selected={step.id === selectedId} aria-current={step.id === selectedId ? "step" : undefined}><th scope="row">{index + 1}. {step.title[locale]}{step.id === selectedId && <strong className={styles.selectedLabel}>{locale === "vi" ? "Đang chọn" : "Selected"}</strong>}</th><td data-state-before>{before(step)}</td><td data-state-after>{after(step)}</td><td><p>{step.action[locale]}</p><p>{step.why[locale]}</p><p>{step.outcome[locale]}</p></td></tr>)}</tbody></table></div></details>;
}
