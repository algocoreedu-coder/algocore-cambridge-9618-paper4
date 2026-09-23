# Thống kê dạng bài và mẫu số

Thống kê mô tả corpus đã khóa, không dự báo đề 2026. Nguồn tính là 672 `part_id` và số điểm gốc; không cộng các co-tag thành tổng điểm.

| Cách đếm | Đề / nhóm đại diện | Câu | Ý có điểm | Điểm gốc |
|---|---:|---:|---:|---:|
| raw_29 | 29 | 87 | 672 | 2175 |
| normalized_text_21 | 21 | 63 | 487 | 1575 |
| render_corroborated_23 | 23 | 69 | 536 | 1725 |

29 đề là báo cáo chính. Hai cách gom nhóm chỉ là kiểm tra độ nhạy: 21 nhóm giống văn bản thân QP/MS đã chuẩn hóa; 23 nhóm được xác nhận thêm bằng ảnh render. Hai cặp có chữ trong MS khác khi render được tách ở cách đếm 23. Cặp w21/41–42 gần tương đương vẫn tách ở cả hai cách đếm. Xem [bằng chứng A2](evidence/A2_EQUIVALENCE.md).

`primary` gán mỗi ý đúng một dạng để tổng 2.175 điểm không lặp. `assessed` ghi tất cả thao tác mới được chấm trong ý: số đề, câu, ý và toàn bộ điểm của các ý chứa dạng đó. Các cột assessed chồng lấp, tuyệt đối không cộng theo dạng. `context_only` là thao tác được gọi hoặc kiểm thử, không tính thành cài đặt mới.

Muốn cộng một nhóm dạng: lấy hợp các `part_id` chứa ít nhất một dạng đã chọn, rồi cộng điểm mỗi ID đúng một lần. Xem [script truy vấn](scripts/query_patterns.py).

Mỗi dạng có bốn số riêng ở cả ba cách đếm trong [JSON thống kê](PATTERN_STATISTICS.json). Bảng ngắn của 58 dạng nằm trong [catalog](EXAM_PATTERN_CATALOG.md).

Cờ ít bằng chứng áp dụng khi có đánh giá trực tiếp trong tối đa hai nhóm văn bản. Ngưỡng này do Lead chọn để ưu tiên đối chiếu syllabus ở Stage 3; không có nghĩa dạng ít quan trọng. Tổng điểm primary là cách phân bổ biên tập, không phải tách marking points của Cambridge.
