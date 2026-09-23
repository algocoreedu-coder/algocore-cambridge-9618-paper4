# Stage 2 — Hệ thống dạng bài Paper 4

**Đích học liệu:** kỳ thi 2026 · Python console · hai bản bài học Việt–Anh. Trạng thái nghiệm thu cuối: [GATE_REVIEW.md](GATE_REVIEW.md).

Lead điều phối A3 phân loại đề, A2 xác minh nhóm đề tương đương và A8 kiểm độc lập; tự xây taxonomy, phân loại lô 2025 và quyết định mọi điều chỉnh trước khi chốt. Kết quả dựa trên corpus Stage 1 đã khóa, theo Stage 2 của playbook.

## Kết quả để sử dụng

- **58 dạng bài**, có tên Việt–Anh, dấu hiệu nhận diện, ranh giới và biến thể cần giữ. Đọc [catalog](EXAM_PATTERN_CATALOG.md); dùng [catalog JSON](EXAM_PATTERN_CATALOG.json) khi nối dữ liệu ở stage tiếp theo.
- **29 paper, 87 câu, 672 ý có điểm** đã được phân loại. [QUESTION_PATTERN_MAP.json](QUESTION_PATTERN_MAP.json) giữ nguồn QP/MS, trang PDF, tiêu chí phân biệt, quan hệ phụ thuộc, dữ liệu đầu vào và yêu cầu minh chứng. Có 99 ý chứa nhiều assessed tags.
- **20 cặp dễ nhầm**, gồm 16 cặp phân biệt dạng/nhiệm vụ và 4 cặp cùng dạng nhưng khác quy ước cài đặt: [bản đọc](CONFUSABLE_PATTERNS.md), [JSON](CONFUSABLE_PATTERNS.json).
- **Thống kê có mẫu số**, giữ tổng 2.175 điểm gốc: [cách đọc thống kê](PATTERN_STATISTICS.md), [toàn bộ số liệu](PATTERN_STATISTICS.json).
- **Không còn ý chưa phân loại:** [UNCLASSIFIED_REPORT.json](UNCLASSIFIED_REPORT.json). Những caveat của nguồn vẫn được giữ riêng, không bị biến thành “đã giải quyết” chỉ vì đã phân loại.

## Cách đọc một ý thi

Tìm `part_id`, ví dụ `9618_s25_41_2(b)`, trong QUESTION_PATTERN_MAP. `primary_pattern_id` là dạng chính; `assessed_pattern_ids` là các thao tác mới được đánh giá; `context_pattern_ids` là thao tác đã có được gọi hoặc đang được kiểm thử.

`qp_basis` và `ms_basis` cho source ID cùng **trang PDF đếm từ 1**. Từ source ID, tra đường dẫn PDF gốc trong [SOURCE_MANIFEST của Stage 1](../stage-1/SOURCE_MANIFEST.json), hoặc mở ảnh từng trang tại `../stage-1/facsimiles/<source_id>/pNNN.png`. `source_part` giữ nguyên câu/ý gốc đã kiểm, còn `questions` và `papers` giữ shared context, source files, ER và vấn đề nguồn. Khi đọc code/bảng/hình phải theo [EXTRACTION_POLICY](../stage-1/EXTRACTION_POLICY.md).

`variants` giữ các điều kiện cần cho bước thiết kế lời giải: next-free hay current-top, queue vòng hay thẳng, đệ quy được cho hay phải tự đổi, v.v. `dependency_part_ids` nối tới các ý trước; trường mở rộng parent giải thích hai tham chiếu tới nhóm `1(b)` của w24/42. Không bỏ shared context khi lấy một ý riêng.

`skill_tags` chỉ là chỉ mục kỹ năng cốt lõi, chưa phải danh sách đầy đủ marking points. Chi tiết nằm trong căn cứ MS, các tag của analyst và biến thể. Stage 4 mới lập MARKING_MAP.

## Đọc số liệu đúng

| Báo cáo | Đề / nhóm đại diện | Câu | Ý | Điểm |
|---|---:|---:|---:|---:|
| Corpus gốc — báo cáo chính | 29 | 87 | 672 | 2.175 |
| Đối chiếu theo nhóm giống văn bản | 21 | 63 | 487 | 1.575 |
| Đối chiếu theo nhóm được render xác nhận | 23 | 69 | 536 | 1.725 |

Primary gán toàn bộ điểm của mỗi ý vào đúng một dạng theo quyết định biên tập; không phải chia marking points Cambridge. Assessed có thể nhiều tag nên số điểm giữa các dạng chồng lấp. Muốn cộng nhóm dạng, lấy hợp `part_id` rồi cộng mỗi ý một lần. Script [query_patterns.py](scripts/query_patterns.py) làm đúng phép hợp này.

20 dạng được gắn cờ **ít bằng chứng** vì xuất hiện trực tiếp trong tối đa hai nhóm văn bản. Đây là tín hiệu cần đối chiếu syllabus, không phải kết luận dạng ít quan trọng hoặc ít khả năng ra thi. Corpus 2021–2025 không thay thế kiểm tra độ phủ syllabus 2026.

## Bằng chứng nghiệm thu

- [Quyết định trực tiếp của Lead](LEAD_DECISIONS.md): nguyên tắc gộp/tách, trường hợp mơ hồ, primary/co-tag/context và giới hạn.
- [QA độc lập A8](evidence/A8_REVIEW.md): kết quả, yêu cầu sửa và kiểm lại.
- [A2 về nhóm đề tương đương](evidence/A2_EQUIVALENCE.md): so văn bản, data và render, gồm hai khác biệt hiển thị MS.
- Báo cáo analyst: [2021–2022](batches/2021-2022/REVIEW.md), [2023–2024](batches/2023-2024/REVIEW.md), [Lead 2025](batches/2025/REVIEW.md).
- [Kiểm cơ học của Lead](evidence/LEAD_MECHANICAL_CHECKS.json), [kiểm aggregate độc lập](evidence/A8_AGGREGATE_CHECKS.json), [manifest phát hành](RELEASE_MANIFEST.json).

Để tái tạo: chạy ba builder ở `batches/`, rồi `scripts/build_release.py`. Chạy các validator của batch và các script A8 để kiểm lại; `scripts/verify_release.py` kiểm checksum gói đã phát hành và đầu vào đã khóa. Regenerate tạo thay đổi cần review/re-freeze, không tự duyệt một release mới.

## Bàn giao sang Stage 3

Đầu vào tiếp theo là catalog 58 dạng, map 672 ý, 20 cặp đối chiếu và flags ít bằng chứng. Stage 3 sẽ nối dạng → kỹ năng → mục/trang coursebook → objective syllabus, kiểm cả kiến thức chưa được corpus đại diện.

Stage 3 **chưa bắt đầu** trong lần thực hiện này. Các lỗi/khác biệt code xuất bản, 8 SF từ mirror và khoảng trống ER giữ nguyên trong Stage 1. Chưa có lời giải được chứng minh, rubric đầy đủ, bản dịch bài học hoàn chỉnh hoặc visual chạy trong app; các phần đó thuộc các stage sau của playbook.
