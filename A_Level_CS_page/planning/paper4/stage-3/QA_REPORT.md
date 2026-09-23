# QA Stage 3 — PASS sau sửa và kiểm lại

Lead đã đọc kết quả độc lập của A8, review phạm vi của A3, các locator của A2 và registry/đánh giá của A1. Không dùng self-check của người viết làm căn cứ duy nhất để nghiệm thu. [A8_FINAL_QA.json](evidence/A8_FINAL_QA.json) giữ checksum của cả 5 JSON và 5 Markdown được kiểm; [A8_REVIEW](evidence/A8_REVIEW.md) nêu chi tiết phạm vi và giới hạn review.

## Kết quả

- **58/58 dạng** giữ đúng tập ý thi đã được chấm trong Stage 2 và có chuỗi kỹ năng → kiến thức → mục/trang sách → syllabus/quy tắc đánh giá → lesson/block.
- **108/108 block** có nguồn và điểm đến VI/EN dự kiến; **55 mục sách**, **139 cặp trang in/PDF** được kiểm bằng máy. A2 đọc nguồn và xem 24 trang neo; Lead/A8 kiểm thêm các trang quan trọng.
- **111 mục tiêu biên tập** có quyết định phạm vi; **107/107 mục không loại trừ** có điểm đến kiến thức và yêu cầu đánh giá. **44 tiểu mục** của toàn syllabus đã được xét, **14 quy tắc đánh giá** tách riêng.
- **107 yêu cầu đánh giá** có brief VI/EN và **324 tiêu chí nghiệm thu** cụ thể; được gom vào các đích của **37 bài luyện dự kiến**. Các tiêu chí nội bộ hiện bằng tiếng Anh; nội dung cho học sinh ở stage sau phải đủ VI/EN.
- **26 lesson**, **13 gói**, đủ 10 khối learning page được lên kế hoạch ở từng gói. **58 cạnh lesson** (46 required, 12 review) và **7 nhóm điều kiện block** có lý do; kiểm không có chu trình và không có ID thiếu.
- A8 chạy **5.752 kiểm tra tổng hợp: PASS, 0 lỗi**. Stage 1 kiểm lại **1.809 artifact và 94 nguồn gốc: PASS**; Stage 2 kiểm **95 artifact và 5 input: PASS**.

## Vòng sửa bắt buộc đã đóng

| Finding | Vấn đề | Cách xử lý đã được kiểm lại |
|---|---|---|
| S3-A8-01 | Thiếu riêng khả năng cài ADT từ ADT khác | Bổ sung SYL-19.1-30 và đánh giá composition thực sự |
| S3-A8-02 | Dùng output thay cho trace đệ quy | Ghi corpus absent cho trace; thêm yêu cầu frame/local state/call/return |
| S3-A8-03 | Record toàn integer bị dùng làm dẫn chứng nhiều kiểu dữ liệu | Đổi sang SaleData STRING/INTEGER, đối chiếu QP/MS |
| S3-A8-04 | Ví dụ không có vòng lặp được gán cho post-condition | Loại ví dụ sai; chỉ giữ ngữ cảnh ít nhất một lần với mức partial |
| S3-A8-05 | Mức dẫn chứng append/exception chưa khớp yêu cầu cụ thể | Ghi direct ở đúng ý được chấm; giữ hạn chế cho phần giải thích/lựa chọn |
| S3-A8-06 | Composition thiếu tiên quyết theo backend | Bổ sung điều kiện linked-list hoặc tree, không ép cả hai |
| S3-A8-07 | Tiên quyết objective kế thừa quá rộng, thiếu lý do | Loại đồ thị đề xuất khỏi bản có hiệu lực; dùng đồ thị lesson/block đã review |
| S3-A8-08 | Brief bỏ sót phần giải thích chọn loop và hashing | Bổ sung yêu cầu giải thích VI/EN và tiêu chí tương ứng |
| A3-AGG-01 | Brief composition khác backend mặc định | Đồng nhất coverage, gap, assessment và dependency với dictionary dùng linked-list |

Các phát hiện dẫn chứng đã kéo theo rà lại **toàn bộ 111 hàng** ở A3, thay vì chỉ sửa hai ví dụ được chỉ ra. Chỉ giữ 74 liên kết dẫn chứng được chọn thủ công thuộc 45 ý thi; không lấy ví dụ đầu tiên theo pattern tag. A8 đọc lại các hàng cuối và kiểm locator với Stage 2.

## Giới hạn nghiệm thu

PASS chứng nhận bản thiết kế, nguồn dẫn và kế hoạch bao phủ. Không chứng nhận khóa học đã hoàn thành, code mẫu chạy đúng, đạt điểm tối đa hoặc dự đoán dạng thi 2026. Corpus thiếu/chưa đủ được giữ rõ: 65 mục cần đánh giá bổ sung; 42 mục observed vẫn cần kiểm tra vận dụng. 19 khoảng trống sách cần tổng hợp/kiểm code sau này.

A8 kiểm semantic nguồn sách theo mẫu 17 trang rủi ro, ngoài kiểm locator toàn bộ; không tuyên bố đọc lại từng dòng của mọi trang được dẫn hoặc rà mới đủ 672 ý thi. Các caveat Stage 1 vẫn có hiệu lực. Chưa triển khai lesson, routes, rubric cho học sinh, Python, fixtures hoặc event visual; Stage 4 chưa bắt đầu.
