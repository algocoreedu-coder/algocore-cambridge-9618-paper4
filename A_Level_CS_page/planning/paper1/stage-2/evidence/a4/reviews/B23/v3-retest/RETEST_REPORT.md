# Independent A4 closure retest - B23-v3

Review ID: `P1-S2-A4-RETEST-B23-v3`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B23-v3 correction owner  
Date: 22/09/2026  
Decision: **CHANGES_REQUIRED**

## Decision basis

Two original Major findings are `CLOSED`. All four layout-dependent response classifications now agree with the exact rendered prompts, and all three SQL-script targets now use `CODE/CONSTRUCT` with source-specific evidence and dependencies. The third original Major remains `OPEN`: 79 of its 80 marking rows preserve the official condition, but `9618_w23_qp_11-q8-pb-piii` still states a false award rule.

The QP asks for one other addressing mode and provides one response line for one displayed mark. The official MS awards that single mark for an acceptable answer, listing `Indirect` and `Relative` as alternatives. The v3 marking row instead says `1 mark for each of indirect and relative addressing`, leaves `alternatives_if_explicit` empty, and simultaneously records one displayed mark. This changes an OR choice into an apparent two-answer award and contradicts the source. Because this row is one of the 80 targets expressly covered by `B23-A4-V2-MAJ-003`, that Major is not closed. No separate new Critical, Major or Minor finding was opened.

## Integrity and reconciliation

- The work order rehashes to `ee2c4754a11eeac110db584d4641cc4f934c79a56be78d52f6ee451764a784f8`; the issued manifest matches SHA256 `094916932275b90e96083892626d7173b49a2414b4f04eaaf0dd2311b35c6e15`. All six issued input pins match their declared bytes and SHA256 values.
- All nine author output-manifest pins, the output-manifest handoff pin, all nine handoff content pins, all eight correction inputs, and the correction work-order/dispatch pins match.
- The A0 C2 validator independently returns `PASS` for B23-v3.
- Exact populations remain 178 unique atomic units, 74 unique non-scoring containers, 178 one-to-one scoring marking rows, 28 unresolved context-only rows and 450 displayed marks. Each of the six papers totals 75.
- All atomic, container and marking rows join to the accepted Stage 1 question/marking records. All 244 context references, 280 atomic visual references, 280 marking visual references and 126 distinct atomic transcript references resolve.
- All 178 provisional pattern occurrences reconstruct from their atomic and marking rows with zero field mismatch; they use 134 unique proposed pattern IDs. The 36 frozen variant suggestions exactly equal an independent regeneration by exact primary-requirement set, response product, displayed marks and different paper, with no missing, extra or duplicate pair.

## Exact-source retest

The four layout rows were reread in their exact QP/MS transcripts and inspected on their rendered QP pages. They now classify two matching tasks as `MATCHED_ASSOCIATIONS/CLASSIFY_AND_MATCH`, truth-table completion as `STRUCTURED_TABLE/APPLY`, and the ordered interrupt blanks as `CLOZE_SEQUENCE/APPLY_SEQUENCE`. Their evidence needs, dependency modes and primary patterns agree with those response demands.

The three SQL rows were reread in their exact QP/MS transcripts and rendered QP pages. Each prompt explicitly requests an SQL script; all three atomic rows now use `CODE/CONSTRUCT`, retain SQL syntax/semantics or data-type/key evidence, and use `CODE_FORMAT` with the required source table or prior context.

All 80 marking targets were reread across 39 distinct official MS transcript pages. Seventy-nine preserve their exact point, cap, subset, threshold or linked-row condition. Their resulting distribution is 47 `CAPPED_POINTS`, 12 `CAPPED_SUBSETS`, 4 `GROUPED_THRESHOLD`, 4 `ROW_ATOMIC` and 13 `POINT_BASED`. The one mismatch is source-visible on `9618_w23_qp_11` page 14 and `9618_w23_ms_11` page 10: one answer from two alternatives earns one mark, whereas the v3 normalized condition says one mark for each.

## A3 stability

The accepted B23-v2 A3 handoff remains stable. Across all 178 atomic rows, v3 has zero differences in `scope_2026_status`, primary/supporting requirement IDs, stimulus tags, context dependency IDs, observed command wording, command provenance, authority requirements or topic boundary. The seven intended A4 response-classification edits do not alter those accepted A3 fields; the other 171 atomic rows have no semantic differences outside version/review metadata.

## Required next action and stop

The B23 owner must create a new correction version that represents `9618_w23_qp_11-q8-pb-piii` as one mark for either `Indirect` or `Relative`, preserves those alternatives explicitly, and refreshes the frozen manifests and handoff. A different A4 reviewer must independently retest that replacement. A9 and A0 gates remain separate.

This reviewer did not edit, repair, accept or aggregate the author packet. The five retest outputs are frozen after handoff.
