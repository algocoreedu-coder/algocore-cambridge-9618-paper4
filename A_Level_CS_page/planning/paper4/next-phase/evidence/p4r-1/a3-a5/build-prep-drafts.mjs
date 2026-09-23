import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const paper4 = path.resolve(here, '../../../..');
const appRoot = path.resolve(paper4, '../../algocore-fumadocs');
const stage5 = path.join(paper4, 'stage-5');
const stage7 = path.join(paper4, 'stage-7');

const rel = (absolute) => path.relative(paper4, absolute).replaceAll('\\', '/');
const readText = (absolute) => fs.readFileSync(absolute, 'utf8');
const readJson = (absolute) => JSON.parse(readText(absolute));
const shaText = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');
const shaFile = (absolute) => shaText(readText(absolute));
const normaliseCode = (value) => value.replaceAll('\r\n', '\n').replaceAll('\r', '\n').replace(/\s+$/u, '');
const isEmpty = (value) => value == null || value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

function walk(directory, fileName, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute, fileName, found);
    else if (entry.name === fileName) found.push(absolute);
  }
  return found;
}

function existing(absolute) {
  return fs.existsSync(absolute) && fs.statSync(absolute).isFile();
}

function patternIds(registry) {
  const ids = [];
  for (const item of registry.patterns ?? []) {
    ids.push(typeof item === 'string' ? item : item.pattern_id);
  }
  for (const item of registry.implementations ?? []) ids.push(item.pattern_id);
  for (const item of registry.entry_point_bindings ?? []) ids.push(item.pattern_id);
  return [...new Set(ids.filter(Boolean))];
}

function sourcePathsForPattern(registryPath, registry, patternId) {
  const registryDir = path.dirname(registryPath);
  const batchDir = path.basename(registryDir) === 'implementation' ? path.dirname(registryDir) : registryDir;
  const candidates = [];
  const add = (candidate, base = batchDir) => {
    if (!candidate) return;
    const withoutSymbol = candidate.split('::')[0];
    const absolute = path.resolve(base, withoutSymbol);
    if (existing(absolute)) candidates.push(absolute);
  };
  add(registry.source_file);
  add(registry.entry_points);
  for (const item of registry.patterns ?? []) {
    if (typeof item === 'object' && item.pattern_id === patternId) add(item.implementation_path);
  }
  for (const item of registry.implementations ?? []) {
    if (item.pattern_id === patternId) add(item.module, registryDir);
  }
  if (candidates.length === 0) {
    for (const base of [path.join(batchDir, 'implementation'), registryDir]) {
      if (!fs.existsSync(base)) continue;
      for (const name of fs.readdirSync(base)) {
        const absolute = path.join(base, name);
        if (name.endsWith('.py') && existing(absolute)) candidates.push(absolute);
      }
    }
  }
  return [...new Set(candidates)];
}

const learningPath = path.join(appRoot, 'app/data/stage9-learning-pages.json');
const runtimePath = path.join(appRoot, 'app/data/stage8-runtime-registry.json');
const eventMapPath = path.join(stage7, 'EVENT_TYPE_MAPPING.json');
const learning = readJson(learningPath);
const runtime = readJson(runtimePath);
const eventMap = readJson(eventMapPath);

const stage5ByPattern = new Map();
for (const registryPath of walk(path.join(stage5, 'evidence'), 'IMPLEMENTATION_REGISTRY.json').sort()) {
  const registry = readJson(registryPath);
  const batchDir = registryPath.includes(`${path.sep}implementation${path.sep}`)
    ? path.dirname(path.dirname(registryPath))
    : path.dirname(registryPath);
  const authorRun = path.join(batchDir, 'runs/AUTHOR_RUN.json');
  const independentRun = path.join(batchDir, 'qa/A5_INDEPENDENT_RERUN.json');
  for (const patternId of patternIds(registry)) {
    const sourcePaths = sourcePathsForPattern(registryPath, registry, patternId);
    const candidate = {
      pattern_id: patternId,
      batch_id: registry.batch_id ?? path.basename(batchDir).toUpperCase(),
      implementation_registry_ref: rel(registryPath),
      implementation_registry_sha256: shaFile(registryPath),
      implementation_sources: sourcePaths.map((sourcePath) => ({
        path: rel(sourcePath),
        sha256: shaFile(sourcePath),
      })),
      author_run_ref: existing(authorRun) ? rel(authorRun) : null,
      independent_rerun_ref: existing(independentRun) ? rel(independentRun) : null,
      relationship: 'PATTERN_CANDIDATE_ONLY',
    };
    const list = stage5ByPattern.get(patternId) ?? [];
    list.push(candidate);
    stage5ByPattern.set(patternId, list);
  }
}

const pythonLessons = learning.lessons.map((lesson) => {
  const workedBlock = lesson.blocks.find((block) => block.kind === 'worked-example');
  const viExample = workedBlock?.content?.vi?.workedExample;
  const enExample = workedBlock?.content?.en?.workedExample;
  const viValue = viExample?.python ?? viExample?.code ?? [];
  const enValue = enExample?.python ?? enExample?.code ?? [];
  const viLines = Array.isArray(viValue) ? viValue : String(viValue).split(/\r?\n/u);
  const enLines = Array.isArray(enValue) ? enValue : String(enValue).split(/\r?\n/u);
  const viText = normaliseCode(viLines.join('\n'));
  const enText = normaliseCode(enLines.join('\n'));
  const candidates = lesson.patternIds.flatMap((patternId) => stage5ByPattern.get(patternId) ?? []);
  const compared = candidates.map((candidate) => {
    const sourceComparisons = candidate.implementation_sources.map((source) => {
      const absolute = path.join(paper4, source.path);
      const sourceText = normaliseCode(readText(absolute));
      return {
        path: source.path,
        source_sha256: source.sha256,
        full_source_hash_match: source.sha256 === shaText(viText),
        verbatim_substring_match: viText.length > 0 && sourceText.includes(viText),
      };
    });
    return { ...candidate, source_comparisons: sourceComparisons };
  });
  const exact = compared.filter((candidate) => candidate.source_comparisons.some((item) => item.full_source_hash_match));
  return {
    lesson_id: lesson.lessonId,
    slug: lesson.slug,
    pattern_ids: lesson.patternIds,
    displayed_python: {
      source_locator: `stage9-learning-pages.json#lesson=${lesson.lessonId}/block=worked-example`,
      code_field: viExample?.python ? 'python' : 'code',
      code_type: viExample?.codeType ?? 'python',
      locale_identity: viText === enText,
      line_count: viLines.length,
      lines: viLines.map((text, index) => ({ order: index + 1, text })),
      normalized_sha256: shaText(viText),
    },
    stage5_candidates: compared,
    exact_hash_matches: exact.map((candidate) => ({
      batch_id: candidate.batch_id,
      implementation_registry_ref: candidate.implementation_registry_ref,
      matched_sources: candidate.source_comparisons.filter((item) => item.full_source_hash_match).map((item) => item.path),
    })),
    execution_disposition: exact.length > 0 ? 'EXACT_HASH_MATCH_REVIEW_REQUIRED' : 'RERUN_REQUIRED',
    execution_claim_allowed: false,
    reason: exact.length > 0
      ? 'A full-source hash candidate exists, but run evidence must still prove that exact hash was executed.'
      : 'No Stage 5 implementation source has the same normalized SHA-256 as the currently displayed code. Pattern proximity is not execution evidence.',
  };
});

const pythonMap = {
  schema_version: 'p4r1-python-execution-map-draft-v1',
  authority: 'A3_A5_PREPARATION_ONLY',
  status: 'DRAFT_NOT_RUNTIME_VERIFIED',
  policy: {
    exact_match_rule: 'Displayed normalized UTF-8 source SHA-256 must equal the executed artifact source SHA-256. Pattern or entry-point similarity is insufficient.',
    claim_rule: 'This draft makes no execution claim. RERUN_REQUIRED remains until author and independent runs bind the displayed hash, fixtures, raw output and trace.',
  },
  inputs: [learningPath, ...walk(path.join(stage5, 'evidence'), 'IMPLEMENTATION_REGISTRY.json').sort()].map((absolute) => ({
    path: absolute === learningPath ? rel(absolute).replace(/^\.\.\/\.\.\/algocore-fumadocs\//u, 'algocore-fumadocs/') : rel(absolute),
    sha256: shaFile(absolute),
  })),
  counts: {
    lessons: pythonLessons.length,
    displayed_python_artifacts: pythonLessons.length,
    locale_identical_artifacts: pythonLessons.filter((item) => item.displayed_python.locale_identity).length,
    exact_hash_match_lessons: pythonLessons.filter((item) => item.exact_hash_matches.length > 0).length,
    rerun_required_lessons: pythonLessons.filter((item) => item.execution_disposition === 'RERUN_REQUIRED').length,
    lessons_with_stage5_pattern_candidates: pythonLessons.filter((item) => item.stage5_candidates.length > 0).length,
  },
  lessons: pythonLessons,
};

function stateStatus(value) {
  if (isEmpty(value)) return 'EMPTY';
  if (typeof value === 'object' && value?.status === 'PLANNED') return 'PLANNED_PLACEHOLDER';
  if (typeof value === 'object' && Object.hasOwn(value, 'additional_declared_fields')) return 'TEMPLATE_SHAPED';
  return 'POPULATED';
}

function outputStatus(value) {
  if (isEmpty(value)) return 'EMPTY';
  if (typeof value === 'object' &&
      (String(value.en ?? '').includes('preserve the invariant') || String(value.vi ?? '').includes('giữ bất biến'))) {
    return 'GENERIC_INVARIANT_PLACEHOLDER';
  }
  return 'CONCRETE';
}

const canonicalMap = eventMap.source_event_labels;
const visualPatterns = runtime.patterns.map((pattern) => {
  const traceIds = [...new Set(pattern.scenarios.map((scenario) => scenario.trace_id))];
  const sequenceHashes = [...new Set(pattern.scenarios.map((scenario) => shaText(JSON.stringify(scenario.event_ids))))];
  const scenarios = pattern.scenarios.map((scenario) => ({
    scenario_id: scenario.scenario_id,
    case_kind: scenario.case_kind,
    trace_id: scenario.trace_id,
    event_ids: scenario.event_ids,
    event_sequence_sha256: shaText(JSON.stringify(scenario.event_ids)),
    trace_cloned_across_case_kinds: traceIds.length === 1,
    event_sequence_cloned_across_case_kinds: sequenceHashes.length === 1,
  }));
  const events = pattern.events.map((event) => {
    const expected = canonicalMap[event.source_event_label] ?? null;
    return {
      event_id: event.event_id,
      trace_id: event.trace_id,
      sequence: event.sequence,
      source_event_label: event.source_event_label,
      event_type: event.event_type,
      canonical_event_type: expected,
      vocabulary_status: expected ? 'MAPPED' : 'UNMAPPED',
      event_type_status: expected == null ? 'UNVERIFIABLE_UNMAPPED_LABEL' : (expected === event.event_type ? 'MATCH' : 'MISMATCH'),
      code_line_refs: event.code_lines ?? [],
      code_binding_status: 'NON_PYTHON_TOKEN_NO_ARTIFACT_VERSION_JOIN',
      before_state_status: stateStatus(event.before?.state),
      after_state_status: stateStatus(event.after?.state),
      output_delta_status: outputStatus(event.output_delta),
      source_locator: event.source?.source_locator ?? null,
    };
  });
  return {
    pattern_id: pattern.pattern_id,
    source_batch: pattern.source_batch,
    source: pattern.source,
    counts: { scenarios: scenarios.length, events: events.length },
    cloned_scenario_finding: {
      same_trace_for_normal_boundary_failure: traceIds.length === 1,
      same_event_sequence_for_normal_boundary_failure: sequenceHashes.length === 1,
      distinct_trace_ids: traceIds,
      distinct_event_sequence_hashes: sequenceHashes,
    },
    scenarios,
    events,
  };
});

const allScenarios = visualPatterns.flatMap((pattern) => pattern.scenarios);
const allEvents = visualPatterns.flatMap((pattern) => pattern.events);
const visualInventory = {
  schema_version: 'p4r1-visual-migration-inventory-v1',
  authority: 'A3_A5_PREPARATION_ONLY',
  status: 'DRAFT_MIGRATION_REQUIRED',
  inputs: [runtimePath, eventMapPath].map((absolute) => ({ path: absolute === runtimePath ? 'algocore-fumadocs/app/data/stage8-runtime-registry.json' : rel(absolute), sha256: shaFile(absolute) })),
  classification_policy: {
    cloned_scenario: 'All three case kinds reuse one trace_id or one ordered event_ids sequence.',
    code_binding: 'Current event code_lines are inventory tokens only because no python_artifact_id, artifact_version or verified line-ID join exists.',
    empty_state: 'null, empty object or empty array.',
    event_vocabulary: 'Exact source_event_label lookup in stage-7/EVENT_TYPE_MAPPING.json.',
  },
  counts: {
    patterns: visualPatterns.length,
    scenarios: allScenarios.length,
    events: allEvents.length,
    unique_pattern_ids: new Set(visualPatterns.map((item) => item.pattern_id)).size,
    unique_scenario_ids: new Set(allScenarios.map((item) => item.scenario_id)).size,
    unique_event_ids: new Set(allEvents.map((item) => item.event_id)).size,
    patterns_with_cloned_trace: visualPatterns.filter((item) => item.cloned_scenario_finding.same_trace_for_normal_boundary_failure).length,
    patterns_with_cloned_event_sequence: visualPatterns.filter((item) => item.cloned_scenario_finding.same_event_sequence_for_normal_boundary_failure).length,
    unmapped_event_labels: allEvents.filter((item) => item.vocabulary_status === 'UNMAPPED').length,
    mapped_event_labels: allEvents.filter((item) => item.vocabulary_status === 'MAPPED').length,
    mapped_event_type_mismatches: allEvents.filter((item) => item.event_type_status === 'MISMATCH').length,
    valid_mapped_event_types: allEvents.filter((item) => item.event_type_status === 'MATCH').length,
    non_python_code_token_events: allEvents.filter((item) => item.code_binding_status !== 'VERIFIED_PYTHON_LINE_IDS').length,
    empty_before_states: allEvents.filter((item) => item.before_state_status === 'EMPTY').length,
    empty_after_states: allEvents.filter((item) => item.after_state_status === 'EMPTY').length,
    planned_before_placeholders: allEvents.filter((item) => item.before_state_status === 'PLANNED_PLACEHOLDER').length,
    planned_after_placeholders: allEvents.filter((item) => item.after_state_status === 'PLANNED_PLACEHOLDER').length,
    template_shaped_before_states: allEvents.filter((item) => item.before_state_status === 'TEMPLATE_SHAPED').length,
    template_shaped_after_states: allEvents.filter((item) => item.after_state_status === 'TEMPLATE_SHAPED').length,
    empty_output_deltas: allEvents.filter((item) => item.output_delta_status === 'EMPTY').length,
    generic_output_placeholders: allEvents.filter((item) => item.output_delta_status === 'GENERIC_INVARIANT_PLACEHOLDER').length,
    concrete_output_deltas: allEvents.filter((item) => item.output_delta_status === 'CONCRETE').length,
  },
  required_migration: [
    'Create scenario-specific normal, boundary and failure traces or document reviewed equivalence.',
    'Replace code contract/step tokens with active_line_ids joined to versioned PythonArtifact lines.',
    'Map every source event label to the canonical vocabulary and correct every event_type mismatch.',
    'Replace empty and placeholder state/output payloads with evidence-bound before/delta/after/output values.',
  ],
  patterns: visualPatterns,
};

fs.writeFileSync(path.join(here, 'PYTHON_EXECUTION_MAP_DRAFT.json'), `${JSON.stringify(pythonMap, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(here, 'VISUAL_MIGRATION_INVENTORY.json'), `${JSON.stringify(visualInventory, null, 2)}\n`, 'utf8');

const report = `# A3/A5 preparation review — P4R-1\n\n` +
`Status: **PREPARATION_COMPLETE / EXECUTION_AND_MIGRATION_REQUIRED**\n\n` +
`This is a read-only source audit. It does not claim that any displayed Stage 9 Python was executed.\n\n` +
`## Python execution disposition\n\n` +
`- Lessons inventoried: ${pythonMap.counts.lessons}/26.\n` +
`- Displayed Python artifacts inventoried: ${pythonMap.counts.displayed_python_artifacts}/26.\n` +
`- VI/EN code identity: ${pythonMap.counts.locale_identical_artifacts}/26.\n` +
`- Exact displayed-code/full-Stage-5-source hash matches: ${pythonMap.counts.exact_hash_match_lessons}/26.\n` +
`- Rerun required: ${pythonMap.counts.rerun_required_lessons}/26.\n` +
`- Lessons with Stage 5 pattern candidates: ${pythonMap.counts.lessons_with_stage5_pattern_candidates}/26. Candidate proximity is not execution evidence.\n\n` +
`Every current displayed snippet has a stable normalized SHA-256 in \`PYTHON_EXECUTION_MAP_DRAFT.json\`. None equals a complete Stage 5 implementation source hash, and none appears verbatim in those modules. A3 must promote each lesson to a canonical PythonArtifact, bind the displayed bytes to that artifact, then produce an author run and independent rerun for the same hash.\n\n` +
`## Visual migration findings\n\n` +
`- Patterns/scenarios/events: ${visualInventory.counts.patterns}/58, ${visualInventory.counts.scenarios}/174, ${visualInventory.counts.events}/331; all IDs are unique at their required level.\n` +
`- Patterns reusing one trace for normal, boundary and failure: ${visualInventory.counts.patterns_with_cloned_trace}/58.\n` +
`- Patterns reusing one event sequence for all three cases: ${visualInventory.counts.patterns_with_cloned_event_sequence}/58.\n` +
`- Events whose code reference is not joined to versioned Python line IDs: ${visualInventory.counts.non_python_code_token_events}/331.\n` +
`- Event labels outside the locked Stage 7 vocabulary: ${visualInventory.counts.unmapped_event_labels}/331.\n` +
`- Mapped labels with the wrong event_type: ${visualInventory.counts.mapped_event_type_mismatches}/${visualInventory.counts.mapped_event_labels}; valid mapped types: ${visualInventory.counts.valid_mapped_event_types}.\n` +
`- Empty before/after states: ${visualInventory.counts.empty_before_states}/${visualInventory.counts.empty_after_states}.\n` +
`- Planned placeholders before/after: ${visualInventory.counts.planned_before_placeholders}/${visualInventory.counts.planned_after_placeholders}.\n` +
`- Template-shaped before/after states: ${visualInventory.counts.template_shaped_before_states}/${visualInventory.counts.template_shaped_after_states}. These are flagged for review rather than automatically declared invalid.\n` +
`- Empty/generic/concrete output deltas: ${visualInventory.counts.empty_output_deltas}/${visualInventory.counts.generic_output_placeholders}/${visualInventory.counts.concrete_output_deltas}.\n\n` +
`The three mapped labels are \`CAPTURE_SOURCE_STATE\`, \`TEST_TERMINAL_STATE\` and \`EMIT_OBSERVABLE\`; each is currently typed \`assign\` instead of \`read\`, \`branch\` and \`emit\`.\n\n` +
`## Required next actions\n\n` +
`1. A3 creates 26 versioned PythonArtifact records and executable source files from the displayed examples or approved replacements.\n` +
`2. A3 runs normal, boundary and failure fixtures twice, records raw output/trace and binds all evidence to the exact displayed code hash.\n` +
`3. A5 creates 174 scenario-specific VisualScenarioTrace records. Shared traces require an explicit equivalence justification and reviewer approval.\n` +
`4. A5 replaces all 331 code tokens with active_line_ids that resolve against the referenced Python artifact/version.\n` +
`5. A5 normalizes all 331 event labels/types and replaces empty or generic state/output payloads with execution-bound values.\n` +
`6. A4 may merge only after A3/A5 self-check, A7 pedagogy review and Lead gate; this preparation draft is not a runtime candidate.\n\n` +
`## Reproduction\n\n` +
`Run \`node check-prep-drafts.mjs\`. The checker reads source and draft files, writes nothing, verifies hashes, exact denominators and every recomputed finding.\n`;

fs.writeFileSync(path.join(here, 'A3_A5_PREP_REVIEW.md'), report, 'utf8');
console.log(JSON.stringify({ result: 'BUILT', python: pythonMap.counts, visual: visualInventory.counts }, null, 2));
