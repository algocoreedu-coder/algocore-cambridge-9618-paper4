# Quyết định của Lead — Stage 0

| ID | Quyết định | Căn cứ | Tác động |
|---|---|---|---|
| D01 | 2026, Python, toàn bộ VI/EN | User trả lời trong task hiện tại | Khóa COURSE_SETTINGS và contract |
| D02 | Áp dụng syllabus 2026 v2 | Lead trích/đọc PDF gốc; A3 đối chiếu | Không dùng map2027–2029 cũ để kết luận scope |
| D03 | Không chờ kỳ thi cụ thể để khóa syllabus cả năm | User chọn năm, yêu cầu toàn bộ Paper4 | Không có lịch thi/session-specific claims; kỳ thi là open item không chặn |
| D04 | Giữ Fumadocs app và Paper3 sample | User target repo + source audit | Phần Paper4 mới tích hợp trong cùng nền; không viết website khác |
| D05 | Học liệu song ngữ chia sẻ code/data/event IDs | User full VI/EN + consistency requirement | Runtime locale-aware là việc cần xây, chưa có sẵn |
| D06 | Phân biệt ADT supporting theory, graph no-code và hashing ngoài19–20 | Syllabus37–38 và A3 | Không lấy nội dung có slide cũ làm danh mục bắt buộc |
| D07 | Bao phủ file processing đầy đủ; source không binary không có nghĩa bỏ random files | Syllabus38/40 | Stage3/4 xác định ví dụ/cách xử lý, không thu hẹp sai scope |
| D08 | Corpus là toàn bộ Paper4 local2021–2025 hiện có | BaselineA2 | Đề mới bổ sung phải version manifest, không giả định đã có2026 |
| D09 | Runtime Python minor xác nhận trước chạy lời giải | User chỉ chọn Python | Không giả lập yêu cầu version của Cambridge; Stage5 phải ghi runtime thật |
| D10 | Stage0 không sửa app hoặc chạy Stage1 | User yêu cầu Stage0 | Bàn giao scope/contract/settings/evidence và gate; chỉ kiểm tra tài liệu hiện tại |

## Vấn đề mở không chặn Stage 0

- Kỳ thi, lịch học, trình độ đầu vào: cần cho lịch/nhịp ôn sau, không thay mục tiêu full syllabus.
- Môi trường Python của trung tâm: xác minh trước run compatibility/thi thử, không cần để định nghĩa contract ngôn ngữ.
- SF chưa tìm thấy: Stage1 xác định dependency và tìm đúng nguồn; không làm mất câu khỏi corpus.
- Serialization/routing chi tiết: A1/A7 thiết kế theo contract ở stage triển khai; chưa có MDX pipeline để tái sử dụng.

Không mục nào ở trên được dùng làm lý do bỏ yêu cầu bắt buộc hoặc tự tuyên bố stage sau đã PASS.
