import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valueOf = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};

const appRoot = path.resolve(valueOf("--app-root", path.resolve(HERE, "../../../../../../algocore-fumadocs")));
const baseUrl = valueOf("--base-url", "http://127.0.0.1:3018").replace(/\/$/, "");
const expectedCommit = valueOf("--expected-commit", "3849510defd1ca4a4b060daa6696348b8467d359");
const requireFromApp = createRequire(path.join(appRoot, "package.json"));
const { JSDOM } = requireFromApp("jsdom");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const git = (...gitArgs) => execFileSync("git", ["-C", appRoot, ...gitArgs], { encoding: "utf8" }).trim();
const failures = [];
const check = (condition, code, detail) => {
  if (!condition) failures.push({ code, detail });
};
const bi = (value) => typeof value?.vi === "string" && value.vi.trim() && typeof value?.en === "string" && value.en.trim();

const registryRoot = path.join(appRoot, "content/paper4/records/full");
const recordFiles = {
  knowledge_units: "knowledge-units.json",
  python_artifacts: "python-artifacts.json",
  visual_scenarios: "visual-scenario-traces.json",
  visual_events: "visual-event-bindings.json",
  marking_chains: "marking-chains.json",
  assessment_items: "assessment-items.json",
  lesson_release_records: "lesson-release-records.json",
};
const records = Object.fromEntries(await Promise.all(Object.entries(recordFiles).map(async ([name, filename]) => {
  const envelopes = await readJson(path.join(registryRoot, filename));
  return [name, envelopes.map((item) => item.record)];
})));
const course = await readJson(path.join(appRoot, "app/data/paper4-v2/course-manifest.json"));
const lessonFiles = (await readdir(path.join(appRoot, "app/data/paper4-v2/lessons"))).filter((name) => name.endsWith(".json")).sort();
const lessons = await Promise.all(lessonFiles.map((name) => readJson(path.join(appRoot, "app/data/paper4-v2/lessons", name))));

const counts = {
  packages: course.packages.length,
  lessons: lessons.length,
  locale_routes: lessons.length * 2,
  knowledge_units: records.knowledge_units.length,
  python_artifacts: records.python_artifacts.length,
  python_fixtures: records.python_artifacts.reduce((sum, item) => sum + item.fixtures.length, 0),
  patterns: course.counts.patterns,
  visual_scenarios: records.visual_scenarios.length,
  visual_events: records.visual_events.length,
  marking_chains: records.marking_chains.length,
  marking_atoms: records.marking_chains.reduce((sum, item) => sum + item.marking_atoms.length, 0),
  assessment_items: records.assessment_items.length,
  lesson_release_records: records.lesson_release_records.length,
  retrieval_loops: lessons.reduce((sum, lesson) => sum + lesson.retrieval.items.length, 0),
};
const expectedCounts = {
  packages: 13, lessons: 26, locale_routes: 52, knowledge_units: 108,
  python_artifacts: 26, python_fixtures: 78, patterns: 58, visual_scenarios: 174,
  visual_events: 589, marking_chains: 58, marking_atoms: 2236,
  assessment_items: 78, lesson_release_records: 26, retrieval_loops: 108,
};
check(JSON.stringify(counts) === JSON.stringify(expectedCounts), "EXACT_SETS", JSON.stringify(counts));
check(new Set(lessons.map((lesson) => lesson.identity.slug)).size === 26, "LESSON_SLUG_SET", "Expected 26 unique lesson slugs");

const canonicalSectionKinds = ["recognition", "exam-cues", "knowledge", "method", "worked-example", "action-view", "marking-pitfalls", "practice", "retrieval", "next-and-sources"];
let sourceBytesMatched = 0;
for (const artifact of records.python_artifacts) {
  const bytes = await readFile(path.join(appRoot, artifact.filename));
  const reconstructed = Buffer.from(artifact.lines.slice().sort((a, b) => a.order - b.order).map((line) => line.text).join("\n"), "utf8");
  check(sha256(bytes) === artifact.code_sha256, "PYTHON_SOURCE_HASH", artifact.python_artifact_id);
  check(bytes.equals(reconstructed), "PYTHON_SOURCE_RECONSTRUCTION", artifact.python_artifact_id);
  check(artifact.fixtures.length === 3, "PYTHON_FIXTURE_COUNT", artifact.python_artifact_id);
  sourceBytesMatched += bytes.equals(reconstructed) ? 1 : 0;
}

let practiceContracts = 0;
let retrievalContracts = 0;
let officialOwnerLessons = 0;
let associationOnlyLessons = 0;
for (const lesson of lessons) {
  check(JSON.stringify(lesson.sections.map((section) => section.kind)) === JSON.stringify(canonicalSectionKinds), "SECTION_ORDER", lesson.identity.slug);
  check(lesson.theory.knowledge_units.length === lesson.retrieval.items.length, "RETRIEVAL_KNOWLEDGE_JOIN", lesson.identity.slug);
  check(lesson.practice.items.length === 3, "PRACTICE_LEVEL_COUNT", lesson.identity.slug);
  const levels = new Set(lesson.practice.items.map((item) => item.level));
  check(["guided", "faded", "independent"].every((level) => levels.has(level)), "PRACTICE_LEVEL_SET", lesson.identity.slug);
  for (const item of lesson.practice.items) {
    check(item.disclosure_contract?.feedback_after_attempt === true, "PRACTICE_ATTEMPT_GATE", item.assessment_item_id);
    check(item.self_rubric?.authority === "AlgoCore_authored_rubric" && item.self_rubric?.official_marks === null, "PRACTICE_AUTHORITY", item.assessment_item_id);
    practiceContracts += 1;
  }
  for (const item of lesson.retrieval.items) {
    check(item.answer_hidden_initially === true && item.response_contract?.submit_before_answer === true, "RETRIEVAL_RESPONSE_GATE", item.knowledge_unit_id);
    check(["recall_then_trace", "recall_then_explain"].includes(item.response_contract?.mode), "RETRIEVAL_MODE", item.knowledge_unit_id);
    check(bi(item.response_contract?.prompt) && bi(item.diagnosis?.prompt) && bi(item.diagnosis?.misconception_to_check), "RETRIEVAL_DIAGNOSIS", item.knowledge_unit_id);
    check(bi(item.repair?.action) && bi(item.repair?.retry_rule), "RETRIEVAL_REPAIR_RETRY", item.knowledge_unit_id);
    check(item.self_rubric?.authority === "AlgoCore_authored_self_rubric" && item.self_rubric?.official_marks === null && item.self_rubric?.criteria?.length === 3, "RETRIEVAL_AUTHORITY", item.knowledge_unit_id);
    retrievalContracts += 1;
  }
  if (lesson.authority.association_scope === "official_pattern_owner") {
    officialOwnerLessons += 1;
    check(lesson.authority.official_pattern_ids.length > 0 && lesson.authority.cambridge_marking_chain_ids.length > 0, "OFFICIAL_OWNER_SCOPE", lesson.identity.slug);
  } else if (lesson.authority.association_scope === "AlgoCore_representational_workflow_only") {
    associationOnlyLessons += 1;
    check(lesson.authority.official_pattern_ids.length === 0 && lesson.authority.cambridge_marking_chain_ids.length === 0, "ASSOCIATION_ONLY_SCOPE", lesson.identity.slug);
  } else {
    check(false, "UNKNOWN_AUTHORITY_SCOPE", `${lesson.identity.slug}: ${lesson.authority.association_scope}`);
  }
}
check(practiceContracts === 78, "PRACTICE_CONTRACT_TOTAL", String(practiceContracts));
check(retrievalContracts === 108, "RETRIEVAL_CONTRACT_TOTAL", String(retrievalContracts));
check(officialOwnerLessons === 20 && associationOnlyLessons === 6, "AUTHORITY_SCOPE_TOTALS", `${officialOwnerLessons}/${associationOnlyLessons}`);

const interactionSource = await readFile(path.join(appRoot, "app/components/paper4-learning/LearningInteractions.tsx"), "utf8");
check(interactionSource.includes("{attempted && <details data-feedback-after-attempt>"), "PRACTICE_RENDER_GATE", "Feedback must be absent until attempted");
check(interactionSource.includes("{submitted && <div className={styles.retrievalReview} data-retrieval-review>"), "RETRIEVAL_RENDER_GATE", "Review must be absent until submitted");

const learnerRoots = [path.join(appRoot, "app/data/paper4-v2"), path.join(appRoot, "public/paper4-v2")];
const textFiles = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(absolute);
    else textFiles.push(absolute);
  }
}
for (const root of learnerRoots) await collect(root);
let localPathLeaks = 0;
for (const filename of textFiles) {
  const text = await readFile(filename, "utf8");
  if (/(?:[A-Za-z]:[\\/]|file:\/\/|\/Users\/|\/home\/)/.test(text)) localPathLeaks += 1;
}
check(localPathLeaks === 0, "LEARNER_LOCAL_PATH_LEAK", `${localPathLeaks} files`);

let liveRoutesPassed = 0;
let serverFullPythonRoutes = 0;
let initialPracticeFeedback = 0;
let initialRetrievalReviews = 0;
let unsafeHrefs = 0;
for (const lesson of lessons) {
  for (const locale of ["vi", "en"]) {
    const response = await fetch(`${baseUrl}/paper-4/lessons/${lesson.identity.slug}?lang=${locale}`, { redirect: "manual" });
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const artifactNodes = document.querySelectorAll("[data-python-artifact-id]");
    const lineNodes = document.querySelectorAll("[data-line-id]");
    const sections = document.querySelectorAll("[data-section-kind]");
    const practiceItems = document.querySelectorAll("[data-practice-item-id]");
    const retrievalItems = document.querySelectorAll("[data-retrieval-item-id]");
    const recordButtons = document.querySelectorAll('[data-action="record-practice-attempt"], [data-action="record-retrieval-response"]');
    const expectedArtifact = lesson.python;
    const completePython = artifactNodes.length === 1
      && artifactNodes[0].getAttribute("data-code-sha256") === expectedArtifact.code_sha256
      && lineNodes.length === expectedArtifact.lines.length
      && expectedArtifact.lines.every((line) => document.getElementById(line.line_id));
    const routeOk = response.status === 200
      && sections.length === 10
      && practiceItems.length === 3
      && retrievalItems.length === lesson.retrieval.items.length
      && [...recordButtons].every((button) => button.disabled)
      && completePython;
    check(routeOk, "LIVE_ROUTE_CONTRACT", `${lesson.identity.slug}/${locale}`);
    liveRoutesPassed += routeOk ? 1 : 0;
    serverFullPythonRoutes += completePython ? 1 : 0;
    initialPracticeFeedback += document.querySelectorAll("[data-feedback-after-attempt]").length;
    initialRetrievalReviews += document.querySelectorAll("[data-retrieval-review]").length;
    for (const anchor of document.querySelectorAll("a[href]")) {
      const href = anchor.getAttribute("href") ?? "";
      if (/^(?:file:|[A-Za-z]:[\\/]|\/Users\/|\/home\/)/.test(href)) unsafeHrefs += 1;
    }
  }
}
const invalid = await fetch(`${baseUrl}/paper-4/lessons/__a8_invalid_slug__?lang=vi`, { redirect: "manual" });
check(invalid.status === 404, "INVALID_SLUG", String(invalid.status));
check(liveRoutesPassed === 52 && serverFullPythonRoutes === 52, "LIVE_ROUTE_TOTALS", `${liveRoutesPassed}/${serverFullPythonRoutes}`);
check(initialPracticeFeedback === 0 && initialRetrievalReviews === 0, "INITIAL_DISCLOSURE_STATE", `${initialPracticeFeedback}/${initialRetrievalReviews}`);
check(unsafeHrefs === 0, "UNSAFE_RENDERED_HREF", String(unsafeHrefs));

const releaseBuilder = path.resolve(HERE, "../../../release-v2/build-release-manifest.mjs");
const releaseVerifier = path.resolve(HERE, "../../../release-v2/verify-release-manifest.mjs");
const releaseBuilderSource = await readFile(releaseBuilder, "utf8");
const releaseVerifierSource = await readFile(releaseVerifier, "utf8");
check(releaseBuilderSource.includes('const RELEASE_ID = "paper4-2026-s9-v2"'), "RELEASE_ID_CONTRACT", releaseBuilder);
check(releaseBuilderSource.includes('"ls-files", "-z"') && releaseBuilderSource.includes("app_bom"), "BOM_SCOPE_CONTRACT", "Builder must hash the complete tracked app file list");
check(releaseVerifierSource.includes("BOM_HASH") && releaseVerifierSource.includes("BOM_AGGREGATE") && releaseVerifierSource.includes("ATTESTATION_HASH"), "DETACHED_VERIFIER_CONTRACT", "Verifier must check every file, aggregate and attestation hash");

const head = git("rev-parse", "HEAD");
const gitStatus = git("status", "--porcelain");
check(head === expectedCommit, "CANDIDATE_COMMIT", head);
check(gitStatus === "", "CLEAN_TREE", gitStatus);

const result = {
  schema_version: "paper4-p4r7-a8-clean-room-check-v1",
  decision: failures.length === 0 ? "PASS" : "FAIL",
  authority: "INDEPENDENT_A8_RECOMMENDATION_NO_RELEASE_PROMOTION",
  candidate_commit: head,
  runtime: process.version,
  base_url: baseUrl,
  clean_tree: gitStatus === "",
  counts,
  checks: {
    source_bytes_matched: `${sourceBytesMatched}/26`,
    practice_attempt_contracts: `${practiceContracts}/78`,
    retrieval_diagnosis_repair_retry_self_rubric_contracts: `${retrievalContracts}/108`,
    authority_scopes: { official_pattern_owner: officialOwnerLessons, AlgoCore_representational_workflow_only: associationOnlyLessons },
    live_routes: `${liveRoutesPassed}/52`,
    server_full_python_routes: `${serverFullPythonRoutes}/52`,
    invalid_slug_status: invalid.status,
    initial_practice_feedback_nodes: initialPracticeFeedback,
    initial_retrieval_review_nodes: initialRetrievalReviews,
    local_path_leak_files: localPathLeaks,
    unsafe_rendered_hrefs: unsafeHrefs,
    release_bom_builder_contract: "PASS",
    detached_release_verifier_contract: "PASS",
  },
  canonical_registry_sha256: course.canonical_registry_sha256,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exitCode = 1;
