import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
let current = HERE;
let workspace;
for (;;) {
  try {
    const names = await readdir(path.join(current, "A_Level_CS_page"));
    if (names.includes("algocore-fumadocs") && names.includes("planning")) {
      workspace = current;
      break;
    }
  } catch {}
  const parent = path.dirname(current);
  if (parent === current) throw new Error("WORKSPACE_ROOT_NOT_FOUND");
  current = parent;
}

const app = path.join(workspace, "A_Level_CS_page/algocore-fumadocs");
const { validateRegistry } = await import(pathToFileURL(path.join(app, "scripts/check-paper4-v2-schema.mjs")));
const pilot = path.join(app, "content/paper4/python/pilot");
const expected = ["data-models", "binary-search", "queue", "recursion", "hashing", "object-files"];
const documents = [];
const discovered = [];
for (const slug of expected) {
  const artifactPath = path.join(pilot, slug, "artifact.json");
  if (!existsSync(artifactPath)) continue;
  discovered.push(slug);
  const value = JSON.parse(await readFile(artifactPath, "utf8"));
  documents.push(value.artifact_type ? value : {
    schema_version: "2.0.0",
    artifact_type: "PythonArtifact",
    record: value,
  });
}
const errors = validateRegistry(documents);
process.stdout.write(`${JSON.stringify({
  mode: "READ_ONLY_PROBE",
  expected_pilot_lessons: expected,
  discovered_pilot_lessons: discovered,
  documents_validated: documents.length,
  decision: discovered.length === expected.length && errors.length === 0 ? "PASS" : "REWORK_REQUIRED",
  error_count: errors.length,
  errors,
}, null, 2)}\n`);
if (discovered.length !== expected.length || errors.length) process.exitCode = 1;
