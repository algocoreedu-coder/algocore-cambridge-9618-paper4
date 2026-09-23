# Stage 1 — Corpus chuẩn hóa Paper 1

Trạng thái: **PASS — WAITING_FOR_USER_STAGE_CHECK** (22/09/2026). Đầu vào bắt buộc là [Stage 0 PASS](../stage-0/GATE_REVIEW.md).

Stage này tạo source corpus có locator theo từng câu/ý từ 30 cặp QP/MS Paper 1 hiện có, không tạo bài học hay thay đổi app. Xem [playbook Lead](LEAD_PLAYBOOK.md), [work orders](WORK_ORDERS.md), [kế hoạch tiếp tục](STAGE1_CONTINUATION_PLAN.md) và [prompt tiếp tục cho A0](LEAD_CONTINUE_PROMPT.md).

Đầu ra nằm trong `evidence/a2|a3|a4|a9/` theo batch năm B21–B25. Cả năm batch đã được A0 chấp nhận; aggregate v2 đã qua A9 final-v2 độc lập và audit cuối của A0. Quyết định gate nằm tại `evidence/a0/final/STAGE1_GATE_DECISION.json`. Lead đã dừng ở `WAITING_FOR_USER_STAGE_CHECK`; Stage 2 chưa được mở. Xem [operations board](OPERATIONS_BOARD.md), [batch register](BATCH_REGISTER.md) và [resume state](RESUME_STATE.md) trước chỉ dẫn mới.
