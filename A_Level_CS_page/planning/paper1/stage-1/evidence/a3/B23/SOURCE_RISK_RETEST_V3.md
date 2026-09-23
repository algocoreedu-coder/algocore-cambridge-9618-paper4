# Source-risk retest — B23-A2-v3

Disposition: **A3 source-risk retest PASS with stated inspection boundary.** No claim of batch acceptance or complete extraction correctness is made.

## Integrity checked

- Recomputed all 364 hashes listed by active `B23-A2-v3/BATCH_MANIFEST.json`; 364 matched, none missing/mismatched.
- Independently recomputed/opened the 12 original 2023 QP/MS PDFs. Source hashes and PDF page counts match Stage 0 and A2: 12 PDFs, 157 pages.
- Recomputed the 2026 syllabus hash against Stage 0: `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`.

## Visual risk checks

- Rendered the 61 pages across the six original MS PDFs into 11 contact sheets and screened every page. Answer-bearing pages are distinguishable from covers and generic marking-principles pages; each of the 49 answer pages has a region in A2. The 178 marking items have an exact-source/page region dependency. This screen verifies page presence and major layout/reference risks; it is not a line-by-line independent audit of every row boundary.
- Direct original PDF page renders were checked for the earlier A3 flags: W23/11 QP pp.14–16, MS p.10; W23/12 QP pp.6, 14–15, MS pp.4, 11; S23/11 QP p.13, MS pp.3, 8–9; S23/13 MS p.3; W23/13 QP p.13. The six A9 F02 child-fix pages were also compared directly: W23/11 QP pp.7, 11, 13; W23/12 QP pp.6, 10; W23/13 QP p.13.
- Corrected W23/13 QP PDF p.13 derivative has SHA-256 `f0f5d1c0537818b8e1596eeeb6d0dcf28dbc0bca86913814bbfdb57ae542e0d3`, equal to A2 correction provenance. Its heading and (a)(i) label are visible against the direct original-source render.

## Remaining risk / ownership

1. A3 did not full-resolution inspect all 96 QP pages or every individual A2 source-page render. The risk-page checks above do not certify all extraction or crops. Owner: A4/A9 for their independent corpus criteria; retest against frozen A2-v3 hashes.
2. Twenty-eight parent relationships remain explicitly unresolved in A2. They are surfaced rather than inferred. Owner: A4 to determine source-supported parentage; if genuinely ambiguous, retain item-specific unresolved entries; A9 retests disposition.
3. Exact marking-row boundary and linked answer correctness require A4’s source-side retest. The contact sheets establish page visibility and target presence, not all row boundaries.
4. No pedagogical explanation, translation, syllabus coverage mapping or lesson claim is validated by this A3 retest. Stage 1 authoring remains gated on A0 acceptance.

## Evidence

`retest_v3_renders/RENDER_MANIFEST.json` enumerates the 19 detailed source-page renders, all 11 sheets screening all 61 MS pages, and the A2 corrected-render comparator. Every image hash is recomputable. Original PDFs remain read-only.
