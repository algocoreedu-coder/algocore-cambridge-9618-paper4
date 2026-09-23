# B21 A9 findings — frozen v3

## A9-B21-VIS-01 — Required visual-risk pages are absent from the corpus

- **Severity:** Major
- **Status:** OPEN — batch gate blocker
- **Owner:** A2-B21 via A0
- **Retest:** A2 publishes a new immutable version with source-backed visual records; A3 and A4 retest that exact version; A9 retests the frozen handoff.

**Policy:** Stage 1 `EXTRACTION_POLICY.md` §3 requires rendering every page with a diagram, circuit, truth table, table, formula, layout-dependent prompt, answer matrix, or conditional MS table. §6 requires context/dependencies to remain linked. The Stage 1 schema requires a page-level `visual_region` for such evidence and marking-level `visual_dependency_refs` where a marking row depends on that structure.

**Evidence:** I rendered all 154 original pages and compared the source sweep against the frozen `VISUAL_MANIFEST.json`. The following **16 pages** visibly contain required non-text/layout evidence but have no `(source_id, pdf_page_1_based)` region in the current 61-region manifest. Their PAGE_INDEX rows remain `TEXT_OR_RENDER_PENDING_REVIEW`. For every MS locator below, the corresponding active `MARKING_INDEX` row has an empty `visual_dependency_refs` list. Full-page original-source renders are under `renders/unflagged-risk-source/`; they are not copied from another reviewer.

| Original source locator | Visible evidence / indexed item | Missing target or marking row | A9 source render / SHA256 |
|---|---|---|---|
| `9618_s21_ms_11` PDF p4 | Q2(a), “1 mark for each correct line”; matching boxes/lines | `9618_s21_qp_11-q2-pa-mi-1` | `renders/unflagged-risk-source/9618_s21_ms_11-p4.png` — `f5192567901423af77882dbe563fd5fe03d5f53fe0bbbfa797e90e03637b0278` |
| `9618_s21_ms_11` PDF p5 | Q3(b), shaded CPU/memory trace matrix | `9618_s21_qp_11-q3-pb-mi-1` | `renders/unflagged-risk-source/9618_s21_ms_11-p5.png` — `c04851af816bf4a6a1853fa1c7c094d72d71b8159ea79d826991a3aeb70ec4cf` |
| `9618_s21_ms_11` PDF p6 | Q3(c)(i), aligned eight-bit row; page continues Q4 | `9618_s21_qp_11-q3-pc-pi-mi-1` | `renders/unflagged-risk-source/9618_s21_ms_11-p6.png` — `14bf062e806802e1a97e6cd05f40f0161b5443802b5fad3f6080cfd18c1f0306` |
| `9618_s21_ms_12` PDF p5 | Q3(a) gate circuit and Q3(b) shaded truth table | `9618_s21_qp_12-q3-pa-mi-1`, `9618_s21_qp_12-q3-pb-mi-1` | `renders/unflagged-risk-source/9618_s21_ms_12-p5.png` — `a3adf2a7e83c4445b8f1dca67f187344f792d4ccc687b10b58a9fbbe1701a5b7` |
| `9618_s21_ms_13` PDF p4 | Q2(a), matching boxes/lines | `9618_s21_qp_13-q2-pa-mi-1` | `renders/unflagged-risk-source/9618_s21_ms_13-p4.png` — `fa1b56b0c110ef0397696938a277b91262b10fa3558034254ae6306ea144a6e7` |
| `9618_s21_ms_13` PDF p5 | Q3(b), shaded CPU/memory trace matrix | `9618_s21_qp_13-q3-pb-mi-1` | `renders/unflagged-risk-source/9618_s21_ms_13-p5.png` — `097de89df29506171e76266d9a02d3e449467888068c7e55d5067777ec1939e1` |
| `9618_s21_ms_13` PDF p6 | Q3(c)(i), aligned eight-bit row; page continues Q4 | `9618_s21_qp_13-q3-pc-pi-mi-1` | `renders/unflagged-risk-source/9618_s21_ms_13-p6.png` — `26ed0ee6a3cedc7ed4223165d60ec609afc82d5ae6be472adaea272b7dd0ee78` |
| `9618_w21_ms_11` PDF p3 | Q1(a), binary-unit matching diagram/table | `9618_w21_qp_11-q1-pa-mi-1` | `renders/unflagged-risk-source/9618_w21_ms_11-p3.png` — `3cbb81278a0863b4b05f4c7f5270a83e13a6b3c75f28171aa4741a5aee417241` |
| `9618_w21_ms_11` PDF p8 | Q6(b), current ACC / instruction / new ACC matrix | `9618_w21_qp_11-q6-pb-mi-1` | `renders/unflagged-risk-source/9618_w21_ms_11-p8.png` — `1527196e06f6322c4aa89ed232dca11459e57d5144a0547f717161bdb8c508a8` |
| `9618_w21_ms_12` PDF p8 | Q7(a), hardware/software interrupt classification table | `9618_w21_qp_12-q7-pa-mi-1` | `renders/unflagged-risk-source/9618_w21_ms_12-p8.png` — `48ba5b07e96b9b3827f9f0bdb3a8eea4b5903931c4530d69f1fb6785fc36827e` |
| `9618_w21_ms_13` PDF p3 | Q1(a), binary-unit matching diagram/table | `9618_w21_qp_13-q1-pa-mi-1` | `renders/unflagged-risk-source/9618_w21_ms_13-p3.png` — `b948713c5e10839308376911e4d1c7ca84097444fea3db62c436fdca96edf65a` |
| `9618_w21_ms_13` PDF p8 | Q6(b), current ACC / instruction / new ACC matrix | `9618_w21_qp_13-q6-pb-mi-1` | `renders/unflagged-risk-source/9618_w21_ms_13-p8.png` — `707d458d281971495d942ae24c7391adc0ac497fbadfbb73e0b6579a31bf2e87` |
| `9618_s21_qp_12` PDF p2 | Q1(a), printed Term / Definition and example table | Question/part target: `9618_s21_qp_12-q1-pa` | `renders/unflagged-risk-source/9618_s21_qp_12-p2.png` — `a43861313787591101d31fc8bfb884c3fa9a63290365137cb64c06892af6d4f5` |
| `9618_w21_qp_12` PDF p2 | Q1, match five measures to Data Security / Data Integrity boxes | Question target: `9618_w21_qp_12-q1` | `renders/unflagged-risk-source/9618_w21_qp_12-p2.png` — `1e58355cc78678fd4e1cb83268837a1af51b1f5277255f9024184adcc366f79c` |
| `9618_w21_qp_12` PDF p6 | Q4(a–d), register number printed as aligned bit cells; layout-sensitive number prompt | Question target: `9618_w21_qp_12-q4` | `renders/unflagged-risk-source/9618_w21_qp_12-p6.png` — `425640a2acfd68c371038f5a4496c738611ab5eb044a2ef2c13c038ba4d3ad5a` |
| `9618_w21_qp_12` PDF p12 | Q7(a), event × hardware/software interrupt table | Part target: `9618_w21_qp_12-q7-pa` | `renders/unflagged-risk-source/9618_w21_qp_12-p12.png` — `3514ef39ecf4ee35f1af0b93cb827854b4103f46fd0e28659822640d4ce0814a` |

For the twelve MS pages above, the rows are already linked to the printed MS question/part but omit any visual dependency ref; the expected source visual is not rendered/indexed in the active visual manifest. This is distinct from the 34 intentionally unresolved parent-context rows, and must not be “fixed” by assigning marks or leaf targets based on appearance. The four QP pages are not risk-flagged at all.

**Prior finding relationship:** This independently confirms that `A4-B21-REC-03` (visual/table dependency coverage incomplete) was not closed by the targeted v3 Q7/Q8 repairs. A4-v3 reports 51 resolved dependency references and 61 current renders, but that check is not exhaustive page-risk coverage. The sample omitted structures above are directly visible in source PDFs. The old count `33/51` describes the v1 baseline only.

**Required correction and retest:** A2-B21 via A0 should add original-source renders and appropriately targeted regions for each risk page, map each region to source-supported indexed targets, and add MS `visual_dependency_refs` only where supported. Every page/region status must reflect whether rendered/inspected. Where the actual MS layout cannot support item-level association, preserve a specific unresolved relation; do not infer allocations. The new version must pass A0 schema/provenance validation and same-version A3/A4 source reviews before this A9 issue is retested.

## A9-B21-PROV-01 — Historic A3-v2 A4-report digest unavailable

- **Severity:** Minor, non-blocking historical provenance limit
- **Status:** OPEN under Stage 1 issue `S1-I14`; A0 remains owner.
- **Evidence:** `A3/B21/HANDOFF_RETEST_V2.json` records `a4_retest_report_sha256=f6f48f498317e4329867ff559c5161ff2dfd862c792678d0ae78dc9d56bb53a5`. The same-named retained file `A4/B21/RETEST_V2.md` hashes to `1f99b585b9f69ee5761330e4d88b68fc7dc60c8b15f86d8bdd3ef4e9d02ab361`. I recursively hashed 2,708 files under Stage 1 evidence; none has the historical digest. A3-v3 records the limitation and independently rechecked current source pages; its exact A2-v3 inputs and its current output hashes match.
- **Disposition/retest:** Keep the historical caveat visible in the Stage 1 master issue ledger and preserve exact hashes for new handoffs. Do not treat it as a B21 v3 content defect or as proof of source mismatch.


## Full-page contact-sheet evidence hashes

The A9 contact sheets render the indexed 61 pages and scan the other 93 original PDF pages. All hashes below were computed after rendering directly from the local originals named in Stage 0.

| Contact sheet | SHA256 |
|---|---|
| `renders/B21_visual_pages_01.png` | `058c688c391dfd2f6d4d6bb442c8706152bf18dbe473506e7b8b61daf65ff855` |
| `renders/B21_visual_pages_02.png` | `f066abc2f2e68ceefae880129f0156961655589d1b13b61e5f8ab38580062b5d` |
| `renders/B21_visual_pages_03.png` | `6388c1d4eef57ff6411f423a5934fb97b66c06a3b7afee12205283953eadff84` |
| `renders/B21_visual_pages_04.png` | `209ffed4716aae2dae77d72323f128ea4e5afc4ab6c9619d3f67e310f04da5c2` |
| `renders/B21_visual_pages_05.png` | `574fbce126d44be012aac5bd60b040d10ada35c593f3f0eda97fc5cbb901c15b` |
| `renders/B21_visual_pages_06.png` | `33005f00d4a421e174914e76564ca5f67708b3266b21ee3ed378abb89fb40c0a` |
| `renders/B21_unflagged_pages_01.png` | `a90d6066e502f2a84f9d5641af21204926536475fda11d0823d86052a334c203` |
| `renders/B21_unflagged_pages_02.png` | `e6d7ef9c3e6e7e3e946e6e0cb842839f2f76c5f3d8fbd880ecf82d965518d43f` |
| `renders/B21_unflagged_pages_03.png` | `fad363cd7105fa60067eeb0a5197d6a1bd2ea0d308a6e3ef275f6826dd5274c5` |
| `renders/B21_unflagged_pages_04.png` | `a2844b3fa367a46bc3c186cac5ee61739dec1def9d28b6b6d9e1b682055dc5af` |
| `renders/B21_unflagged_pages_05.png` | `8a68119314c91e8eb2d2b27819b549afb1294327debb51e00418a12bbc2ccf1c` |
| `renders/B21_unflagged_pages_06.png` | `4687f471c8cbe2ba0ada215168c4d36da6c11de45ba5fdb0b05558e25cadf823` |
| `renders/B21_unflagged_pages_07.png` | `72b7e9f6dfbbebbca22011e93a7be8e326f1c93d670039f987f2cb4e796751c0` |
| `renders/B21_unflagged_pages_08.png` | `d1caea7839a1647ea212d5363bbcb57e38eacea3421cc8f35a9730fd7db7d64c` |
