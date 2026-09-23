# Independent A9 batch retest — B21 A2 v5

Task: `P1-S1-A9-B21-RETEST-V5`  
Candidate: `B21-A2-v5`  
Recommendation: **CHANGES_REQUIRED** for the B21 batch gate. This is A9's recommendation only; A0 makes the batch decision.

## Gate result

The frozen candidate and specialist handoffs match all dispatched hashes. Candidate integrity checks passed for all 310 snapshot entries and 309 declared outputs. The 12 Stage 0 Paper 1 PDFs match their hashes and page counts (154 pages total). I independently screened all pages using 12 direct-source contact sheets and inspected all 35 designated full-page source renders. All 13 VIS-01 MS marking items across 12 MS pages and all four QP target regions have exact source/page relations, candidate assets, and matching MS dependencies where required; the candidate assets are readable and unclipped. The W21/12 Q1 correction is exact and does not invent a child part. All six QP displayed-mark sums independently match the printed cover total 75. All 34 explicit parent-context unresolved marking rows preserve null mark/condition/table-row allocations. Whole-candidate schema and cross-reference checks found no other broken reference.

One source-context defect blocks the batch gate:

| Affected root record | Candidate context pages | Source evidence | Required correction |
|---|---|---|---|
| `9618_s21_qp_12-q8` | p.14, 15, 16 | Q8 completes on p.14; p.15 is explicitly `BLANK PAGE`; p.16 is copyright/imprint matter. | Keep Q8 p.14 only. |
| `9618_w21_qp_11-q8` | p.15, 16 | Q8 is on p.15; p.16 is copyright/imprint matter. | Keep Q8 p.15 only. |
| `9618_w21_qp_13-q8` | p.15, 16 | Q8 is on p.15; p.16 is copyright/imprint matter. | Keep Q8 p.15 only. |

Finding **A9-B21-CTX-01** is **MAJOR / OPEN_BLOCKING**, owner **A2-B21 via A0**. The four false page references occur in `continuation_pages` and `source_evidence` of the three context records; `all_context_pages` includes the same non-question pages. Remove those page entries in a new immutable candidate version and regenerate dependent manifests. Require A0 integrity/schema validation followed by same-version A3, A4, and independent A9 retests.

## Evidence and limits

- [Criterion checks](INTEGRITY_AND_CROSSREF_CHECKS_V5.json) — frozen pins, candidate and specialist file hashes, source hashes/page counts, target/cross-reference checks, totals, unresolved rows, and Q7/Q8 context check.
- [Findings](FINDINGS_V5.json) — the blocker, exact affected records/pages, owner, and retest requirements.
- [Input manifest](INPUT_MANIFEST_V5.json) — frozen candidate snapshot, specialist outputs, 12 original PDFs, and direct render/contact-sheet hashes.
- [Visual review log](VISUAL_REVIEW_LOG_V5.json) and [source render manifest](SOURCE_RENDER_MANIFEST_V5.json) — 154 reduced-scale page views, target and Q7/Q8 full-size page evidence, and asset hashes.
- Historic S1-I14 remains open as a non-blocking provenance limitation; this review does not recover the A4-v2 digest. Local source hashes were verified against Stage 0; remote Cambridge authenticity was not independently checked. Contact sheets are an overview screen only, not full-size validation of all pages.

The candidate, earlier evidence, trackers, source PDFs, and app were not changed. A9 does not claim batch acceptance or Stage 1 completion.
