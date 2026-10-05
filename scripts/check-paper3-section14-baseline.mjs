import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE = path.resolve(ROOT, '../planning/paper3-2026/completion-program-2026/evidence/section14');
const CH13 = path.resolve(EVIDENCE, '../chapter13');
const BASELINE = path.join(EVIDENCE, 'QA_BASELINE.json');
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const sha = async file => createHash('sha256').update(await readFile(path.join(ROOT, file))).digest('hex');
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

await mkdir(EVIDENCE, { recursive: true });
if (process.argv.includes('--capture')) {
  const accepted = await json(path.join(CH13, 'CANDIDATE_2aMmNTbUnjBrrE8IW5KCZ.json'));
  const status = await json(path.join(ROOT, 'content/paper3/lesson-status.json'));
  const chapter13Entries = status.lessons.filter(item => item.topicId.startsWith('P3-13.'));
  if (chapter13Entries.length !== 11) throw Error('Expected exactly eleven Chapter13 baseline status entries');
  const chapter13Content = Object.fromEntries(await Promise.all(chapter13Entries.map(async item => {
    const file = `content/paper3/lessons/${item.slug}.json`;
    return [file, await sha(file)];
  })));
  const preservedFiles = [
    'app/lib/paper3/visual-models.ts',
    ...['ConceptWorkbench.tsx', 'FileWorkbench.tsx', 'FileWorkbench.module.css', 'FloatWorkbench.tsx', 'NumericWorkbench.tsx', 'VisualPrimitives.tsx', 'LessonCheckpoints.tsx'].map(file => `app/components/paper3-learning/lessons/${file}`),
    'app/components/paper3-learning/Chapter13Overview.tsx',
    'app/components/paper3-learning/Chapter13Overview.module.css',
  ];
  const chapter13Implementation = Object.fromEntries(await Promise.all(preservedFiles.map(async file => [file, await sha(file)])));
  const protectedFiles = Object.fromEntries(await Promise.all(accepted.protectedFiles.map(async item => [item.file, await sha(item.file)])));
  const trackedIntegration = Object.fromEntries(await Promise.all(Object.keys(accepted.files).filter(file => !(file in chapter13Content) && !(file in chapter13Implementation)).map(async file => [file, await sha(file)])));
  for (const file of ['app/lib/paper3/lesson-types.ts', 'package.json', 'next.config.mjs', 'source.config.ts']) {
    try { trackedIntegration[file] = await sha(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const historicalDifferences = Object.entries({ ...chapter13Content, ...chapter13Implementation, ...protectedFiles, ...trackedIntegration }).filter(([file, hash]) => {
    const old = accepted.files[file] ?? accepted.protectedFiles.find(item => item.file === file)?.sha256;
    return old && old !== hash;
  }).map(([file, current]) => ({ file, current, accepted: accepted.files[file] ?? accepted.protectedFiles.find(item => item.file === file)?.sha256 }));
  const report = {
    schemaVersion: 1, capturedAt: new Date().toISOString(), scope: 'Section14 regression baseline, not a Section14 acceptance result',
    appRoot: ROOT, chapter13AcceptedBuild: accepted.buildId,
    chapter13Entries, chapter13Content, chapter13Implementation, protectedFiles, trackedIntegration, historicalDifferences,
    policies: {
      chapter13: 'Preserve all eleven lesson hashes and exact status entries; appending Section14 entries is allowed only after its gates.',
      protected: 'Protected DS2/shared/Paper4 changes fail this baseline comparison and require root review, not automatic re-baselining.',
      integration: 'Record legitimate shell/dispatch/catalog/status differences for targeted review, without treating all expected integration as a failure.',
      build: 'Browser evidence must use a new isolated Section13+14 snapshot; original/snapshot hashes and served HTML BUILD_ID must match. Never rebuild a running output directory.',
    },
  };
  await writeFile(BASELINE, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ baseline: BASELINE, content: 11, implementation: preservedFiles.length, protected: Object.keys(protectedFiles).length, trackedIntegration: Object.keys(trackedIntegration).length, historicalDifferences }, null, 2));
} else {
  const baseline = await json(BASELINE);
  const status = await json(path.join(ROOT, 'content/paper3/lesson-status.json'));
  const failures = [];
  const changes = [];
  const acceptedConcurrentDeltas = [];
  let declared;
  try { declared = await json(path.join(EVIDENCE, 'QA_DECLARED_CONCURRENT_DELTA.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const group of ['chapter13Content', 'chapter13Implementation', 'protectedFiles', 'trackedIntegration']) {
    for (const [file, expected] of Object.entries(baseline[group])) {
      let actual;
      try { actual = await sha(file); } catch (error) { actual = `UNREADABLE:${error.code}`; }
      if (actual !== expected) {
        if (group === 'protectedFiles' && file === 'package.json' && declared?.file === file && expected === declared.baselineSha256 && actual === declared.authoringSha256) acceptedConcurrentDeltas.push(declared);
        else (group === 'trackedIntegration' ? changes : failures).push({ group, file, expected, actual });
      }
    }
  }
  const actualEntries = status.lessons.filter(item => item.topicId.startsWith('P3-13.'));
  if (actualEntries.length !== 11) failures.push({ group: 'chapter13Entries', expected: 11, actual: actualEntries.length });
  for (const expected of baseline.chapter13Entries) {
    const actual = actualEntries.filter(item => item.topicId === expected.topicId);
    if (actual.length !== 1 || !equal(actual[0], expected)) failures.push({ group: 'chapter13Entries', expected, actual });
  }
  const report = { checkedAt: new Date().toISOString(), decision: failures.length ? 'FAIL' : 'PASS', scope: 'Baseline preservation only, not Section14 correctness or browser acceptance', failures, acceptedConcurrentDeltas, integrationChangesRequiringReview: changes, currentStatusEntries: status.lessons.length };
  await writeFile(path.join(EVIDENCE, 'QA_BASELINE_CHECK.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
}
