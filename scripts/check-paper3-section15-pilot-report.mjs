// Evidence consolidation only; does not run product code or replace manual review.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,stat,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {EVIDENCE_DIR} from './check-paper3-section15-browser-helpers.mjs';
const buildId='N7BOqFcMl0J8OaPU6E0kC';
const sha=b=>createHash('sha256').update(b).digest('hex');
const get=async n=>JSON.parse(await readFile(path.join(EVIDENCE_DIR,n),'utf8'));
const model=await get('QA_PILOT_MODELS_RESULT.json'),browser=await get('QA_PILOT_BROWSER_RESULT.json'),supplement=await get('QA_PILOT_SUPPLEMENT_RESULT.json');
for(const report of [model,browser,supplement]){assert.equal(report.buildId,buildId);assert.equal(report.decision,'PASS');}
for(const report of [browser,supplement]){for(const key of ['sourceMatches','htmlBeforeMatches','htmlAfterMatches','sourceUnchangedAfter'])assert.equal(report.buildBinding[key],true);assert.equal(report.buildBinding.endBuildId,buildId);}
for(const[file,hash]of Object.entries(model.hashes))assert.equal(browser.snapshotHashes[file],hash);
const manifestBytes=await readFile(path.join(EVIDENCE_DIR,'PILOT_CANDIDATE_MANIFEST.json'));
const manifest=JSON.parse(manifestBytes);const manifestSha=sha(manifestBytes);assert.equal(manifestSha,'e2832f171c0da7b004f8eeeb5945eb339c7dc73e2071b1c7ea27da4c67ffbc35');assert.equal(manifest.buildId,buildId);assert.equal(manifest.availability.available,16);assert.equal(manifest.availability.section15Available,0);
const captures=(await get('QA_PILOT_RENDERED_STATES.json')).captures;const counts=Object.fromEntries([...new Set(captures.map(x=>x.kind))].map(k=>[k,captures.filter(x=>x.kind===k).length]));
assert.equal(counts.pipeline,58);assert.equal(counts.logic,256);assert.equal(counts['pipeline-cell'],700);assert.equal(counts.checkpoint,72);
const summary={schemaVersion:1,checkedAt:new Date().toISOString(),decision:'PASS',scope:'Independent QA/code-review gate for two Section15 pilots only',buildId,baseUrl:browser.baseUrl,manifestSha256:manifestSha,pilots:{'pipelines-registers-and-interrupts':'PASS','circuit-truth-table-and-expression':'PASS'},dualPilotQaGate:'PASS',teacherPostRender:'Separate Teacher-owned gate; no claim made by this QA result',models:{assertions:model.assertions,decision:model.decision,hashes:model.hashes},browser:{checks:browser.checksRun,passed:browser.checksPassed,binding:browser.buildBinding},supplement:{checks:supplement.checksRun,passed:supplement.checksPassed,binding:supplement.buildBinding},captureCounts:counts,productHashesBound:Object.keys(browser.candidateHashes).length,availability:manifest.availability,blockers:{matrixOverflow:'CLOSED: local TH containment and320/768/1440/reflow verified',gateInputArity:'CLOSED:256 actual SVG wire-count/geometry checks plus screenshot inspection'},openMaterialFindings:[],limits:['Two pilots only; seven Section15 lessons remain outside this gate','Chromium responsive automation, not cross-browser/device or student trial','No availability promotion, deployment or product edit by QA'],archiveDirectory:'QA_ARCHIVE_'+buildId};
await writeFile(path.join(EVIDENCE_DIR,'QA_PILOT_DECISION.json'),JSON.stringify(summary,null,2)+'\n');
await writeFile(path.join(EVIDENCE_DIR,'QA_PILOT_MANIFEST.json'),manifestBytes);
const archive=path.join(EVIDENCE_DIR,summary.archiveDirectory);await mkdir(archive,{recursive:true});
const files=['QA_PILOT_DECISION.json','QA_PILOT_MANIFEST.json','QA_PILOT_MODELS_RESULT.json','QA_PILOT_BROWSER_RESULT.json','QA_PILOT_RENDERED_STATES.json','QA_PILOT_SUPPLEMENT_RESULT.json','QA_PILOT_SUPPLEMENT_STATES.json','QA_PILOT_HASH_REGRESSION.json','QA_PILOT_REVIEW.md','QA_PILOT_FINDINGS.md'];
for(const name of await readdir(EVIDENCE_DIR))if(name.startsWith('QA_PILOT_')&&name.endsWith('.png')&&(await stat(path.join(EVIDENCE_DIR,name))).mtimeMs>=Date.parse(browser.startedAt))files.push(name);
const index=[];for(const name of files){const source=path.join(EVIDENCE_DIR,name);await copyFile(source,path.join(archive,name));index.push({file:name,sha256:sha(await readFile(source))});}
await writeFile(path.join(archive,'QA_ARCHIVE_INDEX.json'),JSON.stringify({buildId,manifestSha256:manifestSha,createdAt:new Date().toISOString(),files:index},null,2)+'\n');
console.log(JSON.stringify({decision:summary.decision,buildId,models:model.assertions,browser:browser.checksRun,supplement:supplement.checksRun,productHashesBound:summary.productHashesBound,captureCounts:counts,archivedFiles:index.length,archiveDirectory:archive},null,2));
