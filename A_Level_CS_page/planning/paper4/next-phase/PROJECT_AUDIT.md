# Audit tổng quát dự án Paper 4

**Lead decision: cần recovery programme trước khi release lại.** Ứng dụng build được và runtime Stage 8 ổn định về mặt kỹ thuật, nhưng nội dung học thuật, execution provenance và tính trung thực của visual chưa đạt contract Stage 0.

## Baseline đã kiểm chứng

| Hạng mục | Kết quả |
|---|---|
| Scope | Cambridge 9618 Paper 4, 2026, Python console, VI/EN |
| Corpus | Stage 1–3 có dữ liệu đề, pattern, 26 lesson và 108 knowledge block |
| App | Next.js 16.3.5, Fumadocs 16.15.11, 13 package, 26 route, 260 block |
| Visual runtime | 58 pattern, 174 scenario, 331 unique event |
| Build | `npm run verify:stage8` PASS; TypeScript và production build PASS |
| Python UI sau sửa khẩn cấp | 26/26 lesson, 52/52 route VI/EN có semantic `<pre><code>` |
| Stage 9 release | `REWORK_REQUIRED`; manifest v1 chỉ là hồ sơ lịch sử |

## Findings theo mức ưu tiên

### P0 — Nội dung lý thuyết bị nén mất cấu trúc

Stage 3 định nghĩa 108 knowledge block với objective và book-section IDs. Stage 9 chỉ xuất bản 26 chuỗi knowledge ngắn, trung bình khoảng 195 ký tự VI và 215 ký tự EN. Chỉ 1/26 bài qua ngưỡng tối thiểu hiện tại; 0/26 knowledge block có direct coursebook locator và 0/26 có direct syllabus locator theo gate mới.

### P0 — Python trên trang không nối với bằng chứng chạy

Python hiện hiển thị đúng về mặt semantic sau sửa khẩn cấp, nhưng 0/26 worked example trỏ trực tiếp tới Stage 5 author run/independent rerun/hash. Năm ví dụ vừa chuẩn hóa sau Stage 5 càng cần chạy lại và freeze evidence mới. Một snippet parse được không chứng minh output, trace hoặc rubric đúng.

### P0 — Scenario visual chưa phải ba trace thực tế

Trong registry Stage 8:

- 58/58 pattern tái sử dụng cùng event set cho normal, boundary và failure.
- 0/58 pattern có ba trace ID khác nhau theo scenario.
- 135/331 event chỉ hiển thị code reference dạng `*.step.contract`.
- 62/331 event có state trước và sau rỗng.

Runtime reducer vẫn PASS vì nó chuyển bước đúng theo registry; vấn đề nằm ở chất lượng registry/spec và cách runtime chọn event. Chọn scenario hiện chỉ đổi metadata rồi reset, không đổi chuỗi event thực thi.

### P1 — Content schema quá tự do

`LearningContent` cho phép primitive/list/map tùy ý; semantics của code được suy ra từ tên key. Đây là nguyên nhân 21 bài từng thành bullet và năm bài thành prose. Chưa có first-class `KnowledgeUnit`, `PythonArtifact`, `ExecutionEvidence` hoặc `VisualCodeBinding`.

### P1 — Builder Stage 9 tích lũy patch lịch sử

Builder đọc placeholder, support, R2, R3 và post-release remediation theo thứ tự override. Dù deterministic, provenance và quyền sở hữu nội dung khó audit. Bản v2 cần một canonical authored registry; migration scripts chỉ là input tạm thời, không là kiến trúc release lâu dài.

### P1 — Gate cũ kiểm cấu trúc nhiều hơn trải nghiệm

Exact counts, route, build và locale checks đều có giá trị, nhưng từng cho phép code hiển thị như bullet, theory rút gọn và scenario giống nhau. Gate v2 phải kiểm learner-visible semantics, source/evidence joins và distinct scenario behavior.

### P1 — Marking và assessment traceability chưa đủ

Stage 4 có 2.236 marking atoms cho 58/58 pattern, nhưng website chỉ có direct QP+MS pair ở 12/26 lesson, phủ 32/58 pattern. Có 78 practice item theo ba mức guided/faded/independent; 15 item thiếu stable ID và 0 item giữ assessment requirement ID. Bản v2 phải có audit disposition cho 2.236 atoms, 107 assessment requirements và 37 destinations; UI chỉ hiển thị representative chain phù hợp.

### P1 — Event vocabulary và state evidence không đạt

328/331 event dùng `source_event_label` ngoài vocabulary Stage 7; ba event còn lại có `event_type` không khớp mapping. 268/331 event có `output_delta: null`. Đây là lỗi schema/enforcement, không chỉ là thiếu polish UI.

### P1 — Payload runtime quá lớn

`stage8-runtime-registry.json` hiện khoảng 4,93 MB; dev HTML của hub khoảng 2,04 MB. Khi thêm theory và trace thật, payload sẽ tăng nếu tiếp tục import toàn registry. Bản v2 phải tách hub metadata khỏi per-pattern trace và lazy-load trace được chọn.

### P1 — Không có version-control baseline cho workspace

Git root nằm ở `algocore-teaching`, nhưng hiện có **0 tracked files** dưới `Cambridge/A_Level_9618/Computer_Science`; toàn bộ app và planning hiện là untracked trong repo bao ngoài. Trước khi sản xuất nội dung theo batch cần tạo baseline commit/branch hoặc một repository boundary rõ để review diff, rollback và release manifest có ý nghĩa.

### P2 — Governance/status phân mảnh

Stage 0–3 không có `STATUS.json`; Stage 4–9 dùng schema khác nhau. Một số status lịch sử vẫn ghi stage sau `NOT_STARTED/BLOCKED`. Đây là dữ liệu đúng tại thời điểm release cũ nhưng không thể làm nguồn current state. `next-phase/PROGRAM_STATUS.json` sẽ là nguồn hiện tại duy nhất; status stage cũ không bị sửa hồi tố.

### P2 — Workspace hygiene

`npm ls --depth=0` phát hiện hai dependency extraneous trong `node_modules`. Máy hiện chạy Node `20.11.0` trong khi `package.json` yêu cầu Node `>=22`. Đây không phải blocker authoring, nhưng release v2 phải dùng Node 22 được pin và `npm ci` từ lockfile trong checkout sạch.

### P2 — Ba lỗi bilingual structure

257/260 block có cấu trúc VI/EN tương ứng. Action View của `random-files`, `exceptions` và `performance` có row tiếng Việt ba ô dưới header bốn cột và fixture VI/EN không đồng nhất. Các lỗi này vào batch C6/C4 và gate parity toàn bộ.

## Stage disposition

| Stage | Giữ lại | Việc phải làm tiếp |
|---|---|---|
| 0 | Scope và learning-page contract | Bổ sung gate v2, không đổi scope |
| 1–2 | Corpus và pattern evidence | Chỉ đọc; kiểm locator khi gặp source issue |
| 3 | 13/26, 108 knowledge block, objective/book map | Tạo disposition 108/108 và author content |
| 4 | Method, marking, error prevention | Join vào từng lesson; không dùng thay execution |
| 5 | Harness, fixtures, run/rerun evidence | Map 26 example; chạy lại code đã đổi |
| 6 | Learning flow, practice, retrieval | Re-author theory/code integration; giữ phần đã chứng minh |
| 7 | Event taxonomy và storyboards | Tạo scenario-specific trace và code line binding |
| 8 | Reducer/runtime shell | Nâng schema/runtime để scenario đổi event sequence thật |
| 9 | Route, navigation, source UI, semantic code renderer | Thay canonical content registry và QA learner-visible |

## Kết luận kiến trúc

Bản sửa không nên tiếp tục chắp vá `stage9-learning-pages.json`. Cần thiết lập chuỗi canonical:

`Stage 3 knowledge map + Stage 4 method/marking + Stage 5 verified execution → authored lesson source → Python artifacts → scenario traces → build-time registries → Fumadocs renderer`.

Mọi layer dùng stable IDs và hashes; VI/EN dùng chung code, fixture và trace, chỉ prose/label được bản địa hóa.
