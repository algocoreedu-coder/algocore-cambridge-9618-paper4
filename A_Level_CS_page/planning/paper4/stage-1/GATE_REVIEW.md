# Lead gate review — Stage 1

**Quyết định: PASS sau REWORK.** Ngày 19/09/2026. Lead A0. Phiên bản `paper4-2026-s1-v1`. Đầu vào: [Stage 0 PASS](../stage-0/GATE_REVIEW.md), năm 2026, Python console, bài học Việt–Anh. Phạm vi: hoàn thiện corpus 29 đề baseline 2021–2025.

## Lead đã trực tiếp kiểm tra

- Đọc playbook và work orders; đối chiếu baseline với 94 nguồn: 65 PDF và 29 SF ZIP. Rà 8 ZIP thiếu, nguồn tải, hash và kiểm tra dữ liệu.
- Đọc QP và yêu cầu chấm MS lô 2025; viết và review 140 summary, xem các trang hình/bảng/code. Đọc chỉ mục và báo cáo hai lô 2021–2024; rà continuation, bất nhất nguồn, variant equivalence, dependency và file dữ liệu.
- Phân biệt lỗi nguồn, lỗi trích xuất và lỗi biên tập. Tiếp nhận findings của A8, sửa theo nguồn và yêu cầu kiểm tra độc lập lần nữa. Không dùng tổng 75 điểm để bù lỗi summary.
- Kiểm sách PDF5–9 và điểm bắt đầu chương; xác định ranh giới section ER, đọc heading và thông báo không có báo cáo; chỉ ghép đúng paper.
- Chạy [Lead validation](evidence/LEAD_CORPUS_VALIDATION.json): 94 hash, 29 paper ID, 672 đối chiếu điểm riêng, dependency/parent, 1.396 liên kết ảnh, 15 section ER và 86 lần nhắc tên file; không có lỗi hoặc cảnh báo chưa xử lý.
- Đọc [A8 index review](evidence/A8_CORPUS_INDEX_REVIEW.md), [A8 data/extraction](evidence/A8_DATA_EXTRACTION_REVIEW.md) và [review tham chiếu độc lập](evidence/A3_REFERENCE_REVIEW.md); đối chiếu kết quả với findings và bằng chứng đóng.

## Checklist nghiệm thu

| ID | Tiêu chí | Kết quả và bằng chứng |
|---|---|---|
| S1-01 | Danh sách paper đúng baseline, giữ đủ phạm vi | PASS — [manifest](SOURCE_MANIFEST.json), Lead validation |
| S1-02 | QP/MS đúng mã, năm, kỳ, hash và số trang | PASS — A8 data/extraction, 94 source hash |
| S1-03 | Index tới mọi câu/ý có điểm | PASS — [QUESTION_INDEX](QUESTION_INDEX.json): 29 đề, 87 câu, 672 ý |
| S1-04 | Nhãn, điểm và continuation khớp từng ý | PASS — A8 dựng lại 672 cặp QP/MS; mỗi đề 75, tổng 2.175 điểm |
| S1-05 | Parent, context, dependency và evidence có nghĩa đúng | PASS — batch reviews; S1-IDX-01/02 được sửa và A8 đóng |
| S1-06 | Dữ liệu bắt buộc đủ và kiểm được | PASS — 29 ZIP, 44 file text được cấp, 29 evidence.doc; A2 và A8 |
| S1-07 | Provenance, nguồn gốc và output được phân biệt | PASS — URL/hash của 8 ZIP; 6 blank target và file thí sinh tạo được ghi riêng |
| S1-08 | Extraction có trang và kiểm soát độ trung thực | PASS — v1.1, geometry, ảnh toàn bộ QP/MS, [policy](EXTRACTION_POLICY.md); A8 đóng S1-EXTRACT-01 |
| S1-09 | ER ghép đúng section nếu có | PASS — 15 section, 84 anchor; no-report và unavailable ghi riêng; A3 và A8 |
| S1-10 | Sách/syllabus có định danh và locator dùng được | PASS — metadata, 20 điểm bắt đầu chương, syllabus 2026 v2; [reference index](REFERENCE_DOCUMENT_INDEX.json) |
| S1-11 | Nguồn thiếu, bất nhất và giới hạn được kê đúng | PASS — [missing](MISSING_SOURCES.md), [source issues](SOURCE_ISSUES.json), [CORPUS_QA](CORPUS_QA.md) |
| S1-12 | Review độc lập, sửa rồi kiểm lại, khóa phiên bản | PASS — A8 đề nghị PASS, A3 reference PASS; không còn finding bắt buộc mở; [release manifest](RELEASE_MANIFEST.json) |

## Vòng REWORK và quyết định đóng

S1-DATA-01 (metadata RAR), S1-EXTRACT-01 (độ trung thực khi trích xuất), S1-IDX-01 (nghĩa summary) và S1-IDX-02 (số liệu kiểm thử) đều **CLOSED_AFTER_REWORK** theo A8. Chi tiết vấn đề, hành động sửa và kết quả kiểm lại tại [CORPUS_QA](CORPUS_QA.md).

Typo và bất nhất của tài liệu gốc được giữ, có chú thích. Chúng cần được giải quyết khi kiểm chứng lời giải ở Stage 4–5; không được âm thầm sửa rồi coi là nguyên văn chính thức.

Các batch/audit và `QUESTION_INDEX.status` giữ trạng thái submission tại thời điểm nộp. **Biên bản này là quyết định nghiệm thu hiện hành.** Trạng thái nguồn chỉ xác nhận đúng loại kiểm tra đã thực hiện.

## Ranh giới và bàn giao

PASS xác nhận corpus đủ để phân tích nguồn trong phạm vi 29 đề. Các ZIP phục hồi có kiểm độc lập nhưng lấy từ mirror; 14 paper chưa có ER và s21/41 không có báo cáo có ý nghĩa đều được ghi rõ. Không khẳng định corpus bao trọn mọi kỳ Cambridge. Bằng chứng tương đương giữa các variant được chuyển tiếp để Stage 2 không coi 29 file là 29 bộ câu độc lập.

Chưa sửa hoặc triển khai ứng dụng; chưa tạo lời giải đã chạy, taxonomy, bản đồ kiến thức chi tiết hay learning page. Phạm vi 2026/Python/Việt–Anh và chuẩn learning page Stage 0 tiếp tục có hiệu lực. Nếu Stage 2 phát hiện lỗi corpus, mở lại record/gate bị ảnh hưởng, sửa và kiểm lại trước khi dùng.

**Stage kế tiếp đủ điều kiện đầu vào: Stage 2 — Lead xây hệ thống dạng bài từ đề thi. Trạng thái thực thi: NOT_STARTED.**
