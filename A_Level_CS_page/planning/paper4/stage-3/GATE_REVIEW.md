# Lead gate — Stage 3

**Quyết định: PASS sau sửa và kiểm độc lập.**

Lead nghiệm thu chuỗi dạng bài → kỹ năng → khối kiến thức → coursebook → syllabus → lesson/block và yêu cầu đánh giá. Phạm vi giữ Cambridge 9618 Paper 4, năm 2026, Python console, học liệu đủ hai bản Việt–Anh khi sản xuất.

| Điều kiện nghiệm thu | Kết quả | Bằng chứng |
|---|---|---|
| Đầu vào Stage 0–2 đúng phiên bản, Stage 1–2 không thay đổi | PASS | Release verification và các digest được khóa trong RELEASE_MANIFEST |
| Đủ dạng bài, không bỏ ý thi được chấm | PASS — 58 dạng | BOOK_KNOWLEDGE_MAP; A8_AGGREGATE_CHECK |
| Nguồn sách đúng phần/trang, phân biệt nền tảng với lời giải | PASS — 108 block / 55 mục | A2_BOOK_REVIEW; Lead manual links; A8 review |
| Toàn syllabus được xét, mọi mục trong scope có đích | PASS — 44 tiểu mục / 107 mục trong scope / 4 loại trừ | COVERAGE_MATRIX; A3 review |
| Phần corpus/sách chưa đủ có nghĩa vụ sản xuất cụ thể | PASS — 107 assessment requirements | LESSON_PACKAGES; GAP_REGISTER |
| Tiên quyết có lý do, ID hợp lệ, không chu trình | PASS — 58 cạnh lesson / 7 điều kiện block | PREREQUISITE_MAP; S3-A8-07 closure |
| Gói learning page và kế hoạch VI/EN giữ contract | PASS ở mức kế hoạch — 13 gói / 26 lesson | LESSON_PACKAGES; Stage 0 contract |
| Các finding bắt buộc được sửa rồi kiểm lại | PASS — 8 A8 + A3-AGG-01 đóng | A8_FINDINGS; A8_FINAL_QA |

Lead đã kiểm checksum hiện tại của 10 file bàn giao với checksum A8 đã đọc trước khi ký. Báo cáo máy và phạm vi kiểm nguồn nằm trong [QA_REPORT](QA_REPORT.md); quyết định máy đọc được nằm trong [GATE_REVIEW.json](GATE_REVIEW.json).

**Phạm vi của PASS:** thiết kế có thể truy vết và kế hoạch bao phủ, không phải nghiệm thu nội dung đã biên soạn. Các assessment, lời giải, Python execution, dynamic events, nội dung VI/EN hoàn chỉnh và website vẫn chưa được sản xuất. Những điều này thuộc gate của stage tương ứng, không bị coi là đã đạt chỉ vì mapping đầy đủ.

**Stage tiếp theo: 4 — NOT_STARTED.** Bản Stage 3 đã đủ điều kiện dùng làm đầu vào cho Stage 4 khi người dùng giao tiếp; lượt này không tự mở Stage 4.
