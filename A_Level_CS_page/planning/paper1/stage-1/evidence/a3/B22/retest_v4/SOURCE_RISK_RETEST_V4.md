# A3 source-risk retest — B22 v4

**Recommendation: PASS for the A3 source/context/scope gate only, with two deferred MINOR evidence-metadata findings.** This is not batch acceptance. A4, A9 and A0 gates remain outstanding.

## Frozen inputs and source review method

The retest targets frozen `B22-A2-v4` (candidate handoff SHA-256 `3a83c90b96ec716e8187ee37c71db1b700f14cc10b4aec6fabc5db57beb0164`) and the 12 original 2022 QP/MS PDFs. The 413-artifact snapshot and all pinned input hashes were recomputed; no mismatch. All source PDFs match the Stage 0 and candidate source hashes and page counts (166 total). A0's structural validator PASS and handoff audit PASS were treated as integrity inputs, not as validation of visual semantics.

A3 inspected full-size 2x original-PDF renders for **99 pages**: 88 pages with designated visual regions, all six QP covers, plus W22/11 QP p3, S22/12 QP p16, W22/11 QP p8, W22/11 QP p19, and W22/11 MS p10. All twelve contact sheets cover the complete 166-page corpus at reduced scale and were inspected only as a broad risk screen. The exact 99 page list, render SHA values and image dimensions, plus the 12 contact sheet SHA values, are in `SOURCE_RENDER_MANIFEST.json`; no claim of full-size inspection is made for the remaining pages. The addendum's complete 22-page set is included in the full-size set.

## Source risk classes and results

| Risk class | Independent evidence | A3 disposition |
|---|---|---|
| Changed displayed marks | Seven changed records inspected at original QP p8, p4, p7, p7, p16, p11 and p12. Values visible as `[5]`, `[1]`, `[6]`, `[2]`, `[2]`, `[4]`, `[2]` respectively. All six indexed QP totals are 75 and match the printed cover totals. | PASS. No MS allocation inferred. |
| Nested-child QP locators | Twelve changed child rows were checked against original pages and corresponding same-page transcripts: S22/11 pp5,14; W22/11 pp3,16; W22/12 p16; W22/13 pp12,13. | PASS for QP page/label/transcript linkage. Separate minor provenance-note error for W22/13 Q6(b)(iii); locator itself passes. |
| Whole-question QP↔MS targets | Six unparted questions retain a null part target and the indexed QP mark agrees with original QP/MS question identity: S22/12 Q7/Q8; W22/11 Q2/Q8; W22/12 Q9; W22/13 Q3. | PASS for A3 source/context check; A4 still owns full QP↔MS linkage review. |
| False W22/12 Q1(c) row | Candidate row `9618_w22_qp_12-q1-pc` remains absent; original W22/12 QP page 2 contains Q1(a), Q1(b)(i), Q1(b)(ii), without Q1(c). | PASS. |
| Cross-page prompt context | W22/11 Q4: six dependent parts, QP pp6–8. W22/12 Q7: seven dependent parts, QP pp10–14. | PASS for the carried context spans. |
| Parent-child hierarchy and unresolved containers | Eight previous hierarchy cases resolve to a live expected parent; zero dangling parent IDs/cycles. Thirty-two item-specific unresolved parent-container rows remain documented and match the unresolved register; their child links remain resolvable. | PASS; retain unresolved status, do not infer parent links. |
| Visual-region source/page evidence | 88 visual regions have full-size renders and resolving related IDs. Candidate visual statuses remain 64 `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW` and 24 `RENDERED_PENDING_INDEPENDENT_REVIEW`. | PASS for A3 source/page/context retest; do not upgrade statuses. A9 remains responsible for independent batch review. |
| Marking visual dependencies | 104 dependency references resolve to a visual region on the same MS source and PDF page as the marking locator. | PASS for referential linkage; not a judgment of every marking point's correctness. |
| Scope boundary | Pinned 2026 v2 syllabus sections 1–8 and Stage 0 scope authorities. No new prompt topic in the v4 metadata delta; no new out-of-scope item found. W22/13 Q1(b), PDF p3 sound-file-size arithmetic remains `SUPPORTING` under §1.2. | PASS with boundary flag. This is not coverage/frequency analysis. |
| Correction evidence label token | Candidate `CORRECTION_EVIDENCE.json`, locator row `9618_w22_qp_13-q6-pbiii`, says the source token is `ii)`. Original W22/13 QP p13 prints `(iii)`, shown by 2x page render and 4x crop. Candidate QI row and locator are correctly labelled `(b)(iii)` at p13. | MINOR `A3-B22-V4-01`, deferred to A2 versioned correction and A4 retest; the QP locator passes. |
| Correction source-page count | Candidate declares `unique_direct_source_pages: 18`. Nineteen correction rows (seven marks + twelve locators) occupy 11 unique source PDF pages; 18 is the number of correction PNG assets, which includes covers and a supplementary page. | MINOR `A3-B22-V4-02`, deferred to A2 versioned correction and A4 retest. No reviewed page was omitted. |
| Review page-set completeness | 11 correction-row pages + 12 changed visual-region pages + six covers, deduplicated on `(source_id, PDF page)`, equals 22 unique pages. A3 rendered/inspected all 22 and all 99 full-size pages enumerated in the manifest; the 12 whole-paper contact sheets independently cover all 166 pages at thumbnail scale. | PASS for A3 required page set. Candidate was not edited. |

## Deferrals and remaining gates

The two Minor findings are provenance metadata only; source-backed QP records, displayed marks, and QP locator rows reviewed here are correct. Each has named owner A2 and a required A4 retest after versioned correction, satisfying the Stage 1 Lead Playbook's deferral conditions. There are no open Critical or Major A3 findings. Recommendation is therefore **PASS for A3 only**. A4 same-version review, A9 independent review of the batch/evidence, and A0 batch decision remain open; A3 does not accept or publish the batch.

`SOURCE_RENDER_MANIFEST.json` is the exhaustive render/page hash register. `CONTEXT_SCOPE_FINDINGS_V4.json` records record-level details, exact page-set identities, and both findings. `HANDOFF_RETEST_V4.json` freezes the input pins and output hashes. The candidate, original sources, app, and top-level trackers were not modified.
