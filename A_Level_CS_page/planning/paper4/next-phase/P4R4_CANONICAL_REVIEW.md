# P4R-4 canonical visual review

**Decision:** `CANONICAL_LAYER_PASS_RUNTIME_GATE_OPEN`

Canonical visual layer đã đạt 58 pattern, 174 scenario và 589 event. Mọi trace nối đúng Python artifact/version, fixture, expected output và execution evidence; 2.691 active-line reference hợp lệ. Event có state transition, song ngữ, accessibility metadata và focus sequence. A8 xác nhận Node 20/24, deterministic registry và clean-room execution đều PASS.

P4R-4 chưa đóng hoàn toàn vì learner-visible runtime vẫn dùng Stage 8 flat event stream. Các mục còn bắt buộc:

- Change Input phải chọn đúng `VisualScenarioTrace.event_ids` và đổi state/output khi evidence khác.
- Code panel phải render full PythonArtifact và highlight stable line IDs; không hiển thị contract token.
- Trace phải partition/lazy-load; hub không được serialize registry 4,93 MB.
- Normal/boundary/failure browser tests và payload budget phải PASS.

Các việc này được giao trong workstream tích hợp P4R-4/P4R-5. Không mở release gate cho đến khi hoàn tất.
