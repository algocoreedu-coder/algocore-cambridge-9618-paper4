# Stage 6 gate checklist

## S6-0 entry

- [ ] Stage 5 status is `EXECUTION_VERIFIED` and release verifier is PASS.
- [ ] Stage 5 manifest and all input hashes are recorded in `S6_INPUT_LOCK.json`.
- [ ] Stage 0 contract, Stage 3 lesson inventory and Stage 4/5 denominators are present.
- [ ] Stage 0–5 are marked read-only; Stage 6 write paths and owners are unique.
- [ ] The 13 `package_id` values are bijective with Stage 3, including `support` and `integration`; no alias package names are used.

## Per-lesson gate

- [ ] Ten learning blocks are present or linked by stable IDs.
- [ ] Question signals, coursebook/syllabus links and source locators are exact.
- [ ] Method steps state trigger, representation, invariant, action, termination/output and check.
- [ ] Worked example matches executable Python, trace and output evidence.
- [ ] Marking atoms and error detection/repair phases map to the relevant step.
- [ ] Official source wording is labelled separately from AlgoCore teaching advice.
- [ ] VI/EN content, UI labels, prompts, feedback and captions have parity.
- [ ] Retrieval has prediction, fading hints, misconception correction and independent reconstruction.
- [ ] Event storyboard uses meaningful state changes, reset and edge/failure coverage.
- [ ] Controls explicitly include Previous/Next/Play/Pause/Reset/change-input; replay, reset and changed-input semantics are deterministic.
- [ ] Visuals have purpose, caption/alt, static fallback and accessibility notes.

## Aggregate release gate

- [ ] All Stage 3 packages and lessons have an accepted skeleton and composition status.
- [ ] All 4,881 Stage 5 obligations join to a lesson block or an explicit Lead-approved disposition.
- [ ] All 107 Stage 3 assessment requirements and 37 planned destinations join to a lesson block with original-assessment authority labels.
- [ ] `COVERAGE_MATRIX.json` is exact-ID, exactly-once; `DISPOSITIONS.json` is schema-valid and hash-linked where present.
- [ ] No unresolved required finding remains in A1–A7 reports.
- [ ] A8 clean independent QA passes after final hashes are produced.
- [ ] Lead samples every package family and signs `GATE_REVIEW.json`.
- [ ] `RELEASE_MANIFEST.json` and `STAGE7_HANDOFF.json` are hash-locked.
- [ ] Stage 7/8 remain blocked until this release is signed.
