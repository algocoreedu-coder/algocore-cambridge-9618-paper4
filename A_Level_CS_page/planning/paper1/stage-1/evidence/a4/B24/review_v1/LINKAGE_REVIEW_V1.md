# B24 A4 v1 independent QP/MS linkage review

Status: **PASS_A4_ONLY**. This is an A4 specialist-gate recommendation for frozen candidate B24-A2-v1. It is not batch acceptance; A3/A9/A0 gates remain separate.

## Pinned inputs and integrity

All 8 work-order/candidate/source/schema/policy pins match. The candidate snapshot was re-hashed entry by entry: 392/392 entries match. All 12 original 2024 QP/MS PDFs match their pinned SHA-256 values and page counts (156 pages). The 156 reviewer renders and 42 contact sheets have matching recorded hashes. The candidate was not modified.

## Linkage, marks and hierarchy

All 170 marking items were checked against the exact original MS page and indexed QP target. Checks covered target cardinality/type, QP/MS component pairing, MS question/part locator, source text tokens, table-row references, visual dependency resolution, and item-to-region backlinks: **170/170 passed, zero discrepancies**. All 243 QP roots/part locators and target relationships passed. There are 165 marking rows targeting printed parts and five targeting whole questions; those preserve whole-question targets and do not create synthetic parts.

The 29 structural parent groupings have null displayed marks and no separate MS locator/allocation. Each has children linked under that parent (23 groups with two children, six with three); no marks were inferred or assigned to the parent.

Six paper totals were independently recomputed from explicit indexed QP marks and checked against printed cover totals:

- 9618_s24_qp_11: indexed explicit marks 75; original cover 75; PASS.
- 9618_s24_qp_12: indexed explicit marks 75; original cover 75; PASS.
- 9618_s24_qp_13: indexed explicit marks 75; original cover 75; PASS.
- 9618_w24_qp_11: indexed explicit marks 75; original cover 75; PASS.
- 9618_w24_qp_12: indexed explicit marks 75; original cover 75; PASS.
- 9618_w24_qp_13: indexed explicit marks 75; original cover 75; PASS.

## Context and visual evidence

All 49 question contexts were checked against the original QP page set and source-page contact screens; no blank or imprint-only page was included as question context. Boundary cases reviewed include:

- 9618_s24_qp_11 9618_s24_qp_11-q7: PASS: p16 begins Q8.
- 9618_s24_qp_12 9618_s24_qp_12-q8: PASS: p16 carries Q8 continuation before imprint footer.
- 9618_s24_qp_13 9618_s24_qp_13-q7: PASS: Q7(f) continues on p16; permission notice is footer.
- 9618_w24_qp_11 9618_w24_qp_11-q6, 9618_w24_qp_11-q7: PASS: both Q6 and Q7 begin on p13; Q8 begins p14.
- 9618_w24_qp_11 9618_w24_qp_11-q8: PASS.
- 9618_w24_qp_12 9618_w24_qp_12-q8: PASS: Q9 begins p16.
- 9618_w24_qp_13 9618_w24_qp_13-q8: PASS: Q9 begins p16.

All 156 pages (100 QP and 56 MS) were visually screened on hash-pinned contact sheets. All 44 MS visual-dependency pages were inspected full-size. A 20-page full-size QP risk sample across the six variants included logic expressions/circuits/truth tables, embedded-device and robot illustrations, processor instruction and memory tables, database/ER layouts, binary arithmetic/bitmap calculations, network/verification tables, sensor/system tables, and software/database structures. The candidate's 130 visual regions resolve to their source-page renders and relevant IDs; no dangling visual references or source-layout mismatch was found.

Full-size QP risk samples: 9618_s24_qp_11 p2, 9618_s24_qp_11 p3, 9618_s24_qp_11 p8, 9618_s24_qp_11 p13, 9618_s24_qp_12 p2, 9618_s24_qp_12 p7, 9618_s24_qp_12 p11, 9618_s24_qp_13 p3, 9618_s24_qp_13 p11, 9618_s24_qp_13 p13, 9618_s24_qp_13 p14, 9618_s24_qp_13 p15, 9618_s24_qp_13 p16, 9618_w24_qp_11 p4, 9618_w24_qp_11 p12, 9618_w24_qp_12 p2, 9618_w24_qp_12 p9, 9618_w24_qp_13 p2, 9618_w24_qp_13 p6, 9618_w24_qp_13 p9.

Full-size MS visual-dependency pages: 9618_s24_ms_11 p3, 9618_s24_ms_11 p4, 9618_s24_ms_11 p5, 9618_s24_ms_11 p6, 9618_s24_ms_11 p7, 9618_s24_ms_11 p8, 9618_s24_ms_12 p3, 9618_s24_ms_12 p4, 9618_s24_ms_12 p5, 9618_s24_ms_12 p6, 9618_s24_ms_12 p7, 9618_s24_ms_12 p8, 9618_s24_ms_12 p9, 9618_s24_ms_12 p10, 9618_s24_ms_12 p11, 9618_s24_ms_13 p3, 9618_s24_ms_13 p4, 9618_s24_ms_13 p5, 9618_s24_ms_13 p6, 9618_s24_ms_13 p7, 9618_s24_ms_13 p8, 9618_s24_ms_13 p9, 9618_w24_ms_11 p3, 9618_w24_ms_11 p4, 9618_w24_ms_11 p5, 9618_w24_ms_11 p6, 9618_w24_ms_11 p7, 9618_w24_ms_11 p8, 9618_w24_ms_11 p9, 9618_w24_ms_12 p3, 9618_w24_ms_12 p4, 9618_w24_ms_12 p5, 9618_w24_ms_12 p6, 9618_w24_ms_12 p7, 9618_w24_ms_12 p8, 9618_w24_ms_12 p9, 9618_w24_ms_12 p10, 9618_w24_ms_13 p3, 9618_w24_ms_13 p4, 9618_w24_ms_13 p5, 9618_w24_ms_13 p6, 9618_w24_ms_13 p7, 9618_w24_ms_13 p8, 9618_w24_ms_13 p9.

For S24 component 13 Q3(b), the QP locator points to the part start on p6; displayed [3] is printed at the end of its continuation on p7. The original p7 and candidate MARK_TOTAL_CHECK observation were checked directly. This is consistent locator semantics, not a mismatch: the prompt locator points to the part start while the mark-token observation preserves p7.

## Open findings and gate

LINKAGE_FINDINGS_V1.json contains zero source/linkage findings and zero open Critical/Major issues. The informational locator note above does not require a correction. Recommendation: **PASS_A4_ONLY**. A3, A9 and A0 review/acceptance remain pending and are outside this handoff.
