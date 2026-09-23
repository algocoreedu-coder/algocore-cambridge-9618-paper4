# P1-S2-A9-RETEST-EQV-v2 — Fresh independent C3b retest

Issued by A0 after the `equivalence-v2` correction handoff. Exact input manifest: `P1-S2-A9-RETEST-EQV-v2_INPUT_MANIFEST.json`, 217 files, SHA256 `a31476caa31da0a99a0d9ec30f572acf6fd69cf9adb8f6ce1b427f1583d79aa3`. Author handoff SHA256 `0b551382d2b567f4914faca6adbbdf9bba6abbe84c238d4b34e70b1004065cad`; output manifest SHA256 `32a0d8ed6218aaad956234536651825838d52f00b5c91087540b2d7ffb5ff688`; A0 pre-retest audit SHA256 `465a5fc55df283edf648882e23da324b94b7d2ed5b82795e6dd8936d523b5dfe`.

## Owner, independence and write allowlist

Owner: a fresh A9 reviewer who did not author `equivalence-v1`, `equivalence-v2`, aggregate-v2 or A0 validation. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a9/reviews/equivalence-v2/retest-v1/`

Do not modify author packets, A0 evidence, accepted C2/C3a packets, trackers, Stage 0/1, app, lessons or translations. A0 alone accepts C3b.

## Inputs/version

Rehash all 217 entries before review. Any missing file, byte mismatch or SHA256 mismatch is Critical and stops the review. Treat `equivalence-v2` as the only candidate under review; use v1 and review-v1 only for delta/finding closure evidence.

## Required independent retest

1. Re-run candidate generation independently and compare the full candidate projection, all eight channels, overlaps and complete 398,278 pair accounting.
2. Parse all 36,416 candidates and relation rows. Check canonical pair identity, no duplicate/reversed/dangling pair, one complete reviewed relation per candidate, and explicit quarantine for any unresolved relation.
3. Source-review every positive and unresolved relation using both QP and MS evidence and all five dimensions. Expected author claim is 72 positives and zero unresolved; verify rather than assume.
4. Rebuild connected components from all positive edges. Verify 893 nodes appear exactly once, every positive edge remains inside a component, no negative edge lies inside one without an explicit contradiction, and split guards equal positive/unresolved components.
5. Compare v1/v2 relation registers independently. Confirm whether exactly the six `A9-C3B-003` rows changed from `RELATED_NOT_EQUIVALENT` to `PARALLEL_EQUIVALENT` and whether all other relations are stable.
6. Recheck all six positive regression pairs and four source-confirmed negative guards from the correction work order against source evidence. Removing the one-to-one rule must not promote validation-versus-verification pairs.
7. Reproduce the deterministic 586-pair rejected-complement sample and source-review every sample; zero observed false negatives is required. If any false negative appears, expand the affected population and return `CHANGES_REQUIRED`.
8. Verify input/output/handoff closure, generator determinism, contradiction/unresolved report, QA truthfulness, scope boundary and exact twelve author outputs.
9. Do not accept self-report, filenames or A0 PASS as proof. Record exact evidence and your independent implementation/result.

## Exactly eight outputs

1. `RETEST_REPORT.md`
2. `FINDINGS.json`
3. `MACHINE_CHECKS.json`
4. `GENERATOR_RERUN.json`
5. `COMPLEMENT_REVIEW_SAMPLE.jsonl`
6. `INPUT_MANIFEST.json` — exact copy of the issued manifest
7. `OUTPUT_MANIFEST.json`
8. `HANDOFF.json`

## Acceptance and severity

Return `PASS` only when input drift is zero; all required checks complete; all positives/unresolved and all complement samples are source-reviewed; all ten regression controls are correct; graph/components and complete pair accounting reproduce; complement false negatives are zero; and open Critical/Major/Minor findings are zero.

Critical: input/source drift, fabricated locator/evidence, out-of-scope mutation. Major: nondeterminism; missing channel/pair; wrong relation affecting grouping; complement false negative; incomplete positive/source review; contradiction; graph, manifest or closure failure. Minor is presentation metadata only and still prevents this retest from returning PASS unless corrected in a new review version.

## Stop condition

Freeze the exact eight-file handoff and stop. Do not repair author files, update trackers, accept C3b, start C3c, choose split/holdout, reconcile glossary, integrate traceability or perform lesson/app/Stage 3 work.
