# Stage 8 schema contracts

## Runtime registry

Required top-level fields: `schema_version`, `source_release_id`, `source_manifest_sha256`, `generated_at`, `counts`, `patterns`. Each pattern has `pattern_id`, bilingual title/purpose, source batch, scenario count and ordered `events`. Each event preserves `event_id`, `example_id`, `trace_id`, `sequence`, `source_event_label`, `event_type`, `code_lines`, before/delta/after, invariant, output, prediction, feedback, targets and locale views.

## Runtime state

`patternId`, `eventIndex`, `locale`, `playing`, `predictionStatus`, `inputRevision`. Reducer actions are `SELECT_PATTERN`, `PREVIOUS`, `NEXT`, `PLAY`, `PAUSE`, `RESET`, `SET_LOCALE`, `SUBMIT_PREDICTION`, `CHANGE_INPUT`. Reset returns to event zero and clears prediction; locale never changes event identity.

## Evidence

Every gate evidence includes `schema_version`, `stage`, `wave`, input release/hash, commands/checks, counts, findings, status, owner, reviewer and timestamp. Browser evidence also records viewport, interaction sequence, expected/observed result and accessibility observation.

## Release

Manifest rows contain relative path, SHA-256 and byte size. Detached verification recomputes every row and manifest hash from a clean process. Release status must keep `required_findings_open: 0` and name the exact production build result.

