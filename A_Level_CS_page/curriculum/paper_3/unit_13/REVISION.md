# Chapter 13 — Phiếu ôn tập trước bài kiểm tra

## Tự gọi lại kiến thức không nhìn sách

1. TYPE khác DECLARE và assignment thế nào?
2. Vì sao enum/pointer non-composite còn record/set/class composite?
3. Pointer đang giữ địa chỉ hay bản sao giá trị?
4. Serial và sequential khác nhau khi chèn record thế nào?
5. Sequential organisation hỗ trợ direct access nhờ cấu trúc nào?
6. Hash trả slot hay địa chỉ? Base và record size tham gia ra sao?
7. Tại sao tìm bằng hash vẫn phải so record key?
8. Hai bit đầu M nào biểu thị normalised? Điều gì xảy ra với E khi dịch trái?
9. Thêm bit M và thêm bit E tác động khác nhau ra sao?
10. Vì sao0.1 không lưu chính xác bằng binary hữu hạn? Hiển thị ít chữ số có sửa giá trị lưu không?

Kiểm tra câu1–3 ở G1;4–7 ở G2;8–10 ở G3. Không tự chấm “biết” nếu chỉ nhớ một từ mà chưa giải thích được cơ chế.

## Từ khóa tiếng Anh để trả lời Paper3

| Từ | Ý cần nêu |
|---|---|
| User-defined type | Kiểu do lập trình viên định nghĩa để phù hợp dữ liệu/bài toán |
| Enumerated | Danh sách hữu hạn các giá trị có tên, có thứ tự khai báo |
| Pointer / dereference | Địa chỉ có kiểu / truy cập giá trị ở địa chỉ đó |
| Composite | Các thành phần dữ liệu dưới một tên, có thể gồm một hoặc nhiều kiểu |
| Serial / sequential organisation | Thứ tự thêm / thứ tự key |
| Sequential / direct access | Đọc lần lượt / dùng đường tra vị trí qua index hoặc hash |
| Collision | Các key khác nhau cùng vị trí hash dự kiến |
| Mantissa / exponent | Phần định trị M / số mũ E trong X=M×2^E |
| Normalisation | Bỏ bit dấu lặp để M bắt đầu01/10, điều chỉnh E giữ giá trị |
| Precision / range | Độ chi tiết giữ được / miền độ lớn biểu diễn được |
| Overflow / underflow | Quá lớn / khác0 nhưng quá gần0 với định dạng đang xét |

## Trình tự tính floating-point

**Đọc:** đếm m/e → M theo trọng số hoặc I/2^(m-1) → E theo bù hai → X=M×2^E → kiểm tra dấu và độ lớn.

**Ghi:** đổi phần nguyên/phần lẻ → chọn E → ghi M đủ bit → bù hai nếu âm → làm tròn theo đề nếu cần → kiểm tra01/10 → kiểm tra E trong range → đọc ngược.

**Chuẩn hóa:** dịch M trái k → thêm0 bên phải → E giảm k → kiểm tra số bit và giá trị. M=0 dùng quy ước riêng. Nếu E ra ngoài range, không tự cắt E rồi tuyên bố đúng.

## Chọn bài theo lỗi

| Lỗi | Làm lại |
|---|---|
| TYPE/DECLARE hoặc enum/STRING | 2–4,29–30 |
| Nhầm serial/sequential hoặc organisation/access | 9–11,31,48 |
| Slot/byte, collision, không tìm thấy | 12–15,32–33 |
| M âm/E âm | 17–18,35,39–40 |
| Số bit thay đổi | 38–42 |
| Làm tròn, sai số tích lũy | 24,43–46, Lab3 |
| Range,0,overflow/underflow | 23,26–27,41,47 |

## Lịch ôn gợi ý

- Ngay sau bài: làm lại ví dụ bằng số khác, giải thích bằng lời.
- Sau1–2 ngày: làm nhóm bài tương ứng mà không xem lời giải.
- Sau1 tuần: trộn3 nhóm; ghi đầy đủ working và chấm từng ý.
- Trước kiểm tra: chọn lại các câu từng sai; sau đó làm QP chọn lọc với MS tương ứng. Hoàn thành chapter này chỉ chứng minh một phần kiến thức Paper3, không đại diện toàn bộ kỳ thi.

## Ôn theo dạng đề — mục 13.4

Mở [bản đồ 22 dạng bài](EXAM_PATTERNS.html): nhận diện E/X → giải QP trước khi xem MS → ghi ý còn thiếu → quay về link lý thuyết → làm lại một câu khác. Dùng checklist 30 giây ở cuối mục 13.4 để kiểm tra tên biến, số bit, working và nguyên nhân–hệ quả.

## Visual bổ sung cho 13.4

[26 hình độc lập V41–V66](exam_visuals/index.html) · [Danh sách](exam_visuals/VISUAL_INVENTORY.md) · [ZIP hình](exam_visuals/chapter-13-4-visuals.zip). Đã gắn vào từng dạng E/X và nhúng trong hai handbook. Tổng bộ Chapter 13: 40 hình lý thuyết + 26 hình thao tác giải đề.
