import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const stage9Dir = path.dirname(fileURLToPath(import.meta.url));
const computerRoot = path.resolve(stage9Dir, '../../../..');
const appRoot = path.join(computerRoot, 'A_Level_CS_page', 'algocore-fumadocs');
const sha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const manifestPath = path.join(stage9Dir, 'RELEASE_MANIFEST.json');
const [manifest, registry, status, inputLock, registryQa, pedagogyQa, uxQa, foundationReview, supportReview, pedagogyClosure, a8Rerun] = await Promise.all([
  readJson(manifestPath),
  readJson(path.join(appRoot, 'app/data/stage9-learning-pages.json')),
  readJson(path.join(stage9Dir, 'STATUS.json')),
  readJson(path.join(stage9Dir, 'S9_INPUT_LOCK.json')),
  readJson(path.join(stage9Dir, 'evidence/s9-a/S9A_VERIFICATION.json')),
  readJson(path.join(stage9Dir, 'evidence/s9-d/pedagogy/PEDAGOGY_DETERMINISTIC_VERIFICATION.json')),
  readJson(path.join(stage9Dir, 'evidence/s9-d/ux/UX_RECHECK.json')),
  readJson(path.join(stage9Dir, 'evidence/s9-r3/REVIEW_FOUNDATIONS_TEXT_SEARCH.json')),
  readJson(path.join(stage9Dir, 'evidence/s9-r3/REVIEW_SUPPORT_STACK.json')),
  readJson(path.join(stage9Dir, 'evidence/s9-d/pedagogy/PEDAGOGY_R32_LEAD_CLOSURE.json')),
  readJson(path.join(stage9Dir, 'evidence/s9-e/A8_R32_LEAD_RERUN.json'))
]);

const fileChecks = await Promise.all(manifest.files.map(async (record) => {
  const file = path.join(computerRoot, record.path);
  const actual = await sha256(file);
  return { path: record.path, expected: record.sha256, actual, matches: actual === record.sha256 };
}));
const inputChecks = await Promise.all(inputLock.inputs.map(async (record) => {
  const file = path.join(path.dirname(stage9Dir), record.path);
  const actual = await sha256(file);
  return { path: record.path, expected: record.sha256, actual, matches: actual === record.sha256 };
}));
const checks = {
  release_id: manifest.release_id === 'paper4-2026-s9-v1',
  counts: registry.counts.packages === 13 && registry.counts.lessons === 26 && registry.counts.patterns === 58 && registry.counts.blocks === 260,
  manifest_files: fileChecks.every((item) => item.matches),
  input_lock: inputChecks.every((item) => item.matches),
  status_locked: status.status === 'RELEASE_LOCKED' && status.required_open_findings === 0,
  registry_qa: registryQa.decision === 'PASS' && registryQa.required_open_findings === 0,
  pedagogy_qa: pedagogyQa.decision === 'PASS' && pedagogyQa.required_open_findings === 0 && pedagogyQa.scope.remediated_lessons_deep_check === 26,
  ux_qa: uxQa.decision === 'PASS' && uxQa.required_open_findings === 0,
  r3_cross_reviews: foundationReview.decision === 'PASS' && supportReview.decision === 'PASS',
  pedagogy_closure: pedagogyClosure.decision === 'PASS_AFTER_REWORK' && pedagogyClosure.required_open_findings === 0,
  a8_rerun: a8Rerun.decision === 'PASS_AFTER_REWORK' && a8Rerun.required_open_findings === 0
};
const decision = Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL';
const report = {
  schema_version: 's9-release-verification-v1',
  release_id: manifest.release_id,
  generated_at: new Date().toISOString(),
  manifest_sha256: await sha256(manifestPath),
  files_checked: fileChecks.length,
  file_mismatches: fileChecks.filter((item) => !item.matches),
  inputs_checked: inputChecks.length,
  input_mismatches: inputChecks.filter((item) => !item.matches),
  checks,
  required_open_findings: decision === 'PASS' ? 0 : 1,
  decision
};
await writeFile(path.join(stage9Dir, 'RELEASE_VERIFICATION.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Stage 9 detached release verification: ${decision}; files=${report.files_checked}; inputs=${report.inputs_checked}.`);
if (decision !== 'PASS') process.exitCode = 1;
