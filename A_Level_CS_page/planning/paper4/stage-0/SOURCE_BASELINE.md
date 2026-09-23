# Baseline nguồn được Lead chấp nhận cho Stage 0

Phạm vi kiểm kê: các file hiện diện trên máy ngày 19/09/2026. Manifest đầy đủ của A2: [JSON](evidence/A2_SOURCE_BASELINE.json), [báo cáo](evidence/A2_SOURCE_BASELINE.md). Đây là file-level baseline, chưa là corpus đã xác minh nội dung.

| Nguồn | Kết quả | Trạng thái |
|---|---|---|
| QP Paper4 | 29 file, 2021–2025, 10 kỳ có nguồn | Đã kiểm tên/kích thước và ghép mã; chưa phân tích câu/ý |
| MS Paper4 | 29 file, mỗi QP có MS cùng mã | Chưa kiểm marking points |
| SF ZIP | 21 file | Chưa giải nén/kiểm requirement dữ liệu |
| Thiếu SF cùng mã | 8 mã | Stage1 phải kiểm QP, tìm nguồn nếu cần |
| Examiner report | 5 file cấp kỳ: s21,s22,w22,s23,w23 | Chưa kiểm bên trong có nội dung Paper4 tương ứng |
| Coursebook | 576 trang PDF, 20 chương theo mục lục | Lead trực tiếp kiểm trang mục lục; chưa map kiến thức chi tiết |
| Syllabus2026 | 49 trang PDF, Version2 | Lead đọc PDF và xem trang11,37,38,40; kiểm version bằng update chính thức |
| Học liệu cũ | 120 file ứng viên trong inventory A2 | Chưa audit tính đúng/coverage; không tính là lesson hoàn thành |

8 mã thiếu ZIP cùng tên: `9618_w21_41`, `9618_w21_42`, `9618_s22_41`, `9618_s22_42`, `9618_s22_43`, `9618_w23_41`, `9618_w23_42`, `9618_w23_43`.

Không tìm thấy w21/43 trong thư mục được kiểm kê; chưa kết luận đề đó có phát hành hay tồn tại ở nơi khác. Không có file Paper4 năm2026/February–March/specimen trong kho này. Past_Papers.rar chưa mở. Stage1 có thể tìm bổ sung, phải cập nhật manifest nếu phạm vi corpus thay đổi.

29 là số file QP, không phải 29 bộ câu độc lập. Không dùng số này để suy ra tần suất khi chưa rà trùng giữa các variant. Kết luận “20 bộ” của tài liệu cũ cũng chưa được xác minh.

## Evidence trực tiếp của Lead

- [Hash, số trang và danh sách trang đã trích](evidence/LEAD_SOURCE_VERIFICATION.json).
- [Syllabus selected pages](evidence/syllabus2026_selected_pages.txt): PDF1,3,11,13,37–40. Lead đã xem ảnh render PDF11,37,38,40 để đối chiếu bảng/ngoại lệ, không chỉ tin bản text cũ.
- [Coursebook selected pages](evidence/coursebook_selected_pages.txt): có mục lục PDF7–9; xác nhận chương19/trang in450, 19.2/490, chương20/498 và20.2/525. Các thông tin tác giả/năm trong A2 vẫn ghi là metadata kế thừa, chưa được Lead dùng làm yêu cầu khóa học.
- [Cambridge update2026](https://www.cambridgeinternational.org/Images/747145-2026-syllabus-update.pdf) xác nhận Version2, December2025. Web parser không đọc được PDF syllabus chính tại thời điểm kiểm; không tuyên bố đã so sánh byte với bản tải mới.

## Handoff cho Stage 1 khi được khởi động

Đọc QP/MS đến từng câu/ý; xác minh SF và nội dung report; kiểm lỗi trích xuất, lập source locator, trạng thái evidence và quan hệ phụ thuộc giữa các ý. Tìm nguồn thiếu có mục tiêu, không tự thay dữ liệu. Tài liệu học liệu cũ chỉ được dùng lại sau review. Công việc này chưa thực hiện trong Stage0.
