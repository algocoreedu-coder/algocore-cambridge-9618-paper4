# B22-A2-v3 revision notes

Supersedes the frozen B22-A2-v2 snapshot. All 12 original PDF inputs remain unchanged.

| Finding | A2-v3 correction | Evidence for retest |
|---|---|---|
| B22-A4-V2-01 | Replaced prefix-only parent links with exact printed nested leaf links where present; parent rows without a standalone MS item are item-specifically unresolved. | `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `UNRESOLVED.md` |
| B22-A4-V2-02 | Rebuilt the full printed parent/child hierarchy, including the eight cited children. | `QUESTION_INDEX.jsonl`; parent uniqueness checks |
| B22-A4-V2-03 | Rechecked displayed marks on QP source pages; parent rows no longer inherit child marks; unparted question-level marks remain on question records. | `QUESTION_INDEX.jsonl`, `EXTRACTION_QA.md`, render index |
| B22-A4-V2-04 | HANDOFF_CHECK excludes itself; BATCH_MANIFEST contains its actual SHA256. Each exclusion is documented. | `HANDOFF_CHECK.json`, `BATCH_MANIFEST.json` |
| B22-A4-V2-05 | Updated locator/schema note for part- and question-level targets; no item-level mark allocation was inferred. | `BATCH_MANIFEST.json` |
| V2 source-label correction | Removed the v2 `9618_w22_qp_12-q1-pc` row: QP page 5 is Q3(b)/(c), and Q1 has no printed (c). This prevents a page-misassigned part from surviving into v3. | `QUESTION_INDEX.jsonl`, `UNRESOLVED.md`, QP transcript p5 |

Rebuilt 214 printed part records (32 parents, 182 leaves), 188 exact marking links, and 32 item-specific unresolved records. The v3 batch awaits independent A3/A4/A9 retesting and is not accepted by A2.
