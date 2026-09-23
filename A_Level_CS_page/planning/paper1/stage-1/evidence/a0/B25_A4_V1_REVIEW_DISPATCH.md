# P1-S1-A4-B25-REVIEW-V1 — Independent QP/MS linkage review

Status: READY_FOR_DISPATCH. Owner: A4 independent of B25-A2-v1 author. Stop after a frozen PASS_A4_ONLY/CHANGES_REQUIRED handoff; A3, A9 and A0 remain mandatory. Do not spawn another agent.

## Frozen inputs

- Candidate `evidence/a2/B25/versions/B25-A2-v1/`.
- Candidate handoff SHA256 `6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b`.
- Candidate batch manifest SHA256 `7ab0ea8a747d54c8d50157784d2dae5c1158c95b4db2049ae50f077364b7e244`.
- Candidate snapshot manifest SHA256 `a9a96b6ba8db064578a73798228839c837e99f614ae4e05186e206ad6e6c14d6` (438 entries).
- A0 candidate audit SHA256 `bcb35b2855ca5ae297174901c31ea7d4846a308a279aa0a55109c26a2d5e4660`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.
- Schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- The 12 original 2025 QP/MS PDFs, 178 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B25/review_v1/`. Do not edit candidate, source PDFs, other evidence, trackers, app code, lessons, taxonomy, or translations.

## Required review

- Verify all frozen input hashes, 438 candidate snapshot entries and all 12 source hashes/page counts.
- Independently test question/part labels, parent hierarchy, displayed marks, exact QP/MS locators, marking-item targets, table rows/conditions and visual dependencies against the originals.
- Check every one of the 183 marking items and every question/part linkage for valid target type; ambiguous parent rows must remain explicit and no mark allocation may be inferred.
- Review all 27 parent grouping labels with no separate MS row and confirm their child mappings account for the source structure.
- Recompute all six QP totals against printed covers; verify whole-question rows use question targets and no synthetic part exists.
- Inspect every visual-dependency page and a risk-based full-size sample of QP layout/diagram/table/formula regions across all sessions/variants; verify 144 regions, direct source-page evidence, valid `relates_to_ids`, and no dangling dependency.
- Report every disagreement with exact source locator, severity, owner and retest. Do not silently repair the corpus or infer marking wording, score allocation, taxonomy, frequency or learner rubric.

## Deliverables and stop

Produce `LINKAGE_REVIEW_V1.md`, `LINKAGE_FINDINGS_V1.json`, `MARKS_CONTEXT_CHECK_V1.json`, pinned input/output and source/render evidence manifests, and `HANDOFF_REVIEW_V1.json` with checksum. Recommend PASS_A4_ONLY only with no open Critical/Major. Freeze and stop for A0 audit.
