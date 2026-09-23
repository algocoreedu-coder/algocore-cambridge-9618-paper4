# A4 independent retest — B21 A2 v4

Task: `P1-S1-A4-B21-RETEST-V4`  
Candidate handoff SHA256: `a96fe020eb22b9336d9172c16855e200ae34b98e62f0337bb6c08a3659b2585f`  
Recommendation: **CHANGES_REQUIRED for the A4 gate only.** This is not an A9 or batch-acceptance decision.

## Finding requiring correction

**A4-B21-MARK-01 — Major: displayed QP mark omitted.** Original `9618_w21_qp_12.pdf`, PDF p2, prints Q1 with `[2]`. The candidate row `9618_w21_qp_12-q1` has `marks_displayed_or_null: null`, no child part, and no directly linked marking item. I freshly rendered and inspected this original page; the render is `source_pages/9618_w21_qp_12-p2.png` (render SHA256 `19d5086049c21f4a6d62086252ccba44556cb56512866f1a0a1a857b2efa3354`; source PDF SHA256 `9fa28bfd27645df25197c518aa07573c14ea301a3fe024c23b03c28dadea7b36`). The six QP covers state 75 marks; the indexed displayed leaf marks total 73 for W21/12 and 75 for each other paper. The printed `[2]` and the two-mark discrepancy corroborate the omission, but neither supports assigning those marks to any MS row. This repeats the independent A3 finding `A3-B21-MARK-01`. Keep the mark unallocated until A2 repairs the QP record against its source.

## Retested A4 criteria

- Candidate packet integrity: **PASS**. All 20 frozen dispatch/A2/addendum/A3 input pins and all 305 declared candidate output hashes and byte sizes match. I independently hashed and opened all 12 original PDFs against Stage 0 and the candidate manifest: 154 pages total. The frozen A0 validator is PASS.
- Hierarchy and previous corrections: **PASS for unchanged v3 content**. The 253-row question index is byte-identical to v3; all 207 marking rows retain every field except the 13 new v4 `visual_dependency_refs`. The pinned A4-v3 report independently verified the 205-part hierarchy, 48/48 question-start locators, previous Q7/Q8 mark and locator repairs, and 173 exact MS labels. No prior A4 correction regressed.
- Exact MS links and unresolved parent contexts: **PASS**. The batch still has 173 `EXACT_PRINTED_LABEL` rows and 34 `PARENT_CONTEXT_ONLY` rows. All 34 remain `UNRESOLVED`, with mark/condition and table-row fields null; no parent allocation was inferred.
- New A9-B21-VIS-01 MS dependencies: **PASS**. I inspected 13 distinct item IDs across 12 source-page regions, freshly rendered from the original PDFs. Every item points to the exact matching MS source/page and its referenced visual region/render. S21 MS12 p5 correctly supports two distinct QP items, Q3(a) and Q3(b), without merging their identities.

| MS source page | Linked QP marking item IDs |
|---|---|
| `9618_s21_ms_11` p4 | `9618_s21_qp_11-q2-pa-mi-1` |
| `9618_s21_ms_11` p5 | `9618_s21_qp_11-q3-pb-mi-1` |
| `9618_s21_ms_11` p6 | `9618_s21_qp_11-q3-pc-pi-mi-1` |
| `9618_s21_ms_12` p5 | `9618_s21_qp_12-q3-pa-mi-1` |
| `9618_s21_ms_12` p5 | `9618_s21_qp_12-q3-pb-mi-1` |
| `9618_s21_ms_13` p4 | `9618_s21_qp_13-q2-pa-mi-1` |
| `9618_s21_ms_13` p5 | `9618_s21_qp_13-q3-pb-mi-1` |
| `9618_s21_ms_13` p6 | `9618_s21_qp_13-q3-pc-pi-mi-1` |
| `9618_w21_ms_11` p3 | `9618_w21_qp_11-q1-pa-mi-1` |
| `9618_w21_ms_11` p8 | `9618_w21_qp_11-q6-pb-mi-1` |
| `9618_w21_ms_12` p8 | `9618_w21_qp_12-q7-pa-mi-1` |
| `9618_w21_ms_13` p3 | `9618_w21_qp_13-q1-pa-mi-1` |
| `9618_w21_ms_13` p8 | `9618_w21_qp_13-q6-pb-mi-1` |

- New QP page targets: **PASS**. The 4 target roots/parts resolve to their exact QP page regions: S21/12 Q1(a) p2; W21/12 Q1 p2; W21/12 Q4 p6; W21/12 Q7(a) p12. The W21/12 Q1 region is valid as a page-level visual target even though its displayed mark is missing from the index.
- Render/status review: **PASS for the added 16 pages**. I freshly rendered and inspected 12 MS pages and 4 QP pages; all 16 render hashes are recorded in `RENDER_MANIFEST_V4.json`. All new regions retain `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`, correctly leaving A9 verification open. I also inspected the 12 frozen coverage-sweep contact sheets (154 source pages) at overview scale.

## Integrity and limits

No candidate or prior evidence file was modified. The 16 retest pages are fresh Poppler renders at 150 DPI, with per-page source PDF hash, page count, render hash, byte size, and dimensions in `RENDER_MANIFEST_V4.json`. All 20 pinned files, all 305 candidate packet outputs, and the 12 source PDFs are hash-checked in `RETEST_FINDINGS_V4.json`. Claims about the new 16 targets are based on my own source renders and index cross-checks, not A2 self-report. Prior A4-v3 criteria are reused only where the pinned independent A4-v3 report covers them and the underlying v4 records are preserved byte-for-byte (or, for marking records, unchanged except for the added visual dependencies).

The A4 recommendation is **CHANGES_REQUIRED** until the displayed `[2]` on W21/12 Q1 is represented in a corrected A2 version. No MS allocation is proposed. A3 and A9 retests and A0 batch decision remain separate mandatory gates.
