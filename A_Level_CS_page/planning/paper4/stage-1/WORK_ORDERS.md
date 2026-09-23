# Stage 1 — Work orders của Lead

Inputs: Stage0 PASS; 2026/Python/VI+EN; toàn bộ29 QP và29 MS baseline2021–2025,21SF,5ER,coursebook và syllabus. Không sửa source gốc/app. Không thực hiện phân loại dạng bài Stage2 hoặc lời giải Stage4–5.

## Phân công

- A0 Lead: chuẩn extraction/schema, manifest chung, đọc lô2025, kiểm ER/coursebook/syllabus, đối chiếu và gate.
- A2 Data: toàn bộ source requirements/ZIP integrity và tìm dữ liệu thiếu; chỉ vùng data/ và evidence/A2_DATA_*.
- A3 Index21–22:11 papers, own batches/2021-2022/; đọc QP/MS và lập chỉ mục.
- A3 Index23–24:12 papers, own batches/2023-2024/; đọc QP/MS và lập chỉ mục.
- A8 QA: kiểm độc lập sau khi ghép, findings → sửa → kiểm lại trước PASS.

## Schema chỉ mục bàn giao

Mỗi batch tạo index.json object có `schema_version`, `batch`, `papers`, `review_notes`. Mỗi paper có:

```json
{
  "paper_id": "9618_s21_41",
  "qp_source_id": "9618_s21_qp_41",
  "ms_source_id": "9618_s21_ms_41",
  "qp_page_count": 0,
  "ms_page_count": 0,
  "declared_total_marks": 75,
  "indexed_total_marks": 0,
  "questions": [
    {
      "question_number": 1,
      "context_pages": [],
      "parts": [
        {
          "part": "1(a)(i)",
          "parent_part": "1(a)",
          "qp_pages": [],
          "ms_pages": [],
          "marks": 0,
          "qp_marks": 0,
          "ms_marks": 0,
          "prompt_summary": "Short faithful summary, not a solution or taxonomy",
          "required_source_files": [],
          "dependency_refs": [],
          "evidence_requirement": "Requirement stated in QP, or explicit none",
          "verification_status": "qp_ms_cross_checked",
          "notes": []
        }
      ],
      "unscored_structure": []
    }
  ],
  "issues": [],
  "review": {"method": "", "rendered_pages_checked": [], "status": "submitted"}
}
```

`part` dùng label chuẩn MS không spaces, ví dụ1(a)(i). Nếu một scoring group bao nhiều subparts, giữ group và `covered_qp_parts`, không tự chia điểm. `unscored_structure` ghi parent/container hoặc yêu cầu không có điểm riêng khi cần; không tạo marking row giả. Số trang đều PDF1-based, khác trang in phải lưu notes/printed page riêng.

Mọi part scored có locator QP+MS, điểm đối chiếu; tổng bằng75 với no duplicate counting. Parent/context không cộng điểm. Quy trình Q1 có các ý phụ thuộc nhau: ghi refs chính xác hoặc note shared context; không tự coi mọi part là bài độc lập. Không bỏ dữ liệu/table/code khởi đầu hoặc phần continuation. Prompt summary giúp điều hướng; bản trích có trang/PDF gốc là nguồn toàn văn, summary không thay đề.

Không đánh verified chỉ vì regex tìm thấy label hoặc tổng điểm đúng. Đọc cả QP/MS, kiểm các continuation/code/table/layout có nguy cơ mất nghĩa và lưu sample render evidence. Code indentation được giữ trong lines/bbox và PDF; không chạy lại code ở stage này.

## Đầu ra và gate

SOURCE_MANIFEST.json, QUESTION_INDEX.json, page-bounded extraction, source/data audit, examiner-report sections, MISSING_SOURCES.md và CORPUS_QA/GATE_REVIEW. Lead kiểm corpus enumeration, hash/readability, label coverage/marks/locator/dependencies, data readiness và errors. QA độc lập kiểm lại; lỗi bắt buộc phải sửa trước PASS. Thiếu dữ liệu cần thiết chưa giải quyết không được PASS.
