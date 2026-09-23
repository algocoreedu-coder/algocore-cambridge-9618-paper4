# P4R-3/P4R-4 A6 final content review

## Decision

**PASS** for the canonical content layer. The independent A6 checker returns PASS on Node 20.11.0 and Node 24.19.0 with identical results apart from the runtime field. It checks 6,141 bilingual pairs and 105 controlled terminology occurrences with zero hard findings.

A6 made no canonical content changes and does not sign the Lead or A8 gate.

## Closed findings

| Finding | Previous scope | Final result |
|---|---:|---|
| `A6-KNOWLEDGE-EXPLANATION-PARITY` | 82/82 KnowledgeUnits | **CLOSED** — the two locales now teach the same unit-specific concepts and constraints. |
| `A6-KNOWLEDGE-PYTHON-CONNECTION-PARITY` | 82/82 KnowledgeUnits | **CLOSED** — both locales now describe the same code role against the exact shared artifact and frozen line IDs. |
| `A6-KNOWLEDGE-REPRESENTATION-PARITY` | 82/82 KnowledgeUnits | **CLOSED** — representation fields, state and decision semantics match across locales. |
| `A6-KNOWLEDGE-SCENARIO-PARITY` | 82/82 KnowledgeUnits | **CLOSED** — both locales now describe the same concrete fixture case and expected behavior. |
| `A6-TERMINOLOGY-MISMATCH` | 10 occurrences | **CLOSED** — 105/105 controlled terminology occurrences pass. |

## Final evidence matrix

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

The 18 provisional assessments retain `AlgoCore_representational_workflow_only`, `official_marks=null`, and bilingual wording that denies Cambridge mark-allocation authority. These six lessons remain outside the official visual trace set.

## Runtime evidence

- `A6_CONTENT_CHECK_NODE20.json`: PASS; SHA-256 `2ea1a94189840db5351d5085c05e58d50c7e9429161df209cf11463aac088796`
- `A6_CONTENT_CHECK_NODE24.json`: PASS; SHA-256 `83af34251be761cdea90e7c9b039f88ad565a84c33001be2097b382d064f4f4c`

## Review boundary

This PASS covers canonical content, shared identities, disclosure contracts, event accessibility metadata, and focus sequencing. Rendered keyboard behavior, screen-reader output, 320 px layout, zoom, theme and reduced motion remain for the browser/runtime gate.

## Reproduction

Run from `A_Level_CS_page/algocore-fumadocs`:

```powershell
node ..\planning\paper4\next-phase\evidence\p4r-3\a6\check-a6-production-content.mjs --out ..\planning\paper4\next-phase\evidence\p4r-3\a6\A6_CONTENT_CHECK_NODE20.json
& 'C:\Users\Nguyen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' ..\planning\paper4\next-phase\evidence\p4r-3\a6\check-a6-production-content.mjs --out ..\planning\paper4\next-phase\evidence\p4r-3\a6\A6_CONTENT_CHECK_NODE24.json
```
