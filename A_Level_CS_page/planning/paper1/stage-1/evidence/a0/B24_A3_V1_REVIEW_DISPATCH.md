# P1-S1-A3-B24-REVIEW-V1 — Independent context and scope review

Status: DISPATCHED. Owner: A3 independent of B24-A2-v1 author. Stop after a frozen PASS_A3_ONLY/CHANGES_REQUIRED handoff; A4, A9 and A0 remain mandatory. Do not spawn another agent.

## Frozen inputs

- Candidate `evidence/a2/B24/versions/B24-A2-v1/`.
- Candidate handoff SHA256 `d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd`.
- Candidate batch manifest SHA256 `1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486`.
- Candidate snapshot manifest SHA256 `dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97` (392 entries).
- A0 candidate audit SHA256 `cc9563fd98aae568f6a6ee29ed9e8e83738e2ebde3089eb8440ee9c528d70ca1`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.
- 2026 syllabus PDF SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`.
- Stage 0 syllabus scope SHA256 `87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c`; pilot scope check SHA256 `619a575cfaa3c3a516b192e0f32f8fe8b55b18fa0230285ac9442ccc64e0905a`.
- Schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- The 12 original 2024 QP/MS PDFs, 156 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B24/review_v1/`. Do not edit candidate, source PDFs, other evidence, trackers, app code, lessons, taxonomy, or translations.

## Required review

- Verify all frozen input hashes, 392 snapshot entries and all 12 source hashes/page counts.
- Independently review all 49 question contexts, boundaries, multi-page/shared scenarios, command words, source locators and 2026 syllabus scope flags.
- Explicitly retest the candidate's 2024 parser fixes: next-question preambles, `[Turn over` variants, copyright/imprint endings and reported blank pages must not be false continuations; legitimate continuations must remain.
- Review the 29 parent grouping labels without separate MS allocations and confirm their child structure; do not invent marks or parts.
- Screen all contact sheets and inspect a full-size risk sample across every session/variant and every diagram/table/formula/layout class. State limits.
- Recompute six totals and verify 49 roots/194 parts/170 marking items/130 regions. Report exact locator, severity, owner and retest for every disagreement.

## Deliverables and stop

Produce `CONTEXT_SCOPE_REVIEW_V1.md`, `CONTEXT_SCOPE_FINDINGS_V1.json`, `SCOPE_FLAGS_V1.json`, `SOURCE_RISK_REVIEW_V1.md`, pinned input/output and source/render manifests, and `HANDOFF_REVIEW_V1.json` with checksum. Recommend PASS_A3_ONLY only with no open Critical/Major. Freeze and stop for A0 audit.
