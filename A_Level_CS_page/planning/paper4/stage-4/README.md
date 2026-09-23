# Stage 4 — Kế hoạch thiết kế phương pháp giải và tránh mất điểm

Phạm vi: Cambridge 9618 Paper 4, năm thi 2026, Python console, nội dung tương lai đủ Việt–Anh.

Trạng thái hiện tại: **COMPLETE — `paper4-2026-s4-v1`**. Gate cuối PASS; A8 đề nghị PASS và Lead đã hoàn tất hai lượt kiểm. Stage 5 vẫn `NOT_STARTED`, nên code, output và event trace chưa được chứng nhận thực thi.

## Đầu vào đã đọc và khóa

- Stage 3 release `paper4-2026-s3-v1`: PASS, 72 artifact và 12 input digest; Stage 1–2 được kiểm xuyên suốt.
- 58 pattern, 26 lesson, 108 knowledge block, 13 package.
- 111 objective biên tập; 107 objective trong phạm vi, 107 assessment requirement và 37 assessment destination.
- 42 objective có corpus evidence phù hợp, 65 objective còn partial/support-only/absent; 19 khoảng trống cụ thể của coursebook.
- 58 cạnh lesson và 7 dependency theo biến thể; chỉ các cạnh này có hiệu lực.

## Tài liệu điều phối

| File | Mục đích |
|---|---|
| [STAGE4_MASTER_PLAN](STAGE4_MASTER_PLAN.md) | Luồng thực hiện, pilot, batch, agent và sản phẩm cuối |
| [WORK_ORDERS](WORK_ORDERS.md) | Hợp đồng giao việc và vùng sở hữu của từng agent |
| [SCHEMA_CONTRACTS](SCHEMA_CONTRACTS.md) | Trường bắt buộc cho pattern card, marking map, lỗi, solution/visual brief |
| [GATE_CHECKLIST](GATE_CHECKLIST.md) | Hai lượt double-check của Lead và điều kiện PASS/REWORK |
| [PLANNING_REVIEW](PLANNING_REVIEW.md) | Kết quả Lead double-check bản kế hoạch trước khi dispatch |
| [STATUS](STATUS.json) | Trạng thái máy đọc được; không dùng thay cho biên bản gate |

Agent chỉ nộp bản `SUBMITTED` trong `evidence/` hoặc vùng batch được giao. Lead là người duy nhất hợp nhất vào các artifact canonical. A8 kiểm độc lập sau khi bản canonical ổn định; agent tác giả không tự ký PASS cho sản phẩm của mình.

## Ranh giới Stage 4

Stage 4 thiết kế **cách giải, cách tự kiểm, cách nối tiêu chí chấm và cách phòng lỗi**. Stage 4 có thể mô tả thuật toán, invariant, điều kiện dừng, hợp đồng dữ liệu và test cần có, nhưng mọi code/trace/output vẫn mang trạng thái `PENDING_STAGE5_EXECUTION_VERIFICATION`. Không dùng code trong sách hoặc mark scheme như bằng chứng đã chạy đúng.

Brief visual ở Stage 4 chỉ nêu câu hỏi học tập, state cần quan sát và event dự kiến. Storyboard/event manifest hoàn chỉnh thuộc Stage 7; module chạy thật thuộc Stage 8. Lesson hoàn chỉnh thuộc Stage 6; tích hợp Fumadocs thuộc Stage 9.

Stage 4 chỉ kết thúc khi đủ 58 card, toàn bộ 672 part trong corpus có disposition trong marking map, 107 assessment requirement có đích thiết kế, không còn finding bắt buộc, A8 đề nghị PASS và Lead hoàn thành hai lượt kiểm trực tiếp rồi khóa release.
