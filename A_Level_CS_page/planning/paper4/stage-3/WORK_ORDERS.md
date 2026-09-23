# Stage 3 — Work orders và hợp đồng mapping

Lead nhận yêu cầu thực hiện Stage 3: nối dạng bài với coursebook và toàn bộ syllabus trong phạm vi Paper 4 năm 2026, Python console, bài học đủ hai bản VI–EN. Đầu vào là Stage 0–2 đã PASS. Kiểm release Stage 2 trước khi giao việc: 95 artifact và 5 input digest khớp.

## Phân công và quyền ghi file

| Chủ sở hữu | Nhiệm vụ | Đầu ra và vùng ghi |
|---|---|---|
| A2 Source Curator | Đọc sách, xác minh mục và trang in/PDF; chỉ ra phần chỉ hỗ trợ nền tảng hoặc sách không có | `evidence/A2_BOOK_SECTION_INDEX.json`, `A2_BOOK_REVIEW.md`, scripts/renders tiền tố A2/a2 |
| A3 Curriculum Analyst | Kiểm kê nguyên tử toàn bộ 19–20, phân loại phạm vi toàn syllabus, gợi ý liên kết và phần thiếu | `evidence/A3_OBJECTIVE_INVENTORY.json`, `A3_CURRICULUM_REVIEW.md`, scripts/renders A3/a3 |
| A1 Learning Standards | Registry lesson/block/gói học liệu, titles VI–EN, định danh độc lập locale, điểm đến đánh giá | `evidence/A1_LESSON_BLUEPRINT.json`, `A1_LEARNING_REVIEW.md`, files A1/a1 |
| A0 Lead | Đọc nguồn, chốt mọi chain và phạm vi, gộp bản đồ kiến thức/coverage/prerequisite, quyết định gate | Các bàn giao chính và scripts của Lead |
| A8 Independent QA | Sau khi slot trống: kiểm độc lập locators, semantic mapping, coverage, graph và các gap | `evidence/A8_*`, scripts a8_*; không tự ký gate |

Mọi agent giữ Stage 0–2 và repository ở chế độ chỉ đọc. Agent nộp SUBMITTED, Lead/A8 yêu cầu sửa cụ thể rồi kiểm lại; không dùng self-check thay review. Không viết pattern card, lời giải, marking map chi tiết, bài học hoàn chỉnh hoặc app ở Stage 3.

## Hợp đồng học thuật

Chuỗi bắt buộc: **pattern → kỹ năng → knowledge block → nội dung/mục/trang sách → objective syllabus → lesson/block đích**. Mỗi liên kết có lý do hỗ trợ thực sự, không chỉ khớp tên. IDs objective là ID biên tập, không giả thành mã objective chính thức của Cambridge.

- Dẫn sách bằng source ID, chapter/section/subheading và trang PDF + trang in. Khoảng trang cần đủ hẹp để mở đúng kiến thức. Phải đọc nội dung, không chỉ dùng mục lục hoặc công thức offset.
- Tách **hỗ trợ trực tiếp**, **nền tảng/thành phần**, **không có hướng dẫn cụ thể trong sách**. Một phép tổng hợp từ array/loop/string có thể có nền tảng sách rõ nhưng kỹ thuật câu thi vẫn cần thiết kế ở Stage 4–5.
- Mỗi link đến syllabus phân biệt yêu cầu bắt buộc, hiểu biết hỗ trợ, tiên quyết AS, hỗ trợ do corpus hoặc loại khỏi Paper 4. Hashing được xác nhận qua đề không tự trở thành objective hash-table độc lập của 19.1.
- Dictionary ADT không đồng nhất với mọi hash table. In-memory hash không chứng minh đã biết random-file processing. Linked-list remove có tìm node không đồng nghĩa đã có bài kiểm tra độc lập trả kết quả search.
- Phân loại corpus theo **direct / partial / support / absent**, dùng ID câu thật và bằng chứng cụ thể. Có code recursive không tự chứng minh học sinh được đánh giá trace hoặc compiler stack.
- Với mọi objective core/support chưa có bằng chứng đầy đủ, chỉ định knowledge block, lesson và assessment tự biên soạn có brief cụ thể. Đây là kế hoạch sản xuất, không tuyên bố câu hỏi/lời giải đã hoàn thành.
- 2026 loại binary files được cung cấp, không loại random-file capability khỏi 20.2. Graph là hiểu cấu trúc và công dụng, không yêu cầu code graph. Low-level và declarative được ghi excluded.

## Phụ thuộc và gói học liệu

Dependency là quyết định sư phạm có lý do: kiến thức trước cần cho thao tác sau. Phải là DAG, không self-loop, mọi ID tồn tại. Tách prerequisite bắt buộc với related/review link, không biến mọi dạng trong một topic thành phụ thuộc lẫn nhau.

Lesson/block IDs dùng chung VI–EN. Route/anchor là địa chỉ dự kiến cho stage tích hợp, phải ghi `planned`; chưa có nội dung hoặc route chạy thực tế. Mỗi dạng trỏ đúng knowledge block thay vì đầu sách hoặc đầu chương.

## Điều kiện bàn giao

`COVERAGE_MATRIX`, `BOOK_KNOWLEDGE_MAP`, `PREREQUISITE_MAP`, danh sách gói học liệu toàn khóa, gap register, decisions, QA, gate và manifest. Phải đủ 58 pattern, toàn bộ objective trong scope, các mục excluded có lý do; không còn mapping bắt buộc mơ hồ. Chỉ nghiệm thu thiết kế và độ truy vết ở Stage 3; độ sẵn sàng của bài học/assessment vẫn NOT_AUTHORED. Stage 4 chưa bắt đầu cho tới khi user giao tiếp.
