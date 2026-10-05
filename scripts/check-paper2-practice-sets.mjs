import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { loadPaper2Domain, readJsonRecords } from "./lib/load-paper2-domain.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const domain = loadPaper2Domain(root, "question-types");
const sets = readJsonRecords(path.join(root, "content/paper2/practice-sets"), ".practice-set.json");
const questions = readJsonRecords(path.join(root, "content/paper2/questions/public"), ".question.json").map((entry) => entry.value);
const studyMap = JSON.parse(readFileSync(path.join(root, "content/paper2/study-map.json"), "utf8"));
const questionsByIdentity = new Map(questions.map((q) => [`${q.questionId}@${q.questionVersion}`, q]));
const checks = [], failures = [];
const check = (id, pass, detail) => { const result = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(result); if (!result.pass) failures.push(result); };

check("minimum-12-section-mixed", sets.filter((entry) => entry.value.kind === "section_mixed").length >= 12, sets.filter((entry) => entry.value.kind === "section_mixed").length);
check("minimum-4-cumulative", sets.filter((entry) => entry.value.kind === "cumulative").length >= 4, sets.filter((entry) => entry.value.kind === "cumulative").length);
check("minimum-1-diagnostic", sets.some((entry) => entry.value.kind === "diagnostic"));

const coveredSections = new Set();
for (const { name, value: set } of sets) {
  const result = domain.validatePracticeSetComposition(set, { questionsByIdentity });
  check(`set-composition:${name}`, result.ok, result.ok ? undefined : result.issues);
  check(`set-rights-approved:${name}`, set.rightsStatus === "approved", set.rightsStatus);
  check(`set-nonempty:${name}`, set.questionRefs.length > 0);
  const members = set.questionRefs.map((ref) => questionsByIdentity.get(`${ref.questionId}@${ref.questionVersion}`)).filter(Boolean);
  const memberSections = new Set(members.flatMap((question) => question.sectionIds));
  if (set.kind === "section_mixed" && memberSections.size === 1) coveredSections.add([...memberSections][0]);
  check(`set-refs-unique:${name}`, new Set(set.questionRefs.map((ref) => `${ref.questionId}@${ref.questionVersion}`)).size === set.questionRefs.length);
  check(`set-no-blocked-questions:${name}`, members.length === set.questionRefs.length && members.every((question) => ["reviewed", "published"].includes(question.status)));
}
for (const section of studyMap.sections) check(`section-mixed-covered:${section.id}`, coveredSections.has(section.id));

console.log(JSON.stringify({ schemaVersion: "paper2-practice-set-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, setCount: sets.length, coveredSections: [...coveredSections].sort(), failures }, null, 2));
if (failures.length) process.exitCode = 1;
