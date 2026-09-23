# Independent A4 closure retest - B22-v3

Review ID: `P1-S2-A4-RETEST-B22-v3`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B22-v3 correction owner  
Date: 22/09/2026  
Decision: **CHANGES_REQUIRED**

## Decision basis

Two Major findings and the original Minor are closed. The 22 response-product/cognitive-action corrections agree with the official prompts and scoring demands; the five grouped or row-atomic conditions now preserve their indivisible scoring rules; and the malformed `5(b)(iii)` normalized locator is corrected with its complete condition. The corrected tuples reconstruct exactly 135 provisional patterns and 107 variant suggestions. The former circuit pair `VC-B22-V2-0047` is regenerated as `VC-B22-V3-0033`, and the false `VC-B22-V2-0048` endpoint pair is absent.

The packet cannot pass because `B22-A4-R2-MAJ-001` remains open. Two rebuilt rows contain correct-looking normalized conditions but still cite the wrong official MS pages and transcript references:

- `9618_w22_qp_11-q2` declares `9618_w22_ms_11` PDF page 3, which contains Q1. The security-feature matching row is on PDF page 4.
- `9618_w22_qp_13-q3` declares `9618_w22_ms_13` PDF page 3, which contains Q1. The OS-management matching row is on PDF page 5.

Those wrong locators are copied into `MARKING_EVIDENCE_MAP.jsonl` and the associated pattern source evidence. In addition, two rows repaired under this finding retain command words from the former wrong QP bindings: `9618_s22_qp_13-q5-pai` says `Identify` although the prompt says `State`, and `9618_w22_qp_12-q6-pbii` says `Describe` although the prompt says `Explain`. Their rebuilt patterns copy the stale words.

One new Minor finding is recorded for `9618_w22_qp_13-q4-pc`: its exact prompt begins `Identify one other upgrade ... and explain`, but `command_word_observed_or_null` remains `State`; `PC-B22-V3-061` therefore also lists `State`.

## Integrity and reconciliation

- The issued manifest matches SHA256 `3dcbc888b710984322f295d604f0de4a6db2e9275f3cef19a97eade28e37094c`; all six issued inputs match their declared bytes and SHA256 values.
- All nine author output-manifest pins, the handoff output-manifest pin and all nine handoff content pins match. The seven correction inputs, correction dispatch manifest, ten nested v2 outputs and four nested v2-review outputs also match.
- The A0 C2 validator returns `PASS` for B22-v3.
- Exact populations remain 188 unique atomic units, 78 unique non-scoring containers, 188 one-to-one scoring links, 32 unresolved context-only records and 450 marks. Each of the six papers totals 75.
- All five A3-accepted field families are unchanged across all 188 atomic rows: scope status, primary requirements, supporting requirements, context dependency IDs and visual/table dependency IDs. The prior A3 PASS handoff remains hash-pinned; this reviewer does not determine final applicability.

## Exact-source retest

All 44 unique affected targets were checked directly against the twelve official 2022 QP/MS PDFs, covering 63 distinct declared source pages. Every affected QP excerpt is source-visible at its declared page. Forty-one MS excerpts are source-visible as contiguous normalized text; the `5(b)(iii)` condition is complete and source-equivalent after correcting the malformed printed/extracted prefix. The two remaining MS rows are not present at their declared pages and are the open Major evidence above.

The 22 response-demand rows now use the required SQL code, diagram, calculation, structured-table, symbolic-notation and extended-text products with matching cognitive actions. The five marking rows use one `ROW_ATOMIC` gate-table condition, two `GROUPED_THRESHOLD` truth-table conditions, one `GROUPED_THRESHOLD` tick-set condition and one `ROW_ATOMIC` paired-row condition, matching the official award rules.

Every pattern reconstructs from its atomic examples, and all 188 atomic units occur exactly once across 135 patterns. Pattern counts, paper counts, tuples, marking summaries and source-example sets are internally consistent. Independently regenerating every cross-paper same-pattern pair whose marks differ by at most one produces exactly the frozen 107 variants, with no missing, extra or duplicate pair.

## Required next action and stop

The B22 owner must create a new correction version that fixes the two MS page/transcript locators and all copied pattern source locators, corrects the three stale command-word observations, and rebuilds the affected pattern metadata. A different A4 reviewer must independently retest that replacement. A3, A9 and A0 gates remain separate.

This reviewer did not edit, repair, accept or aggregate the author packet. The five retest outputs are frozen after handoff.
