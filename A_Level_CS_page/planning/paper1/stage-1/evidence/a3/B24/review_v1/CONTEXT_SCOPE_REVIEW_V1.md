# B24 independent context and scope review — A3 v1

Task: `P1-S1-A3-B24-REVIEW-V1`  
Candidate: `B24-A2-v1`  
Status: `FROZEN_FOR_A0_AUDIT`  
Recommendation: `PASS_A3_ONLY`

## Authority and integrity

I verified the dispatched work order at SHA-256 `e4a8ffb0373d9e6c93c76d0e248154ab7d9c901c6b905a6f7b5c09016dca501b`. All ten non-source frozen inputs match their dispatched hashes, including the frozen A2 handoff, batch manifest, 392-entry snapshot, A0 audit, Stage 0 source manifest, 2026 v2 syllabus, Stage 0 scope and pilot decisions, schema and extraction policy. Every snapshot entry matches its byte count and SHA-256; the recomputed snapshot byte total is 13,269,836.

I independently rehashed and opened all 12 original 2024 QP/MS PDFs. All hashes and page counts match the Stage 0 manifest and the candidate provenance: 156 pages total. The local 2026 syllabus is the verified 49-page v2 authority with SHA-256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`. Paper 1 scope is syllabus sections 1–8, PDF pages 14–27, with page 27 limited to section 8.3.

## Question context and boundary review

I reviewed all 49 question roots, their context records, page transcripts and all-page QP contact sheets. Root counts by QP are 8, 8, 7, 8, 9 and 9. Every root locator equals its context start page; every one of the 194 part locators falls on a cited context page for the same source; all dependency IDs resolve.

The context union covers every substantive QP page. The only omitted pages are covers and source-labelled blank pages: `9618_s24_qp_11` p1/p7; `9618_s24_qp_12` p1/p9; `9618_s24_qp_13` p1; `9618_w24_qp_11` p1/p15/p16; `9618_w24_qp_12` p1/p11; and `9618_w24_qp_13` p1/p18/p19/p20. Full-size inspection confirms that November p16/p20 pages containing copyright text are still source-labelled blank pages and are correctly excluded.

Three final-page questions legitimately share a page with copyright/imprint text and remain cited: `9618_s24_qp_11-q8` p16, `9618_s24_qp_12-q8` p16 and `9618_w24_qp_12-q9` p16. The source question content is visible above the imprint. `9618_w24_qp_11-q6` and `-q7` legitimately share p13; both page-level references are correct. The parser's `[Turn over` spelling variants occur in the transcripts as page furniture and do not create a context. No next-question preamble was assigned to the preceding question in the 49-root review.

Seven root-level command observations are non-null (`Complete`, `Describe`, `State`, `Convert`) and each is verbatim on its cited source page. The other 42 root fields remain conservatively null, mainly because the root begins with scenario or grouping text before a child command. Schema 1.1 permits null when a short root command is unclear; the part schema does not define a command-word field. No command word was inferred.

## Parent groups, marks and counts

All 29 part records with no displayed mark and no separate MS row are genuine printed parent labels. Each has two or three indexed children, no marking item targets the parent, and every non-parent leaf has exactly one linked marking item. The 170 marking items partition into 165 part targets and five unparted whole-question targets. No marks or synthetic children were added.

I recomputed bracketed QP marks directly from the 156 page transcripts. Each of the six QPs sums to 75. The frozen counts independently reproduce as 49 roots, 194 parts, 170 marking items and 130 visual regions.

## 2026 scope screen

All 49 historical question contexts concern one or more required Paper 1 sections 1–8. `SCOPE_FLAGS_V1.json` records the root-level section screen and exact context pages. This is a scope screen of historical evidence, not a question-to-objective coverage claim, frequency analysis or permission to reuse a marking point. It does not make the 2024 papers normative for 2026; the 2026 syllabus remains the scope authority.

## Visual and source-risk review

I screened all 12 all-page contact sheets. I then inspected 20 full-size pages spanning every May/June and October/November component 11/12/13 QP/MS pair and all required risk classes: logic circuits and truth tables; instruction, formula and number layout; database/ER layouts; MS condition tables; plain-text pages; shared/imprint pages; and source-labelled blanks. I also independently rendered all 156 original PDF pages at the candidate's 1.15x scale in memory and compared decoded RGB pixels with the candidate PNGs: 156/156 match, with zero size or pixel mismatch.

The raw PDF text layer contains private-use bullet/check glyphs and barcode/control noise. No U+FFFD replacement character occurs, and the noise does not enter IDs, locators, counts or context boundaries. It does appear in some transcript and marking-text evidence, so later content authors must use the full-page source render/MS page as authority rather than copy raw extracted glyphs. This is a documented source limit, not an open corpus disagreement.

## Disposition and limits

No Critical, Major or Minor A3 disagreement is open. A3 recommends `PASS_A3_ONLY`. A4 must still independently review marking semantics and source links, A9 must review the frozen evidence and both specialist handoffs, and A0 alone may accept B24. This review does not approve lesson text, translations, taxonomy, publication or app changes.
