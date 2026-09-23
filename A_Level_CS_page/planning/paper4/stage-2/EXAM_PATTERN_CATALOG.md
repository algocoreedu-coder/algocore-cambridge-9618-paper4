# Hệ thống dạng bài Paper 4 — Stage 2

58 dạng do Lead xây từ QP và tiêu chí MS trong corpus 2021–2025. Đây là taxonomy biên tập của AlgoCore, không phải danh sách dạng chính thức của Cambridge hoặc cam kết phủ toàn bộ syllabus 2026.

Mỗi dạng có tên Việt–Anh, dấu hiệu nhận diện, ranh giới, biến thể và ví dụ truy về nguồn. Phần căn cứ giữ tiếng Anh để đối chiếu đề; đây chưa phải hai bản bài học hoàn chỉnh.

Số đề bên dưới là incidence được đánh giá trực tiếp trên 29 paper; một đề có thể chứa nhiều dạng. Điểm primary là phân bổ biên tập toàn bộ điểm mỗi ý vào đúng một dạng, không phải điểm riêng Cambridge cho từng kỹ năng.

| ID | Dạng bài | Đề có đánh giá / 29 | Ý primary | Điểm primary | Nhóm có đánh giá / 21 |
|---|---|---:|---:|---:|---:|
| [DATA_STORAGE](#data_storage) | Khai báo và khởi tạo dữ liệu thông thường | 23 | 24 | 40 | 16 |
| [DATA_RECORD](#data_record) | Khai báo cấu trúc bản ghi | 8 | 8 | 17 | 5 |
| [ARRAY_APPEND](#array_append) | Thêm phần tử vào mảng còn chỗ | 1 | 1 | 5 | 1 |
| [ORDERED_INSERT](#ordered_insert) | Chèn vào bảng đã có thứ tự | 2 | 2 | 10 | 1 |
| [RANDOM_ARRAY](#random_array) | Tạo dữ liệu mảng ngẫu nhiên | 2 | 2 | 7 | 2 |
| [FILE_READ_ARRAY](#file_read_array) | Đọc file vào mảng, bản ghi hoặc ADT | 18 | 23 | 120 | 13 |
| [FILE_READ_OBJECTS](#file_read_objects) | Đọc file để tạo hoặc cập nhật đối tượng | 11 | 12 | 84 | 8 |
| [FILE_WRITE](#file_write) | Ghi hoặc nối dữ liệu vào file | 4 | 4 | 18 | 3 |
| [LINEAR_SEARCH](#linear_search) | Tìm phần tử bằng duyệt tuần tự | 8 | 4 | 23 | 5 |
| [COUNT_OCCURRENCES](#count_occurrences) | Đếm số lần thỏa điều kiện | 7 | 9 | 48 | 4 |
| [FILTER_RECORDS](#filter_records) | Lọc tất cả bản ghi thỏa điều kiện | 4 | 4 | 26 | 3 |
| [GROUP_AGGREGATE](#group_aggregate) | Gom khóa và cập nhật tổng theo nhóm | 2 | 2 | 10 | 1 |
| [BUBBLE_SORT](#bubble_sort) | Sắp xếp nổi bọt | 13 | 13 | 60 | 8 |
| [INSERTION_SORT](#insertion_sort) | Sắp xếp chèn | 3 | 4 | 18 | 3 |
| [BINARY_SEARCH](#binary_search) | Tìm nhị phân trong mảng đã sắp | 6 | 6 | 38 | 5 |
| [STACK_SETUP](#stack_setup) | Khởi tạo stack và con trỏ | 6 | 7 | 16 | 5 |
| [STACK_PUSH](#stack_push) | Viết thao tác Push | 6 | 8 | 30 | 5 |
| [STACK_POP](#stack_pop) | Viết thao tác Pop | 6 | 6 | 24 | 5 |
| [STACK_PAIR](#stack_pair) | Phối hợp hai stack và hoàn trả phần tử | 2 | 2 | 10 | 1 |
| [STACK_REDUCE](#stack_reduce) | Rút dữ liệu từ stack để tính kết quả | 2 | 2 | 11 | 2 |
| [QUEUE_SETUP](#queue_setup) | Khởi tạo queue và trạng thái | 12 | 12 | 27 | 9 |
| [QUEUE_ENQUEUE](#queue_enqueue) | Viết thao tác Enqueue | 12 | 12 | 64 | 9 |
| [QUEUE_DEQUEUE](#queue_dequeue) | Viết thao tác Dequeue | 11 | 11 | 50 | 8 |
| [QUEUE_INSPECT](#queue_inspect) | Xem các phần tử queue mà không lấy ra | 1 | 1 | 3 | 1 |
| [QUEUE_REDUCE](#queue_reduce) | Xử lý hoặc cộng dồn dữ liệu queue | 3 | 2 | 11 | 3 |
| [LIST_SETUP](#list_setup) | Khởi tạo linked list và free list | 6 | 6 | 18 | 3 |
| [LIST_TRAVERSE](#list_traverse) | Duyệt linked list theo liên kết | 6 | 6 | 25 | 3 |
| [LIST_INSERT](#list_insert) | Chèn node vào linked list | 6 | 6 | 37 | 3 |
| [LIST_REMOVE](#list_remove) | Xóa node khỏi linked list | 3 | 3 | 16 | 2 |
| [TREE_SETUP](#tree_setup) | Khởi tạo cây nhị phân | 7 | 9 | 27 | 6 |
| [TREE_INSERT](#tree_insert) | Chèn node vào cây tìm kiếm nhị phân | 5 | 5 | 35 | 5 |
| [TREE_SEARCH](#tree_search) | Tìm giá trị trong cây nhị phân | 2 | 2 | 10 | 1 |
| [TREE_TRAVERSE](#tree_traverse) | Duyệt cây theo thứ tự yêu cầu | 5 | 5 | 33 | 4 |
| [HASH_SETUP](#hash_setup) | Khởi tạo hash table và vùng va chạm | 2 | 3 | 5 | 2 |
| [HASH_FUNCTION](#hash_function) | Tính địa chỉ hash | 2 | 2 | 4 | 2 |
| [HASH_INSERT](#hash_insert) | Chèn bản ghi và xử lý va chạm | 2 | 2 | 10 | 2 |
| [HASH_SEARCH](#hash_search) | Tra bản ghi theo hash | 1 | 1 | 5 | 1 |
| [OOP_CLASS](#oop_class) | Khai báo class và constructor | 29 | 37 | 164 | 21 |
| [OOP_SUBCLASS](#oop_subclass) | Khai báo lớp con và constructor | 7 | 8 | 33 | 5 |
| [OOP_GET](#oop_get) | Viết accessor trả dữ liệu đang lưu | 28 | 32 | 81 | 20 |
| [OOP_SET](#oop_set) | Viết setter gán trực tiếp | 9 | 9 | 22 | 8 |
| [OOP_UPDATE](#oop_update) | Cập nhật trạng thái object theo quy tắc | 11 | 12 | 37 | 8 |
| [OOP_OVERRIDE](#oop_override) | Ghi đè hành vi kế thừa | 7 | 8 | 22 | 5 |
| [OOP_INSTANTIATE](#oop_instantiate) | Tạo và lưu các instance | 29 | 25 | 64 | 21 |
| [OOP_CAPACITY_ADD](#oop_capacity_add) | Thêm object vào tập hợp có giới hạn | 1 | 1 | 4 | 1 |
| [RULE_COMPUTE](#rule_compute) | Tính kết quả từ quy tắc hoặc bảng | 15 | 21 | 76 | 9 |
| [VALIDATE_INPUT](#validate_input) | Kiểm tra và yêu cầu nhập lại | 20 | 11 | 49 | 12 |
| [UNIQUE_SELECTION](#unique_selection) | Chọn hoặc chấp nhận mỗi mục một lần | 2 | 2 | 12 | 2 |
| [CHECK_DIGIT](#check_digit) | Kiểm tra dữ liệu bằng check digit | 2 | 2 | 12 | 1 |
| [STRING_COMPARE](#string_compare) | So sánh chuỗi từng ký tự | 2 | 2 | 8 | 1 |
| [STRING_SPLIT](#string_split) | Tách chuỗi thành các token | 1 | 1 | 6 | 1 |
| [STRING_ROUTE](#string_route) | Phân tích bản ghi chuỗi và phân phối giá trị | 1 | 1 | 6 | 1 |
| [RUN_LENGTH_ENCODE](#run_length_encode) | Mã hóa các đoạn ký tự lặp liên tiếp | 1 | 1 | 6 | 1 |
| [ALGORITHM_TRANSLATE](#algorithm_translate) | Cài đặt thuật toán cho sẵn chưa có dạng riêng | 3 | 4 | 18 | 3 |
| [ALGORITHM_REWRITE](#algorithm_rewrite) | Chuyển đổi giữa đệ quy và vòng lặp | 6 | 2 | 14 | 5 |
| [MAIN_FLOW](#main_flow) | Ghép lời gọi và điều khiển chương trình | 29 | 111 | 308 | 21 |
| [OUTPUT_FORMAT](#output_format) | Trình bày hoặc trả dữ liệu đúng định dạng | 25 | 27 | 79 | 19 |
| [EVIDENCE_RUN](#evidence_run) | Chạy test và ghi minh chứng | 29 | 124 | 159 | 21 |

## DATA_STORAGE

**Khai báo và khởi tạo dữ liệu thông thường** — Declare or initialise general scalar/array storage

Đề yêu cầu biến, mảng hoặc giá trị ban đầu theo dữ kiện; trạng thái riêng của ADT dùng dạng setup tương ứng.

Ranh giới: General arrays/scalars, fixed supplied data; use specific ADT setup for stack/queue/list/tree/hash.

Biến thể phải giữ: scope, dimensions, initial_values.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_2(a)` — [QP PDF 6](../stage-1/facsimiles/9618_s21_qp_41/p006.png); [MS PDF 14,15](../stage-1/facsimiles/9618_s21_ms_41/p014.png). Marks require the array identifier and the ten given integer values.
- `9618_s22_41_1(a)` — [QP PDF 2](../stage-1/facsimiles/9618_s22_qp_41/p002.png); [MS PDF 4](../stage-1/facsimiles/9618_s22_ms_41/p004.png). Global array structure(s), appropriate field types and eleven-element capacity are required.
- `9618_s22_42_2(a)` — [QP PDF 4](../stage-1/facsimiles/9618_s22_qp_42/p004.png); [MS PDF 13,14](../stage-1/facsimiles/9618_s22_ms_42/p013.png). MS separately requires the local2D array and random initialisation of every cell; those separable requirements support both tags.
- `9618_w21_41_2(d)` — [QP PDF 5](../stage-1/facsimiles/9618_w21_qp_41/p005.png); [MS PDF 11](../stage-1/facsimiles/9618_w21_ms_41/p011.png). The only required mark is array declaration with100 Picture elements; constructing business-data instances is not independently required by this row.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## DATA_RECORD

**Khai báo cấu trúc bản ghi** — Declare a record-like field structure

Khai báo các trường và kiểu dữ liệu theo TYPE/record; class chỉ là phương án thay record nếu ngôn ngữ cần.

Ranh giới: QP asks for TYPE/record fields, allowing a class as a language substitute. If QP explicitly asks for an OOP class and constructor, use OOP_CLASS regardless of visibility or class name.

Biến thể phải giữ: field_types, record_or_class_substitute.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_1(a)` — [QP PDF 2](../stage-1/facsimiles/9618_s21_qp_41/p002.png); [MS PDF 4](../stage-1/facsimiles/9618_s21_ms_41/p004.png). The named record and its two integer fields are assessed; a Python class here substitutes for a record, not an encapsulated business object.
- `9618_s23_42_2(a)` — [QP PDF 5](../stage-1/facsimiles/9618_s23_qp_42/p005.png); [MS PDF 11](../stage-1/facsimiles/9618_s23_ms_42/p011.png). Record or record-substitute class contains string ID and integer quantity.
- `9618_w23_41_2(c)(i)` — [QP PDF 5](../stage-1/facsimiles/9618_w23_qp_41/p005.png); [MS PDF 16,17](../stage-1/facsimiles/9618_w23_ms_41/p016.png). Declare RecordData with string ID and integer Total.
- `9618_w24_42_2(a)` — [QP PDF 8](../stage-1/facsimiles/9618_w24_qp_42/p008.png); [MS PDF 18](../stage-1/facsimiles/9618_w24_ms_42/p018.png). Queue record/class contains one integer array and two integer pointer fields.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## ARRAY_APPEND

**Thêm phần tử vào mảng còn chỗ** — Append a record/value to bounded array storage

Kiểm sức chứa rồi ghi vào vị trí trống kế tiếp và cập nhật số lượng; chưa yêu cầu duy trì thứ tự sắp xếp.

Ranh giới: Check capacity, write next slot, update count; distinct from ordered insertion and ADT enqueue.

Biến thể phải giữ: capacity, count_convention, return_contract.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w22_42_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_w22_qp_42/p003.png); [MS PDF 5](../stage-1/facsimiles/9618_w22_ms_42/p005.png). The procedure checks capacity, stores a job at the next available row and increments count; it neither inserts into sorted position nor changes queue head/tail pointers.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## ORDERED_INSERT

**Chèn vào bảng đã có thứ tự** — Insert into an already ordered table

Đưa phần tử mới vào bảng đang có thứ tự và giữ giới hạn top-N; không tự áp đặt một thuật toán sắp xếp cụ thể nếu đề không yêu cầu.

Ranh giới: Shift/position a new score or record in sorted storage; not sorting the whole input.

Biến thể phải giữ: sort_key, direction, ties, retained_capacity.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s22_41_1(e)(ii)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_41/p003.png); [MS PDF 12,13,14](../stage-1/facsimiles/9618_s22_ms_41/p012.png). Find the insertion position and store existing/incoming name-score pairs correctly while retaining a top-ten list; QP does not name insertion sort or mandate a named sorting algorithm.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## RANDOM_ARRAY

**Tạo dữ liệu mảng ngẫu nhiên** — Generate random array data

Sinh đủ số phần tử trong khoảng quy định; có thể phải loại trùng hoặc khởi tạo mảng nhiều chiều.

Ranh giới: Populate array with random values; uniqueness, bounds and dimensionality are variants.

Biến thể phải giữ: range_inclusive, dimensions, uniqueness.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s22_42_2(a)` — [QP PDF 4](../stage-1/facsimiles/9618_s22_qp_42/p004.png); [MS PDF 13,14](../stage-1/facsimiles/9618_s22_ms_42/p013.png). MS separately requires the local2D array and random initialisation of every cell; those separable requirements support both tags.
- `9618_w25_42_2(a)` — [QP PDF 6](../stage-1/facsimiles/9618_w25_qp_42/p006.png); [MS PDF 18,19](../stage-1/facsimiles/9618_w25_ms_42/p018.png). Create a local 1D array with twenty distinct random integers0..100; all three requirements have explicit marking criteria.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## FILE_READ_ARRAY

**Đọc file vào mảng, bản ghi hoặc ADT** — Read text into arrays/records or an ADT

Đọc và tách dòng, đưa dữ liệu vào cấu trúc được giao; lời gọi Push/Enqueue/AddNode có sẵn là context.

Ranh giới: Read/parse lines, populate a data structure; invoked ADT operations belong to context unless implemented in this row.

Biến thể phải giữ: line_count, record_layout, destination, error_handling.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_41_1(b)` — [QP PDF 2](../stage-1/facsimiles/9618_s22_qp_41/p002.png); [MS PDF 5,6](../stage-1/facsimiles/9618_s22_ms_41/p005.png). The procedure opens/reads the file, stores each name-score pair, closes the file and may gain the stated file-handling criteria; no ordering algorithm is implemented here.
- `9618_w22_41_1(b)` — [QP PDF 2](../stage-1/facsimiles/9618_w22_qp_41/p002.png); [MS PDF 3,4](../stage-1/facsimiles/9618_w22_ms_41/p003.png). The procedure reads100 integer values into existing storage and handles file exceptions; it does not search or sort.
- `9618_s23_41_1(a)(ii)` — [QP PDF 2](../stage-1/facsimiles/9618_s23_qp_41/p002.png); [MS PDF 5,6](../stage-1/facsimiles/9618_s23_ms_41/p005.png). Read every line into the array with file opening, closing and error-handling credit.
- `9618_w23_41_2(b)` — [QP PDF 5](../stage-1/facsimiles/9618_w23_qp_41/p005.png); [MS PDF 14,15](../stage-1/facsimiles/9618_w23_ms_41/p014.png). Read all IDs with file handling and call Enqueue for each value.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## FILE_READ_OBJECTS

**Đọc file để tạo hoặc cập nhật đối tượng** — Read data and construct or update objects

Mỗi bản ghi xác định đối tượng/loại con, hoặc dùng khóa để tìm và cập nhật đối tượng hiện có.

Ranh giới: Construct object records, dispatch subclasses or locate/update existing objects from file records.

Biến thể phải giữ: fixed_or_variable_record, subclass_dispatch, create_or_update.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_3(b)` — [QP PDF 9](../stage-1/facsimiles/9618_s21_qp_41/p009.png); [MS PDF 22,23,24,25](../stage-1/facsimiles/9618_s21_ms_41/p022.png). Read question/answer/points groups, construct TreasureChest objects and store them in arrayTreasure; array declaration and object creation are explicit criteria alongside file handling.
- `9618_s22_42_3(c)` — [QP PDF 8](../stage-1/facsimiles/9618_s22_qp_42/p008.png); [MS PDF 28,29,30](../stage-1/facsimiles/9618_s22_ms_42/p028.png). The30-element object array, per-record object construction and file reading/storage are explicit marking requirements.
- `9618_w21_41_2(e)` — [QP PDF 5](../stage-1/facsimiles/9618_w21_qp_41/p005.png); [MS PDF 12,13,14](../stage-1/facsimiles/9618_w21_ms_41/p012.png). Read records, create/store one Picture per record, handle the file and count/return objects; array declaration is prior context, not newly assessed storage setup.
- `9618_w21_42_2(e)` — [QP PDF 5](../stage-1/facsimiles/9618_w21_qp_42/p005.png); [MS PDF 12,13,14](../stage-1/facsimiles/9618_w21_ms_42/p012.png). Read records, create/store one Picture per record, handle the file and count/return objects; array declaration is prior context, not newly assessed storage setup.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## FILE_WRITE

**Ghi hoặc nối dữ liệu vào file** — Write or append data to a text file

Tạo các dòng đúng định dạng, dùng chế độ ghi phù hợp và xử lý lỗi khi được yêu cầu.

Ranh giới: Output file records and stated error handling; read/write modes and provided/new file differ.

Biến thể phải giữ: append_or_write, provided_or_created_file, physical_or_logical_order.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_41_1(f)` — [QP PDF 4](../stage-1/facsimiles/9618_s22_qp_41/p004.png); [MS PDF 17,18](../stage-1/facsimiles/9618_s22_ms_41/p017.png). The procedure opens the new output file, writes the top ten in the stated field order and closes it; it does not read a missing input file.
- `9618_s25_41_2(c)` — [QP PDF 5](../stage-1/facsimiles/9618_s25_qp_41/p005.png); [MS PDF 26,27](../stage-1/facsimiles/9618_s25_ms_41/p026.png). Append all array values to the parameter filename, one per line, with exception handling.
- `9618_w25_42_3(d)` — [QP PDF 11](../stage-1/facsimiles/9618_w25_qp_42/p011.png); [MS PDF 35,36](../stage-1/facsimiles/9618_w25_ms_42/p035.png). Write all physical TreeArray rows as comma-separated triples to new Tree.txt with exceptions.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## LINEAR_SEARCH

**Tìm phần tử bằng duyệt tuần tự** — Find an element by sequential search

So sánh tuần tự để tìm giá trị, vị trí hoặc tồn tại; nếu phải đếm mọi lần khớp thì dùng dạng đếm.

Ranh giới: Return existence/index/match, possibly retry input; frequency uses COUNT_OCCURRENCES.

Biến thể phải giữ: matching_rule, case_handling, return_contract.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_2(b)(i)` — [QP PDF 6](../stage-1/facsimiles/9618_s21_qp_41/p006.png); [MS PDF 15,16](../stage-1/facsimiles/9618_s21_ms_41/p015.png). The function accepts the search value, examines array elements and returns true when found or false when absent; it does not count occurrences.
- `9618_w22_42_2(e)` — [QP PDF 6](../stage-1/facsimiles/9618_w22_qp_42/p006.png); [MS PDF 16,17](../stage-1/facsimiles/9618_w22_ms_42/p016.png). MS distinguishes searching names through GetName, handling case, repeating failed user choices and retaining the matched position.
- `9618_s23_42_3(d)` — [QP PDF 11](../stage-1/facsimiles/9618_s23_qp_42/p011.png); [MS PDF 34,35](../stage-1/facsimiles/9618_s23_ms_42/p034.png). Read hours, locate employee by number using its getter, and call SetPay for week one.
- `9618_s24_41_2(e)(ii)` — [QP PDF 9](../stage-1/facsimiles/9618_s24_qp_41/p009.png); [MS PDF 26,27](../stage-1/facsimiles/9618_s24_ms_41/p026.png). Find the chosen tree and calculate years from its starting height, maximum height and annual growth.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## COUNT_OCCURRENCES

**Đếm số lần thỏa điều kiện** — Count matching data items

Đếm mọi phần tử/ký tự khớp trong dữ liệu; cách lặp hay đệ quy là biến thể, không dựa vào tên hàm.

Ranh giới: Count repeated matches, characters or values; iterative/recursive implementation is a variant.

Biến thể phải giữ: iterative_or_recursive, predicate, data_type.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w22_41_1(c)` — [QP PDF 2](../stage-1/facsimiles/9618_w22_qp_41/p002.png); [MS PDF 4,5](../stage-1/facsimiles/9618_w22_ms_41/p004.png). MS requires input range/type validation, scanning all100 entries, incrementing a count for each match and returning the total; FindValues is not an existence-only search.
- `9618_s23_41_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_s23_qp_41/p003.png); [MS PDF 9](../stage-1/facsimiles/9618_s23_ms_41/p009.png). Loop over all elements, count matches and return the count.
- `9618_w23_41_1(a)(i)` — [QP PDF 2,3](../stage-1/facsimiles/9618_w23_qp_41/p002.png); [MS PDF 4,5,6](../stage-1/facsimiles/9618_w23_ms_41/p004.png). Preserve supplied vowel-counting algorithm with loop, first-character check and string reduction.
- `9618_w25_43_3(a)(i)` — [QP PDF 12](../stage-1/facsimiles/9618_w25_qp_43/p012.png); [MS PDF 32,33](../stage-1/facsimiles/9618_w25_ms_43/p032.png). Recursive empty-array base case and matching/nonmatching recursive returns on reduced array.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## FILTER_RECORDS

**Lọc tất cả bản ghi thỏa điều kiện** — Select all records/objects satisfying conditions

Chọn mọi bản ghi/đối tượng đáp ứng các điều kiện kết hợp, thường có nhiều thuộc tính cần so.

Ranh giới: Multiple conditions, case rules and reporting matches; not a single-key search.

Biến thể phải giữ: conditions, case_handling, all_matches.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w21_41_2(g)` — [QP PDF 6](../stage-1/facsimiles/9618_w21_qp_41/p006.png); [MS PDF 15,16](../stage-1/facsimiles/9618_w21_ms_41/p015.png). Input three constraints, check all three against each loaded object through getters and output every match; this is conjunctive filtering, not one-key existence search.
- `9618_w21_42_2(g)` — [QP PDF 6](../stage-1/facsimiles/9618_w21_qp_42/p006.png); [MS PDF 15,16](../stage-1/facsimiles/9618_w21_ms_42/p015.png). Input three constraints, check all three against each loaded object through getters and output every match; this is conjunctive filtering, not one-key existence search.
- `9618_s24_41_2(e)(i)` — [QP PDF 9](../stage-1/facsimiles/9618_s24_qp_41/p009.png); [MS PDF 23,24,25](../stage-1/facsimiles/9618_s24_ms_41/p023.png). Compare all three requirements, retain matching Tree objects and report matches or no suitable tree.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## GROUP_AGGREGATE

**Gom khóa và cập nhật tổng theo nhóm** — Group repeated keys and update per-key totals

Tìm nhóm đã tồn tại để tăng tổng, hoặc tạo nhóm mới; không chỉ tính một tổng chung.

Ranh giới: Find existing group or create one and accumulate its count/value.

Biến thể phải giữ: group_key, new_group_rule, total_fields.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w23_41_2(c)(iii)` — [QP PDF 6](../stage-1/facsimiles/9618_w23_qp_41/p006.png); [MS PDF 18,19,20,21](../stage-1/facsimiles/9618_w23_ms_41/p018.png). Dequeue one ID, search existing groups, increment its total or append a new group.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## BUBBLE_SORT

**Sắp xếp nổi bọt** — Implement bubble sorting

Cài đặt so sánh và đổi chỗ các phần tử kề nhau; giữ đúng chiều, khóa và phạm vi của vòng lặp.

Ranh giới: Sort via adjacent comparisons/swaps; direction, dimensions, key order and comparator are variants.

Biến thể phải giữ: direction, dimensions, comparison_key, multiple_keys, comparator.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_2(c)` — [QP PDF 7](../stage-1/facsimiles/9618_s21_qp_41/p007.png); [MS PDF 19,20](../stage-1/facsimiles/9618_s21_ms_41/p019.png). MS distinguishes loop limits, comparison direction, swap assignments and preserving the supplied bubble-sort logic; general translation is not a separate algorithm pattern.
- `9618_s22_42_2(b)(i)` — [QP PDF 4](../stage-1/facsimiles/9618_s22_qp_42/p004.png); [MS PDF 15,16](../stage-1/facsimiles/9618_s22_ms_42/p015.png). The nested dimension/pass/comparison loops and adjacent swap implement the supplied row-wise sort; no general unnamed-algorithm tag is added.
- `9618_w22_41_1(e)` — [QP PDF 3](../stage-1/facsimiles/9618_w22_qp_41/p003.png); [MS PDF 7,8](../stage-1/facsimiles/9618_w22_ms_41/p007.png). The row writes bubble-sort loops/swaps, outputs the sorted contents and calls the new procedure from main; sorting is the concrete primary operation.
- `9618_s23_42_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_s23_qp_42/p003.png); [MS PDF 7,8](../stage-1/facsimiles/9618_s23_ms_42/p007.png). Complete missing statements and preserve supplied loops and first-character access.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## INSERTION_SORT

**Sắp xếp chèn** — Implement insertion sorting

Lấy phần tử kế tiếp, dịch phần đã có thứ tự và chèn đúng chỗ; không nhầm với chèn một mục vào bảng top-N.

Ranh giới: Grow ordered prefix by extracting and shifting; recursive/iterative and record-key variants.

Biến thể phải giữ: iterative_or_recursive, record_key, direction.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w22_42_1(e)` — [QP PDF 3](../stage-1/facsimiles/9618_w22_qp_42/p003.png); [MS PDF 7,8](../stage-1/facsimiles/9618_w22_ms_42/p007.png). The procedure grows the ordered prefix by comparing priorities and shifting/inserting the complete job pair; this differs from appending a job and from sorting job numbers.
- `9618_s24_42_3(b)(i)` — [QP PDF 11](../stage-1/facsimiles/9618_s24_qp_42/p011.png); [MS PDF 38,39,40](../stage-1/facsimiles/9618_s24_ms_42/p038.png). Follow supplied recursive insertion structure, base case and inner shift loop.
- `9618_s25_43_2(b)` — [QP PDF 4](../stage-1/facsimiles/9618_s25_qp_43/p004.png); [MS PDF 20,21,22](../stage-1/facsimiles/9618_s25_ms_43/p020.png). Extract each next item, shift larger prefix elements and insert ascending without built-in sort.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## BINARY_SEARCH

**Tìm nhị phân trong mảng đã sắp** — Search a sorted array by interval reduction

Tính vị trí giữa, thu hẹp cận và trả vị trí hoặc sentinel; cần phân biệt bản lặp với bản bắt buộc đệ quy.

Ranh giới: Iterative/recursive variants, bounds, midpoint and sentinel; tree search is TREE_SEARCH.

Biến thể phải giữ: iterative_or_recursive, bounds, midpoint, return_contract.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_42_2(c)(i)` — [QP PDF 6](../stage-1/facsimiles/9618_s22_qp_42/p006.png); [MS PDF 22,23](../stage-1/facsimiles/9618_s22_ms_42/p022.png). Six completed statements, function parameters/recursive calls and the supplied integer-division logic are assessed; source defects are preserved, not endorsed.
- `9618_s24_41_1(e)(i)` — [QP PDF 4](../stage-1/facsimiles/9618_s24_qp_41/p004.png); [MS PDF 10,11](../stage-1/facsimiles/9618_s24_ms_41/p010.png). Iterative interval reduction, midpoint checks and index or minus-one return.
- `9618_s24_42_3(d)(i)` — [QP PDF 13](../stage-1/facsimiles/9618_s24_qp_42/p013.png); [MS PDF 47,48](../stage-1/facsimiles/9618_s24_ms_42/p047.png). Use four parameters, recursive bound changes, matching midpoint return and not-found base case.
- `9618_s25_43_2(e)` — [QP PDF 5](../stage-1/facsimiles/9618_s25_qp_43/p005.png); [MS PDF 26,27,28](../stage-1/facsimiles/9618_s25_ms_43/p026.png). Reduce sorted-array bounds, return middle index or -1; no built-in search.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STACK_SETUP

**Khởi tạo stack và con trỏ** — Declare or initialise stack state

Khai báo mảng, sức chứa và vị trí top theo đúng quy ước đề cho.

Ranh giới: Array capacity, values and top convention; general record declarations may be separate.

Biến thể phải giữ: capacity, element_type, top_convention, initial_top.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_42_1(a)` — [QP PDF 2](../stage-1/facsimiles/9618_s22_qp_42/p002.png); [MS PDF 4](../stage-1/facsimiles/9618_s22_ms_42/p004.png). Global StackData with ten integer slots and zero-initialised StackPointer are explicitly assessed.
- `9618_s23_41_3(a)` — [QP PDF 8](../stage-1/facsimiles/9618_s23_qp_41/p008.png); [MS PDF 26](../stage-1/facsimiles/9618_s23_ms_41/p026.png). Two string arrays with capacities 20 and 10 and both top pointers initialised to zero.
- `9618_w23_42_1(a)(i)` — [QP PDF 2](../stage-1/facsimiles/9618_w23_qp_42/p002.png); [MS PDF 4](../stage-1/facsimiles/9618_w23_ms_42/p004.png). Declare both named arrays with 100 letter slots each.
- `9618_s25_42_1(a)` — [QP PDF 2](../stage-1/facsimiles/9618_s25_qp_42/p002.png); [MS PDF 7](../stage-1/facsimiles/9618_s25_ms_42/p007.png). 20 string slots and current-top pointer -1.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STACK_PUSH

**Viết thao tác Push** — Implement push

Kiểm đầy, cập nhật top và lưu giá trị theo đúng thứ tự của quy ước con trỏ.

Ranh giới: Capacity test, pointer/index convention, write and result.

Biến thể phải giữ: current_top_or_next_free, capacity, return_contract.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_42_1(c)` — [QP PDF 2](../stage-1/facsimiles/9618_s22_qp_42/p002.png); [MS PDF 6,7](../stage-1/facsimiles/9618_s22_ms_42/p006.png). Check capacity, store at the next-free pointer, advance it and return success; this row implements Push rather than merely calling it.
- `9618_s23_41_3(b)(i)` — [QP PDF 8](../stage-1/facsimiles/9618_s23_qp_41/p008.png); [MS PDF 27,28](../stage-1/facsimiles/9618_s23_ms_41/p027.png). Check full, store data, advance next-free pointer and return Boolean success.
- `9618_w23_42_1(b)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_w23_qp_42/p003.png); [MS PDF 6,7](../stage-1/facsimiles/9618_w23_ms_42/p006.png). Classify a supplied letter as vowel or consonant, push into that stack, handle full and advance its top.
- `9618_s25_42_1(b)` — [QP PDF 2](../stage-1/facsimiles/9618_s25_qp_42/p002.png); [MS PDF 8,9](../stage-1/facsimiles/9618_s25_ms_42/p008.png). Full condition, increment top, store string, return integer -1 or1.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STACK_POP

**Viết thao tác Pop** — Implement pop

Kiểm rỗng, lấy giá trị và cập nhật top; kiểu sentinel là một phần của giao diện hàm.

Ranh giới: Empty case, read and pointer update; exact sentinel/type is a variant.

Biến thể phải giữ: top_convention, empty_return_type, update_order.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_42_1(e)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_42/p003.png); [MS PDF 11,12](../stage-1/facsimiles/9618_s22_ms_42/p011.png). MS distinguishes empty sentinel, access to the current top, pointer decrement and returned removed item.
- `9618_s23_41_3(b)(ii)` — [QP PDF 9](../stage-1/facsimiles/9618_s23_qp_41/p009.png); [MS PDF 28,29](../stage-1/facsimiles/9618_s23_ms_41/p028.png). Check empty, return top item and decrement pointer; empty returns empty string.
- `9618_w23_42_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_w23_qp_42/p003.png); [MS PDF 10,11,12](../stage-1/facsimiles/9618_w23_ms_42/p010.png). Implement both pop functions with empty detection and pointer decrement.
- `9618_s25_42_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_s25_qp_42/p003.png); [MS PDF 10,11](../stage-1/facsimiles/9618_s25_ms_42/p010.png). Return string -1 when empty; read current top and decrement.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STACK_PAIR

**Phối hợp hai stack và hoàn trả phần tử** — Coordinate two stacks with restoration

Lấy một cặp phần tử; nếu chỉ một bên có dữ liệu phải khôi phục phần tử chưa ghép được.

Ranh giới: Pop paired items and restore the unmatched one when the other stack is empty.

Biến thể phải giữ: empty_side, restoration_order, pair_output.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s23_41_3(c)` — [QP PDF 10](../stage-1/facsimiles/9618_s23_qp_41/p010.png); [MS PDF 36,37](../stage-1/facsimiles/9618_s23_ms_41/p036.png). Pop both items, output a pair when available or restore the unmatched item and message.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STACK_REDUCE

**Rút dữ liệu từ stack để tính kết quả** — Consume stack values to compute a result

Dùng Pop lặp lại để tính biểu thức hoặc tìm cực trị; không chỉ gọi Pop vài lần rồi in.

Ranh giới: Repeated pop with arithmetic/min/max; not merely calling Pop twice.

Biến thể phải giữ: arithmetic_or_extrema, operator_order, termination.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s25_42_1(e)` — [QP PDF 4](../stage-1/facsimiles/9618_s25_qp_42/p004.png); [MS PDF 14,15,16](../stage-1/facsimiles/9618_s25_ms_42/p014.png). Repeatedly pop alternating operators/numbers and maintain calculated total.
- `9618_w25_41_1(e)` — [QP PDF 3](../stage-1/facsimiles/9618_w25_qp_41/p003.png); [MS PDF 12,13](../stage-1/facsimiles/9618_w25_ms_41/p012.png). Pop until empty while finding maximum and minimum, then report both.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## QUEUE_SETUP

**Khởi tạo queue và trạng thái** — Declare or initialise queue state

Khai báo mảng/record, head, tail và count nếu có; phải giữ queue vòng hay tuyến tính theo đề.

Ranh giới: Linear/circular, array/record wrapper, head/tail/count conventions.

Biến thể phải giữ: linear_or_circular, head_tail_convention, count, capacity.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_41_3(a)` — [QP PDF 8](../stage-1/facsimiles/9618_s22_qp_41/p008.png); [MS PDF 27](../stage-1/facsimiles/9618_s22_ms_41/p027.png). The ten-element string queue and all three zero-initialised state variables are required.
- `9618_w22_42_3(a)` — [QP PDF 8](../stage-1/facsimiles/9618_w22_qp_42/p008.png); [MS PDF 20](../stage-1/facsimiles/9618_w22_ms_42/p020.png). QP requires appropriate initial pointers; MS gives head=-1/tail=0 as an example. No circular wrap or item counter is specified.
- `9618_s23_42_2(b)` — [QP PDF 5](../stage-1/facsimiles/9618_s23_qp_42/p005.png); [MS PDF 12,13](../stage-1/facsimiles/9618_s23_ms_42/p012.png). Five sale-record slots, empty record initialisation and head, tail, count set to zero.
- `9618_w23_41_2(a)(i)` — [QP PDF 4](../stage-1/facsimiles/9618_w23_qp_41/p004.png); [MS PDF 9](../stage-1/facsimiles/9618_w23_ms_41/p009.png). Declare 50-string queue, head minus one and next-free tail zero.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## QUEUE_ENQUEUE

**Viết thao tác Enqueue** — Implement enqueue

Kiểm đầy, thêm phần tử, xử lý phần tử đầu và cập nhật con trỏ/count; chỉ quay vòng khi đề yêu cầu.

Ranh giới: Full handling and queue pointer/count updates, including wrap when specified.

Biến thể phải giữ: linear_or_circular, next_free_or_last_item, wrap, full_condition.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_41_3(b)` — [QP PDF 9](../stage-1/facsimiles/9618_s22_qp_41/p009.png); [MS PDF 28,29](../stage-1/facsimiles/9618_s22_ms_41/p028.png). MS assesses completed queue indices/full return/count update plus function structure and reference-state handling, preserving circular wrap.
- `9618_w22_42_3(b)` — [QP PDF 8](../stage-1/facsimiles/9618_w22_qp_42/p008.png); [MS PDF 21](../stage-1/facsimiles/9618_w22_ms_42/p021.png). MS distinguishes tail capacity, append/advance, success return and initial head update; circular wrapping is not part of this operation.
- `9618_s23_42_2(c)` — [QP PDF 5](../stage-1/facsimiles/9618_s23_qp_42/p005.png); [MS PDF 14,15](../stage-1/facsimiles/9618_s23_ms_42/p014.png). Check full, insert at tail, wrap tail, increment count and return status.
- `9618_w23_41_2(a)(ii)` — [QP PDF 4](../stage-1/facsimiles/9618_w23_qp_41/p004.png); [MS PDF 10,11](../stage-1/facsimiles/9618_w23_ms_41/p010.png). Check full, insert at tail and increment it; set head for the first item.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## QUEUE_DEQUEUE

**Viết thao tác Dequeue** — Implement dequeue

Kiểm rỗng, lấy dữ liệu FIFO và cập nhật trạng thái; reset/wrap và việc giữ dữ liệu vật lý phụ thuộc đề.

Ranh giới: Empty handling, read and pointer/count updates, preserving stored slots when required.

Biến thể phải giữ: sentinel_type, reset_on_empty, wrap, physical_slot_retention.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_41_3(c)` — [QP PDF 9](../stage-1/facsimiles/9618_s22_qp_41/p009.png); [MS PDF 30,31](../stage-1/facsimiles/9618_s22_ms_41/p030.png). The function handles empty state, retrieves at head, updates head with wrap and decrements count; published example inconsistencies are not silently treated as correct variants.
- `9618_s23_42_2(d)` — [QP PDF 6](../stage-1/facsimiles/9618_s23_qp_42/p006.png); [MS PDF 16,17](../stage-1/facsimiles/9618_s23_ms_42/p016.png). Return empty record when empty; otherwise advance/wrap head and decrement count.
- `9618_w23_41_2(a)(iii)` — [QP PDF 4](../stage-1/facsimiles/9618_w23_qp_41/p004.png); [MS PDF 12,13](../stage-1/facsimiles/9618_w23_ms_41/p012.png). Empty gives a message and Empty string; otherwise return head data and advance head.
- `9618_s24_41_3(c)` — [QP PDF 11](../stage-1/facsimiles/9618_s24_qp_41/p011.png); [MS PDF 32,33](../stage-1/facsimiles/9618_s24_ms_41/p032.png). Return string false when empty or return next data with head update.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## QUEUE_INSPECT

**Xem các phần tử queue mà không lấy ra** — Read current queue contents without removing items

Duyệt phạm vi dữ liệu đang sống và trả/in nội dung, không thay head/tail hoặc giảm count.

Ranh giới: Follow live range for concatenation/output; not physical whole-array display or dequeue.

Biến thể phải giữ: live_bounds, format, pointer_convention.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w24_42_2(d)` — [QP PDF 9](../stage-1/facsimiles/9618_w24_qp_42/p009.png); [MS PDF 22,23](../stage-1/facsimiles/9618_w24_ms_42/p022.png). Concatenate the live queue range beginning at head, without removing data.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## QUEUE_REDUCE

**Xử lý hoặc cộng dồn dữ liệu queue** — Consume or recursively process queue data

Đọc các phần tử của queue để tích lũy; có thể rút qua Dequeue hoặc xử lý bằng đệ quy theo đề.

Ranh giới: Accumulate/process queue values; group-by and RLE also have their own assessed tags where implemented.

Biến thể phải giữ: destructive_or_readonly, iterative_or_recursive, sentinel.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w22_42_3(d)` — [QP PDF 9](../stage-1/facsimiles/9618_w22_qp_42/p009.png); [MS PDF 23](../stage-1/facsimiles/9618_w22_ms_42/p023.png). Rewrite the supplied iterative queue-total computation recursively, with base case, recurrence and returned sum; queue removal is not required.
- `9618_s25_43_1(e)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_s25_qp_43/p003.png); [MS PDF 17,18](../stage-1/facsimiles/9618_s25_ms_43/p017.png). Create queue then repeatedly dequeue until sentinel and accumulate all returned integers.
- `9618_w25_43_2(e)` — [QP PDF 10](../stage-1/facsimiles/9618_w25_qp_43/p010.png); [MS PDF 28,29](../stage-1/facsimiles/9618_w25_ms_43/p028.png). Consume queue, compare consecutive digits, count each run and append digit/count to global string.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## LIST_SETUP

**Khởi tạo linked list và free list** — Initialise linked-list and free-list storage

Tạo head, các liên kết và vùng trống theo bảng/mô hình; có thể là mảng hoặc object references.

Ranh giới: Record/2D array or object linked representation, head/free links and null conventions.

Biến thể phải giữ: array_or_objects, null_value, head, free_list.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_1(b)` — [QP PDF 3](../stage-1/facsimiles/9618_s21_qp_41/p003.png); [MS PDF 5,6](../stage-1/facsimiles/9618_s21_ms_41/p005.png). The array of node records, all supplied field values and both initial pointers are assessed.
- `9618_w24_41_3(a)` — [QP PDF 12](../stage-1/facsimiles/9618_w24_qp_41/p012.png); [MS PDF 26,27](../stage-1/facsimiles/9618_w24_ms_41/p026.png). Initialise a twenty-by-two linked array, all free links, head minus one and first free zero.
- `9618_s25_43_3(b)(i)` — [QP PDF 8](../stage-1/facsimiles/9618_s25_qp_43/p008.png); [MS PDF 36](../stage-1/facsimiles/9618_s25_ms_43/p036.png). LinkedList constructor creates a null HeadNode.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## LIST_TRAVERSE

**Duyệt linked list theo liên kết** — Follow linked-list links to output data

Đi từ head qua next để đọc/in theo thứ tự logic, không theo chỉ số mảng vật lý.

Ranh giới: Logical list order, not physical array order.

Biến thể phải giữ: head, null_sentinel, output_format.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_1(c)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_s21_qp_41/p003.png); [MS PDF 7](../stage-1/facsimiles/9618_s21_ms_41/p007.png). Marks distinguish following nextNode, outputting node data and advancing the pointer until -1 from printing physical array positions.
- `9618_w24_41_3(c)(i)` — [QP PDF 14](../stage-1/facsimiles/9618_w24_qp_41/p014.png); [MS PDF 31,32](../stage-1/facsimiles/9618_w24_ms_41/p031.png). Output data by following next links from FirstNode until the null pointer.
- `9618_s25_43_3(b)(iii)` — [QP PDF 9](../stage-1/facsimiles/9618_s25_qp_43/p009.png); [MS PDF 38,39](../stage-1/facsimiles/9618_s25_ms_43/p038.png). Follow GetNextNode from head and concatenate logical list order.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## LIST_INSERT

**Chèn node vào linked list** — Insert a linked-list node

Lấy node trống hoặc tạo object, nối vào vị trí yêu cầu và cập nhật head/link/free list.

Ranh giới: Head/tail position, free-list allocation/object creation and link updates are variants.

Biến thể phải giữ: front_or_tail, array_or_objects, free_list, full_case.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_1(d)(i)` — [QP PDF 4](../stage-1/facsimiles/9618_s21_qp_41/p004.png); [MS PDF 8,9,10](../stage-1/facsimiles/9618_s21_ms_41/p008.png). The function inputs a value, checks full storage, allocates a free node, finds the list end, updates links/free pointer and reports success.
- `9618_w24_41_3(b)` — [QP PDF 13](../stage-1/facsimiles/9618_w24_qp_41/p013.png); [MS PDF 28,29,30](../stage-1/facsimiles/9618_w24_ms_41/p028.png). For five inputs allocate a free node, link it at the front and update pointers; stop when full.
- `9618_s25_43_3(b)(ii)` — [QP PDF 8](../stage-1/facsimiles/9618_s25_qp_43/p008.png); [MS PDF 37](../stage-1/facsimiles/9618_s25_ms_43/p037.png). Create a Node from integer data, link it to previous head, replace head.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## LIST_REMOVE

**Xóa node khỏi linked list** — Remove a linked-list node

Bỏ node khớp yêu cầu, cập nhật link/head và trả node về free list khi cấu trúc yêu cầu.

Ranh giới: First occurrence, head/middle/tail cases, presence assumptions and free-list recycling.

Biến thể phải giữ: head_or_interior, presence_assumption, free_list, return_contract.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w24_41_3(d)(i)` — [QP PDF 15](../stage-1/facsimiles/9618_w24_qp_41/p015.png); [MS PDF 33,34,35](../stage-1/facsimiles/9618_w24_ms_41/p033.png). Find first occurrence, unlink it including head case and return node to the free list.
- `9618_s25_43_3(b)(iv)` — [QP PDF 9](../stage-1/facsimiles/9618_s25_qp_43/p009.png); [MS PDF 40,41,42](../stage-1/facsimiles/9618_s25_ms_43/p040.png). Handle empty/head/interior/not-found cases and return Boolean success.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## TREE_SETUP

**Khởi tạo cây nhị phân** — Initialise binary-tree storage

Thiết lập vùng node, root và free pointer hoặc object gốc; không tự đổi root parameter thành null.

Ranh giới: Array-backed nodes/root/free pointer or object tree wrapper; OOP constructor can be co-assessed.

Biến thể phải giữ: array_or_objects, root_parameter, empty_value, free_pointer.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w21_41_3(a)` — [QP PDF 8](../stage-1/facsimiles/9618_w21_qp_41/p008.png); [MS PDF 17](../stage-1/facsimiles/9618_w21_ms_41/p017.png). null-root/free-pointer initialisation and correctly shaped integer node storage are required; physical rows are not a traversal.
- `9618_w21_42_3(a)` — [QP PDF 8](../stage-1/facsimiles/9618_w21_qp_42/p008.png); [MS PDF 17](../stage-1/facsimiles/9618_w21_ms_42/p017.png). null-root/free-pointer initialisation and correctly shaped integer node storage are required; physical rows are not a traversal.
- `9618_w22_41_3(a)` — [QP PDF 8](../stage-1/facsimiles/9618_w22_qp_41/p008.png); [MS PDF 16](../stage-1/facsimiles/9618_w22_ms_41/p016.png). Create tree-node storage and initialise all60 integer cells to -1.
- `9618_s24_42_2(b)(i)` — [QP PDF 7](../stage-1/facsimiles/9618_s24_qp_42/p007.png); [MS PDF 27,28](../stage-1/facsimiles/9618_s24_ms_42/p027.png). TreeClass constructor creates twenty empty Node objects and initialises root and node count.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## TREE_INSERT

**Chèn node vào cây tìm kiếm nhị phân** — Insert a node in a binary search tree

Theo so sánh để tìm nhánh trống rồi nối node; giữ đúng quy tắc khóa bằng nhau và giới hạn sức chứa.

Ranh giới: Search insertion position and update links/pointers with stated equal-key/full rules.

Biến thể phải giữ: array_or_objects, equal_key_rule, capacity, root_case.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w21_41_3(b)` — [QP PDF 8,9](../stage-1/facsimiles/9618_w21_qp_41/p008.png); [MS PDF 18,19,20](../stage-1/facsimiles/9618_w21_ms_41/p018.png). The six completions and remaining pseudocode must correctly place a binary-search-tree node and propagate amended array/root/free state.
- `9618_w21_42_3(b)` — [QP PDF 8,9](../stage-1/facsimiles/9618_w21_qp_42/p008.png); [MS PDF 18,19,20](../stage-1/facsimiles/9618_w21_ms_42/p018.png). The six completions and remaining pseudocode must correctly place a binary-search-tree node and propagate amended array/root/free state.
- `9618_s24_42_2(b)(ii)` — [QP PDF 8](../stage-1/facsimiles/9618_s24_qp_42/p008.png); [MS PDF 29,30,31,32](../stage-1/facsimiles/9618_s24_ms_42/p029.png). Insert at next array slot, follow comparison-selected child links and update the parent's pointer.
- `9618_s25_41_3(c)(iii)` — [QP PDF 8](../stage-1/facsimiles/9618_s25_qp_41/p008.png); [MS PDF 37,38,39](../stage-1/facsimiles/9618_s25_ms_41/p037.png). Follow comparisons until a missing child; less goes left, greater-or-equal goes right, attach parameter Node.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## TREE_SEARCH

**Tìm giá trị trong cây nhị phân** — Search a binary search tree

So giá trị tại node rồi theo con trái/phải; không dùng cận low/high của mảng.

Ranh giới: Follow child pointers based on comparison; not sorted-array binary search.

Biến thể phải giữ: recursive_or_iterative, missing_case, return_contract.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w22_41_3(c)` — [QP PDF 9](../stage-1/facsimiles/9618_w22_qp_41/p009.png); [MS PDF 19,20](../stage-1/facsimiles/9618_w22_ms_41/p019.png). Complete the recursive tree-search returns and child choices; no midpoint or array-interval binary search is involved.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## TREE_TRAVERSE

**Duyệt cây theo thứ tự yêu cầu** — Traverse a tree in a specified order

Thứ tự xử lý node và các nhánh xác định inorder/postorder; khác hoàn toàn in các dòng mảng lưu cây.

Ranh giới: Inorder/postorder and representation/recursion variants; not physical array listing.

Biến thể phải giữ: inorder_or_postorder, array_or_objects, recursion.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w21_41_3(e)(i)` — [QP PDF 11](../stage-1/facsimiles/9618_w21_qp_41/p011.png); [MS PDF 22](../stage-1/facsimiles/9618_w21_ms_41/p022.png). MS distinguishes child checks, recursive calls and root output in left-root-right order; physical array printing is a different task.
- `9618_w21_42_3(e)(i)` — [QP PDF 11](../stage-1/facsimiles/9618_w21_qp_42/p011.png); [MS PDF 22](../stage-1/facsimiles/9618_w21_ms_42/p022.png). MS distinguishes child checks, recursive calls and root output in left-root-right order; physical array printing is a different task.
- `9618_w22_41_3(d)` — [QP PDF 10](../stage-1/facsimiles/9618_w22_qp_41/p010.png); [MS PDF 21](../stage-1/facsimiles/9618_w22_ms_41/p021.png). MS requires null-child checks, recursive child visits and data output in left-right-root order; it allows the root representation to match the implementation.
- `9618_s25_41_3(d)` — [QP PDF 9](../stage-1/facsimiles/9618_s25_qp_41/p009.png); [MS PDF 40,41](../stage-1/facsimiles/9618_s25_ms_41/p040.png). Recursive left/current/right order with null-child checks.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## HASH_SETUP

**Khởi tạo hash table và vùng va chạm** — Initialise hash-table and collision storage

Thiết lập bảng chính, spare hoặc bucket và bản ghi rỗng theo biểu diễn được cho.

Ranh giới: Bucket or spare-array representation and empty records.

Biến thể phải giữ: spare_or_bucket, dimensions, empty_record.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s25_42_2(b)(i)` — [QP PDF 6](../stage-1/facsimiles/9618_s25_qp_42/p006.png); [MS PDF 21](../stage-1/facsimiles/9618_s25_ms_42/p021.png). Declare main200 and spare100 record arrays.
- `9618_w25_41_3(b)` — [QP PDF 10](../stage-1/facsimiles/9618_w25_qp_41/p010.png); [MS PDF 27](../stage-1/facsimiles/9618_w25_ms_41/p027.png). Initialise every slot in100x10 record table to an empty record.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## HASH_FUNCTION

**Tính địa chỉ hash** — Compute hash address

Tính chỉ số từ khóa bằng công thức đề cho; chưa bao gồm xử lý va chạm.

Ranh giới: Apply specified key-to-address formula.

Biến thể phải giữ: modulus, key_type.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s25_42_2(c)` — [QP PDF 7](../stage-1/facsimiles/9618_s25_qp_42/p007.png); [MS PDF 24](../stage-1/facsimiles/9618_s25_ms_42/p024.png). Return key MOD200.
- `9618_w25_41_3(c)` — [QP PDF 10](../stage-1/facsimiles/9618_w25_qp_41/p010.png); [MS PDF 28](../stage-1/facsimiles/9618_w25_ms_41/p028.png). Return key MOD100.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## HASH_INSERT

**Chèn bản ghi và xử lý va chạm** — Insert a record with collision handling

Tính địa chỉ rồi dùng spare riêng hoặc ô trống trong bucket; không tự thay chiến lược va chạm.

Ranh giới: Separate spare array versus fixed bucket as variants.

Biến thể phải giữ: separate_spare_or_bucket, empty_key, capacity_assumption.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s25_42_2(d)` — [QP PDF 7](../stage-1/facsimiles/9618_s25_qp_42/p007.png); [MS PDF 25,26,27](../stage-1/facsimiles/9618_s25_ms_42/p025.png). Place record at hash address if empty, otherwise in next free Spare position.
- `9618_w25_41_3(d)` — [QP PDF 10](../stage-1/facsimiles/9618_w25_qp_41/p010.png); [MS PDF 29,30](../stage-1/facsimiles/9618_w25_ms_41/p029.png). Find empty slot in the ten-record bucket at the calculated row.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## HASH_SEARCH

**Tra bản ghi theo hash** — Retrieve a record using hash and collision storage

Tính địa chỉ và so khóa trong vùng va chạm để trả dữ liệu hoặc thông báo thiếu.

Ranh giới: Compute address then check colliding records for matching key.

Biến thể phải giữ: collision_representation, missing_return.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w25_41_3(f)` — [QP PDF 11](../stage-1/facsimiles/9618_w25_qp_41/p011.png); [MS PDF 33,34](../stage-1/facsimiles/9618_w25_ms_41/p033.png). Calculate bucket then scan its ten slots for key, returning data or Not found.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_CLASS

**Khai báo class và constructor** — Declare class and constructor

Tạo thuộc tính, quyền truy cập và constructor; giá trị tham số/default phải theo bảng lớp.

Ranh giới: Attributes, visibility, constructor parameters/defaults; OOP composition via object arrays is a variant.

Biến thể phải giữ: visibility, parameter_mapping, defaults, composition.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_3(a)` — [QP PDF 8](../stage-1/facsimiles/9618_s21_qp_41/p008.png); [MS PDF 21,22](../stage-1/facsimiles/9618_s21_ms_41/p021.png). The class identity and private typed attributes are assessed; this is the encapsulated TreasureChest context, not the record substitute in1(a).
- `9618_s22_41_2(a)` — [QP PDF 5](../stage-1/facsimiles/9618_s22_qp_41/p005.png); [MS PDF 19,20](../stage-1/facsimiles/9618_s22_ms_41/p019.png). The class and private typed attributes, two constructor parameters, parameter assignments and default health100 are assessed.
- `9618_s22_42_3(a)` — [QP PDF 7](../stage-1/facsimiles/9618_s22_qp_42/p007.png); [MS PDF 25,26](../stage-1/facsimiles/9618_s22_ms_42/p025.png). The private typed attributes and two-parameter constructor belong to an encapsulated Card class.
- `9618_w21_41_2(a)` — [QP PDF 4](../stage-1/facsimiles/9618_w21_qp_41/p004.png); [MS PDF 8,9](../stage-1/facsimiles/9618_w21_ms_41/p008.png). The class, four typed private attributes, four-parameter constructor and assignments are assessed.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_SUBCLASS

**Khai báo lớp con và constructor** — Declare subclass and constructor

Thể hiện kế thừa, thêm thuộc tính và gọi constructor lớp cha với đúng tham số.

Ranh giới: Inheritance, inherited/new attributes and parent constructor call.

Biến thể phải giữ: parent, new_attributes, super_call.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s23_41_2(b)(i)` — [QP PDF 6](../stage-1/facsimiles/9618_s23_qp_41/p006.png); [MS PDF 18,19](../stage-1/facsimiles/9618_s23_ms_41/p018.png). Declare inheritance, initialise additional attributes and call the parent constructor.
- `9618_s23_42_3(b)(i)` — [QP PDF 10](../stage-1/facsimiles/9618_s23_qp_42/p010.png); [MS PDF 28,29](../stage-1/facsimiles/9618_s23_ms_42/p028.png). Manager inherits Employee, calls its constructor and stores bonus value.
- `9618_w23_41_3(c)(i)` — [QP PDF 10](../stage-1/facsimiles/9618_w23_qp_41/p010.png); [MS PDF 32](../stage-1/facsimiles/9618_w23_ms_41/p032.png). BikeCharacter inherits Character and calls its parent constructor.
- `9618_w23_42_3(c)(i)` — [QP PDF 12](../stage-1/facsimiles/9618_w23_qp_42/p012.png); [MS PDF 30,31](../stage-1/facsimiles/9618_w23_ms_42/p030.png). MagicCharacter inherits Character, calls the parent and stores Element.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_GET

**Viết accessor trả dữ liệu đang lưu** — Implement an accessor

Trả thuộc tính hoặc phần tử thành viên được chỉ định; tên Get không đủ nếu hàm phải tính hoặc ghép chuỗi.

Ranh giới: Return stored attribute or indexed member; computed business results are RULE_COMPUTE.

Biến thể phải giữ: scalar_or_indexed_member, return_type.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_3(c)(i)` — [QP PDF 10](../stage-1/facsimiles/9618_s21_qp_41/p010.png); [MS PDF 25](../stage-1/facsimiles/9618_s21_ms_41/p025.png). Return the stored question attribute; no derived score or predicate is computed.
- `9618_s22_41_2(b)` — [QP PDF 5](../stage-1/facsimiles/9618_s22_qp_41/p005.png); [MS PDF 20](../stage-1/facsimiles/9618_s22_ms_41/p020.png). The accessor takes no business parameter and returns the stored defence item.
- `9618_s22_42_3(b)` — [QP PDF 7](../stage-1/facsimiles/9618_s22_qp_42/p007.png); [MS PDF 27](../stage-1/facsimiles/9618_s22_ms_42/p027.png). The two methods return stored attributes; neither computes a new rule-based value.
- `9618_w21_41_2(b)` — [QP PDF 4](../stage-1/facsimiles/9618_w21_qp_41/p004.png); [MS PDF 10](../stage-1/facsimiles/9618_w21_ms_41/p010.png). Four direct attribute getters are requested; these are not the later multi-condition search.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_SET

**Viết setter gán trực tiếp** — Implement a direct setter

Gán tham số vào thuộc tính/phần tử; phép tăng tương đối hoặc clamp thuộc OOP_UPDATE.

Ranh giới: Replace an attribute with parameter; arithmetic/clamping update uses OOP_UPDATE.

Biến thể phải giữ: scalar_or_indexed_member, parameter_order.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w21_41_2(c)` — [QP PDF 5](../stage-1/facsimiles/9618_w21_qp_41/p005.png); [MS PDF 11](../stage-1/facsimiles/9618_w21_ms_41/p011.png). The setter takes a new description and assigns it directly, with no relative arithmetic or computed value.
- `9618_w21_42_2(c)` — [QP PDF 5](../stage-1/facsimiles/9618_w21_qp_42/p005.png); [MS PDF 11](../stage-1/facsimiles/9618_w21_ms_42/p011.png). The setter takes a new description and assigns it directly, with no relative arithmetic or computed value.
- `9618_s23_41_2(a)(iii)` — [QP PDF 5](../stage-1/facsimiles/9618_s23_qp_41/p005.png); [MS PDF 16](../stage-1/facsimiles/9618_s23_ms_41/p016.png). Two setter methods directly assign parameter values to attributes.
- `9618_w23_42_3(a)(iii)` — [QP PDF 11](../stage-1/facsimiles/9618_w23_qp_42/p011.png); [MS PDF 25](../stage-1/facsimiles/9618_w23_ms_42/p025.png). SetIntelligence assigns the parameter directly.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_UPDATE

**Cập nhật trạng thái object theo quy tắc** — Update object state according to a rule

Thay đổi tương đối, phần trăm, tọa độ hoặc giới hạn; phân biệt phép cộng với thay thế trực tiếp.

Ranh giới: Relative/percentage changes, movement, caps and multiple attributes.

Biến thể phải giữ: add_or_scale, direction, clamp, multiple_attributes.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_41_2(c)` — [QP PDF 6](../stage-1/facsimiles/9618_s22_qp_41/p006.png); [MS PDF 21](../stage-1/facsimiles/9618_s22_ms_41/p021.png). The parameter is added to existing health; this is a relative update, not replacement by a setter.
- `9618_w22_42_2(c)` — [QP PDF 6](../stage-1/facsimiles/9618_w22_qp_42/p006.png); [MS PDF 13](../stage-1/facsimiles/9618_w22_ms_42/p013.png). Both coordinate deltas are added to existing state, distinguishing relative movement from direct setters.
- `9618_s23_41_2(a)(iv)` — [QP PDF 5](../stage-1/facsimiles/9618_s23_qp_41/p005.png); [MS PDF 17](../stage-1/facsimiles/9618_s23_ms_41/p017.png). Increase current speed with maximum limit and update horizontal position in every case.
- `9618_s23_42_3(a)(iii)` — [QP PDF 9](../stage-1/facsimiles/9618_s23_qp_42/p009.png); [MS PDF 26](../stage-1/facsimiles/9618_s23_ms_42/p026.png). Calculate hours times hourly pay and store the result at the correct week index.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_OVERRIDE

**Ghi đè hành vi kế thừa** — Override inherited behaviour

Định nghĩa hành vi chuyên biệt cho cùng phương thức; có thể gọi lại phương thức cha.

Ranh giới: Specialised method behavior and optional parent method call, not merely subclass declaration.

Biến thể phải giữ: parent_call, subclass_rule, return_or_update.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s23_41_2(b)(ii)` — [QP PDF 6](../stage-1/facsimiles/9618_s23_qp_41/p006.png); [MS PDF 20,21](../stage-1/facsimiles/9618_s23_ms_41/p020.png). Override speed increase, cap vertical height and preserve the horizontal update.
- `9618_s23_42_3(b)(ii)` — [QP PDF 10](../stage-1/facsimiles/9618_s23_qp_42/p010.png); [MS PDF 29](../stage-1/facsimiles/9618_s23_ms_42/p029.png). Adjust hours by bonus percentage and call parent SetPay with week and adjusted hours.
- `9618_w23_41_3(c)(ii)` — [QP PDF 10](../stage-1/facsimiles/9618_w23_qp_41/p010.png); [MS PDF 33,34](../stage-1/facsimiles/9618_w23_ms_41/p033.png). Override Move and change directional movement to twenty through existing coordinate helpers.
- `9618_w23_42_3(c)(ii)` — [QP PDF 12](../stage-1/facsimiles/9618_w23_qp_42/p012.png); [MS PDF 32,33](../stage-1/facsimiles/9618_w23_ms_42/p032.png). Override Learn and apply the element-dependent intelligence increase.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_INSTANTIATE

**Tạo và lưu các instance** — Construct instances from supplied or input data

Dùng class đã có với dữ liệu chỉ định hoặc đầu vào; không phải viết lại định nghĩa class.

Ranh giới: Create and store named objects or object arrays; class definition separately assessed.

Biến thể phải giữ: fixed_or_input_data, single_or_array, composition.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_3(b)` — [QP PDF 9](../stage-1/facsimiles/9618_s21_qp_41/p009.png); [MS PDF 22,23,24,25](../stage-1/facsimiles/9618_s21_ms_41/p022.png). Read question/answer/points groups, construct TreasureChest objects and store them in arrayTreasure; array declaration and object creation are explicit criteria alongside file handling.
- `9618_s22_41_2(e)` — [QP PDF 6](../stage-1/facsimiles/9618_s22_qp_41/p006.png); [MS PDF 23](../stage-1/facsimiles/9618_s22_ms_41/p023.png). Input strings and construction of Balloon1 with those values are explicitly assessed.
- `9618_s22_42_3(c)` — [QP PDF 8](../stage-1/facsimiles/9618_s22_qp_42/p008.png); [MS PDF 28,29,30](../stage-1/facsimiles/9618_s22_ms_42/p028.png). The30-element object array, per-record object construction and file reading/storage are explicit marking requirements.
- `9618_w21_41_2(e)` — [QP PDF 5](../stage-1/facsimiles/9618_w21_qp_41/p005.png); [MS PDF 12,13,14](../stage-1/facsimiles/9618_w21_ms_41/p012.png). Read records, create/store one Picture per record, handle the file and count/return objects; array declaration is prior context, not newly assessed storage setup.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OOP_CAPACITY_ADD

**Thêm object vào tập hợp có giới hạn** — Add an object to a capacity-limited aggregate

Kiểm giới hạn của object chứa, thêm phần tử con và cập nhật count, như thêm tàu vào ga.

Ranh giới: For example station platforms/train array; object-level collection and count update.

Biến thể phải giữ: capacity_attribute, count, return_contract.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w25_41_2(c)(ii)` — [QP PDF 7](../stage-1/facsimiles/9618_w25_qp_41/p007.png); [MS PDF 20](../stage-1/facsimiles/9618_w25_ms_41/p020.png). Check platform capacity, store Train, increment count and return Boolean.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## RULE_COMPUTE

**Tính kết quả từ quy tắc hoặc bảng** — Compute a result from a stated rule or table

Tính điểm, xác suất, tuổi, số năm hoặc kết quả điều kiện theo dữ kiện; không tự thay giả định của đề.

Ranh giới: Scoring, probabilities, age, years, arithmetic or condition-based result; preserve stated assumptions.

Biến thể phải giữ: table_lookup, bands, units, rounding, assumptions.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_3(c)(ii)` — [QP PDF 10](../stage-1/facsimiles/9618_s21_qp_41/p010.png); [MS PDF 26](../stage-1/facsimiles/9618_s21_ms_41/p026.png). The method accepts an answer, compares it with the object's answer and returns the correctness predicate; its name does not make it a stored-attribute accessor.
- `9618_s22_41_2(d)` — [QP PDF 6](../stage-1/facsimiles/9618_s22_qp_41/p006.png); [MS PDF 22](../stage-1/facsimiles/9618_s22_ms_41/p022.png). The method computes a Boolean from the health threshold and returns both outcomes; it is not a stored-attribute getter.
- `9618_w22_41_2(c)(i)` — [QP PDF 7](../stage-1/facsimiles/9618_w22_qp_41/p007.png); [MS PDF 13,14](../stage-1/facsimiles/9618_w22_ms_41/p013.png). Loop over five cards through existing accessors, add the stated colour bonuses and numbers, and return one score; no grouping by repeated keys is requested.
- `9618_s23_42_3(a)(iii)` — [QP PDF 9](../stage-1/facsimiles/9618_s23_qp_42/p009.png); [MS PDF 26](../stage-1/facsimiles/9618_s23_ms_42/p026.png). Calculate hours times hourly pay and store the result at the correct week index.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## VALIDATE_INPUT

**Kiểm tra và yêu cầu nhập lại** — Validate and repeat user input

Ràng buộc miền, độ dài, lựa chọn hoặc sự tồn tại; dùng vòng lặp đến khi điều kiện hợp lệ.

Ranh giới: Range/length/choice/type/availability conditions and termination; check digit has own tag.

Biến thể phải giữ: range, length, choice, type, termination.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_3(c)(iv)` — [QP PDF 11](../stage-1/facsimiles/9618_s21_qp_41/p011.png); [MS PDF 28,29,30](../stage-1/facsimiles/9618_s21_ms_41/p028.png). Main orchestration selects/validates a question, repeats answer checking, counts attempts and outputs computed points using existing methods.
- `9618_s22_41_1(e)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_41/p003.png); [MS PDF 10,11](../stage-1/facsimiles/9618_s22_ms_41/p010.png). Marks distinguish obtaining inputs, ensuring a three-character name and validating the integer score range.
- `9618_s22_42_3(d)` — [QP PDF 8](../stage-1/facsimiles/9618_s22_qp_42/p008.png); [MS PDF 31,32,33](../stage-1/facsimiles/9618_s22_ms_42/p031.png). The function validates range, rejects already selected cards, records a newly taken card and returns its index; checking availability differs from an ordinary key search.
- `9618_w22_41_1(c)` — [QP PDF 2](../stage-1/facsimiles/9618_w22_qp_41/p002.png); [MS PDF 4,5](../stage-1/facsimiles/9618_w22_ms_41/p004.png). MS requires input range/type validation, scanning all100 entries, incrementing a count for each match and returning the total; FindValues is not an existence-only search.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## UNIQUE_SELECTION

**Chọn hoặc chấp nhận mỗi mục một lần** — Accept unused items or answers without replacement

Theo dõi mục/đáp án đã dùng, từ chối lựa chọn lặp; có thể lưu vị trí hoặc đánh dấu đáp án đã tiêu thụ.

Ranh giới: Track selected positions or mark matched answers consumed; reject repeated acceptance. Preserve position-choice versus answer-matching variants.

Biến thể phải giữ: index_or_answer, tracking_structure, consume_marker.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s22_42_3(d)` — [QP PDF 8](../stage-1/facsimiles/9618_s22_qp_42/p008.png); [MS PDF 31,32,33](../stage-1/facsimiles/9618_s22_ms_42/p031.png). The function validates range, rejects already selected cards, records a newly taken card and returns its index; checking availability differs from an ordinary key search.
- `9618_s24_42_1(c)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_s24_qp_42/p003.png); [MS PDF 8,9,10,11](../stage-1/facsimiles/9618_s24_ms_42/p008.png). Search entered words against answers, report matches, replace accepted answers with null, count them and stop on no.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## CHECK_DIGIT

**Kiểm tra dữ liệu bằng check digit** — Validate data using a check-digit algorithm

Tính chữ số kiểm tra theo đúng công thức đề cho, kể cả chia và làm tròn xuống; không mặc định công thức modulo. So sánh rồi chấp nhận hoặc loại payload.

Ranh giới: Compute the source-specified weighted arithmetic and comparison, including stated division/rounding or modulus. Never assume a standard modulo formula.

Biến thể phải giữ: weights, division_or_modulus, rounding, input_length, payload.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s24_41_3(d)(i)` — [QP PDF 12](../stage-1/facsimiles/9618_s24_qp_41/p012.png); [MS PDF 33,34,35,36](../stage-1/facsimiles/9618_s24_ms_41/p033.png). Apply alternating weights, divide total by ten and round down, handle X, enqueue valid payloads and count invalid entries.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STRING_COMPARE

**So sánh chuỗi từng ký tự** — Compare strings character by character

Tự tìm vị trí ký tự khác đầu tiên theo giả định độ dài/prefix; không dùng hàm so sánh dựng sẵn khi bị cấm.

Ranh giới: Manual lexicographic comparison with source length/prefix assumptions.

Biến thể phải giữ: prefix_assumption, character_order, built_in_restriction.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w24_41_1(c)` — [QP PDF 4](../stage-1/facsimiles/9618_w24_qp_41/p004.png); [MS PDF 8,9](../stage-1/facsimiles/9618_w24_ms_41/p008.png). Compare corresponding characters until different and return which parameter comes first.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STRING_SPLIT

**Tách chuỗi thành các token** — Split delimited text into string tokens

Trả các chuỗi con đã bỏ dấu phân cách; giữ quy định tự cài đặt khi đề cấm built-in. Phân phối giá trị có kiểu vào nhiều mảng thuộc STRING_ROUTE.

Ranh giới: Return separate string tokens with delimiters removed; manual-versus-built-in restriction is a variant. Typed parsing and dispatch into destination arrays uses STRING_ROUTE.

Biến thể phải giữ: delimiter, fixed_token_count, built_in_restriction.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w25_43_3(b)(ii)` — [QP PDF 13](../stage-1/facsimiles/9618_w25_qp_43/p013.png); [MS PDF 35,36,37](../stage-1/facsimiles/9618_w25_ms_43/p035.png). Manually build four tokens without semicolons; no built-in splitting allowed.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## STRING_ROUTE

**Phân tích bản ghi chuỗi và phân phối giá trị** — Parse typed string records and route values

Tách trường có kiểu, dùng trường phân loại để chọn mảng đích rồi lưu giá trị còn lại; không chỉ tạo danh sách token.

Ranh giới: Split compound records, interpret typed fields, select destination by a category field and store another field there; not merely tokenisation or a conditional Push of an already supplied character.

Biến thể phải giữ: field_layout, category_to_array, value_type, destinations.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_s25_41_2(b)` — [QP PDF 4](../stage-1/facsimiles/9618_s25_qp_41/p004.png); [MS PDF 21,22,23,24,25](../stage-1/facsimiles/9618_s25_ms_41/p021.png). Split integer/colour strings, interpret integer values and route them into six separate colour arrays; this is more than returning tokens.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## RUN_LENGTH_ENCODE

**Mã hóa các đoạn ký tự lặp liên tiếp** — Encode consecutive runs

Đếm từng run liên tiếp và ghép ký tự/số lượng; không gộp mọi lần xuất hiện rời nhau.

Ranh giới: Digit/character followed by count; max-run and nonempty assumptions are variants.

Biến thể phải giữ: max_run, nonempty_input, source_queue, final_run.

**Ít bằng chứng:** chỉ xuất hiện trực tiếp trong tối đa hai nhóm nội dung của corpus; cần giữ khi nối syllabus, không suy ra ít quan trọng.

- `9618_w25_43_2(e)` — [QP PDF 10](../stage-1/facsimiles/9618_w25_qp_43/p010.png); [MS PDF 28,29](../stage-1/facsimiles/9618_w25_ms_43/p028.png). Consume queue, compare consecutive digits, count each run and append digit/count to global string.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## ALGORITHM_TRANSLATE

**Cài đặt thuật toán cho sẵn chưa có dạng riêng** — Implement a supplied otherwise unnamed algorithm

Chuyển đúng thuật toán được mô tả bằng pseudocode; dùng khi chưa phù hợp dạng thao tác cụ thể hơn.

Ranh giới: Use only where no specific operation pattern fits; recursion/iteration, parameters and outputs explicit.

Biến thể phải giữ: recursive_or_iterative, division, parameter_updates, side_effects.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w21_41_1(a)` — [QP PDF 2](../stage-1/facsimiles/9618_w21_qp_41/p002.png); [MS PDF 3](../stage-1/facsimiles/9618_w21_ms_41/p003.png). The named function, correct integer division and preservation of the supplied recursive pseudocode are assessed; no named search/sort/ADT operation fits.
- `9618_w21_42_1(a)` — [QP PDF 2](../stage-1/facsimiles/9618_w21_qp_42/p002.png); [MS PDF 3](../stage-1/facsimiles/9618_w21_ms_42/p003.png). The named function, correct integer division and preservation of the supplied recursive pseudocode are assessed; no named search/sort/ADT operation fits.
- `9618_w23_42_2(a)(i)` — [QP PDF 6,7](../stage-1/facsimiles/9618_w23_qp_42/p006.png); [MS PDF 17,18](../stage-1/facsimiles/9618_w23_ms_42/p017.png). Follow the supplied loop and modulus test, accumulating divisors and returning their sum.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## ALGORITHM_REWRITE

**Chuyển đổi giữa đệ quy và vòng lặp** — Transform between recursive and iterative forms

Giữ hành vi khi thay cấu trúc thực hiện; dạng thuật toán cụ thể vẫn được giữ làm nhãn assessed khi có.

Ranh giới: Preserve algorithm behavior; co-tag specific algorithm when relevant.

Biến thể phải giữ: direction, accumulator, output_order, parameters.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_w21_41_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_w21_qp_41/p003.png); [MS PDF 6,7](../stage-1/facsimiles/9618_w21_ms_41/p006.png). MS requires iterative control with two parameters, the correct accumulator/updates, intermediate outputs and final return, preserving both branches and the base case.
- `9618_w21_42_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_w21_qp_42/p003.png); [MS PDF 6,7](../stage-1/facsimiles/9618_w21_ms_42/p006.png). MS requires iterative control with two parameters, the correct accumulator/updates, intermediate outputs and final return, preserving both branches and the base case.
- `9618_w22_42_3(d)` — [QP PDF 9](../stage-1/facsimiles/9618_w22_qp_42/p009.png); [MS PDF 23](../stage-1/facsimiles/9618_w22_ms_42/p023.png). Rewrite the supplied iterative queue-total computation recursively, with base case, recurrence and returned sum; queue removal is not required.
- `9618_w23_41_1(b)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_w23_qp_41/p003.png); [MS PDF 6,7,8](../stage-1/facsimiles/9618_w23_ms_41/p006.png). Use empty-string base case and recursive calls on the shorter string with vowel-dependent increment.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## MAIN_FLOW

**Ghép lời gọi và điều khiển chương trình** — Compose existing calls and control program flow

Thực hiện trình tự gọi, truyền dữ liệu, lặp lời gọi và xử lý kết quả; thuật toán được gọi thuộc context.

Ranh giới: Top-level or helper-function orchestration: call sequence, input-to-call plumbing, looped calls and simple result handling; invoked algorithms are context.

Biến thể phải giữ: call_order, repetition, input_plumbing, result_branch.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_1(d)(ii)` — [QP PDF 4](../stage-1/facsimiles/9618_s21_qp_41/p004.png); [MS PDF 11,12,13](../stage-1/facsimiles/9618_s21_ms_41/p011.png). Marks require addNode with appropriate parameters/result handling and traversal calls before and after; the insertion code was assessed in the previous part.
- `9618_s22_41_1(d)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_41/p003.png); [MS PDF 8](../stage-1/facsimiles/9618_s22_ms_41/p008.png). Marks require the two existing procedure calls in the correct order.
- `9618_s22_42_1(d)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_42/p003.png); [MS PDF 8,9](../stage-1/facsimiles/9618_s22_ms_42/p008.png). The main program obtains eleven values, calls Push and reports its Boolean result before calling the existing display procedure.
- `9618_w21_41_1(b)(i)` — [QP PDF 3](../stage-1/facsimiles/9618_w21_qp_41/p003.png); [MS PDF 4](../stage-1/facsimiles/9618_w21_ms_41/p004.png). The main program identifies the parameters, makes all three prescribed calls and outputs their return values.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## OUTPUT_FORMAT

**Trình bày hoặc trả dữ liệu đúng định dạng** — Output or return data in a specified format

In mảng/lưới/bảng hoặc ghép chuỗi thông tin; không mặc nhiên là getter hay traversal logic.

Ranh giới: Grid/array/object messages/concatenation without changing logical data structure.

Biến thể phải giữ: grid_or_line, physical_or_logical, concatenation, labels.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s22_41_1(c)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_41/p003.png); [MS PDF 7](../stage-1/facsimiles/9618_s22_ms_41/p007.png). The procedure loops through storage and emits each name/score pair together on its own line.
- `9618_s22_42_1(b)` — [QP PDF 2](../stage-1/facsimiles/9618_s22_qp_42/p002.png); [MS PDF 5](../stage-1/facsimiles/9618_s22_ms_42/p005.png). Output all ten physical slots and the pointer, including unused/popped slots where present; no stack traversal/pop is implemented.
- `9618_w21_41_3(c)` — [QP PDF 10](../stage-1/facsimiles/9618_w21_qp_41/p010.png); [MS PDF 21](../stage-1/facsimiles/9618_w21_ms_41/p021.png). The procedure prints every stored node row in physical array order with field order/spacing; it does not follow tree links or sort node data.
- `9618_w21_42_3(c)` — [QP PDF 10](../stage-1/facsimiles/9618_w21_qp_42/p010.png); [MS PDF 21](../stage-1/facsimiles/9618_w21_ms_42/p021.png). The procedure prints every stored node row in physical array order with field order/spacing; it does not follow tree links or sort node data.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.

## EVIDENCE_RUN

**Chạy test và ghi minh chứng** — Run prescribed tests and capture evidence

Dùng dữ kiện đề chỉ định và ghi đủ input/output/file vào đúng chỗ; không tính là cài thuật toán lần nữa.

Ranh giới: Required inputs/outputs/screenshots; algorithms under test are context, not newly implemented.

Biến thể phải giữ: prescribed_inputs, multiple_runs, file_content, filename_visibility.

Có bằng chứng trực tiếp trong hơn hai nhóm nội dung; không suy ra xác suất ra đề.

- `9618_s21_41_1(c)(ii)` — [QP PDF 3](../stage-1/facsimiles/9618_s21_qp_41/p003.png); [MS PDF 8](../stage-1/facsimiles/9618_s21_ms_41/p008.png). The mark is for the screenshot of the traversal output; calling the existing procedure does not newly implement traversal.
- `9618_s22_41_1(d)(ii)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_41/p003.png); [MS PDF 9](../stage-1/facsimiles/9618_s22_ms_41/p009.png). The screenshot of loaded high scores is assessed; file reading and formatted output are under test.
- `9618_s22_42_1(d)(ii)` — [QP PDF 3](../stage-1/facsimiles/9618_s22_qp_42/p003.png); [MS PDF 10](../stage-1/facsimiles/9618_s22_ms_42/p010.png). Screenshot evidence of all eleven inputs, capacity messages and the stored array is assessed.
- `9618_w21_41_1(b)(ii)` — [QP PDF 3](../stage-1/facsimiles/9618_w21_qp_41/p003.png); [MS PDF 5](../stage-1/facsimiles/9618_w21_ms_41/p005.png). The marks concern screenshots for all three parameter pairs and their recursive outputs/returns.

Mọi trang tiếp nối và biến thể của từng ý nằm trong `EXAM_PATTERN_CATALOG.json` / `QUESTION_PATTERN_MAP.json`; link ảnh mở trang đầu tiên trong khoảng dẫn nguồn.
