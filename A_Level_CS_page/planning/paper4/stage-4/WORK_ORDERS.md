# Work orders Stage 4

## Nguyên tắc điều phối chung

- Input canonical là Stage 3 release `paper4-2026-s3-v1`; Stage 0–3 chỉ đọc.
- Mỗi agent ghi submission trong `stage-4/evidence/<agent>/<batch>/`. Chỉ Lead ghi artifact canonical ở root Stage 4.
- Mọi submission có `status=SUBMITTED`, input hashes, IDs đã xử lý, IDs chưa xử lý, source locators, self-check và giới hạn.
- Agent không sửa finding bằng cách giảm scope, xóa variant hoặc đổi authority label. Thay đổi Stage 3 phải mở lại gate Stage 3 trước.
- Không bắt đầu output phụ thuộc trước khi input batch PASS. Không agent nào tự review độc lập sản phẩm mình viết.

## A0 — Lead / Tổng biên tập

**Sở hữu:** schema cuối, pattern boundaries, method standard, canonical join, finding, batch gate và final gate.

**Phải làm trực tiếp:**

1. Kiểm release Stage 1–3 và khóa input hashes.
2. Duyệt pilot stack; quyết định schema/card granularity trước khi scale.
3. Đọc 100% card, assessment brief, marking/error row theo hai lượt trong master plan.
4. Đối chiếu mọi lời khuyên “tránh mất điểm” với QP/MS hoặc gắn nhãn AlgoCore.
5. Giao rework cụ thể và kiểm lại sau sửa; không chuyển stage khi còn finding bắt buộc.
6. Khóa release Stage 4 và để Stage 5 `NOT_STARTED`.

## A2 — Source Curator

**Input:** SOURCE_MANIFEST, SOURCE_ISSUES, QUESTION_INDEX, QP/MS/SF locators, book caveats.

**Output mỗi batch:** `SOURCE_RISK_REGISTER.json/.md` gồm source issue instance, part/pattern bị ảnh hưởng, QP/MS/SF locator, rủi ro diễn giải, disposition Stage 4 và việc bắt buộc chuyển sang Stage 5.

**PASS khi:** không bỏ source caveat; không tự sửa source; fixture tự tạo không bị gọi là official SF; book/MS code không được chứng nhận chỉ vì có listing.

## A3 — Marking Analyst

**Input:** QUESTION_PATTERN_MAP, EXAM_PATTERN_CATALOG, confusable contrasts, Stage 3 chains và original QP/MS.

**Output mỗi batch:**

- `A3_MARKING_SUBMISSION.json`: part requirements và marking-point atoms có exact locator.
- `A3_MARKING_REVIEW.md`: alternative/dependency/ambiguity, nguồn cần Lead quyết định.

**PASS khi:** mọi part của batch có disposition; official criterion có MS locator; marking value chỉ ghi khi nguồn cho phép; mỗi atom nối được tới method/evidence mà không chia điểm giả giữa pattern.

Ba source work order độc lập:

| Work order | Phạm vi | Baseline bắt buộc khớp | Write scope |
|---|---|---:|---|
| S4-S1 | 2021–2022 | 11 paper / 228 part / 825 marks | `evidence/marking/2021-2022/` |
| S4-S2 | 2023–2024 | 12 paper / 304 part / 900 marks | `evidence/marking/2023-2024/` |
| S4-S3 | 2025 | 6 paper / 140 part / 450 marks | `evidence/marking/2025/` |

Một `part_id` chỉ thuộc một source work order. Part có nhiều assessed pattern giữ một row và mọi cross-pattern refs; không duplicate official marks.

## A4 — Method & Learning Writer

**Input:** Stage 3 pattern chain, knowledge/objective map, A3 marking submission và learning-page contract.

**Output mỗi batch:**

- recognition/applicability VI–EN;
- ordered method steps có “làm gì / vì sao / kiểm gì”;
- error-prevention draft và repair exercise intent;
- assessment brief draft cho requirement liên quan.

**PASS khi:** không chỉ đưa code/template; precondition, invariant, termination và variant rõ; ngôn ngữ student-facing có VI/EN cùng ID; tips không giả thành official rules.

## A5 — Algorithm & Alternative Reviewer

**Input:** A3 marking submission và A4 method draft.

**Output mỗi batch:** `A5_METHOD_CHALLENGE.json/.md` với normal/boundary/counterexample, convention conflicts, mutation/preservation checks, alternative implementation analysis và Stage 5 test obligations.

**PASS khi:** tìm được hoặc loại trừ premature stop, off-by-one, pointer/order errors, state corruption và output-only false positives; alternative chỉ được chấp nhận nếu vẫn đáp ứng exact QP/MS contract. Không chạy và chứng nhận code thay Stage 5.

## A1 — Learning Standards & Bilingual QA

**Input:** draft card/assessment/visual brief của batch.

**Output:** schema validation report, ID/parity report và 10-slot handoff audit.

**PASS khi:** stable IDs, required fields, VI/EN student-facing parity, source English boundary và downstream status đúng; không tuyên bố lesson/route đã tồn tại.

## A6 — Visual Learning Planner

**Input:** method steps và error rows đã qua A5.

**Output:** preliminary visual brief; nêu learning question, state, event candidates, Predict, boundary/error case, static fallback và accessibility intent.

**PASS khi:** state-changing method dùng event-driven intent; static concept có visual purpose; brief không giả asset/storyboard/module đã hoàn thành và ghi rõ chờ Stage 5/7/8.

## A8 — Independent QA

**Input:** canonical batch sau Lead pass 1; không dùng submission riêng của tác giả thay canonical.

**Output:** findings JSON, mechanical check report, semantic review và PASS recommendation hoặc REWORK.

**Kiểm bắt buộc:**

- exact sets 58 pattern, 672 part, 107 requirement, 37 destination;
- source copy/locator/authority và alternative logic;
- all method/card/error/assessment joins;
- 20 confusable contrasts, conditional variants và source issues;
- đủ 14 canonical source issue ID và 27 occurrence; mọi claim dùng ER có đúng section/locator, không suy “common” khi ER thiếu;
- status boundary Stage 4 ↔ Stage 5/6/7/8/9;
- independent semantic inspection toàn bộ card, cùng risk-based original-page sampling được ghi mẫu số.

A8 không sửa canonical artifact và không sở hữu gate; Lead quyết định sau khi đóng mọi finding.

## Work order cho mỗi batch

```text
Stage/Batch: S4 / <P0|B1...B8>
Input release: paper4-2026-s3-v1 + prior S4 batch gates
Pattern IDs: <exact list>
Objective/assessment requirement IDs: <resolved list>
Files writable: evidence/<agent>/<batch>/...
Files read-only: Stage0–3 + other-agent submissions
Required output: <role-specific artifacts>
Source rules: exact QP/MS locator; authority label; source issues retained
Method rules: precondition, representation/convention, steps/why, invariant, stop/check
Error rules: consequence, detection, repair, evidence basis
Visual rules: learning question/state/event intent only
Self-check: IDs, input hashes, completeness, unresolved decisions
Independent reviewer: <not the author>
PASS criteria: GATE_CHECKLIST batch section
Downstream stage: remains NOT_STARTED until Lead gate
```

## Rework ticket

```text
finding_id:
severity: required | advisory
artifact / card / part / marking point:
observed problem:
source evidence:
required result:
owner:
affected downstream joins:
recheck method:
status: OPEN | RESUBMITTED | CLOSED_VERIFIED
```

Một ticket chỉ đóng sau khi reviewer kiểm lại đúng artifact đã sửa. Câu “agent xác nhận đã sửa” không phải evidence đóng finding.
