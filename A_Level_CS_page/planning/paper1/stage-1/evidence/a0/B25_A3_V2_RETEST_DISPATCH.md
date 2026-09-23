# P1-S1-A3-B25-RETEST-V2 — Same-version context/scope retest

Date: 2026-09-21. Status: DISPATCHED. Owner: A3 reviewer independent of B25-A2-v2 author. Stop after a frozen PASS_A3_ONLY/CHANGES_REQUIRED handoff. Do not spawn agents.

## Frozen inputs

- Candidate `evidence/a2/B25/versions/B25-A2-v2/`.
- Candidate handoff SHA256 `e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5`.
- Candidate batch manifest SHA256 `063e47ee4726c310d63646a4b777a61fd5054ee4d47c3c00b7e290592609fca8`.
- Candidate snapshot manifest SHA256 `56374136cee31b62382c44f8e26fb31b2e6319bc689373e938b077493161be94` with 442 entries.
- A0 v2 candidate audit `evidence/a0/B25_A2_V2_A0_AUDIT.json` SHA256 `72c73ab452386f56f5a07d8392a641ba7024d455608d10a90a4823ffc6cdca73`; A0 validator `evidence/a0/B25_A2_V2_A0_VALIDATE.json` SHA256 `e2a33361079a98adb183ff4114ada2345e5cdf3dc2e9886eb8cc67811c3a8866`.
- Prior A3-v1 handoff SHA256 `f96bf8d634b5bb5e37496b7f826fa330277f2219169e827bf3e0369fc0e18ea0`; prior A3 findings/output remain read-only.
- Prior A4-v1 handoff SHA256 `2df0def5ebfd7c605c1c1c07750e307db2b4dbb95e5b3985e17d67e30d539179` for cross-role finding context only.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; 2026 syllabus SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Twelve original 2025 QP/MS PDFs, 178 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B25/retest_v2/`. Do not edit v1/v2 candidates, prior evidence, sources, trackers, app, lessons, taxonomy or translations.

## Required retest

- Verify every frozen pin, all 442 snapshot entries, all 12 source hashes/page counts and the exact v1-to-v2 correction evidence.
- Directly retest all ten prior false context pages against original full-size pages. Confirm each is absent from `all_context_pages`, `continuation_pages` and `source_evidence` for the preceding question.
- Confirm `9618_s25_qp_11-q8` page 15 remains legitimate context and `9618_w25_qp_13-q5` pages 7–8 remain while page 9 is excluded.
- Re-screen all 51 context files for regression, including multi-page/shared scenario and blank/imprint/next-question boundaries. Recheck the 27 parent group labels and all six 75-mark totals relevant to the A3 gate.
- Confirm scope flags stay observational and supported by 2026 syllabus authority; do not make teaching coverage, frequency, correctness, translation or taxonomy claims.
- Record exact locator, severity, owner and retest for any disagreement. Do not silently repair candidate data.

## Deliverables and stop

Produce a retest report, machine-readable finding dispositions, frozen input/output/source evidence manifests and `HANDOFF_RETEST_V2.json` with checksum. Recommend PASS_A3_ONLY only if all ten context findings close and no Critical/Major remains. Freeze and stop for A0 audit; A4, A9 and A0 remain mandatory.
