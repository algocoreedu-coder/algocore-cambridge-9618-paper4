# P1-S1-A3-B25-REVIEW-V1 — Independent context and scope review

Status: READY_FOR_DISPATCH. Owner: A3 independent of B25-A2-v1 author. Stop after a frozen PASS_A3_ONLY/CHANGES_REQUIRED handoff; A4, A9 and A0 remain mandatory. Do not spawn another agent.

## Frozen inputs

- Candidate `evidence/a2/B25/versions/B25-A2-v1/`.
- Candidate handoff SHA256 `6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b`.
- Candidate batch manifest SHA256 `7ab0ea8a747d54c8d50157784d2dae5c1158c95b4db2049ae50f077364b7e244`.
- Candidate snapshot manifest SHA256 `a9a96b6ba8db064578a73798228839c837e99f614ae4e05186e206ad6e6c14d6` (438 entries).
- A0 candidate audit SHA256 `bcb35b2855ca5ae297174901c31ea7d4846a308a279aa0a55109c26a2d5e4660`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.
- 2026 syllabus PDF SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`.
- Stage 0 syllabus scope SHA256 `87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c`.
- Stage 0 pilot scope check SHA256 `619a575cfaa3c3a516b192e0f32f8fe8b55b18fa0230285ac9442ccc64e0905a`.
- Schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- The 12 original 2025 QP/MS PDFs, 178 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B25/review_v1/`. Do not edit candidate, source PDFs, other evidence, trackers, app code, lessons, taxonomy, or translations.

## Required review

- Verify all frozen input hashes, 438 candidate snapshot entries, 12 source hashes/page counts and the full-source contact-sheet screen.
- Independently review question boundaries, multi-page/shared scenario context, continuation pages, command words, source locators and scope flags against the originals and 2026 syllabus authority.
- Check all 51 context files. Blank/imprint pages must not be treated as question continuation; legitimate multi-page context must remain attached.
- Review the 27 parent grouping labels with no separate MS allocation and confirm they are structural parents rather than unresolved leaves; do not infer marks or fabricate child parts.
- Check a risk-based full-size sample covering every session/variant, diagrams/tables/formulas/layout-dependent prompts, ambiguous labels and long continuations. State the sample and its limits.
- Recompute six QP totals, verify 51 roots/207 parts/183 marking items/144 visual regions, and report any context/source/scope disagreement with exact locator, severity, owner and retest.
- Scope flags are observations only. Retain all historical questions; do not claim teaching coverage, frequency, correctness, translation quality or final taxonomy.

## Deliverables and stop

Produce `CONTEXT_SCOPE_REVIEW_V1.md`, `CONTEXT_SCOPE_FINDINGS_V1.json`, `SCOPE_FLAGS_V1.json`, `SOURCE_RISK_REVIEW_V1.md`, pinned input/output and source/render evidence manifests, and `HANDOFF_REVIEW_V1.json` with checksum. Recommend PASS_A3_ONLY only with no open Critical/Major. Freeze and stop for A0 audit.
