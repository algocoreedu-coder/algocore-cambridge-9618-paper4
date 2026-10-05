import type { Paper2LessonStatusRecord } from "./lesson-status";

export function paper2CandidateAccessDecision({
  record,
  requestedRevision,
  sessionValid,
  previewEnabled,
  allowlist,
  visualBindingValid,
}: {
  readonly record: Paper2LessonStatusRecord | undefined;
  readonly requestedRevision: string | undefined;
  readonly sessionValid: boolean;
  readonly previewEnabled: boolean;
  readonly allowlist: ReadonlySet<string>;
  readonly visualBindingValid: boolean;
}) {
  if (!record || record.state !== "candidate" || requestedRevision !== record.version) return false;
  if (!previewEnabled || !sessionValid || !visualBindingValid) return false;
  return allowlist.has(`${record.topicId}@${record.version}`);
}
