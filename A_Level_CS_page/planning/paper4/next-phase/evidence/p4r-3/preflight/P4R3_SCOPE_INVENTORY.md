# P4R-3 production scope inventory

**Status:** `READ_ONLY_PREFLIGHT_COMPLETE`  
**Authority:** inventory only; this document is not a gate signature.  
**Target:** `paper4-2026-s9-v2`  
**Date:** 2026-09-23

## Scope result

P4R-3 has exactly **20 remaining lessons and 82 KnowledgeUnits** after excluding the six P4R-2 pilot lessons: `data-models`, `binary-search`, `queue`, `recursion`, `hashing`, and `object-files`. The existing execution map supplies **42 distinct official Stage 4 patterns** to fourteen lessons. Six lessons have an empty pattern set: `testing`, `dictionary`, `random-files`, `exceptions`, `performance`, and `graphs`.

The full machine-readable inventory, including every stable KnowledgeUnit ID, fixture contract, join, source candidate, and risk, is in `P4R3_SCOPE_INVENTORY.json` beside this document.

| Batch | Remaining lessons | KU count |
|---|---|---:|
| C1 | procedural-design, validation-rules, testing | 17 |
| C2 | text-processing, search-collections, sorting | 12 |
| C3 | stack, linked-list | 10 |
| C4 | binary-tree, dictionary, performance, graphs | 14 |
| C5 | oop-model, oop-state, oop-inheritance, oop-aggregation | 14 |
| C6 | text-files, random-files, exceptions | 11 |
| C7 | exam-workflow | 4 |
| **Total** | **20 lessons** | **82** |

Every lesson reports `COMPLETE_UPSTREAM_LOCATORS_AVAILABLE`: there are no unresolved coursebook section IDs or syllabus objective IDs in the promoted P4R-1 mappings. This means authoring can start from stable locators, but the locator status does not certify existing prose or code.

## Patternless lesson decisions

No new official pattern is introduced here. A cross-lesson association only satisfies the schema relationship; it does not transfer official marks, marking atoms, or the source authority of the original lesson.

| Lesson | Proposed existing-pattern association | Disposition | Rationale and limit |
|---|---|---|---|
| testing | `EVIDENCE_RUN` | Schema-valid provisional | The required program is a prescribed-test runner with expected/actual/pass evidence. It still needs a testing-specific rubric. |
| dictionary | `ALGORITHM_TRANSLATE`, `GROUP_AGGREGATE` | Schema-valid provisional | CRUD is an otherwise unnamed supplied algorithm; frequency counting is directly a group aggregate. `GROUP_AGGREGATE` cannot stand in for find/delete/representation criteria. |
| random-files | `ALGORITHM_TRANSLATE`, `EVIDENCE_RUN` | **Lead contract decision required** | The pair can carry seek/read/update code and evidence, but no Stage 4 pattern expresses fixed-record addressing. Text-file patterns would be semantically false. |
| exceptions | `ALGORITHM_TRANSLATE`, `EVIDENCE_RUN` | **Lead contract decision required** | The pair carries implementation and rerun evidence but has no exception-specific recognition/recovery contract. |
| performance | `LINEAR_SEARCH`, `BINARY_SEARCH`, `BUBBLE_SORT`, `INSERTION_SORT`, `EVIDENCE_RUN` | Schema-valid provisional | The executable compares and instruments these four official algorithms. Big-O and choice justification still need performance-specific criteria. |
| graphs | `DATA_STORAGE`, `ALGORITHM_TRANSLATE`, `EVIDENCE_RUN` | **Lead contract decision required** | Storage, edge operations, and evidence are representable, but directedness and adjacency semantics have no official Stage 4 pattern. |

The Lead decisions for `random-files` and `graphs` block C4/C6-dependent schema promotion; the decision for `exceptions` blocks the C6 gate. A safe decision can approve the limited generic association with a lesson-specific AlgoCore rubric and `official_marks=null`. If the Lead instead revises the pattern contract, that revision belongs in a controlled mapping/schema wave and must not be smuggled into P4R-3 authoring.

## Lesson production inventory

The ID prefix in the KU column is `ac-9618-p4-2026-python.lesson.<lesson>.knowledge.`. The JSON inventory stores every ID in full.

### C1 — Foundations

| Lesson | Exact KU suffixes | Official patterns | Python behavior and fixtures | Required joins and main risks |
|---|---|---|---|---|
| procedural-design (8) | `selection-iteration`, `subroutine-contracts`, `parameter-modes`, `pseudocode-translation`, `decomposition`, `paradigm-choice`, `abstraction-io`, `console-library` | `ALGORITHM_TRANSLATE` | Translate pseudocode into decomposed functions and a main flow. Normal: valid classify path. Boundary: endpoints, zero/one loop. Failure: invalid input and parameter-effect misconception preserve caller state. | Marking chain `algorithm-translate`, 13 atoms; 3 items, 21 requirements, 2 destinations. Keep Python object-reference semantics distinct from Cambridge `BYREF`; do not compress eight KUs into one snippet. |
| validation-rules (4) | `input-validation`, `rule-outcomes`, `unique-selection`, `check-digit` | `CHECK_DIGIT`, `RULE_COMPUTE`, `UNIQUE_SELECTION`, `VALIDATE_INPUT` | Implement validation/retry, rule-table calculation, no-replacement selection, and parameterised check digit. Cover exact endpoints, leading zero, repeated item, malformed and mismatching values. | Four exact marking chains, 208 atoms; 3 items, 8 requirements. Weighting/modulus/rounding must come from the task; fixture-controlled retry must terminate. |
| testing (5) | `test-design`, `tracing-debugging`, `repair-enhance`, `source-contract`, `capture-provenance` | none; propose `EVIDENCE_RUN` | Table-driven normal/boundary/invalid tests, independent reset, expected versus actual, first divergence, repair, regression. Failure fixture must fail before repair and pass after it. | No current marking chain/atoms; 3 items, 8 requirements. Author a testing rubric and explicit pass rule; screenshots alone are insufficient evidence. |

### C2 — Text, search, and sort

| Lesson | Exact KU suffixes | Official patterns | Python behavior and fixtures | Required joins and main risks |
|---|---|---|---|---|
| text-processing (4) | `character-comparison`, `delimiter-tokenisation`, `typed-routing`, `run-length` | `RUN_LENGTH_ENCODE`, `STRING_COMPARE`, `STRING_ROUTE`, `STRING_SPLIT` | Character comparison, delimiter tokenisation, typed routing, complete RLE. Cover empty/single/prefix/final run and reject malformed fields without partial output. | Four chains, 26 atoms; 3 items, 1 requirement. Preserve empty-token policy and flush the final run. |
| search-collections (4) | `linear-find`, `count-all`, `filter-all`, `group-totals` | `COUNT_OCCURRENCES`, `FILTER_RECORDS`, `GROUP_AGGREGATE`, `LINEAR_SEARCH` | Find/count/filter full scans and key-based aggregation. Cover empty, first/last, no match, one record; reject missing keys with declared sentinel/state. | Four chains, 106 atoms; 3 items, 2 requirements. Keep find-first distinct from collect-all and follow prompt-specific case/duplicate rules. |
| sorting (4) | `bubble-passes`, `insertion-shifts`, `ordered-insert`, `comparator-variants` | `BUBBLE_SORT`, `INSERTION_SORT`, `ORDERED_INSERT` | Bubble, insertion, bounded ordered insert with comparator variants. Cover empty, singleton, sorted/reverse/equal, front/end/full; failed insert leaves state unchanged. | Three chains, 85 atoms; 3 items, 5 requirements. Comparator direction must be invariant; ordered insert must shift before write and separate logical size from capacity. |

### C3 — Stack and linked list

| Lesson | Exact KU suffixes | Official patterns | Python behavior and fixtures | Required joins and main risks |
|---|---|---|---|---|
| stack (5) | `representation-conventions`, `push`, `pop`, `paired-restoration`, `reduce-operands` | `STACK_PAIR`, `STACK_POP`, `STACK_PUSH`, `STACK_REDUCE`, `STACK_SETUP` | Fixed array stack, push/pop, two-stack restoration, operand reduction. Cover empty, one, full, underflow and overflow without pointer movement/corruption. | Five chains, 91 atoms; 3 items, 6 requirements. Declare top-used versus next-free once; preserve non-commutative operand order. |
| linked-list (5) | `representation-free-list`, `traversal`, `search`, `insert`, `remove-recycle` | `LIST_INSERT`, `LIST_REMOVE`, `LIST_SETUP`, `LIST_TRAVERSE` | Array nodes plus free list; logical traversal/search, insert, remove, recycle. Cover empty/single/head/tail/last-free; reject exhausted/missing/corrupt cases safely. | Four chains, 110 atoms; 3 stable A0 items, 7 requirements, progression plus search-gap destination. Never present physical array order as logical list order; reconnect before recycle. |

### C4 — Tree, dictionary, performance, and graph

| Lesson | Exact KU suffixes | Official patterns | Python behavior and fixtures | Required joins and main risks |
|---|---|---|---|---|
| binary-tree (4) | `representation`, `ordered-insert`, `search`, `traversals` | `TREE_INSERT`, `TREE_SEARCH`, `TREE_SETUP`, `TREE_TRAVERSE` | BST setup/insert/search and exact traversals. Cover empty/root/skew/min/max/duplicate; missing/disallowed duplicate must not change links. | Four chains, 89 atoms; 3 items, 4 requirements. Traversal visit position and duplicate policy must be explicit. |
| dictionary (5) | `adt-interface`, `find-insert`, `delete`, `representation-choice`, `other-adt-implementation` | none; propose `ALGORITHM_TRANSLATE`, `GROUP_AGGREGATE` | CRUD with duplicate/missing contracts, alternative representation, and frequency aggregation. Cover empty/one/duplicate/last deletion and malformed/capacity failure. | No current chain/atoms; 3 stable A0 items, 3 requirements, 3 destinations. Python `dict` convenience cannot replace ADT explanation; rebuild missing pass rules. |
| performance (3) | `asymptotic-cost`, `algorithm-choice`, `trace-cost` | none; propose four algorithm patterns plus `EVIDENCE_RUN` | Instrument comparisons/swaps/shifts across input size/order while checking result equivalence. Reject binary search on unsorted data; reset counters per run. | No direct chain/atoms; 3 items, 8 requirements, 2 destinations. Timing once is not complexity evidence; label measured count, Big-O, and justification separately. |
| graphs (2) | `characteristics`, `structure-choice` | none; generic association needs Lead | Directed/undirected adjacency list, edge operations, neighbours, matrix/list tradeoff. Cover empty/isolated/self-loop/duplicate/one-edge; invalid endpoint cannot create half an undirected edge. | No current chain/atoms; 3 items, 2 requirements, 2 destinations. Declare directedness and edge policies; no graph-specific Stage 4 pattern exists. |

### C5 — Object-oriented programming

| Lesson | Exact KU suffixes | Official patterns | Python behavior and fixtures | Required joins and main risks |
|---|---|---|---|---|
| oop-model (4) | `class-object`, `constructor`, `instantiate`, `class-design` | `OOP_CLASS`, `OOP_INSTANTIATE` | Responsibility-aligned class, constructor, multiple independent instances. Cover min/optional/one object; reject invalid constructor data without partial append. | Two chains, 245 atoms; 3 items, 7 requirements. Do not confuse Python access conventions with pseudocode visibility; avoid shared mutable class state. |
| oop-state (4) | `encapsulation`, `getters`, `setters`, `rule-updates` | `OOP_GET`, `OOP_SET`, `OOP_UPDATE` | Getter, replacement setter, rule update, invariant-preserving failure. Cover exact limits; invalid update leaves prior state. | Three chains, 155 atoms; 3 items, 5 requirements. Direct field mutation undermines the method; trace setter and rule update separately. |
| oop-inheritance (3) | `base-derived`, `override-dispatch`, `substitutability` | `OOP_OVERRIDE`, `OOP_SUBCLASS` | Base/subclass construction, override, mixed-collection dynamic dispatch. Include controlled missing-super failure. | Two chains, 43 atoms; 3 items, 2 requirements, progression plus polymorphic-use gap. Subclass declarations alone do not demonstrate polymorphism. |
| oop-aggregation (3) | `has-a`, `bounded-add`, `nested-access` | `OOP_CAPACITY_ADD` | Has-a relation, bounded object references, nested calls. Cover empty/one/full; rejected add must not increment count or overwrite. | One chain, 4 atoms; 3 items, 2 requirements. Keep object reference semantics and count/capacity invariant explicit. |

### C6 — Files and exceptions

| Lesson | Exact KU suffixes | Official patterns | Python behavior and fixtures | Required joins and main risks |
|---|---|---|---|---|
| text-files (5) | `file-lifecycle`, `record-loading`, `serial-sequential`, `write-append`, `adt-loading` | `FILE_READ_ARRAY`, `FILE_WRITE` | Safe text lifecycle, record parsing, load to array/ADT, overwrite versus append. Cover empty/blank/no-final-newline/one/full; malformed or missing input cannot corrupt committed output. | Two chains, 158 atoms; 3 items, 11 requirements, 2 destinations. Use fixture-local paths and deterministic UTF-8/newline handling; retain source terminology for serial/sequential. |
| random-files (3) | `organisation-access`, `record-address`, `read-write-update` | none; generic association needs Lead | Fixed-length pack, offset calculation, seek/read, in-place update, unaffected-neighbour proof. Cover first/last/max/padding/address base; reject invalid address/size/encoding/short read without growth. | No current chain/atoms; 3 items, 4 requirements, 2 destinations. Text-file patterns cannot prove direct access; record size, encoding, padding, and address base are contract fields. |
| exceptions (3) | `runtime-failures`, `handle-recover`, `cleanup` | none; generic association needs Lead | Specific success/missing/conversion/I/O paths with preserved prior state and cleanup. Cover empty/whitespace/limit and injected failure. | No current chain/atoms; 3 items, 4 requirements, 2 destinations. Avoid bare `except`; label `finally` and context manager as Python implementation choices. |

### C7 — Exam integration

| Lesson | Exact KU suffixes | Official patterns | Python behavior and fixtures | Required joins and main risks |
|---|---|---|---|---|
| exam-workflow (4) | `compose-main`, `format-output`, `evidence-document`, `source-and-rubric` | `EVIDENCE_RUN`, `MAIN_FLOW`, `OUTPUT_FORMAT` | Compose loader→validate→process→format, emit exact output, and produce requirement-code-test-evidence records. Cover minimum/no-result/format endpoints; upstream failure blocks downstream mutation and records first failed stage. | Three chains, 497 atoms; 3 items, 4 requirements. Current B8 map has no author/independent rerun reference; output and evidence must come from identical code/fixtures. |

## Production sequence and controls

Each C batch should follow the locked sequence:

1. Recheck lesson source map and preserve every stable KU ID.
2. Author bilingual theory with direct syllabus/coursebook locators and explicit theory→Python links.
3. Author one schema-valid `PythonArtifact` with normal, boundary, and failure fixtures; produce exact author and independent reruns plus stable line IDs.
4. Build prompt-specific marking chains and three assessment items. Official MS atoms remain source-owned; inferred criteria stay AlgoCore-authored with `official_marks=null`.
5. Review language parity, misconception repair, accessibility, output identity, path safety, and failure-state integrity.
6. Resolve all required findings through an independent recheck before the Lead batch gate.
7. Merge into the canonical registry only after the batch gate passes.

The Stage 5 implementations and current Stage 9 snippets are candidate material. None can be promoted by copying its prior execution claim. Each artifact needs fresh deterministic fixtures, exact output, independent rerun evidence, schema validation, and resolvable line bindings.

## Blocking findings

- `P4R3-PREFLIGHT-001`: Lead contract decision for `random-files` and `graphs` before their promotion.
- `P4R3-PREFLIGHT-002`: Lead contract decision for `exceptions` before the C6 gate.
- `P4R3-PREFLIGHT-003`: all 60 practice items require prompt-level requirement/destination verification and destination-specific rubrics.
- `P4R3-PREFLIGHT-004`: all 20 Python artifacts require fresh author run, independent rerun, schema validation, and line-ID resolution.

These findings control future authoring; they do not change the P4R-2 gate and do not sign a P4R-3 batch.
