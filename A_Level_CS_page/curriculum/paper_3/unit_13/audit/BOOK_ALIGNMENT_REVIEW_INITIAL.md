# Chapter 13 — Kiểm tra độ khớp với sách

Ngày kiểm tra: 15/09/2026. Đây là đánh giá phiên bản hiện có; chưa sửa bài học hay hình trong lần kiểm tra này.

## 1. Kết luận

**Mức đáp ứng nội dung chi tiết: khoảng 87% (40/46 điểm theo checklist bên dưới).** Bộ tài liệu đã có đủ ba phần chính và có thể dùng làm nền cho giảng dạy. Chưa nên coi là bản hoàn chỉnh thay thế toàn bộ chương sách: còn thiếu cách giải phụ, độ đa dạng bài luyện và có một lỗi số liệu rõ ràng ở visual V36.

| Phần | Điểm | Tỷ lệ làm tròn | Nhận xét |
|---|---:|---:|---|
| 13.1 User-defined data types | 9.5/10 | 95% | Đủ các kiểu; thiếu ví dụ thao tác giá trị kế tiếp của enum theo sách |
| 13.2 File organisation and access | 12.5/13 | 96% | Cơ chế đầy đủ; chưa gọi tên high/low hit rate trong phần học viên |
| 13.3 Floating-point | 18/23 | 78% | Cơ chế chính đúng; thiếu một số phương pháp và thực hành; V36 cần sửa |
| **Tổng** | **40/46** | **87%** | Tính từ tổng điểm, không lấy trung bình ba phần |

Đây là **tỷ lệ đáp ứng checklist nội dung**, không phải tỷ lệ giống câu chữ, phần trăm đạt điểm thi hay xác suất tài liệu đúng. Không có thang Cambridge chính thức cho con số này. Nếu chỉ nhìn tên mục tiêu đầu chương thì cả ba phần đều có; điều đó không đủ để kết luận nội dung đã hoàn chỉnh 100%.

### Nguồn và phạm vi

- Sách Watson & Williams, Cambridge International AS & A Level Computer Science, Chapter 13, **trang in 304–327 / trang PDF 320–343**, bản PDF người dùng cung cấp. Đã đọc văn bản và xem các trang render, gồm hình 13.1–13.16, ví dụ 13.1–13.9 và câu cuối chương.
- Đối chiếu [STUDENT_GUIDE.md](STUDENT_GUIDE.md), [PRACTICE.md](PRACTICE.md), [ANSWERS.md](ANSWERS.md), [README.md](README.md), [SOURCES_AND_TEACHER_NOTES.md](SOURCES_AND_TEACHER_NOTES.md) và bộ 40 visual.
- Đánh giá bộ Unit 13 vừa chuẩn bị trong folder này. Không tái kiểm định toàn bộ các tài liệu Chapter_13 cũ nằm ngoài folder, tất cả đề thi trong Past_Papers, hoặc mức sẵn sàng cho một năm thi cụ thể.

### Cách chấm

Mỗi tiêu chí có cùng trọng số: **1** = đã có giải thích/ví dụ tương đương và không phát hiện vấn đề ở tiêu chí; **0.5** = có một phần nhưng thiếu thao tác, thuật ngữ, thực hành hoặc ví dụ cần sửa; **0** = chưa có nội dung tương ứng. Ví dụ mới dùng số khác sách vẫn được tính đủ khi dạy được cùng kỹ năng. Các cách giải phụ được tính vì yêu cầu đang là đối chiếu với nội dung sách, không chỉ đối chiếu syllabus tối thiểu.

Kiến thức AS đầu vào và các extension yêu cầu chạy chương trình được ghi riêng ở mục 4, không đưa vào 46 tiêu chí nội dung. Vì vậy 87% không có nghĩa đã hoàn thành 87% tất cả bài tập và hoạt động trên từng trang sách.

## 2. Checklist có thể kiểm tra lại

G = Student Guide; P = Practice; V = mã visual. Tham chiếu sách đều là trang in.

### 13.1 — 9.5/10

| Mã | Nội dung trong sách | Trang | Bằng chứng trong bộ bài | Điểm |
|---|---|---|---|---:|
| T01 | Mục đích và lựa chọn user-defined type | 305, 307 | G1.1, P1/28, V03 | 1 |
| T02 | Composite và non-composite | 305–307 | G1.1, P7, V04; lưu ý định nghĩa pointer trong sách | 1 |
| T03 | Enum: miền giá trị có tên, không phải STRING | 305 | G1.2, P2, V05 | 1 |
| T04 | TYPE, DECLARE và gán enum | 305 | G1.2, P2/4 | 1 |
| T05 | Thứ tự enum và thao tác lấy giá trị kế tiếp | 305 | G1.2 nêu thứ tự; thiếu worked example tương đương nextMonth | 0.5 |
| T06 | Định nghĩa pointer type và biến pointer có kiểu | 306 | G1.4, P5, V08 | 1 |
| T07 | Lấy địa chỉ, dereference, phân biệt địa chỉ/giá trị | 306 | G1.4, P5, V08–09 | 1 |
| T08 | Record: field, định nghĩa, khai báo và gán | 307, 326–327 | G1.3, P3–4/28, V06–07 | 1 |
| T09 | Set: định nghĩa, phần tử, không thứ tự, hợp/giao | 305, 307 | G1.5, P6, V10–11 | 1 |
| T10 | Class chứa dữ liệu/method; object từ cùng class | 307 | G1.6, P8, V12 | 1 |

### 13.2 — 12.5/13

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
| F09 | High/low hit rate và lý do chọn access | 310 | Có ví dụ xử lý mọi hồ sơ/một hồ sơ; chưa nêu thuật ngữ hit rate | 0.5 |
| F10 | MOD, base address, kích thước record | 310–311 | G2.3, P12, V19 | 1 |
| F11 | Collision khi lưu; vị trí kế tiếp và overflow area | 311 | G2.4, P13/15, V21–23 | 1 |
| F12 | Khi đọc phải so key và đi theo cơ chế collision | 311 | G2.4, P13–15, V22–23 | 1 |
| F13 | Hash khóa ký tự bằng tổng mã và MOD | 311 | G2.3, P15b, V20 | 1 |

### 13.3 — 18/23

| Mã | Nội dung trong sách | Trang | Bằng chứng trong bộ bài | Điểm |
|---|---|---|---|---:|
| R01 | Liên hệ scientific notation với M × 2^E | 313 | G3.1, V24 | 1 |
| R02 | Bit layout, binary point, trọng số bù hai M/E | 313 | G3.1, V25 | 1 |
| R03 | Binary → denary: mantissa dương | 314–315 | G3.2A, P16, V26 | 1 |
| R04 | Binary → denary: mantissa âm | 315–316 | G3.2B, P17, V27 | 1 |
| R05 | Giải mã exponent âm, phân biệt dấu và độ lớn | 316–317 | G3.2C, P18, V28 | 1 |
| R06 | Phương pháp giải mã bằng dịch binary point | 314–317 | G3.2 chỉ dạy cộng trọng số rồi nhân 2^E; thiếu cách giải thứ hai | 0 |
| R07 | Denary dương → binary floating-point | 317–318 | G3.3, P19, V29 | 1 |
| R08 | Denary âm → binary floating-point | 319–320 | G3.3, P20, V29 | 1 |
| R09 | Mã hóa số có độ lớn nhỏ hơn 1 | 318–319 | G3.3 có 0.15625 và -0.5 | 1 |
| R10 | Cách mã hóa qua phân số và điều chỉnh mẫu bằng lũy thừa 2 | 317–319 | Có tính giá trị phân số; chưa có thuật toán mã hóa theo cách này | 0 |
| R11 | Nhiều cặp M/E cùng biểu diễn một giá trị | 319, 321–322 | G3.4, P21–22, V30–31 | 1 |
| R12 | Nhận diện normalised: 01/10; chưa chuẩn hóa 00/11 | 322 | G3.4, P21–22/27, V30–31/38 | 1 |
| R13 | Dịch M, điều chỉnh E, chứng minh giữ giá trị | 322–323 | G3.4, P21–22, V30–31 | 1 |
| R14 | Precision/range và đánh đổi số bit | 323–324 | G3.5, P25, V32 | 1 |
| R15 | Vận dụng định dạng khác nhau trong bài tính | 324–326 | Có 8+4, 6+4, so sánh 10+6/8+8 và liên kết đề 10+6; thiếu bài giải trực tiếp 8+8, 12+6, 16+8 | 0.5 |
| R16 | Bốn giới hạn dương/âm của số chuẩn hóa | 323 | G3.5, P23, V33; đổi số bit nhưng cùng kỹ năng | 1 |
| R17 | Xấp xỉ, độ dài hữu hạn, ảnh hưởng mantissa | 320–321 | G3.6, P24/27, V34–35 | 1 |
| R18 | Đổi phần lẻ denary bằng phép nhân 2 lặp lại | 321 | Ví dụ bắt đầu từ binary có sẵn; thiếu bảng tạo từng bit | 0 |
| R19 | Sai số tích lũy qua nhiều lần cộng | 324 | G3.6 nêu nguyên lý; V36 có số làm tròn sai, xem mục 3 | 0.5 |
| R20 | Double/quadruple precision như lựa chọn tăng độ chính xác | 324 | Có nói tăng mantissa; chưa giới thiệu hai lựa chọn sách nêu | 0 |
| R21 | Overflow: vượt giới hạn, ví dụ tính toán | 325 | G3.7, P26, V37 | 1 |
| R22 | Underflow: khác 0 nhưng quá gần 0 | 325 | G3.7, P26, V37; nêu rõ chỉ xét số chuẩn hóa | 1 |
| R23 | Số 0 và giới hạn của quy tắc chuẩn hóa | 325–326 | G3.4/3.7, P27, V38 | 1 |

## 3. Lỗi cần sửa trước khi dùng V36

**V36 ghi round-to-nearest với 8-bit M + 4-bit E nhưng chọn sai giá trị gần nhất của 0.1.**

| Nội dung | Đang có | Kết quả đúng |
|---|---|---|
| Mantissa | 01101000 | 01100110 |
| Exponent | 1101 = -3 | 1101 = -3 |
| Giá trị lưu sau khi làm tròn 0.1 | 0.1015625 | 0.099609375 |
| Sai số tuyệt đối | 0.0015625 | 0.000390625 |

Kiểm chứng: với E = -3, khoảng cách giữa các giá trị là 1/1024. Ta có 0.1 × 1024 = 102.4; số nguyên gần nhất là 102. Vì vậy giá trị đúng là 102/1024 = 0.099609375. Giá trị hình đang dùng là 104/1024.

Đã duyệt độc lập 2.048 tổ hợp chuẩn hóa của định dạng 8+4 để kiểm tra kết luận; xem [BOOK_ALIGNMENT_CHECKS.json](BOOK_ALIGNMENT_CHECKS.json).

Lỗi xuất hiện trong SVG/PNG V36, brief VISUAL_INVENTORY, manifest, thư viện HTML và mã dựng hình; các bản này cùng nằm trong ZIP đã giao. **Student Guide và đáp án không chứa giá trị sai này.** Cần sửa đồng bộ các bản liên quan khi cập nhật.

Ngoài số đầu vào, cần nói rõ mô hình cộng: tổng toán học của các đầu vào đã xấp xỉ khác với kết quả bị làm tròn lại sau mỗi phép cộng. Nếu mô phỏng kiểu máy tính thứ hai, phải quy định cách xử lý trường hợp đúng giữa hai giá trị gần nhất.

### Vì sao kiểm tra trước chưa phát hiện?

Kiểm tra trước xác nhận bit pattern đang ghi giải mã ra 0.1015625 và các tổng của giá trị đó, nhưng chưa kiểm tra điều kiện **gần nhất với 0.1**. V36 ghi bit trong nhãn chữ nên cũng không vào danh sách 19 cặp floatrow của kiểm tra hình. Do đó kết quả QA trước chưa đủ để bảo đảm toàn bộ ví dụ làm tròn đúng. Đây là thiếu sót của lần kiểm tra trước.

Các phép tính khác đã chạy lại: 20 ví dụ số trong bộ kiểm tra nội dung, bốn giới hạn bằng duyệt tổ hợp, phép tính địa chỉ và đường dò hash đều đạt. Đây là kết quả trên tập ví dụ được kiểm tra, không phải bằng chứng mọi câu chữ và mọi hình đều đúng 100%.

## 4. Phần luyện tập còn mỏng so với sách

1. **Đổi độ dài word:** bộ 28 câu chủ yếu tính trên 8+4; sách có 8+8, 10+6, 12+6 và 16+8. Cần worked examples và bài tự làm thay đổi cả M lẫn E, không chỉ hỏi so sánh bằng lời.
2. **Phối hợp dấu:** nên thêm bài có cả M âm và E âm; bài mã hóa số âm có độ lớn nhỏ hơn 1; bài xấp xỉ số âm. Hiện có các thành phần và ví dụ -0.5, nhưng chưa đủ bài luyện phối hợp như Activity 13F/G/I.
3. **Extension thực hành:** chưa có lab tương đương chạy thao tác set (13A), viết chương trình hash tên (13B), hoặc chạy và phân tích cộng 0.1 (13E). Bài tính tay hiện tại không thay thế việc chạy chương trình này.
4. **Ôn AS:** phần đầu vào chỉ là chẩn đoán gọn; chưa có bộ bài đọc/ghi/append file và bài binary arithmetic tương đương các khung đầu mục ở tr.308/312. Đây là tiền đề học, không phải lỗi kiến thức mới của Unit 13.
5. **Câu cuối chương:** các dạng chính đã có bài tương đương, nhưng chưa có bảng gắn từng câu sách với bài luyện và tiêu chí chấm theo điểm. Không dùng 28 câu hiện tại để khẳng định đã thay thế toàn bộ bài tập sách.

## 5. Khác sách nhưng nên giữ

- **Định dạng 8+4:** là lựa chọn đơn giản hóa hợp lệ khi nêu rõ số bit. Không cần đổi mọi hình thành 8+8; cần bổ sung cầu nối để học viên chuyển sang định dạng sách và đề thi.
- **Khoảng bù hai 16 bit ở tr.313:** đúng là -32768 đến 32767; không sao lại khoảng sai trong sách. Fixed-point cũng có thể biểu diễn phần lẻ khi đặt binary point phù hợp.
- **Ví dụ set tr.307:** giữ tên kiểu nhất quán và chọn kiểu field hợp lý trong tài liệu mới.
- **Ví dụ 5.88 tr.320–321:** 8-bit mantissa, E=3 đã lưu được 5.875 khi cắt đúng; không cần 16-bit mantissa mới đạt con số đó. Giữ ví dụ mới đã tính đúng thay vì sao kết quả 5.75 của sách.
- **Normalisation và số 0:** giữ cách giải thích rằng chuẩn hóa không phục hồi bit đã mất, và số 0 cần quy ước riêng. Hình 13.9 của sách có mantissa toàn 0 thì giá trị là 0, không còn bằng 2 như nhãn in.
- **Open/closed hash:** dạy rõ cơ chế dò vị trí/overflow area như hiện tại. Nếu thêm bảng thuật ngữ để đọc sách, ghi rõ cách gọi theo nguồn, tránh đồng nhất các nhãn mâu thuẫn.
- **Chia cho 0:** giữ tách biệt với ví dụ overflow của phép tính hữu hạn. Không sao máy móc cách diễn đạt thiếu chặt trong sách.

Không trừ điểm vì tài liệu sửa lỗi nguồn hoặc thêm ví dụ tốt hơn. Phần class có code, pointer thay đổi giá trị, điều kiện dừng khi dò và phân biệt truncation/rounding là những bổ sung hữu ích.

## 6. Thứ tự hoàn thiện đề xuất

1. **Sửa V36 và QA:** xác minh nearest rounding, chốt mô hình cộng, xuất lại PNG/SVG/manifest/gallery/ZIP; giữ hình minh họa độc lập.
2. **Bổ sung phần học:** enum successor, hit rate, giải mã bằng dịch binary point, cách phân số, bảng nhân 2 tạo bit và giới thiệu double/quadruple precision ở mức sách.
3. **Bổ sung bài luyện:** nhiều độ dài M/E, phối hợp dấu và xấp xỉ số âm; sau đó thêm các lab extension.
4. Chạy lại checklist trên phiên bản đã sửa. Không nâng điểm chỉ vì đã lên kế hoạch bổ sung.

**Đánh giá sử dụng:** nền tảng nội dung đã tốt; nên sửa V36 trước khi dùng hình đó với học viên và hoàn thiện các mục thiếu trước khi tuyên bố bộ này bao phủ đầy đủ sách.
