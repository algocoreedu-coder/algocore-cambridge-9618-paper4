# B23 source risk review

Task: `P1-S1-A3-B23` | Input: `B23-A2-v1` | Status: `SUBMITTED_REVIEW_PENDING`

## Identity and integrity

| Check | Result | Evidence |
|---|---|---|
| B23 source set | 12/12 IDs present | `BATCH_MANIFEST.json` lists six QP/MS pairs: 2023 sessions s/w, components 11/12/13 |
| QP/MS source SHA-256 | 12/12 match independently recomputed local files, Stage 0 manifest, and B23 manifest | original PDFs under `Past_Papers/2023/May_June/` and `Past_Papers/2023/Oct_Nov/`; exact hashes remain in the versioned A2 manifest |
| Source page counts | 12/12 match; total 157 pages | Original PDF page counts vs Stage 0 and B23 manifests |
| Scope authority | Match | local 2026 syllabus SHA-256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470` matches Stage 0's verified official 2026 v2 record |
| Index structure | 46 question starts, 197 parts, 197 MS locator records, 157 page rows | B23 JSONL and manifest counts |

The hashes confirm the local source versions identified by Stage 0. They do not independently certify every PDF as a publisher/Cambridge-issued byte-for-byte copy beyond the Stage 0 evidence.

## Context and extraction risks

- A2 reports 61 keyword-screened visual pages rendered and self-inspected. The corresponding regions remain pending independent review; rendering alone is not visual acceptance. I spot-checked A2 contact sheets for a June QP and MS and opened the two November p15 source renders below.
- A structural scan of all six original QP PDFs found two layout-dependent pages absent from the 61-region visual manifest: `9618_w23_qp_11`, PDF p15 and `9618_w23_qp_12`, PDF p15. Both source renders exist under A2. The first shows a boxed 8-bit ACC value for an XOR operation; the second shows an instruction-set trace input across multiple tables. These are recorded as `B23-VIS-01` and `B23-VIS-02`.
- The second omission also affects source context: `9618_w23_qp_12` Q9(b), PDF p14, says its initial memory and character-set values are given on p15. A2 has no prompt reference or visual region for p15. The row `9618_w23_qp_12-q9-pb` alone is therefore not sufficient to reconstruct the question input. This is `B23-CTX-01`.
- A2 reports no unresolved QP-part/MS locator records. That count does not cover the source-page context and visual-region omissions above. Keep all three open until A2 repairs the links and A9 verifies the original pages.
- The unit comparison in `9618_w23_qp_12`, PDF p6, is “kibibyte” versus “megabyte”; the indexed MS location is `9618_w23_ms_12`, PDF p4. Keep those exact units when resolving the linked answer. This is a minor precision retest for A4, not a source-integrity failure.

## Source hierarchy and reuse boundary

Syllabus 2026 v2 §§1–8 controls whether a Paper 1 lesson objective is required. The QP/MS pairs control the wording and marks of these 2023 source tasks. The coursebook is not used to override either. Preserve the source's session, component, question, part, page, and visual context; do not infer that similar topics across variants are interchangeable. These B23 records support source research only and make no claim about 2026 coverage, task frequency, model answers, or final teaching suitability.

No Stage 0 source-integrity mismatch was found. Three major context/visual flags and one minor unit-precision retest remain open for the A0 gate and A9 review.
