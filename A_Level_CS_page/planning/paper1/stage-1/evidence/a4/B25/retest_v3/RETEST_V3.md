# B25 A4 v3 independent retest

**Recommendation: PASS_A4_ONLY.** This is the A4 specialist gate for exact candidate `B25-A2-v3`. It does not accept the batch. A9-v3 review and A0 audit/decision remain required.

## Frozen identity

The work order SHA-256 is `903445b487b41080dcc02360432b53b7cefeb0c150f44c5fd040496fe30eef97`. All 27/27 frozen pins passed, all 450/450 candidate snapshot entries matched, and all 12 authoritative 2025 source PDFs (178 pages) matched Stage 0 hashes and page counts. Candidate v3 remained read-only. See `INPUT_PINS_V3.json`, `INPUT_VERIFICATION_V3.json`, and `SOURCE_PDF_HASHES_V3.json`.

## Results

- **frozen input pins:** PASS — 27/27 pins.
- **candidate snapshot:** PASS — 450/450 entries.
- **authoritative sources:** PASS — 12 PDFs / 178 pages.
- **eight corrected source rows:** PASS — 8/8 direct rows; 0 failures.
- **all marking targets:** PASS — 183/183 links, 3 whole-question + 180 part.
- **all marking locators:** PASS — 183 locator checks; 0 errors.
- **all transcript refs:** PASS — 183 transcript references; 0 errors.
- **all visual dependencies:** PASS — all refs and original render hashes resolve.
- **terminal generic header scan:** PASS — 0 of 183 excerpts end in generic header.
- **structure unchanged:** PASS — indexes, contexts and visual relations unchanged from v2.
- **parent hierarchy:** PASS — 27/27 groups; no synthetic parent marks.
- **six paper totals:** PASS — all six QP covers and indexed totals equal 75.

All 183 marking items were independently checked: 3 whole-question targets and 180 part targets. The exact target, source-component, MS-page, transcript-file, visual-region and rendered-asset references resolve. The complete marking text scan found no terminal generic `Question / Answer / Marks` header. The 175 unaffected marking rows remain byte-identical to v2; each of the eight corrected rows changes only its marking text and equals the v2 excerpt with only that unrelated trailing header removed.

The 27 parent groups retain null parent marks/locators and have no parent-targeted marking item. All six original QP covers state 75, and the candidate index and mark-total checks also sum to 75 for each. Question/page indexes, contexts, visual-region records and full-page render manifest match v2 exactly.

## A9-B25-MS-01 source-row retest

All eight cited original mark-scheme pages were directly rendered and visually inspected. Each cited row ends at its displayed mark; the following generic header is a separate table header and is absent from the corrected candidate excerpt.

| Marking record | Original MS page | Table row | Result | Direct render |
|---|---|---|---|---|
| `9618_w25_qp_12-q1-mi-1` | `9618_w25_ms_12` p.4 | `1` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_12-p004.png` |
| `9618_w25_qp_12-q2-pb-mi-1` | `9618_w25_ms_12` p.5 | `2(b)` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_12-p005.png` |
| `9618_w25_qp_12-q5-pe-mi-1` | `9618_w25_ms_12` p.8 | `5(e)` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_12-p008.png` |
| `9618_w25_qp_12-q6-pd-mi-1` | `9618_w25_ms_12` p.9 | `6(d)` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_12-p009.png` |
| `9618_w25_qp_12-q8-pb-pii-mi-1` | `9618_w25_ms_12` p.10 | `8(b)(ii)` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_12-p010.png` |
| `9618_w25_qp_12-q9-pb-mi-1` | `9618_w25_ms_12` p.11 | `9(b)` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_12-p011.png` |
| `9618_w25_qp_12-q10-pc-mi-1` | `9618_w25_ms_12` p.11 | `10(c)` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_12-p011.png` |
| `9618_w25_qp_13-q3-pb-mi-1` | `9618_w25_ms_13` p.6 | `3(b)` | PASS | `evidence/a4/B25/retest_v3/source_renders/9618_w25_ms_13-p006.png` |

## Visual evidence and limits

`SOURCE_RENDER_MANIFEST_V3.json` records 19 hashed original-page renders at 144 dpi: seven unique corrected MS boundary pages, all six QP cover pages, and six risk-focused QP samples covering S25/W25 components 11/12/13. Full-size images and contact sheets are in `source_renders/` and `contact_sheets/`; `DIRECT_SOURCE_TEXT_V3.txt` is corroborating extracted text, not a substitute for the visual review.

This retest closes the A9 marking-row boundary finding for the frozen v3 candidate at the A4 specialist gate. It does not replace A9-v3 review, the A0 handoff audit or the A0 batch decision.
