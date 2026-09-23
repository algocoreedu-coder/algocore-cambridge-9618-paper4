# P4R-3/P4R-4 A6 content, language and accessibility review

## Decision

**REWORK_REQUIRED.** A6 does not recommend passage to the Lead/A8 gate yet. The same read-only checker reports the same five required finding groups on Node 20.11.0 and Node 24.19.0. No canonical content was changed during this review.

The production set has the correct identity and accessibility structure, but the 82 production KnowledgeUnits are not yet semantically bilingual. Four fields use an English unit-specific rendering beside a generic Vietnamese template. Passing a non-empty `{vi,en}` shape is insufficient when the two members teach different content.

## Required findings

| Finding | Affected | Required closure |
|---|---:|---|
| `A6-KNOWLEDGE-EXPLANATION-PARITY` | 82/82 KnowledgeUnits | Rewrite Vietnamese explanation so it covers every concept, field and constraint taught by the English explanation; review meaning in both directions. |
| `A6-KNOWLEDGE-PYTHON-CONNECTION-PARITY` | 82/82 KnowledgeUnits | Make both locales describe the same unit-specific code role against the same frozen line IDs. Do not leave an invariant-only VI sentence beside an artifact-wide EN behavior list. |
| `A6-KNOWLEDGE-REPRESENTATION-PARITY` | 82/82 KnowledgeUnits | Mirror the same representation fields, state and decision semantics in both locales. |
| `A6-KNOWLEDGE-SCENARIO-PARITY` | 82/82 KnowledgeUnits | Give Vietnamese the same concrete fixture data, boundary/failure condition and expected behavior as English. |
| `A6-TERMINOLOGY-MISMATCH` | 10 field occurrences | Use the established bilingual terms for binary tree, linked list and random file, or retain the English technical token explicitly beside its Vietnamese term. |

Every affected KnowledgeUnit ID and every terminology location is listed in `A6_CONTENT_CHECK_NODE20.json` and `A6_CONTENT_CHECK_NODE24.json`.

## Passing controls retained through rework

| Control | Result |
|---|---:|
| Exact production scope | 82 KnowledgeUnits, 20 PythonArtifacts, 60 fixtures, 42 MarkingChains, 1,830 atoms, 60 AssessmentItems, 126 traces, 351 events |
| Copyable/executed source identity | 20/20 |
| Source SHA-256 identity | 20/20 |
| Fixture file ↔ artifact input identity | 60/60 |
| KnowledgeUnit ↔ artifact/line identity | 82/82 |
| Visual ↔ artifact/fixture/output/line identity | 351/351 events |
| Bilingual visual accessibility metadata | 351/351 events |
| Unique contiguous focus sequence | 351/351 events |
| Hidden self-check contract | 82/82 |
| Hidden assessment contract | 60/60 |
| Assessment shared code/fixture/output identity | 60/60 |
| Provisional authority boundary | 18/18 items across dictionary, exceptions, graphs, performance, random-files and testing |
| Local path / localhost leaks | 0 |

The 18 provisional assessments use `AlgoCore_representational_workflow_only`, keep `official_marks=null`, and state in both locales that their proposed pattern IDs are workflow/representation labels rather than Cambridge mark allocations. The six provisional lessons remain excluded from the official visual trace set.

## Review boundary

This is a content-layer review. It does not sign the Lead or A8 gate and does not perform browser QA. Keyboard operation in the rendered UI, screen-reader behavior, 320 px layout, zoom, theme and reduced-motion behavior remain for the runtime/browser stage.

## Reproduction

Run from `A_Level_CS_page/algocore-fumadocs`:

```powershell
node ..\planning\paper4\next-phase\evidence\p4r-3\a6\check-a6-production-content.mjs --out ..\planning\paper4\next-phase\evidence\p4r-3\a6\A6_CONTENT_CHECK_NODE20.json
& 'C:\Users\Nguyen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' ..\planning\paper4\next-phase\evidence\p4r-3\a6\check-a6-production-content.mjs --out ..\planning\paper4\next-phase\evidence\p4r-3\a6\A6_CONTENT_CHECK_NODE24.json
```
