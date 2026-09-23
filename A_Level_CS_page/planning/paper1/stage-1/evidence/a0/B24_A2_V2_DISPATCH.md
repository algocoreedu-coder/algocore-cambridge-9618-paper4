# A0 dispatch — B24 A2 v2 marking-row boundary correction

Date: 2026-09-21. Task: `P1-S1-A2-B24-V2`. Owner: A2 curator independent of B24 A3/A4/A9 reviewers. State: DISPATCHED. Batch remains unaccepted.

## Frozen inputs and write boundary

- Start from immutable `evidence/a2/B24/versions/B24-A2-v1/`: handoff SHA256 `d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd`; batch manifest SHA256 `1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486`; snapshot SHA256 `dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97` with 392 entries.
- Candidate A0 audit SHA256 `cc9563fd98aae568f6a6ee29ed9e8e83738e2ebde3089eb8440ee9c528d70ca1`.
- A3-v1 handoff SHA256 `8da881280e8e09f55bdc1d9e19e827ecbce56d5c4df3df418050ab42d60a22cf`; A0 audit SHA256 `62d3784778c719cb8747146a0627b8726d36b23e0f45e0dcdda7ba4cba68bb83`.
- A4-v1 handoff SHA256 `e145320c7805acd8e70a1d507a1f902e59e7d517e967cfb9314e47d909bcff3e`; output manifest SHA256 `092dea2479ced3be66f9e5bb71c120bfdf525c30b0c70fb7cf3938490c08dc4e`; A0 audit SHA256 `3a085ed2cc214f002f771af1a238f36facd75c0a7e7a814d0c70f5666c881867`.
- A9-v1 handoff SHA256 `ccb42b04231de24e29292fdd8404b72e6b9fb6f514efafccf685c7220535bf59`; findings `evidence/a9/B24/review_v1/FINDINGS_V1.json` SHA256 `f0cfa70f3d1981777494a13e99ef18232ae29f8b859fe2bb407a1241af403d48`; A0 audit SHA256 `85caefde79759a8f6466829dc63ca93f5dea5c0104d29a93d7f5b99817fd7684`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Rehash all 12 original 2024 QP/MS PDFs and confirm 156 pages before editing.
- New output `evidence/a2/B24/versions/B24-A2-v2/` must not exist at start. Copy the complete v1 packet and write only within v2. Preserve v1 byte-for-byte. Do not edit sources, A0/A3/A4/A9 evidence, trackers, other batches, app, lessons, taxonomy or translations. Do not spawn agents.

## Exact source-backed correction

Finding `A9-B24-MS-01` identifies exactly 19 `MARKING_INDEX.jsonl` records. In each record, remove only the trailing generic table header `Question / Answer / Marks` that belongs to the following table. Preserve the complete cited answer/condition, final mark token, record ID, question/part target, `ms_locator`, `table_row_ref_or_null`, transcript ref, visual dependency refs and status.

| Record ID | Original MS page |
|---|---|
| `9618_s24_qp_12-q2-pd-piii-mi-1` | `9618_s24_ms_12` p5 |
| `9618_s24_qp_13-q1-pd-pii-mi-1` | `9618_s24_ms_13` p3 |
| `9618_s24_qp_13-q2-pc-mi-1` | `9618_s24_ms_13` p4 |
| `9618_s24_qp_13-q4-pd-mi-1` | `9618_s24_ms_13` p6 |
| `9618_s24_qp_13-q5-pd-mi-1` | `9618_s24_ms_13` p7 |
| `9618_w24_qp_11-q2-pc-mi-1` | `9618_w24_ms_11` p5 |
| `9618_w24_qp_11-q4-pd-pii-mi-1` | `9618_w24_ms_11` p8 |
| `9618_w24_qp_11-q7-pb-mi-1` | `9618_w24_ms_11` p9 |
| `9618_w24_qp_12-q1-pb-mi-1` | `9618_w24_ms_12` p3 |
| `9618_w24_qp_12-q2-pc-mi-1` | `9618_w24_ms_12` p4 |
| `9618_w24_qp_12-q3-pc-mi-1` | `9618_w24_ms_12` p5 |
| `9618_w24_qp_13-q1-pc-mi-1` | `9618_w24_ms_13` p3 |
| `9618_w24_qp_13-q4-pe-mi-1` | `9618_w24_ms_13` p5 |
| `9618_w24_qp_13-q5-pb-mi-1` | `9618_w24_ms_13` p6 |
| `9618_w24_qp_13-q6-pc-pii-mi-1` | `9618_w24_ms_13` p7 |
| `9618_w24_qp_13-q7-pb-mi-1` | `9618_w24_ms_13` p7 |
| `9618_w24_qp_13-q8-pc-mi-1` | `9618_w24_ms_13` p8 |
| `9618_w24_qp_11-q6-mi-1` | `9618_w24_ms_11` p9 |
| `9618_w24_qp_13-q3-mi-1` | `9618_w24_ms_13` p4 |

Do not alter any other marking item or corpus record except mechanical version/provenance/manifest/checksum changes. Keep the A3/A4-passed context, hierarchy, locators, visual relations and the S24/13 Q3(b) p6→p7 nuance unchanged. Record every physical changed/added/deleted path and every semantic record change in machine-readable delta evidence.

## Deliverables, validation and stop

Rebuild consistent revision/provenance/QA, batch, visual, handoff and snapshot manifests. Run `scripts/validate_batch.py`. Add machine-readable correction checks proving exactly the 19 target marking rows changed, only `mark_or_condition_or_null` changed in those rows, every generic following-table header is absent, all source answer/condition/mark tokens and locators are preserved, the other 151 marking items are byte/semantic identical, all 49 contexts and 130 visual regions still resolve, 29 parent groups remain structural, and all six totals remain 75.

Freeze v2 with a new `HANDOFF_CHECK.json` and snapshot manifest, then stop for A0 audit. Independent A4-v2 retest of all 19 plus all 170 links, A9-v2 retest and A0 decision remain mandatory. A3 retest is required only if correction evidence shows any context/scope/hierarchy/locator/visual change beyond mechanical metadata. Do not claim batch acceptance.
