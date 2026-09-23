# P1-S2-A4-B21-CORRECTION-v2 — Correct false-negative QA and re-freeze

Issued by A0 on 22/09/2026. The adjacent input manifest pins B21-v1, the frozen corpus and A0 validator.

## Finding

`B21-v1/QA.json` reports `required_visual_dependencies_resolve=false`, but A0 rechecked all 59 distinct `visual_or_table_dependency_ids` against the Stage 1 corpus `id` field and found 59/59 exact matches. The author check used the wrong identity field. A0's structural/manifest validator otherwise returns PASS for v1. This is a metadata/QA defect; do not alter mapping semantics merely to clear it.

## Write allowlist and outputs

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a4/B21/v2/`. Preserve v1 unchanged. Copy the current ten non-handoff packet files as the starting point, correct `QA.json` and `ISSUES.md` to record the exact 59/59 corpus-ID check, regenerate `OUTPUT_MANIFEST.json`, then create `HANDOFF.json`. Deliver exactly the same 11 required filenames as the original B21 work order. Remove temp files.

## Acceptance

- Rehash every issued input before work; drift stops the task.
- All v1 content maps remain byte-identical unless a change is strictly required to repair a newly demonstrated source defect; no such defect is currently authorized.
- `QA.json` must record the identity field used, observed distinct ref count, matched count and missing list.
- A0 validator PASS, exact 174 atomic, 79 containers, 208 marking rows, 68 unresolved, 450 marks and six papers at 75.
- Manifest and handoff hashes are internally consistent; author does not accept the batch.

## Reviewer and stop

The same author may correct this metadata defect. Independent A3, a different A4 and A9 must still review v2. Freeze, hand off and stop; do not review, aggregate or open downstream work.
