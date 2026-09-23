# Independent A3 review — B21-v2

Decision: **CHANGES_REQUIRED**.

The seven frozen review inputs, all nine author outputs, and all 27 pins in the nested author input manifest rehash exactly. The A0 C2 validator passes: 174 atomic units, 79 containers, 208 marking rows (174 scoring plus 34 parent-context rows), 68 unresolved context-only records, 450 marks, and six papers at 75 marks. Requirement and pattern references resolve, and no unresolved record is promoted.

The semantic gate does not pass. Review of all 174 mappings against their exact QP prompt, official MS row, retained context, accepted requirement wording and targeted rendered pages found one Critical and three Major defects:

1. Two duplicate OS-management targets (`9618_s21_qp_11-q2-pb`, `9618_s21_qp_13-q2-pb`) hide official legacy answer routes under `IN_SCOPE/HIGH`. The 2021 MS accepts error checking/recovery, provision of a platform, and provision of a user interface; these are outside the five management tasks controlled by the 2026 foundation.
2. Requirement trace is overclaimed for three targets. The two utility matching questions assess disk formatting, defragmentation, backup and disk repair, but claim virus checking and compression as well. The addressing-mode question claims direct addressing although direct is supplied context and the response must be indirect, relative or indexed.
3. Context trace is incomplete throughout the packet. All 74 nested atomic rows omit their immediate parent-part ID. Six table/layout-dependent rows additionally declare a layout dependency but provide no visual/table reference.
4. Twelve source observations use the wrong command word, including `ADD` instead of `Complete`, `write` instead of `Describe` or `Identify`, and `trace` instead of `Write` or `Identify`. The affected provisional pattern command summaries inherit those false observations.

Rendered QP pages inspected directly include S21/11 pages 5 and 16; transcript and official MS evidence were checked at the frozen locators for all affected rows. Full IDs and repair criteria are frozen in `FINDINGS.jsonl`.

This review does not repair the A4 packet, perform the separate marking/pattern review, accept B21, or open downstream aggregation. A corrected author version requires a fresh independent A3 retest.
