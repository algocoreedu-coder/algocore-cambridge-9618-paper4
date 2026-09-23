# Cross-stage remediation plan — Stage 6 → Stage 7

## Problem

Stage 7 has a valid planning contract but cannot consume Stage 6 because Stage 6 has only reached S6-D. The missing boundary is a signed Stage 6 aggregate release: all package waves, A8 final QA, Lead gate, manifest, detached verifier and `STAGE7_HANDOFF.json`.

## Locked rule

No Stage 7 artifact may be promoted from a Stage 6 candidate. Stage 7 reads only the exact Stage 6 release ID and manifest digest recorded in `S7_INPUT_LOCK.json`. Stage 0–5 remain read-only.

## Recovery waves and owners

| Order | Wave | Lead owner | Deliverable | Stop condition |
|---|---|---|---|---|
| 1 | S6-E | A3/A4/A5/A6 | dictionary + oop composition, A8 QA | any missing source/mark/event join |
| 2 | S6-F | A3/A4/A5/A6 | files + support composition; support dispositions | support pattern fabricated or disposition invalid |
| 3 | S6-G | A3/A4/A5/A6 | integration/exam workflow composition | bilingual or cross-package route mismatch |
| 4 | S6-H | A8 | aggregate exact-ID QA over all Stage 6 artifacts | any duplicate/missing ID or hash drift |
| 5 | S6-REL | A0 Lead | candidate/final QA, manifest, detached verifier, Stage 7 handoff | post-QA edit or non-reproducible digest |
| 6 | S7-0 | A0/A8 | input lock and Stage 6 handoff verification | Stage 6 release absent or hash mismatch |
| 7 | S7-A | A1/A2 | event/state/control schema fixtures | replay/reset/control semantics incomplete |
| 8 | S7-B–E | A3/A4/A6/A7 | pattern event specifications | event/state/trace or accessibility mismatch |
| 9 | S7-F | A8 + A0 | aggregate 58/174/331 reconciliation and release | any required finding |

Maximum two open production batches. Every wave closes with a machine-readable gate and a Lead review before the next wave starts.

## Handoff contract

`STAGE7_HANDOFF.json` must contain: Stage 6 release ID, manifest SHA-256, detached verifier result, source file hashes, final A8 QA hash, package/lesson/event counts, locale policy, Stage 6 status `RELEASE_LOCKED`, Stage 7 read-only input paths and an explicit `Stage7_specified` versus `Stage8_UI_verified` boundary.

## Lead verification commands

1. Run each batch builder and its independent QA from a clean process.
2. Validate exact Stage 6 denominators: 13 packages, 26 lessons, 58 patterns, 4,881 obligations, 107 requirements, 37 destinations.
3. Recompute candidate hashes, run A8 final QA, then create the non-recursive manifest and detached verifier.
4. Hash the handoff against the locked manifest.
5. Run `stage-7/validate_s7_plan.py`, create `S7_INPUT_LOCK.json`, then open S7-A.

## Current state

S6-G, S6-H and S6-REL are complete. Stage 6 release paper4-2026-s6-v1 is RELEASE_LOCKED; the detached verifier is PASS and the manifest contains 121 hash-locked files. The aggregate QA records 4,881 canonical Stage 5 obligations, 34 reviewed documentary dispositions, 505 retained cross-wave alias groups, 107 Stage 3 requirements, 37 planned destinations, 58 patterns, 174 visual scenarios and 331 proposed events. Stage 7 S7-0 has passed: S7_INPUT_LOCK.json matches the Stage 6 manifest and handoff. The next permitted gate is S7-A; Stage 8 remains blocked until Stage 7 release.
