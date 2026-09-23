# Final independent A4 closure retest - B24-v3

Review ID: `P1-S2-A4-RETEST-B24-v3`  
Reviewer: independent A4 marking/pattern closure reviewer, distinct from the B24-v3 correction owner  
Date: 22/09/2026  
Decision: **PASS**

## Decision basis

`B24-A4-R2-MAJ-001` is closed. The official QP page asks for two foreign keys and the table referenced by each, and the official MS page awards one mark for each complete foreign-key/table association. In B24-v3, `9618_w24_qp_13-q4-pa` uses `ROW_ATOMIC`, retains `PAIR_INTEGRITY`, and states that one mark requires one complete matching pair. Singleton pattern `PC-B24-143` now carries `ROW_ATOMIC` in its marking-behaviour summary.

All three earlier Major findings remain closed. The 15 response-demand corrections still agree with the exact prompts; all four SQL-script targets remain `CODE/CONSTRUCT`; and both sensor-use targets remain `ROW_ATOMIC`, with `PC-B24-064` retaining the row-atomic summary. The false `PC-B24-001` grouping, stale `VC-B24-0001` identifier and false endpoint pair remain absent.

No open or new Critical or Major finding was identified. The retest therefore satisfies the stated PASS rule. This is a frozen reviewer result, not A0 acceptance.

## Integrity and reconciliation

- The issued input manifest rehashes to `d741d7887ad42355e986d8872fbffceb5213c76fa363286c0cee449f12f6db63`; all five issued inputs match their declared byte counts and SHA-256 values.
- All nine B24-v3 output-manifest pins, the handoff manifest pin, all nine handoff content pins, the correction dispatch manifest, all six correction inputs, and all four outputs pinned by the B24-v2 retest handoff match.
- The v3 atomic, container, unresolved and variant files are byte-identical to v2. The source-visible semantic delta is confined to the cited marking row and its derived pattern row; author QA and handoff metadata describe that correction separately.
- The A0 C2 validator returns `PASS` for B24-v3.
- Exact populations remain 170 atomic units, 73 non-scoring containers, 170 scoring marking rows and zero unresolved rows. Displayed marks total 450; each of the six papers totals 75.
- All 170 atomic rows, 73 containers and 170 marking rows independently rejoin the accepted Stage 1 question and marking indexes, including locators, transcript references, marks and normalized official conditions. All 284 context references and the referenced visual records resolve.
- All 127 provisional patterns reconstruct from their atomic tuples and marking summaries, covering 170 occurrences with no reconstruction error. Independently regenerating cross-paper, same-pattern pairs whose marks differ by at most one reproduces all 66 frozen variant suggestions with no missing, extra or duplicate pair and no equivalence decision.

## Source and finding retest

The 21 distinct targets involved in the prior findings were checked against 35 distinct QP/MS transcript references and 31 distinct full-page visual references. All 12 official contact sheets were screened. The B24-v3 correction target was additionally inspected on the full official render for `9618_w24_qp_13` page 5 and `9618_w24_ms_13` page 4.

The rendered QP presents two paired answer positions, each consisting of a foreign key and a table name. The rendered MS gives `BatchID` with `BATCH` and `CustomerID` with `CUSTOMER`, under “1 mark each”. Under the calibrated rule that linked entries required for one row mark remain indivisible, `ROW_ATOMIC` is the correct behaviour for both the marking row and `PC-B24-143`.

## Freeze and stop

The five retest outputs are frozen after handoff. This reviewer did not edit the author packet, accept or aggregate B24, or open downstream A3, A9 or A0 work.
