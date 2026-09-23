# A9 independent review — TRACE-v1

**Result: CHANGES_REQUIRED.** A9 rehashed all 135 frozen inputs and independently reconstructed the TRACE population, joins, source boundaries, split isolation, topology, gaps and briefs. One Major protected-role finding blocks C4b.

## Frozen inputs

- Issued manifest `855acc7b7297d8c65d4f5ab41fc3a906f1c46fe4b5082fb3f68b01ba8a1de0e0`: 135/135 files rehashed, zero drift.
- Author handoff `c82f4e059fb8db4b4567184ee2845b676bb17ce1955c15740e57b28dc11f1e5d`: exact ten-file closure.
- Reviewer input manifest is byte-identical to the issued copy.

## Reproduced results

A9 independently reproduced 99 objectives, 205 requirements, 99 learning units, 893 assessment units, 504 patterns, 824 equivalence components, 96 glossary terms, 701 AUTHOR_POOL / 192 CONTROLLED_CHECK units, 128 context-only records, 15 original briefs and 62 HARD edges. All QP/MS, marking, pattern, component and split references resolve. Reverse coverage exposes 892 mapped units and the sole explicit unmapped limitation `AU-9618_s23_qp_12-q5-pd-pii`. Gap counts also reproduce: 12 no-official, 3 controlled-only, 165 no-book, 3 needs-review-pattern, 200 glossary-candidate, 7 book-conflict and 4 caution.

## Major finding — A9-TRACE-MAJ-001

TRACE does not preserve the accepted `QUESTION_BANK_INDEX.primary_requirement_ids` / `supporting_requirement_ids` role boundary:

- Accepted source: 1153 PRIMARY and 174 SUPPORTING associations.
- TRACE: 1172 PRIMARY and 174 SUPPORTING associations.
- TRACE adds **18 PRIMARY associations across 10 units** that exist only in `accepted_candidate_primary_requirement_ids`; none is an accepted primary or supporting coverage role.
- TRACE also promotes `AU-9618_w25_qp_11-q6-pc` → `REQ-3.1-06-02` from accepted SUPPORTING to both PRIMARY and SUPPORTING.
- There are no accepted-role removals. Internal reference resolution therefore passes while the protected semantic role still drifts.

The 18 additions affect 10 requirement rows. Their official-unit and author-pool counts, then derived objective/learning-map and pattern/component/glossary links, are overstated. The current 12/3 brief-disposition headline counts happen to remain unchanged after removing these additions, but all derived artifacts still require a clean rebuild.

## Required correction

A3 must issue a new TRACE version that uses `primary_requirement_ids` and `supporting_requirement_ids` as the accepted coverage-role authority. `accepted_candidate_primary_requirement_ids` may remain pattern-partition metadata only. Recompute the entire TRACE packet and obtain fresh independent A4 and A9 retests.

## Boundaries

No lesson, translation, app or Stage 3 work was performed. A9 does not repair the author packet or decide C4b.
