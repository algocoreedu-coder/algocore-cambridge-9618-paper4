# Tiến độ và lộ trình release — Cambridge 9618 Paper 1 2026

Ngày chốt: 23/09/2026. Owner: A0 Lead. Trạng thái hiện hành: **Stage 2 PASS — `WAITING_FOR_USER_STAGE_CHECK`**.

Tài liệu này tổng hợp trạng thái đã có bằng chứng và lập đường đi từ sau Stage 2 tới release. Nó không khởi động Stage 3, không thay đổi canonical artifacts Stage 2 và không cấp quyền publish.

Chiến lược thực thi tiết kiệm token và cách chia việc ChatGPT Web/Codex nằm tại `TOKEN_EFFICIENT_RELEASE_PLAN.md`; tài liệu đó điều khiển cách vận hành các stage còn lại nếu hai tài liệu khác nhau về mức độ hồ sơ hoặc số agent.

## 1. Trả lời ngắn

Roadmap Paper 1 hiện có tám stage, đánh số 0–7. Stage 0, 1 và 2 đã PASS; còn **năm stage sản phẩm: Stage 3–7** để tạo một **release candidate đã nghiệm thu**.

Playbook tách trạng thái publish khỏi trạng thái tích hợp/đạt nội bộ. Vì vậy, nếu “release” nghĩa là người học truy cập bản production, cần thêm **một Release Gate** sau Stage 7. Tổng số checkpoint còn lại là:

- **5 stage** để đạt release-ready: Stage 3, 4, 5, 6, 7.
- **6 checkpoint** để public release: năm stage trên cộng Release Gate.

Stage 5 là khối lượng lớn nhất vì phải nhân rộng từ ba pilot sang toàn bộ tám domain/99 planned learning units. Số trang cuối không được suy ra là đúng 99: Stage 3 phải khóa quy tắc đóng gói lesson, sau đó A0 mới chốt số lesson thực tế từ coverage và thời lượng học.

## 2. Những gì đã hoàn thành

| Stage | Trạng thái | Kết quả đã nghiệm thu |
|---|---|---|
| 0 — Khóa chuẩn | PASS | Cấu hình Paper 1/2026/VI+EN; source baseline; scope; learning-page contract B01–B11; DoD; pilot scope; A9 review độc lập. |
| 1 — Chuẩn hóa nguồn | PASS | Corpus 3.604 records; 60 PDF gốc; 30 QP và 30 MS; locator câu/ý/marking; 128 unresolved được giữ rõ; final A9/A0 audit PASS. |
| 2 — Bản đồ học và dạng thi | PASS | 99 objectives, 205 requirements, 99 planned learning units, 893 assessment units, 504 patterns, 824 equivalence components, glossary và TRACE; final A9 14/14 và A0 14/14 PASS. |

Stage 2 đã khóa thêm:

- 701 assessment units/1.800 marks cho `AUTHOR_POOL` và 192 units/450 marks cho `CONTROLLED_CHECK`.
- 1.153 PRIMARY và 174 SUPPORTING links, không role drift.
- 62 HARD prerequisite edges và 15 AlgoCore-original assessment briefs.
- 96 glossary terms và 27 command words.

Chưa có đầu ra sản phẩm Paper 1 được nghiệm thu: lesson, lời giải hoàn chỉnh, parity VI/EN, route Paper 1 và app publication đều chưa bắt đầu. Kiểm tra repo app hiện hành không tìm thấy route/content Paper 1; Stage 4 phải tạo và kiểm tích hợp thật.

## 3. Lộ trình còn lại

| Stage | Mục tiêu | Đội hình chính | Đầu ra bắt buộc | Gate PASS |
|---|---|---|---|---|
| **3 — Pilot nội dung** | Chứng minh schema nội dung hoạt động trên ba dạng bài khác nhau | A5 tác giả; A6 bilingual/editor; A7 visual; A3/A4 specialist; A9 final | Ba content packages VI/EN: bitmap storage, fetch–decode–execute, validation vs verification; marking map; lời giải; practice; storyboard; provenance manifest | B01–B11 đủ; VI/EN tương đương; đáp án/marks/source được review độc lập; không open Critical/Major |
| **4 — Pilot trên UI** | Chứng minh content pipeline và learning page chạy thật | A8 integration; A7 assets; A1 UI/accessibility; A9 final | Route Paper 1; content schema/registry; ba pilot chạy trong app; locale switch; navigation; disclosure; source presentation; build/typecheck/browser evidence | Build/typecheck PASS; desktop/mobile/zoom/light/dark/keyboard/focus/VI/EN/link QA PASS; không lỗi nghiêm trọng |
| **5 — Nhân rộng toàn syllabus** | Sản xuất toàn bộ khóa theo schema đã ổn định | A5/A6/A7 theo batch; A3/A4 source review; A8 integration; A9 batch/final review | Các lesson packages cho tám domain theo prerequisite topology; assessment/solution/visual/parity manifests; coverage delta; app integration theo batch | 205/205 requirements có teaching và assessment đã nghiệm thu; mọi batch qua source/content/parity/UI gate; không placeholder |
| **6 — Ôn tổng hợp và thi thử** | Tạo đường ôn và thực hành end-to-end | A4 blueprint; A5/A6 content; A8 integration; A9 review | Diagnostic; mixed-topic practice; revision routes; mock papers; marking/self-check guidance; controlled-use report | Blueprint bao phủ scope; điểm/đáp án kiểm độc lập; không tuyên bố blind progress measurement; VI/EN và UI PASS |
| **7 — Nghiệm thu khóa** | Đóng release candidate | A9 independent acceptance; A0 gate; A8 fixes | Final coverage/parity/source/link/accessibility reports; test logs; closed issue register; release manifest; rollback/build identity | Toàn bộ DoD PASS; zero open Critical/Major; Minor có disposition; exact release candidate frozen |
| **Release Gate — Publish** | Đưa exact release candidate lên môi trường người học | A0 release owner; A8 deploy; A9 smoke review | Target environment/domain; deployment record; production URL; immutable version/hash; smoke results; rollback; publication-rights/source-link disposition | User authorizes publish; deployed hash matches Stage 7 manifest; production smoke PASS; rollback sẵn sàng |

## 4. Cách A0 điều phối từng stage

Mỗi stage dùng cùng một vòng kiểm soát:

1. **C0 — Freeze:** rehash đầu vào đã được gate trước, khóa schema/version, work orders và write allowlists.
2. **Author rounds:** tối đa ba worker ngoài A0, chia gói độc lập; worker không tự spawn agent.
3. **Specialist review:** reviewer khác tác giả, kiểm source/academic, parity hoặc UI theo vai trò.
4. **Correction/retest:** sửa thành version mới; review cũ chỉ được giữ nếu A0 chứng minh protected fields không drift.
5. **A9 final:** review độc lập toàn stage trên exact manifest.
6. **A0 gate:** rehash handoff, chạy validator/checks, ghi PASS hoặc CHANGES_REQUIRED.
7. **User checkpoint:** dừng mọi agent tại `WAITING_FOR_USER_STAGE_CHECK`; không tự dispatch stage kế tiếp.

## 5. Stage 3 nên bắt đầu như thế nào

Stage 3 là bước kế tiếp và cần một bộ plan/playbook/work orders riêng trước khi viết nội dung.

### C0 — Protocol và baseline

- Pin Stage 2 gate, manifest, learning map, glossary, pattern catalog, author allowlist và ba pilot mappings.
- Khóa content-package schema dùng chung cho VI/EN, solution, marking points, practice progression, visual storyboard và citations.
- Quy định rõ trường nào là official/adapted/original; chặn `CONTROLLED_CHECK` khỏi input của tác giả khi work order không cho phép.
- Tạo validator cho ID/version/parity/source/marking closure trước khi giao viết.

### C1 — Ba pilot song song

- **Pilot P1 / D1:** tính dung lượng bitmap — kiểm công thức, đơn vị, làm tròn và phản hồi lỗi.
- **Pilot P2 / D4:** fetch–decode–execute — kiểm cơ chế, trace, diagram và trình tự trạng thái.
- **Pilot P3 / D6:** validation và verification — kiểm phân biệt khái niệm, ngữ cảnh, command words và rubric.

A5 viết canonical content và lời giải; A6 làm parity/biên tập ở version kế tiếp; A7 tạo visual/storyboard từ content đã đủ ổn định. A3/A4 kiểm học thuật và marking/source; A9 không tham gia tác giả.

### C2–C4 — Review và gate

- C2: specialist review từng pilot.
- C3: correction/retest; khóa reusable schema sau khi cả ba loại bài đạt.
- C4: A9 final cả content, parity, source evidence và storyboard; A0 quyết định gate rồi dừng.

Stage 3 chưa sửa app. Stage 4 mới dùng ba package đã accepted để thiết kế pipeline và route thật.

## 6. Chiến lược Stage 5

Stage 5 phải chạy theo prerequisite topology, không chạy theo quota trang. Tám domain hiện có:

| Domain | Objectives | Atomic requirements | Nội dung |
|---|---:|---:|---|
| D1 | 17 | 23 | Data Representation, Multimedia, Compression |
| D2 | 15 | 26 | Networks including the internet |
| D3 | 13 | 26 | Computer components, Logic Gates/Circuits |
| D4 | 17 | 41 | CPU Architecture, Bit manipulation, Assembly Language |
| D5 | 8 | 24 | Operating Systems, Language Translators |
| D6 | 9 | 25 | Data Security, Data Integrity |
| D7 | 5 | 9 | Ethics and Ownership |
| D8 | 15 | 31 | Database concepts, DBMS, DDL/DML |

A0 tạo batch waves từ thứ tự topo của 62 HARD edges. Mỗi batch phải có source packet, content owner, bilingual editor, integration owner và reviewer độc lập. Chỉ merge sang app khi package content và parity đã PASS; chỉ tính requirement hoàn thành khi app version tương ứng cũng qua UI gate.

## 7. Rủi ro quyết định đường release

- 165 requirements không có verified coursebook-body support. Tác giả phải dùng syllabus/official evidence hoặc nội dung AlgoCore có nhãn; không được tạo citation sách giả.
- 12 requirements không có official evidence trong author pool và 3 chỉ có controlled-check evidence. 15 original briefs phải được phát triển thành câu/rubric rồi review độc lập.
- Ba patterns vẫn là `NEEDS_REVIEW`; một assessment unit vẫn không có accepted requirement mapping. Chúng phải giữ cảnh báo, không được dùng để tạo coverage claim.
- `CONTROLLED_CHECK` là procedural isolation, không phải blind holdout. Stage 6 không được quảng bá điểm trước/sau như phép đo tiến bộ độc lập.
- Public release cần quyết định cách hiển thị/truy cập nguồn và kiểm quyền sử dụng nội dung QP/MS/coursebook. Đường dẫn máy cục bộ không được xuất hiện trên website.
- App hiện có nhiều pipeline/kiểm tra phục vụ phần khác của dự án; chúng không chứng minh Paper 1 đã được tích hợp. Paper 1 cần registry, routes và checks riêng ở Stage 4.

## 8. Định nghĩa các mốc sản phẩm

- **Content-complete:** cuối Stage 5, khi toàn bộ requirement có lesson/assessment accepted và parity VI/EN.
- **Course-complete:** cuối Stage 6, khi có đường ôn, diagnostic/mixed practice/mock và self-check guidance.
- **Release-ready:** cuối Stage 7, khi exact candidate qua academic, parity, source, UI, accessibility và build gate.
- **Released:** sau Release Gate, khi exact candidate được deploy, production smoke PASS và người dùng đã cho phép publish.

Việc cần làm tiếp theo sau khi người dùng duyệt roadmap là soạn bộ Stage 3 gồm `README.md`, `LEAD_PLAYBOOK.md`, `WORK_ORDERS.md`, schema/DoD, input baseline và `LEAD_START_PROMPT.md`. Chỉ sau một chỉ dẫn thực thi riêng mới dispatch các agent Stage 3.
