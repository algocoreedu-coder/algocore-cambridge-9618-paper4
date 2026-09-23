# Independent review — Stage 2 plan

Review date 22/09/2026. Reviewer: fresh A9 planning reviewer. Reviewed version: initial v1.0 plan. Result: **CHANGES_REQUIRED — 0 Critical, 6 Major**.

| Finding | Severity | Problem | A0 resolution in v1.1 |
|---|---|---|---|
| S2P-A9-01 | Major | Pattern counts depended on equivalence, but aggregate/equivalence were parallel | C3 split into provisional patterns → mandatory different-author equivalence → final pattern rebuild |
| S2P-A9-02 | Major | Leakage checked only recorded edges; no false-negative control | Added candidate-pair universe, multi-channel recall, complement audit, quarantine and retest trigger |
| S2P-A9-03 | Major | Glossary used moving objective IDs and had no final reconciliation | Glossary v1 uses frozen authority only; mandatory A6 v2 reconciliation after final objective/pattern IDs |
| S2P-A9-04 | Major | C0 omitted Stage 1 schema/policy/final evidence pins | Added direct paths/hashes for schema, policy, integrity, A9 report/check/handoff and A0 audit |
| S2P-A9-05 | Major | Batch rule could force out-of-scope items into 2026 objective IDs | Requirement mapping conditional by scope status; out/review rows require rationale + quarantine |
| S2P-A9-06 | Major | Some work/review orders lacked full contract | Added dispatch-time input/version requirements and reusable independent review packet contract |

The reviewer independently confirmed all originally listed hashes and reproduced 99 objective groups, 17 sections, 893 atomic units, 379 containers, 927 marking rows, 893 scoring links, 2,250 marks, 233 populated command words and 128 unresolved.

## Retest v1.1

Independent A9 retest result: **PASS — 0 Critical, 0 Major, 0 Minor**. Findings S2P-A9-01 through S2P-A9-06 are closed. A9 verified 19/19 authority path/bytes/SHA pins, all five accepted-candidate decision hashes, the C3a→C3b→C3c and C4a→C4b→C4c dependencies, candidate-pair completeness controls, glossary reconciliation, conditional objective mapping, explicit BYY inputs, reusable review packets and the final user checkpoint. Stage 2 remains NOT_STARTED.
