# Trước khi học Chapter 13 — Chẩn đoán AS

Thời gian gợi ý 20–30 phút. Làm trước khi xem lời giải trong TEACHER_GUIDE. Nếu sai phần nào, ôn phần đó trước khi chuyển sang nội dung mới.

| Mã | Bài chẩn đoán | Cần trước phần |
|---|---|---|
| D1 | Chọn kiểu cho họ tên, số buổi học, nhiệt độ, ngày bắt đầu, tình trạng đã thanh toán; giải thích số điện thoại dùng kiểu gì | 13.1 |
| D2 | Khai báo record TBook có BookID, Title, PageCount và Available; tạo biến, gán và đọc Title | 13.1 |
| D3 | Nêu READ, WRITE, APPEND; viết pseudocode tạo file study.txt, ghi hai dòng, append một dòng, đọc đến EOF rồi đóng file | 13.2 |
| D4 | Đổi +48, -55 thành số nguyên bù hai8 bit; đọc11111011; tìm khoảng số nguyên bù hai16 bit | 13.3 |
| D5 | Tính00110001+00011110; tính01111110+00000010 trong8 bit có dấu và nêu có overflow không | 13.3 |
| D6 | Đổi0.625 sang binary bằng nhân2; đọc0.1011₂ | 13.3 |
| D7 | Viết123000 và0.0000125 ở scientific notation; viết11/2 thành phân số trong[1/2,1) nhân lũy thừa2 | 13.3 |
| D8 | Fixed-point có binary point sau4 bit của word8 bit bù hai: đọc00011000. Giải thích vì sao fixed-point vẫn lưu được phần lẻ | 13.3 |

## Kiến thức cần giữ

Sau D3, chuyển pseudocode sang ngôn ngữ đang học và chạy thử với file riêng. Ghi đầu ra kỳ vọng trước khi chạy. Giáo viên có bản Python tham khảo ở `labs/file_demo.py`, dùng thư mục tạm để bài chạy độc lập; đầu ra cần có lần lượt Binary, Files, Records.

- INTEGER cho phép tính số nguyên; STRING giữ văn bản và mã định danh; BOOLEAN cho hai trạng thái; DATE cho ngày; REAL cho giá trị có phần lẻ.
- Record có các field khác kiểu; array gồm các phần tử cùng kiểu.
- READ đọc; WRITE tạo/ghi, có thể thay nội dung cũ theo môi trường; APPEND thêm cuối. Luôn đóng file; khi luyện dùng file riêng của bài.
- Với n bit bù hai, trọng số đầu là -2^(n-1), miền số nguyên là -2^(n-1)..2^(n-1)-1.
- Trong fixed-point, vị trí binary point được ấn định. Trong mô hình floating-point của chương, M là phân số có dấu và E quyết định hệ số2^E.

Không cần học lại toàn bộ AS nếu đã tự làm đúng các bài này; giữ bài sai trong nhật ký ôn tập.
