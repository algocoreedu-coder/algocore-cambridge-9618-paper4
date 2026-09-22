import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const registry = JSON.parse(fs.readFileSync(path.join(projectRoot, 'app/data/stage8-runtime-registry.json'), 'utf8'));
const translationPath = path.join(projectRoot, 'app/components/paper4-visual/invariantTranslations.ts');
const compiled = ts.transpileModule(fs.readFileSync(translationPath, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  fileName: translationPath,
});
const translations = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const viMap = translations.viInvariantTranslations;

const asItems = (value) => Array.isArray(value) ? value : [value];
const bilingual = /^VI:\s*([\s\S]*?)\s*\|\s*EN:\s*([\s\S]*)$/;
const unresolved = [];
let localizedArrayEvents = 0;
let equalSourceEvents = 0;

for (const pattern of registry.patterns) {
  for (const event of pattern.events) {
    const value = event.invariant_or_criterion;
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const viItems = asItems(value.vi);
    const enItems = asItems(value.en);
    if (Array.isArray(value.vi) || Array.isArray(value.en)) localizedArrayEvents += 1;
    if (JSON.stringify(value.vi) === JSON.stringify(value.en)) equalSourceEvents += 1;
    for (const item of viItems) {
      if (typeof item !== 'string') continue;
      if (bilingual.test(item)) continue;
      const sameEnglishItem = enItems.includes(item);
      if (sameEnglishItem && !viMap[item]) {
        unresolved.push({ pattern_id: pattern.pattern_id, event_id: event.event_id, text: item });
      }
    }
  }
}

assert.equal(localizedArrayEvents, 103, 'locked locale-array denominator');
assert.equal(equalSourceEvents, 202, 'locked equal-locale source denominator');
assert.deepEqual(unresolved, [], 'every equal English source invariant has a Stage 8 Vietnamese overlay');

console.log(JSON.stringify({
  status: 'PASS',
  locale_array_events: localizedArrayEvents,
  equal_locale_source_events: equalSourceEvents,
  vietnamese_overlay_entries: Object.keys(viMap).length,
  unresolved_equal_english_items: unresolved.length
}, null, 2));

