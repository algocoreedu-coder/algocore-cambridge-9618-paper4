# A3 submission — 2023–2024

Status: **submitted to Lead**, not Stage 1 gate approval. Scope: 12 QP / 12 MS, 304 scored parts, 900 marks. Stage 0 inputs read: WORK_ORDERS schema and Stage 0 GATE_REVIEW; 2026 / Python / complete VI–EN course scope. No Stage 2 taxonomy, coursebook mapping, new solutions or application changes.

## Review evidence

- Read all QP task text, parent specifications, supplied data and pseudocode, evidence instructions, filenames and final-page tasks. Read MS marking rows for every scored part; inspected example/continuation structure and representative Python code against page renders. This source-index review does not execute or certify the example programs, nor convert MS examples into student solutions.
- Extracted source text with PyMuPDF natural order into batch-local `*_readable.txt`. Initial shared extraction using coordinate sorting displayed rotated MS text incorrectly; Lead corrected the shared extractor. Batch-local source text is a supplementary working copy, not a replacement canonical source.
- MS labels and points use transformed display coordinates. QP evidence labels and bracketed points independently corroborate every row. Manual prompt summaries are in `summaries.json`; mechanical assembly/reconciliation is `build_index.py` and `check.py`.
- For four 41/43 pairs, QP pages 2 onward and all MS pages match exactly after normalising only the paper-number header. Full separate identities retained. `CHECKS.json` records compared pages and normalised hashes. Covers differ, and this is not a deduplication decision for Stage 2.
- `qp_pages` and `ms_pages` are PDF 1-based and match printed numbering here. Shared data/class tables/pseudocode are located in each question's `context_pages`; unscored parents remain in `unscored_structure`.
- `dependency_refs` includes the preceding step of the cumulative saved-program workflow plus explicit part references. It deliberately does not claim a knowledge prerequisite graph. Question-level source files apply to the integrated program; part-level files name direct textual references, while tests inherit the integrated dependency.
- All programs are saved to the exact QP base names recorded in `program_filenames`. The input evidence file is evidence.doc, saved using centre/candidate numbers, with identity on every page. Per-part requirements distinguish program code from screenshot(s).

## Reconciliation

| Paper | Scored parts | Q1 | Q2 | Q3 | QP / MS total |
|---|---:|---:|---:|---:|---:|
| 9618_s23_41 | 26 | 18 | 32 | 25 | 75 / 75 |
| 9618_s23_42 | 22 | 14 | 28 | 33 | 75 / 75 |
| 9618_s23_43 | 26 | 18 | 32 | 25 | 75 / 75 |
| 9618_w23_41 | 26 | 16 | 29 | 30 | 75 / 75 |
| 9618_w23_42 | 26 | 27 | 17 | 31 | 75 / 75 |
| 9618_w23_43 | 26 | 16 | 29 | 30 | 75 / 75 |
| 9618_s24_41 | 25 | 27 | 31 | 17 | 75 / 75 |
| 9618_s24_42 | 26 | 22 | 30 | 23 | 75 / 75 |
| 9618_s24_43 | 25 | 27 | 31 | 17 | 75 / 75 |
| 9618_w24_41 | 26 | 22 | 34 | 19 | 75 / 75 |
| 9618_w24_42 | 24 | 29 | 29 | 17 | 75 / 75 |
| 9618_w24_43 | 26 | 22 | 34 | 19 | 75 / 75 |

## Findings resolved or preserved

1. **MS label typo:** w23_42 MS PDF29 prints `3(b(iii)`; QP PDF12 and task order clearly identify `3(b)(iii)`. Canonical index preserves the 1 mark with a raw-label note. Initial strict-label extraction totalled 74; corrected and rechecked to 75. Visual evidence: `images/w23_42_ms_29.png`.
2. **Unlabelled continuation pages:** w23_41/43 MS PDF5, 7, 22 continue preceding scoring rows without a repeated left label. Leading continuations on PDF6 and 8 are also retained. They carry no additional separately counted marks. Visual sample: PDF19 showing labelled code continuation; text inspection of PDF5–8 and PDF21–23 confirmed association.
3. **Source naming inconsistency:** s24_41/43 QP PDF10 2(e)(iii) calls `ChooseTrees()` but the defined procedure in PDF9 is `ChooseTree()`. Both source wordings preserved in notes; no source edited. The teaching/solution stage must explicitly resolve this naming choice.
4. **MS bullet count is not point total:** s24_41/43 MS PDF5 1(b) has only three displayed bullet items while the Marks column and QP both allocate 5. The source's 5 marks remain; no inferred division of marking points. Visual evidence: `images/s24_41_ms_5.png`.
5. **Extraction is not executable code:** table relationships, branches, diagram edges, arrows and code indentation require facsimiles. Representative constructor renders s23 MS41 PDF13, s24 MS41 PDF15 and w24 MS42 PDF8 were compared to natural text: their double underscores are retained in these samples. This sample result must not be generalised to every code page; Lead's broader corpus warning still applies. No silent code repair.

## Visual pages inspected

- s23 QP41 PDF4 Vehicle class table; MS41 PDF13 Python private fields/constructor.
- s23 QP42 PDF7 circular queue records and evidence boxes.
- w23 QP41 PDF6 TotalData pseudocode and nesting; MS41 PDF19 code continuation.
- w23 MS42 PDF29 malformed label and screenshot point.
- s24 QP41 PDF12 check-digit table and validation specification; MS41 PDF5 point column; MS41 PDF15 Python constructor.
- s24 QP42 PDF6 binary tree diagram and Node table: root 15; left child 8 with children 3 and 10; right child 19. Text reading order alone does not convey these edges.
- w24 QP41 PDF12 initial linked/free-list table and omitted middle rows.
- w24 QP42 PDF13 two-key score example table; MS42 PDF8 Python Character constructor/private names.

All images are source facsimile evidence under `images/`. Per-paper index review links the representative pages; 43 records explicitly refer to equivalent 41 content samples.

## Remaining boundaries

No unresolved missing scoring row, mark mismatch, duplicate point total or orphan dependency was found in this batch's self-check. Source naming/bullet inconsistencies above remain visible as source issues, not invented corrections. Required data acquisition/integrity is A2's workstream, not asserted complete here. Lead and independent QA must review this submission before the stage can pass.
