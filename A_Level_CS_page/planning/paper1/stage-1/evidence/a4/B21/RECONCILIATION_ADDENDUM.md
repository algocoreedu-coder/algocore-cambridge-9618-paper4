# A4 B21 reconciliation addendum

Artifact version: `1.0.1-addendum.1`  
Reviewer: A4  
Scope: reconcile A3-B21-REV-01 against frozen A2 B21 `0.1.0`; independently verify the W21 component 11/13 Q1 locator/context concern. This addendum supplements `LINKAGE_REVIEW.md`; it does not rewrite it or approve the batch.

## Inputs and integrity

The reviewed A2 indexes and manifest are the frozen files listed below. I also read A3's source-context review and flags, the original W21 component 11/13 QP PDFs, their A2 page transcripts for PDF pages 2 and 11, and the available page 11 renders. SHA-256 values are recorded in `RECONCILIATION_FINDINGS.json`. Both PDF hashes match the source identity in the A2 batch manifest.

## Visual-manifest count and target checks

The A2 `VISUAL_MANIFEST.json` contains 51 regions. Directly counting `relates_to_ids` gives **18 regions with at least one target and 33 with none**. The 18 regions contain **20 target-reference occurrences**. All 20 occurrences resolve to a question-start ID present in `QUESTION_INDEX.jsonl`; each target's `source_qp_id` and indexed page equal the visual region's `source_id` and page. There are no dangling or cross-source/page references by those structural checks.

That result corrects A4 F04's sentence that all 51 region records have empty `relates_to_ids`. It does not establish that every existing relationship is semantically correct or that the manifest covers all visually risky pages. In particular, both W21 component 11 and 13 page 11 regions relate to the corresponding `q1` and `q6` IDs, even though page 11 visibly starts printed Q6. Thus the two `q1` IDs exist and pass the structural reference check, but their relationships to page 11 are semantically wrong because the underlying Q1 index records are themselves misplaced. The manifest also has no region for W21 QP PDF page 2 in either component, where the actual printed Q1 is located.

The second half of A4 F04 is independently confirmed: all 94 `MARKING_INDEX.jsonl` records have empty `visual_dependency_refs` and null `table_row_ref_or_null`. Keep the broader concern open. A9 should correct the aggregate wording and preserve the unresolved visual/table-dependency issue based on the 33 empty regions, the two wrong Q1 associations, missing page-2 regions, and the 94 unconnected marking records. Non-empty values alone do not show adequacy.

## W21 QP11/QP13 Q1 locator and context

The source-linked A2 transcripts for `9618_w21_qp_11` and `9618_w21_qp_13`, PDF page 2, both show printed Question 1: binary-unit equivalences, binary addition and overflow, then hexadecimal-to-denary conversion. The same page transcript on each component records no corresponding question row in the index. By contrast, each `QUESTION_INDEX.jsonl` row `9618_w21_qp_11-q1` / `9618_w21_qp_13-q1` points to PDF page 11 and transcript page 11. Direct inspection of the page 11 renders and transcripts shows that page begins printed Question 6, on errors in fetch-execute-cycle register-transfer notation. A separate `q6` row also points to page 11. The Q1 identities and locators are therefore inconsistent with the original papers in both variants; the actual Q1 has no correctly located question-start row, and no part rows for that Q1 are present in the frozen index.

This also explains the two semantically invalid visual targets described above: `9618_w21_qp_11-p11-whole-page -> 9618_w21_qp_11-q1` and `9618_w21_qp_13-p11-whole-page -> 9618_w21_qp_13-q1`. The `q1` records are syntactically valid IDs but refer to the wrong printed question at that page. A3's `A3-B21-CTX-01` is independently confirmed. The omitted QP page 2 visual regions also support A3's `A3-B21-VIS-01`.

## Findings and disposition

1. **Minor report correction — visual-region count.** A4 F04's “all 51 empty” count is inaccurate. Replace it with 18 non-empty regions, 33 empty regions, and 20 existing target references. Owner: A9 for final review record reconciliation. Retest: parse the frozen JSON and confirm these counts and the corrected wording.
2. **Major corpus defect — W21 Q1 identity, locator, and relationships.** Both component 11/13 Q1 question rows point to page 11/Q6; Q1 page 2 is not correctly indexed, its part rows are absent, and the page 11 visual regions incorrectly include Q1 targets. Owner: A2-B21 via A0. Retest: in a new frozen version, reconcile every printed heading on both originals, locate Q1 at page 2 and Q6 at page 11, add supported Q1 parts/context, remove Q1 from each page 11 visual relation, and add the required page 2 visual regions; A4 then checks the corrected records against the source and A9 independently samples them.
3. **Major risk remains — visual/table dependencies.** Thirty-three regions are unlinked, A2 has no W21 QP page 2 region, and the 94 marking rows have no visual dependencies or table-row refs. Owner: A2-B21 via A0. Retest: inspect risky pages against the Stage 1 policy, connect only source-supported IDs/rows, then A4/A9 verify page coverage and relations. Do not close this concern based solely on the corrected 18/51 count.

**Batch disposition remains CHANGES_REQUIRED.** This addendum establishes no PASS and makes no lesson-reuse approval.
