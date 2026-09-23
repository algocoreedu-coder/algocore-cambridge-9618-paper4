# P1-S2-A4-PATTERN-FINAL-v1 — Rebuild final pattern catalog

Issued after A0 accepted C3b by `C3B_GATE_DECISION_V2.json` SHA256 `ad3af80991b9fa3671cf3f484ba0db4dc5978a1f3603001e8cdae44dcb70f248`. Exact input manifest: `P1-S2-A4-PATTERN-FINAL-v1_INPUT_MANIFEST.json`, 227 files, SHA256 `25711068c20d5f1928822b9c8bc9dc5a69f25257bf697754d566563ab6bdddd5`.

## Owner, write allowlist and independence

Owner: the same A4 author who produced accepted C3a `aggregate-v2`; this owner must remain different from the C3b equivalence author. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a4/pattern-final-v1/`

Do not modify aggregate-v2, equivalence-v2, reviews, A0 evidence, trackers, Stage 0/1, app, lessons or translations.

## Inputs/version

Rehash every manifest entry before work. Any drift is Critical and stops the package. Authoritative dependencies are accepted aggregate-v2 and accepted equivalence-v2 at the exact decision/handoff hashes in the manifest.

## Build contract

- Preserve all 504 accepted provisional pattern identities and every one of 893 occurrence-to-pattern assignments. Equivalence groups classify assessment variants; they do not merge distinct pattern definitions.
- Join every assessment-unit occurrence to exactly one accepted `equivalence-v2` positive group/component. Compute raw occurrence count, distinct official paper count and distinct equivalence-group count directly from frozen rows.
- Recompute examples, boundaries and reverse references from the preserved evidence. Do not invent or delete QP/MS locators, requirements, marks, response products, cognitive actions or source lineage.
- Assign final status deterministically: `ESTABLISHED` requires at least two distinct accepted equivalence groups; a one-group pattern is `SINGLETON` unless an explicit evidence conflict requires `NEEDS_REVIEW`. Any `NEEDS_REVIEW` row must cite a concrete conflict/gap and remains quarantined from claims.
- Preserve singleton and gap information. Report raw, distinct-paper and distinct-equivalence-group counts separately. Historical counts are descriptive only and must not be framed as prediction, likelihood or omission permission.
- Carry the B25 deferred metadata note without altering its frozen packet.

## Exactly nine outputs

1. `PATTERN_CATALOG.json`
2. `PATTERN_EVIDENCE.jsonl`
3. `PATTERN_COUNT_LEDGER.jsonl`
4. `PATTERN_DELTA.json`
5. `GAP_CONFLICT_REPORT.md`
6. `QA.json`
7. `INPUT_MANIFEST.json` — exact copy of the issued manifest
8. `OUTPUT_MANIFEST.json`
9. `HANDOFF.json`

## Acceptance

- Exact nine-file closure; all 227 inputs rehash with zero drift.
- Exactly 504 final patterns and 893 evidence/ledger occurrences; pattern IDs and occurrence assignments are bijective with accepted aggregate-v2.
- Every assessment unit maps to exactly one of 824 accepted equivalence components; no dangling or duplicate reverse reference.
- Catalog raw counts sum to 893 and reproduce evidence; distinct-paper and distinct-equivalence-group counts reproduce independently for every pattern.
- Every `ESTABLISHED` pattern has at least two equivalence groups. Every one-group pattern is `SINGLETON` or has a concrete reviewed `NEEDS_REVIEW` reason.
- Definitions, response products, cognitive actions and requirement sets stay equal to accepted aggregate-v2. No equivalence-driven semantic merge is performed.
- Delta lists every schema/status/count change from provisional and proves zero source-evidence/identity drift.
- QA checks all invariants, singleton/gap disposition, B25 metadata carry and scope boundary.
- No split/holdout, glossary v2, coverage/trace integration, lesson, translation, app or Stage 3 output.

## Reviewer and stop condition

A fresh independent A3 reviews all 504 count/status rows, source identity and deterministic joins; then a fresh A9 review/retest is required before C4. A0 alone accepts the package.

Freeze the exact nine-file handoff and stop. Do not update trackers, dispatch glossary/split/trace or claim C3c PASS.
