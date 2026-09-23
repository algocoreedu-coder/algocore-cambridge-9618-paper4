# Definition of done — Stage 0 và toàn khóa

## Stage 0

| ID | Tiêu chí bắt buộc | Bằng chứng cần có |
|---|---|---|
| S0-01 | Năm thi và syllabus version xác định | User: 2026; PDF syllabus2026 v2 và locator |
| S0-02 | Ngôn ngữ lập trình xác định | User: Python; console theo syllabus |
| S0-03 | Ngôn ngữ nội dung xác định | User: toàn bộ VI/EN; contract parity |
| S0-04 | Core/prerequisite/support/exclusion rõ ràng | SCOPE và A3 audit; tránh mở rộng graph code/hash tables vô căn cứ |
| S0-05 | Corpus baseline đủ kiểm đếm | A2 JSON/MD có danh sách mã, QP/MS/SF/report và missing |
| S0-06 | Chuẩn trang dựa trên code thực | A1 source audit và Lead đọc README/TSX/theme |
| S0-07 | Event-driven visual là deliverable cụ thể | Contract state/event/Predict/trace/replay/verification |
| S0-08 | Giới hạn app hiện có được ghi đúng | Không giả định LMS, search hay Python runner hiện hữu |
| S0-09 | Cấu hình và tài liệu nhất quán | JSON parse, user settings parity, links và số liệu kiểm tra |
| S0-10 | Lead review và review độc lập hoàn tất | GATE_REVIEW + QA findings; sửa mọi lỗi bắt buộc trước PASS |

Thiếu SF trong corpus không làm Stage 0 sai nếu inventory ghi đủ và Stage 1 có work order xử lý; không được chuyển trạng thái nguồn đó thành verified. Stage 0 chỉ cần definition/manifest baseline, chưa đòi câu hỏi/lesson/visual được sản xuất.

## Toàn khóa — giữ làm điều kiện cho các stage sau

1. Syllabus coverage: mọi objective bắt buộc có kiến thức, ví dụ, đánh giá và evidence; phân biệt hỗ trợ/tiên quyết.
2. Corpus review: mọi paper/câu/ý trong corpus có nguồn ghép đúng và phân loại được Lead review; nguồn thiếu phải xử lý theo phụ thuộc thực tế.
3. Pattern coverage: dấu hiệu, book mapping, phương pháp, marking/error map, code, visual và bài tự làm đủ cho từng dạng/biến thể cần thiết.
4. Python correctness: code thực thi và trace đúng dữ liệu thường/biên; cài đặt đáp ứng requirement; runtime được ghi lại.
5. Visual/event correctness: state engine, UI controls và lời giải thích đồng bộ; có kiểm chứng độc lập và quan sát UI thực tế.
6. Bilingual parity: cùng IDs/version, nội dung VI/EN đầy đủ tới hint/feedback/visual; không dịch sai code/dữ liệu chính thức.
7. Learning experience: guided/faded/independent, sửa lỗi, nhớ lại và vận dụng; không tính xem trang/Play là thành thạo.
8. Integration: navigation/source links, mobile/light-dark/accessibility, typecheck/build và luồng thực tế đạt.
9. Exam practice: bài tổng hợp, mapping rubric và evidence instructions theo syllabus; không tuyên bố điểm tối đa hoặc hiệu quả thực tế khi chưa đo.
10. Governance: gate evidence từng stage/batch, findings đã đóng, source/version manifest và final audit. Không lấy số trang hay build thành công thay coverage.
