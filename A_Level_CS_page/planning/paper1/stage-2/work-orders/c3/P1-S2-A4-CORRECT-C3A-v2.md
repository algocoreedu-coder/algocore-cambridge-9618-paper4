# P1-S2-A4-CORRECT-C3A-v2 — Correct provisional pattern partition

Issued by A0 after `C3A_GATE_DECISION_V1.json` returned `CHANGES_REQUIRED`. The exact 93-file input manifest SHA256 is `098af507aaa09bec83bf8bc28480f37db548a0387dfde596438fdb046e423502`. The controlling decision SHA256 is `23618f88fdbe77f93379a0bdaaa4c0d8df819a79532247296e1b0438a0385651`.

## Owner and write allowlist

Owner: the same A4 C3a author who produced `aggregate-v1`. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a4/aggregate-v2/`

Do not modify `aggregate-v1`, A3 review evidence, accepted C2 packets, trackers, Stage 0/1, app, lessons or translations.

## Inputs/version and findings to close

Rehash every entry in the adjacent input manifest before work; any drift is Critical. Treat `aggregate-v1` as superseded for correction history, not as accepted input for downstream work.

Close both findings:

- `C3A-A3-MAJ-001`: ten patterns combine 40 occurrences with different accepted requirement sets.
- `C3A-A3-MAJ-002`: six exact merge keys are split across two patterns; the published 498 partition cannot be regenerated and the reviewer reconstructs 504 keys.

## Exact correction contract

Rebuild the partition from the accepted occurrence/source-candidate rows. For a nonempty requirement set, the merge key is exactly:

`(sorted unique accepted primary_requirement_ids, response_product, cognitive_action)`

For an empty requirement set, keep occurrences separate by exact accepted source-pattern identity in addition to response product and cognitive action, as already declared by `empty_requirement_rule`. No semantic override, subset/superset collapse or topic-only merge is permitted in this correction.

Sort the complete canonical keys lexicographically by their UTF-8 JSON representation and assign new IDs `PAT-C3A2-0001` through `PAT-C3A2-0504`. Rebuild every dependent pattern reference. The result must contain exactly 504 patterns and 893 occurrences, with a one-to-one mapping between canonical merge keys and provisional patterns.

Preserve every accepted source value outside the pattern partition: source identity/lineage, QP/MS locators, marks, scope, requirements, context and visual dependencies, response product, cognitive action, marking evidence/conditions/alternatives, container eligibility and unresolved dispositions. All 34 B21 parent-context marking rows and all 128 unresolved rows remain non-scoring and absent from occurrences.

Rebuild catalog names, definitions, features, exclusions, examples, boundaries, raw occurrence counts, distinct-paper counts, occurrence evidence, QBI provisional-pattern references, QA, manifests and handoff. Definitions must state the exact full requirement key actually shared by their occurrences. Keep every pattern `PROVISIONAL_PRE_EQUIVALENCE` / `NEEDS_REVIEW`, with equivalence state `PENDING` and equivalence-group count null. Carry the B25 `VC-B25-0021`/`VC-B25-0041` note.

## Exactly nine outputs

1. `QUESTION_BANK_INDEX.jsonl`
2. `PATTERN_CATALOG_PROVISIONAL.json`
3. `PATTERN_EVIDENCE.jsonl`
4. `MARKING_EVIDENCE_CATALOG.jsonl`
5. `GAP_CONFLICT_REPORT.md`
6. `QA.json`
7. `INPUT_MANIFEST.json` — exact copy of the issued v2 correction manifest
8. `OUTPUT_MANIFEST.json`
9. `HANDOFF.json`

## Acceptance

- Exact union remains 893 atomic, 379 containers, 128 unresolved, 927 marking rows (893 scoring + 34 context), 2,250 marks and 30 papers at 75.
- All accepted aggregate `source_record` values remain equal to the pinned C2 rows.
- Exactly 893 occurrences map bijectively to atomic units and exactly 504 patterns map bijectively to reconstructed canonical keys.
- No two patterns have the same key and no pattern contains more than one key.
- Every catalog raw count and distinct-paper count reproduces from evidence; all examples/boundaries and reverse refs resolve.
- The ten heterogeneous v1 patterns and six duplicate-key partitions are explicitly covered in `QA.json` correction checks.
- Output/input manifest and handoff closure pass, with no extra file in the output folder.
- No equivalence, final `ESTABLISHED`/`SINGLETON`, forecast, split/holdout, glossary reconciliation, traceability, lesson, translation, app or Stage 3 claim.

## Reviewer and stop condition

A fresh independent A3 reviewer must retest exact `aggregate-v2` hashes, reconstruct all 504 keys and rerun the full v1 review population/source checks. A0 alone audits and decides C3a. Freeze the nine-file handoff and stop; do not open C3b or any later round.
