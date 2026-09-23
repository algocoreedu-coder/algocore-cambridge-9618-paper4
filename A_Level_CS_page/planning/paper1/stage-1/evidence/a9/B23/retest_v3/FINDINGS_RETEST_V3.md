# B23 A9 independent retest — findings v3

Task `P1-S1-A9-B23-RETEST-V3`; frozen candidate `B23-A2-v3`; reviewer independent of A2/A3/A4 authors. Date: 2026-09-21. Recommendation: **PASS (A9 retest only)**. A0 retains the batch decision. This report closes only frozen findings F01–F05 and associated integrity checks; it does not certify lesson content or teaching coverage.

## Finding dispositions

| Finding | Prior severity / owner | Source locator | Independent evidence and method | Retest |
|---|---|---|---|---|
| F01 | Major / A2 | W23/11 QP PDF p.16 Q9(a)[2], (b)[3]; paired MS PDF p.10 rows 9(a), 9(b) | Fresh source [`full_renders/9618_w23_qp_11-p16.png`](full_renders/9618_w23_qp_11-p16.png) SHA `b446fe660ef09291f61ce8b7b3264779ea848e881bbb892688ad3bbd76a74cbd` and [`full_renders/9618_w23_ms_11-p10.png`](full_renders/9618_w23_ms_11-p10.png) SHA `93d6de6c3c944e0d53bce304eada920ad33909f95914ad948df6efe5d0391424`; exact current IDs, marks and relations checked. | **PASS.** Q9 and both printed parts are present at original locators. [2]/[3] are represented once and link to the exact MS rows through the MS p.10 region. No omitted prompt or fabricated child found. |
| F02 | Major / A2 + A0 schema owner | S23/11 QP PDF p.13 whole Q6 [5]; paired MS PDF p.9 row 6 | Fresh source [`full_renders/9618_s23_qp_11-p13.png`](full_renders/9618_s23_qp_11-p13.png) SHA `8967125e806e25089fcff898f28fb78f5bdef9798151025857338118f9a5c0a4` and [`full_renders/9618_s23_ms_11-p09.png`](full_renders/9618_s23_ms_11-p09.png) SHA `fb9059efb0c9d50e4d5955662b461f0cea7586cf6ab1bdeb1bb4c9f53bf8e223`; question-level marking record and dependency checked. | **PASS.** Q6 carries whole-question [5], `part=null`, and maps to MS row 6 with condition “1 mark each to max 5.” No `(a)` child was invented. |
| F03 | Major / A2 | Ten former region-to-deleted-marking-item edges across S23/W23 MS pages | Exhaustive current-ID/relation/page/dependency comparison; all former pairs below. | **PASS.** All ten old targets are absent; regions remain and current links resolve to source-backed current exact-page marking items. Graph check: zero dangling or wrong-page relations and zero invalid/empty dependencies. |
| F04 | Major / A2 | All 30 formerly flagged MS risk pages; all 157 pages for batch sweep | Independently hashed/opened the twelve original PDFs, rendered each flagged page directly at 160 dpi, visually inspected all 30, and reviewed all twelve page contact sheets. | **PASS.** 30/30 pages have appropriate regions and dependencies and retain pending-independent-review status. All 49 answer pages have regions; all 61 MS pages have PAGE_INDEX records. No corrected risk page is marked `RENDERED_NO_RISK_TRIGGER`. |
| F05 | Minor / A2 | W23/13 QP PDF p.13 Q9 opening and (a)(i) | Fresh original [`full_renders/9618_w23_qp_13-p13.png`](full_renders/9618_w23_qp_13-p13.png) SHA `de8ca7ea603624987e60e122da5db04e87f971201b782216d451b7db08d051e6` (1323×1871) compared visually with corrected derivative `evidence/a2/B23/renders/9618_w23_qp_13-p13.png`, SHA `f0f5d1c0537818b8e1596eeeb6d0dcf28dbc0bca86913814bbfdb57ae542e0d3` (1241×1754). | **PASS.** Q9 opening and `(a)(i)` are visible in both full-page views; no clipping found. Resolution and dimensions differ, so this is visual content comparison, not pixel identity. |

## F03 — all ten former relation targets

| Source region | Deleted prior target | Current source-backed relation check | Result |
|---|---|---|---|
| `9618_s23_ms_11-p04-vr1` | `9618_s23_qp_11-q2-pa-mi-01` | Target absent; current exact-page links: `9618_s23_qp_11-q2-pa-pi-mi-01`, `9618_s23_qp_11-q2-pa-pii-mi-01`, `9618_s23_qp_11-q2-pb-pi-mi-01`, `9618_s23_qp_11-q2-pb-pii-mi-01` | PASS |
| `9618_s23_ms_11-p04-vr1` | `9618_s23_qp_11-q2-pb-mi-01` | Target absent; current exact-page links: `9618_s23_qp_11-q2-pa-pi-mi-01`, `9618_s23_qp_11-q2-pa-pii-mi-01`, `9618_s23_qp_11-q2-pb-pi-mi-01`, `9618_s23_qp_11-q2-pb-pii-mi-01` | PASS |
| `9618_s23_ms_11-p06-vr1` | `9618_s23_qp_11-q3-pd-mi-01` | Target absent; current exact-page links: `9618_s23_qp_11-q3-pc-mi-01`, `9618_s23_qp_11-q3-pd-pi-mi-01`, `9618_s23_qp_11-q3-pd-pii-mi-01`, `9618_s23_qp_11-q3-pd-piii-mi-01`, `9618_s23_qp_11-q3-pd-piv-mi-01`, `9618_s23_qp_11-q3-pd-pv-mi-01`, `9618_s23_qp_11-q3-pd-pvi-mi-01` | PASS |
| `9618_s23_ms_12-p04-vr1` | `9618_s23_qp_12-q2-pc-mi-01` | Target absent; current exact-page links: `9618_s23_qp_12-q2-pa-mi-01`, `9618_s23_qp_12-q2-pb-mi-01`, `9618_s23_qp_12-q2-pc-pi-mi-01` | PASS |
| `9618_s23_ms_13-p05-vr1` | `9618_s23_qp_13-q3-pc-mi-01` | Target absent; current exact-page links: `9618_s23_qp_13-q3-pa-mi-01`, `9618_s23_qp_13-q3-pb-mi-01`, `9618_s23_qp_13-q3-pc-pi-mi-01`, `9618_s23_qp_13-q3-pc-pii-mi-01` | PASS |
| `9618_w23_ms_11-p10-vr1` | `9618_w23_qp_11-q8-pb-mi-01` | Target absent; current exact-page links: `9618_w23_qp_11-q8-pa-mi-01`, `9618_w23_qp_11-q8-pb-pi-mi-01`, `9618_w23_qp_11-q8-pb-pii-mi-01`, `9618_w23_qp_11-q8-pb-piii-mi-01`, `9618_w23_qp_11-q8-pc-pi-mi-01`, `9618_w23_qp_11-q8-pc-pii-mi-01`, `9618_w23_qp_11-q8-pc-piii-mi-01`, `9618_w23_qp_11-q9-pa-mi-01`, `9618_w23_qp_11-q9-pb-mi-01` | PASS |
| `9618_w23_ms_11-p10-vr1` | `9618_w23_qp_11-q8-pc-mi-01` | Target absent; current exact-page links: `9618_w23_qp_11-q8-pa-mi-01`, `9618_w23_qp_11-q8-pb-pi-mi-01`, `9618_w23_qp_11-q8-pb-pii-mi-01`, `9618_w23_qp_11-q8-pb-piii-mi-01`, `9618_w23_qp_11-q8-pc-pi-mi-01`, `9618_w23_qp_11-q8-pc-pii-mi-01`, `9618_w23_qp_11-q8-pc-piii-mi-01`, `9618_w23_qp_11-q9-pa-mi-01`, `9618_w23_qp_11-q9-pb-mi-01` | PASS |
| `9618_w23_ms_12-p04-vr1` | `9618_w23_qp_12-q3-pb-mi-01` | Target absent; current exact-page links: `9618_w23_qp_12-q2-pb-mi-01`, `9618_w23_qp_12-q2-pc-mi-01`, `9618_w23_qp_12-q3-pa-mi-01`, `9618_w23_qp_12-q3-pb-pi-mi-01`, `9618_w23_qp_12-q3-pb-pii-mi-01`, `9618_w23_qp_12-q3-pb-piii-mi-01` | PASS |
| `9618_w23_ms_12-p07-vr1` | `9618_w23_qp_12-q7-pb-mi-01` | Target absent; current exact-page links: `9618_w23_qp_12-q6-pb-mi-01`, `9618_w23_qp_12-q6-pc-mi-01`, `9618_w23_qp_12-q7-pa-mi-01`, `9618_w23_qp_12-q7-pb-pi-mi-01` | PASS |
| `9618_w23_ms_13-p06-vr1` | `9618_w23_qp_13-q5-pb-mi-01` | Target absent; current exact-page links: `9618_w23_qp_13-q5-pa-mi-01`, `9618_w23_qp_13-q5-pb-pi-mi-01`, `9618_w23_qp_13-q5-pb-pii-mi-01`, `9618_w23_qp_13-q6-pa-mi-01` | PASS |

## F04 — all required full-size MS renders

Fresh direct source renders; all visually inspected at readable scale. The render manifest records source PDF hash, dimensions and render hash.

| Source PDF / page | Evidence render | SHA-256 | Retest note |
|---|---|---|---|
| `9618_s23_ms_11` p.3 | [`full_renders/9618_s23_ms_11-p03.png`](full_renders/9618_s23_ms_11-p03.png) | `e9373ebae59dbf8dbfc3c62592369182e3decbf2bae957856b8e3b9a0609a01f` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_11` p.7 | [`full_renders/9618_s23_ms_11-p07.png`](full_renders/9618_s23_ms_11-p07.png) | `602e58c7f75cd8dcc000c116f582bc0e06415041a90f1d5583c85a84c2e9f75e` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_11` p.8 | [`full_renders/9618_s23_ms_11-p08.png`](full_renders/9618_s23_ms_11-p08.png) | `1a9176c950df05931fc81b903e9cc753fceb58dc5a21b266e0e20082ac4d3134` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_12` p.3 | [`full_renders/9618_s23_ms_12-p03.png`](full_renders/9618_s23_ms_12-p03.png) | `8337e1848fa59a9d6fec437f6dd21c4faa52fc80dddcae218ed46058295bc766` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_12` p.7 | [`full_renders/9618_s23_ms_12-p07.png`](full_renders/9618_s23_ms_12-p07.png) | `c3dae7f60a0b7a0ee8f0d80210907d5ae0d80cf2784df93b5b8c9405d727bcac` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_12` p.8 | [`full_renders/9618_s23_ms_12-p08.png`](full_renders/9618_s23_ms_12-p08.png) | `69288fab4a2ccc245093904c547d3b66c65584b1bc44b8523052821bd2897e4f` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_12` p.9 | [`full_renders/9618_s23_ms_12-p09.png`](full_renders/9618_s23_ms_12-p09.png) | `e7c79d74328338803278a252259609dddb31002c5fe76ac37bf7667648ad1c4f` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_12` p.10 | [`full_renders/9618_s23_ms_12-p10.png`](full_renders/9618_s23_ms_12-p10.png) | `1bc0bba03afc53c9b78992d22709b959bb064f0882ac682a6b0cbbe9b57607e4` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_13` p.3 | [`full_renders/9618_s23_ms_13-p03.png`](full_renders/9618_s23_ms_13-p03.png) | `04bfd0882c03ba464daa69293a476a6a722da78ffdd9038e12bec7e26a0ab255` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_13` p.4 | [`full_renders/9618_s23_ms_13-p04.png`](full_renders/9618_s23_ms_13-p04.png) | `8d116bf5bb8349cb88c1c57b1d5f60f4a9abdabdcca069faeb9a21848ec2ed5e` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_13` p.7 | [`full_renders/9618_s23_ms_13-p07.png`](full_renders/9618_s23_ms_13-p07.png) | `72c58ed4ecb7562560b03774cc0365f90e3a37b60987ca62554e0094444dbdc2` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_13` p.8 | [`full_renders/9618_s23_ms_13-p08.png`](full_renders/9618_s23_ms_13-p08.png) | `30d04ee7cdac17f9fa89f43b906876ffa99da4d433cd81e0f86ba15cc2cdcf5f` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_13` p.9 | [`full_renders/9618_s23_ms_13-p09.png`](full_renders/9618_s23_ms_13-p09.png) | `53c3eac3abe8230eaa7072d87bf0dbe644fdff2012fa526a4408557e547392fa` | Inspected; correct region/status/dependencies |
| `9618_s23_ms_13` p.10 | [`full_renders/9618_s23_ms_13-p10.png`](full_renders/9618_s23_ms_13-p10.png) | `467b3b655336fce70e2b0c90fec33be3ed79449eb6e7865621c4e5f504796382` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_11` p.5 | [`full_renders/9618_w23_ms_11-p05.png`](full_renders/9618_w23_ms_11-p05.png) | `e709d46007eace44b17476c0f7eefb3a41e18a73e281ee39d8eeb6fcf67ab088` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_11` p.6 | [`full_renders/9618_w23_ms_11-p06.png`](full_renders/9618_w23_ms_11-p06.png) | `c99d9fce074d9fc5c41b102c30d54d4bd0430527ac21648b9662c2db3c056e7f` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_11` p.7 | [`full_renders/9618_w23_ms_11-p07.png`](full_renders/9618_w23_ms_11-p07.png) | `ad2f1e2c42c27b4f3a2476e8ec7058159aa2d16f93da997a6cf7ac2cc883185e` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_11` p.8 | [`full_renders/9618_w23_ms_11-p08.png`](full_renders/9618_w23_ms_11-p08.png) | `0871e480400ebe47d009e0f57ac099e2aaf7d85d53b1fbadebb3dc7d8135c1bb` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_11` p.9 | [`full_renders/9618_w23_ms_11-p09.png`](full_renders/9618_w23_ms_11-p09.png) | `0d55a7ee558eba65eb4cba3fac1aa9b5a663bc1d65d39b7430cceda48a257f8d` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_12` p.3 | [`full_renders/9618_w23_ms_12-p03.png`](full_renders/9618_w23_ms_12-p03.png) | `d0bbf10a1427e148c734e3af4485af64314d4e8e3a532820a6a40f790d85806d` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_12` p.6 | [`full_renders/9618_w23_ms_12-p06.png`](full_renders/9618_w23_ms_12-p06.png) | `5bceed0b345e96fce7ed69ff7db70ae9a58ea7e5306ca90c9f06d983df944737` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_12` p.9 | [`full_renders/9618_w23_ms_12-p09.png`](full_renders/9618_w23_ms_12-p09.png) | `0b9b855a3402e82aab46cc2103f4afa7c6bb6f01735e77a98097a6f0c454d4c5` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_12` p.10 | [`full_renders/9618_w23_ms_12-p10.png`](full_renders/9618_w23_ms_12-p10.png) | `9f87691616cc135188baaaed33faab11d5c5c8f01a58f212675a3a643342e68f` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_13` p.3 | [`full_renders/9618_w23_ms_13-p03.png`](full_renders/9618_w23_ms_13-p03.png) | `492d7024af92538e4461c020722b1001e8e06f8f07d7f14619a83f23efa58f98` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_13` p.4 | [`full_renders/9618_w23_ms_13-p04.png`](full_renders/9618_w23_ms_13-p04.png) | `ae03bdb681be3aad815467c79808b9becd554dd6c5515ef757fa6d7901fb8f2c` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_13` p.5 | [`full_renders/9618_w23_ms_13-p05.png`](full_renders/9618_w23_ms_13-p05.png) | `de528887c0edc0a993b698ca232d997681e6b94ac8a3e89a0822465cff22f976` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_13` p.7 | [`full_renders/9618_w23_ms_13-p07.png`](full_renders/9618_w23_ms_13-p07.png) | `b524859cc43a43f222ebb7283508557274408ca2a621f9a2c4aafa782afbad51` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_13` p.8 | [`full_renders/9618_w23_ms_13-p08.png`](full_renders/9618_w23_ms_13-p08.png) | `31eb814c97ec6f2d4c369b1b0522338bae38d4ba96ff4b57d3f4f02c744d7883` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_13` p.9 | [`full_renders/9618_w23_ms_13-p09.png`](full_renders/9618_w23_ms_13-p09.png) | `6784d2bef4918ae3f29508ce50295438cadd71afd6c366f9bea9386423ade990` | Inspected; correct region/status/dependencies |
| `9618_w23_ms_13` p.10 | [`full_renders/9618_w23_ms_13-p10.png`](full_renders/9618_w23_ms_13-p10.png) | `e734e605e4dc9350b555cd8b1fdb4c2d2e057470fcc038c6760cf3cb831c40d9` | Inspected; correct region/status/dependencies |

Five additional full-size samples cover risk classes: S23 QP11 p.3 formula/unit layout, S23 QP13 p.3 circuit/truth table, W23 QP11 p.15 register/bit matrix, and W23 QP12 pp.14–15 scenario context/continuation. They supplement the mandated 30-page MS review.

The 12 contact sheets cover all `157` PDF pages. This is a batch completeness/omission sweep using thumbnails, not a claim of full-scale semantic review of every page. Fresh renders/contact sheets and hashes are listed in [`RENDER_MANIFEST_V3.json`](RENDER_MANIFEST_V3.json).

## Evidence boundaries

- Source set: 12 B23 QP/MS PDFs, 61 MS pages + 96 QP pages = 157 pages; actual hashes and page counts match Stage 0.
- Candidate counts: 157 pages, 47 roots, 205 parts (252 question/part rows), 178 marking items, 95 visual regions, and 28 unresolved hierarchy records. Unresolved records remain unresolved; no parent relation was inferred.
- Explicit QP displayed marks total 75 for each of six papers and match paired QP/MS cover totals.
- Recomputed 364/364 active candidate artifact hashes match the candidate manifest. Same-version A3/A4 gates and A0 audits are hash-pinned in [`INPUT_MANIFEST_V3.json`](INPUT_MANIFEST_V3.json); their PASS statuses are limited to their own criteria.
- No answer recalculation, lesson authoring, translation audit, syllabus teaching-coverage certification, batch acceptance, merge or app edit is claimed. A0 must independently audit this handoff and make the batch decision.
