import "server-only";

import diagnosticPaper from "@/content/paper4/mocks/diagnostic/paper.json";
import halfAPaper from "@/content/paper4/mocks/half-a/paper.json";
import halfBPaper from "@/content/paper4/mocks/half-b/paper.json";
import manifestData from "@/content/paper4/mocks/manifest.json";
import mockAPaper from "@/content/paper4/mocks/mock-a/paper.json";
import mockBPaper from "@/content/paper4/mocks/mock-b/paper.json";

export type RehearsalLocale = "en" | "vi";
export type LocalizedText = Readonly<Record<RehearsalLocale, string>>;
export type RehearsalMode = "untimed_diagnostic" | "timed_half_paper" | "timed_full_mock";

export type RehearsalQuestion = Readonly<{
  question_id: string;
  marks: number;
  recommended_minutes: number;
  authority: "AlgoCore_authored";
  topics: readonly string[];
  prompt: LocalizedText;
  deliverables: readonly LocalizedText[];
  evidence_required: readonly LocalizedText[];
  graph_task_mode?: "none" | "describe_classify_justify_only";
}>;

export type RehearsalPaper = Readonly<{
  schema_version: "1.0.0";
  paper_id: string;
  authority: "AlgoCore_authored";
  title: LocalizedText;
  mode: RehearsalMode;
  duration_minutes: number | null;
  total_marks: number;
  language_contract: string;
  scope: readonly string[];
  source_files: readonly string[];
  submission_checklist: readonly LocalizedText[];
  evidence_document_checklist: readonly LocalizedText[];
  questions: readonly RehearsalQuestion[];
}>;

export type RehearsalDescriptor = Readonly<{
  paperId: string;
  kind: "diagnostic" | "half" | "full";
  title: LocalizedText;
  durationMinutes: number | null;
  marks: number;
  questionCount: number;
  scope: readonly string[];
}>;

const paperList = [diagnosticPaper, halfAPaper, halfBPaper, mockAPaper, mockBPaper] as unknown as readonly RehearsalPaper[];
const paperMap = new Map(paperList.map((paper) => [paper.paper_id, paper]));
const manifest = manifestData as unknown as {
  authority: string;
  official_cambridge_material: boolean;
  papers: ReadonlyArray<{ paper_id: string; kind: "diagnostic" | "half" | "full" }>;
};

if (manifest.authority !== "AlgoCore_authored" || manifest.official_cambridge_material !== false) {
  throw new Error("Paper 4 rehearsal authority contract is invalid.");
}

export const rehearsalDescriptors: readonly RehearsalDescriptor[] = manifest.papers.map((entry) => {
  const paper = paperMap.get(entry.paper_id);
  if (!paper) throw new Error(`Missing Paper 4 rehearsal paper: ${entry.paper_id}`);
  return {
    paperId: paper.paper_id,
    kind: entry.kind,
    title: paper.title,
    durationMinutes: paper.duration_minutes,
    marks: paper.total_marks,
    questionCount: paper.questions.length,
    scope: paper.scope,
  };
});

export function getRehearsalPaper(paperId: string) {
  return paperMap.get(paperId) ?? null;
}

export function isRehearsalPaperId(value: string) {
  return paperMap.has(value);
}

export function rehearsalStaticParams() {
  return rehearsalDescriptors.map(({ paperId }) => ({ paperId }));
}
