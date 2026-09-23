# Stage 9 master plan

## Definition of done

Stage 9 hoàn tất khi 26/26 lesson có route build được, 10/10 khối học tập, VI/EN parity, navigation trước/sau, source provenance an toàn và Action View nối đúng pattern. Typecheck, production build, exact-set verifier, browser QA, accessibility QA và A8 clean-room QA đều PASS. Lead phải double-check sau mỗi wave và ký release cuối.

## Kiến trúc đích

1. Builder đọc các artifact Stage 6 đã release, hợp nhất theo `lesson_id`, và join `pattern_id` với registry Stage 8.
2. Registry Stage 9 là dữ liệu build-time duy nhất cho lesson routes; không đọc trực tiếp file planning tại runtime.
3. Dynamic route dùng `generateStaticParams`; params là Promise theo Next.js 16.
4. Renderer dùng một schema chung và chọn locale trong cùng lesson, để VI/EN không phân nhánh curriculum.
5. Mỗi Action View nhận `patternId`; event/scenario tiếp tục do runtime Stage 8 quản lý.

## Các wave và gate

### S9-0 — Input lock và planning

- Khóa manifest Stage 6, Stage 8, learning-page contract và handoff.
- Khóa denominator 13/26/58/174/331 và route contract.
- Gate: hash đúng, planning machine-readable, không có path nguồn cũ bị ghi.

### S9-R — Content readiness remediation

- Author 13 lesson còn thiếu method/content publishable: 9 `SKELETON_PLACEHOLDER` và 4 skeleton-only.
- A5/A7 chỉ được suy ra từ Stage 3 package, Stage 4 pattern/method/marking và coursebook refs đã khóa; mọi nội dung biên soạn mới gắn `AlgoCore_editorial`.
- A4 tạo source resolver: public UI chỉ nhận source ID/authority/citation card, không nhận local filesystem path.
- A6/A2 chốt locale implementation: lesson/block/action state giữ nguyên khi đổi VI/EN; `html lang`, navigation và UI labels cập nhật cùng locale.
- Gate: 26 lesson đều có semantic content cho 10 block, source access mode rõ, locale acceptance test cụ thể, A7 review và Lead PASS.

### S9-A — Lesson registry

- Chuẩn hóa toàn bộ artifact Stage 6 thành 26 records.
- Exact join: 26 lesson, 58 unique pattern; mọi pattern tồn tại trong Stage 8.
- Gom 10 block, source refs, marking/error guide, retrieval/practice và next/prerequisite.
- Gate: builder deterministic, verifier exact-set PASS, không có orphan/duplicate.

### S9-B — Renderer và route

- Xây reusable learning-page renderer, locale switch và `/paper-4/lessons/[slug]`.
- Render đủ 10 section có anchor ổn định; embed Action View tại section 6.
- Gate: typecheck/build PASS, mọi route được prerender, invalid slug trả 404.

### S9-C — Course hub và navigation

- Course hub liệt kê 13 package/26 lesson, thứ tự học và tiến độ nội dung tĩnh.
- Nối previous/next, prerequisite, package label và deep link đến block.
- Gate: 26 route discoverable bằng keyboard và không có dead link.

### S9-D — Nội dung, song ngữ, source và accessibility

- A4 kiểm source/marking joins; A6 kiểm VI/EN, keyboard, mobile, light/dark, reduced-motion; A7 kiểm 10-block pedagogy.
- Finding bắt buộc quay lại owner, sau sửa phải recheck độc lập.
- Gate: 26/26 parity, 260/260 required blocks, 58/58 Action View joins, required findings = 0.

### S9-E — A8 clean-room QA

- Chạy verifier từ dữ liệu release, typecheck, build và browser spotcheck đại diện đủ 13 package.
- Kiểm deep link, reload, đổi locale, previous/next, scenario boundary/failure và responsive 320 px.
- Gate: A8 PASS và required findings = 0.

### S9-F — Release

- Lập manifest SHA-256, detached verification, release notes và Stage 10 handoff.
- Lead chạy lại exact-set, typecheck, build và browser smoke trước khi ký.
- Release ID: `paper4-2026-s9-v1`.

## RACI

| Vai trò | Trách nhiệm |
|---|---|
| A0 Lead | khóa scope, chia wave, review diff/evidence, trả rework, ký gate/release |
| A1 Registry | builder, schema normalization, exact-set verifier |
| A2 Runtime integration | renderer, route, metadata, static generation |
| A3 Navigation | course hub, package index, previous/next, deep links |
| A4 Source integration/QA | citation resolver, provenance, QP/MS/marking join, authority labels |
| A5 Content author | remediation cho lesson thiếu, dựa trên nguồn đã khóa |
| A6 Language/UX | VI/EN parity, accessibility, responsive, theme |
| A7 Pedagogy | đồng tác giả/reviewer remediation, 10-block contract, hint progression, memory flow |
| A8 Independent QA | clean-room verification và release recommendation |

## Rework policy

Mỗi finding có `finding_id`, severity, owner, evidence, expected fix và status. `required` hoặc severity P0/P1 chặn gate. Chỉ reviewer hoặc Lead được chuyển thành `CLOSED_VERIFIED`; owner không tự đóng finding.
