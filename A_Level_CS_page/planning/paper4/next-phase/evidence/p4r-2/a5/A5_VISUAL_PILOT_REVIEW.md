# P4R-2 A5 visual/event pilot review

## Kết quả

A5 đã tái tạo candidate visual/event theo A3 vòng 2 cho đủ sáu lesson pilot, gồm **16 pattern, 48 scenario và 238 event**. Mỗi pattern có đúng ba scenario `normal`, `boundary`, `failure`. Toàn bộ event lấy trực tiếp từ `p4r-2/a3/INDEPENDENT_RERUN.json`; không thêm event giả để làm đẹp đường chạy.

Checker read-only `scripts/check-p4r2-visual-pilot.mjs` import `validateRegistry` và PASS với sáu `PythonArtifact`, 48 `VisualScenarioTrace` cùng 238 `VisualEventBinding`. Các join artifact version, fixture, expected output và independent execution evidence đều được giải quyết. Cả 238 event đều dùng controlled vocabulary, bind tới line ID thật của đúng artifact version, có state `before/delta/after/output_delta` hữu ích và không bind vào contract token. Checker đọc `LINE_ID_MIGRATION.json` và xác nhận không giữ lại bất kỳ retired line ID nào.

## Phạm vi theo lesson

| Lesson | Pattern | Scenario | Event |
|---|---:|---:|---:|
| `data-models` | 4 | 12 | 36 |
| `binary-search` | 1 | 3 | 15 |
| `queue` | 5 | 15 | 95 |
| `recursion` | 1 | 3 | 11 |
| `hashing` | 4 | 12 | 72 |
| `object-files` | 1 | 3 | 9 |
| **Tổng** | **16** | **48** | **238** |

## Quy tắc trace tích hợp

`data-models`, `queue` và `hashing` dùng một Python artifact tích hợp để thực thi nhiều pattern. Vì vậy, các pattern trong cùng lesson chiếu lên cùng đường chạy đã được rerun, nhưng dùng trace/event ID riêng và khai báo `equivalence_justification`. `coverage_contracts` nêu `focus_event_names` của từng pattern. Nếu failure bị chặn sớm trước thao tác trọng tâm, candidate giữ nguyên rejection trace thực tế thay vì bịa thêm event.

Chuỗi normal, boundary và failure của từng pattern đã được so sánh bằng `event_type + execution_trace_event`; cả 16/16 pattern đều có ba chuỗi khác nhau. A3 vòng 2 làm `binary-search` tăng từ 5 lên 15 event vì thêm recursive equivalence trace, và `object-files` tăng từ 7 lên 9 event vì thêm object type, setter update và not-found branch. Generator được chạy lại và sáu file output giữ nguyên SHA-256, xác nhận byte determinism.

## Trạng thái bàn giao

Candidate sẵn sàng cho kiểm tra độc lập của A8/Lead. Tài liệu này chỉ là evidence của A5 và không tự ký gate P4R-2.
