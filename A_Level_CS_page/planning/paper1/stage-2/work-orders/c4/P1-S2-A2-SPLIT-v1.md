# P1-S2-A2-SPLIT-v1 — C4a split and holdout

Issued 23/09/2026 by A0. Owner: a fresh A2 split curator who did not author equivalence-v2. Reviewer: a fresh independent A9, followed by A0 gate authority.

## Inputs and version

- Exact input manifest: `A_Level_CS_page/planning/paper1/stage-2/work-orders/c4/P1-S2-A2-SPLIT-v1_INPUT_MANIFEST.json`.
- Manifest SHA256: `15a808c7e3f886a2c7f7238d49b58b0fdba063e461f894793332b548320fe4d3`; files: 49.
- Accepted authorities: foundation-v1, aggregate-v2 question bank, equivalence-v2 candidate universe/groups/complement audit, pattern-final-v1 and their A0 gate decisions.
- Rehash all declared files before analysis. Any missing/hash/byte drift is a blocker; record it and stop without substituting another version.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a2/split-v1/`. Do not edit accepted artifacts, trackers, lessons, translations, app files or Stage 3. Do not spawn another agent.

## Required outputs

Freeze exactly these nine files:

1. `SPLIT_POLICY.md`
2. `SPLIT_ASSIGNMENTS.jsonl`
3. `HOLDOUT_DECISION.json`
4. `AUTHOR_ALLOWLIST.json`
5. `LEAKAGE_CHECK.json`
6. `QA.json`
7. `INPUT_MANIFEST.json` — byte-identical copy of the issued manifest
8. `OUTPUT_MANIFEST.json` — pins outputs 1–7; excludes itself and handoff to avoid circular hashes
9. `HANDOFF.json` — pins the output manifest and outputs 1–7

## Contract and acceptance

- Build assignments from all 893 accepted assessment units and all 824 frozen equivalence components. Every unit appears exactly once and every member of a component receives the same split.
- Use explicit split labels with documented meanings. At minimum distinguish `AUTHOR_POOL`, `CONTROLLED_CHECK` and `QUARANTINE` when applicable. Never label the result blind holdout: this shared workspace provides procedural isolation only.
- Keep every `DUPLICATE` or `PARALLEL_EQUIVALENT` relation within one split. Any unresolved relation, quarantined component, or unreviewed likely pair must be `QUARANTINE`; the accepted packet currently declares zero unresolved, but verify rather than assume.
- Recompute all 36,416 candidate dispositions and all 72 positive edges. Reproduce the seeded 586-pair complement audit and its zero observed false negatives. State the limitation that the complement sample does not prove absence of every possible false negative.
- Evaluate the preference for whole 75-mark papers. Choose the controlled-check composition by a deterministic recorded method that balances requirements/patterns and respects component closure; do not select a year by fiat. If whole-paper isolation conflicts with component closure, preserve components and report the resulting extra units/papers.
- `AUTHOR_ALLOWLIST.json` must contain only author-pool unit/component IDs and must explicitly exclude all controlled-check and quarantine units. It is a future Stage 3 control artifact, but do not dispatch it to A5 in this stage.
- `SPLIT_ASSIGNMENTS.jsonl` must provide at least: assessment unit ID, equivalence group ID, split, paper ID, marks, final pattern ID, primary requirement IDs, assignment rationale/method version. References must resolve to accepted inputs.
- `HOLDOUT_DECISION.json` must report the honest label (`CONTROLLED_CHECK` or `MIXED_PRACTICE`), counts by unit/component/paper/marks, whole-paper evaluation, limitations and permitted claims.
- `LEAKAGE_CHECK.json` must show zero detected/reviewed positive, unresolved or unreviewed-likely cross-split relation; include candidate-universe and complement-audit limits. Do not claim exhaustive proof outside the frozen universe/audit.
- `QA.json` must include input rehash, exact output contract, 893/824 coverage, no duplicate/dangling assignment, component atomicity, relation checks, allowlist exclusion, deterministic regeneration and scope-boundary checks.
- No lesson, full question/solution, translation, app edit or Stage 3 output.

## Stop condition

After freezing the exact nine-file handoff, stop. Do not accept C4a, edit trackers, dispatch TRACE, or send data to an author. A9 and A0 own review and gate decisions.
