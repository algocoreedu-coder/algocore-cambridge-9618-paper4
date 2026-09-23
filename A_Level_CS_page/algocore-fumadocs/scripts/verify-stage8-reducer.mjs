import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(scriptDir, '../app/components/paper4-visual/reducer.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  fileName: sourcePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`;
const { createInitialRuntimeState, runtimeReducer } = await import(moduleUrl);

let assertions = 0;
const equal = (actual, expected, message) => {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
};

let state = createInitialRuntimeState('ALGORITHM_TRANSLATE', 'vi');
equal(state.patternId, 'ALGORITHM_TRANSLATE', 'initial pattern');
equal(state.eventIndex, 0, 'initial event');
equal(state.locale, 'vi', 'initial locale');
equal(state.playing, false, 'initial playback');

state = runtimeReducer(state, { type: 'NEXT', eventCount: 5 });
equal(state.eventIndex, 1, 'next advances');
equal(state.playing, false, 'manual next remains paused');
state = runtimeReducer(state, { type: 'PREVIOUS' });
equal(state.eventIndex, 0, 'previous returns');
state = runtimeReducer(state, { type: 'PREVIOUS' });
equal(state.eventIndex, 0, 'previous clamps at zero');

state = runtimeReducer(state, { type: 'PLAY' });
equal(state.playing, true, 'play starts');
state = runtimeReducer(state, { type: 'NEXT', eventCount: 5 });
equal(state.eventIndex, 1, 'play timer advances one event');
equal(state.playing, false, 'checkpoint pauses playback');
state = runtimeReducer(state, { type: 'PAUSE' });
equal(state.playing, false, 'pause is idempotent');

state = runtimeReducer(state, { type: 'SET_LOCALE', locale: 'en' });
equal(state.locale, 'en', 'locale changes');
equal(state.eventIndex, 1, 'locale preserves event');
state = runtimeReducer(state, { type: 'SUBMIT_PREDICTION', status: 'correct', answer: 'MAP_CONSTRUCT' });
equal(state.predictionStatus, 'correct', 'prediction status');
equal(state.eventIndex, 1, 'prediction preserves event');

state = runtimeReducer(state, { type: 'CHANGE_INPUT', value: 'capacity=3' });
equal(state.inputRevision, 1, 'input revision increments');
equal(state.inputValue, 'capacity=3', 'input value retained');
equal(state.eventIndex, 0, 'input change resets event');
equal(state.predictionStatus, 'idle', 'input change clears prediction');

state = runtimeReducer(state, { type: 'SELECT_PATTERN', patternId: 'STACK_PUSH' });
equal(state.patternId, 'STACK_PUSH', 'pattern changes');
equal(state.eventIndex, 0, 'pattern starts at zero');
equal(state.locale, 'en', 'pattern change preserves locale');
equal(state.inputRevision, 0, 'pattern change clears revision');

state = runtimeReducer(state, { type: 'NEXT', eventCount: 1 });
equal(state.eventIndex, 0, 'next clamps at final event');
state = runtimeReducer(state, { type: 'RESET' });
equal(state.eventIndex, 0, 'reset event');
equal(state.inputRevision, 0, 'reset revision');

console.log(JSON.stringify({ status: 'PASS', reducer_actions: 9, assertions }, null, 2));

