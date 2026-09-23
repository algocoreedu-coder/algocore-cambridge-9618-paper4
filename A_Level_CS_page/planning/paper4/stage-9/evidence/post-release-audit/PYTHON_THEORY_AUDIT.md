# Post-release audit — Python và kiến thức lý thuyết Paper 4

**Kết luận: `FAIL_RELEASE_REOPEN_REQUIRED`.** Nhận xét bằng mắt thường của người dùng là đúng về trải nghiệm: dữ liệu registry có một ít mã Python ở cả 26 bài, nhưng trang học không trình bày chúng như mã nguồn. Đồng thời, 108 khối kiến thức có nguồn từ Stage 3 đã bị nén thành 26 đoạn tóm tắt rất ngắn.

## Điều đã kiểm chứng

- Stage 0 yêu cầu chuỗi `Requirement → thiết kế → Python → trace → output/test → evidence` và code phải chọn/copy được.
- Stage 3 có **108 knowledge block**, 55 mục sách và 139 cặp trang in/PDF đã đối chiếu.
- Stage 5 có author run, independent rerun và `execution_log_sha256` cho code/trace đã kiểm.
- Registry Stage 9 chứa mã hoặc snippet ở 26/26 bài: 15 bài dùng trường `python` dạng mảng, 6 bài dùng trường `code` dạng mảng có nhãn `runnable_python`, 5 bài nhúng code vào chuỗi prose.
- Không có worked example nào dẫn trực tiếp tới locator `stage-5/`.
- Không có knowledge block nào giữ cấu trúc khái niệm hoặc direct locator tới coursebook/syllabus. Toàn bộ là 26 chuỗi, trung bình khoảng 217 ký tự tiếng Anh.

## Vì sao người học không thấy Python code

`ContentValue` trong `LessonLearningPage.tsx` xử lý mọi array bằng `<ul><li>`. Vì vậy danh sách dòng Python bị hiển thị như danh sách gạch đầu dòng. Với năm bài queue, linked-list, recursion, dictionary và hashing, code nằm trong chuỗi văn bản; dấu backtick cũng chỉ là ký tự thường.

Kiểm tra live trang `data-models` cho thấy nhãn **PYTHON CODE**, sau đó là sáu bullet riêng biệt:

1. `def add(a, cap, record):`
2. `if len(a) >= cap: return False`
3. `a.append(record)`
4. `return True`
5. dữ liệu ví dụ
6. lệnh `print`

Không có một code block giữ indentation. Code panel trong Action View lại hiển thị ID bước như `array-append.step.contract`; nó không thay cho source Python hoàn chỉnh.

## Rà soát theo stage

| Stage | Đánh giá | Kết luận |
|---|---|---|
| 0 | PASS contract | Chuẩn đã yêu cầu đúng Python, trace, output/test và evidence. |
| 3 | PASS source model | Nguồn lý thuyết đủ sâu để biên soạn, nhưng cấu trúc 108 block chưa được xuất bản. |
| 4 | PASS design only | Có phương pháp/marking; chính Stage 4 nói execution thuộc Stage 5. |
| 5 | PASS, evidence bị bỏ rơi | Run logs và rerun tồn tại nhưng không được nối vào trang học. |
| 6 | REWORK | Nội dung xuất bản chưa giữ đủ theory map; serialization code không đồng nhất. |
| 7 | PASS trong phạm vi visual | Event giải thích biến đổi state, không thay thế code Python. |
| 8 | PASS trong phạm vi runtime | Runtime replay event; không chạy và không trình bày source Python đầy đủ. |
| 9 | FAIL, phải mở lại release | Route/count/schema PASS nhưng trải nghiệm Python và lý thuyết chưa đạt contract. |

## Ma trận 26 bài

`Bullet` nghĩa là các dòng code hiện thành danh sách gạch đầu dòng; `Prose` nghĩa là code nằm trong một đoạn văn. `Run ref` đều bằng 0 vì không có locator Stage 5 trong worked example.

| Lesson | Theory | Code trong registry | Lines | Trace/tests | UI | Run ref |
|---|---:|---|---:|---:|---|---:|
| data-models | brief | structured Python | 6 | 3/3 | Bullet | 0 |
| procedural-design | brief | structured Python | 6 | 3/3 | Bullet | 0 |
| validation-rules | brief | structured Python | 5 | 3/3 | Bullet | 0 |
| testing | brief | structured Python | 5 | 3/3 | Bullet | 0 |
| text-processing | brief | structured Python | 9 | 3/3 | Bullet | 0 |
| search-collections | brief | structured Python | 7 | 3/3 | Bullet | 0 |
| sorting | brief | structured Python | 8 | 3/3 | Bullet | 0 |
| binary-search | thin | runnable claim | 8 | 3/3 | Bullet | 0 |
| stack | thin | runnable claim | 9 | 5/3 | Bullet | 0 |
| queue | thin | inline Python | 5 | prose/prose | Prose | 0 |
| linked-list | brief | Python/pseudocode, 1 dòng | 1 | prose/prose | Prose | 0 |
| recursion | thin | inline Python | 3 | prose/prose | Prose | 0 |
| binary-tree | brief | structured Python | 29 | 6/4 | Bullet | 0 |
| dictionary | brief | inline Python | 3 | prose/prose | Prose | 0 |
| hashing | brief | inline Python | 6 | prose/prose | Prose | 0 |
| oop-model | thin | structured Python | 7 | 3/2 | Bullet | 0 |
| oop-state | thin | structured Python | 10 | 3/2 | Bullet | 0 |
| oop-inheritance | thin | structured Python | 12 | 3/2 | Bullet | 0 |
| oop-aggregation | thin | structured Python | 10 | 3/2 | Bullet | 0 |
| text-files | thin | structured Python | 7 | 3/2 | Bullet | 0 |
| object-files | thin | structured Python | 12 | 3/2 | Bullet | 0 |
| random-files | thin | runnable claim | 8 | 3/3 | Bullet | 0 |
| exceptions | thin | runnable claim | 10 | 3/3 | Bullet | 0 |
| performance | thin | runnable claim | 14 | 2/3 | Bullet | 0 |
| graphs | thin | runnable claim | 6 | 4/3 | Bullet | 0 |
| exam-workflow | brief | structured Python | 10 | 3/2 | Bullet | 0 |

Không bài nào đạt mức theory `adequate` theo audit cấu trúc. `Brief` chỉ có nghĩa đoạn tóm tắt dài hơn nhóm `thin`; nó không có nghĩa đã đủ để dạy.

## Findings bắt buộc

1. **PTA-001 — RELEASE BLOCKER:** semantic Python rendering bị mất.
2. **PTA-002 — RELEASE BLOCKER:** 0/26 worked example nối tới bằng chứng thực thi Stage 5.
3. **PTA-003 — MAJOR:** 108 knowledge block bị nén thành 26 đoạn tóm tắt.
4. **PTA-004 — MAJOR:** năm bài nhúng code vào prose; linked-list còn trộn nhãn Python/pseudocode.
5. **PTA-005 — MAJOR:** QA release kiểm route/schema/count nhưng không phát hiện nội dung người học nhìn thấy không phải code.

## Điều kiện nghiệm thu bản sửa

- Tạo schema `PythonExample` thống nhất: source hoàn chỉnh, line IDs, fixture, expected/actual output, Stage 5 run locator và verification hash.
- Render bằng một `<pre><code>` có indentation, line numbers, copy/select, mobile overflow và dark mode đúng.
- Chuyển năm prose example sang schema; code Python và pseudocode phải phân biệt rõ.
- Nối 26/26 ví dụ tới Stage 5; ví dụ mới phải được chạy và freeze độc lập.
- Publish disposition 108/108 knowledge block, kèm coursebook section/page, syllabus objective, giải thích, representation/invariant, misconception và ví dụ phù hợp.
- Thêm gate máy cho 26/26 code block, 26/26 execution join, 108/108 knowledge disposition và source locator.
- QA trình duyệt độc lập cả VI/EN phải xác nhận trực tiếp code và theory mà học sinh nhìn thấy trước khi khóa release thay thế.

Chi tiết máy đọc được nằm trong `PYTHON_THEORY_AUDIT.json` cùng thư mục.
