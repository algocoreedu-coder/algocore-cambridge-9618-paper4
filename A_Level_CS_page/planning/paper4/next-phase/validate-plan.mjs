import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..', '..', '..', 'algocore-fumadocs');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const [plan, status, lessons, runtime] = await Promise.all([
  readJson(path.join(here, 'BATCH_PLAN.json')),
  readJson(path.join(here, 'PROGRAM_STATUS.json')),
  readJson(path.join(appRoot, 'app', 'data', 'stage9-learning-pages.json')),
  readJson(path.join(appRoot, 'app', 'data', 'stage8-runtime-registry.json')),
]);
const failures = [];
const check = (condition, id, detail) => { if (!condition) failures.push({ id, detail }); };
const waveIds = plan.waves.map((wave) => wave.id);
check(new Set(waveIds).size === waveIds.length, 'PLAN-WAVE-UNIQUE', 'Wave IDs must be unique.');
for (const wave of plan.waves) {
  for (const dependency of wave.depends_on) check(waveIds.includes(dependency), 'PLAN-DEPENDENCY', `${wave.id} references ${dependency}.`);
}
const plannedSlugs = plan.content_batches.flatMap((batch) => batch.lessons);
const registrySlugs = lessons.lessons.map((lesson) => lesson.slug);
check(new Set(plannedSlugs).size === plannedSlugs.length, 'PLAN-LESSON-DUPLICATE', 'A lesson appears in more than one content batch.');
check(JSON.stringify([...plannedSlugs].sort()) === JSON.stringify([...registrySlugs].sort()), 'PLAN-LESSON-EXACT', 'Content batches must exactly cover the 26 registry slugs.');
check(plan.exact_denominators.packages === lessons.counts.packages, 'PLAN-PACKAGES', 'Package denominator mismatch.');
check(plan.exact_denominators.lessons === lessons.counts.lessons, 'PLAN-LESSONS', 'Lesson denominator mismatch.');
check(plan.exact_denominators.patterns === runtime.counts.patterns, 'PLAN-PATTERNS', 'Pattern denominator mismatch.');
check(plan.exact_denominators.scenarios === runtime.counts.scenarios, 'PLAN-SCENARIOS', 'Scenario denominator mismatch.');
check(plan.exact_denominators.legacy_events === runtime.counts.unique_events, 'PLAN-EVENTS', 'Event denominator mismatch.');
check(plan.target_release === status.target_release, 'PLAN-RELEASE-ID', 'Target release mismatch.');
check(status.release_allowed === false, 'PLAN-RELEASE-BLOCK', 'Release must stay blocked before execution.');
const report = {
  decision: failures.length ? 'FAIL' : 'PASS',
  checks: {
    waves: plan.waves.length,
    content_batches: plan.content_batches.length,
    exact_lesson_slugs: plannedSlugs.length,
    packages: lessons.counts.packages,
    patterns: runtime.counts.patterns,
    scenarios: runtime.counts.scenarios,
    events: runtime.counts.unique_events,
  },
  failures,
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
