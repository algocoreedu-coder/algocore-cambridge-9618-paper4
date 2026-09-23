# A3 submission: corpus index 2021–2022

Status: **SUBMITTED TO LEAD**, 19 September 2026. This agent does not grant the Stage1 gate.

## Reconciliation

| Paper | Scored parts | Q1 | Q2 | Q3 | QP / MS / index totals |
|---|---:|---:|---:|---:|---|
|9618_s21_41|19|24|20|31|75 / 75 / 75|
|9618_s21_42|19|24|20|31|75 / 75 / 75|
|9618_s21_43|19|24|20|31|75 / 75 / 75|
|9618_s22_41|23|29|25|21|75 / 75 / 75|
|9618_s22_42|19|25|23|27|75 / 75 / 75|
|9618_s22_43|23|29|25|21|75 / 75 / 75|
|9618_w21_41|21|17|30|28|75 / 75 / 75|
|9618_w21_42|21|17|30|28|75 / 75 / 75|
|9618_w22_41|21|23|31|21|75 / 75 / 75|
|9618_w22_42|22|23|31|21|75 / 75 / 75|
|9618_w22_43|21|23|31|21|75 / 75 / 75|

Total: **11 QP/MS pairs, 33 questions, 228 scored parts, 825 marks**. Every scored part has QP and MS page locators, independently sourced mark totals, a manually written prompt summary, local dependency references and evidence instructions. These are source-index checks, not a marking-point teaching map.

## Reading and verification method

- Read all six distinct QP bodies and the corresponding marking requirements and Python examples across their pages; compare the other five variants page by page, retaining every paper/source ID. Metadata on cover pages retained in original extraction.
- Verify every QP evidence label and bracketed mark against MS left-column labels and right-column Marks values. Continued MS rows contribute pages but do not add marks again. No jointly scored QP subparts require splitting in this batch.
- Retain parent containers in `unscored_structure`; initial data, class diagrams and table context stay linked through `context_pages` and original extraction. QP w21 3(b) explicitly spans pages8–9; indexing only the evidence page9 would omit its specification.
- Preserve the global evidence.doc requirement from QP pages1–2, with candidate name, centre number and candidate number on every page and evidence filename convention. Question save names are retained per question; per-part instructions specify code versus screenshot(s).
- Root's first MS layout extraction was scrambled by rotation. Reported this finding to Lead; local candidate extraction uses display coordinates transformed through each page's rotation matrix. Lead subsequently supplied natural-order text plus display geometry. Original PDFs remain unchanged.
- Inspected **20 rendered source pages**, covering linked-list/table context, two-page tree insertion, binary-tree data, job-priority table, circular queue pseudocode, Python OOP attributes, marking columns, and source-code caveats. References are recorded under each paper's `review.rendered_pages_checked`. Content-equivalent variants share baseline image evidence and have separate page-by-page text-equivalence evidence.
- Ran `validate_index.py`: complete and unique QP label coverage; per-part mark equality; page ranges and MS labels; dependency resolution and acyclicity; evidence instructions; render existence. Details in `VALIDATION.json`.

## Variant equivalence

`VARIANT_EQUIVALENCE.json` records every QP/MS page from page2 onward. Whitespace and component header numbers are the only normalized text.

- s21 variants41/42/43 have the same question bodies and mark schemes.
- s22 variants41/43 have the same question bodies and mark schemes.
- w22 variants41/43 have the same question bodies and mark schemes.
- w21 variants41/42 differ only in the parentheses around OUTPUT "Tree is full" in QP page9; their mark schemes match.

No source is deleted or treated as an independent additional exercise merely because it has a different variant number. Stage2 owns later pedagogical deduplication.

## Source caveats handed onward

All are recorded with locators in `index.json`; source fidelity and unresolved solution correctness are separate statuses. Their presence does not make a misprinted published example a validated teaching solution.

- s21 3(b): QP has five questions, but one MS bullet says four array elements. Use the published Marks column value8, not a count of bullet points.
- s21: free-list updates in the addNode example require independent verification; Data/data, points/pointsP and arrayData/theArray vary across the examples.
- s22_41/43: Dequeue examples use false, Queue(Head), and a reset condition at9 inconsistent with the rubric's more-than9 condition. High-score/balloon snippets have further identifier, file-call and indentation candidates recorded for Stage5.
- s22_42: BinarySearch QP midpoint includes Upper−1; MS replaces the QP's Upper>=Lower guard with Upper>=0 and prints capital If in Python. Both sources are preserved. Card snippets also need independent integration verification.
- w21: ReadData has total8 in the Marks column with multiple bullet groups; do not infer9 from bullet arithmetic. AddNode Python indentation is visibly uneven.
- w22_41/43: FindValues Python sample uses range(0,99) for a100-element array and uneven indentation.
- w22_42: Character constructor prints XCoordiante whereas getters use XCoordinate; Enqueue sample omits a global HeadPointer declaration. The rendered sample retains underscores and matches the extracted text.

These findings are an observation register, not an exhaustive Stage5 code audit. Stage1 has not executed or corrected exam solutions, created a taxonomy, or authored course lessons. Before solutions are published, the Programming Verifier must implement and independently test against QP requirements and marking criteria.

## Data handoff and output files

Required supplied academic-data names in this batch: TreasureChestData.txt, HighScore.txt, CardValues.txt, Pictures.txt, IntegerData.txt, Characters.txt. Data integrity, exact ZIP matching and availability are owned by A2; the part records identify where they are required. NewHighScore.txt is an output students create, not a missing supplied file. Evidence.doc is a paper-level template requirement.

Primary handoff: `index.json`, `VALIDATION.json`, `VARIANT_EQUIVALENCE.json`, this review and `renders/`. `annotations.py` holds the manual summaries/dependencies; `build_index.py` regenerates the index; `validate_index.py` validates it. `prepare.py` and `*_ms_candidates.json`, `*_ms_rubrics.txt`, `*_ms_normalized.txt` are local preparation aids, not authoritative replacement text. A portrait-page left-margin filter in the first compact-rubric aid was corrected during review; full shared extraction/original PDF and manual reading were used for the submitted index.

No open label, mark, locator, dependency or continuation discrepancy is known in this submission. Lead and independent QA must review it alongside A2 data readiness before any Stage1 PASS.
