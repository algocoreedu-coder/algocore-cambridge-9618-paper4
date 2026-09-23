# A4 independent linkage retest — B21 A2-v3

Task: `P1-S1-A4-B21-RETEST-V3`  
Input: frozen active `B21-A2-v3`, schema 1.1  
Result: **PASS for the A4 linkage retest.** The B21 batch is still open; same-version A3 alignment and A9's independent batch review are required before A0 can accept it.

## Evidence and integrity

I independently recomputed all 12 source PDF hashes and opened their page trees. All 12 match both Stage 0 and the A2 manifest, for 154 pages total. The frozen v2 core manifests and indexes match the hashes cited in the earlier A4-v2 handoff (6/6). All 16 output hashes declared by the A2-v3 handoff also match the active files, including its A0 validator result (`PASS`, 12 sources, 154 pages, 253 question-index rows, 207 marking rows and 61 visual regions). Exact hashes are in `RETEST_FINDINGS_V3.json`.

The v1.1 schema target rule passes for all 207 marking rows: each targets exactly one existing part or whole-question record. The 205 part records have unique IDs, no dangling parent references and no hierarchy cycles. All 48 question-start locators point to a page where that numbered question begins. All 173 `EXACT_PRINTED_LABEL` marking records match the complete question/part label on their cited original MS page when the indexed parent path is included. The 34 `PARENT_CONTEXT_ONLY` records remain `UNRESOLVED`, with no mark allocation or table-row reference.

## Retest findings

**A4-B21-F01 — hierarchy and displayed marks: PASS.** The two S21 variants now include Q7(b)(iii) as a child of Q7(b) and Q7(c) under Q7; the false Q8(c) records are gone. I inspected the original QP11 and QP13 p15–16 renders. On each p16, Q7(b)(iii) carries `[1]`, Q7(c) carries `[3]`, and a distinct unlettered Q8 logic-gate table carries `[3]`. The previously verified 167 correctly attributed part marks plus these four repaired Q7 records give 171/171 source-supported displayed part marks. The only two question-level displayed marks are the Q8 `[3]` values.

**A4-B21-F02 — Q8 whole-question mark and MS evidence: PASS.** Q8 has no printed lettered parts, so each variant keeps `[3]` on the question record and links an `EXACT_PRINTED_LABEL` marking item to question 8 on MS p10. Both original MS p10 pages show “1 mark per correct row” and total 3. The records retain the condition as printed, leave `table_row_ref_or_null` null and point to the matching MS p10 visual region. No row allocation was inferred.

**A4-B21-F03 — exact MS links and unresolved parents: PASS.** The 173 exact links consist of the source-identified leaf parts plus two Q8 whole-question items. Each full label is present on its cited original MS page; no prefix-only link remains. All 34 parent-only entries remain explicitly unresolved and unallocated.

**A4-B21-F04 — visual relations and dependencies: PASS for the corrected items.** Each S21 QP p16 region now relates to both its Q7 and Q8 roots; Q7 context covers pp15–16, while Q8 starts on p16. The two Q8 MS p10 regions relate to the corresponding Q8 root, and the Q8 marking items depend on those regions. All 51 existing marking visual-dependency references resolve to the cited source and page; all 61 visual asset paths exist. This closes the prior targeted p16/MS-p10 gaps. A9 still needs to assess visual-risk coverage across the full batch.

**Prior A3 flags — PASS for the reviewed corrections.** The eight previously added QP render assets remain byte-identical to the v2 evidence whose targets A4 checked. They have valid targets and the schema-valid `RENDERED_PENDING_INDEPENDENT_REVIEW` state; no stale `RENDER_REQUIRED_V2` value remains. The prior W21 Q1/Q6 locator correction remains intact, and the full question-start page check passes 48/48.

## Gate and limits

The A4 retest passes against the exact B21-A2-v3 hashes recorded in the findings and handoff files. This report does not approve answers, marking-point correctness, row-by-row scoring, lesson reuse or batch acceptance. A3 must finish its independent retest on the same A2-v3 version, then A9 must review the complete batch. A0 owns the final gate.
