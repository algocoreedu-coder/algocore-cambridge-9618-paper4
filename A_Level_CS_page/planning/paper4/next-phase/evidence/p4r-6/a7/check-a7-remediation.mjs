import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const APP_ROOT = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const EVIDENCE_ROOT = path.resolve(APP_ROOT, "../planning/paper4/next-phase/evidence/p4r-6/a7");
const EXPECTED_COMMIT = "3849510defd1ca4a4b060daa6696348b8467d359";
const readJson = async (relative) => JSON.parse(await readFile(path.resolve(APP_ROOT, relative), "utf8"));
const localized = (value) => value && typeof value.vi === "string" && value.vi.trim() && typeof value.en === "string" && value.en.trim() && value.vi !== value.en;
const failures = [];
const check = (condition, code, detail) => { if (!condition) failures.push({ code, detail }); };

const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: APP_ROOT, encoding: "utf8" }).trim();
const manifest = await readJson("app/data/paper4-v2/course-manifest.json");
const lessons = await Promise.all(manifest.lessons.map((lesson) => readJson(`app/data/paper4-v2/lessons/${lesson.slug}.json`)));
const interactionSource = await readFile(path.resolve(APP_ROOT, "app/components/paper4-learning/LearningInteractions.tsx"), "utf8");
const browserEvidence = JSON.parse(await readFile(path.resolve(EVIDENCE_ROOT, "A7_BROWSER_RECHECK.json"), "utf8"));

check(head === EXPECTED_COMMIT, "CANDIDATE_COMMIT", { expected: EXPECTED_COMMIT, actual: head });
check(lessons.length === 26, "LESSON_COUNT", lessons.length);

const practiceItems = lessons.flatMap((lesson) => lesson.practice.items.map((item) => ({ lesson: lesson.identity.slug, item })));
const retrievalItems = lessons.flatMap((lesson) => lesson.retrieval.items.map((item) => ({ lesson: lesson.identity.slug, item })));

check(practiceItems.length === 78, "PRACTICE_COUNT", practiceItems.length);
for (const { lesson, item } of practiceItems) {
  check(item.disclosure_contract?.feedback_after_attempt === true, "FEEDBACK_CONTRACT", `${lesson}/${item.assessment_item_id}`);
  check(localized(item.feedback), "FEEDBACK_BILINGUAL", `${lesson}/${item.assessment_item_id}`);
}

check(interactionSource.includes("const [attempted, setAttempted] = useState(false)"), "ATTEMPT_STATE_MISSING", "PracticeItemCard");
check(interactionSource.includes("disabled={draft.trim().length === 0}"), "EMPTY_ATTEMPT_NOT_BLOCKED", "PracticeItemCard");
check(interactionSource.includes("setAttempted(false)"), "EDIT_DOES_NOT_RESET_ATTEMPT", "PracticeItemCard");
check(interactionSource.includes("{attempted && <details data-feedback-after-attempt>"), "FEEDBACK_NOT_CONDITIONALLY_MOUNTED", "PracticeItemCard");

check(retrievalItems.length === 108, "RETRIEVAL_COUNT", retrievalItems.length);
const modes = {};
for (const { lesson, item } of retrievalItems) {
  const id = `${lesson}/${item.knowledge_unit_id}`;
  modes[item.response_contract?.mode] = (modes[item.response_contract?.mode] ?? 0) + 1;
  check(item.answer_hidden_initially === true, "RETRIEVAL_ANSWER_DISCLOSURE", id);
  check(item.response_contract?.submit_before_answer === true, "RETRIEVAL_SUBMIT_BEFORE_ANSWER", id);
  check(["recall_then_trace", "recall_then_explain"].includes(item.response_contract?.mode), "RETRIEVAL_RESPONSE_MODE", id);
  check(localized(item.response_contract?.prompt), "RETRIEVAL_RESPONSE_PROMPT", id);
  check(Array.isArray(item.response_contract?.evidence_refs) && item.response_contract.evidence_refs.length > 0, "RETRIEVAL_EVIDENCE_REFS", id);
  check(localized(item.diagnosis?.prompt) && localized(item.diagnosis?.misconception_to_check), "RETRIEVAL_DIAGNOSIS", id);
  check(localized(item.repair?.action) && localized(item.repair?.retry_rule), "RETRIEVAL_REPAIR_RETRY", id);
  check(item.self_rubric?.authority === "AlgoCore_authored_self_rubric" && item.self_rubric?.official_marks === null, "RETRIEVAL_RUBRIC_AUTHORITY", id);
  check(item.self_rubric?.criteria?.length === 3 && item.self_rubric.criteria.every((criterion) => criterion.criterion_id && localized(criterion.description)), "RETRIEVAL_RUBRIC_CRITERIA", id);
}

check(interactionSource.includes("const [submitted, setSubmitted] = useState<string | null>(null)"), "RETRIEVAL_SUBMIT_STATE_MISSING", "RetrievalItemCard");
check(interactionSource.includes("{submitted && <div className={styles.retrievalReview} data-retrieval-review>"), "RETRIEVAL_REVIEW_NOT_GATED", "RetrievalItemCard");
check(interactionSource.includes('data-action="retry-retrieval"'), "RETRIEVAL_RETRY_ACTION_MISSING", "RetrievalItemCard");

check(browserEvidence.candidate_commit === EXPECTED_COMMIT, "BROWSER_CANDIDATE_COMMIT", browserEvidence.candidate_commit);
check(browserEvidence.decision === "PASS" && browserEvidence.failures.length === 0, "BROWSER_DECISION", browserEvidence.decision);
check(browserEvidence.scope.practice_interactions === 78 && browserEvidence.scope.retrieval_interactions === 108, "BROWSER_SCOPE", browserEvidence.scope);
check(browserEvidence.matrix.length === 26 && browserEvidence.matrix.every((row) => row.initial_feedback === 0 && row.buttons_disabled_initially && row.buttons_enabled_after_draft && row.feedback_after_attempt === 3), "BROWSER_FEEDBACK_GATE", "26-route matrix");
check(browserEvidence.matrix.every((row) => row.initial_review === 0 && row.reviews_after_response === row.retrieval && row.answer_details === row.retrieval && row.diagnosis === row.retrieval && row.repair === row.retrieval && row.rubric === row.retrieval && row.authority), "BROWSER_RETRIEVAL_LOOP", "26-route matrix");
check(browserEvidence.representative_vi_en.length === 2 && browserEvidence.representative_vi_en.every((sample) => sample.practice.edit_resets_gate && sample.retrieval.answer_open && sample.retrieval.retry_removes_review && sample.retrieval.retry_clears_input && sample.retrieval.retry_returns_focus), "BROWSER_REPRESENTATIVE_VI_EN", browserEvidence.representative_vi_en);

const report = {
  schema_version: "paper4-p4r6-a7-remediation-recheck-v1",
  candidate_commit: head,
  decision: failures.length === 0 ? "PASS" : "REWORK_REQUIRED",
  supersedes_decision_in: "A7_PEDAGOGY_REVIEW.json",
  finding_closure: {
    "P4R6-A7-F001": failures.some((failure) => failure.code.includes("ATTEMPT") || failure.code.includes("FEEDBACK")) ? "OPEN" : "CLOSED_VERIFIED",
    "P4R6-A7-F002": failures.some((failure) => failure.code.includes("RETRIEVAL")) ? "OPEN" : "CLOSED_VERIFIED",
  },
  counts: {
    lessons: lessons.length,
    practice_items: practiceItems.length,
    browser_practice_interactions: browserEvidence.scope.practice_interactions,
    retrieval_items: retrievalItems.length,
    browser_retrieval_interactions: browserEvidence.scope.retrieval_interactions,
    response_modes: modes,
    vi_browser_routes: browserEvidence.scope.vi_routes,
    en_browser_routes: browserEvidence.scope.en_routes,
  },
  checks: {
    practice_feedback_absent_before_attempt: browserEvidence.acceptance.feedback_absent_before_attempt,
    practice_feedback_after_attempt: browserEvidence.acceptance.feedback_mounted_only_after_attempt,
    retrieval_review_absent_before_response: browserEvidence.acceptance.retrieval_review_absent_before_response,
    retrieval_review_after_response: browserEvidence.acceptance.retrieval_review_mounted_after_response,
    retrieval_bilingual_diagnosis: browserEvidence.acceptance.bilingual_diagnosis_rendered,
    retrieval_bilingual_repair_retry: browserEvidence.acceptance.bilingual_repair_retry_rendered,
    retrieval_algocore_self_rubric: browserEvidence.acceptance.algocore_self_rubric_rendered,
    representative_vi_en_retry_focus: "2/2",
    bad_http_responses: browserEvidence.acceptance.bad_http_responses,
  },
  required_open_findings: failures.length,
  failures,
};

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length === 0 ? 0 : 1;
