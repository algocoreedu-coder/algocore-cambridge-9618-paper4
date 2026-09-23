# S6-G Composition Gate Report

- Input: paper4-2026-s5-v1; upstream Stage 5 status is EXECUTION_VERIFIED.
- Scope: integration package and the `exam-workflow` lesson.
- Integration patterns: MAIN_FLOW, OUTPUT_FORMAT, EVIDENCE_RUN; dependency patterns remain owned by their source packages.
- Counts: {"lessons": 1, "blocks": 10, "patterns": 3, "method_entries": 3, "marking_error_entries": 3, "retrieval_items": 18, "visual_storyboards": 3, "parity_blocks": 10, "stage5_obligations": 618, "stage3_assessment_requirements": 4, "dispositions": 0, "trace_count": 0}
- Every integration obligation is joined exactly once; no support-only disposition is needed.
- Retrieval includes six modes per integration pattern: recognise, predict, explain, complete, reconstruct, transfer.
- Visual storyboards specify B8 event sequences and include Previous, Next, Play, Pause, Reset, change_input plus replay/reset and static fallback. Stage 5 has no runtime trace for B8, so execution is not claimed.
- Official mark values are joined by ID only; no marks are recomputed or invented.

## Lead decision

IN_PROGRESS_A8_PENDING — candidate artifacts are ready for independent QA. A8 must verify Stage 5 hash/provenance joins, bilingual parity, specified event IDs, no execution claims, and close order before Lead signs S6-G.

## Recheck

Run python -I -B build_s6g.py from this directory, then inspect S6G_BUILD_SUMMARY.json, COVERAGE_MATRIX.json and DISPOSITIONS.json.
