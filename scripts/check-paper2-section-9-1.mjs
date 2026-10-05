import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => readFile(path.join(root, relative), "utf8").then(JSON.parse);
const [section, pattern, t01, t02, visuals, registry, overview] = await Promise.all([
  readJson("content/paper2/sections/9.1.json"),
  readJson("content/paper2/patterns/F01.json"),
  readJson("content/paper2/lessons/abstraction.json"),
  readJson("content/paper2/lessons/decomposition.json"),
  readJson("app/lib/paper2/generated/canonical-visuals.json"),
  readFile(path.join(root, "app/lib/paper2/lesson-registry.ts"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/SectionOverview.tsx"), "utf8"),
]);

const checks = [];
const failures = [];
const check = (id, condition, detail = undefined) => {
  const result = { id, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) };
  checks.push(result);
  if (!result.pass) failures.push(result);
};
const localized = (value) => value && typeof value.en === "string" && value.en.trim() && typeof value.vi === "string" && value.vi.trim();
const containsAll = (value, expected) => expected.every((item) => value.includes(item));

check("section-identity", section.schemaVersion === 1 && section.sectionId === "9.1", { sectionId: section.sectionId, version: section.version });
check("section-big-question", section.scenario?.bigQuestion?.en === "What should a model keep, and how should the work be divided?" && section.scenario?.bigQuestion?.vi === "Mô hình cần giữ lại điều gì, và nên chia công việc như thế nào?");
check("section-bilingual-core", [section.scenario?.title, section.scenario?.context, section.topicRelationship?.connection, section.workedChapter?.fullAnswer].every(localized));
check("section-learning-order", section.prerequisiteGuidance?.map((item) => item.topicId).join(",") === "T01,T02" && section.prerequisiteGuidance.every((item) => localized(item.reason)));
check("section-glossary", section.glossary?.length >= 4 && section.glossary.every((item) => item.term && localized(item.meaning)), section.glossary?.map((item) => item.term));
check("section-visual", section.visual?.assetId === "S9.1" && visuals.assets.some((asset) => asset.id === "S9.1" && asset.variants?.[0]?.frames?.map((frame) => frame.id).join(",") === "relation-1,relation-2,relation-3"));
check("section-booking-fields", section.workedChapter?.fields?.map((item) => item.field).join(",") === "Passenger,Flight,Seat,Coat colour" && section.workedChapter.fields.every((item) => localized(item.assignment) && localized(item.report)));
check("section-booking-modules", section.workedChapter?.modules?.map((item) => item.name).join(",") === "Validate request,Reserve seat,Record booking,Produce occupancy report" && section.workedChapter.modules.every((item) => item.input && item.output && localized(item.boundary)));
check("section-visible-answer-next", localized(section.workedChapter?.fullAnswer) && section.workedChapter?.nextStep?.slug === "decomposition" && section.workedChapter?.nextStep?.anchor === "practise");

check("pattern-identity", pattern.schemaVersion === 1 && pattern.id === "F01" && pattern.owner?.topicId === "T01" && pattern.owner?.slug === "abstraction");
check("pattern-related", pattern.related?.length === 1 && pattern.related[0].topicId === "T02" && pattern.related[0].slug === "decomposition");
check("pattern-guidance", pattern.positiveCues?.length >= 3 && pattern.misleadingCues?.length >= 3 && localized(pattern.answerProduct) && pattern.recipe?.length >= 5 && pattern.recipe.every((item) => localized(item.action) && localized(item.why)));
check("pattern-non-example", localized(pattern.nonExample?.answer) && localized(pattern.nonExample?.problem) && localized(pattern.nonExample?.repair));
check("pattern-practice-links", pattern.practiceLinks?.map((item) => item.taskId).join(",") === "T01-P1,T01-P2,T02-P1,T02-P2" && pattern.practiceLinks.every((item) => localized(item.label)));
check("pattern-source-locators", pattern.sourceLocators?.length >= 5 && pattern.sourceLocators.every((item) => item.sourceId && item.label && item.locator));

check("lesson-loaders", containsAll(registry, ["lessons/abstraction.json", "lessons/decomposition.json"]));
check("section-native-explorer", overview.includes("Paper2VisualExplorer") && overview.includes("assetIds={[content.visual.assetId]}") && !overview.includes("iframe"));
check("section-renders-pattern", containsAll(overview, ["Positive cues", "Misleading cues", "Required answer product", "Sources and locators"]));
check("lesson-identities", t01.topicId === "T01" && t01.slug === "abstraction" && t01.visual?.assetIds?.join(",") === "T01" && t02.topicId === "T02" && t02.slug === "decomposition" && t02.visual?.assetIds?.join(",") === "T02");
check("lesson-pattern-roles", t01.patternLinks?.some((item) => item.id === "F01" && item.role === "owner") && t02.patternLinks?.some((item) => item.id === "F01" && item.role === "related") && t02.patternLinks?.some((item) => item.id === "F11" && item.role === "related"));
const t02Worked = JSON.stringify(t02.workedExamples ?? []);
check("lesson-t02-locked-worked-fixture", containsAll(t02Worked, ["Validate request", "Reserve seat", "Record booking", "Produce occupancy report", "OccupiedCountByFlight"]), "Teacher-owned T02 worked example must match SOURCE_MODEL.md §7 before candidate review.");

console.log(JSON.stringify({
  schema_version: "paper2-section-9.1-check-v1",
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
