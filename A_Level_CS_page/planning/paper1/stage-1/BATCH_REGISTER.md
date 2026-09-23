# Batch register — Stage 1

Version 1.2. Owner A0. Date 22/09/2026. State: ALL_FIVE_BATCHES_ACCEPTED; STAGE1_PASS; WAITING_FOR_USER_STAGE_CHECK.

| Batch | Year | Source pairs | A2 state | A3/A4 state | A9 state | Gate |
|---|---:|---:|---|---|---|---|
| B21 | 2021 | s21/w21 × 11/12/13 | ACCEPTED: B21-A2-v6; A0 validator/integrity/source/delta audits PASS | A3-v6 PASS; A4-v6 PASS; both A0 handoff audits PASS | A9-v6 PASS; A0 audit PASS_WITH_THREE_NONBLOCKING_MINORS | ACCEPTED_B21_A2_V6 |
| B22 | 2022 | s22/w22 × 11/12/13 | ACCEPTED: B22-A2-v5; A0 validator/integrity/source/union audit PASS | A3 v5 PASS; A4 v5 PASS; both A0 handoff audits PASS | A9 v5 PASS with zero findings; A0 audit PASS | ACCEPTED_B22_A2_V5 |
| B23 | 2023 | s23/w23 × 11/12/13 | ACCEPTED: B23-A2-v3; A0 schema 1.1/source and cross-reference checks PASS (12 PDFs/157 pages; 47 questions / 205 parts / 178 marking items / 95 regions; six totals=75) | A3 v3 PASS; A4 v3 PASS; A0 audited both handoffs against exact candidate hashes | A9 v3 retest PASS; A0 audit verified all 549 input records, all 216 outputs, 12 source PDFs/157 pages, all F01–F05; 11 unpinned contextual files have recomputed hashes recorded and matched | ACCEPTED_B23_A2_V3 |
| B24 | 2024 | s24/w24 × 11/12/13 | ACCEPTED: B24-A2-v2; A0 integrity/source/exact-delta audit PASS | A3-v1 carried with no-drift proof; A4-v2 PASS and A0 audit PASS | A9-v2 PASS; A0 audit PASS | ACCEPTED_B24_A2_V2 |
| B25 | 2025 | s25/w25 × 11/12/13 | ACCEPTED: B25-A2-v3; A0 integrity/source/exact-delta audit PASS | A3-v2 carried forward with 422-file no-drift proof; A4-v3 PASS and A0 audit PASS | A9-v3 PASS; A0 audit PASS | ACCEPTED_B25_A2_V3 |

Exact paths and hashes are read from the Stage 0 source manifest by each batch worker. Six pairs means twelve PDFs: one QP and one MS for each session/variant. A2 may not proceed B24/B25 until A0 changes the relevant A2 state from QUEUED.

21/09/2026 B21 v3 handoff note: lead independently matched every active artifact hash in `evidence/a2/B21/HANDOFF_CHECK.json`; A0 validator PASS. A3 v3 is active, A4 v3 pending reviewer capacity. The batch remains unaccepted until both specialist gates and independent A9 retest pass.

21/09/2026 update: A3 and A4 B21-v3 specialist retests recommend PASS for their gates; the historic A3-v2 digest gap remains visible. Independent A9 v3 batch review is still required. B22-A2-v3 passed A0 validation, and Lead matched all eight active artifact hashes in its manifest; independent same-version A3/A4/A9 reviews are still required.

21/09/2026 update: B23-A2-v3 passed the A0 validator; Lead matched all 12 candidate artifact hashes, 12 source hashes and 157 actual source PDF pages. A3 v3 retest is now PASS for A3 only; A0 verified its frozen inputs/outputs/renders in `evidence/a0/B23_A3_HANDOFF_AUDIT_V3.json`. A4 same-version retest is still pending; the batch remains gated until A9 retest.

21/09/2026 B22-v3 interim update: A3 and A4 both submitted CHANGES_REQUIRED (seven displayed marks and 12 child-page locators); A0 verified the A3 handoff/renders and all 87 A4 declared hashes. Lead source checks confirm four candidate totals differ from 75 printed marks (S22/11=74, S22/12=71, W22/12=77, W22/13=72), seven wrong displayed mark values, and 12 child locators preceding their source prompts. Evidence: `evidence/a0/B22_A3_HANDOFF_AUDIT_V3.json`, `B22_A4_HANDOFF_AUDIT_V3.json`, `B22_MARK_SOURCE_SPOTCHECK_V3.json`, and `B22_LOCATOR_SOURCE_SPOTCHECK_V3.json`. Keep v3 frozen; correct to v4, then A0/A3/A4 and A9 retest.

21/09/2026 B21 A9 v3 update: independent batch review is CHANGES_REQUIRED on A9-B21-VIS-01; 16 source pages with required visual structure lack regions, including 12 MS dependency pages and four QP visual pages. A0 independently matched 16/16 A2 hashes and all 30 A9 render/contact-sheet hashes, and the independent structure validator passes. A2-B21-v4 has been dispatched; B21 remains gated through A0/A3/A4/A9 retest.

21/09/2026 B21-A2-v4: independent A0 audit verified 305/305 outputs, 15/15 pinned inputs, 12/12 source hashes/page counts and all 16 new region/render targets; A0 validator PASS. All 13 listed MS item IDs and four QP target IDs are present. The 12-page/13-ID clarification is hash-pinned in evidence/a0/B21_A2_V4_DISPATCH_ERRATA.md. A3 retest dispatched; A4 pending capacity; A9 required.

21/09/2026 update: B21 A3-v4 CHANGES_REQUIRED for the source-visible W21/12 Q1 [2] omission; A4 v4 review is now dispatched. B22 A2-v4 handoff integrity and A0 validator checks PASS; A3 v4 review is dispatched. B23 A3/A4 v3 gates PASS; A9 v3 retest is active. All batches remain unaccepted pending exact gates.

21/09/2026 B22 v4 review queue: A3 same-version retest dispatched; A4 work order frozen and waiting for independent reviewer capacity. Candidate A0 audit and six totals PASS; no batch acceptance.

21/09/2026 gate update: B23 is ACCEPTED by A0 against exact B23-A2-v3 after A3/A4/A9 PASS and independent A0 handoff/cross-reference audits. B21 A2 v5 correction is required for the source-visible W21/12 Q1 [2] mark; B22 v4 A3/A4 same-version reviews are in progress. B24/B25 remain gated by the playbook sequence.

21/09/2026 continuation: B21-A2-v5 is submitted and passes independent A0 validation/hash/source audit; exact Q1 `[2]` and whole-question MS Q1 mapping are source-backed, all six totals recompute to 75, and A3 v5 retest is dispatched. B22 A3-v4 recommends PASS for A3 with two deferred Minor metadata findings; A0 matched its 36 inputs, 413 candidate files, 117 outputs and 12 PDFs/166 pages. B22 A4-v4 handoff remains the next gate.

21/09/2026 B22 gate update: A4-v4 matches A3-v4 and recommends PASS_WITH_TWO_MINOR_DEFERRED; A0 audit verifies 28 inputs, 81 outputs, 413 candidate files, 12 PDFs/166 pages and 117 A3 outputs. A2-v5 metadata correction is dispatched for the Q6(b)(iii) token and the 11/18/22 page-count semantics. Core corpus indexes remain frozen; A0/A3/A4/A9 must review v5.

21/09/2026 current gate: B22 A3/A4-v5 specialist reviews and their A0 audits PASS; A9-v5 is active. B21 A9-v5 review evidence passes A0 integrity audit but the candidate fails the batch gate on Major `A9-B21-CTX-01`: `9618_s21_qp_12-q8` falsely includes pp.15–16, while `9618_w21_qp_11-q8` and `9618_w21_qp_13-q8` each falsely include p16. B21-A2-v6 is active under an exact correction work order; B24 remains closed until a later A9 PASS.

21/09/2026 B21-v6 candidate gate: A0 verified 12 inputs, 312 handoff outputs, 313 snapshot entries, 310 preserved v5 entries, 12 PDFs/154 pages and exact file delta 10 changed/3 added/0 deleted. The four false page references are removed from exactly three Q8 contexts, other corpus indexes remain byte-identical, and six mark sums recompute to 75. A3-v6 and A4-v6 are active; B21 and B24 remain gated through A9-v6.

21/09/2026 B22 decision: A9-v5 PASS with 16/16 checks and zero findings; A0 rehashed 10 review inputs, all 420 candidate snapshot entries, all 208 listed reviewer outputs and 12 PDFs/166 pages. A0 accepted B22-A2-v5 in `evidence/a0/B22_BATCH_DECISION_V5.json`. The B25 dependency is satisfied, so B25-A2-v1 is active against 12 hash-pinned 2025 PDFs/178 pages.

21/09/2026 B21-v6 specialist gate: A3-v6 and A4-v6 PASS; A0 rehashed their 63 and 56 outputs, all 313 candidate entries, frozen inputs and 12 PDFs/154 pages. Both confirm A9-B21-CTX-01 is corrected and prior mark/visual gates remain intact. A9-v6 is active under work order SHA256 `e62b67712f07be108e926637155508d047c5070464095dedebb8be480cdbe253`; B21 remains unaccepted until its frozen handoff passes A0 audit and A0 records the batch decision.

21/09/2026 B21 decision and R4 release: A9-v6 PASS with no open Critical/Major; A0 verified 29 input records, 313 candidate entries, 52 A9 outputs and 12 PDFs/154 pages. A0 accepted B21-A2-v6 in `evidence/a0/B21_BATCH_DECISION_V6.json`; three evidence-only Minors have recorded closure. B24-A2-v1 is active against 12 hash-pinned 2024 PDFs/156 pages. B25-A2-v1 is frozen and passes A0 audit; A3/A4 v1 reviews are active.

21/09/2026 B24 candidate gate: B24-A2-v1 is frozen; A0 rehashed 392/392 snapshot entries, six input pins, 13 core outputs and 12 PDFs/156 pages. Structure counts are 49 roots/194 parts/170 marking items/130 regions, zero dangling refs, and six totals of 75. A3/A4 work orders are READY_QUEUED until the active B25 specialist reviews free reviewer slots.

21/09/2026 B24 review dispatch: A3-v1 is active under frozen work-order SHA256 `e4a8ffb0373d9e6c93c76d0e248154ab7d9c901c6b905a6f7b5c09016dca501b`; A4 remains queued until a reviewer slot opens.

21/09/2026 B24/B25 gate update: B24 A4-v1 is now active under work-order SHA256 `c7ad46a03288a2bdf63a4ad29761761f577417ee305aaf2b9c849eb172464144` alongside A3-v1. B25 A3/A4-v1 independently return CHANGES_REQUIRED; A0 rehashed both review packages and accepts their evidence. B25-A2-v2 is dispatched under SHA256 `779876003ef45b06c2081f1cd14cdccb92c8797366e7ac6b33a7c1562a63cfab` for ten context-boundary removals and one MS-row boundary correction, followed by same-version A3/A4/A9 gates.

21/09/2026 B24 A3 gate: `PASS_A3_ONLY`; A0 verified 11 pins, 392 snapshot entries, six review outputs and all 12 original PDFs/156 pages. Handoff SHA256 `8da881280e8e09f55bdc1d9e19e827ecbce56d5c4df3df418050ab42d60a22cf`. A4 and A9 remain mandatory.

21/09/2026 B25-v2 candidate gate: A0 verified 16 pins, 16 handoff outputs, 442 snapshot entries, the intact 438-entry v1 snapshot, 12 sources/178 pages, validator PASS and an exact semantic correction set. B25-A2-v2 handoff SHA256 `e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5`; A3-v2 is active and A4-v2 is queued.

21/09/2026 B24 specialist gate: A4-v1 PASS and A0 audit PASS (8 pins, 392 candidate entries, 209 outputs, 210 checksum rows, 12 PDFs/156 pages). A3/A4 align with zero finding, so A9-v1 is active. B25 A4-v2 is now active alongside A3-v2.

21/09/2026 B24/B25 current gate: B24 A9-v1 found Major `A9-B24-MS-01` in 19/170 marking items; A0 audited the handoff and dispatched B24-A2-v2 for an exact trailing-header-only correction. B25 A3-v2 and A4-v2 independently PASS; A0 rehashed their inputs, 442-entry candidate, outputs and 12 PDFs/178 pages. B25 A9-v2 is active; neither batch is accepted.

21/09/2026 B24-v2 candidate gate: A0 verified 17 pins, 18 handoff outputs, 400 snapshot entries, 12 PDFs/156 pages and exact 19-row semantic delta. Only marking text changed, 151 other marking rows are byte-identical, no trailing generic header remains and schema/totals pass. A4-v2 is active; A9-v2 and A0 decision remain mandatory.

21/09/2026 B25 A9-v2 gate: `CHANGES_REQUIRED` on Major `A9-B25-MS-01`. A0 audit confirms exactly eight terminal generic headers in the candidate and verifies the entire frozen A9 packet. B25-A2-v3 is active for only those eight marking-text fields; then A0, A4-v3 all-183 and A9-v3 are mandatory.

21/09/2026 corrected-candidate gates: B24 A4-v2 PASS and A0 audit PASS for all 19 boundaries/all 170 links; A9-v2 is active. B25-A2-v3 A0 audit verifies the exact eight-row correction, 175 byte-identical marking lines, no context/scope/hierarchy/locator/visual drift and zero residual headers; A4-v3 is active. Neither batch is accepted.

21/09/2026 B25 specialist gate: A4-v3 PASS and A0 audit PASS for all eight boundaries/all 183 links, 27 parent groups and six totals. A9-v3 is active; A0 decision remains required.

21/09/2026 B24 decision: A9-v2 PASS with zero open findings; A0 rehashed 16 inputs, 400 candidate entries, seven reviewer outputs and 12 PDFs/156 pages. A0 accepted B24-A2-v2 in `evidence/a0/B24_BATCH_DECISION_V2.json`, SHA256 `76797cebe4aae2932751a60a7886d4a63ded5d943d469d5fd66961b475bbe101`.

21/09/2026 B25 decision: A9-v3 PASS with zero open findings; A0 rehashed the complete 12-pin evidence chain with zero mismatch, including 450 candidate entries, A3-v2 carry-forward proof, A4-v3 all-183 linkage retest and 12 PDFs/178 pages. A0 accepted B25-A2-v3 in `evidence/a0/B25_BATCH_DECISION_V3.json`, SHA256 `0d4a0b6725df45638f2ba5efca0f7a548ec20ff1ae77e9b5657788b34fda1ca6`. All five batch gates are now accepted; aggregate construction and final independent A9 review remain.

22/09/2026 final gate: aggregate v2 passed A9 final-v2 with 21/21 independent checks, zero drift and zero finding. A0 rehash audit and validator rerun PASS. Stage 1 is PASS and held at `WAITING_FOR_USER_STAGE_CHECK`; Stage 2 is not started.
