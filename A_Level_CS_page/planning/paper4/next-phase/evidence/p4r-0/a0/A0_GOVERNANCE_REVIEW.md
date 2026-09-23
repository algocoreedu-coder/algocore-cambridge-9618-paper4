# A0 governance baseline

Lead đã tạo repository riêng cho `algocore-fumadocs`, giữ planning/corpus lịch sử ở ngoài như immutable hashed inputs. Baseline app là commit `8aec6e5`; recovery branch là `codex/paper4-recovery-v2`; read-only audit được thêm ở commit `58e6ce2`.

`npm run audit:recovery` chạy hai lần cho cùng kết quả và không tạo worktree change. Audit xác nhận baseline lỗi dự kiến: 58 cloned-scenario patterns, 331 vocabulary/type failures, 331 event chưa có Python-like binding, 62 event có before/after state rỗng và 268 event không có output delta.

Node 22 đã được pin bằng `.node-version`; máy hiện tại vẫn là Node 20.11.0. P4R-0 có thể khóa input trên máy này, nhưng clean release và QA tái lập P4R-7 bắt buộc chạy Node 22.

Gate chưa được ký PASS cho đến khi A1 hoàn tất hash lock/exact denominators và A8 hoặc Lead độc lập kiểm lại. Không production authoring/merge nào được phép trước thời điểm đó.
