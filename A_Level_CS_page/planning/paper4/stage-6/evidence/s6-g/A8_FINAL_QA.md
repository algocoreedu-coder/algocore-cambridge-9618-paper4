# A8 Final QA — S6-G

- Decision: `PASS_RECOMMENDED` for candidate composition.
- Scope: integration package, one exam-workflow lesson, MAIN_FLOW / OUTPUT_FORMAT / EVIDENCE_RUN.
- Stage 5 obligation joins: 618 exact-once.
- Stage 3 assessment requirements: 4 exact-once.
- Retrieval: 18 items, six modes per pattern.
- Visual: 3 specified storyboards; all required controls and static fallbacks present.
- Bilingual parity: 10 blocks, VI/EN present.
- Official marks: join-only; no values recomputed or invented.
- Runtime boundary: no B8 runtime trace exists; event sequences are explicitly `Stage6_specified` and must be implemented/verified later by Stage 7/8.

## Checks

- summary_result: `PASS`
- exact_once_obligations: `PASS`
- stage3_requirements: `PASS`
- patterns: `PASS`
- method_marking_error_join: `PASS`
- no_synthetic_marks: `PASS`
- retrieval_modes: `PASS`
- visual_controls: `PASS`
- visual_boundary: `PASS`
- bilingual_parity: `PASS`
- ten_blocks: `PASS`
