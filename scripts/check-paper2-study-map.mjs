import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(path.join(root, "content/paper2/study-map.json"), "utf8"));
const checks = [];
function check(name, fn) { fn(); checks.push(name); }
const expectedSections = ["9.1", "9.2", "10.1", "10.2", "10.3", "10.4", "11.1", "11.2", "11.3", "12.1", "12.2", "12.3"];
const expectedOwners = ["9.1","9.1","9.2","9.2","10.1","10.1","10.2","10.2","10.2","10.3","10.4","10.4","10.4","11.1","11.1","11.1","11.1","11.2","11.2","11.3","11.3","11.3","12.1","12.2","12.2","12.3","12.3","12.3","12.3","12.3","12.3","12.3"];
const topicById = new Map(data.topics.map(t => [t.id, t]));
check("2026 Paper 2 identity and assessment", () => {
  assert.equal(data.course.paper, 2); assert.equal(data.course.examYear, 2026);
  assert.equal(data.course.durationMinutes, 120); assert.equal(data.course.marks, 75);
});
check("four strands and twelve syllabus sections", () => {
  assert.deepEqual(data.strands.map(s => s.id), ["9", "10", "11", "12"]);
  assert.deepEqual(data.sections.map(s => s.id), expectedSections);
  assert.deepEqual(data.strands.flatMap(s => s.sectionIds), expectedSections);
});
check("32 unique topics in the correct syllabus sections", () => {
  assert.equal(data.topics.length, 32); assert.equal(topicById.size, 32);
  expectedOwners.forEach((sectionId, index) => assert.equal(topicById.get(`T${String(index + 1).padStart(2, "0")}`)?.sectionId, sectionId));
  assert.equal(new Set(data.topics.map(t => t.slug)).size, 32);
  for (const t of data.topics) assert.match(t.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});
check("section membership and map identifiers", () => {
  for (const s of data.sections) {
    assert.equal(s.strandId, s.id.split(".")[0]);
    assert.deepEqual(s.topicIds, data.topics.filter(t => t.sectionId === s.id).map(t => t.id));
    assert.equal(s.mapAssetId, `S${s.id}`);
    assert.ok(s.objectives.length >= 2);
  }
});
check("English and Vietnamese learner metadata", () => {
  function localized(value) { assert.ok(value?.en?.trim()); assert.ok(value?.vi?.trim()); }
  localized(data.course.title);
  for (const s of data.strands) { localized(s.title); localized(s.summary); }
  for (const s of data.sections) { localized(s.title); localized(s.summary); localized(s.question); s.objectives.forEach(localized); }
  for (const t of data.topics) {
    localized(t.title); localized(t.summary); assert.ok(t.learningObjectives.length >= 2); t.learningObjectives.forEach(localized);
    assert.ok(t.searchTerms.length > 0); assert.ok(["explanation","procedural","diagram","testing"].includes(t.learningMode));
  }
});
check("prerequisite references and DAG", () => {
  const done = new Set(), active = new Set();
  function visit(id) {
    assert.ok(topicById.has(id), `Unknown prerequisite ${id}`);
    assert.ok(!active.has(id), `Prerequisite cycle at ${id}`);
    if (done.has(id)) return;
    active.add(id); topicById.get(id).prerequisites.forEach(visit); active.delete(id); done.add(id);
  }
  data.topics.forEach(t => visit(t.id));
});
check("section relationships explain a valid connection", () => {
  const ids = new Set();
  for (const r of data.relationships) {
    assert.ok(expectedSections.includes(r.fromSectionId) && expectedSections.includes(r.toSectionId));
    assert.notEqual(r.fromSectionId, r.toSectionId);
    // Related knowledge can point both ways with different teaching reasons;
    // only required topic prerequisites must form a DAG.
    const key = `${r.fromSectionId}:${r.toSectionId}:${r.kind}`;
    assert.ok(!ids.has(key), `Duplicate relationship ${key}`); ids.add(key);
    assert.ok(r.label.en.trim() && r.label.vi.trim()); assert.ok(["foundation", "connection"].includes(r.kind));
  }
  assert.ok(ids.size >= 10);
});
check("68 visual bindings, including the T16 diagram extension and all chart supplements", () => {
  const ids = [...data.topics.flatMap(t => t.visualIds), ...data.sections.map(s => s.mapAssetId)];
  assert.equal(ids.length, 68); assert.equal(new Set(ids).size, 68);
  assert.deepEqual(topicById.get("T04").visualIds, ["T04", ...Array.from({length:8}, (_,i) => `T04-F${String(i+1).padStart(2,"0")}`)]);
  assert.deepEqual(topicById.get("T16").visualIds, ["T16", "T16-D01"]);
  assert.deepEqual(topicById.get("T24").visualIds, ["T24", ...Array.from({length:5}, (_,i) => `T24-S${String(i+1).padStart(2,"0")}`)]);
});
check("honest lesson availability and no local source paths", () => {
  assert.ok(data.topics.every(t => t.status === "planned"));
  assert.ok(!/[A-Za-z]:[\\/]|file:\/\//.test(JSON.stringify(data)));
});

// Transpile the existing pure auth module, without importing the Next runtime
// or using any live credentials. Exercise both new and existing safe paths.
const authSource = readFileSync(path.join(root, "app/lib/auth.ts"), "utf8");
const authJs = ts.transpileModule(authSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { safeInternalPath, safeLearningPath } = await import(`data:text/javascript;base64,${Buffer.from(authJs).toString("base64")}`);
check("Paper 2 safe redirects preserve query and fragment", () => {
  assert.equal(safeLearningPath("/paper-2?section=12.2&view=list#paper2-main", "vi"), "/paper-2?section=12.2&view=list&lang=vi#paper2-main");
  assert.equal(safeLearningPath("/paper-2/sections/9.2?lang=vi", "en"), "/paper-2/sections/9.2?lang=en");
});
check("safe path boundaries reject lookalikes and external destinations", () => {
  for (const value of ["//attacker.invalid", "https://attacker.invalid", "/paper-20", "/paper-2-evil", "/paper-2%2f%2fattacker.invalid", "/paper-2/../../api/auth/login", "/paper-2\\attacker", "/paper-2\n"]) assert.equal(safeInternalPath(value), "/", value);
});
check("Paper 3 and Paper 4 safe redirect regression", () => {
  assert.equal(safeLearningPath("/paper-3/sections/20", "vi"), "/paper-3/sections/20?lang=vi");
  assert.equal(safeLearningPath("/paper-4/lessons/recursion?lang=en#practice", "vi"), "/paper-4/lessons/recursion?lang=vi#practice");
  assert.equal(safeInternalPath("/docs#concept"), "/docs#concept");
});
console.log(JSON.stringify({ decision: "PASS", checks: checks.length, passed: checks, scope: "Study map data and auth path units; browser and teacher review are separate." }, null, 2));
