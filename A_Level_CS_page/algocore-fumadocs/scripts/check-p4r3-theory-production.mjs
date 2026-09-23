import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateEnvelope, validateRegistry } from "./check-paper4-v2-schema.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = path.resolve(ROOT, "../planning/paper4/next-phase");
const OUT = path.join(ROOT, "content/paper4/lessons/production");
const errors = [];
const add = (code, location, message) => errors.push({ code, location, message });
const PLACEHOLDER = /\b(?:todo|tbd|fixme|lorem|placeholder|coming soon)\b|đang cập nhật|chưa biên soạn/i;
const LOCAL_PATH = /(?:[A-Za-z]:[\\/]|\\Users\\|\/Users\/|_Lam_viec|AlgoCoreEduction)/i;

async function filesBelow(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await filesBelow(absolute));
    else if (entry.isFile() && entry.name.endsWith(".knowledge-unit.json")) found.push(absolute);
  }
  return found.sort();
}

function meaningful(text, min) { return typeof text === "string" && text.trim().length >= min && !PLACEHOLDER.test(text); }
function checkBi(value, at, min) {
  if (!value || !meaningful(value.vi, min) || !meaningful(value.en, min)) return add("BILINGUAL_SEMANTIC_INCOMPLETE", at, `Need independent vi/en text >= ${min} characters.`);
  if (value.vi.trim().toLowerCase() === value.en.trim().toLowerCase()) add("BILINGUAL_COPY", at, "VI and EN are identical.");
  if (!/[ăâđêôơưàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i.test(value.vi)) add("VIETNAMESE_SIGNAL_MISSING", at, "VI text has no Vietnamese language signal.");
}

function cleanObjective(ref) {
  const s = ref.source;
  return { objective_id: ref.objective_id, syllabus_version: "2026", locator: { source_id: s.source_id, pdf_page: s.pdf_page,
    printed_page: s.printed_page, heading: s.heading, bullet_locator: s.bullet_locator, anchor_text: s.anchor_text } };
}
function cleanBook(ref, relationship) { return { section_id: ref.section_id, chapter: ref.chapter, printed_pages: ref.printed_pages, pdf_pages: ref.pdf_pages, relationship }; }
const canonical = (x) => JSON.stringify(x);

const inventory = JSON.parse(await readFile(path.join(PLAN, "evidence/p4r-3/preflight/P4R3_SCOPE_INVENTORY.json"), "utf8"));
const dispositions = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/knowledge-disposition.json"), "utf8"));
const sources = JSON.parse(await readFile(path.join(ROOT, "content/paper4/mappings/lesson-source-map.json"), "utf8"));
const lineRoleMap = JSON.parse(await readFile(path.join(PLAN, "evidence/p4r-3/a3/LINE_ROLE_MAP.json"), "utf8"));
const dispositionById = new Map(dispositions.records.map((x) => [x.knowledge_block_id, x]));
const sourceBySlug = new Map(sources.lessons.map((x) => [x.slug, x]));
const lineRoleEntries = lineRoleMap.lessons.flatMap((lesson) => lesson.roles.map((role) => [role.knowledge_unit_id, { ...role, python_artifact_id: lesson.python_artifact_id, lesson_id: lesson.lesson_id, artifact_version: lesson.artifact_version }]));
const lineRoleByKnowledgeId = new Map(lineRoleEntries);
if (lineRoleEntries.length !== 82 || lineRoleByKnowledgeId.size !== 82) add("LINE_ROLE_MAP_SCOPE_INVALID", "LINE_ROLE_MAP.json", `${lineRoleEntries.length} entries / ${lineRoleByKnowledgeId.size} unique IDs`);
const artifactById = new Map();
const lineTextByArtifact = new Map();
for (const lesson of inventory.lessons) {
  const artifactPath = path.join(ROOT, `content/paper4/python/production/${lesson.lesson_slug}/artifact.json`);
  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
  artifactById.set(artifact.python_artifact_id, artifact);
  lineTextByArtifact.set(artifact.python_artifact_id, new Map(artifact.lines.map((line) => [line.line_id, line.text])));
  const expectedArtifactId = `ac-9618-p4-2026-python.artifact.${lesson.lesson_slug}.production-v1`;
  if (artifact.python_artifact_id !== expectedArtifactId || artifact.lesson_id !== lesson.lesson_id || artifact.version !== "production-v1") add("ARTIFACT_IDENTITY_INVALID", path.relative(ROOT, artifactPath), `${artifact.python_artifact_id} / ${artifact.lesson_id} / ${artifact.version}`);
}
const expectedIds = inventory.lessons.flatMap((x) => x.knowledge_unit_ids).sort();
const expectedSet = new Set(expectedIds);
const files = await filesBelow(OUT);
const envelopes = [];
const seenIds = new Set();
const perLesson = new Map();

for (const file of files) {
  let env;
  try { env = JSON.parse(await readFile(file, "utf8")); } catch (error) { add("INVALID_JSON", path.relative(ROOT, file), error.message); continue; }
  envelopes.push(env);
  const rec = env.record ?? {};
  const rel = path.relative(ROOT, file).replaceAll("\\", "/");
  const id = rec.knowledge_unit_id;
  if (seenIds.has(id)) add("DUPLICATE_ID", rel, id); else seenIds.add(id);
  if (!expectedSet.has(id)) add("UNEXPECTED_ID", rel, id);
  const disposition = dispositionById.get(id);
  const slug = disposition?.lesson_slug;
  if (!disposition || !slug) continue;
  perLesson.set(slug, (perLesson.get(slug) ?? 0) + 1);
  const expectedFile = `content/paper4/lessons/production/${slug}/${id.split(".").at(-1)}.knowledge-unit.json`;
  if (rel !== expectedFile) add("FILE_ID_MISMATCH", rel, expectedFile);
  const lesson = inventory.lessons.find((x) => x.lesson_slug === slug);
  const source = sourceBySlug.get(slug);
  if (rec.lesson_id !== lesson.lesson_id) add("LESSON_ID_MISMATCH", rel, rec.lesson_id);
  if (canonical(rec.stage3_block_ids) !== canonical([id])) add("STAGE3_ID_NOT_ONE_TO_ONE", rel, canonical(rec.stage3_block_ids));
  const objectiveIds = disposition.objective_ids.length ? disposition.objective_ids : source.objective_ids;
  const expectedObjectives = objectiveIds.map((oid) => source.objective_refs.find((x) => x.objective_id === oid)).filter(Boolean).map(cleanObjective);
  const expectedBooks = disposition.book_section_ids.map((sid) => source.book_refs.find((x) => x.section_id === sid)).filter(Boolean).map((x) => cleanBook(x, disposition.book_relationship));
  if (canonical(rec.objective_refs) !== canonical(expectedObjectives)) add("OBJECTIVE_LOCATOR_DRIFT", rel, "Objective refs differ from approved Stage 3/P4R-1 source map.");
  if (canonical(rec.book_refs) !== canonical(expectedBooks)) add("BOOK_LOCATOR_DRIFT", rel, "Book refs differ from approved Stage 3/P4R-1 source map.");
  checkBi(rec.title, `${rel}#title`, 8); checkBi(rec.explanation, `${rel}#explanation`, 180);
  checkBi(rec.python_connection, `${rel}#python_connection`, 180); checkBi(rec.representation, `${rel}#representation`, 130);
  checkBi(rec.invariant_or_rule, `${rel}#invariant_or_rule`, 45);
  for (const [i, x] of (rec.misconceptions ?? []).entries()) checkBi(x, `${rel}#misconceptions[${i}]`, 45);
  for (const [i, x] of (rec.exam_signals ?? []).entries()) checkBi(x, `${rel}#exam_signals[${i}]`, 45);
  checkBi(rec.micro_example?.scenario, `${rel}#micro_example.scenario`, 65);
  checkBi(rec.micro_example?.walkthrough, `${rel}#micro_example.walkthrough`, 130);
  checkBi(rec.self_check?.prompt, `${rel}#self_check.prompt`, 35);
  checkBi(rec.self_check?.answer, `${rel}#self_check.answer`, 45);
  checkBi(rec.self_check?.rationale, `${rel}#self_check.rationale`, 65);
  if (rec.self_check?.answer_hidden_initially !== true) add("SELF_CHECK_NOT_HIDDEN", rel, "Answer must start hidden.");
  const expectedArtifact = `ac-9618-p4-2026-python.artifact.${slug}.production-v1`;
  if (rec.micro_example?.python_artifact_id !== expectedArtifact || canonical(rec.micro_example?.python_artifact_refs) !== canonical([expectedArtifact])) add("ARTIFACT_INTENT_MISMATCH", rel, expectedArtifact);
  const intent = rec.micro_example?.code_link_intent;
  const lineRole = lineRoleByKnowledgeId.get(id);
  if (!lineRole) add("LINE_ROLE_MISSING", rel, id);
  else {
    const expectedIntent = { status: "RESOLVED_A3_FROZEN_LINE_ROLE_MAP", lesson_slug: slug, semantic_role: id.split(".").at(-1), artifact_version: lineRole.artifact_version, matched_text: lineRole.matched_text, resolved_line_ids: lineRole.active_line_ids };
    if (canonical(intent) !== canonical(expectedIntent)) add("CODE_LINK_INTENT_INVALID", rel, "Resolved intent differs from the frozen A3 line-role map.");
    if (canonical(rec.micro_example?.active_line_ids) !== canonical(lineRole.active_line_ids) || !lineRole.active_line_ids.length) add("LINE_BINDING_MAP_DRIFT", rel, canonical(rec.micro_example?.active_line_ids));
    const lineText = lineTextByArtifact.get(expectedArtifact);
    if (!lineText) add("BOUND_ARTIFACT_MISSING", rel, expectedArtifact);
    else {
      for (const lineId of rec.micro_example?.active_line_ids ?? []) if (!lineText.has(lineId)) add("BOUND_LINE_MISSING", rel, lineId);
      if (![...(rec.micro_example?.active_line_ids ?? [])].some((lineId) => lineText.get(lineId)?.trim() === lineRole.matched_text.trim())) add("MATCHED_TEXT_NOT_AT_BOUND_LINE", rel, lineRole.matched_text);
    }
    if (lineRole.python_artifact_id !== expectedArtifact || lineRole.lesson_id !== rec.lesson_id || lineRole.artifact_version !== "production-v1") add("LINE_ROLE_IDENTITY_DRIFT", rel, canonical(lineRole));
  }
  const serialized = JSON.stringify(env);
  if (LOCAL_PATH.test(serialized)) add("LOCAL_PATH_LEAK", rel, "Serialized release content contains a local path.");
}

for (const id of expectedIds) if (!seenIds.has(id)) add("MISSING_ID", id, "Expected Stage 3 ID is absent.");
for (const lesson of inventory.lessons) if ((perLesson.get(lesson.lesson_slug) ?? 0) !== lesson.knowledge_unit_count) add("LESSON_COUNT_MISMATCH", lesson.lesson_slug, `${perLesson.get(lesson.lesson_slug) ?? 0}/${lesson.knowledge_unit_count}`);
for (const [i, env] of envelopes.entries()) for (const issue of validateEnvelope(env)) add(`SCHEMA_${issue.code}`, files[i] ? path.relative(ROOT, files[i]) : `envelope[${i}]`, `${issue.path}: ${issue.message}`);
for (const issue of validateRegistry(envelopes)) add(`REGISTRY_${issue.code}`, issue.path, issue.message);

const hashes = [];
for (const file of files) hashes.push({ path: path.relative(ROOT, file).replaceAll("\\", "/"), sha256: createHash("sha256").update(await readFile(file)).digest("hex") });
const aggregateSha256 = createHash("sha256").update(JSON.stringify(hashes)).digest("hex");
const resolvedBindings = envelopes.filter((x) => x.record.micro_example?.active_line_ids?.length).length;
if (resolvedBindings !== 82) add("RESOLVED_BINDING_COUNT_INVALID", "production KnowledgeUnits", `${resolvedBindings}/82`);
const report = { schema_version: "paper4-p4r3-a2-check-v2", status: errors.length ? "FAIL" : "PASS",
  counts: { lessons: perLesson.size, knowledge_units: envelopes.length, exact_expected_ids: expectedIds.length, objective_refs: envelopes.reduce((n, x) => n + x.record.objective_refs.length, 0), book_refs: envelopes.reduce((n, x) => n + x.record.book_refs.length, 0), semantic_code_link_intents: envelopes.filter((x) => x.record.micro_example?.code_link_intent).length, resolved_active_line_bindings: envelopes.filter((x) => x.record.micro_example?.active_line_ids?.length).length },
  aggregate_sha256: aggregateSha256, errors };
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
