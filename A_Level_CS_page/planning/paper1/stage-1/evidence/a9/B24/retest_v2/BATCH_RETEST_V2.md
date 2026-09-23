# B24 independent batch retest v2

Work order: P1-S1-A9-B24-RETEST-V2  
Candidate: B24-A2-v2  
Reviewer: A9, independent of A2/A4 and A0  
Recommendation: **PASS**  
Status: frozen for A0 integrity audit and decision

## Gate result

B24-A2-v2 satisfies the independent whole-batch gate. The prior Major finding A9-B24-MS-01 is closed: all 19 affected marking excerpts now stop at their original source-row boundary, and the complete 170-item scan finds no residual generic “Question / Answer / Marks” header. No Critical, Major or Minor finding remains open.

## Frozen identity and sources

- All 16 frozen input identities match their required SHA-256 values.
- All 400 candidate snapshot entries match, covering 13,469,905 bytes.
- All 54 A4-v2 output files match their manifest, covering 9,330,247 bytes.
- All 12 original 2024 QP/MS PDFs match Stage 0 hashes and page counts; total 156 pages.

## Prior finding retest

The exact 19 record IDs from A9-B24-MS-01 were compared between B24-A2-v1 and B24-A2-v2. The changed-ID set is exactly those 19 records. In each record only mark_or_condition_or_null changed. The answer, marking condition, displayed mark token, target, locator, transcript reference and visual dependency remain present and source-backed.

All 17 distinct original MS pages containing those records were independently rendered and inspected. The corrected text now ends at the cited answer row. A scan of all 170 candidate marking fields finds zero occurrence of the unrelated generic table header. A4-v2's same-version 19-row and 170-link results are therefore supported independently.

## Whole-batch checks

The candidate contains 156 page records, 49 question roots, 194 parts, 243 combined question/part records, 170 marking items, 49 contexts, 130 visual regions and 29 structural parent groups. IDs are unique; hierarchy, locators, transcripts, contexts and dependency references resolve. The 170 marking items target exactly 165 parts and 5 whole questions.

All 29 structural parents retain null displayed marks and null separate MS locators and have no marking item. Their children remain linked to source evidence. Allowed statuses are consistent, and all six displayed-mark totals equal 75.

Twenty-five original pages were compared directly with candidate full-page renders. All 25 decoded-pixel comparisons match. The sample covers every QP/MS source, all 17 corrected MS pages, blank and imprint boundaries, shared-page context, multi-page prompts, diagrams, tables, formula and number layouts, alternatives, maximum-mark conditions and whole-question targets.

The S24/13 Q3(b) locator nuance also passes: its prompt and instruction table begin on QP p6, while the continuation and displayed mark 3 appear on p7. The candidate preserves both observations without attributing the displayed mark to the start page.

## Scope

This is an A9 recommendation for the B24 Stage 1 extraction batch. A0 retains acceptance authority. No claim is made about Stage 2 lessons, teaching coverage, taxonomy, translation quality or app behavior.
