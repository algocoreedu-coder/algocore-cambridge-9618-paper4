import type { Paper2Lesson } from "./lesson-types";
import type { LearningMode } from "./types";

type CatalogTopic = {
  readonly id: string;
  readonly slug: string;
  readonly sectionId: string;
  readonly learningMode: LearningMode;
  readonly visualIds: readonly string[];
};

export interface Paper2LessonValidationContext {
  readonly topics?: readonly CatalogTopic[];
  readonly visualIds?: ReadonlySet<string> | readonly string[];
}

const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LEARNING_MODES = new Set(["explanation", "diagram", "procedural", "testing"]);
const SOURCE_KINDS = new Set(["syllabus", "book", "guide", "question-paper", "mark-scheme", "teacher-authored"]);
const ORIGINS = new Set(["algocore-authored", "adapted-from-source"]);
const PATTERN_ROLES = new Set(["owner", "related"]);

type Identified = Record<string, unknown> & { readonly id: string };
type SourceReferenced = Identified & { readonly sourceIds: readonly string[] };

const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max = 10_000): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const id = (value: unknown): value is string => text(value, 120) && SAFE_ID.test(value);
const slug = (value: unknown): value is string => text(value, 160) && SAFE_SLUG.test(value);

function exactKeys(value: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []) {
  const allowed = new Set([...required, ...optional]);
  return required.every((key) => Object.hasOwn(value, key)) && Object.keys(value).every((key) => allowed.has(key));
}

function localized(value: unknown): value is { readonly en: string; readonly vi: string } {
  return record(value) && exactKeys(value, ["en", "vi"]) && text(value.en) && text(value.vi);
}

function arrayOf<T>(value: unknown, validator: (item: unknown) => item is T, minimum = 1): value is readonly T[] {
  return Array.isArray(value) && value.length >= minimum && value.every(validator);
}

function uniqueStrings(values: readonly string[]) {
  return new Set(values).size === values.length;
}

const localizedArray = (value: unknown, minimum = 1) => arrayOf(value, localized, minimum);
const stringArray = (value: unknown, minimum = 1) => arrayOf(value, (item): item is string => id(item), minimum) && uniqueStrings(value);

function prerequisite(value: unknown): value is Record<string, unknown> {
  return record(value) && exactKeys(value, ["title", "reason"]) && localized(value.title) && localized(value.reason);
}

function glossaryItem(value: unknown): value is Record<string, unknown> {
  return record(value) && exactKeys(value, ["term", "meaning"]) && text(value.term, 200) && localized(value.meaning);
}

function theoryBlock(value: unknown): value is SourceReferenced {
  if (!record(value) || !exactKeys(value, ["id", "title", "paragraphs", "sourceIds"], ["bullets", "table"])) return false;
  if (!id(value.id) || !localized(value.title) || !localizedArray(value.paragraphs) || !stringArray(value.sourceIds)) return false;
  if (value.bullets !== undefined && !localizedArray(value.bullets)) return false;
  if (value.table !== undefined) {
    if (!record(value.table) || !exactKeys(value.table, ["headers", "rows"]) || !localizedArray(value.table.headers)) return false;
    const width = value.table.headers.length;
    if (!Array.isArray(value.table.rows) || value.table.rows.length === 0) return false;
    if (!value.table.rows.every((row) => Array.isArray(row) && row.length === width && row.every(localized))) return false;
  }
  return true;
}

function workedStep(value: unknown): value is Identified {
  return record(value)
    && exactKeys(value, ["id", "action", "why", "result"], ["check"])
    && id(value.id)
    && localized(value.action)
    && localized(value.why)
    && localized(value.result)
    && (value.check === undefined || localized(value.check));
}

function workedExample(value: unknown): value is SourceReferenced {
  return record(value)
    && exactKeys(value, ["id", "title", "prompt", "origin", "officialMarks", "steps", "answer", "selfCheck", "sourceIds"])
    && id(value.id)
    && localized(value.title)
    && localized(value.prompt)
    && ORIGINS.has(value.origin as string)
    && value.officialMarks === null
    && arrayOf(value.steps, workedStep)
    && uniqueStrings(value.steps.map((step) => step.id))
    && localized(value.answer)
    && localized(value.selfCheck)
    && stringArray(value.sourceIds);
}

function practice(value: unknown): value is SourceReferenced {
  return record(value)
    && exactKeys(value, ["id", "title", "prompt", "working", "answer", "markGuidance", "commonMistakes", "selfCheck", "origin", "officialMarks", "sourceIds"])
    && id(value.id)
    && localized(value.title)
    && localized(value.prompt)
    && localizedArray(value.working)
    && localized(value.answer)
    && localizedArray(value.markGuidance)
    && localizedArray(value.commonMistakes)
    && localized(value.selfCheck)
    && ORIGINS.has(value.origin as string)
    && value.officialMarks === null
    && stringArray(value.sourceIds);
}

function misconception(value: unknown): value is Record<string, unknown> {
  return record(value)
    && exactKeys(value, ["mistake", "correction", "selfCheck"])
    && localized(value.mistake)
    && localized(value.correction)
    && localized(value.selfCheck);
}

function patternLink(value: unknown): value is Identified {
  return record(value)
    && exactKeys(value, ["id", "role", "title"])
    && id(value.id)
    && PATTERN_ROLES.has(value.role as string)
    && localized(value.title);
}

function source(value: unknown): value is Identified {
  if (!record(value) || !exactKeys(value, ["id", "title", "locator", "kind"], ["url"])) return false;
  if (!id(value.id) || !text(value.title) || !text(value.locator) || !SOURCE_KINDS.has(value.kind as string)) return false;
  if (value.url !== undefined) {
    if (!text(value.url, 2_000)) return false;
    try {
      const parsed = new URL(value.url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    } catch {
      return false;
    }
  }
  return true;
}

function allReferencedSourcesExist(lesson: Record<string, unknown>, sourceIds: ReadonlySet<string>) {
  const referenced: string[] = [];
  const add = (items: unknown) => {
    if (Array.isArray(items)) referenced.push(...items.filter((item): item is string => typeof item === "string"));
  };
  for (const block of lesson.theory as readonly Record<string, unknown>[]) add(block.sourceIds);
  add((lesson.visual as Record<string, unknown>).sourceIds);
  for (const example of lesson.workedExamples as readonly Record<string, unknown>[]) add(example.sourceIds);
  for (const task of lesson.practices as readonly Record<string, unknown>[]) add(task.sourceIds);
  return referenced.every((sourceId) => sourceIds.has(sourceId));
}

export function validatePaper2Lesson(value: unknown, context: Paper2LessonValidationContext = {}): value is Paper2Lesson {
  if (!record(value) || !exactKeys(value, [
    "schemaVersion", "version", "topicId", "sectionId", "slug", "learningMode", "title", "question", "opening", "objectives",
    "prerequisites", "glossary", "recognition", "theory", "visual", "workedExamples", "practices", "misconceptions", "recall",
    "takeaways", "patternLinks", "relatedSlugs", "sources",
  ], ["estimatedMinutes"])) return false;
  if (
    value.schemaVersion !== 1
    || !text(value.version, 80)
    || !id(value.topicId)
    || !id(value.sectionId)
    || !slug(value.slug)
    || !LEARNING_MODES.has(value.learningMode as string)
    || (value.estimatedMinutes !== undefined && (!Number.isInteger(value.estimatedMinutes) || (value.estimatedMinutes as number) < 1 || (value.estimatedMinutes as number) > 600))
    || !localized(value.title)
    || !localized(value.question)
    || !localized(value.opening)
    || !localizedArray(value.objectives)
    || !arrayOf(value.prerequisites, prerequisite, 0)
    || !arrayOf(value.glossary, glossaryItem)
  ) return false;

  if (!record(value.recognition) || !exactKeys(value.recognition, ["cues", "misleadingCues", "answerProduct", "method"])) return false;
  if (!localizedArray(value.recognition.cues) || !localizedArray(value.recognition.misleadingCues) || !localized(value.recognition.answerProduct) || !localizedArray(value.recognition.method)) return false;

  if (!arrayOf(value.theory, theoryBlock) || !uniqueStrings(value.theory.map((block) => block.id))) return false;
  if (!record(value.visual) || !exactKeys(value.visual, ["assetIds", "title", "introduction", "task", "conventions", "sourceIds"])) return false;
  if (!stringArray(value.visual.assetIds) || !localized(value.visual.title) || !localized(value.visual.introduction) || !localized(value.visual.task) || !localizedArray(value.visual.conventions) || !stringArray(value.visual.sourceIds)) return false;
  if (!arrayOf(value.workedExamples, workedExample) || !uniqueStrings(value.workedExamples.map((example) => example.id))) return false;
  if (!arrayOf(value.practices, practice, 2) || !uniqueStrings(value.practices.map((task) => task.id))) return false;
  if (!arrayOf(value.misconceptions, misconception) || !record(value.recall) || !exactKeys(value.recall, ["prompt", "answerPoints"]) || !localized(value.recall.prompt) || !localizedArray(value.recall.answerPoints)) return false;
  if (!localizedArray(value.takeaways) || !arrayOf(value.patternLinks, patternLink) || !uniqueStrings(value.patternLinks.map((link) => link.id))) return false;
  if (!Array.isArray(value.relatedSlugs) || !value.relatedSlugs.every(slug) || !uniqueStrings(value.relatedSlugs)) return false;
  if (!arrayOf(value.sources, source) || !uniqueStrings(value.sources.map((item) => item.id))) return false;

  const availableSourceIds = new Set(value.sources.map((item) => item.id));
  if (!allReferencedSourcesExist(value, availableSourceIds)) return false;

  const topic = context.topics?.find((candidate) => candidate.id === value.topicId);
  if (context.topics && (!topic || topic.slug !== value.slug || topic.sectionId !== value.sectionId || topic.learningMode !== value.learningMode)) return false;
  const canonicalVisualIds = context.visualIds instanceof Set ? context.visualIds : new Set(context.visualIds ?? []);
  const lessonVisualIds = (value.visual as { readonly assetIds: readonly string[] }).assetIds;
  if (context.visualIds && !lessonVisualIds.every((assetId) => canonicalVisualIds.has(assetId))) return false;
  if (topic && !lessonVisualIds.every((assetId) => topic.visualIds.includes(assetId))) return false;
  return true;
}

export function parsePaper2Lesson(value: unknown, context: Paper2LessonValidationContext = {}): Paper2Lesson | undefined {
  return validatePaper2Lesson(value, context) ? value : undefined;
}
