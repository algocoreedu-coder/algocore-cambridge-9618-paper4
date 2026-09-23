# S7-A self-validation

- Result: PASS_RECOMMENDED
- Boundary: Stage7_specified; no Stage8_UI_verified claim.
- Fixtures: dynamic normal, branch/failure, changed-input, static fallback.
- Controls: Predict, Previous, Next, Play, Pause, Reset, change_input.
- Event vocabulary: 13 canonical types.
- VI/EN: shared event/example/state IDs and paired prediction, feedback, caption and alt fields.
- Determinism: replay uses the same event prefix; Previous and Reset restore canonical state IDs; change_input selects a locked fixture and resets before replay.
- Accessibility: non-colour encoding, reduced-motion checkpoints, keyboard/focus semantics, narrow-screen order and static fallback are specified.
- Verification command: python -I -B validate_s7a.py
