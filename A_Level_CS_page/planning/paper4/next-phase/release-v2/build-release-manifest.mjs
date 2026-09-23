import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLANNING_ROOT = path.resolve(HERE, "..");
const APP_ROOT = path.resolve(HERE, "..", "..", "..", "..", "algocore-fumadocs");
const RELEASE_ID = "paper4-2026-s9-v2";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const readJson = async (filename) => JSON.parse(await readFile(filename, "utf8"));
const git = (...args) => execFileSync("git", ["-C", APP_ROOT, ...args], { encoding: "utf8" }).trim();

const status = git("status", "--porcelain");
if (status) throw new Error(`App candidate is not clean:\n${status}`);
const commit = git("rev-parse", "HEAD");
const branch = git("branch", "--show-current");
const tracked = execFileSync("git", ["-C", APP_ROOT, "ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean).sort();
const appFiles = [];
for (const relativePath of tracked) {
  const bytes = await readFile(path.join(APP_ROOT, relativePath));
  appFiles.push({ path: relativePath.replaceAll("\\", "/"), sha256: sha256(bytes), bytes: bytes.byteLength });
}

const releaseInputs = await readJson(path.join(HERE, "RELEASE_INPUTS.json"));
const attestations = [];
for (const relativePath of releaseInputs.attestation_paths) {
  const absolutePath = path.join(PLANNING_ROOT, relativePath);
  const bytes = await readFile(absolutePath);
  attestations.push({ path: relativePath.replaceAll("\\", "/"), sha256: sha256(bytes), bytes: bytes.byteLength });
}

const [course, fullRegistry, packageJson, packageLock] = await Promise.all([
  readJson(path.join(APP_ROOT, "app", "data", "paper4-v2", "course-manifest.json")),
  Promise.all([
    "knowledge-units.json", "python-artifacts.json", "visual-scenario-traces.json", "visual-event-bindings.json",
    "marking-chains.json", "assessment-items.json", "lesson-release-records.json",
  ].map((filename) => readJson(path.join(APP_ROOT, "content", "paper4", "records", "full", filename)))),
  readJson(path.join(APP_ROOT, "package.json")),
  readJson(path.join(APP_ROOT, "package-lock.json")),
]);
const [knowledge, pythonArtifacts, traces, events, markingChains, assessments, releases] = fullRegistry.map((items) => items.map((item) => item.record));
const lessonDtos = await Promise.all(course.lessons.map((lesson) => readJson(path.join(APP_ROOT, "app", "data", "paper4-v2", "lessons", `${lesson.slug}.json`))));
const counts = {
  packages: course.counts.packages,
  lessons: course.counts.lessons,
  locale_routes: course.counts.lessons * 2,
  canonical_sections_per_lesson: course.counts.sections_per_lesson,
  knowledge_units: knowledge.length,
  python_artifacts: pythonArtifacts.length,
  python_fixtures: pythonArtifacts.reduce((sum, artifact) => sum + artifact.fixtures.length, 0),
  patterns: course.counts.patterns,
  visual_scenarios: traces.length,
  visual_events: events.length,
  marking_chains: markingChains.length,
  marking_atoms: markingChains.reduce((sum, chain) => sum + chain.marking_atoms.length, 0),
  assessment_items: assessments.length,
  lesson_release_records: releases.length,
  retrieval_loops: lessonDtos.reduce((sum, lesson) => sum + lesson.retrieval.items.length, 0),
};
const expected = { packages: 13, lessons: 26, locale_routes: 52, canonical_sections_per_lesson: 10, knowledge_units: 108, python_artifacts: 26, python_fixtures: 78, patterns: 58, visual_scenarios: 174, visual_events: 589, marking_chains: 58, marking_atoms: 2236, assessment_items: 78, lesson_release_records: 26, retrieval_loops: 108 };
if (JSON.stringify(counts) !== JSON.stringify(expected)) throw new Error(`Release exact sets differ: ${JSON.stringify(counts)}`);

const dependencySnapshot = {
  schema_version: "paper4-dependency-snapshot-v1",
  release_id: RELEASE_ID,
  candidate_commit: commit,
  node_pin: (await readFile(path.join(APP_ROOT, ".node-version"), "utf8")).trim(),
  package_manager: packageJson.packageManager ?? "npm (package-lock)",
  package_lock_version: packageLock.lockfileVersion,
  package_json_sha256: sha256(await readFile(path.join(APP_ROOT, "package.json"))),
  package_lock_sha256: sha256(await readFile(path.join(APP_ROOT, "package-lock.json"))),
  dependencies: packageJson.dependencies,
  dev_dependencies: packageJson.devDependencies,
};
await mkdir(HERE, { recursive: true });
await writeFile(path.join(HERE, "DEPENDENCY_SNAPSHOT.json"), jsonText(dependencySnapshot), "utf8");

const aggregate = sha256(appFiles.map((file) => `${file.sha256}  ${file.path}\n`).join(""));
const manifest = {
  schema_version: "paper4-release-manifest-v2",
  release_id: RELEASE_ID,
  status: "RELEASED",
  release_allowed: true,
  supersedes: "paper4-2026-s9-v1",
  supersession_reason: "Post-release audit found missing first-class Python/theory coverage and non-canonical visual/runtime evidence in v1; v2 replaces that release after recovery gates P4R-0 through P4R-7.",
  rollback_target: { release_id: RELEASE_ID, app_commit: commit, rule: "Rollback only to this detached-verified v2 commit; do not restore v1 as a content-complete release." },
  candidate: { app_commit: commit, branch, git_status: "CLEAN", node_required: packageJson.engines.node },
  counts,
  canonical_registry_sha256: course.canonical_registry_sha256,
  compiler_input_semantic_sha256: course.compiler_input_semantic_sha256,
  app_bom: { scope: "all tracked files in the nested app repository", file_count: appFiles.length, aggregate_sha256: aggregate, files: appFiles },
  attestations,
  dependency_snapshot: { path: "release-v2/DEPENDENCY_SNAPSHOT.json", sha256: sha256(jsonText(dependencySnapshot)) },
  review: { a6: "PASS", a7: "PASS", a8: "PASS", lead_gate: "PASS", required_open_findings: 0 },
  known_non_scope: ["accounts", "learner progress persistence", "arbitrary Python execution", "public deployment"],
};
await writeFile(path.join(HERE, "RELEASE_MANIFEST.json"), jsonText(manifest), "utf8");
console.log(JSON.stringify({ decision: "BUILT", release_id: RELEASE_ID, candidate_commit: commit, app_files: appFiles.length, app_bom_sha256: aggregate, attestations: attestations.length, counts }, null, 2));
