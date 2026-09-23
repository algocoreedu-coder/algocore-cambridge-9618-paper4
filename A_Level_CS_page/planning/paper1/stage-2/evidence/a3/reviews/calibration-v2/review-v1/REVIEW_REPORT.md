# Independent A3 review - calibration-v2

Review work order: `P1-S2-RVW-CALIBRATION-V2`. Reviewer role: fresh A3, independent of calibration-v1, calibration-v2 and the earlier calibration review. Review date: 22/09/2026.

## Recommendation

`PASS_RECOMMENDED` for the corrected calibration specialist gate. Findings: **0 Critical, 0 Major, 0 Minor**. A0 and the fresh A9 retain acceptance and C1 decisions.

## Input and source integrity

- Rehashed all 29 issued inputs: 29/29 byte counts and SHA256 values match.
- Rehashed the 24 distinct official QP/MS PDFs referenced by the sample against their frozen Stage 1 source records: 24/24 match.
- Resolved all 25 target IDs and their single marking-item IDs against the frozen corpus: 25/25 exact. Every target is an atomic `MS_LINKED` leaf, and no container or unresolved record was promoted.
- Read the 25 target QP pages and 25 corresponding MS pages directly, including tables, matching lines, logic notation, circuit structure, SQL layout and linked marking conditions.

## All-target result

| Calibration | Frozen target | QP | MS | Marks | Independent fit | Result |
|---|---|---|---|---:|---|---|
| CAL-01 | `9618_s21_qp_11-q1-pa-pi` | 9618_s21_qp_11 p2 Q1i | 9618_s21_ms_11 p3 Q1i | 2 | PARTIAL | PASS |
| CAL-02 | `9618_s22_qp_12-q1-pa` | 9618_s22_qp_12 p2 Q1(a) | 9618_s22_ms_12 p3 Q1(a) | 3 | PARTIAL | PASS |
| CAL-03 | `9618_s23_qp_11-q1-pa` | 9618_s23_qp_11 p2 Q1(a) | 9618_s23_ms_11 p3 Q1(a) | 3 | PARTIAL | PASS |
| CAL-04 | `9618_s24_qp_11-q2-pd` | 9618_s24_qp_11 p5 Q2(d) | 9618_s24_ms_11 p4 Q2(d) | 3 | MATCH | PASS |
| CAL-05 | `9618_s25_qp_11-q3-pa` | 9618_s25_qp_11 p6 Q3(a) | 9618_s25_ms_11 p6 Q3(a) | 3 | MATCH | PASS |
| CAL-06 | `9618_s21_qp_11-q3-pa` | 9618_s21_qp_11 p6 Q3a | 9618_s21_ms_11 p5 Q3a | 5 | MATCH | PASS |
| CAL-07 | `9618_s22_qp_11-q5-pa` | 9618_s22_qp_11 p10 Q5(a) | 9618_s22_ms_11 p7 Q5(a) | 4 | MISMATCH | PASS |
| CAL-08 | `9618_s23_qp_13-q7-pc` | 9618_s23_qp_13 p13 Q7(c) | 9618_s23_ms_13 p11 Q7(c) | 2 | MATCH | PASS |
| CAL-09 | `9618_w24_qp_12-q3-pa` | 9618_w24_qp_12 p4 Q3(a) | 9618_w24_ms_12 p4 Q3(a) | 4 | PARTIAL | PASS |
| CAL-10 | `9618_s25_qp_12-q1-pa` | 9618_s25_qp_12 p2 Q1(a) | 9618_s25_ms_12 p4 Q1(a) | 3 | PARTIAL | PASS |
| CAL-11 | `9618_s21_qp_11-q6-pa` | 9618_s21_qp_11 p14 Q6a | 9618_s21_ms_11 p8 Q6a | 1 | MATCH | PASS |
| CAL-12 | `9618_s22_qp_11-q4-pd` | 9618_s22_qp_11 p9 Q4(d) | 9618_s22_ms_11 p6 Q4(d) | 4 | MATCH | PASS |
| CAL-13 | `9618_w23_qp_13-q3-pc` | 9618_w23_qp_13 p6 Q3(c) | 9618_w23_ms_13 p5 Q3(c) | 4 | MATCH | PASS |
| CAL-14 | `9618_s24_qp_11-q5-pa` | 9618_s24_qp_11 p11 Q5(a) | 9618_s24_ms_11 p6 Q5(a) | 4 | MISMATCH | PASS |
| CAL-15 | `9618_w25_qp_12-q2-pa` | 9618_w25_qp_12 p2 Q2(a) | 9618_w25_ms_12 p4 Q2(a) | 4 | MISMATCH | PASS |
| CAL-16 | `9618_w21_qp_11-q5-pc-pi` | 9618_w21_qp_11 p9 Q5i | 9618_w21_ms_11 p7 Q5i | 3 | MATCH | PASS |
| CAL-17 | `9618_s22_qp_11-q4-pci` | 9618_s22_qp_11 p8 Q4(c)(i) | 9618_s22_ms_11 p6 Q4(c)(i) | 5 | MATCH | PASS |
| CAL-18 | `9618_s23_qp_11-q2-pb-piii` | 9618_s23_qp_11 p6 Q2(b)(iii) | 9618_s23_ms_11 p5 Q2(b)(iii) | 4 | MATCH | PASS |
| CAL-19 | `9618_s24_qp_11-q6-pa` | 9618_s24_qp_11 p13 Q6(a) | 9618_s24_ms_11 p7 Q6(a) | 6 | MISMATCH | PASS |
| CAL-20 | `9618_s25_qp_11-q5-pd` | 9618_s25_qp_11 p9 Q5(d) | 9618_s25_ms_11 p8 Q5(d) | 3 | MISMATCH | PASS |
| CAL-21 | `9618_s21_qp_11-q7-pa` | 9618_s21_qp_11 p15 Q7a | 9618_s21_ms_11 p9 Q7a | 3 | MISMATCH | PASS |
| CAL-22 | `9618_s22_qp_11-q2-pci` | 9618_s22_qp_11 p5 Q2(c)(i) | 9618_s22_ms_11 p4 Q2(c)(i) | 4 | MATCH | PASS |
| CAL-23 | `9618_s23_qp_11-q2-pb-pi` | 9618_s23_qp_11 p5 Q2(b)(i) | 9618_s23_ms_11 p4 Q2(b)(i) | 2 | MISMATCH | PASS |
| CAL-24 | `9618_s24_qp_11-q1-pa` | 9618_s24_qp_11 p2 Q1(a) | 9618_s24_ms_11 p3 Q1(a) | 1 | MATCH | PASS |
| CAL-25 | `9618_s25_qp_11-q1-pa` | 9618_s25_qp_11 p2 Q1(a) | 9618_s25_ms_11 p4 Q1(a) | 2 | MATCH | PASS |

Each row passed target identity, QP label/content/page, displayed marks, marking-item identity, MS label/content/page and analyst classification review. Per-row rationale is frozen in `FINDINGS.json`.

## CAL-14 and CAL-15 correction retest

- **CAL-14:** QP `9618_s24_qp_11` p11 Q5(a) asks for client/server device roles and displays 4 marks. MS `9618_s24_ms_11` p6 Q5(a) awards four one-mark server/client identification and role points. The corrected `EXTENDED_TEXT` / `DESCRIBE` / `OFFICIAL_EXACT` / `POINT_BASED` classification and `MISMATCH` family fit are source-correct.
- **CAL-15:** QP `9618_w25_qp_12` p2 Q2(a) asks for four software/copyright/licensing definitions and displays 4 marks. MS `9618_w25_ms_12` p4 Q2(a) gives one mark for each correct row, max 4. The neighbouring Q1 verification matching row is excluded. The corrected `STRUCTURED_TABLE` / `DEFINE` / `OFFICIAL_EXACT` / `POINT_BASED` classification and `MISMATCH` family fit are source-correct.

`S2-C1-A9-001` is therefore **CLOSED_RECOMMENDED** by this specialist retest.

## Independent family-fit recomputation

| Selection family | MATCH | PARTIAL | MISMATCH |
|---|---:|---:|---:|
| BITMAP_SOUND_CALCULATION | 2 | 3 | 0 |
| FETCH_DECODE_EXECUTE_TRACE | 2 | 2 | 1 |
| LOGIC_VISUAL_TABLE | 3 | 0 | 2 |
| SQL_TABLE_OR_CODE | 3 | 0 | 2 |
| VALIDATION_VERIFICATION_SCENARIO | 3 | 0 | 2 |
| **Total** | **13** | **5** | **7** |

The independently recomputed distribution is **13 MATCH / 5 PARTIAL / 7 MISMATCH**, agreeing with calibration-v2. The seven mismatches remain explicit and the frozen sample was not silently replaced.

## Marking and scope boundaries

- Threshold, capped, subset-capped, row-atomic and structural conditions remain grouped at official precision; no listed alternative was converted into an invented marking point.
- Command words remain source observations separate from response-product and cognitive-action labels.
- The artifacts contain no frequency prediction, full-corpus pattern claim, unresolved promotion, lesson, translation, holdout decision or app change.

## Stop boundary

The five review outputs are frozen for A0 handoff. This review does not edit the calibration, accept C1, dispatch C2 or decide the Stage 2 gate.
