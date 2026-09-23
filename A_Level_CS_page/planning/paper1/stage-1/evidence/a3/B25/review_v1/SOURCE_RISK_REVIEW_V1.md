# B25 A3 source-risk review v1

Status: **CHANGES_REQUIRED for A3 context gate only.** Candidate: `B25-A2-v1`. Candidate extraction, source PDFs, tracker and app were not edited.

## Source and render integrity

The frozen Stage 0 source manifest SHA256 is `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c` and the 2026 syllabus PDF SHA256 is `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`. All 12 original 2025 QP/MS PDFs independently matched Stage 0 by SHA256 and page count (178 total pages). The candidate's 438 snapshot artifacts were rehashed and byte-count checked. The twelve candidate all-page contact sheets were screened, covering all 178 source pages. Direct 2x PyMuPDF renders were produced from the exact original PDFs for 77 risk-selected pages; each render and its source hash is listed in `SOURCE_RENDER_EVIDENCE_V1.json`.

The 77-page sample contains all six QP covers, all 11 preflight context pages lacking same-question root/child locators, question boundaries and multi-page continuations across all six QP variants, plus 13 MS pages spanning tables, logical expressions/truth tables, processor traces and marking rows across all six MS variants. Each of the 11 orphan context pages was classified at full size. Ten are false additions; `9618_s25_qp_11` PDF p15 in Q8 is legitimate shared processor-state context and is retained.

Structural locator reconciliation passed for all 51 root QP locators, 207 part QP locators, populated part MS locators and 183 marking-item MS locators: source IDs, question IDs, full part paths, target exclusivity and page ranges are consistent. This is distinct from semantic full-size review of every printed item.

## Independent count checks

The candidate index recomputes to 51 roots, 207 parts, 183 marking items, 178 page records and 144 visual regions. All 27 unmarked/null-MS parent labels have indexed children, no marking item attached directly to the parent, and explicit child MS locators; this supports their structural-parent interpretation without inferring an allocation. The six QP covers state 75 marks each; the independently summed explicit root/part marks are 75 for each variant.

The 11 populated `command_word_verbatim_or_null` values were checked against original QP pages and kept as verbatim short observations, not taxonomy labels. Structural source/question/full-part/page-range reconciliation passed for every QP/MS locator; no other locator consistency or mark-total discrepancy surfaced. This is not a full-size semantic transcription check and does not replace A4's independent extraction/visual review or A9's package review.

## Risk and limits

The main risk is repeatable question-boundary leakage: ten pages belonging only to a subsequent question or a page-turn notice are listed as continuation/context evidence for an earlier root across five QP variants. Downstream lesson assembly or retrieval could associate the wrong question with content. Exact records and render witnesses are in `CONTEXT_SCOPE_FINDINGS_V1.json`; A2 must correct a new immutable version and A3 must retest those rows.

Scope was reviewed against the pinned 2026 syllabus authority (Paper 1 sections 1-8) and Stage 0 scope decisions. No standalone out-of-scope objective was flagged. This review does not claim 2026 coverage, frequency, lesson coverage, question correctness, translation quality or final taxonomy. W25/11 Q10's 3D-printer prompt is noted as an application context only.

Visual review limits: this was an A3 risk-based full-size sample plus all-page contact-sheet screen, not a 178-page full-resolution inspection or a complete semantic proof of every QP/MS transcription. Copyright-sensitive prompt content is described only enough to locate findings; no source page was edited or published.
