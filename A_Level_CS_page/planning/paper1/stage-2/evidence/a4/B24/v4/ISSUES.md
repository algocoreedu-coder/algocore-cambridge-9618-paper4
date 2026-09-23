# B24 v4 correction disposition

Artifact state: `AUTHOR_CORRECTION_COMPLETE_PENDING_INDEPENDENT_A3_CLOSURE_RETEST`.

## Corrected in this candidate

- `B24-A3-001`: `9618_w24_qp_11-q4-pd-pi` is now `PARTIAL`. Expand/collapse code blocks remains the in-scope route under `REQ-5.2-04-03`; auto-indentation/auto-formatting remains source-visible as an accepted 2024 MS route and is explicitly quarantined from 2026 coverage. Singleton pattern `PC-B24-088` records the same boundary.
- `B24-A3-002`: all 64 cited nested atomic rows now include their exact accepted Stage 1 `parent_part_id_or_null` in `context_dependency_ids`. Existing question-root and context-file dependencies are retained. No source-backed exception was required.

## Preserved from v3

- `MARKING_EVIDENCE_MAP.jsonl` is byte-identical to v3, including the `ROW_ATOMIC` foreign-key/table-pair correction for `9618_w24_qp_13-q4-pa`.
- `CONTAINER_MAP.jsonl`, `UNRESOLVED_DISPOSITION.jsonl`, and `VARIANT_CANDIDATES.jsonl` are byte-identical to v3.
- All A4-protected atomic response/marking fields are semantically stable across 170 rows. All protected pattern response/marking fields are stable across 127 patterns; `PC-B24-064` and `PC-B24-143` retain their accepted `ROW_ATOMIC` metadata.

## Review boundary

Independent A3 closure retest is required for both findings. The different-A4 v3 marking PASS is carried forward only as protected-field stability evidence; this correction owner does not independently retest, review, accept, aggregate, or open downstream work.
