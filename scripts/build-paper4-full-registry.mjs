import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_ROOT = path.join(ROOT, "content", "paper4");
const RECORD_ROOT = path.join(CONTENT_ROOT, "records", "full");
const PROMPT_EVIDENCE_PATH = path.join(CONTENT_ROOT, "teacher", "prompt-level-assessment-evidence.json");
export const RELEASE_DECISION_PATH = path.join(CONTENT_ROOT, "release", "lesson-release-decisions.json");
const EVIDENCE_ROOT = path.resolve(ROOT, "..", "planning", "paper4", "next-phase", "evidence", "p4r-5", "a4");

export const RECORD_TYPES = [
  "KnowledgeUnit",
  "PythonArtifact",
  "VisualScenarioTrace",
  "VisualEventBinding",
  "MarkingChain",
  "AssessmentItem",
  "LessonReleaseRecord",
];
export const EXPECTED_COUNTS = {
  KnowledgeUnit: 108,
  PythonArtifact: 26,
  VisualScenarioTrace: 174,
  VisualEventBinding: 945,
  MarkingChain: 58,
  AssessmentItem: 79,
  LessonReleaseRecord: 26,
};
export const SECTION_IDS = [
  "paper4.section.recognition",
  "paper4.section.exam-cues",
  "paper4.section.knowledge",
  "paper4.section.method",
  "paper4.section.worked-example",
  "paper4.section.action-view",
  "paper4.section.marking-pitfalls",
  "paper4.section.practice",
  "paper4.section.retrieval",
  "paper4.section.next-and-sources",
];

export const TYPE_FILES = {
  KnowledgeUnit: "knowledge-units.json",
  PythonArtifact: "python-artifacts.json",
  VisualScenarioTrace: "visual-scenario-traces.json",
  VisualEventBinding: "visual-event-bindings.json",
  MarkingChain: "marking-chains.json",
  AssessmentItem: "assessment-items.json",
  LessonReleaseRecord: "lesson-release-records.json",
};
const TYPE_IDS = {
  KnowledgeUnit: "knowledge_unit_id",
  PythonArtifact: "python_artifact_id",
  VisualScenarioTrace: "trace_id",
  VisualEventBinding: "event_id",
  MarkingChain: "marking_chain_id",
  AssessmentItem: "assessment_item_id",
  LessonReleaseRecord: "lesson_id",
};

const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const envelope = (artifact_type, record) => ({ schema_version: "2.0.0", artifact_type, record });

const OOP_VIDEO_CHAPTERS = {
  "oop-model": { start: 256, end: 1606, heading: "Creating classes and objects; class, object, attribute, method and self" },
  "oop-state": { start: 2082, end: 7510, heading: "Object data, access conventions, getters, setters and encapsulation" },
  "oop-inheritance": { start: 7510, end: 9335, heading: "Inheritance, overriding and polymorphism" },
  "oop-aggregation": { start: 915, end: 1303, heading: "Combining objects and has-a relationships" },
};
const DSA_VIDEO_CHAPTERS_BY_LESSON = {
  "performance": [
    { source_id: "video_greg_hogg_dsa_lecture_01", video_id: "aWKEBEg55ps", start: 0, end: 957, heading: "Time-complexity cost model, Big O growth and space complexity" },
    { source_id: "video_greg_hogg_dsa_lecture_07", video_id: "9nmrkG6QtpQ", start: 0, end: 808, heading: "Traditional binary search and search cost" },
    { source_id: "video_greg_hogg_dsa_lecture_10", video_id: "gcRUIO-8r3U", start: 0, end: 513, heading: "Bubble and insertion sort cost context" },
  ],
  "data-models": [{ source_id: "video_greg_hogg_dsa_lecture_02", video_id: "TQMvBTKn2p0", start: 10, end: 675, heading: "Static and dynamic array models" }],
  "text-processing": [{ source_id: "video_greg_hogg_dsa_lecture_02", video_id: "TQMvBTKn2p0", start: 675, end: 810, heading: "String indexing and immutability context" }],
  "linked-list": [{ source_id: "video_greg_hogg_dsa_lecture_03", video_id: "dqLHTK7RuIo", start: 0, end: 526, heading: "Linked-node model, traversal and reference rewiring" }],
  "dictionary": [{ source_id: "video_greg_hogg_dsa_lecture_04", video_id: "iZyxNEBpqFY", start: 216, end: 592, heading: "Set and map interface distinction" }],
  "hashing": [{ source_id: "video_greg_hogg_dsa_lecture_04", video_id: "iZyxNEBpqFY", start: 0, end: 843, heading: "Hash functions, collisions, probing and failed lookup" }],
  "stack": [{ source_id: "video_greg_hogg_dsa_lecture_05", video_id: "vOx3vY1w4tM", start: 0, end: 325, heading: "Stack LIFO operations and cost context" }],
  "queue": [{ source_id: "video_greg_hogg_dsa_lecture_05", video_id: "vOx3vY1w4tM", start: 325, end: 569, heading: "Queue FIFO operations and representation context" }],
  "recursion": [{ source_id: "video_greg_hogg_dsa_lecture_06", video_id: "TGT79h7e7tE", start: 0, end: 832, heading: "Recursion contract, call stack, unwind and cost" }],
  "binary-search": [{ source_id: "video_greg_hogg_dsa_lecture_07", video_id: "9nmrkG6QtpQ", start: 0, end: 808, heading: "Traditional binary search and search cost" }],
  "binary-tree": [{ source_id: "video_greg_hogg_dsa_lecture_08", video_id: "EPwWrs8OtfI", start: 0, end: 1772, heading: "Binary-tree model, representation, traversal and ordered paths" }],
  "sorting": [{ source_id: "video_greg_hogg_dsa_lecture_10", video_id: "gcRUIO-8r3U", start: 0, end: 513, heading: "Bubble and insertion sort" }],
  "exam-workflow": [{ source_id: "video_greg_hogg_dsa_lecture_01", video_id: "aWKEBEg55ps", start: 0, end: 957, heading: "Time-complexity cost model, Big O growth and space complexity" }],
};

async function filesBelow(directory, suffix) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesBelow(child, suffix));
    else if (entry.isFile() && entry.name.endsWith(suffix)) output.push(child);
  }
  return output.sort();
}

function sourceRefsForLesson(lesson) {
  const syllabus = lesson.objective_refs.map((ref) => ({
    source_id: ref.source.source_id,
    authority: "Cambridge_syllabus",
    access_mode: "public-citation",
    locator: {
      source_id: ref.source.source_id,
      pdf_page: ref.source.pdf_page,
      printed_page: ref.source.printed_page,
      heading: ref.source.heading,
      bullet_locator: ref.source.bullet_locator,
      anchor_text: ref.source.anchor_text,
    },
  }));
  const coursebook = lesson.book_refs.map((ref) => ({
    source_id: ref.source_id,
    authority: "Cambridge_coursebook",
    access_mode: "licensed-internal",
    locator: {
      source_id: ref.source_id,
      pdf_page: ref.pdf_pages[0],
      printed_page: ref.printed_pages[0],
      heading: `${ref.section} ${ref.subheading}`,
      anchor_text: ref.section_id,
    },
  }));
  const videoChapter = OOP_VIDEO_CHAPTERS[lesson.slug];
  const supplementary = videoChapter ? [{
    source_id: "video_freecodecamp_python_oop_2025",
    authority: "Supplementary_education_source",
    access_mode: "public-citation",
    locator: {
      source_id: "video_freecodecamp_python_oop_2025",
      heading: videoChapter.heading,
      bullet_locator: `youtube_seconds_${videoChapter.start}_${videoChapter.end}`,
      anchor_text: `T2 supplementary concept source only; YouTube iLRZi0Gu8Go at ${videoChapter.start} seconds`,
    },
  }] : [];
  const dsaSupplementary = (DSA_VIDEO_CHAPTERS_BY_LESSON[lesson.slug] ?? []).map((chapter) => ({
    source_id: chapter.source_id,
    authority: "Supplementary_education_source",
    access_mode: "public-citation",
    locator: {
      source_id: chapter.source_id,
      heading: chapter.heading,
      bullet_locator: `youtube_seconds_${chapter.start}_${chapter.end}`,
      anchor_text: `T2 supplementary concept source only; YouTube ${chapter.video_id} at ${chapter.start} seconds`,
    },
  }));
  return [...syllabus, ...coursebook, ...supplementary, ...dsaSupplementary].sort((a, b) => {
    const left = `${a.authority}|${a.locator.anchor_text}|${a.locator.pdf_page}`;
    const right = `${b.authority}|${b.locator.anchor_text}|${b.locator.pdf_page}`;
    return left.localeCompare(right);
  });
}

function releaseForLesson(lesson, grouped, releaseDecision) {
  const lessonId = lesson.lesson_id;
  const knowledge = grouped.KnowledgeUnit.filter((item) => item.record.lesson_id === lessonId);
  const python = grouped.PythonArtifact.filter((item) => item.record.lesson_id === lessonId);
  const pythonIds = new Set(python.map((item) => item.record.python_artifact_id));
  const traces = grouped.VisualScenarioTrace.filter((item) => pythonIds.has(item.record.python_artifact_id));
  const marking = grouped.MarkingChain.filter((item) => item.record.lesson_id === lessonId);
  const assessments = grouped.AssessmentItem.filter((item) => item.record.lesson_id === lessonId);
  const patterns = [...new Set([
    ...python.flatMap((item) => item.record.pattern_ids),
    ...traces.map((item) => item.record.pattern_id),
    ...marking.map((item) => item.record.pattern_id),
    ...assessments.flatMap((item) => item.record.pattern_ids),
  ])].sort();
  const versions = [...new Set(python.map((item) => item.record.version))];
  if (versions.length !== 1) throw new Error(`${lessonId}: expected one Python artifact version, found ${versions.join(", ")}.`);

  return envelope("LessonReleaseRecord", {
    lesson_id: lessonId,
    package_id: lesson.package_id,
    slug: lesson.slug,
    version: versions[0],
    canonical_section_ids: SECTION_IDS,
    knowledge_unit_ids: knowledge.map((item) => item.record.knowledge_unit_id).sort(),
    python_artifact_ids: python.map((item) => item.record.python_artifact_id).sort(),
    pattern_ids: patterns,
    method_refs: [...new Set(marking.flatMap((item) => item.record.method_step_refs))].sort(),
    marking_refs: marking.map((item) => item.record.marking_chain_id).sort(),
    error_refs: [...new Set(marking.map((item) => item.record.error_ref))].sort(),
    practice_refs: assessments.filter((item) => item.record.level !== "retrieval").map((item) => item.record.assessment_item_id).sort(),
    retrieval_refs: assessments.filter((item) => item.record.level === "retrieval").map((item) => item.record.assessment_item_id).sort(),
    source_refs: sourceRefsForLesson(lesson),
    locale_parity: releaseDecision.locale_parity,
    academic_review: releaseDecision.academic_review,
    execution_review: releaseDecision.execution_review,
    ux_review: releaseDecision.ux_review,
    lead_gate: releaseDecision.lead_gate,
    release_allowed: releaseDecision.release_allowed,
  });
}

export async function loadReleaseDecisionManifest(sourceMap) {
  const manifest = await readJson(RELEASE_DECISION_PATH);
  const expectedIds = sourceMap.lessons.map((lesson) => lesson.lesson_id).sort();
  const actualIds = (manifest.lessons ?? []).map((lesson) => lesson.lesson_id).sort();
  if (manifest.schema_version !== "paper4-release-decision-v1") throw new Error("Release decision manifest schema_version must be paper4-release-decision-v1.");
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) throw new Error("Release decision manifest lesson set must equal the 26 source-mapped lessons.");
  const duplicateIds = actualIds.filter((id, index) => id === actualIds[index - 1]);
  if (duplicateIds.length) throw new Error(`Release decision manifest contains duplicate lesson ids: ${duplicateIds.join(", ")}.`);
  const sourceById = new Map(sourceMap.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  for (const decision of manifest.lessons) {
    const source = sourceById.get(decision.lesson_id);
    if (decision.slug !== source.slug || decision.package_id !== source.package_id) throw new Error(`${decision.lesson_id}: release decision identity differs from the source map.`);
  }
  return manifest;
}

export async function compileFullRegistry() {
  const knowledgeFiles = await filesBelow(path.join(CONTENT_ROOT, "lessons"), ".knowledge-unit.json");
  const knowledge = await Promise.all(knowledgeFiles.map(readJson));

  const pythonFiles = await filesBelow(path.join(CONTENT_ROOT, "python"), "artifact.json");
  const python = (await Promise.all(pythonFiles.map(readJson))).map((record) => envelope("PythonArtifact", record));

  const visualFiles = await filesBelow(path.join(CONTENT_ROOT, "visuals"), "visuals.json");
  const visualBundles = await Promise.all(visualFiles.map(readJson));
  const visual = visualBundles.flatMap((bundle) => [...bundle.traces, ...bundle.events]);

  const marking = [
    ...await readJson(path.join(CONTENT_ROOT, "assessments", "pilot", "marking-chains.json")),
    ...await readJson(path.join(CONTENT_ROOT, "assessments", "production", "marking-chains.json")),
  ];
  const assessments = [
    ...await readJson(path.join(CONTENT_ROOT, "assessments", "pilot", "assessment-items.json")),
    ...await readJson(path.join(CONTENT_ROOT, "assessments", "production", "assessment-items.json")),
  ];
  const promptEvidence = await readJson(PROMPT_EVIDENCE_PATH);
  const promptById = new Map(promptEvidence.records.map((item) => [item.assessment_item_id, item]));
  const assessmentIds = assessments.map((item) => item.record.assessment_item_id).sort();
  const promptIds = promptEvidence.records.map((item) => item.assessment_item_id).sort();
  if (JSON.stringify(assessmentIds) !== JSON.stringify(promptIds)) throw new Error("Prompt-level evidence must resolve the exact 79 canonical assessment item IDs.");
  for (const envelope of assessments) {
    const record = envelope.record;
    const reviewed = promptById.get(record.assessment_item_id);
    if (reviewed.status !== "TEACHER_APPROVED_PROMPT_LEVEL" || reviewed.prompt_alignment_status !== "TEACHER_REVIEWED_PROMPT_PROVEN_2026_10_02") {
      throw new Error(`${record.assessment_item_id}: prompt-level Teacher approval is missing.`);
    }
    record.prompt = structuredClone(reviewed.enriched_prompt);
    record.assessment_requirement_ids = [...reviewed.requirement_ids];
    const executionCriteria = record.self_rubric.criteria.filter((criterion) => !criterion.criterion_id.endsWith(".rubric.requirement"));
    const requirementCriteria = reviewed.requirement_evidence.map((evidence, index) => ({
      criterion_id: `${record.assessment_item_id}.rubric.requirement-${String(index + 1).padStart(2, "0")}`,
      description: {
        vi: `${evidence.capability.vi}: ${evidence.prompt_clause.vi}`,
        en: `${evidence.capability.en}: ${evidence.prompt_clause.en}`,
      },
      evidence_required: evidence.rubric_criteria_en.join("; "),
    }));
    record.self_rubric.criteria = [...requirementCriteria, ...executionCriteria];
    record.self_rubric.prompt_requirement_authority = "AlgoCore_teacher_prompt_level";
    const criterionCount = record.self_rubric.criteria.length;
    record.self_rubric.pass_rule = {
      vi: `Đạt khi có bằng chứng cho đủ ${criterionCount}/${criterionCount} tiêu chí áp dụng và mọi output canonical khớp.`,
      en: `Pass only with evidence for all ${criterionCount}/${criterionCount} applicable criteria and matching canonical outputs.`,
    };
  }
  const sourceMap = await readJson(path.join(CONTENT_ROOT, "mappings", "lesson-source-map.json"));
  const releaseDecisionManifest = await loadReleaseDecisionManifest(sourceMap);
  const releaseDecisionByLesson = new Map(releaseDecisionManifest.lessons.map((decision) => [decision.lesson_id, decision]));

  const documents = [...knowledge, ...python, ...visual, ...marking, ...assessments];
  const grouped = Object.fromEntries(RECORD_TYPES.map((type) => [type, documents.filter((item) => item.artifact_type === type)]));
  grouped.LessonReleaseRecord = sourceMap.lessons.map((lesson) => releaseForLesson(lesson, grouped, releaseDecisionByLesson.get(lesson.lesson_id)));
  for (const type of RECORD_TYPES) {
    grouped[type].sort((a, b) => String(a.record[TYPE_IDS[type]]).localeCompare(String(b.record[TYPE_IDS[type]])));
  }
  return { grouped, sourceMap, releaseDecisionManifest };
}

export function renderRegistryFiles(grouped) {
  return Object.fromEntries(RECORD_TYPES.map((type) => [TYPE_FILES[type], jsonText(grouped[type])]));
}

export function registryDigest(files) {
  const fileHashes = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).map(([filename, value]) => [filename, sha256(value)]));
  const aggregate = sha256(Object.entries(fileHashes).map(([filename, digest]) => `${digest}  ${filename}\n`).join(""));
  return { fileHashes, aggregate };
}

export function hashManifest(digest) {
  return Object.entries(digest.fileHashes).map(([filename, value]) => `${value}  ${filename}`).join("\n") + `\n${digest.aggregate}  REGISTRY-AGGREGATE\n`;
}

async function main() {
  const first = await compileFullRegistry();
  const second = await compileFullRegistry();
  const files = renderRegistryFiles(first.grouped);
  const secondFiles = renderRegistryFiles(second.grouped);
  if (JSON.stringify(files) !== JSON.stringify(secondFiles)) throw new Error("Two in-memory rebuilds were not byte-identical.");
  for (const type of RECORD_TYPES) {
    if (first.grouped[type].length !== EXPECTED_COUNTS[type]) throw new Error(`${type}: expected ${EXPECTED_COUNTS[type]}, found ${first.grouped[type].length}.`);
  }
  const digest = registryDigest(files);
  await mkdir(RECORD_ROOT, { recursive: true });
  await mkdir(EVIDENCE_ROOT, { recursive: true });
  for (const [filename, value] of Object.entries(files)) await writeFile(path.join(RECORD_ROOT, filename), value);
  await writeFile(path.join(RECORD_ROOT, "SHA256SUMS.txt"), hashManifest(digest));

  const result = {
    schema_version: "paper4-p4r5-a4-build-v1",
    decision: "BUILT_PENDING_READ_ONLY_CHECK",
    target_release: "paper4-2026-s9-v2",
    generated_by: "scripts/build-paper4-full-registry.mjs",
    deterministic_rebuild: "PASS_BYTE_IDENTICAL",
    lessons: first.grouped.LessonReleaseRecord.map((item) => item.record.lesson_id),
    counts: Object.fromEntries(RECORD_TYPES.map((type) => [type, first.grouped[type].length])),
    total_records: RECORD_TYPES.reduce((sum, type) => sum + first.grouped[type].length, 0),
    registry_file_sha256: digest.fileHashes,
    registry_aggregate_sha256: digest.aggregate,
    release_policy: {
      pending_locale_parity: first.grouped.LessonReleaseRecord.filter((item) => item.record.locale_parity === "PENDING").length,
      pending_academic_reviews: first.grouped.LessonReleaseRecord.filter((item) => item.record.academic_review === "PENDING").length,
      pending_execution_reviews: first.grouped.LessonReleaseRecord.filter((item) => item.record.execution_review === "PENDING").length,
      pending_ux_reviews: first.grouped.LessonReleaseRecord.filter((item) => item.record.ux_review === "PENDING").length,
      pending_lead_gates: first.grouped.LessonReleaseRecord.filter((item) => item.record.lead_gate === "PENDING").length,
      release_allowed_true: first.grouped.LessonReleaseRecord.filter((item) => item.record.release_allowed === true).length,
      decision_manifest: path.relative(ROOT, RELEASE_DECISION_PATH).replaceAll(path.sep, "/"),
    },
  };
  await writeFile(path.join(EVIDENCE_ROOT, "BUILD_RESULT.json"), jsonText(result));
  console.log(jsonText(result).trim());
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exitCode = 1;
  });
}
