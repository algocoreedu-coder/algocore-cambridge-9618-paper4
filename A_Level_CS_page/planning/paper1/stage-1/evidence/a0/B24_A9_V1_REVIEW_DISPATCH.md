# P1-S1-A9-B24-REVIEW-V1 — Independent batch gate review

Date: 2026-09-21. Status: DISPATCHED. Owner: A9 independent of B24 A2/A3/A4 authors and A0. Stop after a frozen PASS/CHANGES_REQUIRED recommendation; only A0 may accept B24. Do not spawn agents.

## Frozen inputs

- Candidate `evidence/a2/B24/versions/B24-A2-v1/`: handoff SHA256 `d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd`; batch manifest SHA256 `1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486`; snapshot SHA256 `dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97` with 392 entries.
- Candidate A0 audit `evidence/a0/B24_A2_V1_A0_AUDIT.json` SHA256 `cc9563fd98aae568f6a6ee29ed9e8e83738e2ebde3089eb8440ee9c528d70ca1`.
- A3-v1 handoff `evidence/a3/B24/review_v1/HANDOFF_REVIEW_V1.json` SHA256 `8da881280e8e09f55bdc1d9e19e827ecbce56d5c4df3df418050ab42d60a22cf`; output manifest SHA256 `3d3d8983e4a0c651a397d1559fd9cc1439a5fbe3c47d7a0d9163aa7f17e24f4b`; A0 audit SHA256 `62d3784778c719cb8747146a0627b8726d36b23e0f45e0dcdda7ba4cba68bb83`.
- A4-v1 handoff `evidence/a4/B24/review_v1/HANDOFF_REVIEW_V1.json` SHA256 `e145320c7805acd8e70a1d507a1f902e59e7d517e967cfb9314e47d909bcff3e`; output manifest SHA256 `092dea2479ced3be66f9e5bb71c120bfdf525c30b0c70fb7cf3938490c08dc4e`; output sums SHA256 `9e89e3020b9f71c238fcebad545d7cd8c4e0854f840e744f303d06906c2a5ce9`; A0 audit SHA256 `3a085ed2cc214f002f771af1a238f36facd75c0a7e7a814d0c70f5666c881867`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`; 2026 syllabus/scope artifacts remain authoritative for scope limits.
- Twelve original 2024 QP/MS PDFs, 156 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/B24/review_v1/`. Do not edit A2/A3/A4/A0 artifacts, sources, trackers, app, lessons, taxonomy or translations.

## Required independent review

- Verify all frozen pins, 392 candidate snapshot entries, A3/A4 evidence identities, and all 12 original PDF hashes/page counts.
- Independently evaluate whether the frozen candidate meets the Stage 1 batch gate. Check complete aggregate counts, unique IDs, hierarchy, locators, source/transcript/context refs, visual dependencies, unresolved records, allowed statuses and six displayed-mark totals.
- Sample every risk class and every session/component using direct original source pages. Include blank/imprint/next-question boundaries, shared-page context, multi-page prompts, diagrams/tables/formulas, MS alternatives/conditions and whole-question versus part targets.
- Explicitly retest the informational locator nuance: S24/13 Q3(b) starts on PDF p6 while its `[3]` token is on continuation p7; verify the context and locator model do not lose or misattribute that mark.
- Verify the 29 structural parent groupings do not receive inferred allocations and their child records retain source-backed linkage.
- Report criterion results and every finding with exact source locator, severity, owner and retest. Do not silently repair candidate or specialist evidence. Do not claim lesson correctness, teaching coverage, taxonomy, translation quality or app behavior.

## Deliverables and stop

Produce `BATCH_REVIEW_V1.md`, machine-readable findings/check matrix, frozen input/output/source manifests, and `HANDOFF_REVIEW_V1.json` with checksum. Recommend PASS only if no Critical/Major is open and evidence suffices for the whole batch gate. Freeze and stop for A0 audit and decision.
