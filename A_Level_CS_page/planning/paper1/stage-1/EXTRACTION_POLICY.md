# Extraction and visual policy — Stage 1

Version 1.1. Owner A0. Date 21/09/2026.

1. Read only original QP/MS PDFs whose source ID/hash matches Stage 0. Record a mismatch as Critical and stop that source.
2. Use text extraction to locate candidate questions and parts, then compare source PDF pages. Do not treat extracted text as authoritative for diagrams, tables, line layout, superscripts, negation, units, merged cells or mark-scheme conditions.
3. Render every page with a diagram, circuit, truth table, table, formula, layout-dependent prompt, answer matrix or conditional MS table. Add a `visual_region`; whole-page reference is acceptable when a stable bbox is not practical.
4. Store all transcripts/renders/scripts below the batch's A2 evidence folder, named by source/page. Do not modify, crop over, repair, copy into a public folder or replace the original PDF.
5. Transcribe only what is needed to identify a question/part/condition. Keep original English wording for source observations. Never create VI/EN learner text in this stage.
6. Preserve parent prompt context and dependencies. If a later part relies on a diagram or prior data, link the context rather than duplicate it inaccurately.
7. Link a marking item only when its MS location is known. Use a part target for a printed part and a question target for an unparted whole-question item as specified in schema v1.1; never invent a lettered child. A generic MS header, total, or visually ambiguous row is `UNRESOLVED`; never infer an item-level mark.
8. For every page record `extraction_status` and `visual_status`; separate “rendered” from “visually checked”. A worker may mark `VISUAL_CHECK_REQUIRED`; A4/A3/A9 provide subsequent review evidence.
9. Verify total displayed marks within a question where possible; retain discrepancies and incomplete mapping in `UNRESOLVED.md`, with source page and owner.
10. Copyright-sensitive handling: derived artifacts are internal evidence. Do not publish copied paper pages, build a public question bank, or add source PDFs to app assets.

## Risk classes to sample in every review

- circuit/gate geometry and truth tables;
- formula/unit/number layout;
- multi-part scenario context and dependency;
- MS tables, alternatives, conditions, maximum marks;
- a page containing no visible non-text structure, to ensure the policy is not over-flagging.

Poppler warnings, parser limits and ambiguous printing are evidence, not grounds to silently drop a source. Write the warning and carry the record forward.
