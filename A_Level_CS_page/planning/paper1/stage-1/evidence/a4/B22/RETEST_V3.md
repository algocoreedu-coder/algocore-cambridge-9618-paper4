# A4 independent linkage retest — B22 A2-v3

Task: `P1-S1-A4-B22-RETEST-V3`  
Input: frozen `B22-A2-v3`, schema `1.1`  
Result: **CHANGES_REQUIRED.** This is an A4 source-linkage retest only. It is not batch acceptance; A2 correction, same-version A3 alignment and A9 independent review remain required.

## Integrity and scope

I recomputed SHA-256 and opened the page tree for all 12 original QP/MS PDFs. All match both the Stage 0 source manifest and the active A2 manifest: 12/12 files, 166 pages. The declared A2-v3 active artifact hashes and HANDOFF-to-manifest hash chain also match the current files. The schema 1.1 handoff covers 52 questions, 214 printed parts (32 parent containers and 182 leaves), 188 marking items and 88 visual regions. Every marking item has exactly one non-null question or part target that resolves to an indexed record.

The prior A4 findings were retested against the original PDFs. All 16 previously wrong MS pages are now source-correct. The 19 former prefix-only parent labels are now represented as unresolved parent containers with exact linked printed children; all eight prior parent-child relationships are restored. All 32 parent records have an item-specific unresolved entry. W22 Paper 11 Q4 and W22 Paper 12 Q7 now carry their cross-page context dependencies. The false W22 Paper 12 Q1(c) record is absent. Six unparted whole-question marks remain on question targets and link to a whole-question MS row; they have no part locator and no inferred mark allocation.

A3 B22-v3 was submitted during this retest after the initial workspace inventory. Its handoff targets the same frozen A2-v3 hashes and independently reports the same seven displayed-mark discrepancies and 12 preceding-page locator errors. I checked that version alignment and its reported counts; the findings below remain based on my own original-page checks.

## Major source-backed findings

**Displayed marks — CHANGES_REQUIRED.** All six original QP cover pages state a total of 75. Comparing current displayed marks with the adjacent labels in the original pages shows seven discrepancies:

| Original QP locator | Current record value | Printed source mark | Evidence render |
|---|---:|---:|---|
| S22/11 Q4(c)(i), PDF p8 | 4 | 5 | `9618_s22_qp_11-p08.png` |
| S22/12 Q2(c), PDF p4 | 2 | 1 | `9618_s22_qp_12-p04.png` |
| S22/12 Q4(b), PDF p7 | 2 | 6 | `9618_s22_qp_12-p07.png` |
| S22/12 Q4(c), PDF p7 | 1 | 2 | `9618_s22_qp_12-p07.png` |
| W22/12 Q8(c)(ii), PDF p16 | 4 | 2 | `9618_w22_qp_12-p16.png` |
| W22/13 Q6(a)(i), PDF p11 | 2 | 4 | `9618_w22_qp_13-p11.png` |
| W22/13 Q6(a)(ii), PDF p12 | 1 | 2 | `9618_w22_qp_13-p12.png` |

The current indexed sums are S22/11 **74**, S22/12 **71**, S22/13 **75**, W22/11 **75**, W22/12 **77**, and W22/13 **72**, against 75 printed for each paper. These discrepancies block the mark criterion. The 75-mark paper total is not used to infer a part value.

**QP page locators — CHANGES_REQUIRED.** Twelve part records point to the wrong QP PDF page. The source page at right visibly contains the printed label; the current page is preserved below for correction:

| Record | Current QP page | Printed label page | Source label |
|---|---:|---:|---|
| `9618_s22_qp_11-q2-pci` | 3 | 5 | Q2(c)(i) |
| `9618_s22_qp_11-q2-pcii` | 3 | 5 | Q2(c)(ii) |
| `9618_s22_qp_11-q6-pci` | 12 | 14 | Q6(c)(i) |
| `9618_s22_qp_11-q6-pcii` | 12 | 14 | Q6(c)(ii) |
| `9618_w22_qp_11-q1-pdii` | 2 | 3 | Q1(d)(ii) |
| `9618_w22_qp_11-q6-pbi` | 13 | 16 | Q6(b)(i) |
| `9618_w22_qp_11-q6-pbii` | 14 | 16 | Q6(b)(ii) |
| `9618_w22_qp_12-q8-pci` | 15 | 16 | Q8(c)(i) |
| `9618_w22_qp_12-q8-pcii` | 15 | 16 | Q8(c)(ii) |
| `9618_w22_qp_13-q6-pbi` | 11 | 12 | Q6(b)(i) |
| `9618_w22_qp_13-q6-pbii` | 12 | 13 | Q6(b)(ii) |
| `9618_w22_qp_13-q6-pbiii` | 12 | 13 | Q6(b)(iii) |

The exact page images and hashes are included in the findings JSON and under `retest_v3_renders/`.

## Other retested criteria

- **Exact MS links and former prefix cases: PASS.** All 19 former parent-prefix rows are unresolved with null MS locator; their printed children carry exact MS part locators. A text-layer mismatch for S22 MS13 Q5(b)(iii), p7, is a parser extraction exception; the label is visible in the original rendered page.
- **Hierarchy and parent rows: PASS.** All eight prior parent links are restored. The 32 parent containers are explicitly unresolved, with no dangling parent references or cycles.
- **Context: PASS.** W22/11 Q4 has six context-required part rows with dependencies to the source context and QP pp6–8. W22/12 Q7 has seven context-required rows with dependencies to its instruction set and QP pp10–14.
- **Whole-question marks: PASS.** The six question-target links are S22/12 Q7 [2] and Q8 [3], W22/11 Q2 [4] and Q8 [4], W22/12 Q9 [2], and W22/13 Q3 [4]. Their MS references point to the matching whole question with no part field. The original pages were rendered and inspected; no row-level allocation was inferred.
- **Visual metadata: PASS for reference integrity.** All 88 visual assets exist; all 104 marking dependency references resolve to visual regions with the same MS source/page; all region related IDs resolve and no stale reviewer status was found. This checks metadata/reference integrity and targeted renders, not A9’s full-batch visual-risk coverage.
- **False row and manifest note: PASS.** The removed false W22/12 Q1(c) is absent. The active manifest note now accurately describes question- and part-target links and says no allocation was inferred.

## Gate and limits

A4 result is **CHANGES_REQUIRED** because of the seven displayed-mark differences and 12 QP locator errors. A3's same-version v3 review is also **CHANGES_REQUIRED** on these two classes. A2 must correct these records in a new immutable version; A3 must align to that exact version; A4 must retest the changed evidence; A9 remains an independent gate and A0 owns final batch acceptance.

This review does not validate answer content, translations, lesson coverage or mark-scheme scoring. The targeted affected pages and cited high-risk pages were rendered and source-checked, but I did not manually inspect all 166 source pages. Exact input/output/source/render SHA-256 values, criterion statuses and evidence locator records are in [RETEST_FINDINGS_V3.json](./RETEST_FINDINGS_V3.json).
