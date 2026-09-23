# A0 dispatch — B21 A3 same-version v5 retest

Date: 2026-09-21. Task: `P1-S1-A3-B21-RETEST-V5`. Owner: independent A3 reviewer who did not author B21-A2-v5. State: DISPATCHED.

## Frozen inputs and versions

- Candidate: `evidence/a2/B21/versions/B21-A2-v5/`; `HANDOFF_CHECK.json` SHA256 `d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2`; `BATCH_MANIFEST.json` SHA256 `61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7`; `SNAPSHOT_MANIFEST.json` SHA256 `63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581`.
- A0 validator: `evidence/a0/B21_A2_V5_A0_VALIDATE.json` SHA256 `a89c4b2ad2a9b223a3575d00441d366f8ce7ac8b92ce20840f82ef7036929054`; A0 handoff/source audit: `evidence/a0/B21_A2_V5_A0_AUDIT.json` SHA256 `6a68292017550ef9b5cb78a84071d1d46a5dd1ddcc7a740871167359d9e6a9e8`.
- A2 correction order: `evidence/a0/B21_A2_V5_DISPATCH.md` SHA256 `751ebb858754e8ee6eff6bec8ac3b33822bf0bd970be3cda6425aa7d04d743b1`.
- Previous A3 v4 report/findings/handoff: SHA256 respectively `1d737e1afcf7c35fca45c83dc02dbf1c60e330d40129be72729ee28558505de8`, `23bc0b56cfd7aa46519829005948e0cba8ea6da6ba1bd45ad0483c93afb9685c`, and `551a2e875239c8ead27988044e43de59ba6029260ca4e8d2d5845a40e14bc11e`; A0 v4 A3 handoff audit SHA256 `1f008a0eb88e92173f62b010dee47fa8e6c96d4437c6f6350e45bee114076173`.
- Previous A4 v4 report/findings/handoff: SHA256 respectively `375711c02d59aad460d04bc910c07173d157eb66f8e90a72331f720a2b97c73b`, `922031cac6e7c3b6e9567ec9ac02296d02b5dafdbffeedcd3fb7dd04cf670c7e`, and `0ee6293e60b99ce456b2ea66d68459935bcfa4344b9df63346b47a12283651d9`; A0 v4 A4 handoff audit SHA256 `4ebd25ee5326168255443d0ef14372645fbbee7747d93ce774374b7aeb7967eb`.
- Authority: Stage 0 `SOURCE_MANIFEST.json` SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; `SCOPE_AND_COVERAGE_PLAN.md` SHA256 `1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb`; `SYLLABUS_SCOPE.md` SHA256 `87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c`; 2026 syllabus SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Original source set: exactly the 12 B21 QP/MS PDFs locked in the Stage 0 manifest and v5 handoff. Recompute each SHA256 and page count before review.

## Review scope and acceptance criteria

Retest the exact frozen B21-A2-v5 for A3 context, source fidelity, syllabus scope and source-risk criteria. Confirm the v5 correction from original W21/12 QP PDF p.2: root record `9618_w21_qp_12-q1` must carry displayed mark `2`, with no synthetic child. Confirm the paired original W21/12 MS PDF p.3 contains an exact whole-question Q1 row and that the new marking item targets the question root only, preserves the printed marking conditions and exact locator, and has a valid visual dependency on the same source/page. Do not infer any mark from the 75-point total.

Independently recompute all six displayed-mark sums from question and part records and compare them with the original QP covers. Recheck the v4 A9 visual-coverage repair: all 13 MS marking-item IDs across 12 MS pages and four QP page targets must retain exact source/page regions, dependencies, context and legibility. Inspect the W21/12 QP p.2 and MS p.3 source pages full-size, plus every v4 risk target full-size; review all 12 contact sheets as a reduced-scale screen across all 154 source pages. State exactly which pages were reviewed full-size and which only through contact sheets.

Confirm the prior Q7/Q8 hierarchy, locators, displayed marks, cross-page contexts, schema targets and 34 documented parent-context unresolved records remain source-consistent. Preserve historic S1-I14 as a non-blocking provenance limitation. Record every unverified claim or tool/source limitation. A3 may recommend PASS or CHANGES_REQUIRED only for its gate; A4 v5, A9 and A0 batch decision remain mandatory.

## Write allowlist, outputs and stop

Write only in new `evidence/a3/B21/retest_v5/`. If that directory exists before the review begins, stop and report to A0. Do not edit the candidate, source PDFs, earlier evidence, trackers, app, lessons or translations.

Deliver `CONTEXT_SCOPE_RETEST_V5.md`, `CONTEXT_SCOPE_FINDINGS_V5.json`, `SCOPE_FLAGS_RETEST_V5.json`, `SOURCE_RISK_RETEST_V5.md`, source render/contact-sheet evidence and manifests, and `HANDOFF_RETEST_V5.json`. Pin every input, source PDF/page count, output and render hash; include criterion-level results, exact source locators, method, limitations, candidate-untouched declaration and recommendation. Freeze the handoff and stop for A0 integrity audit.
