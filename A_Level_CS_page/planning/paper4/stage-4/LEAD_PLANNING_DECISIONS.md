# Quyết định của Lead cho kế hoạch Stage 4

## Những đề xuất đã nhận

Lead đã đọc ba review độc lập trong `evidence/`: method/variant, marking/avoid-loss và learning experience/visual handoff. Các review đồng thuận về mô hình hai trục: QP/MS theo từng part và phương pháp theo từng pattern; Lead sở hữu phép join và gate.

## Quyết định được chốt

1. **Pilot là package stack, 5 pattern.** Linked list cũng đủ khó để làm pilot, nhưng stack cho phép thử cả convention current-top/next-free, full/empty, mutation đơn, phối hợp/rollback và reduction trong một package nhỏ hơn. Linked list được đưa sớm vào B3 và vẫn chịu full review về free-list/object-reference.
2. **Marking ledger chia theo ba lô năm; method chia theo chín batch.** Cách chia năm bảo đảm một owner cho mỗi `part_id`; cách chia package giữ consistency của phương pháp và prerequisite. Lead join hai trục, không để agent tự phân bổ điểm cho co-tag.
3. **Canonical Stage 4 không chứa candidate Python.** Chỉ có solution blueprint, Python interface/fixture/test obligations và trạng thái chờ Stage 5. Code sketch trong evidence không được merge vào bài học hoặc gọi là đúng.
4. **Một anchor worked-example spec cho mỗi pattern.** Đây là spec, không phải lời giải đã chạy. Method-changing variant phải có contrast hoặc boundary micro-case; không đặt quota trang hay số animation.
5. **Stage 4 chỉ tạo preliminary visual brief.** Full event storyboard thuộc Stage 7, module thuộc Stage 8. Stage 4 phải chỉ ra learning question, state/event candidates, Predict và static fallback để tránh Stage 7 phải đoán lại phương pháp.
6. **Stage 4 chỉ thiết kế assessment/repair intent.** Lesson body, full guided/faded/retrieval experience và hints/feedback hoàn chỉnh thuộc Stage 6. Stage 4 vẫn phải map đủ 107 requirement vào 37 brief và giữ VI/EN cho trường student-facing.
7. **Independent QA là A8.** Tên A9 xuất hiện trong một proposal không áp dụng cho đội Paper 4 đã khóa. Tác giả không tự ký PASS; A8 đề nghị, Lead quyết định.
8. **Authority tách rõ:** Cambridge QP/MS/ER chỉ khi có locator đúng; syllabus/book không phải marking authority; AlgoCore inference/guidance/original rubric có nhãn riêng. Không dùng từ “common examiner error” nếu thiếu ER đúng section.
9. **Double-check của Lead gồm hai lượt.** Pass 1 trước A8 đọc toàn bộ canonical artifacts; pass 2 sau rework/A8 kiểm lại final hashes, mọi finding và affected class. Một check tổng count không thay cho đọc semantic.

## Đề xuất được giữ làm đầu vào cho stage sau

- Bảng 130 slot (13 package × 10 slot) hữu ích như handoff/coverage check, nhưng Stage 4 không viết đủ lesson experience của Stage 6.
- Event schema chi tiết, controls và accessibility notes được lưu như yêu cầu downstream; Stage 4 không tạo `EVENT_STORYBOARDS` canonical.
- Practice ladder guided/faded/independent/retrieval là contract cho assessment brief và Stage 6; Stage 4 không coi task/hint/feedback đã authored.

## Quy tắc không thay đổi upstream

Stage 0–3 giữ read-only. Nếu Stage 4 phát hiện lỗi thật trong taxonomy, objective mapping hoặc source link đã PASS, Lead mở issue upstream, đánh dấu output bị ảnh hưởng và re-gate phần liên quan; không âm thầm chỉnh input để builder Stage 4 chạy được.
