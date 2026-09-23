# B8 Integration method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review. This is not a canonical batch PASS.

## Coverage

- Exact pattern set: 3/3 — `MAIN_FLOW, OUTPUT_FORMAT, EVIDENCE_RUN`.
- Stage 2 assessed part-pattern relations: 309; unique assessed parts: 283.
- Integration atoms owned once inside B8 after excluding P0/B1–B7 ownership: 497.
- Pattern cards / variant registers / solution designs / worked examples / visual briefs: 3 each.
- Error-prevention rows: 6. No fixed mark-loss claim.

## Method decisions

1. `MAIN_FLOW` is a dependency/call-state graph. It controls call order, parameter/state handoff, repetition and result branches without reimplementing called algorithms.
2. `OUTPUT_FORMAT` starts from an exact output grammar plus physical/logical iterator. It audits literals, labels, separators, lines/grid, range and item order without mutating source data.
3. `EVIDENCE_RUN` is only a Stage 5/6 capture design: official prescribed cases are separated from AlgoCore coverage, each capture is attributable, and all execution/evidence status remains pending.
4. On parts assessed by both MAIN_FLOW and OUTPUT_FORMAT, indivisible atoms with explicit output/print/display/message/format semantics belong to OUTPUT_FORMAT; remaining unclaimed orchestration atoms belong to MAIN_FLOW. MAIN_FLOW+EVIDENCE_RUN evidence atoms belong to EVIDENCE_RUN.

## Source and authority boundaries

- P0 and B1–B7 `PATTERN_CARDS.json` are frozen inputs. Any marking-point id already owned there is excluded from B8, while the exact Stage 2 assessed part remains in `source_scope` as a dependency relation.
- This prevents integration cards from reclaiming marks for stack/queue/tree/OOP/file/search/etc. implementations invoked by main flow.
- Exact QP/MS locators and atom semantics come from current source submissions. Row/atom caveats are retained, and fidelity policy remains only in `source_fidelity_policies`.
- `EVIDENCE_RUN` official atoms describe prescribed screenshots/test evidence. Stage 4 records expected/planned evidence only and does not assert that a run, output, screenshot or test pass exists.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; visual briefs remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Unresolved decisions

- Compound official criteria that combine a call and formatted output remain indivisible. B8 assigns each once by explicit output semantics and preserves the full source criterion/locator; Lead should retain this rule during canonical aggregation.
- Exact literals, physical/logical ranges, call order, reset requirements and filename visibility remain source-specific anchor decisions.
- Stage 5/6 must execute prescribed evidence cases, capture attributable artifacts and distinguish observed results from Stage 4 expected results before any evidence status changes.

## Self-review

The validator checks exact assessed sets, live locators, one-owner B8 atoms, zero overlap with P0/B1–B7 atoms, source-policy separation, VI–EN method/invariant/error fields, concrete unique event-driven visuals, one anchor per pattern, pending statuses and forbidden execution claims. No run, screenshot, trace, pass or verified output is claimed.
