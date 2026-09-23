# A3 independent review: reference documents and report joins

**Result: PASS for the bounded review below.** Reviewed 19 September 2026. No required rework finding. Lead retains the final Stage1 gate decision.

Reviewed `EXAMINER_REPORT_INDEX.json`, `REFERENCE_DOCUMENT_INDEX.json` and the examiner-report joins in `QUESTION_INDEX.json`. This review did not edit these files, re-review question indexing/data integrity, or begin Stage2.

## Checks and evidence

| Check | Result | Evidence |
|---|---|---|
|All15 Paper4 ER section boundaries|PASS|Independently opened the five original PDFs, enumerated their Practical component headings, and derived each end from the next heading or document end. Every indexed page range matched, including continuation pages without question headings.|
|ER section identity and status|PASS|Each section's component, session/year and paper ID matched its source. s21/41 PDF36 explicitly reports too few candidates for a meaningful report; no advice anchors were invented.|
|All84 ER anchors|PASS|Re-read original PDF line/spans and transformed bounding boxes, matching label, page and geometry within0.1pt. Fourteen substantive sections each have Key messages, General comments, Comments on specific questions and Questions1–3.|
|29 paper-to-report joins|PASS|Each paper's section IDs equal only sections naming that exact paper. Fourteen substantive reports, one no-meaningful-report status, fourteen unavailable-in-baseline statuses. No borrowed variant report.|
|Book metadata and TOC|PASS|PDF5–6 confirms David Watson/Helen Williams, Hodder Education, first published2019 and ISBN9781510457591. TOC PDF7–9 agrees with all20 chapter entries.|
|Book chapter page mapping|PASS|Opened all20 actual chapter-start pages and checked title and printed page marker individually. Each indexed start has PDF=printed+16; Roman front matter is explicitly excluded. Book has576 PDF pages.|
|Syllabus identity|PASS|Original PDF1 identifies Cambridge9618, exams2026 and Version2; PDF3 states version2 published December2025. Document has49 pages.|
|Original source identity|PASS|Recomputed SHA256 for all seven original PDFs and matched the extraction records; review JSON records source paths, hashes and page counts.|
|Visual source inspection|PASS|Viewed ten facsimiles: s21ER36–37; w23ER38–39; book6,9,466,514; syllabus1,3. Confirmed missing-report notice, report boundary continuation, title/TOC/printed-page context and version notice.|

## Verified report ranges

| Source | Component41 | Component42 | Component43 |
|---|---|---|---|
|9618_s21_er|36, no meaningful report|37–39|40–42|
|9618_s22_er|35–37|38–40|41–43|
|9618_w22_er|43–46|47–50|51–54|
|9618_s23_er|37–40|41–44|45–48|
|9618_w23_er|34–38|39–42|43–47|

Paper-specific advice remains bound to the listed component. For example, matching s21 QP bodies do not justify copying s21/42 advice into s21/41, whose own report has no substantive content. The current joins respect this boundary.

## Review artifacts and limits

`A3_REFERENCE_REVIEW.json` records exact input hashes, original-source hashes, every section range, every chapter mapping and all29 joins. `A3_reference_review.py` contains the independent mechanical checks; `A3_reference_renders/` retains the ten inspected facsimiles. The script marks visual review pending on regeneration; a reviewer must inspect the renders before completing that status.

This PASS confirms source identity and navigation. It does not certify detailed knowledge-to-book mappings, interpretation of examiner advice, or solutions. No new comparison of source bytes with Cambridge hosting was performed; the reference index accurately states that limitation.
