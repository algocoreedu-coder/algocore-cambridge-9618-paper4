import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Paper2VisualExplorer } from "@/app/components/paper2-learning/lessons/Paper2VisualExplorer";
import styles from "@/app/components/paper2-learning/lessons/Paper2Lesson.module.css";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/app/lib/auth";
import { canPreviewPaper2Candidate } from "@/app/lib/paper2/candidate-access";
import { resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import { getPaper2LessonStatusByTopicId } from "@/app/lib/paper2/lesson-status";
import { getPaper2VisualManifestSha256, getPaper2VisualSelection } from "@/app/lib/paper2/server-visual-registry";

type Props = { readonly params: Promise<{ assetId: string }>; readonly searchParams: Promise<PageQuery> };
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "Paper 2 native visual review" };

export default async function Paper2NativeVisualReview({ params, searchParams }: Props) {
  noStore();
  const [{ assetId }, query, cookieStore] = await Promise.all([params, searchParams, cookies()]);
  const topicId = Array.isArray(query.topic) ? query.topic[0] : query.topic;
  const requestedRevision = Array.isArray(query.candidate) ? query.candidate[0] : query.candidate;
  const requestedSmoke = (Array.isArray(query.smoke) ? query.smoke[0] : query.smoke) === "1";
  const sessionToken = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
  const record = topicId ? getPaper2LessonStatusByTopicId(topicId) : undefined;
  const candidate = canPreviewPaper2Candidate({
    record,
    requestedRevision,
    sessionToken,
  });
  const smoke = requestedSmoke && process.env.PAPER2_VISUAL_SMOKE === "1" && verifyStudentSessionToken(sessionToken);
  const manifestMatches = smoke || record?.visualManifestSha256 === getPaper2VisualManifestSha256();
  const visualSelection = getPaper2VisualSelection([assetId]);
  if ((!candidate && !smoke) || !manifestMatches || !visualSelection) notFound();
  const locale = resolveLocale(query);
  return <section className={styles.lesson} aria-labelledby="paper2-review-title" data-paper2-review-harness data-candidate="true" data-paper2-review-asset={assetId}>
    <div className={styles.candidateBanner} role="status">
      {locale === "vi" ? "Harness kiểm tra visual nội bộ · không công khai cho học sinh" : "Internal visual test harness · not a learner-published route"}
    </div>
    <h1 id="paper2-review-title">{locale === "vi" ? `Review visual Paper 2: ${assetId}` : `Paper 2 visual review: ${assetId}`}</h1>
    <h2 className={styles.srOnly}>{locale === "vi" ? "Visual tương tác đang được review" : "Interactive visual under review"}</h2>
    <Paper2VisualExplorer selection={visualSelection} locale={locale} />
  </section>;
}
