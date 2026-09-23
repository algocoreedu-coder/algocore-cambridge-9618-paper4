# B25 independent batch review v2

Work order: P1-S1-A9-B25-REVIEW-V2  
Candidate: B25-A2-v2  
Reviewer: A9, independent of A2/A3/A4 and A0  
Recommendation: **CHANGES_REQUIRED**  
Status: frozen for A0 integrity audit and disposition

## Gate result

The candidate and specialist evidence have stable identities, and the source, hierarchy, context, mark-total and visual-reference checks pass. The batch cannot pass because eight marking excerpts cross their source row boundary and append the next table's generic “Question / Answer / Marks” header. This is one open Major finding, A9-B25-MS-01.

## Integrity and source evidence

- All 17 frozen input files match their required SHA-256 values.
- All 442 candidate snapshot entries match, covering 15,053,562 bytes.
- A3's 215 declared output files and A4's 44 declared output files match their manifests.
- All 12 original 2025 QP/MS PDFs match the Stage 0 hashes and page counts; total 178 pages.
- Twenty-eight selected original pages cover every session/component and required risk class. Candidate full-page renders match the independently rendered source pixels on all 28 pages.

## Complete structural review

The candidate contains 178 page records, 51 question roots, 207 parts, 258 combined question/part records, 183 marking items, 144 visual regions and 51 question-context records. IDs are unique; parent, source, locator, transcript, context and dependency references resolve. The 183 marking items target exactly 180 parts and 3 whole questions. All six displayed-mark totals equal 75.

All 27 structural parent groups keep their displayed mark and separate MS locator null, have no marking item, and retain valid child linkage. No extraction-time unresolved mapping is declared. The allowed status distribution is internally consistent: 75 EXTRACTED and 183 MS_LINKED question/part rows, 183 MS_LINKED marking items, and 144 RENDERED_PENDING_INDEPENDENT_REVIEW visual rows.

## Required v2 regression checks

All ten context-boundary corrections are supported by the original QP pages. Each removed page is a next-question or boundary page. S25/11 Q8 p15 remains because it contains the trace-table continuation. W25/13 Q5 pp7–8 remain because they contain required continuation content; p9 remains excluded because it only says that Question 6 starts on the next page.

Record 9618_w25_qp_13-q7-pe-mi-1 passes its explicit retest against W25/13 MS p12: the following generic header is absent while the Q7(e) answer, condition, displayed mark 3, target, locator, transcript and visual dependency remain.

## Major finding A9-B25-MS-01

The complete scan of all 183 mark_or_condition_or_null fields found eight other records with the same terminal generic header defect. Direct inspection confirms that each header belongs to the following table:

| Record | Original source locator | Row boundary |
|---|---|---|
| 9618_w25_qp_12-q1-mi-1 | 9618_w25_ms_12 PDF p4, row 1 | Header starts next table before 2(a) |
| 9618_w25_qp_12-q2-pb-mi-1 | 9618_w25_ms_12 PDF p5, row 2(b) | Header starts next table before 3(a)(i) |
| 9618_w25_qp_12-q5-pe-mi-1 | 9618_w25_ms_12 PDF p8, row 5(e) | Header starts next table before 6(a) |
| 9618_w25_qp_12-q6-pd-mi-1 | 9618_w25_ms_12 PDF p9, row 6(d) | Header starts next table before 7(a) |
| 9618_w25_qp_12-q8-pb-pii-mi-1 | 9618_w25_ms_12 PDF p10, row 8(b)(ii) | Header starts next table before 9(a) |
| 9618_w25_qp_12-q9-pb-mi-1 | 9618_w25_ms_12 PDF p11, row 9(b) | Header starts next table before 10(a) |
| 9618_w25_qp_12-q10-pc-mi-1 | 9618_w25_ms_12 PDF p11, row 10(c) | Header starts next table before 11 |
| 9618_w25_qp_13-q3-pb-mi-1 | 9618_w25_ms_13 PDF p6, row 3(b) | Header starts next table before 4(a) |

This conflicts with A4's claim that all 183 marking targets passed the row/source check. The A4 artifact identity is valid, but its marking-row evidence is insufficient for acceptance.

## Required correction and retest

A2 must publish a new frozen candidate that removes only the unrelated trailing generic headers from these eight fields while preserving every source-backed answer, marking condition, displayed mark, target, locator, transcript reference and visual dependency. Candidate manifests and handoff must be refreshed.

A4 must inspect all eight corrected rows against the cited originals and rerun the complete 183-item linkage and row-boundary check on that exact candidate. A9 must review the new frozen candidate and same-version specialist evidence before A0 makes the batch decision.

This review makes no claim about lesson correctness, teaching coverage, taxonomy, translation quality or app behavior.
