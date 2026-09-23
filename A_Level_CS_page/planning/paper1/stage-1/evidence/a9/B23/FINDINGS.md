# B23 independent findings - A9

Task P1-S1-A9-B23. Reviewed input: **B23-A2-v2**, frozen with same-version A3/A4 handoffs in `INPUT_MANIFEST.json` and `ADDITIONAL_CHECKS.json`. Date: 21/09/2026. Reviewer: `/root/a9_independent_review`, independent of A2/A3/A4. **Recommendation: CHANGES_REQUIRED. Four Major and one Minor findings remain open.** No corpus/source files were edited.

All source locators below use PDF 1-based pages; cited content pages also display the same printed page number. Paths to A2 artifacts are relative to `stage-1/evidence/a2/B23/`.

## A9-B23-F01 - entire November Q9 absent

- Severity **Major**; owner **A2 via A0**. Affected: completeness, displayed marks, QP/MS linkage.
- Source: `9618_w23_qp_11`, PDF16, Q9(a) and Q9(b); paired `9618_w23_ms_11`, PDF10, exact rows 9(a), 9(b).
- Expected: preserve question 9 and both printed parts, QP marks 2 and 3, MS locators and transcript/context references, with honest review status.
- Observed: `QUESTION_INDEX.jsonl` contains no question 9, no Q9 parts and no record with QP11 locator p16. `MARKING_INDEX.jsonl` therefore has no links to these rows. The source page is extracted/rendered but that is not an indexed question. Declared 46 question starts omit this source question. The paper's indexed displayed marks total 70 instead of its 75; the missing five marks are explicitly printed on Q9, not inferred allocations.
- Evidence: original PDF text, A9 fresh render `renders/w23-qp11-p16.png`, MS10 original text, `CHECK_RESULTS.json` counts/marks. The other five Paper1 QP final pages were checked and are labelled blank; copyright text must not cause a nonblank last page to be skipped.
- Required repair/retest: add the actual source IDs/hierarchy without renumbering existing records; link 9(a)/9(b) to MS10; include them in the p10 MS visual relations. Reconcile all six complete QP question inventories and displayed totals against source, including final pages. Update counts/manifests/issues and obtain specialist retests on the new version.

## A9-B23-F02 - unparted June Q6 has neither its mark nor MS link

- Severity **Major**; owner **A2 via A0**; A0 owns any minimal schema clarification for whole-question marking targets.
- Source: `9618_s23_qp_11`, PDF13, whole Q6; `9618_s23_ms_11`, PDF9, whole row 6.
- Expected: a question without printed lettered parts remains a fully traceable assessable source item. Preserve displayed `[5]` and the known exact MS row, or an explicit unresolved reason if genuinely ambiguous.
- Observed: `9618_s23_qp_11-q6` has `marks_displayed_or_null: null`, status EXTRACTED and no MS linkage. There is no corresponding marking record or unresolved issue. The original QP visibly prints 5; the original MS has row 6 with a maximum of 5. This paper's indexed displayed marks also total 70. Existing marking indexes only cover lettered/nested parts.
- Evidence: A9 fresh render `renders/s23-qp11-p13.png`, original MS9 text; record in `QUESTION_INDEX.jsonl`; absence in `MARKING_INDEX.jsonl` and `UNRESOLVED.md`.
- Required repair/retest: preserve the existing Q6 ID, record its visible mark and exact whole-question MS9 target. If the schema's `part_id` only permits a part, A0 must define a consistent whole-question representation; do not invent a printed '(a)' label. Check all unparted questions, ensure no double-counted parent/child totals and expose the MS9 visual condition/maximum via a region. Reconcile source totals using both whole-question and leaf-part marks.

## A9-B23-F03 - visual graph retains deleted marking-item IDs

- Severity **Major**; owner **A2**. Affected: referential integrity and reliable source navigation.
- Expected: every `VISUAL_MANIFEST.json` `relates_to_ids` target resolves to a current question/part/marking record with a valid source relationship.
- Observed: **10 dangling references** remain after v2 removed false parent marking items. Examples: `9618_s23_ms_11-p04-vr1` still targets `9618_s23_qp_11-q2-pa-mi-01` and `...-q2-pb-mi-01`, both absent from the active marking index. Further stale targets occur on S23 MS11 p6, S23 MS12 p4, S23 MS13 p5, W23 MS11 p10, W23 MS12 p4/p7 and W23 MS13 p6.
- Evidence: exhaustive set comparison in `CHECK_RESULTS.json` → `dangling_visual_relations` lists all 10 region/target pairs. These are the same frozen files A3/A4 retested; the active hash checks all pass, so this is content error, not file drift.
- Required repair/retest: rebuild relations from current source-backed records; preserve valid context parents without recreating false parent marking items. Add current child/marking links where appropriate. Recheck all region targets and marking visual dependencies across the entire batch, not only the ten examples. Require zero dangling targets and verify semantic source/page membership on changed relations.

## A9-B23-F04 - incomplete and contradictory visual-risk coverage

- Severity **Major**; owner **A2**. Affected: extraction policy 2/3/8 and batch visual gate.
- Expected: pages containing answer tables/conditional MS tables have explicit page-level regions and item relations/dependencies. Page metadata distinguishes known risk from rendered-only evidence and remains consistent with the manifest.
- Observed A: **30 MS pages used by current marking records have no visual region** (`CHECK_RESULTS.json` → `ms_pages_with_marking_records_without_region`). A confirmed source example is `9618_s23_ms_11` PDF3: nested definition table under 1(a), working/answer allocation for 1(b)(ii), and a capped explanation-plus-example condition under 1(c)(ii). Yet `PAGE_INDEX.jsonl` line3 marks p3 `RENDERED_NO_RISK_TRIGGER`; no region exists and its five marking records have empty visual dependencies. Existing rendered pixels alone do not satisfy the policy's required index. MS9 for the omitted whole Q6 also needs coverage after F02 is repaired.
- Further confirmed examples within the 30-page list: **S23 MS11 p8 Q5(a)** has a NOT/OR/NAND/XOR circuit and gate-count marking condition; **S23 MS13 p3 Q1(b)** has an eight-row truth table with separate first-four/second-four-row conditions. Both inspected source-derived renders are legible, but neither page has a visual region and both are marked NO_RISK_TRIGGER. This is substantive diagram/table loss from the risk index, not merely treating an ordinary page border as a diagram.
- Observed B: the **three v2 additions still have contradictory page status**: `PAGE_INDEX.jsonl` lines99/124/140 respectively label W23 MS12 p11, W23 QP11 p15 and W23 QP12 p15 `RENDERED_NO_RISK_TRIGGER`. Those same pages were explicitly added as risk regions `...-vr2`; they contain the shaded MS trace table, boxed ACC bits and assembly/trace input tables. The page-index hash is unchanged from v1.
- Evidence: A9 fresh source renders `renders/s23-ms11-p03.png`, `renders/w23-ms12-p11.png`, `renders/w23-qp12-p15.png`; inspected A2 W23 QP11 p15 render; original PDF text; full page/region comparison in check results. There are 110 marking records with empty visual-dependency arrays; this is a screening count, not a claim all 110 have independently confirmed layout defects.
- Required repair/retest: audit all MS answer pages against policy, add missing required regions with exact source/page and valid item relationships, wire relevant marking dependencies and synchronize PAGE_INDEX. Do not mark them independently verified merely because they render. Retest definition/table/maximum/alternative/conditional/shaded-row samples plus all three additions and newly indexed whole-question/MS rows. The 30-page list is a starting inventory, not permission to omit other uncovered source pages.

## A9-B23-F05 - one retained derivative render omits text

- Severity **Minor**; owner **A2**. This is not the cause of CHANGES_REQUIRED by itself.
- Artifact: `renders/9618_w23_qp_13-p13.png`; original `9618_w23_qp_13` PDF13, Q9 opening and (a)(i).
- Expected: a retained reference render accurately shows the source, or is explicitly unusable with a replacement/reference path.
- Observed: the A2 PNG loses the beginning of “A computer system…” and the printed (a)(i) label. A9's fresh Poppler render `renders/w23-qp13-p13.png` shows both fully. Original extracted text and current child record are correct. This page is text-only, marked RENDERED_NO_RISK_TRIGGER rather than visual-verified, which limits the impact and supports Minor severity.
- Required repair/retest: regenerate this derivative from the immutable source or label it unusable and provide an accurate replacement; inspect the affected text/labels at readable scale. Check other outputs from the same rendering path for similar clipping if a common rendering fault is found. Record the corrected derivative hash/provenance. Do not use the old PNG as evidence of visual verification.

## Previously raised findings

The local fixes for A4-B23-F01/F02/F03 and A3 B23-CTX-01/VIS-01/VIS-02 are present: the 28 false parent links are removed, six missing inline children have correct marks/hierarchy/exact MS rows, and Q9(b) p14–15/[4]/MS12 p11 links exist. A9 independently checked those facts; they do not certify complete batch coverage. F03/F04 above identify remaining graph/page-metadata errors beyond the narrow old repairs. B23-SCOPE-02 wording and B23-SCOPE-01 historical-source guardrail remain sound.
