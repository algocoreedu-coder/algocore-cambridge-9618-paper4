import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from './build-stage8-registry.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const stage7Root = path.resolve(projectRoot, '../planning/paper4/stage-7');
const evidenceRoot = path.resolve(projectRoot, '../planning/paper4/stage-8/evidence/s8-a');
const registryPath = path.resolve(projectRoot, 'app/data/stage8-runtime-registry.json');
const handoffPath = path.join(stage7Root, 'STAGE8_HANDOFF.json');
const manifestPath = path.join(stage7Root, 'RELEASE_MANIFEST.json');
const expected = { patterns: 58, scenarios: 174, unique_events: 331 };
const lock = {
  release: 'paper4-2026-s7-v1',
  handoff: 'a2ee707670513960980e610058dbd82dafa8f0d10ce8f7781e02d76e5ecb49df',
  manifest: '3ed03798f614b22307e07034ec36326af13cda58fd68dc6fd65dd3feb73cb01f',
};
const sha256File = (filename) => crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
const writeEvidence = (payload) => {
  fs.mkdirSync(evidenceRoot, { recursive: true });
  fs.writeFileSync(path.join(evidenceRoot, 'S8A_SELF_VALIDATION.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
};
const scenarioReferencesValid = (registry) => registry.patterns.every((pattern) => pattern.scenarios.every((scenario) => scenario.event_ids.length === pattern.events.length && scenario.event_ids.every((id) => pattern.events.some((event) => event.event_id === id))));

function verify(registry) {
  const findings = [];
  const checks = {};
  checks.source_release = registry.source_release_id === lock.release;
  checks.source_handoff_hash = sha256File(handoffPath) === lock.handoff && registry.source_handoff_sha256 === lock.handoff;
  checks.source_manifest_hash = sha256File(manifestPath) === lock.manifest && registry.source_manifest_sha256 === lock.manifest;
  checks.counts = JSON.stringify(registry.counts) === JSON.stringify(expected);
  checks.pattern_ids_unique = new Set(registry.patterns.map((pattern) => pattern.pattern_id)).size === registry.patterns.length;
  const eventIds = [];
  const scenarioIds = [];
  checks.pattern_contract = registry.patterns.every((pattern) => {
    const patternEventIds = pattern.events.map((event) => event.event_id);
    const sequences = pattern.events.map((event) => event.sequence);
    const sourceOk = pattern.source?.source_path && pattern.source?.source_sha256 && pattern.source?.source_locator && pattern.source.batch;
    const bilingual = pattern.title?.en && pattern.title?.vi && pattern.purpose?.en && pattern.purpose?.vi;
    const eventContract = pattern.events.every((event) => event.pattern_id === pattern.pattern_id && event.source?.source_path && event.source?.source_sha256 && event.source?.source_locator && event.locale_views?.includes('vi') && event.locale_views?.includes('en'));
    eventIds.push(...patternEventIds);
    scenarioIds.push(...pattern.scenarios.map((scenario) => scenario.scenario_id));
    const sequenceOk = sequences.every((sequence, index) => sequence === index + 1);
    const scenariosOk = pattern.scenarios.length === 3 && pattern.scenarios.every((scenario) => scenario.event_ids.length === patternEventIds.length && scenario.event_ids.every((id) => patternEventIds.includes(id)));
    return pattern.scenario_count === 3 && sourceOk && bilingual && eventContract && sequenceOk && scenariosOk;
  });
  checks.event_ids_unique = new Set(eventIds).size === eventIds.length;
  checks.scenario_ids_unique = new Set(scenarioIds).size === scenarioIds.length;
  checks.source_hashes_complete = registry.source_hashes.length === 4 && registry.source_hashes.every((source) => source.sha256 && source.path && source.batch);
  checks.source_hashes_match = checks.source_hashes_complete && registry.source_hashes.every((source) => sha256File(path.resolve(projectRoot, '../planning/paper4', source.path)) === source.sha256);
  checks.stage7_boundary_preserved = registry.patterns.every((pattern) => pattern.events.every((event) => event.status === 'Stage7_specified'));
  const mutation = structuredClone(registry);
  mutation.patterns[0].scenarios[0].event_ids[0] = 'mutation-fixture:unknown-event';
  checks.mutation_fixture_rejected = !scenarioReferencesValid(mutation);
  for (const [name, passed] of Object.entries(checks)) if (!passed) findings.push(name);
  const registryHash = sha256File(registryPath);
  const rebuilt = buildRegistry();
  const rebuiltHash = sha256File(registryPath);
  checks.deterministic_rebuild = registryHash === rebuiltHash && JSON.stringify(rebuilt.counts) === JSON.stringify(expected);
  if (!checks.deterministic_rebuild) findings.push('deterministic_rebuild');
  return { checks, findings, registryHash: rebuiltHash };
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const result = verify(registry);
const evidence = {
  schema_version: 's8-a-self-validation-v1',
  stage: 8,
  wave: 'S8-A',
  input_release: lock.release,
  source_handoff_sha256: lock.handoff,
  source_manifest_sha256: lock.manifest,
  commands: ['node scripts/build-stage8-registry.mjs', 'node scripts/verify-stage8-registry.mjs'],
  counts: registry.counts,
  checks: result.checks,
  findings: result.findings,
  status: result.findings.length === 0 ? 'PASS' : 'REWORK',
  owner: 'A1_A4',
  reviewer: 'A0_LEAD_PENDING',
  generated_at: '2026-09-22T00:00:00.000Z',
  artifacts: {
    registry_path: 'A_Level_CS_page/algocore-fumadocs/app/data/stage8-runtime-registry.json',
    registry_sha256: result.registryHash,
  },
};
writeEvidence(evidence);
console.log(JSON.stringify(evidence, null, 2));
if (evidence.status !== 'PASS') process.exitCode = 1;
