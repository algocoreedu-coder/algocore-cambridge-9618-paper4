import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const planningRoot = path.resolve(appRoot, '..', 'planning', 'paper4');
const registryPath = path.join(appRoot, 'app', 'data', 'stage9-learning-pages.json');
const rendererPath = path.join(appRoot, 'app', 'components', 'paper4-learning', 'LessonLearningPage.tsx');
const outputDir = path.join(planningRoot, 'stage-9', 'evidence', 'post-release-audit');
const [registryRaw, rendererRaw] = await Promise.all([
  readFile(registryPath, 'utf8'),
  readFile(rendererPath, 'utf8'),
]);
const registry = JSON.parse(registryRaw);
const plainText = (value) => typeof value === 'string'
  ? value
  : Array.isArray(value)
    ? value.map(plainText).join('\n')
    : value && typeof value === 'object'
      ? Object.values(value).map(plainText).join('\n')
      : String(value ?? '');
const findCode = (value, key = '') => {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((entry) => findCode(entry, key));
  return Object.entries(value).flatMap(([childKey, entry]) => {
    const here = ['python', 'code'].includes(childKey) && (
      typeof entry === 'string' || (Array.isArray(entry) && entry.every((line) => typeof line === 'string'))
    ) ? [{ key: childKey, source: Array.isArray(entry) ? entry.join('\n') : entry }] : [];
    return [...here, ...findCode(entry, childKey)];
  });
};
const hasKey = (value, target) => {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((entry) => hasKey(entry, target));
  return Object.entries(value).some(([key, entry]) => key === target || hasKey(entry, target));
};
const syntaxCheck = (source) => {
  const result = spawnSync('python', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], {
    input: source,
    encoding: 'utf8',
  });
  return { pass: result.status === 0, message: result.stderr.trim() };
};
const rows = registry.lessons.map((lesson) => {
  const knowledge = lesson.blocks.find((block) => block.kind === 'knowledge');
  const method = lesson.blocks.find((block) => block.kind === 'method');
  const worked = lesson.blocks.find((block) => block.kind === 'worked-example');
  const viKnowledge = plainText(knowledge?.content?.vi);
  const enKnowledge = plainText(knowledge?.content?.en);
  const viMethod = plainText(method?.content?.vi);
  const enMethod = plainText(method?.content?.en);
  const viCode = findCode(worked?.content?.vi);
  const enCode = findCode(worked?.content?.en);
  const syntax = viCode.map((entry) => syntaxCheck(entry.source));
  const contentText = plainText(worked?.content);
  const workedRefs = worked?.sourceRefs || [];
  const knowledgeRefs = knowledge?.sourceRefs || [];
  const refText = (ref) => `${ref?.authority || ''} ${ref?.sourceId || ref?.source_id || ''} ${ref?.locator || ''}`.toLowerCase();
  const checks = {
    structured_python_vi: viCode.length > 0,
    structured_python_en: enCode.length > 0,
    python_at_least_five_lines: viCode.some((entry) => entry.source.split(/\r?\n/).filter(Boolean).length >= 5),
    python_syntax_valid: syntax.length > 0 && syntax.every((result) => result.pass),
    knowledge_depth_vi: viKnowledge.length >= 300,
    knowledge_depth_en: enKnowledge.length >= 300,
    method_depth_vi: viMethod.length >= 300,
    method_depth_en: enMethod.length >= 300,
    trace_present: hasKey(worked?.content, 'trace') || /trace|bảng vết/i.test(contentText),
    output_present: hasKey(worked?.content, 'expectedOutput') || /output|đầu ra|kết quả/i.test(contentText),
    tests_present: hasKey(worked?.content, 'tests') || /test|kiểm thử/i.test(contentText),
    evidence_present: hasKey(worked?.content, 'evidence') || /evidence|bằng chứng/i.test(contentText),
    stage5_execution_join: workedRefs.some((ref) => refText(ref).includes('stage-5')),
    direct_coursebook_join: knowledgeRefs.some((ref) => {
      const locator = String(ref?.locator || '').toLowerCase();
      return /coursebook|textbook/.test(locator) && /page|pdf|printed|section/.test(locator);
    }),
    direct_syllabus_join: knowledgeRefs.some((ref) => {
      const locator = String(ref?.locator || '').toLowerCase();
      return /syllabus/.test(locator) && /page|objective|section/.test(locator);
    }),
  };
  return {
    lesson_id: lesson.lessonId,
    slug: lesson.slug,
    metrics: {
      knowledge_chars_vi: viKnowledge.length,
      knowledge_chars_en: enKnowledge.length,
      method_chars_vi: viMethod.length,
      method_chars_en: enMethod.length,
      python_blocks_vi: viCode.length,
      python_lines_vi: viCode.reduce((sum, entry) => sum + entry.source.split(/\r?\n/).filter(Boolean).length, 0),
    },
    checks,
    syntax_errors: syntax.filter((result) => !result.pass).map((result) => result.message),
    decision: Object.values(checks).every(Boolean) ? 'PASS' : 'REWORK_REQUIRED',
  };
});
const rendererChecks = {
  semantic_pre_code: rendererRaw.includes('<pre aria-label=') && rendererRaw.includes('<code className='),
  python_key_handled: rendererRaw.includes('["python", "code", "pseudocode"]'),
  code_lines_not_list_items: rendererRaw.includes('return value.join("\\n")'),
  keyboard_scroll_region: rendererRaw.includes('tabIndex={0}'),
};
const failures = rows.filter((row) => row.decision !== 'PASS');
const report = {
  schema_version: 'paper4-python-theory-audit-v1',
  generated_at: new Date().toISOString(),
  scope: { lessons: registry.lessons.length, locales: 2 },
  inputs: [
    { path: path.relative(planningRoot, registryPath).replaceAll('\\', '/'), sha256: createHash('sha256').update(registryRaw).digest('hex') },
    { path: path.relative(planningRoot, rendererPath).replaceAll('\\', '/'), sha256: createHash('sha256').update(rendererRaw).digest('hex') },
  ],
  renderer_checks: rendererChecks,
  summary: {
    lessons_pass: rows.length - failures.length,
    lessons_rework_required: failures.length,
    structured_python_lessons: rows.filter((row) => row.checks.structured_python_vi && row.checks.structured_python_en).length,
    theory_depth_pass_lessons: rows.filter((row) => row.checks.knowledge_depth_vi && row.checks.knowledge_depth_en && row.checks.method_depth_vi && row.checks.method_depth_en).length,
    stage5_execution_join_lessons: rows.filter((row) => row.checks.stage5_execution_join).length,
    direct_coursebook_join_lessons: rows.filter((row) => row.checks.direct_coursebook_join).length,
    direct_syllabus_join_lessons: rows.filter((row) => row.checks.direct_syllabus_join).length,
  },
  lessons: rows,
  decision: failures.length === 0 && Object.values(rendererChecks).every(Boolean) ? 'PASS' : 'REWORK_REQUIRED',
};
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'PYTHON_THEORY_GATE.json'), `${JSON.stringify(report, null, 2)}\n`);
const markdown = [
  '# Paper 4 Python and theory gate',
  '',
  `**Decision: ${report.decision}**`,
  '',
  `- Structured Python: ${report.summary.structured_python_lessons}/${rows.length} lessons`,
  `- Theory-depth gate: ${report.summary.theory_depth_pass_lessons}/${rows.length} lessons`,
  `- Stage 5 execution joins: ${report.summary.stage5_execution_join_lessons}/${rows.length} lessons`,
  `- Direct coursebook/syllabus joins: ${report.summary.direct_coursebook_join_lessons}/${rows.length} / ${report.summary.direct_syllabus_join_lessons}/${rows.length} lessons`,
  `- Fully passing lessons: ${report.summary.lessons_pass}/${rows.length}`,
  `- Semantic renderer: ${Object.values(rendererChecks).every(Boolean) ? 'PASS' : 'FAIL'}`,
  '',
  '| Lesson | Python lines | Knowledge VI/EN | Method VI/EN | Result |',
  '|---|---:|---:|---:|---|',
  ...rows.map((row) => `| ${row.slug} | ${row.metrics.python_lines_vi} | ${row.metrics.knowledge_chars_vi}/${row.metrics.knowledge_chars_en} | ${row.metrics.method_chars_vi}/${row.metrics.method_chars_en} | ${row.decision} |`),
  '',
].join('\n');
await writeFile(path.join(outputDir, 'PYTHON_THEORY_GATE.md'), markdown);
console.log(`Paper 4 Python/theory audit: ${report.decision}; structured Python ${report.summary.structured_python_lessons}/${rows.length}; theory-depth ${report.summary.theory_depth_pass_lessons}/${rows.length}.`);
if (report.decision !== 'PASS') process.exitCode = 1;
