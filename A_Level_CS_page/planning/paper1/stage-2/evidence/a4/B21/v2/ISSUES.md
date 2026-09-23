# P1-S2-A4-B21 v2 — Issues

Author correction QA found no blocking input, reconciliation, or reference-resolution defect.

## Corrected metadata defect

- B21-v1 reported `required_visual_dependencies_resolve=false` because the author check used the wrong identity field.
- B21-v2 checks `visual_or_table_dependency_ids` against the frozen corpus field `id`.
- Observed 59 distinct references; 59 matched; missing list is empty.
- The six mapping JSONL files and `INPUT_MANIFEST.json` remain byte-identical to B21-v1.

## Open independent-review items

- All 174 scope/requirement assignments await independent A3 review.
- All 208 marking-evidence classifications and provisional patterns await a different A4 reviewer.
- All 59 paired-component relations are candidate suggestions only and await C3b source review by a different author.
- Where Stage 1 captured no normalized marking condition, the map preserves the official MS locator/transcript reference and makes no finer marking claim.

No Stage 1 record was changed, no unresolved row was promoted, and this author does not accept the batch.
