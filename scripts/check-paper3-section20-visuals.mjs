import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, section20CandidateFiles } from "./check-paper3-section20-oracle.mjs";

const AUTHORING_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const ROOT=process.env.PAPER3_PREVIEW_DIR?path.resolve(process.env.PAPER3_PREVIEW_DIR):AUTHORING_ROOT;
const EVIDENCE=path.resolve(AUTHORING_ROOT,"../planning/paper3-2026/completion-program-2026/evidence/section20");
const files={model:"app/lib/paper3/further-programming-models.ts",renderer:"app/components/paper3-learning/lessons/Section20FurtherProgrammingWorkbench.tsx",css:"app/components/paper3-learning/lessons/Section20FurtherProgrammingWorkbench.module.css",stage:"app/components/paper3-learning/lessons/VisualStage.tsx",primer:"app/components/paper3-learning/lessons/CambridgeVisualPrimer.tsx",types:"app/lib/paper3/lesson-types.ts",registry:"app/lib/paper3/lesson-registry.ts"};
const [contract,oracles,fixtures]=await Promise.all(["SECTION20_MODEL_CONTRACTS.json","SECTION20_QA_ORACLES.json","MODEL_FIXTURES.json"].map(name=>readFile(path.join(EVIDENCE,name),"utf8").then(JSON.parse)));
const sources={};for(const [key,relative] of Object.entries(files))sources[key]=await readFile(path.join(ROOT,relative),"utf8").catch(()=>"");
const checks=[];const record=(id,pass,expected,actual)=>checks.push({id,pass:Boolean(pass),expected,actual});
const hash=value=>createHash("sha256").update(value).digest("hex");
const hashCandidates=async root=>Object.fromEntries(await Promise.all(section20CandidateFiles.map(async relative=>{
 try{return[relative,hash(await readFile(path.join(root,relative)))];}catch{return[relative,null];}
})));
record("S20-VISUAL-CONTRACT-LOCK",contract.status==="LOCKED_FOR_IMPLEMENTATION","LOCKED_FOR_IMPLEMENTATION",contract.status);
record("S20-VISUAL-ORACLE-LOCK",oracles.status==="LOCKED_BEFORE_IMPLEMENTATION","LOCKED_BEFORE_IMPLEMENTATION",oracles.status);
for(const [key,text] of Object.entries(sources))record(`S20-VISUAL-FILE-${key}`,text.length>0,"non-empty source",text.length);
for(const lesson of lessons){
 record(`S20-VISUAL-KIND-${lesson.kind}`,sources.types.includes(`"${lesson.kind}"`)&&sources.stage.includes(lesson.kind)&&sources.renderer.includes(lesson.kind),"kind appears in type, dispatch and renderer",lesson.kind);
 record(`S20-VISUAL-REGISTRY-${lesson.slug}`,sources.registry.includes(`"${lesson.slug}"`),"registered lesson",lesson.slug);
 record(`S20-VISUAL-PRIMER-${lesson.kind}`,sources.primer.includes(lesson.kind),"quick-reference primer entry",lesson.kind);
}
for(const api of contract.api){
 const functionName=api.signature.split("(")[0];
 record(`S20-VISUAL-API-${api.visualKind}`,sources.model.includes(`function ${functionName}`)||sources.model.includes(`const ${functionName}`)||sources.model.includes(`export ${functionName}`),api.signature,functionName);
 for(const scenario of api.scenarioIds)record(`S20-VISUAL-SCENARIO-${api.visualKind}-${scenario}`,sources.model.includes(`"${scenario}"`)||sources.model.includes(`'${scenario}'`)||sources.renderer.includes(`"${scenario}"`)||sources.renderer.includes(`'${scenario}'`),"scenario represented in model/renderer",scenario);
}
const semanticIds=Object.values(contract.semanticLineIds).filter(value=>value&&typeof value==="object").flatMap(Object.keys);
for(const id of semanticIds)record(`S20-VISUAL-SEMANTIC-${id}`,sources.model.includes(id),"semantic ID in model",id);
for(const hook of contract.rendererContract.semanticHooks)record(`S20-VISUAL-HOOK-${hook}`,sources.renderer.includes(hook.replace(/^data-/,"data-")),"renderer semantic hook",hook);
for(const selector of Object.values(contract.rendererContract.controls)){
 const attribute=selector.match(/\[(data-[^\]]+)/)?.[1];
 record(`S20-VISUAL-CONTROL-${attribute}`,Boolean(attribute&&sources.renderer.includes(attribute)),"renderer control hook",attribute);
}
for(const token of ["Previous","Next","Reset","Trước","Tiếp","Đặt lại","aria-live","tabIndex","details"]){record(`S20-VISUAL-UI-${token}`,sources.renderer.includes(token),"required UI/a11y token",token);}
record("S20-VISUAL-UI-status-role",/role\s*=\s*(?:["']status["']|\{["']status["']\})/.test(sources.renderer),"status live-region role","role=status");
record("S20-VISUAL-NO-ARBITRARY-CODE",!/eval\s*\(|new Function\s*\(/.test(sources.model+sources.renderer),"no arbitrary evaluator",null);
record("S20-VISUAL-INMEMORY-FILES",!/\b(?:readFile|writeFile|createWriteStream|openSync)\b/.test(sources.model+sources.renderer),"file visuals do not touch user filesystem",null);
record("S20-VISUAL-NO-INTERNAL-DISCLOSURE",!/(?:completion-program-2026|MODEL_FIXTURES\.json|TEACHER_SOURCE_|[A-Z]:[\\/])/.test(sources.renderer+lessons.map(({slug})=>sources[slug]??"").join("")),"no learner-visible internal evidence metadata",null);
record("S20-VISUAL-FALLBACK",/(fallback|table|code)/i.test(sources.renderer),"semantic fallback in renderer",null);
record("S20-VISUAL-REDUCED-MOTION",sources.css.includes("prefers-reduced-motion"),"reduced-motion CSS",null);
record("S20-VISUAL-RESPONSIVE",/@media[^{}]*(?:max-width|width)/.test(sources.css),"responsive CSS",null);
record("S20-VISUAL-DARK",/(?:\.dark|:global\(\.dark\)|prefers-color-scheme|--)/.test(sources.css),"theme-aware CSS",null);
let buildId=null;try{buildId=(await readFile(path.join(ROOT,".next/BUILD_ID"),"utf8")).trim();}catch{/* source-only run */}
const [candidateHashes,authoringHashes]=await Promise.all([hashCandidates(ROOT),hashCandidates(AUTHORING_ROOT)]);
const missingCandidateFiles=Object.entries(candidateHashes).filter(([,digest])=>!digest).map(([relative])=>relative);
const comparableFiles=section20CandidateFiles.filter(relative=>relative!=="content/paper3/lesson-status.json");
const candidateMatchesAuthoring=comparableFiles.every(relative=>candidateHashes[relative]&&candidateHashes[relative]===authoringHashes[relative]);
record("S20-VISUAL-BINDING-files",missingCandidateFiles.length===0,"all Section 20 candidate files hashable",missingCandidateFiles);
if(ROOT!==AUTHORING_ROOT)record("S20-VISUAL-BINDING-authoring",candidateMatchesAuthoring,"isolated candidate matches authoring sources except promotion metadata",candidateMatchesAuthoring);
if(process.env.PAPER3_EXPECTED_BUILD_ID)record("S20-VISUAL-BINDING-build-id",buildId===process.env.PAPER3_EXPECTED_BUILD_ID,process.env.PAPER3_EXPECTED_BUILD_ID,buildId);
const failures=checks.filter(check=>!check.pass);
const report={schemaVersion:1,gate:"paper3-section20-static-visual-contract",startedAt:new Date().toISOString(),completedAt:new Date().toISOString(),decision:failures.length?"FAIL":"PASS",buildId,previewRoot:ROOT,isolatedPreview:ROOT!==AUTHORING_ROOT,sourceBoundToIsolatedPreview:ROOT!==AUTHORING_ROOT&&Boolean(buildId)&&candidateMatchesAuthoring&&(!process.env.PAPER3_EXPECTED_BUILD_ID||buildId===process.env.PAPER3_EXPECTED_BUILD_ID),assertions:checks.length,passed:checks.length-failures.length,failures,candidateHashes,missingCandidateFiles,candidateMatchesAuthoring,modelSha256:sources.model?hash(sources.model):null,rendererSha256:sources.renderer?hash(sources.renderer):null,cssSha256:sources.css?hash(sources.css):null,fixtureSha256:hash(await readFile(path.join(EVIDENCE,"MODEL_FIXTURES.json"))),contractSha256:hash(await readFile(path.join(EVIDENCE,"SECTION20_MODEL_CONTRACTS.json"))),checks};
await writeFile(path.join(EVIDENCE,"QA_VISUALS_RESULT.json"),`${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify({...report,checks:undefined},null,2));if(failures.length)process.exitCode=1;
