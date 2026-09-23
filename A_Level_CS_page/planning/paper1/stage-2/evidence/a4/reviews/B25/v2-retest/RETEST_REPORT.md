# Independent A4 closure retest - B25-v2

Review ID: `P1-S2-A4-RETEST-B25-v2`  
Reviewer: independent A4 marking/pattern closure reviewer, distinct from the B25-v2 correction owner  
Date: 22/09/2026  
Decision: **PASS**

## Decision basis

All five original Major findings are closed. No open or new Critical or Major finding remains, so B25-v2 meets the work-order PASS rule. One new Minor metadata finding is recorded: `ISSUES.md` calls the corrected conversion pair `VC-B25-0021`, while the frozen variant ledger, author QA and retest work order correctly identify it as `VC-B25-0041`. The actual endpoint pair and its evidence are correct, so this does not reopen the semantic closure.

This is a frozen specialist result for A0 review. It is not batch acceptance or permission to start aggregation or downstream work.

## Integrity and structural reconciliation

- The work order and adjacent manifest hash to `bee5a8b05b08344fe263315434013ad3452bcb4c36291961abf118aad5dbce84` and `c36ed032c8e3345d0ea1644b20205c0af6d3415709a3143ee0384ec8290f46ca`. All nine issued inputs match their byte counts and hashes.
- All nine author output-manifest pins, all ten handoff declarations and all eleven correction-input pins rehash exactly.
- The A0 validator returns `PASS` for `B25 --version v2`.
- Exact populations are 183 atomic units, 75 non-scoring containers, 183 scoring marking rows, zero parent-context marking rows and zero unresolved rows. Displayed marks total 450, with each of the six papers at 75.
- The v1-to-v2 delta is tight: container and unresolved files are byte-identical; the semantic changes are the issued command, scope/requirement, marking, nine-tuple, occurrence-ledger and variant corrections. There are two new variant pairs and no removed pair.

## Finding 001 - command provenance

All 183 atomic rows were checked against the direct QP transcript page named by the command audit. Every row has a non-null observation, an exact source-id/page/question/part provenance string and a pinned transcript reference; the 183 occurrence rows mirror those values exactly. The audit covers 82 distinct QP pages with no missing source or locator. Nine observations in eight rows use the canonical command root for an inflected source form, such as `stating` recorded as `State`; the underlying source form is present and the normalization does not infer a different demand.

## Findings 002 and 003 - marking kind and condition

All 183 official condition strings were rejoined to their pinned MS transcript, and none of the raw condition strings changed from v1. The corrected distribution is 104 `OFFICIAL_GROUPED` and 79 `OFFICIAL_EXACT`: 96 `CAPPED_POINTS`, five `GROUPED_THRESHOLD`, three `ROW_ATOMIC` and 79 `POINT_BASED`. Every grouped row carries an exact official grouping unit and preservation rule.

The two explicit false `POINT_BASED` rows are correct. `9618_s25_qp_11-q1-pb` preserves the first-four and second-four truth-table groups, and `9618_w25_qp_12-q1` preserves the two-or-three versus all-four verification threshold. Both are `OFFICIAL_GROUPED/GROUPED_THRESHOLD`, and their occurrence summaries agree.

## Finding 004 - response/action tuples and variants

The nine corrected tuples agree with their direct prompts and official answer structures: the five-mark digital-signature response is `EXTENDED_TEXT/EXPLAIN`; the two's-complement conversions and limits are `CALCULATION/APPLY`; the compiler/interpreter completion is `CLOZE_SEQUENCE/APPLY`; the security-method table is `STRUCTURED_TABLE/APPLY`; both bit shifts are `CALCULATION/APPLY`; the truth-table row-number response is `SHORT_TEXT/INTERPRET_AND_IDENTIFY`; and the negative-denary conversion is `CALCULATION/APPLY`. All nine are mirrored by their occurrence rows.

Independent pair generation from the exact primary-requirement set, response product, displayed marks and different-paper constraint produces exactly the frozen 61 endpoint pairs. `VC-B25-0041` joins `AU-9618_s25_qp_12-q2-pb-pi` to `AU-9618_w25_qp_13-q2-pb`. `VC-B25-0060` and `VC-B25-0061` are the two newly enabled shift-result pairs. No pair is missing, extra or duplicated, and no row makes an equivalence decision.

## Finding 005 - BYY occurrence ledger versus C3a catalog

The authority disposition is accepted. `WORK_ORDERS.md` assigns per-unit pattern candidates to `P1-S2-A4-BYY`; it assigns the merged `PATTERN_CATALOG_PROVISIONAL` to `P1-S2-A4-PREAGG` only after all five batch maps and their specialist reviews pass. Requiring B25 alone to emit the C3a catalog would cross that ownership boundary.

B25-v2 is a deterministic, schema-consistent occurrence ledger sufficient for C3a. Its 183 rows map one-to-one to the atomic and marking records, have 183 unique occurrence IDs and merge-sort keys, and form 107 proposed-pattern groups whose projected raw counts sum to 183. The group projections recompute exact distinct-paper counts, official examples, command observations and boundaries. Corrected response/action, evidence-kind, marking, requirement and source fields reconstruct without error. Catalog phase and equivalence-group count remain null; occurrence status remains pending C3a; no canonical catalog status, equivalence result or C3a construction claim is made.

## Minor finding and freeze

`B25-A4-R2-MIN-001` records the stale `VC-B25-0021` text in `ISSUES.md`. The B25 owner or A0 should correct or carry it in the next permitted metadata revision. No specialist retest is needed unless a semantic artifact changes.

The five retest outputs are frozen after handoff. This reviewer did not edit the author packet, accept or aggregate B25, or open downstream work.
