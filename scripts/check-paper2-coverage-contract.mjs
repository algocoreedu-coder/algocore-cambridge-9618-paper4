import { createRequire } from "node:module";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(root, "../..");
const paper2Lib = path.join(root, "app/lib/paper2");

function loadDomainModule(moduleName) {
  const temp = mkdtempSync(path.join(os.tmpdir(), "paper2-gate-a-domain-"));
  try {
    writeFileSync(path.join(temp, "package.json"), '{"type":"commonjs"}\n');
    for (const name of readdirSync(paper2Lib).filter((entry) => entry.endsWith(".ts"))) {
      const output = ts.transpileModule(readFileSync(path.join(paper2Lib, name), "utf8"), {
        fileName: name,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        reportDiagnostics: true,
      });
      const errors = (output.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
      if (errors.length) throw new Error(`${name}: ${errors.map((item) => item.messageText).join("; ")}`);
      writeFileSync(path.join(temp, name.replace(/\.ts$/, ".js")), output.outputText);
    }
    return createRequire(import.meta.url)(path.join(temp, `${moduleName}.js`));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const { calculateCoverageScore, validateCoverageRegistry, validateCoverageUnit } = loadDomainModule("coverage-types");
const coverage = JSON.parse(readFileSync(path.join(root, "content/paper2/coverage/coverage-map.json"), "utf8"));
const sources = JSON.parse(readFileSync(path.join(root, "content/paper2/sources/source-registry.json"), "utf8"));
const studyMap = JSON.parse(readFileSync(path.join(root, "content/paper2/study-map.json"), "utf8"));

const checks = [];
const failures = [];
const check = (id, condition, detail = undefined) => {
  const result = { id, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) };
  checks.push(result);
  if (!result.pass) failures.push(result);
};
const near = (actual, expected) => Math.abs(actual - expected) < 0.0001;

const units = Array.isArray(coverage.units) ? coverage.units : [];
const validTopicIds = new Set((studyMap.topics ?? []).map((topic) => topic.id));
const validSourceIds = new Set((sources.sources ?? []).map((source) => source.sourceId));
const validEvidenceIds = new Set();
for (const entry of coverage.evidenceSources ?? []) {
  if (typeof entry === "string") {
    const absolute = path.resolve(workspaceRoot, entry);
    check(`evidence-source-exists:${entry}`, existsSync(absolute), entry);
  } else if (entry && typeof entry === "object") {
    if (typeof entry.id === "string") validEvidenceIds.add(entry.id);
    if (typeof entry.path === "string") check(`evidence-source-exists:${entry.id ?? entry.path}`, existsSync(path.resolve(workspaceRoot, entry.path)), entry.path);
  }
}

const lessonDir = path.join(root, "content/paper2/lessons");
for (const file of readdirSync(lessonDir).filter((entry) => entry.endsWith(".json"))) {
  const lesson = JSON.parse(readFileSync(path.join(lessonDir, file), "utf8"));
  for (const value of [lesson.topicId, lesson.slug, ...(lesson.visual?.assetIds ?? [])]) {
    if (typeof value === "string") validEvidenceIds.add(value);
  }
  for (const group of [lesson.theory, lesson.workedExamples, lesson.practices, lesson.misconceptions, lesson.takeaways]) {
    for (const item of group ?? []) if (typeof item?.id === "string") validEvidenceIds.add(item.id);
  }
}
for (const topic of studyMap.topics ?? []) {
  validEvidenceIds.add(topic.id);
  for (const visualId of topic.visualIds ?? []) validEvidenceIds.add(visualId);
}

check("coverage-map-schema", coverage.schemaVersion === 1 && typeof coverage.documentId === "string");
check("coverage-unit-total", units.length === 350 && coverage.totalCoverageUnits === units.length, {
  declared: coverage.totalCoverageUnits,
  actual: units.length,
});
check("taxonomy-count-book", coverage.taxonomyCounts?.book === 150, coverage.taxonomyCounts?.book);
check("taxonomy-count-syllabus", coverage.taxonomyCounts?.syllabus === 93, coverage.taxonomyCounts?.syllabus);
check("taxonomy-count-subskill", coverage.taxonomyCounts?.subskill === 39, coverage.taxonomyCounts?.subskill);
check("taxonomy-count-family", coverage.taxonomyCounts?.past_paper_family === 20, coverage.taxonomyCounts?.past_paper_family);
check("taxonomy-count-pattern", coverage.taxonomyCounts?.pattern === 16, coverage.taxonomyCounts?.pattern);
check("taxonomy-count-topic", coverage.taxonomyCounts?.topic === 32, coverage.taxonomyCounts?.topic);

const registry = validateCoverageRegistry(units, {
  exactBookCount: 150,
  exactSyllabusCount: 93,
  validTopicIds,
  validSourceIds,
  validEvidenceIds,
});
check("positive-registry-validation", registry.ok, registry.ok ? undefined : registry.issues);

const book = units.filter((unit) => unit.taxonomy === "book");
const syllabus = units.filter((unit) => unit.taxonomy === "syllabus");
const bookScore = calculateCoverageScore(book);
const syllabusScore = calculateCoverageScore(syllabus);
const countsFor = (records) => Object.fromEntries(["full", "partial", "missing", "not_applicable"].map((key) => [key, records.filter((record) => record.classification === key).length]));
const bookCounts = countsFor(book);
const syllabusCounts = countsFor(syllabus);

check("book-baseline-counts", bookCounts.full === 133 && bookCounts.partial === 16 && bookCounts.missing === 1, bookCounts);
check("syllabus-baseline-counts", syllabusCounts.full === 87 && syllabusCounts.partial === 6 && syllabusCounts.missing === 0, syllabusCounts);
check("book-baseline-score-94.0", bookScore.denominator === 150 && near(bookScore.percentage, 94.0), bookScore);
check("syllabus-depth-score-96.8", syllabusScore.denominator === 93 && near(syllabusScore.percentage, 96.8), syllabusScore);
check("declared-book-baseline", coverage.baseline?.book?.denominator === 150
  && coverage.baseline.book.full === 133
  && coverage.baseline.book.partial === 16
  && coverage.baseline.book.missing === 1
  && near(coverage.baseline.book.weightedPercent, 94.0), coverage.baseline?.book);
check("declared-syllabus-baseline", coverage.baseline?.syllabus?.denominator === 93
  && coverage.baseline.syllabus.full === 87
  && coverage.baseline.syllabus.partial === 6
  && coverage.baseline.syllabus.missing === 0
  && coverage.baseline.syllabus.mapped === 93
  && near(coverage.baseline.syllabus.mappingPercent, 100.0)
  && near(coverage.baseline.syllabus.weightedDepthPercent, 96.8), coverage.baseline?.syllabus);
check("coverage-id-unique", new Set(units.map((unit) => unit.coverageId)).size === units.length);
const expectedPrefixes = {
  book: "book:",
  syllabus: "syllabus:",
  subskill: "subskill:",
  past_paper_family: "family:",
  pattern: "F",
  topic: "T",
};
check("taxonomy-prefix-separation", units.every((unit) => unit.coverageId.startsWith(expectedPrefixes[unit.taxonomy] ?? "__invalid__")));

const baselineUnit = structuredClone(units[0]);
check("positive-unit-fixture", validateCoverageUnit(baselineUnit).ok);
check("negative-namespace-fixture", !validateCoverageUnit({ ...baselineUnit, taxonomy: baselineUnit.taxonomy === "book" ? "syllabus" : "book" }).ok);
check("negative-missing-source-fixture", !validateCoverageUnit({ ...baselineUnit, sourceIds: [] }).ok);

const duplicate = [...units, structuredClone(units[0])];
check("negative-duplicate-registry", !validateCoverageRegistry(duplicate, { exactBookCount: 150, exactSyllabusCount: 93 }).ok);
const unresolvedSource = structuredClone(units);
unresolvedSource[0].sourceIds = ["source:does-not-exist"];
check("negative-unresolved-source", !validateCoverageRegistry(unresolvedSource, { validSourceIds }).ok);
const unresolvedEvidence = structuredClone(units);
unresolvedEvidence[0].evidenceBindings = [{ kind: "content", id: "evidence-does-not-exist" }];
check("negative-unresolved-evidence", !validateCoverageRegistry(unresolvedEvidence, { validEvidenceIds }).ok);
const changedBaseline = structuredClone(book);
changedBaseline.find((unit) => unit.classification === "full").classification = "missing";
check("negative-score-drift-detected", !near(calculateCoverageScore(changedBaseline).percentage, 94.0), calculateCoverageScore(changedBaseline));

const output = {
  schemaVersion: "paper2-coverage-contract-check-v1",
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  unitCounts: { total: units.length, book: book.length, syllabus: syllabus.length },
  baseline: { book: { ...bookCounts, score: bookScore }, syllabus: { ...syllabusCounts, score: syllabusScore } },
  taxonomyCounts: coverage.taxonomyCounts,
  positiveFixtures: 2,
  negativeFixtures: 7,
  failures,
};
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
