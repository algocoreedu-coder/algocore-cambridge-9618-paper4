# Taxonomy boundaries and counterexamples

Artifact version 2.0. State: `AUTHOR_CORRECTION_COMPLETE_PENDING_INDEPENDENT_RETEST`.

## Command word is an observation, not the classification

- `Draw` can request connection lines rather than a diagram. The 2022 IDE item and the 2025 verification item are `MATCHED_ASSOCIATIONS`, while a circuit-construction response would be `DIAGRAM`.
- `Complete` can produce definitions in a table, an ordered cloze sequence, SQL fragments or register-transfer notation. The response product must come from the required output, not the verb alone.
- `Write` can produce SQL or symbolic logic. Those products have different evidence needs.
- A null command-word field in the corpus was source-inspected. All 25 rows record the observed wording separately from the corpus observation.

## Surface layout is not enough

- A table printed on the page does not make every item the same pattern. Definition rows, matching connections, binary truth-condition rows, error-correction rows and relational-key pairs have different row-integrity conditions.
- A scenario with numbers and units is not necessarily a calculation. The 2024 sampling-rate item asks for causal effects, so it is `EXTENDED_TEXT`, not `CALCULATION`.
- The 2025 bitmap item includes an implicit derivation of 256 from an 8-bit colour depth inside a mixed-answer table. Its evidence needs include a final value, but its overall response product remains `STRUCTURED_TABLE`.
- A database prompt is not automatically SQL. The 2024 three-table design is `SCHEMA_DESIGN`; the 2025 ORDER/ORDER_ITEM item is an explanation of normalisation.

## Topic family is not accepted classification

The frozen selection families were used to choose a stratified sample. Source review found seven direct mismatches and retained them without replacement:

- `9618_s22_qp_11-q5-pa`: IDE feature matching, not fetch-decode-execute trace.
- `9618_s24_qp_11-q6-pa`: relational schema design, not SQL.
- `9618_s25_qp_11-q5-pd`: normalisation explanation, not SQL.
- `9618_s21_qp_11-q7-pa`: relational-versus-flat-file explanation, not logic.
- `9618_s23_qp_11-q2-pb-pi`: foreign-key/table mapping, not logic.
- `9618_s24_qp_11-q5-pa`: server/client role description, not validation/verification.
- `9618_w25_qp_12-q2-pa`: software/copyright/licensing definitions, not validation/verification.

Five further rows are partial family matches: the broad topic is relevant, but the selected atomic response does not exercise the family name's full response demand. This is calibration evidence, not permission to relabel or replace frozen targets silently.

## Marking counterexamples

- `9618_s22_qp_12-q1-pa` uses a threshold scheme. Treating every correct connection as one mark overstates the official allocation.
- `9618_w25_qp_12-q2-pa` awards one mark per correct definition row, max four; the neighboring Q1 verification matching scheme on the same MS page must not be attached to Q2(a).
- `9618_s25_qp_12-q1-pa` awards one mark per complete correction row. Splitting the statement number and corrected statement into two marks is false.
- `9618_s22_qp_11-q4-pd` has validation and verification subsets with caps under a four-mark total. Counting every listed example is false.
- `9618_s24_qp_11-q6-pa` requires a coherent three-table design. Counting isolated field words without their table/key relationship is false.
- `9618_s23_qp_11-q2-pb-pi` requires a field/table pair for each mark. A correct field name paired with the wrong table is not a complete marking target.

## Atomic and container boundary

Only a leaf part or an unparted whole question is an assessment unit. Question roots with children and parent parts are `CONTEXT_ONLY_NONSCORING`, even when they carry scenario text or a grouped MS context row. The 128 unresolved Stage 1 records remain context-only and are not promoted by this calibration.

## Pattern and frequency boundary

These 25 rows calibrate labels and evidence rules. They do not establish full-corpus patterns, merge variants, count equivalence groups, select holdout material or predict examination frequency.
