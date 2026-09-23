# Stage 9 A8 clean-room final QA

**Decision: REWORK_REQUIRED.** Registry, routes, sources, build, runtime, responsive behavior and browser console are clean. Stage 9 cannot pass because A7 still has five required pedagogy findings open and the expanded 26-lesson pedagogy verifier currently exits with 51 lesson-level findings.

## Technical results

| Check | Result | Evidence |
|---|---|---|
| Exact set | PASS | 13 packages, 26 lessons/slugs, 58 patterns, 260 blocks; canonical order on every lesson |
| Sources | PASS | 127/127 unique locators resolve; five resolver fixtures pass; no local filesystem href across 52 rendered routes |
| Route matrix | PASS | 26 lessons × VI/EN = 52/52 HTTP 200; invalid slug returns 404 |
| Typecheck/build | PASS | `npm run typecheck` and `npm run build` exit 0 on the current renderer |
| Thirteen-package browser matrix | PASS | One representative lesson from every package has ten blocks; 12 dynamic runtimes and one zero-pattern static fallback render correctly |
| Scenario switching | PASS | `QUEUE_DEQUEUE` accepted normal, boundary and failure; runtime scenario and input revision changed deterministically |
| UX/accessibility | PASS | A6 recheck is PASS with zero required findings. A8 reran 320 px: no page overflow and the runtime stayed within the viewport |
| Console | PASS | Zero warnings and zero errors after the browser matrix and scenario interactions |
| Locked inputs | PASS | All six Stage 0/6/8 input hashes remain unchanged |

## Blocking gate

A7's final recheck remains `REWORK_REQUIRED` with five required findings. The thirteen affected lessons are `data-models`, `procedural-design`, `validation-rules`, `testing`, `text-processing`, `search-collections`, `sorting`, `binary-search`, `stack`, `random-files`, `exceptions`, `performance`, and `graphs`.

The current full-scope verifier now deep-checks all 26 lessons, which closes the coverage defect in implementation, but it correctly exits 1 with 51 lesson-level findings until those thirteen lessons are rebuilt. The renderer also now shows localized VI structured labels, including `Thẩm quyền nguồn`; A7 must still independently close that prior finding.

Release acceptance requires all of the following:

- A7 recheck decision `PASS` with `required_open_findings: 0` against the rebuilt registry and current renderer.
- `npm run verify:stage9` exit 0 with full pedagogy scope 26/26.
- A8 rerun against the new registry hash, confirming the existing route, source, browser, responsive and console passes remain intact.

Machine-readable evidence and input hashes are in `A8_FINAL_QA.json`. The reproducible exact-set/source/route/input-lock checks are in `a8-clean-room-harness.mjs`.
