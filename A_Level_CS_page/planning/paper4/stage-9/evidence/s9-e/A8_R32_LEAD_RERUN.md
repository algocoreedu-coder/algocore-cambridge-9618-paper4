# A8 clean-room harness rerun after R3.2

**Decision: PASS_AFTER_REWORK — required findings open: 0.**

Lead reran A8's checked-in clean-room harness against registry SHA-256 `c69f9c57f56b22bbdb4f329366bfc970282c7915556c5e8fe5742bb30dfad57e`. All 52 VI/EN lesson routes returned 200, the invalid slug returned 404, 138/138 unique source locators resolved, all six locked input hashes were unchanged, and no local source locator leaked into an href.

The original A8 technical browser matrix already covered all 13 packages, runtime normal/boundary/failure scenarios, 320 px layout and console output. The post-R3.2 browser recheck confirmed localized structured labels, collapsible learning support and a non-runtime Testing table with Normal, Boundary and Failure trace rows. Console warnings/errors: 0.
