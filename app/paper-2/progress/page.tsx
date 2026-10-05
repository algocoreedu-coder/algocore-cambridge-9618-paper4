import { AssessmentProgressDashboard, type Paper2AssessmentDescriptor } from "@/app/components/paper2-assessment/AssessmentProgressDashboard";
import { listPaper2Mocks, listPaper2PracticeSets } from "@/app/lib/paper2/assessment-registry";
import { resolveLocale, type PageQuery } from "@/app/lib/paper2/catalog";

export default async function Paper2ProgressPage({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  const locale = resolveLocale(await searchParams);
  const practice: Paper2AssessmentDescriptor[] = listPaper2PracticeSets()
    .filter((set) => set.rightsStatus === "approved" && set.review.decision === "approved")
    .map((set) => ({
      id: set.setId,
      kind: set.kind === "diagnostic" ? "diagnostic" : "practice",
      title: set.title,
      href: `/paper-2/practice/${set.setId}`,
      totalMarks: set.computedMarks,
      sectionId: set.kind === "section_mixed" ? set.setId.match(/section-(\d+-\d+)/)?.[1]?.replace("-", ".") : undefined,
    }));
  const mocks: Paper2AssessmentDescriptor[] = listPaper2Mocks()
    .filter((mock) => mock.independentReviewStatus === "approved")
    .map((mock, index) => ({ id: mock.paperId, kind: "mock", title: { en: `Independent mock paper ${index + 1}`, vi: `Đề mô phỏng độc lập ${index + 1}` }, href: `/paper-2/mocks/${mock.paperId}`, totalMarks: mock.totalMarks }));
  return <AssessmentProgressDashboard descriptors={[...practice, ...mocks]} locale={locale} />;
}
