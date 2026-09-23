# Corpus QA — Stage 1

**Kết quả: PASS sau REWORK.** Phiên bản `paper4-2026-s1-v1`, ngày 19/09/2026. Quyết định chính thức tại [GATE_REVIEW.md](GATE_REVIEW.md).

## Phạm vi đã kiểm

| Đối tượng | Kết quả | Bằng chứng |
|---|---|---|
| 29 QP + 29 MS | Đúng mã/kỳ/năm; đủ 87 câu và 672 ý; từng ý khớp QP/MS, mỗi đề 75 điểm | [A8 index review](evidence/A8_CORPUS_INDEX_REVIEW.md), [Lead validation](evidence/LEAD_CORPUS_VALIDATION.json) |
| Điểm, locator, dependency | Không lặp điểm; giữ continuation và parent; liên kết hợp lệ, không có chu trình | [A8 JSON](evidence/A8_CORPUS_INDEX_REVIEW.json), batch reviews |
| 29 SF ZIP | 21 local + 8 mirror; CRC, path, hash và byte giải nén đều đạt | [A2 audit](evidence/A2_DATA_AUDIT.json), [A8 data](evidence/A8_DATA_EXTRACTION_REVIEW.md) |
| 44 file text được cấp | 38 input + 6 blank output target; kiểm cấu trúc, kiểu, số lượng và ví dụ QP; đủ 29 evidence.doc | [A8 data formats](evidence/A8_data_render/data_formats.json) |
| 65 PDF / 2.255 trang | Hash, số trang, text, geometry và rotation khớp khi đọc lại; bìa sách là ảnh, không phải trang thiếu | [A8 extraction](evidence/A8_DATA_EXTRACTION_REVIEW.json) |
| 1.396 ảnh QP/MS | Đủ mọi trang của 58 PDF, có hash; reviewer trực tiếp xem các mẫu code/bảng/hình | [Facsimile manifest](FACSIMILE_MANIFEST.json), [policy](EXTRACTION_POLICY.md) |
| 5 ER / 15 section | 14 section có nội dung, 1 thông báo không có báo cáo có ý nghĩa; 84 anchor, đúng variant | [Reference review](evidence/A3_REFERENCE_REVIEW.md) |
| Sách và syllabus | Đúng metadata, mục lục, 20 điểm bắt đầu chương; giữ baseline syllabus 2026 v2 | [Reference index](REFERENCE_DOCUMENT_INDEX.json), [A3 JSON](evidence/A3_REFERENCE_REVIEW.json) |
| 94 nguồn trong manifest | Đúng ID, path, hash và liên kết câu hỏi/dữ liệu/report; giữ mọi giá trị batch khi ghép | [Lead validation](evidence/LEAD_CORPUS_VALIDATION.json), A8 aggregate checks |

## Findings đã sửa và kiểm lại

| ID | Vấn đề | Sửa và bằng chứng đóng |
|---|---|---|
| S1-DATA-01 | Regex không nhận CRLF trong danh sách 7-Zip, JSON bỏ 21 SF trong RAR | Lead sửa parser và metadata; A8 tự parse listing, so đúng 21 path. RAR không cung cấp bundle phục hồi. |
| S1-EXTRACT-01 | Text MS xoay trang bị đảo thứ tự; mất underscore, assignment arrow và quan hệ layout | Extraction v1.1 giữ natural order và display geometry; toàn bộ QP/MS có ảnh và chính sách bắt buộc đối chiếu PDF. A8 kiểm lại nguồn, ảnh và policy. Không khẳng định đã khôi phục glyph trong text. |
| S1-IDX-01 | Một số summary 2025 sai cấu trúc sáu mảng 1D, StoreData, Tree constructor; lẫn yêu cầu chỉ có trong MS | Lead sửa theo QP; A8 đọc lại nguồn và so aggregate, đã đóng. |
| S1-IDX-02 | Evidence excerpt từ digest làm mất số đứng riêng trong bảng test | Thay bằng chỉ dẫn biên tập có dữ kiện đúng và locator đầy đủ; w25/43 Q1(d)(ii) giữ row 10→4, column −1→5. A8 xem PDF8 và kiểm lại. |

Sửa trong batch: raw label `3(b(iii)` ở w23 MS42 PDF29 được chuẩn hóa thành `3(b)(iii)` trong index và có ghi chú nguồn; continuation không lặp nhãn và phần QP qua trang đã bổ sung. Mỗi scoring row được kiểm độc lập, không chỉ dựa tổng 75.

## Giới hạn của kết quả

Kiểm identity, điểm, nhãn, continuation, liên kết và hash phủ toàn corpus. Review nội dung và hình có chọn mẫu; không tuyên bố đã xem bằng mắt toàn bộ 1.396 ảnh. Extraction khớp text layer vẫn có thể mất đồ họa, nên chính sách đối chiếu PDF là điều kiện sử dụng.

Lỗi và bất nhất trong tài liệu gốc được giữ với locator tại [SOURCE_ISSUES.json](SOURCE_ISSUES.json) và batch reviews. Stage 4–5 phải xây và kiểm chứng lời giải độc lập; PASS này không chứng nhận code MS chạy đúng. Các ZIP từ mirror chưa được so chữ ký/byte với host Cambridge. Nguồn ngoài baseline và ER chưa có được kê trong [MISSING_SOURCES.md](MISSING_SOURCES.md).

Không còn finding bắt buộc mở trong Stage 1. Taxonomy, mapping kiến thức, bài học Việt–Anh, visual động, tích hợp ứng dụng và thi thử có gate riêng theo playbook.
