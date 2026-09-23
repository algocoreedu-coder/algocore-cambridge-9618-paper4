# Chuẩn learning page Paper 4 — v1.0.0

Áp dụng: syllabus 2026, Python, VI/EN. Chủ sở hữu A0; audit nguồn A1 trong evidence/A1_LEARNING_PAGE_AUDIT.md. Các tiêu chí dưới đây là contract cho sản phẩm tương lai, chưa phải tuyên bố app hiện có đã đạt.

## Baseline đã quan sát

Repo có mẫu TSX một bài Paper 3 tại `/docs`; DocsLayout/DocsPage/DocsBody; mục tiêu, khái niệm, diagram tại chỗ, điểm nhớ, worked steps, warning và practice có mở lời giải. README ghi không PDF import/accounts/grading/progress/search index/deployment. Root hiện cố định `html lang=vi` và provider locale vi. Theme tập trung trong styles/algocore-theme.css, có light/dark, sidebar navy và focus ring.

Đây là baseline giao diện và trải nghiệm. Phần source mapping, Python examples, bilingual content và event modules là yêu cầu bổ sung đã được người dùng giao, cần xây trong stage sau.

## Cấu trúc một gói dạng bài

| Thứ tự | Khối bắt buộc | Yêu cầu kiểm tra |
|---|---|---|
| 1 | Nhận diện bài | Paper/năm/skill IDs, title, mô tả, mục tiêu quan sát được, tiên quyết |
| 2 | Dấu hiệu dạng đề | Dữ kiện, yêu cầu đầu ra, command words, dạng gần giống, locator QP/MS |
| 3 | Kiến thức cần biết | Khái niệm và coursebook section/page; giải thích ngắn và minh họa tại chỗ |
| 4 | Cách giải | Các bước và lý do, điều kiện áp dụng, dữ liệu/biến/invariants |
| 5 | Worked example | Requirement → thiết kế → Python → trace → output/test → evidence |
| 6 | Action View | Các event có ý nghĩa, cùng dữ liệu với ví dụ, Predict/Next/Previous/Play/Pause/Reset/change input |
| 7 | Tránh mất điểm | QP requirement ↔ MS marking point ↔ bước giải ↔ lỗi ↔ cách kiểm tra/sửa |
| 8 | Tự luyện | Guided → giảm gợi ý → independent; câu biến thể, feedback và rubric |
| 9 | Nhớ và làm lại | Recap, câu nhớ lại khi ẩn đáp án, sửa trace sai, tự viết từ đầu, bài trộn dạng |
| 10 | Học tiếp | Link đúng phần cần ôn, bài tương tự, nguồn và trạng thái phiên bản |

Các khối có thể nằm trong các trang liên kết thay vì kéo thành một trang dài, nhưng gói bắt buộc đủ và liên kết tới đúng block. Action View bắt buộc cho quá trình thay đổi trạng thái; mục tĩnh dùng diagram/so sánh/self-check có mục đích rõ. Không tạo animation trang trí.

## Dữ liệu và bằng chứng

Gói nội dung cần IDs ổn định và version cho course/lesson/block/objective/pattern/example/question/solution/rubric/asset/event. Mỗi source locator phân biệt năm-kỳ-component-variant-câu/ý, trang PDF và trang in. Local source path không được đưa nguyên vào href của website deployed; nguồn phải có cơ chế truy cập/link được kiểm chứng ở stage tích hợp.

Syllabus code và book chapter là hai trường riêng. Mỗi marking point dẫn đúng MS hoặc được ghi là rubric tự biên soạn; không gắn nhãn chính thức cho suy luận. Original exam-style có nhãn riêng. Code chạy đúng chưa đủ chứng minh đủ điểm.

Ở Stage 0 chỉ khóa hợp đồng logic. A1/A7 sẽ chọn cách serialize/render từ mẫu TSX ở stage triển khai trước nhân rộng; không coi đã có MDX/schema pipeline trong repo.

## Song ngữ đầy đủ

- Cùng IDs/version, example data và event trace cho cả vi/en. Không tạo hai bản code nguồn có logic khác nhau.
- Toàn bộ khối tự biên soạn và thông điệp UI của khóa có VI/EN, gồm hình/hint/rubric explanations/feedback/Predict/recap.
- Thuật ngữ tiếng Anh giữ nhất quán bằng glossary, có giải nghĩa Việt. Giữ identifiers và chuỗi chính thức theo QP nếu yêu cầu.
- Locale-aware html lang, provider labels, navigation, titles và content. Không chỉ dịch thân bài.
- Đổi ngôn ngữ giữ lesson/block/example và trạng thái thao tác phù hợp; không nhảy sang ví dụ khác.
- Bản gốc QP/MS giữ English; hỗ trợ VI phân biệt rõ với nguồn chính thức.
- Kiểm tra parity theo block IDs và version; thiếu bất kỳ bản bắt buộc nào thì chưa PASS gói bilingual.

## Event contract

Event điều khiển người học tách khỏi event thuật toán. Event thuật toán có id/type, example version, code lines, precondition, before/delta/after state, pointers/call frames, invariant, explanation, visual targets và prediction/feedback nếu áp dụng. Source/marking refs chỉ gắn khi thực sự liên quan.

Diagram, trace, code highlight, biến và output dùng cùng state engine. Before/after được đối chiếu với lời giải Python chạy độc lập. Previous/Reset phục hồi đúng state; Play không bỏ event, đổi input reset trace phù hợp. Trường hợp biên và nhánh lỗi phải có evidence. Mô phỏng không thay cho chạy code Python trong bài thực hành.

## Visual, brand và khả năng sử dụng

- Dùng token và logo gốc; màu navy/teal/orange của AlgoCore, không rải hard-coded colors mới ở từng bài.
- Code text selectable, bảng có header, diagram rõ index/nhãn/mũi tên; dùng nhãn/hình dạng cùng màu để truyền nghĩa.
- Hình có caption/alt và block ID; không để asset chỉ ở folder hoặc tạo menu gallery.
- Đồng bộ state mới highlight; phân biệt đọc, ghi, gán, di chuyển pointer, copy, swap, đổi link, call/return.
- Có câu hỏi dự đoán, ví dụ đúng/sai, so sánh biến thể và giảm gợi ý để học sinh tự tái tạo cách giải.
- Desktop/mobile, light/dark, bàn phím/focus, reduced-motion và bước tĩnh đều phải kiểm tra khi module tồn tại.
- Chỉ code/bảng rộng cuộn trong vùng riêng; chữ/controls không tràn hoặc nhỏ không đọc được.

## Kiểm tra và nghiệm thu

Mỗi gói cần review học thuật, run logs Python, trace/event checks độc lập, bilingual parity, nguồn và visual QA. Khi tích hợp chạy npm run typecheck, npm run build và kiểm tra UI thực tế. Build đạt không thay cho kiểm tra nội dung.

Practice có thể dùng lời giải mở sau khi tự thử. Timed practice ở stage cuối phải giữ đáp án tách khỏi luồng làm bài và nêu rõ giới hạn bảo vệ nếu chỉ là local/static UI; không quảng bá details/collapsible là bảo mật bài thi.

Lead chỉ PASS khi toàn bộ tiêu chí bắt buộc áp dụng đều có evidence. Finding cụ thể phải được sửa và kiểm tra lại trước chuyển stage.
