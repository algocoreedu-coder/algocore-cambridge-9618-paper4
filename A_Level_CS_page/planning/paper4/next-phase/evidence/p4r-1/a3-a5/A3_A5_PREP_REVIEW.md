# A3/A5 preparation review — P4R-1

Status: **PREPARATION_COMPLETE / EXECUTION_AND_MIGRATION_REQUIRED**

This is a read-only source audit. It does not claim that any displayed Stage 9 Python was executed.

## Python execution disposition

- Lessons inventoried: 26/26.
- Displayed Python artifacts inventoried: 26/26.
- VI/EN code identity: 26/26.
- Exact displayed-code/full-Stage-5-source hash matches: 0/26.
- Rerun required: 26/26.
- Lessons with Stage 5 pattern candidates: 20/26. Candidate proximity is not execution evidence.

Every current displayed snippet has a stable normalized SHA-256 in `PYTHON_EXECUTION_MAP_DRAFT.json`. None equals a complete Stage 5 implementation source hash, and none appears verbatim in those modules. A3 must promote each lesson to a canonical PythonArtifact, bind the displayed bytes to that artifact, then produce an author run and independent rerun for the same hash.

## Visual migration findings

- Patterns/scenarios/events: 58/58, 174/174, 331/331; all IDs are unique at their required level.
- Patterns reusing one trace for normal, boundary and failure: 58/58.
- Patterns reusing one event sequence for all three cases: 58/58.
- Events whose code reference is not joined to versioned Python line IDs: 331/331.
- Event labels outside the locked Stage 7 vocabulary: 328/331.
- Mapped labels with the wrong event_type: 3/3; valid mapped types: 0.
- Empty before/after states: 118/118.
- Planned placeholders before/after: 48/48.
- Template-shaped before/after states: 126/126. These are flagged for review rather than automatically declared invalid.
- Empty/generic/concrete output deltas: 268/56/7.

The three mapped labels are `CAPTURE_SOURCE_STATE`, `TEST_TERMINAL_STATE` and `EMIT_OBSERVABLE`; each is currently typed `assign` instead of `read`, `branch` and `emit`.

## Required next actions

1. A3 creates 26 versioned PythonArtifact records and executable source files from the displayed examples or approved replacements.
2. A3 runs normal, boundary and failure fixtures twice, records raw output/trace and binds all evidence to the exact displayed code hash.
3. A5 creates 174 scenario-specific VisualScenarioTrace records. Shared traces require an explicit equivalence justification and reviewer approval.
4. A5 replaces all 331 code tokens with active_line_ids that resolve against the referenced Python artifact/version.
5. A5 normalizes all 331 event labels/types and replaces empty or generic state/output payloads with execution-bound values.
6. A4 may merge only after A3/A5 self-check, A7 pedagogy review and Lead gate; this preparation draft is not a runtime candidate.

## Reproduction

Run `node check-prep-drafts.mjs`. The checker reads source and draft files, writes nothing, verifies hashes, exact denominators and every recomputed finding.
