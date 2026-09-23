# B23 A9 batch retest v3

**Recommendation: PASS — A9 retest gate only.** This is not batch acceptance. A0 retains the final batch decision.

Frozen candidate: `B23-A2-v3`  
Handoff SHA-256: `dedc1f1b7c5377c5f055e0a29cd230cdd82128155e9025f2b4ba1547ca342f2b`  
Manifest SHA-256: `62d0a50e7e446d1bd36ac91a072e272298131e78f5b4e084437c69bea619765d`  
Reviewer: independent of A2/A3/A4 authors. Date: 2026-09-21.

## Gate results

| Gate / finding | Evidence-backed result | Basis |
|---|---|---|
| A9-B23-F01 | PASS | W23/11 QP p.16 Q9(a)[2]/(b)[3] and exact MS p.10 rows verified from independent source renders and current candidate links. |
| A9-B23-F02 | PASS | S23/11 QP p.13 whole Q6[5], exact MS p.9 row 6 and maximum verified; no child invented. |
| A9-B23-F03 | PASS | All ten former targets absent and current source-backed links resolve. Full graph has zero dangling/wrong-page relations, invalid dependencies or empty dependencies. |
| A9-B23-F04 | PASS | All 30 prior MS risk pages full-rendered and visually inspected; each has a region, dependencies and pending independent review status. Contact-sheet sweep covers all 157 source pages. |
| A9-B23-F05 | PASS | Fresh W23/13 QP p.13 original render visually compared with corrected derivative; Q9 opening and (a)(i) visible, no clipping. |
| Same-version A3 scope/context/source-risk | PASS — A3 gate only | A3 handoff `PASS_A3_RETEST_ONLY`, its A0 audit `pass=true`; hashes verified. |
| Same-version A4 linkage/marks | PASS — A4 gate only | A4 handoff `PASS`, all stated criteria PASS, A0 handoff-integrity audit pass; hashes verified. |
| A0 cross-reference | PASS — cross-reference only | `pass=true`; pinned hash verified. |
| A2 active-artifact integrity | PASS | Recomputed 364 active artifact hashes; no mismatch. |
| Original source integrity | PASS | All twelve PDF hashes/page counts match Stage 0; 157 total pages. |

## Independent checks

- Candidate contains 157 page records; 252 question/part rows (47 roots + 205 parts); 178 marking items; 95 visual regions; 28 unresolved hierarchy rows kept unresolved.
- All six QP indexed displayed-mark sums equal 75, matching the respective paper covers.
- All marking dependencies resolve to exact-page source regions; no dangling visual relations, wrong-page relations, invalid dependencies, or empty dependencies.
- 61/61 MS pages have PAGE_INDEX records. All 49 MS answer pages with indexed marking rows have regions. The remaining 12 nonanswer/cover/instruction/generic pages are recorded without a risk trigger. No corrected flagged risk page is marked `RENDERED_NO_RISK_TRIGGER`.
- Thirty mandatory MS risk pages have fresh full-size renders and were visually inspected. Five extra samples exercise formula/unit, circuit/truth-table, register-bit, and multi-page-context classes. Twelve contact sheets cover all 157 source pages.

The complete F01–F05 disposition, exact page evidence and limits are in [`FINDINGS_RETEST_V3.md`](FINDINGS_RETEST_V3.md). Hash-pinned reviewer/source/candidate inputs are in [`INPUT_MANIFEST_V3.json`](INPUT_MANIFEST_V3.json); machine checks are in [`A9_REVIEW_CHECKS_V3.json`](A9_REVIEW_CHECKS_V3.json), and render evidence hashes are in [`RENDER_MANIFEST_V3.json`](RENDER_MANIFEST_V3.json).

## Limits and handoff

Contact sheets were used as a completeness/omission sweep; they do not establish full-size visual inspection of all 157 pages. Full-size visual review covered all 30 required MS risk pages and the targeted F01/F02/F05 pages and five additional risk-class samples. No 2026 teaching coverage, all-answer correctness, translation, or lesson quality is certified. Candidate remains pending until A0 independently verifies this handoff and decides the batch gate. No corpus, source, tracker or app files were edited.
