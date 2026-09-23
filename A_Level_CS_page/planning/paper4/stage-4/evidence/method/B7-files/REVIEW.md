# B7 Files method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review. This is not a canonical batch PASS.

## Coverage

- Exact pattern set: 3/3 — `FILE_READ_ARRAY, FILE_READ_OBJECTS, FILE_WRITE`.
- Stage 2 assessed part-pattern relations and unique parts: 39.
- Official marking atoms owned once inside B7: 265.
- Pattern cards / variant registers / solution designs / worked examples / visual briefs: 3 each.
- Error-prevention rows: 6. No fixed mark-loss claim.

## Method decisions

1. `FILE_READ_ARRAY` fixes record grouping, types, destination, EOF/fixed-count and capacity guards before opening. It buffers and converts a complete record before one commit.
2. `FILE_READ_OBJECTS` separates parse, subtype/lookup routing, construction/update candidate and destination commit. Partial records never create objects.
3. `FILE_WRITE` fixes append/overwrite and physical/logical order before open, formats one complete line before each write, and closes after the final required record.
4. File lifecycle and exception/output behavior are observable contract elements. Error messages, return counts and failure scope remain source-bound.

## Source and authority boundaries

- Every current B7 assessed part carries exactly one B7 pattern, so each official atom has one B7 owner. Co-tags from other batches remain visible for Lead cross-batch aggregation.
- Exact QP/MS pages and all award semantics come from current marking submissions. Located row/atom caveats are preserved. `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` appears only in `source_fidelity_policies`, never as a per-part issue.
- The W21 ReadData parts `9618_w21_41_2(e)` and `9618_w21_42_2(e)` retain all eleven atoms as `holistic`, with issue `W21-2E-RUBRIC`, no inferred atom values and the official part-level ceiling 8 from Lead-reviewed `S4-S1-DEC-001`.
- The W22 ReadFile parts `9618_w22_41_1(b)` and `9618_w22_43_1(b)` retain seven `holistic` criteria, no inferred atom values and the official part-level ceiling 6 from Lead-reviewed `S4-S1-DEC-002`.
- Source listings and extracted examples are evidence locators only. Stage 4 does not copy, repair or certify them as executable teaching code.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; visual briefs remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Unresolved decisions

- The W21/W22 arithmetic questions are closed by Lead-reviewed `S4-S1-DEC-001/002`; zero source decision remains open. Downstream aggregation must preserve their holistic ceilings without inferring criterion-level values.
- EOF-driven input with an incomplete final multi-line record, capacity reached before EOF, and exception-time close behavior require source-specific Stage 5 fixtures.
- Append versus overwrite, error message literals, physical versus logical order and create versus update semantics must be selected from each anchor contract rather than made universal defaults.
- Object-construction listings with source caveats remain facsimile verification obligations; no listing is certified by this batch.

## Self-review

The validator checks exact Stage 2 sets, one-owner atom coverage, live locators, source-issue/policy separation, all four holistic adjudication rows, VI–EN method/invariant/error fields, concrete unique visual cases, one anchor per pattern and downstream statuses. No executable code, successful run, certified trace or final output is claimed.
