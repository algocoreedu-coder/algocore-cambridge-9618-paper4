# Independent A4 marking/pattern review — B21-v2

Review ID: `P1-S2-A4-REVIEW-B21-v2`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B21-v2 author  
Date: 22/09/2026  
Decision: `CHANGES_REQUIRED`

## Decision basis

The frozen packet is structurally complete and byte-stable. The work order, adjacent review manifest, all seven issued pins, all 27 pins in the nested author input manifest, and all nine files in the author output manifest rehash exactly. The packet reconciles to 174 atomic units, 79 containers, 208 marking rows (174 scoring and 34 parent-context rows), 68 unresolved context-only records, 450 marks, and six papers at 75 marks.

The packet cannot pass A4 review. Three Major findings affect official marking structure, response-product/cognitive-action classification, and observed command words. Because PASS requires zero Critical and zero Major findings, the decision is `CHANGES_REQUIRED`.

## Review coverage

- Parsed every author JSON/JSONL artifact and reconciled all IDs, counts, marks, requirement references, pattern references and variant endpoints.
- Read all 174 atomic QP/MS evidence pairs at their frozen transcript locators. All 121 unique transcript references and all 59 unique visual record IDs resolve.
- Inspected six targeted original full-page renders covering representative table, code, diagram, truth-table, grouped-threshold and capped-subset cases: `9618_s21_qp_11-p2`, `9618_s21_qp_12-p3`, `9618_w21_qp_11-p7`, `9618_w21_qp_11-p11`, `9618_s21_ms_12-p7`, and `9618_w21_ms_12-p3`.
- Reviewed all 96 provisional pattern rows and all 59 variant candidates. No equivalence decision was made.

## Findings

`B21-A4-R1-MAJ-001` identifies 59 scoring rows whose official caps, subgroup caps, thresholds, linked-row awards, complete-set awards or whole-row conditions are flattened to `OFFICIAL_EXACT/POINT_BASED`. Representative official rules include “max 3 per factor, max 4 overall,” one mark for each complete security/integrity group, tiered two-of-three/all-four matching, and truth-table awards by four-row halves. The frozen schema requires grouped evidence and a grouped/capped/row-atomic behaviour for these conditions.

`B21-A4-R1-MAJ-002` identifies 19 atomic rows whose response product and/or cognitive action contradicts the exact response demand. The errors include SQL/DDL scripts labelled short text, circuit drawing labelled symbolic notation, table completion labelled short text, ordered blanks labelled short text, and compound identify-and-justify or describe prompts reduced to recall/identify/apply.

`B21-A4-R1-MAJ-003` identifies nine direct-source command observations copied from instruction mnemonics or neighbouring text instead of the atomic prompt. Examples include `ADD` for prompts beginning “Complete,” `trace` for “Write,” and `trace` for “Identify.” The affected provisional pattern summaries inherit the false command observations.

Exact affected IDs, evidence and correction requirements are frozen in `FINDINGS.jsonl`.

## Pattern and variant consequence

The current 96 pattern rows and 59 candidate variants are mechanically linked to the frozen atomic tuples, but the semantic inputs are not reliable. Patterns derived from the affected response products, cognitive actions, command observations and marking behaviours must be rebuilt. Variant rows remain suggestions only and must be regenerated after those corrections.

## Required correction and retest

The B21 owner must create a new version. Preserve each official group, threshold, cap and whole-row award; correct the 19 response-demand tuples and nine command observations from exact prompts; rebuild affected pattern and variant evidence; then obtain a fresh independent A4 review.

This reviewer did not edit the author packet, accept B21, update trackers, aggregate results or start downstream work.
