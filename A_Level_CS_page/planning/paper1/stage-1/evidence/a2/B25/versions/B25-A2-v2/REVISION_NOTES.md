# B25-A2-v2 revision notes

This immutable candidate is based on B25-A2-v1. It addresses the exact A3/A4 v1 findings in the frozen A0 dispatch. No app, tracker, lesson, taxonomy, translation, source PDF, transcript, or rendered image was edited.

- Ten false context-page references were removed from `all_context_pages`, `continuation_pages`, and `source_evidence` in the ten question-context records listed in `CORRECTION_DELTA.json`. The source page classifications are recorded there.
- The complete 7(e) answer and its displayed mark value are preserved for `9618_w25_qp_13-q7-pe-mi-1` at `9618_w25_ms_13`, PDF page 12, row `7(e)`; only the next generic table header was removed.
- `9618_s25_qp_11-q8` page 15 and `9618_w25_qp_13-q5` pages 7–8 remain in context as directed by the source-backed reviews.
- Counts, totals, locators, source identities, page counts, and all unaffected records are checked by `CORRECTION_CHECKS.json`; complete file integrity is represented by `SNAPSHOT_MANIFEST.json` and its SHA in `HANDOFF_CHECK.json`.

This is an A2 handoff only. A0 validation, same-version A3/A4 review, A9 review, and A0 acceptance remain open.
