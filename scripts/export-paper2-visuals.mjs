import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const visualRoot = path.resolve(root, "../curriculum/paper_2/visuals");
const sourceManifestPath = path.join(visualRoot, "manifest.json");
const adapterDirectory = path.join(root, "app/lib/paper2/generated");
const sourceFiles = ["concepts.js", "processes.js", "diagrams.js", "supplements.js"];
const supportedSceneTypes = ["array", "graph", "diagram", "lanes", "table", "domain"];
const baselineCounts = { assets: 67, variants: 126, frames: 638 };
const extensionCounts = { assets: 1, variants: 7, frames: 41 };
const expectedCounts = Object.fromEntries(Object.keys(baselineCounts).map((key) => [key, baselineCounts[key] + extensionCounts[key]]));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const semanticSha256 = (value) => sha256(JSON.stringify(value));

const manifestSource = await readFile(sourceManifestPath);
const manifest = JSON.parse(manifestSource.toString("utf8"));
const requiredAssetIds = manifest.assets.map((asset) => asset.id);

const context = {};
context.globalThis = context;
vm.createContext(context);
const sourceHashes = {};
for (const filename of sourceFiles) {
  const sourcePath = path.join(visualRoot, "src", filename);
  const source = await readFile(sourcePath);
  sourceHashes[`curriculum/paper_2/visuals/src/${filename}`] = sha256(source);
  vm.runInContext(source.toString("utf8"), context, { filename: sourcePath });
}

const canonicalAssets = Array.isArray(context.P2_VISUALS) ? context.P2_VISUALS : [];
const canonicalById = new Map(canonicalAssets.map((asset) => [asset.id, asset]));
const missingSource = requiredAssetIds.filter((id) => !canonicalById.has(id));
if (missingSource.length) throw new Error(`Canonical Paper 2 source modules are missing: ${missingSource.join(", ")}`);
if (new Set(requiredAssetIds).size !== requiredAssetIds.length) throw new Error("Canonical Paper 2 manifest contains duplicate asset IDs.");
if (canonicalById.size !== canonicalAssets.length) throw new Error("Canonical Paper 2 source modules contain duplicate asset IDs.");
const unexpectedSource = canonicalAssets.filter((asset) => !requiredAssetIds.includes(asset.id)).map((asset) => asset.id);
if (unexpectedSource.length) throw new Error(`Canonical Paper 2 source modules contain unmanifested assets: ${unexpectedSource.join(", ")}`);

await mkdir(adapterDirectory, { recursive: true });
const exportedAssets = [];
for (const id of requiredAssetIds) {
  const model = JSON.parse(JSON.stringify(canonicalById.get(id)));
  exportedAssets.push(model);
}

const actualSceneTypes = [...new Set(exportedAssets.flatMap((asset) => asset.variants.flatMap((variant) => variant.frames.map((frame) => frame.scene?.type))))];
const unsupported = actualSceneTypes.filter((type) => !supportedSceneTypes.includes(type));
if (unsupported.length) throw new Error(`Native Paper 2 renderer does not declare scene types: ${unsupported.join(", ")}`);
const counts = {
  assets: exportedAssets.length,
  variants: exportedAssets.reduce((total, asset) => total + asset.variants.length, 0),
  frames: exportedAssets.reduce((total, asset) => total + asset.variants.reduce((sum, variant) => sum + variant.frames.length, 0), 0),
};
for (const key of Object.keys(expectedCounts)) {
  if (counts[key] !== expectedCounts[key]) throw new Error(`Canonical Paper 2 ${key} changed: expected baseline ${baselineCounts[key]} + required extension ${extensionCounts[key]} = ${expectedCounts[key]}, found ${counts[key]}.`);
  if (manifest.counts?.[key] !== counts[key]) throw new Error(`Manifest ${key} count does not match canonical source: ${manifest.counts?.[key]} versus ${counts[key]}.`);
}
if (manifest.counts?.baselineAssets !== baselineCounts.assets) throw new Error(`Manifest baselineAssets must remain ${baselineCounts.assets}.`);
if (manifest.counts?.requiredExtensions !== extensionCounts.assets) throw new Error(`Manifest requiredExtensions must equal ${extensionCounts.assets}.`);
for (const manifestAsset of manifest.assets) {
  const model = canonicalById.get(manifestAsset.id);
  const variants = new Map(model.variants.map((variant) => [variant.id, variant]));
  if (variants.size !== model.variants.length) throw new Error(`${model.id} contains duplicate variant IDs.`);
  if (manifestAsset.variants.length !== model.variants.length) throw new Error(`${model.id} variant count differs between manifest and source.`);
  for (const manifestVariant of manifestAsset.variants) {
    const variant = variants.get(manifestVariant.id);
    if (!variant) throw new Error(`${model.id} is missing manifested variant ${manifestVariant.id}.`);
    if (variant.frames.length !== manifestVariant.frames) throw new Error(`${model.id}/${variant.id} frame count differs between manifest and source.`);
  }
  const modelSceneTypes = [...new Set(model.variants.flatMap((variant) => variant.frames.map((frame) => frame.scene?.type)))].sort();
  const manifestSceneTypes = [...manifestAsset.sceneTypes].sort();
  if (JSON.stringify(modelSceneTypes) !== JSON.stringify(manifestSceneTypes)) throw new Error(`${model.id} scene types differ between manifest and source.`);
}

const assetHashes = Object.fromEntries(exportedAssets.map((asset) => [asset.id, semanticSha256(asset)]));

const exported = {
  schemaVersion: 2,
  generatedFrom: sourceFiles.map((filename) => `curriculum/paper_2/visuals/src/${filename}`),
  sourceHashes,
  sourceManifest: "curriculum/paper_2/visuals/manifest.json",
  sourceManifestSha256: sha256(manifestSource),
  baselineCounts,
  extensionCounts,
  counts,
  supportedSceneTypes,
  semanticSha256: semanticSha256(exportedAssets),
  assetHashes,
  assets: exportedAssets,
};
const output = `${JSON.stringify(exported)}\n`;
await writeFile(path.join(adapterDirectory, "canonical-visuals.json"), output);
console.log(JSON.stringify({
  decision: "PASS",
  ...counts,
  generatedBytes: Buffer.byteLength(output),
  semanticSha256: exported.semanticSha256,
  sourceManifestSha256: exported.sourceManifestSha256,
  sourceFiles: sourceHashes,
  output: "app/lib/paper2/generated/canonical-visuals.json",
}, null, 2));
