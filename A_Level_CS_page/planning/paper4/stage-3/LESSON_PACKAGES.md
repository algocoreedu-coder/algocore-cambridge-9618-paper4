# Lesson packages — Stage 3

13 gói, 26 lesson, 108 knowledge block; VI/EN dùng chung IDs. Các URL là đích dự kiến, chưa được tạo trên website. 10 khối learning page được giữ ở từng gói.

37 đích bài luyện là nhóm sản xuất dự kiến. Các yêu cầu đánh giá theo mục tiêu có thể dùng chung một bài; không phải số bài đã viết.

## Tiên quyết và kỹ năng thực hành / Prerequisites and practical skills

ID: `ac-9618-p4-2026-python.package.foundations`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### data-models — Dữ liệu, mảng và bản ghi

Data, arrays and records

Tiên quyết: Không có
Routes dự kiến: `/vi/docs/paper-4/data-models`; `/en/docs/paper-4/data-models`

- `knowledge-scalars-types-scope` — Kiểu, hằng, biến và phạm vi / Types, constants, variables and scope; SYL-20.1-03, SYL-10.1-01, SYL-11.1-01; BOOK-10-TYPES, BOOK-11-BASICS, BOOK-11-SUBROUTINES
- `knowledge-array-representation` — Mảng một chiều, hai chiều và giới hạn chỉ số / One- and two-dimensional arrays and index bounds; SYL-20.1-03, SYL-10.2-01, SYL-10.2-02; BOOK-10-ARRAYS
- `knowledge-record-fields` — Trường bản ghi và lớp thay thế record / Record fields and a class used as a record substitute; SYL-10.1-02, SYL-10.1-03; BOOK-10-RECORDS
- `knowledge-bounded-append` — Vị trí kế tiếp và chèn vào mảng có giới hạn / Next position and bounded array append; SYL-20.1-03; BOOK-10-ARRAYS, BOOK-11-CONSTRUCTS
- `knowledge-random-data` — Dữ liệu ngẫu nhiên và miền giá trị / Random data and allowed ranges; SYL-20.1-03; BOOK-10-ARRAYS, BOOK-11-LIBRARY
- `knowledge-identifier-contract` — Tên, vai trò dữ liệu và biểu thức / Identifiers, data roles and expressions; SYL-9.2-02, SYL-11.1-02; BOOK-09-ALGORITHM, BOOK-11-BASICS
### procedural-design — Thiết kế chương trình theo thủ tục

Procedural program design

Tiên quyết: data-models
Routes dự kiến: `/vi/docs/paper-4/procedural-design`; `/en/docs/paper-4/procedural-design`

- `knowledge-selection-iteration` — Rẽ nhánh, lặp và điều kiện dừng / Selection, iteration and stopping conditions; SYL-20.1-04, SYL-11.2-01, SYL-11.2-02, SYL-11.2-03, SYL-11.2-04; BOOK-11-CONSTRUCTS
- `knowledge-subroutine-contracts` — Procedure, function, tham số và giá trị trả về / Procedures, functions, parameters and returns; SYL-20.1-05, SYL-20.1-06, SYL-11.3-01, SYL-11.3-03, SYL-11.3-04, SYL-11.3-05; BOOK-11-SUBROUTINES
- `knowledge-parameter-modes` — Truyền tham số và tác động lên dữ liệu / Parameter passing and effects on data; SYL-11.3-02; BOOK-11-SUBROUTINES
- `knowledge-pseudocode-translation` — Đọc và triển khai pseudocode theo hợp đồng / Reading and implementing supplied pseudocode; SYL-9.2-01, SYL-9.2-03; BOOK-09-ALGORITHM, BOOK-11-CONSTRUCTS
- `knowledge-decomposition` — Chia việc và ghép lời gọi theo thứ tự / Decomposition and ordered composition; SYL-20.1-05, SYL-9.1-02, SYL-9.2-04, SYL-12.2-01, P4-ADM-14; BOOK-09-DECOMPOSE, BOOK-12-DESIGN, BOOK-20-PROCEDURAL
- `knowledge-paradigm-choice` — Đặc trưng procedural và hướng đối tượng / Characteristics of procedural and object-oriented paradigms; SYL-20.1-01; BOOK-20-PROCEDURAL, BOOK-20-CLASS
- `knowledge-abstraction-io` — Mô hình dữ liệu thiết yếu và input-process-output / Essential-data models and input-process-output; SYL-9.1-01, SYL-9.2-01, SYL-9.2-03; BOOK-09-DECOMPOSE, BOOK-09-ALGORITHM
- `knowledge-console-library` — Nhập/xuất console và hàm thư viện phù hợp / Console I/O and suitable library functions; SYL-11.1-03, SYL-11.1-04; BOOK-11-BASICS, BOOK-11-LIBRARY, BOOK-11-STRINGS
### validation-rules — Kiểm tra dữ liệu và tính theo quy tắc

Validation and rule-based computation

Tiên quyết: procedural-design
Routes dự kiến: `/vi/docs/paper-4/validation-rules`; `/en/docs/paper-4/validation-rules`

- `knowledge-input-validation` — Miền hợp lệ, lặp nhập và thông báo / Valid ranges, input loops and messages; SYL-9.2-05, SYL-11.2-01, SYL-11.2-02, SYL-11.2-03, SYL-11.2-04; BOOK-06-VALIDATION, BOOK-11-CONSTRUCTS
- `knowledge-rule-outcomes` — Điều kiện Boolean và công thức theo bảng / Boolean conditions and table-based formulae; SYL-20.1-04, SYL-20.1-06, SYL-9.2-05, SYL-11.1-02; BOOK-11-BASICS, BOOK-11-CONSTRUCTS, BOOK-09-ACCUMULATE
- `knowledge-unique-selection` — Chọn không lặp và đánh dấu đã dùng / Selection without replacement and consumed markers; SYL-20.1-04; BOOK-06-VALIDATION, BOOK-10-ARRAYS, BOOK-11-CONSTRUCTS
- `knowledge-check-digit` — Tách payload và kiểm tra check digit / Separating payload and checking a check digit; SYL-20.1-04; BOOK-06-CHECK-DIGIT, BOOK-11-BASICS, BOOK-11-STRINGS
### testing — Kiểm thử, dò lỗi và bằng chứng

Testing, debugging and evidence

Tiên quyết: procedural-design
Routes dự kiến: `/vi/docs/paper-4/testing`; `/en/docs/paper-4/testing`

- `knowledge-test-design` — Dữ liệu thường, biên và không hợp lệ / Normal, boundary and invalid test data; SYL-12.3-06, SYL-12.3-07; BOOK-12-TESTING
- `knowledge-tracing-debugging` — Trace, breakpoint và tìm nguyên nhân sai / Tracing, breakpoints and finding faults; SYL-12.3-01, SYL-12.3-02, SYL-12.3-03, SYL-12.3-05; BOOK-12-TESTING, BOOK-09-ALGORITHM
- `knowledge-repair-enhance` — Sửa lỗi và cải tiến mà giữ hành vi cần có / Repairing and enhancing while preserving required behaviour; SYL-12.3-04, SYL-12.3-08; BOOK-12-TESTING, BOOK-09-REFINEMENT
- `knowledge-source-contract` — Đọc đúng yêu cầu, phụ thuộc và tiêu chí / Reading requirements, dependencies and criteria; P4-ADM-04, P4-ADM-05, P4-ADM-08; BOOK-12-TESTING
- `knowledge-capture-provenance` — Chạy đúng phiên bản và lưu bằng chứng / Running the right version and preserving evidence; P4-ADM-10, P4-ADM-12; BOOK-12-TESTING
## Xử lý chuỗi và dữ liệu văn bản / Strings and textual data

ID: `ac-9618-p4-2026-python.package.text`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### text-processing — Xử lý chuỗi và bản ghi văn bản

Strings and textual records

Tiên quyết: data-models, procedural-design
Routes dự kiến: `/vi/docs/paper-4/text-processing`; `/en/docs/paper-4/text-processing`

- `knowledge-character-comparison` — So sánh chuỗi theo ký tự / Character-by-character comparison; SYL-20.1-04; BOOK-11-STRINGS, BOOK-11-CONSTRUCTS
- `knowledge-delimiter-tokenisation` — Tách chuỗi thành token theo dấu phân cách / Splitting delimited strings into tokens; SYL-20.1-04; BOOK-11-STRINGS, BOOK-11-CONSTRUCTS
- `knowledge-typed-routing` — Đổi kiểu trường và đưa vào nhóm đích / Converting fields and routing to a destination; SYL-20.1-04; BOOK-11-STRINGS, BOOK-10-TYPES, BOOK-11-CONSTRUCTS, BOOK-10-ARRAYS
- `knowledge-run-length` — Đếm các dãy ký tự liên tiếp / Counting consecutive character runs; SYL-20.1-04; BOOK-01-RLE, BOOK-11-CONSTRUCTS
## Tìm kiếm và sắp xếp / Searching and sorting

ID: `ac-9618-p4-2026-python.package.search-sort`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### search-collections — Tìm tuyến tính, đếm và chọn bản ghi

Linear search, counting and record selection

Tiên quyết: procedural-design
Routes dự kiến: `/vi/docs/paper-4/search-collections`; `/en/docs/paper-4/search-collections`

- `knowledge-linear-find` — Tìm tuyến tính và kết quả tìm thấy / Linear search and its result contract; SYL-19.1-01; BOOK-19-LINEAR
- `knowledge-count-all` — Đếm mọi phần tử thỏa điều kiện / Counting every matching element; SYL-20.1-04; BOOK-10-LINEAR-EXTENSION, BOOK-09-ACCUMULATE
- `knowledge-filter-all` — Lọc mọi bản ghi phù hợp / Filtering all matching records; SYL-20.1-04; BOOK-10-ARRAYS, BOOK-11-CONSTRUCTS, BOOK-11-STRINGS
- `knowledge-group-totals` — Gộp khóa trùng và cập nhật tổng / Grouping repeated keys and updating totals; SYL-20.1-04; BOOK-09-ACCUMULATE, BOOK-10-RECORDS, BOOK-19-LINEAR
### sorting — Sắp xếp và chèn có thứ tự

Sorting and ordered insertion

Tiên quyết: data-models, procedural-design
Routes dự kiến: `/vi/docs/paper-4/sorting`; `/en/docs/paper-4/sorting`

- `knowledge-bubble-passes` — Bubble sort: lượt so sánh, đổi chỗ và dừng / Bubble sort: passes, swaps and stopping; SYL-19.1-06; BOOK-19-BUBBLE
- `knowledge-insertion-shifts` — Insertion sort: phần đã sắp và dịch phần tử / Insertion sort: sorted prefix and shifts; SYL-19.1-05; BOOK-19-INSERTION
- `knowledge-ordered-insert` — Chèn một phần tử vào bảng đã có thứ tự / Inserting one item into an ordered table; SYL-20.1-04; BOOK-19-INSERTION, BOOK-10-ARRAYS
- `knowledge-comparator-variants` — Khóa sắp xếp, chiều sắp và nhiều tiêu chí / Sort keys, direction and multiple criteria; SYL-19.1-07, SYL-19.1-08; BOOK-19-BUBBLE, BOOK-19-INSERTION, BOOK-10-RECORDS
### binary-search — Tìm nhị phân trong mảng đã sắp

Binary search in a sorted array

Tiên quyết: search-collections, sorting
Routes dự kiến: `/vi/docs/paper-4/binary-search`; `/en/docs/paper-4/binary-search`

- `knowledge-preconditions-interval` — Tiền điều kiện và khoảng tìm kiếm / Preconditions and the search interval; SYL-19.1-03; BOOK-19-BINARY
- `knowledge-midpoint-update` — Phần tử giữa, thu hẹp khoảng và thất bại / Midpoint, interval reduction and failure; SYL-19.1-02; BOOK-19-BINARY
- `knowledge-recursive-variant` — Biến thể tìm nhị phân đệ quy / Recursive binary search variant; SYL-19.1-02; BOOK-19-BINARY, BOOK-19-RECURSION
## Ngăn xếp / Stacks

ID: `ac-9618-p4-2026-python.package.stack`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### stack — Ngăn xếp và quy ước con trỏ

Stacks and pointer conventions

Tiên quyết: data-models, procedural-design
Routes dự kiến: `/vi/docs/paper-4/stack`; `/en/docs/paper-4/stack`

- `knowledge-representation-conventions` — Mảng, con trỏ đỉnh và quy ước rỗng / Array, top pointer and empty conventions; SYL-19.1-21, SYL-10.4-01, SYL-10.4-02; BOOK-19-STACK, BOOK-10-ADT
- `knowledge-push` — Push và tình huống đầy / Push and the full condition; SYL-19.1-11; BOOK-19-STACK
- `knowledge-pop` — Pop và tình huống rỗng / Pop and the empty condition; SYL-19.1-15; BOOK-19-STACK
- `knowledge-paired-restoration` — Hai stack và phục hồi khi không ghép được / Paired stacks and restoration on failure; SYL-20.1-04; BOOK-19-STACK, BOOK-11-CONSTRUCTS
- `knowledge-reduce-operands` — Lấy toán hạng và tính kết quả / Popping operands and reducing to a result; SYL-20.1-04; BOOK-19-STACK, BOOK-09-ACCUMULATE
## Hàng đợi / Queues

ID: `ac-9618-p4-2026-python.package.queue`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### queue — Hàng đợi tuyến tính và vòng

Linear and circular queues

Tiên quyết: data-models, procedural-design
Routes dự kiến: `/vi/docs/paper-4/queue`; `/en/docs/paper-4/queue`

- `knowledge-representation-conventions` — Head, tail, count và quy ước rỗng / Head, tail, count and empty conventions; SYL-19.1-22, SYL-10.4-01, SYL-10.4-02; BOOK-19-QUEUE, BOOK-10-ADT
- `knowledge-enqueue` — Enqueue, đầy và vòng chỉ số / Enqueue, full state and wrapping; SYL-19.1-12; BOOK-19-QUEUE
- `knowledge-dequeue` — Dequeue, rỗng và giá trị trả về / Dequeue, empty state and return contract; SYL-19.1-16; BOOK-19-QUEUE
- `knowledge-inspect-live-items` — Đọc các phần tử đang dùng mà không xóa / Inspecting live items without removal; SYL-20.1-04; BOOK-19-QUEUE, BOOK-11-CONSTRUCTS
- `knowledge-reduce-consume` — Tổng hợp queue bằng đọc hoặc tiêu thụ dữ liệu / Reducing queue data by inspection or consumption; SYL-20.1-04; BOOK-19-QUEUE, BOOK-09-ACCUMULATE, BOOK-19-RECURSION
## Danh sách liên kết / Linked lists

ID: `ac-9618-p4-2026-python.package.linked-list`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### linked-list — Danh sách liên kết và vùng trống

Linked lists and free-list storage

Tiên quyết: data-models, procedural-design
Routes dự kiến: `/vi/docs/paper-4/linked-list`; `/en/docs/paper-4/linked-list`

- `knowledge-representation-free-list` — Node, head và chuỗi vùng trống / Nodes, head and free-list chain; SYL-19.1-23, SYL-10.4-01, SYL-10.4-02; BOOK-19-LIST-SETUP
- `knowledge-traversal` — Duyệt theo link, không theo ô mảng / Following links rather than physical slots; SYL-20.1-04; BOOK-19-LIST-SEARCH
- `knowledge-search` — Tìm dữ liệu trong danh sách liên kết / Searching data in a linked list; SYL-19.1-09; BOOK-19-LIST-SEARCH
- `knowledge-insert` — Lấy node trống và nối link khi chèn / Allocating a free node and linking an insertion; SYL-19.1-13; BOOK-19-LIST-INSERT, BOOK-19-LIST-SETUP
- `knowledge-remove-recycle` — Bỏ node, nối lại và trả về vùng trống / Unlinking a node and returning it to free storage; SYL-19.1-17; BOOK-19-LIST-REMOVE
## Đệ quy / Recursion

ID: `ac-9618-p4-2026-python.package.recursion`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### recursion — Đệ quy, call stack và đổi dạng thuật toán

Recursion, call stacks and algorithm transformation

Tiên quyết: procedural-design, stack
Routes dự kiến: `/vi/docs/paper-4/recursion`; `/en/docs/paper-4/recursion`

- `knowledge-recursive-contract` — Base case, recursive case và tiến triển / Base case, recursive case and progress; SYL-19.2-01, SYL-19.2-03; BOOK-19-RECURSION
- `knowledge-call-stack-unwind` — Frame riêng, call stack và trả ngược / Local frames, call stack and unwinding; SYL-19.1-27, SYL-19.2-04, SYL-19.2-06, SYL-19.2-07; BOOK-19-CALL-STACK, BOOK-19-RECURSION
- `knowledge-design-benefits` — Nhận bài toán đệ quy và cân nhắc lợi ích / Recognising recursive problems and considering benefits; SYL-19.2-03, SYL-19.2-05; BOOK-19-RECURSION, BOOK-19-CALL-STACK
- `knowledge-translate-recursive` — Triển khai đệ quy đã cho và giữ kết quả trả về / Implementing supplied recursion and propagating returns; SYL-19.2-02; BOOK-19-RECURSION, BOOK-11-SUBROUTINES
- `knowledge-iteration-conversion` — Đổi đệ quy và vòng lặp, giữ đúng hành vi / Converting recursion and iteration while preserving behaviour; SYL-19.2-01; BOOK-19-RECURSION, BOOK-11-CONSTRUCTS
## Cây nhị phân / Binary trees

ID: `ac-9618-p4-2026-python.package.tree`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### binary-tree — Cây nhị phân: chèn, tìm và duyệt

Binary trees: insert, search and traverse

Tiên quyết: data-models, recursion
Routes dự kiến: `/vi/docs/paper-4/binary-tree`; `/en/docs/paper-4/binary-tree`

- `knowledge-representation` — Root, con trái/phải và vùng chưa dùng / Root, left/right children and unused storage; SYL-19.1-25; BOOK-19-TREE-SETUP, BOOK-20-OBJECT-TREE
- `knowledge-ordered-insert` — So sánh và gắn node mới trong BST / Comparing and attaching a new BST node; SYL-19.1-14; BOOK-19-TREE-INSERT, BOOK-20-OBJECT-TREE
- `knowledge-search` — Chọn nhánh khi tìm trong BST / Choosing a branch when searching a BST; SYL-19.1-10; BOOK-19-TREE-SEARCH, BOOK-20-OBJECT-TREE
- `knowledge-traversals` — Duyệt inorder và postorder theo yêu cầu đề / Inorder and postorder traversal as required by the task; SYL-20.1-04; BOOK-19-TREE-TRAVERSE, BOOK-19-RECURSION, BOOK-19-TREE-SETUP
## Dictionary và hỗ trợ bảng băm / Dictionaries and hash-table support

ID: `ac-9618-p4-2026-python.package.dictionary`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### dictionary — Dictionary: khóa, giá trị và thao tác ADT

Dictionaries: keys, values and ADT operations

Tiên quyết: data-models, search-collections
Routes dự kiến: `/vi/docs/paper-4/dictionary`; `/en/docs/paper-4/dictionary`

- `knowledge-adt-interface` — Khóa duy nhất, giá trị và giao diện ADT / Unique keys, values and the ADT interface; SYL-19.1-24, SYL-10.4-01; BOOK-19-DICTIONARY
- `knowledge-find-insert` — Tìm khóa, chèn và cập nhật giá trị / Finding keys, inserting and updating values; SYL-19.1-24; BOOK-19-DICTIONARY
- `knowledge-delete` — Xóa khóa và xử lý khóa không tồn tại / Deleting a key and handling missing keys; SYL-19.1-24; BOOK-19-DICTIONARY
- `knowledge-representation-choice` — Giao diện logic và cách biểu diễn / Logical interface and representation choices; SYL-19.1-24; BOOK-19-DICTIONARY, BOOK-19-ADT-COMPOSITION
- `knowledge-other-adt-implementation` — Dùng ADT khác để cài đặt dictionary / Implementing a dictionary using another ADT; SYL-19.1-30; BOOK-19-ADT-COMPOSITION, BOOK-19-DICTIONARY
### hashing — Bảng băm và xử lý va chạm trong đề thi

Hash tables and exam collision schemes

Tiên quyết: dictionary, search-collections
Routes dự kiến: `/vi/docs/paper-4/hashing`; `/en/docs/paper-4/hashing`

- `knowledge-table-storage` — Bảng băm và vùng va chạm được chỉ định / Hash-table storage and prescribed collision areas; SYL-13.2-03; BOOK-13-HASH, BOOK-10-ARRAYS, BOOK-10-RECORDS
- `knowledge-hash-address` — Tính địa chỉ băm theo công thức đề / Computing a hash address from the given rule; SYL-13.2-03; BOOK-13-HASH, BOOK-11-BASICS
- `knowledge-insert-collisions` — Chèn và xử lý va chạm theo cấu trúc đề / Inserting and handling the prescribed collisions; SYL-13.2-03; BOOK-13-HASH, BOOK-10-ARRAYS
- `knowledge-find-collisions` — Tìm khóa qua bảng và vùng va chạm / Finding a key across table and collision storage; SYL-13.2-03; BOOK-13-HASH, BOOK-19-LINEAR
## Lập trình hướng đối tượng / Object-oriented programming

ID: `ac-9618-p4-2026-python.package.oop`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### oop-model — Lớp, constructor và đối tượng

Classes, constructors and objects

Tiên quyết: data-models, procedural-design
Routes dự kiến: `/vi/docs/paper-4/oop-model`; `/en/docs/paper-4/oop-model`

- `knowledge-class-object` — Phân biệt lớp, đối tượng và thuộc tính / Classes, objects and attributes; SYL-20.1-07, SYL-20.1-17, SYL-20.1-08, SYL-20.1-09, SYL-20.1-10, SYL-20.1-19; BOOK-20-CLASS
- `knowledge-constructor` — Constructor, tham số và trạng thái ban đầu / Constructors, parameters and initial state; SYL-20.1-08; BOOK-20-CONSTRUCTORS, BOOK-20-CLASS
- `knowledge-instantiate` — Tạo nhiều instance và giữ trạng thái riêng / Creating instances with independent state; SYL-20.1-07, SYL-20.1-17, SYL-20.1-19; BOOK-20-CONSTRUCTORS, BOOK-20-CLASS
- `knowledge-class-design` — Chọn thuộc tính và phương thức từ bài toán / Choosing attributes and methods from a problem; SYL-20.1-18; BOOK-20-CLASS, BOOK-20-CONTAINMENT, BOOK-09-DECOMPOSE
### oop-state — Đóng gói và thay đổi trạng thái đối tượng

Encapsulation and object state changes

Tiên quyết: oop-model, validation-rules
Routes dự kiến: `/vi/docs/paper-4/oop-state`; `/en/docs/paper-4/oop-state`

- `knowledge-encapsulation` — Đóng gói và truy cập qua phương thức / Encapsulation and method-mediated access; SYL-20.1-14; BOOK-20-CLASS
- `knowledge-getters` — Accessor trả đúng dữ liệu đang lưu / Accessors returning the stored data; SYL-20.1-15; BOOK-20-GETTERS
- `knowledge-setters` — Setter gán trực tiếp giá trị mới / Setters directly assigning a new value; SYL-20.1-16; BOOK-20-SETTERS
- `knowledge-rule-updates` — Cộng, chặn biên và thay đổi theo quy tắc / Incrementing, clamping and rule-based updates; SYL-20.1-09, SYL-20.1-19; BOOK-20-SETTERS, BOOK-11-BASICS, BOOK-11-CONSTRUCTS
### oop-inheritance — Kế thừa, ghi đè và đa hình

Inheritance, overriding and polymorphism

Tiên quyết: oop-model, oop-state
Routes dự kiến: `/vi/docs/paper-4/oop-inheritance`; `/en/docs/paper-4/oop-inheritance`

- `knowledge-base-derived` — Lớp cha/con và khởi tạo phần kế thừa / Base/derived classes and inherited initialisation; SYL-20.1-11; BOOK-20-INHERITANCE
- `knowledge-override-dispatch` — Ghi đè và chọn phương thức của đối tượng / Overriding and selecting object-specific behaviour; SYL-20.1-12; BOOK-20-POLYMORPHISM
- `knowledge-substitutability` — Lời gọi chung, hành vi khác theo lớp / Shared calls with class-specific behaviour; SYL-20.1-12; BOOK-20-POLYMORPHISM
### oop-aggregation — Đối tượng chứa đối tượng

Objects containing objects

Tiên quyết: oop-model, oop-state
Routes dự kiến: `/vi/docs/paper-4/oop-aggregation`; `/en/docs/paper-4/oop-aggregation`

- `knowledge-has-a` — Đối tượng thành phần và quan hệ has-a / Component objects and the has-a relationship; SYL-20.1-13; BOOK-20-CONTAINMENT
- `knowledge-bounded-add` — Thêm object có giới hạn và báo kết quả / Capacity-limited object insertion and result reporting; SYL-20.1-13; BOOK-20-CONTAINMENT, BOOK-10-ARRAYS
- `knowledge-nested-access` — Truy cập và tính qua các object thành phần / Accessing and computing through component objects; SYL-20.1-09, SYL-20.1-13; BOOK-20-CONTAINMENT, BOOK-20-GETTERS, BOOK-11-SUBROUTINES
## Tệp và ngoại lệ / Files and exceptions

ID: `ac-9618-p4-2026-python.package.files`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### text-files — Tệp văn bản: đọc, ghi và thêm

Text files: reading, writing and appending

Tiên quyết: data-models, procedural-design
Routes dự kiến: `/vi/docs/paper-4/text-files`; `/en/docs/paper-4/text-files`

- `knowledge-file-lifecycle` — Mở, đóng, đọc, ghi và chế độ thêm / Opening, closing, reading, writing and append modes; SYL-20.2-01, SYL-20.2-04, SYL-10.3-01; BOOK-10-TEXT-FILES, BOOK-20-FILE-RECORDS
- `knowledge-record-loading` — Đọc theo cấu trúc bản ghi và chuyển kiểu / Reading record structure and converting types; SYL-20.2-05, SYL-10.3-01; BOOK-10-TEXT-FILES, BOOK-20-FILE-RECORDS, BOOK-11-STRINGS
- `knowledge-serial-sequential` — Tệp serial, sequential và thứ tự bản ghi / Serial and sequential files and record ordering; SYL-20.2-07, SYL-20.2-08, SYL-13.2-01; BOOK-13-FILE-ORGANISATION, BOOK-20-FILE-SEQUENTIAL
- `knowledge-write-append` — Ghi đè, thêm và định dạng dòng / Overwriting, appending and line formatting; SYL-20.2-02, SYL-20.2-03, SYL-20.2-06; BOOK-10-TEXT-FILES, BOOK-20-FILE-SEQUENTIAL
- `knowledge-adt-loading` — Đọc dữ liệu rồi gọi đúng thao tác ADT / Loading data through the required ADT operation; SYL-20.1-05; BOOK-10-TEXT-FILES, BOOK-11-SUBROUTINES
### object-files — Đọc tệp để tạo và cập nhật đối tượng

Loading files into objects

Tiên quyết: text-files, oop-model
Routes dự kiến: `/vi/docs/paper-4/object-files`; `/en/docs/paper-4/object-files`

- `knowledge-construct-from-record` — Tạo đối tượng từ từng bản ghi / Constructing an object from each record; SYL-20.2-05; BOOK-20-FILE-RECORDS, BOOK-20-CONSTRUCTORS
- `knowledge-subclass-records` — Nhận loại bản ghi và chọn subclass / Identifying record types and selecting subclasses; SYL-20.1-19; BOOK-20-FILE-RECORDS, BOOK-20-INHERITANCE, BOOK-11-CONSTRUCTS
- `knowledge-lookup-update` — Đọc khóa, tìm object và cập nhật / Reading keys, finding objects and updating them; SYL-20.2-05; BOOK-20-FILE-RECORDS, BOOK-19-LINEAR, BOOK-20-SETTERS
### random-files — Bản ghi tệp và truy cập ngẫu nhiên

File records and random access

Tiên quyết: text-files, data-models
Routes dự kiến: `/vi/docs/paper-4/random-files`; `/en/docs/paper-4/random-files`

- `knowledge-organisation-access` — Phân biệt tổ chức tệp và cách truy cập / Distinguishing file organisation from access method; SYL-20.2-09, SYL-13.2-01, SYL-13.2-02, P4-ADM-08, P4-ADM-13; BOOK-13-FILE-ORGANISATION, BOOK-20-FILE-RANDOM
- `knowledge-record-address` — Địa chỉ bản ghi và một cách biểu diễn Python / Record addressing and a proposed Python representation; SYL-20.2-09, SYL-13.2-04; BOOK-20-FILE-RANDOM, BOOK-13-HASH
- `knowledge-read-write-update` — Đọc, ghi và sửa đúng bản ghi ngẫu nhiên / Reading, writing and updating a chosen record; SYL-20.2-09, SYL-13.2-04; BOOK-20-FILE-RANDOM
### exceptions — Ngoại lệ khi nhập dữ liệu và xử lý tệp

Exceptions in input and file processing

Tiên quyết: text-files, validation-rules
Routes dự kiến: `/vi/docs/paper-4/exceptions`; `/en/docs/paper-4/exceptions`

- `knowledge-runtime-failures` — Nhận diện ngoại lệ và nguyên nhân / Recognising exceptions and their causes; SYL-20.2-10, SYL-20.2-11; BOOK-20-EXCEPTIONS, BOOK-12-TESTING
- `knowledge-handle-recover` — Bắt ngoại lệ và phục hồi có chủ đích / Handling exceptions and deliberate recovery; SYL-20.2-11, SYL-20.2-12; BOOK-20-EXCEPTIONS
- `knowledge-cleanup` — Đóng tài nguyên khi thành công hoặc lỗi / Closing resources after success or failure; SYL-20.2-04; BOOK-10-TEXT-FILES, BOOK-20-EXCEPTIONS
## Kiến thức hỗ trợ lựa chọn giải pháp / Supporting knowledge for solution choices

ID: `ac-9618-p4-2026-python.package.support`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### performance — Điều kiện áp dụng và chi phí thuật toán

Algorithm conditions and costs

Tiên quyết: search-collections, sorting, binary-search
Routes dự kiến: `/vi/docs/paper-4/performance`; `/en/docs/paper-4/performance`

- `knowledge-asymptotic-cost` — So sánh Big O thời gian và không gian / Comparing time and space Big O; SYL-19.1-04, SYL-19.1-26, SYL-19.1-27, SYL-19.1-28, SYL-19.1-29; BOOK-19-COMPLEXITY
- `knowledge-algorithm-choice` — Chọn thuật toán theo điều kiện dữ liệu / Selecting algorithms using data conditions; SYL-19.1-26, SYL-11.3-05; BOOK-19-COMPLEXITY, BOOK-19-BINARY, BOOK-10-ADT
- `knowledge-trace-cost` — Đếm bước để giải thích hiệu năng / Counting operations to explain performance; SYL-19.1-04, SYL-19.1-07, SYL-19.1-08; BOOK-19-BINARY, BOOK-19-BUBBLE, BOOK-19-INSERTION, BOOK-19-COMPLEXITY
### graphs — Đặc trưng đồ thị và chọn cấu trúc

Graph characteristics and structure choice

Tiên quyết: data-models
Routes dự kiến: `/vi/docs/paper-4/graphs`; `/en/docs/paper-4/graphs`

- `knowledge-characteristics` — Đỉnh, cạnh và các đặc trưng đồ thị / Vertices, edges and graph characteristics; SYL-19.1-18; BOOK-19-GRAPH
- `knowledge-structure-choice` — Khi quan hệ dữ liệu có dạng đồ thị / When data relationships form a graph; SYL-19.1-19; BOOK-19-GRAPH
## Thực hành tích hợp và bằng chứng / Integrated practical work and evidence

ID: `ac-9618-p4-2026-python.package.integration`

State-changing procedures require verified event-based Action View; static concepts use purposeful diagrams, comparisons and self-checks. Graph support requires no algorithm coding.

10 khối: Nhận diện bài → Dấu hiệu dạng đề → Kiến thức cần biết → Cách giải → Ví dụ giải có kiểm chứng → Quan sát và dự đoán trạng thái → Tránh mất điểm → Tự luyện giảm dần gợi ý → Nhớ và làm lại → Học tiếp và nguồn

### exam-workflow — Ghép chương trình, xuất kết quả và nộp bằng chứng

Program integration, output and evidence

Tiên quyết: testing, text-files
Routes dự kiến: `/vi/docs/paper-4/exam-workflow`; `/en/docs/paper-4/exam-workflow`

- `knowledge-compose-main` — Ghép hàm đã có và giữ quan hệ phụ thuộc / Composing existing routines and preserving dependencies; SYL-20.1-05; BOOK-09-DECOMPOSE, BOOK-11-SUBROUTINES
- `knowledge-format-output` — Định dạng kết quả, bảng và giá trị trả về / Formatting results, tables and return values; SYL-20.1-06, SYL-11.1-03, SYL-11.1-04; BOOK-11-STRINGS, BOOK-10-ARRAYS, BOOK-11-BASICS
- `knowledge-evidence-document` — Tên file, code, output và bằng chứng theo ý đề / File names, code, output and evidence by exam part; P4-ADM-01, P4-ADM-04, P4-ADM-05, P4-ADM-06, P4-ADM-07, P4-ADM-09, P4-ADM-10, P4-ADM-11, P4-ADM-12, P4-ADM-13; BOOK-12-TESTING
- `knowledge-source-and-rubric` — Phân biệt nguồn chính thức và hướng dẫn học / Distinguishing official sources from learning guidance; P4-ADM-02, P4-ADM-03, P4-ADM-14; BOOK-12-TESTING

## Yêu cầu đánh giá gắn với từng mục tiêu

### SYL-19.1-01 — Cài đặt tìm kiếm tuyến tính

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-01`

Lập nhiệm vụ tìm tuyến tính trên dữ liệu mới, có phần tử đầu/cuối, khóa lặp và khóa không tồn tại.

Plan a linear-search task on unfamiliar data with first/last items, repeated keys and an absent key.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.search-collections.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Checks positions sequentially under the declared contract
- Returns the specified found or missing result without a premature stop

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-02 — Cài đặt tìm kiếm nhị phân

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-02`

Lập nhiệm vụ tìm nhị phân với mảng đã sắp, thử biên một phần tử và khoảng rỗng; chọn biến thể lặp hoặc đệ quy rõ ràng.

Plan binary search on sorted data with singleton and empty-interval cases; state whether the required variant is iterative or recursive.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.binary-search.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Midpoint and bound updates shrink the interval
- Found and absent cases terminate
- Recursive variant propagates return values when selected

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-03 — Giải thích điều kiện dùng tìm kiếm nhị phân

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-03`

Đưa các bộ dữ liệu và chiều so sánh khác nhau để học sinh quyết định có được dùng tìm nhị phân ngay hay không.

Present datasets and comparator directions and ask whether binary search can be applied immediately.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.binary-search.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Identifies the ordering precondition
- Explains comparator consistency
- Does not claim binary search works on arbitrary unsorted data

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-04 — Liên hệ hiệu năng tìm kiếm nhị phân với kích thước dữ liệu

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-04`

Yêu cầu dự đoán số lần thu hẹp khoảng khi kích thước mảng tăng, rồi giải thích từ trace tìm nhị phân.

Ask learners to predict interval reductions as array size grows and justify them from binary-search traces.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.algorithm-cost`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses a consistent counted operation and case
- Relates interval halving to logarithmic growth rather than claiming elapsed time proves Big O

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-05 — Cài đặt sắp xếp chèn

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-05`

Lập bài insertion sort cho bản ghi theo khóa mới, gồm dữ liệu đã sắp, đảo ngược và khóa bằng nhau.

Plan insertion sort of records by a new key, including sorted, reversed and equal-key data.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.sorting.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Preserves a sorted prefix
- Shifts complete records without loss
- Inserts the saved item at the correct boundary

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-06 — Cài đặt sắp xếp nổi bọt

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-06`

Lập bài bubble sort có trace từng lượt và trường hợp không cần đổi chỗ.

Plan bubble sort with pass-by-pass tracing and an input requiring no swaps.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.sorting.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Compares adjacent items with the required direction
- Uses correct pass bounds
- Terminates correctly under the specified stopping rule

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-07 — Giải thích ảnh hưởng của thứ tự ban đầu tới hiệu năng sắp xếp

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-07`

Cho cùng kích thước nhưng khác thứ tự đầu vào để so sánh chi phí của một bản bubble/insertion sort đã xác định.

Compare equal-size inputs with different initial orders for a specified bubble/insertion implementation.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.algorithm-cost`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Separates input order from input size
- Counts comparisons or shifts consistently
- Accounts for whether early exit is present

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-08 — Giải thích ảnh hưởng của lượng dữ liệu tới hiệu năng sắp xếp

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-08`

Cho các kích thước tăng dần với kiểu thứ tự cố định để so sánh số bước sắp xếp.

Compare increasing input sizes while holding the ordering pattern constant.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.algorithm-cost`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Keeps implementation and case comparable
- Explains growth in counted operations
- Does not confuse one measured runtime with a complexity proof

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-09 — Tìm một phần tử trong danh sách liên kết

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-09`

Lập bài tìm khóa theo link của linked list có ô mảng vật lý không theo thứ tự, gồm rỗng và không tìm thấy.

Plan linked-list search with nonconsecutive physical slots, including empty and absent-key cases.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.linked-list-search`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Follows links from the head
- Stops at the declared null sentinel
- Returns the correct node/result without changing links

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-10 — Tìm một phần tử trong cây nhị phân

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-10`

Lập bài tìm trong BST với khóa ở root, nhánh sâu và nhánh thiếu.

Plan BST search for a root key, a deep key and a key leading to a missing child.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.binary-tree.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Chooses the child using the declared ordering rule
- Handles a null subtree
- Preserves the tree and returns the requested result

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-11 — Chèn phần tử vào ngăn xếp

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-11`

Lập bài push theo một quy ước top được cho, gồm rỗng, còn một chỗ và đầy.

Plan push under a supplied top-pointer convention with empty, one-free-slot and full states.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.stack.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses the supplied pointer convention
- Writes and updates in a valid order
- Reports full without corrupting stored state

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-12 — Chèn phần tử vào hàng đợi

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-12`

Lập bài enqueue theo kiểu tuyến tính hoặc vòng được chỉ định, có trường hợp đầy và vòng chỉ số nếu áp dụng.

Plan enqueue for a specified linear or circular queue, including full and applicable wraparound states.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.queue.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Preserves FIFO order
- Updates tail/count under the chosen convention
- Handles full and applicable wraparound correctly

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-13 — Chèn phần tử vào danh sách liên kết

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-13`

Lập bài chèn linked list cần lấy node từ free list và cập nhật liên kết đầu/cuối theo yêu cầu.

Plan linked-list insertion requiring free-list allocation and the specified head/tail link changes.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.linked-list.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Allocates only a free node
- Preserves existing live links
- Updates free and used chains without loss or cycles

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-14 — Chèn phần tử vào cây nhị phân

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-14`

Lập bài chèn vào BST rỗng và có sẵn node, nêu rõ quy tắc với khóa trùng.

Plan insertion into empty and populated BSTs with an explicit duplicate-key policy.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.binary-tree.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Attaches at the correct empty child
- Preserves ordering and existing nodes
- Applies the declared duplicate and capacity policy

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-15 — Xóa phần tử khỏi ngăn xếp

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-15`

Lập bài pop với nhiều phần tử, một phần tử và stack rỗng theo quy ước top cụ thể.

Plan pop from multiple-item, single-item and empty stacks using a stated top convention.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.stack.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Returns the most recently pushed item
- Updates top correctly
- Leaves an empty stack unchanged when reporting failure

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-16 — Xóa phần tử khỏi hàng đợi

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-16`

Lập bài dequeue qua chuỗi thêm/lấy, gồm phần tử cuối và điểm vòng nếu có.

Plan dequeue across enqueue/dequeue sequences, including the last item and any wrap point.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.queue.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Returns the oldest live item
- Updates head/count consistently
- Handles empty without returning a stale slot

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-17 — Xóa phần tử khỏi danh sách liên kết

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-17`

Lập bài xóa node đầu/giữa/cuối và khóa vắng, có yêu cầu trả node về free list.

Plan deletion of head/interior/tail nodes and an absent key, with node recycling to a free list.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.linked-list.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Repairs the predecessor or head link
- Recycles only the removed node when required
- Preserves both chains and the not-found state

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-18 — Mô tả đặc điểm ADT đồ thị

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-18`

Thiết kế kiểm tra trên sơ đồ đồ thị để nhận đỉnh, cạnh, hướng và trọng số; không yêu cầu viết code.

Plan a diagram-based check identifying graph vertices, edges, direction and weights without coding.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.graph-characteristics`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Labels graph features correctly
- Distinguishes the displayed graph variants
- Uses diagram or prose evidence rather than requiring an algorithm implementation

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-19 — Giải thích khi nào nên dùng đồ thị

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-19`

Cho một tình huống quan hệ nhiều-nhiều và yêu cầu giải thích vì sao dùng graph phù hợp.

Present a many-to-many relationship scenario and ask why a graph is suitable.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.graph-characteristics`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Maps entities to vertices and relationships to edges
- Justifies relevant direction or weight choices
- Does not invent a graph-coding requirement

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-21 — Mô tả và cài đặt ngăn xếp bằng kiểu có sẵn hoặc ADT khác

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-21`

Yêu cầu biểu diễn stack bằng kiểu cho phép, ghi ý nghĩa từng ô/con trỏ rồi thực hiện chuỗi thao tác ngắn.

Ask learners to represent a stack using permitted types, explain cells/pointers and perform a short operation sequence.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.stack.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Storage and pointer convention are explicit
- State transitions implement LIFO
- Empty/full conditions agree with the representation

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-22 — Mô tả và cài đặt hàng đợi bằng kiểu có sẵn hoặc ADT khác

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-22`

Yêu cầu biểu diễn queue, nêu head/tail/count và chứng minh FIFO qua chuỗi thao tác.

Ask learners to represent a queue, define head/tail/count and demonstrate FIFO through an operation sequence.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.queue.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Separates physical storage from live items
- State matches the chosen linear/circular convention
- Order and empty/full states are consistent

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-23 — Mô tả và cài đặt danh sách liên kết bằng kiểu có sẵn hoặc ADT khác

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-23`

Yêu cầu biểu diễn linked list và free list trong mảng, vẽ link trước/sau một thay đổi.

Ask learners to represent linked and free lists in arrays and draw links before and after a change.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.linked-list.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Distinguishes physical indices from logical order
- Head/null/free meanings are explicit
- Every allocated node belongs to the appropriate chain

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-24 — Mô tả và cài đặt từ điển bằng kiểu có sẵn hoặc ADT khác

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-24`

Lập bài dictionary với hợp đồng khóa duy nhất và chuỗi thêm/tìm/cập nhật/xóa do AlgoCore chọn để kiểm tra giao diện.

Plan a dictionary task with unique-key semantics and an AlgoCore-selected add/find/update/delete sequence to demonstrate the interface.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.dictionary-operations`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Separates key-value contract from storage
- Handles duplicate and missing keys according to specification
- Demonstrates the chosen operations without claiming they are separate official syllabus bullets

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-25 — Mô tả và cài đặt cây nhị phân bằng kiểu có sẵn hoặc ADT khác

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-25`

Yêu cầu biểu diễn cùng cây bằng một cấu trúc hợp lệ, chỉ rõ root, con trái/phải và ô chưa dùng.

Ask learners to represent a tree using a permitted structure and identify root, child links and unused storage.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.binary-tree.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Representation preserves the intended shape
- Null and root conventions are unambiguous
- Does not require OOP for an array-backed representation

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-26 — So sánh thuật toán theo thời gian

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-26`

Cho hai thuật toán giải cùng nhiệm vụ và yêu cầu so sánh thời gian theo mô hình bước, với giả thiết đầu vào rõ.

Present two algorithms solving the same task and compare time using an explicit operation model and input assumptions.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.algorithm-cost`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Compares equivalent tasks and cases
- Identifies the dominant repeated work
- States assumptions such as sorted input or tree shape

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-27 — So sánh thuật toán theo bộ nhớ

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-27`

Yêu cầu so sánh bộ nhớ của hai cách giải, tính cả dữ liệu phụ và các frame đệ quy.

Ask learners to compare storage use of two solutions, including auxiliary data and recursive frames.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.algorithm-cost`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Distinguishes input storage from auxiliary space
- Includes simultaneous call frames where applicable
- States how space changes with input size

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-28 — Dùng Big O mô tả độ phức tạp thời gian

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-28`

Lập kiểm tra suy ra Big O thời gian từ các cấu trúc lặp và thu hẹp khoảng, có nêu n và trường hợp xét.

Plan a check deriving time Big O from loops and interval reduction, with input size and case stated.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.algorithm-cost`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Defines n and counted work
- Derives the dominant growth term
- Avoids treating constants or a single runtime as the growth class

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-29 — Dùng Big O mô tả độ phức tạp không gian

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-29`

Lập kiểm tra suy ra Big O không gian từ biến tạm, mảng phụ và độ sâu call stack.

Plan a check deriving space Big O from temporary variables, auxiliary arrays and call depth.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.algorithm-cost`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Counts simultaneously live storage
- Includes recursive depth rather than total calls
- States whether the answer is auxiliary or total space

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.1-30 — Cài đặt một ADT bằng ADT khác

`ac-9618-p4-2026-python.assessment-requirement.syl-19.1-30`

Lập bài dictionary dùng ADT linked list chứa cặp khóa–giá trị và gọi giao diện của ADT thành phần.

Plan a dictionary backed by a linked-list ADT of key-value pairs, invoking the component ADT interface.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.adt-abstraction`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Names both the outer dictionary and inner linked-list ADT
- Provides executable interface composition and call-trace evidence
- Built-in arrays alone or a comparison diagram do not satisfy this requirement

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.2-01 — Nhận biết đặc điểm thiết yếu của đệ quy

`ac-9618-p4-2026-python.assessment-requirement.syl-19.2-01`

Cho ví dụ đệ quy đúng/sai để xác định base case, recursive case và bước tiến tới dừng.

Present valid and flawed recursive examples and identify base case, recursive case and progress.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.recursion.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Identifies all three obligations
- Explains a nontermination fault
- Preserves them when comparing with an iterative form

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.2-02 — Biểu diễn đệ quy bằng ngôn ngữ lập trình

`ac-9618-p4-2026-python.assessment-requirement.syl-19.2-02`

Yêu cầu diễn đạt một thuật toán đệ quy đã mô tả bằng Python, giữ đúng tham số và giá trị trả về.

Ask learners to express a described recursive algorithm in Python while preserving arguments and returned values.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.recursion.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses recursive calls for the required subproblem
- Implements the base result
- Propagates results without replacing return with print

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.2-03 — Viết thuật toán đệ quy

`ac-9618-p4-2026-python.assessment-requirement.syl-19.2-03`

Cho bài toán mới có cấu trúc giảm dần, yêu cầu tự thiết kế base case và bước đệ quy trước khi triển khai.

Present an unfamiliar reducible problem and require independent base-case and recursive-step design before implementation.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.recursive-design-trace`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Defines a valid smaller subproblem
- Every allowed input progresses to a stopping condition
- Result composition matches the problem specification

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.2-04 — Theo vết thuật toán đệ quy

`ac-9618-p4-2026-python.assessment-requirement.syl-19.2-04`

Yêu cầu tự trace lời gọi, biến cục bộ, công việc chờ và giá trị trả về trước khi chạy một ví dụ đệ quy.

Require an independent trace of calls, local state, pending work and returns before executing a recursive example.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.recursive-design-trace`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Records frame-local values in call order
- Shows unwind and returned values in the correct order
- Final console output alone is insufficient evidence

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.2-05 — Giải thích trường hợp đệ quy có lợi

`ac-9618-p4-2026-python.assessment-requirement.syl-19.2-05`

Cho bài toán cây hoặc phân rã lặp lại để học sinh giải thích lợi ích và chi phí của đệ quy.

Use a tree or repeated-decomposition problem to explain recursion benefits and costs.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.recursion.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Connects recursive structure to the problem
- Explains clarity or natural decomposition
- Acknowledges stack/termination costs rather than claiming recursion is always faster

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.2-06 — Giải thích ngăn xếp hỗ trợ lời gọi đệ quy

`ac-9618-p4-2026-python.assessment-requirement.syl-19.2-06`

Yêu cầu chú thích sơ đồ call stack cho lời gọi lồng nhau, chỉ dữ liệu cần giữ để tiếp tục sau return.

Ask learners to annotate a nested-call stack and identify information needed to resume after return.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.recursion.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Includes return location and frame-local state
- Explains LIFO support for nested calls
- Does not require implementing a compiler

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-19.2-07 — Giải thích tháo ngăn xếp và trả kết quả

`ac-9618-p4-2026-python.assessment-requirement.syl-19.2-07`

Cho trạng thái tại base case và yêu cầu dựng chuỗi unwind cùng các phép tính còn chờ.

Provide the state at a base case and ask for the unwind sequence and pending computations.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.recursion.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Pops frames in reverse call order
- Uses the correct local values at each return
- Produces the final result through visible intermediate returns

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-01 — Giải thích mô hình lập trình và đặc trưng thủ tục/OOP

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-01`

Cho hai thiết kế cùng bài toán theo thủ tục và OOP, yêu cầu đối chiếu cách tổ chức dữ liệu/trách nhiệm.

Present procedural and OOP designs for the same problem and compare how data and responsibilities are organised.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Explains the paradigm distinction
- Identifies procedures versus stateful objects/methods
- Stays within procedural/OOP scope

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-03 — Viết mã thủ tục sử dụng biến

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-03`

Lập bài khai báo và sử dụng biến/mảng theo yêu cầu dữ liệu mới, kiểm tra trạng thái đầu và các thay đổi.

Plan declaration and use of variables/arrays for unfamiliar data requirements, checking initial and updated state.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Types, scope and dimensions fit the data
- Initial values are deliberate
- Updates do not exceed bounds or leak unintended shared state

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-04 — Viết mã thủ tục sử dụng cấu trúc điều khiển

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-04`

Lập nhóm nhiệm vụ chuyển giao dùng rẽ nhánh/lặp để đếm, lọc, phân nhóm hoặc xử lý trạng thái; chọn bối cảnh từ các block đã nối.

Plan transfer tasks using selection and iteration for counting, filtering, grouping or state processing, selecting contexts from the linked blocks.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Conditions implement the stated rule
- Loops visit the intended data and terminate
- Normal and boundary cases show correct state/results without assuming all corpus techniques are named syllabus requirements

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-05 — Viết mã thủ tục sử dụng thủ tục

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-05`

Yêu cầu tách một luồng xử lý thành procedures rồi ghép lời gọi có tham số đúng thứ tự.

Ask learners to split a processing flow into procedures and compose correctly ordered calls with parameters.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Each procedure has a clear responsibility
- Arguments and state flow match interfaces
- Composition calls existing routines rather than duplicating their algorithms

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-06 — Viết mã thủ tục sử dụng hàm

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-06`

Yêu cầu viết function trả kết quả để dùng trong biểu thức hoặc điều kiện, phân biệt với chỉ in ra.

Ask learners to write a function whose result is used in an expression or condition, distinguishing it from printing.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Parameters describe the required inputs
- All relevant paths return the specified value
- Caller uses the returned value correctly

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-07 — Hiểu và thể hiện OOP: đối tượng

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-07`

Tạo nhiệm vụ với hai object cùng class và yêu cầu dự đoán trạng thái riêng sau một thao tác.

Plan a task with two objects of one class and predict their separate states after an operation.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-model.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Distinguishes class from object identity
- Tracks instance-specific state
- An update to one object affects another only through specified sharing

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-08 — Hiểu và thể hiện OOP: thuộc tính

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-08`

Yêu cầu chọn và khởi tạo các attribute với giá trị lấy từ tham số hoặc mặc định được mô tả.

Ask learners to choose and initialise attributes from supplied parameters or stated defaults.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-model.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Attribute names/types/roles fit the contract
- Constructor initialises required fields
- Parameters are not mistaken for persistent instance fields

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-09 — Hiểu và thể hiện OOP: phương thức

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-09`

Yêu cầu cài phương thức thực hiện trách nhiệm của object và một lời gọi tới object thành phần khi phù hợp.

Ask learners to implement object responsibilities as methods, including delegation to a contained object where appropriate.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-model.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Method uses the correct instance state
- Return values and side effects match the contract
- Delegation addresses the intended contained instance

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-10 — Hiểu và thể hiện OOP: lớp

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-10`

Cho mô tả dữ liệu và hành vi của một loại thực thể, yêu cầu khai báo class thể hiện đúng cấu trúc đó.

Provide data and behaviour requirements for an entity type and ask for its class definition.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-model.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Class groups the required attributes and methods
- Definition is distinguished from construction of an instance
- Constructor and method signatures match the specification

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-11 — Hiểu và thể hiện OOP: kế thừa

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-11`

Lập bài subclass có thêm trạng thái và cần khởi tạo phần được kế thừa.

Plan a subclass with additional state that must initialise its inherited part.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-inheritance.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses an appropriate is-a relation
- Initialises inherited and new attributes
- Reuses the base interface without duplicating inconsistent state

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-12 — Hiểu và thể hiện OOP: đa hình

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-12`

Lập bài gọi cùng phương thức trên các object khác subclass và dự đoán hành vi được chọn.

Plan shared method calls on objects of different subclasses and predict the selected behaviour.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.polymorphic-use`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Overrides a common method contract
- Calls resolve to the appropriate instance behaviour
- Demonstrates polymorphic use rather than only defining two unrelated methods

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-13 — Hiểu và thể hiện OOP: chứa đối tượng/tổng hợp

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-13`

Lập bài object chứa tập object khác, có truy cập thành phần và thêm theo giới hạn nếu được yêu cầu.

Plan an object containing other objects, with component access and capacity-limited addition where specified.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-aggregation.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Models a has-a relation
- Stores/retrieves the intended object references
- Count/capacity and component method calls follow the stated contract

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-14 — Hiểu và thể hiện OOP: đóng gói

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-14`

Yêu cầu thiết kế truy cập trạng thái qua phương thức và giải thích mức đóng gói thực tế của cách viết Python.

Ask learners to mediate state access through methods and explain the actual encapsulation offered by their Python approach.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-state.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- State access follows the intended interface
- Explains conventions or name mangling accurately
- Does not describe Python naming as absolute security

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-15 — Hiểu và thể hiện OOP: phương thức đọc thuộc tính

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-15`

Lập bài getter trả đúng attribute được yêu cầu, thử trước và sau thay đổi trạng thái.

Plan a getter returning the requested stored attribute, tested before and after a state change.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-state.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Returns the correct instance field
- Does not change state
- Distinguishes retrieving a stored value from formatting or recomputing an unrelated result

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-16 — Hiểu và thể hiện OOP: phương thức đặt thuộc tính

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-16`

Lập bài setter nhận giá trị mới và thay thế attribute, đối chiếu với một phương thức cộng dồn.

Plan a setter replacing an attribute from a new input value and contrast it with an incremental-update method.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-state.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Assigns the supplied value to the intended field
- Does not accidentally add or clamp unless specified
- Subsequent access observes the replacement

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-17 — Hiểu và thể hiện OOP: thể hiện của lớp

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-17`

Yêu cầu tạo nhiều instance với tham số khác nhau và xác định object nào được từng biến tham chiếu.

Ask learners to construct several instances with different arguments and identify the object referenced by each variable.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-model.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Calls constructors with correct argument order
- Distinguishes separate instances from two references to one object
- Initial state matches each construction

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-18 — Thiết kế lớp phù hợp với bài toán

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-18`

Cho tình huống chưa kèm class diagram để học sinh tự đề xuất class, attribute, method và quan hệ rồi giải thích lựa chọn.

Present an unfamiliar scenario without a supplied class diagram and require independent classes, attributes, methods and relationships with justification.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-model.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Derives responsibilities from requirements
- Specifies coherent attribute types and method contracts
- Justifies relationships before code rather than copying a given class skeleton

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.1-19 — Viết chương trình thể hiện OOP

`ac-9618-p4-2026-python.assessment-requirement.syl-20.1-19`

Lập nhiệm vụ tích hợp tạo object và gọi các phương thức để giải quyết yêu cầu mới, có thể dùng record tệp đã xác minh.

Plan an integrated task constructing objects and invoking methods for new requirements, optionally using verified file records.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.oop-model.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Executable behaviour is organised through object state and methods
- Instances and calls fit their contracts
- Tests cover the required interaction rather than only successful construction

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-01 — Mở tệp ở chế độ đọc

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-01`

Lập nhiệm vụ mở đúng tệp để đọc mà không làm thay đổi dữ liệu sẵn có.

Plan opening the specified file for reading without altering existing data.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.text-files.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Selects read access and the correct path/name
- Reads only through a valid open resource
- Original file content remains unchanged

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-02 — Mở tệp ở chế độ ghi

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-02`

Lập nhiệm vụ ghi lại tệp có sẵn và yêu cầu dự đoán phần dữ liệu cũ còn hay mất.

Plan rewriting an existing file and ask learners to predict which previous data remains.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.text-files.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses overwrite mode when required
- Result contains exactly the intended new content
- Explains the effect on pre-existing data

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-03 — Mở tệp ở chế độ ghi nối

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-03`

Lập nhiệm vụ thêm record vào tệp có sẵn rồi kiểm tra cả record cũ và mới.

Plan appending records to an existing file and verify both old and new records.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.text-files.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses append semantics
- Preserves existing content
- Record delimiters prevent old/new records from merging

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-04 — Đóng tệp

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-04`

Lập nhiệm vụ theo dõi trạng thái tài nguyên qua đường thành công và đường lỗi có thể xảy ra.

Plan resource-state checks across successful processing and an applicable failure path.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.text-files.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- The opened file is closed when processing ends
- Chosen cleanup approach covers relevant paths
- Does not claim finally or context-manager syntax is itself a named syllabus requirement

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-05 — Đọc bản ghi từ tệp

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-05`

Lập bài đọc record nhiều trường hoặc nhiều dòng, chuyển kiểu và đưa vào đúng record/object đích.

Plan reading multi-field or multi-line records, converting types and populating the correct record/object.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.text-files.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Respects record boundaries
- Converts fields under the stated layout
- Handles end-of-file without inventing an extra record or updating the wrong object

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-06 — Ghi bản ghi vào tệp

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-06`

Lập bài ghi record theo layout xác định rồi đọc lại để đối chiếu dữ liệu.

Plan writing records in a specified layout and reading them back for comparison.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.text-files.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Field order and separators are recoverable
- Mode and newline behaviour match the requirement
- Round-trip values retain the intended types/meaning

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-07 — Xử lý tệp tổ chức nối tiếp không theo khóa

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-07`

Lập bài xử lý tệp serial theo thứ tự nhận record và kiểm tra thứ tự sau khi thêm dữ liệu.

Plan processing a serial file in arrival order and checking the order after adding records.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.serial-sequential-processing`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Preserves the defined arrival order
- Does not relabel unsorted serial organisation as key-sorted sequential organisation
- Processes complete records

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-08 — Xử lý tệp tổ chức tuần tự theo khóa

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-08`

Lập bài xử lý tệp sequential theo khóa và cập nhật mà vẫn giữ thứ tự đã quy định.

Plan processing a key-ordered sequential file and updating it while preserving the stated order.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.serial-sequential-processing`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Recognises key order as an organisation property
- Update preserves that order and complete records
- Does not confuse sequential reading with file organisation

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-09 — Xử lý tệp truy cập ngẫu nhiên theo khóa

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-09`

Lập fixture tự biên soạn cho chọn địa chỉ record rồi đọc/ghi/sửa tệp thật, kiểm tra record khác giữ nguyên.

Plan an original fixture for selecting a record address and reading/writing/updating a real file while checking other records remain unchanged.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.random-file-processing`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses persistent file operations rather than only an in-memory table
- Address/layout convention is explicit and tested
- Target and non-target records verify direct-update behaviour

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-10 — Giải thích ngoại lệ và ý nghĩa xử lý ngoại lệ

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-10`

Cho tình huống thiếu tệp, lỗi chuyển kiểu và dữ liệu ngoài miền để phân biệt ngoại lệ với lỗi dữ liệu thông thường.

Present missing-file, conversion-failure and out-of-range-input scenarios to distinguish exceptions from ordinary invalid-domain data.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.exception-recovery`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Explains disruption of normal execution
- Identifies why recovery or reporting is needed
- Does not treat every failed validation as an exception

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-11 — Chọn nơi xử lý ngoại lệ phù hợp

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-11`

Cho các ranh giới xử lý lỗi khác nhau để chọn chỗ bắt ngoại lệ và cách phục hồi phù hợp.

Present alternative handling boundaries and ask learners to choose where to catch an exception and how to recover.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.exception-recovery`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Matches the handler to a plausible operation failure
- Selects retry/report/propagation deliberately
- Does not mask unrelated programming faults with an indiscriminate catch

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-20.2-12 — Viết mã xử lý ngoại lệ

`ac-9618-p4-2026-python.assessment-requirement.syl-20.2-12`

Lập bài code xử lý một lỗi tệp hoặc chuyển kiểu, thử cả đường bình thường và đường lỗi.

Plan code handling a file or conversion failure, testing normal and exceptional paths.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.exception-recovery`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Catches the intended exception
- Produces the specified recovery state/message
- Normal execution remains correct and relevant resources are handled

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-9.1-01 — Mô hình hóa thông tin thiết yếu bằng trừu tượng hóa

`ac-9618-p4-2026-python.assessment-requirement.syl-9.1-01`

Cho mô tả dài có chi tiết thừa và yêu cầu chọn dữ liệu/đầu ra thiết yếu cho nhiệm vụ lập trình.

Present a verbose scenario with irrelevant detail and select essential data and outputs for programming.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Retains information needed by the required behaviour
- Excludes irrelevant detail with a reason
- Produces a usable model rather than a prose copy

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-9.1-02 — Phân rã bài toán thành thủ tục/hàm

`ac-9618-p4-2026-python.assessment-requirement.syl-9.1-02`

Yêu cầu chia một nhiệm vụ nhỏ thành routines với đầu vào/đầu ra và trách nhiệm riêng.

Ask learners to split a small task into routines with distinct responsibilities and inputs/outputs.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Responsibilities are coherent and nonduplicated
- Interfaces support the overall task
- The decomposition can be followed to completion

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-9.2-01 — Đọc và biểu diễn các bước thuật toán xác định

`ac-9618-p4-2026-python.assessment-requirement.syl-9.2-01`

Cho các bước thuật toán chưa rõ và yêu cầu diễn đạt lại thành chuỗi bước xác định có thể trace.

Present imprecise algorithm steps and rewrite them as a definite traceable sequence.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Each step has an unambiguous effect
- Order and conditions are explicit
- A sample input produces a determinate trace

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-9.2-02 — Chọn định danh phù hợp và ghi vai trò dữ liệu

`ac-9618-p4-2026-python.assessment-requirement.syl-9.2-02`

Yêu cầu lập bảng tên biến, ý nghĩa, kiểu và vai trò cho một bài có mảng/con trỏ.

Ask for an identifier table listing meaning, type and role in an array/pointer task.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Identifiers distinguish different roles
- Types and scope fit the values
- Pointer/index names are not confused with the data they locate

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-9.2-03 — Chuyển đặc tả nhập-xử lý-xuất thành thuật toán

`ac-9618-p4-2026-python.assessment-requirement.syl-9.2-03`

Cho đặc tả input-process-output rồi yêu cầu viết thuật toán đáp ứng đúng dữ liệu vào và kết quả ra.

Provide an input-process-output specification and ask for an algorithm matching its inputs and outputs.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Inputs are consumed as specified
- Processing steps connect inputs to outputs
- Output form and returned values match the contract

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-9.2-04 — Tinh chỉnh bài toán tới mức có thể lập trình

`ac-9618-p4-2026-python.assessment-requirement.syl-9.2-04`

Cho một bước còn quá lớn và yêu cầu refinement đến các thao tác có thể triển khai/kiểm tra.

Give an oversized step and refine it into implementable, checkable operations.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Each refined step has a clear action and data
- The substeps preserve the parent requirement
- No unexplained operation remains at the intended coding level

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-9.2-05 — Biểu diễn điều kiện thuật toán bằng logic

`ac-9618-p4-2026-python.assessment-requirement.syl-9.2-05`

Lập bài viết predicate cho nhiều điều kiện, gồm trường hợp biên và kết hợp AND/OR.

Plan predicates combining several conditions, including boundaries and AND/OR alternatives.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.validation-rules.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Boolean structure matches the rule
- Boundary equality is handled correctly
- Tests distinguish incorrect operator combinations

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.1-01 — Chọn kiểu dữ liệu đơn phù hợp

`ac-9618-p4-2026-python.assessment-requirement.syl-10.1-01`

Cho các trường dữ liệu và phép toán cần dùng để học sinh chọn kiểu phù hợp, giải thích trường hợp dễ nhầm.

Provide data fields and required operations and select suitable types, explaining ambiguous cases.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Chosen types represent all allowed values
- Operations are compatible with the types
- Numeric-looking identifiers are not converted without justification

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.1-02 — Định nghĩa bản ghi có các trường khác kiểu

`ac-9618-p4-2026-python.assessment-requirement.syl-10.1-02`

Yêu cầu khai báo record chứa các trường khác kiểu và phân biệt record với bảng các record.

Ask learners to declare a record with heterogeneous fields and distinguish it from a collection of records.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Each named field has the required type/role
- One record represents one entity
- A Python class substitute is not automatically treated as a full OOP design

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.1-03 — Đọc và cập nhật trường của bản ghi

`ac-9618-p4-2026-python.assessment-requirement.syl-10.1-03`

Lập nhiệm vụ đọc và sửa một trường record mà giữ các trường khác không đổi.

Plan reading and modifying one record field while preserving the others.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Accesses the correct record and field
- New value satisfies the field contract
- Unrelated fields retain their values

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.2-01 — Sử dụng chỉ số và cận trên/dưới của mảng

`ac-9618-p4-2026-python.assessment-requirement.syl-10.2-01`

Cho mảng với giới hạn được mô tả và yêu cầu truy cập các vị trí đầu/cuối, phát hiện chỉ số vượt biên.

Provide an array with stated bounds and access first/last positions while identifying out-of-range indices.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Translates stated bounds consistently to Python
- Uses valid index ranges
- Distinguishes an index from a stored value

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.2-02 — Chọn và xử lý mảng một/hai chiều

`ac-9618-p4-2026-python.assessment-requirement.syl-10.2-02`

Cho hai tình huống dữ liệu để chọn mảng 1D/2D rồi xử lý hàng/cột cần thiết.

Present two data situations, select 1D/2D arrays and process the required rows/columns.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Dimensions match the data relationships
- Nested indexing and iteration are correct
- Updates target the intended cell without unintended row aliasing

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.3-01 — Giải thích lưu trữ lâu dài và xử lý tệp văn bản theo dòng

`ac-9618-p4-2026-python.assessment-requirement.syl-10.3-01`

Lập bài lưu các dòng văn bản, kết thúc chương trình rồi đọc lại để chứng minh lưu trữ bền vững.

Plan storing text lines, ending execution and reading them in a later run to demonstrate persistence.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.text-files.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Data survives beyond one program run
- Line boundaries are preserved
- Opening/reading/closing follows the selected file contract

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.4-01 — Giải thích ADT gồm dữ liệu và thao tác

`ac-9618-p4-2026-python.assessment-requirement.syl-10.4-01`

Yêu cầu mô tả một ADT bằng dữ liệu cùng thao tác cho phép, rồi phân biệt với một cách biểu diễn.

Ask learners to describe an ADT through its data and permitted operations, then distinguish an implementation.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.dictionary.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- States the behaviour of operations
- Separates logical contract from storage
- Does not equate every array with the same ADT

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-10.4-02 — Liên hệ hành vi ngăn xếp/hàng đợi/danh sách với mảng

`ac-9618-p4-2026-python.assessment-requirement.syl-10.4-02`

Cho ảnh chụp mảng/con trỏ của stack, queue hoặc list để dựng thứ tự dữ liệu logic.

Provide array/pointer snapshots of a stack, queue or list and reconstruct logical data order.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.stack.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Interprets the relevant pointers/links
- Distinguishes live from unused storage
- Logical order matches the selected ADT behaviour

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.1-01 — Khai báo và khởi tạo hằng/biến

`ac-9618-p4-2026-python.assessment-requirement.syl-11.1-01`

Yêu cầu khởi tạo constants và variables theo một nhiệm vụ rồi chỉ ra giá trị nào được thay đổi.

Ask learners to initialise constants and variables for a task and identify which values may change.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Initial values fit the specification
- Constant intent and variable updates are distinguished
- Scope does not hide or overwrite required state

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.1-02 — Gán và tính biểu thức số học/logic

`ac-9618-p4-2026-python.assessment-requirement.syl-11.1-02`

Lập trace assignment, biểu thức số học và logic có chia nguyên/làm tròn được quy định rõ.

Plan a trace of assignments and arithmetic/logical expressions with explicitly specified division/rounding.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.data-models.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Uses the required operator semantics
- Assignment changes the correct target
- Intermediate and final values follow evaluation order

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.1-03 — Nhập từ bàn phím và xuất ra console

`ac-9618-p4-2026-python.assessment-requirement.syl-11.1-03`

Lập bài nhận dữ liệu console, chuyển kiểu và xuất nhãn/kết quả theo yêu cầu.

Plan console input, conversion and labelled output under a stated format.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Input is read at the required point
- Conversions fit expected types
- Output preserves required labels/order and does not substitute print for a required return

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.1-04 — Sử dụng hàm có sẵn/thư viện, gồm xử lý chuỗi

`ac-9618-p4-2026-python.assessment-requirement.syl-11.1-04`

Cho nhiệm vụ chuỗi và giới hạn về built-ins để học sinh chọn hàm được phép hoặc thao tác tự triển khai.

Provide a string task and explicit built-in restrictions, asking learners to select permitted functions or manual operations.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Library calls are appropriate and permitted
- Arguments/return values are used correctly
- No prohibited shortcut bypasses the assessed algorithm

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.2-01 — Sử dụng rẽ nhánh gồm điều kiện lồng và tương đương CASE

`ac-9618-p4-2026-python.assessment-requirement.syl-11.2-01`

Lập bài lựa chọn nhiều nhánh, gồm điều kiện lồng nhau và dạng tương đương CASE.

Plan multi-branch selection with nested conditions and a CASE-equivalent decision.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Branches cover the stated alternatives
- Priority and nesting implement the intended rule
- Boundary cases select the correct branch

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.2-02 — Sử dụng vòng lặp đếm

`ac-9618-p4-2026-python.assessment-requirement.syl-11.2-02`

Lập bài xử lý đúng số phần tử đã biết trước và kiểm tra số lần lặp bằng trace.

Plan processing a known number of items and verify the iteration count by tracing.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Iteration count matches the requirement
- First/last positions are valid
- No extra or skipped item appears at the loop boundary

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.2-03 — Sử dụng vòng lặp kiểm tra điều kiện trước

`ac-9618-p4-2026-python.assessment-requirement.syl-11.2-03`

Lập bài vòng lặp kiểm tra điều kiện trước, gồm trường hợp không chạy lần nào.

Plan a pre-condition loop including a case with zero iterations.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Tests the condition before the body
- Allows zero iterations when appropriate
- Loop state progresses toward termination

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.2-04 — Sử dụng vòng lặp kiểm tra điều kiện sau và chọn loại lặp

`ac-9618-p4-2026-python.assessment-requirement.syl-11.2-04`

Cho tình huống cần lặp để học sinh chọn và giải thích vòng lặp đếm, kiểm tra trước hoặc kiểm tra sau; với tình huống ít nhất một lần, yêu cầu biểu diễn tương đương hợp lệ bằng Python.

Present repetition scenarios requiring learners to choose and justify counted, pre-condition or post-condition loops; for the at-least-once scenario, require a valid Python equivalent.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Justifies the loop choice from whether the count is known and whether zero iterations are allowed
- Explains why a post-condition loop fits the selected scenario better than counted or pre-condition alternatives
- Body executes once before the stopping decision
- Condition polarity matches the intended repeat-until/while contract
- Does not invent a native Python post-condition-loop keyword

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.3-01 — Định nghĩa và gọi thủ tục với giao diện rõ ràng

`ac-9618-p4-2026-python.assessment-requirement.syl-11.3-01`

Yêu cầu định nghĩa procedure có giao diện rõ và gọi với các bộ arguments khác nhau.

Ask learners to define a procedure with a clear interface and invoke it with different arguments.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Header and parameters match the responsibility
- Calls supply compatible arguments
- The intended observable effect occurs without hidden dependencies

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.3-02 — Sử dụng tham số và phân biệt hiệu ứng truyền giá trị/tham chiếu

`ac-9618-p4-2026-python.assessment-requirement.syl-11.3-02`

Lập trace sửa list trong hàm và gán lại tham số, gồm truyền scalar rồi gán lại tham số cục bộ để đối chiếu trạng thái caller.

Plan traces of list mutation and parameter rebinding, including passing a scalar then rebinding the local parameter to compare caller state.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.parameter-effects`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Predicts caller-visible mutation versus local rebinding accurately
- Explains shared object references without claiming selectable by-reference syntax
- Uses value/reference concepts without falsely labelling Python as simply either

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.3-03 — Định nghĩa hàm và dùng giá trị trả về trong biểu thức

`ac-9618-p4-2026-python.assessment-requirement.syl-11.3-03`

Yêu cầu dùng giá trị function trả về trong phép tính hoặc điều kiện khác, gồm nhiều đường return.

Ask learners to use a function return value in another expression or condition, including multiple return paths.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Every relevant path returns the required type/value
- Caller uses the result rather than relying on printed output
- Arguments and local state remain within the contract

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.3-04 — Dùng đúng thuật ngữ giao diện, tham số, đối số, giá trị trả về

`ac-9618-p4-2026-python.assessment-requirement.syl-11.3-04`

Cho một định nghĩa và lời gọi rồi yêu cầu gắn nhãn header, interface, parameter, argument và return.

Provide a definition and call and label header, interface, parameter, argument and return.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Distinguishes formal parameters from actual arguments
- Identifies returned values separately from displayed output
- Terminology is applied to the concrete example

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-11.3-05 — Viết thuật toán có cấu trúc và hiệu quả

`ac-9618-p4-2026-python.assessment-requirement.syl-11.3-05`

Cho hai cách phân chia thuật toán và yêu cầu chọn cách rõ ràng, tránh công việc lặp thừa mà giữ kết quả.

Present two structured designs and choose a clear approach that avoids unnecessary repeated work while preserving results.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Explains module and interface choices
- Identifies a relevant efficiency improvement
- Checks preserved behaviour instead of assuming shorter code is always better

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.2-01 — Theo dõi phân rã mô-đun và tham số truyền giữa mô-đun

`ac-9618-p4-2026-python.assessment-requirement.syl-12.2-01`

Yêu cầu dựng sơ đồ module và trace dữ liệu được truyền qua một chuỗi lời gọi.

Ask for a module diagram and a trace of data passed through a call sequence.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.procedural-design.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Module responsibilities are clear
- Each arrow identifies the transferred data
- Arguments and return directions match the actual interfaces

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-01 — Xác định lỗi cú pháp

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-01`

Chuẩn bị một ví dụ tự biên soạn có lỗi cú pháp và yêu cầu định vị, phân loại trước khi sửa.

Prepare an original example with a syntax fault and require localisation and classification before repair.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Identifies the offending syntax
- Uses the error location as evidence rather than guessing from final output
- Repair makes the code syntactically valid

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-02 — Xác định lỗi logic

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-02`

Chuẩn bị chương trình chạy được nhưng sai một trường hợp biên để học sinh tìm lỗi logic qua trace.

Prepare a runnable program failing a boundary case and locate the logic fault through a trace.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Shows the first divergence from expected state
- Distinguishes a logic fault from a syntax failure
- Proposes a change tied to the faulty condition/update

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-03 — Xác định lỗi khi chạy

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-03`

Chuẩn bị ví dụ phát sinh lỗi runtime có dữ liệu kích hoạt rõ để học sinh xác định nguyên nhân.

Prepare a runtime-failure example with a reproducible triggering input and identify the cause.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Reproduces the failure
- Connects the failing operation to the triggering state
- Distinguishes handling an expected failure from concealing a programming defect

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-04 — Sửa lỗi đã xác định

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-04`

Yêu cầu sửa một lỗi đã xác định rồi chạy lại ca gây lỗi cùng các ca không bị ảnh hưởng.

Ask learners to repair an identified fault and rerun the failing case plus unaffected cases.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Change addresses the root cause
- Previously failing behaviour meets the specification
- Regression checks preserve unaffected results

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-05 — Chạy tay và dùng phương pháp kiểm thử phù hợp

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-05`

Yêu cầu dry run các biến quan trọng trước khi chạy thật, rồi so sánh expected/actual để giải thích khác biệt.

Require a dry run of selected state before execution, then compare expected and actual results to explain discrepancies.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Trace records relevant state transitions
- Expected results are written before observation
- Differences are investigated with a focused hypothesis

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-06 — Lập kế hoạch kiểm thử có kết quả mong đợi

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-06`

Yêu cầu lập test plan ghi input, trạng thái đầu, expected output/state và mục đích từng ca.

Ask for a test plan listing inputs, initial state, expected output/state and each case purpose.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Expected outcomes are explicit and checkable
- State reset or retained state is specified
- Tests link to requirements rather than merely collecting screenshots

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-07 — Chọn dữ liệu kiểm thử thường, bất thường và biên

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-07`

Cho miền dữ liệu và giới hạn lưu trữ để học sinh chọn ca thường, bất thường và biên có lý do.

Provide data domains and capacity limits and select justified normal, abnormal and boundary cases.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Includes values at and around meaningful boundaries
- Abnormal cases violate a stated input contract
- Each case has a justified expected outcome

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-12.3-08 — Sửa chương trình có sẵn để bổ sung chức năng

`ac-9618-p4-2026-python.assessment-requirement.syl-12.3-08`

Yêu cầu thêm một hành vi nhỏ vào chương trình hiện có mà giữ giao diện và các kết quả cũ cần thiết.

Ask learners to add a small behaviour to an existing program while preserving required interfaces and previous results.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.testing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- New behaviour meets the enhancement specification
- Existing required behaviour remains correct
- Tests cover the change and relevant regressions

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-13.2-01 — Phân biệt tổ chức tệp nối tiếp, tuần tự và ngẫu nhiên

`ac-9618-p4-2026-python.assessment-requirement.syl-13.2-01`

Cho ba sơ đồ lưu record để phân loại serial, sequential và random, tách cách tổ chức khỏi thao tác đọc.

Present three record-storage diagrams and classify serial, sequential and random organisation separately from reading operations.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.serial-sequential-processing`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Identifies arrival order, key order and address-based organisation appropriately
- Does not infer organisation solely from a loop
- Uses the distinction to support file-processing choices

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-13.2-02 — Phân biệt truy cập tuần tự và trực tiếp

`ac-9618-p4-2026-python.assessment-requirement.syl-13.2-02`

Cho cùng yêu cầu tìm record để so sánh quét tuần tự với truy cập theo địa chỉ.

Use the same record-retrieval requirement to compare sequential scanning with address-based access.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.random-file-processing`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Describes records visited by each method
- States the address information needed for direct access
- Does not call an in-memory index lookup a completed file read

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-13.2-03 — Giải thích thuật toán băm

`ac-9618-p4-2026-python.assessment-requirement.syl-13.2-03`

Yêu cầu giải thích hàm băm ánh xạ khóa sang địa chỉ, vì sao có va chạm và vì sao cùng khóa cho cùng địa chỉ khi giữ nguyên hàm; sau đó tính địa chỉ rồi chèn/tìm theo cách xử lý va chạm đã cho.

Require an explanation of how hashing maps keys to addresses, why collisions occur and why the same key gives the same address under an unchanged function; then compute addresses and insert/retrieve using a supplied collision scheme.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.lesson.hashing.assessment.progression`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Explains the key-to-address mapping rather than only calculating a value
- Explains that distinct keys can map to the same address and identifies this as a collision
- States that an unchanged deterministic hash function maps the same key consistently to the same address
- Address falls within the prescribed range
- Collision and not-found behaviour follow the chosen bucket/Spare contract
- Does not generalise one collision scheme to all hash tables

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

### SYL-13.2-04 — Dùng băm để đọc/ghi tệp ngẫu nhiên hoặc tuần tự

`ac-9618-p4-2026-python.assessment-requirement.syl-13.2-04`

Lập phần mở rộng tự biên soạn nối khóa qua hàm băm tới địa chỉ record trong tệp thật rồi đọc/ghi theo layout đã chọn.

Plan an original extension mapping a key through hashing to a real file-record address and reading/writing the chosen layout.

Nhóm đánh giá dự kiến: `ac-9618-p4-2026-python.assessment.gap.random-file-processing`

Tiêu chí cần kiểm (đặc tả nội bộ; sẽ biên soạn đủ VI/EN cho học sinh):

- Connects key, address and persistent file operation
- States collision/address/layout policy
- Array-only hashing or a binary fixture labelled official without provenance is insufficient

Trạng thái: `PLANNED_NOT_AUTHORED` · AlgoCore original · chưa gán điểm chính thức.

