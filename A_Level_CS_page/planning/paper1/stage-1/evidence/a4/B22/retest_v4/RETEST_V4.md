# Independent A4 retest — B22 A2 v4

Task: `P1-S1-A4-B22-RETEST-V4`  
Candidate: frozen `B22-A2-v4`  
Recommendation: **PASS for the A4 gate with two MINOR evidence-metadata findings deferred to A2.** No batch acceptance is claimed. A9 review and A0 batch decision remain required.

## Source and integrity checks

I recomputed the SHA-256 and page count for all 12 original 2022 S22/W22 QP and MS PDFs. All match Stage 0 and the frozen candidate handoff/batch records: 12/12 PDFs, 166 pages. The handoff → batch → snapshot chain has no mismatched hashes; its 411, 412 and 413 listed artifact sets reconcile, and the snapshot matches the 413-file candidate set. The dispatch, both A0 errata, A2 v4 pins and the A0 validator/audit pins match. The dispatch contains a BATCH_MANIFEST digest transcription typo; the pinned hash erratum supplies the recomputed candidate digest `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e2c3c928f91858f9d4`.

I rendered original PDF pages directly with Poppler `pdftoppm` at 160 dpi after verifying each PDF hash and page count. The package contains 58 direct source-page renders across the 12 PDFs and 12 contact sheets of the selected pages. The 22-page required QP union and the context/MS dependency pages were checked at full size. This retest does not claim a manual visual inspection of every one of the 166 pages; A9 retains the independent full-batch visual-risk review.

## Corrected marks and QP locators

All seven displayed mark corrections agree with the original printed QP page and the v4 index. I read each bracketed allocation beside its printed label; the paper totals were used only as completeness checks, never to infer a part mark.

| Record | Original source page and label | Printed and indexed mark |
|---|---|---:|
| `9618_s22_qp_11-q4-pci` | S22/11 Q4(c)(i), p. 8 | 5 |
| `9618_s22_qp_12-q2-pc` | S22/12 Q2(c), p. 4 | 1 |
| `9618_s22_qp_12-q4-pb` | S22/12 Q4(b), p. 7 | 6 |
| `9618_s22_qp_12-q4-pc` | S22/12 Q4(c), p. 7 | 2 |
| `9618_w22_qp_12-q8-pcii` | W22/12 Q8(c)(ii), p. 16 | 2 |
| `9618_w22_qp_13-q6-pai` | W22/13 Q6(a)(i), p. 11 | 4 |
| `9618_w22_qp_13-q6-paii` | W22/13 Q6(a)(ii), p. 12 | 2 |

All 12 corrected locators point to the page showing the exact nested child label. For each row, the v4 question/part identifier and page were compared against the directly rendered original PDF page; the corrected page also matches the candidate transcript reference.

| Record | Original source label | v3 page → v4 PDF page |
|---|---|---:|
| `9618_s22_qp_11-q2-pci` | S22/11 Q2(c)(i) | 3 → 5 |
| `9618_s22_qp_11-q2-pcii` | S22/11 Q2(c)(ii) | 3 → 5 |
| `9618_s22_qp_11-q6-pci` | S22/11 Q6(c)(i) | 12 → 14 |
| `9618_s22_qp_11-q6-pcii` | S22/11 Q6(c)(ii) | 12 → 14 |
| `9618_w22_qp_11-q1-pdii` | W22/11 Q1(d)(ii) | 2 → 3 |
| `9618_w22_qp_11-q6-pbi` | W22/11 Q6(b)(i) | 13 → 16 |
| `9618_w22_qp_11-q6-pbii` | W22/11 Q6(b)(ii) | 14 → 16 |
| `9618_w22_qp_12-q8-pci` | W22/12 Q8(c)(i) | 15 → 16 |
| `9618_w22_qp_12-q8-pcii` | W22/12 Q8(c)(ii) | 15 → 16 |
| `9618_w22_qp_13-q6-pbi` | W22/13 Q6(b)(i) | 11 → 12 |
| `9618_w22_qp_13-q6-pbii` | W22/13 Q6(b)(ii) | 12 → 13 |
| `9618_w22_qp_13-q6-pbiii` | W22/13 Q6(b)(iii) | 12 → 13 |

The last row has a **metadata-only discrepancy**. In frozen `CORRECTION_EVIDENCE.json`, record `9618_w22_qp_13-q6-pbiii` has `printed_label: "(b)(iii)"`, `v4_pdf_page_1_based: 13`, and `source_page_label_token_verified: "ii)"`. The original W22/13 QP PDF (SHA-256 `dc038f6877674f438e6f561450965ae0bd1a2186b0f6fa888b645f27e0e2d7c6`), page 13, visibly prints `(iii)` for Q6(b)(iii); the adjacent `(ii)` is also on that page. The original-page render is `renders/direct_source/9618_w22_qp_13-p13.png` (SHA-256 `f000abbe6dfcade51b800ba3e3c2753a95be85bd495a07e0e188282426c35419`), and the candidate transcript `transcripts/9618_w22_qp_13-p13.txt` (SHA-256 `5c458e6ae76f4b2f77e1238d034f2611422f9b2fe94915bb2a13695ef06bb7d0`) explicitly has `(iii)` before the `LSR #2` prompt. The v4 question-index locator and transcript reference both correctly point to PDF page 13 and the `(b)(iii)` record. Thus the source page/record linkage is correct; only the evidence token claim `ii)` is false. A3 v4 independently observed the same distinction.

## Page sets and visual-reference checks

Following the page-set erratum, I kept the sets separate and deduplicated by `(source_id, PDF page)`:

- 19 correction rows occupy **11** unique QP source pages.
- 12 v4-reconciled visual-region targets occupy **12** unique QP source pages; 7 overlap the correction-page set.
- The six QP covers add six pages, so the required union is **22** unique source pages.

The candidate's `CORRECTION_EVIDENCE.counts.unique_direct_source_pages` is **18**. That matches the 18 PNG files in `renders/v4-correction-source/`, but not the 11-page correction-row set or the 22-page erratum union. The 18-file folder contains the 11 correction pages, six covers, and an extra S22/12 QP p. 16; it misses five pages required by the expanded union: S22/11 p. 3; W22/11 pp. 2, 13 and 14; and W22/12 p. 15. A4 directly rendered and inspected all 22 required pages; the mismatch is retained as a MINOR evidence-count/coverage annotation, not a claim that the corpus locator is wrong.

The 88 visual-region IDs are unique, their render paths and hashes resolve, all page references match their source/page, and all `relates_to_ids` resolve without a cross-paper/page link. All 104 marking dependencies resolve to 25 unique MS visual regions on the indexed MS source/page. The 12 changed QP visual-region pages were compared against the original source pages. Candidate status labels remain as recorded: 64 `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW` and 24 `RENDERED_PENDING_INDEPENDENT_REVIEW`; this A4 retest did not mutate the candidate status fields. No stale reference or stale render hash was detected.

## Linkage, totals, and context

Independent sums of the non-null marks in the question/part index equal 75 for each of the six QPs, and each original QP cover visibly states 75. The v4 paper-total checks agree. The hierarchy has 266 rows (52 question roots and 214 part rows), unique IDs, no dangling parent links, 32 unresolved parent containers, and matching unresolved register entries; all have linked children and the unresolved IDs match v3. All 188 marking rows resolve to exactly one question or part. Their 104 visual dependencies are valid. The six whole-question marking rows remain unparted and carry no inferred mark allocation. The 13 context-required part rows retain their source context links on W22/11 QP pp. 6–8 and W22/12 QP pp. 11–14.

As a supplemental sanity check only, I also inspected W22/12 QP p. 2. It prints Q1(a) [5]; the v4 index assigns 5 to that part and leaves the question root unallocated. I found no Q1 [2] discrepancy. This page is outside the mandated 22-page union and is not a finding.

## Findings, alignment, and disposition

There are two MINOR evidence-metadata findings, both owned by A2 for a new immutable version and retest:

1. `CORRECTION_EVIDENCE.locator_corrections[].source_page_label_token_verified` for `9618_w22_qp_13-q6-pbiii` claims `ii)` although the original QP page 13, printed label and transcript show `(iii)`. The locator itself is correct.
2. `CORRECTION_EVIDENCE.counts.unique_direct_source_pages` reports 18, matching the candidate render-folder image count but not the 11 deduplicated correction-record pages. Under the page-set erratum, the expanded correction + changed-region + cover union is 22 pages; the five missing candidate-folder targets and one extra render are enumerated above and in the findings JSON.

I inspected frozen A3 v4 handoff `84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7` and the A0 A3 handoff audit `cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f`. A3 recommends PASS for its own scope with the same two deferred MINOR findings. The A0 audit verifies A3 input pins, candidate snapshot, source PDFs, output hashes and page-set count; it does not decide the A0 batch gate. My independent source review confirms that the token discrepancy is metadata-only and that the page-set counts must be stated by manifest/set. A3 and A4 evidence agree.

On the Stage 1 playbook's Minor-deferral rule, I recommend **PASS for A4 with the two MINOR findings carried to A2 for versioned correction and A4 retest**. There are no open Critical or Major A4 findings. This gate result is not batch acceptance. A9's independent batch review and A0's final decision remain mandatory. Exact pins, outputs, hashes, criterion statuses, page sets and source observations are in [RETEST_FINDINGS_V4.json](./RETEST_FINDINGS_V4.json), [A4_CANDIDATE_REVIEW_CHECKS.json](./A4_CANDIDATE_REVIEW_CHECKS.json) and [SOURCE_RENDER_MANIFEST_V4.json](./SOURCE_RENDER_MANIFEST_V4.json).
