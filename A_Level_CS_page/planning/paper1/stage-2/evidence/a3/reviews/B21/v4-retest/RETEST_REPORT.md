# P1-S2-A3-RETEST-B21-v4 — independent final closure retest

Decision: **PASS**. B21-v4 has zero open or new Critical findings and zero open or new Major findings. `B21-A3-001`, `B21-A3-002`, `B21-A3-003`, and `B21-A3-004` are closed by this retest. This is an A3 review result, not A0 acceptance or permission to start downstream work.

## Frozen inputs and candidate integrity

The adjacent issued manifest, work order, and all eight issued inputs rehash exactly. The B21-v4 output manifest pins all nine declared content files, and the handoff pins the output manifest plus all nine content files; all nineteen checks pass.

The v3-to-v4 atomic diff contains exactly four rows and two nested pointer fields per row. The S21 pair changes its command-provenance page from 7 to 9 and transcript from `p7` to `p9`; the W21 pair changes page 12 to 13 and transcript from `p12` to `p13`. No other atomic field changes. `CONTAINER_MAP.jsonl`, `MARKING_EVIDENCE_MAP.jsonl`, `UNRESOLVED_DISPOSITION.jsonl`, `PATTERN_CANDIDATES.jsonl`, and `VARIANT_CANDIDATES.jsonl` are byte-identical to B21-v3.

## Command-provenance closure

`B21-A3-004` is closed. All twelve originally cited command observations match the exact prompt, all twelve carry direct-QP provenance objects whose source, page and transcript agree, and all seven linked pattern command sets equal the command set of their atomic examples.

The four remaining v3 failures now resolve to command-bearing pages:

- `9618_s21_qp_11-q3-pb` points to QP page 9 and `transcripts/9618_s21_qp_11-p9.txt`, which contains “Complete the trace table for the program currently in main memory.”
- `9618_s21_qp_13-q3-pb` points to QP page 9 and `transcripts/9618_s21_qp_13-p9.txt`, with the same exact prompt.
- `9618_w21_qp_11-q6-pb` points to QP page 13 and `transcripts/9618_w21_qp_11-p13.txt`, which contains “Complete the table by writing the new contents of the ACC after the execution of each instruction.”
- `9618_w21_qp_13-q6-pb` points to QP page 13 and `transcripts/9618_w21_qp_13-p13.txt`, with the same exact prompt.

## Preserved A3 closures

`B21-A3-001` remains closed. The two legacy OS rows are `PARTIAL`, retain exactly `REQ-5.1-02-01` through `REQ-5.1-02-05`, and explicitly quarantine error checking/recovery, platform provision, and user-interface provision. Their pattern retains the exact requirements and two occurrences.

`B21-A3-002` remains closed. The two utility rows and linked pattern exclude virus checking and compression. The addressing row and linked pattern assess only indirect, indexed and relative addressing; direct addressing remains supplied prompt context. The frozen marking row preserves the three official alternatives and its one-mark name plus one-mark linked-description condition.

`B21-A3-003` remains closed. All 74 cited rows resolve in the accepted B21-A2-v6 question index and B21-v4 atomic map. Each accepted immediate parent occurs exactly once, all v2 dependencies are retained, and the sole addition is the exact parent. All six cited layout rows carry a resolvable accepted corpus dependency, matching direct QP locator, and existing transcript.

## Counts and validator

The candidate contains exactly 174 atomic units, 79 containers, 208 marking rows comprising 174 scoring and 34 parent-context rows, 68 unresolved context-only dispositions, 94 provisional patterns, and 59 variant suggestions. The 174 pattern occurrences reconcile to the atomic population. Displayed marks total 450, with each of the six papers totaling 75.

The frozen A0 command `python A_Level_CS_page/planning/paper1/stage-2/evidence/a0/c2/validate_c2_batch.py B21 --version v4` exits 0 and reports `PASS`; all structural, set, link, mark, manifest, handoff, unresolved-boundary, requirement-reference, and pattern-reference checks are true.

## Freeze and stop

Exactly five retest outputs are frozen in `evidence/a3/reviews/B21/v4-retest/`. This reviewer did not edit author artifacts, perform repairs, accept or aggregate B21, open downstream review, or start downstream work.
