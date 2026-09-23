# B21 A2-v6 revision notes

Status: `SUBMITTED_FOR_INDEPENDENT_V6_RETESTS`. This immutable candidate copies B21-A2-v5 and applies exactly four source-backed Q8 context-reference removals. The earlier v1–v5 snapshots and all primary source PDFs remain unchanged.

| Finding / basis | v6 correction | Evidence and remaining gate |
|---|---|---|
| A9-B21-CTX-01 (v5), confirmed in A0 A9-v5 handoff audit | `9618_s21_qp_12-q8`: retain p14 and remove p15–16; `9618_w21_qp_11-q8`: retain p15 and remove p16; `9618_w21_qp_13-q8`: retain p15 and remove p16. Each corrected context has an empty continuation list. Exactly four references were removed from the corresponding context JSON files and `CONTEXT_INDEX.jsonl`. | `CORRECTION_EVIDENCE.json` pins each original QP PDF and A9 full-size render; `V5_TO_V6_SEMANTIC_DIFF.json` lists the exact changed and byte-identical files. A0 schema/integrity, fresh A3/A4/A9 v6 retests, and A0 batch decision remain pending. |
| Inherited B21-A2-v5 corrections | Preserved the W21/12 Q1 displayed mark of 2 and exact whole-question MS row link from v5. | v5 `CORRECTION_EVIDENCE.json` contents remain embedded unchanged apart from v6 packet metadata. Six QP cover-total integrity checks remain unchanged at 75. |

No marks, MS locators, question hierarchy, Q7 continuation, transcript, render, visual region, unresolved marking row, source file, public app, lesson, or translation changed. This is not batch acceptance.
