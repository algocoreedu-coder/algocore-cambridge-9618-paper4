# Book knowledge map — Stage 3

55 locator sách, 108 block kiến thức, 58 chuỗi dạng bài. Trang in và PDF tách riêng; quan hệ nền tảng/thành phần không có nghĩa sách chứa sẵn lời giải đề thi.

## Các dạng bài

| Dạng bài | Kỹ năng ứng viên | Block chính |
|---|---|---|
| DATA_STORAGE — Khai báo và khởi tạo dữ liệu thông thường | data_representation, state_initialisation | data-models.knowledge.scalars-types-scope; data-models.knowledge.array-representation |
| DATA_RECORD — Khai báo cấu trúc bản ghi | data_representation, type_selection | data-models.knowledge.record-fields |
| ARRAY_APPEND — Thêm phần tử vào mảng còn chỗ | capacity_check, index_update | data-models.knowledge.bounded-append |
| ORDERED_INSERT — Chèn vào bảng đã có thứ tự | ordered_insertion, record_movement | sorting.knowledge.ordered-insert |
| RANDOM_ARRAY — Tạo dữ liệu mảng ngẫu nhiên | random_generation, uniqueness_control | data-models.knowledge.random-data |
| FILE_READ_ARRAY — Đọc file vào mảng, bản ghi hoặc ADT | file_iteration, record_parsing, data_conversion | text-files.knowledge.file-lifecycle; text-files.knowledge.record-loading; text-files.knowledge.adt-loading |
| FILE_READ_OBJECTS — Đọc file để tạo hoặc cập nhật đối tượng | record_parsing, object_construction, object_lookup | object-files.knowledge.construct-from-record; object-files.knowledge.subclass-records; object-files.knowledge.lookup-update |
| FILE_WRITE — Ghi hoặc nối dữ liệu vào file | file_output, record_formatting, error_handling | text-files.knowledge.file-lifecycle; text-files.knowledge.write-append |
| LINEAR_SEARCH — Tìm phần tử bằng duyệt tuần tự | sequential_comparison, match_detection | search-collections.knowledge.linear-find |
| COUNT_OCCURRENCES — Đếm số lần thỏa điều kiện | predicate_evaluation, accumulation | search-collections.knowledge.count-all |
| FILTER_RECORDS — Lọc tất cả bản ghi thỏa điều kiện | multi_condition_selection, attribute_access | search-collections.knowledge.filter-all |
| GROUP_AGGREGATE — Gom khóa và cập nhật tổng theo nhóm | key_matching, group_accumulation | search-collections.knowledge.group-totals |
| BUBBLE_SORT — Sắp xếp nổi bọt | adjacent_comparison, swapping, loop_bounds | sorting.knowledge.bubble-passes; sorting.knowledge.comparator-variants |
| INSERTION_SORT — Sắp xếp chèn | ordered_prefix, shifting, loop_bounds | sorting.knowledge.insertion-shifts; sorting.knowledge.comparator-variants |
| BINARY_SEARCH — Tìm nhị phân trong mảng đã sắp | interval_reduction, termination, comparison | binary-search.knowledge.preconditions-interval; binary-search.knowledge.midpoint-update; binary-search.knowledge.recursive-variant |
| STACK_SETUP — Khởi tạo stack và con trỏ | data_representation, state_initialisation | stack.knowledge.representation-conventions |
| STACK_PUSH — Viết thao tác Push | capacity_check, pointer_update, state_transition | stack.knowledge.push |
| STACK_POP — Viết thao tác Pop | empty_check, pointer_update, state_transition | stack.knowledge.pop |
| STACK_PAIR — Phối hợp hai stack và hoàn trả phần tử | transactional_state, paired_operations, restoration | stack.knowledge.paired-restoration |
| STACK_REDUCE — Rút dữ liệu từ stack để tính kết quả | iterated_consumption, accumulation | stack.knowledge.reduce-operands |
| QUEUE_SETUP — Khởi tạo queue và trạng thái | data_representation, state_initialisation | queue.knowledge.representation-conventions |
| QUEUE_ENQUEUE — Viết thao tác Enqueue | capacity_check, pointer_update, state_transition | queue.knowledge.enqueue |
| QUEUE_DEQUEUE — Viết thao tác Dequeue | empty_check, pointer_update, state_transition | queue.knowledge.dequeue |
| QUEUE_INSPECT — Xem các phần tử queue mà không lấy ra | non_destructive_traversal, live_range | queue.knowledge.inspect-live-items |
| QUEUE_REDUCE — Xử lý hoặc cộng dồn dữ liệu queue | queue_accumulation, accumulation | queue.knowledge.reduce-consume |
| LIST_SETUP — Khởi tạo linked list và free list | data_representation, link_initialisation | linked-list.knowledge.representation-free-list |
| LIST_TRAVERSE — Duyệt linked list theo liên kết | pointer_following, termination | linked-list.knowledge.traversal |
| LIST_INSERT — Chèn node vào linked list | allocation, link_update, state_transition | linked-list.knowledge.insert |
| LIST_REMOVE — Xóa node khỏi linked list | link_update, case_analysis, storage_recycling | linked-list.knowledge.remove-recycle |
| TREE_SETUP — Khởi tạo cây nhị phân | data_representation, root_initialisation | binary-tree.knowledge.representation |
| TREE_INSERT — Chèn node vào cây tìm kiếm nhị phân | branch_comparison, link_update, allocation | binary-tree.knowledge.ordered-insert |
| TREE_SEARCH — Tìm giá trị trong cây nhị phân | branch_comparison, pointer_following, termination | binary-tree.knowledge.search |
| TREE_TRAVERSE — Duyệt cây theo thứ tự yêu cầu | recursive_traversal, visit_order, null_checks | binary-tree.knowledge.traversals |
| HASH_SETUP — Khởi tạo hash table và vùng va chạm | data_representation, state_initialisation | hashing.knowledge.table-storage |
| HASH_FUNCTION — Tính địa chỉ hash | address_calculation, modulo | hashing.knowledge.hash-address |
| HASH_INSERT — Chèn bản ghi và xử lý va chạm | collision_resolution, capacity_search | hashing.knowledge.insert-collisions |
| HASH_SEARCH — Tra bản ghi theo hash | address_calculation, key_matching | hashing.knowledge.find-collisions |
| OOP_CLASS — Khai báo class và constructor | object_modelling, constructor_initialisation | oop-model.knowledge.class-object; oop-model.knowledge.constructor |
| OOP_SUBCLASS — Khai báo lớp con và constructor | inheritance, parent_initialisation | oop-inheritance.knowledge.base-derived |
| OOP_GET — Viết accessor trả dữ liệu đang lưu | encapsulation, member_access | oop-state.knowledge.getters |
| OOP_SET — Viết setter gán trực tiếp | encapsulation, member_assignment | oop-state.knowledge.setters |
| OOP_UPDATE — Cập nhật trạng thái object theo quy tắc | state_transition, rule_application | oop-state.knowledge.rule-updates |
| OOP_OVERRIDE — Ghi đè hành vi kế thừa | polymorphism, behaviour_specialisation | oop-inheritance.knowledge.override-dispatch |
| OOP_INSTANTIATE — Tạo và lưu các instance | object_construction, argument_mapping | oop-model.knowledge.instantiate |
| OOP_CAPACITY_ADD — Thêm object vào tập hợp có giới hạn | composition, capacity_check, state_transition | oop-aggregation.knowledge.bounded-add |
| RULE_COMPUTE — Tính kết quả từ quy tắc hoặc bảng | rule_application, selection, arithmetic | validation-rules.knowledge.rule-outcomes |
| VALIDATE_INPUT — Kiểm tra và yêu cầu nhập lại | constraint_check, retry_control | validation-rules.knowledge.input-validation |
| UNIQUE_SELECTION — Chọn hoặc chấp nhận mỗi mục một lần | availability_tracking, duplicate_rejection | validation-rules.knowledge.unique-selection |
| CHECK_DIGIT — Kiểm tra dữ liệu bằng check digit | weighted_calculation, integrity_check | validation-rules.knowledge.check-digit |
| STRING_COMPARE — So sánh chuỗi từng ký tự | lexicographic_comparison, index_bounds | text-processing.knowledge.character-comparison |
| STRING_SPLIT — Tách chuỗi thành các token | tokenisation, delimiter_detection | text-processing.knowledge.delimiter-tokenisation |
| STRING_ROUTE — Phân tích bản ghi chuỗi và phân phối giá trị | record_parsing, data_conversion, typed_routing | text-processing.knowledge.typed-routing |
| RUN_LENGTH_ENCODE — Mã hóa các đoạn ký tự lặp liên tiếp | run_detection, accumulation, encoding | text-processing.knowledge.run-length |
| ALGORITHM_TRANSLATE — Cài đặt thuật toán cho sẵn chưa có dạng riêng | pseudocode_translation, control_flow | procedural-design.knowledge.pseudocode-translation |
| ALGORITHM_REWRITE — Chuyển đổi giữa đệ quy và vòng lặp | equivalent_transformation, termination, state_preservation | recursion.knowledge.iteration-conversion |
| MAIN_FLOW — Ghép lời gọi và điều khiển chương trình | call_composition, parameter_flow, result_handling | exam-workflow.knowledge.compose-main |
| OUTPUT_FORMAT — Trình bày hoặc trả dữ liệu đúng định dạng | formatting, iteration, representation | exam-workflow.knowledge.format-output |
| EVIDENCE_RUN — Chạy test và ghi minh chứng | test_execution, evidence_capture | exam-workflow.knowledge.evidence-document |

## Kiến thức và trang sách

### data-models/scalars-types-scope — Kiểu, hằng, biến và phạm vi

Quan hệ: `direct_foundation`. Types and declarations identify valid state; subroutine scope distinguishes shared from local state.

Mục tiêu: SYL-20.1-03, SYL-10.1-01, SYL-11.1-01

- **BOOK-10-TYPES** — 10.1.1, Data types; trang in [239]; PDF [255].
  Choose integer, real, Boolean, character/string and date representations; declare named data items.
  Giới hạn: Table10.1 prints False(2), a source defect; do not propagate numeric Boolean encoding from this table. Python declarations differ from pseudocode. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-SUBROUTINES** — 11.3.1-11.3.2, Procedures; Functions; trang in [275, 276, 277, 278, 279, 280]; PDF [291, 292, 293, 294, 295, 296].
  Declare/call procedures and functions, pass parameters and return values; reason about local/global data.
  Giới hạn: Python argument passing must not be taught as literal BYREF syntax; exact signatures/return sentinels follow QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### data-models/array-representation — Mảng một chiều, hai chiều và giới hạn chỉ số

Quan hệ: `direct_foundation`. Array dimensions, bounds and element access support fixed storage representation.

Mục tiêu: SYL-20.1-03, SYL-10.2-01, SYL-10.2-02

- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### data-models/record-fields — Trường bản ghi và lớp thay thế record

Quan hệ: `direct_foundation`. Heterogeneous fields under one record identifier support TYPE tasks; an OOP class substitute must preserve that role.

Mục tiêu: SYL-10.1-02, SYL-10.1-03

- **BOOK-10-RECORDS** — 10.1.2, Records; trang in [240, 241]; PDF [256, 257].
  Define heterogeneous record fields, instantiate a record and access named fields.
  Giới hạn: A TYPE record may use a Python class substitute when permitted; an explicit OOP class task remains distinct. No full Python record-class listing here. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### data-models/bounded-append — Vị trí kế tiếp và chèn vào mảng có giới hạn

Quan hệ: `component_foundation`. Indexed storage plus capacity conditions support append; the exact count and failure contract comes from the exam.

Mục tiêu: SYL-20.1-03

- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### data-models/random-data — Dữ liệu ngẫu nhiên và miền giá trị

Quan hệ: `component_foundation`. Array population and library use are supported; random API, inclusive bounds and duplicate rejection require a separate Python design.

Mục tiêu: SYL-20.1-03

- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-LIBRARY** — 11.1.2, Library routines; trang in [271]; PDF [287].
  Recognise standard library routines and investigate language-specific functions.
  Giới hạn: No random generator, randint call, inclusive endpoint rule or distribution appears in the reviewed book text; this is a deliberate book gap. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### data-models/identifier-contract — Tên, vai trò dữ liệu và biểu thức

Quan hệ: `direct_foundation`. Identifier tables assign data roles; assignments and expressions explain changes to values rather than mere naming.

Mục tiêu: SYL-9.2-02, SYL-11.1-02

- **BOOK-09-ALGORITHM** — 9.2.1-9.2.2, Writing algorithms; Writing simple algorithms using pseudocode; trang in [220, 221, 222, 223, 224, 225]; PDF [236, 237, 238, 239, 240, 241].
  Recognise input, output, assignment, selection and iteration; translate the intended construct into a programming language.
  Giới hạn: Preserve QP identifiers, bounds and required algorithm; these general examples are not authority to replace mandated pseudocode. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/selection-iteration — Rẽ nhánh, lặp và điều kiện dừng

Quan hệ: `direct_foundation`. Branches and three loop forms provide conditional repetition and termination.

Mục tiêu: SYL-20.1-04, SYL-11.2-01, SYL-11.2-02, SYL-11.2-03, SYL-11.2-04

- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/subroutine-contracts — Procedure, function, tham số và giá trị trả về

Quan hệ: `direct_foundation`. Procedure/function interfaces, arguments and returned values support composing separately implemented routines.

Mục tiêu: SYL-20.1-05, SYL-20.1-06, SYL-11.3-01, SYL-11.3-03, SYL-11.3-04, SYL-11.3-05

- **BOOK-11-SUBROUTINES** — 11.3.1-11.3.2, Procedures; Functions; trang in [275, 276, 277, 278, 279, 280]; PDF [291, 292, 293, 294, 295, 296].
  Declare/call procedures and functions, pass parameters and return values; reason about local/global data.
  Giới hạn: Python argument passing must not be taught as literal BYREF syntax; exact signatures/return sentinels follow QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/parameter-modes — Truyền tham số và tác động lên dữ liệu

Quan hệ: `component_foundation`. Book parameter modes support interface reasoning; Python mutation versus rebinding needs language-specific treatment later.

Mục tiêu: SYL-11.3-02

- **BOOK-11-SUBROUTINES** — 11.3.1-11.3.2, Procedures; Functions; trang in [275, 276, 277, 278, 279, 280]; PDF [291, 292, 293, 294, 295, 296].
  Declare/call procedures and functions, pass parameters and return values; reason about local/global data.
  Giới hạn: Python argument passing must not be taught as literal BYREF syntax; exact signatures/return sentinels follow QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/pseudocode-translation — Đọc và triển khai pseudocode theo hợp đồng

Quan hệ: `direct_foundation`. Algorithm notation and constructs support preserving sequence, conditions and iteration when translating.

Mục tiêu: SYL-9.2-01, SYL-9.2-03

- **BOOK-09-ALGORITHM** — 9.2.1-9.2.2, Writing algorithms; Writing simple algorithms using pseudocode; trang in [220, 221, 222, 223, 224, 225]; PDF [236, 237, 238, 239, 240, 241].
  Recognise input, output, assignment, selection and iteration; translate the intended construct into a programming language.
  Giới hạn: Preserve QP identifiers, bounds and required algorithm; these general examples are not authority to replace mandated pseudocode. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/decomposition — Chia việc và ghép lời gọi theo thứ tự

Quan hệ: `direct_foundation`. Decomposition and structure charts support separating routines and tracing data between calls.

Mục tiêu: SYL-20.1-05, SYL-9.1-02, SYL-9.2-04, SYL-12.2-01, P4-ADM-14

- **BOOK-09-DECOMPOSE** — 9.1.1-9.1.2, Using abstraction; Using decomposition; trang in [218, 219]; PDF [234, 235].
  Separate a problem into subproblems and retain relevant data and operations.
  Giới hạn: Does not specify the call sequence or global state of any corpus question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-12-DESIGN** — 12.2.1, Purpose and use of structure charts; trang in [288, 289, 290, 291, 292]; PDF [304, 305, 306, 307, 308].
  Decompose a program into interacting modules and convert the design to calls, procedures and functions.
  Giới hạn: No corpus question's main-program call order is supplied by this section. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-PROCEDURAL** — 20.1.2, Imperative programming; trang in [500, 501]; PDF [516, 517].
  Distinguish sequential imperative instructions and procedural decomposition into subroutines/local/global variables.
  Giới hạn: Exclude low-level and declarative programming from core; this concept does not itself cover all AS11.3 subroutine objectives. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/paradigm-choice — Đặc trưng procedural và hướng đối tượng

Quan hệ: `direct_concept`. Compare procedural steps and object responsibility while excluding low-level and declarative code from this course.

Mục tiêu: SYL-20.1-01

- **BOOK-20-PROCEDURAL** — 20.1.2, Imperative programming; trang in [500, 501]; PDF [516, 517].
  Distinguish sequential imperative instructions and procedural decomposition into subroutines/local/global variables.
  Giới hạn: Exclude low-level and declarative programming from core; this concept does not itself cover all AS11.3 subroutine objectives. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-CLASS** — 20.1.3, Class; Object; Encapsulation; trang in [501, 502, 503, 504]; PDF [517, 518, 519, 520].
  Read a class diagram, define attributes/methods, create instances and encapsulate private data; Python example appears onprinted502-503.
  Giới hạn: Constructor/visibility requirements follow QP. Do not force privacy onto explicitly public Recordclass tasks or confuse TYPErecord substitutes with full OOP tasks. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/abstraction-io — Mô hình dữ liệu thiết yếu và input-process-output

Quan hệ: `direct_foundation`. Essential information and input-process-output models support moving from a scenario to a definite algorithm.

Mục tiêu: SYL-9.1-01, SYL-9.2-01, SYL-9.2-03

- **BOOK-09-DECOMPOSE** — 9.1.1-9.1.2, Using abstraction; Using decomposition; trang in [218, 219]; PDF [234, 235].
  Separate a problem into subproblems and retain relevant data and operations.
  Giới hạn: Does not specify the call sequence or global state of any corpus question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-ALGORITHM** — 9.2.1-9.2.2, Writing algorithms; Writing simple algorithms using pseudocode; trang in [220, 221, 222, 223, 224, 225]; PDF [236, 237, 238, 239, 240, 241].
  Recognise input, output, assignment, selection and iteration; translate the intended construct into a programming language.
  Giới hạn: Preserve QP identifiers, bounds and required algorithm; these general examples are not authority to replace mandated pseudocode. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### procedural-design/console-library — Nhập/xuất console và hàm thư viện phù hợp

Quan hệ: `direct_foundation`. Console operations and supplied/library routines support the permitted language tools; obey any QP restriction on shortcuts.

Mục tiêu: SYL-11.1-03, SYL-11.1-04

- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-LIBRARY** — 11.1.2, Library routines; trang in [271]; PDF [287].
  Recognise standard library routines and investigate language-specific functions.
  Giới hạn: No random generator, randint call, inclusive endpoint rule or distribution appears in the reviewed book text; this is a deliberate book gap. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### validation-rules/input-validation — Miền hợp lệ, lặp nhập và thông báo

Quan hệ: `direct_foundation`. Validation tests define acceptable input; loops implement retry until the source contract holds.

Mục tiêu: SYL-9.2-05, SYL-11.2-01, SYL-11.2-02, SYL-11.2-03, SYL-11.2-04

- **BOOK-06-VALIDATION** — 6.2, Validation; trang in [169, 170]; PDF [185, 186].
  Choose type, range, format, length, presence and existence checks suited to a field.
  Giới hạn: Validation does not prove factual correctness; uniqueness/consumed-answer state must come from the question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### validation-rules/rule-outcomes — Điều kiện Boolean và công thức theo bảng

Quan hệ: `component_foundation`. Arithmetic, selection and accumulation support the particular predicate, scoring bands or formula supplied by a question.

Mục tiêu: SYL-20.1-04, SYL-20.1-06, SYL-9.2-05, SYL-11.1-02

- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-ACCUMULATE** — 9.2.2, Average algorithm and input checks; trang in [227, 228, 229]; PDF [243, 244, 245].
  Initialise an accumulator and counter, iterate over inputs and compute an aggregate; validate the requested quantity.
  Giới hạn: Does not cover grouping by a record key or destructive ADT consumption; those state transitions require the question's contract. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### validation-rules/unique-selection — Chọn không lặp và đánh dấu đã dùng

Quan hệ: `component_foundation`. Validation and state storage support tracking consumed items; no-replacement acceptance is a corpus-derived composition.

Mục tiêu: SYL-20.1-04

- **BOOK-06-VALIDATION** — 6.2, Validation; trang in [169, 170]; PDF [185, 186].
  Choose type, range, format, length, presence and existence checks suited to a field.
  Giới hạn: Validation does not prove factual correctness; uniqueness/consumed-answer state must come from the question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### validation-rules/check-digit — Tách payload và kiểm tra check digit

Quan hệ: `concept_and_adaptation`. Book check-digit examples establish integrity arithmetic; the exam's precise division/rounding/X rule remains authoritative.

Mục tiêu: SYL-20.1-04

- **BOOK-06-CHECK-DIGIT** — 6.2, Check digits; trang in [171, 172]; PDF [187, 188].
  Apply weighted digit arithmetic, remainder and comparison to detect input errors.
  Giới hạn: Book demonstrates modulo-11 and mentions ISBN-13; do not replace a question's specified weights, modulo or exceptional digit with the book example. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### testing/test-design — Dữ liệu thường, biên và không hợp lệ

Quan hệ: `direct_foundation`. Normal, abnormal and boundary inputs with expected outcomes support a test plan.

Mục tiêu: SYL-12.3-06, SYL-12.3-07

- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### testing/tracing-debugging — Trace, breakpoint và tìm nguyên nhân sai

Quan hệ: `direct_foundation`. Dry-run state and error categories support locating the first incorrect step and distinguishing faults.

Mục tiêu: SYL-12.3-01, SYL-12.3-02, SYL-12.3-03, SYL-12.3-05

- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-ALGORITHM** — 9.2.1-9.2.2, Writing algorithms; Writing simple algorithms using pseudocode; trang in [220, 221, 222, 223, 224, 225]; PDF [236, 237, 238, 239, 240, 241].
  Recognise input, output, assignment, selection and iteration; translate the intended construct into a programming language.
  Giới hạn: Preserve QP identifiers, bounds and required algorithm; these general examples are not authority to replace mandated pseudocode. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### testing/repair-enhance — Sửa lỗi và cải tiến mà giữ hành vi cần có

Quan hệ: `component_foundation`. Locating faults and refining steps support repair and amendment while preserving unaffected behavior; later tasks must include regression checks.

Mục tiêu: SYL-12.3-04, SYL-12.3-08

- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-REFINEMENT** — 9.2.3;9.2.5, Writing pseudocode from a structured English description; Stepwise refinement; trang in [229, 230, 231, 233, 234, 235]; PDF [245, 246, 247, 249, 250, 251].
  Identify variables, inputs, outputs, processes and selection from a scenario; refine a high-level task into validated subtasks.
  Giới hạn: No corpus-specific predicate, scoring table or duplicate-selection algorithm is supplied. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### testing/source-contract — Đọc đúng yêu cầu, phụ thuộc và tiêu chí

Quan hệ: `component_foundation`. Testing expectations are foundational only; exact QP requirements and MS criteria are separate primary sources.

Mục tiêu: P4-ADM-04, P4-ADM-05, P4-ADM-08

- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### testing/capture-provenance — Chạy đúng phiên bản và lưu bằng chứng

Quan hệ: `component_foundation`. Recorded test results support repeatability; official evidence-document identity and screenshots come from syllabus and QP.

Mục tiêu: P4-ADM-10, P4-ADM-12

- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-processing/character-comparison — So sánh chuỗi theo ký tự

Quan hệ: `component_foundation`. Character indexing and loop/branch control support a manual comparator; prefix and return contracts come from QP.

Mục tiêu: SYL-20.1-04

- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-processing/delimiter-tokenisation — Tách chuỗi thành token theo dấu phân cách

Quan hệ: `component_foundation`. Character operations and repeated selection support building tokens; the no-built-in-split constraint is exam-specific.

Mục tiêu: SYL-20.1-04

- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-processing/typed-routing — Đổi kiểu trường và đưa vào nhóm đích

Quan hệ: `component_foundation`. Field extraction, type conversion, destination selection and array storage together support routing typed records.

Mục tiêu: SYL-20.1-04

- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-TYPES** — 10.1.1, Data types; trang in [239]; PDF [255].
  Choose integer, real, Boolean, character/string and date representations; declare named data items.
  Giới hạn: Table10.1 prints False(2), a source defect; do not propagate numeric Boolean encoding from this table. Python declarations differ from pseudocode. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-processing/run-length — Đếm các dãy ký tự liên tiếp

Quan hệ: `concept_and_adaptation`. RLE explains consecutive runs; queue consumption, final-run flush and exact digit/count format need the source task.

Mục tiêu: SYL-20.1-04

- **BOOK-01-RLE** — 1.3.1, Run-length encoding (RLE); trang in [22, 23, 24]; PDF [38, 39, 40].
  Represent each adjacent run by a count and data-item code; distinguish adjacent repetition from frequency across the entire input.
  Giới hạn: No queue-based encoder, final-run flush, or examination output contract is supplied; derive these from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### search-collections/linear-find — Tìm tuyến tính và kết quả tìm thấy

Quan hệ: `direct_algorithm`. The sequential compare/advance loop and found/not-found contract match linear search.

Mục tiêu: SYL-19.1-01

- **BOOK-19-LINEAR** — 19.1.1, Understanding linear and binary searching methods: Linear search; trang in [451, 452, 453, 454]; PDF [467, 468, 469, 470].
  Check each array element, terminate on found/exhausted and report a result; Python implementation and Activity19A are present.
  Giới hạn: Do not stop early for frequency-count tasks. Review pointer/bounds and return type against each question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### search-collections/count-all — Đếm mọi phần tử thỏa điều kiện

Quan hệ: `component_foundation`. Extending a scan to all matches plus an accumulator supports occurrence counting, unlike early-exit existence search.

Mục tiêu: SYL-20.1-04

- **BOOK-10-LINEAR-EXTENSION** — 10.2.3, Using a linear search; Extension Activity10B; trang in [243, 244]; PDF [259, 260].
  Scan elements until found or exhausted; return an index when requested; extension asks for repeated items and their counts.
  Giới hạn: First-match search and full-scan frequency count are different exam patterns; the count extension has no completed solution. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-ACCUMULATE** — 9.2.2, Average algorithm and input checks; trang in [227, 228, 229]; PDF [243, 244, 245].
  Initialise an accumulator and counter, iterate over inputs and compute an aggregate; validate the requested quantity.
  Giới hạn: Does not cover grouping by a record key or destructive ADT consumption; those state transitions require the question's contract. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### search-collections/filter-all — Lọc mọi bản ghi phù hợp

Quan hệ: `component_foundation`. Full iteration, compound predicates and case/string comparisons support selecting all qualifying records.

Mục tiêu: SYL-20.1-04

- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### search-collections/group-totals — Gộp khóa trùng và cập nhật tổng

Quan hệ: `component_foundation`. Stored group records, lookup and accumulation support find-or-create group totals; the grouping technique is QP-derived.

Mục tiêu: SYL-20.1-04

- **BOOK-09-ACCUMULATE** — 9.2.2, Average algorithm and input checks; trang in [227, 228, 229]; PDF [243, 244, 245].
  Initialise an accumulator and counter, iterate over inputs and compute an aggregate; validate the requested quantity.
  Giới hạn: Does not cover grouping by a record key or destructive ADT consumption; those state transitions require the question's contract. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-RECORDS** — 10.1.2, Records; trang in [240, 241]; PDF [256, 257].
  Define heterogeneous record fields, instantiate a record and access named fields.
  Giới hạn: A TYPE record may use a Python class substitute when permitted; an explicit OOP class task remains distinct. No full Python record-class listing here. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-LINEAR** — 19.1.1, Understanding linear and binary searching methods: Linear search; trang in [451, 452, 453, 454]; PDF [467, 468, 469, 470].
  Check each array element, terminate on found/exhausted and report a result; Python implementation and Activity19A are present.
  Giới hạn: Do not stop early for frequency-count tasks. Review pointer/bounds and return type against each question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### sorting/bubble-passes — Bubble sort: lượt so sánh, đổi chỗ và dừng

Quan hệ: `direct_algorithm`. Adjacent comparisons/swaps and pass limits support bubble-sort behavior.

Mục tiêu: SYL-19.1-06

- **BOOK-19-BUBBLE** — 19.1.2, Understanding insertion and bubble sorting methods: Bubble sort; trang in [458, 459, 460, 461]; PDF [474, 475, 476, 477].
  Compare adjacent entries and swap to order them, repeat passes, recognise decreasing bound and swap flag.
  Giới hạn: Book/source code has known swap-flag placement risk also visible atprinted245; later code must be tested. Whole-row/multikey/direction variants come from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### sorting/insertion-shifts — Insertion sort: phần đã sắp và dịch phần tử

Quan hệ: `direct_algorithm`. The sorted prefix, held key and shifts support insertion sort.

Mục tiêu: SYL-19.1-05

- **BOOK-19-INSERTION** — 19.1.2, Insertion sort; trang in [461, 462, 463, 464]; PDF [477, 478, 479, 480].
  Take the next value, shift larger predecessors and insert the saved value into its ordered position; interpret trace of array changes.
  Giới hạn: ORDERED_INSERT is a transfer from the inner insertion operation, not the full sort; fixed top-N retention and multi-field shifts require QP/MS. Check boundary guard order before implementation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### sorting/ordered-insert — Chèn một phần tử vào bảng đã có thứ tự

Quan hệ: `concept_and_adaptation`. The insertion operation and bounded arrays support a top-N update, but do not impose whole-array insertion sort on an unconstrained task.

Mục tiêu: SYL-20.1-04

- **BOOK-19-INSERTION** — 19.1.2, Insertion sort; trang in [461, 462, 463, 464]; PDF [477, 478, 479, 480].
  Take the next value, shift larger predecessors and insert the saved value into its ordered position; interpret trace of array changes.
  Giới hạn: ORDERED_INSERT is a transfer from the inner insertion operation, not the full sort; fixed top-N retention and multi-field shifts require QP/MS. Check boundary guard order before implementation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### sorting/comparator-variants — Khóa sắp xếp, chiều sắp và nhiều tiêu chí

Quan hệ: `component_foundation`. Comparison and whole-record movement are foundations; multi-key and direction contracts are supplied by individual QPs.

Mục tiêu: SYL-19.1-07, SYL-19.1-08

- **BOOK-19-BUBBLE** — 19.1.2, Understanding insertion and bubble sorting methods: Bubble sort; trang in [458, 459, 460, 461]; PDF [474, 475, 476, 477].
  Compare adjacent entries and swap to order them, repeat passes, recognise decreasing bound and swap flag.
  Giới hạn: Book/source code has known swap-flag placement risk also visible atprinted245; later code must be tested. Whole-row/multikey/direction variants come from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-INSERTION** — 19.1.2, Insertion sort; trang in [461, 462, 463, 464]; PDF [477, 478, 479, 480].
  Take the next value, shift larger predecessors and insert the saved value into its ordered position; interpret trace of array changes.
  Giới hạn: ORDERED_INSERT is a transfer from the inner insertion operation, not the full sort; fixed top-N retention and multi-field shifts require QP/MS. Check boundary guard order before implementation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-RECORDS** — 10.1.2, Records; trang in [240, 241]; PDF [256, 257].
  Define heterogeneous record fields, instantiate a record and access named fields.
  Giới hạn: A TYPE record may use a Python class substitute when permitted; an explicit OOP class task remains distinct. No full Python record-class listing here. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### binary-search/preconditions-interval — Tiền điều kiện và khoảng tìm kiếm

Quan hệ: `direct_algorithm`. Ordered input and lower/upper bounds justify which half can be discarded.

Mục tiêu: SYL-19.1-03

- **BOOK-19-BINARY** — 19.1.1, Binary search; trang in [454, 455, 456, 457]; PDF [470, 471, 472, 473].
  Require ordered input, compare midpoint and reduce the search interval; compare numbers of comparisons.
  Giới hạn: Printed455-457 pseudocode/language table has suspect equality-based termination; use as concept/source reference, not approved code. Recursive variants need recursion source plus QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### binary-search/midpoint-update — Phần tử giữa, thu hẹp khoảng và thất bại

Quan hệ: `direct_algorithm`. Midpoint comparison, bound updates and empty interval define termination and return behavior.

Mục tiêu: SYL-19.1-02

- **BOOK-19-BINARY** — 19.1.1, Binary search; trang in [454, 455, 456, 457]; PDF [470, 471, 472, 473].
  Require ordered input, compare midpoint and reduce the search interval; compare numbers of comparisons.
  Giới hạn: Printed455-457 pseudocode/language table has suspect equality-based termination; use as concept/source reference, not approved code. Recursive variants need recursion source plus QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### binary-search/recursive-variant — Biến thể tìm nhị phân đệ quy

Quan hệ: `component_foundation`. Combine interval reduction with recursive base/progress/return; apply only when studying the recursive variant.

Mục tiêu: SYL-19.1-02

- **BOOK-19-BINARY** — 19.1.1, Binary search; trang in [454, 455, 456, 457]; PDF [470, 471, 472, 473].
  Require ordered input, compare midpoint and reduce the search interval; compare numbers of comparisons.
  Giới hạn: Printed455-457 pseudocode/language table has suspect equality-based termination; use as concept/source reference, not approved code. Recursive variants need recursion source plus QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### stack/representation-conventions — Mảng, con trỏ đỉnh và quy ước rỗng

Quan hệ: `direct_algorithm`. LIFO representation and empty/full state support array stacks; next-free versus occupied-top must follow each QP.

Mục tiêu: SYL-19.1-21, SYL-10.4-01, SYL-10.4-02

- **BOOK-19-STACK** — 19.1.3, Stacks; trang in [464, 465, 466]; PDF [480, 481, 482].
  Represent a finite stack with array and pointers; initialise, check empty/full and push/pop; Python routines are present.
  Giới hạn: Book top points to last occupied slot(-1 when empty); corpus also uses next-free top. Pair rollback, operand order and reduction protocol are not supplied. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ADT** — 10.4, Abstract data types (ADTs); trang in [250, 251]; PDF [266, 267].
  Explain data plus permitted operations; distinguish LIFO, FIFO and following node links.
  Giới hạn: Book's statements that linked-list insertions always occur at the start and queues always require circular management are contextual simplifications, not universal requirements. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### stack/push — Push và tình huống đầy

Quan hệ: `direct_algorithm`. Capacity checks, pointer movement and write order support insertion under the chosen convention.

Mục tiêu: SYL-19.1-11

- **BOOK-19-STACK** — 19.1.3, Stacks; trang in [464, 465, 466]; PDF [480, 481, 482].
  Represent a finite stack with array and pointers; initialise, check empty/full and push/pop; Python routines are present.
  Giới hạn: Book top points to last occupied slot(-1 when empty); corpus also uses next-free top. Pair rollback, operand order and reduction protocol are not supplied. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### stack/pop — Pop và tình huống rỗng

Quan hệ: `direct_algorithm`. Empty detection, reading and pointer movement support removal under the chosen convention.

Mục tiêu: SYL-19.1-15

- **BOOK-19-STACK** — 19.1.3, Stacks; trang in [464, 465, 466]; PDF [480, 481, 482].
  Represent a finite stack with array and pointers; initialise, check empty/full and push/pop; Python routines are present.
  Giới hạn: Book top points to last occupied slot(-1 when empty); corpus also uses next-free top. Pair rollback, operand order and reduction protocol are not supplied. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### stack/paired-restoration — Hai stack và phục hồi khi không ghép được

Quan hệ: `component_foundation`. Push/pop and branching are components; restoring an unmatched item is a question-specific protocol.

Mục tiêu: SYL-20.1-04

- **BOOK-19-STACK** — 19.1.3, Stacks; trang in [464, 465, 466]; PDF [480, 481, 482].
  Represent a finite stack with array and pointers; initialise, check empty/full and push/pop; Python routines are present.
  Giới hạn: Book top points to last occupied slot(-1 when empty); corpus also uses next-free top. Pair rollback, operand order and reduction protocol are not supplied. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### stack/reduce-operands — Lấy toán hạng và tính kết quả

Quan hệ: `component_foundation`. Repeated pop and accumulated state support reduction; operand order and operation protocol are QP-specific.

Mục tiêu: SYL-20.1-04

- **BOOK-19-STACK** — 19.1.3, Stacks; trang in [464, 465, 466]; PDF [480, 481, 482].
  Represent a finite stack with array and pointers; initialise, check empty/full and push/pop; Python routines are present.
  Giới hạn: Book top points to last occupied slot(-1 when empty); corpus also uses next-free top. Pair rollback, operand order and reduction protocol are not supplied. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-ACCUMULATE** — 9.2.2, Average algorithm and input checks; trang in [227, 228, 229]; PDF [243, 244, 245].
  Initialise an accumulator and counter, iterate over inputs and compute an aggregate; validate the requested quantity.
  Giới hạn: Does not cover grouping by a record key or destructive ADT consumption; those state transitions require the question's contract. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### queue/representation-conventions — Head, tail, count và quy ước rỗng

Quan hệ: `direct_algorithm`. FIFO, head/rear and count support queue representation; circular book examples do not replace linear QP conventions.

Mục tiêu: SYL-19.1-22, SYL-10.4-01, SYL-10.4-02

- **BOOK-19-QUEUE** — 19.1.3, Queues; trang in [466, 467, 468, 469]; PDF [482, 483, 484, 485].
  Represent a circular queue, maintain front/rear/count, wrap pointers and guard underflow/overflow; Python routines are present.
  Giới hạn: Do not force wraparound on linear-queue QPs. Live non-destructive inspection, terminal sentinels and reduction pipelines require QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ADT** — 10.4, Abstract data types (ADTs); trang in [250, 251]; PDF [266, 267].
  Explain data plus permitted operations; distinguish LIFO, FIFO and following node links.
  Giới hạn: Book's statements that linked-list insertions always occur at the start and queues always require circular management are contextual simplifications, not universal requirements. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### queue/enqueue — Enqueue, đầy và vòng chỉ số

Quan hệ: `direct_algorithm`. Capacity, insertion and index/count updates support enqueue, with wrapping only when required.

Mục tiêu: SYL-19.1-12

- **BOOK-19-QUEUE** — 19.1.3, Queues; trang in [466, 467, 468, 469]; PDF [482, 483, 484, 485].
  Represent a circular queue, maintain front/rear/count, wrap pointers and guard underflow/overflow; Python routines are present.
  Giới hạn: Do not force wraparound on linear-queue QPs. Live non-destructive inspection, terminal sentinels and reduction pipelines require QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### queue/dequeue — Dequeue, rỗng và giá trị trả về

Quan hệ: `direct_algorithm`. Empty condition and head/count changes support dequeue; sentinel types and reset follow the QP.

Mục tiêu: SYL-19.1-16

- **BOOK-19-QUEUE** — 19.1.3, Queues; trang in [466, 467, 468, 469]; PDF [482, 483, 484, 485].
  Represent a circular queue, maintain front/rear/count, wrap pointers and guard underflow/overflow; Python routines are present.
  Giới hạn: Do not force wraparound on linear-queue QPs. Live non-destructive inspection, terminal sentinels and reduction pipelines require QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### queue/inspect-live-items — Đọc các phần tử đang dùng mà không xóa

Quan hệ: `component_foundation`. Queue live boundaries and iteration support inspection without changing state; book dequeue is not reused as inspection.

Mục tiêu: SYL-20.1-04

- **BOOK-19-QUEUE** — 19.1.3, Queues; trang in [466, 467, 468, 469]; PDF [482, 483, 484, 485].
  Represent a circular queue, maintain front/rear/count, wrap pointers and guard underflow/overflow; Python routines are present.
  Giới hạn: Do not force wraparound on linear-queue QPs. Live non-destructive inspection, terminal sentinels and reduction pipelines require QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### queue/reduce-consume — Tổng hợp queue bằng đọc hoặc tiêu thụ dữ liệu

Quan hệ: `component_foundation`. Queue representation and accumulation support either read-only access or consumption; recursion is conditional on the source variant.

Mục tiêu: SYL-20.1-04

- **BOOK-19-QUEUE** — 19.1.3, Queues; trang in [466, 467, 468, 469]; PDF [482, 483, 484, 485].
  Represent a circular queue, maintain front/rear/count, wrap pointers and guard underflow/overflow; Python routines are present.
  Giới hạn: Do not force wraparound on linear-queue QPs. Live non-destructive inspection, terminal sentinels and reduction pipelines require QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-ACCUMULATE** — 9.2.2, Average algorithm and input checks; trang in [227, 228, 229]; PDF [243, 244, 245].
  Initialise an accumulator and counter, iterate over inputs and compute an aggregate; validate the requested quantity.
  Giới hạn: Does not cover grouping by a record key or destructive ADT consumption; those state transitions require the question's contract. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### linked-list/representation-free-list — Node, head và chuỗi vùng trống

Quan hệ: `direct_algorithm`. Separate logical links and free storage explain head, null and allocation state.

Mục tiêu: SYL-19.1-23, SYL-10.4-01, SYL-10.4-02

- **BOOK-19-LIST-SETUP** — 19.1.3, Linked lists; trang in [469, 470]; PDF [485, 486].
  Represent node data and next links in arrays, initialise a free list and identify start/null/free pointers.
  Giới hạn: Object-linked implementations and exact free-list conventions depend on the question; book uses parallel arrays. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### linked-list/traversal — Duyệt theo link, không theo ô mảng

Quan hệ: `component_foundation`. The search loop demonstrates following links; full output traversal removes the match stopping condition under QP requirements.

Mục tiêu: SYL-20.1-04

- **BOOK-19-LIST-SEARCH** — 19.1.3, Linked lists: finding an item; trang in [470, 471, 472, 473, 474]; PDF [486, 487, 488, 489, 490].
  Follow links from the start, compare current data and stop on match/null; Python find function and trace are present.
  Giới hạn: Directly supports linked-list search, a syllabus obligation even without its own Stage2 primary pattern. Full-list output is a transfer; deletion needs its separate source. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### linked-list/search — Tìm dữ liệu trong danh sách liên kết

Quan hệ: `direct_algorithm`. The book find operation explicitly handles a matching node or null result while following links.

Mục tiêu: SYL-19.1-09

- **BOOK-19-LIST-SEARCH** — 19.1.3, Linked lists: finding an item; trang in [470, 471, 472, 473, 474]; PDF [486, 487, 488, 489, 490].
  Follow links from the start, compare current data and stop on match/null; Python find function and trace are present.
  Giới hạn: Directly supports linked-list search, a syllabus obligation even without its own Stage2 primary pattern. Full-list output is a transfer; deletion needs its separate source. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### linked-list/insert — Lấy node trống và nối link khi chèn

Quan hệ: `direct_algorithm`. Allocate a free node and relink; front/tail insertion and object allocation remain separate source variants.

Mục tiêu: SYL-19.1-13

- **BOOK-19-LIST-INSERT** — 19.1.3, Inserting items into a linked list; trang in [474, 475, 476, 477]; PDF [490, 491, 492, 493].
  Take a free node, locate insertion position and relink live/free pointers; follow the diagrams and pseudocode.
  Giới hạn: This is ordered insertion; head/tail insertion variants and exact empty/full sentinels follow QP/MS. Python listing is not certified executable. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-LIST-SETUP** — 19.1.3, Linked lists; trang in [469, 470]; PDF [485, 486].
  Represent node data and next links in arrays, initialise a free list and identify start/null/free pointers.
  Giới hạn: Object-linked implementations and exact free-list conventions depend on the question; book uses parallel arrays. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### linked-list/remove-recycle — Bỏ node, nối lại và trả về vùng trống

Quan hệ: `direct_algorithm`. Search, unlink and free-list return support deletion; assumptions about presence and missing results must follow the task.

Mục tiêu: SYL-19.1-17

- **BOOK-19-LIST-REMOVE** — 19.1.3, Deleting items from a linked list; trang in [477, 478, 479, 480, 481]; PDF [493, 494, 495, 496, 497].
  Find the target, bypass it in the live chain and return its slot to the free chain; distinguish first-node handling.
  Giới hạn: Do not copy book deletion code without testing null/not-found/head cases. Object-linked variants may have no array free list. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### recursion/recursive-contract — Base case, recursive case và tiến triển

Quan hệ: `direct_algorithm`. Base case and smaller recursive problem establish progress and termination.

Mục tiêu: SYL-19.2-01, SYL-19.2-03

- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### recursion/call-stack-unwind — Frame riêng, call stack và trả ngược

Quan hệ: `direct_concept`. Separate frames and returned values explain winding and unwinding beyond observing a final screenshot.

Mục tiêu: SYL-19.1-27, SYL-19.2-04, SYL-19.2-06, SYL-19.2-07

- **BOOK-19-CALL-STACK** — 19.2.2, How a compiler implements recursion; trang in [494]; PDF [510].
  Explain saved return addresses/local variables on recursive calls and restoration during unwinding.
  Giới hạn: This is recursion's execution model, not the same user-defined stack exercise; no low-level implementation lesson is added. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### recursion/design-benefits — Nhận bài toán đệ quy và cân nhắc lợi ích

Quan hệ: `direct_concept`. Recursive mathematical examples and frame support explain suitable decomposition and the cost of pending calls.

Mục tiêu: SYL-19.2-03, SYL-19.2-05

- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-CALL-STACK** — 19.2.2, How a compiler implements recursion; trang in [494]; PDF [510].
  Explain saved return addresses/local variables on recursive calls and restoration during unwinding.
  Giới hạn: This is recursion's execution model, not the same user-defined stack exercise; no low-level implementation lesson is added. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### recursion/translate-recursive — Triển khai đệ quy đã cho và giữ kết quả trả về

Quan hệ: `direct_foundation`. Recursive calls and interfaces support preserving the supplied algorithm and return propagation.

Mục tiêu: SYL-19.2-02

- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-SUBROUTINES** — 11.3.1-11.3.2, Procedures; Functions; trang in [275, 276, 277, 278, 279, 280]; PDF [291, 292, 293, 294, 295, 296].
  Declare/call procedures and functions, pass parameters and return values; reason about local/global data.
  Giới hạn: Python argument passing must not be taught as literal BYREF syntax; exact signatures/return sentinels follow QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### recursion/iteration-conversion — Đổi đệ quy và vòng lặp, giữ đúng hành vi

Quan hệ: `component_foundation`. Recursion and iteration are both explained; an equivalent transformation preserving outputs/state is derived for each QP.

Mục tiêu: SYL-19.2-01

- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### binary-tree/representation — Root, con trái/phải và vùng chưa dùng

Quan hệ: `direct_concept`. Array child links and object-node references are distinct representations; neither is universally required.

Mục tiêu: SYL-19.1-25

- **BOOK-19-TREE-SETUP** — 19.1.3, Binary trees; trang in [481, 482]; PDF [497, 498].
  Identify root, left/right child links, leaf and null pointers; model ordered binary tree nodes.
  Giới hạn: Binary-tree concepts are broader than BST ordering; exact duplicate policy and array/object representation are question contracts. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-OBJECT-TREE** — 20.1.3, Writing a program for a binary tree; Tables20.6-20.9; trang in [517, 518, 519, 520, 521]; PDF [533, 534, 535, 536, 537].
  Represent node objects with child references, instantiate a root, insert recursively and search; connect objects and containment.
  Giới hạn: Printed520 Python search assigns a child reference into self.item rather than moving a node cursor; source code is unsuitable for direct reuse without later validation. Object/recursion approach is not compulsory for all QPs. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### binary-tree/ordered-insert — So sánh và gắn node mới trong BST

Quan hệ: `direct_algorithm`. Comparison-guided allocation and child-link updates support BST insertion, with QP-specific equal-key handling.

Mục tiêu: SYL-19.1-14

- **BOOK-19-TREE-INSERT** — 19.1.3, Inserting items into a binary tree; trang in [484, 485, 486, 487]; PDF [500, 501, 502, 503].
  Allocate a free node and attach it at the correct left/right position, including empty-tree handling.
  Giới hạn: Printed487 says objects and recursion are required, but this must not override corpus iterative array implementations. Duplicate/capacity rules are question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-OBJECT-TREE** — 20.1.3, Writing a program for a binary tree; Tables20.6-20.9; trang in [517, 518, 519, 520, 521]; PDF [533, 534, 535, 536, 537].
  Represent node objects with child references, instantiate a root, insert recursively and search; connect objects and containment.
  Giới hạn: Printed520 Python search assigns a child reference into self.item rather than moving a node cursor; source code is unsuitable for direct reuse without later validation. Object/recursion approach is not compulsory for all QPs. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### binary-tree/search — Chọn nhánh khi tìm trong BST

Quan hệ: `direct_algorithm`. Branch selection and null termination support tree lookup rather than midpoint array search.

Mục tiêu: SYL-19.1-10

- **BOOK-19-TREE-SEARCH** — 19.1.3, Finding an item in a binary tree; trang in [482, 483, 484]; PDF [498, 499, 500].
  Compare target with node data, follow a left/right link and terminate at match or null.
  Giới hạn: Array-based pseudocode is provided; guard an empty root and follow QP's return convention. Not the binary-search-in-array pattern. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-OBJECT-TREE** — 20.1.3, Writing a program for a binary tree; Tables20.6-20.9; trang in [517, 518, 519, 520, 521]; PDF [533, 534, 535, 536, 537].
  Represent node objects with child references, instantiate a root, insert recursively and search; connect objects and containment.
  Giới hạn: Printed520 Python search assigns a child reference into self.item rather than moving a node cursor; source code is unsuitable for direct reuse without later validation. Object/recursion approach is not compulsory for all QPs. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### binary-tree/traversals — Duyệt inorder và postorder theo yêu cầu đề

Quan hệ: `activity_and_foundation`. The book assigns traversal as an activity; visit-order algorithms require QP-grounded synthesis and later validation.

Mục tiêu: SYL-20.1-04

- **BOOK-19-TREE-TRAVERSE** — 19.1.3;20.1.3, Extension Activity19B; Extension Activity20B; trang in [481, 521]; PDF [497, 537].
  Book asks learners to investigate tree traversal and implement pre-order/post-order output.
  Giới hạn: No completed in-order/pre-order/post-order algorithm on these pages. Build exact algorithms from QP/MS plus tree and recursion knowledge, explicitly as AlgoCore synthesis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-RECURSION** — 19.2.1, Understanding recursion; trang in [490, 491, 492, 493]; PDF [506, 507, 508, 509].
  Identify base/general case, trace winding/unwinding and reason about recursive return values; factorial/Fibonacci/compound-interest examples are present.
  Giới hạn: No general proof that an arbitrary loop-to-recursion rewrite preserves outputs. Each corpus rewrite needs its own state and termination analysis. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-TREE-SETUP** — 19.1.3, Binary trees; trang in [481, 482]; PDF [497, 498].
  Identify root, left/right child links, leaf and null pointers; model ordered binary tree nodes.
  Giới hạn: Binary-tree concepts are broader than BST ordering; exact duplicate policy and array/object representation are question contracts. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### dictionary/adt-interface — Khóa duy nhất, giá trị và giao diện ADT

Quan hệ: `direct_concept`. Unique keys and associated values define the logical interface independently of its implementation.

Mục tiêu: SYL-19.1-24, SYL-10.4-01

- **BOOK-19-DICTIONARY** — 19.1.4, Dictionary; trang in [488, 489, 490]; PDF [504, 505, 506].
  Use unique keys to retrieve values, permit duplicate values and compose the representation from other ADTs; Activity19P asks find/add/delete.
  Giới hạn: Do not equate corpus hash-table tasks with full dictionary add/find/delete coverage. Printed489 Java table includes a Python dict line; code is not validated. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### dictionary/find-insert — Tìm khóa, chèn và cập nhật giá trị

Quan hệ: `activity_and_concept`. Activity19P requests find/add; duplicate-key and missing-key contracts need explicit teaching design.

Mục tiêu: SYL-19.1-24

- **BOOK-19-DICTIONARY** — 19.1.4, Dictionary; trang in [488, 489, 490]; PDF [504, 505, 506].
  Use unique keys to retrieve values, permit duplicate values and compose the representation from other ADTs; Activity19P asks find/add/delete.
  Giới hạn: Do not equate corpus hash-table tasks with full dictionary add/find/delete coverage. Printed489 Java table includes a Python dict line; code is not validated. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### dictionary/delete — Xóa khóa và xử lý khóa không tồn tại

Quan hệ: `activity_and_concept`. Activity19P requests deletion; later original assessment must verify the postcondition and missing-key policy.

Mục tiêu: SYL-19.1-24

- **BOOK-19-DICTIONARY** — 19.1.4, Dictionary; trang in [488, 489, 490]; PDF [504, 505, 506].
  Use unique keys to retrieve values, permit duplicate values and compose the representation from other ADTs; Activity19P asks find/add/delete.
  Giới hạn: Do not equate corpus hash-table tasks with full dictionary add/find/delete coverage. Printed489 Java table includes a Python dict line; code is not validated. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### dictionary/representation-choice — Giao diện logic và cách biểu diễn

Quan hệ: `direct_concept`. The text relates a dictionary to another ADT and contrasts logical interface with provided language types.

Mục tiêu: SYL-19.1-24

- **BOOK-19-DICTIONARY** — 19.1.4, Dictionary; trang in [488, 489, 490]; PDF [504, 505, 506].
  Use unique keys to retrieve values, permit duplicate values and compose the representation from other ADTs; Activity19P asks find/add/delete.
  Giới hạn: Do not equate corpus hash-table tasks with full dictionary add/find/delete coverage. Printed489 Java table includes a Python dict line; code is not validated. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-ADT-COMPOSITION** — 19.1.4, Implementing one ADT from another ADT; trang in [488, 489]; PDF [504, 505].
  Construct composite ADTs by referring to existing data types; represent linked records and dictionary keys/values.
  Giới hạn: Book declarations/examples are explanatory and include questionable syntax; do not present as validated Python implementations. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### dictionary/other-adt-implementation — Dùng ADT khác để cài đặt dictionary

Quan hệ: `direct_concept`. The dictionary definition using a linked list supports a concrete ADT-composition demonstration; later code must preserve the chosen dictionary contract.

Mục tiêu: SYL-19.1-30

- **BOOK-19-ADT-COMPOSITION** — 19.1.4, Implementing one ADT from another ADT; trang in [488, 489]; PDF [504, 505].
  Construct composite ADTs by referring to existing data types; represent linked records and dictionary keys/values.
  Giới hạn: Book declarations/examples are explanatory and include questionable syntax; do not present as validated Python implementations. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-DICTIONARY** — 19.1.4, Dictionary; trang in [488, 489, 490]; PDF [504, 505, 506].
  Use unique keys to retrieve values, permit duplicate values and compose the representation from other ADTs; Activity19P asks find/add/delete.
  Giới hạn: Do not equate corpus hash-table tasks with full dictionary add/find/delete coverage. Printed489 Java table includes a Python dict line; code is not validated. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### hashing/table-storage — Bảng băm và vùng va chạm được chỉ định

Quan hệ: `concept_and_adaptation`. Hash-address/collision concepts and record arrays support storage; Spare and 100x10 bucket layouts are corpus-specific.

Mục tiêu: SYL-13.2-03

- **BOOK-13-HASH** — 13.2.2, Hashing algorithms; trang in [310, 311]; PDF [326, 327].
  Calculate a location from a key, address/record size and modulo; detect collisions; compare keys during retrieval; understand next-free and overflow-area handling.
  Giới hạn: Book does not specify corpus100x10 buckets or Spare-array contracts. Preserve the question's collision policy; book terminology open/closed is source wording, not a universal naming rule. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-RECORDS** — 10.1.2, Records; trang in [240, 241]; PDF [256, 257].
  Define heterogeneous record fields, instantiate a record and access named fields.
  Giới hạn: A TYPE record may use a Python class substitute when permitted; an explicit OOP class task remains distinct. No full Python record-class listing here. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### hashing/hash-address — Tính địa chỉ băm theo công thức đề

Quan hệ: `direct_concept`. Key-to-address mapping and arithmetic support the exact modulus specified in QP.

Mục tiêu: SYL-13.2-03

- **BOOK-13-HASH** — 13.2.2, Hashing algorithms; trang in [310, 311]; PDF [326, 327].
  Calculate a location from a key, address/record size and modulo; detect collisions; compare keys during retrieval; understand next-free and overflow-area handling.
  Giới hạn: Book does not specify corpus100x10 buckets or Spare-array contracts. Preserve the question's collision policy; book terminology open/closed is source wording, not a universal naming rule. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### hashing/insert-collisions — Chèn và xử lý va chạm theo cấu trúc đề

Quan hệ: `concept_and_adaptation`. Collision handling and indexed storage are foundations; spare/bucket search and full policy are specified by QP.

Mục tiêu: SYL-13.2-03

- **BOOK-13-HASH** — 13.2.2, Hashing algorithms; trang in [310, 311]; PDF [326, 327].
  Calculate a location from a key, address/record size and modulo; detect collisions; compare keys during retrieval; understand next-free and overflow-area handling.
  Giới hạn: Book does not specify corpus100x10 buckets or Spare-array contracts. Preserve the question's collision policy; book terminology open/closed is source wording, not a universal naming rule. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### hashing/find-collisions — Tìm khóa qua bảng và vùng va chạm

Quan hệ: `component_foundation`. Hash address plus key checking in the collision region supports lookup; no claim of identical book probing strategy.

Mục tiêu: SYL-13.2-03

- **BOOK-13-HASH** — 13.2.2, Hashing algorithms; trang in [310, 311]; PDF [326, 327].
  Calculate a location from a key, address/record size and modulo; detect collisions; compare keys during retrieval; understand next-free and overflow-area handling.
  Giới hạn: Book does not specify corpus100x10 buckets or Spare-array contracts. Preserve the question's collision policy; book terminology open/closed is source wording, not a universal naming rule. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-LINEAR** — 19.1.1, Understanding linear and binary searching methods: Linear search; trang in [451, 452, 453, 454]; PDF [467, 468, 469, 470].
  Check each array element, terminate on found/exhausted and report a result; Python implementation and Activity19A are present.
  Giới hạn: Do not stop early for frequency-count tasks. Review pointer/bounds and return type against each question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-model/class-object — Phân biệt lớp, đối tượng và thuộc tính

Quan hệ: `direct_concept`. Class definitions and object instances distinguish templates, attributes and methods.

Mục tiêu: SYL-20.1-07, SYL-20.1-17, SYL-20.1-08, SYL-20.1-09, SYL-20.1-10, SYL-20.1-19

- **BOOK-20-CLASS** — 20.1.3, Class; Object; Encapsulation; trang in [501, 502, 503, 504]; PDF [517, 518, 519, 520].
  Read a class diagram, define attributes/methods, create instances and encapsulate private data; Python example appears onprinted502-503.
  Giới hạn: Constructor/visibility requirements follow QP. Do not force privacy onto explicitly public Recordclass tasks or confuse TYPErecord substitutes with full OOP tasks. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-model/constructor — Constructor, tham số và trạng thái ban đầu

Quan hệ: `direct_concept`. Constructor parameters/defaults establish initial state without creating a separate instance at class definition time.

Mục tiêu: SYL-20.1-08

- **BOOK-20-CONSTRUCTORS** — 20.1.3, Object methods: constructors and constructing an object; trang in [515, 516]; PDF [531, 532].
  Initialise a new object's attributes and instantiate with constructor arguments.
  Giới hạn: Default array contents and parameter order follow QP/MS; book typesetting around Python underscores/spaces must not be copied literally. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-CLASS** — 20.1.3, Class; Object; Encapsulation; trang in [501, 502, 503, 504]; PDF [517, 518, 519, 520].
  Read a class diagram, define attributes/methods, create instances and encapsulate private data; Python example appears onprinted502-503.
  Giới hạn: Constructor/visibility requirements follow QP. Do not force privacy onto explicitly public Recordclass tasks or confuse TYPErecord substitutes with full OOP tasks. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-model/instantiate — Tạo nhiều instance và giữ trạng thái riêng

Quan hệ: `direct_concept`. Construction examples show passing arguments and keeping distinct instances.

Mục tiêu: SYL-20.1-07, SYL-20.1-17, SYL-20.1-19

- **BOOK-20-CONSTRUCTORS** — 20.1.3, Object methods: constructors and constructing an object; trang in [515, 516]; PDF [531, 532].
  Initialise a new object's attributes and instantiate with constructor arguments.
  Giới hạn: Default array contents and parameter order follow QP/MS; book typesetting around Python underscores/spaces must not be copied literally. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-CLASS** — 20.1.3, Class; Object; Encapsulation; trang in [501, 502, 503, 504]; PDF [517, 518, 519, 520].
  Read a class diagram, define attributes/methods, create instances and encapsulate private data; Python example appears onprinted502-503.
  Giới hạn: Constructor/visibility requirements follow QP. Do not force privacy onto explicitly public Recordclass tasks or confuse TYPErecord substitutes with full OOP tasks. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-model/class-design — Chọn thuộc tính và phương thức từ bài toán

Quan hệ: `component_foundation`. Class diagrams, has-a relationships and decomposition support selecting responsibilities; an unseen problem needs an original design assessment.

Mục tiêu: SYL-20.1-18

- **BOOK-20-CLASS** — 20.1.3, Class; Object; Encapsulation; trang in [501, 502, 503, 504]; PDF [517, 518, 519, 520].
  Read a class diagram, define attributes/methods, create instances and encapsulate private data; Python example appears onprinted502-503.
  Giới hạn: Constructor/visibility requirements follow QP. Do not force privacy onto explicitly public Recordclass tasks or confuse TYPErecord substitutes with full OOP tasks. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-CONTAINMENT** — 20.1.3, Containment; trang in [514, 515]; PDF [530, 531].
  Distinguish contains-a from is-a; model an object holding bounded arrays of other objects and a live count.
  Giới hạn: Book gives diagram and named operations but no complete capacity-checked append method; boundary checks are exam-derived. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-09-DECOMPOSE** — 9.1.1-9.1.2, Using abstraction; Using decomposition; trang in [218, 219]; PDF [234, 235].
  Separate a problem into subproblems and retain relevant data and operations.
  Giới hạn: Does not specify the call sequence or global state of any corpus question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-state/encapsulation — Đóng gói và truy cập qua phương thức

Quan hệ: `direct_concept`. The encapsulation discussion supports controlled access; language-specific privacy limits need careful later wording.

Mục tiêu: SYL-20.1-14

- **BOOK-20-CLASS** — 20.1.3, Class; Object; Encapsulation; trang in [501, 502, 503, 504]; PDF [517, 518, 519, 520].
  Read a class diagram, define attributes/methods, create instances and encapsulate private data; Python example appears onprinted502-503.
  Giới hạn: Constructor/visibility requirements follow QP. Do not force privacy onto explicitly public Recordclass tasks or confuse TYPErecord substitutes with full OOP tasks. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-state/getters — Accessor trả đúng dữ liệu đang lưu

Quan hệ: `direct_concept`. Table20.4 returns an existing attribute rather than computing or formatting a derived result.

Mục tiêu: SYL-20.1-15

- **BOOK-20-GETTERS** — 20.1.3, Object methods: Getter; Table 20.4; trang in [516]; PDF [532].
  Return the value of a stored object property through a method.
  Giới hạn: A computed formatted string is not automatically a getter; follow QP return type and scope. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-state/setters — Setter gán trực tiếp giá trị mới

Quan hệ: `direct_concept`. Table20.3 assigns a new attribute value; it does not imply additive updates.

Mục tiêu: SYL-20.1-16

- **BOOK-20-SETTERS** — 20.1.3, Object methods: Setter; Table 20.3; trang in [516]; PDF [532].
  Control changes to a private property through a method and parameter.
  Giới hạn: OOP_UPDATE with add/clamp/multiply rules is an exam transfer, not the plain replacement setter shown here. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-state/rule-updates — Cộng, chặn biên và thay đổi theo quy tắc

Quan hệ: `component_foundation`. Object state plus arithmetic/selection supports relative changes and clamps; the source rule controls the transition.

Mục tiêu: SYL-20.1-09, SYL-20.1-19

- **BOOK-20-SETTERS** — 20.1.3, Object methods: Setter; Table 20.3; trang in [516]; PDF [532].
  Control changes to a private property through a method and parameter.
  Giới hạn: OOP_UPDATE with add/clamp/multiply rules is an exam transfer, not the plain replacement setter shown here. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-inheritance/base-derived — Lớp cha/con và khởi tạo phần kế thừa

Quan hệ: `direct_concept`. Base and derived class examples show inherited state, new attributes and parent initialisation.

Mục tiêu: SYL-20.1-11

- **BOOK-20-INHERITANCE** — 20.1.3, Inheritance; trang in [505, 506, 507, 508, 509]; PDF [521, 522, 523, 524, 525].
  Define base/derived classes, inherit attributes/methods and initialise subclass state; Python example onprinted506.
  Giới hạn: Python double-underscore name mangling and superclass initialisation need implementation review; do not infer public/protected access from prose alone. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-inheritance/override-dispatch — Ghi đè và chọn phương thức của đối tượng

Quan hệ: `direct_concept`. Overridden methods in derived shapes illustrate different behavior for a shared method name.

Mục tiêu: SYL-20.1-12

- **BOOK-20-POLYMORPHISM** — 20.1.3, Polymorphism and overloading: Example of polymorphism; trang in [509, 510, 511, 512, 513]; PDF [525, 526, 527, 528, 529].
  Redefine a method in derived classes and invoke class-specific behaviour through objects.
  Giới hạn: QP formulas, caps and return contracts are additional assessed content. Python default-argument overloading example on513 is not a separate required pattern. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-inheritance/substitutability — Lời gọi chung, hành vi khác theo lớp

Quan hệ: `component_foundation`. Shared method behavior supports polymorphic use; formal substitutability theory is not a required new syllabus topic.

Mục tiêu: SYL-20.1-12

- **BOOK-20-POLYMORPHISM** — 20.1.3, Polymorphism and overloading: Example of polymorphism; trang in [509, 510, 511, 512, 513]; PDF [525, 526, 527, 528, 529].
  Redefine a method in derived classes and invoke class-specific behaviour through objects.
  Giới hạn: QP formulas, caps and return contracts are additional assessed content. Python default-argument overloading example on513 is not a separate required pattern. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-aggregation/has-a — Đối tượng thành phần và quan hệ has-a

Quan hệ: `direct_concept`. Containment diagrams distinguish a collection of component objects from an inheritance relationship.

Mục tiêu: SYL-20.1-13

- **BOOK-20-CONTAINMENT** — 20.1.3, Containment; trang in [514, 515]; PDF [530, 531].
  Distinguish contains-a from is-a; model an object holding bounded arrays of other objects and a live count.
  Giới hạn: Book gives diagram and named operations but no complete capacity-checked append method; boundary checks are exam-derived. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-aggregation/bounded-add — Thêm object có giới hạn và báo kết quả

Quan hệ: `component_foundation`. Object collections and stated capacities support bounded addition; the exam supplies update/result rules.

Mục tiêu: SYL-20.1-13

- **BOOK-20-CONTAINMENT** — 20.1.3, Containment; trang in [514, 515]; PDF [530, 531].
  Distinguish contains-a from is-a; model an object holding bounded arrays of other objects and a live count.
  Giới hạn: Book gives diagram and named operations but no complete capacity-checked append method; boundary checks are exam-derived. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### oop-aggregation/nested-access — Truy cập và tính qua các object thành phần

Quan hệ: `component_foundation`. Contained-object references and method contracts support delegating reads and calculations across components.

Mục tiêu: SYL-20.1-09, SYL-20.1-13

- **BOOK-20-CONTAINMENT** — 20.1.3, Containment; trang in [514, 515]; PDF [530, 531].
  Distinguish contains-a from is-a; model an object holding bounded arrays of other objects and a live count.
  Giới hạn: Book gives diagram and named operations but no complete capacity-checked append method; boundary checks are exam-derived. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-GETTERS** — 20.1.3, Object methods: Getter; Table 20.4; trang in [516]; PDF [532].
  Return the value of a stored object property through a method.
  Giới hạn: A computed formatted string is not automatically a getter; follow QP return type and scope. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-SUBROUTINES** — 11.3.1-11.3.2, Procedures; Functions; trang in [275, 276, 277, 278, 279, 280]; PDF [291, 292, 293, 294, 295, 296].
  Declare/call procedures and functions, pass parameters and return values; reason about local/global data.
  Giới hạn: Python argument passing must not be taught as literal BYREF syntax; exact signatures/return sentinels follow QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-files/file-lifecycle — Mở, đóng, đọc, ghi và chế độ thêm

Quan hệ: `direct_foundation`. Open/read/write/close and record iteration support file lifecycle; retain per-source mode and resource requirements.

Mục tiêu: SYL-20.2-01, SYL-20.2-04, SYL-10.3-01

- **BOOK-10-TEXT-FILES** — 10.3, Files; trang in [249, 250]; PDF [265, 266].
  Open text files for read/write/append, process lines as strings, use end-of-file condition and close files.
  Giới hạn: Line grouping, delimiters, conversion, object construction, newline handling and exact file names need exam-specific evidence. Example pseudocode is not validated production code. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-FILE-RECORDS** — 20.2.1, Storing records in a serial or sequential file; trang in [526, 527, 528]; PDF [542, 543, 544].
  Define structured records, open a file, write/read successive records and close; Python example uses binary serialisation.
  Giới hạn: The binary pickle example is not interchangeable with supplied exam text files; preserve format contract. Arrays/record field indexing in source pseudocode require review. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-files/record-loading — Đọc theo cấu trúc bản ghi và chuyển kiểu

Quan hệ: `component_foundation`. Reading record fields and string primitives support QP-specific line/delimiter/type layouts.

Mục tiêu: SYL-20.2-05, SYL-10.3-01

- **BOOK-10-TEXT-FILES** — 10.3, Files; trang in [249, 250]; PDF [265, 266].
  Open text files for read/write/append, process lines as strings, use end-of-file condition and close files.
  Giới hạn: Line grouping, delimiters, conversion, object construction, newline handling and exact file names need exam-specific evidence. Example pseudocode is not validated production code. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-FILE-RECORDS** — 20.2.1, Storing records in a serial or sequential file; trang in [526, 527, 528]; PDF [542, 543, 544].
  Define structured records, open a file, write/read successive records and close; Python example uses binary serialisation.
  Giới hạn: The binary pickle example is not interchangeable with supplied exam text files; preserve format contract. Arrays/record field indexing in source pseudocode require review. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-files/serial-sequential — Tệp serial, sequential và thứ tự bản ghi

Quan hệ: `direct_concept`. Organisation by arrival or ordered key differs from the sequential access mechanism; maintaining sorted records needs a separate task.

Mục tiêu: SYL-20.2-07, SYL-20.2-08, SYL-13.2-01

- **BOOK-13-FILE-ORGANISATION** — 13.2.1, File organisation and file access; trang in [308, 309, 310]; PDF [324, 325, 326].
  Distinguish serial arrival order, sequential key order, random organisation, sequential access and direct access; choose for retrieval/update workload.
  Giới hạn: In-memory hash arrays do not demonstrate persistent random-file operations. Supporting theory outside19-20 is not an independent new core topic. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-FILE-SEQUENTIAL** — 20.2.1, Adding a record to a sequential file; trang in [531, 532, 533]; PDF [547, 548, 549].
  Copy records around a new record for ordered insertion, and distinguish append at end from insertion by key.
  Giới hạn: Printed532 loop/EOF logic is suspect and not certified; no new implementation is supplied here. Serial/sequential coverage must be distinguished from just loading text into memory. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-files/write-append — Ghi đè, thêm và định dạng dòng

Quan hệ: `direct_foundation`. Writing and appending have distinct effects; Table20.12 anchors append mode without claiming append always preserves key order.

Mục tiêu: SYL-20.2-02, SYL-20.2-03, SYL-20.2-06

- **BOOK-10-TEXT-FILES** — 10.3, Files; trang in [249, 250]; PDF [265, 266].
  Open text files for read/write/append, process lines as strings, use end-of-file condition and close files.
  Giới hạn: Line grouping, delimiters, conversion, object construction, newline handling and exact file names need exam-specific evidence. Example pseudocode is not validated production code. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-FILE-SEQUENTIAL** — 20.2.1, Adding a record to a sequential file; trang in [531, 532, 533]; PDF [547, 548, 549].
  Copy records around a new record for ordered insertion, and distinguish append at end from insertion by key.
  Giới hạn: Printed532 loop/EOF logic is suspect and not certified; no new implementation is supplied here. Serial/sequential coverage must be distinguished from just loading text into memory. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### text-files/adt-loading — Đọc dữ liệu rồi gọi đúng thao tác ADT

Quan hệ: `component_foundation`. File iteration and routine interfaces support handing input to existing ADT operations; exact full/error behavior comes from QP.

Mục tiêu: SYL-20.1-05

- **BOOK-10-TEXT-FILES** — 10.3, Files; trang in [249, 250]; PDF [265, 266].
  Open text files for read/write/append, process lines as strings, use end-of-file condition and close files.
  Giới hạn: Line grouping, delimiters, conversion, object construction, newline handling and exact file names need exam-specific evidence. Example pseudocode is not validated production code. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-SUBROUTINES** — 11.3.1-11.3.2, Procedures; Functions; trang in [275, 276, 277, 278, 279, 280]; PDF [291, 292, 293, 294, 295, 296].
  Declare/call procedures and functions, pass parameters and return values; reason about local/global data.
  Giới hạn: Python argument passing must not be taught as literal BYREF syntax; exact signatures/return sentinels follow QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### object-files/construct-from-record — Tạo đối tượng từ từng bản ghi

Quan hệ: `component_foundation`. Record reading plus construction supports one object per record; exact layout and array/count are source-specific.

Mục tiêu: SYL-20.2-05

- **BOOK-20-FILE-RECORDS** — 20.2.1, Storing records in a serial or sequential file; trang in [526, 527, 528]; PDF [542, 543, 544].
  Define structured records, open a file, write/read successive records and close; Python example uses binary serialisation.
  Giới hạn: The binary pickle example is not interchangeable with supplied exam text files; preserve format contract. Arrays/record field indexing in source pseudocode require review. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-CONSTRUCTORS** — 20.1.3, Object methods: constructors and constructing an object; trang in [515, 516]; PDF [531, 532].
  Initialise a new object's attributes and instantiate with constructor arguments.
  Giới hạn: Default array contents and parameter order follow QP/MS; book typesetting around Python underscores/spaces must not be copied literally. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### object-files/subclass-records — Nhận loại bản ghi và chọn subclass

Quan hệ: `component_foundation`. File structure, subclass constructors and branch selection support QP-specific variable-record dispatch.

Mục tiêu: SYL-20.1-19

- **BOOK-20-FILE-RECORDS** — 20.2.1, Storing records in a serial or sequential file; trang in [526, 527, 528]; PDF [542, 543, 544].
  Define structured records, open a file, write/read successive records and close; Python example uses binary serialisation.
  Giới hạn: The binary pickle example is not interchangeable with supplied exam text files; preserve format contract. Arrays/record field indexing in source pseudocode require review. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-INHERITANCE** — 20.1.3, Inheritance; trang in [505, 506, 507, 508, 509]; PDF [521, 522, 523, 524, 525].
  Define base/derived classes, inherit attributes/methods and initialise subclass state; Python example onprinted506.
  Giới hạn: Python double-underscore name mangling and superclass initialisation need implementation review; do not infer public/protected access from prose alone. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-CONSTRUCTS** — 11.2.1-11.2.2, CASE and IF; Loops; trang in [271, 272, 273, 274, 275]; PDF [287, 288, 289, 290, 291].
  Select by exact values/ranges, combine decisions and use pre/post-condition or count-controlled repetition.
  Giới hạn: Exam predicates, scoring bands, consumed-answer markers and termination sentinels remain question-specific. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### object-files/lookup-update — Đọc khóa, tìm object và cập nhật

Quan hệ: `component_foundation`. Read keys, find the existing object and call its update method; construction is not implied.

Mục tiêu: SYL-20.2-05

- **BOOK-20-FILE-RECORDS** — 20.2.1, Storing records in a serial or sequential file; trang in [526, 527, 528]; PDF [542, 543, 544].
  Define structured records, open a file, write/read successive records and close; Python example uses binary serialisation.
  Giới hạn: The binary pickle example is not interchangeable with supplied exam text files; preserve format contract. Arrays/record field indexing in source pseudocode require review. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-LINEAR** — 19.1.1, Understanding linear and binary searching methods: Linear search; trang in [451, 452, 453, 454]; PDF [467, 468, 469, 470].
  Check each array element, terminate on found/exhausted and report a result; Python implementation and Activity19A are present.
  Giới hạn: Do not stop early for frequency-count tasks. Review pointer/bounds and return type against each question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-SETTERS** — 20.1.3, Object methods: Setter; Table 20.3; trang in [516]; PDF [532].
  Control changes to a private property through a method and parameter.
  Giới hạn: OOP_UPDATE with add/clamp/multiply rules is an exam transfer, not the plain replacement setter shown here. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### random-files/organisation-access — Phân biệt tổ chức tệp và cách truy cập

Quan hệ: `direct_concept`. Organisation/access and keyed addressing distinguish random files from scanning lines or an in-memory hash table.

Mục tiêu: SYL-20.2-09, SYL-13.2-01, SYL-13.2-02, P4-ADM-08, P4-ADM-13

- **BOOK-13-FILE-ORGANISATION** — 13.2.1, File organisation and file access; trang in [308, 309, 310]; PDF [324, 325, 326].
  Distinguish serial arrival order, sequential key order, random organisation, sequential access and direct access; choose for retrieval/update workload.
  Giới hạn: In-memory hash arrays do not demonstrate persistent random-file operations. Supporting theory outside19-20 is not an independent new core topic. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-FILE-RANDOM** — 20.2.1, Adding a record to a random file; Finding a record in a random file; trang in [533, 534, 535]; PDF [549, 550, 551].
  Compute an address from a key, SEEK, PUTRECORD/GETRECORD and close a random-access file.
  Giới hạn: Only pseudocode plus extension activities for these operations; exact Python storage layout and collision handling are not implemented. In-memory HASH tasks are not proof of this skill. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### random-files/record-address — Địa chỉ bản ghi và một cách biểu diễn Python

Quan hệ: `concept_and_adaptation`. The source shows record addresses and SEEK; fixed-size byte offsets are a proposed Python implementation choice to verify later.

Mục tiêu: SYL-20.2-09, SYL-13.2-04

- **BOOK-20-FILE-RANDOM** — 20.2.1, Adding a record to a random file; Finding a record in a random file; trang in [533, 534, 535]; PDF [549, 550, 551].
  Compute an address from a key, SEEK, PUTRECORD/GETRECORD and close a random-access file.
  Giới hạn: Only pseudocode plus extension activities for these operations; exact Python storage layout and collision handling are not implemented. In-memory HASH tasks are not proof of this skill. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-13-HASH** — 13.2.2, Hashing algorithms; trang in [310, 311]; PDF [326, 327].
  Calculate a location from a key, address/record size and modulo; detect collisions; compare keys during retrieval; understand next-free and overflow-area handling.
  Giới hạn: Book does not specify corpus100x10 buckets or Spare-array contracts. Preserve the question's collision policy; book terminology open/closed is source wording, not a universal naming rule. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### random-files/read-write-update — Đọc, ghi và sửa đúng bản ghi ngẫu nhiên

Quan hệ: `concept_and_adaptation`. SEEK plus record read/write supplies the capability; exact Python storage format and tests are not provided by this locator.

Mục tiêu: SYL-20.2-09, SYL-13.2-04

- **BOOK-20-FILE-RANDOM** — 20.2.1, Adding a record to a random file; Finding a record in a random file; trang in [533, 534, 535]; PDF [549, 550, 551].
  Compute an address from a key, SEEK, PUTRECORD/GETRECORD and close a random-access file.
  Giới hạn: Only pseudocode plus extension activities for these operations; exact Python storage layout and collision handling are not implemented. In-memory HASH tasks are not proof of this skill. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### exceptions/runtime-failures — Nhận diện ngoại lệ và nguyên nhân

Quan hệ: `direct_concept`. Exception examples and error categories distinguish unexpected runtime failures from invalid-domain checks.

Mục tiêu: SYL-20.2-10, SYL-20.2-11

- **BOOK-20-EXCEPTIONS** — 20.2.2, Exception handling; trang in [535, 536, 537]; PDF [551, 552, 553].
  Recognise disrupted execution, trap division/input/file errors, recover or stop in an orderly way; extend file handling for missing file/unexpected EOF.
  Giới hạn: Book Python uses bare except; this is not a claim that every QP requires broad handling or that all validation is exception handling. Coverage must be evidenced separately. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### exceptions/handle-recover — Bắt ngoại lệ và phục hồi có chủ đích

Quan hệ: `direct_concept`. TRY/EXCEPT examples support handling and recovery; choosing precise Python exceptions is later verified implementation work.

Mục tiêu: SYL-20.2-11, SYL-20.2-12

- **BOOK-20-EXCEPTIONS** — 20.2.2, Exception handling; trang in [535, 536, 537]; PDF [551, 552, 553].
  Recognise disrupted execution, trap division/input/file errors, recover or stop in an orderly way; extend file handling for missing file/unexpected EOF.
  Giới hạn: Book Python uses bare except; this is not a claim that every QP requires broad handling or that all validation is exception handling. Coverage must be evidenced separately. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### exceptions/cleanup — Đóng tài nguyên khi thành công hoặc lỗi

Quan hệ: `component_foundation`. Close operations and exception paths establish the need; finally/context-manager details are an implementation choice beyond these examples.

Mục tiêu: SYL-20.2-04

- **BOOK-10-TEXT-FILES** — 10.3, Files; trang in [249, 250]; PDF [265, 266].
  Open text files for read/write/append, process lines as strings, use end-of-file condition and close files.
  Giới hạn: Line grouping, delimiters, conversion, object construction, newline handling and exact file names need exam-specific evidence. Example pseudocode is not validated production code. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-20-EXCEPTIONS** — 20.2.2, Exception handling; trang in [535, 536, 537]; PDF [551, 552, 553].
  Recognise disrupted execution, trap division/input/file errors, recover or stop in an orderly way; extend file handling for missing file/unexpected EOF.
  Giới hạn: Book Python uses bare except; this is not a claim that every QP requires broad handling or that all validation is exception handling. Coverage must be evidenced separately. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### performance/asymptotic-cost — So sánh Big O thời gian và không gian

Quan hệ: `direct_concept`. Time and space growth tables support comparison with explicit input-size and case assumptions.

Mục tiêu: SYL-19.1-04, SYL-19.1-26, SYL-19.1-27, SYL-19.1-28, SYL-19.1-29

- **BOOK-19-COMPLEXITY** — 19.1.5, Comparing algorithms; trang in [489, 490]; PDF [505, 506].
  Compare growth in worst-case time and space using BigO and the listed search/sort examples.
  Giới hạn: Contextual explanation and practical choice, not a new Paper4 essay pattern. Avoid blanket time complexity claims independent of implementation/assumptions. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### performance/algorithm-choice — Chọn thuật toán theo điều kiện dữ liệu

Quan hệ: `direct_concept`. Cost, sorted-input conditions and ADT purpose support selecting a suitable method.

Mục tiêu: SYL-19.1-26, SYL-11.3-05

- **BOOK-19-COMPLEXITY** — 19.1.5, Comparing algorithms; trang in [489, 490]; PDF [505, 506].
  Compare growth in worst-case time and space using BigO and the listed search/sort examples.
  Giới hạn: Contextual explanation and practical choice, not a new Paper4 essay pattern. Avoid blanket time complexity claims independent of implementation/assumptions. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-BINARY** — 19.1.1, Binary search; trang in [454, 455, 456, 457]; PDF [470, 471, 472, 473].
  Require ordered input, compare midpoint and reduce the search interval; compare numbers of comparisons.
  Giới hạn: Printed455-457 pseudocode/language table has suspect equality-based termination; use as concept/source reference, not approved code. Recursive variants need recursion source plus QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ADT** — 10.4, Abstract data types (ADTs); trang in [250, 251]; PDF [266, 267].
  Explain data plus permitted operations; distinguish LIFO, FIFO and following node links.
  Giới hạn: Book's statements that linked-list insertions always occur at the start and queues always require circular management are contextual simplifications, not universal requirements. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### performance/trace-cost — Đếm bước để giải thích hiệu năng

Quan hệ: `component_foundation`. Count meaningful comparisons/swaps on algorithm traces, then relate counts to growth; wall-clock timing is not a proof.

Mục tiêu: SYL-19.1-04, SYL-19.1-07, SYL-19.1-08

- **BOOK-19-BINARY** — 19.1.1, Binary search; trang in [454, 455, 456, 457]; PDF [470, 471, 472, 473].
  Require ordered input, compare midpoint and reduce the search interval; compare numbers of comparisons.
  Giới hạn: Printed455-457 pseudocode/language table has suspect equality-based termination; use as concept/source reference, not approved code. Recursive variants need recursion source plus QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-BUBBLE** — 19.1.2, Understanding insertion and bubble sorting methods: Bubble sort; trang in [458, 459, 460, 461]; PDF [474, 475, 476, 477].
  Compare adjacent entries and swap to order them, repeat passes, recognise decreasing bound and swap flag.
  Giới hạn: Book/source code has known swap-flag placement risk also visible atprinted245; later code must be tested. Whole-row/multikey/direction variants come from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-INSERTION** — 19.1.2, Insertion sort; trang in [461, 462, 463, 464]; PDF [477, 478, 479, 480].
  Take the next value, shift larger predecessors and insert the saved value into its ordered position; interpret trace of array changes.
  Giới hạn: ORDERED_INSERT is a transfer from the inner insertion operation, not the full sort; fixed top-N retention and multi-field shifts require QP/MS. Check boundary guard order before implementation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-19-COMPLEXITY** — 19.1.5, Comparing algorithms; trang in [489, 490]; PDF [505, 506].
  Compare growth in worst-case time and space using BigO and the listed search/sort examples.
  Giới hạn: Contextual explanation and practical choice, not a new Paper4 essay pattern. Avoid blanket time complexity claims independent of implementation/assumptions. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### graphs/characteristics — Đỉnh, cạnh và các đặc trưng đồ thị

Quan hệ: `direct_concept`. Nodes, edges, direction, weights, paths and cycles support describing a graph without requiring graph code.

Mục tiêu: SYL-19.1-18

- **BOOK-19-GRAPH** — 19.1.3, Graphs; trang in [487]; PDF [503].
  Describe vertices/edges, directed/undirected graphs, weighted edges, paths and cycles using real networks.
  Giới hạn: Conceptual support only; syllabus no-graph-code boundary remains. Does not authorize graph algorithms as core Paper4 practice. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### graphs/structure-choice — Khi quan hệ dữ liệu có dạng đồ thị

Quan hệ: `direct_concept`. Network examples support explaining when relationships are naturally graphs; no graph algorithm implementation is added.

Mục tiêu: SYL-19.1-19

- **BOOK-19-GRAPH** — 19.1.3, Graphs; trang in [487]; PDF [503].
  Describe vertices/edges, directed/undirected graphs, weighted edges, paths and cycles using real networks.
  Giới hạn: Conceptual support only; syllabus no-graph-code boundary remains. Does not authorize graph algorithms as core Paper4 practice. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### exam-workflow/compose-main — Ghép hàm đã có và giữ quan hệ phụ thuộc

Quan hệ: `direct_foundation`. Routine decomposition and interfaces support combining existing work in the required order.

Mục tiêu: SYL-20.1-05

- **BOOK-09-DECOMPOSE** — 9.1.1-9.1.2, Using abstraction; Using decomposition; trang in [218, 219]; PDF [234, 235].
  Separate a problem into subproblems and retain relevant data and operations.
  Giới hạn: Does not specify the call sequence or global state of any corpus question. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-SUBROUTINES** — 11.3.1-11.3.2, Procedures; Functions; trang in [275, 276, 277, 278, 279, 280]; PDF [291, 292, 293, 294, 295, 296].
  Declare/call procedures and functions, pass parameters and return values; reason about local/global data.
  Giới hạn: Python argument passing must not be taught as literal BYREF syntax; exact signatures/return sentinels follow QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### exam-workflow/format-output — Định dạng kết quả, bảng và giá trị trả về

Quan hệ: `component_foundation`. Concatenation, iteration and console output support layout; exact required wording and physical/logical order come from QP.

Mục tiêu: SYL-20.1-06, SYL-11.1-03, SYL-11.1-04

- **BOOK-11-STRINGS** — 11.1.1, String manipulation; Example11.2; Table11.6; trang in [269, 270, 271]; PDF [285, 286, 287].
  Measure string length, inspect/slice characters and combine comparisons; distinguish case-sensitive data.
  Giới hạn: No complete lexical comparator, manual delimiter splitter or typed-field routing algorithm. Do not claim built-in split or sorting is permitted for a particular QP. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-10-ARRAYS** — 10.2.1-10.2.2, 1D arrays; 2D arrays; trang in [241, 242, 243]; PDF [257, 258, 259].
  Choose dimensions and bounds; initialise and access indexed elements; use a nested loop for a table and traverse contents for output.
  Giới hạn: Finite capacity, live length, safe 2D initialisation, append-full policy and random-number API are not specified here; obtain exact contracts from QP/MS. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
- **BOOK-11-BASICS** — 11.1.1, Constants and variables; Example 11.1; trang in [265, 266, 267, 268, 269]; PDF [281, 282, 283, 284, 285].
  Use variables, assignment, arithmetic, input conversion, conditions and labelled output in a console program.
  Giới hạn: No exam-specific formatting, rounding, clamping, capacity or update rule is supplied; example code requires Stage5 validation. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### exam-workflow/evidence-document — Tên file, code, output và bằng chứng theo ý đề

Quan hệ: `component_foundation`. Tests and recording outcomes are a foundation only; the syllabus and each QP govern the evidence document.

Mục tiêu: P4-ADM-01, P4-ADM-04, P4-ADM-05, P4-ADM-06, P4-ADM-07, P4-ADM-09, P4-ADM-10, P4-ADM-11, P4-ADM-12, P4-ADM-13

- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.
### exam-workflow/source-and-rubric — Phân biệt nguồn chính thức và hướng dẫn học

Quan hệ: `component_foundation`. Testing offers a verification foundation; source authority and marking interpretation are AlgoCore editorial practices anchored to QP/MS.

Mục tiêu: P4-ADM-02, P4-ADM-03, P4-ADM-14

- **BOOK-12-TESTING** — 12.3.1-12.3.3, Ways of avoiding and exposing faults in programs; Location, identification and correction of errors; Program testing; trang in [294, 295, 296, 297, 298, 299]; PDF [310, 311, 312, 313, 314, 315].
  Identify syntax, logic and runtime errors; dry-run with a trace table; choose normal, abnormal and boundary data; compare expected and actual outcomes.
  Giới hạn: Paper4 evidence document placement, required screenshot contents, exact runs and submission names come from QP/MS, not this section. Maintenance subsection 12.3.4 begins later on printed 299 and is not the basis of this link. Knowledge locator only; no code execution, solution validation or syllabus-completion claim is made.

## 19 khoảng trống cần tổng hợp thêm

- **RANDOM_ARRAY**: Arrays and libraries are documented, but no random-number generator API or bounds convention was located by whole-book keyword search and relevant chapter review. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **STRING_COMPARE**: Character operations are documented; a manual lexicographic comparator and prefix rules must be derived from QP/MS. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **STRING_SPLIT**: String length/characters are documented; manual token extraction and final token handling are not given as a complete technique. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **STRING_ROUTE**: String primitives and selection are documented; parsing typed fields and routing to six colour arrays is a corpus-specific composition. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **RUN_LENGTH_ENCODE**: The compression concept is explicit atprinted22-24; queue consumption, final-run flush and exact output representation are corpus-specific. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **HASH_SETUP**: Hashing/collisions and arrays are explicit; the100x10bucket and main/Spare-array representations are exam variants. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **HASH_INSERT**: Hash and collision concepts are explicit; exact overflow-array/bucket-full policy is not the book algorithm. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **HASH_SEARCH**: Collision checking is conceptual; exact bucket/Spare probing termination and return sentinel need QP/MS. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **TREE_TRAVERSE**: Traversal appears as extension activities(481,521), not a complete textbook algorithm for all three orders. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **STACK_PAIR**: Push/pop are explicit; two-stack transactional pairing and restoring an unmatched item are QP-derived. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **STACK_REDUCE**: Stack operations and accumulation are separate sources; operand order and evaluation protocol are QP-derived. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **QUEUE_REDUCE**: Queue operations and accumulation are separate sources; consumption order, sentinel and recursive aggregate are QP-derived. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **QUEUE_INSPECT**: FIFO and pointers are explicit; a non-destructive live-queue view excluding stale slots is a QP-specific composition. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **GROUP_AGGREGATE**: Accumulator and record/array foundations exist; find-or-add by group key is a QP-specific composition. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **FILTER_RECORDS**: Arrays, predicates and strings are foundations; the complete multi-condition object filter comes from QP/MS. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **UNIQUE_SELECTION**: Validation/selection/array state are foundations; used-position or consumed-answer handling is QP-specific. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **EVIDENCE_RUN**: Testing knowledge is explicit; screenshot content, evidence file and prescribed test runs are QP/MS authorities. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **OOP_CAPACITY_ADD**: Containment diagram and arrays are explicit; success/failure result and bounded insertion invariant are QP-specific. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
- **ORDERED_INSERT**: Inner insertion operation is supported by insertion sort; fixed-capacity top-N list and multi-field shifts remain QP-derived. Use cited foundations plus source QP/MS; mark AlgoCore synthesis explicitly in Stage4, validate code in Stage5.
