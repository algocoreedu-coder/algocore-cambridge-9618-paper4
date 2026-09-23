# Nguồn thiếu và cách xử lý — Stage 1

Phạm vi được khóa là29QP/29MS của baseline2021–2025, không phải mọi kỳ/variant Cambridge từng phát hành. Không bỏ câu cần dữ liệu khỏi phạm vi để đạt gate.

## Thiếu bắt buộc trong baseline: đã xử lý8/8

| Paper | Dữ liệu cần theo QP | Nguồn sau xử lý |
|---|---|---|
|9618_w21_41|Pictures.txt — Q2(e)|`data/recovered/9618_w21_sf_41.zip`|
|9618_w21_42|Pictures.txt — Q2(e)|`data/recovered/9618_w21_sf_42.zip`|
|9618_s22_41|HighScore.txt — Q1|`data/recovered/9618_s22_sf_41.zip`|
|9618_s22_42|CardValues.txt — Q3|`data/recovered/9618_s22_sf_42.zip`|
|9618_s22_43|HighScore.txt — Q1|`data/recovered/9618_s22_sf_43.zip`|
|9618_w23_41|QueueData.txt — Q2|`data/recovered/9618_w23_sf_41.zip`|
|9618_w23_42|StackData.txt — Q1|`data/recovered/9618_w23_sf_42.zip`|
|9618_w23_43|QueueData.txt — Q2|`data/recovered/9618_w23_sf_43.zip`|

Tìm trong kho/RAR không bổ sung được8file này. A2 tìm lại từ QualifiedQuest CDN công khai; từng URL/thời điểm tải/SHA-256 và giới hạn nguồn được ghi trong [A2_DATA_RECOVERY.json](evidence/A2_DATA_RECOVERY.json). A2 và A8 kiểm CRC, path, hash byte giải nén, tên/định dạng và nội dung mẫu đối chiếu QP. Không có dữ liệu giả được thay vào. Không tuyên bố đã đối chiếu chữ ký hoặc byte với máy chủ Cambridge.

Hiện có29ZIP, đủ38file dữ liệu đầu vào,6provided blank output target và29evidence.doc. Chi tiết từngfile/câu/trang: [A2_DATA_AUDIT.json](evidence/A2_DATA_AUDIT.json). Số liệu theo từngbundle, không phải số nội dung unique. Các file rỗng Blue/Green/Orange/Pink/Red/Yellow của s25/41 là đúng QP. `NewHighScore.txt` ở s22/41,43 và `Tree.txt` ở w25/42 là output thí sinh tạo, không phải missing input.

## Giới hạn corpus đã khai báo

- Examiner report hiện có5file cấp kỳ: s21,s22,w22,s23,w23. Đã xác định15section Paper4; s21/41 nêu không đủ thí sinh để có báo cáo có ý nghĩa,14section còn lại có nội dung. Không gán report của41 sang42/43 dù QP giống nhau.
- Không có ER cho w21,s24,w24,s25,w25 trong baseline. Theo playbook, ghép ER **nếu có**; đây là nguồn bổ sung chưa có, không phải thiếu QP/MS/SF bắt buộc. Không suy ra kinh nghiệm examiner cho các kỳ đó. Không thực hiện tìm bổ sung toàn bộ ER trong stage này.
- Không có w21/43, đề2026, February–March hoặc specimen trong baseline. Chưa khẳng định chúng có/không phát hành. Thêm paper sau này cần bổ sung QP/MS/SF/index và review trước khi dùng; không tự tăng phạm vi lần nghiệm thu này.
-120học liệu cũ chỉ là ứng viên từ Stage0, chưa audit, không tính là corpus chính hay lesson đạt chuẩn.

**Nguồn cần thiết để làm các câu trong29đề: không còn thiếu sau kiểm A2/A8.** Giới hạn nguồn mirror, ER và code-source caveats được giữ trong manifest/policy; PASScorpus không phải chứng nhận lời giải hoặc khóa học hoàn thành.
