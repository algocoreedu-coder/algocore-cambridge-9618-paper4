# B21 extraction QA — A2 v6

Status: `SUBMITTED_FOR_INDEPENDENT_V6_RETESTS`. This immutable candidate is copied from hash-pinned B21-A2-v5. It corrects only A9-B21-CTX-01: four false Q8 context references in three records. A0 integrity/schema review, same-version A3/A4 retests, independent A9 retest, and A0 batch decision remain mandatory.

- The v5 source packet and its frozen handoff, batch manifest, and snapshot pins were verified before copying. All 12 original source PDF hashes and page counts match the Stage 0 manifest (154 pages total).
- Removed page references only from `continuation_pages`, `all_context_pages`, and `source_evidence` for `9618_s21_qp_12-q8` (PDF pp. 15–16), `9618_w21_qp_11-q8` (p. 16), and `9618_w21_qp_13-q8` (p. 16). The retained question pages are p. 14, p. 15, and p. 15 respectively.
- The pinned A9 full-size renders show the removed pages labelled `BLANK PAGE`; each PDF p. 16 also carries copyright/imprint text. Exact PDF/render hashes and page locators are recorded in `CORRECTION_EVIDENCE.json`.
- Preserved the v5 W21/12 Q1 mark correction and exact MS linkage without modification. No question/part mark, MS locator, transcript, render, visual region, Q7 context, unresolved row, or primary source was edited.
- All six QP displayed-mark sums remain 75 as verified by the unchanged `MARK_TOTAL_CHECK.json`; these totals are integrity checks only.
- Structural validation is recorded in `A2_VALIDATION_V6.json`; file-level and semantic preservation evidence is recorded in `V5_TO_V6_SEMANTIC_DIFF.json` and `V6_SELF_CHECK.json`.
