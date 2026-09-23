# A2 inventory audit — S6-0

Decision: PASS — recommended to Lead
Reviewed: 2026-09-22T09:29:05.178885+07:00
Source: Stage 3 LESSON_PACKAGES/PREREQUISITE_MAP and Stage 5 paper4-2026-s5-v1

## Inventory checks

| Metric | Expected | Observed | Result |
|---|---:|---:|---|
| Packages | 13 | 13 | PASS |
| Lessons | 26 | 26 | PASS |
| Unique lesson IDs | 26 | 26 | PASS |
| Ten-block slots | 130 | 130 | PASS |
| Prerequisite nodes | 26 | 26 | PASS |
| Prerequisite edges | — | 58 | recorded |

Required topological layers: 5; all-edge layers: 6. Node IDs match all 26 lesson IDs.

## Package inventory

| Package | Lessons | Patterns | Assessments | Authoring state | Ten blocks |
|---|---:|---:|---:|---|---|
| foundations | 4 | 9 | 5 | NOT_AUTHORED | PASS |
| text | 1 | 4 | 1 | NOT_AUTHORED | PASS |
| search-sort | 3 | 8 | 3 | NOT_AUTHORED | PASS |
| stack | 1 | 5 | 1 | NOT_AUTHORED | PASS |
| queue | 1 | 5 | 1 | NOT_AUTHORED | PASS |
| linked-list | 1 | 4 | 2 | NOT_AUTHORED | PASS |
| recursion | 1 | 1 | 2 | NOT_AUTHORED | PASS |
| tree | 1 | 4 | 1 | NOT_AUTHORED | PASS |
| dictionary | 2 | 4 | 4 | NOT_AUTHORED | PASS |
| oop | 4 | 8 | 5 | NOT_AUTHORED | PASS |
| files | 4 | 3 | 7 | NOT_AUTHORED | PASS |
| support | 2 | 0 | 4 | NOT_AUTHORED | PASS |
| integration | 1 | 3 | 1 | NOT_AUTHORED | PASS |

The support package has zero pattern IDs by design and requires a support-only evidence disposition.

## Stage 5 denominator registry

{
  "patterns": 58,
  "solution_obligations": 719,
  "solution_obligations_by_kind": {
    "normal": 74,
    "boundary": 143,
    "counterexample": 108,
    "source_fixture": 394
  },
  "unique_source_parts_in_solution_fixtures": 368,
  "variants": 60,
  "variant_cases": 167,
  "errors": 154,
  "error_phase_obligations": 308,
  "marking_atoms": 2236,
  "worked_example_specs": 58,
  "worked_example_microcases": 210,
  "worked_example_evidence_items": 261,
  "visual_briefs_with_trace_bundle": 58,
  "visual_scenarios": 174,
  "proposed_visual_event_entries": 331,
  "harness_lock": "REQUIRED_AT_S5-0",
  "source_issue_ids": 25,
  "source_issue_occurrences": 62
}

These are immutable join denominators, not permission to invent content. Stage 5 manifest has 218 files and verifier result is PASS. Required findings: none.
