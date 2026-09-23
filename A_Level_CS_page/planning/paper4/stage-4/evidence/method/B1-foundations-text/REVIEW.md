# B1 Foundations + Text method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review. This is not a canonical batch PASS.

## Coverage

- Exact pattern set: 13/13 — `DATA_STORAGE, DATA_RECORD, ARRAY_APPEND, RANDOM_ARRAY, RULE_COMPUTE, VALIDATE_INPUT, UNIQUE_SELECTION, CHECK_DIGIT, ALGORITHM_TRANSLATE, STRING_COMPARE, STRING_SPLIT, STRING_ROUTE, RUN_LENGTH_ENCODE`.
- Stage 2 assessed part-pattern relations: 108.
- Unique assessed parts: 103.
- Official marking atoms owned once inside B1: 431.
- Pattern cards / variant registers / solution designs / worked examples / visual briefs: 13 each.
- Error-prevention rows: 26. No fixed mark-loss claim.

## Method decisions

1. Data declaration separates capacity from last index, record substitution from full OOP design, and bounded append from ordered insertion or queue operations.
2. Random generation writes the mathematical interval before selecting an API; unique generation advances only on accepted candidates.
3. Validation defines `VALID` first. Unique selection adds a distinct availability guard and cannot terminate after the choice space is exhausted.
4. Rule computation preserves table boundaries, units and source-stated division/rounding. Check digit does not assume modulo; the s24 floor/division rule remains source-bound.
5. Algorithm translation is defined by state equivalence, including integer arithmetic, termination, recursive return propagation and side effects.
6. String comparison stops at the first difference or prefix boundary; split has an explicit final flush; routing commits parse/convert/destination atomically; RLE counts consecutive runs and flushes the final run.

## Source and authority boundaries

- Multi-pattern parts remain one official part. Each marking atom listed by this batch has one B1 owner; assessed co-tags remain in source scope without duplicate mark allocation.
- Exact QP/MS pages and current award semantics are carried from the source submissions. Located source issues remain source refs. `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` is carried only as `source_fidelity_policies`, never as a per-part issue.
- Coursebook references are foundations only. Random API bounds, manual string protocols, RLE queue integration and source-specific check-digit rules require AlgoCore synthesis plus Stage 5 verification.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; all visual briefs remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Unresolved decisions

- When an official part has exactly one B1 pattern plus co-tags from other batches, B1 assigns the part's atoms to that sole B1 pattern. Cross-batch duplicate prevention remains a Lead aggregation check.
- Two supplied-algorithm parts also carry `RULE_COMPUTE`. Arithmetic-specific atoms are assigned to RULE_COMPUTE and structural translation atoms to ALGORITHM_TRANSLATE; Lead should inspect this join before canonicalisation.
- Pattern-limited corpus does not establish universal APIs, message literals, empty-token policy, random retry strategy or empty-input RLE behavior. These stay source-bound or Stage 5 contract decisions.

## Self-review

The validator checks exact Stage 2 assessed sets, unique atom ownership, live QP/MS locators, VI–EN method fields, four method steps per card, pattern-specific variants/errors, one anchor and event-driven visual per pattern, source-policy separation and downstream status. No code, run, trace or final output is claimed.
