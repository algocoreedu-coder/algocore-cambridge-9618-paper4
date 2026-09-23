# A3 B22 v3 context and scope retest

**Recommendation: CHANGES_REQUIRED.** This is the independent A3 retest only. It does not accept the batch; A4 same-version retest and A9 review remain mandatory.

## Inputs and method

Retested active `B22-A2-v3` against all 12 original Stage 0 QP/MS PDFs, Stage 0's 2026 syllabus/scope records, the previous A3 B22 review, and the A4 B22 v2 retest. Recomputed source SHA-256 values and page counts; all 12 match both Stage 0 and the current A2 manifest, totaling 166 pages. Active A2 artifact hashes match `BATCH_MANIFEST.json`, and the frozen v3 snapshot matches the active set. The updated A0 batch validator returns PASS with counts 12 sources, 166 pages, 266 question-index rows (52 question + 214 part records), 188 marking records, and 88 visual regions. This validator is structural; it does not check whether printed marks or semantic locators match the paper.

Direct full-page source renders in `retest_v3_renders/SOURCE_RENDER_MANIFEST.json` cover 69 source pages; all listed render hashes recompute and every source hash/page count matches the input manifest. I inspected source pages for the two cross-page context cases, all six whole-question mappings, the eight prior hierarchy cases, the twelve child-locator discrepancies, the seven mark discrepancies, the false-Q1(c) correction, six QP final substantive pages, and representative circuit/truth-table, sound, processor-table, and MS table/condition risks.

## Question inventory and mark totals

The six QP inventories contain contiguous question numbers and the listed terminal substantive questions. Source pages and final-page sequence were checked from the original PDFs and renders. Every source totals 75 marks. The active displayed-mark values do not reconcile for four papers:

| QP | Source marks | Indexed marks | Difference |
|---|---:|---:|---:|
| S22/11 | 75 (25 brackets) | 74 (25 values) | -1 |
| S22/12 | 75 (29 brackets) | 71 (29 values) | -4 |
| S22/13 | 75 (27 brackets) | 75 (27 values) | 0 |
| W22/11 | 75 (36 brackets) | 75 (36 values) | 0 |
| W22/12 | 75 (36 brackets) | 77 (36 values) | +2 |
| W22/13 | 75 (35 brackets) | 72 (35 values) | -3 |

The seven visibly mismatched records are S22/11 Q4(c)(i), p8: indexed 4, printed [5]; S22/12 Q2(c), p4: 2 vs [1], Q4(b), p7: 2 vs [6], and Q4(c), p7: 1 vs [2]; W22/12 Q8(c)(ii), p16: 4 vs [2]; and W22/13 Q6(a)(i), p11: 2 vs [4], and Q6(a)(ii), p12: 1 vs [2]. These values fully explain the four paper-total discrepancies. No mark or mark-scheme allocation was inferred.

Twelve nested-part QP locators also point to pages before the corresponding prompt or parent: S22/11 Q2(c)(i)/(ii), indexed p3, source p5; Q6(c)(i)/(ii), indexed p12, source p14; W22/11 Q1(d)(ii), indexed p2, source p3; Q6(b)(i)/(ii), indexed p13/14, source p16; W22/12 Q8(c)(i)/(ii), indexed p15, source p16; and W22/13 Q6(b)(i), indexed p11, source p12, plus Q6(b)(ii)/(iii), indexed p12, source p13. The A0 Lead spot-check independently records all 12; I directly inspected the original-page render for p13 and confirmed both (ii) and (iii) labels. Original-page renders show the cited labels and marks on the source pages.

The six whole-question targets are structurally sound and point to source-supported unparted questions: S22/12 Q7 [2] and Q8 [3] -> MS12 p8; W22/11 Q2 [4] -> MS11 p3 and Q8 [4] -> MS11 p10; W22/12 Q9 [2] -> MS12 p10; W22/13 Q3 [4] -> MS13 p3. Each record has exactly one question target, its question row carries the displayed mark, and no lettered child was invented.

## Previous findings and other gates

The two known cross-page context repairs pass source review. W22/11 Q4 parts set `context_required=true` and depend on QP pp.6–8, where the PHOTOGRAPHS schema/context begins and its tasks continue. W22/12 Q7 parts depend on QP pp.10–14, where the processor instruction-set context and trace/bitwise tasks span pages. The eight children cited in A4's prior hierarchy finding now each point to a live printed parent; there are no dangling parent IDs. The 19 prior prefix-only parent records are now record-specifically unresolved, each has indexed children, and the 43 child MS links were retested. The one text-layer locator miss (S22 MS13 p7, 5(b)(iii)) is visibly exact on the direct source render.

The corrected false record `9618_w22_qp_12-q1-pc` is absent. Original W22/12 QP p5 shows Q3(b) and Q3(c), not a Q1(c), so this correction is source-supported. The unresolved register contains 32 item-specific parent-container rows; none of the child rows is incorrectly left unresolved. All 188 marking rows target exactly one live part/question ID, and the current manifest note describes the schema v1.1 question- and part-level locators. Current artifact hashes and handoff hash now match the manifest.

All 88 visual regions have render files and live `relates_to_ids`; all 104 visual dependency references resolve to a region on the matching MS source/page. PAGE_INDEX has 88 `VISUAL_CHECK_REQUIRED` pages corresponding to the regions and 78 `NOT_REQUIRED` pages, with no contradictory status. Region states remain pending independent review (64 A2 visually inspected, 24 rendered-only). My source review confirms sampled circuit/truth-table, sound, processor instruction/table, and MS table/shaded-row examples are present and legible. This does not replace A9's review of all visual regions.

The Stage 0 authority remains the 2026 v2 syllabus, sections 1–8. No newly out-of-scope prompt was found in this metadata/hierarchy retest. W22/13 Q1(b), PDF p3 sound file-size arithmetic, remains the previously recorded SUPPORTING boundary under §1.2, not a new required syllabus objective or a claim of teaching coverage.

## Disposition and required correction

Findings `A3-B22-V3-01` (seven source-visible mark mismatches) and `A3-B22-V3-02` (12 QP locator errors) are Major and remain with A2. Correct those source fields, re-run all six QP mark totals and the full nested locator-order check, freeze a new version, then obtain A4 same-version retest and A9 independent batch review. A3 has not edited the A2 corpus, source PDFs, or top-level trackers.

See [`CONTEXT_SCOPE_FINDINGS_V3.json`](./CONTEXT_SCOPE_FINDINGS_V3.json) for record IDs, source locator evidence, hashes, and checks, and [`HANDOFF_RETEST_V3.json`](./HANDOFF_RETEST_V3.json) for the machine-readable gate summary.


The frozen A0 Lead source spot-checks corroborate the six-paper totals and seven displayed-mark discrepancies and independently list all 12 preceding-page locator rows. Their SHA-256 values are recorded in the findings JSON; A3 independently checked the candidate question-index hash and visually verified the two W22/13 Q6(b) labels on p13.
