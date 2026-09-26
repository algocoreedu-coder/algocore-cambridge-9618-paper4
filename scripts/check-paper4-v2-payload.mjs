import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUDGETS = Object.freeze({
  hubManifestBytesExclusive: 250_000,
  initialClientMetadataBytesExclusive: 300_000,
  traceChunkBytesExclusive: 600_000,
  compressedTraceChunkBytesExclusive: 25_000,
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifestPath = path.join(ROOT, "app", "data", "paper4-v2", "course-manifest.json");
const loaderPath = path.join(ROOT, "app", "data", "paper4-v2", "lesson-loaders.generated.ts");
const tracesDir = path.join(ROOT, "public", "paper4-v2", "traces");
const lessonsDir = path.join(ROOT, "app", "data", "paper4-v2", "lessons");

const manifestBytes = (await stat(manifestPath)).size;
const loaderBytes = (await stat(loaderPath)).size;
const initialClientMetadataBytes = manifestBytes + loaderBytes;
assert(manifestBytes < BUDGETS.hubManifestBytesExclusive, `Hub manifest is ${manifestBytes} bytes; budget is <${BUDGETS.hubManifestBytesExclusive}`);
assert(initialClientMetadataBytes < BUDGETS.initialClientMetadataBytesExclusive, `Initial client metadata projection is ${initialClientMetadataBytes} bytes; budget is <${BUDGETS.initialClientMetadataBytesExclusive}`);

const traceFiles = (await readdir(tracesDir)).filter((filename) => filename.endsWith(".json")).sort();
assert(traceFiles.length === 58, `Expected 58 trace chunks, received ${traceFiles.length}`);
const traceSizes = [];
for (const filename of traceFiles) {
  const tracePath = path.join(tracesDir, filename);
  const bytes = (await stat(tracePath)).size;
  const compressedBytes = gzipSync(await readFile(tracePath)).byteLength;
  assert(bytes < BUDGETS.traceChunkBytesExclusive, `${filename} is ${bytes} bytes; budget is <${BUDGETS.traceChunkBytesExclusive}`);
  assert(compressedBytes < BUDGETS.compressedTraceChunkBytesExclusive, `${filename} is ${compressedBytes} gzip bytes; budget is <${BUDGETS.compressedTraceChunkBytesExclusive}`);
  traceSizes.push({ filename, bytes, compressed_bytes: compressedBytes });
}

const lessonFiles = (await readdir(lessonsDir)).filter((filename) => filename.endsWith(".json")).sort();
assert(lessonFiles.length === 26, `Expected 26 lesson DTOs, received ${lessonFiles.length}`);
const lessonSizes = await Promise.all(lessonFiles.map(async (filename) => ({ filename, bytes: (await stat(path.join(lessonsDir, filename))).size })));

const manifestSource = await readFile(manifestPath, "utf8");
assert(!manifestSource.includes("stage8-runtime-registry"), "Hub manifest references Stage 8 v1 registry");
assert(!manifestSource.includes("stage9-learning-pages"), "Hub manifest references Stage 9 v1 registry");

traceSizes.sort((left, right) => right.bytes - left.bytes || left.filename.localeCompare(right.filename));
lessonSizes.sort((left, right) => right.bytes - left.bytes || left.filename.localeCompare(right.filename));

console.log(JSON.stringify({
  status: "PASS",
  node: process.version,
  budgets: BUDGETS,
  hub_manifest_bytes: manifestBytes,
  static_loader_bytes: loaderBytes,
  initial_client_metadata_projection_bytes: initialClientMetadataBytes,
  trace_chunks: traceFiles.length,
  largest_trace_chunk: traceSizes[0],
  largest_compressed_trace_chunk: [...traceSizes].sort((left, right) => right.compressed_bytes - left.compressed_bytes || left.filename.localeCompare(right.filename))[0],
  lesson_dtos: lessonFiles.length,
  largest_lesson_dto_informational: lessonSizes[0],
}, null, 2));
