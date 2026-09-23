# B21 A9 independent batch review — v3

**Decision: CHANGES_REQUIRED.** The schema, source-integrity, hierarchy, locator, and specialist linkage/context checks pass on the frozen B21-A2-v3 packet. The whole batch gate fails because the required visual inventory is incomplete: an independent page-by-page render sweep found at least 16 source pages with diagrams, tables, or layout-dependent number structures that have no `visual_region`; the affected MS rows also have no visual dependency references. The A4 reconciliation finding `A4-B21-REC-03` therefore remains open and is substantiated by this review.

Review date: 2026-09-21. Scope: independent review of B21-A2-v3 and the exact-input B21 A3/A4 v3 retests against original 2021 QP/MS PDFs, Stage 0 source baseline, and Stage 1 schema/policy. No corpus, A0 tracker, app, or source PDF was modified. No lesson/content approval is given.

## Frozen inputs and exact hashes

Paths below are relative to the workspace root `Computer_Science/`. SHA256 values were recomputed from the named files unless identified as a declaration check. A2 active output hashes were checked 16/16 against `A2/HANDOFF_CHECK.json`; A3 independently checked those same 16/16; A4’s v3 input table checked 21/21 inputs, including all eight active A2 core files, policy, sources, and prior retests. A4’s v2 frozen core snapshot check was independently recomputed by A9 and matches 6/6. The A0 validator below was rerun independently.

### Source baseline and original PDFs

All 12 local source files were opened and hashed by this reviewer; each hash and PDF page count equals both the Stage 0 source manifest and A2 BATCH_MANIFEST. Total: **154 pages**. The hashes establish identity against the local Stage 0 baseline; this review did not independently establish remote authenticity for every local QP/MS copy.

| Source ID | Relative path | Pages | SHA256 |
|---|---|---:|---|
| `9618_s21_ms_11` | `Past_Papers/2021/May_June/9618_s21_ms_11.pdf` | 10 | `e0c2cd4128ec9e2491d8ef2befe7674281dd934cb366f72cbcc6ee026fef6733` |
| `9618_s21_ms_12` | `Past_Papers/2021/May_June/9618_s21_ms_12.pdf` | 10 | `faab5e3e4410d94ab99080d659f2f7c60aab15c716ae9978aa3819fc1836da0c` |
| `9618_s21_ms_13` | `Past_Papers/2021/May_June/9618_s21_ms_13.pdf` | 10 | `0c6950bf86eafca693b0c433d1609fa908eaac02266280b21d5181fec2f447a8` |
| `9618_s21_qp_11` | `Past_Papers/2021/May_June/9618_s21_qp_11.pdf` | 16 | `d73fa3294ec38a62d756742887a1bfc99909a2135ea86ac4a6713915fc305453` |
| `9618_s21_qp_12` | `Past_Papers/2021/May_June/9618_s21_qp_12.pdf` | 16 | `63c51bb1e39c8795d3dae421cf4e2a79c82a823fcfbdd817c2041b6c6c052eb1` |
| `9618_s21_qp_13` | `Past_Papers/2021/May_June/9618_s21_qp_13.pdf` | 16 | `c98d466d79c7e1cb71906d108dc17f3222e27c152f4e554b689c3a2facd783a3` |
| `9618_w21_ms_11` | `Past_Papers/2021/Oct_Nov/9618_w21_ms_11.pdf` | 9 | `6bba06b264a7ea85b3d9fc51dac1fae443bcb98017d1e7c5098aa7f1a2a6eab8` |
| `9618_w21_ms_12` | `Past_Papers/2021/Oct_Nov/9618_w21_ms_12.pdf` | 10 | `887e29a6dbf04654924c320b429ddf52c8bd9e8c31b24d8dc1e787c5bf0d2566` |
| `9618_w21_ms_13` | `Past_Papers/2021/Oct_Nov/9618_w21_ms_13.pdf` | 9 | `d9640b5963ac205e92f45fc85353d962e6d950e64d9044c936b243bc3418a2d3` |
| `9618_w21_qp_11` | `Past_Papers/2021/Oct_Nov/9618_w21_qp_11.pdf` | 16 | `69922d70a5e16ed0716a3e741e4addf2e2723da05d47f03ac9288705aac799f9` |
| `9618_w21_qp_12` | `Past_Papers/2021/Oct_Nov/9618_w21_qp_12.pdf` | 16 | `9fa28bfd27645df25197c518aa07573c14ea301a3fe024c23b03c28dadea7b36` |
| `9618_w21_qp_13` | `Past_Papers/2021/Oct_Nov/9618_w21_qp_13.pdf` | 16 | `40ba3b0ec189a43aef2253b9331d037547751aa77a671f175bb41cb1d8ad3584` |

Stage 0 manifest SHA256: `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.

### A2 v3 active outputs

All 16 hashes declared by A2 match the active files. The A2 handoff itself is SHA256 `d2b63bc8244912c59073a5f4c5489133f60a0fd967b0e768a8fe8512d188ca0d`.

| Active output | SHA256 |
|---|---|
| `BATCH_MANIFEST.json` | `e759722afa93e23d764a5dc6b22bfa682448d5d8c0c77b538e80a1d1e08515e8` |
| `PAGE_INDEX.jsonl` | `91c81ef7fe24c59e6d5658ff3585650ba68b645a32d0b99b5904125bce3b83d6` |
| `QUESTION_INDEX.jsonl` | `926a69cf3dc081e243ee2bcc8ebb812c2e7aac00aa43b3f40c40fded50ea9f33` |
| `MARKING_INDEX.jsonl` | `e0b2bc4b797c61e5e3e797afaf01aa8ed3dc73fd7e24fc68f7659ceb96b9a9ab` |
| `CONTEXT_INDEX.jsonl` | `b8c6bd10c7b81849f52b63ce7170de32703a42406dc921534bc1e187111f39b6` |
| `VISUAL_MANIFEST.json` | `8133793c7c5894a4016586cbe4ef94600f310cba8144085d3c7ed9ec4685ecc9` |
| `REVISION_NOTES.md` | `6e2f9359365d892986141c5492a19cc7e4de8fb7465ea2399ddc91eb2f40c37d` |
| `UNRESOLVED.md` | `0fe1c1ca310dac8167cfbc315d5408dcd9cd290655ca983af342c095e6910874` |
| `EXTRACTION_QA.md` | `c65c4f25bf01961af4552e4e33c3d9fac4cb47faf7c47b7260dc1fc38e5944a0` |
| `V3_SELF_CHECK.json` | `a09c5d3898974e94dd1dc134c89766bffbaa21578890801a35055c7b959aa213` |
| `contexts/9618_s21_qp_11-q7.json` | `145a8197b02654fa13b8b2687f643f83037b318129357b7a519e96fd6749b7a2` |
| `contexts/9618_s21_qp_13-q7.json` | `5223e16d27e8b7427d9eb22a6b4c12fa3a2d9540a98eee6d772e3ef867247231` |
| `renders/9618_s21_ms_11-p10.png` | `65291bf9cb9c09c71118f0f908485dd9b0c348884b0c0171870f58d6074afd03` |
| `renders/9618_s21_ms_13-p10.png` | `69ad7a8a72f33d56801dad33c5121ec2ee951ffbf22b0482894c36ad15e756d5` |
| `revise_b21_v3.py` | `e890a0ec1587cdeb35b2f965a129b5229e21acfae07e4e1690c4b2817fe6cbbf` |
| `A0_VALIDATION_V3.json` | `3e3a3031a22c2f0e2029a16929e756498ca3b0bc40b39d3bcb61959bb09e72a3` |


### A3/A4 same-version retests and policy inputs

- A3 `HANDOFF_RETEST_V3.json`: `2155f1f5140f7f92f3f4bbc5faf517e3eaabfbf69e2109287d9d2e273aadede6`; report `CONTEXT_SCOPE_RETEST_V3.md`: `3e5c85c4c50d5c1d1f0790c57486fe415906fb9e631239bafa3819b1e6a67a1f`; findings `CONTEXT_SCOPE_FINDINGS_V3.json`: `e88d4b03955f52aa7825e696e0672c18f38d2d3386924bb1f7248556e9c8c0fa`. A3’s 16/16 A2 active hash comparisons, 12/12 policy/review input comparisons, two output-file hashes and 41/41 rendered evidence hashes match.
- A4 `RETEST_HANDOFF_V3.json`: `a56646659a868834ddd81597c1f53f9da911dcb91a37e848114daf537149e11c`; report `RETEST_V3.md`: `c0f0c14eb51b990098306615eef4e0e561e46aeed62aa565e4b12e976df5de81`; findings `RETEST_FINDINGS_V3.json`: `d852787edaa0473880176f9454a41e9ffbf612ce475db1cd22ad97624566d9b5`. A4’s 21/21 input file hashes and 10/10 deliverable/source-render hashes match.
- Prior reconciliation findings `RECONCILIATION_FINDINGS.json`: `b9b40a728bb2398ae8a66324a15a747baf981559ea64188fe1cc479b82d9cacc`; addendum `RECONCILIATION_ADDENDUM.md`: `5164caf36a1391f512e2646f7504bc33e515246dc5dd54a78e460003f2d37304`.
- A3-v2 handoff `HANDOFF_RETEST_V2.json`: `0d89f4969fb7271808ea2a4f7061ac6a8975018f8675b703b28ac3c1e2d96b7d`.
- Stage 1 `CORPUS_SCHEMA.md`: `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; `EXTRACTION_POLICY.md`: `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`; `WORK_ORDERS.md`: `8d5bdeaf961c3e593b13c7eb1c2ab1d5415366753d1454c53be3096ffc980a25`.

## Independent checks and gate evidence

| Criterion | Result | Evidence |
|---|---|---|
| Source identity/openability | PASS | 12/12 SHA256 and page counts match Stage 0 and A2; 154 total pages. |
| Schema/serialization | PASS | Independent `stage-1/scripts/validate_batch.py`: pass=true, no errors; 12 sources, 154 page rows, 253 question-index rows (48 question roots + 205 parts), 207 marking rows, 61 visual rows. Output SHA256: `3e3a3031a22c2f0e2029a16929e756498ca3b0bc40b39d3bcb61959bb09e72a3`. |
| Page completeness and record identity | PASS | 154 unique `(source_id, pdf_page_1_based)` keys exactly cover all source pages; no duplicate question/part IDs; 48 roots, 205 parts, 207 marks. |
| Hierarchy and v1.1 marking targets | PASS | 74 parent references; zero dangling parent IDs, cycles, dangling question/part targets, or target-XOR errors. Two unparted whole-question Q8 marking records use `question_id_or_null`; no invented Q8 parts. |
| Question starts and context | PASS for specialist scope | A3/A4 verified 48/48 question-start locators against original pages; this reviewer confirmed corrected W21 QP11 Q1 at p2 and Q6 at p11 and reviewed the source render. S21 QP11/13 Q7 roots span p15–16; Q7(b)(iii)[1] and Q7(c)[3] remain under Q7, separate Q8[3] remains a question-level item. |
| Marking links and displayed marks | PASS for recorded rows | A4 checked 173/173 exact printed MS labels, 171/171 displayed part marks, 34 parent-context-only unresolved/null allocations; A4 v3 input/output hashes are exact. This review visually checked S21 MS/QP p9–10/p16 and W21 Q1/Q6 locator repair. No answer correctness is asserted. |
| Visual asset integrity | PASS for existence and declared hashes | All 61 current region render assets exist. The 8 carried-forward v2 renders remain byte-identical and their `RENDERED_PENDING_INDEPENDENT_REVIEW` status is appropriate. This does not establish that all policy-risk pages were indexed.
| Visual-risk coverage and dependencies | **FAIL — Major** | Source sweep identifies at least 16 additional risk pages with no current region, listed in `FINDINGS.md`. Associated MS marking rows have no visual dependency refs. This violates policy §3 and leaves A4-B21-REC-03 unresolved. |
| Prior finding reconciliation | PARTIAL | A4-B21-REC-01 counts reconciled below; REC-02 W21 Q1/Q6 locator mismatch is corrected; Q7/Q8 and stale render-status findings are corrected. REC-03 remains open and is strengthened by this review. Historic S1-I14 remains non-blocking. |

### Visual count reconciliation (keep measures distinct)

The numbers in the earlier addendum describe the **frozen v1 baseline**, not v3: 51 regions, 18 non-empty relations, 33 empty relations, 20 relation-target occurrences. Frozen v2 has 59 regions, 48 non-empty, 11 empty, 48 relation-target occurrences. Current v3 has **61 regions on 61 distinct source pages**, 50 non-empty `relates_to_ids` arrays, 11 empty arrays, and 52 region-to-target occurrences (28 distinct target IDs). Separately, A4 counts 51 `MARKING_INDEX.visual_dependency_refs` occurrences, all resolving to existing region IDs. All 61 region render assets exist. Thus `visual_region_targets=52` is a relation-occurrence count, not 52 unique target IDs; it does not prove coverage completeness.

### Render sweep evidence

I rendered the 61 currently indexed source pages and all 93 source pages with no current visual-region entry, covering every page of the 12 original PDFs. The contact sheets are in `renders/B21_visual_pages_01.png`–`06.png` (61 pages) and `renders/B21_unflagged_pages_01.png`–`08.png` (93 pages). Hashes for every sheet and the 16 full-page omission witnesses are listed in `FINDINGS.md`. The scan also included ordinary text-only and blank pages; those were not treated as missing visual-risk pages. It is a visual-risk audit, not a judgment of answer correctness.

## Prior B21 findings disposition

- A4 v2 missing/misattributed Q7(b)(iii), Q7(c), and false Q8(c): corrected; A4-v3 source checks confirm the printed QP p16 sequence and exact MS p9 labels.
- Q8 whole-question mark/MS link omission: corrected for both components 11 and 13; QP p16 shows separate `[3]`, MS p10 gives “1 mark per correct row” and total 3; target remains whole-question with no inferred row allocation.
- Eight new visual-region stale statuses: corrected; assets exist and pending independent-review state is accurate.
- A3/A4 W21 Q1/Q6 page attribution and missing p2 Q1 visual relation: QP11/13 Q1 roots now point to p2 and Q6 to p11; this review observed the original pages. These corrections do not close the separate current omissions on W21 QP12 p2/p6/p12.
- A4-B21-REC-01: reconciled using version-specific counts above.
- A4-B21-REC-02: corrected by the frozen v3 locator/index values and A3/A4 source checks.
- A4-B21-REC-03: **not corrected sufficiently**; see Major finding A9-B21-VIS-01.
- Historic S1-I14: see non-blocking provenance caveat in `FINDINGS.md`.

## Required next gate

Return the 16-page minimum visual-coverage finding to A2-B21 via A0 for an immutable next version. Require source-page renders and supported page-to-question/part/MS dependencies, or explicit unresolved status where an association cannot be established. Then rerun A0 validation, same-version A3 and A4 retests, and A9 retest against frozen hashes. Do not mark the batch accepted until the A0 gate closes.
