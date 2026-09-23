# A3 context and scope retest — B21 A2-v5

Task: P1-S1-A3-B21-RETEST-V5. Candidate: B21-A2-v5. A3 recommendation: **PASS for the A3 gate only**. A4 v5, A9 retest and A0 batch decision remain mandatory; this is not batch acceptance.

## Frozen basis and integrity

The A0 dispatch matches its frozen SHA256 783a07ee95dde26b66568029719609cae71b3299741a91787028769b2c6e68a3. Candidate HANDOFF_CHECK, BATCH_MANIFEST and SNAPSHOT_MANIFEST match their dispatched SHA256 values. Every one of the 310 snapshot files was rehashed and size-checked. I rechecked all 12 original Paper 1 PDFs against Stage 0: every hash and page count matches; 154 source pages total.

## Q1 correction and six component totals

Original 9618_w21_qp_12.pdf, PDF p2 / printed p2, shows unparted Q1 with [2]. Candidate QUESTION_INDEX.jsonl line 41, root 9618_w21_qp_12-q1, records mark 2 and has no synthetic child. The paired original 9618_w21_ms_12.pdf p3 prints the whole-question Q1 row. Candidate MARKING_INDEX.jsonl line 208 adds 9618_w21_qp_12-q1-mi-1 with exact MS p3/Q1 locator, the printed two-condition text, and dependency on region 9618_w21_ms_12-p3-whole-page on that same source page. Direct-source render witnesses and hashes are in SOURCE_EVIDENCE_MANIFEST_V5.json. No QP-mark allocation to individual MS conditions is inferred.

I independently summed every non-null question-root and part mark in the QP index and compared each sum with the printed total on a full-size original cover. All six are 75: S21 components 11, 12, 13 and W21 components 11, 12, 13. Exact row counts, source hashes and cover-render hashes are recorded in CONTEXT_SCOPE_FINDINGS_V5.json. Cover totals were integrity checks only.

## Visual targets and page review

All 13 distinct MS marking-item IDs across 12 original MS pages, and four QP target IDs, were checked for exact source/page, page-specific region/dependency, context and legibility in direct full-size original renders. The target mappings and render SHA256s are listed in the findings JSON.

All 12 labeled contact sheets covering 154 source pages were screened at reduced scale. Full-size inspection is claimed for exactly 31 PDF pages: 17 A9/Q1 target pages (16 v4 A9 targets plus the paired W21/12 MS p3), eight S21 Q7/Q8 continuity pages (QP11/13 pp.15–16 and MS11/13 pp.9–10), and six QP cover p1 pages. Remaining pages were contact-sheet only; that screen is not full-size semantic validation.

## Q7/Q8 context and unresolved records

For S21 variants 11 and 13, Q7 starts at QP p15 and continues on p16; Q7(b)(iii) [1] and Q7(c) [3] are on p16, followed by a separate Q8 root [3]. Paired MS p9 contains Q7 rows; MS p10 begins Q8. I inspected both QP page pairs and both MS page pairs full-size. W21/12 Q7 remains rooted on p12; Q8 remains rooted p13 with continuation p14–p16. Those candidate records match v4; v5 PAGE_INDEX and CONTEXT_INDEX are byte-identical to v4. W21/12 pages were reduced-scale only in this retest and retain the prior v4 review as baseline.

All 34 UNRESOLVED parent-context MS records remain without mark/condition or table-row allocations. Their reason remains that the parent expands into child records. No marking point was invented.

## Findings, limits and gate

Prior Major A3-B21-MARK-01 is resolved in v5. No A3 source-fidelity, context, syllabus-scope or visual-dependency defect was found in this targeted retest. S1-I14 remains a non-blocking historic provenance limit: the A3-v2-recorded A4-v2 digest remains unrecovered. 2021 papers are historical sources, not proof of 2026 coverage, frequency or variant equivalence. Local source authenticity was not checked against a remote publisher; this retest verifies local hash identity only.

A3 recommendation: **PASS for A3 only**. A4 v5, A9 independent batch review and A0 final batch decision remain open. The frozen handoff stops at A0 integrity verification.
