# Independent A4 closure retest - B24-v2

Review ID: `P1-S2-A4-RETEST-B24-v2`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B24-v2 correction owner  
Date: 22/09/2026  
Decision: **CHANGES_REQUIRED**

## Decision basis

All three original findings are `CLOSED`: the 15 response-demand classifications agree with the exact QP/MS targets, all four SQL-script targets use `CODE`, and both cited sensor-use rows preserve each sensor-use pair with `ROW_ATOMIC`. The corrected atomic tuples generate exactly 127 provisional patterns and 66 variant suggestions; the false `PC-B24-001` grouping, stale `VC-B24-0001` identifier and false endpoint pair are absent.

The packet cannot pass this retest because one new Major finding remains in an affected target. `9618_w24_qp_13-q4-pa` asks for two foreign keys and the table referenced by each. The official row awards one mark for each complete foreign-key/table pair. Its marking row still says `POINT_BASED`, and rebuilt singleton pattern `PC-B24-143` copies that label. The frozen taxonomy defines `ROW_ATOMIC` for multiple linked conditions that must be satisfied for one row mark, so the pair must remain indivisible.

## Integrity and reconciliation

- The issued manifest matches SHA256 `6eff422d64778398fdf3e972c53e632d2322f22c0819d74763caeb8f32bde96b`; all eight issued inputs match their declared bytes and SHA256 values.
- All nine author output-manifest pins and all handoff-declared pins match. The seven correction inputs and correction dispatch manifest also match.
- The A0 C2 validator returns `PASS` for B24-v2.
- Exact populations remain 170 unique atomic units, 73 unique non-scoring containers, 170 one-to-one scoring links, zero unresolved rows and 450 marks. Each of the six papers totals 75.
- All 170 marking rows reproduce their accepted Stage 1 marking item, locator, transcript row, marks and visual references. All 284 context references resolve.
- Every one of the 127 patterns reconstructs exactly from requirement set, response product and cognitive action. Counts, paper counts, examples, commands, marking summaries and source locators agree with the atomic and marking maps.
- Independently regenerating every cross-paper, same-pattern pair with marks within one produces exactly the frozen 66 variant suggestions, with no missing, extra or duplicate pair.

## Exact-source retest

The 21 affected targets were reread in their 35 distinct QP/MS transcripts and checked on 31 distinct full-page visual references; all 12 QP/MS contact sheets were also screened. The response-demand boundaries now agree with the rendered prompts: selected response, short or extended prose, trace, calculation, structured table, symbolic notation and the four SQL code responses are separated correctly. Both sensor-use rows preserve the official pair condition.

The new finding is source-visible on `9618_w24_qp_13` page 5 and `9618_w24_ms_13` page 4: each answer association consists of a foreign key and its referenced table, and each mark requires the complete association. `POINT_BASED` loses that linked condition even though the atomic row already records `PAIR_INTEGRITY`.

## Required next action and stop

The B24 owner must create a new correction version that changes `9618_w24_qp_13-q4-pa` to `ROW_ATOMIC` and rebuilds the copied marking summary in `PC-B24-143`. A different A4 reviewer must independently retest that replacement. A3, A9 and A0 gates remain separate.

This reviewer did not edit, repair, accept or aggregate the author packet. The five retest outputs are frozen after handoff.
