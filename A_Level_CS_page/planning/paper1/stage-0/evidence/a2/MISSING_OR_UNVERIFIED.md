# Nguồn thiếu / chưa xác minh - A2

Version 1.0 | 2026-09-19 | P1-S0-A2-01 | Trạng thái SUBMITTED, chờ A9.

Không phát hiện thiếu QP/MS theo mã trong tập 30 cặp đã chọn. Các mục dưới là giới hạn có bằng chứng hoặc việc thuộc Stage 1, không phải lý do tự coi toàn corpus đã được kiểm.

| ID | Trạng thái / bằng chứng | Tác động | Owner và hành động |
|---|---|---|---|
| A2-U01 | Chưa đối chiếu toàn nội dung 60 QP/MS; manifest ghi content audit not performed | Chưa thể tạo question index/coverage/marking map đáng tin | A2 Stage 1 extract theo lô; A4 so từng câu/ý QP-MS; A9 nghiệm thu |
| A2-U02 | QP `9618_s25_qp_11` PDF p2-3: text mất logic gates/wires, còn text nhãn; render gốc rõ | Text-only ingestion làm thiếu dữ kiện | A2 đánh dấu hình/bảng cần visual QA; A7/A4 kiểm asset theo câu trước sử dụng |
| A2-U03 | Sách p5-6 render được, nhưng Poppler báo malformed dictionary key tại offsets 17606450/17606730; log `poppler_book_stderr.txt` | Chưa bảo đảm render mọi trang sách; không kết luận sách hỏng toàn bộ | A2 kiểm từng trang được dùng ở Stage 1; chỉ tạo bản dẫn xuất/alternative nếu lỗi thực ảnh hưởng, giữ hash bản gốc |
| A2-U04 | Sách được xác định first published 2019 / ISBN 9781510457591; không có numbered-edition label ở front matter đã xem | Không gán edition number hoặc gọi là sách 2026 | A3 dùng định danh publication+ISBN và mapping với syllabus 2026; A2 giữ edition label unknown |
| A2-U05 | 78 derived files chỉ kiểm path/size/hash; 11 chưa rõ scope theo tên | Không được tái dùng làm official evidence hay kế thừa approved cũ | A0 chọn gói tái dùng; A3/A4 audit học thuật và nguồn rồi A9 review |
| A2-U06 | 2021-2025 / June-November là corpus local hiện có; không có đề 2026 trong tập `Past_Papers` | Không tuyên bố đủ mọi năm thi hoặc cần phải dùng lịch sử để dự đoán 2026 | A0 giữ baseline 30 cặp; mở rộng corpus nếu được giao sau Stage 0; syllabus 2026 vẫn điều khiển scope |
| A2-U07 | Chưa phân nhóm variants tương đương, chưa chọn holdout | 30 file pairs không phải 30 mẫu độc lập | A4 so nội dung/marking trước khi chia train/assessment; A0 quản split Stage 1 |
| A2-U08 | Sách và QP/MS local chưa so hash với bản publisher/Cambridge; cover identity đúng không chứng minh authenticity mọi byte | Giới hạn provenance kỹ thuật, không đưa claim remote-certified | A2 giữ trạng thái này; khi nguồn/câu có nghi vấn, A2/A4 kiểm bản official phù hợp; syllabus đã được A3 download và A2 so hash |

Các record official/adapted/original phải được lập ở cấp nội dung khi biên soạn: câu gốc và MS gốc có nguồn official, bản Việt là bản dịch AlgoCore, câu sửa là adapted, câu/rubric tự soạn là original. Không gán marking point official chỉ vì cùng chủ đề hoặc ví dụ từ sách.

Điểm dừng: đã hoàn thành baseline Stage 0 trong vùng ghi A2; chờ A9. Chưa bắt đầu các hành động Stage 1 trong bảng này.
