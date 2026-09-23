# Issues và giới hạn kiểm - A3

Version: 1.0 | Author A3 | P1-S0-A3-01 | 2026-09-19 | REVIEW_PENDING.

Severity dưới đây mô tả rủi ro nếu đưa claim chưa kiểm vào lesson. Không coi deferred production checks là lỗi cần có bài học ngay trong Stage0. Reviewer A9 quyết định độc lập liệu bằng chứng Stage0 đủ hay không.

| ID | Vấn đề / evidence | Disposition hiện tại | Owner / hành động / gate |
|---|---|---|---|
| A3-S0-01 | Existing `planning/PAPER_AND_BOOK_MAP.md` dựa 2027–2029 | RESOLVED_FOR_SCOPE: re-derived từ 2026 v2 official/local hash match; không sửa file nguồn cũ | A0 dẫn scope mới; A9 kiểm p11/14–27; không blocker khi scope mới được nhận |
| A3-S0-02 | Book PDF186–187/in170–171 xếp check digit dưới verification; syllabus PDF/in24 §6.2 đặt dưới validation. Render `tmp/book-p186.png`, `tmp/syllabus-p24.png` đã xem | RESOLVED_FOR_SCOPE: theo syllabus; không thay phân loại bằng sách. Rủi ro Major nếu lesson tái sử dụng sai | A0 ghi quyết định; A3/A4/A6 kiểm pilot3, A9 retest phân loại trong cả VI/EN tại Stage3 |
| A3-S0-03 | Sound file-size calculation không là objective explicit riêng tại syllabus PDF/in15 | RESOLVED_FOR_SCOPE: core bitmap, sound concepts required, sound arithmetic supporting có nhãn | A0 khóa tên/phạm vi pilot1; A4 kiểm QP/MS trước claim marking; A9 review scope |
| A3-S0-04 | F-E book Fig4.5 và RTN tại PDF133/in117 đặt PC increment khác vị trí; câu internal transfer/address bus cần audit | OPEN_DOWNSTREAM: không phát hành trace/animation từ hình; scope mục tiêu không đổi. Major nếu copy mô hình sai | A3/A4 xác minh mô hình/trace với nguồn QP/MS trước Stage3 content gate; A7 chỉ làm sau content verified; A9 kiểm độc lập model |
| A3-S0-05 | Text extraction nhiều trang không chứng minh figures/tables đã audit; Poppler render sách có dictionary warnings nhưng hai selected renders thành công, nội dung đọc được | OPEN_DOWNSTREAM: Stage0 chỉ claim những trang đã đọc/xem; không whole-book fidelity PASS | A2/A3 QA từng vùng dùng ở Stage1/2; render lại bằng công cụ khác nếu vùng thiếu; A9 kiểm locators ảnh/bảng |
| A3-S0-06 | Book PDF32/in16 có lời khẳng định tối thiểu 8 bits cho ảnh màu; PDF33/in17 ví dụ arithmetic/rounding cần kiểm lại; không dùng sách làm oracle lời giải | OPEN_DOWNSTREAM: cách ly claim/calc khỏi bài cho đến kiểm độc lập; đây là cờ audit, không kết luận QP/MS sai | A3/A4 recompute các ví dụ được chọn, dùng syllabus nghĩa bit depth; A9 retest trước Stage3 |
| A3-S0-07 | Book PDF188/in172 nói checksum bằng nhau nghĩa là truyền không lỗi; diễn giải bảo đảm tuyệt đối có rủi ro | OPEN_DOWNSTREAM: không dùng phát biểu tuyệt đối; QA giới hạn phát hiện lỗi trước viết bài | A3/A4 kiểm ví dụ/counterexample và nguồn, A9 review Stage3; chưa có lesson nên không claim sửa nội dung |
| A3-S0-08 | Chưa có lesson IDs, assessment IDs, question/part/MS locators cho 99 rows nội bộ | PLANNED đúng scope: Stage0 là coverage PLAN, chưa lesson map hoàn chỉnh | A3/A4 Stage2 mở mapping thật sau A2 Stage1; không bịa marking/frequency |

## Các thao tác đã thực hiện

- Tải official PDF vào vùng A3; tính SHA256 local/download và sách; A2 xác nhận hashes tương ứng độc lập.
- Dùng pypdf trích xuất syllabus và phần đầu sách vào `tmp`; đọc có chọn lọc theo ledger `SYLLABUS_SCOPE.md`, không ghi những trang chưa đọc là verified.
- Poppler render và A3 visual-inspect: syllabus PDF15/in15, PDF24/in24; book PDF133/in117, PDF186/in170. Warnings được giữ như vấn đề nguồn, không làm mất các ảnh kiểm này.
- Đọc kế hoạch, playbook, work orders và hai file mapping/skeleton. Chỉ ghi `stage-0/evidence/a3/`.
- Đã gửi official/hash comparison cho A2 và Lead; không có QP/MS analysis, không chạy build/browser, không thay app.

## Self-review

Đủ bốn deliverables v1.0; locators in/PDF tách rõ; 2026/v2/full VI+EN đúng; notes/guidance không bỏ SQL continuation, assembly/bit shifts, AI ethics; source discrepancies có disposition. Không self-sign PASS. Review độc lập A9 còn pending. Sau bàn giao dừng chờ finding; không mở Stage1.
