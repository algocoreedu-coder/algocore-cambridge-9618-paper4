# Stage 2 — Lead xây hệ thống dạng bài

Đầu vào: Stage 1 PASS, version `paper4-2026-s1-v1`; 29 đề, 87 câu, 672 ý, 2.175 điểm. Phạm vi khóa học: 2026, Python, bài học Việt–Anh. Không sửa corpus đã khóa; nếu thấy lỗi nguồn/index phải báo Lead để mở lại record liên quan. Không thực hiện Stage 3 hoặc viết lời giải/visual ở đây.

## Phân công và vùng sở hữu

- A0 Lead: taxonomy, lô 2025, quyết định hợp nhất/tách dạng, bản ghép, thống kê, danh sách dễ nhầm và gate.
- A3 lô 2021–2022: phân loại 228 ý trong 11 đề, chỉ ghi `batches/2021-2022/`.
- A3 lô 2023–2024: phân loại 304 ý trong 12 đề, chỉ ghi `batches/2023-2024/`.
- A2: kiểm bằng chứng tương đương giữa variant và phương pháp đếm, chỉ ghi `evidence/A2_*` và `scripts/a2_*`.
- A8: sau submission, phân loại độc lập mẫu khó, rà toàn bộ map/taxonomy/count/dependencies; findings → Lead sửa → kiểm lại trước PASS.

Tối đa ba agent chuyên môn chạy cùng Lead. Agent nộp SUBMITTED, không tự ký PASS toàn stage.

## Phân biệt bốn lớp

`topic` là miền kiến thức (queue/OOP/file); `skill` là năng lực (cập nhật con trỏ, chuyển pseudocode, chọn điều kiện); `pattern` là dạng nhiệm vụ cụ thể được yêu cầu/chấm; `variant` là khác biệt cài đặt hoặc dữ kiện trong dạng (circular/linear, next-free/current-top, recursive/iterative, sentinel...). `task_mode` mô tả cách đề giao việc.

Đọc `PATTERN_SEED.json` để thống nhất ID ban đầu. Đây là vocabulary đề xuất, chưa được nghiệm thu. Được đề xuất tách/thêm/hợp nhất khi có bằng chứng QP/MS, ghi trong `taxonomy_proposals`; không ép câu vào dạng gần nhất để hết unclassified.

## Schema batch

`classification.json` có `batch`, `rows`, `taxonomy_proposals`, `review_notes`. Mỗi row:

```json
{
  "part_id": "9618_s21_41_1(a)",
  "primary_pattern_id": "DATA_RECORD",
  "assessed_pattern_ids": ["DATA_RECORD"],
  "context_pattern_ids": [],
  "topic_tags": ["linked_list"],
  "skill_tags": ["record_declaration"],
  "task_mode": "declare_initialize",
  "variants": {"representation": "record", "fields": "data,nextNode"},
  "classification_rationale": "QP asks for the record declaration; MS awards the record and integer fields.",
  "qp_basis": {"source_id": "9618_s21_qp_41", "pdf_pages": [2]},
  "ms_basis": {"source_id": "9618_s21_ms_41", "pdf_pages": [3]},
  "ms_distinguishing_requirement": "Paraphrase of relevant marking requirement, not invented advice or point split.",
  "review_status": "submitted",
  "notes": []
}
```

Ví dụ locator ở trên chỉ minh họa schema; khi phân loại phải lấy trang thật trong index/PDF. Mỗi row phải có đúng `part_id` Stage 1. Mọi nhãn assessed cần được QP/MS của chính row hỗ trợ. Câu hỗn hợp có nhiều assessed pattern, nhưng mỗi ý chỉ có một primary để thống kê điểm không trùng.

Một câu chỉ gọi hàm Push có sẵn không được ghi là trực tiếp viết Push. Dùng `MAIN_FLOW`/`OUTPUT_FORMAT` theo nhiệm vụ thực tế; giữ `STACK_PUSH` ở context nếu liên quan. Câu chụp kết quả dùng `EVIDENCE_RUN`, các thuật toán đã viết thuộc context. Nếu chính row vừa gọi/test vừa viết code hay xử lý mới thì giữ nhiều assessed tag đúng bằng chứng. `primary` là phân bổ biên tập cho thống kê, không phải Cambridge phân chia điểm giữa các kỹ năng.

Phân biệt declaration bản ghi với constructor OOP thực sự; tên hàm không quyết định dạng (LinearSearch trả count là COUNT_OCCURRENCES). Phân biệt xuất array vật lý với traversal theo links/tree order. Pointer, capacity, sentinel và kiểu dữ liệu phải lấy từ nguồn, không suy theo bài quen thuộc. Code nguồn chưa được chứng nhận chạy đúng.

## Đọc và bằng chứng

Đọc từng ý QP/MS, cùng parent/context và source caveats. Có thể dùng đối chiếu page-equivalence để rà variant trùng, nhưng vẫn giữ mọi ID. Với bảng/code/pseudocode, mở PDF hoặc facsimile theo Stage 1 EXTRACTION_POLICY. Ghi các nguồn/trang đã đọc, mẫu ảnh và quyết định khó vào `REVIEW.md`; lưu script kiểm coverage/ID/enum/variant. Không chỉ chạy regex trên summary rồi đánh reviewed.

## Bàn giao và gate

EXAM_PATTERN_CATALOG.json/.md; QUESTION_PATTERN_MAP.json; CONFUSABLE_PATTERNS.md; PATTERN_STATISTICS.json/.md; UNCLASSIFIED_REPORT.json/.md; phương pháp đếm, quyết định Lead, QA, GATE_REVIEW và release checksum.

Đếm riêng số paper có dạng, số câu gốc Q1/Q2/Q3, số ý có điểm và số điểm. Tổng primary phải đúng 672 ý / 2.175 điểm. Với nhiều tag, báo điểm của hợp các ý liên quan và cảnh báo không cộng các hàng pattern. Báo denominator 29 paper, 87 câu, 672 ý; evidence tương đương hỗ trợ sensitivity view, không tự coi các bài là độc lập thống kê. Dạng ít bằng chứng phải ghi rõ.

Lead duyệt từng mapping trên nguồn, không chỉ gom kết quả. QA độc lập kiểm trường hợp mơ hồ và toàn bộ tính nhất quán. Không còn ý chưa phân loại, finding bắt buộc mở hoặc nhãn không có bằng chứng trước PASS.
