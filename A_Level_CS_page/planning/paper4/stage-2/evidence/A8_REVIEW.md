# A8 independent Stage 2 review

**A8 PASS after rework.** No open required finding remains in the reviewed submission and aggregate. Lead retains authority for the final Stage 2 gate.

All 672 row schema/joins; all 140 root 2025 rows semantically read; selected ordinary and ambiguous 2021-2024 rows independently reclassified/read from QP/MS. Not a claim of second full visual inspection of all source pages.

## Finding history

### S2-TAX-01 — CLOSED_RECHECKED

STRING_SPLIT combined typed field routing with manual delimiter tokenization; record/class boundary depended too strongly on encapsulation.

Evidence: 9618_s25_41_2(b): QP4/MS21; 9618_w25_43_3(b)(ii): QP13/MS35; 9618_s25_42_2(a); 9618_w25_41_3(a).

Seed now has 58 patterns. STRING_ROUTE covers typed parse/category destination selection; STRING_SPLIT covers tokens. s25_41 row and contexts corrected. DATA_RECORD follows explicit TYPE/record task with class substitute; explicit OOP class/constructor remains OOP_CLASS regardless of public fields or name Record.

### S2-MAP-01 — CLOSED_RECHECKED

w25_41 1(d) correctly used MAIN_FLOW with STACK_PUSH context, but lost directly required random generation outside RANDOM_ARRAY.

Evidence: 9618_w25_41_1(d): QP3/MS11.

Row now records directly_assessed_additional_skills=[random_generation] and inclusive bounds [0,1000]. MAIN_FLOW primary and STACK_PUSH context preserved. Final normalized skills were independently checked in the aggregate and preserve random_generation.

### S2-MAP-02 — CLOSED_RECHECKED

w23_42 2(b)(i) was tagged as assessed ALGORITHM_REWRITE even though the recursive skeleton is already supplied and the candidate completes it.

Evidence: 9618_w23_42_2(b)(i): QP7-8/MS19-20.

ALGORITHM_TRANSLATE primary plus RULE_COMPUTE, complete_pseudocode mode; supplied_transformation retained as context variant. Downstream main/evidence contexts now ALGORITHM_TRANSLATE, not ALGORITHM_REWRITE.

### S2-MODE-01 — CLOSED_RECHECKED

New PrintArray/structured output routines used implement in one batch and output in another.

Evidence: 9618_s23_41_1(b)(i): QP2/MS7; 9618_w25_42_2(b): QP6/MS19.

All OUTPUT_FORMAT-primary rows now use output except explicitly mixed integration and amendment/adapt tasks. The final LEAD_DECISIONS mode contract explicitly carries this rule.

### S2-CO-01 — CLOSED_RECHECKED

Object-file loader co-tags for explicit storage declaration and instance construction differed by analyst batch.

Evidence: 9618_s21_41_3(b); 9618_s23_42_3(c): QP11/MS30-33; 9618_s24_41_2(b): QP7/MS18-20; 9618_w25_41_3(e): QP11/MS31-32.

s23_42 and s24_41/43 loaders now include DATA_STORAGE and OOP_INSTANTIATE; w25_41 loader includes OOP_INSTANTIATE but not storage already declared earlier. Existing-object hours update does not gain construction tags.

### S2-JOIN-01 — CLOSED_RECHECKED

Aggregate source_issues link targeted nonexistent Stage 1 SOURCE_ISSUES.md.

Evidence: QUESTION_PATTERN_MAP.json.source_issues; scripts/build_release.py.

Lead corrected to ../stage-1/SOURCE_ISSUES.json and rebuilt. A8 independently checked target existence and exact preservation of all source-part, paper and question caveats/context.

## Final independent checks

- 672 exact unique IDs; 29 papers, 87 questions and 2,175 original marks. Every source_part is identical to Stage 1, with all paper/question context, caveats, data requirements and source joins preserved.
- Every batch classification field preserved except declared normalized skill/review fields; analyst skills retained verbatim. Canonical skills, co-tags and topic families match the declared catalog contract.
- Dependency references resolve within the same question; no cycles or self-links. The two w24/42 references to parent 1(b) expand to its scored children, retaining original parent references.
- 58 catalog entries have exact assessed-ID membership, task modes, example locators and available facsimiles. Limited-evidence flags agree with the declared threshold.
- 2,088 independent metric comparisons: 58 patterns × 3 views × primary/assessed/context × paper/question/part/marks. All agree. Primary totals are 672/2,175 raw, 487/1,575 strict text, and 536/1,725 render corroborated.
- Nine executed union-query cases across three views and three roles, including repeated pattern arguments, retain each scored ID once.
- 20 confusable pairs, 40 references, 39 distinct part IDs: exact labels and QP/MS locators verified. Four implementation-variant pairs correctly retain the same pattern ID.

## Semantic review and documentation

- **operation vs name:** s23_41 1(c) counts matches despite LinearSearch; s21 search returns presence. GetTotalPay sums; GetPosition/Description format strings; SetTerritorySize updates relative state.
- **invoke vs implement:** Existing Push/Enqueue/SetPay remain context when a loader/main/override merely invokes them. Screenshot-only rows use EVIDENCE_RUN. Random generation inside w25_41 main is an explicit additional skill.
- **record vs class:** s25_42 TYPE NewRecord uses DATA_RECORD; w25_41 explicitly OOP Record uses OOP_CLASS and object loader. Public fields do not change this boundary.
- **physical vs logical order:** w21 PrintAll and s24_42 OutputTree print physical node storage: OUTPUT_FORMAT. Following linked next fields or left/right children is traversal.
- **rewrite vs completion:** w23_42 RecursiveValue is supplied incomplete; w22_42 readonly queue sum and s24_42 insertion sort explicitly transform control structure. Direction and readonly/dequeue distinction retained.
- **routing vs tokens:** s25_41 parses number/colour and routes into six one-dimensional arrays; w25_43 manually constructs four tokens separated by semicolons. Already supplied single-letter stack dispatch is not STRING_ROUTE.
- **queue variants:** Circular versus linear, next-free versus last-live tail, count, reset and sentinel data types remain distinct. w22_42 reduction walks backward without dequeueing; w24_42 ReturnAllData inspects live queue values.
- **compound assessment:** Explicit object-array declaration and construction are co-assessed in loaders; no repeated algorithm credit for calls. Whole-row marks remain primary editorial or non-additive assessed union, never allocated Cambridge submarks.
- **source specific rule:** s24_41/43 check digit uses floor(weighted sum/10), with 10 mapped to X; no assumed modulo algorithm. s24_42 consumed dictionary answers fit UNIQUE_SELECTION rather than occurrence count.

Read all 58 bilingual names, recognition text, English boundaries and skill/variant metadata. CHECK_DIGIT respects floor division; QUEUE_REDUCE core queue_accumulation permits readonly and destructive forms. Narrow canonical skills cover assessed patterns plus explicit additions; analyst details retained.

Read all 20 contrasts and variant notes; 40 exact map/source citation joins checked. Four same-pattern implementation variants intentionally preserved.

Read final LEAD_DECISIONS.md, three batch reviews and A3 cross-batch review. output/adapt/mixed contract explicitly documented; source-part dependencies preserved and parent expansions explained.

Seven additional facsimiles directly viewed during this Stage 2 review: `9618_w23_qp_42/p007.png`, `9618_w22_qp_42/p009.png`, `9618_s24_qp_41/p012.png`, `9618_s23_qp_42/p010.png`, `9618_w25_qp_41/p003.png`, `9618_w25_ms_41/p011.png`, `9618_w25_ms_43/p010.png`. Earlier Stage 1 source reading and visuals also informed this review.

Not a complete second visual read of all 672 parts; all 140 2025 rows and selected earlier ordinary/ambiguous cases were semantically read. Published code not execution-certified. This is independent QA acceptance, not the Lead stage gate or 2026 syllabus-completeness claim.

## Reproducible evidence

- `A8_MECHANICAL_CHECKS.json`: exact source/submission IDs, citations and independently reconstructed equivalence partitions.
- `A8_INDEPENDENT_STATISTICS.json`: independent set-based counts from immutable Stage 1 marks and submitted labels.
- `A8_AGGREGATE_CHECKS.json`: aggregate/catalog/dependency/skill/confusable joins, metric comparisons, query results and reviewed input hashes.
- `A8_REVIEW.json`: finding history and final review record.

No Stage 1 mutation, Stage 3 mapping, solution authoring or visual production was performed by this review.
