import { verifyStudentSessionToken } from "@/app/lib/auth";
import type { Paper2LessonStatusRecord } from "./lesson-status";
import { paper2CandidateAccessDecision } from "./candidate-access-policy";
import { hasCurrentPaper2VisualBinding } from "./delivery-readiness";

const ALLOWLIST_ENV = "ALGOCORE_PAPER2_CANDIDATE_ALLOWLIST";
const PREVIEW_ENV = "PAPER2_CANDIDATE_PREVIEW";

function configuredAllowlist() {
  return new Set((process.env[ALLOWLIST_ENV] ?? "").split(",").map((value) => value.trim()).filter(Boolean));
}

export function canPreviewPaper2Candidate({
  record,
  requestedRevision,
  sessionToken,
}: {
  readonly record: Paper2LessonStatusRecord | undefined;
  readonly requestedRevision: string | undefined;
  readonly sessionToken: string | undefined;
}) {
  return paper2CandidateAccessDecision({
    record,
    requestedRevision,
    sessionValid: verifyStudentSessionToken(sessionToken),
    previewEnabled: process.env[PREVIEW_ENV] === "1",
    allowlist: configuredAllowlist(),
    visualBindingValid: hasCurrentPaper2VisualBinding(record),
  });
}

export const paper2CandidateAllowlistEnvironmentVariable = ALLOWLIST_ENV;
export const paper2CandidatePreviewEnvironmentVariable = PREVIEW_ENV;
