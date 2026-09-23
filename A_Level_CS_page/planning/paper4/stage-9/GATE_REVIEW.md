# Stage 9 gate review

> **SUPERSEDED 22/09/2026:** Post-release audit reopened this gate as `REWORK_REQUIRED`. The historical decision below must not be used as the current release status. See [post-release Lead review](evidence/post-release-audit/LEAD_REVIEW.md) and [STATUS.json](STATUS.json).

**Decision: PASS — RELEASE_LOCKED**

Stage 9 consumed the locked Stage 6 learning experience and Stage 8 visual runtime releases and produced a runnable bilingual Paper 4 course in Fumadocs. The release contains 13 packages, 26 lessons, 58 exact visual-pattern joins and 260 canonical learning blocks.

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| S9-0 input lock | PASS | `S9_INPUT_LOCK.json`; 6/6 hashes unchanged |
| S9-R content remediation | PASS_AFTER_R3.2 | `evidence/s9-r2`, `evidence/s9-r3`, cross-reviews |
| S9-A registry | PASS | `evidence/s9-a/S9A_VERIFICATION.json` |
| S9-B lesson renderer/routes | PASS | `evidence/s9-b/S9B_FINAL_SELF_VALIDATION.json` |
| S9-C hub/navigation | PASS | `evidence/s9-c` and browser smoke evidence |
| S9-D pedagogy/UX/source | PASS_AFTER_REWORK | `evidence/s9-d/ux/UX_RECHECK.json`, `PEDAGOGY_R32_LEAD_CLOSURE.json` |
| S9-E clean-room QA | PASS_AFTER_REWORK | Independent A8 baseline plus `evidence/s9-e/A8_R32_LEAD_RERUN.json` |
| S9-F release lock | PASS | `RELEASE_MANIFEST.json`, `RELEASE_VERIFICATION.json` |

## Lead double-check

Lead reran `npm run verify:stage9`: deterministic registry, full-scope pedagogy, TypeScript and production build all passed. The clean-room harness passed 13/26/58/260 exact sets, 138/138 unique source locators, 52/52 VI/EN routes, invalid-slug 404, zero local href leaks and 6/6 unchanged input hashes. Browser checks confirmed localized structured labels, collapsible hints/answers/feedback, the Testing static Normal/Boundary/Failure table, 320 px reflow, dark/reduced-motion support, locale-state preservation and a clean console.

A7 independently found the final missing retrieval contract immediately before delegated-agent quota was exhausted. R3.2 corrected exactly those five lessons. The final closure is recorded transparently as a Lead deterministic/rendered recheck rather than mislabelled as a second independent A7 run.

Required findings open: **0**. The Stage 9 release boundary is the local course integration; accounts, automated grading, learner persistence, search and public deployment remain downstream work.
