# Stage 9 — Tích hợp learning pages vào Fumadocs

Stage 9 biến corpus đã khóa ở Stage 6 và runtime visual đã kiểm chứng ở Stage 8 thành khóa học Paper 4 dùng được trong `algocore-fumadocs`.

## Phạm vi đã khóa

- Cambridge 9618 Paper 4, syllabus 2026, Python console.
- 13 package, 26 lesson, 58 pattern; mỗi lesson có hai bản VI/EN dùng chung ID và dữ liệu.
- Route chuẩn: `/paper-4/lessons/[slug]`; `/paper-4` là course hub và visual lab.
- Mỗi lesson phải render đủ 10 khối của `stage-0/LEARNING_PAGE_CONTRACT.md`.
- Action View dùng registry Stage 8: 58 pattern, 174 scenario, 331 event.
- Không tuyên bố hỗ trợ chạy Python tùy ý, tài khoản, analytics hay lưu tiến độ.

## Tài liệu điều phối

- `STAGE9_MASTER_PLAN.md`: mục tiêu, dependency và gate theo wave.
- `WORK_ORDERS.md`: phạm vi file, đầu ra và tiêu chí bàn giao cho từng agent.
- `BATCH_PLAN.json`: thứ tự thực hiện và điều kiện mở wave.
- `SCHEMA_CONTRACTS.md`: contract registry, route và evidence.
- `GATE_CHECKLIST.md`: checklist Lead và A8.
- `S9_INPUT_LOCK.json`: hash đầu vào bất biến.
- `STATUS.json`: trạng thái thực thi hiện tại.

## Nguyên tắc vận hành

Lead chỉ mở wave kế tiếp khi owner đã self-check, reviewer độc lập đã kiểm và mọi finding bắt buộc đã `CLOSED_VERIFIED`. Stage 0–8 là nguồn chỉ đọc. Stage 9 không sửa số liệu nguồn để làm cho UI pass.

Audit S9-0 phát hiện 13 lesson chưa đủ content publishable. Wave `S9-R` là remediation bắt buộc trước registry: author nội dung còn thiếu, khóa canonical block mapping, tạo source resolver và kiểm locale toàn diện. Finding này không được hạ mức hoặc che bằng placeholder UI.
