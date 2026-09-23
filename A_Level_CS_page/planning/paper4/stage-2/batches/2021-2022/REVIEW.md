# A3 — Stage 2 classification, 2021–2022

Status: **SUBMITTED TO LEAD**, 19 September 2026. This is the batch analyst's submission, not the Stage 2 gate decision. Stage 1 remains unchanged; no lesson, solution or executable exam program was created.

## Coverage and evidence

`classification.json` contains **228 scored parts, 33 question instances, 11 papers and 825 marks**. All 228 original part IDs and their own QP/MS source IDs and PDF page locators are retained. There are 41 primary patterns in this batch. Every row has a manual semantic decision, assessed/context distinction, task mode, material variants and a paraphrased marking requirement.

| Paper | Parts | Marks |
|---|---:|---:|
| 9618_s21_41 | 19 | 75 |
| 9618_s21_42 | 19 | 75 |
| 9618_s21_43 | 19 | 75 |
| 9618_s22_41 | 23 | 75 |
| 9618_s22_42 | 19 | 75 |
| 9618_s22_43 | 23 | 75 |
| 9618_w21_41 | 21 | 75 |
| 9618_w21_42 | 21 | 75 |
| 9618_w22_41 | 21 | 75 |
| 9618_w22_42 | 22 | 75 |
| 9618_w22_43 | 21 | 75 |

The analyst's full QP/MS reading and page-by-page variant comparison from Stage 1 carried forward into this review: six question-body baselines, five matching variants, with the w21 QP continuation-page OUTPUT presentation difference retained. That review covered every question part, marking requirement, Python example and parent context. See `../../../stage-1/batches/2021-2022/REVIEW.md`, `VARIANT_EQUIVALENCE.json` and the per-paper rendered-page register in that batch's `index.json`. This does not establish statistical independence. Raw 11 paper identities are retained here; corpus-wide equivalence and sensitivity denominators belong to A2 and Lead.

For Stage 2 the analyst wrote 125 baseline part decisions in `manual_map.py` after source reading, then joined them to the 228 original part records. `build_classification.py` serializes those decisions; it does not classify summaries with keywords. Per-part QP/MS citations come from the locked index, including continuation pages. The joined Stage 1 question context remains necessary when an individual row begins mid-question.

The 20 facsimiles inspected in Stage 1 covered: s21 QP 2 and MS 9/21/22; s22/41 QP 9 and MS 29/30; s22/42 QP 6 and MS 22/25/26; w21 QP 8/9 and MS 18; w22/41 QP 8 and MS 5/21; w22/42 QP 3 and MS 11/21. Those include marking columns, Python examples, the two-page tree insertion algorithm, supplied node/job tables, queue wrapping and binary-search source differences.

An additional **14 original QP facsimiles were rendered and visually inspected in Stage 2**, recorded in `VISUAL_REVIEW_MANIFEST.json` and `renders/`:

- s21/41 page 7: descending bubble-sort gaps and translation instruction.
- s22/41 pages 2 and 5: 11-slot top-ten score context; Balloon class and method responsibilities.
- s22/42 pages 4 and 7: row-wise 10×10 bubble sort and random data bounds; Card private attributes/constructor.
- w21/41 pages 2 and 4: Unknown recursion branches/integer division; Picture getters and setter versus constructor.
- w22/41 pages 4–7: Card/Hand class tables, 15 specified Card objects, two Hand objects, indexed getter, aggregate score and main winner/draw comparison.
- w22/42 pages 5, 7 and 9: relative Character movement, validated direction dispatch and formatted output; non-destructive backward queue sum rewritten recursively.

## Decisions requiring care

| Source parts | Classification and reason |
|---|---|
| s21 1(a) versus OOP questions | The node is DATA_RECORD with a permitted Python class substitute. Explicit encapsulated classes are OOP_CLASS. The s21 TreasureChest class does not separately name a constructor in the QP instruction; its MS example includes one, so that distinction is retained. |
| s21 1(c)(i), w21 3(c), w22/41 3(d) | Following nextNode is LIST_TRAVERSE; printing every physical node-array row is OUTPUT_FORMAT; left-right-root visits are TREE_TRAVERSE. |
| s21 3(c)(ii)/(iii), s22/41 2(d), w22/41 2(c)(i) | Computed methods are RULE_COMPUTE, with rule_variant respectively boolean_predicate, banded_score, boolean_predicate and aggregate_score. GetPoints is not a direct getter; CalculateValue is not key-based grouped aggregation. |
| s22/41 1(e)(ii) versus w22/42 1(e) | Updating an ordered high-score table with one incoming name/score is ORDERED_INSERT. Sorting the complete jobs table with the named insertion-sort algorithm is INSERTION_SORT; priority is the key and the pair moves together. |
| s22/41 2(f) Defend | MAIN_FLOW describes a helper orchestrating input and existing methods, despite the pattern's provisional title mentioning main. Relative health modification stays invoked context. |
| s22/42 1(e)(ii) | EVIDENCE_RUN: two existing Pop calls and screenshots. MS accepts alternative representations of vacated slots. This row does not write Pop again. |
| s22/42 2(b)(ii), 3(e)(i) | Grid-output procedure plus placement of calls is OUTPUT_FORMAT + MAIN_FLOW. Player1 storage, existing selected Card references and structured getter output are MAIN_FLOW + DATA_STORAGE + OUTPUT_FORMAT; existing objects are not instantiated again. |
| w21 2(d), w22/41 2(a)(iii)/2(b)(iii) | Array storage alone is DATA_STORAGE; construction of specified Card and Hand instances is OOP_INSTANTIATE. |
| w22/41 1(c) | FindValues counts all matches and validates 1–100, so COUNT_OCCURRENCES + VALIDATE_INPUT. A search-like name does not make it existence-only LINEAR_SEARCH. |
| w22/41 2(c)(ii) | MAIN_FLOW calls two existing score functions and handles winner/draw results. RULE_COMPUTE remains context; the row does not implement per-card scoring again. |
| w22/41 3(b) | Copying a supplied six-node tree with root/free values is TREE_SETUP; no insertion is authored. |
| w22/42 1(c) | Jobs append into bounded storage with a count: ARRAY_APPEND, not a queue ADT or ordered insertion. |
| w22/42 2(e)/(f) | Name lookup adds a case-insensitive search and retry constraint. Movement validates a new A/W/S/D choice and dispatches existing ChangePosition calls; OOP_UPDATE is context in the latter. |
| w22/42 3(d) | QUEUE_REDUCE primary + ALGORITHM_REWRITE assessed: the supplied iterative total becomes recursive. It accumulates without dequeueing and moves backward from the starting boundary. |

Queue variants remain distinct: s22/41 uses a circular ten-string queue with head, tail and count initially zero; w22/42 uses a linear 100-integer queue without wrapping. Its QP asks for appropriate pointers and its MS example uses head −1/tail 0, so the example convention is not falsely presented as the only QP requirement. Stack next-free position, tree root/free positions, supplied versus authored algorithms, descending versus ascending sorting and physical versus logical output are retained per row.

## Source caveats and limits

All Stage 1 source caveats remain applicable through the part join. No published code was normalized into approved teaching code. Relevant examples include the s21 QP five TreasureChest records versus an MS four-element bullet; circular-dequeue example defects; the s22/42 binary-search midpoint/guard differences; w21 tree insertion indentation and ReadData bullet totals; the w22/41 100-element search loop example; and w22/42 Character spelling/global-pointer issues. These were already observed in original PDF facsimiles and retained in Stage 1. Classification records the assessed operation and published variants; Stage 5 must independently verify eventual solutions.

Primary marks form an editorial disjoint view only. Co-assessed tags are non-additive and do not purport to allocate individual Cambridge marking points. Ordinary input/call/result printing inside orchestration is not separately tagged OUTPUT_FORMAT; simple temporary variables are not separately tagged DATA_STORAGE. Screenshot-only rows assess EVIDENCE_RUN and place operations under test in context.

## Validation and handoff

`validate_classification.py` passed; `SELF_CHECK.json` records exact source/classification hashes, per-paper reconciliation and primary counts. Checks include complete unique locked ID equality, exact citation joins and page bounds, vocabulary/task-mode validity, assessed/context separation, explicit rule variants, screenshot-only boundaries, 18 targeted semantic cases and 5 material-variant assertions. Total primary coverage is 228 parts / 825 marks. These checks complement source review and do not replace Lead or independent QA.

Five boundary clarifications are submitted in `taxonomy_proposals`, with exact supporting part citations: helper orchestration, computed-rule variants, object storage versus construction, ordered update versus whole-array sort, and non-destructive queue reduction plus rewrite. **No new pattern ID, unclassified part or unresolved source-locator error is proposed.** Lead must disposition those clarifications and review mappings before issuing any stage gate. No Stage 3 work has begun.
