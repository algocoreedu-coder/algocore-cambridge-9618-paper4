# A8 Independent Final QA — S6-F

- Wave: `S6-F`
- Input release: `paper4-2026-s5-v1`
- Reviewer: `A8_INDEPENDENT_QA`
- Decision: **REWORK_REQUIRED**

## Verified PASS checks

- 390/390 Stage 5 obligations are present exactly once; all candidate hashes match the locked inventory.
- 28/28 Stage 3 assessment requirements are accounted for exactly once.
- 29 support dispositions are explicit and hash-linked.
- 60 VI/EN parity blocks are present with both locales.
- 18 retrieval items provide six modes per executable pattern.
- 21 visual storyboards match the exact Stage 5 trace event IDs and trace hashes.
- Every storyboard contains `Previous`, `Next`, `Play`, `Pause`, `Reset`, and `change_input`, plus replay/reset semantics and a static fallback.
- Official mark atoms are join-only; no synthetic mark values were introduced.
- Method, marking/error, source-reference and hash joins passed independent checks.

## Required rework

### `S6F-A8-001` — core `random-files` is labelled support-only

Stage 3 declares `ac-9618-p4-2026-python.lesson.random-files` as `scope.role=core` in the `files` package. The S6-F skeleton, bilingual parity, and dispositions currently set `support_only=true` and treat its four assessment requirements and three conceptual blocks as support-only. This is a role-classification error.

Correct the classifier so only Stage 3 lessons with `scope.role=support` are support-only. Keep `random-files` as core conceptual/non-executable content, with an explicit non-code/core disposition if it has no Stage 5 executable pattern, or add a source-backed pattern join only if Lead confirms one. Do not fabricate a Stage 5 pattern. Regenerate all affected S6-F artifacts and rerun A8.

### `S6F-A8-002` — core `exceptions` has the same defect

Stage 3 declares `ac-9618-p4-2026-python.lesson.exceptions` as `scope.role=core`, but S6-F classifies it as support-only using the same no-pattern rule. Apply the same role-aware correction; preserve exact requirement accounting without inventing coverage.

## Gate decision

Stage 6 S6-F release is blocked until both findings are corrected and independently rechecked. No upstream files were edited by A8.
