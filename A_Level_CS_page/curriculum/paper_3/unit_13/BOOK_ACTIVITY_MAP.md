# Chapter 13 — Bản đồ sách, bài giảng và bài luyện

Trang dưới đây là **trang in** của sách đã cung cấp. Mục đích là bao phủ kỹ năng của các hoạt động bằng lời giải/ví dụ mới, không chép lại nguyên bộ bài tập. P1–28=PRACTICE, P29–48=EXTENDED_PRACTICE; G=STUDENT_GUIDE. Đáp án tương ứng nằm trong ANSWERS và EXTENDED_ANSWERS.

## Khung kiến thức đầu vào

| Sách | Nội dung | Nơi ôn và kiểm tra |
|---|---|---|
| What you should already know, tr.304 | Chọn kiểu, record | PREREQUISITES D1–D2; đáp án TEACHER_GUIDE |
| What you should already know, tr.308 | READ/WRITE/APPEND và thao tác file | D3; pseudocode mẫu trong TEACHER_GUIDE; chạy bằng file riêng |
| What you should already know, tr.312 | Binary, bù hai, cộng, scientific notation và phân số | D4–D8; G3; P34–37 |

## Activities và extensions

| Sách | Kỹ năng cần đạt | Bài tương đương và minh chứng |
|---|---|---|
| Activity13A, tr.305 | Enum ngày, biến, gán và giá trị kế tiếp | G1.2; P2/29 |
| Activity13B, tr.306 | Pointer tới enum có kiểu | G1.4; P30 |
| Activity13C, tr.307 | Phân loại, lý do tự định nghĩa, chọn kiểu | G1.1–1.6; P1/3/7/28 |
| Extension13A, tr.307 | Set trong ngôn ngữ lập trình | Lab1 và lời giải tham khảo |
| Activity13D, tr.311 | Hash, base, kích thước record và địa chỉ kế tiếp | G2.3–2.4; P12/32 |
| Activity13E, tr.311 | So sánh serial/sequential, direct access và chọn file | G2.1–2.4; P9–11/31/48 |
| Extension13B, tr.311 | Chương trình hash tên | Lab2, kiểm thử cả độ dài và collision |
| Activity13F, tr.317 | Giải mã đủ dấu M/E | G3.2; P16–18/34–35/39 |
| Activity13G, tr.320 | Mã hóa số nguyên/phân số, dương/âm | G3.3; P19–20/36/38–39 |
| Extension13C, tr.319 | Hai biểu diễn cùng giá trị | G3.4; P21–22/40 |
| Extension13D, tr.321 | Xấp xỉ số không lưu chính xác | G3.6; P24/43–44; bảng nhân2 ở G3.3 |
| Activity13H, tr.323 | Chuẩn hóa dương/âm, E dương/âm | G3.4; P21–22/40 |
| Extension13E, tr.324 | Chạy chương trình và phân tích sai số cộng lặp | G3.6; P45; Lab3A–B |
| Extension13F, tr.325 | Tìm cách lưu0 | G3.4/3.7; P27/47; Lab3C |
| Activity13I, tr.325 | Limits10+6, chia word32, overflow/chia0, xấp xỉ âm/dương | G3.5–3.7; P41–44/47 |

## Câu cuối chương

| Câu sách | Dạng yêu cầu | Bài/lời giải tương đương | Điểm luyện nội bộ liên quan |
|---|---|---|---|
| Q1, tr.325–326 | Đọc word24bit, chuẩn hóa, precision/range,0 | G3.5 ví dụ16+8; P39–42/47; ANSWERS21–23/27 | 25 điểm ở P39–42/47 |
| Q2, tr.326 | Đổi hai chiều12+6, dấu dương/âm | G3.5 có ví dụ12+6 và kiểm tra ngược; P38; bổ sung bài chuyển số trong hướng dẫn dưới | 5 điểm ở P38; dùng tiêu chí cùng dạng khi đổi số |
| Q3, tr.326 | Mã hóa dương/âm8+8 | G3.3; P36 và bài chuyển số dưới | 5 điểm ở P36; cùng tiêu chí M/E và working |
| Q4, tr.326–327 | Nhận diện kiểu; khai báo/gán record có enum | P2–4/7/28–30 | 10 điểm ở P29–30; P2–4/7/28 chấm theo ý |
| Q5, tr.327 | Nối organisation/access; chọn3 file theo tình huống | G2.1–2.2, V13; P10–11/48 | 5 điểm ở P48 |

### Bài chuyển số thêm cho Q2/Q3

Để tự làm một lượt không nhìn số mẫu, hãy mã hóa **+9.25 bằng12+6** và **-5.5 bằng8+8** rồi đọc ngược. Mỗi bài5 điểm: đổi binary1, chọn M/E chưa padding1, M đủ bit đúng dấu1, E đủ bit1, kiểm tra ngược1.

Đáp án giáo viên: +9.25 → M010010100000/E000100; -5.5 → M10101000/E00000011. Các mã này dùng để kiểm tra chéo; khi phát bài mới có thể che đoạn đáp án này. Trong bản học viên, dùng P38 vàP36 trước rồi tự đổi dấu/giá trị để luyện thêm.

## Đề thi A Level tiếp nối

SOURCES_AND_TEACHER_NOTES chỉ rõ5 câu QP/MS 9618 đã chọn. Chúng bổ sung luyện thi sau khi đã hiểu chương sách. Đánh giá lần này không xác nhận mọi câu của toàn bộ kho Past_Papers.
