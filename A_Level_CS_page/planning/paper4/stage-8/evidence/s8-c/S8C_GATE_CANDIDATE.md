# S8-C gate candidate — bilingual, accessibility and pedagogy UX

## Decision

**PASS_CANDIDATE** for A8 and Lead gate review.

- Seven required A2 resubmissions were independently checked and closed `CLOSED_VERIFIED`.
- Open required findings: **0**.
- Accessibility requirements reviewed: **18/18** pass through runtime evidence, source verification or an explicitly recorded inference.
- Pedagogy checks reviewed: **12/12** pass through runtime and source evidence.
- Production `/paper-4` exposes all **58** patterns; typecheck and production build pass.
- Lead browser session found no console errors and measured `scrollWidth 305 <= viewport 320` at 320 × 800.

## Rework closure

| Finding | Independent verification | Result |
|---|---|---|
| `S8B-A6-001` | `NEXT` always stops play; browser Play advanced one event and paused. | `CLOSED_VERIFIED` |
| `S8B-A7-002` | Bilingual `memory-cue` names the event and gives the event → predict → invariant → output routine. | `CLOSED_VERIFIED` |
| `S8B-A6-003` | Static fallback now includes code, before/change/after and invariant. | `CLOSED_VERIFIED` |
| `S8B-A6-004` | Panels and prediction precede control bar in DOM; 320 px runtime has no page overflow. | `CLOSED_VERIFIED` |
| `S8B-QA-005` | Stable root, action, panel, status, fallback, memory and control-bar selectors exist. | `CLOSED_VERIFIED` |
| `S8B-QA-006` | Progress exposes event ID, zero-based index and ARIA progress values. | `CLOSED_VERIFIED` |
| `S8B-A7-007` | Code and state repeat the same localized step/event text and `data-sync-event`. | `CLOSED_VERIFIED` |

## Runtime evidence accepted

Lead tested the production route and recorded:

- 58 pattern options;
- keyboard/accessibility-tree Next and Previous;
- VI/EN toggle preserving event identity;
- prediction submission and feedback;
- Play advancing one step then pausing;
- Reset, selection of `STACK_PUSH`, and changed-input revision;
- 320 × 800 layout with no horizontal document overflow;
- zero console errors.

The implementation source independently confirms native labelled controls, visible focus, polite live regions, non-colour current/completed/synchrony cues, one-column narrow layout, reduced-motion CSS, forced-colour support and a substantive no-script fallback.

## Pedagogy result

The runtime now maintains one event identity across code, state, trace, output and invariant. Prediction occurs before a further reveal, feedback identifies the expected event and event explanation, and deterministic reset/change-input enable rehearsal. The bilingual memory cue supplies one stable solve/check routine that can be applied across patterns.

## Explicit S8-D spotchecks

These are final environment checks, not open implementation findings:

1. Run a named screen-reader or accessibility-tree announcement check for Next, Reset and change input.
2. Emulate `prefers-reduced-motion: reduce` and compare ordered event IDs with the normal run.
3. Test desktop browser zoom at 200%; the current evidence already includes responsive source review and a stricter 320 CSS-pixel runtime measurement.

Detailed requirement-level evidence and source hashes are recorded in `S8C_INDEPENDENT_RECHECK.json`.

