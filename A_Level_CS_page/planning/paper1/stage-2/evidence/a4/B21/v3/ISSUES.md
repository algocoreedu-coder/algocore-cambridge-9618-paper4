# P1-S2-A4-B21 v3 — correction dispositions

Author correction QA found no unresolved implementation blocker. These dispositions are source-backed author corrections awaiting independent closure retests; they are not acceptance decisions.

| Finding | Author disposition | Exact source boundary |
|---|---|---|
| B21-A3-001 (Critical) | CORRECTED_AWAITING_INDEPENDENT_RETEST. Both Q2(b) rows are `PARTIAL`; five §5.1 management routes remain direct coverage and the three legacy accepted routes are explicit quarantine entries. | 2026 syllabus §5.1 (`697372-2026-syllabus.pdf`, PDF/print p23); `9618_s21_ms_11` and paired `ms_13`, p4, Q2(b). |
| B21-A3-002 (Major) | CORRECTED_AWAITING_INDEPENDENT_RETEST. Virus checking and compression were removed from both utility rows. Direct addressing was removed from assessed coverage for W21/12 Q8(b)(iii); only indirect, relative and indexed remain assessed alternatives. | S21 QP 11/13 p5 with MS p4; W21/12 QP p16 and MS p10. |
| B21-A3-003 (Major) | CORRECTED_AWAITING_INDEPENDENT_RETEST. All 74 leaves now include the exact `QUESTION_INDEX` immediate parent. All six layout rows reference the layout-bearing parent corpus record and direct QP page locator. | B21-A2-v6 `QUESTION_INDEX.jsonl`; exact QP locators embedded per row; all dependency IDs resolve in `CORPUS_INDEX.jsonl`. |
| B21-A3-004 (Major) | CORRECTED_AWAITING_INDEPENDENT_RETEST. Twelve command observations now use exact atomic-prompt wording with direct QP transcript provenance. | Exact QP transcript and page locator embedded in each affected atomic row. |
| B21-A4-R1-MAJ-001 (Major) | CORRECTED_AWAITING_INDEPENDENT_RETEST. All 59 affected rows use `OFFICIAL_GROUPED` and preserve the source cap, threshold, subset, linked-row or structural condition with a supported behaviour. | Official MS transcript/page locator embedded in each affected marking row. |
| B21-A4-R1-MAJ-002 (Major) | CORRECTED_AWAITING_INDEPENDENT_RETEST. All 19 response-product/cognitive-action tuples were corrected from the complete prompt and MS demand; provisional pattern occurrences were rebuilt. | Exact QP/MS locators embedded in each corrected atomic row. |
| B21-A4-R1-MAJ-003 (Major) | CORRECTED_AWAITING_INDEPENDENT_RETEST. The nine overlapping command cases inherit the direct-QP corrections above; affected pattern command summaries were rebuilt. | Exact QP transcript/page locator embedded in each affected atomic row. |

## Frozen boundaries

- Counts remain exactly 174 atomic units, 79 containers, 208 marking rows (174 scoring and 34 parent-context), 68 unresolved context-only rows, 450 marks, and six papers at 75 marks.
- `CONTAINER_MAP.jsonl` and `UNRESOLVED_DISPOSITION.jsonl` are byte-identical to v2.
- Pattern rows remain provisional pre-equivalence candidates. Variant relations remain suggestions with no equivalence decision.
- Independent A3 and different-A4 closure retests are required. The author stops without self-review, acceptance, aggregation or downstream work.
