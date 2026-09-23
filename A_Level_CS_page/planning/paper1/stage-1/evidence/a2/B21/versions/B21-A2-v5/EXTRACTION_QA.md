# B21 extraction QA — A2 v5

Status: `SUBMITTED_FOR_A0_HANDOFF_AUDIT`. This is a candidate handoff only; A0 integrity audit, independent same-version A3/A4 retests, A9 batch retest, and A0 batch decision remain mandatory.

- v5 starts from the immutable B21-A2-v4 candidate. Before copying, all 15 v4 input hashes and all 305 declared v4 output hashes and byte counts matched. All 12 original source PDF hashes and page counts match the Stage 0 manifest (154 total pages).
- Corrected the existing `9618_w21_qp_12-q1` root's explicit displayed mark from null to `2`, supported by the printed `[2]` on the original QP PDF p2. No child part was added.
- Independently reviewed all 10 pages of the paired original W21/12 MS: page text was checked across p1-p10, the 10-page source contact sheet was visually reviewed, and the full-page p3 render was inspected. Q1 has an exact whole-question row on MS PDF p3: one mark for 3 correct lines only from Data Security and one mark for 2 correct lines only from Data Integrity; the row totals 2. Added only the exact whole-question target with source/page/question locator and existing p3 visual dependency.
- Kept the existing Q1 root status and all page, context, hierarchy, visual-region, render, and other marking records as in v4. Added one marking item; batch now has 208 marking items and three question-level marking items.
- Recomputed all six QP displayed-mark sums. Each matches the original cover's printed 75. The paper total is an integrity check only and was not used to assign Q1's mark.
- Retained all v4 visual corrections, 154 transcripts, 48 contexts, 77 visual regions, and 77 source renders. No public app, lesson, translation, or source PDF was modified.

The exact Q1 correction and evidence pins are recorded in `CORRECTION_EVIDENCE.json`; structural validation is recorded in `A2_VALIDATION_V5.json`.
