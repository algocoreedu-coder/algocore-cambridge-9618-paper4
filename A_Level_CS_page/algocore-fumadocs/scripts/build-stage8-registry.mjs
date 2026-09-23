import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const stage7Root = path.resolve(projectRoot, '../planning/paper4/stage-7');
const stage8EvidenceRoot = path.resolve(projectRoot, '../planning/paper4/stage-8/evidence/s8-a');
const outputPath = path.resolve(projectRoot, 'app/data/stage8-runtime-registry.json');

const sourceReleaseId = 'paper4-2026-s7-v1';
const stage7SpecReleaseId = 'paper4-2026-s6-v1';
const sourceManifestSha256 = '3ed03798f614b22307e07034ec36326af13cda58fd68dc6fd65dd3feb73cb01f';
const sourceHandoffSha256 = 'a2ee707670513960980e610058dbd82dafa8f0d10ce8f7781e02d76e5ecb49df';
const generatedAt = '2026-09-22T00:00:00.000Z';
const sources = [
  ['s7-b', 'FOUNDATIONS_TEXT_SEARCH_SORT'],
  ['s7-c', 'STACK_QUEUE_LINKED_LIST'],
  ['s7-d', 'RECURSION_TREE_HASHING'],
  ['s7-e', 'OOP_FILES_SUPPORT_INTEGRATION'],
];

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const readJson = (filename) => JSON.parse(fs.readFileSync(filename, 'utf8'));
const relativeSourcePath = (wave) => `stage-7/evidence/${wave}/VISUAL_EVENT_SPECS.json`;
const humanize = (value) => value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const slug = (value) => value.toLowerCase().replace(/_/g, '-');
const sourceMetadata = (wave, batch, sourcePath, sourceSha256, locator) => ({
  wave,
  batch,
  source_path: sourcePath,
  source_sha256: sourceSha256,
  source_locator: locator,
});

export function buildRegistry() {
  const patterns = [];
  const seenPatterns = new Set();
  const seenEvents = new Set();
  const sourceHashes = [];

  for (const [wave, expectedBatch] of sources) {
    const absolute = path.join(stage7Root, 'evidence', wave, 'VISUAL_EVENT_SPECS.json');
    const bytes = fs.readFileSync(absolute);
    const sourceSha256 = sha256(bytes);
    const sourcePath = relativeSourcePath(wave);
    const source = readJson(absolute);
    if (source.release_id !== stage7SpecReleaseId) throw new Error(`${wave}: Stage7 spec release_id mismatch`);
    if (source.batch !== expectedBatch) throw new Error(`${wave}: batch mismatch`);
    if (source.status !== 'Stage7_specified') throw new Error(`${wave}: Stage7 boundary status mismatch`);
    sourceHashes.push({ wave, batch: expectedBatch, path: sourcePath, sha256: sourceSha256 });

    const entriesByPattern = new Map();
    source.entries.forEach((entry, entryIndex) => {
      if (!entriesByPattern.has(entry.pattern_id)) entriesByPattern.set(entry.pattern_id, []);
      entriesByPattern.get(entry.pattern_id).push({ entry, entryIndex });
    });
    for (const patternId of source.patterns) {
      if (seenPatterns.has(patternId)) throw new Error(`duplicate pattern_id: ${patternId}`);
      const rows = entriesByPattern.get(patternId) ?? [];
      rows.sort((a, b) => a.entry.sequence - b.entry.sequence || a.entryIndex - b.entryIndex);
      if (rows.length === 0) throw new Error(`${patternId}: no event entries`);
      const eventIds = rows.map(({ entry }) => entry.event_id);
      if (new Set(eventIds).size !== eventIds.length) throw new Error(`${patternId}: duplicate event_id`);
      for (let i = 0; i < eventIds.length; i += 1) {
        const { entry, entryIndex } = rows[i];
        if (seenEvents.has(entry.event_id)) throw new Error(`duplicate event_id: ${entry.event_id}`);
        seenEvents.add(entry.event_id);
        if (entry.sequence !== i + 1) throw new Error(`${patternId}: non-contiguous sequence`);
        entry.source = sourceMetadata(wave, expectedBatch, sourcePath, sourceSha256, `${sourcePath}#/entries/${entryIndex}`);
      }
      const patternSource = sourceMetadata(wave, expectedBatch, sourcePath, sourceSha256, `${sourcePath}#/patterns/${source.patterns.indexOf(patternId)}`);
      const readable = humanize(patternId);
      const scenarios = ['normal', 'boundary', 'failure'].map((caseKind) => ({
        scenario_id: `visual-scenario:${slug(patternId)}:${caseKind}`,
        case_kind: caseKind,
        trace_id: rows[0].entry.trace_id,
        example_id: rows[0].entry.example_id,
        event_ids: [...eventIds],
        source: patternSource,
      }));
      patterns.push({
        pattern_id: patternId,
        title: { en: readable, vi: `Mẫu ${readable}` },
        purpose: {
          en: `Inspect the deterministic ${readable} event trace.`,
          vi: `Kiểm tra trace event ${readable} xác định.`,
        },
        source_batch: expectedBatch,
        source: patternSource,
        scenario_count: scenarios.length,
        scenarios,
        event_count: rows.length,
        events: rows.map(({ entry }) => entry),
      });
      seenPatterns.add(patternId);
    }
  }

  const registry = {
    schema_version: 'stage8-runtime-registry-v1',
    source_release_id: sourceReleaseId,
    source_manifest_sha256: sourceManifestSha256,
    source_handoff_sha256: sourceHandoffSha256,
    generated_at: generatedAt,
    counts: {
      patterns: patterns.length,
      scenarios: patterns.reduce((sum, pattern) => sum + pattern.scenario_count, 0),
      unique_events: seenEvents.size,
    },
    source_hashes: sourceHashes,
    patterns,
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  fs.mkdirSync(stage8EvidenceRoot, { recursive: true });
  return registry;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const registry = buildRegistry();
  console.log(JSON.stringify({ output: outputPath, counts: registry.counts, source_hashes: registry.source_hashes }, null, 2));
}
