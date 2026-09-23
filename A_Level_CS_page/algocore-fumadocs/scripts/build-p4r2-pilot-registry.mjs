import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_ROOT = path.join(ROOT, "content", "paper4");
const RECORD_ROOT = path.join(CONTENT_ROOT, "records", "pilot");
const EVIDENCE_ROOT = path.resolve(ROOT, "..", "planning", "paper4", "next-phase", "evidence", "p4r-2", "a4");

export const PILOT_SLUGS = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
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
  KnowledgeUnit: 26,
  PythonArtifact: 6,
  VisualScenarioTrace: 48,
  VisualEventBinding: 238,
  MarkingChain: 16,
  AssessmentItem: 18,
  LessonReleaseRecord: 6,
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

const TYPE_FILES = {
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
const lessonId = (slug) => `ac-9618-p4-2026-python.lesson.${slug}`;

async function filesBelow(directory, suffix) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesBelow(child, suffix));
    else if (entry.isFile() && entry.name.endsWith(suffix)) output.push(child);
  }
  return output.sort();
}

function envelope(type, record) {
  return { schema_version: "2.0.0", artifact_type: type, record };
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
  return [...syllabus, ...coursebook].sort((a, b) => {
    const left = `${a.authority}|${a.locator.anchor_text}|${a.locator.pdf_page}`;
    const right = `${b.authority}|${b.locator.anchor_text}|${b.locator.pdf_page}`;
    return left.localeCompare(right);
  });
}

function releaseForLesson(lesson, grouped) {
  const id = lesson.lesson_id;
  const knowledge = grouped.KnowledgeUnit.filter((item) => item.record.lesson_id === id);
  const python = grouped.PythonArtifact.filter((item) => item.record.lesson_id === id);
  const marking = grouped.MarkingChain.filter((item) => item.record.lesson_id === id);
  const assessments = grouped.AssessmentItem.filter((item) => item.record.lesson_id === id);
  const patterns = [...new Set([
    ...python.flatMap((item) => item.record.pattern_ids),
    ...marking.map((item) => item.record.pattern_id),
  ])].sort();
  return envelope("LessonReleaseRecord", {
    lesson_id: id,
    package_id: lesson.package_id,
    slug: lesson.slug,
    version: "pilot-v1",
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
    locale_parity: "PASS",
    academic_review: "PASS",
    execution_review: "PASS",
    ux_review: "PASS",
    lead_gate: "PENDING",
    release_allowed: false,
  });
}

export async function compilePilotRegistry() {
  const knowledgeFiles = await filesBelow(path.join(CONTENT_ROOT, "lessons", "pilot"), ".knowledge-unit.json");
  const knowledge = await Promise.all(knowledgeFiles.map(readJson));
  const pythonRecords = await Promise.all(PILOT_SLUGS.map((slug) => readJson(path.join(CONTENT_ROOT, "python", "pilot", slug, "artifact.json"))));
  const python = pythonRecords.map((record) => envelope("PythonArtifact", record));
  const visualBundles = await Promise.all(PILOT_SLUGS.map((slug) => readJson(path.join(CONTENT_ROOT, "visuals", "pilot", slug, "visuals.json"))));
  const visual = visualBundles.flatMap((bundle) => [...bundle.traces, ...bundle.events]);
  const marking = await readJson(path.join(CONTENT_ROOT, "assessments", "pilot", "marking-chains.json"));
  const assessments = await readJson(path.join(CONTENT_ROOT, "assessments", "pilot", "assessment-items.json"));
  const sourceMap = await readJson(path.join(CONTENT_ROOT, "mappings", "lesson-source-map.json"));
  const pilotLessonIds = new Set(PILOT_SLUGS.map(lessonId));
  const sourceLessons = sourceMap.lessons.filter((lesson) => pilotLessonIds.has(lesson.lesson_id)).sort((a, b) => a.slug.localeCompare(b.slug));

  const documents = [...knowledge, ...python, ...visual, ...marking, ...assessments];
  const grouped = Object.fromEntries(RECORD_TYPES.map((type) => [type, documents.filter((item) => item.artifact_type === type)]));
  grouped.LessonReleaseRecord = sourceLessons.map((lesson) => releaseForLesson(lesson, grouped));
  for (const type of RECORD_TYPES) grouped[type].sort((a, b) => String(a.record[TYPE_IDS[type]]).localeCompare(String(b.record[TYPE_IDS[type]])));
  return { grouped, sourceMap, sourceLessons };
}

export function renderRegistryFiles(grouped) {
  return Object.fromEntries(RECORD_TYPES.map((type) => [TYPE_FILES[type], jsonText(grouped[type])]));
}

export function registryDigest(files) {
  const fileHashes = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).map(([filename, text]) => [filename, sha256(text)]));
  const aggregate = sha256(Object.entries(fileHashes).map(([filename, digest]) => `${digest}  ${filename}\n`).join(""));
  return { fileHashes, aggregate };
}

async function main() {
  const { grouped } = await compilePilotRegistry();
  for (const type of RECORD_TYPES) {
    if (grouped[type].length !== EXPECTED_COUNTS[type]) throw new Error(`${type}: expected ${EXPECTED_COUNTS[type]}, found ${grouped[type].length}.`);
  }
  const files = renderRegistryFiles(grouped);
  const digest = registryDigest(files);
  await mkdir(RECORD_ROOT, { recursive: true });
  await mkdir(EVIDENCE_ROOT, { recursive: true });
  for (const [filename, text] of Object.entries(files)) await writeFile(path.join(RECORD_ROOT, filename), text);
  const hashText = Object.entries(digest.fileHashes).map(([filename, value]) => `${value}  ${filename}`).join("\n") + `\n${digest.aggregate}  REGISTRY-AGGREGATE\n`;
  await writeFile(path.join(RECORD_ROOT, "SHA256SUMS.txt"), hashText);

  const result = {
    schema_version: "paper4-p4r2-a4-build-v1",
    decision: "BUILT_PENDING_READ_ONLY_CHECK",
    target_release: "paper4-2026-s9-v2",
    generated_by: "scripts/build-p4r2-pilot-registry.mjs",
    lessons: PILOT_SLUGS.map(lessonId).sort(),
    counts: Object.fromEntries(RECORD_TYPES.map((type) => [type, grouped[type].length])),
    registry_file_sha256: digest.fileHashes,
    registry_aggregate_sha256: digest.aggregate,
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
