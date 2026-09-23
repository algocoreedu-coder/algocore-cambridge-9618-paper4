# Paper 4 — Corpus Stage 1

**PASS sau REWORK**, ngày 19/09/2026, phiên bản `paper4-2026-s1-v1`. [Biên bản Lead](GATE_REVIEW.md) là trạng thái nghiệm thu hiện hành. Mục tiêu khóa học giữ nguyên: Cambridge 9618 năm 2026, Python console, bài học hai bản Việt–Anh.

| Thành phần | Bàn giao |
|---|---|
| Bộ đề | 29 QP + 29 MS, giai đoạn 2021–2025; 87 câu; 672 ý chấm điểm; mỗi đề 75 điểm |
| Dữ liệu | 29 SF ZIP: 21 có sẵn + 8 tìm lại; 38 file text đầu vào + 6 file đầu ra rỗng được cấp; 29 evidence.doc |
| Tham chiếu | 5 examiner report với 15 section Paper 4; coursebook 576 trang; syllabus 2026 v2, 49 trang |
| Trích xuất | 65 PDF / 2.255 trang; text theo trang, tọa độ và 1.396 ảnh cho toàn bộ QP/MS |
| Kiểm chứng | Agent sản xuất → QA độc lập → Lead sửa và nghiệm thu; bốn finding bắt buộc đã đóng |

## Mở và tra cứu

1. [SOURCE_MANIFEST.json](SOURCE_MANIFEST.json): nguồn gốc, đường dẫn, hash, loại nguồn và trạng thái kiểm tra.
2. [QUESTION_INDEX.json](QUESTION_INDEX.json): tìm `paper_id`, rồi `part`, ví dụ `9618_s25_41` → `2(b)`. Mỗi ý có trang QP/MS, điểm, tóm tắt, yêu cầu evidence, dependency và liên kết nguồn. Đọc cùng phần context và parent của câu.
3. `extracted/<source_id>.json` hoặc `.txt`: bản trích theo trang PDF. [FACSIMILE_MANIFEST.json](FACSIMILE_MANIFEST.json) trỏ tới ảnh của đúng trang QP/MS.
4. **Code, pseudocode, bảng và hình phải đọc cùng PDF/ảnh**, theo [EXTRACTION_POLICY.md](EXTRACTION_POLICY.md). Text có thể mất dấu gạch dưới, mũi tên hoặc quan hệ giữa các ô bảng.
5. [EXAMINER_REPORT_INDEX.json](EXAMINER_REPORT_INDEX.json) và [REFERENCE_DOCUMENT_INDEX.json](REFERENCE_DOCUMENT_INDEX.json): section ER, thông tin sách, mục lục, điểm bắt đầu chương và syllabus. Đây chưa phải bản đồ kiến thức của Stage 3.

## Hồ sơ kiểm tra

- [CORPUS_QA.md](CORPUS_QA.md): phạm vi kiểm, findings, sửa lại và giới hạn.
- [MISSING_SOURCES.md](MISSING_SOURCES.md): 8 ZIP đã phục hồi, ER chưa có, file thí sinh phải tạo và phạm vi ngoài baseline.
- [SOURCE_ISSUES.json](SOURCE_ISSUES.json): bất nhất trong nguồn cần giữ khi viết lời giải.
- [A8 review chỉ mục](evidence/A8_CORPUS_INDEX_REVIEW.md), [A8 review dữ liệu/trích xuất](evidence/A8_DATA_EXTRACTION_REVIEW.md), [review tài liệu tham chiếu](evidence/A3_REFERENCE_REVIEW.md).
- Batch [2021–2022](batches/2021-2022/REVIEW.md), [2023–2024](batches/2023-2024/REVIEW.md), [2025](batches/2025/REVIEW.md).
- [RELEASE_MANIFEST.json](RELEASE_MANIFEST.json): checksum các artifact đã nghiệm thu; [WORK_ORDERS.md](WORK_ORDERS.md): phân công stage.

Tái kiểm bằng `scripts/validate_corpus.py`; kiểm phiên bản đã khóa bằng `scripts/verify_release.py`. Script và draft/digest trong các batch là công cụ sản xuất. Audit giữ trạng thái submission để bảo toàn lịch sử; đọc gate để biết kết quả cuối.

**Bàn giao cho Stage 2:** dùng 672 ý để xây danh mục dạng bài và question map, giữ dependency và bằng chứng tương đương giữa các variant. Không dùng số file thay số bộ câu hỏi độc lập. Giữ đầy đủ các câu hash table đã có trong đề để phân tích. Code trong MS còn cần kiểm chứng trước khi dùng làm lời giải dạy học.

Stage 2 chưa bắt đầu. Chưa tạo bài học Việt–Anh, lời giải đã chạy, visual động hoặc thay đổi ứng dụng trong Stage 1.
