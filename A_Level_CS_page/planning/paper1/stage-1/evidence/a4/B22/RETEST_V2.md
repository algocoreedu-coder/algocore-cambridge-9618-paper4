# B22 A4 retest — A2-v2

**Disposition: CHANGES_REQUIRED.** This is an A4 retest result only. It is not batch acceptance, and A9's independent review remains required.

I recomputed active A2-v2 artifact hashes and all 12 original source PDF hashes/page counts. Every source matches the active manifest and the Stage 0 baseline. The frozen B22-A2-v1 snapshot still matches the four hashes recorded by the earlier A4 review. Of the 16 previously incorrect MS page locators, all 16 now point to the correct MS page and printed label.

The main locator problem is not closed. A2-v2 calls 131 parts MS-linked, but 19 cited labels occur only as a prefix to a nested label on that page; they are not exact part locators. The other 112 linked records pass the exact-label/page test. The 25 existing unresolved entries are record-specific, but the 19 prefix-only rows are currently marked `MS_LINKED` and need exact child linkage or a specific unresolved status. The full list and QP/MS page pairs are in finding `B22-A4-V2-01` in [RETEST_V2.json](./RETEST_V2.json).

Displayed marks also remain a Major blocker. The question index has 23 populated mark fields and 133 null fields. The QP render for S22 Paper 13, page 14 visibly prints Q7(a) `[3]` and Q7(b) `[2]`; the active Q7(b) field is null. Three additional nested cases show a mark attached to a broad parent label while the QP prints distinct child marks: S22 Paper 11 Q6(a), W22 Paper 12 Q6(a/b), and W22 Paper 13 Q4(a). Finding `B22-A4-V2-03` gives exact record IDs and source locators, plus additional direct-mark examples. No marks are transferred or allocated by this review; A2 must inspect the source page and represent only what the printed labels support.

The two required context repairs pass: W22 Paper 11 Q4 links its five part records to the scenario and pages 6–8, and W22 Paper 12 Q7 links its four records to the instruction-set context and pages 10–14. The 71 visual dependencies resolve to matching MS source/page regions and matching table-row references; 60 linked items on pages without declared visual regions have no visual dependency. The 19 non-exact locators still need part/table-row retest after their hierarchy is corrected. All 131 `mark_or_condition_or_null` fields remain null, so this retest checks locator and dependency integrity and does not assess or infer marking-point wording.

There are no dangling parent IDs now because all eight formerly dangling links were removed. However, the eight known compound nested labels remain parentless, and the unresolved register does not record the parent relationship as unresolved despite that claim in the revision note. The exact child and former parent IDs are in `B22-A4-V2-02`. Also, the hash recorded for `HANDOFF_CHECK.json` is wrong in both that file and the batch manifest: the actual SHA-256 is `6ee0dc247fe2830101070f4f70e45472052af04b54db02d69a4da0767e772c14`, while both records claim `0c6eddd3fc77dabdc385271b3f639d20667f8294ad40ced137f2aceb6f8a3722`. The manifest also retains a stale note that marking records are question-level locators only.

| Earlier finding | Retest |
|---|---|
| A4-B22-R01 — 16 wrong MS pages | PASS: all 16 corrected and source-checked. |
| A4-B22-R02 — missing MS links/unresolved reasons | CHANGES_REQUIRED: 19 of 131 links are prefix-only; 25 others have record-specific unresolved status. |
| A4-B22-R03 / A3-B22-R02 — displayed marks | CHANGES_REQUIRED: 133 nulls remain; exact omissions/misassignments are evidenced. |
| A4-B22-R04 / A3-B22-R01 — cross-page context | PASS for both cited context cases. |
| A4-B22-R05 — parent IDs | CHANGES_REQUIRED: no dangling IDs, but eight known parent relations are omitted rather than specifically unresolved. |
| A4-B22-R06 — part labels and visual/table references | CHANGES_REQUIRED: 112 exact links and 71 visual dependencies check out; 19 labels remain prefix-only. Manifest note is stale. |

The exact hashes, source identity table, finding severity, owners, and A2 retest actions are recorded in [RETEST_V2.json](./RETEST_V2.json). A2 should submit a corrected immutable version; A4 must retest the 156-part hierarchy, exact locators, all mark fields and visual/table dependencies; A9 then performs its independent gate.
