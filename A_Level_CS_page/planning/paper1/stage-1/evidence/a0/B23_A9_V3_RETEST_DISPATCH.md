# A0 dispatch — B23 independent A9 retest of A2-v3

Date: 2026-09-21. Task: `P1-S1-A9-B23-RETEST-V3`. Owner: fresh independent A9 reviewer, not an author of B23 A2/A3/A4. State: READY_FOR_REVIEW.

## Frozen inputs

- Candidate A2-v3: `evidence/a2/B23/HANDOFF_CHECK.json` SHA256 `dedc1f1b7c5377c5f055e0a29cd230cdd82128155e9025f2b4ba1547ca342f2b`; `BATCH_MANIFEST.json` SHA256 `62d0a50e7e446d1bd36ac91a072e272298131e78f5b4e084437c69bea619765d`; A2 validator `A0_VALIDATION_v3.json` SHA256 `10bc496879f445f6df490b02df9aa009c9f2c2157221489daffaf66a5bb51671`.
- Same-version A3: `evidence/a3/B23/HANDOFF_RETEST_V3.json` SHA256 `ebb0df655d86925f862e464c20b0f64dfb55e82f4f4c75a087970360b1b9abdf`; A3 report SHA256 `c873930c949cd0d14d65297ebe5e62aabf48befce2dd44488820430645a7c183`; A0 handoff audit SHA256 `9a9a7c94d22d25186ffd0b1e0a378598e89fe468602dde00246b012278f3f4a0`. A3 gate PASS only.
- Same-version A4: `evidence/a4/B23/RETEST_HANDOFF_V3.json` SHA256 `042d31c10e74a716f29e5374a142a318d3e07c6aa53f5887483ee735d1c4019f`; A4 report SHA256 `8ee357a7425fdcc682673a084bc2cb85a7c736c11e8cbdd6487c119131af3396`; findings SHA256 `7a45c17dd32332bbadb22b090c43aadda78293a3add141d6afca81f6ff721ad2`; A0 handoff audit SHA256 `c6bc543bd15f2da63ea96fcea1c0878b254f5f7cc7eab0168217eb4bc878bf22`. A4 gate PASS only.
- A0 cross-reference audit SHA256 `ce8b21fe27082673ef83148c2550e013a6222f7201340e2066c6e75923cc9234`: no dangling visual relations/dependencies and no invalid schema 1.1 targets.
- Prior independent A9 B23 review: `BATCH_REVIEW.md` SHA256 `e0f7eac24ce7936c2def081280e7060e8c2a306c5eebec800836807359765b85`; `FINDINGS.md` SHA256 `aa4a5e1de98dbf0b4d400553cb7326892aab7b2715d1ce3704c321c498916b00`; prior `RETEST.md` SHA256 `44f2b26e3787a0648332bac731e70feda145a1da7bfcc0c8d6b8802c0b0dcf39`; prior input manifest SHA256 `2e54fde8cb1fd232e50e442c075b82d8997e1dbf5b49e9019a531d5fe74fe13f`.
- Authority/policy: Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; Stage 1 schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Read-only originals are the twelve B23 QP/MS PDFs in the Stage 0 manifest. Recompute source hashes and page counts before review; do not rely on candidate claims alone.

## Retest scope

Independently review the corrected B23 v3 batch against the original source PDFs, A3/A4 same-version evidence, Stage 1 policy, and prior A9 findings. This is an A9 batch recommendation only; A0 retains the final gate.

Retest every prior A9 finding:

| Finding | Required independent source check |
|---|---|
| F01 Major | W23/11 Q9(a)[2] and Q9(b)[3] are present on QP PDF p16 and link to the exact whole-question rows on MS11 PDF p10; no omitted prompt or fabricated child. |
| F02 Major | S23/11 Q6 [5] appears as a question-level item on QP PDF p13 and maps to exact Q6 on MS11 PDF p9; no invented printed part. |
| F03 Major | All ten visual relations formerly targeting deleted marking-item IDs now resolve to current, source-supported IDs and the correct source page. |
| F04 Major | All thirty previously flagged MS risk pages now have appropriate regions and dependencies/statuses. Independently inspect full-size added-page renders for all 30; include S23/11 MS11 p3, MS11 p8 and MS13 p3. Review the source contact sheets for all 157 pages as a batch-level sweep; record coverage and any limits. Confirm no corrected page remains falsely marked `NO_RISK_TRIGGER`. |
| F05 Minor | Compare the W23/13 QP p13 v3 render with a fresh render of the original PDF; confirm Q9 opening and `(a)(i)` are visible and no content is clipped. |

Also recompute all twelve source hashes/page counts; compare corpus counts, all six QP cover totals against the indexed displayed marks, hierarchy/unresolved counts, and the A3/A4 criterion gates; sample every remaining visual-risk class. Record exact locator, evidence file/hash, method, severity, owner, and retest for every finding. Do not accept self-reports as proof, edit the corpus, infer marks, or claim lesson coverage.

## Write boundary, outputs, and stop

Write only in new `evidence/a9/B23/retest_v3/`. If that directory exists before work starts, stop and report to A0. Deliver `BATCH_RETEST_V3.md`, `FINDINGS_RETEST_V3.md`, a complete frozen `INPUT_MANIFEST_V3.json`, source renders/contact sheets and manifests, and `HANDOFF_RETEST_V3.json`. Hash all sources, candidate/reviewer inputs, outputs, and renders. Recommend PASS or CHANGES_REQUIRED only; do not claim acceptance or merge. Stop after handoff for A0 verification.
