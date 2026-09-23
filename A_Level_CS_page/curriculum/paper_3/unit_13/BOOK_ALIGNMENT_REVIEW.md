# Chapter 13 — Đối chiếu sau cập nhật

Phiên bản 2, ngày 15/09/2026. **Đã đáp ứng 46/46 tiêu chí nội dung của checklist đối chiếu sách (100%).**

| Phần | Điểm | Bao phủ |
|---|---:|---:|
| 13.1 User-defined types | 10/10 | 100% |
| 13.2 File organisation/access | 13/13 | 100% |
| 13.3 Floating-point | 23/23 | 100% |

“100%” nghĩa là từng tiêu chí kiến thức/phương pháp trong checklist đã có bài học và bằng chứng tương ứng. Không phải bảo đảm đạt điểm thi, không phải chép giống câu chữ và không phải tái tạo mọi câu bài tập của sách. Giữ nguyên các sửa lỗi nguồn đã giải thích; không đưa lỗi sách trở lại bài học.

Nguồn đối chiếu: sách Watson & Williams, Chapter13, trang in304–327 (PDF320–343) do người dùng cung cấp. Phạm vi kiểm tra là bộ Unit13 trong folder này. Mục13 cũng được đối chiếu syllabus2026 và2027–2029; chưa chốt năm thi của lớp, nên không suy rộng thành chứng nhận cho mọi quy định của cả chương trình.

## Những phần đã bổ sung

- Enum successor và xử lý biên; high/low hit rate.
- Giải mã bằng dịch binary point; mã hóa qua phân số; bảng nhân2 tạo bit.
- Ví dụ và bài tập nhiều định dạng M/E; phối hợp dấu, giới hạn và làm tròn số âm.
- Double/quadruple precision; hai mô hình sai số cộng lặp; sửa V36 đồng bộ.
- 20 câu có hướng dẫn chấm, ngoài28 câu nền; chẩn đoán AS, ba lab chạy được, kế hoạch8 khối bài và phiếu ôn tập.
- [Bản đồ hoạt động sách](BOOK_ACTIVITY_MAP.md) bao phủ9 Activities,6 Extensions,3 khung kiến thức đầu vào và5 nhóm câu cuối chương bằng bài học/bài mới tương đương.

## Checklist sau cập nhật


G = Student Guide; P = Practice; V = mã visual. Tham chiếu sách đều là trang in.

### 13.1 — 10/10

| Mã | Nội dung trong sách | Trang | Bằng chứng trong bộ bài | Điểm |
|---|---|---|---|---:|
| T01 | Mục đích và lựa chọn user-defined type | 305, 307 | G1.1, P1/28, V03 | 1 |
| T02 | Composite và non-composite | 305–307 | G1.1, P7, V04; lưu ý định nghĩa pointer trong sách | 1 |
| T03 | Enum: miền giá trị có tên, không phải STRING | 305 | G1.2, P2, V05 | 1 |
| T04 | TYPE, DECLARE và gán enum | 305 | G1.2, P2/4 | 1 |
| T05 | Thứ tự enum và thao tác lấy giá trị kế tiếp | 305 | G1.2 thêm TDay, Today+1 và IF xử lý Sunday; P29/30 | 1 |
| T06 | Định nghĩa pointer type và biến pointer có kiểu | 306 | G1.4, P5, V08 | 1 |
| T07 | Lấy địa chỉ, dereference, phân biệt địa chỉ/giá trị | 306 | G1.4, P5, V08–09 | 1 |
| T08 | Record: field, định nghĩa, khai báo và gán | 307, 326–327 | G1.3, P3–4/28, V06–07 | 1 |
| T09 | Set: định nghĩa, phần tử, không thứ tự, hợp/giao | 305, 307 | G1.5, P6, V10–11 | 1 |
| T10 | Class chứa dữ liệu/method; object từ cùng class | 307 | G1.6, P8, V12 | 1 |

### 13.2 — 13/13

| Mã | Nội dung trong sách | Trang | Bằng chứng trong bộ bài | Điểm |
|---|---|---|---|---:|
| F01 | Serial: thứ tự đến, append, tình huống sử dụng | 308 | G2.1, P9–10, V14–15 | 1 |
| F02 | Sequential: sắp key, chèn đúng vị trí | 309 | G2.1, P9, V16 | 1 |
| F03 | Random: vị trí qua hash và khóa record | 309 | G2.1/2.3, V14/19 | 1 |
| F04 | Organisation khác access; liên hệ hai nhóm | 308–310, 327 | G2.1–2.2, P10, V13 | 1 |
| F05 | Tìm tuần tự trong serial; không dừng theo key lớn hơn | 309 | G2.2 nêu quy tắc và đối chiếu serial | 1 |
| F06 | Tìm tuần tự trong sequential; dừng sớm | 309–310 | G2.2, P11, V17 | 1 |
| F07 | Direct access của sequential file qua index | 310 | G2.2, P11, V18 | 1 |
| F08 | Direct access của random file qua hash | 310 | G2.2–2.3, P12, V19 | 1 |
| F09 | High/low hit rate và lý do chọn access | 310 | G2.2 định nghĩa hit rate, ví dụ 100%/0.5%; P31 | 1 |
| F10 | MOD, base address, kích thước record | 310–311 | G2.3, P12, V19 | 1 |
| F11 | Collision khi lưu; vị trí kế tiếp và overflow area | 311 | G2.4, P13/15, V21–23 | 1 |
| F12 | Khi đọc phải so key và đi theo cơ chế collision | 311 | G2.4, P13–15, V22–23 | 1 |
| F13 | Hash khóa ký tự bằng tổng mã và MOD | 311 | G2.3, P15b, V20 | 1 |

### 13.3 — 23/23

| Mã | Nội dung trong sách | Trang | Bằng chứng trong bộ bài | Điểm |
|---|---|---|---|---:|
| R01 | Liên hệ scientific notation với M × 2^E | 313 | G3.1, V24 | 1 |
| R02 | Bit layout, binary point, trọng số bù hai M/E | 313 | G3.1, V25 | 1 |
| R03 | Binary → denary: mantissa dương | 314–315 | G3.2A, P16, V26 | 1 |
| R04 | Binary → denary: mantissa âm | 315–316 | G3.2B, P17, V27 | 1 |
| R05 | Giải mã exponent âm, phân biệt dấu và độ lớn | 316–317 | G3.2C, P18, V28 | 1 |
| R06 | Phương pháp giải mã bằng dịch binary point | 314–317 | G3.2 giải mã bằng dịch binary point, gồm M/E âm; P34–35 | 1 |
| R07 | Denary dương → binary floating-point | 317–318 | G3.3, P19, V29 | 1 |
| R08 | Denary âm → binary floating-point | 319–320 | G3.3, P20, V29 | 1 |
| R09 | Mã hóa số có độ lớn nhỏ hơn 1 | 318–319 | G3.3 có 0.15625 và -0.5 | 1 |
| R10 | Cách mã hóa qua phân số và điều chỉnh mẫu bằng lũy thừa 2 | 317–319 | G3.3 mã hóa qua phân số, điều chỉnh mẫu và E; P36 | 1 |
| R11 | Nhiều cặp M/E cùng biểu diễn một giá trị | 319, 321–322 | G3.4, P21–22, V30–31 | 1 |
| R12 | Nhận diện normalised: 01/10; chưa chuẩn hóa 00/11 | 322 | G3.4, P21–22/27, V30–31/38 | 1 |
| R13 | Dịch M, điều chỉnh E, chứng minh giữ giá trị | 322–323 | G3.4, P21–22, V30–31 | 1 |
| R14 | Precision/range và đánh đổi số bit | 323–324 | G3.5, P25, V32 | 1 |
| R15 | Vận dụng định dạng khác nhau trong bài tính | 324–326 | G3.5 lời giải 8+8,12+6,16+8 và giới hạn10+6; P38–42; BOOK_ACTIVITY_MAP | 1 |
| R16 | Bốn giới hạn dương/âm của số chuẩn hóa | 323 | G3.5, P23, V33; đổi số bit nhưng cùng kỹ năng | 1 |
| R17 | Xấp xỉ, độ dài hữu hạn, ảnh hưởng mantissa | 320–321 | G3.6, P24/27, V34–35 | 1 |
| R18 | Đổi phần lẻ denary bằng phép nhân 2 lặp lại | 321 | G3.3 bảng nhân2 của0.375 và chu kỳ0.1; P37 | 1 |
| R19 | Sai số tích lũy qua nhiều lần cộng | 324 | G3.6 hai mô hình cộng, V36 đã sửa nearest và giả thiết; P45; Lab3 | 1 |
| R20 | Double/quadruple precision như lựa chọn tăng độ chính xác | 324 | G3.6 giải thích double/quadruple, giới hạn và hiển thị; P46; Lab3C | 1 |
| R21 | Overflow: vượt giới hạn, ví dụ tính toán | 325 | G3.7, P26, V37 | 1 |
| R22 | Underflow: khác 0 nhưng quá gần 0 | 325 | G3.7, P26, V37; nêu rõ chỉ xét số chuẩn hóa | 1 |
| R23 | Số 0 và giới hạn của quy tắc chuẩn hóa | 325–326 | G3.4/3.7, P27, V38 | 1 |


## Sửa V36 và kiểm tra

Nearest của0.1 trong8+4 là M01100110/E1101 =0.099609375. V36 cộng chính xác các đầu vào đã xấp xỉ, không làm tròn lại tổng. Tổng thứ ba0.298828125 không được trình bày như giá trị được lưu chính xác trong8+4. G3.6, P45 và Lab3 còn giải thích mô hình làm tròn từng phép cộng, ties-to-even, cho tổng thứ ba0.296875.

QA bổ sung kiểm tra nearest bằng khoảng cách phân số chính xác trên toàn bộ2.048 số chuẩn hóa; V36 dùng bộ dựng bit như các hình khác để không lọt khỏi danh sách kiểm tra. Kết quả hiện hành: [BOOK_ALIGNMENT_CHECKS.json](BOOK_ALIGNMENT_CHECKS.json). Báo cáo trước sửa được giữ ở audit/BOOK_ALIGNMENT_REVIEW_INITIAL.md để truy nguyên, không dùng làm kết luận hiện hành.

## Phạm vi sử dụng

Học viên dùng STUDENT_HANDBOOK.html và bài tự luyện; giáo viên dùng TEACHER_HANDBOOK.html có thêm lời giải/hướng dẫn. Giữ liên kết QP/MS trong SOURCES_AND_TEACHER_NOTES cho bước luyện đề. Bộ này là tài liệu Chapter13; kết quả học tập thực tế còn cần được kiểm tra qua bài độc lập và đề đúng năm thi.
