# B22 extraction QA — v4 correction candidate

- Base: immutable `B22-A2-v3` snapshot. All twelve original QP/MS PDFs remain read-only and are checked against Stage 0.
- Seven displayed marks were corrected to the printed brackets on the source pages. The exact old/new values, record IDs, source hashes and direct render hashes are in `CORRECTION_EVIDENCE.json`.
- Twelve nested-child QP locators and their transcript references now identify the page containing the child prompt. Exact labels, previous/new one-based PDF pages and render hashes are in `CORRECTION_EVIDENCE.json`. The prior `printed_page_or_null` values were preserved as null; no separate alternate pagination value was present in the source records.
- The six cover pages visibly state 75 marks. The separate `MARK_TOTAL_CHECK.json` sums displayed QP question/part rows and reports 75 for each. Totals are integrity checks only and were not used to assign any of the seven marks.
- All v3 hierarchy, question-level target, MS link, unresolved and source visual evidence is retained. QP visual-region relations were moved to the corrected child prompt pages where such regions already exist; no new visual region was invented for the text-only W22/11 Q1(d)(ii) prompt.
- The 32 unresolved parent-container records are unchanged. No marking-point wording or allocation is inferred.
- The candidate awaits independent same-version A3/A4/A9 retest and A0 gate decision.
