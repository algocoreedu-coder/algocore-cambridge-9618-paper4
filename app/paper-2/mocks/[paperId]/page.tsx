import { notFound } from "next/navigation";

import { Paper2AssessmentWorkspace } from "@/app/components/paper2-assessment/Paper2AssessmentWorkspace";
import { getPaper2Mock, resolvePaper2PublicQuestions } from "@/app/lib/paper2/assessment-registry";
import { resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import { getPaper2PublicSourceLabels } from "@/app/lib/paper2/public-source-registry";

export default async function Paper2MockPage({ params, searchParams }: { readonly params: Promise<{ paperId: string }>; readonly searchParams: Promise<PageQuery> }) {
  const [{ paperId }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(query);
  const mock = getPaper2Mock(paperId);
  if (!mock || mock.independentReviewStatus !== "approved") notFound();
  const questions = resolvePaper2PublicQuestions(mock.questionRefs);
  if (questions.length !== mock.questionRefs.length) notFound();
  const sourceLabels = Object.fromEntries(questions.map((question) => [question.questionId, getPaper2PublicSourceLabels(question.sourceIds)]));
  return <Paper2AssessmentWorkspace kind="mock" contentId={mock.paperId} contentVersion={mock.paperVersion} contentHash={mock.publicHash} mode="mock_timed" title={{ en: `Paper 2 Mock · ${mock.paperId}`, vi: `Đề mô phỏng Paper 2 · ${mock.paperId}` }} instructions={{ en: "Answer every question. Allocate time in proportion to the available AlgoCore practice marks, then reserve time to check trace tables, boundaries and pseudocode syntax.", vi: "Trả lời mọi câu. Phân bổ thời gian theo điểm luyện tập AlgoCore, rồi dành thời gian kiểm tra trace table, giá trị biên và cú pháp pseudocode." }} questions={questions} sourceLabels={sourceLabels} durationMinutes={120} totalMarks={75} locale={locale} />;
}
