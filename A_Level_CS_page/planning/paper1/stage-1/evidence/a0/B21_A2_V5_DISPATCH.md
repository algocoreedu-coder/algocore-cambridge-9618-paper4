# A0 dispatch — B21 A2 v5 displayed-mark correction

Date: 2026-09-21. Task: `P1-S1-A2-B21-V5`. Owner: A2 curator independent of B21 A3/A4 reviewers. State: DISPATCHED. Batch remains unaccepted.

## Frozen inputs and write boundary

- Start from the immutable complete snapshot `evidence/a2/B21/versions/B21-A2-v4/`. `HANDOFF_CHECK.json` SHA256 `a96fe020eb22b9336d9172c16855e200ae34b98e62f0337bb6c08a3659b2585f`; `BATCH_MANIFEST.json` SHA256 `27a42507ae84127756651c67e7ad31711eb24a1f5a9b6913c18f3fc9cec1810e`; `VISUAL_MANIFEST.json` SHA256 `6277e626add18e0cf082a219372750bce4e97e93ab0d0757effe60324e7799fa`.
- A0 v4 candidate audit `evidence/a0/B21_A2_V4_A0_AUDIT.json` SHA256 `d14f9937055783814c90d20989aafca163bb59a756e1bc8c2444658350c4f5b3`; A0 validator `evidence/a2/B21/A0_VALIDATION_V4.json` SHA256 `464fa3ec739f637737d1ce5aeabbf640e9781c3f910ca41c5461a6b4c9892cb4`.
- Independent A3 v4 report/findings/handoff: report `evidence/a3/B21/retest_v4/CONTEXT_SCOPE_RETEST_V4.md` SHA256 `1d737e1afcf7c35fca45c83dc02dbf1c60e330d40129be72729ee28558505de8`; findings `CONTEXT_SCOPE_FINDINGS_V4.json` SHA256 `23bc0b56cfd7aa46519829005948e0cba8ea6da6ba1bd45ad0483c93afb9685c`; handoff `HANDOFF_RETEST_V4.json` SHA256 `551a2e875239c8ead27988044e43de59ba6029260ca4e8d2d5845a40e14bc11e`; A0 audit `evidence/a0/B21_A3_V4_HANDOFF_AUDIT.json` SHA256 `1f008a0eb88e92173f62b010dee47fa8e6c96d4437c6f6350e45bee114076173`.
- Independent A4 v4 report/findings/handoff: report `evidence/a4/B21/retest_v4/RETEST_V4.md` SHA256 `375711c02d59aad460d04bc910c07173d157eb66f8e90a72331f720a2b97c73b`; findings `RETEST_FINDINGS_V4.json` SHA256 `922031cac6e7c3b6e9567ec9ac02296d02b5dafdbffeedcd3fb7dd04cf670c7e`; handoff `HANDOFF_RETEST_V4.json` SHA256 `0ee6293e60b99ce456b2ea66d68459935bcfa4344b9df63346b47a12283651d9`; A0 audit `evidence/a0/B21_A4_V4_HANDOFF_AUDIT.json` SHA256 `4ebd25ee5326168255443d0ef14372645fbbee7747d93ce774374b7aeb7967eb`.
- Authority: Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; Stage 1 schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Read-only sources include `Past_Papers/2021/Oct_Nov/9618_w21_qp_12.pdf` SHA256 `9fa28bfd27645df25197c518aa07573c14ea301a3fe024c23b03c28dadea7b36` (16 pages), and paired `9618_w21_ms_12.pdf` SHA256 `887e29a6dbf04654924c320b429ddf52c8bd9e8c31b24d8dc1e787c5bf0d2566` (10 pages), plus the remaining ten B21 sources fixed by Stage 0 manifest. Rehash all twelve before editing.
- New output path `evidence/a2/B21/versions/B21-A2-v5/` must not exist before work starts. Preserve v1–v4 byte-for-byte. Write only to this new v5 directory. Do not edit active-root artifacts, A0 trackers, A3/A4/A9 evidence, source PDFs, other batches, app, lessons, or translations.

## Exact source-backed correction

Original `9618_w21_qp_12.pdf`, PDF p.2, displays whole question `Q1 [2]`. In frozen v4, `QUESTION_INDEX.jsonl` row `9618_w21_qp_12-q1` has `marks_displayed_or_null: null`, status `EXTRACTED`, and no child-part row. Both independent A3 and A4 v4 retests report Major CHANGES_REQUIRED; A0 has rendered and inspected the source page. Their handoffs show the indexed W21/12 total is 73 while the original QP cover p.1 states 75.

Set only the Q1 question-root displayed mark to `2`, supported by the adjacent printed `[2]` on QP PDF p.2. Do not invent a child part or assign a mark to a part. Do not use the 75-point total to infer this or any other mark. Independently inspect every page of the paired original W21/12 MS. If it contains an exact whole-question Q1 marking row, add/link only that source-backed row with its precise locator and conditions. If there is no exact row, create no synthetic `marking_item`; record the unresolved QP-to-MS relationship against Q1 with an explicit source-check reason and exact pages reviewed. Keep other existing parent/context records and 16 v4 visual corrections unchanged unless a source-backed validator-required adjustment is necessary; document any necessary change.

Recompute W21/12 indexed total from question/part displayed-mark rows and compare to source cover only as an integrity check. Expected result is 75 after adding the visibly printed two marks; no mark may be allocated based on that total. Preserve the 12 original source hashes/page counts and all prior A3/A4 v4 reviewed regions, dependencies, contexts, question/part hierarchy and unresolved records.

## Deliverables, acceptance and gates

Copy the complete frozen v4 packet to v5, make the minimal source-backed correction, update revision/provenance/QA, all affected page transcript refs if needed, page/index/status records as needed, and rebuild consistent active, batch, handoff and snapshot manifests. Run `scripts/validate_batch.py` on v5 and include machine-readable verification of the correction, the W21/12 75-point sum, all six totals, source identities/page counts and frozen file hashes. The validator and handoff chain must pass; no unverified or invented locator/mark is permitted.

This A2 task ends at a submitted, immutable candidate. Independent A3 and A4 retests of the exact v5, then A9 retest and A0 batch decision remain mandatory. Do not claim any gate PASS or accept B21.

## Stop condition

Freeze v5 hashes and `HANDOFF_CHECK.json`, stop after handoff for A0 verification, and do not edit the candidate afterward. Report only evidence-backed outputs and any unresolved Q1 MS link.
