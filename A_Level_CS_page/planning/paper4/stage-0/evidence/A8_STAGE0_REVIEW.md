# A8 — Independent Stage 0 review

Ngày: 19/09/2026. Reviewer: A8, độc lập với A1/A2/A3 và tác giả bộ scope/contract. Phiên bản review: 1.0.

**Khuyến nghị: PASS về nội dung Stage 0. Không phát hiện finding bắt buộc phải REWORK.** Lead cần ghi quyết định cuối trong GATE_REVIEW và đồng bộ trường gate của COURSE_SETTINGS khi ký; review này không tự mở hoặc thực hiện Stage 1.

## Phạm vi và phương pháp

Đã đọc SCOPE.md, LEARNING_PAGE_CONTRACT.md, COURSE_SETTINGS.json, DEFINITION_OF_DONE.md, DECISIONS.md; evidence A1_LEARNING_PAGE_AUDIT, A2_SOURCE_BASELINE (MD/JSON), A3_SYLLABUS_SCOPE, LEAD_SOURCE_VERIFICATION.json, syllabus2026_selected_pages.txt và phần mục lục coursebook_selected_pages.txt. Đối chiếu tiêu chí Stage 0 và quy tắc gate trong playbook ngày 19/09/2026.

Đọc trực tiếp README.md, app/docs/page.tsx, app/docs/layout.tsx, app/layout.tsx của algocore-fumadocs. Kiểm đếm độc lập tên file Paper 4 bằng `rg --files Past_Papers`; parse JSON, kiểm tra path/size các source refs trong 29 bản ghi paper; đối chiếu SHA-256 hai PDF gốc với manifest của Lead.

Review nội dung syllabus dựa trên bản trích PDF đã cung cấp, đặc biệt trang 11, 13, 37, 38, 40; không tuyên bố A8 đã tải lại bản PDF trên web, đọc toàn bộ QP/MS, mở ZIP/RAR, kiểm chứng nội dung mọi trang sách hoặc chạy ứng dụng. Những việc đó không phải điều kiện hoàn thành Stage 0.

Đọc bổ sung SOURCE_BASELINE.md và LEAD_MANIFEST_CHECK.json khi Lead hoàn tất: summary nhất quán với evidence; report của Lead ghi 11 checks PASS, 228 file references khớp path/size và không có errors. A8 phân biệt đây là kiểm chứng do Lead chạy với 94 paper-source references mà A8 tự kiểm độc lập ở trên; hai số khác nhau do phạm vi reference khác nhau.

## Checklist độc lập

| Tiêu chí | Kết quả | Bằng chứng cụ thể và nhận định |
|---|---|---|
| S0-01 — Năm và syllabus | PASS | COURSE_SETTINGS: exam_year 2026, syllabus_version 2, December 2025. Syllabus extracted PDF p.1 ghi 2026/Version 2; p.3 ghi thời điểm phát hành. Hash và size file local khớp LEAD_SOURCE_VERIFICATION.json. A3 phân biệt web index cũ với update chính thức, không tuyên bố byte match web/local. |
| S0-02 — Python | PASS | User chốt Python; settings/SCOPE cùng Python console, khớp p.11. Minor runtime để null có runtime_policy và D09 yêu cầu ghi trước chạy lời giải; không tạo yêu cầu phiên bản giả của Cambridge. |
| S0-03 — VI/EN | PASS | User chốt toàn bộ bài hai bản. Contract “Song ngữ đầy đủ” bao gồm nội dung, hint, feedback, labels, navigation, html lang; IDs/version/code/data/trace dùng chung; parity bắt buộc trước PASS. |
| S0-04 — Học thuật | PASS | SCOPE phân biệt core, supporting, AS prerequisite và exclusion. Đối chiếu p.37: graph không bắt viết code, binary-tree search/insert khác linked-list delete, dictionary được nêu. P.38 vẫn có random-file processing và exceptions; p.40 chỉ giới hạn supplied binary files. SCOPE không suy ra bỏ random files. Low-level/declarative loại đúng; hashing không tự nâng thành objective độc lập 19.1. |
| S0-05 — Baseline nguồn | PASS | Đếm độc lập 29 QP, 29 MS, 21 SF. JSON có 29 paper IDs duy nhất, mỗi paper đúng một MS, tám paper thiếu SF filename match. 94 source refs trong paper records tồn tại và khớp size; gồm report refs được dùng lại giữa các variant. Ranh giới kiểm kê theo filename được nêu rõ, không đánh đồng với xác minh nội dung. |
| S0-06 — Chuẩn từ app thật | PASS | app/docs/page.tsx dùng DocsPage/DocsBody và có mục tiêu → khái niệm/figure → note → worked steps → warning → self-check/reveal. app/docs/layout.tsx dùng DocsLayout. Contract giữ cấu trúc này, bổ sung nhận diện đề/rubric/event/tự luyện theo yêu cầu người dùng. |
| S0-07 — Event contract | PASS | Contract tách learner event và algorithm event; có before/delta/after, code lines, pointers/call frames, invariant, visual target và prediction/feedback khi phù hợp. Shared state engine, independent Python trace, Previous/Reset, Play/Pause, đổi input và biên/lỗi đều có điều kiện kiểm tra. |
| S0-08 — Không phóng đại hiện trạng | PASS | README ghi theme preview, thiếu import/accounts/grading/progress/search index/publication; root hiện vi/search disabled. Scope và contract ghi rõ bilingual/event là phần phải xây sau, không gọi Action View là arbitrary Python executor hoặc details là bảo mật thi. |
| S0-09 — Nhất quán | PASS | JSON parse thành công; year/language/locales đồng nhất 2026/Python/vi,en. 150 phút/75 điểm/25%/AO3 100% khớp p.11/p.13. Coursebook TOC có 450/490/498/525; Lead chỉ gọi đó là locator mục lục, không claim skill mapping đã xong. |
| S0-10 — Review/gate | A8 COMPLETE; Lead sign-off pending | Review độc lập hiện tại không có lỗi mở. GATE_REVIEW và cập nhật stage_0_gate là thao tác cuối của Lead sau review, không phải dependency vòng buộc A8 từ chối review. |

## Findings và giới hạn đã xử lý đúng

| ID | Severity | Trạng thái | Nội dung |
|---|---|---|---|
| F-01 | None | Không có lỗi nội dung cần sửa | Không phát hiện mâu thuẫn với user choices, scope Paper 4 hoặc chuẩn learning page trong các deliverables được review. |
| N-01 | Informational | Được hoãn đúng stage | Tám SF filename matches còn thiếu; A2 ghi rõ không biết từng QP có thực sự cần SF hay không, RAR chưa mở, report mới kiểm ở cấp file. SCOPE giao xử lý Stage 1, không loại câu hoặc gắn nhãn verified. |
| N-02 | Informational | Được giới hạn đúng | Các trạng thái `not_verified_in_stage_0` trong A2 phản ánh phần việc A2; Lead có evidence bổ sung riêng cho syllabus và TOC. Không đọc baseline A2 như chứng nhận nội dung toàn bộ corpus. |
| N-03 | Informational | Không chặn | Kỳ thi chưa chọn phù hợp full-year 2026 scope; không có timetable hoặc session-specific claims. Python minor/runtime chốt trước Stage 5; không cần runtime logs hoặc mô phỏng hoạt động để PASS Stage 0. |
| N-04 | Informational | Chưa thực hiện stage sau | Contract mô tả deliverable tương lai. Không có claim hoàn thành question index, taxonomy, marking map, lessons hoặc dynamic visuals. Source links vào website được yêu cầu xử lý khi tích hợp thay vì dùng đường dẫn local trên deployed page. |

## Kết luận gửi Lead

Đề nghị Lead ký PASS Stage 0 sau khi ghi checklist/evidence và đồng bộ trạng thái gate. Không cần yêu cầu agent sửa lại nội dung đã review. Các thiếu hụt corpus và runtime đã có chủ sở hữu/stage xử lý, không bị bỏ qua. PASS này chỉ chứng nhận phạm vi và chuẩn sản xuất; không chứng nhận khóa học hoặc Stage 1 đã hoàn thành và không tự cấp lệnh thực hiện Stage 1 trong task hiện tại.
