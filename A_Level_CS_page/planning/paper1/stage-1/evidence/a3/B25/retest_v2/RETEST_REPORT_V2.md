# B25 A3 v2 Context and Scope Retest

**Review:** P1-S1-A3-B25-RETEST-V2  
**Review date:** 2026-09-21  
**Candidate:** `B25-A2-v2`  
**Recommendation:** `PASS_A3_ONLY`  
**Boundary:** A3 context/scope gate only. A4, A9 and A0 remain required before batch acceptance.

## Frozen identity and source baseline

The dispatched work order SHA256 matches `6570a79d61e6c5d5a649a42d4910039e5bfb0f5af7c814b695d3b4fa7cf8e276`. The candidate packet handoff is `HANDOFF_CHECK.json` (the dispatch's pinned candidate handoff SHA is `e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5`). All candidate and gate inputs pinned by the frozen work order and candidate handoff match. The candidate snapshot has 442 listed entries; all 442 hashes and byte counts match, and the only packet file intentionally omitted from its self-excluding snapshot is `SNAPSHOT_MANIFEST.json`. The pinned A0 candidate audit and validator are PASS for candidate integrity/schema validation; they do not replace this source/context retest.

All 12 original 2025 QP/MS PDFs were rehashed and opened directly. Their hashes and page counts match both the Stage 0 source manifest and the frozen candidate manifest: 12 PDFs, 178 pages. I rendered all 178 pages at 100 dpi into 12 labeled contact sheets and visually screened all 12 sheets. The six QP sheets cover all 51 question roots. I also freshly rendered the ten finding pages and three control pages at 240 dpi from the original pinned QP PDFs and inspected them full size. Render paths, dimensions and SHA256 values are recorded in `SOURCE_RENDER_EVIDENCE_V2.json`.

## Ten A3-v1 findings retested

Each finding is closed by the candidate v2 correction and direct source-page review. In every case the one-page removal matches the pinned v1 finding and v2 correction-delta hashes, and the page is absent from `all_context_pages`, `continuation_pages` and `source_evidence` for the preceding question. Comparing all 51 v1 and v2 context files shows exactly these ten changed files and no undisclosed context mutations.

| Finding | Candidate question | Original QP page | Full-page source boundary |
|---|---|---:|---|
| A3-B25-CONTEXT-01 | `9618_s25_qp_11-q3` | 7 | Question 4 begins |
| A3-B25-CONTEXT-02 | `9618_s25_qp_12-q2` | 5 | Question 3 begins |
| A3-B25-CONTEXT-03 | `9618_s25_qp_12-q5` | 11 | Question 6 and its WAN-driver scenario begin |
| A3-B25-CONTEXT-04 | `9618_w25_qp_11-q2` | 7 | Question 3 logic-circuit prompt begins |
| A3-B25-CONTEXT-05 | `9618_w25_qp_11-q5` | 11 | Question 6 processor-register prompt begins |
| A3-B25-CONTEXT-06 | `9618_w25_qp_12-q7` | 13 | Question 8 begins |
| A3-B25-CONTEXT-07 | `9618_w25_qp_12-q9` | 15 | Question 10 begins |
| A3-B25-CONTEXT-08 | `9618_w25_qp_13-q1` | 3 | Question 2 begins |
| A3-B25-CONTEXT-09 | `9618_w25_qp_13-q3` | 5 | Question 4 begins |
| A3-B25-CONTEXT-10 | `9618_w25_qp_13-q5` | 9 | Navigation notice only: “Question 6 starts on the next page.” |

The legitimate unlocated shared context `9618_s25_qp_11-q8`, page 15, remains present in all three context fields. Its full-size original page contains processor memory/instruction state relevant to Q8. For `9618_w25_qp_13-q5`, pages 7–8 remain as Q5 continuation/context, while page 9 is excluded. Those pages were checked full size; page 9 is a notice, not Q5 content.

The full regression scan covered all 51 context files, their root/part locators, source evidence, transcript presence, source bounds and blank-page boundaries. Every root locator and child-part locator is represented in its context; all evidence pages map to the same source/question; no blank page or unlocated page remains except the verified Q8 p15 shared context above. The 51 context records still cover 51 roots and 207 parts.

## Related structural and scope checks

All 27 previously identified parent grouping labels remain present with null direct marks and null parent MS locators. Each still has the same children, no direct marking item, and explicit MS locators on all children. No MS allocation was inferred for a parent.

For each of the six QP variants, I extracted the cover statement and bracketed mark tokens directly from the original PDF with pypdf, then compared that sum with the indexed numeric marks and packet totals. All three totals equal 75:

| Variant | Direct source mark tokens | Direct source sum | Indexed sum |
|---|---:|---:|---:|
| S25/11 | 28 | 75 | 75 |
| S25/12 | 29 | 75 | 75 |
| S25/13 | 27 | 75 | 75 |
| W25/11 | 36 | 75 | 75 |
| W25/12 | 35 | 75 | 75 |
| W25/13 | 28 | 75 | 75 |

The scope flags still use the pinned Cambridge 9618 2026 syllabus v2 as authority for Paper 1 sections 1–8. The candidate’s scope observations remain `observation_only` or `historical_evidence_only`. The flags do not claim lesson coverage, topic frequency or objective-level coverage, and no Paper 2–4 or 2027–2029 scope is imported. This retest makes no question-correctness, translation-quality, final-taxonomy or course-coverage claim.

The candidate delta contains the ten context changes plus one separate A4 MS excerpt change. I verified mechanically that the MS change is limited to removing the generic `Question / Answer / Marks` suffix from `9618_w25_qp_13-q7-pe-mi-1`, with the locator unchanged. This does not certify the mark-scheme extraction’s correctness; A4 must independently retest its finding.

## Gate decision and remaining work

A3’s context/scope gate is `PASS_A3_ONLY`: all ten A3 context findings are closed by exact candidate changes and original-page evidence; the full 51-context regression is clean; the retained shared-context control is valid; and no Critical or Major finding remains in this A3 review scope.

This is not batch acceptance. A4 must independently retest its context and MS findings, A9 must review the evidence and A3/A4 dispositions, and A0 must make the final batch decision. No candidate, source, tracker or app files were edited by this review.

Machine-readable evidence: `FINDING_DISPOSITIONS_V2.json`, `CONTEXT_AUDIT_MATRIX_V2.json`, `PARENT_GROUPING_RECHECK_V2.json`, `MARK_TOTAL_RECHECK_V2.json`, `SCOPE_REVIEW_V2.json`, `REVISION_DELTA_REVIEW_V2.json`, `PINNED_INPUTS_V2.json` and `SOURCE_RENDER_EVIDENCE_V2.json`.
