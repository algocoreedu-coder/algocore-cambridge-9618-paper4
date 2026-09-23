# Stage 0 — Phạm vi khóa Paper 4

Phiên bản 1.0.0, 19/09/2026. Chủ sở hữu: A0 Lead. Trạng thái nghiệm thu được ghi riêng trong GATE_REVIEW.md.

## Quyết định đã khóa

Người dùng xác nhận trực tiếp trong task: **năm thi 2026, Python, toàn bộ bài học hai bản Việt–Anh**. Khóa học là Cambridge 9618 Paper 4, thực hành Python console. Syllabus áp dụng là bản 2026 Version 2; không dùng bản đồ 2027–2029 cũ làm căn cứ cuối cùng.

Kỳ thi cụ thể chưa được cung cấp. Lead khóa phạm vi toàn năm 2026, không lập lịch thi hoặc công bố thông tin theo kỳ. Kỳ thi, thời khóa biểu và trình độ đầu vào không chặn việc khóa phạm vi toàn syllabus. Phiên bản Python 3 thực thi sẽ được ghi trước Stage 5; yêu cầu môi trường trung tâm thi cần đối chiếu trước hướng dẫn thi thử cuối.

## Kết quả phải bàn giao cho toàn khóa

Mọi kiến thức bắt buộc có bài song ngữ, ví dụ Python kiểm chứng được và bài đánh giá; mọi dạng được xác nhận qua corpus có dấu hiệu nhận diện, liên kết coursebook, phương pháp giải, marking map, lỗi và cách sửa. Quá trình thay đổi trạng thái có Action View theo event để học sinh dự đoán, quan sát và thử dữ liệu mới. Các gói này phải tích hợp trong `A_Level_CS_page/algocore-fumadocs` và đi hết chu trình học → làm → đối chiếu → sửa → làm lại độc lập.

Stage 0 khóa phạm vi và chuẩn. Không tuyên bố đã phân tích toàn bộ đề, đã mapping từng câu về trang sách, đã tạo lesson hoặc đã có mô phỏng hoạt động.

## Ranh giới học thuật

Căn cứ trực tiếp: syllabus local, trang 11, 13, 37–40; bản trích xuất và ảnh trang trong evidence. Paper 4 kiểm tra ứng dụng thực hành mục 19–20, loại low-level và declarative programming. Thời lượng 150 phút, 75 điểm, 25% A Level; AO3 100%.

| Nhóm | Nội dung được khóa ở cấp phạm vi | Cách xử lý |
|---|---|---|
| 19.1 — Searching/sorting | Linear/binary search, điều kiện binary search; bubble/insertion sort | Bài Python, trace, input thường/biên; phương pháp và ràng buộc chi tiết theo câu thi |
| 19.1 — ADT | Stack, queue, linked list, dictionary, binary tree; các thao tác và cài đặt theo syllabus | Tách rõ tìm/chèn/xóa được yêu cầu cho từng cấu trúc; không suy diễn xóa binary tree hoặc code graph là bắt buộc |
| 19.2 — Recursion | Thiết kế và trace đệ quy, base case, recursive case, stack và unwinding | Đồng bộ Python–call stack–giá trị trả về; nhấn mạnh điều kiện dừng |
| 20.1 — Procedural/OOP | Biến, constructs, procedures/functions; classes, attributes, methods, inheritance, polymorphism, aggregation, encapsulation, getters/setters, instances | Dạy cài đặt Python đáp ứng yêu cầu, không chỉ định nghĩa thuật ngữ |
| 20.2 — Files/exceptions | Read/write/append/close, records, serial/sequential/random file processing, exceptions | Không bỏ random files vì source files cung cấp không có binary; chọn cài đặt theo mục tiêu và câu cụ thể |
| Kiến thức hỗ trợ trong 19–20 | Điều kiện và hiệu năng thuật toán, Big O, ADT abstraction; graph characteristics | Giải thích để hiểu lựa chọn thực hành; graph không yêu cầu viết code theo trang 37. Không tự tạo bài graph algorithms hoặc bài thi tự luận Big O như core Paper 4 |
| Tiên quyết | Các phần AS 9–12 cần cho thực hành: thuật toán, dữ liệu, programming, testing; 11.3 được syllabus nhắc trực tiếp | Ôn đúng phần cần, không biến thành khóa Paper 2 riêng |
| Hỗ trợ có điều kiện | Hashing/hash tables và kiến thức khác ngoài mục 19–20 khi cần giải thích dictionary/random access hoặc câu nguồn | Gắn nhãn hỗ trợ; chưa tự tuyên bố hash tables là mục bắt buộc độc lập của 19.1 chỉ vì có slide cũ |
| Ngoài phạm vi core | Low-level, declarative; toàn bộ Paper 1/3; graph code; thuật toán nâng cao không có căn cứ | Không dùng để tăng số bài hoặc thay phần bắt buộc |

Bảng này là phân ranh giới, chưa thay thế objective inventory chi tiết và mapping Stage 3. Mỗi nội dung còn có câu hỏi áp dụng phải được giải quyết bằng QP/MS và syllabus, không tự suy ra từ tên topic.

## Corpus và coursebook

Corpus cố định ban đầu: mọi đề Paper 4 hiện có trong `Past_Papers`, năm 2021–2025, các variant 41/42/43 thực có; QP/MS, SF và examiner reports đi kèm. Không chỉ chọn variant 42 hoặc các dạng xuất hiện nhiều. Chi tiết từng mã nằm trong evidence/A2_SOURCE_BASELINE.json.

Coursebook chính là file `dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf`, 576 trang PDF. Lead đã trích mục lục trực tiếp: chương 19 bắt đầu trang in 450, 19.2 trang 490, chương 20 trang 498, 20.2 trang 525. Đó là locator cấp mục lục; mapping từng kiến thức đến nội dung sách được thực hiện Stage 3. Các học liệu AlgoCore cũ là nguồn tái sử dụng cần audit, không mặc nhiên đã đạt.

Đề lịch sử được đối chiếu sự phù hợp với năm 2026 trước khi dùng. Stage 1 phải xử lý SF thiếu hoặc chứng minh câu không phụ thuộc SF; không thay dữ liệu giả dưới tên nguồn chính thức. Nguồn chưa có không được tính verified.

## Phạm vi website và thực hành

Giữ nền Fumadocs, theme AlgoCore và bài Paper 3 mẫu. Tạo nội dung Paper 4 riêng, bilingual rendering và component dùng lại trong các stage triển khai. Giữ code dạng text, hình trong đúng bài, trace và event cùng dữ liệu.

Thực hành Python bằng chương trình/file có thể chạy trong IDE console, có fixtures và hướng dẫn đối chiếu. Dynamic Action View minh họa trạng thái đã kiểm chứng, không được quảng bá thành môi trường thực thi Python tùy ý. Chấm server, tài khoản, lưu tiến độ, deployment và dịch vụ chạy code không thuộc gói được khóa ở đây. Nếu cần, phải mở workstream riêng, không dùng chúng để trì hoãn học liệu cốt lõi.

Tìm kiếm nội dung có thể bổ sung khi đã có index trong stage tích hợp; hiện bị tắt. Các đường dẫn bài/anchor và điều hướng khóa học là bắt buộc. Không tạo menu Visual Library.

## Song ngữ

Mọi bài, mục tiêu, lời giải thích, hint, feedback, recap, caption, visual labels, event explanations và teacher notes nếu được tạo phải có VI/EN. Dùng chung lesson/block/example/question/event IDs và content version. Code, input/output, identifiers và dữ liệu chính thức giữ đúng nguồn; không đổi chúng khi dịch. Giữ QP/MS gốc tiếng Anh; bản dịch hoặc diễn giải tiếng Việt phải gắn nhãn hỗ trợ học tập của AlgoCore.

Đổi locale phải giữ đúng bài/ví dụ/trạng thái mô phỏng và câu trả lời cục bộ nếu có. Không fallback một phần rồi báo đã hoàn tất song ngữ.

## Phê duyệt và thay đổi

Lead nghiệm thu từng stage bằng evidence; chưa đạt thì giao sửa và kiểm tra lại. Sửa phạm vi, năm, ngôn ngữ hoặc tiêu chí bắt buộc cần ghi decision mới, tăng version và xác định output bị ảnh hưởng. Kết thúc Stage 0 không tự thực hiện Stage 1 trong task hiện tại.
