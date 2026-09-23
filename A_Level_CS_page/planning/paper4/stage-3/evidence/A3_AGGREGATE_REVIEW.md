# A3 independent aggregate semantic review

Status: **one alignment correction requested**. This is a bounded review of the aggregate, not Stage 3 gate approval. Assessment requirement IDs were intentionally not reviewed because A1 is still assembling them.

## Review scope and result

Read every objective-to-block-to-book mapping, prioritising all **70 section 19/20 rows**, including the four exclusions; reviewed the full **44-subsection disposition register** and all **14 assessment/teacher constraint targets**. Also checked the selected prerequisite aliases, every block-level relationship/rationale, and the EVIDENCE_RUN chain. Reviewed counts at this snapshot: 111 objectives, 108 knowledge blocks and 55 book sections.

Mechanical cross-reference checks found no unresolved objective/block/book IDs, no missing non-excluded objective destination, no reverse-link mismatch and no exclusion with a required knowledge/book destination. All 14 constraint targets resolve and reverse-link correctly. The 44 dispositions and the underlying 14 source statements match the reviewed A3 inventory exactly.

## Finding A3-AGG-01 — align the ADT-composition example and objective prerequisites with the selected backend

Severity: medium, planning consistency. Location: `COVERAGE_MATRIX.json`, objective `SYL-19.1-30`, fields `gap.recommended_assessment_brief` and `prerequisite_objective_ids`; corresponding objective prerequisite edges in `PREREQUISITE_MAP.json`.

The final block `dictionary/other-adt-implementation` and its book rationale correctly choose a **dictionary implemented through a linked-list ADT**. `BLOCK-DEP-04` correctly marks linked-list representation, search, insertion and removal as the default backend prerequisites. However, the copied objective brief still suggests a queue implemented with two stacks, and its unconditional prerequisite objective IDs still include `SYL-19.1-21` and `SYL-19.1-22` (stack/queue representation) rather than the linked-list capabilities.

Both examples are legitimate ways to demonstrate the syllabus, so this is not an academic scope error. It is an inconsistent executable plan: the objective-level graph can impose irrelevant prerequisites and fail to represent the prerequisite that the selected default actually needs.

Requested correction: align the final brief with the linked-list-backed dictionary and align objective prerequisites with the relevant linked-list representation/search/insert/remove capabilities (`SYL-19.1-23`, `SYL-19.1-09`, `SYL-19.1-13`, `SYL-19.1-17`), or explicitly make backend-specific objective prerequisites conditional instead of unconditional. Rebuild objective edges/topological checks. Preserve the broad syllabus capability and the absence of historical assessed evidence. The two-stack queue example may remain an optional alternative if clearly labelled and disconnected from default required dependencies.

## Semantic checks that pass

- Search, sorting, stack, queue, list and tree operations link to their matching algorithm sections. Logical traversal and physical array output remain different. Tree deletion is not added.
- Linked-list standalone search and dictionary implementation remain planned syllabus gaps even though related corpus patterns exist.
- Recursion tracing targets the call-stack/unwinding block. Its corpus status remains absent; no screenshot is presented as trace evidence. Recursive binary search and transforms have conditional recursive foundations.
- OOP class/instance, getters/setters, relative updates, inheritance/override and containment remain distinct. Independent class design is supported by component foundations and does not claim the prescribed historical diagrams prove independent design.
- Read/write/append/close, record processing, file organisation and random access have appropriate distinct destinations. Random-file addressing requires persistent file operations and is not closed by the in-memory hash-table patterns.
- The no-binary-source-file constraint is retained separately and does not delete random-file processing.
- Supporting Big O, graph characteristics and recursion compiler support remain understanding blocks; graph implementation, low-level and declarative code remain excluded.
- Direct book relationships describe knowledge/algorithm support. Corpus-specific adaptations (RLE, check digit, grouping, multi-key sort, paired stack restoration, queue inspection, object-file dispatch and hashing variants) are marked as component foundations or adaptations, with QP/MS authority retained.
- Broad procedural/prerequisite aliases are labelled instructional links, not evidence that each historical occurrence assesses every linked objective. The exact-part evidence remains in the coverage matrix.
- EVIDENCE_RUN has an assessment-constraint-based primary destination. Its secondary testing links do not invent a new syllabus content objective or claim that prescribed screenshots establish independent test design.
- Every assessment/teacher constraint has an appropriate exam-workflow, source-contract, decomposition or random-file destination; the book testing chapter is a foundation, not authority for Cambridge administrative rules.

## Source checks and limits

The syllabus facts and exclusions were checked against the earlier fully reviewed 2026 Version 2 inventory. This aggregate review additionally reread coursebook printed pp488–490 (PDF504–506) and pp531–535 (PDF547–551) to resolve the ADT-composition, dictionary, sequential/append and random-file boundaries. The dictionary's linked-list foundation is explicitly supported by the book text and Activity19Q. The book's sample pseudocode is not certified as a solution.

This is not a fresh page-by-page audit of all 55 book locators; A2 owns that source-locator audit. Nor does it approve pending assessments, authored lessons, code execution or publication. No aggregate files were modified by this review.

Snapshot SHA-256 values:

- `COVERAGE_MATRIX.json`: `f11b7592bbd5efc1b64edef91f69bc008eadc179d52e0f1307aa5939185ba39b`
- `BOOK_KNOWLEDGE_MAP.json`: `121992d5ec92d70ae67fd5daa93789b0d5564ed10545d6494011b78fd85b3ae4`
- `PREREQUISITE_MAP.json`: `f75356247f06d0f966a7c9390f5ffde2d395c2990f9b77e9518e341b276167cd`
