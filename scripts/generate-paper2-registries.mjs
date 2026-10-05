import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content/paper2");
const outputRoot = path.join(root, "app/lib/paper2/generated");

const questions = readRecords(path.join(contentRoot, "questions/public"), ".question.json");
const solutions = readRecords(path.join(contentRoot, "solutions/private"), ".solution.json");
const practiceSets = readRecords(path.join(contentRoot, "practice-sets"), ".practice-set.json");
const mocks = readRecords(path.join(contentRoot, "mocks"), ".mock.json");
const publicMocks = mocks.map(({ privateHash: _privateHash, ...mock }) => mock);

assertUnique(questions, (item) => `${item.questionId}@${item.questionVersion}`, "question");
assertUnique(solutions, (item) => `${item.questionId}@${item.questionVersion}`, "solution");
assertUnique(practiceSets, (item) => `${item.setId}@${item.setVersion}`, "practice set");
assertUnique(mocks, (item) => `${item.paperId}@${item.paperVersion}`, "mock");

for (const question of questions) assertHash(question, "publicHash");
for (const solution of solutions) assertHash(solution, "privateHash");

const descriptors = {
  schemaVersion: 1,
  generatedAt: "deterministic",
  counts: {
    questions: questions.length,
    solutions: solutions.length,
    practiceSets: practiceSets.length,
    mocks: mocks.length,
  },
  practiceSets: practiceSets.map((set) => ({
    setId: set.setId,
    setVersion: set.setVersion,
    kind: set.kind,
    title: set.title,
    mode: set.mode,
    questionCount: set.questionRefs?.length ?? 0,
    computedMarks: set.computedMarks,
    computedMinutes: set.computedMinutes,
    prerequisiteTopicIds: set.prerequisiteTopicIds,
    rightsStatus: set.rightsStatus,
  })),
  mocks: mocks.map((mock) => ({
    paperId: mock.paperId,
    paperVersion: mock.paperVersion,
    durationMinutes: mock.durationMinutes,
    totalMarks: mock.totalMarks,
    questionCount: mock.questionRefs?.length ?? 0,
    independentReviewStatus: mock.independentReviewStatus,
  })),
};

mkdirSync(outputRoot, { recursive: true });
writeJson("assessment-public.json", { schemaVersion: 1, questions, practiceSets, mocks: publicMocks });
writeJson("assessment-private.json", { schemaVersion: 1, solutions, mockPrivateBindings: mocks.map((mock) => ({ paperId: mock.paperId, paperVersion: mock.paperVersion, privateHash: mock.privateHash, solutionPackId: mock.solutionPackId })) });
writeJson("assessment-descriptors.json", descriptors);

console.log(JSON.stringify({
  decision: "PASS",
  output: "app/lib/paper2/generated",
  counts: descriptors.counts,
  hashes: {
    public: digest({ questions, practiceSets, mocks: publicMocks }),
    private: digest({ solutions, mockPrivateBindings: mocks.map((mock) => ({ paperId: mock.paperId, paperVersion: mock.paperVersion, privateHash: mock.privateHash, solutionPackId: mock.solutionPackId })) }),
    descriptors: digest(descriptors),
  },
}, null, 2));

function readRecords(directory, suffix) {
  let filenames;
  try {
    filenames = readdirSync(directory).filter((name) => name.endsWith(suffix)).sort();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  return filenames.map((filename) => {
    const absolute = path.join(directory, filename);
    try {
      return JSON.parse(readFileSync(absolute, "utf8"));
    } catch (error) {
      throw new Error(`${path.relative(root, absolute)} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

function assertUnique(records, identityFor, label) {
  const seen = new Set();
  for (const record of records) {
    const identity = identityFor(record);
    if (!identity || identity.includes("undefined")) throw new Error(`A ${label} is missing its identity.`);
    if (seen.has(identity)) throw new Error(`Duplicate ${label} identity: ${identity}.`);
    seen.add(identity);
  }
}

function assertHash(record, field) {
  const declared = record[field];
  if (typeof declared !== "string" || !/^[a-f0-9]{64}$/i.test(declared)) {
    throw new Error(`${field} is missing or invalid for ${record.questionId ?? "unknown record"}.`);
  }
  const clone = structuredClone(record);
  delete clone[field];
  const expected = digest(clone);
  if (declared !== expected) throw new Error(`${field} mismatch for ${record.questionId}: expected ${expected}, found ${declared}.`);
}

function writeJson(filename, value) {
  writeFileSync(path.join(outputRoot, filename), `${JSON.stringify(sortDeep(value), null, 2)}\n`);
}

function digest(value) {
  return createHash("sha256").update(JSON.stringify(sortDeep(value))).digest("hex");
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
  return value;
}
