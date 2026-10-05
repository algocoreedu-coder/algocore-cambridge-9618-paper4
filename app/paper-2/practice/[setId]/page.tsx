import { createHash } from "node:crypto";
import { notFound } from "next/navigation";

import { Paper2AssessmentWorkspace } from "@/app/components/paper2-assessment/Paper2AssessmentWorkspace";
import { getPaper2PracticeSet, resolvePaper2PublicQuestions } from "@/app/lib/paper2/assessment-registry";
import { resolvePaper2PrivateSolutions } from "@/app/lib/paper2/assessment-private-registry";
import { resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";
import { getPaper2PublicSourceLabels } from "@/app/lib/paper2/public-source-registry";

export default async function Paper2PracticeSetPage({ params, searchParams }: { readonly params: Promise<{ setId: string }>; readonly searchParams: Promise<PageQuery> }) {
  const [{ setId }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(query);
  const set = getPaper2PracticeSet(setId);
  if (!set || set.rightsStatus !== "approved" || set.review.decision !== "approved") notFound();
  const questions = resolvePaper2PublicQuestions(set.questionRefs);
  if (questions.length !== set.questionRefs.length) notFound();
  const immediateSolutions = set.solutionDisclosure === "immediate" ? resolvePaper2PrivateSolutions(set.questionRefs) : undefined;
  if (immediateSolutions && immediateSolutions.length !== set.questionRefs.length) notFound();
  const contentHash = createHash("sha256").update(JSON.stringify(set), "utf8").digest("hex");
  const rubricHash = immediateSolutions ? createHash("sha256").update(immediateSolutions.map((solution) => solution.privateHash).join(":"), "utf8").digest("hex") : undefined;
  const sourceLabels = Object.fromEntries(questions.map((question) => [question.questionId, getPaper2PublicSourceLabels(question.sourceIds)]));
  return <Paper2AssessmentWorkspace kind={set.kind === "diagnostic" ? "diagnostic" : "practice_set"} contentId={set.setId} contentVersion={set.setVersion} contentHash={contentHash} mode={set.mode} title={set.title} instructions={set.instructions} questions={questions} sourceLabels={sourceLabels} immediateSolutions={immediateSolutions} immediateRubricHash={rubricHash} durationMinutes={set.computedMinutes} totalMarks={set.computedMarks} locale={locale} />;
}
