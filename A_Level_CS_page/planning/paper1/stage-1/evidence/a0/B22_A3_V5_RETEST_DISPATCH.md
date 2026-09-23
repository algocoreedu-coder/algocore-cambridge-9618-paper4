# A0 dispatch — B22 A3 same-version v5 retest

Date: 2026-09-21. Task: `P1-S1-A3-B22-RETEST-V5`. Owner: independent A3 reviewer. State: DISPATCHED.

## Frozen inputs

- Candidate `B22-A2-v5`: handoff SHA256 `93dd40c9fe8172d07df01be9e9134ef3893ea1e29bd4f2a0b2524e37968c485e`; batch manifest `adf4f8fd9a465aac4dee9bd52e9b39ea15ca3a541757dc7d42acf0592402bfd3`; snapshot manifest `85dbffa1e2068b3baa49cd8cf99e0a6ed0729f2c10bae7438424babd14dd744a`; review-union manifest `3f11507d2b798767d68969bf685b1616ba70ea0767450e60f3d9b4bbbd5cd9ef`; semantic diff `a6654c788bbce697c526086086fc8fefbc353fa483584479a3f2268c3902d15c`.
- A0 validator `evidence/a0/B22_A2_V5_A0_VALIDATE.json` SHA256 `53d28c63b7390dd8019694e2769747dde6fb41ee5811cf5270e3ab23242f72ca`; A0 candidate audit `evidence/a0/B22_A2_V5_A0_AUDIT.json` SHA256 `e00c6233efe0de36565456dffe9d3c59263aee75292c0614f1e469b7b2f62ca5`.
- Prior same-version v4 A3 handoff `84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7`; A4 handoff `40e891f892c83e1e4b258eb625d173f2e7250d648da98597e3c1fce0dbf05a32`; A0 audits `cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f` and `921f8293b27965641a855170bc72f1bac2420120c47f2a5535939389a4c0281a`.
- Authority: Stage 0 source manifest `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; syllabus `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`; schema `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.

## Review scope

Retest exact v5 for A3 source/context/scope. Verify original W22/13 QP p.13 and transcript show `(iii)` and the corrected evidence token matches while locator remains p.13. Independently verify all 22 unique review-union source/page pairs and render hashes/legibility, with correct 19 rows / 18 records / 11 correction pages / 12 changed-region pages / six covers / seven overlaps / 22-page union / 18 legacy assets / five new renders semantics. Confirm the five protected corpus files are byte-identical to v4 and no question, mark, locator, context, dependency, unresolved or syllabus-scope drift occurred. Recheck six totals and 12 PDF hashes/page counts (166 pages). Use contact sheets as a reduced-scale whole-source screen and state limits.

Recommend PASS or CHANGES_REQUIRED for A3 only. A4 v5, A9 and A0 remain mandatory. Do not edit candidate or prior evidence.

## Write boundary and stop

Write only new `evidence/a3/B22/retest_v5/`; stop if it exists. Deliver `CONTEXT_SCOPE_RETEST_V5.md`, `CONTEXT_SCOPE_FINDINGS_V5.json`, `SCOPE_FLAGS_RETEST_V5.json`, `SOURCE_RISK_RETEST_V5.md`, source/render evidence manifests and `HANDOFF_RETEST_V5.json`. Pin all inputs, outputs, sources and renders, freeze, and stop for A0 audit.
