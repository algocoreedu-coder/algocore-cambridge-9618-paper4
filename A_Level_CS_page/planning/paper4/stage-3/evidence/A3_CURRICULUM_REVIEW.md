# A3 Curriculum Review — Stage 3

Status: submitted for Lead review. This is not a gate approval and does not start Stage 4.

The inventory reads the frozen local 2026 Version 2 syllabus. Its original PDF contains 49 pages. Printed page numbers and PDF page indexes agree for every inventory citation; the relevant source pages were inspected visually, not inferred from a fixed offset. The original source SHA-256 remains in the JSON.

## Scope and completeness

- 111 editorial objective rows: 50 core practical, 16 supporting understanding, 4 explicit exclusions, 37 selected prerequisites and 4 corpus-support bridges.
- The core inventory decomposes all objectives and enumerated capabilities in 19.1, 19.2, 20.1 and 20.2. Umbrella statements are represented by their atomic facets; AS prerequisites are deliberately selective.
- 44 numbered subsections from the complete syllabus overview have a scope disposition. This proves the rest of the syllabus was considered; it does not turn the project into a complete Paper 1/2/3 course.
- 14 assessment/teacher constraints are separate from knowledge objectives, including AO3, offline console programming, saving and evidence, source files and direct-access facilities.
- Stable IDs such as `SYL-19.1-09` are AlgoCore editorial identifiers, not Cambridge-issued objective numbers.

## Boundaries requiring explicit decisions

1. **Linked-list search (`SYL-19.1-09`)** is partially evidenced by searching before removal: `9618_w24_41_3(d)(i)` and `9618_s25_43_3(b)(iv)`. It still needs an authored standalone search with a specified return/not-found contract. A removal routine is not automatically a complete search lesson.
2. **Dictionary implementation (`SYL-19.1-24`)** remains required. In-memory hashing patterns offer supporting mechanisms, but do not establish a complete dictionary interface. Suggested retrieval, insertion/update and missing-key tests are editorial demonstrations of the named ADT, not an invented official operation list.
3. **Recursion trace (`SYL-19.2-04`)** needs a call/local-state/return trace. A screenshot of a correct final answer is only execution evidence. Recursive code is directly represented through such rows as `9618_w22_42_3(d)`, `9618_s24_42_3(b)(i)` and `9618_s24_42_3(d)(i)`; only these actual recursive variants support the recursive capability.
4. **Class design (`SYL-20.1-18`)** has partial corpus support because historical tasks commonly supply class diagrams and member requirements. An independent scenario-to-class design check is required. Containment examples are the Hand/Card and Station/Train tasks, not the unrelated TreasureChest constructor.
5. **File organisation (`SYL-20.2-07` to `09`)** is distinct from access method. Reading lines sequentially does not prove key-ordered sequential-file organisation. Array/bucket hashing is not random-file processing. The random-file objective remains in 20.2 despite the rule that supplied files contain no binary files.
6. **Append and exception handling are observed**, not gaps invented from missing taxonomy names. `9618_s25_41_2(c)` QP p5 and MS pp26–27 explicitly ask for append plus exception handling. `9618_w22_41_1(b)` QP p2 and MS pp3–4 explicitly require file exception handling. QP p5 and MS p26 of the former and MS p3 of the latter were additionally viewed as facsimiles. This map makes no endorsement of every language example in those mark schemes.
7. **Big O, binary-search preconditions/performance, recursion stack/unwinding and graph features/use** need supporting checks. They are not promoted to separate compulsory theory essays in Paper 4. Graph-structure code is explicitly excluded. Binary-tree deletion is not added to the required operation list.
8. **Procedural assumptions** retain AS 11.3 through explicit prerequisite links. Python parameter semantics need an accurate bridge from pseudocode value/reference terminology; do not claim Python has a selectable pass-by-reference parameter mode.

## Evidence interpretation

Candidate pattern links distinguish direct, partial and support roles. Each linked representative part retains QP/MS page locators and the source-grounded Stage 2 criterion reason. Links are representative, not frequency counts or claims that every occurrence of a broad pattern covers every variant. All 111 rows now pass an explicit semantic evidence audit. Automatic first-by-pattern examples have been removed entirely. Manually selected evidence covers 73 objectives using 45 distinct source parts; every evidence reason states the relevant facet and any limitation. The other objectives assert no exact-part assessment evidence.

The inventory does not claim every historical question has been reread in Stage 3. Most task-boundary evidence is inherited from the frozen, Lead-reviewed Stage 2 map. Source rechecks here concentrate on syllabus scope and the file/exception boundary. A later solution must still respect Stage 1 source issues.

`observed` means the corpus supplies an assessed capability example; it does not mean all variants, understanding, independent design or transfer performance have been taught. `partial`, `support_only` and `absent` each carry an authored assessment brief. Even observed objectives retain a variant-completeness check.

## Verification performed

- Asserted every syllabus anchor exists on the cited natural-text page, normalising whitespace and the source line-break in `built-in` only.
- Viewed original syllabus renders for pp9–11, 13, 27–32, 37–40 and 48. Checked two-column objective/guidance alignment and printed page numbers.
- Read pp9–10 for the 44-subsection disposition register; read p39 teacher guidance and p48 version/update statement.
- Asserted all pattern IDs exist in the 58-pattern catalog, every selected part ID exists in the 672-row map and all prerequisite IDs resolve.
- Kept exclusions, assessment rules, core knowledge and selected prerequisites distinct.
- Did not modify Stage 0–2, author a solution, claim tests passed on exam code, or start a later stage.

Lead still owns review of lesson/block coverage, book concordance and the final Stage 3 gate. A3 proposes the following independent checks: every non-excluded objective has a knowledge/lesson/block destination, every gap brief reaches a planned assessment, and no support-only row is presented as historical assessed coverage.

## Lead rework closed

Lead identified that the separate ADT-from-ADT objective was not guaranteed by five representation rows allowing built-in types OR another ADT. Added `SYL-19.1-30` as core practical, without changing any existing ID. Its authored assessment must actually implement one named ADT through another ADT; array-only setup does not close this objective. No observed corpus example is claimed. The dependency graph links the stack/queue representation knowledge for the proposed transfer example.

A8 rework: recursion tracing is now `absent`, with no exact-part examples; an execution screenshot is not trace evidence. Pattern-level partial roles and exact-part coverage roles are now explicitly separated. Verified write/append, recursive implementation and exception-code criteria receive `direct` exact-part roles even though their broad pattern contains other variants. Explanation/independent choice remain partial where the task prescribes the operation. Generic EVIDENCE_RUN examples for fault diagnosis remain support-only and never enter asserted corpus evidence.

## Full semantic evidence rework after A8

The second A8 pass found that the NewRecord example did not demonstrate heterogeneous field types and that some generic main-program examples did not contain a post-condition loop. Both were valid findings. The correction removes the underlying first-matching-pattern selection, not just those two instances.

- `SYL-10.1-02` now cites `9618_s23_42_2(a)`: SaleID is STRING and Quantity INTEGER, directly confirmed from QP p5 and MS p11. MS p11 was also visually checked. The former NewRecord example had integer fields and was inappropriate for the heterogeneous facet.
- `SYL-11.2-04` now cites only `9618_s21_41_3(c)(iv)`: QP p11 requires an initial answer and repetition until correct; MS p28 credits looping until correct. This is explicitly **partial** at-least-once behavioural support, not a claim that the task requires a particular post-condition syntax or asks for a loop-choice explanation. The unrelated single-call/single-input examples are removed. MS p28 was also visually checked.
- All candidate links with the role `support` now have empty example lists. In particular, generic output screenshots do not appear as evidence of debugging, recursive tracing, parameter semantics, Big O reasoning or graph understanding.
- Every retained exact-part example is hand-selected in `a3_semantic_evidence.py`; each has a facet-specific reason. Setup-only representations, prescribed data types, prescribed test cases, behaviour-preserving rewrites and supplied class designs are conservatively marked partial where they do not cover the full objective.
- The audit preserves exact-part direct roles for append and exception code, while broader pattern roles remain conditional where necessary.

`A3_SEMANTIC_EVIDENCE_AUDIT.json` records all 111 decisions. Current corpus-coverage statuses are 42 observed, 31 partial, 19 support-only, 15 absent and 4 excluded. These are objective-coverage classifications, not counts of lessons, exam questions or marks. Counts by scope are unchanged: 50 core, 16 understanding, 4 excluded, 37 prerequisites and 4 corpus support.

Verification: all 74 retained evidence links resolve to 45 distinct frozen Stage 2 parts; their pattern tags and QP/MS anchors resolve. No first-tag examples remain. Source-specific semantic rechecks use the frozen reviewed Stage 2 requirements, with direct original-page rechecks for the corrected record/loop and earlier file/exception cases. This statement does not claim a new complete reread of all historical PDFs.
