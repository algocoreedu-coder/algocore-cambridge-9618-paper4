import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidenceDir = path.resolve(appRoot, '..', 'planning', 'paper4', 'stage-9', 'evidence', 's9-d', 'pedagogy');
const registryPath = path.join(appRoot, 'app', 'data', 'stage9-learning-pages.json');
const rendererPath = path.join(appRoot, 'app', 'components', 'paper4-learning', 'LessonLearningPage.tsx');
const [raw, rendererRaw] = await Promise.all([readFile(registryPath, 'utf8'), readFile(rendererPath, 'utf8')]);
const registry = JSON.parse(raw);
const remediationSlugs = new Set(registry.lessons.map((lesson) => lesson.slug));
const structuredFlowSlugs = new Set(['queue', 'linked-list', 'recursion', 'dictionary', 'hashing']);
const findings = [];
const fail = (id, lesson, message) => findings.push({ finding_id: id, severity: 'REQUIRED', lesson, message, status: 'OPEN' });
const block = (lesson, kind) => lesson.blocks.find((entry) => entry.kind === kind);
const text = (value) => typeof value === 'string' ? value : JSON.stringify(value);
const normalized = (value) => text(value).toLocaleLowerCase('en-US');
const hasEveryConcept = (value, concepts) => {
  const haystack = normalized(value);
  return concepts.every((alternatives) => alternatives.some((token) => haystack.includes(token)));
};
const sharedEnglishSentence = (vi, en, key = '') => {
  if (typeof vi === 'string' && typeof en === 'string') {
    if (vi !== en || vi.length < 28 || ['python', 'code', 'evidence', 'input'].includes(key)) return false;
    return /\b(the|and|before|after|first|must|expected|write|return|check|show|use|from|when|with|without|should|then)\b/i.test(vi);
  }
  if (Array.isArray(vi) && Array.isArray(en)) {
    return vi.some((entry, index) => sharedEnglishSentence(entry, en[index], key));
  }
  if (vi && en && typeof vi === 'object' && typeof en === 'object') {
    return Object.entries(vi).some(([childKey, entry]) => sharedEnglishSentence(entry, en[childKey], childKey));
  }
  return false;
};
const structuredKeys = new Set();
const collectStructuredKeys = (value) => {
  if (Array.isArray(value)) return value.forEach(collectStructuredKeys);
  if (!value || typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value)) {
    structuredKeys.add(key);
    collectStructuredKeys(entry);
  }
};
for (const lesson of registry.lessons) {
  for (const entry of lesson.blocks) {
    collectStructuredKeys(entry.content.vi);
    collectStructuredKeys(entry.content.en);
  }
}
const requiredLocalizedRendererKeys = [...structuredKeys].sort();
if (!rendererRaw.includes('ContentValue value={item} locale={locale}') || requiredLocalizedRendererKeys.some((key) => !rendererRaw.includes(`${key}: { vi:`))) {
  fail('S9D-PED-RENDER-LOCALE-001', null, 'Renderer does not localize every required learner-facing structured key.');
}

for (const lesson of registry.lessons) {
  for (const entry of lesson.blocks) {
    if (text(entry.content.vi) === text(entry.content.en)) {
      fail('S9D-PED-LOCALE-001', lesson.slug, `${entry.kind} has identical VI and EN learner content.`);
    }
    if (sharedEnglishSentence(entry.content.vi, entry.content.en)) {
      fail('S9D-PED-NESTED-SHARED-001', lesson.slug, `${entry.kind} contains a learner-facing English sentence shared by VI and EN.`);
    }
  }
  if (lesson.patternIds.length === 0) {
    const actionText = normalized(block(lesson, 'action-view').content);
    const forbidden = ['previous', 'next event', 'reset control', 'hash_setup'];
    if (forbidden.some((token) => actionText.includes(token))) {
      fail('S9D-PED-STATIC-001', lesson.slug, 'Zero-pattern Action View mentions an unavailable runtime control.');
    }
  }
  if (!remediationSlugs.has(lesson.slug)) continue;

  const worked = block(lesson, 'worked-example');
  const practice = block(lesson, 'practice');
  const retrieval = block(lesson, 'retrieval');
  const marking = block(lesson, 'marking-pitfalls');

  const workedConcepts = [
    ['requirement', 'yêu cầu'], ['design', 'thiết kế'], ['python'], ['trace'],
    ['output', 'đầu ra'], ['test', 'kiểm thử'], ['evidence', 'bằng chứng']
  ];
  if (!hasEveryConcept(worked.content.vi, workedConcepts) || !hasEveryConcept(worked.content.en, workedConcepts)) {
    fail('S9D-PED-WORKED-001', lesson.slug, 'Worked example does not expose the full requirement→design→Python→trace→output/test→evidence chain in both locales.');
  }

  const practiceConcepts = [
    ['guided', 'hướng dẫn'], ['faded', 'giảm gợi ý'], ['independent', 'độc lập'],
    ['hint', 'gợi ý'], ['feedback', 'phản hồi'], ['rubric', 'tiêu chí']
  ];
  if (!hasEveryConcept(practice.content.vi, practiceConcepts) || !hasEveryConcept(practice.content.en, practiceConcepts)) {
    fail('S9D-PED-PRACTICE-001', lesson.slug, 'Practice lacks guided, faded, independent, hint, feedback, or rubric evidence in one locale.');
  }
  if (!hasEveryConcept(retrieval.content.vi, [['rubric', 'tự chấm', 'tiêu chí']]) || !hasEveryConcept(retrieval.content.en, [['rubric', 'self-assess', 'self-check']])) {
    fail('S9D-PED-RETRIEVAL-001', lesson.slug, 'Retrieval task lacks an explicit self-assessment contract.');
  }
  const viRetrieval = retrieval.content.vi?.retrievalItem;
  const enRetrieval = retrieval.content.en?.retrievalItem;
  if (!viRetrieval || !enRetrieval || !hasEveryConcept(viRetrieval, [['hiddenanswer'], ['diagnosis'], ['repair'], ['selfrubric', 'rubric']]) || !hasEveryConcept(enRetrieval, [['hiddenanswer'], ['diagnosis'], ['repair'], ['selfrubric', 'rubric']])) {
    fail('S9D-PED-RETRIEVAL-STRUCTURE-001', lesson.slug, 'Retrieval must provide localized hiddenAnswer, diagnosis, repair, and self-rubric fields.');
  }

  if (structuredFlowSlugs.has(lesson.slug)) {
    const viFlow = practice.content.vi?.practiceFlow;
    const enFlow = practice.content.en?.practiceFlow;
    const viMarking = marking.content.vi?.markingMap;
    const enMarking = marking.content.en?.markingMap;
    if (!viFlow || !enFlow || JSON.stringify(viFlow) === JSON.stringify(enFlow) || !viMarking || !enMarking || JSON.stringify(viMarking) === JSON.stringify(enMarking)) {
      fail('S9D-PED-NESTED-LOCALE-001', lesson.slug, 'Nested practice or marking learner content is missing or identical across locales.');
    }
  }

  const sourceKinds = new Set(marking.sourceRefs.map((ref) => ref.kind));
  const markingText = normalized(marking.content);
  const hasVerifiedPair = sourceKinds.has('question-paper') && sourceKinds.has('mark-scheme');
  const hasAuthoredRubric = markingText.includes('rubric') || markingText.includes('algocore');
  if (!hasVerifiedPair && !hasAuthoredRubric) {
    fail('S9D-PED-MARKING-001', lesson.slug, 'Marking guidance has neither a QP/MS pair nor an explicitly authored AlgoCore rubric.');
  }

}

const requiredOpen = findings.filter((finding) => finding.status === 'OPEN').length;
const report = {
  schema_version: 's9-d-pedagogy-verification-v1',
  wave: 'S9-D',
  owner: 'LEAD_DETERMINISTIC_VERIFIER',
  scope: { all_lessons_locale_check: 26, remediated_lessons_deep_check: remediationSlugs.size },
  inputs: [
    { path: 'algocore-fumadocs/app/data/stage9-learning-pages.json', sha256: createHash('sha256').update(raw).digest('hex') },
    { path: 'algocore-fumadocs/app/components/paper4-learning/LessonLearningPage.tsx', sha256: createHash('sha256').update(rendererRaw).digest('hex') }
  ],
  checks: {
    bilingual_content_distinct: !findings.some((item) => item.finding_id === 'S9D-PED-LOCALE-001'),
    no_shared_english_nested_sentences: !findings.some((item) => item.finding_id === 'S9D-PED-NESTED-SHARED-001'),
    worked_example_chain: !findings.some((item) => item.finding_id === 'S9D-PED-WORKED-001'),
    practice_progression_and_feedback: !findings.some((item) => item.finding_id === 'S9D-PED-PRACTICE-001'),
    retrieval_self_assessment: !findings.some((item) => item.finding_id === 'S9D-PED-RETRIEVAL-001'),
    retrieval_structured_reveal_contract: !findings.some((item) => item.finding_id === 'S9D-PED-RETRIEVAL-STRUCTURE-001'),
    marking_authority: !findings.some((item) => item.finding_id === 'S9D-PED-MARKING-001'),
    zero_pattern_fallback: !findings.some((item) => item.finding_id === 'S9D-PED-STATIC-001'),
    nested_structured_locale: !findings.some((item) => item.finding_id === 'S9D-PED-NESTED-LOCALE-001'),
    localized_renderer_keys: !findings.some((item) => item.finding_id === 'S9D-PED-RENDER-LOCALE-001')
  },
  findings,
  required_open_findings: requiredOpen,
  decision: requiredOpen === 0 ? 'PASS' : 'FAIL',
  generated_at: new Date().toISOString()
};
await mkdir(evidenceDir, { recursive: true });
await writeFile(path.join(evidenceDir, 'PEDAGOGY_DETERMINISTIC_VERIFICATION.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Stage 9 pedagogy verification: ${report.decision}; required findings=${requiredOpen}.`);
if (requiredOpen) process.exitCode = 1;
