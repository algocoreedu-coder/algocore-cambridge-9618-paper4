# P1-S1-A4-B25-RETEST-V2 — Same-version linkage/MS-row retest

Date: 2026-09-21. Status: DISPATCHED. Owner: A4 reviewer independent of B25-A2-v2 author. Stop after a frozen PASS_A4_ONLY/CHANGES_REQUIRED handoff. Do not spawn agents.

## Frozen inputs

- Candidate `evidence/a2/B25/versions/B25-A2-v2/`.
- Candidate handoff SHA256 `e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5`.
- Candidate batch manifest SHA256 `063e47ee4726c310d63646a4b777a61fd5054ee4d47c3c00b7e290592609fca8`.
- Candidate snapshot manifest SHA256 `56374136cee31b62382c44f8e26fb31b2e6319bc689373e938b077493161be94` with 442 entries.
- A0 v2 candidate audit `evidence/a0/B25_A2_V2_A0_AUDIT.json` SHA256 `72c73ab452386f56f5a07d8392a641ba7024d455608d10a90a4823ffc6cdca73`; A0 validator `evidence/a0/B25_A2_V2_A0_VALIDATE.json` SHA256 `e2a33361079a98adb183ff4114ada2345e5cdf3dc2e9886eb8cc67811c3a8866`.
- Prior A4-v1 handoff SHA256 `2df0def5ebfd7c605c1c1c07750e307db2b4dbb95e5b3985e17d67e30d539179`; prior A4 finding package remains read-only.
- Prior A3-v1 handoff SHA256 `f96bf8d634b5bb5e37496b7f826fa330277f2219169e827bf3e0369fc0e18ea0` for cross-role context evidence only.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Twelve original 2025 QP/MS PDFs, 178 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B25/retest_v2/`. Do not edit v1/v2 candidates, prior evidence, sources, trackers, app, lessons, taxonomy or translations.

## Required retest

- Verify all frozen pins, 442 snapshot entries and 12 source hashes/page counts.
- Retest A4-B25-CTX-01/02 against original QP pages and the corrected context files; confirm the ten false pages are absent and the known legitimate continuations remain.
- Retest `9618_w25_qp_13-q7-pe-mi-1` directly against `9618_w25_ms_13.pdf` page 12 row 7(e): the full answer and mark remain, while the following generic `Question / Answer / Marks` header is excluded. Confirm locator, transcript and visual dependency are unchanged.
- Confirm `9618_w25_qp_13-q8-pb-mi-1` still preserves the wording printed in the original marking scheme; do not create a candidate discrepancy from the source-published grammar.
- Recheck all 183 marking targets, 144 visual regions, 27 parent groups and six 75-mark totals for regression, using direct original-source evidence for every changed/risk page.
- Record exact locator, severity, owner and retest for any disagreement. Do not silently repair candidate data.

## Deliverables and stop

Produce a retest report, machine-readable finding dispositions, pinned input/output/source evidence manifests and `HANDOFF_RETEST_V2.json` with checksum. Recommend PASS_A4_ONLY only if all A4 findings close and no Critical/Major remains. Freeze and stop for A0 audit; A3, A9 and A0 remain mandatory.
