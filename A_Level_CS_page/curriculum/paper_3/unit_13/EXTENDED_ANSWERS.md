# Unit 13 — Đáp án và hướng dẫn chấm câu 29–48

Mỗi câu 5 điểm, tổng 100. Cho điểm độc lập theo các ý; chấp nhận cách tương đương có giải thích đúng. Đây là hướng dẫn nội bộ. Khi có lỗi số học nhưng phương pháp đúng, chỉ cho các điểm phương pháp đã thể hiện, không tự cho điểm kết quả.

**29.** TDay liệt kê đúng bảy ngày (1); DECLARE Today/Tomorrow:TDay (1); Today←Friday, Tomorrow←Today+1 cho Saturday (1); IF Today=Sunday THEN Tomorrow←Monday ELSE Tomorrow←Today+1 ENDIF (1); quay vòng cần quy tắc riêng, không tự phát sinh từ enum (1).

**30.** `TYPE TDayPointer = ^TDay` (1); `DECLARE P : TDayPointer` (1); `P ← ^Today` (1); sau gán Today←Saturday, P^ là Saturday (1); P giữ địa chỉ của Today, không giữ bản sao Wednesday (1).

**31.** A:100% (1); B:12/2400×100%=0.5% (1); A sequential vì xử lý toàn bộ (1); B direct để tránh quét từ đầu (1); index key→địa chỉ hoặc hash key→vị trí kèm xử lý collision (1).

**32.** Slot354 (1); `500+354×5` (1); địa chỉ2270 (1); tiếp theo slot355, địa chỉ2275 (1); so key rồi tiếp tục đường dò nếu không khớp (1).

**33.** AC và CA đều tổng132 (1), MOD10=2 (1); AC ở2, CA ở3 (1); tìm CA: đọc2 so key, rồi3 (1); overflow area giữ CA ở vùng tràn và khi đọc phải tìm đúng key tại đó thay cho chỉ dò vùng chính (1).

**34.** M=90/128=45/64 (1); E=4 (1); X=11.25 (1); `0.1011010₂ → 01011.010₂` khi dịch phải4 (1); M bắt đầu01 nên chuẩn hóa (1).

**35.** M=-80/128=-0.625 (1); E=-2 (1); X=-0.15625 (1); bù hai M lấy độ lớn01010000, dịch0.101 sang trái2 cho0.00101 rồi đặt dấu âm (1); 2^-2 dương nên dấu vẫn do M quyết định (1).

**36.** 5.5=11/2=(11/16)×2^3 (1), M01011000/E00000011 (1). 0.171875=11/64=(11/16)×2^-2 (1), M01011000/E11111110 (1); hai kết quả có M bắt đầu01, đọc ngược đúng (1).

**37.** Ba tích0.75,1.5,1.0 cùng phần dư0.75,0.5,0 (1); các bit011 (1); 13.375=1101.011₂ (1); sáu bit đầu0.1 là000110 (1); phần dư0.2 lặp sau vòng đi qua0.4,0.8,0.6 nên biểu diễn không kết thúc (1).

**38.** 8.375=1000.011₂=0.1000011₂×2^4 (1); M dương010000110000 (1); M âm101111010000 (1); E000100 (1); (-1072/2048)×16=-8.375 (1).

**39.** Độ lớn0.00101₂=0.101₂×2^-2 (1); M dương0101000000000000 (1); M âm1011000000000000, đủ16 bit (1); E11111110, đủ8 bit, bằng-2 (1); (-20480/32768)×1/4=-0.15625 (1).

**40.** (a) M01100000/E11111100 (1), dịch2 giảm E từ-2 xuống-4 (1); trước/sau đều3/64=0.046875 (1). (b) M10000000/E11111100, dịch3 giảm E từ-1 xuống-4 (1); trước/sau đều-1/16=-0.0625 (1).

**41.** M/E và giá trị mỗi dòng đúng được1 điểm:

| Giới hạn | M | E | Giá trị |
|---|---|---|---|
| Dương lớn nhất | 0111111111 | 011111 | (511/512)×2^31 |
| Dương nhỏ nhất | 0100000000 | 100000 | 2^-33 |
| Âm có độ lớn lớn nhất | 1000000000 | 011111 | -2^31 |
| Âm gần0 nhất | 1011111111 | 100000 | (-257/512)×2^-32 |

Điểm5: miền mantissa bù hai có -1 nhưng không có +1; điều kiện chuẩn hóa cũng tạo biên gần0 âm/dương khác nhau.

**42.** Mỗi dòng đúng ba thông số được1 điểm:

| M+E | Bit phân số | Miền E | Dương lớn nhất |
|---|---:|---|---|
| 12+4 | 11 | -8..7 | (2047/2048)×2^7 |
| 8+8 | 7 | -128..127 | (127/128)×2^127 |
| 4+12 | 3 | -2048..2047 | (7/8)×2^2047 |

Nêu nhiều bit M tăng precision, nhiều bit E mở rộng range khi tổng cố định (1); word32 chưa đủ, cần cách chia M/E và quy ước định dạng (1).

**43.** Chỉ số M=2.88/4×512=368.64 (1). Bỏ bit: M0101110000/E000010 (1), lưu2.875, lỗi0.005 (1). Nearest: M0101110001/E000010 (1), lưu2.8828125, lỗi0.0028125 (1).

**44.** Chỉ số M=-5.38/8×512=-344.32 (1). Nearest -344 → M1010101000/E000011 (1), lưu-5.375, lỗi0.005 (1). Bỏ bit thấp giữ-345 → M1010100111/E000011, lưu-5.390625 (1); lỗi0.010625, không phải hướng về0 (1).

**45.** Nearest0.1=M01100110/E1101=0.099609375 (1). Tổng chỉ xấp xỉ đầu vào:0.099609375,0.19921875,0.298828125 (1); tổng3 trừ0.3=-0.001171875 (1). Làm tròn mỗi phép cộng: tổng3=0.296875 vì 0.298828125 nằm giữa0.296875/0.30078125 và chỉ số M76 chẵn được chọn (1); mô hình đầu có tổng chính xác ngoài định dạng, mô hình sau lượng tử hóa tổng sau mỗi phép cộng (1).

**46.** Định dạng độ chính xác cao hơn có thể giữ thêm bit định trị (1); hỗ trợ/tổ chức bit phụ thuộc môi trường (1); binary hữu hạn vẫn không lưu0.1 chính xác (1); định dạng hiển thị không sửa số đã lưu/phép tính (1); tiền hai số lẻ có thể lưu bằng INTEGER số cent, với chuyển đổi đầu vào chính xác và đủ range (1).

**47.** 200>127:overflow (1); 1/1024<1/512:underflow trong mô hình chuẩn hóa (1); 0 cần quy ước riêng, chẳng hạn M toàn0 (1); chia cho0 không cho kết quả hữu hạn hợp lệ (1); overflow hữu hạn như100×2 phải so với range, không coi chia cho0 là cùng cơ chế (1).

**48.** (a) serial/append theo thứ tự sự kiện, sequential khi đọc (1); (b) sequential theo mã/sequential access toàn bộ (1); (c) random/direct qua hash và kiểm tra collision (1); giải thích gắn đủ thứ tự đến/toàn bộ/một tài khoản (1); ví dụ MemberID:STRING, BooksBorrowed:INTEGER (1). Không lưu mật khẩu nguyên văn; lựa chọn organisation không tự quyết định cách bảo vệ thông tin đăng nhập.
