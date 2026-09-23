# Independent A4 protected-field and provenance stability retest - B21-v4

Review ID: `P1-S2-A4-RETEST-B21-v4`  
Reviewer: independent A4 stability/provenance reviewer, distinct from the B21-v4 correction owner  
Date: 22/09/2026  
Decision: **PASS**

## Decision basis

The four corrected command-provenance pointers are source-true. The two May/June trace targets point to QP page 9, whose accepted transcripts say `Complete the trace table`. The two October/November ACC-table targets point to QP page 13, whose accepted transcripts say `Complete the table`. In every case the transcript reference exists in accepted `B21-A2-v6`, its page header equals the nested provenance page, and it contains the unchanged observed command `Complete`.

The complete v3 A4 PASS set remains stable. The v3-to-v4 semantic diff contains exactly four atomic rows and exactly these two paths in each row:

- `classification_evidence.command_word_provenance.qp_locator.pdf_page_1_based`
- `classification_evidence.command_word_provenance.qp_transcript_ref`

No other atomic field changed. `CONTAINER_MAP.jsonl`, `MARKING_EVIDENCE_MAP.jsonl`, `UNRESOLVED_DISPOSITION.jsonl`, `PATTERN_CANDIDATES.jsonl`, and `VARIANT_CANDIDATES.jsonl` are byte-identical to v3.

## Four direct-command provenance checks

| Target | Observed command | Corrected QP page | Corrected transcript | Result |
|---|---:|---:|---|---|
| `9618_s21_qp_11-q3-pb` | `Complete` | 9 | `transcripts/9618_s21_qp_11-p9.txt` | PASS |
| `9618_s21_qp_13-q3-pb` | `Complete` | 9 | `transcripts/9618_s21_qp_13-p9.txt` | PASS |
| `9618_w21_qp_11-q6-pb` | `Complete` | 13 | `transcripts/9618_w21_qp_11-p13.txt` | PASS |
| `9618_w21_qp_13-q6-pb` | `Complete` | 13 | `transcripts/9618_w21_qp_13-p13.txt` | PASS |

The accepted transcript SHA256 values are respectively `541d41079b034c06b652cd59f1e32ab11dce319709882be08b6d4ddca4707293`, `faf371c53d74622f82888c26403534e2eaa0974da0dba780c31909dd4e7eaa91`, `5708db16af207a3899bf0f99f92c30c6d08d1bf797af5e5021cf6d0ecdf0aac9`, and `f76e74a96840e0f998ab6f70040278e9c73f25a41308535e7624ec798620ea46`.

## Protected v3 A4 PASS set

- All 59 official marking-condition targets are stable because the complete marking map is byte-identical to v3. Their accepted distribution remains 36 `CAPPED_POINTS`, 8 `CAPPED_SUBSETS`, 8 `GROUPED_THRESHOLD`, 2 `ROW_ATOMIC`, and 5 `STRUCTURAL_CRITERIA`, with `OFFICIAL_GROUPED` and `SOURCE_CONDITION_PRESERVED` intact.
- All 19 protected response-product/cognitive-action tuples are unchanged. The full atomic diff proves that no response product, cognitive action, command value, locator, marks, requirement, dependency, scope, pattern link, or other protected semantic field changed.
- All nine A4 command observations and the complete 12-row command correction retain their v3 command values. Only the four nested page/transcript provenance pointers named above changed.
- All 94 provisional pattern rows are byte-identical to v3, preserving membership, counts, tuple summaries, command sets, and the 38 marking-behavior summaries covered by the prior A4 PASS.
- All 59 variant suggestions are byte-identical to v3, including the ten affected relations whose tuple-basis metadata was previously retested.

## Integrity, counts, and validator

The work order, issued manifest, and all eight issued inputs rehash exactly. All nine output-manifest content pins match; the handoff pin for the output manifest and all nine handoff content pins also match. The v4 packet correctly pins the v3 source output manifest and handoff.

The A0 validator returned `PASS` for `B21 --version v4`. Counts remain 174 atomic units, 79 containers, 208 marking rows comprising 174 scoring rows and 34 parent-context rows, 68 unresolved context-only rows, 94 patterns, 59 variants, and 450 displayed marks. Each of the six papers remains at 75 marks.

## Freeze and stop

The decision is `PASS`: the four provenance pointers are source-true, the entire v3 A4 PASS protected set is stable, and there are zero open or new Critical or Major findings. The reviewer made no author-packet edits, acceptance decision, aggregation, repair, or downstream action. These five retest outputs are frozen for return to A0.
