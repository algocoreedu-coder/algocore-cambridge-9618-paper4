# P1-S2-A3-REVIEW-C3A-v1 — Independent review of C3a aggregate-v1

Issued by A0 after the A4 C3a author froze `aggregate-v1`. The adjacent input manifest contains 86 exact files and has SHA256 `ca2dce662d859f67228e858d524854a8914195f7bf03af4b8c3100c6238d2e3b`. The author handoff SHA256 is `32370c0b53d63f83d9ef244c9bde188f24e6efddf9da10d55dcc3a86633ca332`.

## Owner, independence and write allowlist

Owner: a fresh A3 reviewer who did not author `aggregate-v1`. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a3/reviews/aggregate-v1/review-v1/`

Do not modify the A4 aggregate, accepted C2 packets, A0 evidence, trackers, Stage 0/1, app, lessons or translations. The A0 validator and pre-review audit are comparison evidence only; implement the review independently.

## Inputs and versions

Rehash all 86 entries in `P1-S2-A3-REVIEW-C3A-v1_INPUT_MANIFEST.json` before review. Stop with a Critical finding on any missing file, extra file in the nine-file author output folder, byte mismatch or SHA mismatch.

Controlling author artifact: `evidence/a4/aggregate-v1/`, exactly nine files. Accepted C2 sources are B21-v4, B22-v4, B23-v4, B24-v4 and B25-v2. Foundation is `foundation-v1`; calibration is `calibration-v2`. C3a remains provisional pre-equivalence.

## Required independent review

1. Parse all JSON and JSONL. Verify manifest/handoff closure and exactly nine author outputs.
2. Rebuild exact accepted sets and source-value identity for every row:
   - 893 unique atomic units;
   - 379 unique non-scoring containers;
   - 927 marking rows = 893 scoring links + 34 B21 parent-context rows;
   - 2,250 displayed marks across 30 papers, each 75;
   - exactly 128 unresolved context-only records.
3. Verify every accepted source row is carried without semantic drift: identity, lineage, QP/MS locator, context and visual dependencies, scope, requirement IDs, response product, cognitive action, usage/scoring eligibility, marking kind, official conditions and explicit alternatives. No container, parent or unresolved row may become scoring or a pattern occurrence.
4. Rebuild occurrence/catalog relations. Each atomic unit must contribute exactly one primary occurrence; there must be 893 occurrences, no dangling or duplicate references, and the raw and distinct-paper counts for every one of the 498 provisional patterns must reproduce from occurrence evidence.
5. Inspect all pattern definitions, features, exclusions, requirement IDs, official examples and counterexample/boundary links against occurrence evidence and the accepted foundation. Every pattern must remain `PROVISIONAL_PRE_EQUIVALENCE` / `NEEDS_REVIEW`, with equivalence state `PENDING` and equivalence-group count null. Reject final `ESTABLISHED`/`SINGLETON`, equivalence, forecast, split/holdout, lesson, translation, app or Stage 3 claims.
6. Source-check all named official examples and boundary/counterexample units. For occurrence sampling, use deterministic seed `P1-S2-C3A-A3-v1`; within each of the 30 papers sort by SHA256 of `seed + "|" + assessment_unit_id` and inspect the first two units. Record all 60 IDs and source results. If a sample error appears, expand to every occurrence of that pattern and every row produced by the same merge rule.
7. Review 100% of scope states `PARTIAL`, `SUPPORTING`, `OUT_OF_SCOPE` and `NEEDS_REVIEW`; all mixed-scope or mixed-requirement patterns; all single-occurrence patterns; all 34 B21 parent-context marking rows; and these sensitive boundaries: fetch-decode-execute/register/bus, bitmap arithmetic/bit depth, checksum limitations, check-digit classification, syllabus 8.3 continuation and B24 IDE partial scope.
8. Confirm `GAP_CONFLICT_REPORT.md` carries the frozen B25 documentation typo `VC-B25-0021` and establishes ledger/QA ID `VC-B25-0041` as the controlling downstream identity.

## Severity and acceptance

- Critical: input drift, fabricated or wrong source/locator/marks, scope corruption, or promotion of a parent/context/unresolved row.
- Major: missing/duplicate/dangling identity; count or set mismatch; unsupported pattern merge/definition; wrong catalog counts; missing evidence/boundary; prohibited final/equivalence/split claim; absent B25 conflict disposition; or incomplete reviewer independence.
- Minor: presentation metadata that changes no identity, meaning, count, locator or gate invariant. Record it; only A0 may defer it.

Return `PASS` only with zero open Critical/Major findings and all required machine and semantic checks complete. Otherwise return `CHANGES_REQUIRED`, with each finding naming severity, exact ID/locator, evidence, owner A4 C3a, required correction and independent retest.

## Exactly five outputs

1. `REVIEW_REPORT.md`
2. `FINDINGS.json`
3. `INPUT_MANIFEST.json` — exact copy of the issued review input manifest
4. `OUTPUT_MANIFEST.json`
5. `HANDOFF.json`

The output manifest pins the report, findings and input manifest. The handoff pins those files and the output manifest without circular hashes.

## Reviewer and stop condition

A0 reviews and rehashes this handoff and alone decides C3a acceptance. Freeze the five outputs and stop. Do not repair author files, accept the gate, update trackers, open C3b, decide equivalence, build final patterns, split/holdout, traceability or lessons.
