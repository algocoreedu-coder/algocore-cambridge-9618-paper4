# A3 source-risk retest — B22 v3

**Recommendation: CHANGES_REQUIRED.** This retests the source-risk and scope classes in the previous A3 review. It is not batch acceptance. A4 same-version source/linkage retest and A9 independent review remain mandatory.

## Frozen inputs and method

- Active B22-A2-v3 manifest SHA-256: `65d10ac1ee2628360242b0484de7d3665e8685e8110e83c24a6cca48bb802893`; PAGE_INDEX `31b42155eef5130e861932088200f791bda40ebdfd9f2947f7513965ef6016e1`; QUESTION_INDEX `a9acd18247d130e7562d45967bf3d3db319d5c46b3f32476a5694de91df9f6bc`; MARKING_INDEX `bdb09a4a6a788ebfa6dc3dd47e1f393913a9ef2a181a780650cae80c4ba710df`; VISUAL_MANIFEST `c0a1e6324aa7016ebf055ad8b30331bf4e2b1098a35ae5c18f64819db2501c33`.
- Previous A3 context/scope review SHA-256: `e4b54330e63c19bab0f04a9c5ecb3a77f2978b4eb632ba0eb599ee2f4f8c277f`; prior scope flags `0d31c1536cabad2ffed188101e88ec30c70af792a466c89872a95a26eaec3581`; prior source-risk review `75bfbf33bfc6b7a4d239c1339653cc56dd867794669393151bca98f6c6b8341b`. Stage 0 scope authority `87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c` (2026 v2, sections 1–8).
- The 12 source PDFs match Stage 0 and B22-A2-v3 hashes and page counts (166 pages total). A0 validator structural result: PASS, `7eefe0474dceeddfc94e44f825d789aacea5f4ed4274243647b48f1b0f95abb0`; it does not validate semantic content.
- Direct source-render manifest `retest_v3_renders/SOURCE_RENDER_MANIFEST.json`, SHA-256 `5b7c8808e292013f23ec2d728fd53ed0f2b1b990f6abcaeedfaf25a6f09d21a0`: 69 manifest rows, 69 present PNGs, and all 69 PNG hashes recomputed successfully. The stale declared count (65) has been corrected to match the manifest's 69 rows before freezing this retest; source PDFs were not modified.

## Prior source and visual risk classes

| Prior risk class | Source locator and evidence | Current result |
|---|---|---|
| A3-B22-R01 — cross-page prompt context | `9618_w22_qp_11` Q4 PDF pp.6–8; `9618_w22_qp_12` Q7 pp.10–14. Current records: six Q4 parts depend on pp.6–8 and seven Q7 parts depend on pp.10–14; see `CONTEXT_SCOPE_FINDINGS_V3.json`. | **PASS for cited context repairs.** Cross-page context/dependency coverage matches source spans; this is not whole-batch acceptance. |
| A3-B22-R02 — displayed QP marks | Seven source-visible mismatches detailed in `CONTEXT_SCOPE_FINDINGS_V3.json`: S22/11 p8; S22/12 pp.4,7; W22/12 p16; W22/13 pp.11–12. Six source totals are 75; indexed totals 74, 71, 75, 75, 77, 72. A0 mark spot-check has 7 records. | **CHANGES_REQUIRED (Major).** Seven values remain incorrect; four paper totals fail reconciliation. A2 must correct from source and freeze a new candidate. |
| Circuit geometry and truth-table rows | `9618_s22_qp_13` PDF p14; `retest_v3_renders/9618_s22_qp_13-p14.png`, render SHA-256 `9382b236e52f523f80186082f9056ba6b100cfb70bfb627b45bc7ccbdbc73d46`. | **Sample PASS.** Source structure is legible in this sample; A9 review of all designated regions remains pending. |
| Sound units/table and file-size prompt | `9618_w22_qp_13` PDF p3; `retest_v3_renders/9618_w22_qp_13-p03.png`, render SHA-256 `2da59efb2534af10ec3578b3ad915fcc5cce32f6d65bf7a654e5bbb4f46febc6`. | **Sample PASS with scope boundary.** Table/prompt are legible. S01 arithmetic boundary remains open for the Lead label decision; see `SCOPE_FLAGS_RETEST_V3.json`. A9 review pending. |
| Processor instruction/register and binary rows | `9618_s22_qp_12` PDF p5; `retest_v3_renders/9618_s22_qp_12-p05.png`, render SHA-256 `bc81a719379f1c6a5de691b4f708d00b26dc64951f3f5c657c0003a4e3e5e16e`. | **Sample PASS.** Visible rows are legible; A9 review pending. |
| MS matching table with mark column | `9618_w22_ms_12` PDF p3; `retest_v3_renders/9618_w22_ms_12-p03.png`, render SHA-256 `7301e9e87e9f75c6b602161257e14f1b5808969322013a87db99269d4e9e75e2`. | **Sample PASS.** Table and mark column are legible; A9 review pending. |
| MS table with shaded truth rows | `9618_s22_ms_12` PDF p8; `retest_v3_renders/9618_s22_ms_12-p08.png`, render SHA-256 `0f3b7ef7cb27579e1682645021ce64f90ab36d6060bdc7db80de25ea45a010cd`. | **Sample PASS.** Table/shading remain visible; A9 review pending. |
| MS nested-locator text extraction exception | `9618_s22_ms_13` PDF p7, label `5(b)(iii)`; `retest_v3_renders/9618_s22_ms_13-p07.png`, render SHA-256 `17dbe5de9e7ce50d3c3d2715852fe28c1ac3d3d8c364afee1141d1551187cd10`. | **Sample PASS.** The printed label is visually confirmed against the source despite text-layer extraction mismatch. |
| Nested-child QP page-locator risk | 12 records in `CONTEXT_SCOPE_FINDINGS_V3.json`: S22/11 pp.5,14; W22/11 pp.3,16; W22/12 p16; W22/13 pp.12–13. Frozen A0 source check lists all 12. | **CHANGES_REQUIRED (Major).** Candidate locators point to preceding pages; correct and retest in the next A2 candidate. |
| Visual manifest/page status/dependencies | 88 visual regions, 88 render files; 104 dependencies resolve to matching MS source/page; PAGE_INDEX statuses synchronized with no contradictions. Statuses: 64 `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`, 24 `RENDERED_PENDING_INDEPENDENT_REVIEW`. | **Structural checks PASS; visual gate OPEN.** A3 did not independently review all 88 regions. A9 must review all designated visual regions/risk classes. |
| Unflagged text-only page | Prior A3 review reserved this sample for A9; no page is claimed as sampled by A3 here. | **OPEN for A9.** A9 must select and record an unflagged text-only page. |

## Scope disposition

Current scope retest is **PASS_WITH_BOUNDARY** against the Cambridge 9618 2026 v2 syllabus, sections 1–8. No confirmed out-of-scope prompt was found among the 52 historical question records, and all historical items remain retained. S01 (`9618_w22_qp_13`, Q1(b), PDF p3) remains supporting arithmetic relative to §1.2 Sound at syllabus PDF p15. The Lead owns the later VI/EN teaching-label decision. See `SCOPE_FLAGS_RETEST_V3.json` for exact locators, evidence hash, and disposition. This is not teaching-coverage/frequency validation.

## Gate

The cited context repairs and sampled visual structures are source-supported. The candidate still has seven displayed-mark discrepancies and 12 QP child-locator errors, so the recommendation remains **CHANGES_REQUIRED**. A4 must retest corrected source/linkage fields on one frozen candidate version. A9 must independently inspect the full visual risk set and record the unflagged text-only sample before batch acceptance.
