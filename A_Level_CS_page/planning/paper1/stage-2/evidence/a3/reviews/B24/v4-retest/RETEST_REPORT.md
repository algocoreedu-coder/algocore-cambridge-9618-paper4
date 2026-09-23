# Independent A3 closure retest - B24-v4

Review ID: `P1-S2-A3-RETEST-B24-v4`  
Reviewer: independent A3 scope/objective/context closure reviewer, distinct from the B24-v4 correction owner  
Date: 22/09/2026  
Decision: **PASS**

## Decision basis

Both original findings are `CLOSED`. No new Critical, Major or Minor finding was identified, so the stated PASS rule is satisfied. This is a frozen independent reviewer result; it is not A0 acceptance and does not open downstream work.

## Integrity and structural checks

- All nine inputs in the issued retest manifest match their frozen byte counts and SHA-256 values. The issued manifest and work order were separately pinned in this review.
- All nine B24-v4 content outputs match `OUTPUT_MANIFEST.json`; the author handoff pin for that manifest and all nine handoff content pins also match.
- The A0 C2 validator returns `PASS` for `B24 --version v4`, including the exact required file set, subset sets, uniqueness, disjointness, marking links, unresolved quarantine, requirement references and pattern references.
- Exact populations remain 170 atomic units, 73 non-scoring containers, 170 scoring marking rows, zero parent-context marking rows and zero unresolved rows. Displayed marks total 450; each of the six papers totals 75.
- The packet contains 127 provisional patterns covering 170 occurrences and 66 variant suggestions.

## Finding closure

`B24-A3-001` is closed. The 2024 prompt asks for another IDE presentation feature besides prettyprint. Its official mark scheme accepts either expand/collapse code blocks or auto-indentation/auto-formatting. The 2026 syllabus section 5.2 names prettyprint and expand/collapse code blocks as presentation examples, but does not name auto-indentation/auto-formatting. The corrected atomic row `9618_w24_qp_11-q4-pd-pi` is therefore truthfully `PARTIAL` with `MEDIUM` confidence: expand/collapse remains the `REQ-5.2-04-03` in-scope route, while the historical auto-indentation/auto-formatting route is explicit and quarantined from 2026 coverage. Singleton `PC-B24-088` carries the same boundary, occurrence count and source locators.

`B24-A3-002` is closed. All 64 originally cited IDs were joined independently to accepted Stage 1 `QUESTION_INDEX.jsonl`. Each has one non-null `parent_part_id_or_null`; that exact parent record exists and occurs exactly once in the v4 atomic row's `context_dependency_ids`. All v3 dependencies are retained, and the sole added dependency for every cited row is its exact immediate parent. There are zero missing, duplicate, substituted or unexplained parent dependencies.

## Protected A4 closure

The different-A4 v3 PASS remains stable. Across all 170 atomic rows, protected source, response-demand, marking linkage, requirement, pattern and evidence fields have no v3-to-v4 differences. Across all 127 patterns, protected response, cognitive-action, marking, requirement, occurrence and catalog fields have no differences. `MARKING_EVIDENCE_MAP.jsonl` is byte-identical to v3. `PC-B24-064` retains `ROW_ATOMIC`; `9618_w24_qp_13-q4-pa` retains `PAIR_INTEGRITY` and its `ROW_ATOMIC` marking row; and `PC-B24-143` has `marking_behaviour_summary` exactly `["ROW_ATOMIC"]`.

The v3-to-v4 delta is confined to the 64 cited atomic rows and `PC-B24-088`: 63 atomic rows add only their immediate parent; the remaining target also adds its parent and the required scope/quarantine metadata. `CONTAINER_MAP.jsonl`, `MARKING_EVIDENCE_MAP.jsonl`, `UNRESOLVED_DISPOSITION.jsonl` and `VARIANT_CANDIDATES.jsonl` are byte-identical to v3.

## Freeze and stop

The five retest outputs are frozen after handoff. This reviewer did not edit author artifacts, accept or aggregate B24, perform downstream review, or open downstream work.
