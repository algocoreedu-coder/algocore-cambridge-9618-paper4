# A8 independent runtime QA — Stage 8

**Decision: PASS.** Both required findings were corrected and independently rechecked. S8-D has zero open required findings and may proceed to S8-E.

## Clean-room verification

- `npm run verify:stage8`: PASS end to end.
- Registry: exact 58 patterns, 174 scenarios and 331 unique events; source hashes, deterministic rebuild and mutation rejection pass.
- Reducer: 9 actions and 27 assertions pass.
- Localization: 103 locale-array events, 202 equal-locale source events, 56 Vietnamese overlay entries and zero unresolved English invariant items.
- TypeScript and production Next build pass; `/paper-4` is statically prerendered.

## Browser verification

- `ALGORITHM_REWRITE` event 001 preserves event identity across VI/EN. Vietnamese shows only the reviewed Vietnamese invariant; English shows only the English invariant. No bilingual JSON branch leaks into the panel.
- The input control exposes the three validated registry scenarios: `normal`, `boundary` and `failure`.
- Applying `boundary` resets to event 001, sets revision 1 and stamps the same boundary scenario ID/kind on root plus code, state, trace, output and invariant.
- After creating incorrect prediction feedback, applying `failure` resets to event 001, clears feedback, sets revision 2 and stamps the same failure scenario ID/kind on root plus all five panels. The visible run context names the selected scenario.
- At 320×800, page horizontal overflow is false, control overlap pairs are empty, the scenario selector remains usable and the browser console has no errors.

## Finding disposition

- `S8D-A8-001`: **CLOSED_VERIFIED** — free-form input was replaced by validated scenario selection; revision and scenario identity are synchronized across root and all five panels.
- `S8D-A8-002`: **CLOSED_VERIFIED** — locale arrays render recursively, the Vietnamese overlay covers every unresolved locked-source invariant and the browser shows one active locale only.

The dynamic runtime executes the deterministic event sequences specified by the locked Stage 7 release. It does not claim to be an arbitrary Python interpreter.
