# A0 dispatch — B22 A2 v4 marks and QP locators

Date: 2026-09-21. Task: `P1-S1-A2-B22-V4`. Owner: A2 curator from another batch, queued until the current B23 A3 retest handoff is frozen. State: READY_QUEUED.

## Frozen inputs and write boundary

- Start from the immutable `evidence/a2/B22/versions/B22-A2-v3/` snapshot. A0 recomputed the active-root and v3-snapshot hashes and all nine checked files match. The frozen A2-v3 `HANDOFF_CHECK.json` SHA256 is `ec0aeea26a2ca9dbd575d9d2518eecf6acd54bf38281e05306bbcf4e6d6aa346`; `BATCH_MANIFEST.json` SHA256 is `65d10ac1ee2628360242b0484de7d3665e8685e8110e83c24a6cca48bb802893`.
- Independent A3 retest: `CONTEXT_SCOPE_RETEST_V3.md` SHA256 `3d2627956e5294bc32039656e32a7324dc12dabe1042ba9f7d0e4dfc73438cc5`; findings JSON `878e1a06fb5f270a935ecffc1c6dd2687a1861cae7b06f0df9a5187624e2dc46`; handoff `c59dbd4e3cb51110cb0edc2a1310241f7277a529cd6dec86236b7f782cdde838`.
- Independent A4 retest: `RETEST_V3.md` SHA256 `edb0ce494a7ebdea009f7ed99d387ce7c7aff3a39debe17fe6688d473257672f`; findings JSON `79f72c50bab8a706fda93efb1a477d071d5526b86f3a540c36391b228da4120f`; handoff `095c03c3b2a52d4d534ace5968453d9613becbce841469eec9c1c2167013cdda`.
- A0 source checks: mark spot-check SHA256 `04ea6cc6f5840ba9ba87fcac83b187e6ca33cf59b4334e01da4a92d904d92119`; locator spot-check SHA256 `410d7d691a3b4d6e75eda9669e9f4d8b4cc47207468f436b6404789c5c3dabba`.
- Original source PDFs: the 12 Stage 0 B22 source files, locked by Stage 0 `SOURCE_MANIFEST.json` SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`. Read-only. Schema v1.1 and `EXTRACTION_POLICY.md` v1.1 apply.
- Write allowlist: only new `evidence/a2/B22/versions/B22-A2-v4/`. Preserve v1/v2/v3 byte-for-byte. Do not edit active-root artifacts, A0 trackers, reviewer files, sources, other batches, app, lessons, or translations. If v4 path already exists, stop and tell A0.

## Required correction

Correct the seven displayed-mark values and twelve nested-child QP PDF-page locators listed below, using original source pages and recorded source evidence. These two classes were independently found by A3 and A4 and spot-checked by A0. Do not infer values from paper totals. Preserve all other v3 corrections, including question-level targets, parent-child hierarchy, unresolved accounting, MS links, context, visuals, and manifest/handoff consistency.

### Seven displayed marks

| Source / PDF page | Printed label | Record ID | v3 → source value |
|---|---:|---|---:|
| `9618_s22_qp_11` p8 | Q4(c)(i) | `9618_s22_qp_11-q4-pci` | 4 → 5 |
| `9618_s22_qp_12` p4 | Q2(c) | `9618_s22_qp_12-q2-pc` | 2 → 1 |
| `9618_s22_qp_12` p7 | Q4(b) | `9618_s22_qp_12-q4-pb` | 2 → 6 |
| `9618_s22_qp_12` p7 | Q4(c) | `9618_s22_qp_12-q4-pc` | 1 → 2 |
| `9618_w22_qp_12` p16 | Q8(c)(ii) | `9618_w22_qp_12-q8-pcii` | 4 → 2 |
| `9618_w22_qp_13` p11 | Q6(a)(i) | `9618_w22_qp_13-q6-pai` | 2 → 4 |
| `9618_w22_qp_13` p12 | Q6(a)(ii) | `9618_w22_qp_13-q6-paii` | 1 → 2 |

Recalculate all six paper totals from displayed question/part rows and confirm each equals the printed cover total 75. Expected check after these seven corrections: S22/11=75, S22/12=75, S22/13=75, W22/11=75, W22/12=75, W22/13=75. This is an integrity check; do not use totals to allocate an individual mark.

### Twelve nested-child QP locators

| Source | Record ID(s) | v3 page → source prompt page |
|---|---|---:|
| `9618_s22_qp_11` | `9618_s22_qp_11-q2-pci`, `...-q2-pcii` | 3 → 5 |
| `9618_s22_qp_11` | `9618_s22_qp_11-q6-pci`, `...-q6-pcii` | 12 → 14 |
| `9618_w22_qp_11` | `9618_w22_qp_11-q1-pdii` | 2 → 3 |
| `9618_w22_qp_11` | `9618_w22_qp_11-q6-pbi` | 13 → 16 |
| `9618_w22_qp_11` | `9618_w22_qp_11-q6-pbii` | 14 → 16 |
| `9618_w22_qp_12` | `9618_w22_qp_12-q8-pci`, `...-q8-pcii` | 15 → 16 |
| `9618_w22_qp_13` | `9618_w22_qp_13-q6-pbi` | 11 → 12 |
| `9618_w22_qp_13` | `9618_w22_qp_13-q6-pbii`, `...-q6-pbiii` | 12 → 13 |

The exact child labels, source PDF hashes, and A0 page evidence are in `B22_LOCATOR_SOURCE_SPOTCHECK_V3.json` and both retest findings files. Verify each corrected locator against its cited original page; keep PDF page numbering one-based and preserve any distinct printed-page locator separately.

## Deliverables, acceptance and gates

Copy the complete frozen v3 packet to the new v4 folder before editing. Deliver the full v4 packet required by schema v1.1, including all indexes, manifests, QA/unresolved/revision notes, source render evidence, and `HANDOFF_CHECK.json`. Record the disposition for each of the 19 source-backed rows above. Freeze and recompute every declared artifact/source/render hash. Run `scripts/validate_batch.py` against the v4 manifest. Include a separate mark-total check showing all six printed and indexed totals. Confirm all other v3 gate criteria still pass.

Acceptance for this correction: all seven displayed marks match their cited originals; all twelve child PDF locators point to the page containing the printed child prompt; all six indexed totals equal 75; all source hashes/page counts remain identical to Stage 0; no hierarchy/link/visual/schema regressions; validator PASS; v4 handoff hashes reproduce. A0 will independently validate the handoff and run the structural validator.

After A0 validation, independent A3 and A4 reviewers retest the exact v4 against sources. A9 reviews only after both same-version specialist gates pass. A0 alone closes the batch. Stop at the v4 handoff; do not claim B22 acceptance.
