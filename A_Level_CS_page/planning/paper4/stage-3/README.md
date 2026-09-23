# Stage 3 — Nối dạng bài với coursebook và syllabus

Paper 4 Cambridge 9618 · năm thi 2026 · Python console · bài học tương lai có đủ hai bản Việt–Anh.

Trạng thái nghiệm thu được ghi tại [GATE_REVIEW](GATE_REVIEW.md); đây là bàn giao **thiết kế và truy vết nguồn**, chưa phải khóa học đã biên soạn. Stage 4 chưa bắt đầu.

## Bàn giao để sử dụng

| Tài liệu | Dùng để làm gì |
|---|---|
| [COVERAGE_MATRIX](COVERAGE_MATRIX.md) | Tra từng mục tiêu syllabus, bằng chứng đề, lesson/block, sách và đánh giá cần sản xuất |
| [BOOK_KNOWLEDGE_MAP](BOOK_KNOWLEDGE_MAP.md) | Đi từ dạng bài và kỹ năng tới khối kiến thức, đúng mục và trang in/PDF của sách |
| [LESSON_PACKAGES](LESSON_PACKAGES.md) | Xem 13 gói, 26 lesson, 108 khối kiến thức, định danh chung VI/EN và nhiệm vụ đánh giá |
| [PREREQUISITE_MAP](PREREQUISITE_MAP.md) | Xếp thứ tự học và các điều kiện riêng cho từng biến thể |
| [GAP_REGISTER](GAP_REGISTER.md) | Theo dõi phần corpus/sách chưa đủ và điều kiện đóng khoảng trống ở các stage sau |
| [LEAD_DECISIONS](LEAD_DECISIONS.md) | Giữ các ranh giới học thuật và lý do chọn phạm vi |
| [QA_REPORT](QA_REPORT.md) | Xem các yêu cầu sửa và kết quả kiểm tra độc lập |

Mỗi bản Markdown có JSON cùng tên để tiếp tục sản xuất và kiểm tra bằng máy. `evidence/` giữ báo cáo agent, ảnh đối chiếu nguồn và lịch sử review; `scripts/` giữ phép ghép có thể tái tạo và kiểm tra release. Các routes trong registry là địa chỉ dự kiến, chưa phải đường dẫn website đang hoạt động.

## Phạm vi đã đối chiếu

- Giữ đủ **58 dạng bài** từ Stage 2, dựa trên 29 đề, 672 ý chấm điểm; không thay taxonomy hoặc đếm lại điểm thi.
- Xem toàn bộ **44 tiểu mục** syllabus để xác định phạm vi. Phân rã **111 mục tiêu biên tập**: 50 core thực hành, 16 hiểu biết hỗ trợ, 37 tiên quyết AS, 4 cầu nối do corpus cần, 4 loại trừ. `SYL-*` là ID của AlgoCore.
- **107 mục trong phạm vi** có điểm đến kiến thức và yêu cầu kiểm tra năng lực. Low-level, declarative và lập trình graph không được đưa vào core. Đây không phải khóa dạy toàn bộ Paper 1–3.
- **55 locator sách** giữ cả trang in và trang PDF. Có **19 phần sách chỉ cung cấp nền tảng hoặc cần tổng hợp thêm** theo QP/MS.
- Corpus có dẫn chứng phù hợp cho 42 mục; 31 mục mới có một phần, 19 chỉ có ngữ cảnh hỗ trợ, 15 chưa xác nhận ví dụ độc lập; 4 mục loại trừ. **65 nghĩa vụ bổ sung** vẫn phải được biên soạn/kiểm ở stage sau.
- **37 đích bài luyện dự kiến** gom **107 yêu cầu kiểm tra theo mục tiêu**; đây không phải 107 bài thi hoặc bài luyện đã viết. Nguyên bản tự biên soạn phải ghi AlgoCore, không nhận là câu/điểm chính thức Cambridge.
- Giữ **14 yêu cầu đánh giá/thực hành** riêng với mục tiêu kiến thức: offline console, evidence, lưu bài, ngôn ngữ, source files và các điều kiện liên quan.

## Cách dùng ở stage tiếp theo

1. Chọn pattern trong `BOOK_KNOWLEDGE_MAP.pattern_chains`, đọc giới hạn và biến thể từ Stage 2.
2. Mở đúng `knowledge_id`, lấy mục sách, trang in/PDF và các mục tiêu hoặc quy tắc đánh giá liên quan.
3. Đối chiếu `COVERAGE_MATRIX`: một block phục vụ mục tiêu không có nghĩa mọi câu thi của pattern đã đánh giá mục tiêu đó. Chỉ `corpus_evidence` có lý do và QP/MS cụ thể mới là dẫn chứng từng ý.
4. Đọc điều kiện tiên quyết và các requirement đánh giá; tổ chức đủ 10 khối learning page. Thuật toán đổi trạng thái cần Action View dựa trên event đã kiểm; khái niệm tĩnh dùng sơ đồ/so sánh có mục đích.
5. Giữ nguyên vấn đề nguồn ở Stage 1 và nhận xét sách của A2. Stage 4 viết nội dung/phương pháp, Stage 5 kiểm Python và trace; Lead vẫn nghiệm thu từng stage trước bước kế tiếp.

## Nguồn chính và giới hạn

Coursebook: David Watson & Helen Williams, *Cambridge International AS & A Level Computer Science*, Hodder Education, 2019, ISBN 9781510457591; source ID `coursebook_watson_williams`. Syllabus: Cambridge 9618, examinations 2026, Version 2; source ID `syllabus_2026_v2`. Danh tính và checksum nằm trong dữ liệu nguồn Stage 1 và release Stage 3.

Đã đọc nguồn đóng băng tại máy và đối chiếu ảnh trang liên quan. Không tuyên bố có kiểm tra mới với máy chủ Cambridge; không chứng nhận code ví dụ trong sách/MS đã đúng. Nội dung VI/EN cho học sinh, lời giải Python, fixtures, rubric, events và website vẫn `NOT_AUTHORED`/`NOT_IMPLEMENTED`.

## Tái kiểm

Chạy `python scripts/verify_release.py` trong thư mục Stage 3 để kiểm checksum bàn giao và dữ liệu Stage 1–2. Chạy builder chỉ khi chủ động cập nhật phiên bản: nó làm thay đổi đầu ra và buộc QA, Lead gate, freeze lại; không tự sửa một release đã nghiệm thu rồi tiếp tục dùng nhãn PASS cũ.
