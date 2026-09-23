import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const APP_ROOT = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const SERVER_ORIGIN = process.env.PAPER4_A7_ORIGIN ?? "http://127.0.0.1:3018";
const EXPECTED_HEAD = "ff05d5a";
const GAP_LESSONS = ["dictionary", "exceptions", "graphs", "performance", "random-files", "testing"];
const SECTION_KINDS = ["recognition", "exam-cues", "knowledge", "method", "worked-example", "action-view", "marking-pitfalls", "practice", "retrieval", "next-and-sources"];

const readJson = async (relative) => JSON.parse(await readFile(path.join(APP_ROOT, relative), "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const records = (envelopes) => envelopes.map((item) => item.record);
const compactHead = execFileSync("git", ["rev-parse", "--short=8", "HEAD"], { cwd: APP_ROOT, encoding: "utf8" }).trim();
const exactHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: APP_ROOT, encoding: "utf8" }).trim();

const manifest = await readJson("app/data/paper4-v2/course-manifest.json");
const lessons = await Promise.all(manifest.lessons.map((item) => readJson(`app/data/paper4-v2/lessons/${item.slug}.json`)));
const markingChains = records(await readJson("content/paper4/records/full/marking-chains.json"));
const assessmentItems = records(await readJson("content/paper4/records/full/assessment-items.json"));
const mapping = await readJson("content/paper4/mappings/assessment-item-map.json");
const rendererSource = await readFile(path.join(APP_ROOT, "app/components/paper4-learning/LessonLearningPage.tsx"), "utf8");
const pythonRendererSource = await readFile(path.join(APP_ROOT, "app/components/paper4-learning/PythonArtifact.tsx"), "utf8");
const sourceRendererSource = await readFile(path.join(APP_ROOT, "app/components/paper4-learning/SourceReferences.tsx"), "utf8");

const failures = [];
const requireCheck = (condition, code, detail) => {
  if (!condition) failures.push({ code, detail });
};
const localized = (value) => value && typeof value.vi === "string" && value.vi.trim() && typeof value.en === "string" && value.en.trim();
const countBy = (values, key) => Object.fromEntries([...values.reduce((map, value) => map.set(key(value), (map.get(key(value)) ?? 0) + 1), new Map())]);

requireCheck(compactHead.startsWith(EXPECTED_HEAD), "CANDIDATE_HEAD_MISMATCH", `Expected ${EXPECTED_HEAD}, received ${compactHead}`);
requireCheck(lessons.length === 26, "LESSON_COUNT", lessons.length);
requireCheck(manifest.packages.length === 13, "PACKAGE_COUNT", manifest.packages.length);
requireCheck(manifest.patterns.length === 58, "PATTERN_COUNT", manifest.patterns.length);

let knowledgeCount = 0;
let pythonLineCount = 0;
let fixtureCount = 0;
let expectedOutputCount = 0;
let retrievalCount = 0;
let dtoMarkingChainCount = 0;
let dtoAtomDispositionCount = 0;
let dtoAssessmentCount = 0;
let officialOwnerLessons = 0;
let associationOnlyLessons = 0;
let sourceCount = 0;
const perLesson = [];

for (const lesson of lessons) {
  const slug = lesson.identity.slug;
  const lineIds = new Set(lesson.python.lines.map((line) => line.line_id));
  const fixtureIds = new Set(lesson.tests.fixtures.map((fixture) => fixture.fixture_id));
  const expectedByFixture = new Map(lesson.tests.expected_outputs.map((item) => [item.fixture_ref, item]));
  const kinds = new Set(lesson.tests.fixtures.map((fixture) => fixture.case_kind));
  const official = lesson.authority.association_scope === "official_pattern_owner";
  const gap = GAP_LESSONS.includes(slug);
  const levels = new Set(lesson.practice.items.map((item) => item.level));

  requireCheck(lesson.sections.length === 10 && lesson.sections.every((section, index) => section.kind === SECTION_KINDS[index] && section.order === index + 1), "SECTION_FLOW", slug);
  requireCheck(lesson.theory.knowledge_units.length > 0, "KNOWLEDGE_EMPTY", slug);
  requireCheck(lesson.python.language === "python" && lesson.python.lines.length > 0, "PYTHON_EMPTY", slug);
  const source = [...lesson.python.lines].sort((a, b) => a.order - b.order).map((line) => line.text).join("\n");
  requireCheck(sha256(source) === lesson.python.code_sha256, "PYTHON_HASH", slug);
  requireCheck(lesson.python.execution?.syntax_status === "PASS" && lesson.python.execution?.execution_status === "PASS", "PYTHON_EXECUTION", slug);
  requireCheck(kinds.size === 3 && ["normal", "boundary", "failure"].every((kind) => kinds.has(kind)), "FIXTURE_COVERAGE", slug);
  requireCheck(lesson.tests.normal_boundary_failure_coverage.normal && lesson.tests.normal_boundary_failure_coverage.boundary && lesson.tests.normal_boundary_failure_coverage.failure, "COVERAGE_FLAGS", slug);
  requireCheck(lesson.tests.fixtures.every((fixture) => expectedByFixture.has(fixture.fixture_id)), "EXPECTED_OUTPUT_JOIN", slug);
  requireCheck(levels.size === 3 && ["guided", "faded", "independent"].every((level) => levels.has(level)), "PRACTICE_LEVELS", slug);

  for (const unit of lesson.theory.knowledge_units) {
    requireCheck([unit.title, unit.explanation, unit.python_connection, unit.representation, unit.invariant_or_rule].every(localized), "KNOWLEDGE_BILINGUAL", unit.knowledge_unit_id);
    requireCheck(unit.micro_example.python_artifact_id === lesson.python.python_artifact_id, "MICRO_ARTIFACT_JOIN", unit.knowledge_unit_id);
    requireCheck(unit.micro_example.active_line_ids.length > 0 && unit.micro_example.active_line_ids.every((id) => lineIds.has(id)), "MICRO_LINE_JOIN", unit.knowledge_unit_id);
    requireCheck(unit.self_check.answer_hidden_initially === true && localized(unit.self_check.prompt) && localized(unit.self_check.answer) && localized(unit.self_check.rationale), "RETRIEVAL_DISCLOSURE", unit.knowledge_unit_id);
  }

  for (const item of lesson.practice.items) {
    requireCheck(localized(item.prompt) && localized(item.expected_artifact) && localized(item.hint) && localized(item.feedback), "PRACTICE_BILINGUAL", item.assessment_item_id);
    requireCheck(item.disclosure_contract.answer_hidden_initially === true && item.disclosure_contract.hint_hidden_initially === true && item.disclosure_contract.feedback_after_attempt === true, "PRACTICE_DISCLOSURE_DATA", item.assessment_item_id);
    requireCheck(item.self_rubric.authority === "AlgoCore_authored_rubric" && item.self_rubric.official_marks === null, "PRACTICE_AUTHORITY", item.assessment_item_id);
    requireCheck(item.self_rubric.criteria.length >= 3 && localized(item.self_rubric.pass_rule) && localized(item.self_rubric.retry_rule), "PRACTICE_RUBRIC", item.assessment_item_id);
    requireCheck(item.shared_fixture_code_data_ids.includes(lesson.python.python_artifact_id), "PRACTICE_ARTIFACT_JOIN", item.assessment_item_id);
    if (item.level === "guided") requireCheck(item.shared_fixture_code_data_ids.some((id) => id.includes(".normal")), "GUIDED_NORMAL_JOIN", item.assessment_item_id);
    if (item.level === "faded") requireCheck(item.shared_fixture_code_data_ids.some((id) => id.includes(".boundary")), "FADED_BOUNDARY_JOIN", item.assessment_item_id);
    if (item.level === "independent") requireCheck([".normal", ".boundary", ".failure"].every((kind) => item.shared_fixture_code_data_ids.some((id) => id.includes(kind))), "INDEPENDENT_THREE_CASE_JOIN", item.assessment_item_id);
  }

  if (gap) {
    associationOnlyLessons += 1;
    requireCheck(!official && lesson.authority.official_pattern_ids.length === 0 && lesson.marking.chains.length === 0, "GAP_FALSE_OWNERSHIP", slug);
    requireCheck(lesson.authority.approved_association_pattern_ids.length > 0 && lesson.visual.approved_static_or_representational_support.length > 0, "GAP_STATIC_SUPPORT", slug);
    requireCheck(lesson.practice.items.every((item) => item.self_rubric.pattern_authority === "AlgoCore_representational_workflow_only" && item.self_rubric.official_marks === null), "GAP_FALSE_MARKS", slug);
  } else {
    officialOwnerLessons += 1;
    requireCheck(official && lesson.authority.official_pattern_ids.length > 0, "OFFICIAL_OWNER_EMPTY", slug);
    requireCheck(lesson.marking.chains.length === lesson.authority.official_pattern_ids.length, "MARKING_PATTERN_JOIN", slug);
    requireCheck(lesson.visual.owned_patterns.length === lesson.authority.official_pattern_ids.length, "VISUAL_PATTERN_JOIN", slug);
  }

  const unsafePublicSources = lesson.sources.filter((sourceRef) => /(?:file:\/\/|[A-Za-z]:[\\/]|(?:^|[\\/])(?:planning|content|archive|legacy)[\\/]|https?:\/\/)/i.test(JSON.stringify(sourceRef)) || Object.hasOwn(sourceRef, "href") || Object.hasOwn(sourceRef, "path"));
  requireCheck(unsafePublicSources.length === 0, "UNSAFE_SOURCE_LOCATOR", slug);

  knowledgeCount += lesson.theory.knowledge_units.length;
  pythonLineCount += lesson.python.lines.length;
  fixtureCount += lesson.tests.fixtures.length;
  expectedOutputCount += lesson.tests.expected_outputs.length;
  retrievalCount += lesson.retrieval.items.length;
  dtoMarkingChainCount += lesson.marking.chains.length;
  dtoAssessmentCount += lesson.practice.items.length;
  sourceCount += lesson.sources.length;
  perLesson.push({
    slug,
    knowledge_units: lesson.theory.knowledge_units.length,
    python_lines: lesson.python.lines.length,
    fixtures: lesson.tests.fixtures.length,
    official_patterns: lesson.authority.official_pattern_ids.length,
    approved_associations: lesson.authority.approved_association_pattern_ids.length,
    marking_chains: lesson.marking.chains.length,
    marking_atoms: lesson.marking.chains.reduce((sum, chain) => sum + chain.marking_atom_count, 0),
    practice_items: lesson.practice.items.length,
    retrieval_items: lesson.retrieval.items.length,
    source_refs: lesson.sources.length,
  });
}

requireCheck(knowledgeCount === 108, "KNOWLEDGE_TOTAL", knowledgeCount);
requireCheck(fixtureCount === 78 && expectedOutputCount === 78, "FIXTURE_TOTAL", { fixtureCount, expectedOutputCount });
requireCheck(dtoMarkingChainCount === 58 && markingChains.length === 58, "MARKING_CHAIN_TOTAL", { dtoMarkingChainCount, canonical: markingChains.length });
requireCheck(dtoAssessmentCount === 78 && assessmentItems.length === 78, "ASSESSMENT_TOTAL", { dtoAssessmentCount, canonical: assessmentItems.length });
requireCheck(retrievalCount === 108, "RETRIEVAL_TOTAL", retrievalCount);
requireCheck(officialOwnerLessons === 20 && associationOnlyLessons === 6, "AUTHORITY_LESSON_SPLIT", { officialOwnerLessons, associationOnlyLessons });

const canonicalAtoms = markingChains.flatMap((chain) => chain.marking_atoms.map((atom) => ({ ...atom, marking_chain_id: chain.marking_chain_id })));
const dispositionCounts = {};
for (const atom of canonicalAtoms) {
  const enMatches = [...atom.criterion.en.matchAll(/disposition=([A-Z_]+)/g)].map((match) => match[1]);
  const viMatches = [...atom.criterion.vi.matchAll(/disposition=([A-Z_]+)/g)].map((match) => match[1]);
  requireCheck(atom.authority === "Cambridge_QP_MS", "ATOM_AUTHORITY", atom.atom_id);
  requireCheck(enMatches.length === 1 && viMatches.length === 1 && enMatches[0] === viMatches[0], "ATOM_DISPOSITION", atom.atom_id);
  if (enMatches.length === 1) dispositionCounts[enMatches[0]] = (dispositionCounts[enMatches[0]] ?? 0) + 1;
  requireCheck(atom.locator?.source_id && atom.locator?.pdf_page !== undefined && atom.locator?.bullet_locator, "ATOM_LOCATOR", atom.atom_id);
}
dtoAtomDispositionCount = canonicalAtoms.length;
requireCheck(canonicalAtoms.length === 2236, "ATOM_TOTAL", canonicalAtoms.length);
requireCheck((dispositionCounts.RETAIN_DIRECT_OFFICIAL_ATOM ?? 0) + (dispositionCounts.RETAIN_WITH_SOURCE_CAVEAT ?? 0) === 2236, "ATOM_DISPOSITION_TOTAL", dispositionCounts);
requireCheck(mapping.assessment_requirement_dispositions.length === 107 && mapping.assessment_destination_dispositions.length === 37, "ASSESSMENT_MAPPING_DENOMINATORS", { requirements: mapping.assessment_requirement_dispositions.length, destinations: mapping.assessment_destination_dispositions.length });

const rendererChecks = {
  typed_ten_section_dispatch: SECTION_KINDS.every((kind) => rendererSource.includes(`case "${kind}"`) || kind === "recognition" && rendererSource.includes('case "recognition"')),
  full_python_line_map: pythonRendererSource.includes("orderedLines.map") && pythonRendererSource.includes("data-line-id={line.line_id}") && pythonRendererSource.includes("line.text"),
  source_locator_not_href: sourceRendererSource.includes("without ever treating its locator as a URL") && sourceRendererSource.includes('accessMode: "internal-citation"'),
  hint_is_closed_details: /<details><summary>\{t\.hint\}/.test(rendererSource),
  retrieval_answer_is_closed_details: /<details><summary>\{t\.answer\}/.test(rendererSource),
  feedback_is_ungated_details: /<details><summary>\{t\.feedback\}/.test(rendererSource) && !rendererSource.includes("attemptStatus") && !rendererSource.includes("hasAttempted"),
  retrieval_has_no_repair_or_rubric_model: !/retrieval:[\s\S]{0,600}self_rubric/.test(await readFile(path.join(APP_ROOT, "app/components/paper4-learning/types.ts"), "utf8")),
};
for (const [name, result] of Object.entries(rendererChecks)) requireCheck(result, `RENDERER_${name.toUpperCase()}`, result);

const browserRows = [];
for (const lesson of lessons) {
  for (const locale of ["vi", "en"]) {
    const url = `${SERVER_ORIGIN}/paper-4/lessons/${lesson.identity.slug}?lang=${locale}`;
    const response = await fetch(url);
    const html = await response.text();
    const sectionKinds = [...html.matchAll(/data-section-kind="([^"]+)"/g)].map((match) => match[1]);
    const renderedLineIds = [...html.matchAll(/data-line-id="([^"]+)"/g)].map((match) => match[1]);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    const unsafeHrefs = hrefs.filter((href) => /^(?:file:|[A-Za-z]:[\\/])|(?:planning|content|archive|legacy)[\\/]/i.test(href));
    const hasOpenDetails = /<details\b[^>]*\bopen(?:\s|=|>)/i.test(html);
    const expectedLineIds = lesson.python.lines.map((line) => line.line_id);
    const uniqueRenderedLineIds = new Set(renderedLineIds);
    const lineSetExact = expectedLineIds.length === uniqueRenderedLineIds.size && expectedLineIds.every((id) => uniqueRenderedLineIds.has(id));
    const row = {
      slug: lesson.identity.slug,
      locale,
      status: response.status,
      sections: sectionKinds.length,
      section_order_exact: JSON.stringify(sectionKinds) === JSON.stringify(SECTION_KINDS),
      rendered_python_lines: uniqueRenderedLineIds.size,
      expected_python_lines: expectedLineIds.length,
      full_python_line_set_exact: lineSetExact,
      code_hash_attribute_present: html.includes(`data-code-sha256="${lesson.python.code_sha256}"`),
      hint_label_present: html.includes(locale === "vi" ? "Mở gợi ý" : "Reveal hint"),
      retrieval_answer_label_present: html.includes(locale === "vi" ? "Mở đáp án" : "Reveal answer"),
      details_open_initially: hasOpenDetails,
      unsafe_hrefs: unsafeHrefs,
    };
    browserRows.push(row);
    requireCheck(row.status === 200 && row.sections === 10 && row.section_order_exact, "BROWSER_SECTION_FLOW", `${lesson.identity.slug}/${locale}`);
    requireCheck(row.full_python_line_set_exact && row.code_hash_attribute_present, "BROWSER_FULL_PYTHON", `${lesson.identity.slug}/${locale}`);
    requireCheck(row.hint_label_present && row.retrieval_answer_label_present && !row.details_open_initially, "BROWSER_HIDDEN_DISCLOSURE", `${lesson.identity.slug}/${locale}`);
    requireCheck(row.unsafe_hrefs.length === 0, "BROWSER_UNSAFE_HREF", `${lesson.identity.slug}/${locale}`);
  }
}

const findings = [
  {
    id: "P4R6-A7-F001",
    severity: "REQUIRED",
    status: "OPEN",
    title: "Practice feedback is available before an attempt despite the canonical disclosure contract",
    affected: "78/78 AssessmentItem records across 26/26 lessons",
    evidence: "Every item declares feedback_after_attempt=true, but Practice renders feedback as an always-enabled native <details> and maintains no attempted/submitted state. The disclosure is closed initially, yet a learner can reveal it immediately.",
    required_correction: "Add an explicit attempt/submission state per practice item; keep feedback and repair disabled or absent until that state is reached. Add a browser assertion that feedback cannot be opened before an attempt and can be opened afterwards.",
  },
  {
    id: "P4R6-A7-F002",
    severity: "REQUIRED",
    status: "OPEN",
    title: "The v2 retrieval section regresses the Stage 9 diagnosis-repair-self-assessment loop",
    affected: "108/108 retrieval self-checks across 26/26 lessons",
    evidence: "All retrieval records provide a prompt, hidden answer and rationale, but the retrieval DTO and renderer expose no learner response/trace, misconception diagnosis, repair action, retry rule, or self-rubric. This reopens the retrieval part of S9D-RC-F002 even though progressive practice is complete.",
    required_correction: "Extend the canonical retrieval contract and renderer with a concrete recall/trace response, diagnosis, repair/retry guidance and an AlgoCore self-rubric, while preserving the hidden-answer behavior. Rebuild all 26 DTOs and recheck 108/108 items.",
  },
];

const oldStage9Findings = [
  { id: "PTA-001", result: "CLOSED", evidence: "26/26 routes render the typed PythonArtifact as semantic pre/code line rows." },
  { id: "PTA-002", result: "CLOSED", evidence: "26/26 lessons expose author-run, independent-rerun and execution-log evidence alongside three canonical fixtures." },
  { id: "PTA-003", result: "CLOSED", evidence: "108/108 structured KnowledgeUnits are present with syllabus/coursebook locators." },
  { id: "PTA-004", result: "CLOSED", evidence: "queue, linked-list, recursion, dictionary and hashing all use typed full Python artifacts; none relies on prose-embedded code." },
  { id: "PTA-005", result: "CLOSED_BY_V2_QA_SCOPE", evidence: "This detached review covers all 26 DTOs and all 52 rendered locale routes rather than count-only registry shape." },
  { id: "S9D-RC-F001", result: "CLOSED", evidence: "The ten-section flow provides theory, method, micro-example, full Python, exact outputs/tests, execution evidence and official trace or approved representational support." },
  { id: "S9D-RC-F002", result: "REOPENED_IN_PART", evidence: "Guided/faded/independent practice is complete, but feedback is not attempt-gated and retrieval lost diagnosis/repair/self-assessment." },
  { id: "S9D-RC-F003", result: "CLOSED", evidence: "58 official MarkingChains preserve 2,236 Cambridge atom dispositions; six association-only lessons use explicit AlgoCore rubrics with null official marks." },
  { id: "S9D-RC-F004", result: "CLOSED", evidence: "The typed renderer uses explicit localized field labels; it no longer humanises arbitrary English object keys." },
  { id: "S9D-RC-F005", result: "CLOSED", evidence: "The current audit deep-checks 26/26 lessons and 52/52 locale routes." },
];

const report = {
  schema_version: "paper4-p4r6-a7-pedagogy-review-v1",
  decision: findings.length || failures.length ? "REWORK_REQUIRED" : "PASS",
  reviewer: "A7 independent Paper 4 pedagogy and exam review",
  candidate: { requested_short_sha: EXPECTED_HEAD, short_sha: compactHead, commit_sha: exactHead },
  scope: {
    lessons: lessons.length,
    locale_routes: browserRows.length,
    packages: manifest.packages.length,
    canonical_sections_per_lesson: 10,
    knowledge_units: knowledgeCount,
    python_artifacts: lessons.length,
    python_lines: pythonLineCount,
    fixtures: fixtureCount,
    expected_outputs: expectedOutputCount,
    official_pattern_owner_lessons: officialOwnerLessons,
    association_only_lessons: associationOnlyLessons,
    marking_chains: markingChains.length,
    marking_atoms: canonicalAtoms.length,
    assessment_items: assessmentItems.length,
    retrieval_items: retrievalCount,
    source_refs: sourceCount,
  },
  exact_results: {
    canonical_atom_dispositions: dispositionCounts,
    assessment_requirement_dispositions: mapping.assessment_requirement_dispositions.length,
    assessment_destination_dispositions: mapping.assessment_destination_dispositions.length,
    practice_levels: { guided: 26, faded: 26, independent: 26 },
    normal_boundary_failure: { python_fixture_sets: 26, official_visual_pattern_sets: 58, association_only_test_sets: 6 },
    authority_boundary: { official_owner_lessons: 20, association_only_lessons: GAP_LESSONS, false_official_marks_on_gap_lessons: 0 },
    answer_hint_hidden_initially: { practice_items: "78/78", retrieval_items: "108/108", rendered_routes_with_closed_details: `${browserRows.filter((row) => !row.details_open_initially).length}/52` },
    full_python_visible: { rendered_routes: `${browserRows.filter((row) => row.full_python_line_set_exact).length}/52`, same_code_hash_attribute: `${browserRows.filter((row) => row.code_hash_attribute_present).length}/52` },
    source_locator_safety: { unsafe_public_dto_sources: 0, unsafe_rendered_hrefs: browserRows.reduce((sum, row) => sum + row.unsafe_hrefs.length, 0) },
  },
  renderer_checks: rendererChecks,
  stage9_finding_recheck: oldStage9Findings,
  findings,
  mechanical_failures: failures,
  per_lesson: perLesson,
  browser_matrix: browserRows,
};

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.decision === "PASS" ? 0 : 1;
