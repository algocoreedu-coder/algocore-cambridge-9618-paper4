# Fresh independent A9 review — pattern-final-v1

Result: **PASS**

This review was performed by a fresh A9 reviewer independent of the aggregate, equivalence and final-pattern authors and of the A3 reviewer. It does not accept C3c; A0 still owns the gate decision.

## Input and packet integrity

- The issued work order SHA256 is `3cc9c9587ed30ba3192d3df07efbddac4e75038852ee725cae5b590c2e344d05`.
- The exact 244-file input manifest SHA256 is `c15eb5b3c08b9fb87a6e4b89db65961e426d61b08df222894d5d0ed092523392`.
- All 244 declared files were rehashed: 244 match, zero missing, zero byte drift and zero hash drift.
- Author handoff SHA256 `42e0796c2b795980b77abfcfc34ed14bc0dab10560005a6dd57a50806089bf7c`, A3 handoff SHA256 `6047c7ddb6244556fa473585f12648a92084e7c37f1fb5878bbc2b9edd7ac7a2`, and A0 A3-audit SHA256 `ea80975e3846546cfc634eabbcbcd12b90000f2cd6945e34d6c3b07c06732f47` were reproduced.
- The author directory has exactly nine files and the A3 review directory exactly six. Their declared output entries match current bytes and hashes.

## Independent reconstruction

The join was rebuilt from accepted aggregate-v2 occurrences and accepted equivalence-v2 groups rather than from the author totals.

- The same 504 unique pattern identities and 893 unique occurrence assignments are present. All 893 occurrences map exactly once into 824 accepted components; no component crosses a pattern definition.
- Recomputed totals are 893 raw occurrences, 853 distinct-paper counts and 824 distinct-equivalence-group counts.
- All 504 catalog counts, group lists and statuses reproduce exactly: 127 `ESTABLISHED`, 374 `SINGLETON` and 3 `NEEDS_REVIEW`.
- The 893-row ledger is bijective with the evidence rows. Ledger IDs are `PCL-0001` through `PCL-0893`; paper and group contributions each sum to one per distinct key.
- Twenty-one protected catalog fields have zero drift. All inherited aggregate occurrence fields and occurrence-to-pattern assignments remain unchanged.
- All 857 official-example references, 504 boundary reverse references, 717 source-candidate references, 893 atomic/candidate/marking lineages and 504 delta rows resolve with zero mismatch.

Independent digests and the complete row-level checks are recorded in `MACHINE_CHECKS.json`.

## Source review

All three `NEEDS_REVIEW` cases were reviewed directly against the pinned QP/MS pages and the 2026 requirement boundary.

- `PAT-C3A2-0502` asks for the generic purpose of utility software. The 2026 scope names six specific utility uses, so no direct child requirement can be credited.
- `PAT-C3A2-0503` asks for reasons to choose magnetic storage over solid state. Cost, longevity and capacity are adjacent to the principal-operation requirements, but do not directly assess them.
- `PAT-C3A2-0504` asks for a reason for partial compilation and interpretation. The 2026 requirement requires awareness that it may occur, so the reason claim remains outside direct coverage.

Each has an empty direct requirement set, accepted `NEEDS_REVIEW` scope, one equivalence group, a concrete gap record and quarantine. All three dispositions are supported.

For `ESTABLISHED` and `SINGLETON`, the deterministic sample used seed `A9-PATTERN-FINAL-v1-SOURCE-SAMPLE-v1` and one minimum-hash occurrence per non-empty status × top-level domain × exam year × component-variant stratum. This produced 221 samples: 109 `ESTABLISHED` strata and 112 `SINGLETON` strata, spanning all eight domains, years 2021-2025 and variants 11-13. The review opened all 60 official PDFs and 348 unique QP/MS pages. It used 131 QP-excerpt anchors, 76 topic-boundary anchors and direct page inspection for 14 short or acronym-heavy cases. All 221 source samples passed. Together with the three quarantined cases, source review covered 224 documented cases.

## Scope and decision

No predictive-frequency wording or unsupported split, glossary, trace, lesson, translation, app or Stage 3 completion claim was found. There are zero open Critical, Major or Minor findings. `pattern-final-v1` passes this independent A9 review.

The six-file review handoff is frozen. A0 must rehash and decide C3c. This reviewer did not repair author files, edit trackers, accept the gate or start downstream work.
