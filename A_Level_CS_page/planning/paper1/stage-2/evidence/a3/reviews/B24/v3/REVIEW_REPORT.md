# Independent A3 review — B24-v3

Decision: **CHANGES_REQUIRED**.

All eight issued inputs, nine author outputs, all six pins in the nested v3 correction input manifest, and the independent A4 v3-retest handoff rehash exactly. The A0 validator passes with 170 atomic rows, 73 containers, 170 scoring links, zero unresolved rows, 450 marks and six papers at 75 marks. All requirement and pattern references resolve.

The marking/pattern correction reviewed by A4 remains intact, but the separate A3 scope/context gate does not pass. Review of all 170 mappings found one Critical and one Major defect:

1. `9618_w24_qp_11-q4-pd-pi` is labelled `IN_SCOPE/HIGH` although its official MS accepts auto-indentation/auto-formatting as an alternative. The accepted 2026 presentation-feature requirement names prettyprint and expand/collapse code blocks; the legacy alternative is not exposed or quarantined.
2. Every one of the 64 nested atomic rows omits its immediate parent-part ID from `context_dependency_ids`. The question-root/context file is retained, but the parent part that scopes each roman-numeral child is absent.

The exact QP/MS transcript for W24/11 Q4(d)(i) and rendered QP page 10 were inspected directly. Table, diagram and code-dependent rows retain resolvable visual references; command words agree with the accepted Stage 1 records. Full affected IDs and acceptance criteria are in `FINDINGS.jsonl`.

This review does not reopen the passed A4 marking retest, repair the author packet, accept B24, or begin aggregation. A new corrected author version requires independent A3 retest and preservation of the already closed marking findings.
