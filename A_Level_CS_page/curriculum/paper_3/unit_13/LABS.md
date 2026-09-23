# Chapter 13 — Ba bài thực hành

Ngôn ngữ gợi ý: Python3. Mục tiêu là quan sát cơ chế, rồi giải thích bằng thuật ngữ Paper3. Không dùng kết quả float của Python để suy ra máy tính đang dùng mô hình M/E bù hai trong sách. Lời giải tham khảo: labs/reference_solutions.py; giáo viên cho mở sau khi học viên hoàn thành dự đoán.

## Lab 1 — Set và enum (20 phút)

**Dự đoán:** A={1,3,5}, B={3,4,5}. Viết hợp, giao, A trừ B; dự đoán chuyện gì xảy ra khi thêm3 vào A lần nữa.

**Thực hiện:** tạo hai set, thực hiện `A | B`, `A & B`, `A - B`, gọi `A.add(3)`; in kết quả đã sắp xếp để tiện đối chiếu. Việc sắp xếp đầu ra không làm set trở thành cấu trúc có thứ tự.

**Nộp:** mã nguồn, dự đoán, kết quả và giải thích. So sánh với enum TLevel=(ASLevel,ALevel): một biến TLevel nhận một giá trị; tập hợp có thể chứa nhiều phần tử. Thiết kế một tình huống phù hợp cho mỗi loại.

**Mở rộng tương đương Extension13A:** tìm thao tác kiểm tra membership và tập con trong ngôn ngữ đang học; viết ví dụ với 3 trong A và {1,3} là tập con A.

## Lab 2 — Hash tên và địa chỉ (25 phút)

**Yêu cầu:** nhập tên dài1–10 ký tự ASCII. Tính tổng mã ký tự, lấy MOD1000, nhân20 rồi cộng2000; in riêng tổng, slot, địa chỉ. File mô phỏng có1000 slot, mỗi record20 đơn vị địa chỉ. Không cần ghi file thật.

**Dự đoán:** tính cho AC và CA trước khi chạy. Nêu base address và record size từ công thức. Có thể dùng `ord()` trong Python cho ký tự ASCII; quy định không chấp nhận ký tự ngoài ASCII trong bài này.

**Thử nghiệm:** chuỗi1 ký tự,10 ký tự, rỗng,11 ký tự và AC/CA. Ghi việc từ chối dữ liệu không hợp lệ. Dùng một bảng nhỏ10 slot, hash tổngMOD10, lưu AC rồi CA bằng dò tuyến tính; tìm CA phải kiểm tra record key ở từng slot.

**Nộp:** mã, bảng thử và câu trả lời “Vì sao tổng mã không phân biệt được AC với CA?”.

## Lab 3 — Quan sát sai số (30 phút)

### A. Float của môi trường đang chạy

Viết vòng lặp **10 lần** cộng0.1, in `repr(total)` và `format(total, '.17g')`. Dự đoán tổng lý tưởng sau mỗi bước; ghi cả phiên bản ngôn ngữ và đầu ra thực tế. Không mặc định mọi ngôn ngữ hoặc lệnh in đều hiển thị cùng chuỗi chữ số.

Tiếp theo dùng số nguyên: cộng10 cent mười lần; dùng Decimal từ chuỗi `'0.1'`; so sánh. Nếu tạo Decimal từ float0.1 thì có thể đã mang theo sai số ban đầu.

### B. Mô hình Cambridge 8+4

1. Dùng phân số chính xác để tạo mọi giá trị M/E chuẩn hóa; M phải bắt đầu01 hoặc10.
2. Tìm giá trị gần0.1 nhất, không dùng float để quyết định khoảng cách. Kết quả phải đi kèm M/E.
3. Cộng ba lần giá trị đó bằng phân số, chỉ xấp xỉ đầu vào. Đối chiếu với V36.
4. Lặp lại nhưng sau mỗi phép cộng, đưa tổng về giá trị8+4 gần nhất. Khi hòa, chọn chỉ số mantissa chẵn (**ties-to-even**).
5. Giải thích tại sao hai tổng thứ ba khác nhau và vì sao điều đó không mâu thuẫn với V36.

**Nộp:** bảng ba mô hình (float thực tế; chỉ xấp xỉ đầu vào; xấp xỉ sau mỗi phép cộng), số liệu có nguồn và giải thích. Không gọi bảng giả lập8+4 là output mặc định của Python float.

### C. Số 0 và precision cao hơn

Thêm quy ước M=0/E=0 cho số0 trong mô phỏng. Giải thích vì sao nó không thỏa01/10 mà vẫn cần lưu được. Tìm xem ngôn ngữ/công cụ đang dùng hỗ trợ double hoặc quadruple bằng kiểu/thư viện nào; nếu không có, ghi rõ kết quả. Không cần tự cài thư viện để đạt bài này. So sánh việc tăng precision với chỉ in ít chữ số hơn.

## Tiêu chí đánh giá nội bộ

Mỗi lab10 điểm: dự đoán2; thực hiện đúng3; thử nghiệm/bằng chứng2; giải thích gắn với kiến thức3. Chạy được code nhưng không giải thích được chưa được coi là hoàn thành kỹ năng ôn thi.
