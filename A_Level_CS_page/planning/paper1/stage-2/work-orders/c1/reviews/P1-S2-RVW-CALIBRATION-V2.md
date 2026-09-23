# P1-S2-RVW-CALIBRATION-V2 — Fresh A3 all-target retest

Version 1.0, issued 22/09/2026. Reviewer must be a fresh A3 who authored neither calibration version nor the prior specialist review.

- **Inputs:** exact calibration-v2, calibration-v1 for delta, Critical `S2-C1-A9-001`, source corpus/QP/MS and governing schema pinned in the adjacent manifest.
- **Write:** `stage-2/evidence/a3/reviews/calibration-v2/review-v1/` only.
- **Outputs:** `REVIEW_REPORT.md`, `FINDINGS.json`, `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF.json`.
- **Checks:** rehash every input. Independently inspect all 25 frozen bindings: target ID, exact QP label/content/page, displayed marks, marking ID, exact MS label/content/page and analyst classification. Explicitly verify CAL-14 Q5(a) client/server and CAL-15 Q2(a) software terminology, and confirm the other 23 rows remain source-correct. Recompute family-fit counts independently; current author report is 13 MATCH / 5 PARTIAL / 7 MISMATCH and is evidence to test, not an acceptance assumption.
- **Acceptance:** explicitly close or retain `S2-C1-A9-001`; no wrong-target/source binding, unresolved promotion or predictive claim. Findings include severity, locator, evidence, owner and fix/retest.
- **Stop:** freeze the five outputs and stop. Do not edit calibration, accept C1 or dispatch C2. Do not spawn agents.
