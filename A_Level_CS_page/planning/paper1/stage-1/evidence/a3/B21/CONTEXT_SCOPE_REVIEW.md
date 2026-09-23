# A3 source context and scope review — B21

Task: `P1-S1-A3-B21`  
Status: `SUBMITTED_REVIEW_PENDING_A9`  
Reviewer: A3, independent of the B21 A2 extractor  
Input: A2 artifact `0.1.0`; this review does not edit the A2 corpus.

## Sources and review basis

I reviewed the Stage 1 corpus schema and extraction policy, the Stage 0 source baseline and scope decision, the A2 B21 indexes and visual inventory, the A4 B21 review artifacts, and the original 2021 Paper 1 PDFs through the A2 source-linked page transcripts/renders. Scope authority is the local 2026 v2 syllabus, source ID `697372-2026-syllabus`, SHA-256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`; Stage 0 records this hash as matching the official downloaded copy. The relevant scope is syllabus sections 1–8, PDF pages 14–27, with page 27 limited to §8.3 before §9.

I independently recomputed SHA-256 for all 12 B21 source PDFs against both Stage 0 and the A2 manifest: 12/12 match. `pdfinfo` page counts also match 12/12, totaling 154 pages. The A2 v0.1.0 index has 48 question-start rows and 115 part rows. Those counts alone do not establish that each printed question and continuation page has a correct record.

## Scope observation

A topic-level review of the question starts and visible prompt text found topics consistent with one or more Paper 1 sections in the 2026 syllabus. Examples include bitmap representation/file size (`9618_s21_qp_11`, PDF p2; §1.2, syllabus PDF p15), processor registers in the fetch-execute cycle (`9618_s21_qp_11`, PDF p6; §4.1, PDF p19), databases and SQL (`9618_s21_qp_12`, PDF pp2–3; §8.1–8.3, PDF pp25–27), logic circuits (`9618_w21_qp_13`, PDF p4; §3.2, PDF p18), and sound sampling (`9618_w21_qp_13`, PDF p14; §1.2, PDF p15). I found no clearly out-of-scope prompt in this pass.

These are historical 2021 sources. Their presence does not establish 2026 teaching coverage, question frequency, equivalence between variants, or current marking guidance. Preserve every source question and variant. A lesson author must separately cite the applicable 2026 objective before reusing a prompt. The guardrail is recorded in `SCOPE_FLAGS.json`.

## Context and index findings

**Major — a question locator points to the wrong printed question and the actual Q1 is absent.** In both `9618_w21_qp_11` and `9618_w21_qp_13`, the original/transcript PDF p2 begins printed Question 1 on binary-unit equivalences, binary addition/overflow, and hexadecimal conversion. The A2 `QUESTION_INDEX.jsonl` contains no Q1 record at p2. Instead, record `...-q1` points to PDF p11, whose source heading is printed Question 6; record `...-q6` also points to p11. This makes one question identity false and leaves the actual printed Q1 unindexed. Do not infer any answer or syllabus status from the mistaken locator. See `A3-B21-CTX-01`.

**Major — continuation pages carrying prompt data are not referenced by the question/part records.** The index locators often stop at the question-start page. For example, `9618_s21_qp_11` Q1 starts on p2 and continues with the hexadecimal colour/binary addition on p3 and copyright prompt on p4; its indexed parts only point to p2. Q3 starts on p6, while its instruction set, memory/ASCII data, trace table, and bit-operation prompts occur on pp7–10; the index has no Q3 record locator on those pages. The same source content is present in `9618_s21_qp_13`. `9618_s21_qp_12` Q1 starts with the database schema on p2 and continues with the RENTAL example table and DDL on p3, which has no question/part locator. `9618_w21_qp_11` and `_13` Q6 start on p11 and continue with instruction definitions and binary-operation data on pp12–13; `9618_w21_qp_12` Q8 starts on p13 and continues on pp14–15. These pages carry information required to understand or answer the prompt. Generic `dependency_refs` to the parent question do not identify these page-level contexts. See `A3-B21-CTX-02`.

The observed context gaps overlap A4's Major nested-part hierarchy finding, but they are independently visible from source pages and index locators. A2 should preserve all historical subparts, their parent relationships, and page/context references in a new frozen batch version; A4 and A9 should retest the corrected records.

## Visual/source review

The A2 visual manifest contains 51 page regions; each listed render exists and remains marked pending independent review. I inspected representative original-page renders: `9618_s21_qp_11` PDF p2 preserves the bitmap prompt, table geometry, and displayed mark brackets; `9618_w21_qp_13` PDF p4 preserves the logic-circuit geometry and truth-table row order. The A4 samples `9618_w21_ms_12` PDF p3 and `9618_s21_qp_11` PDF p6 likewise show answer-table structure and the register prompt; they support treating layout as source evidence, not just transcript text.

The inventory also misses clear layout/number-sensitive pages that should be checked under the Stage 1 visual policy. Examples absent from `VISUAL_MANIFEST.json` include `9618_s21_qp_11` and `_13` PDF p3 (hex colour and binary addition), p5 (utility matching table), and p10 (binary accumulator/shift instructions); and `9618_w21_qp_11` and `_13` PDF p2 (binary-unit matching table). Record page-level regions, render and relate them to the correct question/part after correcting the index. See `A3-B21-VIS-01`.

## A4 evidence reconciliation

A4's `A4-B21-F04` reports that all 51 visual regions have empty `relates_to_ids`. Recounting the frozen A2 `VISUAL_MANIFEST.json` gives **18 regions with non-empty `relates_to_ids` and 33 empty regions**. For example, `9618_s21_qp_11-p2-whole-page` relates to `9618_s21_qp_11-q1`, and `9618_w21_qp_13-p4-whole-page` relates to `9618_w21_qp_13-q3`; `9618_w21_ms_12-p3-whole-page` and `-p4-whole-page` are empty. This corrects only the aggregate count: it does not establish that the 18 relationships are semantically sufficient, and the 33 empty region references plus the reported empty marking-item visual/table dependencies remain material risks. A9 should reconcile the count against the frozen JSON and decide the finding's final scope. See `A3-B21-REV-01`.

I did not independently verify QP/MS linkage, marking allocations, or whether any answer row is correct. A4's concerns about missing hierarchy, absent displayed-mark fields, parent-context locators, and visual/table dependencies remain for A4/A9 to assess and retest against the original PDFs. No content is approved for lesson reuse by this review.

## Handoff

Three Major context/visual findings remain open. The batch is not ready for a PASS recommendation until A2 supplies a corrected, versioned index/visual inventory and A4/A9 retest it. Retain the current A2 v0.1.0 artifacts as the reviewed input snapshot; do not overwrite them.
