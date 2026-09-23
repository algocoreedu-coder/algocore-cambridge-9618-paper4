# P0 Stack method submission review

Status: **SUBMITTED**. This is a method-team submission for Lead/A1/A5/A8 review; it is not `PILOT_GATE=PASS`.

## Scope and coverage

- Exact pattern set: 5/5 — `STACK_SETUP, STACK_PUSH, STACK_POP, STACK_PAIR, STACK_REDUCE`.
- Stage 2 assessed relations: 27 part-pattern links.
- Unique official source parts joined: 25; official marking atoms referenced: 91.
- Method cards: 5; solution designs: 5; primary worked-example specs: 5; preliminary visual briefs: 5.
- Error-prevention rows: 14. No row claims an exact number of marks lost.
- All solution designs remain `PENDING_STAGE5_EXECUTION_VERIFICATION`; all visuals remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`.

## Method decisions submitted

1. Next-free and current-top use separate equations and state-transition steps. A3C16 is carried explicitly; the submission never copies one update order into the other.
2. Failed Push/Pop operations are non-mutating. Exact Boolean, integer, string or message contracts remain tied to their source parts.
3. Stack pairing is treated as a small transaction: both successful Pops commit; exactly one successful Pop is restored to its origin stack.
4. Expression reduction uses `total_before operator next_number`; extrema initialise from the first live value. Both variants drain the stack and exclude the empty sentinel from data.
5. Coursebook sections are foundations only. `STACK_PAIR` and `STACK_REDUCE` remain explicit QP/MS + AlgoCore synthesis because the book does not supply their full protocols.

## Source boundaries and Lead decision

- Lead decision `P0-STACK-PAIR` resolves the method design: use independent typed success/value results; both success commits, a sole success is restored exactly once, and both empty performs no restore, no mutation and no sentinel Push. Any message authored for the both-empty adaptation is explicitly `AlgoCore_inference` and must not be presented as an official Cambridge literal. Stage 5 must execute all four cases.
- The 2023 extraction issue `S4-S2-S23-QP-ARROW-EXTRACTION` affects Pop/adaptation parts; original facsimiles remain authoritative for assignment direction.
- `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` is retained as a non-source batch policy: plain extraction cannot certify layout, arrows, indentation or underscores. It is not present in any card or source row's `source_issue_refs`; source listings remain unexecuted.
- `STACK_PAIR` is one normalized mirrored task group. `STACK_REDUCE` has two 2025 groups. Neither supports frequency claims or universal variants.
- Empty initial input for the 2025 reduction tasks is outside the stated source flow. It is retained as a Stage 5 boundary obligation, not an official requirement.

## Rework 1 response

- Rebuilt against the resubmitted S4-S2 and S4-S3 marking/risk hashes listed below.
- Removed `S4-S2-LAYOUT-CODE-FIDELITY` from all P0 `source_issue_refs`; the replacement policy is stored only in `source_fidelity_policies` with `is_source_issue=false`.
- Retained the located arrow-extraction issue on the four affected 2023 source parts.
- Absorbed the corrected semantics for `9618_s25_42_1(e)`: atoms mp.04–mp.07 now each retain explicit value 1; mp.05 is `discrete` with no alternative route. Dependencies on continuation atoms remain source metadata.
- Other S2 re-atomisation and S3 risk fixes do not join the five Stack patterns; their input hashes are still refreshed so later drift is detectable.

## Rework 2 response

- Closed both stale phrases left after `P0-STACK-PAIR`; there is no open Lead decision.
- The both-empty variant now states no restore, no mutation and no sentinel Push.
- The corresponding error authority note states that any authored both-empty message is `AlgoCore_inference`, not an official Cambridge literal.
- Replaced the repeated generic normal/boundary/failure text in all five visual briefs with pattern-specific cases, including the four Pair transactions and Reduce's non-commutative/all-negative cases. Malformed or initially-empty Reduce inputs are labelled Stage 5 contract obligations outside the cited source precondition.

## Self-review result

The builder and validator compare every card's assessed-part set with Stage 2, require exact QP/MS locators for each official atom, check bilingual fields, stable joins, method-step coverage, rollback/reduction invariants and downstream statuses. Submission status remains `SUBMITTED`; independent review and Lead gate are still required.

## Input hashes

- `stage-2/EXAM_PATTERN_CATALOG.json` — `eaa7e50e87932b2aa58c5f1d9415d2b8a63ccd6da43c9f2b714d3ee74585dd95`
- `stage-2/QUESTION_PATTERN_MAP.json` — `2bc7a5fc2cd18eeb01e71c3b782f7c5ff0e6a7d780212f3e715e44a309c9318f`
- `stage-2/CONFUSABLE_PATTERNS.json` — `74e9c079979c439b09257e9564854682e1cdeabb0193e13338dcf66c8666c244`
- `stage-3/BOOK_KNOWLEDGE_MAP.json` — `5b81ed6a1b8028eeabbb9e44184dd9bab8864893893a6e0599a7fcf1043dd96a`
- `stage-3/COVERAGE_MATRIX.json` — `e47f52bc29703f8f0fa03d2777d021cd51935c2e30127759c2dbf6f802345b5f`
- `stage-3/LESSON_PACKAGES.json` — `01710c1a99028228bf5472ddf9457a4ac9c5df64ebd576785139d23d6fca0ad2`
- `stage-1/SOURCE_ISSUES.json` — `7e9a8677b345327847d52a2aa88f293dc6898ef17944a63e6e05bb99daf9f588`
- `stage-4/evidence/marking/2021-2022/MARKING_SUBMISSION.json` — `431c3d6f520fae30852faa098b11e1f8a9210e8adc679cea99386431c8c321f4`
- `stage-4/evidence/marking/2021-2022/SOURCE_RISK_REGISTER.json` — `e2065152d043e63e802239b56d13742836552449a126cb67007ea57750abf5cd`
- `stage-4/evidence/marking/2023-2024/MARKING_SUBMISSION.json` — `796e20019b38f0e214f9c8d073caed490aee80b8f916dea9e1ee8c4bec2d51bb`
- `stage-4/evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json` — `bd408ecb42a723923eb3b0b102b285e6046dfd27e414ae0aa521a3feb36591ef`
- `stage-4/evidence/marking/2025/MARKING_SUBMISSION.json` — `3c460504352ff601d0423c2070b383f7b48e1a5746f2786a05732849a4f99f99`
- `stage-4/evidence/marking/2025/SOURCE_RISK_REGISTER.json` — `35ab42f032dbcd7420f698c19024cc4d7361a73bf542b4e41263af9795494c18`
- `stage-4/schemas/pattern-card.schema.json` — `00f88fc719c21a2c0259fdf2275bee108152636dddca0126f4c95f7552410e48`
- `stage-4/schemas/error-prevention.schema.json` — `282ef2c7964a81cbb541d488ded8bf6439ebb75c8be9469021bc3f61f048294d`
- `stage-4/schemas/design-briefs.schema.json` — `30748518ea993b1d4da4ae239f69d89bf2d9195fe4601518e45e6dbe1e7703d4`
