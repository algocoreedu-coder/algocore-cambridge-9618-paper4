# A0 dispatch — B21 A4 same-version v5 retest

Date: 2026-09-21. Task: `P1-S1-A4-B21-RETEST-V5`. Owner: independent A4 reviewer who did not author B21-A2-v5. State: DISPATCHED.

## Frozen inputs and versions

- Candidate: `evidence/a2/B21/versions/B21-A2-v5/`; handoff SHA256 `d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2`; batch manifest SHA256 `61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7`; snapshot manifest SHA256 `63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581`.
- A0 validator SHA256 `a89c4b2ad2a9b223a3575d00441d366f8ce7ac8b92ce20840f82ef7036929054`; A0 candidate audit SHA256 `6a68292017550ef9b5cb78a84071d1d46a5dd1ddcc7a740871167359d9e6a9e8`; A2 correction order SHA256 `751ebb858754e8ee6eff6bec8ac3b33822bf0bd970be3cda6425aa7d04d743b1`.
- Previous A3 v4 report/findings/handoff SHA256: `1d737e1afcf7c35fca45c83dc02dbf1c60e330d40129be72729ee28558505de8`, `23bc0b56cfd7aa46519829005948e0cba8ea6da6ba1bd45ad0483c93afb9685c`, `551a2e875239c8ead27988044e43de59ba6029260ca4e8d2d5845a40e14bc11e`; A0 A3 audit SHA256 `1f008a0eb88e92173f62b010dee47fa8e6c96d4437c6f6350e45bee114076173`.
- Previous A4 v4 report/findings/handoff SHA256: `375711c02d59aad460d04bc910c07173d157eb66f8e90a72331f720a2b97c73b`, `922031cac6e7c3b6e9567ec9ac02296d02b5dafdbffeedcd3fb7dd04cf670c7e`, `0ee6293e60b99ce456b2ea66d68459935bcfa4344b9df63346b47a12283651d9`; A0 A4 audit SHA256 `4ebd25ee5326168255443d0ef14372645fbbee7747d93ce774374b7aeb7967eb`.
- Authority/policy: Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- The same-version A3 v5 review is independently active. Compare its frozen handoff after it arrives, but perform source checks independently and preserve any disagreement.
- Original inputs are exactly the 12 B21 QP/MS PDFs pinned in Stage 0 and the candidate handoff. Recompute every source SHA256 and page count before review.

## Review scope and acceptance criteria

Retest A4 source linkage, displayed-mark fidelity, hierarchy, unresolved accounting, context and visual-reference criteria on exact B21-A2-v5. Independently verify original W21/12 QP PDF p.2 displays whole Q1 `[2]`; candidate root `9618_w21_qp_12-q1` must carry `marks_displayed_or_null: 2` and no child record may be invented. Verify original paired W21/12 MS PDF p.3 contains the exact whole-question Q1 row, and the new marking item targets the question root only, keeps exact locator/conditions, and links a visual region on the same source/page. Do not infer any mark from paper total.

Independently recompute all six displayed-mark sums from question/part records and compare with each original QP cover. Recheck the 13 MS marking-item IDs across 12 MS pages and the four QP visual targets introduced for A9-B21-VIS-01: exact source/page, region path/hash, `relates_to_ids`, dependency, status and legibility must all remain valid. Recheck all marking targets, 34 explicit unresolved parent-context rows, the Q7/Q8 hierarchy and cross-page context. Confirm v4-to-v5 changes are limited to the source-backed Q1 root mark, its exact whole-question MS item and necessary manifest/documentation hashes.

Inspect W21/12 QP p.2 and MS p.3 plus all visual-risk target pages at full size, and use the 12 contact sheets as a reduced-scale sweep across all 154 pages. State exact full-size and contact-sheet coverage. Record limitations and preserve historic S1-I14. A4 may recommend PASS or CHANGES_REQUIRED only for its gate; A3 v5, A9 and A0 batch decision remain mandatory.

## Write allowlist, outputs and stop

Write only in new `evidence/a4/B21/retest_v5/`. If the path exists before work begins, stop and report to A0. Do not edit candidate, source PDFs, prior evidence, trackers, app, lessons or translations.

Deliver `RETEST_V5.md`, `RETEST_FINDINGS_V5.json`, source render/contact-sheet evidence and manifests, same-version A3 comparison after its handoff freezes, and `HANDOFF_RETEST_V5.json`. Pin every input, output, source PDF/page count and render hash; include criterion-level results, exact locators, method/limits, candidate-untouched declaration and recommendation. Freeze handoff and stop for A0 integrity audit.
