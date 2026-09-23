# B24 A4 v2 independent retest

**Recommendation: PASS_A4_ONLY.** This is the A4 specialist linkage/mark-boundary gate only. It is not batch acceptance; A9-v2 review and A0 audit/decision remain mandatory.

Candidate `B24-A2-v2` remained frozen. The work order and all frozen inputs were verified before review; see `INPUT_PINS_V2.json` and `INPUT_VERIFICATION_V2.json`.

## Results

- **Frozen inputs:** 34/34 pinned inputs pass; 400/400 candidate snapshot entries; 12/12 original PDFs, 156 total pages.
- **Corrected boundaries:** 19/19 directly inspected original mark-scheme row boundaries pass; 0 failures. Generic following-table header suffixes are absent from all 19 corrected rows; all referenced answer/mark tokens, row refs, locators, targets, transcript refs, visual dependencies, and statuses remain valid.
- **All marking links:** 170 total: 5 whole-question and 165 part targets independently revalidated; target, MS/QP locator, transcript, visual dependency, source identity/drift, duplicate ID/target, and residual-header arrays are empty. No prefix-only or cross-question target was detected.
- **Hierarchy and totals:** 243 question/part records (49 roots, 194 parts), 29 parent groups; no synthetic parent mark allocation or parent-link error. All six original QP covers and indexed totals equal 75.
- **Regression:** Contexts, question index, page index, visual regions, and full-page render manifest are unchanged from the pinned v1 review baseline; no non-mechanical drift.
- **Source visuals:** 29 original-source pages rendered at 144 dpi: 17 unique MS pages covering the 19 rows, six QP covers, and six risk-focused QP samples across S24/W24 components 11/12/13. Visual record is in `SOURCE_RENDER_MANIFEST_V2.json`; images and contact sheets are retained in `source_renders/` and `contact_sheets/`.

## Corrected A9 finding rows

All rows below were compared directly with the original MS source page render. Each cited row ends at its expected answer/mark token; the generic next-table header does not belong to the row and is absent from v2.

| Marking record | Original mark scheme page | Row locator | Boundary/link checks | Direct render |
|---|---|---|---|---|
| `9618_s24_qp_12-q2-pd-piii-mi-1` | `9618_s24_ms_12` p.5 | `2(d)(iii)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_s24_ms_12-p005.png` |
| `9618_s24_qp_13-q1-pd-pii-mi-1` | `9618_s24_ms_13` p.3 | `1(d)(ii)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_s24_ms_13-p003.png` |
| `9618_s24_qp_13-q2-pc-mi-1` | `9618_s24_ms_13` p.4 | `2(c)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_s24_ms_13-p004.png` |
| `9618_s24_qp_13-q4-pd-mi-1` | `9618_s24_ms_13` p.6 | `4(d)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_s24_ms_13-p006.png` |
| `9618_s24_qp_13-q5-pd-mi-1` | `9618_s24_ms_13` p.7 | `5(d)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_s24_ms_13-p007.png` |
| `9618_w24_qp_11-q2-pc-mi-1` | `9618_w24_ms_11` p.5 | `2(c)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_11-p005.png` |
| `9618_w24_qp_11-q4-pd-pii-mi-1` | `9618_w24_ms_11` p.8 | `4(d)(ii)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_11-p008.png` |
| `9618_w24_qp_11-q7-pb-mi-1` | `9618_w24_ms_11` p.9 | `7(b)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_11-p009.png` |
| `9618_w24_qp_12-q1-pb-mi-1` | `9618_w24_ms_12` p.3 | `1(b)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_12-p003.png` |
| `9618_w24_qp_12-q2-pc-mi-1` | `9618_w24_ms_12` p.4 | `2(c)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_12-p004.png` |
| `9618_w24_qp_12-q3-pc-mi-1` | `9618_w24_ms_12` p.5 | `3(c)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_12-p005.png` |
| `9618_w24_qp_13-q1-pc-mi-1` | `9618_w24_ms_13` p.3 | `1(c)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_13-p003.png` |
| `9618_w24_qp_13-q4-pe-mi-1` | `9618_w24_ms_13` p.5 | `4(e)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_13-p005.png` |
| `9618_w24_qp_13-q5-pb-mi-1` | `9618_w24_ms_13` p.6 | `5(b)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_13-p006.png` |
| `9618_w24_qp_13-q6-pc-pii-mi-1` | `9618_w24_ms_13` p.7 | `6(c)(ii)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_13-p007.png` |
| `9618_w24_qp_13-q7-pb-mi-1` | `9618_w24_ms_13` p.7 | `7(b)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_13-p007.png` |
| `9618_w24_qp_13-q8-pc-mi-1` | `9618_w24_ms_13` p.8 | `8(c)` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_13-p008.png` |
| `9618_w24_qp_11-q6-mi-1` | `9618_w24_ms_11` p.9 | `6` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_11-p009.png` |
| `9618_w24_qp_13-q3-mi-1` | `9618_w24_ms_13` p.4 | `3` | Pass | `evidence/a4/B24/retest_v2/source_renders/9618_w24_ms_13-p004.png` |

Full per-row assertions and error matrices are in `RETEST_FINDINGS_V2.json`; final disposition is in `FINDING_DISPOSITIONS_V2.json`.

## Limits and next gate

The 151 marking rows outside the 19 corrected items were compared byte-for-byte with the pinned A4-v1-reviewed candidate, while every one of their targets and locators was revalidated. The A4-v1 informational S24 QP13 Q3(b) prompt-start/displayed-mark page nuance is unchanged. The report does not certify content beyond these A4 linkage, locator, hierarchy, boundary and source-visual checks, and does not replace A9-v2 or A0 review.
