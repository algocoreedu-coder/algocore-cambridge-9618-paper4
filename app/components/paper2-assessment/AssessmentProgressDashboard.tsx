"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, CircleDashed, RotateCcw, Target } from "lucide-react";

import type { Locale } from "@/app/lib/paper2/types";
import type { Paper2AttemptRecord } from "@/app/lib/paper2/attempt-types";
import { createPaper2StorageRepository } from "@/app/lib/paper2/storage-v2";

import styles from "./Paper2Assessment.module.css";

const LEARNER_SCOPE_ID = "learner:local-device";

export interface Paper2AssessmentDescriptor {
  readonly id: string;
  readonly kind: "practice" | "diagnostic" | "mock";
  readonly title: { readonly en: string; readonly vi: string };
  readonly href: string;
  readonly totalMarks: number;
  readonly sectionId?: string;
}

export function AssessmentProgressDashboard({ descriptors, locale }: { readonly descriptors: readonly Paper2AssessmentDescriptor[]; readonly locale: Locale }) {
  const [attempts, setAttempts] = useState<readonly Paper2AttemptRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const repository = createPaper2StorageRepository(window.localStorage, LEARNER_SCOPE_ID);
      const values = repository.listAttemptIds()
        .map((id) => repository.loadAttempt(id))
        .filter((result) => result.ok && result.value)
        .map((result) => result.ok ? result.value : null)
        .filter((value): value is Paper2AttemptRecord => Boolean(value))
        .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
      setAttempts(values);
    } finally {
      setLoaded(true);
    }
  }, []);

  const descriptorById = useMemo(() => new Map(descriptors.map((descriptor) => [descriptor.id, descriptor])), [descriptors]);
  const completed = attempts.filter((attempt) => attempt.status === "reviewed_attempt");
  const reviewedContentIds = new Set(completed.map((attempt) => attempt.contentId));
  const scoreRows = completed.map((attempt) => {
    const decisions = Object.values(attempt.selfMarks ?? {});
    const awarded = decisions.reduce((sum, decision) => sum + decision.marksAwarded, 0);
    const available = decisions.reduce((sum, decision) => sum + decision.marksAvailable, 0);
    return { attempt, awarded, available, percent: available > 0 ? Math.round(awarded / available * 100) : null };
  });
  const scored = scoreRows.filter((row): row is typeof row & { percent: number } => row.percent !== null);
  const average = scored.length ? Math.round(scored.reduce((sum, row) => sum + row.percent, 0) / scored.length) : null;
  const sectionRows = descriptors.filter((descriptor) => descriptor.sectionId).sort((left, right) => (left.sectionId ?? "").localeCompare(right.sectionId ?? "", "en", { numeric: true })).map((descriptor) => {
    const matching = scoreRows.filter((row) => row.attempt.contentId === descriptor.id);
    const best = matching.reduce<number | null>((value, row) => row.percent === null ? value : Math.max(value ?? 0, row.percent), null);
    return { descriptor, best, reviewed: reviewedContentIds.has(descriptor.id) };
  });
  const recommended = descriptors.find((descriptor) => descriptor.kind === "diagnostic" && !reviewedContentIds.has(descriptor.id))
    ?? descriptors.find((descriptor) => descriptor.sectionId && !reviewedContentIds.has(descriptor.id))
    ?? descriptors.find((descriptor) => descriptor.kind === "mock" && !reviewedContentIds.has(descriptor.id));

  if (!loaded) return <p className={styles.loading} role="status">{locale === "vi" ? "Đang đọc tiến độ trên thiết bị…" : "Reading progress on this device…"}</p>;

  return <div className={styles.progressDashboard}>
    <section className={styles.progressHero}>
      <BarChart3 size={34} aria-hidden="true" />
      <div><span>{locale === "vi" ? "TIẾN ĐỘ LUYỆN THI TRÊN THIẾT BỊ" : "EXAM PRACTICE PROGRESS ON THIS DEVICE"}</span><h1>{locale === "vi" ? "Theo dõi từ làm bài đến tự xem lại" : "Track attempts through self-review"}</h1><p>{locale === "vi" ? "Điểm ở đây do học sinh tự chấm theo hướng dẫn của AlgoCore. Kết quả giúp chọn bài tiếp theo và không phải điểm chính thức của Cambridge." : "Scores here are learner self-marks against AlgoCore rubrics. They guide the next practice choice and are not official Cambridge marks."}</p></div>
    </section>

    <section className={styles.metricGrid} aria-label={locale === "vi" ? "Tổng quan tiến độ" : "Progress overview"}>
      <article><CircleDashed size={22} aria-hidden="true" /><span>{locale === "vi" ? "Lượt đã bắt đầu" : "Attempts started"}</span><strong>{attempts.length}</strong></article>
      <article><CheckCircle2 size={22} aria-hidden="true" /><span>{locale === "vi" ? "Lượt xem lại hoàn tất" : "Review cycles complete"}</span><strong>{completed.length}</strong></article>
      <article><Target size={22} aria-hidden="true" /><span>{locale === "vi" ? "Điểm tự chấm trung bình" : "Average self-mark"}</span><strong>{average === null ? "—" : `${average}%`}</strong></article>
    </section>

    {recommended && <section className={styles.nextPractice}><div><span>{locale === "vi" ? "TIẾP TỤC LUYỆN" : "CONTINUE PRACTICE"}</span><h2>{recommended.title[locale]}</h2><p>{locale === "vi" ? "Hoàn thành bài, tự chấm từng ý và ghi lại một lỗi cần sửa để lượt làm được tính là đã xem lại." : "Complete the set, decide every mark point, and record one improvement before it counts as reviewed."}</p></div><Link className={styles.primaryButton} href={`${recommended.href}?lang=${locale}`}>{locale === "vi" ? "Mở bài tiếp theo" : "Open next activity"}</Link></section>}

    <section className={styles.sectionProgress}>
      <div><h2>{locale === "vi" ? "Mức luyện tập theo phần" : "Practice by section"}</h2><p>{locale === "vi" ? "Điểm tốt nhất là điểm tự chấm cao nhất trong các lượt đã hoàn tất xem lại." : "Best is the highest self-mark among attempts that completed the review cycle."}</p></div>
      <div className={styles.sectionProgressList}>{sectionRows.map(({ descriptor, best, reviewed }) => <article key={descriptor.id}>
        <div><span>{descriptor.sectionId}</span><h3>{descriptor.title[locale]}</h3></div>
        <strong>{best === null ? (locale === "vi" ? "Chưa xem lại" : "Not reviewed") : `${locale === "vi" ? "Tốt nhất" : "Best"} ${best}%`}</strong>
        <Link href={`${descriptor.href}?lang=${locale}`}>{reviewed ? (locale === "vi" ? "Luyện lại" : "Practise again") : (locale === "vi" ? "Bắt đầu" : "Start")}</Link>
      </article>)}</div>
    </section>

    <section className={styles.attemptHistory}>
      <h2>{locale === "vi" ? "Lịch sử gần đây" : "Recent attempt history"}</h2>
      {!attempts.length ? <p>{locale === "vi" ? "Chưa có lượt làm. Hãy bắt đầu bằng bài chẩn đoán hoặc một bộ luyện theo phần." : "No attempts yet. Start with the diagnostic or a section set."}</p> : <ol>{attempts.slice(0, 12).map((attempt) => {
        const descriptor = descriptorById.get(attempt.contentId);
        const row = scoreRows.find((candidate) => candidate.attempt.attemptId === attempt.attemptId);
        return <li key={attempt.attemptId}><div><strong>{descriptor?.title[locale] ?? (locale === "vi" ? "Lượt luyện tập đã lưu" : "Saved practice attempt")}</strong><span>{new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.updatedAt))}</span></div><span>{statusText(attempt.status, locale)}{row?.percent === null || row?.percent === undefined ? "" : ` · ${row.percent}%`}</span>{descriptor && <Link href={`${descriptor.href}?lang=${locale}`} aria-label={`${locale === "vi" ? "Mở" : "Open"} ${descriptor.title[locale]}`}><RotateCcw size={18} aria-hidden="true" /></Link>}</li>;
      })}</ol>}
    </section>
  </div>;
}

function statusText(status: Paper2AttemptRecord["status"], locale: Locale) {
  const labels: Record<Paper2AttemptRecord["status"], { en: string; vi: string }> = {
    not_started: { en: "Not started", vi: "Chưa bắt đầu" }, active: { en: "In progress", vi: "Đang làm" }, expired: { en: "Time expired", vi: "Đã hết giờ" }, submitted: { en: "Submitted", vi: "Đã nộp" }, self_marking: { en: "Self-marking", vi: "Đang tự chấm" }, self_marked: { en: "Reflection needed", vi: "Cần ghi phản hồi" }, reviewed_attempt: { en: "Reviewed", vi: "Đã hoàn tất xem lại" }, abandoned: { en: "Abandoned", vi: "Đã bỏ lượt" }, recovery_required: { en: "Recovery needed", vi: "Cần khôi phục" },
  };
  return labels[status][locale];
}
