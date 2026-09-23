# P1-S1-A2-B25-V1 — Extract and index 2025 Paper 1 batch

Status: READY_FOR_DISPATCH after B22-A2-v5 batch acceptance. Owner: A2-B25. Reviewer chain: independent A3-B25 and A4-B25, then A9-B25, then A0. Stop after freezing the A2 handoff; do not self-approve.

## Frozen authority and inputs

- Stage 0 source manifest `stage-0/evidence/a2/SOURCE_MANIFEST.json`, SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.
- `CORPUS_SCHEMA.md` SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`.
- `EXTRACTION_POLICY.md` SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- B22 release decision `evidence/a0/B22_BATCH_DECISION_V5.json`, SHA256 `fc5f990ad9e22d42b7409aad504ea0ce2255f0bf9e0c7905a14fe2506a1f887a`.
- Original PDFs are read-only:

| Source ID | Path | SHA256 | Pages |
|---|---|---|---:|
| 9618_s25_ms_11 | `Past_Papers/2025/May_June/9618_s25_ms_11.pdf` | `8bf543ddd26e74224f40fd909152e300b9b711eb3644d7e8d07c1d5c3f07521b` | 12 |
| 9618_s25_ms_12 | `Past_Papers/2025/May_June/9618_s25_ms_12.pdf` | `0b0c41c4a7930853aaaaa00729d4ffd3a3e971948800220344c6ae6a31ec957a` | 12 |
| 9618_s25_ms_13 | `Past_Papers/2025/May_June/9618_s25_ms_13.pdf` | `a334bec016c753451ae53c56fdfc0b0758b8f2b5a7a06a86307ac100bb7ebd8e` | 12 |
| 9618_s25_qp_11 | `Past_Papers/2025/May_June/9618_s25_qp_11.pdf` | `bdf74d4f15c620bde7e6fe65f17828bc85c89490ebb9a1a337e2cd0596f4b39a` | 20 |
| 9618_s25_qp_12 | `Past_Papers/2025/May_June/9618_s25_qp_12.pdf` | `607722293452744ee7107b7365cac73664d51e0eb0f7487587d038e22467826e` | 16 |
| 9618_s25_qp_13 | `Past_Papers/2025/May_June/9618_s25_qp_13.pdf` | `b341d6829ba4baf47dbd8d272cb7fd49b448d04a2a16a028e4fb3178c3c64554` | 20 |
| 9618_w25_ms_11 | `Past_Papers/2025/Oct_Nov/9618_w25_ms_11.pdf` | `64b2928b1348598cd0be2cda8014405264f0a4303b73665633e4e297217056f4` | 15 |
| 9618_w25_ms_12 | `Past_Papers/2025/Oct_Nov/9618_w25_ms_12.pdf` | `4fd455f74ae4abf71a8796095c912a06c77239d6d5a6679ce05ceff1032e7dd8` | 11 |
| 9618_w25_ms_13 | `Past_Papers/2025/Oct_Nov/9618_w25_ms_13.pdf` | `d4bf99da2ca289430a18709d483892df85646dc5a90d5fb6697eb6d13c10481b` | 12 |
| 9618_w25_qp_11 | `Past_Papers/2025/Oct_Nov/9618_w25_qp_11.pdf` | `2fe1691a0eff789ac686121aac0ae4e7cb3852f9bd321a6542dc6b82fbedf616` | 16 |
| 9618_w25_qp_12 | `Past_Papers/2025/Oct_Nov/9618_w25_qp_12.pdf` | `ea65e75a4182f991cb2117827ee5c6734365b2c5e78686c6d6ef1e00d48fe65b` | 16 |
| 9618_w25_qp_13 | `Past_Papers/2025/Oct_Nov/9618_w25_qp_13.pdf` | `9b5d7e33de24afb406ddc00c253ebf37b4240e6b21f3c1a7f6f1eb82aba78cc6` | 16 |

Total expected source pages: 178.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B25/versions/B25-A2-v1/`. Do not edit source PDFs, other batches, trackers, app code, lessons, taxonomy, or translations.

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

Freeze B25-A2-v1 and report exact handoff/manifest/snapshot hashes, counts, source-page total, totals and unresolved/visual counts. A0 validation and independent A3/A4/A9 reviews remain mandatory.
