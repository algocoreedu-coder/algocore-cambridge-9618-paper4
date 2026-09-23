import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateEnvelope, validateRegistry } from "./check-paper4-v2-schema.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LESSON_ROOT = path.join(ROOT, "content/paper4/lessons/pilot");
const PILOT = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const EXPECTED_PER_LESSON = new Map([
  ["data-models", 6], ["binary-search", 3], ["queue", 5],
  ["recursion", 5], ["hashing", 4], ["object-files", 3],
]);
const PLACEHOLDER = /\b(?:todo|tbd|fixme|lorem|placeholder|coming soon)\b|đang cập nhật|chưa biên soạn/i;

const errors = [];
const add = (code, location, message) => errors.push({ code, location, message });
const canonical = (value) => JSON.stringify(value);
const meaningful = (value, minimum) => typeof value === "string" && value.trim().length >= minimum && !PLACEHOLDER.test(value);

function checkBi(value, location, minimum) {
  if (!value || !meaningful(value.vi, minimum) || !meaningful(value.en, minimum)) {
    add("BILINGUAL_SEMANTIC_INCOMPLETE", location, `Expected meaningful vi/en text of at least ${minimum} characters.`);
    return;
  }
  if (value.vi.trim().toLowerCase() === value.en.trim().toLowerCase()) {
    add("BILINGUAL_COPY", location, "VI and EN text must be independently authored.");
  }
}

async function jsonFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await jsonFiles(absolute));
    else if (entry.isFile() && entry.name.endsWith(".knowledge-unit.json")) found.push(absolute);
  }
  return found.sort();
}

function expectedObjectiveRef(ref) {
  const source = ref.source;
  return {
    objective_id: ref.objective_id,
    syllabus_version: "2026",
    locator: {
      source_id: source.source_id,
      pdf_page: source.pdf_page,
      printed_page: source.printed_page,
      heading: source.heading,
      bullet_locator: source.bullet_locator,
      anchor_text: source.anchor_text,
    },
  };
}

const dispositions = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/knowledge-disposition.json"), "utf8"));
const sourceMap = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/lesson-source-map.json"), "utf8"));
const lineMigration = JSON.parse(await readFile(path.resolve(ROOT, "../planning/paper4/next-phase/evidence/p4r-2/a3/LINE_ID_MIGRATION.json"), "utf8"));
const lessonSources = new Map(sourceMap.lessons.map((lesson) => [lesson.slug, lesson]));
const expectedBlocks = dispositions.records.filter((record) => PILOT.includes(record.lesson_slug));
const expectedById = new Map(expectedBlocks.map((record) => [record.knowledge_block_id, record]));

const artifacts = [];
const lineOwner = new Map();
const migrationByLesson = new Map(lineMigration.lessons.map((lesson) => [lesson.lesson_id, lesson]));
const activeMigrationLines = new Set();
const retiredMigrationLines = new Set();
for (const lesson of lineMigration.lessons) {
  for (const lineId of [...lesson.preserved_line_ids, ...lesson.added_line_ids]) activeMigrationLines.add(lineId);
  for (const lineId of lesson.retired_line_ids) retiredMigrationLines.add(lineId);
}
for (const slug of PILOT) {
  const artifact = JSON.parse(await readFile(path.join(ROOT, `content/paper4/python/pilot/${slug}/artifact.json`), "utf8"));
  artifacts.push(artifact);
  const migration = migrationByLesson.get(artifact.lesson_id);
  if (!migration) add("LINE_MIGRATION_LESSON_MISSING", slug, artifact.lesson_id);
  else {
    const artifactLineIds = new Set(artifact.lines.map((line) => line.line_id));
    const migrationLineIds = new Set([...migration.preserved_line_ids, ...migration.added_line_ids]);
    const missing = [...migrationLineIds].filter((lineId) => !artifactLineIds.has(lineId));
    const unexpected = [...artifactLineIds].filter((lineId) => !migrationLineIds.has(lineId));
    if (missing.length || unexpected.length) add("LINE_MIGRATION_ARTIFACT_DRIFT", slug, `missing=${missing.join(",")}; unexpected=${unexpected.join(",")}`);
  }
  for (const line of artifact.lines) {
    if (lineOwner.has(line.line_id)) add("DUPLICATE_LINE_ID", line.line_id, "Line identity is not globally unique in the pilot.");
    lineOwner.set(line.line_id, artifact.python_artifact_id);
  }
}
const artifactIds = new Set(artifacts.map((artifact) => artifact.python_artifact_id));

const files = await jsonFiles(LESSON_ROOT);
const envelopes = await Promise.all(files.map(async (file) => JSON.parse(await readFile(file, "utf8"))));
if (files.length !== 26) add("EXACT_COUNT", LESSON_ROOT, `Expected 26 files, found ${files.length}.`);
if (expectedBlocks.length !== 26) add("LOCKED_DENOMINATOR", "knowledge-disposition.json", `Expected 26 locked blocks, found ${expectedBlocks.length}.`);

for (const issue of validateRegistry(envelopes)) add(`SCHEMA_${issue.code}`, `${issue.document ?? "?"}${issue.path}`, issue.message);

const seen = new Set();
const counts = new Map(PILOT.map((slug) => [slug, 0]));
for (const [index, envelope] of envelopes.entries()) {
  const file = path.relative(ROOT, files[index]).replaceAll("\\", "/");
  for (const issue of validateEnvelope(envelope)) add(`ENVELOPE_${issue.code}`, `${file}${issue.path}`, issue.message);
  if (envelope.artifact_type !== "KnowledgeUnit") {
    add("WRONG_ARTIFACT_TYPE", file, `Expected KnowledgeUnit, got ${envelope.artifact_type}.`);
    continue;
  }
  const unit = envelope.record;
  const block = expectedById.get(unit.knowledge_unit_id);
  if (!block) {
    add("UNEXPECTED_IDENTITY", file, unit.knowledge_unit_id);
    continue;
  }
  if (seen.has(unit.knowledge_unit_id)) add("DUPLICATE_IDENTITY", file, unit.knowledge_unit_id);
  seen.add(unit.knowledge_unit_id);
  counts.set(block.lesson_slug, counts.get(block.lesson_slug) + 1);
  if (unit.lesson_id !== block.lesson_id) add("LESSON_JOIN", file, "KnowledgeUnit lesson_id differs from locked disposition.");
  if (canonical(unit.stage3_block_ids) !== canonical([block.knowledge_block_id])) add("STAGE3_IDENTITY", file, "stage3_block_ids must preserve the one locked block identity.");
  if (unit.disposition !== block.final_disposition) add("DISPOSITION", file, "Disposition differs from the Lead-approved mapping.");

  const source = lessonSources.get(block.lesson_slug);
  const objectiveMap = new Map(source.objective_refs.map((ref) => [ref.objective_id, ref]));
  const expectedObjectives = block.objective_ids.map((id) => expectedObjectiveRef(objectiveMap.get(id)));
  if (canonical(unit.objective_refs) !== canonical(expectedObjectives)) add("OBJECTIVE_LOCATOR_DRIFT", file, "Objective IDs or direct syllabus locators differ from the canonical P4R-1 map.");
  const bookMap = new Map(source.book_refs.map((ref) => [ref.section_id, ref]));
  const expectedBooks = block.book_section_ids.map((id) => {
    const ref = bookMap.get(id);
    return { section_id: id, chapter: ref.chapter, printed_pages: ref.printed_pages, pdf_pages: ref.pdf_pages, relationship: block.book_relationship };
  });
  if (canonical(unit.book_refs) !== canonical(expectedBooks)) add("BOOK_LOCATOR_DRIFT", file, "Coursebook IDs or page locators differ from the canonical P4R-1 map.");

  checkBi(unit.title, `${file}#title`, 8);
  checkBi(unit.explanation, `${file}#explanation`, 100);
  checkBi(unit.python_connection, `${file}#python_connection`, 80);
  checkBi(unit.representation, `${file}#representation`, 55);
  checkBi(unit.invariant_or_rule, `${file}#invariant_or_rule`, 55);
  if (!Array.isArray(unit.misconceptions) || unit.misconceptions.length < 2) add("MISCONCEPTIONS_DEPTH", file, "At least two misconceptions are required.");
  else unit.misconceptions.forEach((item, itemIndex) => checkBi(item, `${file}#misconceptions/${itemIndex}`, 25));
  if (!Array.isArray(unit.exam_signals) || unit.exam_signals.length < 2) add("EXAM_SIGNALS_DEPTH", file, "At least two exam signals are required.");
  else unit.exam_signals.forEach((item, itemIndex) => checkBi(item, `${file}#exam_signals/${itemIndex}`, 25));
  checkBi(unit.micro_example?.scenario, `${file}#micro_example/scenario`, 20);
  checkBi(unit.micro_example?.walkthrough, `${file}#micro_example/walkthrough`, 35);
  checkBi(unit.self_check?.prompt, `${file}#self_check/prompt`, 15);
  checkBi(unit.self_check?.answer, `${file}#self_check/answer`, 25);
  checkBi(unit.self_check?.rationale, `${file}#self_check/rationale`, 25);
  if (unit.self_check?.answer_hidden_initially !== true) add("SELF_CHECK_DISCLOSURE", file, "Self-check answer must start hidden.");
  const authoredText = JSON.stringify({
    explanation: unit.explanation,
    python_connection: unit.python_connection,
    representation: unit.representation,
    invariant_or_rule: unit.invariant_or_rule,
    misconceptions: unit.misconceptions,
    exam_signals: unit.exam_signals,
    micro_example: unit.micro_example,
    self_check: unit.self_check,
  });
  if (/\b\d+\s*marks?\b|\bmark scheme\b|\bcambridge awards?\b|\bđược\s+\d+\s+điểm\b/i.test(authoredText)) {
    add("UNSUPPORTED_MARK_CLAIM", file, "A2 theory must not invent Cambridge mark allocations or mark-scheme authority.");
  }

  const lineIds = unit.micro_example?.active_line_ids;
  if (!Array.isArray(lineIds) || lineIds.length < 2) add("PYTHON_LINE_DEPTH", file, "At least two concrete Python line concepts are required.");
  const ownerIds = new Set();
  for (const lineId of lineIds ?? []) {
    if (retiredMigrationLines.has(lineId)) add("PYTHON_LINE_RETIRED", file, lineId);
    if (!activeMigrationLines.has(lineId)) add("PYTHON_LINE_OUTSIDE_MIGRATION", file, lineId);
    const owner = lineOwner.get(lineId);
    if (!owner) add("PYTHON_LINE_UNRESOLVED", file, lineId);
    else ownerIds.add(owner);
  }
  if (!artifactIds.has(unit.micro_example?.python_artifact_id)) add("PYTHON_ARTIFACT_UNRESOLVED", file, String(unit.micro_example?.python_artifact_id));
  if (!ownerIds.has(unit.micro_example?.python_artifact_id)) add("PRIMARY_ARTIFACT_NOT_LINKED", file, "At least one active line must belong to the lesson's primary artifact.");
  const refs = unit.micro_example?.python_artifact_refs;
  if (!Array.isArray(refs) || canonical([...ownerIds]) !== canonical(refs)) add("PYTHON_ARTIFACT_REFS", file, "python_artifact_refs must exactly follow active line ownership order.");
}

for (const id of expectedById.keys()) if (!seen.has(id)) add("MISSING_IDENTITY", "pilot", id);
for (const [slug, expected] of EXPECTED_PER_LESSON) {
  if (counts.get(slug) !== expected) add("LESSON_COVERAGE", slug, `Expected ${expected}, found ${counts.get(slug)}.`);
}

const result = {
  check: "P4R-2 A2 bilingual theory pilot",
  status: errors.length === 0 ? "PASS" : "FAIL",
  counts: {
    files: files.length,
    locked_identities: expectedBlocks.length,
    authored_identities: seen.size,
    lessons: Object.fromEntries(counts),
    direct_syllabus_locator_units: envelopes.filter((item) => item.record?.objective_refs?.length > 0).length,
    direct_coursebook_locator_units: envelopes.filter((item) => item.record?.book_refs?.length > 0).length,
    python_line_linked_units: envelopes.filter((item) => item.record?.micro_example?.active_line_ids?.length >= 2).length,
    line_migration_checked_lessons: migrationByLesson.size,
  },
  known_handoff_gaps: [
    "A6/A7: method and marking joins remain outside A2 authorship; no Cambridge mark claims were added.",
  ],
  errors,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (errors.length) process.exitCode = 1;
