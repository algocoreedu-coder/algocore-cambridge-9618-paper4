# A1 + A5 independent review — Stage 4 P0 Stack

**Recommendation: PASS to Lead/A8.** The review covers all 5 pattern cards, 5 variant entries, 14 error rows, 5 solution designs, 5 worked-example specs and 5 preliminary visual briefs after rework 2. The earlier visual-case finding is closed against the resubmitted artifact hash.

## Review result

| Area | Result | Evidence |
|---|---|---|
| Exact scope and joins | PASS | Exact 5 Stack patterns; 27 Stage 2 part-pattern relations over 25 unique parts |
| Official marking evidence | PASS | 91 unique official marking atoms; live source fields/locators match; no duplicated atom ownership |
| Cards and methods | PASS | All cards include contract, decision rule, ordered action/why/check steps, invariant, guard and termination role |
| Variants | PASS | Next-free/current-top, Push result, Pop sentinel, four pair outcomes and two reduction protocols are separated |
| Error prevention | PASS | 14/14 rows have consequence, detection and repair; official claims have locators; AlgoCore risks are labelled |
| Solution designs | PASS | 5/5 preserve contracts, mutation/preservation, termination and Stage 5 test obligations |
| Worked-example specs | PASS | 5/5 have an official anchor and contrast/boundary microcases, without execution claims |
| VI/EN parity | PASS | No missing or empty side in student-facing bilingual objects |
| Stage boundary | PASS | Solutions wait for Stage 5; visuals wait for Stage 5/7; no code/test/trace claim |
| Preliminary visual cases | PASS | 5/5 briefs now have distinct bilingual normal/boundary/failure cases tied to the pattern |

Mechanical evidence:

- Author validator: **1455/1455 PASS**.
- Independent validator: **71/71 PASS**.
- Stage 4 input lock: **16/16 files verified; no drift**.

## Finding closure `P0-A1A5-003`

The pre-rework visual artifact used one generic three-case template for all five patterns. Rework 2 replaced it with concrete cases:

- `STACK_SETUP`: compares both top conventions, derives boundary equations and exposes a mixed-convention contradiction.
- `STACK_PUSH`: shows write/move order, one-free-slot then full, and mutation-before-guard or copied-order failure.
- `STACK_POP`: shows the LIFO read, one-item then empty, and wrong read/update order or sentinel type.
- `STACK_PAIR`: shows both-live commit, all four availability cases, exact one-sided rollback and prohibited sentinel Push.
- `STACK_REDUCE`: shows a non-commutative fold, single-value/all-negative boundaries and explicitly separates malformed/empty inputs from Cambridge source requirements.

The reviewed `VISUAL_BRIEFS.json` hash is `ca38a8d009a3b0cc3f51f8cdc051d55a3a6071383fe845345e71e6b22a2614cd`; its pre-rework hash was `6cb05d5eb90664dda526dd6cd05cb35d2f6a5c44903630662b4763a2423051ec`. The independent `semantic.visual_cases_pattern_specific` check now passes. Finding status: **CLOSED_VERIFIED**.

## Semantic and authority checks

The top-pointer convention remains correct: next-free uses `empty=0`, `full=capacity`, writes then increments, while current-top uses `empty=-1`, `full=capacity-1`, increments then writes. Pop uses the matching read index and preserves exact empty-result types. Pairing covers all four outcomes, restores only the sole successful Pop, and labels the both-empty adaptation as `AlgoCore_inference`. Reduction preserves `total_before operator next_number`, drains live data, excludes the sentinel and initialises extrema from the first live value.

No unresolved `P0-STACK-PAIR` wording remains in the six submission artifacts. The located arrow-extraction issue is retained where applicable. The general layout/code fidelity rule is held as a non-source policy and is not presented as a Cambridge source issue. No official mark is duplicated across co-tagged Stack patterns.

## Reviewed hashes

| Artifact | SHA-256 |
|---|---|
| `PATTERN_CARDS.json` | `a949df0367b64e9e16513f784090a441f61c7de167d4c752c5dbcee79d7b7f2e` |
| `VARIANT_INVARIANT_REGISTER.json` | `e6b68fedd015ea673491beff53affa08ccc0bbc4113ab4935d85799c25610469` |
| `ERROR_PREVENTION.json` | `1dbc2006d3ab51288962d444a88d1c4378eb0b6790f7ddb1c37cb1437b689e64` |
| `SOLUTION_DESIGNS.json` | `160a9738b03bd88a09ab0e1ddba4f2a3cd5345cf95929a26bda5956e536761c7` |
| `WORKED_EXAMPLE_SPECS.json` | `c8adc48a3c0860fe4a251123cb7dc9872bc5150664a3e81862fd3597b8a38b65` |
| `VISUAL_BRIEFS.json` | `ca38a8d009a3b0cc3f51f8cdc051d55a3a6071383fe845345e71e6b22a2614cd` |
| `REVIEW.md` | `afbc352630004d828b785852c59d222beb29760ef1f8ea1840400f7497cddfc3` |
| `REWORK_RESPONSE.json` | `20fd236a9d759108e81a0af26bdd013407f32a505491e7ef73e7b10b4c635944` |
| `VALIDATION.json` | `9e3d268dbc7925393d0f692a09f12194b816633c3a1353b32cd3d1c014094e35` |

A1+A5 recommend `PILOT_GATE=PASS` on these exact hashes. A8 and Lead retain final gate ownership.
