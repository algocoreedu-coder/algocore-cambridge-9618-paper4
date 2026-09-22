import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const planningRoot = path.resolve(appRoot, '..', 'planning', 'paper4');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const [runtime, lessons, stage3, eventMap] = await Promise.all([
  readJson(path.join(appRoot, 'app', 'data', 'stage8-runtime-registry.json')),
  readJson(path.join(appRoot, 'app', 'data', 'stage9-learning-pages.json')),
  readJson(path.join(planningRoot, 'stage-3', 'LESSON_PACKAGES.json')),
  readJson(path.join(planningRoot, 'stage-7', 'EVENT_TYPE_MAPPING.json')),
]);
const events = runtime.patterns.flatMap((pattern) => pattern.events);
const clonedScenarioPatterns = runtime.patterns.filter((pattern) => {
  const signatures = pattern.scenarios.map((scenario) => JSON.stringify({
    trace_id: scenario.trace_id,
    example_id: scenario.example_id,
    event_ids: scenario.event_ids,
  }));
  return new Set(signatures).size === 1;
});
const mapping = eventMap.source_event_labels;
const vocabularyFailures = events.filter((event) => mapping[event.source_event_label] !== event.event_type);
const contractCodeEvents = events.filter((event) => event.code_lines.every((line) => !/[=():]|\b(if|for|while|return|def|class|with|try)\b/.test(line)));
const emptyState = (value) => value && typeof value === 'object' && !Array.isArray(value)
  && value.state && typeof value.state === 'object' && !Array.isArray(value.state)
  && Object.keys(value.state).length === 0;
const emptyStateEvents = events.filter((event) => emptyState(event.before) && emptyState(event.after));
const knowledgeBlocks = stage3.lessons.flatMap((lesson) => lesson.blocks);
const findings = [
  { id: 'P4R-P0-VISUAL-CLONE', actual: clonedScenarioPatterns.length, expected: 0 },
  { id: 'P4R-P0-EVENT-VOCAB', actual: vocabularyFailures.length, expected: 0 },
  { id: 'P4R-P0-CODE-BINDING', actual: contractCodeEvents.length, expected: 0 },
  { id: 'P4R-P0-EMPTY-STATE', actual: emptyStateEvents.length, expected: 0 },
].map((finding) => ({ ...finding, status: finding.actual === finding.expected ? 'CLOSED' : 'OPEN' }));
const report = {
  schema_version: 'paper4-recovery-read-only-baseline-v1',
  counts: {
    packages: lessons.counts.packages,
    lessons: lessons.counts.lessons,
    knowledge_blocks: knowledgeBlocks.length,
    patterns: runtime.counts.patterns,
    scenarios: runtime.counts.scenarios,
    events: runtime.counts.unique_events,
    cloned_scenario_patterns: clonedScenarioPatterns.length,
    event_vocabulary_or_type_failures: vocabularyFailures.length,
    non_python_code_binding_events: contractCodeEvents.length,
    empty_before_after_state_events: emptyStateEvents.length,
    null_output_events: events.filter((event) => event.output_delta === null).length,
  },
  findings,
  decision: findings.some((finding) => finding.status === 'OPEN') ? 'REWORK_REQUIRED' : 'PASS',
};
console.log(JSON.stringify(report, null, 2));
if (report.decision !== 'REWORK_REQUIRED') process.exitCode = 1;
