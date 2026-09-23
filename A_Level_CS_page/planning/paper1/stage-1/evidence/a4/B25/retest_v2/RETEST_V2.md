# B25 A4 v2 independent retest

**Work order:** `P1-S1-A4-B25-RETEST-V2`  
**Candidate:** `B25-A2-v2`  
**Recommendation:** `PASS_A4_ONLY` — linkage and source-evidence retest only; this is not A9 review or A0 batch acceptance.

## Frozen identity and source scope

The dispatched work order hash matches `13f618043e433f092255f2e83625ba70298bef2b9fce865dddf24934ae268ce0`. All 32 explicit and candidate-handoff pins verified. The candidate’s 442 snapshot entries all match their byte counts and SHA-256 values. The twelve pinned 2025 QP/MS originals were rehashed and opened independently: 178 pages total, with no source hash or page-count mismatch.

All direct page renders in this retest were generated from those original PDFs at 144 dpi using PyMuPDF and have per-page hashes in `SOURCE_RENDER_MANIFEST_V2.json`. I visually inspected the ten corrected context-boundary pages, the retained S25 Q8 p15 and W25/13 Q5 p7-p8 continuations, the six QP cover pages, and W25/13 MS p12.

## Finding retests

`A4-B25-CTX-01` (originally MAJOR) is closed for all nine cases. Direct QP pages show the next numbered question beginning at S25/11 p7 (Q4), S25/12 p5 (Q3) and p11 (Q6), W25/11 p7 (Q3) and p11 (Q6), W25/12 p13 (Q8) and p15 (Q10), and W25/13 p3 (Q2) and p5 (Q4). In each v2 context record, the corresponding page is absent from `all_context_pages`, `continuation_pages`, and `source_evidence`.

`A4-B25-CTX-02` (originally MINOR) is closed. W25/13 Q5 p9 contains only the printed notice “Question 6 starts on the next page”; v2 no longer associates p9 with Q5. The real Q5 continuations p7-p8 remain in both context-page fields and show Q5 content on the original pages. S25/11 Q8 p15 likewise remains attached and shows its memory-table continuation.

`A4-B25-MS-01` (originally MINOR) is closed for `9618_w25_qp_13-q7-pe-mi-1`, located at W25/13 MS p12, row 7(e), printed page 12. The original table gives the validation-check marking rule, Range Check, Existence Check, Format Check, and 3 marks. The v2 excerpt preserves this full answer and mark and omits only the generic `Question / Answer / Marks` header that starts the following table. The MS locator, target part, table-row ref, transcript ref, and visual dependency are unchanged from v1.

The W25/13 Q8(b) wording “does not have to written from scratch” remains a non-finding: the exact wording is printed in the original MS and is preserved in the candidate. No candidate-authored discrepancy is present.

## Regression results

The v2 question index has 51 roots and 207 parts (258 records); all 183 marking items have valid question/part targets, corresponding MS-source locators, valid source-page transcript refs, and page-matched visual dependencies. There are no dangling targets, locator/page mismatches, missing transcript refs, or incorrect visual dependencies.

All 144 visual regions (88 QP and 56 MS) and their referenced original-page renders match the parent v1 evidence exactly; the full-page render manifest and visual-region records are unchanged. All 27 printed parent groups have their expected parent and MS-linked children; no synthetic parent mark or marking item was introduced.

For all six QP variants, the indexed question/part total is 75, the original cover page states 75, and the candidate’s source-transcript mark check also sums to 75. The question index, page index, all marking IDs, and every marking item except the corrected Q7(e) excerpt are unchanged from the pinned v1 candidate.

The candidate’s 27 printed grouping labels without separate MS rows remain recorded in A2’s unresolved report as a known structural condition, not an unresolved mark allocation: the children are linked and the groups have no synthesized mark. No new A4 finding was identified.

## Gate boundary

This retest recommends **PASS_A4_ONLY** for B25-A2-v2. It closes the three prior A4 findings for the exact frozen candidate. A0 handoff audit, A9 independent review, and A0 batch decision remain required before batch acceptance.

## Evidence

- `INPUT_PINS_V2.json` — dispatch/candidate/prior-evidence pins and 442-entry snapshot verification.
- `SOURCE_PDF_HASHES_V2.json` — 12 original source hashes and 178 page counts.
- `SOURCE_RENDER_MANIFEST_V2.json` and `source_renders/` — direct hashed renders for all risk pages and cover checks.
- `DIRECT_SOURCE_TEXT_V2.txt`, `COVER_TOTAL_SOURCE_TEXT_V2.txt` — text extracted from the pinned original pages as corroborating evidence; visual inspection was performed against the renders.
- `RETEST_FINDINGS_V2.json`, `FINDING_DISPOSITIONS_V2.json` — machine-readable outcomes.
- `RETEST_AUTOMATION_SUMMARY_V2.json` — aggregate evidence counts.
