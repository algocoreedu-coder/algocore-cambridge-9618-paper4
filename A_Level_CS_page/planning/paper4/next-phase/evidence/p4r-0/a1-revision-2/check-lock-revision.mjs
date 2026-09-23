import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(here, '../../../../../../..');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const lock = JSON.parse(await readFile(resolve(here, 'INPUT_LOCK_REVISION_2.json'), 'utf8'));
const failures = [];

for (const entry of lock.immutable_locked_inputs) {
  const absolute = resolve(workspace, entry.path);
  const bytes = await readFile(absolute);
  const size = (await stat(absolute)).size;
  if (sha256(bytes) !== entry.sha256 || size !== entry.bytes) failures.push(entry.path);
}

const inventoryBytes = await readFile(resolve(workspace, lock.inventory.path));
if (sha256(inventoryBytes) !== lock.inventory.sha256) failures.push('inventory-link');
const denominatorBytes = await readFile(resolve(workspace, lock.exact_denominators.path));
if (sha256(denominatorBytes) !== lock.exact_denominators.sha256) failures.push('denominator-link');

const forbidden = new Set(lock.mutable_governance_baseline.map((item) => item.path));
if (lock.immutable_locked_inputs.some((item) => forbidden.has(item.path))) failures.push('mutable-in-immutable-set');
if (lock.immutable_locked_inputs.length !== 51) failures.push('immutable-count');
if (lock.mutable_governance_baseline.length !== 2) failures.push('mutable-count');

console.log(JSON.stringify({
  decision: failures.length ? 'FAIL' : 'PASS',
  mode: 'READ_ONLY',
  immutable_inputs: lock.immutable_locked_inputs.length,
  mutable_control_plane: lock.mutable_governance_baseline.length,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
