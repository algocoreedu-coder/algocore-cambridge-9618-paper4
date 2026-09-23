# A3 — Các cặp dễ nhầm, bản ứng viên cho Lead

**Trạng thái: SUBMITTED_FOR_LEAD_EDIT.** 20 cặp, 40 tham chiếu ý thi từ cả ba batch. Mỗi ví dụ giữ part ID và locator PDF 1-based của Stage 1. Đây là phân biệt nhiệm vụ và biến thể cài đặt, chưa phải bài học hoặc lời giải.

Các cặp ghi `implementation_variant` cố ý có cùng pattern ID: không tách taxonomy chỉ vì dùng quy ước con trỏ khác. Không cộng các điểm của hai bên để suy ra điểm riêng của từng kỹ năng.

## A3C01 — Viết thao tác và gọi thao tác đã có

Loại đối chiếu: `assessed_vs_invoked`.

- **A: 9618_s21_41_1(d)(i)** — `LIST_INSERT`; QP `9618_s21_qp_41` PDF 4; MS `9618_s21_ms_41` PDF 8, 9, 10.
- **B: 9618_s21_41_1(d)(ii)** — `MAIN_FLOW`; QP `9618_s21_qp_41` PDF 4; MS `9618_s21_ms_41` PDF 11, 12, 13.

Ý trái yêu cầu tự viết addNode và cập nhật cấu trúc; ý phải ghép các lời gọi đã có và xử lý kết quả. Việc gọi addNode không làm LIST_INSERT trở thành thao tác mới được viết ở ý phải.

Các biến thể phải giữ:
- Thân hàm mới so với lời gọi hàm có sẵn
- Tham số và kết quả Boolean vẫn phải xử lý đúng trong MAIN_FLOW
- Chèn cuối danh sách và duyệt trước/sau là ngữ cảnh riêng

## A3C02 — Ghép chương trình và bằng chứng chạy

Loại đối chiếu: `implementation_vs_evidence`.

- **A: 9618_s21_41_1(d)(ii)** — `MAIN_FLOW`; QP `9618_s21_qp_41` PDF 4; MS `9618_s21_ms_41` PDF 11, 12, 13.
- **B: 9618_s21_41_1(d)(iii)** — `EVIDENCE_RUN`; QP `9618_s21_qp_41` PDF 4; MS `9618_s21_ms_41` PDF 13.

Ý trái chấm phần chương trình gọi các thủ tục; ý phải chấm ảnh kết quả với dữ liệu thử quy định. Không cộng lại điểm viết thuật toán cho ý chỉ yêu cầu ảnh chạy.

Các biến thể phải giữ:
- Nộp code so với nộp screenshot
- Đầu vào thử 5 và trạng thái trước/sau chèn
- Các thao tác đang được kiểm thử thuộc context

## A3C03 — TYPE record và class có constructor

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_s25_42_2(a)** — `DATA_RECORD`; QP `9618_s25_qp_42` PDF 6; MS `9618_s25_ms_42` PDF 19, 20.
- **B: 9618_w25_41_3(a)** — `OOP_CLASS`; QP `9618_w25_qp_41` PDF 9; MS `9618_w25_ms_41` PDF 26.

NewRecord được giao dưới dạng TYPE và cho phép dùng class thay record; Record ở đề còn lại được yêu cầu rõ là class cùng constructor. Tên Record hoặc cú pháp Python class không tự quyết định DATA_RECORD hay OOP_CLASS.

Các biến thể phải giữ:
- Ba trường integer so với Key integer và Data string
- Class thay thế record so với constructor hai tham số được chấm trực tiếp
- Thuộc tính public ở w25/41; không tự ép mọi class thành private

## A3C04 — Getter và phương thức tính điểm

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_s21_41_3(c)(i)** — `OOP_GET`; QP `9618_s21_qp_41` PDF 10; MS `9618_s21_ms_41` PDF 25.
- **B: 9618_s21_41_3(c)(iii)** — `RULE_COMPUTE`; QP `9618_s21_qp_41` PDF 10; MS `9618_s21_ms_41` PDF 27, 28.

getQuestion trả lại thuộc tính đã lưu; getPoints tính kết quả theo số lần trả lời. Chữ get trong tên hàm không biến phép tính theo quy tắc thành getter.

Các biến thể phải giữ:
- Trả trường có sẵn so với banded_score
- Các nhóm số lần thử 1, 2, 3–4 và còn lại
- Chia nguyên trong quy tắc điểm

## A3C05 — Getter và chuỗi kết quả có định dạng

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_w25_42_1(a)(ii)** — `OOP_GET`; QP `9618_w25_qp_42` PDF 3; MS `9618_w25_ms_42` PDF 7.
- **B: 9618_w25_42_1(a)(iii)** — `OUTPUT_FORMAT`; QP `9618_w25_qp_42` PDF 3; MS `9618_w25_ms_42` PDF 8.

GetSpecies trả thuộc tính Species; GetPosition tạo chuỗi tọa độ theo mẫu rồi trả chuỗi. Hàm có tiền tố Get vẫn có thể thuộc OUTPUT_FORMAT khi phần mới được chấm là ghép định dạng.

Các biến thể phải giữ:
- Giá trị trường đơn so với chuỗi ghép nhiều thuộc tính
- Trả chuỗi khác với trực tiếp in chuỗi
- Nhãn X/Y và cách biểu diễn tọa độ

## A3C06 — Gán thay thế và cập nhật tương đối

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_w21_41_2(c)** — `OOP_SET`; QP `9618_w21_qp_41` PDF 5; MS `9618_w21_ms_41` PDF 11.
- **B: 9618_s22_41_2(c)** — `OOP_UPDATE`; QP `9618_s22_qp_41` PDF 6; MS `9618_s22_ms_41` PDF 21.

SetDescription thay nội dung thuộc tính bằng tham số; ChangeHealth cộng mức thay đổi vào trạng thái cũ. Gán mới và thay đổi tương đối dẫn đến hai yêu cầu cài đặt khác nhau.

Các biến thể phải giữ:
- OOP_SET thay giá trị so với OOP_UPDATE dùng giá trị cũ
- Tham số là trạng thái mới so với độ thay đổi
- Không suy thao tác chỉ từ tên Set hoặc Change

## A3C07 — Tìm có hay không và đếm tất cả lần xuất hiện

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_s21_41_2(b)(i)** — `LINEAR_SEARCH`; QP `9618_s21_qp_41` PDF 6; MS `9618_s21_ms_41` PDF 15, 16.
- **B: 9618_w22_41_1(c)** — `COUNT_OCCURRENCES`; QP `9618_w22_qp_41` PDF 2; MS `9618_w22_ms_41` PDF 4, 5.

searchValue trả Boolean về sự tồn tại; FindValues đếm tất cả phần tử khớp và có yêu cầu nhập hợp lệ. Dừng ở lần khớp đầu không đáp ứng nhiệm vụ đếm tổng số lần xuất hiện.

Các biến thể phải giữ:
- Boolean tồn tại so với integer số lượng
- Một kết quả khớp so với toàn bộ phần tử
- Kiểm tra đầu vào 1–100 là phần mới của ý đếm

## A3C08 — Binary search trên mảng và tìm trong BST

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_s22_42_2(c)(i)** — `BINARY_SEARCH`; QP `9618_s22_qp_42` PDF 6; MS `9618_s22_ms_42` PDF 22, 23.
- **B: 9618_w22_41_3(c)** — `TREE_SEARCH`; QP `9618_w22_qp_41` PDF 9; MS `9618_w22_ms_41` PDF 19, 20.

BinarySearch thu hẹp đoạn chỉ số của hàng mảng đã sắp xếp; SearchValue chọn nhánh con theo các liên kết của cây. Cùng dùng so sánh và đệ quy nhưng trạng thái tìm kiếm khác nhau.

Các biến thể phải giữ:
- Lower/Upper và midpoint so với chỉ số nút/child pointer
- Hàng đầu mảng hai chiều so với bảng nút cây
- Giữ caveat midpoint/guard của nguồn s22; không biến code nguồn thành lời giải đã kiểm chứng

## A3C09 — In các hàng vật lý và duyệt cây theo liên kết

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_w21_41_3(c)** — `OUTPUT_FORMAT`; QP `9618_w21_qp_41` PDF 10; MS `9618_w21_ms_41` PDF 21.
- **B: 9618_w21_41_3(e)(i)** — `TREE_TRAVERSE`; QP `9618_w21_qp_41` PDF 11; MS `9618_w21_ms_41` PDF 22.

PrintAll xuất các hàng của mảng chứa nút; InOrder đi theo con trái, nút hiện tại rồi con phải. Cùng nhìn thấy dữ liệu cây nhưng thứ tự và tập phần tử cần xuất khác nhau.

Các biến thể phải giữ:
- Toàn bộ 20 hàng vật lý so với nút truy cập từ gốc
- Bộ left/data/right so với giá trị nút theo inorder
- Ô chưa dùng không đồng nghĩa nút trong cây

## A3C10 — Chèn vào bảng đã có thứ tự và sắp xếp cả bảng

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_s22_41_1(e)(ii)** — `ORDERED_INSERT`; QP `9618_s22_qp_41` PDF 3; MS `9618_s22_ms_41` PDF 12, 13, 14.
- **B: 9618_w22_42_1(e)** — `INSERTION_SORT`; QP `9618_w22_qp_42` PDF 3; MS `9618_w22_ms_42` PDF 7, 8.

Ý high score thêm một cặp mới vào bảng đã có thứ tự; ý Jobs yêu cầu insertion sort cho các cặp đang có. Không gắn tên insertion sort chỉ vì cả hai đều dịch dữ liệu.

Các biến thể phải giữ:
- Một phần tử đến sau so với toàn bộ dữ liệu chưa sắp xếp
- Điểm giảm dần so với priority tăng dần
- Di chuyển trọn cặp name/score hoặc job/priority
- Giới hạn top ten và điều kiện được vào bảng

## A3C11 — Chuyển pseudocode và đổi đệ quy sang lặp

Loại đối chiếu: `task_mode_boundary`.

- **A: 9618_w21_41_1(a)** — `ALGORITHM_TRANSLATE`; QP `9618_w21_qp_41` PDF 2; MS `9618_w21_ms_41` PDF 3.
- **B: 9618_w21_41_1(c)** — `ALGORITHM_REWRITE`; QP `9618_w21_qp_41` PDF 3; MS `9618_w21_ms_41` PDF 6, 7.

Ý đầu chuyển Unknown từ pseudocode sang ngôn ngữ lập trình; ý sau viết lại cùng hành vi theo dạng lặp. ALGORITHM_TRANSLATE và ALGORITHM_REWRITE phân biệt yêu cầu giao việc, không chỉ hình thức code cuối cùng.

Các biến thể phải giữ:
- Giữ cấu trúc đệ quy được cung cấp so với đổi sang lặp
- Ba nhánh X<Y, X=Y, X>Y
- Phép chia nguyên và các giá trị được xuất thuộc hành vi cần bảo toàn

## A3C12 — Tách token và tách rồi phân vào nhóm

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_w25_43_3(b)(ii)** — `STRING_SPLIT`; QP `9618_w25_qp_43` PDF 13; MS `9618_w25_ms_43` PDF 35, 36, 37.
- **B: 9618_s25_41_2(b)** — `STRING_ROUTE`; QP `9618_s25_qp_41` PDF 4; MS `9618_s25_ms_41` PDF 21, 22, 23, 24, 25.

Một SplitData trả mảng bốn chuỗi tách bởi dấu chấm phẩy; SplitData còn lại tách số/màu và đưa số vào mảng ứng với màu. Cùng tên hàm nhưng routing là công việc bổ sung quyết định dạng STRING_ROUTE.

Các biến thể phải giữ:
- Dấu chấm phẩy so với dấu phẩy
- Cấm built-in split chỉ được nêu ở bài tách bốn câu lệnh
- Trả mảng token so với phân vào sáu mảng màu
- Kiểu dữ liệu đích là số theo QP; code minh họa nguồn có caveat riêng

## A3C13 — Độ dài đoạn liên tiếp và tổng tần suất

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_w25_43_2(e)** — `RUN_LENGTH_ENCODE`; QP `9618_w25_qp_43` PDF 10; MS `9618_w25_ms_43` PDF 28, 29.
- **B: 9618_w25_43_3(a)(i)** — `COUNT_OCCURRENCES`; QP `9618_w25_qp_43` PDF 12; MS `9618_w25_ms_43` PDF 32, 33.

Compress ghi từng đoạn chữ số liên tiếp theo thứ tự; RecursiveCount trả tổng số lần một giá trị xuất hiện trong mảng. Các lần xuất hiện cách nhau không thuộc cùng một run.

Các biến thể phải giữ:
- Thứ tự và ranh giới từng run so với tổng đếm toàn mảng
- Nén tiêu thụ queue qua Dequeue so với đệ quy trên mảng rút ngắn
- Ít nhất một chữ số và run không quá 9 là giả thiết riêng của bài nén
- Kết quả chuỗi digit/count so với integer

## A3C14 — Hash collision sang Spare và trong cùng bucket

Loại đối chiếu: `implementation_variant`.

- **A: 9618_s25_42_2(d)** — `HASH_INSERT`; QP `9618_s25_qp_42` PDF 7; MS `9618_s25_ms_42` PDF 25, 26, 27.
- **B: 9618_w25_41_3(d)** — `HASH_INSERT`; QP `9618_w25_qp_41` PDF 10; MS `9618_w25_ms_41` PDF 29, 30.

Cả hai thuộc HASH_INSERT nhưng một bài chuyển collision sang mảng Spare riêng; bài kia tìm ô trống trong cùng hàng bucket. Không dùng chung mô hình vị trí lưu collision.

Các biến thể phải giữ:
- Main 200 + Spare 100 so với bảng 100×10
- key MOD 200 so với key MOD 100
- Đủ chỗ trong Spare so với tối đa 10 record cho một hash value
- Mảng phụ toàn cục so với cột của đúng bucket

## A3C15 — Queue vòng và queue tuyến tính

Loại đối chiếu: `implementation_variant`.

- **A: 9618_s22_41_3(b)** — `QUEUE_ENQUEUE`; QP `9618_s22_qp_41` PDF 9; MS `9618_s22_ms_41` PDF 28, 29.
- **B: 9618_w22_42_3(b)** — `QUEUE_ENQUEUE`; QP `9618_w22_qp_42` PDF 8; MS `9618_w22_ms_42` PDF 21.

Hai ý cùng chấm enqueue nhưng queue vòng tái sử dụng chỉ số qua cơ chế wrap và số lượng phần tử; queue tuyến tính của đề còn lại tiến tail mà không wrap. Tên Enqueue không xác định được quy ước con trỏ.

Các biến thể phải giữ:
- Capacity 10 string so với 100 integer
- Head/Tail/count bắt đầu 0 so với ví dụ head −1/tail 0
- Full theo số lượng so với giới hạn tail
- Supplied pseudocode gaps so với tự viết thao tác

## A3C16 — Stack pointer chỉ ô trống và chỉ đỉnh hiện tại

Loại đối chiếu: `implementation_variant`.

- **A: 9618_s22_42_1(c)** — `STACK_PUSH`; QP `9618_s22_qp_42` PDF 2; MS `9618_s22_ms_42` PDF 6, 7.
- **B: 9618_w25_41_1(b)** — `STACK_PUSH`; QP `9618_w25_qp_41` PDF 2; MS `9618_w25_ms_41` PDF 7, 8.

STACK_PUSH ở bài đầu dùng pointer đến ô trống kế tiếp; bài sau TopOfStack là chỉ số phần tử cuối đang có. Thứ tự cập nhật pointer gắn với ý nghĩa con trỏ, không thể sao nguyên giữa hai bài.

Các biến thể phải giữ:
- Next-free bắt đầu 0 so với current-top bắt đầu −1
- Capacity 10 so với 30
- Điều kiện full theo capacity so với chỉ số cuối 29
- Sentinel trả khi pop là quy ước riêng, không suy từ tên stack

## A3C17 — Cấp nút từ free list và tạo object node

Loại đối chiếu: `implementation_variant`.

- **A: 9618_w24_41_3(b)** — `LIST_INSERT`; QP `9618_w24_qp_41` PDF 13; MS `9618_w24_ms_41` PDF 28, 29, 30.
- **B: 9618_s25_43_3(b)(ii)** — `LIST_INSERT`; QP `9618_s25_qp_43` PDF 8; MS `9618_s25_ms_43` PDF 37.

Cả hai chèn đầu linked list; một bài lấy ô từ free list trong mảng, bài kia tạo Node mới và nối tham chiếu object. Không áp dụng FirstEmpty hoặc sentinel chỉ số của mảng vào object reference.

Các biến thể phải giữ:
- Mảng 20×2 và danh sách ô trống so với object Node
- Chỉ số −1 so với null reference
- Năm input và dừng khi đầy so với một tham số integer
- Bảo toàn liên kết free-list so với gọi SetNextNode trên object mới

## A3C18 — Đọc file vào dữ liệu thường và tạo object từ file

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_s22_41_1(b)** — `FILE_READ_ARRAY`; QP `9618_s22_qp_41` PDF 2; MS `9618_s22_ms_41` PDF 5, 6.
- **B: 9618_s21_41_3(b)** — `FILE_READ_OBJECTS`; QP `9618_s21_qp_41` PDF 9; MS `9618_s21_ms_41` PDF 22, 23, 24, 25.

ReadHighScores lưu các cặp tên/điểm vào cấu trúc dữ liệu; readData của TreasureChest phải tạo đối tượng rồi lưu đối tượng. Thao tác đọc file chung không xóa phần constructor được yêu cầu rõ ở bài sau.

Các biến thể phải giữ:
- Hai dòng mỗi score record so với ba dòng mỗi TreasureChest
- Dữ liệu cặp đơn so với instance OOP
- Chỉ gắn OOP_INSTANTIATE và DATA_STORAGE khi chính ý có tiêu chí tương ứng
- QP có 5 TreasureChest; giữ caveat MS nói 4 ở một bullet

## A3C19 — Khai mảng object và tạo các instance cụ thể

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_w21_41_2(d)** — `DATA_STORAGE`; QP `9618_w21_qp_41` PDF 5; MS `9618_w21_ms_41` PDF 11.
- **B: 9618_w22_41_2(a)(iii)** — `OOP_INSTANTIATE`; QP `9618_w22_qp_41` PDF 5; MS `9618_w22_ms_41` PDF 10, 11.

Khai mảng để chứa Picture là DATA_STORAGE; tạo từng Card với dữ liệu cụ thể là OOP_INSTANTIATE. Kiểu phần tử là object không có nghĩa mọi ô đã chứa một instance được dựng từ dữ liệu đề.

Các biến thể phải giữ:
- Capacity 100 cho Picture so với 15 Card xác định
- Chỗ chứa object so với object đã tạo
- Không đếm lại việc khai class/constructor ở ý tạo instance

## A3C20 — Tính tổng điểm theo quy tắc và gom tổng theo ID

Loại đối chiếu: `pattern_boundary`.

- **A: 9618_w22_41_2(c)(i)** — `RULE_COMPUTE`; QP `9618_w22_qp_41` PDF 7; MS `9618_w22_ms_41` PDF 13, 14.
- **B: 9618_w23_41_2(c)(iii)** — `GROUP_AGGREGATE`; QP `9618_w23_qp_41` PDF 6; MS `9618_w23_ms_41` PDF 18, 19, 20, 21.

CalculateValue tạo một tổng điểm cho một hand theo màu và số; TotalData duy trì nhiều nhóm ID, tăng tổng của nhóm có sẵn hoặc thêm nhóm mới. Vòng lặp và biến total không đủ để kết luận GROUP_AGGREGATE.

Các biến thể phải giữ:
- Một aggregate_score so với nhiều group theo key ID
- Năm Card đã có so với một ID lấy qua Dequeue mỗi lần gọi
- Quy tắc bonus màu so với tăng frequency của nhóm
- Tạo nhóm mới khi chưa có ID so với trả một scalar score

## Kiểm tra và giới hạn

Đã kiểm tra 20 cặp, 40 tham chiếu, 39 part ID khác nhau; tất cả tồn tại và locator QP/MS trùng chính xác giữa Stage 1 và batch. Có 4 cặp cùng pattern nhưng khác quy ước cài đặt.

Ví dụ chưa quen được đọc lại trên QP/MS gốc qua extraction tự nhiên; bảng hash, free-list, object-node, RLE và pseudocode grouped total được xem facsimile. Việc đọc đầy đủ lô 2021–2022 từ Stage 1/2 được kế thừa. Giữ caveat nguồn; không chạy hoặc sửa code minh họa.

Checksum QUESTION_INDEX.json: `d784e0f9efdc0d24bc3174802e33747297235fb1caef397e85e8dd796e0ac2f3`. Lead biên tập và nghiệm thu bản cuối.
