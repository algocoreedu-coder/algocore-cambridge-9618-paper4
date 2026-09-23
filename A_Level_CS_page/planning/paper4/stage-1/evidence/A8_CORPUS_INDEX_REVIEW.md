# A8 independent corpus/index review

**Recommendation: PASS after rework for the submitted Stage 1 corpus.** The Lead owns the final Stage 1 gate. No Stage 2 taxonomy, knowledge mapping, teaching solution or executable-code approval is implied.

## Evidence and checks

- Independently parsed all 672 QP evidence labels and their bracketed marks from the page extraction already verified against raw PDFs. Every label, individual point value and evidence page agrees with the index; all 29 papers total 75 marks each, 2,175 overall.
- Independently reconstructed MS rows from left-column labels and right-column Marks using display coordinates. Checked every score and all continuation page sets, including pages with no repeated label. All 672 rows agree. The one malformed raw label `3(b(iii)` on w23/42 MS PDF29 is explicitly normalized to QP `3(b)(iii)`; its source typo remains documented.
- Checked unique paper/part identities, all QP/MS page bounds, unscored parent containers, dependency resolution and cycle absence. Dependencies denote cumulative saved-program workflow and explicit source references; they do not claim a pedagogical prerequisite graph.
- Reviewed all 140 editorial summaries in the 2025 submission; independently read ordinary and edge task samples in every 2025 paper. Rechecked earlier-batch samples involving the two-page w21/41 AddNode specification, s21/41 question-record count, s22/42 array task, s23/42 variable employee records, w23/42 malformed label, and s24/41 mark-column versus bullet-count distinction.
- Compared every original batch value recursively with `QUESTION_INDEX.json`. The aggregate preserves all batch fields and adds valid part IDs/source links. All QP/MS, data bundle, file-name and ER joins resolve. All 94 primary source records have matching source byte hashes/sizes. Original 21 local ZIPs and 8 recovered ZIPs are preserved with their provenance distinctions.
- Read the 15 ER section headers and checked their anchor text and paper joins. s21/41 PDF36 explicitly says too few candidates for a meaningful report; the status correctly records this rather than treating it as substantive guidance.
- Checked the 20 coursebook chapter-start page markers against actual page text. These are document locators, not the Stage 3 knowledge-to-exam mapping.
- Independently verified all 58 facsimile source identities, 1,396 page sequences and image hashes. `EXTRACTION_POLICY.md` satisfies the mandatory raw-PDF/facsimile control for code, arrows, tables and screenshots.

Detailed independent per-row QP/MS reconciliation, structural checks and aggregate checks are retained in [A8_CORPUS_INDEX_REVIEW.json](A8_CORPUS_INDEX_REVIEW.json). Data integrity and data-format checks are in [A8_DATA_EXTRACTION_REVIEW.md](A8_DATA_EXTRACTION_REVIEW.md).

## Findings, required rework and recheck

| Finding | Problem | Final independent recheck |
|---|---|---|
| S1-DATA-01 | RAR JSON initially had no SF members although the saved listing contained 21. | CLOSED: repaired metadata equals the independently parsed set of 21 listing paths. |
| S1-EXTRACT-01 | Text loses visible underscore/assignment-arrow glyphs and does not preserve every table/screenshot relationship. | CLOSED: mandatory fidelity policy and full QP/MS facsimile manifest verified; raw text remains unaltered. |
| S1-IDX-01 | s25/41 2(b) incorrectly described a 2D array, 2(c) implied filtering by colour; several summaries injected MS-only exception requirements. Lead also caught the incorrect null Tree constructor/root-insertion summary. | CLOSED: aggregate now specifies six 1D arrays, append supplied array to filename, FirstNode initialized from parameter, root 10 plus four insertions; unsupported QP exception claims removed. Rechecked against QP PDF4–5,8–9 and relevant w25 pages. |
| S1-IDX-02 | w25/43 1(d)(ii) evidence text retained test labels but dropped numeric values from the table. | CLOSED: aggregate states row inputs 10 then 4, column inputs −1 then 5, screenshot instruction and explicit full-table PDF/facsimile reference. |

No mandatory finding remains open in this review. Source-example defects remain annotated for later independent solution verification; they are not silently corrected or considered already validated teaching code.

## Visual samples in this review

In addition to the 11 data/extraction review images, A8 directly inspected these 11 generated facsimiles:

- s25 MS42 PDF14: Calculate marking row and continuation.
- s25 MS43 PDF40: RemoveNode row, maximum 6 marks and Boolean cases.
- w25 MS41 PDF20: AddTrain row and Python sample.
- w25 MS42 PDF23: recursive binary-search row.
- w25 MS43 PDF35: string-splitting row and continuation.
- s25 QP41 PDF8: Tree constructor parameter and unscored parent specification.
- w25 QP43 PDF8: validation/test input table.
- w23 MS42 PDF29: malformed source label and screenshot point.
- w21 QP41 PDF8–9: two-page AddNode specification and pseudocode.
- s24 MS41 PDF5: 5 in Marks column despite 3 displayed bullet items.

Images were generated mechanically for every QP/MS page; visual QA is a targeted sample, not a claim to have visually inspected all 1,396 pages. All point values and index locators were checked mechanically against source text/geometry in addition to these content samples. No exam program or macro was executed by this review.
