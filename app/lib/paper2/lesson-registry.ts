import "server-only";

import type { Paper2Lesson } from "./lesson-types";
import type { LearningMode } from "./types";
import { parsePaper2Lesson } from "./content-validation";
import studyMap from "@/content/paper2/study-map.json";
import generatedHashes from "./generated/lesson-content-hashes.json";
import { getPaper2VisualIds } from "./server-visual-registry";

// Explicit imports keep each lesson payload out of the public Study Map bundle.
// Adding a file does not publish it: lesson-status and candidate access remain
// separate gates in the topic route.
const loaders: Readonly<Record<string, () => Promise<{ default: unknown }>>> = {
  "abstraction": () => import("@/content/paper2/lessons/abstraction.json"),
  "decomposition": () => import("@/content/paper2/lessons/decomposition.json"),
  "algorithms-ipo-refinement": () => import("@/content/paper2/lessons/algorithms-ipo-refinement.json"),
  "algorithm-representations": () => import("@/content/paper2/lessons/algorithm-representations.json"),
  "identifiers-data-types": () => import("@/content/paper2/lessons/identifiers-data-types.json"),
  "records": () => import("@/content/paper2/lessons/records.json"),
  "arrays": () => import("@/content/paper2/lessons/arrays.json"),
  "linear-search": () => import("@/content/paper2/lessons/linear-search.json"),
  "bubble-sort": () => import("@/content/paper2/lessons/bubble-sort.json"),
  "text-files": () => import("@/content/paper2/lessons/text-files.json"),
  "adt-stack": () => import("@/content/paper2/lessons/adt-stack.json"),
  "queue": () => import("@/content/paper2/lessons/queue.json"),
  "linked-list": () => import("@/content/paper2/lessons/linked-list.json"),
  "variables-constants-io": () => import("@/content/paper2/lessons/variables-constants-io.json"),
  "expressions-operators": () => import("@/content/paper2/lessons/expressions-operators.json"),
  "built-in-functions-insert": () => import("@/content/paper2/lessons/built-in-functions-insert.json"),
  "string-processing": () => import("@/content/paper2/lessons/string-processing.json"),
  "selection": () => import("@/content/paper2/lessons/selection.json"),
  "iteration": () => import("@/content/paper2/lessons/iteration.json"),
  "procedures-functions": () => import("@/content/paper2/lessons/procedures-functions.json"),
  "parameters-byval-byref": () => import("@/content/paper2/lessons/parameters-byval-byref.json"),
  "scope-reuse": () => import("@/content/paper2/lessons/scope-reuse.json"),
  "development-life-cycle": () => import("@/content/paper2/lessons/development-life-cycle.json"),
  "structure-charts": () => import("@/content/paper2/lessons/structure-charts.json"),
  "state-transition-diagrams": () => import("@/content/paper2/lessons/state-transition-diagrams.json"),
  "dry-run-trace-tables": () => import("@/content/paper2/lessons/dry-run-trace-tables.json"),
  "errors-debugging": () => import("@/content/paper2/lessons/errors-debugging.json"),
  "testing-methods": () => import("@/content/paper2/lessons/testing-methods.json"),
  "test-strategy-test-plan": () => import("@/content/paper2/lessons/test-strategy-test-plan.json"),
  "test-data": () => import("@/content/paper2/lessons/test-data.json"),
  "maintenance": () => import("@/content/paper2/lessons/maintenance.json"),
  "amendment-efficiency": () => import("@/content/paper2/lessons/amendment-efficiency.json"),
};

const validationContext = {
  topics: studyMap.topics.map(({ id, slug, sectionId, learningMode, visualIds }) => ({
    id,
    slug,
    sectionId,
    learningMode: learningMode as LearningMode,
    visualIds,
  })),
  visualIds: getPaper2VisualIds(),
};

export async function getPaper2Lesson(slug: string): Promise<Paper2Lesson | undefined> {
  const load = loaders[slug];
  if (!load) return undefined;
  const module = await load();
  return parsePaper2Lesson(module.default, validationContext);
}

export function getGeneratedPaper2LessonHash(slug: string) {
  return generatedHashes.lessons.find((record) => record.slug === slug);
}

export const implementedPaper2LessonSlugs = Object.freeze(Object.keys(loaders));
