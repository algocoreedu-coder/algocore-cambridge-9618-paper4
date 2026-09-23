# Kế hoạch đội agent — AlgoCore Cambridge 9618 Paper 1

Ngày lập: 19/09/2026. Trạng thái: kế hoạch triển khai; chưa khởi chạy đội sản xuất nội dung.

Tài liệu vận hành: [Playbook cho Lead](LEAD_PLAYBOOK.md), [work orders Stage 0](STAGE0_WORK_ORDERS.md), [prompt khởi động Lead](LEAD_START_PROMPT.md).

Stage 1 đã có kế hoạch riêng: [playbook corpus](stage-1/LEAD_PLAYBOOK.md) và [work orders](stage-1/WORK_ORDERS.md). Các file này chỉ lập kế hoạch, không có nghĩa Stage 1 đã bắt đầu.

Stage 2 có bộ kế hoạch riêng đã qua A9 retest: [README](stage-2/README.md), [Lead playbook](stage-2/LEAD_PLAYBOOK.md), [work orders](stage-2/WORK_ORDERS.md), [schema/DoD](stage-2/STAGE2_SCHEMA_AND_DOD.md) và [prompt khởi động](stage-2/LEAD_START_PROMPT.md). Trạng thái vẫn là NOT_STARTED cho tới khi người dùng cho phép thực thi.

**Đã xác nhận với người dùng:** thi năm 2026; đầy đủ hai bản tiếng Việt và tiếng Anh; sử dụng learning page của `algocore-fumadocs` làm nền giao diện và cách tổ chức bài.

## 1. Mục tiêu và phạm vi

Chuyển nguồn coursebook, syllabus và QP/MS thành hệ thống ôn thi Paper 1 có thể học, tự làm, kiểm tra và ôn lại. Mỗi bài nối được mục tiêu syllabus → giải thích kiến thức → dạng câu hỏi → cách trả lời → tiêu chí chấm → bài tự luyện.

Phạm vi dự kiến theo bản đồ hiện có của dự án: tám chủ đề Information representation; Communication; Hardware; Processor fundamentals; System software; Security, privacy and data integrity; Ethics and ownership; Databases. A3 phải đối chiếu từng yêu cầu với syllabus 2026 trước khi khóa coverage. Số chương sách không thay thế mã mục tiêu syllabus; không mặc định một chương bằng một learning page.

Đầu ra hoàn chỉnh: bản đồ chương trình; nguồn có định danh; ngân hàng câu hỏi có liên kết QP/MS; phân loại dạng; bài học VI/EN; đáp án và hướng dẫn tự chấm; hình/mô phỏng có mục đích; trang học tích hợp trong app; bộ ôn tập theo chủ đề và bài hỗn hợp; hồ sơ kiểm duyệt.

Ngôn ngữ kế hoạch vận hành là tiếng Việt. Sản phẩm học tập phải đầy đủ VI/EN. Năm và ngôn ngữ của Paper 1 đã được xác nhận riêng trong task này, không kế thừa mặc định từ Paper 4.

## 2. Hiện trạng đã kiểm tra

| Bằng chứng | Kết luận và hệ quả |
|---|---|
| `algocore-fumadocs/README.md` | App là theme preview; chưa có PDF ingestion, tài khoản, chấm điểm, lưu tiến độ hoặc search index. |
| `algocore-fumadocs/app/docs/page.tsx` | Một bài mẫu Paper 3: mục tiêu → khái niệm → hình tại chỗ → điểm nhớ → worked example → tránh nhầm → tự luyện và mở lời giải. Đây là cấu trúc cần kế thừa. |
| `algocore-fumadocs/app/docs/layout.tsx` | Sidebar và các link hiện viết tay cho một bài. Cần thiết kế route/navigation cho Paper 1. |
| `algocore-fumadocs/app/layout.tsx` | Locale hiện cố định `vi`; search tắt. Hai bản ngôn ngữ chưa phải tính năng có sẵn. |
| `algocore-fumadocs/styles/algocore-theme.css` | Có token AlgoCore, light/dark, sidebar navy và focus ring. Giữ theme tập trung và logo hiện có. |
| `curriculum/paper_1/README.md` | Là khung chuẩn bị, chưa có bộ bài học chi tiết ở thư mục này. |
| Kiểm kê trực tiếp `Past_Papers` ngày 19/09/2026 | 30 QP Paper 1, mỗi năm 2021–2025 có 6 đề; cả 30 có MS cùng tên mã. Chưa kiểm tra nội dung/toàn vẹn và tính tương đương variant. |
| `output/markdown/chapter2_paper1`, các bản chương 1–3 và revision guides trong `output/docx` | Có nội dung có thể tái sử dụng sau audit; tên “approved” hoặc “final” không tự chứng minh đã phù hợp website hay đủ chính xác. |
| `planning/paper4/stage-0/LEARNING_PAGE_CONTRACT.md` | Có tiền lệ tốt về truy nguồn, song ngữ và QA; các yêu cầu Python/Action View chuyên Paper 4 không tự trở thành yêu cầu Paper 1. |

Audit lần này đọc source và tài liệu; chưa chạy browser QA, chưa đọc toàn bộ coursebook hoặc 30 bộ QP/MS. Không có tuyên bố UI đã được kiểm thử.

Syllabus chính thức đã mở để xác nhận năm và phiên bản: [Cambridge 9618 — 2026, version 2](https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf). Stage 0 phải đối chiếu file địa phương `697372-2026-syllabus.pdf` với bản này; ghi version, ngày kiểm tra và hash. Không dùng bảng map 2027–2029 hiện có thay cho audit 2026.

## 3. Đội hình: 10 vai trò, chạy theo đợt

Vai trò là trách nhiệm chuyên môn; không có nghĩa chạy 10 agent đồng thời. Cấu hình điều phối đề xuất: A0 giữ vai trò Lead, tối đa ba worker cùng lúc. Một vai trò có thể được kích hoạt lại theo từng gói việc. Reviewer phải độc lập với tác giả của gói đang duyệt.

| ID / vai trò | Trách nhiệm và đầu ra | Ranh giới |
|---|---|---|
| **A0 — Lead / Managing Editor** | Khóa cấu hình, giao việc, quản dependency, tích hợp quyết định; sở hữu `COURSE_SETTINGS`, `DECISIONS`, `WORK_ORDERS`, gate report. | Chỉ đóng gate sau khi xem bằng chứng; không tự bỏ qua finding học thuật. |
| **A1 — Learning Page Architect** | Audit UI; định nghĩa learning-page contract, block types, metadata, navigation và bản mẫu bố cục. | Phân biệt hiện trạng với phần cần xây; không tự đổi phạm vi syllabus. |
| **A2 — Source & Corpus Curator** | Kiểm kê, hash, trích xuất/OCR khi cần, đối chiếu bản gốc, ghép QP/MS, lưu locator; tạo source manifest và question index. | Không tự suy diễn chữ, điểm hoặc hình bị mất; đánh dấu thiếu nguồn. |
| **A3 — Syllabus & Coursebook Specialist** | Đọc syllabus 2026 và sách; xây coverage matrix, prerequisite map, giải thích chuẩn và ranh giới Paper 1/Paper 3. | Sách hỗ trợ diễn giải; syllabus quyết định phạm vi thi. |
| **A4 — Exam & Mark Scheme Analyst** | Phân loại từng câu/ý, command word, dạng câu trả lời, marking points, câu dễ nhầm; tạo pattern catalog và marking map. | Không biến tần suất lịch sử thành dự đoán đề; không gọi mẹo AlgoCore là yêu cầu Cambridge. |
| **A5 — Instructional Author** | Soạn bài từ outline đã duyệt: hiểu bản chất, ví dụ, giảm gợi ý, bài độc lập, sửa lỗi, recap và lộ trình ôn. | Viết lại để dạy; mọi đáp án phải qua kiểm chứng học thuật, không chỉ văn phong tốt. |
| **A6 — VI/EN Academic Editor** | Duy trì glossary; hoàn thiện cả hai ngôn ngữ, command words, captions, hints, feedback và rubric; báo cáo parity. | Không đổi dữ kiện/đáp án/điểm giữa hai bản; không rút gọn bản Việt thành chú thích. |
| **A7 — Visual & Interaction Designer** | Chọn sơ đồ, bảng, hình hoặc mô phỏng theo mục tiêu; tạo storyboard, assets, alt text, state model và fixtures khi có tương tác. | Nội dung chuyển động phải đúng cơ chế; hình tĩnh không phải thêm animation để đủ chỉ tiêu. |
| **A8 — Fumadocs Integration Engineer** | Tách nội dung khỏi shell, triển khai schema/renderer, route VI/EN, TOC/sidebar, components và liên kết nguồn; build/typecheck. | Một owner duy nhất cho file app dùng chung; không tự sửa lời giải để vừa UI. |
| **A9 — Independent Quality Reviewer** | Review nguồn, coverage, lời giải, marking map, song ngữ và UI; trả finding có locator, severity, owner, retest status. | Không duyệt gói do chính mình viết; lỗi phải sửa rồi kiểm lại, không PASS bằng lời hứa. |

A9 có thể chia lượt review học thuật và UI. Khi cần năng lực chuyên sâu, mời A3/A4 kiểm chéo phần do người khác biên soạn; không để một người vừa tạo đáp án vừa là bằng chứng kiểm tra duy nhất.

## 4. Chuẩn learning page Paper 1 đề xuất

Giữ `DocsLayout`, `DocsPage`, `DocsBody`, theme và cấu trúc sư phạm của bài mẫu. Các block dưới đây là contract cần khóa ở Stage 0, không phải mô tả tính năng đã triển khai.

1. **Nhận diện:** Paper 1, năm 2026, chủ đề, lesson ID, ngôn ngữ và mục tiêu có thể kiểm tra.
2. **Chuẩn bị:** kiến thức tiên quyết, link đúng bài/block cần ôn.
3. **Hiểu bản chất:** giải thích ngắn, thuật ngữ Anh–Việt nhất quán, minh họa đặt ngay tại chỗ cần hiểu.
4. **Điểm cần nhớ:** quy tắc, điều kiện áp dụng, đơn vị/quy ước và ngoại lệ cần thiết.
5. **Nhận diện câu thi:** command word, dữ kiện, sản phẩm câu trả lời và dạng gần giống.
6. **Worked example:** đọc đề → chọn cách làm → trình bày từng bước và lý do → kiểm tra kết quả.
7. **Trả lời để thể hiện đủ kiến thức:** nối yêu cầu đề với các ý được chấm; phân biệt câu chưa đủ và câu đã sửa, giải thích vì sao.
8. **Tránh nhầm:** lỗi cụ thể → cách phát hiện → cách sửa; chỉ gọi là nhận xét examiner khi có nguồn examiner report.
9. **Tự luyện:** có hướng dẫn → giảm gợi ý → độc lập; gợi ý và lời giải mở theo nhu cầu, không lộ sẵn trước nhiệm vụ.
10. **Tự đối chiếu:** đáp án, lý do, marking points có nguồn hoặc rubric AlgoCore có nhãn rõ.
11. **Ôn lại và học tiếp:** câu nhớ lại, bài trộn phù hợp và link bài tiếp theo hoặc bài cần củng cố.
12. **Nguồn:** syllabus, sách, QP/MS chính xác tới câu/ý và trang. Reviewer/version được lưu trong manifest; không nhồi metadata vận hành vào bài học.

Một gói bài có thể chia thành các trang liên kết nếu quá dài. Không dùng thời gian đọc cố định 8 phút từ bài mẫu cho mọi bài. Không sao chép nhãn Unit 13/Paper 3 hoặc độ sâu kiến thức của bài mẫu vào Paper 1.

Đặc thù đánh giá Paper 1: định nghĩa, phân biệt/so sánh, giải thích cơ chế, trả lời theo tình huống, tính toán, hoàn thiện sơ đồ/bảng/trace và câu cơ sở dữ liệu trong phạm vi đã xác minh. Không áp một công thức trả lời cho mọi command word hoặc mặc định một câu văn luôn bằng một điểm.

Hình/mô phỏng chỉ được giao sau khi có nội dung được duyệt. Ví dụ ứng viên: trọng số nhị phân; kích thước ảnh/âm thanh; đường đi dữ liệu; fetch–decode–execute; logic/truth table; quan hệ giữa các bảng. A3 xác nhận phạm vi, A7 xác định mục tiêu quan sát, A9 kiểm tra kết quả độc lập.

## 5. Hợp đồng nguồn và song ngữ

Schema logic tối thiểu; A1/A8 chọn định dạng lưu và renderer trong pilot, không coi repo đã có MDX pipeline:

```text
source: id, kind, relative_path_or_url, hash, edition_or_version, verified_status
locator: source_id, pdf_page_1_based, printed_page_or_null, chapter_or_section,
         exam_year, session, component, variant, question, part
objective: id, syllabus_locator, requirement, prerequisite_ids, coverage_status
question: id, origin, objective_ids, pattern_ids, prompt, marks, qp_locator,
          ms_locator, dependency_ids, variant_group, split, verification_status
marking_point: id, question_id, claim_kind, ms_locator_or_null,
               conditions, acceptable_alternatives, solution_step_refs
lesson: id, version, settings_ref, objective_ids, pattern_ids, prerequisites,
        blocks, exercise_ids, source_refs, next_lesson_ids
localized_content: content_id, locale, version, body, parity_status
visual: id, purpose, block_ref, caption, alt, model_or_asset_ref, qa_ref
review: artifact_id, artifact_version, reviewer, findings, evidence, gate_status
```

- `origin`: official / adapted / original. `claim_kind`: official_marking_requirement / algocore_guidance. Đề tự soạn có rubric tự soạn; không gắn nguồn MS của câu tương tự như thể đó là đáp án chính thức.
- Phân biệt năm đề với năm syllabus dùng để ôn; câu cũ phải được rà tính phù hợp cho 2026.
- Giữ cả câu cha và câu con, thông tin ngữ cảnh/phụ thuộc; không cộng điểm câu cha lần nữa khi đã cộng các ý con.
- Gộp variant tương đương chỉ sau so sánh nội dung và yêu cầu chấm; giữ nguồn gốc từng file. Báo cáo riêng số file, số câu/ý và số mẫu độc lập.
- QP/MS là căn cứ câu thi; syllabus là căn cứ phạm vi; sách là căn cứ giải thích. Khi có xung đột, ghi issue cụ thể và xử lý theo loại khẳng định, không âm thầm sửa nguồn.
- Tài liệu đã soạn, topical papers, solved papers và index trong `tmp` là nguồn ứng viên; kiểm lại với bản gốc trước khi dùng làm bằng chứng.
- Hai ngôn ngữ dùng chung ID, dữ kiện, đáp án và logic. Đủ VI/EN cho mục tiêu, lý thuyết, ví dụ, câu hỏi, gợi ý, rubric, phản hồi, caption/alt và UI khóa học.
- Bản dịch câu thi phải được nhận diện là bản dịch AlgoCore; giữ bản tiếng Anh gốc làm tham chiếu. Bài thi thử có thể trình bày bằng tiếng Anh để luyện điều kiện thi, nhưng phần giải thích/đáp án vẫn có cả VI/EN.
- Link nguồn trên website phải dùng cơ chế truy cập thực tế; đường dẫn `D:/...` chỉ dùng trong hồ sơ nội bộ, không đặt nguyên vào website khi phát hành.

## 6. Lộ trình và gate

| Stage | Agent chính | Đầu ra bắt buộc | Điều kiện chuyển bước |
|---|---|---|---|
| **0 — Khóa chuẩn** | A0 + A1/A2/A3; A9 review lượt sau | `COURSE_SETTINGS`, `SOURCE_BASELINE`, `LEARNING_PAGE_CONTRACT`, `DEFINITION_OF_DONE`, scope 2026 | Phạm vi/ngôn ngữ/version rõ; phân biệt baseline UI và extension; không còn mâu thuẫn phạm vi. |
| **1 — Chuẩn hóa nguồn** | A2; A3/A4 kiểm chéo | Source manifest, QP/MS index, locator tới câu/ý, extraction QA, missing-source log | 30 cặp hiện có được kiểm kê nội dung; hình/bảng/công thức cần dùng đã so với PDF; chỗ chưa xác minh có trạng thái rõ. |
| **2 — Bản đồ học và dạng thi** | A3 + A4; A9 review | Coverage matrix, prerequisite map, pattern catalog, glossary seed, ngân hàng câu hỏi phân nhóm | Mọi yêu cầu syllabus có nơi dạy/kiểm tra dự kiến; pattern có minh chứng; vùng chưa có câu thi vẫn được dạy và có bài tự soạn. |
| **3 — Pilot nội dung** | A5 + A6 + A7; A3/A4/A9 theo lượt | Ba gói pilot VI/EN, lời giải/marking map, storyboard, kết quả review | Kiến thức và đáp án đúng, đủ hai ngôn ngữ, cấu trúc dùng được cho các dạng khác nhau. |
| **4 — Pilot trên UI** | A8 + A7; A1/A9 review | Route và content pipeline, ba bài chạy thật, kiểm tra build/type/UI | Hai locale, navigation, mở đáp án, hình/tương tác và nguồn hoạt động; không còn lỗi nghiêm trọng. |
| **5 — Nhân rộng theo chủ đề** | A3/A4 hỗ trợ; A5/A6/A7 sản xuất; A8 tích hợp; A9 review | Các lô bài của tám chủ đề theo schema đã ổn định | Từng lô qua source/content/parity/UI gate; chỉ nhân rộng sau pilot đạt. |
| **6 — Ôn tổng hợp và thi thử** | A4 + A5 + A6; A9 review | Diagnostic, bài mixed-topic, revision routes, đề thi thử và hướng dẫn tự chấm | Blueprint bao phủ phạm vi; kiểm tra đáp án/điểm độc lập; tách bài đã học với bài đánh giá khi cần đo tiến bộ. |
| **7 — Nghiệm thu khóa** | A9; A0 quyết định; A8 sửa tích hợp | Coverage cuối, link/UI report, issue log đóng, release manifest | Đạt toàn bộ checklist dưới đây; trạng thái triển khai/publish được ghi riêng. |

Không yêu cầu chờ toàn corpus hoàn thiện để chuẩn bị layout hoặc glossary. Tuy nhiên bài chưa đủ nguồn/QA không được tính là bài đã nghiệm thu. Khi A9 phát hiện lỗi upstream, mở lại artifact và gate bị ảnh hưởng, rồi kiểm lại các bài phụ thuộc.

Nếu cần đánh giá trước/sau có ý nghĩa, A0/A4 chọn một số whole papers hoặc nhóm câu làm holdout ngay Stage 1, trước khi A5 nhận dữ liệu viết bài. Không để variant gần như trùng lọt vào cả tập luyện và holdout. A4/A9 vẫn được xem holdout để kiểm chứng; A5 chỉ nhận phần nguồn được phép dùng cho bài dạy. Nếu không giữ được độc lập, gọi đó là bài luyện tổng hợp, không quảng bá là đo tiến bộ độc lập.

## 7. Ba pilot khuyến nghị

| Pilot | Lý do chọn | Minh chứng thành công |
|---|---|---|
| **P1 — Tính dung lượng ảnh/âm thanh** | Kiểm tra dạng tính toán, đơn vị, công thức, làm tròn và phản hồi lỗi. | Dữ kiện và quy ước rõ; kết quả được tính độc lập; ví dụ từng bước và biến thể tự làm tương đương VI/EN. |
| **P2 — Fetch–decode–execute** | Kiểm tra dạy cơ chế, sơ đồ và trình tự trạng thái. | Trạng thái/bus/register phù hợp phạm vi và ví dụ; diagram, lời giải và mô phỏng nếu có không mâu thuẫn. |
| **P3 — Validation và verification trong tình huống** | Kiểm tra dạng phân biệt/giải thích, thuật ngữ và câu trả lời cần ngữ cảnh. | Chỉ ra vì sao câu trả lời được/không được chấp nhận; glossary và rubric nhất quán giữa hai ngôn ngữ. |

A3/A4 khóa lại câu và objective cụ thể sau audit nguồn. Chưa chốt số trang toàn khóa hoặc số câu mỗi bài bằng quota; quyết định từ coverage, độ khó và thời lượng học thực tế. Giữ lại sample Paper 3 khi triển khai route Paper 1.

## 8. Cách chạy đội và quyền ghi file

Đợt mở đầu: A0 điều phối + A1 audit learning page + A2 kiểm kê nguồn + A3 khóa syllabus/sách. Khi ba gói xong, giao A9 review độc lập rồi A0 đóng Stage 0. Đây là đề xuất đợt đầu để triển khai tiếp, chưa được thực thi trong task planning này.

Các đợt sau phân công theo dependency: A2/A3/A4 làm nguồn và bản đồ; A5 soạn sau outline; A6 biên tập và A7 thiết kế hình sau nội dung đủ ổn định; A8 tích hợp; A9 kiểm duyệt các bản đã hoàn thiện. Các chủ đề khác nhau có thể lệch pha để giữ công việc tiến triển mà không vượt số slot.

Quyền ghi đề xuất:

```text
planning/paper1/                     A0: cấu hình, work orders, quyết định, gate
planning/paper1/evidence/<agent-id>/ mỗi agent: báo cáo riêng, không ghi đè nhau
sources/paper1/                      A2: manifest, indexes và extraction
curriculum/paper_1/<unit>/<lesson>/  owner của gói: outline, nội dung, đáp án, reviews
algocore-fumadocs/                   A8: app/routes/components; A7: assets được phân công
```

Các thư mục trên là cấu trúc đề xuất, trừ thư mục/file đã tồn tại. Task này chỉ tạo tài liệu kế hoạch. A0 chỉ định một owner cho mỗi file; agent khác trả review hoặc patch đề nghị. Không để agent dịch ghi đồng thời vào bản nội dung mà A5 đang sửa; bàn giao theo version. Đổi schema phải có A1/A8 đồng thuận và A0 ghi quyết định trước khi tiếp tục các lô phụ thuộc.

## 9. Work order chuẩn cho từng agent

```text
Task ID / vai trò:
Mục tiêu và artifact cần hoàn thành:
Cấu hình: Cambridge 9618, Paper 1, 2026, đầy đủ VI/EN.
Inputs: file paths, IDs, versions và gate nguồn đã đạt.
Phạm vi đọc / file được phép ghi:
Điều kiện nội dung: theo LEARNING_PAGE_CONTRACT và nguồn cụ thể.
Phụ thuộc phải chờ / phần có thể làm ngay:
Đầu ra: artifact + evidence + issues + self-review.
Tiêu chí nghiệm thu / reviewer được chỉ định:
Quy tắc: không bịa locator, marking point hoặc trạng thái PASS;
          chưa chắc thì ghi unresolved và nêu bằng chứng cần bổ sung.
Kết thúc: báo changed files, kiểm tra đã làm, finding còn mở, bước nhận bàn giao.
```

Prompt chung dùng khi khởi chạy:

> Bạn là [vai trò] trong đội AlgoCore Paper 1. Đọc cấu hình và contract đã khóa, hoàn thành work order được giao bằng nguồn có locator. Tách dữ kiện chính thức, diễn giải AlgoCore và phần chưa xác minh. Chỉ ghi trong vùng được phân công. Giữ nội dung hướng tới khả năng hiểu, tự trả lời và tự sửa lỗi của học viên. Nộp artifact, evidence, issues và self-review; không tự đóng gate của mình hoặc chuyển sang stage chưa được giao.

## 10. Definition of Done cho một bài và toàn khóa

- Mỗi mục tiêu bài có hoạt động đánh giá phù hợp; cuối khóa mọi yêu cầu trong scope syllabus đã khóa có bài dạy và bài kiểm tra liên kết.
- Mỗi claim về điểm chính thức có MS locator; mọi câu tự soạn/adapted được dán nhãn và có đáp án/rubric đã review.
- Tất cả câu được sử dụng có kiểm chứng dữ kiện, hình, bảng, điểm, phụ thuộc và lời giải; câu tính toán/logic/SQL hoặc mô phỏng được kiểm tra bằng phương pháp độc lập phù hợp.
- Không suy diễn lỗi của học sinh thành nhận xét examiner khi thiếu nguồn. Không hứa điểm thi dựa trên pattern frequency.
- VI/EN đủ và tương đương ý nghĩa theo content ID/version, không chỉ kiểm đếm số file; glossary, đơn vị và command words nhất quán.
- UI đúng Paper/năm/chủ đề; route/anchor/link không hỏng; đổi ngôn ngữ giữ bài tương đương; không còn placeholder hoặc nhãn mẫu sai.
- Visual có caption/alt hoặc giải thích text tương đương; điều khiển được bằng bàn phím; focus rõ; kiểm light/dark, viewport hẹp và zoom. Tương tác thay đổi trạng thái có fixtures và kết quả đúng, hỗ trợ dừng/bước lại/reset theo thiết kế.
- Chạy `npm run typecheck` và `npm run build` cho phiên bản tích hợp; browser QA xác nhận hành vi người học. Test logic riêng chỉ cho tính toán/tương tác có rủi ro sai, không tạo test chỉ lặp lại nội dung implementation.
- Finding nghiêm trọng về phạm vi, lời giải, điểm, mất nội dung ngôn ngữ hoặc chức năng học phải đóng và retest trước PASS; finding nhỏ có owner và quyết định xử lý rõ.
- Ghi riêng trạng thái nội dung đạt, UI đạt và phát hành. Tài khoản, LMS backend, chấm tự động và lưu tiến độ chỉ đưa vào phạm vi khi có yêu cầu và thiết kế cụ thể.

## 11. Bộ tài liệu cần có sau Stage 0

`COURSE_SETTINGS.md`, `SOURCE_BASELINE.md`, `LEARNING_PAGE_CONTRACT.md`, `SCOPE_AND_COVERAGE_PLAN.md`, `DEFINITION_OF_DONE.md`, `WORK_ORDERS.md`, `DECISIONS.md`, `GATE_REVIEW.md` và báo cáo evidence A1/A2/A3/A9.

Nội dung cấu hình đã quyết: Paper 1 / 2026 / đầy đủ VI+EN / app đích algocore-fumadocs. Những việc còn phải kiểm chứng bằng công việc Stage 0: version file syllabus địa phương, edition sách, chuẩn bài chi tiết và nguồn thiếu. Lịch học và trình độ đầu vào có thể bổ sung khi xây revision routes; không ngăn đội chuẩn hóa nguồn và khóa contract.
