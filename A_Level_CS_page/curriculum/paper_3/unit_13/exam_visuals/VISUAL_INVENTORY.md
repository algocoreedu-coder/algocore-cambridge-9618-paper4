# Danh sách visual — 13.4 Chapter 13 in Past Papers

**Đã tạo 26 hình độc lập: U13-V41–U13-V66**, tiếp nối 40 visual lý thuyết. Mỗi hình có SVG chỉnh sửa và PNG 2× nền trong suốt; kích thước theo nội dung, không có khung slide, logo, tiêu đề bài giảng hoặc đoạn hướng dẫn dài nằm trong ảnh.

[Mở thư viện hình](index.html) · [Mở mục 13.4 có hình](../EXAM_PATTERNS.html) · [ZIP riêng của 26 hình](chapter-13-4-visuals.zip).

## Phạm vi

- V41–V48: nhận diện và 7 dạng kiểu dữ liệu.
- V49–V53: 5 dạng tổ chức/truy cập tệp.
- V54–V62: 9 hình cho 7 dạng floating-point; tách riêng bẫy -0.5 và hai đầu vào chuẩn hóa.
- V63–V65: 3 dạng giao thoa — subrange/array, PRIVATE, file pseudocode.
- V66: sơ đồ đọc ngược kiểm tra đáp án.

## Danh sách đầy đủ

| ID | Dạng | Hình | Thao tác được minh họa | Tệp |
|---|---|---|---|---|
| U13-V41 | Nhận diện | Nhận diện thao tác, đầu ra và ràng buộc | Tách Calculate / denary value / M8-E4 và nối tới thứ tự giải mã. | [PNG](png/u13-v41.png) · [SVG](svg/u13-v41.svg) |
| U13-V42 | E01 | Một giá trị và một cấu trúc nhiều field | Đối chiếu biến enum với record chứa các field dưới một tên. | [PNG](png/u13-v42.png) · [SVG](svg/u13-v42.svg) |
| U13-V43 | E02 | Enum: thứ tự khai báo và chọn một giá trị | Ba giá trị enum trên một dãy; chọn Paused, phân biệt Paused với chuỗi "Paused". | [PNG](png/u13-v43.png) · [SVG](svg/u13-v43.svg) |
| U13-V44 | E03 | Chọn field có miền enum phù hợp | Field Status được đối chiếu với miền lựa chọn hữu hạn rồi đổi sang TStatus. | [PNG](png/u13-v44.png) · [SVG](svg/u13-v44.svg) |
| U13-V45 | E04 | Từ yêu cầu field tới khai báo record | Bốn field nối tới bốn khai báo kiểu bên trong TYPE/ENDTYPE. | [PNG](png/u13-v45.png) · [SVG](svg/u13-v45.svg) |
| U13-V46 | E05 | Tên kiểu, biến record và đích gán | TLearner tạo biến Learner; Learner.Status là field nhận giá trị. | [PNG](png/u13-v46.png) · [SVG](svg/u13-v46.svg) |
| U13-V47 | E06 | Pointer: địa chỉ và giá trị tại địa chỉ | P lưu địa chỉ Score; ^Score lấy địa chỉ, P^ đọc giá trị 42. | [PNG](png/u13-v47.png) · [SVG](svg/u13-v47.svg) |
| U13-V48 | E07 | SET: phần tử không lặp | Thêm 3 vào tập {1,3,5} không tăng số phần tử; nối với TYPE và DEFINE. | [PNG](png/u13-v48.png) · [SVG](svg/u13-v48.svg) |
| U13-V49 | E08 | Chèn cùng key vào ba organisation | Key 18 được append, chèn theo thứ tự hoặc đặt vào slot từ hash. | [PNG](png/u13-v49.png) · [SVG](svg/u13-v49.svg) |
| U13-V50 | E09 | Điểm dừng khi tìm tuần tự | Tìm 20 trong sequential tăng dần dừng ở 25; serial phải tới cuối. | [PNG](png/u13-v50.png) · [SVG](svg/u13-v50.svg) |
| U13-V51 | E10 | Hai đường direct access | Sequential có index tra key–địa chỉ; random tính hash rồi so key. | [PNG](png/u13-v51.png) · [SVG](svg/u13-v51.svg) |
| U13-V52 | E11 | MOD, slot và địa chỉ byte | 1030 MOD 3 = 1; slot 1 tại base 4096 + 64 = 4160 bytes trong ví dụ riêng. | [PNG](png/u13-v52.png) · [SVG](svg/u13-v52.svg) |
| U13-V53 | E12 | Collision: cùng đường dò khi lưu và tìm | 27 và 37 hash vào 7; lưu 37 tại 8, tìm phải so key tại 7 rồi 8. | [PNG](png/u13-v53.png) · [SVG](svg/u13-v53.svg) |
| U13-V54 | E13 | Working khi mã hóa số âm | Đổi 6.5 sang binary, bù hai mantissa để mã hóa -6.5; exponent vẫn +3. | [PNG](png/u13-v54.png) · [SVG](svg/u13-v54.svg) |
| U13-V55 | E13 | Bẫy -0.5 sau khi bù hai | 11000000/0000 và 10000000/1111 bằng nhau; chỉ cặp thứ hai chuẩn hóa. | [PNG](png/u13-v55.png) · [SVG](svg/u13-v55.svg) |
| U13-V56 | E14 | Giải mã M và E theo trọng số | 10110000/1110 cho I=-80 và E=-2; kết quả -0.15625. | [PNG](png/u13-v56.png) · [SVG](svg/u13-v56.svg) |
| U13-V57 | E15 | Chuẩn hóa cặp M/E đã cho | 00011000/0100 dịch mantissa trái 2 và giảm exponent 2 thành 01100000/0010. | [PNG](png/u13-v57.png) · [SVG](svg/u13-v57.svg) |
| U13-V58 | E15 | Chuẩn hóa binary nhỏ hơn 1 | 0.00011₂ = 0.11₂ × 2^-3; không đảo nhầm dấu exponent. | [PNG](png/u13-v58.png) · [SVG](svg/u13-v58.svg) |
| U13-V59 | E16 | Chọn bit cho bốn giới hạn | Bốn cặp M8/E4 chuẩn hóa và giá trị; phân biệt âm nhỏ nhất với âm gần 0. | [PNG](png/u13-v59.png) · [SVG](svg/u13-v59.svg) |
| U13-V60 | E17 | Phân bổ lại 16 bit | M12/E4 thành M10/E6; giảm precision nhưng mở rộng miền exponent. | [PNG](png/u13-v60.png) · [SVG](svg/u13-v60.svg) |
| U13-V61 | E18 | Truncation và rounding cho kết quả khác | 113.75 có phần mantissa dư 11; M8 giữ 113 khi cắt, 114 khi làm tròn gần nhất. | [PNG](png/u13-v61.png) · [SVG](svg/u13-v61.svg) |
| U13-V62 | E19 | Overflow và underflow trên trục ngắt | Biên dương M8/E4: 1/512 và 127; 1/1024 quá gần 0, 200 quá lớn. | [PNG](png/u13-v62.png) · [SVG](svg/u13-v62.svg) |
| U13-V63 | X01 | Subrange khác array field | Một số bản sao trong 1..10 quyết định số phần tử của array mã con. | [PNG](png/u13-v63.png) · [SVG](svg/u13-v63.svg) |
| U13-V64 | X02 | PRIVATE và đường truy cập qua method | Mã ngoài không truy cập trực tiếp Name; dùng GetName/SetName trong class. | [PNG](png/u13-v64.png) · [SVG](svg/u13-v64.svg) |
| U13-V65 | X03 | Luồng đọc và ghi random file | SourceFile → GETRECORD → ThisRecord → PUTRECORD → TargetFile; SEEK trên đúng file. | [PNG](png/u13-v65.png) · [SVG](svg/u13-v65.svg) |
| U13-V66 | Kiểm tra | Đọc ngược để kiểm tra đáp án | Kiểm tra 8/4 bit, chuẩn hóa 10, exponent +3, rồi đọc ngược ra -6.5. | [PNG](png/u13-v66.png) · [SVG](svg/u13-v66.svg) |

## Dùng khi giảng và ôn tập

Đọc đề trước → gọi tên dạng → dùng hình để truy vết từng bước → tự viết working → đối chiếu đúng MS. Hình minh họa phương pháp, không thay đáp án đầy đủ. Nhãn bit, tên biến và tên câu lệnh giữ tiếng Anh; chú thích ngắn bằng tiếng Việt.

Các sơ đồ là ví dụ do bộ tài liệu biên soạn, không phải ảnh chụp hoặc bản sao hình trong đề thi. Link đề/MS trong [manifest](visual_manifest.json) và thư viện chỉ dẫn tới câu có dạng liên quan. V52 dùng ví dụ địa chỉ bổ sung; V59/V62 giả định M8/E4 bù hai chuẩn hóa, không dùng mô hình IEEE 754/subnormal. V61 tách rõ truncation và round-to-nearest. V63 bám cú pháp subrange của câu lịch sử được dẫn ở X01. Mũi tên trong V65 chỉ luồng dữ liệu; khi viết pseudocode, dùng cú pháp GETRECORD/PUTRECORD đầy đủ trong bài học.

ZIP hình chứa thư viện và 52 tệp ảnh; để mở thêm bài học hoặc đề/MS từ thư viện, dùng ZIP toàn bộ Chapter 13 hoặc giữ thư mục `exam_visuals` cạnh EXAM_PATTERNS.html và exam_sources như cấu trúc gốc.

## Cách tạo và kiểm tra

Mở rộng thư viện SVG hiện có bằng `tools/build_exam_visuals.py`; xuất PNG bằng Sharp. Hình được dựng từ bit, record, slot, đường nối và nhãn chính xác, không tạo bằng mô hình ảnh. Danh sách mô tả trong bảng là đặc tả cho từng hình; mã nguồn tái tạo được nằm trong thư mục tools của bộ Chapter 13.

Kiểm tra gồm: giá trị floating-point, bit chuẩn hóa, phép MOD/địa chỉ, đường dò collision, kích thước/alpha PNG, chồng chữ, link tới mục E/X và hiển thị handbook. Kết quả lưu tại `qa`.
