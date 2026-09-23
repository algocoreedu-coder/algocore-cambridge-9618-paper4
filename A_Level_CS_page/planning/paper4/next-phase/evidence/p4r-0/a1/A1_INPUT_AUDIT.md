# A1 input audit — P4R-0

**Decision:** `A1_PASS_PENDING_A8_REVIEW`  
**Target:** `paper4-2026-s9-v2`  
**Generated:** `2026-09-22T22:30:54+07:00`

## Kết quả khóa đầu vào

A1 đã hash 53 file bắt buộc: learning-page contract Stage 0, nguồn canonical Stage 3/4, manifest Stage 4–8, handoff locks, trạng thái và audit Stage 9, hai app registry hiện hành cùng toàn bộ planning/audit đầu vào của recovery programme. Chuỗi hash handoff Stage 3 → Stage 9 đạt 8/8.

Manifest Stage 3–7 tái kiểm được với live workspace. Manifest Stage 8 có **8** file sai hash; manifest Stage 9 có **10** file sai hash. Theo `RELEASE_GOVERNANCE.md`, đây là hồ sơ lịch sử đã bị supersede, không phải live authority của recovery. A1 giữ nguyên manifest cũ, ghi đầy đủ mismatch và khóa snapshot live hiện tại bằng hash mới; không đổi nhãn hoặc waive lịch sử.

Nested app repository đã được kiểm: baseline `8aec6e5` tồn tại, HEAD quan sát `58e6ce2`, branch `codex/paper4-recovery-v2`, 51 file được Git theo dõi. Planning và corpus ở ngoài repo app được quản trị như input bất biến bằng hash.

## Exact denominators

| Set | Expected | Raw | Unique/stable | Count | Identity |
|---|---:|---:|---:|---|---|
| Packages | 13 | 13 | 13 | PASS | PASS |
| Lessons | 26 | 26 | 26 | PASS | PASS |
| Knowledge blocks | 108 | 108 | 108 | PASS | PASS |
| Patterns | 58 | 58 | 58 | PASS | PASS |
| Scenarios | 174 | 174 | 174 | PASS | PASS |
| Events | 331 | 331 | 331 | PASS | PASS |
| Marking atoms | 2,236 | 2236 | 2236 | PASS | PASS |
| Assessment requirements | 107 | 107 | 107 | PASS | PASS |
| Assessment destinations | 37 | 37 | 37 | PASS | PASS |
| Practice items | 78 | 78 | 78 stable IDs | PASS | PASS |

Các exact-set join package/lesson/knowledge/pattern/requirement/destination đều PASS. Tập practice có đủ ba mức cho 26 bài và 78 unique stable ID. Trong đó, 15 legacy item của `queue`, `linked-list`, `recursion`, `dictionary` và `hashing` được chuẩn hóa bằng `PRACTICE_ID_ASSIGNMENT.json`; canonical assessment records phải giữ nguyên các ID này.

## Findings và required carryover

1. **P4R0-A1-002 — HIGH:** Stage 8 manifest có 8 hash mismatch với live workspace.
2. **P4R0-A1-003 — HIGH:** Stage 9 manifest có 10 hash mismatch với live workspace; Stage 9 phải tiếp tục `REWORK_REQUIRED`.
3. **P4R0-A1-004 — CLOSED BY ASSIGNMENT:** 15 legacy item đã có unique locale-neutral ID; P4R-3 phải bảo toàn mapping.

## Điều kiện mở P4R-1

- A8 xác nhận độc lập repository boundary `algocore-fumadocs`, baseline commit, input hashes và 10 exact denominators.
- P4R-1 dùng input lock này làm live recovery authority; Stage 8/9 manifest tiếp tục là immutable historical records.
- A4/A7 bảo toàn 15 ID được Lead gán khi chuyển sang canonical assessment records.
- Mọi thay đổi vào file đã khóa phải tạo input-lock revision mới; không sửa hash tại chỗ để làm cho gate xanh.

Chi tiết máy đọc nằm trong `INPUT_INVENTORY.json`, `INPUT_LOCK.json` và `EXACT_DENOMINATORS.json` cùng thư mục.
