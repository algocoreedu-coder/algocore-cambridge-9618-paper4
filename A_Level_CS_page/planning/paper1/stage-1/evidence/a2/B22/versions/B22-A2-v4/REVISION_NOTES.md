# B22-A2-v4 revision notes

Supersedes frozen `B22-A2-v3` only for seven source-displayed marks and twelve nested-child QP prompt-page locators. All 12 original PDFs are unchanged; v1/v2/v3 snapshots remain unmodified.

| Finding | A2-v4 correction | Evidence for retest |
|---|---|---|
| A0 mark source spot-check (7 records) | Replaced the seven v3 values with the bracket values visibly adjacent to the printed labels. | `CORRECTION_EVIDENCE.json`; `renders/v4-correction-source/`; `MARK_TOTAL_CHECK.json` |
| A0 locator source spot-check (12 records) | Changed each QP PDF page and transcript ref to the page with the printed nested-child prompt; retained the v3 null printed-page field separately. | `CORRECTION_EVIDENCE.json`; `renders/v4-correction-source/`; `QUESTION_INDEX.jsonl` |
| QP visual-region alignment | Moved related child IDs off preceding-page risk regions and onto existing source-page regions where present. | `VISUAL_MANIFEST.json`; v4 source render manifest |
| Paper totals | Independently summed indexed displayed marks and checked original cover totals: 75 for all six papers. Totals were not used to derive any individual mark. | `MARK_TOTAL_CHECK.json` |
| Preserved v3 work | Retained all hierarchy/MS-link/unresolved/context/visual/schema corrections; 32 parent-container unresolved rows unchanged. | `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `UNRESOLVED.md`, structural checks |

This is a source-backed A2 correction candidate, not batch acceptance. The handoff excludes its own hash; the batch manifest records the actual handoff SHA-256.
