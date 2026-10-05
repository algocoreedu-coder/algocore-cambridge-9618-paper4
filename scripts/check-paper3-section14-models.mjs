import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tcpIpJourney, tcpIpLayers, tcpIpPayloads, tcpIpResponsibilityQuestions, tcpIpPrediction, tcpIpScenario } from '../app/lib/paper3/network-models.ts';
import { expectedPilotTrace, LAYERS, REQUESTS, RESPONSIBILITY } from './check-paper3-section14-oracle.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE = path.resolve(ROOT, '../planning/paper3-2026/completion-program-2026/evidence/section14');
const hash = async file => createHash('sha256').update(await readFile(file)).digest('hex');
const load = async name => JSON.parse(await readFile(path.join(EVIDENCE, name), 'utf8'));
const approval = await load('TEACHER_PILOT_PREIMPLEMENTATION.json');
const contract = await load('SECTION14_PILOT_CONTRACT.json');
const fixtures = await load('TEACHER_PILOT_FIXTURES.json');
const lessonPath = path.join(ROOT, 'content/paper3/lessons/tcp-ip-stack-and-message-journey.json');
const lesson = JSON.parse(await readFile(lessonPath, 'utf8'));
let assertions = 0;
const eq = (actual, expected, message) => { assertions++; assert.deepStrictEqual(actual, expected, message); };
const ok = (condition, message) => { assertions++; assert.ok(condition, message); };
const throws = (fn, error, message) => { assertions++; assert.throws(fn, error, message); };
const results = [];
async function group(id, label, callback) {
  const start = assertions;
  try { await callback(); results.push({ id, label, pass: true, assertions: assertions - start }); }
  catch (error) { results.push({ id, label, pass: false, assertions: assertions - start, error: error.stack ?? String(error) }); }
}
const project = step => Object.fromEntries(['id', 'actor', 'layer', 'direction', 'operation', 'changedWrapper', 'before', 'after'].map(key => [key, step[key]]));
const textPair = (value, location) => { for (const locale of ['en', 'vi']) ok(typeof value?.[locale] === 'string' && value[locale].trim().length > 0, `${location}.${locale} is nonempty`); };

await group('S14-M01', 'Exact approved contract/content identity and four-layer domain', async () => {
  eq(approval.decision, 'PASS', 'Teacher preimplementation must be approved');
  eq(await hash(lessonPath), approval.contentSha256, 'Lesson matches approved Teacher content');
  eq(await hash(path.join(EVIDENCE, 'SECTION14_PILOT_CONTRACT.json')), approval.contractSha256, 'Contract matches approved Teacher artifact');
  eq(tcpIpLayers.map(layer => layer.id), LAYERS, 'Exactly four layers, top to bottom');
  eq(tcpIpPayloads.map(({ id, resource, text }) => ({ id, resource, text })), Object.values(REQUESTS), 'Exactly two independently specified request presets');
  eq(tcpIpScenario.applicationProtocol, 'HTTP', 'Application request example uses HTTP');
});

await group('S14-M02', 'Every trace state versus independent wrapper-stack oracle', () => {
  for (const id of Object.keys(REQUESTS)) {
    const actual = tcpIpJourney(id), expected = expectedPilotTrace(id);
    eq(actual.length, 9, `${id}: nine states`);
    for (let index = 0; index < expected.length; index++) {
      eq(project(actual[index]), expected[index], `${id} step ${index}: complete data state`);
      eq(actual[index].before.payload, REQUESTS[id], `${id}: payload before`);
      eq(actual[index].after.payload, REQUESTS[id], `${id}: payload after`);
      if (index) eq(actual[index].before, actual[index - 1].after, `${id}: adjacent snapshots join`);
    }
    eq(actual.filter(step => step.operation === 'add-wrapper').map(step => step.changedWrapper), ['transport', 'internet', 'link'], 'Wrappers added once from inner to outer');
    eq(actual.filter(step => step.operation === 'remove-wrapper').map(step => step.changedWrapper), ['link', 'internet', 'transport'], 'Wrappers removed once from outer to inner');
    eq(actual.filter(step => step.after.delivered).map(step => step.id), ['receiver-application'], 'Only final state is delivered');
    eq(actual[4].layer, null, 'Transit is not a fifth layer');
    eq([actual[3].after.linkScope, actual[4].after.linkScope, actual[5].after.linkScope], ['first-link', 'final-link', null], 'First/final link controls are distinct and removed at receiver');
  }
});

await group('S14-M03', 'Deterministic backtracking, deeply immutable snapshots and explicit invalid IDs', () => {
  const deepFrozen = value => value === null || typeof value !== 'object' || (Object.isFrozen(value) && Object.values(value).every(deepFrozen));
  const initial = tcpIpJourney('revision-page');
  const before = JSON.stringify(initial);
  ok(deepFrozen(initial), 'All nested trace arrays/objects are frozen');
  ok(deepFrozen(tcpIpResponsibilityQuestions) && deepFrozen(tcpIpPrediction), 'Answer authority cannot be mutated');
  throws(() => initial[3].after.wrappers.push('application'), TypeError, 'Cannot append invented wrapper');
  throws(() => { initial[8].after.payload.text = 'different request'; }, TypeError, 'Cannot mutate payload shared by cached trace');
  throws(() => { initial[0].after.delivered = true; }, TypeError, 'Cannot retroactively mark initial state delivered');
  for (const index of [8, 0, 4, 3, 5, 8, 1, 0]) eq(project(tcpIpJourney('revision-page')[index]), expectedPilotTrace('revision-page')[index], `Back/jump snapshot ${index}`);
  eq(tcpIpJourney('diagram-image').at(-1).after.payload, REQUESTS['diagram-image'], 'Switching trace delivers the second request');
  eq(JSON.stringify(initial), before, 'Second trace and attempted writes preserve first trace');
  for (const invalid of ['', 'unknown', '/revision', 'REVISION-PAGE', '__proto__', 'constructor', undefined, null, 0, 1, {}, [], true]) throws(() => tcpIpJourney(invalid), RangeError, `Unsupported payload ${String(invalid)} fails explicitly`);
});

await group('S14-M04', 'Independent responsibility/prediction answers with complete feedback', () => {
  eq(tcpIpResponsibilityQuestions.map(q => q.id), Object.keys(RESPONSIBILITY), 'Four independently identified responsibility tasks');
  for (const question of tcpIpResponsibilityQuestions) {
    eq(question.correctLayer, RESPONSIBILITY[question.id], `${question.id}: correct actor/function`);
    eq(question.choices.map(choice => choice.layer), LAYERS, 'One choice per layer');
    eq(question.choices.filter(choice => choice.correct).map(choice => choice.layer), [RESPONSIBILITY[question.id]], 'Exactly the independent correct answer');
    textPair(question.prompt, question.id + '.prompt'); textPair(question.explanation, question.id + '.explanation');
    for (const choice of question.choices) textPair(choice.feedback, question.id + '.' + choice.layer);
  }
  eq(tcpIpPrediction.correctLayer, 'link', 'First receiving actor is Link');
  eq(tcpIpPrediction.correctWrapper, 'link', 'First receiving wrapper is Link');
  eq(tcpIpPrediction.beforeStepId, 'receiver-link', 'Prediction occurs before receiving Link');
  eq(tcpIpPrediction.choices.filter(choice => choice.correct).map(choice => choice.layer), ['link'], 'Prediction answer is unique');
});

await group('S14-M05', 'Implementation wording is bound to the Teacher-approved contract', () => {
  for (const step of tcpIpJourney('revision-page')) {
    const approved = contract.steps.find(item => item.id === step.id);
    ok(Boolean(approved), `${step.id}: known contract state`);
    for (const field of ['title', 'action', 'why', 'outcome', 'highlight']) eq(step[field], approved[field], `${step.id}.${field} uses approved wording`);
  }
  const questions = fixtures.responsibility ?? fixtures.responsibilityQuestions;
  ok(Array.isArray(questions), 'Teacher fixture responsibility dataset is available');
  for (const question of tcpIpResponsibilityQuestions) {
    const approved = questions.find(item => item.id === question.id);
    ok(Boolean(approved), `Teacher feedback for ${question.id}`);
    for (const choice of question.choices) eq(choice.feedback, approved.feedbackByLayer[choice.layer], 'Per-choice EN/VI feedback matches Teacher-approved authority');
  }
});

await group('S14-C01', 'Lesson structural integrity, references, bilingual data and authored practice', () => {
  eq(lesson.topicId, 'P3-14.1-T01', 'Canonical topic ID'); eq(lesson.slug, 'tcp-ip-stack-and-message-journey', 'Canonical route'); eq(lesson.visual.kind, 'tcp-ip-stack', 'Integrated visual kind');
  const ids = [...lesson.theory, ...lesson.workedExample.steps, ...lesson.checkpoints].map(item => item.id);
  eq(new Set(ids).size, ids.length, 'Content IDs remain unique');
  const sources = new Set(lesson.sources.map(source => source.id));
  eq(sources.size, lesson.sources.length, 'Source IDs unique');
  function walk(value, location = 'lesson') {
    if (!value || typeof value !== 'object') return;
    if ('en' in value || 'vi' in value) textPair(value, location);
    for (const [key, child] of Object.entries(value)) {
      if (key === 'sourceIds') for (const id of child) ok(sources.has(id), `${location} resolves source ${id}`);
      else walk(child, `${location}.${key}`);
    }
  }
  walk(lesson);
  eq(lesson.workedExample.origin, 'algocore-authored', 'New worked example is attributed correctly'); eq(lesson.workedExample.officialMarks, null, 'No invented official marks');
  for (const step of lesson.workedExample.steps) for (const field of ['action', 'why', 'result', 'check']) textPair(step[field], `${step.id}.${field}`);
  for (const question of lesson.checkpoints) {
    eq(question.choices.filter(choice => choice.id === question.correctChoiceId).length, 1, `${question.id}: answer resolves exactly once`);
    eq(new Set(question.choices.map(choice => choice.id)).size, question.choices.length, 'Choice IDs unique');
  }
  ok(lesson.checkpoints.some(question => question.transfer), 'At least one independent transfer prompt authored');
});

// Hashes bind static evidence. Browser/runtime and Teacher post-render remain separate gates.
const report = { schemaVersion: 1, checkedAt: new Date().toISOString(), node: process.version, scope: 'Independent Section14 pilot model and content structure, not browser/academic post-render/availability', modelSha256: await hash(path.join(ROOT, 'app/lib/paper3/network-models.ts')), contentSha256: await hash(lessonPath), contractSha256: await hash(path.join(EVIDENCE, 'SECTION14_PILOT_CONTRACT.json')), oracleSha256: await hash(path.join(ROOT, 'scripts/check-paper3-section14-oracle.mjs')), groups: results.length, passed: results.filter(item => item.pass).length, assertions, decision: results.every(item => item.pass) ? 'PASS' : 'FAIL', results };
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, 'QA_MODELS_PILOT_RESULT.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.decision !== 'PASS') process.exitCode = 1;
