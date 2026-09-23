# Unit 13 - Bài học dành cho học viên

Đọc theo thứ tự. Sau mỗi phần, đóng ví dụ mẫu và làm lại bằng dữ liệu khác. Bảng mục tiêu và trình tự học nằm trong [README](README.md).

## 1. Kiểu dữ liệu tự định nghĩa - User-defined data types

### 1.1 Vì sao cần định nghĩa kiểu mới?

<a id="theory-1-1"></a>

Một chương trình quản lý lớp học cần lưu họ tên, mã học viên, trạng thái và số buổi đã học. Chỉ dùng các biến STRING hoặc INTEGER rời rạc sẽ khó thể hiện rằng chúng thuộc về cùng một học viên.

User-defined type cho phép đặt tên cho một cấu trúc dữ liệu hoặc một miền giá trị phù hợp bài toán. Nó làm ý nghĩa dữ liệu rõ hơn, giúp tái sử dụng và hỗ trợ kiểm tra kiểu. Việc kiểm tra dữ liệu nhập như số buổi không âm vẫn cần được thiết kế riêng.

| Kiểu | Dùng để làm gì? | Phân loại theo Cambridge |
|---|---|---|
| Enumerated | Một giá trị được chọn trong danh sách hữu hạn đã đặt tên | Non-composite |
| Pointer | Giữ địa chỉ của vị trí nhớ chứa dữ liệu có kiểu xác định | Non-composite |
| Set | Một tập các phần tử cùng kiểu, không lặp và không có thứ tự | Composite |
| Record | Nhóm các field liên quan; field có thể khác kiểu | Composite |
| Class/object | Kết hợp trạng thái với các thao tác trên trạng thái đó | Composite |

Composite gom nhiều thành phần dưới một tên. Không dùng mẹo “có nhắc đến kiểu khác thì là composite” để phân loại pointer: pointer vẫn được syllabus xếp là non-composite.

### 1.2 Enumerated: chọn một giá trị trong danh sách

<a id="theory-1-2"></a>

```text
TYPE TStudyStatus = (Active, Paused, Completed)
DECLARE Status : TStudyStatus
Status ← Active
```

- `TStudyStatus` là tên KIỂU; `Status` là một BIẾN có kiểu đó.
- `Active` là giá trị enum, không phải chuỗi `"Active"`.
- Enum có thứ tự theo khai báo. Không giả định tự quay vòng hoặc tự chuyển trạng thái.
- Hợp với trạng thái khóa học; không hợp với tên học viên vì tên không thuộc danh sách cố định nhỏ.

Luyện thao tác với **thứ tự enum**:

```text
TYPE TDay = (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
DECLARE Today : TDay
DECLARE Tomorrow : TDay
Today ← Wednesday
Tomorrow ← Today + 1
```

Theo quy ước thứ tự enum dùng trong sách, Tomorrow nhận Thursday. `+ 1` ở đây chọn phần tử kế tiếp theo thứ tự khai báo; không phải nối chuỗi hoặc tăng một mã tự đoán. Với Sunday, phải định nghĩa quy tắc ở biên:

```text
IF Today = Sunday THEN
   Tomorrow ← Monday
ELSE
   Tomorrow ← Today + 1
ENDIF
```

Chỉ có phép IF trên mới thể hiện yêu cầu quay vòng. Khi chuyển sang một ngôn ngữ lập trình, dùng thao tác enum mà ngôn ngữ đó hỗ trợ. Một trạng thái như Completed không mặc nhiên chuyển về Active chỉ vì thứ tự khai báo.

### 1.3 Record: lưu một đối tượng có nhiều field

<a id="theory-1-3"></a>

```text
TYPE TStudent
   DECLARE StudentID : STRING
   DECLARE FullName : STRING
   DECLARE Phone : STRING
   DECLARE LessonsAttended : INTEGER
   DECLARE Status : TStudyStatus
ENDTYPE

DECLARE Learner : TStudent
Learner.StudentID ← "AC027"
Learner.FullName ← "Minh"
Learner.Phone ← "0901234567"
Learner.LessonsAttended ← 8
Learner.Status ← Active
OUTPUT Learner.FullName
```

Số điện thoại dùng STRING để giữ số 0 đầu và dấu `+`; không dùng để tính toán. `LessonsAttended` là số đếm nên dùng INTEGER. Dấu chấm chọn một field của record.

Một record là một học viên; `ARRAY[1:20] OF TStudent` lưu 20 record. Record không yêu cầu mọi field cùng kiểu; array yêu cầu các phần tử cùng kiểu.

### 1.4 Pointer: địa chỉ khác với giá trị

<a id="theory-1-4"></a>

```text
TYPE TIntPointer = ^INTEGER
DECLARE Score : INTEGER
DECLARE ScorePointer : TIntPointer
Score ← 42
ScorePointer ← ^Score
OUTPUT ScorePointer^
```

Đầu ra là `42`.

```text
ScorePointer ──giữ địa chỉ──> Score [42]
ScorePointer^               đọc giá trị tại địa chỉ đó
```

- `^INTEGER` trong định nghĩa kiểu: pointer trỏ tới INTEGER.
- `^Score` trong biểu thức: lấy địa chỉ của Score.
- `ScorePointer^`: dereference, đọc giá trị ở nơi pointer trỏ tới.
- Nếu `Score ← 50`, thì `ScorePointer^` đọc được 50. Pointer không phải bản sao giá trị 42.
- Chỉ dereference sau khi pointer đã trỏ tới vị trí hợp lệ; không tự đoán địa chỉ số cụ thể nếu đề không cho.

### 1.5 Set: tập hợp không lặp

<a id="theory-1-5"></a>

```text
TYPE TSkillSet = SET OF STRING
DEFINE SkillsA ("Binary", "Files") : TSkillSet
DEFINE SkillsB ("Files", "Records") : TSkillSet
```

Giao của hai tập là `{"Files"}`; hợp là `{"Binary", "Files", "Records"}`. Thứ tự liệt kê không quan trọng. Trong ví dụ này, dấu ngoặc nhọn biểu diễn tập theo ký hiệu toán học, không phải cú pháp gán pseudocode.

Enum mô tả các lựa chọn hợp lệ cho MỘT giá trị; set có thể chứa nhiều phần tử cùng lúc. Chọn một trạng thái: enum. Ghi nhiều kỹ năng đã hoàn thành: set.

### 1.6 Class và object: trạng thái đi cùng hành vi

<a id="theory-1-6"></a>

Record chủ yếu gom dữ liệu. Class còn mô tả các method thao tác trên dữ liệu; object là một instance được tạo từ class.

```text
CLASS TCounter
   PRIVATE Value : INTEGER
   PUBLIC PROCEDURE NEW()
      Value ← 0
   ENDPROCEDURE
   PUBLIC PROCEDURE Increment()
      Value ← Value + 1
   ENDPROCEDURE
   PUBLIC FUNCTION GetValue() RETURNS INTEGER
      RETURN Value
   ENDFUNCTION
ENDCLASS

CounterA ← NEW TCounter()
CounterB ← NEW TCounter()
CounterA.Increment()
OUTPUT CounterA.GetValue()
OUTPUT CounterB.GetValue()
```

Đầu ra lần lượt là 1 và 0. Hai object có trạng thái riêng. `NEW` khởi tạo; `PRIVATE` hạn chế truy cập trực tiếp từ bên ngoài. Ở Unit 13, cần hiểu, chọn và đọc/viết mẫu class đơn giản; kế thừa và đa hình sẽ học sâu ở Unit 20.

**Em phải tự làm được:** từ một tình huống mới, chọn kiểu, khai báo đúng và giải thích vì sao kiểu đó phù hợp. Làm câu 1-8.

## 2. Tổ chức và truy cập tệp - File organisation and access

### 2.1 Hai câu hỏi khác nhau

<a id="theory-2-1"></a>

**Organisation:** bản ghi được sắp xếp/lưu theo quy tắc nào?

**Access:** chương trình tìm đến bản ghi bằng cách nào?

| Organisation | Quy tắc lưu | Thêm bản ghi | Tình huống phù hợp |
|---|---|---|---|
| Serial | Theo thứ tự được thêm vào, không sắp theo key | Append cuối tệp | Ghi nhật ký sự kiện |
| Sequential | Theo thứ tự key field, ví dụ mã học viên tăng dần | Chèn đúng thứ tự; có thể phải tổ chức lại tệp | Xử lý lần lượt toàn bộ học viên |
| Random | Từ record key tính vị trí dự kiến, thường bằng hashing | Ghi vào vị trí tính được, xử lý collision nếu cần | Tra cứu/cập nhật từng hồ sơ |

“Random” ở đây không có nghĩa là mỗi lần tìm lại chọn ngẫu nhiên một vị trí.

### 2.2 Sequential access và direct access

<a id="theory-2-2"></a>

**Sequential access:** đọc lần lượt từ đầu tới bản ghi cần tìm hoặc điều kiện dừng. Dùng cho serial và sequential files trong mô hình của unit.

Ví dụ tệp đã sắp theo key `12, 18, 25, 31`. Khi tìm 20, đọc 12, 18, 25 rồi dừng: vì 25 đã lớn hơn 20, không cần đọc 31. Với serial file không sắp key, không được dùng điều kiện dừng này.

**Direct access:** dùng địa chỉ/index để đi tới vị trí cần đọc, không phải quét mọi bản ghi từ đầu.

- Sequential file có thể dùng **index: key → địa chỉ** để hỗ trợ direct access.
- Random file thường dùng **hash: key → slot/địa chỉ dự kiến**.
- Collision có thể làm cần đọc thêm một số vị trí. Vì vậy direct access không có nghĩa là “luôn đọc đúng một lần”.

Xử lý học phí cho mọi học viên: truy cập tuần tự hợp lý. Sửa số điện thoại của một học viên: truy cập trực tiếp phù hợp hơn nếu có cấu trúc hỗ trợ. Câu trả lời cần nêu cách hệ thống sử dụng dữ liệu, không chỉ nói “nhanh”.

**Hit rate trong xử lý tệp** là tỷ lệ record được sử dụng trong một lượt xử lý so với tổng record trong tệp. Đây không phải cache hit rate. Ví dụ tệp 1000 học viên:

| Lượt xử lý | Record dùng | Hit rate | Access phù hợp |
|---|---:|---:|---|
| Xuất báo cáo học phí toàn lớp | 1000 | 100%: cao | Sequential, đi qua cả tệp |
| Cập nhật điện thoại 5 học viên | 5 | 0.5%: thấp | Direct nếu có index/hash |

Tỷ lệ cao giải thích vì sao đọc liên tục hợp lý; tỷ lệ thấp giải thích lợi ích của việc tìm địa chỉ từng record. Không suy ra organisation chỉ từ hit rate: còn xét thứ tự cần xử lý, cách cập nhật và cấu trúc có sẵn.

### 2.3 Hashing: từ key đến vị trí

<a id="theory-2-3"></a>

Một mô hình đơn giản có N slot, đánh số `0..N-1`:

```text
Slot ← Key MOD N
Address ← BaseAddress + Slot * RecordSize
```

`MOD` lấy phần dư. `RecordSize` và `BaseAddress` phải cùng đơn vị địa chỉ. Ví dụ file bắt đầu tại byte 1000, mỗi record 20 byte, có 10 slot:

```text
Key = 127
Slot = 127 MOD 10 = 7
Address = 1000 + 7 * 20 = 1140
```

Không nhầm slot 7 với địa chỉ byte 1140. Nếu đề dùng slot đánh số từ 1, công thức cần điều chỉnh theo quy ước của đề.

Một hash cho khóa dạng chuỗi có thể cộng mã ký tự rồi lấy MOD N. Với mã cho sẵn `A=65, C=67`, khóa `AC` cho `(65+67) MOD 10 = 2`. `CA` cũng cho 2: hash không bảo đảm mỗi khóa một vị trí riêng.

### 2.4 Collision: khóa khác nhau, cùng vị trí dự kiến

<a id="theory-2-4"></a>

Với `Key MOD 5`, cả 12, 17 và 22 đều cho slot 2.

**Cách 1 - dò vị trí trống kế tiếp:** thử 2, rồi 3, 4, 0, 1; quay vòng nếu tới cuối. Ví dụ chèn 12, 17, 22 vào bảng rỗng:

| Slot | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Key | Trống | Trống | 12 | 17 | 22 |

Tìm 22: tính hash 2 → thấy 12, chưa đúng key → thử 3, thấy 17 → thử 4, tìm thấy 22.

**Cách 2 - overflow area:** giữ bản ghi va chạm ở vùng tràn; khi tìm phải kiểm tra vị trí chính rồi tìm đúng key trong vùng tràn theo cấu trúc đã thiết kế.

Khi lưu và khi tìm phải dùng cùng hash và cùng quy tắc xử lý collision. Không ghi đè bản ghi của khóa khác. Khi dò, phải có điều kiện kết thúc nếu bảng đầy hoặc không tìm thấy. Với bảng chỉ chèn, chưa xóa, gặp slot chưa từng dùng có thể kết luận không tìm thấy; nếu có xóa, cần quy ước đánh dấu riêng để không làm đứt đường dò.

**Em phải tự làm được:** chọn organisation/access, tính hash và địa chỉ, truy vết cả ghi và đọc khi va chạm. Làm câu 9-15.

## 3. Số thực nhị phân - Binary floating-point

### 3.1 Mô hình dùng trong bài này

<a id="theory-3-1"></a>

```text
Giá trị X = M × 2^E
M: mantissa, phần định trị
E: exponent, số mũ
```

Mantissa và exponent đều ở dạng **two's complement**. Dấu chấm nhị phân của M nằm ngay sau bit trái nhất. Đây là mô hình đề Cambridge nêu trong câu hỏi; không áp dụng máy móc cách mã hóa IEEE 754 của float trên máy tính.

Ví dụ xuyên suốt dùng **8 bit mantissa và 4 bit exponent**. Luôn đọc lại số bit trong đề; không có quy tắc mọi đề đều dùng 8+4.

| Bit mantissa | b0 | b1 | b2 | b3 | b4 | b5 | b6 | b7 |
|---|---|---|---|---|---|---|---|---|
| Trọng số | -1 | 1/2 | 1/4 | 1/8 | 1/16 | 1/32 | 1/64 | 1/128 |

Exponent 4 bit có trọng số `-8, 4, 2, 1`, nên nằm trong khoảng -8 đến +7.

Bit dấu của M quyết định dấu của X. E âm làm độ lớn giảm, không làm X thành số âm.

### 3.2 Đọc floating-point ra denary

<a id="theory-3-2"></a>

**Bước làm:** tách M/E → tính giá trị M theo trọng số → đọc E là số nguyên bù hai → tính `M × 2^E`.

Ví dụ A: `M = 01101000`, `E = 0011`.

```text
M = 0.1101000₂ = 1/2 + 1/4 + 1/16 = 0.8125
E = 3
X = 0.8125 × 8 = 6.5
```

Ví dụ B: `M = 10011000`, `E = 0011`.

```text
M = 1.0011000₂ = -1 + 1/8 + 1/16 = -0.8125
E = 3
X = -0.8125 × 8 = -6.5
```

Ví dụ C: `M = 01010000`, `E = 1110`.

```text
M = 0.625
E = -8 + 4 + 2 = -2
X = 0.625 × 2^-2 = 0.15625
```

Kiểm tra nhanh: số nguyên bù hai của chuỗi mantissa chia `2^7 = 128` phải bằng M.

**Cách giải mã thứ hai — dịch binary point.** Cách này cho cùng kết quả với cộng trọng số ở mục 3.2. E dương: dịch dấu chấm sang phải E vị trí; E âm: sang trái |E| vị trí; điền thêm 0 khi cần.

- `M=01101000, E=0011`: viết `0.1101000₂`, dịch phải 3 → `0110.1000₂ = 6.5`.
- `M=01010000, E=1110`: E=-2, viết `0.1010000₂`, dịch trái 2 → `0.001010000₂ = 1/8+1/32 = 0.15625`.
- Nếu M âm, lấy độ lớn bằng bù hai trước rồi giữ dấu âm bên ngoài. Ví dụ `M=10110000, E=1110`: đảo/cộng 1 được `01010000`; dịch `0.1010000₂` sang trái 2 → kết quả **-0.15625**.

Khi M là `10000000`, độ lớn bằng 1; viết `-1 × 2^E` trực tiếp vì +1 không vừa mantissa phân số có dấu 8 bit. Không diễn giải bit 1 đầu tiên như một dấu trừ tách rời trong mọi số bù hai. Kiểm tra ngược bằng trọng số sẽ tránh lỗi này.

### 3.3 Chuyển denary thành floating-point

<a id="theory-3-3"></a>

**Số dương 6.5:**

1. Đổi sang nhị phân: `110.1₂`.
2. Viết thành `0.1101₂ × 2^3`.
3. Thêm 0 ở phải cho đủ 8 bit mantissa: `01101000`.
4. Mã hóa E=3 bằng 4 bit: `0011`.
5. Đọc ngược để kiểm tra: ra 6.5.

**Số âm -6.5:** dùng độ lớn vừa tìm, giữ E=3. Đổi mantissa 8 bit `01101000` sang âm bằng đảo bit và cộng 1:

```text
01101000 → 10010111 + 1 → 10011000
Kết quả: M=10011000, E=0011
```

Không chỉ đổi bit đầu từ 0 sang 1; cách đó là hiểu nhầm sang sign-and-magnitude.

**Số nhỏ 0.15625:** `0.00101₂ = 0.101₂ × 2^-2`, nên M=`01010000`, E=`1110`.

Sau khi mã hóa số âm, vẫn phải kiểm tra normalisation. Ví dụ `-0.5` không có dạng chuẩn hóa `11000000 / 0000`; chuẩn hóa thành `10000000 / 1111`, tức `-1 × 2^-1`.

**Cách mã hóa thứ hai — dùng phân số.** Viết giá trị thành phân số chính xác, rồi chọn E để M=X/2^E nằm trong miền chuẩn hóa.

Ví dụ `6.5 = 13/2`. Tăng mẫu bằng cách chia mantissa cho 2, đồng thời tăng E để bảo toàn giá trị:

| M tạm thời | E | M × 2^E |
|---|---:|---:|
| 13/2 | 0 | 6.5 |
| 13/4 | 1 | 6.5 |
| 13/8 | 2 | 6.5 |
| 13/16 | 3 | 6.5 |

`13/16 = 1/2+1/4+1/16 = 0.1101₂`; từ đó ghi M/E đủ số bit. Với `0.15625=5/32`, nhân M với 2 hai lần và giảm E hai lần: `5/32 → 5/16 → 5/8`, E=`0 → -1 → -2`. Kết quả `0.101₂ × 2^-2`.

Với số âm, làm trên độ lớn, đổi M sang bù hai và kiểm tra lại hai bit đầu; biên như -0.5 cần bước chuẩn hóa riêng đã nêu. Cả cách binary point và cách phân số phải cho cùng giá trị.

**Tự tạo các bit phần lẻ — nhân 2 lặp lại.** Lấy phần nguyên 0 hoặc 1 của mỗi tích làm bit kế tiếp; chỉ đem phần lẻ còn lại nhân tiếp.

| Lần | Phần lẻ đầu vào | Nhân 2 | Bit lấy | Phần lẻ còn |
|---|---:|---:|---:|---:|
| 1 | 0.375 | 0.75 | 0 | 0.75 |
| 2 | 0.75 | 1.5 | 1 | 0.5 |
| 3 | 0.5 | 1.0 | 1 | 0 |

Vì phần lẻ còn bằng 0, `0.375=0.011₂`. Ghép với phần nguyên: `13.375=1101.011₂`. Với 0.1, các phần lẻ lần lượt là `0.1 → 0.2 → 0.4 → 0.8 → 0.6 → 0.2 ...`; các bit là `0,0,0,1,1,0,0,1,1,...`. Phần dư lặp lại tạo chu kỳ, nên không có biểu diễn binary hữu hạn chính xác.

Đừng dừng ngay khi có m bit của phần lẻ denary: số bit giữ lại được xác định **sau khi chuẩn hóa M**. Khi làm tròn phải biết phần bị bỏ, không chỉ biết phần được giữ.

### 3.4 Normalisation: chuẩn hóa nhưng giữ nguyên giá trị

<a id="theory-3-4"></a>

Với số khác 0 trong mô hình này:

- M dương bắt đầu bằng `01`, tương ứng `0.1...`.
- M âm bắt đầu bằng `10`, tương ứng `1.0...`.
- M bắt đầu `00` hoặc `11` là chưa chuẩn hóa.

Khi dịch chuỗi M sang trái k vị trí để bỏ bit dấu lặp dư thừa, thêm 0 bên phải và **giảm E đi k**. Đó là vì M đã nhân với `2^k`, nên thừa số `2^E` phải chia cho `2^k` để X không đổi. Kiểm tra E vẫn nằm trong khoảng biểu diễn được.

Ví dụ dương:

```text
Trước: M=00101000, E=0100 → 0.3125 × 16 = 5
Sau:   M=01010000, E=0011 → 0.625  ×  8 = 5
```

Ví dụ âm:

```text
Trước: M=11101000, E=0101 → -0.1875 × 32 = -6
Sau:   M=10100000, E=0011 → -0.75   ×  8 = -6
```

Ví dụ âm dịch trái 2 vị trí nên E giảm từ 5 xuống 3.

Chuẩn hóa dành nhiều bit hơn cho phần có ý nghĩa, thay vì lãng phí vào các bit dấu lặp. Nó không khôi phục các bit đã bị cắt bỏ trước đó.

Số 0 không thể thỏa dấu hiệu `01`/`10`. Hệ thống phải dành quy ước riêng cho 0, chẳng hạn mantissa toàn 0; không kết luận máy tính không lưu được 0.

### 3.5 Precision và range

<a id="theory-3-5"></a>

**Precision:** khả năng giữ các chi tiết của giá trị. Thêm bit mantissa giúp giảm khoảng cách giữa các giá trị lân cận khi E cố định.

**Range:** khoảng độ lớn có thể biểu diễn. Thêm bit exponent cho phép E lớn hơn và nhỏ hơn, hỗ trợ số rất lớn hoặc rất gần 0.

Khi tổng số bit cố định, tăng phần này phải giảm phần kia. Ví dụ 10-bit M + 6-bit E có nhiều bit định trị hơn 8-bit M + 8-bit E, nhưng exponent hẹp hơn. Không kết luận “nhiều bit exponent làm mọi phép tính chính xác hơn”.

Với **8-bit M + 4-bit E**, chỉ xét số khác 0 đã chuẩn hóa:

| Giới hạn | M | E | Giá trị |
|---|---|---|---|
| Số dương lớn nhất | 01111111 | 0111 | (127/128) × 2^7 = 127 |
| Số dương nhỏ nhất | 01000000 | 1000 | (1/2) × 2^-8 = 1/512 |
| Số âm có độ lớn lớn nhất | 10000000 | 0111 | -1 × 2^7 = -128 |
| Số âm gần 0 nhất | 10111111 | 1000 | (-65/128) × 2^-8 = -65/32768 |

Chú ý phạm vi âm/dương không hoàn toàn đối xứng. Nếu đề cho phép số chưa chuẩn hóa, số nhỏ nhất có thể khác; phải đọc điều kiện.

Công thức kiểm tra: với m bit mantissa, e bit exponent, `Emin = -2^(e-1)` và `Emax = 2^(e-1)-1`. Số dương lớn nhất là `(1-2^(-(m-1))) × 2^Emax`; số dương chuẩn hóa nhỏ nhất là `0.5 × 2^Emin`.

**Chuyển sang định dạng của sách và đề thi.** Thuật toán không đổi khi số bit thay đổi. Với m bit M, nếu đọc chuỗi M như số nguyên bù hai I thì `M=I/2^(m-1)`. Đọc E theo đúng e bit, không kéo dài E âm bằng các số 0.

| Định dạng | Giá trị | M | E | Kiểm tra |
|---|---:|---|---|---|
| 8+8 | 6.5 | 01101000 | 00000011 | 104/128 × 8 = 6.5 |
| 12+6 | -8.375 | 101111010000 | 000100 | -1072/2048 × 16 = -8.375 |
| 16+8 | -0.15625 | 1011000000000000 | 11111110 | -20480/32768 × 1/4 = -0.15625 |

Lời giải 12+6: `8.375=1000.011₂=0.1000011₂ × 2^4`. M dương đủ 12 bit là `010000110000`; đảo và cộng 1 được `101111010000`. E=4 dùng 6 bit là `000100`. Kiểm tra M bắt đầu 10 và tổng số bit là 18.

Lời giải 16+8: `0.15625=0.00101₂=0.101₂ × 2^-2`. M dương đủ 16 bit `0101000000000000`; bù hai thành `1011000000000000`. E=-2: +2 là `00000010`, bù hai thành `11111110`. Cả M và E đều âm nhưng giá trị vẫn âm, vì `2^-2` dương.

Với 10+6, `Emin=-32`, `Emax=31`. Bốn giới hạn chuẩn hóa là:

- Dương lớn nhất: `(511/512) × 2^31`, M=`0111111111`, E=`011111`.
- Dương nhỏ nhất: `(1/2) × 2^-32 = 2^-33`, M=`0100000000`, E=`100000`.
- Âm có độ lớn lớn nhất: `-2^31`, M=`1000000000`, E=`011111`.
- Âm gần 0 nhất: `(-257/512) × 2^-32`, M=`1011111111`, E=`100000`.

Nếu tổng word là 32 bit, phải biết cách chia M/E mới tính được giới hạn cụ thể. Ví dụ 24+8 giữ nhiều bit M hơn 16+16; 16+16 có miền exponent rộng hơn. Chỉ biết “32 bit” chưa đủ để viết giá trị cực đại.

### 3.6 Vì sao có sai số?

<a id="theory-3-6"></a>

Hai lý do cần phân biệt:

1. Một số có biểu diễn nhị phân vô hạn, ví dụ 0.1. Không số bit hữu hạn nào giữ chính xác toàn bộ dãy.
2. Một số có biểu diễn hữu hạn nhưng dài hơn số bit mantissa hiện có, ví dụ 13.375 khi chỉ dùng 6 bit M.

Ví dụ thứ hai, với M 6 bit:

```text
13.375 = 1101.011₂ = 0.1101011₂ × 2^4
Chỉ có 5 bit sau dấu chấm trong M.
Truncate: giữ 0.11010₂ × 16 = 13.0
Round to nearest: chọn 0.11011₂ × 16 = 13.5
```

Sai số tuyệt đối lần lượt là 0.375 và 0.125. Ở đây không có trường hợp hòa; không cần chọn quy tắc tie-breaking.

**Truncation** là cắt phần vượt số bit; **rounding** chọn giá trị theo quy tắc làm tròn đã nêu. Không mặc định hai cách luôn cho cùng đáp án. Khi đề yêu cầu một cách cụ thể, làm đúng cách đó.

Sai số có thể tích lũy qua nhiều phép tính. Thêm bit mantissa thường giảm sai số, nhưng không biến một dãy nhị phân vô hạn thành hữu hạn.

**Làm tròn số âm: nêu rõ quy tắc.** Với 10-bit M và 6-bit E, mã hóa -5.38 tại E=3: số nguyên tương ứng với M chính xác là `(-5.38/8) × 512 = -344.32`.

- Round-to-nearest chọn -344: M=`1010101000`, E=`000011`; lưu **-5.375**, sai số tuyệt đối **0.005**.
- Nếu đề yêu cầu bỏ các bit thấp của biểu diễn bù hai có độ chính xác cao hơn, số nguyên giữ lại là -345: M=`1010100111`; lưu **-5.390625**. Với số âm, thao tác bỏ bit này đi về phía âm hơn, không đồng nghĩa làm tròn về 0.

Với số dương 2.88 trong cùng định dạng, E=2, chỉ số M là 368.64. Round-to-nearest chọn 369: M=`0101110001`, E=`000010`, lưu 2.8828125. Bỏ bit chọn 368, lưu 2.875. Khi đề chỉ nói “approximate”, ghi rõ cách chọn giá trị; theo đúng quy ước đề/mark scheme khi được nêu.

**Sai số tích lũy — hai mô hình cần phân biệt.** Với 8+4, round-to-nearest của 0.1 là `M=01100110, E=1101`, tức `102/1024=0.099609375`. Bước lưới tại E=-3 là 1/1024; 0.1×1024=102.4 nên chọn 102.

Trong V36, chỉ làm tròn **đầu vào** một lần rồi cộng chính xác các giá trị đó:

| Số lần cộng | Tổng lý tưởng | Tổng chính xác của đầu vào đã xấp xỉ | Tổng này trừ lý tưởng |
|---|---:|---:|---:|
| 1 | 0.1 | 0.099609375 | -0.000390625 |
| 2 | 0.2 | 0.19921875 | -0.00078125 |
| 3 | 0.3 | 0.298828125 | -0.001171875 |

Hàng cuối không khẳng định 0.298828125 được lưu chính xác trong 8+4. Nếu **mỗi phép cộng cũng làm tròn lại**, tổng thứ ba ở đúng giữa hai giá trị 0.296875 và 0.30078125. Theo quy tắc ties-to-even (chọn chỉ số M chẵn khi hòa), kết quả là 0.296875. Hai mô hình đều minh họa sai số, nhưng không được trộn số liệu. Lab 3 thực hiện cả hai và đối chiếu với float thực tế.

**Double precision và quadruple precision.** Một số môi trường cung cấp định dạng độ chính xác cao hơn, thường được gọi là double hoặc quadruple. Khi có thêm bit định trị, giá trị có thể được xấp xỉ sát hơn; thêm bit exponent có thể mở rộng range. Hỗ trợ và cách bố trí bit phụ thuộc định dạng/môi trường, không suy ra chỉ từ tên gọi. Đây không phải cách ghép M/E bù hai của bài tính Cambridge ở trên. Tăng hữu hạn số bit vẫn không biểu diễn chính xác 0.1 trong hệ nhị phân hữu hạn.

Cách giảm tác động sai số gồm chọn độ chính xác đủ dùng, số nguyên theo đơn vị nhỏ nhất cho dữ liệu thích hợp, hoặc số thập phân chính xác khi yêu cầu bài toán phù hợp. Làm tròn khi **hiển thị** có thể cho chữ số đẹp hơn nhưng không xóa sai số bên trong phép tính.

### 3.7 Overflow và underflow

<a id="theory-3-7"></a>

Vẫn dùng hệ 8+4 chuẩn hóa ở trên:

- **Overflow:** kết quả vượt phạm vi biểu diễn. `100 × 2 = 200` lớn hơn giới hạn dương 127.
- **Underflow:** kết quả khác 0 quá gần 0 để biểu diễn theo giới hạn đang dùng. `(1/512) / 2 = 1/1024` nhỏ hơn số dương chuẩn hóa nhỏ nhất.

Underflow không có nghĩa là “ra số âm”. Overflow không chỉ là “cộng có carry”; phải xét giá trị kết quả và phạm vi của định dạng.

Cách phần mềm xử lý có thể là báo lỗi, dùng giá trị đặc biệt hoặc làm tròn; không khẳng định mọi hệ thống đều tự trả về 0. Chia cho 0 là trường hợp riêng cần xử lý, không dùng làm ví dụ tính floating-point thông thường.

**Em phải tự làm được:** câu 16-27, rồi bài tổng hợp 28. Khi tính, luôn ghi M, E, công thức và bước kiểm tra ngược.

## 4. Cách trình bày câu trả lời Paper 3

| Yêu cầu | Cách làm |
|---|---|
| Define / describe | Nêu bản chất và đặc điểm cụ thể, dùng đúng thuật ngữ |
| Compare | Nêu điểm giống/khác trên cùng tiêu chí, ví dụ thứ tự lưu và cách chèn |
| Explain / justify | Gắn nguyên nhân với hệ quả và tình huống của đề |
| Write pseudocode | Phân biệt định nghĩa TYPE, khai báo DECLARE, phép gán và truy cập field |
| Calculate / show working | Ghi phép đổi, M/E, số bit, kết quả và kiểm tra giá trị |

Ví dụ giải thích tốt: “Tăng số bit mantissa giữ được thêm bit có ý nghĩa, nên giảm việc cắt bỏ phần phân số.” Câu “máy tính tốt hơn” không thể hiện cơ chế.

Nguồn và ghi chú đối chiếu: [SOURCES_AND_TEACHER_NOTES.md](SOURCES_AND_TEACHER_NOTES.md).
