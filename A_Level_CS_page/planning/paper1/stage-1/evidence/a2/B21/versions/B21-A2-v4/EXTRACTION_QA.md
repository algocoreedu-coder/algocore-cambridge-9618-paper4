# B21 extraction QA — A2 v4

Status: `SUBMITTED_FOR_INDEPENDENT_A3_A4_RETEST`; A3/A4 must retest this exact v4 packet, then A9 performs the independent batch gate.

- v4 is based on hash-pinned active B21-A2-v3 (`HANDOFF_CHECK.json` SHA256 `d2b63bc8244912c59073a5f4c5489133f60a0fd967b0e768a8fe8512d188ca0d`; `BATCH_MANIFEST.json` SHA256 `e759722afa93e23d764a5dc6b22bfa682448d5d8c0c77b538e80a1d1e08515e8`). The source packet and prior v1/v2 snapshots remain unmodified.
- Recomputed all 12 original source PDF hashes and page counts against Stage 0; all 12 match, with 154 total source pages.
- Screened all 154 pages using 12 labeled contact sheets (one per QP/MS). No additional omitted risk page was identified beyond the 16 pages in A9-B21-VIS-01. Those 16 pages were rendered directly from original hash-verified PDFs at 2× and visually compared at full-page resolution.
- Added 16 page-level visual-risk records and source renders: 12 MS pages and 4 QP pages. Visual regions remain `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`; they are not marked independently reviewed.
- Added direct visual dependencies for all 13 explicitly enumerated MS marking-item IDs, spanning 12 MS page associations. The dispatch prose says twelve rows but its table names thirteen distinct IDs; all table IDs are addressed. S21 MS12 p5 has one region related to two printed Q3 labels.
- QP regions relate only to dispatched page-level targets. No answer text, score, table-row assignment, or marking allocation was inferred.
- The 61 existing page renders are retained byte-identically from v3; the v3 packet did not record their rendering method. The source render manifest preserves this provenance limit.
- Page visual status is `VISUAL_CHECK_REQUIRED` for every page declared in the visual manifest and `EXTRACTED` for other indexed pages. Independent review remains pending.
- v3 content is preserved: 48 questions, 205 parts, 207 marking items, 34 parent-context-only unresolved rows, two whole-question marking items, and prior A3/A4 Q7/Q8, locator, hierarchy, and mark-display repairs.

This is a candidate handoff only; it is not independent acceptance or answer/scoring approval.
