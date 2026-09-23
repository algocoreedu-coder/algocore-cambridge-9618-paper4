# A3 context and scope retest — B21 A2-v4

Task: `P1-S1-A3-B21-RETEST-V4`  
Candidate: `B21-A2-v4`, corpus schema 1.1  
A3 recommendation: **CHANGES_REQUIRED** for the A3 gate only. The batch remains gated for A4, A9 and A0; no lesson or app content is accepted.

## Frozen version and source basis

The A0 dispatch hash matches its frozen SHA256 `210b572a4fccea57e96fc7d27fc9f0a0326387bbd1b13d03ea38a0652e474279`. Candidate `HANDOFF_CHECK.json`, `BATCH_MANIFEST.json`, and `A0_VALIDATION_V4.json` hashes match the dispatch. A0's v4 integrity audit reports 305/305 candidate outputs, 15/15 candidate inputs and 12/12 source PDF hashes/page counts; the audit and structural validator are not semantic approval. I independently recomputed all 12 original PDF SHA256 digests and page counts: all match Stage 0/v4, 154 pages total.

I generated 12 contact sheets from the originals and screened all 154 pages at reduced scale. I rendered the 16 A9-B21-VIS-01 target pages and eight pages underlying prior Q7/Q8 context/linkage repairs directly from the originals at 2x scale. Hashes and locators are in `SOURCE_EVIDENCE_MANIFEST.json`. No candidate, original PDF, prior reviewer evidence, tracker, or app file was edited.

## A3 disposition

The v4 `QUESTION_INDEX.jsonl` and `CONTEXT_INDEX.jsonl` are byte-identical to reviewed v3; v4 adds visual coverage metadata and MS dependency references. Prior targeted context repairs remain source-consistent: W21 QP11/13 Q1 starts p2 and Q6 starts p11 with context through p13. S21 QP11/13 Q7 spans p15–16 and each separate Q8 starts on p16. Both p16 pages print Q7(b)(iii) `[1]`, Q7(c) `[3]`, then separate Q8 `[3]`. Candidate hierarchy/marks, p16 locators, and MS p9/p10 exact labels agree. Previously flagged S21 QP11/13 Q1/Q3, S21 QP12 Q1 and W21 QP12 Q8 spans are unchanged from reviewed v3. This is a targeted retest, not a claim that every locator or answer was re-audited.

All **13 distinct MS item IDs across 12 pages** and four QP page targets introduced for A9-B21-VIS-01 resolve to a region on the exact source/page. All 16 targets were visually inspected full-size and were legible/source-faithful. The contact sheets cover all 154 pages; no additional obvious omitted risk page was seen at thumbnail scale. This does not claim full-size inspection of the other pages.

## Major A3 finding

Original `9618_w21_qp_12.pdf`, PDF p2 (printed p2), shows unparted Question 1 with `[2]`. Candidate `9618_w21_qp_12-q1` at `QUESTION_INDEX.jsonl` line 41 has `marks_displayed_or_null: null`; there is no child part record. Indexed displayed marks sum to **73**, while the source QP cover states **75**. The two-mark difference equals Q1's printed `[2]`. Reviewer source render: `source_renders/9618_w21_qp_12-p2.png`, SHA256 `37e7e589bbae1bf665617f1336a6c5b4f2d5f39f08f694bc071e49a7428102f1`; original PDF SHA256 `9fa28bfd27645df25197c518aa07573c14ea301a3fe024c23b03c28dadea7b36`. Finding `A3-B21-MARK-01` is Major and blocks A3 PASS. Add the explicit unparted Q1 displayed mark under schema 1.1 and retest; this review makes no MS allocation.

All five other component sums equal 75. S1-I14 remains a non-blocking historical provenance limit: A3-v2's recorded A4-v2 report digest `f6f48f…` is unrecovered. S1-I15's 16 visual targets pass the targeted A3 checks pending A4/A9. The 2026 syllabus v2 remains scope authority; 2021 papers do not establish current teaching coverage, frequency or variant equivalence.

## Gate and limits

A3 gate: **CHANGES_REQUIRED** because of `A3-B21-MARK-01`. After correction, repeat same-version A3 source review. A4 same-version retest, A9 independent batch review and A0 final decision remain mandatory. See `CONTEXT_SCOPE_FINDINGS_V4.json`, `SCOPE_FLAGS_RETEST_V4.json`, and `SOURCE_RISK_RETEST_V4.md` for criterion results and source evidence.
