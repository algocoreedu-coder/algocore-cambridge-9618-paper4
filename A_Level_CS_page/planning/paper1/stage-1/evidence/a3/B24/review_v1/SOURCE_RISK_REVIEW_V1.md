# B24 source and render risk review — A3 v1

Status: `PASS_A3_ONLY`; no open Critical/Major/Minor A3 disagreement.

## Source identity

All 12 original 2024 QP/MS PDFs match the Stage 0 SHA-256 values and declared page counts, totalling 156 pages. The candidate's 392-entry snapshot recomputes with zero hash or byte mismatch. The 2026 v2 syllabus, Stage 0 scope evidence, schema and extraction policy also match the dispatch pins.

## Visual evidence reviewed

All 12 contact sheets were screened. The full-size sample contains 20 pages and spans all six session/component QP/MS pairs:

- QP diagram/table/layout: `9618_s24_qp_11` p2, `9618_s24_qp_12` p2, `9618_s24_qp_13` p4, `9618_w24_qp_11` p4, `9618_w24_qp_12` p12, `9618_w24_qp_13` p2.
- MS diagram/table/condition: `9618_s24_ms_11` p3, `9618_s24_ms_12` p3, `9618_s24_ms_13` p4, `9618_w24_ms_11` p4, `9618_w24_ms_12` p3, `9618_w24_ms_13` p3.
- Boundary/imprint: `9618_s24_qp_11` p7/p16, `9618_s24_qp_12` p9, `9618_w24_qp_11` p16, `9618_w24_qp_12` p16, `9618_w24_qp_13` p20.
- Plain-text control: `9618_s24_qp_11` p6 and `9618_w24_ms_13` p8.

This covers circuit/gate geometry, truth tables, instruction and number layout, database/ER layout, scoring tables and conditions, plain text, blank pages and content-plus-imprint pages. Candidate regions are conservative page-level evidence; the plain-text controls show that some pages are rendered for complete question/MS context even when they have little non-text structure. That does not lose evidence or claim independent verification.

I independently rendered every original page at 1.15x in memory and compared decoded RGB data with each candidate full-page PNG. All 156 page images match exactly. This verifies render fidelity, not the semantic correctness of every MS condition.

## Extraction risks and controls

The text layer preserves private-use bullet/check glyphs and barcode/control characters on some pages. No replacement character occurs. Because the records keep exact source/page locators and full-page renders, the original visual source remains available. Later authoring must not copy raw glyphs or infer circuit geometry, table alignment, negation, maximum marks or alternatives from transcripts alone.

The final-page parser correctly distinguishes source-labelled blank pages with imprint text from genuine question pages that also carry an imprint. `[Turn over` variants are page furniture and do not generate context. All substantive QP pages occur in at least one context record; covers and source-labelled blank pages do not.

## Review limit

A3 checked context, scope and source risk. A4 remains responsible for independent marking-link and marking-condition semantics; A9 must review the frozen packet and both specialist evidence sets. No lesson, translation, taxonomy, frequency claim or app content is approved here.
