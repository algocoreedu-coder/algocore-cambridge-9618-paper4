# A0 dispatch — B21 A2 v4 visual-coverage correction

Date: 2026-09-21. Task: `P1-S1-A2-B21-V4`. Owner: A2 source curator from another batch, independent of B21 A3/A4/A9 reviewers. State: DISPATCHED.

## Frozen inputs and write boundary

- Correct frozen candidate `B21-A2-v3`: its active root files in `evidence/a2/B21/` are pinned by A2 `HANDOFF_CHECK.json` SHA256 `d2b63bc8244912c59073a5f4c5489133f60a0fd967b0e768a8fe8512d188ca0` and batch manifest SHA256 `e759722afa93e23d764a5dc6b22bfa682448d5d8c0c77b538e80a1d1e08515e8`. Historical v1/v2 snapshots are preserved. There is not currently a separate v3 snapshot directory: read the hash-pinned active root read-only, never change it, and write v4 only to `versions/B21-A2-v4/`.
- Required finding: A9 `evidence/a9/B21/FINDINGS.md` SHA256 `f514e1a7e40ed0c359dbaca2262969788fa4d060772ac0324234f032ee28c6b6`; review SHA256 `0604695e57500e5b945beeffa952706a8638752f256db406037e853b4b926ab7`; A9 validator SHA256 `3e3a3031a22c2f0e2029a16929e756498ca3b0bc40b39d3bcb61959bb09e72a3`.
- Read-only sources: the 12 B21 QP/MS PDFs in Stage 0 `SOURCE_MANIFEST.json`, SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`.
- Policy: Stage 1 `EXTRACTION_POLICY.md` §3 and §6, schema v1.1, and the A9 finding above.
- Write allowlist: only a new immutable `evidence/a2/B21/versions/B21-A2-v4/` packet. Do not overwrite or edit v1/v2/v3 snapshots, original PDFs, A0 trackers, reviewer evidence, another batch, app, lesson, or translation. If a new version folder already exists, stop and notify A0.

## Required correction

A9's full 154-page source sweep identified 16 risk pages missing from the current 61-region visual manifest. Add source-backed visual regions and direct original-page renders for all 16. The render assets must include source ID, original PDF SHA256, PDF page, render method, and their own SHA256. Update page visual status and dependencies to the current schema; do not mark a page or item independently reviewed by A3/A4/A9.

| Source / PDF page | Printed structure | Required indexed target(s) |
|---|---:|---|
| `9618_s21_ms_11` p4 | Q2(a) matching boxes/lines | `9618_s21_qp_11-q2-pa-mi-1` |
| `9618_s21_ms_11` p5 | Q3(b) shaded CPU/memory trace matrix | `9618_s21_qp_11-q3-pb-mi-1` |
| `9618_s21_ms_11` p6 | Q3(c)(i) aligned eight-bit row | `9618_s21_qp_11-q3-pc-pi-mi-1` |
| `9618_s21_ms_12` p5 | Q3(a) gate circuit and Q3(b) shaded truth table | `9618_s21_qp_12-q3-pa-mi-1`; `9618_s21_qp_12-q3-pb-mi-1` |
| `9618_s21_ms_13` p4 | Q2(a) matching boxes/lines | `9618_s21_qp_13-q2-pa-mi-1` |
| `9618_s21_ms_13` p5 | Q3(b) shaded CPU/memory trace matrix | `9618_s21_qp_13-q3-pb-mi-1` |
| `9618_s21_ms_13` p6 | Q3(c)(i) aligned eight-bit row | `9618_s21_qp_13-q3-pc-pi-mi-1` |
| `9618_w21_ms_11` p3 | Q1(a) binary-unit matching diagram/table | `9618_w21_qp_11-q1-pa-mi-1` |
| `9618_w21_ms_11` p8 | Q6(b) current ACC/instruction/new ACC matrix | `9618_w21_qp_11-q6-pb-mi-1` |
| `9618_w21_ms_12` p8 | Q7(a) hardware/software interrupt classification table | `9618_w21_qp_12-q7-pa-mi-1` |
| `9618_w21_ms_13` p3 | Q1(a) binary-unit matching diagram/table | `9618_w21_qp_13-q1-pa-mi-1` |
| `9618_w21_ms_13` p8 | Q6(b) current ACC/instruction/new ACC matrix | `9618_w21_qp_13-q6-pb-mi-1` |
| `9618_s21_qp_12` p2 | Q1(a) Term/Definition/example table | `9618_s21_qp_12-q1-pa` |
| `9618_w21_qp_12` p2 | Q1 matching measures to Data Security/Data Integrity boxes | `9618_w21_qp_12-q1` |
| `9618_w21_qp_12` p6 | Q4 aligned register number/bit cells | `9618_w21_qp_12-q4` |
| `9618_w21_qp_12` p12 | Q7(a) event × interrupt classification table | `9618_w21_qp_12-q7-pa` |

The twelve MS marking rows listed above currently have empty `visual_dependency_refs`; add a dependency only where the page visibly supports that exact row. For uncertain row-to-region association, record a precise unresolved relation; never infer marking allocation from the picture. The four QP pages need a page-level region related to the listed QP target. Recheck all six original QPs/MSs for any additional page omitted by the A9 sweep, and document the check result. Preserve all existing findings resolved in v3, including Q7/Q8, locators, displayed marks, parent context and whole-question targets.

## Outputs, acceptance and reviewers

Deliver a complete v4 packet in the version folder: `BATCH_MANIFEST.json`, `PAGE_INDEX.jsonl`, `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `CONTEXT_INDEX.jsonl`, `VISUAL_MANIFEST.json`, `EXTRACTION_QA.md`, `UNRESOLVED.md`, `REVISION_NOTES.md`, source render assets/manifests, and `HANDOFF_CHECK.json`. Version every render to the original source hash/page. Run the Stage 1 schema validator on the immutable v4 folder and freeze hashes for all declared output files; include A9-VIS-01 disposition row by row. Do not edit the active v3 folder to make the validator pass.

Acceptance for this work order: all 16 missing source pages have visual-region records and hashed source renders; the 12 supported MS rows have resolving dependencies or evidence-backed unresolved relations; all affected page statuses agree with the manifest; no dangling region/target/dependency references; source hashes/page counts still match Stage 0; validator PASS; all previous A3/A4 v3 repairs remain intact; v4 handoff and artifact hashes recompute exactly.

After handoff, A0 reruns source/hash/schema validation. Then independent A3 and A4 retest this exact v4. A9 retests the visual finding only after both same-version gates; A0 alone closes the batch. Stop after v4 handoff and do not mark B21 accepted.
