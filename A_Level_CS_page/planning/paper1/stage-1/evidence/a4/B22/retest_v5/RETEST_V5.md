# Independent A4 retest — B22 A2 v5

Task: `P1-S1-A4-B22-RETEST-V5`  
Candidate: frozen `B22-A2-v5`  
Recommendation: **PASS for the A4 linkage/marks/hierarchy/unresolved/context/visual-reference gate only.** This is not batch acceptance. A3 v5 independently recommends PASS for its own scope; A9 independent batch review and the A0 batch decision remain required.

## Frozen candidate and source checks

The pinned A2 handoff, batch manifest, snapshot manifest, review-union manifest, semantic diff, A0 validator, A0 candidate audit and Stage 0 source manifest match their dispatch hashes. I rehashed all 420 candidate snapshot entries: **420/420 match**. I independently opened and rehashed all **12 original 2022 QP/MS PDFs (166 pages)** against the Stage 0 manifest and A2 handoff; every SHA-256 value and page count matches. The six QP covers identify the expected 2022 session/component and each visibly prints a 75-mark total. Source identity here is Stage 0 hash-baselined; this retest does not independently reauthenticate the local copies against Cambridge remote downloads.

The candidate v5 closes both v4 evidence-only findings. For W22/13 Q6(b)(iii), the correction evidence now claims `(iii)` and the original QP p.13 plus pinned transcript support that token; locator p.13 and hierarchy remain correct. Page counts now distinguish 19 correction rows, 18 distinct records, 11 correction pages, 12 changed visual-region pages, six covers, seven overlaps and a 22-page deduplicated union. The 18 v4 items are render assets (17 in the union, one supplementary outside it); five new v5 renders supply the remaining union pages.

## Source and page visual checks

I rendered all **22 unique pages** in `REVIEW_UNION_MANIFEST.json` directly from the six original QPs using PyMuPDF 1.28.2 at 1.55 scale. All source hashes and page counts match Stage 0; every candidate render path exists and its expected SHA-256 matches the recomputed SHA. The evidence manifest records each source/page, role, candidate render hash and independent render hash. I visually inspected all 22 independent full-page renders, including the seven corrected marks, twelve corrected locators, six covers and twelve changed visual-region pages. The five new v5 pages are S22/11 p.3; W22/11 pp.2, 13, 14; and W22/12 p.15. The additional legacy S22/12 p.16 image is correctly identified as supplementary, outside the required union.

### Seven displayed mark corrections

| Record | Original source page | Printed label | Source/index mark | Result |
|---|---|---|---:|---|
| `9618_s22_qp_11-q4-pci` | 9618_s22_qp_11 p. 8 | Q4(c)(i) | 5 | PASS |
| `9618_s22_qp_12-q2-pc` | 9618_s22_qp_12 p. 4 | Q2(c) | 1 | PASS |
| `9618_s22_qp_12-q4-pb` | 9618_s22_qp_12 p. 7 | Q4(b) | 6 | PASS |
| `9618_s22_qp_12-q4-pc` | 9618_s22_qp_12 p. 7 | Q4(c) | 2 | PASS |
| `9618_w22_qp_12-q8-pcii` | 9618_w22_qp_12 p. 16 | Q8(c)(ii) | 2 | PASS |
| `9618_w22_qp_13-q6-pai` | 9618_w22_qp_13 p. 11 | Q6(a)(i) | 4 | PASS |
| `9618_w22_qp_13-q6-paii` | 9618_w22_qp_13 p. 12 | Q6(a)(ii) | 2 | PASS |

All seven directly observed bracket marks match their indexed rows. Independently recomputed sums of every non-null QP mark match each candidate total check and the printed 75 on all six covers; totals were used only as integrity checks, not to infer individual marks.

### Twelve corrected QP locators

| Record | Original QP page | Printed label | Candidate locator | Result |
|---|---|---|---:|---|
| `9618_s22_qp_11-q2-pci` | 9618_s22_qp_11 p. 5 | `(c)(i)` | p. 5 | PASS |
| `9618_s22_qp_11-q2-pcii` | 9618_s22_qp_11 p. 5 | `(c)(ii)` | p. 5 | PASS |
| `9618_s22_qp_11-q6-pci` | 9618_s22_qp_11 p. 14 | `(c)(i)` | p. 14 | PASS |
| `9618_s22_qp_11-q6-pcii` | 9618_s22_qp_11 p. 14 | `(c)(ii)` | p. 14 | PASS |
| `9618_w22_qp_11-q1-pdii` | 9618_w22_qp_11 p. 3 | `(d)(ii)` | p. 3 | PASS |
| `9618_w22_qp_11-q6-pbi` | 9618_w22_qp_11 p. 16 | `(b)(i)` | p. 16 | PASS |
| `9618_w22_qp_11-q6-pbii` | 9618_w22_qp_11 p. 16 | `(b)(ii)` | p. 16 | PASS |
| `9618_w22_qp_12-q8-pci` | 9618_w22_qp_12 p. 16 | `(c)(i)` | p. 16 | PASS |
| `9618_w22_qp_12-q8-pcii` | 9618_w22_qp_12 p. 16 | `(c)(ii)` | p. 16 | PASS |
| `9618_w22_qp_13-q6-pbi` | 9618_w22_qp_13 p. 12 | `(b)(i)` | p. 12 | PASS |
| `9618_w22_qp_13-q6-pbii` | 9618_w22_qp_13 p. 13 | `(b)(ii)` | p. 13 | PASS |
| `9618_w22_qp_13-q6-pbiii` | 9618_w22_qp_13 p. 13 | `(b)(iii)` | p. 13 | PASS |

All 12 source IDs, PDF pages, part labels, question identifiers and transcript references agree; each transcript file SHA matches correction evidence. W22/13 Q6(b)(ii) and (b)(iii) both reside on QP p.13, which visibly prints `(ii)` and then `(iii)`. The `(b)(iii)` record uses the latter token, has the correct page and retains its v5 transcript hash.

## Index, hierarchy, unresolved and context checks

The question index has 266 unique rows: 52 question roots and 214 parts, with no dangling parent or question links and no hierarchy cycles. The 32 parent-container MS links marked `UNRESOLVED` match the register, each has indexed child rows, and no parent mark was inferred. All 188 marking items resolve to exactly one question/part target; the six whole-question rows carry no mark/condition allocation. All 104 visual dependencies resolve to the indexed MS source/page and 25 unique MS visual regions. The 88 visual-region IDs, render references, page references and relations resolve without dangling or cross-paper links. Thirteen context-required rows carry 53 explicit source/page references; every page reference resolves in `PAGE_INDEX`. Two named context cues are descriptive anchors accompanied by those page references, rather than visual-region IDs.

`PAGE_INDEX.jsonl`, `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `VISUAL_MANIFEST.json` and `UNRESOLVED.md` are byte-identical to v4 as declared in the semantic diff and independently rehashed. The unresolved file retains its v4 heading because its content is intentionally preserved; the v5 handoff/path defines the active version and its 32 entries were checked. This is informational and did not affect the A4 linkage result.

## A3 same-version comparison and disposition

I compared the frozen A3 v5 same-version evidence after A0's integrity audit passed. A3 handoff SHA-256: `a85c4bab71fa0343c64e40295923b9a387c5bd74593eace9f46d427dca4667b9`; A0 audit SHA-256: `766f3c8a02995f14ab706a909aa649ce0a1c977924b47ea856cac7d961058cd2`. Both independent reviews agree on the pinned B22-A2-v5 candidate, all 12 source PDFs/166 pages, the 22-page union, the corrected `(iii)` token and the 19/18/11/12/6/7/22/18/5 count semantics. Both report the two v4 metadata findings closed and no new issue in their respective scope. A3 recommendation remains **PASS_A3_ONLY**; A4 recommendation remains **PASS_A4_ONLY**. No batch acceptance is claimed.

There are **no new A4 findings**. The A9 independent B22 review and A0 batch decision are still outstanding. Evidence files: [A4 checks](./A4_CANDIDATE_REVIEW_CHECKS_V5.json), [source/render evidence](./SOURCE_RENDER_EVIDENCE_V5.json), [findings](./RETEST_FINDINGS_V5.json), [A3 comparison](./A3_V5_COMPARISON.json), [22-page contact sheet](./review_union_contact_sheet_v5.jpg).
