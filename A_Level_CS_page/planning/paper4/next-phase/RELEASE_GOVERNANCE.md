# Release governance v2

## Nguồn sự thật

- `PROGRAM_STATUS.json` là current-state authority.
- Status và manifest Stage 0–9 là immutable historical records theo thời điểm phát hành.
- `paper4-2026-s9-v1` đã bị post-release audit supersede; không xóa hoặc sửa hash manifest cũ.
- Candidate mới dùng ID `paper4-2026-s9-v2`; không tái sử dụng ID hoặc manifest v1.

## Generate, check và release

Ba thao tác phải tách biệt:

1. `generate:*` đọc canonical authored sources và ghi generated registries vào thư mục tạm.
2. `check:*` chỉ đọc; kiểm schema, exact sets, source/hash joins và behavior. Chạy hai lần không đổi source/generated tree.
3. `release:*` chỉ chạy sau mọi gate PASS; atomic promote candidate, tạo allow-listed manifest và detached verification.

Không recursive-include toàn thư mục evidence vào manifest. Bill of materials phải liệt kê mọi build input thực tế gồm configs, styles, schemas, generators, canonical content, code/test fixtures và visual specs.

## Review independence

- A1 ký source mapping, A6 ký language/UX, A7 ký pedagogy/marking, A8 ký clean-room QA.
- Agent author không tự chuyển finding của mình thành `CLOSED_VERIFIED`.
- Lead chỉ ký release sau A8 PASS và sau khi tự chạy lại exact sets, read-only checks, Node 22 clean build và production smoke.

## Rollback và supersession

- Rollback target là candidate v2 gần nhất đã qua detached verification; v1 không được khôi phục làm content-complete release.
- Release notes phải ghi rõ known non-scope: accounts, progress persistence, arbitrary Python execution và public deployment nếu chưa có workstream riêng.
