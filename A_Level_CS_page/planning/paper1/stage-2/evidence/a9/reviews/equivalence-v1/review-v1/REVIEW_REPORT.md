# C3b equivalence-v1 — independent A9 review

## Decision

**CHANGES_REQUIRED**

The exact 193-file issued packet rehashed with 0 drift. A9 independently rebuilt all 398,278 unordered pairs from 893 eligible assessment units and reproduced 36,416 candidates, 361,862 complement pairs, all eight channel counts and projection SHA256 `f1b3867f9a4335d296b205edbaafa09d063bb855a3ad97eb7990f871a4bd25cf`.

## Evidence reviewed

- Parsed and checked all 36,416 candidate rows and 36,416 relation rows.
- Source-reviewed all 66 positive/unresolved relations against both cited official QP and MS PDF pages: 66 positive, 0 unresolved.
- Rebuilt 827 positive and split-guard components covering all 893 units. No negative/unresolved edge contradicts a positive component; no mark or marking-behaviour incompatibility was found.
- Reproduced and source-reviewed all 586 deterministic complement samples using seed `P1-S2-C3B-COMPLEMENT-v1`. Observed false negatives: 0.
- Selected and source-reviewed 199 deduplicated negative candidates using seed `P1-S2-C3B-A9-NEG-v1`, with at least 25 rows from every generation channel and each represented risk stratum. Review errors: 1. Because the sample exposed a rejected positive proposal, A9 expanded review to all 36350 negative rows in the affected channel/risk populations and identified 6 rows satisfying the artifact's own positive criteria.
- Reproduced the sixteen author QA controls and twelve A0 controls; the machine record also includes the additional negative-source-sample control.

## Findings

Open Critical: 0. Open Major: 1. Open Minor: 0.

Major `A9-C3B-003`: the generator applies a global one-to-one `matched` restriction after producing positive proposals. Direct QP/MS review confirmed six suppressed `PARALLEL_EQUIVALENT` edges. Two connect the 2021 assembly-operation table item in components 11, 12 and 13 into one three-member group; four connect the `(b)(i)` and `(b)(ii)` 2022 bitwise-operation items across components 11, 12 and 13 into two three-member groups. The frozen artifact instead leaves the component-12 or component-13 member isolated. A4 must remove the one-to-one restriction, resolve positive edges as graph components, regenerate a new version, and submit it to fresh independent A9 retest.

No repair, acceptance, tracker update, split/holdout choice or downstream work was performed. A0 owns the C3b gate decision.
