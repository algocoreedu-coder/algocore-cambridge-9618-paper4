# B21-A2-v2 revision notes

Status: `SUBMITTED_FOR_RETEST`. This active packet supersedes the frozen
`versions/B21-A2-v1/` input snapshot. Original PDFs and their Stage 0 hashes
are unchanged.

| Review finding | v2 disposition and evidence | Retest owner |
|---|---|---|
| A3-B21-CTX-01 / addendum finding 2 | Reconciled all six QP printed heading sequences. W21 QP11/13 Q1 now starts at PDF p2 and Q6 at p11. `V2_STRUCTURAL_PROVENANCE_CHECK.json` asserts both corrections. | A4, A9 |
| A3-B21-CTX-02 | Added `CONTEXT_INDEX.jsonl` plus one `contexts/<question-id>.json` per question. Each has the complete start/continuation page span; every QP part references its parent question and context file. | A4, A9 |
| A3-B21-VIS-01 | Added rendered, related regions for S21 QP11/13 pp3,5,10 and W21 QP11/13 p2. Visual total is now 59. | A9 |
| A3-B21-REV-01 / addendum finding 1 | Preserved the v1 reconciled baseline in BATCH_MANIFEST: 51 total, 18 non-empty, 33 empty, 20 target occurrences. The v2 visual total is separately reported; this does not repeat the incorrect F04 aggregate. | A9 |
| A4-B21-F01 | Rebuilt from all visible leading part-label runs over each question span: 203 part records. Roman children use an exact `parent_part_id_or_null`; validator reports resolved parents and no cycles. | A4 |
| A4-B21-F02 | Leaf parts get a displayed mark only if a bracketed mark follows that leaf before another part heading. Other fields remain null rather than inferred. No mark-scheme allocation/condition is manufactured. | A4 |
| A4-B21-F03 | Parent parts that expand to children emit `PARENT_CONTEXT_ONLY` marking records with `UNRESOLVED` status. Leaf entries are `EXACT_PRINTED_LABEL` only where the full printed label occurs on an MS page; remaining leaf records stay unresolved. | A4 |
| A4-B21-F04 / addendum finding 3 | QP visual regions now target the semantically correct question across its full context span. MS item records use page-level visual dependencies when the cited MS page has a visual region. `table_row_ref_or_null` remains null unless a row can be isolated. Coverage remains visible for retest. | A4, A9 |

## Former 21 bare-roman items

All 21 v1 bare-roman records were replaced by child IDs under their visible
alphabetic parent (for example `...-q1-pa-pi`). Each now has a parent reference,
QP locator, full question context reference, and either an exact label-level MS
link or an explicit unresolved/context-only record. They are not retained as
unparented sibling rows.

## Open evidence limits

Two leaf items have no exact MS printed-label hit and remain `UNRESOLVED` in
`QUESTION_INDEX.jsonl`; their QP locators and context remain preserved. Parent
context records are intentionally not presented as leaf marking rows. These are
not a claim that the answer, mark allocation, or condition is known.
