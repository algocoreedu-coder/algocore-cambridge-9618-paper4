import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateRegistry } from "./check-paper4-v2-schema.mjs";


const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_ROOT = path.resolve(ROOT, "../..");
const PRODUCTION_ROOT = path.join(ROOT, "content/paper4/python/production");
const EVIDENCE_ROOT = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/a3");
const INVENTORY_PATH = path.join(WORKSPACE_ROOT, "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-3/preflight/P4R3_SCOPE_INVENTORY.json");
const CASES = ["normal", "boundary", "failure"];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));

function exactKeys(value, allowed, label) {
  const actual = Object.keys(value).sort();
  const expected = [...allowed].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} keys differ: expected ${expected.join(", ")}; got ${actual.join(", ")}`);
  }
}

async function main() {
  const inventory = await readJson(INVENTORY_PATH);
  if (inventory.lessons.length !== 20) throw new Error(`Expected 20 lessons; found ${inventory.lessons.length}.`);
  const schema = await readJson(path.join(ROOT, "content/paper4/schema/paper4-v2.schema.json"));
  const artifactKeys = Object.keys(schema.$defs.PythonArtifact.properties);
  const fixtureKeys = Object.keys(schema.$defs.Fixture.properties);
  const outputKeys = Object.keys(schema.$defs.ExpectedOutput.properties);
  const lineKeys = Object.keys(schema.$defs.StableLine.properties);
  const documents = [];
  const allLineIds = new Set();

  for (const lesson of inventory.lessons) {
    const slug = lesson.lesson_slug;
    const directory = path.join(PRODUCTION_ROOT, slug);
    const record = await readJson(path.join(directory, "artifact.json"));
    exactKeys(record, artifactKeys, `${slug}/artifact`);
    if (record.python_artifact_id !== `ac-9618-p4-2026-python.artifact.${slug}.production-v1`) throw new Error(`${slug}: wrong artifact ID.`);
    if (record.version !== "production-v1" || record.status !== "independently-rerun") throw new Error(`${slug}: production version/status not frozen.`);
    const approved = lesson.pattern_ids.length ? lesson.pattern_ids : lesson.proposed_pattern_ids;
    if (JSON.stringify(record.pattern_ids) !== JSON.stringify(approved)) throw new Error(`${slug}: pattern association differs from Lead inventory/decision.`);
    record.fixtures.forEach((fixture, index) => exactKeys(fixture, fixtureKeys, `${slug}/fixtures/${index}`));
    record.expected_outputs.forEach((output, index) => exactKeys(output, outputKeys, `${slug}/expected_outputs/${index}`));
    record.lines.forEach((line, index) => {
      exactKeys(line, lineKeys, `${slug}/lines/${index}`);
      if (allLineIds.has(line.line_id)) throw new Error(`${slug}: globally duplicated line ID ${line.line_id}.`);
      allLineIds.add(line.line_id);
    });
    const source = await readFile(path.join(ROOT, record.filename));
    const displayed = Buffer.from(record.lines.map((line) => line.text).join("\n"), "utf8");
    if (!source.equals(displayed)) throw new Error(`${slug}: displayed source differs from executed bytes.`);
    if (record.code_sha256 !== sha256(source)) throw new Error(`${slug}: stale code hash.`);
    if (record.lines.some((line, index) => line.order !== index + 1)) throw new Error(`${slug}: non-contiguous line order.`);
    const fixtureIds = new Set(record.fixtures.map((fixture) => fixture.fixture_id));
    const outputRefs = new Set(record.expected_outputs.map((output) => output.fixture_ref));
    if (fixtureIds.size !== 3 || outputRefs.size !== 3 || [...fixtureIds].some((id) => !outputRefs.has(id))) throw new Error(`${slug}: incomplete fixture/output joins.`);
    if (CASES.some((kind) => !record.fixtures.some((fixture) => fixture.case_kind === kind))) throw new Error(`${slug}: incomplete normal/boundary/failure coverage.`);
    documents.push({ schema_version: "2.0.0", artifact_type: "PythonArtifact", record });
  }

  const schemaErrors = validateRegistry(documents);
  if (schemaErrors.length) throw new Error(`validateRegistry rejected production artifacts:\n${JSON.stringify(schemaErrors, null, 2)}`);

  const resolver = await readJson(path.join(EVIDENCE_ROOT, "EVIDENCE_RESOLVER.json"));
  if (resolver.records.length !== 40) throw new Error(`Expected 40 evidence records; found ${resolver.records.length}.`);
  const resolverById = new Map(resolver.records.map((record) => [record.evidence_id, record]));
  if (resolverById.size !== 40) throw new Error("Duplicate execution evidence IDs.");
  for (const { record } of documents) {
    for (const reference of [record.author_run_ref, record.independent_rerun_ref]) {
      const evidence = resolverById.get(reference);
      if (!evidence || evidence.python_artifact_id !== record.python_artifact_id) throw new Error(`${record.python_artifact_id}: unresolved evidence ${reference}.`);
      if (evidence.code_sha256 !== record.code_sha256 || evidence.execution_log_sha256 !== record.execution_log_sha256) throw new Error(`${record.python_artifact_id}: stale evidence ${reference}.`);
      const evidenceFile = path.join(WORKSPACE_ROOT, evidence.evidence_file);
      if (sha256(await readFile(evidenceFile)) !== evidence.evidence_file_sha256) throw new Error(`${reference}: evidence file hash mismatch.`);
    }
  }

  const roleMap = await readJson(path.join(EVIDENCE_ROOT, "LINE_ROLE_MAP.json"));
  if (roleMap.lessons.length !== 20 || roleMap.counts.semantic_roles !== 82) throw new Error("Line-role map must cover 20 lessons and 82 roles.");
  const roleRecords = roleMap.lessons.flatMap((lesson) => lesson.roles);
  if (roleRecords.length !== 82 || new Set(roleRecords.map((role) => role.knowledge_unit_id)).size !== 82) throw new Error("Line-role map contains missing/duplicate KnowledgeUnits.");
  for (const role of roleRecords) {
    if (!role.active_line_ids.length || role.active_line_ids.some((lineId) => !allLineIds.has(lineId))) throw new Error(`${role.knowledge_unit_id}: unresolved active line ID.`);
  }

  console.log(JSON.stringify({ decision: "PASS", checker_mode: "READ_ONLY", validate_registry: "PASS_20_OF_20", canonical_schema_shape: "PASS_20_OF_20", exact_source_bytes: "PASS_20_OF_20", evidence_refs_resolved: "PASS_40_OF_40", semantic_roles_resolved: "PASS_82_OF_82" }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
