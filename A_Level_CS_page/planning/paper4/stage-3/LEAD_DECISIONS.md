# Quyết định học thuật Stage 3

## Phạm vi của từ “toàn bộ syllabus”

Lead kiểm toàn bộ cấu trúc syllabus 9618 năm 2026 để quyết định phần nào phục vụ Paper 4. Coverage bắt buộc chi tiết là 19.1, 19.2, phần procedural/OOP trong 20.1 và 20.2. Phần AS 9–12 cần thiết được giữ làm cầu nối; 13.2 hỗ trợ file organisation/hashing. Những chương khác có disposition rõ, không biến khóa Paper 4 thành toàn bộ bốn paper.

Syllabus nguồn đã khóa là 2026 Version 2. Lead đọc trực tiếp trang PDF/in 11, 13, 27–33, 37–41, 48; xem ảnh trang 37, 38, 40 để kiểm đúng cột hướng dẫn và ngoại lệ. Dùng nguồn địa phương cùng checksum đã khóa; không tạo tuyên bố mới về đối chiếu byte với máy chủ Cambridge.

## Không đồng nhất các loại coverage

1. **Corpus evidence:** một ý QP/MS thực sự đánh giá năng lực nào; có thể direct, partial, support hoặc absent.
2. **Knowledge/source mapping:** kiến thức giúp thực hiện năng lực, có mục/trang sách và lý do.
3. **Planned curriculum coverage:** đã có lesson/block và brief đánh giá được giao để sản xuất.
4. **Published readiness:** bài học, lời giải, trace, visual và đánh giá đã được viết/kiểm/tích hợp hay chưa.

Stage 3 chỉ nghiệm thu (1)–(3). Mọi học liệu và assessment mới đều NOT_AUTHORED. Không dùng tỷ lệ mapping để báo đã hoàn thành khóa học hoặc chứng minh kết quả học tập.

## Các ranh giới bắt buộc giữ

- **Dictionary và hash:** dictionary ADT có key/value và tính duy nhất của key. Các bài hash có Spare/bucket trong corpus giữ nhãn corpus_support, không tự chứng minh mọi hành vi dictionary. Sách trang in 488–489, mục 19.1.4, trình bày dictionary và Activity 19P; có thể dùng làm căn cứ nhưng cần bài đánh giá riêng cho phần chưa được đề thể hiện.
- **Random file và in-memory hash:** random-file processing vẫn ở 20.2. Đề 2026 không cung cấp binary files không đồng nghĩa bỏ năng lực này. Sách trang in 533–535 mô tả hash-address/SEEK/PUTRECORD/GETRECORD, là nền tảng khái niệm; chọn cơ chế Python và chứng minh code ở Stage 4–5. Không lấy bảng hash trong RAM làm bằng chứng đã biết random file.
- **Sequential organisation và sequential reading:** đọc file từ đầu tới cuối không tự chứng minh biết duy trì thứ tự theo key. Bài thêm record vào file có thứ tự cần điểm đến riêng; sách in 531–533 trình bày khái niệm, không chứng nhận code ví dụ đã đúng.
- **Linked-list search:** code tìm node bên trong RemoveData có thể là bằng chứng một phần. Bài tìm kiếm độc lập phải kiểm cả found/not-found, theo link thay vì scan mảng vật lý, và không thay đổi cấu trúc.
- **ADT composition:** việc cài queue bằng mảng và việc cài một ADT từ một ADT khác là hai yêu cầu liên quan nhưng không thay thế hoàn toàn. Phải có điểm đến minh họa/đánh giá cho composition khi corpus chưa đủ.
- **Đệ quy và trace:** screenshot kết quả của hàm đệ quy không tự là bằng chứng đã đánh giá call/return trace, compiler stack hoặc giải thích lúc đệ quy có lợi. Các khả năng này có block và kiểm tra riêng.
- **Thiết kế class:** cài lại class diagram được đề cho là bằng chứng lập trình OOP; không tự chứng minh thiết kế class độc lập từ một mô tả chưa chia sẵn class/attribute/method.
- **Hiểu biết hỗ trợ:** Big O, điều kiện binary search, ảnh hưởng initial order, graph features và compiler stack có giải thích/đánh giá theo mức cần. Không tạo bài code graph, xóa BST, balancing hay proof complexity thành bắt buộc.
- **Sách không quyết định scope:** multiple inheritance, overloads và destructors có trong sách không tự trở thành đơn vị bắt buộc độc lập trong khóa. Low-level/declarative bị loại khỏi Paper 4 dù nằm trong chương 20.
- **Tổng hợp kỹ thuật:** RLE, split thủ công, routing trường dữ liệu, quy tắc điểm cụ thể và sinh ngẫu nhiên có thể nối tới nhiều kiến thức nền. Mapping phải ghi nền tảng/thành phần và phần cần phát triển theo đề; không nói sách có đúng lời giải mẫu khi chưa có.

## Chất lượng và giới hạn của coursebook

Lead đã đọc nội dung liên quan trong chương 19–20, gồm các trang in 464–471, 481–490, 494, 500–520, 525–537, và kiểm ảnh trang 489 (dictionary/complexity), 515 (containment/constructors), 534 (random files). A2 xác minh thêm phần AS và locator chi tiết.

Các quan sát nguồn cần được giữ khi sản xuất:

- Sách in 487 nói cài binary tree cần objects và recursion. Đây không được chuyển thành yêu cầu chung: corpus có biểu diễn mảng và cách lặp. Liên kết sách chỉ hỗ trợ cấu trúc, không áp đặt cách cài ngoài đề.
- Bảng 19.24, trang in 489, có dòng cú pháp Python trong vùng gắn nhãn Java. Không sao nguyên bảng thành code dạy đã kiểm chứng.
- Pseudocode thêm record sequential ở trang in 532 có cấu trúc control/EOF cần kiểm độc lập. Stage 3 dùng phần này để định vị khái niệm, không phát hành lời giải dựa trên việc code có trong sách.

Không sửa dữ liệu Stage 1 để che các vấn đề này. Căn cứ QP/MS, sách và yêu cầu syllabus giữ vai trò riêng; code và trace cần qua Stage 5.

## Quy tắc bài đánh giá bổ sung

Mỗi capability trong phạm vi có một assessment requirement ID, lesson/block, brief về hành vi quan sát được và điều kiện nghiệm thu sau này. 107 yêu cầu được gom vào các đích bài luyện; không phải 107 bài tập đã viết. Đánh giá ghi `AlgoCore original`, không gắn số điểm Cambridge hoặc giả mã đề chính thức. Có thể ghép nhiều objective vào một bài nếu vẫn truy vết từng objective và đầu ra phải kiểm.

Phần có nguồn lý thuyết nhưng thiếu triển khai Python được ghi là việc sản xuất ở Stage 4–5; không báo thiếu source locator khi locator kiến thức đã có, cũng không báo đã có code chạy được.

## Tiên quyết và địa chỉ nội dung

Dependency là thứ tự học do AlgoCore đề xuất, kèm lý do. Required prerequisite phải là DAG; related/review không tạo rào cản tiến độ. Không bắt học OOP trước cây biểu diễn bằng mảng nếu nhiệm vụ chưa dùng object; có thể chia nhánh và gặp lại ở bài tích hợp.

QA S3-A8-07 phát hiện các đề xuất prerequisite theo objective trong đầu vào A3 quá rộng và thiếu lý do riêng: graph description không đòi vòng lặp/parameter coding, còn ví dụ composition dùng stack/queue không phải backend linked-list đã chọn. Lead loại toàn bộ đồ thị đề xuất này khỏi bản cuối; không gắn nhãn lại để giữ các cạnh thiếu căn cứ. Đồ thị có hiệu lực chỉ gồm 58 cạnh lesson (46 required, 12 review) và 7 nhóm điều kiện block đã đọc, có lý do và kiểm chu trình. Input A3 giữ để minh bạch lịch sử đề xuất; `COVERAGE_MATRIX` không kế thừa các prerequisite bị loại.

Lesson/block IDs độc lập ngôn ngữ; tiêu đề và nội dung VI–EN sau này dùng chung ID. Route và anchor trong registry là planned destination, chưa phải link website đang chạy. Từ mỗi pattern phải mở đúng knowledge block; nguồn sách cần truy về trang cụ thể, không chỉ đầu chương.

Quyết định nghiệm thu cuối và mọi vòng yêu cầu sửa được ghi ở GATE_REVIEW sau QA độc lập. Không mở Stage 4 trong lượt Stage 3 này.
