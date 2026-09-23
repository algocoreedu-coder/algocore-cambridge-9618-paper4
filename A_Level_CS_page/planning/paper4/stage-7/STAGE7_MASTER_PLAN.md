# Stage 7 master plan

## Objective

Produce deterministic, bilingual, accessible visual/event specifications that let a learner predict a state change, inspect the reasoning, replay it, and connect it to the verified Python trace and marking evidence.

## Immutable inputs

- Stage 0 learning-page and event contract.
- Stage 4 preliminary visual briefs, error-prevention matrix and marking map.
- Stage 5 run-backed trace bundles, event IDs, source locators and obligation inventory.
- Stage 6 signed release and `STAGE7_HANDOFF.json` (required before S7-0).

If Stage 6 is not release-locked, S7-0 records the blocker and stops; it may not copy candidate content as accepted input.

## Work sequence

### S7-0 — Input lock

A0 records Stage 6 release ID/digest, package/event inventory, locale policy, source hashes, write ownership and downstream boundary. A8 independently checks that every source storyboard is from the Stage 6 release, not a candidate artifact.

### S7-A — Event/state contract

A1 defines JSON schemas, event vocabulary, state serialization, identity rules, control semantics, replay/reset behavior, branch and failure representation, static fallback and status distinction (`Stage7_specified` versus `Stage8_UI_verified`). A2 creates representative dynamic and static fixtures.

### S7-B through S7-E — Pattern specifications

A3 maps each Stage 6 storyboard to code lines, state targets, data-structure geometry, labels, prediction checkpoints and output. A4 verifies trace/event parity and source joins. A6 writes VI/EN captions, alt text, keyboard/focus and reduced-motion behavior. A7 reviews cognitive load and accessibility. Each batch owns separate files and exact Stage 5 event IDs.

### S7-F — Final verification

A8 runs clean schema, exact-ID, parity, state-replay and accessibility checks. Lead samples every batch, closes findings, freezes hashes and signs the release manifest and Stage 8 handoff. No visual specification is reported as a working UI test.

## Acceptance denominators

Stage 7 must reconcile all 58 Stage 4 visual briefs, 174 scenarios and 331 proposed event entries, plus every Stage 5 verified trace/event ID and every Stage 6 storyboard. Parent briefs and leaf events remain distinct. Any static/support exception is a schema-valid, Lead-approved disposition.

## Lead gate rule

Each gate records PASS, REWORK or BLOCKED with exact artifact and event locators. Any source hash drift, missing event, duplicate owner, bilingual mismatch, non-deterministic reset or accessibility omission returns the batch for rework.
