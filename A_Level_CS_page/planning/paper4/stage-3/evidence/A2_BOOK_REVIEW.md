# A2 — Chỉ mục coursebook cho Stage 3

Trạng thái: **SUBMITTED để Lead và QA kiểm tra**, chưa phải nghiệm thu toàn Stage 3.

A2 đã lập **55 mục kiến thức có locator hẹp**, nối gợi ý đến đủ **58 dạng Stage 2**, đồng thời ghi **19 khoảng trống hoặc phần phải tổng hợp từ đề**. Có đường dẫn nền tảng không đồng nghĩa sách chứa nguyên dạng bài, lời giải hoặc đầy đủ mọi biến thể.

## Nguồn và cách đối chiếu

Nguồn duy nhất của chỉ mục này là *Cambridge International AS & A Level Computer Science*, David Watson và Helen Williams, Hodder Education, 2019; source ID `coursebook_watson_williams`. File gốc có 576 trang PDF, SHA-256 `0deb94b92267f83e4afe39c48b9c01f1419989ec56b4520903a7c5fe234b70b1`. Chỉ mục nhận dạng sách tại Stage 1 được giữ nguyên.

Trang PDF được đánh số từ 1. Với phần thân sách đánh số Ả Rập, **trang PDF = trang in + 16**. Không áp dụng phép cộng này cho trang La Mã đầu sách. Script kiểm tra số trang in ở đầu text của **mọi trang được dẫn**; 24 trang neo còn được render từ PDF gốc và quan sát cả tiêu đề, hình/bảng và số trang in.

| Bằng chứng hình | Trang in được quan sát | Nội dung kiểm tra |
|---|---|---|
| `a2_renders/a2_contact_1.png` | 22, 171, 241, 249, 310, 311 | RLE, check digit, array, file, hashing và collision |
| `a2_renders/a2_contact_2.png` | 464, 467, 470, 481, 487, 488 | Stack, queue, free list, binary tree, graph và cấu thành ADT |
| `a2_renders/a2_contact_3.png` | 489, 490, 501, 506, 516, 521 | Dictionary, Big O, OOP, inheritance, bảng getter/setter/constructor và bài tập traversal |
| `a2_renders/a2_contact_4.png` | 526, 534, 536, 245, 456, 520 | Record files, random access, exceptions và những listing cần thận trọng |

Đây là ảnh kiểm tra nguồn, không phải minh họa dành cho học sinh. Không thực thi code sách hoặc đề. Không sửa sách, text trích xuất, Stage 0–2 hoặc website. Script tái tạo chỉ mục: `../scripts/a2_build_book_index.py`.

## Ranh giới đối chiếu

- Đọc và đối chiếu các mục phù hợp trong chương 19–20; giữ low-level và declarative ngoài core Paper 4.
- Nối đúng phần cần trong AS 9–12; bổ sung RLE chương 1, validation/check digit chương 6 và file organisation/hashing mục 13.2 khi dạng nguồn cần đến.
- Sách có nhiều ví dụ **Python**, không được ghi nhầm rằng sách chỉ có pseudocode. Tuy nhiên, có Python trên trang không có nghĩa listing đã được chạy hoặc đáp ứng nguyên yêu cầu đề thi.
- Dictionary, linked-list search, graph concepts, complexity, serial/sequential/random records và exceptions có mục riêng dù chúng chưa tạo ra một primary pattern độc lập trong corpus. Không tạo tần suất đề giả để lấp khoảng trống syllabus.
- `suggested_pattern_ids` gồm cả kiến thức trực tiếp và kiến thức nền. Trường `support_level` và `limitations` là một phần bắt buộc của mối nối, không được bỏ khi tổng hợp.

## Những khoảng trống cần giữ rõ

Sách giải thích RLE tại trang in 22–24. Sách **không cung cấp** nguyên thuật toán RLE dùng queue của đề, quy tắc xả run cuối hay format output. Các mục `STRING_COMPARE`, `STRING_SPLIT`, `STRING_ROUTE` dùng nền tảng ký tự/chuỗi/selection; kỹ thuật hoàn chỉnh và các trường hợp giới hạn phải lấy từ QP/MS.

Tìm toàn bộ text với `random number`, `randint`, `random()` và đọc các mục arrays/libraries không tìm thấy hướng dẫn API sinh số ngẫu nhiên. `RANDOM_ARRAY` vì vậy được nối đến arrays và library routines với cờ thiếu API; không gán trang sách tưởng tượng cho `random.randint`.

Trang 481 yêu cầu tìm hiểu traversal và trang 521 yêu cầu pre-order/post-order trong extension activity. Đây là **activity-only**, không có lời giải đầy đủ cho các thứ tự traversal. Sách vẫn có nền tảng cây và đệ quy để Lead kết hợp với đề.

Hashing trang 310–311 có công thức, collision và tìm lại theo key. Nó không chỉ định đúng cấu trúc bucket 100×10 hoặc mảng `Spare` của corpus. Hash table trong RAM cũng không thay cho bằng chứng về random-access file, và không chứng minh đủ thao tác dictionary.

Ảnh chụp bằng chứng, test input bắt buộc và vị trí lưu evidence là hợp đồng từ QP/MS; chương 12 chỉ cung cấp kiến thức testing. Cặp stack có rollback, queue inspection không phá hủy, group aggregation, bounded object append và top-N ordered insert cũng là các phép kết hợp phải ghi rõ là tổng hợp của AlgoCore.

## Cảnh báo chất lượng nguồn để Stage 4–5 xử lý

| Trang in / PDF | Quan sát | Cách sử dụng trong Stage 3 |
|---|---|---|
| 239 / 255 | Bảng data types in `False (2)` | Không đưa encoding sai này vào kiến thức Boolean |
| 245 / 261 | `Swap ← FALSE` nằm trong vòng lặp so sánh bubble sort | Chỉ nối khái niệm và trace; listing chưa được chứng nhận đúng |
| 455–457 / 471–473 | Pseudocode/table binary search có điều kiện dừng dựa vào hai cận bằng nhau | Không sao chép listing như code chuẩn; cần kiểm thử riêng ở Stage 5 |
| 250–254 / 266–270 | Prose khái quát linked-list insertion ở đầu và circular queue | Không ép mọi đề dùng đúng biến thể đó |
| 487 / 503 | Câu nói binary tree yêu cầu objects và recursion | Không biến thành yêu cầu toàn cục: corpus có array tree và iterative insertion |
| 489 / 505 | Table 19.24 có dòng Python `dict(...)` trong phần nhãn Java | Dùng định nghĩa dictionary và locator; không chuyển code lẫn ngôn ngữ thành mẫu dạy |
| 516 / 532 | Code trong bảng có khoảng trắng/typesetting quanh tên có underscore | Dẫn từng bảng đúng chức năng; không copy text extraction thành chương trình |
| 520 / 536 | Python search đặt child reference vào `self.item` | Nguồn hỗ trợ ý tưởng tìm trong cây; listing chưa phù hợp để dùng trực tiếp |
| 526–528 / 542–544 | Record indexing và ví dụ binary serialisation có hợp đồng riêng | Không thay thế định dạng text của source files trong đề |
| 532 / 548 | Pseudocode chèn sequential file có logic loop/EOF bất thường | Chỉ liên kết khái niệm; giữ việc viết và kiểm thử code cho Stage 4–5 |
| 536 / 552 | Python dùng bare `except` | Không mặc định mọi validation hoặc mọi file task yêu cầu catch toàn bộ lỗi |

Các quan sát này không sửa nguồn lịch sử và không phải tuyên bố đã kiểm thử mọi listing. Chúng ngăn một locator hợp lệ bị hiểu nhầm là lời giải mẫu đã được xác minh.

## Bàn giao

`A2_BOOK_SECTION_INDEX.json` là dữ liệu gốc cho Lead nối dạng → kiến thức → trang sách → objective syllabus. Getters (`BOOK-20-GETTERS`, Table 20.4), setters (`BOOK-20-SETTERS`, Table 20.3) và constructors (`BOOK-20-CONSTRUCTORS`, Tables 20.1–20.2) có IDs riêng dù cùng trang 516.

Lead cần giữ các mức `foundational`, `conceptual`, `activity_only` khi duyệt từng đường nối. Bước tiếp theo là QA tính đúng của đường nối và độ phủ syllabus; không tự chuyển sang soạn lời giải hoặc triển khai bài học.
