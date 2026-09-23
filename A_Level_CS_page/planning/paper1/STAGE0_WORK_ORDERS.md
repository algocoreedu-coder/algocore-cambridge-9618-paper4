# Work orders sẵn dùng — Stage 0 Paper 1

Trạng thái: PLANNED, chưa dispatch. Các đường dẫn tương đối dưới đây tính từ `A_Level_CS_page`; khi giao agent, A0 chuyển thành đường dẫn tuyệt đối theo workspace thực tế.

Áp dụng chung: Cambridge 9618 Paper 1, thi 2026, đầy đủ VI/EN. Đọc `planning/paper1/AGENT_TEAM_PLAN.md` và `LEAD_PLAYBOOK.md`. Không sửa app, không chuyển sang trích xuất toàn corpus hoặc viết bài học ở Stage 0. Không sinh worker khác. Mỗi gói nộp evidence, issues và self-review; chưa tự đánh dấu gate PASS.

## P1-S0-A1-01 — Audit learning page

- Owner: A1. Dependency: không có, ngoài việc đọc kế hoạch.
- Inputs: `algocore-fumadocs/README.md`, `app/docs/page.tsx`, `app/docs/layout.tsx`, `app/layout.tsx`, `app/globals.css`, `styles/algocore-theme.css`, `package.json`.
- Tham khảo: `planning/paper4/stage-0/LEARNING_PAGE_CONTRACT.md`; chỉ tái dùng nguyên tắc phù hợp, không kế thừa yêu cầu Python/Paper 4.
- Write allowlist: `planning/paper1/stage-0/evidence/a1/`.
- Deliverables: `LEARNING_PAGE_AUDIT.md`, `CONTRACT_PROPOSAL.md`, `ISSUES.md`.
- Công việc: ghi observed/proposed riêng; chuẩn hóa các block Paper 1, metadata, nguồn, VI/EN, reveal-answer, navigation và tiêu chí UI; đề xuất schema logic mà không nhận là pipeline có sẵn.
- Acceptance: mỗi kết luận hiện trạng có file/line locator; giữ theme/logo; chỉ rõ phần cần xây; không báo browser QA nếu chỉ đọc code; đủ điều kiện kiểm nghiệm sau tích hợp.
- Reviewer: A9 ở lượt sau. Dừng sau bàn giao gói.

## P1-S0-A2-01 — Kiểm kê baseline nguồn

- Owner: A2. Dependency: không có, ngoài việc đọc kế hoạch.
- Inputs: thư mục cha `Computer_Science`: `697372-2026-syllabus.pdf`, coursebook PDF, `Past_Papers`, `Topical_Papers`, `Solved_Papers`, `output/markdown`, `output/docx`; trong app project: `sources/README.md`, inventory hiện có.
- Write allowlist: `planning/paper1/stage-0/evidence/a2/`.
- Deliverables: `SOURCE_BASELINE.md`, `SOURCE_MANIFEST.json`, `MISSING_OR_UNVERIFIED.md`.
- Công việc: phân loại syllabus/book/QP/MS/derived materials; inventory toàn bộ candidate Paper 1; ghép theo mã; hash nguồn chính và ghi trạng thái mở đọc; xác định edition sách từ bản gốc; kiểm tra đại diện để nhận diện rủi ro OCR/hình/bảng. Ghi chính xác danh sách file/trang đã xem.
- Acceptance: phân biệt file tồn tại, file đọc được và nội dung đã xác minh; không coi 30 cặp theo tên file là 30 cặp đã audit; không xóa hoặc sửa nguồn; kiểm edition/version bằng evidence; nguồn thiếu có tác động và owner đề nghị.
- Reviewer: A9. Chưa trích xuất từng câu toàn corpus; phần đó thuộc Stage 1.

## P1-S0-A3-01 — Khóa phạm vi syllabus và sách

- Owner: A3. Dependency: có thể bắt đầu trực tiếp từ nguồn; đối chiếu manifest A2 khi được bàn giao.
- Inputs: syllabus 2026 địa phương và bản chính thức; coursebook; `planning/PAPER_AND_BOOK_MAP.md`; `curriculum/paper_1/README.md`.
- Write allowlist: `planning/paper1/stage-0/evidence/a3/`.
- Deliverables: `SYLLABUS_SCOPE.md`, `COVERAGE_PLAN.md`, `PILOT_SCOPE_CHECK.md`, `ISSUES.md`.
- Công việc: xác nhận version áp dụng; ghi ranh giới Paper 1, mục tiêu cấp syllabus và cách map sách; tách required/supporting/out-of-scope; xác minh ba pilot; đề xuất prerequisite và cách kiểm đủ phạm vi.
- Acceptance: locator syllabus/sách phân biệt trang PDF và trang in; không dùng mapping 2027–2029 như xác nhận 2026; ghi mục tiêu chưa kiểm; không tuyên bố dạng đề/tần suất khi chưa có analysis.
- Reviewer: A9. Thiếu nguồn có thể hoàn tất phần khác và ghi WAITING_DEPENDENCY cho phần bị ảnh hưởng.

## P1-S0-A0-01 — Tích hợp quyết định

- Owner: A0. Dependency: cấu hình có thể viết ngay; scope/contract cuối chờ A1/A2/A3.
- Write allowlist: hồ sơ điều phối `planning/paper1/`; các file tổng hợp trong `planning/paper1/stage-0/`, không ghi đè evidence của worker.
- Deliverables trong `stage-0/`: `COURSE_SETTINGS.md`, `SOURCE_BASELINE.md`, `LEARNING_PAGE_CONTRACT.md`, `SCOPE_AND_COVERAGE_PLAN.md`, `DEFINITION_OF_DONE.md`, `DECISIONS.md`, `GATE_REVIEW.md`.
- Công việc: tích hợp kết luận, giải quyết mâu thuẫn, nối tiêu chí với artifact/evidence; phân biệt yêu cầu người dùng, hiện trạng và đề xuất; để gate IN_PROGRESS trước review.
- Acceptance: 2026/VI+EN đúng xác nhận; không thêm chức năng ngoài phạm vi; không có claim đã kiểm mà thiếu evidence; mọi đầu ra đủ để giao Stage 1.
- Reviewer: A9 phải review cả gói này; A0 không dùng self-review thay thế.

## P1-S0-A9-01 — Review độc lập Stage 0

- Owner: A9, agent không viết các gói đang được nghiệm thu. Dependency: A1/A2/A3 đã nộp và A0 tích hợp bản có version.
- Inputs: toàn bộ bộ tổng hợp Stage 0, evidence A1/A2/A3, nguồn gốc cần kiểm; work orders và DoD.
- Write allowlist: `planning/paper1/stage-0/evidence/a9/`.
- Deliverables: `STAGE0_REVIEW.md`, `FINDINGS.md`; khi sửa có `RETEST.md` ghi version mới.
- Công việc: kiểm cấu hình/phạm vi, baseline UI, nguồn/version, đủ VI/EN, tính khả thi contract, ranh giới stage và tính trung thực của trạng thái kiểm tra. Đọc nguồn để xác minh các khẳng định quyết định, không chỉ so các báo cáo với nhau.
- Acceptance: từng tiêu chí có PASS/FAIL/NOT_VERIFIED và evidence; finding có severity, owner, locator và cách retest; không có Critical/Major mới được đề nghị PASS. Thiếu bằng chứng cho yêu cầu bắt buộc nghĩa là CHANGES_REQUIRED.
- A0 nhận finding, giao sửa đúng owner, cho A9 retest, rồi mới ghi quyết định gate.

## Thứ tự dispatch

```text
Đợt 1: A1 audit UI | A2 baseline nguồn | A3 syllabus/sách
        A0 tạo hồ sơ và cấu hình, sau đó tích hợp khi có evidence.
Đợt 2: A9 review gói Stage 0 hoàn chỉnh.
Đợt 3: Owner sửa finding theo file riêng → A9 retest.
Kết thúc: A0 đóng gate; ghi version, evidence và work orders được mở tiếp.
```

Không cần xin lại xác nhận ở giữa các đợt đã được giao. Khi việc thực thi được giới hạn Stage 0, kết thúc bằng bộ tài liệu Stage 0 và báo cáo nghiệm thu; không sửa website.
