# P1-S1-A2-B24-V1 — Extract and index 2024 Paper 1 batch

Status: READY_FOR_DISPATCH after B21-A2-v6 batch acceptance. Owner: A2-B24. Reviewer chain: independent A3-B24 and A4-B24, then A9-B24, then A0. Stop after freezing the A2 handoff; do not self-approve and do not spawn another agent.

## Frozen authority and inputs

- Stage 0 source manifest `stage-0/evidence/a2/SOURCE_MANIFEST.json`, SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.
- `CORPUS_SCHEMA.md` SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`.
- `EXTRACTION_POLICY.md` SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- B21 release decision `evidence/a0/B21_BATCH_DECISION_V6.json`, SHA256 `15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645`.
- Original PDFs are read-only:

| Source ID | Path | SHA256 | Pages |
|---|---|---|---:|
| 9618_s24_ms_11 | `Past_Papers/2024/May_June/9618_s24_ms_11.pdf` | `b53a8ca0d83d790364125ad0b74cef676204133d540c9c89f38404dd4d1fca69` | 8 |
| 9618_s24_ms_12 | `Past_Papers/2024/May_June/9618_s24_ms_12.pdf` | `27327b88c438432d5af97553d3ac09dcfe42f0a35c8d2556fdc9bd90959c7ea0` | 11 |
| 9618_s24_ms_13 | `Past_Papers/2024/May_June/9618_s24_ms_13.pdf` | `8d9b06f8ba8f9fba12b8cd725e39c5bda93fe14c1ba6c89912de801671762179` | 9 |
| 9618_s24_qp_11 | `Past_Papers/2024/May_June/9618_s24_qp_11.pdf` | `2e39e6c2ee1e65d621df71b4b7fbe41a16f1e4ed8e252fb1612a6d14b13de063` | 16 |
| 9618_s24_qp_12 | `Past_Papers/2024/May_June/9618_s24_qp_12.pdf` | `871b047e73c2ce0dd3c2dd1c47b7d4e176c886e61af08ffe12c6b9734285d3de` | 16 |
| 9618_s24_qp_13 | `Past_Papers/2024/May_June/9618_s24_qp_13.pdf` | `79f3dbe24332c41b155e25ba48d3a8cb75399e98d5bb9cdf9a1e71de0f4645bd` | 16 |
| 9618_w24_ms_11 | `Past_Papers/2024/Oct_Nov/9618_w24_ms_11.pdf` | `e9674e802b5b850509834b1ab1b84008740729d668ae844e9b0142607dbdf1a2` | 9 |
| 9618_w24_ms_12 | `Past_Papers/2024/Oct_Nov/9618_w24_ms_12.pdf` | `42b8ef4e24bdd263e1a81b9ae34d332e77e34f7c7853ab411977410f1b43192e` | 10 |
| 9618_w24_ms_13 | `Past_Papers/2024/Oct_Nov/9618_w24_ms_13.pdf` | `d3ee5286285e4611838cb9922a4fd9706a1a4e733ece048f24f89ee5cb48ec37` | 9 |
| 9618_w24_qp_11 | `Past_Papers/2024/Oct_Nov/9618_w24_qp_11.pdf` | `94d1aed5bc14f0a3fd60da0e932cf5b8b40bd8342550ff0254c19afe89001ef7` | 16 |
| 9618_w24_qp_12 | `Past_Papers/2024/Oct_Nov/9618_w24_qp_12.pdf` | `3d754f83188ee139c7ffd082496a3d0591e73714ec8787dc2b961f5aa2c744c6` | 16 |
| 9618_w24_qp_13 | `Past_Papers/2024/Oct_Nov/9618_w24_qp_13.pdf` | `1633471ff692292618910635b391aef69624188ec30b72425738f8a46354cc04` | 20 |

Total expected source pages: 156.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B24/versions/B24-A2-v1/`. Do not edit source PDFs, other batches, trackers, app code, lessons, taxonomy, or translations.

## Required outputs

- `BATCH_MANIFEST.json`, `PAGE_INDEX.jsonl`, `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `VISUAL_MANIFEST.json`, `EXTRACTION_QA.md`, `UNRESOLVED.md`, `HANDOFF_CHECK.json`, and a complete `SNAPSHOT_MANIFEST.json`.
- Source-versioned page transcripts and per-question context records.
- Full-page renders for every diagram, table, formula, circuit, layout-dependent prompt, MS table/condition, ambiguous hierarchy/label, and all correction-risk pages; all-page contact sheets for the 12 PDFs.
- Machine-readable mark-total, cross-reference, and self-check evidence.

## Acceptance criteria

- Exactly six QP/MS pairs and all 12 source hashes/page counts match the table and Stage 0.
- Every QP page has extraction and visual status; every question/part has a QP locator, parent/context and displayed mark when printed.
- Every usable marking item has an exact MS locator/target; ambiguous parent rows remain explicit `UNRESOLVED`. Whole-question marks/MS rows use the schema 1.1 question target and never a fabricated part.
- Command words and labels remain verbatim source observations. Do not create taxonomy, frequency, correctness, lesson, translation, or syllabus-applicability claims.
- Context must stop where the question ends: blank/imprint pages are not continuation evidence. Preserve legitimate multi-page continuations and shared scenario context.
- All diagrams/tables/formulas/layout risks have visual regions, direct source-page evidence and valid `relates_to_ids`; no dangling relation/dependency IDs.
- Recompute each QP displayed-mark total against its printed cover total without inferring a missing mark. Any mismatch is `UNRESOLVED`/issue, not silently repaired.
- Validator passes; snapshot/handoff enumerate every active artifact with SHA256 and byte count; no Critical/Major is hidden.

## Stop point

Freeze B24-A2-v1 and report exact handoff/manifest/snapshot hashes, counts, source-page total, totals and unresolved/visual counts. A0 validation and independent A3/A4/A9 reviews remain mandatory.
