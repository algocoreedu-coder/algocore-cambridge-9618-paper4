# Quyết định phân loại của Lead — Stage 2

Phạm vi: Cambridge 9618 Paper 4, đích thi 2026, Python console, các bài học sau này có đủ hai bản Việt–Anh. Taxonomy này dựa trên corpus Stage 1 đã khóa: 29 QP/MS, 87 câu, 672 ý có điểm. Không coi các bài đã xuất hiện là toàn bộ syllabus 2026.

## Cách Lead kiểm và chốt

Lead đọc playbook, khóa đầu vào Stage 1 bằng kiểm tra release, giao A3 phân tích hai lô 2021–2022 và 2023–2024, tự phân loại toàn bộ lô 2025. Lead đọc toàn bộ bảng phân loại của các nhóm đề đại diện cùng mô tả tiêu chí MS; dùng kiểm tra tương đương để đối chiếu các bản variant nhưng vẫn giữ từng ID đề. Các trường hợp mơ hồ được đọc lại QP/MS và facsimile; ghi chi tiết ở ba batch REVIEW và các báo cáo A2/A3/A8.

A8 đọc độc lập các ranh giới khó, kiểm tính nhất quán toàn bộ 672 dòng và tự tính thống kê. Agent phân loại chỉ nộp SUBMITTED; Lead yêu cầu sửa rồi A8 kiểm lại. Trạng thái chốt cuối nằm ở GATE_REVIEW.md, không suy từ self-check của một agent.

## Mô hình phân loại

- **Chủ đề:** stack, queue, OOP, file, sorting… chỉ là nhóm kiến thức rộng.
- **Kỹ năng:** so sánh, cập nhật con trỏ, phân tích bản ghi, ghép lời gọi… Một kỹ năng có thể xuất hiện trong nhiều dạng. `skill_tags` là chỉ mục kỹ năng cốt lõi, không phải rubric đầy đủ; `analyst_skill_tags`, mô tả MS và biến thể giữ chi tiết. `candidate_skill_ids` trong catalog là kỹ năng có thể áp dụng tùy ý, không tự động gán tất cả cho mọi ý.
- **Dạng bài:** thao tác mới cần thực hiện, có dấu hiệu nhận diện và ranh giới hành vi rõ. 58 ID đều có ít nhất một ý đánh giá trực tiếp.
- **Biến thể:** cách biểu diễn, quy ước con trỏ, chiều sắp, dữ liệu, điều kiện biên hoặc hình thức lặp/đệ quy. Không tạo ID mới chỉ vì đổi tên biến, sức chứa hay bối cảnh truyện.
- **Task mode:** đầu ra/nhiệm vụ được giao. `output` vẫn có thể yêu cầu viết mới PrintArray hoặc hàm tạo chuỗi; `adapt` sửa routine có sẵn; `mixed` kết hợp nhiệm vụ. Mode không dùng để kết luận “có viết code hay không”.

## Quy tắc primary, co-tag và context

Mỗi ý có đúng một primary để cộng toàn bộ điểm ý đó đúng một lần. Primary là lựa chọn biên tập theo thao tác đặc trưng hoặc yêu cầu chính, không phải cách Cambridge chia điểm kỹ năng. Một ý nhiều việc có thể có nhiều `assessed_pattern_ids`; mọi điểm của các ý chứa dạng chỉ là **whole-part marks**, không cộng giữa các dạng.

Lời gọi Push, Dequeue, AddNode hoặc getter đã có thuộc context. Chỉ thêm assessed khi chính ý yêu cầu viết/đổi thao tác đó. Ý chỉ chụp kết quả có primary EVIDENCE_RUN; ý có cả lời gọi mới và ảnh có thể có co-tag MAIN_FLOW. Không gán thuật toán đang kiểm thử thành cài đặt mới.

Một dòng print kết quả scalar thông thường không tự sinh OUTPUT_FORMAT. Một câu mẫu với nhiều trường, một bảng/lưới hay yêu cầu duyệt để tạo chuỗi có tiêu chí riêng được co-tag. Chẳng hạn s23/41–43 `1(d)(i)` phải tạo câu có cả giá trị tìm và số lần xuất hiện; MS có criterion message riêng nên giữ OUTPUT_FORMAT.

Chỉ thêm DATA_STORAGE khi khai báo/khởi tạo mảng hoặc dữ liệu là yêu cầu được chấm rõ, không vì code có biến tạm. Chỉ thêm OOP_INSTANTIATE khi tạo instance thực sự: đọc file để cập nhật Employee hiện có không tạo instance mới. Với cấu trúc ADT, setup chuyên biệt thay cho DATA_STORAGE chung. Các class bao cấu trúc cây/list có primary TREE_SETUP/LIST_SETUP và OOP_CLASS co-tag; Board là mảng object chung nên OOP_CLASS + DATA_STORAGE + OOP_INSTANTIATE.

## Quyết định hợp nhất, tách và giữ biến thể

| Vấn đề | Quyết định Lead | Ví dụ truy về map |
|---|---|---|
| Tên hàm dễ gây nhầm | Phân loại hành vi, không theo tên | s23/41 `1(c)` LinearSearch thực tế đếm; w25/42 `1(a)(iii)` GetPosition tạo chuỗi |
| Record được biểu diễn bằng class | TYPE/record với class thay thế là DATA_RECORD; explicit OOP class/constructor là OOP_CLASS, kể cả thuộc tính public | s25/42 `2(a)` và w25/41 `3(a)` |
| Getter và phép tính | Getter trả dữ liệu đang lưu; tính Boolean, điểm theo bậc, tổng điểm, tuổi, xác suất thuộc RULE_COMPUTE | s21/41 `3(c)(i–iii)` |
| RULE_COMPUTE rộng | Giữ một ID nhưng bắt buộc lưu rule_variant: predicate, banded score, aggregate, divisor sum, pay, year difference, growth time, percentage, table probability, mean/winner | Các row RULE_COMPUTE trong hai batch A3 |
| Gán và thay đổi | Gán trực tiếp là OOP_SET; cộng, nhân, clamp hoặc hành vi direction-to-delta là OOP_UPDATE; helper lưu trạng thái không xóa hành vi mới của method Move | w21/41 `2(c)`, s22/41 `2(c)`, w23/41 `3(a)(iv)` |
| Helper và main | MAIN_FLOW gồm helper điều phối lời gọi như Defend; không bắt buộc ở top-level | s22/41–43 `2(f)` |
| Chèn và sorting | ORDERED_INSERT cập nhật bảng đã có thứ tự với mục mới; INSERTION_SORT là thuật toán được yêu cầu sắp toàn bộ dữ liệu. Không ép high-score phải dùng thuật toán không được đề chỉ định | s22/41 `1(e)(ii)`, w22/42 `1(e)` |
| Cài pseudocode và tự viết lại | Thuật toán cụ thể giữ ID riêng và mode completion/translation; chỉ thêm ALGORITHM_REWRITE khi học sinh phải tự đổi cấu trúc | s24/42 `3(b)(i)` và `3(c)(i)` |
| Recursive skeleton đã cho | w23/42 `2(b)(i)` là ALGORITHM_TRANSLATE + RULE_COMPUTE, mode complete_pseudocode; không còn assessed ALGORITHM_REWRITE | QP PDF 7–8, MS PDF 19 |
| Tách chuỗi và phân loại bản ghi | Tách STRING_ROUTE khỏi STRING_SPLIT, tăng seed 57 lên 58. Một bài trả token, bài kia phân tích số/màu rồi đưa số vào sáu mảng | w25/43 `3(b)(ii)` và s25/41 `2(b)` |
| Chọn không lặp | UNIQUE_SELECTION gồm chọn vị trí chưa dùng và tiêu thụ đáp án được tìm thấy. Lưu variant riêng, không gộp thành đếm mọi lần xuất hiện | s22/42 `3(d)`, s24/42 `1(c)(i)` |
| Check digit | Công thức theo nguồn, không mặc định modulo. Corpus có trọng số, chia 10 và làm tròn xuống, quy tắc X | s24/41–43 `3(d)(i)` |
| Array output và traversal | In các hàng lưu trữ là OUTPUT_FORMAT; đi theo liên kết là TREE_TRAVERSE/LIST_TRAVERSE; xem vùng queue sống không phá hủy là QUEUE_INSPECT | w21/41 `3(c)`/`3(e)(i)`, w24/42 `2(d)` |
| Queue reduction | Có thể đọc không phá hủy hoặc tiêu thụ qua Dequeue; phải giữ variant, không gán mọi reduction thành dequeue | w22/42 `3(d)`, s25/43 `1(e)(i)` |
| Ngẫu nhiên ngoài mảng | MAIN_FLOW gọi Push với số ngẫu nhiên vẫn có kỹ năng trực tiếp random_generation; không ép thành RANDOM_ARRAY | w25/41 `1(d)`, giới hạn 0–1000 |
| Những thay đổi biểu diễn | Giữ chung ID nhưng khác variant: stack next-free/current-top, queue linear/circular, list free-list/object reference, hash Spare/bucket | 4 cặp implementation_variant trong CONFUSABLE_PATTERNS |

20 cặp đối chiếu trong CONFUSABLE_PATTERNS đã được Lead đọc và chấp thuận. 16 cặp phân biệt nhiệm vụ/dạng; 4 cặp giữ cùng ID nhưng khác cách cài đặt. Đây chưa phải pattern card, phương pháp giải hoặc lời giải đã kiểm chứng.

## Thống kê và các giới hạn phải mang sang Stage 3

Báo cáo chính dùng 29 paper / 87 câu / 672 ý / 2.175 điểm. Báo cáo độ nhạy dùng 21 nhóm văn bản thân đề/MS / 487 ý / 1.575 điểm và 23 nhóm được ảnh render xác nhận / 536 ý / 1.725 điểm. A2 kiểm 355 cặp trang render; hai trang có khác biệt hiển thị chữ được giữ tách trong nhóm 23. Cặp w21/41–42 gần tương đương vẫn là hai nhóm. Không có mẫu số 20 và không coi các nhóm này là mẫu độc lập thống kê.

Cờ ít bằng chứng: tối đa hai nhóm văn bản có đánh giá trực tiếp. Không xóa dạng ít xuất hiện hoặc coi đó là xác suất ra đề thấp. Stage 3 cần đối chiếu toàn bộ syllabus và sách, kể cả kiến thức chưa được corpus đại diện.

Map giữ nguyên toàn bộ `source_part`, context câu, input files, evidence requirement, source caveats và dependency_refs. Hai dependency tới parent `1(b)` trong w24/42 được mở rộng thành các scored children `1(b)(i)`/`1(b)(ii)` để có liên kết máy đọc được, đồng thời giữ parent gốc trong `dependency_parent_expansions`. Đây là mở rộng cấu trúc tham chiếu, không khẳng định mọi child có cùng trọng lượng tiên quyết.

Stage 1 không bị sửa. Tám SF lấy từ mirror, các ER còn thiếu và lỗi/khác biệt code xuất bản giữ nguyên trạng thái nguồn. Nhận diện được dạng không có nghĩa code MS đã chạy đúng; Stage 4–5 phải đối chiếu rubric và kiểm chứng riêng trước khi làm visual.
