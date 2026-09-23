# P1-S2-A9-REVIEW-EQV-v1 — Independent equivalence/complement review

Issued by A0 after the C3b author froze `equivalence-v1` and A0 machine audit passed 12/12. The exact 193-file input manifest SHA256 is `0d437d28732cfcf72c391cadb50560fee28c06f27aaee6b1196ed3adc37eff86`. Author handoff SHA256 is `59babf0add264e8de9e628ecffd407594cc6b43dfcb7b102ae029c71ebf48414`.

## Owner, independence and write allowlist

Owner: a fresh A9 reviewer who did not author C3a, C3b, C2, split or any reviewed artifact. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a9/reviews/equivalence-v1/review-v1/`

Do not edit author outputs, C3a/C2, A0 evidence, trackers or downstream artifacts. Use an independent implementation; author/A0 validators are comparison evidence only.

## Exactly eight outputs

1. `REVIEW_REPORT.md`
2. `FINDINGS.json`
3. `MACHINE_CHECKS.json`
4. `GENERATOR_RERUN.json`
5. `COMPLEMENT_REVIEW_SAMPLE.jsonl`
6. `INPUT_MANIFEST.json` — exact issued copy
7. `OUTPUT_MANIFEST.json`
8. `HANDOFF.json`

The output manifest pins files 1–6. The handoff pins files 1–7 without circular self-hash.

## Required independent review

1. Rehash all 193 inputs and confirm exactly twelve author outputs with manifest/handoff closure. Drift is Critical.
2. Independently parse and machine-check all 36,416 candidate rows and all 36,416 relation rows: canonical IDs/order, eight channel metrics, completion, one relation per pair, exact QP/MS refs, allowed disposition, positive five-dimension rules, quarantine and no parent/context promotion.
3. Rerun `generate_candidate_pairs.py --verify-universe` and independently reproduce 893 eligible nodes, 398,278 total pairs, 36,416 candidate pairs, 361,862 complement pairs, every channel count/overlap and projection SHA256 `f1b3867f9a4335d296b205edbaafa09d063bb855a3ad97eb7990f871a4bd25cf`.
4. Independently rebuild positive connected components and split-guard components. Prove all 893 units occur once, all 66 positive edges and every unresolved edge are covered, no negative/unresolved edge contradicts a positive component, and no marks/marking-condition incompatibility occurs inside a positive group.
5. Source-review 100% of `DUPLICATE`, `PARALLEL_EQUIVALENT` and `UNRESOLVED` relations using both original QP and MS pages. Verify construct/objective, response demand, dependency/stimulus semantics, displayed marks and official marking conditions; record exact IDs and verdicts. There are 66 reported positive relations and zero reported unresolved, but recompute rather than trust those counts.
6. Independently reproduce the author's complement populations, deterministic ranking and all 586 sampled pair IDs using seed `P1-S2-C3B-COMPLEMENT-v1`. Source-review every sample with QP and MS and write every reviewed sample to `COMPLEMENT_REVIEW_SAMPLE.jsonl`. Any missed likely/positive relation is a false negative and forces `CHANGES_REQUIRED` plus a regenerated universe/version.
7. Independently sample negative candidates with seed `P1-S2-C3B-A9-NEG-v1`. For each generation channel and each risk stratum represented, select at least 25 rows by ascending SHA256(`seed + "|" + channel_or_stratum + "|" + pair_id`), deduplicate the union, and source-review QP/MS. Expand to the full affected channel/stratum if an error appears.
8. Reproduce all sixteen author QA controls and the twelve A0 machine controls, including exact pair accounting, all eight channel counts, relation/group consistency, complement audit, stop-boundary and write-boundary checks.

## Severity and acceptance

- Critical: input/source drift; fabricated/wrong QP/MS locator or marks; source identity corruption; scoring/context promotion; unsupported official claim.
- Major: generator mismatch/nondeterminism; missing channel; complement false negative; unreviewed/dangling/duplicate pair; positive relation missing QP+MS or failing an equivalence dimension; wrong negative relation that affects grouping; group contradiction/incomplete coverage; absent quarantine; incomplete independent review.
- Minor: presentation-only metadata that changes no identity, evidence, relation, count, group or downstream isolation; only A0 may defer it.

Return `PASS` only with zero open Critical/Major findings, zero observed complement false negatives and every required check complete. Otherwise return `CHANGES_REQUIRED` with exact evidence, correction owner and fresh retest route.

## Stop condition

Freeze the eight-file handoff and stop. Do not repair author files, accept C3b, update trackers, start C3c, choose split/holdout, reconcile glossary, integrate traceability or perform lesson/app/Stage 3 work. A0 alone audits and decides C3b.
