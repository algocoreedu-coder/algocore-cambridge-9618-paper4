# Unit 13 - Đáp án và tự đánh giá

Đây là lời giải cho bài tự biên soạn, không phải mark scheme Cambridge. Chấp nhận tên biến khác nếu ý nghĩa, kiểu và thao tác đúng. Các câu thiết kế có thể có nhiều phương án hợp lý.

## A. User-defined types

**1.** Ví dụ: record gom các field thuộc một học viên để tái sử dụng cấu trúc; enum hạn chế trạng thái vào các lựa chọn có tên và thể hiện ý nghĩa rõ hơn một STRING tùy ý. Cần có cả lý do lẫn ví dụ, không chỉ viết “dễ dùng”.

**2.**

```text
TYPE TLevel = (ASLevel, ALevel)
DECLARE CurrentLevel : TLevel
CurrentLevel ← ASLevel
```

TLevel là kiểu; CurrentLevel là biến; ASLevel là giá trị enum.

**3.**

```text
TYPE TCourseRegistration
   DECLARE RegistrationID : STRING
   DECLARE StudentName : STRING
   DECLARE Phone : STRING
   DECLARE StartDate : DATE
   DECLARE Level : TLevel
   DECLARE Fee : REAL
ENDTYPE
```

**4.**

```text
DECLARE Registration : TCourseRegistration
Registration.RegistrationID ← "R009"
Registration.Level ← ALevel
Registration.Fee ← 450.0
```

Phone cần giữ số 0 đầu, có thể chứa dấu `+`, không dùng cho phép tính. Trong hệ thống tài chính thực tế có thể chọn số nguyên đơn vị tiền nhỏ nhất để tránh sai số; mẫu này dùng REAL nhằm luyện chọn kiểu theo yêu cầu đề.

**5.** 15. P trỏ tới Count; khi Count đổi từ 12 thành 15, giá trị đọc qua P^ cũng đổi. P giữ địa chỉ, không giữ bản sao 12.

**6.**

```text
TYPE TUnitSet = SET OF INTEGER
DEFINE CompletedUnits (1,3,5) : TUnitSet
```

Hợp: `{1,3,4,5}`. Giao: `{3,5}`. Set chỉ ghi sự có mặt của phần tử, không số lần xuất hiện.

**7.** Non-composite: enum, pointer. Composite: record, set, class/object. Enum chọn một cấp học; set lưu nhiều khóa/chủ đề đã hoàn thành cùng lúc.

**8.** QuizA.Score=1, QuizB.Score=0. Class định nghĩa cấu trúc/hành vi; object là instance cụ thể; Score là field; AddMark là method. Hai object có trạng thái riêng trong ví dụ.

## B. Organisation, access và hashing

**9.** Cả hai lưu các bản ghi lần lượt trong tệp. Serial theo thứ tự thêm vào và append cuối; sequential theo thứ tự key và chèn đúng vị trí theo key. Không khẳng định serial được sắp theo key.

**10.** Các phương án hợp lý:

- a: serial organisation, append khi ghi; sequential access khi đọc lại lịch sử.
- b: sequential organisation theo mã, sequential access để xử lý tất cả record.
- c: random organisation, direct access qua hash; hoặc sequential file có index hỗ trợ direct access. Lý do: chỉ cần một hồ sơ và có đường tra vị trí.

**11.** Đọc 12, 18, 25 rồi dừng; do key tăng dần, 20 không thể ở sau 25. Direct access có thể dùng index ánh xạ key sang địa chỉ record. Việc sắp key tự nó không tạo ra index.

**12.** Slot=`236 MOD 10=6`. Địa chỉ=`2000+6×32=2192` byte.

**13.**

| Slot | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Key | 19 | 24 | 10 | Trống | 14 |

14 vào 4; 19 thử 4 rồi 0; 24 thử 4,0,1; 10 thử 0,1,2. Tìm 24: 4→0→1.

**14.** 29 hash tới 4; kiểm tra 4→0→1→2→3. Slot 3 chưa dùng, nên không tìm thấy. Hash trùng không đồng nghĩa key trùng: record ở slot 4 có key 14. Điều kiện dừng này dựa trên giả thiết không xóa trong đề; trường hợp khác phải bảo toàn đường dò.

**15.** a: khi vị trí chính đã có khóa khác, tìm chỗ trống trong overflow area và lưu record; khi đọc, hash lại, so key ở vùng chính, rồi tìm đúng key ở vùng tràn. b: AB và BA cùng có tổng 131, `131 MOD 7=5`; hai khóa khác nhau cùng hash, nên có thể collision.

## C. Floating-point

**16.** M=112/128=0.875; E=2; X=3.5.

**17.** M=-1+1/4+1/8=-0.625; E=3; X=-5.

**18.** M=0.75; E=-8+4+1=-3; X=0.75/8=0.09375. M dương và 2^-3 dương nên X dương.

**19.** `9.25=1001.01₂=0.100101₂×2^4`. M=`01001010`, E=`0100`. Kiểm tra: 74/128×16=9.25.

**20.** Đảo `01001010` thành `10110101`, cộng 1 thành `10110110`; E=`0100`. M có giá trị -74/128, nhân 16 được -9.25. Hai bit đầu `10` cho biết đã normalise.

**21.** `00011000` dịch trái 2 vị trí thành `01100000`; E giảm 5→3: `0011`. Trước: 24/128×32=6. Sau: 96/128×8=6.

**22.** `11110000` dịch trái 3 vị trí thành `10000000`; E giảm 4→1: `0001`. Trước: -16/128×16=-2. Sau: -1×2=-2. Với -0.5: M=`10000000`, E=`1111` vì -1×2^-1=-0.5. `11000000` bắt đầu `11`, còn bit dấu lặp nên chưa normalise.

**23.**

| Giới hạn | Mantissa | Exponent | Giá trị |
|---|---|---|---|
| Dương lớn nhất | 01111111 | 0111 | 127 |
| Dương nhỏ nhất, đã chuẩn hóa | 01000000 | 1000 | 1/512 |
| Âm có độ lớn lớn nhất | 10000000 | 0111 | -128 |
| Âm gần 0 nhất, đã chuẩn hóa | 10111111 | 1000 | -65/32768 |

**24.** `13.375=0.1101011₂×2^4`. Với M 6 bit, chỉ có 5 bit phân số:

- Cắt: M=`011010`, E=`0100`, lưu 26/32×16=13.0, sai số 0.375.
- Làm tròn gần nhất: M=`011011`, E=`0100`, lưu 27/32×16=13.5, sai số 0.125.

**25.** 10+6 cho nhiều bit có ý nghĩa hơn, exponent -32..31. 8+8 cho ít bit có ý nghĩa hơn, exponent -128..127. Hệ thứ hai có phạm vi độ lớn rộng hơn. 0.1 có khai triển binary vô hạn; tăng E không giúp lưu chính xác mọi bit của mantissa, và tăng hữu hạn số bit M cũng không làm biểu diễn trở thành chính xác tuyệt đối.

**26.** a: overflow, vì 200>127. b: underflow trong mô hình chỉ số chuẩn hóa, vì 1/1024<1/512. c: biểu diễn chính xác, M=`10011000`, E=`0011`.

**27.** Khai triển vô hạn luôn cần xấp xỉ với bộ nhớ hữu hạn; khai triển hữu hạn có thể lưu đúng nếu đủ bit và đủ range. Normalisation chỉ phân bố lại M/E của giá trị hiện có, không biết các bit đã mất. Số 0 dùng quy ước riêng; không thỏa mẫu normalised 01/10 của số khác 0.

## D. Tổng hợp

**28.** Một lời giải:

```text
TYPE TStatus = (Active, Paused, Completed)
TYPE TLearner
   DECLARE ID : INTEGER
   DECLARE Name : STRING
   DECLARE Status : TStatus
   DECLARE Score : REAL
ENDTYPE
DECLARE Learner : TLearner
Learner.ID ← 27
Learner.Name ← "Lan"
Learner.Status ← Active
Learner.Score ← 6.5
```

Hồ sơ: random/direct qua hash hoặc sequential có index/direct. Lịch sử: serial/append và sequential khi đọc lại. ID 27 vào slot 7; ID 37 cũng hash 7 nên chuyển sang 8. Khi tìm 37, kiểm tra 7 rồi 8. Điểm 6.5: M=`01101000`, E=`0011`; 104/128×8=6.5. Nếu điểm khác bị xấp xỉ, giải thích giới hạn số bit mantissa và quy tắc làm tròn; E chủ yếu thay đổi range.

## Tự đánh giá

Đánh dấu từng câu: **tự làm đúng / đúng khi có gợi ý / cần học lại**. Chỉ đếm “tự làm đúng” khi tất cả ý của câu đều đúng và giải thích được. Theo tiêu chí 80% đề xuất: tối thiểu 7/8 câu nhóm A, 6/7 câu nhóm B và 10/12 câu nhóm C. Bài 28 dùng để kiểm tra khả năng kết nối, không thay thế các nhóm yếu.

## Đáp án phần mở rộng

[Đáp án và thang chấm câu 29–48](EXTENDED_ANSWERS.md), tổng 100 điểm luyện nội bộ.
