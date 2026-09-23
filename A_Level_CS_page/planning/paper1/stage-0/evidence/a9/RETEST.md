# Retest - A9-M01

Date: 20/09/2026 (+07:00). Reviewer: /root/a9_independent_review. Result: **PASS / finding closed**.

Initial input set: `../a0/REVIEW_INPUT_MANIFEST.json` v1.0.0, 19 content artifacts. Corrected input set: `../a0/RETEST_INPUT_MANIFEST.json` v1.0.1, 19 content artifacts. A0 remains the author of the fix.

Changed artifact: `../../SCOPE_AND_COVERAGE_PLAN.md`, now v1.0.1; SHA256 `1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb`.

A9 read the database row at line 20 and original syllabus PDF/printed page 27, section 8.3. The corrected row explicitly attaches the two-table limitation to DML query/modify. The rest of required database coverage remains in AC26-8.1-01–07, AC26-8.2-01–02 and AC26-8.3-01–06. No syllabus requirement was removed or added by the correction.

`RETEST_CHECKS.json` records freshly calculated hashes for all 19 retest artifacts: all match the new manifest. `INDEPENDENT_CHECKS.json` was run while this known fix had been applied; its one difference from the original manifest is exactly this scope file. That difference is expected and resolved by this retest; it is not silently treated as an unchanged v1.0.0 input.

This retest approves the corrected content candidate. Operational gate/board/resume records remain live and are not substituted for the versioned content evidence.
