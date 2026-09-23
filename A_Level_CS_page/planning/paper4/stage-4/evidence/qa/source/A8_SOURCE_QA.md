# A8 independent source-layer QA

Status: **PASS_RECOMMENDED**. This recheck covers the 2021–2025 QP/MS requirement and marking submissions only. It does not approve Stage 4 methods or any executable solution.

## Coverage and integrity

| Batch | Papers | Questions | Parts | Marks |
|---|---:|---:|---:|---:|
| 2021–2022 | 11 | 33 | 228 | 825 |
| 2023–2024 | 12 | 36 | 304 | 900 |
| 2025 | 6 | 18 | 140 | 450 |
| **Total** | **29** | **87** | **672** | **2175** |

There are 2,236 globally unique marking-point IDs and no duplicate part IDs. Every QP requirement and official MS atom has a source ID and page locator within the frozen Stage 1 ranges. Assessed patterns, context patterns and QP dependency sets match Stage 2. The source layer retains exactly 14 canonical Stage 1 issue IDs and 27 paper-specific occurrences.

The raw S4-S1 rows with ambiguous printed arithmetic remain conservatively handled by `SOURCE_ADJUDICATIONS.json`: all criteria are retained, atom values stay unset, and the official part-level holistic ceilings remain 8 for Winter 2021 question 2(e) and 6 for Winter 2022 question 1(b).

## Recheck result for the eight required findings

1. **A8-SRC-REQ-001 — CLOSED.** All ten 2023–2024 rows now expose each explicit credit separately. The mirrored rows have the required 3/3, 2/2, 4/4, 2/2 and 2/2 atom-to-mark counts. Ten new atom IDs were added and all original locators remain valid.
2. **A8-SRC-REQ-002 — CLOSED.** `9618_s23_42_2(f)(i)` now has five one-mark `group_max` atoms in one max-4 group. `9618_s23_42_3(b)(ii)` now has two discrete atoms and one alternative atom with the actual override/parent-call routes.
3. **A8-SRC-REQ-003 — CLOSED.** None of the 2,236 official criterion paraphrases contains `Question Answer Marks`; the six affected atoms retain their criterion text and grouping.
4. **A8-SRC-REQ-004 — CLOSED.** `S4-S2-LAYOUT-CODE-FIDELITY` has no per-part references and is absent from the source-risk register. Its replacement is stored as `S4-S2-POLICY-LAYOUT-CODE-FIDELITY`, a batch policy with `is_source_issue=false`.
5. **A8-SRC-REQ-005 — CLOSED.** `9618_s25_42_2(f)(iii).mp.01` now describes the screenshot showing non-empty spare-record keys output by `PrintSpare`, with evidence semantics, value 1 and MS page 32 retained.
6. **A8-SRC-REQ-006 — CLOSED.** All seven `9618_s25_42_1(e)` atoms retain value 1. `.mp.05` is discrete with no generic alternative; the three continuation dependencies remain explicit.
7. **A8-SRC-REQ-007 — CLOSED.** `S25-41-MS35-INIT` is located at `9618_s25_ms_41` page 35, joined to `9618_s25_41_3(c)(i)` and both atoms, and carries independent Stage 5 constructor verification.
8. **A8-SRC-REQ-008 — CLOSED.** `W25-43-Q2B-FULL-GUARD` names empty/0, near-full/99 and full/100 fixtures, requiring success into the last slot and a non-mutating `FALSE` at full capacity.

`A8_SOURCE_QA.json` records the previous and current SHA-256 hashes for every reviewed artifact and retains the full affected part/atom lists plus expected correction semantics.

## Facsimile review

A8 directly inspected 15 original facsimile pages across seven documents:

- `9618_w21_ms_41` page 12
- `9618_w22_ms_41` pages 3–4
- `9618_s23_ms_42` pages 20 and 29
- `9618_s24_ms_41` pages 12, 13, 21 and 22
- `9618_s25_ms_41` pages 31 and 35
- `9618_s25_ms_42` pages 14 and 32
- `9618_w25_ms_43` pages 22–23

The sample covers group caps, holistic conflicts, accepted implementation routes, screenshot-only criteria, constructor underscore defects and the 2025 queue guard contradiction. Mirrored 41/43 rows were checked through their corresponding current submission rows and frozen locators.

## Independent validation

`validate_source_layer.py` now reports **18/18 PASS**. The source layer is recommended for Lead acceptance on the recorded hashes.
