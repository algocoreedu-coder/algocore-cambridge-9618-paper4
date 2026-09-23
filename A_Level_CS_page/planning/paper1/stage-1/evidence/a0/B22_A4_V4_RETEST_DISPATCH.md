# A0 dispatch — B22 A4 same-version v4 retest

Date: 2026-09-21. Task: `P1-S1-A4-B22-RETEST-V4`. Owner: independent A4 reviewer who did not author B22-A2-v4. State: READY_FOR_REVIEW; dispatch when an independent reviewer slot opens.

## Frozen inputs

- Candidate: `evidence/a2/B22/versions/B22-A2-v4/`; `HANDOFF_CHECK.json` SHA256 `3a83c90b96ec7166e8187ee37c71db1b700f14cc10b4aec6fabc5db57beb0164`; `BATCH_MANIFEST.json` SHA256 `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e3c3c928f91858f9d4`; `SNAPSHOT_MANIFEST.json` SHA256 `74b65bdc167d33fe716755afcbe2d1fe21242c708b44bb7a2f50f6e7f494d02e`.
- A0 structural validator: `evidence/a0/B22_A2_V4_A0_VALIDATE.json` SHA256 `c0dcfebe4be4e4880bf459abf40991d0f29b67527e8da629e5e88ad00a0074a7`; A0 handoff audit `evidence/a0/B22_A2_V4_A0_AUDIT.json` SHA256 `ca763bf550aa4526b04f97fccd8fceb7318b9872a508ca619633ce17afe6910d`.
- Prior A4 review: `evidence/a4/B22/RETEST_V3.md` SHA256 `edb0ce494a7ebdea009f7ed99d387ce7c7aff3a39debe17fe6688d473257672f`; findings `79f72c50bab8a706fda93efb1a477d071d5526b86f3a540c36391b228da4120f`; handoff `095c03c3b2a52d4d534ace5968453d9613becbce841469eec9c1c2167013cdda`.
- Same-version A3 v4 retest is independently dispatched; use its frozen handoff after it arrives, and preserve any disagreement as a finding rather than adopting a recommendation without source checks.
- A0 v3 source evidence: mark spot-check `04ea6cc6f5840ba9ba87fcac83b187e6ca33cf59b4334e01da4a92d904d92119`; locator spot-check `410d7d691a3b4d6e75eda9669e9f4d8b4cc47207468f436b6404789c5c3dabba`.
- Authority/policy: Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; Stage 1 schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Original 12 B22 QP/MS PDFs are read-only. Recompute source hashes and PDF page counts from the Stage 0 source manifest and candidate handoff before review.

## Review scope

Retest A4 source linkage, displayed mark fidelity, hierarchy, unresolved accounting, context and visual-reference criteria on this exact v4. Independently verify every seven mark corrections and twelve nested-child QP page corrections against the exact original QP PDF page, its printed question/part label, direct-source render and transcript. Do not infer any mark from the 75-point paper totals; totals only check completeness. Recompute the six displayed-mark sums from indexed question/part rows and compare with each original QP cover.

Retest the 12 previously shifted locators as exact page anchors. Confirm corrected question/part identifiers, parent relations, unresolved rows, six whole-question marking targets, and the 32 item-specific unresolved parent-container links retained from v3. Check all 88 visual region paths/`relates_to_ids` and 104 marking dependencies, with special attention to the 12 QP region pages reconciled in v4 and the 18 direct correction pages plus six QP cover pages. Verify page/source identity and current visual status. Confirm no dangling relation, cross-paper/page dependency, or stale render/page locator was introduced. Recheck source authenticity/hash/page counts and the handoff-manifest-snapshot hash chain.

Inspect the same-version A3 v4 handoff once frozen and compare gate evidence. Recommend PASS or CHANGES_REQUIRED for A4 only, with precise source IDs, PDF page numbers, record IDs, visual method and limits. The A3/A4 gates must agree on each claimed source correction or record a reasoned discrepancy for A0. A9 review and A0 batch decision remain mandatory.

Do not edit the candidate or any prior evidence. Do not infer an allocation for any whole-question MS row or unresolved parent container.

## Write boundary, deliverables and stop

Write only in new `evidence/a4/B22/retest_v4/`. If that path exists before starting, stop and report to A0. Deliver `RETEST_V4.md`, `RETEST_FINDINGS_V4.json`, `HANDOFF_RETEST_V4.json`, direct source-page render/contact-sheet evidence and a render manifest. Pin every input, output, PDF, page count and render hash; state criterion-level results and candidate untouched. Freeze the handoff and stop for A0 integrity audit.
