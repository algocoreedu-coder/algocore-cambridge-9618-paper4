# A9 independent final review — Stage 1 Paper 1

Review ID: `P1-S1-A9-FINAL-V2`  
Reviewer role: new A9 independent final reviewer  
Work order: `A9_FINAL_REVIEW_WORK_ORDER_V2.md` at SHA256 `8c3059e35b80922bafaf7c1a78fe169698a395fe808c22a9e1d613684365a024`  
Recommendation: **PASS**

## Gate conclusion

The frozen Stage 1 aggregate satisfies every required final-review check. No frozen input or accepted decision drifted, all 21 independent machine-check groups passed, and no Critical, Major or Minor finding remains. I recommend that A0 accept the Stage 1 gate. This is an A9 recommendation only; it does not itself close the gate.

## Independent evidence

`independent_final_checker.py` was written for this review and does not import or execute A0's validator. Its final run returned `PASS` with zero errors. The frozen A0 result was inspected only after the independent logic was established; its high-level counts agree with the independent result and are not treated as review evidence.

| Check | Independent result |
|---|---:|
| Frozen aggregate/policy/source inputs | 9/9 exact bytes and SHA256 |
| Accepted batch decisions | 5/5 exact SHA256 |
| Aggregate records | 3,604 |
| Typed record counts | 60 source files; 811 pages; 247 questions; 1,025 parts; 927 marking items; 534 visual regions |
| Accepted candidate versions | Exactly B21-A2-v6, B22-A2-v5, B23-A2-v3, B24-A2-v2 and B25-A2-v3 |
| Aggregate gate metadata | Every record `batch_gate=ACCEPTED` |
| Candidate-to-aggregate comparisons | 20/20 canonical multisets equal after removing only the five aggregate metadata fields |
| Original source PDFs | 60/60 rehashed and byte counts matched |
| Referenced evidence files | 1,461 unique transcript/context/render files present |
| Typed IDs | 2,733 checked; no duplicate |
| Displayed-mark totals | 30/30 QPs equal 75 |
| Explicit unresolved records | Exactly 128 |

## Integrity and linkage results

The 60 aggregate source records equal the 2021–2025 QP/MS set in the Stage 0 source manifest. Their source IDs, paths, kinds, years, components, bytes, page counts and SHA256 values agree, and each original PDF was rehashed from disk. The 811 page rows cover every integer page from 1 through each source's declared page count with no duplicate source/page key.

Question and part parents resolve within the correct hierarchy and no cycle exists. Every QP and MS locator has the correct source kind and an in-range page. Each of the 927 marking items has exactly one valid part or question target. All visual relations, visual dependencies, typed dependencies and page-locator dependencies resolve. Every referenced transcript, context and render exists beneath the pinned accepted candidate root.

The aggregate contains no superseded candidate content. For every batch, the page, question/part, marking and visual records match the accepted candidate as canonical multisets after removing exactly `record_type`, `batch_id`, `batch_version`, `batch_root` and `batch_gate`. Candidate handoff, batch-manifest, snapshot (where present), decision and authority pins all match their files.

## Marks and unresolved reconciliation

Summing only explicit `marks_displayed_or_null` values across each QP's question and part records independently produces 75 for all 30 papers.

The unresolved set is exactly:

- B21: 34 parts and 34 marking items.
- B22: 32 parts.
- B23: 28 parts.
- B24 and B25: zero.

The 128 corpus IDs equal the 128 IDs listed in `UNRESOLVED_REGISTER.md`. B24 has exactly 29 and B25 exactly 27 grouping-parent parts. All 56 have status `EXTRACTED`, have a null standalone MS locator, remain outside the unresolved set and have one or more mapped child parts.

## Scope review

`STAGE1_SUMMARY.md`, `CORPUS_MANIFEST.json` and `UNRESOLVED_REGISTER.md` accurately limit the result to a local, provenance-preserving source corpus. They preserve the lack of a new remote-authenticity certification, state that variant equivalence was not assessed, and defer lesson correctness, taxonomy, bilingual translation, app behavior and publication to later gates. No Stage 2 completion, lesson, translation, application, publication or variant-equivalence claim appears in the frozen final packet.

## Findings

No findings.

## Recommendation boundary

Recommendation: `PASS`. A0 remains the authority that may accept and close the Stage 1 gate. This handoff does not modify the corpus or trackers and does not begin Stage 2.
