# P1-S2-A4-RETEST-TRACE-v2 — Fresh full TRACE-v2 retest

Issued 23/09/2026 by A0. Owner: independent A4 source/assessment/prerequisite specialist, not the A3 author.

## Inputs/write boundary

- Exact manifest: `A_Level_CS_page/planning/paper1/stage-2/work-orders/c4/P1-S2-A4-RETEST-TRACE-v2_INPUT_MANIFEST.json`; SHA256 `e5020ad14b6a073d4f69845116ebc2760664a6fe0bce9364551581b18f205687`; 169 files.
- Author handoff SHA256 `93bd88763ced5e3e573249f7b4aa39c616b694052867f96e03bcb6d8d3d3b5f8`; A0 audit SHA256 `0b004db0489efc6386807e158499e1418ba53862a8131228c53e485c3a9bfeee`.
- Rehash every input. Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a4/reviews/trace-v2/retest-v1/`. Do not edit source/tracker or spawn an agent.
- Freeze exactly six outputs: `RETEST_REPORT.md`, `FINDINGS.json`, `MACHINE_CHECKS.json`, byte-identical `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF.json`.

## Full retest acceptance

- Reconstruct all Stage 2 TRACE populations and every v1 acceptance control; do not limit review to the corrected rows.
- Compare all 893 units to accepted question-bank `primary_requirement_ids` and `supporting_requirement_ids` by role. Require exactly 1,153 PRIMARY and 174 SUPPORTING associations, zero additions/removals, zero primary/supporting overlap and the recorded projection SHA256 `7bd1ff8d4134293562b6ffa2be158139805e6d8f03a18fb4fcc511e366b06cb2`.
- Confirm exact v1→v2 correction: 18 unauthorized PRIMARY links removed across ten units, one duplicate PRIMARY removed for `AU-9618_w25_qp_11-q6-pc`/`REQ-3.1-06-02`, accepted SUPPORTING retained, no other protected role drift.
- Recompute 99 objectives, 205 requirements, 99 LUs, 893 units, 504 patterns, 824 components, 96 terms, 701/192 split, 62 HARD edges, 128 context-only records, 12 no-official, 3 controlled-only, 165 no-book, 3 needs-review, 200 glossary candidate flags and 15 original briefs.
- Verify forward/reverse refs and sole unmapped unit; briefs/source boundaries/controlled isolation/no full question-answer-solution; topological order and exact ten-file closure.
- Review source samples appropriate to the role. PASS requires zero open Critical/Major/Minor findings.

## Stop

Freeze six-file handoff then stop. A0 alone may accept C4b; do not integrate C4c or start lessons, translation, app work or Stage 3.
