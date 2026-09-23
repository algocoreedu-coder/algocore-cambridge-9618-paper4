# A0 addendum — B22 A4 v4 review page-set reconciliation

Date: 2026-09-21. Frozen work order: `B22_A4_V4_RETEST_DISPATCH.md`, SHA256 `5607c31ac3e04fc4ac8245d1fd6495c9e4680a7b7aff140bcb82501b267508c4`.

The work order's phrase “18 direct correction pages plus six QP cover pages” is an imprecise page-count description. Recompute review targets from the frozen `CORRECTION_EVIDENCE.json` and `VISUAL_MANIFEST.json`; deduplicate by `(source_id, PDF page)` and inspect the complete union:

- the seven mark and twelve nested-locator corrections (19 records across source pages; current source page pairs should be reported from the records themselves),
- all twelve QP pages whose visual-region targets were reconciled in v4,
- all six QP cover pages used to verify printed 75 totals.

The current `renders/v4-correction-source/` folder contains 18 PNGs; the renderer evidence includes correction pages, six covers, and a supplementary page render. It is not an authoritative count of unique corrected prompt pages. Record the actual deduplicated set and counts from manifests, verify each target by source/page, and note any discrepancy between `CORRECTION_EVIDENCE.json`'s `unique_direct_source_pages` field and the deduplicated rows. Continue using the corrected candidate BATCH_MANIFEST digest `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e2c3c928f91858f9d4` from the separate SHA erratum. Do not alter candidate or work order.
