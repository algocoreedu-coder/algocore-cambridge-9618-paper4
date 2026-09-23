# P1-S2-A3-RETEST-C3A-v2 — Fresh independent closure retest

Issued by A0 after `aggregate-v2` author handoff and A0 pre-retest audit PASS 17/17. The exact 106-file input manifest SHA256 is `fb3c0de007ffafbbb920a5a9cbf173661987443ae15a006363d53b08bd74e2df`. Author handoff SHA256 is `c8052aa622ef28e1c53175a51ec98cf8515b95d686afc2f9ebf118e9da3fdc3d`.

## Owner, independence and write allowlist

Owner: a fresh A3 reviewer who did not author C3a and did not perform review-v1. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a3/reviews/aggregate-v2/retest-v1/`

Do not modify either aggregate version, earlier review evidence, A0 evidence, accepted C2 packets, trackers, app or downstream artifacts. Implement checks independently; A0 validators are comparison evidence only.

## Inputs and exact outputs

Rehash all 106 issued files before work. Stop with Critical on drift. Create exactly:

1. `RETEST_REPORT.md`
2. `FINDINGS.json`
3. `INPUT_MANIFEST.json` — exact issued copy
4. `OUTPUT_MANIFEST.json`
5. `HANDOFF.json`

## Required retest

1. Re-run the complete aggregate-v1 review contract against v2: parsing, exact output set, closure, C2 source-value identity, counts, eligibility, marking preservation, occurrence/scoring bijections, reverse references, catalog definitions/features/exclusions/examples/boundaries, all scope-risk populations, all singleton patterns, 34 B21 context rows, sensitive boundaries and the B25 metadata disposition.
2. Independently reconstruct the canonical key for every occurrence from its exact accepted source candidate:
   - nonempty key = sorted unique full accepted primary requirement set + response product + cognitive action;
   - empty key additionally includes exact `batch_id:source_pattern_id` identity.
3. Serialize keys with ordered properties `accepted_primary_requirement_ids`, `response_product`, `cognitive_action`, and optional `accepted_source_pattern_identity`; sort serialized UTF-8 JSON lexicographically. Prove IDs are exactly `PAT-C3A2-0001` through `PAT-C3A2-0504` in that order.
4. Prove exactly 504 keys, 504 patterns and 893 occurrences; zero key split across patterns; zero pattern containing multiple keys; zero missing candidate binding; all QBI and occurrence refs resolve to the same reconstructed pattern.
5. Explicitly retest all ten v1 heterogeneous pattern populations and all six v1 duplicate-key partitions named in `FINDINGS.json`. Confirm both Major findings are closed rather than trusting author QA.
6. Recompute raw occurrence and distinct-paper counts for every pattern and inspect the exact full requirement boundary in every canonical definition.
7. Use deterministic source seed `P1-S2-C3A-A3-v2`, two units per each of 30 papers, plus 100% named examples/boundaries and all risk populations. Record sampled IDs and actual QP/MS results. A sample failure expands to the full affected pattern/merge population.
8. Confirm v1 remains immutable at its pinned hashes and v2 changes only the provisional partition/dependent references plus truthful correction metadata. All accepted source records, locators, marks, scope and marking semantics must remain identical.
9. Reject equivalence, final pattern status, forecast, split/holdout, glossary reconciliation, traceability, lesson, translation, app or Stage 3 claims.

## Severity and acceptance

Critical: input/source drift, fabricated or wrong QP/MS locator/marks, source corruption or scoring promotion. Major: either v1 finding remains, any key/ID/count/ref mismatch, semantic definition mismatch, manifest failure, prohibited downstream claim or incomplete independent review. Minor is presentation-only and cannot change identity/evidence/meaning.

Return `PASS` only with zero open Critical/Major findings and all required checks complete. Otherwise return `CHANGES_REQUIRED` with exact evidence, owner and retest route.

## Reviewer and stop

A0 rehashes this handoff and alone accepts C3a. Freeze the five outputs and stop. Do not repair artifacts, update trackers, dispatch C3b or perform later work.
