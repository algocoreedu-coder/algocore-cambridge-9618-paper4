import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.resolve(root, "../planning/paper4/exam-readiness-coverage-2026-10-02/evidence/e3-ui");
const read = (relative) => readFile(path.join(root, relative), "utf8");
const checks = [];
const check = (id, pass, detail = null) => checks.push({ id, pass: Boolean(pass), detail });

const [manifestText, hubPage, attemptPage, attemptComponent, solutionModule, submitRoute, layout, css] = await Promise.all([
  read("content/paper4/mocks/manifest.json"),
  read("app/paper-4/rehearsals/page.tsx"),
  read("app/paper-4/rehearsals/[paperId]/page.tsx"),
  read("app/components/paper4-rehearsal/RehearsalAttempt.tsx"),
  read("app/lib/paper4/rehearsal-solutions.ts"),
  read("app/api/paper4/rehearsals/[paperId]/submit/route.ts"),
  read("app/paper-4/Paper4DocsLayout.tsx"),
  read("app/components/paper4-rehearsal/Rehearsal.module.css"),
]);
const manifest = JSON.parse(manifestText);

check("PACK-five-papers", manifest.papers.length === 5, manifest.papers.map(({ paper_id, kind }) => ({ paper_id, kind })));
check("PACK-levels", ["diagnostic", "half", "full"].every((kind) => manifest.papers.some((paper) => paper.kind === kind)));
check("AUTHORITY-honest", manifest.authority === "AlgoCore_authored" && manifest.official_cambridge_material === false && /not an official Cambridge/i.test(manifest.claim.en));
check("ROUTE-hub-and-attempt", /RehearsalHub/.test(hubPage) && /RehearsalAttempt/.test(attemptPage) && /rehearsals/.test(layout));
check("ATTEMPT-persistence", /localStorage/.test(attemptComponent) && /storageKey/.test(attemptComponent) && /Resume|Tiếp tục/.test(await read("app/components/paper4-rehearsal/RehearsalHub.tsx")));
check("ATTEMPT-timer", /role="timer"/.test(attemptComponent) && /deadline/.test(attemptComponent) && /timedOut/.test(attemptComponent));
check("ATTEMPT-no-hints", /Timed mode: no hints or solutions/.test(attemptComponent) && !/reveal hint|show hint/i.test(attemptComponent));
check("ATTEMPT-answer-notes-evidence", /Answer \/ code \/ trace/.test(attemptComponent) && /Review notes/.test(attemptComponent) && /Evidence I produced/.test(attemptComponent));
check("ATTEMPT-submit-confirm", /Confirm submission/.test(attemptComponent) && /confirmingSubmit/.test(attemptComponent));
check("ATTEMPT-reset-confirm", /Erase and restart/.test(attemptComponent) && /confirmingReset/.test(attemptComponent));
check("SOLUTION-not-in-page-bundle", !/solution\.json|rehearsal-solutions/.test(attemptPage) && !/solution\.json/.test(attemptComponent));
check("SOLUTION-server-separated", /solution\.json/.test(solutionModule) && /verifyStudentSessionToken/.test(submitRoute) && /isSameOriginPost/.test(submitRoute) && /reveal_after_submit/.test(submitRoute));
check("SOLUTION-no-store", /private, no-store/.test(submitRoute));
check("LOCALE-en-vi", /lang=/.test(hubPage) && /lang=/.test(attemptPage) && /Tiếng Việt/.test(hubPage) && /English/.test(hubPage));
check("A11Y-keyboard-focus", /focus-visible/.test(css) && /--alg-touch-target/.test(css) && /aria-live/.test(attemptComponent));
check("A11Y-responsive-motion", /@container/.test(css) && /max-width: 640px/.test(css) && /prefers-reduced-motion/.test(css));
check("RELEASE-no-paper-ready-change", !/paperReady|paper_ready|ER3/.test([hubPage, attemptPage, attemptComponent, submitRoute].join("\n")));

for (const entry of manifest.papers) {
  const paperPath = path.join("content/paper4/mocks", entry.paper);
  const solutionPath = path.join("content/paper4/mocks", entry.solution);
  const [paper, solution] = await Promise.all([read(paperPath).then(JSON.parse), read(solutionPath).then(JSON.parse)]);
  check(`CONTENT:${entry.paper_id}`, paper.paper_id === entry.paper_id && paper.authority === "AlgoCore_authored" && solution.paper_id === entry.paper_id && solution.authority === "AlgoCore_authored_rubric" && solution.official_marks === null && paper.questions.length === solution.answers.length);
}

const result = { checkedAt: new Date().toISOString(), status: checks.every((item) => item.pass) ? "PASS" : "FAIL", checks };
await mkdir(evidenceDir, { recursive: true });
await writeFile(path.join(evidenceDir, "STATIC_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, passed: checks.filter((item) => item.pass).length, total: checks.length }, null, 2));
if (result.status !== "PASS") {
  console.error(checks.filter((item) => !item.pass));
  process.exitCode = 1;
}
