# A4 retest — B21 A2-v2

Task: `P1-S1-A4-B21-RETEST-V2`  
Artifact version: `B21-A4-RETEST-v2`  
A4 retest result: **CHANGES_REQUIRED**  
B21 batch gate: **OPEN — A3-v2 alignment and A9 batch review remain required**.

The retest confirms substantial corrections in A2-v2, including the W21 Q1/Q6 locators, the 203-record part hierarchy, exact MS label links, the added visual renders, and the v1 visual-count reconciliation. It finds one remaining major source-attribution defect in both S21 components 11 and 13: printed Q7(c) on QP PDF page 16 has been assigned to Q8(c). The Q7 continuation/context and page-16 visual relationships are consequently incomplete. This prevents an A4 retest PASS. No A2/A3/source/app files were changed.

## Inputs and integrity

I recomputed SHA-256 for the active A2-v2 manifest and required indexes, the v1 snapshot, the prior A4 v1 reports/addendum, and the A3 B21 review inputs. Their hashes are recorded in `RETEST_FINDINGS_V2.json`. The frozen-v1 manifest, question index, marking index, and visual manifest match the hashes referenced by the prior A3/A4 evidence.

All 12 original PDFs were independently hashed and opened for page counts. Every PDF hash and page count matches the A2-v2 manifest and Stage 0 baseline: 12/12 sources, 154 total pages. The full per-source evidence appears in the findings JSON.

The active corpus contains 48 question-start rows, 203 part rows, 201 marking records, 48 context records, and 59 visual regions. Structural checks found unique part IDs, no dangling parent IDs, no hierarchy cycles, and valid references among visual targets. The 48 indexed question-start locators point to pages containing their corresponding printed question headings, including W21 QP11/QP13 Q1 at p2 and Q6 at p11.

## Part hierarchy, displayed marks, and MS linkage

The hierarchy is materially improved: A2-v2 records 203 parts, including nested children, with parent IDs resolving and no cycles. All 203 indexed part labels occur on their cited QP pages. Directly tracking the printed question heading active at each label reveals two attribution errors: the S21 `q8-pc` rows are physically before the Q8 heading and belong to Q7(c). A complete source-span review also finds Q7(b)(iii) missing from both QP11 and QP13. Of the 169 populated part-mark fields, the 167 correctly attributed records match a visible bracketed mark in their source span; the two remaining `[3]` values are the misassigned Q7(c) records. Q7(b)(iii)'s separate `[1]` is also missing from the part index. The 34 `PARENT_CONTEXT_ONLY` MS records remain explicitly `UNRESOLVED`, have null mark/condition and table-row fields, and are not promoted to leaf marking rows.

All 167 `EXACT_PRINTED_LABEL` links were checked against their cited original MS PDF pages; 167/167 exact labels are present. Their 45 visual dependency references resolve to the matching MS source and cited page. All 201 `table_row_ref_or_null` values remain null, so this retest makes no row-level linkage claim. The two active unresolved leaves are the misattributed Q7(c) records; additionally, Q7(b)(iii) is absent from both QP indexes. The original MS p9s contain direct labels for all four missing/misattributed Q7 source parts.

**Major — S21 Q7(b)(iii) is missing, and Q7(c) is assigned as Q8(c), in both component 11 and 13.** On both original QP p16s, the printed Q7 continuation includes `(iii) Bobby wants to name his database SHOPORDERS ... [1]`, then `(c) A database has a data dictionary ... [3]`, and only then the heading `8 Tick ...` and a separate logic-gate table `[3]`. There is no Q7(b)(iii) row in v2. The false rows `9618_s21_qp_11-q8-pc` and `9618_s21_qp_13-q8-pc` point to p16, carry mark 3, and have no MS locator, even though their `(c)` label precedes the Q8 heading. The original `9618_s21_ms_11` p9 and `9618_s21_ms_13` p9 each print exact `7(b)(iii)` (1 mark, `CREATE DATABASE SHOPORDERS;`) and exact `7(c)` (1 mark per item to max 3; total 3). Thus two source-supported Q7 leaves are absent in each variant: one completely omitted and one misattributed to Q8. The two v2 “unmatched” leaves are explained by the Q7(c) misattribution.

Q8 is a separate, unlabelled table question. Its QP p16 displays a second `[3]` after the logic-gate table. In both original MS PDFs, p10 prints `Question 8`, “1 mark per correct row,” the completed table, and total 3. Yet each Q8 question row has `marks_displayed_or_null: null`; the visual manifest has no S21 MS p10 region; and there is no question-level MS visual/dependency record for that table. Preserve the source-supported Q8 total `[3]` at question level and its MS p10/table evidence without inventing a Q8(c) part or per-row allocation.

The two page-16 `VISUAL_MANIFEST` records currently relate only to Q8. Once both Q7 leaves are restored, each QP page-16 region must relate to both the Q7 continuation and Q8. Add the corresponding S21 MS p10 visual regions and an explicit question-level evidence/dependency path for each Q8 table (or document a schema-approved equivalent). The original PDFs resolve the attribution directly.

## Context and visual retest

The `CONTEXT_INDEX` has 48 rows and usable source-page references. However, Q7 context for both S21 components lists only `[15]`, while p16 visibly contains its `(c)` prompt before Q8 starts. Q7 therefore needs shared context page 16; Q8 correctly starts on p16 and must keep that page. On this review, 46/48 context spans are complete; the two S21 Q7 spans are not.

All eight visual pages added for the prior A3 flags exist as renders and relate to the expected questions: S21 QP11/13 pp3 (Q1), p5 (Q2), p10 (Q3), and W21 QP11/13 p2 (Q1). These target relations are semantically supported by the original prompts. Their `reviewer_status` remains `RENDER_REQUIRED_V2` even though the render files exist; correct the status when A2 revises the affected manifest. The eight-page check does not establish adequacy for all other visual risks, including the two missing MS p10 regions.

The corrected v1 baseline is faithfully recorded: 51 regions, 18 with non-empty relations, 33 empty, and 20 target references. V2 has 59 regions: 48 QP regions have one target each and 11 MS regions have none, for 48 target references. These counts reconcile the prior report and describe inventory only; they do not prove visual coverage or semantic adequacy. The 45 MS visual dependencies above are independently resolvable; row-level MS references remain absent.

## Retest disposition and next gate

`A4-B21-F01` hierarchy correction: **structural checks pass, but Q7(b)(iii) is absent and Q7(c) is misattributed in both variants**.  
`A4-B21-F02` displayed-mark/context correction: **CHANGES_REQUIRED** for the missing Q7(b)(iii) `[1]`, misassigned Q7(c) `[3]` in both variants, omitted Q8 question-level `[3]`, and incomplete Q7 context.  
`A4-B21-F03` MS linkage correction: **167 existing exact leaf labels pass; four Q7 leaf records/links require repair across both variants; 34 parent records remain context-only and unresolved; Q8 table-level evidence on MS p10 is not represented**.  
`A4-B21-F04` visual/dependency correction: **partial**; eight flagged renders and 45 MS page dependencies resolve, but the two p16 relations omit Q7, MS p10 has no visual region/dependency for Q8, and every table-row reference remains null.  
`A3-B21-CTX-01` and the W21 Q1/Q6 locator correction: **PASS on the targeted source-page check**.  
`A3-B21-CTX-02`: **partial**; 46/48 context spans complete, with the two S21 Q7 spans missing p16.  
`A3-B21-VIS-01`: **PASS for the eight specifically flagged pages and their current question targets**.  
`A3-B21-REV-01`: **reconciled as an inventory count only; adequacy remains open for A9**.

A3's independent v2 retest also recommends `CHANGES_REQUIRED` and identifies the same Q7 hierarchy, mark-level, context, and page-16 relation defects. It maps the observed data-dictionary item to 2026 syllabus §8.2 and Q8 logic-gate table to §3.2, without claiming 2026 coverage or frequency. A3 further confirms all eight previously missing page renders exist, while their render-status metadata remains stale.

A2 should issue a new immutable B21 version that adds Q7(b)(iii) under Q7(b) and restores Q7(c) under Q7, each with source-supported QP p16 locators, displayed marks, and exact MS p9 locators; remove the false Q8(c) children. Record p16 as shared Q7/Q8 context and relate each S21 p16 QP visual region to both questions. Retain Q8's own displayed `[3]` at the question level and capture its original MS p10 table evidence with a visual/dependency path that follows the schema without inventing child parts or row allocations. Correct the stale status on the eight newly rendered visual regions and explain the disposition of both formerly unmatched leaves. Then A4 must retest the new frozen artifacts. A9's independent batch gate remains required after A3 and A4 evidence refer to the same A2 version. This report approves no lesson reuse, answer, marking point, or batch acceptance.
