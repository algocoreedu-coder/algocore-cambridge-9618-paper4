# A1 — Yêu cầu đánh giá theo từng capability

Trạng thái: **SUBMITTED_FOR_LEAD_AND_A8_REVIEW**. Đầu ra là `A1_OBJECTIVE_ASSESSMENT_REQUIREMENTS.json`, tái tạo bằng `A1_build_assessment_requirements.py`.

Đã tạo **107 assessment requirements** cho đúng 107 objective không bị loại khỏi inventory A3 gồm 111 mục. Không tạo yêu cầu đánh giá cho bốn mục excluded. Mỗi requirement giữ ID ổn định, objective ID, nhãn capability và task brief Việt–Anh, exact knowledge block IDs từ bảng nối thủ công của Lead, nhóm assessment dự kiến và acceptance checks cụ thể. Có 324 checks, dùng 30 trong 37 assessment groups đã có; các nhóm còn lại vẫn là kế hoạch luyện tập bổ sung, không bị xóa.

Đây là 107 yêu cầu thiết kế đánh giá, **không phải 107 bài tập đã viết**. Không có đề hoàn chỉnh, lời giải, code, fixture hoặc điểm chính thức. Trạng thái từng dòng `PLANNED_NOT_AUTHORED`, origin `AlgoCore original`, `official_marks: null`. Acceptance checks là tiếng Anh dành cho reviewer; rubric đưa đến học sinh ở stage tác giả hóa phải có đầy đủ VI/EN. Các block được nối có thể là nhiều bối cảnh áp dụng của cùng capability, không bắt một câu hỏi đánh giá tất cả chúng đồng thời.

Các mục observed có nhiệm vụ chuyển giao và kiểm tra biên, không chỉ gọi lại screenshot đề cũ. Các mục absent/partial/support có yêu cầu biểu hiện năng lực riêng. Những ranh giới được đọc kiểm lại:

- `SYL-19.1-30`: dictionary dùng named linked-list ADT qua interface thành phần; phải có thực thi cùng call trace. Mảng built-in đơn thuần hoặc sơ đồ so sánh không đủ. Không bắt queue bằng hai stack, không thêm yêu cầu xóa BST.
- `SYL-19.2-04`: dự đoán độc lập call frames, local state, pending work và return theo đúng thứ tự; ảnh output cuối không thay thế trace.
- `SYL-20.1-18`: tự thiết kế class/attribute/method/relationship từ tình huống chưa có class diagram, giải thích trước code; không lấy hoàn thành constructor có sẵn làm bằng chứng thiết kế độc lập.
- `SYL-11.2-04`: chọn và giải thích vòng lặp phù hợp dựa trên số lần lặp đã biết hay chưa và có cho phép không chạy lần nào hay không; đối chiếu post-condition với pre-condition/count-controlled trong tình huống cụ thể. Sau đó thể hiện hành vi ít nhất một lần rồi kiểm tra dừng bằng Python hợp lệ; không bịa keyword post-condition loop.
- `SYL-11.3-02`: phân biệt mutation của object được chia sẻ với rebinding tham số cục bộ; không tuyên bố Python có tùy chọn by-reference hoặc đơn giản đồng nhất nó với by-value/by-reference.
- Graph là diagram/giải thích lựa chọn, không đòi code. Complexity tách thời gian, không gian, case và mô hình đếm; không dùng một thời gian chạy để chứng minh Big O.
- Random files yêu cầu tệp bền vững thật cùng kiểm tra record không bị tác động; hash array không đủ. File organisation được phân biệt với access method. Append giữ dữ liệu cũ và record boundary.
- `SYL-13.2-03`: giải thích ánh xạ khóa → địa chỉ, nguyên nhân va chạm giữa các khóa khác nhau và tính nhất quán của địa chỉ cho cùng khóa dưới hàm xác định không đổi; sau đó mới tính/chèn/tìm theo phương án va chạm được chỉ định. Không dùng khả năng tính địa chỉ để thay cho yêu cầu giải thích hashing.
- Exception handling chọn ranh giới/phục hồi có lý do, không nuốt mọi lỗi; encapsulation dùng thuật ngữ Python chính xác.

Script kiểm tra tập IDs khớp toàn bộ 107 mục non-excluded, không duplicate, mọi knowledge block và mọi assessment group chính/phụ tồn tại, mỗi mục có ít nhất hai acceptance checks. Input hashes của A3 inventory, A1 blueprint và `scripts/lead_objective_links.py` được lưu để Lead theo dõi khi freeze. Nếu các input đổi trước release, cần chạy lại builder và kiểm tra phần nghĩa bị ảnh hưởng.

Lead và A8 cần nghiệm thu nội dung các yêu cầu này trong tổng hợp Stage 3; bản ghi tự kiểm tra không thay cho gate độc lập.

Rework theo A8: đã cập nhật task brief VI/EN và acceptance checks của đúng hai mục `SYL-11.2-04`, `SYL-13.2-03`; rebuild giữ đủ 107 mục, thêm năm checks, tổng 324. Không đổi lesson blueprint hoặc các nguồn Stage 0–2.
