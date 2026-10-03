import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";

import { LocaleBoundary } from "@/app/components/paper4-learning";
import { RehearsalAttempt } from "@/app/components/paper4-rehearsal/RehearsalAttempt";
import { getRehearsalPaper, rehearsalStaticParams, type RehearsalLocale } from "@/app/lib/paper4/rehearsals";

type Props = Readonly<{ params: Promise<{ paperId: string }>; searchParams: Promise<{ lang?: string | string[] }> }>;

export const dynamicParams = false;
export function generateStaticParams() { return rehearsalStaticParams(); }
function localeOf(value: string | string[] | undefined): RehearsalLocale { return value === "vi" ? "vi" : "en"; }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ paperId }, query] = await Promise.all([params, searchParams]);
  const paper = getRehearsalPaper(paperId);
  if (!paper) notFound();
  const locale = localeOf(query.lang);
  return { title: `${paper.title[locale]} · AlgoCore`, description: locale === "vi" ? "Bài luyện Paper 4 do AlgoCore biên soạn." : "AlgoCore-authored Paper 4 rehearsal." };
}

export default async function RehearsalAttemptPage({ params, searchParams }: Props) {
  const [{ paperId }, query] = await Promise.all([params, searchParams]);
  const paper = getRehearsalPaper(paperId);
  if (!paper) notFound();
  const locale = localeOf(query.lang);
  const alternate = locale === "vi" ? "en" : "vi";
  return <LocaleBoundary locale={locale}>
    <DocsPage full toc={[]} tableOfContent={{ enabled: false }} footer={{ enabled: false }}>
      <div className="lesson-eyebrow"><span className="unit-label">PAPER 4 · PRACTICE</span><span>{paper.mode.replaceAll("_", " ").toUpperCase()}</span></div>
      <DocsTitle>{paper.title[locale]}</DocsTitle>
      <DocsDescription>{paper.total_marks} {locale === "vi" ? "điểm luyện tập AlgoCore" : "AlgoCore practice marks"}{paper.duration_minutes === null ? ` · ${locale === "vi" ? "không tính giờ" : "untimed"}` : ` · ${paper.duration_minutes} min`}.</DocsDescription>
      <nav className="paper4-locale-switch" aria-label={locale === "vi" ? "Ngôn ngữ" : "Language"}><Link href={`/paper-4/rehearsals/${paper.paper_id}?lang=${alternate}`} data-locale-switch>{locale === "vi" ? "English" : "Tiếng Việt"}</Link></nav>
      <DocsBody>
        <aside className="concept-note" role="note"><div><strong>{locale === "vi" ? "Bài luyện và rubric do AlgoCore biên soạn" : "AlgoCore-authored paper and rubric"}</strong><p>{locale === "vi" ? "Không phải đề hoặc mark scheme chính thức của Cambridge. Không có QP/MS locator chính thức." : "This is not an official Cambridge paper or mark scheme. It has no official QP/MS locator."}</p></div></aside>
        <RehearsalAttempt paper={paper} locale={locale} />
      </DocsBody>
    </DocsPage>
  </LocaleBoundary>;
}
