# B23 source risk retest — A2-v2

Result: **PASS for the A3 B23-v1 findings retested here.** A9 batch review remains pending.

## Source identity and artifact version

The active manifest is `B23-A2-v2`, SHA-256 `f0db28c9eece9d82167674531491d9a7017cc85bfa6953d33cf20529d5de2ddb`. I recomputed every hash in its `active_artifact_hashes` map; all matched. The key active files are:

| Artifact | SHA-256 |
|---|---|
| `QUESTION_INDEX.jsonl` | `95f951e143928cdce303fae1276c030c2cd329d7b2ac1b886f3fe48e82280740` |
| `MARKING_INDEX.jsonl` | `7ee0c6fa301176dbafe2402e5a1288051d2c8833c733f980549fe04980f94c25` |
| `VISUAL_MANIFEST.json` | `87b7aaa8b0142e3e01737594b3c536dad860107cd3745f5cb93789ea3658eb63` |
| `VALIDATION_v2.json` | `70daf580e70219c4edc19895842af63be12a06d6800f01f8df9f0eec1926af41` |

All 12 original QP/MS PDF byte hashes and page counts independently match the Stage 0 baseline and v2 manifest. The counts are June MS 9/10/11 pages and QP 16/16/16; November MS 10/11/10 and QP 16/16/16; total 157. Local `697372-2026-syllabus.pdf` hash is `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`, matching the Stage 0 verified official 2026 v2 record.

I also rehashed the frozen v1 files under `versions/B23-A2-v1/`: manifest `59ef06c92111ad56e676670c83314a24fa97795b112c22f806de892935cb650b`, question index `c426c2def001e57cccf21d3017fc40fad7aedd79566b0a205fab7eecc89d4aec`, and visual manifest `e905c53cf63b6c7e81ad7659779d15a5ce5dee882653a634bb5c007498f301a0`; the v1 page and marking index hashes also match A4's frozen snapshot record. No v1 question-start or part IDs were lost in v2.

## Context and visual verification

- **W23/11 Q8(c)(iii), QP PDF pp14–15.** The original p14 instruction set supplies context; p15 displays the ACC bits and XOR input `B00100101`, with a one-mark prompt. The active part record links p14 context and references transcripts from both pages. Visual region `9618_w23_qp_11-p15-vr2` exists, points to QP p15, and relates to `9618_w23_qp_11-q8-pc-piii`. This matches syllabus §4.3, PDF p22.
- **W23/12 Q9(b), QP PDF pp14–15.** The original p14 prompt explicitly sends candidates to p15. Page 15 has the instruction listing, initial memory, ASCII values, trace grid, and visible `[4]`. The active record carries mark 4, context locator p15, and both transcript references. Visual region `9618_w23_qp_12-p15-vr2` exists and relates to Q9(b). This matches syllabus §4.2, PDF pp20–21.
- **W23/12 Q9(b), MS PDF p11.** The original page has the conditional shaded trace table. Region `9618_w23_ms_12-p11-vr2` exists and relates to Q9(b) and its marking-item ID. The marking record points to p11 and lists the visual region as a dependency. Its per-mark field remains null; no row-level allocation was added.
- **Prefix wording.** Original QP `9618_w23_qp_12`, p6, says “kibibyte” and “megabyte”. Original MS `9618_w23_ms_12`, p4, gives comparison alternatives matching these units. This remains aligned to syllabus §1.1, PDF p14.

The source renders were directly inspected for QP W23/11 p15, QP W23/12 p15 and MS W23/12 p11. Their regions remain pending independent review, as required.

## Context index note and reuse boundary

There is no separate `CONTEXT_INDEX` file listed in the v2 manifest or present in the batch folder. The relevant context records are embedded in `QUESTION_INDEX.jsonl` as `context_ref_or_null` and `prompt_transcript_refs`; the retested records expose the required p14/p15 relationships. This is consistent with the Stage 1 schema, which defines context on question/part records and does not require another index file.

The historical-source guardrail remains intact: 2023 sources are not 2026 coverage or frequency claims. A3 retest closes only the listed B23-v1 scope/context/visual findings against A2-v2. A9 still needs to review all batch evidence and independently sample visual regions before A0 accepts B23.
