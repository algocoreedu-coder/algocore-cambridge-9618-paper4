# B23 A3 context and scope retest — A2-v2

Task: `P1-S1-A3-B23-RETEST-V2`  
Result: **PASS for the A3 B23-v1 flags against A2-v2**  
Batch gate: **OPEN; A9 independent batch review is still required.**

## Frozen inputs and integrity

I compared active `B23-A2-v2` with the read-only `versions/B23-A2-v1/` snapshot and the original QP/MS PDFs. The SHA-256 of active `BATCH_MANIFEST.json` recomputes to `f0db28c9eece9d82167674531491d9a7017cc85bfa6953d33cf20529d5de2ddb`. Every active hash listed in `BATCH_MANIFEST.json` was recomputed and matched, including `QUESTION_INDEX.jsonl` (`95f951e143928cdce303fae1276c030c2cd329d7b2ac1b886f3fe48e82280740`), `MARKING_INDEX.jsonl` (`7ee0c6fa301176dbafe2402e5a1288051d2c8833c733f980549fe04980f94c25`), and `VISUAL_MANIFEST.json` (`87b7aaa8b0142e3e01737594b3c536dad860107cd3745f5cb93789ea3658eb63`). The 2026 syllabus local SHA-256 recomputes to `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`, matching Stage 0's record of the official 2026 v2 syllabus.

I independently recomputed each of the 12 original source hashes and opened each PDF to count pages. All matched both Stage 0 and active A2-v2:

| Session | MS pages (11 / 12 / 13) | QP pages (11 / 12 / 13) |
|---|---:|---:|
| May/June 2023 | 9 / 10 / 11 | 16 / 16 / 16 |
| Oct/Nov 2023 | 10 / 11 / 10 | 16 / 16 / 16 |

Total: 12 source PDFs and 157 pages. The frozen v1 `BATCH_MANIFEST.json`, `PAGE_INDEX.jsonl`, `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, and `VISUAL_MANIFEST.json` hashes also match A4's recorded v1 inputs and A3-v1's original frozen inputs. The active A2 manifest contains context fields inside `QUESTION_INDEX.jsonl`; no separate context-index file is listed in the manifest or present in this batch folder. I retested those embedded context references.

## No-question-loss check

The 46 question-start IDs are identical between frozen v1 and active v2. Every one of the 197 v1 part IDs remains in v2; v2 adds six explicit inline subparts and removes no question or part IDs. The active manifest reports 46 question starts, 203 part records, 175 exact MS locator records, 28 unresolved structural parents, and 64 visual regions. These counts are consistent with the v2 indexes and revision notes. The 28 parent records remain explicitly unresolved; they are not treated as missing questions.

## Retest of the A3 flags

| Flag | Result | Independent evidence checked |
|---|---|---|
| `B23-SCOPE-01` historical-source guardrail | **PASS — retained** | A2-v2 still describes source-location extraction only. It does not make 2026 coverage or frequency claims. The syllabus remains 2026 v2 §§1–8, PDF pp14–27. The 2023 provenance stays on the source records. |
| `B23-SCOPE-02` prefix wording | **PASS** | Original `9618_w23_qp_12`, PDF p6, retains “kibibyte” and “megabyte.” Original `9618_w23_ms_12`, PDF p4, gives alternatives comparing 1,024 bytes with 1,000 kilobytes / 1,000,000 bytes or comparing binary with denary prefixes. Syllabus §1.1, PDF p14, covers binary/decimal prefixes, including kibi and mega. |
| `B23-VIS-01` W23/11 Q8(c)(iii) | **PASS** | The original QP p15 shows the eight boxed ACC bits and `XOR B00100101`; the QP p14 instruction-set context is linked. Record `9618_w23_qp_11-q8-pc-piii` references both p14 and p15 transcripts. Visual region `9618_w23_qp_11-p15-vr2` points to p15, exists on disk, and `relates_to_ids` contains that exact part ID. This is within §4.3, PDF p22 (XOR bitwise operation). |
| `B23-CTX-01` W23/12 Q9(b) context | **PASS** | Original QP p14 states that initial memory and ASCII values are on p15. Original p15 shows the instructions, memory values, ASCII values, trace grid, and visible `[4]`. Record `9618_w23_qp_12-q9-pb` retains primary locator p14, mark 4, context locator p15, and both p14/p15 transcript refs. Visual region `9618_w23_qp_12-p15-vr2` exists and relates to that record. The content aligns with §4.2, PDF pp20–21. |
| `B23-VIS-02` W23/12 Q9(b) visual context | **PASS** | The QP p15 region covers the full instruction/memory/ASCII/trace layout and links to Q9(b). The linked MS source is `9618_w23_ms_12`, p11; visual region `9618_w23_ms_12-p11-vr2` exists and relates to both Q9(b) and its marking-item record. The marking item lists that visual dependency and leaves mark allocation null. I inspected the original-source renders for QP p15 and MS p11. |

The three newly added regions remain marked `SELF_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`. This retest verifies page identity, references, marks shown on the QP, item relations, and the visible source tables; it does not accept the visual regions for the batch.

## Gate disposition

All A3 B23-v1 flags pass retest against the exact active A2-v2 version. **A3 retest status is PASS.** A9 must still review the same frozen A2-v2 plus A3-v2/A4-v2 evidence and independently sample the visual records before A0 can close the B23 batch gate. No lesson coverage or marking-point claim is made here.
