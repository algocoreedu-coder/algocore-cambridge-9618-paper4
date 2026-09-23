# A0 dispatch — B22 A4 same-version v5 retest

Date: 2026-09-21. Task: `P1-S1-A4-B22-RETEST-V5`. Owner: independent A4 reviewer. State: DISPATCHED.

## Frozen inputs

- Candidate `B22-A2-v5`: handoff SHA256 `93dd40c9fe8172d07df01be9e9134ef3893ea1e29bd4f2a0b2524e37968c485e`; batch manifest `adf4f8fd9a465aac4dee9bd52e9b39ea15ca3a541757dc7d42acf0592402bfd3`; snapshot manifest `85dbffa1e2068b3baa49cd8cf99e0a6ed0729f2c10bae7438424babd14dd744a`; review-union manifest `3f11507d2b798767d68969bf685b1616ba70ea0767450e60f3d9b4bbbd5cd9ef`; semantic diff `a6654c788bbce697c526086086fc8fefbc353fa483584479a3f2268c3902d15c`.
- A0 validator SHA256 `53d28c63b7390dd8019694e2769747dde6fb41ee5811cf5270e3ab23242f72ca`; A0 candidate audit SHA256 `e00c6233efe0de36565456dffe9d3c59263aee75292c0614f1e469b7b2f62ca5`.
- Prior v4 A3/A4 handoffs SHA256 `84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7` and `40e891f892c83e1e4b258eb625d173f2e7250d648da98597e3c1fce0dbf05a32`; A0 audits `cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f` and `921f8293b27965641a855170bc72f1bac2420120c47f2a5535939389a4c0281a`.
- Authority: Stage 0 source manifest `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Compare the independent A3 v5 handoff after it freezes; do source checks independently.

## Review scope

Retest exact v5 for A4 linkage/marks/hierarchy/unresolved/visual criteria. Verify source W22/13 Q6(b)(iii) token `(iii)` at QP p.13 and unchanged correct locator/transcript. Verify every one of the 22 review-union source/page/render pairs, roles and hashes; reconcile the 11/12/6/7/22 page counts, 18 legacy assets, one supplementary outside union and five new renders. Confirm PAGE/QUESTION/MARKING/VISUAL indexes and UNRESOLVED are byte-identical to v4; all seven marks, 12 locators, six totals, 32 unresolved parent containers, 188 targets, 104 dependencies and 88 visual regions remain valid. Rehash 12 PDFs/166 pages and verify candidate hash chain.

Recommend PASS or CHANGES_REQUIRED for A4 only. Compare the frozen A3 v5 evidence and preserve any disagreement. A9/A0 remain mandatory; do not edit candidate or prior evidence.

## Write boundary and stop

Write only new `evidence/a4/B22/retest_v5/`; stop if it exists. Deliver `RETEST_V5.md`, `RETEST_FINDINGS_V5.json`, same-version A3 comparison, source/render evidence manifests and `HANDOFF_RETEST_V5.json`. Pin inputs, outputs, sources and renders, freeze, and stop for A0 audit.
