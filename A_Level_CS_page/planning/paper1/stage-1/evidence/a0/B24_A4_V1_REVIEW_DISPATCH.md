# P1-S1-A4-B24-REVIEW-V1 — Independent QP/MS linkage review

Status: DISPATCHED. Owner: A4 independent of B24-A2-v1 author. Stop after a frozen PASS_A4_ONLY/CHANGES_REQUIRED handoff; A3, A9 and A0 remain mandatory. Do not spawn another agent.

## Frozen inputs

- Candidate `evidence/a2/B24/versions/B24-A2-v1/`.
- Candidate handoff SHA256 `d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd`.
- Candidate batch manifest SHA256 `1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486`.
- Candidate snapshot manifest SHA256 `dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97` (392 entries).
- A0 candidate audit SHA256 `cc9563fd98aae568f6a6ee29ed9e8e83738e2ebde3089eb8440ee9c528d70ca1`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.
- Schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- The 12 original 2024 QP/MS PDFs, 156 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B24/review_v1/`. Do not edit candidate, source PDFs, other evidence, trackers, app code, lessons, taxonomy, or translations.

## Required review

- Verify all frozen input hashes, 392 snapshot entries and all 12 source hashes/page counts.
- Independently test all 170 marking items and question/part links against exact QP/MS pages, including labels, hierarchy, displayed marks, target type, table rows/conditions and visual dependencies.
- Check the 29 structural parent groupings without separate MS rows and confirm their children account for source structure without inferred allocations.
- Recompute six totals against covers; verify whole-question question targets and no synthetic parts.
- Inspect every MS visual-dependency page and a full-size risk sample across all QP layout/diagram/table/formula classes; verify 130 regions and zero dangling IDs.
- Retest context-linked QP/MS evidence around 2024 blank/imprint/next-question boundary corrections. Report exact locator, severity, owner and retest for every disagreement; do not silently repair the candidate.

## Deliverables and stop

Produce `LINKAGE_REVIEW_V1.md`, `LINKAGE_FINDINGS_V1.json`, `MARKS_CONTEXT_CHECK_V1.json`, pinned input/output and source/render manifests, and `HANDOFF_REVIEW_V1.json` with checksum. Recommend PASS_A4_ONLY only with no open Critical/Major. Freeze and stop for A0 audit.
