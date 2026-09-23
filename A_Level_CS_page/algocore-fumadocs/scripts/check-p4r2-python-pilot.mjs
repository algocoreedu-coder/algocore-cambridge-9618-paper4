import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateRegistry } from "./check-paper4-v2-schema.mjs";


const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_ROOT = path.resolve(ROOT, "../..");
const PILOT_ROOT = path.join(ROOT, "content/paper4/python/pilot");
const EVIDENCE_ROOT = path.join(
  WORKSPACE_ROOT,
  "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-2/a3",
);
const SLUGS = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const CASES = ["normal", "boundary", "failure"];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

function exactKeys(value, allowed, label) {
  const actual = Object.keys(value).sort();
  const expected = [...allowed].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} keys differ: expected ${expected.join(", ")}; got ${actual.join(", ")}`);
  }
}

async function main() {
  const schema = await readJson(path.join(ROOT, "content/paper4/schema/paper4-v2.schema.json"));
  const artifactKeys = Object.keys(schema.$defs.PythonArtifact.properties);
  const fixtureKeys = Object.keys(schema.$defs.Fixture.properties);
  const outputKeys = Object.keys(schema.$defs.ExpectedOutput.properties);
  const lineKeys = Object.keys(schema.$defs.StableLine.properties);
  const documents = [];

  for (const slug of SLUGS) {
    const directory = path.join(PILOT_ROOT, slug);
    const record = await readJson(path.join(directory, "artifact.json"));
    exactKeys(record, artifactKeys, `${slug}/artifact`);
    for (const [index, fixture] of record.fixtures.entries()) {
      exactKeys(fixture, fixtureKeys, `${slug}/fixtures/${index}`);
    }
    for (const [index, output] of record.expected_outputs.entries()) {
      exactKeys(output, outputKeys, `${slug}/expected_outputs/${index}`);
    }
    for (const [index, line] of record.lines.entries()) {
      exactKeys(line, lineKeys, `${slug}/lines/${index}`);
    }
    const source = await readFile(path.join(ROOT, record.filename));
    const canonicalLines = Buffer.from(record.lines.map((line) => line.text).join("\n"), "utf8");
    if (!source.equals(canonicalLines)) throw new Error(`${slug}: canonical lines differ from executed source bytes.`);
    if (record.code_sha256 !== sha256(source)) throw new Error(`${slug}: code_sha256 differs from executed source bytes.`);
    documents.push({ schema_version: "2.0.0", artifact_type: "PythonArtifact", record });
  }

  const errors = validateRegistry(documents);
  if (errors.length > 0) {
    throw new Error(`validateRegistry rejected pilot envelopes:\n${JSON.stringify(errors, null, 2)}`);
  }

  const resolver = await readJson(path.join(EVIDENCE_ROOT, "EVIDENCE_RESOLVER.json"));
  if (resolver.records.length !== 12) throw new Error(`Expected 12 evidence resolver records; found ${resolver.records.length}.`);
  const resolverById = new Map(resolver.records.map((record) => [record.evidence_id, record]));
  if (resolverById.size !== resolver.records.length) throw new Error("Evidence resolver contains duplicate stable IDs.");
  for (const { record } of documents) {
    for (const reference of [record.author_run_ref, record.independent_rerun_ref]) {
      const evidence = resolverById.get(reference);
      if (!evidence) throw new Error(`${record.python_artifact_id}: unresolved execution evidence ${reference}.`);
      if (evidence.python_artifact_id !== record.python_artifact_id) {
        throw new Error(`${record.python_artifact_id}: evidence ${reference} resolves to another artifact.`);
      }
      if (evidence.code_sha256 !== record.code_sha256 || evidence.execution_log_sha256 !== record.execution_log_sha256) {
        throw new Error(`${record.python_artifact_id}: stale execution evidence ${reference}.`);
      }
      const evidenceFile = path.join(WORKSPACE_ROOT, evidence.evidence_file);
      if (sha256(await readFile(evidenceFile)) !== evidence.evidence_file_sha256) {
        throw new Error(`${record.python_artifact_id}: evidence file hash is stale for ${reference}.`);
      }
    }
    if (JSON.stringify(record.normal_boundary_failure_coverage) !== JSON.stringify({ normal: true, boundary: true, failure: true })) {
      throw new Error(`${record.python_artifact_id}: case coverage must be three true booleans.`);
    }
    const fixtureIds = new Set(record.fixtures.map((fixture) => fixture.fixture_id));
    const outputCases = new Set(record.expected_outputs.map((output) => output.fixture_ref));
    if (CASES.some((caseKind) => !record.fixtures.some((fixture) => fixture.case_kind === caseKind))) {
      throw new Error(`${record.python_artifact_id}: missing a normal/boundary/failure fixture.`);
    }
    if (fixtureIds.size !== 3 || outputCases.size !== 3 || [...fixtureIds].some((id) => !outputCases.has(id))) {
      throw new Error(`${record.python_artifact_id}: fixture/expected-output join is incomplete.`);
    }
  }

  console.log(JSON.stringify({
    decision: "PASS",
    checker_mode: "READ_ONLY",
    validate_registry: "PASS_6_OF_6",
    canonical_schema_shape: "PASS_6_OF_6",
    exact_source_bytes: "PASS_6_OF_6",
    evidence_refs_resolved: "PASS_12_OF_12",
  }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
