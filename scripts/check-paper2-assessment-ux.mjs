import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");
const workspace = read("app/components/paper2-assessment/Paper2AssessmentWorkspace.tsx");
const navigator = read("app/components/paper2-assessment/AssessmentNavigator.tsx");
const library = read("app/components/paper2-assessment/PracticeLibrary.tsx");
const practicePage = read("app/paper-2/practice/page.tsx");
const dashboard = read("app/components/paper2-assessment/AssessmentProgressDashboard.tsx");
const css = read("app/components/paper2-assessment/Paper2Assessment.module.css");

const checks = [], failures = [];
const check = (id, pass, detail) => { const row = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(row); if (!row.pass) failures.push(row); };

check("navigator-multi-state", ["data-answered", "data-current", "data-flagged", "aria-current", "aria-pressed"].every((token) => navigator.includes(token)));
check("navigator-non-color-cues", navigator.includes("Question status legend") && navigator.includes("Flagged for review") && navigator.includes("Check"));
check("navigator-mobile-dialog", navigator.includes("<dialog") && navigator.includes("showModal") && css.includes(".mobileNavigatorBar"));
check("workspace-navigation-persisted", workspace.includes("updatePaper2AttemptNavigation") && workspace.includes("flaggedQuestionIdentities") && workspace.includes("activeSectionId"));
check("navigation-write-versioned", workspace.includes("navigationGeneration") && workspace.includes("originAttemptId") && workspace.includes("generation !== navigationGeneration.current"));
check("flag-cancels-delayed-navigation", /toggleQuestionFlag[\s\S]*?cancelPendingNavigation\(\)[\s\S]*?persistNavigation\(identity, sectionId, \[\.\.\.flags\]\)/.test(workspace));
check("navigation-cancelled-on-reset-and-unmount", /function reset\(\)[\s\S]*?cancelPendingNavigation\(\)/.test(workspace) && workspace.includes("useEffect(() => () => cancelPendingNavigation()"));
check("diagnostic-chunked-by-section", workspace.includes("diagnosticChunks") && workspace.includes("visibleQuestions") && workspace.includes("Resume at question"));
check("submit-summary-unanswered-and-flagged", workspace.includes("unansweredItems") && workspace.includes("flaggedItems") && workspace.includes("Check before submission"));
check("submit-freezes-latest-attempt", workspace.includes("const locked = !active || submitting") && workspace.includes("const latest = attemptRef.current") && workspace.includes("latest.attemptId !== requestedAttempt.attemptId"));
check("submit-never-switches-to-split-memory-repository", !workspace.includes("repository.current = memoryRepository") && workspace.includes("repo.loadAttempt(next.attemptId)"));
check("submitted-attempt-recovers-self-marking", workspace.includes("recoverTerminalAttempt") && workspace.includes('latest.status === "submitted"') && workspace.includes("rubric_loaded_and_marking_started") && workspace.includes("Retry marking guidance"));
check("empty-assessment-fails-closed", workspace.includes("props.questions.length === 0") && workspace.includes("no attempt was created") && workspace.includes("This question set is not ready"));
check("confirmation-focus-contract", workspace.includes("submitConfirmHeadingRef") && workspace.includes('role="region"') && workspace.includes("cancelSubmitConfirmation") && workspace.includes("resetConfirmHeadingRef") && workspace.includes("cancelResetConfirmation"));
check("workspace-heading-mode-aware", workspace.includes("workspaceModeLabel(props.mode, locale)") && workspace.includes("BÀI CHẨN ĐOÁN PAPER 2") && workspace.includes("TỰ KIỂM PAPER 2"));
check("practice-url-backed-controls", ["group", "section", "mode", "duration", "sort"].every((key) => library.includes(`searchParams.get(\"${key}\")`)) && library.includes("router.replace"));
check("practice-url-canonicalized", library.includes("rawSection && section === \"all\"") && library.includes('next.delete("section")') && library.includes("sectionIds.includes(rawSection)"));
check("practice-mobile-filter-collapsed", library.includes("aria-expanded={filtersOpen}") && library.includes("data-open={filtersOpen}") && css.includes(".libraryControls{position:static") && css.includes(".filterGrid[data-open=false]{display:none}"));
check("practice-grouping-and-syllabus-sort", library.includes("Practice by section") && library.includes("Cumulative revision") && practicePage.includes("syllabusIndex"));
check("practice-no-raw-enum-render", !practicePage.includes("set.kind.replaceAll") && !practicePage.includes("{set.mode}") && !library.includes("set_guided") && !library.includes("diagnostic_closed"));
check("dashboard-no-raw-id-fallback", !dashboard.includes("?? attempt.contentId") && dashboard.includes("Lượt luyện tập đã lưu"));
for (const forbidden of ["tự review", "Vòng review", "theo section", "Best là", "Chưa review", "bài diagnostic", "một set theo section", "Đã review"]) {
  check(`vietnamese-copy:${forbidden}`, !workspace.includes(forbidden) && !dashboard.includes(forbidden), forbidden);
}
check("assessment-css-semantic-colors", !/(?:^|[^-])#[0-9a-f]{3,8}\b/i.test(css) && css.includes("var(--alg-surface-panel)") && css.includes("var(--alg-text-default)"));
check("assessment-css-responsive", css.includes("@media(max-width:700px)") && css.includes(".navigatorDialog[open]") && css.includes("min-width:44px"));
check("navigator-collapses-through-tablet", css.includes("@media(max-width:1023px){.workspace:has(.mobileNavigatorBar)") && css.includes(".questionNavigator{display:none}"));
check("question-focus-and-flag-target", css.includes(".questionCard h2:focus{border-radius") && css.includes(".questionHeaderActions button{min-height:var(--alg-touch-target)"));
check("navigator-self-mark-progress", navigator.includes("selfMarkStatus") && navigator.includes("data-self-mark") && navigator.includes("self-mark incomplete") && workspace.includes("showSelfMarkProgress"));
check("vietnamese-assessment-copy", workspace.includes('"120 PHÚT"') && library.includes("Theo thứ tự chương trình") && practicePage.includes('.replace(/\\broutine\\b/gi, "chương trình con")'));
check("practice-duration-single-and-long-session-copy", !library.includes("<Clock3") && library.includes("Nên dành một phiên học riêng"));

console.log(JSON.stringify({ schemaVersion: "paper2-assessment-ux-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
