# A0 dispatch — B22 A3 same-version v4 retest

Date: 2026-09-21. Task: `P1-S1-A3-B22-RETEST-V4`. Owner: independent A3 reviewer who did not author B22-A2-v4. State: DISPATCHED.

## Frozen inputs

- Candidate: `evidence/a2/B22/versions/B22-A2-v4/`; `HANDOFF_CHECK.json` SHA256 `3a83c90b96ec7166e8187ee37c71db1b700f14cc10b4aec6fabc5db57beb0164`; `BATCH_MANIFEST.json` SHA256 `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e2c3c928f91858f9d4`; `SNAPSHOT_MANIFEST.json` SHA256 `74b65bdc167d33fe716755afcbe2d1fe21242c708b44bb7a2f50f6e7f494d02e`.
- A0 validator: `evidence/a0/B22_A2_V4_A0_VALIDATE.json` SHA256 `c0dcfebe4be4e4880bf459abf40991d0f29b67527e8da629e5e88ad00a0074a7`; A0 handoff/integrity audit: `evidence/a0/B22_A2_V4_A0_AUDIT.json` SHA256 `ca763bf550aa4526b04f97fccd8fceb7318b9872a508ca619633ce17afe6910d`.
- Previous A3 review: `evidence/a3/B22/CONTEXT_SCOPE_RETEST_V3.md` SHA256 `3d2627956e5294bc32039656e32a7324dc12dabe1042ba9f7d0e4dfc73438cc5`; findings `878e1a06fb5f270a935ecffc1c6dd2687a1861cae7b06f0df9a5187624e2dc46`; handoff `c59dbd4e3cb51110cb0edc2a1310241f7277a529cd6dec86236b7f782cdde838`.
- Previous A4 review: `evidence/a4/B22/RETEST_V3.md` SHA256 `edb0ce494a7ebdea009f7ed99d387ce7c7aff3a39debe17fe6688d473257672f`; findings `79f72c50bab8a706fda93efb1a477d071d5526b86f3a540c36391b228da4120f`; handoff `095c03c3b2a52d4d534ace5968453d9613becbce841469eec9c1c2167013cdda`.
- A0 prior source spot-checks: `evidence/a0/B22_MARK_SOURCE_SPOTCHECK_V3.json` SHA256 `04ea6cc6f5840ba9ba87fcac83b187e6ca33cf59b4334e01da4a92d904d92119`; `evidence/a0/B22_LOCATOR_SOURCE_SPOTCHECK_V3.json` SHA256 `410d7d691a3b4d6e75eda9669e9f4d8b4cc47207468f436b6404789c5c3dabba`.
- Authority and policy: Stage 0 `SOURCE_MANIFEST.json` SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; 2026 syllabus SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`; Stage 1 schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Original QP/MS source PDFs are read-only: the exact 12 B22 entries in Stage 0 and the frozen v4 handoff. Recompute file hashes and page counts before source review.

## Review scope

Retest the A3 source/context, syllabus scope, and source-risk criteria against exact B22-A2-v4 and the 12 original PDFs. Recheck the seven displayed marks and twelve nested-child QP locators independently at their cited source pages; do not use the 75-mark totals to allocate any individual mark. Confirm each record's page/transcript/render evidence agrees with the original source. Recheck all six indexed totals against cover totals, prior whole-question targets, the removed false W22/12 Q1(c), hierarchy, unresolved parent rows, cross-page contexts, schema targets, and source-backed syllabus boundaries.

For the 88 visual regions and 104 marking dependencies, check region/status/context evidence against its exact source/page; inspect all 18 direct-source correction pages and all six QP cover pages, and use the 12 whole-paper contact sheets as a reduced-scale risk screen across all 166 pages where present. State exactly which pages were inspected full-size and which only via contact sheets. Record any unverified claim or source/tool limitation; do not imply full-resolution review of uninspected pages. Preserve the 32 documented item-specific unresolved parent-container links unless source evidence supports a specific correction.

Do not edit the candidate or any prior evidence. Recommend PASS or CHANGES_REQUIRED for the A3 gate only. A4 same-version review, A9 independent batch review, and A0 batch decision remain mandatory.

## Write boundary, deliverables and stop

Write only in new `evidence/a3/B22/retest_v4/`. If that directory exists before starting, stop and report to A0. Deliver `CONTEXT_SCOPE_RETEST_V4.md`, `CONTEXT_SCOPE_FINDINGS_V4.json`, `SCOPE_FLAGS_RETEST_V4.json`, `SOURCE_RISK_RETEST_V4.md`, source-render/contact-sheet evidence with manifests, and `HANDOFF_RETEST_V4.json`. Freeze hashes for every input, output, source render, and handoff; record criterion-level disposition, exact source locators, method, limits, recommendation, and declaration that the candidate was not edited. Stop after handoff for A0 integrity audit.
