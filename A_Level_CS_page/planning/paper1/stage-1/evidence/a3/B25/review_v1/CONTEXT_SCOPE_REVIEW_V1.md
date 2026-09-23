# B25 A3 context and scope review v1

**A3 recommendation: CHANGES_REQUIRED.** This is an A3-only recommendation; A4, A9 and A0 gates remain open. Candidate `B25-A2-v1` is frozen and was not edited.

## Evidence reviewed

- Frozen dispatch, candidate handoff identity, candidate batch manifest and snapshot; all 438 snapshot files were rehashed and byte counts matched.
- Stage 0 source manifest, pinned 2026 syllabus PDF/scope, pilot scope check, Stage 1 schema and extraction policy.
- All 12 original official 2025 QP/MS PDFs: hashes and page counts match Stage 0 (178 pages total); all 12 candidate contact sheets were screened.
- All 51 context JSON records were structurally reconciled against root and child QP locator pages. The 11 context pages with no same-question root/child locator were individually rendered at 2x from their exact source and classified. One is legitimate shared context; ten are false inclusions.
- 77 direct source renders were inspected for boundary/context, command-word, cover-total and MS layout risks. Details, hashes and limits are in `SOURCE_RENDER_EVIDENCE_V1.json` and `SOURCE_RISK_REVIEW_V1.md`.

## Findings

The context records include 10 pages that the source shows belong only to the next question or to a page-turn notice. Each is listed below with the candidate root, PDF page, original source hash, render witness, exact context-file hash, owner and retest requirement in `CONTEXT_SCOPE_FINDINGS_V1.json`. Remove the listed page from that root's `all_context_pages`, `continuation_pages` and `source_evidence` in a new immutable A2 version. Do not alter original PDFs, marks, question locators or next-question content.

| Finding | Candidate question row | False page | Full-page observation | Severity |
|---|---|---:|---|---|
| A3-B25-CONTEXT-01 | `9618_s25_qp_11-q3` | p.7 | The whole page carries Question 4; it contains no continuation of Question 3. | Major |
| A3-B25-CONTEXT-02 | `9618_s25_qp_12-q2` | p.5 | The whole page starts Question 3 and contains no continuation of Question 2. | Major |
| A3-B25-CONTEXT-03 | `9618_s25_qp_12-q5` | p.11 | The whole page starts Question 6 and carries its WAN-driver scenario; Question 5 ends on page 10. | Major |
| A3-B25-CONTEXT-04 | `9618_w25_qp_11-q2` | p.7 | The whole page is Question 3's logic-circuit/truth-table prompt, not Question 2. | Major |
| A3-B25-CONTEXT-05 | `9618_w25_qp_11-q5` | p.11 | The whole page starts Question 6's processor-register prompt; Question 5 is on page 10. | Major |
| A3-B25-CONTEXT-06 | `9618_w25_qp_12-q7` | p.13 | Question 8 starts on this page; Question 7's indexed parts finish on page 12. | Major |
| A3-B25-CONTEXT-07 | `9618_w25_qp_12-q9` | p.15 | Question 10 starts on this page; Question 9's indexed parts are on page 14. | Major |
| A3-B25-CONTEXT-08 | `9618_w25_qp_13-q1` | p.3 | The page begins Question 2; Question 1 is located on page 2. | Major |
| A3-B25-CONTEXT-09 | `9618_w25_qp_13-q3` | p.5 | The page begins Question 4; Question 3's indexed parts are on page 4. | Major |
| A3-B25-CONTEXT-10 | `9618_w25_qp_13-q5` | p.9 | The page is otherwise a turn/page notice stating Question 6 starts on the next page; it is not Question 5 content or a continuation. | Major |

The full-size review also confirmed `9618_s25_qp_11-q8` page 15 is legitimate shared processor-state context even though no indexed child locator is on that page. Retain it. This positive control matters: page removal must be source-semantic, not based only on locator inequality.

## Supporting checks and scope limits

Recomputed counts: 51 roots, 207 parts, 183 marking items, 144 visual regions and 178 source pages. Independently summed explicit indexed marks and the six source cover totals agree at 75 for all six QP variants. The 27 parents with null marks and null MS locators have children, zero direct parent marking items and MS locators on every child; no mark allocation was inferred.

The populated command-word observations were checked against the original QP pages and kept as verbatim short observations, not taxonomy labels. The candidate's 2025 Paper 1 question set was reviewed against the pinned 2026 syllabus boundary of sections 1-8. No standalone out-of-scope objective was flagged; the review makes no objective-coverage, frequency, teaching-coverage, question-correctness, translation or final-taxonomy claim. W25/11 Q10's 3D printer is recorded as an application context, not a separate syllabus objective.

## Gate decision and retest

**CHANGES_REQUIRED — A3 context gate does not pass** until A2 publishes a new pinned candidate version that removes exactly the ten false page records and preserves the valid S25/11 Q8 page 15. A3 retest must re-open each corresponding original full page, verify all three context arrays, preserve question/part locators and source hashes, rerun counts/validator/snapshot checks, and confirm all six QP totals remain unchanged. Then A4, A9 and A0 remain mandatory. See `CONTEXT_SCOPE_FINDINGS_V1.json` for owner and per-finding criteria.
