# B21 unresolved register — A2

## A2-UNR-01 — displayed marks and exact part boundaries

- **Evidence:** QP locators in `QUESTION_INDEX.jsonl`; rendered pages in `renders/`.
- **Observed:** parser line order does not safely associate every bracketed displayed mark with a specific subpart, especially across table/layout content.
- **Disposition:** all uncertain `marks_displayed_or_null` fields are null. No allocation was inferred.
- **Owner / next action:** A4 compares each QP part to the original visual page and MS table/condition.

## A2-UNR-02 — 21 QP parts have no exact MS label-link

- **Evidence:** `QUESTION_INDEX.jsonl` records with `status: UNRESOLVED`; absent exact label hit in the paired MS transcript.
- **Observed:** MS grouping, page layout, or question-level headings prevents a safe direct part match.
- **Disposition:** no marking item was created for those parts.
- **Owner / next action:** A4 resolves only with an original-PDF locator, or retains the record as unresolved.

## A2-UNR-03 — visual/table/circuit semantics

- **Evidence:** 51 records in `VISUAL_MANIFEST.json` and matching `renders/` assets.
- **Observed:** diagrams, cells, shading, or layout may carry conditions absent or lossy in transcript text.
- **Disposition:** retained risk/page evidence; no claim of accepted visual interpretation.
- **Owner / next action:** A3 checks source context; A4 checks question-to-MS correspondence; A9 samples every risk class.

## A2-UNR-04 — parser font warning

- **Evidence:** `extraction-warnings.log`.
- **Observed:** fontTools/CFF Type1 parsing warnings occurred during text extraction.
- **Disposition:** transcripts are navigational evidence only and visual render remains authoritative for non-text structure.
- **Owner / next action:** reviewers use original PDF/render for any affected wording or symbol.
