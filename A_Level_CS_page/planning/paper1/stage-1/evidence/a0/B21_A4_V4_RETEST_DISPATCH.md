# A0 dispatch — B21 A4 same-version v4 retest

Date: 2026-09-21. Task: `P1-S1-A4-B21-RETEST-V4`. Owner: independent A4 reviewer who did not author B21-A2-v4. State: WAITING_FOR_A4_B23_SLOT.

## Frozen inputs

- Candidate: `evidence/a2/B21/versions/B21-A2-v4/`; `HANDOFF_CHECK.json` SHA256 `a96fe020eb22b9336d9172c16855e200ae34b98e62f0337bb6c08a3659b2585f`; `BATCH_MANIFEST.json` SHA256 `27a42507ae84127756651c67e7ad31711eb24a1f5a9b6913c18f3fc9cec1810e`; `A0_VALIDATION_V4.json` SHA256 `464fa3ec739f637737d1ce5aeabbf640e9781c3f910ca41c5461a6b4c9892cb4`.
- A0 independent handoff audit: `evidence/a0/B21_A2_V4_A0_AUDIT.json` SHA256 `d14f9937055783814c90d20989aafca163bb59a756e1bc8c2444658350c4f5b3`.
- Count errata: `evidence/a0/B21_A2_V4_DISPATCH_ERRATA.md` SHA256 `e586a5ca769469426b603dc75d68b6bbc314fe068cf084191aaa5227fd5a07a7`. Verify all 13 MS marking-item IDs across 12 MS pages and four QP targets; do not use the prose's “12 MS rows” as the item count.
- Original A9 finding/review: `evidence/a9/B21/FINDINGS.md` SHA256 `f514e1a7e40ed0c359dbaca2262969788fa4d060772ac0324234f032ee28c6b6`; `BATCH_REVIEW.md` SHA256 `0604695e57500e5b945beeffa952706a8638752f256db406037e853b4b926ab7`.
- Previous same-version specialist reports: A3 v3 `evidence/a3/B21/CONTEXT_SCOPE_RETEST_V3.md` SHA256 `3e5c85c4c50d5c1d1f0790c57486fe415906fb9e631239bafa3819b1e6a67a1f`; A4 v3 `evidence/a4/B21/RETEST_V3.md` SHA256 `c0f0c14eb51b990098306615eef4e0e561e46aeed62aa565e4b12e976df5de81`.
- Authority/policy: Stage 0 `SOURCE_MANIFEST.json` SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; Stage 1 schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Read-only original source PDFs are the exact 12 B21 entries locked by the Stage 0 manifest and candidate v4 handoff. Recompute hashes and page counts before review.

## Review scope

Retest A4 linkage, displayed mark, hierarchy, unresolved accounting, context, and visual-reference criteria against B21-A2-v4 and the original 12 QP/MS PDFs. Confirm all prior A4 v3 repairs remain intact. For A9-B21-VIS-01, inspect the 16 added source pages/renders and verify the 13 MS item dependencies resolve to the exact source/page region, four QP targets resolve to the right page region, no target or dependency is dangling or points to another paper/page, and page visual status is consistent. Confirm source authenticity/hash/page counts and six QP cover totals remain valid; do not infer a mark from a total. Test 13 MS item IDs across 12 pages; a region on `9618_s21_ms_12` p5 supports two distinct QP marking-item IDs. Record any unresolved relationship with locator evidence.

Do not edit candidate or any prior evidence. Recommend PASS or CHANGES_REQUIRED for A4 only; A9 and A0 batch gates remain mandatory.

## Write boundary, outputs, and stop

Write only in new `evidence/a4/B21/retest_v4/`. If that directory exists before work starts, stop and report to A0. Deliver `RETEST_V4.md`, `RETEST_FINDINGS_V4.json`, `HANDOFF_RETEST_V4.json`, and direct source-page render/contact-sheet evidence with a render manifest. Freeze SHA256 for every output/input/render, include criteria and exact page/ID evidence, and state whether any claim relies on A2 self-report. Stop after handoff for A0 integrity audit.
