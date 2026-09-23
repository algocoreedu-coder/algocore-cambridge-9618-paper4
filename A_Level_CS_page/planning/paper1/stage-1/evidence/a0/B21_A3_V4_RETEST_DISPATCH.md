# A0 dispatch — B21 A3 same-version v4 retest

Date: 2026-09-21. Task: `P1-S1-A3-B21-RETEST-V4`. Owner: independent A3 reviewer who did not author B21-A2-v4. State: READY_FOR_REVIEW.

## Frozen inputs

- Candidate: `evidence/a2/B21/versions/B21-A2-v4/`; `HANDOFF_CHECK.json` SHA256 `a96fe020eb22b9336d9172c16855e200ae34b98e62f0337bb6c08a3659b2585f`; `BATCH_MANIFEST.json` SHA256 `27a42507ae84127756651c67e7ad31711eb24a1f5a9b6913c18f3fc9cec1810e`; `A0_VALIDATION_V4.json` SHA256 `464fa3ec739f637737d1ce5aeabbf640e9781c3f910ca41c5461a6b4c9892cb4`.
- A0 independent handoff audit: `evidence/a0/B21_A2_V4_A0_AUDIT.json` SHA256 `d14f9937055783814c90d20989aafca163bb59a756e1bc8c2444658350c4f5b3`; 305/305 declared output hashes/sizes, 15/15 input hashes, 12/12 source hash/page checks, 154 source pages; all 16 finding page references structurally resolve.
- Count errata: `evidence/a0/B21_A2_V4_DISPATCH_ERRATA.md` SHA256 `e586a5ca769469426b603dc75d68b6bbc314fe068cf084191aaa5227fd5a07a7`. Test 13 distinct MS marking-item IDs across 12 MS pages, plus four QP page targets; the original dispatch prose's “12 MS rows” is a page count, not an item-ID count.
- Original A9 finding/review: `evidence/a9/B21/FINDINGS.md` SHA256 `f514e1a7e40ed0c359dbaca2262969788fa4d060772ac0324234f032ee28c6b6`; `BATCH_REVIEW.md` SHA256 `0604695e57500e5b945beeffa952706a8638752f256db406037e853b4b926ab7`.
- Previous same-version specialist reports to preserve: A3 v3 `evidence/a3/B21/CONTEXT_SCOPE_RETEST_V3.md` SHA256 `3e5c85c4c50d5c1d1f0790c57486fe415906fb9e631239bafa3819b1e6a67a1f`; A4 v3 `evidence/a4/B21/RETEST_V3.md` SHA256 `c0f0c14eb51b990098306615eef4e0e561e46aeed62aa565e4b12e976df5de81`.
- Authority/policy: Stage 0 `SOURCE_MANIFEST.json` SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; `SCOPE_AND_COVERAGE_PLAN.md` SHA256 `1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb`; syllabus `697372-2026-syllabus.pdf` SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`; Stage 1 schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Read-only original source PDFs are exactly the 12 B21 entries locked by the Stage 0 manifest and candidate v4 handoff. Check hashes/page counts before source review.

## Review scope

Retest A3 context, syllabus scope, and source-risk criteria against the exact frozen v4 candidate and all 12 originals. Recheck previous A3 v3 passes and open S1-I14 limitation, then focus on A9-B21-VIS-01. Inspect the 16 source-page targets at full size; verify all 13 MS item IDs link to a region on their exact source/page, the four QP page targets relate to the exact QP page, rendered pages are legible/source-faithful, and each page's visual status agrees with the manifest. Review the 12 contact sheets as a whole-corpus risk screen over all 154 pages; record the coverage and limits without claiming full-resolution inspection for pages not inspected at full size. Confirm no new scope/context risk is introduced by v4 and that prior Q7/Q8, locator, mark, context, and question-target repairs remain source-consistent.

Do not edit candidate or any prior evidence. Recommend PASS or CHANGES_REQUIRED for the A3 gate only. A4 and A9 retests plus A0 batch decision remain mandatory.

## Write boundary, outputs, and stop

Write only in new `evidence/a3/B21/retest_v4/`. If that directory exists before work starts, stop and report to A0. Deliver `CONTEXT_SCOPE_RETEST_V4.md`, `CONTEXT_SCOPE_FINDINGS_V4.json`, `SCOPE_FLAGS_RETEST_V4.json`, `SOURCE_RISK_RETEST_V4.md`, source-render/contact-sheet evidence and manifests, and `HANDOFF_RETEST_V4.json`. Freeze SHA256 for every output, input, and render; include criterion-by-criterion disposition, exact source locators, recommendation, method, limits, and a declaration that candidate files were not edited. Stop after handoff for A0 integrity audit.
