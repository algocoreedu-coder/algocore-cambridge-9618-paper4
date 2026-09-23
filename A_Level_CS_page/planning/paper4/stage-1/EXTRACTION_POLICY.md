# Chính sách sử dụng corpus — Stage 1

Corpus có ba lớp đi cùng nhau: PDF gốc có SHA-256; text theo từng trang và geometry; ảnh trang (facsimile) của toàn bộ QP/MS. `SOURCE_MANIFEST.json` là điểm vào, `FACSIMILE_MANIFEST.json` trỏ tới từng ảnh. Trang đều là PDF 1-based. Ảnh 110 dpi giúp đọc nhanh; mở PDF ở độ phóng đại cao khi ký tự nhỏ hoặc chưa rõ.

## Nguồn có thẩm quyền và giới hạn

- Đề yêu cầu gì: đọc QP. Tiêu chí/điểm chấm: đọc MS và đúng cột Marks, không suy điểm bằng số bullet. Nhận xét ER chỉ thuộc đúng kỳ/variant, không tự trở thành quy định thi năm2026. Syllabus2026 v2 là baseline phạm vi đã khóa ở Stage0.
- Source gốc là bất biến. Khi phát hiện typo hoặc bất nhất, ghi source ID, trang, câu/ý và mô tả; không sửa PDF/text thành lời giải đúng. Code dạy học phải được A5 kiểm chứng ở Stage5, với thay đổi được giải thích.
- `prompt_summary` và `evidence_requirement` là chỉ dẫn điều hướng của đội biên tập, không thay toàn văn đề hoặc bảng kiểm thử. Lesson VI/EN sẽ được biên soạn ở stage sau; corpus giữ ngôn ngữ gốc.
- Bản sách là học liệu kiến thức, không phải mark scheme. Metadata sách được kiểm tại PDF5–6, mục lục PDF7–9. Mọi map kiến thức ở Stage3 phải kiểm đúng block/trang, không suy từ tên chương.

## Quy tắc bắt buộc cho code, pseudocode, bảng và hình

1. **Luôn đọc text cùng PDF/facsimile** trước khi diễn giải hoặc chép code, pseudocode, bảng dữ liệu, quan hệ cây/node, output screenshot. Text đơn lẻ không đủ điều kiện làm nguồn xây lời giải hoặc visual.
2. Text chuẩn dùng PyMuPDF natural order (`sort=False`). `sorted_text_for_reference_only` không có thẩm quyền: sắp theo tọa độ có thể đảo code ở MS xoay trang. `bbox` là tọa độ gốc; `display_bbox` đã áp dụng rotation matrix. Geometry giúp đối chiếu, không bảo đảm khôi phục được mọi đồ họa.
3. Có ký hiệu được vẽ thành đồ họa/không ánh xạ thành text: dấu `_` ở một số constructor/private attributes; mũi tên gán tại s23 QP41/43 PDF9. Text không có U+FFFD vẫn có thể thiếu nghĩa. Hình cây s25 QP41 PDF6 và bảng hai chiều phải xem vị trí/cạnh/nút trên PDF.
4. Ví dụ s25 MS41 PDF31 và w23 MS41 PDF16: ảnh nguồn in `_init_` một gạch dưới mỗi phía, còn text mất cả gạch dưới. Đây là **hai vấn đề khác nhau**: lỗi mẫu nguồn và mất ký tự khi extraction. Không tự chuyển text thành `__init__` rồi gắn nhãn nguyên văn.
5. Continuation của một marking row thuộc cùng câu/ý, không cộng điểm lần nữa. Giữ parent/container không có điểm riêng để tra điều kiện chung; `qp_pages` của part đi cùng `context_pages` của question.
6. Toàn bộ1396trang QP/MS có ảnh đối chiếu. Không khẳng định đã quan sát bằng mắt mọi ảnh; ảnh đã xem được liệt kê trong batch reviews và A8 review. Sách/ER/syllabus có PDF gốc và text/geometry đầy đủ, mở PDF khi nội dung có layout.

## Dữ liệu và tái tạo

Giữ nguyên byte ZIP và từng member, kể cả CRLF, tên chữ hoa/thường, thư mục và file rỗng. Không chạy code/macro từ bundle. Sáu file màu rỗng ở s25/41 là output target được cấp. NewHighScore.txt và Tree.txt do thí sinh tạo; chúng không phải dữ liệu đầu vào bị thiếu. Trạng thái và nguồn tải của8ZIP phục hồi nằm trong A2 audit/recovery; đó là mirror công khai, chưa so chữ ký/byte với host Cambridge.

`scripts/extract_corpus.py` tái tạo text/geometry; `scripts/render_facsimiles.py` tái tạo ảnh; script từng batch dựng index; `scripts/assemble_corpus.py` ghép manifest/index; `scripts/validate_corpus.py` kiểm các liên kết và tổng. Sau mọi thay đổi đầu vào phải chạy lại kiểm tra và mở lại gate tương ứng.
