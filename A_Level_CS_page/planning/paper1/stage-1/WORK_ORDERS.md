# Work orders sẵn dùng — Stage 1 Paper 1

Version 1.1. Ngày 21/09/2026. Kế hoạch đã được người dùng cho phép thực thi; Stage 1 đang chạy theo trạng thái tại `OPERATIONS_BOARD.md`.

Áp dụng: Cambridge 9618 Paper 1/2026/full VI+EN. Đọc `../stage-0/GATE_REVIEW.md`, `../stage-0/SOURCE_BASELINE.md`, `../stage-0/SCOPE_AND_COVERAGE_PLAN.md`, `LEAD_PLAYBOOK.md` và hồ sơ điều phối hiện hành. Source PDFs chỉ đọc; không sửa app, viết lesson, dịch prompt hoặc làm Stage 2 taxonomy.

## P1-S1-A0-01 — Chuẩn bị corpus và điều phối

- Owner: A0. Write allowlist: `planning/paper1/stage-1/` ngoài evidence worker.
- Outcome: `COURSE_SETTINGS_REF.md`, `CORPUS_SCHEMA.md`, `EXTRACTION_POLICY.md`, `BATCH_REGISTER.md`, `DECISIONS.md`, `ISSUES.md`, `GATE_REVIEW.md`, board/resume Stage 1.
- Acceptance: source hashes/IDs lấy từ Stage 0; batch B21–B25 có six pairs rõ; statuses/gates và source hierarchy đã khóa; Stage 1 limits được nêu rõ.
- Reviewer: A9 trong final review. Stop: dispatch workers sau artifact set v1.0.

## P1-S1-A2-BYY — Extract và index một batch năm YY

- Owner: A2. Input: sáu QP/MS pairs của B21/B22/B23/B24/B25 trong Stage 0 manifest, source hash và corpus schema v1.1.
- Read scope: chỉ file source của batch, syllabus/source policy khi cần locator; không dùng derived material làm primary evidence.
- Write allowlist: `stage-1/evidence/a2/BYY/`.
- Deliverables: `BATCH_MANIFEST.json`, `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `VISUAL_MANIFEST.json`, `EXTRACTION_QA.md`, `UNRESOLVED.md`, renders/crops/transcripts/scripts trong folder batch.
  - Acceptance: every source page status; complete question/part hierarchy, QP page/printed page when visible, displayed marks, parent context; MS locator or unresolved issue; visual risk flagged/rendered; all artifacts source-versioned. For a source item with no printed parts, preserve the whole-question mark and exact MS row using the question-level marking target in schema v1.1; do not invent a part label. No pattern labels, correctness claims, translations or answer rewriting.
- Reviewer: A4 and A3, then A9. Stop after submission.

## P1-S1-A4-BYY — QP/MS linkage review

- Owner: A4, not author of A2 BYY. Inputs: A2 batch artifacts exact version/hash and original six pairs.
- Write allowlist: `stage-1/evidence/a4/BYY/`.
- Deliverables: `LINKAGE_REVIEW.md`, `LINKAGE_FINDINGS.json`, `MARKS_CONTEXT_CHECK.json`.
- Acceptance: test all question/part links, labels, parent dependencies, displayed totals and MS table/conditional structure against originals. Classify ambiguity `UNRESOLVED`; do not invent marking wording, score allocation, taxonomy, frequency or rubric.
- Reviewer: A9. Stop after submission.

## P1-S1-A3-BYY — Source context and scope flags

- Owner: A3, not author of A2 BYY. Inputs: A2 batch exact version/hash, syllabus 2026 and Stage 0 scope register.
- Write allowlist: `stage-1/evidence/a3/BYY/`.
- Deliverables: `CONTEXT_SCOPE_REVIEW.md`, `SCOPE_FLAGS.json`, `SOURCE_RISK_REVIEW.md`.
- Acceptance: flags cite source/syllabus locators; retain all historical questions; record only observations/risks, not teaching coverage or final pattern classification. Check requested visual/source contexts flagged by A2/A4.
- Reviewer: A9. Stop after submission.

## P1-S1-A9-BYY — Independent batch review

- Owner: A9, independent of A2/A3/A4 authors for BYY. Inputs: frozen A2/A3/A4 batch versions, original PDFs and Stage 1 policy.
- Write allowlist: `stage-1/evidence/a9/BYY/`.
- Deliverables: `BATCH_REVIEW.md`, `FINDINGS.md`, `RETEST.md` if needed.
- Acceptance: sample every risk class and independently verify records sufficient to determine whether the whole batch meets its gate; compare aggregate counts and source hashes; report criterion results and all findings with locator/severity/owner/retest. Do not silently alter corpus.
- Stop: recommend PASS/CHANGES_REQUIRED only; A0 closes batch gate.

## P1-S1-A0-02 — Merge và gate cuối

- Owner: A0. Dependency: B21–B25 accepted.
- Deliverables: `CORPUS_INDEX.jsonl`, `CORPUS_MANIFEST.json`, `UNRESOLVED_REGISTER.md`, `FINAL_INTEGRITY_CHECK.json`, `STAGE1_SUMMARY.md`.
- Acceptance: merge only accepted batch records; validate unique IDs, source hashes, counts/hierarchy/locators, status values and no records from an unreviewed batch. Preserve unresolved records and source evidence.
- Reviewer: A9 final; final review write allowlist `stage-1/evidence/a9/final/`.

## Dispatch matrix

| Round | Workers | Lead action |
|---|---|---|
| R0 | A0 only | Create policies/register and snapshot source manifest |
| R1 | A2 B21, A2 B22, A2 B23 | Monitor separate output folders, validate submissions |
| R2 | A3/A4 per submitted batch, max three workers total | Freeze input manifests and keep reviewer queue bounded |
| R3 | A9 per complete batch | Resolve findings/retest before opening same-slot next batch |
| R4 | A2 B24/B25 plus pending reviews | Continue only after B21/B22 gate frees capacity |
| R5 | A0 merge then A9 final | Close Stage 1 or retain CHANGES_REQUIRED |

Execution note (21/09/2026): the user explicitly instructed A0 to read this plan and complete Stage 1. Dispatch is active; current gates and versioned handoffs are recorded in `OPERATIONS_BOARD.md` and `RESUME_STATE.md`.
