# Chapter 13 - Danh mục 40 visual

Ngày lập và hoàn thành: 15/09/2026. **Đã tạo đủ 40 hình độc lập (SVG + PNG).** Xem [thư viện ảnh](index.html) và [hướng dẫn sử dụng](README.md). Nội dung bên dưới là brief tham chiếu cho bộ ảnh.

## Tóm tắt

**40 ý tưởng visual: 28 cốt lõi + 12 củng cố.** Mỗi mã là một chủ đề hình; một hình quy trình có thể gồm nhiều khung. Chưa tính bản không nhãn, bản có đáp án hoặc từng frame hoạt cảnh thành visual riêng.

| Nhóm | Số visual | Mã |
|---|---:|---|
| Mở đầu, kiến thức nền | 2 | V01-V02 |
| 13.1 User-defined data types | 10 | V03-V12 |
| 13.2 File organisation and access | 11 | V13-V23 |
| 13.3 Floating-point | 15 | V24-V38 |
| Ôn tập và bài tổng hợp | 2 | V39-V40 |

Tham khảo 16 hình đánh số trong sách (Fig.13.1-13.16), bảng13.1-13.2, các khung pseudocode và worked examples; bổ sung hình cho kiến thức đã triển khai trong STUDENT_GUIDE.md và PRACTICE.md. Hình học tập tập trung vào dữ liệu, quan hệ và thao tác mà học viên cần nhìn thấy.

Số trang tham chiếu là **trang in trong sách**; với PDF đã cung cấp, trang PDF = trang in + 16. Bố cục hình mới dùng ví dụ lớp học trong tài liệu đã chuẩn bị.

## Danh mục chi tiết

“Cốt lõi” là mức ưu tiên sản xuất để giải thích cơ chế. “Củng cố” phục vụ ôn nền, đối chiếu hoặc mở rộng cùng cơ chế. Cả hai cùng thuộc danh mục bao phủ toàn chương.

### Tổng quan

| Mã | Visual | Nội dung phải nhìn thấy | Dạng hình | Ưu tiên | Bài / Guide / Câu luyện | Tham khảo sách |
|---|---|---|---|---|---|---|
| U13-V01 | **Bản đồ toàn bộ Chapter 13** | Ba nhánh: thiết kế dữ liệu → tổ chức/lấy dữ liệu → biểu diễn số; mỗi nhánh có tên kỹ năng đầu ra, nối về bài toán quản lý học viên. | Sơ đồ khái niệm | Cốt lõi | Bài Mở đầu; Guide Toàn chương; câu 1-28 | tr.304, mục tiêu chương; bố cục mới |
| U13-V02 | **Cầu nối kiến thức AS → A Level** | Bốn cặp: primitive types → user-defined types; record/file → organisation/access; binary fraction → mantissa; integer two’s complement → exponent. Mỗi cặp một ví dụ ngắn. | Bốn thẻ đối chiếu | Củng cố | Bài Mở đầu; Guide Kiến thức đầu vào; câu Chẩn đoán đầu vào | tr.304, 308, 312, What you should already know; bố cục mới |

### 13.1

| Mã | Visual | Nội dung phải nhìn thấy | Dạng hình | Ưu tiên | Bài / Guide / Câu luyện | Tham khảo sách |
|---|---|---|---|---|---|---|
| U13-V03 | **Vì sao cần user-defined type?** | Bên trái là dữ liệu rời của hai học viên dễ trộn; bên phải là hai record cùng khuôn TStudent. Làm nổi bật việc gom đúng dữ liệu của từng người. | Trước/sau | Củng cố | Bài 1; Guide 1.1; câu 1, 3 | tr.305, phần giải thích; bổ sung sơ đồ |
| U13-V04 | **Cây phân loại kiểu dữ liệu** | Nhánh non-composite gồm enum, pointer; nhánh composite gồm record, set, class/object. Mỗi lá có một biểu tượng và một ví dụ dữ liệu. | Cây phân loại | Cốt lõi | Bài 1-2; Guide 1.1; câu 7 | tr.305-307; vẽ mới, dùng phân loại đã đối chiếu syllabus |
| U13-V05 | **Enum: kiểu, biến và giá trị** | TYPE TStudyStatus với Active/Paused/Completed; biến Status chọn một giá trị. Tách rõ ba nhãn Type / Variable / Value; enum Active không có dấu ngoặc kép. | Sơ đồ kết hợp chú thích mã | Cốt lõi | Bài 1; Guide 1.2; câu 2 | tr.305, ví dụ Tmonth; thay bằng ví dụ lớp học |
| U13-V06 | **Record: từ định nghĩa đến một học viên** | Nối từng dòng TYPE TStudent tới field tương ứng trong record Learner; StudentID/FullName/Phone là STRING, LessonsAttended INTEGER, Status enum. Tô nổi đường Learner.FullName. | Sơ đồ field + mã | Cốt lõi | Bài 1; Guide 1.3; câu 3-4 | tr.307, record example; sửa lựa chọn kiểu theo ý nghĩa |
| U13-V07 | **Một record và array of records** | Một thẻ record bên cạnh 3 ô của ARRAY[1:20] OF TStudent; phóng to phần tử thứ 2 để chỉ ra các field khác kiểu bên trong mỗi record. | Sơ đồ lồng nhau | Củng cố | Bài 1; Guide 1.3; câu 3, 28 | Bổ sung từ Guide 1.3; nối kiến thức Ch.10 với Ch.13 |
| U13-V08 | **Pointer: địa chỉ và giá trị** | Hai ô bộ nhớ: ScorePointer chứa địa chỉ minh họa; Score chứa 42. Mũi tên phân biệt ^Score lấy địa chỉ và ScorePointer^ đọc giá trị. Ghi rõ địa chỉ là giả lập. | Sơ đồ bộ nhớ | Cốt lõi | Bài 2; Guide 1.4; câu 5 | tr.306, pointer/dereferencing; mở rộng chú thích thành sơ đồ |
| U13-V09 | **Pointer thay đổi gì khi dữ liệu đổi?** | Hai trạng thái Score=42 và Score=50; pointer vẫn giữ cùng địa chỉ. Đầu ra khi dereference đổi từ 42 sang 50. | Chuỗi 2 khung | Củng cố | Bài 2; Guide 1.4; câu 5 | tr.306 + ví dụ Guide 1.4; bổ sung trạng thái |
| U13-V10 | **Set: phần tử, hợp và giao** | Hai tập SkillsA={Binary,Files}, SkillsB={Files,Records}; tô miền giao Files, một khung riêng cho hợp; không lặp phần tử. Có dòng SET OF STRING liên kết với hình. | Venn + tập kết quả | Cốt lõi | Bài 2; Guide 1.5; câu 6 | tr.305, 307, set và union/intersection; hình bổ sung |
| U13-V11 | **Enum và set: một lựa chọn hay nhiều phần tử?** | Hai cột: CurrentLevel chọn ASLevel hoặc ALevel; CompletedUnits chứa nhiều unit. Minh họa một giá trị enum và một tập hiện có, tránh hiểu enum là danh sách nhiều lựa chọn đồng thời. | Đối chiếu hai cột | Củng cố | Bài 2; Guide 1.2, 1.5; câu 7 | tr.305, 307; tổng hợp mới |
| U13-V12 | **Class → hai object có trạng thái riêng** | Một khuôn TCounter có Value và Increment()/GetValue(); tạo CounterA, CounterB. Gọi Increment trên A, chỉ A đổi 0→1, B vẫn 0. | Sơ đồ instance + 2 trạng thái | Cốt lõi | Bài 2; Guide 1.6; câu 8 | tr.307, Classes; ví dụ mới từ Guide |

### 13.2

| Mã | Visual | Nội dung phải nhìn thấy | Dạng hình | Ưu tiên | Bài / Guide / Câu luyện | Tham khảo sách |
|---|---|---|---|---|---|---|
| U13-V13 | **Organisation và access là hai lớp khác nhau** | Lớp trên: quy tắc lưu serial/sequential/random. Lớp dưới: sequential/direct access. Nối serial→sequential; sequential→sequential và direct qua index; random→direct qua hash. | Sơ đồ ánh xạ | Cốt lõi | Bài 3; Guide 2.1-2.2; câu 9-11 | tr.308-310 và bài ghép ở tr.327; tổng hợp mới |
| U13-V14 | **Serial, sequential và random trên cùng bộ record** | Dùng cùng khóa đến theo thứ tự 25,12,31,18. Serial giữ thứ tự đến; sequential là 12,18,25,31; random dùng Key MOD 10 cho slot 5,2,1,8. Ghi cả key lẫn slot, không chỉ xáo vị trí tùy ý. | Ba hàng record | Cốt lõi | Bài 3; Guide 2.1; câu 9-10 | Fig.13.1 tr.308; Fig.13.2 và 13.4 tr.309 |
| U13-V15 | **Serial append: thêm vào cuối tệp** | Chuỗi sự kiện có thời điểm và record key; record mới đi vào ô cuối. Giữ trật tự theo lúc thêm, không tự sắp lại theo key. | Trước/sau | Củng cố | Bài 3; Guide 2.1; câu 9-10 | Fig.13.1 tr.308 |
| U13-V16 | **Sequential insertion: chèn đúng thứ tự key** | Từ 12,18,25,31 thêm 20 thành 12,18,20,25,31. Đánh dấu vị trí logic cần chèn; chú thích có thể cần tổ chức lại tệp, không hàm ý mọi hệ thống ghi đè tại chỗ. | Chuỗi 3 khung | Củng cố | Bài 3; Guide 2.1; câu 9 | Fig.13.2-13.3 tr.309 |
| U13-V17 | **Sequential search: tìm và dừng sớm** | Tìm 20 trong 12,18,25,31; con trỏ đọc lần lượt 12→18→25 rồi dừng vì 25>20. Nhánh phụ: serial chưa sắp không dùng được điều kiện dừng này. | Dải record với đường đọc | Cốt lõi | Bài 3; Guide 2.2; câu 11 | Fig.13.5 tr.310; ví dụ mới từ Guide |
| U13-V18 | **Direct access bằng index** | Bảng index key→địa chỉ ở bên trái; tệp đã sắp key ở bên phải; một lần chọn key dẫn tới đúng record. Địa chỉ giả lập nhất quán. | Sơ đồ index → record | Cốt lõi | Bài 3; Guide 2.2; câu 11 | tr.310, Direct access; hình bổ sung |
| U13-V19 | **Hashing: key → slot → địa chỉ byte** | N=10, Base=1000 byte, RecordSize=20 byte: key127→MOD10=7→1000+7×20=1140. Vẽ dải slot 0-9 kèm địa chỉ bắt đầu từng record. | Luồng tính toán + thước địa chỉ | Cốt lõi | Bài 4; Guide 2.3; câu 12 | Table13.1 tr.310, Activity13D tr.311; dữ liệu mới |
| U13-V20 | **Hash khóa chuỗi bằng tổng mã ký tự** | AC và CA tách thành mã65/67; cùng tổng132, MOD10=2. Cho thấy đổi thứ tự ký tự vẫn có thể cùng hash ở phương pháp đơn giản này. | Hai luồng hội tụ | Củng cố | Bài 4; Guide 2.3; câu 15b | Extension Activity13B tr.311; ví dụ mới |
| U13-V21 | **Collision: nhiều key cùng một slot** | 12,17,22 qua MOD5 cùng tới slot2; slot2 đã chứa12. Nhãn khác key / cùng hash; không cho hình diễn tả ghi đè record cũ. | Sơ đồ hội tụ | Cốt lõi | Bài 4; Guide 2.4; câu 13-15 | Table13.2 tr.311; dữ liệu mới |
| U13-V22 | **Dò tuyến tính: chèn, tìm, quay vòng và không tìm thấy** | Bảng5 slot; chèn14,19,24,10 thành [19,24,10,trống,14]. Các khung riêng: chèn24 đi4→0→1; tìm24 cùng đường; tìm29 đi4→0→1→2→3 rồi dừng. Giả thiết chỉ chèn, chưa xóa. | Chuỗi 4 khung hoặc hoạt cảnh | Cốt lõi | Bài 4; Guide 2.4; câu 13-14 | tr.311, cơ chế tìm vị trí trống kế tiếp; ví dụ Practice13-14 |
| U13-V23 | **Collision với overflow area** | Slot chính2 chứa12; 17 và22 ở vùng tràn. Tìm22 kiểm tra key12 rồi lần lượt vùng tràn. Tách bố cục vùng chính/vùng tràn và thể hiện đường truy hồi. | Sơ đồ hai vùng + đường đọc | Cốt lõi | Bài 4; Guide 2.4; câu 15a | tr.311, overflow area; hình bổ sung |

### 13.3

| Mã | Visual | Nội dung phải nhìn thấy | Dạng hình | Ưu tiên | Bài / Guide / Câu luyện | Tham khảo sách |
|---|---|---|---|---|---|---|
| U13-V24 | **Từ dạng khoa học đến M × 2^E** | Hai dòng: 6500=6.5×10^3 và 6.5=0.1101₂×2^3. Chỉ rõ cơ số, mantissa và exponent; không đồng nhất số mũ với giá trị 2^E. | Cầu nối hai hệ biểu diễn | Củng cố | Bài 5; Guide 3.1; câu 16-20 | Fig.13.6 tr.313; ví dụ mới |
| U13-V25 | **Bản đồ trọng số mantissa và exponent** | Hàng8 bit M có -1,1/2,…,1/128; hàng4 bit E có -8,4,2,1. Dấu chấm M ngay sau bit đầu; phân biệt hai bit dấu; ghi rõ mô hình Cambridge 8+4. | Lưới bit có trọng số | Cốt lõi | Bài 5; Guide 3.1; câu 16-18 | Fig.13.7 tr.313; thay cấu hình 8+8 thành 8+4 |
| U13-V26 | **Giải mã số dương từng bước** | M01101000, E0011; nối các bit1 tới 1/2+1/4+1/16=0.8125; E=3; kết quả6.5. Kèm vị trí dịch binary point. | Worked example 3 khung | Cốt lõi | Bài 5; Guide 3.2; câu 16 | Example13.1-13.2 tr.314-315; dùng dữ liệu Guide |
| U13-V27 | **Giải mã mantissa âm** | M10011000, E0011; tô trọng số -1 và các bit1/8,1/16; M=-0.8125, kết quả-6.5. Cảnh báo bit đầu không phải dấu gắn trước phần trị dương. | Worked example có trọng số | Cốt lõi | Bài 5; Guide 3.2; câu 17 | Example13.3 tr.315-316; ví dụ mới |
| U13-V28 | **Exponent âm: số nhỏ hơn, dấu không đổi** | M01010000, E1110; E=-8+4+2=-2; M0.625 chia4 ra0.15625. Trục số phóng to phần dương gần0, không vẽ số mũ âm thành kết quả âm. | Lưới bit + phép co trên trục số | Cốt lõi | Bài 5; Guide 3.2; câu 18 | Example13.4 tr.316-317; ví dụ mới dùng M dương |
| U13-V29 | **Mã hóa denary dương và âm** | Dòng dương:6.5→110.1₂→0.1101₂×2^3→01101000/0011. Dòng âm: đảo01101000 và cộng1→10011000, giữ E0011. Cuối mỗi dòng kiểm tra ngược. | Quy trình hai làn, 4 bước | Cốt lõi | Bài 6; Guide 3.3; câu 19-20 | Example13.5-13.7 tr.317-320; dữ liệu mới |
| U13-V30 | **Normalise số dương và bảo toàn giá trị** | 00101000/0100→01010000/0011; M nhân2, E giảm1; cả hai bằng5. Một khung nhỏ nhận diện01 hợp lệ và00 chưa chuẩn hóa. | Trước/sau + đẳng thức | Cốt lõi | Bài 6; Guide 3.4; câu 21 | Fig.13.8 tr.321, Example13.8 tr.322; dữ liệu mới |
| U13-V31 | **Normalise số âm và trường hợp -0.5** | 11101000/0101→10100000/0011: dịch2, E5→3, giữ-6. Khung riêng -0.5:11000000/0000→10000000/1111; đầu10 mới chuẩn hóa. | Hai ví dụ với các trạng thái | Cốt lõi | Bài 6; Guide 3.3-3.4; câu 22 | Example13.9 tr.322 + biên âm bổ sung từ Guide |
| U13-V32 | **Precision và range khi chia số bit** | Hai thanh16 bit so10M+6E với8M+8E; thêm zoom khoảng cách giá trị và phạm vi E(-32..31) so(-128..127). Không dùng chỉ một trục chung làm precision biến mất vì scale. | Thanh bit + hai khung so sánh | Cốt lõi | Bài 7; Guide 3.5; câu 25 | Fig.13.14-13.16 tr.324; cấu hình theo Guide |
| U13-V33 | **Bốn giới hạn của hệ 8+4 đã chuẩn hóa** | Bốn thẻ bit/giá trị: +127; +1/512; -128; -65/32768. Trục toàn cảnh có khung zoom riêng gần0; nêu âm/dương không đối xứng và chỉ xét số khác0 chuẩn hóa. | Bốn thẻ + trục có khung phóng to | Cốt lõi | Bài 7; Guide 3.5; câu 23 | Fig.13.10-13.13 tr.323; đổi hệ8+8 thành8+4 và tính lại |
| U13-V34 | **Hai nguyên nhân mất chính xác** | Hai hàng:0.1 có dãy0.000110011… vô hạn;13.375 có dãy hữu hạn nhưng vượt6-bit M. Dùng dấu kéo dài vô hạn ở hàng1 và vùng bit vượt dung lượng ở hàng2. | Đối chiếu hai dãy bit | Cốt lõi | Bài 7; Guide 3.6; câu 27 | tr.320-321, approximation; ví dụ Guide đã kiểm tra |
| U13-V35 | **Truncation và rounding-to-nearest** | Với6M+4E,13.375→13.0 nếu cắt,→13.5 nếu làm tròn gần nhất. Trục số tuyến tính thể hiện khoảng cách0.375/0.125; hàng bit011010 so011011, E0100. | Trục số + hai kết quả bit | Cốt lõi | Bài 7; Guide 3.6; câu 24 | tr.320-321; vẽ từ ví dụ tự tính, không dùng kết quả5.88 sai trong sách |
| U13-V36 | **Sai số tích lũy qua nhiều lần cộng** | Mô hình chỉ làm tròn đầu vào: nearest của 0.1 trong 8+4 là 0.099609375 (M=01100110, E=1101). Ba tổng chính xác của đầu vào đã xấp xỉ: 0.099609375; 0.19921875; 0.298828125. Không làm tròn tổng về 8+4; ghi rõ sai số có dấu. | Bảng 3 bước + độ lệch | Củng cố | Bài 7; Guide 3.6; câu 27,45; Lab 3 | Extension Activity13E tr.324; bổ sung phép tính có giả thiết rõ |
| U13-V37 | **Overflow và underflow trên bản đồ range** | Hai ô:100×2=200 vượt max127; (1/512)/2=1/1024 nằm dưới min dương chuẩn hóa. Gắn với khung zoom gần0; phân biệt underflow với dấu âm. | Hai phép tính + trục số | Cốt lõi | Bài 7; Guide 3.7; câu 26 | tr.325, Floating-point problems; hình mới |
| U13-V38 | **Số 0 và giới hạn của quy tắc chuẩn hóa** | Ba thẻ:01… số dương normalised;10… số âm normalised;00000000 là0 theo quy ước riêng. Gạch bỏ suy luận máy tính không lưu được0; không biểu diễn0.0000000×2^9=2. | Thẻ phân loại có trường hợp đặc biệt | Cốt lõi | Bài 6-7; Guide 3.4; câu 22, 27 | Fig.13.9 tr.322 và giải thích tr.325; thể hiện đúng việc mất bit |

### Ôn tập

| Mã | Visual | Nội dung phải nhìn thấy | Dạng hình | Ưu tiên | Bài / Guide / Câu luyện | Tham khảo sách |
|---|---|---|---|---|---|---|
| U13-V39 | **Bản đồ chọn phương pháp làm bài** | Ba tuyến: chọn kiểu→TYPE/DECLARE/use; chọn organisation/access→hash/key check; floating-point→bit count→M/E→normalise→check value. Gắn lỗi thường gặp tại mỗi nút. | Sơ đồ ôn tập | Củng cố | Bài 8; Guide 4; câu 1-27 | Bổ sung từ Guide4 và checklist |
| U13-V40 | **Một hệ thống kết nối cả ba phần** | Hồ sơ học viên dùng record/enum→tra cứu ID27/37 qua hash→lưu điểm6.5 bằng8+4; lịch sử thao tác lưu serial. Gắn nhãn phân biệt mô hình bài học với cấu trúc hệ thống thực tế. | Sơ đồ hệ thống học tập | Củng cố | Bài 8; Guide Bài tổng hợp; câu 28 | Bổ sung từ Practice28 |

## Đối chiếu toàn bộ hình đánh số trong sách

| Hình sách | Trang | Nội dung tham khảo | Visual đề xuất |
|---|---:|---|---|
| Fig.13.1 | 308 | Serial records | V14, V15 |
| Fig.13.2 | 309 | Records theo key | V14, V16 |
| Fig.13.3 | 309 | Chèn record đúng thứ tự | V16 |
| Fig.13.4 | 309 | Random organisation | V14, V19 |
| Fig.13.5 | 310 | Dừng tìm khi vượt key | V17 |
| Fig.13.6 | 313 | Dạng khoa học thập phân | V24 |
| Fig.13.7 | 313 | Trọng số M và E | V25 |
| Fig.13.8 | 321 | Nhiều biểu diễn cho cùng giá trị | V30 |
| Fig.13.9 | 322 | Dịch làm mất bit có nghĩa | V38; sửa cách thể hiện đẳng thức |
| Fig.13.10 | 323 | Dương lớn nhất | V33 |
| Fig.13.11 | 323 | Dương chuẩn hóa nhỏ nhất | V33 |
| Fig.13.12 | 323 | Âm chuẩn hóa gần0 nhất | V33 |
| Fig.13.13 | 323 | Âm có độ lớn lớn nhất | V33 |
| Fig.13.14 | 324 | Chia bit12M+4E | V32; ví dụ mới dùng10M+6E |
| Fig.13.15 | 324 | Chia bit8M+8E | V32 |
| Fig.13.16 | 324 | Chia bit4M+12E | V32; tham khảo nguyên lý trade-off |

Phần13.1 không có hình đánh số riêng: V03-V12 phát triển từ văn bản và các khung mã tr.305-307. Các hình index, collision, overflow area, sai số trên trục số và hệ thống tổng hợp cũng cần thiết kế bổ sung.

## Quy cách đề xuất khi bắt đầu vẽ

- **Ngôn ngữ:** tiêu đề và thuật ngữ trên hình bằng tiếng Anh; phần giải thích tiếng Việt đặt trong caption hoặc bài học, nhất quán với tài liệu hiện tại.
- **Hình thức:** sơ đồ phẳng, ô dữ liệu, bảng bit và mũi tên có nhãn. Với hình nhiều nhãn/số, ưu tiên vector hoặc mã dựng hình để kiểm soát chính xác nội dung; có thể xuất PNG để dùng trong slide.
- **Tỷ lệ:** phần lớn16:9; hình Venn/cây/class có thể4:3. Quy trình dài chia nhiều khung, tránh thu nhỏ chữ để nhồi một tấm.
- **Màu:** nền sáng; xanh đậm cho nội dung chính, teal cho dữ liệu đang chọn, cam cho bước đang xử lý, đỏ cho lỗi/va chạm. Luôn có nhãn hoặc ký hiệu kèm màu.
- **Bit:** dùng font monospace; số bit giữ đúng từng ô, M/E tách bằng đường viền và nhãn; binary point đặt chính xác.
- **Các lớp hiển thị:** với hình quy trình, chuẩn bị trạng thái đầu, bước xử lý và kết quả. Với hình dùng kiểm tra, có thể xuất thêm bản bỏ nhãn hoặc che kết quả.
- **Tên file tương lai:** u13-vXX-ten-ngan.svg / .png; các frame dùng hậu tố-step01, -step02; bản tự kiểm tra dùng-blank; đáp án dùng-key. Manifest hiện ghi status=planned, chưa coi các file đó đã tồn tại.
- **Truy cập nội dung:** mỗi visual cần caption nêu ý nghĩa và alt text mô tả quan hệ/kết quả, không chỉ ghi “diagram”.

## Các điểm cần kiểm tra trên hình

1. Pointer thuộc non-composite; nhãn địa chỉ và dữ liệu khác nhau. Ví dụ pointer phải trỏ đến đúng kiểu dữ liệu.
2. Enum hiển thị một giá trị đang được chọn; set không thứ tự/không trùng; không dùng mũi tên enum như chuyển trạng thái tự động.
3. Sequential organisation không đồng nghĩa chỉ có sequential access. Index/direct access phải xuất hiện ở V13/V18.
4. Random organisation phải có quy tắc định vị; không chỉ vẽ record bị xáo trộn.
5. Collision không làm ghi đè record của key khác; sơ đồ đọc phải kiểm tra key và dùng đúng đường dò/overflow. Dùng tên cơ chế rõ ràng thay cho nhãn open/closed hash dễ không thống nhất giữa nguồn.
6. Mặc định các visual floating-point dùng8M+4E; V32 dùng16bit tổng để so phân bổ, V35 dùng6M+4E. V36 dùng8M+4E với giả thiết làm tròn đã nêu. Mọi hình phải ghi cấu hình của chính nó.
7. Số âm là two’s complement; bit đầu của M có trọng số-1. E âm không quyết định dấu của kết quả.
8. Khi normalise, dịch M và sửa E đồng thời, có đẳng thức kiểm tra trước/sau; số0 là trường hợp riêng.
9. V33/V37 ghi rõ chỉ xét số khác0 đã chuẩn hóa; trục gần0 cần khung phóng to có nhãn, không vẽ khoảng cách sai như thể cùng thang tuyến tính.
10. V35 phân biệt truncate/round-to-nearest. Không lấy lại kết quả5.88→5.75 ở tr.321; không vẽ0×2^9=2 như đẳng thức đúng ở Fig.13.9.
11. V36 là mô hình sai số đã xác định, không phải biểu đồ đo từ runtime hoặc khẳng định Python luôn cho cùng output.
12. Các biến thể không nhãn/đáp án không được làm thay đổi số bit, key, thứ tự ô hoặc dữ liệu gốc giữa hai phiên bản.

## Trình tự sản xuất gợi ý

1. Chốt mẫu chung cho ba loại hình: sơ đồ dữ liệu(V06), tệp/hash(V19), lưới bit(V25).
2. Hoàn thiện 28 visual cốt lõi theo thứ tự bài học, kiểm tra nhãn và phép tính trước khi xuất.
3. Thêm12 visual củng cố; xuất bản không nhãn cho bài tự kiểm tra khi phù hợp.

Đây là đề xuất thiết kế và phân bổ hình, chưa phải danh sách ảnh có sẵn hoặc yêu cầu đã tạo ảnh.

## Nguồn local

- [Sách Chapter13](<D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf>), trang304-327.
- [Bài học đã chuẩn bị](<D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/A_Level_CS_page/curriculum/paper_3/unit_13/STUDENT_GUIDE.md>).
- [Bài tự luyện](<D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/A_Level_CS_page/curriculum/paper_3/unit_13/PRACTICE.md>).
- [Đáp án](<D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/A_Level_CS_page/curriculum/paper_3/unit_13/ANSWERS.md>).
- [Nguồn và lưu ý về lỗi trong sách](<D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/A_Level_CS_page/curriculum/paper_3/unit_13/SOURCES_AND_TEACHER_NOTES.md>).
