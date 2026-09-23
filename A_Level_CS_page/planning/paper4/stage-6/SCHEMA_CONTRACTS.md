# Stage 6 schema contracts

All contracts are keyed by `content_id`, `locale`, and `version`. Locale views share the same example, pattern, marking, error and event IDs.

## Lesson block

Required fields: `block_id`, `block_kind` (one of the ten contract slots), `package_id`, `lesson_id`, `pattern_ids`, `source_refs`, `body.vi`, `body.en`, `status`, `author`, `reviewer`. Source refs contain exact locator and authority (`QP`, `MS`, `coursebook`, `AlgoCore_policy`, or `AlgoCore_inference`).

## Method and marking join

Each method step has `step_id`, `trigger`, `representation`, `invariant`, `action`, `termination_or_output`, `check`, `solution_obligation_ids`, `marking_atom_ids`, `error_phase_ids`. Missing joins require a disposition; synthetic official marks are forbidden.

## Retrieval/practice item

Required fields: `item_id`, `target_block_id`, `prompt.vi`, `prompt.en`, `mode`, `cue_level`, `expected_reasoning`, `feedback.vi`, `feedback.en`, `answer_policy`, `variant_ids`. `mode` is one of `recognise`, `predict`, `explain`, `complete`, `reconstruct`, `transfer`; cue levels must support fading to independent work.

## Visual event storyboard

Required fields: `visual_id`, `scenario_id`, `event_ids`, `example_id`, `before`, `delta`, `after`, `invariant`, `code_highlight`, `prediction`, `feedback`, `controls`, `static_fallback`, `alt.vi`, `alt.en`, `caption.vi`, `caption.en`. `controls` must include `Previous`, `Next`, `Play`, `Pause`, `Reset`, and `change_input`; replay and reset semantics must be stated.

## Coverage and disposition

`COVERAGE_MATRIX.json` records each Stage 5 obligation and each Stage 3 assessment requirement exactly once with `owner`, `lesson_block_id`, `evidence_path`, `status`, and hash. `DISPOSITIONS.json` may be used only for support-only, non-code or source-authority exceptions and must name all IDs, reason, authority, reviewer, evidence hash and recheck command.

## Release close order

Write candidate artifacts → hash candidate files → A8 candidate QA → Lead pass 1 → freeze/re-hash → A8 final QA → Lead pass 2 → gate review → release manifest → detached verifier → Stage 7 handoff. No recursive manifest hash is used.
