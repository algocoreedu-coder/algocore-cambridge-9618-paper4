import { createHash } from 'node:crypto';
import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const planningRoot = path.resolve(appRoot, '..', 'planning', 'paper4');
const registryPath = path.join(appRoot, 'app', 'data', 'stage9-learning-pages.json');
const evidenceDir = path.join(planningRoot, 'stage-9', 'evidence', 's9-a');
const kinds = ['recognition', 'exam-cues', 'knowledge', 'method', 'worked-example', 'action-view', 'marking-pitfalls', 'practice', 'retrieval', 'next-and-sources'];
const [registry, stage3, stage8] = await Promise.all([
  readFile(registryPath, 'utf8').then(JSON.parse),
  readFile(path.join(planningRoot, 'stage-3', 'LESSON_PACKAGES.json'), 'utf8').then(JSON.parse),
  readFile(path.join(appRoot, 'app', 'data', 'stage8-runtime-registry.json'), 'utf8').then(JSON.parse)
]);
const findings = [];
const fail = (id, message, lessonId = null) => findings.push({ finding_id: id, severity: 'REQUIRED', lesson_id: lessonId, message, status: 'OPEN' });
const unique = (values) => [...new Set(values)];
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const hasLocalizedContent = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.some(hasLocalizedContent);
  if (value && typeof value === 'object') {
    const entries = Object.values(value);
    return entries.length > 0 && entries.some(hasLocalizedContent);
  }
  return false;
};
const lessonIds = registry.lessons.map((lesson) => lesson.lessonId);
const slugs = registry.lessons.map((lesson) => lesson.slug);
const packageIds = registry.packages.map((pkg) => pkg.packageId);
if (registry.packages.length !== 13 || unique(packageIds).length !== 13) fail('S9A-SET-001', 'Package exact set must contain 13 unique IDs.');
if (registry.lessons.length !== 26 || unique(lessonIds).length !== 26) fail('S9A-SET-002', 'Lesson exact set must contain 26 unique IDs.');
if (unique(slugs).length !== 26) fail('S9A-SET-003', 'Lesson slugs must be unique.');
if (!sameSet(lessonIds, stage3.lessons.map((lesson) => lesson.lesson_id))) fail('S9A-SET-004', 'Lesson IDs differ from Stage 3.');
if (!sameSet(packageIds, stage3.packages.map((pkg) => pkg.package_id))) fail('S9A-SET-005', 'Package IDs differ from Stage 3.');
const stage8Patterns = stage8.patterns.map((pattern) => pattern.pattern_id);
const unionPatterns = unique(registry.lessons.flatMap((lesson) => lesson.patternIds));
if (unionPatterns.length !== 58 || !sameSet(unionPatterns, stage8Patterns)) fail('S9A-PATTERN-001', 'Pattern union must exactly equal all 58 Stage 8 pattern IDs.');
const validLessonIds = new Set(lessonIds);
const validPackageIds = new Set(packageIds);
const patternOwnerCounts = new Map(unionPatterns.map((id) => [id, registry.lessons.filter((lesson) => lesson.patternIds.includes(id)).length]));
if ([...patternOwnerCounts.values()].some((count) => count !== 1)) fail('S9A-PATTERN-003', 'Every pattern must have exactly one primary lesson owner.');
for (const pkg of registry.packages) {
  const expected = stage3.packages.find((entry) => entry.package_id === pkg.packageId);
  if (!expected || !sameSet(pkg.lessonIds, expected.lesson_ids) || !pkg.lessonIds.every((id) => validLessonIds.has(id))) fail('S9A-PACKAGE-001', 'Package lesson membership differs from Stage 3 or contains an orphan.');
}
for (const lesson of registry.lessons) {
  const expected = unique(stage3.pattern_destinations.filter((entry) => entry.lesson_id === lesson.lessonId).map((entry) => entry.pattern_id));
  if (!sameSet(lesson.patternIds, expected)) fail('S9A-PATTERN-002', 'Primary pattern ownership differs from Stage 3.', lesson.lessonId);
  if (lesson.blocks.length !== 10 || JSON.stringify(lesson.blocks.map((block) => block.kind)) !== JSON.stringify(kinds)) fail('S9A-BLOCK-001', 'Lesson must contain ten canonical blocks in order.', lesson.lessonId);
  if (!lesson.titles?.vi?.trim() || !lesson.titles?.en?.trim() || !lesson.descriptions?.vi?.trim() || !lesson.descriptions?.en?.trim()) fail('S9A-LOCALE-001', 'Lesson title/description locale missing.', lesson.lessonId);
  if (!lesson.prerequisiteLessonIds.every((id) => validLessonIds.has(id)) || !lesson.nextLessonIds.every((id) => validLessonIds.has(id))) fail('S9A-GRAPH-001', 'Prerequisite or next lesson reference is orphaned.', lesson.lessonId);
  if (!validPackageIds.has(lesson.packageId)) fail('S9A-PACKAGE-002', 'Lesson package reference is orphaned.', lesson.lessonId);
  if (!lesson.provenance?.length || lesson.provenance.some((item) => !item.path || !/^[a-f0-9]{64}$/.test(item.sha256))) fail('S9A-PROV-001', 'Artifact provenance path/SHA-256 missing.', lesson.lessonId);
  if (lesson.patternIds.length && (!lesson.actionView?.patternIds?.length || !lesson.actionView.patternIds.every((id) => lesson.patternIds.includes(id)))) fail('S9A-ACTION-001', 'Action View patterns must be a non-empty subset of lesson patterns.', lesson.lessonId);
  for (const block of lesson.blocks) {
    if (!block.blockId || block.anchor !== block.kind || !hasLocalizedContent(block.content?.vi) || !hasLocalizedContent(block.content?.en)) fail('S9A-BLOCK-002', `Incomplete bilingual block ${block.kind}.`, lesson.lessonId);
    if (!block.sourceRefs?.length) fail('S9A-SOURCE-001', `Block ${block.kind} has no source references.`, lesson.lessonId);
    for (const ref of block.sourceRefs || []) {
      if (!ref.locator || ref.href != null || /^[a-z]:\\/i.test(ref.locator) || ref.locator.startsWith('/')) fail('S9A-SOURCE-002', `Unsafe or invalid source reference in ${block.kind}.`, lesson.lessonId);
      if (ref.locator) {
        const localPath = ref.locator.split('#', 1)[0];
        try {
          await access(path.join(planningRoot, localPath));
        } catch {
          fail('S9A-SOURCE-003', `Source locator target does not exist: ${localPath}`, lesson.lessonId);
        }
      }
    }
  }
}
const allBlocks = registry.lessons.flatMap((lesson) => lesson.blocks);
if (allBlocks.length !== 260) fail('S9A-BLOCK-003', 'Registry must contain exactly 260 blocks.');
if (unique(allBlocks.map((block) => block.blockId)).length !== 260) fail('S9A-BLOCK-004', 'Block IDs must be globally unique.');
const raw = await readFile(registryPath, 'utf8');
for (const forbidden of ['"scenarios"', '"events"', '"eventIds"', '"event_ids"']) if (raw.includes(forbidden)) fail('S9A-DUP-001', `Registry duplicates runtime field ${forbidden}.`);
const learnerContent = registry.lessons.flatMap((lesson) => [
  lesson.descriptions.vi,
  lesson.descriptions.en,
  ...lesson.blocks.flatMap((block) => [block.content.vi, block.content.en])
]).map((value) => typeof value === 'string' ? value : JSON.stringify(value)).join('\n');
if (/PLACEHOLDER_PENDING|SKELETON_PLACEHOLDER|PENDING_S6|NOT_AUTHORED/.test(learnerContent)) fail('S9A-CONTENT-001', 'Registry contains unresolved placeholder learner content.');
const requiredOpen = findings.filter((finding) => finding.severity === 'REQUIRED' && finding.status === 'OPEN').length;
const report = {
  schema_version: 's9-a-verification-v1', wave: 'S9-A', owner: 'A1_REGISTRY_ENGINEER', reviewer: 'DETERMINISTIC_EXACT_SET_VERIFIER',
  inputs: [{ path: 'algocore-fumadocs/app/data/stage9-learning-pages.json', sha256: createHash('sha256').update(raw).digest('hex') }],
  checks: {
    packages_13: registry.packages.length === 13,
    lessons_26: registry.lessons.length === 26,
    patterns_58_exact_stage8: unionPatterns.length === 58 && sameSet(unionPatterns, stage8Patterns),
    blocks_260: registry.lessons.flatMap((lesson) => lesson.blocks).length === 260,
    canonical_primary_ownership: !findings.some((finding) => finding.finding_id === 'S9A-PATTERN-002'),
    one_primary_owner_per_pattern: !findings.some((finding) => finding.finding_id === 'S9A-PATTERN-003'),
    package_membership_exact: !findings.some((finding) => finding.finding_id.startsWith('S9A-PACKAGE')),
    unique_block_ids: !findings.some((finding) => finding.finding_id === 'S9A-BLOCK-004'),
    bilingual_complete: !findings.some((finding) => finding.finding_id.startsWith('S9A-LOCALE') || finding.finding_id === 'S9A-BLOCK-002'),
    safe_internal_sources: !findings.some((finding) => finding.finding_id.startsWith('S9A-SOURCE')),
    no_scenario_event_duplication: !findings.some((finding) => finding.finding_id === 'S9A-DUP-001'),
    no_placeholders: !findings.some((finding) => finding.finding_id === 'S9A-CONTENT-001')
  },
  findings, required_open_findings: requiredOpen, decision: requiredOpen === 0 ? 'PASS' : 'FAIL', generated_at: '2026-09-22T18:52:00+07:00'
};
await mkdir(evidenceDir, { recursive: true });
await writeFile(path.join(evidenceDir, 'S9A_VERIFICATION.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Stage 9 registry verification: ${report.decision}; required findings=${requiredOpen}.`);
if (requiredOpen) process.exitCode = 1;
