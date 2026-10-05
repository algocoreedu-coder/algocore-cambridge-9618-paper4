import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [progress, lessonPage, storage, courseProgress, assessmentProgress, assessmentProgressPage, shell] = await Promise.all([
  readFile(path.join(root, "app/components/paper2-learning/lessons/LessonProgress.tsx"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/lessons/LessonPage.tsx"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/progress-storage.ts"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/CourseProgressSummary.tsx"), "utf8"),
  readFile(path.join(root, "app/components/paper2-assessment/AssessmentProgressDashboard.tsx"), "utf8"),
  readFile(path.join(root, "app/paper-2/progress/page.tsx"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/Paper2Shell.tsx"), "utf8"),
]);
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
check(storage.includes("PAPER2_PROGRESS_SCHEMA_VERSION = 1"), "Progress storage must use an explicit schema version.");
check(storage.includes("candidate.schemaVersion !== PAPER2_PROGRESS_SCHEMA_VERSION"), "Stale progress versions must fall back safely.");
check(storage.includes("Array.isArray(candidate.anchors)"), "Stored anchors must be type checked before use.");
check(storage.includes("PAPER2_LESSON_ANCHORS.includes"), "Unknown stored anchor IDs must be discarded.");
check((storage.match(/catch/g) ?? []).length >= 3 && progress.includes("Memory state remains usable"), "Progress reads and writes must retain an in-memory fallback when localStorage fails.");
check(lessonPage.includes("writable={!candidate}"), "Candidate preview must mount a read-only outline and never writable learner progress.");
check(!lessonPage.includes("styles.lessonNav") && progress.includes("data-progress-anchor"), "Lesson navigation and progress must be one six-anchor outline.");
check(progress.includes("Mark as reviewed") && progress.includes("Đánh dấu đã học") && !/>Mark</.test(progress), "Progress controls must explain that the action marks a section as reviewed.");
check(storage.includes("PAPER2_COURSE_PROGRESS_KEY") && storage.includes("lastVisited") && courseProgress.includes("not a score or a measure of mastery"), "Course progress must be versioned and visibly separated from score/mastery.");
check(courseProgress.includes("data-paper2-continue") && courseProgress.includes("PAPER2_PROGRESS_EVENT"), "Study Map progress must provide a reactive Continue learning action.");
check(courseProgress.includes("data-paper2-progress-complete") && !courseProgress.includes("incomplete[0] ?? scoped[0]"), "A 100% checklist must show a completion state instead of restarting Continue learning at lesson one.");
check(assessmentProgress.includes("createPaper2StorageRepository") && assessmentProgress.includes('attempt.status === "reviewed_attempt"'), "Assessment progress must read validated v2 attempts and count only completed review cycles.");
check(assessmentProgress.includes("marksAwarded") && assessmentProgress.includes("marksAvailable") && assessmentProgress.includes("self-mark"), "Assessment progress must derive and label learner self-marks rather than presenting official exam scores.");
check(assessmentProgressPage.includes("listPaper2PracticeSets") && assessmentProgressPage.includes("listPaper2Mocks"), "Assessment progress route must use the reviewed public assessment registry.");
check(shell.includes('paper2Href("/paper-2/progress"'), "The Paper 2 shell must expose the assessment progress route.");
console.log(JSON.stringify({ schema_version: "paper2-progress-check-v4", decision: failures.length ? "FAIL" : "PASS", checks: 15, failures }, null, 2));
if (failures.length) process.exitCode = 1;
