# Lead — Batch 2025 review

Phạm vi: 6 paper, 18 câu, 140 ý có điểm, 450 điểm. Lead tự viết từng quyết định trong `build_classification.py`; script chỉ ghép các quyết định thủ công theo ID từ Stage 1, không phân loại bằng keyword.

Đọc nguồn kế thừa từ lần Lead lập và kiểm batch 2025 ở Stage 1, gồm QP, MS, source files và shared context. Trong Stage 2, Lead đọc lại toàn bộ 140 mô tả task/locator và các tiêu chí chấm MS, sau đó rà lại các trường hợp class/record, đọc file tạo object, hình thức output, stack reduction, queue RLE và yêu cầu token/routing.

Facsimile gốc được mở và xem trực tiếp trong Stage 2:

- `9618_s25_qp_41` PDF 4: sáu mảng màu một chiều, đọc và phân loại trường dữ liệu.
- `9618_s25_qp_42` PDF 6: TYPE NewRecord, class thay thế record, main hash và Spare.
- `9618_w25_qp_41` PDF 9: class Record OOP với thuộc tính public, bảng bucket 100×10.
- `9618_s25_qp_42` PDF 4: thứ tự pop toán hạng/toán tử và ví dụ tổng stack.
- `9618_w25_qp_43` PDF 10: run liên tiếp, tiêu thụ queue, giả thiết không rỗng và run tối đa 9.

Tiêu chí MS được đọc lại riêng khi chỉnh co-tag: w25/41 PDF 31–32 tạo Record object khi đọc file; w25/42 PDF 18–19 chấm khai báo mảng, sinh ngẫu nhiên và tính duy nhất; w25/43 PDF 10–11 chấm mảng Board và tạo object rỗng cho từng ô. s25/41 PDF 18–20 đọc file không có criterion khai báo array độc lập nên không tự cộng DATA_STORAGE.

Các sửa sau review:

1. `s25/41 2(b)` chuyển sang STRING_ROUTE; `w25/43 3(b)(ii)` giữ STRING_SPLIT. Context gọi và test cập nhật cùng quyết định.
2. `w25/41 3(e)` FILE_READ_OBJECTS + OOP_INSTANTIATE; loader tạo explicit OOP Record, không phải chỉ record-substitute.
3. `w25/41 1(d)` giữ MAIN_FLOW, thêm kỹ năng trực tiếp random_generation và khoảng 0–1000.
4. `w25/42 2(a)` RANDOM_ARRAY + DATA_STORAGE; `w25/43 1(b)(i)` OOP_CLASS + DATA_STORAGE + OOP_INSTANTIATE, có tiêu chí MS riêng.
5. Class bao cây/list chọn TREE_SETUP/LIST_SETUP primary với OOP_CLASS co-tag, nhất quán class TreeClass năm 2024. Các cấu trúc này dùng giá trị khởi tạo riêng theo đề, không gộp thành một constructor mẫu.
6. GetPosition/GetTrains/Description là formatting; SetTerritorySize cộng vào state là OOP_UPDATE; TYPE và explicit OOP class được tách rõ.

Sáu paper giữ đủ 75 điểm mỗi paper. Primary là phân bổ biên tập toàn bộ điểm một ý, không tách marking points. Mọi co-tag/context, source locators và dependency được kiểm lại ở aggregate; A8 kiểm độc lập trước gate. Không viết hoặc chạy lời giải đề thi, không sửa Stage 1 và không triển khai app/visual trong Stage 2.
