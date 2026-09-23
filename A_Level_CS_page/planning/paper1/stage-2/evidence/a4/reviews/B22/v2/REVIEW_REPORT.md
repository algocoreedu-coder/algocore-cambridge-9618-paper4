# Independent A4 marking/pattern review - B22-v2

Review ID: `P1-S2-A4-REVIEW-B22-v2`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B22-v2 author  
Date: 22/09/2026  
Decision: `CHANGES_REQUIRED`

## Decision basis

The frozen packet is structurally complete. The issued input manifest and every pinned input rehash exactly; all ten author outputs match the author output manifest. The packet contains the exact 188 atomic units, 78 non-scoring containers and 32 unresolved context-only records. Every atomic target has one scoring link, marks total 450, and each of the six papers totals 75.

The packet cannot pass A4 review. Four Major findings show that source evidence, response-demand classification and marking behaviour are not reliable enough for downstream pattern/equivalence work. One Minor finding records a malformed locator label in otherwise recoverable evidence.

## Review coverage

- Rehashed the issued work order, its adjacent manifest, all eight issued review pins, all seven nested author inputs, and all ten files frozen by the author output manifest.
- Parsed and reconciled all 188 atomic rows, 188 marking rows, 78 containers, 32 unresolved dispositions, 142 provisional patterns and 79 variant suggestions.
- Read all 188 locator-bound QP/MS targets against the accepted Stage 1 transcripts and official page evidence. Screened all 12 QP/MS contact sheets and checked all 91 visual dependency references across 56 unique accepted visual records.
- Recomputed pattern membership/counts and the complete variant generation rule. The 142 pattern rows are internally consistent with the current atomic tuples, and the 79 variant rows are exactly the cross-paper, same-current-pattern pairs whose displayed marks differ by at most one. Those mechanics do not cure semantic defects in the tuples that generated them.
- Confirmed all accepted requirement references and all 130 unique transcript files resolve. The two named synthetic context IDs resolve through the accepted B22 Stage 1 question index and pinned page locators.

## Findings

`B22-A4-R2-MAJ-001` identifies 18 targets whose frozen QP/MS evidence is not bounded to the stated locator. Four QP excerpts are copied from a sibling part, one QP excerpt includes the next question, and fourteen marking rows are truncated, contaminated with another row/table/question, or replaced by the wrong answer. Representative failures include:

- `9618_w22_qp_11-q2`: the marking condition is the Q1(c) ASCII/Unicode row, not the Q2 security-feature matching answer.
- `9618_w22_qp_13-q3`: the marking condition is only `3`; the official OS-management matching answer is absent.
- `9618_s22_qp_11-q6-pai`: the condition runs into Q6(a)(ii) and ends mid-word.
- `9618_w22_qp_11-q7-pe`, `9618_w22_qp_11-q8`, `9618_w22_qp_12-q8-pcii` and `9618_w22_qp_12-q9`: the condition crosses into the following question.
- `9618_s22_qp_13-q5-pai`, `9618_s22_qp_13-q5-pbii`, `9618_w22_qp_12-q6-pbi` and `9618_w22_qp_12-q6-pbii`: the QP excerpt is copied from a different sibling part.

`B22-A4-R2-MAJ-002` identifies 22 atomic rows whose response product and/or cognitive action contradicts the exact prompt and calibrated taxonomy. SQL scripts are labelled short text or structured table; non-code database identification rows are labelled code; two logic-circuit drawings are labelled structured table; three bit-manipulation results are labelled short-text recall while equivalent tasks elsewhere are calculation/apply; and several compound prompts discard their scored explanation, justification or mapping demand. The false `CODE/CONSTRUCT` grouping in `PC-B22-V2-080` generates the invalid suggestion `VC-B22-V2-0048` between a tuple-definition response and a three-row database-identification table.

`B22-A4-R2-MAJ-003` identifies five marking rows where grouped or row-atomic award conditions are labelled `POINT_BASED`. This includes all-correct ticks, a pair-of-highlighted-rows rule and two half-table truth-table awards. The two May/June truth tables in `PC-B22-V2-070` use `POINT_BASED` while the same marking structure on three October/November examples uses `GROUPED_THRESHOLD`, so the shared pattern summary preserves an artificial behaviour difference.

`B22-A4-R2-MIN-001` records the malformed label `5(b(iii)` in the normalized condition for `9618_s22_qp_13-q5-pbiii`. The remaining condition is recoverable from the correct source locator, but the normalized official claim is not exact.

Full affected-ID lists, evidence and correction boundaries are frozen in `FINDINGS.jsonl`.

## Pattern and variant consequence

Current pattern and variant mechanics are structurally reproducible, but semantic inputs are not reviewable as correct. The response-demand defects affect 19 current pattern IDs. At minimum, `VC-B22-V2-0048` is generated from a false shared-pattern premise; `VC-B22-V2-0047` must also be regenerated under the corrected diagram tuple even if it remains a plausible candidate. Pattern frequency remains provisional and no equivalence decision was made here.

## Required correction and retest

The B22 owner must create a new version. Re-extract every affected QP/MS row at exact locator boundaries from the official pages; correct the affected response products, cognitive actions, evidence needs and dependency modes using the accepted taxonomy; reclassify grouped/row-atomic marking behaviour without splitting official conditions; rebuild all affected provisional patterns and variant suggestions; and run a fresh independent A4 review. A3 scope review, A9 final review and A0 gate decision remain separate.

This reviewer did not edit, accept or aggregate the author packet.
