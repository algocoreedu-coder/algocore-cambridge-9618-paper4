import type { Metadata } from "next";
import Link from "next/link";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";

import { LocaleBoundary } from "@/app/components/paper4-learning";
import { RehearsalHub } from "@/app/components/paper4-rehearsal/RehearsalHub";
import { rehearsalDescriptors, type RehearsalLocale } from "@/app/lib/paper4/rehearsals";

export const metadata: Metadata = {
  title: "Paper 4 mixed rehearsal | AlgoCore",
  description: "AlgoCore-authored diagnostic, half-paper, and full-mock practice for Paper 4.",
};

function localeOf(value: string | string[] | undefined): RehearsalLocale { return value === "vi" ? "vi" : "en"; }

export default async function RehearsalHubPage({ searchParams }: Readonly<{ searchParams: Promise<{ lang?: string | string[] }> }>) {
  const locale = localeOf((await searchParams).lang);
  const alternate = locale === "vi" ? "en" : "vi";
  return <LocaleBoundary locale={locale}>
    <DocsPage full toc={[]} tableOfContent={{ enabled: false }} footer={{ enabled: false }}>
      <div className="lesson-eyebrow"><span className="unit-label">PAPER 4 · REHEARSAL</span><span>{locale === "vi" ? "CHẨN ĐOÁN · NỬA ĐỀ · ĐỀ TỔNG HỢP" : "DIAGNOSTIC · HALF PAPER · FULL MOCK"}</span></div>
      <DocsTitle>{locale === "vi" ? "Luyện đề tổng hợp Paper 4" : "Paper 4 mixed rehearsal"}</DocsTitle>
      <DocsDescription>{locale === "vi" ? "Chọn đúng mức luyện, làm bài trong một luồng rõ ràng và chỉ mở rubric sau khi nộp." : "Choose the right rehearsal, work in one focused flow, and unlock the rubric only after submission."}</DocsDescription>
      <nav className="paper4-locale-switch" aria-label={locale === "vi" ? "Ngôn ngữ" : "Language"}><Link href={`/paper-4/rehearsals?lang=${alternate}`} data-locale-switch>{locale === "vi" ? "English" : "Tiếng Việt"}</Link></nav>
      <DocsBody>
        <aside className="concept-note" role="note"><div><strong>{locale === "vi" ? "Bài luyện do AlgoCore biên soạn" : "AlgoCore-authored practice"}</strong><p>{locale === "vi" ? "Đây không phải đề hoặc mark scheme chính thức của Cambridge. Điểm dùng để phân bổ thời gian và tự đánh giá." : "These are not official Cambridge papers or mark schemes. Marks support pacing and self-review."}</p></div></aside>
        <RehearsalHub papers={rehearsalDescriptors} locale={locale} />
        <p><Link href={`/paper-4?lang=${locale}`}>{locale === "vi" ? "← Quay lại lộ trình bài học" : "← Back to the lesson pathway"}</Link></p>
      </DocsBody>
    </DocsPage>
  </LocaleBoundary>;
}
