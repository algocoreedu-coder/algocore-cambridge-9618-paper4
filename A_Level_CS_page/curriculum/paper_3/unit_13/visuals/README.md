# Chapter 13 — Bộ 40 hình minh họa độc lập

Hoàn thành: 15/09/2026. **40 SVG + 40 PNG nền trong suốt**, mã U13-V01 đến U13-V40.

## Mở và sử dụng

- Mở [index.html](index.html) để xem, tìm kiếm và tải từng hình. Tiêu đề/mô tả của thư viện nằm ngoài ảnh.
- [png/](png/): ảnh raster xuất ở kích thước gấp đôi SVG, phù hợp chèn vào trang bài học hoặc slide.
- [svg/](svg/): hình vector có thể phóng to và chỉnh sửa chữ, đường nối, dữ liệu.
- [visual_manifest.json](visual_manifest.json): bảng mã, kích thước, bài học, câu luyện và tham khảo sách.
- [VISUAL_INVENTORY.md](VISUAL_INVENTORY.md): brief nội dung cho 40 hình.

PNG có nền trong suốt; các ô dữ liệu có màu nền riêng để phân biệt nội dung. Nên đặt hình trên nền trắng hoặc sáng. SVG dùng Segoe UI và Consolas; PNG đã cố định cách hiển thị chữ.

## Quy tắc hình ảnh của bộ này

Mỗi file là một sơ đồ hoặc hình minh họa học tập độc lập, cắt gọn theo nội dung. Không có khung slide, tiêu đề bài giảng lớn, logo, footer hay số trang. Tỷ lệ ảnh thay đổi theo nội dung. Các nhãn kiến thức nằm trong hình; tên hình và phần hướng dẫn nằm trong thư viện hoặc tài liệu.

**Các lần tạo và sửa tiếp theo phải giữ quy tắc này: không tự ý biến toàn bộ slide thành một hình ảnh.**

## Phạm vi

| Nhóm | Mã | Số hình |
|---|---|---:|
| Tổng quan và kiến thức nền | V01–V02 | 2 |
| 13.1 User-defined data types | V03–V12 | 10 |
| 13.2 File organisation and access | V13–V23 | 11 |
| 13.3 Floating-point | V24–V38 | 15 |
| Ôn tập và tổng hợp | V39–V40 | 2 |

Nhãn trong hình dùng thuật ngữ tiếng Anh của môn học; thư viện và mô tả dùng tiếng Việt. Hình được vẽ mới dựa trên nội dung đã chuẩn bị và tham khảo sách, dùng ví dụ lớp học. Các ví dụ floating-point dùng mô hình mantissa/exponent bù hai của chương, với số bit ghi trên hình; không phải sơ đồ chuẩn IEEE 754. V36 minh họa cộng các giá trị đã xấp xỉ; V37 xét số được chuẩn hóa.

## Kiểm tra

- Đủ 40 cặp SVG/PNG, SVG đọc được, PNG có alpha và đúng kích thước xuất.
- Đã xem 5 bảng kiểm tra bao phủ 40 hình và xem riêng các hình có nhãn/công thức dày.
- Kiểm tra vị trí nhãn không phát hiện chồng chữ theo hộp đo font.
- Giải mã chính xác 20 cặp mantissa/exponent đã vẽ; duyệt 2.048 tổ hợp chuẩn hóa để kiểm tra bốn giới hạn và giá trị gần nhất của 0.1; kiểm tra hashing, linear probing, rounding và sai số tích lũy.

Kết quả trong [qa/technical_checks.json](qa/technical_checks.json) và [qa/numeric_checks.json](qa/numeric_checks.json). Mã dựng ảnh trong [tools/](tools/). Các ảnh contact sheet trong qa chỉ phục vụ kiểm tra, không phải visual đưa vào bài học.
