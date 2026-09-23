import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLANNING_ROOT = path.resolve(HERE, "..");
const APP_ROOT = path.resolve(HERE, "..", "..", "..", "..", "algocore-fumadocs");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const manifestBytes = await readFile(path.join(HERE, "RELEASE_MANIFEST.json"));
const manifest = JSON.parse(manifestBytes);
const failures = [];
const check = (condition, code, detail) => { if (!condition) failures.push({ code, detail }); };
const git = (...args) => execFileSync("git", ["-C", APP_ROOT, ...args], { encoding: "utf8" }).trim();

check(manifest.release_id === "paper4-2026-s9-v2", "RELEASE_ID", manifest.release_id);
check(manifest.status === "RELEASED" && manifest.release_allowed === true, "RELEASE_STATE", `${manifest.status}/${manifest.release_allowed}`);
check(manifest.supersedes === "paper4-2026-s9-v1", "SUPERSESSION", manifest.supersedes);
check(manifest.review?.a6 === "PASS" && manifest.review?.a7 === "PASS" && manifest.review?.a8 === "PASS" && manifest.review?.lead_gate === "PASS" && manifest.review?.required_open_findings === 0, "REVIEW_GATE", JSON.stringify(manifest.review));
check(git("rev-parse", "HEAD") === manifest.candidate.app_commit, "COMMIT_DRIFT", git("rev-parse", "HEAD"));
check(git("status", "--porcelain") === "", "DIRTY_APP", git("status", "--porcelain"));

const bomLines = [];
for (const file of manifest.app_bom.files) {
  try {
    const bytes = await readFile(path.join(APP_ROOT, file.path));
    check(bytes.byteLength === file.bytes, "BOM_SIZE", file.path);
    check(sha256(bytes) === file.sha256, "BOM_HASH", file.path);
    bomLines.push(`${file.sha256}  ${file.path}\n`);
  } catch (error) {
    failures.push({ code: "BOM_FILE_MISSING", detail: `${file.path}: ${error.message}` });
  }
}
check(manifest.app_bom.file_count === manifest.app_bom.files.length, "BOM_COUNT", `${manifest.app_bom.file_count}/${manifest.app_bom.files.length}`);
check(sha256(bomLines.join("")) === manifest.app_bom.aggregate_sha256, "BOM_AGGREGATE", manifest.app_bom.aggregate_sha256);
for (const file of manifest.attestations) {
  try {
    const bytes = await readFile(path.join(PLANNING_ROOT, file.path));
    check(bytes.byteLength === file.bytes, "ATTESTATION_SIZE", file.path);
    check(sha256(bytes) === file.sha256, "ATTESTATION_HASH", file.path);
  } catch (error) {
    failures.push({ code: "ATTESTATION_MISSING", detail: `${file.path}: ${error.message}` });
  }
}
const dependencyBytes = await readFile(path.join(PLANNING_ROOT, manifest.dependency_snapshot.path));
check(sha256(dependencyBytes) === manifest.dependency_snapshot.sha256, "DEPENDENCY_SNAPSHOT_HASH", manifest.dependency_snapshot.path);

const report = {
  schema_version: "paper4-detached-release-verification-v1",
  decision: failures.length === 0 ? "PASS" : "FAIL",
  release_id: manifest.release_id,
  manifest_sha256: sha256(manifestBytes),
  candidate_commit: manifest.candidate.app_commit,
  app_files_verified: manifest.app_bom.files.length,
  attestations_verified: manifest.attestations.length,
  failures,
};
console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;
