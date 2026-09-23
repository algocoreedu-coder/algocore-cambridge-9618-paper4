# Unit 13 — Bài luyện bổ sung 29–48

Làm sau 28 câu nền tảng trong PRACTICE. Bài tự biên soạn; số điểm là hướng dẫn chấm nội bộ, không phải mark scheme Cambridge. Tổng **100 điểm**. Mọi câu floating-point dùng M/E bù hai, binary point ngay sau bit dấu M. Chỉ xét số chuẩn hóa khác 0 khi hỏi giới hạn. Đáp án để riêng trong EXTENDED_ANSWERS.

## 13.1 — Kiểu dữ liệu (10 điểm)

**29. Enum có thứ tự (5 điểm).** Định nghĩa TDay từ Monday đến Sunday và hai biến Today/Tomorrow. Today=Friday; dùng thao tác lấy giá trị kế tiếp theo quy ước của sách để gán Tomorrow. Viết thêm xử lý Sunday chuyển về Monday; giải thích vì sao không mặc định quay vòng.

**30. Pointer và enum (5 điểm).** Dùng TDay ở câu 29. Khai báo TDayPointer và biến P đúng kiểu, cho P trỏ đến Today. Today ban đầu Wednesday, sau đó đổi thành Saturday. Nêu giá trị P^ sau thay đổi; phân biệt giá trị với địa chỉ.

## 13.2 — Tệp (15 điểm)

**31. Hit rate (5 điểm).** Tệp 2400 tài khoản: lượt A đọc 2400 tài khoản, lượt B cập nhật 12 tài khoản. Tính hit rate của mỗi lượt; chọn access và giải thích. Nêu một cấu trúc hỗ trợ direct access.

**32. Hash địa chỉ (5 điểm).** File bắt đầu tại địa chỉ 500, mỗi record chiếm 5 đơn vị địa chỉ, có 1000 slot từ 0. Hash=Key MOD 1000. Tính vị trí cho key 9354. Nếu bị collision và dò tuyến tính, địa chỉ tiếp theo là bao nhiêu? Khi đọc, cần làm gì trước khi dùng record?

**33. Hash chuỗi và collision (5 điểm).** Hash=(tổng mã ASCII) MOD 10. Cho A=65, C=67. Tính slot của AC và CA; dùng bảng rỗng và dò tuyến tính để lưu lần lượt AC, CA. Mô tả tìm CA. Nếu đổi sang overflow area thì khác ở đâu?

## 13.3 — Biểu diễn và chuyển đổi (35 điểm)

**34. Hai phương pháp giải mã (5 điểm).** Với 8+8, M=`01011010`, E=`00000100`. Tính giá trị bằng (a) trọng số và (b) dịch binary point. Kiểm tra chuẩn hóa.

**35. M âm và E âm (5 điểm).** Với 8+8, M=`10110000`, E=`11111110`. Đổi ra denary bằng hai cách. Giải thích vì sao E âm không đảo dấu của giá trị.

**36. Phân số để mã hóa (5 điểm).** Dùng 8+8: (a) mã hóa 5.5 bằng cách điều chỉnh phân số; (b) mã hóa 0.171875 theo cách tương tự. Cả hai kết quả phải chuẩn hóa.

**37. Tạo bit phần lẻ (5 điểm).** Lập bảng nhân 2 để đổi 0.375; ghép với phần nguyên để đổi 13.375 sang binary. Viết sáu bit đầu sau binary point của 0.1 và chỉ ra phần dư bắt đầu lặp.

**38. Định dạng 12+6 (5 điểm).** Mã hóa -8.375, gồm binary độ lớn, mantissa dương đủ bit, bù hai, E và phép kiểm tra ngược.

**39. Định dạng 16+8 (5 điểm).** Mã hóa -0.15625; chỉ rõ M và E có bao nhiêu bit. Đọc ngược để kiểm tra dấu và giá trị.

**40. Chuẩn hóa với E âm (5 điểm).** Dùng 8+8. Chuẩn hóa (a) M=`00011000`, E=`11111110`; (b) M=`11110000`, E=`11111111`. Với mỗi trường hợp, chứng minh giá trị trước/sau bằng nhau.

## 13.3 — Giới hạn, sai số và vận dụng (40 điểm)

**41. Bốn giới hạn 10+6 (5 điểm).** Ghi M/E và giá trị của số dương lớn nhất, dương nhỏ nhất, âm có độ lớn lớn nhất, âm gần 0 nhất. Giải thích sự không đối xứng.

**42. Đánh đổi số bit (5 điểm).** Với tổng 16 bit, so sánh 12+4, 8+8 và 4+12 về số bit phân số, phạm vi E và số dương lớn nhất. Nếu chỉ cho “word 32 bit”, có tính duy nhất được số lớn nhất không? Nêu dữ kiện còn thiếu.

**43. Làm tròn số dương (5 điểm).** Với 10+6, E=2, xấp xỉ 2.88 bằng (a) bỏ bit thấp và (b) round-to-nearest. Ghi M/E, giá trị lưu và sai số tuyệt đối.

**44. Làm tròn số âm (5 điểm).** Với 10+6, E=3, xấp xỉ -5.38 bằng round-to-nearest. So sánh với **bỏ bit thấp của biểu diễn bù hai có độ chính xác cao hơn**. Không hiểu thao tác thứ hai là làm tròn về 0.

**45. Sai số tích lũy (5 điểm).** Với 8+4, tìm số gần nhất của 0.1. Lập tổng khi cộng ba đầu vào đã xấp xỉ nhưng không làm tròn tổng. Sau đó xét làm tròn lại mỗi phép cộng theo ties-to-even: tổng thứ ba là bao nhiêu? Giải thích vì sao hai mô hình khác nhau.

**46. Độ chính xác cao hơn (5 điểm).** Giải thích double/quadruple precision giúp gì, giới hạn còn lại với 0.1, và vì sao làm tròn khi hiển thị không sửa được phép tính đã sai số. Đề xuất một cách biểu diễn phù hợp cho số tiền chỉ có hai chữ số thập phân.

**47. Ngoại lệ (5 điểm).** Trong hệ 8+4 chuẩn hóa: phân loại kết quả 200 và 1/1024; giải thích cách biểu diễn 0; phân biệt chia cho 0 với overflow do kết quả hữu hạn quá lớn.

**48. Quyết định thiết kế (5 điểm).** Một thư viện (a) ghi các lần mượn theo thứ tự đến, (b) in thông báo cho tất cả thành viên theo mã, (c) kiểm tra tài khoản khi đăng nhập. Chọn ba organisation khác nhau cho ba nhiệm vụ, nêu access phù hợp và lý do. Nêu hai field có kiểu khác nhau trong một member record.

## Tự đánh giá

Chấm riêng ba nhóm: 13.1 /10, 13.2 /15, 13.3 /75. Không dùng tổng điểm cao để bỏ qua nhóm yếu. Mục tiêu nội bộ: ít nhất 80% mỗi nhóm, sửa được mọi lỗi và giải được một câu tương tự với dữ liệu mới. Tiêu chí này không quy đổi sang grade Cambridge.
