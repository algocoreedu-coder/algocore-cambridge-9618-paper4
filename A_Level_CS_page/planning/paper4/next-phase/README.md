# Paper 4 recovery programme — kế hoạch sau audit tổng quát

Mục tiêu của chương trình này là tạo bản thay thế `paper4-2026-s9-v2` đáp ứng đúng learning-page contract: kiến thức có nguồn, Python có bằng chứng chạy, visual dùng đúng code/trace, và toàn bộ 26 bài có trải nghiệm VI/EN kiểm chứng được.

Stage 0–9 và các release manifest cũ được giữ nguyên làm hồ sơ lịch sử. Quyết định `RELEASE_LOCKED` của Stage 9 v1 đã bị audit sau release thay thế bởi `REWORK_REQUIRED`; không sửa manifest cũ để tạo cảm giác release cũ vẫn hợp lệ.

Tài liệu điều phối:

- `PROJECT_AUDIT.md`: tình trạng tổng quát và nguyên nhân gốc.
- `RECOVERY_MASTER_PLAN.md`: critical path, wave và definition of done.
- `WORK_ORDERS.md`: nhiệm vụ, input/output và gate của từng agent.
- `SCHEMA_CONTRACTS.md`: schema bắt buộc cho theory, Python, execution evidence và visual binding.
- `BATCH_PLAN.json`: batch machine-readable và dependency.
- `GATE_CHECKLIST.md`: checklist Lead/A8.
- `PROGRAM_STATUS.json`: nguồn sự thật cho trạng thái hiện tại.
- `RELEASE_GOVERNANCE.md`: generate/check/release, review độc lập và supersession.
- `PLANNING_REVIEW.md`: kết quả Lead double-check kế hoạch.
- `validate-plan.mjs`: validator read-only cho dependency, exact lesson set và denominator.
- `evidence/`: audit độc lập hỗ trợ lập kế hoạch.

Nguyên tắc Lead: không mở wave phụ thuộc khi gate trước chưa PASS; finding bắt buộc quay lại đúng owner; agent tạo sản phẩm không tự ký review độc lập; mọi denominator phải kiểm bằng exact set, không chỉ đếm tổng.
