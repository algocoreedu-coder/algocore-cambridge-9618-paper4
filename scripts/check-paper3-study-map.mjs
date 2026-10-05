import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const plan = path.resolve(root, "../planning/paper3-2026");
const evidence = path.join(plan, "completion-program-2026/evidence/ui-shell");
const source = await readFile(path.join(root, "content/paper3/study-map.json"), "utf8");
const catalog = JSON.parse(source);
const topicPlan = await readFile(path.join(plan, "LEARNING_CONTENT_PLAN.md"), "utf8");
const plannedIds = [...topicPlan.matchAll(/^\| (P3-\d+\.\d-T\d+) —/gm)].map((match) => match[1]);
const unique = (items, label) => assert.equal(new Set(items).size, items.length, `${label} must be unique`);
const bilingual = (value, label) => {
  for (const locale of ["en", "vi"]) assert.ok(typeof value?.[locale] === "string" && value[locale].trim(), `${label}.${locale} is required`);
};

assert.deepEqual([catalog.course.paper, catalog.course.examYear, catalog.course.syllabusVersion], [3, 2026, 2]);
assert.deepEqual([catalog.course.durationMinutes, catalog.course.marks], [90, 75]);
bilingual(catalog.course.title, "course.title");
assert.deepEqual(catalog.sections.map((section) => section.id), ["13", "14", "15", "16", "17", "18", "19", "20"]);
assert.equal(catalog.strands.length, 15);
assert.equal(catalog.topics.length, 66);
assert.deepEqual(catalog.topics.map((topic) => topic.id).sort(), plannedIds.sort(), "Navigation must retain the agreed topic IDs");
unique(catalog.strands.map((strand) => strand.id), "Strands");
unique(catalog.topics.map((topic) => topic.slug), "Topic URLs");
const sections = new Map(catalog.sections.map((section) => [section.id, section]));
const strands = new Map(catalog.strands.map((strand) => [strand.id, strand]));
const modes = new Set(["concept", "process", "calculation", "logic", "algorithm", "programming"]);
const counts = {};

for (const section of catalog.sections) {
  for (const field of ["title", "summary", "question"]) bilingual(section[field], `${section.id}.${field}`);
  unique(section.strandIds, `${section.id}.strandIds`);
  assert.deepEqual(section.strandIds, catalog.strands.filter((strand) => strand.sectionId === section.id).map((strand) => strand.id));
  counts[section.id] = 0;
}
for (const strand of catalog.strands) {
  assert.ok(sections.has(strand.sectionId));
  assert.ok(strand.id.startsWith(`${strand.sectionId}.`));
  bilingual(strand.title, `${strand.id}.title`);
}
for (const topic of catalog.topics) {
  const strand = strands.get(topic.strandId);
  assert.ok(strand, `Missing strand for ${topic.id}`);
  assert.ok(topic.id.startsWith(`P3-${topic.strandId}-`));
  assert.match(topic.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(topic.status, "planned", "This scaffold must not imply published teaching content");
  assert.ok(modes.has(topic.learningMode));
  for (const field of ["title", "summary"]) bilingual(topic[field], `${topic.id}.${field}`);
  counts[strand.sectionId] += 1;
}
assert.deepEqual(Object.values(counts), [11, 5, 9, 9, 4, 6, 13, 9]);
unique(catalog.relationships.map((edge) => `${edge.fromSectionId}:${edge.toSectionId}`), "Relationships");
for (const edge of catalog.relationships) {
  assert.ok(sections.has(edge.fromSectionId) && sections.has(edge.toSectionId));
  assert.notEqual(edge.fromSectionId, edge.toSectionId);
  assert.ok(["foundation", "connection"].includes(edge.kind));
  bilingual(edge.label, "relationship.label");
}

const report = {
  scope: "Paper 3 UI-shell curriculum navigation",
  result: "PASS",
  catalogSha256: createHash("sha256").update(source).digest("hex"),
  sections: catalog.sections.length, strands: catalog.strands.length, topics: catalog.topics.length,
  sectionTopicCounts: counts, relationships: catalog.relationships.length,
  checks: ["2026 syllabus metadata", "canonical topic ID coverage", "unique safe URLs", "bilingual metadata", "valid strand and relationship references", "planned status only"],
  lessonContentAccepted: 0,
};
await mkdir(evidence, { recursive: true });
await writeFile(path.join(evidence, "CATALOG_CHECK.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
