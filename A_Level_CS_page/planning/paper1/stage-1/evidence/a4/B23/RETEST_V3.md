# Independent A4 linkage retest — B23 A2-v3

Task: `P1-S1-A4-B23-RETEST-V3`  
Retest result: **PASS for A4 criteria only**.  
B23 batch gate: **OPEN — same-version A9-v3 and A0 gate decision remain required**.

This report reviews frozen `B23-A2-v3` source-location artifacts. It does not accept the B23 batch, lessons, translations, or Stage 1 as a whole. The reviewer was independent of the A2 author. No A2, source, or top-level files were edited.

## Integrity and source basis

I recomputed all 12 original PDF SHA-256 hashes and page counts against Stage 0 and A2-v3: all match, for 157 pages total. I recomputed all 364 active-file hashes listed by the A2 manifest; all match. The batch-manifest SHA-256 is `62d0a50e7e446d1bd36ac91a072e272298131e78f5b4e084437c69bea619765d`. Core hashes: QUESTION_INDEX `fca2248be329172d921f71a63367e73797ca40c96d84d7d45919c4da3bf702b4`; MARKING_INDEX `c55fcef29d6a9a03845c20bf0a45254b81e1810aac537a8e05d550ef2d1c55ac`; VISUAL_MANIFEST `98fb098d7f9252062b112616c68f7307ce318e9fb64fcdd6d989104163d93e7f`.

I compared every active marking locator with the original MS page text and inspected original-page renders for the cited links and risk pages. All 178 exact question/part labels are present, with no prefix-only matches. Input and render hashes are fully listed in `RETEST_HANDOFF_V3.json`. I inferred no marks or marking points.

The source-critical v2→v3 index diff was also checked: no question or part records were removed; W23/11 Q9 and its two printed parts were added, and S23/11 Q6 changed from null/EXTRACTED to the source-printed 5/MS_LINKED state. Existing part locators, marks, hierarchy and statuses are unchanged. The 175 existing marking rows retain the same source locators/conditions; the `part_id` field was normalized to the schema-1.1 nullable `part_id_or_null`, and three new marking rows cover whole-question S23/11 Q6 plus W23/11 Q9(a)/(b).

## Retest matrix

| Criterion | Result | Evidence |
|---|---|---|
| Source integrity and active hashes | PASS | 12/12 PDFs/pages and 364/364 active hashes match; schema 1.1. |
| Exact QP→MS labels and target schema | PASS | 178/178 source labels exact; every marking item targets exactly one part or whole question. |
| Prior A4-F01 parent handling | PASS | All 28 parent-context rows remain unresolved with null MS locator/marks and no marking item. Prior child labels remain; no parent allocation inferred. |
| Prior A4-F02 inline children | PASS | Six children preserve printed hierarchy, marks and exact locators; the item allocations remain null. See findings JSON for source pages. |
| Prior A4-F03 W23/12 Q9(b) | PASS | QP p14 prompt/p15 context and printed [4] link to exact MS p11 (b). Regions/dependency resolve; no per-row allocation inferred from the shaded-row condition. |
| A9-F01 omitted W23/11 Q9 | PASS | QP PDF p16 shows Q9(a) [2] and Q9(b) [3]; exact MS PDF p10 rows. Shared-page regions/dependencies resolve. All six final QP pages inspected: only W23/11 p16 contains a question; five say “BLANK PAGE.” |
| A9-F02 unparted S23/11 Q6 | PASS | QP PDF p13 displays [5], mapped to whole-question MS PDF p9 question 6, condition “1 mark each to max 5.” No part label was invented. |
| A9-F03 stale visual targets | PASS | All 10 old dangling targets rechecked; none remains. The current graph has zero dangling IDs. |
| A9-F04 visual-risk pages and dependencies | PASS | All 30 former uncovered MS risk pages plus added S23/11 MS p9 rendered from originals and inspected. Current 49/49 MS answer pages with rows have regions; all 178 dependencies resolve to exact same-page regions; all 95 region-page statuses match PAGE_INDEX. A2/A3 report 61 MS pages screened; A4 does not claim to have independently re-screened all 61. |
| A9-F05 corrected W23/13 p13 render | PASS | Corrected A2 PNG hash matches provenance and source comparison shows complete opening prompt plus (a)(i). The clipped PNG remains only in the v2 snapshot. |
| Paper totals | PASS | All six QP fronts print total mark 75 and paired MS fronts print Maximum Mark 75. Current displayed-mark sums are 75 on every paper, including W23/11 Q9 [2]+[3] and S23/11 Q6 [5]. |
| A3 context/scope flags | PASS | W23/12 prefix wording; W23/11 Q8(c)(iii) pp14–15; W23/12 Q9(b) pp14–15/[4]/MS p11 checked from originals. 2023 remains historical evidence, not a claim of 2026 coverage. |

## Limits and gate

The 28 parent records stay unresolved; this retest does not invent parent MS rows or allocate child marks. The 95 region reviewer statuses remain as authored; A4 did not alter them. I did not visually recheck every QP page or independently screen all 61 MS pages. This is not the independent A9 batch review.

**A4 B23-A2-v3 retest passes. Batch acceptance remains open until an independent A9 review and A0 decision are recorded against the same hashes.**

Evidence images are in [`retest_v3_renders`](retest_v3_renders/). See [`RETEST_HANDOFF_V3.json`](RETEST_HANDOFF_V3.json) for exact input, output and per-render hashes.
