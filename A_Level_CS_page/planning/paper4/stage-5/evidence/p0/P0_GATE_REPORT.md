# Stage 5 P0 pilot gate report

Batch: `P0`  
Input release: `paper4-2026-s4-v1`  
Scope: `STACK_SETUP`, `STACK_PUSH`, `STACK_POP`, `STACK_PAIR`, `STACK_REDUCE`  
Decision: **PASS_RECOMMENDED — pending Lead and A8 canonical gate signatures**

## Evidence

- Candidate implementation: `implementation/stack_pilot.py`
- Entry-point and variant binding registry: `implementation/IMPLEMENTATION_REGISTRY.json`
- Fixture registry and five source-anchor fixtures: `fixtures/FIXTURE_REGISTRY.json`
- Author run: `runs/AUTHOR_RUN.json`
- Independent clean-process rerun: `qa/A5_INDEPENDENT_RERUN.json`
- Run-based trace bundle: `traces/TRACE_BUNDLE.json`
- Coverage summary: `P0_COVERAGE.json`
- Learning handoff: `A1_LEARNING_HANDOFF.md`

## Result

The author run executed **20/20 PASS**. Every one of the 20 ordinary fixtures was also launched in its own fresh subprocess with its own temporary working directory; all 20 completed with exit code `0`. Five additional source-anchor fixtures were executed in fresh subprocesses and all five completed with exit code `0`. The independent rerun repeats this harness and returned exit code `0`. Workdir, termination outcome, exit code, stdout/stderr and elapsed time are recorded per fixture in `runs/AUTHOR_RUN.json`.

The trace bundle contains **13 actual trace runs** covering all five visual briefs. Each trace records frozen and instrumented source hashes, execution-log hash, parity assertion IDs and PASS result. `event_ids` is the exact list emitted by that run; a validation check confirms every listed visual event ID resolves to an emitted event record.

The pilot explicitly covers:

1. both `next_free` and `current_top` pointer conventions, including capacity `1`;
2. Push success, full rejection with storage/top preservation, and integer `1/-1` result binding;
3. Pop LIFO behavior and numeric/string empty sentinel bindings;
4. all four `STACK_PAIR` cases: both success commits both pops; left-only restores right exactly once; right-only restores left exactly once; both-empty performs no restore, no mutation and no sentinel push;
5. `STACK_REDUCE` left fold with non-commutative order `acc_before operator next` and extrema initialized from the first live item using all-negative values.

## Gate checks

| Check | Result | Evidence |
|---|---|---|
| Five executable pattern entry points | PASS | `IMPLEMENTATION_REGISTRY.json` |
| Explicit variant-to-entry-point bindings | PASS | registry `variant_entry_point_bindings` and `ENTRY_POINTS` |
| Canonical typed snapshots | PASS | storage, top, capacity, live range, live values, return/output |
| Pair failure field-by-field preservation | PASS | all failed pair cases compare storage, top, capacity, mode, logical size, live range and live values for both stacks |
| Four pair branches | PASS | `p0.pair.*` tests and traces |
| Reduce protocols | PASS | `p0.reduce.expression.left_fold`, `p0.reduce.extrema.all_negative` |
| Source-anchor fixture per pattern | PASS | `FIXTURE_REGISTRY.json` plus five fresh source-anchor runs with QP part IDs |
| Real event traces | PASS | `TRACE_BUNDLE.json`, 13 runs |
| Instrumentation parity | PASS | every trace has parity IDs and PASS result |
| Independent rerun | PASS | `A5_INDEPENDENT_RERUN.json` |
| Bilingual handoff boundary | PASS_RECOMMENDED | `A1_LEARNING_HANDOFF.md` |

## Findings

No required finding remains open for the P0 execution evidence. The implementation is an AlgoCore verification adaptation and must not be cited as an official Cambridge literal. The both-empty pair fixture is authorised by `AlgoCore_test_policy` / `AlgoCore_inference`; it is not treated as an official MS/QP message. Final P0 status requires Lead to review this report and A8 to issue the pilot QA recommendation, as required by the Stage 5 gate.

## Hashes

The authoritative SHA-256 values for the implementation, run, fixtures, registry, coverage, QA rerun and trace bundle are recorded in `P0_HASHES.json`.
