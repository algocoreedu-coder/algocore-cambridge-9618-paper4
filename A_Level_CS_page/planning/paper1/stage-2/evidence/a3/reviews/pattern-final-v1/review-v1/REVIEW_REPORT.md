# Independent A3 review — pattern-final-v1

Result: **PASS**

Review role: fresh independent A3 reviewer. This reviewer did not author aggregate-v2, equivalence-v2, or pattern-final-v1. This report does not accept C3c; a fresh A9 review/retest and A0 gate decision remain required.

## Input and packet integrity

- Issued work order SHA256: `fea44a09df2f7ed8f09556169be807c3d8e2d18de0313270db7ff3507df4cf2f`.
- Issued 237-file input manifest SHA256: `403ac53d53dd3bb71c76ee875c6b3dd5fa31264e4cc64a4efa9872fb0f9064a4`.
- All 237 declared inputs were rehashed before review: 237 match, 0 missing, 0 byte drift, 0 hash drift.
- Author handoff SHA256 independently reproduced as `42e0796c2b795980b77abfcfc34ed14bc0dab10560005a6dd57a50806089bf7c`.
- Author output manifest SHA256 independently reproduced as `4a8ab5d8c95157813b14f6f273c58c44cd44e170c2f12d796812c506f7fce03e`.
- The author directory contains exactly the declared nine files. All seven content entries in both the author output manifest and handoff match current bytes and SHA256.

## Independent reconstruction

The review rebuilt the join from accepted aggregate-v2 occurrences and accepted equivalence-v2 groups, without using author-declared final counts as the source of truth.

- Aggregate pattern identities: 504 unique; final pattern identities: the same 504, with no missing, extra, or duplicate ID.
- Aggregate occurrences: 893 unique; final evidence: the same 893, with no missing, extra, or duplicate assessment unit.
- Accepted equivalence groups: 824; member units: 893. Every occurrence belongs to exactly one group; no group crosses a pattern definition.
- Recomputed totals: 893 raw occurrences, 853 distinct-paper counts, and 824 distinct-equivalence-group counts.
- Recomputed statuses for all 504 rows: 127 `ESTABLISHED`, 374 `SINGLETON`, and 3 `NEEDS_REVIEW`.
- All 504 author counts, accepted group lists, status values, status bases, and review-gap presence match the independent reconstruction.
- Independent pattern-count/status digest: `6c4abb74cfa487f32e10903be761298684a2e80add332a36e62c33a25b9d4b68`.

The 893-row count ledger is bijective with final evidence. Ledger IDs are exactly `PCL-0001` through `PCL-0893`; every evidence row resolves back to its ledger row. Raw contribution is one for every occurrence, and each distinct paper and equivalence group contributes exactly once per pattern. Ledger sums reproduce all 504 catalog rows and the corpus totals.

## Identity, evidence, and references

Twenty-one protected semantic/source fields were compared for all 504 patterns, including the canonical key and definition, requirements, response product, cognitive action, examples, boundary IDs, raw/paper counts, source pattern IDs, candidate references, and correction state. Drift count is zero.

All fields inherited from the 893 aggregate-v2 evidence rows are byte-value equal in final evidence. The added pattern, group, component-size, status, phase, lineage, and ledger references reproduce independently. The occurrence assignment digest is `ddf1381ec08a9c9f8ee28a1fb84d9814c5432cad209476c73316e8d1ed8bf3d6`; the occurrence-to-group join digest is `f883cfb706bcdd8cb9f00ebd540cdc353925c145fe0dd8a776ee7aadbaeb6d56`.

All 857 official example references resolve to an occurrence in their own pattern. All 504 boundary references resolve to a different pattern and carry the correct final pattern and equivalence-group reverse reference. All 717 source-candidate references resolve to the pinned line in one of five hash-matched source files, and every referenced record reconstructs the declared batch-qualified source identity. Finalization lineage hashes match accepted aggregate-v2 and equivalence-v2.

The 504-row delta is complete and unique. Every provisional/final snapshot, count change, status change, example flag, boundary flag, and protected-identity declaration matches the two pinned catalogs.

## NEEDS_REVIEW dispositions

All three declared cases were inspected against accepted B23 atomic evidence, the linked QP/MS transcripts, and foundation-v1 syllabus requirements.

- `PAT-C3A2-0502` / `AU-9618_s23_qp_12-q5-pd-pii` / `EQG-0189`: the official task asks for the generic purpose of utility software. The 2026 requirements name six particular utility uses, so accepted evidence carries an empty direct requirement set, `NEEDS_REVIEW`, and `QUARANTINE_SCOPE_BOUNDARY`. The final conflict record is supported.
- `PAT-C3A2-0503` / `AU-9618_s23_qp_11-q4-pb` / `EQG-0161`: the official task assesses reasons for selecting magnetic rather than solid-state storage. The cited 2026 requirements cover the devices' principal operation. They are adjacent supporting context, not direct coverage; the empty direct requirement set and quarantine are supported.
- `PAT-C3A2-0504` / `AU-9618_w23_qp_11-q6-pb` / `EQG-0562`: the official task asks for a reason for partial compilation and interpretation, while the cited 2026 requirement requires awareness that this may occur. The supporting link is retained without direct coverage; the empty direct requirement set and quarantine are supported.

Each case has one accepted equivalence group and a concrete accepted evidence gap. No other pattern has an empty direct requirement set or accepted `NEEDS_REVIEW` scope, so the deterministic status rule is applied consistently.

## QA, B25 note, and scope boundary

The author QA contains 16 PASS checks and its reported counts, dispositions, and declared gaps match the independent results. The frozen B25-v2 `ISSUES.md` typo names `VC-B25-0021`; accepted B25 ledger/QA evidence and the downstream decision correctly use `VC-B25-0041`. This remains documentation-only and does not change source semantics, membership, counts, or status.

Manual review of term hits found only descriptive frozen-corpus labels, quarantine statements, and explicit prohibitions/stop conditions. No predictive frequency claim, lesson claim, split/holdout result, glossary result, trace/coverage completion claim, translation/app change, or Stage 3 output appears in the packet.

## Decision and stop

There are zero open Critical, Major, or Minor findings. `pattern-final-v1` passes this independent A3 review. The six-file review handoff is frozen. A fresh A9 review/retest and A0 acceptance are still mandatory; C4 and later work remain blocked.
