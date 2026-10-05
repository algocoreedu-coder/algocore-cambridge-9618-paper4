import "server-only";

import data from "@/content/paper2/study-map.json";
import type { StudyMapCatalog } from "./types";
import { paper2LessonStatus } from "./lesson-status";
import { isReviewedPaper2LessonReady } from "./delivery-readiness";

// Candidate lessons remain planned in the public catalog. Only independently
// reviewed lessons bound to the running artifact are advertised as available.
export function getCatalog(): StudyMapCatalog {
  const reviewed = new Set(paper2LessonStatus.lessons.filter(isReviewedPaper2LessonReady).map((item) => item.topicId));
  return { ...data, topics: data.topics.map(topic => ({ ...topic, status: reviewed.has(topic.id) ? "available" as const : "planned" as const })) } as StudyMapCatalog;
}
