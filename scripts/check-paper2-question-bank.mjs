import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { loadPaper2Domain, readJsonRecords, stableJson } from "./lib/load-paper2-domain.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const domain = loadPaper2Domain(root, "question-types");
const questions = readJsonRecords(path.join(root, "content/paper2/questions/public"), ".question.json");
const solutions = readJsonRecords(path.join(root, "content/paper2/solutions/private"), ".solution.json");
const studyMap = JSON.parse(readFileSync(path.join(root, "content/paper2/study-map.json"), "utf8"));
const coverage = JSON.parse(readFileSync(path.join(root, "content/paper2/coverage/coverage-map.json"), "utf8"));
const sourceRegistry = JSON.parse(readFileSync(path.join(root, "content/paper2/sources/source-registry.json"), "utf8"));
const rightsLedger = JSON.parse(readFileSync(path.join(root, "content/paper2/sources/rights-ledger.json"), "utf8"));

const checks = [], failures = [];
const check = (id, pass, detail) => { const result = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(result); if (!result.pass) failures.push(result); };
const qValues = questions.map((entry) => entry.value);
const sValues = solutions.map((entry) => entry.value);
const qByIdentity = new Map(qValues.map((q) => [`${q.questionId}@${q.questionVersion}`, q]));
const sByIdentity = new Map(sValues.map((s) => [`${s.questionId}@${s.questionVersion}`, s]));
const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.sourceId, source]));
const rightsById = new Map(rightsLedger.rights.map((rights) => [rights.rightsId, rights]));
const coverageIds = new Set(coverage.units.map((unit) => unit.coverageId));
const topicIds = new Set(studyMap.topics.map((topic) => topic.id));
const sectionIds = new Set(studyMap.sections.map((section) => section.id));
const patternIds = new Set(coverage.units.filter((unit) => unit.taxonomy === "pattern").map((unit) => unit.coverageId));
const familyIds = new Set(coverage.units.filter((unit) => unit.taxonomy === "past_paper_family").map((unit) => unit.coverageId));
const subskillIds = new Set(coverage.units.filter((unit) => unit.taxonomy === "subskill").map((unit) => unit.coverageId));

check("question-minimum-64", qValues.length >= 64, qValues.length);
check("solution-count-matches", sValues.length === qValues.length, { questions: qValues.length, solutions: sValues.length });
check("question-identities-unique", qByIdentity.size === qValues.length);
check("solution-identities-unique", sByIdentity.size === sValues.length);

for (const { name, value: question } of questions) {
  const identity = `${question.questionId}@${question.questionVersion}`;
  const solution = sByIdentity.get(identity);
  const shape = domain.validatePublicQuestion(question, `questions/${name}`);
  check(`question-shape:${name}`, shape.ok, shape.ok ? undefined : shape.issues);
  check(`question-paired:${name}`, Boolean(solution), identity);
  if (solution) {
    const pair = domain.validateQuestionSolutionPair(question, solution, { sourcesById, rightsById, requestedUse: "learner-display" });
    check(`question-solution-pair:${name}`, pair.ok, pair.ok ? undefined : pair.issues);
  }
  check(`question-status-reviewed:${name}`, ["reviewed", "published"].includes(question.status), question.status);
  check(`question-not-official:${name}`, question.markStatus !== "official" && question.origin !== "official-question", { markStatus: question.markStatus, origin: question.origin });
  check(`question-reference-integrity:${name}`,
    question.sectionIds.every((id) => sectionIds.has(id))
    && question.topicIds.every((id) => topicIds.has(id))
    && question.patternIds.every((id) => patternIds.has(id))
    && question.familyIds.every((id) => familyIds.has(id))
    && question.subskillIds.every((id) => subskillIds.has(id))
    && question.coverageIds.every((id) => coverageIds.has(id))
    && question.sourceIds.every((id) => sourcesById.has(id))
    && rightsById.has(question.rightsId));
  check(`question-public-no-private-fields:${name}`, !containsForbidden(question));
  check(`question-public-hash:${name}`, hashWithout(question, "publicHash") === question.publicHash, { expected: hashWithout(question, "publicHash"), found: question.publicHash });
}

for (const { name, value: solution } of solutions) {
  const shape = domain.validatePrivateSolution(solution, `solutions/${name}`);
  check(`solution-shape:${name}`, shape.ok, shape.ok ? undefined : shape.issues);
  check(`solution-question-resolves:${name}`, qByIdentity.has(`${solution.questionId}@${solution.questionVersion}`));
  check(`solution-private-hash:${name}`, hashWithout(solution, "privateHash") === solution.privateHash, { expected: hashWithout(solution, "privateHash"), found: solution.privateHash });
}

for (const topicId of topicIds) check(`topic-covered:${topicId}`, qValues.filter((q) => q.topicIds.includes(topicId)).length >= 2, qValues.filter((q) => q.topicIds.includes(topicId)).length);
for (const patternId of patternIds) check(`pattern-covered:${patternId}`, qValues.some((q) => q.patternIds.includes(patternId)));
check("command-word-breadth", new Set(qValues.map((q) => q.commandWord.toLowerCase())).size >= 8, [...new Set(qValues.map((q) => q.commandWord))]);
check("family-breadth", [...familyIds].every((id) => qValues.some((q) => q.familyIds.includes(id))), [...familyIds].filter((id) => !qValues.some((q) => q.familyIds.includes(id))));

console.log(JSON.stringify({ schemaVersion: "paper2-question-bank-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, questions: qValues.length, solutions: sValues.length, topicCoverage: topicIds.size, patternCoverage: patternIds.size, failures }, null, 2));
if (failures.length) process.exitCode = 1;

function hashWithout(value, field) { const clone = structuredClone(value); delete clone[field]; return createHash("sha256").update(stableJson(clone)).digest("hex"); }
function containsForbidden(value) {
  const forbidden = new Set(["modelAnswer", "markPoints", "acceptedAlternatives", "dependencyCredit", "commonErrors", "privateHash", "rubricId"]);
  if (Array.isArray(value)) return value.some(containsForbidden);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, child]) => forbidden.has(key) || containsForbidden(child));
}
