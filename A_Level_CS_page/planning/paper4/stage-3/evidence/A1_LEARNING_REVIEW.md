# A1 — Bản thiết kế bài học và knowledge blocks cho Stage 3

Trạng thái: **SUBMITTED_FOR_LEAD_REVIEW**. Đây là registry biên tập để Lead nối nguồn sách và syllabus, không phải nội dung khóa học đã được tạo hoặc nghiệm thu. Không thay đổi Stage 0–2 hoặc mã ứng dụng. Không bắt đầu Stage 4.

## Bằng chứng và cách làm

Đã đọc `stage-0/SCOPE.md`, `stage-0/LEARNING_PAGE_CONTRACT.md`, `stage-0/evidence/A1_LEARNING_PAGE_AUDIT.md`; đọc 58 mục của catalog Stage 2 và cấu trúc map 672 ý. Dùng assessed part IDs có sẵn của Stage 2 để giữ đường nối đến QP/MS. A1 không phân loại lại 672 ý và không tuyên bố kiểm tra lại toàn bộ PDF đề thi trong nhiệm vụ này.

Đã đọc lại `algocore-fumadocs/README.md`, `app/docs/page.tsx`, `app/docs/layout.tsx`, `app/layout.tsx`. Baseline vẫn là một bài mẫu Paper 3 tại `/docs`, DocsPage/DocsBody, TOC/sidebar viết tay, hình tĩnh, câu tự kiểm tra với mở lời giải; root/provider đặt `vi`. Chưa có route Paper 4 hoặc bộ nội dung Việt–Anh. Không chạy build/browser vì chỉ tạo tài liệu kế hoạch, không sửa ứng dụng. Không có AGENTS.md áp dụng được tìm thấy trong cây AlgoCoreEduction; các AGENTS được tìm thấy thuộc các dự án khác.

A3 chuyển inventory, sau rà soát có 111 capability IDs, gồm mục core `SYL-19.1-30` cài đặt một ADT bằng ADT khác. Đã đối chiếu danh sách để bổ sung thiết kế lớp, đặc trưng paradigm, lợi ích đệ quy/compiler stack, Big O thời gian và không gian, dictionary bằng ADT khác và các tiên quyết cần thiết. A2 chuyển book section index; việc nối chính xác section/page và độ mạnh của bằng chứng thuộc bước tổng hợp của Lead. Registry này không tự gắn mã syllabus giả hoặc tự nhận một đoạn sách đã bao phủ đầy đủ một objective.

## Đầu ra đề xuất

`A1_LESSON_BLUEPRINT.json` có:

- 26 lesson, 108 knowledge block và 13 package; tất cả có nhãn Việt–Anh.
- 58 canonical pattern destinations, không thiếu hoặc lặp pattern ID.
- 58 cạnh lesson có lý do, tách `required` với `review`. Danh sách prerequisite bắt buộc không chứa cạnh review; graph prerequisite không có chu trình.
- 37 assessment destinations: 26 chuỗi luyện tập theo lesson, 11 kiểm tra khoảng trống hoặc mức độ đầy đủ. Mọi assessment đều `PLANNED_NOT_PRODUCED`; chưa tạo câu hỏi, lời giải hoặc rubric.
- 7 liên kết tiên quyết theo block/biến thể để tránh bắt cả một bài học quá rộng làm tiên quyết. Ví dụ chỉ biến thể RLE dùng queue cần Dequeue; cây lưu bằng mảng không bị buộc học OOP trước.

Course ID `ac-9618-p4-2026-python`. Lesson ID có dạng `ac-9618-p4-2026-python.lesson.stack`; block ID có dạng `ac-9618-p4-2026-python.lesson.stack.knowledge.push`. ID không chứa locale, số trang sách hoặc tên file nguồn, nên thay locator hoặc đổi ngôn ngữ không tạo một kiến thức mới.

Route `/{locale}/docs/paper-4/{lesson-slug}#knowledge-{block-suffix}` chỉ là đề xuất triển khai. Trạng thái ghi rõ `PLANNED_NOT_IMPLEMENTED`; không phải link đã hoạt động. Không đưa đường dẫn local PDF vào website tương lai.

Mỗi package giữ mười slot của contract: nhận diện → dấu hiệu đề → kiến thức → cách giải → ví dụ → Action View → tránh mất điểm → tự luyện → nhớ/làm lại → học tiếp/nguồn. Các slot là checklist sản xuất; chưa có nội dung. Khối kiến thức có thể dùng chung giữa nhiều dạng và được liên kết vào package tương ứng. Registry không ép một trang dài chứa tất cả dạng trong package.

## Quyết định về phạm vi và độ chi tiết

Stack có representation/conventions, push, pop, phối hợp hai stack và reduction riêng. Queue có setup/conventions, enqueue, dequeue, xem không phá hủy và reduction; reduction phân biệt đọc theo chỉ số với Dequeue phá hủy theo đúng câu nguồn. Linked list tách setup/free-list, duyệt, tìm, chèn và xóa/tái sử dụng node. Tìm linked list vẫn có block và assessment dù Stage 2 không có pattern tìm độc lập.

Dictionary có interface, find/insert/update, delete, representation choice và implementation bằng ADT khác. Đây là kế hoạch kiểm tra giao diện đầy đủ để hỗ trợ objective cài đặt dictionary, không tự tuyên bố syllabus liệt kê riêng từng thao tác thành objective độc lập. Hashing có nhãn `corpus_support`, không bị đổi thành một objective bắt buộc riêng của 19.1.

Assessment `gap.adt-abstraction` được sửa thành nhiệm vụ thực thi cụ thể cho `SYL-19.1-30`: dictionary dùng ADT linked list lưu cặp khóa–giá trị, qua giao diện thao tác của linked list. Chỉ dùng mảng built-in hoặc vẽ sơ đồ so sánh không đủ chứng minh mục này. Block `dictionary.other-adt-implementation` có cạnh `required_for_block_variant` với điều kiện backend: chọn linked list thì cần representation/search/insert/remove; chọn tree thì cần representation/search/insert của tree. Không yêu cầu cả hai backend cho cả lesson; kế hoạch assessment chọn linked list, không buộc thêm xóa BST. Assessment trace đệ quy cũng nêu rõ dự đoán độc lập call frames và return values cho `SYL-19.2-04`, không thay bằng ảnh output console.

Random files giữ bài và assessment dù không có fixture binary chính thức trong corpus. Bản ghi cố định, byte offset, binary mode và seek được ghi là lựa chọn triển khai Python dự kiến; không nói syllabus bắt buộc một encoding hoặc độ dài record cụ thể. Fixture tương lai phải mang nhãn tự biên soạn. Array hash table trong đề không được tính là bằng chứng đã xử lý random file.

Exceptions có meaning/need, handling/recovery và cleanup. Corpus đã có exception handling bên trong `FILE_READ_ARRAY`, ví dụ `9618_s25_41_2(a)`; không gắn nhãn hoàn toàn vắng khỏi đề chỉ vì taxonomy không có pattern riêng. `finally` và context manager là lựa chọn triển khai Python, không giả làm tên objective chính thức. Append cũng đã có trong nguồn `9618_s25_41_2(c)`.

Graph chỉ có diagram/characteristics/choice và self-check, không tạo bài bắt buộc code thuật toán graph. Complexity bao gồm time và space cùng so sánh theo số lượng và thứ tự dữ liệu đầu vào; không tự tạo yêu cầu viết bài luận Paper 4. ADT abstraction có kiểm tra khái niệm. RLE có nhãn corpus support và không đồng nhất đếm dãy liên tiếp với đếm tần suất.

OOP giữ class/object/constructor/instance, thiết kế lớp, encapsulation/get/set/update, inheritance/override/polymorphism, containment/aggregation. Không thêm destructor, multiple inheritance hoặc overloading thành mục bắt buộc chỉ vì coursebook có nhắc. Getter và setter không gộp với phép cộng/clamp hoặc output-format.

Check digit dùng phép chia/làm tròn do nguồn quy định: trường hợp s24 dùng floor của tổng trọng số chia 10; modulo chỉ dùng nếu đề yêu cầu. Cây có inorder/postorder theo corpus; không đặt preorder thành nội dung core bắt buộc.

## Các kiểm tra và giới hạn

Script `A1_build_blueprint.py` kiểm tra 58 destination IDs đúng catalog; mọi destination có block; IDs lesson/block duy nhất; prerequisite tồn tại và không chu trình; mọi assessment target tồn tại. Input hash của Stage 0 contract/scope và Stage 2 catalog/map được lưu trong JSON. 672 là số ý được index nguồn cho registry, không phải số ý được A1 đọc lại trực tiếp từ PDF ở Stage 3.

Source mapping trên lesson/block còn ghi `PENDING_LEAD_JOIN_WITH_A2_A3`. Lead cần nối objective IDs, book locators, phần cần bổ sung tự biên soạn và coverage status; đối chiếu đánh giá với từng objective rồi mới chốt coverage. Một block được tag pattern không có nghĩa mọi lần xuất hiện của pattern đều kiểm tra tất cả kiến thức trong block. Chọn example ở stage sau phải giữ constraints và phụ thuộc riêng của từng ý.

Song ngữ ở đây là parity của tên/ID/đích học. Chưa có hai bản toàn bộ nội dung, câu hỏi, hints, rubric, event hay UI. Chưa có code Python kiểm chứng hoặc Action View. Các trạng thái này cần giữ nguyên khi bàn giao để tránh nhầm planning coverage với completed learning content.

Lead đã yêu cầu rework các điểm check digit, queue reduction, tree traversal scope, implementation choices, prerequisite reasons và dependency có điều kiện của ADT dùng ADT khác; bản registry hiện tại đã xử lý. Quyết định gate cuối cùng thuộc Lead và QA độc lập.
