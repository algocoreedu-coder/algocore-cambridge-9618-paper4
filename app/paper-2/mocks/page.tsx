import Link from "next/link";
import { Clock3, FileCheck2 } from "lucide-react";

import { listPaper2Mocks } from "@/app/lib/paper2/assessment-registry";
import { paper2Href, resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import styles from "@/app/components/paper2-assessment/Paper2Assessment.module.css";

export default async function Paper2MocksPage({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  const locale = resolveLocale(await searchParams);
  const mocks = listPaper2Mocks().filter((mock) => mock.independentReviewStatus === "approved");
  return <div className={styles.workspace} lang={locale}><section className={styles.startCard}><FileCheck2 size={36} aria-hidden="true" /><span>{locale === "vi" ? "MÔ PHỎNG ĐỀ HOÀN CHỈNH" : "FULL PAPER REHEARSAL"}</span><h1>{locale === "vi" ? "Mock Paper 2" : "Paper 2 mock papers"}</h1><p>{locale === "vi" ? "Mỗi đề gồm 120 phút và 75 điểm luyện tập AlgoCore. Đáp án được giữ kín cho tới khi nộp." : "Each paper runs for 120 minutes and 75 AlgoCore practice marks. Solutions remain sealed until submission."}</p></section><div className={styles.questionList}>{mocks.map((mock, index) => <article className={styles.questionCard} key={mock.paperId}><header><div><span>MOCK {String.fromCharCode(65 + index)}</span><h2>{locale === "vi" ? `Đề mô phỏng độc lập ${index + 1}` : `Independent mock paper ${index + 1}`}</h2></div><strong>{mock.totalMarks} {locale === "vi" ? "điểm" : "marks"}</strong></header><p className={styles.answerProduct}><Clock3 size={16} aria-hidden="true" /> {mock.durationMinutes} min · {mock.questionRefs.length} {locale === "vi" ? "câu" : "questions"}</p><p className={styles.prompt}><Link className={styles.primaryButton} href={paper2Href(`/paper-2/mocks/${mock.paperId}`, locale)}>{locale === "vi" ? "Mở trang chuẩn bị" : "Open preparation page"}</Link></p></article>)}</div></div>;
}
