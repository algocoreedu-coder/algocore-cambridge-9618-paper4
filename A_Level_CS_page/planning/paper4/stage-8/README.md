# Stage 8 — Sản xuất và kiểm chứng visual động thực tế

Stage 8 biến đặc tả đã khóa của Stage 7 thành visual tương tác chạy thật trong `algocore-fumadocs`. Phạm vi gồm runtime xác định, dữ liệu đủ 58 pattern/331 event, giao diện học song ngữ Việt–Anh, kiểm chứng build/typecheck, kiểm thử trình duyệt, accessibility và release có manifest.

## Entry boundary

- Input duy nhất: `paper4-2026-s7-v1` và `STAGE8_HANDOFF.json` của Stage 7.
- Stage 0–7 là read-only. Mọi sửa lỗi nguồn phải mở remediation ticket, không sửa ngược release.
- Stage 8 chỉ được tuyên bố hoàn thành khi production build, runtime browser QA, coverage, accessibility, A8 và Lead đều PASS.

## Waves

| Wave | Chủ trì | Sản phẩm | Gate |
|---|---|---|---|
| S8-0 | Lead + A8 | Input lock, runtime baseline, plan validation | S8-0 PASS |
| S8-A | A1 + A4 | Bộ chuyển đổi dữ liệu và kiểm tra parity 58/174/331 | S8-A PASS |
| S8-B | A2 + A3 | State engine và component visual động | S8-B PASS |
| S8-C | A6 + A7 | Song ngữ, accessibility, responsive, pedagogy UX | S8-C PASS |
| S8-D | A4 + A8 | Typecheck, build, deterministic tests, browser QA | S8-D PASS |
| S8-E | A8 + Lead | Aggregate QA, manifest, detached verification, handoff | RELEASE_LOCKED |

Tối đa hai work package được mở cùng lúc. Lead kiểm tra và ký từng gate; finding bắt buộc phải quay lại đúng owner và được A8 kiểm lại trước khi mở wave kế tiếp.

