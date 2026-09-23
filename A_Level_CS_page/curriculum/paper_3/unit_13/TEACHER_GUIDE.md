# Chapter 13 — Hướng dẫn giảng dạy và chấm bài

## 1. Sử dụng bộ tài liệu

Gửi STUDENT_HANDBOOK.html cho học viên: bài học, visual, bài luyện, ôn tập và lab. Bản TEACHER_HANDBOOK.html bổ sung kế hoạch và lời giải. Đây là tài liệu Unit13, không thay thế toàn bộ kiến thức A Level hoặc mark scheme của từng đề.

Ba lượt học: **hiểu cơ chế → làm bài có giải thích → làm lại độc lập**. Chiếu từng visual liên quan, yêu cầu học viên dự đoán bước kế tiếp rồi mới chỉ đáp án. Các visual là hình riêng, không biến cả slide thành ảnh.

## 2. Tiến trình 8 khối bài

Mỗi khối có thể chia thành1–2 tiết tùy nền lớp. Thời gian gợi ý60–90 phút/khối; làm thêm lab và bài tập ngoài giờ khi cần.

| Khối | Trọng tâm và cách dạy | Visual | Bài luyện / kiểm tra kết thúc |
|---|---|---|---|
| 1 | Chẩn đoánD1–D2; từ dữ liệu rời đến enum/record, phân biệt TYPE/DECLARE/assignment | V01–07 | 1–4,29; học viên tự chọn field type cho bài mới |
| 2 | Pointer đổi giá trị; hợp/giao; class và hai object; Lab1 | V08–12 | 5–8,30; truy vết qua địa chỉ và giải thích instance |
| 3 | Cùng bộ key với3 organisation; index, hit rate và lý do lựa chọn | V13–18 | 9–11,31,48; dừng sớm được trong trường hợp nào? |
| 4 | Slot khác byte address; collision và đường dò; Lab2 | V19–23 | 12–15,32–33; tự truy vết tìm khóa không tồn tại |
| 5 | D1–D8 phần binary; trọng số và dịch binary point; M/E cùng âm | V24–28 | 16–18,34–35,37; ghi rõ dấu và 2^E |
| 6 | Mã hóa qua binary/phân số; đổi độ dài; chuẩn hóa giữ giá trị | V29–31 | 19–22,36,38–40; kiểm tra ngược từng đáp án |
| 7 | Limits, precision/range; số âm làm tròn; V36 với mô hình cộng rõ ràng | V32–38 | 23–27,41–47; Lab3; không trộn mô hình float |
| 8 | Ôn theo3 chủ đề; bài tổng hợp; chấm theo ý và sửa lỗi | V39–40 | 28,48; câu cuối chương/đề chọn lọc theo bản đồ nguồn |

Trong mỗi khối:10% thời gian gọi lại kiến thức;30% giải thích/ví dụ;40% học viên làm;20% giải thích lỗi và kiểm tra kết thúc. Đây là gợi ý tổ chức, không thời lượng Cambridge bắt buộc.

## 3. Đáp án chẩn đoán AS

**D1:** STRING, INTEGER, REAL, DATE, BOOLEAN. Phone dùng STRING để giữ0 đầu/ký tự+ và không phải đại lượng để tính.

**D2:** một mẫu:

```text
TYPE TBook
   DECLARE BookID : STRING
   DECLARE Title : STRING
   DECLARE PageCount : INTEGER
   DECLARE Available : BOOLEAN
ENDTYPE
DECLARE Book : TBook
Book.BookID ← "B027"
Book.Title ← "Computing"
Book.PageCount ← 320
Book.Available ← TRUE
OUTPUT Book.Title
```

**D3:** READ đọc, WRITE ghi, APPEND thêm cuối. Dùng file riêng của bài; mẫu pseudocode:

```text
DECLARE Line : STRING
OPENFILE "study.txt" FOR WRITE
WRITEFILE "study.txt", "Binary"
WRITEFILE "study.txt", "Files"
CLOSEFILE "study.txt"
OPENFILE "study.txt" FOR APPEND
WRITEFILE "study.txt", "Records"
CLOSEFILE "study.txt"
OPENFILE "study.txt" FOR READ
WHILE NOT EOF("study.txt") DO
   READFILE "study.txt", Line
   OUTPUT Line
ENDWHILE
CLOSEFILE "study.txt"
```

**D4:**48=00110000; -55=11001001;11111011=-5;16 bit:-32768..32767.

Bản chương trình chạy được cho D3 ở `labs/file_demo.py`. Học viên nên tự viết trước, sau đó đối chiếu kết quả; mẫu tạo, append và đọc trong thư mục tạm của bài.

**D5:**00110001+00011110=01001111=79.126+2=128 vượt127; kết quả cắt về8 bit10000000 đọc thành-128, có signed overflow. Việc có/không có carry cuối không đủ để quyết định signed overflow.

**D6:**0.625×2=1.25 lấy1;0.25×2=0.5 lấy0;0.5×2=1 lấy1, nên0.101₂.0.1011₂=1/2+1/8+1/16=0.6875.

**D7:**1.23×10^5;1.25×10^-5;(11/16)×2^3.

**D8:**0001.1000₂=1.5; giá trị nguyên24 chia2^4. Fixed-point vẫn có phần lẻ vì trọng số các bit bên phải dấu chấm nhỏ hơn1.

## 4. Chấm và phản hồi

- Bài1–28: dùng ANSWERS, ghi ý đúng/thiếu, không chỉ đánh dấu kết quả.
- Bài29–48: dùng EXTENDED_ANSWERS,100 điểm; đánh giá riêng3 phần.
- Labs: mỗi bài10 điểm theo LABS. Đáp án lập trình nằm trong labs/reference_solutions.py; kết quả chạy nằm trong labs/reference_results.json.
- Với bài tính: tách điểm đọc số bit, phương pháp, M, E, kết quả/kiểm tra. Không phạt lặp lại cùng lỗi bằng một quy tắc tự đặt nếu đang chấm đề thật; dùng mark scheme đi kèm.
- Với bài chọn thiết kế: chấp nhận phương án phù hợp điều kiện đề và có lý do. Nếu đề buộc3 organisation khác nhau như câu48 thì phải đáp ứng điều kiện đó.

Mỗi học viên giữ nhật ký: mã câu → lỗi cụ thể → quy tắc sửa → câu tương tự → ngày làm lại. Mục tiêu nội bộ80% mỗi nhóm là điều kiện chuyển bài, không dự đoán grade A/A*.

## 5. Những điểm giáo viên phải làm rõ

1. Enum+1 ở đây theo quy ước thứ tự trong sách; tránh áp vào mọi ngôn ngữ.
2. Một số ví dụ trong sách và tài liệu pseudocode tham khảo có tên/kiểu không nhất quán; dùng mẫu đã kiểm tra kiểu của bộ này.
3. High/low hit rate đang nói record sử dụng trong lượt xử lý, không cache.
4. Sách chủ yếu8+8; bài nền8+4 nhằm giảm phép tính. Phải cho làm bài38–42 để chuyển định dạng.
5. V36 chỉ làm tròn đầu vào, không làm tròn các tổng. Lab3 là nơi đối chiếu với mô hình làm tròn sau từng phép cộng.
6. Không khôi phục lỗi in của sách để làm tài liệu “giống100%”. Xem SOURCE notes và BOOK_ALIGNMENT_REVIEW.
7. Phạm vi thi: đối chiếu đúng năm thi của lớp. Mục13 đã được đối chiếu syllabus2026 và2027–2029; không suy ra mọi chương hoặc quy định thi của hai bản đều giống nhau.

## 6. Đọc sách và luyện đề

Dùng BOOK_ACTIVITY_MAP để gắn các hoạt động/câu cuối chương với bài mới. Dùng các QP/MS đã chỉ rõ trong SOURCES_AND_TEACHER_NOTES cho lượt cuối; học viên mở QP trước MS. Các bài từng dùng để luyện không còn là đề mock chưa từng xem.

## Dạy mục 13.4 — Chapter 13 in Past Papers

Dùng [22 dạng bài](EXAM_PATTERNS.html) và [bảng nguồn](EXAM_SOURCE_REGISTER.md). Mỗi lượt: 3 phút nhận diện và giải thích vì sao; học viên tự giải một ý theo thời gian phù hợp số điểm; đối chiếu MS đúng variant; sửa lỗi và quay lại G tương ứng. Che MS trước khi làm. Tách X01–X03 để bổ sung array/OOP/file pseudocode khi cần. Lỗi cần ghi: nhận sai dạng, thiếu kiến thức, sai thao tác, thiếu working, thiếu ý theo đề. Điểm của câu nguồn chỉ là ví dụ cho cách chấm câu đó.
