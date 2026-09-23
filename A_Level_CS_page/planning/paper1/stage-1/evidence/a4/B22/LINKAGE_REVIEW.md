# A4 independent QP/MS linkage review — B22 (2022)

**Disposition: CHANGES_REQUIRED.** The 2022 source identity baseline matches Stage 0, but the submitted A2 index has incorrect MS page locators, incomplete QP/MS accounting, absent displayed marks and cross-page context, and dangling nested-part parent IDs. A9 should review the corrected, frozen A2 version and retest these findings.

## Inputs reviewed

| Artifact | SHA256 |
|---|---|
| A2 `BATCH_MANIFEST.json` | `89caa46370684bd4d46c68c304150040b91af08826fb04a302421f23e6d9891e` |
| A2 `QUESTION_INDEX.jsonl` | `65d900952ae385e7ae3b49675022147e32ae3eef69474bd4f501119097eb76f6` |
| A2 `MARKING_INDEX.jsonl` | `5c70ced1ff276ee65d92f2dbd62becb13b9416119ef81bd96ee39d66ac73a539` |
| A2 `VISUAL_MANIFEST.json` | `e482b63f2fb708a7f8156a91fa8c1cecf64e436781d98baa6334e3646ea699e7` |
| A3 `CONTEXT_SCOPE_REVIEW.md` | `e4b54330e63c19bab0f04a9c5ecb3a77f2978b4eb632ba0eb599ee2f4f8c277f` |
| A3 `SCOPE_FLAGS.json` | `0d31c1536cabad2ffed188101e88ec30c70af792a466c89872a95a26eaec3581` |
| A3 `SOURCE_RISK_REVIEW.md` | `75bfbf33bfcb6b7a4d239c1339653cc56dd867794669393151bca98f6c6b8341b` |

I recalculated the 12 source-PDF hashes against the Stage 0 source manifest: all 12 IDs, hashes, and page counts match. I reviewed all 46 rows in `MARKING_INDEX.jsonl`, checked their linked part IDs and transcript/page references against the A2 records, and inspected the cited QP/MS pages. A2 records 52 questions and 156 parts; 46 parts have nominal MS links.

## Findings

1. **Incorrect MS page locator on 16 of the 46 nominal links — Major, A2 owner.** In each cited case, the indexed MS page does not contain the linked question/part label; the label occurs on the expected page below. Examples: `9618_s22_qp_11` Q3(a) points to MS PDF p3 although `3(a)` is on p5; `9618_s22_qp_11` Q4(a) points to p4 although `4(a)` is on p5; `9618_w22_qp_12` Q5(a) points to p3 although `5(a)` is on p5. The visual render of `9618_s22_ms_11` PDF p4 shows Q2(b), Q2(c)(i), and Q2(c)(ii), not Q4(a). Full per-record evidence is in `LINKAGE_FINDINGS.json`.

2. **Unlinked parts lack an item-level unresolved disposition — Major, A2 owner.** Of 156 part records, only 46 carry an MS locator; the remaining 110 have `ms_locator_or_null=null`, status `EXTRACTED`, and no specific issue entry in `UNRESOLVED.md`. The policy requires a known MS locator or an unresolved record. A2’s general carry-forward note does not identify which 110 parts remain unmatched.

3. **QP marks are absent despite visible marks — Major, A2 owner.** All 156 part records have `marks_displayed_or_null=null`. I visually checked `9618_s22_qp_13` PDF p14: Q7(a) visibly ends with `[3]`, and Q7(b) with `[2]`; the corresponding indexed part records are both null. This independently confirms A3 finding `A3-B22-R02`. Transcribe only the printed marks and retest question totals where possible.

4. **Cross-page parent context and dependencies are missing — Major, A2 owner.** All 156 part records set `context_required=false` and have empty `dependency_refs`. The source transcripts confirm the A3 examples: `9618_w22_qp_11` Q4 introduces the PHOTOGRAPHS schema/tables on PDF p6 and continues through pp7–8; `9618_w22_qp_12` Q7 introduces the processor instruction set on p10 and continues on pp11–14. The parts in both sequences have no context/dependency links. This independently confirms A3 finding `A3-B22-R01`.

5. **Eight nested-part parent references are dangling — Major, A2 owner.** Each non-null `parent_part_id_or_null` points to a parent ID absent from the 156 part records. The eight records and missing parent IDs are listed in `MARKS_CONTEXT_CHECK.json`. A2 should either index the parent part record when it is a distinct prompt part or correct the relationship to match the source hierarchy.

6. **Nominal MS links are not sufficiently specific for the schema — Major, A2 owner.** Each of the 46 `MARKING_INDEX` rows points to a QP part ID but its `ms_locator` records only the MS source, PDF page, and question; it omits the visible MS part label. All 46 have null mark/condition, null table-row reference, and empty visual dependencies. This does not support checking part-level mapping or table/conditional layout. Keep an item unresolved when its exact MS location or layout-dependent row cannot be established; otherwise record the exact part locator without inferring a mark allocation.

## Review checks

- Source IDs, hashes, and page counts: **PASS**, 12/12 against Stage 0.
- Nominal MS link references: **FAIL**, 16 wrong page locators; the remaining 30 contain the referenced label in the cited page transcript but still omit the locator’s part field.
- Marks and totals: **FAIL**, all 156 part marks are null; visible `[3]` and `[2]` omitted at the cited QP locator.
- Parent context and cross-page dependencies: **FAIL**, 156 false/empty part records; two independent source examples confirmed.
- Nested hierarchy: **FAIL**, eight dangling parent IDs.
- MS visual rows/conditions: **FAIL / not determinable at item level** from current records; all marking records have null row references and empty visual dependencies. Do not treat the question-level MS reference as a checked table row or mark allocation.

**Retest required:** A2 corrects only its B22 folder, freezes the new input hashes, repairs the identified IDs and unresolved accounting, and reruns the structural validator. A4/A9 then retest the corrected locators, marks, context links, and visual rows against the original PDFs. No Stage 1 batch pass is recommended on this version.
