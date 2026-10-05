import "server-only";
import evidenceLock from "./generated/evidence-lock.json";
import { getRunningPaper2BuildId } from "./build-identity";
import type { Paper2LessonStatusRecord } from "./lesson-status";

export function hasCurrentPaper2VisualBinding(record: Paper2LessonStatusRecord | undefined) {
  return Boolean(record
    && record.visualManifestSha256 === evidenceLock.visualManifestSha256
    && record.visualSemanticSha256 === evidenceLock.visualSemanticSha256
    && record.visualRuntimeSha256 === evidenceLock.visualRuntimeSha256);
}

export function isReviewedPaper2LessonReady(record: Paper2LessonStatusRecord | undefined) {
  if (!record || record.state !== "reviewed" || !hasCurrentPaper2VisualBinding(record)) return false;
  const locked = evidenceLock.records.find((item) => item.topicId === record.topicId && item.slug === record.slug);
  const embeddedBuildId = getRunningPaper2BuildId();
  const runningBuildId = process.env.NODE_ENV !== "production" && embeddedBuildId === "paper2-dev-local"
    ? evidenceLock.buildId
    : embeddedBuildId;
  return Boolean(locked?.approved
    && typeof evidenceLock.buildId === "string"
    && evidenceLock.buildId === runningBuildId
    && locked.buildId === evidenceLock.buildId
    && locked.version === record.version
    && locked.contentSha256 === record.contentSha256
    && locked.visualManifestSha256 === record.visualManifestSha256
    && locked.visualSemanticSha256 === record.visualSemanticSha256
    && locked.visualRuntimeSha256 === record.visualRuntimeSha256);
}
