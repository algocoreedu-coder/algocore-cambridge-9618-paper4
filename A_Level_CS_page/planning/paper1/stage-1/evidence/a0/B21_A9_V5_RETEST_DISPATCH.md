# A0 dispatch — B21 A9 independent v5 batch retest

Date: 2026-09-21. Task: `P1-S1-A9-B21-RETEST-V5`. Owner: independent A9 reviewer who authored neither B21-A2-v5 nor its A3/A4 v5 reviews. State: DISPATCHED.

## Frozen inputs

- Candidate `B21-A2-v5`: handoff `d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2`; batch manifest `61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7`; snapshot manifest `63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581`.
- A0 candidate audit `evidence/a0/B21_A2_V5_A0_AUDIT.json` SHA256 `6a68292017550ef9b5cb78a84071d1d46a5dd1ddcc7a740871167359d9e6a9e8`; validator `a89c4b2ad2a9b223a3575d00441d366f8ce7ac8b92ce20840f82ef7036929054`.
- A3 v5 handoff `f490f55cb686c2b4393caa40a80f3da38ae24dc3bf9443c5ae0a04a71c5b23e5`; A0 audit `1c554facc4e4af58fac0fce98fd2130b80396f1d3d046e300fa32bffcd5e3c24`.
- A4 v5 handoff `55fe2d6b5bc6dc9e9a6e4f3ec049dae11da323ff0c31c1671198fd092f9fd365`; A0 audit `84fae5c592ade69dc0253c0ed60df543742d6794d4bb9d60eddd44dc7f31b7db`.
- Prior A9 review: `evidence/a9/B21/BATCH_REVIEW.md` SHA256 `0604695e57500e5b945beeffa952706a8638752f256db406037e853b4b926ab7`; findings SHA256 `f514e1a7e40ed0c359dbaca2262969788fa4d060772ac0324234f032ee28c6b6`.
- Authority: Stage 0 source manifest `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; policy `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Recompute the exact 12 B21 source PDF hashes and page counts (154 pages) before substantive review.

## Independent review scope

Review the complete B21-A2-v5 packet and source evidence independently. Retest the original A9-B21-VIS-01 finding: all 13 MS item IDs across 12 source pages and four QP visual targets must have source-faithful regions, exact source/page relations, valid dependencies and legible assets. Retest S1-I16 directly against original W21/12 QP p.2 and MS p.3: Q1 root mark is `[2]`, no child is fabricated, and one exact whole-question MS item targets the root with the printed conditions.

Independently recompute all six displayed-mark sums and compare with original covers; inspect Q7/Q8 hierarchy/context, 34 explicit parent-context unresolved rows, schema targets and all candidate cross-references. Perform a 154-page whole-source risk screen using 12 contact sheets and inspect all risk/correction targets full-size; state exact full-size coverage and reduced-scale limits. Verify candidate, A3 and A4 hashes rather than relying on self-reported PASS. Preserve S1-I14 as a non-blocking historic provenance limit.

Report criterion-level PASS or CHANGES_REQUIRED, precise findings and source locators. A9 may recommend the B21 batch gate only; A0 makes the batch decision. Do not edit candidate, source PDFs or earlier evidence.

## Write boundary and stop

Write only new `evidence/a9/B21/retest_v5/`; stop if it exists before starting. Deliver `BATCH_REVIEW_V5.md`, `FINDINGS_V5.json`, render/contact-sheet evidence and manifests, and `HANDOFF_RETEST_V5.json`. Pin all inputs, outputs, source PDFs/page counts and renders. Freeze the handoff and stop for A0 audit; do not claim A0 acceptance or Stage 1 completion.
