import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paper2Lib = path.join(root, "app/lib/paper2");

function loadDomainModule(moduleName) {
  const temp = mkdtempSync(path.join(os.tmpdir(), "paper2-gate-a-domain-"));
  try {
    writeFileSync(path.join(temp, "package.json"), '{"type":"commonjs"}\n');
    for (const name of readdirSync(paper2Lib).filter((entry) => entry.endsWith(".ts"))) {
      const source = readFileSync(path.join(paper2Lib, name), "utf8");
      const output = ts.transpileModule(source, {
        fileName: name,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
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

const {
  evaluateLearnerEligibility,
  toLearnerSourceDto,
  validateRightsRecord,
  validateSourceRecord,
} = loadDomainModule("source-types");

const sourceRegistry = JSON.parse(readFileSync(path.join(root, "content/paper2/sources/source-registry.json"), "utf8"));
const rightsLedger = JSON.parse(readFileSync(path.join(root, "content/paper2/sources/rights-ledger.json"), "utf8"));
const checks = [];
const failures = [];
const check = (id, condition, detail = undefined) => {
  const result = { id, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) };
  checks.push(result);
  if (!result.pass) failures.push(result);
};

const sources = Array.isArray(sourceRegistry.sources) ? sourceRegistry.sources : [];
const rights = Array.isArray(rightsLedger.rights) ? rightsLedger.rights : [];
const rightsById = new Map(rights.map((record) => [record.rightsId, record]));

check("source-registry-schema", sourceRegistry.schemaVersion === 1 && sourceRegistry.sourceCount === sources.length, {
  schemaVersion: sourceRegistry.schemaVersion,
  declared: sourceRegistry.sourceCount,
  actual: sources.length,
});
check("rights-ledger-schema", rightsLedger.schemaVersion === 1 && rightsLedger.recordCount === rights.length, {
  schemaVersion: rightsLedger.schemaVersion,
  declared: rightsLedger.recordCount,
  actual: rights.length,
});
check("source-id-unique", new Set(sources.map((record) => record.sourceId)).size === sources.length);
check("rights-id-unique", new Set(rights.map((record) => record.rightsId)).size === rights.length);

for (const [index, record] of sources.entries()) {
  const validation = validateSourceRecord(record, `sources[${index}]`);
  check(`source-valid:${record.sourceId ?? index}`, validation.ok, validation.ok ? undefined : validation.issues);
  check(`source-rights-resolve:${record.sourceId ?? index}`, rightsById.has(record.rightsId), record.rightsId);
  if (validation.ok) {
    const dto = toLearnerSourceDto(validation.value);
    const dtoJson = JSON.stringify(dto);
    check(`learner-dto-no-private-fields:${record.sourceId}`, !/(localPath|fileUri|sha256|reviewerPrivateName|unpublishedSourceFile)/.test(dtoJson));
    check(`learner-dto-no-local-path:${record.sourceId}`, !/(?:file:\/\/|[A-Za-z]:\\\\|\\\\Users\\\\|\\\\Private\\\\)/i.test(dtoJson));
  }
}
for (const [index, record] of rights.entries()) {
  const validation = validateRightsRecord(record, `rights[${index}]`);
  check(`rights-valid:${record.rightsId ?? index}`, validation.ok, validation.ok ? undefined : validation.issues);
  if (validation.ok) {
    const learnerUses = record.allowedUses.filter((use) => use.startsWith("learner-") || use === "external-link");
    for (const requestedUse of learnerUses) {
      const decision = evaluateLearnerEligibility(record, { requestedUse, embedsSourceContent: requestedUse !== "external-link" });
      const shouldBeEligible = record.reviewStatus === "approved"
        && ["licensed", "permitted-excerpt", "teacher-created"].includes(record.disposition);
      check(`rights-policy:${record.rightsId}:${requestedUse}`, decision.eligible === shouldBeEligible, decision);
    }
  }
}

const review = {
  author: "gate-a-fixture-author",
  independentReviewer: "gate-a-fixture-reviewer",
  reviewedRevision: "fixture-r1",
  decision: "approved",
  reviewedAt: "2026-10-03T00:00:00.000Z",
};
const positiveRights = {
  rightsId: "rights:fixture-teacher-created",
  disposition: "teacher-created",
  reviewStatus: "approved",
  allowedUses: ["learner-display", "learner-adaptation"],
  attribution: { creditLine: "AlgoCore teacher-created fixture" },
  owner: "AlgoCore",
  reviewedAt: "2026-10-03T00:00:00.000Z",
  evidenceRef: "fixture:rights-positive",
};
const positiveSource = {
  sourceId: "source:fixture-authored",
  kind: "algocore_authored",
  authority: "AlgoCore",
  title: "Gate A authored fixture",
  locator: { type: "authored", artifactId: "fixture-authored", revision: "r1" },
  publicLabel: "AlgoCore teacher-created fixture",
  rightsId: positiveRights.rightsId,
  contentFingerprint: "a".repeat(64),
  review,
};
check("positive-source-fixture", validateSourceRecord(positiveSource).ok);
check("positive-rights-fixture", validateRightsRecord(positiveRights).ok);
check("positive-learner-eligibility", evaluateLearnerEligibility(positiveRights, {
  requestedUse: "learner-display",
  embedsSourceContent: true,
}).eligible);

const rejectedCases = [
  ["missing", null, "RIGHTS_MISSING"],
  ["pending", { ...positiveRights, reviewStatus: "pending" }, "RIGHTS_PENDING"],
  ["rejected", { ...positiveRights, reviewStatus: "rejected" }, "RIGHTS_REJECTED"],
  ["revoked", { ...positiveRights, reviewStatus: "revoked" }, "RIGHTS_REVOKED"],
  ["blocked", { ...positiveRights, disposition: "blocked" }, "RIGHTS_DISPOSITION_BLOCKED"],
  ["internal-reference-only", { ...positiveRights, disposition: "internal-reference-only" }, "RIGHTS_DISPOSITION_BLOCKED"],
  ["use-not-allowed", { ...positiveRights, allowedUses: ["internal-analysis"] }, "RIGHTS_USE_NOT_ALLOWED"],
  ["incomplete-attribution", { ...positiveRights, attribution: { creditLine: "" } }, "RIGHTS_INVALID"],
];
for (const [id, fixture, code] of rejectedCases) {
  const decision = evaluateLearnerEligibility(fixture, { requestedUse: "learner-display", embedsSourceContent: true });
  check(`negative-rights-fail-closed:${id}`, decision.eligible === false && decision.code === code, decision);
}

const linkRights = {
  ...positiveRights,
  rightsId: "rights:fixture-link",
  disposition: "external-link",
  allowedUses: ["external-link"],
  attribution: { creditLine: "Official source", publicUrl: "https://example.invalid/source" },
};
check("positive-external-link-only", evaluateLearnerEligibility(linkRights, {
  requestedUse: "external-link",
  embedsSourceContent: false,
}).eligible);
const embeddedLink = evaluateLearnerEligibility(linkRights, {
  requestedUse: "external-link",
  embedsSourceContent: true,
});
check("negative-external-link-embed", !embeddedLink.eligible && embeddedLink.code === "RIGHTS_EXTERNAL_LINK_EMBED_FORBIDDEN", embeddedLink);

const malformedOfficial = {
  ...positiveSource,
  sourceId: "source:fixture-bad-qp",
  kind: "question_paper",
  locator: { type: "document", documentId: "wrong", pageStart: 1, pageEnd: 1 },
};
check("negative-official-locator", !validateSourceRecord(malformedOfficial).ok);
check("negative-private-source-field", !validateSourceRecord({ ...positiveSource, localPath: "C:\\private\\paper.pdf" }).ok);

const output = {
  schemaVersion: "paper2-source-rights-check-v1",
  decision: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  total: checks.length,
  sourceRecords: sources.length,
  rightsRecords: rights.length,
  positiveFixtures: 5,
  negativeFixtures: rejectedCases.length + 3,
  failures,
};
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
