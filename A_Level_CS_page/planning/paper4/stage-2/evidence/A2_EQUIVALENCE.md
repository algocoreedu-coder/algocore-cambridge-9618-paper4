# A2 — Variant equivalence and denominators, Stage 2

**Status: SUBMITTED to Lead / independent QA.** Inputs: Stage1PASS `paper4-2026-s1-v1`. Scope:29paperfiles2021–2025. Original sources untouched.

Đọc trực tiếp58PDF QP/MS và đối chiếu SHA-256 với release Stage1. Kết quả: **21nhóm cùng phần thân văn bản sau chuẩn hóa**, giữ đủ29paperID. Trong355cặp trang của các nhóm trùng,353cặp render giống từng pixel sau che mã component;2cặp trang có khác biệt hiển thị đã ghi cụ thể.

## Mẫu số có căn cứ

| View | Paper/groups | Q1/Q2/Q3 | Scored parts | Marks |
|---|---:|---:|---:|---:|
|Raw source IDs|29|87|672|2175|
|Strict normalized task-body text|21|63|487|1575|
|Conservative: also equal body facsimiles|23|69|536|1725|

21nhóm là kết quả so sánh mới, không phải21đề độc lập thống kê. Hai variantw21/41–42 vẫn tách riêng; không dùng số20từ học liệu cũ làm mẫu số. Không dùng tổng raw672ý/2175điểm với mẫu số nhóm.

## Quy tắc so sánh

1. Đọc văn bản natural-order của PyMuPDF từ PDF gốc. Giữ thứ tự và số trang; mỗi trang có hash raw và hash chuẩn hóa.
2. Chỉ thay mã component9618/41,42,43 bằng9618/4X và gom whitespace. Không xóa punctuation, tên biến, giá trị hoặc câu.
3. So sánh QP và MS từ PDF2đến trang cuối. Cover không thuộc phép bằng nhau vì mã sản xuất/barcode khác. Đây là task-body equality, không phải toàn tài liệu hay rawbyte equality.
4. Với mọi nhóm nhiều thành viên: render tất cả trang thân ở72DPI, chỉ che bbox header/footer mã component thực sự tìm được; so sánh byteRGB. Nhờ vậy có kiểm bổ sung cho bố trí bảng, hình và indentation bị whitespace normalization che khuất.
5. So sánh tên/role/hash của TXT được cấp. Mọi nhóm strict có dữ liệu giống byte. evidence.doc và instructionsPDF không thuộc chữ ký input.

## Phân hoạch21nhóm văn bản

| Group | Members | Raster corroboration |
|---|---|---|
|EQ_9618_s21_41|9618_s21_41, 9618_s21_42, 9618_s21_43|all_pages_pixel_equal_after_identifier_mask|
|EQ_9618_s22_41|9618_s22_41, 9618_s22_43|render_differences_require_review|
|EQ_9618_s22_42|9618_s22_42|singleton_not_applicable|
|EQ_9618_w21_41|9618_w21_41|singleton_not_applicable|
|EQ_9618_w21_42|9618_w21_42|singleton_not_applicable|
|EQ_9618_w22_41|9618_w22_41, 9618_w22_43|all_pages_pixel_equal_after_identifier_mask|
|EQ_9618_w22_42|9618_w22_42|singleton_not_applicable|
|EQ_9618_s23_41|9618_s23_41, 9618_s23_43|render_differences_require_review|
|EQ_9618_s23_42|9618_s23_42|singleton_not_applicable|
|EQ_9618_w23_41|9618_w23_41, 9618_w23_43|all_pages_pixel_equal_after_identifier_mask|
|EQ_9618_w23_42|9618_w23_42|singleton_not_applicable|
|EQ_9618_s24_41|9618_s24_41, 9618_s24_43|all_pages_pixel_equal_after_identifier_mask|
|EQ_9618_s24_42|9618_s24_42|singleton_not_applicable|
|EQ_9618_w24_41|9618_w24_41, 9618_w24_43|all_pages_pixel_equal_after_identifier_mask|
|EQ_9618_w24_42|9618_w24_42|singleton_not_applicable|
|EQ_9618_s25_41|9618_s25_41|singleton_not_applicable|
|EQ_9618_s25_42|9618_s25_42|singleton_not_applicable|
|EQ_9618_s25_43|9618_s25_43|singleton_not_applicable|
|EQ_9618_w25_41|9618_w25_41|singleton_not_applicable|
|EQ_9618_w25_42|9618_w25_42|singleton_not_applicable|
|EQ_9618_w25_43|9618_w25_43|singleton_not_applicable|

## Khác biệt phải giữ

- **s22/41–43, MS PDF2:** text tương đương, nhưng một số chữ trong generic marking principles trên43hiển thị thiếu/chồng. Xem [41](A2_region_9618_s22_41_2.png), [43](A2_region_9618_s22_43_2.png). Không là khác dạng bài; không được gọi facsimileidentical.
- **s23/41–43, MS PDF22,2(c):** một dòng marking alternative có text bên dưới giống nhau nhưng43hiển thị thiếu/chồng chữ. Xem [41](A2_region_9618_s23_41_22.png), [43](A2_region_9618_s23_43_22.png). Khi đọc tiêu chí cần ghi caveat và đối chiếu41; không sửa PDF.
- **w21/41–42, QP PDF9,3(b):** `OUTPUT("Tree is full")` và `OUTPUT "Tree is full"`. Toàn bộMS thân và dữ liệu giống nhau; review hai ảnh xác nhận cùng thao tác output dự kiến. Giữ riêng trong strict21; chỉ ghi nhận gần tương đương về ý nghĩa thao tác, không đổi mẫu số thống kê đã chấp nhận. Không khẳng định code đã chạy đúng.

## Quy tắc thống kê cho Lead

- Đếm riêng paperID/29, cặp paper–question/87, partID/672 và marks/2175. Context-only không được cộng thành assessed appearance.
- Mỗi ý có một primary; tổng primary marks phải2175. Nhiều assessed tag thì tính unionpartID trong mỗi pattern; các hàng pattern có thể trùng điểm nên không cộng ngang.
- Group incidence đếm group có pattern một lần. Trước dùng representative phải kiểm label/mark và assessedtag giữa thành viên; khác nhau là findingQA. Không chọn tùy ý một variant để che bất nhất phân loại.
- Với pattern có một nhóm nguồn, ghi limited corpus evidence cùng tử/mẫu số. Không suy xác suất thi hoặc hiệu quả học tập.

## Evidence / tái lập

[A2_EQUIVALENCE.json](A2_EQUIVALENCE.json) chứa58sourcehash, hash theo trang, bbox mask,355page comparisons, đủ hai partition29ID và counting contract. [A2_RENDER_DIFFS.json](A2_RENDER_DIFFS.json) có bbox khác biệt. Script `../scripts/a2_equivalence.py` xây comparison, `a2_review_differences.py` dựng ảnh review, `a2_finalize_equivalence.py` bổ sung quyết định review.

Không có source mutation, taxonomy mutation, lời giải hoặc Stage3. Lead quyết định gate và cách dùng sensitivity view.
