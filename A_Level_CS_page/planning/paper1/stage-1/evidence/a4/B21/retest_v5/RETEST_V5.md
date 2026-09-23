# Independent A4 retest — B21 A2 v5

Task: `P1-S1-A4-B21-RETEST-V5`  
Candidate handoff SHA-256: `d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2`  
Recommendation: **PASS for the A4 gate only.** This does not accept the batch or close A9/A0.

## Source-backed Q1 correction

The original `9618_w21_qp_12.pdf` p. 2 visibly prints Question 1 with `[2]`. The existing root `9618_w21_qp_12-q1` now records displayed mark `2`; no child part was added. The original `9618_w21_ms_12.pdf` p. 3 prints whole Question 1 with two one-mark conditions (three correct lines from Data Security; two correct lines from Data Integrity) and row total 2. Candidate item `9618_w21_qp_12-q1-mi-1` points to MS p. 3, targets only the Q1 root, preserves the conditions, and depends on `9618_w21_ms_12-p3-whole-page`. No allocation to child parts or table rows was inferred.

## Retest results

- All 12 original PDFs match Stage 0 hashes and page counts (154 pages total). Candidate integrity passes: all 309 declared handoff outputs and 310 snapshot entries match hashes and byte sizes.
- Independent sums from question/part records match the printed cover total of 75 for all six papers.
- All 13 A9 MS item IDs resolve across 12 pages with exact source/page locators, dependencies and candidate regions. All four QP regions match their expected source/page and `relates_to_ids`. Region status, snapshot asset hashes and legibility pass.
- All 208 marking targets are exclusive and resolve to existing records; 65 visual dependencies resolve to the corresponding MS source/page. The 34 `PARENT_CONTEXT_ONLY` records match the 34 unresolved part records, retain null mark/condition/table-row allocation, and are unchanged from v4.
- Q7/Q8 hierarchy and S21 cross-page context agree with inspected source pages. The semantic v4-to-v5 delta is limited to the existing Q1 root mark and the appended whole-question MS row; remaining changes are manifests, validation and documentation.
- I inspected 31 unique source pages at full size: all 17 Q1/A9 visual target pages, eight S21 Q7/Q8 continuity pages, and six covers. Twelve reduced-scale contact sheets cover all 154 pages. All 17 distinct candidate whole-page region assets were opened at native resolution and are readable.

## Same-version comparison and limits

The A3 v5 handoff and its A0 integrity audit are pinned in `A3_V5_COMPARISON.json`. A3 and A4 agree on the Q1 correction, six totals, visual targets and unresolved context. A3's `PASS_A3_ONLY` recommendation is not used as the A4 decision.

Historic S1-I14 remains open as a non-blocking provenance caveat. Source identity was matched to the local Stage 0 manifest; remote Cambridge authenticity was not independently checked. Contact sheets give overview coverage only. A9 independent review and A0's B21 batch decision remain required.

## Evidence

- `RETEST_FINDINGS_V5.json` — criterion-level evidence and gate recommendation.
- `A4_REVIEW_CHECKS_V5.json` — source, index, target, unresolved and preservation checks.
- `A4_VISUAL_REVIEW_V5.json` and `SOURCE_RENDER_MANIFEST_V5.json` — page coverage and source/render hashes.
- `A3_V5_COMPARISON.json` — frozen same-version A3 handoff and A0 audit.
- `PINNED_INPUT_CHECKS_V5.json`, `V4_TO_V5_DELTA_CHECK.json`, `renders/full_size/`, `contact_sheets/` — integrity, change and visual evidence.
- `HANDOFF_RETEST_V5.json` — frozen input/output/source/render pins for A0 audit.

Candidate and prior evidence were not modified. This recommendation is limited to **A4 v5**.
