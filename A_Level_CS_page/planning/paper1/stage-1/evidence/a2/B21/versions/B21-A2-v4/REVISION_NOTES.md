# B21-A2-v4 revision notes

Status: `SUBMITTED_FOR_INDEPENDENT_A3_A4_RETEST`. Immutable candidate v4 supersedes hash-pinned active v3 for retest; v3 and historical snapshots remain unchanged. Source PDFs are read-only.

| Finding / basis | v4 correction | Evidence and remaining gate |
|---|---|---|
| A9-B21-VIS-01 | Added 16 missing risk-page regions and direct source renders: 12 MS, 4 QP. | `VISUAL_MANIFEST.json`, `SOURCE_RENDER_MANIFEST.json`; 16 full-page source comparisons; A9 retest pending. |
| MS visual dependencies | Added visual region references to all 13 distinct MS marking-item IDs listed in A9's target table (12 page associations). | Exact printed labels/page targets; no row allocation or answer inference. A3/A4/A9 retest pending. |
| Whole-packet risk coverage | Screened all 154 source pages across 12 QP/MS PDFs; no further omitted risk page identified. | `COVERAGE_SWEEP_MANIFEST.json` and 12 contact sheets. |
| Page status consistency | Pages with any declared visual region are `VISUAL_CHECK_REQUIRED`; other pages are `EXTRACTED`. | `PAGE_INDEX.jsonl` checked against 77 visual-region page keys. |
| Prior v3 corrections | Retained all v3 question/context/locator/marking changes; 34 parent-context-only rows remain unresolved. | A3/A4 v3 reports reviewed; same-version v4 retest required. |

The dispatch says “twelve MS marking rows,” but its target table enumerates thirteen distinct IDs. v4 addresses all thirteen IDs and records the count discrepancy without changing allocations. The 61 inherited v3 render methods were not documented; v4 records them as inherited with this provenance limit.
