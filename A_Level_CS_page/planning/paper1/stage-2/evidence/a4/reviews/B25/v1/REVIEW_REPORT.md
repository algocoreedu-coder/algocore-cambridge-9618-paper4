# Independent A4 marking/pattern review — B25-v1

Review ID: `P1-S2-A4-REVIEW-B25-v1`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B25-v1 author  
Date: 22/09/2026  
Decision: `CHANGES_REQUIRED`

## Decision basis

The frozen packet is byte-stable and reconciles structurally. The work order, adjacent review manifest, all seven issued pins, all 27 pins in the nested author input manifest, and all nine files in the author output manifest rehash exactly. The packet contains 183 atomic units, 75 containers, 183 one-to-one scoring links, zero unresolved rows, 450 marks, and six papers at 75 marks.

The packet cannot pass A4 review. Five Major findings affect command provenance, evidence-kind semantics, marking behaviour, response-demand classification and the pattern-catalog schema. PASS requires zero Critical and zero Major findings, so the decision is `CHANGES_REQUIRED`.

## Review coverage

- Parsed every author JSON/JSONL artifact and reconciled all IDs, counts, marks, requirement references and variant endpoints.
- Read all 183 atomic QP/MS evidence pairs at their frozen transcript locators. All 138 unique transcript references and all 138 unique visual record IDs resolve.
- Inspected six targeted original full-page renders covering representative table, code, conversion, logic, matching and grouped-threshold cases: `9618_s25_qp_12-p04`, `9618_s25_qp_13-p06`, `9618_s25_qp_13-p17`, `9618_w25_qp_13-p03`, `9618_w25_qp_12-p14`, and `9618_w25_ms_12-p11`.
- Reviewed all 183 pattern-candidate rows and all 59 variant candidates. No equivalence decision was made.

## Findings

`B25-A4-R1-MAJ-001` records missing command provenance on 181 of 183 atomic rows and the same 181 pattern occurrences. The rows say `SOURCE_INSPECTED_NO_ATOMIC_COMMAND_CAPTURED` although their QP prompts visibly contain commands such as Write, Complete, Explain, Convert, Describe and Identify.

`B25-A4-R1-MAJ-002` records an evidence-kind contradiction across 102 scoring rows. Every row is labelled `OFFICIAL_EXACT`, while 96 rows declare `CAPPED_POINTS`, three `GROUPED_THRESHOLD`, and three `ROW_ATOMIC`. The frozen rules assign explicit caps, thresholds and linked-row conditions to `OFFICIAL_GROUPED`. Calibration target `9618_s25_qp_12-q1-pa` is specifically frozen as `OFFICIAL_GROUPED/ROW_ATOMIC`, but this packet labels it `OFFICIAL_EXACT/ROW_ATOMIC`.

`B25-A4-R1-MAJ-003` identifies two indisputable marking-behaviour errors left within the 81 `POINT_BASED` rows. `9618_s25_qp_11-q1-pb` awards marks by truth-table halves, and `9618_w25_qp_12-q1` uses a two-or-three/all-four threshold. Neither condition is point-based.

`B25-A4-R1-MAJ-004` identifies nine response-product/cognitive-action tuples that contradict the exact prompt, including numeric conversions labelled extended-text analysis, shifted bitstrings labelled extended-text recall, a cloze response labelled extended text, and an explanation reduced to short text.

`B25-A4-R1-MAJ-005` records that `PATTERN_CANDIDATES.jsonl` is an occurrence ledger rather than a valid provisional pattern catalog. It has 183 rows but only 107 unique proposed pattern IDs; all 183 rows use the invalid phase `BATCH_CANDIDATE_PRE_C3A`, invalid pending status, and omit the required raw occurrence and distinct-paper counts and aggregate evidence fields.

Exact evidence and correction requirements are frozen in `FINDINGS.jsonl`.

## Pattern and variant consequence

The pattern artifact must be rebuilt as one valid provisional catalog row per proposed pattern after atomic and marking corrections. The current 59 variant rows have valid endpoints and no equivalence decisions, but they must be regenerated from corrected tuples. `VC-B25-0041` directly depends on two conversion rows affected by `B25-A4-R1-MAJ-004`.

## Required correction and retest

The B25 owner must create a new version. Recover source-observed commands or explicit source-backed null rationales; correct evidence kind and marking behaviour; correct the nine response-demand tuples; rebuild the provisional pattern catalog to the frozen schema; regenerate variants; then obtain a fresh independent A4 review.

This reviewer did not edit the author packet, accept B25, update trackers, aggregate results or start downstream work.
