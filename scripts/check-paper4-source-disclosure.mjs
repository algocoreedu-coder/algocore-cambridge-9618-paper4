import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WRITE_EVIDENCE = process.argv.includes("--write-evidence");
const EVIDENCE_DIR = path.resolve(ROOT, "..", "planning", "paper4", "exam-readiness-coverage-2026-10-02", "evidence", "t2");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pageValue(reference) {
  if (Array.isArray(reference.printed_pages) && reference.printed_pages.length > 0) return reference.printed_pages;
  if (Array.isArray(reference.pdf_pages) && reference.pdf_pages.length > 0) return reference.pdf_pages;
  return [];
}

const manifest = JSON.parse(await readFile(path.join(ROOT, "app", "data", "paper4-v2", "course-manifest.json"), "utf8"));
const routeCoverage = [];
const coursebookSections = new Map();
const syllabusObjectives = new Map();

for (const lessonMeta of manifest.lessons) {
  const lesson = JSON.parse(await readFile(path.join(ROOT, "app", "data", "paper4-v2", "lessons", `${lessonMeta.slug}.json`), "utf8"));
  const coursebookHeadings = new Map(lesson.sources
    .filter((source) => source.authority.toLowerCase().includes("coursebook") && source.locator.anchor_text)
    .map((source) => [source.locator.anchor_text, source.locator.heading]));
  const lessonBooks = new Set();
  const lessonObjectives = new Set();

  for (const unit of lesson.theory.knowledge_units) {
    for (const reference of unit.book_refs) {
      lessonBooks.add(reference.section_id);
      const record = {
        route: `/paper-4/lessons/${lesson.identity.slug}`,
        heading: coursebookHeadings.get(reference.section_id),
        pages: pageValue(reference),
      };
      const current = coursebookSections.get(reference.section_id);
      coursebookSections.set(reference.section_id, current ?? record);
    }

    for (const reference of unit.objective_refs) {
      lessonObjectives.add(reference.objective_id);
      const record = {
        route: `/paper-4/lessons/${lesson.identity.slug}`,
        heading: [reference.locator.heading, reference.locator.bullet_locator].filter(Boolean).join(" — "),
        page: reference.locator.printed_page ?? reference.locator.pdf_page,
      };
      const current = syllabusObjectives.get(reference.objective_id);
      syllabusObjectives.set(reference.objective_id, current ?? record);
    }
  }

  routeCoverage.push({
    slug: lesson.identity.slug,
    locale_routes: 2,
    coursebook_sections: lessonBooks.size,
    syllabus_objectives: lessonObjectives.size,
  });
}

assert(manifest.lessons.length === 26, `Expected 26 Paper 4 lessons; found ${manifest.lessons.length}`);
assert(coursebookSections.size === 55, `Expected 55 unique coursebook sections; found ${coursebookSections.size}`);
assert(syllabusObjectives.size === 107, `Expected 107 unique syllabus objectives; found ${syllabusObjectives.size}`);

const unresolvedBooks = [...coursebookSections.values()].filter((record) => !record.heading || record.pages.length === 0);
const unresolvedObjectives = [...syllabusObjectives.values()].filter((record) => !record.heading || record.page === undefined || record.page === null || record.page === "");
assert(unresolvedBooks.length === 0, `${unresolvedBooks.length} coursebook sections lack a friendly heading or page`);
assert(unresolvedObjectives.length === 0, `${unresolvedObjectives.length} syllabus objectives lack a friendly heading or page`);

const [componentSource, componentCss, lessonPageSource] = await Promise.all([
  readFile(path.join(ROOT, "app", "components", "paper4-learning", "SourceDisclosure.tsx"), "utf8"),
  readFile(path.join(ROOT, "app", "components", "paper4-learning", "SourceDisclosure.module.css"), "utf8"),
  readFile(path.join(ROOT, "app", "components", "paper4-learning", "LessonLearningPage.tsx"), "utf8"),
]);

assert((lessonPageSource.match(/<SourceDisclosure\b/g) ?? []).length === 2, "Source disclosure must be mounted in both canonical and projection learner routes");
assert(/unit\.book_refs/.test(componentSource) && /unit\.objective_refs/.test(componentSource), "Source disclosure must consume both canonical coursebook and syllabus locators");
assert(/<details[\s\S]*?<summary>/.test(componentSource), "Source disclosure must use native keyboard and screen-reader disclosure semantics");
assert(/aria-labelledby="paper4-source-disclosure-heading"/.test(componentSource), "Source disclosure needs an accessible region label");
assert(/data-learning-source/.test(componentSource) && /data-source-disclosure/.test(componentSource), "Source disclosure needs stable QA markers");
assert(/Sources and exam scope/.test(componentSource) && /Nguồn học và phạm vi thi/.test(componentSource), "Source disclosure needs equivalent English and Vietnamese labels");
assert(/:focus-visible/.test(componentCss), "Source disclosure needs a visible keyboard focus style");
assert(/@media\s*\(max-width:\s*40rem\)/.test(componentCss) && /grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(componentCss), "Source disclosure needs single-column small-screen and 200% zoom reflow");
assert(!/>\s*\{item\.key\}\s*</.test(componentSource), "Internal reference keys must not be rendered as learner text");
assert(!/<code\b/.test(componentSource), "Source disclosure must not expose an audit/code view");
assert(!/question paper|mark scheme|official marks?|Cambridge-endorsed/i.test(componentSource), "Source disclosure must not invent exam-paper, mark, or endorsement claims");

const visibleModel = [
  ...coursebookSections.values().flatMap((record) => [record.heading, ...record.pages.map(String)]),
  ...syllabusObjectives.values().flatMap((record) => [record.heading, String(record.page)]),
].join("\n");
assert(!/\b(?:BOOK|SYL)-[A-Z0-9.-]+\b/.test(visibleModel), "Friendly source labels must not contain raw internal IDs");

const report = {
  schema_version: "paper4-t2-source-disclosure-check-v1",
  status: "PASS",
  checks: {
    lesson_routes: 26,
    locale_routes: 52,
    coursebook_sections_reachable: coursebookSections.size,
    coursebook_sections_total: 55,
    syllabus_objectives_reachable: syllabusObjectives.size,
    syllabus_objectives_total: 107,
    unresolved_coursebook_locators: unresolvedBooks.length,
    unresolved_syllabus_locators: unresolvedObjectives.length,
    raw_internal_ids_in_friendly_labels: 0,
    native_disclosure_semantics: true,
    visible_focus_style: true,
    small_screen_reflow: true,
    english_vietnamese_labels: true,
  },
  route_coverage: routeCoverage,
  limitations: [
    "This gate proves learner-visible locator reachability, not semantic completeness of the teaching content.",
    "Coursebook citations describe the reviewed Paper 4 subset; they do not imply Cambridge endorsement.",
    "This static gate verifies semantic controls and reflow hooks; full browser and assistive-technology testing remains part of the broader release gate.",
  ],
};

if (WRITE_EVIDENCE) {
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await writeFile(path.join(EVIDENCE_DIR, "source-disclosure-check.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
