# Chuẩn learning page — Paper 1, 2026, đầy đủ VI/EN

Version 1.0.0. Owner A0. Ngày 19/09/2026. Bản tích hợp để A9 review; quyết định hiệu lực tại GATE_REVIEW. Contract cho sản phẩm tương lai, không khẳng định app đã có các chức năng này.

Nguồn thiết kế: [audit A1](evidence/a1/LEARNING_PAGE_AUDIT.md), [proposal A1 v1.0](evidence/a1/CONTRACT_PROPOSAL.md), cấu hình người dùng và phạm vi A3 trong [scope](SCOPE_AND_COVERAGE_PLAN.md). Bảng/schema/chi tiết kiểm tra của proposal A1 v1.0 được nhận làm phụ lục kỹ thuật của contract; nếu khác nhau, cấu hình và quyết định scope 2026 trong bộ tích hợp này được ưu tiên.

## Baseline được giữ

Giữ DocsLayout/DocsPage/DocsBody, logo hiện có, token tập trung tại `styles/algocore-theme.css`, theme sáng/tối và cấu trúc mục tiêu → hiểu khái niệm → hình tại chỗ → điểm nhớ → ví dụ từng bước → tránh nhầm → tự làm rồi mở lời giải. Giữ sample Paper3 có thể truy cập khi thêm route Paper1 ở stage sau.

Sample hiện là một bài TSX Paper3, nav/TOC viết tay, locale vi, không có lesson source/rubric mapping hoặc pipeline nội dung. Không coi CSS responsive/focus là kết quả accessibility QA; không gọi `<details>` là bảo mật đề hoặc chấm tự động. Build/browser/VIEN UI chưa kiểm trong Stage0.

## Các chức năng bắt buộc của gói bài

| ID | Chức năng | Tiêu chí nội dung |
|---|---|---|
| B01 | Nhận diện và định hướng | Paper1/2026/topic, tiêu đề, mô tả, mục tiêu quan sát được; tiên quyết có link hoặc ghi không có |
| B02 | Hiểu khái niệm | Giải thích có nguồn; thuật ngữ Anh–Việt; hình/bảng/ví dụ đặt ngay chỗ cần hiểu |
| B03 | Nhớ quy tắc | Định nghĩa, điều kiện, quy ước, đơn vị, giới hạn; không đưa mẹo phổ quát sai |
| B04 | Nhận diện yêu cầu đề | Command word, dữ kiện, sản phẩm cần trả lời và dạng dễ nhầm; có QP hoặc nhãn tự soạn |
| B05 | Ví dụ từng bước | Đọc yêu cầu → chọn phương pháp → thực hiện kèm lý do → kiểm kết quả; kiểm độc lập đáp án |
| B06 | Thể hiện đủ ý được chấm | Map requirement → evidence/marking point → bước trả lời; so câu thiếu và câu sửa khi có ích |
| B07 | Phát hiện và sửa lỗi | Lỗi cụ thể, cách nhận ra, sửa và kiểm lại; không giả nhận xét examiner |
| B08 | Luyện tập giảm gợi ý | Guided → faded → independent trong package; đề xuất hiện trước lời giải; số câu theo mục tiêu |
| B09 | Tự đối chiếu | Đáp án, lý do, điều kiện/alternative answers, MS chính thức hoặc rubric AlgoCore đúng nhãn |
| B10 | Nhớ lại và học tiếp | Retrieval, recap, bài trộn phù hợp, link học tiếp/ôn lại; không giả trạng thái lưu tiến độ |
| B11 | Truy nguồn | Source IDs và locator tới sách/syllabus/QP/MS; phần học viên thấy ngắn, đọc được, link đúng |

Cho phép gộp chức năng trong một block hoặc chia gói qua nhiều trang, nhưng mapping B01–B11 phải rõ và đầy đủ. Không tạo trang dài bằng cách lặp block vô nghĩa. Metadata reviewer/version nằm trong manifest nội bộ, không chen vào trải nghiệm học nếu không cần.

## Dữ liệu, phạm vi và bằng chứng

- IDs ổn định cho course/objective/lesson/block/question/solution/marking_point/visual/review. Localized record là cặp content_id+locale, cùng content version. Schema logic chi tiết theo proposal A1; storage/renderer do A1/A8 chốt ở pilot, chưa có MDX pipeline để mặc định tái dùng.
- Mỗi objective tách mã syllabus chính thức và ID nội bộ cho từng yêu cầu/nhóm yêu cầu; source locator phải cho phép đọc lại đúng bullet và notes. Required/supporting/out-of-scope được lưu, không đổi nhãn bổ trợ thành yêu cầu chính thức.
- Phân biệt exam_year với syllabus_year; source kind, version/edition/hash và mức verified; trang PDF một-based khác trang in. Câu thi giữ year/session/component/variant/question/part và dependency.
- `origin=official/adapted/original`; `claim_kind=official_marking_requirement/algocore_guidance`. Adapted giữ parent locator và thay đổi; tự kiểm đáp án mới. Original không dùng MS của câu tương tự làm đáp án chính thức.
- Mỗi marking point chính thức phải có MS locator, điều kiện, alternative answers và solution-step refs; không tự suy một câu văn bằng một điểm. Không cộng trùng điểm parent/child; gộp variant chỉ sau so nội dung.
- Claim thiếu nguồn bắt buộc hoặc lời giải chưa kiểm thì giữ draft, không ACCEPTED. Tài liệu có chữ “approved/final” vẫn phải audit. Không dự đoán đề từ tần suất lịch sử.
- Syllabus quyết định phân loại scope. Cụ thể check digit thuộc validation theo §6.2 năm2026, dù sách đặt trong verification; không sao chép phân loại sách vào bài. Tính dung lượng bitmap là core pilot1; tính dung lượng âm thanh là application hỗ trợ có nhãn. Quyết định và locator tại scope/A3.
- Citation hiện nguồn và locator rõ. Href trên web chỉ dùng cơ chế truy cập đã kiểm; không đưa `D:/...` vào website phát hành. Nguồn chưa có cách mở được thì hiển thị bibliographic locator trung thực thay link hỏng.

## Đầy đủ hai ngôn ngữ

VI và EN phải đủ B01–B11, bài tập, lời giải, hints, feedback, caption/alt, điều hướng và controls. Bản Việt không chỉ là vài chú thích. Dùng cùng IDs, dữ kiện, đơn vị, ràng buộc, đáp án, marks và nguồn; glossary giữ đúng command word tiếng Anh và ý nghĩa Việt.

QP/MS gốc giữ tiếng Anh; bản Việt ghi là bản dịch/diễn giải AlgoCore, không gắn wording dịch là chính thức. Luyện điều kiện thi có thể hiện prompt Anh riêng nhưng vẫn có lời giải/giải thích đầy đủ VI/EN.

Đổi locale phải đến cùng bài/block tương đương; html lang/provider/metadata/TOC/sidebar theo locale thật. Với stateful visual, giữ state tương đương khi an toàn, hoặc reset minh bạch với thông báo hai ngôn ngữ. Parity kiểm cả ID/version và ý nghĩa, không chỉ đếm file/block. Thiếu locale bắt buộc chặn nghiệm thu gói.

## Tương tác, hình và điều hướng

Đề hiển thị trước; hint và solution mở riêng khi có hint, mặc định đóng ở lượt luyện mới. Có thể dùng native details/summary sau kiểm keyboard/focus/open state. Không cần tài khoản để tự làm và đối chiếu.

Figure/table phải có nhãn, đơn vị, chiều hoặc state liên quan, caption/alt hay văn bản tương đương; không mã hóa ý nghĩa chỉ bằng màu. Dùng theme tokens, không mỗi tác giả tự thêm palette.

A7 chỉ đề xuất mô phỏng khi hỗ trợ mục tiêu quan sát. Nếu có: initial state, input, transitions, reset và kết quả phải khớp ví dụ đã duyệt; có fixture/expected result kiểm độc lập, controls VI/EN, keyboard, chế độ step/pause và reduced-motion/static alternative phù hợp. Không áp compulsory Python runner/Action View Paper4. Riêng FDE phải duyệt model/trace trước khi tạo animation, không coi một vị trí PC increment trong hình sách là thứ tự duy nhất.

TOC và sidebar phải map đúng IDs/routes; next/prerequisite cùng locale; không mang metadata Paper3/Unit13 hoặc số phút mẫu sang mọi bài. Thời lượng chỉ ghi khi có cơ sở.

## Nghiệm thu

Stage0 kiểm contract khả thi và tách baseline/extension. Stage1–2 kiểm nguồn và mapping; Stage3 kiểm kiến thức/đáp án/mark/parity/storyboard; Stage4 kiểm app thật. Stage4 bắt buộc build/typecheck có log/revision và browser QA desktop/hẹp/zoom, sáng/tối, VI/EN, keyboard/focus, disclosure, route/anchor/link, overflow và contrast. Build thành công không thay kiểm học thuật hoặc browser.

Review độc lập có hiệu lực theo artifact version; Critical/Major phải đóng và retest trước ACCEPTED. Thay đổi số liệu/đáp án/source mapping làm review liên quan stale và mở lại các phần phụ thuộc. Tiêu chí chi tiết tại [DoD](DEFINITION_OF_DONE.md).
