# B4 Recursion + Tree method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review. This is not a canonical batch PASS.

## Coverage

- Exact pattern set: 5/5 — `ALGORITHM_REWRITE, TREE_SETUP, TREE_INSERT, TREE_SEARCH, TREE_TRAVERSE`.
- Stage 2 assessed part-pattern relations: 27.
- Unique assessed parts: 27.
- Official marking atoms owned once inside B4: 127.
- Pattern cards / variant registers / solution designs / worked examples / visual briefs: 5 each.
- Error-prevention rows: 10. No fixed mark-loss claim.

## Method decisions

1. `ALGORITHM_REWRITE` preserves terminal-state sets, progress measure, accumulator, intermediate output/side-effect timing and return propagation. Equal final output alone is insufficient evidence of equivalence.
2. `TREE_SETUP` chooses indexed rows or object nodes before initialisation. Root, child and allocation pointers have separate roles; none inherits a stack current-top convention.
3. `TREE_INSERT` fixes the equal-key branch, guards capacity, treats empty-root separately and commits allocation plus one parent link atomically.
4. `TREE_SEARCH` follows one child path with a null/bounds guard and propagates recursive results. It is not midpoint search over physical array rows.
5. `TREE_TRAVERSE` locks an L/N/R event grammar, guards null before dereference and distinguishes visit order from storage/allocation order.

## Source and authority boundaries

- Every current B4 assessed part carries exactly one B4 pattern, so its official atoms have one unambiguous B4 owner. Co-tags from other batches remain visible for Lead cross-batch aggregation.
- Exact QP/MS pages and award semantics come from current marking submissions. Located row/atom source issues are preserved. `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` remains only in `source_fidelity_policies`, never as a per-part issue.
- The `S25-41-MS35-INIT` page-35 constructor caveat remains attached to `9618_s25_41_3(c)(i)` and is explicitly a Stage 5 facsimile/implementation verification obligation. It is not silently repaired into canonical constructor advice.
- Coursebook references are foundations. Source-specific null sentinels, capacities, equal-key branches, return values and traversal orders remain source-bound.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; all visual briefs remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Unresolved decisions

- The corpus contains both recursive-to-iterative and iterative-to-recursive rewrites. Stage 5 must instantiate direction-specific fixtures and compare observable traces, including intermediate output order.
- Tree representations vary among 2D arrays, arrays of Node objects and direct object links. Stage 5 must select the representation from each anchor rather than merge conventions.
- Equal-key insertion direction, missing-search return and empty-root value are source contracts, not universal defaults.
- The page-35 constructor sample remains a located source caveat; Stage 5 must resolve behavior against QP/MS criteria and original facsimile before executable teaching code is certified.

## Self-review

The validator checks exact Stage 2 assessed sets, one-owner atom coverage, live QP/MS locators, source-issue/policy separation, VI–EN method and error fields, four pattern-specific method steps per card, unique decision/visual signatures, one anchor and event-driven visual per pattern, downstream statuses and the p35 caveat join. No executable code, certified run, trace or final output is claimed.
