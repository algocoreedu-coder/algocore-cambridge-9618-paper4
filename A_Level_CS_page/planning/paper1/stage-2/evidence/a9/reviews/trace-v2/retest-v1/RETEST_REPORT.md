# A9 fresh independent retest — TRACE-v2

**Result: PASS.** A9 rehashed all 169 frozen inputs and reconstructed the full TRACE gate independently of the A3 author.

## Frozen packet

- Reviewer input manifest: `3d27a1f3ddbfcaad8aa312157691916bc195fd01844a7ff45f0c4c88b12eb240`; 169/169 files rehashed with zero drift.
- Author handoff: `93bd88763ced5e3e573249f7b4aa39c616b694052867f96e03bcb6d8d3d3b5f8`; exact ten-file closure verified.
- Reviewer `INPUT_MANIFEST.json` is a byte-identical copy of the issued manifest.

## Full-population retest

- Protected roles: all 893 units match accepted `QUESTION_BANK_INDEX` primary/supporting sets exactly; 1,153 PRIMARY, 174 SUPPORTING, zero overlap and recorded projection `7bd1ff8d4134293562b6ffa2be158139805e6d8f03a18fb4fcc511e366b06cb2`.
- Exact correction: 18 unauthorized PRIMARY links were removed across ten units; the duplicate PRIMARY role for `AU-9618_w25_qp_11-q6-pc` → `REQ-3.1-06-02` was removed while its SUPPORTING role remains. No primary additions or supporting changes occurred.
- Reconstructed populations: 99 objectives, 205 atomic requirements, 99 learning units, 893 assessment units, 504 final patterns, 824 equivalence components, 96 glossary terms, 701 AUTHOR_POOL and 192 CONTROLLED_CHECK units, 62 HARD edges and 128 context-only records.
- Full forward/reverse joins resolve. Exactly 892 units map to accepted requirement roles; `AU-9618_s23_qp_12-q5-pd-pii` is the sole explicit source-unmapped unit.
- Gaps reproduce at 12 no-official, 3 controlled-only, 165 no-verified-book-support, 3 needs-review-pattern and 200 glossary-candidate flags. Exactly 15 original briefs reconcile to requirements without an AUTHOR_POOL destination.
- Objective summaries, learning-unit aggregation, topological order, controlled-check isolation, source boundaries, glossary status boundaries and exact author packet closure pass.
- Source review covered the full 893-row accepted lineage and a deterministic 20-unit locator/role sample spanning B21–B25 and both split roles.

## Findings

No open Critical, Major or Minor findings.

## Boundary and recommendation

This review produced no lessons, translations, app changes, full questions/answers/solutions or Stage 3 artifacts. Recommendation: **PASS**. A0 alone may decide C4b.
