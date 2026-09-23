# B21 v4 correction disposition

Artifact state: `AUTHOR_CORRECTION_COMPLETE_PENDING_INDEPENDENT_A3_AND_A4_RETESTS`.

## Corrected in this candidate

- `B21-A3-004`: corrected only the nested direct-command QP page and transcript pointers for `9618_s21_qp_11-q3-pb` and `9618_s21_qp_13-q3-pb` from page 7 to page 9, and for `9618_w21_qp_11-q6-pb` and `9618_w21_qp_13-q6-pb` from page 12 to page 13.
- The two linked provisional patterns keep their v3 membership and `Complete` command sets; their affected occurrence records now resolve to the exact command-bearing provenance.

## Preserved closure and PASS boundary

- The A3-v3 retest closures for `B21-A3-001`, `B21-A3-002`, and `B21-A3-003` are preserved without semantic change.
- Every marking, response-product, cognitive-action, pattern and variant field covered by the independent A4-v3 PASS is preserved.
- Top-level item QP locators remain the accepted source/item locators. Only `classification_evidence.command_word_provenance` changed for the four cited rows.

## Tight-delta boundary

- Exactly four atomic rows changed from v3, each in only the nested command-provenance page and transcript pointer.
- `CONTAINER_MAP.jsonl`, `MARKING_EVIDENCE_MAP.jsonl`, `UNRESOLVED_DISPOSITION.jsonl`, `PATTERN_CANDIDATES.jsonl`, and `VARIANT_CANDIDATES.jsonl` remain byte-identical to v3.
- Counts remain exactly 174 atomic units, 79 containers, 208 marking rows (174 scoring and 34 parent-context), 68 unresolved context-only rows, 450 marks, and six papers at 75 marks.

## Retest boundary

Fresh independent A3 closure retest and independent A4 protected-field/provenance retest are required. This correction owner does not review, accept, aggregate, or open downstream work.
