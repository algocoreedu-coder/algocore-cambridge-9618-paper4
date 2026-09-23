# Stage 7 schema contracts

## Event record

Required: `event_id`, `example_id`, `trace_id`, `sequence`, `source_event_label`, `event_type`, `code_lines`, `before`, `delta`, `after`, `invariant_or_criterion`, `pointers_or_call_frames`, `output_delta`, `prediction`, `feedback`, `visual_targets`, `locale_views`, `status`. `event_type` is from the controlled vocabulary: `read`, `write`, `assign`, `compare`, `advance`, `swap`, `link`, `unlink`, `call`, `return`, `branch`, `reject`, `emit`. Stage 4/6 labels map through `EVENT_TYPE_MAPPING.json`; unmapped labels fail S7-0.

## State model

Required: `state_id`, `example_id`, typed variables/storage, live range, pointers/call stack, output, invariant/criterion result, serializer version and source/trace hash. All diagram layers, code highlight, variables and output reference the same state ID.

## Controls

`Predict`, `Previous`, `Next`, `Play`, `Pause`, `Reset`, and canonical `change_input` (alias `ChangeInput`) each have accessible name/role/state, keyboard operation, focus return, enabled/disabled rules and deterministic result. `Play` cannot skip events; `Previous` and `Reset` restore exact canonical states; `change_input` selects a matching trace or resets to a declared initial state.

## Accessibility and fallback

Required: VI/EN caption and instructional alt, non-colour encoding, reduced-motion policy preserving checkpoints, static fallback with the same state sequence/criterion, narrow-screen order, local code/table overflow and `Stage7_specified` status. `Stage8_UI_verified` is only set by Stage 8 runtime tests.

## Coverage

`COVERAGE_MATRIX.json` maps every Stage 4 brief/scenario/event and Stage 5 trace event to one visual spec or a reviewed disposition exactly once. Missing, duplicate or unexpected IDs fail the gate. Manifest and detached verifier use the non-recursive close order from Stage 6.
