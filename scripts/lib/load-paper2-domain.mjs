import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

export function loadPaper2Domain(projectRoot, moduleName) {
  const paper2Lib = path.join(projectRoot, "app/lib/paper2");
  const temp = mkdtempSync(path.join(os.tmpdir(), "paper2-domain-"));
  try {
    writeFileSync(path.join(temp, "package.json"), '{"type":"commonjs"}\n');
    for (const name of readdirSync(paper2Lib).filter((entry) => entry.endsWith(".ts"))) {
      const output = ts.transpileModule(readFileSync(path.join(paper2Lib, name), "utf8"), {
        fileName: name,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        reportDiagnostics: true,
      });
      const errors = (output.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
      if (errors.length) throw new Error(`${name}: ${errors.map((item) => item.messageText).join("; ")}`);
      writeFileSync(path.join(temp, name.replace(/\.ts$/, ".js")), output.outputText);
    }
    return createRequire(import.meta.url)(path.join(temp, `${moduleName}.js`));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

export function readJsonRecords(directory, suffix) {
  let names;
  try {
    names = readdirSync(directory).filter((name) => name.endsWith(suffix)).sort();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  return names.map((name) => ({ name, value: JSON.parse(readFileSync(path.join(directory, name), "utf8")) }));
}

export function stableJson(value) {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
  return value;
}
