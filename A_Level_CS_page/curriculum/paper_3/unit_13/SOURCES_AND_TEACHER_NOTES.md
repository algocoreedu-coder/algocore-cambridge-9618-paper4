# Unit 13 - Nguồn và lưu ý triển khai

Ngày biên soạn: 15/09/2026. Phạm vi: nội dung học viên cần học và chứng minh được; chưa triển khai thành website hay bộ slide. Tài liệu học sinh giải thích bằng tiếng Việt, giữ thuật ngữ và pseudocode bằng tiếng Anh.

## 1. Tài liệu đã đối chiếu

| Nguồn | Phần đã đọc | Vai trò |
|---|---|---|
| Watson & Williams, Cambridge International AS & A Level Computer Science, 2019 | Toàn bộ Ch.13, trang in 304-327 / trang PDF 320-343 | Kiến thức và phạm vi của unit |
| Cambridge 9618 syllabus 2026 | Trang 32-33, mục 13 | Đối chiếu bản syllabus có sẵn |
| Cambridge 9618 syllabus 2027-2029, version 2 | Trang 32-33, mục 13 | Đối chiếu phạm vi hiện hành cho các năm thi này |
| Pseudocode Guide 2027-2029 | Trang 12-14 và 28-29 | Enum, pointer, set, record, thao tác dữ liệu và class/object |
| QP và MS chọn lọc bên dưới | Các câu được chỉ định | Kiểm tra dạng kỹ năng, không dùng để dự đoán đề |

[Sách nguồn](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf).

[Syllabus 2026 local](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/697372-2026-syllabus.pdf).

[Syllabus 2027-2029 chính thức](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf) và [Pseudocode Guide](https://www.cambridgeinternational.org/Images/721401-2027-2029-pseudocode-guide.pdf).

Đã so sánh mục 13 trong hai syllabus: các nhóm yêu cầu nêu trong tài liệu này tương ứng ở cả hai bản. Năm thi của lớp vẫn chưa được chốt; không suy rộng kết quả đối chiếu Unit 13 thành kết luận toàn bộ hai syllabus giống nhau.

## 2. Ma trận bao phủ

| Mục tiêu | Nơi học | Cách kiểm tra |
|---|---|---|
| Lý do cần user-defined types và chọn kiểu | Guide 1.1-1.6 | Câu 1, 3, 7, 28 |
| Enum, pointer | Guide 1.2, 1.4 | Câu 2, 5 |
| Set, record, class/object | Guide 1.3, 1.5, 1.6 | Câu 3-4, 6, 8 |
| Tổ chức tệp và lựa chọn access | Guide 2.1-2.2 | Câu 9-11 |
| Hashing khi ghi/đọc, collision | Guide 2.3-2.4 | Câu 12-15 |
| Biểu diễn và đổi hai chiều | Guide 3.1-3.3 | Câu 16-20 |
| Normalise và lý do | Guide 3.4 | Câu 21-22, 27 |
| Phân bổ bit, precision và range | Guide 3.5 | Câu 23, 25 |
| Xấp xỉ, làm tròn, overflow/underflow | Guide 3.6-3.7 | Câu 24, 26-27 |

Giữ phần class/object ở mức mô hình dữ liệu và ví dụ đơn giản. Nội dung kế thừa/đa hình chuyên sâu thuộc tiến trình Unit 20. Việc code chương trình quản lý file đầy đủ là bước thực hành tiếp nối; bài tính hash và truy vết trong unit này vẫn cần làm được trên giấy.

## 3. Đề thi chọn lọc sau khi học

| Thứ tự | Mã đề và câu | Kỹ năng | Nguồn |
|---|---|---|---|
| 1 | 9618/31 M/J 2025, Q1 | Enum và thiết kế record đúng kiểu field | [QP](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2025/May_June/9618_s25_qp_31.pdf), [MS](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2025/May_June/9618_s25_ms_31.pdf) |
| 2 | 9618/31 O/N 2021, Q5 | So sánh organisation và chọn access | [QP](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2021/Oct_Nov/9618_w21_qp_31.pdf), [MS](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2021/Oct_Nov/9618_w21_ms_31.pdf) |
| 3 | 9618/31 M/J 2023, Q3 | Tính hash, lưu và tìm khi có collision | [QP](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2023/May_June/9618_s23_qp_31.pdf), [MS](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2023/May_June/9618_s23_ms_31.pdf) |
| 4 | 9618/31 M/J 2025, Q2 | Chuẩn hóa và mã hóa số âm; M 10 bit, E 6 bit | [QP](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2025/May_June/9618_s25_qp_31.pdf), [MS](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2025/May_June/9618_s25_ms_31.pdf) |
| 5 | 9618/31 M/J 2023, Q1(a) | So sánh biểu diễn khi thay đổi số bit | [QP](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2023/May_June/9618_s23_qp_31.pdf), [MS](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Past_Papers/2023/May_June/9618_s23_ms_31.pdf) |

Cho học viên mở QP trước, tự làm rồi chấm bằng đúng MS. Không nhập các đề này vào kho mock chưa từng xem sau khi đã dùng để luyện.

Trong workspace đã có [chỉ mục Unit 13](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Chapter_13_Data_Representation_Paper_3.md) và [bộ câu hỏi học viên](D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/Chapter_13_Data_Representation_Student_Questions.md). Có thể dùng để mở rộng; lần triển khai này không tái kiểm định tất cả thống kê hoặc 47 câu trong các file đó.

## 4. Lưu ý tránh truyền lại lỗi hoặc cách diễn đạt gây nhầm

1. **Trang 313 sách:** khoảng của số nguyên bù hai 16 bit phải là -32768..32767; đoạn sách in khoảng -16384..16383 không đúng cho 16 bit. Fixed-point nói chung vẫn có thể biểu diễn phần lẻ khi quy định vị trí binary point. Guide dùng mô hình M/E được mô tả rõ thay cho đoạn dẫn nhập này.
2. **Trang 307 sách:** ví dụ SET khai báo tên kiểu rồi dùng tên khác ở dòng DEFINE. Bài học đã dùng tên kiểu nhất quán. Chọn kiểu field theo ý nghĩa dữ liệu, không sao lại mọi field STRING của ví dụ record trên trang đó.
3. **Trang 321 sách:** ví dụ 5.88 với mantissa 8 bit bị cắt sai một bit hữu ích. Với E=3, M có 7 bit phân số; 5.88/(2^3)×128=94.08. Truncate giữ 94, tức M=01011110, lưu 5.875. Giá trị 5.75 trên trang không phải kết quả cắt đúng với định dạng đã nêu. Tài liệu học viên dùng ví dụ tự tính 13.375 để phân biệt truncate và round-to-nearest.
4. **Open/closed hash:** cách gọi trong sách trang 311 và MS M/J 2023 Q3 không thống nhất. Dạy cơ chế rõ ràng: dò vị trí trống kế tiếp hoặc dùng overflow area; khi làm đề, theo mô tả và tiêu chí của đúng đề. Không bắt học viên đoán cơ chế chỉ từ một nhãn.
5. **Pointer:** phân loại non-composite theo syllabus. Không dùng định nghĩa quá giản lược “có tên kiểu khác trong khai báo thì composite”. Dữ liệu được trỏ tới phải phù hợp kiểu pointer; các ví dụ trong tài liệu này giữ đúng điều đó.
6. **Normalisation:** phải giữ giá trị và đúng số bit. Không nói chuẩn hóa phục hồi được bit đã mất; không kết luận máy tính không biểu diễn được 0.
7. **Overflow:** chia cho 0 cần xử lý riêng. Ví dụ overflow trong tài liệu dùng một phép tính hữu hạn vượt range; ví dụ underflow nêu rõ mô hình chỉ xét số chuẩn hóa.

## 5. Kiểm tra trước bàn giao

- Đã đọc văn bản toàn bộ Ch.13; xem hình render các trang liên quan đến bit layout, ví dụ và lỗi đã nêu.
- Đã đối chiếu cú pháp mẫu với Pseudocode Guide, dùng dữ liệu ví dụ tự biên soạn.
- Các phép đổi floating-point, normalisation, giới hạn, sai số và dò hash được kiểm tra độc lập bằng phân số chính xác và mô phỏng nhỏ.
- Bộ tài liệu cung cấp nội dung, 8 khối bài học, 28 câu tự luyện và đáp án; chưa được thử nghiệm với một lớp học thực tế.

## Bản hoàn thiện cho giảng dạy và ôn tập

Bản cập nhật bổ sung 20 câu (29–48), ba lab có lời giải chạy được, ôn AS, kế hoạch dạy, phiếu ôn và bản đồ các hoạt động/câu cuối chương. Kết quả hiện hành nằm trong [BOOK_ALIGNMENT_REVIEW](BOOK_ALIGNMENT_REVIEW.md); báo cáo 87% trước sửa được giữ ở thư mục audit. V36 đã sửa nearest của 0.1 về 0.099609375 và nêu rõ chỉ làm tròn đầu vào.

Đối chiếu lại syllabus 2027–2029 version 2 và mục user-defined types của Pseudocode Guide vào 15/09/2026. Sách đã đọc toàn bộ Chapter 13 ở lần đối chiếu trước; bản cập nhật dùng checklist và trang nguồn đã xác minh.

## Nguồn bổ sung cho 13.4

Xem [danh sách 15 cặp QP/MS](EXAM_SOURCE_REGISTER.md), kèm bản PDF nguyên trạng trong `exam_sources` và SHA-256 trong JSON. Dùng mục [13.4](EXAM_PATTERNS.html) để phân loại câu; lưu ý hiệu chỉnh subrange/array ở M/J 2022/31 và khác biệt nhãn hashing ở M/J 2023/31.
