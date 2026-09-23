# B21 extraction QA — A2 submission

Artifact version: 0.1.0. Status: `SUBMITTED` pending A3, A4, and A9 review.

## Evidence performed

- Recomputed SHA-256 for all 12 source PDFs and matched each to its Stage 0 manifest record.
- Opened every source page through the PDF parser: 96 QP pages and 58 MS pages, 154 pages total. Each page has a page-index record and an internal page transcript.
- Rendered and visually inspected all 51 pages selected by the documented non-text/layout heuristic. Render files are in `renders/`; four-page inspection sheets are in `review_sheets/`.
- Kept all 48 detected QP question records and 115 detected part records. The part record holds the visible printed label only; it does not imply a teaching classification or answer allocation.
- Added 94 label-level links where the paired MS transcript contains the exact QP `question(part)` label. A link is only a source locator; its text, condition, table row, and mark allocation remain for A4 review.

## Visual review observation

Risk pages contain tables, answer matrices, Boolean/circuit diagrams, E-R diagrams, formula/bit layouts, SQL/code layout, or mark-scheme tables. The rendered pages show that these structures are material to interpretation. Their records remain `A2_VISUALLY_INSPECTED_PENDING_A3_A4_A9`; no A2 record claims independent acceptance.

## Known extraction limits

- The parser emitted CFF Type1/fontTools warnings for some PDFs. These are retained in `extraction-warnings.log`; visual renders were used for affected structure.
- The source PDFs do not give machine-reliable per-part boundaries/mark allocation in the page transcript. `marks_displayed_or_null` remains null unless a reviewer can confirm a particular visual association.
- Exact text-label matching does not prove a one-to-one MS row/condition match. The 94 `MS_LINKED` records need A4 verification; unmatched parts are listed in `UNRESOLVED.md`.
