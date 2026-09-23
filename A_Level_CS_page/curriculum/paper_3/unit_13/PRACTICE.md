# Unit 13 - 28 câu tự luyện

Bài tự biên soạn, không phải đề thi Cambridge. Làm trước khi mở [đáp án](ANSWERS.md). Không dùng máy tính cho phần binary; ghi các bước để giáo viên thấy cách suy luận. Mỗi câu được đánh dấu đạt khi làm đúng tất cả yêu cầu, hoặc ghi rõ phần còn sai để luyện lại.

## A. User-defined types - câu 1-8

1. Nêu hai lý do một chương trình quản lý lớp học cần user-defined data types. Mỗi lý do phải gắn với một ví dụ.
2. Định nghĩa enum `TLevel` gồm `ASLevel, ALevel`. Khai báo biến `CurrentLevel` và gán `ASLevel`. Phân biệt tên kiểu, tên biến và giá trị.
3. Định nghĩa record `TCourseRegistration` gồm mã đăng ký có cả chữ và số, tên học viên, số điện thoại, ngày bắt đầu, cấp học dùng TLevel và học phí. Chọn kiểu phù hợp cho từng field.
4. Khai báo biến `Registration` theo record ở câu 3; gán mã `R009`, cấp học `ALevel` và học phí `450.0`. Giải thích vì sao số điện thoại không nên dùng INTEGER.
5. Truy vết đoạn sau. Nêu đầu ra và giải thích vì sao pointer không giữ bản sao giá trị ban đầu.

```text
TYPE TIntPointer = ^INTEGER
DECLARE Count : INTEGER
DECLARE P : TIntPointer
Count ← 12
P ← ^Count
Count ← Count + 3
OUTPUT P^
```

6. Định nghĩa set type chứa INTEGER và một set `CompletedUnits` chứa 1, 3, 5. Tìm hợp và giao của hai tập `{1,3,5}` và `{3,4,5}`. Giải thích vì sao kết quả không chứa phần tử lặp.
7. Phân loại enum, pointer, record, set và class/object thành composite hoặc non-composite. Giải thích khác nhau giữa enum và set bằng tình huống chọn khóa học.
8. Một class `TQuiz` có field Score và method AddMark. Hai object QuizA, QuizB cùng khởi tạo Score=0. Chỉ QuizA gọi AddMark một lần để cộng 1. Cho biết điểm của từng object; phân biệt class, object, field, method.

## B. File organisation and access - câu 9-15

9. So sánh serial với sequential organisation trên hai tiêu chí: thứ tự lưu và cách thêm bản ghi. Nêu một điểm giống nhau.
10. Với từng tình huống, đề xuất organisation và access, kèm lý do: (a) ghi các sự kiện theo thời điểm tới; (b) xử lý tất cả hồ sơ theo mã tăng dần mỗi tháng; (c) tìm một hồ sơ theo mã để cập nhật.
11. Một sequential file có key `12,18,25,31`. Khi tìm 20 bằng sequential access, đọc những key nào và dừng ở đâu? Giải thích làm thế nào tệp này có thể hỗ trợ direct access.
12. File có 10 slot đánh số 0-9, bắt đầu tại byte 2000, mỗi record 32 byte. Hash là Key MOD 10. Tính slot và địa chỉ của key 236.
13. Bảng rỗng có 5 slot 0-4; hash Key MOD 5; dùng dò tuyến tính quay vòng, không xóa phần tử. Chèn lần lượt `14,19,24,10`. Vẽ bảng cuối và liệt kê các slot phải kiểm tra khi tìm 24.
14. Tiếp bảng câu 13, tìm khóa 29. Liệt kê các slot kiểm tra, điều kiện kết thúc và kết luận. Giải thích vì sao không được lấy luôn record ở hash slot làm kết quả.
15. (a) Mô tả cách lưu và tìm một record bị collision khi dùng overflow area. (b) Với mã A=65, B=66, C=67 và hash bằng tổng mã MOD 7, tính hash của AB và BA; giải thích ý nghĩa kết quả.

## C. Floating-point - câu 16-27

Trừ câu 24, tất cả các câu dùng **8 bit mantissa và 4 bit exponent**, cả hai là two's complement, dấu chấm nhị phân ở ngay sau bit đầu của mantissa. Khi hỏi giới hạn, chỉ xét số khác 0 đã normalise.

16. Đổi `M=01110000, E=0010` sang denary. Ghi riêng M và E.
17. Đổi `M=10110000, E=0011` sang denary. Không dùng sign-and-magnitude.
18. Đổi `M=01100000, E=1101` sang denary. Giải thích vì sao giá trị cuối là số dương dù E âm.
19. Biểu diễn +9.25 ở dạng floating-point đã normalise; trình bày quá trình đổi.
20. Biểu diễn -9.25 ở dạng floating-point đã normalise; thể hiện bước two's complement và kiểm tra ngược.
21. Normalise `M=00011000, E=0101`. Chứng minh biểu diễn trước và sau có cùng giá trị.
22. Normalise `M=11110000, E=0100`. Sau đó cho dạng normalised của -0.5 và giải thích vì sao mantissa `11000000` chưa normalised.
23. Tính số dương lớn nhất, số dương nhỏ nhất, số âm có độ lớn lớn nhất và số âm gần 0 nhất. Ghi cả bit pattern lẫn giá trị.
24. Riêng câu này dùng **6 bit mantissa và 4 bit exponent**. Biểu diễn 13.375 bằng (a) cắt bỏ bit thừa, (b) làm tròn đến giá trị gần nhất. Ghi giá trị thực sự được lưu và sai số tuyệt đối của từng cách.
25. Với tổng 16 bit, so sánh 10-bit M + 6-bit E với 8-bit M + 8-bit E về precision và range. Việc thêm bit exponent có bảo đảm lưu chính xác 0.1 không? Giải thích.
26. Phân loại: (a) kết quả 200; (b) kết quả 1/1024; (c) kết quả -6.5. Với mỗi trường hợp, cho biết overflow, underflow hay biểu diễn chính xác trong hệ 8+4 chuẩn hóa.
27. Phân biệt hai nguyên nhân mất chính xác: 0.1 có khai triển binary vô hạn và một số có khai triển hữu hạn nhưng dài hơn mantissa. Giải thích vì sao normalisation không khôi phục được bit đã mất; số 0 cần được xử lý thế nào?

## D. Tổng hợp - câu 28

28. Một trung tâm cần lưu học viên, tra cứu theo mã số nguyên và ghi lịch sử thao tác.

   a. Thiết kế enum trạng thái và record học viên gồm ID, tên, trạng thái, điểm REAL. Tạo một biến và gán các field.
   b. Chọn organisation/access cho hồ sơ tra cứu và cho lịch sử thao tác; giải thích riêng từng lựa chọn.
   c. Bảng hồ sơ có 10 slot, hash ID MOD 10, dùng dò tuyến tính; chèn ID 27 và 37 vào bảng rỗng. Tìm ID 37 phải đi qua đâu?
   d. Điểm của một bài là 6.5. Mã hóa theo định dạng 8+4 của phần C và kiểm tra ngược.
   e. Nếu một điểm khác không lưu chính xác được, cần giải thích cho người dùng điều gì về precision? Không mặc định cứ tăng exponent là giải quyết được.

## Sau khi làm

Ghi lại: câu sai → nguyên nhân → cách sửa → một câu tương tự tự tạo. Đánh giá riêng ba nhóm; không dùng điểm mạnh floating-point để che phần data types còn yếu hoặc ngược lại.

## Tiếp tục ôn thi

Làm [20 câu bổ sung 29–48](EXTENDED_PRACTICE.md) để luyện phương pháp khác, định dạng M/E thay đổi, làm tròn số âm và sai số tích lũy.
