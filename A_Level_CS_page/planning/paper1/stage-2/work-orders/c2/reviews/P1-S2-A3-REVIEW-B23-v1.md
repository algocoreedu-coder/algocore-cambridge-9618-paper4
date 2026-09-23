# P1-S2-A3-REVIEW-B23-v1 — Independent scope/objective/context review

Issued by A0 on 22/09/2026. Review target: A4 B23 mapping artifact `v1`. The adjacent input manifest is authoritative and every input must be rehashed before review.

## Inputs and version

Read `P1-S2-A3-REVIEW-B23-v1_INPUT_MANIFEST.json`, the frozen B23 author packet, B23 subset manifest, accepted `foundation-v1`, Stage 2 protocol/schema, and the exact Stage 1 QP/MS/context/visual records reached through the frozen packet. Review all 178 atomic mappings, with direct source inspection for ambiguous, partial, out-of-scope, table-dependent, visual-dependent, multi-objective and context-dependent rows.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a3/reviews/B23/v1/`. Do not edit the author packet, C1 artifacts, Stage 0/1, trackers, aggregate outputs or app. Do not spawn agents.

## Required outputs

Create exactly `REVIEW_REPORT.md`, `MACHINE_CHECKS.json`, `FINDINGS.jsonl`, `INPUT_MANIFEST.json`, `HANDOFF.json`. Empty findings must still be represented by a valid empty JSONL file. Pin all review outputs in the handoff without circular hashes.

## Acceptance criteria

- Rehash all issued inputs; any drift is Critical and ends the review.
- Reconcile the exact 178 atomic targets, 74 containers, 178 scoring links, 450 marks and 28 unresolved context-only rows with the B23 subset.
- Every atomic row has a defensible 2026 scope status and primary requirement mapping; all requirement IDs resolve to accepted foundation-v1.
- Read the prompt, needed parent context and MS evidence. Inspect referenced table/visual evidence whenever classification depends on layout; do not accept keyword-only mapping or a null command field as proof of no command word.
- Check context dependencies, response products, multi-objective boundaries, quarantine rationales and locator/source consistency. No unresolved record may be promoted.
- Classify findings as Critical, Major or Minor with exact IDs/evidence. `PASS` requires zero Critical and zero Major; otherwise return `CHANGES_REQUIRED`.

## Reviewer and stop condition

Reviewer role: A3 independent specialist; reviewer must not be the B23 author. A later different A4 reviewer will assess marking/pattern semantics and A9 will perform risk/final review. Stop after frozen handoff. Do not repair, accept, aggregate or open downstream work.
