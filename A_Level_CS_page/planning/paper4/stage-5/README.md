# Stage 5 — Xây dựng và kiểm chứng lời giải Python

Phạm vi: Cambridge 9618 Paper 4, mục tiêu thi 2026, Python console, sản phẩm học tập VI–EN.

Trạng thái: **EXECUTION_VERIFIED — release `paper4-2026-s5-v1` đã khóa**. Input là `paper4-2026-s4-v1`; toàn bộ B1–B8 đã qua independent rerun, A8 final QA và Lead gate.

Stage 5 biến 58 solution design đã duyệt thành lời giải Python có thể chạy, test fixtures có căn cứ, và event trace đúng với trạng thái thực thi. Coverage audit theo ID bao gồm 719 solution obligations, 60 variants/167 cases, 58 worked examples/210 microcases/261 evidence items, 154 errors/308 detection-repair obligations, 2236 marking atoms, 25 source issues/62 occurrences và 58 visual briefs/174 scenarios/331 event entries.

## Tài liệu điều phối

| Tài liệu | Mục đích |
|---|---|
| [STAGE5_MASTER_PLAN](STAGE5_MASTER_PLAN.md) | Luồng thực hiện, batch, vai trò và định nghĩa PASS |
| [WORK_ORDERS](WORK_ORDERS.md) | Phạm vi và sản phẩm bắt buộc của từng agent |
| [SCHEMA_CONTRACTS](SCHEMA_CONTRACTS.md) | Hợp đồng implementation, test, trace và QA evidence |
| [BATCH_PLAN](BATCH_PLAN.json) | 58 pattern chia thành pilot và batch production |
| [GATE_CHECKLIST](GATE_CHECKLIST.md) | Gate preflight, pilot, từng batch và release cuối |
| [INPUT_LOCK](INPUT_LOCK.json) | Release Stage 4 và checksum nguồn vào |
| [STATUS](STATUS.json) | Trạng thái máy đọc được; không thay biên bản gate |
| [PLANNING_REVIEW](PLANNING_REVIEW.md) | Lead double-check trước khi giao việc |

## Ranh giới stage

Stage 5 xác nhận implementation và trace trên các fixture đã định nghĩa. Nó không viết lesson hoàn chỉnh, storyboard hoặc module animation; các công việc đó thuộc Stage 6–8. Trạng thái `EXECUTION_VERIFIED` chỉ được gắn sau khi tác giả nộp bằng chứng, một agent độc lập chạy lại, Lead đóng finding và A8 kiểm tra release cuối.

Không dùng code từ QP, MS hoặc coursebook làm bằng chứng chạy đúng. Với ví dụ nguồn có lỗi hoặc thiếu chi tiết, phải giữ caveat và kiểm implementation độc lập theo decision đã khóa; không âm thầm sửa bản official.
