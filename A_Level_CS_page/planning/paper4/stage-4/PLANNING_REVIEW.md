# Lead review — kế hoạch điều phối Stage 4

**Quyết định: READY FOR DISPATCH.** Đây là nghiệm thu bản kế hoạch, không phải PASS nội dung Stage 4. `STATUS.json` vẫn giữ `production_status=NOT_STARTED`; chưa có canonical pattern card, marking map, solution design hoặc visual brief.

## Agent review đã dùng

- A1 method planning: framework 58 pattern, variants/invariants, marking ledger 672 part, worked-example spec, Stage 5 boundary và Lead double-check.
- A4 marks planning: authority QP/MS/ER/AlgoCore, group/alternative/dependency, no-fake-marks, source issues và hai trục ownership.
- A5 learning experience planning: 10-slot handoff, recognition/confusable cues, VI/EN parity, visual/event boundary và package QA.

Lead không chấp nhận máy móc mọi đề xuất. Các khác biệt đã được xử lý trong `LEAD_PLANNING_DECISIONS.md`: chọn stack thay linked list cho pilot; dùng A8 thay tên A9 trong một proposal; giữ storyboard đầy đủ ở Stage 7 và lesson/practice authoring ở Stage 6; cấm candidate Python trong canonical Stage 4.

## Double-check lượt 1 — phạm vi và số liệu

Lead đối chiếu kế hoạch với Stage 3 README, gate, QA, decisions, five canonical JSON maps, Stage 0 learning-page contract và Stage 4 section của playbook.

- Stage 3 release kiểm lại PASS: 72 artifact, 12 locked inputs, 1809 Stage 1 artifacts, 95 Stage 2 artifacts, 5 Stage 2 locked inputs và 94 original sources; 0 lỗi.
- Script `scripts/verify_plan.py` chạy 33 checks, PASS: source batches cộng đúng 29 paper, 87 question, 672 part, 2175 marks; chín method batch phân hoạch đúng đủ 58 pattern; package mapping, pilot IDs và trạng thái NOT_STARTED khớp.
- 107 assessment requirement, 37 destination, 65 capability cần bổ sung, 19 book gap, 20 contrast và source caveat đều có đường xử lý/gate, không bị dùng lẫn làm một mẫu số.
- Link nội bộ của bảy tài liệu canonical Markdown đã kiểm, không có link hỏng.

## Double-check lượt 2 — ranh giới và quyền quyết định

Lead đọc lại ba agent review và toàn bộ tài liệu canonical Stage 4 để kiểm các điểm dễ trượt:

- Marking map sở hữu theo `part_id`, còn method sở hữu theo `pattern_id`; part nhiều pattern không bị duplicate official marks.
- QP/MS/ER, syllabus/book và AlgoCore có authority labels khác nhau. Không suy bullet = một điểm, không hứa full marks, không gọi “examiner/common” khi thiếu ER đúng section.
- Pilot có gate riêng; schema thay đổi sau pilot buộc migrate/recheck pilot.
- Method card bắt buộc contract, representation/convention, variant decision, steps + reason, invariant/check, termination và source-linked obligations.
- Mỗi lỗi có consequence, detection và repair; lời khuyên AlgoCore không bị trình bày thành Cambridge marking rule.
- Solution/example/visual chỉ là design/spec, giữ trạng thái chờ Stage 5/7; không code, trace, output, event, lesson hoặc app nào được báo hoàn thành.
- VI/EN dùng chung IDs/version/data; source English, identifiers và required literals không bị dịch làm đổi hành vi.
- A8 độc lập và hai lượt Lead review là điều kiện chặn. Mọi finding bắt buộc phải sửa và được kiểm lại trước final gate.

## Điều kiện khởi động

Lệnh dispatch đầu tiên phải tạo `INPUT_LOCK`, schema thực thi và source/pattern work orders từ các template đã chốt, rồi thực hiện P0 stack. B1–B8 chỉ được đưa vào canonical production sau `PILOT_GATE=PASS`. Stage 5 vẫn `NOT_STARTED` cho đến khi Stage 4 thật sự qua final gate.

Kế hoạch không đụng Stage 0–3 hoặc app. Các thay đổi ngoài thư mục planning Stage 4 trong worktree hiện hữu không thuộc nhiệm vụ này và không được sửa.
