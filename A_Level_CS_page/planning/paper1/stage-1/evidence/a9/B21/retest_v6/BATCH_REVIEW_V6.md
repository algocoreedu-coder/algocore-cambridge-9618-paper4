# B21 A9 independent batch review — v6

**Recommendation:** PASS for the frozen B21-A2-v6 candidate. This is A9’s recommendation only; it is not the A0 batch decision. No Critical or Major finding remains open.

## Frozen version and evidence

Review target: `B21-A2-v6`. Candidate handoff SHA256: `9719395a5daf02b0a3aa37fdb54b4bf28e4eabeb4bc3da76e05d2ddaeff96c33`; batch manifest: `626f136e1ad3ba1b86191b9a2182892d326c69259408b53cb7a6b85bd8b1ba8e`; snapshot: `fe0563b881affd4dc8d25ac2f3bd22fe0bec4a9e586cf6c5b5b3206a427b2117`. Full pins, including each original source PDF, are in `PINNED_INPUTS_V6.json`.

The 12 original source PDFs hash-match Stage 0 and contain 154 pages. All 313 candidate snapshot entries and 312 declared output hashes match; all 310 v5 snapshot entries remain present. Independent physical comparison confirms 10 changed, 3 added, 0 deleted, and 301 unchanged files.

## Independent checks

- Retested `A9-B21-CTX-01` against full-size source renders: `9618_s21_qp_12-q8` now contains page 14 only; `9618_w21_qp_11-q8` and `9618_w21_qp_13-q8` contain page 15 only. Their continuation arrays are empty and false pages do not appear in context/source-evidence fields. Page 15 of S21/12 and page 16 of W21/13 are literal BLANK PAGE; S21/12 page 16 and W21/11 page 16 are copyright/imprint pages.
- Confirmed legitimate Q7 continuation on S21/11 and S21/13 pages 15–16 remains with the correct Q7 records.
- Confirmed W21/12 Q1 has QP root mark 2 at PDF page 2 and one matching question-level MS row on PDF page 3.
- Recomputed each of six QP totals: all equal 75.
- Recomputed record counts: 48 roots, 205 part records, 208 marking items, 34 explicit parent-context-only rows with null allocations, and 77 visual regions. Typed question/part/marking-item references yield zero dangling IDs.
- Checked 154 source/transcript page pairs by normalized word-token sets: no missing transcript, minimum source-token coverage 0.9541 and minimum Jaccard 0.9455. This supports provenance, not full semantic correctness for diagrams/tables/layout.
- Screened 12 contact sheets covering all 154 pages and reviewed 35 full-size source renders for the v5 risk classes and corrected contexts. Render digests and page pins are in `SOURCE_RENDER_EVIDENCE_V6.json`.
- Independently inspected A3/A4 exact-v6 handoffs and A0 audit records. Both specialist handoffs recommend PASS for their limited gates; both A0 audits report PASS_WITH_NONBLOCKING_MINOR.

## Findings and gate impact

The former Major `A9-B21-CTX-01` is **resolved in v6**. Three non-blocking Minor notes remain: the semantic-diff summary duplicates three added rows under `changed_existing` (physical delta independently verified); the prior v5 report called W21/13 page 16 imprint although the page literally says BLANK PAGE (v6 excludes it); and the A4 audit did not pin the dispatch record’s own hash as an expected input (the record’s exact digest and matching work-order linkage are recorded in findings). Owners and closure conditions are recorded in `FINDINGS_V6.json`. These do not affect candidate corpus accuracy or the independently recomputed physical delta.

## Limitations and disposition

Every page received reduced-scale visual screening; only 35 received full-size rendering, so this is not a full-size visual audit of every page. Transcript token comparisons do not validate diagram/table/layout semantics. Remote Cambridge authenticity was not rechecked; local copies match the frozen Stage 0 hashes.

A9 recommends **PASS** for the exact frozen v6 batch because all blocking checks pass and only bounded, owned audit-trail/metadata precision notes remain. A0 retains sole authority for the batch gate decision. See `INTEGRITY_CROSSREF_CHECKS_V6.json`, `SOURCE_RENDER_EVIDENCE_V6.json`, `FINDINGS_V6.json`, and the frozen `HANDOFF_RETEST_V6.json`.
