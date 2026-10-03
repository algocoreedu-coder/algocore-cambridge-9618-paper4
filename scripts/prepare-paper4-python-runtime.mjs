import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "node_modules", "pyodide");
const destination = path.join(root, "public", "vendor", "pyodide");
const files = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "pyodide-lock.json", "python_stdlib.zip"];

await mkdir(destination, { recursive: true });
await Promise.all(files.map((file) => copyFile(path.join(source, file), path.join(destination, file))));
console.log(`Prepared Paper 4 browser Python runtime (${files.length} files).`);
