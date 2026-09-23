# Stage 8 work orders

## A0 — Lead / tổng biên tập

Khóa input, phân batch, duyệt kiến trúc, lấy mẫu runtime, trả rework và ký release. Lead đối chiếu trực tiếp các denominator 58/174/331 và không dùng build PASS thay cho browser/accessibility evidence.

## A1 — Runtime/state engineer

Xây registry adapter và deterministic state machine. Bảo đảm event sequence, replay, reset, changed-input và timer không làm lệch state; cung cấp pure functions có thể test.

## A2 — Visual-system engineer

Xây component React cho code/state/trace/output/invariant, control bar, progress và static fallback. Chỉ sửa vùng component được giao; không đổi input Stage 7.

## A3 — Content integration engineer

Tích hợp route Paper 4 vào Fumadocs, nối registry, pattern navigator và learner context. Bảo đảm mọi pattern có thể truy cập, deep-link ổn định và không có dead control.

## A4 — Trace/source verifier

Kiểm tra exact event ID, sequence, source locator/hash, deterministic replay và denominator. Viết contract verifier có exit code khác 0 khi sai.

## A6 — Bilingual/accessibility editor

Kiểm tra VI/EN parity, accessible names, focus order, aria-live, non-colour redundancy, reduced motion, zoom/narrow screen và static fallback.

## A7 — Pedagogy/UX reviewer

Kiểm tra thời điểm dự đoán, mật độ thông tin, feedback, nhịp Play, khả năng ghi nhớ cách giải và quan hệ code–state–output. Finding phải có hành vi quan sát được.

## A8 — Independent QA

Chạy clean-room exact-set, typecheck, build, contract tests, browser interaction và accessibility audit. Không sửa artifact đang kiểm; required finding được trả về owner.

## File ownership

- Adapter/registry/verifier: `algocore-fumadocs/scripts/`, `algocore-fumadocs/app/data/` — A1/A4.
- Runtime components: `algocore-fumadocs/app/components/paper4-visual/` — A2.
- Route/layout/theme integration: `algocore-fumadocs/app/paper-4/`, `app/docs/layout.tsx`, `app/globals.css` — A3/A6.
- QA evidence: `stage-8/evidence/<wave>/`, `stage-8/ui-tests/` — A8/Lead.

