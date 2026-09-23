import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const stage8Root = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(stage8Root, '../../../..');
const appRoot = path.join(workspaceRoot, 'A_Level_CS_page/algocore-fumadocs');
const excludedStage8 = new Set(['RELEASE_MANIFEST.json', 'RELEASE_VERIFICATION.json', 'STAGE9_HANDOFF.json']);
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const stage8Files = walk(stage8Root).filter((absolute) => !excludedStage8.has(path.relative(stage8Root, absolute).replaceAll('\\', '/')));
const implementationFiles = [
  ...walk(path.join(appRoot, 'app/components/paper4-visual')),
  ...walk(path.join(appRoot, 'app/paper-4')),
  path.join(appRoot, 'app/data/stage8-runtime-registry.json'),
  path.join(appRoot, 'app/docs/layout.tsx'),
  path.join(appRoot, 'app/globals.css'),
  path.join(appRoot, 'package.json'),
  path.join(appRoot, 'package-lock.json'),
  path.join(appRoot, 'README.md'),
  path.join(appRoot, 'scripts/build-stage8-registry.mjs'),
  path.join(appRoot, 'scripts/verify-stage8-registry.mjs'),
  path.join(appRoot, 'scripts/verify-stage8-reducer.mjs'),
  path.join(appRoot, 'scripts/verify-stage8-localization.mjs'),
];

const files = [...new Set([...stage8Files, ...implementationFiles])]
  .sort((a, b) => a.localeCompare(b))
  .map((absolute) => {
    const bytes = fs.readFileSync(absolute);
    return {
      path: path.relative(workspaceRoot, absolute).replaceAll('\\', '/'),
      sha256: sha256(bytes),
      bytes: bytes.byteLength,
    };
  });

const manifest = {
  schema_version: 's8-release-manifest-v1',
  release_id: 'paper4-2026-s8-v1',
  source_release_id: 'paper4-2026-s7-v1',
  source_manifest_sha256: '3ed03798f614b22307e07034ec36326af13cda58fd68dc6fd65dd3feb73cb01f',
  generated_at: '2026-09-22T16:00:00+07:00',
  counts: { patterns: 58, scenarios: 174, unique_events: 331 },
  file_count: files.length,
  files,
};
const manifestPath = path.join(stage8Root, 'RELEASE_MANIFEST.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
const manifestSha256 = sha256(fs.readFileSync(manifestPath));

const mismatches = [];
for (const row of manifest.files) {
  const absolute = path.join(workspaceRoot, row.path);
  if (!fs.existsSync(absolute)) {
    mismatches.push({ path: row.path, reason: 'missing' });
    continue;
  }
  const bytes = fs.readFileSync(absolute);
  if (bytes.byteLength !== row.bytes || sha256(bytes) !== row.sha256) {
    mismatches.push({ path: row.path, reason: 'hash_or_size_mismatch' });
  }
}
const verification = {
  schema_version: 's8-release-verification-v1',
  release_id: manifest.release_id,
  status: mismatches.length === 0 ? 'PASS' : 'FAIL',
  manifest_sha256: manifestSha256,
  files_checked: manifest.files.length,
  mismatches,
  verified_at: '2026-09-22T16:00:00+07:00',
};
fs.writeFileSync(path.join(stage8Root, 'RELEASE_VERIFICATION.json'), `${JSON.stringify(verification, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(verification, null, 2));
if (mismatches.length) process.exitCode = 1;
