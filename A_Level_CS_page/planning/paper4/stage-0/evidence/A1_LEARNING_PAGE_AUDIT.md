# A1 — Audit learning page và đề xuất contract Paper 4

Ngày: 19/09/2026. Stage: 0. Vai trò: A1 — Learning Standards. Phiên bản: 1.1 (cập nhật lựa chọn người dùng do Lead chuyển).

Trạng thái: **đã audit mã nguồn; đề xuất để Lead kiểm tra và tổng hợp**. Đây không phải biên bản PASS của Stage 0 và chưa phải học liệu Paper 4 được nghiệm thu.

## 1. Phương pháp và giới hạn

- Đọc kế hoạch `D:/Private/_Lam_viec/AlgoCoreEduction/artifacts/exports/paper4-lead-stage-playbook-2026-09-19.md`, README, toàn bộ file ứng dụng trong `app/`, theme và package manifest.
- Liệt kê các file dự án bằng `rg --files --hidden`, loại `node_modules`, `.next` và `.git`. Không thấy thư mục components riêng, route Paper 4, nội dung MDX hay pipeline nhập học liệu trong các file nguồn ứng dụng đã liệt kê.
- Không sửa ứng dụng, không chạy browser/build/typecheck. Không tuyên bố đã kiểm chứng hiển thị, khả năng truy cập thực tế, hiệu quả học tập hoặc mọi hành vi của thư viện Fumadocs.
- Các locator `file:line` bên dưới lấy từ mã nguồn đọc ngày audit. Chúng là bằng chứng cấu trúc hiện tại, không phải cam kết API của phiên bản tương lai.
- **Observed** = có trong source/README; **User-required** = yêu cầu của người dùng đã ghi trong playbook; **Proposed** = đề xuất A1 cho contract. Không trình bày extension như tính năng có sẵn.

**User-confirmed, tách khỏi quan sát repository:** Lead chuyển xác nhận mới trong phiên làm việc: năm thi **2026**, ngôn ngữ lập trình **Python**, **mọi bài có hai bản VI/EN**. A1 dùng cấu hình này theo chỉ dẫn của người dùng; không suy ra từ UI tiếng Việt hoặc file có sẵn. Khóa học bao phủ syllabus áp dụng cho 2026, không phụ thuộc lịch riêng một kỳ thi.

Gốc repository, dùng cho tất cả locator tương đối bên dưới:

`D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/A_Level_CS_page/algocore-fumadocs`

## 2. Baseline đã quan sát

| ID | Quan sát | Bằng chứng file:line | Hệ quả với Stage 0 |
|---|---|---|---|
| O01 | Dự án tự mô tả là runnable theme preview dùng DocsLayout/DocsPage | `README.md:3` | Lấy mẫu làm chuẩn cấu trúc; chưa coi là nền tảng khóa học hoàn chỉnh |
| O02 | Sample dùng DocsPage, DocsTitle, DocsDescription, DocsBody; tắt footer mặc định | `app/docs/page.tsx:1`, `app/docs/page.tsx:13`, `app/docs/page.tsx:18` | Giữ shell Fumadocs khi mở rộng Paper 4 |
| O03 | Metadata của bài hiện tại là UNIT 13, Data Representation, Paper 3, 8 phút đọc và nhãn bài mẫu | `app/docs/page.tsx:14`, `app/docs/page.tsx:17` | Không sao chép các giá trị này sang Paper 4; thời lượng cần căn cứ bài thực |
| O04 | Bài mẫu: mục tiêu có động từ → khái niệm → hình bit → điểm nhớ → bước làm → tránh nhầm → tự kiểm tra → mở lời giải | `app/docs/page.tsx:19`, `app/docs/page.tsx:28`, `app/docs/page.tsx:30`, `app/docs/page.tsx:37`, `app/docs/page.tsx:38`, `app/docs/page.tsx:45`, `app/docs/page.tsx:46`, `app/docs/page.tsx:47` | Đây là xương sống sư phạm quan sát được; không phải tài liệu chuẩn đầy đủ cho toàn khóa |
| O05 | TOC viết tay với bốn anchor; sidebar tree cũng viết tay và trỏ chủ yếu vào các block trên /docs | `app/docs/page.tsx:4`, `app/docs/layout.tsx:5`, `app/docs/layout.tsx:13` | Khi thêm bài phải cập nhật route/tree/anchor và kiểm tra đồng bộ |
| O06 | Sidebar cấu hình collapsible, logo có alt, banner Cambridge 9618, footer ghi Paper 3 | `app/docs/layout.tsx:24`, `app/docs/layout.tsx:26`, `app/docs/layout.tsx:28`, `app/docs/layout.tsx:30` | Giữ logo và cấu trúc; thông tin khóa/bài phải đúng context |
| O07 | Root khai báo tiếng Việt, theme mặc định light và một số nhãn UI được dịch | `app/layout.tsx:12`, `app/layout.tsx:14` | Đây là baseline UI; không thay cho quyết định ngôn ngữ nội dung khóa |
| O08 | Theme được import sau neutral/preset; có tokens light/dark, sidebar navy, focus-visible | `app/globals.css:1`, `styles/algocore-theme.css:4`, `styles/algocore-theme.css:34`, `styles/algocore-theme.css:58`, `styles/algocore-theme.css:80` | Tập trung thay đổi màu tại theme, không nhân palette tùy tiện ở từng bài |
| O09 | Brand navy #0B1F33, teal #11B5AE, orange #FF9F1C; UI primary #007C83, dark #45D6C9 | `README.md:13`, `styles/algocore-theme.css:14`, `styles/algocore-theme.css:24`, `styles/algocore-theme.css:44` | README giải thích teal đậm dùng cho UI; chưa đo tương phản thực tế trong audit này |
| O10 | Có styling prose, mục tiêu, hình, callout, bước làm, practice, responsive <=640px và reduced-motion cho smooth scroll | `app/globals.css:26`, `app/globals.css:28`, `app/globals.css:34`, `app/globals.css:43`, `app/globals.css:49`, `app/globals.css:54`, `app/globals.css:64`, `app/globals.css:72` | Tái sử dụng ý nghĩa block; reduced-motion hiện tại chưa bao phủ mô phỏng chưa tồn tại |
| O11 | Hình mẫu là DOM tĩnh có role figure/aria-label; lời giải dùng details/summary | `app/docs/page.tsx:30`, `app/docs/page.tsx:33`, `app/docs/page.tsx:47` | Có nền semantic sơ bộ; không có event engine/Next/Previous/Play/Reset trong sample |
| O12 | Không PDF import, accounts, grading, progress tracking, search index; search disabled; không cấu hình publication theo README | `README.md:17`, `app/layout.tsx:14` | Những chức năng này là ngoài baseline; không đưa trạng thái đăng nhập/đã chấm/đã lưu giả vào UI |
| O13 | Manifest có build/typecheck scripts, Next 16.3.5 và Fumadocs 16.15.11; home redirect /docs | `package.json:6`, `package.json:13`, `package.json:16`, `app/page.tsx:2` | Có lệnh kiểm chứng tích hợp về sau; audit này không chạy chúng |

## 3. Contract bài học đề xuất cho Lead khóa

Contract này giữ O02/O04 và bổ sung các yêu cầu Paper 4 của người dùng. Không bắt mọi mục thành một màn hình dài: chia block có ID ổn định, liên kết đúng vị trí và đặt visual ngay tại khái niệm/thao tác cần giải thích.

| Thứ tự | Block và dữ liệu tối thiểu | Nguồn yêu cầu | Điều kiện nghiệm thu nội dung |
|---|---|---|---|
| 1 | Tiêu đề, mô tả kết quả, lesson ID, Paper 4, objective IDs, phạm vi/cấu hình áp dụng | Observed shell; Proposed metadata | Không mang metadata Paper 3 hoặc năm/ngôn ngữ suy đoán |
| 2 | Mục tiêu có thể quan sát; tiên quyết và link bài/block | Observed mục tiêu; User-required mapping | Mỗi mục tiêu có bài luyện hoặc kiểm tra tương ứng |
| 3 | Dấu hiệu nhận diện dạng, yêu cầu đề, dạng gần giống, điều kiện áp dụng | User-required | Pattern đã được Lead duyệt, có câu/ý minh chứng; không suy ra taxonomy chỉ từ tiêu đề chương |
| 4 | Kiến thức, lý do, coursebook locator, sơ đồ/đối chiếu ở điểm cần hiểu | Observed concept/figure; User-required | Link đúng chương/mục/trang, phân biệt PDF page và trang in |
| 5 | Điểm cần nhớ, invariant/quy ước, kiểm tra nhanh | Observed note; Proposed invariant | Mẹo nhớ có ý nghĩa và ngoại lệ, không thay việc hiểu |
| 6 | Ví dụ từng bước: input → phương pháp → code/trace → output/evidence → kiểm tra | Observed worked example; User-required | Giải thích vì sao, đủ ràng buộc câu thi; lời giải chạy đúng chưa thay cho đáp ứng yêu cầu cài đặt |
| 7 | Action View tại bước thích hợp; dự đoán trước khi xem kết quả | User-required new extension | Dùng event/state đã kiểm chứng; có controls, feedback và mode từng bước |
| 8 | Requirement ↔ marking point ↔ bước giải/code/evidence; lỗi → phát hiện → sửa | Observed warning; User-required rubric | Nguồn QP/MS tới câu/ý; nhãn rõ tiêu chí chính thức hay khuyến nghị AlgoCore; không tự gán số điểm mất |
| 9 | Luyện có hướng dẫn → giảm gợi ý → tự làm → sửa lỗi/biến thể | Observed self-check; User-required progression | Có nhiệm vụ thật trước reveal; đáp án, lý do và rubric đủ để tự đối chiếu |
| 10 | Recap, câu nhớ lại không nhìn mẫu, bài vận dụng và đường học tiếp | User-required | Kiểm tra khả năng tái tạo phương pháp, không chỉ đọc lại code |
| 11 | Nguồn và revision của bài/solution/visual; thông tin reviewer lưu trong manifest | Proposed provenance | Truy nguyên được nguồn và gate; không đẩy dữ liệu vận hành không cần thiết vào luồng học |

### Schema bàn giao tối thiểu (trung lập renderer)

Đây là schema tài liệu đề xuất, chưa yêu cầu chuyển repo sang MDX, database hoặc định dạng mới.

```text
lesson: id, version, locale, translation_group_id, slug, title, description, paper, settings_ref,
        objective_refs[], prerequisite_block_refs[], pattern_refs[],
        learning_goals[], blocks[], next_lesson_refs[], provenance_ref
block: id, kind, title, objective_refs[], pattern_refs[], source_refs[],
       body, visual_refs[], exercise_refs[], requirement_refs[]
source_ref: source_id, source_version, kind, locator, verification_status
book_locator: chapter, section, pdf_page_1_based, printed_page_or_unavailable
exam_locator: syllabus_code, year, session, paper, variant, question, part,
              qp_page, ms_page, source_file_refs[]
exercise: id, origin, prompt, constraints, inputs, expected_evidence,
          hint_levels[], solution_ref, rubric_ref, variant_refs[]
rubric_item: id, requirement_ref, ms_locator_or_null, claim_kind,
             solution_step_refs[], evidence_refs[], likely_errors[], repair_ref
visual: id, version, learning_purpose, block_ref, storyboard_ref,
        reference_trace_ref, event_manifest_ref, accessibility_ref, qa_ref
```

`origin` phân biệt câu chính thức, adapted và tự biên soạn. `claim_kind` phân biệt official_marking_requirement và algocore_guidance. `settings_ref` trỏ COURSE_SETTINGS do Lead khóa với 2026/Python/VI+EN. Mỗi câu/ý nguồn cần ID riêng và giữ dependency tới phần trước. Nguồn chưa verified được lưu như draft; không tính hoàn thành hay đưa ra lời khẳng định chấm điểm đã xác minh.

### Contract hai bản VI/EN (User-confirmed)

- Cả hai bản có cùng lesson/block/objective/pattern/exercise/event ID trung lập locale; định danh nội dung hiển thị là cặp `(content_id, locale)`, không tạo hai taxonomy khác nhau. `translation_group_id` nối đúng phiên bản tương đương.
- Mọi bài phải đủ cả hai bản: mục tiêu, lý thuyết, các bước, gợi ý, đáp án, rubric, cảnh báo, recap, caption/alt, nhãn controls, prediction và feedback. Bản thiếu locale không đạt published-content readiness.
- Giữ một lời giải Python, fixtures, event/state model và nguồn chuẩn dùng chung. Không dịch identifier, tên file, literal/input/output hay yêu cầu từ đề làm sai hành vi. Commentary/code comments có thể dịch khi không đổi thực thi; nếu giữ nguyên code block dùng chung thì dịch giải thích ở ngoài.
- Thuật ngữ/command word trong đề có glossary VI↔EN. Bản dịch không sửa marking points; nguồn chính thức giữ nguyên và phần dịch được nhận diện là bản diễn giải/dịch AlgoCore.
- Link nội dung và đổi ngôn ngữ giữ bài/block tương đương; `html lang`, provider locale, nhãn UI và metadata phản ánh locale thật. Root đang hard-code `vi` (O07) phải được làm locale-aware khi triển khai, không báo đã hỗ trợ VI/EN hiện tại.
- QA kiểm tra parity theo ID và ý nghĩa: không chỉ đếm bài; phương pháp, constraints, marking map, đáp án và kết quả event phải tương đương giữa hai bản. Hai locale cùng đạt trước khi lesson được PASS.

## 4. Contract Action View theo event

Phần này là **User-required new extension**, chưa được triển khai trong repo. Một diagram động chỉ được coi là đủ khi giúp học sinh trả lời câu hỏi cụ thể về biến/trạng thái/thuật toán; không dùng chuyển động trang trí để đạt quota.

1. Tách event người dùng (Next, Previous, Reset, Play, Pause, ChangeInput, SubmitPrediction) khỏi event thuật toán (Read, Compare, Branch, Assign, Write, Swap, Call, Return...). Chỉ xây nhóm cần cho bài đã mapping.
2. Mỗi event thuật toán giữ `id`, `sequence_index`, `example_version`, `type`, `source_code_lines`, `precondition`, `state_before`, `state_delta`, `state_after`, `explanation`, `invariant_check`, `visual_targets` và các requirement refs có căn cứ. Dữ liệu quan sát có biến, con trỏ, call stack, input/output khi phù hợp.
3. Diagram, code highlight, bảng trace, biến và output đọc chung một state/transition model. Event sequence phải đối chiếu execution trace độc lập của A5; không lấy hình hiển thị làm bằng chứng tự xác nhận.
4. Next chạy đúng một bước có nghĩa; Previous phục hồi đúng snapshot hoặc deterministic replay; Reset tạo initial state của input hiện tại. ChangeInput khởi tạo lại dữ liệu và dừng playback cũ. Play/Pause không bỏ hoặc lặp event.
5. Predict có điểm dừng trước khi lộ kết quả, câu hỏi, đáp án/tiêu chí chấp nhận và phản hồi giải thích. Có bài tìm event sai và sửa khi mục tiêu phù hợp; phản hồi cục bộ không được gọi là chấm thi Cambridge.
6. Event nhánh biên/lỗi và terminal state phải có storyboard và test; quy ước chỉ số, con trỏ và điều kiện dừng lưu theo từng ví dụ. Không áp đặt một quy ước stack/queue cho mọi đề.
7. Không bắt mọi event có marking point. Chỉ gắn điểm khi QP/MS hỗ trợ; nhiều bước minh họa cơ chế không được chấm riêng.
8. Với kiến thức tĩnh, dùng figure, bảng so sánh hoặc câu hỏi thay vì hoạt ảnh. Với quá trình thay đổi trạng thái, cần Action View đã kiểm chứng theo mục đích được Lead duyệt.

## 5. Nguyên tắc UI semantic, thị giác và accessibility đề xuất

- Giữ DocsLayout/DocsPage/DocsBody và heading hierarchy; một tiêu đề bài, các H2 có anchor duy nhất và TOC khớp. Tên route/sidebar cho người học hiểu dạng/kỹ năng, không dùng tên file nội bộ.
- Giữ logo và token navy/teal/orange trong theme. Màu phục vụ phân biệt trạng thái nhưng luôn đi kèm nhãn, số bước, dấu hoặc hình dạng; không chỉ dùng đỏ/xanh.
- Figure có caption/tên truy cập và giải thích tương đương bằng văn bản. Bảng trace có header và caption; code là text có thể sao chép, không đặt lời giải dài trong ảnh.
- Controls dùng button/input có label và trạng thái disabled đúng; điều khiển được bằng bàn phím, focus nhìn thấy, không mất focus khi step/reset/reveal. Giữ details/summary hoặc control semantic tương đương cho lời giải/gợi ý.
- Có mode Pause/Step và tôn trọng reduced-motion; không tự chạy hoạt ảnh khi vào trang. Trạng thái hiện tại có cách đọc bằng text; thông báo cập nhật vừa đủ, không đọc mọi frame hoạt ảnh qua live region.
- Minh họa before/after, delta, code/trace đồng bộ, so sánh đúng/sai, call frames, nhãn giảm dần được chọn theo mục tiêu học. Không bật quá nhiều vùng chuyển động đồng thời.
- Layout cần kiểm tra viewport hẹp, zoom, light/dark; code/trace dài được cuộn trong vùng có nhãn, không làm toàn trang tràn ngang. Kiểm tra tương phản khi tích hợp, không coi comment “accessible” trong CSS là bằng chứng đã đạt.
- Giữ bài mẫu Paper 3; Paper 4 là nội dung/route mới với metadata đúng. Học sinh phải tự luyện và mở rubric được mà không cần tài khoản hay backend chưa tồn tại.

Các mục trên là điều kiện cần xác minh ở Stage 8–9; A1 chỉ xác nhận thiết kế yêu cầu ở Stage 0.

## 6. Ranh giới phạm vi và cấu hình

| Hạng mục | Hiện trạng / đề xuất |
|---|---|
| Năm/kỳ thi và phiên bản syllabus | Người dùng chốt 2026; A3 xác minh syllabus áp dụng. Không cần khóa một kỳ thi để bao phủ nội dung chung năm 2026 |
| Ngôn ngữ lập trình, phiên bản runtime và môi trường thi | Người dùng chốt Python; phiên bản/runtime dùng kiểm chứng phải ghi rõ khi A5 thực hiện, không tự nhận là môi trường thi đã xác minh |
| Ngôn ngữ nội dung và quy tắc thuật ngữ | Người dùng yêu cầu đầy đủ hai bản VI/EN; UI hiện chỉ khai báo vi; áp dụng parity contract ở mục 3 |
| Phạm vi corpus, coursebook edition, topics bắt buộc/tiên quyết/mở rộng | A2/A3 cung cấp evidence, Lead chốt; A1 không tuyên bố coverage đầy đủ |
| Minh họa động, pattern cards, rubric mapping | Yêu cầu mới nằm trong chương trình học liệu; cần thiết kế/xây/QA ở các stage tương ứng |
| Import PDF, account, auto-grading, progress persistence, search | Không có sẵn. Ngoài baseline khóa học; chỉ triển khai khi được đưa vào scope riêng, với tiêu chí kiểm chứng cụ thể |
| Website publication | README nói chưa cấu hình; Stage 0 không deploy/publish |

Các tham số năm và ngôn ngữ đã được người dùng chốt; không còn finding thiếu quyết định này. Việc khóa phạm vi chính xác vẫn cần evidence A2/A3 và COURSE_SETTINGS; quyết định gate thuộc Lead.

## 7. Findings và checklist tự review của A1

| ID | Finding | Hành động đề xuất / owner | Ảnh hưởng gate |
|---|---|---|---|
| A1-F01 | Sample chưa có các block chuyên biệt Paper 4, provenance và event engine | Lead khóa contract; A4/A5/A6/A7 thực hiện ở các stage đã lập | Đây là extension có kế hoạch, không phải lỗi bắt buộc sửa app ở Stage 0 |
| A1-F02 | Metadata/sidebar và navigation đều chuyên cho một bài Paper 3 | A7 giữ sample và thêm đường dẫn/metadata Paper 4 khi tích hợp | Kiểm tra ở Stage 9 |
| A1-F03 — CLOSED | Trước đó thiếu năm/ngôn ngữ; người dùng đã chốt 2026/Python/VI+EN qua thông tin Lead chuyển | Đã cập nhật contract; Lead ghi vào COURSE_SETTINGS | Không còn là blocker |
| A1-F04 | Accessibility hiện mới có dấu hiệu trong source, chưa có kiểm chứng browser/AT/contrast | A8/A7 kiểm tra theo contract khi có sản phẩm | Không được tuyên bố UI/visual đã verified từ audit này |
| A1-F05 | Root locale hard-code vi, chưa có hai bản bài/locale-aware UI | A7 triển khai locale routing/provider và A4/A8 kiểm tra parity | Extension đã xác định; kiểm chứng khi tích hợp, không cần sửa app trong Stage 0 |

Tự review hoàn tất: mọi khẳng định hiện trạng có locator; không nâng mô tả README thành kiểm thử thực tế; phân biệt baseline, cấu hình người dùng và extension; dùng 2026/Python/VI+EN theo xác nhận; không sửa app; không hứa bảo đảm điểm thi; contract có nguồn/rubric/event, parity và điều kiện kiểm chứng. Chỉ tạo tài liệu A1 này. Lead cần đọc lại evidence và đối chiếu với A2/A3 trước khi ra quyết định Stage 0.
