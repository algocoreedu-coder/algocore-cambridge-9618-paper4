import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studyMap = read("content/paper2/study-map.json");
const sources = read("content/paper2/sources/source-registry.json");
const visualManifest = read("app/lib/paper2/generated/canonical-visuals.json");
const sections = readDir("content/paper2/sections", ".json");
const patterns = readDir("content/paper2/patterns", ".json");
const lessons = readDir("content/paper2/lessons", ".json");
const topicById = new Map(studyMap.topics.map((topic) => [topic.id, topic]));
const validSources = new Set(sources.sources.map((source) => source.sourceId));
const validVisuals = new Set((visualManifest.assets ?? []).map((asset) => asset.assetId ?? asset.id));
const taskIds = new Set(lessons.flatMap((lesson) => [...(lesson.practices ?? []), ...(lesson.workedExamples ?? [])].map((item) => item.id)));
const checks = [], failures = [];
const check = (id, pass, detail) => { const result = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(result); if (!result.pass) failures.push(result); };

check("section-count-12", sections.length === 12, sections.length);
check("pattern-count-16", patterns.length === 16, patterns.length);
check("section-ids-exact", studyMap.sections.every((section) => sections.some((entry) => entry.sectionId === section.id)));
check("pattern-ids-exact", Array.from({ length: 16 }, (_, index) => `F${String(index + 1).padStart(2, "0")}`).every((id) => patterns.some((entry) => entry.id === id)));

for (const section of sections) {
  check(`section-localized:${section.sectionId}`, localizedLeavesComplete(section));
  check(`section-topics:${section.sectionId}`, section.topicRelationship.items.every((item) => topicById.get(item.topicId)?.slug === item.slug));
  check(`section-visual:${section.sectionId}`, validVisuals.has(section.visual.assetId), section.visual.assetId);
  check(`section-pattern-refs:${section.sectionId}`, section.patternIds.every((id) => patterns.some((pattern) => pattern.id === id)));
  check(`section-worked-depth:${section.sectionId}`, section.workedChapter.fields.length >= 2 && section.workedChapter.modules.length >= 2 && section.workedChapter.checks.length >= 2);
}
for (const pattern of patterns) {
  check(`pattern-localized:${pattern.id}`, localizedLeavesComplete(pattern));
  check(`pattern-owner:${pattern.id}`, topicById.get(pattern.owner.topicId)?.slug === pattern.owner.slug, pattern.owner);
  check(`pattern-cues:${pattern.id}`, pattern.positiveCues.length >= 2 && pattern.misleadingCues.length >= 2);
  check(`pattern-recipe:${pattern.id}`, pattern.recipe.length >= 3);
  check(`pattern-practice-links:${pattern.id}`, pattern.practiceLinks.length > 0 && pattern.practiceLinks.every((link) => topicById.get(link.topicId)?.slug === link.slug && taskIds.has(link.taskId)), pattern.practiceLinks.filter((link) => !taskIds.has(link.taskId)).map((link) => link.taskId));
  check(`pattern-source-refs:${pattern.id}`, pattern.sourceLocators.length > 0 && pattern.sourceLocators.every((source) => validSources.has(source.sourceId)));
}

console.log(JSON.stringify({ schemaVersion: "paper2-section-pattern-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, sections: sections.length, patterns: patterns.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;

function read(relative) { return JSON.parse(readFileSync(path.join(root, relative), "utf8")); }
function readDir(relative, suffix) { return readdirSync(path.join(root, relative)).filter((name) => name.endsWith(suffix)).sort().map((name) => read(path.join(relative, name))); }
function localizedLeavesComplete(value) {
  if (Array.isArray(value)) return value.every(localizedLeavesComplete);
  if (!value || typeof value !== "object") return true;
  const keys = Object.keys(value);
  if (keys.includes("en") || keys.includes("vi")) return typeof value.en === "string" && value.en.trim().length > 0 && typeof value.vi === "string" && value.vi.trim().length > 0;
  return Object.values(value).every(localizedLeavesComplete);
}
