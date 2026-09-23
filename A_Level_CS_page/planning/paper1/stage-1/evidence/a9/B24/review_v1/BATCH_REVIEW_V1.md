# B24 A9 independent batch review - v1

**Recommendation: CHANGES_REQUIRED** for frozen candidate `B24-A2-v1`. This is an A9 recommendation only; A0 retains batch decision authority. One Major finding is open.

## Integrity and coverage

All 15 frozen input identities match. I rehashed all 392 candidate snapshot entries (13,269,836 bytes), all six A3 declared outputs and all 209 A4 declared outputs with zero mismatch. All 12 original 2024 QP/MS PDFs match the Stage 0 hashes and page counts (156 pages total).

Independent structural checks reproduce 49 question roots, 194 parts, 243 combined question/part rows, 170 marking items, 130 visual regions, 49 context records and 29 structural parent groupings. IDs are unique; all source/page, parent, context, transcript, target and visual references resolve. The 29 grouping parents have children but no displayed mark, separate MS locator or marking-item allocation. The marking targets remain 165 printed parts plus five whole questions. Each of the six QPs independently sums to 75 displayed marks.

The context gate passes. All 49 context records have consistent start, continuation and source-evidence arrays, and no record crosses a later question start. Direct checks cover source-labelled blank pages, final-page imprint text, a page shared by W24/11 Q6 and Q7, and next-question boundaries. For S24/13 Q3(b), the part starts on PDF p6 while its `[3]` token is on continuation p7; the candidate retains the p6 prompt locator, p7 mark observation and p4-p7 question context without loss or misattribution.

I rendered 18 selected original pages in memory at 1.15x and compared decoded RGB pixels with the candidate full-page PNGs: 18/18 match. Full-size inspection covers both sessions and every component, QP/MS evidence, logic/truth tables, database and instruction tables, number layout, shared and multi-page contexts, blank/imprint boundaries, whole-question rows, alternatives, conditions and maximum-mark rules.

## Major finding

`A9-B24-MS-01`: 19 of 170 marking items across five of the six MS files append the generic `Question / Answer / Marks` header of the following table to the current row's `mark_or_condition_or_null`. Direct original-page inspection confirms that this header is outside the cited row. The target IDs, source locators and mark values remain correct, but the stored marking excerpt is not row-bounded. The repeated contamination contradicts the A4 claim that all 170 row boundaries passed and makes the frozen excerpts unsafe for downstream reuse.

The exact 19 IDs, source pages, table-row references, owner and retest are recorded in `FINDINGS_V1.json`. A2 should create a new frozen B24 candidate version that removes only the unrelated trailing headers and refreshes all affected manifests/checksums. A4 must inspect all 19 corrected row boundaries and rerun all 170 linkage checks against the new exact version. A9 must review the new frozen candidate and same-version specialist evidence before A0 makes a decision.

No lesson, teaching coverage, taxonomy, translation or app behavior is approved by this review.
