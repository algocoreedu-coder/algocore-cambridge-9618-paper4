# A3 bounded consistency review — three Lead questions

Status: **SUBMITTED to Lead**. This review is restricted to the three requested boundaries. Sources and Stage 1 remain immutable. Only the 2023–2024 mapping/build/self-check and this requested evidence document were changed; the 2025 batch was read for comparison and not edited.

## 1. s23/41 and /43 1(d)(i): retain OUTPUT_FORMAT

Evidence: QP PDF3 specifies the sentence `The number 7 is found 2 times.`; MS PDF10 has a distinct requirement to output the message with the returned value. The required sentence combines **two data values**: the original search input and the computed count, in specified wording. This qualifies for the seed's formatted-message pattern; it is more than printing one returned scalar. Equivalent 41/43 content preserves the same decision.

Keep assessed `VALIDATE_INPUT`, `MAIN_FLOW`, `OUTPUT_FORMAT`, with VALIDATE_INPUT primary. Added the explicit `output_shape=fixed_sentence_with_search_value_and_count` variant and clarified the MS paraphrase. Pure calls followed by a scalar result, such as w23/41 `1(a)(ii)` or s24/41 `1(e)(ii)`, remain MAIN_FLOW and are outside the edit scope.

## 2. Constructor array initialisation: harmonise by actual stored values

| Part | Source basis | Decision |
|---|---|---|
| s23/42 `3(a)(i)` Employee | QP PDF8; MS PDF23–24. The rubric separately specifies a minimum 52-element real array and initialising all 52 entries to 0.0. | **Changed** from OOP_CLASS to OOP_CLASS + DATA_STORAGE. No OOP_INSTANTIATE: the array contains primitive real values, not newly constructed child objects. |
| s24/42 `2(b)(i)` TreeClass | QP PDF7; MS PDF27–28. The constructor initialises root/count and fills 20 slots with Node objects carrying data −1. | **Retained** TREE_SETUP + OOP_CLASS + OOP_INSTANTIATE. TREE_SETUP already covers the ADT's array/root/count state; do not add generic DATA_STORAGE for the same setup. |
| w25/43 `1(b)(i)` Board | QP PDF4–5; MS PDF10–11. The rubric explicitly requires the 10×10 BoardObject array and each cell's empty BoardObject; examples construct these objects in the nested loops. | **Recommendation to Lead:** add OOP_INSTANTIATE to OOP_CLASS + DATA_STORAGE. Board is general object-grid storage, so DATA_STORAGE applies; child-object construction is as explicit as the TreeClass example. Root-owned batch was not edited. |

This does not assign individual Cambridge points to the tags. The primary still counts each complete scored part once. The boundary is whether the constructor performs a separately specified array initialisation, and whether initial values are primitives or newly created objects. A specific ADT setup replaces generic storage tagging when both would describe the same initialisation.

## 3. Move remains OOP_UPDATE despite using helpers

Evidence: w23/41 and /43 QP PDF9 `3(a)(iv)` defines a new Move behavior taking a direction and mapping it to the appropriate axis and signed change. MS PDF30–31 credits the method heading, direction decision, correct helper choice and correct parameter. The coordinate helpers defined in `3(a)(iii)` already perform storage and clamping.

**Retain OOP_UPDATE**, without changing it to MAIN_FLOW or pretending the helper implementation is assessed again. The student implements a new object-behavior rule, although the eventual field mutation is delegated to existing methods. MAIN_FLOW applies when the surrounding program merely selects an object and invokes that already-defined behavior. This avoids the false rule that every helper call turns a behavior method into main-program orchestration.

Added variants distinguishing `new_behaviour=direction_to_axis_and_signed_delta` from `helper_behaviour=coordinate_storage_and_clamping_already_implemented`. The BikeCharacter override keeps OOP_OVERRIDE + OOP_UPDATE with delta20 and the same helper boundary.

## Verification

Read the exact QP/MS pages above and inspected the canonical facsimiles for s23 QP42 PDF8, s24 QP42 PDF7, w25 MS43 PDF10 and w23 QP41 PDF9. Rebuilt `batches/2023-2024/classification.json` and `SELF_CHECK.json`: still **304 rows / 12 papers / 900 primary editorial marks**. Added assertions for the formatted sentence, primitive-array constructor, ADT/object constructor, and Move/helper boundary. Only Employee gained an assessed pattern; primary counts and marks did not change.

No additional cross-corpus audit or gate approval is claimed. Lead owns the suggested Board adjustment and final acceptance.
