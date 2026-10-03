"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { RehearsalDescriptor, RehearsalLocale } from "@/app/lib/paper4/rehearsals";

import styles from "./Rehearsal.module.css";

type AttemptSummary = Readonly<{ status?: "active" | "submitted"; updatedAt?: number }>;

const storageKey = (paperId: string) => `algocore:paper4:rehearsal:v1:${paperId}`;

const kindLabel = {
  en: { diagnostic: "Diagnostic", half: "Half paper", full: "Full mock" },
  vi: { diagnostic: "Bài chẩn đoán", half: "Nửa đề", full: "Đề tổng hợp" },
} as const;

export function RehearsalHub({ papers, locale }: Readonly<{ papers: readonly RehearsalDescriptor[]; locale: RehearsalLocale }>) {
  const [attempts, setAttempts] = useState<Record<string, AttemptSummary>>({});

  useEffect(() => {
    const restored: Record<string, AttemptSummary> = {};
    for (const paper of papers) {
      try {
        const value = JSON.parse(window.localStorage.getItem(storageKey(paper.paperId)) ?? "null") as AttemptSummary | null;
        if (value?.status === "active" || value?.status === "submitted") restored[paper.paperId] = value;
      } catch { /* Ignore unavailable or stale browser storage. */ }
    }
    setAttempts(restored);
  }, [papers]);

  return <div className={styles.hubGrid} data-rehearsal-hub>
    {papers.map((paper) => {
      const attempt = attempts[paper.paperId];
      const status = attempt?.status === "active"
        ? (locale === "vi" ? "Đang làm · đã lưu trên thiết bị này" : "In progress · saved on this device")
        : attempt?.status === "submitted"
          ? (locale === "vi" ? "Đã nộp · có thể xem lại" : "Submitted · available for review")
          : (locale === "vi" ? "Chưa bắt đầu" : "Not started");
      const action = attempt?.status === "active"
        ? (locale === "vi" ? "Tiếp tục" : "Resume")
        : attempt?.status === "submitted"
          ? (locale === "vi" ? "Xem lại" : "Review")
          : (locale === "vi" ? "Bắt đầu" : "Start");
      return <article className={styles.packCard} data-kind={paper.kind} key={paper.paperId}>
        <div className={styles.packHeading}>
          <span>{kindLabel[locale][paper.kind]}</span>
          <strong>{paper.durationMinutes === null ? (locale === "vi" ? "Không tính giờ" : "Untimed") : `${paper.durationMinutes} min`}</strong>
        </div>
        <h2>{paper.title[locale]}</h2>
        <p className={styles.packMeta}>{paper.questionCount} {locale === "vi" ? "câu" : "questions"} · {paper.marks} {locale === "vi" ? "điểm AlgoCore" : "AlgoCore marks"}</p>
        <ul className={styles.scopeList}>{paper.scope.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className={styles.savedStatus} data-attempt-status={attempt?.status ?? "new"}>{status}</p>
        <Link className={styles.primaryLink} href={`/paper-4/rehearsals/${paper.paperId}?lang=${locale}`}>{action}</Link>
      </article>;
    })}
  </div>;
}
