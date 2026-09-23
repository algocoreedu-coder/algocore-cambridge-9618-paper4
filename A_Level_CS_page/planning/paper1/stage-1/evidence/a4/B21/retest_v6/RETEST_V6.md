# Independent A4 retest — B21 A2 v6

Task: `P1-S1-A4-B21-RETEST-V6`  
Candidate handoff SHA-256: `9719395a5daf02b0a3aa37fdb54b4bf28e4eabeb4bc3da76e05d2ddaeff96c33`  
Recommendation: **PASS_A4_ONLY**. This is limited to the A4 source/linkage gate; it does not accept the batch or close A9/A0.

## Result

All frozen input pins match. I independently rehashed all 313 candidate snapshot entries and every one of the 12 original QP/MS source PDFs (154 pages total) against Stage 0 and the candidate batch manifest. No snapshot or source mismatches were found. The A0 v6 candidate audit and validator are pinned PASS, but their status is candidate integrity only.

The v5-to-v6 physical file comparison is **10 changed, 3 added, 0 deleted, 301 unchanged**. This independently includes `SNAPSHOT_MANIFEST.json` itself, which is self-excluded from its own file-entry list. The three added files are the v6 validator, semantic-diff report, and self-check. Nine changed entries appear in the snapshot comparison; the tenth is the changed snapshot manifest. Summary repetitions inside the semantic-diff document are metadata and were not counted as additional files. The only semantic change is removal of the four false Q8 page references from three context records and the derived context index. Question, marking, page, visual, and total-mark indexes remain byte-identical to v5; no files were deleted.

## Corrected Q8 context

Direct inspection of the original PDFs confirms the final context sets: S21/12 Q8 is on QP p. 14; W21/11 Q8 is on p. 15; W21/13 Q8 is on p. 15. The removed pages are not question continuation pages: S21/12 p. 15 is marked `BLANK PAGE`, p. 16 is copyright/blank; W21/11 p. 16 and W21/13 p. 16 are copyright/blank pages. Candidate context records and the index point only to the actual question pages. This resolves the prior A9 v5 context finding for the A4 retest; A9 v6 still needs its own independent review.

## Linkage, hierarchy, marks and visuals

The corpus has 48 question roots, 205 part rows, 208 marking items, 34 explicitly unresolved `PARENT_CONTEXT_ONLY` entries, and 77 visual regions. I checked unique IDs, parent and part hierarchy, root/part QP locators, paired MS source IDs, question/part labels, exact part-level MS locator matches, unresolved allocation rules, page-context dependencies and visual/source references. There are no dangling IDs, hierarchy cycles, unresolved-set mismatches, missing dependencies, or QP/MS pair/locator inconsistencies. All 253 question/part locator pages are included in their corresponding context record.

I independently summed displayed marks from question and part rows and read the cover total from each of the six original QP cover pages. Each paper totals 75. On original W21/12 QP p. 2, Q1 visibly prints `[2]`; the candidate root records 2. Original W21/12 MS p. 3 shows the whole-question row total 2 and its two one-mark conditions (three correct lines from Data Security; two correct lines from Data Integrity). The question-level MS item points to that row, targets only the Q1 root and does not allocate marks to children.

All 31 pages from the previous A4 v5 full-size target inventory were rendered again at 150 dpi, together with the seven Q8 correction/false-reference pages: 38 unique original source pages across 12 PDFs. The included contact sheets were visually checked; W21/12 Q1 QP/MS and key corrected Q8 pages were also opened at the full 150-dpi render. All six QP covers are included. No source identity or relevant visual legibility issue was found.

## Gate limits and evidence

The frozen A3 v6 handoff and its A0 audit were compared. Both specialist reviews agree on candidate identity, all three corrected Q8 context sets, W21/12 Q1 mark 2 with no child allocation, six totals of 75, 34 unresolved parent-context rows, 12 sources/154 pages, and the 10 changed / 3 added / 0 deleted physical delta. A3 recommends `PASS_A3_ONLY`; its A0 audit is `PASS_WITH_NONBLOCKING_MINOR`, not an A0 batch acceptance. The recorded minor (`A3-B21-V6-META-01`) is metadata only: three files with `change_type: added` are redundantly listed in the semantic-diff `changed_existing` array and separately in the exact top-level `added` list. My independent unique physical-file hash comparison confirms 10 changed, 3 added, 0 deleted; repeated summaries were not counted as extra changes. Matching local Stage 0 hashes establishes local file identity, not remote Cambridge authenticity. A9 v6 retest and A0 batch decision remain required.

Evidence files: `A4_RETEST_CHECKS_V6.json`, `A4_LINKAGE_MARK_CONTEXT_V6.json`, `V5_V6_DELTA_AUDIT_V6.json`, `Q8_Q1_SOURCE_OBSERVATIONS_V6.json`, `A4_VISUAL_REVIEW_V6.json`, `SOURCE_RENDER_MANIFEST_V6.json`, `PINNED_INPUT_CHECKS_V6.json`, `A3_V6_COMPARISON.json`, and `A4_FINDINGS_V6.json`. The frozen output manifest and handoff pin all outputs and hashes.
