import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const groups = [
  ["questions", "content/paper2/questions/public", ".question.json"],
  ["solutions", "content/paper2/solutions/private", ".solution.json"],
  ["sets", "content/paper2/practice-sets", ".practice-set.json"],
  ["sections", "content/paper2/sections", ".json"],
  ["patterns", "content/paper2/patterns", ".json"],
];
const checks = [], failures = [];
const check = (id, pass, detail) => { const result = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(result); if (!result.pass) failures.push(result); };

for (const [group, relative, suffix] of groups) {
  const directory = path.join(root, relative);
  for (const name of readdirSync(directory).filter((entry) => entry.endsWith(suffix)).sort()) {
    const value = JSON.parse(readFileSync(path.join(directory, name), "utf8"));
    const issues = [];
    inspect(value, `${group}/${name}`, issues);
    check(`localized:${group}:${name}`, issues.length === 0, issues);
  }
}

console.log(JSON.stringify({ schemaVersion: "paper2-localization-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;

function inspect(value, location, issues) {
  if (Array.isArray(value)) { value.forEach((item, index) => inspect(item, `${location}[${index}]`, issues)); return; }
  if (!value || typeof value !== "object") return;
  const keys = Object.keys(value);
  if (keys.includes("en") || keys.includes("vi")) {
    if (typeof value.en !== "string" || !value.en.trim()) issues.push(`${location}.en`);
    if (typeof value.vi !== "string" || !value.vi.trim()) issues.push(`${location}.vi`);
    return;
  }
  Object.entries(value).forEach(([key, child]) => inspect(child, `${location}.${key}`, issues));
}
