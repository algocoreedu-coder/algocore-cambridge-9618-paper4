# P1-S2-A4-PREAGG-v1 — Question bank and provisional pattern integration

Issued by A0 after C2 PASS. The adjacent input manifest freezes the five accepted batch versions and all controlling artifacts.

## Owner and write allowlist

A4 integrator. Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a4/aggregate-v1/`. Do not spawn agents. Do not modify accepted batch packets, trackers, Stage 0/1 or app.

## Outputs

Create exactly:

1. `QUESTION_BANK_INDEX.jsonl`
2. `PATTERN_CATALOG_PROVISIONAL.json`
3. `PATTERN_EVIDENCE.jsonl`
4. `MARKING_EVIDENCE_CATALOG.jsonl`
5. `GAP_CONFLICT_REPORT.md`
6. `QA.json`
7. `INPUT_MANIFEST.json`
8. `OUTPUT_MANIFEST.json`
9. `HANDOFF.json`

## Acceptance

- Rehash every issued input before work; drift is Critical.
- Build an exact union of accepted B21-v4, B22-v4, B23-v4, B24-v4 and B25-v2: 893 unique atomic units, 379 unique containers, 893 scoring links plus 34 B21 context marking rows, 2,250 marks, 30 papers at 75 and 128 unresolved context-only records.
- Preserve per-unit source identity, scope/requirement/context, marking evidence and lineage. No parent/context record becomes scoring.
- Merge occurrence candidates into a provisional catalog by defensible pattern boundary. Every catalog row has canonical definition/features/exclusions, response product, cognitive action, commands observed, marking summary, requirement IDs, official examples and boundary/counterexamples.
- Provide raw occurrence count and distinct-paper count. `distinct_equivalence_group_count` must remain null/`PENDING`; catalog phase must be provisional pre-equivalence. Do not make final ESTABLISHED/SINGLETON decisions based on unreviewed equivalence or use predictive frequency language.
- `PATTERN_EVIDENCE.jsonl` resolves every occurrence to an accepted unit and source locators. `MARKING_EVIDENCE_CATALOG.jsonl` preserves grouped/capped/threshold/row semantics.
- Carry B25 deferred metadata typo in the conflict report and use the correct ledger/QA ID `VC-B25-0041`.
- QA proves union identity, reverse refs, no duplicate unit/marking IDs, count invariants and no unsupported final/equivalence/split claims.

## Reviewer and stop

Independent A3 review and later A9 review are required. Stop after frozen handoff. Do not perform equivalence, split/holdout, final pattern classification, glossary reconciliation, traceability integration or lesson work.
