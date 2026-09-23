# Gate review — Paper 1 Stage 0

**Quyết định: PASS.** Ngày 20/09/2026. Lead A0. Reviewer độc lập: `/root/a9_independent_review`. Bộ nội dung nghiệm thu theo `evidence/a0/RETEST_INPUT_MANIFEST.json` v1.0.1: scope v1.0.1, các artifact còn lại giữ version đã ghi. Chỉ nghiệm thu Stage0.

## Căn cứ quyết định

A0 đã đọc [review A9](evidence/a9/STAGE0_REVIEW.md), [findings](evidence/a9/FINDINGS.md), [retest](evidence/a9/RETEST.md) và đối chiếu evidence các tác giả. A9 không viết artifact A0/A1/A2/A3. Một finding Minor A9-M01 về cách diễn đạt giới hạn hai bảng đã được A0 sửa, A9 kiểm lại với syllabus PDF27 và đóng. Không còn Critical/Major/Minor Stage0 mở.

| Tiêu chí | Kết quả cuối | Bằng chứng |
|---|---|---|
| S0-01 Cấu hình | PASS | COURSE_SETTINGS; user-confirmed 2026/Paper1/full VI+EN |
| S0-02 Baseline app | PASS | A1 audit O01–O14; A9 đọc source độc lập, observed/proposed tách rõ |
| S0-03 Inventory và mức kiểm | PASS | A2 manifest; A9 kiểm 62 primary, 78 derived, 30 cặp, 60 cover identities |
| S0-04 Version/edition | PASS | Official/local/A3/A9 syllabus hash trùng; sách title/copyright PDF5–6, ISBN/năm rõ |
| S0-05 Scope/boundaries | PASS sau retest | A3 scope; A9 đọc syllabus11/13/14–27; scope v1.0.1 làm rõ DML two-table limit |
| S0-06 Coverage plan | PASS | 99 internal groups/17 sections/8 domains, A9 so toàn required rows và guidance; mọi lesson/assessment còn PLANNED |
| S0-07 Pilot scope | PASS | A3 pilot scope; bitmap core/sound supporting; F-E và validation/verification giữ ranh giới |
| S0-08 Contract học tập/nguồn | PASS | B01–B11, schema/source/rubric/official-adapted-original, review A9 |
| S0-09 VI/EN | PASS về contract | Full parallel content/UI, IDs/data/answers chung, semantic parity; chưa có lesson translations |
| S0-10 Visual/UI | PASS về yêu cầu nghiệm thu | Static/dynamic theo mục tiêu, model/fixtures/keyboard/contrast/locale/browser QA tại stage tương ứng |
| S0-11 Bảo toàn và đúng stage | PASS | A9 kiểm app/source hashes; A0 chạy final integrity sau cập nhật gate, kết quả tại evidence/a0/INTEGRITY_CHECK.json |
| S0-12 Handoff | PASS | README, board/resume/issues/decisions và owner/gate cho việc downstream |
| S0-13 Independent review | PASS | A9 review toàn gói Lead/workers, M01 closed, RETEST_CHECKS 19/19 hashes match |

## Phạm vi thực sự đã đạt

Đã khóa cấu hình, baseline nguồn, phạm vi syllabus 2026, kế hoạch coverage, chuẩn learning page, các pilot, DoD, quyết định nguồn và trách nhiệm bước tiếp theo. Tất cả các nguồn chính có trạng thái kiểm tra trung thực; không có claim per-question corpus đã verified.

Syllabus local trùng byte official 2026 v2; sách là Watson/Williams, Hodder, first published2019, ISBN9781510457591, không tự gán numbered edition. Check digit theo validation của syllabus. Sound arithmetic là supporting, các concepts sound vẫn required. Giới hạn hai bảng được gắn đúng DML query/modify.

## Việc còn mở ở giai đoạn sau

[Issues hợp nhất](../ISSUES.md) và logs A1/A2/A3 tiếp tục có hiệu lực: kiểm từng câu/ý QP-MS, hình/bảng/OCR, biến thể/holdout, audit tài liệu dẫn xuất, F-E model/bus/trace, ví dụ số/bit depth/checksum, VI/EN content/pipeline/routes và UI QA. Các việc này có owner và gate, không được gọi là đã sửa nhờ Stage0 PASS.

Không có lesson, ngân hàng câu hỏi đầy đủ, code UI mới hoặc browser/build test được nghiệm thu trong task này. App source không đổi. Stage1–7 NOT_STARTED, ngoài phạm vi thực thi được giao hiện tại. Bước tiếp theo đề xuất là Stage1 chuẩn hóa corpus theo câu/ý và đối chiếu visual/QP-MS; chưa dispatch.

## Hồ sơ phiên bản

- Initial candidate: evidence/a0/REVIEW_INPUT_MANIFEST.json v1.0.0.
- Corrected candidate: evidence/a0/RETEST_INPUT_MANIFEST.json v1.0.1.
- Independent review: evidence/a9/STAGE0_REVIEW.md, FINDINGS.md, RETEST.md, INDEPENDENT_CHECKS.json, RETEST_CHECKS.json.
- Final integrity: evidence/a0/INTEGRITY_CHECK.json; kiểm app/primary source preservation và các link top-level.
- Final artifact hashes: FINAL_MANIFEST.json. Manifest không tự hash chính nó; gate/board/resume là hồ sơ quyết định sống, không thay thế hash nội dung đã review.
