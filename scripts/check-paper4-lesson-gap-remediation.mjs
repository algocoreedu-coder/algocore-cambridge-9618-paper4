import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const readText = (path) => readFileSync(resolve(root, path), "utf8");

const manifest = readJson("app/data/paper4-v2/course-manifest.json");
const lessonPageSource = readText("app/components/paper4-learning/LessonLearningPage.tsx");
const canonicalJourneySource = readText("app/components/paper4-learning/CanonicalLessonJourney.tsx");
const sixStageJourneySource = readText("app/components/paper4-learning/SixStageLearnerJourney.tsx");
const sharedLessonShellSource = readText("app/components/paper4-learning/Paper4LessonShell.tsx");
const learnerSurfaceSource = `${lessonPageSource}\n${canonicalJourneySource}\n${sixStageJourneySource}\n${sharedLessonShellSource}`;

const canonicalSlugs = new Set([
  "binary-tree", "dictionary", "hashing", "oop-model", "oop-state", "oop-inheritance", "oop-aggregation",
  "text-files", "object-files", "random-files", "exceptions", "graphs", "exam-workflow",
]);
const primaryPatternBySlug = Object.freeze({
  "binary-tree": "TREE_INSERT",
  hashing: "HASH_INSERT",
  "oop-model": "OOP_INSTANTIATE",
  "oop-state": "OOP_UPDATE",
  "oop-inheritance": "OOP_OVERRIDE",
  "oop-aggregation": "OOP_CAPACITY_ADD",
  "text-files": "FILE_READ_ARRAY",
  "object-files": "FILE_READ_OBJECTS",
  "exam-workflow": "MAIN_FLOW",
});

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const lessons = manifest.lessons ?? [];
assert(lessons.length === 26, `Expected 26 lessons; found ${lessons.length}.`);
assert(manifest.counts?.lessons === 26, "Manifest lesson denominator must remain 26.");
assert(manifest.counts?.knowledge_units === 108, "Manifest knowledge-unit denominator must remain 108.");

const seenSlugs = new Set();
let knowledgeUnitCount = 0;
let assessmentCount = 0;
let retrievalCount = 0;

for (const entry of lessons) {
  const slug = entry.slug;
  assert(typeof slug === "string" && slug.length > 0, "Every manifest lesson needs a slug.");
  assert(!seenSlugs.has(slug), `Duplicate lesson slug: ${slug}`);
  seenSlugs.add(slug);

  const dtoPath = `app/data/paper4-v2/lessons/${slug}.json`;
  let lesson;
  try {
    lesson = readJson(dtoPath);
  } catch (error) {
    failures.push(`Cannot read ${dtoPath}: ${error.message}`);
    continue;
  }

  assert(lesson.identity?.slug === slug, `${slug}: DTO identity does not match manifest.`);
  const units = lesson.theory?.knowledge_units ?? [];
  const practices = lesson.practice?.items ?? [];
  const retrieval = lesson.retrieval?.items ?? [];
  knowledgeUnitCount += units.length;
  assessmentCount += practices.length;
  retrievalCount += retrieval.length;

  assert(units.length > 0, `${slug}: no theory knowledge units.`);
  assert(Array.isArray(lesson.python?.lines) && lesson.python.lines.length > 0, `${slug}: no Python source lines.`);
  assert(practices.length > 0, `${slug}: no learner practice.`);
  assert(retrieval.length > 0, `${slug}: no retrieval practice.`);

  if (canonicalSlugs.has(slug)) {
    const ownedPatternIds = new Set((lesson.visual?.owned_patterns ?? []).map((pattern) => pattern.pattern_id));
    const primaryPatternId = primaryPatternBySlug[slug];
    if (primaryPatternId) assert(ownedPatternIds.has(primaryPatternId), `${slug}: primary pattern ${primaryPatternId} is not owned by the DTO.`);
  }

  for (const unit of units) {
    for (const locale of ["en", "vi"]) {
      assert(Boolean(unit.title?.[locale]), `${slug}/${unit.knowledge_unit_id}: missing ${locale} title.`);
      assert(Boolean(unit.explanation?.[locale]), `${slug}/${unit.knowledge_unit_id}: missing ${locale} explanation.`);
      assert(Boolean(unit.python_connection?.[locale]), `${slug}/${unit.knowledge_unit_id}: missing ${locale} Python connection.`);
      assert(Boolean(unit.invariant_or_rule?.[locale]), `${slug}/${unit.knowledge_unit_id}: missing ${locale} invariant.`);
    }
  }
}

assert(knowledgeUnitCount === 108, `Expected 108 knowledge units; found ${knowledgeUnitCount}.`);
assert(!lessonPageSource.includes("<PendingLearnerProjection"), "A canonical route can still render PendingLearnerProjection.");
assert(lessonPageSource.includes("CanonicalLessonJourney"), "LessonLearningPage does not use the canonical DTO journey.");
assert(sixStageJourneySource.includes("CanonicalKnowledgeReference"), "Custom lesson routes do not expose canonical knowledge units in Understand.");

const expectedStages = ["recognise", "understand", "trace", "practise", "protectMarks", "recallAndContinue"];
for (const stage of expectedStages) {
  assert(canonicalJourneySource.includes(`data-learner-stage=\"${stage}\"`), `Canonical journey is missing learner stage hook: ${stage}.`);
}
assert(learnerSurfaceSource.includes("data-paper4-lesson"), "Canonical journey/page is missing data-paper4-lesson.");
assert(learnerSurfaceSource.includes("data-content-state=\"ready\""), "Canonical journey/page is missing ready content state.");
assert(learnerSurfaceSource.includes("data-locale={locale}"), "Canonical journey/page is missing locale evidence hook.");

// A ready canonical route is an interaction, not six long sections shown together.
assert(canonicalJourneySource.includes("Paper4LessonShell") && sharedLessonShellSource.includes("data-stage-navigation"), "Canonical journey is missing deterministic shared stage navigation.");
assert(sharedLessonShellSource.includes("data-stage-state"), "Shared lesson shell is missing current/locked stage states.");
assert(canonicalJourneySource.includes("hidden={!current}") || /hidden\s*:\s*!current/.test(canonicalJourneySource), "Canonical journey does not hide non-current stages.");
assert(/useState<[^>]*LearnerStageId[^>]*>\(\s*["']recognise["']\s*\)/.test(canonicalJourneySource) || /useState\(\s*["']recognise["']\s*\)/.test(canonicalJourneySource) || /\[activeIndex\s*,\s*setActiveIndex\]\s*=\s*useState\(0\)/.test(canonicalJourneySource), "Canonical journey does not initialise at Recognise.");
assert(canonicalJourneySource.includes("initialPatternId="), "Canonical trace does not explicitly select its Teacher primary pattern.");
for (const patternId of Object.values(primaryPatternBySlug)) {
  assert(canonicalJourneySource.includes(patternId), `Canonical primary-pattern map is missing ${patternId}.`);
}

// Full Python may exist only inside a collapsed disclosure. Focused trace excerpts remain separate.
assert(/<details[^>]*>\s*<summary[^>]*>[^<]*\{t\.openCode\}[^<]*<\/summary>\s*<pre[^>]*>\s*<code>\{source\}<\/code>\s*<\/pre>\s*<\/details>/.test(canonicalJourneySource), "Canonical full Python source is not confined to its disclosure.");

if (failures.length > 0) {
  console.error("Paper 4 lesson-gap remediation gate: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Paper 4 lesson-gap remediation gate: PASS");
console.log(JSON.stringify({ lessons: lessons.length, localeRoutes: lessons.length * 2, knowledgeUnits: knowledgeUnitCount, assessmentItems: assessmentCount, retrievalItems: retrievalCount, stages: expectedStages.length }, null, 2));
