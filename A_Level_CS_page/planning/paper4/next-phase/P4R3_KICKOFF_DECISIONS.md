# P4R-3 Lead kickoff decisions

P4R-2 passed. P4R-3 covers the remaining 20 lessons and 82 Stage 3 KnowledgeUnits across C1–C7.

## Pattern associations for lessons without a direct execution-map pattern

Only existing official pattern IDs may be used. These associations identify reusable execution or evidence behavior; they do not transfer Cambridge marks, marking atoms or domain coverage from another lesson.

| Lesson | Approved association | Boundary |
|---|---|---|
| `testing` | `EVIDENCE_RUN` | Test evidence workflow only; use a testing-specific AlgoCore rubric. |
| `dictionary` | `ALGORITHM_TRANSLATE`, `GROUP_AGGREGATE` | `GROUP_AGGREGATE` covers only the frequency subtask; dictionary ADT operations require a lesson-specific rubric. |
| `performance` | `LINEAR_SEARCH`, `BINARY_SEARCH`, `BUBBLE_SORT`, `INSERTION_SORT`, `EVIDENCE_RUN` | Algorithm patterns prove executions; operation counts and asymptotic claims require performance-specific criteria. |
| `graphs` | `DATA_STORAGE`, `ALGORITHM_TRANSLATE`, `EVIDENCE_RUN` | Association is representational/workflow only; no graph-specific official marking claim may be inferred. |
| `random-files` | `ALGORITHM_TRANSLATE`, `EVIDENCE_RUN` | Fixed-record addressing and binary file semantics require a lesson-specific rubric. |
| `exceptions` | `ALGORITHM_TRANSLATE`, `EVIDENCE_RUN` | Exception type, recovery and cleanup require a lesson-specific rubric. |

## Production controls

1. A1 source and disposition lock precedes authoring for every batch.
2. A2 authors the exact 82 KnowledgeUnits with bilingual method, misconceptions, exam signals and direct Python line links.
3. A3 supplies one executable PythonArtifact per remaining lesson with three frozen fixtures and author/independent reruns.
4. A7 may reuse a global MarkingChain only where the pattern and requirement truly match; otherwise the assessment uses `AlgoCore_authored_rubric` with `official_marks: null`.
5. A6 reviews bilingual terminology, shared code/fixture identity, disclosure and content accessibility before Lead acceptance.
6. Canonical registry merge waits for batch reviewer PASS. P4R-4 visual generation consumes only reviewed Python artifacts.

