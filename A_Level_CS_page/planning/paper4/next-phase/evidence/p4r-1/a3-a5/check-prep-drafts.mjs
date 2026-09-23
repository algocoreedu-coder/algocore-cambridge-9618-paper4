import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const paper4 = path.resolve(here, '../../../..');
const appRoot = path.resolve(paper4, '../../algocore-fumadocs');
const read = (absolute) => fs.readFileSync(absolute, 'utf8');
const json = (absolute) => JSON.parse(read(absolute));
const sha = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');
const normalise = (value) => value.replaceAll('\r\n', '\n').replaceAll('\r', '\n').replace(/\s+$/u, '');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const learning = json(path.join(appRoot, 'app/data/stage9-learning-pages.json'));
const runtime = json(path.join(appRoot, 'app/data/stage8-runtime-registry.json'));
const mapping = json(path.join(paper4, 'stage-7/EVENT_TYPE_MAPPING.json')).source_event_labels;
const python = json(path.join(here, 'PYTHON_EXECUTION_MAP_DRAFT.json'));
const visual = json(path.join(here, 'VISUAL_MIGRATION_INVENTORY.json'));

check(python.authority === 'A3_A5_PREPARATION_ONLY', 'Python draft authority changed');
check(python.status === 'DRAFT_NOT_RUNTIME_VERIFIED', 'Python draft must not claim runtime verification');
check(python.lessons.length === 26 && python.counts.lessons === 26, 'Python lesson denominator is not 26');
check(new Set(python.lessons.map((item) => item.lesson_id)).size === 26, 'Python lesson IDs are not unique');
check(python.counts.exact_hash_match_lessons === 0, 'Unexpected exact hash match; inspect run/hash chain before promotion');
check(python.counts.rerun_required_lessons === 26, 'All current displayed artifacts must remain RERUN_REQUIRED');

for (const lesson of learning.lessons) {
  const draft = python.lessons.find((item) => item.lesson_id === lesson.lessonId);
  check(Boolean(draft), `Missing Python inventory lesson ${lesson.lessonId}`);
  if (!draft) continue;
  const block = lesson.blocks.find((item) => item.kind === 'worked-example');
  const vi = block?.content?.vi?.workedExample;
  const en = block?.content?.en?.workedExample;
  const viValue = vi?.python ?? vi?.code ?? [];
  const enValue = en?.python ?? en?.code ?? [];
  const viText = normalise((Array.isArray(viValue) ? viValue : String(viValue).split(/\r?\n/u)).join('\n'));
  const enText = normalise((Array.isArray(enValue) ? enValue : String(enValue).split(/\r?\n/u)).join('\n'));
  check(draft.displayed_python.normalized_sha256 === sha(viText), `Displayed code hash drift: ${lesson.slug}`);
  check(draft.displayed_python.locale_identity === (viText === enText), `Locale identity drift: ${lesson.slug}`);
  check(draft.execution_claim_allowed === false, `Execution claim is not allowed: ${lesson.slug}`);
  check(draft.execution_disposition === 'RERUN_REQUIRED', `Unexpected disposition: ${lesson.slug}`);
  for (const candidate of draft.stage5_candidates) {
    for (const comparison of candidate.source_comparisons) {
      const sourcePath = path.join(paper4, comparison.path);
      check(fs.existsSync(sourcePath), `Missing Stage 5 candidate source ${comparison.path}`);
      if (!fs.existsSync(sourcePath)) continue;
      const sourceText = normalise(read(sourcePath));
      const sourceHash = sha(read(sourcePath));
      check(comparison.source_sha256 === sourceHash, `Stage 5 source hash drift ${comparison.path}`);
      check(comparison.full_source_hash_match === (sourceHash === sha(viText)), `Full hash comparison drift ${lesson.slug} -> ${comparison.path}`);
      check(comparison.verbatim_substring_match === sourceText.includes(viText), `Substring comparison drift ${lesson.slug} -> ${comparison.path}`);
    }
  }
}

const sourcePatterns = runtime.patterns;
const sourceScenarios = sourcePatterns.flatMap((item) => item.scenarios);
const sourceEvents = sourcePatterns.flatMap((item) => item.events);
const draftScenarios = visual.patterns.flatMap((item) => item.scenarios);
const draftEvents = visual.patterns.flatMap((item) => item.events);
check(visual.counts.patterns === 58 && visual.patterns.length === 58, 'Visual pattern denominator is not 58');
check(visual.counts.scenarios === 174 && draftScenarios.length === 174, 'Visual scenario denominator is not 174');
check(visual.counts.events === 331 && draftEvents.length === 331, 'Visual event denominator is not 331');
check(new Set(visual.patterns.map((item) => item.pattern_id)).size === 58, 'Pattern IDs are not unique');
check(new Set(draftScenarios.map((item) => item.scenario_id)).size === 174, 'Scenario IDs are not unique');
check(new Set(draftEvents.map((item) => item.event_id)).size === 331, 'Event IDs are not unique');
check(new Set(sourcePatterns.map((item) => item.pattern_id)).size === 58, 'Runtime source pattern drift');
check(new Set(sourceScenarios.map((item) => item.scenario_id)).size === 174, 'Runtime source scenario drift');
check(new Set(sourceEvents.map((item) => item.event_id)).size === 331, 'Runtime source event drift');

const clonedTrace = sourcePatterns.filter((pattern) => new Set(pattern.scenarios.map((item) => item.trace_id)).size === 1).length;
const clonedSequence = sourcePatterns.filter((pattern) => new Set(pattern.scenarios.map((item) => JSON.stringify(item.event_ids))).size === 1).length;
const unmapped = sourceEvents.filter((event) => !mapping[event.source_event_label]).length;
const mapped = sourceEvents.filter((event) => Boolean(mapping[event.source_event_label])).length;
const mismatched = sourceEvents.filter((event) => mapping[event.source_event_label] && mapping[event.source_event_label] !== event.event_type).length;
const empty = (value) => value == null || value === '' || (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
const emptyBefore = sourceEvents.filter((event) => empty(event.before?.state)).length;
const emptyAfter = sourceEvents.filter((event) => empty(event.after?.state)).length;
const emptyOutput = sourceEvents.filter((event) => empty(event.output_delta)).length;

check(visual.counts.patterns_with_cloned_trace === clonedTrace && clonedTrace === 58, 'Cloned trace count drift');
check(visual.counts.patterns_with_cloned_event_sequence === clonedSequence && clonedSequence === 58, 'Cloned event sequence count drift');
check(visual.counts.unmapped_event_labels === unmapped && unmapped === 328, 'Unmapped event label count drift');
check(visual.counts.mapped_event_labels === mapped && mapped === 3, 'Mapped event label count drift');
check(visual.counts.mapped_event_type_mismatches === mismatched && mismatched === 3, 'Event type mismatch count drift');
check(visual.counts.non_python_code_token_events === 331, 'Code token finding count drift');
check(visual.counts.empty_before_states === emptyBefore && emptyBefore === 118, 'Empty before-state count drift');
check(visual.counts.empty_after_states === emptyAfter && emptyAfter === 118, 'Empty after-state count drift');
check(visual.counts.empty_output_deltas === emptyOutput && emptyOutput === 268, 'Empty output count drift');

for (const sourcePattern of sourcePatterns) {
  const draftPattern = visual.patterns.find((item) => item.pattern_id === sourcePattern.pattern_id);
  check(Boolean(draftPattern), `Missing visual pattern ${sourcePattern.pattern_id}`);
  if (!draftPattern) continue;
  for (const sourceScenario of sourcePattern.scenarios) {
    const draftScenario = draftPattern.scenarios.find((item) => item.scenario_id === sourceScenario.scenario_id);
    check(Boolean(draftScenario), `Missing visual scenario ${sourceScenario.scenario_id}`);
    if (!draftScenario) continue;
    check(draftScenario.trace_id === sourceScenario.trace_id, `Scenario trace drift ${sourceScenario.scenario_id}`);
    check(JSON.stringify(draftScenario.event_ids) === JSON.stringify(sourceScenario.event_ids), `Scenario event sequence drift ${sourceScenario.scenario_id}`);
  }
  for (const sourceEvent of sourcePattern.events) {
    const draftEvent = draftPattern.events.find((item) => item.event_id === sourceEvent.event_id);
    check(Boolean(draftEvent), `Missing visual event ${sourceEvent.event_id}`);
    if (!draftEvent) continue;
    const expectedType = mapping[sourceEvent.source_event_label] ?? null;
    check(draftEvent.source_event_label === sourceEvent.source_event_label, `Event label drift ${sourceEvent.event_id}`);
    check(draftEvent.event_type === sourceEvent.event_type, `Event type drift ${sourceEvent.event_id}`);
    check(draftEvent.canonical_event_type === expectedType, `Canonical type drift ${sourceEvent.event_id}`);
    check(JSON.stringify(draftEvent.code_line_refs) === JSON.stringify(sourceEvent.code_lines ?? []), `Code token drift ${sourceEvent.event_id}`);
    check(draftEvent.code_binding_status === 'NON_PYTHON_TOKEN_NO_ARTIFACT_VERSION_JOIN', `Unreviewed code binding promotion ${sourceEvent.event_id}`);
  }
}

for (const input of python.inputs) {
  let absolute;
  if (input.path.startsWith('algocore-fumadocs/')) absolute = path.join(path.resolve(paper4, '../..'), input.path);
  else absolute = path.join(paper4, input.path);
  check(fs.existsSync(absolute), `Missing Python input ${input.path}`);
  if (fs.existsSync(absolute)) check(sha(read(absolute)) === input.sha256, `Python input hash drift ${input.path}`);
}
for (const input of visual.inputs) {
  const absolute = input.path.startsWith('algocore-fumadocs/')
    ? path.join(path.resolve(paper4, '../..'), input.path)
    : path.join(paper4, input.path);
  check(fs.existsSync(absolute), `Missing visual input ${input.path}`);
  if (fs.existsSync(absolute)) check(sha(read(absolute)) === input.sha256, `Visual input hash drift ${input.path}`);
}

const result = {
  result: failures.length === 0 ? 'PASS_PREPARATION' : 'FAIL',
  read_only: true,
  counts: {
    lessons: python.lessons.length,
    rerun_required: python.counts.rerun_required_lessons,
    patterns: visual.patterns.length,
    scenarios: draftScenarios.length,
    events: draftEvents.length,
  },
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exitCode = 1;
