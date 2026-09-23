# A3 source risk review — B22

Input snapshot: A2 B22 `BATCH_MANIFEST.json` SHA256 `89caa46370684bd4d46c68c304150040b91af08826fb04a302421f23e6d9891e`; QUESTION_INDEX SHA256 `65d900952ae385e7ae3b49675022147e32ae3eef69474bd4f501119097eb76f6`; PAGE_INDEX SHA256 `b6cf1d8786e1a03381bf12dc388edf5a6e64fae720c2f10ff25448f60b6a378e`; VISUAL_MANIFEST SHA256 `e482b63f2fb708a7f8156a91fa8c1cecf64e436781d98baa6334e3646ea699e7`.

## Source identity and visual evidence

I independently recalculated SHA256 for all 12 QP/MS PDFs and compared each to the Stage 0 manifest and A2 batch manifest; all IDs, hashes, and page counts match. The batch contains 166 indexed pages. A0's `evidence/a0/B22_VALIDATION.json` reports structural PASS: 12 sources, 166 page records, 208 question-index rows, 46 marking-index rows, and 87 visual regions, with no structural errors. This is not a semantic pass for marks, context, syllabus scope, or visual interpretation.

There are 87 visual regions and all 87 referenced render paths exist. They remain marked as awaiting independent review. I sampled four distinct risks: circuit/truth-table geometry (s22 QP 13 PDF p14), units/table layout in a sound task (w22 QP 13 PDF p3), processor instruction and binary rows (s22 QP 12 PDF p5), and an MS matching table with marks column (w22 MS 12 PDF p3). The sampled renders preserve the visible structures. A9 must still sample the full risk classes, including an unflagged text-only page, under the Stage 1 policy.

## Open findings

| ID | Severity | Source evidence | Observed / expected | Owner and disposition | Retest |
|---|---|---|---|---|---|
| A3-B22-R01 | Major | `9618_w22_qp_11` Q4, PDF pp6–8; `9618_w22_qp_12` Q7, PDF pp10–14. In QUESTION_INDEX, all 156 part records have `context_required=false`; all have empty dependency references. | Both source examples introduce a scenario/table or instruction set before later-page subparts depend on it. The records do not identify those parent contexts or dependencies. Expected: mark the relevant part context as required and link to the parent prompt/table/source pages. | A2 to repair only its own B22 corpus folder; A4 to check context/parent links; A9 to retest the corrected version. Keep the old version frozen and preserve every historical part. | Recount all 156 part records; verify cross-page context cases against QP pages and ensure part-to-parent references exist. Re-run structural validation and A9 independent sample. |
| A3-B22-R02 | Major | `9618_s22_qp_13` Q7, PDF p14: source visibly prints `[3]` for (a) and `[2]` for (b). QUESTION_INDEX records `...-q7-pa` and `...-q7-pb` both store `marks_displayed_or_null=null`. All 156 part records currently have null displayed marks. | Explicit QP marks are visible, but no displayed mark values were transcribed into the part records. Expected: copy each explicit QP mark exactly; leave null only where no mark is displayed or mark boundaries cannot be resolved, and record that issue. | A2 to repair its own B22 corpus folder; A4 to independently verify displayed marks against QP; A9 to retest updated evidence. | Verify all parts with explicit marks, including the cited example, against original QP/render; compare each source question total where possible; rerun validator and A9 review. |

These are semantic/source-record defects despite the structural validator PASS. Under the Playbook gate, both Major findings block B22 PASS until closed and independently retested.

## Scope boundary cross-reference

`A3-B22-S01` is recorded in `SCOPE_FLAGS.json`: W22 QP 13 Q1(b), PDF p3, calculates sound file size. Syllabus 2026 §1.2 Sound, PDF/in p15, specifies the impact of sampling rate/resolution on file size and accuracy but does not explicitly list the calculation task. Preserve it as a historical item; the Lead owns its supporting-practice label. This is a boundary flag, not a definitive out-of-scope finding.
