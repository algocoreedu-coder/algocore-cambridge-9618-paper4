# Independent A4 review - B24-v1

Review ID: `P1-S2-A4-REVIEW-B24-v1`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B24-v1 author  
Date: 22/09/2026  
Decision: `CHANGES_REQUIRED`

## Decision basis

The frozen packet is structurally complete and source-linked: all review and author pins rehash exactly; the packet contains the exact 170 atomic units and 73 containers; every atomic target has one accepted Stage 1 marking link; marks total 450 with six paper totals of 75; all 170 normalized official conditions match their accepted locator-bound MS rows; and all requirement, transcript and visual references resolve.

The packet cannot pass A4 review because it has three Major findings. Fifteen atomic rows use a response product or cognitive action contradicted by the exact target page. This includes sibling-layout contamination, missing trace classifications, and a false shared pattern that generates `VC-B24-0001`. Four SQL-script targets are labelled `SYMBOLIC_NOTATION` even though the accepted taxonomy explicitly places SQL under `CODE`. Two sensor-use MS rows are classified as independently scoreable points even though the official mark requires an intact sensor-purpose/use pair.

## Source coverage

- Rehashed the issued work order, its manifest, all seven review pins, all 27 nested author inputs, and all ten author-manifest outputs plus the author output manifest.
- Parsed and reconciled all 170 atomic rows, 170 marking rows, 73 containers, 134 provisional patterns and 48 variant suggestions.
- Read all 170 locator-bound QP/MS pairs against the accepted Stage 1 records and official page evidence.
- Screened all 12 official QP/MS contact sheets and inspected 28 full-page renders at original detail for the ambiguous, table, code, trace, logic and paired-marking cases that drive the findings.
- Confirmed that the official-condition text itself remains intact. The blocking defects are analyst classifications and their derived provisional patterns/variants, plus two marking-behaviour labels.

## Findings

`B24-A4-R1-MAJ-001` identifies 15 exact atomic IDs whose response-demand labels disagree with their target prompt. Representative examples are:

- `9618_s24_qp_11-q1-pa` asks the candidate to tick one supplied expression after interpreting a truth table, but is labelled `DIAGRAM/CONSTRUCT` and grouped with a circuit-to-expression task.
- `9618_s24_qp_11-q4-pa`, `9618_s24_qp_13-q3-pa` and `9618_s24_qp_13-q3-pb` require processor-state traces but are labelled short text/recall or symbolic notation/construction.
- `9618_s24_qp_12-q8-pa`, `9618_w24_qp_13-q1-pa` and `9618_w24_qp_13-q9-pa` require prose descriptions but inherit a sibling table or diagram family.
- `9618_w24_qp_12-q1-pa` requires completion of a truth table but is labelled diagram construction.
- `9618_w24_qp_13-q4-pa` asks for foreign-key/table identification, not code construction.

`B24-A4-R1-MAJ-002` identifies four exact SQL-script targets labelled as symbolic notation. They must use the `CODE` response family and their provisional pattern metadata must be rebuilt.

`B24-A4-R1-MAJ-003` identifies two official sensor-use rows where one mark requires a matched pair. `CAPPED_POINTS` or `POINT_BASED` does not preserve that row-level condition; the calibrated `ROW_ATOMIC` behaviour is required, with evidence kind and claim precision rechecked.

The exact IDs, official wording, current claims and correction boundaries are frozen in `FINDINGS.jsonl`.

## Required correction and retest

The B24 owner must create a new version. Reclassify the affected atomic rows from their complete QP context; rebuild every affected provisional pattern and variant suggestion from the corrected tuples; remove or regenerate `VC-B24-0001`; classify all SQL scripts as `CODE`; and preserve the two sensor-use pairs as row-atomic marking conditions. A different A4 reviewer must rehash and retest the replacement version. A3 scope review and A9 final review remain separate.

This reviewer did not edit, accept or aggregate the author packet.
