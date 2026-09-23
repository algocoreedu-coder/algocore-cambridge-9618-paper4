# Independent A3 closure retest - B21-v3

Review ID: `P1-S2-A3-RETEST-B21-v3`  
Reviewer: independent A3 scope/objective/context closure reviewer, distinct from the B21-v3 correction owner  
Date: 22/09/2026  
Decision: **CHANGES_REQUIRED**

## Decision basis

Three original findings are `CLOSED`. `B21-A3-004` remains `OPEN` at Major severity because four of the twelve corrected command observations still do not have truthful direct-QP provenance. The command values themselves are correct, but the cited transcript/page contains only instruction-set or memory context; the exact prompt beginning with `Complete` is on a later page. The PASS rule therefore is not satisfied.

This is a frozen independent reviewer result. It is not A0 acceptance and does not open downstream work.

## Integrity and structural checks

- All eight inputs in the issued retest manifest match their frozen byte counts and SHA-256 values. The issued manifest and work order were separately pinned in this review.
- All nine B21-v3 content outputs match `OUTPUT_MANIFEST.json`; the author handoff pin for that manifest and all nine handoff content pins also match.
- The A0 C2 validator returns `PASS` for `B21 --version v3`, including the exact required file set, subset sets, uniqueness, disjointness, marking links, unresolved quarantine, requirement references and pattern references.
- Exact populations remain 174 atomic units, 79 non-scoring containers, 208 marking rows comprising 174 scoring links and 34 parent-context rows, and 68 unresolved context-only rows. Displayed marks total 450; each of the six papers totals 75.
- All 174 atomic rows join exactly to accepted B21-A2-v6 question/marking records and the v3 marking evidence map for QP locator, displayed marks, marking target, MS locator and transcript. All 94 provisional patterns reproduce their example rows' requirement sets, command sets, raw occurrence counts and distinct-paper counts.
- The v2-to-v3 atomic delta is confined to the exact 97-row union authorized by the frozen A3/A4 findings. All 19 response-product/cognitive-action corrections occur on the nineteen cited rows, with no response tuple change outside that set. Source IDs, QP/MS locators, marking item IDs, displayed marks and paper IDs are unchanged across all 174 rows.

## Finding closure

`B21-A3-001` is closed. Both `9618_s21_qp_11-q2-pb` and `9618_s21_qp_13-q2-pb` are now `PARTIAL`. They retain exactly the five 2026 §5.1 management requirement routes and explicitly quarantine the three additional official 2021 MS routes: error checking and recovery, provision of a platform for software, and provision of a user interface. The paired pattern contains exactly the five in-scope requirements and both occurrences.

`B21-A3-002` is closed. The two Q2(a) utility rows retain disk formatting, defragmentation, disk analysis/repair and backup only; virus checking and compression are absent from both direct and supporting coverage and from their linked pattern. `9618_w21_qp_12-q8-pb-piii` maps only indirect, indexed and relative addressing as assessed alternatives. Direct addressing is recorded as supplied prompt context, is absent from direct/supporting coverage, and the exact official alternatives and linked two-mark condition are source-located.

`B21-A3-003` is closed. All 74 cited atomic rows resolve exactly once in accepted B21-A2-v6 `QUESTION_INDEX.jsonl`; every non-null immediate parent resolves and occurs exactly once in the corresponding v3 `context_dependency_ids`. All v2 dependencies are retained, and the sole added dependency for each cited row is its exact immediate parent. The six cited layout rows each reference one accepted layout-bearing corpus parent and carry a direct QP locator and transcript reference matching the row.

`B21-A3-004` remains open. All twelve `command_word_observed_or_null` values are now lexically correct, and their seven linked patterns reproduce the corrected command sets. Direct provenance passes only 8/12:

- `9618_s21_qp_11-q3-pb` cites `transcripts/9618_s21_qp_11-p7.txt` / QP page 7, which contains the instruction set; `Complete the trace table...` is on QP page 9 and in `transcripts/9618_s21_qp_11-p9.txt`.
- `9618_s21_qp_13-q3-pb` cites page 7; the exact prompt is on page 9 and in `transcripts/9618_s21_qp_13-p9.txt`.
- `9618_w21_qp_11-q6-pb` cites page 12, which contains the instruction set and memory data; `Complete the table...` is on page 13 and in `transcripts/9618_w21_qp_11-p13.txt`.
- `9618_w21_qp_13-q6-pb` cites page 12; the exact prompt is on page 13 and in `transcripts/9618_w21_qp_13-p13.txt`.

The paired rendered QP pages visually confirm the separation between the cited context pages and the later command-bearing pages. This fails the original acceptance requirement for truthful direct-QP provenance even though the observed word is correct.

## Freeze and stop

The five retest outputs are frozen after handoff. This reviewer did not edit author artifacts, accept or aggregate B21, perform downstream review, or open downstream work.
