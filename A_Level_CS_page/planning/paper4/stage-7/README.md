# Stage 7 — Đặc tả visual và các event

Stage 7 converts the accepted Stage 6 learning compositions into implementation-ready visual and event specifications for AlgoCore Fumadocs. It defines one state model shared by code highlight, variables, data-structure diagram, trace and output. It does not implement the React/UI layer; implementation and final integration remain downstream.

## Entry boundary

Stage 7 is blocked until Stage 6 has a signed release manifest, detached verification and Stage 7 handoff. At the time this plan was created Stage 6 was still in progress (`S6-D` and later waves pending), so no S7 production batch may claim acceptance yet. Stage 0–6 inputs remain read-only.

## Required visual contract

Every dynamic specification names a lesson, pattern, example and canonical trace. Each event contains `event_id`, order, code lines, before/delta/after state, invariant or topic criterion, pointers/call frames, output delta, prediction prompt and feedback. Controls must specify `Predict`, `Previous`, `Next`, `Play`, `Pause`, `Reset` and `change_input`; replay, reset and changed-input semantics must be deterministic. Static concepts use a purposeful diagram/comparison/self-check with a static fallback, not decorative animation.

## Waves

| Wave | Scope | Gate |
|---|---|---|
| S7-0 | Input lock and event vocabulary | Lead + A8 PASS |
| S7-A | State engine, event schema and control semantics | A1/A2 PASS |
| S7-B | Foundations, text, searching and sorting | A3/A6/A7 PASS |
| S7-C | Stack, queue and linked-list | A3/A6/A7 PASS |
| S7-D | Recursion, tree, dictionary and hashing | A3/A6/A7 PASS |
| S7-E | OOP, files, support and integration | A3/A6/A7 PASS |
| S7-F | Independent QA, accessibility audit and Lead release | A8 + Lead PASS |

At most two pattern batches are open. A wave cannot advance with required findings or an unverified Stage 6 input.
