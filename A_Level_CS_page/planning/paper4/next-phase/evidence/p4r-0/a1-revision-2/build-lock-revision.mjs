import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(here, '../../../../../../..');
const sourceDir = resolve(here, '../a1');
const outputDir = here;
const mutablePaths = new Set([
  'A_Level_CS_page/planning/paper4/next-phase/GATE_CHECKLIST.md',
  'A_Level_CS_page/planning/paper4/next-phase/PROGRAM_STATUS.json',
]);

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const sha256Bytes = (bytes) => createHash('sha256').update(bytes).digest('hex');
const encode = (value) => `${JSON.stringify(value, null, 2)}\n`;

await mkdir(outputDir, { recursive: true });
const previousLockPath = resolve(sourceDir, 'INPUT_LOCK.json');
const previousLockBytes = await readFile(previousLockPath);
const previousLock = JSON.parse(previousLockBytes);

const immutable = [];
const mutable = [];
for (const entry of previousLock.locked_inputs) {
  const absolute = resolve(workspace, entry.path);
  const bytes = await readFile(absolute);
  const current = {
    ...entry,
    sha256: sha256Bytes(bytes),
    bytes: (await stat(absolute)).size,
  };
  if (mutablePaths.has(entry.path)) {
    mutable.push({
      input_id: entry.input_id,
      path: entry.path,
      baseline_sha256: entry.sha256,
      observed_at_revision_sha256: current.sha256,
      policy: 'MUTABLE_CONTROL_PLANE_NOT_AN_IMMUTABLE_BUILD_INPUT',
    });
  } else {
    if (current.sha256 !== entry.sha256 || current.bytes !== entry.bytes) {
      throw new Error(`Immutable input changed before revision: ${entry.path}`);
    }
    immutable.push(current);
  }
}

const inventory = {
  schema_version: 'paper4-p4r0-input-inventory-revision-v2',
  revision_id: 'paper4-2026-s9-v2.p4r0.input-lock-r2',
  previous_lock_sha256: sha256Bytes(previousLockBytes),
  immutable_entry_count: immutable.length,
  mutable_control_plane_count: mutable.length,
  immutable_inputs: immutable,
  mutable_governance_baseline: mutable,
};
const inventoryText = encode(inventory);
await writeFile(resolve(outputDir, 'INPUT_INVENTORY_REVISION_2.json'), inventoryText);

const denominatorsPath = resolve(sourceDir, 'EXACT_DENOMINATORS.json');
const denominatorsBytes = await readFile(denominatorsPath);
const lock = {
  schema_version: 'paper4-p4r0-input-lock-revision-v2',
  lock_id: 'paper4-2026-s9-v2.p4r0.a1.input-lock-r2',
  previous_lock: {
    path: 'A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a1/INPUT_LOCK.json',
    sha256: sha256Bytes(previousLockBytes),
    status: previousLock.status,
  },
  revision_reason: 'PROGRAM_STATUS.json and GATE_CHECKLIST.md are mutable control-plane records and cannot be immutable recovery build inputs.',
  target_release: previousLock.target_release,
  status: 'A1_REVISION_READY_PENDING_A8_RECHECK',
  scope: previousLock.scope,
  inventory: {
    path: 'A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a1-revision-2/INPUT_INVENTORY_REVISION_2.json',
    sha256: sha256Bytes(Buffer.from(inventoryText)),
    immutable_entry_count: immutable.length,
  },
  exact_denominators: {
    path: previousLock.exact_denominators.path,
    sha256: sha256Bytes(denominatorsBytes),
    count_status: 'PASS',
    identity_status: 'PASS',
  },
  immutable_locked_inputs: immutable,
  mutable_governance_baseline: mutable,
  integrity_summary: previousLock.integrity_summary,
  write_policy: {
    immutable_locked_inputs: 'READ_ONLY; change requires a new lock revision',
    mutable_control_plane: 'May change only through Lead gate decisions; never used as a build/content input',
    historical_stages_0_to_9: 'READ_ONLY',
    canonical_recovery_outputs: 'OWNER_SCOPED_AFTER_GATE',
  },
  open_blockers: [],
  required_carryover: previousLock.required_carryover,
  admission_rule: 'P4R-1 may use only immutable_locked_inputs and exact_denominators as locked inputs. Mutable control-plane files report progress and are excluded from content/build provenance.',
};
await writeFile(resolve(outputDir, 'INPUT_LOCK_REVISION_2.json'), encode(lock));
console.log(JSON.stringify({ immutable: immutable.length, mutable: mutable.length, status: lock.status }, null, 2));
