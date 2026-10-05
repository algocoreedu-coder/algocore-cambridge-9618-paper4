import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPaper2Domain, readJsonRecords } from "./lib/load-paper2-domain.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const domain = loadPaper2Domain(root, "question-types");
const mocks = readJsonRecords(path.join(root, "content/paper2/mocks"), ".mock.json");
const questions = readJsonRecords(path.join(root, "content/paper2/questions/public"), ".question.json").map((entry) => entry.value);
const questionsByIdentity = new Map(questions.map((q) => [`${q.questionId}@${q.questionVersion}`, q]));
const checks = [], failures = [];
const check = (id, pass, detail) => { const result = { id, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) }; checks.push(result); if (!result.pass) failures.push(result); };

check("exactly-two-mocks", mocks.length === 2, mocks.length);
for (const { name, value: mock } of mocks) {
  const result = domain.validateMockComposition(mock, { questionsByIdentity });
  check(`mock-composition:${name}`, result.ok, result.ok ? undefined : result.issues);
  check(`mock-review-approved:${name}`, mock.independentReviewStatus === "approved", mock.independentReviewStatus);
  const members = mock.questionRefs.map((ref) => questionsByIdentity.get(`${ref.questionId}@${ref.questionVersion}`)).filter(Boolean);
  const coveredSections = new Set(members.flatMap((question) => question.sectionIds));
  const coveredStrands = new Set([...coveredSections].map((sectionId) => sectionId.split(".")[0]));
  check(`mock-four-syllabus-strands:${name}`, ["9", "10", "11", "12"].every((strand) => coveredStrands.has(strand)), { sections: [...coveredSections].sort(), strands: [...coveredStrands].sort() });
  check(`mock-command-breadth:${name}`, new Set(members.map((question) => question.commandWord.toLowerCase())).size >= 6);
  check(`mock-blueprint-identities:${name}`, new Set(mock.blueprint.map((entry) => entry.questionId)).size === mock.questionRefs.length);
}
const independence = domain.validateMockIndependence(mocks.map((entry) => entry.value));
check("mock-independence", independence.ok, independence.ok ? undefined : independence.issues);

console.log(JSON.stringify({ schemaVersion: "paper2-mock-check-v1", decision: failures.length ? "FAIL" : "PASS", passed: checks.length - failures.length, total: checks.length, mockCount: mocks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
