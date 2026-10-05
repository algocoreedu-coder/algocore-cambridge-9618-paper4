import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const visualRoot = path.resolve(root, "../curriculum/paper_2/visuals");
const manifestPath = path.join(visualRoot, "manifest.json");
const studyMapPath = path.join(root, "content/paper2/study-map.json");
const exportedPath = path.join(root, "app/lib/paper2/generated/canonical-visuals.json");
const sourceFiles = ["concepts.js", "processes.js", "diagrams.js", "supplements.js"];
const sourcePaths = sourceFiles.map((filename) => `curriculum/paper_2/visuals/src/${filename}`);
const supportedSceneTypes = ["array", "graph", "diagram", "lanes", "table", "domain"];
const baseline = { assets: 67, variants: 126, frames: 638 };
const requiredExtension = { assets: 1, variants: 7, frames: 41 };
const expected = Object.fromEntries(Object.keys(baseline).map((key) => [key, baseline[key] + requiredExtension[key]]));
const requiredT04Assets = ["T04-F01", "T04-F03", "T04-F04", "T04-F05", "T04-F08"];
const requiredDateFixtureIds = ["same-month-same-weekday", "same-month-different-weekday", "different-month-same-weekday", "same-month-number-different-year", "year-boundary", "valid-leap-day"];
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const semanticSha256 = (value) => sha256(JSON.stringify(value));
const clone = (value) => JSON.parse(JSON.stringify(value));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const [manifestSource, studyMap, exported, exporterSource] = await Promise.all([
  readFile(manifestPath),
  readFile(studyMapPath, "utf8").then(JSON.parse),
  readFile(exportedPath, "utf8").then(JSON.parse),
  readFile(path.join(root, "scripts/export-paper2-visuals.mjs"), "utf8"),
]);
const manifest = JSON.parse(manifestSource.toString("utf8"));

const countInventory = (assets) => ({
  assets: assets.length,
  variants: assets.reduce((total, asset) => total + (asset.variants?.length ?? 0), 0),
  frames: assets.reduce((total, asset) => total + (asset.variants ?? []).reduce((sum, variant) => sum + (variant.frames?.length ?? 0), 0), 0),
});
const sceneInventory = (assets) => {
  const counts = Object.fromEntries(supportedSceneTypes.map((type) => [type, 0]));
  for (const asset of assets) for (const variant of asset.variants ?? []) for (const frame of variant.frames ?? []) {
    const type = frame.scene?.type ?? "missing";
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
};
const duplicateValues = (values) => values.filter((value, index) => values.indexOf(value) !== index);
const sameSet = (left, right) => left.size === right.size && [...left].every((value) => right.has(value));

const sourceContext = {};
sourceContext.globalThis = sourceContext;
vm.createContext(sourceContext);
const currentSourceHashes = {};
for (const [index, relative] of sourcePaths.entries()) {
  const source = await readFile(path.join(visualRoot, "src", sourceFiles[index]));
  currentSourceHashes[relative] = sha256(source);
  vm.runInContext(source.toString("utf8"), sourceContext, { filename: relative });
}
const sourceAssets = clone(Array.isArray(sourceContext.P2_VISUALS) ? sourceContext.P2_VISUALS : []);
const sourceById = new Map(sourceAssets.map((asset) => [asset.id, asset]));
const exportedAssets = Array.isArray(exported.assets) ? exported.assets : [];
const exportedById = new Map(exportedAssets.map((asset) => [asset.id, asset]));
const manifestIds = manifest.assets.map((asset) => asset.id);
const sourceIds = sourceAssets.map((asset) => asset.id);
const exportedIds = exportedAssets.map((asset) => asset.id);
const manifestIdSet = new Set(manifestIds);
const sourceIdSet = new Set(sourceIds);
const exportedIdSet = new Set(exportedIds);
const orderedSourceAssets = manifestIds.map((id) => sourceById.get(id)).filter(Boolean);
const sourceCounts = countInventory(sourceAssets);
const exportedCounts = countInventory(exportedAssets);
const manifestCounts = {
  assets: manifest.assets.length,
  variants: manifest.assets.reduce((total, asset) => total + asset.variants.length, 0),
  frames: manifest.assets.reduce((total, asset) => total + asset.variants.reduce((sum, variant) => sum + variant.frames, 0), 0),
};
const sourceSceneCounts = sceneInventory(sourceAssets);
const exportedSceneCounts = sceneInventory(exportedAssets);
const studyMapIds = new Set([
  ...studyMap.topics.flatMap((topic) => topic.visualIds ?? []),
  ...studyMap.sections.map((section) => section.mapAssetId).filter(Boolean),
]);

check(manifest.schemaVersion >= 2, "Visual manifest schemaVersion must be at least 2.");
check(duplicateValues(manifestIds).length === 0, `Manifest contains duplicate asset IDs: ${duplicateValues(manifestIds).join(", ")}.`);
check(duplicateValues(sourceIds).length === 0, `Canonical source contains duplicate asset IDs: ${duplicateValues(sourceIds).join(", ")}.`);
check(duplicateValues(exportedIds).length === 0, `Native export contains duplicate asset IDs: ${duplicateValues(exportedIds).join(", ")}.`);
check(sameSet(manifestIdSet, sourceIdSet), "Canonical source asset IDs do not exactly match the manifest.");
check(sameSet(manifestIdSet, exportedIdSet), "Native export asset IDs do not exactly match the manifest.");
check(JSON.stringify(exportedIds) === JSON.stringify(manifestIds), "Native export must retain manifest asset order.");
check(studyMapIds.size === expected.assets && sameSet(studyMapIds, manifestIdSet), `Study Map bindings must exactly cover the ${baseline.assets} baseline assets plus ${requiredExtension.assets} required extension; found ${studyMapIds.size}.`);

for (const key of Object.keys(expected)) {
  check(manifestCounts[key] === expected[key], `Manifest ${key} must equal baseline ${baseline[key]} + extension ${requiredExtension[key]} = ${expected[key]}; found ${manifestCounts[key]}.`);
  check(manifest.counts?.[key] === expected[key], `Manifest declared ${key} must equal ${expected[key]}; found ${manifest.counts?.[key]}.`);
  check(sourceCounts[key] === expected[key], `Canonical source ${key} must equal ${expected[key]}; found ${sourceCounts[key]}.`);
  check(exportedCounts[key] === expected[key], `Native export ${key} must equal ${expected[key]}; found ${exportedCounts[key]}.`);
  check(exported.baselineCounts?.[key] === baseline[key], `Native export baseline ${key} is stale.`);
  check(exported.extensionCounts?.[key] === requiredExtension[key], `Native export required extension ${key} is stale.`);
  check(exported.counts?.[key] === expected[key], `Native export declared ${key} is stale.`);
}
check(manifest.counts?.baselineAssets === baseline.assets, `Manifest must preserve the ${baseline.assets}-asset baseline declaration.`);
check(manifest.counts?.requiredExtensions === requiredExtension.assets, `Manifest must declare ${requiredExtension.assets} required extension.`);

check(exported.schemaVersion === 2, "Native export must use schemaVersion 2.");
check(exported.sourceManifest === "curriculum/paper_2/visuals/manifest.json", "Native export canonical manifest path is incorrect.");
check(exported.sourceManifestSha256 === sha256(manifestSource), "Native export does not match the current manifest hash.");
check(JSON.stringify(exported.generatedFrom) === JSON.stringify(sourcePaths), "Native export must name all four canonical source modules in order.");
check(JSON.stringify(exported.supportedSceneTypes) === JSON.stringify(supportedSceneTypes), "Native renderer must declare all six canonical scene types.");
check(supportedSceneTypes.every((type) => sourceSceneCounts[type] > 0 && exportedSceneCounts[type] === sourceSceneCounts[type]), "All six canonical scene types must be present with unchanged frame counts.");
check(Object.entries(currentSourceHashes).every(([relative, digest]) => exported.sourceHashes?.[relative] === digest), "One or more canonical source module hashes are stale.");
check(Object.keys(exported.sourceHashes ?? {}).length === sourcePaths.length, "Native export contains an incomplete or unexpected source hash set.");
check(exported.semanticSha256 === semanticSha256(orderedSourceAssets), "Whole-library semantic SHA-256 does not match canonical source in manifest order.");
check(exported.semanticSha256 === semanticSha256(exportedAssets), "Whole-library semantic SHA-256 does not match exported assets.");
check(!JSON.stringify(exported).includes("canonicalHtml"), "Native export must not embed standalone HTML provenance or copies.");

let verifiedAssets = 0;
let verifiedVariants = 0;
let verifiedFrames = 0;
let verifiedScenes = 0;
for (const manifestAsset of manifest.assets) {
  const sourceAsset = sourceById.get(manifestAsset.id);
  const exportedAsset = exportedById.get(manifestAsset.id);
  if (!sourceAsset || !exportedAsset) continue;
  verifiedAssets += 1;
  check(JSON.stringify(exportedAsset) === JSON.stringify(sourceAsset), `Native asset ${manifestAsset.id} changes or omits canonical source data.`);
  const expectedAssetHash = semanticSha256(sourceAsset);
  check(exported.assetHashes?.[manifestAsset.id] === expectedAssetHash, `Native asset digest is stale for ${manifestAsset.id}.`);
  const sourceVariants = new Map(sourceAsset.variants.map((variant) => [variant.id, variant]));
  const exportedVariants = new Map(exportedAsset.variants.map((variant) => [variant.id, variant]));
  check(sourceVariants.size === sourceAsset.variants.length, `${manifestAsset.id} canonical source contains duplicate variant IDs.`);
  check(exportedVariants.size === exportedAsset.variants.length, `${manifestAsset.id} native export contains duplicate variant IDs.`);
  check(JSON.stringify(exportedAsset.variants.map((variant) => variant.id)) === JSON.stringify(manifestAsset.variants.map((variant) => variant.id)), `${manifestAsset.id} native variant order differs from manifest.`);
  for (const manifestVariant of manifestAsset.variants) {
    const sourceVariant = sourceVariants.get(manifestVariant.id);
    const exportedVariant = exportedVariants.get(manifestVariant.id);
    if (!sourceVariant || !exportedVariant) {
      check(false, `${manifestAsset.id} is missing variant ${manifestVariant.id}.`);
      continue;
    }
    verifiedVariants += 1;
    check(sourceVariant.frames.length === manifestVariant.frames, `${manifestAsset.id}/${manifestVariant.id} canonical frame count differs from manifest.`);
    check(exportedVariant.frames.length === manifestVariant.frames, `${manifestAsset.id}/${manifestVariant.id} native frame count differs from manifest.`);
    check(duplicateValues(sourceVariant.frames.map((frame) => frame.id)).length === 0, `${manifestAsset.id}/${manifestVariant.id} contains duplicate frame IDs.`);
    for (let index = 0; index < sourceVariant.frames.length; index += 1) {
      const sourceFrame = sourceVariant.frames[index];
      const exportedFrame = exportedVariant.frames[index];
      verifiedFrames += 1;
      if (!exportedFrame) continue;
      check(JSON.stringify(exportedFrame) === JSON.stringify(sourceFrame), `${manifestAsset.id}/${manifestVariant.id}/${sourceFrame.id} changes canonical frame semantics.`);
      check(supportedSceneTypes.includes(sourceFrame.scene?.type), `${manifestAsset.id}/${manifestVariant.id}/${sourceFrame.id} uses unsupported scene type ${sourceFrame.scene?.type}.`);
      check(semanticSha256(exportedFrame.scene) === semanticSha256(sourceFrame.scene), `${manifestAsset.id}/${manifestVariant.id}/${sourceFrame.id} changes canonical scene structure.`);
      verifiedScenes += 1;
    }
  }
  const sourceTypes = [...new Set(sourceAsset.variants.flatMap((variant) => variant.frames.map((frame) => frame.scene?.type)))].sort();
  const manifestTypes = [...manifestAsset.sceneTypes].sort();
  check(JSON.stringify(sourceTypes) === JSON.stringify(manifestTypes), `${manifestAsset.id} scene types differ between manifest and source.`);
}
check(Object.keys(exported.assetHashes ?? {}).length === expected.assets, "Native export must contain exactly one digest for each canonical asset.");
check(requiredT04Assets.every((id) => sourceById.has(id) && exportedById.has(id)), `Native export must retain supplemental algorithm visuals: ${requiredT04Assets.join(", ")}.`);
const dateExtension = sourceById.get("T16-D01");
check(Boolean(dateExtension && exportedById.has("T16-D01")), "Required T16-D01 DATE extension must exist in canonical source and native export.");
if (dateExtension) {
  const dateVariantIds = dateExtension.variants.map((variant) => variant.id);
  const dateText = JSON.stringify(dateExtension);
  const bilingualGaps = [];
  const inspectBilingual = (value, pointer = "T16-D01") => {
    if (!value || typeof value !== "object") return;
    if (Object.hasOwn(value, "en") || Object.hasOwn(value, "vi")) {
      if (typeof value.en !== "string" || !value.en.trim() || typeof value.vi !== "string" || !value.vi.trim()) bilingualGaps.push(pointer);
    }
    if (Array.isArray(value)) value.forEach((item, index) => inspectBilingual(item, `${pointer}/${index}`));
    else Object.entries(value).forEach(([key, item]) => inspectBilingual(item, `${pointer}/${key}`));
  };
  inspectBilingual(dateExtension);
  check(JSON.stringify(dateVariantIds) === JSON.stringify(["contracts", ...requiredDateFixtureIds]), "T16-D01 must contain the contract scenario followed by all six frozen DATE fixtures in specification order.");
  check(dateExtension.variants.reduce((sum, variant) => sum + variant.frames.length, 0) === requiredExtension.frames, `T16-D01 must contain ${requiredExtension.frames} deterministic frames.`);
  check(["DAY", "MONTH", "YEAR", "DAYINDEX", "SETDATE", "TODAY", "Sunday=1", "Day, Month, Year", "BYREF", "BYVAL"].every((term) => dateText.includes(term)), "T16-D01 is missing a required DATE signature, weekday convention, parameter order or parameter-mode contrast.");
  check(bilingualGaps.length === 0, `T16-D01 contains incomplete EN/VI labels at: ${bilingualGaps.join(", ")}.`);
  const lastReadLine = Math.max(...dateExtension.code.map((line, index) => /MONTH\(|DAYINDEX\(/.test(line) ? index : -1));
  const writeLine = dateExtension.code.findIndex((line) => line.includes("LastVisit ← TodayDate"));
  check(lastReadLine >= 0 && writeLine > lastReadLine, "T16-D01 pseudocode must read all old-date conditions before assigning LastVisit to TodayDate.");
  const finalExpectations = new Map([
    ["same-month-same-weekday", [14, 16, "15/10/2026"]],
    ["same-month-different-weekday", [14, 14, "15/10/2026"]],
    ["different-month-same-weekday", [11, 13, "15/10/2026"]],
    ["same-month-number-different-year", [14, 14, "15/10/2026"]],
    ["year-boundary", [11, 11, "01/01/2027"]],
    ["valid-leap-day", [11, 11, "01/03/2024"]],
  ]);
  for (const [id, [basePoints, amendedPoints, finalDate]] of finalExpectations) {
    const fixture = dateExtension.variants.find((variant) => variant.id === id);
    const finalFrame = fixture?.frames.at(-1);
    check(Boolean(fixture?.frames.length === 6 && finalFrame?.vars?.BasePoints === basePoints && finalFrame?.vars?.AmendedPoints === amendedPoints && finalFrame?.vars?.CallerLastVisit === finalDate), `T16-D01/${id} does not match the frozen base/amended/final-date expectation.`);
  }
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => error.code === "ENOENT" ? [] : Promise.reject(error));
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(target));
    else if (entry.name.toLowerCase().endsWith(".html")) files.push(target);
  }
  return files;
}
const publicHtmlCopies = await findHtmlFiles(path.join(root, "public/paper2-visuals"));
check(publicHtmlCopies.length === 0, `App public must not contain exported Paper 2 HTML copies: ${publicHtmlCopies.join(", ")}.`);
check(!exporterSource.includes("public/paper2-visuals"), "Native exporter must not target app public Paper 2 HTML paths.");

const [explorerSource, rendererSource, registrySource] = await Promise.all([
  readFile(path.join(root, "app/components/paper2-learning/lessons/Paper2VisualExplorer.tsx"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/lessons/Paper2SceneRenderer.tsx"), "utf8"),
  readFile(path.join(root, "app/lib/paper2/server-visual-registry.ts"), "utf8"),
]);
check(!explorerSource.includes("<iframe"), "The primary Paper 2 lesson runtime must be native React, not an iframe.");
check(explorerSource.includes("selection.assets") && registrySource.includes("uniqueIds.map") && registrySource.includes("visualById.get(id)"), "Server selection and lesson visual player must expose only asset IDs bound by lesson JSON.");
check(["data-paper2-visual-player", "data-p2-frame", "data-p2-control", "data-p2-transcript"].every((hook) => explorerSource.includes(hook)), "Native visual player stable test hooks are incomplete.");
check(supportedSceneTypes.slice(0, -1).every((type) => rendererSource.includes(`scene.type === \"${type}\"`)) && rendererSource.includes("<DomainScene"), "Native scene renderer must handle all six canonical scene types.");

const report = {
  schema_version: "paper2-visual-parity-v3",
  decision: failures.length ? "FAIL" : "PASS",
  baseline,
  required_extension: requiredExtension,
  expected,
  manifest: manifestCounts,
  canonical_source: sourceCounts,
  native_export: exportedCounts,
  scene_frames: exportedSceneCounts,
  semantic_sha256: exported.semanticSha256,
  source_manifest_sha256: sha256(manifestSource),
  source_hashes: currentSourceHashes,
  verified: { assets: verifiedAssets, variants: verifiedVariants, frames: verifiedFrames, scenes: verifiedScenes, asset_hashes: Object.keys(exported.assetHashes ?? {}).length },
  required_t04_supplements: requiredT04Assets,
  public_html_copies: publicHtmlCopies.length,
  failures,
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
