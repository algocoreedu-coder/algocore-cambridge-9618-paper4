# A3 Stage 2 — 2023–2024 submission

**Status: SUBMITTED / pending Lead and independent QA.** Input: immutable release `paper4-2026-s1-v1`, Stage 1 gate PASS after rework; scope 2026, Python, complete VI–EN learning materials. Output contains exactly **304 scored part IDs across 12 papers and 36 root questions**, with **900 marks in the disjoint primary editorial view**. No Stage 1 edits, Stage 3 knowledge mapping, new solutions or visual implementations.

## Method and reading record

Read Stage 2 WORK_ORDERS, the initial 57 seed definitions and Lead's updated 58-pattern seed, Stage 1 GATE_REVIEW, EXTRACTION_POLICY, SOURCE_ISSUES and the final QUESTION_INDEX. Reused the same agent's source reading and facsimile review performed during Stage 1, then reread the current source rows for difficult classifications. Every mapping and the MS distinction was authored manually in `manual_map.txt`; `build_classification.py` joins exact source IDs/pages from the locked index and validates vocabulary. It does not infer patterns from keywords or the summary text. STRING_ROUTE's final boundary excludes pushing an already supplied letter, so the vowel/consonant push remains STACK_PUSH.

The complete task/marking-row reading covers these source IDs (QP and MS for each paper):

| Paper | QP task/context pages | MS scoring/example pages | Notes |
|---|---|---|---|
| s23/41 and s23/43 | 2–10 | 4–38 | Vehicle/Helicopter, occurrence count, paired stacks |
| s23/42 | 2–12 | 4–37 | Supplied first-character sort, circular sale queue, employees/managers |
| w23/41 and w23/43 | 2–11 | 4–37 | Vowel count, queue/group totals, character movement |
| w23/42 | 2–4, 6–8, 10–13 | 4–34 | Two stacks, supplied divisor-sum algorithms, characters and dates |
| s24/41 and s24/43 | 2–13 | 4–38 | Input/sort/search, botanical trees, check-digit queue |
| s24/42 | 2–4, 6–13 | 4–50 | Word game, array-backed tree objects, recursive/iterative sorting |
| w24/41 and w24/43 | 2–15 | 4–37 | Manual comparator, horse/fence rules, linked/free lists |
| w24/42 | 2–14 | 4–39 | Event rules/winner points, queue record, two-key scores |

For 41/43 pairs, Stage 1 page-equivalence checks permit the same semantic mapping; each paper retains its exact part IDs and source locators. This reuse does not treat the variants as statistically independent tasks. Full Java/VB/Python examples remain source context and are not certified executable solutions by this review.

Previously inspected Stage 1 source images are itemised in its batch REVIEW: class tables, circular queue test records, TotalData pseudocode, malformed MS label, weighted check-digit table, binary-tree diagram, free-list layout, two-key score table and sample constructors. Additional canonical facsimiles viewed during Stage 2:

- `9618_s24_qp_42` PDF3: matched answers are consumed with null markers; percentage/remaining-answer extension is separate.
- `9618_s24_qp_42` PDF8: insertion follows child pointers; OutputTree prints physical array order.
- `9618_s24_qp_42` PDF11: recursive insertion pseudocode, base case and shift-loop structure.
- `9618_s23_qp_41` PDF9: PopAnimal assignment arrows, pop convention and adapting both colour operations.
- `9618_s23_qp_42` PDF3: four supplied gaps, adjacent swaps and first-character descending key.
- `9618_w23_qp_42` PDF7: recursive divisor-sum skeleton is already supplied, rather than independently authored.
- `9618_w24_qp_42` PDF9: queue record's supplied enqueue gaps; non-destructive ReturnAllData live range.
- `9618_w24_qp_41` PDF13: front insertion, free-node allocation and full-state procedure exit.

Current MS text rereads additionally focused on s24/42 PDF8 and 33; s23/42 PDF26, 27, 29 and 34; w23/42 PDF17 and 19; w24/42 PDF13. These distinguish calculation from direct getters/setters, implementing search from calling SetPay, no-replacement matching, array output from traversal and scoring logic from mere calls.

## Semantic decisions

| Boundary | Decision and source example |
|---|---|
| Function name versus required behavior | s23/41 and /43 `1(c)` is COUNT_OCCURRENCES despite the identifier LinearSearch. It returns frequency. |
| Count repeated matches versus accept a distinct answer | s24/42 `1(c)(i)` is UNIQUE_SELECTION plus LINEAR_SEARCH and sentinel-loop MAIN_FLOW. Consumed answers cannot score again; this is not occurrence counting. |
| Array output versus logical traversal | s24/42 `2(b)(iii)` is OUTPUT_FORMAT, not TREE_TRAVERSE. w24/41 `3(c)(i)` follows linked pointers and is LIST_TRAVERSE. |
| Record substitute versus OOP definition | s23/42 `2(a)` and w24/42 `2(a)` define records even if Python represents them by classes. Node, TreeClass, Character and Fence are explicit OOP class tasks. |
| Compound definitions | w24/41 `2(c)(i)` defines Fence with getters, and w24/42 `1(c)` defines Character with its getter: both OOP_CLASS and OOP_GET are assessed. |
| Getter name versus calculation | GetTotalPay is RULE_COMPUTE with array-sum variant; ReturnAge is RULE_COMPUTE with fixed-year-difference variant. Neither is a direct OOP_GET. |
| Direct assignment versus relative state update | SetIntelligence is OOP_SET; positional changes with clamps and indexed pay calculation/storage are OOP_UPDATE. |
| Existing method called versus implemented | File readers invoking Push/Enqueue do not assess those ADT operations anew. EnterHours implements employee lookup but calls existing SetPay. Manager's override computes adjusted hours; actual pay storage belongs to its called parent method. |
| New score logic versus routine invocation | w24/42 `1(e)(ii)` implements event-point accumulation and draw/winner comparisons: RULE_COMPUTE is primary, with MAIN_FLOW and structured OUTPUT_FORMAT co-assessed. |
| Check digit versus presumed standard formula | s24/41 and /43 `3(d)(i)` uses floor(weighted sum / 10), with 10 mapped to X. QUEUE_ENQUEUE is called context, not reimplemented. |
| Independent rewrite versus supplied code | w23/41 vowel rewrite and s24/42 insertion rewrite retain their concrete algorithm as primary. Lead resolved w23/42 `2(b)(i)` as ALGORITHM_TRANSLATE plus RULE_COMPUTE, mode complete_pseudocode: the recursive skeleton is supplied, so ALGORITHM_REWRITE is not assessed. |
| Pure test evidence | Screenshot-only rows assess EVIDENCE_RUN; algorithms under test remain context. s24/41 `2(e)(iii)` explicitly also asks for the main-program call, so it records EVIDENCE_RUN plus MAIN_FLOW. |

## Variants preserved

- Stack top means next free, initially zero, with separate capacities and sentinels for the paired animal/colour and vowel/consonant stacks.
- Sale queue is circular with count and wrapping; other queues in this batch are linear. Next-free tail (s23/42, w23/41, w24/42) is distinct from last-item tail (s24/41, initially −1). Exact wrapper, capacity and empty-result types are retained.
- Linked list has a linked free list, front insertion, first-occurrence removal and return of the removed node to free storage. The source assumes a removed value is present.
- Binary tree uses Node objects in a physical array, next `NumberNodes` allocation, root −1 initially and no deletions. It is distinct from the botanical Tree class.
- Sorting keys include first character descending, full string ascending via a manual comparator, integer ascending and level descending then score descending with whole-record swaps.
- Recursive versus iterative algorithms, supplied versus incomplete versus authored code, and explicit transformation direction remain visible in task_mode and variants.
- Every RULE_COMPUTE row, including context-only use, carries `rule_variant`: divisor accumulation, pay multiplication/array sum, year difference, growth-time division, answer percentage, probability table, arithmetic mean/highest average, or event-point totals/draws. No split is proposed solely to multiply categories; Lead may split if cross-corpus evidence warrants it.
- Evidence flow separates copied code, prescribed screenshots and mixed code/test work. Source identifiers and source inconsistencies are preserved.

## Proposals and review limits

`taxonomy_proposals` asks Lead to make two seed boundaries explicit: UNIQUE_SELECTION includes consumed answer entries (Lead agreed in coordination), and CHECK_DIGIT must cover division/rounding rather than suggesting every question uses modulo. No new pattern ID is invented. The generic divisor-sum translation/completion boundary was resolved by Lead using QP7–8/MS19 evidence and the mapping was revised accordingly.

Lead alignment changes before final submission: explicit object-array construction/definition in s23/42 `3(c)` and s24/41–43 `2(b)` records FILE_READ_OBJECTS, OOP_INSTANTIATE and DATA_STORAGE; an existing-object file update does not add those construction tags. OUTPUT_FORMAT-primary routines use task_mode output. Trivial prints of returned scalar values remain MAIN_FLOW, while specifically requested array/sentence/table layouts retain OUTPUT_FORMAT. Concrete algorithm rewrites remain operation-primary. RULE_COMPUTE variants are explicit in every assessed/context occurrence.

`SELF_CHECK.json` verifies exact ID coverage, unique IDs, allowed labels/modes, primary inclusion, assessed/context separation, source locators, per-paper 75 marks and total 900. Semantic regression assertions cover the difficult boundaries above. These checks complement source reading; they do not replace independent QA or award Cambridge submarks to patterns.

The input index's SHA-256 is recorded in SELF_CHECK. Remaining work is Lead review, independent QA and resolution of any required rework before Stage 2 approval. This batch does not sign the gate.

## Bounded Lead follow-up

See `../../evidence/A3_CROSS_BATCH_REVIEW.md` for the three requested consistency checks. Retained OUTPUT_FORMAT for the explicitly prescribed search-value/count sentence; added DATA_STORAGE to Employee's separately specified 52-real array initialisation; retained TreeClass's specific ADT/object-construction tags and Move's behavior-method classification. The Board object-grid comparison is a recommendation for Lead's own batch. Rebuilt coverage, locators, modes and primary marks successfully; added focused assertions for these decisions.
