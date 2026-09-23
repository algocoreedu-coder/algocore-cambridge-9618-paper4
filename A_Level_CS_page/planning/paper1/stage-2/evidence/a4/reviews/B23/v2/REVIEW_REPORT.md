# Independent A4 review - B23-v2

Review ID: `P1-S2-A4-REVIEW-B23-v2`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B23-v2 author  
Date: 22/09/2026  
Decision: `CHANGES_REQUIRED`

## Decision basis

The frozen packet is structurally complete and unchanged. The issued input manifest rehashes to `ccabfa248e1892e235cd38a23355d6e837f7ab95cc645f8f512dc5db3cfc46c9`; all 8 issued pins, all 7 nested correction-input pins and all 9 author output-manifest entries match. The packet contains exactly 178 atomic units, 74 non-scoring containers, 178 one-to-one marking links, 28 unresolved context-only rows, 178 provisional pattern occurrences and 32 variant suggestions. Marks total 450, with each of the six papers totaling 75. All requirement, transcript and visual references resolve.

The packet cannot pass A4 review because it has three Major findings. Four layout-dependent targets use a response family contradicted by the exact QP page. Three SQL-script targets are not classified as `CODE`. A systematic marking-behaviour error affects 80 rows: explicit caps are repeatedly labelled `POINT_BASED`, rows without an official `max N` are repeatedly labelled `CAPPED_POINTS`, threshold schedules are not labelled `GROUPED_THRESHOLD`, and two local-subset/pair rows lose their exact condition. Those marking labels are copied into the provisional pattern rows.

## Source coverage

- Rehashed the work order, adjacent issued manifest, all issued review pins, the nested author input manifest and all author-manifest outputs.
- Parsed and reconciled all 178 atomic rows, 178 marking rows, 74 containers, 28 unresolved dispositions, 178 provisional pattern rows and 32 variant suggestions.
- Read all 178 locator-bound QP/MS pairs against the accepted Stage 1 transcripts.
- Inspected all 61 distinct rendered pages carrying the packet's table, diagram, matching, code, trace, symbolic-notation, schema-design or other layout-sensitive evidence: 32 QP pages and 29 MS pages. The four mislabelled response products and three SQL rows were also checked at original page detail.
- Reviewed every grouped, capped, threshold, subset and pair-sensitive MS row. No invented alternative or decomposed bullet-to-mark claim was accepted.
- Confirmed that variant rows remain suggestions only, their endpoints and QP/MS locators resolve, and no equivalence decision or frequency deduplication is present.

## Findings

`B23-A4-V2-MAJ-001` identifies four exact targets whose response product and cognitive action conflict with the rendered prompt: two line-matching tasks are labelled short text/recall, one truth-table completion is labelled diagram/construction, and one ordered missing-statement task is labelled short text/recall. Their atomic and provisional pattern records must be rebuilt from the exact response demand.

`B23-A4-V2-MAJ-002` identifies three prompts that explicitly ask for a Structured Query Language script but are labelled `STRUCTURED_TABLE` or `SHORT_TEXT`. The calibrated taxonomy places executable/declarative SQL in `CODE`; all affected provisional patterns and any regenerated variant suggestions must use that boundary.

`B23-A4-V2-MAJ-003` verifies the previously suspected systematic marking inconsistency. Fifty-eight `POINT_BASED` rows contain an explicit official `max N`; sixteen `CAPPED_POINTS` rows have no official `max N`; four all-or-count-band rows omit `GROUPED_THRESHOLD`; and two further rows require local-subset or intact type-description treatment. The source examples in `FINDINGS.jsonl` show that this is not a transcript-boundary false positive. The affected evidence kinds, marking behaviours and all copied pattern summaries require a source-by-source rebuild.

## Required correction and retest

The B23 owner must create a new version. Correct the seven response-demand classifications and rebuild every affected primary pattern/variant input. Reclassify all 80 affected marking rows from the complete official MS condition, using `POINT_BASED`, `GROUPED_THRESHOLD`, `CAPPED_POINTS`, `CAPPED_SUBSETS`, `ROW_ATOMIC` or `STRUCTURAL_CRITERIA` only where the exact source supports that behaviour; re-evaluate `evidence_kind` and preserve every cap, subset and linked condition. A different A4 reviewer must independently rehash and retest the replacement version. A3 scope review and A9 final review remain separate.

This reviewer did not edit, accept or aggregate the author packet.
