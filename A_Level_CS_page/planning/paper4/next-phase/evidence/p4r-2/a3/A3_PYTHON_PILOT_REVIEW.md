# A3 Python/execution pilot review

## Kết quả

Phạm vi A3 của pilot P4R-2 đã hoàn thành ở mức bằng chứng kỹ thuật và đang chờ Lead/A8 cùng các agent nội dung, visual, marking kiểm tra chéo. Tài liệu này không mở hoặc đóng gate P4R-2.

| Chỉ số | Kết quả |
|---|---:|
| Lesson pilot | 6/6 |
| Source Python qua syntax check | 6/6 |
| Fixture normal/boundary/failure | 18/18 |
| Author run thành công | 18/18 |
| Independent rerun khớp stdout/result/trace hash | 18/18 |
| Trace không rỗng | 18/18 |
| Artifact hợp lệ theo `PythonArtifact` schema v2 draft | 6/6 |
| Artifact qua canonical `validateRegistry` | 6/6, 0 lỗi |
| Stable evidence ID resolve được | 12/12 |
| Stable line ID tái dựng đúng bytes source | 6/6 |

## Nội dung code đã bao phủ

- `data-models`: bản ghi, kiểm tra kiểu trường, mảng giới hạn sức chứa, append và tóm tắt dữ liệu ngẫu nhiên xác định.
- `binary-search`: tiền điều kiện dãy tăng, cập nhật `low/high`, midpoint, trường hợp rỗng và từ chối input chưa sắp xếp.
- `queue`: hàng đợi vòng với `front/rear/count`, wraparound, overflow, underflow, inspect và reduce.
- `recursion`: recursive case, base case, call/unwind trace và kiểm tra tương đương với phép lặp.
- `hashing`: remainder address, collision, linear probing có giới hạn, bảng đầy và khóa sai kiểu.
- `object-files`: đọc CSV thật theo discriminator, dựng base/subclass object, lookup/update, file rỗng và giá trị cập nhật không hợp lệ.

## Closure mapping cho ba knowledge-to-code gaps

| Knowledge ID | Code evidence | Case evidence | Kết quả |
|---|---|---|---|
| `ac-9618-p4-2026-python.lesson.binary-search.knowledge.recursive-variant` | `binary-search.v1.L048`–`L061`: recursive call, base/not-found, midpoint, progress trái/phải | `binary-search.normal` trả cùng index `4` cho iterative/recursive; `boundary` đi vào base-not-found; `failure` từ chối input chưa sắp xếp | CLOSED |
| `ac-9618-p4-2026-python.lesson.object-files.knowledge.construct-from-record` và `.subclass-records` | `object-files.v1.L063`–`L072`: `EBook(Book)`; `L075`–`L082`: discriminator `BOOK/EBOOK` và hai construction path | `object-files.normal` dựng một `Book` và một `EBook`, output giữ `type` cùng `file_format` của subclass | CLOSED |
| `ac-9618-p4-2026-python.lesson.object-files.knowledge.lookup-update` | `object-files.v1.L056`–`L060`: validated setter; `L086`–`L093`: lookup/update method path | `normal` cập nhật `320 → 350`; `boundary` trả `NOT_FOUND`; `failure` trả `INVALID_UPDATE` và giữ `320` | CLOSED |

Các fixture ID hiện có được giữ nguyên. Payload CSV/JSON của `object-files` và expected outputs được nâng cấp; tổng số fixture vẫn là 18.

## Stable-line migration vòng 2

- `binary-search`: giữ 45 line IDs, thêm `L048`–`L073`, retire hai dòng implementation cũ `L040`–`L041`. Code hash đổi từ `410a408d...` thành `b4576f5b...`; artifact hash mới `15b03a39...`.
- `object-files`: giữ 40 line IDs, thêm `L054`–`L101`, retire 13 IDs của các dòng đã bị thay thế. Code hash đổi từ `2c215f7f...` thành `6da50f0a...`; artifact hash mới `44bdc28c...`.
- Bốn artifact còn lại giữ nguyên source hash, line IDs và artifact hash.

Danh sách đầy đủ các ID được giữ, thêm và retire nằm trong `LINE_ID_MIGRATION.json` để A2/A5 cập nhật binding mà không suy đoán từ line order.

## Tính toàn vẹn source và evidence

Mỗi `artifact.json` chứa toàn bộ `lines[]` với line ID ổn định theo mẫu `<slug>.v1.LNNN`. Checker ghép lại `lines[].text` bằng LF, gồm stable line rỗng cuối file, và yêu cầu kết quả bằng chính xác bytes của `source.py`; `code_sha256` là hash của cùng bytes đã được process Python thực thi. Vì vậy source dành cho phần hiển thị sau này và source đã chạy không tách thành hai bản.

Mỗi fixture chạy trong một Python subprocess. Author run và independent rerun được khởi động bằng hai process harness khác nhau; 18/18 fixture có cùng fixture hash, stdout hash, parsed-result hash và trace hash. `execution_log_sha256` của từng artifact được tính từ ma trận deterministic gồm ba case.

Stage 5 chỉ được giữ ở `stage5_source_refs` dưới dạng stable provenance ID, do P4R-1 đã chứng minh code Stage 9 cũ không khớp hash Stage 5. Hai trường `author_run_ref` và `independent_rerun_ref` cũng là stable IDs; `EVIDENCE_RESOLVER.json` nối 12 IDs đó tới file evidence, lesson selector, code hash và execution-log hash.

## Evidence và cách kiểm tra lại

- `AUTHOR_RUN.json`: bằng chứng chạy của tác giả.
- `INDEPENDENT_RERUN.json`: bằng chứng chạy lại trong process mới.
- `PILOT_MANIFEST.json`: hash và tổng số của toàn bộ sáu artifact.
- `EVIDENCE_RESOLVER.json`: resolver cho 12 author/independent evidence IDs.
- `LINE_ID_MIGRATION.json`: thay đổi code/artifact hash và line IDs sau closure vòng 2.
- `scripts/run-p4r2-python-pilot.py`: chạy `--mode author`, sau đó `--mode independent`.
- `scripts/check-p4r2-python-pilot.mjs`: import trực tiếp canonical `validateRegistry` và kiểm tra sáu `PythonArtifact` envelopes.
- `scripts/check-p4r2-python-pilot.py`: kiểm tra read-only hai evidence, source hash, stable lines, exact-match joins và bắt buộc Node canonical checker phải PASS.

Lệnh kiểm tra read-only:

```text
python scripts/check-p4r2-python-pilot.py
```

Expected summary:

```json
{"canonical_schema":"PASS_6_OF_6","decision":"PASS","exact_rerun_matches":18,"fixtures":18,"lessons":6}
```

## Gap còn lại ngoài quyền A3

1. Sáu artifact pilot chưa được nối vào runtime/public learning page; A3 không sửa runtime theo work order.
2. Event trace mới là execution trace. A5 cần tạo `VisualScenarioTrace` và `VisualEventBinding`, dùng line ID của đúng artifact/version và vocabulary Stage 7.
3. A1/A2 cần gắn KnowledgeUnit, coursebook/syllabus locator và phần giải thích song ngữ vào lesson release record.
4. A7 cần gắn marking chain và assessment item; không được suy điểm Cambridge từ output pilot này.
5. Independent rerun ở đây độc lập về process và so exact hash. A8 vẫn phải thực hiện review độc lập và quyết định chấp nhận/reject pilot.

Kết luận trong phạm vi A3: `COMPLETE_PENDING_CROSS_AGENT_REVIEW`.
