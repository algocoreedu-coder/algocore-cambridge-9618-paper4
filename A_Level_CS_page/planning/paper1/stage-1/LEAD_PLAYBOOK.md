# Playbook điều phối — Stage 1: corpus Paper 1

Version 1.0. Ngày 21/09/2026. Đây là quy tắc vận hành; Stage 1 đã được người dùng cho phép và đang chạy. Trạng thái từng gói nằm ở `OPERATIONS_BOARD.md`.

Stage 0 đã PASS theo [gate review](../stage-0/GATE_REVIEW.md). Stage 1 chuẩn hóa 30 cặp Paper 1 QP/MS trong kho 2021–2025 thành corpus truy nguyên được. Không viết lesson, tạo bản dịch, lập taxonomy cuối, chọn holdout, sửa app hoặc công bố website trong stage này.

## Outcome cần đạt

Stage 1 có một `CORPUS_INDEX` chứa mọi câu và ý nguồn, với QP/MS locator, marks, context cha/con, trạng thái kiểm, vùng hình/bảng cần xem trực quan và dependency rõ. Mọi record giữ được source ID/SHA256 từ Stage 0. Bất kỳ dữ liệu nào chưa đọc được hoặc không ghép được đều là `UNRESOLVED`, không được điền suy đoán.

Stage 1 không khẳng định một câu vẫn hoàn toàn phù hợp syllabus 2026, không gom variant tương đương, không tạo marking map hướng dẫn học sinh và không tuyên bố 30 file pairs là 30 mẫu độc lập. Những việc đó thuộc Stage 2 trở đi.

## Vai trò và ownership

| Vai trò | Công việc | Chỉ được ghi |
|---|---|---|
| A0 Lead | Khóa schema/protocol, dispatch theo batch, tổng hợp corpus, quản issue và gate | `planning/paper1/`, `stage-1/` trừ evidence worker |
| A2 Source Curator | Render/extract QP-MS, lập record câu/ý, visual manifest và source packet từng batch | `stage-1/evidence/a2/<batch>/` |
| A3 Scope Specialist | Kiểm record giữ nguyên context, đọc section/hình khó, ghi source-scope flags | `stage-1/evidence/a3/<batch>/` |
| A4 Exam Analyst | Kiểm ghép QP-MS từng câu/ý, marks, parent/child, command word ghi nguyên văn | `stage-1/evidence/a4/<batch>/` |
| A9 Reviewer | Review độc lập batch và corpus tổng hợp, tạo findings/retest | `stage-1/evidence/a9/<batch>/`, `stage-1/evidence/a9/final/` |

A2 và A4 không vừa author vừa review cùng batch. A3 không được xác nhận marking point nếu chưa có MS locator. A9 phải là reviewer độc lập với bất kỳ agent nào nộp artifact được review.

## Cấu trúc dữ liệu bắt buộc

```text
source_file: source_id, sha256, year, session, component, variant, kind, page_count
page: source_id, pdf_page_1_based, printed_page_or_null, extraction_status, visual_status
question: id, source_qp_id, year, session, component, variant, question_number,
          parent_id_or_null, marks_displayed_or_null, command_word_verbatim_or_null,
          prompt_transcript_ref, qp_locator, context_ref, status
part: id, question_id, parent_part_id_or_null, label, marks_displayed_or_null,
       prompt_transcript_ref, qp_locator, ms_locator_or_null, dependency_refs,
       context_required, status
marking_item: id, part_id, ms_locator, text_or_transcript_ref, mark_or_condition_or_null,
              table_row_ref_or_null, visual_dependency_refs, status
visual_region: id, source_id, pdf_page_1_based, bbox_or_page_ref, kind,
               relates_to_ids, extraction_risk, rendered_asset_ref, reviewer_status
issue: id, artifact_id, locator, expected, observed, severity, owner, disposition
```

`question_number`, `label` và `command_word_verbatim` giữ wording/mã nguồn khi có; đừng biến chúng thành classification. `marks_displayed_or_null` dùng đúng số in đề và không tự suy marks per marking item. `status` tối thiểu: `EXTRACTED`, `VISUAL_CHECK_REQUIRED`, `MS_LINKED`, `UNRESOLVED`, `REVIEWED`, `ACCEPTED`.

`pdf_page_1_based` luôn bắt buộc. `printed_page_or_null` chỉ điền khi trang in nhìn thấy và rõ. Crop/PNG/OCR/transcript là dẫn xuất, luôn trỏ về file gốc/hash/page và không thay PDF gốc.

## Lô công việc và thứ tự dispatch

Chia corpus theo năm để tránh quyền ghi chồng nhau:

| Batch | File pairs | Giao trước |
|---|---:|---|
| B21 | 2021 May/June + Oct/Nov, variants 11/12/13 | A2 extraction + visual inventory |
| B22 | 2022, variants 11/12/13 | A2 extraction + visual inventory |
| B23 | 2023, variants 11/12/13 | A2 extraction + visual inventory |
| B24 | 2024, variants 11/12/13 | Sau khi B21 pass batch review |
| B25 | 2025, variants 11/12/13 | Sau khi B22 pass batch review |

Mỗi batch có 6 pairs. Với tối đa ba worker, Lead mở đồng thời B21/B22/B23 cho A2, nhưng không mở B24/B25 khi có từ ba batch chưa qua review. Khi A2 nộp một batch, Lead dispatch A4 kiểm QP↔MS và A3 kiểm context/scope flags cho **chính batch đó**; các agent ghi vùng riêng. A9 review batch chỉ khi A2/A3/A4 đã nộp bản cùng version.

Để giảm hàng chờ, sau B21 được review A2 có thể làm B24; sau B22 được review làm B25. Không chạy A2 cho cả năm mới trong khi A4/A9 chưa giải quyết batch cũ. Lộ trình chuẩn:

```text
A2 B21/B22/B23 → A3+A4 review từng batch → A9 batch gate
→ A2 B24/B25 theo slot → A3+A4 → A9
→ A0 merge corpus → A9 final corpus review → A0 Stage 1 gate
```

## Protocol extraction và visual QA

1. A2 đọc QP và MS PDF gốc, lấy transcript có provenance, chia đúng question/part, ghi page và displayed marks.
2. A2 render mọi trang có diagram, truth table, circuit, table, formula, layout-dependent prompt hoặc MS table/condition. Text extraction bị mất hình học, phủ định, đơn vị, cell merging hoặc structure phải đặt `VISUAL_CHECK_REQUIRED`.
3. A4 đối chiếu QP/MS không chỉ theo số câu: giữ scenario/context cha, subpart labels, total displayed marks, answer-table conditions và note giới hạn. Nếu MS không map một-một, dùng `UNRESOLVED` và issue, không tự ghép.
4. A3 chỉ gắn `scope_flag` như `appears_in_scope_2026`, `possible_out_of_scope`, `needs_context` với locator syllabus/book; không loại câu khỏi corpus. Claim vẫn là source observation, không phải lesson coverage.
5. Chỉ sau A9 review, batch record có thể `ACCEPTED`. `ACCEPTED` nghĩa extraction/locators/context/visual flag đáng tin, không nghĩa taxonomy/lesson/translation đã hoàn thành.

Không OCR để thay nội dung nếu PDF text đã đủ; OCR cần giữ output, engine/version, confidence và visual comparison. Không cắt/đổi PDF gốc. Không trích lại nguyên văn dài vào reports; corpus giữ nội dung cần thiết theo quyền sử dụng nội bộ và reference trực tiếp về PDF.

## Gate cho từng batch

Một batch PASS khi:

- Đủ sáu cặp filename đã có trong Stage 0 manifest, source SHA256 trùng baseline và không sửa file gốc.
- Mỗi QP page có trạng thái extraction; mỗi QP question/part có QP locator và parent/context; mỗi MS item dùng được có MS locator hoặc issue `UNRESOLVED`.
- Displayed marks, labels, tables, diagrams, units, negations và constraints không chỉ dựa text extraction nơi visual risk đã được đánh dấu.
- A4 kiểm cardinality QP↔MS, marks/context; A3 kiểm scope flag không vượt thẩm quyền; A9 review độc lập bản cụ thể.
- Không Critical/Major mở. Minor chỉ defer khi không làm sai corpus và có owner/retest đã ghi.

Batch review không cần tỷ lệ câu “đúng scope” hay thống kê frequency. Không được bỏ câu có ảnh hoặc khó đọc để đạt PASS.

## Lead routine

Trước dispatch: đọc `RESUME_STATE`, `ISSUES`, Stage 0 manifest; snapshot source hashes và tạo `CORPUS_SCHEMA.md`, `EXTRACTION_POLICY.md`, `BATCH_REGISTER.md`, `OPERATIONS_BOARD.md` Stage 1. Mỗi work order có source IDs/hashes, read scope, write allowlist, output schema, reviewer, stop condition.

Khi nhận batch: kiểm file tồn tại, manifest schema, hash, count, unresolved/visual list và evidence. Không tự sửa record của worker. Đọc sample khó/issue mới, dispatch reviewer và cập nhật board. Khi findings quay lại, freeze old version, giao đúng owner sửa, rồi A9 retest updated hash.

Sau năm cuối: A0 merge only `ACCEPTED` records; giữ `UNRESOLVED` records trong corpus với status riêng. A9 final review phải kiểm aggregate counts, unique IDs, source hash integrity, duplicate IDs, every record locator, batch versions, unresolved register và Stage 0 constraints. A0 chỉ PASS Stage 1 sau final review.

## Definition of Done Stage 1

1. 30 QP/MS pairs vẫn khớp Stage 0 source IDs/hashes; corpus có đủ record file/page/question/part và hierarchy không cycle.
2. Mọi record có QP locator; mọi answer/marking record được dùng có MS locator hoặc unresolved reason. Context/marks/parent-child được giữ, không double-count tổng điểm.
3. Diagram/table/formula/visual-risk index có page and reviewer status. Không có claim visual verified chỉ từ plain extraction.
4. Status, source/transcript/crop provenance, issue owner và artifact version đều machine-checkable.
5. A3 flags phạm vi chỉ là flags, không xóa/cố sửa câu cũ; A4 chưa gán taxonomy, pattern frequency, holdout hoặc learner rubric.
6. A9 review mỗi batch và corpus final; Critical/Major đã đóng/retest. Báo cáo nói rõ question index đã làm gì và chưa làm gì.
7. Không có lesson, UI, VI/EN translation, original question, final teaching coverage hoặc browser claim lẫn vào Stage 1 acceptance.

## Các vấn đề cần carry forward

`PROD-01` đến `PROD-05` trong [Stage 0 issues](../ISSUES.md) được sao sang Stage 1 register. Ưu tiên đặc biệt: visual text loss ở logic circuits; render warning sách khi vùng sách được dùng; chưa biết variant equivalence; source authenticity limits; F-E/bitmap/checksum flags chỉ được ghi, chưa giải quyết bằng lesson. Stage 1 giải quyết source-level facts; Stage 2–3 giải quyết diễn giải/teaching claims.
