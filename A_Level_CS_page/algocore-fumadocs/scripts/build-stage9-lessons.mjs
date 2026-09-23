import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const planningRoot = path.resolve(appRoot, '..', 'planning', 'paper4');
const outputPath = path.join(appRoot, 'app', 'data', 'stage9-learning-pages.json');
const evidenceDir = path.join(planningRoot, 'stage-9', 'evidence', 's9-a');
const generatedAt = '2026-09-22T18:50:00+07:00';
const kinds = ['recognition', 'exam-cues', 'knowledge', 'method', 'worked-example', 'action-view', 'marking-pitfalls', 'practice', 'retrieval', 'next-and-sources'];

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const sha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');
const unique = (values) => [...new Set(values.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim()))];
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const asText = (value, locale) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return unique(value.flatMap((entry) => [asText(entry, locale)])).join('; ');
  if (typeof value === 'object') {
    if (value[locale] != null) return asText(value[locale], locale);
    return '';
  }
  return '';
};
const joinLocalized = (items, selector, locale) => unique(items.map((item) => asText(selector(item), locale))).join('\n');
const normalizeRef = (ref) => ({
  authority: ref?.authority || 'AlgoCore_editorial',
  sourceId: ref?.sourceId || ref?.source_id || 'internal-source',
  locator: ref?.locator || ref?.source_locator || '',
  status: ref?.status || 'INTERNAL_CITATION',
  accessMode: ref?.accessMode || 'internal-citation'
});
const dedupeRefs = (refs) => {
  const seen = new Set();
  return refs.map(normalizeRef).filter((ref) => {
    const key = `${ref.authority}|${ref.sourceId}|${ref.locator}`;
    if (!ref.locator || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const stage3Path = path.join(planningRoot, 'stage-3', 'LESSON_PACKAGES.json');
const stage8Path = path.join(appRoot, 'app', 'data', 'stage8-runtime-registry.json');
const inputLockPath = path.join(planningRoot, 'stage-9', 'S9_INPUT_LOCK.json');
const placeholderPath = path.join(planningRoot, 'stage-9', 'evidence', 's9-r', 'CONTENT_REMEDIATION_PLACEHOLDER.json');
const supportPath = path.join(planningRoot, 'stage-9', 'evidence', 's9-r', 'CONTENT_REMEDIATION_SUPPORT_FILES.json');
const recheckPath = path.join(planningRoot, 'stage-9', 'evidence', 's9-r', 'RECHECK_PLACEHOLDER_BY_A1.json');
const r2Dir = path.join(planningRoot, 'stage-9', 'evidence', 's9-r2');
const r2Paths = [
  'CONTENT_REMEDIATION_STRUCTURES_A.json',
  'CONTENT_REMEDIATION_STRUCTURES_B.json',
  'CONTENT_REMEDIATION_BINARY_TREE.json',
  'CONTENT_REMEDIATION_OOP_A.json',
  'CONTENT_REMEDIATION_OOP_FILES_B.json',
  'CONTENT_REMEDIATION_OOP_FILES_C.json'
].map((name) => path.join(r2Dir, name));
const r3Dir = path.join(planningRoot, 'stage-9', 'evidence', 's9-r3');
const r3Paths = [
  'CONTENT_REMEDIATION_FOUNDATIONS_TEXT_SEARCH.json',
  'CONTENT_REMEDIATION_SUPPORT_STACK.json'
].map((name) => path.join(r3Dir, name));
const pythonRemediationPath = path.join(planningRoot, 'stage-9', 'evidence', 'post-release-audit', 'PYTHON_WORKED_EXAMPLE_REMEDIATION.json');

const [stage3, stage8, inputLock, placeholder, support, recheck, pythonRemediation] = await Promise.all([
  readJson(stage3Path), readJson(stage8Path), readJson(inputLockPath), readJson(placeholderPath), readJson(supportPath), readJson(recheckPath), readJson(pythonRemediationPath)
]);
const [r2Artifacts, r3Artifacts] = await Promise.all([
  Promise.all(r2Paths.map(readJson)),
  Promise.all(r3Paths.map(readJson))
]);
if (recheck.decision !== 'PASS_BUILDER_UNBLOCKED') throw new Error('Placeholder remediation has not passed independent A1 recheck.');

const artifactPaths = [stage3Path, stage8Path, placeholderPath, supportPath, recheckPath, pythonRemediationPath, ...r2Paths, ...r3Paths];
const waveArtifacts = new Map();
for (const wave of ['c', 'd', 'e', 'f', 'g']) {
  const directory = path.join(planningRoot, 'stage-6', 'evidence', `s6-${wave}`);
  const records = {};
  for (const name of ['METHOD_EXPLANATIONS.json', 'MARKING_ERROR_GUIDE.json', 'RETRIEVAL_PRACTICE.json', 'VISUAL_EVENT_STORYBOARDS.json']) {
    const file = path.join(directory, name);
    records[name] = await readJson(file);
    artifactPaths.push(file);
  }
  waveArtifacts.set(wave, records);
}
const hashByPath = new Map();
for (const file of artifactPaths) hashByPath.set(file, await sha256(file));
const rel = (file) => path.relative(planningRoot, file).replaceAll('\\', '/');
const provenance = (files) => files.map((file) => ({ path: rel(file), sha256: hashByPath.get(file) }));

const canonicalPatternsByLesson = new Map(stage3.lessons.map((lesson) => [
  lesson.lesson_id,
  unique(stage3.pattern_destinations.filter((entry) => entry.lesson_id === lesson.lesson_id).map((entry) => entry.pattern_id)).sort()
]));
const nextByLesson = new Map(stage3.lessons.map((lesson) => [lesson.lesson_id, unique(stage3.prerequisite_edges.filter((edge) => edge.from_lesson_id === lesson.lesson_id).map((edge) => edge.to_lesson_id))]));
const lessonById = new Map(stage3.lessons.map((lesson) => [lesson.lesson_id, lesson]));
const stage3Ref = (lessonId) => normalizeRef({
  authority: 'AlgoCore_verified_mapping',
  sourceId: 'stage3-lesson-packages',
  locator: `stage-3/LESSON_PACKAGES.json#lesson=${lessonId}`
});

const overlayByLesson = new Map();
const localizeStructured = (value, locale) => {
  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((entry) => localizeStructured(entry, locale));
  if (typeof value === 'object' && (Object.hasOwn(value, 'vi') || Object.hasOwn(value, 'en'))) {
    return localizeStructured(value[locale] ?? value.en ?? value.vi, locale);
  }
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, localizeStructured(entry, locale)]));
};
const blockForRegistry = (block, resolveRef) => {
  const ignored = new Set(['blockId', 'kind', 'anchor', 'content', 'sourceRefs', 'sourceRefIds', 'authority', 'patternIds', 'officialMarks']);
  const supplement = Object.fromEntries(Object.entries(block).filter(([key]) => !ignored.has(key)));
  const hasSupplement = Object.keys(supplement).length > 0;
  const ids = block.sourceRefs || block.sourceRefIds || [];
  return {
    blockId: block.blockId,
    kind: block.kind,
    anchor: block.anchor,
    content: {
      vi: hasSupplement ? { summary: block.content.vi, ...localizeStructured(supplement, 'vi') } : block.content.vi,
      en: hasSupplement ? { summary: block.content.en, ...localizeStructured(supplement, 'en') } : block.content.en
    },
    sourceRefs: dedupeRefs(ids.map(resolveRef).filter(Boolean)),
    authority: block.authority || 'AlgoCore_editorial'
  };
};
const placeholderCatalog = new Map(placeholder.source_catalog.map((ref) => [ref.refId, normalizeRef(ref)]));
for (const lesson of placeholder.lessons) {
  const expected = canonicalPatternsByLesson.get(lesson.lessonId) || [];
  if (!sameSet(lesson.patternIds, expected)) throw new Error(`Remediation pattern mismatch: ${lesson.lessonId}`);
  overlayByLesson.set(lesson.lessonId, {
    ...lesson,
    sourceFile: placeholderPath,
    blocks: lesson.blocks.map((block) => ({ ...block, sourceRefs: dedupeRefs(block.sourceRefs.map((id) => placeholderCatalog.get(id))) }))
  });
}
for (const lesson of support.lessons) {
  const refMap = new Map(lesson.sourceRefs.map((ref) => [ref.refId, normalizeRef(ref)]));
  const expected = canonicalPatternsByLesson.get(lesson.lessonId) || [];
  if (!sameSet(lesson.patternIds, expected)) throw new Error(`Support remediation pattern mismatch: ${lesson.lessonId}`);
  overlayByLesson.set(lesson.lessonId, {
    ...lesson,
    descriptions: {
      vi: lesson.blocks.find((block) => block.kind === 'recognition').content.vi,
      en: lesson.blocks.find((block) => block.kind === 'recognition').content.en
    },
    sourceFile: supportPath,
    blocks: lesson.blocks.map((block) => ({ ...block, sourceRefs: dedupeRefs(block.sourceRefIds.map((id) => refMap.get(id))) }))
  });
}
const remediationArtifacts = [...r2Artifacts, ...r3Artifacts];
const remediationPaths = [...r2Paths, ...r3Paths];
for (let artifactIndex = 0; artifactIndex < remediationArtifacts.length; artifactIndex += 1) {
  const artifact = remediationArtifacts[artifactIndex];
  const sourceFile = remediationPaths[artifactIndex];
  const normalizeArtifactRef = (ref) => {
    const normalized = normalizeRef(ref);
    const basename = path.basename(sourceFile);
    if (normalized.locator === basename || normalized.locator.startsWith(`${basename}#`)) {
      normalized.locator = `${rel(sourceFile)}${normalized.locator.slice(basename.length)}`;
    }
    return normalized;
  };
  const rootCatalog = new Map((artifact.source_catalog || []).map((ref) => [ref.refId, normalizeArtifactRef(ref)]));
  for (const lesson of artifact.lessons) {
    const expected = canonicalPatternsByLesson.get(lesson.lessonId) || [];
    if (!sameSet(lesson.patternIds, expected)) throw new Error(`Stage 9 remediation pattern mismatch: ${lesson.lessonId}`);
    const lessonCatalog = new Map((lesson.sourceRefs || []).map((ref) => [ref.refId, normalizeArtifactRef(ref)]));
    const resolveRef = (ref) => {
      if (typeof ref === 'string') return rootCatalog.get(ref) || lessonCatalog.get(ref);
      return normalizeArtifactRef(ref);
    };
    const blocks = lesson.blocks.map((block) => blockForRegistry(block, resolveRef));
    overlayByLesson.set(lesson.lessonId, {
      ...lesson,
      descriptions: lesson.descriptions || {
        vi: blocks.find((block) => block.kind === 'recognition').content.vi,
        en: blocks.find((block) => block.kind === 'recognition').content.en
      },
      sourceFile,
      blocks
    });
  }
}

for (const remediation of pythonRemediation.lessons) {
  const lesson = overlayByLesson.get(remediation.lessonId);
  if (!lesson) throw new Error(`Python remediation lesson missing: ${remediation.lessonId}`);
  overlayByLesson.set(remediation.lessonId, {
    ...lesson,
    sourceFiles: [lesson.sourceFile, pythonRemediationPath],
    blocks: lesson.blocks.map((block) => block.kind === 'worked-example'
      ? { ...block, content: remediation.workedExample }
      : block)
  });
}

const authoredByLesson = new Map();
for (const [wave, records] of waveArtifacts) {
  const methods = records['METHOD_EXPLANATIONS.json'].entries || [];
  const marking = records['MARKING_ERROR_GUIDE.json'].entries || [];
  const retrieval = records['RETRIEVAL_PRACTICE.json'].entries || [];
  const visuals = records['VISUAL_EVENT_STORYBOARDS.json'].entries || [];
  const methodByPattern = new Map(methods.map((entry) => [entry.pattern_id, entry]));
  const markingByPattern = new Map(marking.map((entry) => [entry.pattern_id, entry]));
  for (const lesson of stage3.lessons) {
    const patternIds = canonicalPatternsByLesson.get(lesson.lesson_id) || [];
    const ownedMethods = [...new Map([
      ...patternIds.map((id) => methodByPattern.get(id)).filter(Boolean),
      ...methods.filter((entry) => entry.lesson_id === lesson.lesson_id)
    ].map((entry) => [entry.pattern_id, entry])).values()];
    if (!ownedMethods.length) continue;
    const contentPatternIds = unique(ownedMethods.map((entry) => entry.pattern_id));
    const files = Object.keys(records).map((name) => path.join(planningRoot, 'stage-6', 'evidence', `s6-${wave}`, name));
    const ownedMarking = contentPatternIds.map((id) => markingByPattern.get(id)).filter(Boolean);
    const ownedRetrieval = retrieval.filter((entry) => contentPatternIds.includes(entry.pattern_id));
    const ownedVisuals = visuals.filter((entry) => contentPatternIds.includes(entry.pattern_id));
    authoredByLesson.set(lesson.lesson_id, { wave, methods: ownedMethods, marking: ownedMarking, retrieval: ownedRetrieval, visuals: ownedVisuals, files });
  }
}

const methodSteps = (bundle) => bundle.methods.flatMap((entry) => entry.method_steps || []);
const errorRows = (bundle) => bundle.marking.flatMap((entry) => entry.error_rows || []);
const sourceRefsFrom = (entries) => dedupeRefs(entries.flatMap((entry) => entry.source_refs || []));
const makeAuthoredBlocks = (lesson, bundle, patternIds) => {
  const steps = methodSteps(bundle);
  const rows = errorRows(bundle);
  const retrieval = bundle.retrieval;
  const visuals = bundle.visuals;
  const methodRefs = sourceRefsFrom(bundle.methods);
  const markingRefs = sourceRefsFrom(bundle.marking);
  const retrievalRefs = sourceRefsFrom(retrieval);
  const visualRefs = sourceRefsFrom(visuals);
  const baseRef = stage3Ref(lesson.lesson_id);
  const prompt = (modes, locale) => joinLocalized(retrieval.filter((entry) => modes.includes(entry.mode)), (entry) => entry.prompt, locale);
  const errorText = (locale) => unique(rows.flatMap((row) => [
    asText(row.likely_error, locale),
    asText(row.detection_check, locale),
    asText(row.repair_action, locale),
    locale === 'vi' ? row.detection_vi : row.detection_en,
    locale === 'vi' ? row.repair_vi : row.repair_en
  ])).join('\n');
  const nextIds = nextByLesson.get(lesson.lesson_id) || [];
  const relationshipText = (locale) => {
    const prerequisites = lesson.prerequisite_lesson_ids.map((id) => lessonById.get(id)?.titles?.[locale]).filter(Boolean);
    const next = nextIds.map((id) => lessonById.get(id)?.titles?.[locale]).filter(Boolean);
    return unique([prerequisites.join('; '), next.join('; ')]).join('\n');
  };
  const specs = {
    recognition: { vi: prompt(['recognise'], 'vi'), en: prompt(['recognise'], 'en'), refs: retrievalRefs },
    'exam-cues': { vi: joinLocalized(steps, (step) => step.trigger, 'vi'), en: joinLocalized(steps, (step) => step.trigger, 'en'), refs: methodRefs },
    knowledge: {
      vi: unique([joinLocalized(steps, (step) => step.representation, 'vi'), joinLocalized(steps, (step) => step.invariant, 'vi')]).join('\n'),
      en: unique([joinLocalized(steps, (step) => step.representation, 'en'), joinLocalized(steps, (step) => step.invariant, 'en')]).join('\n'), refs: methodRefs
    },
    method: {
      vi: unique([joinLocalized(steps, (step) => step.action, 'vi'), joinLocalized(steps, (step) => step.check, 'vi')]).join('\n'),
      en: unique([joinLocalized(steps, (step) => step.action, 'en'), joinLocalized(steps, (step) => step.check, 'en')]).join('\n'), refs: methodRefs
    },
    'worked-example': {
      vi: unique([joinLocalized(visuals, (entry) => entry.delta, 'vi'), joinLocalized(visuals, (entry) => entry.invariant, 'vi')]).join('\n'),
      en: unique([joinLocalized(visuals, (entry) => entry.delta, 'en'), joinLocalized(visuals, (entry) => entry.invariant, 'en')]).join('\n'), refs: visualRefs
    },
    'action-view': {
      vi: unique([joinLocalized(visuals, (entry) => entry.prediction, 'vi'), joinLocalized(visuals, (entry) => entry.caption, 'vi')]).join('\n'),
      en: unique([joinLocalized(visuals, (entry) => entry.prediction, 'en'), joinLocalized(visuals, (entry) => entry.caption, 'en')]).join('\n'), refs: visualRefs
    },
    'marking-pitfalls': { vi: errorText('vi'), en: errorText('en'), refs: markingRefs },
    practice: { vi: prompt(['complete', 'transfer', 'predict'], 'vi'), en: prompt(['complete', 'transfer', 'predict'], 'en'), refs: retrievalRefs },
    retrieval: { vi: prompt(['explain', 'reconstruct'], 'vi'), en: prompt(['explain', 'reconstruct'], 'en'), refs: retrievalRefs },
    'next-and-sources': { vi: relationshipText('vi'), en: relationshipText('en'), refs: [baseRef] }
  };
  return kinds.map((kind) => ({
    blockId: `${lesson.lesson_id}.s9.${kind}`,
    kind,
    anchor: kind,
    content: { vi: specs[kind].vi, en: specs[kind].en },
    sourceRefs: dedupeRefs([baseRef, ...specs[kind].refs]),
    authority: 'Stage6_released_composition'
  }));
};

const lessons = stage3.lessons.map((lesson) => {
  const patternIds = canonicalPatternsByLesson.get(lesson.lesson_id) || [];
  const overlay = overlayByLesson.get(lesson.lesson_id);
  const authored = authoredByLesson.get(lesson.lesson_id);
  if (!overlay && !authored) throw new Error(`No reviewed content source for ${lesson.lesson_id}`);
  const blocks = overlay ? overlay.blocks : makeAuthoredBlocks(lesson, authored, patternIds);
  if (blocks.length !== 10 || !kinds.every((kind, index) => blocks[index]?.kind === kind)) throw new Error(`Invalid block contract for ${lesson.lesson_id}`);
  const files = overlay ? [stage3Path, ...(overlay.sourceFiles || [overlay.sourceFile])] : [stage3Path, ...authored.files];
  const descriptions = overlay?.descriptions || {
    vi: blocks.find((block) => block.kind === 'recognition').content.vi,
    en: blocks.find((block) => block.kind === 'recognition').content.en
  };
  return {
    lessonId: lesson.lesson_id,
    packageId: lesson.package_id,
    slug: lesson.slug,
    version: 's9-v1',
    titles: lesson.titles,
    descriptions,
    patternIds,
    prerequisiteLessonIds: lesson.prerequisite_lesson_ids,
    nextLessonIds: nextByLesson.get(lesson.lesson_id) || [],
    blocks,
    actionView: { patternIds: [...patternIds], mode: patternIds.length ? 'stage8-runtime' : 'conceptual-no-runtime-pattern' },
    provenance: provenance(files)
  };
});

const packages = stage3.packages.map((pkg) => ({
  packageId: pkg.package_id,
  titles: pkg.titles,
  lessonIds: [...pkg.lesson_ids],
  patternIds: unique(lessons.filter((lesson) => lesson.packageId === pkg.package_id).flatMap((lesson) => lesson.patternIds)).sort()
}));
const unionPatterns = unique(lessons.flatMap((lesson) => lesson.patternIds)).sort();
const registry = {
  schemaVersion: 's9-learning-registry-v1',
  generatedAt,
  releaseInputs: inputLock.inputs,
  counts: { packages: packages.length, lessons: lessons.length, patterns: unionPatterns.length, blocks: lessons.flatMap((lesson) => lesson.blocks).length, locales: 2 },
  packages,
  lessons
};
await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(evidenceDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`);
const summary = {
  schema_version: 's9-a-builder-summary-v1', wave: 'S9-A', owner: 'A1_REGISTRY_ENGINEER', generated_at: generatedAt,
  output: { path: 'algocore-fumadocs/app/data/stage9-learning-pages.json', sha256: await sha256(outputPath) },
  counts: registry.counts,
  overlay_lessons: overlayByLesson.size,
  stage6_authored_lessons: authoredByLesson.size,
  exact_stage8_pattern_set: sameSet(unionPatterns, stage8.patterns.map((pattern) => pattern.pattern_id)),
  scenario_event_data_copied: false,
  decision: 'BUILT_PENDING_INDEPENDENT_VERIFIER'
};
await writeFile(path.join(evidenceDir, 'S9A_BUILD_SUMMARY.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Built Stage 9 registry: ${registry.counts.packages} packages, ${registry.counts.lessons} lessons, ${registry.counts.patterns} patterns, ${registry.counts.blocks} blocks.`);
