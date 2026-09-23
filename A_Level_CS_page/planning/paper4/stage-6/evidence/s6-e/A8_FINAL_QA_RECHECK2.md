# S6-E A8 Final QA Recheck 2

Decision: **PASS_RECOMMENDED**

Independent fresh-process recheck using the corrected source-backed marking rule.

## Source-backed rule

A marking join is source-backed when either (1) its IDs are direct refs contained in the pattern’s Stage 4 `PATTERN_CARDS.marking_point_refs`, or (2) the step contains `marking_atom_inheritance` with `mode: pattern_level`, the exact pattern-card source locator, a rationale, and IDs equal to that pattern-level source list.

## Scope and results

| Check | Result | Evidence |
|---|---|---|
| Stage 5 obligation joins | PASS | 1,180 IDs exact-once; hashes equal source rows |
| Stage 3 requirement joins | PASS | 17 IDs; hashes equal exact `requirement_id` source rows |
| Method schema | PASS | 58 method steps; required fields present |
| Method marking provenance | PASS | 58/58 source-backed; 45 direct, 13 documented inheritance |
| Inheritance metadata | PASS | 13 inherited steps match pattern-level refs |
| Retrieval practice | PASS | 72 items; six modes per pattern |
| Visual event storyboards | PASS | 53 storyboards; 72 exact Stage 5 events; controls/fallback present |
| Bilingual parity | PASS | 60 VI/EN blocks; state, pattern and source parity |
| Marking authority | PASS | Official source joins only; no synthetic marks |
| Stage 5 upstream lock | PASS | paper4-2026-s5-v1 RELEASE_LOCKED; verifier PASS |

## Finding closure

- **A8-S6D-001: CLOSED_VERIFIED.** Requirement hashes use exact Stage 3 rows selected by `requirement_id`.
- **A8-S6E-ADVISORY-001: CLOSED_VERIFIED.** All 58 method steps now have source-backed marking IDs. The 13 inherited steps explicitly document pattern-level provenance and match Stage 4 refs.
- No required open findings remain.

## Independence controls

- Author excluded from review.
- Fresh process used.
- Stage 0, Stage 3 and Stage 5 files were not written.
- Stage 6 STATUS was not written.

## Next gate

Lead may accept S6-E. Final Stage 6 close still requires hash freeze, Lead pass 2, gate review, release manifest, detached verifier and Stage 7 handoff.
