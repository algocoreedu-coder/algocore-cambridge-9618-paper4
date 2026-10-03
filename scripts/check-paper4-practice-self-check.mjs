import { readFile } from "node:fs/promises";

const interactionPath = new URL("../app/components/paper4-learning/LearnerInteractions.tsx", import.meta.url);
const stylePath = new URL("../app/components/paper4-learning/LessonLearningPage.module.css", import.meta.url);
const [source, styles] = await Promise.all([
  readFile(interactionPath, "utf8"),
  readFile(stylePath, "utf8"),
]);

const results = [];
function check(id, condition, description) {
  results.push({ id, status: condition ? "PASS" : "FAIL", description });
}

check("P4-SC01", source.includes("PRACTICE_GATE_VERSION = 2") && source.includes("isMeaningfulPracticeDraft") && source.includes('data-attempt-result="self-check-only"'), "Versioned meaningful-draft gate is labelled as self-check only");
check("P4-SC02", source.includes("practiceFillerPattern") && source.includes("draftNeedsWork"), "Whitespace and common filler receive learner-facing validation");
check("P4-SC03", source.includes("learnerText(item.success_check, locale)") && source.includes("criterionConfirmation"), "Task-specific success_check is the explicit self-check criterion");
check("P4-SC04", /type="checkbox"[\s\S]*disabled=\{!isCriterionConfirmed\}/.test(source), "Criterion confirmation gates the reveal action");
check("P4-SC05", /hasAttempt && <div className=\{styles\.afterAttempt\} data-answer-revealed="true"/.test(source), "Hint and model remain behind the recorded self-check");
check("P4-SC06", source.includes("it does not mark the answer correct") && source.includes("không phải kết luận câu trả lời đúng"), "EN and VI copy explicitly avoids claiming correctness");
check("P4-SC07", source.includes("readOnly={hasAttempt}") && source.includes("revise") && source.includes("responseRef.current?.focus()"), "Recorded draft is preserved and can be deliberately revised with focus restored");
check("P4-SC08", source.includes('aria-live="polite"') && source.includes("aria-describedby={criterionId}") && source.includes("aria-invalid={hasInvalidDraft || undefined}"), "Validation and criterion controls expose accessible status relationships");
check("P4-SC09", styles.includes(".selfCheckPanel") && styles.includes(".criterionConfirmation") && styles.includes("min-height: 44px"), "Self-check layout and touch target styles are present");
check("P4-SC10", styles.includes(".selfCheckPanel .learningButton") && styles.includes("width: 100%"), "Self-check actions reflow for the existing mobile breakpoint");

const failed = results.filter((result) => result.status === "FAIL");
console.log(JSON.stringify({
  schema_version: "paper4-practice-self-check-gate-v1",
  decision: failed.length === 0 ? "PASS" : "FAIL",
  counts: { checks: results.length, passed: results.length - failed.length, failed: failed.length },
  results,
}, null, 2));

if (failed.length > 0) process.exitCode = 1;
