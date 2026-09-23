# Marking-evidence rules - A4 calibration v1

Artifact version 1.0. State: `AUTHOR_COMPLETE_PENDING_INDEPENDENT_REVIEW`.

These rules describe how Stage 2 may classify official Paper 1 marking evidence. They do not rewrite a mark scheme, add acceptable answers or split an official condition more finely than the source permits.

## Source before interpretation

1. Resolve the atomic target and its single official marking item in the frozen Stage 1 corpus.
2. Read the target prompt, all context needed to understand that target, and the corresponding MS row.
3. Inspect the rendered QP/MS page whenever a table, connection line, diagram, symbol, shading, code layout or transcript defect can change meaning.
4. Store what the source says separately from the analyst's response-product and cognitive-action labels.
5. If `command_word_verbatim_or_null` is null, inspect the QP and record the observed wording. Null never means that the source has no command word.

## Evidence kinds

- `OFFICIAL_EXACT`: the official row states separable answers or criteria at the precision claimed. Alternatives remain alternatives within that criterion.
- `OFFICIAL_GROUPED`: marks use thresholds, caps, linked rows or a coherent structure. The group must stay intact in any scoring claim.
- `UNRESOLVED`: Stage 1 could not establish a reliable target or condition. It stays context-only and cannot score.
- `ALGOCORE_GUIDANCE_REQUIRED`: pedagogical guidance may be planned later, but it cannot be represented as an official Cambridge condition.

`eligible_for_item_scoring=true` requires an atomic target, one resolved official marking link and an evidence kind of `OFFICIAL_EXACT` or `OFFICIAL_GROUPED`. A non-scoring container or any of the 128 unresolved records is never eligible.

## Marking behaviours

- `POINT_BASED`: one mark per explicitly stated answer/criterion, subject to the official total.
- `GROUPED_THRESHOLD`: the source awards marks by count bands. Example: 2022 Q1(a) gives 1/2/3 marks for 1, 2-or-3, or all 4 correct connections. It is false to model each line as one mark.
- `CAPPED_POINTS`: the source lists acceptable points but says `max N`. Preserve the cap and do not imply every listed bullet can score.
- `CAPPED_SUBSETS`: local caps apply to different evidence groups and may also sit under an overall total. Preserve every cap.
- `ROW_ATOMIC`: multiple entries form one scoring row. Example: an incorrect-statement number and its corrected statement must remain a pair.
- `STRUCTURAL_CRITERIA`: marks depend on a coherent design. Do not atomise a relational design into claims that ignore keys, table membership or relationships.

## Conditions and alternatives

- Keep `and`, `or`, `//`, `max`, `any`, row requirements and threshold language.
- An example in an MS is not automatically an exhaustive answer set.
- Do not invent synonyms or alternative SQL, formulae, diagram forms or causal links.
- Do not infer that one MS bullet always equals one mark; first read the row heading and total.
- Do not split a term-plus-table pair, statement-number-plus-correction row, or linked cause-and-effect condition unless the MS explicitly allocates separate marks.
- A displayed mark on the QP is a source observation. The MS controls how that total is awarded.

## Layout and visual evidence

- Matching questions require the connection structure, even when a transcript lists all labels.
- Table rows require their headers and row association.
- Logic circuits require gate shape, inversion bubbles, branches and output identity.
- Truth-table shading or grouped rows may define the marking condition.
- SQL and register-transfer notation require symbols and layout to be checked where extraction may lose brackets, arrows, quotes or underscores.

The calibration reviewed the rendered target pages for all 25 QP/MS pairs. It also reviewed the preceding schema/context pages needed for 2021 Q5(c)(i), 2024 Q2(d) and 2025 Q5(d).

## Frequency boundary

Counts from 2021-2025 may describe this frozen corpus only. They are not forecasts, syllabus weightings or evidence that an item type will appear in a future paper.
