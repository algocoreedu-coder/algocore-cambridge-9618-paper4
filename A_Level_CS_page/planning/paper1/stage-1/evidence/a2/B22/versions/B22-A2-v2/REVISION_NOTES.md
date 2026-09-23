# B22-A2-v2 revision notes

Supersedes the frozen snapshot in `versions/B22-A2-v1/`. Shared transcripts and renders in the B22 root are unchanged.

| Review finding | A2-v2 change | Retest evidence |
|---|---|---|
| A4-B22-R01 | Corrected all 16 cited MS pages and added the visible MS part label. The cited records now point to the reviewer-confirmed pages. | `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`; A4 must compare against original MS PDFs. |
| A4-B22-R02 | Every part now has either a unique exact MS locator or `UNRESOLVED` status with a record-specific entry in `UNRESOLVED.md`. | 131 linked / 25 unresolved records; retest locator cardinality. |
| A3-B22-R02 and A4-B22-R03 | Conservatively transcribed 23 displayed marks whose label-to-mark span was isolatable in source text. Remaining null fields each have an explicit unresolved record for visual retest; no mark was guessed. | `QUESTION_INDEX.jsonl`, `UNRESOLVED.md`. |
| A3-B22-R01 and A4-B22-R04 | Added required context and source-page dependency references for W22/11 Q4 and W22/12 Q7, the cited cross-page scenario and processor cases. | Relevant part records in `QUESTION_INDEX.jsonl`. |
| A4-B22-R05 | Removed all eight dangling nested-parent pointers. The parent prompt was not separately indexed, so the relationship is recorded as unresolved rather than inventing parent records. | Parent-resolution validation in `HANDOFF_CHECK.json`; details in `UNRESOLVED.md`. |
| A4-B22-R06 | Added exact MS part labels and visual dependency references where the matching MS page is a rendered risk page. `table_row_ref_or_null` is populated only as the visible question/part row identifier when linked to a visual MS page; no mark allocation is inferred. | `MARKING_INDEX.jsonl`, `VISUAL_MANIFEST.json`. |

## Validation

- Source baseline remains 12/12 matched; question/part cardinality remains 52/156.
- 131 parts have a unique MS part locator; 25 remain record-specifically unresolved.
- Parent references resolve with zero dangling IDs.
- A4 and A9 must retest this exact active version. This is a correction handoff, not an A2 acceptance decision.
