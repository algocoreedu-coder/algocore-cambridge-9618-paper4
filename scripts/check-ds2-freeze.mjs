import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidence = path.resolve(root, "../planning/paper4/completion-program-2026/evidence/cp1-ds3");
const expected = {
  "AlgoCoreUI.module.css": "C2D7CA1876A1E4F69ED6B7AFA9348BE24D8C6FADE42473C6E8255F0974E304C8",
  "controls.tsx": "FFDAC34E62D5C94CFDC494C3724C7419AB7E05D45E2E75AC8DFE78DDFD4BCCBB",
  "index.ts": "DDD3228AC9B37B7D2E62EFAAA4CF90E8D54CFF7337FD9C92E2DE8D195FF072A1",
  "journey.tsx": "8EECA214E50F0086F8064DBB829D97D31F84C43EDA1FF8FA815E2432DA1423AA",
  "surfaces.tsx": "045856F40F1E5360D5B182F4C828E5C1957EA80138C5305B3298DF902E2CCBC3",
};
const files = Object.entries(expected).map(([file, expectedSha256]) => {
  const actualSha256 = createHash("sha256").update(readFileSync(path.join(root, "app/components/algocore-ui", file))).digest("hex").toUpperCase();
  return { file, expected_sha256: expectedSha256, actual_sha256: actualSha256, unchanged: actualSha256 === expectedSha256 };
});
const report = { schema_version: "algocore-ds2-freeze-integrity-v1", decision: files.every((item) => item.unchanged) ? "PASS" : "FAIL", lead_frozen_api_sha256: "1AA0468B6623BFB81CC19398D90EAFAF20A66DA2D4D61B60424BD6360F17ADAE", verification: "exact per-file SHA-256 values recorded by the accepted DS2 candidate", files };
mkdirSync(evidence, { recursive: true });
writeFileSync(path.join(evidence, "DS2_FREEZE_INTEGRITY.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.decision === "FAIL") process.exitCode = 1;
