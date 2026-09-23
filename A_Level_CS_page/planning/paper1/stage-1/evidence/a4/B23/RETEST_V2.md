# A4 retest — B23 A2-v2

Task: `P1-S1-A4-B23-RETEST`  
Artifact version: `B23-A4-RETEST-v2`  
A4 retest result: **PASS**  
B23 batch gate: **OPEN — A3-v2 handoff and A9 review still required**.

The three findings from `B23-A4-v1` are corrected in the active `B23-A2-v2` artifacts. This is an A4 retest of those corrections and the A3 flags; it is not a batch acceptance decision.

## Inputs and integrity

I read the active B23-A2-v2 files and the frozen v1 snapshot, then recomputed their hashes. The v2 batch manifest SHA-256 is `f0db28c9eece9d82167674531491d9a7017cc85bfa6953d33cf20529d5de2ddb`. Its active index hashes match the manifest's `active_artifact_hashes`: `PAGE_INDEX.jsonl` `29f9c15371387535d9d20461579c5367a3dfffd2a29589b2da3b30d7e54f5c55`; `QUESTION_INDEX.jsonl` `95f951e143928cdce303fae1276c030c2cd329d7b2ac1b886f3fe48e82280740`; `MARKING_INDEX.jsonl` `7ee0c6fa301176dbafe2402e5a1288051d2c8833c733f980549fe04980f94c25`; `VISUAL_MANIFEST.json` `87b7aaa8b0142e3e01737594b3c536dad860107cd3745f5cb93789ea3658eb63`. The remaining active hashes are recorded in `RETEST_FINDINGS_V2.json`.

All 12 current source PDFs were independently hashed and opened for page counts. Each matches both Stage 0 and B23-A2-v2; the 157 pages agree. The frozen v1 manifest/index hashes match the versions used by A4's original findings. B23-A2-v2 also records the same A3 context review and A4 findings hashes used for this retest.

## Prior A4 findings

**A4-B23-F01 — PASS.** All 28 original parent records remain in the question index as `UNRESOLVED`, with a null MS locator and no marking-item record. The prior finding's 59 cited child labels are present under their QP parent IDs. All 175 currently `MS_LINKED` part records have an exact standalone label on the cited MS page; no false parent links or exact-label misses remain. Parent context is preserved separately from exact child links.

**A4-B23-F02 — PASS.** The six missing `(i)` children are present with the right QP parent, locator, displayed mark and exact MS label. Each has a marking-item location record with mark allocation left null. The six former parent records no longer carry those child marks. I inspected the six source-page renders and checked each cited MS transcript label.

**A4-B23-F03 — PASS.** `9618_w23_qp_12-q9-pb` retains QP p14 and references p15 as required context; its displayed mark is 4, visible on p15. `9618_w23_qp_12-q9-pb-mi-01` points to `9618_w23_ms_12` p11. The MS region `9618_w23_ms_12-p11-vr2` is related to the record and its `visual_dependency_refs`; the table reference identifies the whole shaded-row condition and leaves per-row allocation null. I inspected the p15 QP render and p11 MS render.

## A3 B23 flags

| Flag | Retest disposition |
|---|---|
| `B23-SCOPE-01` | Historical-source guardrail remains intact. A2-v2 is still source-location work and makes no 2026 coverage or frequency claim. A3's syllabus assessment is not replaced by this A4 retest. |
| `B23-SCOPE-02` | Verified in source text: QP p6 retains “kibibyte” and “megabyte”; MS p4 lists the corresponding comparison. No normalization was introduced. |
| `B23-VIS-01` | QP p15 region `9618_w23_qp_11-p15-vr2` exists, has its render, and relates to `9618_w23_qp_11-q8-pc-piii`. The part references p14 instruction-set context and both p14/p15 transcripts. I visually checked both renders. |
| `B23-CTX-01` | QP Q9(b) p14/p15 context is linked; the p15 region `9618_w23_qp_12-p15-vr2` relates to Q9(b), with both transcript references and the visible `[4]`. I visually checked p15. |
| `B23-VIS-02` | The same QP p15 region covers the required program, memory, ASCII and trace-table context for Q9(b). The linked MS p11 visual dependency is also present under F03. |

All three added regions remain `SELF_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`. A4 verified their source/page/item references and sampled renders; A9 still owns the independent visual and batch review.

## Gate handoff

A4 retest passes. The batch gate remains open because the current A3 B23 artifact is `B23-A3-v1`, whose frozen inputs are `B23-A2-v1`. The Stage 1 playbook requires A2/A3/A4 evidence for the same batch version before A9 batch review. A0 should obtain an A3-v2 handoff tied to the exact A2-v2 hashes above, then dispatch A9. This report makes no batch-pass claim and infers no marks or marking points.
