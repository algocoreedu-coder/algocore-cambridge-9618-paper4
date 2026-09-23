# B25 A4 independent linkage review — v1

**Recommendation: CHANGES_REQUIRED.** This review is limited to linkage/source evidence in B25-A2-v1 and the six exact 2025 Paper 1 QP/MS pairs. It is not a batch release decision.

## Frozen inputs and scope

All 14 recorded input pins pass, including the dispatch, candidate handoff, batch manifest, snapshot, A0 audit, Stage 0 source manifest, schema and extraction policy. The 438-entry candidate snapshot matches. The 12 original PDFs are all 2025 sources (`s25` or `w25`), total 178 pages, and match the pinned Stage 0/candidate hashes and page counts. No 2022 source was used. The detailed pins are in `INPUT_PINS_V1.json`; direct render hashes are in `SOURCE_RENDER_MANIFEST_V1.json`.

## Linkage, marks and hierarchy

The candidate has 51 roots, 207 parts, 258 question/part rows, 183 marking items, 27 parent groups and 51 context records. Structural checks found no invalid question/part locator scope, parent relation, marking target or visual dependency. All 27 grouping parents have direct children, those children are MS-linked, and no score allocation is inferred at the parent. Reconciliation of the source mark observations found 183/183 matching the indexed question/part path, PDF page and mark value. All six printed cover totals and indexed sums are 75/75. Whole-question marks use question targets and no synthetic part was found.

## Findings

**A4-B25-CTX-01 — MAJOR:** nine context records include a page on which the next numbered question begins, while marking that page as continuation of the previous question. These are s25/11 Q3 p7→Q4; s25/12 Q2 p5→Q3; s25/12 Q5 p11→Q6; w25/11 Q2 p7→Q3; w25/11 Q5 p11→Q6; w25/12 Q7 p13→Q8; w25/12 Q9 p15→Q10; w25/13 Q1 p3→Q2; and w25/13 Q3 p5→Q4. For each, the indexed context record lists the page under `continuation_pages`; its transcript opening and direct original page render show the next question. This is a boundary/linkage issue with a material risk of attaching content to the wrong question. A2 should correct these records in a new frozen candidate version and A4 should retest it.

**A4-B25-CTX-02 — MINOR:** w25/13 Q5 context includes p9 as a continuation page, but p9 only contains “Question 6 starts on the next page.” Q5 content continues on p7–p8; p9 is a boundary notice.

**A4-B25-MS-01 — MINOR:** `9618_w25_qp_13-q7-pe-mi-1`, source `9618_w25_ms_13` PDF p12, incorporates the next generic “Question / Answer / Marks” table header after the 7(e) answer and mark. Keep the row content bounded to the 7(e) row.

A text-normalization script reported 16 non-contiguous candidate/MS transcript comparisons. All 16 affected source pages were reviewed visually. Fourteen are extraction/line-serialization differences whose marking content matches the page visually. Two needed careful distinction: 7(e) contains the row-boundary header reported above; for W25/13 Q8(b), both candidate and original PDF read “does not have to written from scratch,” so this is a source-published grammatical typo and **not** a candidate discrepancy.

## Visual/source evidence

All 56 MS visual dependency pages were viewed from direct PDF renders; all 88 QP region pages were screened across contact sheets; the risk-based full-size QP sample contains 25 pages across all six variants and includes the 11 context-risk pages. In total, 144 unique original pages were rendered at 144 DPI from the pinned PDFs. Dimensions, source/page identities, byte counts and hashes are frozen in the render manifest. The dependency structure has zero dangling/wrong-page references.

## Gate

The MAJOR context-boundary finding fails the A4 gate; the recommendation is **CHANGES_REQUIRED**. This is A4-only evidence and does not accept the batch. A2 should provide a new frozen candidate handoff and snapshot for the context fixes and row-boundary correction; then dispatch a fresh independent A4 retest. A3, A9 and A0 remain separate gates.
