"use client";

import { useRef } from "react";
import { Check, CheckCircle2, Circle, CircleDashed, Flag, List, X } from "lucide-react";

import type { Locale } from "@/app/lib/paper2/types";

import styles from "./Paper2Assessment.module.css";

export interface AssessmentNavigatorItem {
  readonly identity: string;
  readonly number: number;
  readonly answered: boolean;
  readonly flagged: boolean;
  readonly sectionId?: string;
  readonly selfMarkStatus?: "not-started" | "partial" | "complete";
}

interface AssessmentNavigatorProps {
  readonly items: readonly AssessmentNavigatorItem[];
  readonly currentIdentity?: string;
  readonly locale: Locale;
  readonly flagsEditable: boolean;
  readonly onNavigate: (identity: string) => void;
  readonly onToggleFlag: (identity: string) => void;
}

export function AssessmentNavigator(props: AssessmentNavigatorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const answeredCount = props.items.filter((item) => item.answered).length;
  const flaggedCount = props.items.filter((item) => item.flagged).length;
  const current = props.items.find((item) => item.identity === props.currentIdentity) ?? props.items[0];

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog(returnFocus = true) {
    dialogRef.current?.close();
    if (returnFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function navigate(identity: string, close = false) {
    if (close) closeDialog(false);
    props.onNavigate(identity);
  }

  const navigator = (mobile: boolean) => <>
    <div className={styles.navigatorSummary} aria-live="polite" aria-atomic="true">
      <strong>{answeredCount}/{props.items.length} {props.locale === "vi" ? "đã trả lời" : "answered"}</strong>
      <span>{props.items.length - answeredCount} {props.locale === "vi" ? "chưa làm" : "unanswered"} · {flaggedCount} {props.locale === "vi" ? "xem lại" : "to review"}</span>
    </div>
    <div className={styles.navigatorGrid}>
      {props.items.map((item) => {
        const isCurrent = item.identity === props.currentIdentity;
        const accessibleName = questionAccessibleName(item, isCurrent, props.locale);
        return <button
          className={styles.navigatorItem}
          data-answered={item.answered || undefined}
          data-current={isCurrent || undefined}
          data-flagged={item.flagged || undefined}
          data-self-mark={item.selfMarkStatus}
          type="button"
          key={item.identity}
          aria-current={isCurrent ? "step" : undefined}
          aria-label={accessibleName}
          title={accessibleName}
          onClick={() => navigate(item.identity, mobile)}
        >
          <span aria-hidden="true">{item.number}</span>
          {item.answered ? <Check className={styles.navigatorStateIcon} size={12} aria-hidden="true" /> : <Circle className={styles.navigatorStateIcon} size={10} aria-hidden="true" />}
          {item.flagged && <Flag className={styles.navigatorFlagIcon} size={12} aria-hidden="true" />}
          {item.selfMarkStatus === "complete" && <CheckCircle2 className={styles.navigatorSelfMarkIcon} size={14} aria-hidden="true" />}
          {(item.selfMarkStatus === "not-started" || item.selfMarkStatus === "partial") && <CircleDashed className={styles.navigatorSelfMarkIcon} size={14} aria-hidden="true" />}
        </button>;
      })}
    </div>
    <ul className={styles.navigatorLegend} aria-label={props.locale === "vi" ? "Chú giải trạng thái câu hỏi" : "Question status legend"}>
      <li><Circle size={12} aria-hidden="true" />{props.locale === "vi" ? "Chưa trả lời" : "Unanswered"}</li>
      <li><Check size={13} aria-hidden="true" />{props.locale === "vi" ? "Đã trả lời" : "Answered"}</li>
      <li><span className={styles.currentLegend} aria-hidden="true" />{props.locale === "vi" ? "Đang xem" : "Current"}</li>
      <li><Flag size={13} aria-hidden="true" />{props.locale === "vi" ? "Đánh dấu xem lại" : "Flagged for review"}</li>
      {props.items.some((item) => item.selfMarkStatus) && <><li><CircleDashed size={13} aria-hidden="true" />{props.locale === "vi" ? "Tự chấm chưa xong" : "Self-mark incomplete"}</li><li><CheckCircle2 size={13} aria-hidden="true" />{props.locale === "vi" ? "Đã tự chấm xong" : "Self-mark complete"}</li></>}
    </ul>
    <div className={styles.navigatorQuickActions}>
      <button type="button" disabled={!props.items.some((item) => !item.answered)} onClick={() => {
        const item = props.items.find((candidate) => !candidate.answered);
        if (item) navigate(item.identity, mobile);
      }}>{props.locale === "vi" ? "Câu chưa làm đầu tiên" : "First unanswered"}</button>
      <button type="button" disabled={!props.items.some((item) => item.flagged)} onClick={() => {
        const item = props.items.find((candidate) => candidate.flagged);
        if (item) navigate(item.identity, mobile);
      }}>{props.locale === "vi" ? "Câu đánh dấu đầu tiên" : "First flagged"}</button>
    </div>
  </>;

  return <>
    <aside className={styles.questionNavigator} aria-label={props.locale === "vi" ? "Danh sách câu hỏi" : "Question navigator"}>
      <h2>{props.locale === "vi" ? "Câu hỏi" : "Questions"}</h2>
      {navigator(false)}
    </aside>

    <div className={styles.mobileNavigatorBar}>
      <div><strong>{props.locale === "vi" ? `Câu ${current?.number ?? 1}/${props.items.length}` : `Question ${current?.number ?? 1}/${props.items.length}`}</strong><span>{answeredCount} {props.locale === "vi" ? "đã trả lời" : "answered"}{flaggedCount ? ` · ${flaggedCount} ${props.locale === "vi" ? "xem lại" : "flagged"}` : ""}</span></div>
      {current && <button className={styles.mobileFlagButton} type="button" disabled={!props.flagsEditable} aria-pressed={current.flagged} aria-label={current.flagged ? (props.locale === "vi" ? "Bỏ đánh dấu câu hiện tại" : "Remove current question flag") : (props.locale === "vi" ? "Đánh dấu câu hiện tại để xem lại" : "Flag current question for review")} onClick={() => props.onToggleFlag(current.identity)}><Flag size={18} aria-hidden="true" /></button>}
      <button ref={triggerRef} type="button" onClick={openDialog}><List size={18} aria-hidden="true" />{props.locale === "vi" ? "Danh sách" : "Questions"}</button>
    </div>

    <dialog className={styles.navigatorDialog} ref={dialogRef} aria-labelledby="paper2-question-list-title" onCancel={(event) => { event.preventDefault(); closeDialog(); }}>
      <div className={styles.navigatorDialogHeader}><h2 id="paper2-question-list-title">{props.locale === "vi" ? "Danh sách câu hỏi" : "Question list"}</h2><button type="button" onClick={() => closeDialog()} aria-label={props.locale === "vi" ? "Đóng danh sách câu hỏi" : "Close question list"}><X size={20} aria-hidden="true" /></button></div>
      {navigator(true)}
    </dialog>
  </>;
}

function questionAccessibleName(item: AssessmentNavigatorItem, current: boolean, locale: Locale) {
  if (locale === "vi") {
    const selfMark = item.selfMarkStatus === "complete" ? "đã tự chấm xong" : item.selfMarkStatus === "partial" ? "tự chấm chưa xong" : item.selfMarkStatus === "not-started" ? "chưa bắt đầu tự chấm" : "";
    return [`Câu ${item.number}`, current ? "đang xem" : "", item.answered ? "đã trả lời" : "chưa trả lời", item.flagged ? "đã đánh dấu xem lại" : "", selfMark].filter(Boolean).join(", ");
  }
  const selfMark = item.selfMarkStatus === "complete" ? "self-mark complete" : item.selfMarkStatus === "partial" ? "self-mark incomplete" : item.selfMarkStatus === "not-started" ? "self-mark not started" : "";
  return [`Question ${item.number}`, current ? "current" : "", item.answered ? "answered" : "unanswered", item.flagged ? "flagged for review" : "", selfMark].filter(Boolean).join(", ");
}
